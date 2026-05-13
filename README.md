# PulseDrive News Dashboard

Tesla-inspired dark news landing page optimized for in-car browser glanceability.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill API keys.
3. Run API proxy: `npm run server`
4. Run frontend: `npm run dev`
5. Or run both: `npm run dev:full`

## Architecture
- React + TypeScript + Vite + Tailwind frontend.
- Express proxy at `/api/news/:category` to protect API keys.
- Providers: NewsAPI, GNews, NYT Top Stories.
- Normalized `Article` model and dedupe+recency ranking.
- Cache TTL via `CACHE_TTL_MS` to reduce quota usage.
- Retry + timeout logic to handle transient failures/rate limits.
- Mock fallback in client and optional empty fallback in server for missing secrets.

## Endpoints
- `/api/news/world-politics`
- `/api/news/us-politics`
- `/api/news/business`
- `/api/news/technology`

## Notes
- Parked-mode assumptions: no autoplay, restrained transitions, reduced-motion support.
- Uses large touch targets and readable type for ~1280px+ landscape layouts.
