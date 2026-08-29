import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Send, 
  Terminal, 
  RefreshCw
} from 'lucide-react';
import { ApiService } from '../services/api';
import { ProviderHealth, ProviderModel } from '../types';

export const CodexPlayground: React.FC = () => {
  const [health, setHealth] = useState<ProviderHealth | null>(null);
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [prompt, setPrompt] = useState<string>(
    'Upgrade demo_target to the latest stable stripe-python release.'
  );
  const [includeTools, setIncludeTools] = useState<boolean>(true);
  const [response, setResponse] = useState<any>(null);
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
        name: "latest_stripe_python_release",
        description: "Return the latest stable stripe-python release from official GitHub data.",
        parameters: { type: "object", properties: {} }
      }
    },
    {
      type: "function",
      function: {
        name: "analyze_stripe_python_upgrade",
        description: "Compare an installed stripe-python version with official migration guidance.",
        parameters: {
          type: "object",
          properties: {
            current_version: { type: "string", description: "Installed Stripe Python version" }
          },
          required: ["current_version"]
        }
      }
    }
  ];

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    const res = await ApiService.sendChatMessage(prompt, includeTools ? sampleTools : []);
    setResponse(res);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Local Codex Provider Adapter (Port 8765)
          </h2>
          <p className="text-xs text-slate-400">
            OpenAI-compatible <code className="text-slate-300">/v1/chat/completions</code> bridge delegating to ephemeral <code className="text-slate-300">codex exec</code> sandboxes.
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Health Check
        </button>
      </div>

      {/* Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-semibold mb-1">Adapter Endpoint</div>
          <div className="text-sm font-mono text-indigo-300 font-bold">http://127.0.0.1:8765/v1</div>
          <div className="text-[11px] text-slate-500 mt-1">Configured in TrueForge Settings → Models</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-semibold mb-1">Codex CLI Authentication</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-sm font-mono text-emerald-400 font-bold uppercase">
              {health?.authentication || 'signed_in'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Via local codex login subscription</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-semibold mb-1">Registered Models</div>
          <div className="text-sm font-mono text-white font-bold">
            {models.length > 0 ? models[0].id : 'codex-subscription'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Single model ID exposed to TrueForge</div>
        </div>
      </div>

      {/* Request Playground */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          Test Model Turn & Tool Call Output
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            User Message / Prompt:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Request
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="tools-toggle"
            checked={includeTools}
            onChange={(e) => setIncludeTools(e.target.checked)}
            className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
          />
          <label htmlFor="tools-toggle" className="text-xs text-slate-300 cursor-pointer">
            Supply DriftFix MCP Tool definitions (<code className="text-indigo-400">latest_release</code>, <code className="text-indigo-400">analyze_upgrade</code>)
          </label>
        </div>

        {/* Structured Response Viewer */}
        {response && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 font-mono">
                OpenAI-Compatible Response (ChatCompletion)
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span>Finish Reason: <strong className="text-indigo-300">{response.choices[0]?.finish_reason}</strong></span>
                <span>Tokens: <strong className="text-emerald-300">{response.usage?.total_tokens}</strong></span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <pre className="text-indigo-200">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
