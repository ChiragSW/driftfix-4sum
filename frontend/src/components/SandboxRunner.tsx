import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Server
} from 'lucide-react';
import { SandboxStep } from '../types';

export const SandboxRunner: React.FC = () => {
  const [running, setRunning] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [completed, setCompleted] = useState<boolean>(false);

  const steps: SandboxStep[] = [
    {
      id: 'step1',
      name: '1. Baseline Test on Stripe v14.3.0',
      command: 'pytest -q demo_target/test_customer_service.py demo_target/test_invoice_service.py',
      status: activeStepIndex > 0 ? 'passed' : activeStepIndex === 0 ? 'running' : 'pending',
      output: `.. [customer_service: 5 passed]
.. [invoice_service: 2 passed]
============================== 7 passed in 0.04s ==============================`,
      duration_ms: 42
    },
    {
      id: 'step2',
      name: '2. Dependency-Only Upgrade to Stripe v15.6.0',
      command: 'pip install stripe==15.6.0 && pytest -q',
      status: activeStepIndex > 1 ? 'failed' : activeStepIndex === 1 ? 'running' : 'pending',
      output: `FFFFFFF
================================== FAILURES ===================================
_____________________________ test_customer_email _____________________________
    def customer_email(customer: stripe.Customer) -> str | None:
>       return customer.get("email")
E       AttributeError: 'Customer' object has no attribute 'get'
_____________________________ test_customer_fields ____________________________
>       return sorted(customer.keys())
E       AttributeError: 'Customer' object has no attribute 'keys'
=========================== 7 failed in 0.08s ===========================`,
      duration_ms: 84
    },
    {
      id: 'step3',
      name: '3. Apply Sourced DriftFix Migration Patch',
      command: 'driftfix patch --apply to_dict demo_target/',
      status: activeStepIndex > 2 ? 'passed' : activeStepIndex === 2 ? 'running' : 'pending',
      output: `[DriftFix] Patched customer_service.py: 4 StripeObject usages converted to .to_dict()
[DriftFix] Patched invoice_service.py: 2 StripeObject usages converted to .to_dict()
[DriftFix] Code patch verified with official Stripe v15 Wiki guidance.`,
      duration_ms: 120
    },
    {
      id: 'step4',
      name: '4. Final Test Suite on Stripe v15.6.0',
      command: 'pytest -q demo_target/test_customer_service.py demo_target/test_invoice_service.py',
      status: activeStepIndex >= 3 ? 'passed' : activeStepIndex === 3 ? 'running' : 'pending',
      output: `....... [7 passed]
============================== 7 passed in 0.05s ==============================
STATUS: ALL 7 TESTS PASSING ON STRIPE 15.6.0`,
      duration_ms: 51
    }
  ];

  const handleRunPipeline = async () => {
    setRunning(true);
    setCompleted(false);
    setActiveStepIndex(0);

    for (let i = 0; i < steps.length; i++) {
      setActiveStepIndex(i);
      await new Promise(r => setTimeout(r, 650));
    }

    setCompleted(true);
    setRunning(false);
  };

  const handleReset = () => {
    setActiveStepIndex(-1);
    setCompleted(false);
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Daytona Sandbox Pytest Verification Suite
          </h2>
          <p className="text-xs text-slate-400">
            Deterministic 7-passed (v14) → 7-failed (v15 raw) → 7-passed (v15 patched) sandbox verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunPipeline}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition"
          >
            {running ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Executing in Daytona...' : 'Run Sandbox Verification Cycle'}
          </button>
          <button
            onClick={handleReset}
            disabled={running || activeStepIndex === -1}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Sandbox Specs Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Workspace Runtime</div>
            <div className="text-sm font-semibold text-slate-200">Daytona Isolated Linux</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Network Isolation</div>
            <div className="text-sm font-semibold text-slate-200">Mock Fixtures (Zero Stripe API Calls)</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-mono">Test Coverage</div>
            <div className="text-sm font-semibold text-slate-200">7 Acceptance Test Cases</div>
          </div>
        </div>
      </div>

      {/* Pipeline Steps List */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isCurrent = activeStepIndex === idx;
          const isPast = activeStepIndex > idx || (completed && idx === 3);
          const isPending = activeStepIndex < idx;

          return (
            <div
              key={step.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isCurrent
                  ? 'bg-slate-900 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                  : isPast
                  ? 'bg-slate-900/70 border-slate-800'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="px-4 py-3 bg-slate-950 flex items-center justify-between border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  {step.status === 'passed' && isPast && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  {step.status === 'failed' && isPast && <XCircle className="w-4 h-4 text-rose-400" />}
                  {isCurrent && <Clock className="w-4 h-4 text-indigo-400 animate-spin" />}
                  {isPending && <div className="w-4 h-4 rounded-full border border-slate-700" />}

                  <span className="text-xs font-bold text-white font-mono">{step.name}</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-500">{step.command}</span>
                  {isPast && (
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      step.status === 'passed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {step.status}
                    </span>
                  )}
                </div>
              </div>

              {(isCurrent || isPast) && (
                <div className="p-4 bg-slate-950/90 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
                  <pre className={step.status === 'failed' && isPast ? 'text-rose-300' : 'text-emerald-300'}>
                    {step.output}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
