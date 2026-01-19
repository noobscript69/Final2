
import React from 'react';
import { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: AppTab.BRAINSTORM, label: 'Brainstorm', icon: 'fa-lightbulb' },
    { id: AppTab.VISUALIZE, label: 'Visualize', icon: 'fa-wand-magic-sparkles' },
    { id: AppTab.LIVE, label: 'Live Talk', icon: 'fa-microphone' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab(AppTab.BRAINSTORM)}>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <i className="fas fa-sparkles text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Lumina AI</h1>
        </div>

        <nav className="flex bg-slate-900/50 p-1 rounded-full border border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
