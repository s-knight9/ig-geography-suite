export interface CountryMetadata {
  name: string;
  income_classification: string;
  gni_per_capita_atlas: { value_usd: number; year: number };
  gni_per_capita_ppp?: { value_usd: number; year: number };
  gini_coefficient?: { score: number; year: number };
  hdi: { score: number; rank: number; year: number };
}

export interface GlobalisationTab {
  kof_index: {
    economic: { de_facto: number; de_jure: number };
    social: {
      interpersonal: { de_facto: number; de_jure: number };
      informational: { de_facto: number; de_jure: number };
      cultural: { de_facto: number; de_jure: number };
    };
    political: { de_facto: number; de_jure: number };
  };
  at_kearney_framework: { status: string; gci_score_or_tier: string };
  ey_index_historical: { score: string | number; analysis: string };
}

export interface EconomyTab {
  employment_structure: {
    primary: number;
    secondary: number;
    tertiary: number;
    quaternary: number;
  };
  trade_ledger: {
    main_exports: Array<{ commodity: string; pct_gdp: number }>;
    main_imports: Array<{ commodity: string; pct_gdp: number }>;
    top_partners_outgoing: Array<{ partner: string; value_usd_billions: number }>;
    top_partners_incoming: Array<{ partner: string; value_usd_billions: number }>;
  };
}

export interface HumanGeographyTab {
  spatial_hubs: {
    epz_sez_zones: Array<{ name: string; location_lat_long: string; primary_focus: string }>;
    tourism_enclaves: Array<{ name: string; spatial_impact: string }>;
    core_periphery_zones: { core: string; periphery: string };
  };
  political_economy: {
    informal_economy_pct_gdp: number;
    eiu_governance_type: string;
    freedom_house_status: string;
    corruption_perceptions_index: { score: number; rank: number };
  };
}

export interface PrisonersOfGeographyMap {
  map_center?: { lat: number; lng: number; zoom: number };
  topographic_friction_points: Array<{ feature: string; geopolitical_constraint: string }>;
  hydrological_arteries: Array<{ feature: string; strategic_advantage: string }>;
  choke_points_vulnerabilities: Array<{ feature: string; impact: string }>;
  buffer_zones: Array<{ region: string; significance: string }>;
  tectonic_framework?: {
    plates: Array<{ name: string; position_x: number; position_y: number }>;
    boundaries: Array<{
      type: 'divergent' | 'convergent' | 'transform';
      path_points: Array<{ x: number, y: number }>;
    }>;
    hotspots: Array<{
      type: 'earthquake' | 'volcano';
      position_x: number;
      position_y: number;
      label: string;
    }>;
    ledger: {
      active_boundaries_and_interactions: string;
      relative_plate_motion: string;
      synoptic_case_study: string;
    };
  };
  fluvial_data?: {
    rivers: Array<{
      name: string;
      type: 'Primary' | 'Tributary' | string;
      length_km: number;
      transboundary: boolean;
      flow_direction?: string;
      description?: string;
      pathStr?: string;
      basinArea?: string;
    }>;
    basins?: Array<{
      name: string;
      area_km2: string;
      description: string;
    }>;
    estuary?: {
      name: string;
      description: string;
    };
  };
  climate_data?: {
    dominant_pressure_belt: string;
    prevailing_winds: string;
    monsoon_active: boolean;
    cryosphere_melt_risk: 'None' | 'Moderate' | 'Severe' | string;
    desertification_vulnerability: 'Low' | 'Medium' | 'High' | string;
    enso_impact_profile: string;
    pressure_belt_type?: 'low' | 'high' | 'mid' | string;
    wind_flow_angle?: number;
    cells_description?: string;
    monsoon_desc?: string;
    enso_desc?: string;
    cryo_desc?: string;
    arid_desc?: string;
  };
}

export interface PopulationTimeNode {
  year: number;
  pyramid_structure: {
    cohorts: Array<{ age: string; male_pct: number; female_pct: number }>;
  };
  sub_national_density_choropleth: Array<{ admin_1_region_name: string; density_per_km2: number }>;
  synoptic_analysis: string;
}

export interface DPPlaceProfile {
  country_metadata: CountryMetadata;
  globalisation_tab: GlobalisationTab;
  economy_tab: EconomyTab;
  human_geography_tab: HumanGeographyTab;
  prisoners_of_geography_map: PrisonersOfGeographyMap;
  population_dynamics_time_series: PopulationTimeNode[];
  culture_tab?: {
    inglehart_welzel_coords: { x: number; y: number; cultural_zone: string };
    largest_diasporas: Array<{ destination: string; population: string; cultural_reach_impact: string }>;
    cultural_exports_and_landscape: {
      soft_power_exports: Array<{ medium: string; examples: string[]; global_reach_score: number }>;
      spatial_landscape: { enclaves: string[]; architectural_footprint: string; description: string };
    };
    hybridity_and_glocalization: Array<{ concept: string; description: string; glocalized_examples: string[]; spatial_location: string }>;
  };
}
