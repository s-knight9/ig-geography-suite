import React, { useState } from 'react';
import { AppProvider, useAppContext } from './store';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { Toolbar } from './components/Toolbar';
import { exportToPdf } from './utils';

function Header({ onBackToPortal }: { onBackToPortal?: () => void }) {
  const { state, dispatch } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPdf(state.pages);
    } catch (e) {
      console.error(e);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-[44px] h-[44px] bg-[#0866FF] rounded-[12px] flex items-center justify-center shadow-sm">
          <span className="text-[20px] font-black text-white tracking-tight">IG</span>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-[20px] font-black text-[#0866FF] uppercase tracking-wide leading-tight">OS MAP MAKER</h1>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Crafting OS Maps To Scale</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => dispatch({ type: 'TOGGLE_RULER' })}
          className={`px-4 py-2 text-sm rounded-lg font-bold transition-colors border ${state.showRuler ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          {state.showRuler ? 'Hide Ruler' : 'Show Ruler'}
        </button>
        <button 
          onClick={handleExport}
          disabled={isExporting || state.pages.length === 0}
          className="px-5 py-2.5 min-w-[140px] text-sm bg-[#0866FF] text-white rounded-[8px] hover:bg-blue-700 font-bold transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
        >
          {isExporting ? 'Exporting...' : 'Export as PDF'}
        </button>
        {onBackToPortal && (
          <button 
            onClick={onBackToPortal}
            className="px-5 py-2.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-[8px] font-bold border border-red-200 transition-colors flex items-center justify-center shadow-sm"
          >
            EXIT
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 ml-2"></div>
      </div>
    </header>
  );
}

export default function App({ 
  onBackToPortal, 
  activeUserEmail, 
  activeTeacherCode,
  isDark,
  toggleDark
}: { 
  onBackToPortal?: () => void;
  activeUserEmail?: string;
  activeTeacherCode?: string;
  isDark?: boolean;
  toggleDark?: () => void;
}) {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen w-full bg-[#f3f4f6] font-sans overflow-hidden">
        <Header onBackToPortal={onBackToPortal} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Workspace />
          <Toolbar />
        </div>
      </div>
    </AppProvider>
  );
}
