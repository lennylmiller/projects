# ~/projects/planning - SDLC Management

**Created**: 2026-02-06
**Purpose**: Organized planning workspace for project vision, specifications, and implementation

---

## Directory Structure

```
planning/
├── README.md              # This file - explains the planning system
├── vision/                # High-level vision documents, goals, strategy
├── requirements/          # Requirements gathering, user stories, needs analysis
├── specs/                 # Technical specifications, detailed design documents
├── architecture/          # System architecture, diagrams, structural decisions
├── implementation/        # Implementation plans, task breakdowns, execution details
├── reviews/               # Retrospectives, post-mortems, lessons learned
├── templates/             # Reusable templates for each phase
└── active/                # Currently active planning work (symlinks or working docs)
```

---

## Workflow

### Phase 1: Vision
**Directory**: `vision/`
**Purpose**: Capture the big picture, goals, and strategic direction

**Artifacts**:
- Vision statements
- Strategic goals
- Success criteria
- Stakeholder analysis
- Problem statements

**When to use**:
- Starting a new major initiative
- Refining or pivoting direction
- Annual/quarterly planning

### Phase 2: Requirements
**Directory**: `requirements/`
**Purpose**: Gather and document what needs to be built

**Artifacts**:
- User stories
- Use cases
- Functional requirements
- Non-functional requirements (performance, security, etc.)
- Acceptance criteria

**When to use**:
- After vision is clear
- Before technical design
- When adding major features

### Phase 3: Specifications
**Directory**: `specs/`
**Purpose**: Define HOW the system will work technically

**Artifacts**:
- Technical specifications
- API designs
- Data models
- Interface contracts
- Algorithm descriptions

**When to use**:
- After requirements are gathered
- Before implementation begins
- When designing complex features

### Phase 4: Architecture
**Directory**: `architecture/`
**Purpose**: Design the system structure and major components

**Artifacts**:
- System architecture diagrams
- Component diagrams
- Sequence diagrams
- Infrastructure design
- Technology decisions (ADRs - Architecture Decision Records)

**When to use**:
- Before building new systems
- When refactoring significantly
- For cross-cutting concerns

### Phase 5: Implementation
**Directory**: `implementation/`
**Purpose**: Plan the actual execution and track progress

**Artifacts**:
- Implementation plans
- Task breakdowns
- Sprint planning
- Progress tracking
- Code organization plans

**When to use**:
- When ready to build
- For estimating work
- To coordinate team efforts

### Phase 6: Reviews
**Directory**: `reviews/`
**Purpose**: Learn from what was done, improve processes

**Artifacts**:
- Retrospectives
- Post-mortems
- Lessons learned
- Process improvements
- Metrics and analytics

**When to use**:
- After major milestones
- When projects complete
- When things go wrong (or very right!)
- Quarterly reviews

---

## Templates

The `templates/` directory contains starting templates for each phase:

- `vision-template.md` - Vision document structure
- `requirements-template.md` - Requirements gathering format
- `spec-template.md` - Technical specification outline
- `architecture-template.md` - Architecture document format
- `implementation-plan-template.md` - Implementation planning structure
- `retrospective-template.md` - Retrospective format

**Usage**: Copy template to appropriate directory and fill in.

---

## Active Planning

The `active/` directory is your working space:

- Symlink to currently active planning documents
- Work-in-progress specs
- Ongoing discussions
- Temporary planning artifacts

**Keep it clean**: Move completed work to appropriate phase directories.

---

## Naming Conventions

### Vision Documents
Format: `YYYY-MM-DD-vision-[short-name].md`
Example: `2026-02-06-vision-projects-workspace.md`

### Requirements
Format: `YYYY-MM-DD-req-[feature-name].md`
Example: `2026-02-06-req-symlinks-bootstrap.md`

### Specs
Format: `YYYY-MM-DD-spec-[component-name].md`
Example: `2026-02-06-spec-alias-help-system.md`

### Architecture
Format: `YYYY-MM-DD-arch-[system-name].md`
Example: `2026-02-06-arch-per-project-nix.md`

### Implementation Plans
Format: `YYYY-MM-DD-impl-[feature-name].md`
Example: `2026-02-06-impl-cchv-nix-env.md`

### Reviews
Format: `YYYY-MM-DD-review-[topic].md`
Example: `2026-02-06-review-secrets-crisis.md`

---

## Integration with Projects

### Linking Plans to Projects

Each project in `~/projects/{global,personal,jha}/` can reference planning documents:

**Option 1**: Symlink in project directory
```bash
ln -s ~/projects/planning/specs/2026-02-06-spec-feature.md ~/projects/global/my-project/SPEC.md
```

**Option 2**: Reference in project's README
```markdown
## Planning Documents
- Vision: [~/projects/planning/vision/2026-02-06-vision-feature.md](../../planning/vision/2026-02-06-vision-feature.md)
- Spec: [~/projects/planning/specs/2026-02-06-spec-feature.md](../../planning/specs/2026-02-06-spec-feature.md)
```

**Option 3**: Metadata in planning docs
```markdown
## Related Projects
- Implementation: `~/projects/global/my-project/`
- Tickets: `~/projects/tickets/WEB-1234/`
```

---

## Working with AI (Claude Code)

### Best Practices

1. **Start with Vision**: Create a vision document before asking Claude to plan
2. **Iterative Refinement**: Use Claude to help refine requirements and specs
3. **Reference Context**: Point Claude to planning docs for context
4. **Save Conversations**: Store important Claude sessions in `reviews/` for reference

### Claude Code Integration

When working with Claude Code on planning:

```bash
# Navigate to planning directory
cd ~/projects/planning

# Ask Claude to help with specific phase
claude
# Then: "Help me create a specification for [feature] based on vision/2026-02-06-vision-projects.md"
```

### Saving Claude Sessions

After valuable planning sessions with Claude:
```bash
# Copy relevant conversation to reviews
cp ~/.claude/projects/-Users-LenMiller-projects-planning/[session-id].jsonl \
   ~/projects/planning/reviews/2026-02-06-planning-session-[topic].jsonl
```

---

## Git Integration

The planning directory is part of the `~/projects` git repository:

```bash
# Commit planning work
git add planning/
git commit -m "planning: Add specification for [feature]"

# Use conventional commits
# planning: for general planning updates
# vision: for vision document changes
# spec: for specification changes
# arch: for architecture changes
# impl: for implementation plan changes
```

### What to Commit

✅ **Always commit**:
- Finalized vision documents
- Completed requirements
- Approved specifications
- Architecture decisions
- Implementation plans
- Retrospectives and reviews

⚠️ **Commit with caution**:
- Work-in-progress documents (use WIP prefix in filename)
- Temporary planning notes (consider using `active/` directory)

❌ **Never commit**:
- Secrets or credentials (use .gitignore)
- Large binary files (use `.gitignore` or git-lfs)
- Personal notes not relevant to project (use separate note system)

---

## Examples

### Example 1: Planning a New Feature

```bash
# 1. Create vision document
cp planning/templates/vision-template.md planning/vision/2026-02-10-vision-feature-flags.md
# Edit vision document...

# 2. Gather requirements
cp planning/templates/requirements-template.md planning/requirements/2026-02-11-req-feature-flags.md
# Fill in user stories, use cases...

# 3. Create specification
cp planning/templates/spec-template.md planning/specs/2026-02-12-spec-feature-flags.md
# Define technical approach...

# 4. Design architecture
cp planning/templates/architecture-template.md planning/architecture/2026-02-13-arch-feature-flags.md
# Create diagrams, decide on structure...

# 5. Plan implementation
cp planning/templates/implementation-plan-template.md planning/implementation/2026-02-14-impl-feature-flags.md
# Break down tasks, estimate...

# 6. Symlink to active work
ln -s ~/projects/planning/implementation/2026-02-14-impl-feature-flags.md ~/projects/planning/active/feature-flags.md

# 7. Build the feature...

# 8. Retrospective
cp planning/templates/retrospective-template.md planning/reviews/2026-02-20-review-feature-flags.md
# Reflect on what worked, what didn't...
```

### Example 2: Quick Planning Session

For smaller features or rapid iteration:

```bash
# Create a combined planning document in active/
cat > planning/active/2026-02-10-quick-plan-alias-help.md <<EOF
# Alias Help System - Quick Plan

## Vision (1-liner)
On-demand help for all CLI aliases and keybinds

## Requirements
- Must be fast (<1 second to display)
- Must cover all aliases from flake.nix
- Must be searchable

## Spec
- Parse flake.nix for aliases
- Generate help markdown
- Create help command

## Implementation
1. Write parser script
2. Generate help.md
3. Add alias: alias help='cat ~/.config/nix/help.md | less'

## Timeline
- Day 1: Parser
- Day 2: Help generation
- Day 3: Polish and test
EOF

# Work on it...

# When done, move to appropriate directories
mv planning/active/2026-02-10-quick-plan-alias-help.md planning/implementation/
```

---

## Tips for Effective Planning

### 1. Start Small
Don't create all documents at once. Start with vision, then build out as needed.

### 2. Use Templates as Guides
Templates are starting points, not rigid requirements. Adapt to your needs.

### 3. Keep It Current
Update planning documents as you learn. They should reflect reality, not hopes.

### 4. Link Liberally
Reference other documents, projects, and external resources. Context matters.

### 5. Review Regularly
Set aside time (weekly/monthly) to review and update planning documents.

### 6. Retrospect Honestly
When things go wrong (or right!), document why. Learn from it.

### 7. Use Visual Aids
Diagrams (Mermaid, PlantUML, Excalidraw) help communicate complex ideas.

---

## Current Planning Priorities

Based on `VISION.md` and recent work, immediate planning needs:

1. **Secrets Management Stabilization**
   - Review: What went wrong, how was it fixed
   - Spec: Long-term secrets management approach
   - Implementation: Verification tests

2. **Per-Project Nix Transition**
   - Architecture: Template system design
   - Implementation: Migration plan for existing projects
   - Reviews: CCHV POC lessons learned

3. **Alpha/Beta/Production Versioning**
   - Vision: What does production-ready mean?
   - Requirements: Criteria for each tier
   - Spec: Promotion process

4. **Alias Help System**
   - Requirements: What help is needed?
   - Spec: Technical approach
   - Implementation: Build plan

---

## Questions?

For planning methodology questions or suggestions:
- Add to `planning/reviews/planning-system-feedback.md`
- Discuss with Claude Code
- Reference this README and suggest improvements

---

**Last Updated**: 2026-02-06
**Maintained By**: Len Miller + Claude Code
**Status**: Initial structure created, ready for use
