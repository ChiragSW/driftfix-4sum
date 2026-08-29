import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Overview } from './components/Overview';
import { MigrationAnalyzer } from './components/MigrationAnalyzer';
import { CodeScanner } from './components/CodeScanner';
import { SandboxRunner } from './components/SandboxRunner';
import { CodexPlayground } from './components/CodexPlayground';
import { TrueForgeWorkflow } from './components/TrueForgeWorkflow';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <Overview setActiveTab={setActiveTab} />}
        {activeTab === 'analyzer' && <MigrationAnalyzer />}
        {activeTab === 'scanner' && <CodeScanner />}
        {activeTab === 'sandbox' && <SandboxRunner />}
        {activeTab === 'codex' && <CodexPlayground />}
        {activeTab === 'trueforge' && <TrueForgeWorkflow />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DriftFix • Team 4Sum • Sourced Stripe Python Migration Engine</span>
          <span>MIT Licensed • TrueForge 0.1.4 Verified Harness</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
