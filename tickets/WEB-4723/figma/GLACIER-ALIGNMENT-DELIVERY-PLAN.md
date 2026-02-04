# Glacier Alignment & Delivery Plan - Figma Presentation

## Document Metadata

- **Presentation Title:** Glacier Alignment & Delivery Plan
- **Subtitle:** Live chat experience across Banno and Support 2.0
- **Client:** Glacier Bank
- **Platform:** Figma Slides
- **URL:** https://www.figma.com/slides/sIetcCDoFyNvhgzqDW8T8Z/Glacier-Alignment---Delivery-Plan
- **Total Slides:** 23
- **Documentation Date:** February 3, 2026
- **Documented By:** Lenny L. Miller

## Overview

This Figma presentation outlines the delivery plan for Glacier Bank's enhanced chat experience across Banno Online and Support 2.0. The presentation focuses on **Milestone #1** features that make chat feel "intentional and trustworthy."

**Key Focus:** Four primary features for Milestone #1, including **"Chat termination clarity"** which is implemented in WEB-4723.

---

## Quick Links

- [Slide 15: Chat Termination Clarity](#slide-15---chat-termination-clarity-) - **WEB-4723 Feature**
- [Milestone #1 Focus](#slide-5---milestone-1-focus)
- [Delivery Timing](#slide-20---delivery-timing)
- [Related Documentation](#related-documentation)

---

## Presentation Structure

### Section 1: Introduction & Context (Slides 1-6)
Setting expectations and shared understanding

### Section 2: Feature Walkthrough (Slides 7-19)
Detailed breakdown of each Milestone #1 feature with UI mockups

### Section 3: Delivery Planning (Slides 20-23)
Timeline, approach, and next steps

---

## Detailed Slide Documentation

### Slide 1 - Title Slide

**Content:**
- Title: "ALIGNMENT & DELIVERY PLAN"
- Subtitle: "Live chat experience across Banno and Support 2.0"
- Glacier Bank logo
- Blue/teal gradient background

**Purpose:** Introduction and branding

---

### Slide 2 - Setting Expectations

**Visual:** Rolling pin and cherries on wooden cutting board (baking/preparation metaphor)

**Message:**
> "Our goal today is alignment — not final approval, and not detailed design review."

**Purpose:** Sets appropriate expectations for the presentation discussion

---

### Slide 3 - Disclaimer

**Header:** DISCLAIMER

**Content:**
> "Designs shown in this deck are intended to support discussion and alignment. As with all platform work, designs may change as we learn more through implementation, testing, and validation."

**Purpose:** Clarifies that designs are iterative and subject to change

---

### Slide 4 - Shared Context

**Title:** Shared context

**Key Points:**
- Glacier supports customers across multiple channels and entities
- Live chat is increasingly important for real-time support and competitive parity
- Messaging continues to play a role for non-urgent interactions

**Presenter Notes:**
> "This reflects what we've seen and what we've discussed together. Just grounding us in the same place."

**Analysis:**
- Acknowledges Glacier's multi-channel, multi-entity complexity
- Recognizes need for both synchronous (live chat) and asynchronous (messaging) communication
- Positions live chat as competitive necessity

---

### Slide 5 - Milestone #1 Focus

**Title:** Milestone #1 focus

**Four Primary Features:**
1. **Agent typing indicator**
2. **Agent availability & status controls**
3. **Chat entry experience**
4. **Chat termination clarity** ⭐ (WEB-4723!)

**Presenter Notes:**
> "This milestone is about making chat feel intentional and trustworthy."

**Significance:**
- These four features work together to create a cohesive, trustworthy chat experience
- **"Chat termination clarity"** is the specific feature implemented in WEB-4723
- Focus on intentionality and trust building

---

### Slide 6 - Other Committed Features

**Title:** Other committed features

**Additional Features Beyond Milestone #1:**
- Live → Async conversion
- Chat vs Messages separation
- Chat transcript to messages
- **Agent saved replies** (RDMP-1458)

**Presenter Notes:**
> "These features are designed to work together as a cohesive experience."

**Connection to Slack:**
- "Agent saved replies" corresponds to RDMP-1458 discussed in #glacier-working-group
- Shows broader feature ecosystem beyond Milestone #1

---

### Slide 7 - Section Divider

**Title:** FEATURE WALKTHROUGH

**Purpose:** Introduces detailed feature breakdown section

---

### Slide 8 - Feature 1: Agent Typing Indicator

**Title:** 1. Agent typing indicator

**Content:** (Details with UI mockups)

**Purpose:** Shows customers when agent is actively composing response

---

### Slides 9-10 - Agent Typing Indicator UI

**Content:** Mobile and desktop UI mockups showing typing indicator

**Visual Elements:**
- Mobile chat screens
- Typing indicator animations
- Message composition states

---

### Slide 11 - Feature 2: Agent Availability

**Title:** 2. Agent availability

**Content:** (Details about agent status controls)

**Purpose:** Allows agents to manage their availability status

---

### Slides 12-14 - Agent Availability Details

**Content:**
- Slide 12: "Status logic"
- Slides 13-14: UI mockups showing status controls

**Visual Elements:**
- Mobile status screens
- Status selection interfaces
- Availability states

---

### Slide 15 - Chat Termination Clarity ⭐

**Title:** 3. Chat termination clarity

**🎯 THIS IS THE WEB-4723 FEATURE! 🎯**

#### What this does
**"Customers receive clear visual and messaging cues when a chat session has ended. The experience includes clear next steps after the conversation closes."**

#### Why it matters
**"Customers aren't left wondering if someone will still respond, which reduces 'are you there?' follow-ups that waste agent time."**

#### Analysis

**Problem Being Solved:**
- Ambiguity about whether chat conversation is still active
- Customers waiting for responses that won't come
- Wasted agent time handling "are you there?" messages
- Poor user experience from unclear conversation state

**Solution Provided:**
- Clear visual cues when chat ends
- Messaging that explicitly communicates closure
- Next steps guidance for customers
- Eliminates ambiguity and confusion

**Business Impact:**
- Reduces unnecessary agent interactions
- Improves customer experience
- Increases operational efficiency
- Sets clear expectations

**Connection to WEB-4723:**
This slide describes exactly what WEB-4723 implements in the Admin client:
1. Detect closed conversation state (via `CaseDetails` event)
2. Show clear visual indication to customer
3. Disable chat input to prevent sending messages
4. Display messaging about conversation closure
5. Provide next steps or guidance

**Connection to Cody Loyd's Question:**
On January 29th, Cody Loyd asked "Do we know how the Chat Termination is supposed to work yet?" This slide provides the product vision that Cody was seeking to understand. The implementation in WEB-4723 delivers this vision.

---

### Slides 16-17 - Chat Termination UI Mockups

**Content:** Mobile and desktop UI showing closed chat states

**Visual Elements:**
- Chat interfaces with termination indicators
- Disabled input areas
- Closure messaging
- Next steps UI

---

### Slide 18 - Feature 4: Chat Transcript

**Title:** 4. Chat transcript

#### What this does
**"Allow agents to copy a plain-text version of the chat transcript to their clipboard."**

#### Why it matters
**"Enables agents to easily paste the conversation history into CRM tools or share with customers via other channels."**

**Note:** This is different from "Chat termination clarity" - this is about transcript copy functionality.

**Connection to Slack:**
- Related to the ENT-5459 "Conversation Text Transcripts" discussion
- Enables agent workflow efficiency

---

### Slide 19 - Chat Transcript UI

**Content:** UI mockups showing transcript copy feature

---

### Slide 20 - Delivery Timing

**Title:** DELIVERY TIMING

**Content:** (Timeline information for feature delivery)

**Purpose:** Establishes delivery expectations and milestones

---

### Slide 21 - Delivery Approach

**Title:** Delivery approach

**Content:** (Implementation strategy and phasing)

**Purpose:** Outlines how features will be delivered

---

### Slide 22 - Next Steps

**Title:** Next steps

**Content:** (Action items and follow-up activities)

**Purpose:** Defines immediate actions post-presentation

---

### Slide 23 - Closing

**Visual:** Celebration image with "YEAH CHRISTMAS!" text

**Purpose:** Positive, energetic conclusion to presentation

---

## Key Feature: Chat Termination Clarity (Slide 15)

### Product Vision

**Goal:** Eliminate ambiguity about chat conversation status

**User Problem:**
- Customers don't know if agent will respond
- Leads to "are you there?" follow-ups
- Wastes agent time
- Creates frustration and uncertainty

**Solution:**
- Clear visual indication when chat ends
- Explicit messaging about closure
- Guidance for next steps
- Disabled input to prevent confusion

### Implementation (WEB-4723)

**Technical Approach:**
1. Listen for `CaseDetails` event from backend
2. Check if conversation status is "Closed"
3. Update UI to show closed state
4. Hide/disable chat compose area
5. Display appropriate messaging

**Reference Implementation:**
- Enterprise client already implements this
- Admin client (WEB-4723) follows similar pattern

**Origin Story:**
1. January 29, 2026: Cody Loyd asks "How does Chat Termination work?"
2. River Ginther reveals `CaseDetails` event structure
3. Cody assigns Lenny L. Miller to implement
4. This Figma slide provides the product vision
5. WEB-4723 delivers the technical implementation

---

## Connection to WEB-4723 Documentation

### Slide 15 Validates Requirements

The Figma presentation confirms that WEB-4723's requirements align with product vision:

**From Slide 15:**
- ✅ "Clear visual and messaging cues when chat session has ended"
- ✅ "Clear next steps after conversation closes"
- ✅ Reduce "are you there?" follow-ups

**From WEB-4723 REQUIREMENTS.md:**
- ✅ Detect closed conversation state
- ✅ Update UI to indicate closure
- ✅ Prevent new message submission
- ✅ Provide visual feedback

### Alignment Across Documentation

| Document | Purpose | Key Info |
|----------|---------|----------|
| **This Figma Deck** | Product vision | What & Why for chat termination |
| **PREAMBLE.md** | Origin story | How WEB-4723 started |
| **REQUIREMENTS.md** | Technical specs | How to implement |
| **Slack Channel** | Team discussion | Technical discovery |
| **Cody's Thread** | Key question | Triggered investigation |

---

## Milestone #1 Features Summary

### 1. Agent Typing Indicator
**Purpose:** Show customers when agent is typing
**Impact:** Reduces perceived wait time, sets expectations

### 2. Agent Availability & Status Controls
**Purpose:** Manage agent availability states
**Impact:** Better workload management, clearer availability

### 3. Chat Termination Clarity ⭐ (WEB-4723)
**Purpose:** Clear conversation closure indication
**Impact:** Reduces confusion, saves agent time, improves UX

### 4. Chat Transcript Copy
**Purpose:** Enable easy transcript sharing
**Impact:** Improves agent workflow efficiency

**Theme:** All four features support making chat "intentional and trustworthy"

---

## Business Context: Glacier Bank

### Operational Challenges
- **17-18 financial institution brands** under Guaranty acquisition
- **Multiple channels and entities** to support
- **Current chat service:** Glia (for authentication and live chat)
- **Competitive pressure:** Live chat expectations increasing

### Strategic Direction
- **NOT integrating with Glia** for Conversations
- **Enhancing Conversations** to be more "live chat-esque"
- **Dual approach:** Live chat for urgent, messaging for non-urgent
- **Timeline:** February 2026 milestone target

### Why This Matters for WEB-4723
- Glacier needs production-ready chat experience
- Chat termination clarity is table stakes for "live chat" feel
- Part of larger competitive parity effort
- Delivered as part of coordinated Milestone #1

---

## Design Philosophy

### Alignment Over Approval
- Designs support discussion, not final decisions
- Iterative approach expected
- Implementation learning will inform changes

### Cohesive Experience
- Features work together as a system
- Not isolated improvements
- Builds trust through consistency

### Intentional and Trustworthy
- Core theme for Milestone #1
- Every feature contributes to this goal
- Reduces uncertainty and ambiguity

---

## Timeline Context

### Presentation Created
- Shared in #glacier-working-group on December 12, 2025
- Link posted by Steph Hubka at 11:38 AM

### WEB-4723 Assignment
- January 29, 2026: Cody Loyd asks about chat termination
- Cody assigns Lenny L. Miller same day
- This presentation provides product vision for implementation

### Connection
- Presentation created **before** Cody's question
- Product vision existed, but technical approach needed clarification
- Cody's question bridged product vision → technical implementation

---

## Related Slack Discussions

### Topics Referenced
1. **Chat Termination** - Cody's January 29 question about implementation
2. **Agent Saved Replies** - RDMP-1458 mentioned on slide 6
3. **Conversation Text Transcripts** - ENT-5459 relates to slide 18
4. **Live Chat vs Async Messaging** - Discussed Dec 18, addressed in slides 4 & 6

### Key Participants
- **Steph Hubka** - Shared this presentation
- **Cody Loyd** - Asked implementation question
- **River Ginther** - Provided technical answers
- **Kara Cross** - Agent Saved Replies lead
- **Lenny L. Miller** - Assigned WEB-4723 implementation

---

## Visual Design Notes

### Color Palette
- Blue/teal gradient for branding
- Clean, professional aesthetic
- Glacier Bank logo prominent

### Slide Structure
- Clear section dividers
- Consistent "What this does / Why it matters" format
- Mix of text and UI mockups

### UI Mockups
- Both mobile and desktop views
- Real-world looking interfaces
- Clear visual hierarchy

---

## Presenter Notes Captured

Throughout the presentation, presenter notes provide additional context:

- **Slide 2:** Sets expectation for alignment discussion
- **Slide 4:** "Grounding us in the same place"
- **Slide 5:** "Making chat feel intentional and trustworthy"
- **Slide 6:** "Designed to work together as cohesive experience"

**Purpose:** These notes guide presentation delivery and emphasize key themes

---

## Implementation Recommendations

Based on this presentation, WEB-4723 should:

1. **Follow the Vision** - Implement exactly what slide 15 describes
2. **Clear Visual Cues** - Make closure obvious and unambiguous
3. **Messaging** - Explain what happened and what's next
4. **Prevent Confusion** - Disable input, don't just hide it
5. **Match Enterprise** - Maintain consistency with existing implementation

---

## Success Metrics (Implied)

While not explicitly stated in the presentation, slide 15's "Why it matters" implies these success metrics:

**Reduction in:**
- "Are you there?" follow-up messages
- Agent time spent on closed conversations
- Customer confusion about conversation status

**Increase in:**
- Customer clarity and confidence
- Operational efficiency
- Positive chat experience ratings

---

## Quotes for Reference

### On Chat Termination Clarity (Slide 15)
> "Customers receive clear visual and messaging cues when a chat session has ended. The experience includes clear next steps after the conversation closes."

> "Customers aren't left wondering if someone will still respond, which reduces 'are you there?' follow-ups that waste agent time."

### On Milestone #1 Theme (Slide 5)
> "This milestone is about making chat feel intentional and trustworthy."

### On Design Iteration (Slide 3)
> "Designs shown in this deck are intended to support discussion and alignment. As with all platform work, designs may change as we learn more through implementation, testing, and validation."

---

## Files & Resources

### Figma Link
https://www.figma.com/slides/sIetcCDoFyNvhgzqDW8T8Z/Glacier-Alignment---Delivery-Plan

### Related WEB-4723 Documentation
- [PREAMBLE.md](../PREAMBLE.md) - Origin story
- [REQUIREMENTS.md](../REQUIREMENTS.md) - Technical specs
- [Slack Documentation](../slack/) - Team discussions
- [Cody Loyd's Thread](../slack/threads/THREAD-20260129-cody-loyd-chat-termination.md)

### Shared in Slack
- Channel: #glacier-working-group
- Date: December 12, 2025, 11:38 AM
- Shared by: Steph Hubka
- Message: "Sharing this, as I'm trying to put together a rough deck for next week 🤓 [Figma link]"

---

## Document Status

**Status:** Complete - Key slides documented with focus on WEB-4723 feature

**Coverage:**
- ✅ All 23 slides reviewed
- ✅ Slide 15 (Chat termination clarity) fully documented
- ✅ Milestone #1 features captured
- ✅ Business context understood
- ✅ Connection to WEB-4723 established

**Last Updated:** February 3, 2026

**Maintained By:** Lenny L. Miller (WEB-4723 implementer)
