import { Activity, Category, Goal, SmartInsight } from '../types';
import { 
  toDateString, 
  getTodayString, 
  parseDateString, 
  getWeekDays, 
  formatDuration 
} from './dateUtils';

export interface CategoryBreakdown {
  id: string;
  name: string;
  color: string;
  minutes: number;
  hours: number;
  percentage: number;
  count: number;
}

export interface DayActivityTotal {
  date: string;
  dayName: string;
  hours: number;
  minutes: number;
  count: number;
  isToday: boolean;
}

export interface HeatmapCell {
  date: string;
  minutes: number;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = 0m, 1 = <1h, 2 = 1-3h, 3 = 3-5h, 4 = 5h+
}

export const analyticsEngine = {
  // Today's summary stats
  getTodaySummary(activities: Activity[], targetDate: string = getTodayString()) {
    const todayActs = activities.filter(a => a.date === targetDate);
    const totalMinutes = todayActs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const count = todayActs.length;

    // Yesterday's comparison
    const yesterdayDate = toDateString(new Date(parseDateString(targetDate).getTime() - 86400000));
    const yesterdayActs = activities.filter(a => a.date === yesterdayDate);
    const yesterdayMinutes = yesterdayActs.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    let minuteDeltaPercent = 0;
    if (yesterdayMinutes > 0) {
      minuteDeltaPercent = Math.round(((totalMinutes - yesterdayMinutes) / yesterdayMinutes) * 100);
    }

    // Dominant category today
    const catMap: Record<string, number> = {};
    for (const a of todayActs) {
      catMap[a.categoryId] = (catMap[a.categoryId] || 0) + a.durationMinutes;
    }
    let topCatId: string | null = null;
    let topCatMinutes = 0;
    for (const [cId, mins] of Object.entries(catMap)) {
      if (mins > topCatMinutes) {
        topCatMinutes = mins;
        topCatId = cId;
      }
    }

    return {
      totalMinutes,
      totalHours: Number((totalMinutes / 60).toFixed(1)),
      count,
      minuteDeltaPercent,
      topCatId,
      topCatMinutes,
    };
  },

  // Weekly rhythm (Mon-Sun)
  getWeeklyRhythm(activities: Activity[], referenceDate: Date = new Date(), startOnMonday: boolean = true): DayActivityTotal[] {
    const weekDays = getWeekDays(referenceDate, startOnMonday);
    const todayStr = getTodayString();

    return weekDays.map(d => {
      const dateStr = toDateString(d);
      const dayActs = activities.filter(a => a.date === dateStr);
      const minutes = dayActs.reduce((acc, a) => acc + a.durationMinutes, 0);
      return {
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Number((minutes / 60).toFixed(1)),
        minutes,
        count: dayActs.length,
        isToday: dateStr === todayStr,
      };
    });
  },

  // Category breakdown
  getCategoryBreakdown(activities: Activity[], categories: Category[]): CategoryBreakdown[] {
    const totalMinutes = activities.reduce((acc, a) => acc + a.durationMinutes, 0);
    if (totalMinutes === 0) return [];

    const catMap: Record<string, { minutes: number; count: number }> = {};
    for (const a of activities) {
      if (!catMap[a.categoryId]) {
        catMap[a.categoryId] = { minutes: 0, count: 0 };
      }
      catMap[a.categoryId].minutes += a.durationMinutes;
      catMap[a.categoryId].count += 1;
    }

    const result: CategoryBreakdown[] = [];
    for (const cat of categories) {
      const data = catMap[cat.id];
      if (data && data.minutes > 0) {
        result.push({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          minutes: data.minutes,
          hours: Number((data.minutes / 60).toFixed(1)),
          percentage: Math.round((data.minutes / totalMinutes) * 100),
          count: data.count,
        });
      }
    }

    // Sort descending by minutes
    return result.sort((a, b) => b.minutes - a.minutes);
  },

  // 12-week GitHub-style consistency punchcard / heatmap
  getConsistencyHeatmap(activities: Activity[], weeksCount: number = 14): HeatmapCell[][] {
    const today = new Date();
    const actMap = new Map<string, { minutes: number; count: number }>();
    
    for (const a of activities) {
      const current = actMap.get(a.date) || { minutes: 0, count: 0 };
      current.minutes += a.durationMinutes;
      current.count += 1;
      actMap.set(a.date, current);
    }

    const totalDays = weeksCount * 7;
    // Calculate the ending date as the end of current week (Sunday or Saturday)
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const daysUntilEndOfWeek = (7 - dayOfWeek) % 7;
    const end = new Date(today);
    end.setDate(today.getDate() + daysUntilEndOfWeek);

    const start = new Date(end);
    start.setDate(end.getDate() - totalDays + 1);

    const columns: HeatmapCell[][] = [];
    let currentWeek: HeatmapCell[] = [];

    const cursor = new Date(start);
    for (let i = 0; i < totalDays; i++) {
      const dateStr = toDateString(cursor);
      const data = actMap.get(dateStr) || { minutes: 0, count: 0 };

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (data.minutes > 0 && data.minutes < 60) level = 1;
      else if (data.minutes >= 60 && data.minutes < 180) level = 2;
      else if (data.minutes >= 180 && data.minutes < 300) level = 3;
      else if (data.minutes >= 300) level = 4;

      currentWeek.push({
        date: dateStr,
        minutes: data.minutes,
        count: data.count,
        level,
      });

      if (currentWeek.length === 7) {
        columns.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      columns.push(currentWeek);
    }

    return columns;
  },

  // Time of Day Distribution
  getTimeOfDayDistribution(activities: Activity[]) {
    const buckets = {
      morning: { name: 'Morning (6am - 12pm)', minutes: 0, count: 0, color: '#f59e0b' },
      afternoon: { name: 'Afternoon (12pm - 5pm)', minutes: 0, count: 0, color: '#3b82f6' },
      evening: { name: 'Evening (5pm - 10pm)', minutes: 0, count: 0, color: '#8b5cf6' },
      night: { name: 'Night (10pm - 6am)', minutes: 0, count: 0, color: '#64748b' },
    };

    for (const a of activities) {
      const [h] = a.startTime.split(':').map(Number);
      if (h >= 6 && h < 12) {
        buckets.morning.minutes += a.durationMinutes;
        buckets.morning.count += 1;
      } else if (h >= 12 && h < 17) {
        buckets.afternoon.minutes += a.durationMinutes;
        buckets.afternoon.count += 1;
      } else if (h >= 17 && h < 22) {
        buckets.evening.minutes += a.durationMinutes;
        buckets.evening.count += 1;
      } else {
        buckets.night.minutes += a.durationMinutes;
        buckets.night.count += 1;
      }
    }

    const totalMins = Object.values(buckets).reduce((sum, b) => sum + b.minutes, 0);

    return Object.entries(buckets).map(([key, data]) => ({
      key,
      ...data,
      hours: Number((data.minutes / 60).toFixed(1)),
      percentage: totalMins > 0 ? Math.round((data.minutes / totalMins) * 100) : 0,
    }));
  },

  // Session Duration Distribution
  getDurationDistribution(activities: Activity[]) {
    const buckets = [
      { label: '< 30m', desc: 'Quick Sprints', count: 0, minutes: 0, color: '#10b981' },
      { label: '30m - 1h', desc: 'Standard Focus', count: 0, minutes: 0, color: '#06b6d4' },
      { label: '1h - 2h', desc: 'Deep Work', count: 0, minutes: 0, color: '#6366f1' },
      { label: '2h+', desc: 'Marathon Blocks', count: 0, minutes: 0, color: '#ec4899' },
    ];

    for (const a of activities) {
      if (a.durationMinutes < 30) {
        buckets[0].count += 1;
        buckets[0].minutes += a.durationMinutes;
      } else if (a.durationMinutes <= 60) {
        buckets[1].count += 1;
        buckets[1].minutes += a.durationMinutes;
      } else if (a.durationMinutes <= 120) {
        buckets[2].count += 1;
        buckets[2].minutes += a.durationMinutes;
      } else {
        buckets[3].count += 1;
        buckets[3].minutes += a.durationMinutes;
      }
    }

    return buckets;
  },

  // Goal Progress Calculation
  getGoalProgress(goal: Goal, activities: Activity[], referenceDate: Date = new Date(), startOnMonday: boolean = true) {
    let relevantActivities = activities;

    // Filter by category if specified
    if (goal.categoryId) {
      relevantActivities = relevantActivities.filter(a => a.categoryId === goal.categoryId);
    }

    // Filter by period
    if (goal.period === 'daily') {
      const todayStr = toDateString(referenceDate);
      relevantActivities = relevantActivities.filter(a => a.date === todayStr);
    } else if (goal.period === 'weekly') {
      const weekDays = getWeekDays(referenceDate, startOnMonday);
      const startStr = toDateString(weekDays[0]);
      const endStr = toDateString(weekDays[6]);
      relevantActivities = relevantActivities.filter(a => a.date >= startStr && a.date <= endStr);
    } else if (goal.period === 'monthly') {
      const year = referenceDate.getFullYear();
      const month = referenceDate.getMonth();
      const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDay = new Date(year, month + 1, 0).getDate();
      const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
      relevantActivities = relevantActivities.filter(a => a.date >= startStr && a.date <= endStr);
    }

    let currentValue = 0;
    if (goal.targetType === 'hours') {
      const totalMinutes = relevantActivities.reduce((sum, a) => sum + a.durationMinutes, 0);
      currentValue = Number((totalMinutes / 60).toFixed(1));
    } else {
      currentValue = relevantActivities.length;
    }

    const percentage = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));
    
    // Status pace
    let status: 'completed' | 'ahead' | 'on-track' | 'behind' = 'on-track';
    if (currentValue >= goal.targetValue) {
      status = 'completed';
    } else {
      // Simple day of week pace check for weekly goals
      if (goal.period === 'weekly') {
        const dayIdx = (referenceDate.getDay() + (startOnMonday ? 6 : 0)) % 7; // 0 to 6
        const expectedPace = (dayIdx + 1) / 7;
        const actualPace = currentValue / goal.targetValue;
        if (actualPace >= expectedPace * 1.15) status = 'ahead';
        else if (actualPace < expectedPace * 0.75) status = 'behind';
        else status = 'on-track';
      }
    }

    return {
      currentValue,
      targetValue: goal.targetValue,
      percentage,
      status,
      remaining: Math.max(0, Number((goal.targetValue - currentValue).toFixed(1))),
      unit: goal.targetType === 'hours' ? 'hrs' : 'times',
    };
  },

  // Algorithmic smart insights
  generateSmartInsights(activities: Activity[], categories: Category[], goals: Goal[]): SmartInsight[] {
    const insights: SmartInsight[] = [];
    if (activities.length === 0) {
      insights.push({
        id: 'ins_welcome',
        type: 'recommendation',
        title: 'Start Logging Today',
        description: 'Hit Quick Add or press N to record your first block of focused time.',
        icon: 'Sparkles',
      });
      return insights;
    }

    // 1. Peak productivity window
    const tod = this.getTimeOfDayDistribution(activities);
    const topPeriod = [...tod].sort((a, b) => b.minutes - a.minutes)[0];
    if (topPeriod && topPeriod.minutes > 0) {
      insights.push({
        id: 'ins_peak_window',
        type: 'trend',
        title: `Prime Focus Window: ${topPeriod.name.split(' ')[0]}`,
        description: `You complete ${topPeriod.percentage}% of your logged activity during ${topPeriod.name.toLowerCase()}. Schedule high-leverage work here.`,
        icon: 'Zap',
      });
    }

    // 2. Goal achievement
    for (const g of goals) {
      const prog = this.getGoalProgress(g, activities);
      if (prog.status === 'completed') {
        insights.push({
          id: `ins_goal_${g.id}`,
          type: 'achievement',
          title: `Goal Met: ${g.title}`,
          description: `You have reached 100% of your target (${prog.currentValue} ${prog.unit} achieved)! Outstanding consistency.`,
          icon: 'CheckCircle2',
        });
        break;
      } else if (prog.status === 'ahead') {
        insights.push({
          id: `ins_ahead_${g.id}`,
          type: 'achievement',
          title: `Ahead of Schedule on ${g.title}`,
          description: `You're tracking ahead of your weekly pace with ${prog.currentValue} / ${prog.targetValue} ${prog.unit} logged so far.`,
          icon: 'TrendingUp',
        });
        break;
      }
    }

    // 3. Deep work ratio
    const durations = this.getDurationDistribution(activities);
    const deepBlocks = durations[2].count + durations[3].count;
    if (deepBlocks >= 3) {
      insights.push({
        id: 'ins_deep_ratio',
        type: 'trend',
        title: 'Strong Deep Work Habits',
        description: `You logged ${deepBlocks} high-focus blocks (60m+) this cycle, minimizing fragmentation.`,
        icon: 'Focus',
      });
    }

    // 4. Recommendation if no fitness/wellness
    const todayStr = getTodayString();
    const todayActs = activities.filter(a => a.date === todayStr);
    const hasWellness = todayActs.some(a => {
      const cat = categories.find(c => c.id === a.categoryId);
      return cat?.name.toLowerCase().includes('fitness') || cat?.name.toLowerCase().includes('health') || cat?.name.toLowerCase().includes('wellness');
    });

    if (!hasWellness && todayActs.length >= 3) {
      insights.push({
        id: 'ins_recovery_rec',
        type: 'recommendation',
        title: 'Time for Movement or Recovery',
        description: `You've logged ${todayActs.length} mental work sessions today without a recorded recovery or movement break.`,
        icon: 'HeartPulse',
      });
    }

    return insights.slice(0, 3);
  }
};
