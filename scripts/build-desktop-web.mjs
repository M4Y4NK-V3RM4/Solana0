// Assembles a self-contained static site for the desktop app from `expo export`:
// pre-rendered HTML from dist/server + JS/CSS/assets from dist/client.
// AI calls go to EXPO_PUBLIC_API_URL (set it before exporting).
import { cpSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'dist/desktop');
const server = path.join(root, 'dist/server');
const client = path.join(root, 'dist/client');

if (!existsSync(server) || !existsSync(client)) {
  console.error('Run `npx expo export --platform web` first.');
  process.exit(1);
}
if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn('Warning: EXPO_PUBLIC_API_URL is not set — the desktop app will not reach the AI server.');
}

rmSync(out, { recursive: true, force: true });
cpSync(client, out, { recursive: true });

// Copy only HTML pages from the server output (skip the API route bundles).
function copyHtml(dir) {
  for (const name of readdirSync(dir)) {
    const src = path.join(dir, name);
    const rel = path.relative(server, src);
    if (rel.startsWith('_expo')) continue;
    if (statSync(src).isDirectory()) copyHtml(src);
    // Route groups like "(tabs)" are not part of the URL, so flatten them.
    else if (name.endsWith('.html')) cpSync(src, path.join(out, rel.replace(/\([^)]+\)[\\/]/g, '')));
  }
}
copyHtml(server);
console.log('Desktop web bundle ready at dist/desktop');
