'use client';

export function RadarSpinner({ size = 48 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{ display: 'block' }}
    >
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="rgba(0, 212, 255, 0.15)"
        strokeWidth="1"
      />
      <circle
        cx="24"
        cy="24"
        r="14"
        fill="none"
        stroke="rgba(0, 212, 255, 0.1)"
        strokeWidth="1"
      />
      <circle
        cx="24"
        cy="24"
        r="8"
        fill="none"
        stroke="rgba(0, 212, 255, 0.08)"
        strokeWidth="1"
      />
      <line
        x1="24"
        y1="24"
        x2="24"
        y2="4"
        stroke="url(#radarGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        className="radar-spin"
        style={{ transformOrigin: '24px 24px' }}
      />
      <circle cx="24" cy="24" r="3" fill="#00D4FF" opacity="0.8" />
      <defs>
        <linearGradient id="radarGradient" x1="24" y1="24" x2="24" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}