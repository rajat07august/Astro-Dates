# Celestial Eclipse Finder — Project Status

## Branching Rules

**All development work must be done on the `dev` branch.**
Only merge into `main` when a feature is complete and tested.
Never commit directly to `main`.

```
dev   ← all new work goes here
 |
 └──► main  (merge only when ready to ship)
```

## Architecture

Migrated from a single `index.html` to a **Next.js App Router** structure:

- `app/page.js` — main tabbed UI (4 tabs: Eclipses, Moon Cycles, Planet Events, Market Signals)
- `app/layout.js` — root layout
- `app/globals.css` — global styles
- `data/eclipses.js` — exportable hardcoded eclipse dataset (2008–2060)
- `lib/moonCycle.js` — Double Lunar Cycle computation (astronomy-engine)
- `lib/planetEvents.js` — Planetary ingress/retrograde/direct computation (astronomy-engine)

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code only |
| `dev`  | Active development — all changes land here first |

## Tab 1 — Solar & Lunar Eclipses

- Data source: hardcoded dataset in `data/eclipses.js` (2008–2060)
- Year input → filters and displays eclipse cards with type (Solar/Lunar) and kind

## Tab 2 — Moon Cycles

- **API route:** `app/api/moon-cycle/route.js`
- **Computation:** `lib/moonCycle.js` using `astronomy-engine`
- **Events computed:** Perigee, Apogee, New Moon, Full Moon, Equatorial Passage, Equatorial Farthest North/South
- **Input:** year (1900–2100); returns ~106 events per year
- No external API or API key required

## Tab 3 — Planet Events

- **API route:** `app/api/planet-events/route.js`
- **Computation:** `lib/planetEvents.js` using `astronomy-engine`
- **Bodies:** Sun, Mercury, Venus, Mars, Jupiter, Saturn (Moon optional via checkbox)
- **Events computed:**
  - `I` — Ingress (planet enters a new zodiac sign)
  - `R` — Station Retrograde (prograde → retrograde)
  - `S/D` — Station Direct (retrograde → prograde)
- **Key implementation note:** Use `Ecliptic(GeoVector(body, date, true)).elon` for geocentric ecliptic longitude. `EclipticLongitude()` from astronomy-engine is heliocentric and will never show retrograde motion.
- **Input:** year (1900–2100) + optional Moon toggle; returns ~59 events/year (without Moon)
- **KEY highlight:** rows where a planet is in its home/domicile sign are highlighted gold with a `KEY` badge. Pairs defined in `KEY_PAIRS` set in `app/page.js`:
  - Jupiter → Sagittarius, Pisces
  - Mars → Aries, Scorpio
  - Mercury → Gemini, Virgo
  - Moon → Cancer
  - Saturn → Capricorn, Aquarius
  - Sun → Leo
  - Venus → Taurus, Libra
  - Neptune → Pisces
- No external API or API key required

## Tab 4 — Market Signals

- **Component:** `<MarketSignalsView />` in `app/page.js` — fully static, no API
- **Section 1 — Moon Phase Sentiment:** Full Moon = Positive, New Moon = Negative
- **Section 2 — Zodiac Element & Market Direction:**
  - Fire (Aries, Leo, Sagittarius) → Bullish, Major Upward
  - Earth (Taurus, Virgo, Capricorn) → Bullish, Trend Continuation
  - Air (Gemini, Libra, Aquarius) → Sideways, Sideways Indicator
  - Water (Cancer, Scorpio, Pisces) → Bearish, Downward
- **Section 3 — Planet & Market Sector:**
  - Sun → PSUs, Moon → Pharma, Jupiter → Banking, Rahu → IT
  - Mercury → Telecommunications, Venus → Auto/automotive
  - Ketu → Oil, Saturn → Machinery/heavy engineering, Mars → Electricity/real estate

## next.config.js

`serverExternalPackages: ['astronomy-engine']` is required — astronomy-engine uses native ESM that Webpack cannot bundle correctly inside API routes.

## Environment Variables

No environment variables are currently required. All computation is done locally via `astronomy-engine`.

| Variable  | Where set         | Purpose                         |
|-----------|-------------------|---------------------------------|
| `API_KEY` | `.env` / Vercel   | freeastroapi.com (not in use)   |
