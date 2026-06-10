import React, { useState, useEffect } from 'react';
import { EvaluationResult } from './types';
import Login from './components/Login';
import UploadView from './components/UploadView';
import ModerationResults from './components/ModerationResults';
import CompareResults from './components/CompareResults';
import LoadingView from './components/LoadingView';
import DirectoryView from './components/DirectoryView';
import ClassBatchResults from './components/ClassBatchResults';
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
  const [appState, setAppState] = useState<'upload' | 'moderating' | 'results' | 'directory' | 'classBatchResults'>('upload');
  
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [prefilledStudent, setPrefilledStudent] = useState<StudentSubmission | null>(null);
  const [compareNames, setCompareNames] = useState<{cwk1: string, cwk2: string} | null>(null);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  
  const handleEvaluate = async (text: string, title: string) => {
    setCandidateName(title);
    setAppState('moderating');
    setCompareNames(null);
    
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
  
  const handleCompareEvaluate = async (cwk1: any, cwk2: any, title: string, cwk1Name: string, cwk2Name: string) => {
    setCandidateName(title);
    setCompareNames({ cwk1: cwk1Name, cwk2: cwk2Name });
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
            onUploadComplete={(text, title) => handleEvaluate(text, title)} 
            onCompareComplete={(cwk1, cwk2, title, n1, n2) => handleCompareEvaluate(cwk1, cwk2, title, n1, n2)}
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
    />;
  }

  if (appState === 'results' && evaluation) {
    if (compareNames) {
      return <CompareResults
        evaluation={evaluation as any}
        cwk1Name={compareNames.cwk1}
        cwk2Name={compareNames.cwk2}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onExit={handleNewModeration}
      />;
    }
    return <ModerationResults 
      evaluation={evaluation} 
      candidateName={candidateName}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      onExit={handleNewModeration}
      onOpenDirectory={() => setAppState('directory')}
      prefilledStudent={prefilledStudent}
    />;
  }

  return null;
}
