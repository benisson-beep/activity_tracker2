import React, { useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  Clock, 
  Calendar, 
  Target, 
  BarChart3, 
  FileSpreadsheet, 
  ShieldCheck, 
  Play, 
  ChevronRight,
  UserCheck,
  Star,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  CheckCircle2,
  Building,
  Timer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { triggerConfetti } from '../../lib/confetti';
import { SocialIcons } from '../common/SocialIcons';
import { AuthModal } from '../auth/AuthModal';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { users, switchUser } = useAuth();
  const [activePersonaId, setActivePersonaId] = useState('user_alex');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const openAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState('general');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSubmitted(true);
      triggerConfetti();
    }, 600);
  };

  const handleSelectPersonaAndEnter = (userId: string) => {
    switchUser(userId);
    onEnterApp();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Top Marketing Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 h-16 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Clock size={16} className="stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">
            Chronicle
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
            Activity Tracker
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#personas" className="hover:text-white transition-colors">Demo Accounts</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </nav>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => openAuth('signin')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuth('signup')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center space-x-1.5"
          >
            <span>Start Tracking Free</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="font-medium text-slate-200">Personal Activity Tracker</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Record what you actually spent time on</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          A clear, honest record of <br className="hidden sm:inline" />
          how you spend your time.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
          Not another wishful to-do list or micromanaged stopwatch. Chronicle helps you record what actually happened during your day, uncovering real focus hours, category patterns, and steady progress.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => openAuth('signup')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <span>Start Tracking Free</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => handleSelectPersonaAndEnter('user_alex')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 transition-all flex items-center justify-center space-x-2"
          >
            <Play size={14} className="text-emerald-400" />
            <span>Try Interactive Demo</span>
          </button>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <div className="mt-14 p-2.5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden text-left max-w-4xl mx-auto">
          <div className="rounded-2xl bg-slate-950 p-4 sm:p-6 border border-slate-800/60 space-y-4">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="font-mono text-slate-500 text-[11px] ml-2">app.chronicle.io/dashboard</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400">● 6h 45m Logged Today</span>
            </div>

            {/* Quick Demo Preview row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[11px] font-semibold">Engineering Focus</span>
                <p className="text-xl font-bold text-white tabular-nums mt-1">4.2 hrs</p>
                <p className="text-emerald-400 text-[11px] mt-0.5">85% of weekly target</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[11px] font-semibold">Daily Schedule</span>
                <p className="text-xl font-bold text-white tabular-nums mt-1">5 Sessions</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Peak focus 09:00 - 12:30</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[11px] font-semibold">Consistency</span>
                <p className="text-xl font-bold text-white tabular-nums mt-1">12-Day Streak</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Steady daily pace</p>
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
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for reality, not wishful thinking
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Traditional to-do lists capture what you plan to do. Chronicle keeps a clean record of what you actually spent time on.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Fast Logging</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Quick duration presets, keyboard shortcuts, or a live focus timer. Log an activity in seconds without interrupting your flow.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Calendar size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Day Timelines & Calendars</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              24-hour horizontal daytime blocks, weekly schedules, and month calendar matrices. Click any hour to inspect or log.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Clear Analytics</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Understand where your time went: peak focus hours, category breakdowns, and a 14-week consistency heatmap.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
              <Target size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Automatic Goals</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Weekly and monthly target commitments calculated directly from your logged activities. No manual spreadsheet ticking.
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
              Try with realistic example accounts
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Explore Chronicle with full example history (Architect or Neuroscientist), or jump into a clean account.
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
            Simple, transparent pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Start free for personal use, or upgrade for unlimited history and team features.
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
              onClick={() => openAuth('signup')}
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

      {/* Frequently Asked Questions (FAQ) Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-900">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold mb-3">
            <HelpCircle size={13} />
            <span>Answers & Details</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Clear, honest answers about how Chronicle works, data sovereignty, and time intelligence.
          </p>
        </div>

        <div className="space-y-3.5">
          {[
            {
              q: 'How is Chronicle different from typical to-do lists or time-tracking widgets?',
              a: 'A to-do list captures aspirational intentions—what you plan or wish to do. Chronicle records truth-of-day reality: what you actually accomplished, when, and for how long. Rather than functioning as a micromanaging stopwatch, Chronicle translates your raw daily activities into visual 24h daytime flows, 14-week consistency heatmaps, and automatic progress reports.',
            },
            {
              q: 'Does the Deep Focus Timer notify me if my browser tab is minimized?',
              a: 'Yes, 100%! Chronicle synthesizes a harmonic 3-tone chime (C5 → E5 → G5) using native Web Audio oscillators and triggers native operating system desktop push notification banners. You will be alerted the second your countdown concludes, even while working in other applications.',
            },
            {
              q: 'Can I export my activity records to Notion, Obsidian, CSV, or raw JSON?',
              a: 'Yes, anytime. Chronicle strictly believes in data sovereignty. You can generate one-click copyable Markdown tables specifically styled for Notion & Obsidian, download structured CSV files for Excel & Google Sheets, or export your complete encrypted JSON backup.',
            },
            {
              q: 'How does automatic goal calculation work without manual spreadsheets?',
              a: 'When you create a goal (e.g. "Log 15 hours of Deep Work every week"), Chronicle automatically queries your recorded activities in that timeframe. Every time you log an activity in that category, your goal progress bar, velocity, and streak update in real time.',
            },
            {
              q: 'Is my activity and time data private and isolated?',
              a: 'Your records are strictly scoped to your private account ID. Chronicle does not sell your productivity data, run invasive background keyloggers, or share your activities with third-party advertisers.',
            },
            {
              q: 'Can I test Chronicle right now without entering a credit card?',
              a: 'Absolutely. The Free Starter tier is free forever. In addition, you can test drive realistic pre-loaded demo personas (Senior Architect Alex Chen or Cognitive Neuroscientist Dr. Elena Rostova) with one click from this page.',
            },
            {
              q: 'Can I customize categories, icons, and default session lengths?',
              a: 'Yes! Chronicle allows you to create custom categories with custom hex colors, 24+ recognizable icons, and default durations (e.g. 25m, 45m, 60m) so logging feels completely tailored to your personal routine.',
            },
          ].map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all hover:border-slate-700/80"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-bold text-white focus:outline-none"
                >
                  <span className="pr-4">{item.q}</span>
                  <span className={`p-1 rounded-lg bg-slate-800 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`}>
                    <ChevronDown size={16} />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Us Area */}
      <section id="contact" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-900">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold mb-3">
            <Mail size={13} />
            <span>Direct Inquiries</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Contact Chronicle Team
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Have questions about personal tracking, team pilots, or custom workflows? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10">
          {/* Left Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                We'd love to hear from you
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Whether you need dedicated onboarding, want to suggest an analytics visualization, or need enterprise invoicing, reach out directly.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="mailto:support@chronicleapp.io"
                className="block p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors group"
              >
                <div className="flex items-center space-x-2.5 text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  <Mail size={16} className="text-emerald-500" />
                  <span>Product & Engineering Support</span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">support@chronicleapp.io</p>
              </a>

              <a
                href="mailto:sales@chronicleapp.io"
                className="block p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition-colors group"
              >
                <div className="flex items-center space-x-2.5 text-xs font-bold text-white group-hover:text-teal-400 transition-colors">
                  <Building size={16} className="text-teal-500" />
                  <span>Enterprise & Pod Licenses</span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">sales@chronicleapp.io</p>
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <Clock size={14} />
                <span>Response Time SLA</span>
              </div>
              <p className="text-xs text-slate-400">
                All inquiries answered by our core engineering team in under 2 hours during active hours.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Join Community & Connect
              </h4>
              <SocialIcons size="md" showLabels={true} />
            </div>
          </div>

          {/* Right Interactive Form Column */}
          <div className="lg:col-span-3">
            {contactSubmitted ? (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 size={30} />
                </div>
                <h4 className="text-xl font-bold text-white">Message Transmitted!</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Thanks for reaching out! A Chronicle engineer has received your message and will respond to <strong className="text-emerald-400 font-mono">{contactEmail}</strong> promptly.
                </p>
                <button
                  onClick={() => {
                    setContactSubmitted(false);
                    setContactMessage('');
                  }}
                  className="mt-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Name <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Chen"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Email <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    value={contactCategory}
                    onChange={e => setContactCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="general">General Question & Feedback</option>
                    <option value="feature">Feature Request or Enhancement</option>
                    <option value="enterprise">Enterprise Team & Pod Deployment</option>
                    <option value="bug">Report a Bug / Technical Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Message <span className="text-emerald-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you are looking to accomplish or how we can assist..."
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmittingContact ? (
                    <span>Sending message...</span>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Rich Footer with Social Media */}
      <footer className="py-12 px-4 sm:px-8 border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
                <Clock size={16} className="text-slate-950" />
              </div>
              <span className="font-extrabold text-base text-white">Chronicle</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              A clear, honest record of your daily activities. Log what you did, understand where your hours go, and build lasting routines.
            </p>
            <div className="pt-2">
              <SocialIcons size="md" />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Visual Daytime Flow</a></li>
              <li><a href="#intelligence" className="hover:text-emerald-400 transition-colors">14-Week Heatmaps</a></li>
              <li><a href="#pricing" className="hover:text-emerald-400 transition-colors">Pro & Team Plans</a></li>
              <li><button onClick={() => handleSelectPersonaAndEnter('user_alex')} className="hover:text-emerald-400 transition-colors text-left">Live App Demo</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Support & Legal</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#faq" className="hover:text-emerald-400 transition-colors">Frequently Asked Questions</a></li>
              <li><a href="#contact" className="hover:text-emerald-400 transition-colors">Contact Support</a></li>
              <li><a href="https://instagram.com/chronicleapp" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">Instagram (@chronicleapp)</a></li>
              <li><span className="text-slate-500">Data Sovereignty & Privacy</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Chronicle. Built for honest, intentional time tracking.</p>
          <p className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>All Systems Operational</span>
          </p>
        </div>
      </footer>

      {/* Sign In & Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={onEnterApp}
      />
    </div>
  );
};
