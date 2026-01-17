'use client';

import { memo, useCallback, useMemo } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { ReportSection, Source } from '../../types';
import styles from './ReportsTab.module.scss';

interface ReportsTabProps {
  sections: ReportSection[];
  sources: Source[];
  onAddClick: () => void;
  onEditClick: (section: ReportSection) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
  onRestoreDefaults: () => void;
}

export const ReportsTab = memo<ReportsTabProps>(({
  sections,
  sources,
  onAddClick,
  onEditClick,
  onRemove,
  onRestoreDefaults,
}) => {
  const handleRowClick = useCallback((section: ReportSection) => {
    onEditClick(section);
  }, [onEditClick]);

  const sourceMap = useMemo(() => {
    return new Map(sources.map(s => [s.id, s.name]));
  }, [sources]);

  const getSourcesLabel = useCallback((sourceIds?: string[]) => {
    if (!sourceIds || sourceIds.length === 0) {
      return 'All';
    }
    const names = sourceIds
      .map(id => sourceMap.get(id))
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : 'All';
  }, [sourceMap]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Analysis Categories</h2>
          <p className={styles.subtitle}>Define exactly what topics the AI should look for in your sources.</p>
        </div>
        <div className={styles.actions}>
          <button onClick={onRestoreDefaults} className={styles.restoreButton}>
            Restore Defaults
          </button>
          <button onClick={onAddClick} className={styles.addButton}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.th}>Title</th>
              <th className={`${styles.th} ${styles.thPrompt}`}>Prompt</th>
              <th className={styles.th}>Sources</th>
              <th className={`${styles.th} ${styles.thActions}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {sections.map((section) => (
              <tr
                key={section.id}
                className={styles.tableRow}
                onClick={() => handleRowClick(section)}
              >
                <td className={styles.tdTitle}>{section.title}</td>
                <td className={styles.tdPrompt} title={section.prompt}>{section.prompt}</td>
                <td className={styles.tdSources} title={getSourcesLabel(section.sourceIds)}>
                  {getSourcesLabel(section.sourceIds)}
                </td>
                <td className={styles.tdActions}>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditClick(section); }}
                      className={styles.editButton}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => onRemove(section.id, e)}
                      className={styles.deleteButton}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sections.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.emptyState}>
                  No categories defined.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ReportsTab.displayName = 'ReportsTab';
