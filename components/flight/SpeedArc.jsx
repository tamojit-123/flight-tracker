'use client';
import { useSpring } from 'motion/react';
import { motion } from 'motion/react';

export function SpeedArc({ speed = 0, maxSpeed = 350 }) {
  const safeSpeed = speed ?? 0;
  const percentage = Math.min((safeSpeed / maxSpeed) * 100, 100);

  const { dashOffset } = useSpring({
    from: { dashOffset: 283 },
    to: { dashOffset: 283 - (283 * percentage / 100) },
    config: { mass: 1, tension: 120, friction: 40 },
  });

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (percentage / 100) * circumference;

  const getSpeedColor = (spd) => {
    if (spd > 300) return '#00D4FF';
    if (spd > 200) return '#00FF88';
    if (spd > 100) return '#FFB800';
    return '#FF3A5C';
  };

  const color = getSpeedColor(safeSpeed);

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="rgba(0, 212, 255, 0.1)"
        strokeWidth="8"
      />

      <motion.circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '60px 60px',
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />

      <text
        x="60"
        y="56"
        textAnchor="middle"
        fill={color}
        fontFamily="JetBrains Mono, monospace"
        fontSize="20"
        fontWeight="700"
      >
        {safeSpeed.toFixed(0)}
      </text>
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fill="rgba(255,255,255,0.5)"
        fontFamily="JetBrains Mono, monospace"
        fontSize="9"
      >
        M/S
      </text>

      <text
        x="60"
        y="90"
        textAnchor="middle"
        fill="rgba(255,255,255,0.4)"
        fontFamily="Space Grotesk, sans-serif"
        fontSize="10"
      >
        {(safeSpeed * 1.94384).toFixed(0)} kts
      </text>
    </svg>
  );
}

export function MiniSpeedGauge({ speed = 0 }) {
  const kts = speed * 1.94384;
  const percentage = Math.min((speed / 350) * 100, 100);

  const getColor = (spd) => {
    if (spd > 300) return '#00D4FF';
    if (spd > 200) return '#00FF88';
    if (spd > 100) return '#FFB800';
    return '#FF3A5C';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '24px',
        fontWeight: 700,
        color: getColor(speed),
        textShadow: `0 0 10px ${getColor(speed)}40`,
      }}>
        {speed.toFixed(0)}
      </span>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
        m/s
      </span>
      <span style={{
        fontSize: '12px',
        color: 'rgba(255,255,255,0.3)',
        marginLeft: '4px',
      }}>
        ({kts.toFixed(0)} kts)
      </span>
    </div>
  );
}