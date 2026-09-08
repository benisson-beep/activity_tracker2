import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Tag as TagIcon, 
  X,
  Edit2,
  Trash2,
  ArrowRight,
  Type,
  Check
} from 'lucide-react';
import { useActivity } from '../../context/ActivityContext';
import { Activity, Category, CalendarNumberFontStyle } from '../../types';
import { 
  toDateString, 
  parseDateString, 
  getTodayString, 
  getWeekDays, 
  getMonthGrid, 
  formatDuration, 
  formatTimeDisplay, 
  formatDateDisplay,
  isSameDay 
} from '../../lib/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';

type CalendarMode = 'month' | 'week' | 'day';

const FONT_OPTIONS: { id: CalendarNumberFontStyle; label: string; preview: string; description: string }[] = [
  { id: 'geometric', label: 'Geometric', preview: '01 24', description: 'Outfit — Modern, clean circular digits' },
  { id: 'sans', label: 'Clean Sans', preview: '01 24', description: 'Inter — Balanced, modern proportional' },
  { id: 'rounded', label: 'Rounded', preview: '01 24', description: 'Plus Jakarta — Soft friendly curved numerals' },
  { id: 'mono', label: 'Mono Tech', preview: '01 24', description: 'JetBrains — Fixed-width developer terminal' },
];

export const CalendarView: React.FC = () => {
  const { 
    activities, 
    categories, 
    openCreateActivityModal, 
    openEditActivityModal, 
    deleteActivity,
    preferences,
    updatePreferences
  } = useActivity();

  const [mode, setMode] = useState<CalendarMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayActivities, setSelectedDayActivities] = useState<{ date: string; acts: Activity[] } | null>(null);
  const [showFontMenu, setShowFontMenu] = useState(false);

  const currentFont: CalendarNumberFontStyle = preferences.calendarNumberFont || 'geometric';

  const numberFontClass = useMemo(() => {
    switch (currentFont) {
      case 'sans':
        return 'font-sans tabular-nums tracking-tight';
      case 'rounded':
        return 'font-rounded tabular-nums tracking-tight';
      case 'mono':
        return 'font-mono tabular-nums';
      case 'geometric':
      default:
        return 'font-geometric tabular-nums tracking-tight';
    }
  }, [currentFont]);

  // Month navigation
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (mode === 'month') next.setMonth(next.getMonth() - 1);
    else if (mode === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (mode === 'month') next.setMonth(next.getMonth() + 1);
    else if (mode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Header Title
  const headerTitle = useMemo(() => {
    if (mode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (mode === 'week') {
      const week = getWeekDays(currentDate, preferences.startWeekOnMonday);
      const start = week[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = week[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    }
    return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }, [mode, currentDate, preferences.startWeekOnMonday]);

  // Month Grid calculation
  const monthGrid = useMemo(() => {
    return getMonthGrid(currentDate.getFullYear(), currentDate.getMonth(), preferences.startWeekOnMonday);
  }, [currentDate, preferences.startWeekOnMonday]);

  // Week Days calculation
  const weekDays = useMemo(() => {
    return getWeekDays(currentDate, preferences.startWeekOnMonday);
  }, [currentDate, preferences.startWeekOnMonday]);

  const getDayActivities = (dateStr: string) => {
    return activities.filter(a => a.date === dateStr);
  };

  const dayNames = preferences.startWeekOnMonday 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 24 Hour Slots for Day View
  const hoursSlots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-5 pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Activity Calendar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize your truth-of-day time allocation across days and weeks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            {(['month', 'week', 'day'] as CalendarMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Today and Nav Arrows */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrev}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
              title="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Number Font Style Selector */}
          <div className="relative">
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 text-xs font-medium border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5 transition-colors"
              title="Change calendar numbers font style"
            >
              <Type size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline text-slate-400 font-normal">Font:</span>
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {FONT_OPTIONS.find(f => f.id === currentFont)?.label || 'Geometric'}
              </span>
              <span className={`text-[10px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold ${numberFontClass}`}>
                28
              </span>
            </button>

            {showFontMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowFontMenu(false)} />
                <div className="absolute right-0 mt-2 w-64 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg z-30 space-y-1 animate-fade-in">
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Number Font Style
                  </div>
                  {FONT_OPTIONS.map(f => {
                    const isSelected = currentFont === f.id;
                    const fontPreviewClass = 
                      f.id === 'geometric' ? 'font-geometric' :
                      f.id === 'sans' ? 'font-sans' :
                      f.id === 'rounded' ? 'font-rounded' : 'font-mono';

                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          updatePreferences({ calendarNumberFont: f.id });
                          setShowFontMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold flex items-center space-x-1.5">
                            <span>{f.label}</span>
                            {isSelected && <Check size={12} className="stroke-[3]" />}
                          </p>
                          <p className="text-[10px] text-slate-400">{f.description}</p>
                        </div>
                        <span className={`text-sm font-bold tabular-nums px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ${fontPreviewClass}`}>
                          {f.preview}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => openCreateActivityModal({ date: toDateString(currentDate) })}
            className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center space-x-1.5"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span className="hidden sm:inline">Add to Date</span>
          </button>
        </div>
      </div>

      {/* Calendar Header Card */}
      <div className="px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className={`text-base font-bold text-slate-900 dark:text-white tracking-tight ${numberFontClass}`}>
          {headerTitle}
        </h3>
        <span className="text-xs text-slate-400 font-normal hidden sm:inline">
          Click any date or slot to record or inspect
        </span>
      </div>

      {/* MAIN VIEW CONTENT */}
      {mode === 'month' && (
        /* MONTH VIEW */
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Day of Week Labels */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-center py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            {dayNames.map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Month Matrix Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
            {monthGrid.flat().map((dateObj, idx) => {
              if (!dateObj) {
                return (
                  <div key={`empty_${idx}`} className="min-h-[105px] sm:min-h-[120px] bg-slate-50/40 dark:bg-slate-900/30 p-2" />
                );
              }

              const dateStr = toDateString(dateObj);
              const dayActs = getDayActivities(dateStr);
              const isCurrentDay = isSameDay(dateObj, new Date());
              const totalMins = dayActs.reduce((acc, a) => acc + a.durationMinutes, 0);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDayActivities({ date: dateStr, acts: dayActs })}
                  className={`min-h-[105px] sm:min-h-[120px] p-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors relative flex flex-col justify-between group ${
                    isCurrentDay ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs sm:text-sm font-semibold w-6 h-6 rounded-md flex items-center justify-center transition-colors ${numberFontClass} ${
                        isCurrentDay 
                          ? 'bg-emerald-600 text-white font-bold' 
                          : 'text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                      }`}>
                        {dateObj.getDate()}
                      </span>

                      {totalMins > 0 && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ${numberFontClass}`}>
                          {formatDuration(totalMins)}
                        </span>
                      )}
                    </div>

                    {/* Activity chips (up to 3) */}
                    <div className="space-y-1">
                      {dayActs.slice(0, 3).map(act => {
                        const cat = categories.find(c => c.id === act.categoryId);
                        return (
                          <div
                            key={act.id}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center space-x-1"
                            style={{
                              backgroundColor: `${cat?.color || '#6366f1'}20`,
                              color: cat?.color || '#6366f1',
                            }}
                          >
                            <span 
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat?.color || '#6366f1' }}
                            />
                            <span className="truncate">{act.title}</span>
                          </div>
                        );
                      })}
                      {dayActs.length > 3 && (
                        <span className={`text-[10px] font-medium text-slate-400 pl-1 block ${numberFontClass}`}>
                          +{dayActs.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick plus on hover */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openCreateActivityModal({ date: dateStr });
                    }}
                    className="opacity-0 group-hover:opacity-100 self-end p-1 text-slate-400 hover:text-emerald-500 transition-opacity"
                    title="Add activity on this date"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'week' && (
        /* WEEK VIEW (7 Columns) */
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 divide-x divide-slate-200 dark:divide-slate-800">
              {weekDays.map(d => {
                const isCurrent = isSameDay(d, new Date());
                const dateStr = toDateString(d);
                const dayActs = getDayActivities(dateStr);
                const totalMins = dayActs.reduce((acc, a) => acc + a.durationMinutes, 0);

                return (
                  <div key={dateStr} className="p-3 text-center">
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-base sm:text-lg font-bold mt-1 inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors ${numberFontClass} ${
                      isCurrent ? 'bg-emerald-600 text-white' : 'text-slate-800 dark:text-white'
                    }`}>
                      {d.getDate()}
                    </p>
                    <p className={`text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 ${numberFontClass}`}>
                      {totalMins > 0 ? formatDuration(totalMins) : '0h'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Week Content Columns */}
            <div className="grid grid-cols-7 min-h-[420px] divide-x divide-slate-100 dark:divide-slate-800/60">
              {weekDays.map(d => {
                const dateStr = toDateString(d);
                const dayActs = getDayActivities(dateStr);

                return (
                  <div 
                    key={dateStr}
                    onClick={() => openCreateActivityModal({ date: dateStr })}
                    className="p-2 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    {dayActs.map(act => {
                      const cat = categories.find(c => c.id === act.categoryId);
                      return (
                        <div
                          key={act.id}
                          onClick={e => {
                            e.stopPropagation();
                            openEditActivityModal(act);
                          }}
                          style={{
                            borderLeftColor: cat?.color || '#6366f1',
                          }}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 border-l-2 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer group"
                        >
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {act.title}
                          </p>
                          <div className={`flex items-center justify-between mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium ${numberFontClass}`}>
                            <span>{act.startTime}</span>
                            <span className="font-semibold">{formatDuration(act.durationMinutes)}</span>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        openCreateActivityModal({ date: dateStr });
                      }}
                      className="w-full py-1.5 text-[11px] font-medium text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors flex items-center justify-center space-x-1"
                    >
                      <Plus size={12} />
                      <span>Log</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {mode === 'day' && (
        /* DAY VIEW (24h Vertical Hourly Schedule) */
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
          <div className="max-w-3xl mx-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {hoursSlots.map(h => {
              const timeStr = `${String(h).padStart(2, '0')}:00`;
              const targetDateStr = toDateString(currentDate);
              // Find activities that occur in this hour
              const actsInHour = activities.filter(a => {
                if (a.date !== targetDateStr) return false;
                const [startH] = a.startTime.split(':').map(Number);
                return startH === h;
              });

              return (
                <div key={h} className="py-2 flex items-start space-x-4 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-md transition-colors">
                  <span className={`w-16 text-right text-xs font-medium text-slate-400 pt-1 tracking-tight ${numberFontClass}`}>
                    {formatTimeDisplay(timeStr, preferences.is24Hour)}
                  </span>

                  <div className="flex-1 min-h-[44px]">
                    {actsInHour.length === 0 ? (
                      <button
                        onClick={() => openCreateActivityModal({ date: targetDateStr, startTime: timeStr })}
                        className="w-full h-8 text-left text-xs text-transparent group-hover:text-slate-400 hover:!text-emerald-500 flex items-center space-x-1 transition-colors"
                      >
                        <Plus size={12} />
                        <span className={numberFontClass}>Log activity at {formatTimeDisplay(timeStr, preferences.is24Hour)}</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {actsInHour.map(act => {
                          const cat = categories.find(c => c.id === act.categoryId);
                          return (
                            <div
                              key={act.id}
                              onClick={() => openEditActivityModal(act)}
                              style={{ borderLeftColor: cat?.color || '#6366f1' }}
                              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 border-l-2 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                  {act.title}
                                </span>
                                <span className={`text-xs font-semibold text-slate-700 dark:text-slate-300 ${numberFontClass}`}>
                                  {formatDuration(act.durationMinutes)}
                                </span>
                              </div>
                              <div className={`flex items-center space-x-2 mt-1 text-[11px] text-slate-500 font-medium ${numberFontClass}`}>
                                <span>{act.startTime} - {act.endTime}</span>
                                <span>•</span>
                                <span style={{ color: cat?.color }}>{cat?.name}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Activities Slideout / Inspector Modal */}
      {selectedDayActivities && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-5 overflow-hidden max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className={`text-base font-bold text-slate-900 dark:text-white ${numberFontClass}`}>
                  {formatDateDisplay(selectedDayActivities.date, 'full')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className={`font-semibold ${numberFontClass}`}>{selectedDayActivities.acts.length}</span> activities logged •{' '}
                  <span className={`font-semibold ${numberFontClass}`}>{formatDuration(selectedDayActivities.acts.reduce((s, a) => s + a.durationMinutes, 0))}</span> total
                </p>
              </div>
              <button
                onClick={() => setSelectedDayActivities(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3.5 space-y-2.5">
              {selectedDayActivities.acts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No activities recorded on this date.
                </div>
              ) : (
                selectedDayActivities.acts.map(act => {
                  const cat = categories.find(c => c.id === act.categoryId);
                  return (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div className="truncate">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {act.title}
                        </h4>
                        <p className={`text-[11px] text-slate-500 font-medium mt-0.5 ${numberFontClass}`}>
                          {act.startTime} - {act.endTime} • {cat?.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 ${numberFontClass}`}>
                          {formatDuration(act.durationMinutes)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedDayActivities(null);
                            openEditActivityModal(act);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            deleteActivity(act.id);
                            setSelectedDayActivities(prev => prev ? {
                              ...prev,
                              acts: prev.acts.filter(a => a.id !== act.id)
                            } : null);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  const targetDate = selectedDayActivities.date;
                  setSelectedDayActivities(null);
                  openCreateActivityModal({ date: targetDate });
                }}
                className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1.5"
              >
                <Plus size={14} />
                <span>Add Activity to this Date</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
