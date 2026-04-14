'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, ScrollArea, Text, Group } from '@mantine/core';
import { motion, AnimatePresence } from 'motion/react';
import { IconSearch, IconPlane } from '@tabler/icons-react';
import { debounce } from '@/lib/utils';
import { getCountryFlag, formatAltitude } from '@/lib/flightParser';
import { classifyAircraft, getAircraftIcon } from '@/lib/aircraftClassifier';
import styles from '@/styles/modules/HeroSearch.module.css';

function FlightSearchItem({ flight, onSelect }) {
  const classification = classifyAircraft(flight.icao24);
  const flag = getCountryFlag(flight.origin_country);
  const icon = getAircraftIcon(classification.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className={styles.flightItem}
      onClick={() => onSelect(flight)}
    >
      <div className={styles.flightIcon}>
        <IconPlane size={20} style={{ transform: `rotate(${flight.true_track || 0}deg)` }} />
      </div>
      <div className={styles.flightInfo}>
        <div className={styles.callsign}>{flight.callsign || '------'}</div>
        <div className={styles.country}>
          {flag} {flight.origin_country} · {icon} {classification.name}
        </div>
      </div>
      <div className={styles.altitudeBadge}>
        {formatAltitude(flight.baro_altitude)}m
      </div>
    </motion.div>
  );
}

export function SearchResults({ results = [], isLoading, onSelect }) {
  if (isLoading) {
    return (
      <div className={styles.dropdown}>
        <div className={styles.spinner}>
          <svg width="24" height="24" viewBox="0 0 24 24" className="radar-spin">
            <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="2" />
            <line x1="12" y1="12" x2="12" y2="2" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className={styles.dropdown}>
        <div className={styles.empty}>
          No flights found. Try a different callsign or ICAO code.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dropdown}>
      <AnimatePresence>
        {results.slice(0, 10).map((flight, idx) => (
          <FlightSearchItem
            key={flight.icao24 || idx}
            flight={flight}
            onSelect={onSelect}
          />
        ))}
      </AnimatePresence>
      {results.length > 10 && (
        <div style={{
          padding: '12px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px',
          borderTop: '1px solid rgba(0,212,255,0.08)',
        }}>
          + {results.length - 10} more results
        </div>
      )}
    </div>
  );
}

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/flight?callsign=${encodeURIComponent(searchQuery.toUpperCase())}`);
      if (res.ok) {
        const data = await res.json();
        const flights = data.states || [];
        setResults(flights);
      }
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch]);

  const handleSelect = useCallback((flight) => {
    setShowDropdown(false);
    setQuery('');
    router.push(`/track/${flight.icao24}`);
  }, [router]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
  };

  return (
    <div className={styles.container}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Search by callsign (e.g., UAL123) or ICAO24..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          autoComplete="off"
          spellCheck="false"
        />
        <div className={styles.icon}>
          {isLoading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" className="radar-spin">
              <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="2" />
              <line x1="12" y1="12" x2="12" y2="2" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <IconSearch size={20} />
          )}
        </div>
      </div>

      {showDropdown && query.length >= 2 && (
        <SearchResults
          results={results}
          isLoading={isLoading}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}