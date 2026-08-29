import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  GitPullRequest, 
  FileCode, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  BookOpen
} from 'lucide-react';
import { ApiService } from '../services/api';
import { ProviderHealth } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [health, setHealth] = useState<ProviderHealth | null>(null);

  useEffect(() => {
    ApiService.getProviderHealth().then(setHealth);
    const timer = setInterval(() => {
      ApiService.getProviderHealth().then(setHealth);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview & Docs', icon: BookOpen },
    { id: 'analyzer', label: 'Migration Analyzer', icon: Zap },
    { id: 'scanner', label: 'Impact Scout & Fixer', icon: FileCode },
    { id: 'sandbox', label: 'Daytona Sandbox', icon: Terminal },
    { id: 'codex', label: 'Codex Provider', icon: Cpu },
    { id: 'trueforge', label: 'TrueForge Workflow', icon: GitPullRequest },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  DriftFix
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v0.1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Stripe Python Migration Engine</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Status Pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-slate-400">Codex:</span>
              <span className="text-emerald-400 font-medium">{health?.authentication || 'ready'}</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300">MCP Read-Only</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
