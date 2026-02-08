# CCHV Getting Started Guide

**Goal:** Get you from zero to running the Claude Code History Viewer desktop app.

## Prerequisites

### 1. Install Nix with Flakes

```bash
# Install Nix (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install

# Verify installation
nix --version  # Should show: nix (Nix) 2.x.x
```

### 2. Install direnv

```bash
# macOS (via Homebrew)
brew install direnv

# Or via Nix
nix-env -i direnv

# Add to your shell config (~/.bashrc or ~/.zshrc)
eval "$(direnv hook bash)"  # for bash
eval "$(direnv hook zsh)"   # for zsh

# Reload shell
source ~/.zshrc  # or source ~/.bashrc
```

### 3. Clone the Repository

```bash
git clone https://github.com/jhlee0409/claude-code-history-viewer.git
cd claude-code-history-viewer
```

## First Time Setup

### Step 1: Allow direnv to Load Environment

When you `cd` into the project directory, direnv will detect `.envrc` and prompt you:

```bash
cd claude-code-history-viewer
# Output: direnv: error /path/to/.envrc is blocked. Run `direnv allow` to approve its content
```

**Allow it:**
```bash
direnv allow
```

**What happens:**
- Nix builds the development environment (first time takes 2-5 minutes)
- Installs: Node.js 20, pnpm 10.13.1, Rust stable, just, cargo tools
- On macOS: Includes Tauri dependencies (gtk3, webkit2gtk via nixpkgs-unstable)
- On Linux: Includes system dependencies (gtk3, webkit2gtk, etc.)
- Environment auto-activates whenever you `cd` into this directory

### Step 2: Install Project Dependencies

```bash
just setup
```

**What this does:**
```bash
# Equivalent to:
pnpm install                    # Install Node.js dependencies
cd src-tauri && cargo fetch     # Download Rust dependencies
```

**Expected output:**
```
Packages: +XXX
Progress: resolved XXX, reused XXX, downloaded X, added XXX, done
```

### Step 3: Verify Setup

```bash
# Check that tools are available
just --version    # Should show: just 1.x.x
node --version    # Should show: v20.x.x
pnpm --version    # Should show: 10.13.1
cargo --version   # Should show: cargo 1.x.x
```

## Running the App

### Development Mode (with Hot Reload)

```bash
just dev
```

**What happens:**
1. Vite dev server starts on `http://localhost:5173` (frontend)
2. Tauri builds the Rust backend
3. **Desktop window appears** (this is the app!)
4. You see the CCHV interface with your project list

**Expected terminal output:**
```
> tauri dev
     Running BeforeDevCommand (`pnpm run dev`)
   ...
   VITE v5.x.x  ready in XXX ms
   ➜  Local:   http://localhost:5173/
   ...
        Info Watching /path/to/src-tauri for changes...
      Finished dev [unoptimized + debuginfo] target(s) in X.XXs
```

**IMPORTANT:**
- ❌ Do **NOT** open `http://localhost:5173` in Chrome/Safari/Firefox
- ✅ Use the desktop window that automatically appears
- The desktop window IS the app - it embeds the Vite dev server

### What You Should See

**On successful launch:**
1. Desktop window opens (titled "Claude Code History Viewer")
2. Sidebar shows:
   - List of projects from `~/.claude/projects/`
   - Each project expandable to show sessions
3. Main area shows:
   - "Select a session" message (if nothing selected)
   - Or message viewer if you had a session open before

**If no projects appear:**
- Check that you have Claude Code installed and have used it
- Verify `~/.claude/projects/` directory exists
- Try running Claude Code first to generate conversation history

### Hot Reload During Development

- **Frontend changes:** Edit `.tsx`/`.ts` files → Vite auto-reloads
- **Rust changes:** Edit `.rs` files → Tauri rebuilds (takes 10-30 seconds)
- **No restart needed** - just save the file

### Stopping the App

Press `Ctrl+C` in the terminal where `just dev` is running.

## Troubleshooting

### Issue: Desktop window doesn't appear

**Possible causes:**
1. Window opened off-screen or minimized
   - **Fix:** Check Mission Control (macOS) or Task Switcher (Windows/Linux)
   - Look for "Claude Code History Viewer" window

2. Port 5173 already in use
   - **Fix:** Kill existing process:
     ```bash
     lsof -ti:5173 | xargs kill -9  # macOS/Linux
     ```

3. Tauri build failed
   - **Check terminal output** for error messages
   - Common fix: Re-run `just setup` to ensure dependencies are installed

### Issue: "command not found: just"

**Cause:** direnv environment not loaded

**Fix:**
```bash
# Make sure you're in the project directory
cd ~/path/to/claude-code-history-viewer

# Re-allow direnv
direnv allow

# Verify just is now available
just --version
```

### Issue: pnpm version mismatch

**Cause:** Using global pnpm instead of Nix-provided version

**Fix:**
```bash
# Exit and re-enter the directory to reload environment
cd .. && cd claude-code-history-viewer

# Verify pnpm version
pnpm --version  # Should show: 10.13.1 (from packageManager field)
```

### Issue: Rust compilation errors

**Cause:** Missing Rust targets (macOS universal builds)

**Fix:**
```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

### Issue: "Module not found" errors

**Cause:** node_modules out of sync with lockfile

**Fix:**
```bash
rm -rf node_modules
pnpm install
```

### Issue: Changes not reflecting in app

**Frontend changes not showing:**
- Check terminal for Vite errors
- Try hard refresh: Cmd+Shift+R (macOS) or Ctrl+Shift+R (Windows/Linux)

**Rust changes not applying:**
- Wait for rebuild to complete (watch terminal output)
- If stuck, restart: Ctrl+C then `just dev` again

## Daily Workflow

Once set up, your daily workflow is simple:

```bash
# 1. Navigate to project (environment auto-loads)
cd ~/path/to/claude-code-history-viewer

# 2. Start development
just dev

# 3. Make changes
# - Edit files in src/ (frontend) or src-tauri/ (backend)
# - Watch desktop window for hot reload

# 4. Stop when done
# Press Ctrl+C in terminal
```

## Running Tests

### Frontend Tests

```bash
just test           # Watch mode (auto-reruns on file changes)
just test-run       # Run once with verbose output
```

### Backend Tests

```bash
just rust-test      # Run Rust tests (single-threaded, required)
```

**Note:** Rust tests MUST run with `--test-threads=1` because some tests modify environment variables.

### Lint & Format

```bash
pnpm lint                # ESLint (frontend)
just rust-lint           # Clippy (backend)
just rust-fmt-check      # Check Rust formatting
just rust-check-all      # Run all checks (format + lint + test)
```

## Building for Production

```bash
just tauri-build
```

**Output:**
- macOS: `src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg`
- Windows: `src-tauri/target/release/bundle/msi/*.msi`
- Linux: `src-tauri/target/release/bundle/appimage/*.AppImage`

**Note:** First build takes 5-10 minutes (Rust compiles in release mode).

## Next Steps

- **Understand the architecture:** [CCHV_ARCHITECTURE.md](CCHV_ARCHITECTURE.md)
- **API reference for development:** [CCHV_API_REFERENCE.md](CCHV_API_REFERENCE.md)
- **Contributing guidelines:** See project README.md

## Quick Command Reference

| Command | Purpose |
|---------|---------|
| `just` | List all available commands |
| `just setup` | Install dependencies (one-time) |
| `just dev` | Start development server |
| `just test` | Run frontend tests (watch mode) |
| `just rust-test` | Run Rust tests |
| `just lint` | Run ESLint |
| `just tauri-build` | Build production app |
| `just sync-version` | Sync version across files |

## Getting Help

- **GitHub Issues:** [Report bugs or request features](https://github.com/jhlee0409/claude-code-history-viewer/issues)
- **Discussions:** [Ask questions](https://github.com/jhlee0409/claude-code-history-viewer/discussions)
- **Documentation:** See other files in this docs suite

---

**You're ready to go!** Run `just dev` and start exploring your Claude Code conversation history.
