import { CHECKLISTS } from '../data/checklists';
import { HISTORY, LAWS, OFFENCES, OTHER_RECORDS } from '../data/library';

interface Chunk {
  id: string;
  jurisdiction: string;
  text: string;
  /** Lower-cased text used for retrieval scoring. */
  search: string;
}

const tag = (j?: string) => (!j || j === 'central' ? '' : ` {${j}}`);
const verifiedNote = (v?: boolean) => (v ? ' (verified against official text)' : '');

function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  const add = (id: string, jurisdiction: string | undefined, text: string) =>
    chunks.push({ id, jurisdiction: jurisdiction ?? 'central', text, search: text.toLowerCase() });

  for (const l of LAWS) {
    add(
      l.id,
      l.jurisdiction,
      `[${l.id}]${tag(l.jurisdiction)} ${l.source} ${l.ref} — ${l.title}${verifiedNote(l.verified)}\n${l.summary}` +
        (l.keyPoints.length ? '\n' + l.keyPoints.map((k) => `- ${k}`).join('\n') : '') +
        (l.history ? `\nHistory: ${l.history}` : '') +
        (l.text ? `\nText: ${l.text.slice(0, 3000)}` : '') +
        (l.effectiveFrom ? `\nIn force from: ${l.effectiveFrom}` : '') +
        (l.status && l.status !== 'in_force' && l.status !== 'unknown' ? `\nStatus: ${l.status}` : '') +
        (l.tags.length ? `\nKeywords: ${l.tags.join(', ')}` : ''),
    );
  }
  for (const o of OFFENCES) {
    add(
      o.id,
      o.jurisdiction,
      `[${o.id}]${tag(o.jurisdiction)} Section ${o.section} — ${o.title}${verifiedNote(o.verified)}\nFirst: ${o.first}` +
        (o.subsequent ? `\nSubsequent: ${o.subsequent}` : '') +
        (o.extra ? `\nAlso: ${o.extra}` : '') +
        (o.licenceSeizable ? '\nLicence can be seized under s.206(4).' : '') +
        `\nKeywords: ${o.tags.join(', ')}`,
    );
  }
  for (const c of CHECKLISTS) {
    add(c.id, 'central', `[${c.id}] Checklist: ${c.title} (${c.basis})\n` + c.sections.map((s) => `${s.heading}: ${s.items.join('; ')}`).join('\n'));
  }
  for (const r of OTHER_RECORDS) {
    add(r.id, r.jurisdiction, `[${r.id}]${tag(r.jurisdiction)} ${r.type}: ${r.title}\n${r.summary_en || r.text}`.slice(0, 3000));
  }
  add('timeline', 'central', 'TIMELINE\n' + HISTORY.map((h) => `${h.year}${tag(h.jurisdiction)}: ${h.title} — ${h.detail}`).join('\n'));
  return chunks;
}

let chunks: Chunk[] | null = null;
let full: string | null = null;
const getChunks = () => (chunks ??= buildChunks());

/**
 * Above this size the whole library no longer goes with every request; only the
 * records most relevant to the question do. ~300k characters ≈ 75k tokens.
 */
export const FULL_KB_LIMIT = 300_000;
const RETRIEVE = 60;

export function knowledgeSize(): number {
  return (full ??= getChunks().map((c) => c.text).join('\n\n')).length;
}

/**
 * The knowledge base text for a request. While the library is small it is sent
 * whole (identical every time, so it is prompt-cached). Once it is large, the
 * records best matching the query are sent instead.
 */
export function knowledgeFor(query: string, stateCode?: string): { text: string; complete: boolean } {
  const all = getChunks();
  if (knowledgeSize() <= FULL_KB_LIMIT) return { text: full!, complete: true };

  const words = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 2);
  const sections = [...query.matchAll(/\b(\d{1,3}[a-z]?)\b/gi)].map((m) => m[1].toLowerCase());
  const scored = all
    .filter((c) => c.jurisdiction === 'central' || c.jurisdiction === stateCode)
    .map((c) => {
      let score = 0;
      for (const w of words) if (c.search.includes(w)) score += 1;
      for (const s of sections) if (c.search.includes(`section ${s} `) || c.search.includes(`s.${s}`) || c.search.includes(`ref ${s}`)) score += 5;
      if (stateCode && c.jurisdiction === stateCode) score *= 1.5;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, RETRIEVE);
  return { text: scored.map((x) => x.c.text).join('\n\n'), complete: false };
}

/** Full text, for tests and debugging. */
export function renderKnowledgeBase(): string {
  return getChunks()
    .map((c) => c.text)
    .join('\n\n');
}
