import React from 'react';
import { syllabusCodes, SyllabusCodeId } from '../types';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface SidebarProps {
  selectedCode: SyllabusCodeId | null;
  onSelectCode: (code: SyllabusCodeId) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ selectedCode, onSelectCode, isOpen, onToggle }: SidebarProps) {
  if (!isOpen) {
    return (
      <aside className="w-16 shrink-0 bg-white border-r border-slate-200 flex flex-col items-center py-4 transition-all h-full z-10">
        <button 
          onClick={onToggle} 
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-sm mb-4"
          title="Expand Syllabus Matrix"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        {selectedCode && (
           <div 
             className="flex flex-col items-center gap-2" 
             title={`Selected Syllabus: ${selectedCode}`}
           >
             <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs flex items-center justify-center border border-blue-200 shadow-sm">
               {selectedCode.replace(/[^0-9]/g, '')}
             </div>
             <div className="text-sm font-bold text-blue-600 tracking-wider uppercase transform -rotate-90 origin-center whitespace-nowrap mt-40">
               {syllabusCodes.find(code => code.id === selectedCode)?.name || selectedCode}
             </div>
           </div>
        )}
      </aside>
    );
  }

  return (
    <aside className="w-72 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full transition-all overflow-hidden z-10">
      <div className="px-5 py-4 border-b border-slate-100 bg-white flex justify-between items-center shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Syllabus Matrix</h2>
        </div>
        <button 
           onClick={onToggle} 
           disabled={!selectedCode}
           className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
           title={selectedCode ? "Collapse Syllabus Matrix" : "Select a syllabus code first"}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {syllabusCodes.map((code) => {
          const isSelected = selectedCode === code.id;
          return (
            <div
              key={code.id}
              onClick={() => onSelectCode(code.id as SyllabusCodeId)}
              className={`px-3 py-3 flex items-start justify-between cursor-pointer transition-colors rounded-lg border ${
                isSelected 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'hover:bg-slate-50 border-transparent text-slate-600'
              }`}
            >
              <div className="pr-2">
                <div className={`text-xs font-bold tracking-tight mb-0.5 ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                  {code.id}
                </div>
                <div className={`text-[11px] leading-snug ${isSelected ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
                  {code.name.replace(/^[^:]+:\s*/, '')}
                </div>
              </div>
              {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
