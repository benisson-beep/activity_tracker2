import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar as CalendarIcon, 
  Tag as TagIcon, 
  Link as LinkIcon, 
  Check, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { Activity, ActivityStatus, EnergyLevel } from '../../types';
import { useActivity } from '../../context/ActivityContext';
import { 
  getTodayString, 
  getCurrentTimeString, 
  calculateDuration, 
  addMinutesToTime, 
  formatDuration 
} from '../../lib/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';

export const ActivityModal: React.FC = () => {
  const { 
    isActivityModalOpen, 
    closeActivityModal, 
    editingActivity, 
    prefillData, 
    addActivity, 
    updateActivity, 
    categories 
  } = useActivity();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [status, setStatus] = useState<ActivityStatus>('completed');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('high');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (!isActivityModalOpen) return;

    if (editingActivity) {
      setTitle(editingActivity.title);
      setDescription(editingActivity.description || '');
      setCategoryId(editingActivity.categoryId);
      setDate(editingActivity.date);
      setStartTime(editingActivity.startTime);
      setEndTime(editingActivity.endTime);
      setDurationMinutes(editingActivity.durationMinutes);
      setStatus(editingActivity.status);
      setTags(editingActivity.tags || []);
      setEnergyLevel(editingActivity.energyLevel || 'high');
      setAttachmentUrl(editingActivity.attachmentUrl || '');
    } else {
      const now = getCurrentTimeString();
      const defaultDuration = categories[0]?.defaultDurationMinutes || 60;
      const computedEnd = addMinutesToTime(now, defaultDuration);

      setTitle(prefillData?.title || '');
      setDescription(prefillData?.description || '');
      setCategoryId(prefillData?.categoryId || categories[0]?.id || '');
      setDate(prefillData?.date || getTodayString());
      setStartTime(prefillData?.startTime || now);
      setEndTime(prefillData?.endTime || computedEnd);
      setDurationMinutes(prefillData?.durationMinutes || defaultDuration);
      setStatus(prefillData?.status || 'completed');
      setTags(prefillData?.tags || []);
      setEnergyLevel(prefillData?.energyLevel || 'high');
      setAttachmentUrl(prefillData?.attachmentUrl || '');
    }
    setError(null);
  }, [isActivityModalOpen, editingActivity, prefillData, categories]);

  if (!isActivityModalOpen) return null;

  // Duration recalculation when times change
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    const dur = calculateDuration(newStart, endTime);
    setDurationMinutes(dur);
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    const dur = calculateDuration(startTime, newEnd);
    setDurationMinutes(dur);
  };

  // Quick duration chips adjust end time
  const handleQuickDuration = (minutes: number) => {
    setDurationMinutes(minutes);
    const newEnd = addMinutesToTime(startTime, minutes);
    setEndTime(newEnd);
  };

  // Tags handling
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^[#]/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter an activity title.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    const calculatedDur = calculateDuration(startTime, endTime) || durationMinutes || 30;

    if (editingActivity) {
      updateActivity({
        ...editingActivity,
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
        date,
        startTime,
        endTime,
        durationMinutes: calculatedDur,
        status,
        tags,
        energyLevel,
        attachmentUrl: attachmentUrl.trim() || undefined,
      });
    } else {
      addActivity({
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
        date,
        startTime,
        endTime,
        durationMinutes: calculatedDur,
        status,
        tags,
        energyLevel,
        attachmentUrl: attachmentUrl.trim() || undefined,
      });
    }

    closeActivityModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingActivity ? 'Edit Activity Record' : 'Record What You Did'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingActivity ? 'Update details of this logged activity' : 'Capture truth-of-day actions into your history'}
            </p>
          </div>
          <button
            onClick={closeActivityModal}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Activity Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Activity Name <span className="text-emerald-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Refactored authentication session pipeline"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category <span className="text-emerald-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(cat => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left truncate ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => handleStartTimeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => handleEndTimeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Quick Duration Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Calculated Duration
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatDuration(durationMinutes)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[15, 30, 45, 60, 90, 120, 180].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleQuickDuration(mins)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    durationMinutes === mins
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {formatDuration(mins)}
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Focus & Energy Level
              </label>
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                {(['high', 'medium', 'low'] as EnergyLevel[]).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergyLevel(lvl)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                      energyLevel === lvl
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {lvl === 'high' ? '⚡ High' : lvl === 'medium' ? '⚖️ Med' : '🔋 Low'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Completion Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ActivityStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tags (press Enter to add)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 text-slate-400"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="e.g. deep-work, client-demo, rfc"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Outcome (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What specifically did you accomplish? Key decisions, breakthroughs, or blockers..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
          </div>

          {/* Attachment / Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reference Link / Artifact URL (Optional)
            </label>
            <div className="relative flex items-center">
              <LinkIcon size={14} className="absolute left-3 text-slate-400" />
              <input
                type="url"
                placeholder="https://github.com/org/repo/pull/42 or notion doc"
                value={attachmentUrl}
                onChange={e => setAttachmentUrl(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={closeActivityModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5"
            >
              <Check size={14} className="stroke-[2.5]" />
              <span>{editingActivity ? 'Update Activity' : 'Save to History'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
