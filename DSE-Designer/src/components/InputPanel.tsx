import React from 'react';
import { SyllabusCodeId } from '../types';
import { Paperclip, Plus, X } from 'lucide-react';

interface InputPanelProps {
  prompt: string;
  setPrompt: (value: string) => void;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  urls: string[];
  setUrls: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCode: SyllabusCodeId | null;
}

export default function InputPanel({
  prompt, setPrompt,
  files, setFiles,
  urls, setUrls,
  selectedCode
}: InputPanelProps) {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUrlChange = (index: number, value: string) => {
    setUrls(prev => {
      const newUrls = [...prev];
      newUrls[index] = value;
      return newUrls;
    });
  };

  const addUrl = () => {
    setUrls(prev => [...prev, '']);
  };

  const removeUrl = (index: number) => {
    setUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <section className="flex-1 shrink-0 flex flex-col gap-4 overflow-y-auto relative">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col shrink-0 relative pb-2">
        <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-2 sticky top-0 z-10 rounded-t-lg">
          <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Data Input Channels</h2>
        </div>
        <div className="p-4 flex flex-col gap-4 z-0">
          <div>
            <label className="text-[10px] text-slate-500 font-semibold mb-1 block">User Suggestion Prompts</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-20 text-[11px] p-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-slate-50"
              placeholder="Describe the case study details..."
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-semibold mb-1 block">File Context Upload</label>
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] bg-slate-50 border border-slate-200 rounded p-1.5">
                  <span className="truncate flex-1 mr-2 text-slate-600">{file.name}</span>
                  <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.csv"
                  onChange={handleFileChange}
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="w-full h-8 border border-slate-200 rounded flex items-center justify-center text-slate-500 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm gap-1.5"
                >
                  <Paperclip className="w-3 h-3" />
                  <span className="text-[10px] font-medium">Attach files</span>
                </label>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-slate-500 font-semibold">Target URL Parse</label>
              <button onClick={addUrl} className="text-blue-600 hover:text-blue-500 bg-blue-50 rounded p-0.5" title="Add URL">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {urls.map((url, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(i, e.target.value)}
                    className="flex-1 text-[11px] p-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50"
                    placeholder="Paste reference URL..."
                  />
                  <button onClick={() => removeUrl(i)} className="text-slate-400 hover:text-red-500 shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {urls.length === 0 && (
                <div className="text-[10px] text-slate-400 italic">No URLs added. Click + to add one.</div>
              )}
            </div>
          </div>
        </div>
        {!selectedCode && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center p-6 text-center">
             <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                   <div className="w-6 h-6 border-2 border-slate-300 rounded-full border-t-blue-500 animate-spin"></div>
                </div>
                <div>
                   <h3 className="text-sm font-bold text-slate-700">Awaiting Syllabus Code</h3>
                   <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">Please select a syllabus unit from the matrix on the left to activate data input.</p>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-4 bg-cyan-400 rounded-full"></div>
          <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">IGCSE Command Words</h3>
        </div>
        <div className="space-y-2 text-[10px] text-slate-300">
          <p><span className="text-cyan-400 font-bold tracking-wide">DESCRIBE</span> - State the main characteristics or features.</p>
          <p><span className="text-cyan-400 font-bold tracking-wide">EXPLAIN</span> - Set out purposes or reasons / make relationships evident.</p>
          <p><span className="text-cyan-400 font-bold tracking-wide">EVALUATE</span> - Judge or calculate the quality, importance, amount, or value.</p>
          <p><span className="text-cyan-400 font-bold tracking-wide">COMPARE</span> - Identify and comment on similarities and/or differences.</p>
        </div>
      </div>
    </section>
  );
}
