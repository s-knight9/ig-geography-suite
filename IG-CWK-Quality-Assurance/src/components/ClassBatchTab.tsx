import React, { useState, useRef, useMemo } from 'react';
import { Upload, Trash2, FileText, CheckCircle2, AlertCircle, Loader2, UserPlus, PlayCircle } from 'lucide-react';
import * as xlsx from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ClassMember {
  id: string;
  surname: string;
  forename: string;
  preferredName: string;
  file?: File;
  fileContent?: string;
  status: 'MISSING' | 'READY' | 'GRADING' | 'DONE' | 'ERROR';
  evaluation?: any;
  error?: string;
}

export default function ClassBatchTab({ onComplete }: { onComplete: (results: ClassMember[]) => void }) {
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState({ current: 0, total: 0 });
  const [newSurname, setNewSurname] = useState('');
  const [newForename, setNewForename] = useState('');
  const [newPreferredName, setNewPreferredName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        text += strings.join(' ') + '\n';
    }
    return text;
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = xlsx.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = xlsx.utils.sheet_to_json<any>(sheet, { defval: '' });
      
      const newMembers: ClassMember[] = json.map((row: any) => {
        // Try to find columns for Surname, Forename, Preferred Name
        const surname = row['Surname'] || row['LastName'] || row['Last Name'] || '';
        const forename = row['Forename'] || row['FirstName'] || row['First Name'] || '';
        const preferredName = row['Preferred Name'] || row['PreferredName'] || '';

        return {
          id: Math.random().toString(36).substring(2, 9),
          surname: String(surname).trim(),
          forename: String(forename).trim(),
          preferredName: String(preferredName).trim(),
          status: 'MISSING' as 'MISSING'
        };
      }).filter((m: ClassMember) => m.surname || m.forename);

      setMembers(prev => [...prev, ...newMembers]);
    } catch (err) {
      console.error(err);
      alert('Failed to parse roster file. Ensure it contains columns for Surname, Forename, and optionally Preferred Name.');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualAdd = () => {
    if (!newSurname.trim() && !newForename.trim()) return;
    const newMember: ClassMember = {
      id: Math.random().toString(36).substring(2, 9),
      surname: newSurname.trim(),
      forename: newForename.trim(),
      preferredName: newPreferredName.trim(),
      status: 'MISSING'
    };
    setMembers(prev => [...prev, newMember]);
    setNewSurname('');
    setNewForename('');
    setNewPreferredName('');
  };

  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set temporarily to uploading locally if needed, but here we just read it quickly.
    try {
      const text = await extractTextFromPDF(file);
      setMembers(prev => prev.map(m => {
        if (m.id === id) {
          return { ...m, file, fileContent: text, status: 'READY' };
        }
        return m;
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to extract text from this PDF.');
    }
  };

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => a.surname.localeCompare(b.surname));
  }, [members]);

  const readies = members.filter(m => m.status === 'READY' || m.status === 'DONE');
  const canGrade = readies.length > 0 && !isGrading && readies.filter(m => m.status === 'READY').length > 0;

  const handleGradeClass = async () => {
    const targetMembers = members.filter(m => m.status === 'READY');
    if (targetMembers.length === 0) return;

    setIsGrading(true);
    setGradingProgress({ current: 0, total: targetMembers.length });

    const newMembersList = [...members];

    for (let i = 0; i < targetMembers.length; i++) {
        const student = targetMembers[i];
        const studentIndex = newMembersList.findIndex(m => m.id === student.id);
        
        // Update status to grading
        newMembersList[studentIndex] = { ...newMembersList[studentIndex], status: 'GRADING' };
        setMembers([...newMembersList]);
        setGradingProgress({ current: i + 1, total: targetMembers.length });

        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: student.fileContent })
            });

            if (response.ok) {
                const data = await response.json();
                if (data && !data.error) {
                    newMembersList[studentIndex] = { ...newMembersList[studentIndex], status: 'DONE', evaluation: data };
                } else {
                    newMembersList[studentIndex] = { ...newMembersList[studentIndex], status: 'ERROR', error: data.error };
                }
            } else {
                 newMembersList[studentIndex] = { ...newMembersList[studentIndex], status: 'ERROR', error: 'HTTP '+response.status };
            }
        } catch (err: any) {
            newMembersList[studentIndex] = { ...newMembersList[studentIndex], status: 'ERROR', error: err.message };
        }
        setMembers([...newMembersList]);
    }

    setIsGrading(false);
    onComplete(newMembersList);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Roster Initialization */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-4">
         <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" /> Phase 1: Roster Initialization
         </h3>
         
         <div className="flex items-end gap-4">
             <div className="flex-1 grid grid-cols-3 gap-4">
                 <div className="flex flex-col gap-1">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Surname</label>
                     <input type="text" value={newSurname} onChange={(e) => setNewSurname(e.target.value)} placeholder="e.g. Smith" disabled={isGrading} className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                 </div>
                 <div className="flex flex-col gap-1">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forename</label>
                     <input type="text" value={newForename} onChange={(e) => setNewForename(e.target.value)} placeholder="e.g. John" disabled={isGrading} className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                 </div>
                 <div className="flex flex-col gap-1">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preferred Name</label>
                     <input type="text" value={newPreferredName} onChange={(e) => setNewPreferredName(e.target.value)} placeholder="(Optional)" disabled={isGrading} className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
                 </div>
             </div>
             <button onClick={handleManualAdd} disabled={isGrading || (!newSurname.trim() && !newForename.trim())} className="px-6 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors disabled:opacity-50">
                 Add Student
             </button>
             
             <div className="pl-4 border-l border-slate-200 dark:border-slate-600 flex flex-col justify-end">
                 <input type="file" accept=".xlsx,.csv" className="hidden" ref={fileInputRef} onChange={handleExcelUpload} disabled={isGrading} />
                 <button onClick={() => fileInputRef.current?.click()} disabled={isGrading} className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-200 disabled:opacity-50">
                     <Upload className="w-4 h-4" /> Upload Roster
                 </button>
             </div>
         </div>
      </div>

      {/* Sequential File Attachment */}
      <div className="flex flex-col">
         <div className="flex items-center justify-between mb-4 mt-2">
             <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                 <FileText className="w-5 h-5 text-emerald-500" /> Phase 2: Sequential Attachment
             </h3>
             <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full">
                 {members.length} Students
             </span>
         </div>

         <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 flex flex-col shadow-sm max-h-[400px]">
             {members.length === 0 ? (
                 <div className="p-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                     <UserPlus className="w-12 h-12 mb-4 opacity-50" />
                     <p className="font-medium text-sm">No students added to the batch yet.</p>
                     <p className="text-xs">Add students manually or upload a roster to begin.</p>
                 </div>
             ) : (
                <div className="overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Surname</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Forename</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Status</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 w-48">Action</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMembers.map(m => (
                                <tr key={m.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                    <td className="px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200">{m.surname}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        {m.forename} {m.preferredName && <span className="text-slate-400 dark:text-slate-500 ml-1">({m.preferredName})</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        {m.status === 'MISSING' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-100 dark:border-red-900/30"><AlertCircle className="w-3 h-3" /> Missing File</span>}
                                        {m.status === 'READY' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/30"><CheckCircle2 className="w-3 h-3" /> Ready to Grade</span>}
                                        {m.status === 'GRADING' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-900/30"><Loader2 className="w-3 h-3 animate-spin" /> Grading</span>}
                                        {m.status === 'DONE' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Complete</span>}
                                        {m.status === 'ERROR' && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> Error</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${m.file ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'}`}>
                                            <input disabled={isGrading} type="file" accept=".pdf" className="hidden" onChange={(e) => handlePdfUpload(e, m.id)} />
                                            {m.file ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> <span className="truncate w-24 block text-left" title={m.file.name}>{m.file.name}</span></> : <><Upload className="w-3 h-3" /> Attach Draft</>}
                                        </label>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button disabled={isGrading} onClick={() => handleRemoveMember(m.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             )}
         </div>
      </div>

      {/* The Batch Engine */}
      <div className="flex items-center justify-between mt-4">
         <div className="flex flex-col">
             {isGrading && (
                 <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-2 rounded-lg text-blue-700 dark:text-blue-400 text-sm font-bold">
                     <Loader2 className="w-4 h-4 animate-spin" />
                     GRADING STUDENT {gradingProgress.current} OF {gradingProgress.total}...
                 </div>
             )}
         </div>
         <button 
             onClick={handleGradeClass} 
             disabled={!canGrade || isGrading}
             className="flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-sm tracking-wide transition-colors uppercase shadow-sm bg-[#7fc29b] hover:bg-[#6cba8d] text-slate-900 border border-[#7fc29b] disabled:bg-slate-200 disabled:dark:bg-slate-700 disabled:text-slate-400 disabled:dark:text-slate-500 disabled:border-transparent cursor-pointer disabled:cursor-not-allowed"
         >
             <PlayCircle className="w-5 h-5" /> Grade Class
         </button>
      </div>

    </div>
  );
}