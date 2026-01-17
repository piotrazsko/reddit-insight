'use client';

import { memo } from 'react';
import { X } from 'lucide-react';
import type { Source } from '../../types';
import styles from './SectionModal.module.scss';

interface SectionFormData {
  title: string;
  description: string;
  prompt: string;
  sourceId: string;
}

interface SectionModalProps {
  isOpen: boolean;
  isEditing: boolean;
  form: SectionFormData;
  sources: Source[];
  onClose: () => void;
  onSave: () => void;
  onFormChange: (form: SectionFormData) => void;
}

export const SectionModal = memo<SectionModalProps>(({
  isOpen,
  isEditing,
  form,
  sources,
  onClose,
  onSave,
  onFormChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {isEditing ? 'Edit Category' : 'New Category'}
          </h3>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => onFormChange({ ...form, title: e.target.value })}
              placeholder="e.g. 'Bug Reports'"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Prompt Instruction</label>
            <textarea
              value={form.prompt}
              onChange={(e) => onFormChange({ ...form, prompt: e.target.value })}
              placeholder="e.g. 'Identify all comments discussing bugs or crashes...'"
              className={styles.textarea}
            />
            <p className={styles.hint}>The exact instruction given to the AI for this section.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Source Restriction (Optional)</label>
            <select
              value={form.sourceId}
              onChange={(e) => onFormChange({ ...form, sourceId: e.target.value })}
              className={styles.select}
            >
              <option value="">All Sources</option>
              {sources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.name} ({source.type})
                </option>
              ))}
            </select>
            <p className={styles.hint}>Only analyze posts from this specific source.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>UI Description (Optional)</label>
            <input
              value={form.description}
              onChange={(e) => onFormChange({ ...form, description: e.target.value })}
              placeholder="e.g. 'List of reported issues'"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onSave} className={styles.saveButton}>
            {isEditing ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
});

SectionModal.displayName = 'SectionModal';
