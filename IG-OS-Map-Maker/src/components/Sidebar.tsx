import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Plus, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { ElementData } from '../types';
import { convertPdfToImage } from '../utils';

export function Sidebar() {
  const { state, dispatch } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    try {
      let url = URL.createObjectURL(file);
      if (file.type === 'application/pdf') {
        url = await convertPdfToImage(file);
      }
      
      const img = new Image();
      img.onload = () => {
        const dpi = 300;
        const widthCm = (img.naturalWidth / dpi) * 2.54;
        const heightCm = (img.naturalHeight / dpi) * 2.54;
        
        const el: ElementData = {
          id: crypto.randomUUID(),
          src: url,
          nativeWidth: img.naturalWidth,
          nativeHeight: img.naturalHeight,
          dpi: dpi,
          width: widthCm,
          height: heightCm,
          x: (42 - widthCm) / 2,
          y: (29.7 - heightCm) / 2,
          rotation: 0
        };

        dispatch({ type: 'ADD_ELEMENT', payload: { pageId: state.activePageId, element: el } });
        dispatch({ type: 'SET_SELECTED_ELEMENTS', payload: [el.id] });
        setIsProcessing(false);
      };
      img.onerror = () => {
        alert('Failed to load image');
        setIsProcessing(false);
      };
      img.src = url;
    } catch (err) {
      console.error(err);
      alert('Failed to process file');
      setIsProcessing(false);
    }
    e.target.value = '';
  };

  return (
    <aside className="w-44 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-3 border-b border-gray-100">
        <button 
          onClick={() => {
            const newId = crypto.randomUUID();
            dispatch({ type: 'ADD_PAGE', payload: { id: newId, elements: [] } });
            dispatch({ type: 'SET_ACTIVE_PAGE', payload: newId });
          }}
          className="w-full py-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded text-[10px] text-gray-500 font-bold hover:bg-gray-100 transition-colors uppercase tracking-wider"
        >
          + New Page
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {state.pages.map((page, index) => {
          const isActive = state.activePageId === page.id;
          return (
            <div 
              key={page.id} 
              onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: page.id })}
              className="relative group cursor-pointer"
            >
              <div className={`aspect-[1.414/1] bg-white border-2 shadow-sm rounded overflow-hidden p-1 ${isActive ? 'border-blue-500' : 'border-gray-200 opacity-70 hover:opacity-100'}`}>
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[8px] text-gray-400">
                  {page.elements.length} layer(s)
                </div>
              </div>
              <span className={`text-[10px] mt-1 block text-center ${isActive ? 'font-medium text-blue-600' : 'text-gray-400'}`}>Slide {index + 1}</span>
              
              {state.pages.length > 1 && (
                 <button 
                   onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_PAGE', payload: page.id }); }}
                   className="absolute top-1 right-1 p-1 bg-white rounded-md shadow opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 transition-all"
                 >
                   <Trash2 className="w-3 h-3"/>
                 </button>
              )}
            </div>
          );
        })}
        
        <div className="h-32 mt-8 border-t border-gray-100 pt-4 flex flex-col items-center justify-center text-center px-4">
          <label className={`cursor-pointer flex flex-col items-center justify-center w-full h-full group ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="w-8 h-8 mb-2 text-gray-300 group-hover:text-blue-500 transition-colors">
              {isProcessing ? (
                <Loader2 className="w-full h-full animate-spin text-blue-500" />
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              )}
            </div>
            <p className="text-[9px] text-gray-400 group-hover:text-blue-600 uppercase font-bold transition-colors">
              {isProcessing ? 'Processing PDF...' : 'Upload Maps (PDF/PNG)'}
            </p>
            <input type="file" accept="application/pdf, image/png, image/jpeg, image/webp" className="hidden" onChange={handleFileUpload} disabled={isProcessing} />
          </label>
        </div>
      </div>
    </aside>
  );
}
