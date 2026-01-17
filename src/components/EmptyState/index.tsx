'use client';

import { memo } from 'react';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  message: string;
  dashed?: boolean;
}

export const EmptyState = memo<EmptyStateProps>(({ message, dashed }) => {
  return (
    <div className={dashed ? styles.containerDashed : styles.container}>
      {message}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
