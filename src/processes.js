const childProcess = require('child_process');

function commandOutput(command, args) {
  try {
    return childProcess.execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

function isChromeRunning(platform = process.platform) {
  if (platform === 'darwin') {
    const output = commandOutput('/bin/ps', ['-axo', 'comm,args']);
    return [
      '/Applications/Google Chrome.app/',
      '/Applications/Google Chrome Canary.app/',
      '/Applications/Google Chrome Dev.app/',
      '/Applications/Google Chrome Beta.app/',
    ].some((needle) => output.includes(needle));
  }

  if (platform === 'win32') {
    const output = commandOutput('tasklist.exe', ['/fo', 'csv', '/nh']).toLowerCase();
    return output.includes('"chrome.exe"');
  }

  if (platform === 'linux') {
    const output = commandOutput('/bin/ps', ['-axo', 'comm,args']);
    return /(^|\/)(google-chrome|google-chrome-stable|google-chrome-beta|google-chrome-unstable|chrome)(\s|$)/m.test(output);
  }

  return false;
}

module.exports = {
  isChromeRunning,
};
