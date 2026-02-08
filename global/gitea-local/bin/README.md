# Gitea Switching Scripts

Scripts to automate switching between GitHub and Gitea experiment contexts.

## Scripts

### `switch-to-gitea`
Switch from GitHub context to Gitea experiment mode.

**Task 1 Implementation:** Clean state only (requires clean working directory).

**Usage:**
```bash
./switch-to-gitea
```

**What it does:**
1. Verifies clean working directory (no uncommitted changes)
2. Gets current branch name
3. Finds next experiment number from Gitea remote
4. Creates `experiments/exp-NNN` branch
5. Saves state to `.git/gitea-state/current.json`

**State File Format:**
```json
{
  "mode": "gitea",
  "experiment_branch": "experiments/exp-001",
  "experiment_number": 1,
  "original_branch": "feature/gitea-local",
  "original_commit": "abc123...",
  "timestamp": "2026-01-23T22:00:00-08:00",
  "clean_state": true
}
```

---

### `switch-to-github`
Return from Gitea experiment to GitHub context.

**Usage:**
```bash
./switch-to-github
```

**What it does:**
1. Reads state from `.git/gitea-state/current.json`
2. Auto-commits any uncommitted work on experiment branch
3. Pushes experiment branch to Gitea remote (preserves work)
4. Switches back to original GitHub branch
5. Cleans up state file

---

## Installation

Add these scripts to your PATH:

```bash
# Option 1: Add to shell.nix
# (see ../shell.nix for configuration)

# Option 2: Manual PATH export
export PATH="/Users/LenMiller/code/shell-nix/gitea-local/bin:$PATH"
```

---

## Workflow Example

```bash
# Starting on feature/auth-refactor (GitHub)
$ git status
On branch feature/auth-refactor
nothing to commit, working tree clean

# Switch to Gitea experiment
$ switch-to-gitea
✓ Switched to Gitea experiment mode

  Experiment:      experiments/exp-001
  Original branch: feature/auth-refactor
  State:           Clean

# Make experimental changes
$ echo "Experimental auth approach" > new-auth.ts
$ git add new-auth.ts
$ git commit -m "Try new authentication approach"

# Push to Gitea
$ git push gitea experiments/exp-001

# Return to GitHub
$ switch-to-github
✓ Experiment pushed to Gitea
✓ Returned to GitHub context

  Current branch:  feature/auth-refactor
  Experiment preserved: experiments/exp-001 (in Gitea)

# Back to original state
$ git status
On branch feature/auth-refactor
nothing to commit, working tree clean
```

---

## Requirements

- **jq**: JSON processor (for reading state files)
  ```bash
  nix-shell -p jq
  ```

- **Gitea remote**: Must be configured
  ```bash
  git remote add gitea http://localhost:3000/YourUsername/YourRepo.git
  ```

---

## Task Roadmap

- [x] **Task 1:** Happy Path #1 - Clean state switching
- [ ] **Task 2:** Happy Path #2 - Dirty state switching (WIP commit + restore)
- [ ] **Task 3:** Edge cases and refinement

---

## Troubleshooting

### "Not in Gitea experiment mode"
You need to run `switch-to-gitea` first before using `switch-to-github`.

### "Already in Gitea mode"
You're already in an experiment. Use `switch-to-github` to return first.

### "Gitea remote not configured"
Add the Gitea remote:
```bash
git remote add gitea http://localhost:3000/YourUsername/YourRepo.git
```

### "jq is required but not installed"
Install jq:
```bash
nix-shell -p jq
# or add to shell.nix
```

---

## Future Enhancements (Task 2+)

- [ ] Dirty state support (WIP commit + restore pattern)
- [ ] Experiment cleanup commands
- [ ] Experiment listing and filtering
- [ ] Promotion pipeline (Gitea → GitHub)
- [ ] Multi-user experiment numbering
