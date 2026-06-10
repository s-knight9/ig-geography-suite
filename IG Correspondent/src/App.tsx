import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, RefreshCw, Moon, Sun, LogOut, User, Globe } from 'lucide-react';
import { OutletData, TAG_COLORS, TAG_LABELS } from './types.ts';
import { DailyPolls } from './components/DailyPolls.tsx';

export default function App({
  onBackToPortal,
  activeUserEmail,
  activeTeacherCode,
  isDark: propIsDark,
  toggleDark: propToggleDark
}: {
  onBackToPortal?: () => void;
  activeUserEmail?: string;
  activeTeacherCode?: string;
  isDark?: boolean;
  toggleDark?: () => void;
}) {
  const [data, setData] = useState<Record<string, OutletData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOutlets, setExpandedOutlets] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [localIsDark, setLocalIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const isDark = propIsDark !== undefined ? propIsDark : localIsDark;
  const toggleDark = propToggleDark !== undefined ? propToggleDark : () => {
    setLocalIsDark(!localIsDark);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error(`Failed to fetch news (Status: ${response.status})`);
      }
      const json = await response.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to fetch news:', err);
      setError(err.message || 'An unexpected error occurred while fetching news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleOutlet = (id: string) => {
    setExpandedOutlets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-6 rounded-2xl mb-6 border border-red-500/20 max-w-md shadow-sm">
          <h2 className="text-lg font-black uppercase tracking-wider mb-2">Sync Failed</h2>
          <p className="text-sm font-semibold">{error}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Please make sure the backend server is running and the Gemini API key is configured.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={fetchData}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold tracking-widest uppercase text-xs py-3 px-6 rounded-md transition-colors cursor-pointer shadow-sm"
          >
            Retry Connection
          </button>
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold tracking-widest uppercase text-xs py-3 px-6 rounded-md transition-all cursor-pointer"
            >
              Exit to Portal
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="mb-4"
        >
          <RefreshCw className="w-12 h-12 text-[#2563eb]" />
        </motion.div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 animate-pulse font-sans tracking-tight">SCANNING GLOBAL PRESS...</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 italic font-sans text-sm">Cambridge International Education Intelligence</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-900 flex flex-col font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* Header - Styled to match image */}
      <header className="h-20 bg-white dark:bg-slate-950 flex items-center justify-between px-6 border-b border-slate-300 dark:border-slate-800 flex-shrink-0 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="bg-[#2563eb] w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-[#2563eb]/20">
            <span className="text-white font-bold text-xl tracking-tighter">IG</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-200 tracking-tighter leading-none">
              Correspondent
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 tracking-tight">
              Breaking global news, instantly mapped to your syllabus
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Status Label (from original) */}
          <div className="hidden lg:flex items-center space-x-2 mr-4 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gemini 3.5 Active</span>
          </div>

          {/* User Card - Styled after image */}
          <div className="flex items-center bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb] mr-3">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {activeUserEmail || "SKN@school.com"}
              </p>
              <p className="text-[9px] font-bold text-[#2563eb] tracking-wider uppercase">
                {activeTeacherCode ? `Teacher initials: ${activeTeacherCode}` : "Student Profile"}
              </p>
            </div>
          </div>

          <button
            onClick={toggleDark}
            className={`p-2.5 rounded-full border transition-all duration-300 ${isDark ? 'border-amber-400/30 text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={onBackToPortal}
            className="p-2.5 rounded-full border border-rose-100 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all cursor-pointer"
            title="Exit to Portal"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Hero / Daily Poll Section */}
      <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-300 dark:border-slate-800">
        <div className="p-4">
          <DailyPolls activeUserEmail={activeUserEmail} />
        </div>
      </div>

      {/* News Grid Header */}
      <div className="px-4 pt-6 pb-1">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#2563eb] dark:text-[#60a5fa]" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">Fresh off the Press</h2>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="flex-grow px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data && (Object.entries(data) as [string, OutletData][]).map(([id, outlet]) => (
          <section
            key={id}
            className="bg-white dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-800 flex flex-col overflow-hidden self-start shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleOutlet(id)}
              className="px-4 py-3 flex items-center justify-between w-full group transition-all"
              style={{ backgroundColor: outlet.color, color: outlet.textColor }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded bg-white flex items-center justify-center p-0.5 shadow-sm border border-black/5 overflow-hidden">
                  <img
                    src={outlet.logo}
                    alt={outlet.name}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Remove only the problematic image if it completely fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className="font-black text-xs uppercase tracking-[0.2em]">{outlet.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full uppercase font-bold opacity-70">
                  {outlet.items.length}
                </span>
                {expandedOutlets[id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expandedOutlets[id] && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-1 max-h-[450px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                    {outlet.items.map((item, idx) => (
                      <div key={idx} className="p-3 space-y-2 group hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[13px] leading-tight hover:text-blue-700 dark:hover:text-blue-400 block transition-colors"
                        >
                          {item.title}
                        </a>

                        {item.tags && item.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.tags.map(tag => (
                              <span
                                key={tag}
                                className={`px-2 py-0.5 rounded-full text-[10.5px] font-black tracking-wider border shadow-sm transition-transform hover:scale-105 cursor-default ${TAG_COLORS[tag] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}
                                title={TAG_LABELS[tag]}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="h-[2px] w-8 bg-slate-100 dark:bg-slate-800 rounded-full mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        ))}
      </main>

      {/* Key Legend Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-300 dark:border-slate-800 px-6 py-2 flex items-center justify-between text-[10px] font-bold text-slate-400 sticky bottom-0 z-40">
        <div className="flex items-center space-x-4 uppercase tracking-tighter overflow-x-auto no-scrollbar py-1">
          {Object.entries(TAG_LABELS).map(([tag, label]) => (
            <div key={tag} className="flex items-center space-x-1.5 shrink-0 group cursor-default">
              <span className={`w-3 h-3 rounded-full border shadow-sm ${TAG_COLORS[tag].split(' text-')[0]}`}></span>
              <span className="group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors uppercase tracking-tight">{tag}: {label}</span>
            </div>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1 hover:text-[#2563eb] transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Force Sync
          </button>
        </div>
      </footer>
    </div>
  );
}
