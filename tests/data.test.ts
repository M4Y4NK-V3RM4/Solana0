import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CHECKLISTS } from '../src/data/checklists';
import { LAWS, OFFENCES } from '../src/data/library';
import { QUIZ } from '../src/data/quiz';
import { SIGNS } from '../src/data/signs';
import { estimateFine } from '../src/lib/fines';
import { searchAll } from '../src/lib/search';
import { renderKnowledgeBase } from '../src/server/knowledge';

const allIds = [...LAWS.map((l) => l.id), ...OFFENCES.map((o) => o.id), ...CHECKLISTS.map((c) => c.id)];

test('ids are unique across the library', () => {
  assert.equal(new Set(allIds).size, allIds.length);
});

test('every related id points to a real entry', () => {
  const known = new Set(allIds);
  for (const l of LAWS) for (const r of l.related ?? []) assert.ok(known.has(r), `${l.id} → ${r}`);
});

test('quiz answers are valid and sign references exist', () => {
  const signs = new Set(SIGNS.map((s) => s.id));
  for (const q of QUIZ) {
    assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id);
    if (q.signId) assert.ok(signs.has(q.signId), `${q.id} → ${q.signId}`);
  }
});

test('offence fine ranges are consistent', () => {
  for (const o of OFFENCES) assert.ok(o.fineMin <= o.fineMax, o.id);
});

test('search finds helmet rules and section numbers', () => {
  const helmet = searchAll('helmet');
  assert.ok(helmet.some((h) => h.item.id === 'off-194d'));
  assert.ok(helmet.some((h) => h.item.id === 'mva-129'));
  assert.equal(searchAll('section 185')[0].item.id, 'off-185');
  assert.deepEqual(searchAll('   '), []);
});

test('fine calculator handles overloading, passengers, officers and state multipliers', () => {
  const find = (id: string) => OFFENCES.find((o) => o.id === id)!;
  assert.deepEqual([estimateFine({ offence: find('off-194'), excessTonnes: 2.5 }).min], [26000]);
  assert.equal(estimateFine({ offence: find('off-194a'), excessPassengers: 4 }).max, 800);
  assert.equal(estimateFine({ offence: find('off-194d'), isOfficer: true }).max, 2000);
  assert.equal(estimateFine({ offence: find('off-194b'), stateMultiplier: 3 }).max, 3000);
  assert.equal(estimateFine({ offence: find('off-194b'), stateMultiplier: 50 }).max, 10000);
});

test('knowledge base sent to the AI includes every entry id', () => {
  const kb = renderKnowledgeBase();
  for (const id of allIds) assert.ok(kb.includes(`[${id}]`), id);
});

test('checklist report marks defects and unchecked items', async () => {
  const { buildReport } = await import('../src/lib/report');
  const list = CHECKLISTS[0];
  const text = buildReport(list, { 'Vehicle / reference no.': 'DL1C AB 1234' }, { '0.0': { mark: 'ok' }, '0.1': { mark: 'defect', remark: 'expired' } }, new Date(0));
  assert.match(text, /Vehicle \/ reference no\.: DL1C AB 1234/);
  assert.match(text, /\[DEFECT\] .* — expired/);
  assert.match(text, /1 defect\(s\) found/);
});

test('state view replaces central fines with the state amount and hides other states', async () => {
  const { offencesFor, lawsFor } = await import('../src/data/library');
  assert.ok(offencesFor('DL').some((o) => o.id === 'off-194d'));
  assert.ok(lawsFor('DL').some((l) => l.id === 'dl-old-vehicles'));
  assert.ok(!lawsFor('MH').some((l) => l.id === 'dl-old-vehicles'));
});

test('knowledge base is sent whole while small', async () => {
  const { knowledgeFor, FULL_KB_LIMIT, knowledgeSize } = await import('../src/server/knowledge');
  assert.ok(knowledgeSize() < FULL_KB_LIMIT);
  assert.equal(knowledgeFor('helmet', 'DL').complete, true);
});

test('officials quiz answers are valid', async () => {
  const { OFFICIAL_QUIZ } = await import('../src/data/quiz');
  assert.ok(OFFICIAL_QUIZ.length >= 20);
  for (const q of OFFICIAL_QUIZ) assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id);
});
