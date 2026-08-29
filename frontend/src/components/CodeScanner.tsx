import React, { useState } from 'react';
import { 
  FileCode, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  ArrowRightLeft,
  Copy,
  Check
} from 'lucide-react';
import { DEMO_PRESETS } from '../data/mockData';

export const CodeScanner: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('customer_service.py');
  const [customCode, setCustomCode] = useState<string>(DEMO_PRESETS['customer_service.py'].v14Code);
  const [scanned, setScanned] = useState<boolean>(false);
  const [fixed, setFixed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const currentPresetData = DEMO_PRESETS[selectedPreset];

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    setCustomCode(DEMO_PRESETS[key].v14Code);
    setScanned(false);
    setFixed(false);
  };

  const handleScan = () => {
    setScanned(true);
    setFixed(false);
  };

  const handleFix = () => {
    setFixed(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find occurrences of breaking pattern
  const findMatches = (code: string) => {
    const lines = code.split('\n');
    const matches: { line: number; text: string; hint: string }[] = [];
    const hints = ['.get(', '.keys(', '.values(', '.items(', 'dict('];

    lines.forEach((lineText, idx) => {
      for (const hint of hints) {
        if (lineText.includes(hint) && !lineText.includes('to_dict()')) {
          matches.push({ line: idx + 1, text: lineText.trim(), hint });
          break;
        }
      }
    });
    return matches;
  };

  const matches = findMatches(customCode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            Impact Scout & Migration Reviewer
          </h2>
          <p className="text-xs text-slate-400">
            TrueForge subagent simulation: locates breaking Stripe v14 patterns and produces verified v15 patches.
          </p>
        </div>
        
        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          {Object.keys(DEMO_PRESETS).map((presetKey) => (
            <button
              key={presetKey}
              onClick={() => handleSelectPreset(presetKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                selectedPreset === presetKey
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {presetKey}
            </button>
          ))}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={handleScan}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Search className="w-4 h-4" />
            1. Run Impact Scout
          </button>
          <button
            onClick={handleFix}
            disabled={!scanned}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md transition"
          >
            <Sparkles className="w-4 h-4" />
            2. Run Migration Reviewer (Patch Code)
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          File: <span className="text-slate-200">{currentPresetData.filename}</span>
        </div>
      </div>

      {/* Code Viewer / Diff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original Code / Scanned Pattern View */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-xs font-mono text-slate-300 font-semibold">
                Original Code (Stripe v14 Incompatible)
              </span>
            </div>
            <span className="text-[11px] text-amber-400/90 font-mono">
              {scanned ? `${matches.length} breaking pattern(s) found` : 'Ready to scan'}
            </span>
          </div>

          <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto flex-1 leading-relaxed">
            <pre>
              {customCode.split('\n').map((line, idx) => {
                const isMatch = scanned && matches.some(m => m.line === idx + 1);
                return (
                  <div 
                    key={idx} 
                    className={`flex items-start px-2 py-0.5 rounded ${
                      isMatch ? 'bg-red-950/50 text-red-200 border-l-2 border-red-500 font-bold' : ''
                    }`}
                  >
                    <span className="w-8 text-slate-600 select-none text-right pr-3">{idx + 1}</span>
                    <span className="flex-1">{line}</span>
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        {/* Right: Sourced Patch / Diff Viewer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono text-slate-300 font-semibold">
                Sourced Migration Patch (Stripe v15 Compatible)
              </span>
            </div>
            {fixed && (
              <button 
                onClick={() => handleCopy(currentPresetData.v15FixedCode)}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Patch'}
              </button>
            )}
          </div>

          <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto flex-1 leading-relaxed">
            {fixed ? (
              <pre>
                {currentPresetData.v15FixedCode.split('\n').map((line, idx) => {
                  const isFixedLine = line.includes('to_dict()');
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-start px-2 py-0.5 rounded ${
                        isFixedLine ? 'bg-emerald-950/50 text-emerald-200 border-l-2 border-emerald-500 font-bold' : ''
                      }`}
                    >
                      <span className="w-8 text-slate-600 select-none text-right pr-3">{idx + 1}</span>
                      <span className="flex-1">{line}</span>
                    </div>
                  );
                })}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <ArrowRightLeft className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-sans">
                  Click <strong>Run Migration Reviewer</strong> to produce the official <code className="text-slate-400">.to_dict()</code> patch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sourced Citation Note */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            <strong>Official Stripe Migration Rule:</strong> In v15, dictionary operations on <code className="text-slate-200">StripeObject</code> must be called on <code className="text-emerald-400 font-mono">.to_dict()</code>.
          </span>
        </div>
        <a
          href="https://github.com/stripe/stripe-python/wiki/Migration-guide-for-v15#stripeobject"
          target="_blank"
          rel="noreferrer"
          className="text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 shrink-0 ml-4"
        >
          Wiki Citation <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

// ── DiffViewer integration export ───────────────────────────────────────────
// Re-export so parent pages can use DiffViewer directly from the scanner module
export { DiffViewer } from './DiffViewer';
