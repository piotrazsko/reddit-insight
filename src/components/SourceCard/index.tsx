'use client';

import { memo } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import styles from './SourceCard.module.scss';

interface SourceCardProps {
  id: string;
  name: string;
  type: string;
  active: boolean;
  postsCount: number;
  onDelete: (id: string) => void;
}

export const SourceCard = memo<SourceCardProps>(({
  id,
  name,
  type,
  active,
  postsCount,
  onDelete,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={`${styles.status} ${active ? styles.statusActive : styles.statusInactive}`} />
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h2 className={styles.name}>{name}</h2>
            <a
              href={`https://www.reddit.com/r/${name}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
              title={`Open r/${name}`}
            >
              <ExternalLink size={14} />
            </a>
          </div>
          <div className={styles.meta}>
            <span>{type}</span>
            <span>•</span>
            <span>{postsCount} posts</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => onDelete(id)}
        className={styles.deleteButton}
        title="Delete Source"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
});

SourceCard.displayName = 'SourceCard';
