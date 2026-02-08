---
excalidraw-plugin: parsed
tags: [excalidraw, architecture, layers-of-resolution, anatomy-chart]
---
********==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠==

# Layers of Resolution — Anatomy Chart Architecture

> Like anatomy overlay charts where each transparent page adds a system
> (bones, nerves, muscles, skin) and you can flip between them.

## Layer Overview

```mermaid
graph TB
    subgraph "LAYER 1: BONES — Base Development Environment"
        direction LR
        NIX["~/.config/nix/flake.nix<br/>Global: shell, CLI tools, fonts,<br/>terminal, git, secrets (agenix)"]
        DIRENV["direnv auto-load<br/>.envrc → use flake / use nix"]
        TEMPLATES["nix templates/<br/>simple-shell, simple-flake,<br/>python-uv, node-full-stack"]
        NIX --> DIRENV
        TEMPLATES --> DIRENV
    end

    subgraph "LAYER 2: NERVOUS SYSTEM — Per-Project Environments"
        direction LR
        PERPROJ["Per-project shell.nix / flake.nix<br/>Language runtimes, build tools,<br/>project-specific services"]
        PLANTUML["POC: plantuml-server<br/>shell.nix → auto-configure<br/>editors on start, remove on stop<br/>(TRUE EPHEMERAL)"]
        CCHV["POC: claude-code-history-viewer<br/>First full flake.nix per-project<br/>(Tauri + Rust + React)"]
        PERPROJ --- PLANTUML
        PERPROJ --- CCHV
    end

    subgraph "LAYER 3: MUSCLES — Experimentation Engine"
        direction LR
        GITEA["POC: gitea-local<br/>Local git server for<br/>safe experimentation"]
        SWITCH["switch-to-gitea / switch-to-github<br/>Seamless context switching<br/>State tracking (current.json)"]
        PROMOTE["Promotion pipeline<br/>Experiment → Review → Merge<br/>or Discard (no trace in GitHub)"]
        GITEA --> SWITCH --> PROMOTE
    end

    subgraph "LAYER 4: SKIN — Workspace Hub (~/projects)"
        direction LR
        HUB["~/projects/ git repo<br/>Command center for<br/>planning + working contexts"]
        TICKETS["tickets/WEB-XXXX/<br/>Ephemeral-registered folders<br/>Analysis artifacts, not source code"]
        SYMLINKS["SymLinksBootstrap<br/>Swap active ticket context<br/>per project folder"]
        PLANNING["planning/<br/>SDLC templates, vision docs,<br/>retrospectives"]
        HUB --- TICKETS
        HUB --- SYMLINKS
        HUB --- PLANNING
    end

    subgraph "LAYER 5: MIND — AI at Every Layer"
        direction LR
        LEARN["Phase 1: LEARN<br/>AI teaches domain<br/>(Use Case Analysis)"]
        DOC["Phase 2: DOCUMENT<br/>AI generates UML suite<br/>(4-level resolution)"]
        PLAN["Phase 3-4: UNDERSTAND + PLAN<br/>AI analyzes impact,<br/>writes implementation spec"]
        IMPL["Phase 5: IMPLEMENT<br/>AI writes code<br/>(in real repo or gitea experiment)"]
        REFINE["Phase 6-7: BEFORE/AFTER + REFINE<br/>AI updates diagrams<br/>showing what changed"]
        ARTIFACT["Phase 8: ARTIFACT<br/>AI produces Jira ticket,<br/>PR description, risk analysis"]
        LEARN --> DOC --> PLAN --> IMPL --> REFINE --> ARTIFACT
    end

    subgraph "LAYER 6: HOOKS — Workflow Enforcement (Future)"
        direction LR
        HOOKSAI["hooksai<br/>AI-powered file watchers"]
        SECRETS_GUARD["Secrets Guardian<br/>Prevent corruption"]
        DOC_COMPLY["Doc Compliance<br/>Keep planning in sync"]
        RELEASE["Release Pipeline<br/>Alpha → Beta → V1"]
        HOOKSAI --- SECRETS_GUARD
        HOOKSAI --- DOC_COMPLY
        HOOKSAI --- RELEASE
    end

    %% Layer connections (how they compose)
    NIX -.->|"provides base env"| PERPROJ
    PERPROJ -.->|"isolated env for"| GITEA
    GITEA -.->|"experiments tracked in"| TICKETS
    TICKETS -.->|"AI analysis at every step"| LEARN
    HOOKSAI -.->|"enforces workflows across"| HUB
```

## Scenario: "I get assigned WEB-5000"

```mermaid
sequenceDiagram
    participant Dev as Developer (Len)
    participant L1 as Layer 1: Bones<br/>(~/.config/nix)
    participant L2 as Layer 2: Nervous System<br/>(per-project env)
    participant L4 as Layer 4: Skin<br/>(~/projects)
    participant L5 as Layer 5: Mind<br/>(AI workflow)
    participant L3 as Layer 3: Muscles<br/>(gitea-local)

    Note over Dev: Regular dev mode (bones + nervous system)
    Dev->>L4: mkdir tickets/WEB-5000/
    Dev->>L4: symlink jha/banno-online/WEB-5000 → tickets/WEB-5000/

    Note over Dev,L5: Flip on Layer 5: AI Analysis
    Dev->>L5: "Teach me about Conversations feature"
    L5->>L4: Creates WEB-5000/conversations-uml.md<br/>(Use Cases → Sequences → Activities → Classes)
    Dev->>L5: "Analyze what needs to change"
    L5->>L4: Creates WEB-5000/CHAT_TERMINATION_PLAN.md

    Note over Dev,L3: Flip on Layer 3: Experiment Mode
    Dev->>L3: switch-to-gitea
    L3-->>Dev: Now in experiments/exp-007
    Dev->>L5: "Implement the plan"
    L5->>L3: Code changes in gitea experiment
    Dev->>L5: "Update diagrams with before/after"
    L5->>L4: Updates UML with pink=old, green=new

    alt Experiment works
        Dev->>L3: Promote experiment
        L3->>L1: Cherry-pick to real branch
        Dev->>L3: switch-to-github
    else Experiment fails
        Dev->>L3: switch-to-github (discard)
        Note over L3: Experiment preserved in gitea<br/>for future reference
    end

    Dev->>L5: "Create Jira ticket doc"
    L5->>L4: Creates WEB-5000/JIRA-chat-termination.md
    Note over Dev: Done. Flip back to bones-only mode.
```

## Layer Status Matrix

| Layer | Component | Status | Location |
|-------|-----------|--------|----------|
| **1: Bones** | flake.nix global config | Working | `~/.config/nix/flake.nix` |
| **1: Bones** | Per-project templates | Ready | `~/.config/nix/templates/` |
| **2: Nervous System** | plantuml-server (ephemeral) | Working POC | `~/projects/global/plantuml-server/` |
| **2: Nervous System** | CCHV per-project flake | Working POC | `~/projects/global/claude-code-history-viewer/` |
| **3: Muscles** | gitea-local (experimentation) | Working POC | `~/projects/global/gitea-local/` |
| **3: Muscles** | switch-to-gitea/github scripts | Working (Task 1) | `~/projects/global/gitea-local/bin/` |
| **4: Skin** | ~/projects workspace hub | Active | `~/projects/` |
| **4: Skin** | Ticket folders (ephemeral-registered) | Working | `~/projects/tickets/` |
| **4: Skin** | SymLinksBootstrap | Working | `~/projects/bin/symlinks-bootstrap` |
| **4: Skin** | Planning templates | Working | `~/projects/planning/templates/` |
| **5: Mind** | 8-phase AI workflow | Formalized | `~/projects/planning/templates/workflow-template.md` |
| **6: Hooks** | hooksai integration | Vision only | `~/projects/planning/vision/` |

## How Layers Compose

Each layer is independently useful but gains power through composition:

- **Bones only**: Standard dev — nix provides tools, direnv auto-loads
- **Bones + Nervous System**: Per-project isolation — each project gets its own environment
- **+ Muscles**: Safe experimentation — try risky changes in gitea, promote or discard
- **+ Skin**: Organized workspace — tickets, planning docs, symlinked contexts
- **+ Mind**: AI-augmented workflow — every phase documented, analyzed, and automated
- **+ Hooks**: Enforced quality — AI watches for secrets, compliance, release readiness
