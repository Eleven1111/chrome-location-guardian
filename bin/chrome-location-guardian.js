#!/usr/bin/env node

const fs = require('fs');
const { getChromeUserDataCandidates } = require('../src/chrome-paths');
const { isChromeRunning } = require('../src/processes');
const { inspectUserDataPath, patchUserDataPath } = require('../src/patch-local-state');

function usage() {
  console.log(`Chrome Location Guardian

Usage:
  chrome-location-guardian patch [--force] [--json]
  chrome-location-guardian status [--json]

Commands:
  patch   Patch installed Chrome Local State files to region "us".
  status  Show detected Chrome paths and patch status.

Options:
  --force  Patch even if Chrome appears to be running.
  --json   Print machine-readable JSON.
`);
}

function parseArgs(argv) {
  const args = new Set(argv.slice(3));
  return {
    command: argv[2] || 'patch',
    force: args.has('--force'),
    json: args.has('--json'),
  };
}

function logJsonOrText(json, message, item) {
  if (!json) {
    console.log(message);
    return;
  }
  item.messages.push(message);
}

function main() {
  const options = parseArgs(process.argv);
  if (options.command === '--help' || options.command === '-h' || options.command === 'help') {
    usage();
    return;
  }

  const candidates = getChromeUserDataCandidates().filter((candidate) => fs.existsSync(candidate.path));
  const result = {
    command: options.command,
    chromeRunning: isChromeRunning(),
    candidates: [],
    messages: [],
  };

  if (candidates.length === 0) {
    logJsonOrText(options.json, 'No Chrome user data directories found.', result);
    if (options.json) console.log(JSON.stringify(result, null, 2));
    process.exitCode = 1;
    return;
  }

  if (options.command === 'status') {
    for (const candidate of candidates) {
      const status = inspectUserDataPath(candidate.path);
      result.candidates.push({ ...candidate, ...status });
      logJsonOrText(options.json, `${candidate.channel}: ${status.patched ? 'patched' : 'not patched'} ${candidate.path}`, result);
    }
    if (options.json) console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (options.command !== 'patch') {
    usage();
    process.exitCode = 2;
    return;
  }

  if (result.chromeRunning && !options.force) {
    logJsonOrText(options.json, 'Chrome is running. Skip patching to avoid Chrome overwriting Local State on exit.', result);
    if (options.json) console.log(JSON.stringify(result, null, 2));
    return;
  }

  for (const candidate of candidates) {
    const patchResult = patchUserDataPath(candidate.path);
    const status = inspectUserDataPath(candidate.path);
    result.candidates.push({ ...candidate, ...patchResult, status });

    if (patchResult.changed) {
      logJsonOrText(options.json, `${candidate.channel}: patched ${patchResult.chromeVersion}`, result);
    } else if (patchResult.reason === 'already-patched') {
      logJsonOrText(options.json, `${candidate.channel}: already patched`, result);
    } else {
      logJsonOrText(options.json, `${candidate.channel}: skipped ${patchResult.reason}`, result);
    }
  }

  if (options.json) console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
