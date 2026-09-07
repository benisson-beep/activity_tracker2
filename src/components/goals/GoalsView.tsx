import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Trash2, 
  X, 
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useActivity } from '../../context/ActivityContext';
import { Goal, GoalPeriod, GoalTargetType } from '../../types';
import { analyticsEngine } from '../../lib/analyticsEngine';
import { triggerConfetti } from '../../lib/confetti';
import { CategoryIcon, PRESET_COLORS } from '../common/CategoryIcon';

export const GoalsView: React.FC = () => {
  const { activities, categories, goals, addGoal, deleteGoal, preferences } = useActivity();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetType, setTargetType] = useState<GoalTargetType>('hours');
  const [targetValue, setTargetValue] = useState<number>(10);
  const [period, setPeriod] = useState<GoalPeriod>('weekly');
  const [color, setColor] = useState('#10b981');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetValue <= 0) return;

    addGoal({
      title: title.trim(),
      categoryId: categoryId || undefined,
      targetType,
      targetValue: Number(targetValue),
      period,
      color,
    });

    setTitle('');
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: 'completed' | 'ahead' | 'on-track' | 'behind') => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1">
            <CheckCircle2 size={12} />
            <span>Target Reached!</span>
          </span>
        );
      case 'ahead':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800 flex items-center space-x-1">
            <TrendingUp size={12} />
            <span>Ahead of Pace</span>
          </span>
        );
      case 'on-track':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            On Track
          </span>
        );
      case 'behind':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>Behind Pace</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Goals & Habit Milestones
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Targets calculated automatically from your recorded activities in real time
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>New Goal Target</span>
        </button>
      </div>

      {/* Goals Cards Grid */}
      {goals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Target size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Set your first activity milestone
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Choose a weekly or monthly target (e.g. "Deep Work 15h/week" or "Workout 4x/week"). Chronicle tracks your progress automatically.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const prog = analyticsEngine.getGoalProgress(goal, activities, new Date(), preferences.startWeekOnMonday);
            const cat = categories.find(c => c.id === goal.categoryId);

            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-3 truncate">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-xs"
                        style={{ backgroundColor: goal.color }}
                      >
                        <Target size={18} />
                      </div>
                      <div className="truncate">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {goal.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {cat ? cat.name : 'All Categories'} • {goal.period.toUpperCase()} TARGET
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Stat Progress Numbers */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div className="flex items-baseline space-x-1.5 font-mono">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        {prog.currentValue}
                      </span>
                      <span className="text-slate-400 text-xs">
                        / {prog.targetValue} {prog.unit}
                      </span>
                    </div>

                    {getStatusBadge(prog.status)}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{
                        width: `${prog.percentage}%`,
                        backgroundColor: goal.color,
                      }}
                      className="h-full rounded-full transition-all duration-700"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {prog.percentage}% complete
                  </span>
                  <span>
                    {prog.remaining > 0 ? `${prog.remaining} ${prog.unit} remaining` : 'Target achieved! 🎉'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Activity Goal
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Engineering Focus, Strength Training..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Category
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">All Categories (Total Time)</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Goal Metric
                  </label>
                  <select
                    value={targetType}
                    onChange={e => setTargetType(e.target.value as GoalTargetType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="hours">Hours</option>
                    <option value="count">Number of Sessions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Value ({targetType === 'hours' ? 'hrs' : 'times'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step={targetType === 'hours' ? '0.5' : '1'}
                    value={targetValue}
                    onChange={e => setTargetValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Time Period
                </label>
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  {(['daily', 'weekly', 'monthly'] as GoalPeriod[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={`flex-1 py-1.5 text-xs font-semibold capitalize rounded-lg transition-colors ${
                        period === p
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Create Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
