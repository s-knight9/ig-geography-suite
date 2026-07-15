import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  ChevronLeft,
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
  Map,
  Clock,
  Hand,
  Archive,
  FolderOpen,
  Trash2,
  FolderInput,
  FileDown
} from "lucide-react";
import { UN_DAYS } from "./unDays";
import { VAULT_FOLDERS, getVaultReports, VaultReport, deleteVaultReport, moveVaultReport } from "./vaultTypes";
import { marked } from "marked";

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

// ─── Calendar Widget ──────────────────────────────────────────────────────────
interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  type: "deadline" | "window" | "un_day";
  color: string;
  url?: string;
  readOnly?: boolean;
}

const CAL_SWATCHES = [
  { hex: "#8b0000", name: "Maroon — Class of 2029"  },
  { hex: "#2b25ff", name: "Blue — Class of 2030"    },
  { hex: "#ef4444", name: "Red"                     },
  { hex: "#22c55e", name: "Green"                   },
  { hex: "#f59e0b", name: "Amber"                   },
  { hex: "#ec4899", name: "Pink"                    },
  { hex: "#64748b", name: "Slate"                   },
  { hex: "#06b6d4", name: "Teal"                    },
];

function StudentCalendar() {
  const today = new Date();
  const [viewYear,    setViewYear]    = useState(today.getFullYear());
  const [viewMonth,   setViewMonth]   = useState(today.getMonth());
  const [events,      setEvents]      = useState<CalendarEvent[]>([]);
  const [addMode,     setAddMode]     = useState<"deadline" | "window" | null>(null);
  const [selDate,     setSelDate]     = useState<string | null>(null);
  const [labelInput,  setLabelInput]  = useState("");
  const [pickedColor, setPickedColor] = useState(CAL_SWATCHES[0].hex);
  const [popupDate,   setPopupDate]   = useState<string | null>(null);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [editLabel,   setEditLabel]   = useState("");

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS   = ["SU","MO","TU","WE","TH","FR","SA"];

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0);  setViewYear(y => y+1); } else setViewMonth(m => m+1); };

  const allEvents = React.useMemo(() => {
    const unEvents: CalendarEvent[] = UN_DAYS.map(day => ({
      id: `un-day-${day.month}-${day.day}`,
      date: `${viewYear}-${String(day.month).padStart(2,"0")}-${String(day.day).padStart(2,"0")}`,
      label: day.label,
      type: "un_day",
      color: day.color,
      url: day.url,
      readOnly: true
    }));
    return [...events, ...unEvents];
  }, [events, viewYear]);

  const toDs = (day: number) =>
    `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  const handleDayClick = (day: number) => {
    const ds = toDs(day);
    if (addMode) { setSelDate(ds); return; }
    const dayEvts = allEvents.filter(e => e.date === ds);
    if (dayEvts.length > 0) { setPopupDate(ds); setEditingId(null); }
  };

  const confirmAdd = () => {
    if (!selDate || !addMode) return;
    setEvents(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      date: selDate,
      label: labelInput.trim() || (addMode === "deadline" ? "Deadline" : "Study Window"),
      type: addMode,
      color: pickedColor,
    }]);
    setAddMode(null); setSelDate(null); setLabelInput(""); setPickedColor(CAL_SWATCHES[0].hex);
  };

  const startEdit  = (ev: CalendarEvent) => { setEditingId(ev.id); setEditLabel(ev.label); };
  const confirmEdit = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, label: editLabel } : e));
    setEditingId(null);
  };
  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const popupEvents = popupDate ? allEvents.filter(e => e.date === popupDate) : [];
  const todayDs = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  return (
    <div style={{ fontFamily:"sans-serif", userSelect:"none" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <div>
          <div style={{ fontWeight:900, fontSize:13, textTransform:"uppercase", letterSpacing:2 }}>📅 Calendar</div>
          <div style={{ fontSize:11, color:"#64748b", fontWeight:600 }}>{MONTHS[viewMonth]} {viewYear}</div>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={prevMonth} style={{ border:"1px solid #e2e8f0", background:"#fff", borderRadius:6, padding:"2px 8px", cursor:"pointer", fontWeight:700 }}>‹</button>
          <button onClick={nextMonth} style={{ border:"1px solid #e2e8f0", background:"#fff", borderRadius:6, padding:"2px 8px", cursor:"pointer", fontWeight:700 }}>›</button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign:"center", fontSize:9, fontWeight:800, color:"#94a3b8", textTransform:"uppercase" }}>{d}</div>)}
      </div>

      {/* Day cells */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
        {Array.from({ length: firstDay }).map((_,i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_,i) => {
          const day = i + 1;
          const ds  = toDs(day);
          const evts = allEvents.filter(e => e.date === ds);
          const isToday = ds === todayDs;
          const isSel   = ds === selDate;
          return (
            <div key={day} onClick={() => handleDayClick(day)}
              style={{
                minHeight:28, borderRadius:6, padding:"2px 3px",
                background: isSel ? "#2563eb" : isToday ? "#eff6ff" : evts.length ? "#f0fdf4" : "#f8fafc",
                border: isSel ? "2px solid #1d4ed8" : isToday ? "2px solid #93c5fd" : "1px solid #e2e8f0",
                cursor: addMode || evts.length ? "pointer" : "default",
                position:"relative"
              }}
            >
              <div style={{ fontSize:10, fontWeight: isToday ? 900 : 700, color: isSel ? "#fff" : isToday ? "#2563eb" : "#334155", textAlign:"center" }}>{day}</div>
              {evts.slice(0,2).map(ev => (
                <div key={ev.id} style={{ height:4, borderRadius:2, background:ev.color, marginTop:1 }} />
              ))}
            </div>
          );
        })}
      </div>

      {/* Add buttons */}
      {!addMode && (
        <div style={{ display:"flex", gap:6, marginTop:10 }}>
          <button onClick={() => setAddMode("deadline")}
            style={{ flex:1, background:"#ef4444", color:"#fff", border:"none", borderRadius:6, padding:"5px 0", fontSize:10, fontWeight:800, cursor:"pointer", textTransform:"uppercase", letterSpacing:1 }}>
            + Deadline
          </button>
          <button onClick={() => setAddMode("window")}
            style={{ flex:1, background:"#22c55e", color:"#fff", border:"none", borderRadius:6, padding:"5px 0", fontSize:10, fontWeight:800, cursor:"pointer", textTransform:"uppercase", letterSpacing:1 }}>
            + Study Window
          </button>
        </div>
      )}

      {/* Add form */}
      {addMode && (
        <div style={{ marginTop:8, background:"#f1f5f9", borderRadius:8, padding:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#475569", marginBottom:4, textTransform:"uppercase" }}>
            {selDate ? `Adding to ${selDate}` : "Click a day to select date"}
          </div>
          <input value={labelInput} onChange={e => setLabelInput(e.target.value)}
            placeholder="Label (optional)" style={{ width:"100%", fontSize:11, border:"1px solid #cbd5e1", borderRadius:5, padding:"4px 6px", marginBottom:5, boxSizing:"border-box" }} />
          <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:6 }}>
            {CAL_SWATCHES.map(s => (
              <button key={s.hex} title={s.name} onClick={() => setPickedColor(s.hex)}
                style={{ width:18, height:18, borderRadius:"50%", background:s.hex, border: pickedColor === s.hex ? "2.5px solid #0f172a" : "2px solid transparent", cursor:"pointer" }} />
            ))}
          </div>
          <div style={{ display:"flex", gap:5 }}>
            <button onClick={confirmAdd} disabled={!selDate}
              style={{ flex:1, background:"#2563eb", color:"#fff", border:"none", borderRadius:5, padding:"4px 0", fontSize:10, fontWeight:800, cursor:selDate?"pointer":"not-allowed", opacity:selDate?1:0.5 }}>
              Save
            </button>
            <button onClick={() => { setAddMode(null); setSelDate(null); setLabelInput(""); }}
              style={{ flex:1, background:"#94a3b8", color:"#fff", border:"none", borderRadius:5, padding:"4px 0", fontSize:10, fontWeight:800, cursor:"pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Day popup */}
      {popupDate && popupEvents.length > 0 && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => { setPopupDate(null); setEditingId(null); }}>
          <div style={{ background:"#fff", borderRadius:12, padding:18, minWidth:240, boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:900, fontSize:13, marginBottom:10, color:"#1e293b" }}>📅 {popupDate}</div>
            {popupEvents.map(ev => (
              <div key={ev.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, background:"#f8fafc", borderRadius:7, padding:"6px 8px", borderLeft:`4px solid ${ev.color}` }}>
                <div style={{ flex:1 }}>
                  {editingId === ev.id ? (
                    <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && confirmEdit(ev.id)}
                      style={{ width:"100%", fontSize:11, border:"1px solid #cbd5e1", borderRadius:4, padding:"2px 5px" }} />
                  ) : (
                    ev.url ? (
                      <a href={ev.url} target="_blank" rel="noreferrer" style={{ fontSize:11, fontWeight:700, color:"#2563eb", textDecoration:"none", borderBottom:"1px dotted #2563eb" }}>{ev.label}</a>
                    ) : (
                      <div style={{ fontSize:11, fontWeight:700, color:"#334155" }}>{ev.label}</div>
                    )
                  )}
                  <div style={{ fontSize:9, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", marginTop:2 }}>{ev.type.replace('_', ' ')}</div>
                </div>
                {!ev.readOnly && (
                  <>
                    {editingId === ev.id ? (
                      <button onClick={() => confirmEdit(ev.id)} style={{ fontSize:10, background:"#22c55e", color:"#fff", border:"none", borderRadius:4, padding:"2px 7px", cursor:"pointer", fontWeight:800 }}>✓</button>
                    ) : (
                      <button onClick={() => startEdit(ev)} style={{ fontSize:10, background:"#2563eb", color:"#fff", border:"none", borderRadius:4, padding:"2px 7px", cursor:"pointer", fontWeight:800 }}>✎ Edit</button>
                    )}
                    <button onClick={() => deleteEvent(ev.id)} style={{ fontSize:10, background:"#ef4444", color:"#fff", border:"none", borderRadius:4, padding:"2px 7px", cursor:"pointer", fontWeight:800 }}>✕</button>
                  </>
                )}
              </div>
            ))}
            <button onClick={() => { setPopupDate(null); setEditingId(null); }}
              style={{ width:"100%", marginTop:8, background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 0", fontSize:10, fontWeight:700, cursor:"pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Exam Countdown Widget ─────────────────────────────────────────────────────
const DEADLINES_2030 = [
  { label:"Draft CWK", date:"2027-10-20", color:"#2b25ff" },
  { label:"Final CWK", date:"2027-11-24", color:"#2b25ff" },
  { label:"Paper 1 - Physical", date:"2028-05-02", color:"#2b25ff" },
  { label:"Paper 2 - Human", date:"2028-05-09", color:"#2b25ff" }
];

const DEADLINES_2029 = [
  { label:"Draft CWK", date:"2026-10-21", color:"#8b0000" },
  { label:"Final CWK", date:"2026-11-25", color:"#8b0000" },
  { label:"Paper 1 - Physical", date:"2027-05-04", color:"#8b0000" },
  { label:"Paper 2 - Human", date:"2027-05-11", color:"#8b0000" }
];

function ExamCountdowns() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const renderList = (title: string, items: typeof DEADLINES_2029, bgColor: string) => (
    <div style={{ flex: 1, display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ background:bgColor, color:"#fff", padding:"6px", textAlign:"center", fontWeight:900, textTransform:"uppercase", letterSpacing:1, fontSize:12 }}>
        {title}
      </div>
      {items.map(ex => {
        const target = new Date(ex.date);
        const diff   = Math.ceil((target.getTime() - now.getTime()) / 86400000);
        return (
          <div key={ex.label} style={{ display:"flex", alignItems:"center", gap:10, background:"#f8fafc", padding:"8px 10px", borderLeft:`4px solid ${ex.color}` }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:11, color:"#1e293b" }}>{ex.label}</div>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:600 }}>
                {new Date(ex.date).toLocaleDateString('en-GB')}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontWeight:900, fontSize:18, color:ex.color, lineHeight:1 }}>{diff > 0 ? diff : 0}</div>
              <div style={{ fontSize:9, color:"#94a3b8", fontWeight:700, textTransform:"uppercase" }}>days</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ fontFamily:"sans-serif" }}>
      <div style={{ fontWeight:900, fontSize:13, textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>⏳ Upcoming Deadlines</div>
      <div style={{ display:"flex", gap:10 }}>
        {renderList("CLASS OF 2030", DEADLINES_2030, "#2b25ff")}
        {renderList("CLASS OF 2029", DEADLINES_2029, "#8b0000")}
      </div>
    </div>
  );
}

// ─── Post-it Reminders Widget ──────────────────────────────────────────────────
function PostItReminders() {
  const [notes, setNotes] = useState<string[]>(["Check mark schemes!", "Update seating plan"]);
  const [input, setInput] = useState("");
  const add    = () => { if (input.trim()) { setNotes(p => [...p, input.trim()]); setInput(""); } };
  const remove = (i: number) => setNotes(p => p.filter((_,j) => j !== i));
  return (
    <div style={{ fontFamily:"sans-serif" }}>
      <div style={{ fontWeight:900, fontSize:13, textTransform:"uppercase", letterSpacing:2, marginBottom:10, color:"#92400e" }}>📝 Reminders</div>
      <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
        {notes.map((n,i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:6, background:"#fef3c7", borderRadius:6, padding:"6px 8px", border:"1px solid #fde68a" }}>
            <span style={{ flex:1, fontSize:11, fontWeight:700, color:"#78350f", lineHeight:1.4 }}>{n}</span>
            <button onClick={() => remove(i)} style={{ background:"none", border:"none", cursor:"pointer", color:"#d97706", fontWeight:900, fontSize:13, lineHeight:1, padding:0 }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:5 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && add()}
          placeholder="Add reminder…" style={{ flex:1, fontSize:11, border:"1px solid #fde68a", borderRadius:5, padding:"4px 7px", background:"#fffbeb", outline:"none" }} />
        <button onClick={add} style={{ background:"#f59e0b", color:"#fff", border:"none", borderRadius:5, padding:"4px 10px", fontSize:11, fontWeight:800, cursor:"pointer" }}>+</button>
      </div>
    </div>
  );
}

// ─── Ticker Tape ───────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "🌍 GEOGRAPHY IN THE NEWS","El Niño intensifies Pacific drought conditions","Urbanisation rate in Sub-Saharan Africa hits 42%",
  "Himalayan glaciers recede fastest on record","Lagos megacity population surpasses 25 million",
  "Coral bleaching event declared across Great Barrier Reef","Amazon deforestation rate drops 45% YoY",
  "Bangladesh flood defences upgraded ahead of monsoon season","Tech corridor drives migration to South Korea's Sejong City",
];

function TickerTape() {
  const ref  = useRef<HTMLDivElement>(null);
  const pos  = useRef(0);
  const raf  = useRef<number>(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const speed = 0.6;
    const step = () => {
      pos.current -= speed;
      if (Math.abs(pos.current) >= el.scrollWidth / 2) pos.current = 0;
      el.style.transform = `translateX(${pos.current}px)`;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ background:"#ffe600", overflow:"hidden", padding:"7px 0", borderRadius:"12px", border:"1px solid #eab308", boxShadow:"0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
      <div ref={ref} style={{ display:"flex", whiteSpace:"nowrap", willChange:"transform" }}>
        {items.map((t,i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:16, paddingRight:48, fontSize:11, fontWeight:800, color: "#000000", textTransform:"uppercase", letterSpacing:1.5 }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}



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
  const [demoMode, setDemoMode] = useState<"teacher" | "student">("teacher");
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [selectedVaultFolder, setSelectedVaultFolder] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [vaultRefreshTrigger, setVaultRefreshTrigger] = useState(0);
  const [movingReportId, setMovingReportId] = useState<string | null>(null);
  const [isExportingVault, setIsExportingVault] = useState(false);

  const handleDownloadPdf = async (report: VaultReport) => {
    setIsExportingVault(true);
    try {
      const html2pdfModule = (await import('html2pdf.js')) as any;
      const html2pdf = html2pdfModule.default || html2pdfModule;
      
      const container = document.getElementById('vault-report-content');
      if (!container) throw new Error('Report content not found');
      
      const originalMargin = container.style.margin;
      container.style.margin = '20px';
      
      const opt = {
        margin: [15, 15, 15, 15] as [number, number, number, number],
        filename: `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(container).save();
      container.style.margin = originalMargin;
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF.');
    } finally {
      setIsExportingVault(false);
    }
  };

  const handleDownloadDocx = async (report: VaultReport) => {
    setIsExportingVault(true);
    try {
      const parsedHtml = await marked.parse(report.content);
      
      let headerHTML = `
          <div style="font-family: Arial, sans-serif;">
              <h2><span style="color: #2563eb;">IG Vault Report</span></h2>
              <p><span style="color: #94a3b8;">${report.title}</span></p>
              <hr style="color: #2563eb;"/>
          </div>
      `;
      
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/dse/export-docx';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'html';
      input.value = headerHTML + parsedHtml;
      
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (err) {
      console.error(err);
      alert('Failed to generate DOCX.');
    } finally {
      setIsExportingVault(false);
    }
  };

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
  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case "newsroom":
        return (
          <NewsroomApp
            onBackToPortal={() => setActiveWorkspace("portal")}
            activeUserEmail={user.email || ""}
            activeTeacherCode={teacherCode}
            activeRole={role}
            isDark={isDark}
            toggleDark={toggleDark}
          />
        );
      case "correspondent":
        return (
          <CorrespondentApp
            onBackToPortal={() => setActiveWorkspace("portal")}
            activeUserEmail={user.email || ""}
            activeTeacherCode={teacherCode}
            isDark={isDark}
            toggleDark={toggleDark}
            onOpenVault={() => setIsVaultOpen(true)}
          />
        );
      case "student-scaffold":
        const allowedTeacherCodes = ["SKN", "JTE", "SMK", "JBO", "SSH", "LLE", "CMA", "CHE"];
        const isAuthorized = (role === "teacher" || role === "super_admin") && allowedTeacherCodes.includes(teacherCode);
        if (!isAuthorized) {
          setTimeout(() => setActiveWorkspace("portal"), 0);
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
      case "globetube":
        return (
          <GlobeTubeApp
            onBackToPortal={() => setActiveWorkspace("portal")}
            isDark={isDark}
            toggleDark={toggleDark}
            role={role}
            activeTeacherCode={teacherCode}
          />
        );
      case "textbook-viewer":
        return (
          <GeoTextbookViewerApp
            onBackToPortal={() => setActiveWorkspace("portal")}
            isDark={isDark}
            toggleDark={toggleDark}
            user={user}
            role={role}
          />
        );
      case "cwk-qa":
        return (
          <CwkQaApp
            onBackToPortal={() => setActiveWorkspace("portal")}
            activeUserEmail={user.email || ""}
            activeTeacherCode={teacherCode}
            isDark={isDark}
            toggleDark={toggleDark}
          />
        );
      case "map-maker":
        return (
          <MapMakerApp
            onBackToPortal={() => setActiveWorkspace("portal")}
            activeUserEmail={user.email || ""}
            activeTeacherCode={teacherCode}
            isDark={isDark}
            toggleDark={toggleDark}
          />
        );
      case "high-five":
        return (
          <HighFiveApp
            onBackToPortal={() => setActiveWorkspace("portal")}
            activeUserEmail={user.email || ""}
            activeTeacherCode={teacherCode}
            isDark={isDark}
            toggleDark={toggleDark}
          />
        );
      case "dse-designer":
        return (
          <DseDesignerApp
            onBackToPortal={() => setActiveWorkspace("portal")}
            activeRole={role}
          />
        );
      default:
        return null;
    }
  };

  const isTeacher = role === "teacher" || role === "super_admin";

  // ── Reusable card footer ──────────────────────────────────────────────────
  const CardFooter = () => (
    <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
      <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Launch Workspace</span>
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
        <ChevronRight size={16} />
      </div>
    </div>
  );

  const workspaceView = renderWorkspace();

  const VaultModal = (
    <AnimatePresence>
      {isVaultOpen && (
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-950 z-[100] flex flex-col">
          {/* Vault Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-300 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-md">
                <Archive size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight">IG Vault</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Secure Storage & Archive</p>
              </div>
            </div>
            <button onClick={() => setIsVaultOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full">
              <X size={20} />
            </button>
          </div>

          {/* Vault Body: 1/4 Folders, 3/4 Reports */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar (Folders) */}
            <div className="w-1/4 h-full border-r border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-y-auto p-4 flex flex-col gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 px-2">Folders</h3>
              {VAULT_FOLDERS.map(folder => {
                const reports = getVaultReports()[folder.id] || [];
                const isSelected = selectedVaultFolder === folder.id;
                
                // Extract colors for styling
                const matches = folder.color.match(/bg-\[(.+?)\]/);
                const baseColor = matches ? matches[1] : '#f59e0b';
                
                return (
                  <button
                    key={folder.id}
                    onClick={() => { setSelectedVaultFolder(folder.id); setSelectedReportId(null); }}
                    className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      isSelected
                        ? `bg-white dark:bg-slate-800 border-[${baseColor}] shadow-md ring-1 ring-[${baseColor}]/50`
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${folder.color.replace('text-white', '').replace(/text-\[.+?\]/, 'text-white')} ${!folder.color.includes('text-white') ? 'text-white' : ''} shadow-sm border-0`}>
                      <FolderOpen size={16} />
                    </div>
                    <div className="flex-1 truncate">
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{folder.name}</div>
                      <div className="text-[10px] font-semibold text-slate-400">{reports.length} {reports.length === 1 ? 'item' : 'items'}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Main Content (Reports) */}
            <div className="w-3/4 h-full overflow-y-auto bg-white dark:bg-slate-950 p-8">
              {!selectedVaultFolder ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Archive size={48} className="mb-4 opacity-20" />
                  <p className="font-bold text-lg text-slate-500">Select a folder to view reports</p>
                  <p className="text-xs font-semibold uppercase tracking-widest mt-2 opacity-60">IG Geography Suite</p>
                </div>
              ) : (
                <div>
                  {(() => {
                    const activeFolder = VAULT_FOLDERS.find(f => f.id === selectedVaultFolder);
                    const reports = getVaultReports()[selectedVaultFolder] || [];
                    
                    return (
                      <>
                        <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <span className={`w-4 h-4 rounded-full ${activeFolder?.color.split(' ')[0]}`}></span>
                            {activeFolder?.name}
                          </h2>
                          <p className="text-sm font-bold text-slate-500 mt-1">{reports.length} {reports.length === 1 ? 'report' : 'reports'} saved</p>
                        </div>
                        
                        {reports.length === 0 ? (
                          <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400">
                            <FolderOpen size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="font-bold">This folder is empty</p>
                            <p className="text-xs mt-1">Export items from the Correspondent app to see them here.</p>
                          </div>
                        ) : selectedReportId ? (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                              <button 
                                onClick={() => setSelectedReportId(null)}
                                className="flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
                              >
                                <ChevronLeft size={16} /> Back to Folder
                              </button>
                              
                              {(() => {
                                const report = reports.find(r => r.id === selectedReportId);
                                if (!report) return null;
                                return (
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleDownloadPdf(report)}
                                      disabled={isExportingVault}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                                    >
                                      <FileDown size={14} /> PDF
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadDocx(report)}
                                      disabled={isExportingVault}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                                    >
                                      <FileText size={14} /> DOCX
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                            
                            {(() => {
                              const report = reports.find(r => r.id === selectedReportId);
                              if (!report) return null;
                              return (
                                <div id="vault-report-content" className="bg-white dark:bg-slate-900">
                                  <div className="flex justify-between items-start mb-6">
                                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{report.title}</h1>
                                    <div className="text-sm font-black text-slate-500">{new Date(report.date).toLocaleDateString()}</div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mb-8">
                                    {report.tags.map(tag => (
                                      <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="prose dark:prose-invert prose-slate max-w-none">
                                    <Markdown remarkPlugins={[remarkGfm]}>
                                      {report.content}
                                    </Markdown>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {reports.map((report, i) => (
                              <div key={i} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-shadow relative group cursor-pointer" onClick={() => setSelectedReportId(report.id)}>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="text-xs font-black text-blue-500">{new Date(report.date).toLocaleDateString()}</div>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setMovingReportId(movingReportId === report.id ? null : report.id); }}
                                      className="text-slate-400 hover:text-amber-500 transition-colors p-1"
                                      title="Move to another folder"
                                    >
                                      <FolderInput size={14} />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this report?')) {
                                          deleteVaultReport(selectedVaultFolder, report.id);
                                          setVaultRefreshTrigger(prev => prev + 1);
                                        }
                                      }}
                                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                      title="Delete report"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                                
                                {movingReportId === report.id && (
                                  <div className="absolute top-10 right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2 z-20 w-48" onClick={e => e.stopPropagation()}>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Move to...</div>
                                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                                      {VAULT_FOLDERS.filter(f => f.id !== selectedVaultFolder).map(f => (
                                        <button
                                          key={f.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            moveVaultReport(selectedVaultFolder, f.id, report.id);
                                            setMovingReportId(null);
                                            setVaultRefreshTrigger(prev => prev + 1);
                                          }}
                                          className="text-left text-xs px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 transition-colors"
                                        >
                                          {f.name}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-3">{report.title}</h3>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  {report.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 prose dark:prose-invert">
                                  {report.content.split('\n\n').slice(2).join('\n\n')}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  if (workspaceView) {
    return (
      <>
        {workspaceView}
        {user && activeWorkspace !== "portal" && (
          <button
            onClick={() => setIsVaultOpen(true)}
            className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-2xl shadow-xl shadow-[#2563eb]/30 flex items-center justify-center transition-transform hover:scale-110"
            title="Open IG Vault"
          >
            <Archive size={24} />
          </button>
        )}
        {VaultModal}
      </>
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
            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">IG Geography Suite</h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">Workspace Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-3">

          {/* User badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <UserIcon size={12} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-none">{user.email}</span>
              <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-0.5">
                {role === "super_admin" ? "Super Admin" : role === "teacher" ? `Teacher · ${teacherCode}` : "Student"}
              </span>
            </div>
          </div>

          {/* Teacher / Student demo-mode toggle — teacher accounts only */}
          {isTeacher && (
            <div className="flex items-center gap-0.5 p-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm">
              <button
                onClick={() => setDemoMode("teacher")}
                title="Teacher Mode — show all apps"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                  demoMode === "teacher"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <ShieldCheck size={11} />
                Teacher
              </button>
              <button
                onClick={() => setDemoMode("student")}
                title="Student Mode — hide teacher-only apps"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                  demoMode === "student"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <GraduationCap size={11} />
                Student
              </button>
            </div>
          )}

          {/* Vault Icon */}
          <button
            onClick={() => setIsVaultOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="IG Vault"
          >
            <Archive size={16} />
          </button>

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

      {/* Main Dashboard */}
      <main className="max-w-[1800px] mx-auto px-10 py-8 space-y-10">

        {/* ── Dashboard Widgets ── */}
        <section className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50">
            <StudentCalendar />
          </div>
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50">
            <ExamCountdowns />
          </div>
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50">
            <PostItReminders />
          </div>
        </section>

        <TickerTape />


        {/* ── TEACHER ADMINISTRATION & TOOLS ── teacher mode only ── */}
        {isTeacher && demoMode === "teacher" && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600 text-white">
                <ShieldAlert size={13} />
                <span className="text-[11px] font-black uppercase tracking-wider">Teacher Administration &amp; Tools</span>
              </div>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-6">

              {/* CWK QA */}
              <motion.div whileHover={{ y: -6 }} onClick={() => setActiveWorkspace("cwk-qa")}
                className="glass-panel rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-900/60 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/10 transition-all relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">Teacher Only</span>
                </div>
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6"><FileText size={28} /></div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">IG CWK Quality Assurance</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">IGCSE Coursework Quality Assurance. Evaluate student coursework drafts, execute comparative audits, and compile whole-class assessment feedback.</p>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Route to Enquiry Framework</li>
                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Comparative Auditing</li>
                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Whole-Class Feedback Slides</li>
                  </ul>
                </div>
                <CardFooter />
              </motion.div>

              {/* Student Scaffold */}
              {["SKN","JTE","SMK","JBO","SSH","LLE","CMA","CHE"].includes(teacherCode) && (
                <motion.div whileHover={{ y: -6 }} onClick={() => setActiveWorkspace("student-scaffold")}
                  className="glass-panel rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-900/60 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/10 transition-all relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">Teacher Only</span>
                  </div>
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6"><Frame size={28} /></div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">IG Student Scaffold</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">IGCSE response assistant. Generate detailed paragraph blueprints, PEEL framework scaffolds, command term decoders, and sentence-starter writing frames.</p>
                    <ul className="space-y-2 mb-8">
                      <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />PEE / PEEL Frameworks</li>
                      <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Paragraph blueprints</li>
                      <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />PDF &amp; DOCX Export Support</li>
                    </ul>
                  </div>
                  <CardFooter />
                </motion.div>
              )}

              {/* OS Map Maker */}
              <motion.div whileHover={{ y: -6 }} onClick={() => setActiveWorkspace("map-maker")}
                className="glass-panel rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-900/60 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/10 transition-all relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">Teacher Only</span>
                </div>
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6"><Map size={28} /></div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">IG OS Map Maker</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">Syllabus-aligned Ordnance Survey map editor. Custom scale map elements, drag-and-drop symbols, scale markers, grid coordinates, and multi-page PDF map exports.</p>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Map Element Placement</li>
                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Scale Rulers &amp; Grid Lines</li>
                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Printable OS Map PDF Exports</li>
                  </ul>
                </div>
                <CardFooter />
              </motion.div>

              {/* O460 High Five */}
              <motion.div whileHover={{ y: -6 }} onClick={() => setActiveWorkspace("high-five")}
                className="glass-panel rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-900/60 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/10 transition-all relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">Teacher Only</span>
                </div>
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6"><Hand size={28} /></div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">IGCSE 0460 High 5</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">High-standard exam generation engine. Produce syllabus-compliant scenario questions, 1-5 mark schemes, and custom writing scaffolding.</p>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Syllabus-Aligned Questions</li>
                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Detailed Mark Schemes</li>
                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Scaffolding Sentence Starters</li>
                  </ul>
                </div>
                <CardFooter />
              </motion.div>

            </div>
          </section>
        )}

        {/* ── CORE GEOGRAPHY WORKSPACES ── visible to everyone ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700 text-white">
              <Globe size={13} />
              <span className="text-[11px] font-black uppercase tracking-wider">Core Geography Workspaces</span>
            </div>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-6">

            {/* Correspondent */}
            <motion.div whileHover={{ y: -6 }} onClick={() => setActiveWorkspace("correspondent")}
              className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6"><Globe size={28} /></div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">Correspondent</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">Breaking global news RSS aggregator and syllabus-tagging unit. Map international press stories directly to IGCSE course units and participate in daily syllabus polls.</p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Live Global RSS Feed Reader</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Gemini-Powered Syllabus Tagging</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Daily Syllabus-Calibrated Polls</li>
                </ul>
              </div>
              <CardFooter />
            </motion.div>

            {/* GlobeTube */}
            <motion.div whileHover={{ y: -6 }} onClick={() => setActiveWorkspace("globetube")}
              className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6"><Tv size={28} /></div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">IG GlobeTube</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">IG Geography video syllabus analyzer. Search or import any educational case study video, stream natively, and generate instant quizzes using Gemini.</p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />YouTube Player API Integration</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Syllabus Classification Matrix</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Interactive Client-Side Quiz Grading</li>
                </ul>
              </div>
              <CardFooter />
            </motion.div>

            {/* Textbook Viewer */}
            <motion.div whileHover={{ y: -6 }} onClick={() => setActiveWorkspace("textbook-viewer")}
              className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6"><BookOpen size={28} /></div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">IG Geo Textbook Viewer</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">Interactive split-screen textbook reader and annotation studio. Pin digital post-it comments onto textbook pages, jump to bookmarks, and filter study notes.</p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Multi-Page Document Canvas Viewer</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Coordinate-Based Post-it Pinning</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Interactive Study Studio Sidebar</li>
                </ul>
              </div>
              <CardFooter />
            </motion.div>

            {/* Newsroom */}
            <motion.div whileHover={{ y: -6 }} onClick={() => setActiveWorkspace("newsroom")}
              className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6"><Globe size={28} /></div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">IG Newsroom</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">Syllabus-aligned case study and exam-sheet architect. Ingest any web news article or uploaded document to extract conceptual lenses, statistics boxes, and exam questions.</p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Raw News to Case Studies</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />AO2 Concepts</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Syllabus-Aligned Assessment</li>
                </ul>
              </div>
              <CardFooter />
            </motion.div>

            {/* DSE Designer */}
            <motion.div whileHover={{ y: -6 }} onClick={() => setActiveWorkspace("dse-designer")}
              className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-blue-500/5 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-6"><Layout size={28} /></div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3">IG DSE Designer</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">Craft the perfect Detailed Specific Example. Synthesize user inputs, documents, and news URLs into syllabus-aligned, exam-ready case studies.</p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Syllabus-Aligned Profiles</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />CLOCCS Locational Analysis</li>
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 size={13} className="text-blue-500" />Interactive Context Maps</li>
                </ul>
              </div>
              <CardFooter />
            </motion.div>

          </div>
        </section>

      </main>

      {VaultModal}
    </div>
  );
}
