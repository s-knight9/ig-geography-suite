import { countryStatsMap } from "../demographics_stats";
import { STATIC_RISK_PROFILES, getFallbackProfile } from "./riskData";

export const URBANIZATION_RATES: Record<string, number> = {
  australia: 86,
  bangladesh: 40,
  belgium: 98,
  brazil: 87,
  canada: 82,
  chad: 24,
  china: 66,
  cuba: 77,
  drc: 46,
  egypt: 43,
  ethiopia: 23,
  france: 82,
  germany: 78,
  iceland: 94,
  india: 36,
  indonesia: 58,
  iran: 76,
  ireland: 64,
  israel: 93,
  italy: 72,
  japan: 92,
  kenya: 29,
  malaysia: 78,
  mexico: 81,
  netherlands: 93,
  niger: 17,
  nigeria: 54,
  peru: 79,
  philippines: 48,
  poland: 60,
  russia: 75,
  rwanda: 18,
  "saudi-arabia": 85,
  singapore: 100,
  "south-africa": 68,
  "south-korea": 81,
  sudan: 36,
  switzerland: 74,
  thailand: 53,
  turkey: 77,
  tuvalu: 65,
  uae: 88,
  uk: 84,
  ukraine: 70,
  usa: 83,
  vietnam: 39,
  venezuela: 89,
};

export interface GameTheme {
  id: string;
  name: string;
  stats: Array<{ id: string; name: string; suffix: string; better: "higher" | "lower" }>;
}

export const THEME_DECKS: Record<string, GameTheme> = {
  Demographic: {
    id: "Demographic",
    name: "Demographic Duel",
    stats: [
      { id: "birthRate", name: "Birth Rate", suffix: " ‰", better: "higher" },
      { id: "lifeExpectancy", name: "Life Expectancy", suffix: " yrs", better: "higher" },
      { id: "urbanization", name: "Urbanization", suffix: "%", better: "higher" },
      { id: "dependencyRatio", name: "Dependency Ratio", suffix: "%", better: "lower" },
    ],
  },
  Economic: {
    id: "Economic",
    name: "Economic Encounter",
    stats: [
      { id: "gniPerCapita", name: "GNI per Capita", suffix: " USD", better: "higher" },
      { id: "tradeBalance", name: "Trade Balance", suffix: "% of GDP", better: "higher" },
      { id: "giniCoefficient", name: "Income Equality (Gini)", suffix: "", better: "lower" },
      { id: "tertiarySector", name: "Tertiary Sector", suffix: "%", better: "higher" },
    ],
  },
  Risk: {
    id: "Risk",
    name: "Risk Route",
    stats: [
      { id: "naturalDisasterVulnerability", name: "Natural Disaster Vulnerability", suffix: "/10", better: "lower" },
      { id: "climateRiskVulnerability", name: "Climate Risk Vulnerability", suffix: "/10", better: "lower" },
      { id: "institutionalResilience", name: "Institutional Resilience", suffix: "/10", better: "higher" },
    ],
  },
};

export async function getCountryStatsForTheme(
  countryId: string,
  themeId: string
): Promise<Record<string, number>> {
  // Load local JSON from /data/[country].json
  const response = await fetch(`/data/${countryId}.json?t=${Date.now()}`);
  const data = await response.json();

  const stats: Record<string, number> = {};

  if (themeId === "Demographic") {
    // 1. Birth Rate & Life Expectancy from countryStatsMap 2026
    const demo2026 = countryStatsMap[countryId]?.["2026"] || { birthRate: 15.0, lifeExpectancy: 72.0 };
    stats.birthRate = demo2026.birthRate;
    stats.lifeExpectancy = demo2026.lifeExpectancy;

    // 2. Urbanization %
    stats.urbanization = URBANIZATION_RATES[countryId] || 50;

    // 3. Dependency Ratio calculation from 2026 population node cohorts
    const activeNode = data.population_dynamics_time_series.find((n: any) => n.year === 2026) || data.population_dynamics_time_series[0];
    if (activeNode && activeNode.pyramid_structure && activeNode.pyramid_structure.cohorts) {
      let youngSum = 0;
      let activeSum = 0;
      let elderlySum = 0;

      activeNode.pyramid_structure.cohorts.forEach((c: any) => {
        const startAge = parseInt(c.age.split("-")[0]) || 0;
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
      stats.dependencyRatio = ((youngSum + elderlySum) / activeVal) * 100;
    } else {
      stats.dependencyRatio = 55.0; // fallback
    }
  } else if (themeId === "Economic") {
    // 1. GNI per Capita
    stats.gniPerCapita = data.country_metadata.gni_per_capita_atlas?.value_usd || 1000;

    // 2. Trade Balance (exports - imports % of GDP)
    const exportsSum = data.economy_tab?.trade_ledger?.main_exports?.reduce((sum: number, item: any) => sum + item.pct_gdp, 0) || 0;
    const importsSum = data.economy_tab?.trade_ledger?.main_imports?.reduce((sum: number, item: any) => sum + item.pct_gdp, 0) || 0;
    stats.tradeBalance = exportsSum - importsSum;

    // 3. Gini Coefficient
    stats.giniCoefficient = data.country_metadata.gini_coefficient?.score || 40.0;

    // 4. Tertiary Sector %
    stats.tertiarySector = data.economy_tab?.employment_structure?.tertiary || 45.0;
  } else if (themeId === "Risk") {
    // 1. Natural Disaster, Climate Risk, Institutional Resilience from riskData.ts
    const riskProfile = STATIC_RISK_PROFILES[countryId] || getFallbackProfile(data.country_metadata.name);
    stats.naturalDisasterVulnerability = riskProfile.seismicVulnerabilityIndex || 2.0;
    stats.climateRiskVulnerability = riskProfile.climateVulnerabilityIndex;
    stats.institutionalResilience = riskProfile.institutionalStrength;
  }

  // Round values cleanly to 2 decimal places
  for (const key in stats) {
    stats[key] = Math.round(stats[key] * 100) / 100;
  }

  return stats;
}
