# Celestial Eclipse Finder — Project Status

## Architecture

Migrated from a single `index.html` to a **Next.js App Router** structure:

- `app/page.js` — main tabbed UI (Solar & Lunar Eclipses tab + Moon Cycles tab)
- `app/layout.js` — root layout
- `app/globals.css` — global styles
- `data/eclipses.js` — exportable hardcoded eclipse dataset (2008–2060)

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Initial Next.js boilerplate |
| `dev`  | Active development — Moon Cycles feature |

## Moon Cycles Tab (dev branch)

- **API proxy route:** `app/api/moon/route.js` — server-side proxy for `freeastroapi.com` `/api/v1/moon/month` endpoint.
- **API key:** stored in `.env` as `API_KEY`; never exposed to the client.
- **Component:** `<MoonCycleView />` inside `app/page.js` — accepts year/month inputs, fetches from the internal route, renders daily moon phase cards with dynamic SVG visuals, phase name, and illumination %.

## Environment Variables

| Variable  | Where set         | Purpose                        |
|-----------|-------------------|-------------------------------|
| `API_KEY` | `.env` / Vercel   | freeastroapi.com authentication |

## Deployment Note

The Moon Cycles tab requires `API_KEY` to be configured in Vercel for production to work.
