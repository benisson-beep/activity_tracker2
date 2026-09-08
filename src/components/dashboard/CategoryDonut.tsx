import React from 'react';
import { CategoryBreakdown } from '../../lib/analyticsEngine';
import { formatDuration } from '../../lib/dateUtils';

interface CategoryDonutProps {
  categories: CategoryBreakdown[];
  totalMinutes: number;
}

export const CategoryDonut: React.FC<CategoryDonutProps> = ({ categories, totalMinutes }) => {
  return (
    <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Category Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Time distribution across your key focuses
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
          Total: {formatDuration(totalMinutes)}
        </span>
      </div>

      {/* Stacked Proportional Bar */}
      {categories.length > 0 && (
        <div className="w-full h-2.5 rounded-sm overflow-hidden flex bg-slate-100 dark:bg-slate-800 mb-4">
          {categories.map(c => (
            <div
              key={c.id}
              style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
              className="h-full transition-all hover:opacity-80"
              title={`${c.name}: ${c.percentage}% (${formatDuration(c.minutes)})`}
            />
          ))}
        </div>
      )}

      {/* Category List */}
      <div className="space-y-2.5 overflow-y-auto max-h-48 pr-1">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium">
            No category time recorded for this timeframe yet.
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({cat.count} acts)
                </span>
              </div>
              <div className="flex items-center space-x-2 font-mono flex-shrink-0">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatDuration(cat.minutes)}
                </span>
                <span className="text-slate-400 w-8 text-right font-medium">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
