import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Bell, 
  Volume2, 
  VolumeX, 
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
            Focus Timer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Time your focus blocks and log your completed sessions
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setTimerMode('countdown')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              timerState.mode === 'countdown'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Countdown Session
          </button>
          <button
            onClick={() => setTimerMode('stopwatch')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              timerState.mode === 'stopwatch'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Stopwatch Count-Up
          </button>
        </div>
      </div>

      {/* Main Focus Console Card */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden text-center flex flex-col items-center">
        {/* Active Task Name Input */}
        <div className="w-full max-w-md mb-5 z-10">
          <input
            type="text"
            placeholder="What are you focusing on? (e.g. Refactor API routes, Chapter 4 study...)"
            value={timerState.title}
            onChange={e => setTimerTitle(e.target.value)}
            className="w-full text-center px-3.5 py-2 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />

          {/* Category Pill Selector */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
            {categories.map(c => {
              const isSelected = (timerState.categoryId || categories[0]?.id) === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTimerCategory(c.id)}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium border flex items-center space-x-1.5 transition-colors ${
                    isSelected
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preset Duration Chips (for Countdown Mode) */}
        {timerState.mode === 'countdown' && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5 z-10">
            {[
              { label: '15m Sprint', mins: 15 },
              { label: '25m Pomodoro', mins: 25 },
              { label: '45m Focus Block', mins: 45 },
              { label: '60m Deep Work', mins: 60 },
              { label: '90m Ultradian', mins: 90 },
            ].map(chip => (
              <button
                key={chip.mins}
                onClick={() => setTargetMinutes(chip.mins)}
                disabled={timerState.isRunning}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  timerState.targetMinutes === chip.mins
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 border-transparent'
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
            <span className="text-4xl sm:text-6xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {formattedTime}
            </span>

            <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 mt-2">
              {timerState.mode === 'countdown'
                ? timerState.hasFinishedCountdown
                  ? 'Session Complete!'
                  : `${progressPct}% elapsed of ${timerState.targetMinutes}m`
                : `${formatDuration(Math.round(timerState.elapsedSeconds / 60))} total elapsed`}
            </span>

            {/* Status indicator if active */}
            {timerState.isRunning && (
              <div className="mt-2.5 flex items-center space-x-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Timer Running</span>
              </div>
            )}
          </div>
        </div>

        {/* Session Finished Notification Banner */}
        {timerState.hasFinishedCountdown && (
          <div className="my-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center space-x-2 z-10">
            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
            <span>Target session complete! Click "Save to History" below to record this activity.</span>
          </div>
        )}

        {/* Main Controls Row: Start/Pause, Save, Reset */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5 z-10">
          {/* Reset / Restart */}
          <button
            onClick={resetTimer}
            disabled={timerState.elapsedSeconds === 0}
            className="px-3.5 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Reset timer to 0"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          {/* Big Play / Pause Toggle Button */}
          <button
            onClick={toggleTimer}
            className={`px-6 py-2 rounded-md font-semibold text-xs transition-colors flex items-center space-x-1.5 ${
              timerState.isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {timerState.isRunning ? (
              <>
                <Pause size={16} className="stroke-[2.5]" />
                <span>Pause Timer</span>
              </>
            ) : (
              <>
                <Play size={16} className="stroke-[2.5] fill-white" />
                <span>{timerState.elapsedSeconds > 0 ? 'Resume Timer' : 'Start Focus'}</span>
              </>
            )}
          </button>

          {/* Save & Log to History */}
          <button
            onClick={stopTimerAndSave}
            disabled={timerState.elapsedSeconds < 30}
            className={`px-4 py-2 rounded-md font-medium text-xs transition-colors flex items-center space-x-1.5 ${
              timerState.elapsedSeconds >= 30 || timerState.hasFinishedCountdown
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed'
            }`}
            title="Save session to your history"
          >
            <Check size={15} className="stroke-[2.5]" />
            <span>Save to History</span>
          </button>
        </div>
      </div>

      {/* Notification Preferences & Today's Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notification Settings Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <Bell size={15} className="text-emerald-500" />
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
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
                  className="px-2 py-1 text-[10px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                >
                  Test Sound
                </button>
                <button
                  type="button"
                  onClick={() => updatePreferences({ enableSoundNotification: !(preferences.enableSoundNotification !== false) })}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    preferences.enableSoundNotification !== false ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
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
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  Active
                </span>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="px-2.5 py-1 text-[10px] font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Enable Permission
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Today's Focus Output Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Flame size={15} className="text-amber-500" />
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                Today's Focus Momentum
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your logged output for {today}
            </p>

            <div className="mt-4 flex items-baseline space-x-3">
              <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {formatDuration(todayTotalMins)}
              </span>
              <span className="text-xs text-slate-400 font-normal">
                across {todayFocusActs.length} recorded blocks
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Focus Streak</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              {todayFocusActs.length >= 3 ? 'High Momentum 🔥' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
