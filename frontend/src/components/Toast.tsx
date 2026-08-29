import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import clsx from 'clsx';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  error:   <XCircle className="w-4 h-4 text-rose-400" />,
  info:    <Info className="w-4 h-4 text-indigo-400" />,
};

const borderMap: Record<ToastType, string> = {
  success: 'border-emerald-500/30',
  warning: 'border-amber-500/30',
  error:   'border-rose-500/30',
  info:    'border-indigo-500/30',
};

interface SingleToastProps extends ToastMessage {
  onDismiss: (id: string) => void;
}

const SingleToast: React.FC<SingleToastProps> = ({
  id, type, title, description, durationMs = 4000, onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), durationMs);
    return () => clearTimeout(timer);
  }, [id, durationMs, onDismiss]);

  return (
    <div className={clsx(
      'flex items-start gap-3 min-w-[280px] max-w-sm w-full bg-slate-900',
      'border rounded-xl p-4 shadow-2xl animate-slideIn',
      borderMap[type]
    )}>
      <div className="mt-0.5 shrink-0">{iconMap[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 text-slate-500 hover:text-white transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      {toasts.map(t => (
        <SingleToast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

/** Hook to manage toast queue */
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = (msg: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...msg, id }]);
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, push, dismiss };
}
