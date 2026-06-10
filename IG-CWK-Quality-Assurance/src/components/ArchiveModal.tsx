import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { loadStructure, createClass, createAssignment } from '../db';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCandidateName: string;
  onSave: (data: any) => void;
  hideCandidateName?: boolean;
}

export default function ArchiveModal({ isOpen, onClose, initialCandidateName, onSave, hideCandidateName }: ArchiveModalProps) {
  const [step, setStep] = useState(1);
  const cleanInitialName = initialCandidateName.replace(/\s*-\s*(DRAFT|FINAL|Draft|Final)$/i, '');
  const [candidateName, setCandidateName] = useState(cleanInitialName);
  const [submissionType, setSubmissionType] = useState<'Draft' | 'Final'>('Draft');
  
  const [classes, setClasses] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');

  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [newAssignmentName, setNewAssignmentName] = useState('');

  useEffect(() => {
    const init = async () => {
      if (isOpen) {
        setStep(1);
        setCandidateName(initialCandidateName);
        setSubmissionType('Draft');
        setSelectedClass('');
        setSelectedAssignment('');
        setIsAddingClass(false);
        setIsAddingAssignment(false);

        const struct = await loadStructure();
        setClasses(struct.classes);
        setAssignments(struct.assignments);
      }
    };
    init();
  }, [isOpen, initialCandidateName]);

  if (!isOpen) return null;

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleAddClass = async () => {
    if (newClassName.trim() && !classes.includes(newClassName.trim())) {
      const clsName = newClassName.trim();
      await createClass(clsName);
      setClasses([...classes, clsName]);
      setSelectedClass(clsName);
      setAssignments({ ...assignments, [clsName]: [] });
    }
    setIsAddingClass(false);
    setNewClassName('');
  };

  const handleAddAssignment = async () => {
    if (newAssignmentName.trim() && selectedClass) {
      const currentAssignments = assignments[selectedClass] || [];
      const asgName = newAssignmentName.trim();
      if (!currentAssignments.includes(asgName)) {
        await createAssignment(selectedClass, asgName);
        setAssignments({
          ...assignments,
          [selectedClass]: [...currentAssignments, asgName]
        });
        setSelectedAssignment(asgName);
      }
    }
    setIsAddingAssignment(false);
    setNewAssignmentName('');
  };


  const handleCommit = () => {
    onSave({
      candidateName,
      submissionType,
      classFolder: selectedClass,
      assignmentName: selectedAssignment
    });
    onClose();
  };

  const isStep2Valid = selectedClass && (assignments[selectedClass]?.length === 0 ? true : selectedAssignment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Archive Assessment
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 flex gap-2">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-100'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-100'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-100'}`} />
        </div>

        {/* Content Body */}
        <div className="px-6 py-4 min-h-[220px]">
          {step === 1 && (
            <div className="space-y-6">
              {!hideCandidateName && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">Candidate Identity</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bda5]/20 text-slate-800 font-medium"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Type name to continue"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase mb-3">Submission Type</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="submissionType"
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-[#00bda5] accent-blue-600"
                      checked={submissionType === 'Draft'}
                      onChange={() => setSubmissionType('Draft')}
                    />
                    <span className="text-slate-700 font-medium text-sm">Draft</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="submissionType"
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-[#00bda5] accent-blue-600"
                      checked={submissionType === 'Final'}
                      onChange={() => setSubmissionType('Final')}
                    />
                    <span className="text-slate-700 font-medium text-sm">Final</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">Class Folder</label>
                {!isAddingClass ? (
                  <div className="flex gap-2">
                    <select
                      className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bda5]/20 text-slate-800 font-medium appearance-none bg-white ${selectedClass ? 'border-blue-600' : 'border-blue-600'}`}
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedAssignment('');
                      }}
                    >
                      <option value="" disabled>Select a Class...</option>
                      {classes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setIsAddingClass(true)}
                      className="w-12 flex-shrink-0 bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input
                      autoFocus
                      type="text"
                      placeholder="New Class Name..."
                      className="flex-1 px-4 py-3 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bda5]/20 text-slate-800 font-medium"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                    />
                    <div className="flex flex-col gap-1">
                      <button onClick={handleAddClass} className="text-xs font-bold text-blue-600 uppercase hover:underline">Add</button>
                      <button onClick={() => setIsAddingClass(false)} className="text-xs font-bold text-slate-400 border-none bg-transparent hover:underline text-left">Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              {selectedClass && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">Assignment Name</label>
                  {!isAddingAssignment ? (
                    <div className="flex gap-2">
                      <select
                        className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bda5]/20 text-slate-800 font-medium appearance-none bg-white ${selectedAssignment ? 'border-slate-200' : 'border-slate-200'}`}
                        value={selectedAssignment}
                        onChange={(e) => setSelectedAssignment(e.target.value)}
                      >
                        <option value="" disabled>Select Assignment...</option>
                        {(assignments[selectedClass] || []).map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIsAddingAssignment(true)}
                        className="w-12 flex-shrink-0 bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <input
                        autoFocus
                        type="text"
                        placeholder="New Assignment..."
                        className="flex-1 px-4 py-3 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bda5]/20 text-slate-800 font-medium"
                        value={newAssignmentName}
                        onChange={(e) => setNewAssignmentName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAssignment()}
                      />
                       <div className="flex flex-col gap-1">
                        <button onClick={handleAddAssignment} className="text-xs font-bold text-blue-600 uppercase hover:underline">Add</button>
                        <button onClick={() => setIsAddingAssignment(false)} className="text-xs font-bold text-slate-400 border-none bg-transparent hover:underline text-left">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 pt-2">
               <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Summary</p>
                  </div>
                  <div className="p-5 space-y-4">
                     {!hideCandidateName && (
                       <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Candidate:</span>
                          <span className="text-sm font-bold text-slate-900">{candidateName}</span>
                       </div>
                     )}
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Submission Type:</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/10 text-blue-600 px-2.5 py-1 rounded-full">{submissionType}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Class:</span>
                        <span className="text-sm font-bold text-slate-900">{selectedClass}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Assignment:</span>
                        <span className="text-sm font-bold text-blue-600">{selectedAssignment || 'N/A'}</span>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-6 flex items-center justify-between mt-2">
          {step === 1 ? (
             <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider">
               Cancel
             </button>
          ) : (
             <button onClick={handleBack} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider">
               Back
             </button>
          )}

          {step < 3 ? (
             <button 
                onClick={handleNext} 
                disabled={step === 1 ? (!hideCandidateName && !candidateName.trim()) : !isStep2Valid}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Continue
             </button>
          ) : (
             <button 
                onClick={handleCommit} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider shadow-sm transition-colors"
             >
               Commit Save
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
