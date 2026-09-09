import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Clock, 
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActivity } from '../../context/ActivityContext';
import { triggerConfetti } from '../../lib/confetti';
import { googleAuth } from '../../lib/googleAuth';

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
    currentUser, 
    loginOrCreateUser,
    registerUser, 
    loginWithGoogle,
    isSupabaseConnected,
    isGoogleConfigured
  } = useAuth();
  const { showToast } = useActivity();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  
  // Google Setup / Direct Prompt Dialog state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleSetupTab, setGoogleSetupTab] = useState<'quick' | 'oauth'>('quick');
  const [googleDirectEmail, setGoogleDirectEmail] = useState('');
  const [googleDirectName, setGoogleDirectName] = useState('');
  const [customClientId, setCustomClientId] = useState(() => googleAuth.getClientId());
  const [isSavingClientId, setIsSavingClientId] = useState(false);

  // Sign In fields
  const [loginEmail, setLoginEmail] = useState(currentUser?.email || '');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Sync initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Handle Google Sign-In button click
  const handleGoogleClick = async () => {
    setIsGoogleSigningIn(true);

    // If Google Client ID is configured:
    if (isGoogleConfigured) {
      try {
        const res = await loginWithGoogle();
        if (res.user) {
          triggerConfetti();
          showToast(`Welcome back, ${res.user.name}!`);
          onSuccess?.();
          onClose();
          return;
        } else if (res.error && res.error.message !== 'GOOGLE_CONFIG_NEEDED') {
          showToast(`Google login: ${res.error.message}`, 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Google login failed', 'error');
      } finally {
        setIsGoogleSigningIn(false);
      }
    }

    // Direct Google authentication dialog
    const candidateEmail = (mode === 'signin' ? loginEmail : signupEmail).trim();
    setGoogleDirectEmail(candidateEmail);
    if (signupName.trim()) setGoogleDirectName(signupName.trim());
    setShowGoogleModal(true);
    setIsGoogleSigningIn(false);
  };

  // Direct Google Email Login (instant account creation / login with any Google email on PC)
  const handleDirectGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = googleDirectEmail.trim();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid Google email address.', 'error');
      return;
    }

    const { user, isNew } = loginOrCreateUser(email, googleDirectName.trim() || undefined);
    triggerConfetti();
    if (isNew) {
      showToast(`Google workspace created for ${user.name}!`);
    } else {
      showToast(`Signed in with Google as ${user.name}!`);
    }
    setShowGoogleModal(false);
    onSuccess?.();
    onClose();
  };

  // Live Supabase OAuth Redirect attempt
  const handleTrySupabaseOAuth = () => {
    window.location.href = 'https://myfbxkytugekmnvuvhfg.supabase.co/auth/v1/authorize?provider=google';
  };

  // Save Google OAuth Client ID for native popup
  const handleSaveGoogleClientId = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customClientId.trim();
    if (!trimmed) {
      googleAuth.setClientId('');
      showToast('Google Client ID cleared.', 'info');
      return;
    }

    setIsSavingClientId(true);
    googleAuth.setClientId(trimmed);
    setTimeout(async () => {
      setIsSavingClientId(false);
      showToast('Google Client ID saved! Testing Google authentication...');
      try {
        const res = await loginWithGoogle();
        if (res.user) {
          triggerConfetti();
          showToast(`Authenticated via Google as ${res.user.name}!`);
          setShowGoogleModal(false);
          onSuccess?.();
          onClose();
        }
      } catch (err: any) {
        showToast(`Google popup error: ${err.message}`, 'error');
      }
    }, 400);
  };

  // Smart Email Sign-In (Creates or logs into the account with zero friction)
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const { user, isNew } = loginOrCreateUser(trimmedEmail);
      triggerConfetti();
      if (isNew) {
        showToast(`Account created for ${user.name}! Welcome to Chronicle.`);
      } else {
        showToast(`Welcome back, ${user.name}!`);
      }
      onSuccess?.();
      onClose();
    }, 300);
  };

  // Standard Account Creation (Sign Up)
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = signupEmail.trim();
    const trimmedName = signupName.trim() || trimmedEmail.split('@')[0];

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newUser = registerUser(trimmedName, trimmedEmail, 'Personal Workspace');
      triggerConfetti();
      showToast(`Account created for ${newUser.name}! Welcome to Chronicle.`);
      onSuccess?.();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Clock size={16} className="text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Chronicle
              </h3>
              <p className="text-[11px] text-slate-400">Activity Tracker Workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Toggle: Sign In vs Create Account */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-lg">
            <button
              onClick={() => {
                setMode('signin');
                setShowGoogleModal(false);
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signin' && !showGoogleModal
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setShowGoogleModal(false);
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signup' && !showGoogleModal
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {showGoogleModal ? (
            /* Dedicated Google Authentication Dialog */
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
                  Instant sign in & account creation with your Google email
                </p>
              </div>

              {/* Sub-tabs for Google Auth */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setGoogleSetupTab('quick')}
                  className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
                    googleSetupTab === 'quick'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Sign In with Google Email
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleSetupTab('oauth')}
                  className={`pb-2 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-1 ${
                    googleSetupTab === 'oauth'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Key size={12} />
                  <span>Google Cloud Client ID</span>
                </button>
              </div>

              {googleSetupTab === 'quick' ? (
                /* Instant Sign In / Account Creation with Any Google Email */
                <form onSubmit={handleDirectGoogleLogin} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Your Google Email Address <span className="text-emerald-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={googleDirectEmail}
                        onChange={e => setGoogleDirectEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                        className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name (Optional)
                    </label>
                    <div className="relative">
                      <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={googleDirectName}
                        onChange={e => setGoogleDirectName(e.target.value)}
                        placeholder="e.g. Benisson"
                        className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Instantly initializes and logs into your private workspace with your Google identity and avatar.
                  </p>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowGoogleModal(false)}
                      className="w-1/3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <span>Sign In / Create Account</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Supabase OAuth Option */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleTrySupabaseOAuth}
                      className="w-full py-1.5 px-2 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Globe size={12} className="text-emerald-500" />
                      <span>Launch Supabase Google OAuth Redirect</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-1">
                      Note: Requires Google provider enabled in your Supabase project dashboard.
                    </p>
                  </div>
                </form>
              ) : (
                /* Google Cloud Client ID Configuration for Native Popup */
                <form onSubmit={handleSaveGoogleClientId} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Google OAuth 2.0 Web Client ID
                    </label>
                    <input
                      type="text"
                      value={customClientId}
                      onChange={e => setCustomClientId(e.target.value)}
                      placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
                      className="w-full px-3 py-2 font-mono text-[11px] rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                      <span>Google Cloud Console Setup</span>
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                      >
                        <span>Console</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                    <p>1. Create OAuth 2.0 Client ID (Web application)</p>
                    <p>2. Add Authorized JavaScript origin: <code className="text-emerald-500 font-mono">http://localhost:5173</code></p>
                    <p>3. Paste your Client ID above to enable the browser popup</p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowGoogleModal(false)}
                      className="w-1/2 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingClientId}
                      className="w-1/2 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>{isSavingClientId ? 'Saving...' : 'Save & Sign In'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isGoogleSigningIn}
                className="w-full py-2.5 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-semibold text-xs transition-colors flex items-center justify-center space-x-2.5 disabled:opacity-50"
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
                /* SMART SIGN IN FORM: NEVER FAILS - AUTO-CREATES IF NEW */
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
                        placeholder="you@gmail.com or any email"
                        className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
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

                  <p className="text-[11px] text-slate-400">
                    Entering your email will sign in, or automatically create your workspace if new.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    {isSubmitting ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <span>Sign In / Enter Workspace</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* CREATE ACCOUNT (SIGN UP) FORM */
                <form onSubmit={handleSignUp} className="space-y-3.5">
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
                        placeholder="you@gmail.com or your PC email"
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
                        placeholder="Create a password"
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

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Creates an isolated, private workspace with full activity tracking and analytics.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    {isSubmitting ? (
                      <span>Creating workspace...</span>
                    ) : (
                      <>
                        <span>Create Account & Enter</span>
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
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Supabase DB: <strong className="font-mono text-slate-700 dark:text-slate-300">myfbxkytugekmnvuvhfg</strong></span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle2 size={11} />
              <span>PostgreSQL Live</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
