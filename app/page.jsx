'use client';
import { useState, useEffect } from 'react';
import { Title, Text, Button, Container, Stack, Group } from '@mantine/core';
import { motion } from 'motion/react';
import { IconMapPin } from '@tabler/icons-react';
import { HeroSearch } from '@/components/search/HeroSearch';
import { StatsBar } from '@/components/ui/StatsBar';
import { RadarSpinner } from '@/components/ui/RadarSpinner';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ScanlineOverlay = dynamic(
  () => import('@/components/ui/ScanlineOverlay').then(m => m.ScanlineOverlay),
  { ssr: false }
);

export default function HomePage() {
  const [stats, setStats] = useState({ count: 0, countries: 0, avgAlt: 0, maxSpeed: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/explore');
        if (res.ok) {
          const data = await res.json();
          const states = data.states || [];
          if (states.length > 0) {
            const countries = new Set();
            let totalAlt = 0;
            let maxSpd = 0;
            let countWithAlt = 0;
            for (const s of states) {
              if (s[2]) countries.add(s[2]);
              if (s[7] != null) { totalAlt += s[7]; countWithAlt++; }
              if (s[9] != null && s[9] > maxSpd) maxSpd = s[9];
            }
            setStats({
              count: states.length,
              countries: countries.size,
              avgAlt: countWithAlt > 0 ? Math.round(totalAlt / countWithAlt) : 0,
              maxSpeed: Math.round(maxSpd),
            });
          }
        }
      } catch (err) {
        console.error('Stats error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="hud-grid" />

      <ScanlineOverlay />

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        padding: '40px 20px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ textAlign: 'center', maxWidth: '800px' }}
        >
          <Title
            className="title-flicker text-glow-cyan"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              fontWeight: 900,
              letterSpacing: '0.2em',
              marginBottom: '16px',
            }}
          >
            AEROTRACK
          </Title>

          <Text
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              color: 'rgba(232, 244, 255, 0.6)',
              letterSpacing: '0.15em',
              marginBottom: '48px',
            }}
          >
            Real-time global flight intelligence
          </Text>

          <div style={{ marginBottom: '48px' }}>
            <HeroSearch />
          </div>

          {isLoading ? (
            <Stack align="center" gap="md">
              <RadarSpinner size={48} />
              <Text size="sm" c="dimmed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Loading global flight data...
              </Text>
            </Stack>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StatsBar
                count={stats.count}
                countries={stats.countries}
                avgAlt={stats.avgAlt}
                maxSpeed={stats.maxSpeed}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              component={Link}
              href="/explore"
              variant="outline"
              color="yellow"
              size="lg"
              leftSection={<IconMapPin size={18} />}
              styles={{
                root: {
                  fontFamily: 'Orbitron, sans-serif',
                  letterSpacing: '0.1em',
                  borderColor: 'rgba(255, 184, 0, 0.5)',
                  color: '#FFB800',
                  marginTop: '48px',
                  '&:hover': {
                    background: 'rgba(255, 184, 0, 0.1)',
                    borderColor: '#FFB800',
                    boxShadow: 'var(--glow-amber)',
                  },
                },
              }}
            >
              EXPLORE GLOBAL MAP →
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '24px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          <span>OpenSky Network</span>
          <span>·</span>
          <span>ADS-B.lol</span>
          <span>·</span>
          <span>MapLibre GL</span>
        </motion.div>
      </div>
    </>
  );
}