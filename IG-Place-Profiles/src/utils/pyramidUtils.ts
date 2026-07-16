import { getInterpolatedStats } from "../demographics_stats";

/**
 * DP GlobeTube Demographic Optimizer
 * Interpolates sparse population pyramid structures (0-4, 5-14, 15-64, 65-79, 80+)
 * into high-fidelity 5-year cohorts suitable for rigorous IB Geography syllabus analysis,
 * using stage-appropriate DTM decay & bulge curves.
 */
export function interpolateCohorts(
  originalCohorts: Array<{ age: string; male_pct: number; female_pct: number }>,
  countryId: string,
  year: number
): Array<{ age: string; male_pct: number; female_pct: number }> {
  // Guard clause
  if (!originalCohorts || originalCohorts.length === 0) {
    return [];
  }

  // If cohorts are already high-fidelity (not sparse), return original array (e.g. Bangladesh/USA)
  if (originalCohorts.length > 10) {
    return originalCohorts;
  }

  // Determine stage of Demographics Transition Model (DTM) for custom curve shaping
  let dtmStage = 3;
  try {
    const stats = getInterpolatedStats(countryId, year);
    if (stats && stats.dtmStage) {
      dtmStage = stats.dtmStage;
    }
  } catch (e) {
    // Graceful fallback to stage 3
    dtmStage = 3;
  }

  // Populate key-value map for fast accessor
  const source: Record<string, { male: number; female: number }> = {};
  originalCohorts.forEach(c => {
    source[c.age.trim()] = {
      male: Math.abs(c.male_pct),
      female: Math.abs(c.female_pct)
    };
  });

  // Flexible lookup helper to handle any space or typo variations in JSON properties safely
  const getSourcePct = (keys: string[]) => {
    for (const key of keys) {
      if (source[key] !== undefined) return source[key];
    }
    // Fallback normalization search
    const found = originalCohorts.find(c => 
      keys.some(k => c.age.replace(/\s+/g, '') === k.replace(/\s+/g, ''))
    );
    if (found) {
      return { male: Math.abs(found.male_pct), female: Math.abs(found.female_pct) };
    }
    return { male: 0, female: 0 };
  };

  const c_0_4 = getSourcePct(["0-4"]);
  const c_5_14 = getSourcePct(["5-14", "5-15", "5-9", "10-14"]);
  const c_15_64 = getSourcePct(["15-64", "15-65", "15-19", "20-64"]);
  const c_65_79 = getSourcePct(["65-79", "65-80"]);
  const c_80_plus = getSourcePct(["80+", "80-100", "80-120"]);

  const result: Array<{ age: string; male_pct: number; female_pct: number }> = [];

  const addCohort = (ageLabel: string, maleVal: number, femaleVal: number) => {
    result.push({
      age: ageLabel,
      male_pct: -Math.abs(Number(maleVal.toFixed(4))),
      female_pct: Math.abs(Number(femaleVal.toFixed(4)))
    });
  };

  // 1. Cohort: 0-4 (stays 0-4)
  addCohort("0-4", c_0_4.male, c_0_4.female);

  // 2. Cohort: 5-14 -> Spans 2 brackets: 5-9, 10-14 (10 years)
  let w_5_14 = [0.52, 0.48];
  if (dtmStage === 2) w_5_14 = [0.55, 0.45]; // highly youthful expansion decay
  if (dtmStage === 4) w_5_14 = [0.505, 0.495];
  if (dtmStage === 5) w_5_14 = [0.49, 0.51]; // sub-replacement bulb contraction

  addCohort("5-9", c_5_14.male * w_5_14[0], c_5_14.female * w_5_14[0]);
  addCohort("10-14", c_5_14.male * w_5_14[1], c_5_14.female * w_5_14[1]);

  // 3. Cohort: 15-64 -> Spans 10 brackets: 15-19, 20-24, 25-29, 30-34, 35-39, 40-44, 45-49, 50-54, 55-59, 60-64
  const ages_15_64 = ["15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64"];
  const weights_15_64: number[] = [];

  // Empirical demographic cohort distributions for 15-64 based on DTM Stages
  const STAGE_4_WEIGHTS = [0.88, 1.02, 1.05, 1.08, 1.02, 0.94, 0.91, 1.00, 1.09, 1.06]; // Columnar with late middle-age baby-boom bulge (e.g. Netherlands, France, Belgium)
  const STAGE_5_WEIGHTS = [0.68, 0.85, 0.98, 1.05, 1.12, 1.18, 1.22, 1.20, 1.12, 0.98]; // Contracting, top-heavy under low fertility (e.g. Singapore)

  for (let i = 0; i < 10; i++) {
    let w = 1.0;
    if (dtmStage === 2) {
      // Youthful rapid expansion: smooth continuous exponential decay
      w = Math.pow(0.86, i);
    } else if (dtmStage === 3) {
      // Transitional moderate expansion: moderate decay
      w = Math.pow(0.92, i);
    } else if (dtmStage === 4) {
      w = STAGE_4_WEIGHTS[i];
    } else if (dtmStage === 5) {
      w = STAGE_5_WEIGHTS[i];
    } else {
      // Fallback
      w = Math.pow(0.90, i);
    }
    weights_15_64.push(w);
  }

  const sumWeights_15_64 = weights_15_64.reduce((sum, val) => sum + val, 0) || 1;
  ages_15_64.forEach((age, index) => {
    const fraction = weights_15_64[index] / sumWeights_15_64;
    addCohort(age, c_15_64.male * fraction, c_15_64.female * fraction);
  });

  // 4. Cohort: 65-79 -> Spans 3 brackets: 65-69, 70-74, 75-79
  const ages_65_79 = ["65-69", "70-74", "75-79"];
  const weights_65_79: number[] = [];
  let decay_65_79 = 0.85;
  if (dtmStage === 2) decay_65_79 = 0.74;
  if (dtmStage === 3) decay_65_79 = 0.81;
  if (dtmStage === 4) decay_65_79 = 0.88;
  if (dtmStage === 5) decay_65_79 = 0.90; // High elderly life expectancy

  for (let j = 0; j < 3; j++) {
    weights_65_79.push(Math.pow(decay_65_79, j));
  }

  const sumWeights_65_79 = weights_65_79.reduce((sum, val) => sum + val, 0) || 1;
  ages_65_79.forEach((age, index) => {
    const fraction = weights_65_79[index] / sumWeights_65_79;
    addCohort(age, c_65_79.male * fraction, c_65_79.female * fraction);
  });

  // 5. Cohort: 80+ -> Spans 5 brackets: 80-84, 85-89, 90-94, 95-99, 100+
  const ages_80_plus = ["80-84", "85-89", "90-94", "95-99", "100+"];
  const weights_80_plus: number[] = [];
  let decay_80_plus = 0.45; // Sharp natural mortality attrition at extreme senior levels
  if (dtmStage === 2) decay_80_plus = 0.35;
  if (dtmStage === 3) decay_80_plus = 0.40;
  if (dtmStage === 4) decay_80_plus = 0.45;
  if (dtmStage === 5) decay_80_plus = 0.48; // High longevity in advanced stages

  for (let k = 0; k < 5; k++) {
    weights_80_plus.push(Math.pow(decay_80_plus, k));
  }

  const sumWeights_80_plus = weights_80_plus.reduce((sum, val) => sum + val, 0) || 1;
  ages_80_plus.forEach((age, index) => {
    const fraction = weights_80_plus[index] / sumWeights_80_plus;
    addCohort(age, c_80_plus.male * fraction, c_80_plus.female * fraction);
  });

  return result;
}
