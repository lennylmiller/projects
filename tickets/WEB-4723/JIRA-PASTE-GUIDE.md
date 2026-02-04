# Jira Ticket WEB-4723 - Copy-Paste Guide

## Instructions
1. Navigate to: https://banno-jha.atlassian.net/browse/WEB-4723
2. Click "Edit" on the ticket
3. Copy the content from each section below into the corresponding Jira field

---

## SECTION 1: Ticket Description Field

Copy everything below this line and paste into the Description field:

---

## Goal
When a user closes a conversation, keep it in the messages list so they can view the conversation history (Glacier-style behavior).

## Current Problem
When a user closes a conversation, it **completely disappears** from their messages list. They lose access to the conversation history.

## Desired Behavior
Closed conversations should work like Glacier Bank's implementation:

1. **Closed conversations remain in the messages list**
   - User can see which conversations are closed (visual indicator)
   - User can click on closed conversation to view history

2. **When viewing a closed conversation**:
   - Show full message history (read-only)
   - Display "This chat has ended" message
   - Show "Start a new conversation" option
   - Hide the compose area

**Example: Glacier Bank's Closed Conversation View**

[ATTACH IMAGE: /Users/LenMiller/Downloads/CleanShot 2026-01-29 at 10.43.57.png]

_The Glacier example shows: Conversation history is visible, with a "Thanks for chatting with us! This chat has ended. If you need anything else, we're always here." message at the bottom, followed by a "Start a new conversation" link. No compose area is shown._

## Technical Questions
Before implementation, we need to clarify:
1. Can the API provide conversation status to distinguish closed vs active conversations?
2. Should closed conversations appear in the existing GET /conversations endpoint?
3. What changes (if any) are needed to the API schema?

## Implementation Approach
TBD based on API capabilities. See comments for discovery findings.

---

📊 **Technical analysis**: See first comment below

---

## SECTION 2: First Comment

After saving the description, add this as the first comment:

---

## Technical Discovery

### Current Implementation Issues

**Problem**: When `archiveConversation()` is called, the frontend completely removes the conversation:
```javascript
// conversations-controller.js line 84
this.messages_.remove(conversation);
```

This causes:
- Conversation disappears from messages list
- Direct URL navigation to closed conversation silently fails (shows inbox instead)
- No way to access conversation history

### API Analysis

Reviewed `consumer-api-docs/_conversations/conversations-v2.swagger.yaml`:

**What exists**:
- ✅ `POST /archive/{conversation}` endpoint (returns 204 No Content)
- ✅ Archive is "with respect to a particular consumer"

**What's missing**:
- ❌ No `status` field in `ConversationOverview` schema
- ❌ `GET /conversations` appears to exclude archived conversations
- ❌ No query parameter to include archived conversations

### Questions for Backend Team

1. **Can archived conversations be included in GET /conversations?**
   - Do we need a query parameter like `includeArchived=true`?
   - Or should archived conversations always be included with a status field?

2. **Can we add a `status` field to ConversationOverview?**
   - Example: `status: "active" | "closed"`
   - This would let the frontend show closed conversations differently

3. **Is there a Consumer API event for conversation status?**
   - Slack mentioned `CaseDetails` event, but this appears to be Enterprise-only
   - What's the Consumer API equivalent?

### Reference: Desired End State (Glacier Example)

The Glacier Bank implementation shows exactly what we want to achieve:
- Closed conversation remains accessible in messages list
- When opened, shows full conversation history
- Bottom message indicates chat has ended
- "Start a new conversation" action available
- No compose area visible

### Next Steps
- [ ] Post questions in #glacier-working-group
- [ ] Based on answers, determine if this is backend work, frontend work, or both
- [ ] Create follow-up implementation tickets

---

## IMPORTANT: Image Attachment

Don't forget to attach the Glacier screenshot:
- File location: `/Users/LenMiller/Downloads/CleanShot 2026-01-29 at 10.43.57.png`
- Attach it to the ticket description where it says `[ATTACH IMAGE]`
- In Jira, you can drag-drop the image or use the attachment button

---

## Quick Steps Summary

1. ✅ Edit ticket description
2. ✅ Paste SECTION 1 content
3. ✅ Attach Glacier screenshot image
4. ✅ Save description
5. ✅ Add new comment
6. ✅ Paste SECTION 2 content
7. ✅ Save comment
8. ✅ Done!

---

## After You Post to Slack

Come back and add a second comment with:

```
## API Clarification - Slack Responses

**Questions asked**: [link to Slack thread]

**Answers received**:
[Summarize the responses here]

**Implementation Path**:
- [ ] Backend changes needed: [details]
- [ ] Frontend changes needed: [details]
- [ ] Follow-up tickets: [list]
```
