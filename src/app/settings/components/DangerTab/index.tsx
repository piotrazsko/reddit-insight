'use client';

import { memo } from 'react';
import { AlertTriangle, Trash2, Loader2, RefreshCcw } from 'lucide-react';
import styles from './DangerTab.module.scss';

interface DangerTabProps {
  loading: boolean;
  fullResetLoading: boolean;
  onReset: () => void;
  onFullReset: () => void;
}

export const DangerTab = memo<DangerTabProps>(({ loading, fullResetLoading, onReset, onFullReset }) => {
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
              <h3 className={styles.actionTitle}>Reset Analysis Data</h3>
              <p className={styles.actionDescription}>
                Delete all posts and reports. Sources and settings will be preserved.
              </p>
            </div>
            <button
              onClick={onReset}
              disabled={loading || fullResetLoading}
              className={styles.resetButton}
            >
              {loading ? (
                <Loader2 className={styles.spinner} size={18} />
              ) : (
                <RefreshCcw size={18} />
              )}
              Reset Data
            </button>
          </div>

          <div className={styles.divider} />

          <div className={styles.actionItem}>
            <div className={styles.actionInfo}>
              <h3 className={styles.actionTitle}>Full Factory Reset</h3>
              <p className={styles.actionDescription}>
                Permanently delete ALL data including sources, posts, reports, and reset settings to defaults. Start completely fresh.
              </p>
            </div>
            <button
              onClick={onFullReset}
              disabled={loading || fullResetLoading}
              className={styles.deleteButton}
            >
              {fullResetLoading ? (
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
