import React from 'react';

interface SideRepoBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SideRepoBar: React.FC<SideRepoBarProps> = ({ setActiveTab }) => {
  return (
    <aside className="hidden lg:flex flex-col gap-xs p-sm bg-surface-container-low dark:bg-surface-container-low border-r border-outline-variant fixed left-0 top-16 h-[calc(100vh-4rem)] w-[260px] z-40">
      <div className="mb-lg px-sm py-xs">
        <div className="flex items-center gap-sm mb-xs">
          <img 
            className="w-6 h-6 rounded-sm border border-outline-variant object-cover" 
            alt="driftfix-4sum emblem" 
            src="/assets/org_avatar.png" 
          />
          <h2 className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">driftfix-4sum</h2>
        </div>
        <p className="font-code text-body-sm text-on-surface-variant leading-tight">Sourced Stripe Python Migration Engine</p>
      </div>

      <nav className="flex flex-col gap-base">
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-sm font-code text-body-sm bg-primary-container text-on-primary-container font-bold border-l-2 border-primary px-md py-sm scale-[0.98] w-full text-left cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">folder</span>
          <span>driftfix-4sum</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className="flex items-center gap-sm font-code text-body-sm text-on-surface-variant hover:bg-surface-variant px-md py-sm transition-colors w-full text-left cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">fork_right</span>
          <span className="truncate">driftfix/stripe-v15.6.0</span>
        </button>
      </nav>

      <div className="mt-auto p-sm">
        <div className="bg-surface-container p-sm border border-outline-variant rounded-none">
          <div className="text-label-md text-on-surface mb-xs flex items-center gap-xs font-bold">
            <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>
            System Status
          </div>
          <div className="text-[10px] text-on-surface-variant font-mono">All engines operational. Drift tolerance at 0%.</div>
        </div>
      </div>
    </aside>
  );
};
