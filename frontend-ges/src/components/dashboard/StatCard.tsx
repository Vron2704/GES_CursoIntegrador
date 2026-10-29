import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  unit?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  colorScheme: 'emerald' | 'blue' | 'amber' | 'indigo' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  unit,
  trend,
  icon: Icon,
  colorScheme,
  onClick,
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
      badge: 'bg-emerald-100 text-emerald-800',
      ring: 'hover:border-emerald-300',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-200/80',
      badge: 'bg-blue-100 text-blue-800',
      ring: 'hover:border-blue-300',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-200/80',
      badge: 'bg-amber-100 text-amber-800',
      ring: 'hover:border-amber-300',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
      badge: 'bg-indigo-100 text-indigo-800',
      ring: 'hover:border-indigo-300',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-200/80',
      badge: 'bg-purple-100 text-purple-800',
      ring: 'hover:border-purple-300',
    },
  };

  const style = colorStyles[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + style.ring : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${style.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {unit}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-slate-500 font-medium truncate">{subtitle}</span>
        )}
        {trend && (
          <span
            className={`px-1.5 py-0.5 rounded-md font-bold text-[11px] shrink-0 ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
