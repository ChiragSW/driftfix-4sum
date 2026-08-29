import React from 'react';
import { ArrowRightLeft, Copy, Check } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import clsx from 'clsx';

interface DiffLine {
  type: 'added' | 'removed' | 'context';
  lineNo: number;
  content: string;
}

interface DiffViewerProps {
  title?: string;
  filename?: string;
  before: string;
  after: string;
}

function buildDiff(before: string, after: string): DiffLine[] {
  const beforeLines = before.split('\n');
  const afterLines  = after.split('\n');
  const maxLen = Math.max(beforeLines.length, afterLines.length);
  const result: DiffLine[] = [];

  for (let i = 0; i < maxLen; i++) {
    const b = beforeLines[i];
    const a = afterLines[i];

    if (b === undefined) {
      result.push({ type: 'added',   lineNo: i + 1, content: a });
    } else if (a === undefined) {
      result.push({ type: 'removed', lineNo: i + 1, content: b });
    } else if (a !== b) {
      result.push({ type: 'removed', lineNo: i + 1, content: b });
      result.push({ type: 'added',   lineNo: i + 1, content: a });
    } else {
      result.push({ type: 'context', lineNo: i + 1, content: b });
    }
  }

  return result;
}

const lineStyle: Record<DiffLine['type'], string> = {
  added:   'bg-emerald-950/50 text-emerald-200 border-l-2 border-emerald-500',
  removed: 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-600 line-through opacity-70',
  context: 'text-slate-400',
};

const prefix: Record<DiffLine['type'], string> = {
  added:   '+',
  removed: '-',
  context: ' ',
};

export const DiffViewer: React.FC<DiffViewerProps> = ({
  title = 'Unified Diff',
  filename,
  before,
  after,
}) => {
  const { copied, copy } = useClipboard();
  const diff = buildDiff(before, after);
  const addedCount   = diff.filter(l => l.type === 'added').length;
  const removedCount = diff.filter(l => l.type === 'removed').length;

  const patchText = diff
    .map(l => `${prefix[l.type]} ${l.content}`)
    .join('\n');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200">{title}</span>
          {filename && (
            <span className="text-[11px] font-mono text-slate-500 hidden sm:block">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono">
            <span className="text-emerald-400 font-bold">+{addedCount}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-rose-400 font-bold">-{removedCount}</span>
          </span>
          <button
            onClick={() => copy(patchText)}
            className={clsx(
              'flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border transition',
              copied
                ? 'text-emerald-400 border-emerald-600/40 bg-emerald-950/30'
                : 'text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
            )}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy patch'}
          </button>
        </div>
      </div>

      {/* Diff lines */}
      <div className="font-mono text-xs leading-6 overflow-x-auto max-h-80 overflow-y-auto">
        {diff.map((line, idx) => (
          <div
            key={idx}
            className={clsx(
              'flex items-start px-2 py-0.5',
              lineStyle[line.type]
            )}
          >
            <span className={clsx(
              'w-6 text-center mr-2 shrink-0',
              line.type === 'added'   ? 'text-emerald-500' :
              line.type === 'removed' ? 'text-rose-500'    : 'text-slate-700'
            )}>
              {prefix[line.type]}
            </span>
            <span className="w-8 text-slate-700 select-none pr-3 text-right shrink-0">
              {line.lineNo}
            </span>
            <span className="flex-1 whitespace-pre">{line.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
