import React, { useState, useRef, useEffect } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title = "Are you sure?", description = "This action cannot be undone." }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const maxDrag = 220; // Approx width of container (290) - width of thumb (64) - padding

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || !thumbRef.current) return;
    
    // We only care about movement delta from initial position or we can just track absolute X relative to container
    const containerRect = containerRef.current.getBoundingClientRect();
    let newX = e.clientX - containerRect.left - 32; // 32 is half thumb width to center it on cursor
    
    if (newX < 0) newX = 0;
    if (newX > maxDrag) newX = maxDrag;
    
    setDragX(newX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (dragX > maxDrag * 0.6) {
      // Trigger confirm
      setDragX(maxDrag);
      setTimeout(() => {
        onConfirm();
        onClose();
        setDragX(0);
      }, 200);
    } else {
      // Snap back
      setDragX(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-[340px] shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{title}</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">{description}</p>
          
          <div 
            ref={containerRef}
            className="relative w-full h-12 bg-red-50 dark:bg-red-900/10 rounded-xl overflow-hidden flex items-center justify-center border border-red-100 dark:border-red-900/20"
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 absolute z-0 select-none pointer-events-none flex items-center gap-2 mb-0.5 ml-4 opacity-70">
               Swipe to delete <span className="text-red-500 text-base leading-none">→</span>
            </span>
            <div
              ref={thumbRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                transform: `translateX(${dragX}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease'
              }}
              className="absolute left-1 w-16 h-10 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10 shadow shadow-red-500/20 select-none touch-none"
            >
              <Trash2 className="w-4 h-4 text-white pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
