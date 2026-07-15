import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, RefreshCw, Moon, Sun, LogOut, User, Globe, Tag, X, Archive, FolderOpen } from 'lucide-react';
import { OutletData, TAG_COLORS, TAG_LABELS, Poll } from './types.ts';
import { DailyPolls } from './components/DailyPolls.tsx';
import { VAULT_FOLDERS, saveVaultReport } from '../../src/vaultTypes';

// Static outlet metadata — bars always render from this, RSS items fill in asynchronously
const STATIC_OUTLETS: Array<{ id: string; name: string; color: string; textColor: string; logo: string }> = [
  { id: 'guardian',   name: 'The Guardian',           color: '#052962', textColor: '#ffffff', logo: 'https://www.google.com/s2/favicons?domain=theguardian.com&sz=128' },
  { id: 'economist',  name: 'The Economist',           color: '#e3120b', textColor: '#ffffff', logo: 'https://www.google.com/s2/favicons?domain=economist.com&sz=128' },
  { id: 'ft',         name: 'Financial Times',         color: '#fff1e5', textColor: '#000000', logo: 'https://www.google.com/s2/favicons?domain=ft.com&sz=128' },
  { id: 'ap',         name: 'Associated Press',        color: '#ff322e', textColor: '#ffffff', logo: 'https://www.google.com/s2/favicons?domain=apnews.com&sz=128' },
  { id: 'aljazeera',  name: 'Al Jazeera',              color: '#fa9600', textColor: '#ffffff', logo: 'https://www.google.com/s2/favicons?domain=aljazeera.com&sz=128' },
  { id: 'scmp',       name: 'South China Morning Post',color: '#f9dd16', textColor: '#000000', logo: 'https://www.google.com/s2/favicons?domain=scmp.com&sz=128' },
  { id: 'nyt',        name: 'NY Times',                color: '#000000', textColor: '#ffffff', logo: 'https://www.google.com/s2/favicons?domain=nytimes.com&sz=128' },
  { id: 'mongabay',   name: 'Mongabay',                color: '#2e7d32', textColor: '#ffffff', logo: 'https://www.google.com/s2/favicons?domain=mongabay.com&sz=128' },
  { id: 'bbc',        name: 'BBC News',                color: '#bb1919', textColor: '#ffffff', logo: 'https://www.google.com/s2/favicons?domain=bbc.com&sz=128' },
  { id: 'reuters',    name: 'Reuters',                 color: '#ff8000', textColor: '#ffffff', logo: 'https://www.google.com/s2/favicons?domain=reuters.com&sz=128' },
  { id: 'koreatimes', name: 'Korea Times',             color: '#004d40', textColor: '#ffffff', logo: 'https://www.google.com/s2/favicons?domain=koreatimes.co.kr&sz=128' },
  { id: 'euronews',   name: 'Euronews',                color: '#003399', textColor: '#ffffff', logo: 'https://www.google.com/s2/favicons?domain=euronews.com&sz=128' },
];

// Build default data from static outlets so bars render immediately
const buildDefaultData = (): Record<string, OutletData> => {
  const result: Record<string, OutletData> = {};
  STATIC_OUTLETS.forEach(o => {
    result[o.id] = { name: o.name, color: o.color, textColor: o.textColor, logo: o.logo, items: [] };
  });
  return result;
};

export default function App({
  onBackToPortal,
  activeUserEmail,
  activeTeacherCode,
  isDark: propIsDark,
  toggleDark: propToggleDark,
  onOpenVault
}: {
  onBackToPortal?: () => void;
  activeUserEmail?: string;
  activeTeacherCode?: string;
  isDark?: boolean;
  toggleDark?: () => void;
  onOpenVault?: () => void;
}) {
  const [data, setData] = useState<Record<string, OutletData>>(buildDefaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOutlets, setExpandedOutlets] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedNewsItem, setSelectedNewsItem] = useState<{ title: string; tags: string[]; link?: string } | null>(null);
  const [tempTags, setTempTags] = useState<string[]>([]);
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [selectedPollItem, setSelectedPollItem] = useState<Poll | null>(null);
  const [pollsRefreshTrigger, setPollsRefreshTrigger] = useState(0);
  const [localIsDark, setLocalIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [exportToast, setExportToast] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
      if (!response.ok) throw new Error(`Failed to fetch news (Status: ${response.status})`);
      const json = await response.json();
      // Merge live data with static outlet metadata so bars survive any API gaps
      setData(prev => {
        const merged = { ...prev };
        STATIC_OUTLETS.forEach(o => {
          merged[o.id] = {
            name: o.name,
            color: o.color,
            textColor: o.textColor,
            logo: o.logo,
            items: json[o.id]?.items ?? prev?.[o.id]?.items ?? []
          };
        });
        return merged;
      });
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to fetch news:', err);
      setError(err.message || 'An unexpected error occurred while fetching news.');
      // Don't clear existing data on error — keep bars showing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTags = async (headline: string, tags: string[]) => {
    setIsSavingTags(true);
    try {
      if (selectedPollItem) {
        // Tagging a poll
        const response = await fetch('/api/polls/tag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pollId: selectedPollItem.id,
            tags,
            teacherCode: activeTeacherCode,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save poll tags');
        }

        setPollsRefreshTrigger(prev => prev + 1);
      } else {
        // Tagging a news headline
        const response = await fetch('/api/news/tag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            headline,
            tags,
            teacherCode: activeTeacherCode,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save tags');
        }
      }

      await fetchData();
      setSelectedNewsItem(null);
      setSelectedPollItem(null);
    } catch (err: any) {
      console.error('Error saving tags:', err);
      alert(err.message || 'An error occurred while saving tags.');
    } finally {
      setIsSavingTags(false);
    }
  };

  const toggleTempTag = (tag: string) => {
    setTempTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleOutlet = (id: string) => {
    setExpandedOutlets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExport = async () => {
    if (!selectedNewsItem || !selectedFolderId) return;
    
    setIsExporting(true);
    
    try {
      // If there's no link, we just make a dummy articleText
      let articleText = selectedNewsItem.title;
      
      if (selectedNewsItem.link) {
        const extractResponse = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: selectedNewsItem.link }),
        });

        if (extractResponse.ok) {
          const { text } = await extractResponse.json();
          if (text) {
            articleText = text;
          }
        }
      }

      const prompt = `
You are the "IGCSE Geography Curriculum Architect." Your role is to ingest raw newspaper articles or publications and transform them into syllabus-aligned case studies and assessment materials for the IGCSE Geography curriculum.

I am providing you with the text of an article. Your job is to process it according to the 4-step logic established below. 

CRITICAL: Start your response with "## ARTICLE TITLE: [Provide a concise, professional title based on the article content]".
Then, follow with the 4 steps, starting each with a specific heading: "## STEP 1: CURRICULUM ALIGNMENT", "## STEP 2: CONCEPTUAL BREAKDOWN", "## STEP 3: DATA EXTRACTION", and "## STEP 4: EXAM GENERATOR".

STEP 1: CURRICULUM ALIGNMENT
- **Article Overview:** Provide a 3-4 sentence analytical synopsis of the article's core geographic problem.
- **Primary Syllabus Link:** Identify the IGCSE Paper and specific IGCSE Unit. YOU MUST ONLY CHOOSE FROM THE FOLLOWING EXACT UNITS. DO NOT INVENT UNITS:
  - Paper 1 (Physical): PH1: Changing River Environments, PH2: Changing Coastal Environments, PH3: Hazardous Environments, PH4: Changing Ecosystems, PH5: Climate Change
  - Paper 2 (Human): HU6: Changing Population, HU7: Changing Towns & Cities, HU8: Development, HU9: Changing Economies, HU10: Resource Provision
- **Case Study Utility:** Grade (1-10) for exam readiness. Explain WHY (e.g. "High AO1 value due to specific 2024 flood statistics").

STEP 2: CONCEPTUAL BREAKDOWN (AO2)
Analyze through the following lenses:
- **Core Concepts:** Place, Scale, Environment, Interdependence, Development, and Change.
- **Sustainable Development Goals (SDGs):** Which goals are compromised or supported? Explain with specific goal numbers.
- **Evaluation & Perspectives:** What are the differing viewpoints of local residents, governments, businesses, and environmental groups regarding this issue?

STEP 3: DATA EXTRACTION (AO1)
Format this as a "Revision Fact-Box": 
1. **STATISTICS TABLE:** | Quantitative Data | Geographic Significance |
2. **SPATIAL CONTEXT:** Locations, regional hierarchy, and environmental context.
3. **CHRONOLOGY:** Timeline of events.
4. **QUALITATIVE DETAIL:** Unique local actors, quotes, or political nuances.

STEP 4: EXAM GENERATOR
Generate IGCSE-style questions:
1. (2 marks): "State..." or "Identify..." directly from the text.
2. (4 marks): "Explain..." or "Describe..." focused on a causal process.
3. (7 marks): IGCSE Case Study Essay: "Discuss..." or "Evaluate..." focusing on place-specific detail and structured evaluation to secure full marks.

FORMATTING:
Output clean Markdown. Use tables for Step 3. Bold key IGCSE command terms. Ensure the Step headings are EXACTLY as defined.

ARTICLE TEXT:
${articleText}
      `;

      const aiResponse = await fetch("/api/newsroom/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: "gemini-2.5-flash" }),
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to generate Newsroom report.');
      }

      const { text: responseText } = await aiResponse.json();
      
      saveVaultReport(selectedFolderId, {
        id: Math.random().toString(36).slice(2),
        title: selectedNewsItem.title,
        tags: selectedNewsItem.tags,
        content: responseText || `# ${selectedNewsItem.title}\n\n*Failed to generate report.*`,
        date: new Date().toISOString().split('T')[0]
      });
      
      setIsExportModalOpen(false);
      setSelectedFolderId('');
      
      setExportToast(true);
      setTimeout(() => setExportToast(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error exporting to Newsroom. Please ensure backend is running.');
    } finally {
      setIsExporting(false);
    }
  };

  if (error && loading) {
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

          {/* Vault Icon */}
          {onOpenVault && (
            <button
              onClick={onOpenVault}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition-colors shadow-sm"
              title="IG Vault"
            >
              <Archive className="w-5 h-5" />
            </button>
          )}

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
          <DailyPolls
            activeUserEmail={activeUserEmail}
            activeTeacherCode={activeTeacherCode}
            onOpenTagModal={(poll) => {
              setSelectedPollItem(poll);
              const cleanQuestion = poll.question.replace(/#\w+:\s*[^#]+/g, '').trim();
              setSelectedNewsItem({ title: cleanQuestion, tags: poll.tags || [] });
              setTempTags(poll.tags || []);
            }}
            refreshTrigger={pollsRefreshTrigger}
          />
        </div>
      </div>

      {/* News Grid Header */}
      <div className="px-4 pt-6 pb-1">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#2563eb] dark:text-[#60a5fa]" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">Fresh off the Press</h2>
        </div>
      </div>

      {/* Main Content Grid — always renders from STATIC_OUTLETS, items fill in from API */}
      <main className="flex-grow px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {STATIC_OUTLETS.map(({ id }) => {
          const outlet = data[id];
          if (!outlet) return null;
          return (
            <section
              key={id}
              className="bg-white dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-800 flex flex-col overflow-hidden self-start shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleOutlet(id)}
                className="px-3 py-2.5 flex items-center justify-between w-full group transition-all"
                style={{ backgroundColor: outlet.color, color: outlet.textColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center p-1 shadow-md border border-black/10 overflow-hidden flex-shrink-0">
                    <img
                      src={outlet.logo}
                      alt={outlet.name}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="font-black text-[11px] uppercase tracking-[0.18em] leading-none">{outlet.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-black tabular-nums min-w-[24px] text-center">
                    {loading && outlet.items.length === 0 ? (
                      <RefreshCw className="w-3 h-3 animate-spin inline" />
                    ) : outlet.items.length}
                  </span>
                  {expandedOutlets[id] ? <ChevronUp className="w-3.5 h-3.5 opacity-80" /> : <ChevronDown className="w-3.5 h-3.5 opacity-80" />}
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
                      {outlet.items.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 font-semibold animate-pulse">
                          {loading ? 'Loading stories...' : 'No stories available'}
                        </div>
                      ) : outlet.items.map((item, idx) => (
                        <div key={idx} className="p-3 space-y-2 group hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[13px] leading-tight hover:text-blue-700 dark:hover:text-blue-400 block transition-colors"
                          >
                            {item.title}
                          </a>

                          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                            {item.tags && item.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
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

                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cleanTitle = item.title.replace(/#\w+:\s*[^#]+/g, '').trim();
                                  setSelectedNewsItem({ title: cleanTitle, tags: item.tags || [], link: item.link });
                                  setIsExportModalOpen(true);
                                }}
                                className="px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-amber-500 hover:border-amber-200 dark:hover:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all cursor-pointer inline-flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider shadow-sm"
                                title="Export to Newsroom Vault"
                              >
                                <Archive className="w-3 h-3" />
                                Export
                              </button>

                              {activeTeacherCode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const cleanTitle = item.title.replace(/#\w+:\s*[^#]+/g, '').trim();
                                    setSelectedNewsItem({ title: cleanTitle, tags: item.tags || [] });
                                    setTempTags(item.tags || []);
                                  }}
                                  className="px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-[#2563eb] dark:hover:text-[#60a5fa] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer inline-flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider shadow-sm"
                                  title="Edit Tags"
                                >
                                  <Tag className="w-3 h-3" />
                                  Tag
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </main>

      {/* Key Legend Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-300 dark:border-slate-800 px-6 py-2 flex items-center justify-between text-[10px] font-bold text-slate-400 sticky bottom-0 z-40">
        <div className="flex items-center space-x-4 uppercase tracking-tighter overflow-x-auto no-scrollbar py-1">
          {Object.entries(TAG_LABELS).map(([tag, label]) => {
            const code = tag.split(':')[0]; // e.g. PH1, HU6
            return (
              <div key={tag} className="flex items-center space-x-1.5 shrink-0 group cursor-default">
                <span className={`w-3 h-3 rounded-full border shadow-sm ${TAG_COLORS[tag].split(' text-')[0]}`}></span>
                <span className="group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors tracking-tight">
                  {code}: {label}
                </span>
              </div>
            );
          })}
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

      <AnimatePresence>
        {selectedNewsItem && !isExportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedNewsItem(null); setSelectedPollItem(null); }}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 shadow-2xl z-10 flex flex-col gap-4 font-sans text-slate-800 dark:text-slate-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-[#2563eb] dark:text-[#60a5fa] flex items-center gap-2">
                    <Tag className="w-5 h-5 animate-pulse" />
                    {selectedPollItem ? 'Tag Poll Story' : 'Tag News Headline'}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    Map this story to IGCSE syllabus units
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedNewsItem(null); setSelectedPollItem(null); }}
                  className="p-1 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Headline Block */}
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                  {selectedPollItem ? 'Poll Question' : 'News Headline'}
                </span>
                <p className="font-bold text-[13px] leading-snug dark:text-slate-200">
                  {selectedNewsItem.title}
                </p>
              </div>

              {/* Tags Selector Grid */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Select Associated Units
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                  {Object.entries(TAG_LABELS).map(([tag, label]) => {
                    const isSelected = tempTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTempTag(tag)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-205 cursor-pointer ${
                          isSelected
                            ? `${TAG_COLORS[tag]} border-current shadow-md ring-2 ring-offset-2 ring-blue-500/20 dark:ring-offset-slate-950`
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black tracking-wider uppercase">
                            {tag.split(':')[0]}
                          </span>
                          <span className="text-[11px] font-bold leading-tight mt-0.5 truncate max-w-[170px]">
                            {label}
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-white border-transparent' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && (
                            <span className={`w-2 h-2 rounded-full ${TAG_COLORS[tag].split(' ')[0].replace('bg-', 'bg-[#2563eb]') || 'bg-blue-600'}`} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanatory Note */}
              <div className="text-[10px] text-slate-400 dark:text-slate-500 italic bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/30 dark:border-blue-900/20 rounded-lg p-2.5">
                💡 <strong>Keyword learning active:</strong> Saving manual tags will extract keywords from this {selectedPollItem ? 'question' : 'headline'} to automatically map future matching headlines to these units.
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedNewsItem(null); setSelectedPollItem(null); }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold uppercase text-[11px] tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingTags}
                  onClick={() => handleSaveTags(selectedNewsItem.title, tempTags)}
                  className="flex-1 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold uppercase text-[11px] tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSavingTags ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Tags'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExportModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 shadow-2xl z-10 flex flex-col gap-4 font-sans text-slate-800 dark:text-slate-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-amber-500 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Select Vault Folder
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    Which geographic unit does this news story associate with?
                  </p>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-1 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {VAULT_FOLDERS.map(folder => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-205 cursor-pointer ${
                      selectedFolderId === folder.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 shadow-sm ring-1 ring-amber-500/50 text-slate-900 dark:text-amber-400'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <FolderOpen className={`w-4 h-4 shrink-0 ${selectedFolderId === folder.id ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold truncate leading-snug">{folder.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setIsExportModalOpen(false); setSelectedNewsItem(null); }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold uppercase text-[11px] tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFolderId || isExporting}
                  onClick={handleExport}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase text-[11px] tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    'Confirm Export'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exportToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-xl shadow-2xl shadow-emerald-500/20 z-[200] flex items-center gap-3"
          >
            <Archive className="w-5 h-5" />
            Successful export, saved to vault!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
