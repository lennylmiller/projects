# Projects Plugin for Claude Code

Ticket and project management infrastructure for AI-assisted development workflows with `.claude` folder orchestration.

## Overview

This plugin manages the `~/projects` mono-repo structure, handling tickets, project linking, and Claude context isolation. It works in tandem with the `/feature-docs` plugin to provide a complete workflow from ticket creation to implementation.

## Problem Solved

When working with AI on corporate codebases, you need to:
1. Keep AI artifacts (plans, conversations) OUT of corporate repos
2. Switch between tickets seamlessly without losing context
3. Link tickets to multiple projects
4. Track ticket history and metrics
5. Validate diagrams against actual code

This plugin solves these problems through `.claude` folder symlinks and structured ticket management.

## Architecture

```
~/projects/                          # Mono-repo (version controlled)
├── tickets/                         # Central ticket storage
│   └── WEB-5000/
│       ├── MANIFEST.md             # Machine + human readable metadata
│       ├── PREAMBLE.md             # Discovery notes
│       ├── REQUIREMENTS.md         # Specifications
│       └── .claude/                # AI artifacts (plans, conversations)
│           ├── plans/
│           └── conversations/
├── jha/                            # Work projects
│   └── banno-online/
│       └── tickets/
│           └── WEB-5000 → ../../tickets/WEB-5000  # Symlink
└── global/
    └── templates/                  # Ticket templates

/Users/LenMiller/code/banno/banno-online/  # Corporate repo (NOT version controlled with AI artifacts)
└── .claude → ~/projects/tickets/WEB-5000/.claude  # Symlink (gitignored)
```

## Commands

### /ticket-create
Create a new ticket with optional template and project linking.

```bash
/ticket-create WEB-5000
/ticket-create WEB-5000 --template progressive-learning
/ticket-create WEB-5000 --project banno-online
/ticket-create WEB-5000 --template progressive-learning --project banno-online
```

**What it creates:**
- `~/projects/tickets/WEB-5000/` directory
- MANIFEST.md, PREAMBLE.md, REQUIREMENTS.md
- `.claude/` folder structure
- Symlinks to projects (if specified)

### /ticket-work
Set up work environment by symlinking `.claude` to current directory.

```bash
cd /Users/LenMiller/code/banno/banno-online
/ticket-work WEB-5000
```

**What it does:**
- Creates `.claude` symlink in current directory
- Points to `~/projects/tickets/WEB-5000/.claude/`
- Updates ticket MANIFEST (last_active, status)
- Validates .gitignore

### /ticket-list
List all tickets with status and metrics.

```bash
/ticket-list                        # Active tickets only
/ticket-list --all                  # All tickets
/ticket-list --archived             # Archived only
/ticket-list --project banno-online # Filtered by project
```

**Shows:**
- Ticket status (⚡ active, ⏸️ paused, 💤 stale, ✓ done)
- Last activity time
- Linked projects
- Claude artifact counts

### /ticket-validate
Validate ticket integrity and diagrams.

```bash
/ticket-validate WEB-5000
```

**Checks:**
- Directory structure
- MANIFEST.md validity
- Project symlinks
- Orphaned .claude symlinks
- (Optional) PlantUML diagrams against codebase

### /ticket-anchor
Create git checkpoint with tag.

```bash
/ticket-anchor understanding-complete
/ticket-anchor implementation-done
```

**Creates:**
- Git commit with ticket ID
- Tag: `step/{checkpoint-name}`
- Updates MANIFEST with anchor history

## Workflow Integration

Works seamlessly with `/feature-docs`:

```bash
# 1. Create ticket infrastructure
/ticket-create WEB-5000 --template progressive-learning --project banno-online

# 2. Navigate to code directory
cd /Users/LenMiller/code/banno/banno-online

# 3. Set up work environment
/ticket-work WEB-5000

# 4. Start learning workflow
/feature-docs MagicLinks "API Migration" WEB-5000
  # Phase 1: LEARN ✓
  # Phase 2: DOCUMENT ✓

# 5. Create checkpoint
/ticket-anchor understanding-complete

# 6. Continue workflow
/feature-docs MagicLinks "API Migration" WEB-5000 --phase 3
  # Phase 3: UNDERSTAND ✓
  # Phase 4: PLAN ✓

# 7. Validate diagrams
/ticket-validate WEB-5000

# 8. Implement
/feature-docs MagicLinks "API Migration" WEB-5000 --phase 5

# 9. Final checkpoint
/ticket-anchor implementation-complete

# 10. See all tickets
/ticket-list
```

## Key Benefits

✅ **No AI artifacts in corporate repos** - All `.claude` folders live in `~/projects`
✅ **Easy context switching** - One command to switch tickets
✅ **Cross-ticket analysis** - All tickets in one place
✅ **Pattern identification** - Track what works via metrics
✅ **Clean workspace** - Archive old tickets systematically
✅ **Git integration** - Checkpoint-based workflow
✅ **Validation** - Catch diagram hallucinations

## Installation

### Local Development (Symlink)

```bash
# Symlink to Claude's local plugins directory
ln -s ~/projects/global/claude-plugins/projects ~/.claude/plugins/local/projects

# Restart Claude Code or reload plugins
```

### From GitHub (Future)

```bash
# Add marketplace
/plugin add-marketplace github lennylmiller/projects-marketplace

# Install plugin
/plugin install projects@projects-marketplace
```

## Templates

Templates live in `~/projects/global/templates/` and can be applied during ticket creation:

```bash
/ticket-create WEB-5000 --template progressive-learning
```

**Available templates:**
- `progressive-learning` - UML-based teaching workflow (based on WEB-4718 pattern)
- (Add more templates as patterns emerge)

## MANIFEST.md Format

Each ticket has a MANIFEST.md with YAML frontmatter + Markdown body:

```yaml
---
ticket: WEB-5000
status: active
created: 2026-02-03T20:00:00Z
last_active: 2026-02-03T22:00:00Z
projects:
  - jha/banno-online
conversations: 5
plans: 2
tags: [authentication, api-migration]
anchors:
  - name: understanding-complete
    commit: abc123
    tag: step/understanding-complete
    timestamp: 2026-02-03T21:00:00Z
---

# WEB-5000: Add 2FA Support

## Status
⚡ Active (2 hours ago)

## Projects
- [banno-online](../../jha/banno-online/)

## Claude Artifacts
- Plans: 2
- Conversations: 5
```

## Future Enhancements

- [ ] `/ticket-search <query>` - Search across all ticket conversations
- [ ] `/ticket-report` - Generate metrics and pattern analysis
- [ ] `/ticket-archive <ticket-id>` - Archive completed tickets
- [ ] `/ticket-link <ticket-id> <project>` - Link existing ticket to project
- [ ] Cross-ticket pattern detection ("rock star" identification)
- [ ] Template promotion from successful workflows

## Contributing

This plugin is part of the `~/projects` mono-repo. To contribute:

1. Edit files in `~/projects/global/claude-plugins/projects/`
2. Test via symlink to `~/.claude/plugins/local/`
3. Commit changes to `~/projects` repo

## Author

Len Miller

## License

MIT
