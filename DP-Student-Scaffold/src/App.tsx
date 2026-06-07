import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Target, 
  Layout, 
  Type, 
  FileUp, 
  Sparkles, 
  AlertCircle,
  Loader2,
  X,
  FileText,
  CheckCircle,
  Sun,
  Moon,
  Frame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { ScaffoldView } from './components/ScaffoldView';
import { PaperType, TargetMarks, ParagraphFramework } from './types';

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
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('light');
  const theme = propIsDark !== undefined ? (propIsDark ? 'dark' : 'light') : localTheme;
  const setTheme = (newTheme: 'light' | 'dark') => {
    if (propToggleDark) {
      propToggleDark();
    } else {
      setLocalTheme(newTheme);
    }
  };

  const [paperType, setPaperType] = useState<PaperType>('Paper 1');
  const [targetMarks, setTargetMarks] = useState<TargetMarks>('10 marks');
  const [framework, setFramework] = useState<ParagraphFramework>('PEEL');
  const [useWordBank, setUseWordBank] = useState(true);
  const [question, setQuestion] = useState('');
  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [scaffoldData, setScaffoldData] = useState<{ scaffold: string; writingFrame: string }>({ scaffold: '', writingFrame: '' });
  const [viewMode, setViewMode] = useState<'scaffold' | 'frame'>('scaffold');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const generateScaffold = async (mode: 'scaffold' | 'frame' = 'scaffold') => {
    if (!question.trim()) {
      setError("Please enter an exam question prompt first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setViewMode(mode);

    const formData = new FormData();
    formData.append('paperType', paperType);
    formData.append('targetMarks', targetMarks);
    formData.append('framework', framework);
    formData.append('wordBankToggle', String(useWordBank));
    formData.append('question', question);
    formData.append('keywords', keywords);
    formData.append('mode', mode);
    formData.append('teacherCode', activeTeacherCode || '');
    if (file) {
      formData.append('attachment', file);
    }

    try {
      console.log(`Starting [${mode}] generation fetch...`);
      const response = await fetch('/api/scaffold/generate', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(`${errorData.error}: ${errorData.details || response.statusText}`);
        } else {
          throw new Error(`Critical Error: ${response.status}. Please check your alignment.`);
        }
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        // MERGE DATA so they are independent
        setScaffoldData(prev => ({
          scaffold: mode === 'scaffold' ? data.scaffold : prev.scaffold,
          writingFrame: mode === 'frame' ? data.writingFrame : prev.writingFrame
        }));
      } else {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse);
        throw new Error(`Invalid server response (not JSON). First 50 chars: ${textResponse.substring(0, 50)}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWarning = () => {
    if (framework === 'PEECAL' && (targetMarks === '2+2 marks' || targetMarks === '4 marks')) {
      return "Pro-tip: For low-mark questions, a simpler PEE framework might save valuable exam time.";
    }
    return null;
  };

  const warning = getWarning();

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 relative z-20 transition-colors">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-[#00b894] rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 cursor-default select-none">
            <Frame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 leading-none">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">Scaffold & Writing Frames</h1>
            </div>
            <p className="text-[10px] font-black text-[#00b894] uppercase tracking-[0.25em] mt-1.5 opacity-90">IB Diploma Response Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-[#00b894] transition-all"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {onBackToPortal && (
            <div className="flex items-center gap-3">
               <button onClick={onBackToPortal} className="px-5 py-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase rounded-lg hover:border-red-100 dark:hover:border-red-900/30 hover:text-red-500 transition-all">EXIT</button>
            </div>
          )}
          
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none mb-1">Standard</span>
            <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase leading-none">MAY 2026</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 bg-[#f8fafc] dark:bg-slate-950 items-stretch transition-colors">
        {/* Left Sidebar: Configuration */}
        <aside className="w-[340px] flex flex-col shrink-0 overflow-y-auto custom-scrollbar pr-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6 flex-1 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-[#00b894] rounded-full" /> ASSESSMENT DATA ENTRY
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/10 text-[#00b894] rounded uppercase tracking-tighter">{activeTeacherCode || "SKN"}</span>
            </div>
            
            {warning && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg flex gap-3 items-start">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 leading-tight">
                  {warning}
                </p>
              </div>
            )}
            
            <div className="space-y-6 flex-1">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Examination Paper</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Paper 1', 'Paper 2', 'Paper 3'] as PaperType[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPaperType(p)}
                      className={`py-2.5 text-xs font-black rounded-lg border transition-all ${paperType === p ? 'bg-[#00b894] border-[#00b894] text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-emerald-200 dark:hover:border-emerald-800'}`}
                    >
                      {p.replace('Paper ', 'P')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Max Score Target</label>
                <select 
                  value={targetMarks}
                  onChange={(e) => setTargetMarks(e.target.value as TargetMarks)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-[10px] font-black text-slate-500 dark:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                >
                   <option>2+2 marks</option>
                   <option>4 marks</option>
                   <option>3+3 marks</option>
                   <option>6 marks</option>
                   <option>10 marks</option>
                   <option>12 marks</option>
                   <option>16 marks</option>
                </select>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Paragraph Framework</label>
                <select 
                  value={framework}
                  onChange={(e) => setFramework(e.target.value as ParagraphFramework)}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-xs font-black focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${framework === 'PEECAL' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  <option>PEE</option>
                  <option>PEEL</option>
                  <option>PEECAL</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-4 border-y border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Word Bank Support</span>
                <button 
                  type="button"
                  onClick={() => setUseWordBank(!useWordBank)}
                  className={`w-11 h-6 rounded-full relative transition-all shadow-inner ${useWordBank ? 'bg-[#00b894]' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-300 rounded-full transition-all shadow-sm ${useWordBank ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

        </aside>

        {/* Right Area: Workspace */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[32%] shrink-0">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col group transition-colors">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex justify-between items-center px-1">
                EXAM QUESTION PROMPT
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full group-focus-within:animate-ping" />
              </label>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-5 text-sm font-medium resize-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none leading-relaxed transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-slate-200"
                placeholder="Type your official exam question prompt here..."
              />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col group transition-colors">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
                KNOWLEDGE CLOUD & EVIDENCE
              </label>
              <textarea 
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="flex-1 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-5 text-xs font-semibold resize-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 outline-none leading-relaxed transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-slate-200"
                placeholder="Enter key terms, theories, and case study anchors..."
              />
            </div>
          </div>

          <div className="flex-1 relative min-h-0 flex flex-col">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-12 border border-emerald-100 dark:border-emerald-900/30"
                >
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-widest animate-pulse">Analyzing Syllabus context...</h3>
                </motion.div>
              ) : error ? (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="h-full bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-12 flex flex-col items-center justify-center text-center"
                >
                  <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                  <h3 className="text-sm font-bold text-red-900 dark:text-red-400 uppercase">Generation Failed</h3>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 max-w-sm">{error}</p>
                </motion.div>
              ) : (scaffoldData.scaffold || scaffoldData.writingFrame) ? (
                <div key="scaffold-container" className="flex-1 min-h-0 relative">
                  <ScaffoldView 
                    scaffold={scaffoldData.scaffold} 
                    writingFrame={scaffoldData.writingFrame}
                    question={question} 
                    marks={targetMarks} 
                    initialViewMode={viewMode}
                  />
                </div>
              ) : (
                 <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl border-dashed flex flex-col items-center justify-center text-center p-6 transition-colors">
                   <div className="flex items-center gap-6 mb-6">
                     <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                           <Sparkles className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Workspace Ready</h3>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1 font-medium">Input metadata and build scaffold</p>
                     </div>

                     <div className="w-px h-20 bg-slate-100 dark:bg-slate-800" />

                     <div className="flex flex-col items-center">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 text-center p-4 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group ${file ? 'border-[#00b894] bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-700'}`}
                        >
                          {file ? (
                            <div className="text-emerald-600 dark:text-emerald-400 space-y-1">
                               <CheckCircle className="w-5 h-5 mx-auto" />
                               <p className="text-[7px] font-black uppercase tracking-tight text-[#00b894] line-clamp-2 px-1">{file.name}</p>
                               <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-[9px] text-red-400 font-bold hover:text-red-500 uppercase">Remove</button>
                            </div>
                          ) : (
                           <>
                             <FileUp className="w-5 h-5 text-slate-300 dark:text-slate-600 mb-2 group-hover:text-emerald-400 transition-colors" />
                             <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">upload content</p>
                           </>
                          )}
                          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                        </div>
                        <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-2">Optional Context</span>
                     </div>
                   </div>

                   <div className="flex gap-4">
                      {['AO1: Knowledge', 'AO2: Application', 'AO3: Analysis'].map(ao => (
                        <span key={ao} className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-800">{ao}</span>
                      ))}
                   </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 h-auto md:h-14 mt-6 w-full shrink-0">
            <button 
              onClick={() => generateScaffold('scaffold')}
              disabled={loading}
              className="flex-1 w-full h-full min-h-[48px] px-6 bg-[#00b894] hover:bg-[#00a884] disabled:bg-emerald-300 dark:disabled:bg-emerald-900/50 text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-emerald-100 dark:shadow-emerald-900/10 transition-all active:scale-[0.99] flex items-center justify-center gap-2 group"
            >
              <span>{loading && viewMode === 'scaffold' ? 'Building Scaffold...' : 'Generate Scaffold'}</span>
              <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            </button>
            <button 
              onClick={() => generateScaffold('frame')}
              disabled={loading}
              className="flex-1 w-full h-full min-h-[48px] px-6 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-slate-200 dark:shadow-slate-950/40 transition-all active:scale-[0.99] flex items-center justify-center gap-2 group"
            >
              <span>{loading && viewMode === 'frame' ? 'Building Frame...' : 'Generate Writing Frame'}</span>
              <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </main>

    </div>
  );
}
