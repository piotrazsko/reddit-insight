'use client';

import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Loader2, Plus, Settings as SettingsIcon, X, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DEFAULT_REPORT_SECTIONS } from '@/lib/defaults';
import { toast } from 'sonner';

interface ReportSection {
  id: string;
  title: string;
  description: string;
  prompt: string;
  sourceId?: string; // Optional binding
}

type Tab = 'reports' | 'general' | 'danger';

interface Source {
    id: string;
    name: string;
    type: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('reports');

  const [loading, setLoading] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [, setSectionsLoading] = useState(false);
  
  const [apiKey, setApiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o');
  const [aiProvider, setAiProvider] = useState('openai');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [reportLanguage, setReportLanguage] = useState('English');
  
  const [sections, setSections] = useState<ReportSection[]>([]);
  
  // Ollama Models
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);

  // Sources for binding
  const [sources, setSources] = useState<Source[]>([]);

  const router = useRouter();

  /* API Fetching Logic */
  const handleFetchModels = async () => {
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
                
                // If current model is not in list (or empty), select the first one.
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
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ReportSection | null>(null);
  const [sectionForm, setSectionForm] = useState<{ title: string; description: string; prompt: string; sourceId: string }>({ title: '', description: '', prompt: '', sourceId: '' });

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const [settingsRes, sourcesRes] = await Promise.all([
                fetch('/api/user/settings'),
                fetch('/api/sources')
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

  const handleReset = async () => {
    if (!confirm('Are you ABSOLUTELY sure? This will delete ALL posts and reports history. This action cannot be undone.')) {
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
  };

  const handleSaveKey = async (e: React.FormEvent) => {
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
                reportLanguage
            })
        });
        
        if (res.ok) {
            toast.success(`Saved: ${aiProvider === 'ollama' ? 'Ollama (' + ollamaModel + ')' : 'OpenAI (' + openaiModel + ')'} settings`);
        } else {
            toast.error('Failed to save AI settings.');
        }
    } catch (e) {
        console.error(e);
        toast.error('Error saving settings.');
    } finally {
        setKeyLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingSection(null);
    setSectionForm({ title: '', description: '', prompt: '', sourceId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (section: ReportSection) => {
    setEditingSection(section);
    setSectionForm({ 
        title: section.title, 
        description: section.description, 
        prompt: section.prompt,
        sourceId: section.sourceId || '' 
    });
    setIsModalOpen(true);
  };

  const persistSections = async (updatedSections: ReportSection[]) => {
    setSectionsLoading(true);
    try {
        const res = await fetch('/api/user/settings', { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportSections: JSON.stringify(updatedSections) })
        });
        if (!res.ok) toast.error('Failed to auto-save configuration.');
    } catch (e) {
        console.error(e);
        toast.error('Error auto-saving configuration.');
    } finally {
        setSectionsLoading(false);
    }
  };

  const saveSection = () => {
    if (!sectionForm.title || !sectionForm.prompt) {
        toast.error('Title and Prompt are required.');
        return;
    }

    let updatedSections: ReportSection[];
    if (editingSection) {
        // Edit existing
        updatedSections = sections.map(s => s.id === editingSection.id ? { ...s, ...sectionForm } : s);
    } else {
        // Add new (prepend to top)
        const newSection = {
            id: `section_${Date.now()}`,
            ...sectionForm
        };
        updatedSections = [newSection, ...sections];
    }
    
    setSections(updatedSections);
    persistSections(updatedSections);
    setIsModalOpen(false);
  };

  const removeSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this category?')) {
        const updatedSections = sections.filter(s => s.id !== id);
        setSections(updatedSections);
        persistSections(updatedSections);
    }
  };

  const restoreDefaults = () => {
    if (confirm('Restore default categories? This will overwrite your current configuration.')) {
        setSections(DEFAULT_REPORT_SECTIONS);
        persistSections(DEFAULT_REPORT_SECTIONS);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500 mt-2">Manage your analysis preferences and system configurations.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-zinc-800">
        <button 
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'reports' ? 'text-purple-400' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
            Report Structure
            {activeTab === 'reports' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500" />}
        </button>
        <button 
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'general' ? 'text-blue-400' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
            AI Provider & Keys
            {activeTab === 'general' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500" />}
        </button>
        <button 
            onClick={() => setActiveTab('danger')}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'danger' ? 'text-red-400' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
            Danger Zone
            {activeTab === 'danger' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500" />}
        </button>
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                     <h2 className="text-xl font-semibold text-zinc-100">Analysis Categories</h2>
                     <p className="text-zinc-400 text-sm">Define exactly what topics the AI should look for in your sources.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={restoreDefaults} className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
                        Restore Defaults
                    </button>
                    <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all">
                        <Plus size={16} /> Add Category
                    </button>
                </div>
            </div>

            {/* Table View */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-900/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                            <th className="p-4 font-semibold">Title</th>
                            <th className="p-4 font-semibold w-1/3">Prompt</th>
                            <th className="p-4 font-semibold">Description</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
                        {sections.map((section) => (
                            <tr key={section.id} className="hover:bg-zinc-800/30 transition-colors group cursor-pointer" onClick={() => openEditModal(section)}>
                                <td className="p-4 font-medium text-white">{section.title}</td>
                                <td className="p-4 text-zinc-400 line-clamp-2 max-w-xs truncate" title={section.prompt}>{section.prompt}</td>
                                <td className="p-4 text-zinc-500">{section.description}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); openEditModal(section); }} className="p-2 text-zinc-400 hover:text-blue-400 bg-zinc-900 rounded hover:bg-zinc-800">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={(e) => removeSection(section.id, e)} className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-900 rounded hover:bg-zinc-800">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sections.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-zinc-500">
                                    No categories defined.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


        </div>
      )}

      {activeTab === 'general' && (
        <div className="space-y-6 animate-in fade-in duration-300">
             <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
                <div className="flex items-center gap-3 text-blue-400">
                    <SettingsIcon />
                    <h2 className="text-lg font-semibold">AI Provider Settings</h2>
                </div>
                
                <p className="text-zinc-400 text-sm">
                    Choose which AI model to use for analysis.
                </p>

                <div className="flex gap-4 p-1 bg-zinc-950 rounded-lg w-fit border border-zinc-800">
                    <button 
                        onClick={() => setAiProvider('openai')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${aiProvider === 'openai' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                        OpenAI
                    </button>
                    <button 
                        onClick={() => setAiProvider('ollama')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${aiProvider === 'ollama' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                        Ollama (Local)
                    </button>
                </div>

                <form onSubmit={handleSaveKey} className="space-y-4 max-w-2xl mt-4">
                    {aiProvider === 'openai' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">OpenAI API Key</label>
                                <input 
                                    type="password" 
                                    placeholder="sk-..."
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                                />
                                <p className="text-xs text-zinc-600 mt-2">Leave empty to use system default key.</p>
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">OpenAI Model</label>
                                <select
                                    value={openaiModel}
                                    onChange={(e) => setOpenaiModel(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors appearance-none"
                                >
                                    <option value="gpt-4o">GPT-4o (Best)</option>
                                    <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                                    <option value="o1-preview">o1-preview (Reasoning)</option>
                                    <option value="o1-mini">o1-mini (Fast Reasoning)</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {aiProvider === 'ollama' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Ollama Base URL</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="http://localhost:11434"
                                        value={ollamaUrl}
                                        onChange={(e) => setOllamaUrl(e.target.value)}
                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleFetchModels}
                                        disabled={fetchingModels}
                                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {fetchingModels ? <Loader2 className="animate-spin" size={16} /> : 'Fetch Models'}
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-600 mt-2">
                                    If running inside Docker, use <code>http://host.docker.internal:11434</code> 
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Model Name</label>
                                {availableModels.length > 0 ? (
                                    <div className="flex gap-2">
                                        <select
                                            value={ollamaModel}
                                            onChange={(e) => setOllamaModel(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors appearance-none"
                                        >
                                            <option value="" disabled>Select a model</option>
                                            {availableModels.map(model => (
                                                <option key={model} value={model}>{model}</option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button"
                                            onClick={() => setAvailableModels([])}
                                            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg"
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
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors"
                                    />
                                )}
                                {availableModels.length === 0 && (
                                    <p className="text-xs text-zinc-600 mt-2">
                                        Click &quot;Fetch Models&quot; to scan for available local models.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-zinc-800">
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Report Language</label>
                        <select
                            value={reportLanguage}
                            onChange={(e) => setReportLanguage(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors appearance-none"
                        >
                            <option value="English">English</option>
                            <option value="Belarusian">Belarusian</option>
                            <option value="Russian">Russian</option>
                            <option value="Polish">Polish</option>
                            <option value="German">German</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                        </select>
                        <p className="text-xs text-zinc-600 mt-2">
                            AI will translate and generate reports in this language.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={keyLoading}
                        className={`px-6 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${aiProvider === 'openai' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-orange-600 hover:bg-orange-500'}`}
                    >
                        {keyLoading ? 'Saving...' : 'Save AI Settings'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-6 border border-red-900/30 bg-red-900/5 rounded-xl space-y-6">
                <div className="flex items-center gap-3 text-red-500">
                    <AlertTriangle />
                    <h2 className="text-lg font-semibold">Danger Zone</h2>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg bg-zinc-950">
                        <div>
                            <h3 className="font-medium text-zinc-200">Reset Application Data</h3>
                            <p className="text-sm text-zinc-500">Permanently delete all posts, reports, and generated insights.</p>
                        </div>
                         <button
                            onClick={handleReset}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 rounded-lg transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                            Delete Everything
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800">
                    <h3 className="text-xl font-bold text-white">
                        {editingSection ? 'Edit Category' : 'New Category'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Title</label>
                        <input 
                            autoFocus
                            value={sectionForm.title}
                            onChange={(e) => setSectionForm({...sectionForm, title: e.target.value})}
                            placeholder="e.g. 'Bug Reports'"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Prompt Instruction</label>
                        <textarea 
                            value={sectionForm.prompt}
                            onChange={(e) => setSectionForm({...sectionForm, prompt: e.target.value})}
                            placeholder="e.g. 'Identify all comments discussing bugs or crashes...'"
                            className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 resize-none transition-colors"
                        />
                        <p className="text-xs text-zinc-600 mt-2">The exact instruction given to the AI for this section.</p>
                    </div>
                     <div>
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Source Restriction (Optional)</label>
                        <select
                            value={sectionForm.sourceId}
                            onChange={(e) => setSectionForm({...sectionForm, sourceId: e.target.value})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors appearance-none"
                        >
                            <option value="">All Sources</option>
                            {sources.map(source => (
                                <option key={source.id} value={source.id}>{source.name} ({source.type})</option>
                            ))}
                        </select>
                        <p className="text-xs text-zinc-600 mt-2">Only analyze posts from this specific source.</p>
                    </div>
                     <div>
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">UI Description (Optional)</label>
                        <input 
                            value={sectionForm.description}
                            onChange={(e) => setSectionForm({...sectionForm, description: e.target.value})}
                            placeholder="e.g. 'List of reported issues'"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button onClick={saveSection} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-lg shadow-purple-900/20">
                        {editingSection ? 'Save Changes' : 'Create Category'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
