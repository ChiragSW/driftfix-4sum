import React from 'react';

interface OverviewProps {
  setActiveTab: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ setActiveTab }) => {
  return (
    <div className="w-full flex flex-col gap-8 animate-fadeIn">
      {/* Hero Section */}
      <section className="border-b border-[#30363d] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8957e5]/15 border border-[#8957e5]/40 text-[#d3bbff] rounded text-xs font-semibold mb-4">
          <span className="material-symbols-outlined text-[16px] text-[#d3bbff]">memory</span>
          <span>Smart Dependency Migration Engine</span>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#dfe2eb] leading-tight mb-4">
          Turn Stripe SDK Breaking Changes into Sourced, Sandbox-Tested Pull Requests.
        </h1>

        <p className="text-base md:text-lg text-[#8b949e] max-w-3xl leading-relaxed mb-6 font-normal">
          Codex supplies local model reasoning through a read-only adapter while TrueForge orchestrates read-only MCP tools, parallel subagents, Daytona sandbox validation, and a human merge approval gate.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('analyzer')}
            className="bg-[#8957e5] hover:bg-[#713dcc] text-white px-5 py-2.5 rounded font-medium shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            Launch Migration Analyzer
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className="bg-[#181c22] border border-[#30363d] hover:border-[#8b949e] text-[#dfe2eb] px-5 py-2.5 rounded font-medium flex items-center gap-2 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">troubleshoot</span>
            Test Impact Scout &amp; Fixer
          </button>
          <button
            onClick={() => setActiveTab('trueforge')}
            className="bg-[#181c22] border border-[#30363d] hover:border-[#8b949e] text-[#dfe2eb] px-5 py-2.5 rounded font-medium flex items-center gap-2 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">route</span>
            View TrueForge Trace
          </button>
        </div>
      </section>

      {/* Summary 4-Box Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181c22] p-4 border border-[#30363d] rounded flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Repository</span>
          <span className="font-mono text-sm text-[#dfe2eb] font-semibold truncate">driftfix-4sum</span>
        </div>
        <div className="bg-[#181c22] p-4 border border-[#30363d] rounded flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Branch</span>
          <span className="font-mono text-sm text-[#dfe2eb] font-semibold truncate flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#8b949e]">call_split</span>
            driftfix/stripe-v15.6.0
          </span>
        </div>
        <div className="bg-[#181c22] p-4 border border-[#30363d] rounded flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Target</span>
          <span className="font-mono text-sm text-[#dfe2eb] font-semibold truncate">stripe-python</span>
        </div>
        <div className="bg-[#181c22] p-4 border border-[#30363d] rounded flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Migration</span>
          <span className="font-mono text-sm text-[#d3bbff] font-bold truncate">v14.3.0 → v15.6.0</span>
        </div>
      </section>

      {/* Test Sandbox Results */}
      <section>
        <h2 className="text-xl md:text-2xl font-bold text-[#dfe2eb] mb-4">Test Sandbox Results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Baseline */}
          <div className="bg-[#181c22] border-l-4 border-l-[#7bdb80] border border-[#30363d] p-5 rounded">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#7bdb80] text-[18px]">check_circle</span>
              <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Baseline</span>
            </div>
            <p className="text-base font-semibold text-[#dfe2eb]">Tests Passed: 7/7</p>
            <p className="font-mono text-xs text-[#8b949e] mt-1">(All green on 14.3.0)</p>
          </div>

          {/* Impact */}
          <div className="bg-[#181c22] border-l-4 border-l-[#ffb4ab] border border-[#30363d] p-5 rounded">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#ffb4ab] text-[18px]">cancel</span>
              <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Impact</span>
            </div>
            <p className="text-base font-semibold text-[#ffb4ab]">Tests Failed: 7/7</p>
            <p className="font-mono text-xs text-[#8b949e] mt-1">(Raw v15 bump)</p>
          </div>

          {/* Resolution */}
          <div className="bg-[#181c22] border-l-4 border-l-[#7bdb80] border border-[#30363d] p-5 rounded relative overflow-hidden">
            <div className="absolute inset-0 bg-[#7bdb80]/5 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#7bdb80] text-[18px]">build_circle</span>
                <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Resolution</span>
              </div>
              <p className="text-base font-bold text-[#7bdb80]">Tests Passed: 7/7</p>
              <p className="font-mono text-xs text-[#8b949e] mt-1">(Patched v15.6.0)</p>
            </div>
          </div>

          {/* Outcome */}
          <div className="bg-[#181c22] border border-[#30363d] p-5 rounded relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d3bbff] text-[18px]">merge</span>
                <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Outcome</span>
              </div>
              <span className="bg-[#8957e5]/20 text-[#d3bbff] font-mono text-[10px] font-bold px-2 py-0.5 border border-[#8957e5]/40 rounded">
                READY
              </span>
            </div>
            <p className="text-base font-bold text-[#dfe2eb]">Draft PR: #1</p>
            <p className="font-mono text-xs text-[#8b949e] mt-1">(Merged after approval)</p>
          </div>
        </div>
      </section>
    </div>
  );
};
