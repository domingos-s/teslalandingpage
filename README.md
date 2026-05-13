# PulseDrive News (Vanilla HTML/CSS/JS)

A Tesla-inspired, dark, touch-friendly in-car news landing page built with **plain HTML, CSS, and JavaScript**.

## Why this version
This implementation removes Vite/React runtime dependency and works as a simple static page.

## Data sources (no API key required)
- Hacker News Algolia API query feed for all categories (world politics, U.S. politics, business, technology)
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
