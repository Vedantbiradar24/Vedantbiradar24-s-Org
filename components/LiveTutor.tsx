import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Loader2, Radio } from 'lucide-react';
import { LiveTutorClient } from '../services/gemini';

const LiveTutor: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const clientRef = useRef<LiveTutorClient | null>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  const handleToggleConnection = async () => {
    if (isConnected) {
      clientRef.current?.disconnect();
      setIsConnected(false);
    } else {
      setError(null);
      setIsConnecting(true);
      
      const client = new LiveTutorClient(
        () => {
          setIsConnected(true);
          setIsConnecting(false);
        },
        () => {
          setIsConnected(false);
          setIsConnecting(false);
        },
        (err) => {
          console.error("Live Error:", err);
          setError("Connection failed. Please check your microphone permissions.");
          setIsConnecting(false);
          setIsConnected(false);
        },
        (vol) => {
          setVolume(Math.min(vol * 5, 1)); // Amplify for visual
        }
      );
      
      clientRef.current = client;
      try {
        await client.connect();
      } catch (e) {
        setError("Failed to access microphone or connect.");
        setIsConnecting(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-center">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Radio className="text-rose-500 animate-pulse" />
          Live Study Partner
        </h2>
        <p className="text-slate-600 mt-2">
          Have a real voice conversation with your AI tutor. Ask questions and get instant answers.
        </p>
      </div>

      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-12 overflow-hidden">
        {/* Abstract Background Animation */}
        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-50 transition-opacity duration-1000 ${isConnected ? 'opacity-100' : ''}`} />
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
          
          {/* Status Indicator */}
          <div className={`
             px-4 py-1 rounded-full text-sm font-medium transition-colors
             ${isConnected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}
          `}>
            {isConnected ? '● Live Session Active' : '● Session Disconnected'}
          </div>

          {/* Visualizer Circle */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            {isConnected && (
               <>
                <div 
                  className="absolute bg-indigo-500 rounded-full opacity-20 transition-all duration-75 ease-out"
                  style={{ width: `${100 + volume * 100}%`, height: `${100 + volume * 100}%` }}
                />
                <div 
                  className="absolute bg-indigo-500 rounded-full opacity-30 transition-all duration-100 ease-out"
                  style={{ width: `${90 + volume * 80}%`, height: `${90 + volume * 80}%` }}
                />
               </>
            )}
            <div className={`
              w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-all duration-500
              ${isConnected ? 'bg-indigo-600 text-white scale-110' : 'bg-white text-slate-300 border-4 border-slate-100'}
            `}>
              <Mic className="w-12 h-12" />
            </div>
          </div>

          {/* Controls */}
          <button
            onClick={handleToggleConnection}
            disabled={isConnecting}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105
              ${isConnected 
                ? 'bg-red-500 hover:bg-red-600 text-white ring-red-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white ring-indigo-200'}
              ${isConnecting ? 'opacity-80 cursor-wait' : ''}
              focus:outline-none focus:ring-4
            `}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Connecting...
              </>
            ) : isConnected ? (
              <>
                <MicOff className="w-6 h-6" />
                End Session
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                Start Conversation
              </>
            )}
          </button>
          
          {error && (
            <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <p className="text-sm text-slate-400">
            Microphone permission required. Works best with headphones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveTutor;