import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Copy,
  RefreshCw,
  Send,
  Loader2,
  BookOpen,
  Sun,
  Moon,
  Play,
  Pause,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  FileDown,
  FileText,
  Edit3,
} from "lucide-react";
import { jsPDF } from "jspdf";

type PaperTuple =
  | "Paper 1: Physical Geography"
  | "Paper 2: Human Geography"
  | "";
type CommandWordTuple = "Explain" | "Evaluate" | "Justify" | "";

interface Topic {
  id: string;
  name: string;
}

const PAPER_1_TOPICS: Topic[] = [
  { id: "PH1", name: "PH1: Rivers" },
  { id: "PH2", name: "PH2: Coasts" },
  { id: "PH3", name: "PH3: Ecosystems" },
  { id: "PH4", name: "PH4: Tectonic Hazards" },
  { id: "PH5", name: "PH5: Climate Change" },
];

const PAPER_2_TOPICS: Topic[] = [
  { id: "HU6", name: "HU6: Population" },
  { id: "HU7", name: "HU7: Towns & Cities" },
  { id: "HU8", name: "HU8: Development" },
  { id: "HU9", name: "HU9: Economies" },
  { id: "HU10", name: "HU10: Resource Provision" },
];

const COMMAND_WORDS: CommandWordTuple[] = ["Explain", "Evaluate", "Justify"];

function TeacherTimer() {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [isActive, setIsActive] = useState(false);
  const [inputMinutes, setInputMinutes] = useState("10");

  const playDong = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3"); // A deep bell/gong sound
    audio.play().catch(e => console.error("Error playing sound:", e));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playDong();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    const mins = parseInt(inputMinutes) || 10;
    setTimeLeft(mins * 60);
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  const handleSetTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMinutes(val);
    const mins = parseInt(val) || 0;
    if (!isActive) {
      setTimeLeft(mins * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 lg:gap-4 bg-slate-100 dark:bg-slate-800/50 rounded-full py-1.5 px-3 border border-slate-200 dark:border-slate-700/50">
      <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-3">
        <input
          type="number"
          value={inputMinutes}
          onChange={handleSetTime}
          className="w-10 text-sm bg-transparent border-none p-0 text-right outline-none focus:ring-0 text-slate-700 dark:text-slate-300 font-medium"
          min="1"
          max="99"
        />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          m
        </span>
      </div>

      <div className="w-16 text-center text-xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-tight">
        {formatTime(timeLeft)}
      </div>

      <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-600 pl-3">
        <button
          onClick={toggleTimer}
          className={`p-1.5 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-amber-100/80 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60" : "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"}`}
        >
          {isActive ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
        </button>
        <button
          onClick={resetTimer}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

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
  const [paper, setPaper] = useState<PaperTuple>("");
  const [topic, setTopic] = useState<string>("");
  const [commandWord, setCommandWord] = useState<CommandWordTuple>("");
  const [customFocus, setCustomFocus] = useState("");

  const [localDark, setLocalDark] = useState(false);
  const isDark = propIsDark !== undefined ? propIsDark : localDark;
  const setIsDark = propToggleDark || (() => setLocalDark(!localDark));

  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [isMarkSchemeOpen, setIsMarkSchemeOpen] = useState(true);
  const [isStartersOpen, setIsStartersOpen] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    question: string;
    justifyOptions?: { title: string; description: string }[];
    markScheme: string;
    starters: string[];
  } | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customOptions, setCustomOptions] = useState<{ title: string; description: string }[]>([]);

  const activeTopics =
    paper === "Paper 1: Physical Geography"
      ? PAPER_1_TOPICS
      : paper === "Paper 2: Human Geography"
        ? PAPER_2_TOPICS
        : [];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Reset topic if paper changes and old topic is no longer valid
  React.useEffect(() => {
    if (paper) {
      if (!activeTopics.find((t) => t.id === topic)) {
        setTopic("");
      }
    }
  }, [paper]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paper || !topic || !commandWord) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const topicObj = activeTopics.find((t) => t.id === topic);

    try {
      const response = await fetch("/api/highfive/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper,
          topic: topicObj?.name,
          commandWord,
          customFocus,
        }),
      });

      if (!response.ok) {
        let msg = "Failed to generate content.";
        try {
          const resJson = await response.json();
          msg = resJson.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await response.json();
      setResult(data);
      setCustomQuestion(data.question);
      setCustomOptions(data.justifyOptions || []);
      setIsControlsOpen(false);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const downloadWorksheet = () => {
    if (!result) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(29, 92, 249); // IGCSE Blue
    doc.text("IGCSE 0460 HIGH 5", margin, currentY);

    currentY += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`${paper} - Student Worksheet`, margin, currentY);

    currentY += 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Question:", margin, currentY);

    currentY += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const splitQuestion = doc.splitTextToSize(
      customQuestion,
      pageWidth - 2 * margin,
    );
    doc.text(splitQuestion, margin, currentY);
    currentY += splitQuestion.length * 6 + 5;
    
    // Justify Options if any
    if (customOptions && customOptions.length > 0) {
      customOptions.forEach((opt, i) => {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.text(
          `[ ] Option ${String.fromCharCode(65 + i)}: ${opt.title}`,
          margin,
          currentY,
        );
        currentY += 6;
        doc.setFont("helvetica", "italic");
        const splitDesc = doc.splitTextToSize(
          opt.description,
          pageWidth - 3 * margin,
        );
        doc.text(splitDesc, margin + 5, currentY);
        currentY += splitDesc.length * 6 + 4;
      });
      currentY += 10;
    }

    // Response lines
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Your Response:", margin, currentY);
    currentY += 10;

    for (let i = 0; i < 10; i++) {
      if (currentY > 285) {
        doc.addPage();
        currentY = 20;
      }
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 12;
    }

    doc.save("IGCSE_Geography_Worksheet.pdf");
  };

  const downloadScaffold = () => {
    if (!result) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(29, 92, 249);
    doc.text("Scaffold & Sentence Starters", margin, currentY);

    currentY += 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Question Context:", margin, currentY);

    currentY += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const splitQ = doc.splitTextToSize(customQuestion, pageWidth - 2 * margin);
    doc.text(splitQ, margin, currentY);
    currentY += splitQ.length * 5 + 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Sentence Starters:", margin, currentY);
    currentY += 10;

    result.starters.forEach((starter, i) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const splitStarter = doc.splitTextToSize(
        `${i + 1}. ${starter}`,
        pageWidth - 2 * margin,
      );
      doc.text(splitStarter, margin, currentY);
      currentY += splitStarter.length * 6 + 10;

      if (currentY > 280) {
        doc.addPage();
        currentY = 20;
      }
    });

    doc.save("IGCSE_Geography_Scaffold.pdf");
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col overflow-hidden transition-colors">
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-10 transition-colors">
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1d5cf9] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-[24px] tracking-tight">
              IG
            </span>
          </div>
          <div className="flex flex-col justify-center mt-1">
            <h1 className="text-[24px] font-black text-[#1d5cf9] uppercase tracking-tight leading-none">
              0460 HIGH 5
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 sm:mt-1.5 leading-none">
              EXAM GENERATOR ENGINE
            </p>
          </div>
        </div>

        <div className="flex items-center pr-2 gap-4">
          <div className="hidden md:block">
            <TeacherTimer />
          </div>
          <button
            onClick={() => setIsDark()}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="px-4 py-2 bg-red-50 text-red-650 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-all shrink-0"
            >
              EXIT
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col flex-1 overflow-hidden min-h-0 max-w-[1600px] mx-auto w-full">
        {/* Top Controls */}
        <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 transition-colors z-0 flex flex-col justify-center">
          <button
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isControlsOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isControlsOpen && (
            <div className="w-full max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 p-4 pt-0 sm:p-6 sm:pt-0 items-start xl:items-stretch">
              <form
                onSubmit={handleGenerate}
                className="flex flex-col gap-4 w-full flex-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Paper Dropdown */}
                  <select
                    id="paper"
                    value={paper}
                    onChange={(e) => setPaper(e.target.value as PaperTuple)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-black dark:text-white focus:ring-2 focus:ring-[#1d5cf9] outline-none transition-colors"
                    required
                  >
                    <option value="" disabled>
                      Select Paper...
                    </option>
                    <option value="Paper 1: Physical Geography">
                      Paper 1: Physical Geography
                    </option>
                    <option value="Paper 2: Human Geography">
                      Paper 2: Human Geography
                    </option>
                  </select>

                  {/* Topic Dropdown */}
                  <select
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-black dark:text-white focus:ring-2 focus:ring-[#1d5cf9] outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!paper}
                    required
                  >
                    <option value="" disabled>
                      Select Unit...
                    </option>
                    {activeTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  {/* Command Word Dropdown */}
                  <select
                    id="commandWord"
                    value={commandWord}
                    onChange={(e) =>
                      setCommandWord(e.target.value as CommandWordTuple)
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-black dark:text-white focus:ring-2 focus:ring-[#1d5cf9] outline-none transition-colors"
                    required
                  >
                    <option value="" disabled>
                      Select Command...
                    </option>
                    {COMMAND_WORDS.map((cw) => (
                      <option key={cw} value={cw}>
                        {cw}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="customFocus" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Specific Case Study Focus (Optional)
                  </label>
                  <input
                    id="customFocus"
                    type="text"
                    value={customFocus}
                    onChange={(e) => setCustomFocus(e.target.value)}
                    placeholder="e.g. Kenya flood management, Vietnam coastlines..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-black dark:text-white focus:ring-2 focus:ring-[#1d5cf9] outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !paper || !topic || !commandWord}
                  className="w-full bg-[#1d5cf9] hover:bg-[#154ad3] disabled:bg-[#5a86fb] text-white text-[15px] font-bold py-3 rounded-lg shadow-lg shadow-[#1d5cf9]/20 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Generate Materials</span>
                      <Send className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>

                {error && (
                  <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/50 text-rose-600 dark:text-rose-400 text-sm p-3 rounded-lg mt-2">
                    {error}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Main Content (Bento Grid) */}
        <main className="flex-1 min-h-0 p-4 lg:p-8 overflow-y-auto">
          {!result && !loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px] transition-colors">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-4 transition-colors">
                <RefreshCw className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
                Awaiting Parameters
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Select a paper, dynamic topic, and command word from the sidebar
                controls to generate IGCSE 0460 aligned questions and mark
                schemes.
              </p>
            </div>
          ) : loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px] transition-colors">
              <Loader2 className="w-10 h-10 animate-spin text-[#1d5cf9] mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
                Synthesizing Materials
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                Generating scenario-based questions and structured mark
                schemes...
              </p>
            </div>
          ) : result ? (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
              {/* The Question */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col transition-colors shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-6 bg-[#1d5cf9] rounded-full"></div>
                    <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      The Question
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadWorksheet}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Worksheet (PDF)
                    </button>
                    <button
                      onClick={downloadScaffold}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Scaffold (PDF)
                    </button>
                  </div>
                </div>
                
                <div className="relative group">
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit3 className="w-4 h-4 text-slate-400" />
                   </div>
                   <textarea
                     value={customQuestion}
                     onChange={(e) => setCustomQuestion(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/50 focus:border-[#1d5cf9]/50 focus:ring-4 focus:ring-[#1d5cf9]/5 rounded-xl p-4 text-[16px] font-medium leading-relaxed text-slate-800 dark:text-slate-200 resize-none outline-none transition-all min-h-[120px]"
                     rows={3}
                   />
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 w-full pr-2 mt-2">
                  {customOptions &&
                    customOptions.length > 0 && (
                      <div className="mt-6 border border-slate-200 dark:border-slate-700/50 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950/50">
                        <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                            {customOptions.map((opt, i) => (
                              <tr key={i}>
                                <td className="p-4 align-top w-12 border-r border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900">
                                  <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 mt-1"></div>
                                </td>
                                <td className="p-4 align-top bg-white dark:bg-slate-900 group">
                                  <input
                                    type="text"
                                    value={opt.title}
                                    onChange={(e) => {
                                      const newOptions = [...customOptions];
                                      newOptions[i].title = e.target.value;
                                      setCustomOptions(newOptions);
                                    }}
                                    className="font-bold block w-full bg-transparent border-none focus:ring-1 focus:ring-[#1d5cf9]/30 rounded px-1 -mx-1 mb-1 outline-none"
                                  />
                                  <textarea
                                    value={opt.description}
                                    onChange={(e) => {
                                      const newOptions = [...customOptions];
                                      newOptions[i].description = e.target.value;
                                      setCustomOptions(newOptions);
                                    }}
                                    className="text-slate-600 dark:text-slate-400 w-full bg-transparent border-none focus:ring-1 focus:ring-[#1d5cf9]/30 rounded px-1 -mx-1 outline-none resize-none"
                                    rows={1}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                </div>
              </section>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start shrink-0">
                {/* The 1-5 Mark Scheme */}
                <section
                  className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col transition-colors ${!isMarkSchemeOpen ? "h-20 overflow-hidden" : "h-auto"}`}
                >
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        1–5 Mark Scheme
                      </h2>
                    </div>
                    <button
                      onClick={() => setIsMarkSchemeOpen(!isMarkSchemeOpen)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {isMarkSchemeOpen ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {isMarkSchemeOpen && (
                    <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 pr-2">
                      <div className="markdown-body">
                        <Markdown>{result.markScheme}</Markdown>
                      </div>
                    </div>
                  )}
                </section>

                {/* The Sentence Starters */}
                <section
                  className={`bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-800 dark:border-slate-900 shadow-xl p-6 flex flex-col transition-colors ${!isStartersOpen ? "h-20 overflow-hidden" : "h-auto"}`}
                >
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-6 bg-cyan-400 rounded-full"></div>
                      <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">
                        Sentence Starters
                      </h2>
                    </div>
                    <button
                      onClick={() => setIsStartersOpen(!isStartersOpen)}
                      className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      {isStartersOpen ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {isStartersOpen && (
                    <div className="space-y-3">
                      {result.starters.map((starter, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 font-sans text-sm text-cyan-50 flex gap-3"
                        >
                          <span className="text-slate-500 shrink-0 font-mono">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <p className="leading-relaxed">{starter}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
