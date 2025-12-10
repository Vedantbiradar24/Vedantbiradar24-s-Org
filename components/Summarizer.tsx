import React, { useState } from 'react';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { summarizeText } from '../services/gemini';

const Summarizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await summarizeText(input);
      setSummary(result);
    } catch (err) {
      setSummary("Failed to summarize.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="text-indigo-600" />
          Smart Summarizer
        </h2>
        <p className="text-slate-600">Paste long text or chapters here to get concise bullet points.</p>
      </div>

      <div className="flex-1 grid md:grid-cols-2 gap-6 min-h-0">
        <div className="flex flex-col gap-4 h-full">
          <textarea
            className="flex-1 w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-700 placeholder-slate-400 shadow-sm"
            placeholder="Paste your text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleSummarize}
            disabled={!input.trim() || loading}
            className={`
              py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm flex-shrink-0
              ${!input.trim() || loading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'}
            `}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Summarize'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 overflow-y-auto shadow-inner h-full">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Summary Output</h3>
          {summary ? (
            <div className="prose prose-sm prose-indigo max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-slate-400 italic">
              Summary will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summarizer;