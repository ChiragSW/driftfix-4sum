import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { ProviderHealth, ProviderModel } from '../types';

export const CodexPlayground: React.FC = () => {
  const [health, setHealth] = useState<ProviderHealth | null>(null);
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [prompt, setPrompt] = useState<string>(
    'Upgrade demo_target to use latest Stripe API patterns, applying SKILL rules 1-4.'
  );
  const [showTools, setShowTools] = useState<boolean>(false);
  const [response, setResponse] = useState<any>({
    id: "cdx-resp-892a1",
    object: "chat.completion",
    choices: [
      {
        message: {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_9a8b7",
              type: "function",
              function: {
                name: "patch_file",
                arguments: "{\"file\": \"customer_service.py\", \"diff\": \"to_dict() conversions\"}"
              }
            }
          ]
        }
      }
    ]
  });
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatus = async () => {
    const h = await ApiService.getProviderHealth();
    const m = await ApiService.getModels();
    setHealth(h);
    setModels(m);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const sampleTools = [
    {
      type: "function",
      function: {
        name: "analyze_drift",
        description: "Scans AST for deprecated usage"
      }
    }
  ];

  const handleSend = async () => {
    setLoading(true);
    const res = await ApiService.sendChatMessage(prompt, sampleTools);
    setResponse(res);
    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header matching Stitch Screen 6 */}
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#dfe2eb]">
          Local Codex Provider Playground
        </h1>

        {/* Top Adapter Status Bar */}
        <div className="bg-[#181c22] border border-[#30363d] rounded p-4 flex items-center gap-4 w-fit flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Adapter:</span>
            <span className="font-mono text-sm text-[#d3bbff] font-bold">http://127.0.0.1:8765/v1</span>
          </div>
          <div className="w-px h-4 bg-[#30363d] hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Model:</span>
            <span className="font-mono text-sm text-[#dfe2eb] font-semibold">
              {models.length > 0 ? models[0].id : 'codex-subscription'}
            </span>
          </div>
          <div className="w-px h-4 bg-[#30363d] hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7bdb80]"></span>
            <span className="text-xs font-semibold text-[#7bdb80] uppercase tracking-wider">
              {health?.authentication || 'Ready'}
            </span>
          </div>
        </div>

        {/* 2-Column Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left: Request Pipeline */}
          <div className="bg-[#181c22] border border-[#30363d] rounded flex flex-col h-[520px] shadow-sm">
            <div className="border-b border-[#30363d] px-5 py-3.5 bg-[#1c2026] flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#dfe2eb]">Request Pipeline</span>
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-[#8957e5] text-white px-4 py-1.5 rounded text-xs font-semibold hover:bg-[#713dcc] transition cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Executing...' : 'Execute'}
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8b949e]">System Prompt</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-[#10141a] border border-[#30363d] text-[#dfe2eb] font-mono text-xs p-3 h-20 resize-none rounded focus:border-[#8957e5] outline-none"
                  placeholder="Enter system instructions..."
                />
              </div>

              <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                <label className="text-xs font-semibold text-[#8b949e]">User Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-[#10141a] border border-[#30363d] text-[#dfe2eb] font-mono text-xs p-3 flex-1 resize-none rounded focus:border-[#8957e5] outline-none"
                />
              </div>

              <div className="mt-auto pt-2 border-t border-[#30363d]/60">
                <div
                  onClick={() => setShowTools(!showTools)}
                  className="flex items-center justify-between cursor-pointer py-1 text-xs font-semibold text-[#8b949e] hover:text-[#dfe2eb] transition"
                >
                  <span>Tool Definitions ({sampleTools.length})</span>
                  <span className="material-symbols-outlined text-sm">
                    {showTools ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
                {showTools && (
                  <div className="mt-2 border border-[#30363d] bg-[#10141a] p-3 rounded font-mono text-xs text-[#8b949e] h-28 overflow-y-auto">
                    <pre><code>{JSON.stringify(sampleTools, null, 2)}</code></pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Structured Response */}
          <div className="bg-[#181c22] border border-[#30363d] rounded flex flex-col h-[520px] shadow-sm">
            <div className="border-b border-[#30363d] px-5 py-3.5 bg-[#1c2026] flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#dfe2eb]">Structured Response</span>
              <span className="font-mono text-xs text-[#7bdb80] font-semibold">200 OK - 420ms</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto bg-[#10141a] m-3 border border-[#30363d] rounded font-mono text-xs leading-relaxed">
              <pre className="text-[#dfe2eb] whitespace-pre-wrap">
                <code>
                  {JSON.stringify(response, null, 2)}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
