import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  GitPullRequest, 
  Layers, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SummaryStats } from './SummaryStats';
import { VersionHistory } from './VersionHistory';
import { DemoOrchestrator } from './DemoOrchestrator';

interface OverviewProps {
  setActiveTab: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ setActiveTab }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-slate-950 border border-slate-700/80 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Smart Dependency Migration Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
            Turn Stripe SDK Breaking Changes into{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Sourced, Sandbox-Tested Pull Requests
            </span>.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-6">
            Codex supplies local model reasoning via an OpenAI-compatible adapter; TrueForge
            orchestrates MCP read-only tools, parallel subagents (Impact Scout & Migration
            Reviewer), Daytona sandboxed pytest validation, and a human merge approval checkpoint.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab('analyzer')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all text-sm"
            >
              <Zap className="w-4 h-4" />
              Launch Migration Analyzer
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all text-sm"
            >
              Test Impact Scout & Fixer
            </button>
            <button
              onClick={() => setActiveTab('trueforge')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-700/50 font-semibold transition-all text-sm"
            >
              <GitPullRequest className="w-4 h-4" />
              View TrueForge Trace
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <SummaryStats />

      {/* Demo Orchestrator */}
      <DemoOrchestrator setActiveTab={setActiveTab} />

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Local Codex Adapter</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Runs <code className="text-slate-300">codex exec</code> in read-only ephemeral sandboxes
            on port 8765. Zero OpenAI Platform API billing required.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Read-Only MCP Server</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            LangGraph 5-node state workflow querying official GitHub releases & Markdown changelog
            / Wiki migration guides.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Daytona Sandbox Gate</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deterministic verification: 7 tests pass on v14 → 7 fail after v15 dependency
            bump → 7 pass after <code className="text-slate-300">.to_dict()</code> fix.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Human Approval Merge</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Draft PR created on a feature branch. Strict TrueForge checkpoint blocks
            merge to <code className="text-slate-300">main</code> until human clicks Allow.
          </p>
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          System Architecture & Execution Pipeline
        </h2>
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
          <pre>{`User Request: "Upgrade demo_target to latest stripe-python release"
   │
   ▼
[ TrueForge Agent Harness (Port 8790) ]
   ├── (1) Model Reasoning ─────────► [ Local Codex Provider (Port 8765/v1) ]
   │                                     └─► codex exec --ephemeral --sandbox read-only
   │
   ├── (2) MCP Discovery Tool ──────► [ DriftFix MCPServer (Port 8000/mcp) ]
   │                                     └─► LangGraph: fetch GitHub release & Wiki guide
   │                                     └─► Returns MigrationReport (v14.3.0 -> v15.6.0)
   │
   ├── (3) Parallel Subagents ──────► • [ Impact Scout ] : Scans .get(), .keys(), dict()
   │                                  • [ Migration Reviewer ] : Validates citations
   │
   ├── (4) Sandboxed Verification ──► [ Daytona Sandbox Runner ]
   │                                     ├─ Baseline v14:  ✅ 7/7 tests passed
   │                                     ├─ Raw v15 bump:  ❌ 7/7 tests failed (AttributeError)
   │                                     └─ Patched v15:   ✅ 7/7 tests passed (.to_dict())
   │
   └── (5) GitHub & Checkpoint ─────► [ GitHub Connector ] -> Create branch & Draft PR
                                         └─► [ Human Merge Checkpoint ] -> ALLOW / DENY`}
          </pre>
        </div>
      </div>

      {/* Stripe version timeline */}
      <VersionHistory />
    </div>
  );
};
