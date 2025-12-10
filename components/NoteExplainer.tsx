import React, { useState } from 'react';
import { Upload, Loader2, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeImage } from '../services/gemini';

const NoteExplainer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
      setExplanation('');
    }
  };

  const handleExplain = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await analyzeImage(
        file, 
        "Explain this study material in simple language. Create short, structured notes from it. Highlight key concepts."
      );
      setExplanation(result);
    } catch (error) {
      console.error(error);
      setExplanation("Sorry, something went wrong while analyzing the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="text-indigo-600" />
          Note Explainer
        </h2>
        <p className="text-slate-600 mt-2">Upload a photo of your textbook or notes, and I'll explain it simply.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-colors
            ${file ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
          `}>
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded shadow-sm" />
                <button 
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="w-12 h-12 text-slate-400 mb-3" />
                <span className="text-sm font-medium text-slate-700">Click to upload image</span>
                <span className="text-xs text-slate-500 mt-1">JPG, PNG supported</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>

          <button
            onClick={handleExplain}
            disabled={!file || loading}
            className={`
              w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2
              ${!file || loading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all'}
            `}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Explain Notes'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
          <h3 className="font-semibold text-slate-900 mb-4 border-b pb-2">Explanation & Notes</h3>
          {explanation ? (
            <div className="prose prose-sm prose-indigo max-w-none text-slate-700">
              <ReactMarkdown>{explanation}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <BookOpen className="w-12 h-12 mb-3 opacity-20" />
              <p>Upload an image to see the explanation here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteExplainer;