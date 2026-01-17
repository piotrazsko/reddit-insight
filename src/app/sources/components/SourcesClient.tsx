'use client';

import { useState } from 'react';
import { Trash2, Plus, Loader2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Source {
  id: string;
  name: string;
  type: string;
  active: boolean;
  _count: {
    posts: number;
  };
}

export default function SourcesClient({ initialSources }: { initialSources: Source[] }) {
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [newSource, setNewSource] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource) return;

    setLoading(true);
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSource, type: 'reddit' }),
      });
      
      if (res.ok) {
        const source = await res.json();
        setSources([source, ...sources]);
        setNewSource('');
        router.refresh();
        toast.success(`r/${source.name} added successfully`);
      } else {
        toast.error('Failed to add source');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error adding source');
    } finally {
      setLoading(false);
    }
  };

  const removeSource = async (id: string) => {
    if (!confirm('Are you sure? This will delete the source and all its collected posts.')) return;

    try {
      const res = await fetch(`/api/sources?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSources(sources.filter((s) => s.id !== id));
        router.refresh();
        toast.success('Source deleted');
      } else {
        toast.error('Failed to delete source');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting source');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Sources</h1>
        <p className="text-zinc-500 mt-2">Manage your data pipelines</p>
      </div>

      {/* Add Source Form */}
      <form onSubmit={addSource} className="flex gap-2">
        <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
                <span className="font-bold">r/</span>
            </div>
            <input
            type="text"
            placeholder="subreddit"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            className="w-full pl-8 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
            />
        </div>
        <button
          type="submit"
          disabled={loading || !newSource}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          Add
        </button>
      </form>

      <div className="grid gap-4">
        {sources.map((source) => (
            <div key={source.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  source.active ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <div>
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-zinc-200">{source.name}</h2>
                    <a 
                        href={`https://www.reddit.com/r/${source.name}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-zinc-500 hover:text-blue-400 transition-colors p-1"
                        title={`Open r/${source.name}`}
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider flex gap-2">
                   <span>{source.type}</span>
                   <span>•</span>
                   <span>{source._count?.posts || 0} posts</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeSource(source.id)}
              className="p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Delete Source"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        
        {sources.length === 0 && (
            <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                No sources added yet.
            </div>
        )}
      </div>
    </div>
  );
}
