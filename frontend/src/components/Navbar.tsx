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
    <header className="bg-[#10141a] border-b border-[#30363d] sticky top-0 z-50 w-full h-16 shrink-0">
      <div className="flex justify-between items-center w-full px-6 h-full max-w-[1600px] mx-auto">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('overview')} 
            className="flex items-center gap-3 cursor-pointer group focus:outline-none"
          >
            <img 
              src="/assets/logo.png" 
              alt="DriftFix Official Logo" 
              className="h-8 w-auto object-contain rounded"
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 h-full items-end pb-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-sm font-medium transition-all duration-150 pb-4 border-b-2 px-1 focus:outline-none ${
                    isActive
                      ? 'text-[#d3bbff] border-[#8957e5] font-semibold'
                      : 'text-[#8b949e] border-transparent hover:text-[#dfe2eb] hover:border-[#30363d]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#8b949e] px-2.5 py-1 bg-[#181c22] border border-[#30363d] rounded">
            v0.1.0
          </span>
          <div className="flex items-center gap-1.5 text-[#8b949e]">
            <button 
              className="p-1 rounded hover:text-[#7bdb80] hover:bg-[#262a31] transition"
              title="Codex Provider (Ready)"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </button>
            <button 
              className="p-1 rounded hover:text-[#d3bbff] hover:bg-[#262a31] transition"
              title="DriftFix MCP (Connected)"
            >
              <span className="material-symbols-outlined text-[18px]">database</span>
            </button>
            <button 
              className="p-1 rounded hover:text-[#d3bbff] hover:bg-[#262a31] transition"
              title="Daytona Sandbox (Linked)"
            >
              <span className="material-symbols-outlined text-[18px]">link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex overflow-x-auto border-t border-[#30363d] bg-[#181c22] px-4 py-2 gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-xs px-3 py-1.5 rounded whitespace-nowrap font-medium transition ${
                isActive
                  ? 'bg-[#8957e5] text-white font-semibold'
                  : 'text-[#8b949e] hover:text-[#dfe2eb]'
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
