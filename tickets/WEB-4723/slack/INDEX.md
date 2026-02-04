# #glacier-working-group Slack Channel Documentation - Index

## Quick Navigation

### Main Documents
- 📄 [**SLACK-GLACIER-WORKING-GROUP.md**](./SLACK-GLACIER-WORKING-GROUP.md) - Complete channel history and chronological message documentation
- 👤 [**CODY-LOYD-MESSAGES.md**](./CODY-LOYD-MESSAGES.md) - Focused documentation on Cody Loyd's conversations (especially his Chat Termination question)
- 📑 **This INDEX.md** - Quick reference guide

### Thread Documents
- 🎯 [**THREAD-20260129-cody-loyd-chat-termination.md**](./threads/THREAD-20260129-cody-loyd-chat-termination.md) - **THE MOST IMPORTANT THREAD** - Cody's question that sparked WEB-4723

### Related WEB-4723 Documentation
- [PREAMBLE.md](../PREAMBLE.md) - References the Cody Loyd conversation (lines 30-62)
- [REQUIREMENTS.md](../REQUIREMENTS.md) - CaseDetails event details (section 4.1)

---

## Key Dates

- **December 11, 2025** - Channel created by @Steph
- **January 2, 2026** - Andrew Mohrland and others added (10 new members)
- **January 14, 2026** - Kara Cross posts RDMP-1458, Zach Cox discusses transcripts
- **January 29, 2026** - 🎯 **CODY LOYD ASKS THE KEY QUESTION** about Chat Termination
- **January 29, 2026** - Cody assigns **@Lenny L. Miller** to the work (becomes WEB-4723)
- **February 3, 2026** - This documentation created

---

## Key Participants

- **Steph Hubka** - Channel creator, product/project lead
- **Cody Loyd** 🎅 - Engineering lead who assigned WEB-4723
- **Lenny L. Miller** - Engineer assigned to WEB-4723 (user creating this documentation)
- **River Ginther** 🥧 - Engineer who provided the `CaseDetails` event answer
- **Andrew Mohrland** - Engineer on transcript endpoint work
- **Zach Cox** - Engineer on conversation text transcripts
- **Kara Cross** - Product/Support for Agent Saved Replies
- **Chris Gubbels** - Early participant
- **Kevin Casey** - Meeting coordinator

---

## Key Topics

### 1. Chat Termination / Closed Conversations ⭐⭐⭐⭐⭐
**THE PRIMARY TOPIC FOR WEB-4723**

- **Origin:** Cody Loyd's question (January 29th, 8:49 AM)
- **Key Discovery:** `CaseDetails` event contains conversation status
- **Implementation:** Enterprise client already has it, Admin client needs it
- **Documentation:**
  - [CODY-LOYD-MESSAGES.md](./CODY-LOYD-MESSAGES.md)
  - [THREAD-20260129-cody-loyd-chat-termination.md](./threads/THREAD-20260129-cody-loyd-chat-termination.md)

### 2. Agent Saved Replies
- **Jira:** RDMP-1458
- **Key Person:** Kara Cross
- **Date:** January 14th, 2026

### 3. Conversation Text Transcripts
- **Jira:** ENT-5459
- **Key People:** Zach Cox, Andrew Mohrland, River Ginther
- **Key Detail:** `format=text` query parameter added
- **Event Types:** Including `ConversationOpened` and `ConversationClosed`

### 4. Live Chat vs Async Messaging
- **Date:** December 18th, 2025
- **Key Person:** Zach Cox
- **Context:** Hot topic about chat paradigms for Glacier

### 5. Agent Typing Indicator
- **Date:** December 18th, 2025
- **Key Person:** Steph Hubka
- **Question:** Need for `agent stopped typing` event

---

## Jira Tickets Referenced

### RDMP-1458: Agent Saved Replies
- **Status:** Backlog
- **Type:** Initiative
- **Assignee:** Kara Cross
- **Priority:** Medium
- **Link:** https://banno-jha.atlassian.net/browse/RDMP-1458

### ENT-5459: Chat Transcript
- **Status:** Planning
- **Type:** Task
- **Assignee:** River Ginther
- **Priority:** Medium
- **Key Feature:** Text format support (`format=text` query param)
- **Link:** https://banno-jha.atlassian.net/browse/ENT-5459

### ENT-5434: Glacier: Support Updates Phase 1
- **Status:** In Progress
- **Type:** Epic
- **Assignee:** River Ginther
- **Priority:** Medium
- **Link:** https://banno-jha.atlassian.net/browse/ENT-5434

### WEB-4723: Closed Chat Enhancement (Implied)
- **Origin:** Cody Loyd's January 29th question
- **Assigned To:** Lenny L. Miller
- **This is the ticket you're currently working on!**

---

## Major Threads (5+ replies)

1. 🎯 **[Cody Loyd: Chat Termination](./threads/THREAD-20260129-cody-loyd-chat-termination.md)** - 11 replies - **CRITICAL FOR WEB-4723**
2. **Zach Cox: Conversation Text Transcripts** (January 14) - 13 replies
3. **Andrew Mohrland: Organizational Noun** (January 20) - 23 replies
4. **River Ginther: Agent Replies** (January 29) - 14 replies
5. **Zach Cox: Live Chat vs Async Messaging** (December 18) - 7 replies
6. **Steph Hubka: Agent Status Decision** (December 18) - 16 replies

---

## Code Snippets

### Event Types for Transcript (from River Ginther, January 27)

```sql
CASE
  WHEN type = 'MessageAdded' THEN JSON_VALUE(event, '$.text')
  WHEN type = 'NounAdded' THEN FORMAT("{Attached %t} %t %t %t %t", ...)
  WHEN type = 'AuthenticatedFormAdded' THEN FORMAT("{Attached form} %t", ...)
  WHEN type = 'AuthenticatedFormSubmitted' THEN FORMAT("{Submitted form} %t", ...)
  WHEN type = 'AttachmentAdded' THEN FORMAT("{Attached file} %t", ...)
  WHEN type = 'InternalNoteAdded' THEN FORMAT("{Internal Note} %t", ...)
  WHEN type = 'ConversationOpened' THEN '{opened}'
  WHEN type = 'ConversationClosed' THEN '{closed}'
  ...
END
```

**Significance:** Shows `ConversationClosed` event exists!

---

## The Story of WEB-4723 (Quick Summary)

1. **December 11, 2025** - #glacier-working-group channel created for Glacier project collaboration
2. **January 29, 2026, 8:49 AM** - Cody Loyd asks: "How does Chat Termination work?"
3. **8:53 AM** - River Ginther answers: "`CaseDetails` event contains conversation status"
4. **8:55 AM** - Cody Loyd assigns @Lenny L. Miller to implement Admin client support
5. **Late January/Early February** - WEB-4723 ticket created
6. **February 3, 2026** - Lenny creates comprehensive documentation

**The moral:** A single well-asked question in Slack led to clarity, work assignment, and successful implementation!

---

## How to Use This Documentation

### If you want to understand WEB-4723's origin:
1. Read [CODY-LOYD-MESSAGES.md](./CODY-LOYD-MESSAGES.md)
2. Read [THREAD-20260129-cody-loyd-chat-termination.md](./threads/THREAD-20260129-cody-loyd-chat-termination.md)
3. Reference PREAMBLE.md lines 30-62

### If you want complete channel history:
1. Read [SLACK-GLACIER-WORKING-GROUP.md](./SLACK-GLACIER-WORKING-GROUP.md)

### If you want to understand CaseDetails event:
1. Read River Ginther's response in the Cody thread
2. Check REQUIREMENTS.md section 4.1
3. Look at Enterprise client implementation as reference

### If you want to see related Jira tickets:
1. RDMP-1458 - Agent Saved Replies
2. ENT-5459 - Chat Transcript
3. ENT-5434 - Support Updates Phase 1
4. WEB-4723 - Closed Chat Enhancement (your current ticket!)

---

## Documentation Status

### ✅ Completed
- [x] CODY-LOYD-MESSAGES.md - Complete analysis of Cody's conversations
- [x] THREAD-20260129-cody-loyd-chat-termination.md - Detailed thread documentation
- [x] INDEX.md - This quick reference guide
- [x] SLACK-GLACIER-WORKING-GROUP.md - Main document with overview and timeline

### 📝 Partial / In Progress
- [ ] Complete chronological message-by-message documentation for all dates
- [ ] Documentation of other major threads (13+ other threads identified)
- [ ] Screenshot captures of key messages
- [ ] Complete reply capture for Cody's thread (7 of 11 replies documented in detail)

### 🔮 Future Enhancements
- [ ] Extract additional threads as separate documents
- [ ] Create visual timeline diagram
- [ ] Add cross-references to all related JIRA tickets
- [ ] Document screenshots and embedded images
- [ ] Create data export (JSON/YAML) of all messages

---

## Contact / Maintainer

This documentation was created by **Lenny L. Miller** on February 3, 2026, as part of the WEB-4723 implementation work.

If you have questions about:
- The documentation itself → Ask Lenny
- The Glacier project → Check #glacier-working-group channel
- WEB-4723 implementation → Ask Cody Loyd or Lenny
- Enterprise client reference → Ask River Ginther

---

**Quick Links to Parent Project:**
- [← Back to WEB-4723 Root](../)
- [PREAMBLE.md](../PREAMBLE.md)
- [REQUIREMENTS.md](../REQUIREMENTS.md)
- [Jira Ticket](https://banno-jha.atlassian.net/browse/WEB-4723)

**Last Updated:** February 3, 2026
