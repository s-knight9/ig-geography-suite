import React from 'react';

export default function LoadingView({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className={`flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 items-center justify-center ${isDarkMode ? 'dark' : ''}`}>
        <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Analyzing Coursework...</h2>
        <p className="text-slate-500 font-medium max-w-md text-center">
          The AI engine is currently evaluating the student draft against the Route-to-Enquiry criteria. This may take a few moments.
        </p>
    </div>
  );
}
