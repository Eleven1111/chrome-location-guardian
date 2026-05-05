# Chrome Location Guardian

Chrome Location Guardian keeps Chrome's `Local State` region fields patched to `us` so Chrome-side Gemini/Glic eligibility is less likely to disappear after Chrome updates, account refreshes, or profile rewrites.

It is based on the behavior documented by [`chen86860/modify-chrome-location`](https://github.com/chen86860/modify-chrome-location), then adds platform-specific auto-repair installers for macOS, Windows, and Linux.

## What It Changes

For each installed Chrome channel it finds, the CLI patches the browser user data `Local State` file:

| Field | Value |
| --- | --- |
| `variations_country` | `"us"` |
| `variations_permanent_consistency_country` | `[Chrome version, "us"]` |
| every recursive `is_glic_eligible` field | `true` |

The tool does not install a browser extension and does not contact any server.

## Safety Model

By default the CLI skips patching while Chrome is running. Chrome often rewrites `Local State` on exit, so writing while Chrome is open can be immediately lost. The installed auto-repair jobs run repeatedly and patch after Chrome exits.

Use `--force` only when you intentionally want to patch while Chrome is open.

## Requirements

- Node.js 14+
- Chrome Stable, Canary, Dev, or Beta

## One-Time Use

```bash
node bin/chrome-location-guardian.js patch
node bin/chrome-location-guardian.js status
```

Force patch while Chrome is running:

```bash
node bin/chrome-location-guardian.js patch --force
```

## Auto-Repair Installers

Install from the repository root.

### macOS

Uses a user LaunchAgent with `RunAtLoad`, `StartInterval=300`, and `WatchPaths` for Chrome `Local State` and `Last Version`.

```bash
bash install/macos/install.sh
```

Uninstall:

```bash
bash install/macos/uninstall.sh
```

Logs:

```text
~/Library/Logs/chrome-location-guardian.log
~/Library/Logs/chrome-location-guardian.err.log
```

### Windows

Uses Task Scheduler. It runs at logon and every 5 minutes.

Run PowerShell from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\install\windows\install.ps1
```

Uninstall:

```powershell
powershell -ExecutionPolicy Bypass -File .\install\windows\uninstall.ps1
```

### Linux

Uses a systemd user service and timer. It runs at login and every 5 minutes.

```bash
bash install/linux/install.sh
```

Uninstall:

```bash
bash install/linux/uninstall.sh
```

Logs:

```bash
journalctl --user -u chrome-location-guardian.service
```

## Supported User Data Paths

| Platform | Stable | Canary / Unstable | Dev | Beta |
| --- | --- | --- | --- | --- |
| macOS | `~/Library/Application Support/Google/Chrome` | `~/Library/Application Support/Google/Chrome Canary` | `~/Library/Application Support/Google/Chrome Dev` | `~/Library/Application Support/Google/Chrome Beta` |
| Windows | `%LOCALAPPDATA%\Google\Chrome\User Data` | `%LOCALAPPDATA%\Google\Chrome SxS\User Data` | `%LOCALAPPDATA%\Google\Chrome Dev\User Data` | `%LOCALAPPDATA%\Google\Chrome Beta\User Data` |
| Linux | `~/.config/google-chrome` | `~/.config/google-chrome-unstable` | `~/.config/google-chrome-unstable` | `~/.config/google-chrome-beta` |

## Chrome Setup Still Matters

This tool only patches local region fields. Chrome may still require:

- Chrome v147 or newer
- English (United States) as the primary Chrome language
- Glic-related `chrome://flags` enabled, depending on your Chrome channel and rollout state

## Restore

The CLI writes a backup before every modified `Local State` file:

```text
Local State.backup-chrome-location-guardian-YYYYMMDD-HHMMSS
```

To restore manually, quit Chrome and replace `Local State` with the backup.
