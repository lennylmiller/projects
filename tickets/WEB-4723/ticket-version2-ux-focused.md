# WEB-4723 Ticket - Version 2: UX-Focused

**✅ STATUS: Added to Jira ticket on February 4, 2026**
- Description: Added to WEB-4723
- Comment 1 (Technical Discovery): Added to WEB-4723
- Link: https://banno-jha.atlassian.net/browse/WEB-4723

---

## Ticket Description

### Goal
When a user closes a conversation, keep it in the messages list so they can view the conversation history (Glacier-style behavior).

**Reference**: [Slide 17](https://docs.google.com/presentation/d/1234567890/edit#slide=id.g123_slide17) - Glacier Slide Deck

### Current Problem
When a user closes a conversation, it **completely disappears** from their messages list. They lose access to the conversation history.

### Desired Behavior
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

![Glacier closed conversation example](/Users/LenMiller/Downloads/CleanShot%202026-01-29%20at%2010.43.57.png)

*The image shows: Conversation history is visible, with a "Thanks for chatting with us! This chat has ended. If you need anything else, we're always here." message at the bottom, followed by a "Start a new conversation" link. No compose area is shown.*

**Note**: Screenshot attached to Jira ticket WEB-4723

### Technical Questions
After reviewing the [Conversation API's](https://github.com/Banno/consumer-api-docs/blob/master/_conversations/conversations-v2.swagger.yaml), we need to clarify:
1. Can the API provide conversation status to distinguish closed vs active conversations?
2. Should closed conversations appear in the existing GET /conversations endpoint?
3. What changes (if any) are needed to the API schema?

### Implementation Approach
TBD based on API capabilities. See comments for discovery findings.

---

📊 **Technical analysis**: See Comment 1

---

## Comment 1: Technical Discovery

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

3. **Is there a undocumented Consumer API event for conversation status?**
   - Slack mentioned `CaseDetails` event, but I can not find it in the Consumer API documents?

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

## Comment 2: API Clarification (TO BE FILLED AFTER SLACK RESPONSES)

**Questions asked**: [link to Slack thread]

**Answers received**:
[Summarize the responses]

**Implementation Path**:
- [ ] Backend changes needed: [details]
- [ ] Frontend changes needed: [details]
- [ ] Follow-up tickets: [list]
