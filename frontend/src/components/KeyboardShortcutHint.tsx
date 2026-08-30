import React, { useEffect, useCallback } from 'react';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  label: string;
  tabId: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['1'], label: 'Overview',            tabId: 'overview'  },
  { keys: ['2'], label: 'Migration Analyzer',  tabId: 'analyzer'  },
  { keys: ['3'], label: 'Impact Scout',        tabId: 'scanner'   },
  { keys: ['4'], label: 'Daytona Sandbox',     tabId: 'sandbox'   },
  { keys: ['5'], label: 'Codex Provider',      tabId: 'codex'     },
  { keys: ['6'], label: 'TrueForge Workflow',  tabId: 'trueforge' },
];

interface Props {
  setActiveTab: (tab: string) => void;
}

export const KeyboardShortcutHint: React.FC<Props> = ({ setActiveTab }) => {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      // Only trigger when no input/textarea is focused
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const match = SHORTCUTS.find(s => s.keys.includes(e.key));
      if (match) setActiveTab(match.tabId);
    },
    [setActiveTab]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="hidden xl:block fixed bottom-6 left-6 z-40">
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer select-none text-slate-500 hover:text-slate-300 transition text-xs font-mono">
          <Keyboard className="w-3.5 h-3.5" />
          Keyboard shortcuts
        </summary>
        <div className="mt-2 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl min-w-[200px]">
          <ul className="space-y-1.5">
            {SHORTCUTS.map(s => (
              <li key={s.tabId} className="flex items-center justify-between gap-4 text-xs text-slate-400">
                <span>{s.label}</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                  {s.keys[0]}
                </kbd>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
};
