# PulseDrive News (Vanilla HTML/CSS/JS)

A Tesla-inspired, dark, touch-friendly in-car news landing page built with **plain HTML, CSS, and JavaScript**.

## Why this version
This implementation removes Vite/React runtime dependency and works as a simple static page.

## Data sources (no API key required)
- The Guardian Content API using public `api-key=test` (no signup required for development)
- Hacker News Algolia API as secondary source
- Local fallback content when network/source is unavailable

## Run
Open `index.html` directly, or serve the folder with any static server.

Example:
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080`.

## Notes
- No user-supplied API keys required.
- Includes loading skeletons, error/fallback state, top stories, tabs, source switcher, and refresh control.
- Reduced-motion media query is included for parked-mode calm UX.
