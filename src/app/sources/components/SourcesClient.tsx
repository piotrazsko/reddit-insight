'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { SourceCard } from '@/components/SourceCard';
import { AddSourceForm } from '@/components/AddSourceForm';

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

  const addSource = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [newSource, sources, router]
  );

  const removeSource = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure? This will delete the source and all its collected posts.')) {
        return;
      }

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
    },
    [sources, router]
  );

  return (
    <div className="space-y-8">
      <PageHeader title="Sources" description="Manage your data pipelines" />

      <AddSourceForm
        value={newSource}
        onChange={setNewSource}
        onSubmit={addSource}
        loading={loading}
      />

      <div className="grid gap-4">
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            id={source.id}
            name={source.name}
            type={source.type}
            active={source.active}
            postsCount={source._count?.posts || 0}
            onDelete={removeSource}
          />
        ))}

        {sources.length === 0 && <EmptyState message="No sources added yet." dashed />}
      </div>
    </div>
  );
}
