# True Ephemeral Mode - Obsidian PlantUML Plugin

## Summary

The Obsidian PlantUML integration now uses **true ephemeral mode** where the plugin **only exists when the server is running**.

## What "True Ephemeral" Means

### VS Code/Cursor (Configuration Ephemeral)
- ✏️ Extension stays installed permanently
- ✏️ Only settings change (server URL)
- ✏️ User must install extension once manually

### Obsidian (Plugin Ephemeral)
- 🗑️ **Plugin completely installs on start**
- 🗑️ **Plugin completely uninstalls on stop**
- 🗑️ Zero user intervention needed

## Complete Lifecycle

### Server Start (`start`)

**Step 1: Download from GitHub**
```
Fetching latest release from joethei/obsidian-plantuml...
✓ Latest version: 1.8.0
```

**Step 2: Install Plugin Files**
```
Downloading plugin files...
  main.js      (1 MB)
  manifest.json
  styles.css
```

**Step 3: Enable in Obsidian**
```
Installing to: ~/.obsidian/plugins/obsidian-plantuml/
Adding to:     ~/.obsidian/community-plugins.json
```

**Step 4: Configure for Local Server**
```
Creating data.json with:
{
  "server_url": "http://localhost:8765/plantuml"
}
```

**Output:**
```
  ✓ Obsidian PlantUML plugin installed (v1.8.0)
  ✓ Obsidian configured (ephemeral)
```

### Server Stop (`stop`)

**Step 1: Remove from Obsidian**
```
Removing from: ~/.obsidian/community-plugins.json
```

**Step 2: Delete Plugin Files**
```
Deleting: ~/.obsidian/plugins/obsidian-plantuml/
  - main.js
  - manifest.json
  - styles.css
  - data.json
```

**Output:**
```
  ✓ Obsidian PlantUML plugin uninstalled (ephemeral mode)
```

**Result:**
```bash
$ ls ~/.obsidian/plugins/obsidian-plantuml/
ls: ~/.obsidian/plugins/obsidian-plantuml/: No such file or directory
```

## File System States

### When Server is Stopped
```
~/projects/.obsidian/
├── community-plugins.json    ["obsidian-excalidraw-plugin"]
└── plugins/
    └── obsidian-excalidraw-plugin/
        └── ...
```

### When Server is Running
```
~/projects/.obsidian/
├── community-plugins.json    ["obsidian-excalidraw-plugin", "obsidian-plantuml"]
└── plugins/
    ├── obsidian-excalidraw-plugin/
    │   └── ...
    └── obsidian-plantuml/      ← EPHEMERAL (only exists when server runs)
        ├── main.js
        ├── manifest.json
        ├── styles.css
        └── data.json
```

### After Server Stops Again
```
~/projects/.obsidian/
├── community-plugins.json    ["obsidian-excalidraw-plugin"]
└── plugins/
    └── obsidian-excalidraw-plugin/
        └── ...
```

**Plugin directory completely gone!**

## Scripts Involved

### `bin/install-obsidian-plugin`
**Purpose:** Download and install plugin from GitHub

**What it does:**
1. Fetches latest release from GitHub API
2. Downloads `main.js`, `manifest.json`, `styles.css`
3. Installs to `~/.obsidian/plugins/obsidian-plantuml/`
4. Adds to `community-plugins.json`

**Called by:** `configure-obsidian` when plugin is missing

### `bin/uninstall-obsidian-plugin`
**Purpose:** Completely remove plugin

**What it does:**
1. Removes from `community-plugins.json`
2. Deletes `~/.obsidian/plugins/obsidian-plantuml/` directory
3. Leaves no trace

**Called by:** `stop` in ephemeral mode

### `bin/configure-obsidian`
**Purpose:** Install (if needed) and configure plugin

**What it does:**
1. Checks if plugin exists
2. If not, calls `install-obsidian-plugin`
3. Creates/updates `data.json` with local server URL

**Called by:** `start` in ephemeral mode

## Why This Approach?

### Benefits of True Ephemeral Mode

✅ **Zero Configuration Drift**
- Plugin is always fresh from GitHub
- No stale settings or cached data
- Guaranteed clean state

✅ **No Manual Setup**
- User never needs to install plugin manually
- No "forgot to install plugin" issues
- Works out of the box

✅ **Clear Resource Lifecycle**
- Plugin exists ↔ Server runs
- No confusion about plugin state
- Easy to reason about

✅ **Automatic Updates**
- Every start downloads latest version
- No manual update process
- Always current

✅ **Security Benefits**
- Plugin only present when actively used
- Reduced attack surface when server stopped
- Fresh download each time (tamper-resistant)

### Why Not Do This for VS Code/Cursor?

VS Code/Cursor extensions are:
- Larger (~10-50 MB for PlantUML extension)
- Slower to install (extension marketplace, dependencies)
- More complex (workspace settings, global settings, keybindings)
- User expects them to persist (frequently used tools)

Obsidian plugin is:
- Small (~1 MB)
- Fast to install (direct GitHub download)
- Simple (single settings file)
- Context-specific (only used with PlantUML diagrams)

## Testing the Lifecycle

### Test 1: Fresh Start (Plugin Not Installed)

```bash
# Verify plugin doesn't exist
ls ~/.obsidian/plugins/obsidian-plantuml/
# Expected: No such file or directory

# Start server
start
# Expected: "✓ Obsidian PlantUML plugin installed (v1.8.0)"

# Verify plugin exists
ls ~/.obsidian/plugins/obsidian-plantuml/
# Expected: main.js, manifest.json, styles.css, data.json

# Verify enabled
cat ~/.obsidian/community-plugins.json
# Expected: [..., "obsidian-plantuml"]

# Stop server
stop
# Expected: "✓ Obsidian PlantUML plugin uninstalled (ephemeral mode)"

# Verify plugin removed
ls ~/.obsidian/plugins/obsidian-plantuml/
# Expected: No such file or directory

# Verify disabled
cat ~/.obsidian/community-plugins.json
# Expected: [...] (no obsidian-plantuml)
```

### Test 2: Multiple Start/Stop Cycles

```bash
start  # Install plugin
stop   # Uninstall plugin
start  # Reinstall plugin (fresh from GitHub)
stop   # Uninstall plugin again

# Each cycle is completely independent
# Each start downloads fresh from GitHub
# Each stop leaves zero trace
```

### Test 3: Obsidian User Experience

**While server is running:**
1. Open Obsidian
2. Create `test.puml` file
3. Obsidian shows PlantUML plugin in enabled plugins
4. Diagrams render using local server

**After stopping server:**
1. Obsidian no longer shows PlantUML plugin
2. `.puml` files render as plain text
3. Plugin completely gone from settings

**After restarting server:**
1. Plugin reappears in Obsidian (fresh install)
2. Diagrams render again
3. No configuration needed

## Persistent Mode (Optional)

If you want the plugin to stay installed when server stops:

```bash
# In .envrc
export PLANTUML_PERSISTENT_CONFIG=true

# Reload
direnv reload
```

**Behavior:**
- First `start`: Install plugin once
- Subsequent `start`: Plugin already installed, just configure
- `stop`: Plugin stays installed, configuration persists

**Use persistent mode when:**
- You run the server frequently
- You want to avoid repeated downloads
- You prefer traditional plugin management

**Use ephemeral mode (default) when:**
- You want clean state when server stops
- You want automatic updates (latest on each start)
- You value zero configuration drift

## Implementation Files

**Created:**
- `bin/install-obsidian-plugin` - Download and install from GitHub
- `bin/uninstall-obsidian-plugin` - Completely remove plugin

**Modified:**
- `bin/configure-obsidian` - Auto-install if missing
- `bin/stop` - Call uninstall in ephemeral mode
- `README.md` - Document true ephemeral behavior
- `OBSIDIAN_INTEGRATION.md` - Comprehensive integration guide

**Kept (legacy):**
- `bin/unconfigure-obsidian` - For non-ephemeral workflows

## Conclusion

**True ephemeral mode** for Obsidian means the plugin is **truly ephemeral** - it only exists when the server is running. This provides:

- ✅ Zero manual setup
- ✅ Zero configuration drift
- ✅ Zero leftover files
- ✅ Automatic updates
- ✅ Clean, predictable state

The plugin lifecycle is tied directly to the server lifecycle:
- **Server runs** → Plugin exists
- **Server stops** → Plugin disappears

Simple, clean, and completely automated.
