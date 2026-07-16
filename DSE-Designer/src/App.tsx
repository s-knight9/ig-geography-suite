import { Layout, FolderOpen, Save, Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import InputPanel from './components/InputPanel';
import MarkdownOutput from './components/MarkdownOutput';
import { SyllabusCodeId } from './types';
import { VAULT_FOLDERS, saveVaultReport } from '../../src/vaultTypes';

export default function App({
  onBackToPortal,
  activeRole
}: {
  onBackToPortal?: () => void;
  activeRole?: string;
}) {
  const [selectedCode, setSelectedCode] = useState<SyllabusCodeId | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(VAULT_FOLDERS[0].id);
  const [dseTitle, setDseTitle] = useState('DSE: Custom Profile');
  const [hasSaved, setHasSaved] = useState(false);
  
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Update default title when selected code changes
  useEffect(() => {
    if (selectedCode) {
      setDseTitle(`DSE: ${selectedCode}`);
    }
  }, [selectedCode]);

  const handleGenerate = async () => {
    if (activeRole === 'student') {
      const today = new Date().toISOString().split('T')[0];
      const dataStr = localStorage.getItem('ig_ai_generation_usage');
      const data = dataStr ? JSON.parse(dataStr) : {};
      if (data.date === today && data.count >= 3) {
        setError('You have reached your daily limit of 3 AI generations. Please take time to read the source materials carefully!');
        return;
      }
    }

    setIsGenerating(true);
    setError('');
    setHasSaved(false); // Reset save state on new generation
    
    try {
      const formData = new FormData();
      formData.append('syllabusCode', selectedCode || '');
      if (prompt) formData.append('prompt', prompt);
      
      const filteredUrls = urls.filter(u => u.trim() !== '');
      if (filteredUrls.length > 0) {
        formData.append('urls', JSON.stringify(filteredUrls));
      }
      
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/dse/generate', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate');
        }
        setResult(data.result);
        if (activeRole === 'student') {
          const today = new Date().toISOString().split('T')[0];
          const dataStr = localStorage.getItem('ig_ai_generation_usage');
          const data = dataStr ? JSON.parse(dataStr) : {};
          if (data.date !== today) {
            localStorage.setItem('ig_ai_generation_usage', JSON.stringify({ date: today, count: 1 }));
          } else {
            localStorage.setItem('ig_ai_generation_usage', JSON.stringify({ date: today, count: data.count + 1 }));
          }
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON response from server:", text.substring(0, 500));
        throw new Error(`Server returned an invalid response (${response.status}). Please try again or reduce file sizes.`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToVault = () => {
    if (!result) return;
    
    // Remove the map from the archived version
    const contentWithoutMap = result.replace(/```json-map[\s\S]*?```/g, '').trim();

    saveVaultReport(selectedFolder, {
      id: crypto.randomUUID(),
      title: dseTitle || `DSE: ${selectedCode || 'Custom Profile'}`,
      tags: ['DSE', selectedCode || 'Custom'],
      content: contentWithoutMap,
      date: new Date().toISOString()
    });
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <header className="h-20 bg-white flex items-center justify-between px-6 shrink-0 border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#2563eb] rounded-xl flex items-center justify-center shadow-sm">
            <Layout className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">0460 DSE Designer</h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">Crafting the Perfect Case Study</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating} 
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2 rounded-lg transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm h-[36px]"
          >
            {isGenerating ? 'Synthesizing...' : 'Generate DSE'}
          </button>
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="px-4 py-2 bg-red-50 text-red-650 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-all shrink-0"
            >
              EXIT
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          selectedCode={selectedCode} 
          onSelectCode={(code) => {
             setSelectedCode(code);
             // Enable collapse immediately after selecting
          }} 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        {/* Main Workspace */}
        <main className="flex-1 flex gap-4 p-4 overflow-hidden min-w-0">
          <InputPanel 
            prompt={prompt}
            setPrompt={setPrompt}
            files={files}
            setFiles={setFiles}
            urls={urls}
            setUrls={setUrls}
            selectedCode={selectedCode}
          />
          
          <section className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
            {error && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-100 shadow-sm text-sm font-medium">
                {error}
              </div>
            )}

            {/* Save Bar (only visible when result is generated) */}
            {result && !isGenerating && (
              <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap items-center gap-3 shrink-0">
                <input 
                  type="text" 
                  value={dseTitle} 
                  onChange={(e) => setDseTitle(e.target.value)} 
                  placeholder="Enter DSE Heading..."
                  className="flex-1 min-w-[200px] border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-3 py-1.5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner" 
                />
                <div className="flex items-center bg-white border border-slate-300 rounded px-2 py-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-slate-400 mr-2" />
                  <select 
                    className="bg-transparent text-xs font-bold text-slate-700 outline-none w-32 truncate cursor-pointer"
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                  >
                    {VAULT_FOLDERS.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleSaveToVault} 
                  disabled={hasSaved}
                  className={`flex items-center gap-2 text-xs px-4 py-1.5 rounded transition-all font-bold shadow-sm ${
                    hasSaved 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                  }`}
                >
                  {hasSaved ? (
                    <><Check className="w-3.5 h-3.5" /> Saved to Vault</>
                  ) : (
                    <><Save className="w-3.5 h-3.5" /> Save to Vault</>
                  )}
                </button>
              </div>
            )}

            <MarkdownOutput content={result} isGenerating={isGenerating} />
          </section>
        </main>
      </div>
    </div>
  );
}

