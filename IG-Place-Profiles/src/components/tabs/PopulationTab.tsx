import { useMemo, useState } from "react";
import { DPPlaceProfile } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";

const RefArea = ReferenceArea as any;
import { 
  Baby, 
  Activity, 
  TrendingUp, 
  Heart, 
  Smile, 
  Users, 
  Percent, 
  Navigation, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Shuffle, 
  UserCheck, 
  HelpCircle,
  GraduationCap
} from "lucide-react";
import { getInterpolatedStats, getEducationStats } from "../../demographics_stats";
import { demographicsMap } from "../../demographics";

const wprBenchmarks: Record<string, { total: number; young: number; elderly: number }> = {
  bangladesh: { total: 53.1, young: 43.42, elderly: 9.68 },
  usa: { total: 53.91, young: 27.08, elderly: 26.83 },
  china: { total: 44.73, young: 24.01, elderly: 20.72 },
  india: { total: 47.01, young: 36.84, elderly: 10.18 },
  "south-korea": { total: 41.45, young: 15.52, elderly: 25.94 },
  vietnam: { total: 47.55, young: 34.83, elderly: 12.72 },
  philippines: { total: 51.22, young: 43.26, elderly: 7.96 },
  malaysia: { total: 42.33, young: 31.72, elderly: 10.61 },
  russia: { total: 51.79, young: 26.59, elderly: 25.2 },
  poland: { total: 53.04, young: 23.1, elderly: 29.94 },
  germany: { total: 57.99, young: 21.99, elderly: 36.01 },
  uk: { total: 57.85, young: 27.48, elderly: 30.37 },
  switzerland: { total: 52.96, young: 22.96, elderly: 30.0 },
  australia: { total: 54.83, young: 27.92, elderly: 26.92 },
  brazil: { total: 44.03, young: 28.71, elderly: 15.32 },
  canada: { total: 51.5, young: 22.7, elderly: 28.8 },
  mexico: { total: 49.04, young: 37.14, elderly: 11.9 },
  drc: { total: 96.68, young: 90.65, elderly: 6.03 },
  nigeria: { total: 80.25, young: 74.79, elderly: 5.46 },
  "south-africa": { total: 48.37, young: 38.7, elderly: 9.67 },
  ethiopia: { total: 74.02, young: 68.51, elderly: 5.52 },
  sudan: { total: 78.13, young: 72.41, elderly: 5.72 },
  chad: { total: 95.36, young: 91.3, elderly: 4.05 },
  niger: { total: 98.16, young: 93.07, elderly: 5.09 },
  iceland: { total: 52.8, young: 26.4, elderly: 26.4 },
  tuvalu: { total: 56.2, young: 44.8, elderly: 11.4 },
  peru: { total: 47.5, young: 35.2, elderly: 12.3 },
  rwanda: { total: 72.1, young: 65.8, elderly: 6.3 },
  kenya: { total: 68.4, young: 62.1, elderly: 6.3 },
  thailand: { total: 44.2, young: 19.5, elderly: 24.7 },
  belgium: { total: 57.2, young: 24.8, elderly: 32.4 },
  france: { total: 61.5, young: 27.2, elderly: 34.3 },
  netherlands: { total: 56.8, young: 24.2, elderly: 32.6 },
  singapore: { total: 38.2, young: 16.5, elderly: 21.7 },
  uae: { total: 17.5, young: 14.1, elderly: 3.4 },
  "saudi-arabia": { total: 35.4, young: 28.2, elderly: 7.2 },
  turkey: { total: 48.2, young: 33.1, elderly: 15.1 },
  egypt: { total: 58.2, young: 50.8, elderly: 7.4 },
  ukraine: { total: 46.2, young: 16.5, elderly: 29.7 },
  indonesia: { total: 47.5, young: 34.2, elderly: 13.3 },
  iran: { total: 45.8, young: 31.2, elderly: 14.6 },
  ireland: { total: 54.2, young: 28.5, elderly: 25.7 },
  italy: { total: 60.5, young: 18.2, elderly: 42.3 },
  cuba: { total: 54.8, young: 21.4, elderly: 33.4 },
  israel: { total: 67.2, young: 46.5, elderly: 20.7 },
  japan: { total: 74.1, young: 21.4, elderly: 52.7 }
};

interface PopulationTabProps {
  data: DPPlaceProfile["population_dynamics_time_series"];
  currentYear: number;
  setSliderYear: (year: number) => void;
  countryName: string;
  countryId: string;
  highlightHdi?: boolean;
  compareCountryId?: string;
}

export function PopulationTab({ 
  data, 
  currentYear, 
  setSliderYear, 
  countryName, 
  countryId,
  highlightHdi = false,
  compareCountryId
 }: PopulationTabProps) {
  
  const [showDependencyRatio, setShowDependencyRatio] = useState(false);
  const [showScenarioModeller, setShowScenarioModeller] = useState(false);
  
  const [fertilityMod, setFertilityMod] = useState(1);
  const [lifeExpMod, setLifeExpMod] = useState(1);
  const [migrationMod, setMigrationMod] = useState(0);

  const resetScenarios = () => {
    setFertilityMod(1);
    setLifeExpMod(1);
    setMigrationMod(0);
  };

  // Retrieve comparison stats if in comparison mode
  const compareStats = useMemo(() => {
    return compareCountryId ? getInterpolatedStats(compareCountryId, currentYear) : null;
  }, [compareCountryId, currentYear]);

  const compareEduStats = useMemo(() => {
    return compareCountryId ? getEducationStats(compareCountryId, currentYear) : null;
  }, [compareCountryId, currentYear]);

  const compareNetMigration = useMemo(() => {
    if (!compareStats) return null;
    return Number((compareStats.inMigration - compareStats.outMigration).toFixed(1));
  }, [compareStats]);

  const renderDelta = (v1: number | undefined, v2: number | undefined, suffix: string = '', isPercent: boolean = false) => {
    if (v1 === undefined || v2 === undefined) return null;
    const t1 = typeof v1 === 'number' ? v1 : parseFloat(String(v1));
    const t2 = typeof v2 === 'number' ? v2 : parseFloat(String(v2));
    if (isNaN(t1) || isNaN(t2)) return null;
    
    const diff = t1 - t2;
    const prefix = diff > 0 ? "+" : "";
    const formattedDiff = isPercent ? diff.toFixed(1) + "%" : (suffix === '‰' || suffix === '%' ? diff.toFixed(1) : diff.toFixed(1));
    
    return (
      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-200 shrink-0 inline-flex items-center shadow-3xs" title="Comparative Delta Value">
        Δ {prefix}{formattedDiff}{suffix}
      </span>
    );
  };
  
  // Find closest year node for structures
  const activeNode = useMemo(() => {
    return data.reduce((prev, curr) => 
      Math.abs(curr.year - currentYear) < Math.abs(prev.year - currentYear) ? curr : prev
    );
  }, [data, currentYear]);

  // Dynamic oldest age label to avoid hardcoding errors across countries/years
  const oldestCohortLabel = useMemo(() => {
    if (!activeNode.pyramid_structure?.cohorts || activeNode.pyramid_structure.cohorts.length === 0) return "80+";
    return activeNode.pyramid_structure.cohorts[activeNode.pyramid_structure.cohorts.length - 1].age;
  }, [activeNode]);

  // Exact IB Diploma Geography dependency structure parser & calculations
  const dependencyAnalysis = useMemo(() => {
    // 1. Calculate raw statistics for active year from the physical pyramid cohorts
    let youngSum = 0;
    let activeSum = 0;
    let elderlySum = 0;

    activeNode.pyramid_structure.cohorts.forEach(c => {
      const startAge = parseInt(c.age.split('-')[0]) || 0;
      const totalPct = Math.abs(c.male_pct || 0) + Math.abs(c.female_pct || 0);
      if (startAge < 15) {
        youngSum += totalPct;
      } else if (startAge >= 65) {
        elderlySum += totalPct;
      } else {
        activeSum += totalPct;
      }
    });

    const activeVal = activeSum > 0 ? activeSum : 1; 
    const rawRatio = ((youngSum + elderlySum) / activeVal) * 100;
    const rawYoungRatio = (youngSum / activeVal) * 100;
    const rawElderlyRatio = (elderlySum / activeVal) * 100;

    // 2. Fetch World Population Review 2024 database benchmarks
    const benchmark = wprBenchmarks[countryId.toLowerCase()] || wprBenchmarks["bangladesh"];

    // 3. Find 2023 node raw ratios to compute scaling adjustments (anchoring calibration target)
    const refNode = data.find(n => n.year === 2023) || data.reduce((prev, curr) => Math.abs(curr.year - 2023) < Math.abs(prev.year - 2023) ? curr : prev);
    let refYoungSum = 0;
    let refActiveSum = 0;
    let refElderlySum = 0;

    refNode.pyramid_structure.cohorts.forEach(c => {
      const startAge = parseInt(c.age.split('-')[0]) || 0;
      const totalPct = Math.abs(c.male_pct || 0) + Math.abs(c.female_pct || 0);
      if (startAge < 15) {
        refYoungSum += totalPct;
      } else if (startAge >= 65) {
        refElderlySum += totalPct;
      } else {
        refActiveSum += totalPct;
      }
    });

    const refActiveVal = refActiveSum > 0 ? refActiveSum : 1;
    const refRawRatio = ((refYoungSum + refElderlySum) / refActiveVal) * 100;
    const refRawYoungRatio = (refYoungSum / refActiveVal) * 100;
    const refRawElderlyRatio = (refElderlySum / refActiveVal) * 100;

    // 4. Calculate dynamic scaling factor so that in 2023, value matches WPR exactly
    const ratioFactor = refRawRatio > 0 ? (benchmark.total / refRawRatio) : 1;
    const youngFactor = refRawYoungRatio > 0 ? (benchmark.young / refRawYoungRatio) : 1;
    const elderlyFactor = refRawElderlyRatio > 0 ? (benchmark.elderly / refRawElderlyRatio) : 1;

    // 5. Apply the calibrated factor to the current slider year
    const calibratedRatio = rawRatio * ratioFactor;
    const calibratedYoungRatio = rawYoungRatio * youngFactor;
    const calibratedElderlyRatio = rawElderlyRatio * elderlyFactor;

    // 6. Recalculate component segments dynamically to always sum exactly to 100% of demographic space
    // Active % = 10000 / (100 + calibratedRatio)
    const calActivePct = 10000 / (100 + calibratedRatio);
    const calYoungPct = (calibratedYoungRatio * calActivePct) / 100;
    const calElderlyPct = (calibratedElderlyRatio * calActivePct) / 100;

    return {
      youngPct: Number(calYoungPct.toFixed(1)),
      activePct: Number(calActivePct.toFixed(1)),
      elderlyPct: Number(calElderlyPct.toFixed(1)),
      ratio: Number(calibratedRatio.toFixed(2)),
      youngRatio: Number(calibratedYoungRatio.toFixed(1)),
      elderlyRatio: Number(calibratedElderlyRatio.toFixed(1)),
      rawRatio: Number(rawRatio.toFixed(1)),
      wprBenchmark: benchmark
    };
  }, [activeNode, data, countryId]);

  // Find max cohort to determine X-axis domain bound dynamically
  const maxCohortBound = useMemo(() => {
    let max = 0;
    activeNode.pyramid_structure.cohorts.forEach(c => {
      max = Math.max(max, Math.abs(c.male_pct || 0), Math.abs(c.female_pct || 0));
    });
    return max + 0.5;
  }, [activeNode]);

  // Format pyramid data (Male becomes negative for diverging stacked bar chart)
  const pyramidData = useMemo(() => {
    let cohorts = [...activeNode.pyramid_structure.cohorts].reverse().map(c => ({
      age: c.age,
      male: Math.abs(c.male_pct || 0),
      female: Math.abs(c.female_pct || 0)
    }));

    // Apply Scenario Modellers
    if (fertilityMod !== 1 || lifeExpMod !== 1 || migrationMod !== 0) {
      cohorts = cohorts.map(c => {
        let m = c.male;
        let f = c.female;
        
        // Younger cohorts (last in the reversed array)
        if (["0-4", "5-9", "10-14"].includes(c.age)) {
          m *= fertilityMod;
          f *= fertilityMod;
        }
        
        // Older cohorts
        if (["65-69", "70-74", "75-79", "80-84", "85+", "90-94", "95-99", "100+"].includes(c.age)) {
          m *= lifeExpMod;
          f *= lifeExpMod;
        }

        // Migration (typically affects working age)
        if (["20-24", "25-29", "30-34"].includes(c.age)) {
          m *= (1 + migrationMod);
          f *= (1 + migrationMod);
        }

        return { age: c.age, male: m, female: f };
      });

      // Normalize to 100%
      const total = cohorts.reduce((acc, c) => acc + c.male + c.female, 0);
      if (total > 0) {
        cohorts = cohorts.map(c => ({
          age: c.age,
          male: (c.male / total) * 100,
          female: (c.female / total) * 100
        }));
      }
    }

    return cohorts.map(c => ({
      age: c.age,
      male: -c.male,
      female: c.female,
      maleLabel: c.male,
      femaleLabel: c.female
    }));
  }, [activeNode, fertilityMod, lifeExpMod, migrationMod]);

  // Max density for choropleth opacity scaling
  const maxDensity = useMemo(() => {
    if (!activeNode.sub_national_density_choropleth || activeNode.sub_national_density_choropleth.length === 0) return 1;
    return Math.max(...activeNode.sub_national_density_choropleth.map(r => r.density_per_km2));
  }, [activeNode]);

  // Interpolated stats based on custom database
  const stats = useMemo(() => {
    let base = getInterpolatedStats(countryId, currentYear);
    if (!base) return null;

    let modified = { ...base };
    
    // Scenario Adjustments
    if (fertilityMod !== 1) {
      modified.birthRate = modified.birthRate * fertilityMod;
      modified.tfr = (modified.tfr || 2.1) * fertilityMod;
    }
    if (lifeExpMod !== 1) {
      modified.lifeExpectancy = (modified.lifeExpectancy || 70) * lifeExpMod;
      modified.deathRate = modified.deathRate * (1 / lifeExpMod); // Lower CDR if life exp increases
    }
    if (migrationMod !== 0) {
      modified.inMigration = (modified.inMigration || 0) + (migrationMod * 10);
    }
    
    return modified;
  }, [countryId, currentYear, fertilityMod, lifeExpMod, migrationMod]);

  const eduStats = useMemo(() => {
    return getEducationStats(countryId, currentYear);
  }, [countryId, currentYear]);

  // Calculations for migration & labor
  const netMigration = useMemo(() => {
    return Number((stats.inMigration - stats.outMigration).toFixed(1));
  }, [stats.inMigration, stats.outMigration]);

  // Render DTM label
  const dtmDetails = useMemo(() => {
    switch (stats.dtmStage) {
      case 1: return { label: "Stage 1: High Fluctuating", desc: "High birth/death rates, stable population", color: "text-rose-600 bg-rose-50 border-rose-100" };
      case 2: return { label: "Stage 2: Early Expanding", desc: "Death rate drops rapidly, rapid growth", color: "text-amber-600 bg-amber-50 border-amber-100" };
      case 3: return { label: "Stage 3: Late Expanding", desc: "Birth rate drops rapidly, growth slowing", color: "text-yellow-600 bg-yellow-50 border-yellow-105" };
      case 4: return { label: "Stage 4: Low Fluctuating", desc: "Low birth/death rates, high stability", color: "text-emerald-600 bg-emerald-50 border-emerald-110" };
      case 5: return { label: "Stage 5: Declining/Post-Ind.", desc: "Death rate exceeds birth, contraction", color: "text-indigo-600 bg-indigo-50 border-indigo-110" };
      default: return { label: `Stage ${stats.dtmStage}`, desc: "Transitional phase", color: "text-slate-600 bg-slate-50 border-slate-110" };
    }
  }, [stats.dtmStage]);

  return (
    <div className="animate-in fade-in duration-500 flex flex-col gap-6">
      
      {/* Dynamic Key Statistics Grid (Bento Boxes) requested by User */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#00ba70]" />
            Core Demographic Indicators & Key Rates ({currentYear})
          </span>
          <span className="text-[12px] font-extrabold text-[#00ba70] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            Real-time Interpolated Estimates
          </span>
        </div>

        {/* The 12 Key Demographic Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          
          {/* 1. Birth Rate */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-[#00ba70] transition-colors relative group">
            <div className="flex items-start justify-between">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tight leading-none">Birth Rate</span>
              <Baby className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-slate-800 tracking-tight flex items-baseline gap-0.5 flex-wrap">
                {stats.birthRate.toFixed(1)}
                <span className="text-xs font-semibold text-slate-400">‰</span>
                {renderDelta(stats.birthRate, compareStats?.birthRate, '‰')}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal font-medium">
                Annual live births per 1,000 population.
              </p>
            </div>
          </div>

          {/* 2. Death Rate */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-red-400 transition-colors relative group">
            <div className="flex items-start justify-between">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tight leading-none">Death Rate</span>
              <Heart className="w-4 h-4 text-red-400 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-slate-800 tracking-tight flex items-baseline gap-0.5 flex-wrap">
                {stats.deathRate.toFixed(1)}
                <span className="text-xs font-semibold text-slate-400">‰</span>
                {renderDelta(stats.deathRate, compareStats?.deathRate, '‰')}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal font-medium">
                Annual deaths per 1,000 population.
              </p>
            </div>
          </div>

          {/* 3. Pop Growth Rate */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-colors relative group">
            <div className="flex items-start justify-between">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tight leading-none">Pop Growth Rate</span>
              <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-slate-800 tracking-tight flex items-baseline gap-0.5 flex-wrap">
                {stats.popGrowth >= 0 ? `+${stats.popGrowth.toFixed(2)}` : stats.popGrowth.toFixed(2)}
                <span className="text-xs font-semibold text-slate-400">%</span>
                {renderDelta(stats.popGrowth, compareStats?.popGrowth, '%')}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal font-medium">
                Annual percent change in population.
              </p>
            </div>
          </div>

          {/* 4. Fertility Rate */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-purple-400 transition-colors relative group">
            <div className="flex items-start justify-between">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tight leading-none">Fertility Rate</span>
              <Smile className="w-4 h-4 text-purple-400 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-slate-800 tracking-tight flex items-baseline gap-0.5 flex-wrap">
                {stats.fertilityRate}
                <span className="text-xs font-semibold text-slate-400">‰</span>
                {renderDelta(stats.fertilityRate, compareStats?.fertilityRate, '‰')}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal font-medium">
                Births per 1,000 women of childbearing age (15–49).
              </p>
            </div>
          </div>

          {/* 5. Total Fertility Rate */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-indigo-400 transition-colors relative group">
            <div className="flex items-start justify-between">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tight leading-none">Total Fertility Rate</span>
              <Users className="w-4 h-4 text-indigo-500 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-slate-800 tracking-tight flex items-baseline gap-0.5 flex-wrap">
                {stats.tfr.toFixed(2)}
                <span className="text-[9px] font-bold text-slate-400 ml-1">avg</span>
                {renderDelta(stats.tfr, compareStats?.tfr)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-[8.5px] font-extrabold px-1 py-0.2 rounded border uppercase ${stats.tfr >= 2.1 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                  {stats.tfr >= 2.1 ? "Growth" : "Sub-Replace"}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Life Expectancy */}
          <div className={`p-3 flex flex-col justify-between shadow-xs transition-all duration-300 relative group rounded-xl border ${highlightHdi ? 'bg-emerald-100/70 border-emerald-300 shadow-sm' : 'bg-white border-slate-200 hover:border-[#00ba70]'}`}>
            <div className="flex items-start justify-between">
              <span className={`text-[12px] font-bold uppercase tracking-tight leading-none ${highlightHdi ? 'text-emerald-700' : 'text-slate-400'}`}>Life Expectancy</span>
              <Activity className={`w-4 h-4 shrink-0 transition-colors ${highlightHdi ? 'text-emerald-600' : 'text-[#00ba70]'}`} />
            </div>
            <div className="mt-3">
              <div className={`text-xl font-black tracking-tight flex items-baseline gap-0.5 flex-wrap ${highlightHdi ? 'text-emerald-950 font-black' : 'text-slate-800'}`}>
                {stats.lifeExpectancy.toFixed(1)}
                <span className={`text-xs font-semibold ${highlightHdi ? 'text-emerald-600' : 'text-slate-400'}`}>yrs</span>
                {renderDelta(stats.lifeExpectancy, compareStats?.lifeExpectancy, ' yrs')}
              </div>
              <p className={`text-[9px] mt-1 leading-normal font-semibold ${highlightHdi ? 'text-emerald-700/80 font-semibold' : 'text-slate-400 font-medium'}`}>
                Average years expected at birth.
              </p>
            </div>
          </div>

          {/* 7. Infant Mortality Rate */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-orange-400 transition-colors relative group">
            <div className="flex items-start justify-between">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tight leading-none">Infant Mortality Rate</span>
              <HelpCircle className="w-4 h-4 text-orange-400 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-slate-800 tracking-tight flex items-baseline gap-0.5 flex-wrap font-sans">
                {stats.imr.toFixed(1)}
                <span className="text-xs font-semibold text-slate-400">‰</span>
                {renderDelta(stats.imr, compareStats?.imr, '‰')}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal font-medium">
                Deaths under age 1 per 1,000 live births.
              </p>
            </div>
          </div>

          {/* 8. Literacy & Education Profile */}
          <div className={`p-3 flex flex-col justify-between shadow-xs transition-all duration-300 relative group col-span-1 rounded-xl border ${highlightHdi ? 'bg-emerald-100/70 border-emerald-300 shadow-sm' : 'bg-white border-slate-200 hover:border-violet-400'}`}>
            <div className="flex items-start justify-between">
              <span className={`text-[12px] font-bold uppercase tracking-tight leading-none ${highlightHdi ? 'text-emerald-700' : 'text-slate-400'}`}>Education Profile</span>
              <GraduationCap className={`w-4 h-4 shrink-0 transition-colors ${highlightHdi ? 'text-emerald-600' : 'text-violet-500'}`} />
            </div>
            <div className="mt-3">
              <div className={`text-xl font-black tracking-tight ${highlightHdi ? 'text-emerald-950 font-black' : 'text-slate-800'} flex items-baseline flex-wrap`}>
                {eduStats.literacyRate.toFixed(1)}%
                <span className={`text-[10px] font-bold uppercase ml-1.5 font-sans ${highlightHdi ? 'text-emerald-600' : 'text-slate-400'}`}>Literacy</span>
                {renderDelta(eduStats.literacyRate, compareEduStats?.literacyRate, '%')}
              </div>
              <div className={`flex flex-col gap-1 mt-1 border-t pt-1 ${highlightHdi ? 'border-emerald-200' : 'border-slate-100'}`}>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[9px] font-bold uppercase tracking-tight leading-none ${highlightHdi ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>Expected Schooling:</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md border shrink-0 transition-colors ${highlightHdi ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-violet-600 bg-violet-50 border-violet-100'}`}>{eduStats.expectedSchooling} yrs</span>
                </div>
                {renderDelta(eduStats.expectedSchooling, compareEduStats?.expectedSchooling, ' yrs')}
              </div>
            </div>
          </div>

          {/* 9. Sex ratio */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-cyan-400 transition-colors relative group">
            <div className="flex items-start justify-between">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tight leading-none">Sex Ratio</span>
              <UserCheck className="w-4 h-4 text-cyan-500 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-slate-800 tracking-tight flex items-baseline gap-0.5 flex-wrap">
                {stats.sexRatio.toFixed(1)}
                <span className="text-[8.5px] font-bold text-slate-400 ml-1">m/100f</span>
                {renderDelta(stats.sexRatio, compareStats?.sexRatio)}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal font-medium">
                Number of males for every 100 females.
              </p>
            </div>
          </div>

          {/* 10. In migration */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-teal-400 transition-colors relative group">
            <div className="flex items-start justify-between">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tight leading-none">In Migration</span>
              <ArrowDownLeft className="w-4 h-4 text-teal-400 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-slate-800 tracking-tight flex items-baseline gap-0.5 flex-wrap">
                {stats.inMigration}K
                <span className="text-[8.5px] font-bold text-slate-400 ml-1">/yr</span>
                {renderDelta(stats.inMigration, compareStats?.inMigration, 'K')}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal font-medium">
                Estimated average annual arrivals.
              </p>
            </div>
          </div>

          {/* 11. Out migration */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-orange-300 transition-colors relative group">
            <div className="flex items-start justify-between">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tight leading-none">Out Migration</span>
              <ArrowUpRight className="w-4 h-4 text-orange-400 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-slate-800 tracking-tight flex items-baseline gap-0.5 flex-wrap">
                {stats.outMigration}K
                <span className="text-[8.5px] font-bold text-slate-400 ml-1">/yr</span>
                {renderDelta(stats.outMigration, compareStats?.outMigration, 'K')}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal font-medium">
                Estimated average annual departures.
              </p>
            </div>
          </div>

          {/* 12. Net migration */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-emerald-400 transition-colors relative group">
            <div className="flex items-start justify-between">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tight leading-none">Net Migration</span>
              <Shuffle className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-slate-800 tracking-tight flex items-baseline gap-0.5 flex-wrap">
                {netMigration >= 0 ? `+${netMigration}` : netMigration}K
                <span className="text-[8.5px] font-bold text-slate-400 ml-1">/yr</span>
                {renderDelta(netMigration, compareNetMigration, 'K')}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal font-medium">
                Difference: arrivals minus departures.
              </p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Cultural Demographics Section (Side-by-Side) */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col justify-between shadow-xs hover:border-emerald-400 transition-colors">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] font-black text-slate-400 uppercase tracking-widest font-sans mb-4">
            <span className="text-xs">📊</span>
            <span>Cultural Makeup & Composition</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Ethnic Composition */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-black text-slate-500 uppercase tracking-wider">Ethnic Groups</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full flex overflow-hidden">
                {(demographicsMap[countryId]?.['ethnic'] || []).map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ width: `${item.pct}%` }} 
                    className={`h-full ${item.color} transition-all duration-300`}
                    title={`${item.name}: ${item.pct}%`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[110px] overflow-y-auto scrollbar-thin pr-1">
                {(demographicsMap[countryId]?.['ethnic'] || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[12px] leading-tight bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                    <div className="flex items-center gap-1 font-bold text-slate-700 truncate mr-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.color}`} />
                      <span className="truncate text-[12px]">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-800 bg-white border border-slate-200 px-1 py-0.2 rounded text-[12px]">
                      {item.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Religious Composition */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-black text-slate-500 uppercase tracking-wider">Religious Affiliation</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full flex overflow-hidden">
                {(demographicsMap[countryId]?.['religion'] || []).map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ width: `${item.pct}%` }} 
                    className={`h-full ${item.color} transition-all duration-300`}
                    title={`${item.name}: ${item.pct}%`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[110px] overflow-y-auto scrollbar-thin pr-1">
                {(demographicsMap[countryId]?.['religion'] || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[12px] leading-tight bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                    <div className="flex items-center gap-1 font-bold text-slate-700 truncate mr-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.color}`} />
                      <span className="truncate text-[12px]">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-800 bg-white border border-slate-200 px-1 py-0.2 rounded text-[12px]">
                      {item.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Scenario Modeller UI */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm transition-all relative print-avoid-break print-hidden">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Interactive Scenario Modeller</h3>
          </div>
          <div className="flex items-center gap-3">
            {(fertilityMod !== 1 || lifeExpMod !== 1 || migrationMod !== 0) && (
              <button 
                onClick={resetScenarios}
                className="text-xs font-bold px-3 py-1 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => setShowScenarioModeller(!showScenarioModeller)}
              className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors uppercase"
            >
              {showScenarioModeller ? "Hide Settings" : "Adjust Variables"}
            </button>
          </div>
        </div>

        {showScenarioModeller && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 animate-in slide-in-from-top-4 duration-300">
            {/* Fertility Rate */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase">Fertility Rate Mod</span>
                <span className="text-xs font-black text-indigo-600">{fertilityMod.toFixed(2)}x</span>
              </div>
              <input 
                type="range" min="0.5" max="1.5" step="0.05"
                value={fertilityMod} onChange={(e) => setFertilityMod(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-2">Adjusts natural birth rates and scales youth cohort (0-14 yrs) base proportions.</p>
            </div>
            
            {/* Life Expectancy */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase">Life Exp Mod</span>
                <span className="text-xs font-black text-indigo-600">{lifeExpMod.toFixed(2)}x</span>
              </div>
              <input 
                type="range" min="0.8" max="1.3" step="0.05"
                value={lifeExpMod} onChange={(e) => setLifeExpMod(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-2">Adjusts elderly cohort limits (65+ yrs) and modifies crude death rates (CDR).</p>
            </div>

            {/* Migration */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase">Net Migration Mod</span>
                <span className="text-xs font-black text-indigo-600">{migrationMod > 0 ? "+" : ""}{migrationMod.toFixed(2)}x</span>
              </div>
              <input 
                type="range" min="-1" max="1" step="0.1"
                value={migrationMod} onChange={(e) => setMigrationMod(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-2">Simulates influx/outflux of young working-age groups (20-35 yrs).</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Pane: Pyramid */}
        <div className="flex flex-col gap-4 print-avoid-break">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Timeline</span>
              <input 
                type="range" 
                min="1970" 
                max="2040" 
                step="1"
                value={currentYear}
                onChange={(e) => setSliderYear(parseInt(e.target.value))}
                className="flex-1 min-w-0 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-sm font-mono font-bold text-emerald-600 w-10 text-right shrink-0">{currentYear}</span>
            </div>
          </div>
          
          <Card className="flex flex-col flex-1">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle>Demographic Pyramid ({activeNode.year})</CardTitle>
              <div className="flex items-center gap-4">
                {/* Premium Switch Custom Styled Selector */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Dependency Ratio</span>
                  <button
                    type="button"
                    onClick={() => setShowDependencyRatio(!showDependencyRatio)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      showDependencyRatio ? 'bg-[#00ba70]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        showDependencyRatio ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <a 
                  href={
                    countryName.toLowerCase().includes("venezuela")
                      ? `https://www.populationpyramid.net/venezuela-bolivarian-republic-of/${activeNode.year}/`
                      : `https://www.populationpyramid.net/${countryName.replace(/\s+/g, '-').toLowerCase()}/${activeNode.year}/`
                  }
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] font-bold tracking-wider px-2 py-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors shrink-0"
                  title={`View ${countryName} on PopulationPyramid.net`}
                >
                  View Base Data
                </a>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 pt-2 border-b border-slate-100 pb-2">
              <span className="text-emerald-600">Male (%)</span>
              <span className="text-pink-600">Female (%)</span>
            </div>
          </CardHeader>
          
          {showDependencyRatio && (
            <div className="px-6 pt-4 animate-in slide-in-from-top duration-300">
              <div className="bg-slate-50/85 border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-xs text-center">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dependency Ratio ({activeNode.year})</span>
                  <div className="text-5xl font-black text-slate-800 tracking-tight mt-1">
                    {dependencyAnalysis.ratio}%
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-600 max-w-md mx-auto leading-relaxed">
                  Approximately <span className="font-extrabold text-slate-800">{Math.round(dependencyAnalysis.ratio)}</span> people supported by 100 working-age people.
                </p>

                {/* Composition progress bar with dynamic markers */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-left max-w-xl mx-auto w-full">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className="text-rose-500">Young ({dependencyAnalysis.youngPct}%)</span>
                    <span className="text-emerald-500">Working Active ({dependencyAnalysis.activePct}%)</span>
                    <span className="text-rose-550">Elderly ({dependencyAnalysis.elderlyPct}%)</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-lg flex overflow-hidden border border-slate-200">
                    <div 
                      style={{ width: `${dependencyAnalysis.youngPct}%` }} 
                      className="h-full bg-rose-400/90 transition-all duration-300 flex items-center justify-center text-[10px] font-black text-white"
                      title={`Young: ${dependencyAnalysis.youngPct}%`}
                    >
                      {dependencyAnalysis.youngPct >= 10 && `${dependencyAnalysis.youngPct}%`}
                    </div>
                    <div 
                      style={{ width: `${dependencyAnalysis.activePct}%` }} 
                      className="h-full bg-emerald-400/90 transition-all duration-300 flex items-center justify-center text-[10px] font-black text-white border-l border-r border-white/40"
                      title={`Active: ${dependencyAnalysis.activePct}%`}
                    >
                      {dependencyAnalysis.activePct >= 10 && `${dependencyAnalysis.activePct}%`}
                    </div>
                    <div 
                      style={{ width: `${dependencyAnalysis.elderlyPct}%` }} 
                      className="h-full bg-rose-400/90 transition-all duration-300 flex items-center justify-center text-[10px] font-black text-white"
                      title={`Elderly: ${dependencyAnalysis.elderlyPct}%`}
                    >
                      {dependencyAnalysis.elderlyPct >= 10 && `${dependencyAnalysis.elderlyPct}%`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <CardContent className="flex-1 w-full mt-4 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={pyramidData} barCategoryGap={1} stackOffset="sign">
                <XAxis 
                  type="number" 
                  domain={[-maxCohortBound, maxCohortBound]} 
                  tickFormatter={(val) => Math.abs(val) + "%"} 
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  ticks={[-maxCohortBound, -Math.floor(maxCohortBound/2), 0, Math.floor(maxCohortBound/2), maxCohortBound]}
                />
                <YAxis 
                  dataKey="age" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  width={40}
                  interval={0}
                />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  formatter={(value: number, name: string, props: any) => {
                    const rawValue = name === 'male' ? props.payload.maleLabel : props.payload.femaleLabel;
                    return [`${Number(rawValue || 0).toFixed(1)}%`, name.charAt(0).toUpperCase() + name.slice(1)];
                  }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <ReferenceLine x={0} stroke="#cbd5e1" />
                {showDependencyRatio && (
                  <RefArea y1="0-4" y2="10-14" fill="#fee2e2" fillOpacity={0.4} isFront={false} />
                )}
                {showDependencyRatio && (
                  <RefArea y1="15-19" y2="60-64" fill="#dcfce7" fillOpacity={0.4} isFront={false} />
                )}
                {showDependencyRatio && (
                  <RefArea y1="65-69" y2={oldestCohortLabel} fill="#fee2e2" fillOpacity={0.4} isFront={false} />
                )}
                <Bar dataKey="male" fill="#10b981" stackId="stack" isAnimationActive={false} />
                <Bar dataKey="female" fill="#ec4899" stackId="stack" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </div>

        {/* Right Pane: Demographic Transition Model (DTM) SVG Graphics */}
        <Card className="flex flex-col print-avoid-break">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Demographic Transition Model (DTM)</CardTitle>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${dtmDetails.color}`}>
                Stage {stats.dtmStage}
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-xs text-slate-500 mb-3 font-medium leading-relaxed">
              Standard curriculum model plotting shift on natural balance rates. Active indicator shows where <span className="font-bold text-slate-800">{countryName}</span> sits based on current stats.
            </p>

            {/* Premium DTM Interactive Vector Graphic Frame */}
            <div className="relative w-full aspect-[5/2.5] bg-slate-50 border border-slate-200/60 rounded-xl p-2 select-none overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 240">
                <defs>
                  {/* population growth area blue gradient */}
                  <linearGradient id="pop-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* 5 Stages Grid Columns */}
                {[1, 2, 3, 4, 5].map((stageNumber) => {
                  const xCoord = (stageNumber - 1) * 100;
                  const isCurrent = stats.dtmStage === stageNumber;
                  return (
                    <g key={stageNumber}>
                      {/* Active stage vertical column shading */}
                      {isCurrent && (
                        <rect
                          x={xCoord}
                          y={0}
                          width="100"
                          height="205"
                          fill="#f0fdf4"
                          fillOpacity="0.8"
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                        />
                      )}
                      
                      {/* Section Dividing Lines */}
                      {stageNumber > 1 && (
                        <line 
                          x1={xCoord} 
                          y1="0" 
                          x2={xCoord} 
                          y2="205" 
                          stroke="#e2e8f0" 
                          strokeWidth="1.2" 
                          strokeDasharray="2 1"
                        />
                      )}

                      {/* Header Stage Label */}
                      <text
                        x={xCoord + 50}
                        y="18"
                        textAnchor="middle"
                        className={`text-[8.5px] font-black tracking-widest ${isCurrent ? 'fill-emerald-600 font-extrabold' : 'fill-slate-400'}`}
                      >
                        STAGE {stageNumber}
                      </text>
                    </g>
                  );
                })}

                {/* Shading Area under Population Curve */}
                <path
                  d="M 0 205 L 100 205 C 130 205, 170 180, 200 140 C 240 95, 280 82, 300 78 C 340 73, 380 73, 400 73 C 430 73, 470 78, 500 83 L 500 205 Z"
                  fill="url(#pop-fill)"
                />

                {/* 1. Total Population Line (Purple) */}
                <path
                  d="M 0 205 L 100 205 C 130 205, 170 180, 200 140 C 240 95, 280 82, 300 78 C 340 73, 380 73, 400 73 C 430 73, 470 78, 500 83"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* 2. Birth Rate Line (Blue) */}
                <path
                  d="M 0 45 L 100 45 C 150 45, 180 45, 200 50 C 230 60, 270 145, 300 168 C 330 178, 370 178, 400 178 C 430 178, 470 188, 500 192"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* 3. Death Rate Line (Red) */}
                <path
                  d="M 0 55 L 100 55 C 120 55, 150 115, 200 155 C 230 172, 270 178, 300 178 C 330 178, 370 178, 400 178 C 430 178, 470 175, 500 172"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Axis Bottom Line */}
                <line x1="0" y1="205" x2="500" y2="205" stroke="#94a3b8" strokeWidth="1.5" />

                {/* Legends inline styling */}
                <g transform="translate(15, 218)">
                  <circle cx="5" cy="4" r="3.5" fill="#a855f7" />
                  <text x="14" y="7" className="text-[8px] font-bold fill-slate-500">Total Population</text>
                </g>
                <g transform="translate(180, 218)">
                  <circle cx="5" cy="4" r="3.5" fill="#3b82f6" />
                  <text x="14" y="7" className="text-[8px] font-bold fill-slate-500">Birth Rate (‰)</text>
                </g>
                <g transform="translate(340, 218)">
                  <circle cx="5" cy="4" r="3.5" fill="#ef4444" />
                  <text x="14" y="7" className="text-[8px] font-bold fill-slate-500">Death Rate (‰)</text>
                </g>

                {/* Interactive coordinate Pin indicating actual annotated overlay state */}
                {(() => {
                  // Mapped center points representing development coordinate placement
                  const dtmPins: Record<number, { x: number; y: number }> = {
                    1: { x: 50, y: 50 },
                    2: { x: 150, y: 105 },
                    3: { x: 250, y: 153 },
                    4: { x: 350, y: 178 },
                    5: { x: 450, y: 182 }
                  };
                  
                  const targetPin = dtmPins[stats.dtmStage] || dtmPins[2];

                  return (
                    <g className="transition-all duration-500 ease-out">
                      {/* Outer pulse circle animation */}
                      <circle cx={targetPin.x} cy={targetPin.y} r="10" fill="#00ba70" fillOpacity="0.32" className="animate-ping" />
                      
                      {/* Pin center point */}
                      <circle cx={targetPin.x} cy={targetPin.y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />

                      {/* Tooltip dialog overlay displaying stats */}
                      <g transform={`translate(${targetPin.x - 65}, ${targetPin.y - 48})`}>
                        <rect x="0" y="0" width="130" height="34" rx="5" fill="#0f172a" fillOpacity="0.95" />
                        <text x="65" y="11" textAnchor="middle" className="text-[8px] font-black fill-white truncate">
                          {countryName} ({currentYear})
                        </text>
                        <text x="65" y="21" textAnchor="middle" className="text-[7.2px] font-extrabold fill-emerald-400 uppercase tracking-widest">
                          {dtmDetails.label}
                        </text>
                        <text x="65" y="29" textAnchor="middle" className="text-[6.5px] font-semibold fill-slate-400">
                          BR: {stats.birthRate}‰ | DR: {stats.deathRate}‰
                        </text>
                        <polygon points="61,34 69,34 65,38" fill="#0f172a" />
                      </g>
                    </g>
                  );
                })()}

              </svg>
            </div>

            {/* Key DTM descriptions panel */}
            <div className="mt-3 border-t border-slate-100 pt-2.5">
              <div className="text-[10px] bg-emerald-50 border border-emerald-100/60 rounded-lg p-2 text-emerald-950 font-medium leading-relaxed">
                <span className="font-black text-emerald-700 uppercase">Syllabus Overview:</span> {dtmDetails.desc}. Birth and death rate discrepancies represent corresponding stage-related expansions or contractions.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
