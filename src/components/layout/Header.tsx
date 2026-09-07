import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Timer, 
  Pause, 
  Play, 
  Check, 
  Sun, 
  Moon, 
  ChevronDown, 
  UserCheck, 
  UserPlus, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  HelpCircle,
  Mail
} from 'lucide-react';
import { ViewMode } from '../../types';
import { useActivity } from '../../context/ActivityContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  currentView: ViewMode;
  onOpenMobileMenu: () => void;
  onNavigate: (view: ViewMode) => void;
  onLogout?: () => void;
  onOpenHelp?: () => void;
  onOpenContact?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onOpenMobileMenu, 
  onNavigate,
  onLogout,
  onOpenHelp,
  onOpenContact
}) => {
  const { 
    openCreateActivityModal, 
    setCommandPaletteOpen, 
    timerState, 
    pauseTimer, 
    resumeTimer, 
    stopTimerAndSave, 
    resetTimer 
  } = useActivity();
  const { currentUser, users, switchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimerSeconds = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const viewTitles: Record<ViewMode, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Overview', subtitle: "What you have done and what's next" },
    activities: { title: 'Activity Stream', subtitle: 'Detailed chronological history and filters' },
    calendar: { title: 'Activity Calendar', subtitle: 'Visual day, week, and month view' },
    analytics: { title: 'Time Intelligence', subtitle: 'Real patterns, consistency, and focus metrics' },
    goals: { title: 'Goals & Milestones', subtitle: 'Real-time progress tied directly to recorded activities' },
    reports: { title: 'Executive Reports', subtitle: 'Daily debriefs, weekly summaries, and exports' },
    timer: { title: 'Deep Focus Timer', subtitle: 'Countdown focus intervals, stopwatches, and chime alerts' },
    pricing: { title: 'Plans & Pricing', subtitle: 'Simple, transparent pricing for individuals and teams' },
    settings: { title: 'System Settings', subtitle: 'Manage custom categories, preferences, and plans' },
  };

  const currentInfo = viewTitles[currentView] || { title: 'Chronicle', subtitle: 'Activity Intelligence' };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left section: mobile menu toggle + title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden rounded-lg focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white capitalize">
              {currentInfo.title}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
              Live
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Middle & Right Section: Timer + Quick Actions + Profile */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Active Timer Pill if running or has elapsed */}
        {(timerState.isRunning || timerState.elapsedSeconds > 0) && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-pulse-subtle">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <button 
              onClick={() => onNavigate('timer')} 
              className="flex items-center space-x-1.5 hover:underline focus:outline-none"
              title="Open Focus Timer"
            >
              <span className="font-mono">{formatTimerSeconds(timerState.elapsedSeconds)}</span>
              <span className="hidden sm:inline text-slate-600 dark:text-slate-300 max-w-[120px] truncate">
                {timerState.title || 'Tracking...'}
              </span>
            </button>
            <div className="flex items-center space-x-1 pl-1 border-l border-emerald-500/20">
              {timerState.isRunning ? (
                <button
                  onClick={pauseTimer}
                  title="Pause timer"
                  className="p-1 hover:bg-emerald-500/20 rounded text-emerald-600 dark:text-emerald-400"
                >
                  <Pause size={12} />
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  title="Resume timer"
                  className="p-1 hover:bg-emerald-500/20 rounded text-emerald-600 dark:text-emerald-400"
                >
                  <Play size={12} />
                </button>
              )}
              <button
                onClick={stopTimerAndSave}
                title="Finish and log activity"
                className="p-1 hover:bg-emerald-600 hover:text-white rounded bg-emerald-500 text-white font-medium"
              >
                <Check size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Global Search Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center space-x-2 px-2.5 md:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium transition-colors border border-transparent dark:border-slate-700/50"
          title="Command Palette (Cmd+K)"
        >
          <Search size={14} />
          <span className="hidden md:inline">Quick Search</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-400 dark:text-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={() => openCreateActivityModal()}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus size={14} className="stroke-[2.5]" />
          <span className="hidden sm:inline">Log Activity</span>
        </button>

        {/* Ask for Help Button */}
        <button
          onClick={onOpenHelp}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex items-center space-x-1"
          title="Ask for Help, FAQs & Shortcuts (?)"
        >
          <HelpCircle size={16} />
          <span className="hidden lg:inline text-xs font-medium">Help</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Persona Switcher & Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center space-x-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30"
            />
            <span className="hidden xl:inline text-xs font-semibold text-slate-700 dark:text-slate-200">
              {currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                <div className="mt-1.5 flex items-center space-x-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    {currentUser.plan} PLAN
                  </span>
                  <span className="text-[10px] text-slate-400">Isolated Workspace</span>
                </div>
              </div>

              {/* Persona Switcher Section */}
              <div className="py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="px-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Persona Demo
                </p>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-1.5 flex items-center justify-between text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                      <div className="truncate">
                        <p className={`font-medium truncate ${u.id === currentUser.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{u.role}</p>
                      </div>
                    </div>
                    {u.id === currentUser.id && (
                      <UserCheck size={14} className="text-emerald-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Settings, Help, Contact, and Logout Links */}
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center space-x-2"
                >
                  <ShieldCheck size={14} className="text-slate-400" />
                  <span>Subscription & Limits</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenHelp?.();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center space-x-2"
                >
                  <HelpCircle size={14} className="text-emerald-500" />
                  <span>Ask for Help & FAQs</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenContact?.();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center space-x-2"
                >
                  <Mail size={14} className="text-teal-500" />
                  <span>Contact Support Team</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2 transition-colors border-t border-slate-100 dark:border-slate-800/60 mt-1"
                >
                  <LogOut size={14} />
                  <span>Sign Out / Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
