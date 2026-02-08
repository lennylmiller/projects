# CCHV Documentation Suite

Comprehensive documentation for **Claude Code History Viewer** (CCHV) - a Tauri desktop application for browsing and analyzing Claude Code conversation history.

## 📚 Documentation Index

### Quick Start

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [CCHV_TLDR.md](CCHV_TLDR.md) | High-level overview of Tauri architecture | First time here? Start here |
| [CCHV_GETTING_STARTED.md](CCHV_GETTING_STARTED.md) | Step-by-step setup and running guide | Ready to run the app? Go here |
| [CCHV_API_REFERENCE.md](CCHV_API_REFERENCE.md) | Quick lookup for commands, store, types | Developing features? Reference this |

### Deep Dive

| Document | Purpose |
|----------|---------|
| [CCHV_ARCHITECTURE.md](CCHV_ARCHITECTURE.md) | Layered architecture documentation (4 levels) |

**CCHV_ARCHITECTURE.md Structure:**
- **Level 1:** Use Cases - What can users do?
- **Level 2:** Sequence Diagrams - How do objects interact?
- **Level 3:** Activity Diagrams - What are the decision points?
- **Level 4:** Class Diagrams - What's the structure?
- **Reference:** Quick lookup tables

## 🎯 Documentation Approach

This documentation follows a **layered resolution pattern**:

1. **Start broad** (Use Cases) - Understand what the system does
2. **Drill into interactions** (Sequences) - See how components collaborate
3. **Explore workflows** (Activities) - Understand decision logic and detailed processes
4. **Examine structure** (Classes) - Learn the internal organization

Each layer builds on the previous, giving you progressively more detail.

## 🚀 About CCHV

**Claude Code History Viewer** is a Tauri-based desktop application that allows developers to:
- Browse Claude Code conversation history stored in `~/.claude`
- Search across all sessions with full-text search
- Analyze token usage and conversation patterns
- Navigate message threads with virtual scrolling
- Export and copy conversation content
- View recent file edits across sessions

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Zustand (state management)
- Tailwind CSS v4
- @tanstack/react-virtual
- FlexSearch

**Backend:**
- Rust (stable)
- Tauri v2
- Serde (JSON)
- Walkdir

**Development:**
- Nix + direnv (reproducible environment)
- just (task runner)
- Vite (build tool)
- pnpm (package manager)

## 🗂️ Directory Structure

```
cchv-docs/
├── README.md                    # This file (navigation hub)
├── CCHV_TLDR.md                 # Quick overview
├── CCHV_ARCHITECTURE.md         # Layered architecture documentation
├── CCHV_GETTING_STARTED.md      # Setup and running guide
├── CCHV_API_REFERENCE.md        # Technical reference
└── diagrams/                    # Exported diagram images (optional)
    └── .gitkeep
```

## 📖 Reading Guide

### For First-Time Users

1. Read [CCHV_TLDR.md](CCHV_TLDR.md) (5 minutes)
   - Understand what Tauri is
   - Learn why localhost:5173 appears
   - See the high-level architecture

2. Follow [CCHV_GETTING_STARTED.md](CCHV_GETTING_STARTED.md) (15 minutes)
   - Install prerequisites (Nix, direnv)
   - Run `just setup` and `just dev`
   - See the desktop app in action

3. Browse [CCHV_ARCHITECTURE.md](CCHV_ARCHITECTURE.md) Level 1 (10 minutes)
   - Understand use cases
   - See what the app can do

### For Developers

1. Review [CCHV_TLDR.md](CCHV_TLDR.md) (5 minutes)
2. Set up environment with [CCHV_GETTING_STARTED.md](CCHV_GETTING_STARTED.md) (15 minutes)
3. Study [CCHV_ARCHITECTURE.md](CCHV_ARCHITECTURE.md) Levels 2-4 (30-60 minutes)
   - Level 2: Key interaction flows
   - Level 3: Detailed workflows
   - Level 4: Code structure
4. Keep [CCHV_API_REFERENCE.md](CCHV_API_REFERENCE.md) open while coding

### For Researchers/Analysts

1. Skim [CCHV_TLDR.md](CCHV_TLDR.md) (2 minutes)
2. Run the app via [CCHV_GETTING_STARTED.md](CCHV_GETTING_STARTED.md) (15 minutes)
3. Focus on [CCHV_ARCHITECTURE.md](CCHV_ARCHITECTURE.md) Level 1 (Use Cases)
4. Use the app to explore your conversation history

## 🔧 Common Tasks

| Task | Document | Section |
|------|----------|---------|
| Understand Tauri architecture | CCHV_TLDR.md | "What is Tauri?" |
| Fix localhost:5173 confusion | CCHV_TLDR.md | "localhost:5173 - What is it?" |
| Install and run the app | CCHV_GETTING_STARTED.md | "First Time Setup" |
| Troubleshoot startup issues | CCHV_GETTING_STARTED.md | "Troubleshooting" |
| Understand app workflows | CCHV_ARCHITECTURE.md | Level 2: Sequence Diagrams |
| Look up Tauri commands | CCHV_API_REFERENCE.md | "Tauri Commands" |
| Find store actions | CCHV_API_REFERENCE.md | "Zustand Store Slices" |
| Understand message types | CCHV_API_REFERENCE.md | "Message Types" |

## 🤝 Contributing

This documentation suite is open for contributions! If you find:
- **Errors or outdated information** → Open an issue
- **Missing diagrams or examples** → Submit a PR
- **Confusing explanations** → Suggest improvements

See the [main project repository](https://github.com/jhlee0409/claude-code-history-viewer) for contribution guidelines.

## 📋 Documentation Checklist

- [x] TLDR overview with Tauri architecture diagram
- [x] Getting Started guide with step-by-step instructions
- [x] README navigation hub
- [ ] Full architecture documentation (Levels 1-4)
- [ ] API reference with lookup tables
- [ ] All PlantUML diagrams rendered
- [ ] Cross-references between documents tested

## 🔗 External Links

- **Main Repository:** [jhlee0409/claude-code-history-viewer](https://github.com/jhlee0409/claude-code-history-viewer)
- **Tauri Documentation:** [tauri.app](https://tauri.app)
- **Claude Code:** [claude.ai/code](https://claude.com/claude-code)
- **Issue Tracker:** [GitHub Issues](https://github.com/jhlee0409/claude-code-history-viewer/issues)

---

**Last Updated:** 2026-02-06
**Documentation Version:** 1.0.0
**Covers CCHV Version:** 1.x.x

**Questions?** Open an issue in the main repository or check the [Discussions](https://github.com/jhlee0409/claude-code-history-viewer/discussions) page.
