'use client';
import { useMemo } from 'react';
import { AreaChart } from '@mantine/charts';

export function AltitudeGraph({ data = [], height = 180 }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return Array.from({ length: 20 }, (_, i) => ({
        time: i,
        altitude: 0,
      }));
    }
    return data.map((d, i) => ({
      time: i,
      altitude: d.altitude ?? d.alt ?? 0,
    }));
  }, [data]);

  const maxAlt = useMemo(() => {
    if (!data || data.length === 0) return 12000;
    return Math.max(...data.map(d => d.altitude ?? d.alt ?? 0), 12000);
  }, [data]);

  return (
    <div style={{
      background: 'rgba(8, 12, 20, 0.8)',
      border: '1px solid rgba(0, 212, 255, 0.15)',
      borderRadius: '4px',
      padding: '16px',
    }}>
      <div style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '11px',
        letterSpacing: '0.15em',
        color: 'rgba(0, 212, 255, 0.6)',
        marginBottom: '12px',
        textTransform: 'uppercase',
      }}>
        Altitude Profile
      </div>
      <AreaChart
        h={height}
        data={chartData}
        dataKey="time"
        series={[{ name: 'altitude', color: 'cyan' }]}
        curveType="monotone"
        fillOpacity={0.3}
        gridAxis="xy"
        withDots={false}
        withXAxis={false}
        withYAxis={false}
        styles={{
          root: { background: 'transparent' },
          background: 'transparent',
        }}
        valueFormatter={(v) => `${(v / 1000).toFixed(1)}k m`}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '8px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px',
        color: 'rgba(255,255,255,0.3)',
      }}>
        <span>0</span>
        <span>{(maxAlt / 2).toFixed(0)}m</span>
        <span>{maxAlt.toFixed(0)}m</span>
      </div>
    </div>
  );
}

export function CompactAltitude({ altitude }) {
  if (altitude == null) return <span style={{ color: '#4A6080' }}>---</span>;

  const formatted = altitude >= 1000
    ? `${(altitude / 1000).toFixed(1)}k`
    : altitude.toFixed(0);

  const color = altitude > 10000 ? '#00D4FF'
    : altitude > 5000 ? '#ffffff'
    : altitude > 0 ? '#FFB800'
    : '#FF3A5C';

  return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '16px',
      fontWeight: 600,
      color,
      textShadow: `0 0 8px ${color}50`,
    }}>
      {formatted}
    </span>
  );
}