import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'motion/react';
import { Trash2, ArrowRight } from 'lucide-react';

interface Props {
  onConfirm: () => void;
  text?: string;
}

export default function SlideToConfirm({ onConfirm, text = "Slide to delete" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(200); // fallback
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth - 48); // 48 approx for knob
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 48);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > containerWidth * 0.75) {
      // Trigger confirm
      controls.start({ x: containerWidth });
      setTimeout(onConfirm, 200);
    } else {
      // Snap back
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const bgOpacity = useTransform(x, [0, containerWidth], [0.1, 1]);

  return (
    <div 
      ref={containerRef}
      className={`relative h-12 w-full max-w-sm mx-auto rounded-full flex items-center border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 overflow-hidden`}
    >
      <motion.div 
        className="absolute inset-0 bg-red-500"
        style={{ opacity: bgOpacity }}
      />
      <div className="absolute inset-0 flex items-center justify-center font-bold text-xs tracking-widest uppercase pointer-events-none text-red-700/60 dark:text-red-400">
        <span className="flex items-center gap-2">
          {text} <ArrowRight size={14} className="opacity-50" />
        </span>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: containerWidth > 0 ? containerWidth : 200 }}
        dragElastic={0}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="relative z-10 w-10 h-10 ml-1 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-sm bg-white dark:bg-slate-900 text-red-500 border border-red-100 dark:border-red-800"
      >
        <Trash2 size={16} />
      </motion.div>
    </div>
  );
}
