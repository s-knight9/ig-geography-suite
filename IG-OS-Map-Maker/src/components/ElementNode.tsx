import React from 'react';
import { ElementData, PIXELS_PER_CM } from '../types';
import { useAppContext } from '../store';
import { RotateCw } from 'lucide-react';

export const ElementNode: React.FC<{ element: ElementData, zoom: number }> = ({ element, zoom }) => {
  const { state, dispatch } = useAppContext();
  const isSelected = state.selectedElementIds.includes(element.id);

  const crop = element.crop || { t: 0, r: 0, b: 0, l: 0 };
  const cropT = crop.t * PIXELS_PER_CM;
  const cropR = crop.r * PIXELS_PER_CM;
  const cropB = crop.b * PIXELS_PER_CM;
  const cropL = crop.l * PIXELS_PER_CM;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      dispatch({ type: 'TOGGLE_SELECTED_ELEMENT', payload: element.id });
      return; // Wait for next interaction to drag
    }

    if (!isSelected) {
      dispatch({ type: 'SET_SELECTED_ELEMENTS', payload: [element.id] });
    }

    if (state.cropMode && isSelected) return;

    const startX = e.clientX;
    const startY = e.clientY;
    
    // We capture the initial X and Y for all selected elements
    // Since state from context might be stale in onPointerMove, we need to get the latest elements
    const activePage = state.pages.find(p => p.id === state.activePageId);
    if (!activePage) return;
    
    // Determine which elements to move (either current one if not selected yet, or all selected)
    const elementsToMove = isSelected ? activePage.elements.filter(el => state.selectedElementIds.includes(el.id)) : [element];
    const initialPositions = new Map<string, { x: number, y: number }>(
      elementsToMove.map(el => [el.id, { x: el.x, y: el.y }])
    );

    const onPointerMove = (ev: PointerEvent) => {
      const dx_px = (ev.clientX - startX) / zoom;
      const dy_px = (ev.clientY - startY) / zoom;
      
      const dx_cm = dx_px / PIXELS_PER_CM;
      const dy_cm = dy_px / PIXELS_PER_CM;
      
      elementsToMove.forEach(el => {
        const initPos = initialPositions.get(el.id);
        if (initPos) {
          dispatch({
            type: 'UPDATE_ELEMENT',
            payload: { id: el.id, updates: { x: initPos.x + dx_cm, y: initPos.y + dy_cm } }
          });
        }
      });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleRotatePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const onPointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - centerX;
      const dy = ev.clientY - centerY;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle += 90; // Adjust because our rotation is 0 at top
      
      dispatch({
        type: 'UPDATE_ELEMENT',
        payload: { id: element.id, updates: { rotation: angle } }
      });
    };
    const onPointerUp = () => {
       window.removeEventListener('pointermove', onPointerMove);
       window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleCropDrag = (e: React.PointerEvent, pos: string) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = { ...crop };
    
    const angleRad = (element.rotation * Math.PI) / 180;
    const cosA = Math.cos(-angleRad);
    const sinA = Math.sin(-angleRad);

    const onPointerMove = (ev: PointerEvent) => {
       const dxScreen = (ev.clientX - startX) / zoom;
       const dyScreen = (ev.clientY - startY) / zoom;
       
       const dxLocalCm = (dxScreen * cosA - dyScreen * sinA) / PIXELS_PER_CM;
       const dyLocalCm = (dxScreen * sinA + dyScreen * cosA) / PIXELS_PER_CM;
       
       let newCrop = { ...startCrop };
       
       if (pos.includes('w')) {
          newCrop.l = Math.max(0, startCrop.l + dxLocalCm);
          if (newCrop.l > element.width - newCrop.r - 0.5) newCrop.l = element.width - newCrop.r - 0.5;
       }
       if (pos.includes('e')) {
          newCrop.r = Math.max(0, startCrop.r - dxLocalCm);
          if (newCrop.r > element.width - newCrop.l - 0.5) newCrop.r = element.width - newCrop.l - 0.5;
       }
       if (pos.includes('n')) {
          newCrop.t = Math.max(0, startCrop.t + dyLocalCm);
          if (newCrop.t > element.height - newCrop.b - 0.5) newCrop.t = element.height - newCrop.b - 0.5;
       }
       if (pos.includes('s')) {
          newCrop.b = Math.max(0, startCrop.b - dyLocalCm);
          if (newCrop.b > element.height - newCrop.t - 0.5) newCrop.b = element.height - newCrop.t - 0.5;
       }
       
       dispatch({
         type: 'UPDATE_ELEMENT',
         payload: { id: element.id, updates: { crop: newCrop } }
       });
    };
    
    const onPointerUp = () => {
       window.removeEventListener('pointermove', onPointerMove);
       window.removeEventListener('pointerup', onPointerUp);
    };
    
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const getCursorClass = (pos: string) => {
    const posAngleMap: Record<string, number> = {
      'n': 0, 'ne': 45, 'e': 90, 'se': 135, 's': 180, 'sw': 225, 'w': 270, 'nw': 315
    };
    const baseAngle = posAngleMap[pos];
    let angle = Math.round((baseAngle + element.rotation) / 45) * 45;
    angle = ((angle % 360) + 360) % 360; // Normalize
    
    if (angle === 0 || angle === 180) return 'cursor-ns-resize';
    if (angle === 45 || angle === 225) return 'cursor-nesw-resize';
    if (angle === 90 || angle === 270) return 'cursor-ew-resize';
    if (angle === 135 || angle === 315) return 'cursor-nwse-resize';
    return 'cursor-default';
  };

  const CropHandle = ({ pos, style }: { pos: string, style: React.CSSProperties }) => (
    <div 
      onPointerDown={(e) => handleCropDrag(e, pos)}
      className={`absolute bg-gray-900 pointer-events-auto shadow-sm ${getCursorClass(pos)}`}
      style={style}
    />
  );

  const hThick = 4;
  const hLength = 24;

  return (
    <div
      onPointerDown={handlePointerDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        dispatch({ type: 'SET_SELECTED_ELEMENTS', payload: [element.id] });
        dispatch({ type: 'SET_CROP_MODE', payload: true });
      }}
      style={{
        position: 'absolute',
        top: element.y * PIXELS_PER_CM,
        left: element.x * PIXELS_PER_CM,
        width: element.width * PIXELS_PER_CM,
        height: element.height * PIXELS_PER_CM,
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: 'center center',
        cursor: state.cropMode && isSelected ? 'default' : 'move',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
      className="transition-shadow"
    >
      {state.cropMode && isSelected && (
        <img 
          src={element.src} 
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'fill', position: 'absolute', top: 0, left: 0, opacity: 0.4, pointerEvents: 'auto' }}
        />
      )}

      <img 
        src={element.src} 
        alt="Map section layer" 
        draggable={false}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'fill',
          position: 'relative',
          zIndex: 5,
          clipPath: `inset(${cropT}px ${cropR}px ${cropB}px ${cropL}px)`,
          pointerEvents: 'auto'
        }}
      />

      {state.cropMode && isSelected && (
        <div style={{
          position: 'absolute',
          top: cropT, left: cropL, right: cropR, bottom: cropB,
          border: '1px solid rgba(0,0,0,0.5)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.7), 0 0 0 9999px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          {/* Top-Left */}
          <CropHandle pos="nw" style={{ top: -hThick, left: -hThick, width: hLength, height: hThick }} />
          <CropHandle pos="nw" style={{ top: -hThick, left: -hThick, width: hThick, height: hLength }} />
          
          {/* Top-Right */}
          <CropHandle pos="ne" style={{ top: -hThick, right: -hThick, width: hLength, height: hThick }} />
          <CropHandle pos="ne" style={{ top: -hThick, right: -hThick, width: hThick, height: hLength }} />
          
          {/* Bottom-Left */}
          <CropHandle pos="sw" style={{ bottom: -hThick, left: -hThick, width: hLength, height: hThick }} />
          <CropHandle pos="sw" style={{ bottom: -hThick, left: -hThick, width: hThick, height: hLength }} />
          
          {/* Bottom-Right */}
          <CropHandle pos="se" style={{ bottom: -hThick, right: -hThick, width: hLength, height: hThick }} />
          <CropHandle pos="se" style={{ bottom: -hThick, right: -hThick, width: hThick, height: hLength }} />
          
          {/* Middles */}
          <CropHandle pos="n" style={{ top: -hThick, left: '50%', transform: 'translateX(-50%)', width: hLength, height: hThick }} />
          <CropHandle pos="s" style={{ bottom: -hThick, left: '50%', transform: 'translateX(-50%)', width: hLength, height: hThick }} />
          <CropHandle pos="w" style={{ left: -hThick, top: '50%', transform: 'translateY(-50%)', width: hThick, height: hLength }} />
          <CropHandle pos="e" style={{ right: -hThick, top: '50%', transform: 'translateY(-50%)', width: hThick, height: hLength }} />
        </div>
      )}
      
      {isSelected && !state.cropMode && (
        <>
          <div style={{
            position: 'absolute',
            top: cropT, left: cropL, right: cropR, bottom: cropB,
            border: '2px solid #8ab4f8',
            pointerEvents: 'none',
          }} />
          <div 
            className="absolute bg-white border border-[#8ab4f8] rounded-full flex items-center justify-center cursor-crosshair text-[#8ab4f8] shadow-sm pointer-events-auto w-6 h-6"
            style={{ 
              left: `calc(${cropL}px + (${element.width * PIXELS_PER_CM - cropL - cropR}px / 2))`,
              top: `calc(${cropT}px - 48px)`,
              transform: 'translateX(-50%)', 
              zIndex: 20 
            }}
            onPointerDown={handleRotatePointerDown}
          >
            <RotateCw className="w-3 h-3" />
            <div className="absolute top-full left-1/2 w-[1px] h-6 bg-[#8ab4f8]" style={{ transform: 'translateX(-50%)' }} />
          </div>
        </>
      )}
    </div>
  );
}
