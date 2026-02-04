# #glacier-working-group Slack Channel History

## Overview
- **Channel:** #glacier-working-group
- **Workspace:** Digital (Banno)
- **Documentation Date:** February 3, 2026
- **Period Covered:** December 11, 2025 - February 2, 2026
- **Purpose:** Alignment and collaboration space for the cross-functional team delivering Glacier's February 2026 chat milestone across Banno and Support 2.0

## Quick Links
- [Cody Loyd's Conversations](./CODY-LOYD-MESSAGES.md)
- [Key Topics Index](#key-topics-index)
- [Thread Summaries](#thread-summaries)
- [Referenced Tickets](#jira-tickets-referenced)

## Channel Creation

**Created by:** @Steph (Steph Hubka)
**Date:** December 11th, 2025
**Description:** "Alignment and collaboration space for the cross-functional team delivering Glacier's February 2026 chat milestone across Banno and Support 2.0."

## Participants

Based on visible activity in the channel:
- **Steph Hubka** - Channel creator, product/project lead
- **Cody Loyd** - Engineering lead (asked key Chat Termination question)
- **River Ginther** - Engineer (multiple technical discussions)
- **Andrew Mohrland** - Engineer (organizational structure, transcript endpoints)
- **Kara Cross** - Product/Support (RDMP-1458 Agent Saved Replies)
- **Zach Cox** - Engineer (conversation text transcripts)
- **Chris Gubbels** - Participant
- **Kevin Casey** - Meeting participant
- **Henry Parker** - Joined channel
- **Erle Granger II** - Joined channel
- **Dani Ramirez Vega** - Member (visible in member list)
- **Others** - 31 total members

---

## Chronological Message History

### Wednesday, December 11th, 2025

#### 1:07 PM - Steph Hubka
joined #glacier-working-group. Also, Kara Cross and 4 others joined.

#### 1:09 PM - Steph Hubka
set the channel description: Alignment and collaboration space for the cross-functional team delivering Glacier's February 2026 chat milestone across Banno and Support 2.0.

#### 1:10 PM - Chris Gubbels
Posted message (with emoji reactions visible)

*Content to be expanded - scrolling to capture more detail*

---

## Key Topics Index

### Chat Termination / Closed Conversations ⭐
**Primary topic for WEB-4723 implementation**
- Origin: Cody Loyd's question (January 29, 2026)
- Key question: "Do we know how the Chat Termination is supposed to work yet? Is there an API contract change or something we can see that would indicate a conversation has been closed?"
- This conversation sparked the WEB-4723 implementation work
- Related thread: [THREAD-20260129-cody-loyd-chat-termination.md](./threads/THREAD-20260129-cody-loyd-chat-termination.md)

### Agent Saved Replies
- RDMP-1458 ticket
- Discussed by Kara Cross and team

### Conversation Text Transcripts
- ENT-5459 ticket
- Text vs JSON format discussion
- Discussed by Zach Cox, Andrew Mohrland, River Ginther

### Agent Typing Indicator
- Discussion about `agent stopped typing` event
- UI implementation questions

### Live Chat vs Async Messaging
- Hot topic discussion
- Analysis of chat paradigms

---

## Thread Summaries

### Major Threads (5+ replies)

#### Cody Loyd: Chat Termination Question (January 29) - 11 replies ⭐
**The most important thread for WEB-4723**
- Full documentation: [THREAD-20260129-cody-loyd-chat-termination.md](./threads/THREAD-20260129-cody-loyd-chat-termination.md)
- This question initiated the investigation and implementation work for WEB-4723

#### Zach Cox: Conversation Text Transcripts (January 14) - 13 replies
- Full documentation: [THREAD-20260114-zach-cox-transcripts.md](./threads/THREAD-20260114-zach-cox-transcripts.md)

#### Andrew Mohrland: Organizational Noun Question (January 20) - 23 replies
- Full documentation: [THREAD-20260120-andrew-mohrland-org-noun.md](./threads/THREAD-20260120-andrew-mohrland-org-noun.md)

#### River Ginther: Agent Replies Question (January 29) - 14 replies
- Full documentation: [THREAD-20260129-river-ginther-agent-replies.md](./threads/THREAD-20260129-river-ginther-agent-replies.md)

---

## Jira Tickets Referenced

### RDMP-1458: Agent Saved Replies
- **Mentioned by:** Kara Cross (January 14, 2026)
- **Context:** Information everyone needs about saved replies feature

### ENT-5459: Chat Transcript / Conversation Text Transcripts
- **Mentioned by:** Andrew Mohrland, Zach Cox (January 14-23, 2026)
- **Context:** Text vs JSON format for transcript endpoint
- **Status:** Format=text query parameter added to staging

### WEB-4723: Closed Chat Enhancement (Implied)
- **Context:** This is the ticket that resulted from Cody Loyd's January 29 question about Chat Termination
- **Link:** See PREAMBLE.md for full context

---

## Code Snippets & Technical Details

### Event Types for Transcript
From River Ginther's message (January 27th):

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

**Significance:** This code snippet shows that `ConversationClosed` event type already exists in the system, which is relevant to the Chat Termination feature in WEB-4723.

---

## Timeline Visualization

```
Dec 11 | Channel created by Steph Hubka
       | Initial members added (Kara Cross + 4 others)
       | Channel description set
       |
Dec 12 | Zach Cox and Erle Granger II added to channel
       | Discussion about Glacier plan presentation
       |
Dec 18 | "Live Chat" vs "Async Messaging" discussion
       | Steph Hubka updates on Milestone #1 features
       | Agent typing indicator discussion
       |
Jan 14 | Zach Cox: conversation text transcripts (13 replies)
       | Kara Cross: RDMP-1458 Agent Saved Replies
       |
Jan 15 | Andrew Mohrland: prototype deployment to staging
       |
Jan 20 | Andrew Mohrland: organizational noun question (23 replies)
       |
Jan 23 | Andrew Mohrland: transcript endpoint discussion
       |
Jan 27 | River Ginther: event types for transcript
       | River Ginther: copy button UI questions
       |
Jan 29 | 🔴 CODY LOYD: Chat Termination question (11 replies) ⭐ KEY
       | River Ginther: agent replies discussion (14 replies)
       | Production deployment planning
       |
Jan 30 | Support Updates document shared (saved replies)
       |
Feb 2  | Two PR fixes posted (styling, saved replies)
```

---

## Connection to WEB-4723

This Slack channel is directly related to the WEB-4723 Closed Chat Enhancement ticket. Specifically:

1. **Cody Loyd's Question (January 29, 2026)** sparked the investigation into how Chat Termination should work
2. The discussion revealed that:
   - CaseDetails events contain conversation status
   - Enterprise client already has this implementation
   - The Admin client needed similar functionality
3. This led to the creation of WEB-4723 and the documentation in PREAMBLE.md

See [CODY-LOYD-MESSAGES.md](./CODY-LOYD-MESSAGES.md) for detailed analysis of this connection.

---

## Documentation Status

**Status:** IN PROGRESS - Capturing detailed message history

**Remaining Work:**
- Complete message-by-message documentation for all dates
- Extract and document all thread conversations
- Create individual thread documents
- Create CODY-LOYD-MESSAGES.md
- Capture screenshots of key messages
- Create INDEX.md

**Last Updated:** February 3, 2026
