# Vision: hooksai Integration with ~/projects

**Date**: 2026-02-06
**Status**: Niggle → Glimpse
**Visual Diagram**: [hooksai Integration Diagram](../../Excalidraw/hooksai-projects-integration-vision.excalidraw.md)

---

## The Niggle

There's a pattern emerging across our workflow challenges:
- Secrets keep getting corrupted
- Planning docs drift out of sync with code
- Alpha/Beta/Production criteria aren't enforced
- Git commits happen without proper documentation

**Core insight**: These are all **workflow enforcement problems** that could be solved by AI-powered file-watching hooks.

---

## The Discovery: hooksai

**Repository**: https://github.com/Banno/hooksai

hooksai is a CLI tool that watches files and runs AI-powered hooks when changes occur. It's like git hooks on steroids, but for any file change, with AI decision-making built in.

### How It Works

1. **File Watcher** (fswatch): Monitors directories for changes
2. **Smart Batching**: Groups changes, provides incremental diffs to AI
3. **AI Analysis**: Gemini/Claude analyzes diffs with context-aware prompts
4. **.hook.md Files**: Markdown-based hook definitions with YAML frontmatter
5. **Tool Execution**: AI can use glob, search, read, write, string_replace, shell commands
6. **Auto-approval or Confirmation**: User can pre-approve certain actions

### Key Features

**Markdown-based Configuration**:
```markdown
---
glob: "**/*.{js,ts,tsx}"
priority: 10
run_on_events: [created, modified]
runner: "gemini-2.5-flash"
system_prompt: "You are a code reviewer..."
temperature: 0.7
auto_approve_commands: ["echo", "cat"]
---

Your hook logic here...
```

**AI Models Supported**:
- Gemini 2.5 Flash, 2.5 Pro
- Claude 3.7 Sonnet, 4.5 Haiku, 4 Sonnet, 4 Opus (via Vertex AI)

**Available Tools**:
- `glob` - Find files by pattern
- `search_codebase` - Semantic code search
- `read_file` - Read file contents
- `write_file` - Write to files
- `string_replace` - Edit files
- `list_directory` - List directory contents
- `run_shell_command` - Execute shell commands

---

## The Glimpse: Integration Points

### 1. Git Workflow Enforcement

**Use Case**: Prevent commits that violate workflow rules

**Hook Example**: `.hooks/pre-commit-workflow.hook.md`
```markdown
---
glob: ".git/index"
run_on_events: [modified]
runner: "claude-4.5-sonnet"
system_prompt: "You enforce workflow compliance..."
---

When git index changes (staging area):
1. Check if planning docs exist for modified files
2. Verify VISION.md is updated if flake.nix changed
3. Ensure no secrets in staged files
4. Block commit if violations found
```

### 2. Secrets Safety Guardian

**Use Case**: Prevent secrets corruption and detect exposure

**Hook Example**: `.hooks/secrets-guardian.hook.md`
```markdown
---
glob: "secrets/*.age"
run_on_events: [modified]
runner: "gemini-2.5-flash"
priority: 100
---

When secrets files change:
1. Verify file size > 500 bytes (detect LFS pointer corruption)
2. Check for plaintext secrets patterns
3. Alert if secrets appear in other files
4. Auto-backup before changes
```

### 3. Documentation Compliance

**Use Case**: Keep planning docs in sync with code

**Hook Example**: `.hooks/doc-compliance.hook.md`
```markdown
---
glob: "**/{flake.nix,*.sh,*.zsh}"
run_on_events: [modified]
runner: "claude-4.5-sonnet"
---

When config files change:
1. Check if corresponding planning doc exists
2. Suggest updates to VISION.md, README.md
3. Auto-generate changelog entries
4. Update INDEX.md metrics
```

### 4. Release Pipeline Automation

**Use Case**: Automate Alpha → Beta → V1 promotion

**Hook Example**: `.hooks/release-pipeline.hook.md`
```markdown
---
glob: "global/*/VERSION"
run_on_events: [modified]
runner: "claude-4.5-sonnet"
auto_approve_commands: ["git tag", "gh release create"]
---

When VERSION file changes:
1. Analyze git history for stability
2. Check test coverage, documentation completeness
3. Determine if criteria met for promotion
4. Auto-create git tag, GitHub release
5. Update planning docs with release notes
```

---

## Architecture Vision

```
~/projects/
├── .hooks/                    # hooksai hook definitions
│   ├── pre-commit-workflow.hook.md
│   ├── secrets-guardian.hook.md
│   ├── doc-compliance.hook.md
│   └── release-pipeline.hook.md
│
├── global/                    # Monitored by hooksai
│   ├── plantuml-server/
│   ├── claude-plugins/
│   └── claude-code-history-viewer/
│
├── planning/                  # Auto-updated by hooksai
│   ├── vision/
│   ├── specs/
│   └── reviews/
│
└── .hooksai-config.json       # hooksai configuration
```

---

## Integration with Existing Systems

### With nix-darwin
- Hook on flake.nix changes → validate syntax before rebuild
- Hook on secrets/*.age → prevent corruption
- Hook on shell/*.zsh → update documentation

### With Planning System
- Hook on code changes → remind about planning docs
- Hook on planning docs → validate against templates
- Auto-generate retrospectives from git history

### With Git
- Pre-commit hooks via hooksai (not git hooks)
- More powerful: AI can analyze full context
- Can auto-commit documentation updates

### With Claude Code
- Hooks can invoke Claude Code for complex analysis
- Share MCP server connections
- Coordinate on file operations

---

## Proof of Concept Roadmap

### PoC 1: Secrets Guardian (1 week)
**Goal**: Prevent secrets corruption

- [ ] Install hooksai in ~/projects
- [ ] Create `.hooks/secrets-guardian.hook.md`
- [ ] Test with intentional corruption
- [ ] Verify auto-backup and alerts work

### PoC 2: Documentation Compliance (1 week)
**Goal**: Auto-remind about planning docs

- [ ] Create `.hooks/doc-compliance.hook.md`
- [ ] Test on flake.nix edit
- [ ] Verify planning doc suggestions
- [ ] Auto-link planning docs to code

### PoC 3: Release Pipeline (2 weeks)
**Goal**: Automate version promotion

- [ ] Define Alpha/Beta/V1 criteria
- [ ] Create `.hooks/release-pipeline.hook.md`
- [ ] Test with claude-code-history-viewer
- [ ] Validate auto-tagging works

### PoC 4: Git Workflow Enforcement (1 week)
**Goal**: Block non-compliant commits

- [ ] Create `.hooks/pre-commit-workflow.hook.md`
- [ ] Test commit blocking
- [ ] Verify workflow suggestions
- [ ] Measure impact on workflow quality

---

## Success Criteria

### Immediate (PoC 1)
- ✅ Secrets corruption prevented
- ✅ Auto-backup on secrets changes
- ✅ No false positives

### Short-term (PoCs 2-3)
- ✅ Planning docs stay in sync
- ✅ Version promotion automated
- ✅ Release notes auto-generated

### Long-term (PoC 4 + beyond)
- ✅ Workflow compliance > 90%
- ✅ Zero secrets incidents
- ✅ Documentation drift < 5%
- ✅ Release cycle time reduced 50%

---

## Questions to Answer

### Technical
- [ ] How does hooksai handle concurrent file changes?
- [ ] Can hooks invoke other hooks (dependency chains)?
- [ ] What's the latency between file change and hook execution?
- [ ] How to test hooks without affecting real files?

### Workflow
- [ ] When should hooks auto-approve vs. ask for confirmation?
- [ ] How to balance automation vs. control?
- [ ] What happens if AI makes wrong decision?
- [ ] How to rollback hook actions?

### Integration
- [ ] How to share context between hooksai and Claude Code?
- [ ] Can hooks read from MCP servers?
- [ ] How to coordinate file operations with Nix rebuilds?
- [ ] Should hooks run in sandboxed environment?

---

## Tangents & Future Ideas

### Tangent 1: AI Pair Programming via Hooks
- Hook on file save → auto-suggest improvements
- Like GitHub Copilot but for entire files
- Uses planning docs as context

### Tangent 2: Learning System
- Hooks observe your workflow patterns
- Build knowledge graph of conventions
- Auto-generate documentation from behavior

### Tangent 3: Multi-Project Orchestration
- Hooks coordinate across ~/projects hierarchy
- E.g., global changes propagate to personal projects
- Dependency-aware hook execution

---

## Next Steps

1. **Fork hooksai** to my GitHub account
2. **Download to ~/projects/global/hooksai**
3. **Deep dive** on architecture and examples
4. **Create PoC 1 plan** (Secrets Guardian)
5. **Build visual diagrams** for each use case
6. **Experiment** with .hook.md files

---

## References

- [hooksai GitHub](https://github.com/Banno/hooksai)
- [~/projects VISION.md](../../VISION.md)
- [Visual Diagram](../../Excalidraw/hooksai-projects-integration-vision.excalidraw.md)
- [Planning System](../README.md)

---

**Status**: This is the "Glimpse" phase. We've seen the potential, now we need Proof of Concept.

**Last Updated**: 2026-02-06
**Next Review**: After PoC 1 completion
