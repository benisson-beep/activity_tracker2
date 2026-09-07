import React, { useState } from 'react';
import { 
  Settings, 
  Tag, 
  Palette, 
  Plus, 
  Trash2, 
  Edit2, 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Sliders,
  Bell,
  Volume2,
  LogOut,
  Mail,
  X
} from 'lucide-react';
import { useActivity } from '../../context/ActivityContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Category, PlanTier, CalendarNumberFontStyle } from '../../types';
import { CategoryIcon, AVAILABLE_ICONS, PRESET_COLORS } from '../common/CategoryIcon';
import { storage } from '../../lib/storage';
import { playSessionCompleteChime, requestNotificationPermission, sendFocusCompleteNotification } from '../../lib/notification';

type SettingsTab = 'categories' | 'preferences' | 'subscription' | 'data';

interface SettingsViewProps {
  onLogout?: () => void;
  onOpenContact?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout, onOpenContact }) => {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    preferences, 
    updatePreferences, 
    resetData, 
    showToast 
  } = useActivity();
  const { currentUser, updateUserPlan } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>('categories');

  // Category modal state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#6366f1');
  const [catIcon, setCatIcon] = useState('Tag');
  const [catDuration, setCatDuration] = useState(60);

  const handleOpenNewCat = () => {
    setEditingCat(null);
    setCatName('');
    setCatColor(PRESET_COLORS[0]);
    setCatIcon('Tag');
    setCatDuration(60);
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (c: Category) => {
    setEditingCat(c);
    setCatName(c.name);
    setCatColor(c.color);
    setCatIcon(c.icon);
    setCatDuration(c.defaultDurationMinutes || 60);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCat) {
      updateCategory({
        ...editingCat,
        name: catName.trim(),
        color: catColor,
        icon: catIcon,
        defaultDurationMinutes: catDuration,
      });
    } else {
      addCategory({
        name: catName.trim(),
        color: catColor,
        icon: catIcon,
        defaultDurationMinutes: catDuration,
      });
    }
    setIsCatModalOpen(false);
  };

  const handleExportJSON = () => {
    const json = storage.exportData(currentUser.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chronicle_backup_${currentUser.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      const success = storage.importData(currentUser.id, text);
      if (success) {
        showToast('Data imported successfully! Refreshing view...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast('Failed to parse JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage categories, preferences, plan, and data backups
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-xl">
        {[
          { id: 'categories', label: 'Categories', icon: <Tag size={14} /> },
          { id: 'preferences', label: 'Preferences', icon: <Sliders size={14} /> },
          { id: 'subscription', label: 'Plan & Billing', icon: <ShieldCheck size={14} /> },
          { id: 'data', label: 'Data & Backup', icon: <Download size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: CATEGORIES MANAGER */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Categories ({categories.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Categories are customizable so you can structure tracking around your real life
              </p>
            </div>
            <button
              onClick={handleOpenNewCat}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
            >
              <Plus size={14} />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={16} />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {cat.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Default: {cat.defaultDurationMinutes || 60}m
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEditCat(cat)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit category"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Display & Format Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize how dates, times, and interfaces are rendered
            </p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            {/* 24-hour vs 12-hour clock */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Time Format
                </span>
                <span className="text-xs text-slate-500">
                  {preferences.is24Hour ? '24-hour clock (14:30)' : '12-hour clock (2:30 PM)'}
                </span>
              </div>
              <button
                onClick={() => updatePreferences({ is24Hour: !preferences.is24Hour })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  preferences.is24Hour
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {preferences.is24Hour ? '24-Hour' : '12-Hour'}
              </button>
            </div>

            {/* Week Starts on Monday vs Sunday */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  First Day of the Week
                </span>
                <span className="text-xs text-slate-500">
                  Affects calendar grid and weekly rhythm calculations
                </span>
              </div>
              <button
                onClick={() => updatePreferences({ startWeekOnMonday: !preferences.startWeekOnMonday })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  preferences.startWeekOnMonday
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {preferences.startWeekOnMonday ? 'Monday' : 'Sunday'}
              </button>
            </div>

            {/* Calendar Number Font Style */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Calendar Number Font
                </span>
                <span className="text-xs text-slate-500">
                  Select typography for dates, times, and duration figures in the calendar
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'geometric', label: 'Geometric', sample: '28' },
                  { id: 'sans', label: 'Clean Sans', sample: '28' },
                  { id: 'rounded', label: 'Rounded', sample: '28' },
                  { id: 'mono', label: 'Mono', sample: '28' },
                ].map(opt => {
                  const isSelected = (preferences.calendarNumberFont || 'geometric') === opt.id;
                  const fontCls = 
                    opt.id === 'geometric' ? 'font-geometric' :
                    opt.id === 'sans' ? 'font-sans' :
                    opt.id === 'rounded' ? 'font-rounded' : 'font-mono';

                  return (
                    <button
                      key={opt.id}
                      onClick={() => updatePreferences({ calendarNumberFont: opt.id as CalendarNumberFontStyle })}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className={`text-xs font-bold ${fontCls}`}>{opt.sample}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Application Theme
                </span>
                <span className="text-xs text-slate-500">
                  Switch between dark and light appearance
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 capitalize"
              >
                {theme} Mode
              </button>
            </div>

            {/* Micro-interactions & Sounds */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Focus Completion Chime
                </span>
                <span className="text-xs text-slate-500">
                  Play harmonic 3-tone audio chord when countdown sessions finish
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => playSessionCompleteChime()}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium flex items-center space-x-1"
                  title="Test Sound Chime"
                >
                  <Volume2 size={13} />
                  <span>Test</span>
                </button>
                <button
                  onClick={() => updatePreferences({ enableSoundNotification: preferences.enableSoundNotification !== false ? false : true })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                    preferences.enableSoundNotification !== false
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {preferences.enableSoundNotification !== false ? 'Enabled' : 'Muted'}
                </button>
              </div>
            </div>

            {/* Desktop Push Notifications */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Desktop Push Notifications
                </span>
                <span className="text-xs text-slate-500">
                  Trigger native OS alert banner when focus intervals conclude
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={async () => {
                    const granted = await requestNotificationPermission();
                    if (granted) {
                      updatePreferences({ enableDesktopNotification: true });
                      sendFocusCompleteNotification('Focus Session Concluded', 'Great job! Your notification test was successful.');
                    } else {
                      showToast('Notification permission denied or blocked in browser settings.', 'error');
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium flex items-center space-x-1"
                  title="Request & Test Desktop Permission"
                >
                  <Bell size={13} />
                  <span>Test Alert</span>
                </button>
                <button
                  onClick={async () => {
                    const nextVal = !preferences.enableDesktopNotification;
                    if (nextVal) {
                      const granted = await requestNotificationPermission();
                      if (granted) {
                        updatePreferences({ enableDesktopNotification: true });
                        showToast('Desktop notifications enabled!');
                      } else {
                        showToast('Browser blocked desktop notifications. Check your browser settings.', 'error');
                      }
                    } else {
                      updatePreferences({ enableDesktopNotification: false });
                      showToast('Desktop notifications disabled.');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                    preferences.enableDesktopNotification
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {preferences.enableDesktopNotification ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAAS SUBSCRIPTION & LIMITS */}
      {activeTab === 'subscription' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/40 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Current Subscription
              </span>
              <h3 className="text-xl font-black mt-2 tracking-tight">
                {currentUser.plan.toUpperCase()} Plan Active
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                You have unrestricted access to unlimited activity records, calendar analytics, goal automation, and export engines.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {currentUser.plan !== 'pro' ? (
                <button
                  onClick={() => updateUserPlan('pro')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                >
                  Upgrade to Pro ($12/mo)
                </button>
              ) : (
                <button
                  onClick={() => updateUserPlan('free')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
                >
                  Switch to Free Plan
                </button>
              )}
            </div>
          </div>

          {/* Pricing Tiers Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free */}
            <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
              currentUser.plan === 'free' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
            }`}>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Free Starter</h4>
              <p className="text-xs text-slate-400 mt-1">For casual personal logging</p>
              <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white font-mono">$0</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Up to 100 activities/month</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>4 custom categories</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>7-day activity history</span>
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
              currentUser.plan === 'pro' ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Pro Member</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  Popular
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">For daily practitioners and professionals</p>
              <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white font-mono">
                $12 <span className="text-xs font-normal text-slate-400">/ month</span>
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Unlimited activities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Unlimited custom categories</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>14-week consistency heatmaps</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Markdown & CSV automated reports</span>
                </li>
              </ul>
            </div>

            {/* Team */}
            <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
              currentUser.plan === 'team' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
            }`}>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Team</h4>
              <p className="text-xs text-slate-400 mt-1">For collaborative teams and studios</p>
              <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white font-mono">
                $29 <span className="text-xs font-normal text-slate-400">/ seat / mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>All Pro capabilities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Shared workspace categories</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>SSO & audit log compliance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATA & BACKUP */}
      {activeTab === 'data' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Data Sovereignty & Backups
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your activity history belongs entirely to you. Export or restore at any time.
            </p>
          </div>

          <div className="space-y-4">
            {/* Export */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Export Full JSON Archive
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Downloads all categories, goals, activities, and settings
                </p>
              </div>
              <button
                onClick={handleExportJSON}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Restore from JSON Backup
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Overwrites or restores records from a previous Chronicle export
                </p>
              </div>
              <label className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer">
                <Upload size={14} />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reset to Seed Data */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">
                  Reset Current Persona Data
                </h4>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                  Restores default realistic demo seeds for this account
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Reset this persona to default seed data?')) {
                    resetData();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5"
              >
                <RotateCcw size={14} />
                <span>Reset Data</span>
              </button>
            </div>

            {/* Account Session & Logout */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Active User Session ({currentUser.name})
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign out of this workspace and return to the marketing landing page
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Mail size={13} />
                  <span>Contact Support</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <LogOut size={13} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Create/Edit Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCat ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Work, Product Design, Fitness..."
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Color Tag
                </label>
                <div className="flex items-center space-x-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        catColor === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  {AVAILABLE_ICONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setCatIcon(ic)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                        catIcon === ic
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <CategoryIcon name={ic} size={16} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Default duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={catDuration}
                  onChange={e => setCatDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
