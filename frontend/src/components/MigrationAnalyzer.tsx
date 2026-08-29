import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { StripeRelease, MigrationReport } from '../types';

export const MigrationAnalyzer: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<string>('14.3.0');
  const [latestRelease, setLatestRelease] = useState<StripeRelease | null>(null);
  const [report, setReport] = useState<MigrationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeWorkflowNode, setActiveWorkflowNode] = useState<number>(-1);
  const [versionError, setVersionError] = useState<string | null>(null);

  const loadReleaseData = async () => {
    const rel = await ApiService.getLatestRelease();
    setLatestRelease(rel);
  };

  useEffect(() => {
    loadReleaseData();
  }, []);

  const handleAnalyze = async () => {
    const normalizedVersion = currentVersion.trim();
    if (!/^\d+\.\d+\.\d+$/.test(normalizedVersion)) {
      setVersionError('Enter a semantic version such as 14.3.0.');
      return;
    }

    setVersionError(null);
    setCurrentVersion(normalizedVersion);
    setLoading(true);
    setReport(null);
    setActiveWorkflowNode(0);

    for (let step = 0; step < 5; step++) {
      setActiveWorkflowNode(step);
      await new Promise(r => setTimeout(r, 200));
    }

    try {
      const res = await ApiService.analyzeUpgrade(normalizedVersion);
      setReport(res);
    } finally {
      setLoading(false);
    }
  };

  const workflowNodes = [
    { id: 'validate_request', label: 'validate_request' },
    { id: 'fetch_latest_release', label: 'fetch_latest_release' },
    { id: 'fetch_guidance', label: 'fetch_guidance' },
    { id: 'extract_changes', label: 'extract_changes' },
    { id: 'build_report', label: 'build_report' }
  ];

  const reportStatus = report ? {
    upgrade_available: {
      label: 'UPGRADE AVAILABLE',
      className: 'text-[#d3bbff] bg-[#8957e5]/15 border-[#8957e5]/40'
    },
    up_to_date: {
      label: 'UP TO DATE',
      className: 'text-[#7bdb80] bg-[#7bdb80]/15 border-[#7bdb80]/30'
    },
    source_unavailable: {
      label: 'SOURCE UNAVAILABLE',
      className: 'text-[#ffb4ac] bg-[#da3633]/15 border-[#da3633]/40'
    }
  }[report.status] : null;

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col gap-2 border-b border-[#30363d] pb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#dfe2eb]">
          Deterministic Stripe Migration MCP Analyzer
        </h1>
        <div className="flex items-center gap-2 font-mono text-xs text-[#7bdb80] font-semibold">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Connected to official GitHub release data</span>
        </div>
      </header>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Panel */}
        <div className="bg-[#181c22] border border-[#30363d] rounded p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">Latest Stable Release</h2>
            <span className="font-mono text-xs text-[#d3bbff] bg-[#8957e5]/20 border border-[#8957e5]/40 px-2 py-0.5 rounded font-semibold">
              Major {latestRelease?.major || 15}
            </span>
          </div>
          <div className="text-3xl font-bold text-[#dfe2eb] font-mono">
            {latestRelease?.version || '15.6.0'}
          </div>
          <a
            href={latestRelease?.release_url || 'https://github.com/stripe/stripe-python/releases'}
            target="_blank"
            rel="noreferrer"
            className="self-start text-xs font-medium border border-[#30363d] text-[#dfe2eb] hover:bg-[#262a31] hover:border-[#8b949e] px-4 py-2 rounded transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            View GitHub Release
          </a>
        </div>

        {/* Right Panel */}
        <div className="bg-[#181c22] border border-[#30363d] rounded p-6 flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">Target Upgrade</h2>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={currentVersion}
              onChange={(e) => {
                setCurrentVersion(e.target.value);
                setVersionError(null);
              }}
              aria-invalid={versionError !== null}
              aria-describedby={versionError ? 'version-error' : undefined}
              className="bg-[#10141a] border border-[#30363d] text-[#dfe2eb] font-mono text-base p-2.5 rounded focus:border-[#8957e5] focus:ring-1 focus:ring-[#8957e5] outline-none w-full"
            />
            {versionError && (
              <p id="version-error" role="alert" className="text-xs text-[#ffb4ac]">
                {versionError}
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              {['14.3.0', '15.6.0', '13.0.0'].map((ver) => (
                <button
                  key={ver}
                  onClick={() => setCurrentVersion(ver)}
                  className="font-mono text-xs text-[#8b949e] hover:text-[#d3bbff] transition border border-[#30363d] px-2.5 py-1 rounded bg-[#10141a] hover:bg-[#262a31]"
                >
                  {ver}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="self-end mt-auto text-xs font-semibold bg-[#8957e5] text-white hover:bg-[#713dcc] transition px-5 py-2.5 rounded flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">troubleshoot</span>
            {loading ? 'Analyzing...' : 'Analyze Upgrade'}
          </button>
        </div>
      </div>

      {/* Pipeline Status */}
      <div className="bg-[#181c22] border border-[#30363d] rounded p-6 flex flex-col gap-4 overflow-x-auto">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">Pipeline Status</h3>
        <div className="flex items-center min-w-max py-2">
          {workflowNodes.map((node, idx) => {
            const isCompleted = report !== null || activeWorkflowNode > idx;
            const isCurrent = activeWorkflowNode === idx;

            return (
              <React.Fragment key={node.id}>
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <div className="h-6 w-6 rounded-full bg-[#7bdb80]/20 border border-[#7bdb80] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#7bdb80] text-[14px]">check</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="h-6 w-6 rounded-full bg-[#8957e5]/20 border border-[#8957e5] flex items-center justify-center animate-pulse">
                      <span className="material-symbols-outlined text-[#d3bbff] text-[14px]">sync</span>
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-[#262a31] border border-[#30363d] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#8b949e] text-[14px]">pending</span>
                    </div>
                  )}
                  <span className={`font-mono text-xs ${isCompleted || isCurrent ? 'text-[#dfe2eb] font-semibold' : 'text-[#8b949e]'}`}>
                    {node.label}
                  </span>
                </div>
                {idx < workflowNodes.length - 1 && (
                  <div className={`w-8 h-px mx-3 ${isCompleted ? 'bg-[#7bdb80]' : 'bg-[#30363d]'}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Migration Report */}
      {report && (
        <div className="bg-[#181c22] border border-[#30363d] rounded flex flex-col animate-fadeIn overflow-hidden">
          <div className="border-b border-[#30363d] bg-[#1c2026] px-6 py-3 flex justify-between items-center">
            <h3 className="text-xs font-semibold tracking-wider text-[#dfe2eb]">MIGRATION REPORT</h3>
            <span className={`font-mono text-xs border px-2.5 py-0.5 rounded font-semibold ${reportStatus?.className}`}>
              {reportStatus?.label}: {report.current_version}{report.target_version ? ` → ${report.target_version}` : ''}
            </span>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {report.breaking_changes.length === 0 && (
              <p className="text-sm text-[#8b949e]">
                {report.status === 'up_to_date'
                  ? 'No major-version migration is required.'
                  : 'No breaking changes could be loaded from official guidance.'}
              </p>
            )}
            {report.breaking_changes.map((bc, idx) => (
              <div key={idx} className="flex flex-col gap-4 border-b border-[#30363d]/60 pb-6 last:border-0 last:pb-0">
                <div className="flex flex-col gap-2">
                  <h4 className="text-lg font-bold text-[#ffb4ab] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    Breaking Change
                  </h4>
                  <p className="font-mono text-sm text-[#dfe2eb] bg-[#10141a] border border-[#30363d] p-3 rounded border-l-4 border-l-[#da3633] font-semibold">
                    {bc.title}
                  </p>
                  <p className="text-xs text-[#8b949e] leading-relaxed">
                    {bc.summary}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">OFFICIAL SOURCE:</span>
                  <a
                    href={bc.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-[#d3bbff] hover:underline flex items-center gap-1.5 w-max"
                  >
                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                    {bc.source_url.replace('https://github.com/stripe/stripe-python/', '')}
                  </a>
                </div>

                {bc.search_hints.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">SEARCH HINTS:</span>
                    <div className="flex flex-wrap gap-2 font-mono text-xs">
                      {bc.search_hints.map((hint, hIdx) => (
                        <span key={hIdx} className="bg-[#10141a] border border-[#30363d] px-2.5 py-1 rounded text-[#dfe2eb]">
                          {hint}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Warnings Panel */}
      {report && report.warnings.length > 0 && (
        <div className="bg-[#93000a]/15 border border-[#da3633]/40 rounded p-5 flex gap-4 items-start">
          <span className="material-symbols-outlined text-[#ffb4ab] text-2xl shrink-0 mt-0.5">error</span>
          <div className="flex flex-col gap-2">
            <h4 className="text-base font-bold text-[#ffb4ab]">Workflow Warnings</h4>
            <ul className="text-xs text-[#dfe2eb] list-disc pl-4 flex flex-col gap-1 leading-relaxed">
              {report.warnings.map((warning) => <li key={warning}>{warning}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
