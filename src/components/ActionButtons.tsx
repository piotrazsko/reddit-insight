'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ActionButtons() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading('Syncing data...');
    try {
        const res = await fetch('/api/sync', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            toast.success(`Synced ${data.totalNew} new posts!`, { id: toastId });
            router.refresh();
        } else {
            toast.error('Sync failed. Check console.', { id: toastId });
        }
    } catch (e) {
        console.error(e);
        toast.error('Sync failed due to network error.', { id: toastId });
    } finally {
        setSyncing(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const toastId = toast.loading('Generating report...');
    try {
        const res = await fetch('/api/analyze', { method: 'POST' });
        const data = await res.json();
        
        if (res.status === 404) {
            toast.warning('No recent posts found to analyze. Try syncing data first!', { id: toastId });
        } else if (!res.ok) {
            toast.error(`Analysis failed: ${data.message || 'Unknown error'}`, { id: toastId });
        } else {
             // Success - redirect to report
             const reportId = data.report.id;
             toast.success('Analysis generated successfully!', { id: toastId });
             router.push(`/reports/${reportId}`);
        }

    } catch (e) {
        console.error(e);
        toast.error('Analysis failed.', { id: toastId });
    } finally {
        setAnalyzing(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleSync}
        disabled={syncing || analyzing}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {syncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
        Sync Data
      </button>
      
      <button
        onClick={handleAnalyze}
        disabled={syncing || analyzing}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {analyzing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
        Generate Report
      </button>
    </div>
  );
}
