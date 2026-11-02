import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, ParentUser, ChildProfile, Chapter, MistakeNotebookItem, DoubtItem, SafeguardingCase, TechnicalCourse, AuthUser } from '../types';
import { INITIAL_PARENT, INITIAL_CHAPTERS, INITIAL_MISTAKES, INITIAL_DOUBTS, INITIAL_SAFEGUARDING, INITIAL_TECH_COURSES } from '../data/mockData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: AuthUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  authToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  parent: ParentUser;
  setParent: React.Dispatch<React.SetStateAction<ParentUser>>;
  activeChild: ChildProfile;
  setActiveChildId: (id: string) => void;
  isChildModeLocked: boolean;
  unlockChildModeWithPin: (pin: string) => boolean;
  lockIntoChildMode: () => void;
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
  showPublicPortal: boolean;
  setShowPublicPortal: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('portal');
      if (p && ['student', 'parent', 'teacher', 'reviewer', 'admin', 'safeguarding', 'tech_learner'].includes(p)) {
        return p as UserRole;
      }
    }
    return 'student';
  });
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('vayentra_token'));
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isDyslexicFont, setIsDyslexicFont] = useState<boolean>(false);
  const [isLargeText, setIsLargeText] = useState<boolean>(false);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true;
    }
    return false;
  });
  const [showPublicPortal, setShowPublicPortal] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('portal');
      if (p && p !== 'public') return false;
    }
    return true;
  });

  // Synchronize with genuine browser online / offline network state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hydrate session on startup if token is stored
  useEffect(() => {
    const token = localStorage.getItem('vayentra_token');
    if (token) {
      fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Session invalid');
          return res.json();
        })
        .then(data => {
          if (data.user) {
            setCurrentUser(data.user);
            setRole(data.user.role);
            if (data.guardian && data.children) {
              setParent(prev => ({
                ...prev,
                id: data.guardian.id,
                name: data.user.name,
                email: data.user.email,
                subscriptionStatus: data.guardian.subscription_status,
                planName: data.guardian.plan_name,
                children: data.children.map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  avatar: c.avatar || '🦊',
                  grade: c.grade || 7,
                  board: c.board || 'CBSE',
                  medium: c.medium || 'English',
                  pin: c.child_pin || '0000',
                  dailyTimeLimitMins: c.daily_time_limit_mins || 45,
                  minutesUsedToday: c.minutes_used_today || 0,
                  bedtimeLock: c.bedtime_lock || '21:30',
                  hasParentConsent: Boolean(c.has_consent),
                  consentTimestamp: c.consent_timestamp,
                  streakDays: c.streak_days || 1,
                  starsEarned: c.stars_earned || 10,
                  points: c.points || 250
                }))
              }));
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('vayentra_token');
          setAuthToken(null);
          setCurrentUser(null);
        });
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed.');
    }

    localStorage.setItem('vayentra_token', data.token);
    setAuthToken(data.token);
    setCurrentUser(data.user);
    setRole(data.user.role);

    if (data.guardian && data.children) {
      const updatedParent: ParentUser = {
        id: data.guardian.id,
        name: data.user.name,
        mobile: data.user.mobile || '+91 98450 12345',
        email: data.user.email,
        parentPin: data.guardian.parent_pin || '1234',
        subscriptionStatus: data.guardian.subscription_status || 'Active',
        planName: data.guardian.plan_name || 'Annual Gurukula Pro + AI Tutor',
        renewalDate: data.guardian.renewal_date || '2027-04-10',
        outstandingFee: data.guardian.outstanding_fee || 0,
        activeChildId: data.children[0]?.id || 'stu-001',
        children: data.children.map((c: any) => ({
          id: c.id,
          name: c.name,
          avatar: c.avatar || '🦊',
          grade: c.grade || 7,
          board: c.board || 'CBSE',
          medium: c.medium || 'English',
          pin: c.child_pin || '0000',
          dailyTimeLimitMins: c.daily_time_limit_mins || 45,
          minutesUsedToday: c.minutes_used_today || 0,
          bedtimeLock: c.bedtime_lock || '21:30',
          hasParentConsent: Boolean(c.has_consent),
          consentTimestamp: c.consent_timestamp,
          streakDays: c.streak_days || 1,
          starsEarned: c.stars_earned || 10,
          points: c.points || 250
        }))
      };
      setParent(updatedParent);
      localStorage.setItem('vayentra_parent', JSON.stringify(updatedParent));
    }

    setShowPublicPortal(false);
    return data.user;
  };

  const logout = async () => {
    const token = localStorage.getItem('vayentra_token');
    if (token) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {}
    }
    localStorage.removeItem('vayentra_token');
    setAuthToken(null);
    setCurrentUser(null);
    setRole('student');
    setShowPublicPortal(true);
  };

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
    document.documentElement.setAttribute('lang', 'en');
  }, []);

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
        currentUser,
        setCurrentUser,
        authToken,
        isAuthenticated: Boolean(currentUser && authToken),
        login,
        logout,
        parent,
        setParent,
        activeChild,
        setActiveChildId,
        isChildModeLocked,
        unlockChildModeWithPin,
        lockIntoChildMode,
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
        updateScreenTime,
        showPublicPortal,
        setShowPublicPortal
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
