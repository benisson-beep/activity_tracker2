import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  deltaPercent?: number;
  icon: React.ReactNode;
  color?: string;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  deltaPercent,
  icon,
  badge,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
          {value}
        </span>
        {badge && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </span>
        )}

        {deltaPercent !== undefined && (
          <div className={`flex items-center space-x-1 font-semibold ${
            deltaPercent > 0 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : deltaPercent < 0 
              ? 'text-rose-600 dark:text-rose-400' 
              : 'text-slate-400'
          }`}>
            {deltaPercent > 0 ? (
              <TrendingUp size={13} />
            ) : deltaPercent < 0 ? (
              <TrendingDown size={13} />
            ) : (
              <Minus size={13} />
            )}
            <span>{deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`} vs yesterday</span>
          </div>
        )}
      </div>
    </div>
  );
};
