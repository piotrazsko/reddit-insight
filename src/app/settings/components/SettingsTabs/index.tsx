'use client';

import { memo } from 'react';
import type { SettingsTab } from '../../types';
import styles from './SettingsTabs.module.scss';

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const TABS: { id: SettingsTab; label: string; color: string }[] = [
  { id: 'reports', label: 'Report Structure', color: 'purple' },
  { id: 'general', label: 'AI Provider & Keys', color: 'blue' },
  { id: 'danger', label: 'Danger Zone', color: 'red' },
];

export const SettingsTabs = memo<SettingsTabsProps>(({ activeTab, onTabChange }) => {
  return (
    <div className={styles.container}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`${styles.tab} ${activeTab === tab.id ? styles[`tabActive${tab.color}`] : ''}`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className={`${styles.indicator} ${styles[`indicator${tab.color}`]}`} />
          )}
        </button>
      ))}
    </div>
  );
});

SettingsTabs.displayName = 'SettingsTabs';
