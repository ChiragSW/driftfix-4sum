import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Code } from 'lucide-react';
import { BreakingChange } from '../types';
import { useClipboard } from '../hooks/useClipboard';
import clsx from 'clsx';

interface BreakingChangeCardProps {
  change: BreakingChange;
  index: number;
}

export const BreakingChangeCard: React.FC<BreakingChangeCardProps> = ({ change, index }) => {
  const [expanded, setExpanded] = useState(index === 0);
  const { copied, copy } = useClipboard();

  const hintsSnippet = change.search_hints.join('  ');

  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden hover:border-slate-700 transition-all">
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-indigo-200 truncate">{change.title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={change.source_url}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40"
          >
            Source <ExternalLink className="w-3 h-3" />
          </a>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800">
          <p className="text-xs text-slate-300 leading-relaxed mt-3">{change.summary}</p>

          {change.search_hints.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Code className="w-3 h-3" /> Impact Scout search hints
                </span>
                <button
                  onClick={() => copy(hintsSnippet)}
                  className={clsx(
                    'text-[11px] font-mono px-2 py-0.5 rounded border transition',
                    copied
                      ? 'text-emerald-400 border-emerald-600/40 bg-emerald-950/30'
                      : 'text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-200'
                  )}
                >
                  {copied ? 'Copied!' : 'Copy hints'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {change.search_hints.map((hint, i) => (
                  <code
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-xs border border-slate-700"
                  >
                    {hint}
                  </code>
                ))}
              </div>
            </div>
          )}

          <a
            href={change.source_url}
            target="_blank"
            rel="noreferrer"
            className="sm:hidden inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-mono"
          >
            Official Stripe Source <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
