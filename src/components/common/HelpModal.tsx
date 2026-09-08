import React, { useState } from 'react';
import { 
  X, 
  Keyboard, 
  HelpCircle, 
  Command, 
  Mail, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  BookOpen,
  LifeBuoy
} from 'lucide-react';
import { SocialIcons } from './SocialIcons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onOpenContact }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'shortcuts' | 'contact'>('faq');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How is Chronicle different from a to-do list or stopwatch?',
      a: 'A to-do list tracks what you hope to do; Chronicle logs what you ACTUALLY did. Stopwatches only count time, whereas Chronicle transforms your logged time blocks into daytime flow strips, 14-week consistency heatmaps, reality-backed goal progress, and executive retrospectives.',
    },
    {
      q: 'How does the Deep Focus Timer chime and notification work?',
      a: 'When you start a countdown session (e.g. 25m Pomodoro or 45m Deep Work), Chronicle tracks elapsed seconds. When the timer hits 00:00, it plays a Web Audio harmonic chime and sends a native desktop alert banner, even if your browser is minimized.',
    },
    {
      q: 'Can I pause and resume my timer without losing time?',
      a: 'Yes! Clicking pause preserves your exact elapsed seconds. Clicking play resumes tracking immediately from where you left off. You can also click "Save to History" whenever you want to finalize the session.',
    },
    {
      q: 'How do goals update automatically?',
      a: 'Goals are tied directly to your logged activities. When you record an activity tagged with a category (e.g. "Deep Work"), all goals for that category automatically query and calculate your weekly or monthly progress with zero manual data entry.',
    },
    {
      q: 'How do I export my history for Notion, Obsidian, or Excel?',
      a: 'Head to "Reports" in the sidebar. Click "Copy Markdown" to paste beautifully formatted tables into Notion or Obsidian, or click "Export CSV" to open your records in Microsoft Excel or Google Sheets.',
    },
    {
      q: 'Is my data private and isolated between users?',
      a: 'Yes. Chronicle isolates all activities, categories, and settings per user account in local storage scopes (`chronicle_${userId}_*`). Switching personas or demo accounts never bleeds data across workspaces.',
    },
  ];

  const shortcuts = [
    { key: '⌘K / Ctrl+K', desc: 'Open Command Palette from anywhere' },
    { key: 'N', desc: 'Quickly record a new activity' },
    { key: 'T', desc: 'Jump to Deep Focus Timer' },
    { key: 'P', desc: 'Jump to Plans & Pricing' },
    { key: '1', desc: 'Jump to Executive Dashboard' },
    { key: '2', desc: 'Jump to Activity Stream' },
    { key: '3', desc: 'Jump to Activity Calendar' },
    { key: '4', desc: 'Jump to Analytics & Intelligence' },
    { key: '5', desc: 'Jump to Goals & Milestones' },
    { key: '6', desc: 'Jump to Reports & Debriefs' },
    { key: '7', desc: 'Jump to System Settings & Categories' },
    { key: '?', desc: 'Open this Help & Support Center' },
    { key: 'Esc', desc: 'Close open modal, palette, or drawer' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <LifeBuoy size={17} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Help & Support Center
              </h3>
              <p className="text-[11px] text-slate-400">
                Product answers, keyboard shortcuts, and direct support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={() => setActiveTab('faq')}
            className={`pb-2 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'faq'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle size={13} />
            <span>Ask for Help & FAQs</span>
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`pb-2 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'shortcuts'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Keyboard size={13} />
            <span>Keyboard Shortcuts</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`pb-2 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'contact'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Mail size={13} />
            <span>Contact & Social</span>
          </button>
        </div>

        {/* TAB 1: FAQ / Ask for Help */}
        {activeTab === 'faq' && (
          <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Still have an unanswered question?
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenContact?.();
                }}
                className="mt-2 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors inline-flex items-center space-x-1.5"
              >
                <Mail size={13} />
                <span>Ask Chronicle Support Directly</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SHORTCUTS */}
        {activeTab === 'shortcuts' && (
          <div className="p-5 max-h-[60vh] overflow-y-auto space-y-1.5">
            {shortcuts.map(s => (
              <div
                key={s.key}
                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs"
              >
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {s.desc}
                </span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: CONTACT & SOCIAL */}
        {activeTab === 'contact' && (
          <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Direct Message</h4>
                  <p className="text-[11px] text-slate-400">Send an inquiry to the core team</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenContact?.();
                  }}
                  className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                >
                  Open Contact Form
                </button>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Discord Community</h4>
                  <p className="text-[11px] text-slate-400">Chat with power users & request features</p>
                </div>
                <a
                  href="https://discord.gg/chronicle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors inline-flex items-center space-x-1"
                >
                  <span>Join Server</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Social Media Row */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Follow Us & Repositories
              </h4>
              <SocialIcons size="md" showLabels={true} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Chronicle Intelligence OS</span>
          <div className="flex items-center space-x-2">
            <SocialIcons size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
