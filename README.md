# Forma

A gamified body-recomposition tracker. Built for fast daily check-ins: log your gym split, tap in your main protein sources, and watch your XP, level, streak, and progress climb.

Everything is stored locally on your device (`localStorage`) — no account, no backend, no data leaves your phone. Installable as a PWA on iPhone (Share → Add to Home Screen).

## Pages

- **Dashboard** — your hub. Level + XP, today's protein, gym sessions, streak, this week's strip, achievements. Tap any tile to go deeper.
- **Gym** — log today's session (push / pull / legs), see weekly 3-slot progress and your rotation suggestion.
- **Protein** — tap steppers on your main sources to reach your daily target. Add custom sources anytime.
- **Profile** — your stats (weight, height, age, goal, activity, multiplier). Drives your protein target everywhere; logging weight feeds the trend chart.
- **Progress** — streak ring, protein hit/miss heatmap, weight trend, consistency %.
- **History** — full scrollable log with gym/protein filter and CSV export.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default http://localhost:5173).

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

## Deploy to GitHub Pages

1. Create a new GitHub repo and push this project to the `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`.
4. Your app goes live at `https://<your-username>.github.io/<repo-name>/`.

`vite.config.js` uses `base: "./"` so it works under any repo path without extra config.

## Stack

React 18 · Vite · Framer Motion (kinetic motion + transitions) · canvas-confetti (celebrations) · plain CSS design system. Fonts: Unbounded (display) + Space Grotesk (body) via Google Fonts. Icons: Tabler.

## Tuning the game layer

XP values and level curve live in `src/lib/store.js` (`XP_PER_GYM`, `XP_PER_PROTEIN_HIT`, `levelFromXp`, `LEVEL_NAMES`, `BADGES`). Default protein sources are in `DEFAULT_SOURCES` in the same file.
