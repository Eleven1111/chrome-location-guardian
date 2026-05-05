const os = require('os');
const path = require('path');

function expandHome(input) {
  if (input.startsWith('~/')) return path.join(os.homedir(), input.slice(2));
  return input;
}

function getChromeUserDataCandidates(platform = process.platform, env = process.env) {
  if (platform === 'darwin') {
    return [
      { channel: 'stable', appName: 'Google Chrome', path: '~/Library/Application Support/Google/Chrome' },
      { channel: 'canary', appName: 'Google Chrome Canary', path: '~/Library/Application Support/Google/Chrome Canary' },
      { channel: 'dev', appName: 'Google Chrome Dev', path: '~/Library/Application Support/Google/Chrome Dev' },
      { channel: 'beta', appName: 'Google Chrome Beta', path: '~/Library/Application Support/Google/Chrome Beta' },
    ].map((item) => ({ ...item, path: expandHome(item.path) }));
  }

  if (platform === 'win32') {
    const localAppData = env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    return [
      { channel: 'stable', processName: 'chrome.exe', path: path.join(localAppData, 'Google', 'Chrome', 'User Data') },
      { channel: 'canary', processName: 'chrome.exe', path: path.join(localAppData, 'Google', 'Chrome SxS', 'User Data') },
      { channel: 'dev', processName: 'chrome.exe', path: path.join(localAppData, 'Google', 'Chrome Dev', 'User Data') },
      { channel: 'beta', processName: 'chrome.exe', path: path.join(localAppData, 'Google', 'Chrome Beta', 'User Data') },
    ];
  }

  if (platform === 'linux') {
    return [
      { channel: 'stable', processName: 'chrome', path: '~/.config/google-chrome' },
      { channel: 'canary', processName: 'chrome', path: '~/.config/google-chrome-canary' },
      { channel: 'unstable', processName: 'chrome', path: '~/.config/google-chrome-unstable' },
      { channel: 'beta', processName: 'chrome', path: '~/.config/google-chrome-beta' },
    ].map((item) => ({ ...item, path: expandHome(item.path) }));
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

module.exports = {
  expandHome,
  getChromeUserDataCandidates,
};
