#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NODE_BIN="${NODE_BIN:-$(command -v node)}"
PLIST="$HOME/Library/LaunchAgents/com.na.chrome-location-guardian.plist"
LOG="$HOME/Library/Logs/chrome-location-guardian.log"
ERR_LOG="$HOME/Library/Logs/chrome-location-guardian.err.log"
UID_VALUE="$(id -u)"

if [[ -z "$NODE_BIN" ]]; then
  echo "node not found. Install Node.js 14+ first." >&2
  exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"

cat > "$PLIST" <<EOF_PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.na.chrome-location-guardian</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE_BIN</string>
    <string>$ROOT/bin/chrome-location-guardian.js</string>
    <string>patch</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>300</integer>
  <key>WatchPaths</key>
  <array>
    <string>$HOME/Library/Application Support/Google/Chrome/Local State</string>
    <string>$HOME/Library/Application Support/Google/Chrome/Last Version</string>
  </array>
  <key>StandardOutPath</key>
  <string>$LOG</string>
  <key>StandardErrorPath</key>
  <string>$ERR_LOG</string>
</dict>
</plist>
EOF_PLIST

chmod 644 "$PLIST"
launchctl bootout "gui/$UID_VALUE" "$PLIST" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$UID_VALUE" "$PLIST"
launchctl enable "gui/$UID_VALUE/com.na.chrome-location-guardian"
launchctl kickstart -k "gui/$UID_VALUE/com.na.chrome-location-guardian"

echo "Installed LaunchAgent: $PLIST"
echo "Logs: $LOG"
