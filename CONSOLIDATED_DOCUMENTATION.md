# ~/projects Consolidated Documentation

**Created**: 2026-02-06
**Purpose**: Central hub consolidating all documentation and planning context for the ~/projects workspace initiative

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Vision & Goals](#vision--goals)
3. [Current State Analysis](#current-state-analysis)
4. [Key Documentation Sources](#key-documentation-sources)
5. [Directory Structure](#directory-structure)
6. [Critical Issues & Blockers](#critical-issues--blockers)
7. [Implementation History](#implementation-history)
8. [Next Steps](#next-steps)

---

## Executive Summary

The `~/projects` directory represents an evolving **unified workspace ecosystem** that bridges:
- **Development Environment** (`~/.config/nix`) - Declarative tooling foundation
- **Project Management** (`~/projects`) - Organizational command center
- **AI-Assisted Workflow** - Force multiplier for productivity

### Current Status
- ✅ Basic structure established (global/, personal/, jha/, tickets/)
- ✅ Documentation system emerging (CCHV docs as reference)
- ✅ Git repository initialized with comprehensive .gitignore
- ⚠️  Stability challenges with secrets management (critical blocker)
- ⚠️  "Leap-frogging" between alpha/beta/production without structure
- 🔄 Transitioning from monolithic `~/.config/nix/flake.nix` to per-project Nix environments

---

## Vision & Goals

### From VISION.md (Source: `/Users/LenMiller/projects/VISION.md`)

**Primary Goal** (as of 2026-02-03):
> Decide on what features belong in our current "Production"... right now we're leap frogging alpha, beta, dev, etc.. because I am limping right now.. and need to create better consistency and not be able to break my stuff so easy and get git more involved globally.

**Immediate Critical Need**:
> The one thing that doesn't work that I NEED is the `secrets` alias... right now when you run secrets, edit or add a new secret it corrupts... I've spent several hours not quite getting this.. It worked for several weeks, so maybe you'll have to create a way to see if you can go back in github and see when/if it worked.

### Three Key Objectives

1. **Alias Help System**
   - On-demand help for keybinds and CLI tools
   - Tag-based documentation (`@AddHelp` or similar)
   - Solve: "I'm always looking in the flake.nix file to find out what keybinds"

2. **Feature Inventory & Classification**
   - Parse `flake.nix` to create a feature guide
   - Identify valuable features vs. carried-forward cruft
   - Track bugs and regressions (e.g., `secrets` alias corruption)
   - Formalize Alpha, Beta, and Version 1 releases

3. **Organizational Refinement**
   - AI-assisted recommendations on file organization
   - Determine when to split vs. keep in one file
   - Re-design and re-clean with intentionality

---

## Current State Analysis

### From Vision Sharpening Session (2 days ago)
**Source**: Claude Historian MCP search results

**Journey That Led Here**:
Your sophisticated Nix setup shows you've been solving:
- **Tool chaos** → Declarative, reproducible environments
- **Context switching** → Workspace launchers, named Kitty sessions
- **Documentation debt** → AI-assisted UML generation, 8-phase workflow
- **Configuration drift** → Single flake.nix source of truth

**Stability Crisis Identified**:
- The `secrets` alias breaks and corrupts (critical blocker)
- "Leap-frogging" alpha/beta/production without structure
- Breaking things too easily
- Lost track of which features are valuable vs. carried forward

**Personal Finance Thread**:
The `cashflow-analysis` project is the **use case driving urgency**:
- Stable infrastructure to build on
- Clear separation of production vs. experimental features
- Reliable secrets management (for API keys, database credentials)
- Environment that won't break when making financial decisions

---

## Key Documentation Sources

### 1. VISION.md
**Location**: `/Users/LenMiller/projects/VISION.md`
**Last Modified**: 2026-02-03
**Key Content**:
- Stream of consciousness vision for projects workspace
- Checkbox TODO items for flake.nix improvements
- Primary goals and immediate needs
- Focus on secrets management as critical blocker

### 2. README.md
**Location**: `/Users/LenMiller/projects/README.md`
**Last Modified**: 2026-02-04
**Key Content**:
- Current thinking on project structure
- Tree view of directory organization
- SymLinksBootstrap concept (use case analysis)
- Developer workflow documentation
- Ticket management process

### 3. BIG-PICTURE.md
**Location**: `/Users/LenMiller/projects/BIG-PICTURE.md`
**Type**: Excalidraw diagram (compressed JSON)
**Purpose**: Visual representation of "Where we are now" and deployment system

### 4. CCHV Documentation Suite
**Location**: `~/projects/global/cchv-docs/`
**Created**: 2026-02-06 (45 minutes ago)
**Status**: ✅ Complete
**Files**:
- `README.md` (6.0K) - Navigation hub
- `CCHV_TLDR.md` (4.4K) - Tauri architecture overview
- `CCHV_GETTING_STARTED.md` (7.8K) - Setup guide
- `CCHV_ARCHITECTURE.md` (49K) - 4-level architecture (Use Cases → Classes)
- `CCHV_API_REFERENCE.md` (20K) - Developer quick reference

**Documentation Pattern**:
This represents the **gold standard** for documentation structure:
- Progressive disclosure (TLDR → Getting Started → Architecture → API Reference)
- 15 PlantUML diagrams across 4 levels
- Cross-references between levels
- Suitable for onboarding new contributors

### 5. ~/.config/nix/CLAUDE.md
**Location**: `/Users/LenMiller/.config/nix/CLAUDE.md`
**Purpose**: Primary instructions for Claude Code when working with nix-config
**Key Sections**:
- Common commands (nrs, nfu, secrets management)
- Architecture overview (flake.nix structure)
- Per-project Nix environment vision (PER_PROJECT_VISION.md)
- Homebrew + Nix coexistence strategy
- Known issues (nushell build failure, secrets corruption)

### 6. ~/.config/nix/docs/PER_PROJECT_VISION.md
**Referenced**: Multiple conversation sessions
**Purpose**: Vision for transitioning from monolithic flake.nix to per-project environments
**Status**: Thought in progress
**First POC**: claude-code-history-viewer (daily-use tool)

---

## Directory Structure

### Current Organization

```
~/projects/
├── .git/                           # Git repository (initialized ~2 days ago)
├── .gitignore                      # Comprehensive ignore rules (created 2 days ago)
├── .obsidian/                      # Obsidian vault settings
├── .claude/                        # Claude Code project settings
├── .projectsrc                     # Project-specific shell configuration
├── VISION.md                       # Vision and goals documentation
├── README.md                       # Current thinking and structure
├── BIG-PICTURE.md                  # Excalidraw diagram
├── Nixify.md                       # Nix-related notes
├── global/                         # Cross-project tools and utilities
│   ├── cchv-docs/                  # Claude Code History Viewer docs (created today)
│   ├── claude-code-history-viewer/ # Tauri desktop app (Nix environment, created ~2 hours ago)
│   ├── claude-plugins/             # Claude plugin development
│   ├── Excalidraw/                 # Diagram storage
│   └── plantuml-server/            # Local PlantUML rendering service (shell.nix)
├── personal/                       # Personal projects
│   ├── finances/                   # **CRITICAL** - Personal finance automation
│   │   └── cashflow-analysis/      # Use case driving stability requirements
│   ├── pfm-platform/               # Personal finance management platform
│   ├── pfm-research/               # PFM research and experiments
│   ├── tickets/                    # Personal project tickets
│   └── trailer-journeys/           # Personal project (52 items)
├── jha/                           # Jack Henry & Associates (work projects)
│   ├── banno-online/              # Primary work project
│   ├── platform-ux/
│   ├── responsive-tiles/
│   ├── tickets/                   # Work tickets (symbolic links)
│   └── web-server/
├── libs/                          # Shared libraries
├── tickets/                       # Global ticket tracking
│   ├── INA-*                      # Personal tickets (INA-1 through INA-5)
│   └── WEB-*                      # Work tickets (WEB-1 through WEB-14+)
└── glacier-banks-slide-17.png    # Reference image
```

### Organizational Pattern

**Symbolic Link Strategy** (from README.md):
- Tickets live in `~/projects/tickets/`
- Project directories contain symbolic links to relevant tickets
- Example: `jha/banno-online/WEB-1` → `../../tickets/WEB-1`
- Rule: Only one symbolic link allowed at a time (prevents context confusion)
- Future: SymLinksBootstrap tool for managing ticket associations

**Directory Categories**:
1. **global/** - Tools used across all projects (documentation, utilities)
2. **personal/** - Personal projects and research
3. **jha/** - Work projects (Jack Henry & Associates)
4. **libs/** - Shared code libraries
5. **tickets/** - Centralized ticket/task tracking

---

## Critical Issues & Blockers

### 1. Secrets Management Corruption ⚠️ CRITICAL
**Status**: FIXED (as of 3-4 days ago)
**Source**: Claude Historian search results + ~/.config/nix work

**Problem**:
- `secrets` alias would corrupt `env-secrets.age` file (1.3K → 212 bytes)
- Happened repeatedly after working for weeks
- Blocked production use of nix-config

**Root Cause**:
- Missing `rage` package (agenix dependency)

**Solution Applied**:
- Added `rage` to `~/.config/nix/flake.nix:152`
- Restored from backup (`env-secrets.age-bu`)
- Archived corrupted file for forensics

**Verification Needed**:
```bash
# Test secrets command
secrets
# Expected: Opens editor without "rage not found" error

# Verify secrets are loaded
source ~/.zshrc
echo $ARTIFACTORY_USERNAME
# Expected: lenmiller@jackhenry.com
```

### 2. Leap-Frogging Alpha/Beta/Production ⚠️
**Status**: ONGOING CONCERN
**Impact**: Instability, frequent breakage

**Need**:
- Formal versioning system (Alpha, Beta, V1)
- Feature classification (production-ready vs. experimental)
- Testing strategy before promotion
- Rollback capability

### 3. Monolithic flake.nix Complexity
**Status**: IN TRANSITION
**Target**: Per-project Nix environments

**Current**:
- Single `~/.config/nix/flake.nix` (~600 lines)
- All packages and configuration in one file
- Hard to understand what's valuable vs. carried forward

**Vision**:
- Per-project `flake.nix` or `shell.nix`
- Documented in `~/.config/nix/docs/PER_PROJECT_VISION.md`
- First POC: `claude-code-history-viewer` (completed today)

### 4. Documentation Discoverability
**Status**: IMPROVING
**Need**: Centralized help system

**Current Challenges**:
- Keybinds buried in flake.nix
- Aliases defined across multiple files
- No on-demand help for CLI tools
- Forget newly-learned git habits/aliases

**Proposed**:
- `@AddHelp` tagging system
- Parseable flake.nix for feature extraction
- On-demand help command

---

## Implementation History

### Recent Work (Last 7 Days)

#### 2026-02-06 (Today)
- ✅ CCHV Documentation Suite created (`~/projects/global/cchv-docs/`)
  - 5 comprehensive markdown files
  - 15 PlantUML diagrams
  - 4-level progressive architecture docs
- ✅ Per-project Nix environment for claude-code-history-viewer
  - Multi-platform flake.nix (macOS + Linux)
  - direnv integration
  - Comprehensive CLAUDE.md and README.md updates
- ✅ This consolidated documentation created

#### 2026-02-04
- ✅ Comprehensive `.gitignore` created for ~/projects
  - OS files, editor configs, secrets, build artifacts
  - Nix-specific ignores (.direnv/, result)
- ✅ BIG-PICTURE.md diagram created (Excalidraw)

#### 2026-02-03
- ✅ VISION.md created (stream of consciousness)
- ✅ Secrets management crisis recognized
- 🎯 Primary goal articulated: stabilize production environment

#### 2026-02-02 to 2026-02-03
- ✅ Secrets corruption fixed (added `rage` package)
- ✅ Backup restored, corrupted file archived
- ✅ System rebuild successful

#### 2026-01-28 to 2026-02-02
- ✅ Git repository initialized for ~/projects
- ✅ Directory structure established (global/, personal/, jha/)
- ✅ Symbolic link pattern implemented for tickets

#### Earlier Work
- ✅ plantuml-server project (shell.nix example)
- ✅ cashflow-analysis project started (personal/finances/)
- ✅ Multiple work tickets in progress (WEB-1 through WEB-14+)

---

## Next Steps

### Immediate Actions (This Session)

1. **Create Timeline Document**
   - Mermaid diagram showing chronological evolution
   - Map when each directory/project was created
   - Identify patterns in workflow evolution

2. **Define Planning Framework**
   - Establish structure for capturing thoughts
   - Create templates for new projects
   - Define question/answer session format with AI

3. **Feature Inventory (flake.nix)**
   - Parse current configuration
   - Classify features (production/beta/experimental)
   - Identify regressions and bugs
   - Create feature guide document

### Short-Term Goals (This Week)

1. **Stabilize Production Environment**
   - Verify secrets management works reliably
   - Define "production-ready" criteria
   - Create rollback procedures
   - Document known good state

2. **SymLinksBootstrap POC**
   - Design keybind-triggered modal UI
   - Implement ticket selection workflow
   - Test with existing projects

3. **Documentation Help System**
   - Design `@AddHelp` tagging convention
   - Create flake.nix parser for feature extraction
   - Build searchable help command

### Medium-Term Goals (This Month)

1. **Per-Project Nix Transition**
   - Migrate 2-3 projects to per-project environments
   - Document lessons learned
   - Create templates for common project types

2. **Formalize Versioning**
   - Define Alpha/Beta/V1 criteria
   - Create testing checklist
   - Establish promotion process

3. **Workflow Automation**
   - Workspace launchers improvements
   - Automated ticket creation
   - Git hooks for consistency

---

## Reference Implementations

### CCHV Documentation (Gold Standard)
**Location**: `~/projects/global/cchv-docs/`
**Pattern**: Progressive disclosure architecture documentation
**Applicable To**: All future projects requiring comprehensive docs

**Lessons**:
- Start with TLDR for quick understanding
- Provide Getting Started for immediate use
- Layer architectural detail across 4 levels
- Include API reference for daily development
- Use PlantUML for visual diagrams
- Cross-reference between documents

### claude-code-history-viewer (Per-Project Nix POC)
**Location**: `~/projects/global/claude-code-history-viewer/`
**Pattern**: Multi-platform Nix development environment
**Demonstrates**:
- Tauri project with Node.js + Rust
- Platform-specific dependencies (Linux webkit2gtk)
- direnv auto-loading
- Integration with existing tools (just, pnpm)
- Multi-system support (macOS + Linux)

**Reference**:
See `~/.config/nix/docs/PER_PROJECT_VISION.md` for detailed analysis

### plantuml-server (shell.nix Pattern)
**Location**: `~/projects/global/plantuml-server/`
**Pattern**: Simple shell.nix for quick project setup
**Use Case**: Local service with helper scripts

---

## Source Attribution

This document consolidates information from:

1. **Direct Files**:
   - `/Users/LenMiller/projects/VISION.md`
   - `/Users/LenMiller/projects/README.md`
   - `/Users/LenMiller/projects/BIG-PICTURE.md`
   - `/Users/LenMiller/.config/nix/CLAUDE.md`

2. **Claude Historian MCP Searches**:
   - "~/projects vision VISION.md mono-repo workspace organization"
   - "projects directory structure global personal work templates"
   - "nix configuration flake.nix darwin-rebuild home-manager"
   - "secrets agenix env-secrets.age .config/nix bootstrap"

3. **File Context Searches**:
   - `VISION.md` operations history (4 operations)
   - `flake.nix` operations history (12 operations)

4. **Recent Conversation Sessions**:
   - Vision sharpening session (2 days ago)
   - CCHV documentation creation (today)
   - Per-project Nix environment implementation (2 hours ago)
   - Secrets corruption fix (3-4 days ago)

---

## Appendix: Key Insights

### The Three-Domain Bridge

```
┌─────────────────────────────────────────────────────────────┐
│                    Unified Workspace Ecosystem               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ~/.config/nix/              ~/projects/          AI Tools   │
│  ┌─────────────┐            ┌──────────┐         ┌────────┐ │
│  │  Dev Tools  │ ◄────────► │ Projects │ ◄─────► │ Claude │ │
│  │             │            │          │         │  Code  │ │
│  │ • nix-darwin│            │ • global │         ├────────┤ │
│  │ • home-mgr  │            │ • jha    │         │ Serena │ │
│  │ • packages  │            │ • personal        │  MCP   │ │
│  │ • secrets   │            │ • tickets│         └────────┘ │
│  └─────────────┘            └──────────┘                     │
│       ▲                          ▲                           │
│       │                          │                           │
│       └──────────────────────────┘                           │
│          Declarative Config        │
└─────────────────────────────────────────────────────────────┘
```

### Stability Requirements Hierarchy

**Critical** (Must Work):
1. Secrets management (ARTIFACTORY_TOKEN, API keys)
2. Shell environment (zsh, PATH, aliases)
3. Git operations
4. Terminal emulator (kitty/ghostty)

**Important** (Should Work):
1. Language runtimes (Python, Node.js, Rust)
2. Development tools (neovim, ripgrep, fzf)
3. Workspace launchers
4. Documentation tools (PlantUML)

**Nice-to-Have** (Can Be Broken):
1. Experimental features
2. Beta integrations
3. Research tools

---

## Questions for Next Session

1. **Versioning Strategy**:
   - What criteria define production-ready vs. beta vs. alpha?
   - How do we prevent accidental promotion of unstable features?

2. **Documentation System**:
   - Should we use the CCHV 4-level pattern for all major projects?
   - How do we auto-generate help from flake.nix comments?

3. **Workspace Organization**:
   - Is the global/personal/jha split optimal?
   - Should libs/ be promoted to top-level importance?

4. **AI Workflow Integration**:
   - How can we better leverage Claude Code for project management?
   - Should we create custom MCP servers for project operations?

5. **Nix Strategy**:
   - When to use per-project environments vs. global?
   - How to handle shared dependencies across projects?

---

**Last Updated**: 2026-02-06
**Maintained By**: Len Miller + Claude Code
**Next Review**: After timeline creation and framework discussion
