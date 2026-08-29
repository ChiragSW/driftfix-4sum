import React from 'react';

interface OverviewProps {
  setActiveTab: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ setActiveTab }) => {
  return (
    <div className="w-full flex flex-col gap-xl">
      {/* Hero Section */}
      <section className="border-b border-outline-variant pb-lg">
        <div className="inline-flex items-center gap-xs px-sm py-xs bg-primary/15 border border-primary rounded-none mb-md">
          <span className="material-symbols-outlined text-primary text-[14px]">memory</span>
          <span className="font-body-sm text-body-sm text-primary font-bold tracking-wide">
            Smart Dependency Migration Engine
          </span>
        </div>

        <h1 className="font-display text-display text-on-surface mb-md">
          Turn Stripe SDK Breaking Changes into Sourced, Sandbox-Tested Pull Requests.
        </h1>

        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-lg">
          Codex supplies local model reasoning through a read-only adapter while TrueForge orchestrates read-only MCP tools, parallel subagents, Daytona sandbox validation, and a human merge approval gate.
        </p>

        <div className="flex flex-wrap gap-md">
          <button
            onClick={() => setActiveTab('analyzer')}
            className="bg-primary-container text-on-primary-container font-label-md text-label-md px-md py-sm border border-primary-container hover:bg-inverse-primary transition-colors flex items-center gap-xs rounded-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
            Launch Migration Analyzer
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className="bg-transparent text-on-surface font-label-md text-label-md px-md py-sm border border-outline-variant hover:border-outline transition-colors flex items-center gap-xs rounded-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">troubleshoot</span>
            Test Impact Scout &amp; Fixer
          </button>
          <button
            onClick={() => setActiveTab('trueforge')}
            className="bg-transparent text-on-surface font-label-md text-label-md px-md py-sm border border-outline-variant hover:border-outline transition-colors flex items-center gap-xs rounded-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">route</span>
            View TrueForge Trace
          </button>
        </div>
      </section>

      {/* Summary Area */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <div className="bg-surface p-sm border border-outline-variant rounded-none flex flex-col gap-xs">
          <span className="font-label-md text-label-md text-on-surface-variant">Repository</span>
          <span className="font-code text-body-md text-on-surface truncate font-bold">driftfix-4sum</span>
        </div>
        <div className="bg-surface p-sm border border-outline-variant rounded-none flex flex-col gap-xs">
          <span className="font-label-md text-label-md text-on-surface-variant">Branch</span>
          <span className="font-code text-body-md text-on-surface truncate flex items-center gap-xs font-bold">
            <span className="material-symbols-outlined text-[14px]">call_split</span>
            driftfix/stripe-v15.6.0
          </span>
        </div>
        <div className="bg-surface p-sm border border-outline-variant rounded-none flex flex-col gap-xs">
          <span className="font-label-md text-label-md text-on-surface-variant">Target</span>
          <span className="font-code text-body-md text-on-surface truncate font-bold">stripe-python</span>
        </div>
        <div className="bg-surface p-sm border border-outline-variant rounded-none flex flex-col gap-xs">
          <span className="font-label-md text-label-md text-on-surface-variant">Migration</span>
          <span className="font-code text-body-md text-primary truncate font-bold">v14.3.0 → v15.6.0</span>
        </div>
      </section>

      {/* Test Sandbox Results */}
      <section>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Test Sandbox Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sm">
          {/* Baseline */}
          <div className="bg-surface border-l-4 border-l-secondary border border-outline-variant p-md rounded-none">
            <div className="flex items-center gap-xs mb-xs">
              <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase font-bold">Baseline</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface font-bold">Tests Passed: 7/7</p>
            <p className="font-code text-body-sm text-on-surface-variant mt-xs opacity-75">(All green on 14.3.0)</p>
          </div>

          {/* Impact */}
          <div className="bg-surface border-l-4 border-l-error border border-outline-variant p-md rounded-none">
            <div className="flex items-center gap-xs mb-xs">
              <span className="material-symbols-outlined text-error text-[16px]">cancel</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase font-bold">Impact</span>
            </div>
            <p className="font-body-md text-body-md text-error font-bold">Tests Failed: 7/7</p>
            <p className="font-code text-body-sm text-on-surface-variant mt-xs opacity-75">(Raw v15 bump)</p>
          </div>

          {/* Resolution */}
          <div className="bg-surface border-l-4 border-l-secondary border border-outline-variant p-md rounded-none relative overflow-hidden">
            <div className="absolute inset-0 bg-secondary/5 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-xs mb-xs">
                <span className="material-symbols-outlined text-secondary text-[16px]">build_circle</span>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase font-bold">Resolution</span>
              </div>
              <p className="font-body-md text-body-md text-secondary font-bold">Tests Passed: 7/7</p>
              <p className="font-code text-body-sm text-on-surface-variant mt-xs">(Patched v15.6.0)</p>
            </div>
          </div>

          {/* Outcome */}
          <div className="bg-surface border border-outline-variant p-md rounded-none relative">
            <div className="flex items-center justify-between mb-xs">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[16px]">merge</span>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase font-bold">Outcome</span>
              </div>
              <span className="bg-primary/20 text-primary font-code text-[10px] px-1 py-0.5 border border-primary/30 font-bold">
                READY
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface font-bold">Draft PR: #1</p>
            <p className="font-code text-body-sm text-on-surface-variant mt-xs">(Merged after approval)</p>
          </div>
        </div>
      </section>
    </div>
  );
};
