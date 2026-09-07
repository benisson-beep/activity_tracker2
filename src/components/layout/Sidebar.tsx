import React from 'react';
import { 
  LayoutDashboard, 
  ListFilter, 
  Calendar, 
  BarChart3, 
  Target, 
  FileSpreadsheet, 
  Settings, 
  Timer, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Zap,
  HelpCircle,
  X
} from 'lucide-react';
import { ViewMode } from '../../types';
import { useActivity } from '../../context/ActivityContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenHelp: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenHelp,
}) => {
  const { openCreateActivityModal, startTimer, categories, activities } = useActivity();
  const { currentUser } = useAuth();

  const navItems: Array<{
    id: ViewMode;
    label: string;
    icon: React.ReactNode;
    shortcut: string;
    badge?: number | string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, shortcut: '1' },
    { id: 'activities', label: 'Activities', icon: <ListFilter size={18} />, shortcut: '2', badge: activities.length },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={18} />, shortcut: '3' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} />, shortcut: '4' },
    { id: 'goals', label: 'Goals', icon: <Target size={18} />, shortcut: '5' },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet size={18} />, shortcut: '6' },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, shortcut: '7' },
  ];

  const handleNavClick = (view: ViewMode) => {
    onNavigate(view);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 border-r border-slate-800/80 transition-all select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-900/30 group-hover:scale-105 transition-transform">
            <Zap size={18} className="fill-slate-950" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-white tracking-tight text-base font-sans">
                  Chronicle
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5">Activity Intelligence</p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {isMobileOpen ? (
          <button 
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X size={20} />
          </button>
        ) : (
          /* Desktop collapse toggle */
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        {(!isCollapsed || isMobileOpen) ? (
          <button
            onClick={() => {
              openCreateActivityModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>Record Activity</span>
            <kbd className="ml-auto text-[10px] font-mono opacity-70 bg-emerald-700/60 px-1 rounded">N</kbd>
          </button>
        ) : (
          <button
            onClick={() => openCreateActivityModal()}
            className="w-full h-10 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
            title="Record Activity (N)"
          >
            <Plus size={18} className="stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
              }`}
              title={item.label}
            >
              <div className="flex items-center space-x-3 truncate">
                <span className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </span>
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate font-medium">{item.label}</span>
                )}
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <div className="flex items-center space-x-1.5 ml-2">
                  {item.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                  <kbd className="hidden lg:inline-block text-[9px] font-mono text-slate-400/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.shortcut}
                  </kbd>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Timer Launcher & User Card in Footer */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {(!isCollapsed || isMobileOpen) ? (
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Timer size={14} />
              </div>
              <div className="truncate">
                <p className="text-[11px] font-semibold text-slate-200 truncate">Stopwatch Timer</p>
                <p className="text-[9px] text-slate-500 truncate">Instant focus tracking</p>
              </div>
            </div>
            <button
              onClick={() => {
                startTimer('Focus Session', categories[0]?.id || '');
                onCloseMobile();
              }}
              className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold transition-colors"
            >
              Start
            </button>
          </div>
        ) : (
          <button
            onClick={() => startTimer('Focus Session', categories[0]?.id || '')}
            className="w-full h-9 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 transition-colors"
            title="Start Stopwatch"
          >
            <Timer size={16} />
          </button>
        )}

        {/* User Card */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="pt-2 flex items-center justify-between px-1">
            <div className="flex items-center space-x-2 truncate">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500/40"
              />
              <div className="truncate">
                <p className="text-[11px] font-semibold text-slate-300 truncate">{currentUser.name}</p>
                <p className="text-[9px] text-emerald-400 font-mono uppercase">{currentUser.plan} TIER</p>
              </div>
            </div>
            <button 
              onClick={onOpenHelp}
              className="text-slate-400 hover:text-slate-200 p-1"
              title="Keyboard Shortcuts & Guidance"
            >
              <HelpCircle size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside 
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-200 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        >
          <div 
            className="w-72 h-full max-w-[85vw] shadow-2xl animate-slide-right"
            onClick={e => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
