#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NODE_BIN="${NODE_BIN:-$(command -v node)}"
SYSTEMD_USER_DIR="$HOME/.config/systemd/user"
SERVICE="$SYSTEMD_USER_DIR/chrome-location-guardian.service"
TIMER="$SYSTEMD_USER_DIR/chrome-location-guardian.timer"

if [[ -z "$NODE_BIN" ]]; then
  echo "node not found. Install Node.js 14+ first." >&2
  exit 1
fi

if ! command -v systemctl >/dev/null 2>&1; then
  echo "systemctl not found. Use cron manually or install systemd user services." >&2
  exit 1
fi

mkdir -p "$SYSTEMD_USER_DIR"

cat > "$SERVICE" <<EOF_SERVICE
[Unit]
Description=Patch Chrome Local State region for Glic eligibility

[Service]
Type=oneshot
ExecStart=$NODE_BIN $ROOT/bin/chrome-location-guardian.js patch
EOF_SERVICE

cat > "$TIMER" <<EOF_TIMER
[Unit]
Description=Run Chrome Location Guardian every 5 minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
Unit=chrome-location-guardian.service

[Install]
WantedBy=timers.target
EOF_TIMER

systemctl --user daemon-reload
systemctl --user enable --now chrome-location-guardian.timer
systemctl --user start chrome-location-guardian.service || true

echo "Installed systemd user timer: chrome-location-guardian.timer"
