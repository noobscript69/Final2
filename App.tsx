
import React, { useState } from 'react';
import { AppTab } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import IdeaGenerator from './components/IdeaGenerator';
import ImageGenerator from './components/ImageGenerator';
import LiveAssistant from './components/LiveAssistant';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.BRAINSTORM);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.BRAINSTORM:
        return <IdeaGenerator />;
      case AppTab.VISUALIZE:
        return <ImageGenerator />;
      case AppTab.LIVE:
        return <LiveAssistant />;
      default:
        return <IdeaGenerator />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-in fade-in duration-700">
          {renderContent()}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
