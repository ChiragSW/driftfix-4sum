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
    .map(l => `${l.type === 'added' ? '+' : l.type === 'removed' ? '-' : ' '} ${l.content}`)
    .join('\n');

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-surface-container px-4 py-3 border-b border-outline-variant flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-primary shrink-0" />
          <span className="font-mono text-xs font-bold text-on-surface">{title}</span>
          {filename && (
            <span className="text-[11px] font-mono text-outline hidden sm:block">({filename})</span>
          )}
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span className="text-xs font-bold">
            <span className="text-secondary">+{addedCount}</span>
            <span className="text-outline mx-1">/</span>
            <span className="text-tertiary">-{removedCount}</span>
          </span>
          <button
            onClick={() => copy(patchText)}
            className={clsx(
              'flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded border transition-colors',
              copied
                ? 'text-secondary border-secondary/40 bg-secondary-container/20'
                : 'text-on-surface-variant border-outline-variant hover:border-outline hover:text-on-surface bg-surface'
            )}
          >
            {copied ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy patch'}
          </button>
        </div>
      </div>

      {/* Diff lines */}
      <div className="font-mono text-xs leading-6 overflow-x-auto max-h-80 overflow-y-auto bg-surface-container-lowest p-2">
        {diff.map((line, idx) => (
          <div
            key={idx}
            className={clsx(
              'flex items-start px-2 py-0.5 rounded font-mono',
              line.type === 'added'   ? 'bg-secondary-container/15 text-secondary border-l-2 border-secondary' :
              line.type === 'removed' ? 'bg-tertiary-container/15 text-tertiary border-l-2 border-tertiary opacity-80' :
                                        'text-on-surface-variant'
            )}
          >
            <span className={clsx(
              'w-6 text-center mr-2 shrink-0 select-none font-bold',
              line.type === 'added'   ? 'text-secondary' :
              line.type === 'removed' ? 'text-tertiary'  : 'text-outline'
            )}>
              {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
            </span>
            <span className="w-8 text-outline select-none pr-3 text-right shrink-0">
              {line.lineNo}
            </span>
            <span className="flex-1 whitespace-pre">{line.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
