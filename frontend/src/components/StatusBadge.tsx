import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  error:   'bg-rose-500/10   text-rose-400   border-rose-500/30',
  info:    'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  neutral: 'bg-slate-700/50  text-slate-300  border-slate-700',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

const dotStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error:   'bg-rose-400',
  info:    'bg-indigo-400',
  neutral: 'bg-slate-400',
  pending: 'bg-amber-400',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  pulse = false,
  className
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider',
        variantStyles[variant],
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', dotStyles[variant], pulse && 'animate-pulse')} />
      {label}
    </span>
  );
};
