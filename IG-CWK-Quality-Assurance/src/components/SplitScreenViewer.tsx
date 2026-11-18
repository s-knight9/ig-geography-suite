import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  Columns, 
  FileText, 
  Upload, 
  Sun, 
  Moon, 
  Database, 
  ExternalLink, 
  Trophy, 
  Edit2, 
  Loader2, 
  FileQuestion, 
  CheckCircle2, 
  X,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { StudentSubmission, uploadSubmissionPdf, addOrUpdateSubmission } from '../db';
import { EvaluationResult } from '../types';
import { parseCandidateName } from '../nameParser';
import { EditableFeedbackList } from './EditableFeedbackList';
import { CriterionRubricDrawer } from './CriterionRubricDrawer';
import InteractiveCourseworkPdfViewer, {
  MarginBadgeItem,
  PdfJumpRequest,
} from './InteractiveCourseworkPdfViewer';
import { downloadFeedbackPDF } from '../pdfReport';
import { CwkFeedbackItem, normalizeEvaluationResult } from '../utils/ragStyles';
import type { ResolvedPdfLocation } from '../utils/pdfCoordinateResolver';

interface SplitScreenViewerProps {
  student?: StudentSubmission;
  candidate?: StudentSubmission;
  initialStage?: 'Draft' | 'Final' | 'Compare';
  onClose: () => void;
  onUpdateStudent?: (updated: StudentSubmission) => void;
  onUploadFinal?: (student: StudentSubmission) => void;
  isDarkMode: boolean;
  toggleDarkMode?: () => void;
}

export default function SplitScreenViewer({
  student: initialStudentProp,
  candidate: initialCandidateProp,
  initialStage = 'Draft',
  onClose,
  onUpdateStudent,
  onUploadFinal,
  isDarkMode,
  toggleDarkMode
}: SplitScreenViewerProps) {
  const initialStudent = (initialCandidateProp || initialStudentProp)!;
  const [student, setStudent] = useState<StudentSubmission>(initialStudent);
  const studentRef = useRef<StudentSubmission>(initialStudent);
  studentRef.current = student;

  React.useEffect(() => {
    if (initialCandidateProp || initialStudentProp) {
      const next = (initialCandidateProp || initialStudentProp)!;
      setStudent(next);
      studentRef.current = next;
    }
  }, [initialCandidateProp, initialStudentProp]);

  const [activeStage, setActiveStage] = useState<'Draft' | 'Final' | 'Compare'>(() => {
    if (initialStage === 'Compare' && initialStudent.comparativeEvaluation) return 'Compare';
    if (initialStage === 'Final' && initialStudent.finalEvaluation) return 'Final';
    if (initialStudent.draftEvaluation) return 'Draft';
    if (initialStudent.finalEvaluation) return 'Final';
    return initialStage;
  });

  const [viewMode, setViewMode] = useState<'split' | 'report' | 'pdf'>('split');
  const [isUploading, setIsUploading] = useState(false);
  const [replaceSuccess, setReplaceSuccess] = useState(false);
  const [jumpRequest, setJumpRequest] = useState<PdfJumpRequest | null>(null);
  const [expandedRubrics, setExpandedRubrics] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allRubricsExpanded = [1, 2, 3, 4, 5].every((id) => !!expandedRubrics[id]);

  const toggleCriterionRubric = (criterionNumber: number) => {
    setExpandedRubrics((prev) => ({
      ...prev,
      [criterionNumber]: !prev[criterionNumber],
    }));
  };

  const toggleAllRubrics = () => {
    const nextState = !allRubricsExpanded;
    setExpandedRubrics({
      1: nextState,
      2: nextState,
      3: nextState,
      4: nextState,
      5: nextState,
    });
  };

  const { formattedName } = parseCandidateName(student.candidateName);

  const hasDraft = !!student.draftEvaluation;
  const hasFinal = !!student.finalEvaluation;
  const hasCompare = !!student.comparativeEvaluation || (hasDraft && hasFinal);

  const activePdfUrl = activeStage === 'Final' ? student.finalPdfUrl : student.draftPdfUrl;
  const activeStoragePath = activeStage === 'Final' ? student.finalStoragePath : student.draftStoragePath;
  const rawActiveEvaluation: EvaluationResult | undefined = activeStage === 'Final' ? student.finalEvaluation : student.draftEvaluation;
  const activeTeacherScores: Record<string, number> = (activeStage === 'Final' ? student.finalTeacherScores : student.draftTeacherScores) || {};

  const activeEvaluation = React.useMemo(
    () => (rawActiveEvaluation ? normalizeEvaluationResult(rawActiveEvaluation, activeTeacherScores) : undefined),
    [rawActiveEvaluation, activeTeacherScores]
  );

  const criteriaData = [
    { id: '1', name: 'Knowledge & Understanding (AO1)', scoreKey: 'ao1_knowledge' },
    { id: '2', name: 'Observation and collection of data (AO2)', scoreKey: 'ao2_observation' },
    { id: '3', name: 'Organisation and presentation of data (AO2)', scoreKey: 'ao2_organisation' },
    { id: '4', name: 'Analysis and interpretation (AO2)', scoreKey: 'ao2_analysis' },
    { id: '5', name: 'Conclusion and Evaluation (AO3)', scoreKey: 'ao3_conclusion' }
  ];

  const marginBadgeItems: MarginBadgeItem[] = React.useMemo(() => {
    if (!activeEvaluation?.scores) return [];
    const list: MarginBadgeItem[] = [];
    criteriaData.forEach((crit) => {
      const critObj = (activeEvaluation.scores as any)[crit.scoreKey];
      if (!critObj) return;
      const critNum = Number(crit.id);
      (['www', 'ebi'] as const).forEach((key) => {
        const items = critObj[key];
        if (!Array.isArray(items)) return;
        items.forEach((item: CwkFeedbackItem) => {
          list.push({
            ...item,
            criterionNumber: critNum,
            criterionTitle: crit.name,
          });
        });
      });
    });
    return list;
  }, [activeEvaluation]);

  const handleJumpToItem = (item: CwkFeedbackItem) => {
    if (viewMode === 'report') {
      setViewMode('split');
    }
    setJumpRequest({
      itemId: item.id,
      page: item.pdfLocation.page,
      yPercent: item.pdfLocation.yPercent,
      timestamp: Date.now(),
    });
  };

  const totalPossible = 60;

  // Calculate teacher total
  let teacherTotal = 0;
  if (activeEvaluation) {
    criteriaData.forEach(c => {
      teacherTotal += activeTeacherScores[c.scoreKey] ?? (activeEvaluation?.scores as any)?.[c.scoreKey]?.score ?? 0;
    });
  }

  // Handle teacher score adjustments (+ / -)
  const handleScoreChange = async (scoreKey: string, newScore: number) => {
    if (newScore < 0) newScore = 0;
    if (newScore > 12) newScore = 12;

    const isFinalStage = activeStage === 'Final';
    const updatedScores = {
      ...(isFinalStage ? student.finalTeacherScores : student.draftTeacherScores),
      [scoreKey]: newScore
    };

    const updatedStudent: StudentSubmission = {
      ...student,
      ...(isFinalStage ? { finalTeacherScores: updatedScores } : { draftTeacherScores: updatedScores }),
      updatedAt: new Date().toISOString()
    };

    setStudent(updatedStudent);
    if (onUpdateStudent) onUpdateStudent(updatedStudent);
    await addOrUpdateSubmission(updatedStudent);
  };

  const persistActiveEvaluation = React.useCallback(
    async (mutator: (evalCopy: EvaluationResult) => boolean) => {
      const curStudent = studentRef.current;
      const isFinalStage = activeStage === 'Final';
      const rawEval = isFinalStage ? curStudent.finalEvaluation : curStudent.draftEvaluation;
      if (!rawEval) return;

      const teacherScores = isFinalStage ? curStudent.finalTeacherScores : curStudent.draftTeacherScores;
      const evalCopy = normalizeEvaluationResult(rawEval, teacherScores);
      if (!evalCopy?.scores) return;

      const changed = mutator(evalCopy);
      if (!changed) return;

      const updatedStudent: StudentSubmission = {
        ...curStudent,
        ...(isFinalStage ? { finalEvaluation: evalCopy } : { draftEvaluation: evalCopy }),
        updatedAt: new Date().toISOString(),
      };

      studentRef.current = updatedStudent;
      setStudent(updatedStudent);
      if (onUpdateStudent) onUpdateStudent(updatedStudent);
      await addOrUpdateSubmission(updatedStudent);
    },
    [activeStage, onUpdateStudent]
  );

  // Handle WWW/EBI feedback editing
  const handleFeedbackChange = async (ao: string, type: 'www' | 'ebi', newArray: CwkFeedbackItem[]) => {
    await persistActiveEvaluation((evalCopy) => {
      if (evalCopy.scores && (evalCopy.scores as any)[ao]) {
        (evalCopy.scores as any)[ao][type] = newArray;
        return true;
      }
      return false;
    });
  };

  // Handle persisting PDF margin badge drag-and-drop coordinates
  const handleUpdateItemLocation = React.useCallback(
    async (itemId: string, newLocation: CwkFeedbackItem['pdfLocation']) => {
      await persistActiveEvaluation((evalCopy) => {
        for (const crit of criteriaData) {
          const critScores = (evalCopy.scores as any)[crit.scoreKey];
          if (!critScores) continue;
          for (const listKey of ['www', 'ebi'] as const) {
            const arr = critScores[listKey];
            if (!Array.isArray(arr)) continue;
            const idx = arr.findIndex((it: CwkFeedbackItem) => it?.id === itemId);
            if (idx !== -1) {
              arr[idx] = { ...arr[idx], pdfLocation: newLocation };
              return true;
            }
          }
        }
        return false;
      });
    },
    [persistActiveEvaluation]
  );

  // Handle close-reading PDF coordinate resolution updates for unresolved/AI-estimated badges
  const handleResolvedLocations = React.useCallback(
    async (resolvedMap: Record<string, ResolvedPdfLocation>) => {
      await persistActiveEvaluation((evalCopy) => {
        let updatedAny = false;
        for (const crit of criteriaData) {
          const critScores = (evalCopy.scores as any)[crit.scoreKey];
          if (!critScores) continue;
          for (const listKey of ['www', 'ebi'] as const) {
            const arr = critScores[listKey];
            if (!Array.isArray(arr)) continue;
            for (let i = 0; i < arr.length; i++) {
              const item = arr[i] as CwkFeedbackItem;
              if (!item || item.pdfLocation?.isTeacherAdjusted) continue;
              const resolved = resolvedMap[item.id];
              if (resolved) {
                arr[i] = { ...item, pdfLocation: resolved };
                updatedAny = true;
              }
            }
          }
        }
        return updatedAny;
      });
    },
    [persistActiveEvaluation]
  );

  // Handle attaching / uploading the PDF in Firebase Storage
  const handleAttachFile = async (file: File) => {
    if (!file) return;

    const candidate = student;
    const stageToUpdate: 'Draft' | 'Final' = activeStage === 'Final' ? 'Final' : 'Draft';
    setIsUploading(true);
    setReplaceSuccess(false);

    try {
      const { pdfUrl, storagePath } = await uploadSubmissionPdf(file, candidate, stageToUpdate);
      const updatedStudent: StudentSubmission = {
        ...candidate,
        ...(stageToUpdate === 'Draft' 
          ? { draftPdfUrl: pdfUrl, draftStoragePath: storagePath } 
          : { finalPdfUrl: pdfUrl, finalStoragePath: storagePath }),
        updatedAt: new Date().toISOString()
      };

      // Update in Firestore
      await addOrUpdateSubmission(updatedStudent);

      // Update local React state so <iframe> immediately renders the PDF
      setStudent(updatedStudent);
      if (onUpdateStudent) onUpdateStudent(updatedStudent);

      setReplaceSuccess(true);
      setTimeout(() => setReplaceSuccess(false), 3000);
    } catch (err: any) {
      console.error("Firebase Storage PDF upload error:", err);
      alert(err?.message || "Failed to upload PDF. Please check Firebase Storage permissions.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-[#f8f9fc] dark:bg-slate-900 font-sans transition-colors ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Header */}
      <header className="h-18 px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0 shadow-xs z-20">
        {/* Left: Back & Candidate Details */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Return to Directory"
          >
            <ChevronLeft className="w-5 h-5 mr-0.5" />
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                {formattedName}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 uppercase tracking-wider">
                {student.className}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                • {student.assignmentName}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              Coursework Split-Screen QA Assessment
            </p>
          </div>
        </div>

        {/* Center: Stage Toggle (Draft / Final / Compare) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
          <button
            onClick={() => setActiveStage('Draft')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStage === 'Draft'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Draft CWK</span>
            {student.draftPdfUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" title="PDF Stored in Firebase" />
            )}
            {!hasDraft && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-400 font-normal">None</span>
            )}
          </button>

          <button
            onClick={() => setActiveStage('Final')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeStage === 'Final'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Final CWK</span>
            {student.finalPdfUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" title="PDF Stored in Firebase" />
            )}
            {!hasFinal && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-400 font-normal">None</span>
            )}
          </button>

          {hasCompare && (
            <button
              onClick={() => setActiveStage('Compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeStage === 'Compare'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Compare</span>
            </button>
          )}
        </div>

        {/* Right: View Mode Toggle & Actions */}
        <div className="flex items-center gap-3">
          {/* View Mode Segmented Control */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="50/50 Split View"
            >
              <Columns className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Split View</span>
            </button>

            <button
              onClick={() => setViewMode('pdf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'pdf'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="PDF Only"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">PDF Only</span>
            </button>

            <button
              onClick={() => setViewMode('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'report'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Report Only"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Report Only</span>
            </button>
          </div>

          {/* Download Feedback Report Button */}
          {activeEvaluation && (
            <button
              onClick={() => downloadFeedbackPDF(student, activeStage === 'Final' ? 'final' : 'draft')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs transition-colors"
              title="Download Feedback PDF"
            >
              <Upload className="w-3.5 h-3.5 rotate-180" />
              <span className="hidden md:inline">Download Report</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          {toggleDarkMode && (
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Close Viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: PDF Viewer (Visible in 'split' or 'pdf' mode) */}
        {(viewMode === 'split' || viewMode === 'pdf') && (
          <div 
            className={`flex flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/50 p-4 transition-all duration-300 ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            {/* Left Pane Sub-Header */}
            <div className="flex items-center justify-between pb-3 px-1">
              <div className="flex items-center gap-3">
                {/* Firebase Storage Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs">
                  <Database className="w-3.5 h-3.5 text-blue-500" />
                  <span>Firebase Storage</span>
                </div>

                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {activeStage === 'Final' ? 'Final Coursework Submission' : 'Draft Coursework Submission'}
                </span>

                {replaceSuccess && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> PDF Updated!
                  </span>
                )}
              </div>

              {/* Action Controls: Replace PDF & External Link */}
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="application/pdf" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAttachFile(file);
                  }}
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all disabled:opacity-50"
                  title="Attach or replace coursework PDF in Firebase Storage"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{activePdfUrl ? 'Replace PDF' : 'Attach PDF'}</span>
                    </>
                  )}
                </button>

                {activePdfUrl && (
                  <a
                    href={activePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 transition-colors shadow-xs"
                    title="Open PDF in new browser tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Left Pane PDF Frame / Empty State */}
            <div className="flex-1 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm relative">
              {activePdfUrl ? (
                <InteractiveCourseworkPdfViewer
                  pdfUrl={activePdfUrl}
                  title={`${formattedName} - ${activeStage} CWK`}
                  items={marginBadgeItems}
                  jumpRequest={jumpRequest}
                  onUpdateItemLocation={handleUpdateItemLocation}
                  onResolvedLocations={handleResolvedLocations}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/40">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                    <FileQuestion className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                    No PDF attached for {activeStage} CWK
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                    A raw coursework PDF has not yet been linked to Firebase Storage for this stage. You can attach one directly without re-running grading.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Attach Coursework PDF</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RIGHT PANE: Report & Evaluation (Visible in 'split' or 'report' mode) */}
        {(viewMode === 'split' || viewMode === 'report') && (
          <div 
            className={`flex flex-col bg-white dark:bg-slate-800 overflow-y-auto p-6 lg:p-8 transition-all duration-300 ${
              viewMode === 'split' ? 'w-1/2' : 'w-full max-w-5xl mx-auto'
            }`}
          >
            {activeStage === 'Compare' && student.comparativeEvaluation ? (
              /* Comparative Evaluation View */
              <div className="space-y-6 pb-20">
                <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-purple-700 dark:text-purple-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4" /> Comparative Moderation Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4 my-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Draft Score</span>
                      <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                        {student.comparativeEvaluation.cwk1_total_score} <span className="text-sm text-slate-400">/ 60</span>
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40">
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1">Final Score</span>
                      <span className="text-3xl font-black text-purple-700 dark:text-purple-300">
                        {student.comparativeEvaluation.cwk2_total_score} <span className="text-sm text-purple-400">/ 60</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                    {student.comparativeEvaluation.moderator_executive_summary}
                  </p>
                </div>

                {student.comparativeEvaluation.academic_integrity_report && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-widest text-xs mb-2">
                      Academic Integrity & Progress Audit
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {student.comparativeEvaluation.academic_integrity_report}
                    </p>
                  </div>
                )}
              </div>
            ) : activeEvaluation ? (
              /* Active Stage Evaluation Rubric */
              <div className="space-y-6 pb-20">
                {/* Score Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      IGQA Score
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                        {activeEvaluation.total_score}
                      </span>
                      <span className="text-sm font-bold text-slate-400">/{totalPossible}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/60 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                      Teacher Moderated
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                        {teacherTotal}
                      </span>
                      <span className="text-sm font-bold text-blue-400/70">/{totalPossible}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Word Count
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-800 dark:text-slate-200">
                        {activeEvaluation.word_counts?.evaluated_payload || 0}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase">Words</span>
                    </div>
                  </div>
                </div>

                {/* Moderator Executive Summary */}
                {activeEvaluation.moderator_executive_summary && (
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 text-white shadow-md border border-slate-800">
                    <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-3">
                      <Trophy className="w-4 h-4 text-blue-400" /> Moderator Executive Summary ({activeStage})
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-[13px] font-medium">
                      {activeEvaluation.moderator_executive_summary}
                    </p>
                  </div>
                )}

                {/* Detailed Criterion Rubric */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-xs flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" /> Detailed Criterion Rubric
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-medium">5 Criteria • 12 Marks Each</span>
                      <button
                        type="button"
                        onClick={toggleAllRubrics}
                        className="print:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3 text-blue-500" />
                        <span>{allRubricsExpanded ? 'Collapse All Rubrics' : 'Expand All Rubrics'}</span>
                      </button>
                    </div>
                  </div>

                  {criteriaData.map((crit) => {
                    const res = (activeEvaluation?.scores as any)?.[crit.scoreKey];
                    if (!res) return null;
                    const ts = activeTeacherScores[crit.scoreKey] ?? res.score;
                    const criterionNumber = Number(crit.id);

                    return (
                      <div 
                        key={crit.id} 
                        className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800/90 shadow-2xs"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-black">
                              {crit.id}
                            </span>
                            {crit.name}
                          </h4>

                          {/* Score Pill / Stepper */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">QA:</span>
                              <span className="font-black text-slate-700 dark:text-slate-200 text-xs">
                                {res.score}/12
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-lg">
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
                                Teacher:
                              </span>
                              <div className="flex items-center">
                                <button
                                  onClick={() => handleScoreChange(crit.scoreKey, ts - 1)}
                                  className="w-5 h-5 rounded hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs"
                                  title="Decrease mark"
                                >
                                  -
                                </button>
                                <span className="font-black text-blue-700 dark:text-blue-300 text-sm px-1.5 min-w-[20px] text-center">
                                  {ts}
                                </span>
                                <button
                                  onClick={() => handleScoreChange(crit.scoreKey, ts + 1)}
                                  className="w-5 h-5 rounded hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs"
                                  title="Increase mark"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">/12</span>
                            </div>
                          </div>
                        </div>

                        <CriterionRubricDrawer
                          criterionNumber={criterionNumber}
                          isOpen={!!expandedRubrics[criterionNumber]}
                          onToggle={() => toggleCriterionRubric(criterionNumber)}
                        />

                        {/* WWW & EBI Feedback Points */}
                        <div className="mt-4 space-y-3">
                          {res.www && (
                            <EditableFeedbackList
                              items={res.www}
                              criterionId={crit.id}
                              criterionScore={ts}
                              type="WWW"
                              isEditable={true}
                              onChange={(newVal) => handleFeedbackChange(crit.scoreKey, 'www', newVal)}
                              onJumpToItem={handleJumpToItem}
                            />
                          )}

                          {res.ebi && (
                            <EditableFeedbackList
                              items={res.ebi}
                              criterionId={crit.id}
                              criterionScore={ts}
                              type="EBI"
                              isEditable={true}
                              onChange={(newVal) => handleFeedbackChange(crit.scoreKey, 'ebi', newVal)}
                              onJumpToItem={handleJumpToItem}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* No Evaluation State */
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center mb-4">
                  <FileQuestion className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                  No {activeStage} Evaluation Available
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                  {activeStage === 'Final'
                    ? "This student does not have a Final coursework evaluation recorded yet."
                    : "No Draft report found for this candidate in this assignment."}
                </p>
                {activeStage === 'Final' && onUploadFinal && (
                  <button
                    onClick={() => onUploadFinal(student)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                  >
                    <Upload className="w-4 h-4" /> Upload Final CWK Now
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
