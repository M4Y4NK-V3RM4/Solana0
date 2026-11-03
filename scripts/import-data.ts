/**
 * Imports research data (JSON Lines) from data/raw/ into the app.
 *
 *   npm run import-data              # verified, conflict-free records only
 *   npm run import-data -- --all     # also include unverified records (shown with a warning in the app)
 *   Options: --raw <dir> --out <file> --report <file>
 *
 * Writes src/data/generated/records.json and data/import-report.md.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { RecordSchema, type DataRecord } from '../src/data/record-schema';

const root = path.resolve(import.meta.dirname, '..');
const arg = (name: string, fallback: string) => {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? path.resolve(process.argv[i + 1]) : path.join(root, fallback);
};
const RAW = arg('--raw', 'data/raw');
const OUT = arg('--out', 'src/data/generated/records.json');
const REPORT = arg('--report', 'data/import-report.md');
const includeUnverified = process.argv.includes('--all');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) return files(p);
    return /\.(jsonl|ndjson)$/i.test(name) ? [p] : [];
  });
}

const rejected: { file: string; line: number; reason: string }[] = [];
const byId = new Map<string, DataRecord & { _file: string }>();
const duplicates: string[] = [];

for (const file of files(RAW)) {
  const rel = path.relative(root, file);
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((raw, i) => {
      const line = raw.trim();
      if (!line || line.startsWith('//')) return;
      let json: unknown;
      try {
        json = JSON.parse(line);
      } catch {
        rejected.push({ file: rel, line: i + 1, reason: 'not valid JSON' });
        return;
      }
      const parsed = RecordSchema.safeParse(json);
      if (!parsed.success) {
        const reason = parsed.error.issues.map((e) => `${e.path.join('.') || '(root)'}: ${e.message}`).join('; ');
        rejected.push({ file: rel, line: i + 1, reason });
        return;
      }
      const rec = parsed.data;
      if (byId.has(rec.id)) {
        duplicates.push(`${rec.id} (${rel}:${i + 1}, first seen in ${byId.get(rec.id)!._file})`);
        // Keep the verified one if only one of them is verified.
        if (!(rec.verified && !byId.get(rec.id)!.verified)) return;
      }
      byId.set(rec.id, { ...rec, _file: rel });
    });
}

const all = [...byId.values()];
const conflicts = all.filter((r) => r.conflict);
const unverified = all.filter((r) => !r.verified);
const kept = all.filter((r) => !r.conflict && (r.verified || includeUnverified)).map(({ _file, ...r }) => r);
const keptIds = new Set(kept.map((r) => r.id));
const brokenLinks = kept.flatMap((r) => [...r.related, ...r.supersedes].filter((id) => !keptIds.has(id)).map((id) => `${r.id} → ${id}`));

kept.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(OUT, JSON.stringify(kept, null, 0) + '\n');

const count = (list: { type: string }[]) =>
  Object.entries(list.reduce<Record<string, number>>((acc, r) => ((acc[r.type] = (acc[r.type] ?? 0) + 1), acc), {}))
    .sort()
    .map(([t, n]) => `| ${t} | ${n} |`)
    .join('\n');
const list = (items: string[], max = 200) => (items.length ? items.slice(0, max).map((x) => `- ${x}`).join('\n') + (items.length > max ? `\n- … and ${items.length - max} more` : '') : '_None_');

writeFileSync(
  REPORT,
  `# Data import report

Generated ${new Date().toISOString()}. Mode: ${includeUnverified ? 'verified + unverified' : 'verified only'}.

- Records read: ${all.length + rejected.length + duplicates.length}
- Imported into the app: **${kept.length}**
- Rejected (invalid): ${rejected.length}
- Unverified: ${unverified.length}${includeUnverified ? ' (imported, shown with a warning)' : ' (not imported — use --all to include)'}
- Conflicts (not imported): ${conflicts.length}
- Duplicate ids: ${duplicates.length}

## Imported by type

| Type | Count |
|---|---|
${count(kept)}

## Rejected lines

${list(rejected.map((r) => `${r.file}:${r.line} — ${r.reason}`))}

## Conflicts to resolve

${list(conflicts.map((r) => `${r.id} — ${r.notes || 'no notes'}`))}

## Unverified

${list(unverified.map((r) => `${r.id} — ${r.notes || 'no notes'}`))}

## Links to records that are missing

${list(brokenLinks)}

## Duplicate ids

${list(duplicates)}
`,
);

console.log(`Imported ${kept.length} records (${rejected.length} rejected, ${conflicts.length} conflicts, ${unverified.length} unverified). Report: data/import-report.md`);
