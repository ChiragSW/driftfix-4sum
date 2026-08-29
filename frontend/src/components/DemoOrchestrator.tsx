import React, { useState } from 'react';
import { Play, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface DemoStep {
  id: string;
  label: string;
  tabId: string;
  description: string;
}

const DEMO_STEPS: DemoStep[] = [
  { id: 's1', label: 'Fetch Latest Release', tabId: 'analyzer',   description: 'Discover stripe-python 15.x from GitHub API'     },
  { id: 's2', label: 'Analyze Migration',    tabId: 'analyzer',   description: 'Run LangGraph 5-node workflow for v14.3.0'        },
  { id: 's3', label: 'Run Impact Scout',     tabId: 'scanner',    description: 'Locate .get()/.keys()/.items() usages'           },
  { id: 's4', label: 'Apply Patch',          tabId: 'scanner',    description: 'Replace with .to_dict() per official guide'      },
  { id: 's5', label: 'Sandbox Verification', tabId: 'sandbox',    description: '7-passed → 7-failed → 7-passed in Daytona'      },
  { id: 's6', label: 'Approval Checkpoint',  tabId: 'trueforge',  description: 'TrueForge pauses for human Allow / Deny'        },
];

interface DemoOrchestratorProps {
  setActiveTab: (tab: string) => void;
}

export const DemoOrchestrator: React.FC<DemoOrchestratorProps> = ({ setActiveTab }) => {
  const [running, setRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const runAll = async () => {
    setRunning(true);
    setCompletedSteps(new Set());

    for (const step of DEMO_STEPS) {
      setCurrentStep(step.id);
      setActiveTab(step.tabId);
      await new Promise(r => setTimeout(r, 750));
      setCompletedSteps(prev => new Set([...prev, step.id]));
    }

    setCurrentStep(null);
    setRunning(false);
  };

  const reset = () => {
    setCompletedSteps(new Set());
    setCurrentStep(null);
    setRunning(false);
    setActiveTab('overview');
  };

  return (
    <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-800/30 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-indigo-400" />
            Full Demo Orchestration Run
          </h3>
          <p className="text-xs text-slate-400">
            Simulates the complete TrueForge migration workflow across all views.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAll}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Running...' : 'Run Full Demo'}
          </button>
          <button
            onClick={reset}
            disabled={running}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            Reset
          </button>
        </div>
      </div>

      <ol className="flex flex-col sm:flex-row flex-wrap gap-2">
        {DEMO_STEPS.map((step, idx) => {
          const done    = completedSteps.has(step.id);
          const active  = currentStep === step.id;
          const pending = !done && !active;

          return (
            <React.Fragment key={step.id}>
              <li
                className={clsx(
                  'flex items-start gap-2 flex-1 min-w-[140px] p-3 rounded-xl border text-xs transition-all',
                  done    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200' :
                  active  ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500/50' :
                            'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    : active
                    ? <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    : <span className="w-3.5 h-3.5 rounded-full border border-slate-700 block" />}
                </div>
                <div>
                  <div className="font-semibold">{step.label}</div>
                  <div className="text-[10px] mt-0.5 leading-tight text-slate-400">
                    {step.description}
                  </div>
                </div>
              </li>
              {idx < DEMO_STEPS.length - 1 && (
                <ChevronRight className="hidden sm:block self-center w-3.5 h-3.5 text-slate-700 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </div>
  );
};
