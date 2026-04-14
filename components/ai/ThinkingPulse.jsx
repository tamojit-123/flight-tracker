'use client';

export function ThinkingPulse() {
  return (
    <div className="think-dot" style={{
      display: 'flex',
      gap: '4px',
      padding: '8px 0',
    }}>
      <div className="think-dot" style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#00D4FF',
      }} />
      <div className="think-dot" style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#00D4FF',
      }} />
      <div className="think-dot" style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#00D4FF',
      }} />
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
    }}>
      <ThinkingPulse />
      <span style={{
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        AI is analyzing...
      </span>
    </div>
  );
}