import {
  SearchLunarApsis,
  NextLunarApsis,
  SearchMoonPhase,
  Equator,
  Observer,
} from 'astronomy-engine';

// Mean Earth–Moon distance used for normalised distance column
const MEAN_DIST_KM = 384_400;

// Geocentric observer (centre of Earth) for of-date declination
const GEO = new Observer(0, 0, 0);

function decAt(date) {
  return Equator('Moon', date, GEO, true, true).dec;
}

/** Bisect to find the millisecond where Moon's declination crosses zero. */
function bisectCrossing(msA, msB) {
  const signA = Math.sign(decAt(new Date(msA)));
  let lo = msA, hi = msB;
  for (let i = 0; i < 52; i++) {
    const mid = (lo + hi) / 2;
    Math.sign(decAt(new Date(mid))) === signA ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}

/** Ternary search for maximum declination in [lo, hi] (ms). */
function ternaryMax(lo, hi) {
  for (let i = 0; i < 52; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    decAt(new Date(m1)) < decAt(new Date(m2)) ? (lo = m1) : (hi = m2);
  }
  return (lo + hi) / 2;
}

/** Ternary search for minimum declination in [lo, hi] (ms). */
function ternaryMin(lo, hi) {
  for (let i = 0; i < 52; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    decAt(new Date(m1)) > decAt(new Date(m2)) ? (lo = m1) : (hi = m2);
  }
  return (lo + hi) / 2;
}

/**
 * Compute all Double Lunar Cycle events for a given year.
 * Returns an array of { date (ISO), body, phenomenon, ref, note } objects
 * sorted chronologically.
 */
export function computeMoonCycle(year) {
  const events = [];
  const startMs = Date.UTC(year, 0, 1);
  const endMs   = Date.UTC(year + 1, 0, 1);
  const DAY_MS  = 86_400_000;

  // ── Perigee & Apogee ──────────────────────────────────────────────────────
  let apsis = SearchLunarApsis(new Date(startMs));
  while (apsis.time.date.getTime() < endMs) {
    if (apsis.time.date.getTime() >= startMs) {
      events.push({
        date:       apsis.time.date.toISOString(),
        body:       'Moon',
        phenomenon: apsis.kind === 0 ? 'Perigee' : 'Apogee',
        ref:        'Earth',
        note:       `distance = ${(apsis.dist_km / MEAN_DIST_KM).toFixed(3)}`,
      });
    }
    apsis = NextLunarApsis(apsis);
  }

  // ── New Moon (Δλ = 0°) ────────────────────────────────────────────────────
  let nm = SearchMoonPhase(0, new Date(startMs), 40);
  while (nm && nm.date.getTime() < endMs) {
    if (nm.date.getTime() >= startMs) {
      events.push({
        date: nm.date.toISOString(), body: 'Moon',
        phenomenon: 'New Moon', ref: 'Sun', note: 'Δλ = 0°',
      });
    }
    nm = SearchMoonPhase(0, nm.AddDays(28), 40);
  }

  // ── Full Moon (Δλ = 180°) ─────────────────────────────────────────────────
  let fm = SearchMoonPhase(180, new Date(startMs), 40);
  while (fm && fm.date.getTime() < endMs) {
    if (fm.date.getTime() >= startMs) {
      events.push({
        date: fm.date.toISOString(), body: 'Moon',
        phenomenon: 'Full Moon', ref: 'Sun', note: 'Δλ = 180°',
      });
    }
    fm = SearchMoonPhase(180, fm.AddDays(28), 40);
  }

  // ── Equatorial events: sample daily, find crossings & extrema ────────────
  // Sample one day before/after the year so events near the boundary are caught
  const samples = [];
  for (let ms = startMs - DAY_MS; ms <= endMs + DAY_MS; ms += DAY_MS) {
    samples.push({ ms, dec: decAt(new Date(ms)) });
  }

  for (let i = 1; i < samples.length - 1; i++) {
    const p = samples[i - 1], c = samples[i], n = samples[i + 1];

    // Equatorial Passage — declination crosses zero
    if (Math.sign(p.dec) * Math.sign(c.dec) < 0) {
      const ms = bisectCrossing(p.ms, c.ms);
      const t  = new Date(ms);
      if (t.getTime() >= startMs && t.getTime() < endMs) {
        events.push({
          date: t.toISOString(), body: 'Moon',
          phenomenon: 'Equatorial Passage', ref: 'Earth', note: 'δ = 0.0°',
        });
      }
    }

    // Equatorial Farthest North — local maximum
    if (c.dec > p.dec && c.dec > n.dec) {
      const ms  = ternaryMax(p.ms, n.ms);
      const t   = new Date(ms);
      const dec = decAt(t);
      if (t.getTime() >= startMs && t.getTime() < endMs) {
        events.push({
          date: t.toISOString(), body: 'Moon',
          phenomenon: 'Equatorial Farthest North', ref: 'Earth',
          note: `δ = ${dec.toFixed(1)}°`,
        });
      }
    }

    // Equatorial Farthest South — local minimum
    if (c.dec < p.dec && c.dec < n.dec) {
      const ms  = ternaryMin(p.ms, n.ms);
      const t   = new Date(ms);
      const dec = decAt(t);
      if (t.getTime() >= startMs && t.getTime() < endMs) {
        events.push({
          date: t.toISOString(), body: 'Moon',
          phenomenon: 'Equatorial Farthest South', ref: 'Earth',
          note: `δ = ${dec.toFixed(1)}°`,
        });
      }
    }
  }

  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}
