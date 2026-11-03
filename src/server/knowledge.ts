import { CHECKLISTS } from '../data/checklists';
import { HISTORY } from '../data/history';
import { LAWS } from '../data/laws';
import { OFFENCES } from '../data/offences';

/**
 * The whole knowledge base rendered as plain text. It is small enough to send
 * in full with every request and is identical each time, so it is cached by the
 * API (prompt caching) and costs little after the first request.
 */
export function renderKnowledgeBase(): string {
  const parts: string[] = [];
  parts.push('# PROVISIONS');
  for (const l of LAWS) {
    parts.push(
      `[${l.id}] ${l.source} ${l.ref} — ${l.title}\n${l.summary}\n` +
        l.keyPoints.map((k) => `- ${k}`).join('\n') +
        (l.history ? `\nHistory: ${l.history}` : ''),
    );
  }
  parts.push('# OFFENCES AND CENTRAL PENALTIES (MV Act as amended 2019)');
  for (const o of OFFENCES) {
    parts.push(
      `[${o.id}] Section ${o.section} — ${o.title}\nFirst: ${o.first}` +
        (o.subsequent ? `\nSubsequent: ${o.subsequent}` : '') +
        (o.extra ? `\nAlso: ${o.extra}` : '') +
        (o.licenceSeizable ? '\nLicence can be seized under s.206(4).' : ''),
    );
  }
  parts.push('# TIMELINE');
  for (const h of HISTORY) parts.push(`${h.year}: ${h.title} — ${h.detail}`);
  parts.push('# OFFICIAL CHECKLISTS');
  for (const c of CHECKLISTS) {
    parts.push(`[${c.id}] ${c.title} (${c.basis})\n` + c.sections.map((s) => `${s.heading}: ${s.items.join('; ')}`).join('\n'));
  }
  return parts.join('\n\n');
}

let cached: string | null = null;
export function knowledgeBase(): string {
  return (cached ??= renderKnowledgeBase());
}
