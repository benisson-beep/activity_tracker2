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
import { ContactModal } from './components/contact/ContactModal';
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
  const { preferences, openCreateActivityModal, showToast } = useActivity();
  const { currentUser, logoutUser } = useAuth();

  const [currentView, setCurrentView] = useState<ViewMode>(preferences.defaultView || 'dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);

  const handleLogout = () => {
    logoutUser();
    setShowLandingPage(true);
    showToast('You have been logged out.');
  };

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
        onLogout={handleLogout}
        onOpenContact={() => setIsContactModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <Header
          currentView={currentView}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenContact={() => setIsContactModalOpen(true)}
        />

        {/* View Switcher Banner (allows easy toggle back to Marketing Landing Page) */}
        <div className="no-print bg-slate-900 text-slate-400 text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate">
              Workspace: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.role})
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="text-slate-400 hover:text-slate-200 hidden sm:inline"
            >
              Contact Support
            </button>
            <button
              onClick={() => setShowLandingPage(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline flex-shrink-0"
            >
              Marketing Landing Page →
            </button>
          </div>
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
          {currentView === 'settings' && (
            <SettingsView 
              onLogout={handleLogout} 
              onOpenContact={() => setIsContactModalOpen(true)} 
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileNav
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* Floating Ask for Help Button */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="no-print fixed bottom-16 lg:bottom-6 right-4 sm:right-6 z-30 px-3 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-xl hover:shadow-2xl hover:border-emerald-500/60 hover:text-emerald-500 transition-all flex items-center space-x-2 group"
        title="Ask for Help, FAQs & Shortcuts (?)"
      >
        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors font-bold text-xs">
          ?
        </div>
        <span className="hidden sm:inline text-xs font-bold">Ask for Help</span>
      </button>

      {/* Global Overlays & Modals */}
      <CommandPalette 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={handleLogout}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
      />
      <ActivityModal />
      <OnboardingModal />
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        onOpenContact={() => setIsContactModalOpen(true)}
      />
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
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
