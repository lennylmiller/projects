# WEB-4723: Current Conversation Close Flow

This document contains sequence diagrams showing how conversation closing currently works (before WEB-4723 changes).

---

## 1. Close Conversation Flow

Shows the current flow when a user closes a conversation via the UI.

```plantuml
@startuml current-close-conversation-flow
title Current Conversation Close Flow (Before WEB-4723)

skinparam backgroundColor #FEFEFE
skinparam sequenceMessageAlign center
skinparam noteBackgroundColor #FFFFCC
skinparam noteBorderColor #999999

actor User
participant "Chat Card UI\n(bannoweb-conversations-chat-card.js)" as ChatCard
participant "Chat Card Header\n(bannoweb-conversations-chat-card-header.js)" as Header
participant "Conversations Controller\n(conversations-controller.js)" as Controller
participant "Messages Collection" as Messages
participant "Backend API" as API
database "Conversations DB" as DB

== User Initiates Close ==

User -> ChatCard : Views active conversation
note right of ChatCard
  **Current State:**
  - Compose area is visible
  - User can send messages
  - Conversation is in messages list
end note

User -> Header : Clicks info button (circle with i)
Header -> Header : Opens "Conversation details" modal

User -> Header : Clicks "Close conversation"
Header -> Header : Shows confirmation dialog
note right of Header
  **Dialog Text:**
  "This conversation will be removed 
  from your messages list. You'll still 
  receive any new replies."
end note

User -> Header : Clicks "Yes, close"

== Archive API Call ==

Header -> Controller : archiveConversation(conversationId)
note right of Controller
  **conversations-controller.js line 68-92**
  Method: archiveConversation()
end note

Controller -> API : POST /a/conversations/api/consumer/v2/archive/{conversationId}
note right of API
  **Archive Endpoint Behavior:**
  Archives conversation "with respect 
  to a particular consumer" - per the 
  API documentation
end note

API -> DB : Mark conversation as archived\nfor this consumer
DB --> API : Success

API --> Controller : 204 No Content
note right of API
  **Response:**
  No body, just 204 status
  No status field returned
end note

== Frontend State Update ==

Controller -> Controller : Dispatch ARCHIVE_SUCCESS event
note right of Controller
  **Event Type:**
  ConversationsController.EventType.ARCHIVE_SUCCESS
end note

Controller -> Messages : remove(conversation)
note right of Messages #FFCCCC
  **CRITICAL: Conversation is REMOVED**
  this.messages_.remove(conversation)
  
  The conversation object is deleted
  from the client-side collection.
  It will NOT appear in the list.
end note

Messages --> Controller : Removed

Controller --> Header : Promise resolved

== UI Updates ==

Header -> ChatCard : Close modal, navigate away
ChatCard -> User : Redirect to /messages
note right of User
  **User Experience:**
  - Conversation disappears from inbox
  - Unread count may decrease
  - No confirmation toast shown
  - No way to see closed conversation
end note

== Direct URL Access Attempt ==

User -> ChatCard : Navigate to /messages/{conversationId}\n(direct URL to closed conversation)
note right of ChatCard #FFCCCC
  **PROBLEM: Silent Failure**
  
  The conversation is not in the
  messages collection, so the UI
  cannot find it to display.
  
  User sees the inbox instead of
  the conversation - no error shown.
end note

ChatCard -> User : Shows messages inbox\n(not the conversation)

@enduml
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

```plantuml
@startuml current-load-conversations-flow
title Current Conversations Load Flow - Archived Excluded

skinparam backgroundColor #FEFEFE
skinparam sequenceMessageAlign center
skinparam noteBackgroundColor #FFFFCC
skinparam noteBorderColor #999999

actor User
participant "Layout Component\n(bannoweb-layout.js)" as Layout
participant "Conversations Controller\n(conversations-controller.js)" as Controller
participant "Messages Collection" as Messages
participant "Backend API" as API
database "Conversations DB" as DB

== Page Load / Refresh ==

User -> Layout : Navigate to /messages\nor refresh page

Layout -> Controller : loadConversations()
note right of Controller
  **conversations-controller.js line 259**
  Method: loadConversations()
end note

Controller -> API : GET /a/conversations/api/consumer/v2/conversations

API -> DB : Query conversations\nfor this consumer
note right of DB
  **Database Query:**
  Returns only NON-ARCHIVED
  conversations for this user.
  
  Archived conversations are
  filtered out at the DB level.
end note

DB --> API : conversationOverviews[]

API --> Controller : 200 OK
note right of API
  **Response Schema:**
  {
    "conversationOverviews": [
      {
        "conversationId": "uuid",
        "participants": [...],
        "mostRecentElement": {...},
        "unreadMessageCount": 0,
        "institutionIncluded": true,
        "startedBy": {...}
      }
    ]
  }
  
  **NOTE: No "status" or "closed" field**
  **NOTE: Archived conversations NOT included**
end note

== Process Response ==

Controller -> Controller : Parse each conversationOverview
note right of Controller
  **For each conversation:**
  1. Create Conversation model
  2. Parse participants
  3. Parse mostRecentElement
  4. Add to messages collection
end note

loop For each conversationOverview
  Controller -> Messages : updateOrAdd(conversation)
end loop

Messages --> Controller : Collection updated

Controller -> Layout : endpointLoaded(true)

== Display Conversations ==

Layout -> User : Render messages list
note right of User
  **User sees:**
  - Only active conversations
  - No closed/archived conversations
  - No way to access closed history
  
  **If user previously closed a conversation:**
  - It's completely gone from their view
  - Cannot access via UI
  - Cannot access via direct URL
end note

== The Problem ==

note over User, DB #FFCCCC
  **WEB-4723 Issue:**
  
  1. Archived conversations are EXCLUDED from API response
  2. No "status" field exists in the schema
  3. Frontend has no way to know about closed conversations
  4. User cannot view closed conversation history
  
  **Desired Behavior (Glacier):**
  - Closed conversations should remain in the list
  - They should be visually marked as closed
  - User should see message history (read-only)
  - Compose area should be hidden
end note

@enduml
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
Install the "Markdown Preview Enhanced" or "PlantUML" extension to render embedded PlantUML in markdown previews.

### GitHub/GitLab
These platforms don't natively render PlantUML in markdown. You may need to use a CI/CD step or external service.

### PlantUML Server
Copy the content between `@startuml` and `@enduml` to https://www.plantuml.com/plantuml/uml/

---

*Last Updated: February 4, 2026*
