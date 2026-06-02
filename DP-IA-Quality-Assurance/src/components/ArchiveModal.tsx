import React, { useState } from "react";
import { FolderOpen, X, Plus, Check } from "lucide-react";
import { motion } from "motion/react";
import type { ClassFolder } from "../types";

interface ArchiveModalProps {
  onClose: () => void;
  onSave: () => void;
  classes: ClassFolder[];
  saveOptions: {
    entryName: string;
    classId: string;
    assignmentId: string;
    submissionType?: 'Draft' | 'Final';
  };
  setSaveOptions: React.Dispatch<React.SetStateAction<any>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  resultName: string;
  isBatch?: boolean;
}

export function ArchiveModal({ onClose, onSave, classes, saveOptions, setSaveOptions, step, setStep, resultName, isBatch }: ArchiveModalProps) {
  const [newClassName, setNewClassName] = useState("");
  const [creatingClass, setCreatingClass] = useState(false);
  
  const [newAssignName, setNewAssignName] = useState("");
  const [creatingAssign, setCreatingAssign] = useState(false);

  const activeClass = classes.find(c => c.id === saveOptions.classId);

  const handleNext = () => {
    if (step === 2) {
      let classId = saveOptions.classId;
      let assignmentId = saveOptions.assignmentId;
      
      if (creatingClass && newClassName.trim()) {
        classId = newClassName.trim();
        assignmentId = "";
        setCreatingClass(false);
      }
      
      if (creatingAssign && newAssignName.trim()) {
        assignmentId = newAssignName.trim();
        setCreatingAssign(false);
      }
      
      setSaveOptions(prev => ({ ...prev, classId, assignmentId }));
      
      if (!assignmentId) {
        return; // Don't advance if no assignment yet
      }
    }
    
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 transition-colors"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors"
      >
        <div className="border-b border-slate-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between text-slate-900 dark:text-white">
          <h3 className="font-bold flex items-center gap-2">
            <FolderOpen size={18} className="text-emerald-500" />
            Archive Assessment
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="flex gap-2 px-6 pt-4">
           {[1, 2, 3].map(i => (
             <div key={i} className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
           ))}
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              {!isBatch && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Candidate Identity</label>
                  <input
                    type="text"
                    value={saveOptions.entryName}
                    onChange={(e) => setSaveOptions({...saveOptions, entryName: e.target.value})}
                    placeholder="e.g. John Doe 2026"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-500 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-2 mb-4">Type name to continue</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Submission Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="submissionType" 
                      value="Draft"
                      checked={saveOptions.submissionType === 'Draft'}
                      onChange={() => setSaveOptions({...saveOptions, submissionType: 'Draft'})}
                      className="text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={`text-sm font-semibold ${saveOptions.submissionType === 'Draft' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Draft</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="submissionType" 
                      value="Final"
                      checked={saveOptions.submissionType === 'Final'}
                      onChange={() => setSaveOptions({...saveOptions, submissionType: 'Final'})}
                      className="text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={`text-sm font-semibold ${saveOptions.submissionType === 'Final' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Final</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Class Folder</label>
                <div className="flex gap-2">
                  {!creatingClass ? (
                    <>
                      <select
                        value={saveOptions.classId}
                        onChange={(e) => setSaveOptions({...saveOptions, classId: e.target.value, assignmentId: ""})}
                        className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 transition-colors text-sm"
                      >
                        <option value="">Select a Class...</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        {saveOptions.classId && !classes.find(c => c.id === saveOptions.classId) && (
                          <option value={saveOptions.classId}>{saveOptions.classId}</option>
                        )}
                      </select>
                      <button onClick={() => setCreatingClass(true)} className="w-10 h-10 shrink-0 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-200 transition-colors">
                        <Plus size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                       <input 
                         autoFocus
                         type="text"
                         value={newClassName}
                         onChange={e => setNewClassName(e.target.value)}
                         onKeyDown={e => {
                           if (e.key === 'Enter' && newClassName.trim()) {
                             setSaveOptions({...saveOptions, classId: newClassName.trim(), assignmentId: ""});
                             setCreatingClass(false);
                           }
                         }}
                         placeholder="New class name..."
                         className="flex-grow bg-slate-50 dark:bg-slate-900 border border-emerald-500 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 outline-none text-sm"
                       />
                       <button 
                         onClick={() => {
                           if (newClassName.trim()) {
                             setSaveOptions({...saveOptions, classId: newClassName.trim(), assignmentId: ""});
                             setCreatingClass(false);
                           }
                         }} 
                         className="w-10 h-10 shrink-0 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-200 transition-colors">
                        <Check size={18} />
                       </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assignment Name</label>
                <div className="flex gap-2">
                  {!creatingAssign ? (
                    <>
                      <select
                        value={saveOptions.assignmentId}
                        onChange={(e) => setSaveOptions({...saveOptions, assignmentId: e.target.value})}
                        disabled={!saveOptions.classId && !creatingClass && !newClassName}
                        className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 transition-colors text-sm disabled:opacity-50"
                      >
                        <option value="">Select Assignment...</option>
                        {activeClass?.assignments.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                        {saveOptions.assignmentId && (!activeClass || !activeClass.assignments.find(a => a.id === saveOptions.assignmentId)) && (
                          <option value={saveOptions.assignmentId}>{saveOptions.assignmentId}</option>
                        )}
                      </select>
                      <button 
                        onClick={() => setCreatingAssign(true)} 
                        disabled={!saveOptions.classId}
                        className="w-10 h-10 shrink-0 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-200 transition-colors disabled:opacity-50"
                      >
                        <Plus size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                       <input 
                         autoFocus
                         type="text"
                         value={newAssignName}
                         onChange={e => setNewAssignName(e.target.value)}
                         onKeyDown={e => {
                           if (e.key === 'Enter' && newAssignName.trim()) {
                             setSaveOptions({...saveOptions, assignmentId: newAssignName.trim()});
                             setCreatingAssign(false);
                           }
                         }}
                         placeholder="New assignment name..."
                         className="flex-grow bg-slate-50 dark:bg-slate-900 border border-emerald-500 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 outline-none text-sm"
                       />
                       <button 
                         onClick={() => {
                           if (newAssignName.trim()) {
                             setSaveOptions({...saveOptions, assignmentId: newAssignName.trim()});
                             setCreatingAssign(false);
                           }
                         }} 
                         className="w-10 h-10 shrink-0 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-200 transition-colors">
                        <Check size={18} />
                       </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-bold">Summary</p>
                <div className="space-y-2 mt-4">
                  {!isBatch && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Candidate:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{saveOptions.entryName}</span>
                    </div>
                  )}
                  {isBatch && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Batch Archive:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Full Class Roster</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Submission Type:</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 text-[10px]">{saveOptions.submissionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Class:</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{classes.find(c => c.id === saveOptions.classId)?.name || saveOptions.classId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Assignment:</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {activeClass?.assignments.find(a => a.id === saveOptions.assignmentId)?.name || saveOptions.assignmentId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-4 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            {step === 1 ? "CANCEL" : "BACK"}
          </button>
          <button
            onClick={step < 3 ? handleNext : onSave}
            disabled={(step === 1 && !isBatch && !saveOptions.entryName) || (step === 2 && !saveOptions.classId && !newClassName) || (step === 2 && !saveOptions.assignmentId && !newAssignName)}
            className="px-6 py-2 rounded-lg bg-emerald-500 text-white text-sm font-bold tracking-wide hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step < 3 ? "CONTINUE" : "COMMIT SAVE"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
