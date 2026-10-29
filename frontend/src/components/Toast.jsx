import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { type = 'info', message, title } = toast;

  const styles = {
    success: {
      bg: 'bg-emerald-950/90 text-emerald-100 border-emerald-700/60 shadow-glow-emerald',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
      titleColor: 'text-white font-semibold',
    },
    error: {
      bg: 'bg-rose-950/90 text-rose-100 border-rose-700/60 shadow-glow-red',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
      titleColor: 'text-white font-semibold',
    },
    info: {
      bg: 'bg-slate-900/90 text-slate-100 border-slate-700/60 shadow-glow-indigo',
      icon: <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />,
      titleColor: 'text-white font-semibold',
    },
  }[type] || {
    bg: 'bg-slate-900/90 text-slate-100 border-slate-700/60 shadow-lg',
    icon: <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />,
    titleColor: 'text-white font-semibold',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-sm w-full">
      <div className={`flex items-start space-x-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${styles.bg}`}>
        {styles.icon}
        <div className="flex-1 pr-2">
          {title && <div className={`text-sm ${styles.titleColor}`}>{title}</div>}
          <div className="text-xs text-slate-200 mt-0.5 leading-relaxed">{message}</div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white rounded-lg p-1 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
