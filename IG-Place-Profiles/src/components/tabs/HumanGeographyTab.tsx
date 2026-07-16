import React, { useState, useMemo } from 'react';
import { Users, Maximize2, Layers, Info, Landmark, Shield, AlertTriangle, Coins, Compass, Briefcase, Award, MapPin } from 'lucide-react';

// ==========================================
// 1. THE CANONICAL DATA ENGINE (geo-ref.net)
// ==========================================
interface YearData {
  [year: number]: number; // population numbers matching the timelines
}

interface RegionInfo {
  id: string;
  name: string;
  areaKm2: number;
  populationTimeline: YearData;
  gridPos: { row: number; col: number };
}

interface CountryData {
  [countryKey: string]: {
    name: string;
    currency: string;
    govSystem: string;
    regions: RegionInfo[];
  };
}

const getChoroplethColor = (density: number): string => {
  if (density >= 4195) return '#990000'; // Deep Red
  if (density >= 1985) return '#d7301f';
  if (density >= 1248) return '#ef6548';
  if (density >= 987)  return '#fc8d59';
  if (density >= 809)  return '#fdbb84';
  if (density >= 588)  return '#fdd49e';
  if (density >= 214)  return '#fef0d9';
  return '#78c679'; // Light Green (<85)
};

// ==========================================
// 1.5. THE GEOGRAPHIC DOT MAP ENGINE & REAL CENSUS MAP ASSETS
// ==========================================
interface DotScaleItem {
  label: string;
  radius: number;
  color: string;
  desc: string;
}

const DOT_SCALE_ITEMS: DotScaleItem[] = [
  { label: "100", radius: 1.5, color: "#cbd5e1", desc: "Isolated rural settlements" },
  { label: "500", radius: 2.5, color: "#93c5fd", desc: "Agro-pastoral villages" },
  { label: "1,000", radius: 3.5, color: "#60a5fa", desc: "Small township clusters" },
  { label: "5,000", radius: 5.0, color: "#3b82f6", desc: "Suburban residential zones" },
  { label: "10,000", radius: 6.5, color: "#2563eb", desc: "Medium urban municipal centers" },
  { label: "50,000", radius: 8.0, color: "#1e40af", desc: "Regional commercial hub centers" },
  { label: "100,000+", radius: 10.0, color: "#0f172a", desc: "Hyper-dense industrial/metropolitan core" }
];

const MAP_IMAGE_URLS: Record<string, string> = {
  "bangladesh": "https://www.geo-ref.net/m/bangladesh.png",
  "usa": "https://www.geo-ref.net/m/usa.png",
  "china": "https://www.geo-ref.net/m/china.png",
  "india": "https://www.geo-ref.net/m/india.png",
  "south-korea": "https://www.geo-ref.net/m/korea-sur.png",
  "vietnam": "https://www.geo-ref.net/m/vietnam.png",
  "philippines": "https://www.geo-ref.net/m/philippines.png",
  "malaysia": "https://www.geo-ref.net/m/malasya.png",
  "russia": "https://www.geo-ref.net/m/russia.png",
  "poland": "https://www.geo-ref.net/m/polen.png",
  "germany": "https://www.geo-ref.net/m/deutschland.png",
  "uk": "https://www.geo-ref.net/m/uk.png",
  "switzerland": "https://www.geo-ref.net/m/schweiz.png",
  "australia": "https://www.geo-ref.net/m/australia.png",
  "brazil": "https://www.geo-ref.net/m/brasil.png",
  "canada": "https://www.geo-ref.net/m/canada.png",
  "mexico": "https://www.geo-ref.net/m/mexico.png",
  "drc": "https://www.geo-ref.net/m/congo.png",
  "nigeria": "https://www.geo-ref.net/m/nigeria.png",
  "south-africa": "https://www.geo-ref.net/m/sudafrica.png",
  "ethiopia": "https://www.geo-ref.net/m/ethiopia.png",
  "sudan": "https://www.geo-ref.net/m/sudan-north.png",
  "chad": "https://www.geo-ref.net/m/chad.png",
  "niger": "https://www.geo-ref.net/m/niger.png",
  "iceland": "https://www.geo-ref.net/m/iceland.png",
  "tuvalu": "https://www.geo-ref.net/m/tuvalu.png",
  "peru": "https://www.geo-ref.net/m/peru.png",
  "rwanda": "https://www.geo-ref.net/m/rwanda.png",
  "kenya": "https://www.geo-ref.net/m/kenya.png",
  "thailand": "https://www.geo-ref.net/m/thailand.png",
  "belgium": "https://www.geo-ref.net/m/belgien.png",
  "france": "https://www.geo-ref.net/m/france.png",
  "netherlands": "https://www.geo-ref.net/m/netherlands.png",
  "singapore": "https://www.geo-ref.net/m/singapore.png",
  "uae": "https://www.geo-ref.net/m/vae.png",
  "saudi-arabia": "https://www.geo-ref.net/m/saudi-arabia.png",
  "turkey": "https://www.geo-ref.net/m/turkei.png",
  "egypt": "https://www.geo-ref.net/m/egypt.png",
  "ukraine": "https://www.geo-ref.net/m/ukraine.png",
  "indonesia": "https://www.geo-ref.net/m/indonesia.png",
  "iran": "https://www.geo-ref.net/m/iran.png",
  "ireland": "https://www.geo-ref.net/m/ireland.png",
  "italy": "https://www.geo-ref.net/m/italy.png",
  "cuba": "https://www.geo-ref.net/m/cuba.png",
  "israel": "https://www.geo-ref.net/m/israel.png",
  "japan": "https://www.geo-ref.net/m/japan.png",
  "venezuela": "https://www.geo-ref.net/m/venezuela.png"
};

const getActualMapUrl = (countryId?: string, countryName?: string) => {
  const normId = (countryId || "").toLowerCase().trim();
  const normName = (countryName || "").toLowerCase().replace(/\s+/g, '-').trim();
  
  let key = normId;
  // If the explicit ID is not directly matched, try checking normalized name rules
  if (!MAP_IMAGE_URLS[key]) {
    if (normName.includes('united-states') || normName === 'usa' || normName === 'us' || normName === 'united-states-of-america') key = 'usa';
    else if (normName.includes('united-kingdom') || normName === 'uk' || normName === 'gb') key = 'uk';
    else if (normName.includes('south-korea') || normName === 'kr') key = 'south-korea';
    else if (normName.includes('south-africa') || normName === 'za') key = 'south-africa';
    else if (normName.includes('drc') || normName.includes('congo') || normName.includes('democratic-republic-of-the-congo')) key = 'drc';
    else key = normName;
  }
  
  const rawUrl = MAP_IMAGE_URLS[key] || MAP_IMAGE_URLS['bangladesh'];
  
  // Wrap in pixel-level high performance caching proxy (images.weserv.nl) to resolve hotlink blocks & direct iframe security restrictions
  return `https://images.weserv.nl/?url=${encodeURIComponent(rawUrl)}`;
};

interface HumanGeographyTabProps {
  data?: any;
  mapCenter?: any;
  popData?: any[];
  currentYear?: number;
  setSliderYear?: (year: number) => void;
  countryName?: string;
  countryId?: string;
}

export function HumanGeographyTab({
  data,
  popData,
  countryName: propCountryName,
  currentYear: propCurrentYear,
  setSliderYear,
  countryId,
}: HumanGeographyTabProps = {}) {
  // Source of truth year is direct prop
  const activeYear = propCurrentYear || 2026;

  // Extract dynamic sub-national density arrays from the real-time popData series
  const dynamicRegions = useMemo(() => {
    if (!popData || popData.length === 0) return [];
    
    // Find exact or closest matching time node for slider year
    const activeNode = popData.find(node => node.year === activeYear) || 
      popData.reduce((prev, curr) => 
        Math.abs(curr.year - activeYear) < Math.abs(prev.year - activeYear) ? curr : prev
      );
      
    if (!activeNode || !activeNode.sub_national_density_choropleth) return [];
    
    // Filter out 'National Average' to focus on subnational disparities
    return activeNode.sub_national_density_choropleth
      .filter((r: any) => r.admin_1_region_name.toLowerCase() !== "national average")
      .sort((a: any, b: any) => b.density_per_km2 - a.density_per_km2);
  }, [popData, activeYear]);

  const maxDensity = Math.max(...dynamicRegions.map((r: any) => r.density_per_km2), 100);

  const epzs = data?.spatial_hubs?.epz_sez_zones || [];
  const tourism = data?.spatial_hubs?.tourism_enclaves || [];
  const corePeriphery = data?.spatial_hubs?.core_periphery_zones;

  return (
    <div className="w-full h-full font-sans text-slate-800 flex flex-col gap-6">
      
      {/* 2. SPATIAL DOT MAP & LEGEND SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* POPULATION DISTRIBUTION DOT MAP & LEGEND */}
        <div className="lg:col-span-12 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Layers className="text-blue-600 w-5 h-5 flex-shrink-0" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700" id="pop-density-header">
                POPULATION DENSITY AND DISTRIBUTION SPATIAL PATTERN ANALYSIS
              </h2>
            </div>
            


            <div className="w-full flex-1">
              
              {/* THE GEOGRAPHIC CANVAS */}
              <div className="w-full bg-[#fdfbf7] rounded-xl border-2 border-slate-800 shadow-sm relative overflow-hidden flex flex-col items-center justify-center p-3 md:p-6 min-h-[300px]">
                {/* Map Title Overlay */}
                <div className="absolute top-4 left-6 z-10 flex flex-col gap-0.5 select-none text-slate-900 bg-white/95 px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-xs max-w-[80%]">
                  <h3 className="text-xs font-black uppercase tracking-wider font-sans">
                    {(propCountryName || "Selected Territory").toUpperCase()}: POPULATION DISTRIBUTION
                  </h3>
                  <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase font-mono">
                    NATIONAL CENSUS DEMOGRAPHIC SURVEY PATH
                  </p>
                </div>

                <div className="w-full flex items-center justify-center pt-16 pb-6">
                  <img 
                    src={getActualMapUrl(countryId, propCountryName)} 
                    alt={`${propCountryName || "Country"} Population Density Map`}
                    className="max-h-[820px] w-auto max-w-full object-contain rounded-lg shadow-sm border border-slate-200 transition-all duration-300 hover:scale-[1.01]"
                    style={{ height: "auto", maxHeight: "820px", width: "auto", objectFit: "contain" }}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Legend mark */}
                <div className="absolute bottom-2 right-4 font-mono text-[9px] text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-100 shadow-3xs">
                  Thematic Source: https://www.geo-ref.net/
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* LEFT (or RIGHT): SPATIAL HUBS LIST */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Compass className="text-rose-500 w-5 h-5 flex-shrink-0" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Spatial Hubs & Logistical Enclaves
              </h2>
            </div>

            <div className="flex flex-col gap-5 flex-1">
              
              {/* EPZs Details */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col">
                <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5 mb-3">
                  <Briefcase className="w-3.5 h-3.5" /> Industrial Zones & Free Ports
                </h4>
                {epzs.length > 0 ? (
                  <div className="space-y-2 pr-1">
                    {epzs.map((zone: any, i: number) => (
                      <div key={i} className="bg-white border border-slate-150 rounded-lg p-2.5 flex justify-between items-center shadow-xs">
                        <div className="space-y-0.5 max-w-[70%]">
                          <p className="text-xs font-bold text-slate-800 leading-tight">{zone.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium leading-tight">{zone.primary_focus}</p>
                        </div>
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-1 rounded shrink-0 border border-slate-200 text-right">
                          <MapPin className="w-2.5 h-2.5 inline mr-1 opacity-50" />
                          {zone.location_lat_long}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[11px] text-slate-400 font-medium italic">
                    No logistical export zones defined.
                  </div>
                )}
              </div>

              {/* Layout for Core vs Periphery and Tourism */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Tourism Enclaves */}
                <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4 flex flex-col">
                  <h4 className="text-[11px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 mb-3">
                    <Award className="w-3.5 h-3.5" /> Leisure Enclaves
                  </h4>
                  {tourism.length > 0 ? (
                    <div className="space-y-2 pr-1">
                      {tourism.map((enclave: any, i: number) => (
                        <div key={i} className="bg-white border border-indigo-100 rounded-md p-2 space-y-1">
                          <p className="text-[11px] font-bold text-indigo-950 leading-tight">{enclave.name}</p>
                          <p className="text-[9px] text-indigo-900/80 leading-relaxed font-normal">
                            {enclave.spatial_impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-[10px] text-indigo-400 font-medium italic">
                      No leisure enclaves registered.
                    </div>
                  )}
                </div>

                {/* Core Periphery */}
                {corePeriphery && (
                  <div className="bg-[#fcfbf9]/60 border border-[#e5e1d8] rounded-xl p-4 flex flex-col justify-center gap-3">
                    <h4 className="text-[11px] font-black uppercase text-[#12791f] tracking-wider flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5" /> Core-Periphery Balance
                    </h4>
                    
                    <div className="bg-[#ecf7eb] border border-[#a3da9e]/60 rounded p-2.5 shadow-3xs">
                      <span className="text-[9px] uppercase font-black text-[#12791f] tracking-wide flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#12791f] border border-white shrink-0" />
                        Core Growth Pole (High Density)
                      </span>
                      <p className="text-[11px] font-bold text-slate-800 mt-1.5 leading-snug">
                        {corePeriphery.core}
                      </p>
                    </div>
                    <div className="bg-[#f4f6ee] border border-[#cfdac5]/60 rounded p-2.5 shadow-3xs">
                      <span className="text-[9px] uppercase font-black text-[#5e7740] tracking-wide flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#aed0a2] border border-white shrink-0" />
                        Lagging Periphery (Low Density)
                      </span>
                      <p className="text-[11px] font-bold text-slate-700 mt-1.5 leading-snug">
                        {corePeriphery.periphery}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default HumanGeographyTab;
