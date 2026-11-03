import type { Checklist } from '../data/types';

export type Mark = 'ok' | 'defect' | 'na';
export interface ItemState {
  mark?: Mark;
  remark?: string;
}

export const MARKS: { id: Mark; label: string }[] = [
  { id: 'ok', label: 'OK' },
  { id: 'defect', label: 'Defect' },
  { id: 'na', label: 'N/A' },
];

export function buildReport(list: Checklist, header: Record<string, string>, state: Record<string, ItemState>, when = new Date()): string {
  const lines: string[] = [];
  lines.push(list.title.toUpperCase());
  lines.push(`Basis: ${list.basis}`);
  lines.push(`Date: ${when.toLocaleString('en-IN')}`);
  for (const [k, v] of Object.entries(header)) if (v.trim()) lines.push(`${k}: ${v.trim()}`);
  const all = list.sections.flatMap((s, si) => s.items.map((_, ii) => state[`${si}.${ii}`]));
  const defects = all.filter((x) => x?.mark === 'defect').length;
  const unchecked = all.filter((x) => !x?.mark).length;
  lines.push(`Result: ${defects ? `${defects} defect(s) found` : 'No defects found'}${unchecked ? `; ${unchecked} item(s) not checked` : ''}`);
  list.sections.forEach((s, si) => {
    lines.push('', s.heading);
    s.items.forEach((item, ii) => {
      const st = state[`${si}.${ii}`];
      const mark = st?.mark === 'ok' ? '[OK]    ' : st?.mark === 'defect' ? '[DEFECT]' : st?.mark === 'na' ? '[N/A]   ' : '[ — ]   ';
      lines.push(`${mark} ${item}${st?.mark === 'defect' && st.remark ? ` — ${st.remark}` : ''}`);
    });
  });
  lines.push('', 'Signature: ____________________');
  return lines.join('\n');
}
