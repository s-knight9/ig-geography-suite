export interface ShadowFlowItem {
  vector: string;
  corridor: string;
  scale: string;
  impact: string;
}

export interface EconomyIndicatorDetails {
  trade_blocs: string;
  wto_status: string;
  sovereign_debt: string;
  active_austerity: string;
  aid_status: string;
  imf_program: string;
  shadow_flows: ShadowFlowItem[];
}

export const economyIndicatorsData: Record<string, EconomyIndicatorDetails> = {
  bangladesh: {
    trade_blocs: "SAFTA (South Asian Free Trade Area), APTA (Asia-Pacific Trade Agreement), BIMSTEC Unified Framework, D-8 Group of Developing Nations.",
    wto_status: "Official Member since January 1, 1995 (LDC status with special and differential treatment privileges).",
    sovereign_debt: "39.7% of GDP (FY 2023/24). Domestic component: 23.2% of GDP (treasury bills, savings certificates); External component: 16.5% of GDP.",
    active_austerity: "Strict caps on non-salary recurrent expenses, freeze on government vehicle procurement, restriction on overseas official delegation travels, and strategic electricity load-shedding directives.",
    aid_status: "Net Recipient. Top three sources: World Bank (IDA), JICA (Japan), and Asian Development Bank (ADB).",
    imf_program: "Active USD 4.7 billion Extended Credit Facility (ECF) / Extended Fund Facility (EFF) approved in January 2023. Key conditions: Removal of fuel subsidies, floating range currency exchange, raising the tax-to-GDP ratio, and strict net international reserve benchmarks.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "India/Myanmar ➔ Bangladesh",
        scale: "$500M - $1B annually (Methamphetamine & Phensedyl)",
        impact: "Severe youth workforce depletion; fuels parallel underground retail markets and drains central foreign reserves via Hundi cash flows."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Bangladesh ➔ Gulf States / SE Asia / Mediterranean Transit",
        scale: "$1B+ (Est. Broker Extortion Volume)",
        impact: "Extremely high migrant worker asset loss; proliferation of unregulated recruitment agents ('dalals') exploiting rural households."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "Bangladesh ➔ Offshore Havens / UK / North America",
        scale: "$5B - $8B annually (Trade Misinvoicing focus)",
        impact: "Severe domestic commercial liquidity drain; suppresses tax revenue collection and weakens stable sovereign currency operations."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Middle East / Europe ➔ Bangladesh Communities",
        scale: "Est. 15% - 20% of net incoming transfer values",
        impact: "High-level integration of Hundi currency channels that bypass formal central banking pools, starving the nation of official reserves."
      }
    ]
  },
  usa: {
    trade_blocs: "USMCA (United States-Mexico-Canada Agreement), APEC, Indo-Pacific Economic Framework (IPEF), and active G7/G20 structures.",
    wto_status: "Official Member since January 1, 1995 (founding member status).",
    sovereign_debt: "123.0% of GDP (2023). Highly dominated by domestic public debt (~70%); foreign external debt holders own around ~30% (led by Japan and Mainland China).",
    active_austerity: "No international mandates. Statutory discretionary caps on non-defense federal discretionary budgets imposed by the bipartisan Fiscal Responsibility Act of 2023.",
    aid_status: "Net Donor (world's largest nominal donor). Top three recipient destinations: Ukraine, Israel, and Jordan.",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Latin America / China Precursors ➔ USA (Primary Destination)",
        scale: "$150B+ retail/wholesale value",
        impact: "Fueling of public wellness crisis; massive healthcare and enforcement expenditure pressure exceeding $100B annually."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Central & South America ➔ US Southwest Border",
        scale: "$3B - $6B regional broker fees",
        impact: "Complex border infrastructure requirements; highly cartelized trans-border migrant transit networks posing security challenges."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "United States ➔ Latin America / Caribbean / East Asia",
        scale: "$5B - $10B bulk cash & retail weapon flows",
        impact: "Transits back to drug cartels; export of high-caliber retail weapons that fuel violent conflicts in transit and supply regions."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "United States Urban Centers ➔ Developing Nations",
        scale: "High value, heavily ringfenced corridor",
        impact: "Forces extremely strict compliance (KYC/AML) inside digital transfer firms, increasing transaction costs for legal families."
      }
    ]
  },
  china: {
    trade_blocs: "RCEP (Regional Comprehensive Economic Partnership), APEC, BRICS, Shanghai Cooperation Organisation (SCO).",
    wto_status: "Official Member since December 11, 2001.",
    sovereign_debt: "83.0% of GDP (2023). Majority is domestic internal debt issued through local government financing vehicles (LGFVs); external foreign currency debt remains extremely low at <1.5% of GDP.",
    active_austerity: "Active government 'belt-tightening' directives, restricting administrative spends on luxury local council budgets, state receptions, and official travels.",
    aid_status: "Net Donor (primarily bilateral development lender). Top three recipient partners: Angola, Pakistan, and Venezuela (channeled through the Belt and Road Initiative).",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Precursors",
        corridor: "China Laboratories ➔ Mexico / SE Asia / Global Markets",
        scale: "$10B - $20B raw export shadow value",
        impact: "Fosters negative sovereign geopolitical relations; strict local drug policies contrasted with massive chemical precursor exports."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Southeast Asia / North Korea ➔ Mainland China Cities",
        scale: "$500M - $1.5B (forced labor/demographic marriage)",
        impact: "Under-the-radar labor in manufacturing; human exploitation heavily driven by historical demographic household gender imbalances."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "China Mainland ➔ Canada / USA / Singapore Havens",
        scale: "$100B - $150B+ illegal capital flight",
        impact: "Circumvents strict capital control caps of $50k/annual; fuels international real estate speculation via underground banking."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Global Diaspora Entities ➔ China Banking Network",
        scale: "Vast scale, integrated with traditional hubs",
        impact: "Proliferation of underground money brokers ('Feichien') that settle illicit accounts without formal bank reporting."
      }
    ]
  },
  india: {
    trade_blocs: "SAFTA (South Asian Free Trade Area), BIMSTEC, India-UAE Comprehensive Economic Partnership Agreement (CEPA), India-Australia ECTA, BRICS, SCO.",
    wto_status: "Official Member since January 1, 1995 (founding member status).",
    sovereign_debt: "81.5% of GDP (2023). Predominantly internal/domestic debt (~95% denominated in Indian Rupees); external sovereign debt is highly limited to under 5% of GDP.",
    active_austerity: "State-level fiscal consolidation targets coordinated under national Fiscal Responsibility and Budget Management (FRBM) guidelines.",
    aid_status: "Dual Status (Net donor regionally; Net recipient of multilateral development loans). Top bilateral recipients: Bhutan, Nepal, Afghanistan. Top multilateral donors: JICA (Japan), World Bank, ADB.",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Golden Crescent / Triangle ➔ Indian States (Punjab/Transit)",
        scale: "$5B - $15B illegal trade corridors",
        impact: "Severe public health strain in border states; drives high-value border militarization and naval drug patrol expenditure."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Rural/Sub-urban India ➔ Gulf States / Europe Corridors",
        scale: "$1.5B - $3B illicit migration networks",
        impact: "Proliferation of unregistered labor agents; high-risk pathways ('Dunki corridors') exploiting lower-income demographics."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "India Central Bank Region ➔ UAE / Switzerland / UK Havens",
        scale: "$10B - $15B through Hawala networks",
        impact: "Reduces corporate tax collections; drives significant domestic shadow finance market that undermines official rupee stability."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "GCC Gulf Nations / Europe ➔ India Households",
        scale: "Undetermined but high Hawala integration",
        impact: "Integrates black-market cash into clean rupee assets seamlessly, bypassing formal central bank reporting compliance."
      }
    ]
  },
  "south-korea": {
    trade_blocs: "RCEP, APEC, South Korea-US FTA (KORUS), selective bilateral agreements; CPTPP observer status.",
    wto_status: "Official Member since January 1, 1995.",
    sovereign_debt: "50.4% of GDP (2023). Predominantly domestic sovereign bonds; external foreign currency exposure remains negligible.",
    active_austerity: "Active fiscal rules targeting structural consolidated deficit containment below 3% of GDP ('sound fiscal budget' program).",
    aid_status: "Net Donor (OECD DAC member). Top three recipient partners: Vietnam, Philippines, and Bangladesh (via KOICA and EDCF).",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Southeast Asia / Western Europe ➔ South Korea Ports",
        scale: "$100M - $300M (estimated commercial scale)",
        impact: "Strict enforcement limits widespread addiction; high premium retail pricing attracts targeted international syndicates."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Southeast Asia / Rural China ➔ South Korea Cities",
        scale: "$200M - $500M trafficking channels",
        impact: "Illegal labor usage in manufacturing and agriculture; debt-bondage scams via broker networks exploiting tourist status."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "South Korea ➔ Global Tax Havens / Cryptocoin Networks",
        scale: "$1B - $3B via asset diversion",
        impact: "Circumvention of local foreign exchange limits; tax evasion by individuals and medium-sized export enterprises."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "South Korea ➔ China / Vietnam / Japan Markets",
        scale: "Growing digital token settlement volume",
        impact: "Extensive arbitrage via crypto pathways ('Kimchi Premium') to move illicit cash offshore bypass traditional reporting."
      }
    ]
  },
  vietnam: {
    trade_blocs: "ASEAN Economic Community, RCEP, CPTPP, EU-Vietnam Free Trade Agreement (EVFTA), APEC.",
    wto_status: "Official Member since January 11, 2007.",
    sovereign_debt: "37.1% of GDP (2023). Domestic zloty/dong component: ~21.5% of GDP; external development debt: ~15.6% of GDP.",
    active_austerity: "Strict administrative savings caps on regional assemblies, civil service streamlining, and energy infrastructure investment rationalization.",
    aid_status: "Net Recipient. Top three partners: JICA (Japan), World Bank (IDA), and Asian Development Bank (ADB).",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Golden Triangle (Laos) ➔ Vietnam Transit ➔ Global",
        scale: "$1B - $3B transshipment networks",
        impact: "Vietnam acts as a major overland and deep-water port transshipment hub, putting pressure on border security budgets."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Vietnam rural provinces ➔ United Kingdom / Western Europe",
        scale: "$500M - $1.2B smuggling cartels",
        impact: "Broker fees up to $40,000 per head; high-risk transit casualties and generational debt burden on rural source families."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "Vietnam Mainland ➔ United States / Canada / Australia",
        scale: "$2B - $4B (cash & shadow real estate agents)",
        impact: "Severe national capital drain to finance overseas immigration and investment properties, circumventing local bank rules."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Worldwide Viet Kieu Communities ➔ Vietnam Regions",
        scale: "Est. 8% - 12% via unregistered conduits",
        impact: "Shadow currency swap networks ('Chuyen Tien Nhanh') process international transfers, bypassing formal commercial fee structures."
      }
    ]
  },
  philippines: {
    trade_blocs: "ASEAN Economic Community, RCEP, APEC, JPEPA (Japan-Philippines Economic Partnership).",
    wto_status: "Official Member since January 1, 1995.",
    sovereign_debt: "60.2% of GDP (2023). Domestic debt: 41.5% of GDP (treasury securities); External foreign-currency debt represents 18.7% of GDP.",
    active_austerity: "Adherence to Medium-Term Fiscal Framework (MTFF) targeting debt ratio restoration below 60% by constraining non-infrastructure spending.",
    aid_status: "Net Recipient. Top three partners: JICA (Japan), Asian Development Bank (ADB), and USAID.",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Golden Triangle / China ➔ Philippines Urban Areas",
        scale: "$1B - $2B (Methamphetamine/Shabu focus)",
        impact: "Major domestic policing expenditures; high community crime rates and generation of massive untraceable cash reserves."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Philippines ➔ Middle East / SE Asia Cyber Scam Hubs",
        scale: "$500M - $1.5B irregular visa recruiters",
        impact: "Exposes thousands of Overseas Filipino Workers (OFWs) to modern slavery; emergence of online scam compound trafficking."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "Philippines ➔ Singapore / North America / Tax Havens",
        scale: "$1B - $2.5B annually via tax avoidance",
        impact: "Drains national tax revenue; massive funds laundered through local casinos, online gaming apps, and luxury real estate."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Global OFW Corridors ➔ Philippine Banks",
        scale: "Highly vulnerable cash-integration point",
        impact: "Historically led to FATF gray-listing; forces local banks to add costly compliance checks, increasing fees for millions of workers."
      }
    ]
  },
  malaysia: {
    trade_blocs: "ASEAN, RCEP, CPTPP, APEC.",
    wto_status: "Official Member since January 1, 1995 (founding member).",
    sovereign_debt: "61.1% of GDP (2023). Majority domestic bank-held debt; external foreign currency debt remains safely under 5%.",
    active_austerity: "Rationalization of blanket energy subsidies (shifting to target petrol and diesel subsidies) and consolidation of state-owned pensions.",
    aid_status: "Dual Status / Net Recipient relative to prime infrastructure ODA. Top partners: JICA, Asian Development Bank.",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Golden Triangle ➔ Malaysia Transit ➔ Australia / Indonesia",
        scale: "$1B - $2.5B transshipment value",
        impact: "Makes ports major hubs for illicit synthetic drugs; heavy naval patrol and coastal policing infrastructure spend."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Myanmar (Rohingya) / Bangladesh ➔ Malaysia Regions",
        scale: "$500M - $1B irregular broker networks",
        impact: "Illegal migrant labor exploitation in agriculture, palm oil, and construction; security patrolling costs in Andaman Sea."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "Kuala Lumpur Hubs ➔ Offshore Caribbean Tax Havens",
        scale: "$4B - $7B illicit trade misinvoicing",
        impact: "Drains national corporate tax foundation; linked to corruption proceeds being integrated into offshore portfolios."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Malaysia Cities ➔ Indonesia / Bangladesh / Nepal",
        scale: "Est. 10% - 15% through informal channels",
        impact: "Millions of foreign construction/service workers use Hawala to avoid commercial transaction fees, leaving trace gaps."
      }
    ]
  },
  russia: {
    trade_blocs: "Commonwealth of Independent States FTA (CISFTA), Eurasian Economic Union (EAEU), BRICS, SCO.",
    wto_status: "Official Member since August 22, 2012.",
    sovereign_debt: "14.9% of GDP (2023). Low ratio due to severe sanctions; domestic debt via local public OFZ bonds; external sovereign debt is effectively halted.",
    active_austerity: "Mandatory structural budget rule pegging expenditures to baseline Ural oil prices; civilian infrastructure spending deferrals.",
    aid_status: "Net Donor (highly state-aligned credit facilities). Top recipient destinations: Belarus, Cuba, and Syria.",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Afghanistan / Western Europe ➔ Russian Cities",
        scale: "$5B - $10B domestic consumption",
        impact: "Widespread public health burden; high border and city policing costs on Central Asian terrestrial borders."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Central Asia Republics ➔ Russian Urals/Moscow",
        scale: "$1B - $2.5B shadow labor networks",
        impact: "Exploitation of unregistered Central Asian workers in construction and shipping; high vulnerability to official police extortion."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "Russia ➔ UAE / Turkey / Cyprus / Offshore Islands",
        scale: "$30B+ sanctions-bypassing assets",
        impact: "Massive corporate capital escape via cryptocurrencies and shadow energy trading in international waters."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Russia Industrial Centers ➔ Central Asia Countries",
        scale: "Significant volume, heavily unmonitored",
        impact: "Sanction-blocked banks force reliance on peer-to-peer crypto networks to return migrant wages to families."
      }
    ]
  },
  poland: {
    trade_blocs: "European Union (EU Customs Union & Single Market).",
    wto_status: "Official Member since July 1, 1995.",
    sovereign_debt: "49.6% of GDP (2023). Domestic Polish zloty debt: ~37% of GDP; external foreign currency debt: ~12.6% of GDP.",
    active_austerity: "Fiscal consolidation under the European Union Excessive Deficit Procedure guidelines, focusing on non-defense budget segments.",
    aid_status: "Net Donor (EU contributor). Top bilateral recipient destinations: Ukraine, and selective Western Balkan countries.",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Western Europe / Poland ➔ Baltic State Markets",
        scale: "$500M - $1.2B domestic & transit trade",
        impact: "Poland acts as a major producer of synthetic amphetamines and a strategic transit corridor for Western imports."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Belarus border ➔ Poland ➔ Germany/Schengen Zone",
        scale: "$300M - $800M geopolitically motivated pipelines",
        impact: "Triggers immense border patrol and physical fortification costs; high humanitarian crisis risks in Eastern border forests."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "Poland Corporate Sector ➔ Cayman / Luxembourg Havens",
        scale: "$1B - $2.5B via transfer mispricing",
        impact: "Reduces government corporate income tax revenues; linked to complex VAT carousel schemes in the single market."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Poland ➔ Ukraine / Belarus / Eastern Neighbors",
        scale: "Moderate informal cash transfers",
        impact: "Millions of Ukrainian workers historically utilize physical cash and peer apps, dodging banking monitoring systems."
      }
    ]
  },
  germany: {
    trade_blocs: "European Union (EU), eurozone (European Economic Area).",
    wto_status: "Official Member since January 1, 1995 (founding member status).",
    sovereign_debt: "63.7% of GDP (2023). Dominated completely by internal euro-denominated federal bonds (Bunds) held by financial institutions.",
    active_austerity: "Strict constitutional 'Schuldenbremse' (debt brake) limiting federal structural deficit to 0.35% of GDP, resulting in comprehensive federal department spending freezes.",
    aid_status: "Net Donor (second largest in the world). Top recipient partners: Ukraine, India, and Syria.",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Latin America (Cocaine via Antwerp) ➔ Germany Cities",
        scale: "$15B - $25B active retail market",
        impact: "Rising container port organized crime (Hamburg); heavy policing and municipal social work/rehabilitation spending."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Middle East / South Asia / E. Europe ➔ Germany Hubs",
        scale: "$1.5B - $3.5B migrant networks",
        impact: "Massive municipal expenditure on processing and integration; fuels far-right geopolitical tensions and border controls."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "Germany Enterprises ➔ Caribbean Havens / Middle East",
        scale: "$10B - $20B tax evasion & laundering",
        impact: "Drains public purse via offshore shell firms; historic involvement in Cum-Ex asset fraud networks."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Germany urban areas ➔ Developing Nations",
        scale: "High volume of cash smurfing",
        impact: "Laundering of street drug proceeds through high-cash businesses (e.g., shisha bars, casinos, car dealerships, real estate)."
      }
    ]
  },
  uk: {
    trade_blocs: "CPTPP (joining formally in 2024), UK-EU Trade and Cooperation Agreement (TCA).",
    wto_status: "Official Member since January 1, 1995.",
    sovereign_debt: "97.6% of GDP (2023). Predominantly internal sterling-denominated gilts; external central banks hold approximately ~25% of total debt.",
    active_austerity: "Ongoing public service expenditure targets, civil service payroll containment, and systematic public investment reviews.",
    aid_status: "Net Donor (Targeting 0.5% GNI GfD target). Top recipient destinations: Ukraine, Afghanistan, and Yemen.",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Latin America / Europe ➔ United Kingdom Metro Areas",
        scale: "$10B - $16B retail consumption",
        impact: "Opioid and cocaine surge; fuels urban 'county lines' gang networks, placing strain on local NHS hospital systems."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Northern France Coast ➔ UK English Channel (Small Boats)",
        scale: "$500M - $1B channel cartel income",
        impact: "Massive political pressure; cost of thousands of pounds daily for state temporary hotel/asylum housing facilities."
      },
      {
        vector: "Illicit Capital Flight (Inflows/Outflows)",
        corridor: "Global Oligarchs / Criminal Havens ➔ London Property",
        scale: "$40B+ annually ('London Laundromat')",
        impact: "Raises real estate prices in London; requires immense FCA banking oversight structures to avoid shell company incorporation."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "United Kingdom ➔ South Asia / Eastern Europe",
        scale: "Significant Hawala corridor volume",
        impact: "Criminals exploit small money transfer operators to blend shadow cash with authentic migrant family remittances."
      }
    ]
  },
  switzerland: {
    trade_blocs: "EFTA (European Free Trade Association), Bilateral Agreements with the European Union (EU).",
    wto_status: "Official Member since July 1, 1995.",
    sovereign_debt: "38.3% of GDP (2023). Almost entirely internal sovereign debt issued in Swiss Francs (CHF).",
    active_austerity: "Constitutional 'Schuldenbremse' (debt brake) requiring balanced budgets over economic cycles, resulting in structural spending ceilings.",
    aid_status: "Net Donor. Top recipients: Ukraine, and regional international development initiatives.",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Western Europe ➔ Switzerland Urban Hubs",
        scale: "$300M - $800M high-end consumption",
        impact: "High wealth levels support consumption of high-purity cocaine; police focus on internal retail networks over borders."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Eastern Europe / North Africa ➔ Switzerland Cities",
        scale: "$100M - $250M underground corridors",
        impact: "Exploitation of agricultural and housekeeping labor; sex trafficking; forces high-density inspector raids of domestic businesses."
      },
      {
        vector: "Illicit Capital Flight (Inflows)",
        corridor: "Global Nations ➔ Swiss Account Vaults",
        scale: "$10B - $30B wealth management flight",
        impact: "Gold smelting and refinery auditing gaps present laundering challenges despite strict banking AML alignments."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Swiss Financial Hubs ➔ Developed & Developing States",
        scale: "Underlying risk within global trade systems",
        impact: "Trade-based money laundering (TBML) and invoice fraud remain active risks in Swiss commodity trading houses."
      }
    ]
  },
  australia: {
    trade_blocs: "CPTPP, RCEP, APEC, Australia-US FTA (AUSFTA), CHAFTA (China-Australia), ANZCERTA (New Zealand).",
    wto_status: "Official Member since January 1, 1995 (founding member status).",
    sovereign_debt: "52.8% of GDP (2023). Primarily domestic AUD bonds held by international and local financial institutes.",
    active_austerity: "State-level infrastructure project reviews and federal consolidation of resource royalties to address inflation risks.",
    aid_status: "Net Donor. Top recipient destinations: Papua New Guinea, Solomon Islands, and Timor-Leste.",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Southeast Asia / South America ➔ Australia Cities",
        scale: "$8B - $12B highly structured market",
        impact: "Cocaine & Meth retail values are 3-5x the global average; attracts transnational syndicates, putting strain on AFP policing."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "South Asia / Middle East Maritime ➔ Australian Waters",
        scale: "$100M - $300M broker networks",
        impact: "Operation Sovereign Borders strictly deters boat entry; redirects smuggling into tourist visa abuse and cyber scams."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "Australia Business Sector ➔ Asian Tax Havens",
        scale: "$2B - $4B (Corporate transfer pricing focus)",
        impact: "Lost corporate taxes; laundering facilitated by placing capital in online gambling sites and cryptocurrency exchanges."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Australia Cities ➔ Greater Asia Region",
        scale: "Moderate digital & physical token volumes",
        impact: "Strict remittance laws (AUSTRAC) push illicit funds into decentralized finance and digital asset chains."
      }
    ]
  },
  brazil: {
    trade_blocs: "MERCOSUR (Southern Common Market), BRICS.",
    wto_status: "Official Member since January 1, 1995 (founding member status).",
    sovereign_debt: "74.1% of GDP (2023). Predominantly internal debt (~90% real-denominated bonds); external foreign-held liabilities represent less than 10% of total public debt.",
    active_austerity: "Implementation of the New Fiscal Framework ('Arcabouço Fiscal'), capping federal expenditure growth to 70% of real revenue growth.",
    aid_status: "Dual Status (Net recipient of global environment/sustainable development grants; Net donor of technical cooperation). Top donor partners: Germany and Norway (via the Amazon Fund).",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Bolivia / Peru / Colombia ➔ Brazil Ports ➔ Europe",
        scale: "$10B - $20B major transit corridors",
        impact: "Brazil serves as a domestic market and transshipment dock; creates favela territory violence and sky-high police budgets."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Venezuela / Haiti ➔ Brazil Frontier Towns",
        scale: "$200M - $500M emergency border brokers",
        impact: "Migrants face labor exploitation in agricultural enterprises and urban apparel sweatshops."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "Tri-Border Area (TBA) ➔ Paraguay Shopping Hubs",
        scale: "$3B - $6B unmonitored cash & weapons",
        impact: "Inflow of automatic firearms; fuels crime syndicates; heavy federal border defense and monitoring cost."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Brazil Cities ➔ Paraguay / Europe / USA",
        scale: "Highly active parallel dollar markets",
        impact: "Extensive trade-based laundering ('Doleiros') integrates illicit assets through import invoicing tricks."
      }
    ]
  },
  canada: {
    trade_blocs: "USMCA (United States-Mexico-Canada Agreement), CPTPP (Comprehensive and Progressive Agreement for Trans-Pacific Partnership), APEC, G7, G20.",
    wto_status: "Official Member since January 1, 1995 (founding GATT contracting party since January 1, 1948).",
    sovereign_debt: "107.0% of GDP (2023 estimate). Majority is denominated in Canadian Dollars (CAD) and held internally by domestic institutions and households.",
    active_austerity: "No structural IMF programs. Domestic fiscal restraint targets provincial deficits, carbon tax adjustment frictions, and government efficiency reviews.",
    aid_status: "Net Donor. Major contributor to multilateral development banks and global health initiatives, primarily via Global Affairs Canada (GAC).",
    imf_program: "No active IMF program.",
    shadow_flows: [
      {
        vector: "Corporate Transfer Pricing & Resource Revenue Flight",
        corridor: "Canada Resource Extraction (Mining/Oil) ➔ Low-Tax European/Caribbean Jurisdictions",
        scale: "$3.5B - $6.0B estimated annual tax shift",
        impact: "Erodes provincial resource royalties and national corporate tax revenues from natural resource sectors."
      },
      {
        vector: "Snow Washing & Real Estate Laundering",
        corridor: "Global Illicit Capital (China/Russia/US) ➔ Vancouver & Toronto Real Estate Markets",
        scale: "$5B+ estimated annual volume",
        impact: "Drives up urban housing costs, reduces affordability for citizens, and exploits lack of beneficial ownership transparency."
      },
      {
        vector: "IP Offshoring & Technology Patent Licensing",
        corridor: "Canadian Tech Centers ➔ Singapore & European Havens",
        scale: "$1.0B - $2.0B estimated annual licensing shift",
        impact: "Shifts taxable revenues from software and telecommunications patents to low-tax jurisdictions."
      }
    ]
  },
  venezuela: {
    trade_blocs: "Mercosur (Currently Suspended since 2017), ALBA-TCP (Bolivarian Alliance for the Peoples of Our America), Petrocaribe Framework.",
    wto_status: "Official Member since June 14, 1996.",
    sovereign_debt: "160.0% of GDP (highly distressed). Heavily dominated by external foreign-currency bonds, oil-backed loans from China/Russia, and defaulted sovereign debt.",
    active_austerity: "Unofficial and severe. Unilateral spending cuts, massive reductions in real public sector wages (causing extreme public servant brain drain), hyperinflationary monetization, and collapse of public service budgets.",
    aid_status: "Net Recipient. Receives humanitarian aid and vaccine deliveries from United Nations agencies, Red Cross, and bilateral partners including China, Russia, and Cuba.",
    imf_program: "No active IMF program due to unrecognized governance and political disputes, though domestic hyperinflation has led to informal dollarization and currency overhauls.",
    shadow_flows: [
      {
        vector: "Gold Smuggling & Informal Extraction",
        corridor: "Orinoco Mining Arc (Arco Minero) ➔ Caribbean / Middle East / Turkey Refineries",
        scale: "$1.5B - $2.5B estimated annual shadow volume",
        impact: "Severe environmental mercury poisoning of Amazon rivers; funds non-state armed actors and bypasses central bank foreign reserves."
      },
      {
        vector: "Cocaine & Transnational Narcotics Transit",
        corridor: "Colombia Border / Apure State ➔ Venezuelan Coast / Caribbean ➔ North America / Europe",
        scale: "$5B - $9B estimated annual retail value",
        impact: "Corruption of local civil and military administrative sectors; fuels border region conflict and gang territorial control."
      },
      {
        vector: "Fuel Subsidy Contraband Arbitrage",
        corridor: "Venezuela Refineries ➔ Colombian Border (Cúcuta/Guajira) / Caribbean Islands",
        scale: "$500M - $1.0B historically (now constrained by refinery output collapse)",
        impact: "Severe domestic fuel scarcity and rationing; generates immense black market profits for frontier smuggling networks."
      }
    ]
  },
  mexico: {
    trade_blocs: "USMCA (United States-Mexico-Canada Agreement), Pacific Alliance, CPTPP, APEC.",
    wto_status: "Official Member since January 1, 1995.",
    sovereign_debt: "47.9% of GDP (2023). Domestic debt (pesos): 36.4% of GDP; external debt (primarily dollar-denominated bonds): 11.5% of GDP.",
    active_austerity: "Federal Constitutional Republican Austerity Law limiting administrative costs, operational expenses, and executive agency budgets.",
    aid_status: "Net Recipient. Top partners: USAID, World Bank, and JICA.",
    imf_program: "No active IMF structural adjustment program (maintains a precautionary USD 35 billion Flexible Credit Line with no structural conditionality).",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Mexico (Sinaloa/Jalisco) ➔ United States / Canada",
        scale: "$12B – $40B+ (Comparable to licit ag exports)",
        impact: "High inward illicit financial flows (IFFs); partially laundered via retail, real estate, and smurfed remittances."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Central America/Asia/Africa ➔ Mexico Transit ➔ US Border",
        scale: "$2B – $5B",
        impact: "Generates immense regional extortion revenue; high overlap with cartel-controlled border crossing checkpoints (plazas)."
      },
      {
        vector: "Illicit Outflows (Weapons/Cash)",
        corridor: "United States (Southwest Border) ➔ Mexico",
        scale: "$5B – $10B bulk cash",
        impact: "Outward flow of high-caliber weapons and untraceable cash that fuels informal economy security costs and militarization."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "United States ➔ Mexico (Michoacán, Sinaloa, Jalisco)",
        scale: "Estimated 5%–10% of total flows",
        impact: "High vulnerability; cartels utilize networks of 'clones/smurfs' to split illegal wholesale drug gains into legal $390 family transfers."
      }
    ]
  },
  drc: {
    trade_blocs: "AfCFTA, EAC (East African Community), SADC (Southern African Development Community), COMESA.",
    wto_status: "Official Member since January 1, 1997.",
    sovereign_debt: "13.6% of GDP (2023). Extremely low debt ceiling due to historic completion of HIPC debt relief; Domestic: 4.8% of GDP; External: 8.8% of GDP.",
    active_austerity: "Structural wage ceilings in regional administrations, restrictions on state discretionary funds, and rigid domestic fuel subsidy controls.",
    aid_status: "Net Recipient. Top partners: USAID, World Bank, and the Global Fund.",
    imf_program: "Completed a USD 1.5 billion Extended Credit Facility (ECF) in mid-2024. Active reforms: Central bank governance structural audits, transparency in state mineral contracts, and building net reserves.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Drugs",
        corridor: "Central/East Africa ➔ DRC Transit Hubs",
        scale: "$100M - $250M (estimated local footprint)",
        impact: "Low-value domestic market but prominent regional routes cross unstable sectors, funding active rebel militias."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "DRC Conflict Zones ➔ Southern Africa / Europe",
        scale: "$500M - $1B smuggling cartels",
        impact: "High rate of child labor exploitation and modern slavery in remote artisanal mines (cobalt and gold mining and agriculture)."
      },
      {
        vector: "Conflict Minerals Outflow",
        corridor: "Unregulated Mining ➔ Rwanda / Uganda ➔ UAE",
        scale: "$2B - $4B smuggled minerals",
        impact: "Loss of state royalties and export taxes; direct funding of armed insurgencies in Eastern provinces."
      },
      {
        vector: "Laundering via Mineral Trade",
        corridor: "Lualaba / Kivu Artisanal Wells ➔ International Ports",
        scale: "Vast gold/diamond informal integration",
        impact: "Raw materials swapped directly for foreign assets, circumventing traditional central banking tax footprints completely."
      }
    ]
  },
  nigeria: {
    trade_blocs: "AfCFTA (African Continental Free Trade Area), ECOWAS.",
    wto_status: "Official Member since January 1, 1995.",
    sovereign_debt: "42.9% of GDP (2023). Domestic debt: 26.6% of GDP; External debt: 16.3% of GDP.",
    active_austerity: "Major fiscal consolidation: removal of premium fuel subsidies in 2023, deregulation/unification of naira exchange rate, cuts to non-essential agency salaries.",
    aid_status: "Net Recipient. Top partners: World Bank (IDA), African Development Bank (AfDB), and USAID.",
    imf_program: "No active IMF structural adjustment program (Nigeria received Article IV support but has historically resisted formal IMF facilities).",
    shadow_flows: [
      {
        vector: "Narcotics & Illicit Pharma",
        corridor: "South America (Cocaine) / Asia (Tramadol) ➔ Nigeria Hubs",
        scale: "$2B - $5B transit & domestic value",
        impact: "Nigeria acts as a West African gateway; high rate of synthetic opioid abuse and security spending in port cities."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Southern Nigeria ➔ Sahara Corridor ➔ Italy/Europe",
        scale: "$1B - $2.5B human smuggling rings",
        impact: "Exploitation of vulnerable individuals via Sahara and sea routes; huge extortion fees, high loss of life in transit."
      },
      {
        vector: "Illicit Crude Theft (Bunkering)",
        corridor: "Niger Delta Creeks ➔ Gulf of Guinea Tankers",
        scale: "$5B - $12B (substantial oil theft volume)",
        impact: "Weakens official petroleum tax revenues; funds maritime piracy and causes massive environmental oil spill damage."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "Eurozone / Gulf / US ➔ Nigeria Urban Real Estate",
        scale: "Significant mix with legal diaspora transfers",
        impact: "Bypasses standard foreign Exchange reserves via black-market currency apps and peer crypto networks."
      }
    ]
  },
  "south-africa": {
    trade_blocs: "SADC, Southern African Customs Union (SACU), BRICS.",
    wto_status: "Official Member since January 1, 1995.",
    sovereign_debt: "73.9% of GDP (2023). Predominantly internal sovereign debt (~90% denominated in South African Rand); external debt remains structurally low.",
    active_austerity: "Medium-Term Budget Policy consolidation: limits on public wage-increases, state-owned enterprise (Eskom, Transnet) bailout conditions, and infrastructure capital project delays.",
    aid_status: "Net Recipient of climate-transition grants and low-interest loans. Top partners: World Bank, JICA, and European Investment Bank.",
    imf_program: "No active IMF structural adjustment program.",
    shadow_flows: [
      {
        vector: "Narcotics / Port Smuggling",
        corridor: "South America / SW Asia ➔ Durban Port ➔ Australia",
        scale: "$1B - $3B transit narcotics trade",
        impact: "Durban serves as a strategic transshipment dock; creates local synthetic drug (meth/tik) addiction crises and police costs."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Mozambique / Zimbabwe ➔ South Africa Border States",
        scale: "$500M - $1.5B undocumented networks",
        impact: "Illegal migration feeds agricultural, construction, and mining sectors, causing periodic xenophobic civil clashes."
      },
      {
        vector: "Illicit Capital Flight (Outflows)",
        corridor: "Corporate Sector ➔ Offshore Tax Havens",
        scale: "$5B - $10B precious metal undervaluation",
        impact: "Substantial tax evasion through trade price manipulation of platinum, gold; deprives local infrastructure of state spend."
      },
      {
        vector: "Laundering via Remittances",
        corridor: "South Africa Hubs ➔ Zimbabwe / Lesotho / Malawi",
        scale: "Significant untraceable cash volumes",
        impact: "Escapes SARB capital control regulations via physical cash border smuggling and cross-border bus transport networks."
      }
    ]
  },
  ethiopia: {
    trade_blocs: "AfCFTA, COMESA (observer), BRICS membership since January 2024.",
    wto_status: "Observer Status (active WTO accession negotiations ongoing since 2003).",
    sovereign_debt: "46.8% of GDP (2023). Domestic debt (central bank advances, commercial bills): 25.4%; External debt: 21.4% of GDP (significant share held by China).",
    active_austerity: "Severe restrictions on federal borrowing from the central bank, rationalization of regional administrative grants, and state-enterprise investment delays.",
    aid_status: "Net Recipient. Top partners: World Bank (IDA), USAID, and JICA.",
    imf_program: "Active USD 3.4 billion Extended Credit Facility (ECF) approved in July 2024. Key conditions: Transition to a market-determined Birr exchange rate, float of currency, state bank restructuring, and capping credit expansion.",
    shadow_flows: [
      {
        vector: "Narcotics Airport Transit",
        corridor: "South Asia / S. America ➔ Addis Ababa Airport ➔ Global",
        scale: "$100M - $250M mule pathways",
        impact: "Bole International Airport serves as an aviation hub for illegal drug transits, straining federal inspection budgets."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Rural Ethiopia ➔ Yemen ➔ Kingdom of Saudi Arabia",
        scale: "$500M - $1.2B Eastern route brokers",
        impact: "Exposes thousands of migrants to deadly military containment zones and deepens generational household rural debt."
      },
      {
        vector: "Agriculture Misinvoicing",
        corridor: "Ethiopian Highlands ➔ Gulf Kingdoms / regional markets",
        scale: "$1B - $2.5B unrecorded coffee & khat",
        impact: "Smuggling agricultural produce out of border zones deprives the central state of scarce foreign exchange cash."
      },
      {
        vector: "Shadow Currency Remittances",
        corridor: "North America / Gulf ➔ Informal Addis Swaps",
        scale: "Est. 60% of total transfer inflow value",
        impact: "A huge parallel exchange rate premium draws remittances out of official banks, starving the state of central dollars."
      }
    ]
  },
  sudan: {
    trade_blocs: "COMESA, GAFTA (Greater Arab Free Trade Area).",
    wto_status: "Observer Status (WTO accession process frozen due to ongoing domestic conflicts).",
    sovereign_debt: "182.5% of GDP (2023). Unsustainable; multilateral and bilateral external debt represents over 85% of total liabilities.",
    active_austerity: "Total collapse of normal budgetary frameworks; administrative spending freeze, immediate reprioritization of defense and survival budgets.",
    aid_status: "Net Recipient (exclusively humanitarian and emergency food aid). Top partners: World Food Programme (WFP), United States, and European Commission.",
    imf_program: "No active IMF structural adjustment program (the IMF Staff-Monitored Program collapsed following the October 2021 change).",
    shadow_flows: [
      {
        vector: "Narcotics & Pharma Smuggling",
        corridor: "S. Arabia / Libya ➔ Sudan Border Points",
        scale: "$100M - $300M Captagon transit",
        impact: "Absence of border control allows drugs to transit unstable areas, funding militarized rebel checkpoints."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Horn of Africa ➔ Sudan Transit ➔ Libya ➔ Europe",
        scale: "$500M - $1.5B transnational pipelines",
        impact: "Hostage ransom schemes run by paramilitary factions; high risk of labor slavery in rebel-held zones."
      },
      {
        vector: "Conflict Gold Outflows",
        corridor: "Sudan Jebel Amer Mines ➔ UAE / Russian PMC Assets",
        scale: "$3B - $5B smuggled artisanal gold",
        impact: "Loss of mineral revenues; funds acquisition of heavy military weaponry by armed factions outside central bank audit."
      },
      {
        vector: "Shadow Peer-to-Peer Finance",
        corridor: "GCC Nations ➔ Sudanese Refugee Communities",
        scale: "100% of family liquidity, unmonitored",
        impact: "Complete collapse of national banks forces reliance on unregistered mobile apps and physical dollar networks."
      }
    ]
  },
  chad: {
    trade_blocs: "CEMAC (Economic and Monetary Community of Central Africa), AfCFTA.",
    wto_status: "Official Member since October 19, 1996.",
    sovereign_debt: "41.6% of GDP (2023). Domestic local debt (CEMAC bonds): 19.4%; External debt: 22.2% of GDP (highly dependent on Glencore petroleum-backed commercial loans).",
    active_austerity: "Strict wage-bill ceiling controls on public services, cuts to regional fuel subsidies, and capping of non-essential military equipment investments.",
    aid_status: "Net Recipient. Top partners: World Bank, France (AFD), and African Development Bank.",
    imf_program: "Active USD 570 million Extended Credit Facility (ECF) approved in December 2021. Key reforms: Glencore commercial debt restructuring, increasing fiscal transparency in hydrocarbon sectors, and boosting non-oil tax revenues.",
    shadow_flows: [
      {
        vector: "Narcotics / Pharma Trafficking",
        corridor: "Nigeria / Libya ➔ Northern Chad Desert",
        scale: "$50M - $150M Tramadol corridors",
        impact: "Uncontrolled smuggling of prescription opioids; directly funds armed banditry and rebel groups in desert zones."
      },
      {
        vector: "Human Smuggling & Trafficking",
        corridor: "Chad Transit ➔ Southern Libya Gold Camps",
        scale: "$100M - $300M irregular migration routes",
        impact: "Agadez and Chadian migrants forced into labor in Tibesti gold mining zones under rebel commander oversight."
      },
      {
        vector: "Arms & Livestock Smuggling",
        corridor: "Sudan / Libya Border ➔ Chad Markets",
        scale: "$200M - $500M porous border trade",
        impact: "Drains regional fiscal customs potential; inflow of high-caliber weapons from Libyan warehouses escalates conflicts."
      },
      {
        vector: "Unregulated Cash Remittances",
        corridor: "Cameroon / France ➔ Chad Cities",
        scale: "Est. 12% - 15% through informal physical couriers",
        impact: "Dependence on cash transactions bypasses the central bank, weakening standard CEMAC reserve indicators."
      }
    ]
  },
  niger: {
    trade_blocs: "AfCFTA, ECOWAS, WAEMU (West African Economic and Monetary Union).",
    wto_status: "Official Member since March 27, 1996.",
    sovereign_debt: "51.2% of GDP (2023). Domestic regional WAEMU notes: ~23% of GDP; External debt: ~28.2% of GDP (principally multilateral loans).",
    active_austerity: "Post-coup budget reductions (slashing operational expenditures by 40% due to regional suspensions), and freezes on public infrastructure investments.",
    aid_status: "Net Recipient relative to ODA streams (severely disrupted by political changes). Top partners: World Bank, European Union, and West African CORID partners.",
    imf_program: "Active USD 275 million Extended Credit Facility (ECF) rescheduled in mid-2024. Key conditions: Restoration of basic budgetary controls, anti-corruption transparency in state oil sales, and targeting domestic revenue mobilization.",
    shadow_flows: [
      {
        vector: "Narcotics & Synthetic Opioids",
        corridor: "West Africa Ports ➔ Niger (Agadez) ➔ Libya/Europe",
        scale: "$100M - $300M overland transport value",
        impact: "Sahelian drug transit routes bypass official patrols, funding localized rebel and insurgent security networks."
      },
      {
        vector: "Human Smuggling & Migrant Flows",
        corridor: "West Africa (ECOWAS) ➔ Agadez ➔ Libya / Italy",
        scale: "$500M - $1.2B smuggling corridor footprint",
        impact: "Agadez historically served as the regional migration hub. The late 2023 repeal of Law 36-2015 re-legalized local migrant transport."
      },
      {
        vector: "Arms & Fuel Inflows",
        corridor: "Libya / Nigeria ➔ Niger Border Districts",
        scale: "$300M - $600M Sahara weapons corridors",
        impact: "Inflow of weapons fuels regional instability, requiring high security defense allocation within a strained state budget."
      },
      {
        vector: "Shadow WAEMU Remittances",
        corridor: "Nigeria / Benin ➔ Niger Rural Communes",
        scale: "Highly active parallel cash routes",
        impact: "Sanctions and border closures drive currency flows underground, escaping standard central bank regional logging."
      }
    ]
  },
  egypt: {
    trade_blocs: "AfCFTA (African Continental Free Trade Area), COMESA (Common Market for Eastern and Southern Africa), GAFTA (Greater Arab Free Trade Area), and Egypt-EU Association Agreement.",
    wto_status: "Official Member since June 30, 1995 (original GATT contracting party since 1970).",
    sovereign_debt: "92.4% of GDP (2024). Heavily split between domestic treasury bonds and external debt held by GCC states and multilateral lenders.",
    active_austerity: "Phasing out of bread and fuel subsidies, freezing of major state capital investments, and civil service salary and hiring freezes to balance fiscal accounts.",
    aid_status: "Net Recipient. Top contributors: USAID development grants, Gulf Cooperation Council (GCC) investment funds, and the EU structural reform envelope.",
    imf_program: "Active augmented USD 8 billion Extended Fund Facility (EFF) approved in early 2024. Conditionalities include establishing a fully flexible floating exchange rate regime, severe fiscal consolidation, and privatization of major state and military-owned enterprises.",
    shadow_flows: [
      {
        vector: "Underground Foreign Exchange (Parallel Forex Market)",
        corridor: "Gulf Working Diaspora ➔ Egypt Informal Cash Networks",
        scale: "$3B - $5B annually bypassed volume",
        impact: "Severely starving the Central Bank of official foreign currency reserves, generating acute import blockades for grain and industrial feedstuffs."
      },
      {
        vector: "Transit Smuggling & Irregular Human Streams",
        corridor: "Horn of Africa / Sudan ➔ Egypt ➔ Southern Europe",
        scale: "$400M - $750M human-broker network footprint",
        impact: "Incurring high social security policing costs; increases density of informal housing settlements in Cairo's urban fringe."
      },
      {
        vector: "Trade Misinvoicing (Suez Canal Gateways)",
        corridor: "East Asia ➔ Egypt SCZone ➔ Mediterranean Markets",
        scale: "$1B - $2B annually in unrecorded valuations",
        impact: "Causes extreme loss of customs tariff collections; distorts official external trade ledger profiles."
      },
      {
        vector: "Antiquities Looting & Trafficking",
        corridor: "Sovereign Archaeological Pits ➔ Global Illicit Channels",
        scale: "$150M - $300M black market trade",
        impact: "Irreparable degradation of physical case study cultural reserves; strengthens international organized crime nodes."
      }
    ]
  },
  ukraine: {
    trade_blocs: "EU-Ukraine Deep and Comprehensive Free Trade Area (DCFTA), GUAM Organization for Democracy and Economic Development, and bilateral free trade agreements with EFTA and Canada.",
    wto_status: "Official Member since May 16, 2008.",
    sovereign_debt: "84.5% of GDP (2024 forecast with heavy bilateral support). High reliance on soft concessions.",
    active_austerity: "Wartime budget prioritization, freezing of non-defense civil hiring, pension indexing limits, and redirection of regional infrastructure grants to sovereign defense channels.",
    aid_status: "Net Recipient. Unprecedented financial support packages from the European Union (Ukraine Facility), United States, IMF, and World Bank.",
    imf_program: "Active USD 15.6 billion Extended Fund Facility (EFF) active through 2027, forming part of a larger multi-donor mobilization effort. Conditionalities center on structural governance reforms, anti-corruption tax compliance codes, and energy market liberalizations.",
    shadow_flows: [
      {
        vector: "Capital Flight & Offshore Holding Transfers",
        corridor: "Ukraine Business Owners ➔ Baltic / EU Banking Systems",
        scale: "$4B - $6B annual estimated bypass",
        impact: "Reduces core domestic liquidity within commercial bank systems, starving wartime investment projects of private capital."
      },
      {
        vector: "Under-the-Counter Border Port Logistics",
        corridor: "Ukraine ➔ Western Land Borders (Poland, Slovakia, Romania)",
        scale: "$1.2B - $2.5B unlogged freight value",
        impact: "Distorts customs tariff yields, evades corporate tax audits, and generates spatial trading disputes with border farmers in neighbor countries."
      },
      {
        vector: "Shadow Grain Arbitrages",
        corridor: "Danube Ports / Rivers ➔ Mediterranean Black-Market Buyers",
        scale: "$600M - $900M unrecorded grain shipments",
        impact: "Creates major discrepancies in official food security export reporting, allowing traders to avoid mandatory state repatriation of hard currencies."
      }
    ]
  },
  belgium: {
    trade_blocs: "European Union (EU) Single Market, Eurozone, Schengen Area, Benelux Economic Union, and EU bilateral/multi-lateral trade systems.",
    wto_status: "Official Member since January 1, 1995 (EU coordination; GATT signatory since January 1, 1948).",
    sovereign_debt: "105.2% of GDP (2024 forecast). Predominantly Euro-denominated and held globally/domestically.",
    active_austerity: "Moderate structural fiscal efforts under EU Stability and Growth Pact boundaries, including civil service hiring freezes, state agency operating budget trims, and healthcare efficiency reforms.",
    aid_status: "Net Donor. High contributor to global Official Development Assistance (ODA), prioritizing Central Africa (DRC, Rwanda, Burundi) and multilateral EU humanitarian systems.",
    imf_program: "No active IMF program (standard biennial Article IV surveillance with positive structural standing).",
    shadow_flows: [
      {
        vector: "Cocaine Trafficking & Maritime Port Incursions",
        corridor: "Latin America (Ecuador/Colombia) ➔ Port of Antwerp-Bruges ➔ European Distribution Networks",
        scale: "€10B - €15B estimated transit footprint annually",
        impact: "Infiltrates maritime logistics chains, fuels localized street-level violence, distorts luxury asset valuation, and poses security strains on port security."
      },
      {
        vector: "Synthetic Drug Production & Precursor Chemical Arbitrages",
        corridor: "East Asia Precursors ➔ Domestic Lab Clusters (Flanders/Wallonia) ➔ Global Consumer Markets",
        scale: "€2B - €4B estimated annual export value",
        impact: "Leads to heavy chemical waste dumping in cross-border nature reserves, triggers intensive local security investigations, and fosters criminal collaboration with Dutch networks."
      },
      {
        vector: "Rough Diamond Trade Misinvoicing & Sourcing Concealment",
        corridor: "Conflict Zones / Sanctioned Mines ➔ Antwerp World Diamond Centre (AWDC) ➔ Luxury Trade Hubs",
        scale: "€500M - €1B in unregistered or rerouted gem shipments",
        impact: "Undermines full transparency of the Kimberley Process, evades target state import/export tax levies, and obscures supply origin tracks."
      },
      {
        vector: "VAT Carousel & MTIC Tax Fraud",
        corridor: "Belgium ➔ Multi-Boundary EU Transit Lines (France, Netherlands, Germany)",
        scale: "€800M - €1.5B annual lost tax revenues",
        impact: "Severely drains sovereign treasury resources, distorts official intra-EU trade data registries, and feeds funding into secondary illicit networks."
      }
    ]
  },
  netherlands: {
    trade_blocs: "European Union (EU Customs Union & Single Market), Eurozone, Schengen Area, European Economic Area (EEA), and G7/G20 structures.",
    wto_status: "Official Member since January 1, 1995 (founding GATT contracting party since January 1, 1948).",
    sovereign_debt: "47.2% of GDP (2024 estimate). Dominated by Euro-denominated sovereign bonds held by domestic bank consortiums and the European Central Bank.",
    active_austerity: "Adherence to reformed EU Stability and Growth Pact rules, focusing on domestic expenditure rules and balancing climate adaptation budgets (delta works) with health spending.",
    aid_status: "Net Donor. Major contributor to European Union Development systems and direct bilateral development programs.",
    imf_program: "No active IMF program.",
    shadow_flows: [
      {
        vector: "Corporate IP & Royalty Shifting ('Dutch Sandwich')",
        corridor: "US/Global Multi-nationals ➔ Dutch Holding Companies ➔ Offshore Caribbean Havens",
        scale: "$15B - $25B annually in diverted capital",
        impact: "Creates high distortions in national corporate balance sheet reporting, attracting scrutiny from EU and US tax authorities."
      },
      {
        vector: "Cocaine Trafficking & Maritime Port Smuggling",
        corridor: "South America (Ecuador/Peru) ➔ Port of Rotterdam ➔ European Distribution Corridors",
        scale: "€8B - €12B estimated annual transit value",
        impact: "Infiltrates maritime logistics hubs, fuels gang violence in urban centers, and requires heavy state investments in customs and naval security."
      },
      {
        vector: "Synthetic Drug Manufacturing & Precursor Sourcing",
        corridor: "East Asia Precursors ➔ Dutch Laboratories ➔ Global Consumer Markets",
        scale: "€1.5B - €3.0B estimated annual export value",
        impact: "Causes ecological damage through illicit chemical waste dumping, requiring active policing and soil decontamination projects."
      }
    ]
  },
  indonesia: {
    trade_blocs: "ASEAN Economic Community (AEC), RCEP (Regional Comprehensive Economic Partnership), APEC, and various bilateral FTAs (IJEPA, IA-CEPA).",
    wto_status: "Official Member since January 1, 1995 (founding member; GATT contracting partner since 1950).",
    sovereign_debt: "39.1% of GDP (2024 forecast). Strongly governed under a strict statutory debt ceiling of 60% of GDP; balanced domestic rupiah bonds and foreign development capital.",
    active_austerity: "Targeted petrol and diesel subsidy rationalization, civil service payroll containment within regional governments, and rigorous project prioritization in public works.",
    aid_status: "Dual Status (Net recipient of global climate mitigation and infrastructure aid; international technical donor via Indonesian Aid framework).",
    imf_program: "No active IMF program since graduating from the post-AFC adjustment cycle. High state liquidity and external reserves support solid independent standing.",
    shadow_flows: [
      {
        vector: "Narcotics Trafficking Channels (Golden Triangle transit)",
        corridor: "Myanmar/Laos ➔ Strait of Malacca ➔ Sunda Strait ➔ Java Urban Centers",
        scale: "$1.2B - $2.5B estimated annual footprint",
        impact: "Requires massive maritime border patrol expenditures; drives subterranean money-broker networks that bypass formal bank corridors."
      },
      {
        vector: "Illegal Logging & Unregulated Mineral Smuggling",
        corridor: "Kalimantan/Sulawesi Forests & Mines ➔ Maritime Transit ➔ East Asian Ports",
        scale: "$1.5B - $3.0B estimated annual asset value",
        impact: "Deprives the central state of commodity royal taxes, damages fragile critical ecosystems, and distorts official trade balance records."
      },
      {
        vector: "Illicit Capital Flight via Transfer Mispricing",
        corridor: "Indonesia Resource Enterprises ➔ Offshore Island Tax Havens / Singapore",
        scale: "$4B - $7B estimated annual lost capital",
        impact: "Undermines corporate income tax collections and reduces the sovereign reserve growth rate."
      }
    ]
  },
  iran: {
    trade_blocs: "Shanghai Cooperation Organisation (SCO), Eurasian Economic Union (EAEU) FTA, Economic Cooperation Organization (ECO), and BRICS.",
    wto_status: "Observer status since May 2005 (accession process remaining locked by international geopolitical sanctions).",
    sovereign_debt: "30.5% of GDP (2024 estimate). Public debt is held primarily by domestic public banking networks; external foreign currency debt is close to zero due to international exclusion.",
    active_austerity: "Gradual reduction of fuel and bread subsidies, adjustment of income tax rates, and administrative freezes on civil servant payroll directories.",
    aid_status: "Net Recipient (limited to emergency UNHCR refugee programs and selective bilateral natural hazard aid).",
    imf_program: "No active IMF program (surveillance consultations restricted by exchange control discrepancies).",
    shadow_flows: [
      {
        vector: "Sanctions-Bypassing Oil Sales ('Ghost Fleets')",
        corridor: "Kharg Island ➔ Strait of Hormuz ➔ East Asian Shore Refineries",
        scale: "$10B - $15B estimated annual shadow capital volume",
        impact: "Forces steep price discount margins, isolates transaction proceeds in restricted foreign accounts, and funds parallel armed entities."
      },
      {
        vector: "Parallel Currency Exchange Channels (Hawala Networks)",
        corridor: "Tehran Financial Nodes ➔ Middle Eastern Hubs ➔ Turkey / Europe",
        scale: "$5B - $8B estimated annual flow",
        impact: "Undermines central bank monetary stabilization controls and worsens official currency deprecation."
      },
      {
        vector: "Opiates & Synthetic Drugs Overland Transit",
        corridor: "Afghanistan (Golden Crescent) ➔ Baluchestan Frontier ➔ Turkey / Balkan Transits",
        scale: "$2B - $4B estimated annual transit value",
        impact: "Forces extreme military-grade border protection spending, results in high security force fatalities, and triggers domestic public health crises."
      }
    ]
  },
  ireland: {
    trade_blocs: "European Union (EU Customs Union & Single Market), Eurozone, and Common Travel Area (CTA) with the United Kingdom.",
    wto_status: "Official Member since January 1, 1995 (original GATT contracting party since December 22, 1967).",
    sovereign_debt: "43.5% of GDP / 74.8% of Modified GNI (GNI*) due to heavy multinational corporate profit distortions. Primarily Euro-denominated and held by global financial institutions.",
    active_austerity: "No active international IMF austerity programs. Governed by domestic expenditure limits and EU Stability and Growth Pact rules, balancing infrastructure funding against housing supply pressures.",
    aid_status: "Net Donor (Irish Aid program targeting sustainable development and poverty reduction in Sub-Saharan Africa and international crisis areas).",
    imf_program: "No active IMF program (successfully graduated from the 2010 EU-IMF financial assistance bailout package in 2013).",
    shadow_flows: [
      {
        vector: "Corporate IP & Tax Profit Shifting ('Double Irish')",
        corridor: "US Multi-nationals ➔ Dublin HQs ➔ Offshore Caribbean Havens",
        scale: "$10B - $20B annually in estimated tax avoidance",
        impact: "Distorts local GDP metrics (raising nominal growth rates), draws criticism from EU/US tax partners, and drives reliance on corporate tax windfalls."
      },
      {
        vector: "Luxury Real Estate & Shell Investments",
        corridor: "Global High-Net-Worth Individuals ➔ Dublin Property Market",
        scale: "$1.5B - $3.0B estimated annual volume",
        impact: "Exacerbates the domestic housing supply crisis, raises urban rental rates, and requires strict AML screening by the central bank."
      },
      {
        vector: "Cryptocurrency Arbitrage & Digital Capital Flight",
        corridor: "Dublin Tech Corridors ➔ Global Offshore Virtual Wallets",
        scale: "$1.0B - $2.5B estimated annual volume",
        impact: "Circumvents domestic capital gains tax channels, requiring enhanced Central Bank of Ireland virtual asset service provider (VASP) registration rules."
      }
    ]
  },
  italy: {
    trade_blocs: "European Union (EU) Single Market, Eurozone, Schengen Area, European Economic Area (EEA), and G7/G20 structures.",
    wto_status: "Official Member since January 1, 1995 (founding GATT signatory since January 1950).",
    sovereign_debt: "137.3% of GDP (2024 estimate). Dominated by Euro-denominated sovereign bonds held by domestic bank consortiums and the European Central Bank.",
    active_austerity: "Adherence to reformed EU fiscal rules, incorporating structural primary balance targets, pension index modifications, and administrative cost curbs.",
    aid_status: "Net Donor. Major contributor to European Union Development programs and direct bilateral aid (specifically the Mattei Plan targeting North Africa).",
    imf_program: "No active IMF program.",
    shadow_flows: [
      {
        vector: "Syndicated Asset Laundering & Public Tender Intrusion",
        corridor: "Southern Mafia Origins (Ndrangheta/Camorra) ➔ Northern Industrial Assets / EU Real Estate",
        scale: "€15B - €25B estimated annual economic footprint",
        impact: "Undermines competitive commercial landscape, distorts public tenders, and displaces legitimate commercial enterprises."
      },
      {
        vector: "Intra-EU VAT Carousel & MTIC Tax Fraud",
        corridor: "Italy ➔ Multi-boundary Schengen Corridors",
        scale: "€6B - €10B estimated annual tax loss",
        impact: "Exerts massive structural tax revenue losses on the state treasury; requires expensive audit campaigns."
      },
      {
        vector: "North African Irregular Sea-Crossing Human Pipelines",
        corridor: "Tunisian & Libyan Coasts ➔ Pelagie Islands / Lampedusa ➔ Sicily Transit",
        scale: "€500M - €1B estimated smuggling networks value",
        impact: "Exerts massive administrative containment pressure on southern ports, triggering high security and rescue coast guard spending."
      }
    ]
  },
  cuba: {
    trade_blocs: "Bolivarian Alliance for the Peoples of Our America (ALBA-TCP), CARICOM (observer), and the Association of Caribbean States (ACS).",
    wto_status: "Official Member since April 20, 1995 (founding GATT contracting party since 1948).",
    sovereign_debt: "Sovereign club-level external debt under payment moratorium. Public internal debt is highly unsustainably monetized under a massive fiscal deficit.",
    active_austerity: "Emergency macroeconomic consolidation programs: systemic cuts in central fuel allocations, widespread transit route shutdowns, and import price raises.",
    aid_status: "Dual Status (Recipient of agricultural and fuel credit resources from Venezuela, China, and Russia; donor of international medical brigades).",
    imf_program: "Not a member of the International Monetary Fund or World Bank group.",
    shadow_flows: [
      {
        vector: "Informal Remittance Courier Channels ('Mulas')",
        corridor: "Miami/Madrid Diaspora ➔ Air/Sea Couriers ➔ Havana Non-State Retail Markets",
        scale: "$1B - $2B estimated annual currency volume",
        impact: "Completely bypasses official banking channels, driving severe financial stratification and dual-currency social structures."
      },
      {
        vector: "Trans-Caribbean Hydrocarbon Arbitrage",
        corridor: "Venezuelan State Tanks ➔ Caribbean Offshore Refineries ➔ Cuba Local Ports",
        scale: "$300M - $500M estimated informal supply",
        impact: "Vulnerable to external political shocks; leaving state grids open to regular power blackouts."
      },
      {
        vector: "Human Smuggling & Spatial Citizen Flight",
        corridor: "Cuba ➔ Nicaragua Route (Visa-Free Transit) ➔ overland US Southern Border",
        scale: "$400M - $800M in broker fees",
        impact: "Results in a devastating domestic brain drain of skilled labor, depressing public school and healthcare structures."
      }
    ]
  },
  israel: {
    trade_blocs: "Israel-US FTA, Israel-EU Association Agreement, EFTA FTA, and bilateral FTAs with Canada, Mexico, Turkey, and Abraham Accords partners.",
    wto_status: "Official Member since April 21, 1995 (founding GATT contracting party since 1962).",
    sovereign_debt: "62.5% of GDP (2024 estimate with wartime expenditures). Dominated by Shekel-denominated public bonds held by local pension pools.",
    active_austerity: "Wartime budget modifications: redirection of coalition political spending, VAT raise to 18% in 2025, and public hiring freezes.",
    aid_status: "Net Recipient (primarily of US strategic military and strategic assistance packages).",
    imf_program: "No active IMF program.",
    shadow_flows: [
      {
        vector: "Strategic High-Tech IP Offshoring & Patent Divergence",
        corridor: "Tel Aviv R&D Labs ➔ European & Caribbean Tax Havens",
        scale: "$500M - $1.2B estimated annual shift",
        impact: "Bypasses domestic intellectual property tax frameworks and moves core strategic assets offshore."
      },
      {
        vector: "Illegal Outflows & Elite Tax Arbitrage",
        corridor: "Israel Corporate Entities ➔ Offshore Banking Jurisdictions",
        scale: "$1.5B - $3.0B estimated annual flight",
        impact: "Erodes corporate taxation yields and requires highly intensive regulatory compliance spending."
      },
      {
        vector: "Unlicensed Cross-Border Remittance Corridors",
        corridor: "Urban Foreign Worker Havens (Tel Aviv) ➔ Southeast Asia / East Africa",
        scale: "$800M - $1.5B estimated annual footprint",
        impact: "Fosters cash-based parallel grey markets that operate outside official banking conduits."
      }
    ]
  },
  japan: {
    trade_blocs: "CPTPP, RCEP, Japan-EU EPA, Japan-US Trade Agreement, AJCEP.",
    wto_status: "Official Member since January 1, 1995 (founding GATT contracting party since September 10, 1955).",
    sovereign_debt: "264.0% of GDP (highest among developed nations). Dominated by Yen-denominated public bonds held internally by domestic financial institutions and the Bank of Japan.",
    active_austerity: "No structural IMF programs, but persistent domestic spending constraints on public services to offset rising health and eldercare costs.",
    aid_status: "Net Donor (major ODA provider and primary capital contributor/leader within the Asian Development Bank).",
    imf_program: "No active IMF program.",
    shadow_flows: [
      {
        vector: "Transfer Pricing in Advanced Tech & Automotive Supply Chains",
        corridor: "Tokyo HQ ➔ East/Southeast Asian Subsidiaries (Tax Arbitrage)",
        scale: "$2.0B - $4.5B estimated annual yield shift",
        impact: "Redistributes taxable profits across manufacturing divisions, reducing domestic corporate tax yields."
      },
      {
        vector: "IP Patent Licensing Havens & Licensing Divergence",
        corridor: "Tokyo R&D Centers ➔ Singapore & Cayman Islands",
        scale: "$1.2B - $2.5B estimated annual shift",
        impact: "Bypasses domestic intellectual property tax frameworks on tech and software patents."
      },
      {
        vector: "Unregulated Cryptocurrency Outflow & Tokenized Capital Flight",
        corridor: "Tokyo Digital Asset Exchanges ➔ Global Offshore Wallets",
        scale: "$1.5B - $3.0B estimated annual volume",
        impact: "Circumvents capital gains tax tracking and complicates central bank regulatory oversight."
      }
    ]
  },
  uae: {
    trade_blocs: "GCC (Gulf Cooperation Council), GAFTA (Greater Arab Free Trade Area), bilateral CEPAs (India, Israel, Turkey, Indonesia), OPEC member.",
    wto_status: "Official Member since April 10, 1996 (GATT contracting party since February 8, 1996).",
    sovereign_debt: "30.0% of GDP (2024 estimate). Highly sustainable, backed by immense sovereign wealth funds (ADIA, Mubadala, ICD) which far exceed state liabilities.",
    active_austerity: "No active IMF austerity. Governed by domestic fiscal reforms, including the 2023 introduction of a 9% federal corporate tax and energy subsidy reductions.",
    aid_status: "Net Donor. One of the top global development aid donors relative to GNI, coordinated via the Abu Dhabi Fund for Development (ADFD).",
    imf_program: "No active IMF program.",
    shadow_flows: [
      {
        vector: "Gold Trade Arbitrage & Smuggling",
        corridor: "East/Central Africa Conflict Zones ➔ Dubai Gold Souk ➔ Global Bullion Markets",
        scale: "$4B - $8B estimated annual transit value",
        impact: "Bypasses international conflict-free sourcing protocols (LBMA/OECD), distorts commodity trade registries, and complicates money laundering compliance."
      },
      {
        vector: "Real Estate Money Laundering & Wealth Parking",
        corridor: "Global Politically Exposed Persons (PEPs) / High-Net-Worth Individuals ➔ Dubai Luxury Real Estate",
        scale: "$5B - $10B estimated annual investment scale",
        impact: "Inflates local property markets, puts pressure on AML monitoring systems, and draws scrutiny from international compliance watchdogs."
      },
      {
        vector: "Sanctions-Evasion Trade & Re-Exports",
        corridor: "Sanctioned Jurisdictions (Russia/Iran) ➔ Dubai Free Zones (JAFZA/DMCC) ➔ Global Trade Networks",
        scale: "$8B - $15B estimated annual transaction flow",
        impact: "Bypasses international trade sanctions, drives underground hawala settlements, and increases compliance costs for domestic financial institutions."
      }
    ]
  },
  france: {
    trade_blocs: "EU (European Union - founding member), Eurozone, WTO member, OECD, G7, G20.",
    wto_status: "Official Member since January 1, 1995 (GATT member since October 24, 1947).",
    sovereign_debt: "110.6% of GDP (2023). Primarily denominated in Euros; high foreign external ownership (~50%) with substantial debt security trading in global liquidity pools.",
    active_austerity: "Domestic fiscal correction directives aiming to reduce the public deficit below 3% of GDP, including civil service hiring freezes and pension system restructuring.",
    aid_status: "Net Donor. Ranked among the top global development donors, coordinated via the Agence Française de Développement (AFD).",
    imf_program: "No active IMF program.",
    shadow_flows: [
      {
        vector: "Channel Small-Boat Human Smuggling",
        corridor: "Northern France (Calais) ➔ English Channel ➔ United Kingdom",
        scale: "$80M - $150M estimated annual broker revenue",
        impact: "Creates high geopolitical tension; drives immense security and monitoring expenditures along the coastline."
      },
      {
        vector: "Tax Avoidance & Offshore Relocation",
        corridor: "France ➔ Luxembourg / Switzerland / Caribbean tax havens",
        scale: "$60B - $80B annual estimated tax revenue loss",
        impact: "Suppresses national tax base, forces high audit surveillance on wealth transfers, and increases public budget constraints."
      },
      {
        vector: "Narcotics Trafficking (Cocaine & Cannabis)",
        corridor: "Latin America (via French Guiana/Caribbean) / Morocco ➔ Metropolitan France",
        scale: "$5B - $7B estimated annual drug trade value",
        impact: "Fuels parallel domestic cash markets, exacerbates gang violence in urban centers, and increases public healthcare and security costs."
      }
    ]
  },
  iceland: {
    trade_blocs: "EFTA (European Free Trade Association), EEA (European Economic Area), Nordic Council.",
    wto_status: "Official Member since January 1, 1995 (GATT contracting party since April 21, 1968).",
    sovereign_debt: "64.8% of GDP (2023). Mostly denominated in Icelandic Króna (ISK) and foreign currencies; highly stable, supported by domestic pension fund holdings.",
    active_austerity: "None. Moderate fiscal consolidation targets implemented post-2008 banking crisis to ensure inflation control and currency stability.",
    aid_status: "Net Donor. Actively funds international geothermal energy and fisheries capacity-building programs, coordinated by GRÓ.",
    imf_program: "No active IMF program (successfully completed the post-crash adjustment in 2011).",
    shadow_flows: [
      {
        vector: "Offshore Wealth & Corporate Asset Parking",
        corridor: "Iceland ➔ European Tax Havens (Luxembourg/Jersey)",
        scale: "$300M - $600M estimated assets stored",
        impact: "Depletes municipal and federal tax receipts, requiring specialized central bank currency control oversight."
      },
      {
        vector: "Illegal Maritime Transshipments (Fisheries)",
        corridor: "North Atlantic Oceans ➔ Iceland Ports / High Seas",
        scale: "$50M - $100M estimated shadow value",
        impact: "Threatens strictly managed fish stocks, bypasses international environmental quotas, and complicates maritime customs enforcement."
      },
      {
        vector: "Contraband Smuggling (Luxury Goods & Alcohol)",
        corridor: "Mainland Europe ➔ Iceland Ports (Eimskip vessels)",
        scale: "$20M - $40M estimated annual value",
        impact: "Bypasses high domestic excise taxes and import restrictions, leading to losses in import duties."
      }
    ]
  },
  kenya: {
    trade_blocs: "EAC (East African Community), COMESA (Common Market for Eastern and Southern Africa), AfCFTA.",
    wto_status: "Official Member since January 1, 1995.",
    sovereign_debt: "68.2% of GDP (2024 estimate). Sourced split: ~50% external multilateral/commercial debt (including Eurobonds and Chinese infrastructure loans), ~50% domestic debt.",
    active_austerity: "Active fiscal consolidation program, featuring reduction in non-essential government expenditure, public wage-bill caps, and tax code expansions (Finance Act adjustments).",
    aid_status: "Net Recipient. High reliance on development funding from the World Bank, African Development Bank (AfDB), and JICA.",
    imf_program: "Active IMF Extended Fund Facility (EFF) and Extended Credit Facility (ECF). Key conditions: Public revenue collection reforms, domestic interest rate deregulation, and fuel subsidy removals.",
    shadow_flows: [
      {
        vector: "Illicit Capital Flight (Trade Misinvoicing)",
        corridor: "Kenya ➔ Global Tax Havens / UAE / Europe",
        scale: "$1.5B - $2.5B annually",
        impact: "Starves the domestic banking system of foreign currency reserves, suppresses tax-to-GDP ratios, and undermines public investment."
      },
      {
        vector: "Smuggling of Agricultural Commodities & Charcoal",
        corridor: "Somalia / South Sudan ➔ Kenya Transit ➔ Global Markets",
        scale: "$200M - $400M annually",
        impact: "Fuels cross-border militant funding networks (Al-Shabaab), causes severe domestic deforestation, and distorts legal agricultural pricing."
      },
      {
        vector: "Wildlife Trafficking (Ivory & Rhino Horn)",
        corridor: "East & Central Africa Conservation Zones ➔ Mombasa Port ➔ East Asia",
        scale: "$100M - $300M shadow trade value",
        impact: "Causes severe environmental damage, fuels armed poaching gangs, and incurs heavy national security and ranger enforcement costs."
      }
    ]
  },
  peru: {
    trade_blocs: "Pacific Alliance, Andean Community (CAN), APEC, CPTPP.",
    wto_status: "Official Member since January 1, 1995.",
    sovereign_debt: "33.8% of GDP (2023). Very low compared to regional peers; predominantly denominated in Soles and USD, backed by large international reserves.",
    active_austerity: "Subject to domestic fiscal responsibility rules limiting structural deficits to 1-2% of GDP.",
    aid_status: "Dual Status. Recipient of environmental and biodiversity protection aid; donor of regional cooperation programs.",
    imf_program: "No active IMF program (maintains precautionary Flexible Credit Line).",
    shadow_flows: [
      {
        vector: "Cocaine Production & Transshipment (VRAEM)",
        corridor: "Peru Highlands ➔ Brazil / Europe / North America",
        scale: "$4B - $6B estimated annual shadow revenue",
        impact: "Fuels insurgent groups (Sendero Luminoso remnants), corrupts local law enforcement, and incurs high military security expenditures."
      },
      {
        vector: "Illegal Gold Mining & Transit",
        corridor: "Amazon Basin (Madre de Dios) ➔ Bolivia Transit ➔ Global Refineries",
        scale: "$2B - $3B annual illegal exports",
        impact: "Causes massive deforestation and mercury contamination in the Amazon, evades national mining royalty taxes, and funds money laundering networks."
      },
      {
        vector: "Illegal Timber Logging & Smuggling",
        corridor: "Peruvian Amazon Rainforest ➔ China / United States Ports",
        scale: "$150M - $250M annual value",
        impact: "Destroys indigenous forest reserves, accelerates climate vulnerability, and complicates wood export certifications."
      }
    ]
  },
  rwanda: {
    trade_blocs: "EAC (East African Community), COMESA, AfCFTA, Commonwealth.",
    wto_status: "Official Member since May 22, 1996.",
    sovereign_debt: "63.5% of GDP (2023). Predominantly external concessional debt from multilateral development lenders (World Bank, AfDB).",
    active_austerity: "Strict administrative saving targets, public spending optimization, and consolidation of ministerial agencies.",
    aid_status: "Net Recipient. High reliance on foreign aid which funds ~30% of the national development budget, led by the World Bank, EU, and UK.",
    imf_program: "Active Policy Coordination Instrument (PCI) and Resilience and Sustainability Facility (RSF) with the IMF, focusing on climate resilience and fiscal buffer accumulation.",
    shadow_flows: [
      {
        vector: "Conflict Minerals Smuggling & Laundering",
        corridor: "DRC Mining Zones ➔ Rwanda Transit ➔ Global Supply Chains",
        scale: "$500M - $800M annual value (Coltan, Gold, Tin)",
        impact: "Bypasses international conflict-free certification checks, fuels regional geopolitical tensions, and creates an informal untaxed mineral market."
      },
      {
        vector: "Illegal Timber Transit & Trade",
        corridor: "Congo Basin Rainforests ➔ Rwanda ➔ East African Coast",
        scale: "$40M - $80M annual regional value",
        impact: "Complicates environmental protection efforts, bypasses border tariffs, and fuels informal transport syndicates."
      },
      {
        vector: "Cross-Border Commodity Smuggling (Agricultural)",
        corridor: "Burundi / Uganda ➔ Rwanda Border Districts",
        scale: "$20M - $50M annual regional value",
        impact: "Drives informal markets in border communities, evades VAT collections, and bypasses sanitary/phytosanitary inspections."
      }
    ]
  },
  "saudi-arabia": {
    trade_blocs: "GCC (Gulf Cooperation Council), GAFTA, OPEC (founding member), G20.",
    wto_status: "Official Member since December 11, 2005.",
    sovereign_debt: "26.2% of GDP (2023). Very low; supported by massive sovereign wealth reserves held by the Public Investment Fund (PIF).",
    active_austerity: "Governed by domestic fiscal consolidation programs, including the 2020 VAT increase to 15%, energy subsidy reductions, and government department efficiency directives.",
    aid_status: "Net Donor. Major developmental aid donor via the King Salman Humanitarian Aid and Relief Centre (KSRelief) and the Saudi Fund for Development (SFD).",
    imf_program: "No active IMF program.",
    shadow_flows: [
      {
        vector: "Informal Labor Remittances (Hawala)",
        corridor: "Saudi Arabia (Migrant Workers) ➔ South Asia / East Africa",
        scale: "$4B - $6B estimated annual transfer value",
        impact: "Bypasses domestic banking controls, limits the effectiveness of labor localization policies (Saudization), and requires strict AML monitoring."
      },
      {
        vector: "Captagon & Synthetic Drug Imports",
        corridor: "Syria / Lebanon ➔ Saudi Arabian Markets",
        scale: "$2B - $4B annual black market value",
        impact: "Presents a major public health and security risk, prompting high-level border security operations and cargo scanner investments."
      },
      {
        vector: "Illicit Capital Flight (Private Outflows)",
        corridor: "Saudi Arabia ➔ Western Europe / North America / Offshore Havens",
        scale: "$5B - $8B estimated annual outflows",
        impact: "Suppresses local private sector capital investment, bypassing domestic wealth-tax and capital declaration requirements."
      }
    ]
  },
  singapore: {
    trade_blocs: "ASEAN, CPTPP, RCEP, APEC, G20 guest, extensive network of bilateral FTAs.",
    wto_status: "Official Member since January 1, 1995 (GATT contracting party since November 27, 1973).",
    sovereign_debt: "167.9% of GDP (2023). High nominally, but zero net debt; all borrowing is for investment purposes via Singapore Government Securities (SGS), backed by large reserves.",
    active_austerity: "Bipartisan fiscal sustainability guidelines, including targeted increases in the Goods and Services Tax (GST) to 9% to support aging infrastructure.",
    aid_status: "Net Donor (via technical assistance). Hosts and funds regional capacity-building programs, coordinated through the Singapore Cooperation Programme (SCP).",
    imf_program: "No active IMF program.",
    shadow_flows: [
      {
        vector: "Global Trade Misinvoicing & Transfer Pricing",
        corridor: "Multinational Corporations ➔ Singapore Subsidiaries ➔ Global Tax Havens",
        scale: "$10B - $15B estimated annual tax-arbitrage flows",
        impact: "Shifts corporate profits to low-tax jurisdictions, draws international tax-haven scrutiny, and requires high audit vigilance by IRAS."
      },
      {
        vector: "Illicit Wealth Laundering (Offshore Financial Parking)",
        corridor: "Southeast Asia / China / Global PEPs ➔ Singapore Wealth Managers",
        scale: "$8B - $12B estimated annual flows",
        impact: "Inflates local luxury real estate and financial asset markets, puts strain on monetary compliance controls, and demands strict KYC/AML checks."
      },
      {
        vector: "Transshipment of Controlled & Sanctioned Goods",
        corridor: "Global Manufacturing Ports ➔ Port of Singapore ➔ Sanctioned Dest.",
        scale: "$2B - $5B estimated annual transshipment value",
        impact: "Poses a significant risk to international customs compliance, exposes logistics companies to sanctions, and requires extensive cargo inspections."
      }
    ]
  },
  thailand: {
    trade_blocs: "ASEAN Economic Community, RCEP, APEC.",
    wto_status: "Official Member since January 1, 1995 (GATT contracting party since 1982).",
    sovereign_debt: "62.4% of GDP (2023). Governed by a public debt ceiling of 70% of GDP; predominantly denominated in Thai Baht (THB).",
    active_austerity: "Targeted fiscal deficit containment under national fiscal discipline guidelines.",
    aid_status: "Dual Status. Recipient of environmental and infrastructure grants; donor of technical training and development loans to Laos, Cambodia, and Myanmar.",
    imf_program: "No active IMF program.",
    shadow_flows: [
      {
        vector: "Narcotics Trafficking (Mekong Corridor)",
        corridor: "Golden Triangle (Myanmar/Laos) ➔ Thailand Transit ➔ Global Ports",
        scale: "$5B - $8B estimated regional trade value",
        impact: "Fuels domestic substance abuse issues, prompts high-value border security operations, and corrupts local authorities in northern border areas."
      },
      {
        vector: "Human Trafficking & Forced Labor (Fisheries/Sex Trade)",
        corridor: "Myanmar / Cambodia / Laos ➔ Thailand Manufacturing & Fishing Ports",
        scale: "$1.5B - $2.5B illicit broker fees",
        impact: "Triggers international labor compliance warnings, requires costly regulatory interventions in the maritime fishing fleet, and violates human rights."
      },
      {
        vector: "Illegal Wildlife & Timber Trade",
        corridor: "Mekong Basin Forest Reserves ➔ Thailand Transit ➔ East Asia Ports",
        scale: "$300M - $500M annual value",
        impact: "Depletes regional biodiversity, bypasses international CITES wildlife protection regulations, and requires custom control patrols."
      }
    ]
  },
  turkey: {
    trade_blocs: "EU-Turkey Customs Union, ECO (Economic Cooperation Organization), BSEC (Black Sea Economic Cooperation).",
    wto_status: "Official Member since January 1, 1995 (GATT contracting party since 1951).",
    sovereign_debt: "31.5% of GDP (2023). Low debt-to-GDP ratio, but high inflation and external private sector debt denominated in foreign currencies create foreign exchange pressures.",
    active_austerity: "Bipartisan medium-term fiscal program focusing on public sector savings, structural reforms, and high-interest rate monetary policy to combat inflation.",
    aid_status: "Dual Status. Net donor of humanitarian aid globally (TIKA); net recipient of EU refugee support funds and development loans.",
    imf_program: "No active IMF program.",
    shadow_flows: [
      {
        vector: "Human Smuggling & Transit Migration",
        corridor: "Middle East / South Asia ➔ Turkey Transit ➔ European Union Borders",
        scale: "$2B - $4B annual smuggler network revenue",
        impact: "Creates high political tension with the EU, requires costly border wall systems, and puts strain on search-and-rescue marine operations."
      },
      {
        vector: "Contraband Goods & Tax Evasion",
        corridor: "Middle East / China ➔ Turkey Wholesale Markets ➔ Europe",
        scale: "$1.5B - $3B estimated annual value",
        impact: "Undermines local domestic manufacturing, evades custom tariff revenues, and fuels large-scale underground commercial markets."
      },
      {
        vector: "Gold & Cash Smuggling (Capital Flight)",
        corridor: "Turkey ➔ Gulf States / Offshore Bank Accounts",
        scale: "$3B - $5B estimated annual flow",
        impact: "Weakens the central bank's foreign exchange reserves, increases domestic pressure on the Turkish Lira, and bypasses capital controls."
      }
    ]
  },
  tuvalu: {
    trade_blocs: "Pacific Islands Forum, PACER Plus, WTO Observer.",
    wto_status: "Observer status (application for full membership active).",
    sovereign_debt: "52.0% of GDP (2023). Highly dependent on budget support grants from bilateral partners and access to the Tuvalu Trust Fund.",
    active_austerity: "Public service budget controls and investment containment under the national Sustainable Development Strategy.",
    aid_status: "Net Recipient. Dependent on foreign development aid for over 50% of the national budget, led by Australia, New Zealand, and Taiwan.",
    imf_program: "No active IMF program (receives Article IV policy support).",
    shadow_flows: [
      {
        vector: "Unregulated & Unreported Fishing (IUU)",
        corridor: "Tuvalu EEZ ➔ Foreign Distant Water Fishing Fleets",
        scale: "$20M - $50M estimated annual license evasion",
        impact: "Depletes precious national tuna stocks, undermines ocean resource sustainability, and exceeds local marine patrol capabilities."
      },
      {
        vector: "Flags of Convenience & Vessel Shell Registry",
        corridor: "Global Shipping Firms ➔ Tuvalu Maritime Registry (Singapore Hub)",
        scale: "$5M - $15M estimated tax-arbitrage transactions",
        impact: "Risk of registering vessels engaged in illicit trade or environmental violations, exposing the nation to global regulatory warnings."
      },
      {
        vector: "Domain Leasing & Digital Speculation Arbitrage",
        corridor: "Global Tech Companies ➔ Tuvalu Government Digital Registry",
        scale: "$10M - $20M estimated digital transaction volume",
        impact: "Subject to cryptocurrency and speculative registry changes, causing high volatility in annual non-tax revenue receipts."
      }
    ]
  }
};
