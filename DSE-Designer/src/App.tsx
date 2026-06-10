import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import InputPanel from './components/InputPanel';
import MarkdownOutput from './components/MarkdownOutput';
import { SyllabusCodeId } from './types';

export default function App({
  onBackToPortal,
}: {
  onBackToPortal?: () => void;
}) {
  const [selectedCode, setSelectedCode] = useState<SyllabusCodeId | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('syllabusCode', selectedCode);
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

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <header className="h-20 bg-white flex items-center justify-between px-6 shrink-0 border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl text-white tracking-tighter">IG</div>
          <div className="flex flex-col justify-center leading-tight">
            <h1 className="text-[22px] font-black tracking-tight text-blue-600 uppercase">0460 DSE Designer</h1>
            <span className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mt-0.5">Crafting the Perfect Case Study</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating} 
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2 rounded-lg transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
            <MarkdownOutput content={result} isGenerating={isGenerating} />
          </section>
        </main>
      </div>
    </div>
  );
}
