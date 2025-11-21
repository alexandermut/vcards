import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { ScanJob, Language } from '../types';
import { translations } from '../utils/translations';

interface QueueIndicatorProps {
  queue: ScanJob[];
  lang: Language;
}

export const QueueIndicator: React.FC<QueueIndicatorProps> = ({ queue, lang }) => {
  const t = translations[lang];
  const pending = queue.filter(j => j.status === 'pending').length;
  const processing = queue.filter(j => j.status === 'processing').length;
  const errors = queue.filter(j => j.status === 'error').length;

  if (queue.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 animate-in slide-in-from-right-4 fade-in">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg p-3 flex items-center gap-3 min-w-[200px]">
        
        <div className="relative">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            {processing > 0 ? <Loader2 size={20} className="animate-spin" /> : <Layers size={20} />}
          </div>
          {errors > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-0.5">
            {t.batchQueue}
          </p>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col">
             {processing > 0 && <span>{t.processing} (1)</span>}
             {pending > 0 && <span>{t.waiting}: {pending}</span>}
             {errors > 0 && <span className="text-red-500">{errors} {t.errors}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};