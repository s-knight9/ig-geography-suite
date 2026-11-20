import React, { useState, useEffect } from 'react';
import { EvaluationResult } from '../types';
import { Folder, Moon, Sun, Edit2, Trophy, CheckCircle2, AlertCircle, BookOpen, Info } from 'lucide-react';
import { StudentSubmission } from '../db';
import ArchiveModal from './ArchiveModal';
import { parseCandidateName } from '../nameParser';
import { EditableFeedbackList } from './EditableFeedbackList';
import { CriterionRubricDrawer, CriterionRubricTable } from './CriterionRubricDrawer';
import { CwkFeedbackItem, getDraftGradeAndBand, normalizeEvaluationResult } from '../utils/ragStyles';
import { DEFAULT_INCOMPLETE_EBI_NOTICE } from '../utils/cwkGradingRules';

interface ModerationResultsProps {
  key?: string;
  evaluation: EvaluationResult;
  candidateName: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onExit: () => void;
  onOpenDirectory: () => void;
  prefilledStudent?: StudentSubmission | null;
  savedSubmission?: StudentSubmission | null;
  uploadedFile?: File | null;
  uploadedStage?: 'Draft' | 'Final';
  isBatchMode?: boolean;
  renderBatchActions?: (teacherMarks: Record<string, number>) => React.ReactNode;
}

export default function ModerationResults({ evaluation, candidateName, isDarkMode, toggleDarkMode, onExit, onOpenDirectory, prefilledStudent, savedSubmission, uploadedFile, uploadedStage, isBatchMode, renderBatchActions }: ModerationResultsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingToDirectory, setIsSavingToDirectory] = useState(false);
  const { formattedName } = parseCandidateName(candidateName);
  const activeSubmissionMeta = savedSubmission || prefilledStudent || null;
  const resolvedStage: 'Draft' | 'Final' = uploadedStage || (prefilledStudent ? 'Final' : 'Draft');
  
  // Clone and normalize evaluation so feedback items use structured CwkFeedbackItem objects
  const [editableEvaluation, setEditableEvaluation] = useState<EvaluationResult>(() => normalizeEvaluationResult(evaluation));
  const summaryTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    const el = summaryTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(88, el.scrollHeight)}px`;
  }, [editableEvaluation.moderator_executive_summary]);

  const handleExecutiveSummaryChange = (newSummary: string) => {
    setEditableEvaluation(prev => ({
      ...prev,
      moderator_executive_summary: newSummary,
    }));
  };
  
  const handleFeedbackChange = (ao: string, type: 'www' | 'ebi', newArray: CwkFeedbackItem[]) => {
     setEditableEvaluation(prev => {
        const copy = JSON.parse(JSON.stringify(prev));
        if (copy.scores[ao]) {
           copy.scores[ao][type] = newArray;
        }
        return copy;
     });
  };

  const criteriaData = [
    { id: '1', name: 'Knowledge & Understanding (AO1)', scoreKey: 'ao1_knowledge' },
    { id: '2', name: 'Observation and collection of data (AO2)', scoreKey: 'ao2_observation' },
    { id: '3', name: 'Organisation and presentation of data (AO2)', scoreKey: 'ao2_organisation' },
    { id: '4', name: 'Analysis and interpretation (AO2)', scoreKey: 'ao2_analysis' },
    { id: '5', name: 'Conclusion and Evaluation (AO3)', scoreKey: 'ao3_conclusion' }
  ];

  const [teacherMarks, setTeacherMarks] = useState<Record<string, number>>(() => {
    const initialMarks: Record<string, number> = {};
    criteriaData.forEach(crit => {
      initialMarks[crit.scoreKey] = (evaluation?.scores as any)?.[crit.scoreKey]?.score || 0;
    });
    return initialMarks;
  });

  const handleTeacherMarkChange = (scoreKey: string, newValue: number) => {
    if (newValue < 0) newValue = 0;
    if (newValue > 12) newValue = 12;
    setTeacherMarks(prev => ({ ...prev, [scoreKey]: newValue }));
  };

  const totalTeacherMark = (Object.values(teacherMarks) as number[]).reduce((sum, mark) => sum + mark, 0);

  const totalPossible = 60;
  const isDraftStage = resolvedStage !== 'Final';
  const activeStageLabel = resolvedStage === 'Final' ? 'FINAL CWK' : 'DRAFT CWK';
  const draftGrade = getDraftGradeAndBand(totalTeacherMark);

  const [expandedRubrics, setExpandedRubrics] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

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
  
  return (
    <div className={`igqa-printable-report flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 print:bg-white print:text-slate-900 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="print:hidden flex items-center justify-between h-20 px-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0 sticky top-0 z-10 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 dark:bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xl shadow-sm">IG</div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-500">IG CWK QUALITY ASSURANCE</h1>
            <p className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase">Grading & Moderation Suite</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onOpenDirectory} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Folder className="w-5 h-5" />
          </button>
          <button onClick={toggleDarkMode} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={onExit} className="px-4 py-2 text-xs font-bold text-red-500 border border-red-200 dark:border-red-900/50 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors uppercase tracking-wider">
            Exit
          </button>
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 ml-4 flex flex-col justify-center bg-white dark:bg-slate-800 shadow-sm block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Standard</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">MAY 2026</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-8 py-8 space-y-6 print:px-0 print:py-0 print:space-y-3">
        {/* Print-Only Page 1 Top Header Bar */}
        <section
          data-testid="print-report-cover-header"
          className="hidden print:flex items-start justify-between gap-6 pb-3 mb-3 border-b border-slate-200 break-inside-avoid"
        >
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {formattedName}
            </h1>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-md border border-blue-300 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
              {activeStageLabel}
            </span>
            {(activeSubmissionMeta?.className || activeSubmissionMeta?.assignmentName) && (
              <p className="text-xs font-medium text-slate-500 mt-1.5">
                {activeSubmissionMeta?.className ? `Class: ${activeSubmissionMeta.className}` : ''}
                {activeSubmissionMeta?.className && activeSubmissionMeta?.assignmentName ? '  |  ' : ''}
                {activeSubmissionMeta?.assignmentName ? `Assessment: ${activeSubmissionMeta.assignmentName}` : ''}
              </p>
            )}
          </div>

          <div className="flex items-start gap-7 shrink-0 pt-0.5">
            {isDraftStage ? (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                  Grade &amp; Band
                </span>
                <span
                  data-testid="print-draft-grade-band"
                  className="text-3xl font-black text-blue-600 tracking-tight leading-none block"
                >
                  {draftGrade.label}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                  Teacher Moderated
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-blue-600 leading-none">
                    {totalTeacherMark}
                  </span>
                  <span className="text-xs font-bold text-slate-400">/{totalPossible}</span>
                </div>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Word Count
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {evaluation.word_counts.evaluated_payload}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Words</span>
              </div>
            </div>
          </div>
        </section>

        {/* Candidate Profile Widget */}
        <section className="print:hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Candidate Profile</p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{formattedName}</h2>
            <span className="px-2.5 py-0.5 rounded-md border border-blue-300 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
              {activeStageLabel}
            </span>
          </div>
        </section>

        {/* Global Summary Grid (hidden on print report) */}
        <section className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-blue-50/70 dark:bg-blue-900/20 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 p-6 shadow-sm flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-2">Grade &amp; Band</p>
            <span className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
              {draftGrade.label}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase mb-2">IGQA Mark</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{evaluation.total_score}</span>
              <span className="text-xl font-black text-slate-300 dark:text-slate-600">/{totalPossible}</span>
            </div>
          </div>

          <div className="bg-blue-50/40 dark:bg-blue-900/15 rounded-2xl border border-blue-100 dark:border-blue-900/40 p-6 shadow-sm flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-2">Teacher Mark</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-blue-700 dark:text-blue-300">{totalTeacherMark}</span>
              <span className="text-xl font-black text-blue-400/70">/{totalPossible}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Word Count</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800 dark:text-slate-200">{evaluation.word_counts.evaluated_payload}</span>
              <span className="text-lg font-bold text-slate-400 uppercase tracking-widest">Words</span>
            </div>
          </div>
        </section>

        {/* Moderator Executive Summary */}
        <section
          data-testid="moderator-executive-summary"
          className="igqa-exec-summary bg-[#F8FAFC] dark:bg-slate-800/80 rounded-lg p-6 border border-[#CBD5E1] dark:border-slate-700 border-l-4 border-l-[#2563EB] shadow-xs break-inside-avoid"
        >
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E2E8F0] dark:border-slate-700">
            <h3 className="text-[#1D4ED8] dark:text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2 text-xs">
              <Trophy className="w-4 h-4 text-[#2563EB] dark:text-blue-400" /> Moderator Executive Summary ({activeStageLabel})
            </h3>
            <span className="print:hidden inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <Edit2 className="w-3 h-3" /> Editable
            </span>
          </div>
          <textarea
            ref={summaryTextareaRef}
            value={editableEvaluation.moderator_executive_summary ?? ''}
            onChange={(e) => handleExecutiveSummaryChange(e.target.value)}
            placeholder="Enter moderator executive summary..."
            aria-label="Moderator Executive Summary"
            className="print:hidden w-full bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-[#1E293B] dark:text-slate-200 leading-[1.55] text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none transition-colors"
            rows={4}
          />
          <p className="hidden print:block text-[#1E293B] leading-[1.55] text-[12.5px] font-medium whitespace-pre-wrap">
            {editableEvaluation.moderator_executive_summary || ''}
          </p>
        </section>

        {/* Detailed Criterion Rubric */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden print:border-0 print:shadow-none print:overflow-visible">
          <div className="print:hidden px-8 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="text-slate-400 border border-slate-300 dark:border-slate-600 rounded p-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </span>
              Detailed Criterion Rubric
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-medium">5 Criteria • 12 Marks Each</span>
              <button
                type="button"
                onClick={toggleAllRubrics}
                className="print:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-blue-500" />
                <span>{allRubricsExpanded ? 'Collapse All Rubrics' : 'Expand All Rubrics'}</span>
              </button>
            </div>
          </div>
          
          <div className="p-8 divide-y divide-slate-100 dark:divide-slate-700 print:p-0 print:divide-y-0">
            {criteriaData.map((crit) => {
              const res = (editableEvaluation?.scores as any)?.[crit.scoreKey];
              if (!res) return null;
              const criterionNumber = Number(crit.id);
              
              return (
                <div
                  key={crit.id}
                  data-criterion-page={crit.id}
                  className={`igqa-criterion-block ${criterionNumber > 1 ? 'igqa-criterion-page-break' : ''} py-8 first:pt-0 last:pb-0 print:py-0`}
                >
                  <div className="hidden print:block mb-2.5">
                    <CriterionRubricTable criterionNumber={criterionNumber} />
                  </div>

                  <div className="flex items-center justify-between mb-4 print:mb-2">
                     <div className="flex items-center gap-6">
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 print:text-base print:text-slate-900">Criterion {crit.id}: {crit.name}</h4>
                     </div>
                     <div className={`${isDraftStage ? 'print:hidden ' : ''}flex items-center gap-2`}>
                       <span className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest flex items-center gap-1">
                         Teacher Mark <Edit2 className="w-3 h-3 print:hidden" />
                       </span>
                       <div className="flex flex-col items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 print:border-0 print:bg-transparent">
                         <button 
                           onClick={() => handleTeacherMarkChange(crit.scoreKey, teacherMarks[crit.scoreKey] + 1)}
                           className="print:hidden w-8 flex justify-center text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 h-4 border-b border-slate-200 dark:border-slate-700 items-center transition-colors"
                         >
                           <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 0L10 6H0L5 0Z" /></svg>
                         </button>
                         <div className="w-16 h-8 flex items-center justify-center font-black text-xl text-slate-800 dark:text-slate-200 print:w-auto print:h-auto print:text-base">
                           {teacherMarks[crit.scoreKey]}
                         </div>
                         <button 
                           onClick={() => handleTeacherMarkChange(crit.scoreKey, teacherMarks[crit.scoreKey] - 1)}
                           className="print:hidden w-8 flex justify-center text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 h-4 border-t border-slate-200 dark:border-slate-700 items-center transition-colors"
                         >
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 6L0 0H10L5 6Z" /></svg>
                         </button>
                       </div>
                       <span className="text-sm font-bold text-slate-400">/ 12</span>
                     </div>
                  </div>
                  
                  <div className="mb-4 max-w-5xl ml-18 print:hidden">
                    <CriterionRubricDrawer
                      criterionNumber={criterionNumber}
                      isOpen={!!expandedRubrics[criterionNumber]}
                      onToggle={() => toggleCriterionRubric(criterionNumber)}
                      hideInPrint={true}
                    />
                  </div>

                  <div className="space-y-4 max-w-5xl ml-18 print:ml-0 print:max-w-none print:space-y-2.5">
                    {/* WWW Section */}
                    {(res.www?.length > 0 || !isBatchMode) && (
                      <EditableFeedbackList
                        items={res.www || []}
                        criterionId={crit.id}
                        criterionScore={teacherMarks[crit.scoreKey] ?? res.score}
                        type="WWW"
                        isEditable={true}
                        onChange={(newVal) => handleFeedbackChange(crit.scoreKey, 'www', newVal)}
                      />
                    )}
                    
                    {/* EBI Section */}
                    {res.isIncomplete ? (
                      <div
                        data-testid={`incomplete-ebi-notice-${crit.id}`}
                        className="flex items-start gap-2.5 rounded-xl px-4 py-3 bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300"
                      >
                        <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {DEFAULT_INCOMPLETE_EBI_NOTICE}
                          </p>
                          {res.incompleteNote && res.incompleteNote !== DEFAULT_INCOMPLETE_EBI_NOTICE && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {res.incompleteNote}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      (res.ebi?.length > 0 || !isBatchMode) && (
                        <EditableFeedbackList
                          items={res.ebi || []}
                          criterionId={crit.id}
                          criterionScore={teacherMarks[crit.scoreKey] ?? res.score}
                          type="EBI"
                          isEditable={true}
                          onChange={(newVal) => handleFeedbackChange(crit.scoreKey, 'ebi', newVal)}
                        />
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Word Count Analytics */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
           <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-xs flex items-center gap-3 mb-8">
              <span className="text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded p-1.5 flex items-center justify-center font-mono">T</span>
              Word Count Analytics
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-slate-100 dark:border-slate-700 pb-12 mb-8">
              <div>
                 <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Evaluated Payload</p>
                 <p className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-2">{evaluation.word_counts.evaluated_payload}</p>
                 <p className="text-xs text-slate-500">FQ, Analysis, Conclusion, Eval</p>
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Excluded Ancillaries</p>
                 <p className="text-4xl font-black text-slate-400 dark:text-slate-500 mb-2">{evaluation.word_counts.excluded_ancillaries}</p>
                 <p className="text-xs text-slate-500">Tables, Maps, Legends, Biblio</p>
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Raw File Extract</p>
                 <p className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-2">{evaluation.word_counts.raw_file_extract}</p>
                 <p className="text-xs text-slate-500">Total words processed</p>
              </div>
           </div>
           
           <div className="flex justify-center gap-6">
             {isBatchMode ? (
               renderBatchActions && renderBatchActions(teacherMarks)
             ) : (
               <>
                 <button onClick={onExit} className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                   Reset Moderator
                 </button>
                 <button 
                   disabled={isSavingToDirectory}
                   onClick={async () => {
                     if (activeSubmissionMeta) {
                       setIsSavingToDirectory(true);
                       try {
                         const { saveGradedSubmissionWithPdf } = await import('../db');
                         const hasStagePdf = resolvedStage === 'Final'
                           ? Boolean(activeSubmissionMeta.finalPdfUrl)
                           : Boolean(activeSubmissionMeta.draftPdfUrl);
                         await saveGradedSubmissionWithPdf({
                           file: hasStagePdf ? undefined : uploadedFile,
                           candidateName: activeSubmissionMeta.candidateName,
                           className: activeSubmissionMeta.className,
                           assignmentName: activeSubmissionMeta.assignmentName,
                           stage: resolvedStage,
                           evaluation: editableEvaluation,
                           teacherScores: teacherMarks
                         });
                         alert(`${resolvedStage} Coursework Successfully Archived to Firebase!`);
                         onExit();
                       } catch (err: any) {
                         console.error('Save to directory failed:', err);
                         alert(`Failed to save coursework: ${err?.message || err}`);
                       } finally {
                         setIsSavingToDirectory(false);
                       }
                     } else {
                       setIsModalOpen(true);
                     }
                   }}
                   className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors border border-blue-100 dark:border-blue-800 shadow-sm disabled:opacity-60 disabled:cursor-wait"
                 >
                   <Folder className="w-4 h-4" /> {isSavingToDirectory ? 'Saving...' : 'Save To Directory'}
                 </button>
               </>
             )}
           </div>
        </section>

      </main>

      {/* Archive Modal */}
      <ArchiveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialCandidateName={candidateName}
        initialSubmissionType={resolvedStage}
        initialClass={activeSubmissionMeta?.className || ''}
        initialAssignment={activeSubmissionMeta?.assignmentName || ''}
        onSave={async (data) => {
          const { uploadSubmissionPdf, addOrUpdateSubmission, findExistingSubmission } = await import('../db');
          const targetCandidate = data.candidateName;
          const targetClass = data.className || data.classFolder || 'General';
          const targetAssignment = data.assignmentName || 'Coursework';
          const stage: 'Draft' | 'Final' = data.submissionType || resolvedStage;

          const existing = await findExistingSubmission(targetCandidate, targetClass, targetAssignment);
          let submission: any = {
            ...(existing || {}),
            candidateName: targetCandidate,
            className: targetClass,
            assignmentName: targetAssignment,
            status: stage === 'Final' || Boolean(existing?.finalEvaluation) ? 'Final' : 'Draft',
            updatedAt: new Date().toISOString()
          };

          if (uploadedFile) {
            try {
              const { pdfUrl, storagePath } = await uploadSubmissionPdf(uploadedFile, submission, stage);
              if (stage === 'Final') {
                submission.finalPdfUrl = pdfUrl;
                submission.finalStoragePath = storagePath;
              } else {
                submission.draftPdfUrl = pdfUrl;
                submission.draftStoragePath = storagePath;
              }
            } catch (err: any) {
              console.error("Storage upload error in ModerationResults:", err);
              alert(`PDF upload failed: ${err.message}`);
            }
          }

          if (stage === 'Final') {
            submission.finalEvaluation = editableEvaluation;
            submission.finalTeacherScores = teacherMarks;
          } else {
            submission.draftEvaluation = editableEvaluation;
            submission.draftTeacherScores = teacherMarks;
          }

          await addOrUpdateSubmission(submission);
          alert('Save successful and PDF stored in Firebase!');
          onExit();
        }}
      />
    </div>
  );
}
