import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  ListFilter, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Target, 
  FileSpreadsheet, 
  Settings, 
  Plus, 
  Timer, 
  CreditCard,
  Moon, 
  Sun, 
  User, 
  X,
  Command,
  HelpCircle,
  Mail,
  LogOut
} from 'lucide-react';
import { ViewMode } from '../../types';
import { useActivity } from '../../context/ActivityContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface CommandPaletteProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onLogout?: () => void;
  onOpenHelp?: () => void;
  onOpenContact?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  onNavigate,
  onLogout,
  onOpenHelp,
  onOpenContact
}) => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, openCreateActivityModal, startTimer, categories } = useActivity();
  const { users, currentUser, switchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    category: 'Navigation' | 'Actions' | 'Personas' | 'Preferences';
    action: () => void;
  }

  const items: CommandItem[] = [
    // Navigation
    { id: 'nav-dash', title: 'Go to Dashboard', icon: <LayoutDashboard size={16} />, category: 'Navigation', action: () => onNavigate('dashboard') },
    { id: 'nav-timer', title: 'Go to Focus Timer', subtitle: 'Countdown presets, stopwatch, audio chimes', icon: <Timer size={16} className="text-emerald-500" />, category: 'Navigation', action: () => onNavigate('timer') },
    { id: 'nav-acts', title: 'Go to Activity History', icon: <ListFilter size={16} />, category: 'Navigation', action: () => onNavigate('activities') },
    { id: 'nav-cal', title: 'Go to Calendar', icon: <CalendarIcon size={16} />, category: 'Navigation', action: () => onNavigate('calendar') },
    { id: 'nav-ana', title: 'Go to Analytics & Intelligence', icon: <BarChart3 size={16} />, category: 'Navigation', action: () => onNavigate('analytics') },
    { id: 'nav-goals', title: 'Go to Goals & Progress', icon: <Target size={16} />, category: 'Navigation', action: () => onNavigate('goals') },
    { id: 'nav-rep', title: 'Go to Reports & Exports', icon: <FileSpreadsheet size={16} />, category: 'Navigation', action: () => onNavigate('reports') },
    { id: 'nav-pricing', title: 'Go to Plans & Pricing', subtitle: 'Compare Free, Pro, and Enterprise tiers', icon: <CreditCard size={16} className="text-amber-500" />, category: 'Navigation', action: () => onNavigate('pricing') },
    { id: 'nav-set', title: 'Go to Settings', icon: <Settings size={16} />, category: 'Navigation', action: () => onNavigate('settings') },
    
    // Actions
    { 
      id: 'act-new', 
      title: 'Log New Activity', 
      subtitle: 'Shortcut: N',
      icon: <Plus size={16} className="text-emerald-500" />, 
      category: 'Actions', 
      action: () => openCreateActivityModal() 
    },
    { 
      id: 'act-timer', 
      title: 'Start Live Stopwatch Timer', 
      subtitle: 'Track active focus in real-time',
      icon: <Timer size={16} className="text-indigo-500" />, 
      category: 'Actions', 
      action: () => startTimer('Focused Session', categories[0]?.id || '') 
    },
    { 
      id: 'pref-theme', 
      title: `Toggle Theme (Currently ${theme === 'dark' ? 'Dark' : 'Light'})`, 
      icon: theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-400" />, 
      category: 'Preferences', 
      action: () => toggleTheme() 
    },
    { 
      id: 'act-help', 
      title: 'Ask for Help & FAQs', 
      subtitle: 'Shortcut: ?',
      icon: <HelpCircle size={16} className="text-emerald-500" />, 
      category: 'Actions', 
      action: () => onOpenHelp?.() 
    },
    { 
      id: 'act-contact', 
      title: 'Contact Chronicle Support Team', 
      subtitle: 'Send direct support ticket or question',
      icon: <Mail size={16} className="text-teal-500" />, 
      category: 'Actions', 
      action: () => onOpenContact?.() 
    },
    { 
      id: 'act-logout', 
      title: 'Sign Out / Log Out', 
      subtitle: 'Switch to landing page',
      icon: <LogOut size={16} className="text-rose-500" />, 
      category: 'Actions', 
      action: () => onLogout?.() 
    },
  ];

  // Add personas switcher
  users.forEach(u => {
    items.push({
      id: `persona-${u.id}`,
      title: `Switch to ${u.name}`,
      subtitle: `${u.role} (${u.plan.toUpperCase()} Plan)${u.id === currentUser.id ? ' - Active' : ''}`,
      icon: <User size={16} className="text-blue-400" />,
      category: 'Personas',
      action: () => switchUser(u.id),
    });
  });

  const filtered = items.filter(it => 
    it.title.toLowerCase().includes(query.toLowerCase()) || 
    it.category.toLowerCase().includes(query.toLowerCase()) ||
    (it.subtitle && it.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (item: CommandItem) => {
    item.action();
    setCommandPaletteOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search size={18} className="text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page, or search..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm font-medium"
          />
          <button 
            onClick={() => setCommandPaletteOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {item.icon}
                    </span>
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Command size={11} className="text-slate-400" />
            <span>Quick Actions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
