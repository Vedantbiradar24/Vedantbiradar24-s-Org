import React from 'react';
import { 
  BookOpen, 
  Mic, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Share2, 
  Video,
  BrainCircuit
} from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen }) => {
  const menuItems = [
    { id: AppView.NOTE_EXPLAINER, label: 'Explain Notes', icon: BookOpen },
    { id: AppView.LIVE_TUTOR, label: 'Live Tutor', icon: Mic },
    { id: AppView.SUMMARIZER, label: 'Summarizer', icon: FileText },
    { id: AppView.QUIZ_GENERATOR, label: 'Quiz Generator', icon: CheckSquare },
    { id: AppView.STUDY_PLANNER, label: 'Study Plan', icon: Calendar },
    { id: AppView.CONCEPT_VISUALIZER, label: 'Visualize', icon: BrainCircuit },
    { id: AppView.VIDEO_EXPLAINER, label: 'Video Explain', icon: Video },
  ];

  return (
    <div className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 md:static md:inset-auto
    `}>
      <div className="flex items-center justify-center h-16 border-b border-slate-100">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
           <BrainCircuit className="w-8 h-8" />
           <span>StudyMate</span>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;