import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, RotateCcw, Video } from "lucide-react";

interface FlagFlipPlayerProps {
  countryId: string;
  countryName: string;
  flagCode: string;
}

const verifiedVideos: Record<string, string> = {
  'bangladesh': 'ljebhxk_9ys', // User provided link
  'egypt': 'jdNw0g7SOMc',
  'china': 'lzAESaVqix0',
  'india': 'vEy6tcU6eLU',
  'south-korea': 'zTK119W8MBA',
  'vietnam': 'kn1VrzMjst8',
  'philippines': 'LVFvRNRTEd4',
  'russia': 'K8zAbdYx9SU',
  'australia': 'ynHIlx5RgtI',
  'malaysia': 'dV-H1EKmCxA',
  'usa': 'Xp_TGilL9Sk',
  'poland': 'Hn8XXPl1vjU',
  'germany': 'wuClZjOdT30',
  'uk': '_uL3a3aMdMQ',
  'switzerland': 'xY77dfvTVpA',
  'brazil': 'JFfcD-SkqIc',
  'mexico': 'Kxy74EAjAec',
  'drc': 'dD3ZFQ62Vxc',
  'nigeria': 'h4sWFJFge54',
  'south-africa': 'tP6G2wDrUUU',
  'ethiopia': 'eAB6o1rLH1w',
  'sudan': 'GwcXYTX2GmA',
  'niger': 'AHeq99pojLo',
  'chad': 'jJZ66hPQLe4',
  'iceland': 'ocE9DNZxPUk',
  'tuvalu': 'H8z8glfqsm0',
  'peru': 'x0XCXGXGZMs',
  'rwanda': '_MbzQNFC2kA',
  'kenya': 'DWyjf9dhL4o',
  'thailand': 'IWoq9N4fL9k',
  'belgium': '0TuMvWCbM-g',
  'france': 'g0QrBphsioM',
  'netherlands': 'f4TmQEZzsec',
  'singapore': 'w-z4q7F5Bcs',
  'uae': 'juHLoPYaWHk',
  'saudi-arabia': 'tP68QwVvAZk',
  'turkey': 'BzMYQIo-0NA',
  'ukraine': 'cnKU_osbg3s',
  'indonesia': 'FsXc3FcWi3g',
  'iran': '2xQM4Zy5zIk',
  'ireland': 'yWZiO7YNoPQ',
  'italy': 'G_KMybIvv4c',
  'cuba': 'iQnhoYc2QTg',
  'israel': 'AWKmazrRIwA',
  'japan': 'j3XpfBChLyk',
  'canada': 'SxhUsPBFPkU',
  'venezuela': 'KKLY3oO8WdQ'
};

const TUVALU_FLAG_URL = "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/tv.svg";

export function FlagFlipPlayer({ countryId, countryName, flagCode }: FlagFlipPlayerProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset rotation when country selection changes
  useEffect(() => {
    setIsFlipped(false);
  }, [countryId]);

  const youtubeId = verifiedVideos[countryId];
  // If we have a verified video ID, use it. Otherwise, use search query which YouTube automatically resolves!
  const embedSrc = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
    : `https://www.youtube.com/embed?listType=search&list=Geography+Now+${encodeURIComponent(countryName)}&autoplay=1&rel=0`;

  return (
    <div className="flex flex-col gap-2.5">
      {/* 3D Flip Container with Perspective */}
      <div 
        className="relative aspect-[3/2] w-full rounded-xl overflow-hidden border border-slate-200 shadow-md bg-slate-950 cursor-pointer select-none group"
        onDoubleClick={() => setIsFlipped(!isFlipped)}
        title="Double click to flip!"
        id="flag-player-container"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="w-full h-full relative"
        >
          {/* Front Face (Flag) */}
          <div 
            style={{ 
              backfaceVisibility: "hidden",
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%"
            }}
            className={`flex flex-col justify-between ${
              isFlipped ? "pointer-events-none" : "pointer-events-auto shadow-xs"
            }`}
          >
            <img 
              src={countryId === 'tuvalu' ? TUVALU_FLAG_URL : `https://flagcdn.com/w640/${flagCode}.png`} 
              alt={`${countryName} Flag`}
              className="w-full h-full object-cover select-none"
              referrerPolicy="no-referrer"
            />
            
            {/* Overlay Gradient & Interactive Hint */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
              <div className="bg-slate-950/90 text-white border border-slate-800 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-xs pointer-events-none">
                <Video className="w-3 h-3 text-[#00ba70] animate-pulse" />
                Double-Click to Flip for Video
              </div>
            </div>

            {/* Quick action button play trigger on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              className="absolute right-3.5 bottom-3.5 self-end p-2 bg-slate-950/95 hover:bg-slate-900 text-[#00ba70] border border-slate-800 rounded-full shadow-lg h-9 w-9 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group/btn"
              title="Flip for Geography Now video"
              aria-label="Flip for video"
            >
              <Play className="w-4 h-4 fill-current ml-0.5 animate-pulse" />
            </button>
          </div>

          {/* Back Face (YouTube Video Player) */}
          <div 
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)",
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%"
            }}
            className={`flex flex-col bg-slate-950 print-hidden ${
              isFlipped ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            {isFlipped ? (
              <iframe
                src={embedSrc}
                title={`Geography Now! ${countryName}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-slate-950" />
            )}

            {/* Flip Back Action Overlay Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="absolute left-3 bottom-3 p-1.5 bg-slate-950/90 hover:bg-slate-900 text-white border border-slate-800 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg backdrop-blur-xs cursor-pointer transition-all active:scale-95"
              aria-label="Flip back to flag"
            >
              <RotateCcw className="w-3 h-3 text-[#00ba70]" />
              Flip Flag
            </button>
          </div>
        </motion.div>
      </div>

      {/* Flag helper caption with interactive action triggers */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-base font-black text-slate-800 leading-tight">
          {countryName}
        </h3>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          {isFlipped ? "Show Flag" : "Watch Video"}
        </button>
      </div>
    </div>
  );
}
