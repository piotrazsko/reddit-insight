'use client';

import { Loader2, CheckCircle2, XCircle, Brain, FileText, Languages, Save, Database } from 'lucide-react';
import type { ProgressUpdate } from '@/lib/ai/types';

interface AnalysisProgressProps {
  progress: ProgressUpdate | null;
  onClose?: () => void;
}

const stepIcons: Record<string, React.ElementType> = {
  fetch: Database,
  prepare: FileText,
  extract: Brain,
  translate: Languages,
  format: FileText,
  save: Save,
  done: CheckCircle2,
  error: XCircle,
};

const stepLabels: Record<string, string> = {
  fetch: 'Loading posts',
  prepare: 'Preparing data',
  extract: 'AI Analysis',
  translate: 'Translating',
  format: 'Formatting',
  save: 'Saving',
  done: 'Complete',
  error: 'Error',
};

const errorMessages: Record<string, string> = {
  timeout: 'AI model is too slow. Try a smaller model like llama3.2',
  no_posts: 'No posts to analyze. Try syncing data first.',
  generation_failed: 'Report generation failed. Check your AI settings.',
};

export function AnalysisProgress({ progress, onClose }: AnalysisProgressProps) {
  if (!progress) return null;

  const Icon = stepIcons[progress.step] || Loader2;
  const isLoading = !['done', 'error'].includes(progress.step);
  const isError = progress.step === 'error';
  const isDone = progress.step === 'done';
  const errorDescription = progress.error ? errorMessages[progress.error] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${
            isError ? 'bg-red-500/20' : 
            isDone ? 'bg-green-500/20' : 
            'bg-purple-500/20'
          }`}>
            <Icon 
              className={`w-6 h-6 ${
                isError ? 'text-red-400' : 
                isDone ? 'text-green-400' : 
                'text-purple-400'
              } ${isLoading ? 'animate-pulse' : ''}`} 
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-100">
              {stepLabels[progress.step]}
            </h3>
            <p className="text-sm text-zinc-400">
              {progress.message}
            </p>
          </div>
        </div>

        {/* Error description */}
        {isError && errorDescription && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-300">{errorDescription}</p>
          </div>
        )}

        {/* Progress bar for extract and translate steps */}
        {(progress.step === 'extract' || progress.step === 'translate') && progress.total && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-zinc-400 mb-2">
              <span>Section {progress.current} of {progress.total}</span>
              <span>{Math.round(((progress.current || 0) / progress.total) * 100)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${((progress.current || 0) / progress.total) * 100}%` }}
              />
            </div>
            {progress.sectionTitle && (
              <p className="text-xs text-zinc-500 mt-2">
                Current: {progress.sectionTitle}
              </p>
            )}
          </div>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Close button for errors */}
        {isError && onClose && (
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        )}

        {/* Pipeline steps indicator */}
        {!isError && (
          <div className="mt-6 flex justify-center gap-2">
            {['fetch', 'prepare', 'extract', 'translate', 'format', 'save'].map((step, idx) => {
              const steps = ['fetch', 'prepare', 'extract', 'translate', 'format', 'save'];
              const currentIdx = steps.indexOf(progress.step);
              const isCompleted = idx < currentIdx;
              const isCurrent = step === progress.step;
              
              return (
                <div 
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isCompleted ? 'bg-green-500' :
                    isCurrent ? 'bg-purple-500' :
                    'bg-zinc-700'
                  }`}
                  title={stepLabels[step]}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
