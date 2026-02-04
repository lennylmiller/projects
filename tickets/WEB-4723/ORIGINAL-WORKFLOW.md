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

**Screenshot: Login page with username field**

**Observations:**
- Clean Banno Dev Bank branded login
- Username field visible with placeholder
- "First time user? Enroll now" link present
- "Forgot?" link for password recovery
- Red banner shows "You have been logged out due to inactivity"

### Step 2: Enter Username
Enter username: `husband`

**Screenshot: Login page with password field**

**Observations:**
- Username "husband" entered and displayed
- "Switch" link to change username
- Password field now visible with "Enter your password" placeholder
- "Sign in with a passkey" alternative option
- Password visibility toggle (eye icon)
- "Forgot?" link available

### Step 3: Enter Password and Sign In
Enter password: `banno1` and click "Sign in"

**Screenshot: Dashboard with Messages navigation**

**Observations:**
- Successfully logged in to dashboard
- Left navigation menu visible
- **Messages** link shows red badge with "35" unread messages
- Various menu options: Dashboard, Accounts, Merchant, Transfers, Remote deposits, Payments, etc.
- Main content shows "the modern way to run your financial institution" banner
- Credit cards widget visible

### Step 4: Navigate to Messages
Click on "Messages" in the left navigation

**Screenshot: Messages inbox list**

**Observations:**
- Messages inbox displayed with conversation list
- Multiple conversations from various contacts
- Inbox shows conversations from Joshua, James, Banno Dev Bank, marco, John, Calvin, and others
- Each conversation shows: avatar, name, preview text, timestamp
- Welcome panel from Joey (Customer Service) on right side
- "Connect with our Customer Service Team!" message visible
- "Start a conversation" button in top right
- Filter dropdown available in inbox header

### Step 5: Open First Message (Joshua)
Click on conversation: **Joshua - "Your issue has been forwarded to our me..."** (Jan 21)

**Screenshot: Active conversation with Joshua**

**Observations:**
- **Status: OPEN/ACTIVE**
- **URL:** https://localhost:8443/messages/ccd2352f-aa77-4a8e-ab72-84a8eb3cdb3f
- Contact: Joshua (with avatar)
- Started: Wednesday, Jan 21
- System message: "Joshua joined this conversation"
- Message content: "This is a test" from Joshua at 1:35 PM
- Customer service hours banner at top from Joey
- **Compose area VISIBLE:**
  - Plus button (attachment icon) on left
  - Textarea with "Type your message..." placeholder
  - Emoji button (smiley icon) on right
  - Send button (orange/brown) on far right
- **Info button (circle with i) present in upper right corner**

### Step 6: Capture Conversation URL
**IMPORTANT:** Note the browser address bar URL for this conversation

**URL:** `https://localhost:8443/messages/ccd2352f-aa77-4a8e-ab72-84a8eb3cdb3f`

This URL uniquely identifies this conversation and can be used to navigate directly to it.

### Step 7: Open Conversation Details
Click the **info button** (circle with i) in the upper right corner

**Screenshot: Conversation details modal opened**

**Observations:**
- Modal dialog opens: "Conversation details"
- Shows participant information:
  - Joshua - with avatar
  - "1 participant" label above participant
- **Options section** below participant info
- "Close conversation" link/button visible with circle-X icon
- Background dimmed (modal overlay)
- X button in top right to close modal

### Step 8: Click Close Conversation
Click on **"Close conversation"** in the Options section

**Screenshot: Close conversation confirmation dialog**

**Observations:**
- Confirmation dialog appears on top of conversation details modal
- Title: "Close conversation?"
- Message: "This conversation will be removed from your messages list. You'll still receive any new replies."
- Two buttons:
  - **Cancel** (light gray/white) - aborts the action
  - **Yes, close** (orange/brown) - confirms closing
- Background further dimmed
- Clear warning about conversation being removed from list
- Note that new replies can still be received

### Step 9: Confirm Closing
Click **"Yes, close"** button

### Step 10: Observe Result
After confirmation, browser redirects to messages list

**Screenshot: Messages inbox after closing**

**Key Observations:**
- **Conversation with Joshua is REMOVED from inbox**
- First conversation is now James (Jan 21) instead of Joshua
- Subsequent conversations from Banno Dev Bank, marco, John, Calvin, etc. remain visible
- Unread count still shows 35 in sidebar
- User redirected to: https://localhost:8443/messages
- No toast notification or confirmation message shown
- No way to access the closed conversation from UI

### Step 11: Navigate to Closed Conversation via Direct URL
**🎯 CRITICAL TEST:** Paste the saved URL from Step 6 into the browser address bar

Navigate to: `https://localhost:8443/messages/ccd2352f-aa77-4a8e-ab72-84a8eb3cdb3f`

**Screenshot: Accessing closed conversation via URL**

**🔴 CRITICAL FINDING - Current Behavior:**

**Key Observations:**
- URL bar shows the closed conversation ID: `https://localhost:8443/messages/ccd2352f-aa77-4a8e-ab72-84a8eb3cdb3f`
- **Page displays the messages INBOX instead of the conversation**
- Inbox list is visible on the left side
- Welcome panel from Joey (Customer Service) is shown on the right
- **No error message displayed**
- **No indication that a closed conversation was accessed**
- **Conversation content is NOT visible**
- **No "This conversation is closed" message**
- Page title changed to "Banno Web" (generic)
- Appears to silently redirect or show inbox when closed conversation is accessed

**Why This Is Critical:**
This behavior reveals the **implementation gap** that WEB-4723 must address:

**Current Behavior (❌ Not Aligned with Glacier):**
- Closed conversations are completely inaccessible via direct URL
- No indication to the user that they tried to access a closed conversation
- Conversation history is hidden/unavailable
- Silent failure - just shows inbox instead

**Desired Behavior (✅ Glacier Milestone 1):**
- Closed conversation should remain accessible via direct URL
- All message history should be visible (read-only)
- Compose area should be HIDDEN
- Display clear message: "This conversation is closed. You'll still receive any new replies."
- Show "Reopen Conversation" button (Admin side only)
- Conversation should remain in inbox but marked as closed (not removed)

## Summary of Current Behavior

### Active Conversations
- Show compose area with full functionality
- Display all messages in chronological order
- Allow sending text, attachments, emojis
- Info button provides access to conversation details
- Can be closed via conversation details modal

### Closing Process
1. Click info button (circle with i) in upper right
2. Click "Close conversation" in Options section
3. Confirmation dialog appears with warning message
4. Click "Yes, close" to confirm
5. Conversation removed from inbox
6. User redirected to messages list (https://localhost:8443/messages)

### After Closing
- Conversation disappears from visible inbox
- **Cannot be accessed from messages list**
- **Direct URL access shows inbox instead of conversation** ⚠️
- No visual indicator of closed conversations
- No way to view closed conversation history
- No way to reopen closed conversations from Admin side
- Per dialog message: "You'll still receive any new replies" (but this is not demonstrated)

## Technical Notes

### Conversation IDs
Each conversation has a unique UUID in the URL:
- Format: `https://localhost:8443/messages/{uuid}`
- Example: `ccd2352f-aa77-4a8e-ab72-84a8eb3cdb3f` (Joshua conversation)

### Current Implementation Gaps
Based on the hands-on exploration, the following gaps exist:

1. **No explicit "closed" status in UI or data model**
   - System uses "archive" pattern (removal) rather than status change
   - No differentiation between archived and closed

2. **Closed conversations are inaccessible**
   - Direct URL navigation doesn't work
   - No way to view conversation history after closing
   - Appears to redirect/show inbox instead

3. **No closed conversation indicators**
   - No badge, icon, or visual marker in inbox
   - No separate "Closed" section or filter
   - No indication in conversation view

4. **No reopen functionality**
   - Cannot reopen closed conversations from Admin side
   - No UI element or API for reopening

5. **Unclear event handling**
   - Unknown if CaseDetails events are received
   - Unknown if conversation status is tracked
   - Need to capture network traffic to understand data flow

## Next Steps

1. **Capture Network Traffic:**
   - Use browser DevTools Network tab
   - Monitor WebSocket messages when closing conversation
   - Document CaseDetails event structure (if present)
   - Identify API endpoints used

2. **Review Codebase:**
   - Examine Conversation model in `/src/js/api/models/conversation.js`
   - Check event parsing in `/src/js/util/conversations.js`
   - Review controller logic in `/src/js/controllers/conversations-controller.js`
   - Inspect UI components in `/src/components/bannoweb/conversations/`

3. **Implement Glacier Alignment:**
   - See REQUIREMENTS.md for detailed implementation plan
   - Add conversation status tracking
   - Implement CaseDetails event handling
   - Modify UI to hide compose area when closed
   - Add closed conversation message and reopen button
   - Update conversation list to show closed status

## References
- **PREAMBLE.md** - Discovery notes and background context
- **REQUIREMENTS.md** - Detailed business and technical requirements for implementation
- **Figma Designs:** https://www.figma.com/deck/sIetcCDoFyNvhgzqDW8T8Z/Glacier-Alignment---Delivery-Plan (Slide 17)
