import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { useAppContext } from '../store';
import { ElementNode } from './ElementNode';
import { Ruler } from './Ruler';
import { PIXELS_PER_CM } from '../types';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const A3_WIDTH_CM = 42;
const A3_HEIGHT_CM = 29.7;
const A3_WIDTH_PX = A3_WIDTH_CM * PIXELS_PER_CM;
const A3_HEIGHT_PX = A3_HEIGHT_CM * PIXELS_PER_CM;

export function Workspace() {
  const { state, dispatch } = useAppContext();
  const activePage = state.pages.find(p => p.id === state.activePageId);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef<{x: number, y: number} | null>(null);
  
  const [fitZoom, setFitZoom] = useState(1);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, endX: number, endY: number } | null>(null);

  useEffect(() => {
    const updateZoom = () => {
      if (!containerRef.current) return;
      // Get the bounding client rect of the viewport minus some padding
      const { clientWidth, clientHeight } = containerRef.current;
      const scaleX = Math.max((clientWidth - 100) / A3_WIDTH_PX, 0.1); 
      const scaleY = Math.max((clientHeight - 100) / A3_HEIGHT_PX, 0.1);
      setFitZoom(Math.min(scaleX, scaleY));
    };
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  const currentZoom = manualZoom !== null ? manualZoom : fitZoom;

  const adjustScrollForZoom = (newZoom: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const zoomRatio = newZoom / currentZoom;
    
    const centerScrollX = container.scrollLeft + container.clientWidth / 2;
    const centerScrollY = container.scrollTop + container.clientHeight / 2;
    
    const newScrollX = centerScrollX * zoomRatio - container.clientWidth / 2;
    const newScrollY = centerScrollY * zoomRatio - container.clientHeight / 2;

    pendingScrollRef.current = { x: newScrollX, y: newScrollY };
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newZoom = currentZoom * 1.25;
    adjustScrollForZoom(newZoom);
    setManualZoom(newZoom);
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newZoom = currentZoom / 1.25;
    adjustScrollForZoom(newZoom);
    setManualZoom(newZoom);
  };

  const handleZoomFit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setManualZoom(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting inputs like input boxes in toolbar
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
         dispatch({ type: 'COPY_ELEMENT' });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
         dispatch({ type: 'PASTE_ELEMENT' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  useLayoutEffect(() => {
    if (pendingScrollRef.current && containerRef.current) {
      containerRef.current.scrollLeft = pendingScrollRef.current.x;
      containerRef.current.scrollTop = pendingScrollRef.current.y;
      pendingScrollRef.current = null;
    }
  }, [manualZoom, currentZoom]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (!canvasRef.current || !activePage) return;

    if (state.cropMode) return;

    if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
      dispatch({ type: 'SET_SELECTED_ELEMENTS', payload: [] });
    }

    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Convert current mouse position to scaled workspace coordinates
    const startX = (e.clientX - canvasRect.left) / currentZoom / PIXELS_PER_CM;
    const startY = (e.clientY - canvasRect.top) / currentZoom / PIXELS_PER_CM;

    let currentBox = { startX, startY, endX: startX, endY: startY };
    setSelectionBox(currentBox);

    const onPointerMove = (ev: PointerEvent) => {
      const currentX = (ev.clientX - canvasRect.left) / currentZoom / PIXELS_PER_CM;
      const currentY = (ev.clientY - canvasRect.top) / currentZoom / PIXELS_PER_CM;
      currentBox = { ...currentBox, endX: currentX, endY: currentY };
      setSelectionBox(currentBox);
    };

    const onPointerUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      
      setSelectionBox(null);
      
      const minX = Math.min(currentBox.startX, currentBox.endX);
      const maxX = Math.max(currentBox.startX, currentBox.endX);
      const minY = Math.min(currentBox.startY, currentBox.endY);
      const maxY = Math.max(currentBox.startY, currentBox.endY);

      if (maxX - minX > 0.1 && maxY - minY > 0.1) {
        const selectedIds = activePage.elements.filter(el => {
          const elMinX = el.x;
          const elMaxX = el.x + el.width;
          const elMinY = el.y;
          const elMaxY = el.y + el.height;
          return !(elMaxX < minX || elMinX > maxX || elMaxY < minY || elMinY > maxY);
        }).map(el => el.id);

        if (selectedIds.length > 0) {
          let newSelection = [...state.selectedElementIds];
          if (!ev.shiftKey && !ev.metaKey && !ev.ctrlKey) {
            newSelection = [];
          }
          selectedIds.forEach(id => {
            if (!newSelection.includes(id)) newSelection.push(id);
          });
          dispatch({ type: 'SET_SELECTED_ELEMENTS', payload: newSelection });
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  if (!activePage) return null;

  return (
    <main className="flex-1 relative bg-[#e5e7eb] flex flex-col overflow-hidden">
      <div className="absolute top-4 left-4 flex gap-2 z-10 pointer-events-none">
        <div className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm text-[10px] font-mono">
          X: {state.selectedElementIds.length === 1 ? (activePage.elements.find(e => e.id === state.selectedElementIds[0])?.x || 0).toFixed(1) : '-'}cm Y: {state.selectedElementIds.length === 1 ? (activePage.elements.find(e => e.id === state.selectedElementIds[0])?.y || 0).toFixed(1) : '-'}cm
        </div>
        <div className="flex bg-white border border-gray-300 rounded shadow-sm overflow-hidden pointer-events-auto">
          <button onClick={handleZoomOut} className="px-2 py-1 hover:bg-gray-100 border-r border-gray-200">
            <ZoomOut className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <div className="px-3 py-1 text-[10px] font-mono font-medium min-w-[50px] text-center flex items-center justify-center">
            {Math.round(currentZoom * 100)}%
          </div>
          <button onClick={handleZoomFit} className="px-2 py-1 hover:bg-gray-100 border-l border-r border-gray-200" title="Fit to Screen">
            <Maximize className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button onClick={handleZoomIn} className="px-2 py-1 hover:bg-gray-100">
            <ZoomIn className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-auto w-full h-full relative"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
             dispatch({ type: 'SET_SELECTED_ELEMENTS', payload: [] });
          }
        }}
      >
        <div 
          className="w-max h-max min-w-full min-h-full p-10 flex items-center justify-center"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
               dispatch({ type: 'SET_SELECTED_ELEMENTS', payload: [] });
            }
          }}
        >
          <div 
            style={{
              width: A3_WIDTH_PX * currentZoom,
              height: A3_HEIGHT_PX * currentZoom,
            }}
            className="relative shrink-0"
          >
            <div 
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              style={{
                width: A3_WIDTH_PX,
                height: A3_HEIGHT_PX,
                transform: `scale(${currentZoom})`,
                transformOrigin: 'top left',
                backgroundColor: '#fff',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              }}
              className="absolute top-0 left-0 overflow-visible shrink-0 touch-none"
            >
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="grid grid-cols-10 grid-rows-10 w-full h-full border border-gray-300">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border-r border-b border-gray-300" />
              ))}
            </div>
          </div>
          
          {activePage.elements.map(el => (
            <ElementNode key={el.id} element={el} zoom={currentZoom} />
          ))}
          
          {state.showRuler && <Ruler zoom={currentZoom} />}

          {selectionBox && (
            <div 
              className="absolute border border-blue-500 bg-blue-500/20 pointer-events-none z-50"
              style={{
                left: Math.min(selectionBox.startX, selectionBox.endX) * PIXELS_PER_CM,
                top: Math.min(selectionBox.startY, selectionBox.endY) * PIXELS_PER_CM,
                width: Math.abs(selectionBox.startX - selectionBox.endX) * PIXELS_PER_CM,
                height: Math.abs(selectionBox.startY - selectionBox.endY) * PIXELS_PER_CM,
              }}
            />
          )}
          
          <div className="absolute bottom-2 right-4 text-[9px] font-mono text-gray-400 uppercase tracking-widest pointer-events-none">
            A3 Landscape View (420 x 297 mm)
          </div>
        </div>
        </div>
        </div>
      </div>
    </main>
  );
}
