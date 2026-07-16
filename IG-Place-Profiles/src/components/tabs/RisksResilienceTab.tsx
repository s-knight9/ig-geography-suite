import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Droplets, 
  MapPin, 
  Landmark, 
  HeartHandshake, 
  Map as MapIcon, 
  X, 
  Loader2, 
  Lightbulb, 
  Compass, 
  Globe, 
  Check, 
  BookOpen, 
  Layers, 
  Flame, 
  ArrowRight, 
  Activity, 
  Wind, 
  Anchor, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react';
import type { DPPlaceProfile } from '../../types';
import { RiskProfile, STATIC_RISK_PROFILES, getNormalizedId, getFallbackProfile } from '../../utils/riskData';
import { risksResilienceData } from "../../../../src/data/risksResilienceData";

interface Props {
  data?: DPPlaceProfile;
}

export const RisksResilienceTab: React.FC<Props> = ({ data }) => {
  const [showMapOverlay, setShowMapOverlay] = useState(false);
  const [activeResilienceView, setActiveResilienceView] = useState<'current' | 'possibilities'>('current');
  const [activeCategory, setActiveCategory] = useState<'all' | 'climate' | 'geophysical' | 'geopolitical' | 'demographic'>('all');
  const [selectedThreatIndex, setSelectedThreatIndex] = useState<number | null>(null);

  const [mode, setMode] = useState<'static' | 'live'>('static');
  const [staticProfile, setStaticProfile] = useState<RiskProfile | null>(null);
  const [liveProfile, setLiveProfile] = useState<RiskProfile | null>(null);
  const [loadingLive, setLoadingLive] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    climate: false,
    seismic: false,
    geopolitical: false,
    demographic: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getLookupKey = (name: string): string => {
    const norm = name.toLowerCase().trim();
    if (norm.includes("china")) return "china";
    if (norm.includes("united states") || norm.includes("usa") || norm.includes("u.s.a") || norm.includes("america")) return "usa";
    if (norm.includes("turkey") || norm.includes("türk")) return "turkey";
    if (norm.includes("ukraine")) return "ukraine";
    if (norm.includes("drc") || norm.includes("congo")) return "drc";
    if (norm.includes("united kingdom") || norm.includes("uk")) return "uk";
    if (norm.includes("saudi")) return "saudi-arabia";
    if (norm.includes("south africa")) return "south-africa";
    if (norm.includes("south korea")) return "south-korea";
    if (norm.includes("united arab") || norm.includes("uae")) return "uae";
    return norm.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const countryName = data?.country_metadata.name || "";
  const normalizedId = getNormalizedId(countryName);
  const lookupKey = getLookupKey(countryName);
  const risksData = risksResilienceData[lookupKey];

  // Initialize and fetch profiles safely
  useEffect(() => {
    if (!data) return;

    setOpenSections({
      climate: false,
      seismic: false,
      geopolitical: false,
      demographic: false
    });

    // 1. Immediately set the comprehensive static profile to avoid loading spinners, blank states, or layout flickers
    const staticData = STATIC_RISK_PROFILES[normalizedId] || getFallbackProfile(data.country_metadata.name);
    setStaticProfile(staticData);
    setLiveProfile(null); // Clear previous country's live profile
    setSelectedThreatIndex(null);

    // 2. Fetch the live profile from the backend to enrich the view if selected
    const fetchLiveProfile = async () => {
      setLoadingLive(true);
      try {
        const res = await fetch("/api/gemini/country-risks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryName: data.country_metadata.name })
        });
        if (res.ok) {
          const json = await res.json();
          // Verify that we received valid data objects before updating
          if (json && json.climateVulnerabilityIndex !== undefined) {
            setLiveProfile(json);
          }
        }
      } catch (err) {
        console.warn("[Risks Tab] Geopolitical API rate limited. Utilizing robust curriculum data offline.");
      } finally {
        setLoadingLive(false);
      }
    };
    
    fetchLiveProfile();
  }, [data?.country_metadata?.name, normalizedId]);

  if (!data) return null;

  // Resolve active profile elegantly: prefer live when requested and loaded, otherwise stay strictly static/curriculum
  const profile = (mode === 'live' && liveProfile) ? liveProfile : staticProfile;

  // Compile Demographic Risk
  let demographicRiskIndex: number | undefined = profile?.demographicRiskIndex;
  const demographicThreats = profile?.demographicThreats ? [...profile.demographicThreats] : [];
  const demographicPossibilities = profile?.pioneerPossibilities ? [...profile.pioneerPossibilities] : [];
  let dependencyRatio = 0;
  
  if (data?.population_dynamics_time_series?.length) {
    let latestYearData = data.population_dynamics_time_series.find(n => n.year === 2026);
    if (!latestYearData) {
      latestYearData = [...data.population_dynamics_time_series].sort((a, b) => b.year - a.year)[0];
    }
    let youthPct = 0;
    let workingPct = 0;
    let elderlyPct = 0;

    latestYearData.pyramid_structure.cohorts.forEach(c => {
      const isElderly = c.age.includes('65') || c.age.includes('70') || c.age.includes('75') || c.age.includes('80') || c.age.includes('85') || c.age.includes('+');
      const isYouth = c.age === '0-4' || c.age === '5-9' || c.age === '10-14';
      if (isYouth) youthPct += (Math.abs(c.male_pct) + Math.abs(c.female_pct));
      else if (isElderly) elderlyPct += (Math.abs(c.male_pct) + Math.abs(c.female_pct));
      else workingPct += (Math.abs(c.male_pct) + Math.abs(c.female_pct));
    });
    
    // Fallback if missing
    if (workingPct === 0) workingPct = 60; 
    
    dependencyRatio = ((youthPct + elderlyPct) / workingPct) * 100;
    
    if (demographicRiskIndex === undefined) {
      demographicRiskIndex = Math.min(10, Math.max(1, (Math.abs(dependencyRatio - 45) / 3.5))); 
    }
    
    if (demographicThreats.length === 0) {
       if (dependencyRatio < 50 && youthPct > elderlyPct) {
          demographicThreats.push({
             title: "Demographic Dividend / Youth Bulge Risk",
             description: `With a low dependency ratio (${dependencyRatio.toFixed(1)}%), there is a potential demographic dividend. However, failure to create rapid employment for the youth bulge can convert this into a severe demographic burden, raising social fragility.`
          });
       } else if (elderlyPct > youthPct) {
          demographicThreats.push({
             title: "Hyper-Aging Society & Pension Squeeze",
             description: `An accelerating dependency ratio (${dependencyRatio.toFixed(1)}%) driven by the elderly cohort severely constrains the tax base, increasing the economic burden on the working-age population and stalling consumer growth.`
          });
       } else {
          demographicThreats.push({
             title: "Acute Youth Dependency Burden",
             description: `An extremely high youth-driven dependency ratio (${dependencyRatio.toFixed(1)}%) places immense strain on state resources for education, healthcare, and infrastructure, hampering immediate economic growth.`
          });
       }
    }

    if (!profile?.pioneerPossibilities?.some(p => p.technique.includes("Natal") || p.originContext.includes("Demographic"))) {
        if (dependencyRatio < 50 && youthPct > elderlyPct) {
            demographicPossibilities.push({
                technique: "Human Capital & Tech Skilling",
                originContext: "Demographic Dividend Realization",
                description: "Aggressive investment in STEM education and export-oriented tertiary sectors to capitalize on the maximum output potential of the working-age bulge."
            });
        } else if (elderlyPct > youthPct) {
            demographicPossibilities.push({
                technique: "Pronatalist Incentives & Skill-Based Immigration",
                originContext: "Ageing Population Mitigation",
                description: "Implementation of comprehensive child-care policy incentives and targeted economic migration schemes to expand the shrinking workforce."
            });
        } else {
            demographicPossibilities.push({
                technique: "Anti-Natal Policies & Female Education",
                originContext: "Youth Bulge Stabilization",
                description: "Strategic investment in women's education, family planning, and late-marriage incentives to rapidly transition through the demographic transition model."
            });
        }
    }
  }

  // Compile all security threats with nice category tags
  const allThreats = [
    ...(profile?.climateThreats || []).map(t => ({ ...t, type: 'climate' as const })),
    ...(profile?.geophysicalThreats || []).map(t => ({ ...t, type: 'geophysical' as const })),
    ...(profile?.geopoliticalThreats || []).map(t => ({ ...t, type: 'geopolitical' as const })),
    ...demographicThreats.map(t => ({ ...t, type: 'demographic' as const }))
  ];

  const activePossibilities = demographicPossibilities;

  // Filter the threats categories based on user interactive clicks
  const filteredThreats = activeCategory === 'all' 
    ? allThreats 
    : allThreats.filter(t => t.type === activeCategory);

  return (
    <div className="flex flex-col gap-6 p-1 h-full min-h-0 overflow-y-auto font-sans">
      
      {/* Top Banner & Control Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" /> 
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Risks & Resilience Profiler
            </h2>
            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border transition-all ${mode === 'live' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
              {mode === 'live' ? '🤖 Live GeoAI' : '📚 Curriculum Mode'}
            </span>
            {loadingLive && mode === 'live' && <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin shrink-0" />}
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Geopolitical flashpoints, seismic tectonic strain zones, and dynamic climate adaptation projects
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 print-hidden">
          {/* Syllabus Curriculum vs. Live GeoAI Dual Mode Switcher */}
          <div className="flex bg-slate-105 hover:bg-slate-200/60 transition-colors rounded-xl p-1 border border-slate-200/60 shadow-inner">
            <button
              onClick={() => { setMode('static'); setSelectedThreatIndex(null); }}
              className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1.5 select-none ${
                mode === 'static'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Syllabus Curriculum
            </button>
            <button
              onClick={() => { setMode('live'); setSelectedThreatIndex(null); }}
              className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1.5 select-none ${
                mode === 'live'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Live GeoAI
              {loadingLive && !liveProfile && <Loader2 className="w-2.5 h-2.5 animate-spin text-rose-200" />}
            </button>
          </div>

          <button 
            onClick={() => setShowMapOverlay(!showMapOverlay)}
            className={`px-4 py-2 flex items-center gap-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm border ${showMapOverlay ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
          >
            <MapIcon className="w-4 h-4" />
            {showMapOverlay ? "Hide Spatial Overlay" : "Spatial Context Map"}
          </button>
        </div>
      </div>

      {/* Simulated Map Overlay rendering */}
      {showMapOverlay && (
        <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 min-h-[350px] flex items-center justify-center border border-slate-800 shadow-xl print-avoid-break">
          <div className="absolute inset-0 opacity-40 bg-[url('https://api.maptiler.com/maps/dataviz-dark/256/0/0/0.png?key=get_your_own_OpIi9ZULNHzrESv6T2vL')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-blue-950/45 mix-blend-multiply" />
          
          <div className="relative z-10 w-full max-w-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Strategic Friction & Geography Barriers
              </h3>
              <button 
                onClick={() => setShowMapOverlay(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-semibold mb-4">
              Geopolitical constraints stemming directly from physical mountains, oceanic borders, or navigable waterways.
            </p>

            <ul className="space-y-3">
              {data.prisoners_of_geography_map?.topographic_friction_points?.length ? (
                data.prisoners_of_geography_map.topographic_friction_points.map((f, i) => (
                  <li key={i} className="flex gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-100 text-xs block">{f.feature}</span>
                      <span className="text-[11px] text-slate-400 font-semibold">{f.geopolitical_constraint}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-400 font-semibold bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                  Land barriers stable; maritime shipping controls represent primary geographic framework.
                </li>
              )}
              {data.prisoners_of_geography_map?.choke_points_vulnerabilities?.map((f, i) => (
                <li key={`choke-${i}`} className="flex gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-100 text-xs block">Marine Lock / Strait Choke-point: {f.feature}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">{f.impact}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Framework Grid */}
      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-avoid-break">
          
          {/* LEFT COLUMN: COLLAPSIBLE ACCORDIONS */}
          <div className="flex flex-col gap-4">
            
            {/* 1. Climate Vulnerability Index Accordion */}
            <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <button 
                onClick={() => toggleSection("climate")}
                className="w-full px-5 py-4 flex items-center justify-between bg-transparent border-none outline-none cursor-pointer text-left select-none group"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-650 dark:text-teal-400 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Droplets size={16} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                      Climate Vulnerability Index
                    </h3>
                    {profile?.climateVulnerabilityIndex !== undefined && (
                      <span className="text-[10px] bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold px-2.5 py-0.5 rounded-full border border-teal-500/20">
                        Score: {profile.climateVulnerabilityIndex.toFixed(1)} / 10
                      </span>
                    )}
                  </div>
                </div>
                {openSections.climate ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>

              {openSections.climate && risksData && (
                <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 bg-slate-50/10 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-3 rounded-lg">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                        Carbon Footprint (Overall)
                      </span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 block">
                        {risksData.climate.carbonOverall}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-3 rounded-lg">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                        Carbon Footprint (Per Capita)
                      </span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 block">
                        {risksData.climate.carbonPerCapita}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                      Specific Localized Climate Threats
                    </span>
                    <ul className="space-y-1.5">
                      {risksData.climate.vulnerabilities.map((v, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600 dark:text-slate-350 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Seismic Vulnerability Index Accordion */}
            <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <button 
                onClick={() => toggleSection("seismic")}
                className="w-full px-5 py-4 flex items-center justify-between bg-transparent border-none outline-none cursor-pointer text-left select-none group"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-650 dark:text-rose-450 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Activity size={16} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                      Seismic Vulnerability Index (SVI)
                    </h3>
                    {profile?.seismicVulnerabilityIndex !== undefined && (
                      <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-450 font-extrabold px-2.5 py-0.5 rounded-full border border-rose-500/20">
                        Score: {profile.seismicVulnerabilityIndex.toFixed(1)} / 10
                      </span>
                    )}
                  </div>
                </div>
                {openSections.seismic ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>

              {openSections.seismic && risksData && (
                <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 bg-slate-50/10 space-y-3.5 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Proximity to Tectonic Boundaries
                    </span>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-350 leading-relaxed">
                      {risksData.seismic.tectonicBoundaries}
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Specific Threat Mechanisms & Fault Names
                    </span>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-350 leading-relaxed">
                      {risksData.seismic.threatMechanisms}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Geopolitical Fragility Score Accordion */}
            <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <button 
                onClick={() => toggleSection("geopolitical")}
                className="w-full px-5 py-4 flex items-center justify-between bg-transparent border-none outline-none cursor-pointer text-left select-none group"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-650 dark:text-orange-400 group-hover:scale-110 transition-transform flex-shrink-0">
                    <ShieldAlert size={16} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                      Geopolitical Fragility Score
                    </h3>
                    {profile?.geopoliticalFragility !== undefined && (
                      <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold px-2.5 py-0.5 rounded-full border border-orange-500/20">
                        Score: {profile.geopoliticalFragility.toFixed(1)} / 10
                      </span>
                    )}
                  </div>
                </div>
                {openSections.geopolitical ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>

              {openSections.geopolitical && risksData && (
                <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 bg-slate-50/10 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Regional Geopolitical Risks
                  </span>
                  <ul className="space-y-1.5">
                    {risksData.geopolitical.vulnerabilities.map((v, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600 dark:text-slate-350 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 4. Demographic Risk Score Accordion */}
            <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <button 
                onClick={() => toggleSection("demographic")}
                className="w-full px-5 py-4 flex items-center justify-between bg-transparent border-none outline-none cursor-pointer text-left select-none group"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-650 dark:text-blue-450 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Users size={16} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                      Demographic Risk Score
                    </h3>
                    {demographicRiskIndex !== undefined && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-450 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-500/20">
                        Score: {demographicRiskIndex.toFixed(1)} / 10
                      </span>
                    )}
                  </div>
                </div>
                {openSections.demographic ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>

              {openSections.demographic && risksData && (
                <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 bg-slate-50/10 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Specific Population Pressures
                  </span>
                  <ul className="space-y-1.5">
                    {risksData.demographic.vulnerabilities.map((v, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600 dark:text-slate-355 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: RESILIENCE, PROJECTS, & EXOTIC SOLUTIONS */}
          <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Resilience Profile</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Adaptation capacity & sovereign infrastructure</span>
                </div>
              </div>

              {/* Section Sub-switcher */}
              <div className="flex bg-slate-100 rounded-lg p-0.5 shadow-xs border border-slate-200/50 print-hidden">
                <button 
                  onClick={() => setActiveResilienceView('current')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-md transition-colors ${activeResilienceView === 'current' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-705'}`}
                >
                  Active Adaptation
                </button>
                <button 
                  onClick={() => setActiveResilienceView('possibilities')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-md transition-colors flex items-center gap-1 ${activeResilienceView === 'possibilities' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-705'}`}
                >
                  <Lightbulb className="w-3 h-3 text-amber-300" />
                  Miti-Possibilities
                </button>
              </div>
            </div>

            <div className="space-y-6 flex-1 flex flex-col justify-between">
              {activeResilienceView === 'current' ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Institutional Strength Progress Tracker */}
                  <div className="border-b border-slate-105 pb-4">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Institutional Enforcement Strength</span>
                      <span className="font-black text-emerald-600 text-sm">{(profile.institutionalStrength ?? 0).toFixed(1)}/10</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-550" style={{ width: `${((profile.institutionalStrength ?? 0) / 10) * 100}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1 leading-relaxed">
                      Efficacy of construction code inspection, seawall enforcement budgets, and regional early evacuation drills.
                    </p>
                  </div>

                  {/* Active Mitigation Projects */}
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-indigo-500" />
                      National Adaptation Projects
                    </h4>
                    <div className="space-y-3.5">
                      {(profile.adaptationProjects || []).map((proj, idx) => (
                        <div key={idx} className="bg-emerald-50/20 p-3.5 rounded-xl border border-emerald-100/50 shadow-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-black text-xs text-slate-800">{proj.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-650 leading-relaxed font-semibold pl-4">
                            {proj.description}
                          </p>
                        </div>
                      ))}
                      {(profile.adaptationProjects || []).length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4 italic font-semibold">
                          No active national projects cataloged for this country.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-indigo-50/55 border border-indigo-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-indigo-800 leading-relaxed">
                      💡 <strong>Cross-Border Spatial Adaptation:</strong> These represent high-yield structural, legal, or geotechnical techniques pioneered in other geographies that could mitigate <strong className="text-indigo-950">{countryName}’s</strong> specific spatial limits.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {(activePossibilities || []).map((possibility, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                          <span className="font-black text-xs text-slate-800">{possibility.technique}</span>
                          <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-100/50 self-start sm:self-center">
                            Origin Model: {possibility.originContext}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                          {possibility.description}
                        </p>
                      </div>
                    ))}
                    {(activePossibilities || []).length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4 italic font-semibold">
                        No cross-border adaptation models cataloged.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 4. SYLLABUS ALIGNMENT: IB DP GEOGRAPHY CASE STUDY CORNER */}
      <div className="border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/20 rounded-2xl p-5 shadow-sm mt-2 flex flex-col md:flex-row gap-4 items-start select-none">
        <BookOpen className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
              IB Syllabus Alignment Corner • Unit HL6: Global Risk & Resilience
            </h5>
            <span className="text-[10px] bg-indigo-100 text-indigo-805 font-black uppercase px-2.5 py-0.5 rounded-full">
              Core Paradigm Focus
            </span>
          </div>
          
          <p className="text-xs text-slate-650 leading-relaxed font-semibold">
            In DP Geography, <strong>Risk</strong> is defined as the probability of harmful consequences or expected losses resulting from interactions between natural or human hazards and vulnerable conditions. 
            <strong>Vulnerability</strong> represents physical socio-graphic exposure (such as sitting on the Anatolian fault line, or depending on Taiwan Strait semiconductor transits), whereas <strong>Resilience</strong> measures the institutional speed to adapt, recover, and establish system redundancy to bypass global geopolitical tensions or climatological shocks.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[9px] font-extrabold text-slate-500 uppercase">
            <span className="bg-white border border-slate-100 p-1 rounded-md text-center">FSI Vulnerability Index</span>
            <span className="bg-white border border-slate-100 p-1 rounded-md text-center">Seismic SVI Tracking</span>
            <span className="bg-white border border-slate-100 p-1 rounded-md text-center">Sendai Risk Framework</span>
            <span className="bg-white border border-slate-105 p-1 rounded-md text-center">Maritime Choke Points</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};
