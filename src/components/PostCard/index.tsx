'use client';

import { memo, useState, useCallback } from 'react';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { CommentGenerator } from '@/components/CommentGenerator';
import styles from './PostCard.module.scss';

interface PostCardProps {
  id: string;
  title: string;
  url: string;
  permalink: string;
  postedAt: Date;
  sourceName: string;
}

export const PostCard = memo<PostCardProps>(({ id, title, url, permalink, postedAt, sourceName }) => {
  const [showCommentModal, setShowCommentModal] = useState(false);

  const handleOpenCommentModal = useCallback(() => {
    setShowCommentModal(true);
  }, []);

  const handleCloseCommentModal = useCallback(() => {
    setShowCommentModal(false);
  }, []);

  return (
    <>
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
          <div className={styles.actions}>
            <button
              onClick={handleOpenCommentModal}
              className={styles.actionButton}
              title="Generate comment"
              aria-label="Generate AI comment for this post"
            >
              <MessageSquare size={16} />
            </button>
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
      </div>

      {showCommentModal && (
        <CommentGenerator
          postId={id}
          postTitle={title}
          permalink={permalink}
          onClose={handleCloseCommentModal}
        />
      )}
    </>
  );
});

PostCard.displayName = 'PostCard';
