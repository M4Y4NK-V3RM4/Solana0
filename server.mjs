// Production server: serves the web app and the /api routes (AI scan + chat).
// Usage: npm run export:web && ANTHROPIC_API_KEY=... npm run serve
import path from 'node:path';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import { createRequire } from 'node:module';

// expo-server's ESM build has extensionless imports that Node cannot resolve; use the CJS build.
const { createRequestHandler } = createRequire(import.meta.url)('expo-server/adapter/express');

const root = path.dirname(new URL(import.meta.url).pathname);
const CLIENT = path.join(root, 'dist/client');
const SERVER = path.join(root, 'dist/server');
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

const app = express();
app.disable('x-powered-by');
app.use(compression());
app.use(morgan('tiny'));

// Desktop (Tauri) and native builds call the API from another origin.
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.static(CLIENT, { maxAge: '1h', extensions: ['html'] }));
app.all('/{*all}', createRequestHandler({ build: SERVER }));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`RoadNyay listening on http://localhost:${port}`));
