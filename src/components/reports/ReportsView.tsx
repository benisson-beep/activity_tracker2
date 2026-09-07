import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Copy, 
  Printer, 
  Download, 
  Check, 
  Calendar as CalendarIcon, 
  Clock, 
  Target, 
  Share2
} from 'lucide-react';
import { useActivity } from '../../context/ActivityContext';
import { useAuth } from '../../context/AuthContext';
import { analyticsEngine } from '../../lib/analyticsEngine';
import { 
  getTodayString, 
  parseDateString, 
  toDateString, 
  getWeekDays, 
  formatDuration, 
  formatDateDisplay, 
  formatTimeDisplay 
} from '../../lib/dateUtils';
import { Activity, Category, Goal } from '../../types';

type ReportType = 'daily' | 'weekly' | 'monthly';

export const ReportsView: React.FC = () => {
  const { activities, categories, goals, preferences, showToast } = useActivity();
  const { currentUser } = useAuth();

  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayString());
  const [copied, setCopied] = useState(false);

  // Activities filtered by report period
  const reportData = useMemo(() => {
    const baseDate = parseDateString(selectedDateStr);

    if (reportType === 'daily') {
      const dayActs = activities.filter(a => a.date === selectedDateStr);
      const totalMinutes = dayActs.reduce((acc, a) => acc + a.durationMinutes, 0);
      const categoryBreakdown = analyticsEngine.getCategoryBreakdown(dayActs, categories);

      return {
        title: `Daily Debrief: ${formatDateDisplay(selectedDateStr, 'full')}`,
        subtitle: `Truth-of-day summary for ${currentUser.name}`,
        dateRange: selectedDateStr,
        activities: dayActs,
        totalMinutes,
        totalHours: Number((totalMinutes / 60).toFixed(1)),
        count: dayActs.length,
        categoryBreakdown,
      };
    }

    if (reportType === 'weekly') {
      const week = getWeekDays(baseDate, preferences.startWeekOnMonday);
      const startStr = toDateString(week[0]);
      const endStr = toDateString(week[6]);
      const weekActs = activities.filter(a => a.date >= startStr && a.date <= endStr);
      const totalMinutes = weekActs.reduce((acc, a) => acc + a.durationMinutes, 0);
      const categoryBreakdown = analyticsEngine.getCategoryBreakdown(weekActs, categories);
      const dailyRhythm = analyticsEngine.getWeeklyRhythm(activities, baseDate, preferences.startWeekOnMonday);

      return {
        title: `Weekly Retrospective (${formatDateDisplay(startStr, 'short')} - ${formatDateDisplay(endStr, 'short')})`,
        subtitle: `Comprehensive 7-day time allocation audit for ${currentUser.name}`,
        dateRange: `${startStr} to ${endStr}`,
        activities: weekActs,
        totalMinutes,
        totalHours: Number((totalMinutes / 60).toFixed(1)),
        count: weekActs.length,
        categoryBreakdown,
        dailyRhythm,
      };
    }

    // Monthly
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const monthActs = activities.filter(a => a.date >= startStr && a.date <= endStr);
    const totalMinutes = monthActs.reduce((acc, a) => acc + a.durationMinutes, 0);
    const categoryBreakdown = analyticsEngine.getCategoryBreakdown(monthActs, categories);

    return {
      title: `Monthly Overview: ${baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      subtitle: `Executive monthly time investment analysis for ${currentUser.name}`,
      dateRange: `${startStr} to ${endStr}`,
      activities: monthActs,
      totalMinutes,
      totalHours: Number((totalMinutes / 60).toFixed(1)),
      count: monthActs.length,
      categoryBreakdown,
    };
  }, [reportType, selectedDateStr, activities, categories, currentUser, preferences.startWeekOnMonday]);

  // Generate clean Markdown representation
  const generateMarkdown = () => {
    let md = `# ${reportData.title}\n`;
    md += `*${reportData.subtitle}*\n\n`;
    md += `**Total Time Logged:** ${formatDuration(reportData.totalMinutes)} (${reportData.totalHours} hours) across ${reportData.count} sessions.\n\n`;
    
    md += `## Category Allocation\n`;
    reportData.categoryBreakdown.forEach(cat => {
      md += `- **${cat.name}:** ${formatDuration(cat.minutes)} (${cat.percentage}%, ${cat.count} activities)\n`;
    });
    md += `\n`;

    md += `## Activity Log Breakdown\n`;
    reportData.activities.forEach(act => {
      const cat = categories.find(c => c.id === act.categoryId)?.name || 'General';
      md += `### ${act.title} (${cat})\n`;
      md += `- **Time:** ${act.date} • ${act.startTime} - ${act.endTime} (${formatDuration(act.durationMinutes)})\n`;
      if (act.description) md += `- **Notes:** ${act.description}\n`;
      if (act.tags && act.tags.length > 0) md += `- **Tags:** #${act.tags.join(' #')}\n`;
      md += `\n`;
    });

    md += `\n---\n*Generated with Chronicle Activity Tracker*`;
    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    showToast('Report copied to clipboard as Markdown!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Activity Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review your time summaries and export your records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Report Type Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['daily', 'weekly', 'monthly'] as ReportType[]).map(t => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  reportType === t
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Reference Date Picker */}
          <input
            type="date"
            value={selectedDateStr}
            onChange={e => setSelectedDateStr(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
          />

          {/* Actions */}
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            title="Copy as clean Markdown for Notion/Slack/Email"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            title="Print or Save as PDF"
          >
            <Printer size={14} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 max-w-4xl mx-auto">
        {/* Report Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              {reportType.toUpperCase()} SUMMARY REPORT
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
              {reportData.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {reportData.subtitle}
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-6">
            <span className="text-xs font-semibold text-slate-400 block">Total Investment</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatDuration(reportData.totalMinutes)}
            </span>
            <span className="text-xs font-mono text-slate-500 block mt-0.5">
              {reportData.count} sessions logged
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Category Time Allocation
          </h3>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Hours</th>
                  <th className="p-3 text-right">Percentage</th>
                  <th className="p-3 text-right">Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.categoryBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">
                      No activities logged for this timeframe.
                    </td>
                  </tr>
                ) : (
                  reportData.categoryBreakdown.map(cat => (
                    <tr key={cat.id}>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatDuration(cat.minutes)}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {cat.percentage}%
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        {cat.count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chronological Activities Log */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Recorded Activity Detail Log
          </h3>

          <div className="space-y-3">
            {reportData.activities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No activities to display.</p>
            ) : (
              reportData.activities.map(act => {
                const cat = categories.find(c => c.id === act.categoryId);
                return (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {act.title}
                        </span>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: `${cat?.color || '#6366f1'}20`,
                            color: cat?.color || '#6366f1',
                          }}
                        >
                          {cat?.name}
                        </span>
                      </div>
                      {act.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {act.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs font-mono self-end sm:self-center flex-shrink-0">
                      <span className="text-slate-500">
                        {act.date} • {act.startTime} - {act.endTime}
                      </span>
                      <span className="font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white">
                        {formatDuration(act.durationMinutes)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Stamp */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Chronicle Activity Intelligence Platform</span>
          <span className="font-mono">Generated: {new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
