import React, { useState, useEffect } from 'react';
import { EvaluationResult } from './types';
import Login from './components/Login';
import UploadView from './components/UploadView';
import ModerationResults from './components/ModerationResults';
import CompareResults from './components/CompareResults';
import LoadingView from './components/LoadingView';
import DirectoryView from './components/DirectoryView';
import ClassBatchResults from './components/ClassBatchResults';
import CandidateSplitViewer from './components/CandidateSplitViewer'; // NEW: Import the split viewer
import { StudentSubmission } from './db';

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
  const [localDarkMode, setLocalDarkMode] = useState(false);
  const isDarkMode = propIsDark !== undefined ? propIsDark : localDarkMode;
  const toggleDarkMode = propToggleDark || (() => setLocalDarkMode(!localDarkMode));

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const [isLoggedIn, setIsLoggedIn] = useState(!!activeUserEmail);
  // NEW: Added 'splitViewer' to app states
  const [appState, setAppState] = useState<'upload' | 'moderating' | 'results' | 'directory' | 'classBatchResults' | 'splitViewer'>('upload');

  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [prefilledStudent, setPrefilledStudent] = useState<StudentSubmission | null>(null);
  const [activeStudent, setActiveStudent] = useState<StudentSubmission | null>(null); // NEW: Tracks student for split viewer
  const [activeViewerStage, setActiveViewerStage] = useState<'Draft' | 'Final' | 'Compare'>('Draft');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedStage, setUploadedStage] = useState<'Draft' | 'Final'>('Draft');
  const [compareNames, setCompareNames] = useState<{ cwk1: string, cwk2: string } | null>(null);
  const [compareFiles, setCompareFiles] = useState<{ file1?: File | null; file2?: File | null } | null>(null);
  const [batchResults, setBatchResults] = useState<any[]>([]);

  const handleEvaluate = async (
    text: string, 
    title: string, 
    file?: File | null, 
    stage: 'Draft' | 'Final' = 'Draft',
    classInfo?: { className: string; assignmentName: string }
  ) => {
    setCandidateName(title);
    setAppState('moderating');
    setCompareNames(null);
    setCompareFiles(null);
    setUploadedFile(file || null);
    setUploadedStage(stage);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.error) {
          alert(`Evaluation failed: ${data.error}`);
          setAppState('upload');
          return;
        }
        setEvaluation(data);

        // UPLOAD PIPELINE:
        // After Gemini AI generates grading report, upload raw PDF to Firebase Storage,
        // merge with existing Draft submission if Final, and save to database.
        const targetClass = prefilledStudent?.className || classInfo?.className || 'General';
        const targetAssignment = prefilledStudent?.assignmentName || classInfo?.assignmentName || 'Coursework';

        if (file) {
          try {
            const { uploadSubmissionPdf, addOrUpdateSubmission, findExistingSubmission } = await import('./db');
            const existing = await findExistingSubmission(title, targetClass, targetAssignment);

            const baseSubmission: any = {
              ...(existing || {}),
              candidateName: title,
              className: targetClass,
              assignmentName: targetAssignment,
              status: stage,
              updatedAt: new Date().toISOString()
            };

            // Explicitly await uploadSubmissionPdf
            const { pdfUrl, storagePath } = await uploadSubmissionPdf(file, baseSubmission, stage);

            const defaultScores = {
              ao1_knowledge: data.scores?.ao1_knowledge?.score || 0,
              ao2_observation: data.scores?.ao2_observation?.score || 0,
              ao2_organisation: data.scores?.ao2_organisation?.score || 0,
              ao2_analysis: data.scores?.ao2_analysis?.score || 0,
              ao3_conclusion: data.scores?.ao3_conclusion?.score || 0,
            };

            const mergedSubmission: any = {
              ...baseSubmission,
              status: stage,
              updatedAt: new Date().toISOString(),
              ...(stage === 'Final' ? {
                draftEvaluation: existing?.draftEvaluation,
                draftTeacherScores: existing?.draftTeacherScores,
                draftPdfUrl: existing?.draftPdfUrl,
                draftStoragePath: existing?.draftStoragePath,
                finalEvaluation: data,
                finalTeacherScores: existing?.finalTeacherScores || defaultScores,
                finalPdfUrl: pdfUrl,
                finalStoragePath: storagePath
              } : {
                draftEvaluation: data,
                draftTeacherScores: existing?.draftTeacherScores || defaultScores,
                draftPdfUrl: pdfUrl,
                draftStoragePath: storagePath,
                finalEvaluation: existing?.finalEvaluation,
                finalTeacherScores: existing?.finalTeacherScores,
                finalPdfUrl: existing?.finalPdfUrl,
                finalStoragePath: existing?.finalStoragePath
              })
            };

            await addOrUpdateSubmission(mergedSubmission);
            setPrefilledStudent(mergedSubmission);
          } catch (storageErr: any) {
            console.error("Storage pipeline upload error:", storageErr);
            alert(`PDF upload/save failed: ${storageErr?.message || storageErr}`);
          }
        }

        setAppState('results');
      } else {
        const err = await response.json().catch(() => ({ error: 'Unknown server error.' }));
        alert(`Evaluation failed: ${err.error || response.statusText}`);
        setAppState('upload');
      }
    } catch (error: any) {
      console.error(error);
      alert(`Network error: ${error.message}`);
      setAppState('upload');
    }
  };

  const handleCompareEvaluate = async (
    cwk1: any, 
    cwk2: any, 
    title: string, 
    cwk1Name: string, 
    cwk2Name: string,
    cwk1File?: File | null,
    cwk2File?: File | null
  ) => {
    setCandidateName(title);
    setCompareNames({ cwk1: cwk1Name, cwk2: cwk2Name });
    setCompareFiles({ file1: cwk1File, file2: cwk2File });
    setAppState('moderating');

    try {
      const response = await fetch('/api/evaluate-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cwk1, cwk2 })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.error) {
          alert(`Comparison failed: ${data.error}`);
          setAppState('upload');
          return;
        }
        setEvaluation(data);
        setAppState('results');
      } else {
        const err = await response.json().catch(() => ({ error: 'Unknown server error.' }));
        alert(`Comparison failed: ${err.error || response.statusText}`);
        setAppState('upload');
      }
    } catch (error: any) {
      console.error(error);
      alert(`Network error: ${error.message}`);
      setAppState('upload');
    }
  };

  const handleNewModeration = () => {
    setEvaluation(null);
    setCandidateName("");
    setPrefilledStudent(null);
    setActiveStudent(null);
    setAppState('upload');
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
  }

  if (appState === 'upload' || appState === 'moderating') {
    return (
      <>
        <div style={{ display: appState === 'upload' ? 'block' : 'none' }}>
          <UploadView
            onUploadComplete={(text, title, file, stage, classInfo) => handleEvaluate(text, title, file, stage, classInfo)}
            onCompareComplete={(cwk1, cwk2, title, n1, n2, f1, f2) => handleCompareEvaluate(cwk1, cwk2, title, n1, n2, f1, f2)}
            onClassBatchComplete={(results) => { setBatchResults(results); setAppState('classBatchResults'); }}
            onLogout={onBackToPortal || (() => setIsLoggedIn(false))}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            onOpenDirectory={() => setAppState('directory')}
            prefilledStudent={prefilledStudent}
            onCancelPrefilled={() => setPrefilledStudent(null)}
          />
        </div>
        {appState === 'moderating' && <LoadingView isDarkMode={isDarkMode} />}
      </>
    );
  }

  if (appState === 'classBatchResults') {
    return <ClassBatchResults
      results={batchResults}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      onExit={() => setAppState('upload')}
      onOpenDirectory={() => setAppState('directory')}
    />;
  }

  if (appState === 'directory') {
    return <DirectoryView
      onBack={() => setAppState('upload')}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      onUploadFinal={(student: StudentSubmission) => {
        setPrefilledStudent(student);
        setAppState('upload');
      }}
      onOpenSplitViewer={(student: StudentSubmission, stage?: 'Draft' | 'Final' | 'Compare') => {
        setActiveStudent(student);
        setActiveViewerStage(stage || 'Draft');
        setAppState('splitViewer');
      }}
    />;
  }

  // Renders the 50/50 Split Viewer when triggered from the directory
  if (appState === 'splitViewer' && activeStudent) {
    return <CandidateSplitViewer
      candidate={activeStudent}
      initialStage={activeViewerStage}
      onClose={() => {
        setActiveStudent(null);
        setAppState('directory');
      }}
      onUpdateStudent={(updated) => {
        setActiveStudent(updated);
      }}
      onUploadFinal={(student: StudentSubmission) => {
        setPrefilledStudent(student);
        setActiveStudent(null);
        setAppState('upload');
      }}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
    />;
  }

  if (appState === 'results' && evaluation) {
    if (compareNames) {
      return <CompareResults
        evaluation={evaluation as any}
        cwk1Name={compareNames.cwk1}
        cwk2Name={compareNames.cwk2}
        file1={compareFiles?.file1}
        file2={compareFiles?.file2}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onExit={handleNewModeration}
        onOpenDirectory={() => setAppState('directory')}
      />;
    }
    return <ModerationResults
      evaluation={evaluation}
      candidateName={candidateName}
      uploadedFile={uploadedFile}
      uploadedStage={uploadedStage}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      onExit={handleNewModeration}
      onOpenDirectory={() => setAppState('directory')}
      prefilledStudent={prefilledStudent}
    />;
  }

  return null;
}