import React, { useState, useEffect } from 'react';
import { ChevronLeft, Folder, ChevronRight, ChevronDown, FileText, Upload, Columns, Edit2, Play, Plus, Trash2, Check, X, Trophy, CheckCircle2, AlertCircle, Sun, Moon } from 'lucide-react';
import { loadDirectoryData, StudentSubmission, saveDirectoryData, loadStructure, createClass, createAssignment, renameClass, renameAssignment, deleteClass, deleteAssignment, addOrUpdateSubmission } from '../db';
import { EvaluationResult } from '../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EditableFeedbackList } from './EditableFeedbackList';
import { downloadFeedbackPDF } from '../pdfReport';
import { downloadGradesExcel } from '../excelexport';
import { downloadModerationReport } from '../moderationReport';
import { generateClassFeedbackPPTX } from '../pptxGenerator';
import BulkFinalModal from './BulkFinalModal';

import { parseCandidateName } from '../nameParser';

interface DirectoryViewProps {
  onBack: () => void;
  isDarkMode: boolean;
  onUploadFinal: (submission: StudentSubmission) => void;
  toggleDarkMode: () => void;
}

function SwipeableItem({ name, isSelected, onClick, onRename, onDelete, subtitle, icon: Icon, rightIcon: RightIcon }: any) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState(name);

  const submitRename = () => {
    if (tempName.trim() && tempName !== name) {
      onRename(tempName.trim());
    } else {
      setTempName(name); // revert
    }
    setIsRenaming(false);
  };

  return (
    <div className="relative w-full mb-3 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
      <div 
        className={`w-full bg-white dark:bg-slate-800 rounded-xl p-4 border shadow-sm flex items-center justify-between transition-all text-left group cursor-pointer ${isSelected ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
      >
        <div className="flex items-center gap-3 w-full" onClick={isRenaming ? undefined : onClick}>
          <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-blue-500'}`} />
          
          <div className="flex flex-col flex-1 min-w-0">
            {isRenaming ? (
              <input
                autoFocus
                className="w-full font-bold text-sm bg-transparent border-b border-blue-400 outline-none text-slate-800 dark:text-slate-100"
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                onBlur={submitRename}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setIsRenaming(false); }}
              />
            ) : (
              <span className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{name}</span>
            )}
            {subtitle && !isRenaming && <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">{subtitle}</span>}
          </div>
        </div>

        {!isRenaming && (
          <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
               onClick={(e) => { e.stopPropagation(); setTempName(name); setIsRenaming(true); }}
               className="text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded"
               title="Rename"
            >
               <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
               onClick={(e) => { e.stopPropagation(); if (confirm(`Delete '${name}'?`)) onDelete(); }}
               className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded"
               title="Delete"
            >
               <Trash2 className="w-3.5 h-3.5" />
            </button>
            <RightIcon className="w-4 h-4 text-slate-300 group-hover:text-blue-500 shrink-0 ml-1" />
          </div>
        )}
      </div>
    </div>
  );
}

function NewFolderInput({ onSubmit, onCancel, placeholder, initialValue = '' }: { onSubmit: (name: string) => void, onCancel: () => void, placeholder: string, initialValue?: string }) {
  const [name, setName] = useState(initialValue);

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl p-3 border border-blue-500 ring-1 ring-blue-500/20 shadow-sm flex items-center justify-between mb-3 text-left">
      <div className="flex items-center gap-3 w-full">
        <Folder className="w-5 h-5 text-blue-500" />
        <input
          autoFocus
          className="w-full font-bold text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
          placeholder={placeholder}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && name.trim()) onSubmit(name.trim());
            if (e.key === 'Escape') onCancel();
          }}
        />
      </div>
      <div className="flex items-center gap-2 pr-2">
        <button onClick={() => name.trim() && onSubmit(name.trim())} className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 p-1 rounded-md">
           <Check className="w-4 h-4" />
        </button>
        <button onClick={onCancel} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-md">
           <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AssignmentItem({ name, isSelected, onClick, onRename, onDelete }: any) {
  const [isRenaming, setIsRenaming] = useState(false);

  if (isRenaming) {
    return <NewFolderInput placeholder="Assignment Name" initialValue={name} onSubmit={(n) => { onRename(n); setIsRenaming(false); }} onCancel={() => setIsRenaming(false)} />
  }

  return (
    <div 
      className={`w-full rounded-lg p-2 border ${isSelected ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'} flex items-center justify-between group cursor-pointer transition-colors`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <ChevronRight className="w-3 h-3 text-green-600/50 shrink-0" />
        <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-green-600' : 'text-slate-400'}`} />
        <span className={`text-sm font-bold truncate ${isSelected ? 'text-green-800 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>{name}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }} className="text-slate-400 hover:text-green-600 p-1">
          <Edit2 className="w-3 h-3" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); if(confirm(`Delete ${name}?`)) onDelete(); }} className="text-slate-400 hover:text-red-500 p-1">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function ClassAccordion({
  name, isExpanded, onToggle, onRename, onDelete,
  assignments, onAddAssignment, onDeleteAssignment, onRenameAssignment,
  selectedAssignment, onSelectAssignment
}: any) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isAddingSub, setIsAddingSub] = useState(false);

  if (isRenaming) {
    return <NewFolderInput placeholder="Class Name" initialValue={name} onSubmit={(n) => { onRename(n); setIsRenaming(false); }} onCancel={() => setIsRenaming(false)} />
  }

  return (
    <div className="flex flex-col mb-2">
      {/* Class Header */}
      <div className={`w-full bg-white dark:bg-slate-800 rounded-xl p-3 border ${isExpanded ? 'border-green-400 shadow-sm ring-1 ring-green-400/20' : 'border-green-200 dark:border-green-800'} flex items-center justify-between group cursor-pointer`} onClick={onToggle}>
        <div className="flex items-center gap-2 overflow-hidden">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-green-700 shrink-0" /> : <ChevronRight className="w-4 h-4 text-green-700 shrink-0" />}
          <Folder className="w-4 h-4 text-green-600 shrink-0" />
          <span className="font-bold text-green-800 dark:text-green-400 text-sm truncate">{name}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }} className="text-green-600 hover:text-green-800 p-1" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); if(confirm(`Delete ${name}?`)) onDelete(); }} className="text-red-500 hover:text-red-700 p-1" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="ml-4 pl-3 border-l-2 border-slate-100 dark:border-slate-700 mt-2 flex flex-col gap-1 py-1">
          {assignments.length === 0 && !isAddingSub && (
            <p className="text-sm text-slate-400 py-1 px-2">No assignments</p>
          )}

          {assignments.map((a: string) => (
            <AssignmentItem 
              key={a}
              name={a}
              isSelected={selectedAssignment === a}
              onClick={() => onSelectAssignment(a)}
              onRename={(n: string) => onRenameAssignment(a, n)}
              onDelete={() => onDeleteAssignment(a)}
            />
          ))}

          {isAddingSub ? (
            <div className="mt-2">
               <NewFolderInput placeholder="New Assignment..." onSubmit={(n) => { onAddAssignment(n); setIsAddingSub(false); }} onCancel={() => setIsAddingSub(false)} />
            </div>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setIsAddingSub(true); }} className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-2 py-2 px-2 uppercase tracking-widest mt-1 w-full text-left transition-colors">
              <Plus className="w-3 h-3" /> ADD SUBFOLDER
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DirectoryView({ onBack, isDarkMode, onUploadFinal, toggleDarkMode }: DirectoryViewProps) {
  const [data, setData] = useState<StudentSubmission[]>([]);
  const [struct, setStruct] = useState({ classes: [] as string[], assignments: {} as Record<string, string[]> });
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<StudentSubmission | null>(null);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [activeTab, setActiveTab] = useState<'draft'|'final'>('draft');
  const [isGeneratingPPTX, setIsGeneratingPPTX] = useState(false);
  const [pptxError, setPptxError] = useState<string | null>(null);
  const [isBulkFinalOpen, setIsBulkFinalOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [d, s] = await Promise.all([loadDirectoryData(), loadStructure()]);
      setData(d);
      setStruct(s);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const classes = Array.from(new Set([...struct.classes, ...data.map(d => d.className)]));
  const assignmentsForClass = selectedClass 
    ? Array.from(new Set([...(struct.assignments[selectedClass] || []), ...data.filter(d => d.className === selectedClass).map(d => d.assignmentName)]))
    : [];
  const studentsForAssignment = selectedAssignment
    ? data.filter(d => d.className === selectedClass && d.assignmentName === selectedAssignment)
      .sort((a, b) => {
         const nameA = parseCandidateName(a.candidateName);
         const nameB = parseCandidateName(b.candidateName);
         return nameA.surname.localeCompare(nameB.surname) || nameA.forename.localeCompare(nameB.forename);
      })
    : [];

  const handleFeedbackChange = async (ao: string, type: 'www' | 'ebi', newArray: string[]) => {
    if (!selectedStudent || !selectedClass || !selectedAssignment) return;
    
    const upd = [...data];
    const idx = upd.findIndex(s => s.candidateName === selectedStudent.candidateName && s.className === selectedClass && s.assignmentName === selectedAssignment);
    if (idx >= 0) {
      if (upd[idx].draftEvaluation) {
         const evalCpy = JSON.parse(JSON.stringify(upd[idx].draftEvaluation));
         if (evalCpy.scores[ao]) {
            evalCpy.scores[ao][type] = newArray;
         }
         const updatedStudent = { ...upd[idx], draftEvaluation: evalCpy };
         upd[idx] = updatedStudent;
         setData(upd);
         await addOrUpdateSubmission(updatedStudent);
         setSelectedStudent(updatedStudent);
      }
    }
  };

  const handleTeacherScoreChange = async (ao: string, newScore: number, isFinal: boolean) => {
    if (!selectedStudent) return;
    if (newScore < 0) newScore = 0;
    if (newScore > 12) newScore = 12;
    
    const upd = [...data];
    const idx = upd.findIndex(s => s.candidateName === selectedStudent.candidateName && s.className === selectedClass && s.assignmentName === selectedAssignment);
    if (idx >= 0) {
      const updatedStudent = { ...upd[idx] };
      if (isFinal) {
        updatedStudent.finalTeacherScores = { ...(updatedStudent.finalTeacherScores || {}), [ao]: newScore };
      } else {
        updatedStudent.draftTeacherScores = { ...(updatedStudent.draftTeacherScores || {}), [ao]: newScore };
      }
      upd[idx] = updatedStudent;
      setData(upd);
      await addOrUpdateSubmission(updatedStudent);
      setSelectedStudent(updatedStudent);
    }
  };


  const renderStudentDetails = () => {
    if (!selectedStudent) return null;

    const hasFinal = !!selectedStudent.finalEvaluation;
    
    const showSideBySide = activeTab === 'final' && hasFinal && showComparison && selectedStudent.draftEvaluation;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{selectedStudent.candidateName.replace(/\s*-\s*(DRAFT|FINAL|Draft|Final)$/i, '')}</h2>
          
          <div className="flex items-center gap-4">
            {activeTab === 'final' && hasFinal && selectedStudent.draftEvaluation && (
              <label className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                />
                Comparison Mode
              </label>
            )}
          </div>
        </div>
        
        {showSideBySide ? (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Draft Report</h3>
                <button 
                   onClick={() => downloadFeedbackPDF(selectedStudent, 'draft')}
                   className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors"
                   title="Download Draft Report"
                >
                   <Upload className="w-3.5 h-3.5" style={{transform: 'rotate(180deg)'}} /> Download PDF
                </button>
              </div>
              <EvaluationDisplay 
                evalData={selectedStudent.draftEvaluation!} 
                teacherScores={selectedStudent.draftTeacherScores || {}} 
                onScoreChange={(ao, s) => handleTeacherScoreChange(ao, s, false)}
                onFeedbackChange={handleFeedbackChange}
                isFinal={false}
              />
            </div>
            <div>
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                   <span>Final Report</span>
                   <span className="text-[10px] bg-blue-600/10 px-2 py-0.5 rounded-full text-blue-600">Comparison Mode</span>
                 </h3>
                 <button 
                    onClick={() => downloadFeedbackPDF(selectedStudent, 'final')}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors"
                    title="Download Final Report"
                 >
                    <Upload className="w-3.5 h-3.5" style={{transform: 'rotate(180deg)'}} /> Download PDF
                 </button>
               </div>
               <EvaluationDisplay 
                evalData={selectedStudent.finalEvaluation!} 
                teacherScores={selectedStudent.finalTeacherScores || {}} 
                onScoreChange={(ao, s) => handleTeacherScoreChange(ao, s, true)}
                isFinal={true}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6 pb-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {activeTab === 'final' && hasFinal ? 'Final Report' : 'Draft Report'}
              </h3>
              <div className="flex items-center gap-3">
                <button 
                   onClick={() => downloadFeedbackPDF(selectedStudent, activeTab)}
                   className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
                   title="Download PDF Report"
                >
                   <Upload className="w-4 h-4" style={{transform: 'rotate(180deg)'}} /> Download PDF Report
                </button>
                {!hasFinal && (
                  <button 
                    onClick={() => onUploadFinal(selectedStudent)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                   >
                     <Upload className="w-4 h-4" /> Upload Final CWK
                  </button>
                )}
              </div>
            </div>
            {activeTab === 'final' && hasFinal ? (
               <EvaluationDisplay 
                evalData={selectedStudent.finalEvaluation!} 
                teacherScores={selectedStudent.finalTeacherScores || {}} 
                onScoreChange={(ao, s) => handleTeacherScoreChange(ao, s, true)}
                isFinal={true}
              />
            ) : selectedStudent.draftEvaluation ? (
              <EvaluationDisplay 
                evalData={selectedStudent.draftEvaluation!} 
                teacherScores={selectedStudent.draftTeacherScores || {}} 
                onScoreChange={(ao, s) => handleTeacherScoreChange(ao, s, false)}
                onFeedbackChange={handleFeedbackChange}
                isFinal={false}
              />
            ) : <p className="text-slate-500">Draft data not available</p>}
          </div>
        )}
      </div>
    );
  };

  const renderCandidateCard = (s: StudentSubmission) => {
    const hasFinal = !!s.finalEvaluation;
    
    // Calculate IGQA and Teacher marks for the active tab context
    const getScores = (evalData: EvaluationResult | undefined, teacherMarks: Record<string, number> | undefined) => {
       if (!evalData) return { igqa: null, teacher: null };
       const igqaScore = evalData.total_score;
       
       let teacherScore = igqaScore;
       if (teacherMarks && Object.keys(teacherMarks).length > 0) {
         teacherScore = 0;
         ['ao1_knowledge', 'ao2_observation', 'ao2_organisation', 'ao2_analysis', 'ao3_conclusion'].forEach(key => {
           teacherScore += teacherMarks[key] ?? (evalData?.scores as any)?.[key]?.score ?? 0;
         });
       }
       
       return { igqa: igqaScore, teacher: teacherScore };
    };

    const draftScores = getScores(s.draftEvaluation, s.draftTeacherScores);
    const finalScores = getScores(s.finalEvaluation, s.finalTeacherScores);

    const renderScoreBlock = (label: string, scores: {igqa: number|null, teacher: number|null}) => {
      if (scores.igqa === null) return null;
      return (
        <div className="flex flex-col items-center">
           <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 mb-1">{label}</span>
           <div className="flex items-center gap-1.5">
              <div className="flex flex-col items-center">
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">IGQA</span>
                 <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700/50 rounded font-black text-slate-700 dark:text-slate-300 text-xs">
                   {scores.igqa}<span className="text-[10px] text-slate-400">/60</span>
                 </span>
              </div>
              <div className="flex flex-col items-center">
                 <span className="text-[8px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest leading-none mb-1">TEACHER</span>
                 <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded font-black text-green-800 dark:text-green-400 text-xs">
                   {scores.teacher}<span className="text-[10px] text-green-600/50">/60</span>
                 </span>
              </div>
           </div>
        </div>
      );
    }

    return (
      <div key={s.candidateName} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] mb-1">{parseCandidateName(s.candidateName).formattedName}</h3>
          </div>
          <div className="flex gap-4">
            {activeTab === 'draft' ? (
               renderScoreBlock('Draft CWK', draftScores)
            ) : (
               <>
                 {renderScoreBlock('Draft CWK', draftScores)}
                 {hasFinal ? renderScoreBlock('Final CWK', finalScores) : (
                   <button
                     onClick={() => onUploadFinal(s)}
                     className="text-green-600 border border-green-500 border-dashed rounded px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-1 hover:bg-green-50 dark:hover:bg-green-900/20"
                   >
                     Upload Final CWK <Upload className="w-3 h-3" />
                   </button>
                 )}
               </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700/50 pt-3">
           {activeTab === 'draft' ? (
               <button 
                 onClick={() => setSelectedStudent(s)} 
                 className="flex-1 py-1.5 rounded bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
               >
                 View Draft Report
               </button>
           ) : (
               <div className="flex-1 flex gap-2">
                 <button 
                   onClick={() => setSelectedStudent(s)} 
                   className="flex-1 py-1.5 rounded bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                 >
                   View Draft Report
                 </button>
                 <button 
                   onClick={() => hasFinal ? setSelectedStudent(s) : null} 
                   className={`flex-1 py-1.5 rounded font-bold text-[11px] transition-colors ${hasFinal ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100' : 'bg-transparent text-green-300 dark:text-green-800 cursor-not-allowed'}`}
                 >
                   View Final Report
                 </button>
               </div>
           )}

          <div className="flex gap-2 shrink-0">
             <button 
                onClick={() => downloadFeedbackPDF(s, activeTab)}
                title="Download Feedback Report"
                className="w-7 h-7 rounded bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
             >
               <Upload className="w-3.5 h-3.5" style={{transform: 'rotate(180deg)'}} />
             </button>
             <button 
                onClick={() => setDeletingStudent(s)}
                title="Delete Student Submission"
                 className="w-7 h-7 rounded bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
             >
                <Trash2 className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-[#f8f9fc] dark:bg-slate-900 flex flex-col font-sans transition-colors ${isDarkMode ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-20 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
            <Folder className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[22px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-tight leading-tight">Folder Directory</h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Saved CWK Assessments</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={selectedStudent ? () => setSelectedStudent(null) : onBack} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Folder className="w-5 h-5" />
          </button>
          <button onClick={toggleDarkMode} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={onBack} className="px-4 py-2 text-xs font-bold text-red-500 border border-red-200 dark:border-red-900/50 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors uppercase tracking-wider">
            Exit
          </button>
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 ml-4 flex flex-col justify-center bg-white dark:bg-slate-800 shadow-sm block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Standard</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">MAY 2026</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 flex gap-6 h-[calc(100vh-80px)] overflow-hidden">
        {/* Navigation Sidebar: Classes & Assignments */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto shrink-0 border-r border-slate-200 dark:border-slate-700 pr-6">
          <div className="flex items-center gap-2 mb-2 px-2 mt-2">
            <Folder className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest text-sm">Master Directory</h3>
          </div>

          <button 
             onClick={() => setIsCreatingClass(true)} 
             className="w-full border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-3 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 font-bold text-sm shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Teacher Folder
          </button>
          
          {isCreatingClass && (
            <NewFolderInput 
               placeholder="New Class Name..."
               onSubmit={async (name) => { await createClass(name); await refreshData(); setIsCreatingClass(false); }}
               onCancel={() => setIsCreatingClass(false)}
            />
          )}

          <div className="flex flex-col gap-2 pb-10">
            {classes.map(c => (
              <ClassAccordion 
                key={c}
                name={c}
                isExpanded={selectedClass === c}
                onToggle={() => setSelectedClass(selectedClass === c ? null : c)}
                onRename={async (newN: string) => { await renameClass(c, newN); await refreshData(); if (selectedClass === c) setSelectedClass(newN); }}
                onDelete={async () => { await deleteClass(c); await refreshData(); if (selectedClass === c) setSelectedClass(null); }}
                assignments={Array.from(new Set([
                  ...(struct.assignments[c] || []),
                  ...data.filter(d => d.className === c).map(d => d.assignmentName)
                ]))}
                onAddAssignment={async (name: string) => { await createAssignment(c, name); await refreshData(); }}
                onDeleteAssignment={async (a: string) => { await deleteAssignment(c, a); await refreshData(); if(selectedAssignment === a) setSelectedAssignment(null); }}
                onRenameAssignment={async (oldN: string, newN: string) => { await renameAssignment(c, oldN, newN); await refreshData(); if(selectedAssignment === oldN) setSelectedAssignment(newN); }}
                selectedAssignment={selectedClass === c ? selectedAssignment : null}
                onSelectAssignment={(a: string) => {
                  setSelectedClass(c);
                  setSelectedAssignment(a);
                  setSelectedStudent(null);
                }}
              />
            ))}
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 font-sans">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 pl-6 ml-6">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
               <p className="font-bold text-slate-500">Loading Report Data...</p>
            </div>
          ) : selectedStudent ? (
             <div className="h-full relative pl-6">
                <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                   <ChevronLeft className="w-5 h-5 mr-0.5" />
                </button>
                {renderStudentDetails()}
             </div>
          ) : selectedClass && selectedAssignment ? (
            <div className="h-full flex flex-col pl-6">
               {/* Context Header */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shrink-0 flex flex-wrap items-center justify-between shadow-sm mb-6 gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                     <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-green-500" />
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Saved Candidates</h2>
                        <span className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm ml-2">{studentsForAssignment.length}</span>
                     </div>
                     <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                       <button 
                         onClick={() => setActiveTab('draft')} 
                         className={`px-4 py-1.5 rounded-md font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === 'draft' ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                         Draft CWK
                       </button>
                       <button 
                         onClick={() => setActiveTab('final')} 
                         className={`px-4 py-1.5 rounded-md font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === 'final' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                         Final CWK
                       </button>
                     </div>
                  </div>
                  <div className="flex flex-row items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0 overflow-hidden">
                     {activeTab === 'draft' ? (
                       <div className="flex flex-col items-end">
                         <button 
                           onClick={async () => {
                             if (!selectedClass || !selectedAssignment || isGeneratingPPTX) return;
                             setIsGeneratingPPTX(true);
                             setPptxError(null);
                             try {
                               await generateClassFeedbackPPTX(studentsForAssignment, selectedClass, selectedAssignment);
                             } catch (err: any) {
                               setPptxError(err.message || "Failed to generate PPTX");
                             } finally {
                               setIsGeneratingPPTX(false);
                             }
                           }}
                           className={`flex-1 lg:flex-none min-w-0 justify-center items-center gap-1.5 ${isGeneratingPPTX ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#d76b4a] hover:bg-[#c55a39]'} text-white px-3 py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-colors flex`}
                           disabled={isGeneratingPPTX}
                         >
                            <FileText className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">
                              {isGeneratingPPTX ? 'Generating...' : 'Generate Feedback (.pptx)'}
                            </span>
                         </button>
                         {pptxError && <div className="text-red-500 text-[10px] mt-1 font-bold">{pptxError}</div>}
                       </div>
                     ) : (
                       <>
                         <button 
                           onClick={() => setIsBulkFinalOpen(true)}
                           className="flex-1 lg:flex-none min-w-0 justify-center items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-colors flex"
                         >
                            <Upload className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Bulk Upload Final CWKs</span>
                         </button>
                         <button onClick={() => downloadModerationReport(studentsForAssignment, selectedClass || 'Class', selectedAssignment || 'Assignment')} className="flex-1 lg:flex-none min-w-0 justify-center items-center gap-1.5 bg-[#9ba4ad] hover:bg-[#858f99] text-white px-3 py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-colors flex">
                            <Columns className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Moderation Summary</span>
                         </button>
                       </>
                     )}
                     <button onClick={() => downloadGradesExcel(studentsForAssignment, activeTab === 'draft', selectedAssignment || 'Assignment')} className="flex-1 lg:flex-none min-w-0 justify-center items-center gap-1.5 bg-[#00A16B] hover:bg-[#008A5E] text-white px-3 py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-colors flex">
                        <Upload className="w-3.5 h-3.5 shrink-0" style={{transform: 'rotate(180deg)'}} /> <span className="truncate">Download {activeTab === 'draft' ? 'Draft' : 'Final'} (.xlsx)</span>
                     </button>
                  </div>
               </div>

               {/* Cards Grid */}
               <div className="flex-1 overflow-y-auto">
                 {studentsForAssignment.length === 0 ? (
                   <div className="w-full py-10 flex flex-col items-center justify-center text-center">
                      <p className="text-slate-500">No submissions yet for {selectedAssignment}.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
                     {studentsForAssignment.map(s => renderCandidateCard(s))}
                   </div>
                 )}
               </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 pl-6 ml-6">
              <Folder className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-lg text-slate-500 dark:text-slate-400">Select an assignment folder to view submissions</p>
            </div>
          )}
        </div>
      </main>
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
      <BulkFinalModal
        isOpen={isBulkFinalOpen}
        onClose={() => setIsBulkFinalOpen(false)}
        students={studentsForAssignment}
        currentClass={selectedClass || ''}
        currentAssignment={selectedAssignment || ''}
        onCommit={async (updatedStudents) => {
           const { addOrUpdateSubmission } = await import('../db');
           for (const stu of updatedStudents) {
             await addOrUpdateSubmission(stu);
           }
           await refreshData();
           setIsBulkFinalOpen(false);
        }}
      />
    </div>
  );
}

function EvaluationDisplay({ evalData, teacherScores, onScoreChange, onFeedbackChange, isFinal }: { evalData: EvaluationResult, teacherScores: Record<string, number>, onScoreChange: (ao: string, s: number) => void, onFeedbackChange?: (ao: string, type: 'www' | 'ebi', newArray: string[]) => void, isFinal: boolean }) {
  const criteriaData = [
    { id: '1', name: 'Knowledge & Understanding (AO1)', scoreKey: 'ao1_knowledge' },
    { id: '2', name: 'Observation and collection of data (AO2)', scoreKey: 'ao2_observation' },
    { id: '3', name: 'Organisation and presentation of data (AO2)', scoreKey: 'ao2_organisation' },
    { id: '4', name: 'Analysis and interpretation (AO2)', scoreKey: 'ao2_analysis' },
    { id: '5', name: 'Conclusion and Evaluation (AO3)', scoreKey: 'ao3_conclusion' }
  ];

  const totalPossible = 60;
  
  // Calculate total teacher score
  let teacherTotal = 0;
  criteriaData.forEach(c => {
    teacherTotal += teacherScores[c.scoreKey] ?? (evalData?.scores as any)?.[c.scoreKey]?.score ?? 0;
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
           <div className="flex justify-between items-end mb-2">
             <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">IGQA Score</span>
             <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{evalData.total_score} <span className="text-lg text-slate-400">/{totalPossible}</span></span>
           </div>
           
           <div className="flex justify-between items-end pt-3 border-t border-slate-200 dark:border-slate-600">
             <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">Teacher Mod.</span>
             <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{teacherTotal} <span className="text-lg text-blue-400/50">/{totalPossible}</span></span>
           </div>
        </div>

        {evalData.moderator_executive_summary && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-xs">
              <Trophy className="w-4 h-4" /> Moderator Executive Summary
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[13px] font-medium">
              {evalData.moderator_executive_summary}
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {criteriaData.map((crit) => {
          const res = (evalData?.scores as any)?.[crit.scoreKey];
          if (!res) return null;
          const ts = teacherScores[crit.scoreKey] ?? res.score;
          
          return (
            <div key={crit.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-3">
                 <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                   Criterion {crit.id}: {crit.name}
                 </h4>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">IGQA</span>
                  <span className="font-black text-slate-700 dark:text-slate-200">{res.score}/12</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1">Teach <Edit2 className="w-3 h-3" /></span>
                  <div className="flex flex-col items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                    <button 
                      onClick={() => onScoreChange(crit.scoreKey, ts + 1)}
                      className="w-8 flex justify-center text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 h-4 border-b border-slate-200 dark:border-slate-700 items-center transition-colors"
                    >
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 0L10 6H0L5 0Z" /></svg>
                    </button>
                    <div className="w-12 h-8 flex items-center justify-center font-black text-blue-700 dark:text-blue-400">
                      {ts}
                    </div>
                    <button 
                      onClick={() => onScoreChange(crit.scoreKey, ts - 1)}
                      className="w-8 flex justify-center text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 h-4 border-t border-slate-200 dark:border-slate-700 items-center transition-colors"
                    >
                       <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 6L0 0H10L5 6Z" /></svg>
                    </button>
                  </div>
                  <span className="font-bold text-slate-400">/12</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                {/* WWW Section */}
                {(res.www?.length > 0 || !isFinal) && (
                  <EditableFeedbackList
                    items={res.www || []}
                    criterionId={crit.id}
                    type="WWW"
                    isEditable={!isFinal}
                    onChange={(newVal) => onFeedbackChange && onFeedbackChange(crit.scoreKey, 'www', newVal)}
                  />
                )}
                
                {/* EBI Section */}
                {(res.ebi?.length > 0 || !isFinal) && (
                  <EditableFeedbackList
                    items={res.ebi || []}
                    criterionId={crit.id}
                    type="EBI"
                    isEditable={!isFinal}
                    onChange={(newVal) => onFeedbackChange && onFeedbackChange(crit.scoreKey, 'ebi', newVal)}
                  />
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
