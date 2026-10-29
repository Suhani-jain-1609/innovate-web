import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  const config = {
    present: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',

    late: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    upcoming: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',
    enrolled: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',

    absent: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400/10',
    'half-day': 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10',
    'on-leave': 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10',
  };

  const style = config[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${style}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const normalized = (role || '').toLowerCase();

  const labels = {
    admin: 'HR Admin',
    manager: 'Manager',
    employee: 'Employee',
  };

  const styles = {
    admin: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    manager: 'bg-sky-100 text-sky-800 border-sky-200',
    employee: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
        styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {labels[normalized] || role}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    urgent: 'bg-red-500 text-white',
    high: 'bg-amber-500 text-white',
    normal: 'bg-blue-500 text-white',
    low: 'bg-slate-400 text-white',
  };

  return (
    <span
      className={`px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded ${
        styles[priority?.toLowerCase()] || styles.normal
      }`}
    >
      {priority}
    </span>
  );
};

