import React, { createContext, useContext, useState, useEffect } from 'react';
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
  
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  useEffect(() => {
    storage.setCurrentUserId(currentUserId);
  }, [currentUserId]);

  const handleSupabaseUser = (sbUser: any) => {
    const meta = sbUser.user_metadata || {};
    const name = meta.full_name || meta.name || sbUser.email?.split('@')[0] || 'Google User';
    const avatar = meta.avatar_url || meta.picture || `https://lh3.googleusercontent.com/a/default-user=s96-c`;
    const email = sbUser.email || '';
    
    setUsers(prev => {
      const existing = prev.find(
        u => u.id === sbUser.id || (u.email && email && u.email.toLowerCase() === email.toLowerCase())
      );

      if (existing) {
        const updated: User = { 
          ...existing, 
          id: sbUser.id, 
          name: name || existing.name, 
          avatar: avatar || existing.avatar, 
          email: email || existing.email 
        };
        storage.saveUser(updated);
        return prev.map(u => (u.id === existing.id || u.id === sbUser.id) ? updated : u);
      } else {
        const newUser: User = {
          id: sbUser.id,
          name,
          email,
          avatar,
          role: 'Personal Workspace',
          plan: 'free',
          onboarded: true,
          createdAt: new Date().toISOString(),
        };
        storage.saveUser(newUser);
        // Provision starter categories if new
        storage.getCategories(newUser.id);
        return [...prev, newUser];
      }
    });

    setCurrentUserId(sbUser.id);

    // Clean up OAuth fragment in URL
    if (typeof window !== 'undefined' && (window.location.hash || window.location.search.includes('code='))) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // Listen to Supabase Auth state changes & OAuth redirect callbacks
  useEffect(() => {
    if (!supabase) return;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      }
    });

    // Listen for auth state events (e.g. SIGNED_IN from OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
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

    // Check if user already exists
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (existing) {
      setCurrentUserId(existing.id);
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
    storage.getCategories(newUser.id);
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    return newUser;
  };

  const loginUser = (email: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === trimmed);
    if (found) {
      setCurrentUserId(found.id);
      return true;
    }
    return false;
  };

  const loginOrCreateUser = (email: string, name?: string): { user: User; isNew: boolean } => {
    const trimmedEmail = email.trim();
    const found = users.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (found) {
      setCurrentUserId(found.id);
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
    storage.getCategories(newUser.id);
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    return { user: newUser, isNew: true };
  };

  const loginWithGoogle = async (): Promise<{ error: Error | null }> => {
    return await signInWithGoogle();
  };

  const logoutUser = () => {
    signOutSupabase();
    // Reset to default first persona
    setCurrentUserId(users[0]?.id || 'user_alex');
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
