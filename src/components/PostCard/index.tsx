'use client';

import { memo } from 'react';
import { ExternalLink } from 'lucide-react';
import styles from './PostCard.module.scss';

interface PostCardProps {
  id: string;
  title: string;
  url: string;
  permalink: string;
  postedAt: Date;
  sourceName: string;
}

export const PostCard = memo<PostCardProps>(({ title, url, permalink, postedAt, sourceName }) => {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.meta}>
            <span className={styles.source}>{sourceName}</span>
            <span className={styles.separator}>•</span>
            <span>{new Date(postedAt).toLocaleDateString()}</span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.title}
          >
            {title}
          </a>
        </div>
        <a
          href={permalink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
});

PostCard.displayName = 'PostCard';
