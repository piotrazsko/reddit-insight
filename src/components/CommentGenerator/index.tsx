'use client';

import { memo, useState, useCallback } from 'react';
import { MessageSquare, Copy, Check, ExternalLink, Loader2, X } from 'lucide-react';
import styles from './CommentGenerator.module.scss';

type CommentTone = 'helpful' | 'friendly' | 'professional' | 'casual';

interface CommentGeneratorProps {
  postId: string;
  postTitle: string;
  permalink: string;
  onClose: () => void;
}

const TONE_OPTIONS: { value: CommentTone; label: string; emoji: string }[] = [
  { value: 'helpful', label: 'Helpful', emoji: '💡' },
  { value: 'friendly', label: 'Friendly', emoji: '😊' },
  { value: 'professional', label: 'Professional', emoji: '👔' },
  { value: 'casual', label: 'Casual', emoji: '✌️' },
];

export const CommentGenerator = memo<CommentGeneratorProps>(({
  postId,
  postTitle,
  permalink,
  onClose,
}) => {
  const [tone, setTone] = useState<CommentTone>('helpful');
  const [context, setContext] = useState('');
  const [generatedComment, setGeneratedComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedComment('');

    try {
      const response = await fetch('/api/comments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          tone,
          context: context || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate comment');
      }

      const data = await response.json();
      setGeneratedComment(data.comment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [postId, tone, context]);

  const handleCopy = useCallback(async () => {
    if (!generatedComment) return;
    
    try {
      await navigator.clipboard.writeText(generatedComment);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  }, [generatedComment]);

  const handleOpenReddit = useCallback(() => {
    // Open Reddit post in new tab
    window.open(permalink, '_blank', 'noopener,noreferrer');
  }, [permalink]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <MessageSquare size={20} />
            <h2>Generate Comment</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.postInfo}>
          <span className={styles.label}>For post:</span>
          <span className={styles.postTitle}>{postTitle}</span>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <label className={styles.label}>Tone</label>
            <div className={styles.toneOptions}>
              {TONE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.toneButton} ${tone === option.value ? styles.active : ''}`}
                  onClick={() => setTone(option.value)}
                >
                  <span>{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label} htmlFor="context">
              Additional context (optional)
            </label>
            <textarea
              id="context"
              className={styles.textarea}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add any specific points you want to mention or perspective you want to take..."
              rows={3}
            />
          </div>

          <button
            className={styles.generateButton}
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                Generating...
              </>
            ) : (
              <>
                <MessageSquare size={18} />
                Generate Comment
              </>
            )}
          </button>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {generatedComment && (
            <div className={styles.result}>
              <div className={styles.resultHeader}>
                <span className={styles.label}>Generated Comment</span>
                <div className={styles.resultActions}>
                  <button 
                    className={styles.actionButton} 
                    onClick={handleCopy}
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={handleOpenReddit}
                    title="Open post on Reddit"
                  >
                    <ExternalLink size={16} />
                    Open Reddit
                  </button>
                </div>
              </div>
              <div className={styles.commentPreview}>
                {generatedComment}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CommentGenerator.displayName = 'CommentGenerator';
