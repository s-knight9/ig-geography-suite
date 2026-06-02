/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  Trophy, 
  Type as TypeIcon,
  Loader2,
  Trash2,
  FolderOpen,
  ArrowLeft,
  Moon,
  Sun,
  LogOut,
  FileCheck,
  X,
  FileDown,
  BookOpen,
  Users,
  Paperclip,
  Pencil,
  Download,
  Plus,
  Edit2
} from "lucide-react";
import { AnalysisResult, ComparativeResult, ClassFolder, CandidateRecord, AssignmentFolder, Subject, AnyResult } from "./types.ts";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
  writeBatch
} from "firebase/firestore";

import { ArchiveModal } from "./components/ArchiveModal";
import { DirectorySidebar } from "./components/DirectorySidebar";
import { DirectoryGallery } from "./components/DirectoryGallery";
import { BulkFinalUploadModal, BulkFinalItem } from "./components/BulkFinalUploadModal";
import { generateStudentReportPDF } from "./lib/pdfReport";

export type FeedbackItem = { id: number | string; text: string };

export function normalizeFeedback(feedback: any, criterionId?: string, type?: 'WWW' | 'EBI'): FeedbackItem[] {
  let arr: any[] = [];
  if (Array.isArray(feedback)) {
    arr = feedback;
  } else if (!feedback) {
    arr = [];
  } else if (typeof feedback === 'string') {
    arr = feedback.split('\n');
  }

  return arr.map((item, index) => {
    if (typeof item === 'object' && item !== null && 'id' in item && 'text' in item) {
       return item as FeedbackItem;
    }
    
    let clean = String(item).trim().replace(/^•\s*/, '');
    if (criterionId && type) {
      const sectionNum = type === 'WWW' ? '1' : '2';
      const prefixRegex = new RegExp(`^${criterionId}${sectionNum}\\.\\d+[\\s\\.\\:\\-\\\)]*`, 'i');
      clean = clean.replace(prefixRegex, '');
    }
    return { id: Date.now() + index, text: clean };
  });
}

const FeedbackItemRow = ({ 
  item, 
  index, 
  refCode, 
  isEditable, 
  updateItemText, 
  deleteItem 
}: { 
  item: FeedbackItem, 
  index: number, 
  refCode: string, 
  isEditable: boolean, 
  updateItemText: (index: number, val: string) => void, 
  deleteItem: (index: number) => void,
  key?: React.Key
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  React.useEffect(() => {
    adjustHeight();
  }, [item.text]);

  return (
    <div className="flex gap-2 items-start group">
      <span className="font-bold text-xs shrink-0 mt-0.5 text-slate-500 w-9 select-none">{refCode}</span>
      {isEditable ? (
        <textarea 
          ref={textareaRef}
          value={item.text} 
          onChange={e => updateItemText(index, e.target.value)}
          className="w-full bg-transparent resize-none outline-none border-b border-transparent hover:border-slate-300 focus:border-emerald-500 dark:focus:border-emerald-400 min-h-[22px] text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap leading-relaxed py-0 overflow-hidden"
          rows={1}
        />
      ) : (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed flex-1 whitespace-pre-wrap">
          {item.text}
        </span>
      )}
      {isEditable && (
        <button 
          type="button"
          title="Delete Point" 
          onClick={() => deleteItem(index)} 
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1 shrink-0 bg-red-50 dark:bg-red-500/10 rounded ml-2"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

const FeedbackList = ({ 
  items, 
  criterionId, 
  type, 
  isEditable, 
  onChange 
}: { 
  items: any, 
  criterionId: string, 
  type: 'WWW' | 'EBI', 
  isEditable: boolean, 
  onChange: (newItems: FeedbackItem[]) => void 
}) => {
  const sectionNum = type === 'WWW' ? '1' : '2';
  const [localItems, setLocalItems] = React.useState<FeedbackItem[]>(() => normalizeFeedback(items, criterionId, type));

  React.useEffect(() => {
    setLocalItems(normalizeFeedback(items, criterionId, type));
  }, [items, criterionId, type]);

  const updateItemText = (index: number, val: string) => {
    const newItems = [...localItems];
    newItems[index] = { ...newItems[index], text: val };
    setLocalItems(newItems);
    onChange(newItems);
  };

  const deleteItem = (index: number) => {
    const newItems = localItems.filter((_, i) => i !== index);
    setLocalItems(newItems);
    onChange(newItems);
  };

  const addItem = () => {
    const newItems = [...localItems, { id: Date.now(), text: '' }];
    setLocalItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="space-y-1 mt-3 relative">
      {localItems.map((item, index) => {
        const refCode = `${criterionId}${sectionNum}.${index + 1}`;
        return (
          <FeedbackItemRow 
            key={item.id}
            item={item}
            index={index}
            refCode={refCode}
            isEditable={isEditable}
            updateItemText={updateItemText}
            deleteItem={deleteItem}
          />
        );
      })}
      {isEditable && (
        <button onClick={addItem} className={`text-xs font-bold flex items-center gap-1 mt-3 ml-11 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors`}>
           <Plus size={12} /> Add Point
        </button>
      )}
    </div>
  );
};

export default function App({ 
  onBackToPortal, 
  activeUserEmail, 
  activeTeacherCode,
  isDark: propIsDark,
  toggleDark: propToggleDark
}: { 
  onBackToPortal?: () => void;
  activeUserEmail?: string;
  activeTeacherCode?: string;
  isDark?: boolean;
  toggleDark?: () => void;
}) {
  const [subject, setSubject] = useState<Subject>('Geography');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null); // Using any to avoid type complaints with ComparativeResult for now
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'upload' | 'result' | 'directory'>('upload');
  
  // Comparison state
  const [entryMode, setEntryMode] = useState<'single' | 'compare' | 'class'>('single');
  const [compareInputType1, setCompareInputType1] = useState<'upload' | 'directory'>('upload');
  const [compareInputType2, setCompareInputType2] = useState<'upload' | 'directory'>('upload');
  const [compareFile1, setCompareFile1] = useState<File | null>(null);
  const [compareFile2, setCompareFile2] = useState<File | null>(null);
  const [compareCand1, setCompareCand1] = useState<string>('');
  const [compareCand2, setCompareCand2] = useState<string>('');
  
  // Class Upload State
  const [classRoster, setClassRoster] = useState<{
    id: string;
    forename: string;
    surname: string;
    preferredName: string;
    file: File | null;
    status: 'missing' | 'ready' | 'processing' | 'done' | 'error';
    result?: AnyResult;
  }[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchCurrentStudent, setBatchCurrentStudent] = useState('');
  const [batchResultsIndex, setBatchResultsIndex] = useState(0);
  const [showBatchResults, setShowBatchResults] = useState(false);
  const rosterFileInputRef = useRef<HTMLInputElement>(null);
  const studentFileInputRef = useRef<HTMLInputElement>(null);
  const [activeRosterStudentId, setActiveRosterStudentId] = useState<string | null>(null);
  
  const [initialSubmissionType, setInitialSubmissionType] = useState<'Draft' | 'Final'>('Draft');

  const [studentForename, setStudentForename] = useState("");
  const [studentSurname, setStudentSurname] = useState("");
  const [studentPreferredName, setStudentPreferredName] = useState("");
  const [studentForename1, setStudentForename1] = useState("");
  const [studentSurname1, setStudentSurname1] = useState("");
  const [studentPreferredName1, setStudentPreferredName1] = useState("");
  const [studentForename2, setStudentForename2] = useState("");
  const [studentSurname2, setStudentSurname2] = useState("");
  const [studentPreferredName2, setStudentPreferredName2] = useState("");
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveStep, setSaveStep] = useState(1);
  const [showBulkFinalModal, setShowBulkFinalModal] = useState(false);
  const [bulkFinalProgress, setBulkFinalProgress] = useState(0);
  const [isBulkFinalProcessing, setIsBulkFinalProcessing] = useState(false);
  const [saveOptions, setSaveOptions] = useState<{ entryName: string; classId: string; assignmentId: string; submissionType: 'Draft' | 'Final' }>({
    entryName: "",
    classId: "",
    assignmentId: "",
    submissionType: 'Draft'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const isAuthenticated = true;
  const [teacherCodeState, setTeacherCodeState] = useState(activeTeacherCode || "SKN");
  const teacherCode = teacherCodeState;
  const setTeacherCode = setTeacherCodeState;
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [localIsDark, setLocalIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const isDark = propIsDark !== undefined ? propIsDark : localIsDark;

  const handleAuth = () => {
    // Already authenticated through portal
  };

  const handleLogout = () => {
    if (onBackToPortal) onBackToPortal();
  };

  // Real-time synchronization from Firestore
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAllData = async () => {
      const classesRef = collection(db, "classes");
      const unsubscribeClasses = onSnapshot(classesRef, async (classesSnapshot) => {
        const classFolders: ClassFolder[] = [];
        
        for (const classDoc of classesSnapshot.docs) {
          const classData = classDoc.data();
          const assignmentsRef = collection(db, "classes", classDoc.id, "assignments");
          const assignmentsSnapshot = await getDocs(assignmentsRef);
          
          const assignments: AssignmentFolder[] = [];
          for (const asgnDoc of assignmentsSnapshot.docs) {
            const asgnData = asgnDoc.data();
            const candidatesRef = collection(db, "classes", classDoc.id, "assignments", asgnDoc.id, "candidates");
            const candidatesSnapshot = await getDocs(candidatesRef);
            
            const candidates = candidatesSnapshot.docs.map(candDoc => candDoc.data() as CandidateRecord);
            assignments.push({
              id: asgnDoc.id,
              name: asgnData.name,
              candidates: candidates
            });
          }
          
          classFolders.push({
            id: classDoc.id,
            name: classData.name,
            assignments: assignments
          });
        }
        setClasses(classFolders);
      });

      return () => unsubscribeClasses();
    };

    fetchAllData();
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = () => {
    if (propToggleDark) {
      propToggleDark();
    } else {
      const nextDark = !localIsDark;
      setLocalIsDark(nextDark);
      localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    }
  };

  const [classes, setClasses] = useState<ClassFolder[]>([]);

  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
  const [scoreSaveStatus, setScoreSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isProgressAnalysis, setIsProgressAnalysis] = useState<boolean>(false);

  const isUploadDisabled = entryMode === 'single'
    ? (!file || !studentForename.trim() || !studentSurname.trim())
    : entryMode === 'class'
      ? (!classRoster.some(s => s.file && s.status === 'ready'))
      : (
          (compareInputType1 === 'upload' ? (!compareFile1 || !studentForename1.trim() || !studentSurname1.trim()) : !compareCand1) ||
          (compareInputType2 === 'upload' ? (!compareFile2 || !studentForename2.trim() || !studentSurname2.trim()) : !compareCand2)
        );

  const isExecuteDisabled = isUploadDisabled || isAnalyzing;

  const handleCreateClass = async (name: string) => {
    const id = crypto.randomUUID();
    const newClass: ClassFolder = { id, name, assignments: [] };
    
    try {
      await setDoc(doc(db, "classes", id), { id, name });
      // Local state will update via onSnapshot
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `classes/${id}`);
    }
  };

  const handleEditClass = async (id: string, newName: string) => {
    try {
      await updateDoc(doc(db, "classes", id), { name: newName });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `classes/${id}`);
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      // Note: This doesn't recursively delete subcollections in Firestore
      // In a real app we might want to clean up subcollections, but for simplicity
      // we delete the class doc.
      await deleteDoc(doc(db, "classes", id));
      if (activeAssignmentId) {
         const wasInClass = classes.find(c => c.id === id)?.assignments.some(a => a.id === activeAssignmentId);
         if (wasInClass) setActiveAssignmentId(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `classes/${id}`);
    }
  };

  const handleCreateAssignment = async (classId: string, name: string) => {
    const id = crypto.randomUUID();
    try {
      await setDoc(doc(db, "classes", classId, "assignments", id), { id, name });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `classes/${classId}/assignments/${id}`);
    }
  };

  const handleEditAssignment = async (classId: string, assignmentId: string, newName: string) => {
    try {
      await updateDoc(doc(db, "classes", classId, "assignments", assignmentId), { name: newName });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `classes/${classId}/assignments/${assignmentId}`);
    }
  };

  const handleDeleteAssignment = async (classId: string, assignmentId: string) => {
    try {
      await deleteDoc(doc(db, "classes", classId, "assignments", assignmentId));
      if (activeAssignmentId === assignmentId) {
        setActiveAssignmentId(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `classes/${classId}/assignments/${assignmentId}`);
    }
  };

  const handleSaveInit = () => {
    if (result?.isComparison) {
      setSaveOptions({
        entryName: `Comparison: ${result.fileName1} vs ${result.fileName2}`,
        classId: "Moderation",
        assignmentId: "Comparison",
        submissionType: 'Final'
      });
    } else {
      let defaultName = (studentForename || studentSurname) 
        ? `${studentSurname}, ${studentForename}${studentPreferredName ? ` (${studentPreferredName})` : ''}`
        : result?.fileName?.replace(/\.[^/.]+$/, "") || "Student_Name";
      setSaveOptions({
        entryName: defaultName,
        classId: "",
        assignmentId: "",
        submissionType: initialSubmissionType
      });
    }
    setSaveStep(1);
    setShowSaveModal(true);
  };

  const performSave = async () => {
    if (!result) return;
    
    try {
      const batch = writeBatch(db);
      
      let classId = saveOptions.classId;
      let assignmentId = saveOptions.assignmentId;

      // Ensure class folder exists
      const classDocRef = doc(db, "classes", classId);
      // We don't strictly need to create the class doc if it's already in state, 
      // but let's ensure it's there.
      batch.set(classDocRef, { id: classId, name: saveOptions.classId }, { merge: true });

      // Ensure assignment folder exists
      const assignmentDocRef = doc(db, "classes", classId, "assignments", assignmentId);
      batch.set(assignmentDocRef, { id: assignmentId, name: saveOptions.assignmentId || "General" }, { merge: true });

      if (showBatchResults) {
          // Save all finished class roster results
          for (const student of classRoster) {
              if (student.status === 'done' && student.result) {
                  const baseScore = student.result.isComparison 
                    ? (((student.result as ComparativeResult).totalScore1) || 0) 
                    : (((student.result as AnalysisResult).totalScore) || 0);
                  const modScore = student.result.moderatedScore !== undefined ? student.result.moderatedScore : baseScore;
                  const candId = crypto.randomUUID();
                  const candidateRecord: CandidateRecord = {
                     id: candId,
                     studentName: `${student.surname}, ${student.forename}${student.preferredName ? ` (${student.preferredName})` : ''}`,
                     date: new Date().toISOString(),
                     score: modScore,
                     iaqa_score: baseScore,
                     moderated_score: modScore,
                     report: student.result,
                     submissionType: saveOptions.submissionType,
                     subject: student.result.subject || subject,
                  };
                  const candDocRef = doc(db, "classes", classId, "assignments", assignmentId, "candidates", candId);
                  batch.set(candDocRef, candidateRecord);
              }
          }
          
          // Reset class roster UI
          setClassRoster([]);
          setShowBatchResults(false);
          setEntryMode('single');
      } else {
          // Single result save logic
          const baseScore = result.isComparison ? (result.totalScore1 || 0) : (result.totalScore || 0);
          const modScore = result.moderatedScore !== undefined ? result.moderatedScore : baseScore;
          const candId = crypto.randomUUID();

          const candidateRecord: CandidateRecord = {
            id: candId,
            studentName: saveOptions.entryName,
            date: new Date().toISOString(),
            score: modScore,
            iaqa_score: baseScore,
            moderated_score: modScore,
            report: result,
            submissionType: saveOptions.submissionType,
            subject: result.subject || subject,
          };
          
          const candDocRef = doc(db, "classes", classId, "assignments", assignmentId, "candidates", candId);
          batch.set(candDocRef, candidateRecord);
          setActiveCandidateId(candId);
      }

      await batch.commit();

      setShowSaveModal(false);
      setViewMode('directory');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `classes/${saveOptions.classId}`);
    }
  };

  const handleFeedbackChange = (criterionId: string, type: 'WWW' | 'EBI', newItems: FeedbackItem[]) => {
    if (result?.isComparison) return;

    const updatedCriteria = result.criteria.map((c: any) => {
      if (c.id === criterionId) {
        if (type === 'WWW') return { ...c, www: newItems };
        if (type === 'EBI') return { ...c, ebi: newItems };
      }
      return c;
    });
    const newResult = { ...result, criteria: updatedCriteria };
    
    setResult(newResult);

    if (showBatchResults && batchResultsIndex !== undefined && batchResultsIndex !== null) {
       setClassRoster(currentRoster => {
           const newRoster = [...currentRoster];
           const processed = currentRoster.filter(s => s.result);
           if (processed[batchResultsIndex]) {
               const targetId = processed[batchResultsIndex].id;
               const actualIndex = currentRoster.findIndex(s => s.id === targetId);
               if (actualIndex !== -1) {
                   newRoster[actualIndex] = { ...newRoster[actualIndex], result: newResult };
               }
           }
           return newRoster;
       });
    }

    if (activeCandidateId) {
      updateCandidateInFirestore(activeCandidateId, { report: newResult });
    }
  };

  const updateCandidateInFirestore = async (candidateId: string, updates: any) => {
    for (const cls of classes) {
      for (const asgn of cls.assignments) {
        const cand = asgn.candidates.find(c => c.id === candidateId);
        if (cand) {
          try {
            await updateDoc(doc(db, "classes", cls.id, "assignments", asgn.id, "candidates", candidateId), updates);
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `classes/${cls.id}/assignments/${asgn.id}/candidates/${candidateId}`);
          }
          return;
        }
      }
    }
  };

  const handleUpdateCriterionScore = (criterionId: string, newScore: number) => {
    setScoreSaveStatus("saving");
    
    if (result.isComparison) {
      const updatedCriteria = result.criteriaComparison.map((c: any) => {
        if (c.id === criterionId) {
          return { ...c, teacherScore2: newScore };
        }
        return c;
      });

      const newModeratedScore = updatedCriteria.reduce((sum: number, c: any) => sum + (c.teacherScore2 !== undefined ? c.teacherScore2 : c.score2), 0);
      const newResult = { ...result, criteriaComparison: updatedCriteria, moderatedScore2: newModeratedScore };

      setResult(newResult);

      if (activeCandidateId) {
        updateCandidateInFirestore(activeCandidateId, { 
          moderated_score: newModeratedScore,
          report: newResult
        });
      }

      setTimeout(() => {
        setScoreSaveStatus("saved");
        setTimeout(() => setScoreSaveStatus("idle"), 2000);
      }, 500);
      return;
    }
    
    const updatedCriteria = result.criteria.map((c: any) => {
      if (c.id === criterionId) {
        return { ...c, teacherScore: newScore };
      }
      return c;
    });

    const newModeratedScore = updatedCriteria.reduce((sum: number, c: any) => sum + (c.teacherScore !== undefined ? c.teacherScore : c.score), 0);
    const newResult = { ...result, criteria: updatedCriteria, moderatedScore: newModeratedScore };

    setResult(newResult);

    if (showBatchResults && batchResultsIndex !== undefined && batchResultsIndex !== null) {
       setClassRoster(currentRoster => {
           const newRoster = [...currentRoster];
           const processed = currentRoster.filter(s => s.result);
           if (processed[batchResultsIndex]) {
               const targetId = processed[batchResultsIndex].id;
               const actualIndex = currentRoster.findIndex(s => s.id === targetId);
               if (actualIndex !== -1) {
                   newRoster[actualIndex] = { ...newRoster[actualIndex], result: newResult };
               }
           }
           return newRoster;
       });
    }

    if (activeCandidateId) {
      updateCandidateInFirestore(activeCandidateId, {
        moderated_score: newModeratedScore,
        report: newResult
      });
    }

    setTimeout(() => {
      setScoreSaveStatus("saved");
      setTimeout(() => setScoreSaveStatus("idle"), 2000);
    }, 500);
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const reset = () => {
    setFile(null);
    setCompareFile1(null);
    setCompareFile2(null);
    setResult(null);
    setError(null);
    setActiveCandidateId(null);
    setViewMode('upload');
    setStudentForename("");
    setStudentSurname("");
    setStudentPreferredName("");
    setStudentForename1("");
    setStudentSurname1("");
    setStudentPreferredName1("");
    setStudentForename2("");
    setStudentSurname2("");
    setStudentPreferredName2("");
    setIsProgressAnalysis(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (fileInputRef1.current) fileInputRef1.current.value = "";
    if (fileInputRef2.current) fileInputRef2.current.value = "";
  };

  const extractTextFromFile = async (f: File) => {
    const arrayBuffer = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let extractedText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        extractedText += pageText + "\n";
    }
    if (!extractedText.trim()) {
        throw new Error("Could not extract any text from the document. It might be scanned or empty.");
    }
    return extractedText;
  };

  const handleRosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const workbook = new ExcelJS.Workbook();
      
      // Basic CSV support if file ends with .csv
      if (file.name.toLowerCase().endsWith('.csv')) {
        await workbook.csv.read(file.stream() as any);
      } else {
        await workbook.xlsx.load(await file.arrayBuffer());
      }
      
      const worksheet = workbook.worksheets[0];
      
      const newStudents: any[] = [];
      let surnameCol = -1;
      let forenameCol = -1;
      let preferredCol = -1;
      let headerRow = -1;

      worksheet.eachRow((row, rowNumber) => {
        if (headerRow === -1) {
          row.eachCell((cell, colNumber) => {
            const val = (cell.text || cell.value?.toString() || '').toLowerCase().trim();
            if (val.includes('surname')) surnameCol = colNumber;
            else if (val.includes('forename')) forenameCol = colNumber;
            else if (val.includes('preferred')) preferredCol = colNumber;
          });
          if (surnameCol !== -1 && forenameCol !== -1) {
            headerRow = rowNumber;
          }
        } else {
          const surname = surnameCol !== -1 ? (row.getCell(surnameCol).text || row.getCell(surnameCol).value?.toString() || '').trim() : '';
          const forename = forenameCol !== -1 ? (row.getCell(forenameCol).text || row.getCell(forenameCol).value?.toString() || '').trim() : '';
          const preferredName = preferredCol !== -1 ? (row.getCell(preferredCol).text || row.getCell(preferredCol).value?.toString() || '').trim() : '';

          if (surname || forename) {
            newStudents.push({
              id: crypto.randomUUID(),
              surname,
              forename,
              preferredName,
              file: null,
              status: 'missing'
            });
          }
        }
      });
      
      setClassRoster(prev => [...prev, ...newStudents].sort((a, b) => a.surname.localeCompare(b.surname)));
    } catch (err: any) {
      console.error(err);
      setError("Failed to parse roster file. Ensure it's a valid Excel file.");
    } finally {
      if (rosterFileInputRef.current) rosterFileInputRef.current.value = '';
    }
  };

  const handleClassRosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeRosterStudentId) return;

    setClassRoster(prev => prev.map(s => {
      if (s.id === activeRosterStudentId) {
        return { ...s, file, status: 'ready' };
      }
      return s;
    }));
    setActiveRosterStudentId(null);
    if (studentFileInputRef.current) studentFileInputRef.current.value = '';
  };

  const addManualStudent = () => {
    const newStudent = {
      id: crypto.randomUUID(),
      surname: '',
      forename: '',
      preferredName: '',
      file: null,
      status: 'missing' as const
    };
    setClassRoster(prev => [newStudent, ...prev]);
  };

  const executeBatchAnalysis = async () => {
    const studentsToProcess = classRoster.filter(s => s.file && (s.status === 'ready' || s.status === 'processing' || s.status === 'error'));
    
    if (studentsToProcess.length === 0) return;

    setIsBatchProcessing(true);
    setBatchProgress(0);
    setError(null);
    
    let completed = 0;
    const updatedRoster = [...classRoster];

    for (let i = 0; i < updatedRoster.length; i++) {
        const student = updatedRoster[i];
        if (!student.file || student.status === 'missing' || student.status === 'done') continue;
        
        setBatchCurrentStudent(`${student.surname}, ${student.forename}${student.preferredName ? ` (${student.preferredName})` : ''}`);
        
        // Mark as processing
        updatedRoster[i].status = 'processing';
        setClassRoster([...updatedRoster]);
        
        try {
            const extractedText = await extractTextFromFile(student.file);
            const response = await fetch("/api/analyze-ia-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: extractedText, subject }),
            });

            if (!response.ok) {
                throw new Error("Failed to analyze IA for " + student.surname);
            }
            const data = await response.json();
            
            updatedRoster[i].status = 'done';
            updatedRoster[i].result = { ...data, fileName: student.file!.name, rawText: extractedText };
        } catch (err: any) {
            console.error(err);
            // Revert back so they can try again, or mark error
            updatedRoster[i].status = 'missing';
        }
        
        completed++;
        setBatchProgress(Math.round((completed / studentsToProcess.length) * 100));
        setClassRoster([...updatedRoster]);
    }
    
    setIsBatchProcessing(false);
    setBatchResultsIndex(0);
    const firstResult = updatedRoster.find(s => s.result)?.result;
    if (firstResult) {
       setResult(firstResult);
    }
    setShowBatchResults(true);
    setViewMode('result');
  };

  const handleBulkFinalCommitAll = async (items: BulkFinalItem[]) => {
    try {
      const batch = writeBatch(db);
      
      for (const item of items) {
        if (item.status === 'done' && item.result) {
          // find candidate path
          let found = false;
          for (const cls of classes) {
            for (const asgn of cls.assignments) {
              const cand = asgn.candidates.find(c => c.id === item.candidate.id);
              if (cand) {
                const baseScore = item.result.isComparison ? ((item.result as any).totalScore1 || 0) : (item.result.totalScore || 0);
                const modScore = item.result.moderatedScore !== undefined ? item.result.moderatedScore : baseScore;
                
                const updatedCand = {
                  ...cand,
                  submissionType: 'Final',
                  score: modScore,
                  moderated_score: modScore,
                  report: item.result, 
                  draftRecord: { ...cand }, // archive the draft in candidate
                  subject: item.result.subject || cand.subject || subject,
                };
                
                const candDocRef = doc(db, "classes", cls.id, "assignments", asgn.id, "candidates", cand.id);
                batch.update(candDocRef, updatedCand);
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }
      }

      await batch.commit();
      setShowBulkFinalModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "bulk-final-commit");
    }
  };

  const handleBulkFinalProcessItem = async (candidate: CandidateRecord, file: File): Promise<AnalysisResult> => {
    const text = await extractTextFromFile(file);
    
    const response = await fetch("/api/analyze-ia-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, subject }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze Final IA for ${candidate.studentName}`);
    }

    const data = await response.json();
    return {
      ...data,
      isComparison: false,
      fileName: file.name,
      rawText: text
    };
  };

  const allCandidates = classes.flatMap(c => c.assignments).flatMap(a => a.candidates).sort((a, b) => a.studentName.localeCompare(b.studentName));

  const analyzeIA = async () => {
    if (entryMode === 'compare') {
      await analyzeCompare();
      return;
    }

    if (entryMode === 'class') {
      await executeBatchAnalysis();
      return;
    }

    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const extractedText = await extractTextFromFile(file);

      const response = await fetch("/api/analyze-ia-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: extractedText, subject }),
      });

      if (!response.ok) {
        let msg = "Failed to analyze IA";
        try {
          const errorData = await response.json();
          msg = errorData.error || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }

      const data = await response.json();
      data.id = crypto.randomUUID();
      data.fileName = file.name;
      data.timestamp = Date.now();
      data.rawText = extractedText;
      setResult(data);
      setViewMode('result');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeCompare = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      let text1 = "";
      let text2 = "";
      let name1 = "Student 1";
      let name2 = "Student 2";

      if (compareInputType1 === 'upload' && compareFile1) {
        text1 = await extractTextFromFile(compareFile1);
        name1 = (studentForename1 || studentSurname1) 
          ? `${studentSurname1}, ${studentForename1}${studentPreferredName1 ? ` (${studentPreferredName1})` : ''}`
          : compareFile1.name;
      } else if (compareInputType1 === 'directory' && compareCand1) {
        const c = allCandidates.find(c => c.id === compareCand1);
        if (c && c.report.rawText) {
          text1 = c.report.rawText;
          name1 = c.studentName;
        }
      }

      if (compareInputType2 === 'upload' && compareFile2) {
        text2 = await extractTextFromFile(compareFile2);
        name2 = (studentForename2 || studentSurname2)
          ? `${studentSurname2}, ${studentForename2}${studentPreferredName2 ? ` (${studentPreferredName2})` : ''}`
          : compareFile2.name;
      } else if (compareInputType2 === 'directory' && compareCand2) {
        const c = allCandidates.find(c => c.id === compareCand2);
        if (c && c.report.rawText) {
          text2 = c.report.rawText;
          name2 = c.studentName;
        }
      }

      if (!text1 || !text2) {
        throw new Error("Both sides must have valid content (either a PDF or a previously saved valid IA)");
      }

      const response = await fetch("/api/compare-ias-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text1, 
          text2,
          mode: isProgressAnalysis ? 'progress' : 'standard',
          subject
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to compare IAs");
      }

      const data = await response.json();
      data.isComparison = true;
      data.fileName1 = name1;
      data.fileName2 = name2;
      data.timestamp = Date.now();
      
      // Override the AI-generated comparison scores with existing Teacher/IAQA scores
      // IF the candidates are from the directory.
      if (compareInputType1 === 'directory' && compareCand1) {
        const orig1 = allCandidates.find(c => c.id === compareCand1);
        if (orig1) {
          data.totalScore1 = orig1.moderated_score !== undefined ? orig1.moderated_score : orig1.score;
          if (data.criteriaComparison && orig1.report && !orig1.report.isComparison && (orig1.report as AnalysisResult).criteria) {
             data.criteriaComparison.forEach((c: any) => {
                const oc = (orig1.report as AnalysisResult).criteria.find((x: any) => x.id === c.id);
                if (oc) {
                  c.score1 = oc.teacherScore !== undefined ? oc.teacherScore : oc.score;
                }
             });
          }
        }
      }
      if (compareInputType2 === 'directory' && compareCand2) {
        const orig2 = allCandidates.find(c => c.id === compareCand2);
        if (orig2) {
          data.totalScore2 = orig2.moderated_score !== undefined ? orig2.moderated_score : orig2.score;
          if (data.criteriaComparison && orig2.report && !orig2.report.isComparison && (orig2.report as AnalysisResult).criteria) {
             data.criteriaComparison.forEach((c: any) => {
                const oc = (orig2.report as AnalysisResult).criteria.find((x: any) => x.id === c.id);
                if (oc) {
                  c.score2 = oc.teacherScore !== undefined ? oc.teacherScore : oc.score;
                }
             });
          }
        }
      }

      setResult(data);
      setViewMode('result');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during comparison");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result || !result.isComparison) return;
    
    // We can assume result.isComparison is true here.
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 6;
    let y = 15;

    // --- Header Section ---
    // Emerald banner top
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('DP IA QUALITY ASSURANCE', margin, 17);
    
    y = 35;
    
    // Report Title
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Submission Comparison / Moderation Report', margin, y);
    y += 12;

    const maxPossible = result.subject === 'ESS' ? 30 : 25;
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        
        // Minor header on new page
        doc.setFillColor(16, 185, 129);
        doc.rect(0, 0, pageWidth, 6, 'F');
        y = 15;
      }
    };

    // Submissions
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`IA 1: ${result.fileName1}`, margin, y);
    doc.setFont('helvetica', 'normal');
    const score1Text = `Score: ${result.totalScore1}/25`;
    doc.text(score1Text, pageWidth - margin - doc.getTextWidth(score1Text), y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text(`IA 2: ${result.fileName2}`, margin, y);
    doc.setFont('helvetica', 'normal');
    const score2Text = `Score: ${result.totalScore2}/25`;
    doc.text(score2Text, pageWidth - margin - doc.getTextWidth(score2Text), y);
    y += 12;

    // Moderation Note
    if (result.moderationNote) {
      checkPageBreak(30);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, maxWidth, 20, 2, 2, 'FD');
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Moderator Note:', margin + 5, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const noteLines = doc.splitTextToSize(result.moderationNote, maxWidth - 10);
      doc.text(noteLines, margin + 5, y);
      y += (noteLines.length * lineHeight) + 8;
    }

    // Similarities Report
    if (result.academicIntegrity?.analysis) {
      checkPageBreak(30);
      doc.setFillColor(255, 251, 235); // amber-50
      doc.setDrawColor(253, 230, 138); // amber-200
      doc.roundedRect(margin, y, maxWidth, 20, 2, 2, 'FD');
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text('Similarities Report (Academic Integrity)', margin + 5, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(146, 64, 14); // amber-900
      const analysisLines = doc.splitTextToSize(result.academicIntegrity.analysis, maxWidth - 10);
      doc.text(analysisLines, margin + 5, y);
      y += (analysisLines.length * lineHeight) + 8;
    }

    // Criteria Comparison
    if (result.criteriaComparison) {
      result.criteriaComparison.forEach((c: any) => {
        checkPageBreak(50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`Criterion ${c.id}: ${c.name}`, margin, y);
        y += 8;

        // Side by side box for www & ebi
        const colWidth = (maxWidth - 4) / 2;
        
        doc.setFontSize(9);
        // Column 1
        doc.setFillColor(236, 253, 245); // emerald-50
        doc.setDrawColor(167, 243, 208); // emerald-200
        doc.roundedRect(margin, y, colWidth, 10, 2, 2, 'FD');
        doc.setTextColor(6, 95, 70); // emerald-800
        doc.setFont('helvetica', 'bold');
        doc.text('IA 1 Review', margin + 2, y + 6);
        
        // Column 2
        doc.setFillColor(239, 246, 255); // blue-50
        doc.setDrawColor(191, 219, 254); // blue-200
        doc.roundedRect(margin + colWidth + 4, y, colWidth, 10, 2, 2, 'FD');
        doc.setTextColor(30, 58, 138); // blue-800
        doc.setFont('helvetica', 'bold');
        doc.text('IA 2 Review', margin + colWidth + 6, y + 6);
        
        y += 14;
        
        const formatList = (title: string, list: any, cId: string, type: 'WWW'|'EBI') => {
          const sectionNum = type === 'WWW' ? '1' : '2';
          const arr = Array.isArray(list) ? list : list ? list.split('\n').map((s: string) => s.trim().replace(/^•\s*/, '')).filter(Boolean) : [];
          if (arr.length === 0) return '';
          const numbered = arr.map((item, i) => `${cId}${sectionNum}.${i+1} ${item}`);
          return `${title}:\n` + numbered.join('\n');
        };

        const review1 = [formatList('1) What Went Well (WWW)', c.www1, c.id, 'WWW'), formatList('2) Even Better if (EBI)', c.ebi1, c.id, 'EBI')].filter(Boolean).join('\n\n');
        const review2 = [formatList('1) What Went Well (WWW)', c.www2, c.id, 'WWW'), formatList('2) Even Better if (EBI)', c.ebi2, c.id, 'EBI')].filter(Boolean).join('\n\n');

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        
        const lines1 = doc.splitTextToSize(review1, colWidth);
        const lines2 = doc.splitTextToSize(review2, colWidth);
        
        const maxLines = Math.max(lines1.length, lines2.length);
        
        doc.text(lines1, margin, y);
        doc.text(lines2, margin + colWidth + 4, y);
        
        y += maxLines * lineHeight + 8;
      });
    }

    doc.save(`Comparison_Report_${result.fileName1}_vs_${result.fileName2}.pdf`);
  };

  const handleUploadFinal = (candidate: CandidateRecord) => {
    // Navigate to upload view in compare mode
    setViewMode('upload');
    setEntryMode('compare');
    setCompareInputType1('directory');
    setCompareInputType2('upload');
    setCompareCand1(candidate.id);
    setIsProgressAnalysis(true);
    
    // Autofill details based on the draft
    const names = candidate.studentName.split(',');
    if (names.length >= 2) {
      setStudentSurname2(names[0].trim());
      setStudentForename2(names[1].trim());
      const prefNameMatch = names[2]?.match(/\(([^)]+)\)/);
      if (prefNameMatch) {
         setStudentPreferredName2(prefNameMatch[1].trim());
      } else if (names[2]) {
         setStudentPreferredName2(names[2].trim());
      }
    }

    setCompareFile2(null);

    // After state updates render the new components, trigger the file input
    setTimeout(() => {
        if (fileInputRef2.current) {
            fileInputRef2.current.click();
        }
    }, 150);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300 bg-[#F8FAFC] dark:bg-slate-900 dark:border-slate-800">
        <div className="rounded-xl shadow-sm border p-10 w-full max-w-sm flex flex-col items-center transition-colors duration-300 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-sm mb-4">
            <span className="text-white font-black text-3xl tracking-tighter">DP</span>
          </div>
          <h2 className="text-[22px] font-black tracking-tight mb-1 text-slate-900 dark:text-white text-center">IA Quality Assurance Portal</h2>
          <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-8">Enter Teacher Credentials</p>

          <input 
            type="text" 
            placeholder="ENTER TEACHER CODE" 
            value={teacherCode}
            onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            className="w-full text-center py-3.5 border rounded-md font-medium tracking-wide outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all mb-4 bg-white border-emerald-500 text-slate-700 placeholder-slate-400 dark:bg-slate-900 dark:border-emerald-500/50 dark:text-white dark:placeholder-slate-600"
          />

          <input 
            type="password" 
            placeholder="ENTER PASSWORD" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            className="w-full text-center py-3.5 border rounded-md font-medium tracking-wide outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all mb-4 bg-white border-emerald-500 text-slate-700 placeholder-slate-400 dark:bg-slate-900 dark:border-emerald-500/50 dark:text-white dark:placeholder-slate-600"
          />
          
          <button 
            onClick={handleAuth}
            className="w-full bg-emerald-500 text-white font-bold tracking-wide uppercase text-sm py-3.5 rounded-md hover:bg-emerald-600 transition-colors"
          >
            Login
          </button>
          
          <div className="h-4 mt-4">
            {authError && <p className="text-red-500 text-xs font-medium">{authError}</p>}
          </div>

          <button 
            onClick={toggleDark}
            className="mt-6 p-2 rounded-full absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-2xl tracking-tighter">DP</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-emerald-500 tracking-tight leading-none uppercase">
              IA QUALITY ASSURANCE
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">
              Grading & Moderation Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMode(viewMode === 'directory' ? (result ? 'result' : 'upload') : 'directory')}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${viewMode === 'directory' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            <FolderOpen size={18} />
          </button>
          <button 
            onClick={toggleDark}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-full border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <span className="text-[10px] font-bold">EXIT</span>
          </button>
          <div className="ml-2 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 flex flex-col items-center bg-slate-50 dark:bg-slate-900">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Standard</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">MAY 2026</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
        {viewMode === 'directory' ? (
          <div className="flex flex-col w-full h-full absolute inset-0 text-left bg-white dark:bg-slate-900 z-40">
            {/* Subheader */}
            <div className="flex items-center h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
               {/* Back Button */}
               <button 
                  onClick={() => setViewMode(result ? 'result' : 'upload')} 
                  className="flex items-center font-bold px-6 h-full border-r border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider"
                >
                  <ArrowLeft className="mr-2" size={16} /> BACK TO EXAMINER
               </button>
               <div className="flex items-center px-6 text-slate-800 dark:text-slate-100 font-extrabold text-lg tracking-tight">
                  <FolderOpen className="mr-3 text-emerald-500" size={22} /> TEACHER MASTER DIRECTORY
               </div>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              <DirectorySidebar 
                classes={classes} 
                activeAssignmentId={activeAssignmentId} 
                onSelectAssignment={setActiveAssignmentId} 
                onCreateClass={handleCreateClass}
                onEditClass={handleEditClass}
                onDeleteClass={handleDeleteClass}
                onCreateAssignment={handleCreateAssignment}
                onEditAssignment={handleEditAssignment}
                onDeleteAssignment={handleDeleteAssignment}
              />
              <DirectoryGallery 
                candidates={
                  activeAssignmentId 
                    ? classes.flatMap(c => c.assignments).find(a => a.id === activeAssignmentId)?.candidates || [] 
                    : []
                } 
                activeClassName={
                  activeAssignmentId
                    ? classes.find(c => c.assignments.some(a => a.id === activeAssignmentId))?.name
                    : undefined
                }
                activeAssignmentName={
                  activeAssignmentId
                    ? classes.flatMap(c => c.assignments).find(a => a.id === activeAssignmentId)?.name
                    : undefined
                }
                onDeleteCandidate={async (candidateId) => {
                  try {
                    let path: { classId: string; asgnId: string } | null = null;
                    for (const cls of classes) {
                      for (const asgn of cls.assignments) {
                        if (asgn.candidates.some(c => c.id === candidateId)) {
                          path = { classId: cls.id, asgnId: asgn.id };
                          break;
                        }
                      }
                      if (path) break;
                    }

                    if (path) {
                      await deleteDoc(doc(db, "classes", path.classId, "assignments", path.asgnId, "candidates", candidateId));
                    }

                    if (activeCandidateId === candidateId) {
                      setActiveCandidateId(null);
                      setResult(null);
                      setViewMode('directory');
                    }
                  } catch (error) {
                    handleFirestoreError(error, OperationType.DELETE, `candidates/${candidateId}`);
                  }
                }}
                onViewReport={c => { 
                  setResult(c.report); 
                  setActiveCandidateId(c.id);
                  setViewMode('result'); 
                }} 
                onUploadFinal={handleUploadFinal}
                onBulkUploadFinal={() => setShowBulkFinalModal(true)}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto p-4 md:p-8">
            <div className="w-full max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                {viewMode === 'upload' && (
                  <motion.div
                    key="upload-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex flex-col gap-8"
                  >
                    {/* Subject Selection prompt for ALL uploads */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-emerald-500 shadow-xl overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                          <BookOpen size={120} className="text-emerald-500" />
                       </div>
                       <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                <BookOpen size={24} className="text-white" />
                             </div>
                             <div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase leading-none">Subject Specialization</h2>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase mt-1">Select your Department Framework</p>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <button 
                                onClick={() => setSubject('Geography')}
                                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${subject === 'Geography' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-200 dark:hover:border-emerald-500/30'}`}
                             >
                                <div className="flex items-center justify-between mb-4">
                                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${subject === 'Geography' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20'}`}>
                                      <span className="font-black text-lg">G</span>
                                   </div>
                                   {subject === 'Geography' && <CheckCircle2 size={24} className="text-emerald-500" />}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">GEOGRAPHY IA</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard 25 mark assessment protocols with technical fieldwork conventions.</p>
                             </button>

                             <button 
                                onClick={() => setSubject('ESS')}
                                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${subject === 'ESS' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-200 dark:hover:border-emerald-500/30'}`}
                             >
                                <div className="flex items-center justify-between mb-4">
                                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${subject === 'ESS' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20'}`}>
                                      <span className="font-black text-lg">E</span>
                                   </div>
                                   {subject === 'ESS' && <CheckCircle2 size={24} className="text-emerald-500" />}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">ESS IA</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">New 2026 syllabus 30 mark scale with rigorous 3k word count compliance.</p>
                             </button>
                          </div>
                       </div>
                    </div>

                  <motion.div
                    key="upload-section-form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors"
              >
                {/* Panel Header */}
                <div className="border-b border-slate-100 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 gap-4">
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm tracking-wide uppercase">
                    <FileCheck size={18} />
                    IA Upload Entry
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg mr-4">
                      <button
                        onClick={() => setEntryMode('single')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase ${entryMode === 'single' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        Single Analysis
                      </button>
                      <button
                        onClick={() => setEntryMode('compare')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase ${entryMode === 'compare' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        Compare 2 IAs
                      </button>
                      <button
                        onClick={() => setEntryMode('class')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase ${entryMode === 'class' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        Class Upload
                      </button>
                    </div>
                    <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded uppercase tracking-widest hidden md:block">
                      READY
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {entryMode === 'single' ? (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Forename <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={studentForename}
                            onChange={e => setStudentForename(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                            placeholder="e.g. Jane"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Surname <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={studentSurname}
                            onChange={e => setStudentSurname(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                            placeholder="e.g. Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Preferred Name <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={studentPreferredName}
                            onChange={e => setStudentPreferredName(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                            placeholder="e.g. Janie"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Submission Type</label>
                        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg w-fit border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => setInitialSubmissionType('Draft')}
                            className={`px-6 py-2 rounded-md text-sm font-bold uppercase transition-all ${initialSubmissionType === 'Draft' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                          >
                            Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => setInitialSubmissionType('Final')}
                            className={`px-6 py-2 rounded-md text-sm font-bold uppercase transition-all ${initialSubmissionType === 'Final' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                          >
                            Final
                          </button>
                        </div>
                      </div>

                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                          relative border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-200
                          ${file ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-400 hover:bg-slate-50/50 dark:hover:bg-slate-700/50'}
                        `}
                      >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".pdf"
                        className="hidden" 
                      />
                      
                      {file ? (
                        <div className="flex flex-col items-center relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="absolute -top-12 -right-12 w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors z-10"
                            title="Remove file"
                          >
                            <Trash2 size={20} />
                          </button>
                          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
                            <FileText size={40} />
                          </div>
                          <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">{file.name}</p>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 dark:text-slate-500">
                          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                            <Upload size={40} />
                          </div>
                          <p className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Click to upload candidate IA</p>
                          <p className="text-sm font-medium">Only PDF files are supported</p>
                        </div>
                      )}
                    </div>
                  </div>
                  ) : entryMode === 'compare' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Column 1 */}
                      <div className="flex flex-col gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-slate-700 dark:text-slate-200">IA 1</h3>
                          <select 
                            value={compareInputType1} 
                            onChange={e => setCompareInputType1(e.target.value as any)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-md px-2 py-1"
                          >
                            <option value="upload">Upload New</option>
                            <option value="directory">Select from Directory</option>
                          </select>
                        </div>
                        {compareInputType1 === 'upload' ? (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Forename <span className="text-red-500">*</span></label>
                                <input 
                                  type="text" 
                                  required
                                  value={studentForename1}
                                  onChange={e => setStudentForename1(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Surname <span className="text-red-500">*</span></label>
                                <input 
                                  type="text" 
                                  required
                                  value={studentSurname1}
                                  onChange={e => setStudentSurname1(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Preferred Name <span className="text-red-500">*</span></label>
                                <input 
                                  type="text" 
                                  required
                                  value={studentPreferredName1}
                                  onChange={e => setStudentPreferredName1(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                            </div>
                            <div 
                              onClick={() => fileInputRef1.current?.click()}
                              className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                                ${compareFile1 ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50'}`}
                            >
                              <input type="file" ref={fileInputRef1} accept=".pdf" className="hidden" 
                                onChange={e => { if (e.target.files?.[0]) setCompareFile1(e.target.files[0]); }} />
                              {compareFile1 ? (
                                <div className="flex flex-col items-center relative">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCompareFile1(null);
                                      if (fileInputRef1.current) fileInputRef1.current.value = "";
                                    }}
                                    className="absolute -top-6 -right-6 w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors z-10"
                                    title="Remove file"
                                  >
                                    <X size={16} />
                                  </button>
                                  <FileText size={24} className="text-emerald-500 mb-2" />
                                  <p className="text-sm font-bold truncate max-w-full">{compareFile1.name}</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center text-slate-400">
                                  <Upload size={24} className="mb-2" />
                                  <p className="text-sm">Click to upload PDF</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <select 
                            value={compareCand1} 
                            onChange={e => setCompareCand1(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg"
                          >
                            <option value="">Select a saved candidate...</option>
                            {allCandidates.map(c => (
                              <option key={c.id} value={c.id}>{c.studentName} ({new Date(c.date).toLocaleDateString()})</option>
                            ))}
                          </select>
                        )}
                      </div>
                      
                      {/* Column 2 */}
                      <div className="flex flex-col gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-slate-700 dark:text-slate-200">IA 2</h3>
                          <select 
                            value={compareInputType2} 
                            onChange={e => setCompareInputType2(e.target.value as any)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-md px-2 py-1"
                          >
                            <option value="upload">Upload New</option>
                            <option value="directory">Select from Directory</option>
                          </select>
                        </div>
                        {compareInputType2 === 'upload' ? (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Forename <span className="text-red-500">*</span></label>
                                <input 
                                  type="text" 
                                  required
                                  value={studentForename2}
                                  onChange={e => setStudentForename2(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Surname <span className="text-red-500">*</span></label>
                                <input 
                                  type="text" 
                                  required
                                  value={studentSurname2}
                                  onChange={e => setStudentSurname2(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Preferred Name <span className="text-red-500">*</span></label>
                                <input 
                                  type="text" 
                                  required
                                  value={studentPreferredName2}
                                  onChange={e => setStudentPreferredName2(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                            </div>
                            <div 
                              onClick={() => fileInputRef2.current?.click()}
                              className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                                ${compareFile2 ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700/50'}`}
                            >
                              <input type="file" ref={fileInputRef2} accept=".pdf" className="hidden" 
                                onChange={e => { if (e.target.files?.[0]) setCompareFile2(e.target.files[0]); }} />
                              {compareFile2 ? (
                                <div className="flex flex-col items-center relative">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCompareFile2(null);
                                      if (fileInputRef2.current) fileInputRef2.current.value = "";
                                    }}
                                    className="absolute -top-6 -right-6 w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors z-10"
                                    title="Remove file"
                                  >
                                    <X size={16} />
                                  </button>
                                  <FileText size={24} className="text-emerald-500 mb-2" />
                                  <p className="text-sm font-bold truncate max-w-full">{compareFile2.name}</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center text-slate-400">
                                  <Upload size={24} className="mb-2" />
                                  <p className="text-sm">Click to upload PDF</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <select 
                            value={compareCand2} 
                            onChange={e => setCompareCand2(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg"
                          >
                            <option value="">Select a saved candidate...</option>
                            {allCandidates.map(c => (
                              <option key={c.id} value={c.id}>{c.studentName} ({new Date(c.date).toLocaleDateString()})</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6 w-full">
                       <div className="flex flex-col md:flex-row justify-between md:items-center bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700 rounded-xl gap-4">
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                               <Users size={18} className="text-emerald-500" />
                               Class Roster Setup
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Upload a spreadsheet or manually add students</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                               onClick={addManualStudent}
                               className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white dark:hover:bg-slate-700 transition"
                            >
                              <Plus size={16} /> Add Student
                            </button>
                            <label className="px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-sm rounded-lg cursor-pointer flex items-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition">
                               <Upload size={16} />
                               Upload Roster (.xlsx/.csv)
                               <input type="file" ref={rosterFileInputRef} className="hidden" accept=".xlsx,.csv" onChange={handleRosterUpload} />
                            </label>
                          </div>
                       </div>
                       
                       {classRoster.length > 0 ? (
                           <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden overflow-x-auto">
                               <table className="w-full text-left bg-white dark:bg-slate-800 whitespace-nowrap min-w-max">
                                   <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                       <tr>
                                           <th className="p-3 text-xs font-bold uppercase text-slate-500 w-1/3">Student Name</th>
                                            <th className="p-3 text-xs font-bold uppercase text-slate-500 w-1/3">File Attachment</th>
                                            <th className="p-3 text-xs font-bold uppercase text-slate-500 w-1/3">Status</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {classRoster.map(s => (
                                           <tr key={s.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                                               <td className="p-3">
                                                  <div className="flex items-center gap-2">
                                                    <input 
                                                       type="text" 
                                                       value={s.surname} 
                                                       onChange={e => setClassRoster(prev => prev.map(c => c.id === s.id ? { ...c, surname: e.target.value } : c))} 
                                                       placeholder="Surname" 
                                                       className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 outline-none p-1 font-medium text-slate-800 dark:text-slate-100" 
                                                    />
                                                    <span className="text-slate-400">,</span>
                                                    <input 
                                                       type="text" 
                                                       value={s.forename} 
                                                       onChange={e => setClassRoster(prev => prev.map(c => c.id === s.id ? { ...c, forename: e.target.value } : c))} 
                                                       placeholder="Forename" 
                                                       className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 outline-none p-1 font-medium text-slate-800 dark:text-slate-100" 
                                                    />
                                                    <input 
                                                       type="text" 
                                                       value={s.preferredName} 
                                                       onChange={e => setClassRoster(prev => prev.map(c => c.id === s.id ? { ...c, preferredName: e.target.value } : c))} 
                                                       placeholder="(Preferred)" 
                                                       className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 outline-none p-1 text-sm text-slate-500 dark:text-slate-400 italic" 
                                                    />
                                                  </div>
                                               </td>
                                               <td className="p-3">
                                                  {s.file ? (
                                                      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-2 rounded-md text-sm border border-emerald-100 dark:border-emerald-500/20">
                                                          <div className="flex items-center gap-2 truncate max-w-[200px]">
                                                              <FileText size={16} className="shrink-0" />
                                                              <span className="truncate">{s.file.name}</span>
                                                          </div>
                                                          <button
                                                             className="text-red-500 hover:text-red-700 ml-2 shrink-0 bg-white dark:bg-red-500/20 rounded-full p-0.5"
                                                             onClick={() => setClassRoster(prev => prev.map(c => c.id === s.id ? { ...c, file: null, status: 'missing' } : c))}
                                                          >
                                                              <X size={14} />
                                                          </button>
                                                      </div>
                                                  ) : (
                                                      <button 
                                                         onClick={() => {
                                                             setActiveRosterStudentId(s.id);
                                                             studentFileInputRef.current?.click();
                                                         }}
                                                         className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition"
                                                      >
                                                          <Paperclip size={14} /> Attach Draft (PDF)
                                                      </button>
                                                  )}
                                               </td>
                                               <td className="p-3">
                                                   <div className="flex items-center gap-2">
                                                     {s.status === 'missing' && <span className="inline-flex px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase tracking-widest border border-red-100">Missing File</span>}
                                                     {s.status === 'ready' && <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-widest border border-emerald-100">Ready to Grade</span>}
                                                     {s.status === 'processing' && <span className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-100"><Loader2 size={12} className="animate-spin" /> Processing</span>}
                                                     {s.status === 'done' && <span className="inline-flex px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700">Done</span>}
                                                     {(s.status === 'missing' || s.status === 'ready') && (
                                                       <button onClick={() => setClassRoster(prev => prev.filter(c => c.id !== s.id))} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                                                     )}
                                                   </div>
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                               <input type="file" onChange={handleClassRosterFileChange} ref={studentFileInputRef} className="hidden" accept=".pdf" />
                           </div>
                       ) : (
                           <div className="py-16 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                               <Users size={32} className="mx-auto mb-3 opacity-30" />
                               <p className="text-sm font-medium">No students in roster</p>
                           </div>
                       )}
                    </div>
                  )}

                  {error && (
                    <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-3">
                      <AlertCircle size={20} />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end">
                    <button
                      disabled={isExecuteDisabled}
                      onClick={analyzeIA}
                      className={`
                        px-8 py-3.5 rounded-lg font-bold text-sm tracking-wide uppercase flex items-center gap-3 transition-all duration-200
                        ${isExecuteDisabled 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/20'
                        }
                      `}
                    >
                      {isAnalyzing || isBatchProcessing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Processing {isBatchProcessing ? `${batchProgress}%` : '...'}
                        </>
                      ) : (
                        <>
                          {entryMode === 'class' ? 'Grade Class' : `Execute ${entryMode === 'compare' ? 'Comparison' : 'Moderation'}`}
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
                {viewMode === 'result' && result && (
              <motion.div
                key="result-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {showBatchResults && (
                   <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center justify-between mb-2">
                       <div className="flex items-center gap-3">
                           <button
                               onClick={() => {
                                  const processed = classRoster.filter(s => s.result);
                                  const nextIdx = (batchResultsIndex - 1 + processed.length) % processed.length;
                                  setBatchResultsIndex(nextIdx);
                                  setResult(processed[nextIdx].result);
                               }}
                               className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                           >
                              <ChevronLeft size={20} />
                           </button>
                           <span className="font-bold text-emerald-800 dark:text-emerald-400">
                               Student {batchResultsIndex + 1} of {classRoster.filter(s => s.result).length}
                           </span>
                           <button
                               onClick={() => {
                                  const processed = classRoster.filter(s => s.result);
                                  const nextIdx = (batchResultsIndex + 1) % processed.length;
                                  setBatchResultsIndex(nextIdx);
                                  setResult(processed[nextIdx].result);
                               }}
                               className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                           >
                              <ChevronRight size={20} />
                           </button>
                       </div>
                       <button
                           onClick={() => setShowSaveModal(true)}
                           className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition"
                       >
                           Archive Class Reports
                       </button>
                   </div>
                )}
                {(!result.isComparison) && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Candidate Profile</p>
                      <h2 className="text-[20px] font-black text-slate-800 dark:text-slate-100">
                        {showBatchResults 
                          ? (() => {
                              const processed = classRoster.filter(s => s.result);
                              const c = processed[batchResultsIndex];
                              return `${c.surname}, ${c.forename}${c.preferredName ? `, (${c.preferredName})` : ''}`;
                            })()
                          : activeCandidateId 
                            ? classes.flatMap(c => c.assignments).flatMap(a => a.candidates).find(c => c.id === activeCandidateId)?.studentName || result.fileName
                            : `${studentSurname}, ${studentForename}${studentPreferredName ? `, (${studentPreferredName})` : ''}`}
                      </h2>
                    </div>
                  </div>
                )}
                
                {result.isComparison ? (
                  <>
                    {/* Comparative Summary Stats */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 w-full max-w-5xl mx-auto">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center transition-colors">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">{result.fileName1}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black text-emerald-500">{result.totalScore1}</span>
                          <span className="text-xl font-bold text-slate-300 dark:text-slate-600">/25</span>
                        </div>
                      </div>
                      
                      <div className="shrink-0 flex items-center justify-center p-4">
                        <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 text-center uppercase">
                          Submission Comparison
                        </h2>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center transition-colors">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">{result.fileName2}</p>
                        <div className="flex items-baseline gap-1 relative">
                          <span className="text-5xl font-black text-blue-500">{result.totalScore2}</span>
                          <span className="text-xl font-bold text-slate-300 dark:text-slate-600">/25</span>
                        </div>
                      </div>
                    </div>

                    {/* Moderation Note */}
                    <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                      <div className="relative z-10">
                        <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-emerald-400">
                          <Trophy size={18} />
                          {(() => {
                            const activeCand = activeCandidateId ? classes.flatMap(c => c.assignments).flatMap(a => a.candidates).find(c => c.id === activeCandidateId) : null;
                            if (activeCand?.submissionType === 'Final' || isProgressAnalysis) {
                              return 'Draft-to-Final Progress Summary';
                            }
                            return 'Moderator Note';
                          })()}
                        </h2>
                        <p className="text-[15px] leading-relaxed text-slate-300 font-medium">
                          {result.moderationNote}
                        </p>
                      </div>
                    </div>

                    {/* Similarities Report */}
                    {result.similaritiesReport && (
                      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-amber-700/50 shadow-sm overflow-hidden p-6">
                        <h3 className="text-sm font-bold text-amber-600 dark:text-amber-500 tracking-wide uppercase flex items-center gap-2 mb-3">
                          <AlertCircle size={18} />
                          Similarities Report (Academic Integrity Checks)
                        </h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {result.similaritiesReport}
                        </p>
                      </div>
                    )}

                    {/* Criteria Breakdown */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                      <div className="border-b border-slate-100 dark:border-slate-700 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase flex items-center gap-2">
                          <FileText size={18} className="text-slate-400 dark:text-slate-500" />
                          Comparative Feedback Table
                        </h3>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {result.criteriaComparison?.map((c: any, i: number) => (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={c.id}
                            className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150 relative m-2`}
                          >
                            <div className="flex flex-col md:flex-row md:items-start gap-6">
                              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xl border border-emerald-100 dark:border-emerald-500/20">
                                {c.id}
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between items-end gap-2 mb-3 border-b border-transparent pb-1">
                                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{c.name}</h4>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                                  {/* IA 1 details */}
                                  <div className="space-y-4">
                                    <div className="flex justify-end">
                                      <div className="flex items-baseline text-emerald-600 dark:text-emerald-400 font-black px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-md">
                                        <span className="text-xl leading-none">{c.score1}</span><span className="text-xs font-bold opacity-70 ml-0.5">/{c.maxScore}</span>
                                      </div>
                                    </div>
                                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 rounded-xl p-4">
                                      <h5 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle2 size={14} /> IA 1: 1) What Went Well (WWW)
                                      </h5>
                                      <FeedbackList items={c.www1} criterionId={c.id} type="WWW" isEditable={false} onChange={() => {}} />
                                    </div>
                                    <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100/50 dark:border-amber-500/10 rounded-xl p-4">
                                      <h5 className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                                        <AlertCircle size={14} /> IA 1: 2) Even Better if (EBI)
                                      </h5>
                                      <FeedbackList items={c.ebi1} criterionId={c.id} type="EBI" isEditable={false} onChange={() => {}} />
                                    </div>
                                  </div>

                                  {/* IA 2 details */}
                                  <div className="space-y-4">
                                    <div className="flex justify-end">
                                      <div className="flex items-baseline text-blue-600 dark:text-blue-400 font-black px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-md">
                                        <span className="text-xl leading-none">{c.score2}</span><span className="text-xs font-bold opacity-70 ml-0.5">/{c.maxScore}</span>
                                      </div>
                                    </div>
                                    <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 rounded-xl p-4">
                                      <h5 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle2 size={14} /> IA 2: 1) What Went Well (WWW)
                                      </h5>
                                      <FeedbackList items={c.www2} criterionId={c.id} type="WWW" isEditable={false} onChange={() => {}} />
                                    </div>
                                    <div className="bg-purple-50/50 dark:bg-purple-500/5 border border-purple-100/50 dark:border-purple-500/10 rounded-xl p-4">
                                      <h5 className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1">
                                        <AlertCircle size={14} /> IA 2: 2) Even Better if (EBI)
                                      </h5>
                                      <FeedbackList items={c.ebi2} criterionId={c.id} type="EBI" isEditable={false} onChange={() => {}} />
                                    </div>
                                  </div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 mt-4">
                                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px] block mb-2 font-bold">Comparative Feedback</span>
                                    {c.feedback}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center transition-colors">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest text-center">IAQA Score</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[35px] font-black text-emerald-500">{result.totalScore}</span>
                      <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">/{result.subject === 'ESS' ? 30 : 25}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center transition-colors relative group">
                    <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest flex items-center justify-center gap-1.5 text-center">
                      Teacher Moderated
                    </h3>
                    <div className="flex items-baseline gap-1 relative">
                      <span className={`text-[35px] font-black w-24 text-center ${result.moderatedScore !== undefined && result.moderatedScore !== result.totalScore ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'}`}>
                        {result.moderatedScore !== undefined ? result.moderatedScore : result.totalScore}
                      </span>
                      <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">/{result.subject === 'ESS' ? 30 : 25}</span>
                      {scoreSaveStatus !== "idle" && (
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center justify-center">
                          {scoreSaveStatus === "saving" ? (
                            <Loader2 size={16} className="text-emerald-500 animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center transition-colors">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest text-center">Word Count Checked</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[35px] font-black text-slate-800 dark:text-slate-100">{result.wordCount.included}</span>
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-wider">words</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center transition-colors">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest text-center">Compliance Status</p>
                    <div className={`px-4 py-2 rounded-lg text-[13px] font-black flex items-center gap-2 uppercase tracking-wide ${
                      result.wordCount.included <= (result.subject === 'ESS' ? 3000 : 2500) ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20'
                    }`}>
                      {result.wordCount.included <= (result.subject === 'ESS' ? 3000 : 2500) ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {result.wordCount.status}
                    </div>
                  </div>
                </div>

                {/* Overall Summary */}
                <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-emerald-400">
                      <Trophy size={18} />
                      Moderator Executive Summary
                    </h2>
                    <p className="text-[15px] leading-relaxed text-slate-300 font-medium">
                      {result.overallSummary}
                    </p>
                  </div>
                </div>

                {/* Criteria Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                  <div className="border-b border-slate-100 dark:border-slate-700 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase flex items-center gap-2">
                      <FileText size={18} className="text-slate-400 dark:text-slate-500" />
                      Detailed Criterion Rubric
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {result.criteria.map((c, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={c.id}
                        className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150 relative ${c.teacherScore !== undefined && c.teacherScore !== c.score ? 'border-2 border-emerald-500/50 dark:border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-xl m-2' : ''}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xl border border-emerald-100 dark:border-emerald-500/20">
                            {c.id}
                          </div>
                          <div className="flex-grow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{c.name}</h4>
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IAQA Mark:</span>
                                  <span className="text-lg font-black text-slate-900 dark:text-white">
                                    {c.score} <span className="text-slate-400 dark:text-slate-500 font-bold ml-0.5 text-sm">/ {c.maxScore}</span>
                                  </span>
                                </div>
                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                    Teacher Mark <Pencil size={10} />
                                  </span>
                                  <div className="flex items-baseline">
                                    <input 
                                      type="number"
                                      min="0"
                                      max={c.maxScore}
                                      value={c.teacherScore !== undefined ? c.teacherScore : c.score}
                                      onChange={e => {
                                        const val = e.target.value ? Math.min(c.maxScore, Math.max(0, parseInt(e.target.value) || 0)) : c.score;
                                        handleUpdateCriterionScore(c.id, val);
                                      }}
                                      className={`text-lg font-black bg-transparent w-12 text-center outline-none focus:bg-slate-100 dark:focus:bg-slate-700 rounded transition-colors cursor-text border border-transparent hover:border-slate-200 dark:hover:border-slate-600 ${c.teacherScore !== undefined && c.teacherScore !== c.score ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'}`}
                                    />
                                    <span className="text-slate-400 dark:text-slate-500 font-bold ml-0.5 text-sm">/ {c.maxScore}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4 pt-2">
                              <div className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 rounded-xl p-4 transition-all">
                                <h5 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                  <CheckCircle2 size={14} />
                                  1) What Went Well (WWW)
                                  {!result.isComparison && (!activeCandidateId || classes.flatMap(cl => cl.assignments).flatMap(a => a.candidates).find(cand => cand.id === activeCandidateId)?.submissionType !== 'Final') && (
                                     <span className="ml-2 text-emerald-400/50 dark:text-emerald-600/50" title="Editable Field"><Edit2 size={10} /></span>
                                  )}
                                </h5>
                                <FeedbackList 
                                  items={c.www} 
                                  criterionId={c.id} 
                                  type="WWW" 
                                  isEditable={!result.isComparison && (!activeCandidateId || classes.flatMap(cl => cl.assignments).flatMap(a => a.candidates).find(cand => cand.id === activeCandidateId)?.submissionType !== 'Final')} 
                                  onChange={(newItems) => handleFeedbackChange(c.id, 'WWW', newItems)} 
                                />
                              </div>

                              <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 rounded-xl p-4 transition-all">
                                <h5 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1">
                                  <AlertCircle size={14} />
                                  2) Even Better if (EBI)
                                  {!result.isComparison && (!activeCandidateId || classes.flatMap(cl => cl.assignments).flatMap(a => a.candidates).find(cand => cand.id === activeCandidateId)?.submissionType !== 'Final') && (
                                     <span className="ml-2 text-blue-400/50 dark:text-blue-600/50" title="Editable Field"><Edit2 size={10} /></span>
                                  )}
                                </h5>
                                <FeedbackList 
                                  items={c.ebi} 
                                  criterionId={c.id} 
                                  type="EBI" 
                                  isEditable={!result.isComparison && (!activeCandidateId || classes.flatMap(cl => cl.assignments).flatMap(a => a.candidates).find(cand => cand.id === activeCandidateId)?.submissionType !== 'Final')} 
                                  onChange={(newItems) => handleFeedbackChange(c.id, 'EBI', newItems)} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Word Count Detail */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm transition-colors">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <TypeIcon size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Word Count Analytics</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Evaluated Payload</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{result.wordCount.included}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">FQ, Analysis, Conclusion, Eval</p>
                    </div>
                    <div className="space-y-1 border-l border-slate-100 dark:border-slate-700 pl-8">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Excluded Ancillaries</p>
                      <p className="text-3xl font-black text-slate-400 dark:text-slate-500">{result.wordCount.excluded}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Tables, Maps, Legends, Biblio</p>
                    </div>
                    <div className="space-y-1 border-l border-slate-100 dark:border-slate-700 pl-8">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Raw File Extract</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{result.wordCount.total}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Total words processed</p>
                    </div>
                  </div>
                </div>
                </>
                )}

                <div className="flex justify-center gap-4 pt-4 pb-12 mt-8">
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                    Reset Moderator
                  </button>
                  {result.isComparison ? (
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide bg-slate-800 text-white hover:bg-slate-700 transition-all duration-200 shadow-sm"
                    >
                      <Download size={16} />
                      Download PDF Report
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          const cand: CandidateRecord = {
                            id: activeCandidateId || 'temp',
                            studentName: activeCandidateId 
                              ? classes.flatMap(c => c.assignments).flatMap(a => a.candidates).find(c => c.id === activeCandidateId)?.studentName || result.fileName
                              : (studentForename || studentSurname) ? `${studentSurname}, ${studentForename}${studentPreferredName ? ` (${studentPreferredName})` : ''}` : result.fileName,
                            date: new Date().toISOString(),
                            score: result.moderatedScore !== undefined ? result.moderatedScore : result.totalScore,
                            report: result,
                            submissionType: initialSubmissionType,
                            iaqa_score: result.totalScore,
                            moderated_score: result.moderatedScore !== undefined ? result.moderatedScore : result.totalScore,
                          };
                          
                          const activeClass = classes.find(c => c.id === saveOptions.classId || c.name === saveOptions.classId)?.name || "N/A";
                          const activeAssignment = classes.flatMap(c => c.assignments).find(a => a.id === saveOptions.assignmentId || a.name === saveOptions.assignmentId)?.name || result.fileName || "N/A";

                          generateStudentReportPDF(cand, activeClass, activeAssignment);
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide bg-slate-800 text-white hover:bg-slate-700 transition-all duration-200 shadow-sm"
                      >
                        <Download size={16} />
                        Download PDF
                      </button>
                      <button
                        onClick={handleSaveInit}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all duration-200"
                      >
                        <FolderOpen size={16} />
                        Save to Directory
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showBulkFinalModal && activeAssignmentId && (
          <BulkFinalUploadModal
            candidates={classes.flatMap(c => c.assignments).find(a => a.id === activeAssignmentId)?.candidates || classes.flatMap(c => c.assignments).flatMap(a => a.candidates)}
            onClose={() => setShowBulkFinalModal(false)}
            onProcessItem={handleBulkFinalProcessItem}
            onCommitAll={handleBulkFinalCommitAll}
          />
        )}
        {showSaveModal && (
          <ArchiveModal
            onClose={() => setShowSaveModal(false)}
            onSave={performSave}
            classes={classes}
            saveOptions={saveOptions}
            setSaveOptions={setSaveOptions}
            step={saveStep}
            setStep={setSaveStep}
            resultName={result?.fileName || ""}
            isBatch={showBatchResults}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
