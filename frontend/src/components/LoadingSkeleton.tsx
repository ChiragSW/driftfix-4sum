import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

/** Generic shimmering skeleton for async content areas */
export const Skeleton: React.FC<SkeletonProps> = ({ className, height = 'h-4' }) => (
  <div
    className={clsx(
      'animate-pulse rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]',
      height,
      className
    )}
    style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}
  />
);

/** A card-shaped skeleton for the release card */
export const ReleaseSkeleton: React.FC = () => (
  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 animate-pulse">
    <Skeleton height="h-3" className="w-1/3" />
    <Skeleton height="h-8" className="w-1/2" />
    <div className="flex gap-4">
      <Skeleton height="h-3" className="w-24" />
      <Skeleton height="h-3" className="w-20" />
    </div>
  </div>
);

/** Skeleton for a breaking-change list */
export const ReportSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    {[0, 1, 2].map(i => (
      <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
        <Skeleton height="h-4" className={clsx(i === 0 ? 'w-3/4' : 'w-2/3')} />
        <Skeleton height="h-3" className="w-full" />
        <Skeleton height="h-3" className="w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton height="h-5" className="w-16 rounded" />
          <Skeleton height="h-5" className="w-16 rounded" />
        </div>
      </div>
    ))}
  </div>
);
