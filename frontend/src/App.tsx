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
    <div className="font-body-md text-body-md antialiased min-h-screen flex flex-col bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Layout Area */}
      <div className="flex flex-1 max-w-container-max mx-auto w-full">
        {/* SideNavBar */}
        <SideRepoBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-[260px] p-md md:p-lg w-full pb-16">
          {activeTab === 'overview' && <Overview setActiveTab={setActiveTab} />}
          {activeTab === 'analyzer' && <MigrationAnalyzer />}
          {activeTab === 'scanner' && <CodeScanner />}
          {activeTab === 'sandbox' && <SandboxRunner />}
          {activeTab === 'codex' && <CodexPlayground />}
          {activeTab === 'trueforge' && <TrueForgeWorkflow />}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface dark:bg-surface border-t border-outline-variant full-width mt-auto z-50">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full px-lg py-sm max-w-container-max mx-auto gap-2">
          <span className="font-code text-body-sm font-bold text-on-surface-variant">
            DriftFix • Team 4Sum • Sourced Stripe Python Migration Engine
          </span>
          <div className="flex gap-md font-code text-body-sm">
            <span className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              MIT Licensed
            </span>
            <span className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              TrueForge 0.1.4 Verified Harness
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
