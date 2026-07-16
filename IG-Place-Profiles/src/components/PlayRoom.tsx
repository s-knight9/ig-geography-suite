import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, 
  Trophy, 
  Swords, 
  User, 
  Bot, 
  Sparkles, 
  Check, 
  X, 
  AlertTriangle, 
  Heart, 
  Info, 
  Users, 
  Award, 
  Zap, 
  RotateCcw, 
  Compass, 
  Coins, 
  TrendingUp, 
  Shield, 
  Baby,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Timer
} from "lucide-react";
import { db, isFirebaseConfigured } from "../firebase";
import { doc, onSnapshot, updateDoc, addDoc, collection } from "firebase/firestore";
import { THEME_DECKS, getCountryStatsForTheme, GameTheme } from "../utils/gameData";
import { getStudentName, getInitials } from "../utils/studentData";

const AVAILABLE_COUNTRIES = [
  { id: "australia", name: "Australia" },
  { id: "bangladesh", name: "Bangladesh" },
  { id: "belgium", name: "Belgium" },
  { id: "brazil", name: "Brazil" },
  { id: "canada", name: "Canada" },
  { id: "chad", name: "Chad" },
  { id: "china", name: "China" },
  { id: "cuba", name: "Cuba" },
  { id: "drc", name: "DRC" },
  { id: "egypt", name: "Egypt" },
  { id: "ethiopia", name: "Ethiopia" },
  { id: "france", name: "France" },
  { id: "germany", name: "Germany" },
  { id: "iceland", name: "Iceland" },
  { id: "india", name: "India" },
  { id: "indonesia", name: "Indonesia" },
  { id: "iran", name: "Iran" },
  { id: "ireland", name: "Ireland" },
  { id: "israel", name: "Israel" },
  { id: "italy", name: "Italy" },
  { id: "japan", name: "Japan" },
  { id: "kenya", name: "Kenya" },
  { id: "malaysia", name: "Malaysia" },
  { id: "mexico", name: "Mexico" },
  { id: "netherlands", name: "Netherlands" },
  { id: "niger", name: "Niger" },
  { id: "nigeria", name: "Nigeria" },
  { id: "peru", name: "Peru" },
  { id: "philippines", name: "Philippines" },
  { id: "poland", name: "Poland" },
  { id: "russia", name: "Russia" },
  { id: "rwanda", name: "Rwanda" },
  { id: "saudi-arabia", name: "Saudi Arabia" },
  { id: "singapore", name: "Singapore" },
  { id: "south-africa", name: "South Africa" },
  { id: "south-korea", name: "South Korea" },
  { id: "sudan", name: "Sudan" },
  { id: "switzerland", name: "Switzerland" },
  { id: "thailand", name: "Thailand" },
  { id: "turkey", name: "Turkey" },
  { id: "tuvalu", name: "Tuvalu" },
  { id: "uae", name: "U.A.E." },
  { id: "uk", name: "United Kingdom" },
  { id: "ukraine", name: "Ukraine" },
  { id: "usa", name: "United States" },
  { id: "vietnam", name: "Vietnam" },
  { id: "venezuela", name: "Venezuela" }
].sort((a, b) => a.name.localeCompare(b.name));

const flagMapping: Record<string, string> = {
  bangladesh: 'bd',
  usa: 'us',
  china: 'cn',
  india: 'in',
  'south-korea': 'kr',
  vietnam: 'vn',
  philippines: 'ph',
  malaysia: 'my',
  russia: 'ru',
  poland: 'pl',
  germany: 'de',
  uk: 'gb',
  switzerland: 'ch',
  australia: 'au',
  brazil: 'br',
  mexico: 'mx',
  drc: 'cd',
  nigeria: 'ng',
  'south-africa': 'za',
  ethiopia: 'et',
  sudan: 'sd',
  chad: 'td',
  niger: 'ne',
  iceland: 'is',
  tuvalu: 'tv',
  peru: 'pe',
  rwanda: 'rw',
  kenya: 'ke',
  thailand: 'th',
  belgium: 'be',
  france: 'fr',
  netherlands: 'nl',
  singapore: 'sg',
  uae: 'ae',
  'saudi-arabia': 'sa',
  turkey: 'tr',
  egypt: 'eg',
  ukraine: 'ua',
  indonesia: 'id',
  iran: 'ir',
  ireland: 'ie',
  italy: 'it',
  cuba: 'cu',
  israel: 'il',
  japan: 'jp',
  canada: 'ca',
  venezuela: 've'
};

const getFlagUrl = (countryId: string) => {
  const code = flagMapping[countryId] || 'un';
  if (countryId === 'tuvalu') return "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/tv.svg";
  return `https://flagcdn.com/w640/${code}.png`;
};

interface OnlinePlayer {
  email: string;
  name: string;
  initials: string;
  role: string;
  status?: string; // "available" or "in_game"
}

interface GameSession {
  id: string;
  host_id: string;
  host_name: string;
  guest_id: string;
  guest_name: string;
  match_format: number; // 3, 5, 10
  game_mode?: "rounds" | "timed";
  time_limit?: number; // in seconds
  game_start_time?: number; // timestamp
  current_round: number;
  host_score: number;
  guest_score: number;
  current_theme: string;
  host_card_id: string;
  guest_card_id: string;
  turn_owner: string;
  game_status: string; // active, reveal:statId, completed
}

interface PlayRoomProps {
  activeUserEmail: string;
  activeTeacherCode?: string;
  role: string;
  onlinePlayers: OnlinePlayer[];
  currentGameSessionId: string | null;
  setCurrentGameSessionId: (id: string | null) => void;
  playerStatus: "available" | "in_game";
  setPlayerStatus: (status: "available" | "in_game") => void;
}

export function PlayRoom({ 
  activeUserEmail, 
  activeTeacherCode, 
  role,
  onlinePlayers,
  currentGameSessionId,
  setCurrentGameSessionId,
  playerStatus,
  setPlayerStatus
}: PlayRoomProps) {
  const myEmail = activeUserEmail || "sknight@nlcsjeju.kr";
  const myName = role === "student" ? getStudentName(myEmail) : myEmail.split("@")[0];
  const myInitials = activeTeacherCode || getInitials(myName);

  // Time format helper
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Mode settings
  const [matchFormat, setMatchFormat] = useState<number>(3); // 3, 5, 10
  const [gameMode, setGameMode] = useState<"rounds" | "timed">("rounds");
  const [timeLimit, setTimeLimit] = useState<number>(180); // in seconds (3 mins default)
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLocal, setIsLocal] = useState<boolean>(!isFirebaseConfigured);

  // Invites state
  const [challengingPlayer, setChallengingPlayer] = useState<OnlinePlayer | null>(null);

  // Active game session
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [hostStats, setHostStats] = useState<Record<string, number> | null>(null);
  const [guestStats, setGuestStats] = useState<Record<string, number> | null>(null);
  const [loadingCards, setLoadingCards] = useState<boolean>(false);
  const [localGameHistory, setLocalGameHistory] = useState<string[]>([]);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const gameChannelRef = useRef<any>(null);

  // Draw random helper
  const drawRandomCountry = (exclude?: string): string => {
    const list = exclude ? AVAILABLE_COUNTRIES.filter(c => c.id !== exclude) : AVAILABLE_COUNTRIES;
    return list[Math.floor(Math.random() * list.length)].id;
  };

  // Get random theme deck
  const getRandomTheme = (): string => {
    const keys = Object.keys(THEME_DECKS);
    return keys[Math.floor(Math.random() * keys.length)];
  };

  // Subscribe to the game session when initialized
  useEffect(() => {
    if (isLocal || !currentGameSessionId || !db) return;

    const sessionDocRef = doc(db, "game_sessions", currentGameSessionId);
    
    const unsubscribeSession = onSnapshot(sessionDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setActiveSession({
          id: docSnapshot.id,
          ...data
        } as GameSession);
      } else {
        console.error("Session lookup error: Document does not exist");
      }
    }, (error) => {
      console.error("Session lookup error:", error);
    });

    return () => {
      unsubscribeSession();
    };
  }, [currentGameSessionId, isLocal]);

  // Load stats when cards change in active session
  useEffect(() => {
    if (!activeSession) return;

    const loadStats = async () => {
      setLoadingCards(true);
      try {
        const hStats = await getCountryStatsForTheme(activeSession.host_card_id, activeSession.current_theme);
        const gStats = await getCountryStatsForTheme(activeSession.guest_card_id, activeSession.current_theme);
        setHostStats(hStats);
        setGuestStats(gStats);
      } catch (err) {
        console.error("Error loading card stats:", err);
      } finally {
        setLoadingCards(false);
      }
    };

    loadStats();

    // Reset flip animation
    if (activeSession.game_status.startsWith("reveal:")) {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [activeSession?.host_card_id, activeSession?.guest_card_id, activeSession?.current_theme, activeSession?.game_status]);

  // AI Opponent Decision Engine
  useEffect(() => {
    if (!activeSession || activeSession.game_status !== "active") return;
    
    // Check if it's the computer's turn to choose
    const isGuestTurn = activeSession.turn_owner === activeSession.guest_id;
    const isGuestAI = activeSession.guest_id.includes("ai") || activeSession.guest_id.includes("computer") || activeSession.guest_id.includes("kr");

    if (isGuestTurn && isGuestAI) {
      // Delay AI turn slightly for realism
      const timer = setTimeout(() => {
        makeAIPick();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeSession?.game_status, activeSession?.turn_owner, guestStats]);

  // Handle Time Up
  const handleTimeUp = async () => {
    if (!activeSession) return;
    
    if (isLocal) {
      setActiveSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          game_status: "completed"
        };
      });
      const winnerName = activeSession.host_score === activeSession.guest_score
        ? "Draw"
        : activeSession.host_score > activeSession.guest_score
          ? activeSession.host_name
          : activeSession.guest_name;
      setLocalGameHistory(prev => [
        `Time's Up! Match Over! Winner: ${winnerName}. Final score: ${activeSession.host_score} - ${activeSession.guest_score}.`,
        ...prev
      ]);
    } else {
      if (myRole === "host") {
        try {
          const docRef = doc(db!, "game_sessions", activeSession.id);
          await updateDoc(docRef, {
            game_status: "completed"
          });
        } catch (error) {
          console.error("Error setting game to completed on time up:", error);
        }
      }
    }
  };

  // Timer useEffect hook
  useEffect(() => {
    if (!activeSession || activeSession.game_status === "completed") {
      setTimeLeft(null);
      return;
    }

    const mode = activeSession.game_mode || "rounds";
    if (mode !== "timed") {
      setTimeLeft(null);
      return;
    }

    const startTime = activeSession.game_start_time || Date.now();
    const limit = activeSession.time_limit || 180;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, limit - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(intervalId);
        handleTimeUp();
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [
    activeSession?.game_status, 
    activeSession?.game_mode, 
    activeSession?.game_start_time, 
    activeSession?.time_limit,
    activeSession?.host_score,
    activeSession?.guest_score
  ]);

  // Play vs. Local / AI Setup
  const startLocalGame = (opponent: OnlinePlayer) => {
    setIsLocal(true);
    const isAI = opponent.email.includes("kr") || opponent.email.includes("ai");
    const session: GameSession = {
      id: "local_session_" + Date.now(),
      host_id: myEmail,
      host_name: myName,
      guest_id: isAI ? "computer_ai" : opponent.email,
      guest_name: opponent.name,
      match_format: matchFormat,
      game_mode: gameMode,
      time_limit: timeLimit,
      game_start_time: Date.now(),
      current_round: 1,
      host_score: 0,
      guest_score: 0,
      current_theme: getRandomTheme(),
      host_card_id: drawRandomCountry(),
      guest_card_id: drawRandomCountry(),
      turn_owner: myEmail, // User goes first
      game_status: "active"
    };

    setActiveSession(session);
    setPlayerStatus("in_game");
    setLocalGameHistory([`Game started against ${opponent.name}. Round 1 Theme: ${THEME_DECKS[session.current_theme].name}.`]);
  };

  // Play vs. Live Online Setup (Send Firestore Challenge)
  const sendOnlineChallenge = async (player: OnlinePlayer) => {
    if (!db) return;
    setChallengingPlayer(player);

    try {
      const challengeRef = await addDoc(collection(db, "challenges"), {
        fromEmail: myEmail,
        fromName: myName,
        fromInitials: myInitials,
        toEmail: player.email,
        matchFormat: matchFormat,
        gameMode: gameMode,
        timeLimit: timeLimit,
        status: "pending",
        createdAt: Date.now()
      });

      const unsubscribe = onSnapshot(challengeRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.status === "accepted") {
            setCurrentGameSessionId(data.sessionId);
            setPlayerStatus("in_game");
            unsubscribe();
          } else if (data.status === "declined") {
            alert(`${player.name} declined your challenge.`);
            setChallengingPlayer(null);
            unsubscribe();
          }
        }
      });

      setTimeout(() => {
        setChallengingPlayer(null);
        unsubscribe();
      }, 15000);
    } catch (err) {
      console.error("Error sending challenge:", err);
      setChallengingPlayer(null);
    }
  };

  // Stat picking logic
  const handleStatSelect = async (statId: string) => {
    if (!activeSession) return;
    
    const isMyTurn = activeSession.turn_owner === myEmail;
    if (!isMyTurn) return;

    if (isLocal) {
      // Local State Update
      const updatedSession = { ...activeSession };
      updatedSession.game_status = `reveal:${statId}`;
      
      // Calculate winner
      const resultMsg = compareStatsAndLog(statId, updatedSession);
      setActiveSession(updatedSession);
      setLocalGameHistory(prev => [resultMsg, ...prev]);
    } else {
      // Firestore State Update
      try {
        const docRef = doc(db!, "game_sessions", activeSession.id);
        await updateDoc(docRef, {
          game_status: `reveal:${statId}`
        });
      } catch (error) {
        console.error("DB Stat select error:", error);
      }
    }
  };

  // Optimal Computer Stat Picking Algorithm
  const makeAIPick = () => {
    if (!activeSession || !guestStats) return;

    const themeId = activeSession.current_theme;
    const theme = THEME_DECKS[themeId];
    let bestStat = theme.stats[0].id;
    let highestScore = -Infinity;

    theme.stats.forEach(s => {
      const val = guestStats[s.id] || 0;
      let score = 0;
      
      // Calibrate score strength based on general ranges
      if (s.id === 'birthRate') score = val / 50;
      else if (s.id === 'lifeExpectancy') score = (val - 40) / 48;
      else if (s.id === 'urbanization') score = val / 100;
      else if (s.id === 'dependencyRatio') score = (100 - val) / 85;
      else if (s.id === 'gniPerCapita') score = Math.log(val) / Math.log(120000);
      else if (s.id === 'tradeBalance') score = (val + 30) / 60;
      else if (s.id === 'giniCoefficient') score = (80 - val) / 60;
      else if (s.id === 'tertiarySector') score = val / 100;
      else if (s.id === 'naturalDisasterVulnerability') score = (10 - val) / 10;
      else if (s.id === 'climateRiskVulnerability') score = (10 - val) / 10;
      else if (s.id === 'institutionalResilience') score = val / 10;

      if (s.better === 'lower') {
        score = 1 - score;
      }

      if (score > highestScore) {
        highestScore = score;
        bestStat = s.id;
      }
    });

    // 80% optimal pick, 20% random pick to simulate human variance
    const finalStat = Math.random() > 0.2 ? bestStat : theme.stats[Math.floor(Math.random() * theme.stats.length)].id;

    if (isLocal) {
      const updatedSession = { ...activeSession };
      updatedSession.game_status = `reveal:${finalStat}`;
      
      const resultMsg = compareStatsAndLog(finalStat, updatedSession);
      setActiveSession(updatedSession);
      setLocalGameHistory(prev => [resultMsg, ...prev]);
    } else {
      const docRef = doc(db!, "game_sessions", activeSession.id);
      updateDoc(docRef, {
        game_status: `reveal:${finalStat}`
      }).catch((error) => {
        console.error("DB AI pick error:", error);
      });
    }
  };

  const compareStatsAndLog = (statId: string, sessionObj: GameSession): string => {
    if (!hostStats || !guestStats) return "";
    
    const themeId = sessionObj.current_theme;
    const theme = THEME_DECKS[themeId];
    const statDef = theme.stats.find(s => s.id === statId);
    if (!statDef) return "";

    const hVal = hostStats[statId] || 0;
    const gVal = guestStats[statId] || 0;

    let hostWon = false;
    let tie = false;

    if (hVal === gVal) {
      tie = true;
    } else if (statDef.better === "higher") {
      hostWon = hVal > gVal;
    } else {
      hostWon = hVal < gVal;
    }

    const hostCountryName = AVAILABLE_COUNTRIES.find(c => c.id === sessionObj.host_card_id)?.name || "Host Country";
    const guestCountryName = AVAILABLE_COUNTRIES.find(c => c.id === sessionObj.guest_card_id)?.name || "Guest Country";

    let msg = "";
    if (tie) {
      msg = `Round ${sessionObj.current_round} Tie on ${statDef.name} (${hVal} vs ${gVal}).`;
    } else if (hostWon) {
      sessionObj.host_score += 1;
      sessionObj.turn_owner = sessionObj.host_id; // Winner retains turn
      msg = `Host won Round ${sessionObj.current_round} choosing ${statDef.name}: ${hostCountryName} (${hVal}) beat ${guestCountryName} (${gVal}).`;
    } else {
      sessionObj.guest_score += 1;
      sessionObj.turn_owner = sessionObj.guest_id; // Winner gets turn
      msg = `Guest won Round ${sessionObj.current_round} choosing ${statDef.name}: ${guestCountryName} (${gVal}) beat ${hostCountryName} (${hVal}).`;
    }

    return msg;
  };

  // Next Round Trigger
  const handleNextRound = async () => {
    if (!activeSession) return;

    const isTimed = activeSession.game_mode === "timed";
    let isOver = false;
    if (isTimed) {
      const startTime = activeSession.game_start_time || Date.now();
      const limitTime = activeSession.time_limit || 180;
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      isOver = elapsed >= limitTime;
    } else {
      const limit = Math.ceil(activeSession.match_format / 2);
      const hostWin = activeSession.host_score >= limit;
      const guestWin = activeSession.guest_score >= limit;
      isOver = hostWin || guestWin || activeSession.current_round >= activeSession.match_format;
    }

    const nextRoundNum = activeSession.current_round + 1;
    const nextTheme = getRandomTheme();
    const nextHostCard = drawRandomCountry();
    const nextGuestCard = drawRandomCountry(nextHostCard);
    
    const nextStatus = isOver ? "completed" : "active";

    if (isLocal) {
      const updated = {
        ...activeSession,
        current_round: nextRoundNum,
        host_card_id: nextHostCard,
        guest_card_id: nextGuestCard,
        current_theme: nextTheme,
        game_status: nextStatus
      };
      setActiveSession(updated);
      if (nextStatus === "active") {
        setLocalGameHistory(prev => [
          `Round ${nextRoundNum} started. Theme: ${THEME_DECKS[nextTheme].name}. Turn Owner: ${updated.turn_owner === myEmail ? "You" : updated.guest_name}.`,
          ...prev
        ]);
      } else {
        const winnerName = updated.host_score === updated.guest_score
          ? "Draw"
          : updated.host_score > updated.guest_score ? updated.host_name : updated.guest_name;
        setLocalGameHistory(prev => [`Match Over! Winner: ${winnerName}. Final score: ${updated.host_score} - ${updated.guest_score}.`, ...prev]);
      }
    } else {
      // Calculate scores on server trigger (winner comparison)
      const parts = activeSession.game_status.split(":");
      const statId = parts[1];
      
      let finalHostScore = activeSession.host_score;
      let finalGuestScore = activeSession.guest_score;
      let nextTurnOwner = activeSession.turn_owner;

      if (hostStats && guestStats && statId) {
        const theme = THEME_DECKS[activeSession.current_theme];
        const statDef = theme.stats.find(s => s.id === statId);
        if (statDef) {
          const hVal = hostStats[statId] || 0;
          const gVal = guestStats[statId] || 0;
          if (hVal !== gVal) {
            const hostWon = statDef.better === "higher" ? hVal > gVal : hVal < gVal;
            if (hostWon) {
              finalHostScore += 1;
              nextTurnOwner = activeSession.host_id;
            } else {
              finalGuestScore += 1;
              nextTurnOwner = activeSession.guest_id;
            }
          }
        }
      }

      let finalIsOver = false;
      if (isTimed) {
        const startTime = activeSession.game_start_time || Date.now();
        const limitTime = activeSession.time_limit || 180;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        finalIsOver = elapsed >= limitTime;
      } else {
        const limit = Math.ceil(activeSession.match_format / 2);
        finalIsOver = finalHostScore >= limit || finalGuestScore >= limit || activeSession.current_round >= activeSession.match_format;
      }

      try {
        const docRef = doc(db!, "game_sessions", activeSession.id);
        await updateDoc(docRef, {
          current_round: nextRoundNum,
          host_score: finalHostScore,
          guest_score: finalGuestScore,
          host_card_id: nextHostCard,
          guest_card_id: nextGuestCard,
          current_theme: nextTheme,
          turn_owner: nextTurnOwner,
          game_status: finalIsOver ? "completed" : "active"
        });
      } catch (error) {
        console.error("DB next round error:", error);
      }
    }
  };

  const handleExitGame = () => {
    setActiveSession(null);
    setHostStats(null);
    setGuestStats(null);
    setCurrentGameSessionId(null);
    setPlayerStatus("available");
    setIsLocal(!isFirebaseConfigured);
  };

  const handlePlayAgain = async () => {
    if (!activeSession) return;

    const nextTheme = getRandomTheme();
    const nextHostCard = drawRandomCountry();
    const nextGuestCard = drawRandomCountry(nextHostCard);
    
    const currentMode = activeSession.game_mode || "rounds";
    const currentTimeLimit = activeSession.time_limit || 180;

    if (isLocal) {
      const resetSession: GameSession = {
        ...activeSession,
        current_round: 1,
        host_score: 0,
        guest_score: 0,
        current_theme: nextTheme,
        host_card_id: nextHostCard,
        guest_card_id: nextGuestCard,
        turn_owner: activeSession.host_id,
        game_status: "active",
        game_mode: currentMode,
        time_limit: currentTimeLimit,
        game_start_time: Date.now()
      };
      setActiveSession(resetSession);
      setLocalGameHistory(prev => [
        `--- NEW MATCH STARTED ---`,
        `Game started. Round 1 Theme: ${THEME_DECKS[nextTheme].name}.`,
        ...prev
      ]);
    } else {
      try {
        const docRef = doc(db!, "game_sessions", activeSession.id);
        await updateDoc(docRef, {
          current_round: 1,
          host_score: 0,
          guest_score: 0,
          current_theme: nextTheme,
          host_card_id: nextHostCard,
          guest_card_id: nextGuestCard,
          turn_owner: activeSession.host_id,
          game_status: "active",
          game_mode: currentMode,
          time_limit: currentTimeLimit,
          game_start_time: Date.now()
        });
      } catch (error) {
        console.error("DB play again error:", error);
      }
    }
  };

  // Rendering Helpers
  const statusInfo = useMemo(() => {
    if (!activeSession) return { status: "lobby", stat: null };
    if (activeSession.game_status.startsWith("reveal:")) {
      return { status: "reveal", stat: activeSession.game_status.split(":")[1] };
    }
    return { status: activeSession.game_status, stat: null };
  }, [activeSession?.game_status]);

  const activeTheme = useMemo(() => {
    if (!activeSession) return null;
    return THEME_DECKS[activeSession.current_theme];
  }, [activeSession?.current_theme]);

  const myRole = useMemo(() => {
    if (!activeSession) return "spectator";
    if (activeSession.host_id === myEmail) return "host";
    if (activeSession.guest_id === myEmail) return "guest";
    return "spectator";
  }, [activeSession, myEmail]);

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* DB Connection Alert Header */}
      {!isFirebaseConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <span className="font-extrabold uppercase text-[10px] tracking-wider block">Firebase Config Offline Fallback</span>
            No active environment variables detected. The Play Room has gracefully transitioned into local sandbox mode. Play against virtual teachers or study profile decks offline.
          </div>
        </div>
      )}

      {activeSession ? (
        // ------------------ GAME ARNEA VIEW ------------------
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          
          {/* Game Status Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  {activeSession.game_mode === "timed" 
                    ? `Round ${activeSession.current_round}` 
                    : `Round ${activeSession.current_round} of ${activeSession.match_format}`
                  }
                </span>
                <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  Theme: <span className="text-emerald-500">{activeTheme?.name}</span>
                </h2>
              </div>
              
              {activeSession.game_mode === "timed" && timeLeft !== null && (
                <div className={`ml-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                  timeLeft < 30 
                    ? "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse" 
                    : "bg-amber-500/10 text-amber-500 border border-amber-500/20 dark:bg-amber-500/5"
                }`}>
                  <Timer className="w-3.5 h-3.5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>

            {/* Scoreboard */}
            <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-5 py-2.5 rounded-xl">
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">You</span>
                <span className="text-xl font-black text-slate-800 dark:text-white">{myRole === "host" ? activeSession.host_score : activeSession.guest_score}</span>
              </div>
              <div className="text-slate-300 dark:text-slate-700 font-bold text-xl">vs</div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">{myRole === "host" ? activeSession.guest_name : activeSession.host_name}</span>
                <span className="text-xl font-black text-slate-800 dark:text-white">{myRole === "host" ? activeSession.guest_score : activeSession.host_score}</span>
              </div>
            </div>

            {/* Status Button Actions */}
            <div className="flex items-center gap-2">
              {statusInfo.status === "reveal" && (
                <button
                  onClick={handleNextRound}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleExitGame}
                className="px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Forfeit Match
              </button>
            </div>
          </div>

          {/* Turn Prompt Message */}
          <div className="text-center py-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            {statusInfo.status === "active" ? (
              activeSession.turn_owner === myEmail ? (
                <span className="text-xs font-black text-[#00ba70] uppercase tracking-wider animate-pulse flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Your Turn! Select a statistical indicator from your card to compare.
                </span>
              ) : (
                <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider animate-pulse flex items-center justify-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 animate-bounce" />
                  Opponent's Turn... waiting for them to pick an indicator.
                </span>
              )
            ) : statusInfo.status === "reveal" ? (
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Comparing indicator values. Click "Continue" to advance the round.
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-500">Match Completed</span>
            )}
          </div>

          {statusInfo.status === "completed" ? (
            // Completed Match screen
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full my-12 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center animate-bounce">
                <Trophy className="w-10 h-10 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Match Completed!</h3>
                <p className="text-sm text-slate-500 mt-2 font-bold uppercase tracking-wider">Final Score: {activeSession.host_score} - {activeSession.guest_score}</p>
              </div>
              <div className="text-lg font-black text-emerald-500 uppercase tracking-widest">
                {activeSession.host_score === activeSession.guest_score ? (
                  "It's a Draw!"
                ) : (activeSession.host_score > activeSession.guest_score ? activeSession.host_name : activeSession.guest_name) === myName ? (
                  "🎉 Victory!"
                ) : (
                  "Defeat..."
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                <button
                  onClick={handlePlayAgain}
                  className="flex-1 py-3 bg-[#00ba70] hover:bg-[#00a362] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={handleExitGame}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-98"
                >
                  Exit to Lobby
                </button>
              </div>
            </div>
          ) : (
            // Card Comparison Deck Grid
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full items-start">
              
              {/* Player 1 Card (User Card) */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Your Active Profile</span>
                <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl p-5 shadow-xl hover:shadow-emerald-500/5 transition-all">
                  {loadingCards || !hostStats ? (
                    <div className="aspect-[3/2] w-full flex flex-col items-center justify-center gap-3">
                      <Compass className="w-8 h-8 animate-spin text-emerald-500" />
                      <span className="text-xs font-semibold text-slate-400">Drawing country context...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                        <div>
                          <h3 className="text-lg font-black text-slate-800 dark:text-white">
                            {AVAILABLE_COUNTRIES.find(c => c.id === (myRole === "host" ? activeSession.host_card_id : activeSession.guest_card_id))?.name}
                          </h3>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">IB Place Context Card</span>
                        </div>
                        <div className="w-9 h-6 rounded overflow-hidden shadow-xs border border-slate-200">
                          <img 
                            src={getFlagUrl(myRole === "host" ? activeSession.host_card_id : activeSession.guest_card_id)} 
                            alt="Flag" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        {activeTheme?.stats.map((s) => {
                          const myVal = myRole === "host" ? hostStats[s.id] : guestStats[s.id];
                          const oppVal = myRole === "host" ? guestStats[s.id] : hostStats[s.id];
                          
                          const isSelected = statusInfo.stat === s.id;
                          let outcomeClass = "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20";
                          let badge = null;

                          if (statusInfo.status === "reveal" && isSelected) {
                            if (myVal === oppVal) {
                              outcomeClass = "border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400";
                              badge = <span className="text-[8px] font-black uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded">TIE</span>;
                            } else {
                              const isWin = s.better === "higher" ? myVal > oppVal : myVal < oppVal;
                              outcomeClass = isWin 
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                              badge = isWin 
                                ? <span className="text-[8px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5"><Check size={8} /> WIN</span>
                                : <span className="text-[8px] font-black uppercase bg-red-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5"><X size={8} /> LOSS</span>;
                            }
                          }

                          const clickable = activeSession.turn_owner === myEmail && statusInfo.status === "active";

                          return (
                            <div 
                              key={s.id}
                              onClick={() => clickable && handleStatSelect(s.id)}
                              className={`p-3 border rounded-xl flex items-center justify-between gap-4 transition-all duration-300 ${outcomeClass} ${
                                clickable 
                                  ? "cursor-pointer hover:border-[#00ba70] hover:bg-emerald-50/20 active:scale-98" 
                                  : ""
                              }`}
                            >
                              <span className="text-xs font-bold">{s.name}</span>
                              <div className="flex items-center gap-2">
                                {badge}
                                <span className="font-extrabold text-sm">{myVal !== undefined ? `${myVal}${s.suffix}` : "N/A"}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Player 2 Card (Opponent Card with 3D Flip) */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Opponent Card</span>
                
                {/* Perspective Container */}
                <div className="w-full relative" style={{ perspective: "1000px" }}>
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="w-full relative"
                  >
                    
                    {/* FACE 1: BACK OF CARD (Hidden initially) */}
                    <div
                      style={{ 
                        backfaceVisibility: "hidden",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%"
                      }}
                      className={`bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col items-center justify-center min-h-[320px] ${
                        isFlipped ? "pointer-events-none" : "pointer-events-auto"
                      }`}
                    >
                      <Compass className="w-16 h-16 text-slate-700 animate-spin-slow mb-4" style={{ animationDuration: "10s" }} />
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">DP Place Profiles</h4>
                      <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-wider">Opponent Deck Card</p>
                    </div>

                    {/* FACE 2: FRONT OF CARD (Flipped) */}
                    <div
                      style={{ 
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        width: "100%"
                      }}
                      className={`bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl p-5 shadow-xl min-h-[320px] ${
                        isFlipped ? "pointer-events-auto" : "pointer-events-none"
                      }`}
                    >
                      {loadingCards || !guestStats ? (
                        <div className="w-full flex items-center justify-center h-[280px]">
                          <Compass className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                            <div>
                              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                {AVAILABLE_COUNTRIES.find(c => c.id === (myRole === "host" ? activeSession.guest_card_id : activeSession.host_card_id))?.name}
                              </h3>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">IB Place Context Card</span>
                            </div>
                            <div className="w-9 h-6 rounded overflow-hidden shadow-xs border border-slate-200">
                              <img 
                                src={getFlagUrl(myRole === "host" ? activeSession.guest_card_id : activeSession.host_card_id)} 
                                alt="Flag" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          <div className="space-y-3.5">
                            {activeTheme?.stats.map((s) => {
                              const oppVal = myRole === "host" ? guestStats[s.id] : hostStats[s.id];
                              const myVal = myRole === "host" ? hostStats[s.id] : guestStats[s.id];

                              const isSelected = statusInfo.stat === s.id;
                              let outcomeClass = "border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10";
                              let badge = null;

                              if (statusInfo.status === "reveal" && isSelected) {
                                if (oppVal === myVal) {
                                  outcomeClass = "border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400";
                                  badge = <span className="text-[8px] font-black uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded">TIE</span>;
                                } else {
                                  const isWin = s.better === "higher" ? oppVal > myVal : oppVal < myVal;
                                  outcomeClass = isWin 
                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                    : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                                  badge = isWin 
                                    ? <span className="text-[8px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5"><Check size={8} /> WIN</span>
                                    : <span className="text-[8px] font-black uppercase bg-red-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5"><X size={8} /> LOSS</span>;
                                }
                              }

                              return (
                                <div 
                                  key={s.id}
                                  className={`p-3 border rounded-xl flex items-center justify-between gap-4 transition-all duration-300 ${outcomeClass}`}
                                >
                                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{s.name}</span>
                                  <div className="flex items-center gap-2">
                                    {badge}
                                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                                      {oppVal !== undefined ? `${oppVal}${s.suffix}` : "N/A"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                  </motion.div>
                </div>
              </div>

            </div>
          )}

          {/* Local Arena Session logs */}
          {localGameHistory.length > 0 && (
            <div className="max-w-2xl mx-auto w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">Live Match Ledger</span>
              <div className="max-h-24 overflow-y-auto space-y-1.5 text-[11px] font-mono scrollbar-thin">
                {localGameHistory.map((h, i) => (
                  <p key={i} className="text-slate-600 dark:text-slate-400 leading-normal flex items-start gap-1.5">
                    <span className="text-[#00ba70] font-black">&gt;</span>
                    {h}
                  </p>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        // ------------------ GAME LOBBY VIEW ------------------
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          
          {/* Left Panel: Configuration */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">The Play Room</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Top Trumps Stat Engine</p>
                </div>
              </div>

              {/* Game Mode Configuration */}
              <div className="space-y-5">
                {/* Game Mode Tab Selector */}
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2.5">Select Game Mode</label>
                  <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setGameMode("rounds")}
                      className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        gameMode === "rounds"
                          ? "bg-white dark:bg-slate-900 text-emerald-500 shadow-sm border border-slate-100 dark:border-slate-800"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Rounds Battle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGameMode("timed")}
                      className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        gameMode === "timed"
                          ? "bg-white dark:bg-slate-900 text-emerald-500 shadow-sm border border-slate-100 dark:border-slate-800"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      <Timer className="w-4 h-4" />
                      <span>Timed Blitz</span>
                    </button>
                  </div>
                </div>

                {/* Configuration details based on mode */}
                <AnimatePresence mode="wait">
                  {gameMode === "rounds" ? (
                    <motion.div
                      key="rounds"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3"
                    >
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Configure Match Length</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[3, 5, 10].map(rounds => (
                          <button
                            key={rounds}
                            type="button"
                            onClick={() => setMatchFormat(rounds)}
                            className={`py-3.5 border rounded-2xl text-xs font-black uppercase transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              matchFormat === rounds 
                                ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" 
                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <Trophy className="w-4 h-4" />
                            <span>Best of {rounds}</span>
                            <span className="text-[9px] text-slate-400 normal-case font-bold">{Math.ceil(rounds / 2)} wins to clinch</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="timed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Match Duration</label>
                          <span className="text-xs font-black text-emerald-500 font-mono tracking-wider">{timeLimit / 60}m 00s</span>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 justify-center">
                          <button
                            type="button"
                            onClick={() => setTimeLimit(prev => Math.max(60, prev - 60))}
                            disabled={timeLimit <= 60}
                            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold flex items-center justify-center cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          
                          <div className="text-center min-w-[120px]">
                            <span className="text-2xl font-black text-slate-800 dark:text-white font-mono tracking-widest">
                              {timeLimit / 60 < 10 ? '0' : ''}{timeLimit / 60}:00
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold block uppercase tracking-wide mt-1">Unlimited rounds blitz</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setTimeLimit(prev => Math.min(600, prev + 60))}
                            disabled={timeLimit >= 600}
                            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold flex items-center justify-center cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Local sandbox launch options */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Solo Training Mode</span>
                  <button
                    onClick={() => startLocalGame({ email: "computer_ai", name: "Dr. Earth AI", initials: "AI", role: "teacher" })}
                    className="w-full bg-[#00ba70] hover:bg-[#00a362] text-white p-4 rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bot className="w-5 h-5" />
                    <span>Duel Against Dr. Earth AI (Solo Offline)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Rules */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Academic Game Rules</span>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed list-disc list-inside">
                <li>Choose stat category that your drawn country excels at.</li>
                <li>Indicators depend on the current theme drawn randomly for the round: Demographic, Economic, or Risk.</li>
                <li>Some stats score better <span className="font-extrabold text-[#00ba70]">HIGHER</span> (e.g. Life Expectancy), while others score better <span className="font-extrabold text-[#00ba70]">LOWER</span> (e.g. Dependency Ratio).</li>
                <li>The winner of the round scores a point and holds turn advantage to select the next stat.</li>
              </ul>
            </div>
          </div>

          {/* Right Panel: Online Lobby */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Active Lobby Players</h3>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Live Online presence list</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase">Live</span>
                </div>
              </div>

              {/* Player list */}
              <div className="space-y-3.5">
                {!isFirebaseConfigured ? (
                  <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
                    <Users className="w-8 h-8 text-slate-350 dark:text-slate-650 animate-pulse" />
                    <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold">Lobby Offline</p>
                    <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                      A platform database connection is required to see other active players.
                    </p>
                  </div>
                ) : onlinePlayers.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
                    <Users className="w-8 h-8 text-slate-300 animate-pulse" />
                    <p className="text-xs text-slate-400 font-semibold">Lobby is currently empty.</p>
                    <p className="text-[10px] text-slate-400 max-w-xs leading-normal">Invite another teacher or student to open the Place Profiles Play Room on their device to duel!</p>
                  </div>
                ) : (
                  onlinePlayers.map((player) => {
                    const isInGame = player.status === "in_game";
                    return (
                      <div key={player.email} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-3xs ${
                            isInGame ? "bg-slate-100 text-slate-550 dark:bg-slate-850 dark:text-slate-400" : "bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20"
                          }`}>
                            {player.initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-800 dark:text-white block">{player.name}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase border ${
                                isInGame 
                                  ? "bg-slate-105 text-slate-500 border-slate-205 dark:bg-slate-805 dark:text-slate-400 dark:border-slate-705" 
                                  : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                              }`}>
                                {isInGame ? "In Game" : "Available"}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{player.email}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => !isInGame && sendOnlineChallenge(player)}
                          disabled={challengingPlayer !== null || isInGame}
                          className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-1 cursor-pointer ${
                            isInGame 
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-650 dark:border-slate-750" 
                              : "bg-[#00ba70] hover:bg-[#00a362] text-white"
                          }`}
                        >
                          <Swords className="w-3 h-3" />
                          <span>{challengingPlayer?.email === player.email ? "Invited..." : isInGame ? "Busy" : "Challenge"}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
