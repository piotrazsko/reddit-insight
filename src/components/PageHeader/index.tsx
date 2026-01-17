'use client';

import { memo, type ReactNode } from 'react';
import styles from './PageHeader.module.scss';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  gradient?: boolean;
}

export const PageHeader = memo<PageHeaderProps>(({ title, description, action, gradient }) => {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={gradient ? styles.titleGradient : styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
});

PageHeader.displayName = 'PageHeader';
