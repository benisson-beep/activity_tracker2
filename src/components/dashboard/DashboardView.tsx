import React from 'react';
import { 
  Clock, 
  Activity as ActivityIcon, 
  Flame, 
  Compass, 
  Plus, 
  Sparkles, 
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useActivity } from '../../context/ActivityContext';
import { useAuth } from '../../context/AuthContext';
import { analyticsEngine } from '../../lib/analyticsEngine';
import { 
  getTodayString, 
  formatDateDisplay, 
  formatDuration, 
  formatTimeDisplay 
} from '../../lib/dateUtils';
import { MetricCard } from './MetricCard';
import { DayTimelineBar } from './DayTimelineBar';
import { WeeklyRhythm } from './WeeklyRhythm';
import { CategoryDonut } from './CategoryDonut';
import { SmartInsights } from './SmartInsights';
import { QuickAddBar } from './QuickAddBar';
import { CategoryIcon } from '../common/CategoryIcon';
import { ViewMode } from '../../types';

interface DashboardViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    activities, 
    categories, 
    goals, 
    openCreateActivityModal, 
    openEditActivityModal, 
    deleteActivity,
    addActivity,
    preferences 
  } = useActivity();
  const { currentUser } = useAuth();

  const today = getTodayString();
  const todayActs = activities.filter(a => a.date === today);

  // Computations from analytics engine
  const todaySummary = analyticsEngine.getTodaySummary(activities, today);
  const weeklyRhythm = analyticsEngine.getWeeklyRhythm(activities, new Date(), preferences.startWeekOnMonday);
  const categoryBreakdown = analyticsEngine.getCategoryBreakdown(todayActs, categories);
  const smartInsights = analyticsEngine.generateSmartInsights(activities, categories, goals);

  const topCategory = categories.find(c => c.id === todaySummary.topCatId);

  // Top weekly goal velocity
  const topGoal = goals[0];
  const topGoalProg = topGoal ? analyticsEngine.getGoalProgress(topGoal, activities, new Date(), preferences.startWeekOnMonday) : null;

  const handleDuplicate = (act: typeof activities[0]) => {
    addActivity({
      title: `${act.title} (Copy)`,
      description: act.description,
      categoryId: act.categoryId,
      date: today,
      startTime: act.startTime,
      endTime: act.endTime,
      durationMinutes: act.durationMinutes,
      status: 'completed',
      tags: act.tags,
      energyLevel: act.energyLevel,
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {currentUser.name.split(' ')[0]} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {formatDateDisplay(today, 'full')} • Here is the truth of your day so far.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center space-x-1.5"
          >
            <span>Daily Debrief</span>
            <ArrowRight size={13} />
          </button>
          <button
            onClick={() => openCreateActivityModal()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-1.5"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Record Activity</span>
          </button>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Logged Time"
          value={formatDuration(todaySummary.totalMinutes)}
          subtitle={todaySummary.totalHours > 0 ? `${todaySummary.totalHours} active hours` : 'Start logging today'}
          deltaPercent={todaySummary.minuteDeltaPercent}
          icon={<Clock size={18} className="text-emerald-500" />}
        />

        <MetricCard
          title="Activities Recorded"
          value={todaySummary.count}
          subtitle="Distinct time blocks"
          badge={todaySummary.count >= 4 ? 'High Output' : undefined}
          icon={<ActivityIcon size={18} className="text-indigo-500" />}
        />

        <MetricCard
          title="Leading Focus Today"
          value={topCategory?.name || 'None yet'}
          subtitle={todaySummary.topCatMinutes > 0 ? `${formatDuration(todaySummary.topCatMinutes)} committed` : 'Record to see breakdown'}
          icon={<Compass size={18} className="text-pink-500" />}
        />

        <MetricCard
          title="Goal Velocity"
          value={topGoalProg ? `${topGoalProg.percentage}%` : 'No Goals'}
          subtitle={topGoal ? topGoal.title : 'Configure in Goals tab'}
          badge={topGoalProg?.status === 'ahead' ? 'Ahead' : topGoalProg?.status === 'completed' ? 'Done' : undefined}
          icon={<Flame size={18} className="text-amber-500" />}
        />
      </div>

      {/* Quick Add Bar */}
      <QuickAddBar />

      {/* 24-Hour Daytime Flow Strip */}
      <DayTimelineBar 
        activities={todayActs} 
        categories={categories} 
        is24Hour={preferences.is24Hour} 
      />

      {/* Side-by-Side: Weekly Rhythm & Today's Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <WeeklyRhythm days={weeklyRhythm} />
        <CategoryDonut 
          categories={categoryBreakdown} 
          totalMinutes={todaySummary.totalMinutes} 
        />
      </div>

      {/* Smart Intelligence Insights */}
      <SmartInsights insights={smartInsights} />

      {/* Recent Activities Section */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Activity Logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest recorded blocks of time across all dates
            </p>
          </div>
          <button
            onClick={() => onNavigate('activities')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Stream</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No activities recorded yet. Use the Quick Bar above to log your first block!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {activities.slice(0, 6).map(act => {
              const cat = categories.find(c => c.id === act.categoryId);
              return (
                <div
                  key={act.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 group hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start space-x-3 truncate">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white mt-0.5 shadow-xs"
                      style={{ backgroundColor: cat?.color || '#6366f1' }}
                    >
                      <CategoryIcon name={cat?.icon || 'Tag'} size={15} />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {act.title}
                        </span>
                        {act.energyLevel && (
                          <span className="text-[10px] opacity-75">
                            {act.energyLevel === 'high' ? '⚡' : act.energyLevel === 'medium' ? '⚖️' : '🔋'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {cat?.name || 'Uncategorized'}
                        </span>
                        <span>•</span>
                        <span>{formatDateDisplay(act.date, 'short')}</span>
                        <span>•</span>
                        <span className="font-mono">
                          {formatTimeDisplay(act.startTime, preferences.is24Hour)} - {formatTimeDisplay(act.endTime, preferences.is24Hour)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 self-end sm:self-center pl-11 sm:pl-0">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {formatDuration(act.durationMinutes)}
                    </span>

                    {/* Quick action buttons */}
                    <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditActivityModal(act)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Activity"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(act)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Duplicate to Today"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => deleteActivity(act.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Activity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
