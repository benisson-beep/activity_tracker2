import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, PlanTier } from '../types';
import { storage } from '../lib/storage';
import { supabase, signInWithGoogle, signOutSupabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: User;
  users: User[];
  isAuthenticated: boolean;
  isSupabaseConnected: boolean;
  switchUser: (userId: string) => void;
  registerUser: (name: string, email: string, role?: string, avatar?: string) => User;
  loginUser: (email: string) => boolean;
  loginOrCreateUser: (email: string, name?: string) => { user: User; isNew: boolean };
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  logoutUser: () => void;
  updateUserPlan: (plan: PlanTier) => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [currentUserId, setCurrentUserId] = useState<string>(() => storage.getCurrentUserId());
  
  // Resolve current active user; strictly follows currentUserId, falls back to users[0]
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  useEffect(() => {
    storage.setCurrentUserId(currentUserId);
  }, [currentUserId]);

  const handleSupabaseUser = useCallback((sbUser: any) => {
    if (!sbUser) return;
    console.log('[Auth] Processing Authenticated Google/Supabase User:', sbUser);

    const meta = sbUser.user_metadata || {};
    const email = (sbUser.email || meta.email || '').trim();
    const name = (
      meta.full_name || 
      meta.name || 
      meta.given_name || 
      (email ? email.split('@')[0] : '') || 
      'Google User'
    ).trim();

    const avatar = (
      meta.avatar_url || 
      meta.picture || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&bold=true`
    ).trim();
    
    // Read current users from persistent storage
    const allUsers = storage.getUsers();
    const existingIndex = allUsers.findIndex(
      u => u.id === sbUser.id || (email && u.email && u.email.toLowerCase() === email.toLowerCase())
    );

    let activeUser: User;

    if (existingIndex >= 0) {
      activeUser = { 
        ...allUsers[existingIndex], 
        id: sbUser.id, 
        name, 
        avatar, 
        email 
      };
      allUsers[existingIndex] = activeUser;
    } else {
      activeUser = {
        id: sbUser.id,
        name,
        email,
        avatar,
        role: 'Personal Workspace',
        plan: 'free',
        onboarded: true,
        createdAt: new Date().toISOString(),
      };
      // Place newly authenticated user at the front of the list
      allUsers.unshift(activeUser);
      storage.getCategories(activeUser.id);
    }

    // Migrate any legacy data from previous local manual user id if needed
    if (existingIndex >= 0) {
      const oldId = allUsers[existingIndex].id;
      if (oldId && oldId !== activeUser.id) {
        const oldCats = localStorage.getItem(`chronicle_${oldId}_categories`);
        if (oldCats && !localStorage.getItem(`chronicle_${activeUser.id}_categories`)) {
          localStorage.setItem(`chronicle_${activeUser.id}_categories`, oldCats);
        }
        const oldActs = localStorage.getItem(`chronicle_${oldId}_activities`);
        if (oldActs && !localStorage.getItem(`chronicle_${activeUser.id}_activities`)) {
          localStorage.setItem(`chronicle_${activeUser.id}_activities`, oldActs);
        }
      }
    }

    // Persist immediately to localStorage
    storage.setUsers(allUsers);
    storage.setCurrentUserId(activeUser.id);

    // Update React state synchronously together
    setUsers([...allUsers]);
    setCurrentUserId(activeUser.id);

    // Clean up OAuth fragment or search code from URL once session is safely established
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.hash.includes('access_token=') || url.search.includes('code=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Listen to Supabase Auth state changes & OAuth redirect callbacks
  useEffect(() => {
    if (!supabase) return;

    // 1. Check existing active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('[Auth] getSession:', error.message);
      }
      if (session?.user) {
        handleSupabaseUser(session.user);
      }
    });

    // 2. Listen for real-time auth events (SIGNED_IN handles PKCE callback completion, TOKEN_REFRESHED, USER_UPDATED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] onAuthStateChange event:', event, session?.user?.email);
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        handleSupabaseUser(session.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [handleSupabaseUser]);

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
      storage.setCurrentUserId(userId);
    }
  };

  const registerUser = (
    name: string, 
    email: string, 
    role: string = 'Personal Workspace',
    customAvatar?: string
  ): User => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim() || trimmedEmail.split('@')[0];
    const avatar = customAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=10b981&color=fff&bold=true`;

    const allUsers = storage.getUsers();
    const existing = allUsers.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (existing) {
      setCurrentUserId(existing.id);
      storage.setCurrentUserId(existing.id);
      return existing;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      avatar,
      role: role.trim() || 'Personal Workspace',
      plan: 'free',
      onboarded: true,
      createdAt: new Date().toISOString(),
    };

    storage.saveUser(newUser);
    storage.setCurrentUserId(newUser.id);
    storage.getCategories(newUser.id);
    
    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    return newUser;
  };

  const loginUser = (email: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === trimmed);
    if (found) {
      setCurrentUserId(found.id);
      storage.setCurrentUserId(found.id);
      return true;
    }
    return false;
  };

  const loginOrCreateUser = (email: string, name?: string): { user: User; isNew: boolean } => {
    const trimmedEmail = email.trim();
    const allUsers = storage.getUsers();
    const found = allUsers.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (found) {
      setCurrentUserId(found.id);
      storage.setCurrentUserId(found.id);
      return { user: found, isNew: false };
    }

    const trimmedName = name?.trim() || trimmedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isGoogle = trimmedEmail.toLowerCase().includes('gmail.com');
    const avatar = isGoogle
      ? `https://lh3.googleusercontent.com/a/default-user=s96-c`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=10b981&color=fff&bold=true`;

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      avatar,
      role: 'Personal Workspace',
      plan: 'free',
      onboarded: true,
      createdAt: new Date().toISOString(),
    };

    storage.saveUser(newUser);
    storage.setCurrentUserId(newUser.id);
    storage.getCategories(newUser.id);
    
    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    return { user: newUser, isNew: true };
  };

  const loginWithGoogle = async (): Promise<{ error: Error | null }> => {
    return await signInWithGoogle();
  };

  const logoutUser = () => {
    signOutSupabase();
    const firstId = users[0]?.id || 'user_alex';
    setCurrentUserId(firstId);
    storage.setCurrentUserId(firstId);
  };

  const updateUserPlan = (plan: PlanTier) => {
    const updated = { ...currentUser, plan };
    storage.saveUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const completeOnboarding = () => {
    const updated = { ...currentUser, onboarded: true };
    storage.saveUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated: true,
        isSupabaseConnected: isSupabaseConfigured(),
        switchUser,
        registerUser,
        loginUser,
        loginOrCreateUser,
        loginWithGoogle,
        logoutUser,
        updateUserPlan,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
