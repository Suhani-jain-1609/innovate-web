import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'hover:border-amber-200',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'hover:border-rose-200',
      iconBg: 'bg-rose-100 text-rose-600',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'hover:border-blue-200',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'hover:border-purple-200',
      iconBg: 'bg-purple-100 text-purple-600',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`bg-white rounded-xl p-5 border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md ${scheme.border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center text-xs text-slate-500">
          {trend && (
            <span
              className={`font-semibold mr-1.5 ${
                trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

