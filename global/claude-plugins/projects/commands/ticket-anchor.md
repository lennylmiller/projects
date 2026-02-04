---
description: Create a git anchor point (commit + tag) for the current ticket state
argument-hint: <checkpoint-name>
---

# /ticket-anchor - Create Git Anchor Point

Creates a git commit and tag to mark a checkpoint in your workflow, following the pattern: `step/{checkpoint-name}`.

## Arguments

- **CHECKPOINT_NAME** (required) - Descriptive name for this checkpoint (e.g., "understanding-complete", "implementation-done")

## Your Task

Execute the following steps:

### 1. Validate Git Repository
```bash
# Check if current directory is a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ Not a git repository"
  echo "   Navigate to your code directory first"
  exit 1
fi
```

### 2. Detect Active Ticket
```bash
# Check if .claude symlink exists and extract ticket ID
if [ -L .claude ]; then
  TICKET_PATH=$(readlink .claude)
  TICKET_ID=$(basename $(dirname "$TICKET_PATH"))
  echo "📍 Detected active ticket: $TICKET_ID"
else
  echo "⚠️  No active ticket detected (.claude symlink not found)"
  echo "   Run /ticket-work {TICKET_ID} first"
  exit 1
fi
```

### 3. Check Git Status
```bash
git status --short
```

**If there are uncommitted changes:**
```
⚠️  You have uncommitted changes:

{show git status output}

Options:
  1. Commit changes now with anchor message
  2. Stash changes and create anchor without them
  3. Cancel and let me commit manually

Choose (1/2/3):
```

### 4. Create Commit (if option 1 chosen or no changes)
```bash
# Create commit with descriptive message
git add .
git commit -m "step/{CHECKPOINT_NAME}

Active ticket: {TICKET_ID}
Checkpoint: {CHECKPOINT_NAME}

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 5. Create Tag
```bash
# Create lightweight tag
git tag "step/{CHECKPOINT_NAME}"

# Or annotated tag with ticket info
git tag -a "step/{CHECKPOINT_NAME}" -m "{TICKET_ID}: {CHECKPOINT_NAME}"
```

### 6. Update Ticket MANIFEST
Update `~/projects/tickets/{TICKET_ID}/MANIFEST.md`:
- Add anchor to a new `anchors` field in YAML frontmatter
- Record: commit SHA, tag name, timestamp

**Example addition to MANIFEST.md:**
```yaml
anchors:
  - name: understanding-complete
    commit: abc123def456
    tag: step/understanding-complete
    timestamp: 2026-02-03T20:00:00Z
  - name: implementation-done
    commit: def456abc789
    tag: step/implementation-done
    timestamp: 2026-02-03T22:00:00Z
```

### 7. Display Summary
```
✓ Git anchor created

Checkpoint: {CHECKPOINT_NAME}
Commit: {commit_sha}
Tag: step/{CHECKPOINT_NAME}
Ticket: {TICKET_ID}

Git history:
  {git log --oneline -3}

Anchors for {TICKET_ID}:
  1. step/understanding-complete (2h ago)
  2. step/implementation-done (now)

Next steps:
  - Continue working on ticket
  - Push when ready: git push origin main --tags
  - View all anchors: git tag -l "step/*"
  - Rollback if needed: git reset --hard step/{CHECKPOINT_NAME}
```

## Common Checkpoint Names

**Learning Phase:**
- `understanding-{feature}-complete`
- `documentation-generated`
- `diagrams-validated`

**Planning Phase:**
- `ideating-on-{approach}`
- `plan-created`
- `plan-approved`

**Implementation Phase:**
- `utility-functions-complete`
- `controller-updated`
- `tests-passing`
- `implementation-complete`

**Refinement Phase:**
- `before-after-diagrams-updated`
- `documentation-polished`
- `ready-for-review`

## Examples

### After learning phase
```bash
/ticket-anchor understanding-magic-links-complete
```

### After ideation
```bash
/ticket-anchor ideating-on-api-migration
```

### After implementation
```bash
/ticket-anchor implementation-complete
```

## Workflow Integration

This command integrates with the `/feature-docs` workflow:

```bash
# Phase 1: LEARN
/feature-docs MagicLinks "API Migration" WEB-5000
# ... learning complete ...
/ticket-anchor understanding-complete

# Phase 2-3: DOCUMENT + UNDERSTAND
# ... diagrams created ...
/ticket-anchor documentation-generated

# Phase 4: PLAN
# ... plan created ...
/ticket-anchor plan-approved

# Phase 5: IMPLEMENT
# ... code changes ...
/ticket-anchor implementation-complete
```

## Notes

- Anchor points create recoverable checkpoints in your workflow
- Tags are searchable: `git tag -l "step/*"`
- Easy rollback: `git reset --hard step/{checkpoint-name}`
- MANIFEST tracks anchors for ticket history
- Commit message includes ticket ID for traceability
- Co-authored by Claude for attribution
- Tags can be pushed to remote: `git push --tags`
- Use kebab-case for checkpoint names (e.g., `understanding-complete`, not `Understanding Complete`)
