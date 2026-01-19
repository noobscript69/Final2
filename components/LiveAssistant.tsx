
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { encodeAudioPCM, decodeAudioPCM, decodeBase64Audio } from '../services/gemini';

const LiveAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [transcript, setTranscript] = useState<string[]>([]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
    if (sessionRef.current) {
      // Logic for closing session if available
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  };

  const startSession = async () => {
    if (isActive) {
      stopSession();
      return;
    }

    try {
      setStatus('connecting');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioCtxRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live session opened');
            setStatus('active');
            setIsActive(true);

            // Set up mic input
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBase64 = encodeAudioPCM(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                  media: { 
                    data: pcmBase64, 
                    mimeType: 'audio/pcm;rate=16000' 
                  } 
                });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message) => {
            // Handle transcript
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev, `AI: ${text}`]);
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscript(prev => [...prev, `You: ${text}`]);
            }

            // Handle audio output
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioCtxRef.current;
              if (!ctx) return;

              const audioBuffer = await decodeAudioPCM(decodeBase64Audio(audioData), ctx, 24000);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(ctx.destination);
              
              const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
              sourceNode.start(startTime);
              nextStartTimeRef.current = startTime + audioBuffer.duration;
              
              sourcesRef.current.add(sourceNode);
              sourceNode.onended = () => sourcesRef.current.delete(sourceNode);
            }

            // Handle interruptions
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (err) => {
            console.error('Gemini Live Error:', err);
            stopSession();
          },
          onclose: () => {
            console.log('Gemini Live closed');
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a friendly, high-energy creative assistant. Keep your responses concise and conversational.",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error('Failed to start Live session:', err);
      setStatus('idle');
      alert("Please ensure microphone access is granted.");
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">Voice Interactive AI</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Experience zero-latency conversation. Brainstorm aloud, ask questions, or just chat with the Gemini engine.
        </p>
      </div>

      <div className="relative flex items-center justify-center">
        {/* Pulsing rings when active */}
        {isActive && (
          <>
            <div className="absolute w-48 h-48 bg-indigo-500/20 rounded-full animate-ping"></div>
            <div className="absolute w-64 h-64 bg-indigo-500/10 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </>
        )}

        <button
          onClick={startSession}
          disabled={status === 'connecting'}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center text-white transition-all duration-500 shadow-2xl ${
            isActive 
              ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'
          }`}
        >
          {status === 'connecting' ? (
            <i className="fas fa-spinner fa-spin text-4xl"></i>
          ) : isActive ? (
            <i className="fas fa-stop text-4xl"></i>
          ) : (
            <i className="fas fa-microphone text-4xl"></i>
          )}
        </button>
      </div>

      <div className="text-center">
        <p className={`text-lg font-medium transition-colors duration-300 ${
          status === 'active' ? 'text-indigo-400' : 'text-slate-500'
        }`}>
          {status === 'idle' && 'Click to start conversation'}
          {status === 'connecting' && 'Establishing neural link...'}
          {status === 'active' && 'Gemini is listening...'}
        </p>
      </div>

      {transcript.length > 0 && (
        <div className="w-full max-w-2xl glass rounded-2xl p-6 border border-slate-800 max-h-48 overflow-y-auto space-y-2">
          {transcript.slice(-10).map((t, i) => (
            <p key={i} className={`text-sm ${t.startsWith('You:') ? 'text-slate-400' : 'text-indigo-300'}`}>
              {t}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl pt-8">
        <div className="glass p-6 rounded-2xl border border-slate-800 text-center">
          <i className="fas fa-bolt text-indigo-500 mb-3 text-xl"></i>
          <h4 className="font-bold text-slate-200">Zero Latency</h4>
          <p className="text-xs text-slate-500 mt-1">Real-time processing for natural flow.</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-slate-800 text-center">
          <i className="fas fa-waveform text-purple-500 mb-3 text-xl"></i>
          <h4 className="font-bold text-slate-200">PCM Audio</h4>
          <p className="text-xs text-slate-500 mt-1">High-fidelity 24kHz stream output.</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-slate-800 text-center">
          <i className="fas fa-user-robot text-blue-500 mb-3 text-xl"></i>
          <h4 className="font-bold text-slate-200">Proactive Turn</h4>
          <p className="text-xs text-slate-500 mt-1">Seamlessly handles interruptions.</p>
        </div>
      </div>
    </div>
  );
};

export default LiveAssistant;
