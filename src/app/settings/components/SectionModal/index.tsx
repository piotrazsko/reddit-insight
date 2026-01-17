'use client';

import { memo, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import type { Source } from '../../types';
import styles from './SectionModal.module.scss';

interface SectionFormData {
  title: string;
  description: string;
  prompt: string;
  sourceIds: string[];
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
  const handleSourceToggle = useCallback((sourceId: string) => {
    const currentIds = form.sourceIds || [];
    const newIds = currentIds.includes(sourceId)
      ? currentIds.filter(id => id !== sourceId)
      : [...currentIds, sourceId];
    onFormChange({ ...form, sourceIds: newIds });
  }, [form, onFormChange]);

  const handleSelectAll = useCallback(() => {
    onFormChange({ ...form, sourceIds: [] });
  }, [form, onFormChange]);

  if (!isOpen) return null;

  const isAllSources = !form.sourceIds || form.sourceIds.length === 0;

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
            <p className={styles.hint}>Select sources to restrict analysis. Leave unchecked to analyze all sources.</p>
            <div className={styles.sourceList}>
              <button
                type="button"
                onClick={handleSelectAll}
                className={`${styles.sourceItem} ${isAllSources ? styles.sourceItemActive : ''}`}
              >
                <span className={styles.sourceCheckbox}>
                  {isAllSources && <Check size={12} />}
                </span>
                <span>All Sources</span>
              </button>
              {sources.map(source => {
                const isSelected = form.sourceIds?.includes(source.id);
                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => handleSourceToggle(source.id)}
                    className={`${styles.sourceItem} ${isSelected ? styles.sourceItemActive : ''}`}
                  >
                    <span className={styles.sourceCheckbox}>
                      {isSelected && <Check size={12} />}
                    </span>
                    <span>{source.name}</span>
                    <span className={styles.sourceType}>{source.type}</span>
                  </button>
                );
              })}
            </div>
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
