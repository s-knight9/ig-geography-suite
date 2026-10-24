import React, { useState } from 'react';
import { ClassMember } from './ClassBatchTab';
import ModerationResults from './ModerationResults';
import { ChevronLeft, ChevronRight, Folder } from 'lucide-react';
import ArchiveModal from './ArchiveModal';

interface ClassBatchResultsProps {
  results: ClassMember[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onExit: () => void;
  onOpenDirectory: () => void;
}

export default function ClassBatchResults({ results, isDarkMode, toggleDarkMode, onExit, onOpenDirectory }: ClassBatchResultsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // We need to store each student's teacher marks when they cycle through them, 
  // or we can just capture them right before "Archive Class Reports".
  // Actually, since ModerationResults has its own local state for teacherMarks,
  // we would lose them when cycling to next student.
  // Wait, the prompt says: "Cycle through the generated reports. Add an 'Archive Class Reports' button at the end."
  // To keep it simple, we can lift teacherMarks up, or just allow them to archive based on the AI scores by default, 
  // or use state to save teacher marks for all students.
  // Let's create a state map: id -> Record<string, number>
  const [teacherMarksMap, setTeacherMarksMap] = useState<Record<string, Record<string, number>>>({});

  const validResults = results.filter(r => r.status === 'DONE' && r.evaluation != null);
  
  if (validResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <h2 className="text-2xl font-bold dark:text-slate-100">No successful evaluations to show.</h2>
        <button onClick={onExit} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg">Return</button>
      </div>
    );
  }

  const currentStudent = validResults[currentIndex];
  // Reconstruct full name
  const candidateName = `${currentStudent.surname}, ${currentStudent.forename}${currentStudent.preferredName ? ` (${currentStudent.preferredName})` : ''} - Draft`;

  const goNext = (marks: Record<string, number>) => {
    setTeacherMarksMap(prev => ({ ...prev, [currentStudent.id]: marks }));
    if (currentIndex < validResults.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goPrev = (marks: Record<string, number>) => {
    setTeacherMarksMap(prev => ({ ...prev, [currentStudent.id]: marks }));
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleArchiveClick = (marks: Record<string, number>) => {
    setTeacherMarksMap(prev => ({ ...prev, [currentStudent.id]: marks }));
    setIsModalOpen(true);
  };

  const renderBatchActions = (teacherMarks: Record<string, number>) => (
    <div className="flex items-center gap-4 w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 isolate relative">
      <div className="absolute top-[-10px] left-4 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Batch Workflow</div>
      <button 
        onClick={() => goPrev(teacherMarks)} 
        disabled={currentIndex === 0}
        className="flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 uppercase tracking-widest text-xs px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" /> Previous
      </button>

      <div className="flex-1 text-center text-xs font-bold text-slate-400 tracking-widest">
        STUDENT {currentIndex + 1} OF {validResults.length}
      </div>

      <button 
        onClick={() => goNext(teacherMarks)} 
        disabled={currentIndex === validResults.length - 1}
        className="flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 uppercase tracking-widest text-xs px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next <ChevronRight className="w-5 h-5" />
      </button>
      
      <div className="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-2" />

      <button 
        onClick={() => handleArchiveClick(teacherMarks)}
        className="flex items-center gap-2 bg-[#7fc29b] text-slate-900 px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#6cba8d] transition-colors border border-[#7fc29b] shadow-sm ml-auto"
      >
        <Folder className="w-4 h-4" /> Archive Class Reports
      </button>
    </div>
  );

  return (
    <>
      <ModerationResults
        key={currentStudent.id}
        evaluation={currentStudent.evaluation}
        candidateName={candidateName}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onExit={onExit}
        onOpenDirectory={onOpenDirectory}
        isBatchMode={true}
        renderBatchActions={renderBatchActions}
      />
      
      {/* Archive Modal */}
      <ArchiveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialCandidateName={""}
        hideCandidateName={true}
        onSave={async (data) => {
          const { uploadSubmissionPdf, addOrUpdateSubmission, findExistingSubmission } = await import('../db');
          const stage: 'Draft' | 'Final' = data.submissionType || 'Draft';
          const targetClass = data.className || data.classFolder || 'General';
          const targetAssignment = data.assignmentName || 'Coursework';

          for (const student of validResults) {
            const finalMarks = teacherMarksMap[student.id] || {};
            const evalPayload = student.evaluation;
            const rawName = `${student.surname}, ${student.forename}${student.preferredName ? ` (${student.preferredName})` : ''}`;

            // 1. Look up existing record
            const existing = await findExistingSubmission(rawName, targetClass, targetAssignment);

            // 2. Build base submission
            let submission: any = {
              ...(existing || {}),
              candidateName: rawName,
              className: targetClass,
              assignmentName: targetAssignment,
              status: stage,
              updatedAt: new Date().toISOString()
            };

            // 3. Explicitly await uploadSubmissionPdf
            if (student.file) {
              try {
                const { pdfUrl, storagePath } = await uploadSubmissionPdf(student.file, submission, stage);
                if (stage === 'Final') {
                  submission.finalPdfUrl = pdfUrl;
                  submission.finalStoragePath = storagePath;
                } else {
                  submission.draftPdfUrl = pdfUrl;
                  submission.draftStoragePath = storagePath;
                }
              } catch (uploadErr: any) {
                console.error(`Storage upload error for ${rawName}:`, uploadErr);
                alert(`PDF upload failed for ${rawName}: ${uploadErr.message}`);
              }
            }

            // 4. Merge evaluations & marks
            const defaultScores = {
              ao1_knowledge: evalPayload?.scores?.ao1_knowledge?.score || 0,
              ao2_observation: evalPayload?.scores?.ao2_observation?.score || 0,
              ao2_organisation: evalPayload?.scores?.ao2_organisation?.score || 0,
              ao2_analysis: evalPayload?.scores?.ao2_analysis?.score || 0,
              ao3_conclusion: evalPayload?.scores?.ao3_conclusion?.score || 0,
            };

            if (stage === 'Final') {
              submission.finalEvaluation = evalPayload;
              submission.finalTeacherScores = finalMarks && Object.keys(finalMarks).length > 0 ? finalMarks : (existing?.finalTeacherScores || defaultScores);
            } else {
              submission.draftEvaluation = evalPayload;
              submission.draftTeacherScores = finalMarks && Object.keys(finalMarks).length > 0 ? finalMarks : (existing?.draftTeacherScores || defaultScores);
            }

            // 5. Save to database
            await addOrUpdateSubmission(submission);
          }

          alert(`Batch save successful! ${validResults.length} coursework reports and PDFs saved to Firebase.`);
          onExit();
        }}
      />
    </>
  );
}