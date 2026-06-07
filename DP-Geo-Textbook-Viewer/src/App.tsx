import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Bookmark, 
  Plus, 
  Trash2, 
  Eye, 
  Moon, 
  Sun, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Edit3, 
  FileText,
  HelpCircle,
  Sparkles,
  Info,
  Upload,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';


interface BookmarkItem {
  id: number;
  docName: string;
  page: number;
  x: number; // percentage width
  y: number; // percentage height
  note: string;
  createdAt: string;
}

function BookmarkPin({ 
  data, 
  isHighlighted, 
  onClick 
}: { 
  data: BookmarkItem; 
  isHighlighted: boolean; 
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="relative pointer-events-auto group/pin cursor-pointer font-sans"
      onClick={onClick}
    >
      {/* Post-it Badge Icon */}
      <div 
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
          isHighlighted 
            ? 'bg-yellow-400 text-slate-950 scale-125 animate-bounce ring-4 ring-[#00b894]' 
            : 'bg-yellow-300 dark:bg-yellow-450/90 text-slate-800 hover:bg-yellow-400 hover:scale-115'
        }`}
      >
        <Bookmark className="w-4.5 h-4.5 fill-current" />
      </div>

      {/* Hover Tooltip Popup */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-950/95 dark:bg-slate-900 border border-slate-800 text-white rounded-xl p-3 shadow-2xl opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-30 transition-all">
        <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1.5">
          <span className="text-[8px] font-black text-yellow-400 uppercase tracking-wider">Post-it Note</span>
          <span className="text-[8px] font-black text-slate-500 uppercase font-mono">{data.createdAt}</span>
        </div>
        <p className="text-[10px] font-bold leading-normal text-slate-200 normal-case">
          {data.note.length > 80 ? data.note.substring(0, 77) + '...' : data.note}
        </p>
        <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider text-right mt-1.5">Click to edit</p>
      </div>
    </div>
  );
}

interface PDFPageRendererProps {
  pdfDoc: any;
  pageNum: number;
  bookmarks: BookmarkItem[];
  selectedDoc: string;
  highlightedNoteId: number | null;
  onOpenEdit: (b: BookmarkItem) => void;
  addPostitMode: boolean;
  onPageClick: (e: React.MouseEvent<HTMLDivElement>, pageNum: number) => void;
}

function PDFPageRenderer({
  pdfDoc,
  pageNum,
  bookmarks,
  selectedDoc,
  highlightedNoteId,
  onOpenEdit,
  addPostitMode,
  onPageClick
}: PDFPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const textLayerInstanceRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    let active = true;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (!active) return;

        const desiredWidth = 760;
        const initialViewport = page.getViewport({ scale: 1 });
        const scale = desiredWidth / initialViewport.width;
        const viewport = page.getViewport({ scale });

        // Update dimensions state to set container aspect ratio
        setDimensions({ width: viewport.width, height: viewport.height });

        const canvas = canvasRef.current;
        const textLayerDiv = textLayerRef.current;
        if (!canvas || !textLayerDiv) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Sync text layer container height and width
        textLayerDiv.style.width = `${viewport.width}px`;
        textLayerDiv.style.height = `${viewport.height}px`;

        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {}
        }
        if (textLayerInstanceRef.current) {
          try {
            textLayerInstanceRef.current.cancel();
          } catch (e) {}
        }

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;

        if (!active) return;

        // Render PDF text layer on top of the canvas
        const textContent = await page.getTextContent();
        textLayerDiv.innerHTML = '';

        const textLayerInstance = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport: viewport,
        });
        textLayerInstanceRef.current = textLayerInstance;

        await textLayerInstance.render();
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('PDF page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      active = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }
      if (textLayerInstanceRef.current) {
        try {
          textLayerInstanceRef.current.cancel();
        } catch (e) {}
      }
    };
  }, [pdfDoc, pageNum]);

  return (
    <div 
      className="relative flex flex-col items-center" 
      style={{ 
        position: 'relative', 
        overflow: 'visible', 
        width: '100%', 
        maxWidth: '760px',
        margin: '0 auto'
      }}
    >
      <div 
        className="relative shadow-md"
        style={{
          position: 'relative',
          overflow: 'visible',
          width: '100%',
          aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : '1 / 1.414'
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full object-contain rounded-2xl" />
        <div 
          ref={textLayerRef} 
          className="textLayer absolute inset-0 pointer-events-auto select-text overflow-hidden rounded-2xl" 
          style={{
            lineHeight: 1.0,
            opacity: 1,
          }}
        />

        {/* Click-capture transparent overlay when Add Post-it Mode is active */}
        <div 
          className="absolute inset-0 w-full h-full z-10"
          style={{ pointerEvents: addPostitMode ? 'auto' : 'none' }}
          onClick={(e) => {
            if (addPostitMode) {
              onPageClick(e, pageNum);
            }
          }}
        />

        {/* Absolute Positioned Custom Annotation Overlay */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
          {bookmarks
            .filter(b => b.docName === selectedDoc && b.page === pageNum)
            .map((b) => {
              const isHighlighted = highlightedNoteId === b.id;
              return (
                <div
                  key={b.id}
                  className="absolute pointer-events-auto group/pin cursor-pointer font-sans"
                  style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEdit(b);
                  }}
                >
                  {/* Post-it Badge Icon */}
                  <div 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                      isHighlighted 
                        ? 'bg-yellow-400 text-slate-950 scale-125 animate-bounce ring-4 ring-[#00b894]' 
                        : 'bg-yellow-300 dark:bg-yellow-450/90 text-slate-800 hover:bg-yellow-400 hover:scale-115'
                    }`}
                  >
                    <Bookmark className="w-4.5 h-4.5 fill-current" />
                  </div>

                  {/* Hover Tooltip Popup */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-950/95 dark:bg-slate-900 border border-slate-800 text-white rounded-xl p-3 shadow-2xl opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-30 transition-all">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1.5">
                      <span className="text-[8px] font-black text-yellow-400 uppercase tracking-wider">Post-it Note</span>
                      <span className="text-[8px] font-black text-slate-500 uppercase font-mono">{b.createdAt}</span>
                    </div>
                    <p className="text-[10px] font-bold leading-normal text-slate-200 normal-case">
                      {b.note.length > 80 ? b.note.substring(0, 77) + '...' : b.note}
                    </p>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider text-right mt-1.5">Click to edit</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <style>{`
        .textLayer {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          line-height: 1.0;
          text-size-adjust: none;
          forced-color-adjust: none;
          transform-origin: 0 0;
          z-index: 2;
        }
        .textLayer span {
          color: transparent !important;
          position: absolute;
          white-space: pre;
          cursor: text;
          transform-origin: 0% 0%;
        }
        .textLayer span::selection {
          background: rgba(0, 184, 148, 0.3) !important;
        }
      `}</style>
    </div>
  );
}

export default function App({
  onBackToPortal,
  isDark: propIsDark,
  toggleDark: propToggleDark,
  user,
  role
}: {
  onBackToPortal?: () => void;
  isDark?: boolean;
  toggleDark?: () => void;
  user?: { email: string; uid: string; id?: string } | null;
  role?: "super_admin" | "teacher" | "student";
}) {
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('light');
  const theme = propIsDark !== undefined ? (propIsDark ? 'dark' : 'light') : localTheme;
  const toggleTheme = () => {
    if (propToggleDark) {
      propToggleDark();
    } else {
      setLocalTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  interface UploadedDocument {
    id: string;
    name: string;
    url: string;
    totalPages: number;
    pdfDoc: any;
  }

  const STATIC_LIBRARY = [
    { "id": "sl-1-1", "title": "Changing Populations SL1.1", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Changing%20Planet%20SL1.1-%20Patterns%20of%20Pop%20&%20Eco%20Dev.pdf", "pages": 48 },
    { "id": "sl-1-2", "title": "Changing Populations SL1.2", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Changing%20Planet%20SL1.2-%20Changing%20Pop%20&%20Places.pdf", "pages": 48 },
    { "id": "sl-1-3", "title": "Changing Populations SL1.3", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Changing%20Planet%20SL1.3-%20Challenges%20&%20Opportunities.pdf", "pages": 28 },
    { "id": "sl-2-1", "title": "Global Climate SL2.1", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Changing%20Planet%20SL2.1-%20Causes%20of%20Global%20Climate%20Change.pdf", "pages": 22 },
    { "id": "sl-2-2", "title": "Global Climate SL2.2", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Changing%20Planet%20SL2.2-%20Consequences%20of%20Climate%20Change.pdf", "pages": 32 },
    { "id": "sl-2-3", "title": "Global Climate SL2.3", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Changing%20Planet%20SL2.3-%20Responding%20to%20Climate%20Change.pdf", "pages": 44 },
    { "id": "sl-3-1", "title": "Global Resource SL3.1", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Changing%20Planet%20SL3.1-%20Global%20Trends%20in%20Consumption.pdf", "pages": 41 },
    { "id": "sl-3-2", "title": "Global Resource SL3.2", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Changing%20Planet%20SL3.2-%20Impacts%20of%20Trends%20in%20Consumption.pdf", "pages": 30 },
    { "id": "sl-3-3", "title": "Global Resource SL3.3", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Changing%20Planet%20SL3.3-%20Resource%20Stewardship.pdf", "pages": 28 },
    { "id": "hl-4-1", "title": "Power, Places & Networks HL4.1", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Connected%20Planet%20HL4.1%20-%20Global%20Interactions%20&%20Global%20Power.pdf", "pages": 37 },
    { "id": "hl-4-2", "title": "Power, Places & Networks HL4.2", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Connected%20Planet%20HL4.2%20-%20Global%20Networks%20&%20Flows.pdf", "pages": 35 },
    { "id": "hl-4-3", "title": "Power, Places & Networks HL4.3", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Connected%20Planet%20HL4.3%20-%20Human%20&%20Physical%20Influences%20on%20Global%20Interactions.pdf", "pages": 44 },
    { "id": "hl-5-1", "title": "Hum Dev & Diversity HL5.1", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Connected%20Planet%20HL5.1%20-%20Development%20Opportunities.pdf", "pages": 45 },
    { "id": "hl-5-2", "title": "Hum Dev & Diversity HL5.2", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Connected%20Planet%20HL5.2%20-%20Changing%20Identities%20&%20Cultures.pdf", "pages": 22 },
    { "id": "hl-5-3", "title": "Hum Dev & Diversity HL5.3", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Connected%20Planet%20HL5.3%20-%20Local%20Responses%20to%20Global%20Interactions.pdf", "pages": 31 },
    { "id": "hl-6-1", "title": "Global Risk HL6.1", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Connected%20Planet%20HL6.1%20-%20Geopolitical%20&%20Economic%20Risks.pdf", "pages": 44 },
    { "id": "hl-6-2", "title": "Global Risk HL6.2", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Connected%20Planet%20HL6.2%20-%20Environmental%20Risks.pdf", "pages": 24 },
    { "id": "hl-6-3", "title": "Global Risk HL6.3", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Connected%20Planet%20HL6.3%20-%20Local%20&%20Global%20Resilience.pdf", "pages": 23 },
    { "id": "opa-fw1", "title": "Freshwater OPA FW1", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Freshwater%20FW1%20-%20Drainage%20Basins.pdf", "pages": 26 },
    { "id": "opa-fw2", "title": "Freshwater OPA FW2", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Freshwater%20FW2%20-%20Flooding%20&%20Flood%20Mitigation.pdf", "pages": 20 },
    { "id": "opa-fw3", "title": "Freshwater OPA FW3", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Freshwater%20FW3%20-%20Water%20Scarcity%20&%20Water%20Quality.pdf", "pages": 39 },
    { "id": "opa-fw4", "title": "Freshwater OPA FW4", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Freshwater%20FW4-%20Water%20Management%20Futures.pdf", "pages": 34 },
    { "id": "opd-gh1", "title": "Geophysical Hazards OPD GH1", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Geohazards%20GH1%20-%20Geophysical%20Systems.pdf", "pages": 25 },
    { "id": "opd-gh2", "title": "Geophysical Hazards OPD GH2", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Geohazards%20GH2%20-%20Geophysical%20Hazard%20Risks.pdf", "pages": 16 },
    { "id": "opd-gh3", "title": "Geophysical Hazards OPD GH3", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Geohazards%20GH3%20-%20Hazard%20Risk%20&%20Vulnerability.pdf", "pages": 33 },
    { "id": "opd-gh4", "title": "Geophysical Hazards OPD GH4", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Geohazards%20GH4-%20Future%20Resilience%20&%20Adaption.pdf", "pages": 13 },
    { "id": "ope-lt1", "title": "Leisure, Tourism & Sport OPE LT1", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Leisure,%20Tourism%20&%20Sport%20LT3%20-%20Tou%20&%20Sport%20at%20International%20Level.pdf", "pages": 38 },
    { "id": "ope-lt2", "title": "Leisure, Tourism & Sport OPE LT2", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Leisure,%20Tourism%20&%20Sport%20LT2%20-%20Tou%20&%20Spo%20at%20Local%20&%20Nat%20Level.pdf", "pages": 17 },
    { "id": "ope-lt3", "title": "Leisure, Tourism & Sport OPE LT3", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Leisure,%20Tourism%20&%20Sport%20LT3%20-%20Tou%20&%20Sport%20at%20International%20Level.pdf", "pages": 38 },
    { "id": "ope-lt4", "title": "Leisure, Tourism & Sport OPE LT4", "url": "https://imzvlkwyblzccolbcqem.supabase.co/storage/v1/object/public/Geography%20Textbooks/Our%20Planets%20Leisure,%20Tourism%20&%20Sport%20LT4%20-%20Managing%20Tourism%20&%20Sport%20for%20the%20Future.pdf", "pages": 23 }
  ];

  // State
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>(() => {
    return STATIC_LIBRARY.map(item => ({
      id: item.id,
      name: item.title,
      url: item.url,
      totalPages: item.pages || 30,
      pdfDoc: null
    }));
  });
  const [activeDocIndex, setActiveDocIndex] = useState<number | null>(0); // Default selection: "Core: Our Changing Planet (Codrington)" at index 0
  const [activePage, setActivePage] = useState(1);
  const [pageInputVal, setPageInputVal] = useState("1");

  useEffect(() => {
    setPageInputVal(activePage.toString());
  }, [activePage]);

  const [addPostitMode, setAddPostitMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedNoteId, setHighlightedNoteId] = useState<number | null>(null);

  // PDF Loading State
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper variables derived from active document
  const currentDoc = activeDocIndex !== null ? uploadedDocs[activeDocIndex] : null;
  const pdfDoc = currentDoc ? currentDoc.pdfDoc : null;
  const pdfUrl = currentDoc ? currentDoc.url : null;
  const totalPages = currentDoc ? currentDoc.totalPages : 0;
  const selectedDoc = currentDoc ? currentDoc.name : "";

  // Load PDF info dynamically when currentDoc selection changes
  useEffect(() => {
    if (!pdfUrl) return;
    if (currentDoc && currentDoc.pdfDoc) return; // already loaded

    let active = true;
    setLoadingPdf(true);

    const targetUrl = pdfUrl.startsWith('http') ? `https://api.allorigins.win/raw?url=${encodeURIComponent(pdfUrl)}` : pdfUrl;
    pdfjsLib.getDocument(targetUrl).promise
      .then((pdf) => {
        if (!active) return;
        setUploadedDocs(prev => prev.map(doc => 
          doc.url === pdfUrl 
            ? { ...doc, totalPages: pdf.numPages, pdfDoc: pdf } 
            : doc
        ));
      })
      .catch((err) => {
        console.error("Failed to load PDF info dynamically:", err);
      })
      .finally(() => {
        if (active) setLoadingPdf(false);
      });

    return () => {
      active = false;
    };
  }, [pdfUrl, currentDoc]);


  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // Helper to persist bookmarks to localStorage
  const saveBookmarksToStorage = (newBookmarks: BookmarkItem[]) => {
    if (user) {
      const userId = user.uid || user.id || 'guest';
      localStorage.setItem(`textbook_bookmarks_${userId}`, JSON.stringify(newBookmarks));
    }
  };

  // Load user bookmarks from localStorage (mock database save)
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }
    const userId = user.uid || user.id || 'guest';
    const saved = localStorage.getItem(`textbook_bookmarks_${userId}`);
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        setBookmarks([]);
      }
    } else {
      setBookmarks([]);
    }
  }, [user]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF textbook file.");
      return;
    }

    setLoadingPdf(true);

    // Bypassing real server POST and using local reader with simulated 1.5-second database save delay
    setTimeout(async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const localUrl = URL.createObjectURL(file);
        const newDoc: UploadedDocument = {
          id: `local-${Date.now()}`,
          name: file.name,
          url: localUrl,
          totalPages: pdf.numPages,
          pdfDoc: pdf,
        };

        setUploadedDocs(prev => {
          const nextDocs = [...prev, newDoc];
          setActiveDocIndex(nextDocs.length - 1);
          return nextDocs;
        });

        setActivePage(1);
      } catch (err: any) {
        console.error("Failed to parse PDF locally:", err);
        alert("Failed to process PDF: " + err.message);
      } finally {
        setLoadingPdf(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }, 1500);
  };

  const handleDeleteTextbook = async (docName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${docName}"? This will also delete all bookmarks attached to this textbook.`)) {
      return;
    }

    try {
      // Try to delete from server, but ignore failure for local-only testing robustness
      await fetch(`/api/textbooks/${encodeURIComponent(docName)}`, {
        method: "DELETE",
      }).catch(err => console.warn("Failed to delete textbook from server:", err));

      setUploadedDocs(prev => {
        const next = prev.filter(d => d.name !== docName);
        if (next.length === 0) {
          setActiveDocIndex(null);
        } else {
          setActiveDocIndex(0);
        }
        return next;
      });
      setActivePage(1);

      setBookmarks(prev => prev.filter(b => b.docName !== docName));
    } catch (err: any) {
      console.error(err);
      alert("Error deleting textbook: " + err.message);
    }
  };

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [tempCoords, setTempCoords] = useState<{ x: number; y: number; page: number } | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(null);
  const [editText, setEditText] = useState("");

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  const onLoadSuccess = () => {
    setLoadingPdf(false);
  };

  // Navigate to page
  const handleJumpToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPageCount) {
      setActivePage(pageNum);
    }
  };

  const totalPageCount = totalPages;

  const handleNextPage = () => {
    if (!isPageLoading && activePage < totalPageCount) {
      setIsPageLoading(true);
      setActivePage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (!isPageLoading && activePage > 1) {
      setIsPageLoading(true);
      setActivePage(prev => Math.max(1, prev - 1));
    }
  };

  const handlePageSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(e.currentTarget.value);
      if (!isNaN(val) && val >= 1 && val <= totalPageCount) {
        handleJumpToPage(val);
      } else {
        setPageInputVal(activePage.toString());
      }
    }
  };


  // Canvas interaction click handler to place post-it
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageNum: number) => {
    if (!addPostitMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercentage = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercentage = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.round(xPercentage);
    const y = Math.round(yPercentage);

    setTempCoords({ x, y, page: pageNum });
    setNewNoteText("");
    setShowCreateModal(true);
  };

  // Save new post-it bookmark
  const handleSaveNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !tempCoords) return;

    const newBookmark: BookmarkItem = {
      id: Date.now(),
      docName: selectedDoc,
      page: tempCoords.page,
      x: tempCoords.x,
      y: tempCoords.y,
      note: newNoteText.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setBookmarks(prev => {
      const next = [...prev, newBookmark];
      saveBookmarksToStorage(next);
      return next;
    });

    setShowCreateModal(false);
    setTempCoords(null);
    setNewNoteText("");
    setAddPostitMode(false); // disable add mode after adding
  };

  // Edit bookmark click handler
  const handleOpenEdit = (bookmark: BookmarkItem) => {
    setEditingBookmark(bookmark);
    setEditText(bookmark.note);
    setShowEditModal(true);
  };

  // Save edited bookmark
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBookmark || !editText.trim()) return;

    setBookmarks(prev => {
      const next = prev.map(b => b.id === editingBookmark.id ? { ...b, note: editText.trim() } : b);
      saveBookmarksToStorage(next);
      return next;
    });

    setShowEditModal(false);
    setEditingBookmark(null);
    setEditText("");
  };

  // Delete bookmark
  const handleDeleteNote = (id: number) => {
    setBookmarks(prev => {
      const next = prev.filter(b => b.id !== id);
      saveBookmarksToStorage(next);
      return next;
    });

    if (editingBookmark?.id === id) {
      setShowEditModal(false);
      setEditingBookmark(null);
    }
  };

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter(b => {
    if (b.docName !== selectedDoc) return false;
    const searchLower = searchQuery.toLowerCase();
    return b.note.toLowerCase().includes(searchLower) || b.page.toString().includes(searchLower);
  }).sort((a, b) => a.page - b.page);

  // Trigger brief highlight on note when clicking sidebar card
  const handleSelectBookmarkCard = (b: BookmarkItem) => {
    handleJumpToPage(b.page);
    setHighlightedNoteId(b.id);
    setTimeout(() => {
      setHighlightedNoteId(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 py-4 px-6 md:px-8 flex items-center justify-between transition-colors duration-300 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#00b894] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white leading-none">Geo Textbook Viewer</h1>
              <span className="text-[9px] bg-emerald-550/10 dark:bg-[#00b894]/10 text-[#00b894] border border-[#00b894]/25 px-2 py-0.5 rounded-full font-bold uppercase">STUDIO</span>
            </div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-1">DP Geography Annotation Engine</p>
          </div>
        </div>

        {/* Central Inputs and Controls */}
        <div className="hidden md:flex items-center gap-6 bg-slate-100/60 dark:bg-slate-900/60 px-5 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
          
          {/* Document Dropdown and Page Count */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              {uploadedDocs.length === 0 ? (
                <select
                  disabled
                  className="bg-transparent text-xs font-bold text-slate-400 dark:text-slate-650 focus:outline-none cursor-not-allowed uppercase"
                >
                  <option value="">No Textbooks Loaded</option>
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <select
                    value={activeDocIndex !== null ? activeDocIndex : ""}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      setActiveDocIndex(idx);
                      setActivePage(1);
                      setIsPageLoading(false); // Clear any lingering button locks
                    }}
                    className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-205 focus:outline-none cursor-pointer uppercase max-w-[170px] truncate"
                  >
                    {uploadedDocs.map((doc, idx) => (
                      <option key={idx} value={idx}>{doc.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              PAGE {uploadedDocs.length === 0 ? "" : activePage} OF {totalPageCount}
            </span>
          </div>

          {/* Add Post-it Toggle Switch */}
          <div className="flex items-center gap-2.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Add Post-it Mode</span>
            <button 
              onClick={() => setAddPostitMode(!addPostitMode)}
              disabled={uploadedDocs.length === 0}
              className={`w-10 h-5.5 rounded-full relative transition-all duration-300 ${uploadedDocs.length === 0 ? 'opacity-40 cursor-not-allowed bg-slate-350 dark:bg-slate-750' : addPostitMode ? 'bg-[#00b894]' : 'bg-slate-350 dark:bg-slate-750'}`}
            >
              <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all duration-300 shadow-md ${addPostitMode ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* User Portal Action & Theme Toggles */}
        <div className="flex items-center space-x-4">

          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#00b894] transition-all cursor-pointer"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="px-5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-red-500/10 hover:border-red-500/20 text-slate-500 dark:text-red-400 text-[10px] font-black uppercase rounded-xl tracking-wider transition-all cursor-pointer"
            >
              EXIT
            </button>
          )}
        </div>
      </header>

      {/* Main Split-Screen Layout */}
      <div className="flex-grow flex flex-row overflow-hidden relative">

        {/* MOBILE CONTROLS STRIP (Only visible on small devices) */}
        <div className="absolute top-0 inset-x-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex md:hidden items-center justify-between z-30 transition-colors">
          {uploadedDocs.length === 0 ? (
            <select
              disabled
              className="bg-transparent text-[10px] font-bold text-slate-400 dark:text-slate-650 focus:outline-none cursor-not-allowed uppercase"
            >
              <option value="">No Textbooks Loaded</option>
            </select>
          ) : (
            <div className="flex items-center gap-1">
              <select
                value={activeDocIndex !== null ? activeDocIndex : ""}
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  setActiveDocIndex(idx);
                  setActivePage(1);
                  setIsPageLoading(false); // Clear any lingering button locks
                }}
                className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none max-w-[110px] truncate uppercase cursor-pointer"
              >
                {uploadedDocs.map((doc, idx) => (
                  <option key={idx} value={idx}>{doc.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-slate-400 uppercase">ADD NOTE</span>
            <button 
              onClick={() => setAddPostitMode(!addPostitMode)}
              disabled={uploadedDocs.length === 0}
              className={`w-8 h-5 rounded-full relative transition-all duration-300 ${uploadedDocs.length === 0 ? 'opacity-40 cursor-not-allowed bg-slate-350 dark:bg-slate-750' : addPostitMode ? 'bg-[#00b894]' : 'bg-slate-350 dark:bg-slate-750'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${addPostitMode ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black w-12 text-center text-slate-700 dark:text-slate-200 font-sans">p. {activePage}/{totalPageCount}</span>
          </div>
        </div>

        {/* LEFT PANEL: Canvas/Viewer */}
        <div 
          className="flex-1 p-6 md:p-12 bg-slate-150 dark:bg-slate-900/40 flex items-center mt-9 md:mt-0 justify-center overflow-hidden relative"
        >
          {pdfUrl && (
            <>
              {/* Floating Left Arrow */}
              <button 
                onClick={handlePrevPage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-emerald-50 text-emerald-800 p-4 rounded-full shadow-2xl transition-all duration-200 z-[99] pointer-events-auto border border-emerald-100 flex items-center justify-center font-bold text-xl min-w-[50px] min-h-[50px]"
              >
                &larr;
              </button>

              {/* Floating Right Arrow */}
              <button 
                onClick={handleNextPage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-emerald-50 text-emerald-800 p-4 rounded-full shadow-2xl transition-all duration-200 z-[99] pointer-events-auto border border-emerald-100 flex items-center justify-center font-bold text-xl min-w-[50px] min-h-[50px]"
              >
                &rarr;
              </button>
            </>
          )}

          {pdfUrl ? (
            <div 
              id={`textbook-page-${activePage}`}
              className="w-full max-w-[950px] h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl hover:shadow-2xl relative transition-all duration-300 flex flex-col justify-between selection:bg-[#00b894]/25 select-none"
              style={{ cursor: addPostitMode ? 'cell' : 'default', width: '100%', maxWidth: '950px', height: '92vh', marginTop: 'auto', marginBottom: 'auto' }}
            >
              {/* PDF Page Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                <span className="text-[9px] font-black text-[#00b894] uppercase tracking-widest leading-none truncate max-w-[500px]">
                  {selectedDoc}
                </span>
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black text-slate-400 uppercase">PAGE</span>
                  <span className="text-[9px] font-black text-slate-700 dark:text-slate-200">{activePage}</span>
                </div>
              </div>

              {/* Render Native Single-Page Frame Engine */}
              <div 
                ref={scrollWrapperRef}
                className="viewer-scroll-wrapper relative w-full flex-grow overflow-hidden rounded-b-3xl bg-slate-100 dark:bg-slate-950"
                style={{ position: 'relative', overflow: 'hidden', overflowY: 'hidden', overflowX: 'hidden', width: '100%', height: '100%' }}
              >
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{ height: '100%', width: '100%' }}>
                  {pdfUrl && (
                    <div className="relative max-h-[88vh] w-auto flex items-center justify-center">
                      <img 
                        src={pdfUrl.startsWith('blob:') ? pdfUrl : `https://images.weserv.nl/?url=${encodeURIComponent(pdfUrl)}&page=${activePage - 1}&w=1200&output=png`}
                        className="max-h-[88vh] w-auto object-contain select-none pointer-events-none shadow-2xl rounded-lg"
                        alt={`Textbook Page ${activePage}`}
                        loading="eager"
                        onLoad={() => {
                          setLoadingPdf(false);
                          setIsPageLoading(false);
                        }}
                      />
                      
                      {/* Click-capture transparent overlay when Add Post-it Mode is active */}
                      <div 
                        className="absolute inset-0 w-full h-full z-10"
                        style={{ pointerEvents: addPostitMode ? 'auto' : 'none' }}
                        onClick={(e) => {
                          if (addPostitMode) {
                            handlePageClick(e, activePage);
                          }
                        }}
                      />

                      {/* Absolute Positioned Custom Annotation Overlay Layer */}
                      <div 
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 40, pointerEvents: 'none' }}
                      >
                        {bookmarks
                          .filter(pin => pin.docName === selectedDoc && pin.page === activePage)
                          .map((pin) => {
                            const isHighlighted = highlightedNoteId === pin.id;
                            return (
                              <div 
                                key={pin.id} 
                                className="absolute pointer-events-auto"
                                style={{ 
                                  left: `${pin.x}%`, 
                                  top: `${pin.y}%`, 
                                  transform: 'translate(-50%, -50%)' 
                                }}
                              >
                                <BookmarkPin
                                  data={pin}
                                  isHighlighted={isHighlighted}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(pin);
                                  }}
                                />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 max-w-[960px] h-[calc(100vh-160px)] flex flex-col items-center justify-center border-2 border-dashed border-slate-350 dark:border-slate-850 rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl text-center shrink-0 snap-center transition-all duration-300">
              <div className="w-16 h-16 bg-[#00b894]/10 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-emerald-500/5">
                <Upload className="w-8 h-8 text-[#00b894]" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">No Textbook Loaded</h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
                {role === "student" 
                  ? "No textbooks are currently available in the school's repository. Please contact your Teacher or Admin to upload a DP Geography PDF textbook."
                  : "Please upload a DP Geography PDF textbook to begin reading and pinning study notes."
                }
              </p>
              {role !== "student" && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-[#00b894] hover:bg-[#009e80] text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Upload PDF Textbook
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Study Studio Sidebar */}
        <aside className="w-[360px] border-l border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col justify-between shrink-0 h-full relative z-20 transition-colors duration-300">
          
          <div className="p-6 border-b border-slate-150 dark:border-slate-900 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <div className="w-1.5 h-3.5 bg-[#00b894] rounded-full" /> Study Studio
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 bg-[#00b894]/10 text-[#00b894] border border-[#00b894]/20 rounded-md uppercase">
                {bookmarks.length} Notes
              </span>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search bookmarks & pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:border-[#00b894] focus:ring-1 focus:ring-[#00b894] outline-none rounded-xl text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-600 transition-all uppercase tracking-wide"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Bookmarks List Container */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {filteredBookmarks.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/20">
                <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">No saved bookmarks found</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1 px-4 leading-normal">
                  {addPostitMode 
                    ? "Click anywhere on the textbook pages on the left to add a post-it note." 
                    : "Toggle 'Add Post-it Mode' on the top navbar to begin bookmarking pages."}
                </p>
              </div>
            ) : (
              filteredBookmarks.map((b) => (
                <div 
                  key={b.id}
                  onClick={() => handleSelectBookmarkCard(b)}
                  className="p-4 bg-slate-50 dark:bg-slate-900/40 hover:bg-[#00b894]/5 border border-slate-200 dark:border-slate-900 hover:border-[#00b894]/30 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-3 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-450/10 text-yellow-700 dark:text-yellow-400 font-black text-[9px] rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                      PAGE {b.page}
                    </span>
                    <span className="text-[8px] font-bold text-slate-450 font-mono">{b.createdAt}</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 line-clamp-2 leading-relaxed">
                    {b.note}
                  </p>

                  <div className="flex justify-end gap-1.5 border-t border-slate-100 dark:border-slate-850/50 pt-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent jumping to page
                        handleOpenEdit(b);
                      }}
                      className="p-1 text-slate-450 hover:text-[#00b894] transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-900"
                      title="Edit Note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent jumping to page
                        handleDeleteNote(b.id);
                      }}
                      className="p-1 text-slate-450 hover:text-red-550 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-900"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Help Footer */}
          <div className="p-6 border-t border-slate-150 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/80 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 text-[#00b894]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Studio Instruction</p>
                <p className="text-[10px] font-bold text-slate-650 dark:text-slate-450 mt-0.5 leading-snug">
                  Toggle post-it mode, click page content to pin comments, click cards to jump to page.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* CREATE POST-IT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 flex items-center gap-2">
                  <Bookmark className="w-4.5 h-4.5 text-[#00b894]" /> Add Post-it Annotation
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 bg-yellow-100 dark:bg-yellow-450/10 text-yellow-700 dark:text-yellow-400 rounded-md">
                  PAGE {tempCoords?.page} (X: {tempCoords?.x}%, Y: {tempCoords?.y}%)
                </span>
              </div>

              <form onSubmit={handleSaveNewNote} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Note Annotation Text</label>
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    required
                    rows={3}
                    placeholder="Write key syllabus connections, essay ideas, or terminology definitions..."
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-[#00b894] outline-none text-xs font-semibold leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setTempCoords(null);
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#00b894] hover:bg-[#009e80] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
                  >
                    <Plus className="w-4 h-4" /> Save Annotation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT POST-IT MODAL */}
      <AnimatePresence>
        {showEditModal && editingBookmark && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 flex items-center gap-2">
                  <Edit3 className="w-4.5 h-4.5 text-[#00b894]" /> Edit Annotation Note
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 bg-yellow-100 dark:bg-yellow-450/10 text-yellow-700 dark:text-yellow-400 rounded-md">
                  PAGE {editingBookmark.page}
                </span>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Note Annotation Text</label>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    required
                    rows={3}
                    placeholder="Write key syllabus connections, essay ideas, or terminology definitions..."
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-[#00b894] outline-none text-xs font-semibold leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(editingBookmark.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Note
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingBookmark(null);
                      }}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#00b894] hover:bg-[#009e80] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {pdfUrl && activePage < totalPageCount && (
        <link 
          rel="prefetch" 
          href={pdfUrl.startsWith('blob:') ? pdfUrl : `https://images.weserv.nl/?url=${encodeURIComponent(pdfUrl)}&page=${activePage}&w=1200&output=png`} 
        />
      )}
    </div>
  );
}
