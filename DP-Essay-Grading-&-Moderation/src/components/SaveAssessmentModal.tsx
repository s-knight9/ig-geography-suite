import React, { useState } from 'react';
import { X, Plus, Save, Folder, FolderCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ClassFolder, AssignmentFolder, SubFolder, SavedEssay, PaperType, MarkValue } from '../types';
import { motion } from 'motion/react';

interface Props {
  onClose: () => void;
  onSave: (doc: Omit<SavedEssay, 'id' | 'date' | 'teacherId'>) => void;
  classes: ClassFolder[];
  assignments: AssignmentFolder[];
  subFolders: SubFolder[];
  onCreateClass: (name: string) => void;
  onCreateAssignment: (name: string, classId: string) => void;
  onCreateSubFolder: (name: string, assignmentId: string) => void;
  paper: PaperType;
  marks: MarkValue;
  question: string;
  essay: string;
  assessment: string;
  teacherScore?: number;
  teacherId?: string;
  entryMode?: "single" | "multiple";
  initClassId?: string;
  initAssignmentId?: string;
  initialStudentName?: string;
}

export default function SaveAssessmentModal({
  onClose,
  onSave,
  classes,
  assignments,
  subFolders,
  onCreateClass,
  onCreateAssignment,
  onCreateSubFolder,
  paper,
  marks,
  question,
  essay,
  assessment,
  teacherScore,
  entryMode = "single",
  initClassId = "",
  initAssignmentId = "",
  initialStudentName = "",
  teacherId
}: Props) {
  const [step, setStep] = useState(1);
  const [studentName, setStudentName] = useState(initialStudentName);
  const [selectedClassId, setSelectedClassId] = useState(initClassId);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(initAssignmentId);
  const [selectedSubFolderId, setSelectedSubFolderId] = useState('');
  
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);

  const [newClassName, setNewClassName] = useState('');
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  const [newSubFolderName, setNewSubFolderName] = useState('');
  const [isCreatingSubFolder, setIsCreatingSubFolder] = useState(false);

  const [lastCreatedClassName, setLastCreatedClassName] = useState<string | null>(null);
  const [lastCreatedAssignmentName, setLastCreatedAssignmentName] = useState<string | null>(null);

  const [pendingAssignmentName, setPendingAssignmentName] = useState<string | null>(null);

  React.useEffect(() => {
    if (lastCreatedClassName) {
      const newClass = classes.find(c => c.name === lastCreatedClassName);
      if (newClass) {
        setSelectedClassId(newClass.id);
        setLastCreatedClassName(null);
        
        // If we had a pending assignment to create for this new class
        if (pendingAssignmentName) {
          onCreateAssignment(pendingAssignmentName, newClass.id);
          setLastCreatedAssignmentName(pendingAssignmentName);
          setPendingAssignmentName(null);
        }
      }
    }
  }, [classes, lastCreatedClassName, pendingAssignmentName, onCreateAssignment]);

  React.useEffect(() => {
    if (lastCreatedAssignmentName) {
      const newAssignment = assignments.find(a => a.name === lastCreatedAssignmentName && a.classId === selectedClassId);
      if (newAssignment) {
        setSelectedAssignmentId(newAssignment.id);
        setLastCreatedAssignmentName(null);
      }
    }
  }, [assignments, lastCreatedAssignmentName, selectedClassId]);

  const filteredAssignments = assignments.filter(a => a.classId === selectedClassId);
  const filteredSubFolders = subFolders.filter(s => s.assignmentId === selectedAssignmentId);

  const isMultiple = entryMode === "multiple";

  const singleClassId = teacherId ? `single_${teacherId}` : "single_entries_class";
  const p1Id = teacherId ? `p1_${teacherId}` : "p1_entries";
  const p2Id = teacherId ? `p2_${teacherId}` : "p2_entries";
  const p3Id = teacherId ? `p3_${teacherId}` : "p3_entries";

  const p1Assignment = assignments.find(a => a.id === p1Id);
  const p2Assignment = assignments.find(a => a.id === p2Id);
  const p3Assignment = assignments.find(a => a.id === p3Id);

  React.useEffect(() => {
    if (selectedClassId && !isCreatingClass && filteredAssignments.length === 0 && !isCreatingAssignment && !selectedAssignmentId) {
      setIsCreatingAssignment(true);
    }
  }, [selectedClassId, filteredAssignments.length, isCreatingClass, isCreatingAssignment, selectedAssignmentId]);

  const handleSave = () => {
    if (!studentName || !selectedClassId || !selectedAssignmentId) return;
    
    onSave({
      classId: selectedClassId,
      assignmentId: selectedAssignmentId,
      subFolderId: selectedSubFolderId || undefined,
      studentName,
      paper,
      marks,
      question,
      essay,
      assessment,
      teacherScore
    });
  };

  const nextStep = () => {
    if (step === 1 && studentName) setStep(2);
    else if (step === 2 && selectedAssignmentId) setStep(3);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 text-slate-900 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col">
            <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <Save size={16} className="text-logo-green" />
              Archive Assessment
            </h3>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1 w-8 rounded-full ${step >= s ? 'bg-logo-green' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 min-h-[200px]">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Candidate Identity</label>
                <input 
                  type="text"
                  value={studentName}
                  autoFocus
                  onChange={e => setStudentName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && studentName && nextStep()}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 text-sm outline-none focus:ring-2 focus:ring-logo-green transition-all dark:text-white font-bold"
                  placeholder="Student Name..."
                />
                <p className="text-[10px] text-slate-400 mt-2 px-1 italic">Type name and press Enter to continue</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Choose Folder</label>
              
              {!isMultiple ? (
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: p1Id, name: p1Assignment?.name || "Paper 1 Essays" },
                    { id: p2Id, name: p2Assignment?.name || "Paper 2 Essays" },
                    { id: p3Id, name: p3Assignment?.name || "Paper 3 Essays" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedClassId(singleClassId);
                        setSelectedAssignmentId(opt.id);
                        nextStep();
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                        selectedAssignmentId === opt.id
                          ? 'border-logo-green bg-brand-50 dark:bg-brand-900/20 text-logo-green'
                          : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Folder size={20} className="opacity-50" />
                        <span className="text-xs font-black uppercase tracking-tight">{opt.name}</span>
                      </div>
                      <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                  
                  {isCreatingAssignment ? (
                     <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newAssignmentName}
                        autoFocus
                        onChange={e => setNewAssignmentName(e.target.value)}
                        className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-sm outline-none focus:ring-2 focus:ring-logo-green transition-all dark:text-white"
                        placeholder="New Folder Name..."
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newAssignmentName.trim()) {
                            onCreateAssignment(newAssignmentName.trim(), singleClassId);
                            setNewAssignmentName('');
                            setIsCreatingAssignment(false);
                          }
                        }}
                      />
                      <button onClick={() => setIsCreatingAssignment(false)} className="text-red-500 px-2"><X size={20}/></button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsCreatingAssignment(true)}
                      className="p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-logo-green hover:border-logo-green transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Add Folder
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Class Folder</label>
                    <div className="flex gap-2">
                    {isCreatingClass ? (
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text"
                          value={newClassName}
                          autoFocus
                          onChange={e => setNewClassName(e.target.value)}
                          className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-logo-green transition-all"
                          placeholder="New Class Name..."
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newClassName.trim()) {
                              onCreateClass(newClassName.trim());
                              setLastCreatedClassName(newClassName.trim());
                              setNewClassName('');
                              setIsCreatingClass(false);
                            } else if (e.key === 'Escape') {
                              setIsCreatingClass(false);
                            }
                          }}
                        />
                        <button onClick={() => {
                          if (newClassName.trim()) {
                            onCreateClass(newClassName.trim());
                            setLastCreatedClassName(newClassName.trim());
                            setNewClassName('');
                            setIsCreatingClass(false);
                          }
                        }} className="text-logo-green px-1"><CheckCircle2 size={18}/></button>
                        <button onClick={() => setIsCreatingClass(false)} className="text-red-500 px-1"><X size={18}/></button>
                      </div>
                    ) : (
                      <>
                        <select 
                          value={selectedClassId}
                          onChange={e => {
                            setSelectedClassId(e.target.value);
                            setSelectedAssignmentId('');
                          }}
                          className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-logo-green transition-all"
                        >
                          <option value="">Select a Class...</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button 
                          onClick={() => setIsCreatingClass(true)}
                          className="p-3 bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 rounded-xl hover:bg-brand-200 transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      </>
                    )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assignment Name</label>
                    <div className="flex gap-2">
                      {isCreatingAssignment ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text"
                            value={newAssignmentName}
                            autoFocus
                            onChange={e => setNewAssignmentName(e.target.value)}
                            className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-logo-green transition-all"
                            placeholder="New Assignment Name..."
                            onKeyDown={e => {
                              if (e.key === 'Enter' && newAssignmentName.trim()) {
                                if (selectedClassId) {
                                  onCreateAssignment(newAssignmentName.trim(), selectedClassId);
                                  setLastCreatedAssignmentName(newAssignmentName.trim());
                                  setNewAssignmentName('');
                                  setIsCreatingAssignment(false);
                                } else if (isCreatingClass && newClassName.trim()) {
                                  // Save class first, then assignment through useEffect
                                  onCreateClass(newClassName.trim());
                                  setLastCreatedClassName(newClassName.trim());
                                  setPendingAssignmentName(newAssignmentName.trim());
                                  setNewClassName('');
                                  setNewAssignmentName('');
                                  setIsCreatingClass(false);
                                  setIsCreatingAssignment(false);
                                }
                              } else if (e.key === 'Escape') {
                                setIsCreatingAssignment(false);
                              }
                            }}
                          />
                          <button onClick={() => {
                            if (newAssignmentName.trim()) {
                              if (selectedClassId) {
                                onCreateAssignment(newAssignmentName.trim(), selectedClassId);
                                setLastCreatedAssignmentName(newAssignmentName.trim());
                                setNewAssignmentName('');
                                setIsCreatingAssignment(false);
                              } else if (isCreatingClass && newClassName.trim()) {
                                onCreateClass(newClassName.trim());
                                setLastCreatedClassName(newClassName.trim());
                                setPendingAssignmentName(newAssignmentName.trim());
                                setNewClassName('');
                                setNewAssignmentName('');
                                setIsCreatingClass(false);
                                setIsCreatingAssignment(false);
                              }
                            }
                          }} className="text-logo-green px-1"><CheckCircle2 size={18}/></button>
                          <button onClick={() => setIsCreatingAssignment(false)} className="text-red-500 px-1"><X size={18}/></button>
                        </div>
                      ) : (
                        <>
                          <select 
                            value={selectedAssignmentId}
                            onChange={e => setSelectedAssignmentId(e.target.value)}
                            className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-logo-green transition-all disabled:opacity-50"
                          >
                            <option value="">Select Assignment...</option>
                            {filteredAssignments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                          <button 
                            onClick={() => {
                              if (!selectedClassId && isCreatingClass && newClassName.trim()) {
                                // Save class first to allow assignment creation
                                onCreateClass(newClassName.trim());
                                setLastCreatedClassName(newClassName.trim());
                                setIsCreatingAssignment(true);
                              } else {
                                setIsCreatingAssignment(true);
                              }
                            }}
                            className="p-3 bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 rounded-xl hover:bg-brand-200 transition-colors disabled:opacity-50"
                          >
                            <Plus size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Specific Topic (Subfolder)</label>
              
              <div className="grid grid-cols-1 gap-2">
                {filteredSubFolders.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubFolderId(sub.id);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                      selectedSubFolderId === sub.id
                        ? 'border-logo-green bg-brand-50 dark:bg-brand-900/20 text-logo-green'
                        : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FolderCheck size={18} className="opacity-50" />
                      <span className="text-xs font-black uppercase tracking-tight">{sub.name}</span>
                    </div>
                  </button>
                ))}
                
                <button
                  onClick={() => setSelectedSubFolderId('')}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                    selectedSubFolderId === ''
                      ? 'border-logo-green bg-brand-50 dark:bg-brand-900/20 text-logo-green'
                      : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 italic'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder size={18} className="opacity-30" />
                    <span className="text-xs font-bold uppercase tracking-tight">None / General</span>
                  </div>
                </button>

                {isCreatingSubFolder ? (
                   <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newSubFolderName}
                      autoFocus
                      onChange={e => setNewSubFolderName(e.target.value)}
                      className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-sm outline-none focus:ring-2 focus:ring-logo-green transition-all dark:text-white"
                      placeholder="e.g. Climate Mitigation..."
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newSubFolderName.trim()) {
                          onCreateSubFolder(newSubFolderName.trim(), selectedAssignmentId);
                          setNewSubFolderName('');
                          setIsCreatingSubFolder(false);
                        }
                      }}
                    />
                    <button onClick={() => setIsCreatingSubFolder(false)} className="text-red-500 px-2"><X size={20}/></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsCreatingSubFolder(true)}
                    className="p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-logo-green hover:border-logo-green transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
                  >
                    <Plus size={16} /> Create Topic Subfolder
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3 bg-slate-50 dark:bg-slate-950">
          <button 
            onClick={step === 1 ? onClose : prevStep}
            className="px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <div className="flex gap-2">
            {step < 3 ? (
              <button 
                onClick={nextStep}
                disabled={(step === 1 && !studentName) || (step === 2 && !selectedAssignmentId)}
                className="px-8 py-2.5 rounded-xl bg-logo-green text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-brand-600 transition-all disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="px-8 py-2.5 rounded-xl bg-logo-green text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-brand-600 transition-all"
              >
                Commit Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
