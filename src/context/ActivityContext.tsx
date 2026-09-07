import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Category, Goal, UserPreferences, ActiveTimerState } from '../types';
import { useAuth } from './AuthContext';
import { storage } from '../lib/storage';
import { getCurrentTimeString, addMinutesToTime, getTodayString } from '../lib/dateUtils';
import { triggerConfetti } from '../lib/confetti';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ActivityContextType {
  activities: Activity[];
  categories: Category[];
  goals: Goal[];
  preferences: UserPreferences;
  
  // Activity CRUD
  addActivity: (activity: Omit<Activity, 'id' | 'userId' | 'createdAt'>) => Activity;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
  deleteMultipleActivities: (ids: string[]) => void;
  
  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  
  // Goal CRUD
  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => Goal;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  
  // Preferences
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Active Stopwatch Timer
  timerState: ActiveTimerState;
  startTimer: (title: string, categoryId: string, notes?: string, tags?: string[]) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  discardTimer: () => void;
  stopTimerAndSave: () => void;

  // Modals & UI States
  isActivityModalOpen: boolean;
  editingActivity: Activity | null;
  prefillData: Partial<Activity> | null;
  openCreateActivityModal: (prefill?: Partial<Activity>) => void;
  openEditActivityModal: (activity: Activity) => void;
  closeActivityModal: () => void;
  
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Notifications
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;

  // Data export/reset
  resetData: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

const INITIAL_TIMER: ActiveTimerState = {
  isRunning: false,
  startTime: null,
  elapsedSeconds: 0,
  title: '',
  categoryId: '',
  notes: '',
  tags: [],
};

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser.id;

  const [activities, setActivities] = useState<Activity[]>(() => storage.getActivities(userId));
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories(userId));
  const [goals, setGoals] = useState<Goal[]>(() => storage.getGoals(userId));
  const [preferences, setPreferences] = useState<UserPreferences>(() => storage.getPreferences(userId));

  // Modals
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<Activity> | null>(null);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Active Timer
  const [timerState, setTimerState] = useState<ActiveTimerState>(() => {
    const saved = localStorage.getItem(`chronicle_${userId}_timer`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If it was running, compute passed seconds
        if (parsed.isRunning && parsed.startTime) {
          const addedSec = Math.floor((Date.now() - parsed.startTime) / 1000);
          return {
            ...parsed,
            elapsedSeconds: parsed.elapsedSeconds + addedSec,
            startTime: Date.now(),
          };
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse timer state', e);
      }
    }
    return INITIAL_TIMER;
  });

  // Reload data whenever currentUser changes
  useEffect(() => {
    setActivities(storage.getActivities(userId));
    setCategories(storage.getCategories(userId));
    setGoals(storage.getGoals(userId));
    setPreferences(storage.getPreferences(userId));
  }, [userId]);

  // Persist timer state
  useEffect(() => {
    localStorage.setItem(`chronicle_${userId}_timer`, JSON.stringify(timerState));
  }, [timerState, userId]);

  // Timer interval ticker
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (timerState.isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState.isRunning]);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Activity CRUD
  const addActivity = useCallback((data: Omit<Activity, 'id' | 'userId' | 'createdAt'>): Activity => {
    const newAct: Activity = {
      ...data,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      createdAt: new Date().toISOString(),
    };

    setActivities(prev => {
      const updated = [newAct, ...prev];
      storage.saveActivities(userId, updated);
      return updated;
    });

    showToast(`Logged "${newAct.title}"`);
    return newAct;
  }, [userId, showToast]);

  const updateActivity = useCallback((activity: Activity) => {
    setActivities(prev => {
      const updated = prev.map(a => a.id === activity.id ? activity : a);
      storage.saveActivities(userId, updated);
      return updated;
    });
    showToast(`Updated "${activity.title}"`);
  }, [userId, showToast]);

  const deleteActivity = useCallback((id: string) => {
    setActivities(prev => {
      const updated = prev.filter(a => a.id !== id);
      storage.saveActivities(userId, updated);
      return updated;
    });
    showToast('Activity deleted', 'info');
  }, [userId, showToast]);

  const deleteMultipleActivities = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setActivities(prev => {
      const updated = prev.filter(a => !set.has(a.id));
      storage.saveActivities(userId, updated);
      return updated;
    });
    showToast(`Deleted ${ids.length} activities`, 'info');
  }, [userId, showToast]);

  // Category CRUD
  const addCategory = useCallback((cat: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...cat,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setCategories(prev => {
      const updated = [...prev, newCat];
      storage.saveCategories(userId, updated);
      return updated;
    });
    showToast(`Category "${newCat.name}" created`);
    return newCat;
  }, [userId, showToast]);

  const updateCategory = useCallback((cat: Category) => {
    setCategories(prev => {
      const updated = prev.map(c => c.id === cat.id ? cat : c);
      storage.saveCategories(userId, updated);
      return updated;
    });
    showToast(`Category "${cat.name}" updated`);
  }, [userId, showToast]);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== id);
      storage.saveCategories(userId, updated);
      return updated;
    });
    showToast('Category deleted', 'info');
  }, [userId, showToast]);

  // Goal CRUD
  const addGoal = useCallback((data: Omit<Goal, 'id' | 'userId' | 'createdAt'>): Goal => {
    const newGoal: Goal = {
      ...data,
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => {
      const updated = [...prev, newGoal];
      storage.saveGoals(userId, updated);
      return updated;
    });
    triggerConfetti();
    showToast(`Goal "${newGoal.title}" created! Let's crush it.`);
    return newGoal;
  }, [userId, showToast]);

  const updateGoal = useCallback((goal: Goal) => {
    setGoals(prev => {
      const updated = prev.map(g => g.id === goal.id ? goal : g);
      storage.saveGoals(userId, updated);
      return updated;
    });
    showToast(`Goal updated`);
  }, [userId, showToast]);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== id);
      storage.saveGoals(userId, updated);
      return updated;
    });
    showToast('Goal removed', 'info');
  }, [userId, showToast]);

  // Preferences
  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...prefs };
      storage.savePreferences(userId, updated);
      return updated;
    });
    showToast('Preferences updated');
  }, [userId, showToast]);

  // Active Stopwatch Timer
  const startTimer = useCallback((title: string, categoryId: string, notes: string = '', tags: string[] = []) => {
    setTimerState({
      isRunning: true,
      startTime: Date.now(),
      elapsedSeconds: 0,
      title,
      categoryId: categoryId || categories[0]?.id || 'cat_work',
      notes,
      tags,
    });
    showToast(`Timer started: "${title || 'Focused Activity'}"`, 'info');
  }, [categories, showToast]);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: false, startTime: null }));
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: true, startTime: Date.now() }));
  }, []);

  const discardTimer = useCallback(() => {
    setTimerState(INITIAL_TIMER);
    showToast('Timer discarded', 'info');
  }, [showToast]);

  const stopTimerAndSave = useCallback(() => {
    if (timerState.elapsedSeconds < 30) {
      showToast('Activity was under 30 seconds. Timer discarded.', 'info');
      setTimerState(INITIAL_TIMER);
      return;
    }

    const durationMinutes = Math.max(1, Math.round(timerState.elapsedSeconds / 60));
    const nowTime = getCurrentTimeString();
    // Calculate start time based on duration
    const [nowH, nowM] = nowTime.split(':').map(Number);
    let startMinTotal = nowH * 60 + nowM - durationMinutes;
    if (startMinTotal < 0) startMinTotal += 24 * 60;
    const startH = Math.floor(startMinTotal / 60);
    const startM = startMinTotal % 60;
    const startTimeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

    addActivity({
      title: timerState.title.trim() || 'Recorded Focus Session',
      description: timerState.notes || '',
      categoryId: timerState.categoryId || categories[0]?.id || 'cat_work',
      date: getTodayString(),
      startTime: startTimeStr,
      endTime: nowTime,
      durationMinutes,
      status: 'completed',
      tags: timerState.tags.length > 0 ? timerState.tags : ['timer-session'],
      energyLevel: 'high',
    });

    setTimerState(INITIAL_TIMER);
    triggerConfetti();
  }, [timerState, categories, addActivity, showToast]);

  // Modal actions
  const openCreateActivityModal = useCallback((prefill?: Partial<Activity>) => {
    setEditingActivity(null);
    setPrefillData(prefill || null);
    setIsActivityModalOpen(true);
  }, []);

  const openEditActivityModal = useCallback((activity: Activity) => {
    setPrefillData(null);
    setEditingActivity(activity);
    setIsActivityModalOpen(true);
  }, []);

  const closeActivityModal = useCallback(() => {
    setIsActivityModalOpen(false);
    setEditingActivity(null);
    setPrefillData(null);
  }, []);

  const resetData = useCallback(() => {
    storage.resetUserData(userId);
    setActivities(storage.getActivities(userId));
    setCategories(storage.getCategories(userId));
    setGoals(storage.getGoals(userId));
    setPreferences(storage.getPreferences(userId));
    showToast('Reset data to initial state');
  }, [userId, showToast]);

  return (
    <ActivityContext.Provider
      value={{
        activities,
        categories,
        goals,
        preferences,
        addActivity,
        updateActivity,
        deleteActivity,
        deleteMultipleActivities,
        addCategory,
        updateCategory,
        deleteCategory,
        addGoal,
        updateGoal,
        deleteGoal,
        updatePreferences,
        timerState,
        startTimer,
        pauseTimer,
        resumeTimer,
        discardTimer,
        stopTimerAndSave,
        isActivityModalOpen,
        editingActivity,
        prefillData,
        openCreateActivityModal,
        openEditActivityModal,
        closeActivityModal,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        toasts,
        showToast,
        dismissToast,
        resetData,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider');
  return ctx;
}
