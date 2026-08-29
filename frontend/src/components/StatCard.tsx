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
  default: 'border-outline-variant',
  success: 'border-secondary/40',
  warning: 'border-tertiary/40',
  error:   'border-error/40',
  info:    'border-primary/40',
};

const variantIcon: Record<string, string> = {
  default: 'bg-surface-container text-on-surface-variant',
  success: 'bg-secondary-container/20 text-secondary',
  warning: 'bg-tertiary-container/20 text-tertiary',
  error:   'bg-error-container/20 text-error',
  info:    'bg-primary-container/20 text-primary',
};

const trendColor: Record<string, string> = {
  up:      'text-secondary',
  down:    'text-error',
  neutral: 'text-outline',
};

export const StatCard: React.FC<StatCardProps> = ({
  label, value, subValue, icon, trend = 'neutral', variant = 'default', className
}) => (
  <div className={clsx(
    'bg-surface-container-low border rounded-xl p-4 flex items-start gap-3.5',
    variantRing[variant],
    className
  )}>
    {icon && (
      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', variantIcon[variant])}>
        {icon}
      </div>
    )}
    <div className="min-w-0">
      <p className="text-xs text-on-surface-variant font-mono font-medium truncate">{label}</p>
      <p className="text-xl font-bold text-on-surface mt-0.5 font-mono">{value}</p>
      {subValue && (
        <p className={clsx('text-[11px] mt-0.5 font-mono font-medium', trendColor[trend])}>
          {trend === 'up' && '↑ '}
          {trend === 'down' && '↓ '}
          {subValue}
        </p>
      )}
    </div>
  </div>
);
