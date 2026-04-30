'use client';

import { useState, useEffect } from 'react';
import { ECLIPSES } from '../data/eclipses';

export default function Home() {
  const [activeTab, setActiveTab] = useState('eclipses');

  return (
    <div className="container">
      <header>
        <h1>Celestial Dashboard</h1>
        <p className="subtitle">Explore Eclipses, Moon Cycles &amp; Planet Events · Powered by astronomy-engine</p>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'eclipses' ? 'active' : ''}`}
          onClick={() => setActiveTab('eclipses')}
        >
          Solar & Lunar Eclipses
        </button>
        <button
          className={`tab-btn ${activeTab === 'moon' ? 'active' : ''}`}
          onClick={() => setActiveTab('moon')}
        >
          Moon Cycles
        </button>
        <button
          className={`tab-btn ${activeTab === 'planets' ? 'active' : ''}`}
          onClick={() => setActiveTab('planets')}
        >
          Planet Events
        </button>
        <button
          className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          Market Signals
        </button>
      </div>

      {activeTab === 'eclipses' && <EclipseView />}
      {activeTab === 'moon' && <MoonCycleView />}
      {activeTab === 'planets' && <PlanetEventsView />}
      {activeTab === 'market' && <MarketSignalsView />}
    </div>
  );
}

function EclipseView() {
  const [year, setYear] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentYear = new Date().getFullYear().toString();
    setYear(currentYear);
    performSearch(currentYear);
  }, []);

  function performSearch(searchYear) {
    const y = searchYear.trim();
    setError('');
    setSearched(true);

    if (!/^\d{4}$/.test(y)) {
      setError('Please enter a valid 4-digit year (e.g., 2024).');
      setResults([]);
      return;
    }

    const filtered = ECLIPSES.filter((e) => e.date.startsWith(y));
    setResults(filtered);
  }

  function handleSearch() {
    performSearch(year);
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      performSearch(year);
    }
  }

  return (
    <>
      <div className="search-card">
        <div className="field">
          <label htmlFor="yearInput">Year</label>
          <input
            type="number"
            id="yearInput"
            value={year}
            min="2008"
            max="2060"
            onChange={(e) => setYear(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="e.g. 2025"
          />
        </div>
        <button className="btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div id="results">
        {error && <div className="error-msg">{error}</div>}

        {!error && searched && results.length === 0 && (
          <div className="empty-msg">
            No eclipses found for {year}. Data available for 2008–2060.
          </div>
        )}

        {!error && results.length > 0 && (
          <>
            <p className="results-header">
              {results.length} eclipse{results.length !== 1 ? 's' : ''} found for {year}
            </p>
            {results.map((eclipse, i) => (
              <div className="eclipse-card" key={i}>
                <div className={`orb orb-${eclipse.type.toLowerCase()}`} />
                <div className="card-content">
                  <div className="card-date">{eclipse.date}</div>
                  <span className={`badge badge-${eclipse.type.toLowerCase()}`}>
                    {eclipse.type} Eclipse
                  </span>
                  <span className="badge badge-kind">{eclipse.kind}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

// Planet-sign combinations of high importance (domicile / rulership transits)
const KEY_PAIRS = new Set([
  'Jupiter-Sagittarius', 'Jupiter-Pisces',
  'Mars-Aries',          'Mars-Scorpio',
  'Mercury-Gemini',      'Mercury-Virgo',
  'Moon-Cancer',
  'Saturn-Capricorn',    'Saturn-Aquarius',
  'Sun-Leo',
  'Venus-Taurus',        'Venus-Libra',
  'Neptune-Pisces',
]);

function PlanetEventsView() {
  const [year, setYear] = useState('');
  const [includeMoon, setIncludeMoon] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const y = new Date().getFullYear().toString();
    setYear(y);
    fetchData(y, false);
  }, []);

  async function fetchData(y, moon) {
    if (!y) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res  = await fetch(`/api/planet-events?year=${y}&moon=${moon ? '1' : '0'}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Computation failed');
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const PLANET_CLASS = {
    Sun: 'planet-sun', Mercury: 'planet-mercury', Venus: 'planet-venus',
    Mars: 'planet-mars', Jupiter: 'planet-jupiter', Saturn: 'planet-saturn',
    Moon: 'planet-moon',
  };

  const EVENT_CLASS = {
    'I': 'event-ingress', 'R': 'event-retro', 'S/D': 'event-direct',
  };

  return (
    <>
      <div className="search-card">
        <div className="field">
          <label htmlFor="planetYearInput">Year</label>
          <input
            type="number"
            id="planetYearInput"
            value={year}
            min="1900"
            max="2100"
            onChange={(e) => setYear(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData(year, includeMoon)}
            placeholder="e.g. 2026"
          />
        </div>
        <div className="field-check">
          <label className="check-label">
            <input
              type="checkbox"
              checked={includeMoon}
              onChange={(e) => setIncludeMoon(e.target.checked)}
            />
            Include Moon
          </label>
        </div>
        <button className="btn" onClick={() => fetchData(year, includeMoon)} disabled={loading}>
          {loading ? 'Computing…' : 'Compute Events'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading && (
        <div className="empty-msg">Computing planetary events — this takes a moment…</div>
      )}

      {data && data.events && (
        <div className="cycle-wrap">
          <p className="results-header">
            Planet Events {data.year} &mdash; {data.count} events &middot; times in UTC
          </p>
          <div className="cycle-table">
            <div className="planet-head">
              <span>Date</span>
              <span>Planet</span>
              <span>Sign &amp; Event</span>
            </div>
            {data.events.map((e, i) => {
              const d       = new Date(e.date);
              const dd      = String(d.getUTCDate()).padStart(2, '0');
              const mm      = String(d.getUTCMonth() + 1).padStart(2, '0');
              const yyyy    = d.getUTCFullYear();
              const isKey   = KEY_PAIRS.has(`${e.planet}-${e.sign}`);
              return (
                <div className={`planet-row${isKey ? ' planet-row-key' : ''}`} key={i}>
                  <span className="cycle-date">{`${dd}-${mm}-${yyyy}`}</span>
                  <span className={PLANET_CLASS[e.planet] || 'cycle-muted'}>
                    {e.planet}
                    {isKey && <span className="key-badge">KEY</span>}
                  </span>
                  <span>
                    <span className="cycle-muted">{e.sign}</span>
                    {' — '}
                    <span className={`event-badge ${EVENT_CLASS[e.event] || ''}`}>{e.event}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function MarketSignalsView() {
  const ELEMENTS = [
    { sentiment: 'Bullish',  element: 'Fire',  direction: 'Major Upward',        signs: 'Aries, Leo, Sagittarius',    cls: 'ms-fire'  },
    { sentiment: 'Bullish',  element: 'Earth', direction: 'Trend Continuation',  signs: 'Taurus, Virgo, Capricorn',   cls: 'ms-earth' },
    { sentiment: 'Sideways', element: 'Air',   direction: 'Sideways Indicator',  signs: 'Gemini, Libra, Aquarius',    cls: 'ms-air'   },
    { sentiment: 'Bearish',  element: 'Water', direction: 'Downward',            signs: 'Cancer, Scorpio, Pisces',    cls: 'ms-water' },
  ];

  const SECTORS = [
    { planet: 'Sun',     cls: 'planet-sun',     sector: 'PSUs' },
    { planet: 'Moon',    cls: 'planet-moon',    sector: 'Pharma' },
    { planet: 'Jupiter', cls: 'planet-jupiter', sector: 'Banking' },
    { planet: 'Rahu',    cls: 'planet-rahu',    sector: 'IT' },
    { planet: 'Mercury', cls: 'planet-mercury', sector: 'Telecommunications' },
    { planet: 'Venus',   cls: 'planet-venus',   sector: 'Auto, automotive components' },
    { planet: 'Ketu',    cls: 'planet-ketu',    sector: 'Oil' },
    { planet: 'Saturn',  cls: 'planet-saturn',  sector: 'Machinery, heavy engineering' },
    { planet: 'Mars',    cls: 'planet-mars',    sector: 'Electricity, real estate' },
  ];

  return (
    <div className="ms-wrap">

      {/* Moon phase sentiment */}
      <div className="ms-section">
        <h2 className="ms-title">Moon Phase Sentiment</h2>
        <div className="ms-moon-cards">
          <div className="ms-moon-card ms-moon-pos">
            <span className="ms-moon-icon">○</span>
            <div>
              <div className="ms-moon-label">Full Moon</div>
              <div className="ms-moon-val">Positive</div>
            </div>
          </div>
          <div className="ms-moon-card ms-moon-neg">
            <span className="ms-moon-icon">●</span>
            <div>
              <div className="ms-moon-label">New Moon</div>
              <div className="ms-moon-val">Negative</div>
            </div>
          </div>
        </div>
      </div>

      {/* Zodiac element → market direction */}
      <div className="ms-section">
        <h2 className="ms-title">Zodiac Element &amp; Market Direction</h2>
        <div className="cycle-table">
          <div className="ms-elem-head">
            <span>Sentiment</span>
            <span>Element</span>
            <span>Market Direction</span>
            <span>Signs</span>
          </div>
          {ELEMENTS.map((row) => (
            <div className={`ms-elem-row ${row.cls}`} key={row.element}>
              <span className="ms-sentiment">{row.sentiment}</span>
              <span className="ms-element">{row.element}</span>
              <span className="ms-direction">{row.direction}</span>
              <span className="cycle-muted">{row.signs}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Planet → sector */}
      <div className="ms-section">
        <h2 className="ms-title">Planet &amp; Market Sector</h2>
        <div className="cycle-table">
          <div className="ms-sector-head">
            <span>Planet</span>
            <span>Sector Influenced</span>
          </div>
          {SECTORS.map((row) => (
            <div className="ms-sector-row" key={row.planet}>
              <span className={row.cls}>{row.planet}</span>
              <span className="ms-sector-val">{row.sector}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function MoonCycleView() {
  const [year, setYear] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const y = new Date().getFullYear().toString();
    setYear(y);
    fetchCycleData(y);
  }, []);

  async function fetchCycleData(y) {
    if (!y) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res  = await fetch(`/api/moon-cycle?year=${y}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Computation failed');
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const PHENOM_CLASS = {
    'Perigee':                   'phenom-perigee',
    'Apogee':                    'phenom-apogee',
    'New Moon':                  'phenom-new-moon',
    'Full Moon':                 'phenom-full-moon',
    'Equatorial Farthest North': 'phenom-eq-north',
    'Equatorial Farthest South': 'phenom-eq-south',
    'Equatorial Passage':        'phenom-eq-passage',
  };

  return (
    <>
      <div className="search-card">
        <div className="field">
          <label htmlFor="cycleYearInput">Year</label>
          <input
            type="number"
            id="cycleYearInput"
            value={year}
            min="1900"
            max="2100"
            onChange={(e) => setYear(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCycleData(year)}
            placeholder="e.g. 2026"
          />
        </div>
        <button className="btn" onClick={() => fetchCycleData(year)} disabled={loading}>
          {loading ? 'Computing…' : 'Compute Cycle'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading && (
        <div className="empty-msg">Computing lunar events — this takes a moment…</div>
      )}

      {data && data.events && (
        <div className="cycle-wrap">
          <p className="results-header">
            Double Lunar Cycle {data.year} &mdash; {data.count} events &middot; times in UTC
          </p>
          <div className="cycle-table">
            <div className="cycle-head">
              <span>Date</span>
              <span>Body</span>
              <span>Phenomenon</span>
              <span>Ref.</span>
              <span>Note</span>
            </div>
            {data.events.map((e, i) => {
              const d    = new Date(e.date);
              const dd   = String(d.getUTCDate()).padStart(2, '0');
              const mm   = String(d.getUTCMonth() + 1).padStart(2, '0');
              const yyyy = d.getUTCFullYear();
              return (
                <div className="cycle-row" key={i}>
                  <span className="cycle-date">{`${dd}-${mm}-${yyyy}`}</span>
                  <span className="cycle-muted">{e.body}</span>
                  <span className={PHENOM_CLASS[e.phenomenon] || ''}>{e.phenomenon}</span>
                  <span className="cycle-muted">{e.ref}</span>
                  <span className="cycle-note">{e.note}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
