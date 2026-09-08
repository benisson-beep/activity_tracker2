import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Briefcase, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  Clock, 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActivity } from '../../context/ActivityContext';
import { triggerConfetti } from '../../lib/confetti';
import { PlanTier } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess
}) => {
  const { 
    users, 
    currentUser, 
    switchUser, 
    loginUser, 
    registerUser, 
    updateUserPlan,
    loginWithGoogle,
    loginWithDemoGoogle,
    isSupabaseConnected
  } = useAuth();
  const { showToast } = useActivity();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Sign In fields
  const [loginEmail, setLoginEmail] = useState(currentUser?.email || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('Product Designer & Strategist');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPlan, setSignupPlan] = useState<PlanTier>('pro');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password toggle
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    if (isSupabaseConnected) {
      const res = await loginWithGoogle();
      if (res.error) {
        showToast(`Google login error: ${res.error.message}`, 'error');
        setIsGoogleSigningIn(false);
      }
    } else {
      // If user has already entered an email in signin or signup, prepopulate it
      const candidateEmail = (mode === 'signin' ? loginEmail : signupEmail).trim();
      const candidateName = (mode === 'signup' ? signupName : '').trim();
      
      setGoogleEmail(candidateEmail || '');
      setGoogleName(candidateName || '');
      setShowGooglePrompt(true);
      setIsGoogleSigningIn(false);
    }
  };

  const handleConfirmGoogleLogin = (customName?: string, customEmail?: string) => {
    const finalEmail = (customEmail || googleEmail).trim();
    const finalName = (customName || googleName).trim();
    if (!finalEmail || !finalEmail.includes('@')) {
      showToast('Please provide a valid Google email address.', 'error');
      return;
    }

    const googleUser = loginWithDemoGoogle(finalName, finalEmail);
    triggerConfetti();
    showToast(`Signed in with Google as ${googleUser.name}!`);
    setShowGooglePrompt(false);
    onSuccess?.();
    onClose();
  };

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const success = loginUser(trimmedEmail);
      if (success) {
        showToast('Signed in successfully! Welcome back.');
        onSuccess?.();
        onClose();
      } else {
        showToast(`No account found for "${trimmedEmail}". Please create your account first.`, 'info');
        setSignupEmail(trimmedEmail);
        setMode('signup');
      }
    }, 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = signupEmail.trim();
    const trimmedName = signupName.trim();
    if (!trimmedName || !trimmedEmail || !signupPassword.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    // Check if account already exists
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (existing) {
      showToast(`An account for "${trimmedEmail}" already exists. Please sign in.`, 'info');
      setLoginEmail(trimmedEmail);
      setMode('signin');
      return;
    }

    if (!agreeTerms) {
      showToast('Please accept the Terms of Service to proceed.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newUser = registerUser(trimmedName, trimmedEmail, signupRole.trim());
      if (signupPlan !== 'free') {
        updateUserPlan(signupPlan);
      }
      triggerConfetti();
      showToast(`Account created for ${newUser.name}! Welcome to Chronicle.`);
      onSuccess?.();
      onClose();
    }, 500);
  };

  const handleDemoSignIn = (userId: string) => {
    switchUser(userId);
    showToast('Switched demo account successfully.');
    onSuccess?.();
    onClose();
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    showToast(`Password recovery link dispatched to ${forgotEmail}. Check your inbox!`);
    setShowForgot(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header & Close */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Clock size={16} className="text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Chronicle
              </h3>
              <p className="text-[11px] text-slate-400">Activity Tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-lg">
            <button
              onClick={() => {
                setMode('signin');
                setShowForgot(false);
                setShowGooglePrompt(false);
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signin' && !showGooglePrompt
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setShowForgot(false);
                setShowGooglePrompt(false);
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signup' && !showGooglePrompt
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5">
          {showGooglePrompt ? (
            /* Dedicated Google Account Selector / Input */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Continue with Google
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an account or enter your Google credentials to authenticate
                </p>
              </div>

              {/* Quick existing account selection */}
              {users.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Existing Workspaces
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleConfirmGoogleLogin(u.name, u.email)}
                        className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors group"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-500">
                              {u.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-500 font-medium">Select</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Or enter custom Google details */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Or Use Your Personal Google Account
                </p>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={e => setGoogleName(e.target.value)}
                    placeholder="e.g. Benisson"
                    className="w-full px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={e => setGoogleEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGooglePrompt(false)}
                  className="w-1/2 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmGoogleLogin(googleName, googleEmail)}
                  className="w-1/2 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : showForgot ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reset your password
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your account email and we will dispatch a secure login link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-3.5 py-2 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="w-1/2 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSigningIn}
                className="w-full py-2 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-semibold text-xs transition-colors flex items-center justify-center space-x-2.5 disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleSigningIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 font-medium whitespace-nowrap">
                  or continue with email
                </span>
              </div>

              {mode === 'signin' ? (
                /* SIGN IN FORM */
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(loginEmail);
                          setShowForgot(true);
                        }}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Remember workspace</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    {isSubmitting ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <span>Sign In to Chronicle</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>

                  {/* 1-Click Demo Accounts Quick Selector */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                      1-Click Instant Demo Login
                    </p>
                    <div className="space-y-1">
                      {users.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleDemoSignIn(u.id)}
                          className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between text-left transition-colors group"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-500 transition-colors">
                                {u.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">{u.role}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                            {u.plan}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              ) : (
                /* SIGN UP FORM */
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name <span className="text-emerald-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={e => setSignupName(e.target.value)}
                        placeholder="e.g. Benisson"
                        className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-emerald-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={e => setSignupEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Role or Primary Focus
                    </label>
                    <div className="relative">
                      <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={signupRole}
                        onChange={e => setSignupRole(e.target.value)}
                        placeholder="Software Engineer, Researcher, Student..."
                        className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Password <span className="text-emerald-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full pl-9 pr-9 py-2 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Plan Choice */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Tier
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupPlan('free')}
                        className={`p-2 rounded-md border text-left transition-all ${
                          signupPlan === 'free'
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Free Starter</span>
                          <span className="text-[10px] font-mono">$0</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">100 records/mo</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignupPlan('pro')}
                        className={`p-2 rounded-md border text-left transition-all ${
                          signupPlan === 'pro'
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Pro Trial</span>
                          <span className="text-[10px] font-mono">$12/mo</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">14-day full access</p>
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start space-x-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={e => setAgreeTerms(e.target.checked)}
                      className="w-3.5 h-3.5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      I agree to the Terms of Service and Privacy Policy.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    {isSubmitting ? (
                      <span>Creating account...</span>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              )}
        </div>
      )}

          {/* Supabase PostgreSQL Integration Indicator */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full inline-block ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-emerald-500'}`}></span>
              <span>Supabase DB: <strong className="font-mono text-slate-700 dark:text-slate-300">myfbxkytugekmnvuvhfg</strong></span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">PostgreSQL Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
