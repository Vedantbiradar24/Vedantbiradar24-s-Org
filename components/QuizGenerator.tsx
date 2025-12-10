import React, { useState } from 'react';
import { CheckSquare, Loader2, RefreshCw } from 'lucide-react';
import { generateQuiz } from '../services/gemini';
import { QuizQuestion } from '../types';

const QuizGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuiz([]);
    setUserAnswers([]);
    setShowResults(false);
    
    try {
      const questions = await generateQuiz(topic);
      setQuiz(questions);
      setUserAnswers(new Array(questions.length).fill(-1));
    } catch (e) {
      console.error(e);
      alert("Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qIndex: number, aIndex: number) => {
    if (showResults) return;
    const newAnswers = [...userAnswers];
    newAnswers[qIndex] = aIndex;
    setUserAnswers(newAnswers);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CheckSquare className="text-indigo-600" />
          Quiz Generator
        </h2>
        <p className="text-slate-600">Test your knowledge on any topic.</p>
      </div>

      <div className="flex gap-4 mb-8">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic (e.g., Photosynthesis, World War II)"
          className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Generate'}
        </button>
      </div>

      <div className="space-y-6">
        {quiz.map((q, qIdx) => (
          <div key={qIdx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg text-slate-800 mb-4">{qIdx + 1}. {q.question}</h3>
            <div className="space-y-3">
              {q.options.map((opt, optIdx) => {
                const isSelected = userAnswers[qIdx] === optIdx;
                const isCorrect = q.correctAnswerIndex === optIdx;
                let btnClass = "border-slate-200 hover:bg-slate-50";

                if (showResults) {
                  if (isCorrect) btnClass = "bg-green-100 border-green-300 text-green-800";
                  else if (isSelected && !isCorrect) btnClass = "bg-red-100 border-red-300 text-red-800";
                } else if (isSelected) {
                  btnClass = "bg-indigo-100 border-indigo-300 text-indigo-800";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswer(qIdx, optIdx)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {showResults && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {quiz.length > 0 && !showResults && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowResults(true)}
            className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-700"
          >
            Check Answers
          </button>
        </div>
      )}
      
      {showResults && (
        <div className="mt-8 text-center">
           <p className="text-xl font-bold mb-4">
             You scored {userAnswers.filter((a, i) => a === quiz[i].correctAnswerIndex).length} / {quiz.length}
           </p>
           <button onClick={handleGenerate} className="text-indigo-600 font-medium hover:underline flex items-center justify-center gap-2 mx-auto">
             <RefreshCw className="w-4 h-4"/> Try Another
           </button>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;