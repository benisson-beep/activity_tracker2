import React, { useState } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Check, 
  Clock, 
  Calendar, 
  Target, 
  BarChart3, 
  FileSpreadsheet, 
  Sparkles, 
  ShieldCheck, 
  Play, 
  ChevronRight,
  UserCheck,
  Star,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { users, switchUser } = useAuth();
  const [activePersonaId, setActivePersonaId] = useState('user_alex');

  const handleSelectPersonaAndEnter = (userId: string) => {
    switchUser(userId);
    onEnterApp();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Top Marketing Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 h-16 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-950">
            <Zap size={18} className="fill-slate-950" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">
            Chronicle
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
            Personal Activity OS
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#intelligence" className="hover:text-white transition-colors">Intelligence</a>
          <a href="#personas" className="hover:text-white transition-colors">Demo Personas</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSelectPersonaAndEnter('user_alex')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center space-x-1.5"
          >
            <span>Launch App Demo</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-6 shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white">Truth-of-Day Logging</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Not a todo list, but what you actually accomplished</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
          Where did your <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            time truly go today?
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Chronicle is the premium activity tracking SaaS designed to record what you actually did, then transform that reality into visual daytime flows, calendars, deep analytics, and actionable executive summaries.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => handleSelectPersonaAndEnter('user_alex')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <span>Open Interactive App</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => handleSelectPersonaAndEnter('user_new')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 text-white font-semibold text-sm border border-slate-800 transition-all flex items-center justify-center space-x-2"
          >
            <span>Test Onboarding (Blank User)</span>
          </button>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <div className="mt-14 p-2.5 rounded-3xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden text-left max-w-4xl mx-auto">
          <div className="rounded-2xl bg-slate-950 p-4 sm:p-6 border border-slate-800/60 space-y-4">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-slate-500 text-[11px] ml-2">app.chronicle.io/dashboard</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">● 6h 45m Logged Today</span>
            </div>

            {/* Quick Demo Preview row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Engineering Focus</span>
                <p className="text-xl font-extrabold text-white font-mono mt-1">4.2 hrs</p>
                <p className="text-emerald-400 text-[11px] mt-0.5">85% of weekly goal</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Daily Rhythm</span>
                <p className="text-xl font-extrabold text-white font-mono mt-1">5 Sessions</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Peak focus 09:00 - 12:30</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Consistency</span>
                <p className="text-xl font-extrabold text-white font-mono mt-1">12-Day Streak</p>
                <p className="text-indigo-400 text-[11px] mt-0.5">High output velocity</p>
              </div>
            </div>

            {/* Timeline bar preview */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
              <div className="h-4 rounded-lg bg-slate-800 flex overflow-hidden">
                <div style={{ width: '35%' }} className="h-full bg-indigo-500" title="Deep Work" />
                <div style={{ width: '15%' }} className="h-full bg-emerald-500" title="Fitness" />
                <div style={{ width: '25%' }} className="h-full bg-blue-500" title="System Architecture" />
                <div style={{ width: '15%' }} className="h-full bg-pink-500" title="Product Strategy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section id="features" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Designed for truth, not wishful planning
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Traditional task managers focus on what you *hope* to do. Chronicle tells you what you *actually did*.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Instant Capture</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Quick duration chips, natural keyboard shortcuts, or live stopwatch tracking. Record in under 4 seconds without breaking your flow.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Calendar size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Visual Day Flows</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              24-hour horizontal daytime blocks, weekly multi-column schedules, and monthly calendar matrices. Click any slot to record or inspect.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Time Intelligence</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Meaningful analytics that answer real questions: Where did my hours go? When am I most productive? 14-week consistency heatmaps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
              <Target size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Reality-Backed Goals</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Weekly and monthly target commitments calculated automatically from your recorded activities in real time. No manual ticking.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Personas Switcher Section */}
      <section id="personas" className="py-16 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-900">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
              Interactive Test Accounts
            </span>
            <h3 className="text-2xl font-black text-white mt-2">
              Explore Realistic SaaS Data
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select any pre-seeded persona to explore Chronicle fully populated, or launch a fresh account to experience onboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => handleSelectPersonaAndEnter(u.id)}
                className={`p-4 rounded-2xl border text-left transition-all group ${
                  u.id === activePersonaId
                    ? 'bg-slate-800 border-emerald-500 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold pt-1 border-t border-slate-800/60">
                  <span>Enter as {u.name.split(' ')[0]}</span>
                  <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Transparent SaaS Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Start free, upgrade as your activity volume and insights grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Free Starter</h3>
              <p className="text-xs text-slate-400 mt-1">Basic personal time logging</p>
              <p className="text-3xl font-extrabold text-white font-mono mt-4">$0</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Up to 100 activities/mo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>4 custom categories</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>7-day history</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPersonaAndEnter('user_new')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Get Started Free
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-sans">
              Most Popular
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Pro Member</h3>
              <p className="text-xs text-slate-400 mt-1">For deep work and high performers</p>
              <p className="text-3xl font-extrabold text-white font-mono mt-4">$12 <span className="text-xs font-normal text-slate-400">/ mo</span></p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Unlimited activity records</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Unlimited categories & colors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>14-week consistency heatmap</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Markdown & CSV automated reports</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPersonaAndEnter('user_alex')}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              Launch Pro Demo
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Enterprise Pods</h3>
              <p className="text-xs text-slate-400 mt-1">For teams and engineering departments</p>
              <p className="text-3xl font-extrabold text-white font-mono mt-4">$29 <span className="text-xs font-normal text-slate-400">/ seat</span></p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>All Pro capabilities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Team categories & tags sync</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>SAML SSO & Audit logging</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPersonaAndEnter('user_elena')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Explore Pod Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 Chronicle SaaS Inc. All rights reserved. Personal Activity Intelligence System.</p>
      </footer>
    </div>
  );
};
