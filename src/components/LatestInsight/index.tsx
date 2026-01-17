'use client';

import { memo } from 'react';
import Link from 'next/link';
import styles from './LatestInsight.module.scss';

interface LatestInsightProps {
  report: {
    id: string;
    title: string;
    summary: string | null;
  } | null;
}

export const LatestInsight = memo<LatestInsightProps>(({ report }) => {
  if (!report) {
    return (
      <div className={styles.empty}>
        No reports generated yet.
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{report.title}</h3>
        <Link href={`/reports/${report.id}`} className={styles.link}>
          View Full Report
        </Link>
      </div>
      <div className={styles.content}>
        {report.summary}
      </div>
    </div>
  );
});

LatestInsight.displayName = 'LatestInsight';
