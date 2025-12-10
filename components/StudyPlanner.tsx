import React, { useState } from 'react';
import { Calendar, Globe, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateStudyPlan } from '../services/gemini';

const StudyPlanner: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [useSearch, setUseSearch] = useState(true);
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePlan = async () => {
    if (!subject || !date) return;
    setLoading(true);
    try {
      const result = await generateStudyPlan(subject, date, useSearch);
      setPlan(result);
    } catch (e) {
      console.error(e);
      setPlan("Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="text-indigo-600" />
          Personalized Study Planner
        </h2>
        <p className="text-slate-600">Get a day-by-day plan to crush your exam.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject / Exam Name</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Calculus Final, Biology 101"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Exam Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={useSearch}
              onChange={(e) => setUseSearch(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" 
            />
            <span className="text-slate-700 flex items-center gap-1">
              <Globe className="w-4 h-4 text-blue-500" /> Use Google Search for resources
            </span>
          </label>

          <button
            onClick={handleCreatePlan}
            disabled={!subject || !date || loading}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Generate Plan'}
          </button>
        </div>
      </div>

      {plan && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="prose prose-indigo max-w-none">
            <ReactMarkdown>{plan}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;