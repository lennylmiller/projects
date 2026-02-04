# Requirements: WEB-4723 - Glacier Closed Conversation Handling

## 1. Overview

This document specifies the requirements for implementing Glacier-aligned closed conversation handling in the Banno Online Admin client. The work is part of Milestone 1 of the Glacier project, which focuses on properly handling conversations that have been closed by FI agents.

**Ticket:** WEB-4723
**Project:** Glacier Alignment - Admin Client
**Milestone:** 1 (Closed Conversation Handling)
**Priority:** High
**Figma Designs:** https://www.figma.com/deck/sIetcCDoFyNvhgzqDW8T8Z/Glacier-Alignment---Delivery-Plan (Slide 17)

## 2. Business Requirements

### 2.1 User Story

**As a** financial institution admin user
**When** a conversation is closed by either party (FI agent or consumer)
**I should** see a clear indication that the conversation is closed
**And** I should not be able to send new messages through the compose area
**But** I should still be able to view the conversation history
**And** I should be able to reopen the conversation if needed (Admin side only)

### 2.2 Current vs Desired Behavior

#### Reference Screenshot
See ORIGINAL-WORKFLOW.md Step 11 - this demonstrates the current behavior when accessing a closed conversation via direct URL.

#### Current Behavior (❌ Does Not Align with Glacier)

**When a conversation is closed:**
1. Admin client uses "archive" approach to remove conversation from inbox
2. Conversation completely disappears from visible inbox
3. No explicit closed/terminated status tracking
4. No distinction between archived and closed conversations

**When accessing closed conversation via direct URL:**
1. Page shows messages inbox instead of the conversation
2. Conversation history is not accessible
3. No error message or closed state indicator shown
4. Silent failure - URL shows conversation ID but content shows inbox
5. User has no indication they tried to access a closed conversation

**Implementation Gaps:**
- No conversation status property in data model
- No CaseDetails event handling in client
- No UI indicators for closed conversations
- No way to view closed conversation history
- No way to reopen closed conversations

#### Desired Behavior (✅ Glacier Milestone 1)

**When a conversation is closed:**
1. Conversation receives CaseDetails event with status="Closed"
2. Conversation remains visible in inbox (not removed)
3. Conversation is marked as closed with visual indicator (icon/badge)
4. Conversation status is tracked in data model

**When viewing a closed conversation:**
1. All message history remains visible (read-only)
2. **Compose area is completely HIDDEN**
3. Closed conversation message is displayed:
   - "This conversation is closed. You'll still receive any new replies."
4. **"Reopen Conversation" button is shown (Admin side only)**
5. User can still scroll through message history

**When accessing closed conversation via direct URL:**
1. Conversation loads normally with all messages visible
2. Compose area is hidden (same as above)
3. Closed message and reopen button are displayed
4. URL remains at the conversation ID (no redirect)

**When reopening a conversation:**
1. Admin clicks "Reopen Conversation" button
2. API call updates conversation status to active/open
3. Compose area reappears
4. Closed message disappears
5. User can send messages again

### 2.3 Acceptance Criteria

- [ ] Closed conversations remain accessible via inbox and direct URL
- [ ] Compose area is hidden when conversation status is "Closed"
- [ ] Closed conversation message is displayed with exact wording
- [ ] Reopen button is visible on Admin side for closed conversations
- [ ] Clicking reopen button restores compose area functionality
- [ ] Conversation history remains fully visible when closed
- [ ] Closed conversations have visual indicator in inbox
- [ ] No silent failures or unexpected redirects
- [ ] Align with Enterprise client implementation

## 3. Technical Requirements

### 3.1 Data Model Changes

**File:** `/src/js/api/models/conversation.js`

**Required Changes:**
- Add `status` or `caseStatus` property to Conversation model
- Property should track conversation state: "Active", "Closed", etc.
- Default value should be "Active" or equivalent for new conversations
- Property should be updated when CaseDetails event is received
- Differentiate between:
  - **Archived:** User-initiated removal from inbox (existing behavior)
  - **Closed:** FI agent or system closed the conversation (new behavior)

**Implementation Notes:**
- Check if Conversation model already has status tracking
- May need to add getter methods: `isClosed()`, `isActive()`
- Ensure status persists across page refreshes
- Status should be included in conversation serialization/deserialization

### 3.2 Event Handling

#### 3.2.1 Add CaseDetails Event Type

**File:** `/src/js/util/conversations.js`

**Required Changes:**
- Add `CASE_DETAILS` to `PUSH_TYPES` enum (if not already present)
- Implement `parseCaseDetailsEvent(data)` function to parse incoming events
- Return structured object with conversation ID, status, timestamp, etc.

**Example Structure:**
```javascript
// In PUSH_TYPES enum
CASE_DETAILS: 'CASE_DETAILS',

// Parser function
function parseCaseDetailsEvent(data) {
  return {
    conversationId: data.conversationId || data.id,
    status: data.status, // "Closed", "Active", etc.
    timestamp: data.timestamp,
    closedBy: data.closedBy, // Optional: who closed it
    reason: data.reason, // Optional: why it was closed
    ...
  };
}
```

#### 3.2.2 Update Event Router

**File:** `/src/js/util/conversations.js`

**Required Changes:**
- Update `parseConversationEvent()` switch statement
- Add case for `CASE_DETAILS` event type
- Call `parseCaseDetailsEvent()` when matched

**Example:**
```javascript
function parseConversationEvent(event) {
  switch (event.type) {
    case PUSH_TYPES.MESSAGE:
      return parseMessageEvent(event.data);
    case PUSH_TYPES.CASE_DETAILS:
      return parseCaseDetailsEvent(event.data);
    // ... other cases
  }
}
```

#### 3.2.3 Handle Status Changes in Controller

**File:** `/src/js/controllers/conversations-controller.js`

**Required Changes:**
- Update `messageReceived_()` method to handle CaseDetails events
- When CaseDetails event received:
  1. Find conversation by ID
  2. Update conversation status property
  3. Dispatch new event type (e.g., `CONVERSATION_STATUS_CHANGED`)
  4. Trigger UI re-render

**Example Logic:**
```javascript
messageReceived_(event) {
  const parsed = parseConversationEvent(event);

  if (parsed.type === 'CASE_DETAILS') {
    const conversation = this.findConversation(parsed.conversationId);
    if (conversation) {
      conversation.status = parsed.status;
      this.dispatchEvent(
        new CustomEvent('conversation-status-changed', {
          detail: { conversationId: parsed.conversationId, status: parsed.status }
        })
      );
    }
  }
  // ... handle other event types
}
```

### 3.3 UI Changes

#### 3.3.1 Modify Compose Area Rendering

**File:** `/src/components/bannoweb/conversations/bannoweb-conversations-chat-card.js`

**Current Condition** (lines 1930-2094):
- Compose area is shown when `isActiveOrStarting()` returns true

**New Condition:**
- Compose area shown when: `isActiveOrStarting() && !isClosed()`

**Required Changes:**
1. Add `isClosed()` getter method:
```javascript
get isClosed() {
  return this.conversation?.status === 'Closed' ||
         this.conversation?.caseStatus === 'Closed';
}
```

2. Update compose area template condition:
```javascript
${this.isActiveOrStarting() && !this.isClosed() ? html`
  <!-- compose area template -->
` : ''}
```

3. Ensure compose area is hidden/shown dynamically when status changes

#### 3.3.2 Add Closed Conversation Message Component

**File:** `/src/components/bannoweb/conversations/bannoweb-conversations-chat-card.js`

**Requirements:**
- Create new component section for closed conversation state
- Position where compose area normally appears (at bottom of conversation)
- Show only when conversation is closed

**Component Structure:**
```html
<div class="closed-conversation-message">
  <div class="message-text">
    This conversation is closed. You'll still receive any new replies.
  </div>
  <button class="reopen-button" @click="${this.handleReopenConversation}">
    Reopen Conversation
  </button>
</div>
```

**Styling Requirements:**
- Clear visual distinction from regular messages
- Professional, non-alarming appearance
- Reopen button follows Banno design system
- Adequate padding and spacing
- Responsive layout

**Implementation:**
```javascript
${this.isClosed() ? html`
  <div class="closed-conversation-message">
    <div class="message-text">
      This conversation is closed. You'll still receive any new replies.
    </div>
    <button
      class="reopen-button"
      @click="${this.handleReopenConversation}"
      ?disabled="${this.isReopening}">
      ${this.isReopening ? 'Reopening...' : 'Reopen Conversation'}
    </button>
  </div>
` : ''}
```

#### 3.3.3 Visual Indicators in Conversation List

**File:** `/src/components/bannoweb/conversations/bannoweb-message-list.js`

**Requirements:**
- Add visual indicator for closed conversations in inbox
- Options: icon, badge, dimmed styling, or combination
- Should be immediately recognizable
- Follow existing design patterns in the application

**Possible Implementations:**
1. **Icon approach:** Add closed icon (e.g., locked padlock, X circle) next to conversation name
2. **Badge approach:** Add "Closed" badge similar to unread count badge
3. **Styling approach:** Dim/gray out closed conversations
4. **Combination:** Icon + dimmed styling

**Recommendation:** Icon + subtle background color change
- Less intrusive than badge
- Clear visual indicator
- Maintains conversation list readability

### 3.4 Reopen Functionality

#### 3.4.1 Controller Method

**File:** `/src/js/controllers/conversations-controller.js`

**Required Changes:**
- Add `reopenConversation(conversationId)` method
- Make API call to reopen endpoint
- Update conversation status on success
- Show error toast on failure
- Dispatch status changed event

**Implementation:**
```javascript
async reopenConversation(conversationId) {
  try {
    this.isReopening = true;
    const response = await this.api.post(
      `/a/conversations/api/consumer/v2/reopen/${conversationId}`
    );

    const conversation = this.findConversation(conversationId);
    if (conversation) {
      conversation.status = 'Active'; // or response.status
      this.dispatchEvent(
        new CustomEvent('conversation-status-changed', {
          detail: { conversationId, status: 'Active' }
        })
      );
    }

    return response;
  } catch (error) {
    console.error('Failed to reopen conversation:', error);
    this.showErrorToast('Failed to reopen conversation');
    throw error;
  } finally {
    this.isReopening = false;
  }
}
```

#### 3.4.2 UI Handler

**File:** `/src/components/bannoweb/conversations/bannoweb-conversations-chat-card.js`

**Required Changes:**
- Add `handleReopenConversation()` method
- Call controller's `reopenConversation()` method
- Show loading state during API call
- Handle success: compose area should reappear
- Handle error: show error message to user

**Implementation:**
```javascript
async handleReopenConversation(e) {
  e.preventDefault();

  if (!this.conversation?.id) {
    return;
  }

  try {
    await this.controller.reopenConversation(this.conversation.id);
    // UI will update via event listener when status changes
  } catch (error) {
    // Error already handled in controller
  }
}
```

### 3.5 Existing Patterns to Reuse

The following existing patterns should be used for consistency:

1. **Toast Messages:**
   - Pattern: Archive success toast in `bannoweb-conversations.js` (line 36)
   - Use for: Reopen success/failure notifications

2. **Conditional Rendering:**
   - Pattern: `isActiveOrStarting()` in chat-card
   - Use for: Compose area visibility logic

3. **WebSocket Event Parsing:**
   - Pattern: `parseConversationEvent()` switch in conversations.js
   - Use for: CaseDetails event handling

4. **Observable Pattern:**
   - Pattern: Controller event dispatching and component subscription
   - Use for: Status change notifications

5. **Button Disable Logic:**
   - Pattern: `disableSendButton` getter (lines 1316-1327)
   - Use for: Reopen button loading state

## 4. API Requirements

### 4.1 CaseDetails Event

**Event Type:** WebSocket push notification

**Expected Structure:**
```json
{
  "type": "CASE_DETAILS",
  "conversationId": "uuid-string",
  "caseId": "uuid-string",
  "status": "Closed",
  "timestamp": "2026-02-03T14:30:00Z",
  "closedBy": "agent-id",
  "reason": "Issue resolved"
}
```

**Questions for Backend Team:**
1. What is the exact event structure?
2. What field contains the conversation status?
3. What are the possible status values? ("Closed", "Active", "Terminated"?)
4. Is `closedBy` available to show who closed it?
5. Do we receive this event when consumer closes conversation too?

### 4.2 Reopen Endpoint

**Endpoint:** `POST /a/conversations/api/consumer/v2/reopen/{conversationId}`

**Request:**
- Method: POST
- Path parameter: conversationId (UUID)
- Body: Empty or minimal payload
- Headers: Standard authentication headers

**Response:**
```json
{
  "conversationId": "uuid-string",
  "status": "Active",
  "timestamp": "2026-02-03T14:35:00Z"
}
```

**Error Responses:**
- 404: Conversation not found
- 403: Not authorized to reopen
- 409: Conversation cannot be reopened (conflict)
- 500: Server error

**Questions for Backend Team:**
1. Does this endpoint exist, or does it need to be created?
2. What is the exact endpoint path?
3. Are there any restrictions on who can reopen?
4. Are there any restrictions on when a conversation can be reopened?
5. Does reopening send a notification to the consumer?

## 5. Testing Requirements

### 5.1 Manual Testing Scenarios

#### Scenario 1: Close and View Closed Conversation
1. Start local server: `yarn serve --fi=banno --debug`
2. Login as "husband"
3. Navigate to Messages
4. Open any active conversation
5. Click info button
6. Click "Close conversation"
7. Click "Yes, close"
8. **Expected:** Conversation remains in inbox with closed indicator
9. Click on closed conversation
10. **Expected:** Conversation opens, messages visible, compose area hidden
11. **Expected:** "This conversation is closed..." message shown
12. **Expected:** "Reopen Conversation" button visible

#### Scenario 2: Direct URL Access to Closed Conversation
1. Open active conversation, note URL (e.g., `/messages/{uuid}`)
2. Close the conversation
3. Manually navigate to saved URL
4. **Expected:** Conversation loads with messages visible
5. **Expected:** Compose area hidden
6. **Expected:** Closed message and reopen button shown
7. **Expected:** No redirect to inbox

#### Scenario 3: Reopen Conversation
1. Navigate to closed conversation
2. Click "Reopen Conversation" button
3. **Expected:** Button shows "Reopening..." loading state
4. **Expected:** After success, compose area reappears
5. **Expected:** Closed message disappears
6. **Expected:** Can type and send messages
7. **Expected:** Closed indicator removed from inbox

#### Scenario 4: Receive Message on Closed Conversation
1. Close a conversation
2. Have consumer send new message to closed conversation
3. **Expected:** Message appears in closed conversation
4. **Expected:** Conversation still marked as closed
5. **Expected:** Compose area still hidden
6. **Expected:** Admin can read new message but not reply without reopening

### 5.2 WebSocket Event Testing

#### Test Case 1: Receive CaseDetails Event
1. Mock CaseDetails event with status="Closed"
2. Send event via WebSocket
3. **Expected:** Conversation model updates status property
4. **Expected:** UI updates to hide compose area
5. **Expected:** Closed message appears
6. **Expected:** Reopen button appears

#### Test Case 2: Handle Malformed Event
1. Send CaseDetails event with missing required fields
2. **Expected:** Error logged but no crash
3. **Expected:** UI remains stable
4. **Expected:** User not affected

### 5.3 Edge Cases

#### Edge Case 1: Close While Typing
1. Open active conversation
2. Type draft message (don't send)
3. Close conversation
4. Reopen conversation
5. **Expected:** Draft text should be preserved or cleared (TBD with product)

#### Edge Case 2: Close With Pending Upload
1. Start file upload
2. While upload in progress, close conversation
3. **Expected:** Upload cancelled or completed (TBD)
4. **Expected:** No errors shown to user

#### Edge Case 3: Multiple Rapid Close/Reopen
1. Close conversation
2. Immediately reopen
3. Immediately close again
4. **Expected:** Each operation completes successfully
5. **Expected:** Final state is correct (closed)
6. **Expected:** No race conditions or inconsistent state

#### Edge Case 4: Network Interruption
1. Disconnect from network
2. Attempt to close conversation
3. **Expected:** Error message shown
4. **Expected:** Conversation remains open
5. Reconnect network
6. Retry close operation
7. **Expected:** Closes successfully

#### Edge Case 5: Reopen Permission Denied
1. Close conversation
2. Mock API to return 403 on reopen
3. Click "Reopen Conversation"
4. **Expected:** Error toast shown
5. **Expected:** Conversation remains closed
6. **Expected:** Button returns to normal state

### 5.4 Cross-Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### 5.5 Accessibility Testing
- Keyboard navigation to reopen button
- Screen reader announcement of closed state
- Focus management when compose area hidden/shown
- ARIA labels for closed conversation indicator

## 6. Out of Scope (Milestone 2)

The following features are **NOT** part of Milestone 1 and should not be implemented:

- FI agent availability status (away/available/busy)
- Agent status indicators in UI
- "Mark as away" functionality
- Agent profile/presence management
- Auto-response when agent is away

These will be addressed in Milestone 2 per the Glacier project plan.

## 7. Open Questions

### Product Questions
1. Should closed conversations stay in inbox or move to separate section?
2. What should happen to draft text when conversation is closed?
3. Can consumers also close conversations, or only FI agents?
4. Should we show who closed the conversation and when?
5. How should closed conversations be sorted in inbox? (same as active, or bottom?)
6. Should there be a filter to show/hide closed conversations?

### Technical Questions
1. What is the exact structure of the CaseDetails event? (see section 4.1)
2. What API endpoint is used for reopening conversations? (see section 4.2)
3. Does the Admin client already receive CaseDetails events?
4. Is there existing conversation status tracking we can reuse?
5. How does Enterprise client implement this? (can we reuse code?)
6. Are there any performance concerns with keeping closed conversations in inbox?

### Backend/API Questions
1. Does the reopen endpoint exist, or does it need to be created?
2. Are there any restrictions on who can reopen conversations?
3. Does reopening send a notification to the consumer?
4. What happens if both admin and consumer try to reopen simultaneously?
5. Is there a limit on how many times a conversation can be reopened?

## 8. Implementation Approach

### Phase 1: Research (1-2 days)
1. Capture network traffic during conversation close
2. Document actual CaseDetails event structure
3. Review Enterprise client implementation
4. Identify reusable code/patterns
5. Clarify open questions with stakeholders

### Phase 2: Data Layer (1 day)
1. Update Conversation model with status property
2. Add CaseDetails event parsing
3. Wire up controller event handling
4. Test event flow end-to-end

### Phase 3: UI Implementation (2-3 days)
1. Modify compose area conditional rendering
2. Create closed message component
3. Add reopen button and handler
4. Update conversation list styling
5. Test UI updates on status changes

### Phase 4: Reopen Functionality (1 day)
1. Implement controller reopen method
2. Add error handling
3. Test success and failure paths
4. Add loading states

### Phase 5: Testing & Polish (1-2 days)
1. Manual testing of all scenarios
2. Edge case testing
3. Cross-browser testing
4. Accessibility review
5. Code cleanup and documentation

### Phase 6: Review & Deploy (1 day)
1. Code review with team
2. QA testing
3. Address feedback
4. Deploy to staging
5. Smoke test in staging
6. Deploy to production

**Total Estimated Time:** 7-10 days

## 9. Success Criteria

### Implementation Success
- [ ] All acceptance criteria met (section 2.3)
- [ ] All manual test scenarios pass (section 5.1)
- [ ] All edge cases handled gracefully (section 5.3)
- [ ] No regressions in existing messaging functionality
- [ ] Code review approved
- [ ] QA sign-off received

### User Experience Success
- [ ] Closed conversations remain accessible
- [ ] Clear visual indication of closed state
- [ ] Reopen functionality works smoothly
- [ ] No confusing redirects or silent failures
- [ ] Aligned with Enterprise client experience

### Technical Success
- [ ] CaseDetails events properly handled
- [ ] Conversation model updated correctly
- [ ] UI updates reactively to status changes
- [ ] No memory leaks or performance issues
- [ ] Follows existing code patterns and conventions

## 10. Related Documentation

- **PREAMBLE.md** - Discovery notes and background context
- **ORIGINAL-WORKFLOW.md** - Step-by-step current behavior with screenshots
- **Figma Designs** - https://www.figma.com/deck/sIetcCDoFyNvhgzqDW8T8Z/Glacier-Alignment---Delivery-Plan (Slide 17)
- **#glacier-working-group** - Slack channel for questions and updates
- **Enterprise Implementation** - Reference for aligned behavior
