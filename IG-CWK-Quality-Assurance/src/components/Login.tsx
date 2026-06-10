import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const VALID_CODES = ['SKN', 'CHE', 'SMK', 'JBO', 'SSH', 'JRD', 'JTE', 'CMA'];

export default function Login({ onLogin, isDarkMode, toggleDarkMode }: LoginProps) {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_CODES.includes(code.trim().toUpperCase()) && password === 'nichetourism') {
      onLogin();
    } else {
      setError('Invalid teacher code or password');
    }
  };

  return (
    <div className={`min-h-screen w-full bg-[#f8f9fc] dark:bg-slate-900 flex flex-col relative font-sans transition-colors ${isDarkMode ? 'dark' : ''}`}>
      <div className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer transition-colors" onClick={toggleDarkMode}>
        {isDarkMode ? <Sun className="w-6 h-6 stroke-[1.5]" /> : <Moon className="w-6 h-6 stroke-[1.5]" />}
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white dark:bg-slate-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-12 py-14 border border-slate-100/50 dark:border-slate-700/50 flex flex-col items-center transition-colors">
          
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white text-3xl font-bold tracking-tight">IG</span>
          </div>

          <h1 className="text-[21px] font-black text-slate-900 dark:text-slate-100 mb-2 text-center">CWK Quality Assurance Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold tracking-[0.1em] mb-10 uppercase">
            Enter Teacher Credentials
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <input
                type="text"
                placeholder="ENTER TEACHER CODE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3.5 rounded-md border border-blue-600 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-center text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200 placeholder:text-slate-400/80 uppercase"
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="ENTER PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-md border border-blue-600 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-center text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200 placeholder:text-slate-400/80"
              />
            </div>

            {error && <p className="text-red-500 text-[11px] text-center font-bold tracking-wide uppercase pt-1">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-md transition-colors mt-2 uppercase tracking-widest text-[13px] shadow-sm"
            >
              Login
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
