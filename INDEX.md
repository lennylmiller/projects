# ~/projects - Master Index

**Last Updated**: 2026-02-06
**Status**: Active planning and development workspace

---

## 🎯 Quick Links

| Document | Purpose | Status |
|----------|---------|--------|
| [VISION.md](VISION.md) | High-level vision and goals | ✅ Active |
| [README.md](README.md) | Directory structure and workflow | ✅ Complete |
| [BIG-PICTURE.md](BIG-PICTURE.md) | Visual system diagram (Excalidraw) | ✅ Complete |
| [CONSOLIDATED_DOCUMENTATION.md](CONSOLIDATED_DOCUMENTATION.md) | All documentation in one place | ✅ Complete |
| [TIMELINE.md](TIMELINE.md) | Chronological evolution timeline | ✅ Complete |
| [planning/](planning/) | SDLC planning workspace | ✅ Ready to use |

---

## 📊 Current State

### Active Projects Count
- **Global**: 4 projects (plantuml-server, claude-plugins, claude-code-history-viewer, cchv-docs)
- **Personal**: 4 projects (finances/cashflow-analysis, trailer-journeys, pfm-research, pfm-platform)
- **JHA (Work)**: 4 projects (banno-online, platform-ux, responsive-tiles, web-server)
- **Tickets**: 19+ tickets (WEB-1 to WEB-14+, INA-1 to INA-5)

### Critical Status
- ⚠️ **Secrets Management**: Recently fixed (rage package added)
- 🔄 **Per-Project Nix**: First POC complete (claude-code-history-viewer)
- 🔄 **cashflow-analysis**: Driving stability requirements
- ✅ **Documentation System**: Framework established

---

## 🗂️ Directory Map

```
~/projects/
├── planning/                    # SDLC planning workspace (NEW!)
│   ├── README.md               # Planning system documentation
│   ├── QUICK-START.md          # 5-minute quick start guide
│   ├── vision/                 # Vision documents
│   ├── requirements/           # Requirements and user stories
│   ├── specs/                  # Technical specifications
│   ├── architecture/           # Architecture and design
│   ├── implementation/         # Implementation plans
│   ├── reviews/                # Retrospectives and lessons
│   ├── templates/              # Reusable templates (5 templates)
│   └── active/                 # Current work in progress
│
├── global/                      # Cross-project tools
│   ├── plantuml-server/        # Local PlantUML service
│   ├── claude-plugins/         # Claude plugin development
│   ├── claude-code-history-viewer/  # Tauri desktop app
│   └── cchv-docs/              # CCHV documentation suite
│
├── personal/                    # Personal projects
│   ├── finances/
│   │   └── cashflow-analysis/  # **CRITICAL** Finance automation
│   ├── trailer-journeys/       # Personal project (52 items)
│   ├── pfm-research/           # PFM research
│   └── pfm-platform/           # PFM platform dev
│
├── jha/                        # Work projects (Jack Henry)
│   ├── banno-online/           # Primary work project (WEB-4723)
│   ├── platform-ux/            # Platform UX work
│   ├── responsive-tiles/       # Tiles project
│   └── web-server/             # Web server work
│
├── tickets/                    # Centralized ticket tracking
│   ├── WEB-*/                  # Work tickets
│   └── INA-*/                  # Personal tickets
│
├── libs/                       # Shared libraries
│
└── [Documentation Files]
    ├── VISION.md               # Vision and goals
    ├── README.md               # Structure and workflow
    ├── BIG-PICTURE.md          # Visual diagram
    ├── CONSOLIDATED_DOCUMENTATION.md  # Complete consolidation
    ├── TIMELINE.md             # Chronological timeline
    └── INDEX.md                # This file
```

---

## 🚀 Getting Started

### For New Projects

1. **Read the vision**: Start with [VISION.md](VISION.md)
2. **Understand structure**: Read [README.md](README.md)
3. **Review timeline**: See [TIMELINE.md](TIMELINE.md)
4. **Use planning system**: See [planning/QUICK-START.md](planning/QUICK-START.md)

### For Planning Work

```bash
# Quick start
cd ~/projects/planning
cat QUICK-START.md

# Create a new plan
cp templates/vision-template.md vision/$(date +%Y-%m-%d)-vision-my-feature.md
```

### For Finding Information

All documentation consolidated in: [CONSOLIDATED_DOCUMENTATION.md](CONSOLIDATED_DOCUMENTATION.md)

---

## 📋 Current Priorities

Based on [VISION.md](VISION.md) (updated 2026-02-03):

### 1. ⚠️ CRITICAL: Secrets Management
- **Status**: Fixed (rage package added 2026-02-02)
- **Next**: Create stability verification tests
- **Planning**: `planning/reviews/2026-02-06-review-secrets-crisis.md` (to create)

### 2. 🔄 Per-Project Nix Transition
- **Status**: First POC complete (claude-code-history-viewer)
- **Next**: Migrate 2-3 more projects, create templates
- **Planning**: `planning/architecture/per-project-nix.md` (to create)

### 3. 🎯 Alias Help System
- **Status**: Planning phase
- **Next**: Design and implement help extraction from flake.nix
- **Planning**: `planning/specs/alias-help-system.md` (to create)

### 4. 📊 Alpha/Beta/Production Versioning
- **Status**: Needs formal definition
- **Next**: Define criteria and promotion process
- **Planning**: `planning/vision/versioning-strategy.md` (to create)

---

## 🔗 Integration Points

### With ~/.config/nix
- Shared configuration: `~/.config/nix/flake.nix`
- Per-project vision: `~/.config/nix/docs/PER_PROJECT_VISION.md`
- Templates directory: `~/.config/nix/templates/` (planned)

### With Git
- Repository: `~/projects/.git`
- Ignore rules: `~/projects/.gitignore`
- Commit convention: Use `planning:`, `vision:`, `spec:`, `arch:`, `impl:` prefixes

### With Claude Code
- Project context: `.claude/` directories
- Save important sessions to `planning/reviews/`
- Reference planning docs in conversations

---

## 📈 Metrics & Progress

### Documentation Coverage
- ✅ Vision document: VISION.md
- ✅ Structure documentation: README.md
- ✅ Visual diagram: BIG-PICTURE.md
- ✅ Consolidated docs: CONSOLIDATED_DOCUMENTATION.md
- ✅ Timeline: TIMELINE.md
- ✅ Planning framework: planning/
- ⏳ Per-project planning: In progress as needed

### Project Health
- **Global projects**: 4/4 documented
- **Personal projects**: 4/4 active
- **Work projects**: 4/4 ongoing
- **Planning system**: Established and ready

### Known Issues
- ✅ **Secrets corruption**: Fixed
- 🔄 **Monolithic flake.nix**: Transitioning to per-project
- 🔄 **Alpha/Beta/Production**: Needs formal definition
- 🔄 **Documentation help**: Not yet implemented

---

## 🎓 Learning Resources

### Templates Available
Located in `planning/templates/`:
1. `vision-template.md` - Vision document structure
2. `requirements-template.md` - Requirements gathering
3. `spec-template.md` - Technical specifications
4. `implementation-plan-template.md` - Implementation planning
5. `retrospective-template.md` - Retrospective format

### Reference Implementations
- **CCHV Documentation**: `global/cchv-docs/` (gold standard for docs)
- **CCHV Nix Environment**: `global/claude-code-history-viewer/flake.nix` (per-project POC)
- **PlantUML Server**: `global/plantuml-server/shell.nix` (simple shell.nix pattern)

---

## 📅 Timeline Highlights

| Date | Event | Significance |
|------|-------|--------------|
| 2024-01 | ~/.config/nix created | Foundation established |
| 2026-01-28 | ~/projects created | Workspace initiative begins |
| 2026-02-02 | Secrets crisis fixed | Critical blocker resolved |
| 2026-02-03 | VISION.md created | Clarity achieved |
| 2026-02-05 | CCHV Nix POC | First per-project success |
| 2026-02-06 | Planning framework created | **Current milestone** |

Full timeline: [TIMELINE.md](TIMELINE.md)

---

## 🔮 Future Roadmap

### Near Term (This Week)
- [ ] Create retrospective: Secrets management crisis
- [ ] Define versioning criteria (Alpha/Beta/V1)
- [ ] Plan alias help system implementation
- [ ] Migrate 1-2 projects to per-project Nix

### Short Term (This Month)
- [ ] Establish production environment baseline
- [ ] Create SymLinksBootstrap POC
- [ ] Build documentation help system
- [ ] Complete cashflow-analysis stabilization

### Medium Term (This Quarter)
- [ ] Migrate majority of projects to per-project Nix
- [ ] Formalize release process
- [ ] Automate common workflows
- [ ] Comprehensive testing framework

---

## 🆘 Common Tasks

### Finding Documentation
```bash
# Search all documentation
grep -r "search term" ~/projects/*.md

# Find planning docs
find ~/projects/planning -name "*.md" -type f

# Recent documentation
ls -lt ~/projects/*.md | head -10
```

### Starting a New Project
```bash
# 1. Create project directory
mkdir -p ~/projects/global/my-new-project

# 2. Create planning documents
cd ~/projects/planning
cp templates/vision-template.md vision/$(date +%Y-%m-%d)-vision-my-project.md

# 3. Link planning to project
ln -s ~/projects/planning/vision/$(date +%Y-%m-%d)-vision-my-project.md \
      ~/projects/global/my-new-project/VISION.md
```

### Reviewing Progress
```bash
# Check planning status
cd ~/projects/planning
ls -R active/

# Review recent work
ls -lt ~/projects/**/*.md | head -20

# Check git status
cd ~/projects
git status
```

---

## 📞 Quick Reference

### File Naming Conventions
- **Planning docs**: `YYYY-MM-DD-type-name.md`
- **Dates**: ISO 8601 format (YYYY-MM-DD)
- **Status prefixes**: `WIP-`, `DRAFT-`, `FINAL-`

### Git Commit Conventions
- `planning:` - Planning documents
- `vision:` - Vision changes
- `spec:` - Specification updates
- `arch:` - Architecture changes
- `impl:` - Implementation plans
- `docs:` - General documentation

### Directory Shortcuts
```bash
# Navigate to planning
cd ~/projects/planning

# Navigate to active work
cd ~/projects/planning/active

# Navigate to global projects
cd ~/projects/global

# Navigate to nix config
cd ~/.config/nix
```

---

## 🤝 Contributing

### Adding Documentation
1. Create in appropriate directory
2. Follow naming conventions
3. Link from relevant docs
4. Commit with descriptive message

### Updating This Index
- Update when major changes occur
- Keep metrics current
- Add new sections as needed
- Maintain links accuracy

---

## 📝 Notes

### Design Philosophy
- **Progressive disclosure**: Start simple, add detail as needed
- **Linked documentation**: Reference liberally, reduce duplication
- **Living documents**: Update as you learn, reflect reality
- **AI-friendly**: Structure for both humans and AI assistants

### Conventions Used
- ✅ Complete/Working
- 🔄 In progress
- ⚠️ Needs attention
- ❌ Blocked/Not working
- ⏳ Planned/Pending

---

**Last Review**: 2026-02-06
**Next Review**: Weekly (every Monday)
**Owner**: Len Miller + Claude Code
**Status**: Active and evolving

---

*This index is the entry point to the ~/projects workspace. Keep it current and comprehensive.*
