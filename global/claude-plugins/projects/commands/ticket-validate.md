---
description: Validate ticket integrity, symlinks, and diagrams against codebase
argument-hint: <ticket-id>
---

# /ticket-validate - Validate Ticket Integrity

Validates a ticket's structure, symlinks, MANIFEST.md, and optionally validates PlantUML diagrams against the actual codebase.

## Arguments

- **TICKET_ID** (required) - Ticket identifier (e.g., WEB-5000)

## Your Task

Execute the following validation steps:

### 1. Check Ticket Exists
```bash
if [ ! -d ~/projects/tickets/{TICKET_ID} ]; then
  echo "❌ Ticket {TICKET_ID} not found"
  exit 1
fi
```

### 2. Validate Directory Structure
Check for required files and directories:
```
✓ MANIFEST.md exists
✓ PREAMBLE.md exists
✓ REQUIREMENTS.md exists
✓ .claude/ directory exists
✓ .claude/plans/ directory exists
✓ .claude/conversations/ directory exists
```

### 3. Validate MANIFEST.md
Parse and validate MANIFEST.md:
- ✓ YAML frontmatter is valid
- ✓ Required fields present: `ticket`, `status`, `created`, `projects`
- ✓ Status is valid: `pending`, `active`, or `archived`
- ✓ Date formats are valid ISO 8601
- ⚠️ Warning if `last_active` is missing but status is `active`

### 4. Validate Project Symlinks
For each project listed in MANIFEST.md `projects` field:
1. Find project directory in ~/projects/{jha,personal}/
2. Check if symlink exists at `~/projects/{area}/{project}/tickets/{TICKET_ID}`
3. Verify symlink target is `~/projects/tickets/{TICKET_ID}`
4. Report broken symlinks

**Example output:**
```
Project Symlinks:
  ✓ jha/banno-online/tickets/WEB-5000 → ~/projects/tickets/WEB-5000
  ✓ jha/web-server/tickets/WEB-5000 → ~/projects/tickets/WEB-5000
```

### 5. Check for Orphaned .claude Symlinks
Search common code locations for .claude symlinks pointing to this ticket:
```bash
# Check if any .claude symlinks point to this ticket
find /Users/LenMiller/code -name ".claude" -type l -exec readlink {} \; | grep {TICKET_ID}
```

**Example output:**
```
.claude Symlinks:
  ⚠️ /Users/LenMiller/code/banno/banno-online/.claude → {TICKET_ID}
     (Active symlink in code directory)
```

### 6. Validate Diagrams Against Codebase (Optional Deep Validation)
If any UML documentation files exist (e.g., `*-uml.md`, `*-sequence-diagrams.md`):

Ask user: "Found UML documentation. Validate diagrams against codebase? (y/n)"

If yes:
1. Extract all file paths mentioned in PlantUML diagrams
2. Extract all API endpoint references
3. Extract all class/function names
4. Validate each reference:
   - File paths: Check if file exists
   - API endpoints: Search codebase for endpoint definitions
   - Classes/functions: Search for class/function declarations

**Example output:**
```
Diagram Validation (from magic-link-sequence-diagrams.md):

Files Referenced (8 total):
  ✓ src/js/util/magic-link-token.js
  ✓ src/js/api/controllers/magic-link-controller.js
  ✓ src/components/bannoweb/enrollment/bannoweb-org-user-invite.js
  ✗ src/js/api/controllers/magic-link-legacy.js (NOT FOUND)

API Endpoints (5 total):
  ✓ PUT /v1/institutions/{id}/users/{userId}/redeem
  ✓ GET /v0/first-admin-2fa/phone-numbers
  ✓ POST /v0/first-admin-2fa/otp
  ⚠️ PUT /v1/institutions/{id}/token/{token}/redeem (DEPRECATED, marked in docs)

Classes/Functions (3 total):
  ✓ MagicLinkController.redeemMagicLinkToken
  ✓ decodeMagicLinkToken
  ✓ UserManagementController.orgUserSaveCreds

Validation: 90% (18/20 references valid)
```

### 7. Count Claude Artifacts
```
Claude Artifacts:
  Plans: {count .claude/plans/*}
  Conversations: {count .claude/conversations/*}
  Total size: {du -sh .claude}
```

### 8. Check for Stale Activity
```bash
# If last_active is more than 7 days ago
if [ "$DAYS_SINCE_ACTIVE" -gt 7 ]; then
  echo "⚠️ Ticket has no activity in $DAYS_SINCE_ACTIVE days"
  echo "   Consider archiving or updating status"
fi
```

### 9. Summary Report
```
━━━ Validation Summary for {TICKET_ID} ━━━

Status: {status_emoji} {status}
Created: {created_date} ({days_ago} days ago)
Last active: {last_active} ({hours_ago} hours ago)

Structure: ✓ All required files present
MANIFEST: ✓ Valid YAML, all fields present
Symlinks: ✓ 2/2 valid project symlinks
Artifacts: 5 plans, 12 conversations (2.4MB)
{if diagrams validated: Diagrams: ✓ 18/20 references valid (90%)}

Health: {95%} (1 warning)

Warnings:
  ⚠️ Diagram references deprecated endpoint (marked in docs)

Recommendations:
  - Update diagram to remove deprecated endpoint reference
  - Consider creating git anchor point for current state
```

## Examples

### Basic validation
```bash
/ticket-validate WEB-5000
```

### With diagram validation
```bash
/ticket-validate WEB-5000
# Prompts: "Validate diagrams? (y/n)"
# Enter: y
# → Full validation including codebase references
```

## Notes

- Basic validation checks file structure and symlinks (fast)
- Deep validation (diagrams) can be slow but catches hallucinations
- Validation helps identify:
  - Broken symlinks (ticket moved but symlinks not updated)
  - Orphaned .claude symlinks (forgot to remove after switching tickets)
  - Stale tickets (no activity in 7+ days)
  - Diagram inaccuracies (file paths, API endpoints that don't exist)
- Use this before archiving tickets to ensure integrity
- Use after major refactors to verify diagrams still match codebase
