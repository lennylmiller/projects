---
description: Set up work environment for a ticket by symlinking .claude folder
argument-hint: <ticket-id>
---

# /ticket-work - Start Working on Ticket

Sets up the work environment for a ticket by symlinking the ticket's .claude folder to the current directory, enabling Claude to use ticket-specific context.

## Arguments

- **TICKET_ID** (required) - Ticket identifier (e.g., WEB-5000)

## Your Task

Execute the following steps:

### 1. Validate Current Directory
- Check that current directory is NOT inside `~/projects/tickets/`
- This command should be run from actual code repositories (e.g., `/Users/LenMiller/code/banno/banno-online`)
- If user is in projects/tickets/, warn them and suggest navigating to code directory

### 2. Verify Ticket Exists
```bash
# Check if ticket folder exists
if [ ! -d ~/projects/tickets/{TICKET_ID} ]; then
  echo "❌ Ticket {TICKET_ID} not found"
  echo "Create it with: /ticket-create {TICKET_ID}"
  exit 1
fi
```

### 3. Check for Existing .claude Symlink
```bash
# If .claude already exists in current directory
if [ -L .claude ]; then
  CURRENT_TARGET=$(readlink .claude)
  echo "⚠️  .claude symlink already exists"
  echo "   Currently points to: $CURRENT_TARGET"
  echo ""
  echo "Remove and replace with {TICKET_ID}? (y/n)"
  # Wait for user confirmation before proceeding
fi
```

### 4. Remove Old Symlink (if user confirms)
```bash
rm .claude
```

### 5. Create New Symlink
```bash
ln -s ~/projects/tickets/{TICKET_ID}/.claude .claude
```

### 6. Validate .gitignore
Check if `.gitignore` in current directory contains `.claude`:
```bash
if ! grep -q "^\.claude$" .gitignore 2>/dev/null; then
  echo "⚠️  .claude is not in .gitignore"
  echo "   Add it to prevent committing AI artifacts to work repo"
  echo ""
  echo "Add .claude to .gitignore? (y/n)"
  # If yes, append to .gitignore
fi
```

### 7. Update MANIFEST.md
Update the ticket's MANIFEST.md:
- Set `last_active: {current_timestamp}`
- If this is first time working, set `status: active`
- Increment work session count

### 8. Display Summary
```
✓ Work environment set up for {TICKET_ID}

Current directory: {pwd}
Claude context: ~/projects/tickets/{TICKET_ID}/.claude/
Status: Active

You can now start Claude and it will use ticket-specific context.

Available workflows:
  /feature-docs {FEATURE} {ENHANCEMENT} {TICKET_ID}
  /ticket-list (see all tickets)
  /ticket-anchor "checkpoint-name" (create git anchor)
```

## Context Switching Example

```bash
# Currently working on WEB-4718
cd /Users/LenMiller/code/banno/banno-online
ls -la .claude  # → points to ~/projects/tickets/WEB-4718/.claude

# Switch to different ticket
/ticket-work WEB-5000
# Removes old symlink, creates new one

ls -la .claude  # → now points to ~/projects/tickets/WEB-5000/.claude
```

## Notes

- **Important**: This command MUST be run from your actual code directory, not from ~/projects/tickets/
- The symlink allows Claude to read/write plans and conversations to the ticket folder
- Corporate repos can ignore .claude via .gitignore (no AI artifacts committed)
- Switching tickets is as simple as running this command with a different ticket ID
- The ticket's .claude folder remains in ~/projects/ (never in corporate repos)
- All Claude Code features (plans, conversations, artifacts) automatically use the symlinked folder
