/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, BarChart2, Upload, Loader2, FileImage, Moon, Sun } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { PDFGenerator } from './PDFGenerator';

type Question = {
  marks: number;
  text: string;
};

type Markscheme = {
  criteria: string;
  paths: string[];
};

type GenerationResult = {
  questions: Question[];
  markscheme: Markscheme;
  summary: string;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [localIsDarkMode, setLocalIsDarkMode] = useState(false);
  const isDarkMode = propIsDark !== undefined ? propIsDark : localIsDarkMode;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Set local image preview
    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);

    setIsGenerating(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Failed to generate. Ensure API key is configured.');
    } finally {
      setIsGenerating(false);
      // Reset input so the same file could be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="w-screen h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header Navigation */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#00b875] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-sm leading-none pt-0.5">
              DP
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white uppercase flex items-center gap-1.5 mt-1">
                <span className="text-[#00b875] font-black">INFOGRAPHIC</span> GENERATOR
              </h1>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-[-2px]">
                Generating to the IBDP Geo Spec
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
              <span className={`flex h-2 w-2 rounded-full ${isGenerating ? 'bg-amber-500 animate-pulse' : 'bg-[#00b875]'}`}></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {isGenerating ? 'Analyzing...' : 'Model Active'}
              </span>
            </div>
            <button 
              onClick={() => {
                if (propToggleDark) {
                  propToggleDark();
                } else {
                  setLocalIsDarkMode(!localIsDarkMode);
                }
              }} 
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {onBackToPortal && (
              <button 
                onClick={onBackToPortal}
                className="w-10 h-10 rounded-full border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Exit to Workspace Portal"
              >
                <span className="text-[10px] font-bold">EXIT</span>
              </button>
            )}
          </div>
        </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-slate-950 justify-center">

        {/* Content Area: Data Preview */}
        <main className="flex-1 p-8 overflow-hidden flex flex-col space-y-6 max-w-5xl w-full">
          {/* Top Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start space-x-6">
            <div className="w-40 h-40 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative">
              {imageSrc ? (
                <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center flex flex-col items-center">
                  <BarChart2 className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Infographic 01
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {result ? 'Analysis of Uploaded Infographic' : 'Training Mode: Waiting for Input'}
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {result ? result.summary : 'Upload a new infographic to generate custom Paper 2 questions and a calibrated markscheme.'}
              </p>
              <div className="flex space-x-4">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Unit: Auto-detected
                </span>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Paper 2
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown Grid */}
          <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
            {/* Left: Questions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Calibrated Questions
                </h3>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                     <Loader2 className="w-6 h-6 animate-spin mr-2" />
                     <span className="text-sm font-semibold">Drafting questions...</span>
                  </div>
                ) : result ? (
                  result.questions.map((q, i) => (
                    <div key={i} className="space-y-2">
                      <p className="text-xs font-bold text-[#00b875]">[{q.marks} Marks]</p>
                      <p className="text-sm italic font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        "{q.text}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full font-medium text-slate-400 dark:text-slate-500 text-sm">
                    No questions generated yet.
                  </div>
                )}
              </div>
            </div>

            {/* Right: Markscheme */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Logic & Markscheme Calibration
                </h3>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                     <Loader2 className="w-6 h-6 animate-spin mr-2" />
                     <span className="text-sm font-semibold">Constructing markscheme...</span>
                  </div>
                ) : result && result.markscheme ? (
                  <>
                    <div className="p-4 bg-[#00b875]/10 dark:bg-[#00b875]/10 rounded-lg border border-[#00b875]/20">
                      <div className="flex items-center text-[#00b875] text-xs font-bold mb-2">
                        <span>CRITERIA A: KNOWLEDGE</span>
                        <span className="ml-auto">SCORE: OPTIMAL</span>
                      </div>
                      <p className="text-xs font-medium text-[#00b875] leading-relaxed">
                        {result.markscheme.criteria}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                        CALIBRATED RESPONSE PATHS:
                      </p>
                      <ul className="text-xs font-medium text-slate-600 dark:text-slate-300 space-y-2">
                         {result.markscheme.paths.map((path, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2 text-[#00b875]">&bull;</span>{" "}
                            {path}
                          </li>
                         ))}
                      </ul>
                    </div>
                  </>
                ) : (
                   <div className="flex items-center justify-center h-full font-medium text-slate-400 dark:text-slate-500 text-sm">
                    No markscheme generated yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Bar: User Interaction */}
      <footer className="h-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0">
        <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
          Training Engine Version 4.2.0-Alpha &bull;{" "}
          <span className="text-[#00b875] tracking-tighter">
            {isGenerating ? 'Processing...' : result ? 'Generation Complete' : 'Ready to Proceed'}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          {/* Show download buttons when complete */}
          {!isGenerating && result && (
            <PDFGenerator imageSrc={imageSrc} result={result} />
          )}

          <button 
            onClick={handleUploadClick}
            disabled={isGenerating}
            className="flex items-center px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-[#00b875] shadow-lg shadow-[#00b875]/20 hover:bg-[#00a368] transition-all disabled:opacity-50">
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-white" />
            ) : (
              <Upload className="w-5 h-5 mr-2 text-white" />
            )}
            {isGenerating ? 'Processing...' : result ? 'Upload New' : 'Submit New Infographic'}
          </button>
        </div>
      </footer>
    </div>
    </div>
  );
}
