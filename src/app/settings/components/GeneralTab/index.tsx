'use client';

import { memo } from 'react';
import { Settings as SettingsIcon, Loader2, Edit2 } from 'lucide-react';
import { OPENAI_MODELS } from '@/lib/openaiModels';
import styles from './GeneralTab.module.scss';

interface GeneralTabProps {
  aiProvider: string;
  setAiProvider: (provider: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  openaiModel: string;
  setOpenaiModel: (model: string) => void;
  ollamaUrl: string;
  setOllamaUrl: (url: string) => void;
  ollamaModel: string;
  setOllamaModel: (model: string) => void;
  reportLanguage: string;
  setReportLanguage: (lang: string) => void;
  availableModels: string[];
  setAvailableModels: (models: string[]) => void;
  fetchingModels: boolean;
  keyLoading: boolean;
  onFetchModels: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LANGUAGES = [
  'English',
  'Belarusian',
  'Russian',
  'Polish',
  'German',
  'Spanish',
  'French',
];

export const GeneralTab = memo<GeneralTabProps>(({
  aiProvider,
  setAiProvider,
  apiKey,
  setApiKey,
  openaiModel,
  setOpenaiModel,
  ollamaUrl,
  setOllamaUrl,
  ollamaModel,
  setOllamaModel,
  reportLanguage,
  setReportLanguage,
  availableModels,
  setAvailableModels,
  fetchingModels,
  keyLoading,
  onFetchModels,
  onSubmit,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <SettingsIcon />
          <h2 className={styles.cardTitle}>AI Provider Settings</h2>
        </div>

        <p className={styles.cardDescription}>
          Choose which AI model to use for analysis.
        </p>

        <div className={styles.providerToggle}>
          <button
            onClick={() => setAiProvider('openai')}
            className={`${styles.providerButton} ${aiProvider === 'openai' ? styles.providerButtonActiveBlue : ''}`}
          >
            OpenAI
          </button>
          <button
            onClick={() => setAiProvider('ollama')}
            className={`${styles.providerButton} ${aiProvider === 'ollama' ? styles.providerButtonActiveOrange : ''}`}
          >
            Ollama (Local)
          </button>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          {aiProvider === 'openai' && (
            <div className={styles.formSection}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>OpenAI API Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={styles.input}
                />
                <p className={styles.hint}>Leave empty to use system default key.</p>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>OpenAI Model</label>
                <select
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                  className={styles.select}
                >
                  {OPENAI_MODELS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {aiProvider === 'ollama' && (
            <div className={styles.formSection}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Ollama Base URL</label>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    placeholder="http://localhost:11434"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className={`${styles.input} ${styles.inputFlex}`}
                  />
                  <button
                    type="button"
                    onClick={onFetchModels}
                    disabled={fetchingModels}
                    className={styles.fetchButton}
                  >
                    {fetchingModels ? <Loader2 className={styles.spinner} size={16} /> : 'Fetch Models'}
                  </button>
                </div>
                <p className={styles.hint}>
                  If running inside Docker, use <code>http://host.docker.internal:11434</code>
                </p>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Model Name</label>
                {availableModels.length > 0 ? (
                  <div className={styles.inputGroup}>
                    <select
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      className={`${styles.select} ${styles.inputFlex}`}
                    >
                      <option value="" disabled>Select a model</option>
                      {availableModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setAvailableModels([])}
                      className={styles.editButton}
                      title="Enter custom model name"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="llama3"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className={styles.input}
                  />
                )}
                {availableModels.length === 0 && (
                  <p className={styles.hint}>
                    Click &quot;Fetch Models&quot; to scan for available local models.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className={styles.languageSection}>
            <label className={styles.label}>Report Language</label>
            <select
              value={reportLanguage}
              onChange={(e) => setReportLanguage(e.target.value)}
              className={styles.select}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <p className={styles.hint}>
              AI will translate and generate reports in this language.
            </p>
          </div>

          <button
            type="submit"
            disabled={keyLoading}
            className={`${styles.submitButton} ${aiProvider === 'openai' ? styles.submitButtonBlue : styles.submitButtonOrange}`}
          >
            {keyLoading ? 'Saving...' : 'Save AI Settings'}
          </button>
        </form>
      </div>
    </div>
  );
});

GeneralTab.displayName = 'GeneralTab';
