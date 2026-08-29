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
    <div className="w-full flex flex-col gap-lg animate-fadeIn">
      {/* Header matching Stitch Screen 6 */}
      <section className="flex flex-col gap-md">
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Local Codex Provider Playground</h1>

        {/* Top Adapter Status Bar */}
        <div className="bg-surface border border-outline-variant rounded p-sm flex items-center gap-md w-fit">
          <div className="flex items-center gap-xs">
            <span className="font-label-md text-on-surface-variant uppercase font-bold">Adapter:</span>
            <span className="font-code text-body-md text-primary font-bold">http://127.0.0.1:8765/v1</span>
          </div>
          <div className="w-px h-4 bg-outline-variant"></div>
          <div className="flex items-center gap-xs">
            <span className="font-label-md text-on-surface-variant uppercase font-bold">Model:</span>
            <span className="font-code text-body-md text-on-surface font-bold">
              {models.length > 0 ? models[0].id : 'codex-subscription'}
            </span>
          </div>
          <div className="w-px h-4 bg-outline-variant"></div>
          <div className="flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-label-md text-secondary uppercase font-bold">
              {health?.authentication || 'Ready'}
            </span>
          </div>
        </div>

        {/* 2-Column Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-md">
          {/* Left: Request Pipeline */}
          <div className="bg-surface border border-outline-variant rounded flex flex-col h-[500px]">
            <div className="border-b border-outline-variant p-sm bg-surface-container-low flex justify-between items-center">
              <span className="font-label-md text-on-surface uppercase font-bold">Request Pipeline</span>
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-primary-container text-on-primary-container px-sm py-xs rounded font-label-md hover:opacity-90 transition-opacity cursor-pointer font-bold disabled:opacity-50"
              >
                {loading ? 'Executing...' : 'Execute'}
              </button>
            </div>

            <div className="p-sm flex-1 flex flex-col gap-sm overflow-hidden">
              <label className="font-label-md text-on-surface-variant font-bold">System Prompt</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-background border border-outline-variant text-on-surface font-code text-body-sm p-sm h-24 resize-none rounded focus:border-primary outline-none"
                placeholder="Enter system instructions..."
              />

              <label className="font-label-md text-on-surface-variant font-bold">User Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-background border border-outline-variant text-on-surface font-code text-body-sm p-sm flex-1 resize-none rounded focus:border-primary outline-none"
              />

              <div className="mt-auto">
                <div
                  onClick={() => setShowTools(!showTools)}
                  className="flex items-center justify-between cursor-pointer p-xs hover:bg-surface-variant rounded transition-colors"
                >
                  <span className="font-label-md text-on-surface-variant font-bold">Tool Definitions ({sampleTools.length})</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">
                    {showTools ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
                {showTools && (
                  <div className="mt-xs border border-outline-variant bg-background p-xs rounded font-code text-body-sm text-on-surface-variant h-32 overflow-y-auto">
                    <pre><code>{JSON.stringify(sampleTools, null, 2)}</code></pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Structured Response */}
          <div className="bg-surface border border-outline-variant rounded flex flex-col h-[500px]">
            <div className="border-b border-outline-variant p-sm bg-surface-container-low flex justify-between items-center">
              <span className="font-label-md text-on-surface uppercase font-bold">Structured Response</span>
              <span className="font-label-md text-secondary font-bold">200 OK - 420ms</span>
            </div>
            <div className="p-sm flex-1 overflow-y-auto bg-background m-xs border border-outline-variant rounded font-code text-body-sm leading-relaxed">
              <pre className="text-on-surface whitespace-pre-wrap p-sm">
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
