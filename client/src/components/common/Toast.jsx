import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const config = {
    success: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
    error: {
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: AlertCircle,
      iconColor: 'text-rose-500',
    },
    info: {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
      icon: Info,
      iconColor: 'text-indigo-500',
    },
  };

  const current = config[type] || config.info;
  const Icon = current.icon;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-5 duration-300 ${current.bg}`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${current.iconColor}`} />
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

