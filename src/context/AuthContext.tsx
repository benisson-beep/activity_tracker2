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
  registerUser: (name: string, email: string, role?: string) => User;
  loginUser: (email: string) => boolean;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  loginWithDemoGoogle: (name?: string, email?: string) => User;
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
    
    setUsers(prev => {
      const existing = prev.find(u => u.id === sbUser.id || (u.email && sbUser.email && u.email.toLowerCase() === sbUser.email.toLowerCase()));
      if (existing) {
        const updated: User = { ...existing, id: sbUser.id, name, avatar, email: sbUser.email || existing.email };
        storage.saveUser(updated);
        return prev.map(u => (u.id === existing.id || u.id === sbUser.id) ? updated : u);
      } else {
        const newUser: User = {
          id: sbUser.id,
          name,
          email: sbUser.email || '',
          avatar,
          role: 'Google Account User',
          plan: 'free',
          onboarded: true,
          createdAt: new Date().toISOString(),
        };
        storage.saveUser(newUser);
        return [...prev, newUser];
      }
    });

    setCurrentUserId(sbUser.id);
  };

  // Listen to Supabase Auth state changes
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      }
    });

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

  const registerUser = (name: string, email: string, role: string = 'Personal Explorer'): User => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      role,
      plan: 'free',
      onboarded: false,
      createdAt: new Date().toISOString(),
    };

    storage.saveUser(newUser);
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    return newUser;
  };

  const loginUser = (email: string): boolean => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUserId(found.id);
      return true;
    }
    return false;
  };

  const loginWithGoogle = async (): Promise<{ error: Error | null }> => {
    return await signInWithGoogle();
  };

  const loginWithDemoGoogle = (
    name: string = 'Jordan Miller',
    email: string = 'jordan.miller.google@gmail.com'
  ): User => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUserId(existing.id);
      return existing;
    }

    const googleUser: User = {
      id: `user_google_${Date.now()}`,
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Full-Stack Engineer (Google)',
      plan: 'pro',
      onboarded: true,
      createdAt: new Date().toISOString(),
    };

    storage.saveUser(googleUser);
    setUsers(prev => [...prev, googleUser]);
    setCurrentUserId(googleUser.id);
    return googleUser;
  };

  const logoutUser = () => {
    signOutSupabase();
    // Reset to default Alex Chen demo persona
    setCurrentUserId('user_alex');
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
        loginWithGoogle,
        loginWithDemoGoogle,
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
