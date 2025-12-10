import React, { useState } from 'react';
import { Video, Loader2, Play } from 'lucide-react';
import { generateVideo } from '../services/gemini';

const VideoExplainer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Check for API key selection for Veo
    // Cast window to any to avoid type conflict with existing Window definition from environment
    const win = window as any;
    if (win.aistudio) {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        try {
          await win.aistudio.openSelectKey();
          // Proceed assuming key selection was successful (race condition mitigation)
        } catch (e) {
          setStatus("API Key selection was cancelled or failed.");
          return;
        }
      }
    }

    setLoading(true);
    setStatus('Initializing video generation...');
    setVideoUrl(null);

    try {
      setStatus('Dreaming up your video... This uses Veo and may take 1-2 minutes. Hang tight!');
      const url = await generateVideo(prompt);
      if (url) {
        setVideoUrl(url);
        setStatus('');
      } else {
        setStatus('Failed to generate video.');
      }
    } catch (e) {
      console.error(e);
      setStatus('An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
       <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Video className="text-indigo-600" />
          Video Explainer
        </h2>
        <p className="text-slate-600">Generate a short AI video to visualize a concept.</p>
        <p className="text-xs text-slate-400 mt-1">Powered by Veo. Requires paid project selection.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
         <textarea
            className="w-full p-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
            placeholder="Describe the video you want. e.g. 'A cinematic view of the solar system showing planetary orbits'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
           <div className="mt-4 flex justify-end">
            <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Generate Video'}
            </button>
           </div>
      </div>

      {loading && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
           <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
           <p className="text-slate-600 font-medium">{status}</p>
           <p className="text-xs text-slate-400 mt-2">Please wait, high quality video takes time.</p>
        </div>
      )}

      {videoUrl && (
        <div className="bg-black rounded-xl overflow-hidden shadow-2xl mx-auto max-w-2xl">
           <video controls autoPlay loop className="w-full h-auto">
             <source src={videoUrl} type="video/mp4" />
             Your browser does not support the video tag.
           </video>
        </div>
      )}
    </div>
  );
};

export default VideoExplainer;
