import React from 'react';
import { X, Keyboard, Sparkles, Command } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘K / Ctrl+K', desc: 'Open Command Palette from anywhere' },
    { key: 'N', desc: 'Quickly record a new activity' },
    { key: 'T', desc: 'Jump to Deep Focus Timer' },
    { key: 'P', desc: 'Jump to Plans & Pricing' },
    { key: '1', desc: 'Jump to Dashboard' },
    { key: '2', desc: 'Jump to Activity Stream' },
    { key: '3', desc: 'Jump to Calendar' },
    { key: '4', desc: 'Jump to Analytics & Intelligence' },
    { key: '5', desc: 'Jump to Goals & Milestones' },
    { key: '6', desc: 'Jump to Reports & Debriefs' },
    { key: '7', desc: 'Jump to Settings & Categories' },
    { key: 'Esc', desc: 'Close open modal or drawer' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Keyboard size={18} className="text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Keyboard Shortcuts & Productivity
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-2.5">
          {shortcuts.map(s => (
            <div
              key={s.key}
              className="flex items-center justify-between py-1 text-xs"
            >
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {s.desc}
              </span>
              <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronicle is designed for keyboard speed. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">⌘K</kbd> anytime.
          </p>
        </div>
      </div>
    </div>
  );
};
