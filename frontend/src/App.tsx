import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SideRepoBar } from './components/SideRepoBar';
import { Overview } from './components/Overview';
import { MigrationAnalyzer } from './components/MigrationAnalyzer';
import { CodeScanner } from './components/CodeScanner';
import { SandboxRunner } from './components/SandboxRunner';
import { CodexPlayground } from './components/CodexPlayground';
import { TrueForgeWorkflow } from './components/TrueForgeWorkflow';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="min-h-screen flex flex-col bg-[#10141a] text-[#dfe2eb] w-full">
      {/* Top Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container Layout */}
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
        {/* Pinned Left Sidebar */}
        <SideRepoBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 w-full min-w-0 flex flex-col justify-start">
          {activeTab === 'overview' && <Overview setActiveTab={setActiveTab} />}
          {activeTab === 'analyzer' && <MigrationAnalyzer />}
          {activeTab === 'scanner' && <CodeScanner />}
          {activeTab === 'sandbox' && <SandboxRunner />}
          {activeTab === 'codex' && <CodexPlayground />}
          {activeTab === 'trueforge' && <TrueForgeWorkflow />}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#10141a] border-t border-[#30363d] w-full mt-auto py-3 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full px-6 max-w-[1600px] mx-auto text-xs font-mono text-[#8b949e] gap-2">
          <span>DriftFix • Team 4Sum • Sourced Stripe Python Migration Engine</span>
          <div className="flex gap-4">
            <span className="hover:text-[#d3bbff] transition-colors cursor-pointer">MIT Licensed</span>
            <span className="hover:text-[#d3bbff] transition-colors cursor-pointer">TrueForge 0.1.4 Verified Harness</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
