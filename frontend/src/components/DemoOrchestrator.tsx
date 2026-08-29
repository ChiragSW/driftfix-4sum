import React, { useState } from 'react';
import { Play, CheckCircle2, Loader2, ChevronRight, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

interface DemoStep {
  id: string;
  label: string;
  tabId: string;
  description: string;
}

const DEMO_STEPS: DemoStep[] = [
  { id: 's1', label: '1. Discover Release',  tabId: 'analyzer',   description: 'Fetch stripe-python 15.6.0 via GitHub API'     },
  { id: 's2', label: '2. Analyze Migration', tabId: 'analyzer',   description: 'Run LangGraph 5-node workflow on port 8000'    },
  { id: 's3', label: '3. Run Impact Scout',  tabId: 'scanner',    description: 'Flag .get()/.keys()/.items() breaking usages'  },
  { id: 's4', label: '4. Apply Patch',       tabId: 'scanner',    description: 'Transform to .to_dict() per official Wiki'     },
  { id: 's5', label: '5. Sandbox Verify',    tabId: 'sandbox',    description: '7 pass -> 7 fail -> 7 pass in Daytona sandbox' },
  { id: 's6', label: '6. Human Checkpoint',  tabId: 'trueforge',  description: 'TrueForge pauses for human Allow / Deny gate'   },
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
      await new Promise(r => setTimeout(r, 850));
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
    <div className="bg-surface-container-low border border-primary/30 rounded-xl p-5 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-on-surface flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            Full Demo Orchestration Tour
          </h3>
          <p className="font-mono text-xs text-on-surface-variant mt-0.5">
            Automated walkthrough simulating the complete TrueForge migration pipeline across all views.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            disabled={running}
            className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-variant disabled:opacity-30 text-on-surface text-xs font-mono font-medium border border-outline-variant transition"
          >
            <RotateCcw className="w-3 h-3 inline mr-1" />
            Reset
          </button>
          <button
            onClick={runAll}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-primary-container hover:bg-inverse-primary disabled:opacity-50 text-on-primary-container text-xs font-mono font-bold shadow transition"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {running ? 'Orchestrating...' : 'Run Full Tour'}
          </button>
        </div>
      </div>

      <ol className="flex flex-col sm:flex-row flex-wrap gap-2">
        {DEMO_STEPS.map((step, idx) => {
          const done   = completedSteps.has(step.id);
          const active = currentStep === step.id;

          return (
            <React.Fragment key={step.id}>
              <li
                className={clsx(
                  'flex items-start gap-2.5 flex-1 min-w-[150px] p-3 rounded-lg border font-mono text-xs transition-all',
                  done    ? 'bg-secondary-container/15 border-secondary/40 text-secondary' :
                  active  ? 'bg-primary-container/20 border-primary text-on-surface ring-1 ring-primary' :
                            'bg-surface-container-lowest border-outline-variant/60 text-outline'
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-secondary" />
                    : active
                    ? <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    : <span className="w-3.5 h-3.5 rounded-full border border-outline-variant block" />}
                </div>
                <div>
                  <div className="font-bold text-on-surface">{step.label}</div>
                  <div className="text-[10px] mt-0.5 leading-tight text-on-surface-variant">
                    {step.description}
                  </div>
                </div>
              </li>
              {idx < DEMO_STEPS.length - 1 && (
                <ChevronRight className="hidden lg:block self-center w-3.5 h-3.5 text-outline shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </div>
  );
};
