import { GeoVector, Ecliptic, SunPosition } from 'astronomy-engine';

// EclipticLongitude() in astronomy-engine is heliocentric and never shows retrograde.
// Use geocentric vector → ecliptic conversion instead so retrograde motion is visible.
function eclLon(body, date) {
  if (body === 'Sun') return SunPosition(date).elon;
  return Ecliptic(GeoVector(body, date, true)).elon;
}

const ZODIAC = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const PLANETS = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const DAY_MS  = 86_400_000;

function normLon(lon) { return ((lon % 360) + 360) % 360; }
function signOf(lon)  { return Math.floor(normLon(lon) / 30); }

function normDiff(b, a) {
  let d = normLon(b) - normLon(a);
  if (d >  180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/** Bisect to find exact ms where body's ecliptic longitude crosses targetLon. */
function bisectIngress(body, msA, msB, targetLon) {
  function offset(ms) {
    let d = normLon(eclLon(body, new Date(ms))) - targetLon;
    if (d >  180) d -= 360;
    if (d < -180) d += 360;
    return d;
  }
  const signA = Math.sign(offset(msA));
  let lo = msA, hi = msB;
  for (let i = 0; i < 52; i++) {
    const mid = (lo + hi) / 2;
    Math.sign(offset(mid)) === signA ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}

/** Bisect to find exact ms where apparent daily motion changes sign. */
function bisectStation(body, msA, msB) {
  function vel(ms) {
    return normDiff(
      eclLon(body, new Date(ms + DAY_MS)),
      eclLon(body, new Date(ms)),
    );
  }
  const signA = Math.sign(vel(msA));
  let lo = msA, hi = msB;
  for (let i = 0; i < 42; i++) {
    const mid = (lo + hi) / 2;
    Math.sign(vel(mid)) === signA ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}

/**
 * Compute planetary ingress, retrograde, and station-direct events for a year.
 * Returns an array of { date, planet, sign, event ('I'|'R'|'S/D'), note } objects
 * sorted chronologically.
 */
export function computePlanetEvents(year, includeMoon = false) {
  const events   = [];
  const startMs  = Date.UTC(year, 0, 1);
  const endMs    = Date.UTC(year + 1, 0, 1);
  const bodies   = includeMoon ? [...PLANETS, 'Moon'] : PLANETS;

  for (const body of bodies) {
    // Moon moves ~13°/day — sample every 12 h to avoid missing a crossing
    const step = body === 'Moon' ? DAY_MS / 2 : DAY_MS;

    const samples = [];
    for (let ms = startMs - 2 * DAY_MS; ms <= endMs + 2 * DAY_MS; ms += step) {
      samples.push({ ms, lon: normLon(eclLon(body, new Date(ms))) });
    }

    for (let i = 0; i < samples.length - 1; i++) {
      const a = samples[i];
      const b = samples[i + 1];
      const pSign = signOf(a.lon);
      const cSign = signOf(b.lon);

      // ── Ingress: ecliptic longitude crosses a 30° boundary ──────────────────
      if (pSign !== cSign) {
        const vel       = normDiff(b.lon, a.lon);
        const targetLon = vel >= 0 ? cSign * 30 : pSign * 30;
        const ms  = bisectIngress(body, a.ms, b.ms, targetLon);
        const t   = new Date(ms);
        if (t.getTime() >= startMs && t.getTime() < endMs) {
          const sign = ZODIAC[signOf(normLon(eclLon(body, t)))];
          events.push({ date: t.toISOString(), planet: body, sign, event: 'I', note: `${sign} — I` });
        }
      }

      // ── Stations: apparent velocity reverses (Sun and Moon never retrograde) ─
      if (body !== 'Sun' && body !== 'Moon' && i < samples.length - 2) {
        const c  = samples[i + 2];
        const v1 = normDiff(b.lon, a.lon);
        const v2 = normDiff(c.lon, b.lon);

        if (v1 > 0 && v2 < 0) {
          // Prograde → retrograde
          const ms = bisectStation(body, a.ms, c.ms);
          const t  = new Date(ms);
          if (t.getTime() >= startMs && t.getTime() < endMs) {
            const sign = ZODIAC[signOf(normLon(eclLon(body, t)))];
            events.push({ date: t.toISOString(), planet: body, sign, event: 'R', note: `${sign} — R` });
          }
        } else if (v1 < 0 && v2 > 0) {
          // Retrograde → prograde (station direct)
          const ms = bisectStation(body, a.ms, c.ms);
          const t  = new Date(ms);
          if (t.getTime() >= startMs && t.getTime() < endMs) {
            const sign = ZODIAC[signOf(normLon(eclLon(body, t)))];
            events.push({ date: t.toISOString(), planet: body, sign, event: 'S/D', note: `${sign} — S/D` });
          }
        }
      }
    }
  }

  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}
