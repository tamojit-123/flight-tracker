'use client';
import { useEffect, useState } from 'react';
import { Paper, Collapse, ActionIcon } from '@mantine/core';
import { IconChevronUp, IconShare } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useFlightStore } from '@/store/flightStore';
import { StatusBadge, FlightBadge, CountryBadge } from './FlightBadge';
import { CompactAltitude } from './AltitudeGraph';
import { SpeedArc } from './SpeedArc';
import { classifyAircraft, getAircraftIcon } from '@/lib/aircraftClassifier';
import { getCountryFlag, formatHeading, timeAgo } from '@/lib/flightParser';
import styles from '@/styles/modules/HUD.module.css';

function AnimatedValue({ value, decimals = 0, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const duration = 500;
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.floor(displayValue).toLocaleString();

  return <span>{formatted}{suffix}</span>;
}

export function FlightHUD({ flight, altitudeHistory = [] }) {
  const [showGraph, setShowGraph] = useState(false);

  if (!flight) {
    return (
      <div className={`${styles.hud} ${styles.glowBorder}`}>
        <div className={styles.cornerTL} />
        <div className={styles.cornerBR} />
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '12px', letterSpacing: '0.2em' }}>
            NO FLIGHT SELECTED
          </div>
        </div>
      </div>
    );
  }

  const {
    icao24,
    callsign,
    origin_country,
    longitude,
    latitude,
    baro_altitude,
    on_ground,
    velocity,
    true_track,
    vertical_rate,
    squawk,
    last_contact,
  } = flight;

  const classification = classifyAircraft(icao24);
  const flag = getCountryFlag(origin_country);
  const headingStr = formatHeading(true_track);
  const timeAgoStr = timeAgo(last_contact);
  const vertRateClass = vertical_rate >= 0 ? styles.vertRateUp : styles.vertRateDown;
  const vertRateIcon = vertical_rate >= 0 ? '↑' : '↓';

  const handleShare = () => {
    const url = `${window.location.origin}/track/${icao24}`;
    navigator.clipboard.writeText(url).then(() => {
      notifications.show({
        title: 'Link Copied',
        message: 'Flight tracking URL copied to clipboard',
        color: 'cyan',
        icon: null,
      });
    });
  };

  return (
    <div className={`${styles.hud} ${styles.glowBorder}`}>
      <div className={styles.cornerTL} />
      <div className={styles.cornerBR} />

      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>{getAircraftIcon(classification.category)}</span>
          <span className={styles.callsign}>{callsign || '------'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusBadge airborne={!on_ground} />
          <FlightBadge icao24={icao24} type={classification.name} />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.row}>
          <span className={styles.label}>ALT</span>
          <span className={`${styles.value} ${styles.valueHighlight}`}>
            <CompactAltitude altitude={baro_altitude} />
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {baro_altitude ? `${(baro_altitude * 3.28084).toFixed(0)} ft` : ''}
          </span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>SPD</span>
          <span className={styles.value}>
            <SpeedArc speed={velocity || 0} />
          </span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>HDG</span>
          <span className={`${styles.value} ${styles.valueHighlight}`}>
            {headingStr}
          </span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>VSI</span>
          <span className={`${styles.vertRate} ${vertRateClass}`}>
            {vertical_rate != null ? `${vertRateIcon} ${Math.abs(vertical_rate).toFixed(1)} m/s` : '---'}
          </span>
        </div>
      </div>

      <div className={styles.meta}>
        <span className={styles.icao}>ICAO: {icao24?.toUpperCase()}</span>
        <span>{flag} {origin_country}</span>
      </div>

      <div className={styles.meta} style={{ borderTop: '1px solid rgba(0,212,255,0.08)' }}>
        <span>SQWK: {squawk || '0000'}</span>
        <span>Last: {timeAgoStr}</span>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setShowGraph(!showGraph)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--cyan)',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'Orbitron, sans-serif',
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 0',
          }}
        >
          {showGraph ? '▼' : '▲'} ALTITUDE GRAPH
        </button>

        <ActionIcon
          variant="subtle"
          color="cyan"
          size="sm"
          onClick={handleShare}
          title="Share flight URL"
        >
          <IconShare size={14} />
        </ActionIcon>
      </div>

      <Collapse in={showGraph}>
        <div style={{ padding: '0 16px 16px' }}>
          {altitudeHistory.length > 0 ? (
            <AltitudeHistoryMini data={altitudeHistory} />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
              Collecting altitude data...
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
}

function AltitudeHistoryMini({ data }) {
  const points = data.slice(-60).map((d, i) => ({
    time: i,
    altitude: d.altitude ?? d.alt ?? 0,
  }));

  const maxAlt = Math.max(...points.map(p => p.altitude), 1);

  const pathData = points.reduce((acc, p, i) => {
    const x = (i / (points.length - 1)) * 280 + 20;
    const y = 80 - (p.altitude / maxAlt) * 70;
    return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, '');

  return (
    <svg width="100%" height="90" viewBox="0 0 320 90">
      <defs>
        <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={pathData}
        fill="none"
        stroke="#00D4FF"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 4px #00D4FF60)' }}
      />
      <path
        d={`${pathData} L ${20 + ((points.length - 1) / (points.length - 1)) * 280} 80 L 20 80 Z`}
        fill="url(#altGrad)"
      />
    </svg>
  );
}