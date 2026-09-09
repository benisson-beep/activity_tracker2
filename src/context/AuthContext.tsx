import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PlanTier } from '../types';
import { storage } from '../lib/storage';
import { supabase, signInWithGoogle, signOutSupabase, isSupabaseConfigured } from '../lib/supabase';
import { googleAuth, GoogleUserProfile } from '../lib/googleAuth';

interface AuthContextType {
  currentUser: User;
  users: User[];
  isAuthenticated: boolean;
  isSupabaseConnected: boolean;
  isGoogleConfigured: boolean;
  switchUser: (userId: string) => void;
  registerUser: (name: string, email: string, role?: string, avatar?: string) => User;
  loginUser: (email: string) => boolean;
  loginOrCreateUser: (email: string, name?: string) => { user: User; isNew: boolean };
  loginWithGoogle: () => Promise<{ error: Error | null; user?: User }>;
  loginWithGoogleProfile: (profile: GoogleUserProfile) => User;
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
          role: 'Personal Workspace',
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
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    return { user: newUser, isNew: true };
  };

  const loginWithGoogleProfile = (profile: GoogleUserProfile): User => {
    const existing = users.find(
      u => (profile.email && u.email.toLowerCase() === profile.email.toLowerCase()) || u.id === profile.id
    );

    if (existing) {
      const updated: User = {
        ...existing,
        name: profile.name || existing.name,
        avatar: profile.avatar || existing.avatar,
      };
      storage.saveUser(updated);
      setUsers(prev => prev.map(u => u.id === existing.id ? updated : u));
      setCurrentUserId(existing.id);
      return updated;
    }

    const newUser: User = {
      id: `google_${profile.id || Date.now()}`,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar || `https://lh3.googleusercontent.com/a/default-user=s96-c`,
      role: 'Personal Workspace',
      plan: 'free',
      onboarded: true,
      createdAt: new Date().toISOString(),
    };

    storage.saveUser(newUser);
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    return newUser;
  };

  const loginWithGoogle = async (): Promise<{ error: Error | null; user?: User }> => {
    // 1. If Google Client ID is configured, use official Google Identity Services popup
    if (googleAuth.isConfigured()) {
      try {
        const profile = await googleAuth.signInWithGooglePopup();
        const user = loginWithGoogleProfile(profile);
        return { error: null, user };
      } catch (err: any) {
        return { error: err instanceof Error ? err : new Error(String(err)) };
      }
    }

    // 2. If Supabase is connected with an anon key, use Supabase OAuth redirect
    if (isSupabaseConfigured()) {
      const res = await signInWithGoogle();
      return { error: res.error };
    }

    // 3. Neither is configured yet
    return { 
      error: new Error('GOOGLE_CONFIG_NEEDED') 
    };
  };

  const loginWithDemoGoogle = (
    customName?: string,
    customEmail?: string
  ): User => {
    const email = (customEmail || 'user@gmail.com').trim();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUserId(existing.id);
      return existing;
    }

    const derivedName = customName?.trim() || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const googleUser: User = {
      id: `user_google_${Date.now()}`,
      name: derivedName,
      email,
      avatar: `https://lh3.googleusercontent.com/a/default-user=s96-c`,
      role: 'Personal Workspace',
      plan: 'free',
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
    // Default to first user or keep existing
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
        isGoogleConfigured: googleAuth.isConfigured(),
        switchUser,
        registerUser,
        loginUser,
        loginOrCreateUser,
        loginWithGoogle,
        loginWithGoogleProfile,
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
