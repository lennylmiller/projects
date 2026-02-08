#!/usr/bin/env bash
# Start Gitea local instance
# Run this from within nix-shell

set -e

echo "Starting Gitea local instance..."
echo "Web interface will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Gitea with web interface
gitea web --port 3000 --config custom/app.ini 2>&1
