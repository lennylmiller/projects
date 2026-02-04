---
description: List all tickets with status, activity, and metrics
argument-hint: [--active|--archived|--all] [--project <name>]
---

# /ticket-list - List Tickets

Displays all tickets with their status, last activity, linked projects, and Claude usage metrics.

## Arguments

- **--active** (optional) - Show only active tickets (default)
- **--archived** (optional) - Show only archived tickets
- **--all** (optional) - Show all tickets
- **--project <name>** (optional) - Filter by project (e.g., `--project banno-online`)

## Your Task

### 1. Scan Ticket Directories
```bash
# Find all ticket folders
find ~/projects/tickets -maxdepth 1 -type d -name "*-*" | sort
```

### 2. Parse MANIFEST.md for Each Ticket
For each ticket folder, read `MANIFEST.md` and extract:
- `ticket` - Ticket ID
- `status` - Current status (pending, active, archived)
- `created` - Creation date
- `last_active` - Last activity timestamp
- `projects` - Linked projects list
- `conversations` - Number of conversations
- `plans` - Number of plans
- `tags` - Tags array

### 3. Calculate Metrics
For each ticket:
- Count files in `.claude/plans/`
- Count files in `.claude/conversations/`
- Calculate days since last activity
- Determine status emoji:
  - `⚡` Active (last_active < 1 day ago)
  - `⏸️` Paused (last_active 1-7 days ago)
  - `💤` Stale (last_active > 7 days ago)
  - `✓` Completed (status = archived)

### 4. Apply Filters
- If `--active`: Only show tickets with status != archived
- If `--archived`: Only show tickets with status = archived
- If `--all`: Show all tickets
- If `--project`: Only show tickets linked to specified project

### 5. Display Results

**Format:**
```
Active Tickets (3):
  WEB-5000  Add 2FA support              banno-online     ⚡ Active   (2h ago)
  WEB-4723  Glacier Conversation         banno-online     ⏸️ Paused   (1d ago)
  WEB-4718  Magic Link Migration         web-server       ⏸️ Paused   (3d ago)

Archived (1):
  WEB-4464  E2E Testing                  platform-ux      ✓ Done     (7d ago)

Stats:
  3 active, 1 archived
  2 projects involved (banno-online, web-server, platform-ux)
  Claude conversations: 47
  Claude plans: 12

Current directory: {pwd}
Active .claude symlink: {readlink .claude if exists, else "None"}
```

### 6. Show Quick Actions
```
Quick actions:
  /ticket-work {TICKET_ID}        - Switch to ticket
  /ticket-create {TICKET_ID}      - Create new ticket
  /ticket-validate {TICKET_ID}    - Validate ticket integrity
```

## Display Examples

### Default (active only)
```bash
/ticket-list
```

### All tickets
```bash
/ticket-list --all
```

### Filtered by project
```bash
/ticket-list --project banno-online
```

### Archived tickets
```bash
/ticket-list --archived
```

## Notes

- Default view shows only active tickets (status != archived)
- Status emoji indicates activity level (⚡ active, ⏸️ paused, 💤 stale, ✓ done)
- Last activity time is human-readable (e.g., "2h ago", "3d ago")
- Stats summary helps identify patterns (which projects get most tickets, Claude usage)
- Quick actions at bottom for common next steps
- Shows current .claude symlink to help with context awareness
