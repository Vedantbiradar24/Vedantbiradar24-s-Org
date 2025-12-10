import React, { useState } from 'react';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { generateConceptMap } from '../services/gemini';

const ConceptVisualizer: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleVisualize = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const svg = await generateConceptMap(topic);
      setSvgContent(svg);
    } catch (e) {
      console.error(e);
      setSvgContent('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BrainCircuit className="text-indigo-600" />
          Concept Visualizer
        </h2>
        <p className="text-slate-600">Enter a complex topic and see it as a diagram or mind map.</p>
      </div>

      <div className="flex gap-4 mb-8">
         <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. The Water Cycle, Neural Networks Structure"
          className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          onKeyDown={(e) => e.key === 'Enter' && handleVisualize()}
        />
        <button
          onClick={handleVisualize}
          disabled={loading || !topic.trim()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Visualize'}
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-inner border border-slate-200 p-4 flex items-center justify-center overflow-auto min-h-[400px]">
        {loading ? (
            <div className="text-center text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2 text-indigo-400" />
                <p>Drawing diagram...</p>
            </div>
        ) : svgContent ? (
          <div 
            className="w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svgContent }} 
          />
        ) : (
          <div className="text-center text-slate-400">
            <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Visual representation will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptVisualizer;