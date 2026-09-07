import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActivityProvider, useActivity } from './context/ActivityContext';
import { ViewMode } from './types';

// Layout & Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { ActivityModal } from './components/activity/ActivityModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { HelpModal } from './components/common/HelpModal';
import { ToastContainer } from './components/common/ToastContainer';
import { LandingPage } from './components/landing/LandingPage';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { HistoryView } from './components/history/HistoryView';
import { CalendarView } from './components/calendar/CalendarView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { GoalsView } from './components/goals/GoalsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { TimerView } from './components/timer/TimerView';
import { PricingView } from './components/pricing/PricingView';

const MainAppContent: React.FC = () => {
  const { preferences, openCreateActivityModal } = useActivity();
  const { currentUser } = useAuth();

  const [currentView, setCurrentView] = useState<ViewMode>(preferences.defaultView || 'dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);

  // Global Keyboard Shortcuts (1-7 for tabs, N for new activity)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (target.isContentEditable) return;

      if (e.key === '1') setCurrentView('dashboard');
      else if (e.key === '2') setCurrentView('activities');
      else if (e.key === '3') setCurrentView('calendar');
      else if (e.key === '4') setCurrentView('analytics');
      else if (e.key === '5') setCurrentView('goals');
      else if (e.key === '6') setCurrentView('reports');
      else if (e.key === '7') setCurrentView('settings');
      else if (e.key === 't' || e.key === 'T') setCurrentView('timer');
      else if (e.key === 'p' || e.key === 'P') setCurrentView('pricing');
      else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openCreateActivityModal();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCreateActivityModal]);

  if (showLandingPage) {
    return <LandingPage onEnterApp={() => setShowLandingPage(false)} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      {/* Desktop Sidebar & Mobile Drawer */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <Header
          currentView={currentView}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={setCurrentView}
        />

        {/* View Switcher Banner (allows easy toggle back to Marketing Landing Page) */}
        <div className="no-print bg-slate-900 text-slate-400 text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate">
              Workspace: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.role})
            </span>
          </div>
          <button
            onClick={() => setShowLandingPage(true)}
            className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline flex-shrink-0"
          >
            View Marketing Landing Page →
          </button>
        </div>

        {/* Scrollable View Content Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && <DashboardView onNavigate={setCurrentView} />}
          {currentView === 'activities' && <HistoryView />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'goals' && <GoalsView />}
          {currentView === 'reports' && <ReportsView />}
          {currentView === 'timer' && <TimerView />}
          {currentView === 'pricing' && <PricingView />}
          {currentView === 'settings' && <SettingsView />}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileNav
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* Global Overlays & Modals */}
      <CommandPalette currentView={currentView} onNavigate={setCurrentView} />
      <ActivityModal />
      <OnboardingModal />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ActivityProvider>
          <MainAppContent />
        </ActivityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
