# Figma Documentation Index

## Overview

Documentation of the "Glacier Alignment & Delivery Plan" Figma presentation that outlines the product vision for WEB-4723 and related Milestone #1 features.

---

## Main Document

📄 **[GLACIER-ALIGNMENT-DELIVERY-PLAN.md](./GLACIER-ALIGNMENT-DELIVERY-PLAN.md)** - Complete presentation documentation

---

## Quick Links to Key Content

### The WEB-4723 Feature
🎯 **[Slide 15: Chat Termination Clarity](./GLACIER-ALIGNMENT-DELIVERY-PLAN.md#slide-15---chat-termination-clarity-)** - THE key slide for WEB-4723

**What it does:**
> "Customers receive clear visual and messaging cues when a chat session has ended. The experience includes clear next steps after the conversation closes."

**Why it matters:**
> "Customers aren't left wondering if someone will still respond, which reduces 'are you there?' follow-ups that waste agent time."

### All Milestone #1 Features
📋 **[Slide 5: Milestone #1 Focus](./GLACIER-ALIGNMENT-DELIVERY-PLAN.md#slide-5---milestone-1-focus)**

The four features:
1. Agent typing indicator
2. Agent availability & status controls
3. **Chat termination clarity** ⭐ (WEB-4723)
4. Chat transcript copy

---

## Presentation Structure

**23 slides total:**

### Section 1: Introduction (Slides 1-6)
- Title and expectations
- Disclaimer
- Shared context
- Milestone #1 overview
- Other committed features

### Section 2: Feature Walkthrough (Slides 7-19)
- Agent typing indicator
- Agent availability
- **Chat termination clarity** ⭐ (Slide 15)
- Chat transcript copy
- UI mockups for each feature

### Section 3: Delivery (Slides 20-23)
- Delivery timing
- Delivery approach
- Next steps
- Closing

---

## Connection to Other Documentation

### WEB-4723 Project
- [← Back to WEB-4723 Root](../)
- [PREAMBLE.md](../PREAMBLE.md) - Origin story mentions this presentation
- [REQUIREMENTS.md](../REQUIREMENTS.md) - Technical implementation of slide 15's vision
- [Slack Documentation](../slack/) - Team discussions about this presentation

### Slack References
- **December 12, 2025, 11:38 AM** - Steph Hubka shared this presentation
- **January 29, 2026** - Cody Loyd asked how to implement chat termination
- The presentation provided the **WHAT** and **WHY**
- The Slack discussion provided the **HOW**

---

## Figma Link

🔗 **https://www.figma.com/slides/sIetcCDoFyNvhgzqDW8T8Z/Glacier-Alignment---Delivery-Plan**

---

## Key Insights

### Product Vision → Technical Implementation

1. **Product Vision (This Presentation)**
   - Slide 15 defines WHAT chat termination clarity should do
   - Explains WHY it matters for business

2. **Technical Question (Slack, Jan 29)**
   - Cody Loyd asks HOW to detect closed conversations
   - River Ginther explains `CaseDetails` event

3. **Implementation (WEB-4723)**
   - Lenny L. Miller implements the vision
   - Uses `CaseDetails` event as data source
   - Delivers UX described in slide 15

### The Full Story

```
Dec 11, 2025  → Presentation created (product vision)
Dec 12, 2025  → Shared in #glacier-working-group
Jan 29, 2026  → Cody asks: "How does this work technically?"
Jan 29, 2026  → River answers: "CaseDetails event"
Jan 29, 2026  → Cody assigns: "@Lenny L. Miller on this project"
Feb 3, 2026   → This documentation created
```

---

## Theme: Intentional and Trustworthy

**From Slide 5:**
> "This milestone is about making chat feel intentional and trustworthy."

All four Milestone #1 features contribute to this goal:
- **Typing indicator** → Shows agent activity
- **Availability controls** → Manages expectations
- **Termination clarity** → Eliminates ambiguity ⭐
- **Transcript copy** → Enables follow-up

---

## Business Context

**Client:** Glacier Bank
- 17-18 financial institution brands
- Guaranty acquisition
- Currently uses Glia for chat
- Needs competitive live chat experience

**Strategic Direction:**
- NOT integrating with Glia
- Enhancing Conversations product
- Live chat for urgent, messaging for non-urgent
- February 2026 milestone delivery

---

## Document Status

**Created:** February 3, 2026
**By:** Lenny L. Miller
**Coverage:** Complete (all 23 slides reviewed)
**Focus:** Slide 15 (Chat termination clarity) for WEB-4723

---

**Last Updated:** February 3, 2026
