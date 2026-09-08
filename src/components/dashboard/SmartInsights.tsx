import React from 'react';
import { Zap, CheckCircle2, TrendingUp, Focus, HeartPulse, Compass } from 'lucide-react';
import { SmartInsight } from '../../types';

interface SmartInsightsProps {
  insights: SmartInsight[];
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({ insights }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap size={16} className="text-amber-500" />;
      case 'CheckCircle2': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'TrendingUp': return <TrendingUp size={16} className="text-blue-500" />;
      case 'Focus': return <Focus size={16} className="text-indigo-500" />;
      case 'HeartPulse': return <HeartPulse size={16} className="text-rose-500" />;
      default: return <Compass size={16} className="text-emerald-500" />;
    }
  };

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Compass size={15} className="text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Activity Patterns & Observations
          </h3>
        </div>
        <span className="text-[10px] font-mono tracking-wide px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          Based on your logged time
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {insights.map(ins => (
          <div
            key={ins.id}
            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="flex-shrink-0">{getIcon(ins.icon)}</span>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {ins.title}
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {ins.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
