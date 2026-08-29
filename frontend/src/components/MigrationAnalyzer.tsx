import React, { useState, useEffect } from 'react';
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

    for (let step = 0; step < 5; step++) {
      setActiveWorkflowNode(step);
      await new Promise(r => setTimeout(r, 200));
    }

    const res = await ApiService.analyzeUpgrade(currentVersion);
    setReport(res);
    setLoading(false);
  };

  const workflowNodes = [
    { id: 'validate_request', label: 'validate_request' },
    { id: 'fetch_latest_release', label: 'fetch_latest_release' },
    { id: 'fetch_guidance', label: 'fetch_guidance' },
    { id: 'extract_changes', label: 'extract_changes' },
    { id: 'build_report', label: 'build_report' }
  ];

  return (
    <div className="w-full flex flex-col gap-lg animate-fadeIn">
      {/* Header matching Stitch Screen 3 */}
      <header className="flex flex-col gap-sm border-b border-outline-variant pb-md">
        <h1 className="font-display text-display text-on-surface">Deterministic Stripe Migration MCP Analyzer</h1>
        <div className="flex items-center gap-sm font-code text-code text-secondary font-bold">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Connected to official GitHub release data</span>
        </div>
      </header>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Left Panel */}
        <div className="bg-surface-container-low border border-outline-variant rounded p-md flex flex-col gap-md">
          <div className="flex justify-between items-start">
            <h2 className="font-label-md text-label-md text-on-surface uppercase font-bold">Latest Stable Release</h2>
            <span className="font-code text-code text-primary bg-primary-container/20 px-sm py-xs rounded font-bold">
              Major {latestRelease?.major || 15}
            </span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-bold">
            {latestRelease?.version || '15.6.0'}
          </div>
          <a
            href={latestRelease?.release_url || 'https://github.com/stripe/stripe-python/releases'}
            target="_blank"
            rel="noreferrer"
            className="self-start font-label-md text-label-md border border-outline-variant text-on-surface hover:bg-surface-variant px-md py-sm rounded transition-colors flex items-center gap-sm"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            View GitHub Release
          </a>
        </div>

        {/* Right Panel */}
        <div className="bg-surface-container-low border border-outline-variant rounded p-md flex flex-col gap-md">
          <h2 className="font-label-md text-label-md text-on-surface uppercase font-bold">Target Upgrade</h2>
          <div className="flex flex-col gap-sm">
            <input
              type="text"
              value={currentVersion}
              onChange={(e) => setCurrentVersion(e.target.value)}
              className="bg-background border border-outline-variant text-on-surface font-code text-body-lg p-sm rounded focus:border-primary focus:ring-0 outline-none w-full"
            />
            <div className="flex gap-xs flex-wrap">
              <button
                onClick={() => setCurrentVersion('14.3.0')}
                className="font-code text-body-sm text-on-surface-variant hover:text-primary transition-colors border border-outline-variant px-xs py-1 rounded bg-surface cursor-pointer"
              >
                14.3.0
              </button>
              <button
                onClick={() => setCurrentVersion('15.6.0')}
                className="font-code text-body-sm text-on-surface-variant hover:text-primary transition-colors border border-outline-variant px-xs py-1 rounded bg-surface cursor-pointer"
              >
                15.6.0
              </button>
              <button
                onClick={() => setCurrentVersion('13.0.0')}
                className="font-code text-body-sm text-on-surface-variant hover:text-primary transition-colors border border-outline-variant px-xs py-1 rounded bg-surface cursor-pointer"
              >
                13.0.0
              </button>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="self-end mt-auto font-label-md text-label-md bg-primary-container text-on-primary-container hover:bg-primary-fixed transition-colors px-md py-sm rounded flex items-center gap-sm cursor-pointer disabled:opacity-50 font-bold"
          >
            <span className="material-symbols-outlined text-[16px]">troubleshoot</span>
            {loading ? 'Analyzing...' : 'Analyze Upgrade'}
          </button>
        </div>
      </div>

      {/* Pipeline Visualizer */}
      <div className="bg-surface-container-low border border-outline-variant rounded p-md flex flex-col gap-md overflow-x-auto">
        <h3 className="font-label-md text-label-md text-on-surface uppercase font-bold">Pipeline Status</h3>
        <div className="flex items-center min-w-max py-sm">
          {workflowNodes.map((node, idx) => {
            const isCompleted = report !== null || activeWorkflowNode > idx;
            const isCurrent = activeWorkflowNode === idx;

            return (
              <React.Fragment key={node.id}>
                <div className="flex items-center gap-xs">
                  {isCompleted ? (
                    <div className="h-6 w-6 rounded-full bg-secondary/20 border border-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[14px]">check</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center animate-pulse">
                      <span className="material-symbols-outlined text-primary text-[14px]">sync</span>
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline-variant text-[14px]">pending</span>
                    </div>
                  )}
                  <span className={`font-code text-body-sm ${isCompleted || isCurrent ? 'text-on-surface font-bold' : 'text-on-surface-variant opacity-60'}`}>
                    {node.label}
                  </span>
                </div>
                {idx < workflowNodes.length - 1 && (
                  <div className={`w-8 h-px mx-sm ${isCompleted ? 'bg-secondary' : 'bg-outline-variant'}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Migration Report */}
      {report && (
        <div className="bg-surface-container-low border border-outline-variant rounded flex flex-col animate-fadeIn">
          <div className="border-b border-outline-variant bg-surface-variant p-sm flex justify-between items-center">
            <h3 className="font-label-md text-label-md text-on-surface font-bold">MIGRATION REPORT</h3>
            <span className="font-code text-body-sm text-secondary bg-secondary-container/20 border border-secondary px-sm py-xs rounded font-bold">
              UPGRADE AVAILABLE: {report.current_version} → {report.target_version || '15.6.0'}
            </span>
          </div>

          <div className="p-md flex flex-col gap-lg">
            {report.breaking_changes.map((bc, idx) => (
              <div key={idx} className="flex flex-col gap-md border-b border-outline-variant/60 pb-md last:border-0 last:pb-0">
                <div className="flex flex-col gap-xs">
                  <h4 className="font-headline-md text-headline-md text-error flex items-center gap-sm font-bold">
                    <span className="material-symbols-outlined">warning</span>
                    Breaking Change
                  </h4>
                  <p className="font-code text-body-lg text-on-surface bg-surface border border-outline-variant p-sm rounded border-l-4 border-l-error font-bold">
                    {bc.title}
                  </p>
                  <p className="font-mono text-xs text-on-surface-variant mt-1">
                    {bc.summary}
                  </p>
                </div>

                <div className="flex flex-col gap-sm">
                  <span className="font-label-md text-label-md text-on-surface-variant font-bold">OFFICIAL SOURCE:</span>
                  <a
                    href={bc.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-code text-body-sm text-primary hover:underline flex items-center gap-xs w-max"
                  >
                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                    {bc.source_url.replace('https://github.com/stripe/stripe-python/', '')}
                  </a>
                </div>

                {bc.search_hints.length > 0 && (
                  <div className="flex flex-col gap-sm">
                    <span className="font-label-md text-label-md text-on-surface-variant font-bold">SEARCH HINTS:</span>
                    <div className="flex flex-wrap gap-sm font-code text-body-sm">
                      {bc.search_hints.map((hint, hIdx) => (
                        <span key={hIdx} className="bg-surface border border-outline-variant px-sm py-xs rounded text-on-surface font-bold">
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
      <div className="bg-error-container/10 border border-error/50 rounded p-md flex gap-md">
        <span className="material-symbols-outlined text-error text-2xl mt-1">error</span>
        <div className="flex flex-col gap-sm">
          <h4 className="font-headline-md text-headline-md text-error font-bold">Workflow Warnings</h4>
          <ul className="font-code text-body-md text-on-surface list-disc pl-md flex flex-col gap-xs">
            <li>Manual verification required for dynamic dict comprehensions handling Stripe objects.</li>
            <li>Automated fixers may skip complex nested dictionary destructuring.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
