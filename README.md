# PulseDrive News (Vanilla Only)

You're right — Vite isn't needed here.

This project is now intentionally **vanilla HTML/CSS/JavaScript only** for maximum compatibility in simple browsers (including in-car browsers) and zero build tooling.

## What changed
- Removed Vite/React/Tailwind/TypeScript scaffolding.
- Removed Node news aggregator server and API-key requirements.
- Kept a single static app: `index.html`, `styles.css`, `app.js`.
- Uses keyless live sources:
  - The Guardian Content API (`api-key=test`)
  - Category-specific RSS feeds (Politico/NPR/CNBC/WSJ/The Verge/Ars/BBC/Al Jazeera) via rss2json bridge
- Includes local fallback content if live sources are unavailable.

## Run
```bash
npm run check
npm run start
```
Then open: `http://localhost:8080`

Or open `index.html` directly.
