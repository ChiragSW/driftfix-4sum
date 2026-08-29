import React from 'react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantRing: Record<string, string> = {
  default: 'border-slate-800',
  success: 'border-emerald-800/40',
  warning: 'border-amber-800/40',
  error:   'border-rose-800/40',
  info:    'border-indigo-800/40',
};

const variantIcon: Record<string, string> = {
  default: 'bg-slate-800 text-slate-300',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  error:   'bg-rose-500/10 text-rose-400',
  info:    'bg-indigo-500/10 text-indigo-400',
};

const trendColor: Record<string, string> = {
  up:      'text-emerald-400',
  down:    'text-rose-400',
  neutral: 'text-slate-400',
};

export const StatCard: React.FC<StatCardProps> = ({
  label, value, subValue, icon, trend = 'neutral', variant = 'default', className
}) => (
  <div className={clsx(
    'bg-slate-900/70 border rounded-xl p-5 flex items-start gap-4',
    variantRing[variant],
    className
  )}>
    {icon && (
      <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', variantIcon[variant])}>
        {icon}
      </div>
    )}
    <div className="min-w-0">
      <p className="text-xs text-slate-400 font-medium truncate">{label}</p>
      <p className="text-2xl font-extrabold text-white mt-0.5 font-mono">{value}</p>
      {subValue && (
        <p className={clsx('text-xs mt-0.5 font-medium', trendColor[trend])}>
          {trend === 'up' && '↑ '}
          {trend === 'down' && '↓ '}
          {subValue}
        </p>
      )}
    </div>
  </div>
);
