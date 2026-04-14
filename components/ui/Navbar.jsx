'use client';
import { useUIStore } from '@/store/uiStore';
import styles from '@/styles/modules/Navbar.module.css';
import Link from 'next/link';
import { IconPlane, IconRadar, IconSearch, IconScanlines } from '@tabler/icons-react';
import { ActionIcon, Tooltip } from '@mantine/core';

export function Navbar() {
  const { scanlines, toggleScanlines } = useUIStore();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <div className={styles.logo}>
            <IconPlane size={20} stroke={1.5} />
          </div>
          <span className={styles.brandText}>AEROTRACK</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            HOME
          </Link>
          <Link href="/explore" className={styles.navLink}>
            EXPLORE
          </Link>
        </nav>

        <div className={styles.actions}>
          <Tooltip label={scanlines ? 'Disable scanlines' : 'Enable scanlines'} position="bottom">
            <button
              className={`${styles.scanlineToggle} ${scanlines ? styles.scanlineToggleActive : ''}`}
              onClick={toggleScanlines}
            >
              <IconScanlines size={16} style={{ verticalAlign: 'middle' }} />
              {' '}SCAN
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}