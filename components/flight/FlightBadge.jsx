'use client';
import { Badge } from '@mantine/core';
import { classifyAircraft, getAircraftIcon } from '@/lib/aircraftClassifier';

export function FlightBadge({ icao24, callsign, type, showIcon = true }) {
  const classification = classifyAircraft(icao24);
  const icon = getAircraftIcon(classification.category);
  const label = type || classification.type;

  return (
    <Badge
      variant="outline"
      color="cyan"
      size="sm"
      styles={{
        root: {
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          borderColor: 'rgba(0, 212, 255, 0.3)',
        },
      }}
      leftSection={showIcon ? icon : null}
    >
      {label}
    </Badge>
  );
}

export function CallsignBadge({ callsign }) {
  if (!callsign) return null;

  return (
    <Badge
      variant="filled"
      color="cyan"
      size="md"
      styles={{
        root: {
          fontFamily: 'Orbitron, sans-serif',
          letterSpacing: '0.12em',
          fontWeight: 700,
          background: 'rgba(0, 212, 255, 0.15)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
        },
      }}
    >
      {callsign.trim()}
    </Badge>
  );
}

export function CountryBadge({ country, flag }) {
  return (
    <Badge
      variant="outline"
      color="gray"
      size="sm"
      styles={{
        root: {
          fontFamily: 'Space Grotesk, sans-serif',
          letterSpacing: '0.05em',
        },
      }}
    >
      {flag} {country}
    </Badge>
  );
}

export function StatusBadge({ airborne }) {
  return (
    <span
      className={airborne ? 'statusAirborne' : 'statusGround'}
      style={{
        padding: '2px 8px',
        borderRadius: '3px',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        background: airborne ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 58, 92, 0.15)',
        color: airborne ? '#00D4FF' : '#FF3A5C',
        border: airborne ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid rgba(255, 58, 92, 0.3)',
      }}
    >
      {airborne ? 'Airborne' : 'Grounded'}
    </span>
  );
}