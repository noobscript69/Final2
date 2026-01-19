
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 py-8 px-6 mt-12 bg-slate-950/80">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 opacity-50">
          <i className="fas fa-sparkles text-indigo-500"></i>
          <span className="font-semibold tracking-tight text-slate-300">Lumina AI Studio</span>
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
          <span className="hover:text-indigo-400 cursor-pointer transition-colors">Documentation</span>
          <span className="hover:text-indigo-400 cursor-pointer transition-colors">API Reference</span>
          <span className="hover:text-indigo-400 cursor-pointer transition-colors">Privacy Policy</span>
        </div>
        <p className="text-xs text-slate-600">
          Built with Gemini Flash 3.0 & 2.5 Image
        </p>
      </div>
    </footer>
  );
};

export default Footer;
