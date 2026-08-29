import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview', label: 'Overview & Docs' },
    { id: 'analyzer', label: 'Migration Analyzer' },
    { id: 'scanner', label: 'Impact Scout & Fixer' },
    { id: 'sandbox', label: 'Daytona Sandbox' },
    { id: 'codex', label: 'Codex Provider' },
    { id: 'trueforge', label: 'TrueForge Workflow' },
  ];

  return (
    <header className="bg-surface dark:bg-surface border-b border-outline-variant full-width top-0 z-50 sticky">
      <div className="flex justify-between items-center w-full px-md h-16 max-w-container-max mx-auto">
        <div className="flex items-center gap-md">
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('overview')} 
            className="cursor-pointer flex items-center"
          >
            <img 
              src="/assets/logo.png" 
              alt="DriftFix Official Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-md h-full items-end pt-4">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={
                    isActive
                      ? 'font-label-md text-label-md text-primary border-b-2 border-primary pb-2 opacity-90 transition-all duration-150 whitespace-nowrap'
                      : 'font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-2 hover:bg-surface-variant/50 transition-all duration-150 whitespace-nowrap px-1'
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-sm font-label-md text-label-md text-on-surface-variant">
          <span className="font-mono">v0.1.0</span>
          <span 
            className="material-symbols-outlined text-[18px] cursor-pointer hover:text-primary transition-colors" 
            title="Codex Provider Ready"
          >
            check_circle
          </span>
          <span 
            className="material-symbols-outlined text-[18px] cursor-pointer hover:text-primary transition-colors" 
            title="DriftFix MCP Connected"
          >
            database
          </span>
          <span 
            className="material-symbols-outlined text-[18px] cursor-pointer hover:text-primary transition-colors" 
            title="Daytona Harness Linked"
          >
            link
          </span>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex overflow-x-auto border-t border-outline-variant/60 bg-surface-container-lowest px-2 py-1 gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`font-label-md text-label-md px-2 py-1 rounded-sm whitespace-nowrap transition ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
