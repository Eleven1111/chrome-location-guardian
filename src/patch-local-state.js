const fs = require('fs');
const path = require('path');

function timestampForFile(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

function readTrimmed(file) {
  return fs.readFileSync(file, 'utf8').trim();
}

function setAllIsGlicEligible(value) {
  let modified = false;

  if (Array.isArray(value)) {
    for (const item of value) {
      if (setAllIsGlicEligible(item)) modified = true;
    }
    return modified;
  }

  if (!value || typeof value !== 'object') return false;

  for (const [key, child] of Object.entries(value)) {
    if (key === 'is_glic_eligible') {
      if (child !== true) {
        value[key] = true;
        modified = true;
      }
      continue;
    }

    if (setAllIsGlicEligible(child)) modified = true;
  }

  return modified;
}

function patchLocalStateObject(localState, chromeVersion, region = 'us') {
  let modified = false;

  if (setAllIsGlicEligible(localState)) modified = true;

  if (localState.variations_country !== region) {
    localState.variations_country = region;
    modified = true;
  }

  const permanentCountry = localState.variations_permanent_consistency_country;
  if (!Array.isArray(permanentCountry) || permanentCountry.length < 2) {
    localState.variations_permanent_consistency_country = [chromeVersion, region];
    modified = true;
  } else if (permanentCountry[0] !== chromeVersion || permanentCountry[1] !== region) {
    permanentCountry[0] = chromeVersion;
    permanentCountry[1] = region;
    modified = true;
  }

  return { modified, localState };
}

function inspectUserDataPath(userDataPath) {
  const localStateFile = path.join(userDataPath, 'Local State');
  const lastVersionFile = path.join(userDataPath, 'Last Version');
  const exists = fs.existsSync(userDataPath);
  const hasLocalState = fs.existsSync(localStateFile);
  const hasLastVersion = fs.existsSync(lastVersionFile);

  if (!exists || !hasLocalState || !hasLastVersion) {
    return {
      exists,
      hasLocalState,
      hasLastVersion,
      patched: false,
      reason: 'missing-files',
    };
  }

  const chromeVersion = readTrimmed(lastVersionFile);
  const localState = JSON.parse(fs.readFileSync(localStateFile, 'utf8'));
  let glicEligibleFields = 0;
  let glicEligibleNotTrue = 0;

  function walk(value) {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (key === 'is_glic_eligible') {
        glicEligibleFields += 1;
        if (child !== true) glicEligibleNotTrue += 1;
      }
      walk(child);
    }
  }

  walk(localState);

  const vpcc = localState.variations_permanent_consistency_country;
  const patched =
    localState.variations_country === 'us' &&
    Array.isArray(vpcc) &&
    vpcc[0] === chromeVersion &&
    vpcc[1] === 'us' &&
    glicEligibleNotTrue === 0;

  return {
    exists,
    hasLocalState,
    hasLastVersion,
    chromeVersion,
    patched,
    variationsCountry: localState.variations_country,
    variationsPermanentConsistencyCountry: vpcc,
    glicEligibleFields,
    glicEligibleNotTrue,
  };
}

function patchUserDataPath(userDataPath, options = {}) {
  const region = options.region || 'us';
  const localStateFile = path.join(userDataPath, 'Local State');
  const lastVersionFile = path.join(userDataPath, 'Last Version');

  if (!fs.existsSync(localStateFile) || !fs.existsSync(lastVersionFile)) {
    return { changed: false, skipped: true, reason: 'missing-files' };
  }

  const chromeVersion = readTrimmed(lastVersionFile);
  const original = fs.readFileSync(localStateFile, 'utf8');
  const localState = JSON.parse(original);
  const { modified } = patchLocalStateObject(localState, chromeVersion, region);

  if (!modified) {
    return { changed: false, skipped: false, reason: 'already-patched', chromeVersion };
  }

  const backupPath = `${localStateFile}.backup-chrome-location-guardian-${timestampForFile()}`;
  fs.copyFileSync(localStateFile, backupPath);
  fs.writeFileSync(localStateFile, JSON.stringify(localState), 'utf8');

  return {
    changed: true,
    skipped: false,
    chromeVersion,
    backupPath,
  };
}

module.exports = {
  inspectUserDataPath,
  patchLocalStateObject,
  patchUserDataPath,
  setAllIsGlicEligible,
  timestampForFile,
};
