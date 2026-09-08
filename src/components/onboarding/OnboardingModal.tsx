import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  Target, 
  Layers, 
  Clock, 
  X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActivity } from '../../context/ActivityContext';
import { triggerConfetti } from '../../lib/confetti';

export const OnboardingModal: React.FC = () => {
  const { currentUser, completeOnboarding } = useAuth();
  const { addGoal, addCategory, categories } = useActivity();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['Engineering & Deep Work', 'Health & Movement']);
  const [goalHours, setGoalHours] = useState(15);

  // If user is already onboarded, don't show
  if (currentUser.onboarded) return null;

  const focusOptions = [
    { title: 'Engineering & Deep Work', desc: 'Coding, system design, architectural RFCs', icon: '⚡' },
    { title: 'Health & Movement', desc: 'Gym sessions, running, cardio, yoga', icon: '🏃' },
    { title: 'Reading & Learning', desc: 'Books, technical papers, languages', icon: '📚' },
    { title: 'Writing & Research', desc: 'Manuscripts, essays, notes, documentation', icon: '✍️' },
    { title: 'Product & Business', desc: 'Strategy, customer interviews, roadmap', icon: '🧭' },
    { title: 'Life Admin & Balance', desc: 'Operations, correspondence, planning', icon: '☕' },
  ];

  const handleToggleFocus = (f: string) => {
    setSelectedFocus(prev => 
      prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]
    );
  };

  const handleFinish = () => {
    // Automatically create first goal
    addGoal({
      title: 'Weekly Focus Milestone',
      categoryId: categories[0]?.id || undefined,
      targetType: 'hours',
      targetValue: goalHours,
      period: 'weekly',
      color: '#10b981',
    });

    triggerConfetti();
    completeOnboarding();
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Step Indicator Top Bar */}
        <div className="px-6 pt-5 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-7 bg-emerald-500'
                    : step > s
                    ? 'w-3.5 bg-emerald-700/60'
                    : 'w-3.5 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Skip Setup
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* STEP 1: What do you track? */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 1 of 3
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  What do you spend your days doing?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select the key areas of your life you want to track truth-of-day time for.
                </p>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {focusOptions.map(opt => {
                  const isSelected = selectedFocus.includes(opt.title);
                  return (
                    <button
                      key={opt.title}
                      type="button"
                      onClick={() => handleToggleFocus(opt.title)}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <span className="text-base">{opt.icon}</span>
                        <div className="truncate">
                          <p className="text-xs font-semibold truncate">{opt.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{opt.desc}</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check size={10} className="stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors mt-3"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* STEP 2: Categories Overview */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 2 of 3
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Your Activity Categories
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Chronicle has initialized starter categories based on your preferences. You can customize them anytime in Settings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {categories.map(c => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center space-x-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{c.name}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Set Your First Goal</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Initial Goal */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 3 of 3
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Commit to a weekly focus target
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  How many hours of intentional activity do you want to achieve each week?
                </p>
              </div>

              <div className="p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <span className="text-4xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {goalHours}
                </span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Hours per week
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  ~{(goalHours / 5).toFixed(1)} hours of deep focused output per working day.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-1.5">
                {[10, 15, 20, 25, 30].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setGoalHours(h)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      goalHours === h
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-3.5 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
