import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
};

