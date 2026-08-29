import React, { useState } from 'react';
import { 
  GitPullRequest, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Layers, 
  UserCheck, 
  GitMerge, 
  Lock,
  RotateCcw
} from 'lucide-react';
import { TrueForgeTraceEvent } from '../types';

export const TrueForgeWorkflow: React.FC = () => {
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'allowed' | 'denied'>('pending');

  const events: TrueForgeTraceEvent[] = [
    {
      id: 'evt-1',
      timestamp: '2026-08-28 16:14:02',
      type: 'agent_loop',
      actor: 'TrueForge Harness',
      title: 'Session 01m14g71c8zg1fpz5fe84n2by2 Started',
      details: 'Loaded agent "driftfix" with skill "agent/SKILL.md" and model "codex-local / codex-subscription".',
      status: 'info'
    },
    {
      id: 'evt-2',
      timestamp: '2026-08-28 16:14:05',
      type: 'codex_adapter',
      actor: 'Codex Adapter (Port 8765)',
      title: 'Model Turn 1 (Tool Request)',
      details: 'Returned structured tool call: analyze_stripe_python_upgrade(current_version="14.3.0")',
      status: 'success'
    },
    {
      id: 'evt-3',
      timestamp: '2026-08-28 16:14:09',
      type: 'mcp_call',
      actor: 'DriftFix MCP (Port 8000)',
      title: 'Executed analyze_stripe_python_upgrade',
      details: 'Discovered latest stable release Stripe 15.6.0. Extracted breaking changes & official Wiki URLs.',
      status: 'success'
    },
    {
      id: 'evt-4',
      timestamp: '2026-08-28 16:14:14',
      type: 'subagent_start',
      actor: 'Parallel Subagents',
      title: 'Impact Scout & Migration Reviewer',
      details: 'Impact Scout located 6 StripeObject usages in customer_service.py and invoice_service.py. Migration Reviewer mapped edits to Stripe v15 Wiki anchors.',
      status: 'success'
    },
    {
      id: 'evt-5',
      timestamp: '2026-08-28 16:14:25',
      type: 'sandbox_exec',
      actor: 'Daytona Sandbox Provider',
      title: 'Sandbox Validation Suite',
      details: 'v14 tests passed (7/7) -> v15 unpatched failed (7/7) -> v15 .to_dict() patched passed (7/7).',
      status: 'success'
    },
    {
      id: 'evt-6',
      timestamp: '2026-08-28 16:14:38',
      type: 'github_pr',
      actor: 'TrueForge GitHub Connector',
      title: 'Created Draft PR #1 on Branch "driftfix/stripe-v15.6.0"',
      details: 'Draft PR #1 opened with diff summary, evidence links, and passing pytest logs.',
      status: 'success'
    },
    {
      id: 'evt-7',
      timestamp: '2026-08-28 16:14:45',
      type: 'human_checkpoint',
      actor: 'Human Approval Policy Gate',
      title: 'Approval Required: merge_pull_request',
      details: 'Merge tool blocked pending human decision. Branch protection active on "main".',
      status: approvalStatus === 'pending' ? 'pending' : approvalStatus === 'allowed' ? 'success' : 'denied'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-purple-400" />
            TrueForge Orchestration Trace & Human Approval
          </h2>
          <p className="text-xs text-slate-400">
            TrueForge owns the agent loop, subagents, sandbox execution, and human checkpoint before merge.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setApprovalStatus('pending')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Checkpoint
          </button>
        </div>
      </div>

      {/* Human Approval Card */}
      <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Human Approval Checkpoint</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  approvalStatus === 'pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    : approvalStatus === 'allowed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {approvalStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400">Action: <code className="text-purple-300">merge_pull_request</code> to branch <code className="text-slate-300 font-mono">main</code></p>
            </div>
          </div>

          {/* Action Buttons */}
          {approvalStatus === 'pending' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setApprovalStatus('allowed')}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Allow & Merge PR
              </button>
              <button
                onClick={() => setApprovalStatus('denied')}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-600/50 font-semibold text-xs transition"
              >
                <XCircle className="w-4 h-4" />
                Deny
              </button>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-300">
              {approvalStatus === 'allowed' ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <GitMerge className="w-4 h-4" /> Merged as commit 7f29dbf
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1 font-bold">
                  <Lock className="w-4 h-4" /> Merge Denied; main branch preserved
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tool Arguments Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300">
          <div className="text-slate-500 text-[11px] mb-1 font-bold uppercase tracking-wider">Tool Arguments (Inspected by TrueForge):</div>
          <pre className="text-purple-200">
{`{
  "owner": "ChiragSW",
  "repo": "driftfix-4sum",
  "pull_number": 1,
  "commit_title": "fix(deps): migrate stripe-python v14 to v15.6.0 (to_dict() conversions)",
  "merge_method": "squash"
}`}
          </pre>
        </div>
      </div>

      {/* Full Trace Event Timeline */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          TrueForge Execution Trace
        </h3>

        <div className="space-y-4">
          {events.map((evt, idx) => (
            <div key={evt.id} className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="mt-1">
                {evt.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : evt.status === 'pending' ? (
                  <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                ) : evt.status === 'denied' ? (
                  <XCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{evt.title}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {evt.actor}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{evt.timestamp}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{evt.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
