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
          // Bulk save
          const { addOrUpdateSubmission } = await import('../db');
          for (const student of validResults) {
             const finalMarks = teacherMarksMap[student.id] || {};
             // Use extracted evaluation
             const evalPayload = student.evaluation;
             const rawName = `${student.surname}, ${student.forename}${student.preferredName ? ` (${student.preferredName})` : ''}`;

             await addOrUpdateSubmission({
                 candidateName: rawName,
                 className: data.classFolder,
                 assignmentName: data.assignmentName,
                 status: 'Draft',
                 draftEvaluation: evalPayload,
                 draftTeacherScores: finalMarks
             });
          }
          alert('Batch save successful!');
          onExit();
        }}
      />
    </>
  );
}