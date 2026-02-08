# IDE Configuration Guide

This document explains how PlantUML server auto-configures VS Code and Cursor, and how to manage that configuration.

## Automatic Configuration (First Run)

When you run `start` for the first time, the server automatically:

1. Detects VS Code and/or Cursor installations
2. Asks permission to configure them
3. Creates backups of your settings.json
4. Injects PlantUML configuration
5. Installs the PlantUML extension (if possible)
6. Creates a `.configured` flag

### What Gets Configured

The following settings are added to your IDE's `settings.json`:

```json
{
  "plantuml.server": "http://localhost:8765/plantuml",
  "plantuml.render": "PlantUMLServer",
  "files.associations": {
    "*.puml": "plantuml",
    "*.plantuml": "plantuml"
  },
  "plantuml.previewAutoUpdate": true
}
```

### First Run Example

```bash
cd ~/projects/global/plantuml-server
start
```

Output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PlantUML IDE Auto-Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found: VS Code Cursor

Configure them to use PlantUML server at:
http://localhost:8765/plantuml

Proceed with configuration? [Y/n] █
```

Press Enter (or type `y`) to proceed.

## Reconfiguring IDEs

If you need to update the configuration (e.g., after changing the port):

```bash
bin/configure-ides --reconfigure
```

This will:
- Re-run the configuration process
- Create new backups
- Update settings with current port/configuration

## Removing Configuration

To completely remove PlantUML settings from your IDEs:

```bash
bin/unconfigure-ides
```

### Removal Process

1. **Detects configured IDEs:**
   ```
   Found PlantUML settings in: VS Code Cursor

   This will:
     1. Remove PlantUML server settings
     2. Remove file associations (*.puml, *.plantuml)
     3. Keep backups of your settings
     4. Optionally uninstall the PlantUML extension

   Proceed with removal? [y/N]
   ```

2. **Asks about extension removal:**
   ```
   Also uninstall PlantUML extension from IDEs? [y/N]
   ```

3. **Performs removal:**
   ```
   Removing PlantUML settings from VS Code...
     Backup created: .../settings.json.backup.20260129_204500
     ✓ PlantUML settings removed
     ✓ PlantUML extension uninstalled

   ✓ Removed configuration flag
     Running 'start' will offer to reconfigure IDEs
   ```

## Settings File Locations

### VS Code
```
~/Library/Application Support/Code/User/settings.json
```

### Cursor
```
~/Library/Application Support/Cursor/User/settings.json
```

## Backup Files

Backups are created with timestamps:
```
settings.json.backup.20260129_143022
settings.json.backup.20260129_204500
```

### Restoring from Backup

List available backups:
```bash
ls -lh ~/Library/Application\ Support/Code/User/settings.json.backup.*
```

Restore a specific backup:
```bash
cp ~/Library/Application\ Support/Code/User/settings.json.backup.20260129_143022 \
   ~/Library/Application\ Support/Code/User/settings.json
```

## Manual Configuration

If you prefer to configure manually:

### 1. Open Settings JSON

**VS Code/Cursor:**
- Press `Cmd+Shift+P`
- Type "Open User Settings (JSON)"
- Press Enter

### 2. Add PlantUML Configuration

Add this JSON (merge with existing settings):

```json
{
  "plantuml.server": "http://localhost:8765/plantuml",
  "plantuml.render": "PlantUMLServer",
  "files.associations": {
    "*.puml": "plantuml",
    "*.plantuml": "plantuml"
  },
  "plantuml.previewAutoUpdate": true
}
```

### 3. Install Extension

**VS Code:**
```bash
code --install-extension jebbs.plantuml
```

**Cursor:**
```bash
cursor --install-extension jebbs.plantuml
```

Or via GUI:
1. Open Extensions (Cmd+Shift+X)
2. Search "PlantUML"
3. Install "PlantUML" by jebbs

## Testing Configuration

### 1. Start the Server

```bash
cd ~/projects/global/plantuml-server
start
```

### 2. Open a Test File

```bash
code examples/test-vscode.puml
```

### 3. Preview the Diagram

- Press `Option+D` (Mac) or `Alt+D` (Linux/Windows)
- Or right-click → "Preview Current Diagram"

You should see:

```
┌─────────────────┐
│   User          │
└────────┬────────┘
         │ Open .puml file
         ▼
┌─────────────────┐
│  VS Code/Cursor │
└────────┬────────┘
         │ Send diagram code
         ▼
┌─────────────────┐
│ Local PlantUML  │
│    Server       │
└────────┬────────┘
         │ Return PNG/SVG
         ▼
┌─────────────────┐
│  VS Code/Cursor │
└────────┬────────┘
         │ Display preview
         ▼
┌─────────────────┐
│      User       │
└─────────────────┘
```

## Troubleshooting

### Preview Not Working

1. **Check server is running:**
   ```bash
   status
   # or
   curl http://localhost:8765/plantuml
   ```

2. **Verify settings:**
   ```bash
   cat ~/Library/Application\ Support/Code/User/settings.json | jq .plantuml
   ```

   Should show:
   ```json
   {
     "server": "http://localhost:8765/plantuml",
     "render": "PlantUMLServer",
     "previewAutoUpdate": true
   }
   ```

3. **Check extension is installed:**
   - VS Code: `code --list-extensions | grep plantuml`
   - Cursor: `cursor --list-extensions | grep plantuml`

4. **Restart IDE:**
   - Quit VS Code/Cursor completely
   - Reopen and try again

### Configuration Not Applied

1. **Check for syntax errors:**
   ```bash
   cat ~/Library/Application\ Support/Code/User/settings.json | jq .
   ```

   If you see an error, restore from backup:
   ```bash
   ls -lh ~/Library/Application\ Support/Code/User/settings.json.backup.*
   cp [latest-backup] ~/Library/Application\ Support/Code/User/settings.json
   ```

2. **Manually verify settings:**
   - Open VS Code/Cursor
   - Press `Cmd+Shift+P`
   - Type "Open User Settings (JSON)"
   - Check if PlantUML settings are present

### Wrong Port Configured

If you changed `PLANTUML_PORT` in `.envrc`:

```bash
# Reconfigure IDEs with new port
bin/configure-ides --reconfigure

# Or manually update settings.json
# Change: "plantuml.server": "http://localhost:8765/plantuml"
# To:     "plantuml.server": "http://localhost:YOUR_PORT/plantuml"
```

## Configuration State

The `.configured` flag file tracks whether auto-configuration has run:

```bash
# Check if configured
ls -la data/.configured

# Remove flag (allows reconfiguration on next 'start')
rm data/.configured

# Next time you run 'start', it will offer to configure again
```

## Security Note

The configuration scripts:
- Never send data outside your machine
- Only modify local IDE settings files
- Create backups before every change
- Prompt for permission before making changes
- Use `jq` for safe JSON manipulation (prevents corruption)

## Integration with Project Workflow

### Typical Development Flow

1. **Clone project:** `git clone ...`
2. **Enter directory:** `cd plantuml-server` (direnv auto-loads)
3. **Start server:** `start` (auto-configures IDEs on first run)
4. **Open diagram:** `code diagram.puml`
5. **Preview:** `Option+D`
6. **Edit and save:** Preview updates automatically

### Team Sharing

The configuration is local to your machine. Team members will:
- Each get prompted for configuration on first run
- Each can choose to configure or skip
- Each can use different IDEs (VS Code vs Cursor)

### CI/CD

The `.configured` flag is gitignored, so:
- CI environments won't have IDEs configured
- Server still runs normally
- Tests and builds work without IDE integration

## See Also

- [README.md](../README.md) - Main project documentation
- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Technical implementation details
- [PlantUML Extension Documentation](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)
