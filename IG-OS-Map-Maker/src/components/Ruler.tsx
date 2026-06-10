import React, { useState } from 'react';
import { PIXELS_PER_CM } from '../types';

export function Ruler({ zoom }: { zoom: number }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...pos };

    const onPointerMove = (ev: PointerEvent) => {
      setPos({
        x: initialPos.x + (ev.clientX - startX) / zoom,
        y: initialPos.y + (ev.clientY - startY) / zoom,
      });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const rulerWidthCm = 30;
  const rulerHeightCm = 3;
  
  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        top: pos.y,
        left: pos.x,
        width: rulerWidthCm * PIXELS_PER_CM,
        height: rulerHeightCm * PIXELS_PER_CM,
        backgroundColor: 'rgba(255, 235, 59, 0.85)', // Yellow translucent
        border: '1px solid rgba(180, 160, 0, 0.8)',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 100,
        boxShadow: '4px 8px 15px rgba(0,0,0,0.2)',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div className="flex w-full h-full relative pointer-events-none">
        {Array.from({ length: rulerWidthCm * 10 + 1 }).map((_, i) => {
          const isCm = i % 10 === 0;
          const isHalfCm = i % 5 === 0 && !isCm;
          const tickHeight = isCm ? '100%' : isHalfCm ? '60%' : '30%';
          return (
            <div 
              key={i} 
              style={{
                position: 'absolute',
                left: i * (PIXELS_PER_CM / 10),
                bottom: 0,
                width: 1,
                height: tickHeight,
                backgroundColor: 'rgba(0,0,0,0.7)',
              }}
            >
              {isCm && i > 0 && <span className="absolute -top-4 -left-1.5 text-[10px] font-bold font-mono text-black/80">{i / 10}</span>}
            </div>
          );
        })}
      </div>
      <div className="absolute top-1 right-2 text-[10px] font-bold text-black/50 font-mono tracking-widest">30 CM</div>
    </div>
  );
}
