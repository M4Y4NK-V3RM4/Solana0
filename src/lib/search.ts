import { isCentral, LAWS, OFFENCES } from '../data/library';
import type { LawEntry, Offence } from '../data/types';

export type SearchHit = { kind: 'law'; item: LawEntry; score: number } | { kind: 'offence'; item: Offence; score: number };

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu, ' ');

function tokens(s: string): string[] {
  return norm(s).split(/\s+/).filter((w) => w.length > 1);
}

function scoreText(query: string, qTokens: string[], fields: { text: string; weight: number }[]): number {
  let score = 0;
  const q = norm(query).trim();
  for (const f of fields) {
    const text = norm(f.text);
    if (q && text.includes(q)) score += 4 * f.weight;
    for (const tok of qTokens) if (text.includes(tok)) score += f.weight;
  }
  return score;
}

/** Simple keyword ranking over laws and offences. Runs on device, works offline. Pass a state code to hide other states' records. */
export function searchAll(query: string, limit = 30, stateCode?: string): SearchHit[] {
  const inScope = (j?: string) => isCentral(j) || !stateCode || j === stateCode;
  const qTokens = tokens(query);
  if (!qTokens.length) return [];
  // Let "s 129", "section 129" and "129" all hit section numbers.
  const sectionNum = query.match(/\b(\d{1,3}[a-z]?)\b/i)?.[1]?.toLowerCase();

  const hits: SearchHit[] = [];
  for (const law of LAWS) {
    if (!inScope(law.jurisdiction)) continue;
    let score = scoreText(query, qTokens, [
      { text: law.title + ' ' + (law.titleHi ?? ''), weight: 3 },
      { text: law.tags.join(' '), weight: 3 },
      { text: law.ref, weight: 2 },
      { text: law.summary, weight: 1 },
      { text: law.keyPoints.join(' '), weight: 0.5 },
    ]);
    if (sectionNum && law.ref.toLowerCase().match(new RegExp(`\\b${sectionNum}\\b`))) score += 10;
    if (score > 0) hits.push({ kind: 'law', item: law, score });
  }
  for (const off of OFFENCES) {
    if (!inScope(off.jurisdiction)) continue;
    let score = scoreText(query, qTokens, [
      { text: off.title + ' ' + (off.titleHi ?? ''), weight: 3 },
      { text: off.tags.join(' '), weight: 3 },
      { text: off.first + ' ' + (off.extra ?? ''), weight: 0.5 },
    ]);
    if (sectionNum && off.section.toLowerCase().startsWith(sectionNum)) score += 10;
    if (score > 0) hits.push({ kind: 'offence', item: off, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function findLaw(id: string): LawEntry | undefined {
  return LAWS.find((l) => l.id === id);
}

export function findOffence(id: string): Offence | undefined {
  return OFFENCES.find((o) => o.id === id);
}
