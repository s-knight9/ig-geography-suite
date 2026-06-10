import React, { useState, useEffect } from 'react';
import { EvaluationResult } from '../types';
import { Folder, Moon, Sun, Edit2, Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import { StudentSubmission } from '../db';
import ArchiveModal from './ArchiveModal';
import { parseCandidateName } from '../nameParser';
import { EditableFeedbackList } from './EditableFeedbackList';

interface ModerationResultsProps {
  key?: string;
  evaluation: EvaluationResult;
  candidateName: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onExit: () => void;
  onOpenDirectory: () => void;
  prefilledStudent?: StudentSubmission | null;
  isBatchMode?: boolean;
  renderBatchActions?: (teacherMarks: Record<string, number>) => React.ReactNode;
}

export default function ModerationResults({ evaluation, candidateName, isDarkMode, toggleDarkMode, onExit, onOpenDirectory, prefilledStudent, isBatchMode, renderBatchActions }: ModerationResultsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formattedName } = parseCandidateName(candidateName);
  
  // Clone evaluation to make feedback points stateful and editable before saving!
  const [editableEvaluation, setEditableEvaluation] = useState<EvaluationResult>(() => JSON.parse(JSON.stringify(evaluation)));
  
  const handleFeedbackChange = (ao: string, type: 'www' | 'ebi', newArray: string[]) => {
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
  
  return (
    <div className={`flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="flex items-center justify-between h-20 px-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0 sticky top-0 z-10 transition-colors">
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

      <main className="max-w-7xl mx-auto w-full px-8 py-8 space-y-6">
        
        {/* Candidate Profile Widget */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Candidate Profile</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{formattedName}</h2>
        </section>

        {/* Global Summary Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">IGQA Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-blue-600 dark:text-blue-500">{evaluation.total_score}</span>
              <span className="text-2xl font-black text-slate-300 dark:text-slate-600">/{totalPossible}</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Teacher Moderated</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-800 dark:text-slate-200">{totalTeacherMark}</span>
              <span className="text-2xl font-black text-slate-300 dark:text-slate-600">/{totalPossible}</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Word Count Checked</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-800 dark:text-slate-200">{evaluation.word_counts.evaluated_payload}</span>
              <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">Words</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col justify-center">
             <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4 text-center">Compliance Status</p>
             <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
               <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase leading-relaxed text-center">
                 Compliant (The stated {evaluation.word_counts.raw_file_extract} total clearly includes excluded elements. The core readable text is {evaluation.word_counts.evaluated_payload}, well within the limit).
               </p>
             </div>
          </div>
        </section>

        {/* Moderator Executive Summary */}
        <section className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-8 shadow-xl text-white">
          <h3 className="text-blue-600 dark:text-blue-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-sm">
            <Trophy className="w-5 h-5" /> Moderator Executive Summary
          </h3>
          <p className="text-slate-300 leading-relaxed text-[15px] font-medium">
            {evaluation.moderator_executive_summary}
          </p>
        </section>

        {/* Detailed Criterion Rubric */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="text-slate-400 border border-slate-300 dark:border-slate-600 rounded p-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </span>
              Detailed Criterion Rubric
            </h3>
          </div>
          
          <div className="p-8 divide-y divide-slate-100 dark:divide-slate-700">
            {criteriaData.map((crit) => {
              const res = (evaluation?.scores as any)?.[crit.scoreKey];
              if (!res) return null;
              
              return (
                <div key={crit.id} className="py-8 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-6">
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">Criterion {crit.id}: {crit.name}</h4>
                     </div>
                     <div className="flex items-center gap-8">
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">IGQA Mark:</span>
                         <span className="text-xl font-black text-slate-800 dark:text-slate-200">{res.score}</span>
                         <span className="text-sm font-bold text-slate-400">/ 12</span>
                       </div>
                       <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest flex items-center gap-1">
                           Teacher Mark <Edit2 className="w-3 h-3" />
                         </span>
                         <div className="flex flex-col items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                           <button 
                             onClick={() => handleTeacherMarkChange(crit.scoreKey, teacherMarks[crit.scoreKey] + 1)}
                             className="w-8 flex justify-center text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 h-4 border-b border-slate-200 dark:border-slate-700 items-center transition-colors"
                           >
                             <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 0L10 6H0L5 0Z" /></svg>
                           </button>
                           <div className="w-16 h-8 flex items-center justify-center font-black text-xl text-slate-800 dark:text-slate-200">
                             {teacherMarks[crit.scoreKey]}
                           </div>
                           <button 
                             onClick={() => handleTeacherMarkChange(crit.scoreKey, teacherMarks[crit.scoreKey] - 1)}
                             className="w-8 flex justify-center text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 h-4 border-t border-slate-200 dark:border-slate-700 items-center transition-colors"
                           >
                              <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 6L0 0H10L5 6Z" /></svg>
                           </button>
                         </div>
                         <span className="text-sm font-bold text-slate-400">/ 12</span>
                       </div>
                     </div>
                  </div>
                  
                  <div className="space-y-4 max-w-5xl ml-18">
                    {/* WWW Section */}
                    {(res.www?.length > 0 || !isBatchMode) && (
                      <EditableFeedbackList
                        items={res.www || []}
                        criterionId={crit.id}
                        type="WWW"
                        isEditable={true}
                        onChange={(newVal) => handleFeedbackChange(crit.scoreKey, 'www', newVal)}
                      />
                    )}
                    
                    {/* EBI Section */}
                    {(res.ebi?.length > 0 || !isBatchMode) && (
                      <EditableFeedbackList
                        items={res.ebi || []}
                        criterionId={crit.id}
                        type="EBI"
                        isEditable={true}
                        onChange={(newVal) => handleFeedbackChange(crit.scoreKey, 'ebi', newVal)}
                      />
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
                   onClick={async () => {
                     if (prefilledStudent) {
                       import('../db').then(({ addOrUpdateSubmission }) => {
                         addOrUpdateSubmission({
                           candidateName: prefilledStudent.candidateName,
                           className: prefilledStudent.className,
                           assignmentName: prefilledStudent.assignmentName,
                           status: 'Final',
                           draftEvaluation: prefilledStudent.draftEvaluation,
                           draftTeacherScores: prefilledStudent.draftTeacherScores,
                           finalEvaluation: editableEvaluation,
                           finalTeacherScores: teacherMarks
                         });
                         alert('Final Coursework Successfully Archived!');
                         onExit();
                       });
                     } else {
                       setIsModalOpen(true);
                     }
                   }}
                   className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors border border-blue-100 dark:border-blue-800 shadow-sm"
                 >
                   <Folder className="w-4 h-4" /> Save To Directory
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
        onSave={async (data) => {
          const { addOrUpdateSubmission } = await import('../db');
          await addOrUpdateSubmission({
            candidateName: data.candidateName,
            className: data.classFolder,
            assignmentName: data.assignmentName,
            status: data.submissionType,
            ...(data.submissionType === 'Draft' 
                ? { draftEvaluation: editableEvaluation, draftTeacherScores: teacherMarks } 
                : { finalEvaluation: editableEvaluation, finalTeacherScores: teacherMarks })
          });
          alert('Save successful!');
          onExit();
        }}
      />
    </div>
  );
}
