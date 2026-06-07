import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  ArrowLeft, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Youtube, 
  Plus, 
  Loader2, 
  Tv,
  Check,
  RotateCcw,
  Sun,
  Moon,
  Trash2,
  RefreshCw,
  FileDown,
  UserCheck,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateQuizForVideo, type QuizResponse, type QuizQuestion } from './lib/gemini';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// Curated default high-yield videos matching the 9 syllabus units
interface VideoItem {
  id: string;
  title: string;
  channel: string;
  description: string;
  unit: string;
  duration: string;
  publishedAt: string;
  is_locked?: boolean;
}

const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: "kVaBlat06Sw",
    title: "Why 94% of China Lives East of This Line",
    channel: "RealLifeLore",
    description: "An investigation into China's demographic distribution, the Heihe-Tengchong line, geographic barriers, agricultural viability, and population pressure shifts.",
    unit: "SL1: Changing Populations",
    duration: "21:40",
    publishedAt: "3 weeks ago"
  },
  {
    id: "ztWHqUFJRTs",
    title: "Climate change: Earth's giant game of Tetris",
    channel: "TED-Ed",
    description: "A spatial analysis of climate vulnerability, rising sea levels, changing biome distributions, climate migration corridors, and international adaptation strategies.",
    unit: "SL2: Global Climate",
    duration: "02:48",
    publishedAt: "1 month ago"
  },
  {
    id: "Hvc1P5edKTc",
    title: "Population & Food: Crash Course Geography #16",
    channel: "CrashCourse Geography",
    description: "An overview of ecological footprints, global resource distribution, Malthusian vs. Boserupian models of population growth, and resource security challenges.",
    unit: "SL3: Global Resource",
    duration: "11:58",
    publishedAt: "2 weeks ago"
  },
  {
    id: "FN3VFgG922A",
    title: "Meet the enormous boats that carry your stuff",
    channel: "Vox",
    description: "Exploring the spatial interactions, logistics networks, global shipping lanes, key maritime chokepoints (Suez, Panama, Malacca), and structural supply chain vulnerabilities.",
    unit: "HL4: Power, Places & Networks",
    duration: "10:35",
    publishedAt: "5 days ago"
  },
  {
    id: "cuPfIFg2ZDI",
    title: "200 Years, 200 Countries, 4 Minutes",
    channel: "Hans Rosling / Gapminder",
    description: "Analyzing global development indices, GNI per capita, human development metrics, multidimensional poverty, and institutional structural aid in low-income nations.",
    unit: "HL5: Human Dev & Diversity",
    duration: "04:47",
    publishedAt: "2 months ago"
  },
  {
    id: "LxgMdjyw8uw",
    title: "We WILL Fix Climate Change!",
    channel: "Kurzgesagt – In a Nutshell",
    description: "An in-depth case study of environmental degradation, community resilience, risk management, and the forced relocation of indigenous populations due to coastal erosion.",
    unit: "HL6: Global Risk & Resilience",
    duration: "16:15",
    publishedAt: "3 weeks ago"
  },
  {
    id: "Pz6AQXQGupQ",
    title: "Where we get our fresh water",
    channel: "TED-Ed",
    description: "An exploration of Earth's water distribution, freshwater storage systems, and the hydrological systems that supply human civilization.",
    unit: "OPA: Freshwater",
    duration: "05:08",
    publishedAt: "1 week ago"
  },
  {
    id: "fXb02MQ78yQ",
    title: "What Happens if a Supervolcano Blows Up?",
    channel: "Kurzgesagt – In a Nutshell",
    description: "Examining volcanic hazard maps, seismic anomalies, gas emissions, deformation monitoring, and disaster mitigation strategies for active geophysical hazards.",
    unit: "OPD: Geophysical Hazards",
    duration: "10:04",
    publishedAt: "4 days ago"
  },
  {
    id: "7NBa5o--y3k",
    title: "The Cruise Industry's Arms Race",
    channel: "Wendover Productions",
    description: "Analyzing the globalization of leisure, tourism nodes, carrying capacity of small island tourist economies, and the environmental footprint of cruise terminals.",
    unit: "OPE: Leisure, Tourism & Sport",
    duration: "13:22",
    publishedAt: "2 weeks ago"
  }
];

const SYLLABUS_ROWS = [
  { key: "SL1", label: "SL1: Changing Population", prefix: "SL1" },
  { key: "SL2", label: "SL2: Global Climate Vulnerability & Resilience", prefix: "SL2" },
  { key: "SL3", label: "SL3: Global Resource Consumption & Security", prefix: "SL3" },
  { key: "HL4", label: "HL4: Power, Place & Networks", prefix: "HL4" },
  { key: "HL5", label: "HL5: Human Development & Diversity", prefix: "HL5" },
  { key: "HL6", label: "HL6 Global Risks & Resilience", prefix: "HL6" },
  { key: "OPA", label: "OPA: Freshwater", prefix: "OPA" },
  { key: "OPD", label: "OPD: Geophysical Hazards", prefix: "OPD" },
  { key: "OPE", label: "OPE: Leisure, Tourism & Sport", prefix: "OPE" }
];

const UNIT_COLORS: Record<string, string> = {
  "SL1": "bg-blue-500/10 text-blue-550 dark:text-blue-405 border-blue-500/25",
  "SL2": "bg-amber-500/10 text-amber-550 dark:text-amber-400 border-amber-500/25",
  "SL3": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  "HL4": "bg-purple-500/10 text-purple-550 dark:text-purple-400 border-purple-500/25",
  "HL5": "bg-pink-500/10 text-pink-550 dark:text-pink-400 border-pink-500/25",
  "HL6": "bg-red-500/10 text-red-550 dark:text-red-400 border-red-500/25",
  "OPA": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25",
  "OPD": "bg-orange-500/10 text-orange-550 dark:text-orange-400 border-orange-500/25",
  "OPE": "bg-indigo-500/10 text-indigo-550 dark:text-indigo-400 border-indigo-500/25"
};

const getUnitColor = (unitTag: string) => {
  const prefix = unitTag.split(':')[0].trim();
  return UNIT_COLORS[prefix] || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
};

export default function App({
  onBackToPortal,
  isDark: propIsDark,
  toggleDark: propToggleDark,
  role = 'student',
  activeTeacherCode = ''
}: {
  onBackToPortal?: () => void;
  isDark?: boolean;
  toggleDark?: () => void;
  role?: 'student' | 'teacher' | 'super_admin';
  activeTeacherCode?: string;
}) {
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('light');
  const theme = propIsDark !== undefined ? (propIsDark ? 'dark' : 'light') : localTheme;
  const toggleTheme = () => {
    if (propToggleDark) {
      propToggleDark();
    } else {
      setLocalTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [importUnit, setImportUnit] = useState('SL1: Changing Populations');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Active role toggle (for teacher preview)
  const [activeRole, setActiveRole] = useState<'student' | 'teacher' | 'super_admin'>(role);

  // Weekly loading states
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
  const [weeklyStatus, setWeeklyStatus] = useState<string | null>(null);

  useEffect(() => {
    setActiveRole(role);
  }, [role]);

  const loadVideos = async () => {
    setIsLoadingWeekly(true);
    setWeeklyStatus("Loading geography syllabus media feed...");
    try {
      const res = await fetch(`/api/globetube/videos?role=${activeRole}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // Reconstruct the flat array from the syllabus matrix
          const flatVideos: VideoItem[] = [];
          const prefixes = ["SL1", "SL2", "SL3", "HL4", "HL5", "HL6", "OPA", "OPD", "OPE"];
          prefixes.forEach(pref => {
            if (Array.isArray(data[pref])) {
              flatVideos.push(...data[pref]);
            }
          });
          setVideos(flatVideos);
        } else if (Array.isArray(data)) {
          setVideos(data);
        } else {
          setVideos(DEFAULT_VIDEOS);
        }
      } else {
        setVideos(DEFAULT_VIDEOS);
      }
    } catch (err) {
      console.error("Failed to load videos from server:", err);
      setVideos(DEFAULT_VIDEOS);
    } finally {
      setIsLoadingWeekly(false);
      setWeeklyStatus(null);
    }
  };

  // Load videos database from backend when activeRole changes
  useEffect(() => {
    loadVideos();
  }, [activeRole]);

  const toggleVideoLock = async (videoId: string) => {
    try {
      const res = await fetch(`/api/globetube/videos/${videoId}/toggle-lock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherCode: activeTeacherCode || "SKN"
        })
      });
      if (res.ok) {
        await loadVideos();
      } else {
        const errData = await res.json();
        alert(`Failed to toggle lock: ${errData.error || errData.details || "Unknown error"}`);
      }
    } catch (err) {
      console.error("[GlobeTube] Toggle lock failed:", err);
      alert("Network error while trying to toggle video lock.");
    }
  };

  const saveVideosToBackend = async (updatedVideos: VideoItem[]) => {
    try {
      const res = await fetch("/api/globetube/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videos: updatedVideos,
          teacherCode: activeTeacherCode || "SKN"
        })
      });
      
      const responseText = await res.text();
      let resData: any = {};
      if (responseText && responseText.trim().length > 0) {
        try {
          resData = JSON.parse(responseText);
        } catch (e) {
          console.warn("[GlobeTube] Non-JSON response received from import API.");
        }
      }
      
      if (!res.ok) {
        throw new Error(resData.error || "Failed to sync updates.");
      }
      
      await loadVideos();
    } catch (err: any) {
      console.error("[GlobeTube] Caught import sync error:", err);
      await loadVideos();
    }
  };

  // Extract YouTube ID utility supporting standard, short, embed and shorts URLs
  const parseYouTubeId = (url: string): string | null => {
    const trimmed = url.trim();
    if (trimmed.length === 11) return trimmed;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Import custom video from URL using free CORS-friendly oEmbed
  const handleImportVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    const videoId = parseYouTubeId(customUrl);

    if (!videoId) {
      setImportError('Invalid YouTube URL or Video ID. Please paste a standard link.');
      return;
    }

    if (videos.some(v => v.id === videoId)) {
      setImportError('This video is already in your Video Wall.');
      return;
    }

    setImporting(true);

    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve video metadata from YouTube.');
      }
      
      const metadata = await response.json();
      if (metadata.error) {
        throw new Error(metadata.error);
      }

      // Rebuilt: sync video import payload directly to cloud database POST endpoint
      const importRes = await fetch("/api/globetube/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${videoId}`,
          title: metadata.title || 'Imported Video',
          unit: importUnit,
          channel: metadata.author_name || 'YouTube Creator',
          teacherCode: activeTeacherCode || "SKN"
        })
      });

      if (!importRes.ok) {
        const errData = await importRes.json();
        throw new Error(errData.error || "Failed to sync updates with cloud database.");
      }

      await loadVideos();
      setCustomUrl('');
    } catch (err: any) {
      console.error('oEmbed Import failed:', err);
      // Fallback: sync fallback metadata directly to cloud database POST endpoint
      try {
        const importRes = await fetch("/api/globetube/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: `https://www.youtube.com/watch?v=${videoId}`,
            title: `Imported Video (${videoId})`,
            unit: importUnit,
            channel: 'YouTube Video',
            teacherCode: activeTeacherCode || "SKN"
          })
        });

        if (!importRes.ok) {
          const errData = await importRes.json();
          throw new Error(errData.error || "Failed to sync fallback with cloud database.");
        }

        await loadVideos();
        setCustomUrl('');
      } catch (innerErr: any) {
        console.error('Fallback import failed:', innerErr);
        setImportError(innerErr.message || "Failed to sync imported video.");
      }
    } finally {
      setImporting(false);
    }
  };

  // Teacher action: Swap video in-place
  const handleSwapVideo = async (oldVideoId: string) => {
    const newUrl = prompt("Enter new YouTube URL or 11-character Video ID to swap this video:");
    if (!newUrl) return;

    const newVideoId = parseYouTubeId(newUrl);
    if (!newVideoId) {
      alert("Invalid YouTube URL or Video ID.");
      return;
    }

    const oldVid = videos.find(v => v.id === oldVideoId);
    if (!oldVid) return;

    setImporting(true);
    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${newVideoId}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve video metadata from YouTube.');
      }
      
      const metadata = await response.json();
      if (metadata.error) {
        throw new Error(metadata.error);
      }

      const swappedVideo: VideoItem = {
        id: newVideoId,
        title: metadata.title || 'Swapped Video',
        channel: metadata.author_name || 'YouTube Creator',
        description: `Swapped case study video. Load the Syllabus Quiz Engine to generate MCQs.`,
        unit: oldVid.unit,
        duration: 'N/A',
        publishedAt: 'Just swapped'
      };

      const updated = videos.map(v => v.id === oldVideoId ? swappedVideo : v);
      setVideos(updated);
      await saveVideosToBackend(updated);
    } catch (err: any) {
      console.error('oEmbed Swap failed:', err);
      const fallbackVideo: VideoItem = {
        id: newVideoId,
        title: `Swapped Video (${newVideoId})`,
        channel: 'YouTube Video',
        description: `Geographical study case swapped manually.`,
        unit: oldVid.unit,
        duration: 'N/A',
        publishedAt: 'Just swapped'
      };
      const updated = videos.map(v => v.id === oldVideoId ? fallbackVideo : v);
      setVideos(updated);
      await saveVideosToBackend(updated);
    } finally {
      setImporting(false);
    }
  };

  // Teacher action: Delete video
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    const updated = videos.filter(v => v.id !== videoId);
    setVideos(updated);
    await saveVideosToBackend(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-[#00b875] selection:text-white transition-colors duration-300">
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 py-4 px-6 md:px-12 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#00b875] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Tv className="text-white w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-none">DP GlobeTube</h1>
              <span className="text-[9px] bg-emerald-500/10 text-[#00b875] border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold uppercase">QUIZ ENGINE</span>
            </div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-1">IBDP Geography Media & Syllabus Analyzer</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Teacher preview override check */}
          {(role === 'teacher' || role === 'super_admin') && (
            <button
              onClick={() => setActiveRole(prev => prev === 'student' ? 'teacher' : 'student')}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 hover:bg-[#00b875]/10 hover:border-[#00b875]/20 text-slate-650 dark:text-slate-350 text-[10px] font-black uppercase rounded-xl tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
            >
              {activeRole === 'student' ? <Users className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5 text-[#00b875]" />}
              <span>{activeRole === 'student' ? 'Student View' : 'Teacher View'}</span>
            </button>
          )}

          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#00b875] transition-all cursor-pointer"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="px-5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 hover:bg-red-500/10 hover:border-red-500/20 text-slate-500 dark:text-red-400 text-[10px] font-black uppercase rounded-xl tracking-wider transition-all cursor-pointer"
            >
              EXIT
            </button>
          )}
        </div>
      </header>

      {/* Main Area */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-10 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: VIDEO WALL */}
          {!selectedVideo ? (
            <motion.div
              key="video-wall"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Import Input Bar (Visible only to teachers) */}
              {activeRole !== 'student' && (
                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 backdrop-blur-sm transition-colors duration-300">
                  <form onSubmit={handleImportVideo} className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Paste YouTube video link to import..."
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-[#00b875] focus:ring-1 focus:ring-[#00b875] outline-none rounded-2xl text-xs font-semibold text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-all uppercase tracking-wide"
                      />
                    </div>
                    {/* Unit Select Dropdown */}
                    <select
                      value={importUnit}
                      onChange={(e) => setImportUnit(e.target.value)}
                      className="px-4 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-[#00b875] outline-none rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all uppercase tracking-wide"
                    >
                      <option value="SL1: Changing Populations">SL1: Changing Population</option>
                      <option value="SL2: Global Climate">SL2: Global Climate</option>
                      <option value="SL3: Global Resource">SL3: Global Resource</option>
                      <option value="HL4: Power, Places & Networks">HL4: Power, Place & Networks</option>
                      <option value="HL5: Human Dev & Diversity">HL5: Human Development</option>
                      <option value="HL6: Global Risk & Resilience">HL6: Global Risks</option>
                      <option value="OPA: Freshwater">OPA: Freshwater</option>
                      <option value="OPD: Geophysical Hazards">OPD: Geophysical Hazards</option>
                      <option value="OPE: Leisure, Tourism & Sport">OPE: Leisure, Tourism & Sport</option>
                    </select>
                    
                    <button 
                      type="submit" 
                      disabled={importing || !customUrl}
                      className="px-6 py-3.5 bg-[#00b875] hover:bg-[#009e63] disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
                    >
                      {importing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          IMPORT VIDEO
                        </>
                      )}
                    </button>
                  </form>
                  {importError && (
                    <p className="text-red-500 dark:text-red-400 text-[11px] font-bold uppercase tracking-wider mt-3 px-1">{importError}</p>
                  )}
                </div>
              )}

              {/* Stacked Rows of Syllabus Units */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Tv className="w-5 h-5 text-[#00b875]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Curated Geography Syllabus Rows</h3>
                  </div>
                  {weeklyStatus && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#00b875] tracking-wide uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{weeklyStatus}</span>
                    </div>
                  )}
                </div>
                
                {isLoadingWeekly ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-slate-900/10 border border-slate-200 dark:border-slate-900 rounded-3xl backdrop-blur-sm">
                    <Loader2 className="w-10 h-10 text-[#00b875] animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Loading Weekly Syllabus Matrix</p>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">Generating fresh case studies from trusted creators...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {SYLLABUS_ROWS.map((row) => {
                      // Filter videos belonging to this syllabus row prefix
                      const rowVideos = videos.filter(v => v.unit && v.unit.toUpperCase().startsWith(row.prefix.toUpperCase()));
                      
                      return (
                        <SyllabusRowCarousel
                          key={row.key}
                          row={row}
                          rowVideos={rowVideos}
                          activeRole={activeRole}
                          setSelectedVideo={setSelectedVideo}
                          toggleVideoLock={toggleVideoLock}
                          handleSwapVideo={handleSwapVideo}
                          handleDeleteVideo={handleDeleteVideo}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <VideoDetailView 
              video={selectedVideo}
              onBack={() => setSelectedVideo(null)}
              onVideoUpdate={(updatedVideo) => {
                const isNew = !videos.some(v => v.id === updatedVideo.id);
                const updated = isNew 
                  ? [updatedVideo, ...videos]
                  : videos.map(v => v.id === updatedVideo.id ? updatedVideo : v);
                setVideos(updated);
                saveVideosToBackend(updated);
                setSelectedVideo(updatedVideo);
              }}
              parseYouTubeId={parseYouTubeId}
              activeRole={activeRole}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

interface SyllabusRowCarouselProps {
  row: typeof SYLLABUS_ROWS[0];
  rowVideos: VideoItem[];
  activeRole: 'student' | 'teacher' | 'super_admin';
  setSelectedVideo: (vid: VideoItem) => void;
  toggleVideoLock: (videoId: string) => void;
  handleSwapVideo: (oldVideoId: string) => void;
  handleDeleteVideo: (videoId: string) => void;
}

function SyllabusRowCarousel({
  row,
  rowVideos,
  activeRole,
  setSelectedVideo,
  toggleVideoLock,
  handleSwapVideo,
  handleDeleteVideo
}: SyllabusRowCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft } = containerRef.current;
      setShowLeftArrow(scrollLeft > 1);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      checkScroll();
      
      // Handle window resizing
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [rowVideos]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollAmount = container.clientWidth;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      // A small timeout ensures we check scroll state after the smooth scroll finishes or updates
      setTimeout(checkScroll, 100);
      setTimeout(checkScroll, 300);
      setTimeout(checkScroll, 600);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-2">
        <h3 className="text-base font-black text-slate-800 dark:text-slate-250 tracking-tight uppercase">{row.label}</h3>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-[#00b875] font-black px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
          {rowVideos.length} {rowVideos.length === 1 ? 'Video' : 'Videos'}
        </span>
      </div>
      
      {rowVideos.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-white/40 dark:bg-slate-900/10 backdrop-blur-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">No case study videos in this unit</p>
          {activeRole !== 'student' && (
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">Use the import bar above to assign a video to this unit.</p>
          )}
        </div>
      ) : (
        <div className="relative group">
          {/* Left Arrow Button */}
          {showLeftArrow && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-neutral-800/80 hover:bg-neutral-700 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer flex items-center justify-center border-none"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow Button */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-neutral-800/80 hover:bg-neutral-700 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer flex items-center justify-center border-none"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slider Container */}
          <div
            ref={containerRef}
            onScroll={checkScroll}
            className="flex flex-row overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 pb-4"
          >
            {rowVideos.map((vid) => (
              <div key={vid.id} className="w-full sm:w-[calc(33.333%-16px)] shrink-0 snap-start relative">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 rounded-2xl overflow-hidden cursor-pointer flex flex-col group/card transition-all duration-300 shadow-md hover:shadow-emerald-500/5 h-full"
                  onClick={() => setSelectedVideo(vid)}
                >
                  {/* Video Thumbnail Wrapper */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img 
                      src={`https://img.youtube.com/vi/${vid.id}/mqdefault.jpg`}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover/card:scale-102 transition-transform duration-500 opacity-90 group-hover/card:opacity-100"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 group-hover/card:bg-slate-950/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-900/80 group-hover/card:bg-[#00b875] text-white flex items-center justify-center shadow-lg group-hover/card:scale-110 transition-all duration-300">
                        <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-slate-950/80 rounded-md text-[10px] font-bold text-slate-300 font-mono">
                      {vid.duration}
                    </span>
                  </div>

                  {/* Video Info */}
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black tracking-wider border rounded-full uppercase cursor-default ${getUnitColor(vid.unit)}`}>
                          {vid.unit.split(':')[0]}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{vid.publishedAt}</span>
                      </div>

                      {activeRole !== 'student' && (
                        <div className="pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVideoLock(vid.id);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                              vid.is_locked
                                ? 'bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/40'
                                : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            {vid.is_locked ? '🔒 Locked (Hidden)' : '🔓 Unlocked (Visible)'}
                          </button>
                        </div>
                      )}

                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug group-hover/card:text-[#00b875] transition-colors line-clamp-2 pt-2">
                        {vid.title}
                      </h4>
                      <p className="text-[11px] font-bold text-[#00b875] tracking-wide uppercase">{vid.channel}</p>
                    </div>

                    <p className="text-xs text-slate-650 dark:text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>
                </motion.div>

                {/* Teacher controls overlays */}
                {activeRole !== 'student' && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      title="Swap Video"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwapVideo(vid.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-emerald-600 text-white transition-colors cursor-pointer shadow-lg border-none"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Delete Video"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVideo(vid.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-red-650 text-white transition-colors cursor-pointer shadow-lg border-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component encapsulating player binding and quiz engine
interface VideoDetailViewProps {
  video: VideoItem;
  onBack: () => void;
  onVideoUpdate: (video: VideoItem) => void;
  parseYouTubeId: (url: string) => string | null;
  activeRole: 'student' | 'teacher' | 'super_admin';
}

function VideoDetailView({
  video,
  onBack,
  onVideoUpdate,
  parseYouTubeId,
  activeRole
}: VideoDetailViewProps) {
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const [initialVideoId] = useState(video.id);

  // Quick Load URL State
  const [quickUrl, setQuickUrl] = useState('');
  const [quickLoadError, setQuickLoadError] = useState<string | null>(null);

  // Quiz states
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Inject YouTube IFrame API script safely
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }, []);

  // Initialize YT Player on mount
  useEffect(() => {
    let ytPlayer: any = null;
    let elementPoll: any = null;
    
    const initializeYTPlayer = () => {
      if ((window as any).YT && (window as any).YT.Player && playerRef.current) {
        try {
          ytPlayer = new (window as any).YT.Player(playerRef.current, {
            events: {
              onReady: (event: any) => {
                setPlayer(event.target);
              }
            }
          });
        } catch (err) {
          console.error("Error binding to YT.Player:", err);
        }
      }
    };

    const checkAndInit = () => {
      if ((window as any).YT && (window as any).YT.Player && playerRef.current) {
        if (elementPoll) clearInterval(elementPoll);
        initializeYTPlayer();
        return true;
      }
      return false;
    };

    const startInit = () => {
      if (!checkAndInit()) {
        const prevCallback = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          if (prevCallback) prevCallback();
          checkAndInit();
        };

        let attempts = 0;
        elementPoll = setInterval(() => {
          attempts++;
          if (checkAndInit()) {
            // Already initialized and cleared interval
          } else if (attempts > 50) {
            clearInterval(elementPoll);
            console.error("YouTube Player API or element ref not ready after 5s.");
          }
        }, 100);
      }
    };

    const timer = setTimeout(startInit, 50);

    return () => {
      clearTimeout(timer);
      if (elementPoll) clearInterval(elementPoll);
      if (ytPlayer && typeof ytPlayer.destroy === 'function') {
        try {
          ytPlayer.destroy();
        } catch (e) {
          console.error("Error destroying YT player:", e);
        }
      }
      setPlayer(null);
    };
  }, []);

  // Call loadVideoById natively when video ID changes after initial mount
  useEffect(() => {
    if (player && typeof player.loadVideoById === 'function') {
      try {
        player.loadVideoById(video.id);
      } catch (e) {
        console.error("Failed to load video on existing player:", e);
      }
    }
  }, [video.id, player]);

  // Request quiz from Gemini API
  const handleGenerateQuiz = async () => {
    setLoadingQuiz(true);
    setQuizError(null);
    setQuizData(null);
    setUserAnswers({});
    setQuizSubmitted(false);

    try {
      const result = await generateQuizForVideo(
        video.title,
        video.channel,
        video.description
      );
      setQuizData(result);
    } catch (err: any) {
      console.error('Quiz Generation Error:', err);
      if (err.message === "API_KEY_MISSING") {
        setQuizError("Gemini API key is not configured. Please add it to your secrets context.");
      } else {
        setQuizError(err.message || "An unexpected error occurred while generating the quiz.");
      }
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleOptionSelect = (questionNum: number, option: string) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionNum]: option
    }));
  };

  const handleSubmitQuiz = () => {
    if (!quizData) return;
    let correctCount = 0;
    quizData.quiz.forEach(q => {
      if (userAnswers[q.question_number] === q.correct_answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  // Export to PDF
  const handleDownloadPDF = () => {
    if (!quizData) return;
    
    // Create jsPDF document with default millimeter (mm) units
    const doc = new jsPDF();
    
    const leftMargin = 20;
    const rightMargin = 20;
    const maxWritableWidth = doc.internal.pageSize.getWidth() - leftMargin - rightMargin; // 170 mm
    const pageLimit = doc.internal.pageSize.getHeight() - 20; // 277 mm
    const CONTENT_START_Y = 50; // Content starting Y below header banner
    
    // Helper to draw brand header banner block in platform green (#10B981) on any page
    const drawHeaderBanner = () => {
      doc.setFillColor(16, 185, 129); // #10B981
      doc.rect(leftMargin, 20, maxWritableWidth, 22, "F");
      
      // Draw header text (white font)
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("DP GlobeTube — Classroom Retrieval Activity", leftMargin + 5, 33);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const rightTextUnit = quizData.unit_tag;
      const rightTextVideo = video.title.length > 50 ? video.title.substring(0, 47) + "..." : video.title;
      doc.text(rightTextUnit, leftMargin + maxWritableWidth - 5, 29, { align: "right" });
      doc.text(rightTextVideo, leftMargin + maxWritableWidth - 5, 35, { align: "right" });
      
      // Restore text color to dark (#1E293B) for standard body contents
      doc.setTextColor(30, 41, 59);
    };
    
    // Draw initial header banner on the first page
    drawHeaderBanner();
    
    // Print Syllabus Connection text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const connLines = doc.splitTextToSize(`Syllabus Connection: ${quizData.syllabus_connection}`, maxWritableWidth);
    
    let currentY = CONTENT_START_Y;
    doc.text(connLines, leftMargin, currentY);
    currentY += (connLines.length * 4.0) + 6; // 4.0mm line height, 6mm spacing after connection
    
    // Typography definitions in millimeters (mm)
    const STEM_LINE_HEIGHT = 4.5;
    const STEM_SPACING = 2.0;
    const OPTION_LINE_HEIGHT = 4.0;
    const OPTION_SPACING = 1.5;
    const QUESTION_SPACING = 5.0;
    
    // Define types for strict height tracking
    interface OptionBlock {
      label: string;
      text: string;
      lines: string[];
      height: number;
    }
    
    interface QuestionBlock {
      questionNumber: number;
      stemLines: string[];
      stemHeight: number;
      options: OptionBlock[];
      totalBlockHeight: number;
    }
    
    // 1. Define question group blocks and calculate heights before printing (look-ahead logic)
    const questionBlocks: QuestionBlock[] = quizData.quiz.map((q) => {
      const stemText = `${q.question_number}. ${q.question}`;
      const stemLines = doc.splitTextToSize(stemText, maxWritableWidth);
      const stemHeight = stemLines.length * STEM_LINE_HEIGHT + STEM_SPACING;
      
      const options: OptionBlock[] = q.options.map((opt, idx) => {
        const optionLabel = String.fromCharCode(65 + idx);
        const optText = `  ${optionLabel}) ${opt}`;
        const optLines = doc.splitTextToSize(optText, maxWritableWidth);
        const optHeight = optLines.length * OPTION_LINE_HEIGHT + (idx === 3 ? QUESTION_SPACING : OPTION_SPACING);
        return {
          label: optionLabel,
          text: optText,
          lines: optLines,
          height: optHeight
        };
      });
      
      const optionsHeight = options.reduce((sum, opt) => sum + opt.height, 0);
      const totalBlockHeight = stemHeight + optionsHeight;
      
      return {
        questionNumber: q.question_number,
        stemLines,
        stemHeight,
        options,
        totalBlockHeight
      };
    });
    
    // 3. Print question blocks with conditional page breaks
    questionBlocks.forEach((block) => {
      // IF (Current Y-Position + Calculated Block Height) > Page Limit, break page
      if (currentY + block.totalBlockHeight > pageLimit) {
        doc.addPage();
        drawHeaderBanner();
        currentY = CONTENT_START_Y; // Reset Y-cursor below header banner
      }
      
      // Print Stem
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(block.stemLines, leftMargin, currentY);
      currentY += block.stemHeight;
      
      // Print Options (Each option's Y starts exactly where the previous option finishes)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      block.options.forEach((opt) => {
        doc.text(opt.lines, leftMargin, currentY);
        currentY += opt.height;
      });
    });
    
    // Forced Answer Key Page Isolation
    doc.addPage();
    drawHeaderBanner();
    currentY = CONTENT_START_Y;
    
    // Print Answer Key Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const ansHeaderLines = doc.splitTextToSize("ANSWER KEY", maxWritableWidth);
    doc.text(ansHeaderLines, leftMargin, currentY);
    currentY += (ansHeaderLines.length * 5.0) + 4; // 5.0mm line height, 4mm spacing
    
    // Print Answer Key Content
    let answerText = "";
    quizData.quiz.forEach((q) => {
      const idx = q.options.indexOf(q.correct_answer);
      const label = idx >= 0 ? String.fromCharCode(65 + idx) : "?";
      answerText += `Q${q.question_number}: ${label} (${q.correct_answer})     `;
    });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const ansBodyLines = doc.splitTextToSize(answerText, maxWritableWidth);
    doc.text(ansBodyLines, leftMargin, currentY);
    currentY += ansBodyLines.length * 4.0;
    
    doc.save(`${video.title.replace(/[^a-z0-9]/gi, '_')}_Quiz.pdf`);
  };

  // Export to DOCX
  const handleDownloadDOCX = async () => {
    if (!quizData) return;
    try {
      const sections = [];
      
      sections.push(
        new Paragraph({
          text: `Syllabus Quiz: ${video.title}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Unit: ", bold: true }),
            new TextRun({ text: `${quizData.unit_tag}\n` }),
            new TextRun({ text: "Syllabus Connection: ", bold: true }),
            new TextRun({ text: `${quizData.syllabus_connection}\n` })
          ],
          spacing: { after: 400 }
        })
      );
      
      quizData.quiz.forEach((q) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${q.question_number}. ${q.question}`, bold: true })
            ],
            spacing: { before: 200, after: 100 }
          })
        );
        
        q.options.forEach((opt, idx) => {
          const optionLabel = String.fromCharCode(65 + idx);
          sections.push(
            new Paragraph({
              text: `    ${optionLabel}) ${opt}`,
              spacing: { after: 80 }
            })
          );
        });
      });
      
      sections.push(
        new Paragraph({
          text: "",
          spacing: { before: 400 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "ANSWER KEY", bold: true, size: 24 })
          ],
          spacing: { after: 200 }
        })
      );
      
      const answerChildren: TextRun[] = [];
      quizData.quiz.forEach((q) => {
        const correctIdx = q.options.indexOf(q.correct_answer);
        const optionLabel = correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : "?";
        answerChildren.push(
          new TextRun({ text: `Q${q.question_number}: `, bold: true }),
          new TextRun({ text: `${optionLabel} (${q.correct_answer})        ` })
        );
      });
      
      sections.push(
        new Paragraph({
          children: answerChildren
        })
      );
      
      const doc = new Document({
        sections: [{ children: sections }]
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${video.title.replace(/[^a-z0-9]/gi, '_')}_Quiz.docx`);
    } catch (err) {
      console.error("DOCX generation failed:", err);
      alert("Word DOCX generation failed.");
    }
  };

  // Quick load dynamic URL bar
  const handleQuickLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickLoadError(null);
    const videoId = parseYouTubeId(quickUrl);

    if (!videoId) {
      setQuickLoadError('Invalid YouTube URL or Video ID.');
      return;
    }

    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve video metadata.');
      }
      const metadata = await response.json();
      if (metadata.error) {
        throw new Error(metadata.error);
      }

      const updatedVideo: VideoItem = {
        id: videoId,
        title: metadata.title || 'Loaded Video',
        channel: metadata.author_name || 'YouTube Creator',
        description: `Custom quick-loaded video. Load the Syllabus Quiz Engine to generate MCQs.`,
        unit: video.unit, // Keep same unit
        duration: 'N/A',
        publishedAt: 'Just loaded'
      };

      onVideoUpdate(updatedVideo);
      setQuickUrl('');
      setQuizData(null);
      setQuizError(null);
      setUserAnswers({});
      setQuizSubmitted(false);
    } catch (err: any) {
      console.error('Quick load failed:', err);
      const fallbackVideo: VideoItem = {
        id: videoId,
        title: `Loaded Video (${videoId})`,
        channel: 'YouTube Video',
        description: `Geographical study case loaded manually. Generate syllabus quiz to begin.`,
        unit: video.unit,
        duration: 'N/A',
        publishedAt: 'Just loaded'
      };
      
      onVideoUpdate(fallbackVideo);
      setQuickUrl('');
      setQuizData(null);
      setQuizError(null);
      setUserAnswers({});
      setQuizSubmitted(false);
    }
  };

  return (
    <motion.div
      key="video-detail"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#00b875] transition-colors group cursor-pointer border-none bg-transparent"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        BACK TO VIDEO WALL
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Panel: Video Player & Description */}
        <div className="lg:col-span-7 space-y-6">
          {/* Native YouTube Player Container (IFrame direct mount with API binding) */}
          <div className="bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-3xl overflow-hidden aspect-video shadow-2xl relative z-10">
            <iframe
              id="globetube-player"
              ref={playerRef}
              src={`https://www.youtube.com/embed/${initialVideoId}?enablejsapi=1&rel=0&playsinline=1&modestbranding=1&autoplay=1`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Metadata Panel */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 md:p-8 space-y-4 transition-colors duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-black text-[#00b875] tracking-widest uppercase">{video.channel}</p>
                <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white leading-snug">
                  {video.title}
                </h2>
              </div>
            </div>
            
            {/* Quick Load Video Input Bar (only visible to teachers) */}
            {activeRole !== 'student' && (
              <>
                <div className="h-px bg-slate-200 dark:bg-slate-800" />
                <div className="pt-2">
                  <form onSubmit={handleQuickLoad} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Quick load another YouTube URL..."
                      value={quickUrl}
                      onChange={(e) => setQuickUrl(e.target.value)}
                      className="flex-grow px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-[#00b875] outline-none rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#00b875] hover:bg-[#009e63] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border-none"
                    >
                      LOAD
                    </button>
                  </form>
                  {quickLoadError && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1.5">{quickLoadError}</p>
                  )}
                </div>
              </>
            )}

            <div className="h-px bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">Video Case Description</h4>
              <p className="text-xs font-medium text-slate-650 dark:text-slate-400 leading-relaxed">
                {video.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Quiz & Syllabus classification Engine */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 md:p-8 space-y-8 backdrop-blur-sm relative min-h-[400px] flex flex-col transition-colors duration-300">
            
            {/* Header of Quiz panel */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#00b875] flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Syllabus Quiz Engine</h3>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-550 uppercase tracking-widest mt-0.5">Gemini 3.5 Flash Real-Time MCQs</p>
                </div>
              </div>
              
              {/* Teacher Export Utilities */}
              {activeRole !== 'student' && quizData && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleDownloadPDF}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#00b875] hover:text-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase rounded-lg tracking-wider transition-all cursor-pointer flex items-center gap-1"
                    title="Download PDF"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadDOCX}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-500 hover:text-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase rounded-lg tracking-wider transition-all cursor-pointer flex items-center gap-1"
                    title="Download DOCX"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>DOCX</span>
                  </button>
                </div>
              )}
            </div>

            {/* Loader */}
            {loadingQuiz && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 text-[#00b875] animate-spin" />
                <div className="text-center">
                  <p className="text-xs font-bold text-[#00b875] uppercase tracking-widest animate-pulse">Running Curriculum Matrix...</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">Generating 5 High-Precision MCQs</p>
                </div>
              </div>
            )}

            {/* API Key or General Errors */}
            {quizError && (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center space-y-4">
                <XCircle className="w-10 h-10 text-red-500" />
                <div className="space-y-2 max-w-sm">
                  <h4 className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-wider">Quiz Generation Failed</h4>
                  <p className="text-[11px] font-medium text-slate-650 dark:text-slate-400 leading-relaxed">{quizError}</p>
                </div>
                <button
                  onClick={handleGenerateQuiz}
                  className="px-5 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none"
                >
                  Retry Generation
                </button>
              </div>
            )}

            {/* Initial State - Generate Button */}
            {!loadingQuiz && !quizData && !quizError && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
                <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <div className="space-y-2 max-w-xs">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider">No Active Quiz</h4>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-500 leading-relaxed">
                    Analyze the video content against the IB Diploma Programme Geography syllabus and test active listening.
                  </p>
                </div>
                <button
                  onClick={handleGenerateQuiz}
                  className="px-6 py-4 bg-[#00b875] hover:bg-[#009e63] text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.99] shadow-lg shadow-emerald-500/10 cursor-pointer transition-all w-full border-none"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  GENERATE SYLLABUS QUIZ
                </button>
              </div>
            )}

            {/* Quiz Content */}
            {!loadingQuiz && quizData && (
              <div className="flex-1 flex flex-col justify-between space-y-8 animate-in fade-in zoom-in-95 duration-200">
                {/* Unit & Syllabus connection Header */}
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 rounded-2xl p-5 space-y-3 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Classified Unit:</span>
                    <span className={`px-2 py-0.5 text-[9px] font-black tracking-wider border rounded-full uppercase cursor-default ${getUnitColor(quizData.unit_tag)}`}>
                      {quizData.unit_tag}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-900" />
                  <div className="space-y-1">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-[#00b875]">Syllabus Connection</h5>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{quizData.syllabus_connection}"
                    </p>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-8">
                  {quizData.quiz.map((q) => {
                    const isCorrect = userAnswers[q.question_number] === q.correct_answer;
                    const isAnswered = !!userAnswers[q.question_number];

                    return (
                      <div key={q.question_number} className="space-y-3">
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-snug flex items-start gap-2">
                          <span className="text-[#00b875] font-mono">{q.question_number}.</span>
                          <span>{q.question}</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt) => {
                            const isSelected = userAnswers[q.question_number] === opt;
                            const isThisCorrect = opt === q.correct_answer;

                            let btnStyles = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-700 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200";
                            
                            if (quizSubmitted) {
                              if (isSelected) {
                                btnStyles = isThisCorrect 
                                  ? "border-green-500/40 bg-green-500/10 text-green-650 dark:text-green-400 font-bold" 
                                  : "border-red-500/40 bg-red-500/10 text-red-650 dark:text-red-400 font-bold";
                              } else if (isThisCorrect) {
                                btnStyles = "border-green-500/40 bg-green-500/10 text-green-650 dark:text-green-400 font-bold";
                              } else {
                                btnStyles = "border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-650 opacity-60";
                              }
                            } else if (isSelected) {
                              btnStyles = "border-[#00b875] bg-emerald-500/5 dark:bg-emerald-500/10 text-[#00b875] font-bold";
                            }

                            return (
                              <button
                                key={opt}
                                disabled={quizSubmitted}
                                onClick={() => handleOptionSelect(q.question_number, opt)}
                                className={`w-full text-left p-3 text-xs border rounded-xl font-medium leading-relaxed transition-all flex items-center justify-between group disabled:opacity-100 ${btnStyles}`}
                              >
                                <span>{opt}</span>
                                <div className="flex-shrink-0 ml-3">
                                  {quizSubmitted ? (
                                    isThisCorrect ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : isSelected ? (
                                      <XCircle className="w-4 h-4 text-red-500" />
                                    ) : null
                                  ) : isSelected ? (
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#00b875] flex items-center justify-center text-white">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border border-slate-200 dark:border-slate-800 group-hover:border-slate-400 dark:group-hover:border-slate-600" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quiz Footer - Score or Submit Button */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-900">
                  {quizSubmitted ? (
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-900 rounded-2xl p-5 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-505">Grading Output</h4>
                          <p className="text-lg font-black text-slate-800 dark:text-white">
                            Score: <span className={score >= 4 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>{score}</span> / 5
                          </p>
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          score === 5 ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/25' :
                          score >= 3 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25' :
                          'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/25'
                        }`}>
                          {score === 5 ? 'Perfect Study' : score >= 3 ? 'Competent' : 'Review Case'}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleResetQuiz}
                          className="flex-1 px-5 py-3.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
                        >
                          <RotateCcw className="w-4 h-4" />
                          RETRY QUIZ
                        </button>
                        <button
                          onClick={handleGenerateQuiz}
                          className="flex-1 px-5 py-3.5 bg-[#00b875] hover:bg-[#009e63] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
                        >
                          <Sparkles className="w-4 h-4 fill-white" />
                          NEW QUESTIONS
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(userAnswers).length < 5}
                      className="w-full py-4 bg-[#00b875] hover:bg-[#009e63] disabled:opacity-40 disabled:pointer-events-none text-white rounded-2xl text-xs font-black uppercase tracking-wider active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 border-none"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      SUBMIT QUIZ FOR GRADING
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
