# PulseDrive News (Vanilla Only)

Personalized static in-car news dashboard.

## Highlights
- Vanilla HTML/CSS/JS (no build tooling)
- Personalized greeting: **Hello, Domingos!**
- Refresh button (source dropdown removed)
- Background hero uses `Model3_77.jpg` with the top third emphasized in header area
- Keyless multi-source aggregation with strict category filtering
- Categories: World Politics, U.S. Politics, Business, Technology, Entertainment, Sports, Science, Health, Podcasts

## Keyless sources used
- The Guardian Content API (`api-key=test`)
- RSS feeds via rss2json bridge (multiple per category)
- Podcasts tab:
  - Attempts to parse Spotify Top US Podcasts chart page
  - Matches each show to iTunes podcast feed (keyless)
  - Pulls latest episode from that feed
  - Adds Spotify deep link (`spotify:search:<show-name>`) for in-car app handoff where supported

## Run
```bash
npm run check
npm run start
```
Then open `http://localhost:8080`.
