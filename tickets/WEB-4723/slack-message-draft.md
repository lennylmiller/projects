# Slack Message Draft for #glacier-working-group

## Primary Message (Contextual & Collaborative)

Hey @River and team! Following up on our Jan 29 discussion about closed conversations.

You mentioned that the Enterprise client uses the `CaseDetails` event to get conversation status - which makes perfect sense for your implementation.

I've now investigated both the Consumer REST API and websocket implementation to understand how the Admin client could detect closed conversations:

**REST API Review** ([`consumer-api-docs/_conversations/conversations-v2.swagger.yaml`](https://github.com/Banno/consumer-api-docs/blob/master/_conversations/conversations-v2.swagger.yaml)):
- ❌ No `status` field in `ConversationOverview` schema
- ❌ `GET /conversations` excludes archived conversations
- ✅ `POST /archive/{id}` exists (but returns 204 with no status info)

**Websocket Review** (`wss://.../consumer/v2/websocket` in `conversations-controller.js:549-571`):
- ❌ No `push.consumer.ConversationClosed` event
- ❌ No `CaseDetails` event (appears Enterprise-only)
- ❌ No status-related push events in the Consumer API event list

**Current Admin Client Behavior**:
When `archiveConversation()` is called, the conversation is immediately removed from the UI and cannot be retrieved afterward.

**Questions**:
1. Is there a Consumer API equivalent to Enterprise's `CaseDetails` event?
2. Can we add a `push.consumer.ConversationClosed` websocket event?
3. Can we add a `status` field to `ConversationOverview` for REST polling?
4. Should `GET /conversations` include archived conversations with a query param?

The UI patterns from Glacier are clear - we just need the data mechanism to detect closed status. Would love to discuss the best approach!

📎 **WEB-4723**: https://banno-jha.atlassian.net/browse/WEB-4723
📊 Full API analysis and current flow diagrams in ticket

Thoughts?

---

## Alternative: Shorter Version

Hey team! Quick API question for WEB-4723 (closed conversations).

I'm implementing the Glacier-style behavior where closed conversations stay in the list, but hit a snag:

**Issue**: The Consumer API docs don't show:
- Any `status` field in `ConversationOverview`
- Any way to include archived conversations in `GET /conversations`
- The `CaseDetails` event @River mentioned (appears to be Enterprise-only?)

**Questions**:
1. Can we add a `status` field to the ConversationOverview schema?
2. Should `GET /conversations` include archived conversations?
3. What's the Consumer API equivalent of `CaseDetails`?

📎 [WEB-4723 link]

Thanks! 🙏

---

## Even Shorter Version (If you want minimal)

Hey team - WEB-4723 question:

Need closed conversations to stay in the messages list (Glacier-style), but Consumer API doesn't have:
- `status` field in ConversationOverview
- Way to include archived conversations in GET /conversations

Can we extend the API schema? Or different approach?

📎 [WEB-4723 link]
