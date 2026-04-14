'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Drawer, Slider, Switch, Select, Button, Group, Paper, Text, Badge, Stack, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { motion, AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import { IconFilter, IconX, IconExternalLink } from '@tabler/icons-react';
import { useUIStore } from '@/store/uiStore';
import { FlightHUD } from '@/components/flight/FlightHUD';
import { StatusBadge, FlightBadge, CountryBadge } from '@/components/flight/FlightBadge';
import { RadarSpinner } from '@/components/ui/RadarSpinner';
import { parseOpenSkyResponse } from '@/lib/flightParser';
import { classifyAircraft, getAircraftIcon } from '@/lib/aircraftClassifier';
import { getCountryFlag, formatAltitude, formatSpeed, formatHeading } from '@/lib/flightParser';
import styles from '@/styles/modules/Map.module.css';

const FlightGlobe = dynamic(
  () => import('@/components/map/FlightGlobe').then(m => m.FlightGlobe),
  { ssr: false, loading: () => <div className={styles.loadingOverlay}><RadarSpinner size={48} /><div className={styles.loadingText}>LOADING MAP</div></div> }
);

const ScanlineOverlay = dynamic(
  () => import('@/components/ui/ScanlineOverlay').then(m => m.ScanlineOverlay),
  { ssr: false }
);

function FlightDetailPanel({ flight, onClose }) {
  if (!flight) return null;

  const classification = classifyAircraft(flight.icao24);
  const flag = getCountryFlag(flight.origin_country);
  const icon = getAircraftIcon(classification.category);

  return (
    <Paper
      style={{
        background: 'rgba(8, 12, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>{icon}</span>
            <span style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--cyan)',
            }}>
              {flight.callsign || '------'}
            </span>
          </div>
          <Group gap="xs">
            <StatusBadge airborne={!flight.on_ground} />
            <FlightBadge icao24={flight.icao24} type={classification.name} />
          </Group>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <IconX size={18} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <Text size="xs" c="dimmed" style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            ICAO24
          </Text>
          <Text style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>
            {flight.icao24?.toUpperCase()}
          </Text>
        </div>
        <div>
          <Text size="xs" c="dimmed" style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Country
          </Text>
          <Text style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {flag} {flight.origin_country}
          </Text>
        </div>
        <div>
          <Text size="xs" c="dimmed" style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Altitude
          </Text>
          <Text style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--cyan)' }}>
            {formatAltitude(flight.baro_altitude)}m
            {flight.baro_altitude && <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>({(flight.baro_altitude * 3.28084).toFixed(0)} ft)</span>}
          </Text>
        </div>
        <div>
          <Text size="xs" c="dimmed" style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Speed
          </Text>
          <Text style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {formatSpeed(flight.velocity)}
          </Text>
        </div>
        <div>
          <Text size="xs" c="dimmed" style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Heading
          </Text>
          <Text style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {formatHeading(flight.true_track)}
          </Text>
        </div>
        <div>
          <Text size="xs" c="dimmed" style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Squawk
          </Text>
          <Text style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {flight.squawk || '0000'}
          </Text>
        </div>
      </div>

      <Button
        component="a"
        href={`/track/${flight.icao24}`}
        variant="outline"
        color="cyan"
        size="sm"
        fullWidth
        leftSection={<IconExternalLink size={14} />}
        styles={{
          root: {
            fontFamily: 'Orbitron, sans-serif',
            letterSpacing: '0.08em',
          },
        }}
      >
        TRACK THIS FLIGHT
      </Button>
    </Paper>
  );
}

function FilterPanel({ opened, onClose }) {
  const { filterOpen, setFilterOpen } = useUIStore();
  const [altitudeRange, setAltitudeRange] = useState([0, 13000]);
  const [speedRange, setSpeedRange] = useState([0, 350]);
  const [groundOnly, setGroundOnly] = useState(false);
  const [aircraftType, setAircraftType] = useState('');

  const handleClose = () => {
    setFilterOpen(false);
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      position="left"
      size={320}
      title={
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', letterSpacing: '0.15em', color: 'var(--cyan)' }}>
          FLIGHT FILTERS
        </span>
      }
      styles={{
        content: { background: 'rgba(8, 12, 20, 0.95)', backdropFilter: 'blur(20px)' },
        header: { background: 'transparent', borderBottom: '1px solid rgba(0,212,255,0.1)' },
      }}
    >
      <Stack gap="lg">
        <div>
          <Text size="sm" fw={600} mb="xs" style={{ color: 'var(--text)' }}>
            Altitude (meters)
          </Text>
          <Slider
            value={altitudeRange}
            onChange={setAltitudeRange}
            min={0}
            max={13000}
            step={100}
            marks={[
              { value: 0, label: '0' },
              { value: 6500, label: '6.5k' },
              { value: 13000, label: '13k' },
            ]}
          />
        </div>

        <div>
          <Text size="sm" fw={600} mb="xs" style={{ color: 'var(--text)' }}>
            Speed (m/s)
          </Text>
          <Slider
            value={speedRange}
            onChange={setSpeedRange}
            min={0}
            max={350}
            step={10}
            marks={[
              { value: 0, label: '0' },
              { value: 175, label: '175' },
              { value: 350, label: '350' },
            ]}
          />
        </div>

        <Switch
          checked={groundOnly}
          onChange={(e) => setGroundOnly(e.currentTarget.checked)}
          label="Ground vehicles only"
          color="cyan"
        />

        <Select
          label="Aircraft type"
          value={aircraftType}
          onChange={setAircraftType}
          placeholder="All types"
          data={[
            { value: '', label: 'All types' },
            { value: 'commercial', label: 'Commercial' },
            { value: 'cargo', label: 'Cargo' },
            { value: 'private', label: 'Private' },
            { value: 'military', label: 'Military' },
            { value: 'general', label: 'General Aviation' },
          ]}
        />

        <Group>
          <Button variant="outline" color="gray" onClick={() => {
            setAltitudeRange([0, 13000]);
            setSpeedRange([0, 350]);
            setGroundOnly(false);
            setAircraftType('');
          }}>
            Reset
          </Button>
          <Button color="cyan" onClick={handleClose}>
            Apply
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}

export default function ExplorePage() {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const { filterOpen, setFilterOpen } = useUIStore();
  const [showDetail, setShowDetail] = useState(false);

  const fetchFlights = useCallback(async () => {
    try {
      const res = await fetch('/api/explore');
      if (res.ok) {
        const data = await res.json();
        const parsed = parseOpenSkyResponse(data);
        setFlights(parsed);
      }
    } catch (err) {
      console.error('Failed to fetch flights:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 15000);
    return () => clearInterval(interval);
  }, [fetchFlights]);

  const handleFlightClick = useCallback((flightProps) => {
    const flight = flights.find(f => f.icao24 === flightProps.icao24);
    if (flight) {
      setSelectedFlight(flight);
      setShowDetail(true);
    }
  }, [flights]);

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedFlight(null);
  };

  return (
    <>
      <div className="hud-grid" style={{ zIndex: 0 }} />
      <ScanlineOverlay />

      <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
        <FlightGlobe
          flights={flights}
          selectedFlight={selectedFlight}
          onFlightClick={handleFlightClick}
          className={styles.map}
        />

        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          {flights.length.toLocaleString()} FLIGHTS TRACKED
        </div>

        <button
          onClick={() => setFilterOpen(true)}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'rgba(8, 12, 20, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '4px',
            color: 'var(--cyan)',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.1em',
            cursor: 'pointer',
          }}
        >
          <IconFilter size={14} />
          FILTERS
        </button>

        <FilterPanel opened={filterOpen} onClose={() => setFilterOpen(false)} />

        <AnimatePresence>
          {showDetail && selectedFlight && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                bottom: '24px',
                right: '24px',
                width: '360px',
                zIndex: 15,
              }}
            >
              <FlightDetailPanel
                flight={selectedFlight}
                onClose={handleCloseDetail}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && flights.length === 0 && (
          <div className={styles.loadingOverlay}>
            <RadarSpinner size={64} />
            <div className={styles.loadingText}>SCANNING GLOBAL AIRSPACE</div>
          </div>
        )}
      </div>
    </>
  );
}