'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { DEFAULT_REPORT_SECTIONS } from '@/lib/defaults';
import { OPENAI_DEFAULT_MODEL } from '@/lib/openaiModels';
import { PageHeader } from '@/components/PageHeader';

import { SettingsTabs } from './components/SettingsTabs';
import { ReportsTab } from './components/ReportsTab';
import { GeneralTab } from './components/GeneralTab';
import { DangerTab } from './components/DangerTab';
import { SectionModal } from './components/SectionModal';
import type { ReportSection, Source, SettingsTab } from './types';

import styles from './Settings.module.scss';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('reports');
  const router = useRouter();

  // Loading states
  const [loading, setLoading] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);

  // AI settings
  const [apiKey, setApiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState(OPENAI_DEFAULT_MODEL);
  const [aiProvider, setAiProvider] = useState('openai');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [reportLanguage, setReportLanguage] = useState('English');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Report sections
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [sources, setSources] = useState<Source[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ReportSection | null>(null);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: '',
    prompt: '',
    sourceIds: [] as string[],
  });

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, sourcesRes] = await Promise.all([
          fetch('/api/user/settings'),
          fetch('/api/sources'),
        ]);

        if (sourcesRes.ok) {
          const data = await sourcesRes.json();
          setSources(data);
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.openaiKey) setApiKey(data.openaiKey);
          if (data.aiProvider) setAiProvider(data.aiProvider);
          if (data.ollamaUrl) setOllamaUrl(data.ollamaUrl);
          if (data.ollamaModel) setOllamaModel(data.ollamaModel);
          if (data.openaiModel) setOpenaiModel(data.openaiModel);
          if (data.reportLanguage) setReportLanguage(data.reportLanguage);

          if (data.reportSections) {
            try {
              const parsed = JSON.parse(data.reportSections);
              setSections(parsed.length > 0 ? parsed : DEFAULT_REPORT_SECTIONS);
            } catch {
              setSections(DEFAULT_REPORT_SECTIONS);
            }
          } else {
            setSections(DEFAULT_REPORT_SECTIONS);
          }
        }
      } catch (e) {
        console.error(e);
        setSections(DEFAULT_REPORT_SECTIONS);
      }
    };
    fetchSettings();
  }, []);

  const handleFetchModels = useCallback(async () => {
    setFetchingModels(true);
    setAvailableModels([]);
    try {
      const res = await fetch(`/api/ollama/models?url=${encodeURIComponent(ollamaUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const names = data.models.map((m: any) => m.name);
          setAvailableModels(names);

          if (names.length > 0 && !names.includes(ollamaModel)) {
            setOllamaModel(names[0]);
          }
          toast.success(`Found ${names.length} models`);
        } else {
          toast.warning('No models found or unexpected response format.');
        }
      } else {
        toast.error('Failed to connect to Ollama. Check URL and ensure it is running.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error fetching models.');
    } finally {
      setFetchingModels(false);
    }
  }, [ollamaUrl, ollamaModel]);

  const handleReset = useCallback(async () => {
    if (
      !confirm(
        'Are you ABSOLUTELY sure? This will delete ALL posts and reports history. This action cannot be undone.'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        toast.success('Data cleared successfully.');
        router.refresh();
      } else {
        toast.error('Failed to clear data.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error clearing data.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSaveKey = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setKeyLoading(true);
      try {
        const res = await fetch('/api/user/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            openaiKey: apiKey,
            aiProvider,
            ollamaUrl,
            ollamaModel,
            openaiModel,
            reportLanguage,
          }),
        });

        if (res.ok) {
          toast.success(
            `Saved: ${aiProvider === 'ollama' ? 'Ollama (' + ollamaModel + ')' : 'OpenAI (' + openaiModel + ')'} settings`
          );
        } else {
          toast.error('Failed to save AI settings.');
        }
      } catch (e) {
        console.error(e);
        toast.error('Error saving settings.');
      } finally {
        setKeyLoading(false);
      }
    },
    [apiKey, aiProvider, ollamaUrl, ollamaModel, openaiModel, reportLanguage]
  );

  const persistSections = useCallback(async (updatedSections: ReportSection[]) => {
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportSections: JSON.stringify(updatedSections) }),
      });
      if (!res.ok) toast.error('Failed to auto-save configuration.');
    } catch (e) {
      console.error(e);
      toast.error('Error auto-saving configuration.');
    }
  }, []);

  const openAddModal = useCallback(() => {
    setEditingSection(null);
    setSectionForm({ title: '', description: '', prompt: '', sourceIds: [] });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((section: ReportSection) => {
    setEditingSection(section);
    setSectionForm({
      title: section.title,
      description: section.description,
      prompt: section.prompt,
      sourceIds: section.sourceIds || [],
    });
    setIsModalOpen(true);
  }, []);

  const saveSection = useCallback(() => {
    if (!sectionForm.title || !sectionForm.prompt) {
      toast.error('Title and Prompt are required.');
      return;
    }

    let updatedSections: ReportSection[];
    if (editingSection) {
      updatedSections = sections.map((s) =>
        s.id === editingSection.id ? { ...s, ...sectionForm } : s
      );
    } else {
      const newSection = {
        id: `section_${Date.now()}`,
        ...sectionForm,
      };
      updatedSections = [newSection, ...sections];
    }

    setSections(updatedSections);
    persistSections(updatedSections);
    setIsModalOpen(false);
  }, [sectionForm, editingSection, sections, persistSections]);

  const removeSection = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('Delete this category?')) {
        const updatedSections = sections.filter((s) => s.id !== id);
        setSections(updatedSections);
        persistSections(updatedSections);
      }
    },
    [sections, persistSections]
  );

  const restoreDefaults = useCallback(() => {
    if (confirm('Restore default categories? This will overwrite your current configuration.')) {
      setSections(DEFAULT_REPORT_SECTIONS);
      persistSections(DEFAULT_REPORT_SECTIONS);
    }
  }, [persistSections]);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Settings"
        description="Manage your analysis preferences and system configurations."
      />

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'reports' && (
        <ReportsTab
          sections={sections}
          sources={sources}
          onAddClick={openAddModal}
          onEditClick={openEditModal}
          onRemove={removeSection}
          onRestoreDefaults={restoreDefaults}
        />
      )}

      {activeTab === 'general' && (
        <GeneralTab
          aiProvider={aiProvider}
          setAiProvider={setAiProvider}
          apiKey={apiKey}
          setApiKey={setApiKey}
          openaiModel={openaiModel}
          setOpenaiModel={setOpenaiModel}
          ollamaUrl={ollamaUrl}
          setOllamaUrl={setOllamaUrl}
          ollamaModel={ollamaModel}
          setOllamaModel={setOllamaModel}
          reportLanguage={reportLanguage}
          setReportLanguage={setReportLanguage}
          availableModels={availableModels}
          setAvailableModels={setAvailableModels}
          fetchingModels={fetchingModels}
          keyLoading={keyLoading}
          onFetchModels={handleFetchModels}
          onSubmit={handleSaveKey}
        />
      )}

      {activeTab === 'danger' && <DangerTab loading={loading} onReset={handleReset} />}

      <SectionModal
        isOpen={isModalOpen}
        isEditing={!!editingSection}
        form={sectionForm}
        sources={sources}
        onClose={() => setIsModalOpen(false)}
        onSave={saveSection}
        onFormChange={setSectionForm}
      />
    </div>
  );
}
