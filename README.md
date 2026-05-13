# PulseDrive News (Vanilla Only)

Personalized static in-car news dashboard.

## Highlights
- Vanilla HTML/CSS/JS (no build tooling)
- Personalized greeting: **Hello, Domingos!**
- Refresh button (source dropdown removed)
- Background hero uses `Model3_77.jpg` with the top third emphasized in header area
- Keyless multi-source news aggregation with strict category filtering

## Keyless sources used
- The Guardian Content API (`api-key=test`)
- RSS feeds via rss2json bridge:
  - World: BBC World, Al Jazeera, DW, NYT World, Guardian World
  - U.S. Politics: Politico, NPR Politics, NYT U.S., Guardian U.S., CBS Politics
  - Business: CNBC, WSJ Markets, NYT Business, FT U.S., Guardian Business
  - Technology: The Verge, Ars Technica, NYT Technology, TechCrunch, Wired

## Run
```bash
npm run check
npm run start
```
Then open `http://localhost:8080`.
