import React from 'react';
import { 
  LayoutDashboard, 
  ListFilter, 
  Calendar, 
  BarChart3, 
  Plus, 
  MoreHorizontal 
} from 'lucide-react';
import { ViewMode } from '../../types';
import { useActivity } from '../../context/ActivityContext';

interface MobileNavProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate, onOpenMenu }) => {
  const { openCreateActivityModal } = useActivity();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg safe-area-bottom">
      {/* Dashboard */}
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${
          currentView === 'dashboard'
            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <LayoutDashboard size={19} />
        <span className="text-[10px] mt-0.5">Today</span>
      </button>

      {/* Activities */}
      <button
        onClick={() => onNavigate('activities')}
        className={`flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${
          currentView === 'activities'
            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <ListFilter size={19} />
        <span className="text-[10px] mt-0.5">Stream</span>
      </button>

      {/* Floating Center Plus Button */}
      <div className="relative -top-3">
        <button
          onClick={() => openCreateActivityModal()}
          className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 border-2 border-white dark:border-slate-950 transition-transform"
          aria-label="Quick Log Activity"
        >
          <Plus size={24} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Calendar */}
      <button
        onClick={() => onNavigate('calendar')}
        className={`flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${
          currentView === 'calendar'
            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Calendar size={19} />
        <span className="text-[10px] mt-0.5">Calendar</span>
      </button>

      {/* Analytics / Menu */}
      <button
        onClick={() => onNavigate('analytics')}
        className={`flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${
          currentView === 'analytics'
            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <BarChart3 size={19} />
        <span className="text-[10px] mt-0.5">Analytics</span>
      </button>
    </div>
  );
};
