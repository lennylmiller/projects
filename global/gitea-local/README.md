# Gitea Local Experimentation System

A complete system for safe, sandboxed code experimentation using local Gitea as an "experiment universe" separate from your production GitHub workflow.

## The Problem

Developers need a safe place to:
- Test wild ideas without polluting GitHub history
- Experiment with breaking changes
- Try multiple approaches in parallel
- Preserve experiments for later review
- Keep GitHub branches clean and professional

## The Solution

Use **local Gitea** as an experimentation sandbox with seamless switching between GitHub (production) and Gitea (experiments).

### Key Features

✅ **Seamless Context Switching** - Switch between GitHub and Gitea with simple commands
✅ **Automatic Experiment Numbering** - Sequential branches (`exp-001`, `exp-002`, ...)
✅ **State Preservation** - Never lose work when switching contexts
✅ **Same Directory** - No need for multiple checkouts
✅ **Paper Trail** - All experiments preserved in Gitea for later review

---

## Quick Start

### 1. Start Gitea Server

```bash
cd /Users/LenMiller/code/shell-nix/gitea-local
./bin/gitea-start
```

Access at: **http://localhost:3000/**

### 2. Create an Experiment

```bash
# From any GitHub branch with clean working directory
./bin/switch-to-gitea
```

### 3. Work on Experiment

```bash
# Make changes
echo "experimental code" > new-feature.ts
git add new-feature.ts
git commit -m "Try new approach"

# Push to Gitea
git push gitea experiments/exp-001
```

### 4. Return to GitHub

```bash
./bin/switch-to-github
```

Your GitHub branch is exactly as you left it. The experiment is preserved in Gitea.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Local Repository                      │
│                ~/code/your-project                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Branch: feature/auth-refactor  ◄───┐                   │
│                                      │                   │
│  Git Remotes:                       │                   │
│    origin (GitHub)  ────────────────┘                   │
│    gitea (Local)    ────────────────┐                   │
│                                      │                   │
│  Experiment Branch:                  │                   │
│    experiments/exp-001  ─────────────┘                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
                    │                       │
                    │                       │
                    ▼                       ▼
         ┌──────────────────┐    ┌──────────────────┐
         │  GitHub Remote   │    │  Gitea Remote    │
         │  (Production)    │    │  (localhost:3000)│
         ├──────────────────┤    ├──────────────────┤
         │ main             │    │ exp-001          │
         │ feature/auth     │    │ exp-002          │
         │ feature/api      │    │ exp-003          │
         └──────────────────┘    └──────────────────┘
```

### The Two Universes

**🌍 GitHub Universe (Production)**
- Stable, clean branches
- Professional commit history
- Code reviews and PRs
- Deployed to production

**🧪 Gitea Universe (Experiments)**
- Wild experimentation
- Multiple approaches in parallel
- Safe to break things
- Preserved for later review

---

## Installation & Setup

### Prerequisites

- **Nix** package manager
- **jq** for JSON parsing (included in shell.nix)
- **Git** with configured remotes

### Initial Setup

1. **Start Gitea:**
   ```bash
   cd /Users/LenMiller/code/shell-nix/gitea-local
   nix-shell
   ./bin/gitea-start
   ```

2. **Access Gitea Web UI:**
   - Open: http://localhost:3000/
   - If first time, complete installation wizard
   - Create admin account

3. **Create Repository in Gitea:**
   - Click "+" → "New Repository"
   - Name it to match your local repo (e.g., "your-project")
   - Keep it empty (no README)

4. **Add Gitea Remote:**
   ```bash
   cd ~/code/your-project
   git remote add gitea http://localhost:3000/YourUsername/your-project.git
   ```

5. **Add bin/ to PATH (optional):**
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export PATH="/Users/LenMiller/code/shell-nix/gitea-local/bin:$PATH"
   ```

---

## Commands Reference

### Experiment Workflow

| Command | Purpose |
|---------|---------|
| `switch-to-gitea` | Create new experiment from current branch |
| `switch-to-github` | Return to original GitHub branch |

### Gitea Server Management

| Command | Purpose |
|---------|---------|
| `gitea-start` | Start Gitea server in background |
| `gitea-stop` | Stop Gitea server gracefully |
| `gitea-restart` | Restart Gitea server |
| `gitea-status` | Check server status and details |
| `gitea-logs` | View server logs (with options) |

---

## Complete Workflow Examples

### Example 1: Simple Experiment

```bash
# Starting on GitHub branch
$ git branch
* feature/user-auth

# Clean working directory
$ git status
On branch feature/user-auth
nothing to commit, working tree clean

# Switch to Gitea experiment
$ switch-to-gitea
✓ Switched to Gitea experiment mode

  Experiment:      experiments/exp-001
  Original branch: feature/user-auth
  State:           Clean

# Now on experiment branch
$ git branch
* experiments/exp-001

# Make experimental changes
$ echo "new auth approach" > auth-v2.ts
$ git add auth-v2.ts
$ git commit -m "Try OAuth2 instead of JWT"

# Push to Gitea
$ git push gitea experiments/exp-001

# Switch back to GitHub
$ switch-to-github
✓ Experiment pushed to Gitea
✓ Returned to GitHub context

  Current branch:  feature/user-auth
  Experiment preserved: experiments/exp-001 (in Gitea)

# Back on GitHub branch
$ git branch
* feature/user-auth

# Experiment file is NOT here (as expected)
$ ls auth-v2.ts
ls: auth-v2.ts: No such file or directory
```

**Result:**
- Experiment preserved in Gitea as `experiments/exp-001`
- GitHub branch unchanged
- Can create more experiments or review later

---

### Example 2: Multiple Experiments

```bash
# First experiment
$ switch-to-gitea
# ... work on experiments/exp-001 ...
$ switch-to-github

# Continue work on GitHub
$ git commit -am "Fix bug in login"

# Second experiment (from updated state)
$ switch-to-gitea
✓ Switched to Gitea experiment mode

  Experiment:      experiments/exp-002  ← New number!
  Original branch: feature/user-auth
  State:           Clean

# ... work on experiments/exp-002 ...
$ switch-to-github

# View all experiments in Gitea
$ git ls-remote gitea experiments/exp-*
abc123... refs/heads/experiments/exp-001
def456... refs/heads/experiments/exp-002
```

**Result:**
- Two independent experiments preserved
- Both can be reviewed/merged later
- GitHub branch has the bug fix
- Experiments don't interfere with each other

---

### Example 3: Reviewing Old Experiments

```bash
# List all experiments
$ git ls-remote gitea experiments/exp-*
abc123... refs/heads/experiments/exp-001
def456... refs/heads/experiments/exp-002
ghi789... refs/heads/experiments/exp-003

# Checkout an old experiment to review
$ git fetch gitea experiments/exp-001
$ git checkout -b review-exp-001 gitea/experiments/exp-001

# Review the changes
$ git log --oneline
$ git diff feature/user-auth...review-exp-001

# If good, merge to GitHub branch
$ git checkout feature/user-auth
$ git merge review-exp-001

# Push to GitHub
$ git push origin feature/user-auth
```

---

## How It Works

### State Tracking

When you run `switch-to-gitea`, it creates a state file:

**`.git/gitea-state/current.json`:**
```json
{
  "mode": "gitea",
  "experiment_branch": "experiments/exp-001",
  "experiment_number": 1,
  "original_branch": "feature/user-auth",
  "original_commit": "abc123def456...",
  "timestamp": "2026-01-24T05:30:00-08:00",
  "clean_state": true
}
```

This tracks:
- What experiment you're on
- Where you came from
- Original commit for verification
- Whether state was clean

### Experiment Numbering

The system automatically finds the next experiment number:

```bash
# Check Gitea remote for existing experiments
git ls-remote gitea 'refs/heads/experiments/exp-*'

# Extract highest number, add 1
experiments/exp-001
experiments/exp-002
experiments/exp-003
# Next will be: experiments/exp-004
```

### Auto-Commit on Return

When switching back to GitHub, uncommitted work is automatically committed:

```bash
$ switch-to-github
Uncommitted changes detected. Committing automatically...
✓ Changes committed

Auto-commit before switching back to GitHub

Experimental work on: experiments/exp-001
Returning to: feature/user-auth
Timestamp: 2026-01-24T05:30:00-08:00
```

This ensures no work is lost.

---

## Task Implementation Status

### ✅ Task 0: Manual Experimentation (Complete)
- Manually tested GitHub ↔ Gitea switching
- Validated clean state switching
- Validated dirty state switching (WIP commit pattern)
- Documented findings in `SWITCH-ANALYSIS.md`

### ✅ Task 1: Happy Path #1 - Clean State (Complete)
- Automated switching for clean working directory
- Experiment numbering and tracking
- State persistence in JSON
- Scripts: `switch-to-gitea`, `switch-to-github`

### 🚧 Task 2: Happy Path #2 - Dirty State (Planned)
- Support uncommitted changes
- WIP commit + restore pattern
- Exact state restoration on return

### 📋 Task 3: Edge Cases & Refinement (Future)
- Conflict resolution
- Multi-user scenarios
- Experiment cleanup commands
- Promotion pipeline (Gitea → GitHub)

---

## Current Limitations (Task 1)

**Task 1 requires clean working directory:**

```bash
$ git status
On branch feature/auth
Changes not staged for commit:
  modified: login.ts

$ switch-to-gitea
Error: Working directory has uncommitted changes

Options:
  1. Commit your changes: git add -A && git commit -m "..."
  2. Stash your changes: git stash
  3. Wait for Task 2 implementation (dirty state support)
```

**Workaround until Task 2:**
```bash
# Option 1: Commit first
git add -A && git commit -m "WIP: Before experiment"
switch-to-gitea

# Option 2: Stash first
git stash
switch-to-gitea
# ... experiment ...
switch-to-github
git stash pop
```

---

## Configuration Files

### Gitea Configuration

**Location:** `/Users/LenMiller/code/shell-nix/gitea-local/custom/app.ini`

**Key settings:**
```ini
[server]
APP_DATA_PATH = /Users/LenMiller/code/shell-nix/gitea-local/data
HTTP_PORT = 3000
ROOT_URL = http://localhost:3000/

[repository]
ROOT = /Users/LenMiller/code/shell-nix/gitea-local/gitea-data/repositories

[database]
DB_TYPE = sqlite3
PATH = /Users/LenMiller/code/shell-nix/gitea-local/data/gitea.db
```

### Git Configuration

**Add Gitea remote to your project:**
```bash
cd ~/code/your-project
git remote add gitea http://localhost:3000/YourUsername/your-project.git

# Or with credentials embedded (local development only)
git remote add gitea http://username:password@localhost:3000/YourUsername/your-project.git
```

**View remotes:**
```bash
git remote -v
origin  https://github.com/YourUsername/your-project.git (fetch)
origin  https://github.com/YourUsername/your-project.git (push)
gitea   http://localhost:3000/YourUsername/your-project.git (fetch)
gitea   http://localhost:3000/YourUsername/your-project.git (push)
```

---

## Directory Structure

```
gitea-local/
├── bin/                          # Helper scripts
│   ├── switch-to-gitea           # Switch to experiment mode
│   ├── switch-to-github          # Return to GitHub mode
│   ├── gitea-start               # Start Gitea server
│   ├── gitea-stop                # Stop Gitea server
│   ├── gitea-restart             # Restart Gitea server
│   ├── gitea-status              # Check server status
│   ├── gitea-logs                # View server logs
│   ├── README.md                 # Switching scripts docs
│   └── GITEA-MANAGEMENT.md       # Server management docs
│
├── custom/                       # Gitea configuration
│   └── app.ini                   # Main config file
│
├── data/                         # Gitea runtime data (gitignored)
│   ├── gitea.db                  # SQLite database
│   ├── sessions/                 # User sessions
│   ├── avatars/                  # User avatars
│   └── jwt/                      # JWT keys
│
├── gitea-data/                   # Git repository storage (gitignored)
│   └── repositories/             # Bare git repos
│       └── username/
│           └── repo-name.git/
│
├── log/                          # Gitea application logs
│
├── README.md                     # This file
├── SWITCH-ANALYSIS.md            # Task 0 analysis & findings
├── INSTALLATION-STATUS.md        # Installation notes
├── shell.nix                     # Nix development environment
├── start-gitea.sh                # Interactive Gitea start script
└── .gitignore                    # Ignore runtime data
```

---

## Troubleshooting

### "Gitea remote not configured"

**Problem:**
```bash
$ switch-to-gitea
Error: Gitea remote 'gitea' not configured
```

**Solution:**
```bash
git remote add gitea http://localhost:3000/YourUsername/your-repo.git
```

---

### "Already in Gitea mode"

**Problem:**
```bash
$ switch-to-gitea
Error: Already in Gitea mode on branch: experiments/exp-001
```

**Solution:**
```bash
# Switch back first
switch-to-github

# Then create new experiment
switch-to-gitea
```

---

### "Working directory has uncommitted changes"

**Problem:**
```bash
$ switch-to-gitea
Error: Task 1 (Happy Path #1) requires clean working directory
```

**Solution (Option 1 - Commit):**
```bash
git add -A
git commit -m "WIP: Before experiment"
switch-to-gitea
```

**Solution (Option 2 - Stash):**
```bash
git stash
switch-to-gitea
# ... work ...
switch-to-github
git stash pop
```

**Solution (Option 3 - Wait):**
Task 2 will add automatic dirty state handling.

---

### Gitea server not running

**Problem:**
```bash
$ switch-to-gitea
# Hangs when checking remote...
```

**Check status:**
```bash
gitea-status
```

**Start if needed:**
```bash
gitea-start
```

---

### Port 3000 already in use

**Problem:**
```bash
$ gitea-start
Error: Failed to start Gitea
# Log shows: address already in use
```

**Find what's using port 3000:**
```bash
lsof -i :3000
```

**Kill the process or change Gitea port:**
```bash
# Option 1: Kill existing process
kill <PID>

# Option 2: Change Gitea port in custom/app.ini
[server]
HTTP_PORT = 3001  # Change from 3000
```

---

## Best Practices

### 1. Always Check Status Before Switching

```bash
# Check current branch and state
git status

# Check if in Gitea mode
cat .git/gitea-state/current.json 2>/dev/null || echo "Not in Gitea mode"
```

### 2. Use Descriptive Commit Messages in Experiments

```bash
# Good
git commit -m "Try OAuth2 with PKCE flow instead of standard JWT"

# Less helpful
git commit -m "test"
```

### 3. Push Experiments Regularly

```bash
# Push after significant changes
git push gitea experiments/exp-001

# This preserves your work in Gitea
```

### 4. Review Experiments Before Deleting

```bash
# List experiments
git ls-remote gitea experiments/exp-*

# Review before cleanup
git fetch gitea experiments/exp-001
git log gitea/experiments/exp-001
git diff main...gitea/experiments/exp-001
```

### 5. Keep Gitea Running During Development

```bash
# Start once at beginning of day
gitea-start

# Check status periodically
gitea-status

# Stop at end of day
gitea-stop
```

---

## Security Considerations

### Local Development Only

⚠️ **This setup is for LOCAL DEVELOPMENT ONLY**

**Do not:**
- Expose Gitea to the internet
- Use in production
- Store sensitive production data
- Share credentials

### Credential Management

**Current (OK for local POC):**
```bash
git remote add gitea http://username:password@localhost:3000/repo.git
```

**Better (for shared use):**
```bash
# Use git credential helper
git config credential.helper store
git push gitea  # Prompts once, then caches
```

### Data Privacy

**Gitea stores:**
- User sessions (`.gitea-local/data/sessions/`)
- User avatars
- JWT keys
- Repository data

**These are gitignored** and not committed to version control.

---

## Performance Tips

### Gitea Startup Time

**Cold start:** ~2-3 seconds
**Warm start:** ~1 second

**To minimize restarts:**
```bash
# Keep Gitea running in background
gitea-start  # At start of day
gitea-stop   # At end of day
```

### Switching Speed

**switch-to-gitea:** ~0.5 seconds (includes git ls-remote)
**switch-to-github:** ~1-2 seconds (includes push to Gitea)

**Bottleneck:** Network I/O to Gitea (localhost, so minimal)

---

## Advanced Usage

### Experiment Cleanup

**List all experiments:**
```bash
git ls-remote gitea experiments/exp-*
```

**Delete experiment from Gitea:**
```bash
git push gitea :experiments/exp-001
```

**Delete local experiment branch:**
```bash
git branch -D experiments/exp-001
```

### Bulk Operations

**Delete all experiments (careful!):**
```bash
# Delete from Gitea
git ls-remote gitea 'refs/heads/experiments/exp-*' | \
  awk '{print ":"$2}' | \
  xargs git push gitea

# Delete local branches
git branch | grep 'experiments/exp-' | xargs git branch -D
```

### Experiment Merging

**Merge experiment to GitHub branch:**
```bash
# Fetch experiment
git fetch gitea experiments/exp-001

# Create review branch
git checkout -b review-exp-001 gitea/experiments/exp-001

# Review changes
git log
git diff feature/main-branch...review-exp-001

# Merge if good
git checkout feature/main-branch
git merge review-exp-001

# Push to GitHub
git push origin feature/main-branch
```

---

## Related Documentation

- **`bin/README.md`** - Switching scripts reference
- **`bin/GITEA-MANAGEMENT.md`** - Server management reference
- **`SWITCH-ANALYSIS.md`** - Task 0 analysis and technical decisions
- **`INSTALLATION-STATUS.md`** - Installation notes and setup

---

## Roadmap

### Short Term (Task 2)
- [ ] Dirty state support (WIP commit + restore)
- [ ] Automatic state restoration
- [ ] Enhanced error handling

### Medium Term (Task 3)
- [ ] Experiment cleanup commands
- [ ] Conflict resolution strategies
- [ ] Experiment listing and filtering
- [ ] Promotion pipeline (Gitea → GitHub)

### Long Term
- [ ] Multi-user experiment numbering
- [ ] Experiment tagging and search
- [ ] Integration with PR workflow
- [ ] Automated testing in Gitea before GitHub promotion

---

## Contributing

This is a personal development tool. Improvements welcome!

**Areas for contribution:**
- Additional automation scripts
- Better error messages
- Performance optimizations
- Documentation improvements

---

## License

MIT License - Feel free to use and modify for your own development workflow.

---

## Support

**Issues or questions?**
1. Check `SWITCH-ANALYSIS.md` for technical details
2. Check `bin/GITEA-MANAGEMENT.md` for server management
3. Review troubleshooting section above
4. Check Gitea logs: `gitea-logs`

---

## Acknowledgments

Built using:
- **Gitea** - Self-hosted Git service
- **Nix** - Reproducible development environment
- **Bash** - Shell scripting
- **jq** - JSON processing

Inspired by the need for safe, sandboxed experimentation in professional development workflows.
