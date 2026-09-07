import React, { useState } from 'react';
import { Plus, SlidersHorizontal, Check, Zap } from 'lucide-react';
import { useActivity } from '../../context/ActivityContext';
import { getCurrentTimeString, addMinutesToTime, getTodayString } from '../../lib/dateUtils';

export const QuickAddBar: React.FC = () => {
  const { categories, addActivity, openCreateActivityModal } = useActivity();

  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [selectedDuration, setSelectedDuration] = useState(60);

  // Sync category if categories list changes
  React.useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = getCurrentTimeString();
    const end = addMinutesToTime(now, selectedDuration);

    addActivity({
      title: title.trim(),
      categoryId: selectedCategoryId || categories[0]?.id || '',
      date: getTodayString(),
      startTime: now,
      endTime: end,
      durationMinutes: selectedDuration,
      status: 'completed',
      tags: ['quick-log'],
      energyLevel: 'high',
    });

    setTitle('');
  };

  const handleOpenDetailed = () => {
    openCreateActivityModal({
      title: title.trim() || undefined,
      categoryId: selectedCategoryId || undefined,
      durationMinutes: selectedDuration,
    });
  };

  return (
    <form 
      onSubmit={handleQuickSubmit}
      className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="What did you just finish? (e.g. Shipped authentication PR, Gym workout...)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full pl-3.5 pr-20 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            type="button"
            onClick={handleOpenDetailed}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center space-x-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            title="Expand to detailed form"
          >
            <SlidersHorizontal size={12} />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>

        {/* Category & Duration selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategoryId}
            onChange={e => setSelectedCategoryId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 max-w-[150px] truncate"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Quick Duration Pills */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {[15, 30, 45, 60, 90, 120].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => setSelectedDuration(mins)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedDuration === mins
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {mins < 60 ? `${mins}m` : `${mins / 60}h`}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5 flex-shrink-0"
          >
            <Check size={14} className="stroke-[2.5]" />
            <span>Log</span>
          </button>
        </div>
      </div>
    </form>
  );
};
