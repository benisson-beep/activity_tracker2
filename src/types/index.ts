export type ViewMode = 
  | 'dashboard' 
  | 'activities' 
  | 'calendar' 
  | 'timer'
  | 'analytics' 
  | 'goals' 
  | 'reports' 
  | 'pricing'
  | 'settings';

export type ActivityStatus = 'completed' | 'in-progress' | 'paused';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type PlanTier = 'free' | 'pro' | 'team';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  plan: PlanTier;
  onboarded: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Hex color code (e.g. #6366f1)
  icon: string; // Lucide icon identifier
  defaultDurationMinutes?: number;
  isSystem?: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  title: string;
  description?: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour)
  endTime: string; // HH:MM (24-hour)
  durationMinutes: number;
  status: ActivityStatus;
  tags: string[];
  energyLevel?: EnergyLevel;
  attachmentUrl?: string;
  createdAt: string;
}

export type GoalTargetType = 'hours' | 'count';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  categoryId?: string;
  targetType: GoalTargetType;
  targetValue: number;
  period: GoalPeriod;
  color: string;
  createdAt: string;
}

export interface UserPreferences {
  is24Hour: boolean;
  startWeekOnMonday: boolean;
  defaultView: ViewMode;
  soundEffects: boolean;
  enableDesktopNotification?: boolean;
  enableSoundNotification?: boolean;
  theme: 'dark' | 'light' | 'system';
}

export type TimerMode = 'stopwatch' | 'countdown';

export interface ActiveTimerState {
  isRunning: boolean;
  mode: TimerMode;
  startTime: number | null; // epoch timestamp
  elapsedSeconds: number;
  targetMinutes: number; // For countdown (e.g., 25, 45, 60)
  hasFinishedCountdown: boolean;
  title: string;
  categoryId: string;
  notes?: string;
  tags: string[];
}

export interface SmartInsight {
  id: string;
  type: 'achievement' | 'trend' | 'recommendation' | 'alert';
  title: string;
  description: string;
  icon: string;
}
