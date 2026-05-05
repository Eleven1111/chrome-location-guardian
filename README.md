# Chrome Location Guardian

[English](#chrome-location-guardian) | [中文](#chrome-location-guardian-中文)

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

## License

MIT. See [LICENSE](LICENSE).

---

# Chrome Location Guardian 中文

Chrome Location Guardian 会把 Chrome `Local State` 里的地区相关字段持续修正为 `us`，降低 Chrome 升级、账号刷新或配置重写之后 Gemini/Glic 资格消失的概率。

这个项目基于 [`chen86860/modify-chrome-location`](https://github.com/chen86860/modify-chrome-location) 里记录的修改逻辑，并额外补上了 macOS、Windows、Linux 三个平台的自动修复安装脚本。

## 它会修改什么

CLI 会扫描已安装的 Chrome 通道，并修改对应浏览器用户数据目录里的 `Local State` 文件：

| 字段 | 值 |
| --- | --- |
| `variations_country` | `"us"` |
| `variations_permanent_consistency_country` | `[Chrome version, "us"]` |
| 所有递归出现的 `is_glic_eligible` 字段 | `true` |

这个工具不会安装浏览器扩展，也不会连接任何服务器。

## 安全策略

默认情况下，如果检测到 Chrome 正在运行，CLI 会跳过写入。原因是 Chrome 经常会在退出时重写 `Local State`，如果在 Chrome 打开时写入，修改可能马上被覆盖。

安装后的自动修复任务会反复运行，并在 Chrome 退出后重新修复。

只有在你明确想要 Chrome 打开时也强制写入，才使用 `--force`。

## 环境要求

- Node.js 14+
- Chrome Stable、Canary、Dev 或 Beta

## 单次使用

```bash
node bin/chrome-location-guardian.js patch
node bin/chrome-location-guardian.js status
```

Chrome 正在运行时强制修复：

```bash
node bin/chrome-location-guardian.js patch --force
```

## 自动修复安装

请在项目根目录执行安装命令。

### macOS

使用用户级 LaunchAgent，配置了 `RunAtLoad`、`StartInterval=300`，并监听 Chrome 的 `Local State` 和 `Last Version` 文件变化。

```bash
bash install/macos/install.sh
```

卸载：

```bash
bash install/macos/uninstall.sh
```

日志位置：

```text
~/Library/Logs/chrome-location-guardian.log
~/Library/Logs/chrome-location-guardian.err.log
```

### Windows

使用任务计划程序。它会在登录时运行，并且每 5 分钟运行一次。

在项目根目录运行 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\install\windows\install.ps1
```

卸载：

```powershell
powershell -ExecutionPolicy Bypass -File .\install\windows\uninstall.ps1
```

### Linux

使用 systemd user service 和 timer。它会在登录后运行，并且每 5 分钟运行一次。

```bash
bash install/linux/install.sh
```

卸载：

```bash
bash install/linux/uninstall.sh
```

查看日志：

```bash
journalctl --user -u chrome-location-guardian.service
```

## 支持的用户数据路径

| 平台 | Stable | Canary / Unstable | Dev | Beta |
| --- | --- | --- | --- | --- |
| macOS | `~/Library/Application Support/Google/Chrome` | `~/Library/Application Support/Google/Chrome Canary` | `~/Library/Application Support/Google/Chrome Dev` | `~/Library/Application Support/Google/Chrome Beta` |
| Windows | `%LOCALAPPDATA%\Google\Chrome\User Data` | `%LOCALAPPDATA%\Google\Chrome SxS\User Data` | `%LOCALAPPDATA%\Google\Chrome Dev\User Data` | `%LOCALAPPDATA%\Google\Chrome Beta\User Data` |
| Linux | `~/.config/google-chrome` | `~/.config/google-chrome-unstable` | `~/.config/google-chrome-unstable` | `~/.config/google-chrome-beta` |

## Chrome 自身配置仍然重要

这个工具只负责修复本地地区字段。Chrome 可能仍然需要满足这些条件：

- Chrome v147 或更新版本
- Chrome 首选语言为 English (United States)
- 根据你的 Chrome 通道和灰度状态，可能还需要启用相关 Glic `chrome://flags`

## 恢复

CLI 每次修改 `Local State` 前都会先写一个备份：

```text
Local State.backup-chrome-location-guardian-YYYYMMDD-HHMMSS
```

如需手动恢复，请先退出 Chrome，然后用备份文件替换 `Local State`。

## 许可证

MIT。详见 [LICENSE](LICENSE)。
