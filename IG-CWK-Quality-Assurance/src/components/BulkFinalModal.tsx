import React, { useState, useRef, useMemo } from 'react';
import { Upload, X, CheckCircle2, Loader2, PlayCircle, Folder, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { StudentSubmission } from '../db';
import { parseCandidateName } from '../nameParser';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface BulkFinalModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentSubmission[];
  currentClass: string;
  currentAssignment: string;
  onCommit: (updatedStudents: StudentSubmission[]) => void;
}

interface BulkMember extends Omit<StudentSubmission, 'status'> {
  id: string; // unique internal id
  status: 'DRAFT' | 'READY' | 'GRADING' | 'DONE' | 'ERROR';
  file?: File;
  fileContent?: string;
  error?: string;
  newFinalEvaluation?: any;
}

const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        text += strings.join(' ') + '\n';
    }
    return text;
};

export default function BulkFinalModal({ isOpen, onClose, students, currentClass, currentAssignment, onCommit }: BulkFinalModalProps) {
  const [members, setMembers] = useState<BulkMember[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState({ current: 0, total: 0 });
  const [showSummary, setShowSummary] = useState(false);
  
  React.useEffect(() => {
    if (isOpen) {
      const drafts = students.filter(s => s.status === 'Draft' || !s.finalEvaluation);
      const withParsed = drafts.map(d => ({ ...d, parsed: parseCandidateName(d.candidateName) }));
      withParsed.sort((a, b) => a.parsed.surname.localeCompare(b.parsed.surname) || a.parsed.forename.localeCompare(b.parsed.forename));
      
      setMembers(withParsed.map(d => ({ ...d, id: Math.random().toString(), status: 'DRAFT' })));
      setShowSummary(false);
    }
  }, [isOpen, students]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await extractTextFromPDF(file);
      setMembers(prev => prev.map(m => {
        if (m.id === id) {
          return { ...m, file, fileContent: text, status: 'READY' };
        }
        return m;
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to extract text from this PDF.');
    }
  };

  const handleProcess = async () => {
    const targetMembers = members.filter(m => m.status === 'READY');
    if (targetMembers.length === 0) return;

    setIsGrading(true);
    setGradingProgress({ current: 0, total: targetMembers.length });
    const newMembersList = [...members];

    for (let i = 0; i < targetMembers.length; i++) {
        const student = targetMembers[i];
        const studentIndex = newMembersList.findIndex(m => m.id === student.id);
        
        newMembersList[studentIndex] = { ...newMembersList[studentIndex], status: 'GRADING' };
        setMembers([...newMembersList]);
        setGradingProgress({ current: i + 1, total: targetMembers.length });

        try {
            // Retrieve Draft text or Evaluation JSON
            const draftContent = JSON.stringify(student.draftEvaluation || {});
            const finalContent = student.fileContent || "";

            const response = await fetch('/api/evaluate-compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cwk1: draftContent, cwk2: finalContent })
            });

            if (response.ok) {
                const data = await response.json();
                if (data && !data.error) {
                    // Extract the final side of the comparison to be the new evaluation
                    // Actually, the evaluate-compare returns a comparison evaluation format.
                    // But we want to store it as a Final piece and have its criteria scores.
                    // Wait, the compare prompt returns `cwk2_total_score` and `cwk1_total_score` and `criteria` array.
                    // We can map this to a regular evaluation for Final.
                    const finalEval = {
                       total_score: data.cwk2_total_score || 0,
                       moderator_executive_summary: "Comparative Analysis: " + (data.moderator_executive_summary || ""),
                       word_counts: { evaluated_payload: 0, excluded_ancillaries: 0, raw_file_extract: 0 },
                       scores: {
                         ao1_knowledge: {
                            score: data.criteria?.ao1_knowledge?.cwk2_score || 0,
                            www: data.criteria?.ao1_knowledge?.cwk2_www || [],
                            ebi: data.criteria?.ao1_knowledge?.cwk2_ebi || []
                         },
                         ao2_observation: {
                            score: data.criteria?.ao2_observation?.cwk2_score || 0,
                            www: data.criteria?.ao2_observation?.cwk2_www || [],
                            ebi: data.criteria?.ao2_observation?.cwk2_ebi || []
                         },
                         ao2_organisation: {
                            score: data.criteria?.ao2_organisation?.cwk2_score || 0,
                            www: data.criteria?.ao2_organisation?.cwk2_www || [],
                            ebi: data.criteria?.ao2_organisation?.cwk2_ebi || []
                         },
                         ao2_analysis: {
                            score: data.criteria?.ao2_analysis?.cwk2_score || 0,
                            www: data.criteria?.ao2_analysis?.cwk2_www || [],
                            ebi: data.criteria?.ao2_analysis?.cwk2_ebi || []
                         },
                         ao3_conclusion: {
                            score: data.criteria?.ao3_conclusion?.cwk2_score || 0,
                            www: data.criteria?.ao3_conclusion?.cwk2_www || [],
                            ebi: data.criteria?.ao3_conclusion?.cwk2_ebi || []
                         }
                       }
                    };

                    newMembersList[studentIndex] = { ...newMembersList[studentIndex], status: 'DONE', newFinalEvaluation: finalEval };
                } else {
                    newMembersList[studentIndex] = { ...newMembersList[studentIndex], status: 'ERROR', error: data.error };
                }
            } else {
                 newMembersList[studentIndex] = { ...newMembersList[studentIndex], status: 'ERROR', error: 'HTTP '+response.status };
            }
        } catch (err: any) {
            newMembersList[studentIndex] = { ...newMembersList[studentIndex], status: 'ERROR', error: err.message };
        }
        setMembers([...newMembersList]);
    }

    setIsGrading(false);
    setShowSummary(true);
  };

  const calculateDraftScore = (s: BulkMember) => {
    if (s.draftTeacherScores) {
      return Object.values(s.draftTeacherScores).reduce((a, b) => a + b, 0);
    }
    return s.draftEvaluation?.total_score || 0;
  };

  const handleCommitAll = () => {
     const successful = members.filter(m => m.status === 'DONE');
     const convertToSubmissions: StudentSubmission[] = successful.map(m => {
        const aiScores = m.newFinalEvaluation?.scores || {};
        return {
          candidateName: m.candidateName,
          className: m.className,
          assignmentName: m.assignmentName,
          status: 'Final',
          draftEvaluation: m.draftEvaluation,
          draftTeacherScores: m.draftTeacherScores,
          finalEvaluation: m.newFinalEvaluation,
          finalTeacherScores: {
             ao1_knowledge: aiScores.ao1_knowledge?.score || 0,
             ao2_observation: aiScores.ao2_observation?.score || 0,
             ao2_organisation: aiScores.ao2_organisation?.score || 0,
             ao2_analysis: aiScores.ao2_analysis?.score || 0,
             ao3_conclusion: aiScores.ao3_conclusion?.score || 0,
          }
        };
     });
     onCommit(convertToSubmissions);
  };

  if (!isOpen) return null;

  const readies = members.filter(m => m.status === 'READY' || m.status === 'DONE');
  const canGrade = members.filter(m => m.status === 'READY').length > 0 && !isGrading;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
       <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 isolate">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
             <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                    Bulk Match Final Submissions
                </h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{currentClass} — {currentAssignment}</p>
             </div>
             <button onClick={onClose} disabled={isGrading} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                 <X className="w-5 h-5" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
             {!showSummary ? (
                 <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/80 flex flex-col shadow-sm max-h-[60vh]">
                    <div className="overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-900/80 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Student Name</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Draft AI Score</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Draft Teacher Score</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Status</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 w-48 text-right">Attach Final CWK</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((m: any) => {
                                    const parsed = m.parsed || parseCandidateName(m.candidateName);
                                    const draftAiScore = m.draftEvaluation?.total_score || 0;
                                    const draftTeacherScore = m.draftTeacherScores ? (Object.values(m.draftTeacherScores) as number[]).reduce((a, b) => a + b, 0) : '-';

                                    return (
                                        <tr key={m.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{parsed.surname}</div>
                                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{parsed.forename} {parsed.preferredName && `(${parsed.preferredName})`}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">{draftAiScore}/60</td>
                                            <td className="px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">{draftTeacherScore as React.ReactNode}{draftTeacherScore !== '-' && '/60'}</td>
                                            <td className="px-4 py-3">
                                                {m.status === 'DRAFT' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Awaiting Final</span>}
                                                {m.status === 'READY' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/30"><CheckCircle2 className="w-3 h-3" /> Ready</span>}
                                                {m.status === 'GRADING' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-900/30"><Loader2 className="w-3 h-3 animate-spin" /> Grading</span>}
                                                {m.status === 'DONE' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Complete</span>}
                                                {m.status === 'ERROR' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> Error</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <label className={`cursor-pointer inline-block items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${m.file ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                                    <input disabled={isGrading} type="file" accept=".pdf" className="hidden" onChange={(e) => handlePdfUpload(e, m.id)} />
                                                    {m.file ? <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> <span className="truncate w-24 block text-left" title={m.file.name}>{m.file.name}</span></div> : <div className="flex items-center gap-1"><Upload className="w-3 h-3" /> Upload</div>}
                                                </label>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {members.length === 0 && (
                                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-medium">No students in Draft status found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
             ) : (
                 <div className="flex flex-col gap-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                        <h3 className="text-xl font-black text-emerald-800 dark:text-emerald-400">Batch Processing Complete</h3>
                        <p className="text-sm font-bold text-emerald-600/70 mt-1 uppercase tracking-widest">{members.filter(m => m.status === 'DONE').length} submissions evaluated successfully.</p>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/80 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-900/80">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Student Name</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Draft IGQA Score</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Final IGQA Score</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Progress Delta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.filter(m => m.status === 'DONE').map((m: any) => {
                                    const parsed = m.parsed || parseCandidateName(m.candidateName);
                                    const draftScore = m.draftEvaluation?.total_score || 0;
                                    const finalScore = m.newFinalEvaluation?.total_score || 0;
                                    const delta = finalScore - draftScore;
                                    return (
                                        <tr key={m.id} className="border-b border-slate-100 dark:border-slate-700/50">
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{parsed.surname}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-500 dark:text-slate-400">{draftScore}/60</td>
                                            <td className="px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">{finalScore}/60</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold leading-none ${delta > 0 ? 'bg-emerald-100 text-emerald-700' : delta < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {delta > 0 ? '+' : ''}{delta}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 </div>
             )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shadow-inner">
             <div className="flex-1">
                 {isGrading && (
                     <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-bold">
                         <Loader2 className="w-4 h-4 animate-spin" />
                         EVALUATING {gradingProgress.current} OF {gradingProgress.total}...
                     </div>
                 )}
             </div>
             <div className="flex items-center gap-4">
                 {!showSummary ? (
                     <button 
                         onClick={handleProcess} 
                         disabled={!canGrade || isGrading}
                         className="flex items-center gap-2 px-8 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors uppercase shadow-sm bg-[#7fc29b] hover:bg-[#6cba8d] text-slate-900 border border-[#7fc29b] disabled:bg-slate-200 disabled:dark:bg-slate-700 disabled:text-slate-400 disabled:dark:text-slate-500 disabled:border-transparent cursor-pointer disabled:cursor-not-allowed"
                     >
                         <PlayCircle className="w-5 h-5" /> Batch Process
                     </button>
                 ) : (
                     <button 
                         onClick={handleCommitAll}
                         className="flex items-center gap-2 px-8 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors uppercase shadow-sm bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 disabled:opacity-50"
                     >
                         <Folder className="w-4 h-4" /> Commit All to Directory
                     </button>
                 )}
             </div>
          </div>
       </div>
    </div>
  );
}
