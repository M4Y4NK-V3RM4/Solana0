# RoadNyay

Indian traffic and transport law in one app, for **citizens** (drivers, learners, vehicle owners, people who got a challan) and **officials** (Motor Vehicles Inspectors, traffic police, RTO and transport department staff).

One TypeScript codebase runs on:

| Platform | How |
|---|---|
| Web | Expo Router static web + Node server (`server.mjs`) for the AI API |
| Android / iOS | Expo (React Native), built with EAS |
| Windows / macOS / Linux | Tauri wrapper around the web build (`src-tauri/`) |

## Features

- **Choose your role.** At sign-up (and later in Settings) users pick *Citizen* or *Official* (MVI, traffic police, RTO staff). The home screen, tools tab, library ordering and AI answers adapt to the role. Users also pick their state and language (English / हिन्दी).
- **Law library.** Plain-language summaries of the Motor Vehicles Act 1988 (as amended in 2019), key Central Motor Vehicles Rules 1989, and the BNS provisions on rash driving and death by negligence. Each entry has key points, related provisions, and the history behind it. Works offline.
- **Offences & fines.** Central penalties for first and repeat offences, licence seizure rules, and a fine calculator (overloading per tonne, excess passengers, the s.210B officer double penalty).
- **AI document scanner.** Photograph a challan, notice, summons, complaint or accident photo. Claude reads it and returns: what it is, the facts on it, the sections involved (linked to the library), the amount, what happens next, the person's options, deadlines, and warnings (including fake-challan signs).
- **Ask AI.** Chat about any traffic law question. Answers are grounded in the RoadNyay library and cite sections as tappable links.
- **Learn.** 30-question learner-test practice, road signs, and a timeline of Indian road law from 1914 to today.
- **Official tools.** Checklists for fitness inspection, conducting the driving test, roadside checks, and accident scenes.

> RoadNyay gives legal information, not legal advice. Amounts shown are central penalties; states can compound at different amounts (s.200) and apply multipliers (s.210A).

## Getting started

```bash
npm install
cp .env.example .env          # add your ANTHROPIC_API_KEY
npm run web                   # web + API routes at http://localhost:8081
npm run android               # or: npm run ios  (Expo Go / dev build)
```

In development, the native apps call the AI routes on the Expo dev server automatically.

### Checks

```bash
npm run typecheck
npm test
```

## Production

### Web + API server

```bash
npm run export:web
ANTHROPIC_API_KEY=... PORT=3000 npm run serve
```

`server.mjs` serves the pre-rendered pages and the `/api/ask` and `/api/scan` routes. Set `ALLOWED_ORIGINS` (comma-separated) to allow the desktop app to call the API, e.g. `ALLOWED_ORIGINS=tauri://localhost,http://tauri.localhost`.

The API key stays on the server. Never put it in an `EXPO_PUBLIC_` variable.

### Android and iOS

```bash
npm i -g eas-cli
eas build --platform android --profile preview   # installable APK
eas build --platform ios --profile production
```

Set `EXPO_PUBLIC_API_URL` in `eas.json` to your deployed server.

### Desktop

Requires Rust and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS.

```bash
EXPO_PUBLIC_API_URL=https://your-server npm run desktop:build
```

Installers are written to `src-tauri/target/release/bundle/`.

## Project layout

```
src/app/            Screens (Expo Router). (tabs)/ = Home, Laws, Scan, Ask AI, Tools/Learn
src/app/api/        Server routes: ask+api.ts, scan+api.ts
src/data/           Law library, offences, signs, quiz, checklists, history
src/lib/            Profile (role), i18n, search, fine calculator, API client
src/server/         Claude integration, request/response schemas, knowledge base
src-tauri/          Desktop wrapper
server.mjs          Production web/API server
```

## How the AI works

Each request sends the whole RoadNyay library as the system prompt (prompt-cached, so it is cheap after the first call), plus the user's role, state and language. The model is told to cite library ids, to say clearly when something is outside the library, and never to invent section numbers or amounts. Document scans use structured output, so the app always gets the same fields back.

## Roadmap

- State-wise rules, compounding amounts and notifications (all 36 states and UTs)
- Full official text of the Act and Rules alongside the summaries, with vector search
- Landmark court judgments
- More languages (Marathi, Tamil, Telugu, Bengali, Kannada, Gujarati, …)
- Cloud accounts to sync scans and history across devices
