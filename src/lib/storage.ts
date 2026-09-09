import { Activity, Category, Goal, UserPreferences, User } from '../types';
import { 
  DEMO_USERS, 
  DEFAULT_PREFERENCES, 
  ALEX_CATEGORIES, 
  ELENA_CATEGORIES, 
  STARTER_CATEGORIES, 
  getAlexSeedActivities, 
  ALEX_GOALS 
} from './seedData';

const PREFIX = 'chronicle_';

export const storage = {
  // Current session
  getCurrentUserId(): string {
    const saved = localStorage.getItem(`${PREFIX}current_user_id`);
    return saved || 'user_alex';
  },

  setCurrentUserId(userId: string): void {
    localStorage.setItem(`${PREFIX}current_user_id`, userId);
  },

  // Users list
  getUsers(): User[] {
    const saved = localStorage.getItem(`${PREFIX}users`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse users', e);
      }
    }
    // Initialize default users
    localStorage.setItem(`${PREFIX}users`, JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  },

  setUsers(users: User[]): void {
    localStorage.setItem(`${PREFIX}users`, JSON.stringify(users));
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(`${PREFIX}users`, JSON.stringify(users));
  },

  // Categories (strictly scoped per user)
  getCategories(userId: string): Category[] {
    const key = `${PREFIX}${userId}_categories`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse categories', e);
      }
    }

    // Default categories based on persona
    let defaults = STARTER_CATEGORIES;
    if (userId === 'user_alex') defaults = ALEX_CATEGORIES;
    if (userId === 'user_elena') defaults = ELENA_CATEGORIES;

    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  },

  saveCategories(userId: string, categories: Category[]): void {
    localStorage.setItem(`${PREFIX}${userId}_categories`, JSON.stringify(categories));
  },

  // Activities (strictly scoped per user)
  getActivities(userId: string): Activity[] {
    const key = `${PREFIX}${userId}_activities`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse activities', e);
      }
    }

    // Initialize rich seeds for Alex if first time
    if (userId === 'user_alex') {
      const seedActivities = getAlexSeedActivities();
      localStorage.setItem(key, JSON.stringify(seedActivities));
      return seedActivities;
    }

    return [];
  },

  saveActivities(userId: string, activities: Activity[]): void {
    localStorage.setItem(`${PREFIX}${userId}_activities`, JSON.stringify(activities));
  },

  // Goals (strictly scoped per user)
  getGoals(userId: string): Goal[] {
    const key = `${PREFIX}${userId}_goals`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse goals', e);
      }
    }

    if (userId === 'user_alex') {
      localStorage.setItem(key, JSON.stringify(ALEX_GOALS));
      return ALEX_GOALS;
    }

    return [];
  },

  saveGoals(userId: string, goals: Goal[]): void {
    localStorage.setItem(`${PREFIX}${userId}_goals`, JSON.stringify(goals));
  },

  // Preferences (strictly scoped per user)
  getPreferences(userId: string): UserPreferences {
    const key = `${PREFIX}${userId}_preferences`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse preferences', e);
      }
    }
    return DEFAULT_PREFERENCES;
  },

  savePreferences(userId: string, prefs: UserPreferences): void {
    localStorage.setItem(`${PREFIX}${userId}_preferences`, JSON.stringify(prefs));
  },

  // Export full user JSON
  exportData(userId: string): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: this.getUsers().find(u => u.id === userId),
      preferences: this.getPreferences(userId),
      categories: this.getCategories(userId),
      goals: this.getGoals(userId),
      activities: this.getActivities(userId),
    };
    return JSON.stringify(data, null, 2);
  },

  // Import full user JSON
  importData(userId: string, jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.categories)) {
        this.saveCategories(userId, parsed.categories);
      }
      if (Array.isArray(parsed.activities)) {
        this.saveActivities(userId, parsed.activities);
      }
      if (Array.isArray(parsed.goals)) {
        this.saveGoals(userId, parsed.goals);
      }
      if (parsed.preferences) {
        this.savePreferences(userId, parsed.preferences);
      }
      return true;
    } catch (e) {
      console.error('Failed to import user data', e);
      return false;
    }
  },

  // Reset user data to initial seeds
  resetUserData(userId: string): void {
    localStorage.removeItem(`${PREFIX}${userId}_categories`);
    localStorage.removeItem(`${PREFIX}${userId}_activities`);
    localStorage.removeItem(`${PREFIX}${userId}_goals`);
    localStorage.removeItem(`${PREFIX}${userId}_preferences`);
  }
};
