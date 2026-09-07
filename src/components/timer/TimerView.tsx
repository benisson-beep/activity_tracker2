import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Bell, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Zap, 
  Clock, 
  Coffee, 
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useActivity } from '../../context/ActivityContext';
import { TimerMode } from '../../types';
import { formatDuration, getTodayString } from '../../lib/dateUtils';
import { playSessionCompleteChime, requestNotificationPermission } from '../../lib/notification';
import { CategoryIcon } from '../common/CategoryIcon';

export const TimerView: React.FC = () => {
  const { 
    timerState, 
    toggleTimer, 
    resetTimer, 
    stopTimerAndSave, 
    setTimerMode, 
    setTargetMinutes, 
    setTimerTitle, 
    setTimerCategory, 
    categories, 
    activities, 
    preferences, 
    updatePreferences, 
    showToast 
  } = useActivity();

  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    return 'Notification' in window ? Notification.permission : 'denied';
  });

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      updatePreferences({ enableDesktopNotification: true });
      showToast('Desktop notifications enabled!');
    } else {
      showToast('Notification permission was not granted.', 'info');
    }
  };

  const handleTestChime = () => {
    playSessionCompleteChime();
    showToast('Melodic chime played!');
  };

  // Calculations for countdown vs stopwatch
  const targetTotalSec = timerState.targetMinutes * 60;
  const remainingSec = timerState.mode === 'countdown'
    ? Math.max(0, targetTotalSec - timerState.elapsedSeconds)
    : timerState.elapsedSeconds;

  const displayHours = Math.floor(remainingSec / 3600);
  const displayMins = Math.floor((remainingSec % 3600) / 60);
  const displaySecs = remainingSec % 60;

  const formattedTime = displayHours > 0
    ? `${displayHours}:${String(displayMins).padStart(2, '0')}:${String(displaySecs).padStart(2, '0')}`
    : `${String(displayMins).padStart(2, '0')}:${String(displaySecs).padStart(2, '0')}`;

  // Progress percentage (0 to 100)
  const progressPct = timerState.mode === 'countdown'
    ? Math.min(100, Math.round((timerState.elapsedSeconds / targetTotalSec) * 100))
    : Math.min(100, Math.round((timerState.elapsedSeconds / 3600) * 100));

  // Circumference for SVG ring
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = timerState.mode === 'countdown'
    ? circumference - (progressPct / 100) * circumference
    : (progressPct / 100) * circumference;

  const activeCategory = categories.find(c => c.id === timerState.categoryId) || categories[0];

  // Today's focus stats
  const today = getTodayString();
  const todayFocusActs = activities.filter(a => a.date === today);
  const todayTotalMins = todayFocusActs.reduce((acc, a) => acc + a.durationMinutes, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Focus & Session Timer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Distraction-free environment for deep work, study sprints, and live activity logging
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setTimerMode('countdown')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timerState.mode === 'countdown'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Countdown Session
          </button>
          <button
            onClick={() => setTimerMode('stopwatch')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timerState.mode === 'stopwatch'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Stopwatch Count-Up
          </button>
        </div>
      </div>

      {/* Main Focus Console Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden text-center flex flex-col items-center">
        {/* Ambient background glow when timer is running */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
            timerState.isRunning
              ? 'opacity-20 bg-radial from-emerald-500 via-transparent to-transparent'
              : 'opacity-0'
          }`}
        />

        {/* Active Task Name Input */}
        <div className="w-full max-w-md mb-6 z-10">
          <input
            type="text"
            placeholder="What are you focusing on? (e.g. Refactor API routes, Chapter 4 study...)"
            value={timerState.title}
            onChange={e => setTimerTitle(e.target.value)}
            className="w-full text-center px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />

          {/* Category Pill Selector */}
          <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
            {categories.map(c => {
              const isSelected = (timerState.categoryId || categories[0]?.id) === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTimerCategory(c.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preset Duration Chips (for Countdown Mode) */}
        {timerState.mode === 'countdown' && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 z-10">
            {[
              { label: '15m Quick Sprint', mins: 15 },
              { label: '25m Pomodoro', mins: 25 },
              { label: '45m Focus Block', mins: 45 },
              { label: '60m Deep Work', mins: 60 },
              { label: '90m Ultradian Sprint', mins: 90 },
            ].map(chip => (
              <button
                key={chip.mins}
                onClick={() => setTargetMinutes(chip.mins)}
                disabled={timerState.isRunning}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  timerState.targetMinutes === chip.mins
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 border-transparent shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                } ${timerState.isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Big Circular Progress Ring & Digital Clock */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2 z-10">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
            {/* Background Track */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={activeCategory?.color || '#10b981'}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700"
            />
          </svg>

          {/* Center Digital Clock Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
              {formattedTime}
            </span>

            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mt-2">
              {timerState.mode === 'countdown'
                ? timerState.hasFinishedCountdown
                  ? 'Session Complete!'
                  : `${progressPct}% elapsed of ${timerState.targetMinutes}m`
                : `${formatDuration(Math.round(timerState.elapsedSeconds / 60))} total elapsed`}
            </span>

            {/* Pulsing indicator if active */}
            {timerState.isRunning && (
              <div className="mt-3 flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Timer Running</span>
              </div>
            )}
          </div>
        </div>

        {/* Session Finished Notification Banner */}
        {timerState.hasFinishedCountdown && (
          <div className="my-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-scale-in z-10">
            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
            <span>Target session complete! Click "Save to History" below to record this activity.</span>
          </div>
        )}

        {/* Main Controls Row: Start/Pause, Save, Reset */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 z-10">
          {/* Reset / Restart */}
          <button
            onClick={resetTimer}
            disabled={timerState.elapsedSeconds === 0}
            className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-2 transition-all"
            title="Reset timer to 0"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>

          {/* Big Play / Pause Toggle Button */}
          <button
            onClick={toggleTimer}
            className={`px-8 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center space-x-2 ${
              timerState.isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {timerState.isRunning ? (
              <>
                <Pause size={18} className="stroke-[2.5]" />
                <span>Pause Timer</span>
              </>
            ) : (
              <>
                <Play size={18} className="stroke-[2.5] fill-white" />
                <span>{timerState.elapsedSeconds > 0 ? 'Resume Timer' : 'Start Focus'}</span>
              </>
            )}
          </button>

          {/* Save & Log to History */}
          <button
            onClick={stopTimerAndSave}
            disabled={timerState.elapsedSeconds < 30}
            className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center space-x-2 ${
              timerState.elapsedSeconds >= 30 || timerState.hasFinishedCountdown
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed'
            }`}
            title="Save session to your history"
          >
            <Check size={16} className="stroke-[2.5]" />
            <span>Save to History</span>
          </button>
        </div>
      </div>

      {/* Notification Preferences & Today's Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notification Settings Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
          <div className="flex items-center space-x-2">
            <Bell size={16} className="text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              End-of-Session Notifications
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Get notified instantly when your focus block completes so you can take a breather and record your work.
          </p>

          <div className="space-y-2.5 pt-1">
            {/* Audio Chime Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                {preferences.enableSoundNotification !== false ? <Volume2 size={14} className="text-emerald-500" /> : <VolumeX size={14} className="text-slate-400" />}
                <span>Play Melodic Chime</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleTestChime}
                  className="px-2 py-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md"
                >
                  Test Sound
                </button>
                <button
                  type="button"
                  onClick={() => updatePreferences({ enableSoundNotification: !(preferences.enableSoundNotification !== false) })}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                    preferences.enableSoundNotification !== false ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      preferences.enableSoundNotification !== false ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Desktop Notification Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Bell size={14} className="text-indigo-500" />
                <span>Browser Push Notifications</span>
              </div>
              {notificationPermission === 'granted' ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  Active
                </span>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                >
                  Enable Permission
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Today's Focus Output Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Flame size={16} className="text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Today's Focus Momentum
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your logged output for {today}
            </p>

            <div className="mt-4 flex items-baseline space-x-3">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {formatDuration(todayTotalMins)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                across {todayFocusActs.length} recorded blocks
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Focus Streak</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {todayFocusActs.length >= 3 ? 'High Momentum 🔥' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
