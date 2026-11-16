// Centralized local storage manager for student reading progress & daily streak tracking
// Operates purely client-side without requiring student authentication

export interface DailyProgress {
  count: number;
  max: number;
  streak: number;
  completedIds: string[];
  lastActiveDate: string;
}

const STORAGE_KEY_COUNT = 'vayentra_concepts_understood_count';
const STORAGE_KEY_IDS = 'vayentra_concepts_understood_ids';
const STORAGE_KEY_STREAK = 'vayentra_daily_streak';
const STORAGE_KEY_DATE = 'vayentra_last_active_date';
const EVENT_NAME = 'vayentra-concept-progress-updated';

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyProgress(): DailyProgress {
  if (typeof window === 'undefined') {
    return { count: 0, max: 5, streak: 1, completedIds: [], lastActiveDate: getTodayString() };
  }

  const today = getTodayString();
  const savedDate = localStorage.getItem(STORAGE_KEY_DATE);
  let streak = parseInt(localStorage.getItem(STORAGE_KEY_STREAK) || '1', 10);
  let count = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0', 10);
  let completedIds: string[] = [];

  try {
    const rawIds = localStorage.getItem(STORAGE_KEY_IDS);
    if (rawIds) completedIds = JSON.parse(rawIds);
  } catch (e) {
    completedIds = [];
  }

  // If date changed, handle streak calculation and daily count reset
  if (savedDate !== today) {
    if (savedDate) {
      const lastDate = new Date(savedDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day streak increment
        streak += 1;
      } else if (diffDays > 1) {
        // Missed day resets streak to 1
        streak = 1;
      }
    } else {
      streak = 1;
    }

    count = 0;
    completedIds = [];
    localStorage.setItem(STORAGE_KEY_DATE, today);
    localStorage.setItem(STORAGE_KEY_STREAK, streak.toString());
    localStorage.setItem(STORAGE_KEY_COUNT, '0');
    localStorage.setItem(STORAGE_KEY_IDS, JSON.stringify([]));
  }

  return {
    count,
    max: 5,
    streak: Math.max(1, streak),
    completedIds,
    lastActiveDate: today
  };
}

export function recordConceptUnderstood(conceptId: string): { progress: DailyProgress; isNew: boolean; reachedMilestone: boolean } {
  if (typeof window === 'undefined') {
    return { progress: getDailyProgress(), isNew: false, reachedMilestone: false };
  }

  const current = getDailyProgress();
  if (current.completedIds.includes(conceptId)) {
    return { progress: current, isNew: false, reachedMilestone: false };
  }

  const newIds = [...current.completedIds, conceptId];
  const newCount = Math.min(5, current.count + 1);
  const reachedMilestone = current.count < 5 && newCount === 5;

  localStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(newIds));
  localStorage.setItem(STORAGE_KEY_COUNT, newCount.toString());

  const updated: DailyProgress = {
    ...current,
    count: newCount,
    completedIds: newIds
  };

  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
  return { progress: updated, isNew: true, reachedMilestone };
}

export function subscribeToDailyProgress(callback: (progress: DailyProgress) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<DailyProgress>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getDailyProgress());
    }
  };

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

export function resetDailyProgressForTesting(): DailyProgress {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_COUNT);
    localStorage.removeItem(STORAGE_KEY_IDS);
  }
  const fresh = getDailyProgress();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: fresh }));
  }
  return fresh;
}
