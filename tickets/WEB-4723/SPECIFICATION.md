# WEB-4723: Closed Conversation Enhancement Specification

## Overview

This specification defines the implementation requirements for enhancing the closed conversation experience in Banno Online. When a conversation is closed, it should remain visible in the messages list and display a friendly closure message instead of the compose area.

---

## 1. Problem Statement

### Current Behavior
When a user closes a conversation:
1. The conversation is removed from the messages list entirely
2. If the user navigates to the closed conversation via direct URL, it redirects to the inbox
3. There is no indication that the conversation was closed
4. The user cannot view the conversation history after closing

### Desired Behavior
When a user closes a conversation:
1. The conversation remains visible in the messages list
2. The conversation history is fully accessible (read-only)
3. The compose area is hidden
4. A friendly message is displayed indicating the chat has ended
5. A link to start a new conversation is provided

---

## 2. User Experience

### 2.1 Closed Conversation View

When viewing a closed conversation, the user should see:

- **Message History**: All previous messages remain visible and scrollable
- **Hidden Compose Area**: The text input, attachment buttons, emoji picker, and send button are not displayed
- **Closure Message**: Centered text stating:
  > "Thanks for chatting with us! This chat has ended. If you need anything else, we're always here."
- **Action Link**: A "Start a new conversation" link that navigates to `/messages`

### 2.2 Visual Design

The closure message section should:
- Appear at the bottom of the conversation where the compose area would normally be
- Have a subtle background color to distinguish it from the message area
- Use centered text alignment
- Style the action link with the primary brand color

---

## 3. Technical Specification

### 3.1 Data Model Changes

**File:** `src/js/api/models/conversation.js`

Add a `closed` boolean property to the `Conversation` model:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `closed` | `boolean` | `false` | Indicates whether the conversation has been closed |

#### Implementation Details

1. **Defaults Object**: Add `'closed': false` to the constructor defaults
2. **Serialization**: Include `closed` in the `serialize()` method
3. **Deserialization**: Include `closed` in the `deserialize()` method
4. **Property Map**: Add `closed: 'closed'` to `conversationOverviewPropertyMap`
5. **Getter/Setter**: Implement standard getter and setter following existing patterns

```javascript
/** @return {boolean} */
get closed() {
  return this.get('closed');
}

/** @param {boolean} newValue */
set closed(newValue) {
  const cacheKey = 'closed';
  this.set(cacheKey, conversationOverviewPropertyMap[cacheKey], newValue);
}
```

### 3.2 Controller Changes

**File:** `src/js/api/controllers/conversations-controller.js`

Modify the `archiveConversation()` method to mark conversations as closed instead of removing them from the collection.

#### Current Implementation
```javascript
.then(() => {
  this.dispatchEvent(new ControllerEvent(ConversationsController.EventType.ARCHIVE_SUCCESS));
  this.messages_.remove(/** @type {!Conversation} */ (conversation));
  resolve();
})
```

#### New Implementation
```javascript
.then(() => {
  this.dispatchEvent(new ControllerEvent(ConversationsController.EventType.ARCHIVE_SUCCESS));
  // Mark as closed instead of removing from list
  conversation.closed = true;
  resolve();
})
```

### 3.3 UI Component Changes

**File:** `src/components/bannoweb/conversations/bannoweb-conversations-chat-card.js`

#### 3.3.1 Add `isClosed` Getter

Add a getter property to determine if the current conversation is closed:

```javascript
/**
 * @returns {boolean} Whether the conversation is closed
 */
get isClosed() {
  return this.conversation?.closed === true;
}
```

#### 3.3.2 Modify Compose Area Visibility

Update the conditional rendering of the compose area to check for closed state:

**Before:**
```javascript
${this.isActiveOrStarting(this.conversation, this.startingOrg)
  ? html`<div class="chat-compose-container">...</div>`
  : ''}
```

**After:**
```javascript
${this.isActiveOrStarting(this.conversation, this.startingOrg) && !this.isClosed
  ? html`<div class="chat-compose-container">...</div>`
  : ''}
```

#### 3.3.3 Add Closed Conversation Message Template

Add the closure message immediately after the compose area conditional:

```javascript
${this.isClosed
  ? html`
      <div class="closed-conversation-message">
        <p>Thanks for chatting with us! This chat has ended. If you need anything else, we're always here.</p>
        <a href="/messages" @click=${this._handleStartNewConversation}>
          Start a new conversation
        </a>
      </div>
    `
  : ''}
```

#### 3.3.4 Add Event Handler

Implement the click handler for the "Start a new conversation" link:

```javascript
/**
 * Handles clicking the "Start a new conversation" link in closed conversations
 * @param {Event} evt
 */
_handleStartNewConversation(evt) {
  evt.preventDefault();
  // Navigate to messages to start a new conversation
  window.location.href = '/messages';
}
```

#### 3.3.5 Add CSS Styles

Add styles within the `static get styles()` method:

```css
.closed-conversation-message {
  padding: 24px var(--jha-card-article-padding-right) 24px var(--jha-card-article-margin-left);
  border-top: 1px solid var(--jha-border-color);
  background: var(--jha-background-color, #f5f5f5);
  border-radius: 0 0 var(--card-corner-radius) var(--card-corner-radius);
  text-align: center;
}

.closed-conversation-message p {
  margin: 0 0 12px 0;
  color: var(--jha-text-base);
}

.closed-conversation-message a {
  color: var(--jha-color-primary);
  text-decoration: none;
  font-weight: 500;
}

.closed-conversation-message a:hover {
  text-decoration: underline;
}
```

---

## 4. Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `src/js/api/models/conversation.js` | Modified | Added `closed` property with getter/setter |
| `src/js/api/controllers/conversations-controller.js` | Modified | Changed archive behavior to mark as closed |
| `src/components/bannoweb/conversations/bannoweb-conversations-chat-card.js` | Modified | Added closed state UI handling |

---

## 5. Testing Requirements

### 5.1 Manual Test Cases

#### TC-1: Close Conversation and Verify Visibility
1. Open an active conversation
2. Click the info button and select "Close conversation"
3. Confirm the close action
4. **Expected**: Conversation remains in the messages list

#### TC-2: View Closed Conversation
1. Click on a closed conversation from the messages list
2. **Expected**: 
   - Message history is visible
   - Compose area is hidden
   - Closure message is displayed
   - "Start a new conversation" link is visible

#### TC-3: Direct URL Navigation to Closed Conversation
1. Note the URL of an open conversation
2. Close the conversation
3. Navigate directly to the saved URL
4. **Expected**: Conversation loads with closure message (no redirect)

#### TC-4: Start New Conversation Link
1. View a closed conversation
2. Click "Start a new conversation" link
3. **Expected**: User is navigated to `/messages`

### 5.2 Edge Cases

- Closing a conversation while typing a draft message
- Closing a conversation with pending file uploads
- Receiving a new message on a closed conversation
- Rapid close/reopen actions

---

## 6. Acceptance Criteria

- [ ] Closed conversations remain in the messages list
- [ ] Compose area is hidden when conversation is closed
- [ ] Closure message displays: "Thanks for chatting with us! This chat has ended. If you need anything else, we're always here."
- [ ] "Start a new conversation" link navigates to `/messages`
- [ ] Message history remains visible and scrollable
- [ ] Direct URL access to closed conversation works correctly
- [ ] No regressions in active conversation functionality

---

## 7. Future Considerations

The following items are out of scope for this implementation but may be considered in future iterations:

- Visual indicator for closed conversations in the messages list (badge, icon, or dimmed styling)
- Ability to reopen closed conversations
- Filtering closed vs active conversations
- Handling of CaseDetails WebSocket events for real-time status updates

---

## 8. References

- **Figma Design**: [Glacier Alignment - Delivery Plan](https://www.figma.com/deck/sIetcCDoFyNvhgzqDW8T8Z/Glacier-Alignment---Delivery-Plan) (Slide 15)
- **Jira Ticket**: WEB-4723
- **Slack Channel**: #glacier-working-group

---

## Addendum A: Backend API Assumptions and Open Questions

### Current Implementation Approach

The frontend implementation as specified assumes the **existing backend API works as-is** with no modifications. Specifically:

1. The existing `POST /a/conversations/api/consumer/v2/archive/{conversationId}` endpoint is called (unchanged)
2. The `closed` state is tracked **client-side only** in the Conversation model after the API call succeeds

### Limitation: State Persistence

The `closed` property is **not persisted to the backend**. This means the closed state will be lost if the user:

- Refreshes the page
- Logs out and back in
- Opens the application in another browser tab
- Clears browser storage

After any of these actions, the conversation will either:
- **Disappear entirely** — if the backend's `GET /conversations` endpoint excludes archived conversations from the response
- **Reappear as active** — if the backend returns the conversation but without a closed/status indicator

### Backend Requirements for Full Support

For this feature to work correctly with persistence, the backend API would need to support one of the following:

#### Option 1: Return Closed Conversations with Status Field

The `GET /a/conversations/api/consumer/v2/conversations` endpoint should:

1. **Include closed/archived conversations** in the response (not filter them out)
2. **Add a status field** to the conversation overview:

```json
{
  "conversationOverviews": [
    {
      "conversationId": "uuid-string",
      "participants": [...],
      "mostRecentElement": {...},
      "status": "closed",  // NEW FIELD
      ...
    }
  ]
}
```

The frontend would then read this `status` field when loading conversations and set `conversation.closed = true` accordingly.

#### Option 2: Separate Endpoint for Closed Conversations

Alternatively, provide a separate endpoint:

```
GET /a/conversations/api/consumer/v2/conversations/closed
```

The frontend would merge results from both endpoints to build the complete messages list.

#### Option 3: Use CaseDetails Event

Per the Slack discussion with River Ginther, the Enterprise client uses `CaseDetails` events to determine closed status:

> "A conversation will be closed if its most recent status change is Closed - based on the details of the conversation history. CaseDetails event specifically."

If this event is already being sent via WebSocket, the frontend could:
1. Listen for `CaseDetails` events with `status: "Closed"`
2. Update the conversation model accordingly
3. Persist the state without additional API changes

### Open Questions for Backend Team

1. **Does the `/archive` endpoint already support a "closed but visible" state?**
   - Or does archiving permanently hide the conversation from the list?

2. **Does the `GET /conversations` response include a `status` or `closed` field?**
   - If so, what are the possible values?

3. **Are `CaseDetails` WebSocket events currently being sent to the consumer client?**
   - What is the exact event structure?
   - What triggers these events?

4. **Should we use the archive endpoint or a new "close" endpoint?**
   - Are "archive" and "close" semantically different operations?

5. **What happens when the FI agent closes a conversation from the Enterprise side?**
   - Does the consumer client receive a notification?
   - How should we detect this state?

### Recommended Next Steps

1. **Clarify with backend team** whether existing APIs support this use case
2. **Review Enterprise client implementation** for reference (per River Ginther's suggestion)
3. **Determine API contract** before proceeding with full implementation
4. **Update this specification** once backend support is confirmed

### Impact Assessment

| Scenario | Current Implementation | With Backend Support |
|----------|----------------------|---------------------|
| Close conversation | Works (client-side only) | Works (persisted) |
| Page refresh | State lost | State preserved |
| New browser tab | State lost | State preserved |
| FI agent closes | Not detected | Detected via event |
| Direct URL access | Works (within session) | Works (always) |

---

*Document Version: 1.1*
*Last Updated: February 4, 2026*
