export interface Organization {
  name: string;
  year: string;
  status: string;
}

export interface MemAlliancesCountryData {
  memberships: Organization[];
  strategicBenefits: string[];
  drawbacksContentious: string[];
}

export const memAlliancesData: Record<string, MemAlliancesCountryData> = {
  australia: {
    memberships: [
      { name: "Commonwealth", year: "1931", status: "Member" },
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "ANZUS", year: "1951", status: "Founding Member" },
      { name: "APEC", year: "1989", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "CPTPP", year: "2018", status: "Member" },
      { name: "AUKUS", year: "2021", status: "Founding Member" }
    ],
    strategicBenefits: [
      "Robust security guarantees from the US via the ANZUS treaty and nuclear-powered submarine technology access under AUKUS.",
      "Vast integration into Asia-Pacific trade zones via CPTPP and APEC, facilitating agricultural and mineral exports.",
      "High-level intelligence sharing via the Five Eyes network, enhancing national cybersecurity and counter-terrorism."
    ],
    drawbacksContentious: [
      "Severe trade balancing pressures, as security pacts like AUKUS strain diplomatic relations with China (Australia's largest trading partner).",
      "Significant domestic fiscal burden and debate over the long-term cost of procuring nuclear submarines under the AUKUS agreement.",
      "Geopolitical alignment risks pulling the nation into regional maritime and trade conflicts in the Indo-Pacific."
    ]
  },
  bangladesh: {
    memberships: [
      { name: "Commonwealth", year: "1972", status: "Member" },
      { name: "UN", year: "1974", status: "Member" },
      { name: "SAARC", year: "1985", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "BIMSTEC", year: "1997", status: "Founding Member" }
    ],
    strategicBenefits: [
      "Access to preferential trade treatments and tariff exemptions as a developing/Least Developed Country (LDC) under WTO guidelines.",
      "Enhanced regional cooperation on climate adaptation, counter-terrorism, and trade via BIMSTEC and SAARC.",
      "Multilateral development aid and infrastructure assistance channeled through UN and Commonwealth pathways."
    ],
    drawbacksContentious: [
      "Regional cooperation within SAARC is heavily stalled due to persistent geopolitical rivalry between India and Pakistan.",
      "Impending loss of preferential LDC trade benefits as Bangladesh prepares to graduate to developing nation status.",
      "Complex diplomatic balancing required between major regional investors India and China for infrastructure funding."
    ]
  },
  belgium: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "NATO", year: "1949", status: "Founding Member" },
      { name: "EU", year: "1957", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "Schengen Zone", year: "1995", status: "Member" },
      { name: "Eurozone", year: "1999", status: "Member" }
    ],
    strategicBenefits: [
      "Sovereign political leverage from hosting the headquarters of both the European Union and NATO in Brussels.",
      "Frictionless trade, labor mobility, and capital access within the EU Single Market and Schengen Area.",
      "Defensive security guarantees and strategic intelligence integration through NATO's collective defense framework."
    ],
    drawbacksContentious: [
      "Complex domestic administrative burdens, as regional assemblies must align and ratify complex international EU trade treaties.",
      "High political and security risk profile as a primary host city for international administrative and military institutions.",
      "Domestic tension over meeting NATO's defense expenditure targets of 2% of GDP amidst local public budget deficits."
    ]
  },
  brazil: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "OAS", year: "1948", status: "Founding Member" },
      { name: "Mercosur", year: "1991", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "BRICS", year: "2009", status: "Founding Member" }
    ],
    strategicBenefits: [
      "Increased diplomatic and financial leverage in global governance reform via the BRICS alliance and the New Development Bank.",
      "Regional trade integration and tariff-free access to South American markets through Mercosur.",
      "Strong voice representing the Global South in international climate, agricultural, and financial negotiations at the G20."
    ],
    drawbacksContentious: [
      "Internal policy differences and political gridlock within Mercosur, limiting Brazil's ability to negotiate bilateral trade pacts.",
      "Strained diplomatic balancing between traditional Western partners (US/EU) and BRICS allies on global security matters.",
      "Domestic volatility over international environmental compliance standards vs. national agricultural expansion."
    ]
  },
  canada: {
    memberships: [
      { name: "Commonwealth", year: "1931", status: "Member" },
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "NATO", year: "1949", status: "Founding Member" },
      { name: "G7", year: "1976", status: "Member" },
      { name: "APEC", year: "1989", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "CPTPP", year: "2018", status: "Member" },
      { name: "USMCA", year: "2020", status: "Member" }
    ],
    strategicBenefits: [
      "Access to the massive US market and integrated North American supply chains via USMCA trade agreement.",
      "Comprehensive collective defense umbrella via NATO and joint aerospace defense cooperation through NORAD with the US.",
      "A prominent voice in Western-led multilateral fora (G7, G20, OECD) allowing Canada to project diplomatic influence globally."
    ],
    drawbacksContentious: [
      "Heavy trade dependence on the US market, making Canada highly vulnerable to shifts in American tariff and trade policies.",
      "Friction with NATO allies regarding Canada's defense spending, which has consistently fallen short of the 2% GDP target.",
      "Domestic regional disputes over trade compliance, environmental commitments (such as carbon pricing), and international resource pipeline disputes."
    ]
  },
  venezuela: {
    memberships: [
      { name: "OAS", year: "1948", status: "Withdrew/Suspended 2019" },
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "OPEC", year: "1960", status: "Founding Member" },
      { name: "Mercosur", year: "2012", status: "Suspended 2017" },
      { name: "ALBA-TCP", year: "2004", status: "Founding Member" },
      { name: "Non-Aligned Movement", year: "1989", status: "Member" }
    ],
    strategicBenefits: [
      "Significant oil export coordination and price influence leverage via founding membership in OPEC.",
      "Alternative regional integration, developmental financing, and ideological alignment with Cuba/Bolivia via ALBA-TCP.",
      "Close political, diplomatic, and trade shields from strategic non-Western allies (China, Russia, Iran) within multilateral fora."
    ],
    drawbacksContentious: [
      "Suspension from Mercosur due to violations of the democratic clause, leading to regional economic and political isolation.",
      "Severe diplomatic isolation and sanctions from the OAS and Western states following the contested withdrawals and political disputes.",
      "Persistent defaults and failure to meet membership dues in various international bodies, reducing direct voting leverage."
    ]
  },
  chad: {
    memberships: [
      { name: "UN", year: "1960", status: "Member" },
      { name: "AU", year: "1963", status: "Founding Member" },
      { name: "CEMAC", year: "1994", status: "Member" },
      { name: "WTO", year: "1996", status: "Member" },
      { name: "G5 Sahel", year: "2014", status: "Founding Member" }
    ],
    strategicBenefits: [
      "Regional security coordination and international military assistance to combat trans-border militancy in the Sahel.",
      "Common monetary framework and currency stability under the CFA Franc through CEMAC membership.",
      "Access to multilateral development financing and humanitarian aid via African Union and UN partnerships."
    ],
    drawbacksContentious: [
      "Heavy reliance on foreign military intervention (particularly French support), prompting domestic sovereignty concerns.",
      "High vulnerability to regional spillover of conflicts from neighboring Sudan, Libya, and the Central African Republic.",
      "Economic dependency on oil exports within a rigid monetary union that limits independent currency adjustments."
    ]
  },
  china: {
    memberships: [
      { name: "UN", year: "1971", status: "Permanent Security Council Member" },
      { name: "APEC", year: "1991", status: "Member" },
      { name: "ASEAN Plus Three", year: "1997", status: "Plus Three Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "SCO", year: "2001", status: "Founding Member" },
      { name: "WTO", year: "2001", status: "Member" },
      { name: "BRICS", year: "2009", status: "Founding Member" },
      { name: "RCEP", year: "2020", status: "Member" }
    ],
    strategicBenefits: [
      "Access to global export markets enabling massive economic growth and supply chain dominance via WTO and RCEP.",
      "Veto power in the UN Security Council, allowing China to block unfavorable resolutions and shape global policies.",
      "Leadership of alternative multilateral systems (BRICS, SCO) to promote multipolarity and reduce reliance on US-centric bodies."
    ],
    drawbacksContentious: [
      "Intensifying trade frictions and technological containment actions from Western powers over industrial subsidies and state capitalism.",
      "Geopolitical isolation risk due to active territorial disputes in the South China Sea, complicating regional ASEAN relations.",
      "International criticism and debt sustainability concerns surrounding the bilateral Belt and Road Initiative projects."
    ]
  },
  cuba: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "Non-Aligned Movement", year: "1961", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "ALBA", year: "2004", status: "Founding Member" },
      { name: "CELAC", year: "2011", status: "Founding Member" }
    ],
    strategicBenefits: [
      "Regional economic cooperation and subsidized oil imports from ideological allies via the ALBA framework.",
      "Strong diplomatic platforms to rally global opposition against the US trade embargo at the UN and Non-Aligned Movement.",
      "Sovereign prestige and revenue generation through international medical diplomacy and humanitarian missions."
    ],
    drawbacksContentious: [
      "Severe financial limits due to exclusion from Western lending institutions (IMF and World Bank) under US pressure.",
      "Heavy reliance on unstable economic partners (e.g., Venezuela) for energy subsidies and imports.",
      "Domestic political frictions over economic reforms and alignment with international human rights standards."
    ]
  },
  drc: {
    memberships: [
      { name: "UN", year: "1960", status: "Member" },
      { name: "AU", year: "1963", status: "Founding Member" },
      { name: "COMESA", year: "1994", status: "Member" },
      { name: "WTO", year: "1997", status: "Member" },
      { name: "SADC", year: "1997", status: "Member" },
      { name: "EAC", year: "2022", status: "Member" }
    ],
    strategicBenefits: [
      "Access to massive East and Southern African free trade markets via SADC and EAC alignment.",
      "Multilateral peacekeeping support and regional military coordination to stabilize conflict-torn Eastern provinces.",
      "Leverage in negotiating transboundary resource infrastructure projects (e.g. Inga Dam) through regional bodies."
    ],
    drawbacksContentious: [
      "Severe security complications as regional military deployments from EAC and SADC occasionally clash or overlap.",
      "Slow domestic implementation of trade agreements due to weak infrastructure and institutional capacity.",
      "Porous borders and illegal mineral smuggling networks that undermine regional customs integration."
    ]
  },
  egypt: {
    memberships: [
      { name: "Arab League", year: "1945", status: "Founding Member" },
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "AU", year: "1963", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "COMESA", year: "1998", status: "Member" },
      { name: "BRICS", year: "2024", status: "Member" }
    ],
    strategicBenefits: [
      "Access to diversified trade financing options and infrastructure loans through the BRICS New Development Bank.",
      "Central diplomatic role and leadership in Arab League affairs, safeguarding Suez Canal security.",
      "Trade integration with East and Southern African nations, expanding export markets for manufactured goods."
    ],
    drawbacksContentious: [
      "High vulnerability to regional conflicts in neighboring Sudan, Gaza, and Libya, straining border security.",
      "Tension over transboundary Nile water allocations with upstream African Union members (particularly Ethiopia).",
      "Struggles to balance structural financial conditions of IMF agreements with regional development plans."
    ]
  },
  ethiopia: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "AU", year: "1963", status: "Founding Member" },
      { name: "COMESA", year: "1994", status: "Member" },
      { name: "IGAD", year: "1996", status: "Founding Member" },
      { name: "BRICS", year: "2024", status: "Member" }
    ],
    strategicBenefits: [
      "Diplomatic prestige and local economic gains from hosting the African Union headquarters in Addis Ababa.",
      "Strategic geopolitical alliance building and potential financial support through BRICS membership.",
      "Regional integration and cross-border security cooperation in the Horn of Africa via IGAD."
    ],
    drawbacksContentious: [
      "Intense regional friction with Egypt and Sudan over Nile water rights and the Grand Ethiopian Renaissance Dam.",
      "Sovereignty concerns and international pressure regarding domestic regional conflicts and human rights issues.",
      "External debt distress and complicated negotiations with bilateral creditors (especially China) and the IMF."
    ]
  },
  france: {
    memberships: [
      { name: "UN", year: "1945", status: "Permanent Security Council Member" },
      { name: "NATO", year: "1949", status: "Founding Member" },
      { name: "EU", year: "1957", status: "Founding Member" },
      { name: "Schengen Zone", year: "1995", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "Eurozone", year: "1999", status: "Member" }
    ],
    strategicBenefits: [
      "Permanent veto power in the UN Security Council, cementing France's position as a global diplomatic authority.",
      "Joint leadership of the European Union, driving continental economic policies and the common currency.",
      "Collective security via NATO and global military footprint projection through strategic overseas bases."
    ],
    drawbacksContentious: [
      "Domestic public resentment over EU fiscal constraints and agricultural policy directives.",
      "Rapidly eroding influence and security relationships in former colonial networks within Francophone Africa.",
      "Ongoing political debate regarding European strategic autonomy vs. reliance on US-dominated NATO structures."
    ]
  },
  germany: {
    memberships: [
      { name: "NATO", year: "1955", status: "Member" },
      { name: "EU", year: "1957", status: "Founding Member" },
      { name: "UN", year: "1973", status: "Member" },
      { name: "Schengen Zone", year: "1995", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "Eurozone", year: "1999", status: "Member" }
    ],
    strategicBenefits: [
      "Industrial export domination enabled by a stable common currency (Euro) and the EU Single Market.",
      "Strong collective defense umbrella under NATO, allowing Germany to focus historically on civilian economic growth.",
      "Central diplomatic leadership in shaping European integration and coordination with neighboring states."
    ],
    drawbacksContentious: [
      "Heavy international and alliance pressure to meet NATO's 2% GDP defense spending target amidst domestic fiscal constraints.",
      "Economic vulnerability arising from structural dependence on imported energy and export markets outside the EU.",
      "Domestic political opposition to fiscal transfers and bailout programs for struggling Eurozone members."
    ]
  },
  iceland: {
    memberships: [
      { name: "UN", year: "1946", status: "Member" },
      { name: "NATO", year: "1949", status: "Founding Member" },
      { name: "EFTA", year: "1970", status: "Member" },
      { name: "EEA", year: "1994", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "Schengen Zone", year: "2001", status: "Member" }
    ],
    strategicBenefits: [
      "Strategic defense guarantee from NATO without the requirement to maintain a standing national military.",
      "Direct, tariff-free access to the European Single Market via the European Economic Area (EEA) agreement.",
      "Seamless integration and tourism mobility with European nations under the Schengen Agreement."
    ],
    drawbacksContentious: [
      "Fishing rights frictions with the EU, which has historically prevented Iceland from pursuing full EU membership.",
      "Geopolitical exposure to increasing militarization and resource competition in the Arctic region.",
      "High economic vulnerability to external shocks due to reliance on EFTA trade and international tourism."
    ]
  },
  india: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "Quad", year: "2007", status: "Member" },
      { name: "BRICS", year: "2009", status: "Founding Member" },
      { name: "SCO", year: "2017", status: "Member" }
    ],
    strategicBenefits: [
      "Preservation of strategic autonomy by balancing ties across Western (Quad) and non-Western (BRICS/SCO) blocks.",
      "Enhanced defense and maritime security cooperation in the Indo-Pacific region via the Quad.",
      "A leading global voice for the Global South in international trade, development, and climate negotiations."
    ],
    drawbacksContentious: [
      "Persistent security tensions and military standoffs along borders with fellow SCO/BRICS member China.",
      "Complex diplomatic balancing act between long-standing defense ties with Russia and growing alignment with the US.",
      "Domestic agricultural and industrial lobbies limiting India's willingness to enter comprehensive regional trade pacts."
    ]
  },
  indonesia: {
    memberships: [
      { name: "UN", year: "1950", status: "Member" },
      { name: "ASEAN", year: "1967", status: "Founding Member" },
      { name: "APEC", year: "1989", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "ASEAN Plus Three", year: "1997", status: "Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "RCEP", year: "2023", status: "Member" }
    ],
    strategicBenefits: [
      "De facto leadership role in ASEAN, maintaining Southeast Asian neutrality and diplomatic independence.",
      "Enhanced trade access and regional supply chain integration via RCEP and APEC.",
      "Global platform to negotiate trade, resource management, and investment opportunities through the G20."
    ],
    drawbacksContentious: [
      "Navigating intense geopolitical rivalry between the US and China in the South China Sea without compromising sovereignty.",
      "Domestic protectionist pressures conflicts with international trade commitments and tariff reductions.",
      "International criticism and environmental compliance debates regarding palm oil exports and deforestation."
    ]
  },
  iran: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "OPEC", year: "1960", status: "Founding Member" },
      { name: "ECO", year: "1985", status: "Founding Member" },
      { name: "SCO", year: "2023", status: "Member" },
      { name: "BRICS", year: "2024", status: "Member" }
    ],
    strategicBenefits: [
      "Diplomatic and economic bypasses to Western sanctions through integration with Eurasian powers via SCO and BRICS.",
      "Influence over global oil markets and pricing mechanisms via OPEC coordination.",
      "Geopolitical leverage in the Strait of Hormuz, a crucial global maritime energy checkpoint."
    ],
    drawbacksContentious: [
      "Severe economic isolation and financial constraints due to ongoing US-led unilateral sanctions.",
      "Regional security frictions and proxy conflicts with Western-aligned Middle Eastern states.",
      "Friction within OPEC over oil export quotas and production restrictions amidst domestic fiscal needs."
    ]
  },
  ireland: {
    memberships: [
      { name: "Council of Europe", year: "1949", status: "Member" },
      { name: "UN", year: "1955", status: "Member" },
      { name: "OECD", year: "1961", status: "Member" },
      { name: "EU", year: "1973", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" }
    ],
    strategicBenefits: [
      "Frictionless trade, labor mobility, and capital access within the EU Single Market, hosting European HQs for global tech and pharma companies.",
      "Access to global trade standardizations and dispute resolution via WTO, and high-income policy coordination via the OECD.",
      "Preservation of historic military neutrality (refraining from joining military alliances like NATO), which supports its active role in UN peacekeeping and humanitarian missions."
    ],
    drawbacksContentious: [
      "Complex diplomatic balancing of its strict military neutrality policy, facing rising internal and external pressures to coordinate on European Union common security and defense.",
      "Regulatory and trade friction arising from Brexit, which disrupted transit lanes through Great Britain (the landbridge) to the EU Single Market.",
      "International pressures to adjust its low corporate tax rate framework (such as the 12.5% rate) to comply with OECD global minimum tax agreements."
    ]
  },
  israel: {
    memberships: [
      { name: "UN", year: "1949", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "OECD", year: "2010", status: "Member" }
    ],
    strategicBenefits: [
      "Integration into global high-tech and scientific research networks via OECD collaboration.",
      "Bilateral trade access to key Western markets (US, EU) through specialized trade agreements.",
      "Deep bilateral strategic, intelligence, and military collaboration with the United States."
    ],
    drawbacksContentious: [
      "Persistent exclusion from regional Middle Eastern political and economic organizations.",
      "Ongoing international criticism and legal challenges at the UN over territorial disputes.",
      "Complex diplomatic balancing of bilateral ties with major powers amid regional security dynamics."
    ]
  },
  japan: {
    memberships: [
      { name: "UN", year: "1956", status: "Member" },
      { name: "OECD", year: "1964", status: "Member" },
      { name: "G7", year: "1975", status: "Founding Member" },
      { name: "APEC", year: "1989", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "ASEAN Plus Three", year: "1997", status: "Plus Three Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "RCEP", year: "2022", status: "Member" }
    ],
    strategicBenefits: [
      "Access to a comprehensive US security umbrella (via the Treaty of Mutual Cooperation and Security), ensuring deterrence in East Asia.",
      "High-tier global trade integration and tariff-reduction pathways via RCEP and APEC, sustaining auto and tech export markets.",
      "Leadership status in the Asian Development Bank (ADB) and prominent voice in Western-aligned institutions (G7/OECD) to counter regional hegemony."
    ],
    drawbacksContentious: [
      "Persistent territorial disputes (Senkaku Islands with China, Kuril Islands with Russia), complicating regional economic cooperation.",
      "Sovereign debt pressure, with Japan holding one of the world's highest debt-to-GDP ratios (over 260%), complicating fiscal funding of memberships.",
      "Domestic resistance to large-scale immigration, creating friction with international organizations advising on labor shortage mitigation."
    ]
  },
  italy: {
    memberships: [
      { name: "NATO", year: "1949", status: "Founding Member" },
      { name: "UN", year: "1955", status: "Member" },
      { name: "EU", year: "1957", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "Schengen Zone", year: "1997", status: "Member" },
      { name: "Eurozone", year: "1999", status: "Member" }
    ],
    strategicBenefits: [
      "Direct integration into the EU Single Market, supporting Italian manufacturing and agricultural exports.",
      "Collective defense and strategic security coverage on NATO's southern Mediterranean flank.",
      "Significant political voice within Eurozone and G7 financial policy decision-making circles."
    ],
    drawbacksContentious: [
      "Severe domestic fiscal pressure to comply with EU stability pact debt limits amidst slow GDP growth.",
      "Front-line burden of managing Mediterranean migration flows under Dublin Regulation frameworks.",
      "Geopolitical friction over balancing Mediterranean trade ties with broader EU/NATO security postures."
    ]
  },
  kenya: {
    memberships: [
      { name: "UN", year: "1963", status: "Member" },
      { name: "Commonwealth", year: "1963", status: "Member" },
      { name: "COMESA", year: "1994", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "EAC", year: "2000", status: "Founding Member" }
    ],
    strategicBenefits: [
      "Economic leadership and service sector hub status in East Africa via EAC integration.",
      "Hosting major UN headquarters (UNEP, UN-Habitat) in Nairobi, elevating global diplomatic status.",
      "Tariff-free market access and logistics corridors connecting landlocked neighbors to the Mombasa port."
    ],
    drawbacksContentious: [
      "Security costs and vulnerability to cross-border attacks from Al-Shabaab in neighboring Somalia.",
      "Trade disputes with EAC partners over non-tariff barriers and agricultural import restrictions.",
      "High external debt servicing commitments, restricting domestic infrastructure budgets."
    ]
  },
  malaysia: {
    memberships: [
      { name: "Commonwealth", year: "1957", status: "Member" },
      { name: "UN", year: "1957", status: "Member" },
      { name: "ASEAN", year: "1967", status: "Founding Member" },
      { name: "APEC", year: "1989", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "ASEAN Plus Three", year: "1997", status: "Member" },
      { name: "RCEP", year: "2022", status: "Member" },
      { name: "CPTPP", year: "2022", status: "Member" }
    ],
    strategicBenefits: [
      "Key positioning along the vital Malacca Strait trade route, driving export-led manufacturing.",
      "Access to wide-ranging regional trade agreements (RCEP, CPTPP), reducing tariffs for global exports.",
      "Strong diplomatic presence in regional and Islamic affairs (OIC), promoting trade and political stability."
    ],
    drawbacksContentious: [
      "Balancing economic reliance on China with security concerns and territorial claims in the South China Sea.",
      "Domestic industrial pressure to protect sensitive sectors (e.g. automotive) under trade liberalization pacts.",
      "Managing cross-border migration flows and regional coordination on labor rights standards."
    ]
  },
  mexico: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "OECD", year: "1994", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "CPTPP", year: "2018", status: "Member" },
      { name: "USMCA", year: "2020", status: "Member" }
    ],
    strategicBenefits: [
      "Deep economic integration with the US and Canada under USMCA, driving nearshoring investments.",
      "Extensive global trade network via CPTPP, reducing reliance on single-country export markets.",
      "High manufacturing competitiveness and technology transfers from advanced OECD alignments."
    ],
    drawbacksContentious: [
      "Extreme vulnerability to US trade policies, immigration restrictions, and bilateral political swings.",
      "Disputes with USMCA partners over energy sector reforms and agricultural GMO rules.",
      "Security cooperation challenges along borders regarding drug cartels and migration flows."
    ]
  },
  netherlands: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "NATO", year: "1949", status: "Founding Member" },
      { name: "EU", year: "1957", status: "Founding Member" },
      { name: "Schengen Zone", year: "1995", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "Eurozone", year: "1999", status: "Member" }
    ],
    strategicBenefits: [
      "Port of Rotterdam functioning as the primary maritime gateway to the entire European Single Market.",
      "Seamless logistics, free movement of capital, and labor within Schengen and the Eurozone.",
      "High political influence in EU financial and regulatory policies as a core Northern member."
    ],
    drawbacksContentious: [
      "Domestic farmer protests and political clashes over strict EU-mandated environmental and nitrogen emission targets.",
      "National identity debates regarding sovereignty tradeoffs in EU fiscal integration.",
      "Security and defense spending debates to fulfill NATO commitments amid local priorities."
    ]
  },
  niger: {
    memberships: [
      { name: "UN", year: "1960", status: "Member" },
      { name: "AU", year: "1963", status: "Founding Member (Suspended)" },
      { name: "ECOWAS", year: "1975", status: "Member (Withdrawing)" },
      { name: "WTO", year: "1996", status: "Member" },
      { name: "Sahel States Alliance", year: "2023", status: "Founding Member" }
    ],
    strategicBenefits: [
      "Security and political mutual assistance with neighboring Sahel military regimes (Mali, Burkina Faso).",
      "Uranium export leverage in international raw material negotiations.",
      "Regional infrastructure connections, though currently disrupted by political changes."
    ],
    drawbacksContentious: [
      "Severe economic and border restrictions following suspension from ECOWAS and regional bodies.",
      "Suspension of crucial Western development aid and military cooperation programs.",
      "High vulnerability to regional insurgencies without international military support networks."
    ]
  },
  nigeria: {
    memberships: [
      { name: "Commonwealth", year: "1960", status: "Member" },
      { name: "UN", year: "1960", status: "Member" },
      { name: "AU", year: "1963", status: "Founding Member" },
      { name: "OPEC", year: "1971", status: "Member" },
      { name: "ECOWAS", year: "1975", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "AfCFTA", year: "2020", status: "Member" }
    ],
    strategicBenefits: [
      "Regional leadership and economic dominance in West Africa through the ECOWAS framework.",
      "Oil pricing influence and access to OPEC coordination channels, supporting state revenues.",
      "New market opportunities for domestic industries across Africa via the AfCFTA agreement."
    ],
    drawbacksContentious: [
      "Financial and military strain from hosting and funding regional ECOWAS peacekeeping operations.",
      "Internal economic shocks related to compliance with OPEC production cuts and oil price volatility.",
      "Border security challenges and contraband smuggling, complicating regional trade integration."
    ]
  },
  peru: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "CAN", year: "1969", status: "Member" },
      { name: "WTO", year: "1996", status: "Member" },
      { name: "APEC", year: "1998", status: "Member" },
      { name: "Pacific Alliance", year: "2011", status: "Founding Member" },
      { name: "CPTPP", year: "2021", status: "Member" }
    ],
    strategicBenefits: [
      "Reduced tariff barriers for mineral and agricultural exports to fast-growing Asian economies.",
      "Trade integration and capital sharing with Latin American partners in the Pacific Alliance.",
      "Enhanced regional development and connectivity through the Andean Community (CAN)."
    ],
    drawbacksContentious: [
      "Domestic political instability hampering consistent foreign trade policy execution.",
      "Frictions over environmental compliance in mining sectors to meet CPTPP standards.",
      "Balancing economic dependencies between primary trade partner China and traditional ally US."
    ]
  },
  philippines: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "ASEAN", year: "1967", status: "Founding Member" },
      { name: "APEC", year: "1989", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "ASEAN Plus Three", year: "1997", status: "Member" },
      { name: "RCEP", year: "2023", status: "Member" }
    ],
    strategicBenefits: [
      "US security treaty (MDT) backing maritime defense claims in the West Philippine Sea.",
      "Regional supply chain integration and manufacturing exports via RCEP and ASEAN.",
      "Substantial remittances and labor mobility supported by bilateral international frameworks."
    ],
    drawbacksContentious: [
      "Escalating maritime and diplomatic confrontations with China over territory in the South China Sea.",
      "Domestic political polarization regarding US military base access and presence.",
      "Persistent trade deficits with larger, more industrialized ASEAN trade partners."
    ]
  },
  poland: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "OECD", year: "1996", status: "Member" },
      { name: "NATO", year: "1999", status: "Member" },
      { name: "EU", year: "2004", status: "Member" },
      { name: "Schengen Zone", year: "2007", status: "Member" }
    ],
    strategicBenefits: [
      "Strong defense umbrella on NATO's eastern flank, securing national sovereignty.",
      "Direct integration into the EU Single Market, driving industrial manufacturing growth.",
      "Access to substantial EU cohesion funds for infrastructure development."
    ],
    drawbacksContentious: [
      "Front-line exposure to regional security crises and high defense spending targets (4%+ GDP).",
      "Sovereignty debates and legislative friction with the European Commission over judicial reforms.",
      "Agricultural and labor trade tensions with neighboring non-EU Eastern nations."
    ]
  },
  russia: {
    memberships: [
      { name: "UN", year: "1945", status: "Permanent Security Council Member" },
      { name: "CSTO", year: "1992", status: "Founding Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "SCO", year: "2001", status: "Founding Member" },
      { name: "BRICS", year: "2009", status: "Founding Member" },
      { name: "WTO", year: "2012", status: "Member" },
      { name: "EAEU", year: "2015", status: "Founding Member" }
    ],
    strategicBenefits: [
      "Regional military hegemony and security cooperation in post-Soviet states via CSTO.",
      "Bypassing Western financial systems via alternative trade networks in BRICS and SCO.",
      "UN Security Council veto power, blocking hostile international resolutions."
    ],
    drawbacksContentious: [
      "Severe international isolation and sanctions due to regional security conflicts.",
      "Increasing economic dependency on China as Western trade options remain blocked.",
      "Frictions within EAEU as partners seek to balance ties with Western markets."
    ]
  },
  rwanda: {
    memberships: [
      { name: "UN", year: "1962", status: "Member" },
      { name: "AU", year: "1963", status: "Founding Member" },
      { name: "WTO", year: "1996", status: "Member" },
      { name: "EAC", year: "2007", status: "Member" },
      { name: "Commonwealth", year: "2009", status: "Member" }
    ],
    strategicBenefits: [
      "Enhanced regional trade and transport logistics via East African Community integration.",
      "High donor confidence and funding options through Commonwealth and AU diplomatic networks.",
      "Leadership in regional peacekeeping missions, raising global diplomatic leverage."
    ],
    drawbacksContentious: [
      "Geopolitical tensions and border conflicts with neighboring DRC over security concerns.",
      "High dependency on international aid, exposing the budget to diplomatic shocks.",
      "Periodic border closures with EAC neighbors disrupting regional trade stability."
    ]
  },
  "saudi-arabia": {
    memberships: [
      { name: "Arab League", year: "1945", status: "Founding Member" },
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "OPEC", year: "1960", status: "Founding Member" },
      { name: "GCC", year: "1981", status: "Founding Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "WTO", year: "2005", status: "Member" }
    ],
    strategicBenefits: [
      "Major oil market pricing influence and revenue management through leadership of OPEC.",
      "Regional security and economic integration with Gulf states via the GCC.",
      "Global economic coordination platform and investment influence as a G20 member."
    ],
    drawbacksContentious: [
      "Geopolitical and security rivalries with Iran, affecting regional trade stability.",
      "International criticism and alignment issues regarding environmental and transition policies.",
      "Balancing traditional security ties with the US against growing trade alignments with China/Russia."
    ]
  },
  singapore: {
    memberships: [
      { name: "UN", year: "1965", status: "Member" },
      { name: "ASEAN", year: "1967", status: "Founding Member" },
      { name: "APEC", year: "1989", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "ASEAN Plus Three", year: "1997", status: "Member" },
      { name: "CPTPP", year: "2018", status: "Member" },
      { name: "RCEP", year: "2022", status: "Member" }
    ],
    strategicBenefits: [
      "Central economic and political integration within Southeast Asia via ASEAN, preserving regional stability and neutrality.",
      "Seamless integration into global supply chains with minimal trade barriers via extensive free trade networks.",
      "Global hub status for maritime transport, financial services, and corporate headquarters."
    ],
    drawbacksContentious: [
      "Geopolitical Balancing Act: Facing immense strategic pressure to maintain neutrality between the US and China, as ASEAN membership complicates taking hard stances on South China Sea disputes.",
      "Regulatory Compliance: Strict alignment with international anti-money laundering and tax standards to maintain global hub status, imposing heavy compliance burdens on domestic institutions.",
      "Vulnerability to global trade protectionism and shifts in regional supply chains."
    ]
  },
  "south-africa": {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "AU", year: "1963", status: "Founding Member" },
      { name: "SADC", year: "1992", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "BRICS", year: "2010", status: "Member" }
    ],
    strategicBenefits: [
      "A leading political and economic voice representing the African continent in BRICS and G20.",
      "Regional economic dominance and infrastructure integration within Southern Africa (SADC).",
      "Gateway status for foreign investment looking to expand into Sub-Saharan markets."
    ],
    drawbacksContentious: [
      "Diplomatic friction with Western partners over foreign policy stances on global conflicts.",
      "Implementation challenges of regional free trade agreements amidst high domestic unemployment.",
      "Coordinating regional security responses to conflicts in neighboring Southern African states."
    ]
  },
  "south-korea": {
    memberships: [
      { name: "APEC", year: "1989", status: "Member" },
      { name: "UN", year: "1991", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "OECD", year: "1996", status: "Member" },
      { name: "ASEAN Plus Three", year: "1997", status: "Plus Three Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "RCEP", year: "2022", status: "Member" }
    ],
    strategicBenefits: [
      "Robust security partnership with the US, deterring regional military escalation.",
      "Seamless export markets for technology and manufacturing via RCEP and bilateral FTAs.",
      "High status in international development policies through OECD and G20 participation."
    ],
    drawbacksContentious: [
      "Severe regional security pressure from North Korea and neighboring major powers.",
      "Difficult economic balancing between primary security ally (US) and largest trade partner (China).",
      "Historical and trade policy disputes with neighboring Japan, complicating trilateral security coordination."
    ]
  },
  sudan: {
    memberships: [
      { name: "Arab League", year: "1956", status: "Member" },
      { name: "UN", year: "1956", status: "Member" },
      { name: "AU", year: "1963", status: "Founding Member (Suspended)" },
      { name: "COMESA", year: "1994", status: "Member" },
      { name: "IGAD", year: "1996", status: "Founding Member" }
    ],
    strategicBenefits: [
      "Access to Arab development funds and strategic regional infrastructure projects.",
      "Security coordination platform for border monitoring in the Horn of Africa.",
      "Potential agricultural export markets within COMESA and the Arab League."
    ],
    drawbacksContentious: [
      "Suspension from the African Union following military coups, restricting diplomatic support.",
      "Ongoing civil war disrupting all benefits of regional economic integration.",
      "High exposure to external sanctions and freeze of international development loans."
    ]
  },
  switzerland: {
    memberships: [
      { name: "EFTA", year: "1960", status: "Founding Member" },
      { name: "Council of Europe", year: "1963", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "UN", year: "2002", status: "Member" },
      { name: "Schengen Zone", year: "2008", status: "Member" }
    ],
    strategicBenefits: [
      "Preservation of historic armed neutrality while participating in global governance.",
      "Hosting major international organizations (UN, WTO, WHO), raising diplomatic status.",
      "Bilateral trade access to the EU Single Market and Schengen cooperation."
    ],
    drawbacksContentious: [
      "Ongoing domestic debate over sovereignty trade-offs in institutional agreements with the EU.",
      "International pressure on Swiss banking confidentiality and asset hosting.",
      "Balancing constitutional neutrality with participation in international sanctions."
    ]
  },
  thailand: {
    memberships: [
      { name: "UN", year: "1946", status: "Member" },
      { name: "ASEAN", year: "1967", status: "Founding Member" },
      { name: "APEC", year: "1989", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "ASEAN Plus Three", year: "1997", status: "Member" },
      { name: "RCEP", year: "2022", status: "Member" }
    ],
    strategicBenefits: [
      "Logistic and manufacturing hub status in Mainland Southeast Asia via ASEAN.",
      "Wide-ranging tariff reductions for automotive and agricultural exports via RCEP.",
      "Strategic security partnership with the US, balancing regional military ties."
    ],
    drawbacksContentious: [
      "Domestic political instability delay trade treaty ratifications and agreements.",
      "Navigating US-China trade tensions while preserving vital economic ties with both.",
      "Compliance issues regarding labor standards and environmental rules in regional pacts."
    ]
  },
  turkey: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "Council of Europe", year: "1950", status: "Member" },
      { name: "NATO", year: "1952", status: "Member" },
      { name: "OECD", year: "1961", status: "Founding Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "EU Custom Union", year: "1996", status: "Member" }
    ],
    strategicBenefits: [
      "Control of the strategic Turkish Straits (Bosphorus/Dardanelles) under international conventions.",
      "NATO defense umbrella protection and significant security influence in Eastern Europe/Middle East.",
      "Tariff-free industrial trade with the European Union via the Customs Union."
    ],
    drawbacksContentious: [
      "Long-standing tensions with NATO allies over domestic defense acquisitions and geopolitical alignment.",
      "Frozen EU accession process, causing political frustrations and domestic sovereignty debates.",
      "Frictions over Mediterranean maritime borders and resource exploration with EU neighbors."
    ]
  },
  tuvalu: {
    memberships: [
      { name: "Pacific Islands Forum", year: "1971", status: "Member" },
      { name: "Commonwealth", year: "1978", status: "Member" },
      { name: "AOSIS", year: "1990", status: "Founding Member" },
      { name: "UN", year: "2000", status: "Member" },
      { name: "WTO", year: "2016", status: "Member" }
    ],
    strategicBenefits: [
      "Global advocacy voice on rising sea levels and climate change via AOSIS and UN.",
      "Access to international climate funding and adaptation support.",
      "Bilateral security and migration agreements with regional powers (e.g. Australia)."
    ],
    drawbacksContentious: [
      "High dependency on external aid, making the country vulnerable to shifting donor policies.",
      "Very limited economic diversification and exposure to international shipping cost increases.",
      "Fears of loss of sovereignty if climate displacement forces population relocation."
    ]
  },
  uae: {
    memberships: [
      { name: "OPEC", year: "1967", status: "Member" },
      { name: "Arab League", year: "1971", status: "Member" },
      { name: "UN", year: "1971", status: "Member" },
      { name: "GCC", year: "1981", status: "Founding Member" },
      { name: "WTO", year: "1996", status: "Member" },
      { name: "BRICS", year: "2024", status: "Member" }
    ],
    strategicBenefits: [
      "Global logistics and aviation leadership, serving as a hub between East and West.",
      "Substantial energy market influence and financial reserves coordinated via OPEC.",
      "Diversified diplomatic and trade funding options through new BRICS membership."
    ],
    drawbacksContentious: [
      "Geopolitical balancing required between major powers in regional Middle Eastern conflicts.",
      "Heavy compliance requirements to meet global anti-money laundering and tax standards.",
      "Frictions within GCC regarding economic competition and foreign policy postures."
    ]
  },
  uk: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member (Permanent Veto)" },
      { name: "NATO", year: "1949", status: "Founding Member" },
      { name: "G7", year: "1975", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "AUKUS", year: "2021", status: "Founding Member" },
      { name: "CPTPP", year: "2023", status: "Member" }
    ],
    strategicBenefits: [
      "Collective defense guarantees under Article 5 of NATO.",
      "High-tier security, intelligence sharing (Five Eyes), and advanced military technology access via AUKUS.",
      "Global trade leverage, tariff reduction, and dispute resolution frameworks via WTO and CPTPP."
    ],
    drawbacksContentious: [
      "Post-Brexit Transition: Adjusting to the loss of the European Single Market; ongoing friction over regulatory divergence and trade barriers with the EU.",
      "Sovereignty vs. Multilateralism: High financial commitments to NATO defense spending targets (2%+ of GDP) amidst domestic fiscal pressure.",
      "Geopolitical Friction: Increased regional tensions with non-aligned superpowers due to active containment postures in security pacts."
    ]
  },
  ukraine: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member" },
      { name: "Council of Europe", year: "1995", status: "Member" },
      { name: "WTO", year: "2008", status: "Member" }
    ],
    strategicBenefits: [
      "Broad international financial, humanitarian, and military assistance to support state survival.",
      "Integration into European transport, transit, and electrical power grids.",
      "Pathways for regulatory alignment and future economic growth through EU Candidate status."
    ],
    drawbacksContentious: [
      "Severe security and sovereign survival crises due to active armed invasion.",
      "Vulnerability to shifts in political support from Western military and financial backers.",
      "Enormous institutional reforms required to meet NATO and EU entry criteria."
    ]
  },
  usa: {
    memberships: [
      { name: "UN", year: "1945", status: "Founding Member (Permanent Veto)" },
      { name: "NATO", year: "1949", status: "Founding Member" },
      { name: "G7", year: "1975", status: "Founding Member" },
      { name: "APEC", year: "1989", status: "Member" },
      { name: "WTO", year: "1995", status: "Member" },
      { name: "G20", year: "1999", status: "Member" },
      { name: "USMCA", year: "2020", status: "Founding Member" },
      { name: "AUKUS", year: "2021", status: "Founding Member" }
    ],
    strategicBenefits: [
      "Global power projection and military command structures secured by NATO, AUKUS, and global bases.",
      "Veto power at the UN Security Council and dominant voting share in the IMF/World Bank.",
      "Sovereign monetary flexibility from the US Dollar's role as the primary global reserve currency."
    ],
    drawbacksContentious: [
      "Domestic political divisions over the financial cost and deployment risks of global security commitments.",
      "Intense trade and technology competition, particularly involving China and international trade disputes.",
      "Tension between national policy decisions and multilateral agreements on environment and human rights."
    ]
  },
  vietnam: {
    memberships: [
      { name: "UN", year: "1977", status: "Member" },
      { name: "ASEAN", year: "1995", status: "Member" },
      { name: "ASEAN Plus Three", year: "1997", status: "Member" },
      { name: "APEC", year: "1998", status: "Member" },
      { name: "WTO", year: "2007", status: "Member" },
      { name: "CPTPP", year: "2018", status: "Member" },
      { name: "RCEP", year: "2022", status: "Member" }
    ],
    strategicBenefits: [
      "Integration into global manufacturing supply chains as a major export hub.",
      "Regional peace and neutrality secured by ASEAN diplomatic frameworks.",
      "Reduced tariff barriers for textiles, electronics, and agriculture under CPTPP and RCEP."
    ],
    drawbacksContentious: [
      "Overlapping territorial claims with China in the South China Sea, posing security risks.",
      "Difficult diplomatic balancing between primary security partners (US) and key economic neighbor (China).",
      "Strains to comply with strict labor and environmental standards under new trade treaties."
    ]
  }
};
