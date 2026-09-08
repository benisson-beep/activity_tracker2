import React, { useState } from 'react';
import { 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActivity } from '../../context/ActivityContext';
import { PlanTier } from '../../types';
import { triggerConfetti } from '../../lib/confetti';

export const PricingView: React.FC = () => {
  const { currentUser, updateUserPlan } = useAuth();
  const { showToast } = useActivity();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSelectPlan = (plan: PlanTier) => {
    if (currentUser.plan === plan) {
      showToast(`You are already on the ${plan.toUpperCase()} plan.`);
      return;
    }

    updateUserPlan(plan);
    triggerConfetti();
    showToast(`Successfully switched to the ${plan.toUpperCase()} plan!`);
  };

  const faqs = [
    {
      q: 'Can I export my personal activity records at any time?',
      a: 'Yes, 100%. Chronicle guarantees full data sovereignty. You can export your entire activity history, categories, and goals as formatted Markdown, standard CSV, or complete JSON archive directly from Reports or Settings.',
    },
    {
      q: 'How does data isolation work?',
      a: 'Each user operates in a strictly scoped, sandboxed workspace. Your activities, notes, and goals are strictly tied to your account ID and can never be seen or accessed by any other user.',
    },
    {
      q: 'What happens if I downgrade from Pro to Free?',
      a: 'Your previously recorded activities remain completely safe and intact. On the Free plan, new entries are capped at 100 per month, and history view focuses on the most recent 7 days.',
    },
    {
      q: 'Do focus timer notifications work when the tab is in the background?',
      a: 'Yes. Chronicle uses the HTML5 Notification API and Web Audio API to chime and push a native desktop notification even if you are working in another tab or application.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
        <span className="text-[11px] font-mono font-medium tracking-wide px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          Plans & Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Clear plans designed for personal productivity and teams. Upgrade or cancel anytime.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-2 flex items-center justify-center space-x-3">
          <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
            className="w-10 h-5 rounded-full bg-slate-300 dark:bg-slate-700 p-0.5 transition-colors relative"
          >
            <span
              className={`block w-4 h-4 rounded-full bg-emerald-500 transition-transform ${
                billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center space-x-1.5">
            <span className={`text-xs font-medium ${billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              Annual Billing
            </span>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tier 1: Free Starter */}
        <div className={`p-6 rounded-xl bg-white dark:bg-slate-900 border flex flex-col justify-between ${
          currentUser.plan === 'free'
            ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10'
            : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Free Starter</h3>
              {currentUser.plan === 'free' && (
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">For casual personal activity tracking</p>

            <div className="mt-5 flex items-baseline font-mono">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">$0</span>
              <span className="text-xs text-slate-400 ml-1">/ forever</span>
            </div>

            <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Up to 100 activities / month</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>4 customizable categories</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>7-day activity history & stream</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Day & Week calendar views</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan('free')}
            disabled={currentUser.plan === 'free'}
            className={`mt-6 w-full py-2 rounded-md text-xs font-medium transition-colors ${
              currentUser.plan === 'free'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default border border-slate-200 dark:border-slate-700'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            {currentUser.plan === 'free' ? 'Your Current Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* Tier 2: Pro Member (Highlighted) */}
        <div className={`p-6 rounded-xl bg-white dark:bg-slate-900 border-2 border-emerald-500 flex flex-col justify-between relative`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-semibold text-[10px] uppercase tracking-wider">
            Most Popular
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pro Member</h3>
              {currentUser.plan === 'pro' && (
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">For daily practitioners and professionals</p>

            <div className="mt-5 flex items-baseline font-mono">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {billingCycle === 'annual' ? '$10' : '$12'}
              </span>
              <span className="text-xs text-slate-400 ml-1">/ month {billingCycle === 'annual' ? '(billed yearly)' : ''}</span>
            </div>

            <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">Unlimited activity records</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Unlimited custom categories & colors</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>14-week consistency punchcard heatmaps</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Focus timer chimes & desktop notifications</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Automated Markdown, Print & CSV reports</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Goal progress tracking</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan('pro')}
            disabled={currentUser.plan === 'pro'}
            className={`mt-6 w-full py-2 rounded-md text-xs font-medium transition-colors ${
              currentUser.plan === 'pro'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {currentUser.plan === 'pro' ? 'Current Active Plan' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Tier 3: Team */}
        <div className={`p-6 rounded-xl bg-white dark:bg-slate-900 border flex flex-col justify-between ${
          currentUser.plan === 'team'
            ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10'
            : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Team</h3>
              {currentUser.plan === 'team' && (
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">For teams, studios, and small companies</p>

            <div className="mt-5 flex items-baseline font-mono">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {billingCycle === 'annual' ? '$24' : '$29'}
              </span>
              <span className="text-xs text-slate-400 ml-1">/ seat / month</span>
            </div>

            <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">Everything in Pro</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Shared team workspace categories</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>SAML SSO & Enterprise security</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Direct API access & webhook sync</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Dedicated support & SLA</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan('team')}
            disabled={currentUser.plan === 'team'}
            className={`mt-6 w-full py-2 rounded-md text-xs font-medium transition-colors ${
              currentUser.plan === 'team'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            {currentUser.plan === 'team' ? 'Current Active Plan' : 'Select Team Plan'}
          </button>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Detailed Feature Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-2">Capability</th>
                <th className="py-2.5 px-2 text-center">Free</th>
                <th className="py-2.5 px-2 text-center text-emerald-500 font-bold">Pro</th>
                <th className="py-2.5 px-2 text-center">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr>
                <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-slate-200">Monthly Logged Activities</td>
                <td className="py-2.5 px-2 text-center text-slate-500">100</td>
                <td className="py-2.5 px-2 text-center font-bold text-emerald-600 dark:text-emerald-400">Unlimited</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-800 dark:text-slate-200">Unlimited</td>
              </tr>
              <tr>
                <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-slate-200">Custom Activity Categories</td>
                <td className="py-2.5 px-2 text-center text-slate-500">4</td>
                <td className="py-2.5 px-2 text-center font-bold text-emerald-600 dark:text-emerald-400">Unlimited</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-800 dark:text-slate-200">Unlimited</td>
              </tr>
              <tr>
                <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-slate-200">History Retention</td>
                <td className="py-2.5 px-2 text-center text-slate-500">7 days</td>
                <td className="py-2.5 px-2 text-center font-bold text-emerald-600 dark:text-emerald-400">Lifetime</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-800 dark:text-slate-200">Lifetime</td>
              </tr>
              <tr>
                <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-slate-200">Consistency Punchcard Heatmap</td>
                <td className="py-2.5 px-2 text-center text-slate-400">—</td>
                <td className="py-2.5 px-2 text-center text-emerald-500 font-bold">✓ (14 Weeks)</td>
                <td className="py-2.5 px-2 text-center text-emerald-500 font-bold">✓ (Full Year)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-slate-200">Timer Chimes & Push Notifications</td>
                <td className="py-2.5 px-2 text-center text-slate-400">—</td>
                <td className="py-2.5 px-2 text-center text-emerald-500 font-bold">✓</td>
                <td className="py-2.5 px-2 text-center text-emerald-500 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-slate-200">Markdown, Print & CSV Exports</td>
                <td className="py-2.5 px-2 text-center text-slate-500">CSV Only</td>
                <td className="py-2.5 px-2 text-center text-emerald-500 font-bold">✓ (All Formats)</td>
                <td className="py-2.5 px-2 text-center text-emerald-500 font-bold">✓ (All Formats)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-slate-200">SAML SSO & Security Compliance</td>
                <td className="py-2.5 px-2 text-center text-slate-400">—</td>
                <td className="py-2.5 px-2 text-center text-slate-400">—</td>
                <td className="py-2.5 px-2 text-center text-emerald-500 font-bold">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
