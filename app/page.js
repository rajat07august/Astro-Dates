'use client';

import { useState, useEffect } from 'react';
import { ECLIPSES } from '../data/eclipses';

export default function Home() {
  const [year, setYear] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect the current year on mount
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
    <div className="container">
      <header>
        <h1>Eclipse Finder</h1>
        <p className="subtitle">Search 2008 – 2060 · Powered by NASA Data</p>
      </header>

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
              {results.length} eclipse{results.length !== 1 ? 's' : ''} found for{' '}
              {year}
            </p>
            {results.map((eclipse, i) => (
              <div className="eclipse-card" key={i}>
                <div
                  className={`orb orb-${eclipse.type.toLowerCase()}`}
                />
                <div className="card-content">
                  <div className="card-date">{eclipse.date}</div>
                  <span
                    className={`badge badge-${eclipse.type.toLowerCase()}`}
                  >
                    {eclipse.type} Eclipse
                  </span>
                  <span className="badge badge-kind">{eclipse.kind}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
