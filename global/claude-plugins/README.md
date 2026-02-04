# Claude Code Plugins for ~/projects

Custom Claude Code plugins that implement AI-assisted development workflows for the `~/projects` mono-repo.

## Plugins

### 1. **projects** - Ticket Management Infrastructure
Core infrastructure for managing tickets, projects, and `.claude` folder orchestration.

**Commands:**
- `/ticket-create` - Create new ticket with template and project linking
- `/ticket-work` - Set up work environment (symlink .claude folder)
- `/ticket-list` - List all tickets with status and metrics
- `/ticket-validate` - Validate ticket integrity and diagrams
- `/ticket-anchor` - Create git checkpoint with tag

[→ Full Documentation](./projects/README.md)

### 2. **feature-docs** - Progressive Learning Workflow
8-phase workflow for documenting features and implementing enhancements with UML diagrams.

**Workflow:**
1. LEARN - Explore and explain feature domain
2. DOCUMENT - Create UML documentation suite (PlantUML)
3. UNDERSTAND - Analyze enhancement impact
4. PLAN - Create implementation plan
5. IMPLEMENT - Execute code changes
6. BEFORE/AFTER - Update diagrams with comparisons
7. REFINE - Polish documentation
8. ARTIFACTS - Create Jira ticket with risk analysis

**Command:**
- `/feature-docs <feature-domain> <enhancement> [ticket-id]`

[→ Full Documentation](./feature-docs/commands/feature-docs.md)

## Installation

### Local Development (Current Setup)

Both plugins are symlinked from `~/projects` to Claude's local plugins directory:

```bash
~/.claude/plugins/local/projects → ~/projects/global/claude-plugins/projects
~/.claude/plugins/local/feature-docs → ~/projects/global/claude-plugins/feature-docs
```

This allows you to:
- Edit plugins directly in `~/projects`
- Version control plugins with your mono-repo
- Test changes immediately (plugins reload automatically)

### Future: GitHub Marketplace

Once plugins are stable, publish to a GitHub marketplace:

```bash
# Create marketplace repo
gh repo create lennylmiller/projects-marketplace --public

# Users can then install
/plugin add-marketplace github lennylmiller/projects-marketplace
/plugin install projects@projects-marketplace
/plugin install feature-docs@projects-marketplace
```

## How They Work Together

The two plugins are designed to work as a cohesive system:

**projects** = Infrastructure (tickets, projects, .claude management)
**feature-docs** = Workflow (learning, documenting, implementing)

### Example Workflow

```bash
# 1. Create ticket with infrastructure plugin
/ticket-create WEB-5000 --template progressive-learning --project banno-online

# 2. Navigate to code directory
cd /Users/LenMiller/code/banno/banno-online

# 3. Set up work environment
/ticket-work WEB-5000
# → Creates .claude symlink to ~/projects/tickets/WEB-5000/.claude/

# 4. Start progressive learning workflow
/feature-docs MagicLinks "API Migration" WEB-5000
# → Phase 1: LEARN (teach me about Magic Links)
# → Phase 2: DOCUMENT (create PlantUML diagrams)

# 5. Create git checkpoint
/ticket-anchor understanding-complete

# 6. Continue workflow
/feature-docs MagicLinks "API Migration" WEB-5000 --phase 3
# → Phase 3: UNDERSTAND (analyze impact)
# → Phase 4: PLAN (implementation plan)

# 7. Validate diagrams against code
/ticket-validate WEB-5000

# 8. Implement
/feature-docs MagicLinks "API Migration" WEB-5000 --phase 5

# 9. Final checkpoint
/ticket-anchor implementation-complete

# 10. View all tickets
/ticket-list
```

**Result:** Hours from "I don't understand this" to "PR ready" with full documentation and validated diagrams.

## Architecture Principles

### 1. .claude Folder Isolation
AI artifacts (plans, conversations) NEVER go in corporate repos. They live in `~/projects/tickets/` and are symlinked to work directories.

```
Corporate Repo:           ~/projects Mono-Repo:
/code/banno/banno-online  ~/projects/tickets/WEB-5000/
└── .claude/ (symlink) ──→    └── .claude/
    (gitignored)                   ├── plans/
                                   └── conversations/
```

### 2. Ticket as Unit of Work
Every piece of work gets a ticket folder, even if there's no Jira ticket. Tickets contain:
- Discovery notes (PREAMBLE.md)
- Requirements (REQUIREMENTS.md)
- Metadata (MANIFEST.md)
- AI artifacts (.claude/)
- Documentation (UML diagrams, analysis)

### 3. Project Linking via Symlinks
Tickets can be linked to multiple projects. Symlinks maintain bidirectional references.

```
~/projects/tickets/WEB-5000/  (source of truth)
                ↑
                ├─ ~/projects/jha/banno-online/tickets/WEB-5000 (symlink)
                └─ ~/projects/jha/web-server/tickets/WEB-5000 (symlink)
```

### 4. Git Anchors for Workflow Checkpoints
Each phase creates a git checkpoint (commit + tag):
- `step/understanding-complete`
- `step/ideating-on-api-migration`
- `step/implementation-complete`

Easy rollback: `git reset --hard step/{checkpoint}`

### 5. Validation Against Codebase
PlantUML diagrams reference actual files, API endpoints, and classes. `/ticket-validate` checks these references to catch hallucinations.

## Plugin Development

### Adding New Commands

1. Create `commands/{command-name}.md` with frontmatter:
```markdown
---
description: Brief description
argument-hint: <arg1> [--flag]
---

# /{command-name} - Title

[Command documentation]
```

2. Test immediately (plugins reload automatically)

### Command Format

Commands are markdown files with:
- **Frontmatter** - Metadata (description, argument hints)
- **Title** - `# /{command-name} - Title`
- **Arguments** - Parse and validate user input
- **Your Task** - Step-by-step instructions for Claude
- **Examples** - Usage examples
- **Notes** - Important caveats

### Best Practices

- **Clear instructions** - Tell Claude exactly what to do, step by step
- **Error handling** - Check for common mistakes (missing files, invalid args)
- **User feedback** - Show progress and results clearly
- **Integration** - Reference other commands for workflow continuity
- **Validation** - Verify assumptions before acting

## Future Enhancements

### Planned Commands
- [ ] `/ticket-search <query>` - Full-text search across tickets
- [ ] `/ticket-report` - Metrics and pattern analysis
- [ ] `/ticket-archive <ticket-id>` - Archive completed work
- [ ] `/ticket-link <ticket-id> <project>` - Link existing ticket
- [ ] `/ticket-promote <pattern>` - Promote workflow to template

### Planned Features
- [ ] Template marketplace (promote successful patterns)
- [ ] Cross-ticket pattern detection
- [ ] Automatic diagram generation from code
- [ ] Integration with Jira API
- [ ] Team collaboration features

## Contributing

To contribute to these plugins:

1. Edit files in `~/projects/global/claude-plugins/`
2. Changes take effect immediately (via symlinks)
3. Test thoroughly with real tickets
4. Commit to `~/projects` repo

## Versioning

- **projects**: v1.0.0 (initial release)
- **feature-docs**: v1.0.0 (imported from standalone plugin)

## Author

Len Miller

## License

MIT
