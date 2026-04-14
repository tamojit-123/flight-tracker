'use client';
import { useUIStore } from '@/store/uiStore';

export function ScanlineOverlay() {
  const { scanlines } = useUIStore();

  if (!scanlines) return null;

  return (
    <>
      <div className="scanlines" />
      <style>{`
        .scanlines::after {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          background: repeating-linear-gradient(
            transparent 0px,
            transparent 3px,
            rgba(0,0,0,0.12) 4px
          );
        }
      `}</style>
    </>
  );
}