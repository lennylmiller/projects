---
description: Create a new ticket with optional template and project linking
argument-hint: <ticket-id> [--template <name>] [--project <name>]
---

# /ticket-create - Create New Ticket

Creates a new ticket folder with initialized structure, optional template application, and project linking.

## Arguments

Parse the arguments provided:
- **TICKET_ID** (required) - Ticket identifier (e.g., WEB-5000, INA-42)
- **--template** (optional) - Template name (e.g., `progressive-learning`)
- **--project** (optional) - Project to link (e.g., `banno-online`)

## Your Task

Execute the following steps:

### 1. Parse Arguments
Extract TICKET_ID and optional flags from the command arguments.

### 2. Create Ticket Directory
```bash
mkdir -p ~/projects/tickets/{TICKET_ID}
```

### 3. Initialize Core Structure
Create the following files in `~/projects/tickets/{TICKET_ID}/`:

**MANIFEST.md:**
```yaml
---
ticket: {TICKET_ID}
status: pending
created: {current_date}
projects: []
conversations: 0
plans: 0
tags: []
---

# {TICKET_ID}

## Status
⏸️ Pending

## Context
[Add ticket description and links]

## Projects
[Will be populated when linked]

## Claude Artifacts
- Plans: 0
- Conversations: 0
```

**PREAMBLE.md:**
```markdown
# {TICKET_ID} - Preamble

## Initial Context
[Document initial discovery, Slack conversations, stakeholder input]

## Key Questions
[Questions identified during research]

## Related Tickets
[Links to related work]
```

**REQUIREMENTS.md:**
```markdown
# {TICKET_ID} - Requirements

## Overview
- **Ticket**: {TICKET_ID}
- **Created**: {current_date}
- **Status**: Pending

## Business Requirements
[User stories, current vs desired behavior]

## Technical Requirements
[Implementation details, API changes, data model]

## Testing Requirements
[Test scenarios, edge cases]

## Open Questions
[Items requiring clarification]
```

### 4. Initialize .claude Folder
```bash
mkdir -p ~/projects/tickets/{TICKET_ID}/.claude/plans
mkdir -p ~/projects/tickets/{TICKET_ID}/.claude/conversations
```

### 5. Apply Template (if --template specified)
If template flag provided, apply template files from `~/projects/global/templates/{template-name}/`:
- Copy template files to ticket folder
- Merge any template-specific MANIFEST fields
- Add template tag to MANIFEST

### 6. Link to Project (if --project specified)
If project flag provided:
1. Identify project path (search in ~/projects/jha/, ~/projects/personal/)
2. Create symlink: `~/projects/{project-area}/{project-name}/tickets/{TICKET_ID}` → `~/projects/tickets/{TICKET_ID}`
3. Update MANIFEST.md projects list
4. Create or update project's `.project-index.yaml`

### 7. Display Summary
Show the user:
```
✓ Created ticket: {TICKET_ID}
✓ Location: ~/projects/tickets/{TICKET_ID}/
✓ Initialized: MANIFEST.md, PREAMBLE.md, REQUIREMENTS.md, .claude/
{if template: ✓ Applied template: {template-name}}
{if project: ✓ Linked to project: {project-name}}

Next steps:
  cd /Users/LenMiller/code/{project-code-path}
  /ticket-work {TICKET_ID}

Or start with workflow:
  /feature-docs {FEATURE_DOMAIN} {ENHANCEMENT} {TICKET_ID}
```

## Examples

### Basic ticket creation
```bash
/ticket-create WEB-5000
```

### With template
```bash
/ticket-create WEB-5000 --template progressive-learning
```

### With project linking
```bash
/ticket-create WEB-5000 --project banno-online
```

### Full example
```bash
/ticket-create WEB-5000 --template progressive-learning --project banno-online
```

## Notes
- Ticket directory is created at `~/projects/tickets/{TICKET_ID}/`
- Project symlinks maintain bidirectional references
- .claude folder stores all AI artifacts (plans, conversations)
- MANIFEST.md is machine-readable (YAML frontmatter) and human-readable (Markdown body)
