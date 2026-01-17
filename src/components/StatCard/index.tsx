'use client';

import { memo } from 'react';
import styles from './StatCard.module.scss';

interface StatCardProps {
  label: string;
  value: number;
}

export const StatCard = memo<StatCardProps>(({ label, value }) => {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
});

StatCard.displayName = 'StatCard';
