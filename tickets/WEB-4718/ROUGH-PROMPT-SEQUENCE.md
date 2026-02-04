# Magic links explanation and usage
_Exported on 2/2/2026 at 12:46:13 PST from Cursor (2.4.27)_

---

**User**

Please teach me what magic links are, how they are used by the user of our product, and how cn I begin to understand.

---

**Cursor**

I'd be happy to help you understand magic links in this codebase. Let me explore the project to find relevant code and documentation.

## What Are Magic Links?

Magic links are **single-use, secure URLs** that authenticate users without requiring them to enter a password. When a user clicks a magic link, they're automatically authenticated because the link contains a JWT (JSON Web Token) that proves their identity.

Think of it like a digital "VIP pass" sent directly to your email or phone — click it once, and you're in.

---

## How Users Experience Magic Links

In Banno Online, magic links appear in **three main scenarios**:

### 1. Organization User Invitation
When an admin invites a new user to join an organization:
1. User receives an email with a special link
2. User clicks the link → taken to the app
3. If 2FA is required, they verify via SMS/call
4. User creates their username and password
5. Account is ready to use

### 2. Account Recovery (Forgot Password)
When a user forgets their password:
1. User starts recovery process, identifies themselves
2. Magic link is sent to their email or phone
3. User clicks link → identity is verified
4. User sets a new password

### 3. First Admin 2FA Setup
For the first admin of an organization:
1. Admin receives invite via magic link
2. After clicking, must set up two-factor authentication
3. Selects phone number, receives verification code
4. Completes 2FA setup, then creates credentials

---

## Key Files to Start Understanding

Here are the most important files to read, in order of priority:

| File | Purpose |
|------|---------|
| `src/js/api/controllers/magic-link-controller.js` | Core API controller — handles token redemption and 2FA |
| `src/components/bannoweb/enrollment/bannoweb-org-user-invite.js` | UI component you have open — handles the invitation flow |
| `src/js/api/controllers/account-recovery-controller.js` | Handles password recovery magic links |
| `mock-data/magic-link-mock-data.js` | Mock responses — great for understanding data shapes |
| `MAGIC_LINK_CONTROLLER.md` | Documentation on an upcoming API migration |

---

## Quick Technical Overview

**The token flow:**
1. Backend generates a JWT token containing `userId`, `organizationId`, etc.
2. Token is embedded in a URL and sent via email/SMS
3. User clicks link → app extracts token from URL
4. App calls `PUT /v1/institutions/{institutionId}/token/{token}/redeem`
5. Backend validates token, returns user info, sets session cookie
6. User is now authenticated

**Key API endpoints:**
- `PUT /v1/institutions/{institutionId}/token/{token}/redeem` — Redeem invitation token
- `POST /recovery/magic-links/send` — Send recovery link
- `POST /recovery/magic-links/{recoveryLinkId}/verify` — Verify recovery link

---

## Where to Start Learning

I'd recommend this learning path:

1. **Read the component you have open** — `bannoweb-org-user-invite.js` shows the full user invitation flow
2. **Read the magic-link controller** — see how API calls are structured
3. **Look at the mock data** — understand what the API returns
4. **Read the migration doc** — `MAGIC_LINK_CONTROLLER.md` explains upcoming changes

Would you like me to walk you through any specific file or explain a particular part of the flow in more detail?

---

**User**

Ahhh, I see.. Please create a document that shows a sequence diagram using mermaid, and color for clarity, 

---

**Cursor**

Let me read the key files to create an accurate sequence diagram.

Now I have all the details I need. Let me create a comprehensive Mermaid sequence diagram document.

I've created a comprehensive Mermaid sequence diagram document at `docs/magic-link-sequence-diagrams.md`. Here's what it includes:

## Document Contents

**4 Sequence Diagrams with color-coded sections:**

1. **Organization User Invitation (Happy Path)**
   - Blue: Invitation generation
   - Orange: User clicks link
   - Green: Token redemption
   - Purple: Credential setup

2. **Invitation with 2FA Required**
   - Shows the redirect to 2FA landing page
   - Phone selection, code sending, and verification steps

3. **Account Recovery via Magic Link**
   - User identification
   - Delivery channel selection (email/SMS)
   - Magic link verification
   - Password reset

4. **Error Handling Scenarios**
   - Red: Expired/invalid token (401)
   - Orange: Wrong 2FA code (403)
   - Green: Server errors (500)

**Plus reference tables for:**
- All API endpoints
- Key source files
- Event types from `MagicLinkController`

## Viewing the Diagrams

To render the Mermaid diagrams, you can:
- **GitHub/GitLab**: Push the file and view it in the web UI (they render Mermaid natively)
- **VS Code**: Install the "Markdown Preview Mermaid Support" extension
- **Mermaid Live Editor**: Paste diagrams at [mermaid.live](https://mermaid.live)

Would you like me to adjust the diagrams, add more detail to any particular flow, or create additional visualizations?

---

**User**

Can You see what I have open in the browser window?

---

**Cursor**

I have access to browser tools via MCP. Let me check what you have open.

It looks like the browser integration tools aren't currently connected or available in this session. The MCP browser servers are listed in the configuration, but they don't appear to have active tool connections right now.

To enable browser viewing, you would typically need to:
1. Have the Cursor browser extension installed and running, or
2. Have an active browser tab connected to the Cursor IDE browser integration

**What I can see:** I can see your IDE state — which files you have open (the sequence diagram document `magic-link-sequence-diagrams.md` is currently focused).

**What I cannot see right now:** Your external browser tabs or windows.

If you're trying to preview the Mermaid diagrams, would you like me to suggest a way to view them? Or if there's something specific in your browser you'd like to discuss, feel free to share a screenshot or describe what you're looking at.

---

**User**

can you undo the commit you just did?

---

**Cursor**

I didn't make any commits in this conversation — I only created the file `docs/magic-link-sequence-diagrams.md`, but I never staged or committed it.

Let me check the current git status to confirm.

As you can see, there are no commits to undo — the branch has only untracked files and nothing has been committed.

Interestingly, the file I created (`docs/magic-link-sequence-diagrams.md`) isn't showing in the git status. Let me check if it exists.

The file exists. It may not show in `git status` because the git repo root is at `/Users/LenMiller/code/banno/platform-ux` (the parent directory), not `banno-online`. Let me check from the repo root.

The file already exists in the git index — it was already part of the repository before I modified it. Let me check if there are any uncommitted changes to it.

This is interesting. Git shows the file as "deleted" from the working tree, but it exists on disk. This seems like there might be a file system sync issue or the sandbox created the file in a way git doesn't see.

Let me verify the file's actual state.

The file no longer exists. It seems like either:
1. You deleted it manually, or
2. The sandbox write created a temporary version that didn't persist

**To summarize what happened:**
- I **did not make any git commits** in this conversation
- The file `docs/magic-link-sequence-diagrams.md` already existed in the repo (it was tracked in git)
- I wrote new content to it, but it appears that change may not have persisted
- The current git status shows the file as deleted from the working tree

**Would you like me to:**
1. Restore the file from git (run `git checkout -- projects/banno-online/docs/magic-link-sequence-diagrams.md` to get the original version back), or
2. Recreate the sequence diagram document with the content I generated?

Let me know which you prefer.

---

**User**

what were we working on before this?

---

**Cursor**

Here's what we covered in this conversation:

1. **You asked me to teach you about magic links** — what they are, how users experience them, and how to understand the codebase

2. **I explored the codebase** and explained:
   - Magic links are single-use JWT tokens for passwordless authentication
   - Three main use cases: org user invitations, first admin 2FA setup, and account recovery
   - Key files: `magic-link-controller.js`, `bannoweb-org-user-invite.js`, `account-recovery-controller.js`

3. **You asked me to create a Mermaid sequence diagram document** with color-coded flows

4. **I created `magic-link-sequence-diagrams.md`** with 4 diagrams:
   - Flow 1: Organization User Invitation (happy path)
   - Flow 2: Invitation with 2FA required
   - Flow 3: Account Recovery via magic link
   - Flow 4: Error handling scenarios

I see the file now exists at `/Users/LenMiller/code/banno/platform-ux/projects/banno-online/magic-link-sequence-diagrams.md` (in the project root, not in `docs/`). It looks like you may have moved or recreated it there.

Would you like to continue learning about magic links, or is there something specific in the diagrams you'd like me to expand on?

---

**User**

Please study and review the changes being made to the redeem, and help me create a plan to 

---

**Cursor**

I can see you're looking at a GitHub Pull Request titled "Add new magic-link-service redeem endpoints". Let me study the existing documentation and codebase to understand the changes, then help you create a plan.

I can see the PR "Add new magic-link-service redeem endpoints" and I've reviewed the detailed migration plan in `MAGIC_LINK_CONTROLLER.md`. 

The migration involves changing the redeem endpoint from:
- **Current**: `PUT /v1/institutions/{institutionId}/token/{token}/redeem`
- **New**: `PUT /v1/institutions/{institutionId}/users/{userId}/redeem?token={token}`

The key change is extracting `userId` from the JWT token before the API call.

Your question was cut off. Could you clarify what you'd like to plan?

Let me gather more details about the files that need to be updated.

Now I have all the information needed. Let me create the implementation plan.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

I'll implement the migration plan step by step. Let me start with the first task.

Now I'll update the magic-link-controller.js with the new import and modified method.

Now I need to update the tests. I'll:
1. Enable the tests by changing `xdescribe` to `describe`
2. Create a valid JWT token for testing
3. Update the test expectations to match the new response format with userId
4. Add a test for invalid token format

Let me check for linter errors on the files I've edited.

All tasks are complete. Here's a summary of the changes made:

## Summary of Changes

### 1. Created JWT Decode Utility
**New file**: `src/js/util/magic-link-token.js`
- Added `decodeMagicLinkToken()` function that extracts `userId` from a JWT token
- Includes validation for token format and error handling

### 2. Updated Magic Link Controller
**File**: `src/js/api/controllers/magic-link-controller.js`
- Added import for `decodeMagicLinkToken`
- Modified `redeemMagicLinkToken()` to:
  - Decode the JWT token to extract `userId`
  - Use the new endpoint format: `/v1/institutions/{institutionId}/users/{userId}/redeem?token={token}`
  - Handle token decode errors with `REDEEM_ERROR` event
  - Ensure `userId` is included in the response

### 3. Updated User Management Controller
**File**: `src/js/api/controllers/user-management-controller.js`
- Added import for `decodeMagicLinkToken`
- Modified `redeemMagicLinkToken()` with the same changes as above

### 4. Updated Mock Data
**Files**: 
- `mock-data/magic-link-mock-data.js`
- `mock-data/user-management-mock-data.js`

Updated regex patterns from:
```javascript
/v0\/institutions\/([-a-fA-F0-9]{36})\/token\/.*\/redeem/
```
to:
```javascript
/v1\/institutions\/([-a-fA-F0-9]{36})\/users\/([-a-fA-F0-9]{36})\/redeem/
```

### 5. Updated Tests
**File**: `test/unit/magic-link-controller-spec.js`
- Changed `xdescribe` to `describe` to enable tests
- Added valid JWT token for testing
- Added test for new URL format with `userId` in path
- Added test for invalid token format handling
- Updated existing tests to use valid JWT tokens

---

**User**

Ok, regarding this document, this was done to represent how things worked prior to our changes to the new api end point, 

I would like to have the alternate path on the same sequence diagram, does something like that sound possible? I want to be able to see in the sequence diagram what changes, and then following that I want to have other uml diagrams, think in terms of zooming in in this case we clicke it on one of the sequence diagream action pipes and that takes us to an activity diagram, or if you click on one of the objecs in the swim lanes it takes you to a static uml model .. and we can also go one step higher in abstraction and think in terms of starting with a UML Use Case diagram, please do some research, I like the idea us starting our analysis as if this work has not been done, and we want to first document with UML Use Case, what user inter

Plese research and recommend something...


let mekno

---

**Cursor**

This is a great idea - creating a hierarchical UML documentation suite that allows you to understand the system at different levels of abstraction. Let me research what's possible with Mermaid and recommend an approach.

I now have a good understanding of what you're looking for and what's possible. Let me create a recommendation for a comprehensive UML documentation suite.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

I'll implement the UML Documentation Suite plan. Let me start by reading the current document and then work through each todo.

Now I'll update the document to add the Use Case diagram section at the beginning. I'll restructure the header and add the new content.

Now I'll update Flow 1 to show the before/after API endpoint comparison using alt/else blocks.

Now I need to add the Activity diagrams section. Let me find the right place to insert them after Flow 4.

Now I'll add the Activity diagrams section after Flow 4 and before the API Endpoints Summary.

The document is looking good. Let me add the new utility file to the Key Files Reference and mark the tasks as complete.

All tasks are complete. Let me verify the document is well-formed.

All tasks are complete. Here's a summary of the UML Documentation Suite implementation:

## Summary of Changes to `magic-link-sequence-diagrams.md`

### 1. Document Structure Overhaul
- Renamed from "Magic Link Sequence Diagrams" to "Magic Link UML Documentation Suite"
- Added a comprehensive **Table of Contents** with anchor links for navigation between all diagram levels

### 2. Level 1: Use Case Diagram (NEW)
- Added a flowchart-based Use Case diagram showing:
  - **Actors**: Admin, End User, Email Service, Consumer API
  - **Use Cases**: Invite Org User, Redeem Token, Setup 2FA, Recover Account, Reset Password
- Added tables describing each actor and use case

### 3. Level 2: Sequence Diagrams (UPDATED)
- **Flow 1** now shows the **before/after API migration** using `alt`/`else` blocks:
  - DEPRECATED: Legacy endpoint with token in path
  - CURRENT: New endpoint with userId in path (extracted from JWT)
- Added an API Migration Summary table

### 4. Level 3: Activity Diagrams (NEW)
- **Token Decoding Process**: Detailed flowchart of JWT validation and userId extraction
- **Credential Validation Flow**: Shows the debounced real-time validation process
- **2FA Verification Flow**: Complete flow from phone selection to code verification

### 5. Level 4: Class Diagrams (NEW)
- **MagicLinkController**: Shows the class with its methods, the EventType enum, and the new `decodeMagicLinkToken` utility
- **Controllers Overview**: Shows the inheritance hierarchy and relationships between all controllers

### 6. Reference Section
- Updated API Endpoints table to show both CURRENT and DEPRECATED endpoints
- Added the new `src/js/util/magic-link-token.js` utility file to Key Files Reference

---

**User**

Please use plantUML and redo all the diagrams in all the markdown documents

---

**Cursor**

I'll convert all the Mermaid diagrams to PlantUML format. Let me first read the documents to identify all diagrams that need conversion.

I found 11 Mermaid diagrams in `magic-link-sequence-diagrams.md`. I'll now convert all of them to PlantUML format. This is a significant rewrite, so I'll create the complete updated document.

Now let me check if `MAGIC_LINK_CONTROLLER.md` has any diagrams that need conversion.

I've converted all 11 Mermaid diagrams to PlantUML format in `magic-link-sequence-diagrams.md`. No other markdown files in the project contained diagrams.

## Summary of Conversions

| Diagram | Type | PlantUML Syntax Used |
|---------|------|---------------------|
| Document Hierarchy | Flowchart | `@startuml` with rectangles and arrows |
| Use Case Diagram | Use Case | Native `usecase` and `actor` keywords |
| Flow 1: Org User Invitation | Sequence | `@startuml` with participants and groups |
| Flow 2: 2FA Setup | Sequence | `@startuml` with `==` section dividers |
| Flow 3: Account Recovery | Sequence | `@startuml` with participants |
| Flow 4: Error Handling | Sequence | `@startuml` with `==` scenario dividers |
| Token Decoding Process | Activity | `start`/`stop`, `if`/`else`, `:action;` |
| Credential Validation Flow | Activity | `switch`/`case`, `if`/`else` |
| 2FA Verification Flow | Activity | `switch`/`case`, `repeat`/`while` |
| MagicLinkController | Class | `class`, `enum`, relationships |
| Controllers Overview | Class | `abstract class`, inheritance |

## Key PlantUML Differences from Mermaid

- Uses `@startuml` / `@enduml` instead of triple backticks with `mermaid`
- Sequence diagrams use `->` for solid arrows, `-->` for dashed
- Groups use `group #Color` instead of `rect rgb()`
- Activity diagrams use `:action;` syntax instead of bracket nodes
- Class diagrams use standard UML notation with `+`/`-`/`#` visibility
- Native support for use case diagrams with `usecase` keyword

## Viewing the Diagrams

To render PlantUML diagrams:
- **VS Code**: Install "PlantUML" extension by jebbs
- **IntelliJ/WebStorm**: Built-in PlantUML support
- **Online**: [PlantText](https://www.planttext.com/) or [PlantUML Server](http://www.plantuml.com/plantuml/)
- **GitHub**: Use a PlantUML proxy or GitHub Actions to render

---

**User**

how do I get plantuml running in vscode

---

**Cursor**

Here's how to get PlantUML running in VS Code:

## Quick Setup

### 1. Install the Extension

1. Open VS Code
2. Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux) to open Extensions
3. Search for **"PlantUML"** by jebbs
4. Click **Install**

### 2. Install Java (Required)

PlantUML requires Java to render diagrams locally:

```bash
# Mac (with Homebrew)
brew install openjdk

# Or check if you already have it
java -version
```

### 3. Install Graphviz (Required for some diagrams)

```bash
# Mac
brew install graphviz

# Ubuntu/Debian
sudo apt install graphviz
```

### 4. Preview Diagrams

Once installed, you can preview PlantUML diagrams:

- **Preview current diagram**: `Alt+D` (or `Option+D` on Mac)
- **Or**: Right-click in the editor → "Preview Current Diagram"
- **Or**: Open Command Palette (`Cmd+Shift+P`) → "PlantUML: Preview Current Diagram"

## Alternative: Use PlantUML Server (No Java Required)

If you don't want to install Java locally, configure the extension to use an online server:

1. Open VS Code Settings (`Cmd+,`)
2. Search for `plantuml.server`
3. Set it to: `https://www.plantuml.com/plantuml`
4. Search for `plantuml.render` and set it to `PlantUMLServer`

## Test It

Create a test file `test.puml` or open your markdown file and put your cursor inside a `plantuml` code block, then press `Alt+D` to preview.

Would you like me to help troubleshoot if you run into any issues?

---

**User**

I really like the sequence diagrams showing old and new side by side.. 

Please analyze to determine if the other digrams coud do something similar... 

---

**Cursor**

Let me analyze the current diagrams to identify which ones could benefit from showing old vs new comparisons.

## Analysis: Which Diagrams Could Show Old vs New Comparisons

Based on the API migration (old endpoint with token in path → new endpoint with userId in path), here's my analysis:

| Diagram | Affected by Migration? | Recommendation |
|---------|----------------------|----------------|
| **Document Hierarchy** | No | No change - meta-documentation |
| **Use Case Diagram** | No | No change - use cases don't change, only implementation |
| **Flow 1: Org User Invitation** | Yes | Already has comparison ✓ |
| **Flow 2: 2FA Setup** | **YES** | Line 240 uses OLD endpoint - should add comparison |
| **Flow 3: Account Recovery** | No | Uses different endpoints (`/recovery/...`) not in this migration |
| **Flow 4: Error Handling** | **YES** | Uses OLD endpoint + missing new error case for JWT decode failure |
| **Activity: Token Decoding** | **YES** | This is entirely NEW - could show "before: nothing" |
| **Activity: Credential Validation** | No | Form validation unchanged |
| **Activity: 2FA Verification** | No | 2FA endpoints unchanged |
| **Class: MagicLinkController** | **YES** | Could highlight NEW `decodeMagicLinkToken` dependency |
| **Class: Controllers Overview** | **YES** | Could highlight NEW utility relationship |

---

## Detailed Recommendations

### 1. Flow 2: 2FA Setup (High Value)
Currently shows only the old endpoint. Should add the same old/new comparison as Flow 1:

```
Before: InviteComp -> API : PUT /v1/institutions/{id}/token/{token}/redeem
After:  InviteComp -> InviteComp : decodeMagicLinkToken(token)
        InviteComp -> API : PUT /v1/institutions/{id}/users/{userId}/redeem?token=...
```

### 2. Flow 4: Error Handling (High Value)
Should add a **new error scenario** for JWT decode failure:

```
== Scenario D: Invalid JWT Format (NEW) ==
User -> Component : Click magic link with malformed token
Component -> Controller : redeemMagicLinkToken(token)
Controller -> Controller : decodeMagicLinkToken(token)
Controller --> Component : REDEEM_ERROR (400 - Invalid token format)
Component -> User : "Invitation link failed"
```

### 3. Class Diagrams (Medium Value)
Could show a before/after highlighting what was **added**:
- Before: No `decodeMagicLinkToken` utility
- After: New utility + new dependency arrows

### 4. Activity: Token Decoding (Low Value)
This is entirely new functionality. Could add a simple note:
> "**Note:** This process is NEW in the current implementation. The legacy endpoint did not require client-side token decoding."

---

Would you like me to update these diagrams to add the old/new comparisons?

---

**User**

Yes please

---

**Cursor**

I'll update the diagrams to add old/new comparisons. Let me make these changes.

All diagrams have been updated with old/new comparisons. Here's a summary:

## Updated Diagrams

### 1. Flow 2: 2FA Setup
- Added a `Controller` participant to show the token decoding step
- Added old/new comparison groups for the token redemption step:
  - **DEPRECATED (Pink)**: Direct API call with token in path
  - **CURRENT (Green)**: JWT decode → API call with userId in path

### 2. Flow 4: Error Handling
- Updated **Scenario A** to show both old and new error paths for expired/invalid tokens
- Added **Scenario D: Invalid JWT Format (NEW)** - a new error scenario that only exists in the current implementation (client-side validation failure before API call)

### 3. Activity: Token Decoding Process
- Added a migration note explaining this is entirely new functionality
- Added a `partition` showing the legacy approach (no client-side decoding) vs the current approach (full JWT decode flow)
- Added a title indicating this is new in the current implementation

### 4. Class: MagicLinkController
- Added a before/after comparison table
- Split the diagram into two packages:
  - **LEGACY Structure (Pink)**: Controller with no token decoding dependency
  - **CURRENT Structure (Green)**: Controller with the new `decodeMagicLinkToken` utility
- Added `<<NEW>>` stereotype to highlight the new utility and relationship
- Added a note showing the new file path

### 5. Class: Controllers Overview
- Added a before/after comparison table
- Wrapped the new utility in a highlighted package
- Added `<<NEW>>` stereotypes on the dependency arrows
- Added notes clarifying that `AccountRecoveryController` is unchanged and explaining the migration impact

---

**User**

Please write me a jira ticket Title and Description that would describe this work, so not in great details but for a Jira Ticket and enough clarity to ensure you can act on it... 

---

**Cursor**

## Jira Ticket

---

**Title:** Migrate magic-link-service redeem endpoints to new API format with client-side JWT decoding

---

**Description:**

### Summary
Migrate the magic link token redemption flow from the deprecated endpoint format to the new endpoint format that requires `userId` in the URL path. This change requires decoding the JWT token client-side to extract the `userId` before making the API call.

### Background
The backend team is deprecating the current redeem endpoints in favor of new endpoints that require `userId` as a path parameter. The token (which is a JWT) will be moved to a query parameter.

### API Changes
| | Deprecated | New |
|---|---|---|
| **Endpoint** | `PUT /v1/institutions/{id}/token/{token}/redeem` | `PUT /v1/institutions/{id}/users/{userId}/redeem?token={token}` |
| **userId source** | Returned in API response | Decoded from JWT client-side |

### Scope
- [ ] Create new utility function to decode JWT tokens and extract `userId`
- [ ] Update `MagicLinkController.redeemMagicLinkToken()` to use new endpoint
- [ ] Update `UserManagementController.redeemMagicLinkToken()` to use new endpoint
- [ ] Update mock data to match new endpoint format
- [ ] Update/enable unit tests with new expectations
- [ ] Add error handling for invalid JWT token format

### Acceptance Criteria
- Token redemption works with the new endpoint format
- Invalid/malformed JWT tokens are handled gracefully with appropriate error messaging
- Existing flows (org user invite, 2FA setup) continue to work
- Unit tests pass

### Technical Notes
- JWT decode pattern already exists in `src/js/util/new-device-jwt.js` and can be reused
- Response structure remains the same; ensure `userId` is still available to consuming components

---

Would you like me to adjust the scope, add story points considerations, or modify the format for your team's Jira template?

---

**User**

From a planning and estimating point of view, take a look at the Use cases , ths small change touches a number of paths... does this add any risk? should we add something like this to the jira ticket

---

**Cursor**

Let me analyze the use cases and the paths affected by this change.

Great question. Let me analyze the risk based on the use case relationships and affected paths.

## Risk Analysis

### Use Case Impact Map

Looking at the use case relationships:

```
UC1 (Invite Org User) ──includes──► UC2 (Redeem Token) ──extends──► UC3 (Setup 2FA)
                                          │
                                          ▼
                                    THIS CHANGES
```

| Use Case | Affected? | Why |
|----------|-----------|-----|
| **UC1: Invite Organization User** | YES | Includes UC2 |
| **UC2: Redeem Magic Link Token** | **YES - PRIMARY** | Direct change |
| **UC3: Setup First Admin 2FA** | YES | Extends UC2 |
| **UC4: Recover Account** | No | Uses different endpoints |
| **UC5: Reset Password** | No | Uses different endpoints |

### Paths Affected

| Flow | User Journey | Risk Level |
|------|--------------|------------|
| **Flow 1** | New user invitation → token redemption → credential setup | **HIGH** - Primary onboarding path |
| **Flow 2** | First admin invitation → token redemption → 2FA → credentials | **HIGH** - First admin can't be created if broken |
| **Flow 1+2 combined** | Admin invites first admin → full 2FA flow | **HIGH** - Critical path for new org setup |

### Risk Factors

1. **Multiple Controllers**: Change affects 2 controllers (`MagicLinkController`, `UserManagementController`) that must stay in sync
2. **Critical User Journey**: Blocks new user onboarding if broken
3. **No Partial Rollout**: All paths change simultaneously - no feature flag protection
4. **Client-Side Validation Added**: New failure mode (invalid JWT) that didn't exist before
5. **Dependency on Token Format**: If backend changes JWT structure, client decode fails

---

## Recommended Addition to Jira Ticket

Here's a risk section to add:

---

### Risk Assessment

**Overall Risk: MEDIUM-HIGH**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JWT decode fails on valid tokens | Low | High | Test with real tokens from all environments |
| Backend JWT payload structure differs from expected | Medium | High | Confirm claim name (`userId` vs `sub`) with backend team |
| Change breaks new user onboarding | Low | Critical | Comprehensive E2E testing of full invite flow |
| Change breaks first admin 2FA setup | Low | Critical | Test first admin flow specifically |
| Two controllers get out of sync | Low | Medium | Both use shared utility function |

### Testing Requirements

Due to the number of paths affected, testing should cover:

- [ ] **Flow 1**: Standard org user invitation (happy path)
- [ ] **Flow 2**: First admin with 2FA required
- [ ] **Error paths**: Expired token, invalid JWT format, malformed token
- [ ] **Both controllers**: Verify `MagicLinkController` and `UserManagementController` both work
- [ ] **Cross-environment**: Test with tokens from dev, staging, and prod-like environments

### Rollback Plan

If issues are discovered post-deployment:
1. Revert controller changes to use legacy endpoint
2. Backend must maintain legacy endpoint until fix is deployed

---

Would you like me to format this as a complete updated Jira ticket, or add anything else to the risk analysis?

---

**User**

No, create a document I can add to the ticket later add the document to the root folder with an appropriate name

---

**Cursor**

Done. I've created the document at:

**`JIRA-magic-link-api-migration.md`**

The document includes:

- **Title and Description** - Ready to paste into Jira
- **Scope** - Checklist of work items
- **Acceptance Criteria** - What "done" looks like
- **Risk Assessment** - Use case impact analysis, risk matrix, and why risk is elevated
- **Testing Requirements** - Unit, integration, and manual testing checklists
- **Rollback Plan** - What to do if issues arise
- **Dependencies** - Backend team coordination needed
- **Files Changed** - Quick reference for code review

