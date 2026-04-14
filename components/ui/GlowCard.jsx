import { Paper } from '@mantine/core';
import styles from '@/styles/modules/Navbar.module.css';

export function GlowCard({ children, variant = 'cyan', className = '', ...props }) {
  const variantClass = {
    cyan: '',
    amber: styles.cardAmber,
    green: styles.cardGreen,
  }[variant] || '';

  return (
    <Paper
      className={`${styles.card} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </Paper>
  );
}

export function GlowCard({ children, color = 'cyan', className = '', ...props }) {
  const colorClass = color === 'amber' ? 'cardAmber' : color === 'green' ? 'cardGreen' : '';
  return (
    <div className={`bracket-card glow-${color} ${colorClass} ${className}`} {...props}>
      {children}
    </div>
  );
}