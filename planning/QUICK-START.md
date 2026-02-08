# Quick Start Guide - ~/projects/planning

**Get started with planning in 5 minutes**

---

## 🚀 For a New Feature/Project

### Step 1: Start with Vision (Optional but Recommended)
```bash
cd ~/projects/planning
cp templates/vision-template.md vision/2026-02-10-vision-my-feature.md
# Edit the vision document...
```

### Step 2: Gather Requirements
```bash
cp templates/requirements-template.md requirements/2026-02-11-req-my-feature.md
# Fill in user stories and acceptance criteria...
```

### Step 3: Create Specification
```bash
cp templates/spec-template.md specs/2026-02-12-spec-my-feature.md
# Design the technical approach...
```

### Step 4: Plan Implementation
```bash
cp templates/implementation-plan-template.md implementation/2026-02-13-impl-my-feature.md
# Break down tasks and estimate...
```

### Step 5: Link to Active Work
```bash
ln -s ~/projects/planning/implementation/2026-02-13-impl-my-feature.md active/my-feature.md
```

### Step 6: Build It!
[Do the actual implementation work]

### Step 7: Retrospective
```bash
cp templates/retrospective-template.md reviews/2026-02-20-review-my-feature.md
# Reflect on what worked and what didn't...
```

---

## ⚡ For Quick Planning

When you need to move fast:

```bash
cd ~/projects/planning/active

# Create a quick planning doc
cat > quick-plan-feature-name.md <<EOF
# Feature Name - Quick Plan

## What & Why
[1-2 sentences]

## Requirements
- Must have 1
- Must have 2

## Technical Approach
[Brief description]

## Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Timeline
- Start: YYYY-MM-DD
- Done: YYYY-MM-DD
EOF

# Edit and work on it...

# When done, move to proper location
mv quick-plan-feature-name.md ../implementation/2026-02-15-impl-feature-name.md
```

---

## 📋 For AI-Assisted Planning

### With Claude Code

```bash
cd ~/projects/planning

# Start a planning session
claude

# Then in Claude:
# "Help me create a vision document for [feature].
#  I need to solve [problem] by [approach].
#  Use templates/vision-template.md as the structure."
```

### Saving Important Conversations

After a productive Claude session:
```bash
# Find the session ID
ls -lt ~/.claude/projects/-Users-LenMiller-projects-planning/ | head -5

# Copy to reviews for reference
cp ~/.claude/projects/-Users-LenMiller-projects-planning/[session-id].jsonl \
   reviews/2026-02-15-planning-session-feature-name.jsonl
```

---

## 🎯 Current Priorities (Based on VISION.md)

### 1. Secrets Management Stabilization
```bash
cd ~/projects/planning
cp templates/retrospective-template.md reviews/2026-02-06-review-secrets-crisis.md
# Document what went wrong, how it was fixed
```

### 2. Per-Project Nix Transition
```bash
cp templates/architecture-template.md architecture/2026-02-06-arch-per-project-nix.md
# Design the template system
```

### 3. Alias Help System
```bash
cp templates/spec-template.md specs/2026-02-07-spec-alias-help.md
# Specify how to extract and display help
```

### 4. Alpha/Beta/Production Versioning
```bash
cp templates/vision-template.md vision/2026-02-07-vision-versioning-strategy.md
# Define what production-ready means
```

---

## 📁 Directory Cheat Sheet

```
planning/
├── vision/          # Big picture, strategy, goals
├── requirements/    # What to build (user stories, use cases)
├── specs/           # How to build it (technical details)
├── architecture/    # System design (diagrams, decisions)
├── implementation/  # Execution plans (tasks, timelines)
├── reviews/         # Retrospectives (lessons learned)
├── templates/       # Starting templates
└── active/          # Current work (symlinks, WIP)
```

**Rule of Thumb**:
- **Vision** = Why are we doing this?
- **Requirements** = What needs to exist?
- **Specs** = How will it work technically?
- **Architecture** = How will components fit together?
- **Implementation** = What tasks will we do and when?
- **Reviews** = What did we learn?

---

## 🔗 Integration Tips

### Link Planning to Projects

In your project README:
```markdown
## Planning Documentation
- Vision: [~/projects/planning/vision/2026-02-06-vision-feature.md](../planning/vision/2026-02-06-vision-feature.md)
- Spec: [~/projects/planning/specs/2026-02-06-spec-feature.md](../planning/specs/2026-02-06-spec-feature.md)
```

### Link Planning to Tickets

In ticket directories:
```bash
cd ~/projects/tickets/WEB-1234
ln -s ~/projects/planning/implementation/2026-02-06-impl-web-1234.md PLAN.md
```

---

## ✅ Best Practices

1. **Date-stamp everything**: Use YYYY-MM-DD prefix for easy sorting
2. **Start simple**: Don't fill out every section of every template
3. **Link liberally**: Reference related docs, projects, tickets
4. **Keep active/ clean**: Move completed work to proper directories
5. **Commit regularly**: Planning docs are part of version control
6. **Review often**: Update docs as you learn

---

## 🆘 Need Help?

- **Full documentation**: See `README.md` in this directory
- **Templates**: All templates in `templates/` directory
- **Examples**: Check existing planning docs (once created)
- **Ask Claude**: Claude Code can help with any planning phase

---

**Pro Tip**: Don't let perfect be the enemy of good. A quick planning doc is better than no planning doc. Start with the template, fill in what you know, and iterate.
