import React, { useState } from "react";
import { FolderOpen, ChevronRight, ChevronDown, Folder, UserCheck, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import type { ClassFolder } from "../types";

interface DirectorySidebarProps {
  classes: ClassFolder[];
  activeAssignmentId: string | null;
  onSelectAssignment: (assignmentId: string) => void;
  onCreateClass: (name: string) => void;
  onEditClass: (classId: string, name: string) => void;
  onDeleteClass: (classId: string) => void;
  onCreateAssignment: (classId: string, name: string) => void;
  onEditAssignment: (classId: string, assignmentId: string, name: string) => void;
  onDeleteAssignment: (classId: string, assignmentId: string) => void;
}

export function DirectorySidebar({ 
  classes, 
  activeAssignmentId, 
  onSelectAssignment,
  onCreateClass,
  onEditClass,
  onDeleteClass,
  onCreateAssignment,
  onEditAssignment,
  onDeleteAssignment
}: DirectorySidebarProps) {
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  
  // State for inline editing
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState("");
  
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editAssignmentName, setEditAssignmentName] = useState("");

  const [creatingClass, setCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const [creatingAssignmentForClass, setCreatingAssignmentForClass] = useState<string | null>(null);
  const [newAssignmentName, setNewAssignmentName] = useState("");

  const toggleClass = (classId: string) => {
    setExpandedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };

  const handleSaveEditClass = (id: string) => {
    if (editClassName.trim()) {
      onEditClass(id, editClassName.trim());
    }
    setEditingClassId(null);
  };

  const handleSaveEditAssignment = (classId: string, id: string) => {
    if (editAssignmentName.trim()) {
      onEditAssignment(classId, id, editAssignmentName.trim());
    }
    setEditingAssignmentId(null);
  };

  const handleCreateClass = () => {
    if (newClassName.trim()) {
      onCreateClass(newClassName.trim());
    }
    setCreatingClass(false);
    setNewClassName("");
  };

  const handleCreateAssignment = (classId: string) => {
    if (newAssignmentName.trim()) {
      onCreateAssignment(classId, newAssignmentName.trim());
      setExpandedClasses(prev => ({ ...prev, [classId]: true }));
    }
    setCreatingAssignmentForClass(null);
    setNewAssignmentName("");
  };

  return (
    <div className="w-80 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full overflow-y-auto flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-widest uppercase flex items-center gap-2 mb-4">
          <FolderOpen size={18} className="text-emerald-500" />
          Master Directory
        </h2>
        <button 
          onClick={() => { setCreatingClass(true); setNewClassName(""); }}
          className="w-full py-2 px-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} /> Add Teacher Folder
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {creatingClass && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg shadow-sm">
            <Folder size={16} className="text-emerald-500 shrink-0" fill="currentColor" />
            <input 
              autoFocus
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-800 dark:text-slate-100 w-full"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              placeholder="New Class Name..."
              onKeyDown={e => e.key === 'Enter' && handleCreateClass()}
            />
            <button onClick={handleCreateClass} className="text-emerald-500 hover:text-emerald-600">
              <Check size={16} />
            </button>
            <button onClick={() => setCreatingClass(false)} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
        )}

        {classes.length === 0 && !creatingClass ? (
          <div className="p-4 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Directory Empty</p>
          </div>
        ) : (
          classes.map(c => (
            <div key={c.id} className="space-y-1">
              {editingClassId === c.id ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg shadow-sm">
                  <Folder size={16} className="text-emerald-500 shrink-0" fill="currentColor" />
                  <input 
                    autoFocus
                    className="bg-transparent border-none outline-none text-sm font-bold text-slate-800 dark:text-slate-100 w-full"
                    value={editClassName}
                    onChange={e => setEditClassName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveEditClass(c.id)}
                  />
                  <button onClick={() => handleSaveEditClass(c.id)} className="text-emerald-500 hover:text-emerald-600">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingClassId(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400">
                  <button
                    onClick={() => toggleClass(c.id)}
                    className="flex items-center gap-2 font-bold text-sm truncate"
                  >
                    {expandedClasses[c.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Folder size={16} className="text-emerald-500" fill="currentColor" />
                    <span className="truncate">{c.name}</span>
                  </button>
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => { setEditingClassId(c.id); setEditClassName(c.name); }}
                      className="p-1 rounded text-emerald-600 hover:bg-emerald-200/50 dark:hover:bg-emerald-500/30"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDeleteClass(c.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                      title="Delete Class"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
              
              {(expandedClasses[c.id] || creatingAssignmentForClass === c.id) && (
                <div className="pl-7 pr-2 py-2 space-y-1 relative before:content-[''] before:absolute before:left-[22px] before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                  {c.assignments.length === 0 && creatingAssignmentForClass !== c.id ? (
                     <p className="text-xs text-slate-400 p-2 font-medium">No assignments</p>
                  ) : (
                    c.assignments.map(a => (
                      editingAssignmentId === a.id ? (
                        <div key={a.id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg shadow-sm">
                          <input 
                            autoFocus
                            className="bg-transparent border-none outline-none text-sm font-medium text-slate-800 dark:text-slate-100 w-full"
                            value={editAssignmentName}
                            onChange={e => setEditAssignmentName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveEditAssignment(c.id, a.id)}
                          />
                          <button onClick={() => handleSaveEditAssignment(c.id, a.id)} className="text-emerald-500 hover:text-emerald-600 shrink-0">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingAssignmentId(null)} className="text-slate-400 hover:text-slate-600 shrink-0">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div key={a.id} className={`group flex items-center justify-between rounded-lg transition-colors ${activeAssignmentId === a.id ? 'bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>
                          <button
                            onClick={() => onSelectAssignment(a.id)}
                            className={`flex-1 flex items-center gap-2 py-1.5 px-2 text-sm text-left truncate ${activeAssignmentId === a.id ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 font-medium'}`}
                          >
                            <UserCheck size={14} className={activeAssignmentId === a.id ? "text-emerald-500" : "opacity-50"} />
                            <span className="truncate">{a.name}</span>
                          </button>
                          <div className={`hidden group-hover:flex items-center gap-1 shrink-0 px-2 ${activeAssignmentId === a.id ? '' : 'opacity-60 hover:opacity-100'}`}>
                            <button 
                              onClick={() => { setEditingAssignmentId(a.id); setEditAssignmentName(a.name); }}
                              className="p-1 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={() => onDeleteAssignment(c.id, a.id)}
                              className="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                              title="Delete Assignment"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      )
                    ))
                  )}

                  {creatingAssignmentForClass === c.id ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg shadow-sm mt-2">
                      <input 
                        autoFocus
                        className="bg-transparent border-none outline-none text-sm font-medium text-slate-800 dark:text-slate-100 w-full"
                        value={newAssignmentName}
                        onChange={e => setNewAssignmentName(e.target.value)}
                        placeholder="New Subfolder..."
                        onKeyDown={e => e.key === 'Enter' && handleCreateAssignment(c.id)}
                      />
                      <button onClick={() => handleCreateAssignment(c.id)} className="text-emerald-500 shrink-0">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setCreatingAssignmentForClass(null)} className="text-slate-400 shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setCreatingAssignmentForClass(c.id); setNewAssignmentName(""); setExpandedClasses(prev => ({ ...prev, [c.id]: true })); }}
                      className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-3 py-2 mt-1 uppercase tracking-widest"
                    >
                      <Plus size={12} /> Add Subfolder
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
