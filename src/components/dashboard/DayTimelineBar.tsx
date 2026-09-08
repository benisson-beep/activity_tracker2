import React, { useState } from 'react';
import { Activity, Category } from '../../types';
import { formatDuration, formatTimeDisplay } from '../../lib/dateUtils';

interface DayTimelineBarProps {
  activities: Activity[];
  categories: Category[];
  is24Hour?: boolean;
}

export const DayTimelineBar: React.FC<DayTimelineBarProps> = ({ activities, categories, is24Hour = true }) => {
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null);

  // 24 hour blocks (00:00 to 24:00)
  // Let's create visual hours markers from 06:00 to 22:00 or full 24h
  const hours = [6, 8, 10, 12, 14, 16, 18, 20, 22];

  // Helper to convert time "HH:MM" into percentage of 24h day (0 to 100)
  const timeToPercent = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return ((h * 60 + m) / (24 * 60)) * 100;
  };

  const getCategory = (catId: string) => categories.find(c => c.id === catId);

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Today's Activity Flow
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visual chronological timeline of your daytime blocks
          </p>
        </div>
        {hoveredActivity ? (
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              {hoveredActivity.title}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-mono">
              ({hoveredActivity.startTime} - {hoveredActivity.endTime}, {formatDuration(hoveredActivity.durationMinutes)})
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Hover blocks to inspect</span>
        )}
      </div>

      {/* 24h Bar Track */}
      <div className="relative w-full h-8 bg-slate-100 dark:bg-slate-800/80 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700/60 flex items-center">
        {activities.length === 0 ? (
          <div className="w-full text-center text-xs text-slate-400 font-medium">
            No activities logged yet today. Click "Record Activity" or use the quick bar below.
          </div>
        ) : (
          activities.map(act => {
            const leftPct = timeToPercent(act.startTime);
            const rightPct = timeToPercent(act.endTime);
            // Handle wrap or minimum width
            const widthPct = Math.max(1.5, rightPct >= leftPct ? rightPct - leftPct : 100 - leftPct + rightPct);
            const cat = getCategory(act.categoryId);
            const color = cat?.color || '#6366f1';

            return (
              <div
                key={act.id}
                onMouseEnter={() => setHoveredActivity(act)}
                onMouseLeave={() => setHoveredActivity(null)}
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: color,
                }}
                className="absolute h-full opacity-90 hover:opacity-100 hover:brightness-110 cursor-pointer transition-all border-r border-black/20 flex items-center px-1 overflow-hidden"
              >
                <span className="text-[10px] font-medium text-white truncate drop-shadow-sm select-none">
                  {act.title}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Time axis ticks */}
      <div className="relative w-full h-4 mt-2 flex justify-between text-[10px] font-mono text-slate-400 select-none">
        {hours.map(h => (
          <span key={h}>
            {formatTimeDisplay(`${String(h).padStart(2, '0')}:00`, is24Hour)}
          </span>
        ))}
      </div>
    </div>
  );
};
