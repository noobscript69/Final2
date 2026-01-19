
import React, { useState } from 'react';
import { generateAIImage } from '../services/gemini';
import { GeneratedImage } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const url = await generateAIImage(prompt);
      const newImg: GeneratedImage = {
        url,
        prompt,
        timestamp: Date.now()
      };
      setImages(prev => [newImg, ...prev]);
      setPrompt('');
    } catch (err) {
      console.error(err);
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">Visual Synthesis</h2>
          <p className="text-slate-400">Transform your descriptions into stunning high-fidelity visuals using Gemini 2.5.</p>
        </div>
      </div>

      <div className="glass p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your vision... e.g., 'A futuristic cyberpunk library floating in space'"
            className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <i className="fas fa-circle-notch animate-spin"></i>
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <i className="fas fa-wand-sparkles"></i>
                Generate
              </span>
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <div key={img.timestamp} className="group relative overflow-hidden rounded-2xl glass border border-slate-800 transition-all hover:scale-[1.02]">
            <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
              <p className="text-sm font-medium text-white line-clamp-2">{img.prompt}</p>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = img.url;
                  link.download = `lumina-gen-${img.timestamp}.png`;
                  link.click();
                }}
                className="mt-4 w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white py-2 rounded-xl text-sm font-bold transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        ))}

        {loading && (
          <div className="aspect-square glass border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Manifesting pixels...</p>
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
            <i className="fas fa-images text-6xl mb-6 opacity-20"></i>
            <p className="text-xl font-medium">Your gallery is currently empty.</p>
            <p className="mt-2 text-slate-600">Enter a prompt above to generate your first masterpiece.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
