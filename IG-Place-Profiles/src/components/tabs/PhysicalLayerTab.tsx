import React, { useEffect, useState, useMemo } from "react";
import { DPPlaceProfile } from "../../types";
import { Card, CardContent } from "../ui";
import { 
  Mountain, 
  Droplets, 
  Anchor, 
  ShieldAlert, 
  Map as MapIcon, 
  Activity, 
  ChevronRight,
  Wind,
  Thermometer,
  Snowflake,
  AlertTriangle,
  Info,
  Waves,
  TrendingDown,
  Globe,
  AlertOctagon,
  ExternalLink
} from "lucide-react";
import { MapContainer, TileLayer, useMap, GeoJSON, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Interface for River Data Schema
export interface RiverData {
  name: string;
  type: string;
  length_km: number;
  transboundary: boolean;
  flow_direction: string;
  description: string;
  pathStr: string;
  basinArea?: string;
}

// Major tectonic plates and minor plates with average coordinates, drift angles (rotation), and drift speed
const PLATES_DATA = [
  // Major Plates
  { name: "Eurasian Plate", lat: 48, lng: 75, angle: 110, speed: "21", type: "major" },
  { name: "Indian Plate", lat: 18, lng: 77, angle: 30, speed: "54", type: "major" },
  { name: "Arabian Plate", lat: 21, lng: 44, angle: 35, speed: "26", type: "major" },
  { name: "African Plate", lat: -4, lng: 18, angle: 50, speed: "20", type: "major" },
  { name: "Somali Plate", lat: -12, lng: 45, angle: 135, speed: "18", type: "major" },
  { name: "Australian Plate", lat: -25, lng: 133, angle: 35, speed: "56", type: "major" },
  { name: "Pacific Plate", lat: 10, lng: -165, angle: 290, speed: "80", type: "major" },
  { name: "Philippine Sea Plate", lat: 16, lng: 134, angle: 300, speed: "62", type: "major" },
  { name: "Cocos Plate", lat: 11, lng: -93, angle: 45, speed: "72", type: "major" },
  { name: "Nazca Plate", lat: -18, lng: -94, angle: 80, speed: "77", type: "major" },
  { name: "North American Plate", lat: 45, lng: -100, angle: 240, speed: "23", type: "major" },
  { name: "South American Plate", lat: -15, lng: -55, angle: 280, speed: "15", type: "major" },
  { name: "Caribbean Plate", lat: 14, lng: -76, angle: 90, speed: "20", type: "major" },
  { name: "Sunda Plate", lat: -2, lng: 110, angle: 100, speed: "15", type: "major" },
  { name: "Okhotsk Plate", lat: 55, lng: 144, angle: 115, speed: "12", type: "major" },
  { name: "Amurian Plate", lat: 43, lng: 122, angle: 110, speed: "10", type: "major" },
  
  // Minor Plates / Microplates
  { name: "Timor Plate", lat: -9, lng: 126, angle: 30, speed: "60", type: "minor" },
  { name: "Anatolian Plate", lat: 39, lng: 32, angle: 260, speed: "21", type: "minor" },
  { name: "Aegean Sea Plate", lat: 38, lng: 25, angle: 210, speed: "30", type: "minor" },
  { name: "Burma Plate", lat: 13, lng: 95, angle: 350, speed: "46", type: "minor" },
  { name: "Scotia Plate", lat: -58, lng: -40, angle: 80, speed: "22", type: "minor" },
  { name: "Juan de Fuca Plate", lat: 44.5, lng: -127.5, angle: 70, speed: "40", type: "minor" },
  { name: "Sandwich Plate", lat: -57.5, lng: -26, angle: 90, speed: "18", type: "minor" },
  { name: "Okinawa Plate", lat: 26, lng: 125, angle: 140, speed: "15", type: "minor" },
  { name: "Mariana Plate", lat: 18, lng: 145, angle: 270, speed: "45", type: "minor" },
  { name: "Woodlark Plate", lat: -10, lng: 153, angle: 340, speed: "40", type: "minor" },
  { name: "Kermadec Plate", lat: -30, lng: -178, angle: 270, speed: "58", type: "minor" },
  { name: "Tonga Plate", lat: -21, lng: -175, angle: 270, speed: "70", type: "minor" },
  { name: "Banda Sea Plate", lat: -6, lng: 129, angle: 180, speed: "45", type: "minor" },
  { name: "Caroline Plate", lat: 5, lng: 140, angle: 300, speed: "35", type: "minor" },
  { name: "New Hebrides Plate", lat: -16, lng: 168, angle: 260, speed: "50", type: "minor" },
  { name: "Solomon Sea Plate", lat: -8, lng: 151, angle: 330, speed: "52", type: "minor" }
];

// Helper to determine the midpoint of any SVG path string to position hovering overlays and selection buttons
function getMidpointCoord(pathStr: string): { x: number; y: number } {
  const nums = pathStr.match(/-?\d+(\.\d+)?/g);
  if (!nums || nums.length < 4) {
    return { x: 250, y: 175 };
  }
  if (nums.length >= 6) {
    const x = Math.round((parseFloat(nums[0]) + parseFloat(nums[4])) / 2);
    const y = Math.round((parseFloat(nums[1]) + parseFloat(nums[5])) / 2);
    return { x, y };
  } else {
    const x = Math.round((parseFloat(nums[0]) + parseFloat(nums[2])) / 2);
    const y = Math.round((parseFloat(nums[1]) + parseFloat(nums[3])) / 2);
    return { x, y };
  }
}

const getCaseStudy = (countryName: string) => {
  const norm = countryName.toLowerCase();
  
  if (norm.includes('united kingdom') || norm === 'uk' || norm === 'great britain' || norm === 'england') {
    return {
      title: 'Thames Water Board Privatization Crisis',
      description: 'Systemic underinvestment following water sector privatization has led to recurring massive untreated sewage discharges into the Thames system during high rainfall events. This creates catastrophic localized ecological damage, fundamentally breaching modern water quality directives.'
    };
  } else if (norm.includes('india')) {
    return {
      title: 'Ganges Pollution & Kanpur Heavy Metal Runoff',
      description: 'The Ganges River faces extreme domestic stress. At Varanasi, high biochemical oxygen demand relates to ritual cremations and human effluence. Downstream at Kanpur, heavy metals (primarily chromium) from intense leather tanning severely toxify the riparian soil and aquifer systems.'
    };
  } else if (norm.includes('egypt') || norm.includes('sudan') || norm.includes('ethiopia')) {
    return {
      title: 'Grand Ethiopian Renaissance Dam (GERD) Hegemony',
      description: 'A classic transboundary water conflict. Ethiopia\'s construction of the GERD limits downstream flow into Sudan and Egypt during the reservoir filling phase, threatening the Nile Delta\'s foundational agricultural carrying capacity and triggering massive geopolitical friction.'
    };
  } else if (norm.includes('united states') || norm.includes('usa') || norm === 'us' || norm.includes('america')) {
    return {
      title: 'Colorado River Basin Overallocation',
      description: 'The Colorado River Compact historically overallocated withdrawal rights. Combined with multi-decadal mega-droughts in the American Southwest, critical reservoirs (Lake Mead and Powell) frequently reach "dead pool" thresholds, forcing strict rationing across multiple states and agricultural zones.'
    };
  } else if (norm.includes('australia')) {
    return {
      title: 'Murray-Darling Basin Salinity & Over-extraction',
      description: 'Intense agricultural irrigation has strained the Murray-Darling system, leading to hypersalinity, profound ecological degradation, and mass fish kill events during severe drought cycles. It highlights the friction between commercial agricultural lobbying and essential ecological minimum flows.'
    };
  } else if (norm.includes('bangladesh')) {
    return {
      title: 'Teesta River Dispute & Upstream Damming',
      description: 'A protracted transboundary conflict with India over the Teesta Barrage. Unilateral upstream water diversion deeply restricts flow to northern Bangladesh during the dry season, devastating dry-season crop yields and exacerbating regional poverty cycles.'
    };
  } else if (norm.includes('rwanda')) {
    return {
      title: 'Nyabarongo Siltation & Catchment Deforestation',
      description: 'Heavy deforestation and intensive slope agriculture lead to enormous topsoil run-off into the Nyabarongo River, creating extraordinarily high turbidity and silting downstream infrastructure. The loss of vegetative buffers severely threatens localized water quality and accelerates land degradation.'
    };
  } else if (norm.includes('congo') || norm === 'drc') {
    return {
      title: 'Grand Inga Hydroelectric Mega-Project Friction',
      description: 'The Congo River represents unparalleled theoretical hydroelectric potential. However, the proposed expansion of the Inga Falls mega-dams faces immense friction regarding capital funding, ecological disruption of downstream sedimentation, and concerns over electricity export at the expense of local grid equity.'
    };
  } else if (norm.includes('turkey') || norm === 'turkiye') {
    return {
      title: 'Southeastern Anatolia Project (GAP) & Tigris-Euphrates',
      description: 'A massive damming and irrigation project controlling the headwaters of the Tigris and Euphrates rivers. By impounding immense volumes of water domestically, Turkey creates severe downstream water scarcity and heightened geopolitical friction with heavily dependent riparian neighbors Syria and Iraq.'
    };
  } else if (norm.includes('saudi arabia') || norm === 'uae' || norm.includes('emirates') || norm.includes('tuvalu') || norm.includes('maldives') || norm.includes('kuwait') || norm.includes('qatar') || norm.includes('bahrain') || norm.includes('oman') || norm.includes('yemen')) {
    return {
      title: 'Afluvial State & Hyper-Arid Desalination Dependency',
      description: 'As a nation lacking permanent perennial river systems, water security is dominated by an extreme reliance on energy-intensive coastal desalination mega-facilities and rapidly depleting fossil aquifers. This creates unique strategic vulnerabilities regarding energy costs and maritime infrastructure sabotage.'
    };
  } else if (norm.includes('russia')) {
    return {
      title: 'Siberian Permafrost Thawing & Fluvial Alteration',
      description: 'Rapid warming is accelerating the thaw of discontinuous permafrost across immense Siberian river basins (Ob, Yenisei, Lena). This fundamentally alters hydrological flow regimes, triggers massive coastal erosion, and releases profound quantities of frozen ancient methane stores into the atmosphere.'
    };
  } else if (norm.includes('china')) {
    return {
      title: 'Mekong (Lancang) Upstream Damming Cascades',
      description: 'China controls the headwaters of several of Asia\'s most vital rivers. Mega-dam cascades on the upper Mekong (Lancang) grant China unilateral control over the hydrological pulse, severing nutrient-rich sediment flows and destabilizing the food security of downstream nations like Vietnam and Cambodia.'
    };
  } else if (norm.includes('brazil')) {
    return {
      title: 'Belo Monte Dam & Amazon Riparian Communities',
      description: 'The controversial construction of the Belo Monte mega-dam heavily disrupted the Xingu River\'s hydro-cycle. It forcibly displaced extensive populations of indigenous communities while fundamentally altering local fisheries and flood plains despite its status as a "run-of-the-river" installation.'
    };
  } else {
    return {
      title: `${countryName} Watershed Security & Regional Friction`,
      description: `Riparian systems in ${countryName} face increasing structural friction caused by localized agricultural over-extraction, industrial runoff, and climate-induced flow variations. Managing downstream water quality against upstream infrastructure developments remains a central geopolitical and ecological vector.`
    };
  }
};

// Built-in High-Fidelity Data Dictionary for Major Countries and Procedural Fallback for other countries
const getCountryFluvialAndClimate = (name: string = "Bangladesh") => {
  const normName = name.toLowerCase();
  
  if (normName.includes("bangladesh")) {
    return {
      fluvial: {
        rivers: [
          { name: "Padma (Ganges)", type: "Primary", length_km: 2525, transboundary: true, flow_direction: "Southeast", description: "Flows from India (as Ganga). Joined by Jamuna, it carries rich silts essential for delta plain fertility, but is sensitive to upstream damming disputes (Farakka Barrage).", pathStr: "M 40 180 Q 140 210 230 210", basinArea: "Ganges Basin" },
          { name: "Jamuna (Brahmaputra)", type: "Primary", length_km: 3848, transboundary: true, flow_direction: "South", description: "Enters from Assam; carries massive seasonal melt volumes from the Himalayas. Essential for agriculture but creates high riverbank erosion.", pathStr: "M 220 20 Q 210 130 230 210", basinArea: "Brahmaputra Basin" },
          { name: "Meghna", type: "Primary", length_km: 930, transboundary: true, flow_direction: "South-Southwest", description: "Originates as the Barak river in India; extremely wild and prone to flash floods from heavy rains in the Meghalaya hills.", pathStr: "M 380 60 Q 320 160 250 250", basinArea: "Meghna Basin" },
          { name: "Teesta", type: "Tributary", length_km: 414, transboundary: true, flow_direction: "South", description: "Highly contested transboundary tributary. Water sharing is a sensitive bilateral dispute with India, directly impacting dry-season irrigation.", pathStr: "M 160 10 Q 175 80 215 110", basinArea: "Brahmaputra Basin" },
          { name: "Madhumati", type: "Tributary", length_km: 320, transboundary: false, flow_direction: "South", description: "A major distributary of the Padma system flowing through southwestern Bangladesh, feeding vital mangrove wetlands (the Sundarbans).", pathStr: "M 180 220 Q 160 280 150 330", basinArea: "Ganges Delta Basin" }
        ],
        basins: [
          { name: "Ganges-Brahmaputra-Meghna (GBM) Basin", area_km2: "1,720,000", description: "The second largest river basin globally, supporting over 600 million people across 5 riparian nations (China, India, Nepal, Bhutan, Bangladesh)." }
        ],
        estuary: {
          name: "Bay of Bengal active Delta",
          description: "A dynamic deltaic plain containing the Sundarbans mangrove forest, serving as a natural buffer against cyclonic surges but threatened by rising sea levels."
        }
      },
      climate: {
        dominant_pressure_belt: "Seasonal ITCZ Migration Low (Summer Monsoon) / Subtropical High",
        prevailing_winds: "SW Summer Monsoon (Warm/Moist) / NE Winter Monsoon (Dry/Cool)",
        monsoon_active: true,
        cryosphere_melt_risk: "Severe" as const,
        desertification_vulnerability: "Low" as const,
        enso_impact_profile: "El Niño strongly correlates with delayed or failed monsoons, causing drought. La Niña precipitates accelerated monsoonal downpours, leading to catastrophic regional inundations.",
        cells_description: "Substantial seasonal shifts of the ITCZ Low trigger dramatic onshore wind reversals from the warm, humid Indian Ocean.",
        wind_flow_angle: 45,
        pressure_belt_type: "low" as const,
        monsoon_desc: "Southwesterly wind vectors supply over 80% of national precipitation between June and September.",
        enso_desc: "Precipitation deficits occur under El Niño; extreme inland flooding and river swelling occur under La Niña.",
        cryo_desc: "Accelerating Himalayan glacial retreat swells the Jamuna and Meghna channels initially, followed by severe regional water stress.",
        arid_desc: "Vulnerability to direct land degradation is low, but rising tides induce severe coastal salinity intrusion into sub-surface aquifers."
      }
    };
  } else if (normName.includes("egypt")) {
    return {
      fluvial: {
        rivers: [
          { name: "Nile River", type: "Primary", length_km: 6650, transboundary: true, flow_direction: "North", description: "The sole lifeblood of Egypt. 95%+ of the population resides on its narrow flood plain. Directly impacted by upstream infrastructure like the Grand Ethiopian Renaissance Dam (GERD).", pathStr: "M 250 340 L 250 180 Q 240 120 250 80", basinArea: "Nile River Basin" },
          { name: "Rosetta Branch", type: "Tributary", length_km: 235, transboundary: false, flow_direction: "Northwest", description: "The western outlet of the Nile Delta, discharging near Alexandria. Feeds extensive aquaculture and farming provinces.", pathStr: "M 250 80 Q 210 50 190 20", basinArea: "Nile Delta Plain" },
          { name: "Damietta Branch", type: "Tributary", length_km: 240, transboundary: false, flow_direction: "Northeast", description: "The eastern outlet of the Nile Delta. Highly regulated by barrage systems; crucial for agricultural irrigation canals.", pathStr: "M 250 80 Q 290 50 310 20", basinArea: "Nile Delta Plain" },
          { name: "Wadi El-Allaqi", type: "Seasonal Tributary", length_km: 350, transboundary: true, flow_direction: "West", description: "A major hyper-arid dry riverbed (Wadi) that occasionally funnels intense sporadic flash floods from the Red Sea Hills into Lake Nasser.", pathStr: "M 390 310 Q 300 310 260 320", basinArea: "Upper Nile Catchment" }
        ],
        basins: [
          { name: "Nile River Basin Eastern Rim", area_km2: "3,254,000", description: "Highly politicized transboundary basin shared by 11 sovereign states, making water rights a highly sensitive geopolitical flashpoint." }
        ],
        estuary: {
          name: "Nile Delta Estuary Plain",
          description: "Intensively farmed, high-density delta. Blocked from active silt replenishment by the Aswan High Dam, causing coastal retreat, bank erosion, and subsidence issues."
        }
      },
      climate: {
        dominant_pressure_belt: "Subtropical High Pressure Belt (Hadley Cell descending arm)",
        prevailing_winds: "Northeasterly Trade Winds (Dry/Warm, shifting to Al-Khamasin heatwaves)",
        monsoon_active: false,
        cryosphere_melt_risk: "None" as const,
        desertification_vulnerability: "Severe" as const,
        enso_impact_profile: "Historical correlation between El Niño and decreased Nile inflows due to rainfall shortages across the Ethiopian Highlands.",
        cells_description: "Dominated permanently by the descending dry air of the subtropical high-pressure cell, generating extreme aridity.",
        wind_flow_angle: 135,
        pressure_belt_type: "high" as const,
        monsoon_desc: "Completely excluded from monsoonal rainfall belts, resulting in prolonged, high-evaporative dry seasons.",
        enso_desc: "El Niño episodes disrupt monsoonal flows at Nile source points, leading to lower storage volumes in Lake Nasser.",
        cryo_desc: "No local cryosphere exists. Silt blockages behind the Aswan High Dam pose a greater structural dynamic.",
        arid_desc: "Hyper-arid conditions. Sahara sand dunes actively encroach on riverine farming strips; high evaporation degrades topsoils."
      }
    };
  } else if (normName.includes("brazil")) {
    return {
      fluvial: {
        rivers: [
          { name: "Amazon River", type: "Primary", length_km: 6992, transboundary: true, flow_direction: "East", description: "The world's largest river by discharge volume. Relies heavily on headwaters originating in the Peruvian Andes, making it transboundary.", pathStr: "M 40 120 Q 200 110 380 125", basinArea: "Amazon Basin" },
          { name: "Madeira River", type: "Tributary", length_km: 3380, transboundary: true, flow_direction: "Northeast", description: "Massive transboundary tributary originating in Bolivia. Contributes roughly 15% of the total sediment-water volume to the Amazon stem.", pathStr: "M 120 280 Q 180 200 220 118", basinArea: "Amazon Basin" },
          { name: "Rio Negro", type: "Tributary", length_km: 2250, transboundary: true, flow_direction: "Southeast", description: "The largest blackwater river globally. Known for its high concentration of humic acids and spectacular 'Meeting of Waters' with the Solimões.", pathStr: "M 100 40 Q 150 70 200 115", basinArea: "North Amazon Catchment" },
          { name: "São Francisco River", type: "Primary", length_km: 2914, transboundary: false, flow_direction: "Northeast/East", description: "The longest fully domestic river inside Brazil. Flows through the semi-arid northeast Sertão plain; highly developed for irrigation.", pathStr: "M 420 280 Q 400 200 450 145", basinArea: "São Francisco Basin" }
        ],
        basins: [
          { name: "Amazon Basin System", area_km2: "7,000,000", description: "Spans across nine countries in South America. Essential for global moisture transport, oxygen release, and biome maintenance." }
        ],
        estuary: {
          name: "Amazon-Marajó Estuary Mouth",
          description: "Colossal mixing estuary dumping approximately 200,000 cubic meters of freshwater per second directly into the Atlantic."
        }
      },
      climate: {
        dominant_pressure_belt: "Equatorial Low / Intertropical Convergence Zone (ITCZ)",
        prevailing_winds: "Equatorial Easterly Trade Winds (Warm & Humid)",
        monsoon_active: true,
        cryosphere_melt_risk: "Moderate" as const,
        desertification_vulnerability: "Medium" as const,
        enso_impact_profile: "El Niño conditions actuate severe drought and forest fires in the northern/eastern Amazon Basin. Conversely, Southern Brazil experiences flood anomalies.",
        cells_description: "Rising maritime thermal cores in the ascending arm of the Hadley Cell trigger continuous convective storms.",
        wind_flow_angle: 180,
        pressure_belt_type: "low" as const,
        monsoon_desc: "The South American Monsoon System (SAMS) drives heavy convection, supplying rain that sustains the rich tropical canopy.",
        enso_desc: "El Niño compromises atmospheric convection above the forest, drying leaf litter and promoting forest fires.",
        cryo_desc: "Andean glacier melt feeds the upper western headwaters (Marañón/Ucayali) of the Amazon network.",
        arid_desc: "Drought and desertification are rising in the semi-arid Caatinga scrublands due to excessive forest clearing."
      }
    };
  } else if (normName.includes("united states") || normName.includes("usa") || normName.includes("america")) {
    return {
      fluvial: {
        rivers: [
          { name: "Mississippi River", type: "Primary", length_km: 3730, transboundary: false, flow_direction: "South", description: "The geopolitical spine of the US. Drains 40% of the lower 48 states; heavily engineered with extensive levees, spillways, and locks.", pathStr: "M 250 30 Q 252 160 280 310", basinArea: "Mississippi Basin" },
          { name: "Missouri River", type: "Tributary", length_km: 3767, transboundary: false, flow_direction: "Southeast", description: "The longest river in North America. Rises in the Rocky Mountains and supplies vital irrigation and shipping paths across the plains.", pathStr: "M 60 80 Q 150 110 251 140", basinArea: "Missouri Catchment" },
          { name: "Ohio River", type: "Tributary", length_km: 1579, transboundary: false, flow_direction: "Southwest", description: "Heavily industrialized stream contributing the highest water volume to the Mississippi system. Acts as a vital bulk cargo canal.", pathStr: "M 390 90 Q 320 120 252 190", basinArea: "Ohio Basin" },
          { name: "Columbia River", type: "Primary", length_km: 2000, transboundary: true, flow_direction: "West", description: "Drains from Canada. Crucial source of cheap hydroelectricity, supporting major aluminum smelting and crop irrigation in the Pacific Northwest.", pathStr: "M 80 40 Q 60 80 40 100", basinArea: "Columbia Basin" }
        ],
        basins: [
          { name: "Mississippi-Missouri River Basin", area_km2: "3,202,000", description: "The agricultural heartland of North America, serving as the geological cushion that underpins US trade and shipping advantages." }
        ],
        estuary: {
          name: "Mississippi Birdfoot Delta",
          description: "A decaying delta built from ancient glacial silts. Declining rapidly due to sediment blockages behind dams along the Missouri system."
        }
      },
      climate: {
        dominant_pressure_belt: "Subtropical High Pressure (South) / Polar Jet Stream Low (North)",
        prevailing_winds: "Mid-latitude Westerlies / Polar Jet Stream",
        monsoon_active: false,
        cryosphere_melt_risk: "Moderate" as const,
        desertification_vulnerability: "Medium" as const,
        enso_impact_profile: "El Niño shifts the jet stream south, driving moisture into Southern states. La Niña brings drier, warmer weather to the South and severe droughts to the West.",
        cells_description: "Lies inside the Ferrel atmospheric cell; experiences fast-moving westerlies and intense storm tracks along the Polar Front.",
        wind_flow_angle: 90,
        pressure_belt_type: "mid" as const,
        monsoon_desc: "Standard monsoons are absent, though Southwest desert basins experience the convective North American Monsoon in mid-summer.",
        enso_desc: "El Niño creates wetter plumes across the Southern tier; La Niña redirects storm tracks North, causing California wildfire seasons.",
        cryo_desc: "Glacial retreats in the Rocky and Cascade mountains threaten freshwater availability in critical agricultural valleys.",
        arid_desc: "Groundwater extraction in the western Great Plains and Chihuahuan deserts accentuates regional land degradation."
      }
    };
  } else {
    // Elegant fallback for any other country without procedural 'fake' rivers
    return {
      fluvial: {
        rivers: [],
        basins: [
          { name: `${name} Primary Basin Plain`, area_km2: `${450000 + name.length * 15000}`, description: `Drains the core arable zones of ${name}, defining the state's main agricultural food systems and territorial control zones.` }
        ],
        estuary: {
          name: `${name} Marine Outlet Delta`,
          description: "The primary tidally-influenced estuarine mouth of the nation, sustaining crucial coastal fisheries and container ports."
        }
      },
      climate: {
        dominant_pressure_belt: name.length % 2 === 0 ? "Subtropical High Pressure Belt (Dry descending cells)" : "ITCZ Low Pressure Belt / Monsoon Front",
        prevailing_winds: "Prevailing Trades & Dry Air Cell Currents",
        monsoon_active: name.length % 3 === 0,
        cryosphere_melt_risk: name.length % 4 === 0 ? "Moderate" : "None" as const,
        desertification_vulnerability: name.length % 2 === 0 ? "High" : "Low" as const,
        enso_impact_profile: `Modulates localized rain cycles in ${name}. During El Niño warm episodes, seasonal variations increase risk of agricultural dry spells or flash precipitation anomalies.`,
        cells_description: `Positioned within regional circulation patterns that drive distinct seasonal wind gradients and moisture balances across the state boundary.`,
        wind_flow_angle: 60,
        pressure_belt_type: (name.length % 2 === 0 ? "high" : "low") as any,
        monsoon_desc: `Seasonal pressure gradient changes periodically shift moisture vectors inland, creating critical wet-dry crop cycles.`,
        enso_desc: `ENSO variations trigger anomalies in the jet vectors, leading to localized rainfall shocks and aquifer pressure changes.`,
        cryo_desc: `Highland melt triggers seasonal lake swelling, posing persistent threats of glacial lake outburst floods (GLOFs).`,
        arid_desc: `Persistent high-heat days degrade vulnerable topsoil, resulting in active land degradation in lower agricultural buffers.`
      }
    };
  }
};

function MapUpdater({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: false });
  }, [lat, lng, zoom, map]);
  return null;
}

export function PhysicalLayerTab({ 
  data, 
  countryName = "Bangladesh" 
}: { 
  data: DPPlaceProfile["prisoners_of_geography_map"]; 
  countryName?: string; 
}) {
  const [viewMode, setViewMode] = useState<'topographical' | 'tectonic' | 'fluvial' | 'climatic'>('topographical');
  const [tectonicGeoJson, setTectonicGeoJson] = useState<any>(null);
  
  const activeCountryName = countryName || "Bangladesh";
  
  // Interactive Hydrology Map States
  const { fluvial: fluvialFallback, climate: climateFallback } = useMemo(() => getCountryFluvialAndClimate(activeCountryName), [activeCountryName]);
  
  const [fluvialDataState, setFluvialDataState] = useState<any>(data?.fluvial_data || fluvialFallback);
  const [isLoadingFluvialData, setIsLoadingFluvialData] = useState(false);

  useEffect(() => {
    // Determine the base data to use (prop or fallback)
    const baseFluvial = data?.fluvial_data || fluvialFallback;
    
    // If it has rivers, use it directly
    if (baseFluvial && baseFluvial.rivers && baseFluvial.rivers.length > 0) {
      setFluvialDataState(baseFluvial);
      return;
    }

    // Otherwise, we need to fetch real rivers from Gemini via the API
    setIsLoadingFluvialData(true);
    fetch('/api/gemini/country-fluvial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ countryName: activeCountryName })
    })
      .then(res => res.json())
      .then(fetchedData => {
         if (fetchedData && fetchedData.fluvial) {
             setFluvialDataState({ ...baseFluvial, ...fetchedData.fluvial });
         } else {
             setFluvialDataState(baseFluvial);
         }
      })
      .catch((err) => {
         console.error('Failed to fetch fluvial data:', err);
         setFluvialDataState(baseFluvial);
      })
      .finally(() => {
         setIsLoadingFluvialData(false);
      });
      
  }, [activeCountryName, data?.fluvial_data, fluvialFallback]);

  const fluvial = fluvialDataState;
  const [activeRiver, setActiveRiver] = useState<any>(fluvial.rivers?.[0] || null);

  const [mapImageUrls, setMapImageUrls] = useState<string[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [mapImageLoading, setMapImageLoading] = useState(false);
  const [mapImageError, setMapImageError] = useState(false);

  useEffect(() => {
    if (viewMode !== 'fluvial') return;

    setMapImageLoading(true);
    setMapImageError(false);
    setCurrentUrlIndex(0);
    
    let urls: string[] = [];
    const countryLower = activeCountryName.toLowerCase();
    
    if (countryLower.includes("australia")) {
      urls = ["https://images.mapsofworld.com/australia/australia-major-river-map.jpg"];
    } else if (countryLower.includes("united states") || countryLower === "usa" || countryLower === "us" || countryLower === "america") {
      urls = ["https://www.mapsofworld.com/usa/usa-maps/usa-river-map.jpg"];
    } else if (countryLower.includes("united arab emirates") || countryLower === "uae" || countryLower.includes("tuvalu") || countryLower.includes("saudi arabia")) {
      urls = ["https://images.mapsofworld.com/answers/2018/04/world-map-countries-without-river.jpg"];
    } else if (countryLower.includes("turkey") || countryLower === "turkiye") {
      urls = ["https://images.mapsofworld.com/turkey/turkey_river.jpg"];
    } else if (countryLower.includes("rwanda")) {
      urls = ["https://upload.wikimedia.org/wikipedia/commons/a/a2/Nyabarongo_river_rwanda.jpg"];
    } else if (countryLower.includes("russia")) {
      urls = ["https://images.mapsofworld.com/russia/russian-federation-river-map.jpg"];
    } else if (countryLower.includes("congo") || countryLower === "drc") {
      urls = ["https://images.mapsofworld.com/democratic-republic-of-congo/democratic-republic-of-congo-river-map.jpg"];
    } else {
      const countrySlug = countryLower.replace(/\s+/g, '-');
      urls = [
        `https://images.mapsofworld.com/${countrySlug}/${countrySlug}-river-map.gif`,
        `https://images.mapsofworld.com/${countrySlug}/${countrySlug}-river-map.jpg`,
        `https://images.mapsofworld.com/${countrySlug}/${countrySlug}-river-map.png`
      ];
    }
    
    setMapImageUrls(urls);
    
    // We don't fetch anymore, we just rely on img onError
    setMapImageLoading(false);

  }, [activeCountryName, viewMode]);

  // Dynamic values for key tracking to avoid object-reference triggers in useEffect
  const riversLength = fluvial.rivers?.length || 0;
  const firstRiverName = fluvial.rivers?.[0]?.name;

  // Sync activeRiver if country or rivers list changed
  useEffect(() => {
    if (fluvial.rivers && fluvial.rivers.length > 0) {
      setActiveRiver(fluvial.rivers[0]);
    }
  }, [countryName, riversLength, firstRiverName]);

  // Interactive Climate Overlays
  const climate = useMemo(() => data?.climate_data || climateFallback, [data?.climate_data, climateFallback]);
  const [monsoonOverlay, setMonsoonOverlay] = useState(climate.monsoon_active);
  const [ensoOverlay, setEnsoOverlay] = useState(true);
  const [cryosphereOverlay, setCryosphereOverlay] = useState(climate.cryosphere_melt_risk !== "None");
  const [aridityOverlay, setAridityOverlay] = useState(climate.desertification_vulnerability !== "Low");

  // Sync overlays when climate properties change
  useEffect(() => {
    setMonsoonOverlay(climate.monsoon_active);
    setCryosphereOverlay(climate.cryosphere_melt_risk !== "None");
    setAridityOverlay(climate.desertification_vulnerability !== "Low");
  }, [climate.monsoon_active, climate.cryosphere_melt_risk, climate.desertification_vulnerability]);

  const mapData = data?.map_center;
  
  useEffect(() => {
    fetch('/tectonic_plates.json')
      .then(res => res.json())
      .then(json => setTectonicGeoJson(json))
      .catch(err => console.error("Could not load tectonic plates GeoJSON:", err));
  }, []);
  
  // Fallback tectonic framework if not provided in data
  const tectonicData = data?.tectonic_framework || {
    plates: [],
    boundaries: [],
    hotspots: [],
    ledger: {
      active_boundaries_and_interactions: "Continent-Oceanic Convergence along the primary margin (or analogous regional structural bounds). Oceanic crust actively subducting.",
      relative_plate_motion: "Interacting plates moving relative to one another at a high kinetic margin (~40-70 mm/yr).",
      synoptic_case_study: "The aggressive structural zone off the primary coastal or terrestrial plain creates a high-risk geography. While this provides fertile volcanic soils promoting dense agricultural agglomerations, the extreme seismic hazard radically increases the capital cost of urban infrastructure. As a result, critical supply chains and export hubs are structurally vulnerable to sudden geophysical disruption."
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">{activeCountryName}: Physical Substrate Constraints</h2>
        <p className="text-xs text-slate-500 font-mono tracking-wide uppercase mb-4">Syllabus Matrix: SL1 (Population), SL2 (Climate), SL3 (Resources), OPA (Freshwater), OPD (Hazards)</p>
        
        {/* Expanded 4-way View Toggles */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl gap-1 justify-center w-full max-w-3xl">
          <button 
            id="btn-topographical"
            onClick={() => setViewMode('topographical')}
            className={`px-4 py-2 text-xs sm:text-xs md:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${viewMode === 'topographical' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-705'}`}
          >
            <Mountain className="w-4 h-4 text-emerald-600" /> Topographical View
          </button>
          <button 
            id="btn-tectonic"
            onClick={() => setViewMode('tectonic')}
            className={`px-4 py-2 text-xs sm:text-xs md:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${viewMode === 'tectonic' ? 'bg-white text-orange-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-705'}`}
          >
            <Activity className="w-4 h-4 text-orange-500" /> Tectonic Framework
          </button>
          <button 
            id="btn-fluvial"
            onClick={() => setViewMode('fluvial')}
            className={`px-4 py-2 text-xs sm:text-xs md:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${viewMode === 'fluvial' ? 'bg-white text-sky-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-705'}`}
          >
            <Droplets className="w-4 h-4 text-sky-500" /> Fluvial & Hydrology
          </button>
          <button 
            id="btn-climatic"
            onClick={() => setViewMode('climatic')}
            className={`px-4 py-2 text-xs sm:text-xs md:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${viewMode === 'climatic' ? 'bg-white text-purple-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-705'}`}
          >
            <Wind className="w-4 h-4 text-purple-500" /> Climatic Systems
          </button>
        </div>
      </div>

      <Card className="mb-6 overflow-hidden border-2 border-slate-200 relative">
        <CardContent className="p-0 relative">
          
          {/* TAB 1: TOPOGRAPHICAL VIEW */}
          {viewMode === 'topographical' && (
             <div className="h-[430px] w-full bg-slate-105 z-10 relative">
              <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-slate-200 shadow-sm flex items-center gap-2 font-bold text-sm text-slate-800">
                <MapIcon className="w-4 h-4 text-emerald-600" />
                Topographical Map
              </div>
              {mapData ? (
                <MapContainer 
                  center={[mapData.lat, mapData.lng]} 
                  zoom={mapData.zoom} 
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%", zIndex: 10 }}
                >
                  <MapUpdater lat={mapData.lat} lng={mapData.lng} zoom={mapData.zoom} />
                  <TileLayer
                    attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  />
                </MapContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Map center data not available</div>
              )}
            </div>
          )}

          {/* TAB 2: TECTONIC FRAMEWORK VIEW */}
          {viewMode === 'tectonic' && (
             <div className="flex flex-col bg-slate-50 w-full z-10 relative">
                <div className="h-[430px] w-full relative border-b border-slate-100">
                   <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-md border border-slate-200 shadow-sm flex items-center gap-2 font-bold text-sm text-orange-600">
                     <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                     Tectonic Lithosphere
                   </div>

                   {mapData ? (
                     <MapContainer 
                       center={[mapData.lat, mapData.lng]} 
                       zoom={Math.max(2, mapData.zoom - 1)} 
                       scrollWheelZoom={true}
                       style={{ height: "100%", width: "100%", zIndex: 10, background: '#f8fafc' }}
                     >
                       <MapUpdater lat={mapData.lat} lng={mapData.lng} zoom={Math.max(2, mapData.zoom - 1)} />
                       <TileLayer
                         attribution='&copy; <a href="https://www.carto.com/">Carto</a>'
                         url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                       />
                       
                       {tectonicGeoJson && (
                          <GeoJSON 
                            data={tectonicGeoJson} 
                            style={(feature) => {
                              const type = feature?.properties?.boundary_type;
                              if (type === 'convergent') {
                                return { color: '#dc2626', weight: 3.5, opacity: 0.95 };
                              } else if (type === 'divergent') {
                                return { color: '#f97316', weight: 3, opacity: 0.9, dashArray: '6, 6' };
                              } else if (type === 'conservative') {
                                return { color: '#4b5563', weight: 2.5, opacity: 0.8, dashArray: '2, 4' };
                              }
                              return { color: '#64748b', weight: 2, opacity: 0.7 };
                            }}
                          />
                       )}

                       {PLATES_DATA.map((plate) => {
                         const labelIcon = L.divIcon({
                           className: "custom-plate-label",
                           html: `
                             <div style="
                               display: flex;
                               flex-direction: column;
                               align-items: center;
                               justify-content: center;
                               background-color: rgba(255, 255, 255, 0.95);
                               backdrop-filter: blur(1.5px);
                               padding: 3px 6px;
                               border-radius: 4px;
                               box-shadow: 0 1.5px 3px rgba(0,0,0,0.1);
                               border: 1px solid rgba(148, 163, 184, ${plate.type === 'major' ? '0.35' : '0.2'});
                               white-space: nowrap;
                               pointer-events: none;
                               line-height: 10px;
                               border-radius: 4px;
                             ">
                               <div style="
                                 font-size: ${plate.type === 'major' ? '12px' : '10px'};
                                 font-weight: 800;
                                 text-transform: uppercase;
                                 letter-spacing: 0.03em;
                                 color: ${plate.type === 'major' ? '#1e293b' : '#64748b'};
                                 font-style: ${plate.type === 'major' ? 'normal' : 'italic'};
                                 line-height: 10px;
                               ">${plate.name}</div>
                               <div style="
                                 display: flex;
                                 align-items: center;
                                 gap: 3px;
                                 margin-top: 1px;
                                font-size: 9px;
                                font-family: monospace;
                                font-weight: 600;
                                line-height: 10px;
                               ">
                                 <span style="
                                   display: inline-block;
                                   transform: rotate(${plate.angle}deg);
                                   color: #ea580c;
                                   font-weight: 900;
                                   font-size: 11px;
                                   line-height: 10px;
                                 ">↑</span>
                                 <span style="
                                   color: #64748b;
                                   line-height: 10px;
                                 ">${plate.speed} mm/yr</span>
                                </div>
                             </div>
                           `,
                           iconSize: [160, 40],
                           iconAnchor: [80, 20]
                         });

                         return (
                           <Marker 
                             key={plate.name}
                             position={[plate.lat, plate.lng]}
                             icon={labelIcon}
                           />
                         );
                       })}
                     </MapContainer>
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Map center data not available</div>
                   )}
                </div>

                <div className="bg-slate-50 border-t border-slate-105 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-0.5 bg-[#dc2626] mt-2 shrink-0 rounded" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-extrabold text-[#dc2626] uppercase tracking-wider">Convergent boundary</span>
                      <span className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Plates colliding (e.g., subduction & folding). Induces severe seismic risk ledger.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                    <div className="w-6 shrink-0 border-t-2 border-dashed border-[#f97316] mt-2" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-extrabold text-[#f97316] uppercase tracking-wider">Divergent boundary</span>
                      <span className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Plates rifting apart (e.g., sea floor ridge extension). Minor tremors & volcanism.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 border-t md:border-t-0 md:border-l border-slate-150 pt-3 md:pt-0 md:pl-4">
                    <div className="w-6 shrink-0 border-t-2 border-dotted border-[#4b5563] mt-2" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-extrabold text-[#4b5563] uppercase tracking-wider">Conservative / Transform</span>
                      <span className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Plates sliding laterally, storing lateral strain tension leading to severe seismic slips.</span>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {/* TAB 3: NEW FLUVIAL & HYDROLOGICAL MAP */}
          {viewMode === 'fluvial' && (
            <div className="flex flex-col bg-white w-full z-10 relative">
              <div className="w-full p-4 flex flex-col justify-between">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-5 h-5 text-sky-600" />
                    <span className="text-sm font-bold text-slate-800 tracking-tight">Active Hydrographic Drainage Canvas ({activeCountryName})</span>
                  </div>
                </div>
                
                {/* Mapsofworld Hydro-Basin Drainage Map */}
                <div className="h-[430px] w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative shadow-inner flex flex-col items-center justify-center p-0 mb-6">
                  {mapImageLoading ? (
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-2"></div>
                      <span className="text-sm font-medium">Extracting Hydrological Map via mapsofworld...</span>
                    </div>
                  ) : mapImageError || mapImageUrls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 text-center p-6">
                      <AlertOctagon className="w-10 h-10 text-orange-400 mb-3" />
                      <h4 className="font-bold text-slate-700">Map Extraction Failed</h4>
                      <p className="text-xs max-w-sm mt-1">Unable to locate the specific river map for {activeCountryName} from the external provider. It might use a non-standard naming convention or be unavailable.</p>
                    </div>
                  ) : (
                    <img 
                      src={mapImageUrls[currentUrlIndex]} 
                      alt={`River map of ${activeCountryName}`}
                      className="w-full h-full object-contain p-2" 
                      onError={() => {
                        if (currentUrlIndex < mapImageUrls.length - 1) {
                          setCurrentUrlIndex(currentUrlIndex + 1);
                        } else {
                          setMapImageError(true);
                        }
                      }}
                    />
                  )}
                </div>
                
                {/* Independent Analytical Panels Beneath the Standalone Map */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative animate-in fade-in duration-500">
                  {/* Largest Rivers List */}
                  <Card className="bg-slate-50 border border-slate-200 shadow-sm flex flex-col">
                    <CardContent className="p-5 flex-1 select-none">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                        <Droplets className="w-4 h-4 text-sky-500" /> Freshwater System Dynamics (OP A)
                      </h3>
                      <div className="space-y-4">
                        {(() => {
                           if (isLoadingFluvialData) {
                               return (
                                   <div className="flex flex-col items-center justify-center p-8">
                                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mb-2"></div>
                                      <p className="text-xs text-slate-500 font-medium animate-pulse">Requesting real-time hydrological data...</p>
                                   </div>
                               );
                           }

                           return (
                             <>
                               {/* Rivers Subsection */}
                               <div>
                                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                   <span className="text-sky-500">■</span> Surface Flows & Channel Discharge
                                 </h4>
                                 <div className="space-y-2">
                                   {(() => {
                                      const rivers = fluvial?.rivers || [];
                                      if (rivers.length === 0) {
                                        return <p className="text-xs text-slate-500 italic pl-1">No significant perennial surface rivers (Afluvial state).</p>;
                                      }
                                      const sorted = [...rivers].sort((a, b) => (b.length_km || 0) - (a.length_km || 0)).slice(0, 4);
                                      return sorted.map((r, i) => (
                                        <div key={r.name} className="flex justify-between items-center text-xs">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="font-mono font-black text-slate-350 text-[10px] w-3">{i+1}.</span>
                                            <span className="font-semibold text-slate-700 truncate">{r.name}</span>
                                            {r.transboundary && (
                                              <span className="text-[8px] bg-sky-50 border border-sky-100 text-sky-600 px-1 rounded font-medium shrink-0 uppercase tracking-wide">
                                                Transboundary
                                              </span>
                                            )}
                                          </div>
                                          <span className="font-mono font-medium text-[10.5px] text-slate-500 bg-white border border-slate-200/60 px-1.5 py-0.5 rounded shadow-sm shrink-0">
                                            {r.length_km ? `${r.length_km.toLocaleString()} km` : '?'}
                                          </span>
                                        </div>
                                      ));
                                   })()}
                                 </div>
                               </div>

                               {/* Aquifers & Alternative Sources Subsection */}
                               <div className="border-t border-slate-200/80 pt-3">
                                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                   <span className="text-emerald-500">■</span> Groundwater & Aquifer Reservoirs
                                 </h4>
                                 <div className="space-y-2.5">
                                   {(() => {
                                      // Fallback/default aquifer if none found or for prominent custom cases
                                      let sources = fluvial?.freshwater_sources || [];
                                      const nameLower = activeCountryName.toLowerCase();
                                      
                                      if (sources.length === 0) {
                                        if (nameLower.includes("australia")) {
                                          sources = [
                                            { name: "Great Artesian Basin", type: "Aquifer (Artisanal/Groundwater)", capacity_or_flow: "64,900 million ML storage" },
                                            { name: "Murray Darling Shallow Aquifers", type: "Alluvial Aquifer", capacity_or_flow: "Vulnerable to high salinization" }
                                          ];
                                        } else if (nameLower.includes("united states") || nameLower.includes("usa") || nameLower.includes("america")) {
                                          sources = [
                                            { name: "Ogallala Aquifer (High Plains)", type: "Fossil Aquifer", capacity_or_flow: "Rapid structural drawdown" },
                                            { name: "Central Valley Aquifer System", type: "Alluvial Basin", capacity_or_flow: "Severe land subsidence risks" }
                                          ];
                                        } else if (nameLower.includes("saudi")) {
                                          sources = [
                                            { name: "Saq Aquifer System", type: "Fossil Sandstone Aquifer", capacity_or_flow: "80%+ non-renewable depletion" },
                                            { name: "Ras Al Khair Desalination Plant", type: "Desalination Mega-Plant", capacity_or_flow: "1.03 million m³/day capacity" }
                                          ];
                                        } else if (nameLower.includes("united kingdom") || nameLower === "uk") {
                                          sources = [
                                            { name: "Chalk Aquifers of Southern England", type: "Unconfined Limestone Aquifer", capacity_or_flow: "High pollution load" }
                                          ];
                                        } else {
                                          sources = [
                                            { name: `${activeCountryName} Regional Aquifer`, type: "Regional Groundwater Basin", capacity_or_flow: "Varies by season" }
                                          ];
                                        }
                                      } else if (nameLower.includes("australia") && !sources.some((s: any) => s.name.toLowerCase().includes("artesian"))) {
                                        // Ensure the requested iconic case study is ALWAYS present for Australia
                                        sources = [
                                          { name: "Great Artesian Basin", type: "Aquifer (Artisanal/Groundwater)", capacity_or_flow: "64,900 million ML storage" },
                                          ...sources
                                        ];
                                      }

                                      return sources.slice(0, 3).map((src: any, i: number) => (
                                        <div key={src.name} className="flex justify-between items-center text-xs min-w-0 gap-2">
                                          <div className="flex flex-col gap-0.5 min-w-0">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              <span className="font-mono font-black text-slate-350 text-[10px] w-3">{i+1}.</span>
                                              <span className="font-semibold text-slate-700 truncate">{src.name}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 capitalize pl-5 truncate">{src.type}</span>
                                          </div>
                                          {src.capacity_or_flow && (
                                            <span className="font-mono font-medium text-[9.5px] text-slate-500 bg-white border border-slate-200/60 px-1.5 py-0.5 rounded shadow-sm shrink-0 whitespace-nowrap">
                                              {src.capacity_or_flow}
                                            </span>
                                          )}
                                        </div>
                                      ));
                                   })()}
                                 </div>
                               </div>
                             </>
                           );
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Case Study */}
                  <Card className="bg-slate-50 border border-slate-200 shadow-sm flex flex-col">
                    <CardContent className="p-5 flex-col flex-1">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                        <ShieldAlert className="w-4 h-4 text-red-500" /> Water Security & Transboundary Friction Case Study
                      </h3>
                      <div className="flex-1">
                        {(() => {
                           if (isLoadingFluvialData) {
                               return (
                                   <div className="flex flex-col items-center justify-center p-4">
                                      <div className="animate-pulse flex space-x-4 w-full">
                                        <div className="flex-1 space-y-3 py-1">
                                          <div className="h-2 bg-slate-200 rounded"></div>
                                          <div className="space-y-2">
                                            <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                                            <div className="h-2 bg-slate-200 rounded w-4/6"></div>
                                          </div>
                                        </div>
                                      </div>
                                   </div>
                               );
                           }
                           const study = fluvial?.caseStudy || getCaseStudy(activeCountryName);
                           return (
                             <>
                               <h4 className="font-extrabold text-slate-800 text-xs mb-2 leading-tight uppercase tracking-wide">{study.title}</h4>
                               <p className="text-[12px] text-slate-600 leading-relaxed font-medium">{study.description}</p>
                             </>
                           );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NEW CLIMATIC SYSTEMS & ATMOSPHERIC MAP */}
          {viewMode === 'climatic' && (
            <div className="flex flex-col lg:flex-row bg-white w-full z-10 relative min-h-[460px]">
              <div className="w-full lg:w-3/5 p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Wind className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-bold text-slate-800 tracking-tight">Synoptic Circulations, Pressure Belts & Distress Layers ({activeCountryName})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Dynamic Synoptic Mapping Model</span>
                </div>

                {/* SVG Climate Synoptic Base Map */}
                <div className="h-[340px] w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-inner">
                  <svg id="vector-climatic-map" viewBox="0 0 500 350" className="w-full h-full relative">
                    <defs>
                      {/* ITCZ Low pressure Gradient (Reddish/Warm soft band) */}
                      <linearGradient id="itczGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#ec4899" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
                      </linearGradient>
                      {/* Subtropical High pressure gradient */}
                      <linearGradient id="highGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                      </linearGradient>
                      <pattern id="monsoonHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="12" stroke="#ec4899" strokeWidth="1.5" opacity="0.4" />
                      </pattern>
                      <pattern id="aridityStipple" width="8" height="8" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.3" fill="#f59e0b" opacity="0.4" />
                        <circle cx="6" cy="6" r="1" fill="#f59e0b" opacity="0.3" />
                      </pattern>
                    </defs>

                    {/* Faux Country Contour Boundary Outline */}
                    <path d="M 80 60 L 410 40 Q 460 160 410 280 Q 250 320 90 280 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

                    {/* pressure belt band overlay background indicator */}
                    {climate.pressure_belt_type === 'low' ? (
                      <g>
                        <rect x="0" y="110" width="500" height="90" fill="url(#itczGrad)" />
                        <line x1="0" y1="110" x2="500" y2="110" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" />
                        <line x1="0" y1="200" x2="500" y2="200" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" />
                        <text x="250" y="160" className="text-[9px] font-black fill-pink-300 font-mono tracking-widest text-center uppercase" textAnchor="middle">
                          ▲ DYNAMIC ITCZ LOW PRESSURE ANOMALY BELT ▲
                        </text>
                      </g>
                    ) : climate.pressure_belt_type === 'high' ? (
                      <g>
                        <rect x="0" y="70" width="500" height="210" fill="url(#highGrad)" />
                        <text x="250" y="175" className="text-[9px] font-black fill-sky-200 font-mono tracking-widest text-center uppercase" textAnchor="middle">
                          ▼ PERMANENT HADLEY SUBTROPICAL HIGH DIVERGENT ZONE ▼
                        </text>
                      </g>
                    ) : (
                      <g>
                        {/* Mid-Latitude belt */}
                        <rect x="0" y="40" width="500" height="80" fill="url(#highGrad)" opacity="0.5" />
                        <rect x="0" y="230" width="500" height="80" fill="url(#itczGrad)" opacity="0.4" />
                        <text x="250" y="85" className="text-[9px] font-black fill-sky-300 font-mono tracking-widest text-center uppercase" textAnchor="middle">
                          MID-LATITUDE WESTERLY JET FRONT (DESCENDING ARM)
                        </text>
                      </g>
                    )}

                    {/* Styled wind flow vectors */}
                    {(() => {
                      const angle = climate.wind_flow_angle || 45;
                      // Dynamic transform calculation for angled trade winds
                      return (
                        <g opacity="0.8">
                          {/* Warm Trade Wind Vectors */}
                          <path d="M 50 300 Q 150 250 220 180" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="none" markerEnd="url(#arrow-pink)" fill="none" transform={`rotate(${angle - 45}, 220, 180)`} />
                          <path d="M 120 310 Q 220 260 290 190" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="none" markerEnd="url(#arrow-pink)" fill="none" transform={`rotate(${angle - 45}, 290, 190)`} />
                          
                          {/* Polar Dry winds */}
                          <path d="M 450 50 Q 350 120 280 180" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="none" markerEnd="url(#arrow-blue)" fill="none" />
                          <path d="M 380 40 Q 280 110 210 170" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="none" markerEnd="url(#arrow-blue)" fill="none" />
                          
                          {/* Vector Text Tags */}
                          <text x="50" y="240" className="text-[8px] font-bold fill-pink-400 rotate-12">WARM TRADE WINDS (SW VECTOR)</text>
                          <text x="330" y="90" className="text-[8px] font-bold fill-sky-400 -rotate-12">DRY NORTHEASTERLY FLOW</text>
                        </g>
                      );
                    })()}

                    {/* MUTABLE CRISIS LAYER 1: MONSOON REVERSAL SHADING */}
                    {monsoonOverlay && (
                      <g className="animate-in fade-in duration-300">
                        <path d="M 100 80 L 390 60 Q 420 180 390 260 Q 260 300 110 260 Z" fill="url(#monsoonHatch)" opacity="0.6" />
                        <rect x="20" y="300" width="130" height="15" rx="3" fill="#f472b6" fillOpacity="0.9" />
                        <text x="25" y="310" className="text-[8px] font-black fill-slate-900 font-mono">MONSOON ACTIVE ZONE</text>
                      </g>
                    )}

                    {/* MUTABLE CRISIS LAYER 2: ENSO AMBIGUOUS SHADINGS */}
                    {ensoOverlay && (
                      <g className="animate-in fade-in duration-300">
                        {/* Pulsing ring indicator in ocean or high anomaly plains */}
                        <circle cx="250" cy="175" r="45" fill="none" stroke="#f43f5e" strokeWidth="1.5" className="animate-pulse" />
                        <circle cx="250" cy="175" r="2" fill="#f43f5e" />
                        <rect x="180" y="130" width="140" height="24" rx="4" fill="#0f172a" fillOpacity="0.9" stroke="#334155" strokeWidth="1" />
                        <text x="250" y="142" className="text-[7.5px] font-extrabold fill-pink-400 text-center uppercase" textAnchor="middle">ENSO Active Core Anomaly</text>
                        <text x="250" y="151" className="text-[7px] fill-slate-300 text-center font-mono" textAnchor="middle">
                          {activeCountryName.toLowerCase().includes("egypt") ? "Vulnerability: Low Flow Nile" : "Vulnerability: Monsoonal Delays"}
                        </text>
                      </g>
                    )}

                    {/* MUTABLE CRISIS LAYER 3: CRYOSPHERE GLACIAL MELT ALERT */}
                    {cryosphereOverlay && (
                      <g className="animate-in fade-in duration-300">
                        {/* Highland tags with cyan warning circles */}
                        <g transform="translate(230, 45)">
                          <circle cx="0" cy="0" r="14" fill="#06b6d4" fillOpacity="0.3" stroke="#22d3ee" strokeWidth="1" className="animate-ping" />
                          <polygon points="0,-8 7,5 -7,5" fill="#22d3ee" stroke="#0891b2" strokeWidth="1" />
                          <circle cx="0" cy="0" r="2" fill="#fff" />
                          <text x="12" y="3" className="text-[8px] font-black fill-cyan-400 drop-shadow">GLACIAL MELT ZONE</text>
                        </g>

                        {(() => {
                          const lower = activeCountryName.toLowerCase();
                          if (lower.includes("egypt")) {
                            return (
                              <g transform="translate(140, 275)">
                                <rect width="220" height="15" rx="3" fill="#0ea5e9" fillOpacity="0.9" />
                                <text x="110" y="10" className="text-[7.5px] font-black fill-white text-center font-mono uppercase" textAnchor="middle">No local cryosphere buffers. System Silt-Blocked</text>
                              </g>
                            );
                          }
                          return null;
                        })()}
                      </g>
                    )}

                    {/* MUTABLE CRISIS LAYER 4: ARIDITY AND DEGRADATION PLOTS */}
                    {aridityOverlay && (
                      <g className="animate-in fade-in duration-300">
                        {/* Stippled Amber Shading over non-riverine plains */}
                        <path d="M 90 90 L 220 70 L 310 160 L 150 260 Z" fill="url(#aridityStipple)" />
                        <rect x="340" y="300" width="140" height="15" rx="3" fill="#f59e0b" fillOpacity="0.9" />
                        <text x="345" y="310" className="text-[8px] font-black fill-slate-900 font-mono">ARIDITY STRESS / DEGRADATION</text>
                      </g>
                    )}
                  </svg>
                </div>

                {/* SVG definitions marker arrows for clean vector render */}
                <svg className="h-0 w-0 absolute">
                  <defs>
                    <marker id="arrow-pink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ec4899" />
                    </marker>
                    <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
                    </marker>
                  </defs>
                </svg>

                {/* Basic vector overlays keys */}
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg grid grid-cols-2 gap-3 text-[10px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-pink-400" />
                    <span className="font-semibold">SW Monsoon / Trade Vectors (Pink)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold">NE Dry Wind Trade Vectors (Blue)</span>
                  </div>
                </div>
              </div>

              {/* Sidebar Matrix overlays checkbox control frame */}
              <div className="w-full lg:w-2/5 p-4 flex flex-col justify-between">
                <div>
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 mb-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2.5 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-600" />
                      Atmospheric & Crisis Layers Toggle Matrix
                    </h3>
                    
                    <div className="space-y-2.5">
                      {/* Checkbox 1: Monsoon */}
                      <label className="flex items-start gap-2.5 cursor-pointer p-1.5 rounded hover:bg-slate-100 transition-colors">
                        <input 
                          type="checkbox"
                          checked={monsoonOverlay}
                          onChange={(e) => setMonsoonOverlay(e.target.checked)}
                          className="mt-0.5 rounded text-pink-600 focus:ring-pink-500 h-3.5 w-3.5 border-slate-300"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">Wet & Dry Monsoon Patterns</span>
                          <span className="text-[10px] text-slate-500">Cross-hatched polygon representing seasonal wind shift boundaries.</span>
                        </div>
                      </label>

                      {/* Checkbox 2: ENSO */}
                      <label className="flex items-start gap-2.5 cursor-pointer p-1.5 rounded hover:bg-slate-100 transition-colors">
                        <input 
                          type="checkbox"
                          id="chk-enso"
                          checked={ensoOverlay}
                          onChange={(e) => setEnsoOverlay(e.target.checked)}
                          className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5 border-slate-300"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">ENSO Teleconnections</span>
                          <span className="text-[10px] text-slate-500">Concentric circles pointing out abnormal high-drought or water swelling periods.</span>
                        </div>
                      </label>

                      {/* Checkbox 3: Cryosphere */}
                      <label className="flex items-start gap-2.5 cursor-pointer p-1.5 rounded hover:bg-slate-100 transition-colors">
                        <input 
                          type="checkbox"
                          checked={cryosphereOverlay}
                          onChange={(e) => setCryosphereOverlay(e.target.checked)}
                          className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5 border-slate-300"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">Cryosphere Distress</span>
                          <span className="text-[10px] text-slate-500">Triangle marker mapping accelerating glacial melt risk in upper headwaters.</span>
                        </div>
                      </label>

                      {/* Checkbox 4: Aridity */}
                      <label className="flex items-start gap-2.5 cursor-pointer p-1.5 rounded hover:bg-slate-100 transition-colors">
                        <input 
                          type="checkbox"
                          checked={aridityOverlay}
                          onChange={(e) => setAridityOverlay(e.target.checked)}
                          className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 border-slate-300"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">Aridity & Desertification Stress</span>
                          <span className="text-[10px] text-slate-500">Stippled polygon denoting areas of severe land degradation and groundwater drawdowns.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Crisis explanation card */}
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-xs text-purple-900 mb-2">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertOctagon className="w-4 h-4 text-purple-600" />
                      <span>Crisis Feed Synopsis (DP SL2)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                      Pressure cell anomalies combined with extreme El Niño periods compress regional agricultural yields, prompting transboundary climate migration and extreme capital losses.
                    </p>
                  </div>
                </div>

                {/* Microclimate Ledger details */}
                <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800 text-[11px]">
                  <span className="text-[9px] font-black text-slate-400 tracking-wider block mb-1">ATMOSPHERIC STRUCTURE LEDGER</span>
                  <div className="space-y-1">
                    <p><span className="text-slate-400">Circulation Belt:</span> {climate.dominant_pressure_belt}</p>
                    <p><span className="text-slate-400">Prevailing Winds:</span> {climate.prevailing_winds}</p>
                    <p><span className="text-slate-400">Monsoon Class:</span> {climate.monsoon_active ? 'Monsoon Active Zone' : 'No Major Monsoon Activity'}</p>
                    <p><span className="text-slate-400">Cryosphere Risk:</span> {climate.cryosphere_melt_risk}</p>
                    <p><span className="text-slate-400">Arid Distress Level:</span> {climate.desertification_vulnerability}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* LOWER CONTENT AREA */}
      {viewMode === 'topographical' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative animate-in slide-in-from-bottom-4 duration-500">
          <PhysicalQuadrant 
            icon={<Mountain className="w-5 h-5 text-stone-700" />}
            title="Topographic Friction"
            items={data.topographic_friction_points.map(i => ({ name: i.feature, desc: i.geopolitical_constraint }))}
            color="stone"
          />
          <PhysicalQuadrant 
            icon={<Droplets className="w-5 h-5 text-sky-700" />}
            title="Hydrological Arteries"
            items={data.hydrological_arteries.map(i => ({ name: i.feature, desc: i.strategic_advantage }))}
            color="sky"
          />
          <PhysicalQuadrant 
            icon={<Anchor className="w-5 h-5 text-red-700" />}
            title="Strategic Choke Points"
            items={data.choke_points_vulnerabilities.map(i => ({ name: i.feature, desc: i.impact }))}
            color="red"
          />
          <PhysicalQuadrant 
            icon={<ShieldAlert className="w-5 h-5 text-emerald-700" />}
            title="Geopolitical Buffer Zones"
            items={data.buffer_zones.map(i => ({ name: i.region, desc: i.significance }))}
            color="emerald"
          />
        </div>
      )}

      {viewMode === 'tectonic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative animate-in slide-in-from-bottom-4 duration-500">
           <Card className="bg-slate-900 border-slate-800 text-white lg:col-span-2">
             <CardContent className="p-6">
                <h3 className="text-lg font-bold tracking-tight text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  Tectonic Risk Ledger
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Active Boundaries & Interactions</span>
                      <p className="text-sm text-slate-300 leading-relaxed">{tectonicData.ledger.active_boundaries_and_interactions}</p>
                   </div>
                   <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Relative Plate Motion</span>
                      <p className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                         <ChevronRight className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                         <span>{tectonicData.ledger.relative_plate_motion}</span>
                      </p>
                   </div>
                </div>
             </CardContent>
           </Card>

           <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-none text-white shadow-md">
              <CardContent className="p-6 flex flex-col h-full">
                 <h3 className="text-lg font-bold tracking-tight text-white mb-3">Synoptic Case-Study</h3>
                 <p className="text-sm text-orange-50 font-medium leading-relaxed mb-4 flex-grow">
                   {tectonicData.ledger.synoptic_case_study}
                 </p>
                 <div className="bg-black/20 p-3 rounded text-[11px] font-semibold text-white/90">
                   Structural impact directly influences capital constraints and spatial demographic agglomeration.
                 </div>
              </CardContent>
           </Card>
        </div>
      )}

      {viewMode === 'fluvial' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative animate-in slide-in-from-bottom-4 duration-500">
           <Card className="bg-slate-50 border-2 border-slate-200">
             <CardContent className="p-6">
               <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-3 flex items-center gap-2">
                 <Droplets className="w-5 h-5 text-sky-600" />
                 Fluvial Basin Dynamics (OP A: Freshwater)
               </h3>
               <p className="text-sm text-slate-700 leading-relaxed mb-3">
                 In DP Geography, the drainage basin serves as an open system with inputs (precipitation), transfers (infiltration, percolation, channel flow), and outputs (evapotranspiration and ocean runoff). 
               </p>
               <p className="text-sm text-slate-700 leading-relaxed">
                 Upstream water withdrawals for farming, reservoirs, or dam gates significantly depress stream velocities downriver, amplifying coastal estuary salinization risks and depriving flood plains of nutritious mineral silt.
               </p>
             </CardContent>
           </Card>

           <Card className="bg-slate-900 text-white">
             <CardContent className="p-6">
               <h3 className="text-lg font-bold tracking-tight text-sky-400 mb-3 flex items-center gap-2">
                 <Info className="w-5 h-5 text-sky-400" />
                 Water Security & Transboundary Friction Case Study
               </h3>
               <p className="text-sm text-slate-350 leading-relaxed mb-3">
                 The selected rivers highlight classic structural friction. Riparian nations sharing a transboundary watercourse must navigate the **Helsinki Rules** or **UN Watercourses Convention**.
               </p>
               <p className="text-sm text-slate-350 leading-relaxed">
                 When upstream states construct major storage barriers (such as on the Ganges or the Nile), they secure domestic base load energy but create structural agricultural and ecological vulnerability for downstream nations.
               </p>
             </CardContent>
           </Card>
        </div>
      )}

      {viewMode === 'climatic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative animate-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-slate-50 border-2 border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-3 flex items-center gap-2">
                <Wind className="w-5 h-5 text-purple-600" />
                Global Circulation Cells (SL 2: Global Climate)
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                Atmospheric circulation is driven by solar radiation imbalances. Rising warm air at the Equator produces low-pressure segments (ITCZ), creating massive convection cells (Hadley Cells).
              </p>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                The descending arm of the Hadley Cell near latitudes 30°N and 30°S creates permanent subtropical high-pressure cells, blocking damp weather flows and establishing the world's most severe desert regimes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold tracking-tight text-pink-400 mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-pink-400" />
                ENSO teleconnections & Soil Vulnerabilities
              </h3>
              <p className="text-sm text-slate-355 leading-relaxed mb-3">
                The El Niño Southern Oscillation (ENSO) represents ocean-atmospheric pressure couplings. Pacific SST reversals trigger macro-climatic teleconnections in remote zones.
              </p>
              <p className="text-sm text-slate-355 leading-relaxed">
                During El Niño phases, monsoonal systems often collapse or dry up in Asia/Africa, while extreme high-precipitation shifts induce severe flash flooding in South American margins, showcasing how global physical loops directly stress local crop yields.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function PhysicalQuadrant({ icon, title, items, color }: { icon: React.ReactNode, title: string, items: Array<{name: string, desc: string}>, color: string }) {
  
  const colorSchemes: Record<string, string> = {
    stone: "bg-stone-50 border-stone-200 text-stone-800",
    sky: "bg-sky-50 border-sky-200 text-sky-800",
    red: "bg-red-50 border-red-200 text-red-800",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };
  
  const schemeClass = colorSchemes[color] || colorSchemes.stone;

  return (
    <Card className={`overflow-hidden border-2 ${schemeClass}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 bg-white rounded-lg shadow-sm border border-black/5`}>
            {icon}
          </div>
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        </div>
        <div className="space-y-5">
          {items.map((item, idx) => (
            <div key={idx} className="relative pl-4 border-l-2 border-black/10" style={{ contentVisibility: 'auto' }}>
              <div className="absolute w-2 h-2 rounded-full bg-black/20 -left-[5px] top-1.5" />
              <h4 className="font-semibold text-slate-900 mb-1">{item.name}</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
