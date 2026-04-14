'use client';
import { useEffect, useState, useRef } from 'react';
import styles from '@/styles/modules/StatsBar.module.css';

function AnimatedNumber({ value, decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.floor(displayValue).toLocaleString();

  return <span>{formatted}</span>;
}

function StatCard({ label, value, unit, delta, icon: Icon }) {
  const isUp = delta > 0;
  const isDown = delta < 0;

  return (
    <div className={styles.card}>
      <div className={styles.label}>
        {Icon && <Icon size={12} style={{ marginRight: 4, opacity: 0.6 }} />}
        {label}
      </div>
      <div className={styles.valueRow}>
        <span className={styles.value}>
          <AnimatedNumber value={value} />
        </span>
        {delta !== undefined && delta !== null && (
          <span className={`${styles.delta} ${isUp ? styles.deltaUp : isDown ? styles.deltaDown : ''}`}>
            {isUp ? '+' : ''}{delta}
          </span>
        )}
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
    </div>
  );
}

export function StatsBar({ count = 0, countries = 0, avgAlt = 0, maxSpeed = 0 }) {
  return (
    <div className={styles.container}>
      <StatCard label="Flights Active" value={count} icon={null} />
      <StatCard label="Countries" value={countries} icon={null} />
      <StatCard label="Avg Altitude" value={avgAlt} unit="m" icon={null} />
      <StatCard label="Max Speed" value={maxSpeed} unit="m/s" icon={null} />
    </div>
  );
}