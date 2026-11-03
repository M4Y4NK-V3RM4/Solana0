import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

test('importer keeps verified records and reports the rest', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'roadnyay-import-'));
  const out = path.join(dir, 'records.json');
  const report = path.join(dir, 'report.md');
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/import-data.ts', '--raw', 'tests/fixtures/raw', '--out', out, '--report', report], { cwd: root });
  const records = JSON.parse(readFileSync(out, 'utf8')) as { id: string; jurisdiction: string }[];
  assert.deepEqual(records.map((r) => r.id).sort(), ['central.notif.test', 'dl.fine.test-194d']);
  assert.equal(records.find((r) => r.id === 'dl.fine.test-194d')!.jurisdiction, 'DL');
  const md = readFileSync(report, 'utf8');
  assert.match(md, /Rejected \(invalid\): 2/);
  assert.match(md, /Unverified: 1/);
  assert.match(md, /Conflicts \(not imported\): 1/);
  assert.match(md, /central\.notif\.test → missing\.record/);
});
