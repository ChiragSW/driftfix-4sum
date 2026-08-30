import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { PullRequestReport } from '../types';

interface OverviewProps {
  setActiveTab: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ setActiveTab }) => {
  const [pullReports, setPullReports] = useState<PullRequestReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const loadPullReports = async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      setPullReports(await ApiService.getPullRequestReports());
    } catch (error) {
      setReportsError(error instanceof Error ? error.message : 'Unable to load pull request reports');
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    void loadPullReports();
  }, []);

  const openReports = pullReports.filter((report) => report.state === 'open');
  const mergedReports = pullReports.filter((report) => report.state === 'merged');

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
                LIVE
              </span>
            </div>
            <p className="text-base font-bold text-[#dfe2eb]">
              {reportsLoading ? 'Loading PRs…' : reportsError ? 'PR data unavailable' : `${openReports.length} open · ${mergedReports.length} merged`}
            </p>
            <p className="font-mono text-xs text-[#8b949e] mt-1">GitHub pull request reports</p>
          </div>
        </div>
      </section>

      {/* Live reports stored in open and merged pull request bodies */}
      <section aria-labelledby="pull-request-reports">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 id="pull-request-reports" className="text-xl md:text-2xl font-bold text-[#dfe2eb]">
              Pull Request Reports
            </h2>
            <p className="text-xs text-[#8b949e] mt-1">
              Live report bodies from open and merged GitHub pull requests.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadPullReports()}
            disabled={reportsLoading}
            className="self-start bg-[#181c22] border border-[#30363d] text-[#dfe2eb] hover:border-[#8b949e] disabled:opacity-50 text-xs font-semibold px-4 py-2 rounded transition flex items-center gap-2"
          >
            <span className={`material-symbols-outlined text-[16px] ${reportsLoading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>
        </div>

        {reportsLoading ? (
          <div className="bg-[#181c22] border border-[#30363d] rounded p-6 text-sm text-[#8b949e]">
            Loading pull request reports…
          </div>
        ) : reportsError ? (
          <div role="alert" className="bg-[#93000a]/15 border border-[#da3633]/40 rounded p-5 text-sm text-[#ffb4ac]">
            {reportsError}. For local development, run <code className="font-mono">npm run provider</code> in a second terminal. The MCP server on port 8000 is a separate process.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {([
              { state: 'open' as const, label: 'Open', reports: openReports },
              { state: 'merged' as const, label: 'Merged', reports: mergedReports }
            ]).map((group) => (
              <div key={group.state} className="bg-[#181c22] border border-[#30363d] rounded p-5">
                <h3 className="text-sm font-bold text-[#dfe2eb] mb-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${group.state === 'open' ? 'bg-[#7bdb80]' : 'bg-[#8957e5]'}`}></span>
                  {group.label} reports
                  <span className="font-mono text-xs text-[#8b949e]">({group.reports.length})</span>
                </h3>

                <div className="flex flex-col gap-3">
                  {group.reports.length === 0 ? (
                    <p className="text-xs text-[#8b949e] bg-[#10141a] border border-[#30363d] rounded p-4">
                      No {group.label.toLowerCase()} pull request reports found.
                    </p>
                  ) : group.reports.map((report) => (
                    <article key={report.number} className="bg-[#10141a] border border-[#30363d] rounded p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <a
                            href={report.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-bold text-[#dfe2eb] hover:text-[#d3bbff] transition"
                          >
                            #{report.number} {report.title}
                          </a>
                          <p className="font-mono text-[11px] text-[#8b949e] mt-1 break-all">
                            {report.head_branch} → {report.base_branch} · @{report.author}
                          </p>
                        </div>
                        {report.draft && (
                          <span className="shrink-0 text-[10px] font-mono font-bold uppercase text-[#d3bbff] border border-[#8957e5]/50 rounded px-2 py-0.5">
                            Draft
                          </span>
                        )}
                      </div>

                      <details className="mt-3 group">
                        <summary className="cursor-pointer text-xs font-semibold text-[#d3bbff] hover:underline">
                          View report
                        </summary>
                        <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words bg-[#181c22] border border-[#30363d] rounded p-3 text-[11px] leading-relaxed text-[#dfe2eb] font-mono">
                          {report.body || 'This pull request has no report body.'}
                        </pre>
                      </details>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
