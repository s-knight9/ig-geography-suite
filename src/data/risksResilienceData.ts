export interface CountryProfile {
  name: string;
  region: string;
  income: string;
  climate: {
    carbonOverall: string;
    carbonPerCapita: string;
    vulnerabilities: string[];
  };
  seismic: {
    tectonicBoundaries: string;
    threatMechanisms: string;
  };
  geopolitical: {
    vulnerabilities: string[];
  };
  demographic: {
    vulnerabilities: string[];
  };
}

export const risksResilienceData: Record<string, CountryProfile> = {
  "australia": {
    name: "Australia",
    region: "Asia-Pacific",
    income: "High Income",
    climate: {
      carbonOverall: "380.5 megatons CO2",
      carbonPerCapita: "14.5 tonnes CO2",
      vulnerabilities: [
        "Severe lengthening and intensification of the 'Black Summer' bushfire season driven by positive Indian Ocean Dipole anomalies.",
        "Widespread coral bleaching across the Great Barrier Reef system caused by sea surface temperature anomalies in the Coral Sea.",
        "Advanced desertification and severe soil salinization within the Murray-Darling Basin agricultural food basket."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits centrally on the Indo-Australian Plate, remote from active plate boundaries but bordered by the Pacific and Eurasian plates to the north and east.",
      threatMechanisms: "Susceptible to intraplate crustal stress release, leading to moderate, shallow crustal earthquakes along ancient faults such as the Cadell Fault and regional shear zones."
    },
    geopolitical: {
      vulnerabilities: [
        "Heavy dependency on the Lombok and Sunda straits for critical natural gas and bulk agricultural commodity export transit.",
        "High trade exposure to China for mineral exports (coal, iron ore), leaving economy vulnerable to South China Sea maritime disputes.",
        "Vast, porous Exclusive Economic Zone (EEZ) demanding heavy naval resource allocation for border enforcement and fisheries protection."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Extreme urban centralization, with over 60% of the population clustered in the Sydney-Melbourne-Brisbane coastal corridors.",
        "Sub-replacement fertility rate (TFR of 1.6) leading to an aging workforce, offset by heavy reliance on skilled migration intakes.",
        "Rural depopulation and service gridlocks in remote Indigenous communities, accelerating youth brain drain to metropolitan centers."
      ]
    }
  },
  "bangladesh": {
    name: "Bangladesh",
    region: "Asia-Pacific",
    income: "Lower-Middle Income",
    climate: {
      carbonOverall: "112.4 megatons CO2",
      carbonPerCapita: "0.66 tonnes CO2",
      vulnerabilities: [
        "Severe salinization of coastal groundwater aquifers in the Sundarbans region, destroying arable deltaic soils.",
        "High vulnerability to tropical cyclonic surges in the Bay of Bengal, regularly inundating low-lying deltaic chars.",
        "Unpredictable monsoon shifts triggering devastating fluvial flooding along the Brahmaputra-Ganges river corridor."
      ]
    },
    seismic: {
      tectonicBoundaries: "Positioned at the highly complex, active junction of the Indian Plate, Eurasian Plate, and the Burma Microplate.",
      threatMechanisms: "Vulnerable to catastrophic megathrust earthquakes along the Dauki Fault and the locked fold-and-thrust belt of the Indo-Burmese wedge."
    },
    geopolitical: {
      vulnerabilities: [
        "Frictional transboundary water sharing disputes with India over the management of the Farakka Barrage on the Ganges River.",
        "Protracted refugee crisis and regional instability in the Cox's Bazar district bordering Myanmar's Rakhine State.",
        "Porous border corridors with India prone to smuggling, land disputes, and illegal migration friction."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Critical population density (exceeding 1,200 people/km²), putting unsustainable pressure on agricultural land and resources.",
        "Massive, unchecked rural-to-urban migration flows centered on Dhaka, overloading city sanitation and housing grids.",
        "High youth dependency ratio (median age ~28) driving domestic employment shortages and outward labor migration."
      ]
    }
  },
  "belgium": {
    name: "Belgium",
    region: "Europe",
    income: "High Income",
    climate: {
      carbonOverall: "95.2 megatons CO2",
      carbonPerCapita: "8.1 tonnes CO2",
      vulnerabilities: [
        "Low-lying coastal vulnerability in Flanders to North Sea storm surges, demanding massive dike infrastructure.",
        "Severe summer river flooding risks along the Meuse and Scheldt river basins due to flash precipitation events.",
        "Intense urban heat island effects in Brussels during increasingly frequent European summer heatwaves."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits on the stable interior of the Eurasian Plate, but faces tectonic stress from the nearby Lower Rhine Graben rift system.",
      threatMechanisms: "Susceptible to intraplate earthquakes along the Hockay Fault Zone, capable of releasing shallow crustal energy."
    },
    geopolitical: {
      vulnerabilities: [
        "Critical dependency on the Zeebrugge LNG terminal for natural gas imports and energy security mapping.",
        "Sovereign trade exposure via the Port of Antwerp, a primary European maritime gateway vulnerable to shipping disruptions.",
        "Frictional administrative decentralization between Flanders and Wallonia, complicating nationwide risk planning."
      ]
    },
    demographic: {
      vulnerabilities: [
        "High old-age dependency ratio as the baby-boomer cohort retires, straining state pension and healthcare budgets.",
        "Socio-spatial segregation and high youth unemployment in post-industrial urban centers such as Charleroi and Liège.",
        "Low birth rates in Wallonia leading to regional demographic stagnation, offset only by metropolitan migration."
      ]
    }
  },
  "brazil": {
    name: "Brazil",
    region: "Americas",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "480.1 megatons CO2",
      carbonPerCapita: "2.2 tonnes CO2",
      vulnerabilities: [
        "Accelerating Amazon rainforest dieback and savannah conversion due to shifts in the South American monsoon system.",
        "Prolonged agricultural drought in the Cerrado soy-belt, reducing crop yields and hydroelectric reservoir capacities.",
        "Devastating mudslides and flash floods in Rio de Janeiro and São Paulo favelas during intense summer storms."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits centrally on the stable South American Plate, far from active plate margins.",
      threatMechanisms: "Seismically stable, but prone to rare, low-magnitude intraplate tremors triggered by localized stress release along ancient faults like the Sobral fault zone."
    },
    geopolitical: {
      vulnerabilities: [
        "Porous land borders stretching across 10 South American nations, complicating security and anti-trafficking efforts.",
        "International pressure and diplomatic friction regarding environmental sovereignty and deforestation regulation in the Amazon.",
        "Maritime vulnerability in the Atlantic 'Blue Amazon' zone, requiring naval protection for offshore pre-salt oil fields."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Rapidly falling fertility rate (TFR of 1.65), closing the country's demographic window of opportunity prematurely.",
        "Persistent urban-suburban socio-economic segregation, feeding massive informal favela growths in major metropolises.",
        "Extreme regional disparity between the affluent South/Southeast and the underdeveloped, drought-prone Northeast."
      ]
    }
  },
  "canada": {
    name: "Canada",
    region: "Americas",
    income: "High Income",
    climate: {
      carbonOverall: "540.3 megatons CO2",
      carbonPerCapita: "14.2 tonnes CO2",
      vulnerabilities: [
        "Rapid permafrost thawing in the Yukon and Northwest Territories, undermining northern transport and pipeline corridors.",
        "Catastrophic wild fire seasons in boreal forests, threatening timber yields and creating cross-border air pollution hazards.",
        "Increasing ocean acidification and warming in the Gulf of St. Lawrence, threatening major commercial fisheries."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits on the North American Plate, bordering the Juan de Fuca Plate (Cascadia Subduction Zone) and the Pacific Plate to the west.",
      threatMechanisms: "Vulnerable to a major megathrust earthquake and tsunami along the Cascadia Subduction Zone, and strike-slip faults along the Queen Charlotte Fault."
    },
    geopolitical: {
      vulnerabilities: [
        "Arctic sovereignty disputes over the Northwest Passage as ice melt increases international shipping accessibility.",
        "High economic trade dependency on a single market via pipeline and rail links to the United States.",
        "Vulnerability of remote northern resource corridors to infrastructure failures and supply chain isolation."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Ultra-low fertility rate (TFR of 1.4) leading to rapid natural population decline, offset only by aggressive economic migration.",
        "Straining elderly dependency ratio as the large baby-boomer generation ages, threatening fiscal stability.",
        "Severe housing density crises in major metropolitan hubs (Toronto, Vancouver) due to rapid urban immigration."
      ]
    }
  },
  "venezuela": {
    name: "Venezuela",
    region: "Americas",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "82.5 megatons CO2",
      carbonPerCapita: "2.8 tonnes CO2",
      vulnerabilities: [
        "Extreme dry spells associated with El Niño events, severely depleting the Guri Reservoir which supplies over 70% of national electricity.",
        "Increased frequency of severe mudslides and flash floods along the steep coastal Cordillera de la Costa during heavy rainfall seasons.",
        "Severe soil degradation and drying of agricultural zones in the Llanos plains due to shifting precipitation patterns."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits on the boundary zone between the Caribbean Plate and the South American Plate, marked by the active strike-slip Boconó Fault.",
      threatMechanisms: "Vulnerable to major right-lateral strike-slip earthquakes along the Boconó and San Sebastián fault systems, posing high risk to informal mountain settlements in Caracas."
    },
    geopolitical: {
      vulnerabilities: [
        "Severe economic sanctions and isolation limiting access to global financial markets and technology imports for infrastructure upkeep.",
        "Long-standing territorial disputes over the Essequibo region, increasing regional military tensions and border friction.",
        "High vulnerability to illegal armed groups and cross-border drug smuggling operations in remote states like Apure."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Massive outward migration of over 7.7 million citizens, causing severe brain drain and loss of working-age population.",
        "Severe drop in living standards and public health infrastructure leading to a decline in life expectancy and maternal health indicators.",
        "Skewed age structure in local communities, leaving behind high dependency ratios of children and the elderly."
      ]
    }
  },
  "chad": {
    name: "Chad",
    region: "Africa",
    income: "Low Income",
    climate: {
      carbonOverall: "1.5 megatons CO2",
      carbonPerCapita: "0.09 tonnes CO2",
      vulnerabilities: [
        "Unprecedented evaporation and shrinkage of the Lake Chad basin, decimating local fishing and agricultural economies.",
        "Encroachment of the Sahara Desert southwards, reducing arable farming belts and triggering soil erosion.",
        "Extreme seasonal droughts in the Sahelian zone, causing chronic food insecurity and famine risks."
      ]
    },
    seismic: {
      tectonicBoundaries: "Located on the stable interior of the African Plate, far from any plate boundaries.",
      threatMechanisms: "Seismically inactive; tectonic threats are limited to minor volcanic faulting in the northern Tibesti Mountains."
    },
    geopolitical: {
      vulnerabilities: [
        "Landlocked geography, forcing reliance on Cameroon's port corridors for fuel and mineral trade transit.",
        "Severe regional borders instability, with active conflicts in neighboring Sudan, Libya, and the Central African Republic.",
        "Security threats from armed insurgent factions and Boko Haram militancy around the Lake Chad basin."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Extremely high fertility rate (TFR of 5.6) causing unsustainable population growth relative to infrastructure.",
        "Critical youth dependency ratio, with over 45% of the population under the age of 15, straining basic schooling.",
        "Severe internally displaced person (IDP) and refugee pressures from Darfur, overloading national aid networks."
      ]
    }
  },
  "china": {
    name: "China",
    region: "Asia-Pacific",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "11,400.0 megatons CO2",
      carbonPerCapita: "8.0 tonnes CO2",
      vulnerabilities: [
        "Desertification in the Inner Mongolia region, sending severe spring dust storms into Beijing and the North China Plain.",
        "Glacial retreat in the Tibetan Plateau headwaters, threatening the long-term water flow of the Yangtze and Yellow rivers.",
        "Sea level rise and extreme typhoons threatening the high-density economic hubs of the Pearl and Yangtze River Deltas."
      ]
    },
    seismic: {
      tectonicBoundaries: "Complex positioning on the Eurasian Plate, undergoing intense compression from the colliding Indian Plate to the south.",
      threatMechanisms: "High risk of destructive earthquakes along active thrust faults, notably the Longmenshan Fault (source of Sichuan quakes) and the Altyn Tagh fault."
    },
    geopolitical: {
      vulnerabilities: [
        "High maritime dependency on the 'Malacca Strait dilemma' for Middle Eastern oil imports and shipping routes.",
        "Maritime boundary conflicts and sovereignty disputes in the South China Sea and the East China Sea.",
        "Frictional land boundaries with India in the Himalayan Ladakh and Arunachal Pradesh sectors."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Advanced demographic contraction and rapid aging following decades of the One Child Policy.",
        "Severe labor force shrinkage, threatening the country's manufacturing-based economic model.",
        "Urban-rural wealth divides and internal migration controls (Hukou system) limiting social mobility."
      ]
    }
  },
  "cuba": {
    name: "Cuba",
    region: "Americas",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "30.5 megatons CO2",
      carbonPerCapita: "2.7 tonnes CO2",
      vulnerabilities: [
        "High vulnerability to category 4 and 5 hurricane landfalls, causing widespread grid failure and crop damage.",
        "Severe coastal flooding and saltwater intrusion in Havana's low-lying urban waterfront during storm surges.",
        "Prolonged agricultural drought in the eastern provinces, threatening sugar cane and tobacco cultivation."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits on the boundary between the North American Plate and the Caribbean Plate.",
      threatMechanisms: "Vulnerable to earthquakes along the Oriente Fault Zone, a major strike-slip boundary running off the southern coast."
    },
    geopolitical: {
      vulnerabilities: [
        "Severe trade constraints and economic isolation due to the long-standing United States trade embargo.",
        "Heavy dependency on imports for basic food supplies and refined petroleum, leaving economy fragile.",
        "Strategic vulnerability to shifting geopolitical alignments and debt pressures from creditor nations like China."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Lowest fertility rate in Latin America (TFR of 1.4) leading to negative natural population growth.",
        "Significant brain drain as educated youth emigrate to the United States and Europe in search of work.",
        "Rapidly aging population base putting stress on the country's free national healthcare system."
      ]
    }
  },
  "drc": {
    name: "Democratic Republic of the Congo",
    region: "Africa",
    income: "Low Income",
    climate: {
      carbonOverall: "4.8 megatons CO2",
      carbonPerCapita: "0.05 tonnes CO2",
      vulnerabilities: [
        "Accelerating loss of the Congo Basin rainforest canopy due to illegal logging, slash-and-burn farming, and mining.",
        "Disruption of precipitation cycles in the agricultural Katanga region, shortening growing seasons.",
        "High vulnerability to severe seasonal flooding along the Congo River basin, damaging weak transit hubs."
      ]
    },
    seismic: {
      tectonicBoundaries: "Positioned on the African Plate, split on its eastern border by the East African Rift System.",
      threatMechanisms: "Active volcanic hazards from the Virunga Mountains (e.g., Mount Nyiragongo lava flows) and graben rift earthquakes."
    },
    geopolitical: {
      vulnerabilities: [
        "Loss of state sovereignty in the eastern provinces (Kivu) due to armed rebel control over illicit mineral mines (coltan, gold).",
        "Severe border friction and proxy conflicts involving neighboring Rwanda, Uganda, and Burundi.",
        "Vast geographical area lacking internal transport links, isolating the capital Kinshasa from resource zones."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Very high fertility rate (TFR of 6.2) driving massive population growth that outpaces infrastructure development.",
        "Severe internal displacement crisis, with millions of refugees fleeing conflict zones in the east.",
        "Low urbanization control, leading to massive informal settlements in Kinshasa lacking water and power."
      ]
    }
  },
  "egypt": {
    name: "Egypt",
    region: "Middle East",
    income: "Lower-Middle Income",
    climate: {
      carbonOverall: "250.3 megatons CO2",
      carbonPerCapita: "2.3 tonnes CO2",
      vulnerabilities: [
        "Severe soil salinization and agricultural land loss in the Nile Delta due to rising sea levels and delta subsidence.",
        "Sea level rise threatening the historical coastal urban center of Alexandria with permanent inundation.",
        "Extreme heatwaves and evaporative water losses in Upper Egypt, threatening critical domestic wheat harvests."
      ]
    },
    seismic: {
      tectonicBoundaries: "Located on the African Plate, bordering the Sinai Microplate and the Arabian Plate along the Red Sea Rift.",
      threatMechanisms: "Vulnerable to earthquakes along the Dead Sea Transform system and the Gulf of Suez fault zone."
    },
    geopolitical: {
      vulnerabilities: [
        "Existential water security threat from upstream construction of the Grand Ethiopian Renaissance Dam (GERD) on the Blue Nile.",
        "Heavy economic reliance on Suez Canal transit fees, vulnerable to regional maritime security threats in the Red Sea.",
        "Security vulnerabilities along the porous border with conflict-ridden Libya and the unstable Sinai Peninsula."
      ]
    },
    demographic: {
      vulnerabilities: [
        "High fertility rate (TFR of 2.85) adding over 2 million people annually to an already resource-stressed nation.",
        "Extreme concentration of the population (95%) along a narrow, fertile strip bordering the Nile River.",
        "High youth unemployment (median age ~25) driving social unrest risks and economic emigration."
      ]
    }
  },
  "ethiopia": {
    name: "Ethiopia",
    region: "Africa",
    income: "Low Income",
    climate: {
      carbonOverall: "18.2 megatons CO2",
      carbonPerCapita: "0.15 tonnes CO2",
      vulnerabilities: [
        "Unpredictable shifts in Belg and Kiremt seasonal rains, causing widespread crop failures in the highlands.",
        "Severe soil erosion in the mountainous Amhara and Oromia regions due to intensive hillside farming.",
        "Chronic desertification and pasture depletion in the dry eastern Somali and Afar regions, decimating livestock."
      ]
    },
    seismic: {
      tectonicBoundaries: "Split down the center by the East African Rift System, where the Nubian and Somalian plates are diverging.",
      threatMechanisms: "High susceptibility to tectonic rifting earthquakes, faulting, and active caldera volcanism in the Afar Triangle."
    },
    geopolitical: {
      vulnerabilities: [
        "Landlocked geography, forcing total dependency on the Djibouti port rail corridor for import/export flows.",
        "Frictional diplomatic standoffs with downstream Egypt and Sudan over Blue Nile water extraction and the GERD reservoir.",
        "Internal ethnic federalist fragmentation and civil conflicts (Tigray, Amhara) threatening national unity."
      ]
    },
    demographic: {
      vulnerabilities: [
        "High fertility rate (TFR of 4.1) leading to a massive child dependency burden on state education and food grids.",
        "Rapid, unplanned migration to Addis Ababa, creating expansive suburban informal settlements.",
        "High population pressure on highland arable land, accelerating environmental degradation and land fragmentation."
      ]
    }
  },
  "france": {
    name: "France",
    region: "Europe",
    income: "High Income",
    climate: {
      carbonOverall: "310.2 megatons CO2",
      carbonPerCapita: "4.6 tonnes CO2",
      vulnerabilities: [
        "Accelerating glacier retreat in the French Alps, threatening alpine hydrology and winter tourism.",
        "Severe summer drought stress in the Loire and Garonne agricultural river basins, reducing crop yields.",
        "Increasingly frequent and intense Mediterranean forest fires in Corsica and southern Provence during dry seasons."
      ]
    },
    seismic: {
      tectonicBoundaries: "Located on the Eurasian Plate, bordering the complex collision zone of the African Plate in the Mediterranean.",
      threatMechanisms: "Vulnerable to moderate crustal earthquakes along faults in the Pyrenees, Alps, and the Upper Rhine Graben."
    },
    geopolitical: {
      vulnerabilities: [
        "Heavy dependency on importing uranium from West Africa (Niger) and Central Asia to fuel its large nuclear power sector.",
        "Complex maritime security demands across vast global Exclusive Economic Zones (EEZ) in the Pacific and Indian Oceans.",
        "Sovereign border control friction along the English Channel regarding migration transit networks."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Stagnating natural birth rate (TFR of 1.8) leading to a rising old-age dependency ratio and pension strain.",
        "Socio-spatial exclusion and high youth unemployment in metropolitan suburbs (banlieues), fueling social unrest.",
        "Depopulation and services contraction in rural central regions, locally referred to as the 'empty diagonal'."
      ]
    }
  },
  "germany": {
    name: "Germany",
    region: "Europe",
    income: "High Income",
    climate: {
      carbonOverall: "660.1 megatons CO2",
      carbonPerCapita: "7.9 tonnes CO2",
      vulnerabilities: [
        "Severe summer drought causing low river levels on the Rhine, halting inland commercial shipping and coal supply routes.",
        "Extreme precipitation events causing catastrophic flash flooding in the Ahr and Erft river valleys.",
        "Widespread forest dieback in the Harz and Black Forest due to drought stress and subsequent bark beetle infestations."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits on the stable interior of the Eurasian Plate.",
      threatMechanisms: "Low seismic hazard, but vulnerable to minor intraplate earthquakes triggered by crustal extension in the Upper Rhine Graben and the Albstadt Shear Zone."
    },
    geopolitical: {
      vulnerabilities: [
        "Critical energy transition vulnerability, needing massive imports of natural gas and green hydrogen to replace coal.",
        "Vulnerability of its central European land transit corridors to supply chain bottlenecks and labor strikes.",
        "High economic dependence on manufacturing export trade to China, exposing industrial base to geopolitical trade shifts."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Low fertility rate (TFR of 1.46) driving a contraction of the domestic working-age population.",
        "Severe shortage of skilled labor across technical and engineering fields, threatening industrial productivity.",
        "Growing elderly dependency burden, threatening the long-term solvency of the public pension and healthcare systems."
      ]
    }
  },
  "iceland": {
    name: "Iceland",
    region: "Europe",
    income: "High Income",
    climate: {
      carbonOverall: "2.2 megatons CO2",
      carbonPerCapita: "6.1 tonnes CO2",
      vulnerabilities: [
        "Rapid melting of major glaciers like Vatnajökull and Langjökull, altering local river systems and coastal topography.",
        "Shifting North Atlantic fish migrations due to warming sea surface temperatures, threatening the fishing export economy.",
        "Acidification of surrounding sub-polar marine waters, threatening shellfish and cold-water coral reefs."
      ]
    },
    seismic: {
      tectonicBoundaries: "Positioned directly on the Mid-Atlantic Ridge, the divergent boundary separating the North American and Eurasian plates.",
      threatMechanisms: "Extremely high volcanic and seismic activity, with active rifting zones and volcanic systems (e.g., Reykjanes Peninsula fissures) causing lava inundation hazards."
    },
    geopolitical: {
      vulnerabilities: [
        "Strategic geopolitical location in the GIUK (Greenland-Iceland-UK) Gap, exposing it to militarization pressures.",
        "Extreme dependency on imported food, machinery, and consumer goods due to limited agricultural land.",
        "High vulnerability of fishing grounds to international disputes and changes in exclusive economic zone rules."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Very small total population (~390,000) concentrated heavily in the capital region, creating severe regional imbalances.",
        "High dependency on importing temporary foreign labor to support the construction and tourism industries.",
        "Vulnerability of remote coastal communities to depopulation as youth migrate to Reykjavik."
      ]
    }
  },
  "india": {
    name: "India",
    region: "Asia-Pacific",
    income: "Lower-Middle Income",
    climate: {
      carbonOverall: "2,700.5 megatons CO2",
      carbonPerCapita: "1.9 tonnes CO2",
      vulnerabilities: [
        "Increasing monsoon irregularity, causing severe drought in Central India and concurrent flooding in the northeast.",
        "Rapid glacial retreat in the Himalayas, threatening dry-season water volumes in the Ganges and Indus river basins.",
        "Severe, lethal urban heatwaves in the Indo-Gangetic Plain, reducing agricultural productivity and working hours."
      ]
    },
    seismic: {
      tectonicBoundaries: "Positioned on the Indian Plate, which is actively colliding with and subducting under the Eurasian Plate.",
      threatMechanisms: "High seismic hazard along the Himalayan Arc, with risks of massive earthquakes along the Main Boundary Thrust."
    },
    geopolitical: {
      vulnerabilities: [
        "Strategic maritime security concern over Chinese naval presence in the Indian Ocean ('string of pearls' strategy).",
        "Persistent land border friction and militarization in Kashmir (Pakistan) and Arunachal Pradesh (China).",
        "Transboundary water vulnerabilities, particularly Chinese dam construction on the upper Brahmaputra River."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Regional divergence in fertility: high birth rates in northern states (e.g. Bihar) versus sub-replacement rates in southern states.",
        "Massive youth unemployment among educated cohorts, threatening the realization of the country's demographic dividend.",
        "Unprecedented urban sprawl and informal settlement expansions in tier-1 cities like Mumbai, Delhi, and Bangalore."
      ]
    }
  },
  "indonesia": {
    name: "Indonesia",
    region: "Asia-Pacific",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "620.4 megatons CO2",
      carbonPerCapita: "2.2 tonnes CO2",
      vulnerabilities: [
        "Accelerating coastal inundation and land subsidence in Northern Jakarta, requiring costly coastal wall interventions.",
        "Destructive peatland and forest fires in Sumatra and Kalimantan, releasing huge carbon plumes and choking regional air corridors.",
        "Sea level rise threatening the livelihood of thousands of small, remote archipelagic fishing communities."
      ]
    },
    seismic: {
      tectonicBoundaries: "Situated at the unstable convergence of the Eurasian Plate, the Indo-Australian Plate, and the Pacific Plate.",
      threatMechanisms: "Extreme risk of megathrust earthquakes and tsunamis along the Sunda Subduction Zone, and volcanic eruptions from active calderas."
    },
    geopolitical: {
      vulnerabilities: [
        "Control and security of international maritime trade chokepoints (Malacca, Sunda, and Lombok straits).",
        "Sovereignty enforcement friction in the Natuna Sea peripheral zone due to Chinese fishing fleet incursions.",
        "Huge fiscal and logistical strain of relocating the capital from Jakarta to East Kalimantan (Nusantara project)."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Extreme population concentration on Java island (over 56% of national total), straining local aquifers and land resources.",
        "High urbanization rate driving rapid expansion of informal housing sectors in Java's metropolitan areas.",
        "Vulnerability of remote outer island communities to poverty and lack of access to basic medical and educational grids."
      ]
    }
  },
  "iran": {
    name: "Iran",
    region: "Middle East",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "680.2 megatons CO2",
      carbonPerCapita: "8.0 tonnes CO2",
      vulnerabilities: [
        "Near-complete drying of the Lake Urmia basin due to climate shifts and agricultural over-extraction.",
        "Severe, prolonged sand and dust storms in Sistan-Baluchestan, causing respiratory crises and farm abandonments.",
        "Critical groundwater depletion in central basins like Esfahan, causing land subsidence and crop failures."
      ]
    },
    seismic: {
      tectonicBoundaries: "Lies on the Eurasian Plate, actively compressed by the colliding Arabian Plate to the south.",
      threatMechanisms: "Frequent destructive earthquakes along major strike-slip faults, such as the Zagros Active Fold-and-Thrust Belt and the Main Recent Fault."
    },
    geopolitical: {
      vulnerabilities: [
        "Geopolitical exposure of oil export routes passing through the Strait of Hormuz chokepoint.",
        "Severe trade restrictions and isolation from Western global financial markets due to economic sanctions.",
        "Resource security issues related to transboundary river control with Afghanistan (Helmand River disputes)."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Rapid drop in fertility (TFR of 1.6), leading to an aging population profile ahead of economic development.",
        "High migration outflow of skilled professionals and academics ('brain drain') due to economic stagnation.",
        "Extreme urban growth in Tehran, straining water supplies and creating severe air quality challenges."
      ]
    }
  },
  "ireland": {
    name: "Ireland",
    region: "Europe",
    income: "High Income",
    climate: {
      carbonOverall: "38.5 megatons CO2",
      carbonPerCapita: "7.3 tonnes CO2",
      vulnerabilities: [
        "Increased frequency of severe winter Atlantic depressions, causing coastal erosion on the west coast.",
        "Shifts in agricultural grass yields due to wetter winters and drier summers, impacting dairy export markets.",
        "Fluvial flooding risks along the River Shannon basin during winter precipitation anomalies."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits on the passive margin of the Eurasian Plate, far from any active plate boundaries.",
      threatMechanisms: "Extremely low seismic risk; tectonic activity is limited to minor, harmless crustal adjustments."
    },
    geopolitical: {
      vulnerabilities: [
        "Complex post-Brexit border management and trade channel frictions between the Republic and Northern Ireland.",
        "High economic vulnerability to changing EU corporate tax frameworks and dependence on US multinational investments.",
        "Strained energy infrastructure due to the massive electricity demands of multinational data centers."
      ]
    },
    demographic: {
      vulnerabilities: [
        "High old-age dependency ratio as the country's population ages, challenging healthcare infrastructure.",
        "Acute housing shortage and high rental costs in Dublin and Cork, driven by rapid tech-sector immigration.",
        "Low fertility rates in rural western counties, leading to rural school closures and community decline."
      ]
    }
  },
  "israel": {
    name: "Israel",
    region: "Middle East",
    income: "High Income",
    climate: {
      carbonOverall: "62.4 megatons CO2",
      carbonPerCapita: "6.5 tonnes CO2",
      vulnerabilities: [
        "Encroachment of desert conditions northwards from the Negev, reducing non-irrigated agricultural margins.",
        "Severe heat waves in the Jordan Rift Valley, straining the national water grid and crop productivity.",
        "Sea level rise threatening Mediterranean coastal aquifers with seawater intrusion and contamination."
      ]
    },
    seismic: {
      tectonicBoundaries: "Positioned directly along the Dead Sea Transform fault system, which separates the African Plate from the Arabian Plate.",
      threatMechanisms: "High risk of destructive earthquakes along the Dead Sea Rift, capable of affecting major urban areas from Eilat to Galilee."
    },
    geopolitical: {
      vulnerabilities: [
        "Persistent national security risks and border conflicts with regional neighbors and non-state actors.",
        "Security of critical offshore Mediterranean natural gas assets (e.g. Leviathan field) from maritime threats.",
        "Water security reliance on national desalination plants, making infrastructure a high-value target."
      ]
    },
    demographic: {
      vulnerabilities: [
        "High national fertility rate (TFR of 2.9) putting severe long-term pressure on land, transport, and school grids.",
        "Rapid growth of ultra-Orthodox and Arab sectors with lower labor force participation, creating fiscal imbalances.",
        "Dense concentration of population along the coastal plain (Gush Dan), creating extreme land scarcity."
      ]
    }
  },
  "italy": {
    name: "Italy",
    region: "Europe",
    income: "High Income",
    climate: {
      carbonOverall: "320.5 megatons CO2",
      carbonPerCapita: "5.4 tonnes CO2",
      vulnerabilities: [
        "Frequent 'acqua alta' tidal flooding in Venice, worsened by sea level rise and land subsidence.",
        "Severe agricultural water shortages in the Po River valley, threatening rice and crop production.",
        "Accelerating melting of glaciers in the Alps and Dolomites, increasing landslide risks in mountain valleys."
      ]
    },
    seismic: {
      tectonicBoundaries: "Located in the convergence zone where the African Plate subducts beneath the Eurasian Plate (Adriatic Microplate).",
      threatMechanisms: "Frequent destructive seismic activity along the Apennine fault belt and active volcanism at Etna and Vesuvius."
    },
    geopolitical: {
      vulnerabilities: [
        "Position as a primary entry corridor for irregular Mediterranean migration, straining southern borders (Lampedusa).",
        "High public debt and stagnant economic growth limiting state funding for regional resilience projects.",
        "Dependency on natural gas pipelines passing through geopolitically sensitive corridors in North Africa."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Advanced Stage 5 DTM population decline, with one of the lowest fertility rates in Europe (TFR of 1.24).",
        "Critical old-age dependency ratio, threatening the long-term solvency of the healthcare and welfare systems.",
        "Severe depopulation of historic villages in the South (Mezzogiorno), leading to the abandonment of rural landscapes."
      ]
    }
  },
  "japan": {
    name: "Japan",
    region: "Asia-Pacific",
    income: "High Income",
    climate: {
      carbonOverall: "1,000.4 megatons CO2",
      carbonPerCapita: "8.5 tonnes CO2",
      vulnerabilities: [
        "Increased intensity and frequency of super-typhoons, causing catastrophic urban flooding and landslides.",
        "Severe urban heat island effects in the Tokyo-Yokohama metropolitan area, increasing summer mortality.",
        "Rising sea temperatures off the coast of Hokkaido, displacing cold-water species and harming the fishing industry."
      ]
    },
    seismic: {
      tectonicBoundaries: "Confluence of four major plates: the Pacific Plate, Philippine Sea Plate, Eurasian Plate, and North American Plate.",
      threatMechanisms: "Extremely high risk of mega-thrust earthquakes and tsunamis along the Nankai Trough and Japan Trench subduction zones."
    },
    geopolitical: {
      vulnerabilities: [
        "Maritime security conflicts with China over the Senkaku/Diaoyu Islands in the East China Sea.",
        "Total reliance on long maritime shipping lanes through the Malacca Strait and South China Sea for oil imports.",
        "Sovereignty dispute with Russia over the northern Kuril Islands (Northern Territories), preventing a formal peace treaty."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Deep demographic contraction (TFR of 1.26), with the population shrinking by hundreds of thousands annually.",
        "Critical old-age dependency ratio, with over 29% of the population aged 65 or older, straining services.",
        "Rapid abandonment of rural homes (Akiya) and communities as the population clusters in major cities."
      ]
    }
  },
  "kenya": {
    name: "Kenya",
    region: "Africa",
    income: "Lower-Middle Income",
    climate: {
      carbonOverall: "18.5 megatons CO2",
      carbonPerCapita: "0.35 tonnes CO2",
      vulnerabilities: [
        "Erratic precipitation patterns in the Rift Valley tea-growing belt, threatening the country's main export crop.",
        "Severe, prolonged droughts in semi-arid northern regions (Turkana), causing livestock die-offs and famine.",
        "Increased flooding along the Tana River basin, destroying infrastructure and displacing local communities."
      ]
    },
    seismic: {
      tectonicBoundaries: "Split down the center by the Eastern Rift Valley branch of the East African Rift System.",
      threatMechanisms: "Vulnerable to moderate graben-rift earthquakes, ground cracking, and active volcanic venting in the Rift Valley."
    },
    geopolitical: {
      vulnerabilities: [
        "Cross-border security threats and terror incursions from Al-Shabaab militants operating from Somalia.",
        "Host to massive, long-term refugee camps (Dadaab, Kakuma) straining local land and water resources.",
        "Vulnerability of its sole major port (Mombasa) to maritime security threats in the western Indian Ocean."
      ]
    },
    demographic: {
      vulnerabilities: [
        "High population growth (TFR of 3.3) creating intense competition for land and employment among youth.",
        "Rapid, uncontrolled growth of informal settlements like Kibera in Nairobi, lacking sanitation and services.",
        "High youth dependency ratio, putting a massive financial burden on public healthcare and education grids."
      ]
    }
  },
  "malaysia": {
    name: "Malaysia",
    region: "Asia-Pacific",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "270.2 megatons CO2",
      carbonPerCapita: "8.1 tonnes CO2",
      vulnerabilities: [
        "Increasingly severe flash floods in the Klang Valley, causing massive urban infrastructure damage.",
        "Severe coastal erosion along East Malaysia's (Sarawak) shoreline, threatening coastal fishing settlements.",
        "Widespread coral bleaching around the marine parks of Sabah due to rising sea surface temperatures."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits on the Sunda Block (stable Eurasian Plate interior), adjacent to active plates in Sumatra and the Philippines.",
      threatMechanisms: "Generally stable, but East Malaysia (Sabah) is vulnerable to moderate thrust-fault earthquakes, such as the Ranau event."
    },
    geopolitical: {
      vulnerabilities: [
        "Overlapping maritime sovereignty claims in the South China Sea, particularly around resource-rich reefs.",
        "Security management of the Strait of Malacca, one of the world's most critical maritime chokepoints.",
        "Dependency on international trade agreements for palm oil exports, vulnerable to foreign tariff barriers."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Declining fertility rate (TFR of 1.6), accelerating demographic aging in urban centers.",
        "Rapid urbanization drawing youth to the Greater Kuala Lumpur zone, creating rural labor shortages.",
        "Heavy reliance on undocumented foreign labor for the construction and plantation sectors, creating social friction."
      ]
    }
  },
  "mexico": {
    name: "Mexico",
    region: "Americas",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "450.4 megatons CO2",
      carbonPerCapita: "3.5 tonnes CO2",
      vulnerabilities: [
        "Critical aquifer depletion and soil subsidence in the Mexico City metropolitan basin.",
        "Prolonged, severe droughts in the northern agricultural states like Sonora, devastating cattle ranching.",
        "High vulnerability to destructive hurricane landfalls on both the Pacific and Gulf coasts (e.g. Acapulco)."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits on the North American Plate, colliding with the subducting Cocos Plate and Rivera Plate to the south.",
      threatMechanisms: "Frequent high-magnitude earthquakes along the Middle America Trench and volcanic hazards along the Trans-Mexican Volcanic Belt."
    },
    geopolitical: {
      vulnerabilities: [
        "Severe security and border management challenges related to transnational cartel corridors and migration flows to the US.",
        "Extreme economic dependency on the United States market, leaving it vulnerable to shifts in trade policies (USMCA).",
        "Vulnerability of critical oil infrastructure in the Gulf of Mexico to maritime organized crime and weather."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Steadily falling fertility rate (TFR of 1.9), transitioning the country towards an aging demographic profile.",
        "Significant emigration of skilled and unskilled labor to the United States, draining local municipal workforces.",
        "Severe wealth inequality driving the growth of marginalized, informal urban peripheries in major cities."
      ]
    }
  },
  "netherlands": {
    name: "Netherlands",
    region: "Europe",
    income: "High Income",
    climate: {
      carbonOverall: "140.2 megatons CO2",
      carbonPerCapita: "8.0 tonnes CO2",
      vulnerabilities: [
        "Existential risk of sea level rise breaching coastal dike systems, as over 26% of land is below sea level.",
        "Saltwater intrusion into coastal aquifers and agricultural polders, reducing crop yields.",
        "Fluvial flooding risks along the Rhine-Meuse-Scheldt delta during heavy European winter storms."
      ]
    },
    seismic: {
      tectonicBoundaries: "Located on the stable Eurasian Plate interior.",
      threatMechanisms: "Low natural seismicity, but highly vulnerable to induced earthquakes caused by long-term gas extraction in the Groningen field."
    },
    geopolitical: {
      vulnerabilities: [
        "Rotterdam Port represents a critical chokepoint, vulnerable to supply chain logjams and trade wars.",
        "Heavy dependency on importing critical raw materials and components for its high-tech agricultural sector.",
        "Sovereign defense vulnerability of North Sea offshore wind farms and gas lines to sabotage."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Low fertility rate (TFR of 1.49) leading to labor shortages in engineering and health sectors.",
        "Severe housing shortage in the Randstad metropolitan zone, driven by population growth and immigration.",
        "Rising old-age dependency ratio putting pressure on the welfare state and public healthcare."
      ]
    }
  },
  "niger": {
    name: "Niger",
    region: "Africa",
    income: "Low Income",
    climate: {
      carbonOverall: "2.0 megatons CO2",
      carbonPerCapita: "0.08 tonnes CO2",
      vulnerabilities: [
        "Accelerating desertification, with the Sahara Desert expanding into Southern farming zones.",
        "Frequent, catastrophic droughts in the Sahelian zone, causing recurrent crop and livestock failures.",
        "Highly erratic rainfall patterns, causing severe flash flooding along the Niger River basin."
      ]
    },
    seismic: {
      tectonicBoundaries: "Situated on the stable interior of the African Plate.",
      threatMechanisms: "Tectonically stable; virtually no seismic or volcanic hazards exist within the country."
    },
    geopolitical: {
      vulnerabilities: [
        "Landlocked geography, forcing reliance on ports in Benin and Nigeria for uranium and oil exports.",
        "Severe security threats along the border from Sahelian militant groups (JNIM, Islamic State in the Greater Sahara).",
        "Political instability and diplomatic isolation following regional military coups, cutting off foreign development aid."
      ]
    },
    demographic: {
      vulnerabilities: [
        "World's highest fertility rate (TFR of 6.7), leading to unsustainable population doubling rates.",
        "Critical youth dependency burden, with over 50% of the population under 15 years old, overloading schools.",
        "Chronic food insecurity, leaving millions reliant on international emergency food aid programs."
      ]
    }
  },
  "nigeria": {
    name: "Nigeria",
    region: "Africa",
    income: "Lower-Middle Income",
    climate: {
      carbonOverall: "130.5 megatons CO2",
      carbonPerCapita: "0.60 tonnes CO2",
      vulnerabilities: [
        "Chronic flooding and oil pollution in the Niger Delta, destroying agricultural land and fisheries.",
        "Accelerating desertification in northern states (e.g. Sokoto), driving pastoralists south and causing ethnic clashes.",
        "Severe coastal erosion and storm surges threatening coastal real estate in Victoria Island, Lagos."
      ]
    },
    seismic: {
      tectonicBoundaries: "Situated on the stable interior of the African Plate.",
      threatMechanisms: "Low seismic hazard; crustal adjustments are rare and of low magnitude."
    },
    geopolitical: {
      vulnerabilities: [
        "Piracy and oil smuggling operations in the Gulf of Guinea, threatening critical maritime trade routes.",
        "Persistent security threats from Boko Haram and ISWAP insurgencies in the northeastern Lake Chad region.",
        "Extreme economic vulnerability to oil price shocks due to lack of export diversification."
      ]
    },
    demographic: {
      vulnerabilities: [
        "High national fertility rate (TFR of 5.2), driving rapid population growth that outstrips infrastructural expansion.",
        "Explosive, unplanned growth of Lagos, creating massive informal slums lacking basic water and power grids.",
        "Severe youth unemployment (median age ~18), fueling civil unrest risks and ethnic tensions."
      ]
    }
  },
  "peru": {
    name: "Peru",
    region: "Americas",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "55.2 megatons CO2",
      carbonPerCapita: "1.6 tonnes CO2",
      vulnerabilities: [
        "Rapid melting of tropical glaciers in the Cordillera Blanca, threatening future water security for coastal cities.",
        "Severe flooding and landslide events ('huaicos') along the northern coast during El Niño warming cycles.",
        "Shifts in the cold Humboldt Current, impacting ocean ecosystems and major anchovy fish harvests."
      ]
    },
    seismic: {
      tectonicBoundaries: "Located along the convergent boundary where the Nazca Plate is subducting under the South American Plate.",
      threatMechanisms: "High risk of destructive earthquakes and tsunamis along the Peru-Chile Trench and active faulting in the Andes."
    },
    geopolitical: {
      vulnerabilities: [
        "Vulnerability of its mineral export economy to geopolitical shifts and demand changes in Chinese markets.",
        "Security challenges in controlling vast, remote Amazonian borders and illicit drug production valleys (VRAEM).",
        "Frequent political instability and executive turnover, paralyzing long-term infrastructural investment planning."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Falling fertility (TFR of 2.2), but with persistent high birth rates in remote Amazonian and Andean regions.",
        "Extreme population centralization in Lima (containing 30% of the population), straining local desert water resources.",
        "Heavy rural-to-urban migration from the Andes, leading to informal settlements built on unstable hillsides."
      ]
    }
  },
  "philippines": {
    name: "Philippines",
    region: "Asia-Pacific",
    income: "Lower-Middle Income",
    climate: {
      carbonOverall: "140.4 megatons CO2",
      carbonPerCapita: "1.25 tonnes CO2",
      vulnerabilities: [
        "Frequent landfalls of super-typhoons, causing catastrophic wind damage, mudslides, and storm surges in coastal regions.",
        "Severe sea level rise in Manila Bay, causing regular tidal flooding in the capital's low-lying zones.",
        "Increasing ocean acidification and warming, decimating coral reefs and local artisanal fishing catches."
      ]
    },
    seismic: {
      tectonicBoundaries: "Confluence of the subducting Philippine Sea Plate and the Eurasian Plate (Sunda Plate).",
      threatMechanisms: "High seismic hazard along the Philippine Trench and active fault systems, such as the Philippine Fault Zone."
    },
    geopolitical: {
      vulnerabilities: [
        "Maritime security conflicts with China over territorial sovereignty in the West Philippine Sea.",
        "Security vulnerabilities along porous maritime borders, exposing the southern islands to piracy and militancy.",
        "High economic vulnerability to shifts in global remittance flows from its large overseas worker population."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Falling national fertility (TFR of 1.9), but high birth rates persist among poorer rural demographics.",
        "Severe brain drain as trained medical and maritime professionals emigrate to Western markets.",
        "Extreme population density in Metro Manila, creating severe traffic congestion, pollution, and slum expansions."
      ]
    }
  },
  "poland": {
    name: "Poland",
    region: "Europe",
    income: "High Income",
    climate: {
      carbonOverall: "310.4 megatons CO2",
      carbonPerCapita: "8.2 tonnes CO2",
      vulnerabilities: [
        "Baltic Sea level rise and coastal erosion, threatening infrastructure in Gdańsk and Gdynia.",
        "Increasing agricultural drought stress in central plains (Wielkopolska), reducing crop outputs.",
        "Severe air pollution and heat stress in coal-reliant industrial regions like Silesia during summer droughts."
      ]
    },
    seismic: {
      tectonicBoundaries: "Situated on the stable interior of the Eurasian Plate.",
      threatMechanisms: "Low seismic hazard; tectonic activity is limited to minor induced tremors in southern Silesian coal-mining basins."
    },
    geopolitical: {
      vulnerabilities: [
        "Strategic security exposure along the Suwalki Gap, the narrow land corridor between Belarus and Kaliningrad.",
        "Dependency on European Union single market stability and energy infrastructure connections.",
        "Economic vulnerability to sudden disruptions in East-West rail and pipeline transit corridors."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Severe Stage 5 DTM population decline, with a very low fertility rate (TFR of 1.3).",
        "Large-scale emigration of young professionals to Western Europe over past decades, draining skilled labor.",
        "Rapidly rising old-age dependency ratio, threatening the fiscal solvency of public welfare and pensions."
      ]
    }
  },
  "russia": {
    name: "Russia",
    region: "Europe",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "1,600.5 megatons CO2",
      carbonPerCapita: "11.2 tonnes CO2",
      vulnerabilities: [
        "Widespread permafrost thawing in Siberia, damaging oil and gas pipelines and foundation structures.",
        "Increasing frequency and scale of boreal forest fires in Yakutia, releasing huge soot and carbon volumes.",
        "Rapid decline in Arctic sea ice, altering northern ecosystems but opening new coastal shipping routes."
      ]
    },
    seismic: {
      tectonicBoundaries: "Lies on the Eurasian Plate, meeting the North American Plate and Pacific Plate in the far east.",
      threatMechanisms: "High risk of destructive earthquakes and volcanic eruptions along the Kamchatka Trench subduction zone."
    },
    geopolitical: {
      vulnerabilities: [
        "Vulnerability of its vast land borders to security threats, following international military tensions.",
        "Strategic vulnerability of its primary maritime trade gateways in the Baltic Sea, Black Sea, and the Far East.",
        "Heavy economic exposure to international economic sanctions, restricting access to advanced technologies."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Long-term population contraction driven by low fertility (TFR of 1.5) and high mortality among adult males.",
        "Severe depopulation of Siberia and the Far East as populations migrate to western European Russia.",
        "Strained labor pool, limiting economic productivity and militarization capabilities."
      ]
    }
  },
  "rwanda": {
    name: "Rwanda",
    region: "Africa",
    income: "Low Income",
    climate: {
      carbonOverall: "1.2 megatons CO2",
      carbonPerCapita: "0.09 tonnes CO2",
      vulnerabilities: [
        "Increased landslide hazards in the mountainous Northern Province due to intense flash storms.",
        "Severe soil erosion on steep hillsides caused by intensive terraced agricultural practices.",
        "Rising temperatures in the western highlands, threatening quality outputs of arabica tea and coffee crops."
      ]
    },
    seismic: {
      tectonicBoundaries: "Positioned on the African Plate (Nubian block), adjacent to the Albertine Rift branch of the East African Rift.",
      threatMechanisms: "Vulnerable to earthquakes along active rift faults and volcanic gas releases from nearby Kivu border calderas."
    },
    geopolitical: {
      vulnerabilities: [
        "Landlocked geography, forcing reliance on long transit corridors to Mombasa and Dar es Salaam ports.",
        "Tense security situation along the border with the Democratic Republic of the Congo.",
        "Vulnerability to changes in international development aid flows, which finance a large part of the state budget."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Extreme population density on mountainous terrain, leading to severe land fragmentation and land disputes.",
        "High youth population base (TFR of 3.5), outstripping domestic job creation in non-agricultural sectors.",
        "Rapid urbanization around Kigali, creating housing supply bottlenecks and municipal service strains."
      ]
    }
  },
  "saudi-arabia": {
    name: "Saudi Arabia",
    region: "Middle East",
    income: "High Income",
    climate: {
      carbonOverall: "600.2 megatons CO2",
      carbonPerCapita: "16.5 tonnes CO2",
      vulnerabilities: [
        "Extreme temperature anomalies in the interior desert basins, reaching levels unsafe for outdoor work.",
        "Depletion of ancient fossil aquifers due to past agricultural policies, leaving country reliant on desalination.",
        "Widespread coral bleaching in the Red Sea coastal margins due to marine heatwaves."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits on the Arabian Plate, separating from the African Plate along the Red Sea divergent boundary.",
      threatMechanisms: "Active crustal faulting along the western Hijaz mountains, exposing urban zones like Jeddah to moderate tremors."
    },
    geopolitical: {
      vulnerabilities: [
        "Strategic vulnerability of oil shipping corridors passing through the Strait of Hormuz and Bab-el-Mandeb.",
        "Regional geopolitical rivalries in the Middle East, exposing energy fields to drone and missile threats.",
        "Strategic need to diversify the economy away from oil exports before global transition reduces fossil demand."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Low fertility rate among the national population (TFR of 2.1), leading to future workforce contraction.",
        "Huge guest worker population (making up ~35% of the total), creating segmented labor markets and fiscal outflows.",
        "High youth population concentration in major cities, demanding rapid private sector employment creation."
      ]
    }
  },
  "singapore": {
    name: "Singapore",
    region: "Asia-Pacific",
    income: "High Income",
    climate: {
      carbonOverall: "52.4 megatons CO2",
      carbonPerCapita: "8.8 tonnes CO2",
      vulnerabilities: [
        "Existential risk of coastal flooding from sea level rise, as much of the island lies close to sea level.",
        "Severe urban heat island warming, increasing domestic energy demands for building cooling.",
        "Extreme vulnerability of the national food supply, importing over 90% of all food resources."
      ]
    },
    seismic: {
      tectonicBoundaries: "Located on the stable Sunda Block sub-plate of the Eurasian Plate.",
      threatMechanisms: "Low direct risk, but vulnerable to structural resonance effects from distant, high-magnitude Sumatra earthquakes."
    },
    geopolitical: {
      vulnerabilities: [
        "Strategic exposure of its maritime shipping economy to disruptions in the narrow Singapore Strait.",
        "Heavy dependency on Johor (Malaysia) for fresh water imports, subject to pricing and supply disputes.",
        "Vulnerability of its global financial hub status to rising trade conflicts between the US and China."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Critically low fertility rate (TFR of 0.97), leading to severe demographic aging and shrinking citizen base.",
        "Extreme dependency on foreign labor across all sectors, creating socio-political integration debates.",
        "Severe spatial pressure, with high land costs and competing demands for housing, industry, and military."
      ]
    }
  },
  "south-africa": {
    name: "South Africa",
    region: "Africa",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "450.2 megatons CO2",
      carbonPerCapita: "7.5 tonnes CO2",
      vulnerabilities: [
        "Severe drought risk in the Western Cape, leading to municipal 'Day Zero' water crises in Cape Town.",
        "Shifting precipitation zones in the Free State agricultural belt, threatening staple maize harvests.",
        "Coastal storm surge damages in urban Durban, exacerbated by rising sea levels and intense storms."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits on the stable interior shield of the African Plate.",
      threatMechanisms: "Low seismic hazard, but vulnerable to mining-induced earthquakes in the Witwatersrand gold basins."
    },
    geopolitical: {
      vulnerabilities: [
        "Sovereign energy crisis (Eskom load-shedding) crippling manufacturing and transport logistics.",
        "Vulnerability of its major commercial port corridors (Durban, Cape Town) to infrastructure backlogs.",
        "Regional security challenges, including border control friction and cross-border migration corridors."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Extreme socio-economic inequality (highest Gini index globally), feeding persistent social unrest risks.",
        "Severe youth unemployment (exceeding 50%), creating a marginalized generation in urban townships.",
        "High internal migration from rural Eastern Cape to Gauteng, overloading municipal sanitation grids."
      ]
    }
  },
  "south-korea": {
    name: "South Korea",
    region: "Asia-Pacific",
    income: "High Income",
    climate: {
      carbonOverall: "600.4 megatons CO2",
      carbonPerCapita: "11.5 tonnes CO2",
      vulnerabilities: [
        "Increasing intensity of summer typhoons, causing severe storm surges in southern ports like Busan.",
        "Severe summer heat stress in the Seoul capital region, overloading the national electricity grid.",
        "Acidification and temperature rises in the Yellow Sea, impacting regional seaweed and bivalve aquaculture."
      ]
    },
    seismic: {
      tectonicBoundaries: "Located on the Eurasian Plate, adjacent to active boundaries in Japan.",
      threatMechanisms: "Vulnerable to moderate crustal earthquakes along faults like the Yangsan Fault in the southeast (Gyeongju, Pohang events)."
    },
    geopolitical: {
      vulnerabilities: [
        "Existential military threat and border confrontation with North Korea along the DMZ.",
        "Total reliance on importing critical energy (LNG, crude oil) through shipping lanes in the South China Sea.",
        "Trade vulnerability due to supply chain reliance on foreign sources for semiconductor components."
      ]
    },
    demographic: {
      vulnerabilities: [
        "World's lowest fertility rate (TFR of 0.72), leading to an rapid population contraction.",
        "Severe old-age dependency burden, threatening public health systems and pension fund solvency.",
        "Rural depopulation, with young cohorts leaving agricultural regions to cluster in the Seoul capital area."
      ]
    }
  },
  "sudan": {
    name: "Sudan",
    region: "Africa",
    income: "Low Income",
    climate: {
      carbonOverall: "20.1 megatons CO2",
      carbonPerCapita: "0.40 tonnes CO2",
      vulnerabilities: [
        "Rapidly encroaching desertification, reducing pasture land in the northern Kordofan region.",
        "Unprecedented seasonal flooding along the Blue Nile, destroying farming zones and displacing thousands.",
        "Chronic agricultural failures in Darfur due to shifting rainfall patterns, fueling regional resource conflicts."
      ]
    },
    seismic: {
      tectonicBoundaries: "Located on the African Plate, bordering the active divergent Red Sea Rift to the northeast.",
      threatMechanisms: "Low seismic hazard, with minor risks of crustal tremors along Rift faults and coastal zones."
    },
    geopolitical: {
      vulnerabilities: [
        "Severe civil conflict and breakdown of government, paralyzing national food distribution and trade.",
        "Diplomatic and resource conflicts over Nile water sharing and upstream dam operations.",
        "Strategic vulnerability of Port Sudan, the country's sole maritime trade corridor, to blockade."
      ]
    },
    demographic: {
      vulnerabilities: [
        "High fertility rate (TFR of 4.3) leading to rapid population growth amidst state failure.",
        "Massive internally displaced person (IDP) and refugee populations fleeing active war zones.",
        "High youth unemployment, fueling militia recruitment and outward migration flows."
      ]
    }
  },
  "switzerland": {
    name: "Switzerland",
    region: "Europe",
    income: "High Income",
    climate: {
      carbonOverall: "35.2 megatons CO2",
      carbonPerCapita: "4.0 tonnes CO2",
      vulnerabilities: [
        "Rapid melting of alpine glaciers, changing river runoff regimes and freshwater availability.",
        "Increasing rockfall and landslide risks in mountain valleys due to permafrost thawing in the Alps.",
        "Drying of major river basins like the Rhine and Rhône during increasingly hot summers, impacting hydroelectricity."
      ]
    },
    seismic: {
      tectonicBoundaries: "Situated on the Eurasian Plate, directly affected by the ongoing tectonic collision with the African Plate.",
      threatMechanisms: "Moderate seismic hazard, with active fault systems in the Valais region and Basel capable of triggering earthquakes."
    },
    geopolitical: {
      vulnerabilities: [
        "Non-EU landlocked status, making national trade dependent on transit agreements with neighboring European countries.",
        "Total reliance on import pipelines for oil and natural gas, leaving country vulnerable to energy shocks.",
        "Strategic vulnerability of its finance and banking sectors to shifts in international tax rules."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Low fertility rate (TFR of 1.52) leading to workforce aging, offset by high skilled immigration.",
        "High percentage of foreign residents (~26%), causing localized political debates over migration caps.",
        "Straining social welfare systems due to an increasing old-age dependency ratio."
      ]
    }
  },
  "thailand": {
    name: "Thailand",
    region: "Asia-Pacific",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "280.2 megatons CO2",
      carbonPerCapita: "4.0 tonnes CO2",
      vulnerabilities: [
        "Severe coastal inundation and delta sinking in the Bangkok metropolitan zone, threatening property.",
        "Severe flash flooding in the Chao Phraya River basin, disrupting manufacturing zones.",
        "Extensive coral bleaching and sea surface temperature rises in the Gulf of Thailand, harming tourism."
      ]
    },
    seismic: {
      tectonicBoundaries: "Positioned on the Eurasian Plate (Sunda Block), near active plates in Myanmar and the Andaman Sea.",
      threatMechanisms: "Vulnerable to moderate crustal earthquakes along faults like the Ranong Fault and Three Pagodas Fault."
    },
    geopolitical: {
      vulnerabilities: [
        "Border instability and refugee inflows along the western border with conflict-ridden Myanmar.",
        "Secessionist insurgency risks in the far southern Malay-majority provinces (Pattani, Yala).",
        "Economic dependency on tourism and food exports, vulnerable to international health crises."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Rapidly falling fertility rate (TFR of 1.16) making it one of the fastest-aging societies in Southeast Asia.",
        "Rural depopulation in the northeast (Isan) as youth migrate to the Bangkok capital region.",
        "High reliance on foreign migrant workers from Myanmar and Cambodia for agriculture and construction."
      ]
    }
  },
  "turkey": {
    name: "Turkey",
    region: "Europe",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "400.1 megatons CO2",
      carbonPerCapita: "4.7 tonnes CO2",
      vulnerabilities: [
        "Critical water stress in the Tigris-Euphrates basins due to decreased rainfall and high evaporation.",
        "Prolonged agricultural droughts in Central Anatolia, reducing cereal crop production.",
        "Destructive summer forest fires along the Mediterranean and Aegean coasts, threatening tourism."
      ]
    },
    seismic: {
      tectonicBoundaries: "Positioned on the Anatolian Plate, actively squeezed between the Eurasian, Arabian, and African plates.",
      threatMechanisms: "Extremely high risk of catastrophic earthquakes along the North Anatolian Fault and the East Anatolian Fault strike-slip zones."
    },
    geopolitical: {
      vulnerabilities: [
        "Strategic responsibility and stress of managing the Bosphorus and Dardanelles maritime straits (Montreux Convention).",
        "Position as a major transit route for millions of refugees fleeing conflict zones in Syria and Iraq.",
        "Transboundary water conflicts with downstream Syria and Iraq over dam construction on the Euphrates."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Falling fertility rate (TFR of 1.62) leading to demographic aging in western provinces.",
        "Extreme population concentration in Istanbul (~16 million), straining municipal infrastructure and disaster preparedness.",
        "Socio-economic integration challenges of large refugee populations in southern border provinces."
      ]
    }
  },
  "tuvalu": {
    name: "Tuvalu",
    region: "Asia-Pacific",
    income: "Upper-Middle Income",
    climate: {
      carbonOverall: "0.01 megatons CO2",
      carbonPerCapita: "0.90 tonnes CO2",
      vulnerabilities: [
        "Existential risk of complete inundation from sea level rise, with maximum land height under 5 meters.",
        "Saltwater contamination of fresh groundwater lenses, destroying traditional taro pit agriculture.",
        "Severe storm surge events washing over low-lying atolls, destroying housing and freshwater grids."
      ]
    },
    seismic: {
      tectonicBoundaries: "Situated on the interior of the Pacific Plate, far from any active plate boundaries.",
      threatMechanisms: "Low direct seismic hazard, but highly vulnerable to regional subduction-zone generated tsunamis."
    },
    geopolitical: {
      vulnerabilities: [
        "Risk of loss of sovereign statehood and territory due to rising ocean levels, necessitating relocation treaties.",
        "Heavy dependency on foreign aid and licensing fees (e.g. from the .tv domain) to finance state services.",
        "Vulnerability of its vast Exclusive Economic Zone (EEZ) to illegal fishing due to lack of patrol vessels."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Tiny total population (~11,000) highly concentrated in Funafuti, causing localized waste and water challenges.",
        "High emigration rates as youth migrate to New Zealand and Australia in search of education and survival.",
        "Total dependency of remaining citizens on foreign food imports, raising childhood malnutrition risks."
      ]
    }
  },
  "uae": {
    name: "United Arab Emirates",
    region: "Middle East",
    income: "High Income",
    climate: {
      carbonOverall: "200.2 megatons CO2",
      carbonPerCapita: "20.5 tonnes CO2",
      vulnerabilities: [
        "Extreme summer temperature anomalies, requiring massive air-conditioning energy output.",
        "Critical reliance on energy-intensive desalination plants for 100% of municipal water requirements.",
        "Increasing frequency of severe desert dust storms, disrupting transport and solar power grids."
      ]
    },
    seismic: {
      tectonicBoundaries: "Located on the Arabian Plate, close to the convergent boundary with the Eurasian Plate in Iran.",
      threatMechanisms: "Stable block, but vulnerable to ground shaking from high-magnitude earthquakes in the nearby Zagros collision zone."
    },
    geopolitical: {
      vulnerabilities: [
        "Strategic vulnerability of oil shipping routes passing through the Strait of Hormuz chokepoint.",
        "Heavy dependency on maritime supply chains for food imports, vulnerable to regional conflicts.",
        "Strategic need to diversify national GDP away from oil before global demand patterns shift."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Highly distorted demographic profile, with males outnumbering females due to massive guest worker intakes.",
        "Extreme dependency on temporary foreign workers, who make up over 85% of the total population.",
        "Rapid urbanization in Dubai and Abu Dhabi, putting high demand on electricity and water infrastructure."
      ]
    }
  },
  "uk": {
    name: "United Kingdom",
    region: "Europe",
    income: "High Income",
    climate: {
      carbonOverall: "330.4 megatons CO2",
      carbonPerCapita: "4.9 tonnes CO2",
      vulnerabilities: [
        "Coastal flooding and erosion hazards in East Anglia and the Thames Estuary due to rising sea levels.",
        "Severe winter flooding in the Severn and Trent river basins caused by extreme weather events.",
        "Intense summer heatwave stress in London and the southeast, straining cooling infrastructure."
      ]
    },
    seismic: {
      tectonicBoundaries: "Sits on the stable interior of the Eurasian Plate.",
      threatMechanisms: "Low seismic hazard; crustal movements are rare and limited to minor fault slips in Scotland and Wales."
    },
    geopolitical: {
      vulnerabilities: [
        "Frictional post-Brexit border and customs controls, complicating supply chain logistics with the EU.",
        "Dependency on import terminals for natural gas (North Sea depletion) and food inputs.",
        "Strategic defense requirements for offshore North Sea wind arrays and undersea communication lines."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Declining fertility rate (TFR of 1.56) leading to an aging domestic workforce and healthcare strains.",
        "Severe housing shortage in London and the Southeast, driving cost-of-living crises.",
        "Regional economic disparity between the wealthy London core and post-industrial northern peripheries."
      ]
    }
  },
  "ukraine": {
    name: "Ukraine",
    region: "Europe",
    income: "Lower-Middle Income",
    climate: {
      carbonOverall: "180.2 megatons CO2",
      carbonPerCapita: "4.2 tonnes CO2",
      vulnerabilities: [
        "Desertification in the southern steppe regions, threatening wheat crop production.",
        "Widespread Carpathian deforestation, causing severe seasonal runoff flooding in western river basins.",
        "High industrial pollution hazards in the east, exacerbated by damage to infrastructure."
      ]
    },
    seismic: {
      tectonicBoundaries: "Situated on the stable East European Craton zone of the Eurasian Plate.",
      threatMechanisms: "Low direct seismic hazard, but susceptible to deep-focus earthquakes originating in Romania's Vrancea zone."
    },
    geopolitical: {
      vulnerabilities: [
        "Existential land sovereignty conflict and damage to industrial, transport, and energy infrastructure.",
        "Blockade and destruction of critical Black Sea shipping port gates (e.g. Odesa).",
        "Disruption and transit disputes over major natural gas and bulk grain export pipelines."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Severe population decline and drop in fertility (TFR of 1.2) caused by conflict and displacement.",
        "Massive refugee outflow of millions of women and children, causing long-term demographic imbalances.",
        "Critical shortage of working-age population needed for national defense and postwar rebuilding."
      ]
    }
  },
  "usa": {
    name: "United States",
    region: "Americas",
    income: "High Income",
    climate: {
      carbonOverall: "5,000.3 megatons CO2",
      carbonPerCapita: "15.0 tonnes CO2",
      vulnerabilities: [
        "Severe mega-drought in the Colorado River basin, threatening water supplies for millions and farming in the west.",
        "Increased frequency and destructiveness of category 4 and 5 hurricanes on the Gulf Coast and eastern seaboard.",
        "Catastrophic wild fire seasons in California and the Pacific Northwest, causing severe property damage."
      ]
    },
    seismic: {
      tectonicBoundaries: "Spans the North American Plate, bordering the Pacific Plate (San Andreas Fault) and the subducting Juan de Fuca Plate to the west.",
      threatMechanisms: "High risk of high-magnitude earthquakes along the San Andreas Fault and the Cascadia Subduction Zone, and volcanic risk at Yellowstone."
    },
    geopolitical: {
      vulnerabilities: [
        "Strategic task of patrolling and keeping open global maritime shipping lanes against rising challenges.",
        "High resource dependency on imports of critical rare-earth minerals and advanced hardware components.",
        "Border management challenges along the southern land border with Mexico."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Low fertility rate (TFR of 1.67) leading to dependency ratio strains, offset only by international migration.",
        "Extreme wealth inequality and socio-spatial segregation in major metropolitan areas.",
        "Strained public welfare and healthcare systems as the large baby-boomer cohort enters retirement."
      ]
    }
  },
  "vietnam": {
    name: "Vietnam",
    region: "Asia-Pacific",
    income: "Lower-Middle Income",
    climate: {
      carbonOverall: "320.5 megatons CO2",
      carbonPerCapita: "3.2 tonnes CO2",
      vulnerabilities: [
        "Severe salinization and inundation in the low-lying Mekong Delta, threatening national rice security.",
        "Frequent and intense typhoon landfalls on the Central Coast, causing destructive storm surges and landslides.",
        "Rising sea levels threatening the economic hubs of Ho Chi Minh City and the Red River Delta."
      ]
    },
    seismic: {
      tectonicBoundaries: "Located on the Eurasian Plate (Sunda Block), near active tectonic plates to the east and south.",
      threatMechanisms: "Vulnerable to moderate earthquakes along active faults such as the Red River Fault Zone."
    },
    geopolitical: {
      vulnerabilities: [
        "Maritime boundary and sovereignty disputes with China in the South China Sea.",
        "Upstream control of the Mekong River's water flow by Chinese and Laotian dams, impacting the Mekong delta.",
        "Vulnerability of its export-focused economy to global trade conflicts and tariff changes."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Falling fertility rate (TFR of 1.9), transitioning the country from a demographic window to an aging profile.",
        "Rapid, high-density urbanization in Ho Chi Minh City and Hanoi, straining municipal transport grids.",
        "Socio-economic marginalization of ethnic minorities in remote highland regions, limiting development."
      ]
    }
  },
  "new-zealand": {
    name: "New Zealand",
    region: "Asia-Pacific",
    income: "High Income",
    climate: {
      carbonOverall: "78.8 megatons CO2e",
      carbonPerCapita: "15.2 tonnes CO2e (high biogenic agricultural methane profile)",
      vulnerabilities: [
        "Atmospheric rivers and supercharged ex-tropical cyclones (e.g. Cyclone Gabrielle) causing multi-billion dollar slip erosion, sedimentation, and crop destruction in Hawke's Bay and Gisborne.",
        "Severe glacial cryosphere retreat across the Southern Alps, having lost over 35% of total ice volume since 1978, reducing summer meltwater buffers for South Island hydroelectric reservoirs.",
        "Intensified ENSO teleconnections driving severe agricultural droughts on the eastern rain-shadow plains of Canterbury and Hawke's Bay during El Niño phases."
      ]
    },
    seismic: {
      tectonicBoundaries: "Straddles the active oblique convergent and transform plate boundary between the Pacific Plate and the Indo-Australian Plate.",
      threatMechanisms: "Extreme seismological hazard along the 600km Alpine Fault (75% probability of M8.0+ rupture in next 50 years; AF8 scenario), Hikurangi Megathrust subduction zone off the North Island East Coast (capable of M8.5+ earthquakes and tsunamis within 15 minutes), and the active intraplate Auckland Volcanic Field (53 monogenetic basaltic volcanic centres)."
    },
    geopolitical: {
      vulnerabilities: [
        "High economic trade asymmetry: China absorbs over 28% of merchandise exports (dairy, meat, logs), exposing the economy to geopolitical supply chain weaponization.",
        "Intensifying strategic competition in the South Pacific between Western allies (NZ, Australia, US) and China for maritime policing, infrastructure, and naval influence across Pacific Islands Forum members.",
        "Severe maritime distance and supply chain isolation from Atlantic and European consumer markets, imposing high freight and aviation transport overheads."
      ]
    },
    demographic: {
      vulnerabilities: [
        "Sub-replacement fertility rate (TFR ~1.56) accelerating demographic ageing, placing long-term fiscal stress on universal superannuation and regional healthcare systems.",
        "Acute urban concentration in the Greater Auckland isthmus (>34% of national population), creating severe transport bottlenecks and high housing price-to-income ratios.",
        "Persistent 'brain drain' of skilled tertiary graduates and young professionals emigrating to Australia under unrestricted trans-Tasman work rights."
      ]
    }
  }
};
