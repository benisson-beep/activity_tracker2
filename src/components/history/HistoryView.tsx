import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Trash2, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Tag as TagIcon, 
  SlidersHorizontal,
  Edit2,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Rows,
  GitCommit
} from 'lucide-react';
import { useActivity } from '../../context/ActivityContext';
import { Activity } from '../../types';
import { 
  formatDateDisplay, 
  formatDuration, 
  formatTimeDisplay, 
  getTodayString, 
  isDateInThisWeek, 
  isDateInThisMonth, 
  parseDateString 
} from '../../lib/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';

type ViewMode = 'timeline' | 'table';
type DateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month';
type DurationFilter = 'all' | 'under30' | '30to60' | '60to120' | 'over120';
type SortOption = 'date-desc' | 'date-asc' | 'duration-desc' | 'duration-asc' | 'title-asc';

export const HistoryView: React.FC = () => {
  const { 
    activities, 
    categories, 
    openCreateActivityModal, 
    openEditActivityModal, 
    deleteActivity, 
    deleteMultipleActivities,
    addActivity,
    preferences 
  } = useActivity();

  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtering & Sorting Logic
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = act.title.toLowerCase().includes(query);
        const matchesNotes = act.description?.toLowerCase().includes(query);
        const matchesTags = act.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesNotes && !matchesTags) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all' && act.categoryId !== selectedCategory) {
        return false;
      }

      // 3. Date Filter
      if (dateFilter === 'today' && act.date !== getTodayString()) return false;
      if (dateFilter === 'yesterday') {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (act.date !== yesterday) return false;
      }
      if (dateFilter === 'week' && !isDateInThisWeek(act.date, preferences.startWeekOnMonday)) return false;
      if (dateFilter === 'month' && !isDateInThisMonth(act.date)) return false;

      // 4. Duration Filter
      if (durationFilter === 'under30' && act.durationMinutes >= 30) return false;
      if (durationFilter === '30to60' && (act.durationMinutes < 30 || act.durationMinutes > 60)) return false;
      if (durationFilter === '60to120' && (act.durationMinutes < 60 || act.durationMinutes > 120)) return false;
      if (durationFilter === 'over120' && act.durationMinutes <= 120) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime);
      }
      if (sortBy === 'date-asc') {
        return a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime);
      }
      if (sortBy === 'duration-desc') {
        return b.durationMinutes - a.durationMinutes;
      }
      if (sortBy === 'duration-asc') {
        return a.durationMinutes - b.durationMinutes;
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [activities, searchQuery, selectedCategory, dateFilter, durationFilter, sortBy, preferences.startWeekOnMonday]);

  // Group activities by date for Timeline view
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const act of filteredActivities) {
      const existing = map.get(act.date) || [];
      existing.push(act);
      map.set(act.date, existing);
    }
    return Array.from(map.entries());
  }, [filteredActivities]);

  // Bulk selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredActivities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredActivities.map(a => a.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} activities?`)) {
      deleteMultipleActivities(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Date', 'Start Time', 'End Time', 'Duration (mins)', 'Status', 'Tags', 'Notes'];
    const rows = filteredActivities.map(a => {
      const cat = categories.find(c => c.id === a.categoryId)?.name || 'None';
      return [
        `"${a.id}"`,
        `"${a.title.replace(/"/g, '""')}"`,
        `"${cat}"`,
        `"${a.date}"`,
        `"${a.startTime}"`,
        `"${a.endTime}"`,
        a.durationMinutes,
        `"${a.status}"`,
        `"${(a.tags || []).join(', ')}"`,
        `"${(a.description || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chronicle_activities_${getTodayString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDuplicate = (act: Activity) => {
    addActivity({
      title: `${act.title} (Copy)`,
      description: act.description,
      categoryId: act.categoryId,
      date: getTodayString(),
      startTime: act.startTime,
      endTime: act.endTime,
      durationMinutes: act.durationMinutes,
      status: 'completed',
      tags: act.tags,
      energyLevel: act.energyLevel,
    });
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Activity Stream & History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {filteredActivities.length} recorded events matching your current filters
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle: Timeline vs Table */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Timeline flow view"
            >
              <GitCommit size={14} />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Data table view"
            >
              <Rows size={14} />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center space-x-1"
            title="Export filtered activities as CSV"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => openCreateActivityModal()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-1.5"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Record</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, notes, or tags (#work, #rfc...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value as DateFilter)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all">All Dates</option>
            <option value="today">Today Only</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Duration Filter */}
          <select
            value={durationFilter}
            onChange={e => setDurationFilter(e.target.value as DurationFilter)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all">Any Duration</option>
            <option value="under30">&lt; 30 mins (Sprint)</option>
            <option value="30to60">30m - 1 hr</option>
            <option value="60to120">1 - 2 hrs (Deep)</option>
            <option value="over120">&gt; 2 hrs (Marathon)</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="duration-desc">Longest Duration</option>
            <option value="duration-asc">Shortest Duration</option>
            <option value="title-asc">Title (A-Z)</option>
          </select>
        </div>

        {/* Bulk Action Bar if items selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold animate-scale-in">
            <span className="text-emerald-800 dark:text-emerald-300">
              {selectedIds.length} {selectedIds.length === 1 ? 'activity' : 'activities'} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center space-x-1"
              >
                <Trash2 size={13} />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {filteredActivities.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No matching activities found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or record a new activity.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setDateFilter('all');
              setDurationFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'timeline' ? (
        /* TIMELINE VIEW */
        <div className="space-y-8">
          {groupedByDate.map(([dateKey, acts]) => {
            const dayMinutes = acts.reduce((acc, a) => acc + a.durationMinutes, 0);
            return (
              <div key={dateKey} className="space-y-3">
                {/* Date Header Stamp */}
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs">
                    {formatDateDisplay(dateKey, 'full')}
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {formatDuration(dayMinutes)} total ({acts.length} acts)
                  </span>
                </div>

                {/* Vertical Timeline River */}
                <div className="relative pl-6 sm:pl-8 space-y-3 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {acts.map(act => {
                    const cat = categories.find(c => c.id === act.categoryId);
                    const isSelected = selectedIds.includes(act.id);
                    return (
                      <div
                        key={act.id}
                        className={`relative p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all group ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {/* Timeline Node Dot */}
                        <div
                          style={{ backgroundColor: cat?.color || '#6366f1' }}
                          className="absolute -left-[19px] sm:-left-[23px] top-5 w-3 h-3 rounded-full ring-4 ring-white dark:ring-slate-950 shadow-xs"
                        />

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(act.id)}
                              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                            />

                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {act.title}
                                </h3>
                                {act.energyLevel && (
                                  <span className="text-xs" title={`Energy Level: ${act.energyLevel}`}>
                                    {act.energyLevel === 'high' ? '⚡' : act.energyLevel === 'medium' ? '⚖️' : '🔋'}
                                  </span>
                                )}
                              </div>

                              {/* Metadata line */}
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                <span
                                  className="inline-flex items-center space-x-1 font-semibold"
                                  style={{ color: cat?.color || '#6366f1' }}
                                >
                                  <CategoryIcon name={cat?.icon || 'Tag'} size={13} />
                                  <span>{cat?.name || 'Uncategorized'}</span>
                                </span>
                                <span>•</span>
                                <span className="font-mono">
                                  {formatTimeDisplay(act.startTime, preferences.is24Hour)} - {formatTimeDisplay(act.endTime, preferences.is24Hour)}
                                </span>
                                <span>•</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                  {formatDuration(act.durationMinutes)}
                                </span>
                              </div>

                              {/* Description / Notes if present */}
                              {act.description && (
                                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                  {act.description}
                                </p>
                              )}

                              {/* Tags & External Link */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                {act.tags?.map(t => (
                                  <span
                                    key={t}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium"
                                  >
                                    #{t}
                                  </span>
                                ))}
                                {act.attachmentUrl && (
                                  <a
                                    href={act.attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium hover:underline"
                                  >
                                    <ExternalLink size={11} />
                                    <span>Attachment</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex items-center space-x-1 self-end sm:self-start opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditActivityModal(act)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit Activity"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDuplicate(act)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Duplicate to Today"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => deleteActivity(act.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Delete Activity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredActivities.length && filteredActivities.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                    />
                  </th>
                  <th className="p-3.5">Activity</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Time Window</th>
                  <th className="p-3.5 text-right">Duration</th>
                  <th className="p-3.5">Tags</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredActivities.map(act => {
                  const cat = categories.find(c => c.id === act.categoryId);
                  const isSelected = selectedIds.includes(act.id);
                  return (
                    <tr
                      key={act.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(act.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                        />
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        <div className="flex items-center space-x-2">
                          <span className="truncate">{act.title}</span>
                          {act.energyLevel && (
                            <span className="text-[10px] opacity-75">
                              {act.energyLevel === 'high' ? '⚡' : act.energyLevel === 'medium' ? '⚖️' : '🔋'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className="inline-flex items-center space-x-1.5 font-semibold px-2 py-0.5 rounded-md text-[11px]"
                          style={{
                            backgroundColor: `${cat?.color || '#6366f1'}15`,
                            color: cat?.color || '#6366f1',
                          }}
                        >
                          <CategoryIcon name={cat?.icon || 'Tag'} size={12} />
                          <span>{cat?.name || 'Uncategorized'}</span>
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {act.date}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {formatTimeDisplay(act.startTime, preferences.is24Hour)} - {formatTimeDisplay(act.endTime, preferences.is24Hour)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatDuration(act.durationMinutes)}
                      </td>
                      <td className="p-3.5 max-w-[150px] truncate">
                        <div className="flex items-center space-x-1 truncate">
                          {act.tags?.map(t => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openEditActivityModal(act)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(act)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                            title="Duplicate"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => deleteActivity(act.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
