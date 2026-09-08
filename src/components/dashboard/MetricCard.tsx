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
    <div className="p-4 sm:p-5 flex flex-col justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <span className="opacity-75 flex-shrink-0">
          {icon}
        </span>
      </div>

      <div className="mt-2.5 flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
          {value}
        </span>
        {badge && (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
            {subtitle}
          </span>
        )}

        {deltaPercent !== undefined && (
          <div className={`flex items-center space-x-1 font-mono text-[11px] font-medium ${
            deltaPercent > 0 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : deltaPercent < 0 
              ? 'text-rose-600 dark:text-rose-400' 
              : 'text-slate-400'
          }`}>
            {deltaPercent > 0 ? (
              <TrendingUp size={12} />
            ) : deltaPercent < 0 ? (
              <TrendingDown size={12} />
            ) : (
              <Minus size={12} />
            )}
            <span>{deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`}</span>
          </div>
        )}
      </div>
    </div>
  );
};
