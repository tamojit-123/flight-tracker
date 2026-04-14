'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FlightLayer } from './FlightLayer';
import { FlightPathLayer } from './FlightPathLayer';
import { RouteArc } from './RouteArc';
import styles from '@/styles/modules/Map.module.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export function FlightGlobe({
  flights = [],
  selectedFlight = null,
  onFlightClick,
  showArc = false,
  arcStart = null,
  arcEnd = null,
  positionHistory = [],
  className = '',
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        const response = await fetch(MAP_STYLE);
        if (!response.ok) {
          throw new Error('Failed to load map style');
        }

        if (!mounted) return;

        const mapInstance = new maplibregl.Map({
          container: mapContainer.current,
          style: MAP_STYLE,
          center: [0, 20],
          zoom: 2,
          minZoom: 1,
          maxZoom: 18,
          attributionControl: true,
          trackResize: true,
        });

        mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

        mapInstance.on('load', () => {
          if (!mounted) return;
          map.current = mapInstance;
          setMapLoaded(true);
        });

        mapInstance.on('error', (e) => {
          if (!mounted) return;
          // Only set error for truly fatal issues
          if (e.error && e.error.status === 400) {
            setMapError('Invalid map style');
          }
        });

      } catch (err) {
        if (!mounted) return;
        console.error('Map init failed:', err);
        setMapError(err.message || 'Failed to initialize map');
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          // ignore
        }
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && selectedFlight && map.current) {
      try {
        map.current.flyTo({
          center: [selectedFlight.longitude, selectedFlight.latitude],
          zoom: 8,
          duration: 2000,
          essential: true,
        });
      } catch (e) {
        console.warn('FlyTo error:', e);
      }
    }
  }, [mapLoaded, selectedFlight]);

  return (
    <div className={`${styles.container} ${className}`}>
      <div ref={mapContainer} className={styles.map} />

      {mapError && (
        <div className={styles.loadingOverlay}>
          <div style={{
            color: '#FFB800',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textAlign: 'center',
            padding: '20px',
          }}>
            MAP ERROR
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '8px',
              fontWeight: 400,
            }}>
              {mapError}
            </div>
          </div>
        </div>
      )}

      {!mapLoaded && !mapError && (
        <div className={styles.loadingOverlay}>
          <div className="radar-spin">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
              <circle cx="32" cy="32" r="20" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1" />
              <circle cx="32" cy="32" r="12" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="1" />
              <line
                x1="32"
                y1="32"
                x2="32"
                y2="4"
                stroke="url(#rg)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="rg" x1="32" y1="32" x2="32" y2="4" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity="0" />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className={styles.loadingText}>INITIALIZING GLOBE</div>
        </div>
      )}

      {mapLoaded && map.current && (
        <FlightLayer
          map={map.current}
          flights={flights}
          onFlightClick={onFlightClick}
        />
      )}

      {mapLoaded && map.current && positionHistory.length > 0 && (
        <FlightPathLayer
          map={map.current}
          positionHistory={positionHistory}
        />
      )}

      {showArc && arcStart && arcEnd && mapLoaded && map.current && (
        <RouteArc
          map={map.current}
          start={arcStart}
          end={arcEnd}
          color="#00D4FF"
          opacity={0.5}
        />
      )}
    </div>
  );
}