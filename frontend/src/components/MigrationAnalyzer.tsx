import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Search, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  RefreshCw
} from 'lucide-react';
import { ApiService } from '../services/api';
import { StripeRelease, MigrationReport } from '../types';

export const MigrationAnalyzer: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<string>('14.3.0');
  const [latestRelease, setLatestRelease] = useState<StripeRelease | null>(null);
  const [report, setReport] = useState<MigrationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeWorkflowNode, setActiveWorkflowNode] = useState<number>(-1);

  const loadReleaseData = async () => {
    const rel = await ApiService.getLatestRelease();
    setLatestRelease(rel);
  };

  useEffect(() => {
    loadReleaseData();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setReport(null);
    setActiveWorkflowNode(0);

    // Simulate LangGraph step timings for clean visual inspection
    const nodeSequence = [0, 1, 2, 3, 4];
    for (const step of nodeSequence) {
      setActiveWorkflowNode(step);
      await new Promise(r => setTimeout(r, 200));
    }

    const res = await ApiService.analyzeUpgrade(currentVersion);
    setReport(res);
    setLoading(false);
  };

  const workflowNodes = [
    { id: 'validate_request', label: '1. Validate Request', desc: 'Validates semantic version format' },
    { id: 'fetch_latest_release', label: '2. Fetch Latest Release', desc: 'Scans official stripe/stripe-python GitHub releases' },
    { id: 'fetch_guidance', label: '3. Fetch Guidance', desc: 'Retrieves CHANGELOG.md & Wiki migration guide' },
    { id: 'extract_changes', label: '4. Extract Breaking Changes', desc: 'Parses Markdown headings and warning tags' },
    { id: 'build_report', label: '5. Build Report', desc: 'Generates structured MigrationReport' }
  ];

  return (
    <div className="space-y-6">
      {/* Title / Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            Deterministic Stripe Migration MCP Analyzer
          </h2>
          <p className="text-xs text-slate-400">
            Official read-only MCP tool backend backed by LangGraph 5-node deterministic workflow.
          </p>
        </div>
        <button
          onClick={loadReleaseData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Official Releases
        </button>
      </div>

      {/* Release Banner & Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Latest Release Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Latest Stable Stripe Release
            </span>
            <span className="text-emerald-400 font-mono font-bold">Official GitHub</span>
          </div>
          {latestRelease ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white font-mono">{latestRelease.version}</span>
                <span className="text-xs text-slate-400">(Major {latestRelease.major})</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(latestRelease.published_at).toLocaleDateString()}
                </span>
                <a
                  href={latestRelease.release_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  View Tag <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="animate-pulse h-12 bg-slate-800 rounded mt-2"></div>
          )}
        </div>

        {/* Current Version Input Card */}
        <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Installed / Target Upgrade Version (e.g. demo_target v14.3.0):
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={currentVersion}
                  onChange={(e) => setCurrentVersion(e.target.value)}
                  placeholder="e.g. 14.3.0"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Analyze Upgrade
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
            <span>Quick presets:</span>
            <button onClick={() => setCurrentVersion('14.3.0')} className="text-indigo-400 hover:underline">14.3.0 (v14 Demo)</button>
            <span>•</span>
            <button onClick={() => setCurrentVersion('15.6.0')} className="text-indigo-400 hover:underline">15.6.0 (Current Major)</button>
            <span>•</span>
            <button onClick={() => setCurrentVersion('13.0.0')} className="text-indigo-400 hover:underline">13.0.0 (Legacy)</button>
          </div>
        </div>
      </div>

      {/* LangGraph Pipeline Visualizer */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          LangGraph Workflow Execution Pipeline
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {workflowNodes.map((node, idx) => {
            const isActive = activeWorkflowNode === idx;
            const isCompleted = report !== null || activeWorkflowNode > idx;
            return (
              <div 
                key={node.id}
                className={`p-2.5 rounded-lg border text-xs transition-all ${
                  isActive 
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-500/20 text-white ring-1 ring-indigo-500'
                    : isCompleted 
                    ? 'bg-slate-900 border-emerald-900/50 text-slate-300'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1 font-semibold">
                  <span>{node.label}</span>
                  {isCompleted && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{node.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Migration Report Output */}
      {report && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl animate-fadeIn">
          {/* Header Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                report.status === 'upgrade_available'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : report.status === 'up_to_date'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {report.status.replace('_', ' ')}
              </div>
              <div className="text-sm font-mono text-slate-300">
                Current: <span className="text-white font-bold">{report.current_version}</span> → Target: <span className="text-emerald-400 font-bold">{report.target_version || 'N/A'}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              MCP tool: <code className="text-indigo-300">analyze_stripe_python_upgrade</code>
            </div>
          </div>

          {/* Breaking Changes */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Sourced Breaking Changes & Migration Guides ({report.breaking_changes.length})
            </h3>
            
            {report.breaking_changes.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
                No breaking changes detected for this version jump.
              </div>
            ) : (
              <div className="space-y-3">
                {report.breaking_changes.map((bc, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-indigo-200">
                        {bc.title}
                      </h4>
                      <a
                        href={bc.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-mono bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40"
                      >
                        Official Source <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {bc.summary}
                    </p>
                    
                    {bc.search_hints.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-400">Search hints (Impact Scout):</span>
                        {bc.search_hints.map((hint, hIdx) => (
                          <span 
                            key={hIdx}
                            className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-xs border border-slate-700"
                          >
                            {hint}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warnings */}
          {report.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30">
              <h4 className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Workflow Notices
              </h4>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                {report.warnings.map((warn, wIdx) => (
                  <li key={wIdx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
