import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CHECKLISTS } from '../src/data/checklists';
import { LAWS } from '../src/data/laws';
import { OFFENCES } from '../src/data/offences';
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
