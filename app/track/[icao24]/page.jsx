'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Paper, Collapse, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { motion } from 'motion/react';
import dynamic from 'next/dynamic';
import { IconChevronUp, IconShare } from '@tabler/icons-react';
import { useFlightStore } from '@/store/flightStore';
import { FlightHUD } from '@/components/flight/FlightHUD';
import { AltitudeGraph, CompactAltitude } from '@/components/flight/AltitudeGraph';
import { SpeedArc } from '@/components/flight/SpeedArc';
import { classifyAircraft, getAircraftIcon } from '@/lib/aircraftClassifier';
import { getCountryFlag, formatHeading, timeAgo } from '@/lib/flightParser';
import { RadarSpinner } from '@/components/ui/RadarSpinner';
import styles from '@/styles/modules/HUD.module.css';

const FlightGlobe = dynamic(
  () => import('@/components/map/FlightGlobe').then(m => m.FlightGlobe),
  { ssr: false, loading: () => <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)' }}><RadarSpinner size={64} /></div> }
);

const ScanlineOverlay = dynamic(
  () => import('@/components/ui/ScanlineOverlay').then(m => m.ScanlineOverlay),
  { ssr: false }
);

export default function TrackPage() {
  const params = useParams();
  const icao24 = params?.icao24;

  const [flight, setFlight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGraph, setShowGraph] = useState(false);
  const [error, setError] = useState(null);

  const { altitudeHistory, pushAltitude, clearHistory } = useFlightStore();

  const fetchFlight = useCallback(async () => {
    if (!icao24) return;

    try {
      const res = await fetch(`/api/flight?icao24=${icao24}`);
      if (res.ok) {
        const data = await res.json();
        const states = data.states || [];
        if (states.length > 0) {
          const s = states[0];
          const flightData = {
            icao24: s[0],
            callsign: s[1]?.trim() || null,
            origin_country: s[2],
            time_position: s[3],
            last_contact: s[4],
            longitude: s[5],
            latitude: s[6],
            baro_altitude: s[7],
            on_ground: s[8],
            velocity: s[9],
            true_track: s[10],
            vertical_rate: s[11],
            geo_altitude: s[13],
            squawk: s[14],
          };
          setFlight(flightData);
          pushAltitude({ time: Date.now(), altitude: flightData.baro_altitude || 0 });
        } else {
          setError('Flight not found');
        }
      } else {
        setError('Failed to fetch flight data');
      }
    } catch (err) {
      console.error('Flight fetch error:', err);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }, [icao24, pushAltitude]);

  useEffect(() => {
    if (icao24) {
      clearHistory();
      setIsLoading(true);
      setError(null);
      fetchFlight();
    }
  }, [icao24, fetchFlight, clearHistory]);

  useEffect(() => {
    if (flight) {
      const interval = setInterval(fetchFlight, 10000);
      return () => clearInterval(interval);
    }
  }, [flight, fetchFlight]);

  const handleShare = () => {
    if (!icao24) return;
    const url = `${window.location.origin}/track/${icao24}`;
    navigator.clipboard.writeText(url).then(() => {
      notifications.show({
        title: 'Link Copied',
        message: 'Flight tracking URL copied to clipboard',
        color: 'cyan',
      });
    });
  };

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-void)',
        position: 'relative',
      }}>
        <div className="hud-grid" />
        <div className="scanlines" />
        <RadarSpinner size={64} />
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '12px',
          letterSpacing: '0.2em',
          color: 'var(--cyan)',
          marginTop: '24px',
        }}>
          ACQUIRING FLIGHT {icao24?.toUpperCase()}
        </div>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-void)',
      }}>
        <div className="hud-grid" />
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '14px',
          letterSpacing: '0.15em',
          color: 'var(--red)',
          marginBottom: '16px',
        }}>
          {error || 'FLIGHT NOT FOUND'}
        </div>
        <a
          href="/"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '12px',
            letterSpacing: '0.1em',
            color: 'var(--cyan)',
            textDecoration: 'none',
            padding: '12px 24px',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '4px',
          }}
        >
          RETURN TO HOME
        </a>
      </div>
    );
  }

  const classification = classifyAircraft(flight.icao24);
  const flag = getCountryFlag(flight.origin_country);
  const headingStr = formatHeading(flight.true_track);
  const timeAgoStr = timeAgo(flight.last_contact);

  return (
    <>
      <div className="hud-grid" />
      <ScanlineOverlay />

      <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
        <FlightGlobe
          flights={flight ? [flight] : []}
          selectedFlight={flight}
          className={styles.map}
        />

        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          zIndex: 15,
        }}>
          <FlightHUD flight={flight} altitudeHistory={altitudeHistory} />
        </div>

        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
        }}>
          <ActionIcon
            variant="filled"
            color="cyan"
            size="lg"
            onClick={handleShare}
            title="Share flight URL"
            styles={{
              root: {
                background: 'rgba(8, 12, 20, 0.8)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                backdropFilter: 'blur(12px)',
              },
            }}
          >
            <IconShare size={18} />
          </ActionIcon>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          width: '340px',
          zIndex: 15,
        }}>
          <button
            onClick={() => setShowGraph(!showGraph)}
            style={{
              width: '100%',
              background: 'rgba(8, 12, 20, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '4px',
              padding: '12px 16px',
              color: 'var(--cyan)',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '11px',
              letterSpacing: '0.12em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: showGraph ? '0' : '12px',
            }}
          >
            <span>ALTITUDE PROFILE</span>
            <motion.div
              animate={{ rotate: showGraph ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.div>
          </button>

          <Collapse in={showGraph}>
            <div style={{
              background: 'rgba(8, 12, 20, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '4px',
              padding: '16px',
            }}>
              <AltitudeGraph data={altitudeHistory} height={160} />
            </div>
          </Collapse>
        </div>

        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{
            background: 'rgba(8, 12, 20, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 212, 255, 0.15)',
            borderRadius: '4px',
            padding: '8px 12px',
          }}>
            <span style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
            }}>
              TRACKING
            </span>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              color: 'var(--cyan)',
              marginTop: '2px',
            }}>
              {icao24?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}