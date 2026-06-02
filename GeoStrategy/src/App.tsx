import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Layout, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Upload, 
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  GraduationCap,
  Moon,
  Sun
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { generateEssayPlan, type EssayInput } from './lib/gemini';
import { downloadAsDocx } from './lib/export';

type Step = 'question' | 'planning' | 'sources' | 'conclusion' | 'result';

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
  const [currentStep, setCurrentStep] = useState<Step>('question');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const [localIsDarkMode, setLocalIsDarkMode] = useState(false);
  const isDarkMode = propIsDark !== undefined ? propIsDark : localIsDarkMode;
  const toggleDarkMode = propToggleDark ? propToggleDark : () => setLocalIsDarkMode(!localIsDarkMode);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const [formData, setFormData] = useState<EssayInput>({
    question: '',
    marks: '12',
    keyTerms: '',
    paragraphFocuses: [''],
    concepts: [''],
    conceptualPillars: [],
    structure: 'PEEL',
    sources: [],
    conclusionStance: ''
  });

  const GEOGRAPHIC_PILLARS = [
    { id: 'place', label: 'Place', category: '4P' },
    { id: 'process', label: 'Process', category: '4P' },
    { id: 'power', label: 'Power', category: '4P' },
    { id: 'possibilities', label: 'Possibilities', category: '4P' },
    { id: 'scale', label: 'Scale', category: '2S' },
    { id: 'spatial_interaction', label: 'Spatial Interaction', category: '2S' },
  ];

  const togglePillar = (id: string) => {
    setFormData(prev => ({
      ...prev,
      conceptualPillars: prev.conceptualPillars.includes(id)
        ? prev.conceptualPillars.filter(p => p !== id)
        : [...prev.conceptualPillars, id]
    }));
  };

  const handleAddField = (field: 'paragraphFocuses' | 'concepts') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveField = (field: 'paragraphFocuses' | 'concepts', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFieldChange = (field: 'paragraphFocuses' | 'concepts', index: number, value: string) => {
    const newArr = [...formData[field]];
    newArr[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArr }));
  };

  const onDrop = (acceptedFiles: File[]) => {
    setFormData(prev => ({
      ...prev,
      sources: [...prev.sources, ...acceptedFiles.map(file => ({ url: '', file }))]
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'text/markdown': ['.md']
    }
  });

  const handleGenerate = async () => {
    setLoading(true);
    setCurrentStep('result');
    try {
      const { plan, synopses } = await generateEssayPlan(formData);
      setResult(plan || "Failed to generate plan.");
      
      // Update sources with synopses if available
      if (Object.keys(synopses).length > 0) {
        setFormData(prev => ({
          ...prev,
          sources: prev.sources.map(source => {
            const fileName = source.file?.name;
            const url = source.url;
            const key = fileName || url;
            
            if (!key) return source;
            
            // Direct match
            if (synopses[key]) {
              return { ...source, synopsis: synopses[key] };
            }
            
            // Fuzzy match (case insensitive or partial)
            const fuzzyKey = Object.keys(synopses).find(k => 
              k.toLowerCase() === key.toLowerCase() || 
              key.toLowerCase().includes(k.toLowerCase()) ||
              k.toLowerCase().includes(key.toLowerCase())
            );
            
            if (fuzzyKey) {
              return { ...source, synopsis: synopses[fuzzyKey] };
            }
            
            return source;
          })
        }));
      }
    } catch (err: any) {
      console.error("Gemini Error:", err);
      if (err.message === "API_KEY_MISSING") {
        setResult("Your Gemini API Key is missing. Please ensure you've added it as 'GEOG_APP_KEY_V1' (or 'GEMINI_API_KEY') in the Secrets panel AND clicked the 'Apply changes' button.");
      } else if (err.message?.startsWith("UNSUPPORTED_FILE_TYPE:")) {
        const fileName = err.message.split(":")[1];
        setResult(`The file "${fileName}" is not supported. Gemini currently only supports PDF, Images, and Text files. Please convert your PowerPoint/Word documents to PDF and try again.`);
      } else if (err.message === "INVALID_API_KEY") {
        setResult("Your Gemini API Key appears to be invalid. Please double-check it in the Secrets panel, ensure there are no leading/trailing spaces, and click 'Apply changes'.");
      } else if (err.message?.includes("403") || err.message?.includes("permission")) {
        setResult("Access Denied: Your API key might not have permission for the Pro model, or it hasn't been activated yet. Try checking your Google AI Studio dashboard.");
      } else {
        setResult(`An error occurred: ${err.message || "Unknown error"}. Please ensure your API key is correct in the Secrets panel.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: 'question', label: 'Question Analysis', icon: BookOpen },
    { id: 'planning', label: 'Manual Planning', icon: Layout },
    { id: 'sources', label: 'Evidence & Sources', icon: Globe },
    { id: 'conclusion', label: 'Final Stance', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-8 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00b875] rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-black text-xl tracking-tighter">DP</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#00b875] leading-none">GeoStrategy</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] font-extrabold tracking-[0.2em] text-slate-400 uppercase">The DP Geo Essay Planning Studio</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => toggleDarkMode()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-400" />}
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {isDarkMode ? 'Light' : 'Dark'}
            </span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 whitespace-nowrap">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">System Ready</span>
          </div>

          {onBackToPortal && (
            <button 
              onClick={onBackToPortal}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 rounded-full shadow-sm border border-red-100 dark:border-red-500/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">EXIT</span>
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-wrap gap-3">
          {steps.map((step, idx) => (
            <button 
              key={step.id} 
              onClick={() => setCurrentStep(step.id)}
              className={cn(
                "px-6 py-2.5 rounded-full transition-all flex items-center gap-3 text-xs font-bold uppercase tracking-widest",
                currentStep === step.id 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900 hover:text-emerald-500 shadow-sm"
              )}
            >
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                currentStep === step.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
              )}>{idx + 1}</span>
              {step.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {currentStep === 'question' && (
            <motion.div 
              key="question"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-12 gap-8"
            >
              <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                      <BookOpen size={18} />
                    </div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">01. Essay Question</label>
                  </div>
                  <textarea 
                    className="w-full min-h-[160px] text-2xl font-bold border-none focus:ring-0 p-0 placeholder:text-slate-200 dark:placeholder:text-slate-700 resize-none leading-tight text-slate-800 dark:text-slate-100 bg-transparent"
                    placeholder="Type your essay prompt here..."
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  />
                  <div className="flex flex-wrap mt-8 gap-3 pt-8 border-t border-slate-50 dark:border-slate-800">
                    {['10', '12', '16'].map(mark => (
                      <button 
                        key={mark}
                        onClick={() => setFormData(prev => ({ ...prev, marks: mark as any }))}
                        className={cn(
                          "px-6 py-2.5 rounded-full text-xs font-bold transition-all",
                          formData.marks === mark 
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                            : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                      >
                        {mark} MARKS
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                      <Layout size={18} />
                    </div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">02. Key Term Definitions</label>
                  </div>
                  <textarea 
                    className="w-full min-h-[120px] bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-700 font-medium text-slate-600 dark:text-slate-400 leading-relaxed border-none"
                    placeholder="Add terms to define in your introduction..."
                    value={formData.keyTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, keyTerms: e.target.value }))}
                  />
                </section>
              </div>

              <div className="col-span-12 md:col-span-4 flex flex-col justify-end">
                <button 
                  onClick={() => setCurrentStep('planning')}
                  className="w-full bg-emerald-500 text-white px-8 py-6 rounded-3xl font-bold text-lg uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale disabled:hover:translate-y-0"
                  disabled={!formData.question}
                >
                  Start Planning <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'planning' && (
            <motion.div 
              key="planning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-12 gap-8"
            >
              <div className="col-span-12 md:col-span-7 flex flex-col gap-6">
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center">
                        <FileText size={18} />
                      </div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">03. Body Paragraph Focuses</label>
                    </div>
                    <button 
                      onClick={() => handleAddField('paragraphFocuses')}
                      className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-lg hover:bg-emerald-500 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.paragraphFocuses.map((focus, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="flex-none w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <input 
                          className="flex-1 text-sm font-bold border-b border-slate-100 dark:border-slate-800 py-1 focus:outline-none focus:border-emerald-500 transition-colors bg-transparent text-slate-800 dark:text-slate-100"
                          placeholder="Add paragraph focus..."
                          value={focus}
                          onChange={(e) => handleFieldChange('paragraphFocuses', idx, e.target.value)}
                        />
                        <button 
                          onClick={() => handleRemoveField('paragraphFocuses', idx)}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-700 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center">
                        <Sparkles size={18} />
                      </div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">04. Concepts & Perspectives</label>
                    </div>
                    <button 
                      onClick={() => handleAddField('concepts')}
                      className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-10">
                    {formData.concepts.map((concept, idx) => (
                      <div key={idx} className="flex bg-slate-50 dark:bg-slate-950 rounded-full items-center pl-4 pr-1 py-1 border border-slate-100 dark:border-slate-800">
                        <input 
                          className="bg-transparent text-[10px] font-bold uppercase tracking-widest border-none focus:ring-0 w-24 text-slate-600 dark:text-slate-400"
                          placeholder="Concept..."
                          value={concept}
                          onChange={(e) => handleFieldChange('concepts', idx, e.target.value)}
                        />
                        <button 
                          onClick={() => handleRemoveField('concepts', idx)}
                          className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 flex items-center justify-center transition-all shadow-sm"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">Conceptual Lenses</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {GEOGRAPHIC_PILLARS.map((pillar) => (
                        <button
                          key={pillar.id}
                          onClick={() => togglePillar(pillar.label)}
                          className={cn(
                            "px-4 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all text-left flex items-center justify-between group",
                            formData.conceptualPillars.includes(pillar.label)
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-emerald-200 dark:hover:border-emerald-900 hover:text-emerald-500"
                          )}
                        >
                          {pillar.label}
                          <CheckCircle2 size={14} className={cn("transition-all", formData.conceptualPillars.includes(pillar.label) ? "opacity-100 scale-100" : "opacity-0 scale-50")} />
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <div className="col-span-12 md:col-span-5 flex flex-col gap-6">
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
                  <div className="relative">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-6">05. Essay Framework</label>
                    <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl mb-8">
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, structure: 'PEEL' }))}
                        className={cn(
                          "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                          formData.structure === 'PEEL' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
                        )}
                      >
                        PEEL
                      </button>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, structure: 'PEECAL' }))}
                        className={cn(
                          "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                          formData.structure === 'PEECAL' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
                        )}
                      >
                        PEECAL
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(formData.structure === 'PEEL' ? ['Point', 'Evidence', 'Explain', 'Link'] : ['Point', 'Evidence', 'Explain', 'Counter', 'Analysis', 'Link']).map((label) => (
                        <div key={label} className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 border-dashed">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 text-center">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <div className="mt-auto flex gap-4">
                  <button 
                    onClick={() => setCurrentStep('question')}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-5 rounded-3xl font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setCurrentStep('sources')}
                    className="flex-1 bg-emerald-500 border border-emerald-400 py-5 rounded-3xl font-bold uppercase tracking-widest text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'sources' && (
            <motion.div 
              key="sources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-12 gap-8"
            >
              <div className="col-span-12 md:col-span-8 space-y-8">
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                      <Globe size={18} />
                    </div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">06. Source Materials</label>
                  </div>
                  <div 
                    {...getRootProps()} 
                    className={cn(
                      "rounded-3xl border-2 border-dashed p-16 transition-all flex flex-col items-center justify-center gap-6 cursor-pointer",
                      isDragActive 
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20" 
                        : "border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900 bg-slate-50/30 dark:bg-slate-950/30"
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/5">
                      <Upload size={32} strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-800 dark:text-slate-100">Upload Geog Evidence</p>
                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-600 mt-2 tracking-widest">PDF, Images or Lesson Notes</p>
                    </div>
                  </div>

                  {formData.sources.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                      {formData.sources.map((source, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                              source.file ? "bg-emerald-400" : "bg-blue-400"
                            )}>
                              {source.file ? <FileText size={18} /> : <Globe size={18} />}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{source.file ? source.file.name : source.url}</p>
                              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1">{source.file ? 'File Upload' : 'Web Link'}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              sources: prev.sources.filter((_, i) => i !== idx)
                            }))}
                            className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="col-span-12 md:col-span-4 flex flex-col justify-end">
                <button 
                  onClick={() => setCurrentStep('conclusion')}
                  className="w-full bg-emerald-500 text-white px-8 py-6 rounded-3xl font-bold text-lg uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-4"
                >
                  Conclusion Strategy <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'conclusion' && (
            <motion.div 
              key="conclusion"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-12 gap-8"
            >
              <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
                <section className="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-[2.5rem] p-10 border border-emerald-100 dark:border-emerald-900 transition-colors relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full blur-3xl"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center">
                        <MessageSquare size={18} />
                      </div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#00b875]">07. Conclusion Strategy</label>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400 mb-8 max-w-2xl bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-white dark:border-slate-800">
                      Final judgment should evaluate the spatial variations and overall efficacy of geographic processes or management strategies.
                    </p>
                    
                    <textarea 
                      className="w-full min-h-[220px] bg-white dark:bg-slate-900 rounded-3xl p-10 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-200 dark:placeholder:text-slate-800 text-slate-800 dark:text-slate-100 font-bold italic text-xl leading-relaxed shadow-sm border border-emerald-100 dark:border-emerald-900"
                      placeholder="e.g., 'I agree to a large extent that management strategies succeed when local stakeholders are involved, however...'"
                      value={formData.conclusionStance}
                      onChange={(e) => setFormData(prev => ({ ...prev, conclusionStance: e.target.value }))}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-10">
                      {['I agree to a large extent...', 'The evidence suggests that...', 'While globally true, locally...'].map((snippet) => (
                        <button 
                          key={snippet}
                          onClick={() => setFormData(prev => ({ ...prev, conclusionStance: snippet }))}
                          className="p-5 bg-white/80 dark:bg-slate-800/80 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all text-slate-500 dark:text-slate-400 hover:text-emerald-500 text-left border border-white dark:border-slate-700"
                        >
                          {snippet}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <div className="col-span-12 md:col-span-4 flex flex-col justify-end gap-6">
                <div className="bg-[#1e293b] dark:bg-slate-900 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden group border dark:border-slate-800">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <GraduationCap size={80} strokeWidth={1} />
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <GraduationCap size={20} className="text-white" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Moderator Tip</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300 font-medium italic">
                      "Ensure your conclusion directly returns to the phrasing of the question. Evaluative language must be sustained throughout the final verdict."
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  className="w-full bg-[#00b875] text-white px-8 py-8 rounded-[2rem] font-extrabold text-2xl tracking-tight shadow-2xl shadow-emerald-500/30 hover:bg-[#00a368] transition-all flex items-center justify-center gap-6 group"
                  disabled={!formData.conclusionStance}
                >
                  <Sparkles size={36} className="group-hover:rotate-12 transition-transform" />
                  GENERATE PLAN
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-8">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-slate-100 dark:border-slate-900 rounded-full" />
                    <div className="w-24 h-24 border-4 border-t-[#00b875] rounded-full animate-spin absolute top-0" />
                  </div>
                  <div className="text-center space-y-4">
                    <h3 className="font-extrabold text-2xl tracking-tight text-slate-800 dark:text-slate-100">Architecting Response...</h3>
                    <div className="flex gap-1.5 justify-center">
                      {[0, 1, 2].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                          className="w-2 h-2 bg-[#00b875] rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-soft mb-20 overflow-hidden border border-slate-100/50 dark:border-slate-800">
                  <div className="bg-white dark:bg-slate-900 px-10 py-10 flex flex-col md:flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800 gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-[1.5rem] flex items-center justify-center text-[#00b875]">
                        <Sparkles size={32} />
                      </div>
                      <div className="text-center md:text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Plan Synthesis</h2>
                        <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mt-2">
                          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">{formData.marks} Marks</span>
                          <span className="w-1.5 h-1.5 bg-emerald-200 dark:bg-emerald-800 rounded-full"></span>
                          <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500">{formData.structure}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => window.print()}
                        className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-emerald-500 hover:shadow-md transition-all border border-slate-100 dark:border-slate-700"
                      >
                        <Upload size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-10 md:p-16 prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-headings:font-extrabold prose-headings:tracking-tight prose-strong:text-emerald-600 dark:prose-strong:text-emerald-400 prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-li:text-slate-600 dark:prose-li:text-slate-400">
                    <ReactMarkdown>{result || ""}</ReactMarkdown>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-950/50 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-300 dark:text-slate-700" />
                        {new Date().toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        SYLLABUS ALIGNED
                      </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                      <button 
                        onClick={() => result && downloadAsDocx(result, formData)}
                        className="flex-1 md:flex-none bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                      >
                        <FileText size={18} /> Export Docx
                      </button>
                      <button 
                        onClick={() => {
                          setResult(null);
                          setCurrentStep('question');
                        }}
                        className="flex-1 md:flex-none bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:text-slate-800 dark:hover:text-slate-200 border border-slate-100 dark:border-slate-700 transition-all shadow-sm"
                      >
                        New Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto px-6 pt-16 pb-20 mt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center transition-colors">
            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs">DP</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 dark:text-slate-700 leading-tight">
            Structure Studio / IBDP Geography<br/>
            Framework Strategy v1.4
          </div>
        </div>
        <div className="flex gap-10 text-[10px] font-bold uppercase tracking-[0.3em]">
          <span className="text-emerald-400/60 dark:text-emerald-500/40 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-400/60 dark:bg-emerald-500/40 rounded-full"></div>
            CASE STUDY SCALE
          </span>
          <span className="text-slate-300 dark:text-slate-800">CONCEPTUAL PILLARS INTEGRATED</span>
        </div>
      </footer>
    </div>
  );
}
