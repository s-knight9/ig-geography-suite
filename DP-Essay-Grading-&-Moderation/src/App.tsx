import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  GraduationCap, 
  Send, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  HelpCircle,
  Mic,
  MicOff,
  Sun,
  Moon,
  FolderOpen,
  Save,
  FileDown,
  FileUp,
  Loader2,
  Pencil
} from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
// @ts-expect-error - Vite specific import suffix
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker source for pdfjs using the local worker bundled by Vite
if (pdfWorker) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

import ReactMarkdown from "react-markdown";
import { ClassFolder, AssignmentFolder, SubFolder, SavedEssay, PaperType, MarkValue } from "./types";
import SaveAssessmentModal from "./components/SaveAssessmentModal";
import ArchiveView from "./components/ArchiveView";
import { 
  downloadEssayAsPDF, 
  downloadEssayAsDocx, 
  downloadReportAsPDF, 
  downloadReportAsDocx 
} from "./utils/exportUtils";

interface AssessmentResponse {
  feedback: string;
}

const VALID_TEACHERS = ["SKN", "JRD", "JBO", "CHE", "SMK", "SSH", "JTE", "CMA", "MDJ"];

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
  const [activeTeacherState, setActiveTeacherState] = useState<string | null>(activeTeacherCode || "SKN");
  const activeTeacher = activeTeacherState;
  const setActiveTeacher = setActiveTeacherState;
  
  const [currentView, setCurrentView] = useState<"grader" | "archive">("grader");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [entryMode, setEntryMode] = useState<"single" | "multiple">("single");
  const [entryClassId, setEntryClassId] = useState<string>("");
  const [entryAssignmentId, setEntryAssignmentId] = useState<string>("");
  const [continueAssignment, setContinueAssignment] = useState(false);

  const [classes, setClasses] = useState<ClassFolder[]>(() => {
    try { return JSON.parse(localStorage.getItem('classes') || '[]'); } catch { return []; }
  });
  const [assignments, setAssignments] = useState<AssignmentFolder[]>(() => {
    try { return JSON.parse(localStorage.getItem('assignments') || '[]'); } catch { return []; }
  });
  const [subFolders, setSubFolders] = useState<SubFolder[]>(() => {
    try { return JSON.parse(localStorage.getItem('subFolders') || '[]'); } catch { return []; }
  });
  const [savedEssays, setSavedEssays] = useState<SavedEssay[]>(() => {
    try { return JSON.parse(localStorage.getItem('savedEssays') || '[]'); } catch { return []; }
  });

  React.useEffect(() => {
    if (activeTeacher) {
      // Ensure default structure for Single Entries
      const singleClassId = `single_${activeTeacher}`;
      const p1Id = `p1_${activeTeacher}`;
      const p2Id = `p2_${activeTeacher}`;
      const p3Id = `p3_${activeTeacher}`;

      setClasses(prev => {
        if (prev.some(c => c.id === singleClassId)) return prev;
        return [...prev, { id: singleClassId, teacherId: activeTeacher, name: "Single Entries" }];
      });

      setAssignments(prev => {
        let next = [...prev];
        let changed = false;
        if (!prev.some(a => a.id === p1Id || (a.classId === singleClassId && a.name === "Paper 1 Essays"))) {
          next.push({ id: p1Id, classId: singleClassId, name: "Paper 1 Essays" });
          changed = true;
        }
        if (!prev.some(a => a.id === p2Id || (a.classId === singleClassId && a.name === "Paper 2 Essays"))) {
          next.push({ id: p2Id, classId: singleClassId, name: "Paper 2 Essays" });
          changed = true;
        }
        if (!prev.some(a => a.id === p3Id || (a.classId === singleClassId && a.name === "Paper 3 Essays"))) {
          next.push({ id: p3Id, classId: singleClassId, name: "Paper 3 Essays" });
          changed = true;
        }
        return changed ? next : prev;
      });
    }
  }, [activeTeacher]);

  React.useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
  }, [classes]);

  React.useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

  React.useEffect(() => {
    localStorage.setItem('subFolders', JSON.stringify(subFolders));
  }, [subFolders]);

  React.useEffect(() => {
    localStorage.setItem('savedEssays', JSON.stringify(savedEssays));
  }, [savedEssays]);

  const handleCreateClass = (name: string) => {
    if (!activeTeacher) return;
    setClasses(prev => [...prev, { id: Date.now().toString(), teacherId: activeTeacher, name }]);
  };

  const handleCreateAssignment = (name: string, classId: string) => {
    setAssignments(prev => [...prev, { id: Date.now().toString(), classId, name }]);
  };

  const handleCreateSubFolder = (name: string, assignmentId: string) => {
    setSubFolders(prev => [...prev, { id: Date.now().toString(), assignmentId, name }]);
  };

  const handleRenameClass = (id: string, newName: string) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleRenameAssignment = (id: string, newName: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, name: newName } : a));
  };

  const handleRenameSubFolder = (id: string, newName: string) => {
    setSubFolders(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const handleRenameEssay = (id: string, newName: string) => {
    setSavedEssays(prev => prev.map(e => e.id === id ? { ...e, studentName: newName } : e));
  };

  const handleDeleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    setAssignments(prev => prev.filter(a => a.classId !== id)); // Cascade delete assignments
    setSavedEssays(prev => prev.filter(e => e.classId !== id)); // Cascade delete essays
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    setSubFolders(prev => prev.filter(s => s.assignmentId !== id)); // Cascade delete subfolders
    setSavedEssays(prev => prev.filter(e => e.assignmentId !== id)); // Cascade delete essays
  };

  const handleDeleteSubFolder = (id: string) => {
    setSubFolders(prev => prev.filter(s => s.id !== id));
    setSavedEssays(prev => prev.filter(e => e.subFolderId !== id)); // Cascade delete essays
  };

  const handleDeleteEssay = (id: string) => {
    setSavedEssays(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateTeacherScore = (id: string, score: number) => {
    setSavedEssays(prev => prev.map(e => 
      e.id === id ? { ...e, teacherScore: score } : e
    ));
  };

  const handleMoveEssay = (essayId: string, targetClassId: string, targetAssignmentId: string, targetSubFolderId?: string) => {
    setSavedEssays(prev => prev.map(e => 
      e.id === essayId 
        ? { ...e, classId: targetClassId, assignmentId: targetAssignmentId, subFolderId: targetSubFolderId } 
        : e
    ));
  };

  const [showContinueModal, setShowContinueModal] = useState(false);
  const savedDocRef = React.useRef<SavedEssay | null>(null);

  const handleSaveAssessment = (doc: Omit<SavedEssay, 'id' | 'date'>) => {
    if (!activeTeacher) return;
    const newDoc: SavedEssay = {
      ...doc,
      teacherId: activeTeacher,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    setSavedEssays(prev => [newDoc, ...prev]);
    setShowSaveModal(false);

    if (entryMode === "multiple") {
      savedDocRef.current = newDoc;
      setShowContinueModal(true);
    } else {
      resetForm();
    }
  };

  const handleContinueNext = (shouldContinue: boolean) => {
    setShowContinueModal(false);
    if (shouldContinue && savedDocRef.current) {
      setContinueAssignment(true);
      setEssay("");
      setCandidateName("");
      setAssessment(null);
      setError(null);
      if (savedDocRef.current.classId) setEntryClassId(savedDocRef.current.classId);
      if (savedDocRef.current.assignmentId) setEntryAssignmentId(savedDocRef.current.assignmentId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setContinueAssignment(false);
      resetForm();
      setEntryClassId("");
      setEntryAssignmentId("");
    }
    savedDocRef.current = null;
  };

  const [localDarkMode, setLocalDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const darkMode = propIsDark !== undefined ? propIsDark : localDarkMode;
  const setDarkMode = (val?: boolean) => {
    if (propToggleDark !== undefined) {
      propToggleDark();
    } else {
      setLocalDarkMode(val !== undefined ? val : !localDarkMode);
    }
  };

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const [paper, setPaper] = useState<PaperType>("1");
  const [marks, setMarks] = useState<MarkValue>("10");
  const [candidateName, setCandidateName] = useState("");
  const [question, setQuestion] = useState("");
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [currentTeacherScore, setCurrentTeacherScore] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isExtractingPDF, setIsExtractingPDF] = useState(false);
  const recognitionRef = React.useRef<any>(null);
  const shouldListenRef = React.useRef(false);

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }

    setIsExtractingPDF(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true
      }).promise;
      
      let fullText = "";
      const images: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        
        // 1. Try text extraction first
        const textContent = await page.getTextContent();
        let lastY: number | undefined;
        let pageText = "";
        
        for (const item of textContent.items as any[]) {
          if (lastY !== undefined && Math.abs(lastY - item.transform[5]) > 2) {
            pageText += "\n";
          }
          pageText += item.str;
          lastY = item.transform[5];
        }
        fullText += pageText + "\n\n";

        // 2. Prepare for OCR if this looks like a scanned page (no text or we want high accuracy for handwriting)
        // We'll render the page to a canvas regardless for OCR fallback
        const viewport = page.getViewport({ scale: 1.5 }); // 1.5 is usually plenty for Gemini
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          // Use any for render params to bypass strict pdfjs type which can be finicky across versions
          await (page as any).render({ canvasContext: context, viewport }).promise;
          images.push(canvas.toDataURL("image/jpeg", 0.7)); // Reduced quality slightly to save bandwidth
        }

        if (i >= 12) break; // Safety limit for OCR processing
      }

      const extractedText = fullText.trim();
      
      if (!extractedText || extractedText.length < 50) {
        // If very little text found, it's likely a scan. Start OCR.
        setIsExtractingPDF(true); // Persist loading state
        const response = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images })
        });
        
        const data = await response.json();
        if (data.transcription) {
          setEssay(data.transcription);
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          setError("No text could be extracted or transcribed from this PDF.");
        }
      } else {
        setEssay(extractedText);
      }
    } catch (err: any) {
      console.error("PDF Extraction error:", err);
      setError("Failed to extract text from PDF. Please ensure the file is not password-protected.");
    } finally {
      setIsExtractingPDF(false);
      // Reset input
      event.target.value = "";
    }
  };

  const toggleDictation = () => {
    if (isListening) {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false; // Only get final results to avoid duplicate text
    recognition.lang = "en-US";
    shouldListenRef.current = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript: string = event.results[event.results.length - 1][0].transcript;
      
      // Process dictated punctuation and formatting
      transcript = transcript
        .replace(/\s*\bfull stop\b\s*/gi, '. ')
        .replace(/\s*\bcomma\b\s*/gi, ', ')
        .replace(/\s*\bnew paragraph\b\s*/gi, '\n\n');

      setEssay((prev) => {
        let newContent = prev;
        let toAdd = transcript.replace(/^ +/, ''); // Strip leading spaces

        // If the new transcript starts with punctuation or newline, remove any trailing spaces from previous content
        if (/^[.,\n]/.test(toAdd)) {
          newContent = newContent.replace(/ +$/, '');
        }

        if (!newContent) {
          return toAdd.replace(/(^\s*|[.!?]\s+|\n+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
        }

        const needsSpace = !/( |\n)$/.test(newContent) && !/^[.,\n]/.test(toAdd);
        let finalContent = newContent + (needsSpace ? " " : "") + toAdd;
        return finalContent.replace(/(^\s*|[.!?]\s+|\n+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
      });
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'no-speech') {
        setError(`Microphone error: ${event.error}`);
        shouldListenRef.current = false;
      }
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Constraint logic for marks
  React.useEffect(() => {
    if (paper === "1" || paper === "2") {
      setMarks("10");
    } else if (paper === "3" && marks === "10") {
      setMarks("12");
    }
  }, [paper]);

  const handleAssess = async () => {
    if (!question.trim() || !essay.trim()) {
      setError("Please provide both the question and the essay text.");
      return;
    }

    setLoading(true);
    setError(null);
    setAssessment(null);

    try {
      const response = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper, marks, question, essay }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate assessment.");
      }

      const data: AssessmentResponse = await response.json();
      setAssessment(data.feedback);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAssessment(null);
    setCurrentTeacherScore(undefined);
    setEssay("");
    setCandidateName("");
    setQuestion("");
    setError(null);
  };

  const extractScoreRaw = (assessmentRaw: string): number => {
    if (!assessmentRaw) return -1;
    const match = assessmentRaw.match(/Final mark[^\d]*(\d+(?:\.\d+)?)/i);
    if (match) return parseFloat(match[1]);
    return -1;
  };

  const currentTeacherClasses = classes.filter(c => c.teacherId === activeTeacher);
  const currentTeacherEssays = savedEssays.filter(e => e.teacherId === activeTeacher);

  const handleLogin = (code: string, pass: string) => {
    const codeUpper = code.trim().toUpperCase();
    if (pass !== "strikeslip") {
      alert("Invalid Password.");
      return;
    }
    if (VALID_TEACHERS.includes(codeUpper)) {
      setActiveTeacher(codeUpper);
    } else {
      alert("Invalid Teacher Code.");
    }
  };

  if (!activeTeacher) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors relative">
        <div className="absolute top-4 right-4">
            <button
               title="Toggle Dark Mode"
               onClick={() => setDarkMode(!darkMode)}
               className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
        <div className="max-w-[420px] w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm px-10 py-12 text-center">
          <div className="mx-auto mb-6 bg-logo-green w-16 h-16 flex items-center justify-center rounded-xl shadow-sm">
            <span className="text-white font-black text-2xl tracking-tight">DP</span>
          </div>
          <h1 className="text-[22px] font-black tracking-tight text-slate-900 dark:text-slate-100 mb-2">Essay Grading & Moderation</h1>
          <p className="text-[10px] text-slate-500 mb-10 uppercase tracking-wider font-bold">ENTER TEACHER CREDENTIALS</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            handleLogin(fd.get("code") as string, fd.get("password") as string);
          }} className="space-y-4">
             <input autoFocus name="code" type="text" placeholder="ENTER TEACHER CODE" className="w-full bg-white dark:bg-slate-950 border border-brand-200 dark:border-brand-800 rounded-md px-4 py-3 text-center text-sm font-bold uppercase tracking-widest focus:ring-1 focus:ring-logo-green focus:border-logo-green outline-none dark:text-white placeholder:text-slate-400/80 transition-shadow" autoComplete="off" />
             <input name="password" type="password" placeholder="ENTER PASSWORD" className="w-full bg-white dark:bg-slate-950 border border-brand-200 dark:border-brand-800 rounded-md px-4 py-3 text-center text-sm font-bold uppercase tracking-widest focus:ring-1 focus:ring-logo-green focus:border-logo-green outline-none dark:text-white placeholder:text-slate-400/80 transition-shadow" />
             <button type="submit" className="w-full bg-logo-green text-white font-bold uppercase tracking-widest text-sm py-3 px-4 rounded-md hover:bg-logo-green/90 transition-colors mt-2 shadow-sm">LOGIN</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-brand-100 dark:selection:bg-brand-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-logo-green rounded-xl blur-sm opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-logo-green w-12 h-12 flex items-center justify-center rounded-xl shadow-lg ring-1 ring-brand-700/20">
                <span className="text-white font-black text-xl tracking-tighter">DP</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-logo-green leading-none">
                Essay Grading <span className="text-slate-400 dark:text-slate-500 font-light">&</span> Moderation
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Grading to the IBDP Geo Spec</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4 items-center">
            {currentView === "grader" && (
              <button
                title="View Archives"
                onClick={() => setCurrentView("archive")}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                <FolderOpen size={16} />
              </button>
            )}
            <button
               title="Toggle Dark Mode"
               onClick={() => setDarkMode(!darkMode)}
               className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
               {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
                title="Log Out"
                onClick={() => {
                  if (onBackToPortal) onBackToPortal();
                }}
                className="flex items-center justify-center w-9 h-9 border border-red-200 dark:border-red-900/50 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                <span className="text-[9px] font-black uppercase">Exit</span>
              </button>
            <div className="hidden sm:block bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Standard</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">MAY 2026</p>
            </div>
            {assessment && currentView === "grader" && (
               <div className="bg-brand-50 dark:bg-brand-900/30 px-4 py-2 rounded border border-brand-200 dark:border-brand-800 text-center shadow-sm">
                <p className="text-[9px] text-brand-700 dark:text-brand-400 uppercase font-black tracking-widest leading-none mb-1">Score Result</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-black text-brand-900 dark:text-brand-300 uppercase">PAPER {paper}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {currentView === "archive" ? (
        <ArchiveView 
          classes={currentTeacherClasses}
          assignments={assignments}
          subFolders={subFolders}
          essays={currentTeacherEssays}
          onBack={() => setCurrentView("grader")}
          onRenameClass={handleRenameClass}
          onRenameAssignment={handleRenameAssignment}
          onRenameSubFolder={handleRenameSubFolder}
          onRenameEssay={handleRenameEssay}
          onDeleteClass={handleDeleteClass}
          onDeleteAssignment={handleDeleteAssignment}
          onDeleteSubFolder={handleDeleteSubFolder}
          onDeleteEssay={handleDeleteEssay}
          onMoveEssay={handleMoveEssay}
          onUpdateTeacherScore={handleUpdateTeacherScore}
          onCreateClass={handleCreateClass}
          onCreateAssignment={handleCreateAssignment}
          onCreateSubFolder={handleCreateSubFolder}
          activeTeacher={activeTeacher}
        />
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Input Panel */}
          <div className={`space-y-6 ${assessment ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}`}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800"
            >
              <h2 className="mb-6 flex items-center justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="flex items-center gap-2">
                  <FileText size={14} className="text-logo-green" />
                  Assessment Data Entry
                </span>
                {activeTeacher && <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 px-2 py-0.5 rounded font-bold">{activeTeacher}</span>}
              </h2>

              <div className="mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <label className="badge-label block mb-3">Workflow Mode</label>
                <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded">
                  <button
                    onClick={() => setEntryMode("single")}
                    className={`flex-1 flex flex-col items-center justify-center p-2 rounded text-xs font-bold transition-all ${
                      entryMode === "single"
                        ? "bg-white dark:bg-slate-800 text-logo-green shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <span>Single Entry</span>
                  </button>
                  <button
                    onClick={() => setEntryMode("multiple")}
                    className={`flex-1 flex flex-col items-center justify-center p-2 rounded text-xs font-bold transition-all ${
                      entryMode === "multiple"
                        ? "bg-white dark:bg-slate-800 text-logo-green shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <span>Batch Assignment</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 mb-6">
                <div>
                  <label className="badge-label block">Examination Paper</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["1", "2", "3"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPaper(p as PaperType)}
                        className={`rounded px-2 py-2 text-xs font-black transition-all border ${
                          paper === p 
                            ? "border-logo-green bg-logo-green text-white shadow-lg shadow-brand-200 dark:shadow-none" 
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        P{p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="badge-label block">Max Score</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(paper === "3" ? ["12", "16"] : ["10"]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMarks(m as MarkValue)}
                        className={`rounded px-2 py-2 text-xs font-black transition-all border ${
                          marks === m 
                            ? "border-logo-green bg-logo-green text-white shadow-lg shadow-brand-200 dark:shadow-none" 
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {m}M
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="candidateName" className="badge-label block">Candidate Name</label>
                  <input
                    id="candidateName"
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Enter student name..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-4 py-3 text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 transition-all focus:border-logo-green focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30"
                  />
                </div>

                <div>
                  <label htmlFor="question" className="badge-label block">Question Prompt</label>
                  <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter the official question text here..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-4 py-3 text-sm italic font-bold tracking-tight text-slate-800 dark:text-slate-200 transition-all focus:border-logo-green focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30 min-h-[60px]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="essay" className="badge-label block mb-0">Candidate Work</label>
                    <div className="flex items-center gap-2">
                      <label className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        isExtractingPDF
                          ? "bg-brand-100 text-brand-700 animate-pulse cursor-not-allowed"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-logo-green hover:text-white dark:hover:bg-logo-green dark:hover:text-white"
                      }`}>
                        {isExtractingPDF ? <Loader2 size={12} className="animate-spin" /> : <FileUp size={12} />}
                        {isExtractingPDF ? "Reading..." : "Upload PDF"}
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handlePDFUpload}
                          disabled={isExtractingPDF}
                          className="hidden"
                        />
                      </label>

                      <button 
                        onClick={toggleDictation}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          isListening 
                          ? "bg-red-500 text-white animate-pulse" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-logo-green hover:text-white dark:hover:bg-logo-green dark:hover:text-white"
                        }`}
                      >
                        {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                        {isListening ? "STOP AUDIO" : "DICTATE"}
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="essay"
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    placeholder="Paste candidate transcription or dictated text..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-all focus:border-logo-green focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30 min-h-[250px]"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 flex items-center gap-2 rounded bg-red-50 dark:bg-red-950/30 p-3 text-[10px] font-black text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900 uppercase tracking-widest"
                >
                  <AlertCircle size={14} />
                  SYSTEM ERROR: {error}
                </motion.div>
              )}

              <div className="mt-8 flex gap-3">
                <button
                  disabled={loading}
                  onClick={handleAssess}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-logo-green py-3.5 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-brand-200 dark:shadow-none transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCcw size={16} className="animate-spin" />
                      MARSHALLING DATA...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      GRADE ESSAY
                    </>
                  )}
                </button>
                <button
                  onClick={resetForm}
                  className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                >
                  RESET
                </button>
              </div>
            </motion.div>

            {/* Assessment Tip */}
            <div className="rounded-xl bg-slate-900 p-6 text-white overflow-hidden relative shadow-2xl ring-1 ring-white/10">
              <BookOpen size={60} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
              <h3 className="text-[10px] font-black text-logo-green uppercase tracking-[0.3em] mb-3">CRITERIA INTEL</h3>
              <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
                {paper === "3" 
                  ? `For ${marks} mark essays in Paper 3, ${marks === "16" ? "sustained evaluative thinking and multi-scalar synthesis are mandatory for Level 4." : "integrated evidence and systematic explanation of geographical interactions are prioritized."}` 
                  : "On Paper 1 & 2 (10 markers) To score in the top band (9-10), the response must be in-depth and purvey question-specific (topic and command term) concepts & analysis. Conclusive statements must be justified, thorough and well-developed with multiple perspectives."}
              </p>
            </div>
          </div>

          {/* Assessment Result Panel */}
          <div className={`lg:col-span-7 ${assessment ? 'block' : 'hidden lg:block lg:opacity-30 lg:pointer-events-none'}`}>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-inner dark:shadow-none"
                >
                  <RefreshCcw size={40} className="animate-spin text-indigo-600 mb-4" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Marking Assessment...</p>
                </motion.div>
              ) : assessment ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-6"
                >
                  {/* Result Header Badge */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm shadow-slate-100 dark:shadow-none">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-100 dark:bg-brand-900/50 p-3 rounded-xl">
                        <CheckCircle2 className="text-logo-green" size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Verified Assessment</h2>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Feedback delivered by AI Coaching Engine</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest mb-1">Status</p>
                       <div className="flex items-center gap-2 justify-end">
                         <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">LIVE PORTAL</span>
                         <span className="inline-block w-2.5 h-2.5 rounded-full bg-logo-green animate-pulse"></span>
                       </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                    <div className="markdown-body prose prose-slate max-w-none relative z-10">
                      <ReactMarkdown>{assessment}</ReactMarkdown>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6 relative z-10 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-inner">
                       <div className="flex flex-col min-w-[100px]">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm">EGAI</span>
                         <span className="text-3xl font-black text-brand-600 dark:text-brand-400">
                           {extractScoreRaw(assessment) >= 0 ? extractScoreRaw(assessment) : "?"} <span className="text-sm font-bold text-slate-400">/ {marks}</span>
                         </span>
                       </div>
                       <div className="hidden sm:block w-px h-12 bg-slate-200 dark:bg-slate-700/50"></div>
                       <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-logo-green uppercase tracking-widest flex items-center gap-1.5 mb-1">
                           TEACHER <Pencil size={10} />
                         </span>
                         <div className="flex items-center gap-3">
                           <button 
                             onClick={() => {
                               const currentScore = currentTeacherScore !== undefined ? currentTeacherScore : (extractScoreRaw(assessment) >= 0 ? extractScoreRaw(assessment) : 0);
                               const newScore = Math.max(0, currentScore - 1);
                               setCurrentTeacherScore(newScore);
                             }}
                             className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-logo-green outline-none"
                           >
                             <span className="text-xl font-medium leading-none mb-1">-</span>
                           </button>
                           <span className="text-3xl font-black text-slate-800 dark:text-white min-w-[3rem] text-center">
                              {currentTeacherScore !== undefined ? currentTeacherScore : (extractScoreRaw(assessment) >= 0 ? extractScoreRaw(assessment) : "-")}
                           </span>
                           <button 
                             onClick={() => {
                               const currentScore = currentTeacherScore !== undefined ? currentTeacherScore : (extractScoreRaw(assessment) >= 0 ? extractScoreRaw(assessment) : 0);
                               const newScore = Math.min(parseInt(marks), currentScore + 1);
                               setCurrentTeacherScore(newScore);
                             }}
                             className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-logo-green outline-none"
                           >
                             <span className="text-xl font-medium leading-none mb-0.5">+</span>
                           </button>
                         </div>
                       </div>
                    </div>

                    {/* Designer Footer / Summary Callout */}
                    <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                       <div className="bg-brand-900 dark:bg-brand-950 text-white p-6 rounded-xl shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                          <div className="relative z-10 flex flex-col gap-4">
                             <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-200 underline decoration-brand-400/50 underline-offset-8 mb-4">Professional Summary</h4>
                                <p className="text-sm italic leading-relaxed font-light text-brand-50/90 dark:text-brand-100/90">
                                  This assessment follows the official IB Geography markbands. Use the feedback above to refine your AO3 evaluative analysis chains.
                                </p>
                             </div>
                          </div>
                          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full"></div>
                       </div>
                    </div>

                    {/* Export Options */}
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-4">
                        <FileDown size={14} className="text-logo-green" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Export Options</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Inputted Essay</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => downloadEssayAsPDF(candidateName, essay, question, paper, marks)}
                              className="flex-1 px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-logo-green hover:text-logo-green transition-all uppercase tracking-widest"
                            >
                              PDF
                            </button>
                            <button 
                              onClick={() => downloadEssayAsDocx(candidateName, essay, question, paper, marks)}
                              className="flex-1 px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-logo-green hover:text-logo-green transition-all uppercase tracking-widest"
                            >
                              DOCX
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Marking Report</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => downloadReportAsPDF(candidateName, assessment, question)}
                              className="flex-1 px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-logo-green hover:text-logo-green transition-all uppercase tracking-widest"
                            >
                              PDF
                            </button>
                            <button 
                              onClick={() => downloadReportAsDocx(candidateName, assessment, question)}
                              className="flex-1 px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-logo-green hover:text-logo-green transition-all uppercase tracking-widest"
                            >
                              DOCX
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-4">
                      <button 
                        onClick={() => setShowSaveModal(true)}
                        className="group flex flex-1 items-center justify-center gap-2 text-[10px] font-black text-white bg-slate-800 dark:bg-slate-700 py-3 rounded-lg uppercase tracking-[0.2em] shadow-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                      >
                        <Save size={14} className="transition-transform group-hover:scale-110" />
                        Archive Record
                      </button>
                      <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group flex flex-1 items-center justify-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-logo-green transition-colors bg-slate-50 dark:bg-slate-800/50 rounded-lg py-3"
                      >
                        Return to Console
                        <ArrowRight size={14} className="transition-transform group-hover:-translate-y-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                    <GraduationCap size={40} className="text-slate-200 dark:text-slate-700 mb-4" />
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Awaiting Submission</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      )}

      {currentView === "grader" && (
        <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 py-10 px-8 text-slate-400 dark:text-slate-500">
          <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="text-[10px] flex gap-4 uppercase font-bold tracking-widest">
                <span>Session: MAY 2026</span>
                <span className="text-slate-700">|</span>
                <span>Candidate Portal: 0021-042</span>
              </div>
              <div className="text-[10px] flex items-center gap-2 uppercase font-bold tracking-widest">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-slate-300">AI Examiner Active</span>
              </div>
          </div>
        </footer>
      )}

      {showSaveModal && assessment && (
        <SaveAssessmentModal 
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveAssessment}
          classes={currentTeacherClasses}
          assignments={assignments}
          subFolders={subFolders}
          onCreateClass={handleCreateClass}
          onCreateAssignment={handleCreateAssignment}
          onCreateSubFolder={handleCreateSubFolder}
          paper={paper}
          marks={marks}
          question={question}
          essay={essay}
          assessment={assessment}
          teacherScore={currentTeacherScore}
          initClassId={entryClassId}
          initAssignmentId={entryAssignmentId}
          initialStudentName={candidateName}
          entryMode={entryMode}
          teacherId={activeTeacher}
        />
      )}

      {/* Continue Modal */}
      {showContinueModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-4 text-logo-green" />
            <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-2">Saved Successfully</h3>
            <p className="text-sm text-slate-500 mb-6">Would you like to continue entering more candidates for this assignment?</p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => handleContinueNext(false)}
                className="flex-1 px-4 py-2 rounded text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                autoFocus
              >
                Finished
              </button>
              <button 
                onClick={() => handleContinueNext(true)}
                className="flex-1 px-4 py-2 rounded bg-logo-green text-white text-xs font-black uppercase tracking-widest shadow-md hover:bg-brand-600 transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

