import React from 'react';
import { 
  LayoutDashboard, 
  ListFilter, 
  Timer, 
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
  const { openCreateActivityModal, timerState } = useActivity();

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

      {/* Focus Timer */}
      <button
        onClick={() => onNavigate('timer')}
        className={`relative flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${
          currentView === 'timer'
            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <div className="relative">
          <Timer size={19} />
          {(timerState.isRunning || timerState.elapsedSeconds > 0) && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
        </div>
        <span className="text-[10px] mt-0.5">Focus</span>
      </button>

      {/* More / Menu Drawer */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <MoreHorizontal size={19} />
        <span className="text-[10px] mt-0.5">Menu</span>
      </button>
    </div>
  );
};
