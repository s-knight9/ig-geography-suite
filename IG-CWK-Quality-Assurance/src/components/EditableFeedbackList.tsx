import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Plus, Trash2, Edit2 } from 'lucide-react';

interface EditableFeedbackListProps {
  items: string[];
  criterionId: string; // "1", "2", etc.
  type: 'WWW' | 'EBI';
  isEditable: boolean;
  onChange?: (newItems: string[]) => void;
}

export function EditableFeedbackList({ items, criterionId, type, isEditable, onChange }: EditableFeedbackListProps) {
  const sectionLetter = type === 'WWW' ? 'A' : 'B';
  const title = type === 'WWW' ? 'A) What Went Well (WWW)' : 'B) Even Better If (EBI)';
  const Icon = type === 'WWW' ? CheckCircle2 : AlertCircle;

  const handleEdit = (idx: number, newVal: string) => {
    if (!onChange) return;
    const copy = [...items];
    copy[idx] = newVal;
    onChange(copy);
  };

  const handleRemove = (idx: number) => {
    if (!onChange) return;
    const copy = [...items];
    copy.splice(idx, 1);
    onChange(copy);
  };

  const handleAdd = () => {
    if (!onChange) return;
    const copy = [...items];
    copy.push(""); // Add an empty field
    onChange(copy);
  };

  return (
    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/20 group">
      <div className="flex items-center justify-between mb-3">
         <h5 className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest">
           <Icon className="w-4 h-4" /> {title} {isEditable && <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
         </h5>
      </div>
      <ul className="space-y-2">
        {items.map((point: string, i: number) => {
           const refCode = `${criterionId}.${i + 1}${sectionLetter}`;
           return (
             <li key={i} className="flex items-start gap-3">
               <span className="text-[10px] font-black tracking-widest bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
                 {refCode}
               </span>
               {isEditable ? (
                 <div className="flex-1 flex items-start gap-2 group/item">
                    <textarea 
                      value={point} 
                      onChange={(e) => handleEdit(i, e.target.value)}
                      className="flex-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[40px]"
                      rows={Math.max(1, Math.ceil(point.length / 80))}
                    />
                    <button onClick={() => handleRemove(i)} className="mt-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-md opacity-0 group-hover/item:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
               ) : (
                 <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">{point}</span>
               )}
             </li>
           );
        })}
      </ul>
      {isEditable && (
         <button onClick={handleAdd} className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-1 rounded-md transition-colors">
            <Plus className="w-3 h-3" /> Add Teacher Comment
         </button>
      )}
    </div>
  );
}
