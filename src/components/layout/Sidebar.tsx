import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, 
  ListFilter, 
  Calendar, 
  Timer,
  BarChart3, 
  Target, 
  FileSpreadsheet, 
  ShieldCheck,
  Settings, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Zap,
  HelpCircle,
  LogOut,
  Mail,
  X,
  Pin
} from 'lucide-react';
import { ViewMode } from '../../types';
import { useActivity } from '../../context/ActivityContext';
import { useAuth } from '../../context/AuthContext';
import { SocialIcons } from '../common/SocialIcons';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenHelp: () => void;
  onLogout?: () => void;
  onOpenContact?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenHelp,
  onLogout,
  onOpenContact,
}) => {
  const { openCreateActivityModal, timerState, categories, activities } = useActivity();
  const { currentUser } = useAuth();

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 120);
  };

  // If isCollapsed is false, the user pinned the sidebar open ("unless it already expanded")
  // If isCollapsed is true, it expands when cursor enters and shrinks when cursor leaves
  const isExpanded = !isCollapsed || isHovered || isMobileOpen;

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
    { id: 'timer', label: 'Focus Timer', icon: <Timer size={18} />, shortcut: 'T', badge: timerState.isRunning ? '●' : undefined },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} />, shortcut: '4' },
    { id: 'goals', label: 'Goals', icon: <Target size={18} />, shortcut: '5' },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet size={18} />, shortcut: '6' },
    { id: 'pricing', label: 'Pricing', icon: <ShieldCheck size={18} />, shortcut: 'P' },
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
          className="flex items-center space-x-2.5 cursor-pointer group truncate"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-900/30 group-hover:scale-105 transition-transform flex-shrink-0">
            <Zap size={18} className="fill-slate-950" />
          </div>
          {isExpanded && (
            <div className="truncate whitespace-nowrap animate-fade-in">
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
          /* Desktop collapse / pin toggle */
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            title={isCollapsed ? "Lock / Pin sidebar expanded" : "Unpin sidebar (auto-collapse on hover exit)"}
          >
            {isCollapsed ? <Pin size={15} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        {isExpanded ? (
          <button
            onClick={() => {
              openCreateActivityModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all whitespace-nowrap animate-fade-in"
          >
            <Plus size={16} className="stroke-[2.5] flex-shrink-0" />
            <span className="truncate">Record Activity</span>
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
      <nav className="flex-1 px-2.5 py-1 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
              }`}
              title={item.label}
            >
              <div className="flex items-center space-x-3 truncate">
                <span className={`transition-colors flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </span>
                {isExpanded && (
                  <span className="truncate font-medium whitespace-nowrap animate-fade-in">{item.label}</span>
                )}
              </div>

              {isExpanded && (
                <div className="flex items-center space-x-1.5 ml-2 flex-shrink-0 animate-fade-in">
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      item.id === 'timer' && timerState.isRunning
                        ? 'bg-emerald-500 text-slate-950 font-bold animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
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

      {/* User Card & Actions in Footer */}
      <div className="p-3 border-t border-slate-800/80 space-y-2.5">
        {isExpanded ? (
          <div className="space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2 truncate">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500/40 flex-shrink-0"
                />
                <div className="truncate whitespace-nowrap">
                  <p className="text-[11px] font-semibold text-slate-300 truncate">{currentUser.name}</p>
                  <p className="text-[9px] text-emerald-400 font-mono uppercase">{currentUser.plan} TIER</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button 
                  onClick={onOpenHelp}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Ask for Help & FAQs (?)"
                >
                  <HelpCircle size={14} />
                </button>
                <button 
                  onClick={onOpenContact}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Contact Support Team"
                >
                  <Mail size={14} />
                </button>
                <button 
                  onClick={onLogout}
                  className="text-rose-400/80 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-950/40 transition-colors"
                  title="Sign Out / Log Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>

            {/* Social media mini row */}
            <div className="px-1 pt-1.5 border-t border-slate-800/50 flex items-center justify-between">
              <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Connect</span>
              <SocialIcons size="sm" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <button 
              onClick={onOpenHelp}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors"
              title="Ask for Help & FAQs (?)"
            >
              <HelpCircle size={16} />
            </button>
            <button 
              onClick={onLogout}
              className="text-rose-400 hover:text-rose-300 p-2 rounded-xl hover:bg-rose-950/40 transition-colors"
              title="Sign Out / Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 ease-in-out z-40 ${
          !isCollapsed ? 'w-64' : 'w-20'
        }`}
      >
        <div className={`h-full transition-all duration-300 ease-in-out ${
          isHovered && isCollapsed 
            ? 'w-64 absolute top-0 left-0 z-50 shadow-2xl shadow-black/80 ring-1 ring-slate-800' 
            : 'w-full'
        }`}>
          {sidebarContent}
        </div>
      </aside>

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
