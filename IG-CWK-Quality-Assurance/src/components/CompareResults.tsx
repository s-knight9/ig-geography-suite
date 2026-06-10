import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, XCircle, AlertTriangle, Download, RefreshCcw, Award, Moon, Sun, FileText } from 'lucide-react';
import { ComparativeEvaluationResult } from '../types';

interface CompareResultsProps {
  evaluation: ComparativeEvaluationResult;
  cwk1Name: string;
  cwk2Name: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onExit: () => void;
}

import { downloadComparativeFeedbackPDF } from '../pdfReport';

export default function CompareResults({ evaluation, cwk1Name, cwk2Name, isDarkMode, toggleDarkMode, onExit }: CompareResultsProps) {
  const criteriaLabels: Record<keyof ComparativeEvaluationResult['criteria'], string> = {
    ao1_knowledge: "Criterion 1 (AO1): Knowledge and understanding",
    ao2_observation: "Criterion 2 (AO2): Observation and collection of data",
    ao2_organisation: "Criterion 3 (AO2): Organisation and presentation of data",
    ao2_analysis: "Criterion 4 (AO2): Analysis and interpretation",
    ao3_conclusion: "Criterion 5 (AO3): Conclusion and Evaluation"
  };

  const getScoreColor = (score: number) => {
    if (score >= 10) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
    if (score >= 7) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30';
    if (score >= 4) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30';
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-[#f8f9fc] text-slate-900'} pb-24`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onExit}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold">
                IG
              </div>
              <span className="font-semibold text-lg tracking-tight">Comparative Analysis</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
               onClick={toggleDarkMode}
               className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
               title="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              New Moderation
            </button>
            <button
              onClick={() => downloadComparativeFeedbackPDF(evaluation, cwk1Name, cwk2Name)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[72rem] mx-auto px-6 py-8 space-y-6">
        {/* Candidate Heads */}
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
             <p className="font-bold uppercase tracking-wider mb-2" style={{ color: '#009966', fontSize: '15px' }}>CWK 1: {cwk1Name}</p>
             <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-extrabold ${getScoreColor(evaluation.cwk1_total_score).split(' ')[0]}`}>{evaluation.cwk1_total_score}</span>
                <span className="text-slate-400 font-medium">/ 60</span>
             </div>
          </div>
          
          <div className="shrink-0 font-bold text-xl uppercase tracking-widest px-4" style={{ color: '#000000' }}>
            VS
          </div>
          
          <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
             <p className="font-bold uppercase tracking-wider mb-2" style={{ color: '#155dfc', fontSize: '15px' }}>CWK 2: {cwk2Name}</p>
             <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#155dfc] dark:text-blue-500">{evaluation.cwk2_total_score}</span>
                <span className="text-slate-400 font-medium">/ 60</span>
             </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-[#0f172a] text-slate-300 rounded-2xl p-6 shadow-md border border-slate-800">
           <div className="flex items-center gap-2 mb-3 text-emerald-400">
             <Award className="w-5 h-5" />
             <h2 className="text-sm font-bold tracking-widest uppercase">Moderator Note</h2>
           </div>
           <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
             {evaluation.moderator_executive_summary}
           </p>
        </div>

        {/* Similarities Report */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6">
           <div className="flex items-center gap-2 mb-3 text-orange-600 dark:text-orange-500">
             <AlertTriangle className="w-5 h-5" />
             <h2 className="text-sm font-bold tracking-widest uppercase">Similarities Report (Academic Integrity)</h2>
           </div>
           <p className="text-orange-900 dark:text-orange-200 text-sm leading-relaxed whitespace-pre-wrap">
             {evaluation.academic_integrity_report}
           </p>
        </div>

        <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest my-8 px-2 border-b border-slate-200 dark:border-slate-700 pb-2">
           <FileText className="w-4 h-4 mr-2"/>
           Comparative Feedback Table
        </div>

        {/* Criteria Breakdown */}
        {Object.entries(evaluation.criteria).map(([key, criterion], index) => {
          const cat = key as keyof ComparativeEvaluationResult['criteria'];
          const letters = ['A', 'B', 'C', 'D', 'E'];
          return (
            <div key={key} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden mb-6 shadow-sm">
              <div className="flex items-center p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                 <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-bold mr-4 shrink-0">
                    {letters[index]}
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{criteriaLabels[cat]}</h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 relative">
                  {/* Divider */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-100 dark:bg-slate-700/50 -translate-x-1/2"></div>
                  
                  {/* Left Col: CWK 1 */}
                  <div className="space-y-4">
                     <div className="flex justify-end mb-2">
                        <div className="flex items-baseline gap-1 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-700/50 font-bold border border-slate-100 dark:border-slate-700 text-emerald-600">
                          <span className="text-lg">{criterion.cwk1_score}</span><span className="text-xs text-slate-400">/12</span>
                        </div>
                     </div>
                     <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-4">
                       <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> IA 1: A) What Went Well (WWW)</h4>
                       <ul className="space-y-2">
                         {criterion.cwk1_www.map((item, idx) => (
                           <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                             <span className="text-[10px] font-black tracking-widest bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">{index+1}.{idx+1}A</span>
                             {item}
                           </li>
                         ))}
                       </ul>
                     </div>
                     <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-xl p-4">
                       <h4 className="text-[10px] font-bold text-orange-600 dark:text-orange-500 uppercase tracking-widest mb-3 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> IA 1: B) Even Better If (EBI)</h4>
                       <ul className="space-y-2">
                         {criterion.cwk1_ebi.map((item, idx) => (
                           <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                             <span className="text-[10px] font-black tracking-widest bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">{index+1}.{idx+1}B</span>
                             {item}
                           </li>
                         ))}
                       </ul>
                     </div>
                  </div>

                  {/* Right Col: CWK 2 */}
                  <div className="space-y-4">
                     <div className="flex justify-end mb-2">
                        <div className="flex items-baseline gap-1 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-700/50 font-bold border border-slate-100 dark:border-slate-700 text-blue-600">
                          <span className="text-lg">{criterion.cwk2_score}</span><span className="text-xs text-slate-400">/12</span>
                        </div>
                     </div>
                     <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
                       <h4 className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-3 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> IA 2: A) What Went Well (WWW)</h4>
                       <ul className="space-y-2">
                         {criterion.cwk2_www.map((item, idx) => (
                           <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                             <span className="text-[10px] font-black tracking-widest bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">{index+1}.{idx+1}A</span>
                             {item}
                           </li>
                         ))}
                       </ul>
                     </div>
                     <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-xl p-4">
                       <h4 className="text-[10px] font-bold text-purple-600 dark:text-purple-500 uppercase tracking-widest mb-3 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> IA 2: B) Even Better If (EBI)</h4>
                       <ul className="space-y-2">
                         {criterion.cwk2_ebi.map((item, idx) => (
                           <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                             <span className="text-[10px] font-black tracking-widest bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">{index+1}.{idx+1}B</span>
                             {item}
                           </li>
                         ))}
                       </ul>
                     </div>
                  </div>

                </div>

                <div className="mt-6 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-5 border border-slate-100 dark:border-slate-600/50">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Comparative Feedback</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {criterion.comparative_feedback}
                  </p>
                </div>

              </div>
            </div>
          );
        })}

        <div className="pt-8 flex justify-center">
            <button
               onClick={onExit}
               className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors uppercase tracking-widest"
            >
               <RefreshCcw className="w-4 h-4" /> Reset Moderator
            </button>
        </div>

      </main>
    </div>
  );
}
