import React, { useState } from 'react';
import { ClassFolder, AssignmentFolder, SubFolder, SavedEssay } from '../types';
import { Folder, FolderOpen, FileText, ChevronRight, ArrowLeft, Pencil, Check, X, Trash2, Plus, FolderCheck, FileDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SlideToConfirm from './SlideToConfirm';
import { 
  downloadEssayAsPDF, 
  downloadEssayAsDocx, 
  downloadReportAsPDF, 
  downloadReportAsDocx 
} from "../utils/exportUtils";

interface Props {
  classes: ClassFolder[];
  assignments: AssignmentFolder[];
  subFolders: SubFolder[];
  essays: SavedEssay[];
  onBack: () => void;
  onRenameClass: (id: string, newName: string) => void;
  onRenameAssignment: (id: string, newName: string) => void;
  onRenameSubFolder: (id: string, newName: string) => void;
  onRenameEssay: (id: string, newName: string) => void;
  onDeleteClass: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  onDeleteSubFolder: (id: string) => void;
  onDeleteEssay: (id: string) => void;
  onMoveEssay: (essayId: string, classId: string, assignmentId: string, subFolderId?: string) => void;
  onUpdateTeacherScore: (id: string, score: number) => void;
  onCreateClass: (name: string) => void;
  onCreateAssignment: (name: string, classId: string) => void;
  onCreateSubFolder: (name: string, assignmentId: string) => void;
  activeTeacher?: string;
}

export default function ArchiveView({ 
  classes, 
  assignments, 
  subFolders,
  essays, 
  onBack, 
  onRenameClass, 
  onRenameAssignment, 
  onRenameSubFolder,
  onRenameEssay, 
  onDeleteClass, 
  onDeleteAssignment, 
  onDeleteSubFolder,
  onDeleteEssay,
  onMoveEssay,
  onUpdateTeacherScore,
  onCreateClass,
  onCreateAssignment,
  onCreateSubFolder,
  activeTeacher 
}: Props) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedSubFolderId, setSelectedSubFolderId] = useState<string | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<SavedEssay | null>(null);

  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState('');

  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editAssignmentName, setEditAssignmentName] = useState('');

  const [editingSubFolderId, setEditingSubFolderId] = useState<string | null>(null);
  const [editSubFolderName, setEditSubFolderName] = useState('');

  const [editingEssayId, setEditingEssayId] = useState<string | null>(null);
  const [editEssayName, setEditEssayName] = useState('');

  const [movingEssayId, setMovingEssayId] = useState<string | null>(null);

  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const [isCreatingAssignmentForClassId, setIsCreatingAssignmentForClassId] = useState<string | null>(null);
  const [newAssignmentName, setNewAssignmentName] = useState('');

  const [isCreatingSubFolderForAssignmentId, setIsCreatingSubFolderForAssignmentId] = useState<string | null>(null);
  const [newSubFolderName, setNewSubFolderName] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingType, setDeletingType] = useState<"class" | "assignment" | "subfolder" | "essay" | null>(null);

  const extractScoreRaw = (assessment: string): number => {
    // Match something like "**Final mark: 9 / 10**" or "Final mark: 9/10"
    const match = assessment.match(/Final mark[^\d]*(\d+(?:\.\d+)?)/i);
    if (match) return parseFloat(match[1]);
    return -1;
  };

  const getAssignmentsForClass = (classId: string) => assignments.filter(a => a.classId === classId);
  const getSubFoldersForAssignment = (assignmentId: string) => subFolders.filter(s => s.assignmentId === assignmentId);
  
  const getEssaysForList = (assignmentId: string, subFolderId: string | null) => {
    let matchingEssays = [];
    if (assignmentId === 'legacy_single') {
      matchingEssays = essays.filter(e => 
        (!e.classId && !e.assignmentId) || 
        (e.classId === 'single_entries_class' && e.assignmentId === 'single_entries_assignment') ||
        (e.classId === singleClassId && !assignments.some(a => e.assignmentId === a.id))
      );
    } else {
      matchingEssays = essays.filter(e => e.assignmentId === assignmentId && (subFolderId ? e.subFolderId === subFolderId : !e.subFolderId));
    }
    
    // Sort highest grade to lowest grade
    return matchingEssays.sort((a, b) => {
      return extractScoreRaw(b.assessment) - extractScoreRaw(a.assessment);
    });
  };

  const primaryClasses = classes.filter(c => !c.id.startsWith('single_'));
  const singleClassId = activeTeacher ? `single_${activeTeacher}` : 'single_entries_class';
  const p1Id = activeTeacher ? `p1_${activeTeacher}` : 'p1_entries';
  const p2Id = activeTeacher ? `p2_${activeTeacher}` : 'p2_entries';
  const p3Id = activeTeacher ? `p3_${activeTeacher}` : 'p3_entries';

  const singleAssignments = assignments.filter(a => a.classId === singleClassId);

  const renderSubFolders = (assignmentId: string) => {
    return (
      <div className="ml-4 pl-2 border-l border-slate-200 dark:border-slate-700 mt-1 space-y-1">
        {getSubFoldersForAssignment(assignmentId).map(sub => (
          <div key={sub.id}>
            {editingSubFolderId === sub.id ? (
              <div className="flex items-center gap-2 w-full px-2 py-1 pl-2">
                <input 
                  autoFocus
                  value={editSubFolderName}
                  onChange={e => setEditSubFolderName(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-logo-green w-full min-w-0"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && editSubFolderName.trim()) {
                      onRenameSubFolder(sub.id, editSubFolderName.trim());
                      setEditingSubFolderId(null);
                    } else if (e.key === 'Escape') {
                      setEditingSubFolderId(null);
                    }
                  }}
                />
                <button onClick={() => {
                  if (editSubFolderName.trim()) {
                    onRenameSubFolder(sub.id, editSubFolderName.trim());
                    setEditingSubFolderId(null);
                  }
                }} className="text-logo-green"><Check size={10}/></button>
                <button onClick={() => setEditingSubFolderId(null)} className="text-red-500"><X size={10}/></button>
              </div>
            ) : (
              <div className={`group flex items-center justify-between w-full px-2 py-1 rounded transition-colors ${
                selectedSubFolderId === sub.id 
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
                <button
                  onClick={() => {
                    setSelectedSubFolderId(sub.id);
                    setSelectedEssay(null);
                  }}
                  className="flex items-center gap-2 flex-1 text-left text-[10px] font-bold truncate"
                >
                  <FolderCheck size={12} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{sub.name}</span>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditSubFolderName(sub.name); setEditingSubFolderId(sub.id); }} className="p-0.5 text-slate-300 hover:text-slate-500 dark:hover:text-slate-200"><Pencil size={10}/></button>
                  <button onClick={() => { setDeletingType('subfolder'); setDeletingId(sub.id); }} className="p-0.5 text-slate-300 hover:text-red-500"><Trash2 size={10}/></button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <button
          onClick={() => {
            setSelectedSubFolderId(null);
            setSelectedEssay(null);
          }}
          className={`flex items-center gap-2 w-full px-2 py-1 rounded text-[10px] font-bold truncate transition-colors ${
            selectedSubFolderId === null 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200' 
              : 'text-slate-400 hover:text-slate-500 italic dark:hover:text-slate-300'
          }`}
        >
          <Folder size={12} className="opacity-40 flex-shrink-0" />
          <span className="truncate">General / Other</span>
        </button>

        {isCreatingSubFolderForAssignmentId === assignmentId ? (
          <div className="px-2 py-1">
            <input 
              autoFocus
              placeholder="New Topic..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-logo-green text-slate-800 dark:text-white"
              onKeyDown={e => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  onCreateSubFolder(e.currentTarget.value.trim(), assignmentId);
                  setIsCreatingSubFolderForAssignmentId(null);
                } else if (e.key === 'Escape') {
                  setIsCreatingSubFolderForAssignmentId(null);
                }
              }}
            />
          </div>
        ) : (
          <button 
            onClick={() => setIsCreatingSubFolderForAssignmentId(assignmentId)}
            className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-logo-green px-2 py-1 flex items-center gap-1 transition-colors"
          >
            <Plus size={10}/> Add Subfolder
          </button>
        )}
      </div>
    );
  };

  // Find question context for the selected view
  const currentEssaysForList = selectedAssignmentId ? getEssaysForList(selectedAssignmentId, selectedSubFolderId) : [];
  const listQuestionContext = currentEssaysForList.length > 0 ? currentEssaysForList[0].question : null;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
        >
          <ArrowLeft size={14} /> Back to Examiner
        </button>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <h2 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter flex items-center gap-2">
          <Folder size={18} className="text-logo-green" /> 
          Teacher Master Directory
        </h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FolderOpen size={14} className="text-slate-300 dark:text-slate-600"/>
                Classes
              </h3>
              <button 
                onClick={() => setIsCreatingClass(true)}
                className="text-logo-green hover:text-brand-600 p-1 bg-slate-50 dark:bg-slate-800 rounded"
                title="New Class Folder"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-1 mb-4">
              {isCreatingClass && (
                <div className="flex items-center gap-2 w-full px-2 py-2">
                  <input 
                    autoFocus
                    value={newClassName}
                    placeholder="New Class..."
                    onChange={e => setNewClassName(e.target.value)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 text-sm text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-logo-green min-w-0"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newClassName.trim()) {
                        onCreateClass(newClassName.trim());
                        setNewClassName('');
                        setIsCreatingClass(false);
                      } else if (e.key === 'Escape') {
                        setIsCreatingClass(false);
                        setNewClassName('');
                      }
                    }}
                  />
                  <button onClick={() => {
                    if (newClassName.trim()) {
                      onCreateClass(newClassName.trim());
                      setNewClassName('');
                      setIsCreatingClass(false);
                    }
                  }} className="text-logo-green hover:text-brand-600 flex-shrink-0"><Check size={14}/></button>
                  <button onClick={() => { setIsCreatingClass(false); setNewClassName(''); }} className="text-red-500 hover:text-red-700 flex-shrink-0"><X size={14}/></button>
                </div>
              )}

              {primaryClasses.length === 0 && !isCreatingClass && (
                <p className="text-xs text-slate-500 italic">No classes created</p>
              )}
              {primaryClasses.map(c => (
                <div key={c.id}>
                  {editingClassId === c.id ? (
                    <div className="flex items-center gap-2 w-full px-2 py-2">
                       <input 
                         autoFocus
                         value={editClassName}
                         onChange={e => setEditClassName(e.target.value)}
                         className="flex-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 text-sm text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-logo-green min-w-0"
                         onKeyDown={e => {
                           if (e.key === 'Enter' && editClassName.trim()) {
                             onRenameClass(c.id, editClassName.trim());
                             setEditingClassId(null);
                           } else if (e.key === 'Escape') {
                             setEditingClassId(null);
                           }
                         }}
                       />
                       <button onClick={() => {
                         if (editClassName.trim()) {
                           onRenameClass(c.id, editClassName.trim());
                           setEditingClassId(null);
                         }
                       }} className="text-logo-green hover:text-brand-600 flex-shrink-0"><Check size={14}/></button>
                       <button onClick={() => setEditingClassId(null)} className="text-red-500 hover:text-red-700 flex-shrink-0"><X size={14}/></button>
                    </div>
                  ) : (
                    <div className={`group flex items-center justify-between w-full px-2 py-2 rounded transition-colors ${
                      selectedClassId === c.id 
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}>
                      <button 
                        onClick={() => {
                          setSelectedClassId(selectedClassId === c.id ? null : c.id);
                          setSelectedAssignmentId(null);
                          setSelectedSubFolderId(null);
                          setSelectedEssay(null);
                        }}
                        className="flex items-center gap-2 flex-1 text-left text-sm font-bold truncate w-full"
                      >
                        {selectedClassId === c.id ? <FolderOpen size={16} className="text-brand-500 flex-shrink-0" /> : <Folder size={16} className="text-slate-400 flex-shrink-0" />}
                        <span className="truncate">{c.name}</span>
                      </button>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditClassName(c.name); setEditingClassId(c.id); }}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                          title="Rename folder"
                        >
                           <Pencil size={12} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeletingType('class'); setDeletingId(c.id); }}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="Delete folder"
                        >
                           <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {selectedClassId === c.id && (
                    <div className="ml-4 pl-2 border-l border-slate-200 dark:border-slate-700 mt-1 space-y-1">
                      {getAssignmentsForClass(c.id).map(a => (
                        <div key={a.id}>
                        {editingAssignmentId === a.id ? (
                          <div className="flex items-center gap-2 w-full px-2 py-1.5 pl-4">
                             <input 
                               autoFocus
                               value={editAssignmentName}
                               onChange={e => setEditAssignmentName(e.target.value)}
                               className="flex-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-logo-green w-full min-w-0"
                               onKeyDown={e => {
                                 if (e.key === 'Enter' && editAssignmentName.trim()) {
                                   onRenameAssignment(a.id, editAssignmentName.trim());
                                   setEditingAssignmentId(null);
                                 } else if (e.key === 'Escape') {
                                   setEditingAssignmentId(null);
                                 }
                               }}
                             />
                             <button onClick={() => {
                               if (editAssignmentName.trim()) {
                                 onRenameAssignment(a.id, editAssignmentName.trim());
                                 setEditingAssignmentId(null);
                               }
                             }} className="text-logo-green hover:text-brand-600 flex-shrink-0"><Check size={12}/></button>
                             <button onClick={() => setEditingAssignmentId(null)} className="text-red-500 hover:text-red-700 flex-shrink-0"><X size={12}/></button>
                          </div>
                        ) : (
                          <>
                            <div className={`group flex items-center justify-between w-full px-2 py-1.5 rounded transition-colors ${
                              selectedAssignmentId === a.id 
                                ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white font-bold' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}>
                              <button
                                onClick={() => {
                                  setSelectedAssignmentId(selectedAssignmentId === a.id ? null : a.id);
                                  setSelectedSubFolderId(null);
                                  setSelectedEssay(null);
                                }}
                                className="flex items-center gap-2 flex-1 text-left text-xs font-medium truncate w-full"
                              >
                                <ChevronRight size={14} className={`flex-shrink-0 transition-transform ${selectedAssignmentId === a.id ? 'rotate-90 text-slate-800 dark:text-white' : 'text-slate-400'}`} />
                                <span className="truncate">{a.name}</span>
                              </button>
                              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditAssignmentName(a.name); setEditingAssignmentId(a.id); }}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity p-0.5"
                                  title="Rename assignment"
                                >
                                   <Pencil size={10} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeletingType('assignment'); setDeletingId(a.id); }}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"
                                  title="Delete assignment"
                                >
                                   <Trash2 size={10} />
                                </button>
                                <span className="text-[10px] bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 ml-1">
                                  {essays.filter(e => e.assignmentId === a.id).length}
                                </span>
                              </div>
                            </div>

                            {selectedAssignmentId === a.id && renderSubFolders(a.id)}
                          </>
                        )}
                        </div>
                      ))}
                      {getAssignmentsForClass(c.id).length === 0 && !isCreatingAssignmentForClassId && (
                        <p className="text-[10px] text-slate-400 pl-2 py-1">No assignments</p>
                      )}

                      {isCreatingAssignmentForClassId === c.id ? (
                        <div className="flex items-center gap-2 w-full px-2 py-1.5 pl-4">
                          <input 
                            autoFocus
                            value={newAssignmentName}
                            placeholder="New Assignment..."
                            onChange={e => setNewAssignmentName(e.target.value)}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-logo-green w-full min-w-0"
                            onKeyDown={e => {
                              if (e.key === 'Enter' && newAssignmentName.trim()) {
                                onCreateAssignment(newAssignmentName.trim(), c.id);
                                setNewAssignmentName('');
                                setIsCreatingAssignmentForClassId(null);
                              } else if (e.key === 'Escape') {
                                setIsCreatingAssignmentForClassId(null);
                                setNewAssignmentName('');
                              }
                            }}
                          />
                          <button onClick={() => {
                            if (newAssignmentName.trim()) {
                              onCreateAssignment(newAssignmentName.trim(), c.id);
                              setNewAssignmentName('');
                              setIsCreatingAssignmentForClassId(null);
                            }
                          }} className="text-logo-green hover:text-brand-600 flex-shrink-0"><Check size={12}/></button>
                          <button onClick={() => { setIsCreatingAssignmentForClassId(null); setNewAssignmentName(''); }} className="text-red-500 hover:text-red-700 flex-shrink-0"><X size={12}/></button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsCreatingAssignmentForClassId(c.id)}
                          className="w-full text-left px-2 py-1 pl-4 text-[10px] font-bold text-slate-400 hover:text-logo-green transition-colors flex items-center gap-1 mt-1"
                        >
                          <Plus size={10} /> Add Assignment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <FileText size={14} className="text-slate-300 dark:text-slate-600"/>
              Single Entries
            </h3>
             <div className="space-y-1">
              {singleAssignments.map(folder => (
                <div key={folder.id}>
                {editingAssignmentId === folder.id ? (
                    <div className="flex items-center gap-2 w-full px-2 py-2">
                       <input 
                         autoFocus
                         value={editAssignmentName}
                         onChange={e => setEditAssignmentName(e.target.value)}
                         className="flex-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 text-sm text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-logo-green min-w-0"
                         onKeyDown={e => {
                           if (e.key === 'Enter' && editAssignmentName.trim()) {
                             onRenameAssignment(folder.id, editAssignmentName.trim());
                             setEditingAssignmentId(null);
                           } else if (e.key === 'Escape') {
                             setEditingAssignmentId(null);
                           }
                         }}
                       />
                       <button onClick={() => {
                         if (editAssignmentName.trim()) {
                           onRenameAssignment(folder.id, editAssignmentName.trim());
                           setEditingAssignmentId(null);
                         }
                       }} className="text-logo-green hover:text-brand-600 flex-shrink-0"><Check size={14}/></button>
                       <button onClick={() => setEditingAssignmentId(null)} className="text-red-500 hover:text-red-700 flex-shrink-0"><X size={14}/></button>
                    </div>
                ) : (
                  <>
                  <div className={`group flex items-center justify-between w-full px-2 py-2 rounded transition-colors ${
                    selectedAssignmentId === folder.id 
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}>
                    <button 
                      onClick={() => {
                        setSelectedClassId(singleClassId);
                        setSelectedAssignmentId(selectedAssignmentId === folder.id ? null : folder.id);
                        setSelectedSubFolderId(null);
                        setSelectedEssay(null);
                      }}
                      className="flex items-center gap-2 flex-1 text-left text-sm font-bold truncate w-full"
                    >
                      {selectedAssignmentId === folder.id ? <FolderOpen size={16} className="text-brand-500 flex-shrink-0 transition-transform rotate-90" /> : <Folder size={16} className="text-slate-400 flex-shrink-0" />}
                      <span className="truncate">{folder.name}</span>
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditAssignmentName(folder.name); setEditingAssignmentId(folder.id); }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        title="Rename folder"
                      >
                         <Pencil size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeletingType('assignment'); setDeletingId(folder.id); }}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Delete folder"
                      >
                         <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {selectedAssignmentId === folder.id && renderSubFolders(folder.id)}
                  </>
                )}
                </div>
              ))}
              
              {/* Manual Add Subfolder for Single Entries too */}
              {isCreatingAssignmentForClassId === singleClassId ? (
                <div className="flex items-center gap-2 w-full px-2 py-1.5 pl-4">
                  <input 
                    autoFocus
                    value={newAssignmentName}
                    placeholder="New Folder..."
                    onChange={e => setNewAssignmentName(e.target.value)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-logo-green w-full min-w-0"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newAssignmentName.trim()) {
                        onCreateAssignment(newAssignmentName.trim(), singleClassId);
                        setNewAssignmentName('');
                        setIsCreatingAssignmentForClassId(null);
                      } else if (e.key === 'Escape') {
                        setIsCreatingAssignmentForClassId(null);
                        setNewAssignmentName('');
                      }
                    }}
                  />
                  <button onClick={() => {
                    if (newAssignmentName.trim()) {
                      onCreateAssignment(newAssignmentName.trim(), singleClassId);
                      setNewAssignmentName('');
                      setIsCreatingAssignmentForClassId(null);
                    }
                  }} className="text-logo-green hover:text-brand-600 flex-shrink-0"><Check size={12}/></button>
                  <button onClick={() => { setIsCreatingAssignmentForClassId(null); setNewAssignmentName(''); }} className="text-red-500 hover:text-red-700 flex-shrink-0"><X size={12}/></button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsCreatingAssignmentForClassId(singleClassId)}
                  className="w-full text-left px-2 py-1 pl-4 text-[10px] font-bold text-slate-400 hover:text-logo-green transition-colors flex items-center gap-1 mt-1"
                >
                  <Plus size={10} /> Add Assignment
                </button>
              )}
              
              {/* Backward compatibility folder if essays exist */}
              {essays.some(e => (!e.classId && !e.assignmentId) || (!e.id.startsWith('p') && e.classId === singleClassId) || e.classId === 'single_entries_class' || e.assignmentId === 'single_entries_assignment') && (
                <div className={`group flex items-center justify-between w-full px-2 py-2 rounded transition-colors ${
                  selectedAssignmentId && !['p1','p2','p3'].some(p => selectedAssignmentId?.startsWith(p)) && selectedClassId === singleClassId
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 italic'
                }`}>
                  <button 
                    onClick={() => {
                      setSelectedClassId(singleClassId);
                      setSelectedAssignmentId(selectedAssignmentId === "legacy_single" ? null : "legacy_single");
                      setSelectedEssay(null);
                    }}
                    className="flex items-center gap-2 flex-1 text-left text-[10px] font-bold truncate w-full"
                  >
                    <Folder size={14} className="opacity-50" />
                    <span className="truncate">Legacy / Other Entries</span>
                  </button>
                </div>
              )}
             </div>
          </div>
        </div>

        {/* Middle Column: Essays in Assignment */}
        {selectedAssignmentId && (
          <div className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Saved Candidates</h3>
              
              {listQuestionContext && selectedClassId !== singleClassId && (
                <div className="mb-4 text-xs italic text-slate-500 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg line-clamp-3 text-ellipsis" title={listQuestionContext}>
                  "{listQuestionContext}"
                </div>
              )}

              <div className="space-y-2">
                {getEssaysForList(selectedAssignmentId, selectedSubFolderId).length === 0 && (
                  <p className="text-xs text-slate-500 italic">No saved data</p>
                )}
                {getEssaysForList(selectedAssignmentId, selectedSubFolderId).map(e => (
                  <div
                    key={e.id}
                    onClick={() => setSelectedEssay(e)}
                    className={`group flex flex-col gap-1 w-full p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      selectedEssay?.id === e.id 
                        ? 'border-brand-300 bg-brand-50 shadow-sm dark:bg-brand-900/20 dark:border-brand-700' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                    }`}
                  >
                    {editingEssayId === e.id ? (
                      <div className="flex items-center gap-2 w-full mb-1">
                         <input 
                           autoFocus
                           value={editEssayName}
                           onChange={ev => setEditEssayName(ev.target.value)}
                           className="flex-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-logo-green w-full min-w-0"
                           onClick={ev => ev.stopPropagation()}
                           onKeyDown={ev => {
                             if (ev.key === 'Enter' && editEssayName.trim()) {
                               onRenameEssay(e.id, editEssayName.trim());
                               setEditingEssayId(null);
                             } else if (ev.key === 'Escape') {
                               setEditingEssayId(null);
                             }
                           }}
                         />
                         <button onClick={(ev) => {
                           ev.stopPropagation();
                           if (editEssayName.trim()) {
                             onRenameEssay(e.id, editEssayName.trim());
                             setEditingEssayId(null);
                           }
                         }} className="text-logo-green hover:text-brand-600 flex-shrink-0"><Check size={12}/></button>
                         <button onClick={(ev) => { ev.stopPropagation(); setEditingEssayId(null); }} className="text-red-500 hover:text-red-700 flex-shrink-0"><X size={12}/></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate pr-2">{e.studentName}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button 
                            onClick={(ev) => { ev.stopPropagation(); setEditEssayName(e.studentName); setEditingEssayId(e.id); }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity p-0.5"
                            title="Rename candidate"
                          >
                             <Pencil size={12} />
                          </button>
                          <button 
                            onClick={(ev) => { ev.stopPropagation(); setMovingEssayId(e.id); }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-logo-green transition-opacity p-0.5"
                            title="Move candidate"
                          >
                             <ChevronRight size={12} />
                          </button>
                          <button 
                            onClick={(ev) => { ev.stopPropagation(); setDeletingType('essay'); setDeletingId(e.id); }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"
                            title="Delete candidate"
                          >
                             <Trash2 size={12} />
                          </button>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 ml-1">P{e.paper}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between w-full mt-1">
                      <span className="text-[10px] text-slate-400">{new Date(e.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-brand-700 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/50 px-1.5 py-0.5 rounded">
                          EGAI: {extractScoreRaw(e.assessment) >= 0 ? `${extractScoreRaw(e.assessment)}` : `?`}
                        </span>
                        {e.teacherScore !== undefined && (
                          <span className="text-[9px] font-black text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                            TEACHER: {e.teacherScore}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right Pane: Viewing Essay Setup */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 md:p-8">
          {selectedEssay ? (
            <div className="max-w-3xl mx-auto space-y-6">
               <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                 <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                   <div>
                     <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{selectedEssay.studentName}</h2>
                     <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Paper {selectedEssay.paper} • {selectedEssay.marks} Marks</p>
                   </div>
                   <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                     {new Date(selectedEssay.date).toLocaleString()}
                   </span>
                 </div>
                 
                 <div className="space-y-6">
                   <div>
                     <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Question</h3>
                     <p className="text-sm italic font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                       {selectedEssay.question}
                     </p>
                   </div>
                   
                   <div>
                     <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Candidate Response</h3>
                     <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                       {selectedEssay.essay}
                     </div>
                   </div>

                   {/* Export Options */}
                   <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                     <div className="flex items-center gap-2 mb-4">
                       <FileDown size={14} className="text-logo-green" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Export Options</span>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Inputted Essay</p>
                         <div className="flex gap-2">
                           <button 
                             onClick={() => downloadEssayAsPDF(selectedEssay.studentName, selectedEssay.essay, selectedEssay.question, selectedEssay.paper, selectedEssay.marks)}
                             className="flex-1 px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-logo-green hover:text-logo-green transition-all uppercase tracking-widest"
                           >
                             PDF
                           </button>
                           <button 
                             onClick={() => downloadEssayAsDocx(selectedEssay.studentName, selectedEssay.essay, selectedEssay.question, selectedEssay.paper, selectedEssay.marks)}
                             className="flex-1 px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-logo-green hover:text-logo-green transition-all uppercase tracking-widest"
                           >
                             DOCX
                           </button>
                         </div>
                       </div>

                       <div className="space-y-2">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Marking Report</p>
                         <div className="flex gap-2">
                           <button 
                             onClick={() => downloadReportAsPDF(selectedEssay.studentName, selectedEssay.assessment, selectedEssay.question)}
                             className="flex-1 px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-logo-green hover:text-logo-green transition-all uppercase tracking-widest"
                           >
                             PDF
                           </button>
                           <button 
                             onClick={() => downloadReportAsDocx(selectedEssay.studentName, selectedEssay.assessment, selectedEssay.question)}
                             className="flex-1 px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-logo-green hover:text-logo-green transition-all uppercase tracking-widest"
                           >
                             DOCX
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 flex opacity-20 pointer-events-none">
                    <FileText size={120} className="text-brand-500 rotate-12 translate-x-4 -translate-y-4" />
                 </div>
                 <h3 className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-6 border-b border-brand-100 dark:border-brand-900 pb-2 inline-flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand-500"></div> All-Seeing Assessor Feedback
                 </h3>
                 <div className="markdown-body prose prose-slate max-w-none relative z-10">
                   <ReactMarkdown>{selectedEssay.assessment}</ReactMarkdown>
                 </div>
                 
                 <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6 relative z-10 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-inner">
                    <div className="flex flex-col min-w-[100px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm">EGAI</span>
                      <span className="text-3xl font-black text-brand-600 dark:text-brand-400">
                        {extractScoreRaw(selectedEssay.assessment) >= 0 ? extractScoreRaw(selectedEssay.assessment) : "?"} <span className="text-sm font-bold text-slate-400">/ {selectedEssay.marks}</span>
                      </span>
                    </div>
                    <div className="hidden sm:block w-px h-12 bg-slate-200 dark:bg-slate-700/50"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-logo-green uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        TEACHER <Pencil size={10} />
                      </span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            const currentScore = selectedEssay.teacherScore !== undefined ? selectedEssay.teacherScore : (extractScoreRaw(selectedEssay.assessment) >= 0 ? extractScoreRaw(selectedEssay.assessment) : 0);
                            const newScore = Math.max(0, currentScore - 1);
                            onUpdateTeacherScore(selectedEssay.id, newScore);
                            setSelectedEssay({ ...selectedEssay, teacherScore: newScore });
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-logo-green outline-none"
                        >
                          <span className="text-xl font-medium leading-none mb-1">-</span>
                        </button>
                        <span className="text-3xl font-black text-slate-800 dark:text-white min-w-[3rem] text-center">
                           {selectedEssay.teacherScore !== undefined ? selectedEssay.teacherScore : (extractScoreRaw(selectedEssay.assessment) >= 0 ? extractScoreRaw(selectedEssay.assessment) : "-")}
                        </span>
                        <button 
                          onClick={() => {
                            const currentScore = selectedEssay.teacherScore !== undefined ? selectedEssay.teacherScore : (extractScoreRaw(selectedEssay.assessment) >= 0 ? extractScoreRaw(selectedEssay.assessment) : 0);
                            const newScore = Math.min(parseInt(selectedEssay.marks), currentScore + 1);
                            onUpdateTeacherScore(selectedEssay.id, newScore);
                            setSelectedEssay({ ...selectedEssay, teacherScore: newScore });
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-logo-green outline-none"
                        >
                          <span className="text-xl font-medium leading-none mb-0.5">+</span>
                        </button>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <FolderOpen size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">No Document Selected</h3>
              <p className="text-xs text-slate-400">Select a class, then an assignment, and finally a candidate's submission to view the archived feedback report.</p>
            </div>
          )}
        </div>

      </div>

      {movingEssayId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Move Candidate</h3>
              <button onClick={() => setMovingEssayId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-4">
                {/* Single Entry Destinations */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Single Entry Folders</h4>
                  <div className="grid gap-1">
                    {singleAssignments.map(a => (
                      <div key={a.id} className="space-y-1">
                        <button
                          onClick={() => {
                            onMoveEssay(movingEssayId, singleClassId, a.id);
                            setMovingEssayId(null);
                            setSelectedEssay(null);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/20 transition-colors"
                        >
                          <Folder size={16} className="text-logo-green opacity-50" />
                          {a.name}
                        </button>
                        <div className="ml-6 space-y-1">
                          {getSubFoldersForAssignment(a.id).map(sub => (
                            <button
                               key={sub.id}
                               onClick={() => {
                                 onMoveEssay(movingEssayId, singleClassId, a.id, sub.id);
                                 setMovingEssayId(null);
                                 setSelectedEssay(null);
                               }}
                               className="flex items-center gap-3 w-full px-3 py-1.5 rounded-lg text-left text-xs font-bold text-slate-500 hover:bg-slate-100"
                            >
                              <FolderCheck size={14} className="opacity-50" />
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Class Destinations */}
                {primaryClasses.map(c => (
                  <div key={c.id}>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">{c.name}</h4>
                    <div className="grid gap-1">
                      {getAssignmentsForClass(c.id).map(a => (
                         <div key={a.id} className="space-y-1">
                           <button
                              onClick={() => {
                                onMoveEssay(movingEssayId, c.id, a.id);
                                setMovingEssayId(null);
                                setSelectedEssay(null);
                              }}
                              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/20 transition-colors"
                            >
                              <ChevronRight size={14} className="text-slate-400" />
                              {a.name}
                            </button>
                            <div className="ml-6 space-y-1">
                              {getSubFoldersForAssignment(a.id).map(sub => (
                                <button
                                  key={sub.id}
                                  onClick={() => {
                                    onMoveEssay(movingEssayId, c.id, a.id, sub.id);
                                    setMovingEssayId(null);
                                    setSelectedEssay(null);
                                  }}
                                  className="flex items-center gap-3 w-full px-3 py-1.5 rounded-lg text-left text-xs font-bold text-slate-500 hover:bg-slate-100"
                                >
                                  <FolderCheck size={14} className="opacity-50" />
                                  {sub.name}
                                </button>
                              ))}
                            </div>
                         </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
               <button 
                onClick={() => setMovingEssayId(null)}
                className="w-full py-2.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingId && deletingType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
            <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-2">Delete {deletingType}?</h3>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
            
            <SlideToConfirm 
              text="Slide to Delete" 
              onConfirm={() => {
                if (deletingType === 'class') onDeleteClass(deletingId);
                else if (deletingType === 'assignment') onDeleteAssignment(deletingId);
                else if (deletingType === 'subfolder') onDeleteSubFolder(deletingId);
                else if (deletingType === 'essay') onDeleteEssay(deletingId);
                
                // Keep selected state clean
                if (deletingType === 'class' && deletingId === selectedClassId) {
                  setSelectedClassId(null); setSelectedAssignmentId(null); setSelectedSubFolderId(null); setSelectedEssay(null);
                } else if (deletingType === 'assignment' && deletingId === selectedAssignmentId) {
                  setSelectedAssignmentId(null); setSelectedSubFolderId(null); setSelectedEssay(null);
                } else if (deletingType === 'subfolder' && deletingId === selectedSubFolderId) {
                  setSelectedSubFolderId(null); setSelectedEssay(null);
                } else if (deletingType === 'essay' && deletingId === selectedEssay?.id) {
                  setSelectedEssay(null);
                }
                
                setDeletingId(null);
                setDeletingType(null);
              }}
            />
            
            <button 
              onClick={() => { setDeletingId(null); setDeletingType(null); }}
              className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-widest px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
