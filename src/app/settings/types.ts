export interface ReportSection {
  id: string;
  title: string;
  description: string;
  prompt: string;
  sourceIds?: string[];
  /** Mode: 'overview' for analytical summary, 'posts' for list of specific posts */
  mode?: 'overview' | 'posts';
}

export interface Source {
  id: string;
  name: string;
  type: string;
}

export type SettingsTab = 'reports' | 'general' | 'danger';
