import { useState, useMemo } from "react";
import { DPPlaceProfile } from "../../types";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "../ui";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Briefcase, Scale, ShieldAlert, HeartHandshake, FileText, CheckCircle2, Copy, Check, Building2, Globe, MapPin } from "lucide-react";
import { getInterpolatedStats } from "../../demographics_stats";
import { economyIndicatorsData } from "./EconomyIndicatorsData";

interface TncProfile {
  name: string;
  domain: string;
  logoText: string;
  logoBg: string;
  sector: string;
  regions: string[];
  partners: string[];
  description: string;
  localLogo?: string;
}

function TncLogo({ domain, name, logoText, logoBg, localLogo }: { domain: string; name: string; logoText: string; logoBg: string; localLogo?: string }) {
  const [error, setError] = useState(false);
  
  if (localLogo) {
    return (
      <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
        <img
          src={localLogo}
          alt={`${name} Logo`}
          referrerPolicy="no-referrer"
          className="object-contain"
          style={{ width: "30.9937px", height: "30.9937px" }}
        />
      </div>
    );
  }
  
  if (error || !domain) {
    return (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shadow-xs shrink-0 ${logoBg}`}>
        {logoText}
      </div>
    );
  }
  
  return (
    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={`${name} Logo`}
        referrerPolicy="no-referrer"
        className="object-contain"
        style={{ width: "30.9937px", height: "30.9937px" }}
        onError={() => setError(true)}
      />
    </div>
  );
}

const tncProfiles: Record<string, TncProfile[]> = {
  bangladesh: [
    {
      name: "BEXIMCO",
      domain: "beximco.com",
      logoText: "BEX",
      logoBg: "bg-blue-600 text-white",
      sector: "Textiles, Pharma & IT",
      regions: ["North America", "Western Europe", "East Asia"],
      partners: ["United States", "Germany", "Japan", "UK"],
      description: "Leading multinational conglomerate exporting RMG and critical APIs to major high-income Western hubs.",
      localLogo: "/beximco.svg"
    },
    {
      name: "Square Pharma",
      domain: "squarepharma.com.bd",
      logoText: "SQ",
      logoBg: "bg-blue-600 text-white",
      sector: "Pharmaceuticals",
      regions: ["East Africa", "Southeast Asia", "South Asia"],
      partners: ["Kenya", "Myanmar", "Nepal", "Yemen"],
      description: "Pioneering generic formulary supply to developing health agencies with direct production assets in East Africa.",
      localLogo: "/square.svg"
    }
  ],
  usa: [
    {
      name: "Apple Inc.",
      domain: "apple.com",
      logoText: "AAPL",
      logoBg: "bg-slate-900 text-white",
      sector: "Consumer Tech & Services",
      regions: ["Global", "Europe", "East Asia", "Americas"],
      partners: ["Ireland", "China", "India", "Germany"],
      description: "Maintains highly integrated global product chains, capturing high-margin intellectual property premiums in California."
    },
    {
      name: "NVIDIA",
      domain: "nvidia.com",
      logoText: "NVDA",
      logoBg: "bg-blue-600 text-white",
      sector: "Semiconductors & AI",
      regions: ["East Asia", "Western Europe", "North America"],
      partners: ["Taiwan", "South Korea", "Germany", "UK"],
      description: "Dominates global supply networks for advanced computing chips, coordinating multi-stage fab-to-foundry logistics."
    }
  ],
  china: [
    {
      name: "Huawei",
      domain: "huawei.com",
      logoText: "HW",
      logoBg: "bg-red-600 text-white",
      sector: "Telecomm & Infrastructure",
      regions: ["Europe", "Africa", "Middle East", "Southeast Asia"],
      partners: ["Germany", "South Africa", "Saudi Arabia", "Brazil"],
      description: "Key global digital belt-and-road actor delivering foundational 5G cellular arrays and hardware across key emerging markets."
    },
    {
      name: "BYD Auto",
      domain: "byd.com",
      logoText: "BYD",
      logoBg: "bg-blue-800 text-white",
      sector: "Electric Vehicles & Batteries",
      regions: ["Europe", "Southeast Asia", "South America"],
      partners: ["Germany", "Thailand", "Brazil", "Hungary"],
      description: "Disruptive green-tech exporter leveraging vertically integrated battery supply networks to capture automotive markets."
    }
  ],
  india: [
    {
      name: "Tata Group",
      domain: "tata.com",
      logoText: "TATA",
      logoBg: "bg-sky-900 text-white",
      sector: "Automotive, Steel & IT",
      regions: ["North America", "Europe", "Sub-Saharan Africa"],
      partners: ["United Kingdom", "United States", "South Africa", "Netherlands"],
      description: "Massive historic multinational managing global subsidiary brands like Jaguar Land Rover and TCS consulting hubs."
    },
    {
      name: "Infosys",
      domain: "infosys.com",
      logoText: "INFY",
      logoBg: "bg-blue-500 text-white",
      sector: "IT Outsourcing & Consulting",
      regions: ["Global", "North America", "Western Europe"],
      partners: ["United States", "United Kingdom", "Switzerland", "Australia"],
      description: "Global delivery model pioneer orchestrating cross-border knowledge flows and enterprise systems support."
    }
  ],
  "south-korea": [
    {
      name: "Samsung",
      domain: "samsung.com",
      logoText: "SEC",
      logoBg: "bg-indigo-900 text-white",
      sector: "Semiconductors & Mobiles",
      regions: ["Global", "North America", "Western Europe", "Southeast Asia"],
      partners: ["Vietnam", "United States", "Germany", "India"],
      description: "One of the world's largest chipmakers and electronics giants, coordinating key industrial parks in Hanoi/Binh Duong."
    },
    {
      name: "Hyundai Motor",
      domain: "hyundai.com",
      logoText: "HMC",
      logoBg: "bg-sky-800 text-white",
      sector: "Automotive & Heavy Industry",
      regions: ["North America", "Central Europe", "South Asia", "Americas"],
      partners: ["United States", "Czechia", "India", "Brazil"],
      description: "Major automotive exporter with large-scale advanced robot manufacturing hubs globally."
    }
  ],
  vietnam: [
    {
      name: "Viettel Group",
      domain: "viettel.com",
      logoText: "VT",
      logoBg: "bg-amber-600 text-white",
      sector: "Telecomm & Digital Services",
      regions: ["Southeast Asia", "East Africa", "Latin America"],
      partners: ["Cambodia", "Mozambique", "Myanmar", "Peru"],
      description: "State-owned military enterprise successfully investing in overseas carrier markets and developmental telecom meshes."
    },
    {
      name: "VinFast",
      domain: "vinfast.com",
      logoText: "VFS",
      logoBg: "bg-cyan-700 text-white",
      sector: "Electric Vehicles",
      regions: ["North America", "Southeast Asia", "Western Europe"],
      partners: ["United States", "Indonesia", "Germany", "Canada"],
      description: "Vietnamese electric vehicle disruptor exporting smart EVs and investing in multibillion-dollar Gigafactories in the West."
    }
  ],
  philippines: [
    {
      name: "San Miguel Corp.",
      domain: "sanmiguel.com",
      logoText: "SMC",
      logoBg: "bg-red-700 text-white",
      sector: "Food, Beverage & Infra",
      regions: ["Southeast Asia", "Asia-Pacific"],
      partners: ["Vietnam", "Australia", "Indonesia", "China"],
      description: "Diversified industrial giant exporting consumer goods and holding substantial packaging and fuel assets regionally."
    },
    {
      name: "Jollibee Foods",
      domain: "jollibee.com",
      logoText: "JFC",
      logoBg: "bg-amber-500 text-white",
      sector: "Quick Service Food",
      regions: ["North America", "Western Europe", "Middle East"],
      partners: ["United States", "United Kingdom", "Saudi Arabia", "Singapore"],
      description: "Leading food services brand expanding globally through targeted acquisitions and nostalgic diaspora targeting."
    }
  ],
  malaysia: [
    {
      name: "Petronas",
      domain: "petronas.com",
      logoText: "PET",
      logoBg: "bg-teal-600 text-white",
      sector: "Oil, Gas & Chemical Blocks",
      regions: ["Central Asia", "Middle East", "Africa", "South America"],
      partners: ["Turkmenistan", "Sudan", "Brazil", "Azerbaijan"],
      description: "State-owned energy titan managing transcontinental petroleum extraction licenses and shipping LNG blocks."
    },
    {
      name: "Sime Darby",
      domain: "simedarby.com",
      logoText: "SDB",
      logoBg: "bg-blue-800 text-white",
      sector: "Palm Oil & Heavy Equipment",
      regions: ["Asia-Pacific", "Western Europe"],
      partners: ["Australia", "China", "Singapore", "United Kingdom"],
      description: "Historically prominent conglomerate driving massive global agri-commodity, retail, and equipment networks."
    }
  ],
  russia: [
    {
      name: "Gazprom",
      domain: "gazprom.ru",
      logoText: "GZP",
      logoBg: "bg-blue-700 text-white",
      sector: "Natural Gas & Pipelines",
      regions: ["Central Asia", "East Asia", "Southeast Europe"],
      partners: ["China", "Belarus", "Turkey", "Kazakhstan"],
      description: "State-controlled energy exporter orchestrating strategic trans-Eurasian sovereign gas pipeline operations."
    },
    {
      name: "Lukoil",
      domain: "lukoil.com",
      logoText: "LUK",
      logoBg: "bg-rose-700 text-white",
      sector: "Petroleum & Chemicals",
      regions: ["North America", "Middle East", "Southeast Europe"],
      partners: ["United States", "Iraq", "Turkey", "Bulgaria"],
      description: "Private energy multinational running deep offshore production rigs and large retail fueling hubs internationally."
    }
  ],
  poland: [
    {
      name: "PKN Orlen",
      domain: "orlen.pl",
      logoText: "ORL",
      logoBg: "bg-red-650 text-white",
      sector: "Refining & Oil Retail",
      regions: ["Central Europe", "Baltic States"],
      partners: ["Germany", "Czechia", "Lithuania", "Slovakia"],
      description: "Largest Central European multi-utility energy player coordinating major refining pipelines and fuel stations."
    },
    {
      name: "KGHM",
      domain: "kghm.pl",
      logoText: "KGH",
      logoBg: "bg-blue-950 text-white",
      sector: "Copper & Silver Metallurgy",
      regions: ["South America", "North America"],
      partners: ["Chile", "United States", "Canada"],
      description: "State-champion mining giant operating massive open-pit copper mines like Sierra Gorda in South America."
    }
  ],
  germany: [
    {
      name: "Volkswagen",
      domain: "vw.com",
      logoText: "VW",
      logoBg: "bg-blue-900 text-white",
      sector: "Automotive & Engineering",
      regions: ["Europe", "East Asia", "Americas"],
      partners: ["China", "United States", "Brazil", "Mexico"],
      description: "Pioneering carmaker operating massive international assembly bases and dense core-periphery supply meshes."
    },
    {
      name: "Siemens AG",
      domain: "siemens.com",
      logoText: "SIE",
      logoBg: "bg-teal-750 text-white",
      sector: "Industrial Automation & Power",
      regions: ["Global", "North America", "East Asia", "Middle East"],
      partners: ["United States", "China", "Saudi Arabia", "India"],
      description: "Leading technology enterprise supplying high-tech medical imagery, grid power, and rail signaling systems globally."
    }
  ],
  uk: [
    {
      name: "AstraZeneca",
      domain: "astrazeneca.com",
      logoText: "AZN",
      logoBg: "bg-cyan-900 text-white",
      sector: "Biotechnology & Pharmacy",
      regions: ["Global", "North America", "Western Europe", "East Asia"],
      partners: ["United States", "Sweden", "China", "Japan"],
      description: "Major pharmaceutical giant coordinating advanced oncology research and regional manufacturing factories."
    },
    {
      name: "BP p.l.c.",
      domain: "bp.com",
      logoText: "BP",
      logoBg: "bg-yellow-500 text-blue-950",
      sector: "Petroleum & Renewables",
      regions: ["North America", "Middle East", "South America"],
      partners: ["United States", "Azerbaijan", "Brazil", "Iraq"],
      description: "Supermajor global energy operator extracting fossil resources and developing regional offshore wind grids."
    }
  ],
  switzerland: [
    {
      name: "Nestlé S.A.",
      domain: "nestle.com",
      logoText: "NES",
      logoBg: "bg-amber-800 text-white",
      sector: "Food & Beverage Processing",
      regions: ["Global", "North America", "Europe", "Latin America"],
      partners: ["United States", "China", "Brazil", "Germany"],
      description: "The world's largest consumer food processor with hundreds of factories localized inside target consumer markets."
    },
    {
      name: "Glencore",
      domain: "glencore.com",
      logoText: "GLEN",
      logoBg: "bg-yellow-600 text-white",
      sector: "Mining & Commodity Trading",
      regions: ["Global", "South America", "Sub-Saharan Africa", "Australia"],
      partners: ["Australia", "Chile", "DRC", "South Africa"],
      description: "Aggressive natural resource trader linking peripheral mining operations directly to global metallic delivery vaults."
    }
  ],
  australia: [
    {
      name: "BHP Group",
      domain: "bhp.com",
      logoText: "BHP",
      logoBg: "bg-orange-800 text-white",
      sector: "Mining & Heavy Resources",
      regions: ["South America", "North America", "East Asia"],
      partners: ["Chile", "Peru", "United States", "China"],
      description: "Largest mining company in the world, exporting high-purity iron ore, copper, and metallurgical coal globally.",
      localLogo: "/bhp.svg"
    },
    {
      name: "Rio Tinto",
      domain: "riotinto.com",
      logoText: "RIO",
      logoBg: "bg-slate-800 text-rose-500",
      sector: "Metals & Mining",
      regions: ["North America", "Western Europe", "West Africa", "East Asia"],
      partners: ["Canada", "Iceland", "Guinea", "Mongolia"],
      description: "Multinational commodity enterprise extracting high-grade bauxite, copper, and iron ore blocks.",
      localLogo: "/riotinto.svg"
    }
  ],
  belgium: [
    {
      name: "Anheuser-Busch InBev",
      domain: "ab-inbev.com",
      logoText: "ABI",
      logoBg: "bg-amber-600 text-white",
      sector: "Beverages & Brewing",
      regions: ["Global", "North America", "South America", "Europe", "Asia-Pacific"],
      partners: ["United States", "Brazil", "China", "United Kingdom"],
      description: "The world's largest brewer, headquartered in Leuven, managing a massive global portfolio of over 500 beverage brands."
    },
    {
      name: "UCB",
      domain: "ucb.com",
      logoText: "UCB",
      logoBg: "bg-blue-800 text-white",
      sector: "Biopharmaceuticals",
      regions: ["Global", "North America", "Western Europe", "East Asia"],
      partners: ["United States", "Germany", "United Kingdom", "Japan"],
      description: "A global biopharmaceutical company specializing in advanced therapeutic research for severe neurology and immunology disorders."
    },
    {
      name: "Umicore",
      domain: "umicore.com",
      logoText: "UMI",
      logoBg: "bg-teal-700 text-white",
      sector: "Materials Tech & Recycling",
      regions: ["Global", "Europe", "North America", "East Asia"],
      partners: ["Germany", "China", "United States", "South Korea"],
      description: "A global materials technology and circular economy leader, specializing in clean energy catalysts and precious metals recycling."
    }
  ],
  netherlands: [
    {
      name: "Shell",
      domain: "shell.com",
      logoText: "RDS",
      logoBg: "bg-yellow-500 text-red-650",
      sector: "Oil, Gas & Energy",
      regions: ["Global", "Europe", "Americas", "Asia-Pacific"],
      partners: ["United States", "United Kingdom", "Nigeria", "China"],
      description: "One of the world's largest oil and gas supermajors, headquartered in The Hague, managing massive global upstream and downstream energy corridors."
    },
    {
      name: "Heineken",
      domain: "heineken.com",
      logoText: "HEI",
      logoBg: "bg-blue-700 text-white",
      sector: "Beverages & Brewing",
      regions: ["Global", "Europe", "North America", "Latin America", "Africa"],
      partners: ["United States", "Mexico", "Nigeria", "United Kingdom"],
      description: "One of the world's leading brewing corporations, based in Amsterdam, distributing premium beverage portfolios across 190+ countries."
    },
    {
      name: "Unilever",
      domain: "unilever.com",
      logoText: "UNA",
      logoBg: "bg-blue-600 text-white",
      sector: "Consumer Goods & Food",
      regions: ["Global", "Europe", "North America", "Asia-Pacific", "Africa"],
      partners: ["United Kingdom", "United States", "India", "Brazil"],
      description: "A major global fast-moving consumer goods (FMCG) TNC co-headquartered in Rotterdam and London, managing hundreds of household brands."
    },
    {
      name: "ING Group",
      domain: "ing.com",
      logoText: "ING",
      logoBg: "bg-orange-550 text-white",
      sector: "Banking & Financial Services",
      regions: ["Europe", "North America", "Australia", "Asia-Pacific"],
      partners: ["Germany", "Belgium", "United States", "Australia"],
      description: "A massive multinational banking and financial services corporation headquartered in Amsterdam, running key retail and commercial banking networks."
    }
  ],
  brazil: [
    {
      name: "Vale S.A.",
      domain: "vale.com",
      logoText: "VALE",
      logoBg: "bg-teal-900 text-yellow-400",
      sector: "Iron Ore Mining & Logistics",
      regions: ["East Asia", "Western Europe", "North America"],
      partners: ["China", "Germany", "Japan", "United States"],
      description: "Resource giant dominating high-grade iron ore exports, utilizing customized Valemax bulk carrier vessels."
    },
    {
      name: "Embraer",
      domain: "embraer.com",
      logoText: "EMB",
      logoBg: "bg-blue-700 text-white",
      sector: "Aerospace & Jet Production",
      regions: ["North America", "Europe", "East Asia", "Global"],
      partners: ["United States", "Portugal", "China", "Singapore"],
      description: "Pioneering aircraft manufacturer ranking among top global exporters of regional commercial and defense jets."
    }
  ],
  canada: [
    {
      name: "Shopify",
      domain: "shopify.com",
      logoText: "SHOP",
      logoBg: "bg-blue-600 text-white",
      sector: "E-Commerce & Cloud Tech",
      regions: ["Global", "North America", "Western Europe", "Asia-Pacific"],
      partners: ["United States", "United Kingdom", "Australia", "Germany"],
      description: "Global e-commerce platform powering merchant storefronts, coordinating international digital payment systems and retail networks."
    },
    {
      name: "Barrick Gold",
      domain: "barrick.com",
      logoText: "ABX",
      logoBg: "bg-amber-700 text-white",
      sector: "Mining & Heavy Resources",
      regions: ["Global", "Americas", "Africa", "Asia-Pacific"],
      partners: ["United States", "Dominican Republic", "Mali", "Papua New Guinea"],
      description: "One of the world's largest gold producers, extracting high-grade mineral ores from peripheral extraction nodes for global bullion hubs."
    },
    {
      name: "Bombardier Inc.",
      domain: "bombardier.com",
      logoText: "BBD",
      logoBg: "bg-black text-white",
      sector: "Aerospace & Business Jets",
      regions: ["Americas", "Europe", "Asia-Pacific"],
      partners: ["United States", "Mexico", "United Kingdom", "Germany"],
      description: "Aerospace and business jet manufacturer sourcing parts globally, managing customer bases and maintenance hubs."
    },
    {
      name: "Joe Fresh",
      domain: "joefresh.com",
      logoText: "JOE",
      logoBg: "bg-orange-600 text-white",
      sector: "Apparel & Retail",
      regions: ["North America", "Western Europe", "South Asia"],
      partners: ["Bangladesh", "Cambodia", "China", "United States"],
      description: "Fashion brand utilizing global outsourced manufacturing and supply networks, distributing apparel across North American retail grids."
    }
  ],
  mexico: [
    {
      name: "Cemex",
      domain: "cemex.com",
      logoText: "CX",
      logoBg: "bg-sky-900 text-white",
      sector: "Cement & Heavy Aggregates",
      regions: ["North America", "Western Europe", "Middle East"],
      partners: ["United States", "United Kingdom", "Germany", "Egypt"],
      description: "One of the world's leading heavy building suppliers, expanding aggressively into Western infrastructure projects."
    },
    {
      name: "Grupo Bimbo",
      domain: "bimbo.com",
      logoText: "BIM",
      logoBg: "bg-blue-600 text-white",
      sector: "Consumer Food & Bakery",
      regions: ["North America", "South America", "Europe", "East Asia"],
      partners: ["United States", "Brazil", "Spain", "China"],
      description: "The world's largest industrial baking company, maintaining extensive localized production and shipping hubs."
    }
  ],
  drc: [
    {
      name: "Gécamines",
      domain: "gecamines.cd",
      logoText: "GEC",
      logoBg: "bg-blue-900 text-yellow-300",
      sector: "State Cobalt & Copper Mining",
      regions: ["East Asia", "Western Europe"],
      partners: ["China", "Switzerland"],
      description: "State minerals vehicle representing national joint-ventures in the highly strategic, resource-rich Katanga Copperbelt."
    }
  ],
  nigeria: [
    {
      name: "Dangote Cement",
      domain: "dangote.com",
      logoText: "DAN",
      logoBg: "bg-teal-750 text-white",
      sector: "Cement, Refining & Food",
      regions: ["West Africa", "East Africa", "Central Africa"],
      partners: ["Ghana", "Ethiopia", "Cameroon", "Senegal"],
      description: "Sub-Saharan Africa's largest cement exporter, actively integrating regional trade corridors."
    }
  ],
  "south-africa": [
    {
      name: "MTN Group",
      domain: "mtn.co.za",
      logoText: "MTN",
      logoBg: "bg-yellow-400 text-black",
      sector: "Telecomm & Digital Finance",
      regions: ["West Africa", "East Africa", "Middle East"],
      partners: ["Nigeria", "Ghana", "Uganda", "Iran"],
      description: "Leading mobile carrier operator bringing digital communication and micro-finance services to key emerging nations."
    },
    {
      name: "Sasol Limited",
      domain: "sasol.com",
      logoText: "SSL",
      logoBg: "bg-blue-900 text-white",
      sector: "Chemicals & Synthetic Fuels",
      regions: ["North America", "Western Europe", "Southeast Asia"],
      partners: ["United States", "Germany", "Singapore", "Mozambique"],
      description: "Leading synthetic chemical and liquid fuel developer using proprietary Fischer-Tropsch technology."
    }
  ],
  ethiopia: [
    {
      name: "Ethiopian Airlines",
      domain: "ethiopian.com",
      logoText: "ET",
      logoBg: "bg-yellow-500 text-slate-800",
      sector: "Aviation & Cargo Logistics",
      regions: ["Global", "Africa", "Western Europe", "East Asia"],
      partners: ["Nigeria", "Germany", "China", "United States"],
      description: "Continental airline leader transforming Addis Ababa into the chief pan-African logistics and aviation terminal."
    }
  ],
  "saudi-arabia": [
    {
      name: "Saudi Aramco",
      domain: "aramco.com",
      logoText: "ARM",
      logoBg: "bg-blue-700 text-white",
      sector: "Oil, Gas & Chemicals",
      regions: ["Global", "North America", "Europe", "East Asia", "Asia-Pacific"],
      partners: ["United States", "China", "Japan", "South Korea", "India"],
      description: "The world's largest oil producer and energy conglomerate, managing massive global downstream refining networks and logistics hubs."
    },
    {
      name: "stc Group",
      domain: "stc.com.sa",
      logoText: "STC",
      logoBg: "bg-purple-900 text-white",
      sector: "Telecomm & Digital Services",
      regions: ["Middle East", "North Africa", "Gulf States"],
      partners: ["Bahrain", "Kuwait", "Egypt", "Jordan"],
      description: "The largest telecommunications and digital services provider in the Middle East, aggressively expanding its footprint across the MENA region."
    },
    {
      name: "Saudi Binladin Group",
      domain: "sbg.com.sa",
      logoText: "SBG",
      logoBg: "bg-slate-700 text-white",
      sector: "Infrastructure & Engineering",
      regions: ["Middle East", "North Africa", "South Asia", "Southeast Asia"],
      partners: ["Egypt", "Pakistan", "Malaysia", "United Arab Emirates"],
      description: "One of the largest multinational construction and engineering conglomerates in the world, building mega-infrastructure corridors."
    }
  ],
  sudan: [
    {
      name: "Sudapet",
      domain: "sudapet.sd",
      logoText: "SUD",
      logoBg: "bg-blue-800 text-white",
      sector: "Oil Extraction & Pipeline Tech",
      regions: ["East Asia", "Middle East"],
      partners: ["China", "Malaysia"],
      description: "State-owned energy hub supplying raw petroleum to intergovernmental partners through pipeline joint-ventures."
    }
  ],
  chad: [
    {
      name: "SHT Hydrocarbures",
      domain: "sht.td",
      logoText: "SHT",
      logoBg: "bg-blue-600 text-white",
      sector: "Petroleum & Pipeline Assets",
      regions: ["North America", "East Asia"],
      partners: ["United States", "China"],
      description: "National hydrocarbon vehicle coordinating Chadian petroleum logistics and exports through regional pipeline canals."
    }
  ],
  niger: [
    {
      name: "SOPAMIN",
      domain: "sopamin.ne",
      logoText: "SOP",
      logoBg: "bg-amber-600 text-white",
      sector: "Uranium Assets & Exports",
      regions: ["Western Europe", "East Asia"],
      partners: ["France", "China", "South Korea"],
      description: "State uranium holding utility managing critical nuclear energy fuel-grade mineral blocks for global export."
    }
  ],
  iceland: [
    {
      name: "Marel hf.",
      domain: "marel.com",
      logoText: "MAR",
      logoBg: "bg-blue-800 text-white",
      sector: "Food Processing Tech",
      regions: ["Global", "Europe", "North America", "Asia-Pacific"],
      partners: ["United States", "Netherlands", "United Kingdom", "Denmark"],
      description: "A global leader in advanced food processing machinery, software, and systems for the poultry, meat, and fish industries."
    },
    {
      name: "Iceland Seafood International",
      domain: "icelandseafood.com",
      logoText: "ISI",
      logoBg: "bg-sky-600 text-white",
      sector: "Seafood Supply & Marketing",
      regions: ["Europe", "North America", "Global"],
      partners: ["United Kingdom", "Spain", "Germany", "France"],
      description: "A major international supplier and marketer of frozen and fresh seafood products, operating extensive European logistics links."
    },
    {
      name: "Alvotech",
      domain: "alvotech.com",
      logoText: "ALV",
      logoBg: "bg-indigo-700 text-white",
      sector: "Biopharmaceuticals",
      regions: ["Global", "North America", "Europe", "East Asia"],
      partners: ["United States", "Germany", "Japan", "China"],
      description: "A fast-growing biopharmaceutical company focused on the development and commercial manufacturing of biosimilar medicines."
    }
  ],
  egypt: [
    {
      name: "Orascom Construction",
      domain: "orascom-construction.com",
      logoText: "ORAS",
      logoBg: "bg-amber-700 text-white",
      sector: "Infrastructure & Heavy Engineering",
      regions: ["Middle East", "North Africa", "North America", "Sub-Saharan Africa"],
      partners: ["Saudi Arabia", "United Arab Emirates", "United States", "Algeria"],
      description: "A leading global engineering and construction contractor active in building major logistics networks, SCZone ports, and industrial installations."
    },
    {
      name: "Elsewedy Electric",
      domain: "elsewedyelectric.com",
      logoText: "SWDY",
      logoBg: "bg-blue-800 text-white",
      sector: "Energy Cables & Infrastructure",
      regions: ["Africa", "Middle East", "Europe"],
      partners: ["Tanzania", "Saudi Arabia", "Germany", "United Arab Emirates"],
      description: "An integrated energy solutions provider manufacturing high-voltage electric cables, transformers, and green infrastructure grids across 110+ markets."
    }
  ],
  ukraine: [
    {
      name: "Metinvest Group",
      domain: "metinvest.ua",
      logoText: "MET",
      logoBg: "bg-red-800 text-white",
      sector: "Metallurgy & Mining TNC",
      regions: ["Europe", "North America", "Middle East"],
      partners: ["Italy", "Poland", "Germany", "United Kingdom"],
      description: "An international vertically integrated mining and metals company with major steel mills in Ukraine and processing rollers in Italy and raw coal pipelines in the USA."
    },
    {
      name: "Kernel Holding S.A.",
      domain: "kernel.ua",
      logoText: "KERN",
      logoBg: "bg-yellow-600 text-white",
      sector: "Grain & Sunflower Oil Agro-conglomerate",
      regions: ["Europe", "East Asia", "North Africa", "North America"],
      partners: ["Poland", "China", "India", "Turkey"],
      description: "A prominent agricultural global TNC and the world's largest exporter of sunflower oil, managing millions of hectares of farming Steppes and Black Sea port elevators."
    }
  ],
  ireland: [
    {
      name: "Ryanair",
      domain: "ryanair.com",
      logoText: "RYA",
      logoBg: "bg-blue-800 text-yellow-400",
      sector: "Aviation & Low-Cost Transit",
      regions: ["Western Europe", "Central Europe", "North Africa"],
      partners: ["United Kingdom", "Spain", "Italy", "Germany"],
      description: "Europe's largest low-cost airline, pioneered short-haul budget aviation networks, significantly lowering transit friction across the EU."
    },
    {
      name: "Kerry Group",
      domain: "kerrygroup.com",
      logoText: "KER",
      logoBg: "bg-blue-600 text-white",
      sector: "Food Ingredients & Flavors",
      regions: ["Global", "North America", "Europe", "Asia-Pacific"],
      partners: ["United States", "United Kingdom", "China", "Brazil"],
      description: "Major global taste and nutrition TNC supplying custom flavor formulas to food manufacturing and packaging firms worldwide."
    },
    {
      name: "Guinness",
      domain: "guinness.com",
      logoText: "GUI",
      logoBg: "bg-black text-amber-400",
      sector: "Beverages & Brewing",
      regions: ["Global", "Europe", "North America", "Africa"],
      partners: ["United Kingdom", "United States", "Nigeria", "Cameroon"],
      description: "Historic Irish stout brewer, now a major global brand owned by Diageo, representing significant cultural soft power."
    }
  ],
  japan: [
    {
      name: "Toyota Motor",
      domain: "toyota.com",
      logoText: "TM",
      logoBg: "bg-red-650 text-white",
      sector: "Automotive & Mobility",
      regions: ["Global", "North America", "Europe", "Asia-Pacific"],
      partners: ["United States", "China", "Thailand", "Germany"],
      description: "World's largest automaker by volume, pioneer of the Just-In-Time (JIT) production system, maintaining massive global parts supply networks."
    },
    {
      name: "Sony Group",
      domain: "sony.com",
      logoText: "SONY",
      logoBg: "bg-black text-white",
      sector: "Consumer Tech & Entertainment",
      regions: ["Global", "North America", "Europe", "East Asia"],
      partners: ["United States", "China", "United Kingdom", "South Korea"],
      description: "Multinational conglomerate leading in gaming, entertainment, and image sensors, coordinating multi-stage outsourced manufacturing."
    }
  ],
  uae: [
    {
      name: "Emirates Group",
      domain: "emirates.com",
      logoText: "EK",
      logoBg: "bg-red-700 text-white",
      sector: "Aviation & Tourism Logistics",
      regions: ["Global", "Middle East", "Europe", "North America", "Asia-Pacific", "Africa"],
      partners: ["United Kingdom", "United States", "India", "Germany"],
      description: "Based in Dubai, this TNC operates the globally recognized Emirates Airlines, linking over 150 cities across six continents to its hub."
    },
    {
      name: "DP World",
      domain: "dpworld.com",
      logoText: "DPW",
      logoBg: "bg-blue-900 text-white",
      sector: "Maritime & Supply Chain Logistics",
      regions: ["Global", "Middle East", "Europe", "Asia-Pacific", "Americas", "Africa"],
      partners: ["United Kingdom", "India", "Canada", "Australia"],
      description: "Headquartered in Dubai, this logistics giant operates marine and inland terminals, economic zones, and smart supply chain operations in over 75 countries."
    },
    {
      name: "ADNOC",
      domain: "adnoc.ae",
      logoText: "ADN",
      logoBg: "bg-sky-700 text-white",
      sector: "Oil, Gas & Petrochemicals",
      regions: ["Global", "Middle East", "Asia-Pacific", "Europe", "Americas"],
      partners: ["Japan", "India", "China", "Germany"],
      description: "A primary energy and petrochemical TNC, ADNOC operates a vast international network of downstream ventures, joint-venture refineries, and trading operations."
    }
  ],
  france: [
    {
      name: "TotalEnergies",
      domain: "totalenergies.com",
      logoText: "TOT",
      logoBg: "bg-blue-600 text-white",
      sector: "Energy & Petrochemicals",
      regions: ["Global", "Europe", "Africa", "Middle East", "Americas"],
      partners: ["Saudi Arabia", "Angola", "Qatar", "United States", "Nigeria"],
      description: "One of the world's seven supermajor oil and gas companies, active in oil, gas, and green electricity."
    },
    {
      name: "Airbus",
      domain: "airbus.com",
      logoText: "AIR",
      logoBg: "bg-indigo-900 text-white",
      sector: "Aerospace & Defense",
      regions: ["Global", "Europe", "Americas", "Asia-Pacific"],
      partners: ["Germany", "United Kingdom", "Spain", "United States", "China"],
      description: "A European aerospace giant headquartered in Toulouse, leading commercial aircraft manufacturing and satellite arrays."
    },
    {
      name: "L'Oréal",
      domain: "loreal.com",
      logoText: "LOR",
      logoBg: "bg-amber-800 text-white",
      sector: "Cosmetics & Consumer Goods",
      regions: ["Global", "North America", "Europe", "East Asia", "Latin America"],
      partners: ["United States", "China", "Brazil", "Japan"],
      description: "The world's largest cosmetics company, managing global retail webs and holding extensive intellectual property in consumer beauty."
    }
  ],
  kenya: [
    {
      name: "Safaricom",
      domain: "safaricom.co.ke",
      logoText: "SFC",
      logoBg: "bg-green-600 text-white",
      sector: "Telecomm & Mobile Money",
      regions: ["East Africa", "Sub-Saharan Africa"],
      partners: ["United Kingdom (Vodafone)", "Ethiopia", "Tanzania"],
      description: "East Africa's mobile communications giant, pioneering the globally renowned M-Pesa mobile payment and financial services network."
    },
    {
      name: "Kenya Airways",
      domain: "kenya-airways.com",
      logoText: "KQ",
      logoBg: "bg-red-700 text-white",
      sector: "Aviation & Cargo Logistics",
      regions: ["Africa", "Europe", "Middle East", "Asia"],
      partners: ["Netherlands (KLM)", "South Africa", "United Kingdom", "United States"],
      description: "A major African airline coordinating regional cargo and passenger corridors, positioning Nairobi as a strategic logistics hub."
    }
  ],
  peru: [
    {
      name: "Compañía de Minas Buenaventura",
      domain: "buenaventura.com",
      logoText: "BVN",
      logoBg: "bg-yellow-600 text-white",
      sector: "Mining & Metallurgy",
      regions: ["Americas", "Europe", "East Asia"],
      partners: ["United States", "China", "Switzerland", "Germany"],
      description: "A premier Peruvian precious metals mining company, exporting gold, silver, and copper to international smelting markets."
    },
    {
      name: "Alicorp",
      domain: "alicorp.com.pe",
      logoText: "ALI",
      logoBg: "bg-red-800 text-white",
      sector: "FMCG & Food Processing",
      regions: ["South America", "Central America"],
      partners: ["Ecuador", "Bolivia", "Chile", "Colombia"],
      description: "Peru's largest consumer goods and agribusiness giant, exporting food, home care, and industrial animal feed across the Andean region."
    }
  ],
  rwanda: [
    {
      name: "RwandAir",
      domain: "rwandair.com",
      logoText: "RWR",
      logoBg: "bg-teal-700 text-white",
      sector: "Aviation & Tourism Logistics",
      regions: ["Africa", "Europe", "Middle East", "South Asia"],
      partners: ["Qatar Airways", "Belgium", "United Arab Emirates", "South Africa"],
      description: "Fast-growing state-owned national carrier linking Kigali to key European, Gulf, and continental economic centers."
    },
    {
      name: "Rwanda Mountain Tea",
      domain: "rwandamountaintea.com",
      logoText: "RMT",
      logoBg: "bg-blue-800 text-white",
      sector: "Agriculture & Commodity Trade",
      regions: ["Global", "Europe", "Middle East", "South Asia"],
      partners: ["United Kingdom", "Pakistan", "Egypt", "United Arab Emirates"],
      description: "A major private tea exporter operating tea estates and factories, sending high-grade black tea to global commodity auctions."
    }
  ],
  singapore: [
    {
      name: "Singtel",
      domain: "singtel.com",
      logoText: "SGT",
      logoBg: "bg-red-600 text-white",
      sector: "Telecommunications & Digital Infrastructure",
      regions: ["Southeast Asia", "Asia-Pacific", "Global"],
      partners: ["Australia", "India", "Indonesia", "Philippines", "Thailand"],
      description: "A leading global communications group coordinating undersea optical cable arrays and key regional mobile network operators."
    },
    {
      name: "Keppel Corporation",
      domain: "keppel.com",
      logoText: "KEP",
      logoBg: "bg-indigo-900 text-white",
      sector: "Marine, Energy & Real Estate",
      regions: ["Global", "Americas", "Europe", "Asia-Pacific"],
      partners: ["Brazil", "China", "United States", "Vietnam"],
      description: "A global infrastructure giant specialized in offshore marine engineering, green energy development, and urban solutions."
    }
  ],
  thailand: [
    {
      name: "PTT Public Company",
      domain: "pttplc.com",
      logoText: "PTT",
      logoBg: "bg-blue-600 text-white",
      sector: "Oil, Gas & Petrochemicals",
      regions: ["Southeast Asia", "East Asia", "Global"],
      partners: ["China", "Japan", "Singapore", "Vietnam"],
      description: "State-owned Thai energy conglomerate running extensive gas transmission networks, international petrochemical processing, and retail networks."
    },
    {
      name: "CP Group",
      domain: "cpgroupglobal.com",
      logoText: "CPG",
      logoBg: "bg-amber-600 text-white",
      sector: "Agribusiness, Retail & Telecom",
      regions: ["Southeast Asia", "East Asia", "Europe", "Americas"],
      partners: ["China", "United States", "Vietnam", "Belgium", "United Kingdom"],
      description: "One of the world's largest conglomerates, leading global shrimp and poultry processing, convenience store franchises, and digital services."
    }
  ],
  turkey: [
    {
      name: "Koç Holding",
      domain: "koc.com.tr",
      logoText: "KOC",
      logoBg: "bg-red-700 text-white",
      sector: "Industrial Conglomerate",
      regions: ["Europe", "Middle East", "Central Asia", "North America"],
      partners: ["Germany", "Italy", "United Kingdom", "Romania"],
      description: "Turkey's largest industrial and service conglomerate, dominant in automotive exports (Tofaş), household appliances (Arçelik), and energy refining."
    },
    {
      name: "Turkish Airlines",
      domain: "turkishairlines.com",
      logoText: "TK",
      logoBg: "bg-red-800 text-white",
      sector: "Aviation & Cargo Logistics",
      regions: ["Global", "Europe", "Americas", "Africa", "Asia"],
      partners: ["Germany", "United States", "United Kingdom", "Saudi Arabia"],
      description: "Global national carrier flying to more countries than any other airline, transforming Istanbul Airport into a premier trans-continental transit node."
    }
  ],
  tuvalu: [
    {
      name: "Tuvalu Philatelic Bureau",
      domain: "tuvalustamps.com",
      logoText: "TPB",
      logoBg: "bg-blue-500 text-white",
      sector: "Philately & Domain Licensing",
      regions: ["Global", "North America", "Europe", "Asia-Pacific"],
      partners: ["United States", "Australia", "United Kingdom", "Japan"],
      description: "Governs the licensing of Tuvalu's iconic collectible stamp products and coordinate global lease operations for the high-value '.tv' country-code web domain."
    }
  ]
};

interface EconomyTabProps {
  data: DPPlaceProfile["economy_tab"];
  countryId: string;
  currentYear: number;
  informalEconomyPctGdp: number;
}

export function EconomyTab({ data, countryId, currentYear, informalEconomyPctGdp }: EconomyTabProps) {
  const [groupServices, setGroupServices] = useState(false);
  const emp = data.employment_structure;

  const stats = useMemo(() => {
    return getInterpolatedStats(countryId, currentYear);
  }, [countryId, currentYear]);

  const employmentRate = useMemo(() => {
    return Number((100 - stats.unemploymentRate).toFixed(1));
  }, [stats.unemploymentRate]);

  const activeTncList = useMemo(() => {
    return tncProfiles[countryId.toLowerCase()] || [];
  }, [countryId]);

  const chartData = groupServices
    ? [
        { name: "Primary", value: emp.primary, color: "#d97706" }, // Amber/Earth
        { name: "Secondary", value: emp.secondary, color: "#34d399" }, // Light blue
        { name: "Tertiary/Quaternary", value: emp.tertiary + emp.quaternary, color: "#064e3b" }, // Deep blue
      ]
    : [
        { name: "Primary", value: emp.primary, color: "#d97706" },
        { name: "Secondary", value: emp.secondary, color: "#34d399" },
        { name: "Tertiary", value: emp.tertiary, color: "#10b981" }, // Medium blue
        { name: "Quaternary", value: emp.quaternary, color: "#064e3b" },
      ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Structural Sector Profile</CardTitle>
            <label className="flex items-center cursor-pointer space-x-2">
              <span className="text-xs font-medium text-slate-500 pt-1">Group Service/Knowledge Sectors</span>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in pt-1">
                <input 
                  type="checkbox" 
                  checked={groupServices} 
                  onChange={() => setGroupServices(!groupServices)}
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-blue-600 z-10 transition-transform duration-200 ease-in-out"
                  style={{ right: groupServices ? '0' : '1.25rem', top: '0.25rem' }}
                />
                <div className={`toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer ${groupServices ? 'bg-blue-200' : ''}`}></div>
              </div>
            </label>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Labor Market & Employment Profile */}
        <Card className="hover:border-indigo-400 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Labor Market Profile ({currentYear})
              </CardTitle>
              <Badge variant="outline" className="text-[#2563eb] border-blue-100 bg-blue-50">
                Interpolated Estimate
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500">
              Active employment rate estimates for {currentYear} based on demographic transition models.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employment Rate</span>
                <div className="text-3xl font-black text-[#2563eb] mt-1.5">
                  {employmentRate}%
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-medium">Of active labor force.</span>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unemployment Rate</span>
                <div className="text-3xl font-black text-indigo-600 mt-1.5">
                  {stats.unemploymentRate}%
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-medium">Seeking active work.</span>
              </div>
            </div>

            {/* Informal Economy Component inside the Labor Market profile card */}
            <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">Informal Economy Scale</span>
                <span className="font-extrabold text-[#2563eb] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                  {informalEconomyPctGdp}% GDP
                </span>
              </div>
              <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${informalEconomyPctGdp}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                * Percentages represent output estimation outside normal regulatory tax controls.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Commodity Profile (% GDP)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 tracking-tighter uppercase mb-3 border-b pb-1">Top Exports</h4>
              <ul className="space-y-2">
                {data.trade_ledger.main_exports.map((e, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="truncate pr-2">{e.commodity}</span>
                    <Badge variant="secondary">{e.pct_gdp}%</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 tracking-tighter uppercase mb-3 border-b pb-1">Top Imports</h4>
              <ul className="space-y-2">
                {data.trade_ledger.main_imports.map((e, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="truncate pr-2">{e.commodity}</span>
                    <Badge variant="outline">{e.pct_gdp}%</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Core-Periphery Bilateral Flows</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-8">
            <div>
               <h4 className="text-[10px] font-black text-slate-400 tracking-tighter uppercase mb-3 border-b pb-1">Outgoing (Destination)</h4>
               <ul className="space-y-2">
                {data.trade_ledger.top_partners_outgoing.slice(0, 4).map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span>{p.partner}</span>
                    <span className="text-xs font-mono">${p.value_usd_billions}B</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
               <h4 className="text-[10px] font-black text-slate-400 tracking-tighter uppercase mb-3 border-b pb-1">Incoming (Source)</h4>
               <ul className="space-y-2">
                {data.trade_ledger.top_partners_incoming.slice(0, 4).map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span>{p.partner}</span>
                    <span className="text-xs font-mono">${p.value_usd_billions}B</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Global TNC Profiles & Export Footprints */}
        <Card className="hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Key Exporting TNCs & Global Footprints
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-slate-50 font-bold border-slate-200">
                TNC Profiles
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
              Major headquarter transnational corporations (TNCs) coordinating geographic value chains, outsourced manufacturing webs, and resource corridors.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {activeTncList.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">Data unavailable for this selection.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-4 py-3 text-center w-12">Logo</th>
                      <th className="px-4 py-3 min-w-[130px]">Corporation</th>
                      <th className="px-4 py-3 min-w-[110px]">Sector</th>
                      <th className="px-4 py-3 min-w-[200px]">Geographic Value Chain</th>
                      <th className="px-4 py-3 min-w-[160px]">Key Hubs & Markets</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                    {activeTncList.map((tnc, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="px-4 py-3 text-center align-middle">
                          <div className="flex justify-center">
                            <TncLogo
                              domain={tnc.domain}
                              name={tnc.name}
                              logoText={tnc.logoText}
                              logoBg={tnc.logoBg}
                              localLogo={tnc.localLogo}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold align-middle">
                          <div className="text-slate-800 font-extrabold leading-none">{tnc.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono font-medium mt-1 select-all">{tnc.domain}</div>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <Badge variant="outline" className="text-[9px] font-bold bg-slate-50 text-slate-600 border-slate-200">
                            {tnc.sector}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500 leading-relaxed font-semibold align-middle">
                          {tnc.description}
                        </td>
                        <td className="px-4 py-3 align-middle space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight mr-1">Markets:</span>
                            {tnc.regions.map((reg, rIdx) => (
                              <Badge key={rIdx} variant="secondary" className="text-[9px] font-medium px-1.5 py-0 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/50">
                                {reg}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight mr-1">Hubs:</span>
                            {tnc.partners.map((pt, pIdx) => (
                              <Badge key={pIdx} variant="outline" className="text-[9px] font-bold px-1.5 py-0 border-blue-100 bg-blue-50/70 text-blue-700">
                                {pt}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trade, Debt & Multilateral Dependency Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-slate-200/80 shadow-md">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600 animate-pulse" />
                  Macroeconomic Indicators: Trade Alignments & Financial Dependencies
                </CardTitle>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Structural analysis of institutional trade, sovereign debt obligations, and credit conditionalities
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const md = `### Institutional Alignment & Trade Integration
| Indicator | Country Data Details |
| :--- | :--- |
| **Trade Blocs** | ${economyIndicatorsData[countryId]?.trade_blocs || "Data Unavailable"} |
| **WTO Membership Status** | ${economyIndicatorsData[countryId]?.wto_status || "Data Unavailable"} |

### Debt Profile & Fiscal Constraints
| Indicator | Country Data Details |
| :--- | :--- |
| **Sovereign Debt (% of GDP)** | ${economyIndicatorsData[countryId]?.sovereign_debt || "Data Unavailable"} |
| **Active Austerity Measures** | ${economyIndicatorsData[countryId]?.active_austerity || "Data Unavailable"} |

### Financial Aid & Multilateral Dependency
| Indicator | Country Data Details |
| :--- | :--- |
| **Aid Status (Donor/Recipient)** | ${economyIndicatorsData[countryId]?.aid_status || "Data Unavailable"} |
| **IMF Structural Program & Conditionality** | ${economyIndicatorsData[countryId]?.imf_program || "Data Unavailable"} |`;
                    navigator.clipboard.writeText(md);
                    const btn = document.activeElement as HTMLButtonElement;
                    if (btn) btn.innerText = "✓ Copied Markdown!";
                    setTimeout(() => {
                      if (btn) btn.innerText = "Copy Raw MD";
                    }, 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all border border-slate-200/60 cursor-pointer shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Copy Raw MD
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {!economyIndicatorsData[countryId] ? (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Data Unavailable</h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">Specific economic indicators are not loaded for this country profile yet.</p>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8">
                {/* Visual grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Section 1: Trade Alignment */}
                  <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black uppercase text-blue-500 tracking-widest leading-none">Alignment</h4>
                        <h3 className="text-xs font-bold text-slate-800 mt-1">Trade Integration</h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="block text-[12px] font-black uppercase text-slate-400 tracking-wider">Trade Blocs</span>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-1">
                          {economyIndicatorsData[countryId].trade_blocs}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <span className="block text-[12px] font-black uppercase text-slate-400 tracking-wider">WTO Membership Status</span>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-1">
                          {economyIndicatorsData[countryId].wto_status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Debt & Austerity */}
                  <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-xs hover:border-amber-300 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <div className="bg-amber-50 text-amber-600 p-2 rounded-xl border border-amber-100 shrink-0">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black uppercase text-amber-500 tracking-widest leading-none">Fiscal</h4>
                        <h3 className="text-xs font-bold text-slate-800 mt-1">Debt & Spending</h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="block text-[12px] font-black uppercase text-slate-400 tracking-wider">Sovereign Debt (% of GDP)</span>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-1">
                          {economyIndicatorsData[countryId].sovereign_debt}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <span className="block text-[12px] font-black uppercase text-slate-400 tracking-wider">Active Austerity Measures</span>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-1">
                          {economyIndicatorsData[countryId].active_austerity}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Financial Aid & IMF */}
                  <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl border border-indigo-100 shrink-0">
                        <HeartHandshake className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black uppercase text-indigo-500 tracking-widest leading-none">Dependency</h4>
                        <h3 className="text-xs font-bold text-slate-800 mt-1">Aid & IMF Program</h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="block text-[12px] font-black uppercase text-slate-400 tracking-wider">Aid Status (Donor/Recipient)</span>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-1">
                          {economyIndicatorsData[countryId].aid_status}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <span className="block text-[12px] font-black uppercase text-slate-400 tracking-wider">IMF Structural Program & Conditionality</span>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-1">
                          {economyIndicatorsData[countryId].imf_program}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Direct Syllabus Alignment Banner */}
                <div className="border border-slate-150 bg-slate-50/50 rounded-2xl p-4 flex gap-3 items-start">
                  <FileText className="w-5 h-5 text-slate-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider font-sans">Geography Syllabus Focus • Financial Flows & Sovereignty</h5>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      This analysis highlights how states manage fiscal constraints, structural debt dependencies (internal vs. external components), 
                      and the associated policy loss of sovereignty mandated under multilateral structures like the IMF. Trade alignments indicate regional 
                      and core-periphery spatial integration.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>



    </div>
  );
}
