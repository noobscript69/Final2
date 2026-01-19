
import React, { useState, useRef, useEffect } from 'react';
import { generateBrainstorm } from '../services/gemini';
import { Message } from '../types';

const IdeaGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await generateBrainstorm(input);
      const aiMsg: Message = { role: 'assistant', content: response || 'No response generated.', timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error generating ideas. Please try again.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh]">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Brainstorming Studio</h2>
        <p className="text-slate-400">Collaborate with Gemini to unlock creative potential and generate innovative concepts.</p>
      </div>

      <div 
        ref={scrollRef}
        className="flex-grow glass rounded-2xl p-6 overflow-y-auto mb-6 space-y-6 border border-slate-800"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-lightbulb text-2xl"></i>
            </div>
            <p className="max-w-xs">Enter a topic, problem, or project name to start generating ideas.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div 
            key={msg.timestamp + i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-200'
            }`}>
              <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl px-4 py-2 text-slate-400 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's on your mind? e.g., 'Eco-friendly urban delivery ideas'"
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg shadow-xl"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-3 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 rounded-xl transition-colors text-white font-bold"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default IdeaGenerator;
