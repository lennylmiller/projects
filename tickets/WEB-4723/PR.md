# Plan: Complete PREAMBLE.md and Start REQUIREMENTS.md for WEB-4723

## Overview
Document the Glacier project closed conversation feature discovery process and create initial requirements based on hands-on browser exploration and codebase analysis. This includes:
1. Completing PREAMBLE.md with discovery notes and reproduction instructions
2. Creating ORIGINAL-WORKFLOW.md with visual step-by-step walkthrough (with screenshots)
3. Creating REQUIREMENTS.md with business and technical specifications

## Phase 1: Complete PREAMBLE.md

### 1.1 Finalize John Robinson Section
Complete the incomplete "Spoke With John Robinson" section (currently cuts off at line 65):

**Content to add:**
```markdown
### Spoke With John Robinson
1. **Local Development Setup**
   - Command to run admin client: `yarn serve --fi=banno --debug`
   - Serves at: https://localhost:8443
   - Login credentials: username "husband", password "banno1"

2. **Demonstrated Current Workflow**
   - Navigate to Messages section
   - Click on a conversation to open it
   - Active conversations show compose area (textarea + send button)
   - Info button (circle with i) in upper right corner opens "Conversation details" modal
   - "Close conversation" option in the modal's Options section
   - Confirmation dialog: "This conversation will be removed from your messages list. You'll still receive any new replies."
   - After closing, conversation is removed from inbox

3. **Key Insights**
   - No explicit "closed" or "terminated" status currently exists on Conversation model
   - System uses "archive" feature to remove conversations from list
   - Need to implement proper closed conversation handling per Glacier requirements
   - Should capture network traffic to understand data flow
```

### 1.2 Document Browser Exploration
Add new section documenting the hands-on exploration of the messaging feature:

**Section: "Browser Exploration of Messaging Feature"**

Content includes:
- Login process at https://localhost:8443/login
- Three messages tracked in detail (Joey #1, Joey #2 with transaction, Julye)
- Message states: OPEN/ACTIVE vs CLOSED
- UI elements present/absent (compose area, info button, transaction badges)
- Close conversation workflow step-by-step
- Key observation: closed conversation disappears from inbox

### 1.3 Add Reproduction Instructions
Create section with corrected workflow for future testing:

**Section: "How to Reproduce Current Behavior"**

**CORRECTED Instructions** (with URL capture):
```markdown
1. Start local server: `yarn serve --fi=banno --debug`
2. Navigate to https://localhost:8443/login
3. Login with username: "husband", password: "banno1"
4. Click "Messages" in left navigation
5. Click on FIRST message - note details and URL
6. Click on SECOND message - **CAPTURE THE URL** (e.g., https://localhost:8443/messages/a94a1b79-b4a1-403d-9068-e2c0ac430940)
7. Click on THIRD message - note details and URL
8. Return to SECOND message (using inbox or URL)
9. Click info button (circle with i) in upper right
10. Click "Close conversation" in Options section
11. Confirm with "Yes, close"
12. Observe: Conversation removed from inbox, redirected to /messages

**Expected Behavior:**
- Active conversations show compose area with "Type your message..." placeholder
- Compose area has textarea, emoji picker, attachment dropdown, Send button
- Closed conversations are removed from visible inbox
- User can still receive new replies (per confirmation dialog)
```

### 1.4 Add Network Traffic Section
Placeholder for capturing API/WebSocket traffic:

```markdown
### Network Traffic Analysis
TODO: Use browser DevTools to capture:
- WebSocket events when conversation is closed
- API calls to close/archive endpoint
- CaseDetails event structure (if present)
- Response data showing conversation status changes
```

## Phase 2: Create ORIGINAL-WORKFLOW.md with Screenshots

### 2.1 Purpose
Create a visual walkthrough document that captures the complete workflow with inline screenshots for future reference and stakeholder communication.

### 2.2 Screenshot Naming Convention
Use contextual, descriptive names for all screenshots:
- `login-page-username-field.png` - Login page showing username input
- `login-page-password-field.png` - Login page showing password input
- `dashboard-messages-navigation.png` - Dashboard with Messages link highlighted
- `messages-inbox-list.png` - Messages inbox showing conversation list
- `conversation-1-joey-atest-active.png` - First conversation (Joey "This is a atest")
- `conversation-2-joey-test-transaction.png` - Second conversation (Joey "test" with CASEYS transaction)
- `conversation-2-url-capture.png` - Browser address bar showing conversation URL
- `conversation-3-julye-address-change.png` - Third conversation (Julye "need update")
- `conversation-details-modal-open.png` - Conversation details modal showing participant
- `conversation-details-close-option.png` - Modal showing "Close conversation" option
- `close-conversation-confirmation-dialog.png` - Confirmation dialog with "Yes, close" button
- `messages-inbox-after-close.png` - Inbox showing conversation removed

### 2.3 Document Structure

**File:** `/Users/LenMiller/projects/tickets/WEB-4723/ORIGINAL-WORKFLOW.md`

```markdown
# Original Workflow: Closing Conversations in Banno Online Admin

## Overview
This document captures the current conversation closing workflow in the Banno Online admin client, discovered through hands-on exploration on February 3, 2026.

## Prerequisites
- Local development server running: `yarn serve --fi=banno --debug`
- Test credentials: username "husband", password "banno1"
- Server URL: https://localhost:8443

## Step-by-Step Workflow

### Step 1: Access Login Page
Navigate to `https://localhost:8443/login`

![Login Page - Username Field](login-page-username-field.png)

**Observations:**
- Clean Banno Dev Bank branded login
- Username field visible with placeholder
- "First time user? Enroll now" link present
- "Forgot?" link for password recovery

### Step 2: Enter Username
Enter username: `husband`

![Login Page - Password Field](login-page-password-field.png)

**Observations:**
- Username accepted, password field now shown
- "Switch" link to change username
- "Sign in with a passkey" alternative option
- Password visibility toggle (eye icon)

### Step 3: Enter Password and Sign In
Enter password: `banno1` and click "Sign in"

![Dashboard - Messages Navigation](dashboard-messages-navigation.png)

**Observations:**
- Successfully logged in to dashboard
- Left navigation menu visible
- **Messages** link shows red badge with "37" unread messages
- Various menu options: Dashboard, Accounts, Merchant, Transfers, etc.

### Step 4: Navigate to Messages
Click on "Messages" in the left navigation

![Messages Inbox List](messages-inbox-list.png)

**Observations:**
- Messages inbox displayed with conversation list
- Multiple conversations from various contacts
- Each conversation shows: avatar, name, preview text, timestamp
- Welcome panel from Joey (Customer Service) on right side
- "Start a conversation" button in top right

### Step 5: Open First Message
Click on first conversation: **Joey - "This is a atest"** (9:52 AM)

![Conversation 1 - Joey "This is a atest" - Active](conversation-1-joey-atest-active.png)

**Observations:**
- **Status: OPEN/ACTIVE**
- **URL:** https://localhost:8443/messages/3d08fe91-fe52-462b-a005-6ad2c6faa541
- Contact: Joey (ESI QA) - San Diego, CA
- Started: Tuesday, Feb 3 - "Joey joined this conversation"
- Message content: "This is a atest" (30 min ago)
- **Compose area VISIBLE:**
  - Textarea with "Type your message..." placeholder
  - Attachment button (paperclip icon)
  - Emoji button (smiley icon)
  - Send button (enabled when text entered)
- Info button (circle with i) in upper right corner
- Customer service hours banner at top

### Step 6: Open Second Message (TARGET FOR CLOSING)
Click on second conversation: **Joey - "test"** (9:52 AM)

![Conversation 2 - Joey "test" with Transaction - Active](conversation-2-joey-test-transaction.png)

**Observations:**
- **Status: OPEN/ACTIVE**
- Contact: Joey (ESI QA) - San Diego, CA
- Started: Tuesday, Feb 3
- **Transaction badge visible:**
  - "CASEYS 00028654 CEDAR FA... $45.41"
  - Business DDA 21
  - Jan 30, 10:38 AM
- Message content: "test" (30 min ago)
- **Compose area VISIBLE** (same as conversation 1)
- Info button present in upper right

### Step 6a: Capture Conversation URL
**IMPORTANT:** Note the browser address bar URL for this conversation

![Conversation 2 - URL Capture](conversation-2-url-capture.png)

**URL:** `https://localhost:8443/messages/a94a1b79-b4a1-403d-9068-e2c0ac430940`

This URL uniquely identifies this conversation and can be used to navigate directly to it.

### Step 7: Open Third Message
Click on third conversation: **Julye - "Form: Address Change"** (Friday)

![Conversation 3 - Julye "need update"](conversation-3-julye-address-change.png)

**Observations:**
- **Status: OPEN/ACTIVE**
- Contact: Julye (member)
- Date: Friday, Jan 30
- Message content: "need update" (11:04 AM from Julye)
- System note: "Julye joined this conversation"
- **Compose area VISIBLE**
- Customer service banner from Joey/bank
- Info button present

### Step 8: Return to Second Message
Navigate back to the second conversation (Joey "test" with transaction)
- Either click from inbox list
- Or use direct URL: https://localhost:8443/messages/a94a1b79-b4a1-403d-9068-e2c0ac430940

### Step 9: Open Conversation Details
Click the **info button** (circle with i) in the upper right corner

![Conversation Details Modal - Opened](conversation-details-modal-open.png)

**Observations:**
- Modal dialog opens: "Conversation details"
- Shows participant information:
  - Joey (ESI QA) - with avatar
  - "1 participant" label
- **Options section** below participant info
- Background slightly dimmed

### Step 10: Locate Close Conversation Option
In the Options section, find the **"Close conversation"** button

![Conversation Details - Close Option](conversation-details-close-option.png)

**Observations:**
- "Close conversation" link/button visible
- Icon: circle with X mark (close/remove icon)
- Located under "Options" heading
- Clicking this will initiate the close process

### Step 11: Click Close Conversation
Click on **"Close conversation"**

![Close Conversation - Confirmation Dialog](close-conversation-confirmation-dialog.png)

**Observations:**
- Confirmation dialog appears
- Title: "Close conversation?"
- Message: "This conversation will be removed from your messages list. You'll still receive any new replies."
- Two buttons:
  - **Cancel** (light gray) - aborts the action
  - **Yes, close** (orange/brown) - confirms closing
- Background further dimmed

### Step 12: Confirm Closing
Click **"Yes, close"** button

### Step 13: Observe Result
After confirmation, browser redirects to messages list

![Messages Inbox After Close](messages-inbox-after-close.png)

**Key Observations:**
- **Conversation REMOVED from inbox**
- Second Joey message ("test" with CASEYS transaction) is **GONE**
- First Joey message ("This is a atest") still visible
- Third message (Julye) still visible
- Unread count decreased from 37 to 36
- User redirected to: https://localhost:8443/messages

## Summary of Current Behavior

### Active Conversations
- Show compose area with full functionality
- Display all messages in chronological order
- Allow sending text, attachments, emojis
- Info button provides access to conversation details

### Closing Process
1. Click info button (circle with i)
2. Click "Close conversation" in Options
3. Confirm with "Yes, close"
4. Conversation removed from inbox
5. User redirected to messages list

### After Closing
- Conversation disappears from visible inbox
- Cannot be accessed from messages list
- Per dialog: "You'll still receive any new replies"
- No visual indicator of closed conversations

## Technical Notes

### Conversation IDs
Each conversation has a unique UUID in the URL:
- Format: `https://localhost:8443/messages/{uuid}`
- Example: `a94a1b79-b4a1-403d-9068-e2c0ac430940`

### Current Implementation Gaps
- No explicit "closed" status visible in UI
- No way to view closed conversations
- No way to reopen closed conversations from Admin side
- Uses "archive" pattern (removal) rather than status change
- No differentiation between archived and closed

## Next Steps
See REQUIREMENTS.md for planned enhancements to align with Glacier project specifications.
```

### 2.4 Screenshot Capture Process
**Note:** Since the second conversation was already closed during initial exploration, we'll need to use a different conversation OR work with screenshots from the original session where applicable.

During implementation, for each step:
1. Navigate to the step in the browser
2. Take screenshot using browser automation (`mcp__claude-in-chrome__computer` with action: screenshot)
3. Save with contextual filename in `/Users/LenMiller/projects/tickets/WEB-4723/`
4. Reference in markdown with relative path: `![Description](filename.png)`
5. Ensure images display inline when viewing the markdown

### 2.5 Implementation Notes
- Screenshots should be high quality (browser default resolution)
- Capture entire viewport for context
- Highlight or annotate key UI elements if needed
- Keep file sizes reasonable (JPEG format acceptable for screenshots)
- All image files must be in the same directory as ORIGINAL-WORKFLOW.md for relative paths to work

## Phase 3: Create Initial REQUIREMENTS.md

### 2.1 Structure
Create structured requirements document with these sections:

```markdown
# Requirements: WEB-4723 - Glacier Closed Conversation Handling

## 1. Overview
Brief description of the Glacier alignment project and Admin client requirements.

## 2. Business Requirements
### 2.1 User Story
As a financial institution admin user, when a conversation is closed by either party, I should see a clear indication that the conversation is closed and not be able to send new messages through the compose area.

### 2.2 Current vs Desired Behavior
**Current Behavior:**
- Admin client uses "archive" to remove conversations
- No explicit closed/terminated status handling
- No distinction between archived and closed conversations

**Desired Behavior (Glacier Milestone 1):**
- When conversation status = "Closed" (via CaseDetails event):
  - Hide compose area entirely
  - Display closed conversation message
  - Show reopen button (Admin side only, per Enterprise implementation)
- Conversation remains visible in inbox but marked as closed
- Align with Enterprise client implementation

## 3. Technical Requirements

### 3.1 Data Model Changes
**File:** `/src/js/api/models/conversation.js`
- Add `status` or `caseStatus` property to Conversation model
- Track "Closed" state from CaseDetails event
- Differentiate between archived (removed) and closed (visible but inactive)

### 3.2 Event Handling
**File:** `/src/js/util/conversations.js`
- Add `CASE_DETAILS` to PUSH_TYPES enum
- Implement `parseCaseDetailsEvent()` function
- Update `parseConversationEvent()` switch statement

**File:** `/src/js/controllers/conversations-controller.js`
- Handle CaseDetails events in `messageReceived_()`
- Update conversation status when CaseDetails event received
- Dispatch new event type (e.g., CONVERSATION_STATUS_CHANGED)

### 3.3 UI Changes
**File:** `/src/components/bannoweb/conversations/bannoweb-conversations-chat-card.js`

**Modify Compose Area Rendering** (lines 1930-2094):
- Current condition: `isActiveOrStarting()`
- New condition: `isActiveOrStarting() && !isClosed()`
- Add getter: `isClosed()` - returns `this.conversation?.status === 'Closed'`

**Add Closed Conversation Message Component:**
- Create new component or add to chat-card
- Show message: "This conversation is closed. You'll still receive any new replies."
- Add "Reopen Conversation" button for Admin side
- Position where compose area normally appears

**Visual Indicators:**
- Update conversation list item to show closed status (icon, badge, styling)
- Dim or style closed conversations differently in inbox

### 3.4 Reopen Functionality
**File:** `/src/js/controllers/conversations-controller.js`
- Add `reopenConversation(conversationId)` method
- API endpoint: TBD (coordinate with backend team)
- Update conversation status to active/open
- Show compose area again

## 4. API Requirements
### 4.1 CaseDetails Event
**Expected WebSocket Event Structure:**
```json
{
  "type": "CASE_DETAILS",
  "conversationId": "uuid",
  "status": "Closed",
  "timestamp": "ISO-8601",
  ... other fields
}
```

### 4.2 Reopen Endpoint
**Endpoint:** POST `/a/conversations/api/consumer/v2/reopen/{conversationId}`
**Response:** Updated conversation object with new status

## 5. Testing Requirements
### 5.1 Manual Testing
1. Start conversation with FI agent
2. Have agent close conversation from their side
3. Verify compose area disappears
4. Verify closed message appears with reopen button
5. Click reopen button
6. Verify compose area reappears
7. Verify can send messages again

### 5.2 WebSocket Event Testing
- Mock CaseDetails event with status="Closed"
- Verify conversation model updates
- Verify UI reacts correctly

### 5.3 Edge Cases
- Close conversation while typing (draft text)
- Close conversation with pending file uploads
- Receive new message on closed conversation
- Multiple rapid close/reopen actions
- Network interruption during close/reopen

## 6. Out of Scope (Milestone 2)
- FI agent availability status (away/available/busy)
- Agent status indicators in UI
- "Mark as away" functionality

## 7. Open Questions
1. What is the exact structure of the CaseDetails event?
2. What API endpoint is used for reopening conversations?
3. Should closed conversations stay in inbox or move to separate section?
4. What happens to draft text when conversation is closed?
5. Can consumers also close conversations, or only FI agents?
6. Should we show who closed the conversation and when?
```

## Phase 3: File References

### Critical Files to Modify
1. **Model:** `/src/js/api/models/conversation.js` - Add status property
2. **Events:** `/src/js/util/conversations.js` - Parse CaseDetails events
3. **Controller:** `/src/js/controllers/conversations-controller.js` - Handle status changes
4. **UI:** `/src/components/bannoweb/conversations/bannoweb-conversations-chat-card.js` - Hide/show compose area
5. **Message List:** `/src/components/bannoweb/conversations/bannoweb-message-list.js` - Style closed conversations

### Existing Patterns to Reuse
- **Toast messages:** Archive success pattern (line 36 in bannoweb-conversations.js)
- **Conditional rendering:** `isActiveOrStarting()` pattern in chat-card
- **WebSocket event parsing:** `parseConversationEvent()` switch pattern
- **Observable pattern:** Controller event dispatching and component subscription
- **Disable logic:** `disableSendButton` getter pattern (lines 1316-1327)

## Phase 4: Implementation Approach

### Step 1: Research Phase (Complete network capture)
- Open browser DevTools Network tab
- Close a conversation
- Capture all WebSocket messages
- Document actual CaseDetails event structure
- Document any API calls made

### Step 2: Update Data Models
- Add conversation status tracking
- Create CaseDetails event model class
- Add status change logic

### Step 3: Event Processing
- Add CASE_DETAILS to event types
- Implement parsing function
- Wire up controller handling

### Step 4: UI Implementation
- Modify compose area conditional rendering
- Create closed message component
- Add reopen button with handler
- Update message list styling

### Step 5: Testing
- Manual testing of workflow
- Edge case testing
- Cross-browser verification

## Verification Steps
1. Run `yarn serve --fi=banno --debug`
2. Navigate to https://localhost:8443
3. Open a conversation
4. Trigger close from FI agent side (or mock event)
5. Verify compose area hidden
6. Verify closed message displayed
7. Verify reopen button works
8. Verify can send messages after reopen

## Success Criteria
- [ ] PREAMBLE.md completely documents discovery process
- [ ] PREAMBLE.md includes corrected reproduction instructions with URL capture
- [ ] **ORIGINAL-WORKFLOW.md created with inline screenshots and contextual image names**
- [ ] **All screenshots saved in /Users/LenMiller/projects/tickets/WEB-4723/ with descriptive filenames**
- [ ] REQUIREMENTS.md clearly defines business and technical requirements
- [ ] All critical files identified and documented
- [ ] Open questions listed for stakeholder clarification
- [ ] Implementation approach is clear and actionable
