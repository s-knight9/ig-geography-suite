import React from 'react';
import { useAppContext } from '../store';
import { RotateCw, Crop, Trash2, Layers, ArrowUp, ArrowDown, MoveUp, MoveDown } from 'lucide-react';

export function Toolbar() {
  const { state, dispatch } = useAppContext();
  
  const activePage = state.pages.find(p => p.id === state.activePageId);
  const selectedElements = activePage?.elements.filter(e => state.selectedElementIds.includes(e.id)) || [];
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
  const isMultiSelect = selectedElements.length > 1;

  const handleExtractCrop = () => {
    if (!selectedElement || !selectedElement.crop) return;
    
    // Create new page
    const newPageId = crypto.randomUUID();
    dispatch({ type: 'ADD_PAGE', payload: { id: newPageId, elements: [] } });
    
    // Need to calculate dimensions of the cropped area
    const { t, r, b, l } = selectedElement.crop;
    const newWidth = selectedElement.width - l - r;
    const newHeight = selectedElement.height - t - b;

    // We'll just clone the element and apply crop as explicit bounds (in a full app, this would generate a new image buffer)
    const extractedEl = {
      ...selectedElement,
      id: crypto.randomUUID(),
      x: 0,
      y: 0,
      width: newWidth,
      height: newHeight,
      crop: { t: 0, r: 0, b: 0, l: 0 },
      // Update native dimensions
      nativeWidth: Math.round(newWidth * (selectedElement.nativeWidth / selectedElement.width)),
      nativeHeight: Math.round(newHeight * (selectedElement.nativeHeight / selectedElement.height)),
    };

    dispatch({ type: 'ADD_ELEMENT', payload: { pageId: newPageId, element: extractedEl } });
    dispatch({ type: 'SET_ACTIVE_PAGE', payload: newPageId });
  };

  return (
    <aside className="w-64 bg-white border-l border-gray-200 shrink-0 p-4 flex flex-col z-10 overflow-auto">
      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Layer Controls</h2>
      
      {selectedElements.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No layer selected</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-2 border-b border-gray-100 pb-4">
            <button
              onClick={() => dispatch({ type: 'BRING_TO_FRONT' })}
              className="flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded text-[9px] hover:bg-gray-50 flex-col"
            >
              <MoveUp className="w-3 h-3 mb-1" /> To Front
            </button>
            <button
              onClick={() => dispatch({ type: 'SEND_TO_BACK' })}
              className="flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded text-[9px] hover:bg-gray-50 flex-col"
            >
              <MoveDown className="w-3 h-3 mb-1" /> To Back
            </button>
            <button
              onClick={() => dispatch({ type: 'MOVE_UP' })}
              className="flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded text-[9px] hover:bg-gray-50 flex-col"
            >
              <ArrowUp className="w-3 h-3 mb-1" /> Move Up
            </button>
            <button
              onClick={() => dispatch({ type: 'MOVE_DOWN' })}
              className="flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded text-[9px] hover:bg-gray-50 flex-col"
            >
              <ArrowDown className="w-3 h-3 mb-1" /> Move Down
            </button>
          </div>

          <div className="mb-6 border-b border-gray-100 pb-4 flex gap-2">
             <button
               onClick={() => dispatch({ type: 'GROUP_ELEMENTS' })}
               disabled={!isMultiSelect}
               className="flex-1 py-1.5 border border-blue-200 text-blue-700 bg-blue-50 rounded text-[10px] disabled:opacity-50 font-medium"
             >
               Group Items
             </button>
             <button
               onClick={() => dispatch({ type: 'UNGROUP_ELEMENTS' })}
               disabled={selectedElements.every(e => !e.groupId)}
               className="flex-1 py-1.5 border border-amber-200 text-amber-700 bg-amber-50 rounded text-[10px] disabled:opacity-50 font-medium"
             >
               Ungroup
             </button>
          </div>

          {selectedElement && (
            <>
              <div className="mb-6">
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Rotation</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="-180" max="180" 
                    value={selectedElement.rotation}
                    onChange={(e) => dispatch({ 
                      type: 'UPDATE_ELEMENT', 
                      payload: { id: selectedElement.id, updates: { rotation: Number(e.target.value) } }
                    })}
                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{selectedElement.rotation}°</span>
                </div>
                <div className="flex justify-between mt-2">
                  <button 
                    onClick={() => dispatch({ 
                      type: 'UPDATE_ELEMENT', 
                      payload: { id: selectedElement.id, updates: { rotation: selectedElement.rotation - 90 } }
                    })}
                    className="px-2 py-1 border border-gray-200 rounded text-[9px] hover:bg-gray-50">90° CCW</button>
                  <button 
                    onClick={() => dispatch({ 
                      type: 'UPDATE_ELEMENT', 
                      payload: { id: selectedElement.id, updates: { rotation: selectedElement.rotation + 90 } }
                    })}
                    className="px-2 py-1 border border-gray-200 rounded text-[9px] hover:bg-gray-50">90° CW</button>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Crop Options</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => dispatch({ type: 'SET_CROP_MODE', payload: !state.cropMode })}
                    className={`flex items-center justify-center gap-2 py-2 border rounded text-[10px] font-medium transition-colors ${state.cropMode ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    <Crop className="w-3 h-3" />
                    {state.cropMode ? 'Cancel' : 'Apply Crop'}
                  </button>
                  <button 
                    disabled={!state.cropMode}
                    onClick={handleExtractCrop}
                    className="flex items-center justify-center gap-2 py-2 border border-blue-600 bg-blue-50 text-blue-700 rounded text-[10px] font-bold shadow-sm disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-50"
                  >
                    <Layers className="w-3 h-3" />
                    Extract to New
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 mt-2">Active crop box must be applied from the workspace interface over the image.</p>
              </div>

              <div className="mb-4">
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Print Size (CM)</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <span className="text-[9px] text-gray-400 block mb-1">Width</span>
                      <input 
                        type="number" 
                        value={Number(selectedElement.width.toFixed(2))}
                        onChange={(e) => {
                          const width = Number(e.target.value) || 1;
                          const dpi = (selectedElement.nativeWidth / width) * 2.54;
                          const height = (selectedElement.nativeHeight / dpi) * 2.54;
                          dispatch({ type: 'UPDATE_ELEMENT', payload: { id: selectedElement.id, updates: { width, height, dpi } } })
                        }}
                        className="w-full border border-gray-300 px-1 py-1 text-[10px] font-mono rounded hover:border-blue-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] text-gray-400 block mb-1">Height</span>
                      <input 
                        type="number" 
                        value={Number(selectedElement.height.toFixed(2))}
                        onChange={(e) => {
                          const height = Number(e.target.value) || 1;
                          const dpi = (selectedElement.nativeHeight / height) * 2.54;
                          const width = (selectedElement.nativeWidth / dpi) * 2.54;
                          dispatch({ type: 'UPDATE_ELEMENT', payload: { id: selectedElement.id, updates: { width, height, dpi } } })
                        }}
                        className="w-full border border-gray-300 px-1 py-1 text-[10px] font-mono rounded hover:border-blue-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-gray-50 rounded p-3 border border-gray-200">
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Metadata</label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center group">
                    <span className="text-[10px] text-gray-400">Scale DPI</span>
                    <input 
                      type="number" 
                      value={Math.round(selectedElement.dpi)}
                      onChange={(e) => {
                        const dpi = Number(e.target.value) || 1;
                        const w = (selectedElement.nativeWidth / dpi) * 2.54;
                        const h = (selectedElement.nativeHeight / dpi) * 2.54;
                        dispatch({ type: 'UPDATE_ELEMENT', payload: { id: selectedElement.id, updates: { dpi, width: w, height: h } } })
                      }}
                      className="w-16 border-b border-gray-300 bg-transparent px-1 py-0 text-[10px] font-mono text-right hover:border-gray-400 outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-gray-400">Native Size</span>
                    <span className="text-[10px] font-mono">{Math.round(selectedElement.nativeWidth)} x {Math.round(selectedElement.nativeHeight)}px</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {isMultiSelect && (
             <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] bg-gray-50 border border-gray-200 rounded border-dashed text-center p-4 text-gray-400">
                <Layers className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-bold text-gray-500 uppercase">{selectedElements.length} Items Selected</span>
                <span className="text-[10px] mt-1">Multi-item precise adjustments disabled</span>
             </div>
          )}

          <div className="mt-4 flex gap-2 w-full pt-4 border-t border-gray-100">
             <button
              onClick={() => {
                selectedElements.forEach(el => dispatch({ type: 'DELETE_ELEMENT', payload: { id: el.id } }));
                dispatch({ type: 'SET_SELECTED_ELEMENTS', payload: [] });
              }}
              className="flex items-center justify-center gap-1 w-full py-2 text-[10px] font-bold border border-red-200 text-red-600 rounded hover:bg-red-50 uppercase"
             >
                <Trash2 className="w-3 h-3" />
                Delete Selected
             </button>
          </div>
        </>
      )}
    </aside>
  );
}
