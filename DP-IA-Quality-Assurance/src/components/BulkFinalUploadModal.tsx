import React, { useState, useRef } from "react";
import { X, FileText, CheckCircle2, ChevronRight, Loader2, Paperclip, AlertCircle, Eye, Settings, Download } from "lucide-react";
import type { CandidateRecord, AnalysisResult } from "../types";

export interface BulkFinalUploadModalProps {
  candidates: CandidateRecord[];
  onClose: () => void;
  onProcessItem: (candidate: CandidateRecord, file: File) => Promise<AnalysisResult>;
  onCommitAll: (items: BulkFinalItem[]) => void;
}

export interface BulkFinalItem {
  candidate: CandidateRecord;
  file: File | null;
  status: 'pending' | 'ready' | 'processing' | 'done' | 'error';
  result?: AnalysisResult;
}

export function BulkFinalUploadModal({ candidates, onClose, onProcessItem, onCommitAll }: BulkFinalUploadModalProps) {
  // Initialize with draft candidates
  const [items, setItems] = useState<BulkFinalItem[]>(
    candidates
      .filter(c => c.submissionType === 'Draft')
      .sort((a, b) => a.studentName.localeCompare(b.studentName))
      .map(c => ({ candidate: c, file: null, status: 'pending' }))
  );
  
  const [showSummary, setShowSummary] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeItemId) return;
    
    setItems(prev => prev.map(item => {
      if (item.candidate.id === activeItemId) {
        return { ...item, file, status: 'ready' };
      }
      return item;
    }));
    setActiveItemId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProcessClick = async () => {
    const processable = items.filter(i => i.file && (i.status === 'ready' || i.status === 'error'));
    if (processable.length === 0) return;

    setIsProcessing(true);
    setProcessProgress(0);
    
    let completed = 0;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.file || item.status === 'done' || item.status === 'pending') {
            continue;
        }

        setItems(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'processing' } : s));

        try {
            const result = await onProcessItem(item.candidate, item.file);
            setItems(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done', result } : s));
        } catch (err: any) {
            console.error(err);
            setItems(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'error' } : s));
        }
        
        completed++;
        setProcessProgress(Math.round((completed / processable.length) * 100));
    }

    setIsProcessing(false);
    setShowSummary(true);
  };

  const readyCount = items.filter(i => i.status === 'ready' || i.status === 'processing' || i.status === 'done' || i.status === 'error').length;
  const isAllDone = items.some(i => i.status === 'done') && items.every(i => i.status === 'done' || i.status === 'pending' || i.status === 'error');

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              Bulk Match Final Submissions
            </h2>
            <p className="text-sm text-slate-400 mt-1">Upload and compare final submissions against their original drafts.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
            {!showSummary ? (
              <>
                 <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden overflow-x-auto">
                     <table className="w-full text-left bg-white dark:bg-slate-800 whitespace-nowrap min-w-max">
                         <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                             <tr>
                                 <th className="p-3 text-xs font-bold uppercase text-slate-500">Student Name</th>
                                  <th className="p-3 text-xs font-bold uppercase text-slate-500">Draft IAQA Grade</th>
                                  <th className="p-3 text-xs font-bold uppercase text-slate-500">Draft Teacher Grade</th>
                                  <th className="p-3 text-xs font-bold uppercase text-slate-500">Final IA Attachment Slot</th>
                             </tr>
                         </thead>
                         <tbody>
                             {items.map(item => {
                                 let surname = item.candidate.studentName;
                                 let forename = "";
                                 const nameParts = item.candidate.studentName.split(",");
                                 if (nameParts.length >= 2) {
                                     surname = nameParts[0].trim();
                                     forename = nameParts[1].trim();
                                 }

                                 return (
                                 <tr key={item.candidate.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                                     <td className="p-3 font-medium text-slate-800 dark:text-slate-100">
                                        {surname}, {forename}
                                     </td>
                                     <td className="p-3">
                                        <span className="font-bold text-slate-600 dark:text-slate-300">{item.candidate.iaqa_score || 0}/{item.candidate.subject === 'ESS' ? 30 : 25}</span>
                                     </td>
                                     <td className="p-3">
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.candidate.moderated_score || 0}/{item.candidate.subject === 'ESS' ? 30 : 25}</span>
                                     </td>
                                     <td className="p-3">
                                        {item.file ? (
                                            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-2 rounded-md text-sm border border-emerald-100 dark:border-emerald-500/20">
                                                <div className="flex items-center gap-2 truncate max-w-[200px]">
                                                    <FileText size={16} className="shrink-0" />
                                                    <span className="truncate">{item.file.name}</span>
                                                </div>
                                                <button
                                                   className="text-red-500 hover:text-red-700 ml-2 shrink-0 bg-white dark:bg-red-500/20 rounded-full p-0.5"
                                                   onClick={() => {
                                                     if (!isProcessing) {
                                                        setItems(prev => prev.map(i => i.candidate.id === item.candidate.id ? { ...i, file: null, status: 'pending' } : i))
                                                     }
                                                   }}
                                                   disabled={isProcessing}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                               onClick={() => {
                                                   if (!isProcessing) {
                                                     setActiveItemId(item.candidate.id);
                                                     fileInputRef.current?.click();
                                                   }
                                               }}
                                               disabled={isProcessing}
                                               className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition"
                                            >
                                                <Paperclip size={14} /> Attach Final IA
                                            </button>
                                        )}
                                        {item.status === 'processing' && <span className="ml-2 inline-flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-100"><Loader2 size={12} className="animate-spin" /> Processing</span>}
                                        {item.status === 'done' && <span className="ml-2 inline-flex px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700">Done</span>}
                                     </td>
                                 </tr>
                             )})}
                         </tbody>
                     </table>
                     <input type="file" onChange={handleFileChange} ref={fileInputRef} className="hidden" accept=".pdf" />
                 </div>
              </>
            ) : (
              // Summary View
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Comparison Processing Complete</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.filter(i => i.status === 'done' && i.result).map(item => (
                    <div key={item.candidate.id} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                       <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 truncate">{item.candidate.studentName}</h4>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500">Draft Score:</span>
                         <span className="font-bold">{item.candidate.moderated_score}/{item.candidate.subject === 'ESS' ? 30 : 25}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm mt-1">
                         <span className="text-slate-500">Final Score:</span>
                         <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.result?.moderatedScore !== undefined ? item.result.moderatedScore : (item.result as any)?.totalScore1 !== undefined ? (item.result as any)?.totalScore1 : item.result?.totalScore}/{item.candidate?.subject === 'ESS' ? 30 : 25}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2 rounded-lg font-bold text-sm transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          
          {!showSummary ? (
            <button
              onClick={handleProcessClick}
              disabled={isProcessing || readyCount === 0}
              className={`px-6 py-2 rounded-lg font-bold text-sm tracking-wide flex items-center gap-2 transition-all shadow-sm ${
                isProcessing || readyCount === 0
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200/50 dark:shadow-emerald-900/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing {processProgress}%
                </>
              ) : (
                <>
                  Process All Final Uploads
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          ) : (
            <button
               onClick={() => {
                  onCommitAll(items);
                  onClose();
               }}
               className="px-6 py-2 rounded-lg font-bold text-sm tracking-wide flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200/50 dark:shadow-emerald-900/20"
            >
               <CheckCircle2 size={16} />
               Commit All to Directory
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
