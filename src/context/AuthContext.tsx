import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PlanTier } from '../types';
import { storage } from '../lib/storage';

interface AuthContextType {
  currentUser: User;
  users: User[];
  isAuthenticated: boolean;
  switchUser: (userId: string) => void;
  registerUser: (name: string, email: string, role?: string) => User;
  loginUser: (email: string) => boolean;
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

  const logoutUser = () => {
    // Return to default demo persona
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
        switchUser,
        registerUser,
        loginUser,
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
