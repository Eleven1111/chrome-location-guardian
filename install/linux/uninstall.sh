#!/usr/bin/env bash
set -euo pipefail

SYSTEMD_USER_DIR="$HOME/.config/systemd/user"

systemctl --user disable --now chrome-location-guardian.timer >/dev/null 2>&1 || true
systemctl --user stop chrome-location-guardian.service >/dev/null 2>&1 || true
rm -f "$SYSTEMD_USER_DIR/chrome-location-guardian.service" "$SYSTEMD_USER_DIR/chrome-location-guardian.timer"
systemctl --user daemon-reload >/dev/null 2>&1 || true

echo "Uninstalled systemd user timer: chrome-location-guardian.timer"
