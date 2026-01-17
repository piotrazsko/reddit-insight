export interface ReportSection {
  id: string;
  title: string;
  description: string;
  prompt: string;
  sourceId?: string;
}

export interface Source {
  id: string;
  name: string;
  type: string;
}

export type SettingsTab = 'reports' | 'general' | 'danger';
