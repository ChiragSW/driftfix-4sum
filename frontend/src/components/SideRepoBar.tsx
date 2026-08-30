import React from 'react';

interface SideRepoBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SideRepoBar: React.FC<SideRepoBarProps> = ({ setActiveTab }) => {
  return (
    <aside className="hidden lg:flex flex-col w-[260px] shrink-0 bg-[#181c22] border-r border-[#30363d] p-4 gap-4">
      {/* Repo Org Header */}
      <div className="pb-3 border-b border-[#30363d]/60">
        <div className="flex items-center gap-2.5 mb-1.5">
          <img 
            className="w-7 h-7 rounded border border-[#30363d] object-cover bg-[#10141a]" 
            alt="driftfix-4sum emblem" 
            src="/assets/org_avatar.png" 
          />
          <h2 className="font-headline-sm text-base text-[#dfe2eb] font-bold tracking-tight truncate">
            driftfix-4sum
          </h2>
        </div>
        <p className="text-xs text-[#8b949e] leading-snug font-mono">
          Sourced Stripe Python Migration Engine
        </p>
      </div>

      {/* Nav List */}
      <nav className="flex flex-col gap-1.5 font-mono text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2.5 bg-[#8957e5] text-white font-semibold px-3 py-2 rounded transition w-full text-left shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">folder</span>
          <span className="truncate">driftfix-4sum</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className="flex items-center gap-2.5 text-[#8b949e] hover:text-[#dfe2eb] hover:bg-[#262a31] px-3 py-2 rounded transition w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">fork_right</span>
          <span className="truncate">driftfix/stripe-v15.6.0</span>
        </button>
      </nav>

      {/* System Status Docked at Bottom */}
      <div className="mt-auto pt-4">
        <div className="bg-[#1c2026] p-3 border border-[#30363d] rounded">
          <div className="text-xs font-semibold text-[#dfe2eb] mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#7bdb80]">check_circle</span>
            System Status
          </div>
          <div className="text-[11px] text-[#8b949e] font-mono leading-relaxed">
            All engines operational. Drift tolerance at 0%.
          </div>
        </div>
      </div>
    </aside>
  );
};
