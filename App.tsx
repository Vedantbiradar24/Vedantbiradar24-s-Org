import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import NoteExplainer from './components/NoteExplainer';
import LiveTutor from './components/LiveTutor';
import Summarizer from './components/Summarizer';
import QuizGenerator from './components/QuizGenerator';
import StudyPlanner from './components/StudyPlanner';
import ConceptVisualizer from './components/ConceptVisualizer';
import VideoExplainer from './components/VideoExplainer';
import { AppView } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case AppView.NOTE_EXPLAINER:
        return <NoteExplainer />;
      case AppView.LIVE_TUTOR:
        return <LiveTutor />;
      case AppView.SUMMARIZER:
        return <Summarizer />;
      case AppView.QUIZ_GENERATOR:
        return <QuizGenerator />;
      case AppView.STUDY_PLANNER:
        return <StudyPlanner />;
      case AppView.CONCEPT_VISUALIZER:
        return <ConceptVisualizer />;
      case AppView.VIDEO_EXPLAINER:
        return <VideoExplainer />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-8">
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
              Master Your Studies with <span className="text-indigo-600">Smart StudyMate</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              Your AI-powered study companion. Upload notes, talk to your tutor, generate quizzes, and visualize concepts instantly.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl mt-8">
              {[
                { view: AppView.NOTE_EXPLAINER, text: 'Explain Notes', color: 'bg-blue-50 text-blue-700' },
                { view: AppView.LIVE_TUTOR, text: 'Live Tutor', color: 'bg-rose-50 text-rose-700' },
                { view: AppView.SUMMARIZER, text: 'Summarize', color: 'bg-green-50 text-green-700' },
                { view: AppView.QUIZ_GENERATOR, text: 'Quiz Me', color: 'bg-purple-50 text-purple-700' },
                { view: AppView.STUDY_PLANNER, text: 'Plan Study', color: 'bg-orange-50 text-orange-700' },
                { view: AppView.VIDEO_EXPLAINER, text: 'Video AI', color: 'bg-pink-50 text-pink-700' },
              ].map((item) => (
                <button
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={`${item.color} p-6 rounded-xl font-bold shadow-sm hover:shadow-md transition-all`}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        currentView={currentView} 
        onChangeView={(view) => { setCurrentView(view); setSidebarOpen(false); }} 
        isOpen={sidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
           <span className="font-bold text-indigo-600 text-lg">StudyMate</span>
           <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-slate-100">
             <Menu className="w-6 h-6 text-slate-600" />
           </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;