# 🔬 CuriousMinds Lab

Personal-use STEM + Arts learning app. Philosophy: **Explore → Discover → Create → Connect**.

## Quick start (Windows)

```powershell
cd C:\Users\thwin\Desktop\STEM
npm install
npm run dev
# open http://localhost:3002
```

The database seeds automatically on first load (via `/api/seed`).
Data lives in `./data/curious-minds.db` (SQLite). Back up that file to keep progress!

## What's inside

- **9 subjects, 54 labs**: Physics (8), Chemistry (5), Biology (5), Earth & Space (4),
  Math (8), Music (6), Art (6), Computer Science (8), Language (4)
- **Every lab has**: interactive simulation + controls + live data panel +
  Learn/Words/Facts/Try-at-Home tabs + Knowledge Check quiz + XP
- **Gamification**: XP, levels, streaks, 22 achievements (incl. secret 🦉🐦),
  daily challenges, cross-discipline Mega Projects
- **My Projects**: save beats, melodies, art, code, launches
- **Journal**: scientist's log (also receives published stories/poems)
- **Parent Dashboard**: time, subjects, 14-day chart, conversation starters
- **Settings**: name, age (adaptive difficulty), avatar, theme, daily goal
- **Adaptive difficulty engine** (`src/lib/adaptive.ts`), daily challenge rotation
  (`src/lib/challenges.ts`)

## Scripts

```powershell
npm run dev      # start dev server
npm run build    # production build
npm start        # run production build
npm run db:seed  # seed DB manually (tsx src/db/run-seed.ts)
```

## Self-host on your home network (tablet access)

```powershell
npm run build
npm start -- --hostname 0.0.0.0 --port 3002
# On the tablet browser: http://YOUR-PC-IP:3002
```

## Tech

Next.js 14 (App Router) • TypeScript • Tailwind • Zustand • Drizzle ORM +
better-sqlite3 (with automatic JSON-file fallback if the native module can't
build) • Canvas/SVG simulations • WebAudio synth (no external audio service).
Heavy creative libs (three, tone, monaco, blockly, pyodide...) are listed in
`package.json` per the architecture spec; simulations run on dependency-free
Canvas/WebAudio so the app works offline on localhost.
