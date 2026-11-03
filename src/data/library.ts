/**
 * The app's single source of legal content: the hand-written seed library plus
 * records imported from research data (src/data/generated/records.json).
 */
import { HISTORY as SEED_HISTORY } from './history';
import { LAWS as SEED_LAWS } from './laws';
import { OFFENCES as SEED_OFFENCES } from './offences';
import type { DataRecord } from './record-schema';
import type { HistoryEvent, LawCategory, LawEntry, Offence } from './types';
import imported from './generated/records.json';

const RECORDS = imported as unknown as DataRecord[];

const CATEGORY_HINTS: [LawCategory, RegExp][] = [
  ['licensing', /licen[cs]e|learner|driving test|\bdl\b/i],
  ['registration', /registration|\brc\b|number plate|hsrp|transfer of ownership/i],
  ['permits', /permit|stage carriage|contract carriage|aggregator/i],
  ['insurance', /insurance|claims? tribunal|mact|compensation/i],
  ['accidents', /accident|hit and run|good samaritan|golden hour/i],
  ['safety', /helmet|seat ?belt|child|road safety/i],
  ['vehicle-standards', /fitness|emission|puc|construction|equipment|speed governor|reflector/i],
  ['criminal', /nyaya sanhita|bns|ipc|penal code/i],
  ['road-rules', /speed limit|parking|lane|signal|driving regulations|traffic sign/i],
  ['enforcement', /penalt|offence|compound|seiz|impound|challan/i],
];

function categoryFor(r: DataRecord): LawCategory {
  if (r.type === 'judgment') return 'judgments';
  if (r.type === 'notification' || r.type === 'circular') return 'notifications';
  if (r.type === 'procedure' || r.type === 'form' || r.type === 'fee') return 'procedures';
  const hay = `${r.title} ${r.instrument} ${r.tags.join(' ')}`;
  return CATEGORY_HINTS.find(([, re]) => re.test(hay))?.[0] ?? 'other';
}

function provenance(r: DataRecord) {
  return {
    jurisdiction: r.jurisdiction,
    verified: r.verified,
    status: r.status,
    effectiveFrom: r.effective_from,
    effectiveTo: r.effective_to,
    sources: r.sources.map((s) => ({ url: s.url, title: s.title, publisher: s.publisher, datePublished: s.date_published })),
  };
}

function toLaw(r: DataRecord): LawEntry {
  return {
    id: r.id,
    source: r.instrument || (r.jurisdiction === 'central' ? 'Central' : r.jurisdiction),
    ref: r.reference || r.type.replace('_', ' '),
    title: r.title,
    category: categoryFor(r),
    audience: r.audience,
    summary: r.summary_en || r.text.slice(0, 400),
    keyPoints: [],
    history: r.history || undefined,
    text: r.text || undefined,
    related: [...r.related, ...r.supersedes],
    tags: r.tags,
    ...provenance(r),
  };
}

function toOffence(r: DataRecord): Offence {
  const f = r.fine!;
  return {
    id: r.id,
    section: r.reference.replace(/^(section|sec\.?|s\.)\s*/i, '') || '?',
    title: f.offence || r.title,
    first: f.first || r.summary_en,
    subsequent: f.subsequent || undefined,
    fineMin: f.min_rs,
    fineMax: Math.max(f.max_rs, f.min_rs),
    extra: f.other_consequences || undefined,
    tags: r.tags,
    ...provenance(r),
  };
}

const LAW_TYPES = new Set<DataRecord['type']>([
  'act_section', 'rule', 'regulation', 'scheme', 'notification', 'circular', 'procedure', 'form', 'fee', 'judgment', 'committee_report', 'glossary',
]);

const importedOffences = RECORDS.filter((r) => r.type === 'fine' && r.fine).map(toOffence);
const importedLaws = RECORDS.filter((r) => LAW_TYPES.has(r.type)).map(toLaw);
const importedHistory: HistoryEvent[] = RECORDS.filter((r) => r.type === 'history_event').map((r) => ({
  year: (r.effective_from ?? '').slice(0, 4) || '—',
  date: r.effective_from ?? undefined,
  jurisdiction: r.jurisdiction,
  title: r.title,
  detail: r.summary_en || r.text,
}));

// Imported records replace seed entries with the same id.
function merge<T extends { id: string }>(seed: T[], extra: T[]): T[] {
  const ids = new Set(extra.map((e) => e.id));
  return [...seed.filter((s) => !ids.has(s.id)), ...extra];
}

export const LAWS: LawEntry[] = merge(SEED_LAWS, importedLaws);
export const OFFENCES: Offence[] = merge(SEED_OFFENCES, importedOffences);
const when = (h: HistoryEvent) => h.date ?? h.year;
export const HISTORY: HistoryEvent[] = [...SEED_HISTORY, ...importedHistory].sort((a, b) => when(a).localeCompare(when(b)));
/** Records the app has no screen for yet (test questions, road signs) still go to the AI. */
export const OTHER_RECORDS: DataRecord[] = RECORDS.filter((r) => !LAW_TYPES.has(r.type) && r.type !== 'fine' && r.type !== 'history_event');
export const IMPORTED_COUNT = RECORDS.length;

export const isCentral = (j?: string) => !j || j === 'central';

/**
 * Offences relevant to a state: central penalties, with a state's own amount
 * replacing the central one for the same section when the state has one.
 */
export function offencesFor(stateCode?: string): Offence[] {
  const central = OFFENCES.filter((o) => isCentral(o.jurisdiction));
  const state = stateCode ? OFFENCES.filter((o) => o.jurisdiction === stateCode) : [];
  const stateSections = new Set(state.map((o) => o.section.toLowerCase()));
  return [...state, ...central.filter((o) => !stateSections.has(o.section.toLowerCase()))].sort((a, b) =>
    a.section.localeCompare(b.section, 'en', { numeric: true }),
  );
}

/** Laws that apply in a state: central ones plus that state's own. */
export function lawsFor(stateCode?: string): LawEntry[] {
  return LAWS.filter((l) => isCentral(l.jurisdiction) || l.jurisdiction === stateCode);
}

export interface UpdateItem {
  id: string;
  date: string;
  title: string;
  detail: string;
  jurisdiction: string;
  /** Library entry to open, if any. */
  lawId?: string;
}

/**
 * The "What changed" feed: dated changes to the law, newest first. Imported
 * notifications and circulars appear here automatically.
 */
export function updatesFor(stateCode?: string, since = '2018'): UpdateItem[] {
  const fromHistory = HISTORY.filter((h) => h.date && h.date >= since).map((h, i) => ({
    id: `h-${i}-${h.date}`,
    date: h.date!,
    title: h.title,
    detail: h.detail,
    jurisdiction: h.jurisdiction ?? 'central',
  }));
  const fromNotifications = LAWS.filter((l) => l.category === 'notifications' && l.effectiveFrom).map((l) => ({
    id: `n-${l.id}`,
    date: l.effectiveFrom!,
    title: l.title,
    detail: l.summary,
    jurisdiction: l.jurisdiction ?? 'central',
    lawId: l.id,
  }));
  return [...fromHistory, ...fromNotifications]
    .filter((u) => isCentral(u.jurisdiction) || u.jurisdiction === stateCode)
    .sort((a, b) => b.date.localeCompare(a.date));
}
