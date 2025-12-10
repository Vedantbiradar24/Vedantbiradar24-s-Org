export enum AppView {
  HOME = 'HOME',
  NOTE_EXPLAINER = 'NOTE_EXPLAINER',
  LIVE_TUTOR = 'LIVE_TUTOR',
  SUMMARIZER = 'SUMMARIZER',
  QUIZ_GENERATOR = 'QUIZ_GENERATOR',
  STUDY_PLANNER = 'STUDY_PLANNER',
  CONCEPT_VISUALIZER = 'CONCEPT_VISUALIZER',
  VIDEO_EXPLAINER = 'VIDEO_EXPLAINER'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudyPlan {
  markdown: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}