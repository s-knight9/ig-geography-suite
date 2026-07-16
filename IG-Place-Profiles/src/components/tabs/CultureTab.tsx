import React, { useState, useEffect, useMemo } from 'react';
import { DPPlaceProfile } from '../../types';
import { Handshake, MapPin, Box, Zap, Shuffle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface CultureTabProps {
  data: DPPlaceProfile;
}

// Fallback logic for countries without culture_tab defined in json
const getFallbackCultureData = (countryId: string) => {
  return {
    inglehart_welzel_coords: { x: 0, y: 0, cultural_zone: "Unmapped Data" },
    largest_diasporas: [{ destination: "Pending", population: "N/A", cultural_reach_impact: "Analysis pending." }],
    cultural_exports_and_landscape: {
      soft_power_exports: [{ medium: "General", examples: ["Data pending formulation"], global_reach_score: 50 }],
      spatial_landscape: { enclaves: ["Network pending"], architectural_footprint: "Data pending formulation", description: "Pending analysis." }
    },
    hybridity_and_glocalization: [{ concept: "Local/Global Synthesis", description: "Data pending.", glocalized_examples: ["In progress"], spatial_location: "Local/Global" }]
  };
};

export const CultureTab: React.FC<CultureTabProps> = ({ data }) => {
  // Try to use new data structure, otherwise use fallback
  let rawCultureData = data.culture_tab as any;
  
  // If the record exists but has the old structure, map it dynamically
  if (rawCultureData && rawCultureData.soft_power_exports && !rawCultureData.cultural_exports_and_landscape) {
    const old = rawCultureData as any;
    rawCultureData = {
      ...old,
      largest_diasporas: [{ destination: "Data migration pending", population: "N/A", cultural_reach_impact: "Please regenerate data to populate this field." }],
      cultural_exports_and_landscape: {
        soft_power_exports: old.soft_power_exports || [],
        spatial_landscape: { 
          enclaves: old.diaspora_and_landscape?.spatial_enclaves || [], 
          architectural_footprint: old.diaspora_and_landscape?.architectural_footprint || "",
          description: "Data migrated from older structural schema."
        }
      },
      hybridity_and_glocalization: (old.hybridity_case_studies || []).map((cs: any) => ({
        concept: "Hybridity Case Study",
        description: `Source: ${cs.original_elements} -> ${cs.hybrid_outcome}`,
        glocalized_examples: [cs.hybrid_outcome],
        spatial_location: cs.spatial_location || "N/A"
      }))
    };
  }

  const cultureData = rawCultureData || getFallbackCultureData(data.country_metadata.name);
  const currentCountryName = data.country_metadata.name;

  const [isAdmin, setIsAdmin] = useState(false);
  const [customOffsets, setCustomOffsets] = useState<Record<string, {x: number, y: number, zone?: string}>>({});

  useEffect(() => {
    const saved = localStorage.getItem('culturalMapOffsets');
    if (saved) {
      try {
        setCustomOffsets(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const culturalMapData: Record<string, { x: number, y: number, zone: string }> = {
    "Bangladesh": { x: -1.2, y: -1.4, zone: "African-Islamic" },
    "South Korea": { x: 0.9, y: 1.3, zone: "Confucian" },
    "USA": { x: 1.4, y: -0.2, zone: "English-Speaking" },
    "Sweden": { x: 2.2, y: 2.4, zone: "Protestant Europe" },
    "Vietnam": { x: -0.1, y: -0.3, zone: "Confucian" },
    "Egypt": { x: -1.5, y: -1.3, zone: "African-Islamic" },
    "Russia": { x: -0.8, y: 0.6, zone: "Orthodox Europe" },
    "Peru": { x: -0.4, y: -0.9, zone: "Latin America" },
    "Turkey": { x: -0.5, y: -0.6, zone: "African-Islamic" },
    "Thailand": { x: 0.3, y: 0.1, zone: "South Asia" },
    "Poland": { x: 0.8, y: -0.2, zone: "Catholic Europe" },
    "China": { x: -0.1, y: 0.4, zone: "Confucian" },
    "UK": { x: 1.2, y: 0.7, zone: "English-Speaking" },
    "France": { x: 1.2, y: 0.5, zone: "Catholic Europe" },
    "Germany": { x: 1.5, y: 1.0, zone: "Protestant Europe" },
    "Mexico": { x: 0.2, y: -1.2, zone: "Latin America" },
    "Brazil": { x: 0.0, y: -0.4, zone: "Latin America" },
    "India": { x: -0.5, y: -0.3, zone: "South Asia" },
    "Japan": { x: 1.0, y: 1.7, zone: "Confucian" },
    "Pakistan": { x: -1.0, y: -1.5, zone: "African-Islamic" },
    "Nigeria": { x: -0.8, y: -1.6, zone: "African-Islamic" },
    "Morocco": { x: -0.9, y: -1.1, zone: "African-Islamic" },
    "U.A.E.": { x: -0.5, y: -1.2, zone: "African-Islamic" },
    "Venezuela": { x: 0.1, y: -0.9, zone: "Latin America" }
  };

  const targetNode = customOffsets[currentCountryName] || culturalMapData[currentCountryName] || culturalMapData["Egypt"]; // Fallback if not found to prevent crash but show pending
  const isPending = !customOffsets[currentCountryName] && !culturalMapData[currentCountryName];

  // Visual Map Grid Calibration
  // Based on the specific image: https://upload.wikimedia.org/wikipedia/commons/6/6a/Inglehart_Values_Map.svg
  const mapXCoordToPercent = (val: number) => {
    // X Axis: -2.0 to 2.5
    const min = -2.0;
    const max = 2.5;
    // Calibration parameters estimating the pixel bounds of the map lines inside the SVG canvas
    const percentLeft = 14;  // -2.0 line is ~14% from left
    const percentRight = 94; // 2.5 line is ~94% from right
    const proportion = (val - min) / (max - min);
    return percentLeft + proportion * (percentRight - percentLeft);
  };

  const reverseMapXPercentToCoord = (percent: number) => {
    const min = -2.0;
    const max = 2.5;
    const percentLeft = 14;
    const percentRight = 94;
    const proportion = (percent - percentLeft) / (percentRight - percentLeft);
    return min + proportion * (max - min);
  };

  const mapYCoordToPercent = (val: number) => {
    // Y Axis: -2.5 to 2.5
    const min = -2.5;
    const max = 2.5;
    const percentBottom = 89; // -2.5 line is ~89% from border
    const percentTop = 3.5;    // 2.5 line is ~3.5% from border
    const proportion = (val - min) / (max - min);
    return percentBottom - proportion * (percentBottom - percentTop);
  };

  const reverseMapYPercentToCoord = (percent: number) => {
    const min = -2.5;
    const max = 2.5;
    const percentBottom = 89;
    const percentTop = 3.5;
    const proportion = (percentBottom - percent) / (percentBottom - percentTop);
    return min + proportion * (max - min);
  };

  const px = mapXCoordToPercent(targetNode.x);
  const py = mapYCoordToPercent(targetNode.y);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAdmin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percentX = ((e.clientX - rect.left) / rect.width) * 100;
    const percentY = ((e.clientY - rect.top) / rect.height) * 100;

    const newX = reverseMapXPercentToCoord(percentX);
    const newY = reverseMapYPercentToCoord(percentY);

    const updated = {
      ...customOffsets,
      [currentCountryName]: { x: newX, y: newY, zone: "Custom Override" }
    };
    setCustomOffsets(updated);
    localStorage.setItem('culturalMapOffsets', JSON.stringify(updated));
  };

  return (
    <div className="w-full font-sans text-slate-800 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500 ease-out">
      
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <Handshake className="w-7 h-7 text-indigo-600" />
          Culture & Global Interactions
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-4xl">
          Tracing soft power diffusion, spatial hybridization, and the structural positioning of {currentCountryName} within the global socio-cultural framework.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* TOP FULL: Inglehart-Welzel Map */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 w-full flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">Inglehart-Welzel Cultural Map</h3>
            <button 
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border transition-all ${isAdmin ? 'bg-rose-100 text-rose-700 border-rose-300 shadow-inner' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {isAdmin ? 'Admin Override Mode: ON' : 'Enable Admin Setup'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-6 font-medium">Evolutionary Cultural Plot (Secular-Rational vs. Traditional / Survival vs. Self-Expression). {isAdmin && <span className="text-rose-600 font-bold ml-1">Click anywhere on the map below to permanently save a relocated target ping.</span>}</p>
          
          <div className="w-full flex items-center justify-center mt-2">
            <div 
               className={`relative w-full aspect-video bg-slate-50 rounded-lg shadow-sm border overflow-hidden ${isAdmin ? 'border-rose-400 cursor-crosshair' : 'border-slate-200'}`}
               onClick={handleMapClick}
            >
              
              {isPending && !isAdmin && (
                 <div className="absolute top-4 right-4 bg-amber-100 border border-amber-300 text-amber-800 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm z-30 flex items-center gap-2">
                   <Zap className="w-3.5 h-3.5" />
                   Positioning Matrix: Exact coordinates pending for {currentCountryName}
                 </div>
              )}

              <img 
                src="https://www.worldvaluessurvey.org/wvsimages/Cultural_Map_2023.png" 
                alt="Inglehart-Welzel World Cultural Map 2023"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ objectPosition: 'center' }}
              />

              {/* The Plot Node */}
              {!isPending && (
                <div 
                  className="absolute w-4 h-4 rounded-full bg-indigo-600 shadow-sm border-2 border-white z-20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                  style={{ left: `${px}%`, top: `${py}%` }}
                  title={`Mapped Coordinates: (${targetNode.x.toFixed(2)}, ${targetNode.y.toFixed(2)})`}
                >
                  {/* Pulse Ring */}
                  <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-75 duration-1000"></div>
                  {/* Embedded Label to highlight the target */}
                  <div className="absolute top-5 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {currentCountryName} ({targetNode.zone})
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Dynamic Culture Panes */}
        <div className="flex flex-col gap-6 w-full items-start">
          
          {/* TOP: Cultural Exports & Landscape */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 w-full">
            <div className="flex flex-col mb-5 pb-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg mb-1 tracking-tight">Cultural Exports & Spatial Landscape</h3>
              <p className="text-xs text-slate-500 font-medium">Soft power propagation networks and architectural manifestations.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {cultureData.cultural_exports_and_landscape?.soft_power_exports?.map((exp: any, idx: number) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center gap-3">
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        {exp.medium}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 shadow-sm">
                        Reach Score: {exp.global_reach_score}/100
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">{exp.examples?.join(' • ')}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5" />
                  Built Environment Footprint
                </h4>
                <p className="text-sm leading-relaxed text-slate-700">
                  {cultureData.cultural_exports_and_landscape?.spatial_landscape?.architectural_footprint}
                </p>
              </div>
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Key Enclaves & Hubs
                </h4>
                <div className="flex flex-wrap gap-2">
                  {cultureData.cultural_exports_and_landscape?.spatial_landscape?.enclaves?.map((enclave: string, i: number) => (
                    <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-medium border border-indigo-100">
                      {enclave}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE: Hybridity & Glocalization */}
          <div className="bg-indigo-50/50 rounded-xl shadow-sm border border-indigo-100 p-6 w-full">
             <div className="flex justify-between items-start mb-5 pb-5 border-b border-indigo-100/60">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1 tracking-tight flex items-center gap-1.5">
                    <Shuffle className="w-5 h-5 text-indigo-600" />
                    Hybridity & Glocal.
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Syncretic phenomena at local-global intersections.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cultureData.hybridity_and_glocalization?.map((caseStudy: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100/60 relative overflow-hidden group flex flex-col h-full">
                    <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500 rounded-l-lg transition-transform group-hover:scale-y-110"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 flex flex-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {caseStudy.spatial_location}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1 flex items-center gap-2">
                      {caseStudy.concept}
                    </h4>
                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">{caseStudy.description}</p>
                    <div className="font-medium text-xs text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                       <span className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Examples</span>
                       {caseStudy.glocalized_examples?.join(', ')}
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* BOTTOM FULL-WIDTH: Largest Diasporas */}
          <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 w-full text-white">
             <div className="flex flex-col mb-4">
               <h3 className="font-bold text-white text-lg mb-1 tracking-tight flex items-center gap-1.5">
                 Largest Diasporas
               </h3>
               <p className="text-xs text-slate-400 font-medium">Outbound cultural reach and demographic shifts outside the home nation.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cultureData.largest_diasporas?.map((diaspora: any, idx: number) => (
                   <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-end justify-between mb-2 pb-2 border-b border-slate-700/50">
                        <span className="text-sm font-bold text-white">{diaspora.destination}</span>
                        <span className="text-xs font-mono text-blue-400 bg-slate-900 px-2 py-1 rounded">{diaspora.population}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {diaspora.cultural_reach_impact}
                      </p>
                   </div>
                ))}
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
