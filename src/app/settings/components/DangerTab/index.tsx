'use client';

import { memo } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import styles from './DangerTab.module.scss';

interface DangerTabProps {
  loading: boolean;
  onReset: () => void;
}

export const DangerTab = memo<DangerTabProps>(({ loading, onReset }) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <AlertTriangle />
          <h2 className={styles.cardTitle}>Danger Zone</h2>
        </div>

        <div className={styles.actions}>
          <div className={styles.actionItem}>
            <div className={styles.actionInfo}>
              <h3 className={styles.actionTitle}>Reset Application Data</h3>
              <p className={styles.actionDescription}>
                Permanently delete all posts, reports, and generated insights.
              </p>
            </div>
            <button
              onClick={onReset}
              disabled={loading}
              className={styles.deleteButton}
            >
              {loading ? (
                <Loader2 className={styles.spinner} size={18} />
              ) : (
                <Trash2 size={18} />
              )}
              Delete Everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

DangerTab.displayName = 'DangerTab';
