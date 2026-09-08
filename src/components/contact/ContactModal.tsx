import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Building, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActivity } from '../../context/ActivityContext';
import { triggerConfetti } from '../../lib/confetti';
import { SocialIcons } from '../common/SocialIcons';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({ 
  isOpen, 
  onClose,
  defaultCategory = 'support'
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useActivity();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [category, setCategory] = useState(defaultCategory);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      triggerConfetti();
      showToast('Message transmitted! A member of the Chronicle engineering team will respond shortly.');
    }, 600);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubject('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Mail size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Contact Chronicle Team
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Support, enterprise licensing, feature requests, and feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Thank You! We Received Your Message
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Our engineering and product support team has received your ticket and will reply to <strong className="text-slate-800 dark:text-slate-200 font-mono">{email}</strong> within 2 hours.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
              >
                Back to Chronicle
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Left Col: Info & Direct Channels */}
            <div className="md:col-span-2 p-6 bg-slate-50 dark:bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Direct Inquiries
                </h4>
                <div className="space-y-2.5">
                  <a 
                    href="mailto:support@chronicleapp.io"
                    className="block p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-colors group"
                  >
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      <Mail size={13} className="text-emerald-500" />
                      <span>Product Support</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">support@chronicleapp.io</p>
                  </a>

                  <a 
                    href="mailto:sales@chronicleapp.io"
                    className="block p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-colors group"
                  >
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      <Building size={13} className="text-teal-500" />
                      <span>Enterprise & Pods</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">sales@chronicleapp.io</p>
                  </a>
                </div>
              </div>

              {/* Guarantees */}
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Clock size={13} />
                  <span>Rapid Response</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Average response time is under 2 hours for Pro and Enterprise subscribers.
                </p>
              </div>

              {/* Social Channels */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Community & Social
                </h4>
                <SocialIcons size="md" />
              </div>
            </div>

            {/* Right Col: Interactive Contact Form */}
            <form onSubmit={handleSubmit} className="md:col-span-3 p-6 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Your Name <span className="text-emerald-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-emerald-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="support">General Product Support & Help</option>
                  <option value="feature">Feature Request or Product Idea</option>
                  <option value="bug">Report a Bug / Technical Issue</option>
                  <option value="enterprise">Enterprise Team & Multi-Seat Licensing</option>
                  <option value="billing">Subscription & Billing Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Summary of what you need help with..."
                  className="w-full px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message <span className="text-emerald-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="How can we assist you? Include any details, goals, or workflows..."
                  className="w-full px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="pt-1 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center space-x-1.5 transition-colors"
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Transmit Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
