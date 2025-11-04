// ============ Common Types ============

export type ErrorType =
  | 'grammar'
  | 'pronunciation'
  | 'vocabulary'
  | 'sentence_structure'
  | 'tense'
  | 'article'
  | 'preposition'
  | 'other';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ErrorSeverity = 'minor' | 'moderate' | 'major';

// ============ Sentence & Recording Types ============

export interface AudioRecording {
  id: string;
  audioUrl: string;
  duration: number;
  createdAt: Date;
  transcription?: string;
}

export interface ErrorDetail {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  position: {
    start: number;
    end: number;
  };
  originalText: string;
  correctedText: string;
  explanation: string;
  examples?: string[];
}

export interface SentenceAnalysis {
  id: string;
  userId: string;
  audioRecording: AudioRecording;
  originalText: string;
  correctedText: string;
  errors: ErrorDetail[];
  overallScore: number; // 0-100
  fluencyScore: number;
  grammarScore: number;
  pronunciationScore: number;
  feedback: string;
  suggestions: string[];
  createdAt: Date;
}

// ============ Practice Session Types ============

export interface PracticeSession {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  sentencesAnalyzed: number;
  averageScore: number;
  totalErrors: number;
  errorBreakdown: Record<ErrorType, number>;
}

// ============ Review Types ============

export interface ReviewExercise {
  id: string;
  type: 'fill_blank' | 'multiple_choice' | 'rewrite' | 'speaking_practice';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string;
  explanation: string;
  relatedError: ErrorType;
  originalSentenceId?: string;
}

export interface DailyReview {
  id: string;
  userId: string;
  date: Date;
  exercises: ReviewExercise[];
  completedExercises: string[]; // exercise IDs
  score?: number;
  completed: boolean;
}

// ============ User & Profile Types ============

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  proficiencyLevel: ProficiencyLevel;
  nativeLanguage: string;
  targetGoals: string[];
  joinedAt: Date;
  streakDays: number;
  totalSentencesPracticed: number;
}

export interface UserStats {
  userId: string;
  totalPracticeSessions: number;
  totalSentences: number;
  averageScore: number;
  commonErrors: Array<{
    type: ErrorType;
    count: number;
    improvementRate: number; // percentage
  }>;
  progressOverTime: Array<{
    date: Date;
    score: number;
    sentenceCount: number;
  }>;
  streakHistory: Array<{
    date: Date;
    practiced: boolean;
  }>;
}

// ============ Analytics Types ============

export interface ErrorTrend {
  errorType: ErrorType;
  timeline: Array<{
    date: Date;
    count: number;
  }>;
  totalOccurrences: number;
  improvementRate: number;
}

export interface FluencyMetrics {
  currentScore: number;
  previousScore: number;
  trend: 'improving' | 'stable' | 'declining';
  avgWordsPerMinute?: number;
  avgPauseTime?: number;
}

export interface LearningInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  estimatedTimeToNextLevel?: string;
}

// ============ API Response Types ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AnalysisResponse {
  analysis: SentenceAnalysis;
  sessionStats: {
    todayCount: number;
    weekCount: number;
  };
}

// ============ UI State Types ============

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob?: Blob;
}

export interface AnalysisLoadingState {
  isLoading: boolean;
  progress?: number;
  stage?: 'uploading' | 'transcribing' | 'analyzing';
}

// ============ Transcription Types ============

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface TranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  words?: TranscriptionWord[];
  segments?: TranscriptionSegment[];
}

export interface AudioFormatsResponse {
  formats: string[];
  maxFileSize: number;
  maxFileSizeMB: number;
}

// ============ Conversation Types ============

export type ConversationRole = 'user' | 'assistant';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  audioBlob?: Blob;
  audioUrl?: string;
  timestamp: Date;
  isLoading?: boolean;
}
