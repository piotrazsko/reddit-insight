'use client';

import { useState } from 'react';
import { RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import type { ProgressUpdate } from '@/lib/ai/types';

export default function ActionButtons() {
  const router = useRouter();
  
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);

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
    setProgress({ step: 'fetch', message: 'Starting analysis...' });
    
    try {
      const eventSource = new EventSource('/api/analyze/stream');
      
      eventSource.onmessage = (event) => {
        const data: ProgressUpdate = JSON.parse(event.data);
        setProgress(data);
        
        if (data.step === 'done' && data.reportId) {
          eventSource.close();
          setAnalyzing(false);
          setProgress(null);
          toast.success('Report generated!');
          router.push(`/reports/${data.reportId}`);
        }
        
        // Keep progress modal open for errors - user will close it
        if (data.step === 'error') {
          eventSource.close();
          setAnalyzing(false);
          // Don't clear progress - show error in modal
        }
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        setAnalyzing(false);
        setProgress({ step: 'error', message: 'Connection lost', error: 'generation_failed' });
      };
      
    } catch (e) {
      console.error(e);
      setAnalyzing(false);
      setProgress({ step: 'error', message: 'Analysis failed', error: 'generation_failed' });
    }
  };

  const handleCloseProgress = () => {
    setProgress(null);
    setAnalyzing(false);
  };

  return (
    <>
      {progress && <AnalysisProgress progress={progress} onClose={handleCloseProgress} />}
      
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
    </>
  );
}
