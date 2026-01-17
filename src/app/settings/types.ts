export interface ReportSection {
  id: string;
  title: string;
  description: string;
  prompt: string;
  sourceIds?: string[];
}

export interface Source {
  id: string;
  name: string;
  type: string;
}

export type SettingsTab = 'reports' | 'general' | 'danger';
