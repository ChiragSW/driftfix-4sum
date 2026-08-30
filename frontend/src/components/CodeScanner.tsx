import React, { useState } from 'react';
import { 
  Check, 
  Copy,
  ExternalLink,
  FileCode,
  CheckCircle2
} from 'lucide-react';
import { DEMO_PRESETS } from '../data/mockData';

export const CodeScanner: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('customer_service.py');
  const [scanned, setScanned] = useState<boolean>(false);
  const [fixed, setFixed] = useState<boolean>(false);
  const [copiedPatch, setCopiedPatch] = useState<boolean>(false);
  const [copiedDiff, setCopiedDiff] = useState<boolean>(false);

  const currentPresetData = DEMO_PRESETS[selectedPreset];

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    setScanned(false);
    setFixed(false);
  };

  const handleCopy = (text: string, isDiff = false) => {
    navigator.clipboard.writeText(text);
    if (isDiff) {
      setCopiedDiff(true);
      setTimeout(() => setCopiedDiff(false), 2000);
    } else {
      setCopiedPatch(true);
      setTimeout(() => setCopiedPatch(false), 2000);
    }
  };

  const originalLines = currentPresetData.v14Code.trimEnd().split('\n').map((text, index) => ({
    no: index + 1,
    text,
    broken: currentPresetData.breakingLines.includes(index + 1),
  }));
  const patchedLines = currentPresetData.v15FixedCode.trimEnd().split('\n').map((text, index) => ({
    no: index + 1,
    text,
    fixed: currentPresetData.fixedLines.includes(index + 1),
  }));
  const rawDiff = currentPresetData.rawDiff;
  const diffLines = rawDiff.split('\n');
  const additions = diffLines.filter((line) => line.startsWith('+') && !line.startsWith('+++')).length;
  const deletions = diffLines.filter((line) => line.startsWith('-') && !line.startsWith('---')).length;
  const breakingCount = currentPresetData.breakingLines.length;

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header matching Stitch Screen 4 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#dfe2eb] mb-1.5 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#d3bbff] text-[32px]">manage_search</span>
            Impact Scout &amp; Migration Reviewer
          </h1>
          <div className="flex items-center gap-2 font-mono text-xs text-[#8b949e]">
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            <span>Target:</span>
            <code className="bg-[#1c2026] px-2 py-0.5 rounded border border-[#30363d] text-[#7bdb80] font-bold">
              {currentPresetData.filename}
            </code>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 mr-2">
            {Object.keys(DEMO_PRESETS).map((key) => (
              <button
                key={key}
                onClick={() => handleSelectPreset(key)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition cursor-pointer ${
                  selectedPreset === key
                    ? 'bg-[#8957e5] text-white font-bold border border-[#8957e5]'
                    : 'bg-[#181c22] text-[#8b949e] border border-[#30363d] hover:text-[#dfe2eb]'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <button
            onClick={() => { setScanned(true); setFixed(false); }}
            className="bg-[#181c22] border border-[#30363d] text-[#dfe2eb] hover:border-[#8b949e] font-mono text-xs px-4 py-2 rounded transition flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">troubleshoot</span>
            Run Impact Scout
          </button>
          <button
            onClick={() => { setScanned(true); setFixed(true); }}
            className="bg-[#8957e5] text-white hover:bg-[#713dcc] font-mono text-xs font-bold px-4 py-2 rounded transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">build</span>
            Run Migration Reviewer
          </button>
        </div>
      </div>

      {/* Two-Column Code Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Original / Incompatible Code */}
        <div className="bg-[#181c22] border border-[#30363d] rounded flex flex-col overflow-hidden shadow-sm">
          <div className="bg-[#262a31] border-b border-[#30363d] px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#da3633]">warning</span>
              <span className="font-mono text-xs font-semibold text-[#dfe2eb]">Original / Incompatible Code</span>
            </div>
            <div className="bg-[#da3633]/20 border border-[#da3633] text-[#ffb4ac] font-mono text-[11px] px-2.5 py-0.5 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#da3633]"></span>
              {scanned ? `${breakingCount} breaking occurrences` : 'Ready to scan'}
            </div>
          </div>

          <div className="p-0 overflow-x-auto font-mono text-xs bg-[#0d1117] flex-1 min-h-[320px]">
            <table className="w-full text-left border-collapse">
              <tbody>
                {originalLines.map((line, idx) => {
                  const isBreaking = scanned && line.broken;
                  return (
                    <tr
                      key={idx}
                      className={isBreaking ? 'bg-[#da3633]/15 border-l-4 border-[#da3633]' : ''}
                    >
                      <td className="w-[42px] min-w-[42px] text-right pr-3 text-[#4a4453] select-none border-r border-[#30363d] bg-[#181c22] py-1">
                        {line.no}
                      </td>
                      <td className="pl-3 py-1 whitespace-pre font-mono">
                        {isBreaking ? (
                          <span className="text-[#ffb4ac] font-semibold">
                            <span className="text-[#da3633] font-bold mr-1.5">-</span>
                            <span className="line-through decoration-[#da3633]/70">{line.text}</span>
                          </span>
                        ) : (
                          <span className="text-[#dfe2eb]">{line.text}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Sourced Migration Patch */}
        <div className="bg-[#181c22] border border-[#30363d] rounded flex flex-col overflow-hidden relative shadow-sm border-[#8957e5]/40">
          <div className="bg-[#262a31] border-b border-[#30363d] px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#7bdb80]">auto_fix_high</span>
              <span className="font-mono text-xs font-semibold text-[#dfe2eb]">Sourced Migration Patch</span>
            </div>
            {fixed && (
              <button
                onClick={() => handleCopy(currentPresetData.v15FixedCode)}
                className="bg-transparent border border-[#30363d] text-[#8b949e] hover:text-[#dfe2eb] font-mono text-[11px] px-2.5 py-1 rounded hover:border-[#8b949e] transition flex items-center gap-1 cursor-pointer"
              >
                {copiedPatch ? <Check className="w-3 h-3 text-[#7bdb80]" /> : <Copy className="w-3 h-3" />}
                {copiedPatch ? 'Copied' : 'Copy Patch'}
              </button>
            )}
          </div>

          <div className="p-0 overflow-x-auto font-mono text-xs bg-[#0d1117] flex-1 min-h-[320px]">
            {fixed ? (
              <table className="w-full text-left border-collapse">
                <tbody>
                  {patchedLines.map((line, idx) => {
                    return (
                      <tr
                        key={idx}
                        className={line.fixed ? 'bg-[#7bdb80]/15 border-l-4 border-[#7bdb80]' : ''}
                      >
                        <td className="w-[42px] min-w-[42px] text-right pr-3 text-[#4a4453] select-none border-r border-[#30363d] bg-[#181c22] py-1">
                          {line.no}
                        </td>
                        <td className="pl-3 py-1 whitespace-pre font-mono">
                          {line.fixed ? (
                            <span className="text-[#7bdb80] font-bold">
                              <span className="mr-1.5">+</span>
                              {line.text}
                            </span>
                          ) : (
                            <span className="text-[#dfe2eb]">{line.text}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#8b949e]">
                <FileCode className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-mono">
                  Click <strong className="text-[#dfe2eb]">Run Migration Reviewer</strong> to produce the verified <code className="text-[#d3bbff] font-bold">.to_dict()</code> patch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unified Diff View */}
      {fixed && (
        <div className="bg-[#181c22] border border-[#30363d] rounded flex flex-col overflow-hidden animate-fadeIn">
          <div className="bg-[#262a31] border-b border-[#30363d] px-5 py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="font-mono text-xs text-[#dfe2eb] font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">difference</span>
                Unified Diff View
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] bg-[#1c2026] px-3 py-0.5 rounded-full border border-[#30363d]">
                <span className="text-[#7bdb80] font-bold">+{additions} additions</span>
                <span className="text-[#4a4453]">|</span>
                <span className="text-[#da3633] font-bold">-{deletions} deletions</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(rawDiff, true)}
                className="bg-[#181c22] border border-[#30363d] text-[#8b949e] hover:text-[#dfe2eb] font-mono text-[11px] px-3 py-1 rounded hover:border-[#8b949e] transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedDiff ? <Check className="w-3 h-3 text-[#7bdb80]" /> : <Copy className="w-3 h-3" />}
                {copiedDiff ? 'Copied Diff' : 'Copy Diff'}
              </button>
              <a
                href="https://github.com/stripe/stripe-python/wiki/Migration-guide-for-v15#stripeobject"
                target="_blank"
                rel="noreferrer"
                className="bg-transparent border border-[#30363d] text-[#d3bbff] hover:bg-[#8957e5]/10 font-mono text-[11px] px-3 py-1 rounded hover:border-[#8957e5] transition flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]">menu_book</span>
                View Official Stripe Wiki <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-0 overflow-x-auto font-mono text-xs bg-[#0d1117]">
            <div className="px-5 py-2 bg-[#181c22] border-b border-[#30363d] text-[#8b949e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">commit</span>
              @@ {currentPresetData.filename} @@
            </div>
            <pre className="p-5 leading-relaxed font-mono text-xs">
              {rawDiff.split('\n').map((line, idx) => {
                const isAdd = line.startsWith('+') && !line.startsWith('+++');
                const isRem = line.startsWith('-') && !line.startsWith('---');
                return (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded ${
                      isAdd ? 'bg-[#7bdb80]/15 text-[#7bdb80] font-bold' :
                      isRem ? 'bg-[#da3633]/15 text-[#ffb4ac] font-semibold' :
                              'text-[#8b949e]'
                    }`}
                  >
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>
      )}

      {/* Sourced Citation Note */}
      <div className="p-4 rounded bg-[#181c22] border border-[#30363d] text-xs font-mono text-[#8b949e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#7bdb80] shrink-0" />
          <span>
            <strong className="text-[#dfe2eb]">Official Stripe Migration Rule:</strong> In v15, dictionary operations on <code className="text-[#d3bbff] font-bold">StripeObject</code> must be called on <code className="text-[#7bdb80] font-bold">.to_dict()</code>.
          </span>
        </div>
        <a
          href="https://github.com/stripe/stripe-python/wiki/Migration-guide-for-v15#stripeobject"
          target="_blank"
          rel="noreferrer"
          className="text-[#d3bbff] hover:underline font-mono flex items-center gap-1 shrink-0"
        >
          Wiki Citation <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
