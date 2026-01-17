'use client';

import { memo } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import styles from './AddSourceForm.module.scss';

interface AddSourceFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export const AddSourceForm = memo<AddSourceFormProps>(({
  value,
  onChange,
  onSubmit,
  loading,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.inputWrapper}>
        <div className={styles.prefix}>
          <span>r/</span>
        </div>
        <input
          type="text"
          placeholder="subreddit"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !value}
        className={styles.submitButton}
      >
        {loading ? <Loader2 className={styles.spinner} size={20} /> : <Plus size={20} />}
        Add
      </button>
    </form>
  );
});

AddSourceForm.displayName = 'AddSourceForm';
