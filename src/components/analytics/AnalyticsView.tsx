import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Clock, 
  Calendar as CalendarIcon, 
  Activity as ActivityIcon, 
  TrendingUp, 
  Focus,
  PieChart,
  Grid
} from 'lucide-react';
import { useActivity } from '../../context/ActivityContext';
import { analyticsEngine } from '../../lib/analyticsEngine';
import { 
  formatDuration, 
  formatDateDisplay, 
  getTodayString, 
  isDateInThisWeek, 
  isDateInThisMonth, 
  parseDateString 
} from '../../lib/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';

type Timeframe = 'all' | '7days' | '30days' | 'month';

export const AnalyticsView: React.FC = () => {
  const { activities, categories, goals, preferences } = useActivity();
  const [timeframe, setTimeframe] = useState<Timeframe>('30days');

  // Filter activities based on timeframe
  const filteredActivities = useMemo(() => {
    const now = new Date();
    if (timeframe === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
      return activities.filter(a => a.date >= sevenDaysAgo);
    }
    if (timeframe === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];
      return activities.filter(a => a.date >= thirtyDaysAgo);
    }
    if (timeframe === 'month') {
      return activities.filter(a => isDateInThisMonth(a.date));
    }
    return activities;
  }, [activities, timeframe]);

  // Calculations
  const totalMinutes = useMemo(() => {
    return filteredActivities.reduce((acc, a) => acc + a.durationMinutes, 0);
  }, [filteredActivities]);

  const totalHours = Number((totalMinutes / 60).toFixed(1));
  const activityCount = filteredActivities.length;
  const avgDurationMinutes = activityCount > 0 ? Math.round(totalMinutes / activityCount) : 0;

  const categoryBreakdown = useMemo(() => {
    return analyticsEngine.getCategoryBreakdown(filteredActivities, categories);
  }, [filteredActivities, categories]);

  const consistencyHeatmap = useMemo(() => {
    return analyticsEngine.getConsistencyHeatmap(activities, 14);
  }, [activities]);

  const timeOfDayDistribution = useMemo(() => {
    return analyticsEngine.getTimeOfDayDistribution(filteredActivities);
  }, [filteredActivities]);

  const durationDistribution = useMemo(() => {
    return analyticsEngine.getDurationDistribution(filteredActivities);
  }, [filteredActivities]);

  const dayOfWeekStats = useMemo(() => {
    const dayMap = [
      { day: 'Sun', mins: 0, count: 0 },
      { day: 'Mon', mins: 0, count: 0 },
      { day: 'Tue', mins: 0, count: 0 },
      { day: 'Wed', mins: 0, count: 0 },
      { day: 'Thu', mins: 0, count: 0 },
      { day: 'Fri', mins: 0, count: 0 },
      { day: 'Sat', mins: 0, count: 0 },
    ];
    for (const a of filteredActivities) {
      const d = parseDateString(a.date);
      const dayIdx = d.getDay();
      dayMap[dayIdx].mins += a.durationMinutes;
      dayMap[dayIdx].count += 1;
    }
    const maxMins = Math.max(1, ...dayMap.map(d => d.mins));
    return dayMap.map(d => ({
      ...d,
      hours: Number((d.mins / 60).toFixed(1)),
      pct: Math.round((d.mins / maxMins) * 100),
    }));
  }, [filteredActivities]);

  // Level colors for heatmap
  const getHeatmapColor = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 1: return 'bg-emerald-200 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800';
      case 2: return 'bg-emerald-300 dark:bg-emerald-800/80 border-emerald-400 dark:border-emerald-700';
      case 3: return 'bg-emerald-400 dark:bg-emerald-600/80 border-emerald-500 dark:border-emerald-500';
      case 4: return 'bg-emerald-500 dark:bg-emerald-500 border-emerald-600 dark:border-emerald-400 shadow-sm';
      default: return 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            A clear breakdown of how your time is distributed across categories and days
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          {(['7days', '30days', 'month', 'all'] as Timeframe[]).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                timeframe === tf
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tf === '7days' ? 'Last 7 Days' : tf === '30days' ? 'Last 30 Days' : tf === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Logged Hours</span>
            <Clock size={16} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatDuration(totalMinutes)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {totalHours} net hours recorded
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Sessions</span>
            <ActivityIcon size={16} className="text-indigo-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {activityCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Discrete focus blocks
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Average Session</span>
            <Focus size={16} className="text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatDuration(avgDurationMinutes)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Per recorded activity
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Active Categories</span>
            <PieChart size={16} className="text-pink-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {categoryBreakdown.length}
          </p>
          <p className="mt-1 text-xs text-slate-400 truncate">
            Top: {categoryBreakdown[0]?.name || 'None'}
          </p>
        </div>
      </div>

      {/* Consistency Heatmap (GitHub-Style Activity Punchcard) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Activity Consistency (Past 14 Weeks)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visual proof of habit formation and day-by-day persistence
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(lvl => (
              <span
                key={lvl}
                className={`w-3 h-3 rounded-xs border ${getHeatmapColor(lvl as any)}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-[640px]">
            {consistencyHeatmap.map((week, wIdx) => (
              <div key={`w_${wIdx}`} className="flex flex-col gap-1.5">
                {week.map(cell => (
                  <div
                    key={cell.date}
                    className={`w-3.5 h-3.5 rounded-xs border cursor-pointer transition-transform hover:scale-125 group relative ${getHeatmapColor(cell.level)}`}
                  >
                    {/* Hover Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-slate-950 text-[10px] text-white font-mono pointer-events-none whitespace-nowrap shadow-xl z-20">
                      {formatDateDisplay(cell.date, 'short')}: {formatDuration(cell.minutes)} ({cell.count} acts)
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Deep Dive Breakdown */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Where Did My Time Go?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Detailed proportional allocation across all configured categories
        </p>

        <div className="space-y-3">
          {categoryBreakdown.map(cat => (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({cat.count} activities)
                  </span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatDuration(cat.minutes)}
                  </span>
                  <span className="text-slate-400 w-10 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  className="h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side: Time of Day & Duration Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Time of Day Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Time of Day Rhythm
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            When during the day do you do your work?
          </p>

          <div className="space-y-3.5">
            {timeOfDayDistribution.map(tod => (
              <div key={tod.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {tod.name}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatDuration(tod.minutes)} ({tod.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${tod.percentage}%`, backgroundColor: tod.color }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Depth (Duration Distribution) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Focus Session Depth
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Quick sprints vs sustained deep work blocks
          </p>

          <div className="space-y-3.5">
            {durationDistribution.map(dur => {
              const pct = activityCount > 0 ? Math.round((dur.count / activityCount) * 100) : 0;
              return (
                <div key={dur.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {dur.label}
                      </span>
                      <span className="text-slate-400 ml-1.5">({dur.desc})</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {dur.count} sessions ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${pct}%`, backgroundColor: dur.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day of the Week Volume */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Day of Week Productivity
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Which days of the week have the highest logged volume
        </p>

        <div className="grid grid-cols-7 gap-2 text-center">
          {dayOfWeekStats.map(d => (
            <div key={d.day} className="flex flex-col items-center group">
              <span className="text-[10px] font-mono text-slate-400 mb-1">
                {d.hours > 0 ? `${d.hours}h` : '-'}
              </span>
              <div className="w-full max-w-[40px] h-24 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative flex items-end justify-center">
                <div
                  style={{ height: `${d.pct}%` }}
                  className="w-full rounded-xl bg-gradient-to-t from-indigo-600 to-blue-400 transition-all duration-500"
                />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
