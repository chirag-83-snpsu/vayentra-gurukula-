// Core Domain Types for Vayentra Gurukula Learning Platform

export type UserRole = 
  | 'student' 
  | 'parent' 
  | 'teacher' 
  | 'reviewer' 
  | 'admin' 
  | 'safeguarding'
  | 'tech_learner';

export type BoardType = 'CBSE' | 'ICSE' | 'STATE_KARNATAKA';
export type MediumType = 'English' | 'Kannada';

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  grade: number; // 1 to 10
  board: BoardType;
  medium: MediumType;
  pin: string;
  dailyTimeLimitMins: number;
  minutesUsedToday: number;
  bedtimeLock: string; // e.g. "21:30"
  hasParentConsent: boolean;
  consentTimestamp?: string;
  streakDays: number;
  starsEarned: number;
  points: number;
}

export interface ParentUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  parentPin: string;
  children: ChildProfile[];
  activeChildId: string;
  subscriptionStatus: 'Trial' | 'Active' | 'GracePeriod' | 'Suspended' | 'Cancelled';
  planName: string;
  renewalDate: string;
  outstandingFee: number;
}

export interface CheckpointQuestion {
  id: string;
  prompt: string;
  promptKn?: string;
  options: string[];
  optionsKn?: string[];
  correctIndex: number;
  explanation: string;
  conceptId: string;
  difficulty?: 'Simple' | 'Standard' | 'Challenge';
}

export interface Episode {
  id: string;
  chapterId: string;
  title: string;
  titleKn?: string;
  episodeNumber: number;
  totalEpisodes: number;
  durationMinutes: number;
  hook: string;
  explanation: string;
  realWorldExample: string;
  tryItPrompt: string;
  recapBullets: string[];
  videoUrl?: string;
  audioUrl?: string;
  notesPdfUrl?: string;
  checkpointQuestions: CheckpointQuestion[];
  isLocked: boolean;
  isCompleted: boolean;
  scorePercent?: number;
  trustLabel: {
    reviewerName: string;
    board: string;
    verifiedDate: string;
    isAiAssisted?: boolean;
    isAIGeneratedReviewed?: boolean;
  };
}

export interface Chapter {
  id: string;
  subject: string;
  subjectKn?: string;
  grade: number;
  board: BoardType;
  title: string;
  titleKn?: string;
  description: string;
  episodes: Episode[];
  isMastered: boolean;
  progressPercent: number;
}

export interface MistakeNotebookItem {
  id: string;
  studentId: string;
  questionPrompt: string;
  studentAnswer: string;
  correctAnswer: string;
  errorTag: string;
  conceptName: string;
  subject: string;
  date?: string;
  isResolved: boolean;
  remedialEpisodeId?: string;
}

export interface DoubtItem {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  questionText: string;
  mediaType: 'text' | 'voice' | 'photo' | 'timestamp';
  status: 'answered_ai' | 'teacher_queue' | 'resolved';
  aiAnswer?: string;
  teacherAnswer?: string;
  timestamp: string;
  isHelpful?: boolean;
}

export interface SafeguardingCase {
  id: string;
  studentId?: string;
  studentName: string;
  reporterRole: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  details: string;
  reportedAt: string;
  status: 'New' | 'Under Review' | 'Investigating' | 'Escalated' | 'Resolved';
  actionTaken?: string;
}

export interface TechnicalCourse {
  id: string;
  track: string;
  title: string;
  level: string;
  duration: string;
  description: string;
  skills?: string[];
  labTitle: string;
  labTask: string;
  labStarterCode: string;
  labExpectedOutput: string;
  hasCertificate?: boolean;
}

export interface FlashcardItem {
  id: string;
  studentId: string;
  subject: string;
  conceptName: string;
  boxLevel: number; // 1 to 5 (Leitner system)
  frontPrompt: string;
  backAnswer: string;
  explanation: string;
  lastReviewed?: string;
}

export interface TimedTestQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
}

export interface TimedTest {
  id: string;
  chapterId: string;
  title: string;
  subject: string;
  grade: number;
  board: BoardType;
  timeLimitMins: number;
  passMarkPercent: number;
  totalQuestions: number;
  questions: TimedTestQuestion[];
}

export interface TestAttemptReview {
  id: string;
  prompt: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface TestAttemptResult {
  attemptId: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  passMarkPercent: number;
  reviewBreakdown: TestAttemptReview[];
  message: string;
}
