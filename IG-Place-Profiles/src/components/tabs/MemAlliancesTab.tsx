import React, { useState } from 'react';
import { memAlliancesData } from './MemAlliancesData';
import { ShieldCheck, AlertTriangle, History, Landmark, Globe, X, Info } from 'lucide-react';

interface MemAlliancesTabProps {
  countryId: string;
  countryName: string;
}

interface Organization {
  name: string;
  year: string;
  status: string;
}

const orgDescriptions: Record<string, string> = {
  "UN": "The United Nations (UN) is an international organization founded in 1945. It is currently made up of 193 Member States. Its mission and work are guided by the purposes and principles contained in its founding Charter, focusing on international peace, security, human rights, humanitarian aid, and sustainable development.",
  "WTO": "The World Trade Organization (WTO) is the only global international organization dealing with the rules of trade between nations. At its heart are the WTO agreements, negotiated and signed by the bulk of the world’s trading nations and ratified in their parliaments, to facilitate free and fair trade.",
  "NATO": "The North Atlantic Treaty Organization (NATO) is a political and military alliance of European and North American countries. Established in 1949, its primary purpose is collective defense against aggression, meaning an attack against one member is considered an attack against all (Article 5).",
  "EU": "The European Union (EU) is a unique political and economic union between 27 European countries. It has created a single internal market allowing free movement of goods, services, capital, and people, as well as a common trade and agricultural policy.",
  "G7": "The Group of Seven (G7) is an informal intergovernmental forum consisting of seven of the world's advanced economies: Canada, France, Germany, Italy, Japan, the United Kingdom, and the United States, plus the European Union, coordinating global economic governance and security policy.",
  "G20": "The G20 (Group of Twenty) is the premier forum for international economic cooperation. It comprises 19 countries, the European Union, and the African Union, representing major developed and emerging economies to discuss global financial stability, climate change, and sustainable development.",
  "AUKUS": "AUKUS is a trilateral security partnership between Australia, the United Kingdom, and the United States, established in 2021. It focuses on Indo-Pacific security and enables the sharing of advanced defense technologies, including nuclear-powered conventional submarines.",
  "CPTPP": "The Comprehensive and Progressive Agreement for Trans-Pacific Partnership (CPTPP) is a major free trade agreement between 11 countries (and newly the UK) in the Asia-Pacific region, promoting tariff reductions, market access, and high-standard investment rules.",
  "RCEP": "The Regional Comprehensive Economic Partnership (RCEP) is a major free trade agreement among Asia-Pacific nations, including China, Japan, South Korea, Australia, New Zealand, and the 10 ASEAN members. It is the world's largest trade bloc by GDP and population.",
  "APEC": "Asia-Pacific Economic Cooperation (APEC) is a regional economic forum established in 1989 to leverage the growing interdependence of the Asia-Pacific. It promotes free trade, economic growth, and regional cooperation.",
  "ASEAN": "The Association of Southeast Asian Nations (ASEAN) is a political and economic union of 10 member states in Southeast Asia. It promotes intergovernmental cooperation and facilitates economic, political, security, and socio-cultural integration among its members.",
  "ASEAN Plus Three": "The ASEAN Plus Three (APT) is a cooperative framework comprising the 10 member states of the Association of Southeast Asian Nations (ASEAN) plus China, Japan, and the Republic of Korea (ROK). Established in 1997 in response to the East Asian financial crisis, it serves as a central pillar of regional economic integration and cooperation across a multitude of sectors.",
  "BRICS": "BRICS is an intergovernmental organization comprising major emerging economies: Brazil, Russia, India, China, and South Africa, which expanded in 2024 to include Egypt, Ethiopia, Iran, and the UAE. It aims to promote economic cooperation and challenge Western-dominated global systems.",
  "SCO": "The Shanghai Cooperation Organisation (SCO) is a Eurasian political, economic, international security, and defense organization. Established in 2001 by China and Russia, it focuses on regional security, counter-terrorism, and economic partnership.",
  "ANZUS": "The Australia, New Zealand, United States Security Treaty (ANZUS) is a collective security agreement signed in 1951. It binds Australia and the United States (and New Zealand historically) to cooperate on military and defense matters in the Pacific region.",
  "SAARC": "The South Asian Association for Regional Cooperation (SAARC) is the regional intergovernmental organization and geopolitical union of states in South Asia. Established in 1985, its goal is to promote economic development and regional integration.",
  "BIMSTEC": "The Bay of Bengal Initiative for Multi-Sectoral Technical and Economic Cooperation (BIMSTEC) is a regional organization comprising seven South and Southeast Asian nations. It bridges South and Southeast Asia, promoting connectivity and economic cooperation.",
  "Commonwealth": "The Commonwealth of Nations is a voluntary association of 56 sovereign member states, mostly former territories of the British Empire. It promotes democratic values, human rights, development, and cultural cooperation among members.",
  "OECD": "The Organisation for Economic Co-operation and Development (OECD) is an international organization of 38 high-income countries. It serves as a forum for democracies committed to the market economy, developing policies to improve global economic and social well-being.",
  "Schengen Zone": "The Schengen Area is an zone of 29 European countries that have officially abolished all passport and border controls at their mutual borders, enabling frictionless travel, labor mobility, and trade integration.",
  "Eurozone": "The Eurozone is a monetary union of 20 European Union member states that have adopted the Euro as their common currency and sole legal tender, managed by the European Central Bank.",
  "OAS": "The Organization of American States (OAS) is the premier regional forum for political discussion, policy analysis, and decision-making in the Western Hemisphere, promoting democracy, human rights, security, and development.",
  "Mercosur": "Mercosur (Southern Common Market) is a South American trade bloc established in 1991 by Argentina, Brazil, Paraguay, and Uruguay. It promotes free trade and the fluid movement of goods, services, and currency.",
  "AU": "The African Union (AU) is a continental union consisting of the 55 member states of the African continent. Established in 2002 to replace the OAU, its goals are to promote unity, coordinate development, and maintain peace across Africa.",
  "CSTO": "The Collective Security Treaty Organization (CSTO) is a military alliance in Eurasia consisting of selected post-Soviet states (including Russia, Belarus, Armenia, Kazakhstan, Kyrgyzstan, and Tajikistan), practicing collective security.",
  "EAEU": "The Eurasian Economic Union (EAEU) is an economic union of states located in Eastern Europe, Western Asia, and Central Asia. Established in 2015, it facilitates the free movement of goods, services, capital, and labor.",
  "ALBA": "The Bolivarian Alliance for the Peoples of Our America (ALBA) is an intergovernmental organization based on the idea of social, political, and economic integration in Latin America and the Caribbean, representing socialist ideological cooperation.",
  "CELAC": "The Community of Latin American and Caribbean States (CELAC) is a regional bloc of 33 Latin American and Caribbean nations. It aims to promote political dialogue, integration, and economic cooperation without US or Canadian participation.",
  "COMESA": "The Common Market for Eastern and Southern Africa (COMESA) is a free trade area with 21 member states. It focuses on regional integration, trade liberalization, and joint developmental programs.",
  "SADC": "The Southern African Development Community (SADC) is a regional economic community established in 1992. It promotes socio-economic cooperation, integration, and security coordination among 16 Southern African nations.",
  "EAC": "The East African Community (EAC) is a regional intergovernmental organization of 8 partner states in the African Great Lakes region. It operates a common market and is working toward a monetary union and political federation.",
  "Arab League": "The Arab League is a regional organization of 22 Arab states in the Middle East and North Africa. Established in 1945, it facilitates political, economic, cultural, and social cooperation among its members.",
  "IGAD": "The Intergovernmental Authority on Development (IGAD) is an eight-country regional bloc in East Africa (Horn of Africa). It focuses on development, food security, environmental protection, and conflict resolution.",
  "G5 Sahel": "The G5 Sahel was an institutional framework for coordination of regional cooperation and development in security and development policies among Burkina Faso, Chad, Mali, Mauritania, and Niger (highly restructured recently).",
  "CEMAC": "The Economic and Monetary Community of Central Africa (CEMAC) is a regional organization promoting economic integration, free movement of people, and monetary cooperation using the Central African CFA Franc.",
  "EFTA": "The European Free Trade Association (EFTA) is a regional trade organization and free trade area consisting of four European states: Iceland, Liechtenstein, Norway, and Switzerland, operating parallel to the EU.",
  "EEA": "The European Economic Area (EEA) agreement links the European Union member states and three EFTA states (Iceland, Liechtenstein, and Norway) into a single market, ensuring the free movement of goods, services, capital, and labor.",
  "Pacific Alliance": "The Pacific Alliance is a Latin American trade bloc formed by Chile, Colombia, Mexico, and Peru. It focuses on free trade, economic integration, and joint outreach to Asia-Pacific markets.",
  "CAN": "The Andean Community (CAN) is a customs union comprising the South American countries of Bolivia, Colombia, Ecuador, and Peru, promoting regional economic integration and harmonized customs rules.",
  "ECOWAS": "The Economic Community of West African States (ECOWAS) is a regional political and economic union of 15 countries in West Africa, promoting integration across transport, energy, and commercial sectors.",
  "Sahel States Alliance": "The Alliance of Sahel States (AES) is a collective defense pact created in 2023 between Mali, Niger, and Burkina Faso, focusing on mutual security assistance and political integration.",
  "Non-Aligned Movement": "The Non-Aligned Movement (NAM) is a forum of 120 developing countries that are not formally aligned with or against any major power bloc, advocating for national sovereignty and development.",
  "GCC": "The Gulf Cooperation Council (GCC) is a political and economic alliance of six Middle Eastern countries: Saudi Arabia, Kuwait, the UAE, Qatar, Bahrain, and Oman, facilitating economic and security integration.",
  "EU Custom Union": "The European Union Customs Union is a customs union consisting of all EU member states and selected neighbors (like Turkey), ensuring zero internal tariffs and a common external tariff structure.",
  "Pacific Islands Forum": "The Pacific Islands Forum is the region’s premier political and economic intergovernmental organization. Founded in 1971, it promotes cooperation between 18 member countries, addressing regional security, climate change, and maritime resources.",
  "AOSIS": "The Alliance of Small Island States (AOSIS) is a coalition of 39 low-lying coastal and small island countries. It serves as an advocacy voice on climate change, sea-level rise, and sustainable development.",
  "ECO": "The Economic Cooperation Organization (ECO) is an ad hoc Asian intergovernmental organization comprising 10 member states. It provides a platform to discuss trade, investment, and transport integration in Central and South-West Asia.",
  "Quad": "The Quadrilateral Security Dialogue (Quad) is a strategic security dialogue between Australia, India, Japan, and the United States, focusing on maintaining a free, open, and secure Indo-Pacific region.",
  "Three Seas Initiative": "The Three Seas Initiative is a forum of 13 European Union member states along a north-south axis from the Baltic, Adriatic, and Black Seas, promoting infrastructure, energy, and digital connectivity.",
  "Council of Europe": "The Council of Europe is the continent's leading human rights organization. It comprises 46 member states, including all EU members, promoting democracy, human rights, and the rule of law.",
  "Francophonie": "The International Organisation of La Francophonie (OIF) represents countries and regions where French is the customs language or has a significant presence, promoting linguistic and cultural diversity."
};

export const MemAlliancesTab: React.FC<MemAlliancesTabProps> = ({ countryId, countryName }) => {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // Retrieve the memberships data for the countryId, with a fallback if not found
  const countryData = memAlliancesData[countryId] || {
    memberships: [
      { name: "WTO", year: "1995", status: "Official Member" },
      { name: "UN", year: "1945", status: "Founding Member" }
    ],
    strategicBenefits: [
      `Access to multilateral diplomatic dialogue and global trade resolution frameworks for ${countryName}.`,
      `Participation in international aid coordination and regional economic consultations.`,
      `Enhanced cross-border infrastructure connectivity and trade integration.`
    ],
    drawbacksContentious: [
      `Sovereignty vs. Multilateralism: Balancing local legislation with binding international organization mandates.`,
      `Geopolitical alignment risks: Potential trade friction with non-aligned blocks due to multilateral agreements.`,
      `Heavy economic compliance burdens required to meet international standards.`
    ]
  };

  const handleCloseModal = () => setSelectedOrg(null);

  const getOrgDescription = (name: string) => {
    return orgDescriptions[name] || `No detailed description available for ${name}. This organization represents a key geopolitical, security, or trade alignment for ${countryName}.`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Overview Header Card */}
      <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-500 animate-pulse" />
            Memberships & Strategic Alliances
          </h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            Geopolitical positioning, sovereignty tradeoffs, and trade integration of {countryName} (Click memberships to inspect)
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-3 py-1 rounded-full uppercase tracking-wider select-none shrink-0 self-start md:self-center">
          <Landmark className="w-3.5 h-3.5 mr-1" />
          Alliance Matrix
        </div>
      </div>

      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Column 1: Key Memberships & Entry Timeline */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-5 flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
          <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-880">
            <History className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Key Memberships & Timeline
          </h4>
          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[400px] pr-1">
            {countryData.memberships.map((org, index) => (
              <div 
                key={index}
                onClick={() => setSelectedOrg(org)}
                className="group relative flex items-start gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3 rounded-xl hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-800/60 cursor-pointer transition-all duration-200"
                title={`Click to inspect details on ${org.name}`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-150 dark:border-indigo-900/50 px-2 py-0.5 rounded-md font-mono">
                    {org.year}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold text-slate-800 dark:text-slate-250 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {org.name}
                  </h5>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                    <span>{org.status}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                      Info &rarr;
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Strategic & Economic Benefits */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-5 flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
          <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            Strategic & Economic Benefits
          </h4>
          <div className="flex-1 space-y-4">
            {countryData.strategicBenefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/20 p-3.5 rounded-xl"
              >
                <div className="bg-emerald-55 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/40 shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Drawbacks & Contentious Issues */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-5 flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
          <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-500" />
            Drawbacks & Contentious Issues
          </h4>
          <div className="flex-1 space-y-4">
            {countryData.drawbacksContentious.map((drawback, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100/35 dark:border-amber-900/20 p-3.5 rounded-xl"
              >
                <div className="bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-500 p-1.5 rounded-lg border border-amber-100/55 dark:border-amber-900/40 shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {drawback}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Syllabus Sync Footer banner */}
      <div className="border border-slate-200/60 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-4 flex gap-3.5 items-start">
        <Landmark className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider leading-none mb-1.5">
            IBDP Geography Connections • Sovereignty and Global Alignments
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            This module evaluates the spatial patterns of membership in trade blocs, defense pacts, and multilateral organizations. It examines how integration helps countries overcome geographic frictions or achieve strategic objectives, while presenting threats to national sovereignty and domestic socio-economic structures.
          </p>
        </div>
      </div>

      {/* Popout Interactive Details Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 p-2 rounded-xl border border-indigo-150 dark:border-indigo-900/50">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Organization Profile</h4>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">{selectedOrg.name}</h3>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shadow-sm cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Accession / Entry Year</span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{selectedOrg.year}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Accession Status</span>
                  <span className="text-sm font-extrabold text-slate-850 dark:text-slate-250 truncate block" title={selectedOrg.status}>{selectedOrg.status}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  Description & Geographic Significance
                </h5>
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                  {getOrgDescription(selectedOrg.name)}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex justify-end">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
