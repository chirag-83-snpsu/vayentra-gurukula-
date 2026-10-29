import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, ParentUser, ChildProfile, Chapter, MistakeNotebookItem, DoubtItem, SafeguardingCase, TechnicalCourse } from '../types';
import { INITIAL_PARENT, INITIAL_CHAPTERS, INITIAL_MISTAKES, INITIAL_DOUBTS, INITIAL_SAFEGUARDING, INITIAL_TECH_COURSES } from '../data/mockData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  parent: ParentUser;
  activeChild: ChildProfile;
  setActiveChildId: (id: string) => void;
  isChildModeLocked: boolean;
  unlockChildModeWithPin: (pin: string) => boolean;
  lockIntoChildMode: () => void;
  language: 'English' | 'Kannada';
  setLanguage: (lang: 'English' | 'Kannada') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isDyslexicFont: boolean;
  toggleDyslexicFont: () => void;
  isLargeText: boolean;
  toggleLargeText: () => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  chapters: Chapter[];
  completeEpisodeCheckpoint: (chapterId: string, episodeId: string, scorePercent: number) => void;
  mistakes: MistakeNotebookItem[];
  addMistake: (mistake: Omit<MistakeNotebookItem, 'id' | 'date' | 'isResolved'>) => void;
  resolveMistake: (id: string) => void;
  doubts: DoubtItem[];
  askDoubt: (text: string, mediaType: 'text' | 'voice' | 'photo') => void;
  safeguardingCases: SafeguardingCase[];
  addSafeguardingCase: (c: Omit<SafeguardingCase, 'id' | 'reportedAt'>) => void;
  techCourses: TechnicalCourse[];
  grantParentConsent: (studentId: string) => void;
  payOutstandingFee: () => void;
  updateScreenTime: (minutes: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [parent, setParent] = useState<ParentUser>(() => {
    const saved = localStorage.getItem('vayentra_parent');
    return saved ? JSON.parse(saved) : INITIAL_PARENT;
  });
  
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem('vayentra_chapters');
    return saved ? JSON.parse(saved) : INITIAL_CHAPTERS;
  });

  const [mistakes, setMistakes] = useState<MistakeNotebookItem[]>(() => {
    const saved = localStorage.getItem('vayentra_mistakes');
    return saved ? JSON.parse(saved) : INITIAL_MISTAKES;
  });

  const [doubts, setDoubts] = useState<DoubtItem[]>(() => {
    const saved = localStorage.getItem('vayentra_doubts');
    return saved ? JSON.parse(saved) : INITIAL_DOUBTS;
  });

  const [safeguardingCases, setSafeguardingCases] = useState<SafeguardingCase[]>(() => {
    const saved = localStorage.getItem('vayentra_safeguarding');
    return saved ? JSON.parse(saved) : INITIAL_SAFEGUARDING;
  });

  const [isChildModeLocked, setIsChildModeLocked] = useState<boolean>(false);
  const [language, setLanguage] = useState<'English' | 'Kannada'>('English');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isDyslexicFont, setIsDyslexicFont] = useState<boolean>(false);
  const [isLargeText, setIsLargeText] = useState<boolean>(false);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('vayentra_parent', JSON.stringify(parent));
  }, [parent]);

  useEffect(() => {
    localStorage.setItem('vayentra_chapters', JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    localStorage.setItem('vayentra_mistakes', JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    localStorage.setItem('vayentra_doubts', JSON.stringify(doubts));
  }, [doubts]);

  useEffect(() => {
    localStorage.setItem('vayentra_safeguarding', JSON.stringify(safeguardingCases));
  }, [safeguardingCases]);

  // Apply theme & accessibility attributes to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', isDyslexicFont ? 'dyslexic' : 'default');
  }, [isDyslexicFont]);

  useEffect(() => {
    document.documentElement.setAttribute('data-large-text', isLargeText ? 'true' : 'false');
  }, [isLargeText]);

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', isHighContrast ? 'high' : 'normal');
  }, [isHighContrast]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language === 'Kannada' ? 'kn' : 'en');
  }, [language]);

  const activeChild = parent.children.find(c => c.id === parent.activeChildId) || parent.children[0];

  const setActiveChildId = (id: string) => {
    setParent(prev => ({ ...prev, activeChildId: id }));
  };

  const lockIntoChildMode = () => {
    setIsChildModeLocked(true);
    setRole('student');
  };

  const unlockChildModeWithPin = (pin: string) => {
    if (pin === parent.parentPin) {
      setIsChildModeLocked(false);
      setRole('parent');
      return true;
    }
    return false;
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleDyslexicFont = () => setIsDyslexicFont(prev => !prev);
  const toggleLargeText = () => setIsLargeText(prev => !prev);
  const toggleHighContrast = () => setIsHighContrast(prev => !prev);
  const toggleOfflineMode = () => setIsOfflineMode(prev => !prev);

  const completeEpisodeCheckpoint = (chapterId: string, episodeId: string, scorePercent: number) => {
    setChapters(prev => prev.map(chap => {
      if (chap.id !== chapterId) return chap;
      
      const epIndex = chap.episodes.findIndex(e => e.id === episodeId);
      if (epIndex === -1) return chap;

      const updatedEpisodes = [...chap.episodes];
      updatedEpisodes[epIndex] = {
        ...updatedEpisodes[epIndex],
        isCompleted: true,
        scorePercent
      };

      // If passed checkpoint (>= 60%), unlock next episode!
      if (scorePercent >= 60 && epIndex + 1 < updatedEpisodes.length) {
        updatedEpisodes[epIndex + 1] = {
          ...updatedEpisodes[epIndex + 1],
          isLocked: false
        };
      }

      // Calculate new chapter progress
      const completedCount = updatedEpisodes.filter(e => e.isCompleted).length;
      const progress = Math.round((completedCount / updatedEpisodes.length) * 100);

      return {
        ...chap,
        episodes: updatedEpisodes,
        progressPercent: progress,
        isMastered: progress === 100 && scorePercent >= 80
      };
    }));

    // Grant stars and streak update to active child
    if (scorePercent >= 60) {
      setParent(prev => ({
        ...prev,
        children: prev.children.map(c => {
          if (c.id !== prev.activeChildId) return c;
          return {
            ...c,
            starsEarned: c.starsEarned + 3,
            points: c.points + 50
          };
        })
      }));
    }
  };

  const addMistake = (mistake: Omit<MistakeNotebookItem, 'id' | 'date' | 'isResolved'>) => {
    const newItem: MistakeNotebookItem = {
      ...mistake,
      id: `mst-${Date.now()}`,
      date: 'Today',
      isResolved: false
    };
    setMistakes(prev => [newItem, ...prev]);
  };

  const resolveMistake = (id: string) => {
    setMistakes(prev => prev.map(m => m.id === id ? { ...m, isResolved: true } : m));
  };

  const askDoubt = (text: string, mediaType: 'text' | 'voice' | 'photo') => {
    // Check safety heuristics (Self-harm / distress)
    const lower = text.toLowerCase();
    const isDistress = lower.includes('hurt myself') || lower.includes('kill') || lower.includes('depressed') || lower.includes('suicide');

    if (isDistress) {
      // Trigger Safeguarding Case immediately!
      addSafeguardingCase({
        studentName: activeChild.name,
        reporterRole: 'Automated AI Moderation Classifier',
        severity: 'High',
        category: 'Emergency Student Wellbeing Alert',
        details: `Student query detected distress patterns: "${text}". Query blocked; safe helpline provided.`,
        status: 'New'
      });

      const urgentDoubt: DoubtItem = {
        id: `dbt-${Date.now()}`,
        studentId: activeChild.id,
        studentName: activeChild.name,
        subject: 'General Support',
        questionText: text,
        mediaType,
        status: 'answered_ai',
        aiAnswer: 'It sounds like you are going through a difficult time. Please talk to a trusted adult, family member, or call the 24/7 National Student Wellbeing Helpline at 9999 666 555 (toll-free). Your safety and wellbeing matter most to us.',
        timestamp: 'Just now'
      };
      setDoubts(prev => [urgentDoubt, ...prev]);
      return;
    }

    // Standard AI doubt response based on curriculum notes RAG
    const newDoubt: DoubtItem = {
      id: `dbt-${Date.now()}`,
      studentId: activeChild.id,
      studentName: activeChild.name,
      subject: 'Mathematics',
      questionText: text,
      mediaType,
      status: 'answered_ai',
      aiAnswer: `Great question about integers! Based on certified CBSE Class 7 notes: When you perform calculations with positive and negative numbers, always remember that multiplication flips the sign when negative signs are paired. If you'd like more step-by-step guidance, check out Chapter 1, Episode 2!`,
      timestamp: 'Just now',
      isHelpful: true
    };
    setDoubts(prev => [newDoubt, ...prev]);
  };

  const addSafeguardingCase = (c: Omit<SafeguardingCase, 'id' | 'reportedAt'>) => {
    const newCase: SafeguardingCase = {
      ...c,
      id: `SG-${Date.now()}`,
      reportedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
    };
    setSafeguardingCases(prev => [newCase, ...prev]);
  };

  const grantParentConsent = (studentId: string) => {
    setParent(prev => ({
      ...prev,
      children: prev.children.map(c => {
        if (c.id !== studentId) return c;
        return {
          ...c,
          hasParentConsent: true,
          consentTimestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
        };
      })
    }));
  };

  const payOutstandingFee = () => {
    setParent(prev => ({
      ...prev,
      outstandingFee: 0,
      subscriptionStatus: 'Active',
      renewalDate: '2027-10-14'
    }));
  };

  const updateScreenTime = (minutes: number) => {
    setParent(prev => ({
      ...prev,
      children: prev.children.map(c => {
        if (c.id !== prev.activeChildId) return c;
        return { ...c, dailyTimeLimitMins: minutes };
      })
    }));
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        parent,
        activeChild,
        setActiveChildId,
        isChildModeLocked,
        unlockChildModeWithPin,
        lockIntoChildMode,
        language,
        setLanguage,
        theme,
        toggleTheme,
        isDyslexicFont,
        toggleDyslexicFont,
        isLargeText,
        toggleLargeText,
        isHighContrast,
        toggleHighContrast,
        isOfflineMode,
        toggleOfflineMode,
        chapters,
        completeEpisodeCheckpoint,
        mistakes,
        addMistake,
        resolveMistake,
        doubts,
        askDoubt,
        safeguardingCases,
        addSafeguardingCase,
        techCourses: INITIAL_TECH_COURSES,
        grantParentConsent,
        payOutstandingFee,
        updateScreenTime
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
