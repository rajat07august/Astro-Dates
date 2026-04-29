'use client';

import { useState, useEffect } from 'react';
import { ECLIPSES } from '../data/eclipses';

export default function Home() {
  const [activeTab, setActiveTab] = useState('eclipses');

  return (
    <div className="container">
      <header>
        <h1>Celestial Dashboard</h1>
        <p className="subtitle">Explore Eclipses & Moon Cycles · Powered by NASA & FreeAstroAPI</p>
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
      </div>

      {activeTab === 'eclipses' && <EclipseView />}
      {activeTab === 'moon' && <MoonCycleView />}
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

function MoonCycleView() {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const d = new Date();
    const currentYear = d.getFullYear().toString();
    const currentMonth = (d.getMonth() + 1).toString();
    setYear(currentYear);
    setMonth(currentMonth);
    fetchMoonData(currentYear, currentMonth);
  }, []);

  async function fetchMoonData(y, m) {
    if (!y || !m) return;
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch(`/api/moon?year=${y}&month=${m}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch moon data');
      }

      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchMoonData(year, month);
  }

  return (
    <>
      <div className="search-card">
        <div className="field">
          <label htmlFor="moonYearInput">Year</label>
          <input
            type="number"
            id="moonYearInput"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="moonMonthInput">Month</label>
          <input
            type="number"
            id="moonMonthInput"
            value={month}
            min="1"
            max="12"
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <button className="btn" onClick={handleSearch} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Cycles'}
        </button>
      </div>

      <div id="moon-results">
        {error && <div className="error-msg">{error}</div>}

        {data && data.days && (
          <>
            <p className="results-header">
              Moon Phases for {data.month_name} {data.year}
            </p>
            <div className="moon-grid">
              {data.days.map((day, i) => (
                <div className="eclipse-card" key={i}>
                  {day.moon_visual && day.moon_visual.svg && (
                    <div
                      className="moon-phase-svg"
                      dangerouslySetInnerHTML={{ __html: day.moon_visual.svg }}
                    />
                  )}
                  <div className="card-content">
                    <div className="card-date">{day.calendar_date}</div>
                    <span className="badge badge-lunar">{day.phase.name}</span>
                    <span className="badge badge-kind">
                      {Math.round(day.phase.illumination * 100)}% Illum.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
