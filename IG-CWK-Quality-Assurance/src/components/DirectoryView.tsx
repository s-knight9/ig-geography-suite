import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Upload, 
  Columns, 
  Edit2, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  Sun, 
  Moon, 
  Database, 
  Search, 
  CheckSquare, 
  Square, 
  Sparkles,
  ArrowUpRight,
  Presentation
} from 'lucide-react';
import { 
  loadDirectoryData, 
  StudentSubmission, 
  loadStructure, 
  createClass, 
  createAssignment, 
  renameClass, 
  renameAssignment, 
  deleteClass, 
  deleteAssignment, 
  addOrUpdateSubmission 
} from '../db';
import { EvaluationResult } from '../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { downloadFeedbackPDF } from '../pdfReport';
import { downloadGradesExcel } from '../excelexport';
import { downloadModerationReport } from '../moderationReport';
import { generateClassFeedbackPPTX } from '../pptxGenerator';
import BulkFinalModal from './BulkFinalModal';
import SplitScreenViewer from './SplitScreenViewer';
import { parseCandidateName } from '../nameParser';

interface DirectoryViewProps {
  onBack: () => void;
  isDarkMode: boolean;
  onUploadFinal: (submission: StudentSubmission) => void;
  toggleDarkMode: () => void;
  onOpenSplitViewer?: (student: StudentSubmission, stage?: 'Draft' | 'Final' | 'Compare') => void;
}

function NewFolderInput({ 
  onSubmit, 
  onCancel, 
  placeholder, 
  initialValue = '' 
}: { 
  onSubmit: (name: string) => void; 
  onCancel: () => void; 
  placeholder: string; 
  initialValue?: string; 
}) {
  const [name, setName] = useState(initialValue);

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs flex items-center justify-between mb-2 text-left">
      <div className="flex items-center gap-2 w-full">
        <Folder className="w-4 h-4 text-emerald-500 shrink-0" />
        <input
          autoFocus
          className="w-full font-bold text-xs bg-transparent outline-none text-slate-800 dark:text-slate-100"
          placeholder={placeholder}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && name.trim()) onSubmit(name.trim());
            if (e.key === 'Escape') onCancel();
          }}
        />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button 
          onClick={() => name.trim() && onSubmit(name.trim())} 
          className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 p-1 rounded"
          title="Save"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={onCancel} 
          className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function DirectoryView({ 
  onBack, 
  isDarkMode, 
  onUploadFinal, 
  toggleDarkMode, 
  onOpenSplitViewer 
}: DirectoryViewProps) {
  const [data, setData] = useState<StudentSubmission[]>([]);
  const [struct, setStruct] = useState({ classes: [] as string[], assignments: {} as Record<string, string[]> });
  
  // Multi-Class Selection state
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  // Moderation Stage: Draft or Final
  const [moderationStage, setModerationStage] = useState<'Draft' | 'Final'>('Draft');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Selection State
  const [sampleCandidateNames, setSampleCandidateNames] = useState<Set<string>>(new Set());
  const [sampleFilterOnly, setSampleFilterOnly] = useState(false);

  // Modals & Navigation
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null);
  const [viewerStage, setViewerStage] = useState<'Draft' | 'Final' | 'Compare'>('Draft');
  const [deletingStudent, setDeletingStudent] = useState<StudentSubmission | null>(null);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [renamingClass, setRenamingClass] = useState<string | null>(null);
  const [addingSubForClass, setAddingSubForClass] = useState<string | null>(null);
  const [renamingAssignment, setRenamingAssignment] = useState<{ className: string; assignmentName: string } | null>(null);
  const [isBulkFinalOpen, setIsBulkFinalOpen] = useState(false);
  const [isGeneratingPPTX, setIsGeneratingPPTX] = useState(false);
  const [pptxError, setPptxError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [d, s] = await Promise.all([loadDirectoryData(), loadStructure()]);
      setData(d);
      setStruct(s);
      
      const allClasses = Array.from(new Set([...(s.classes || []), ...d.map(x => x.className)]));
      
      // By default, select all classes so Master Directory + Cohort Cross-Moderation is the default view
      setSelectedClasses(prev => {
        if (prev.length === 0 && allClasses.length > 0) {
          return allClasses;
        }
        const valid = prev.filter(c => allClasses.includes(c));
        return valid.length > 0 ? valid : allClasses;
      });
    } catch (err) {
      console.error("Failed to load directory data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const classes = useMemo(() => {
    return Array.from(new Set([...struct.classes, ...data.map(d => d.className)]));
  }, [struct.classes, data]);

  // Toggle single class checkbox
  const toggleClassCheckbox = (className: string) => {
    setSelectedClasses(prev => {
      if (prev.includes(className)) {
        return prev.filter(c => c !== className);
      } else {
        return [...prev, className];
      }
    });
  };

  // Toggle class folder expansion (chevron)
  const toggleClassExpansion = (className: string) => {
    setExpandedClasses(prev => {
      const next = new Set(prev);
      if (next.has(className)) next.delete(className);
      else next.add(className);
      return next;
    });
  };

  // Helper for Candidate AIQA and Teacher Scores
  const getCandidateScores = (
    s: StudentSubmission, 
    stage: 'Draft' | 'Final'
  ): { aiqa: number; teacher: number } | null => {
    const evalData: EvaluationResult | undefined = stage === 'Final' ? s.finalEvaluation : s.draftEvaluation;
    if (!evalData) return null;
    const aiqa = evalData.total_score || 0;

    const teacherScores = stage === 'Final' ? s.finalTeacherScores : s.draftTeacherScores;
    let teacher = aiqa;
    if (teacherScores && Object.keys(teacherScores).length > 0) {
      teacher = 0;
      ['ao1_knowledge', 'ao2_observation', 'ao2_organisation', 'ao2_analysis', 'ao3_conclusion'].forEach(key => {
        teacher += teacherScores[key] ?? (evalData?.scores as any)?.[key]?.score ?? 0;
      });
    }
    return { aiqa, teacher };
  };

  // Filter candidates according to selected classes, assignment filter, search, and sample filter
  const filteredCandidates = useMemo(() => {
    return data.filter(s => {
      // 1. Must belong to one of the ticked classes
      if (selectedClasses.length > 0 && !selectedClasses.includes(s.className)) {
        return false;
      }
      if (selectedClasses.length === 0) {
        return false;
      }

      // 2. Assignment filter if active
      if (selectedAssignment && s.assignmentName !== selectedAssignment) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const parsed = parseCandidateName(s.candidateName);
        const matchesName = s.candidateName.toLowerCase().includes(q) ||
          parsed.formattedName.toLowerCase().includes(q) ||
          parsed.surname.toLowerCase().includes(q) ||
          parsed.forename.toLowerCase().includes(q);
        const matchesClass = s.className.toLowerCase().includes(q);
        const matchesAsn = s.assignmentName.toLowerCase().includes(q);
        if (!matchesName && !matchesClass && !matchesAsn) return false;
      }

      // 4. Sample filter if enabled
      if (sampleFilterOnly && !sampleCandidateNames.has(s.candidateName)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const nameA = parseCandidateName(a.candidateName);
      const nameB = parseCandidateName(b.candidateName);
      return nameA.surname.localeCompare(nameB.surname) || nameA.forename.localeCompare(nameB.forename);
    });
  }, [data, selectedClasses, selectedAssignment, searchQuery, sampleFilterOnly, sampleCandidateNames]);

  // Candidates with submissions in the active moderation stage (for Row 2 KPI stats)
  const stageCandidates = useMemo(() => {
    return filteredCandidates.filter(s => {
      return moderationStage === 'Final' ? !!s.finalEvaluation : !!s.draftEvaluation;
    });
  }, [filteredCandidates, moderationStage]);

  // Row 2 Statistics Calculations
  const stats = useMemo(() => {
    const total = stageCandidates.length;
    let sumAIQA = 0;
    let sumTeacher = 0;

    const gradeCounts = {
      A: 0, // 50 to 60
      B: 0, // 42 to 49
      C: 0, // 35 to 41
      D: 0, // 28 to 34
      E: 0, // 22 to 27
      F: 0, // 17 to 21
      G: 0, // 12 to 16
      U: 0  // 0 to 11
    };

    stageCandidates.forEach(s => {
      const sc = getCandidateScores(s, moderationStage);
      if (sc) {
        sumAIQA += sc.aiqa;
        sumTeacher += sc.teacher;

        const t = sc.teacher;
        if (t >= 50) gradeCounts.A++;
        else if (t >= 42) gradeCounts.B++;
        else if (t >= 35) gradeCounts.C++;
        else if (t >= 28) gradeCounts.D++;
        else if (t >= 22) gradeCounts.E++;
        else if (t >= 17) gradeCounts.F++;
        else if (t >= 12) gradeCounts.G++;
        else gradeCounts.U++;
      }
    });

    const aiqaMean = total > 0 ? (sumAIQA / total).toFixed(1) : '0.0';
    const teacherMean = total > 0 ? (sumTeacher / total).toFixed(1) : '0.0';
    const diff = total > 0 ? parseFloat(teacherMean) - parseFloat(aiqaMean) : 0;
    const diffFormatted = (diff >= 0 ? '+' : '') + diff.toFixed(1);

    return {
      total,
      aiqaMean,
      teacherMean,
      diff,
      diffFormatted,
      gradeCounts
    };
  }, [stageCandidates, moderationStage]);

  // Sample toggle for individual candidate
  const toggleCandidateSample = (candidateName: string) => {
    setSampleCandidateNames(prev => {
      const next = new Set(prev);
      if (next.has(candidateName)) {
        next.delete(candidateName);
      } else {
        next.add(candidateName);
      }
      return next;
    });
  };

  // Sample Auto-Select / Filter Toggle (IGCSE Cambridge moderation spread)
  const handleSampleButtonClick = () => {
    // If no sample is currently selected, auto-select standard sample spread
    if (sampleCandidateNames.size === 0) {
      const valid = stageCandidates.map(s => ({
        candidateName: s.candidateName,
        scores: getCandidateScores(s, moderationStage)
      })).filter(x => x.scores != null);

      if (valid.length === 0) {
        alert("No evaluated candidates available in this stage to sample.");
        return;
      }

      valid.sort((a, b) => (b.scores?.teacher || 0) - (a.scores?.teacher || 0));

      const newSample = new Set<string>();
      const sampleTarget = Math.min(valid.length, valid.length <= 6 ? valid.length : 10);

      if (valid.length <= 6) {
        valid.forEach(v => newSample.add(v.candidateName));
      } else {
        newSample.add(valid[0].candidateName); // Highest
        newSample.add(valid[valid.length - 1].candidateName); // Lowest
        const step = (valid.length - 1) / (sampleTarget - 1);
        for (let i = 1; i < sampleTarget - 1; i++) {
          const idx = Math.round(i * step);
          newSample.add(valid[idx].candidateName);
        }
      }

      setSampleCandidateNames(newSample);
      setSampleFilterOnly(true);
    } else {
      // Toggle sample filter on / off
      setSampleFilterOnly(prev => !prev);
    }
  };

  const handleOpenViewer = (student: StudentSubmission, stage: 'Draft' | 'Final' | 'Compare') => {
    if (onOpenSplitViewer) {
      onOpenSplitViewer(student, stage);
    } else {
      setSelectedStudent(student);
      setViewerStage(stage);
    }
  };

  const combinedTitle = selectedClasses.length > 0 ? selectedClasses.join(' + ') : 'No Class Selected';

  return (
    <div className={`min-h-screen bg-[#f8f9fc] dark:bg-slate-900 flex flex-col font-sans transition-colors ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Main Navigation Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-20 px-8 flex items-center justify-between shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Return to Upload Entry"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Folder className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[20px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight">
              Teacher Master Directory
            </h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Cohort Cross-Moderation & QA Archive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode} 
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={onBack} 
            className="px-5 py-2 text-xs font-bold text-red-500 border border-red-200 dark:border-red-900/60 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors uppercase tracking-wider"
          >
            Exit
          </button>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-slate-50 dark:bg-slate-800/80 shadow-2xs flex flex-col justify-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Standard</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight">MAY 2026</span>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <main className="flex-1 p-8 flex gap-6 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* ============================================================== */}
        {/* 1. LEFT SIDEBAR: MULTI-CLASS TICKBOX CROSS-MODERATION          */}
        {/* ============================================================== */}
        <aside className="w-84 flex flex-col gap-3 overflow-y-auto shrink-0 border-r border-slate-200 dark:border-slate-700 pr-6">
          
          {/* Header & Add Folder */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest text-xs">
                Master Directory
              </h3>
            </div>
            <button 
              onClick={() => setIsCreatingClass(true)} 
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              title="Add Teacher Folder"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          {/* Add Teacher Folder Button */}
          <button 
            onClick={() => setIsCreatingClass(true)} 
            className="w-full border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-2.5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 font-bold text-xs shadow-2xs"
          >
            <Plus className="w-4 h-4 mr-1.5 text-blue-500" /> Add Teacher Folder
          </button>

          {isCreatingClass && (
            <NewFolderInput 
              placeholder="New Class Name..."
              onSubmit={async (name) => { 
                await createClass(name); 
                await refreshData(); 
                setIsCreatingClass(false); 
              }}
              onCancel={() => setIsCreatingClass(false)}
            />
          )}

          {/* All Folders (Master View) Dark Pill Button */}
          <button
            onClick={() => {
              setSelectedClasses([...classes]);
              setSelectedAssignment(null);
            }}
            className={`w-full rounded-xl p-3 flex items-center justify-between transition-all font-bold text-xs shadow-sm ${
              selectedClasses.length === classes.length && classes.length > 0
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 ring-2 ring-blue-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Columns className="w-4 h-4 text-emerald-400" />
              <span className="tracking-wide">All Folders (Master View)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900">
              {data.length}
            </span>
          </button>

          {/* Cohort Moderation Section Header */}
          <div className="flex items-center justify-between px-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Cohort Moderation ({selectedClasses.length}/{classes.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedClasses([...classes])}
                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline uppercase tracking-wider"
              >
                Select All
              </button>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <button
                onClick={() => setSelectedClasses([])}
                className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Class Folders List with Checkboxes */}
          <div className="flex flex-col gap-2 pb-10">
            {classes.map(c => {
              const isChecked = selectedClasses.includes(c);
              const isExpanded = expandedClasses.has(c);
              const classCandidatesCount = data.filter(d => d.className === c).length;
              const classAssignments = Array.from(new Set([
                ...(struct.assignments[c] || []),
                ...data.filter(d => d.className === c).map(d => d.assignmentName)
              ]));

              if (renamingClass === c) {
                return (
                  <NewFolderInput
                    key={c}
                    placeholder="Class Name"
                    initialValue={c}
                    onSubmit={async (newN) => {
                      await renameClass(c, newN);
                      await refreshData();
                      setRenamingClass(null);
                    }}
                    onCancel={() => setRenamingClass(null)}
                  />
                );
              }

              return (
                <div key={c} className="flex flex-col">
                  {/* Class Row */}
                  <div 
                    className={`w-full rounded-xl p-2.5 border transition-all flex items-center justify-between group cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* 1. Multi-class Cross-Moderation Checkbox */}
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleClassCheckbox(c);
                        }}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                      />

                      {/* 2. Chevron expand/collapse */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleClassExpansion(c);
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
                      >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>

                      {/* Green Folder & Class Name */}
                      <Folder className={`w-4 h-4 shrink-0 ${isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span 
                        onClick={() => toggleClassCheckbox(c)} 
                        className="text-xs font-bold truncate flex-1"
                        title={c}
                      >
                        {c}
                      </span>
                    </div>

                    {/* Candidate Count Badge & Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        isChecked 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400'
                      }`}>
                        {classCandidatesCount}
                      </span>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setRenamingClass(c); }} 
                          className="p-1 text-slate-400 hover:text-blue-500"
                          title="Rename Folder"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={async (e) => { 
                            e.stopPropagation(); 
                            if (confirm(`Delete folder '${c}' and its submissions?`)) {
                              await deleteClass(c);
                              await refreshData();
                            }
                          }} 
                          className="p-1 text-slate-400 hover:text-red-500"
                          title="Delete Folder"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Assignments Subfolders */}
                  {isExpanded && (
                    <div className="ml-6 pl-3 border-l-2 border-slate-200 dark:border-slate-700 mt-1.5 flex flex-col gap-1 py-1">
                      {classAssignments.length === 0 && addingSubForClass !== c && (
                        <p className="text-[11px] text-slate-400 py-1">No assignment subfolders</p>
                      )}

                      {classAssignments.map(a => {
                        const isAsnSelected = selectedAssignment === a && selectedClasses.includes(c);
                        
                        if (renamingAssignment?.className === c && renamingAssignment.assignmentName === a) {
                          return (
                            <NewFolderInput
                              key={a}
                              placeholder="Assignment Name"
                              initialValue={a}
                              onSubmit={async (newN) => {
                                await renameAssignment(c, a, newN);
                                await refreshData();
                                setRenamingAssignment(null);
                              }}
                              onCancel={() => setRenamingAssignment(null)}
                            />
                          );
                        }

                        return (
                          <div
                            key={a}
                            onClick={() => {
                              // If clicked, toggle filter to this assignment
                              if (selectedAssignment === a) {
                                setSelectedAssignment(null);
                              } else {
                                if (!selectedClasses.includes(c)) {
                                  setSelectedClasses([c]);
                                }
                                setSelectedAssignment(a);
                              }
                            }}
                            className={`p-2 rounded-lg flex items-center justify-between group cursor-pointer transition-colors ${
                              isAsnSelected
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-xs font-semibold truncate">{a}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setRenamingAssignment({ className: c, assignmentName: a }); }}
                                className="text-slate-400 hover:text-blue-500 p-0.5"
                                title="Rename Subfolder"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete subfolder '${a}'?`)) {
                                    await deleteAssignment(c, a);
                                    await refreshData();
                                    if (selectedAssignment === a) setSelectedAssignment(null);
                                  }
                                }}
                                className="text-slate-400 hover:text-red-500 p-0.5"
                                title="Delete Subfolder"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {addingSubForClass === c ? (
                        <div className="mt-1">
                          <NewFolderInput
                            placeholder="New Assignment..."
                            onSubmit={async (name) => {
                              await createAssignment(c, name);
                              await refreshData();
                              setAddingSubForClass(null);
                            }}
                            onCancel={() => setAddingSubForClass(null)}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingSubForClass(c)}
                          className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 py-1.5 px-2 uppercase tracking-wider transition-colors mt-0.5"
                        >
                          <Plus className="w-3 h-3" /> Add Subfolder
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ============================================================== */}
        {/* MAIN CONTENT PANE: HEADER & CANDIDATE GRID                     */}
        {/* ============================================================== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
              <p className="font-bold text-sm text-slate-500">Loading Directory Submissions...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* ========================================================== */}
              {/* 2. TOP MODERATION HEADER & KPI PANEL (3-Row Card)           */}
              {/* ========================================================== */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4">
                
                {/* ROW 1: Title & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-3 truncate">
                      <h2 className="text-lg font-black text-slate-800 dark:text-white truncate">
                        {combinedTitle}
                        {selectedAssignment && (
                          <span className="text-slate-400 font-semibold text-sm ml-2">
                            • {selectedAssignment}
                          </span>
                        )}
                      </h2>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        {filteredCandidates.length} Candidates
                      </span>
                    </div>
                  </div>

                  {/* Actions matching DP IA Quality Assurance layout */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Bulk Upload Finals */}
                    <button
                      onClick={() => setIsBulkFinalOpen(true)}
                      disabled={filteredCandidates.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" /> Bulk Upload Finals
                    </button>

                    {/* Class Summary PDF */}
                    <button
                      onClick={() => {
                        downloadModerationReport(
                          filteredCandidates, 
                          combinedTitle, 
                          selectedAssignment || 'Cohort Moderation'
                        );
                      }}
                      disabled={filteredCandidates.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5" /> Class Summary (.pdf)
                    </button>

                    {/* Feedback Deck PPTX */}
                    <button
                      onClick={async () => {
                        if (filteredCandidates.length === 0 || isGeneratingPPTX) return;
                        setIsGeneratingPPTX(true);
                        setPptxError(null);
                        try {
                          await generateClassFeedbackPPTX(
                            filteredCandidates, 
                            combinedTitle, 
                            selectedAssignment || 'Cohort Feedback'
                          );
                        } catch (err: any) {
                          alert(err.message || "Failed to generate PPTX");
                        } finally {
                          setIsGeneratingPPTX(false);
                        }
                      }}
                      disabled={filteredCandidates.length === 0 || isGeneratingPPTX}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                      title="Generate PowerPoint Feedback Deck"
                    >
                      <Presentation className="w-3.5 h-3.5" /> {isGeneratingPPTX ? 'Generating...' : 'Feedback Deck (.pptx)'}
                    </button>

                    {/* Export Marksheet Excel */}
                    <button
                      onClick={() => {
                        downloadGradesExcel(
                          filteredCandidates, 
                          moderationStage === 'Draft', 
                          selectedAssignment || combinedTitle
                        );
                      }}
                      disabled={filteredCandidates.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5 rotate-180" /> Export Marksheet (.xlsx)
                    </button>

                    {/* Select IG Moderation Sample */}
                    <button
                      onClick={handleSampleButtonClick}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs border transition-colors shadow-2xs ${
                        sampleFilterOnly
                          ? 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950/60 dark:text-amber-200'
                          : 'bg-amber-50/70 hover:bg-amber-100/70 text-amber-800 border-amber-300 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-700'
                      }`}
                      title={sampleFilterOnly ? 'Show all candidates' : 'Select or view moderation sample'}
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Select IG Moderation Sample ({sampleCandidateNames.size})</span>
                    </button>
                  </div>
                </div>

                {/* ROW 2: Cohort Means, Tolerance & IGCSE Grade Distribution Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  {/* COHORT [N] */}
                  <div className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-black text-slate-700 dark:text-slate-300">
                    COHORT <span className="text-blue-600 dark:text-blue-400 ml-1">[{stats.total}]</span>
                  </div>

                  {/* AIQA MEAN [X.X] /60 */}
                  <div className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300">
                    AIQA MEAN <span className="font-black text-slate-900 dark:text-white ml-1">[{stats.aiqaMean}]</span> <span className="text-slate-400 text-[10px]">/60</span>
                  </div>

                  {/* TEACHER MEAN [X.X] /60 */}
                  <div className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-800 dark:text-emerald-300">
                    TEACHER MEAN <span className="font-black text-emerald-700 dark:text-emerald-300 ml-1">[{stats.teacherMean}]</span> <span className="text-emerald-500 text-[10px]">/60</span>
                  </div>

                  {/* TOLERANCE [+/-X.X] & STATUS BADGE */}
                  <div className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span>TOLERANCE [{stats.diffFormatted}]</span>
                    {Math.abs(stats.diff) <= 3 ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        WITHIN TOLERANCE (+/-3)
                      </span>
                    ) : Math.abs(stats.diff) <= 6 ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        MODERATE VARIANCE
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                        HIGH VARIANCE
                      </span>
                    )}
                  </div>

                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

                  {/* IGCSE Grade Distribution Pills (based on TEACHER scores out of 60) */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* A: 50-60 */}
                    <div className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-[11px]">
                      A (50+) <span className="font-black ml-0.5">{stats.gradeCounts.A}</span>
                    </div>

                    {/* B: 42-49 */}
                    <div className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-bold text-[11px]">
                      B (42-49) <span className="font-black ml-0.5">{stats.gradeCounts.B}</span>
                    </div>

                    {/* C: 35-41 */}
                    <div className="px-2.5 py-1 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 font-bold text-[11px]">
                      C (35-41) <span className="font-black ml-0.5">{stats.gradeCounts.C}</span>
                    </div>

                    {/* D: 28-34 */}
                    <div className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold text-[11px]">
                      D (28-34) <span className="font-black ml-0.5">{stats.gradeCounts.D}</span>
                    </div>

                    {/* E: 22-27 */}
                    <div className="px-2.5 py-1 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300 font-bold text-[11px]">
                      E (22-27) <span className="font-black ml-0.5">{stats.gradeCounts.E}</span>
                    </div>

                    {/* F: 17-21 */}
                    <div className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-[11px]">
                      F (17-21) <span className="font-black ml-0.5">{stats.gradeCounts.F}</span>
                    </div>

                    {/* G: 12-16 */}
                    <div className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-[11px]">
                      G (12-16) <span className="font-black ml-0.5">{stats.gradeCounts.G}</span>
                    </div>

                    {/* U: <12 */}
                    <div className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 font-bold text-[11px]">
                      U (&lt;12) <span className="font-black ml-0.5">{stats.gradeCounts.U}</span>
                    </div>
                  </div>
                </div>

                {/* ROW 3: Stage Switcher & Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  {/* Segmented Stage Switcher */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setModerationStage('Draft')}
                      className={`px-5 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all ${
                        moderationStage === 'Draft'
                          ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      MODERATE DRAFT CWKS
                    </button>
                    <button
                      onClick={() => setModerationStage('Final')}
                      className={`px-5 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all ${
                        moderationStage === 'Final'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      MODERATE FINAL CWKS
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search candidates..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 w-72 transition-colors"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* ========================================================== */}
              {/* 3. TWO-COLUMN CANDIDATE CARDS GRID                         */}
              {/* ========================================================== */}
              {filteredCandidates.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                  <Folder className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-3" />
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
                    No submissions found
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {selectedClasses.length === 0 
                      ? "Select at least one class folder in the sidebar to view candidate submissions."
                      : "No candidates match the active filters or search query."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-20">
                  {filteredCandidates.map(s => {
                    const parsed = parseCandidateName(s.candidateName);
                    const hasDraft = !!s.draftEvaluation;
                    const hasFinal = !!s.finalEvaluation;
                    const hasBoth = hasDraft && hasFinal;
                    const isSample = sampleCandidateNames.has(s.candidateName);

                    const draftScores = getCandidateScores(s, 'Draft');
                    const finalScores = getCandidateScores(s, 'Final');

                    const formattedDate = s.updatedAt 
                      ? new Date(s.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Saved Assessment';

                    return (
                      <div 
                        key={`${s.className}_${s.assignmentName}_${s.candidateName}`}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between gap-4"
                      >
                        {/* Top Section: Candidate Info & Draft/Final Columns */}
                        <div className="flex justify-between items-start gap-4">
                          
                          {/* Top Left: Candidate details & Sample Checkbox */}
                          <div className="flex flex-col">
                            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base leading-tight">
                              {parsed.formattedName}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                              {s.className} • {s.assignmentName}
                            </span>

                            {/* Amber bordered sample checkbox pill */}
                            <button
                              onClick={() => toggleCandidateSample(s.candidateName)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors mt-2.5 w-fit ${
                                isSample
                                  ? 'border-amber-400 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-600'
                                  : 'border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-700'
                              }`}
                            >
                              {isSample ? (
                                <CheckSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-amber-500" />
                              )}
                              <span>{isSample ? 'IG SAMPLE: SELECTED' : 'IG SAMPLE: SELECT'}</span>
                            </button>

                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                              {formattedDate}
                            </span>
                          </div>

                          {/* Top Right: Draft CWK & Final CWK Score Columns */}
                          <div className="flex items-start gap-3 shrink-0">
                            
                            {/* Draft CWK Column */}
                            <div className="bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-1 min-w-[90px]">
                              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                Draft CWK
                              </span>
                              {hasDraft && draftScores ? (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[9px] font-bold text-slate-400">AIQA</span>
                                    <span className="font-black px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {draftScores.aiqa}/60
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">TEACH</span>
                                    <span className="font-black px-1.5 py-0.2 rounded bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                      {draftScores.teacher}/60
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">None</span>
                              )}
                            </div>

                            {/* Final CWK Column */}
                            <div className="bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-1 min-w-[90px]">
                              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                Final CWK
                              </span>
                              {hasFinal && finalScores ? (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[9px] font-bold text-slate-400">AIQA</span>
                                    <span className="font-black px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {finalScores.aiqa}/60
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">TEACH</span>
                                    <span className="font-black px-1.5 py-0.2 rounded bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                      {finalScores.teacher}/60
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => onUploadFinal(s)}
                                  className="border border-dashed border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] px-2 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors mt-0.5"
                                  title="Upload Final Coursework Submission"
                                >
                                  Upload Final CWK ↑
                                </button>
                              )}
                            </div>

                          </div>
                        </div>

                        {/* Bottom Action Row */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 gap-2">
                          
                          {/* Left Navigation Buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* View Draft Report */}
                            <button
                              disabled={!hasDraft}
                              onClick={() => handleOpenViewer(s, 'Draft')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${
                                hasDraft
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                  : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              View Draft Report
                            </button>

                            {/* View Final Report */}
                            <button
                              disabled={!hasFinal}
                              onClick={() => handleOpenViewer(s, 'Final')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${
                                hasFinal
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              View Final Report
                            </button>

                            {/* Compare Draft vs Final (Indigo-tinted) */}
                            <button
                              disabled={!hasBoth}
                              onClick={() => handleOpenViewer(s, 'Compare')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1 ${
                                hasBoth
                                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                  : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              <Sparkles className="w-3 h-3 text-indigo-500" /> Compare Draft vs Final
                            </button>
                          </div>

                          {/* Right Icon Actions: Firebase Storage PDF status badges & Trash */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Draft PDF status badge */}
                            {s.draftPdfUrl ? (
                              <a
                                href={s.draftPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                                title="Open Draft PDF in Firebase Storage"
                              >
                                <Database className="w-3 h-3 text-blue-500" /> Draft
                              </a>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-300 dark:text-slate-600 px-1.5 py-0.5">
                                No Draft PDF
                              </span>
                            )}

                            {/* Final PDF status badge */}
                            {s.finalPdfUrl ? (
                              <a
                                href={s.finalPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                                title="Open Final PDF in Firebase Storage"
                              >
                                <Database className="w-3 h-3 text-emerald-500" /> Final
                              </a>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-300 dark:text-slate-600 px-1.5 py-0.5">
                                No Final PDF
                              </span>
                            )}

                            {/* Delete Candidate */}
                            <button
                              onClick={() => setDeletingStudent(s)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete Candidate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}
        </div>

      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={async () => {
          if (!deletingStudent) return;
          const upd = data.filter(d => !(d.candidateName === deletingStudent.candidateName && d.className === deletingStudent.className && d.assignmentName === deletingStudent.assignmentName));
          setData(upd);
          const { deleteSubmission } = await import('../db');
          await deleteSubmission(deletingStudent);
          if (selectedStudent?.candidateName === deletingStudent.candidateName) {
            setSelectedStudent(null);
          }
          setDeletingStudent(null);
        }}
        title="Delete Submission"
        description={`Are you sure you want to delete ${deletingStudent?.candidateName.replace(/\s*-\s*(DRAFT|FINAL|Draft|Final)$/i, '')}'s submission?`}
      />

      {/* Bulk Final Upload Modal */}
      <BulkFinalModal
        isOpen={isBulkFinalOpen}
        onClose={() => setIsBulkFinalOpen(false)}
        students={filteredCandidates}
        currentClass={combinedTitle}
        currentAssignment={selectedAssignment || 'Coursework'}
        onCommit={async (updatedStudents) => {
           const { addOrUpdateSubmission } = await import('../db');
           for (const stu of updatedStudents) {
             await addOrUpdateSubmission(stu);
           }
           await refreshData();
           setIsBulkFinalOpen(false);
        }}
      />

      {/* Fallback Inline SplitScreenViewer if onOpenSplitViewer was not supplied by App */}
      {selectedStudent && !onOpenSplitViewer && (
        <SplitScreenViewer
          student={selectedStudent}
          initialStage={viewerStage}
          onClose={() => setSelectedStudent(null)}
          onUpdateStudent={(updated) => {
            setData(prev => prev.map(s => 
              (s.candidateName === updated.candidateName && s.className === updated.className && s.assignmentName === updated.assignmentName) 
                ? updated 
                : s
            ));
            setSelectedStudent(updated);
          }}
          onUploadFinal={(s) => {
            setSelectedStudent(null);
            onUploadFinal(s);
          }}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}
    </div>
  );
}
