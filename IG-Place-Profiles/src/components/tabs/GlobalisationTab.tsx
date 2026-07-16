import React, { useState } from "react";
import { DPPlaceProfile } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { 
  Globe, 
  Trophy, 
  Bookmark, 
  BookOpen, 
  Building2, 
  TrendingUp, 
  Compass, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Check 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface KOFDimensionCardProps {
  title: string;
  description: string;
  deFacto: number;
  deJure: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function KOFDimensionCard({
  title,
  description,
  deFacto,
  deJure,
  isExpanded,
  onToggle,
  children
}: KOFDimensionCardProps) {
  const average = (deFacto + deJure) / 2;

  return (
    <div className="border border-slate-200/80 rounded-2xl bg-white shadow-xs overflow-hidden transition-all duration-300 hover:border-slate-300">
      {/* Clickable Header */}
      <div 
        onClick={onToggle}
        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 select-none transition-colors"
      >
        <div className="space-y-1.5 max-w-xl">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>{title} Integration</span>
            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100/80 px-2.5 py-0.5 rounded-full">
              Avg Index: {average.toFixed(1)}
            </span>
          </h4>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            {description}
          </p>
        </div>

        {/* High-Level Score Display */}
        <div className="flex items-center gap-5 shrink-0 self-start md:self-center">
          <div className="flex gap-4">
            <div className="text-right">
              <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">De Facto</span>
              <span className="text-sm font-black text-slate-800">{deFacto.toFixed(1)}</span>
            </div>
            <div className="text-right border-l border-slate-200 pl-4">
              <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">De Jure</span>
              <span className="text-sm font-black text-slate-700">{deJure.toFixed(1)}</span>
            </div>
          </div>

          <div className="text-slate-400 hover:text-slate-600 p-1.5 bg-slate-100 rounded-lg shrink-0 transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-800" /> : <ChevronDown className="w-4 h-4 text-slate-800" />}
          </div>
        </div>
      </div>

      {/* Persistent Progress Bars */}
      <div className="px-5 pb-5 pt-1.5 grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-50">
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-extrabold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              De Facto (Observed Flows)
            </span>
            <span className="font-bold text-slate-700">{deFacto}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${deFacto}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-extrabold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              De Jure (Policies & Institutions)
            </span>
            <span className="font-bold text-slate-700">{deJure}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-800 rounded-full transition-all duration-500" style={{ width: `${deJure}%` }} />
          </div>
        </div>
      </div>

      {/* Accordion Expand Area */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-100 bg-slate-50/40"
          >
            <div className="p-5 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GlobalisationTab({ data }: { data: DPPlaceProfile["globalisation_tab"] }) {
  const [activeSubTab, setActiveSubTab] = useState<'kof' | 'kearney' | 'ey'>('kof');
  const [expandedSet, setExpandedSet] = useState<Record<string, boolean>>({
    economic: false,
    social: false,
    political: false
  });

  const kof = data.kof_index;

  // Derive composite Social Globalization scores as the average of its three sub-indices
  const socialDeFacto = Math.round((kof.social.interpersonal.de_facto + kof.social.informational.de_facto + kof.social.cultural.de_facto) / 3 * 10) / 10;
  const socialDeJure = Math.round((kof.social.interpersonal.de_jure + kof.social.informational.de_jure + kof.social.cultural.de_jure) / 3 * 10) / 10;

  const toggleSection = (section: 'economic' | 'social' | 'political') => {
    setExpandedSet(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="w-full border-slate-200/80 shadow-md">
        
        {/* Header with Segmented Control Tab Switcher */}
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600 animate-pulse" />
                Globalisation Indices & Frameworks
              </CardTitle>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Geographic evaluation models of spatial interaction and integration
              </p>
            </div>
            
            {/* Custom high-performance tab switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 max-w-fit shadow-xs">
              <button
                type="button"
                onClick={() => setActiveSubTab('kof')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase cursor-pointer transition-all duration-200 ${
                  activeSubTab === 'kof'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                KOF Index
              </button>
              
              <button
                type="button"
                onClick={() => setActiveSubTab('kearney')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase cursor-pointer transition-all duration-200 ${
                  activeSubTab === 'kearney'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                A.T. Kearney
              </button>
              
              <button
                type="button"
                onClick={() => setActiveSubTab('ey')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase cursor-pointer transition-all duration-200 ${
                  activeSubTab === 'ey'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                Ernst & Young
              </button>
            </div>
          </div>
        </CardHeader>

        {/* Content Body */}
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {activeSubTab === 'kof' && (
              <motion.div
                key="kof"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Visual Intro Hint */}
                <div className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
                  <span>Below are the three core pillars of the <strong>KOF Globalization Index</strong>. Click on any section to examine metrics and structural contributors.</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black text-blue-800 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full select-none">
                    KOF Interactive Model
                  </span>
                </div>

                <div className="space-y-4">
                  {/* De Jure vs De Facto explanation pop-out */}
                  <details className="group border border-slate-200 rounded-xl bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-slate-800 focus:outline-none">
                      <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-semibold">What is De Jure and De Facto when it comes to KOFs?</span>
                      </div>
                      <span className="transition duration-300 group-open:-rotate-180">
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      </span>
                    </summary>
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                      <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                              <th className="px-4 py-3 min-w-[120px]">Aspect</th>
                              <th className="px-4 py-3 min-w-[180px]">De Facto Globalization</th>
                              <th className="px-4 py-3 min-w-[180px]">De Jure Globalization</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                            <tr className="hover:bg-slate-50/50 transition">
                              <td className="px-4 py-3 font-semibold text-slate-800">Core Meaning</td>
                              <td className="px-4 py-3">Actual cross-border flows and outcomes.</td>
                              <td className="px-4 py-3">Policies, laws, and structural conditions.</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 transition">
                              <td className="px-4 py-3 font-semibold text-slate-800">Focus</td>
                              <td className="px-4 py-3">What countries <span className="font-bold text-slate-900">actually do</span>.</td>
                              <td className="px-4 py-3">What countries <span className="font-bold text-slate-900">allow or facilitate</span>.</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 transition">
                              <td className="px-4 py-3 font-semibold text-slate-800">Example Metric</td>
                              <td className="px-4 py-3">Total volume of imported goods.</td>
                              <td className="px-4 py-3">Average import tariff rates.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </details>

                  {/* pillar 1: ECONOMIC */}
                  <KOFDimensionCard
                    title="Economic"
                    description="This dimension measures the extent of cross-border trade and financial flows, as well as the restrictions placed upon them."
                    deFacto={kof.economic.de_facto}
                    deJure={kof.economic.de_jure}
                    isExpanded={expandedSet.economic}
                    onToggle={() => toggleSection('economic')}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Trade Globalisation de facto */}
                      <div className="border border-slate-200/60 bg-white shadow-xs rounded-xl p-4">
                        <h5 className="text-[10px] font-black uppercase text-blue-700 tracking-wider mb-2.5 flex items-center justify-between">
                          <span>Trade Globalisation (de facto)</span>
                          <span className="text-[9px] font-medium text-blue-600 bg-blue-50 px-1.5 rounded">Flow Metrics</span>
                        </h5>
                        <ul className="space-y-1.5">
                          {["Trade in goods", "Trade in services", "Trade partner diversity"].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Trade Globalisation de jure */}
                      <div className="border border-slate-200/60 bg-white shadow-xs rounded-xl p-4">
                        <h5 className="text-[10px] font-black uppercase text-slate-600 tracking-wider mb-2.5 flex items-center justify-between">
                          <span>Trade Globalisation (de jure)</span>
                          <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 rounded">Regulation Metrics</span>
                        </h5>
                        <ul className="space-y-1.5">
                          {["Trade regulations", "Trade taxes", "Tariffs", "Trade agreements"].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                              <Check className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Financial Globalisation de facto */}
                      <div className="border border-slate-200/60 bg-white shadow-xs rounded-xl p-4">
                        <h5 className="text-[10px] font-black uppercase text-blue-700 tracking-wider mb-2.5 flex items-center justify-between">
                          <span>Financial Globalisation (de facto)</span>
                          <span className="text-[9px] font-medium text-blue-600 bg-blue-50 px-1.5 rounded">Asset Flows</span>
                        </h5>
                        <ul className="space-y-1.5">
                          {[
                            "Foreign direct investment (FDI)",
                            "Portfolio investment",
                            "International debt",
                            "International reserves",
                            "International income payments"
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Financial Globalisation de jure */}
                      <div className="border border-slate-200/60 bg-white shadow-xs rounded-xl p-4">
                        <h5 className="text-[10px] font-black uppercase text-slate-600 tracking-wider mb-2.5 flex items-center justify-between">
                          <span>Financial Globalisation (de jure)</span>
                          <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 rounded">Capital Rules</span>
                        </h5>
                        <ul className="space-y-1.5">
                          {[
                            "Investment restrictions",
                            "Capital account openness",
                            "International investment agreements"
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                              <Check className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </KOFDimensionCard>

                  {/* pillar 2: SOCIAL */}
                  <KOFDimensionCard
                    title="Social"
                    description="This dimension measures the spread of ideas, information, images, and people. It is the most diverse category, covering interpersonal, informational, and cultural elements."
                    deFacto={socialDeFacto}
                    deJure={socialDeJure}
                    isExpanded={expandedSet.social}
                    onToggle={() => toggleSection('social')}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      {/* Interpersonal Globalisation Section */}
                      <div className="border border-slate-200/60 bg-white shadow-xs rounded-xl p-4 space-y-3.5">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                          <h5 className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                            Interpersonal Metrics
                          </h5>
                          <span className="text-[9px] font-extrabold text-indigo-950 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">
                            Avg: {((kof.social.interpersonal.de_facto + kof.social.interpersonal.de_jure) / 2).toFixed(1)}
                          </span>
                        </div>
                        
                        {/* Sub-bar metrics */}
                        <div className="space-y-2 text-[10px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <div className="flex justify-between font-bold text-slate-500 mb-0.5">
                              <span>De Facto Flows:</span>
                              <span className="font-bold text-slate-700">{kof.social.interpersonal.de_facto}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${kof.social.interpersonal.de_facto}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between font-bold text-slate-500 mb-0.5">
                              <span>De Jure Enablers:</span>
                              <span className="font-bold text-slate-700">{kof.social.interpersonal.de_jure}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-700 rounded-full transition-all duration-300" style={{ width: `${kof.social.interpersonal.de_jure}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* List contributors */}
                        <div className="space-y-3 pt-1">
                          <div>
                            <h6 className="text-[9px] font-extrabold uppercase text-indigo-600 tracking-wider mb-1.5">De Facto Contributors:</h6>
                            <ul className="space-y-1 pl-0.5">
                              {["International voice traffic", "Transfers (Secondary income)", "International tourism", "International students", "Migration"].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold leading-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-[9px] font-extrabold uppercase text-indigo-800 tracking-wider mb-1.5">De Jure Contributors:</h6>
                            <ul className="space-y-1 pl-0.5">
                              {["Telephone subscriptions", "Freedom to visit (visa requirements)", "International airports"].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold leading-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Informational Globalisation Section */}
                      <div className="border border-slate-200/60 bg-white shadow-xs rounded-xl p-4 space-y-3.5">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                          <h5 className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                            Informational Metrics
                          </h5>
                          <span className="text-[9px] font-extrabold text-blue-950 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100/50">
                            Avg: {((kof.social.informational.de_facto + kof.social.informational.de_jure) / 2).toFixed(1)}
                          </span>
                        </div>
                        
                        {/* Sub-bar metrics */}
                        <div className="space-y-2 text-[10px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <div className="flex justify-between font-bold text-slate-500 mb-0.5">
                              <span>De Facto Flows:</span>
                              <span className="font-bold text-slate-700">{kof.social.informational.de_facto}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${kof.social.informational.de_facto}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between font-bold text-slate-500 mb-0.5">
                              <span>De Jure Enablers:</span>
                              <span className="font-bold text-slate-700">{kof.social.informational.de_jure}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-700 rounded-full transition-all duration-300" style={{ width: `${kof.social.informational.de_jure}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* List contributors */}
                        <div className="space-y-3 pt-1">
                          <div>
                            <h6 className="text-[9px] font-extrabold uppercase text-blue-600 tracking-wider mb-1.5">De Facto Contributors:</h6>
                            <ul className="space-y-1 pl-0.5">
                              {["Internet bandwidth", "International patents", "High technology exports"].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold leading-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-[9px] font-extrabold uppercase text-blue-800 tracking-wider mb-1.5">De Jure Contributors:</h6>
                            <ul className="space-y-1 pl-0.5">
                              {["Television access", "Internet access", "Press freedom"].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold leading-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Cultural Globalisation Section */}
                      <div className="border border-slate-200/60 bg-white shadow-xs rounded-xl p-4 space-y-3.5">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                          <h5 className="text-[10px] font-black uppercase text-pink-700 tracking-wider">
                            Cultural Metrics
                          </h5>
                          <span className="text-[9px] font-extrabold text-pink-950 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100/50">
                            Avg: {((kof.social.cultural.de_facto + kof.social.cultural.de_jure) / 2).toFixed(1)}
                          </span>
                        </div>
                        
                        {/* Sub-bar metrics */}
                        <div className="space-y-2 text-[10px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <div className="flex justify-between font-bold text-slate-500 mb-0.5">
                              <span>De Facto Flows:</span>
                              <span className="font-bold text-slate-700">{kof.social.cultural.de_facto}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-pink-500 rounded-full transition-all duration-300" style={{ width: `${kof.social.cultural.de_facto}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between font-bold text-slate-500 mb-0.5">
                              <span>De Jure Enablers:</span>
                              <span className="font-bold text-slate-700">{kof.social.cultural.de_jure}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-pink-700 rounded-full transition-all duration-300" style={{ width: `${kof.social.cultural.de_jure}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* List contributors */}
                        <div className="space-y-3 pt-1">
                          <div>
                            <h6 className="text-[9px] font-extrabold uppercase text-pink-600 tracking-wider mb-1.5">De Facto Contributors:</h6>
                            <ul className="space-y-1 pl-0.5">
                              {["Trade in cultural goods", "Trade in personal services", "International trademarks", "McDonald's restaurants", "IKEA stores"].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold leading-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-[9px] font-extrabold uppercase text-pink-800 tracking-wider mb-1.5">De Jure Contributors:</h6>
                            <ul className="space-y-1 pl-0.5">
                              {["Gender parity (Education)", "Human capital", "Civil liberties"].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold leading-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-pink-600 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </KOFDimensionCard>

                  {/* pillar 3: POLITICAL */}
                  <KOFDimensionCard
                    title="Political"
                    description="This dimension measures the diffusion of government policies and the level of international political cooperation."
                    deFacto={kof.political.de_facto}
                    deJure={kof.political.de_jure}
                    isExpanded={expandedSet.political}
                    onToggle={() => toggleSection('political')}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Political Globalisation de facto */}
                      <div className="border border-slate-200/60 bg-white shadow-xs rounded-xl p-4">
                        <h5 className="text-[10px] font-black uppercase text-blue-700 tracking-wider mb-2.5 flex items-center justify-between">
                          <span>Political Globalisation (de facto)</span>
                          <span className="text-[9px] font-medium text-blue-600 bg-blue-50 px-1.5 rounded">Observational nodes</span>
                        </h5>
                        <ul className="space-y-1.5">
                          {["Embassies", "UN peace keeping missions", "International NGOs"].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Political Globalisation de jure */}
                      <div className="border border-slate-200/60 bg-white shadow-xs rounded-xl p-4">
                        <h5 className="text-[10px] font-black uppercase text-slate-600 tracking-wider mb-2.5 flex items-center justify-between">
                          <span>Political Globalisation (de jure)</span>
                          <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 rounded">Treaties & Memberships</span>
                        </h5>
                        <ul className="space-y-1.5">
                          {["International organisations (Membership)", "International treaties", "Treaty partner diversity"].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                              <Check className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </KOFDimensionCard>
                </div>

                <div className="border border-blue-100 bg-blue-50/30 rounded-2xl p-4 flex gap-3 items-start">
                  <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-blue-900 uppercase tracking-wider font-sans">Geography Syllabus Focus • KOF Index</h5>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      The KOF Globalization Index provides an empirical score from 1 to 100 capturing international flows and policy enablers. 
                      Economic globalization tracks trade/FDI; social tracks phone calls, tourism, internet access, and cultural products; 
                      political tracks embassies, treaties, and UN missions.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeSubTab === 'kearney' && (
              <motion.div
                key="kearney"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Visual Card 1: Status Classification */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-indigo-50/20 to-slate-50 select-none shadow-xs hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl border border-indigo-100">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Classification</h4>
                      <h3 className="text-sm font-bold text-slate-800">A.T. Kearney Integration Status</h3>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-indigo-950 tracking-tight leading-none mb-3">
                    {data.at_kearney_framework.status}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    This classification identifies the level of globalization, integration into global trade hubs, and infrastructural capacity relative to regional peers.
                  </p>
                </div>

                {/* Visual Card 2: Tier analysis */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30 shadow-xs hover:border-slate-300 transition-all select-none">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-blue-50 text-[#2563eb] p-2 rounded-xl border border-blue-100">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider font-sans">Urban Sway</h4>
                      <h3 className="text-sm font-bold text-slate-800">Global City Index (GCI) Tier</h3>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-3">
                    {data.at_kearney_framework.gci_score_or_tier}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    The GCI measures city performance based on business activity, human capital, information exchange, cultural experience, and political engagement.
                  </p>
                </div>

                {/* Syllabus Card */}
                <div className="md:col-span-2 border border-blue-100 bg-blue-50/50 rounded-2xl p-4 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-blue-900 uppercase tracking-wider font-sans">Geography Syllabus Focus • A.T. Kearney</h5>
                    <p className="text-xs text-blue-700/90 leading-relaxed font-semibold">
                      The A.T. Kearney framework underlines the importance of global cities as nodes of political and financial command. 
                      It emphasizes how national territory is integrated with global commodity, human, and capital flows.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'ey' && (
              <motion.div
                key="ey"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                  {/* Decorative background shape */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-950 text-blue-400 p-2.5 rounded-xl border border-blue-800/60">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-blue-500 tracking-wider">Ernst & Young</h4>
                        <h3 className="text-base font-black text-slate-100 tracking-tight">EY Index Analysis & Historical Track</h3>
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1.5 self-start sm:self-center">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-sans">Globalisation Score</span>
                      <div className="text-3xl font-mono font-black text-blue-400 tracking-tight leading-none">
                        {data.ey_index_historical.score}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Strategic Spatial Analysis</h5>
                    <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                      {data.ey_index_historical.analysis}
                    </p>
                  </div>
                </div>

                {/* Additional syllabus detail for EY */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex gap-3.5 items-start shadow-xs">
                  <Bookmark className="w-5 h-5 text-slate-500 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider leading-none mb-1.5 font-sans">EY Globalization Index Scope</h5>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      The EY Globalization Index measures country ability to integrate with the world economy across five pillars: openness to trade, capital flows, exchange of technology and ideas, movement of labor, and cultural integration.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
