import React, { useState, useEffect } from "react";
import { exportDashboardToDocx } from "./docxExport";
import { ComparisonAnalytics } from "./components/ComparisonAnalytics";
import { Handshake, Globe, TrendingUp, Users, Map, Link2, Loader2, Info, Landmark, Shield, AlertTriangle, Coins, Download, XCircle, Flag, Gamepad2, Swords, ArrowLeftRight, ChevronLeft, ChevronRight, Sun, Moon, Archive } from "lucide-react";
import type { DPPlaceProfile } from "./types";

import { EconomyTab } from "./components/tabs/EconomyTab";
import { HumanGeographyTab } from "./components/tabs/HumanGeographyTab";
import { PhysicalLayerTab } from "./components/tabs/PhysicalLayerTab";
import { PopulationTab } from "./components/tabs/PopulationTab";
import { FlagFlipPlayer } from "./components/FlagFlipPlayer";
import { interpolateCohorts } from "./utils/pyramidUtils";
import { db, isFirebaseConfigured } from "./firebase";
import { doc, setDoc, deleteDoc, collection, onSnapshot, query, where, addDoc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { getStudentName, getInitials } from "./utils/studentData";

type TabId = 'economy' | 'human_geography' | 'physical_layer' | 'population';

const flagMapping: Record<string, string> = {
  'bangladesh': 'bd',
  'usa': 'us',
  'china': 'cn',
  'india': 'in',
  'south-korea': 'kr',
  'vietnam': 'vn',
  'philippines': 'ph',
  'malaysia': 'my',
  'russia': 'ru',
  'poland': 'pl',
  'germany': 'de',
  'uk': 'gb',
  'switzerland': 'ch',
  'australia': 'au',
  'brazil': 'br',
  'mexico': 'mx',
  'drc': 'cd',
  'nigeria': 'ng',
  'south-africa': 'za',
  'ethiopia': 'et',
  'sudan': 'sd',
  'chad': 'td',
  'niger': 'ne',
  'iceland': 'is',
  'tuvalu': 'tv',
  'peru': 'pe',
  'rwanda': 'rw',
  'kenya': 'ke',
  'thailand': 'th',
  'belgium': 'be',
  'france': 'fr',
  'netherlands': 'nl',
  'singapore': 'sg',
  'uae': 'ae',
  'saudi-arabia': 'sa',
  'turkey': 'tr',
  'egypt': 'eg',
  'ukraine': 'ua',
  'indonesia': 'id',
  'iran': 'ir',
  'ireland': 'ie',
  'italy': 'it',
  'cuba': 'cu',
  'israel': 'il',
  'japan': 'jp',
  'canada': 'ca',
  'venezuela': 've'
};

const politicalLeadershipMap: Record<string, { leader: string; party: string }> = {
  'bangladesh': { leader: "Muhammad Yunus (Chief Adviser)", party: "Independent (Interim Govt)" },
  'usa': { leader: "Donald Trump (President)", party: "Republican Party" },
  'china': { leader: "Xi Jinping (President)", party: "Chinese Communist Party (CCP)" },
  'india': { leader: "Narendra Modi (Prime Minister)", party: "Bharatiya Janata Party (BJP)" },
  'south-korea': { leader: "Yoon Suk-yeol (President)", party: "People Power Party" },
  'vietnam': { leader: "To Lam (General Secretary)", party: "Communist Party of Vietnam" },
  'philippines': { leader: "Ferdinand Marcos Jr. (President)", party: "Partido Federal ng Pilipinas" },
  'malaysia': { leader: "Anwar Ibrahim (Prime Minister)", party: "Pakatan Harapan" },
  'russia': { leader: "Vladimir Putin (President)", party: "United Russia" },
  'poland': { leader: "Donald Tusk (Prime Minister)", party: "Civic Platform" },
  'germany': { leader: "Olaf Scholz (Chancellor)", party: "Social Democratic Party" },
  'uk': { leader: "Keir Starmer (Prime Minister)", party: "Labour Party" },
  'switzerland': { leader: "Albert Rösti (President for 2026)", party: "Swiss People's Party (SVP)" },
  'australia': { leader: "Anthony Albanese (Prime Minister)", party: "Australian Labor Party" },
  'brazil': { leader: "Luiz Inácio Lula da Silva (President)", party: "Workers' Party (PT)" },
  'mexico': { leader: "Claudia Sheinbaum (President)", party: "Morena Party" },
  'drc': { leader: "Félix Tshisekedi (President)", party: "Union for Democracy & Progress" },
  'nigeria': { leader: "Bola Tinubu (President)", party: "All Progressives Congress" },
  'south-africa': { leader: "Cyril Ramaphosa (President)", party: "African National Congress (ANC)" },
  'ethiopia': { leader: "Abiy Ahmed (Prime Minister)", party: "Prosperity Party" },
  'sudan': { leader: "Abdel Fattah al-Burhan (Council Head)", party: "Military Coalition" },
  'chad': { leader: "Mahamat Déby (President)", party: "Patriotic Salvation Movement" },
  'niger': { leader: "Abdourahamane Tchiani (Junta Head)", party: "Military Junta" },
  'iceland': { leader: "Halla Tómasdóttir (President)", party: "Independent" },
  'tuvalu': { leader: "Feleti Teo (Prime Minister)", party: "Independent" },
  'peru': { leader: "Dina Boluarte (President)", party: "Independent" },
  'rwanda': { leader: "Paul Kagame (President)", party: "Rwandan Patriotic Front" },
  'kenya': { leader: "William Ruto (President)", party: "United Democratic Alliance" },
  'thailand': { leader: "Paetongtarn Shinawatra (Prime Minister)", party: "Pheu Thai Party" },
  'belgium': { leader: "Alexander De Croo (Prime Minister)", party: "Open VLD" },
  'france': { leader: "Emmanuel Macron (President)", party: "Renaissance" },
  'netherlands': { leader: "Dick Schoof (Prime Minister)", party: "Independent (Coalition)" },
  'singapore': { leader: "Lawrence Wong (Prime Minister)", party: "People's Action Party (PAP)" },
  'uae': { leader: "Mohamed bin Zayed Al Nahyan (President)", party: "Federal Supreme Council" },
  'saudi-arabia': { leader: "Mohammed bin Salman (Crown Prince/PM)", party: "House of Saud" },
  'turkey': { leader: "Recep Tayyip Erdoğan (President)", party: "Justice & Development Party (AKP)" },
  'egypt': { leader: "Abdel Fattah el-Sisi (President)", party: "Independent / Military Support Team" },
  'ukraine': { leader: "Volodymyr Zelenskyy (President)", party: "Servant of the People" },
  'indonesia': { leader: "Prabowo Subianto (President)", party: "Gerindra Party" },
  'iran': { leader: "Masoud Pezeshkian (President)", party: "Independent (Reformist)" },
  'ireland': { leader: "Simon Harris (Taoiseach/Prime Minister)", party: "Fine Gael" },
  'italy': { leader: "Giorgia Meloni (Prime Minister)", party: "Brothers of Italy" },
  'cuba': { leader: "Miguel Díaz-Canel (President)", party: "Communist Party of Cuba" },
  'israel': { leader: "Benjamin Netanyahu (Prime Minister)", party: "Likud" },
  'japan': { leader: "Sanae Takaichi (Prime Minister)", party: "Liberal Democratic Party (LDP)" },
  'canada': { leader: "Justin Trudeau (Prime Minister)", party: "Liberal Party" },
  'venezuela': { leader: "Delcy Rodríguez (Acting Leader)", party: "United Socialist Party" }
};

const availableCountries = [
  { id: 'bangladesh', name: 'Bangladesh' },
  { id: 'usa', name: 'United States' },
  { id: 'china', name: 'China' },
  { id: 'india', name: 'India' },
  { id: 'south-korea', name: 'South Korea' },
  { id: 'vietnam', name: 'Vietnam' },
  { id: 'philippines', name: 'Philippines' },
  { id: 'malaysia', name: 'Malaysia' },
  { id: 'russia', name: 'Russia' },
  { id: 'poland', name: 'Poland' },
  { id: 'germany', name: 'Germany' },
  { id: 'uk', name: 'United Kingdom' },
  { id: 'switzerland', name: 'Switzerland' },
  { id: 'australia', name: 'Australia' },
  { id: 'brazil', name: 'Brazil' },
  { id: 'mexico', name: 'Mexico' },
  { id: 'drc', name: 'DRC' },
  { id: 'nigeria', name: 'Nigeria' },
  { id: 'south-africa', name: 'South Africa' },
  { id: 'ethiopia', name: 'Ethiopia' },
  { id: 'sudan', name: 'Sudan' },
  { id: 'chad', name: 'Chad' },
  { id: 'niger', name: 'Niger' },
  { id: 'iceland', name: 'Iceland' },
  { id: 'tuvalu', name: 'Tuvalu' },
  { id: 'peru', name: 'Peru' },
  { id: 'rwanda', name: 'Rwanda' },
  { id: 'kenya', name: 'Kenya' },
  { id: 'thailand', name: 'Thailand' },
  { id: 'belgium', name: 'Belgium' },
  { id: 'france', name: 'France' },
  { id: 'netherlands', name: 'Netherlands' },
  { id: 'singapore', name: 'Singapore' },
  { id: 'uae', name: 'U.A.E.' },
  { id: 'saudi-arabia', name: 'Saudi Arabia' },
  { id: 'turkey', name: 'Turkey' },
  { id: 'egypt', name: 'Egypt' },
  { id: 'ukraine', name: 'Ukraine' },
  { id: 'indonesia', name: 'Indonesia' },
  { id: 'iran', name: 'Iran' },
  { id: 'ireland', name: 'Ireland' },
  { id: 'italy', name: 'Italy' },
  { id: 'cuba', name: 'Cuba' },
  { id: 'israel', name: 'Israel' },
  { id: 'japan', name: 'Japan' },
  { id: 'canada', name: 'Canada' },
  { id: 'venezuela', name: 'Venezuela' }
].sort((a, b) => a.name.localeCompare(b.name));

interface PlaceProfilesAppProps {
  onOpenVault?: () => void;
  onBackToPortal?: () => void;
  isDark?: boolean;
  toggleDark?: () => void;
  activeUserEmail?: string;
  activeTeacherCode?: string;
  role?: string;
  initialTab?: string;
}

export default function App({
  onOpenVault,
  onBackToPortal,
  isDark,
  toggleDark,
  activeUserEmail,
  activeTeacherCode,
  role,
  initialTab
}: PlaceProfilesAppProps = {}) {
  const [activeTab, setActiveTab] = useState<TabId>((initialTab as TabId) || 'population');
  const [sliderYear, setSliderYear] = useState<number>(2026);
  const [selectedCountry, setSelectedCountry] = useState<string>('bangladesh');
  const [data, setData] = useState<DPPlaceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlightHdi, setHighlightHdi] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as TabId);
    }
  }, [initialTab]);

  // Comparison Mode States
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [secondaryCountry, setSecondaryCountry] = useState<string>('usa');
  const [secondaryData, setSecondaryData] = useState<DPPlaceProfile | null>(null);
  const [secondaryLoading, setSecondaryLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [comparisonNarrative, setComparisonNarrative] = useState<string>("");

  // Shared Supabase Presence & Invitations
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
  const [incomingChallenge, setIncomingChallenge] = useState<any | null>(null);
  const [currentGameSessionId, setCurrentGameSessionId] = useState<string | null>(null);
  const [playerStatus, setPlayerStatus] = useState<"available" | "in_game">("available");

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const email = activeUserEmail || "sknight@nlcsjeju.kr";
    const name = role === "student" ? getStudentName(email) : email.split("@")[0];
    const initials = activeTeacherCode || getInitials(name);

    // 1. Presence in Firestore
    const presenceDocRef = doc(db, "lobby_presence", email);
    const trackPresence = async () => {
      try {
        await setDoc(presenceDocRef, {
          email,
          name,
          initials,
          role: role || "student",
          status: playerStatus,
          lastActive: Date.now()
        });
      } catch (err) {
        console.error("Error setting presence:", err);
      }
    };

    trackPresence();

    // Heartbeat every 10 seconds to keep presence fresh
    const heartbeat = setInterval(trackPresence, 10000);

    // Query active presence (active in last 30 seconds)
    const presenceCollection = collection(db, "lobby_presence");
    const unsubscribePresence = onSnapshot(presenceCollection, (snapshot) => {
      const list: any[] = [];
      const cutoff = Date.now() - 30000;
      snapshot.forEach((d) => {
        const p = d.data();
        if (p.email !== email && p.lastActive && p.lastActive > cutoff) {
          list.push(p);
        }
      });
      setOnlinePlayers(list);
    });

    // 2. Query challenges directed to us
    const challengesQuery = query(
      collection(db, "challenges"),
      where("toEmail", "==", email),
      where("status", "==", "pending")
    );

    const unsubscribeChallenges = onSnapshot(challengesQuery, (snapshot) => {
      snapshot.forEach((changeDoc) => {
        const payload = changeDoc.data();
        setIncomingChallenge({
          ...payload,
          id: changeDoc.id
        });
      });
    });

    const handleUnload = () => {
      deleteDoc(presenceDocRef).catch((err) => console.error("Unload delete error:", err));
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(heartbeat);
      unsubscribePresence();
      unsubscribeChallenges();
      window.removeEventListener("beforeunload", handleUnload);
      deleteDoc(presenceDocRef).catch((err) => console.error("Cleanup delete error:", err));
    };
  }, [activeUserEmail, activeTeacherCode, role, playerStatus]);

  const handleAcceptChallenge = async () => {
    if (!incomingChallenge || !db) return;

    const hostEmail = incomingChallenge.fromEmail;
    const guestEmail = activeUserEmail || "sknight@nlcsjeju.kr";

    // Draw random countries
    const hostCard = availableCountries[Math.floor(Math.random() * availableCountries.length)].id;
    const guestCard = availableCountries[Math.floor(Math.random() * availableCountries.length)].id;
    const themes = ["Demographic", "Economic", "Risk"];
    const theme = themes[Math.floor(Math.random() * themes.length)];

    try {
      const sessionRef = await addDoc(collection(db, "game_sessions"), {
        host_id: hostEmail,
        guest_id: guestEmail,
        match_format: incomingChallenge.matchFormat,
        game_mode: incomingChallenge.gameMode || "rounds",
        time_limit: incomingChallenge.timeLimit || 180,
        game_start_time: Date.now(),
        current_round: 1,
        host_score: 0,
        guest_score: 0,
        current_theme: theme,
        host_card_id: hostCard,
        guest_card_id: guestCard,
        turn_owner: hostEmail,
        game_status: "active"
      });

      const challengeRef = doc(db, "challenges", incomingChallenge.id);
      await updateDoc(challengeRef, {
        status: "accepted",
        sessionId: sessionRef.id
      });

      setIncomingChallenge(null);
      setCurrentGameSessionId(sessionRef.id);
      setPlayerStatus("in_game");
      setActiveTab("population");
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Error initializing session. Falling back to local offline mode.");
      setIncomingChallenge(null);
    }
  };

  const handleDeclineChallenge = async () => {
    if (!incomingChallenge || !db) return;
    try {
      const challengeRef = doc(db, "challenges", incomingChallenge.id);
      await updateDoc(challengeRef, {
        status: "declined"
      });
      setIncomingChallenge(null);
    } catch (error) {
      console.error("Error declining challenge:", error);
      setIncomingChallenge(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/data/${selectedCountry}.json?t=${Date.now()}`)
      .then(res => res.json())
      .then((json: DPPlaceProfile) => {
        const transformed = {
          ...json,
          population_dynamics_time_series: json.population_dynamics_time_series.map(node => ({
            ...node,
            pyramid_structure: {
              ...node.pyramid_structure,
              cohorts: interpolateCohorts(node.pyramid_structure?.cohorts || [], selectedCountry, node.year)
            }
          }))
        };
        setData(transformed);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load country data", err);
        setLoading(false);
      });
  }, [selectedCountry]);

  // Retrieve comparison country details
  useEffect(() => {
    if (!isCompareMode) return;
    setSecondaryLoading(true);
    fetch(`/data/${secondaryCountry}.json?t=${Date.now()}`)
      .then(res => res.json())
      .then((json: DPPlaceProfile) => {
        const transformed = {
          ...json,
          population_dynamics_time_series: json.population_dynamics_time_series.map(node => ({
            ...node,
            pyramid_structure: {
              ...node.pyramid_structure,
              cohorts: interpolateCohorts(node.pyramid_structure?.cohorts || [], secondaryCountry, node.year)
            }
          }))
        };
        setSecondaryData(transformed);
        setSecondaryLoading(false);
      })
      .catch(err => {
        console.error("Failed to load secondary country data", err);
        setSecondaryLoading(false);
      });
  }, [secondaryCountry, isCompareMode]);

  const handlePrimaryChange = (val: string) => {
    setSelectedCountry(val);
    if (isCompareMode && val === secondaryCountry) {
      const nextMatch = availableCountries.find(c => c.id !== val);
      if (nextMatch) setSecondaryCountry(nextMatch.id);
    }
  };

  const handleSecondaryChange = (val: string) => {
    setSecondaryCountry(val);
    if (val === selectedCountry) {
      const nextMatch = availableCountries.find(c => c.id !== val);
      if (nextMatch) setSelectedCountry(nextMatch.id);
    }
  };

  const renderDeltaBadge = (v1: number | undefined, v2: number | undefined, suffix: string = '', isPercent: boolean = false) => {
    if (!isCompareMode || v1 === undefined || v2 === undefined) return null;
    const t1 = typeof v1 === 'number' ? v1 : parseFloat(String(v1));
    const t2 = typeof v2 === 'number' ? v2 : parseFloat(String(v2));
    if (isNaN(t1) || isNaN(t2)) return null;

    const diff = t1 - t2;
    const prefix = diff > 0 ? "+" : "";
    const formattedDiff = isPercent ? diff.toFixed(1) + "%" : (suffix === '‰' || suffix === '%' ? diff.toFixed(1) : diff.toFixed(1));

    return (
      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-200 shrink-0 inline-flex items-center shadow-3xs hover:scale-105 transition-transform" title="Comparative Delta Value">
        Δ {prefix}{formattedDiff}{suffix}
      </span>
    );
  };

  const handleDownloadReport = async () => {
    if (!data || !secondaryData) return;
    setIsExporting(true);
    try {
      await exportDashboardToDocx(data, secondaryData, comparisonNarrative);
    } catch (e) {
      console.error("Word Docx generation failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  const tabs: { id: TabId, label: string, icon: React.ReactNode }[] = [
    { id: 'population', label: 'Pop Dynamics', icon: <Users className="w-4 h-4 mr-2" /> },
    { id: 'economy', label: 'Economy', icon: <TrendingUp className="w-4 h-4 mr-2" /> },
    { id: 'human_geography', label: 'Human Geo', icon: <Link2 className="w-4 h-4 mr-2" /> },
    { id: 'physical_layer', label: 'Physical Geo', icon: <Map className="w-4 h-4 mr-2" /> },
  ];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const activeCountryName = availableCountries.find(c => c.id === selectedCountry)?.name || data.country_metadata.name;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm flex-none transition-colors duration-300">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00b875] rounded-xl flex items-center justify-center shadow-sm text-white shrink-0 select-none">
              <Flag size={20} className="fill-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white leading-none">
                Place Profiles
              </h1>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                CIA World Factbook Reimagined
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Compare Mode Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const nextMode = !isCompareMode;
                setIsCompareMode(nextMode);
                if (nextMode && !secondaryData) {
                  const secondaryChoice = availableCountries.find(c => c.id !== selectedCountry)?.id || 'usa';
                  setSecondaryCountry(secondaryChoice);
                }
              }}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm border flex items-center gap-1.5 shrink-0 ${isCompareMode
                  ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 border-slate-200 dark:border-slate-700'
                }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isCompareMode ? "Compare: ON" : "Compare"}</span>
            </button>

            {/* User Profile Info Badge */}
            <div className="hidden md:flex items-center gap-2.5 py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs shrink-0">
              <div className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-805 dark:text-slate-200 leading-tight">{activeUserEmail || "sknight@nlcsjeju.kr"}</span>
                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-tight leading-none mt-0.5">
                  {role === "student" ? `Student: ${getStudentName(activeUserEmail || "")}` : `Teacher: ${activeTeacherCode || "SKN"}`}
                </span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleDark}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer shrink-0"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Exit Button */}
            {onOpenVault && (
            <button 
              onClick={onOpenVault}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer shrink-0"
              title="Open Vault"
            >
              <Archive size={16} />
            </button>
          )}

          {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer bg-transparent outline-none shadow-sm shrink-0"
              >
                ← Exit App
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 border-t border-slate-100 dark:border-slate-800 overflow-x-auto hide-scrollbar">
          <nav className="flex space-x-1" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-[3px] transition-colors whitespace-nowrap cursor-pointer
                  ${activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 hover:border-slate-300 dark:hover:border-slate-700"}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      {isCompareMode ? (
        <main id="comparison-dashboard-root" className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 relative">

          {/* Comparative Action Header Row */}
          <div className="bg-white dark:bg-slate-900 border border-indigo-150 dark:border-slate-800 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-black px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider w-fit">
                Comparative Case Study Module
              </span>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Evaluating physical indicators, global connections, and demographic variables side-by-side
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadReport}
                disabled={isExporting}
                className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Download className="w-4 h-4" />}
                <span>{isExporting ? "Compiling Word Report..." : "Download Comparison Report"}</span>
              </button>
              <button
                onClick={() => setIsCompareMode(false)}
                className="px-4.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-slate-500" />
                <span>Clear Comparison</span>
              </button>
            </div>
          </div>

          {data && secondaryData && (
            <ComparisonAnalytics
              countryA={data}
              countryB={secondaryData}
              narrative={comparisonNarrative}
              setNarrative={setComparisonNarrative}
            />
          )}

          {/* 50/50 Side-by-Side Analysis Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

            {/* Primary Country Column */}
            <div className="flex flex-col gap-8">
              <div className="bg-white dark:bg-slate-900 border border-indigo-100/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-6">

                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-55 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30">
                    Primary Profile
                  </span>
                  <span className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                    {activeCountryName}
                  </span>
                </div>

                {/* Localized Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Change Primary Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handlePrimaryChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold rounded-xl px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 focus:ring-2 focus:ring-[#00ba70] outline-none cursor-pointer transition-all"
                  >
                    {availableCountries.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Replicated Flag Video Frame */}
                <FlagFlipPlayer
                  countryId={selectedCountry}
                  countryName={activeCountryName}
                  flagCode={flagMapping[selectedCountry] || 'un'}
                />

                {/* Replicated Geographic / Development Indices */}
                <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-5 text-xs font-semibold text-slate-600 dark:text-slate-355">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Development Indicators
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-850 shadow-3xs">
                    <span className="text-slate-400 font-medium">HDI Score:</span>
                    <div className="flex items-center">
                      <span className="text-slate-800 dark:text-slate-200 font-extrabold">{data.country_metadata.hdi.score?.toFixed(3)}</span>
                      {renderDeltaBadge(data.country_metadata.hdi.score, secondaryData?.country_metadata.hdi.score)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-850 shadow-3xs">
                    <span className="text-slate-400 font-medium">HDI Rank:</span>
                    <div className="flex items-center">
                      <span className="text-slate-800 dark:text-slate-200 font-extrabold">#{data.country_metadata.hdi.rank}</span>
                      {renderDeltaBadge(data.country_metadata.hdi.rank, secondaryData?.country_metadata.hdi.rank)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-850 shadow-3xs">
                    <span className="text-slate-400 font-medium">GNI per Capita:</span>
                    <div className="flex items-center">
                      <span className="text-slate-800 dark:text-slate-200 font-extrabold">${data.country_metadata.gni_per_capita_atlas.value_usd.toLocaleString()}</span>
                      {renderDeltaBadge(data.country_metadata.gni_per_capita_atlas.value_usd, secondaryData?.country_metadata.gni_per_capita_atlas.value_usd)}
                    </div>
                  </div>

                  {data.country_metadata.gini_coefficient && (
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-850 shadow-3xs">
                      <span className="text-slate-400 font-medium">Gini Index:</span>
                      <div className="flex items-center">
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold">{data.country_metadata.gini_coefficient.score}</span>
                        {renderDeltaBadge(data.country_metadata.gini_coefficient.score, secondaryData?.country_metadata.gini_coefficient?.score)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Political Setup */}
                {data.human_geography_tab?.political_economy && (
                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5 text-indigo-500" /> Executive & Political Profile
                    </span>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Current Leader</span>
                        <span className="text-xs font-extrabold text-slate-800 leading-tight">
                          {politicalLeadershipMap[selectedCountry]?.leader || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col border-t border-slate-200/50 pt-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Political Party</span>
                        <span className="text-xs font-semibold text-slate-600 leading-tight">
                          {politicalLeadershipMap[selectedCountry]?.party || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Data Tab Content Frame */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                {activeTab === 'economy' && <EconomyTab data={data.economy_tab} countryId={selectedCountry} currentYear={sliderYear} informalEconomyPctGdp={data.human_geography_tab?.political_economy?.informal_economy_pct_gdp || 0} />}
                {activeTab === 'human_geography' && <HumanGeographyTab data={data.human_geography_tab} mapCenter={data.prisoners_of_geography_map.map_center} popData={data.population_dynamics_time_series} currentYear={sliderYear} setSliderYear={setSliderYear} countryName={data.country_metadata.name} countryId={selectedCountry} />}
                {activeTab === 'physical_layer' && <PhysicalLayerTab data={data.prisoners_of_geography_map} countryName={data.country_metadata.name} />}
                {activeTab === 'population' && (
                  <PopulationTab
                    data={data.population_dynamics_time_series}
                    currentYear={sliderYear}
                    setSliderYear={setSliderYear}
                    countryName={data.country_metadata.name}
                    countryId={selectedCountry}
                    highlightHdi={highlightHdi}
                    compareCountryId={secondaryCountry}
                  />
                )}
              </div>
            </div>

            {/* Secondary Country Column */}
            <div className="flex flex-col gap-8 relative">

              {secondaryLoading && (
                <div className="absolute inset-0 bg-slate-50/80 z-20 flex items-start pt-28 justify-center rounded-2xl">
                  <div className="bg-white border border-slate-200 p-4.5 rounded-full shadow-lg flex items-center gap-3 text-indigo-600 font-extrabold text-xs">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Hydrating Secondary Context Data...</span>
                  </div>
                </div>
              )}

              {secondaryData ? (
                <>
                  <div className="bg-white dark:bg-slate-900 border border-orange-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-6">

                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                      <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-900/30">
                        Comparison Profile
                      </span>
                      <span className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                        {availableCountries.find(c => c.id === secondaryCountry)?.name || secondaryData.country_metadata.name}
                      </span>
                    </div>

                    {/* Localized Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Change Secondary Country
                      </label>
                      <select
                        value={secondaryCountry}
                        onChange={(e) => handleSecondaryChange(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold rounded-xl px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 focus:ring-2 focus:ring-orange-400 outline-none cursor-pointer transition-all"
                      >
                        {availableCountries.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Flag visual */}
                    <FlagFlipPlayer
                      countryId={secondaryCountry}
                      countryName={availableCountries.find(c => c.id === secondaryCountry)?.name || secondaryData.country_metadata.name}
                      flagCode={flagMapping[secondaryCountry] || 'un'}
                    />

                    {/* Replicated Geographic / Development Indices */}
                    <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" /> Development Indicators (Deltas)
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-850 shadow-3xs">
                        <span className="text-slate-400 font-medium">HDI Score:</span>
                        <div className="flex items-center">
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold">{secondaryData.country_metadata.hdi.score?.toFixed(3)}</span>
                          {renderDeltaBadge(secondaryData.country_metadata.hdi.score, data.country_metadata.hdi.score)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-850 shadow-3xs">
                        <span className="text-slate-400 font-medium">HDI Rank:</span>
                        <div className="flex items-center">
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold">#{secondaryData.country_metadata.hdi.rank}</span>
                          {renderDeltaBadge(secondaryData.country_metadata.hdi.rank, data.country_metadata.hdi.rank)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-850 shadow-3xs">
                        <span className="text-slate-400 font-medium">GNI per Capita:</span>
                        <div className="flex items-center">
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold">${secondaryData.country_metadata.gni_per_capita_atlas.value_usd.toLocaleString()}</span>
                          {renderDeltaBadge(secondaryData.country_metadata.gni_per_capita_atlas.value_usd, data.country_metadata.gni_per_capita_atlas.value_usd)}
                        </div>
                      </div>

                      {secondaryData.country_metadata.gini_coefficient && (
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-850 shadow-3xs">
                          <span className="text-slate-400 font-medium">Gini Index:</span>
                          <div className="flex items-center">
                            <span className="text-slate-800 dark:text-slate-200 font-extrabold">{secondaryData.country_metadata.gini_coefficient.score}</span>
                            {renderDeltaBadge(secondaryData.country_metadata.gini_coefficient.score, data.country_metadata.gini_coefficient.score)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Political Setup */}
                    {secondaryData.human_geography_tab?.political_economy && (
                      <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Landmark className="w-3.5 h-3.5 text-indigo-500" /> Executive & Political Profile
                        </span>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 space-y-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Current Leader</span>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                              {politicalLeadershipMap[secondaryCountry]?.leader || "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col border-t border-slate-200/50 dark:border-slate-800/50 pt-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Political Party</span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-tight">
                              {politicalLeadershipMap[secondaryCountry]?.party || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    {activeTab === 'economy' && <EconomyTab data={secondaryData.economy_tab} countryId={secondaryCountry} currentYear={sliderYear} informalEconomyPctGdp={secondaryData.human_geography_tab?.political_economy?.informal_economy_pct_gdp || 0} />}
                    {activeTab === 'human_geography' && <HumanGeographyTab data={secondaryData.human_geography_tab} mapCenter={secondaryData.prisoners_of_geography_map.map_center} popData={secondaryData.population_dynamics_time_series} currentYear={sliderYear} setSliderYear={setSliderYear} countryName={secondaryData.country_metadata.name} countryId={secondaryCountry} />}
                    {activeTab === 'physical_layer' && <PhysicalLayerTab data={secondaryData.prisoners_of_geography_map} countryName={secondaryData.country_metadata.name} />}
                    {activeTab === 'population' && (
                      <PopulationTab
                        data={secondaryData.population_dynamics_time_series}
                        currentYear={sliderYear}
                        setSliderYear={setSliderYear}
                        countryName={secondaryData.country_metadata.name}
                        countryId={secondaryCountry}
                        highlightHdi={highlightHdi}
                        compareCountryId={selectedCountry}
                      />
                    )}
                  </div>
                </>
              ) : null}

            </div>

          </div>

        </main>
      ) : (
        <main className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 relative">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Everpresent Controls Side Panel */}
            <aside className="w-full lg:w-[420px] shrink-0 lg:sticky lg:top-[120px] z-30 flex flex-col gap-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:max-h-[85vh] overflow-y-auto scrollbar-thin">

              {/* Country Selector */}
              <div className="flex flex-col gap-1.5">
                <label id="country-select-label" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Country Context</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handlePrimaryChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold rounded-lg px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 focus:ring-2 focus:ring-[#00ba70] focus:border-[#00ba70] outline-none cursor-pointer transition-all"
                >
                  {availableCountries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Flag of selected country with interactive 3D YouTube flip player */}
              <FlagFlipPlayer
                countryId={selectedCountry}
                countryName={activeCountryName}
                flagCode={flagMapping[selectedCountry] || 'un'}
              />

              {/* Places Registry Everpresent Metadata Frame */}
              <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5" />
                    <span>Geographic Indices</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[8px] font-black uppercase tracking-wider ${highlightHdi ? 'text-[#00ba70]' : 'text-slate-400'}`}>Highlight HDI 3D Dimensions</span>
                  </div>
                </div>

                <div className={`flex justify-between items-center px-3 py-2 rounded-lg border transition-all duration-300 ${highlightHdi ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">HDI Score:</span>
                    <button
                      type="button"
                      onClick={() => setHighlightHdi(!highlightHdi)}
                      className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${highlightHdi ? 'bg-[#00ba70]' : 'bg-slate-200'}`}
                      aria-label="Toggle HDI parts highlight"
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${highlightHdi ? 'translate-x-4' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>

                  {/* Score number now on the right */}
                  <span className="text-slate-800 dark:text-slate-200 font-extrabold">{data.country_metadata.hdi.score?.toFixed(3)}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">HDI Rank:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-extrabold">#{data.country_metadata.hdi.rank}</span>
                </div>

                <div className={`flex justify-between items-center px-3 py-2 rounded-lg border transition-all duration-300 ${highlightHdi ? 'bg-emerald-100/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-xs' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'}`}>
                  <span className={`${highlightHdi ? 'text-emerald-700 dark:text-emerald-450 font-bold' : 'text-slate-400'} font-medium`}>GNI per Capita:</span>
                  <span className={`${highlightHdi ? 'text-emerald-900 dark:text-emerald-200 font-black' : 'text-slate-800 dark:text-slate-250'} font-extrabold`}>${data.country_metadata.gni_per_capita_atlas.value_usd.toLocaleString()}</span>
                </div>

                {data.country_metadata.gini_coefficient && (
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-880">
                    <span className="text-slate-400 font-medium">Gini Index:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-extrabold">{data.country_metadata.gini_coefficient.score}</span>
                  </div>
                )}
              </div>

              {/* Political Economy & Governance Matrix Section */}
              {data.human_geography_tab?.political_economy && (
                <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Landmark className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Politics & Governance</span>
                  </div>

                  {/* Leader & Party Area */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-800 space-y-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Current Leader</span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {politicalLeadershipMap[selectedCountry]?.leader || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col border-t border-slate-200/50 dark:border-slate-800/50 pt-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Political Party</span>
                      <span className="text-xs font-semibold text-slate-700/90 dark:text-slate-350 leading-tight">
                        {politicalLeadershipMap[selectedCountry]?.party || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Governance Types */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/30 rounded-lg p-2.5 flex flex-col justify-between min-h-[56px]">
                      <span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-500" /> EIU Govt
                      </span>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight pt-1 truncate" title={data.human_geography_tab.political_economy.eiu_governance_type}>
                        {data.human_geography_tab.political_economy.eiu_governance_type}
                      </p>
                    </div>
                    <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100/60 dark:border-amber-900/30 rounded-lg p-2.5 flex flex-col justify-between min-h-[56px]">
                      <span className="text-[9px] uppercase font-bold text-amber-600 tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Freedom House
                      </span>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight pt-1 truncate" title={data.human_geography_tab.political_economy.freedom_house_status}>
                        {data.human_geography_tab.political_economy.freedom_house_status}
                      </p>
                    </div>
                  </div>

                  {/* Corruption Perceptions Index */}
                  {data.human_geography_tab.political_economy.corruption_perceptions_index && (
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg p-2.5 flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Corruption Index (CPI)</span>
                        <span className="text-[10px] text-slate-400 font-medium">Score: {data.human_geography_tab.political_economy.corruption_perceptions_index.score}/100</span>
                      </div>
                      <span className="font-extrabold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30">
                        Rank #{data.human_geography_tab.political_economy.corruption_perceptions_index.rank}
                      </span>
                    </div>
                  )}
                </div>
              )}

            </aside>

            {/* Sub Pages Scrollable Contents Pane */}
            <div className="flex-1 min-w-0 w-full relative">
              {loading && (
                <div className="absolute inset-0 bg-slate-50/80 z-10 flex items-start mt-20 justify-center">
                  <div className="bg-white p-4 rounded-full shadow-lg border border-slate-200 text-emerald-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                </div>
              )}
              <div className={`transition-opacity duration-300 ${loading ? 'opacity-30' : 'opacity-100'}`}>
                {activeTab === 'economy' && <EconomyTab data={data.economy_tab} countryId={selectedCountry} currentYear={sliderYear} informalEconomyPctGdp={data.human_geography_tab?.political_economy?.informal_economy_pct_gdp || 0} />}
                {activeTab === 'human_geography' && <HumanGeographyTab data={data.human_geography_tab} mapCenter={data.prisoners_of_geography_map.map_center} popData={data.population_dynamics_time_series} currentYear={sliderYear} setSliderYear={setSliderYear} countryName={data.country_metadata.name} countryId={selectedCountry} />}
                {activeTab === 'physical_layer' && <PhysicalLayerTab data={data.prisoners_of_geography_map} countryName={data.country_metadata.name} />}
                {activeTab === 'population' && <PopulationTab data={data.population_dynamics_time_series} currentYear={sliderYear} setSliderYear={setSliderYear} countryName={data.country_metadata.name} countryId={selectedCountry} highlightHdi={highlightHdi} />}
              </div>
            </div>

          </div>
        </main>
      )}

      {/* Global Challenge Invitation Modal */}
      <AnimatePresence>
        {incomingChallenge && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                  <Swords className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-lg text-slate-800 dark:text-white">Duel Challenge Received!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    From: <span className="font-bold text-slate-800 dark:text-slate-200">{incomingChallenge.fromName}</span> ({incomingChallenge.fromEmail})
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-355 leading-relaxed mb-6">
                You have been challenged to a Best of <span className="font-extrabold text-emerald-500">{incomingChallenge.matchFormat}</span> rounds Top Trumps duel! Accept to enter the Play Room arena immediately.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleDeclineChallenge}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptChallenge}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/15 transition-all cursor-pointer"
                >
                  Accept & Enter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
