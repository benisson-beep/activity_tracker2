import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useActivity } from '../../context/ActivityContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useActivity();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md text-xs font-semibold animate-slide-up transition-all ${
            t.type === 'success'
              ? 'bg-slate-900/95 text-white border-emerald-500/40'
              : t.type === 'error'
              ? 'bg-rose-950/95 text-rose-200 border-rose-800'
              : 'bg-slate-900/95 text-slate-200 border-slate-700'
          }`}
        >
          {t.type === 'success' && <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />}
          {t.type === 'error' && <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />}
          {t.type === 'info' && <Info size={15} className="text-blue-400 flex-shrink-0" />}

          <span className="truncate max-w-xs">{t.message}</span>

          <button
            onClick={() => dismissToast(t.id)}
            className="text-slate-400 hover:text-white p-0.5 ml-1"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};
