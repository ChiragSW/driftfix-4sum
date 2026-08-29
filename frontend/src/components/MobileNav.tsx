import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  BookOpen, 
  Zap, 
  FileCode, 
  Terminal, 
  Cpu, 
  GitPullRequest 
} from 'lucide-react';
import clsx from 'clsx';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'overview',   label: 'Overview & Docs',       icon: BookOpen },
  { id: 'analyzer',   label: 'Migration Analyzer',    icon: Zap },
  { id: 'scanner',    label: 'Impact Scout & Fixer',  icon: FileCode },
  { id: 'sandbox',    label: 'Daytona Sandbox',       icon: Terminal },
  { id: 'codex',      label: 'Codex Provider',        icon: Cpu },
  { id: 'trueforge',  label: 'TrueForge Workflow',    icon: GitPullRequest },
];

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        aria-label="Toggle navigation"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed top-16 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 shadow-2xl">
            <ul className="divide-y divide-slate-800">
              {navItems.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    onClick={() => handleSelect(id)}
                    className={clsx(
                      'flex w-full items-center gap-3 px-5 py-3.5 text-sm font-medium transition',
                      activeTab === id
                        ? 'bg-indigo-600/20 text-indigo-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
};
