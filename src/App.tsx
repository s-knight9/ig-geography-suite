import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  Unlock,
  LogOut,
  Mail,
  Moon,
  Sun,
  User as UserIcon,
  ChevronRight,
  ShieldCheck,
  BarChart2,
  Globe,
  Layout,
  Sparkles,
  Settings,
  AlertTriangle,
  Users,
  Check,
  X,
  ShieldAlert,
  Tv,
  Frame,
  Map
} from "lucide-react";

// Import sub-apps dynamically
import NewsroomApp from "../The-IG-News-Room/src/App";
import CorrespondentApp from "../IG Correspondent/src/App";
import StudentScaffoldApp from "../IG-Student-Scaffold/src/App";
import GlobeTubeApp from "../IG-GlobeTube/src/App";
import GeoTextbookViewerApp from "../IG-Geo-Textbook-Viewer/src/App";
import CwkQaApp from "../IG-CWK-Quality-Assurance/src/App";
import MapMakerApp from "../IG-OS-Map-Maker/src/App";
import HighFiveApp from "../IGCSE-0460-High-5/src/App";
import DseDesignerApp from "../DSE-Designer/src/App";

interface LocalUser {
  email: string;
  uid: string;
}

const TEACHER_EMAILS: Record<string, string> = {
  SKN: "sknight@nlcsjeju.kr",
  SMK: "smckeogh@nlcsjeju.kr",
  JBO: "jbooth@nlcsjeju.kr",
  LLE: "llee@nlcsjeju.kr",
  SSH: "sshin@nlcsjeju.kr",
  CMA: "cmay@nlcsjeju.kr",
  MDJ: "mdyerjones@nlcsjeju.kr",
  JTE: "jtorrance@nlcsjeju.kr",
  CHE: "cheydinger@nlcsjeju.kr"
};
const TEACHER_INITIALS = new Set(Object.keys(TEACHER_EMAILS));
const MASTER_ADMIN = "y2knighty@gmail.com";
const TEACHER_PASSWORD = "strikeslip";

const STUDENT_CREDENTIALS: Record<string, string> = {};

export default function App() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [teacherCode, setTeacherCode] = useState<string>("");
  const [role, setRole] = useState<"super_admin" | "teacher" | "student">("student");
  const [status, setStatus] = useState<"pending" | "approved" | "declined">("approved");
  const [studentSessionActive, setStudentSessionActive] = useState<boolean>(true);
  const [signUpRole, setSignUpRole] = useState<"teacher" | "student">("teacher");
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [isSessionUpdating, setIsSessionUpdating] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [activeWorkspace, setActiveWorkspace] = useState<"portal" | "newsroom" | "correspondent" | "student-scaffold" | "globetube" | "textbook-viewer" | "cwk-qa" | "map-maker" | "high-five" | "dse-designer">("portal");

  // Auth Form State
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Visual Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    // Prompt login on every load: do not auto-restore session from localStorage
    setIsInitializing(false);
  }, []);

  // Theme Toggler
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  const toggleDark = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
  };

  // Auth Operations
  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const inputEmail = email.trim();
    const inputPassword = password.trim();

    if (!inputEmail || !inputPassword) {
      setAuthError("Credentials and Password/ID are required");
      setAuthLoading(false);
      return;
    }

    if (signUpRole === "teacher") {
      const isMaster = inputEmail.toLowerCase() === MASTER_ADMIN.toLowerCase();
      const upperInitials = inputEmail.toUpperCase();

      let matchedInitials = "";
      for (const [init, emailStr] of Object.entries(TEACHER_EMAILS)) {
        if (inputEmail.toLowerCase() === emailStr.toLowerCase() || upperInitials === init) {
          matchedInitials = init;
          break;
        }
      }

      const isInitials = matchedInitials !== "";

      if ((isMaster || isInitials) && inputPassword === TEACHER_PASSWORD) {
        const initials = isMaster ? "SKN" : matchedInitials;
        const finalUser: LocalUser = {
          email: isMaster ? MASTER_ADMIN : TEACHER_EMAILS[initials],
          uid: isMaster ? "master_admin" : `teacher_${initials}`
        };
        const finalRole = isMaster ? "super_admin" : "teacher";
        const finalCode = initials;

        setUser(finalUser);
        setRole(finalRole);
        setTeacherCode(finalCode);
        setStatus("approved");

        localStorage.setItem("dp_geo_suite_session", JSON.stringify({
          user: finalUser,
          role: finalRole,
          teacherCode: finalCode,
          status: "approved"
        }));
        setAuthLoading(false);
        setAuthError("");
      } else {
        setAuthError("Invalid Email/Initials or Password credentials");
        setAuthLoading(false);
      }
    } else {
      const matchedId = STUDENT_CREDENTIALS[inputEmail.toLowerCase()];
      if (matchedId && inputPassword === matchedId) {
        const finalUser: LocalUser = {
          email: inputEmail,
          uid: `student_${matchedId}`
        };
        const finalRole = "student";

        setUser(finalUser);
        setRole(finalRole);
        setTeacherCode("");
        setStatus("approved");

        localStorage.setItem("dp_geo_suite_session", JSON.stringify({
          user: finalUser,
          role: finalRole,
          teacherCode: "",
          status: "approved"
        }));
        setAuthLoading(false);
        setAuthError("");
      } else {
        setAuthError("Invalid Email/Initials or Password/ID credentials");
        setAuthLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("dp_geo_suite_session");
    setUser(null);
    setTeacherCode("");
    setRole("student");
    setStatus("approved");
    setActiveWorkspace("portal");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12 mb-4" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Initializing Portal</p>
      </div>
    );
  }

  // Render Login/Signup view if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative transition-colors duration-300">

        {/* Theme Toggle (Borderless top-right moon icon matching mockup) */}
        <button
          onClick={toggleDark}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-[400px] w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative animate-in"
        >
          {/* Logo Badge (Clean rounded blue square) */}
          <div className="mx-auto mb-6 bg-[#2563eb] w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm">
            <span className="text-white font-black text-3xl tracking-tighter select-none">IG</span>
          </div>

          <h2 className="text-[22px] font-black tracking-tight text-slate-900 dark:text-white leading-none mb-1.5 animate-pulse">
            IG Geography Suite
          </h2>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-6">
            {signUpRole === "teacher" ? "Teacher Login" : "Student Login"}
          </p>

          {/* Segmented Role Selector for Login */}
          <div className="flex border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 mb-6 bg-slate-50 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => {
                setSignUpRole("teacher");
                setAuthError("");
              }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${signUpRole === "teacher"
                ? "bg-white dark:bg-slate-900 text-[#2563eb] shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
            >
              Teacher Login
            </button>
            <button
              type="button"
              onClick={() => {
                setSignUpRole("student");
                setAuthError("");
              }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${signUpRole === "student"
                ? "bg-white dark:bg-slate-900 text-[#2563eb] shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
            >
              Student Login
            </button>
          </div>

          <form onSubmit={handleAuthAction} className="space-y-4">
            <input
              type="text"
              placeholder={signUpRole === "teacher" ? "ENTER EMAIL OR INITIALS" : "ENTER STUDENT EMAIL"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-center py-3.5 border rounded-md font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] transition-all bg-white border-[#2563eb] text-slate-700 placeholder-slate-400 dark:bg-slate-950 dark:border-[#2563eb]/80 dark:text-white dark:placeholder-slate-600 text-xs"
              autoComplete="off"
            />

            <input
              type="password"
              placeholder={signUpRole === "teacher" ? "ENTER PASSWORD" : "ENTER STUDENT ID"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-center py-3.5 border rounded-md font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] transition-all bg-white border-[#2563eb] text-slate-700 placeholder-slate-400 dark:bg-slate-950 dark:border-[#2563eb]/80 dark:text-white dark:placeholder-slate-600 text-xs"
            />

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold tracking-widest uppercase text-xs py-3.5 rounded-md transition-colors shadow-sm cursor-pointer disabled:opacity-50 mt-2"
            >
              {authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  PROCESSING...
                </span>
              ) : (
                "LOGIN"
              )}
            </button>
          </form>

          <div className="mt-4">
            {authError && <p className="text-red-500 text-xs font-semibold leading-relaxed">{authError}</p>}
          </div>
        </motion.div>
      </div>
    );
  }

  // Render Sub-Apps if a workspace is selected
  if (activeWorkspace === "newsroom") {
    return (
      <NewsroomApp
        onBackToPortal={() => setActiveWorkspace("portal")}
        activeUserEmail={user.email || ""}
        activeTeacherCode={teacherCode}
        isDark={isDark}
        toggleDark={toggleDark}
      />
    );
  }

  if (activeWorkspace === "correspondent") {
    return (
      <CorrespondentApp
        onBackToPortal={() => setActiveWorkspace("portal")}
        activeUserEmail={user.email || ""}
        activeTeacherCode={teacherCode}
        isDark={isDark}
        toggleDark={toggleDark}
      />
    );
  }

  if (activeWorkspace === "student-scaffold") {
    const allowedTeacherCodes = ["SKN", "JTE", "SMK", "JBO", "SSH", "LLE", "CMA", "CHE"];
    const isAuthorized = (role === "teacher" || role === "super_admin") && allowedTeacherCodes.includes(teacherCode);
    if (!isAuthorized) {
      setActiveWorkspace("portal");
      return null;
    }
    return (
      <StudentScaffoldApp
        onBackToPortal={() => setActiveWorkspace("portal")}
        activeUserEmail={user.email || ""}
        activeTeacherCode={teacherCode}
        isDark={isDark}
        toggleDark={toggleDark}
      />
    );
  }

  if (activeWorkspace === "globetube") {
    return (
      <GlobeTubeApp
        onBackToPortal={() => setActiveWorkspace("portal")}
        isDark={isDark}
        toggleDark={toggleDark}
        role={role}
        activeTeacherCode={teacherCode}
      />
    );
  }

  if (activeWorkspace === "textbook-viewer") {
    return (
      <GeoTextbookViewerApp
        onBackToPortal={() => setActiveWorkspace("portal")}
        isDark={isDark}
        toggleDark={toggleDark}
        user={user}
        role={role}
      />
    );
  }

  if (activeWorkspace === "cwk-qa") {
    return (
      <CwkQaApp
        onBackToPortal={() => setActiveWorkspace("portal")}
        activeUserEmail={user.email || ""}
        activeTeacherCode={teacherCode}
        isDark={isDark}
        toggleDark={toggleDark}
      />
    );
  }

  if (activeWorkspace === "map-maker") {
    return (
      <MapMakerApp
        onBackToPortal={() => setActiveWorkspace("portal")}
        activeUserEmail={user.email || ""}
        activeTeacherCode={teacherCode}
        isDark={isDark}
        toggleDark={toggleDark}
      />
    );
  }

  if (activeWorkspace === "high-five") {
    return (
      <HighFiveApp
        onBackToPortal={() => setActiveWorkspace("portal")}
        activeUserEmail={user.email || ""}
        activeTeacherCode={teacherCode}
        isDark={isDark}
        toggleDark={toggleDark}
      />
    );
  }

  if (activeWorkspace === "dse-designer") {
    return (
      <DseDesignerApp
        onBackToPortal={() => setActiveWorkspace("portal")}
      />
    );
  }

  // Render Portal Dashboard View
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-xl tracking-tighter select-none">IG</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
              IG Geography Suite
            </h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
              Workspace Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* User Profile Info Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <UserIcon size={12} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-none">
                {user.email}
              </span>
              <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-0.5">
                {role === "super_admin" ? "Super Admin Profile" : (role === "teacher" ? `Teacher initials: ${teacherCode || "SKN"}` : "Student Profile")}
              </span>
            </div>
          </div>

          <button
            onClick={toggleDark}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Dashboard Space */}
      <main className="max-w-[1800px] mx-auto px-10 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4"
          >
            <ShieldCheck size={12} /> Securely Authenticated
          </motion.div>

          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4 animate-in">
            {role === "student" ? "Your Geography Workspace" : "Select Your Workspace"}
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            {role === "student" 
              ? "Access your authorized study resources: IG Newsroom case studies, Correspondent news feeds, and GlobeTube video syllabus quizzes."
              : "Welcome to the master geography hub. Access lesson moderation, exam generators, and response scaffolding tools configured to IGCSE criteria."}
          </p>
        </div>

        {/* Workspace Cards Grid */}
        <div className={role === "student" ? "grid md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto gap-6" : "grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-6"}>

          {/* Card 10: IG CWK Quality Assurance */}
          <motion.div
            whileHover={{ y: -6 }}
            className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all"
            onClick={() => setActiveWorkspace("cwk-qa")}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6">
                <FileText size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
                IG CWK QA App
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                IGCSE Coursework Quality Assurance. Evaluate student coursework drafts, execute comparative audits, and compile whole-class assessment feedback.
              </p>

              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Route to Enquiry Framework
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Comparative Auditing
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Whole-Class Feedback Slides
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                Launch Workspace
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>

          {/* Card 6: Correspondent */}
          <motion.div
            whileHover={{ y: -6 }}
            className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all"
            onClick={() => setActiveWorkspace("correspondent")}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6">
                <Globe size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
                Correspondent
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                Breaking global news RSS aggregator and syllabus-tagging unit. Map international press stories directly to IGCSE course units and participate in active daily syllabus polls.
              </p>

              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Live Global RSS Feed Reader
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Gemini-Powered Syllabus Tagging
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Daily Syllabus-Calibrated Polls
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                Launch Workspace
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>

          {/* Card 7: IG Student Scaffold */}
          {((role === "teacher" || role === "super_admin") && ["SKN", "JTE", "SMK", "JBO", "SSH", "LLE", "CMA", "CHE"].includes(teacherCode)) && (
            <motion.div
              whileHover={{ y: -6 }}
              className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all"
              onClick={() => setActiveWorkspace("student-scaffold")}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6">
                  <Frame size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
                  IG Student Scaffold
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  IGCSE response assistant. Automatically generate detailed paragraph blueprints, PEEL framework scaffolds, command term decoders, and sentence-starter writing frames.
                </p>

                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={13} className="text-blue-500" />
                    PEE / PEEL Frameworks
                  </li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={13} className="text-blue-500" />
                    Paragraph blueprints
                  </li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={13} className="text-blue-500" />
                    PDF & DOCX Export Support
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                  Launch Workspace
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Card 8: IG GlobeTube */}
          <motion.div
            whileHover={{ y: -6 }}
            className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all"
            onClick={() => setActiveWorkspace("globetube")}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6">
                <Tv size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
                IG GlobeTube
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                IG Geography video syllabus analyzer. Search or import any educational case study video, stream natively, and generate instant 5-question multiple-choice quizzes using Gemini.
              </p>

              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  YouTube Player API Integration
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-650 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Syllabus Classification Matrix
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Interactive Client-Side Quiz Grading
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                Launch Workspace
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>

          {/* Card 9: IG Geo Textbook Viewer */}
          <motion.div
            whileHover={{ y: -6 }}
            className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all"
            onClick={() => setActiveWorkspace("textbook-viewer")}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6">
                <BookOpen size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
                IG Geo Textbook Viewer
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                Interactive split-screen textbook reader and annotation studio. Pin digital post-it comments onto textbook pages, jump to bookmarks, and filter study notes.
              </p>

              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Multi-Page Document Canvas Viewer
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Coordinate-Based Post-it Pinning
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Interactive Study Studio Sidebar
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                Launch Workspace
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>

          {/* Card 4: IG Newsroom */}
          <motion.div
            whileHover={{ y: -6 }}
            className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all"
            onClick={() => setActiveWorkspace("newsroom")}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6">
                <Globe size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
                IG Newsroom
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                Syllabus-aligned case study and exam-sheet architect. Ingest any web news article or upload document files to automatically extract conceptual lenses, statistics boxes, and exam questions.
              </p>

              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Raw News to Case Studies
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  AO2 Concepts
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Syllabus-Aligned Assessment
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                Launch Workspace
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>

          {/* Card 11: IG OS Map Maker */}
          <motion.div
            whileHover={{ y: -6 }}
            className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all"
            onClick={() => setActiveWorkspace("map-maker")}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6">
                <Map size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
                IG OS Map Maker
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                Syllabus-aligned Ordnance Survey map editor. Custom scale map elements, drag-and-drop symbols, scale markers, grid coordinates, and multi-page PDF map exports.
              </p>

              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Map Element Placement
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Scale Rulers & Grid Lines
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Printable OS Map PDF Exports
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                Launch Workspace
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>

          {/* Card 12: IGCSE 0460 High 5 */}
          <motion.div
            whileHover={{ y: -6 }}
            className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all"
            onClick={() => setActiveWorkspace("high-five")}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6">
                <Sparkles size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
                IGCSE 0460 High 5
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                High-standard exam generation engine. Automatically produce syllabus-compliant scenario questions, 1-5 mark schemes, and custom writing scaffolding.
              </p>

              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Syllabus-Aligned Questions
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Detailed Mark Schemes
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Scaffolding sentence starters
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                Launch Workspace
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>

          {/* Card 13: IG 0460 DSE Designer */}
          <motion.div
            whileHover={{ y: -6 }}
            className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all"
            onClick={() => setActiveWorkspace("dse-designer")}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6">
                <Layout size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
                IG DSE Designer
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                Craft the perfect Detailed Specific Example. Synthesize user inputs, documents, and news URLs into syllabus-aligned, exam-ready case studies.
              </p>

              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Syllabus-Aligned Profiles
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  CLOCCS Locational Analysis
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  Interactive Context Maps
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                Launch Workspace
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
