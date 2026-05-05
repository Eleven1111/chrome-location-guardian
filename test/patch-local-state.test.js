const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const {
  inspectUserDataPath,
  patchLocalStateObject,
  patchUserDataPath,
} = require('../src/patch-local-state');

function tempUserData() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-location-guardian-'));
  fs.writeFileSync(path.join(dir, 'Last Version'), '147.0.7727.138\n');
  return dir;
}

test('patchLocalStateObject updates region and recursive glic eligibility', () => {
  const input = {
    variations_country: 'cn',
    variations_permanent_consistency_country: ['146.0.0.0', 'cn'],
    accounts: [{ is_glic_eligible: false }],
    nested: { value: { is_glic_eligible: false } },
  };

  const result = patchLocalStateObject(input, '147.0.7727.138');

  assert.equal(result.modified, true);
  assert.equal(input.variations_country, 'us');
  assert.deepEqual(input.variations_permanent_consistency_country, ['147.0.7727.138', 'us']);
  assert.equal(input.accounts[0].is_glic_eligible, true);
  assert.equal(input.nested.value.is_glic_eligible, true);
});

test('patchUserDataPath writes backup and patched Local State', () => {
  const dir = tempUserData();
  fs.writeFileSync(
    path.join(dir, 'Local State'),
    JSON.stringify({
      variations_country: 'jp',
      variations_permanent_consistency_country: ['146.0.0.0', 'jp'],
      accounts: [{ is_glic_eligible: false }],
    })
  );

  const result = patchUserDataPath(dir);
  const status = inspectUserDataPath(dir);

  assert.equal(result.changed, true);
  assert.equal(fs.existsSync(result.backupPath), true);
  assert.equal(status.patched, true);
  assert.equal(status.glicEligibleNotTrue, 0);
});

test('patchLocalStateObject creates missing permanent country field', () => {
  const input = { variations_country: 'cn' };

  const result = patchLocalStateObject(input, '147.0.7727.138');

  assert.equal(result.modified, true);
  assert.deepEqual(input.variations_permanent_consistency_country, ['147.0.7727.138', 'us']);
});
