# Obsidian PlantUML Integration

## Overview

The PlantUML server now supports **true ephemeral mode** for Obsidian. This means the Obsidian PlantUML plugin **only exists when the server is running**.

**True Ephemeral = Plugin Install/Uninstall Cycle:**
- ✅ Server starts → Plugin downloads from GitHub → Installs to Obsidian → Configured for local server
- ✅ Server stops → Plugin files deleted → Removed from Obsidian → Completely gone

This is more aggressive than VS Code/Cursor (which only change configuration). For Obsidian, the **entire plugin** is ephemeral.

## How It Works

### Ephemeral Mode (Default)

**When you start the server:**
```bash
cd ~/projects/global/plantuml-server
start
```

The server automatically:
1. ✅ Configures VS Code to use `http://localhost:8765/plantuml`
2. ✅ Configures Cursor to use `http://localhost:8765/plantuml`
3. ✅ **Downloads Obsidian PlantUML plugin from GitHub (v1.8.0)**
4. ✅ **Installs plugin to `~/.obsidian/plugins/obsidian-plantuml/`**
5. ✅ **Enables plugin in `community-plugins.json`**
6. ✅ **Configures plugin to use `http://localhost:8765/plantuml`**

**When you stop the server:**
```bash
stop
```

The server automatically:
1. ✅ Removes PlantUML config from VS Code (if it was pointing to this server)
2. ✅ Removes PlantUML config from Cursor (if it was pointing to this server)
3. ✅ **Deletes entire plugin directory** (`~/.obsidian/plugins/obsidian-plantuml/`)
4. ✅ **Removes plugin from `community-plugins.json`**
5. ✅ **Plugin completely disappears from Obsidian**

### Clean State Guarantee

- ✅ **Plugin only exists when server is running** (true ephemeral)
- ✅ **Zero leftover files** when server stops (plugin completely removed)
- ✅ No manual cleanup needed
- ✅ No configuration drift or stale settings
- ✅ Fresh install on every start (always latest from GitHub)
- ✅ Obsidian returns to clean state as if plugin was never installed

## Prerequisites

**Plugin auto-installs on first server start!**

The server will automatically download and install the Obsidian PlantUML plugin from GitHub if it's not already present. Just run `start` and everything is configured for you.

**Manual installation (optional):**

If you prefer to install manually or disable auto-installation:

1. **Via script:**
   ```bash
   bin/install-obsidian-plugin
   ```

2. **Via Obsidian UI:**
   - Open Obsidian
   - Settings → Community Plugins → Browse
   - Search "PlantUML"
   - Install "PlantUML" by joethei
   - Enable the plugin

3. **Disable auto-installation:**
   ```bash
   # In .envrc
   export OBSIDIAN_AUTO_INSTALL=false
   ```

**If plugin installation fails:**
- The configuration scripts will skip Obsidian gracefully
- No errors or warnings (in ephemeral mode)
- You can install the plugin manually and it will work on next server start

## Configuration Files

### Obsidian Plugin Settings Location

**macOS:**
```
~/projects/.obsidian/plugins/obsidian-plantuml/data.json
```

**Linux:**
```
~/projects/.obsidian/plugins/obsidian-plantuml/data.json
```

### Default Configuration Format

```json
{
  "server_url": "https://www.plantuml.com/plantuml",
  "header": "",
  "debounce": 3,
  "localJar": "",
  "javaPath": "java",
  "dotPath": "dot",
  "defaultProcessor": "png",
  "cache": 60,
  "exportPath": ""
}
```

### Local Server Configuration

When the server starts, the `server_url` field is updated:

```json
{
  "server_url": "http://localhost:8765/plantuml"
}
```

Other settings remain unchanged.

## Scripts

### `bin/install-obsidian-plugin`

**Purpose:** Download and install Obsidian PlantUML plugin from GitHub

**Usage:**
```bash
# Interactive mode (with prompts)
bin/install-obsidian-plugin

# Silent mode (skips if already installed)
bin/install-obsidian-plugin --silent

# Force reinstall/update
bin/install-obsidian-plugin --force

# Silent force install
bin/install-obsidian-plugin --force --silent
```

**Behavior:**
- ✅ Fetches latest release from GitHub (joethei/obsidian-plantuml)
- ✅ Downloads `main.js`, `manifest.json`, `styles.css`
- ✅ Installs to `$VAULT_PATH/.obsidian/plugins/obsidian-plantuml/`
- ✅ Enables plugin in `community-plugins.json`
- ✅ Skips if already installed (unless `--force`)
- ✅ Validates downloads before installing
- ✅ Silent mode for automation

**Security:**
- Downloads directly from official GitHub releases
- Verifies `manifest.json` is valid JSON
- Checks file sizes (non-zero)
- No code execution during installation

### `bin/configure-obsidian`

**Purpose:** Add local server configuration to Obsidian PlantUML plugin

**Usage:**
```bash
# Interactive mode (with prompts and backups)
bin/configure-obsidian

# Silent mode (used by start script, auto-installs plugin)
bin/configure-obsidian --silent

# Silent mode without auto-install
bin/configure-obsidian --silent --no-install
```

**Behavior:**
- ✅ **Auto-installs plugin if missing** (unless `--no-install`)
- ✅ Creates `data.json` if it doesn't exist
- ✅ Validates JSON (resets to `{}` if malformed)
- ✅ Merges `server_url` setting (preserves other settings)
- ✅ Creates backup in non-silent mode
- ✅ Skips gracefully if plugin installation fails

### `bin/uninstall-obsidian-plugin`

**Purpose:** Completely remove Obsidian PlantUML plugin (ephemeral mode)

**Usage:**
```bash
# Interactive mode
bin/uninstall-obsidian-plugin

# Silent mode (used by stop script in ephemeral mode)
bin/uninstall-obsidian-plugin --silent
```

**Behavior:**
- ✅ Deletes entire plugin directory (`~/.obsidian/plugins/obsidian-plantuml/`)
- ✅ Removes plugin from `community-plugins.json`
- ✅ Silent mode for ephemeral cleanup
- ✅ Exits silently if plugin not installed

**This is the key to true ephemeral mode** - the plugin is completely removed on stop.

### `bin/unconfigure-obsidian` (Legacy)

**Purpose:** Restore default public server configuration (not used in ephemeral mode)

**Usage:**
```bash
# Interactive mode (with prompts and backups)
bin/unconfigure-obsidian

# Silent mode with port matching
bin/unconfigure-obsidian --silent --port-match
```

**Behavior:**
- ✅ Checks if `server_url` points to our server (with `--port-match`)
- ✅ Skips if pointing to different server (e.g., user set custom server)
- ✅ Restores default `https://www.plantuml.com/plantuml`
- ✅ Creates backup in non-silent mode
- ✅ Exits silently if plugin not found

**Note:** This script is kept for backward compatibility and non-ephemeral workflows, but ephemeral mode uses `uninstall-obsidian-plugin` instead.

## Integration with start/stop Scripts

### `bin/start` Integration

**Lines modified:**
```bash
if [[ "$PERSISTENT" == "true" ]]; then
  # Persistent mode: configure only on first run
  if [ ! -f "$DATA_DIR/.configured" ]; then
    "$PROJECT_ROOT/bin/configure-ides"
    "$PROJECT_ROOT/bin/configure-obsidian"  # Added
  fi
else
  # Ephemeral mode: always configure (silently)
  "$PROJECT_ROOT/bin/configure-ides" --silent
  "$PROJECT_ROOT/bin/configure-obsidian" --silent  # Added
fi
```

### `bin/stop` Integration

**Lines modified:**
```bash
# Ephemeral mode: unconfigure IDEs and uninstall Obsidian plugin
if [[ "$PERSISTENT" == "false" ]]; then
  "$PROJECT_ROOT/bin/unconfigure-ides" --silent --port-match
  "$PROJECT_ROOT/bin/uninstall-obsidian-plugin" --silent  # Changed: completely uninstall
fi
```

**Key difference:** Instead of unconfiguring (changing server URL), we **completely uninstall** the plugin.

## Environment Variables

### `OBSIDIAN_VAULT_PATH`

**Purpose:** Specify which Obsidian vault to configure

**Default:** `$HOME/projects`

**Usage:**
```bash
# In .envrc
export OBSIDIAN_VAULT_PATH="$HOME/path/to/your/vault"

# Reload environment
direnv reload
```

**When to set:**
- You have multiple Obsidian vaults
- Your primary vault is not `~/projects`

### `OBSIDIAN_AUTO_INSTALL`

**Purpose:** Control automatic plugin installation

**Default:** `true` (auto-install enabled)

**Usage:**
```bash
# Disable auto-installation
export OBSIDIAN_AUTO_INSTALL=false

# Reload environment
direnv reload
```

**When to disable:**
- You want to manually install the plugin
- You're in a restricted environment
- You want to control exactly when the plugin is installed
- You prefer to use `bin/install-obsidian-plugin` explicitly

### `PLANTUML_PORT`

**Purpose:** Change server port (affects both server and configuration)

**Default:** `8765`

**Usage:**
```bash
# In .envrc
export PLANTUML_PORT=9090

# Reload environment
direnv reload
```

**Effect on Obsidian:**
- Configures Obsidian to use `http://localhost:9090/plantuml`
- Unconfigures only if Obsidian points to `http://localhost:9090/plantuml` (port matching)

### `PLANTUML_PERSISTENT_CONFIG`

**Purpose:** Control configuration mode

**Default:** `false` (ephemeral mode)

**Values:**
- `false` - Ephemeral: configs added on start, removed on stop
- `true` - Persistent: configs kept when server stops

**Usage:**
```bash
# In .envrc
export PLANTUML_PERSISTENT_CONFIG=true

# Reload environment
direnv reload
```

## Testing

### Test Ephemeral Configuration

**1. Verify initial state (default public server):**
```bash
cat ~/projects/.obsidian/plugins/obsidian-plantuml/data.json | jq .server_url
# Expected: "https://www.plantuml.com/plantuml"
```

**2. Start server:**
```bash
cd ~/projects/global/plantuml-server
start
# Expected output: "✓ Obsidian configured (ephemeral)"
```

**3. Verify local server configured:**
```bash
cat ~/projects/.obsidian/plugins/obsidian-plantuml/data.json | jq .server_url
# Expected: "http://localhost:8765/plantuml"
```

**4. Stop server:**
```bash
stop
# Expected output: "✓ Obsidian unconfigured (ephemeral mode)"
```

**5. Verify restored to default:**
```bash
cat ~/projects/.obsidian/plugins/obsidian-plantuml/data.json | jq .server_url
# Expected: "https://www.plantuml.com/plantuml"
```

### Test PlantUML Rendering in Obsidian

**1. Start the server:**
```bash
cd ~/projects/global/plantuml-server
start
```

**2. Create a test diagram:**
```bash
cat > ~/projects/test-diagram.puml <<'EOF'
@startuml
Alice -> Bob: Hello
Bob -> Alice: Hi!
@enduml
EOF
```

**3. Open in Obsidian:**
- Open Obsidian (`~/projects` vault)
- Open `test-diagram.puml`
- The diagram should render automatically

**4. Verify it's using local server:**
```bash
# Check server logs for incoming requests
tail -f ~/projects/global/plantuml-server/data/logs/plantuml.log
# You should see requests when Obsidian renders the diagram
```

## Troubleshooting

### Plugin Not Installed

**Symptom:** No Obsidian configuration messages when starting server

**Solution:**
```bash
# Check if plugin is installed
ls -la ~/projects/.obsidian/plugins/obsidian-plantuml/

# If not found, install from Obsidian:
# Settings → Community Plugins → Browse → PlantUML
```

### Configuration Not Applied

**Symptom:** Diagrams still using public server after starting local server

**Check current configuration:**
```bash
cat ~/projects/.obsidian/plugins/obsidian-plantuml/data.json | jq .server_url
```

**If still showing public server:**
```bash
# Manually reconfigure
cd ~/projects/global/plantuml-server
bin/configure-obsidian

# Restart Obsidian (may be needed to pick up config changes)
```

### Wrong Vault Configured

**Symptom:** Configuration not applied because wrong vault path

**Solution:**
```bash
# Set correct vault path in .envrc
echo 'export OBSIDIAN_VAULT_PATH="$HOME/path/to/your/vault"' >> .envrc

# Reload environment
direnv reload

# Restart server
stop && start
```

### Port Mismatch

**Symptom:** Unconfigure doesn't work because server uses different port

**Check current server URL:**
```bash
cat ~/projects/.obsidian/plugins/obsidian-plantuml/data.json | jq .server_url
# Shows: "http://localhost:XXXX/plantuml"
```

**Check expected port:**
```bash
cd ~/projects/global/plantuml-server
echo $PLANTUML_PORT
# Shows: 8765 (or different)
```

**If ports don't match:**
- The `--port-match` flag prevents unconfiguring wrong server
- This is **intentional** to avoid breaking user's custom configuration
- Either change `PLANTUML_PORT` to match, or manually unconfigure

### Manual Unconfiguration

**If automatic unconfiguration fails:**
```bash
# Manual unconfigure (without port matching)
cd ~/projects/global/plantuml-server
bin/unconfigure-obsidian

# Or edit directly
cat > ~/projects/.obsidian/plugins/obsidian-plantuml/data.json <<'EOF'
{
  "server_url": "https://www.plantuml.com/plantuml"
}
EOF
```

## Comparison with VS Code/Cursor Integration

| Feature | VS Code/Cursor | Obsidian |
|---------|----------------|----------|
| **Ephemeral behavior** | ✏️ **Configuration only** (plugin stays installed, settings change) | 🗑️ **Complete install/uninstall** (plugin exists only when server runs) |
| **On start** | Change settings.json | Download from GitHub + Install + Configure |
| **On stop** | Restore settings.json | Delete plugin directory + Remove from community-plugins.json |
| **Plugin management** | User installs once (e.g., via Extensions UI) | Auto-installs on every start |
| **Configuration file** | `settings.json` | `data.json` (deleted on stop) |
| **Config location** | `~/Library/Application Support/{Code,Cursor}/User/` | `~/projects/.obsidian/plugins/obsidian-plantuml/` (deleted on stop) |
| **Settings merged** | 4 keys (`plantuml.server`, `plantuml.render`, `files.associations`, `plantuml.previewAutoUpdate`) | 1 key (`server_url`) |
| **Port matching** | Yes (`--port-match`) | N/A (plugin completely removed) |
| **Persistent mode** | Yes (optional) | Yes (optional) |
| **Clean state** | Config restored to defaults | Plugin completely removed |

**Key Difference:**
- **VS Code/Cursor**: PlantUML extension stays installed, only configuration changes
- **Obsidian**: PlantUML plugin is **completely installed on start** and **completely removed on stop** (true ephemeral)

## Architecture Decisions

### Why Separate Scripts?

**Design:** `configure-obsidian` and `unconfigure-obsidian` are separate scripts (not integrated into `configure-ides`/`unconfigure-ides`)

**Rationale:**
- ✅ Obsidian is not an IDE (it's a note-taking app)
- ✅ Different configuration file format and location
- ✅ Easier to maintain independently
- ✅ Clear separation of concerns
- ✅ Follows same pattern as IDE scripts (configure + unconfigure)

### Why Merge Instead of Replace?

**Design:** `jq '. + { "server_url": "..." }'` merges the setting instead of replacing entire file

**Rationale:**
- ✅ Preserves user's other plugin settings (debounce, cache, exportPath, etc.)
- ✅ Less invasive (only changes what we need to)
- ✅ Reduces risk of breaking user configuration
- ✅ Matches VS Code/Cursor pattern

### Why `--port-match` Flag?

**Design:** Unconfigure scripts check if config points to our server before removing

**Rationale:**
- ✅ Prevents overwriting user's custom server URL
- ✅ Safe to run multiple PlantUML servers on different ports
- ✅ Idempotent (can run multiple times safely)
- ✅ Avoids "helpful" behavior that breaks user setups

### Why No Hot-Reload Check?

**Design:** Scripts don't check if Obsidian needs restart to pick up config changes

**Rationale:**
- ❓ Behavior varies by Obsidian version and plugin implementation
- ✅ Simple: users can restart Obsidian if needed
- ✅ Non-invasive: doesn't try to manage Obsidian process
- ✅ Documented in troubleshooting section

## Implementation Checklist

### Phase 1: Ephemeral Configuration
- [x] Create `bin/configure-obsidian` script
- [x] Create `bin/unconfigure-obsidian` script
- [x] Make scripts executable (`chmod +x`)
- [x] Integrate with `bin/start` (ephemeral + persistent modes)
- [x] Integrate with `bin/stop` (ephemeral mode)
- [x] Update README with Obsidian integration docs
- [x] Add troubleshooting section for Obsidian
- [x] Test ephemeral mode (start → configure, stop → unconfigure)
- [x] Test persistent mode (configure once, keep on stop)
- [x] Test port matching (skip unconfigure if wrong port)
- [x] Test graceful handling (plugin not installed)
- [x] Create test diagram for verification
- [x] Verify server API works
- [x] Document environment variables (`OBSIDIAN_VAULT_PATH`)
- [x] Create comprehensive integration guide (this file)

### Phase 2: Auto-Installation
- [x] Create `bin/install-obsidian-plugin` script
- [x] Download from GitHub releases (joethei/obsidian-plantuml)
- [x] Install to `.obsidian/plugins/obsidian-plantuml/`
- [x] Enable in `community-plugins.json`
- [x] Add `--force` flag for reinstallation
- [x] Add `--silent` flag for automation
- [x] Integrate auto-install into `configure-obsidian`
- [x] Add `OBSIDIAN_AUTO_INSTALL` environment variable
- [x] Add `--no-install` flag to skip auto-installation
- [x] Test auto-installation on first start
- [x] Test skip on subsequent starts
- [x] Test forced reinstall
- [x] Update README with auto-install docs
- [x] Update OBSIDIAN_INTEGRATION.md with auto-install workflow

## Auto-Installation Workflow

**How it works:**

1. **On first `start` (plugin not installed):**
   ```bash
   cd ~/projects/global/plantuml-server
   start
   ```

   Output:
   ```
     Installing Obsidian PlantUML plugin...
     ✓ Obsidian PlantUML plugin installed (v1.8.0)
     ✓ Obsidian configured (ephemeral)
   ✓ PlantUML server started successfully
   ```

2. **Plugin installation process:**
   - Fetches latest release from GitHub (joethei/obsidian-plantuml)
   - Downloads `main.js`, `manifest.json`, `styles.css`
   - Installs to `~/.obsidian/plugins/obsidian-plantuml/`
   - Enables plugin in `community-plugins.json`
   - Configures to use local server

3. **On subsequent starts (plugin already installed):**
   ```bash
   start
   ```

   Output:
   ```
     ✓ Obsidian configured (ephemeral)
   ✓ PlantUML server started successfully
   ```

**Manual installation (if you prefer):**

```bash
# Disable auto-install
export OBSIDIAN_AUTO_INSTALL=false

# Install manually via script
bin/install-obsidian-plugin

# Or via Obsidian UI
# Settings → Community Plugins → Browse → PlantUML
```

## Next Steps

1. **Just start the server!** (Plugin auto-installs)
   ```bash
   cd ~/projects/global/plantuml-server
   start
   # Everything is configured automatically
   ```

2. **Create a test diagram:**
   - Create `~/projects/test-diagram.puml`
   - Open in Obsidian
   - Verify diagram renders

3. **Test ephemeral cleanup:**
   ```bash
   stop
   # Verify: cat ~/projects/.obsidian/plugins/obsidian-plantuml/data.json
   # Should show default public server
   ```

4. **Verify plugin installation:**
   ```bash
   ls -la ~/projects/.obsidian/plugins/obsidian-plantuml/
   # Should show: main.js, manifest.json, styles.css, data.json
   ```

## Future Enhancements

**Potential improvements (not currently planned):**

- [ ] Auto-detect if Obsidian is running and prompt for restart
- [ ] Support multiple vaults (configure all found vaults)
- [ ] Add health check (verify plugin can reach server)
- [ ] Create Obsidian plugin snippet for inline diagram rendering
- [ ] Add example Obsidian note with embedded PlantUML diagrams

**Current decision:** Keep it simple and focused on ephemeral configuration pattern
