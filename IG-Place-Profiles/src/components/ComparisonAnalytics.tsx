import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';
import type { DPPlaceProfile } from '../types';

interface Props {
  countryA: DPPlaceProfile;
  countryB: DPPlaceProfile;
  narrative: string;
  setNarrative: (val: string) => void;
}

export const ComparisonAnalytics: React.FC<Props> = ({ countryA, countryB, narrative, setNarrative }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNarrative = async () => {
      setLoading(true);
      setError("");
      try {
        const gapData = {
          gni_per_capita_a: countryA.country_metadata.gni_per_capita_atlas,
          gni_per_capita_b: countryB.country_metadata.gni_per_capita_atlas,
          hdi_a: countryA.country_metadata.hdi,
          hdi_b: countryB.country_metadata.hdi,
          employment_a: countryA.economy_tab.employment_structure,
          employment_b: countryB.economy_tab.employment_structure,
        };

        const res = await fetch("/api/gemini/comparison-narrative", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            countryA: countryA.country_metadata.name,
            countryB: countryB.country_metadata.name,
            gapData
          })
        });

        if (!res.ok) throw new Error("API response error");

        const data = await res.json();
        setNarrative(data.narrative || "");
      } catch (err) {
        console.error(err);
        setError("Failed to generate comparative narrative.");
      } finally {
        setLoading(false);
      }
    };

    if (countryA && countryB) {
      fetchNarrative();
    }
  }, [countryA?.country_metadata?.name, countryB?.country_metadata?.name]);

  const devGapUsd = (countryA.country_metadata.gni_per_capita_atlas?.value_usd || 0) - (countryB.country_metadata.gni_per_capita_atlas?.value_usd || 0);

  return (
    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest">
          Divergence / Convergence Analytics
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl border border-indigo-100">
          <div className="text-xs font-bold text-slate-500 uppercase mb-1">GNI Per Capita Gap</div>
          <div className={`text-2xl font-black ${devGapUsd > 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {devGapUsd > 0 ? "+" : ""}{devGapUsd.toLocaleString()} USD
          </div>
          <div className="text-xs text-slate-400 mt-1">Difference in current GNI</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-indigo-100">
          <div className="text-xs font-bold text-slate-500 uppercase mb-1">HDI Gap</div>
          <div className="text-2xl font-black text-slate-700">
            {((countryA.country_metadata.hdi?.score || 0) - (countryB.country_metadata.hdi?.score || 0)).toFixed(3)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Difference in Human Development Index</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-indigo-100 relative min-h-[100px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-indigo-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Synthesizing narrative...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-rose-500 font-medium text-center">{error}</div>
        ) : (
          <div className="prose prose-indigo prose-sm max-w-none text-slate-700">
            {narrative.split('\\n').map((para, i) => (
              <p key={i} className="mb-2 last:mb-0 leading-relaxed font-medium">{para}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
