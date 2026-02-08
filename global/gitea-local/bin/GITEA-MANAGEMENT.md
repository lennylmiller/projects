# Gitea Server Management

Quick reference for managing the local Gitea instance.

## Quick Start

```bash
gitea-start    # Start Gitea server
gitea-status   # Check if running
gitea-logs     # View logs
gitea-stop     # Stop server
```

---

## Commands

### `gitea-start`
Start Gitea server in the background.

**Usage:**
```bash
gitea-start
```

**Output:**
```
✓ Gitea started successfully

  PID:          12345
  URL:          http://localhost:3000/
  Log file:     /Users/LenMiller/code/shell-nix/gitea-local/gitea-server.log

Commands:
  gitea-status  - Check server status
  gitea-logs    - View server logs
  gitea-stop    - Stop server
```

**What it does:**
- Checks if Gitea is already running
- Starts Gitea using `nix-shell` in background
- Saves process ID for later management
- Logs output to `gitea-server.log`

---

### `gitea-stop`
Stop the Gitea server gracefully.

**Usage:**
```bash
gitea-stop
```

**Output:**
```
Stopping Gitea (PID: 12345)...
✓ Gitea stopped successfully
```

**What it does:**
- Sends graceful shutdown signal (SIGTERM)
- Waits up to 10 seconds for clean shutdown
- Forces kill (SIGKILL) if necessary
- Cleans up PID file

---

### `gitea-restart`
Restart the Gitea server (stop + start).

**Usage:**
```bash
gitea-restart
```

**Output:**
```
Restarting Gitea...

Stopping Gitea (PID: 12345)...
✓ Gitea stopped successfully

Starting Gitea server...
✓ Gitea started successfully
...
```

---

### `gitea-status`
Check if Gitea is running and show details.

**Usage:**
```bash
gitea-status
```

**Output when running:**
```
=== Gitea Server Status ===

Status:       RUNNING ✓
PID:          12345
Started:      Thu Jan 23 21:03:00 2026
Web UI:       ACCESSIBLE ✓
URL:          http://localhost:3000/
Log file:     /Users/LenMiller/code/shell-nix/gitea-local/gitea-server.log

Recent log entries:
  2026/01/23 21:03:01 modules/graceful/server.go:50:NewServer() [I] Starting new Web server
  2026/01/23 21:05:32 routers/web/repo/view.go:123:renderCode() [I] Rendering repository code
  2026/01/23 21:07:45 modules/context/repo.go:234:RepoAssignment() [I] Repository accessed

Commands:
  gitea-start   - Start Gitea server
  gitea-stop    - Stop Gitea server
  gitea-restart - Restart Gitea server
  gitea-logs    - View server logs
```

**Output when not running:**
```
=== Gitea Server Status ===

Status:       NOT RUNNING ✗

Start with: gitea-start

Commands:
  ...
```

---

### `gitea-logs`
View Gitea server logs.

**Usage:**
```bash
# Show last 50 lines (default)
gitea-logs

# Show last 100 lines
gitea-logs -n 100

# Follow logs in real-time (like tail -f)
gitea-logs -f

# Show help
gitea-logs -h
```

**Options:**
- `-f, --follow` - Follow log output in real-time (Ctrl+C to stop)
- `-n, --lines N` - Show last N lines (default: 50)
- `-h, --help` - Show help message

**Examples:**
```bash
# Quick check of recent activity
gitea-logs

# Watch logs live
gitea-logs -f

# See more history
gitea-logs -n 200
```

---

## Installation

### Option 1: Add to PATH (Recommended)

Add this to your `~/.zshrc` or `~/.bashrc`:
```bash
export PATH="/Users/LenMiller/code/shell-nix/gitea-local/bin:$PATH"
```

Then reload:
```bash
source ~/.zshrc  # or ~/.bashrc
```

### Option 2: Use from gitea-local directory

```bash
cd /Users/LenMiller/code/shell-nix/gitea-local
./bin/gitea-status
```

### Option 3: Add to shell.nix

Update `shell.nix` to include bin directory in PATH automatically when you enter the nix-shell.

---

## Troubleshooting

### "Gitea is already running"
If you try to start Gitea when it's already running:
```bash
gitea-status  # Check current status
gitea-restart # Restart if needed
```

### "Failed to start Gitea"
Check the logs for errors:
```bash
gitea-logs -n 100
```

Common issues:
- Port 3000 already in use by another application
- Missing configuration file
- Database corruption

### Port 3000 in use
Find what's using port 3000:
```bash
lsof -i :3000
```

Kill the process:
```bash
kill <PID>
```

### Clean restart
```bash
gitea-stop
sleep 2
rm gitea-server.log  # Optional: start with clean log
gitea-start
```

---

## Log File Location

**Default location:**
```
/Users/LenMiller/code/shell-nix/gitea-local/gitea-server.log
```

**Managing log file:**
```bash
# View logs
gitea-logs

# Clear old logs
> gitea-server.log

# Archive logs
mv gitea-server.log gitea-server-$(date +%Y%m%d).log

# Rotate logs automatically
# (Not implemented yet - future enhancement)
```

---

## Advanced Usage

### Check if Gitea is responding
```bash
curl http://localhost:3000/
```

### Manual process management
```bash
# Find Gitea process
ps aux | grep gitea | grep -v grep

# Kill Gitea manually
pkill -f "gitea web"

# Force kill
pkill -9 -f "gitea web"
```

### Access Gitea configuration
```bash
cat /Users/LenMiller/code/shell-nix/gitea-local/custom/app.ini
```

---

## Integration with Other Scripts

### Use in shell scripts
```bash
#!/usr/bin/env bash

# Ensure Gitea is running
if ! gitea-status | grep -q "RUNNING"; then
    echo "Starting Gitea..."
    gitea-start
    sleep 3
fi

# Your code here...
git push gitea experiments/exp-001
```

### Pre-commit hook
```bash
# Ensure Gitea is running before push
if git remote | grep -q "gitea"; then
    gitea-status | grep -q "RUNNING" || gitea-start
fi
```

---

## Related Commands

- `switch-to-gitea` - Switch to Gitea experiment mode
- `switch-to-github` - Return to GitHub context
- `./start-gitea.sh` - Manual start (interactive)

---

## Future Enhancements

- [ ] Log rotation
- [ ] Health check endpoint monitoring
- [ ] Auto-restart on crash
- [ ] Systemd/launchd integration
- [ ] Backup/restore commands
