import React, { useState, useEffect } from 'react';
import { FolderOpen, Moon, LogOut, FileText, Upload, Trash2, Sun, ChevronRight, Loader2, ChevronDown } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { StudentSubmission, loadDirectoryData } from '../db';
import ClassBatchTab from './ClassBatchTab';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface UploadViewProps {
  onUploadComplete: (text: string, title: string) => void;
  onCompareComplete: (cwk1: any, cwk2: any, title: string, cwk1Name: string, cwk2Name: string) => void;
  onClassBatchComplete?: (batchResults: any[]) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenDirectory: () => void;
  prefilledStudent?: StudentSubmission | null;
  onCancelPrefilled?: () => void;
}

export default function UploadView({ onUploadComplete, onCompareComplete, onClassBatchComplete, onLogout, isDarkMode, toggleDarkMode, onOpenDirectory, prefilledStudent, onCancelPrefilled }: UploadViewProps) {
  const [forename, setForename] = useState('');
  const [surname, setSurname] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [submissionType, setSubmissionType] = useState<'DRAFT' | 'FINAL'>('DRAFT');
  const [analysisMode, setAnalysisMode] = useState<'SINGLE' | 'COMPARE' | 'CLASS'>('SINGLE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [fileContent, setFileContent] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Directory Data
  const [directoryData, setDirectoryData] = useState<StudentSubmission[]>([]);
  useEffect(() => {
    const init = async () => {
      const data = await loadDirectoryData();
      setDirectoryData(data);
    };
    init();
  }, []);

  // CWK 1 State
  const [cwk1Method, setCwk1Method] = useState<'UPLOAD' | 'DIRECTORY'>('UPLOAD');
  const [cwk1Forename, setCwk1Forename] = useState('');
  const [cwk1Surname, setCwk1Surname] = useState('');
  const [cwk1PreferredName, setCwk1PreferredName] = useState('');
  const [cwk1File, setCwk1File] = useState<File | null>(null);
  const [cwk1FileContent, setCwk1FileContent] = useState('');
  const [cwk1IsCompressing, setCwk1IsCompressing] = useState(false);
  const [cwk1SelectedDirectoryStudent, setCwk1SelectedDirectoryStudent] = useState(''); // className|assignmentName|candidateName

  // CWK 2 State
  const [cwk2Method, setCwk2Method] = useState<'UPLOAD' | 'DIRECTORY'>('UPLOAD');
  const [cwk2Forename, setCwk2Forename] = useState('');
  const [cwk2Surname, setCwk2Surname] = useState('');
  const [cwk2PreferredName, setCwk2PreferredName] = useState('');
  const [cwk2File, setCwk2File] = useState<File | null>(null);
  const [cwk2FileContent, setCwk2FileContent] = useState('');
  const [cwk2IsCompressing, setCwk2IsCompressing] = useState(false);
  const [cwk2SelectedDirectoryStudent, setCwk2SelectedDirectoryStudent] = useState('');

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

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setCompressing: React.Dispatch<React.SetStateAction<boolean>>,
    setContent: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      if (file.size > 5 * 1024 * 1024) {
        setCompressing(true);
        try {
          const text = await extractTextFromPDF(file);
          setContent(text);
        } catch (err) {
          console.error("Failed to parse large PDF locally.", err);
          alert("Failed to read large PDF document. Proceeding with standard upload.");
          const reader = new FileReader();
          reader.onload = (ev) => { setContent(ev.target?.result as string); };
          reader.readAsDataURL(file);
        } finally {
          setCompressing(false);
        }
      } else {
         const reader = new FileReader();
         reader.onload = (ev) => { setContent(ev.target?.result as string); };
         reader.readAsDataURL(file);
      }
    }
  };

  const getDocPayload = (
    method: 'UPLOAD' | 'DIRECTORY',
    fileContent: string,
    selectedStudentKey: string
  ) => {
    if (method === 'UPLOAD') {
      return { type: 'text', content: fileContent };
    } else {
      const [cls, asn, cand] = selectedStudentKey.split('|');
      const student = directoryData.find(s => s.className === cls && s.assignmentName === asn && s.candidateName === cand);
      if (!student) return null;
      return { type: 'eval', content: student.finalEvaluation || student.draftEvaluation, name: student.candidateName };
    }
  };

  const handleExecute = () => {
    if (analysisMode === 'SINGLE') {
      const isPrefilledValid = prefilledStudent && selectedFile && !isCompressing;
      const isManualValid = !prefilledStudent && selectedFile && !isCompressing && forename.trim() && surname.trim() && preferredName.trim();
      if (isPrefilledValid || isManualValid) {
        const textToAnalyze = fileContent || "This is a simulated extraction of the uploaded coursework document...";
        const rawName = prefilledStudent ? prefilledStudent.candidateName : `${surname.trim()}, ${forename.trim()}${preferredName.trim() ? `, (${preferredName.trim()})` : ''}`;
        const docTitle = rawName.replace(/\s*-\s*(DRAFT|FINAL|Draft|Final)$/i, '');
        onUploadComplete(textToAnalyze, docTitle);
      }
    } else {
      // COMPARE mode
      const payload1 = getDocPayload(cwk1Method, cwk1FileContent, cwk1SelectedDirectoryStudent);
      const payload2 = getDocPayload(cwk2Method, cwk2FileContent, cwk2SelectedDirectoryStudent);
      if (payload1 && payload2) {
        
        let n1Info = "CWK 1";
        if (cwk1Method === 'UPLOAD') {
          n1Info = `${cwk1Surname.trim()}, ${cwk1Forename.trim()}`;
        } else {
          n1Info = cwk1SelectedDirectoryStudent.split('|')[2];
        }

        let n2Info = "CWK 2";
        if (cwk2Method === 'UPLOAD') {
          n2Info = `${cwk2Surname.trim()}, ${cwk2Forename.trim()}`;
        } else {
          n2Info = cwk2SelectedDirectoryStudent.split('|')[2];
        }

        const compTitle = `Comparing: ${n1Info} vs ${n2Info}`;
        onCompareComplete(payload1, payload2, compTitle, n1Info, n2Info);
      }
    }
  };

  // Helper check for disabled state
  const isSingleDisabled = Boolean((!prefilledStudent && (!selectedFile || isCompressing || !forename.trim() || !surname.trim() || !preferredName.trim())) || (prefilledStudent && (!selectedFile || isCompressing)));
  
  const isCwk1Ready = cwk1Method === 'DIRECTORY' ? Boolean(cwk1SelectedDirectoryStudent) : Boolean(cwk1File && !cwk1IsCompressing && cwk1Forename.trim() && cwk1Surname.trim() && cwk1PreferredName.trim());
  const isCwk2Ready = cwk2Method === 'DIRECTORY' ? Boolean(cwk2SelectedDirectoryStudent) : Boolean(cwk2File && !cwk2IsCompressing && cwk2Forename.trim() && cwk2Surname.trim() && cwk2PreferredName.trim());
  const isCompareDisabled = !(isCwk1Ready && isCwk2Ready);
  
  const isDisabled = analysisMode === 'SINGLE' ? isSingleDisabled : isCompareDisabled;

  return (
    <div className={`min-h-screen bg-[#f8f9fc] dark:bg-slate-900 flex flex-col font-sans transition-colors ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-20 px-8 flex items-center justify-between shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-2xl font-bold tracking-tight">IG</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[22px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-tight leading-tight">CWK QUALITY ASSURANCE</h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">GRADING & MODERATION SUITE</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={onOpenDirectory} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <FolderOpen className="w-4 h-4" />
          </button>
          <button onClick={toggleDarkMode} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={onLogout}
            className="h-10 px-4 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold text-xs"
          >
            EXIT
          </button>
          <div className="h-10 px-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 flex flex-col items-end justify-center ml-2">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-none">STANDARD</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">MAY 2026</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 flex justify-center">
        <div className="max-w-6xl w-full">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors">
            
            {/* Card Header */}
            <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500">
                <FileText className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">CWK UPLOAD ENTRY</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex border border-slate-200/60 dark:border-slate-600">
                  <button 
                    className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${analysisMode === 'SINGLE' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    onClick={() => { setAnalysisMode('SINGLE'); if(onCancelPrefilled) onCancelPrefilled(); }}
                  >
                    SINGLE ANALYSIS
                  </button>
                  <button 
                    className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${analysisMode === 'COMPARE' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    onClick={() => { setAnalysisMode('COMPARE'); if(onCancelPrefilled) onCancelPrefilled(); }}
                  >
                    COMPARE 2 CWKs
                  </button>
                  <button 
                    className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${analysisMode === 'CLASS' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    onClick={() => { setAnalysisMode('CLASS'); if(onCancelPrefilled) onCancelPrefilled(); }}
                  >
                    CLASS UPLOAD
                  </button>
                </div>
                
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-1.5 rounded-md text-[11px] font-bold tracking-widest border border-blue-200/50 dark:border-blue-800">
                  READY
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8">
              
              {analysisMode === 'SINGLE' && (
                <div>
                  {/* Form Row 1 */}
                  {!prefilledStudent ? (
                    <>
                      <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            FORENAME <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. Jane"
                            value={forename}
                            onChange={(e) => setForename(e.target.value)}
                            className="bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-500"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            SURNAME <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. Doe"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            className="bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-500"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            PREFERRED NAME <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. Janie"
                            value={preferredName}
                            onChange={(e) => setPreferredName(e.target.value)}
                            className="bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      {/* Form Row 2 */}
                      <div className="mb-10">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider block mb-2">
                          SUBMISSION TYPE
                        </label>
                        <div className="bg-slate-50 dark:bg-slate-700/30 p-1 rounded-xl flex border border-slate-200/60 dark:border-slate-700/60 w-fit">
                          <button 
                            className={`px-8 py-2.5 rounded-lg text-xs font-bold transition-all ${submissionType === 'DRAFT' ? 'bg-white dark:bg-slate-600 shadow border border-slate-200/50 dark:border-slate-500/50 text-blue-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            onClick={() => setSubmissionType('DRAFT')}
                          >
                            DRAFT
                          </button>
                          <button 
                            className={`px-8 py-2.5 rounded-lg text-xs font-bold transition-all ${submissionType === 'FINAL' ? 'bg-white dark:bg-slate-600 shadow border border-slate-200/50 dark:border-slate-500/50 text-blue-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            onClick={() => setSubmissionType('FINAL')}
                          >
                            FINAL
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-blue-600/70 dark:text-blue-400/70 tracking-widest uppercase mb-1">
                          FINAL CWK MODERATION FOR
                        </span>
                        <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                          {prefilledStudent.candidateName}
                        </span>
                      </div>
                      <button 
                        onClick={onCancelPrefilled}
                        className="text-xs font-bold px-4 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shadow-sm"
                      >
                        Cancel / New
                      </button>
                    </div>
                  )}

                  {/* Dropzone */}
                  {selectedFile ? (
                    <div className="relative border border-blue-400 dark:border-blue-500 rounded-2xl py-24 flex flex-col items-center justify-center bg-blue-50/20 dark:bg-blue-900/10 transition-all">
                      <button onClick={() => { setSelectedFile(null); setFileContent(''); }} className="absolute top-4 right-4 text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 bg-red-50/50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-full">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 p-4 rounded-2xl w-16 h-16 mb-4 flex items-center justify-center">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 truncate max-w-lg">{selectedFile.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      
                      {isCompressing && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold bg-blue-100/50 dark:bg-blue-900/30 px-4 py-2 rounded-lg isolate">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Compressing Document...
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl py-24 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800 hover:bg-blue-50/20 dark:hover:bg-blue-900/20 transition-all cursor-pointer group">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, setSelectedFile, setIsCompressing, setFileContent)}
                      />
                      <div className="bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 p-4 rounded-2xl w-16 h-16 mb-4 flex items-center justify-center transition-colors">
                        <Upload className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">Click to upload candidate CWK</h3>
                      <p className="text-slate-400 dark:text-slate-500 font-medium">Only PDF files are supported</p>
                    </label>
                  )}
                </div>
              )}

              {analysisMode === 'COMPARE' && (
                <div className="grid grid-cols-2 gap-6">
                  {/* CWK 1 Column */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">CWK 1</h2>
                      <div className="relative isolate w-48">
                        <select 
                          className="w-full appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none pr-8 cursor-pointer focus:border-blue-400"
                          value={cwk1Method}
                          onChange={(e) => setCwk1Method(e.target.value as any)}
                        >
                          <option value="UPLOAD">Upload New</option>
                          <option value="DIRECTORY">Select from Directory</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                      {cwk1Method === 'UPLOAD' ? (
                        <>
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 tracking-wider">FORENAME *</label>
                              <input type="text" value={cwk1Forename} onChange={(e) => setCwk1Forename(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm font-medium" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 tracking-wider">SURNAME *</label>
                              <input type="text" value={cwk1Surname} onChange={(e) => setCwk1Surname(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm font-medium" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 tracking-wider">PREFERRED NAME *</label>
                              <input type="text" value={cwk1PreferredName} onChange={(e) => setCwk1PreferredName(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm font-medium" />
                            </div>
                          </div>
                          
                          {cwk1File ? (
                            <div className="relative border border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                              <button onClick={() => { setCwk1File(null); setCwk1FileContent(''); }} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full"><Trash2 className="w-4 h-4" /></button>
                              <FileText className="w-6 h-6 text-slate-400 mb-2" />
                              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate w-full text-center">{cwk1File.name}</h3>
                            </div>
                          ) : (
                            <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800 cursor-pointer group">
                              <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e, setCwk1File, setCwk1IsCompressing, setCwk1FileContent)} />
                              <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                              <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">Click to upload PDF</span>
                            </label>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col gap-4 min-h-[300px]">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 tracking-wider">SELECT CANDIDATE</label>
                            <div className="relative isolate">
                              <select 
                                className="w-full appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none pr-8 cursor-pointer focus:border-blue-400"
                                value={cwk1SelectedDirectoryStudent}
                                onChange={(e) => setCwk1SelectedDirectoryStudent(e.target.value)}
                              >
                                <option value="">-- Choose Candidate --</option>
                                {directoryData.map(s => (
                                  <option key={`${s.className}|${s.assignmentName}|${s.candidateName}`} value={`${s.className}|${s.assignmentName}|${s.candidateName}`}>
                                    {s.className} - {s.assignmentName} - {s.candidateName}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CWK 2 Column */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">CWK 2</h2>
                      <div className="relative isolate w-48">
                        <select 
                          className="w-full appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none pr-8 cursor-pointer focus:border-blue-400"
                          value={cwk2Method}
                          onChange={(e) => setCwk2Method(e.target.value as any)}
                        >
                          <option value="UPLOAD">Upload New</option>
                          <option value="DIRECTORY">Select from Directory</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                      {cwk2Method === 'UPLOAD' ? (
                        <>
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 tracking-wider">FORENAME *</label>
                              <input type="text" value={cwk2Forename} onChange={(e) => setCwk2Forename(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm font-medium" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 tracking-wider">SURNAME *</label>
                              <input type="text" value={cwk2Surname} onChange={(e) => setCwk2Surname(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm font-medium" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 tracking-wider">PREFERRED NAME *</label>
                              <input type="text" value={cwk2PreferredName} onChange={(e) => setCwk2PreferredName(e.target.value)} className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm font-medium" />
                            </div>
                          </div>
                          
                          {cwk2File ? (
                            <div className="relative border border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                              <button onClick={() => { setCwk2File(null); setCwk2FileContent(''); }} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full"><Trash2 className="w-4 h-4" /></button>
                              <FileText className="w-6 h-6 text-slate-400 mb-2" />
                              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate w-full text-center">{cwk2File.name}</h3>
                            </div>
                          ) : (
                            <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800 cursor-pointer group">
                              <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e, setCwk2File, setCwk2IsCompressing, setCwk2FileContent)} />
                              <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                              <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">Click to upload PDF</span>
                            </label>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col gap-4 min-h-[300px]">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 tracking-wider">SELECT CANDIDATE</label>
                            <div className="relative isolate">
                              <select 
                                className="w-full appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none pr-8 cursor-pointer focus:border-blue-400"
                                value={cwk2SelectedDirectoryStudent}
                                onChange={(e) => setCwk2SelectedDirectoryStudent(e.target.value)}
                              >
                                <option value="">-- Choose Candidate --</option>
                                {directoryData.map(s => (
                                  <option key={`${s.className}|${s.assignmentName}|${s.candidateName}`} value={`${s.className}|${s.assignmentName}|${s.candidateName}`}>
                                    {s.className} - {s.assignmentName} - {s.candidateName}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {analysisMode === 'CLASS' && (
                <ClassBatchTab onComplete={(results) => onClassBatchComplete && onClassBatchComplete(results)} />
              )}

              {/* Action */}
              {analysisMode !== 'CLASS' && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleExecute}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-sm tracking-wide transition-colors uppercase shadow-sm ${
                      !isDisabled
                        ? (analysisMode === 'COMPARE' ? 'bg-[#7fc29b] hover:bg-[#6cba8d] text-slate-900 border border-[#7fc29b]' : 'bg-blue-600 hover:bg-blue-700 text-white') 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {analysisMode === 'COMPARE' ? 'Execute Comparison' : 'Execute Moderation'} <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
