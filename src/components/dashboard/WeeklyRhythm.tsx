import React from 'react';
import { DayActivityTotal } from '../../lib/analyticsEngine';
import { formatDuration } from '../../lib/dateUtils';

interface WeeklyRhythmProps {
  days: DayActivityTotal[];
}

export const WeeklyRhythm: React.FC<WeeklyRhythmProps> = ({ days }) => {
  // Find max hours for scaling
  const maxHours = Math.max(8, ...days.map(d => d.hours));

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Weekly Rhythm
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total hours logged across the week
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Today</span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
        {days.map(d => {
          const heightPct = maxHours > 0 ? Math.max(6, (d.hours / maxHours) * 100) : 6;
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-2 py-1 rounded bg-slate-900 dark:bg-slate-800 text-[10px] text-white font-mono pointer-events-none shadow-lg whitespace-nowrap z-10">
                {formatDuration(d.minutes)} ({d.count} acts)
              </div>

              {/* Bar */}
              <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800/80 rounded-t-xl overflow-hidden relative flex items-end justify-center h-32">
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-xl transition-all duration-500 ${
                    d.isToday
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20'
                      : d.hours > 0
                      ? 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                      : 'bg-transparent'
                  }`}
                />
              </div>

              {/* Day Label */}
              <span className={`text-[11px] mt-2 font-medium ${
                d.isToday ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
              }`}>
                {d.dayName}
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {d.hours > 0 ? `${d.hours}h` : '-'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
