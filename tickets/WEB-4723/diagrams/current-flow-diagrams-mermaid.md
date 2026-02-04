# WEB-4723: Current Conversation Close Flow

This document contains sequence diagrams showing how conversation closing currently works (before WEB-4723 changes).

---

## 1. Close Conversation Flow

Shows the current flow when a user closes a conversation via the UI.

```mermaid
sequenceDiagram
    title Current Conversation Close Flow (Before WEB-4723)
    
    actor User
    participant ChatCard as Chat Card UI<br/>(bannoweb-conversations-chat-card.js)
    participant Header as Chat Card Header<br/>(bannoweb-conversations-chat-card-header.js)
    participant Controller as Conversations Controller<br/>(conversations-controller.js)
    participant Messages as Messages Collection
    participant API as Backend API
    participant DB as Conversations DB

    rect rgb(240, 248, 255)
        Note over User,DB: User Initiates Close
    end

    User->>ChatCard: Views active conversation
    Note right of ChatCard: Current State:<br/>- Compose area is visible<br/>- User can send messages<br/>- Conversation is in messages list

    User->>Header: Clicks info button (circle with i)
    Header->>Header: Opens "Conversation details" modal

    User->>Header: Clicks "Close conversation"
    Header->>Header: Shows confirmation dialog
    Note right of Header: Dialog Text:<br/>"This conversation will be removed<br/>from your messages list. You'll still<br/>receive any new replies."

    User->>Header: Clicks "Yes, close"

    rect rgb(240, 248, 255)
        Note over User,DB: Archive API Call
    end

    Header->>Controller: archiveConversation(conversationId)
    Note right of Controller: conversations-controller.js line 68-92<br/>Method: archiveConversation()

    Controller->>API: POST /a/conversations/api/consumer/v2/archive/{conversationId}
    Note right of API: Archive Endpoint Behavior:<br/>Archives conversation "with respect<br/>to a particular consumer" - per the<br/>API documentation

    API->>DB: Mark conversation as archived<br/>for this consumer
    DB-->>API: Success

    API-->>Controller: 204 No Content
    Note right of API: Response:<br/>No body, just 204 status<br/>No status field returned

    rect rgb(240, 248, 255)
        Note over User,DB: Frontend State Update
    end

    Controller->>Controller: Dispatch ARCHIVE_SUCCESS event
    Note right of Controller: Event Type:<br/>ConversationsController.EventType.ARCHIVE_SUCCESS

    Controller->>Messages: remove(conversation)
    Note right of Messages: ⚠️ CRITICAL: Conversation is REMOVED<br/>this.messages_.remove(conversation)<br/><br/>The conversation object is deleted<br/>from the client-side collection.<br/>It will NOT appear in the list.

    Messages-->>Controller: Removed

    Controller-->>Header: Promise resolved

    rect rgb(240, 248, 255)
        Note over User,DB: UI Updates
    end

    Header->>ChatCard: Close modal, navigate away
    ChatCard->>User: Redirect to /messages
    Note right of User: User Experience:<br/>- Conversation disappears from inbox<br/>- Unread count may decrease<br/>- No confirmation toast shown<br/>- No way to see closed conversation

    rect rgb(255, 230, 230)
        Note over User,DB: Direct URL Access Attempt
    end

    User->>ChatCard: Navigate to /messages/{conversationId}<br/>(direct URL to closed conversation)
    Note right of ChatCard: ⚠️ PROBLEM: Silent Failure<br/><br/>The conversation is not in the<br/>messages collection, so the UI<br/>cannot find it to display.<br/><br/>User sees the inbox instead of<br/>the conversation - no error shown.

    ChatCard->>User: Shows messages inbox<br/>(not the conversation)
```

### Key Observations

| Step | What Happens | Problem |
|------|--------------|---------|
| Archive API Call | `POST /archive/{conversationId}` returns 204 No Content | No status field returned |
| Frontend Update | `this.messages_.remove(conversation)` | Conversation completely removed from collection |
| UI Result | Conversation disappears from list | User loses access to conversation history |
| Direct URL | Shows inbox instead of conversation | Silent failure, no error message |

---

## 2. Load Conversations Flow

Shows how conversations are loaded from the API on page load/refresh.

```mermaid
sequenceDiagram
    title Current Conversations Load Flow - Archived Excluded
    
    actor User
    participant Layout as Layout Component<br/>(bannoweb-layout.js)
    participant Controller as Conversations Controller<br/>(conversations-controller.js)
    participant Messages as Messages Collection
    participant API as Backend API
    participant DB as Conversations DB

    rect rgb(240, 248, 255)
        Note over User,DB: Page Load / Refresh
    end

    User->>Layout: Navigate to /messages<br/>or refresh page

    Layout->>Controller: loadConversations()
    Note right of Controller: conversations-controller.js line 259<br/>Method: loadConversations()

    Controller->>API: GET /a/conversations/api/consumer/v2/conversations

    API->>DB: Query conversations<br/>for this consumer
    Note right of DB: Database Query:<br/>Returns only NON-ARCHIVED<br/>conversations for this user.<br/><br/>Archived conversations are<br/>filtered out at the DB level.

    DB-->>API: conversationOverviews[]

    API-->>Controller: 200 OK
    Note right of API: Response Schema:<br/>{<br/>  "conversationOverviews": [<br/>    {<br/>      "conversationId": "uuid",<br/>      "participants": [...],<br/>      "mostRecentElement": {...},<br/>      "unreadMessageCount": 0<br/>    }<br/>  ]<br/>}<br/><br/>NOTE: No "status" or "closed" field<br/>NOTE: Archived conversations NOT included

    rect rgb(240, 248, 255)
        Note over User,DB: Process Response
    end

    Controller->>Controller: Parse each conversationOverview
    Note right of Controller: For each conversation:<br/>1. Create Conversation model<br/>2. Parse participants<br/>3. Parse mostRecentElement<br/>4. Add to messages collection

    loop For each conversationOverview
        Controller->>Messages: updateOrAdd(conversation)
    end

    Messages-->>Controller: Collection updated

    Controller->>Layout: endpointLoaded(true)

    rect rgb(240, 248, 255)
        Note over User,DB: Display Conversations
    end

    Layout->>User: Render messages list
    Note right of User: User sees:<br/>- Only active conversations<br/>- No closed/archived conversations<br/>- No way to access closed history<br/><br/>If user previously closed a conversation:<br/>- It's completely gone from their view<br/>- Cannot access via UI<br/>- Cannot access via direct URL

    rect rgb(255, 200, 200)
        Note over User,DB: ⚠️ WEB-4723 Issue:<br/>1. Archived conversations EXCLUDED from API<br/>2. No "status" field exists in schema<br/>3. Frontend has no way to know about closed conversations<br/>4. User cannot view closed conversation history
    end
```

### Key Observations

| Aspect | Current Behavior | Desired Behavior (Glacier) |
|--------|------------------|---------------------------|
| API Response | Archived conversations excluded | Include archived with status field |
| Schema | No `status` or `closed` field | Add `status: "closed"` or similar |
| List Display | Only active conversations shown | Show closed conversations in list |
| Conversation View | N/A (can't access closed) | Show history, hide compose area |

---

## Summary of Problems

### Problem 1: Conversation Removal
The `archiveConversation()` method in `conversations-controller.js` (line 84) calls:
```javascript
this.messages_.remove(conversation);
```
This completely removes the conversation from the client-side collection.

### Problem 2: No Status Field
The API response schema (`ConversationOverview`) does not include a `status` or `closed` field. The frontend has no way to know if a conversation was previously closed.

### Problem 3: Archived Excluded
The `GET /conversations` endpoint excludes archived conversations from the response. There's no query parameter to include them.

### Problem 4: Silent Failure
When navigating to a closed conversation via direct URL, the UI silently shows the inbox instead of an error message or the conversation history.

---

## Rendering These Diagrams

### VS Code
Install "Markdown Preview Mermaid Support" extension to render Mermaid in markdown previews.

### GitHub/GitLab
Both platforms natively render Mermaid diagrams in markdown files.

### Mermaid Live Editor
Copy the content between ` ```mermaid ` and ` ``` ` to https://mermaid.live/

---

*Last Updated: February 4, 2026*
