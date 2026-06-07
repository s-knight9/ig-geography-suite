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
// @ts-ignore
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface BookmarkItem {
  id: number;
  page: number;
  x: number; // percentage width
  y: number; // percentage height
  note: string;
  createdAt: string;
}

const MOCK_PAGES_DATA = [
  {
    num: 1,
    title: "Unit 4: Global Interactions & Climate Change",
    subtitle: "4.1 Overview of Global Networks and Flows",
    content: "Global interactions represent the complex ways in which countries, businesses, and individuals connect across borders. In the 21st century, these networks are accelerated by rapid technological innovations, transport containerization, and the relaxation of trade tariffs. Geography studies these spatial patterns to assess their socioeconomic impacts on core and periphery regions."
  },
  {
    num: 2,
    title: "4.1.2 Transport Systems and Shrinking Space",
    subtitle: "The Role of Containerization in Global Trade",
    content: "The concept of 'shrinking space' refers to the relative reduction in travel time between places due to transport innovations. Modern container ships transport thousands of TEUs (Twenty-foot Equivalent Units) daily, dramatically lowering shipping costs. This has enabled transnational corporations (TNCs) to distribute supply chains across multiple low-income countries."
  },
  {
    num: 3,
    title: "4.2 Global Migration and Spatial Shifts",
    subtitle: "Push and Pull Factors in Rural-Urban Migration",
    content: "Migration streams are driven by complex disparities in regional wealth, security, and climate resilience. Rural areas face growing stress from agricultural degradation and drought, prompting urban-ward migration. Conversely, global core cities act as migration magnets, offering diverse jobs, tertiary education, and hub transport access."
  },
  {
    num: 4,
    title: "4.2.2 Case Study: Southern European Migration Streams",
    subtitle: "Analysis of Transnational Labor Movements",
    content: "Recent migration patterns across Mediterranean routes highlight the geopolitical challenges of regional integration. Data shows a 14% increase in transit movements driven by sub-Saharan environmental displacement. These flows require cooperative border frameworks, yet spark debates regarding humanitarian resource distribution and national sovereignty."
  },
  {
    num: 5,
    title: "4.3 Core and Periphery Spatial Dynamics",
    subtitle: "Friedmann's Regional Development Theory",
    content: "John Friedmann's core-periphery model divides space into an urban industrial core, which dominates economic power, and a resource-supplying periphery. The core thrives on high-value processing, intellectual property, and political decision-making, while drawing labor, raw minerals, and primary foods from the dependent peripheral zones."
  },
  {
    num: 6,
    title: "4.3.2 Backwash Effects and Spread Dynamics",
    subtitle: "Cumulative Causation in Spatial Networks",
    content: "Myrdal's cumulative causation theory explains how initial regional advantages trigger positive feedback loops, attracting capital and talent away from less developed areas (backwash effect). Over time, spread effects may distribute development outwards as core regions experience rising labor costs, land congestion, and high local tax rates."
  },
  {
    num: 7,
    title: "4.4 Environmental Impacts of Global Trade",
    subtitle: "Carbon Footprints and Supply Chain Offshoring",
    content: "The expansion of global trade increases global greenhouse gas emissions through international shipping and aviation. Furthermore, carbon offshoring allows high-income countries to decrease domestic emissions by moving carbon-intensive manufacturing to developing nations, masking the true environmental cost of core consumption."
  },
  {
    num: 8,
    title: "4.4.2 Case Study: Greenhouse Gas Trends",
    subtitle: "Emissions Calibrated across Global Ports",
    content: "A study of carbon emissions at major shipping terminals (Shanghai, Rotterdam, LA) shows that container terminal operations account for over 5% of regional carbon output. Port electrification and alternative clean fuels (like green ammonia) represent critical mitigation strategies for sustainable maritime transport."
  },
  {
    num: 9,
    title: "4.5 Transnational Corporations (TNCs) and Globalization",
    subtitle: "Spatial Division of Labor and Global Production Networks",
    content: "TNCs play a pivotal role in organizing global space. By establishing headquarters in global core cities (New York, Tokyo, London) and offshoring manufacturing to special economic zones (SEZs), they maximize efficiency. This spatial division of labor reshapes local labor markets, often creating hyper-specialized manufacturing hubs."
  },
  {
    num: 10,
    title: "4.5.2 Glocalization Strategies",
    subtitle: "Adapting Global Commodities for Local Markets",
    content: "Glocalization is the process where global corporations adapt products to suit local cultural and legal requirements. This strategy enables TNCs to maximize market penetration. Examples include customized fast food menus, language-localized streaming libraries, and vehicle specifications tailored to local regulatory standards."
  },
  {
    num: 11,
    title: "4.6 Global Core-Periphery Shift",
    subtitle: "The Rise of Semi-Peripheral Powerhouses",
    content: "In recent decades, regions historically categorized as periphery have shifted to the semi-periphery. Nations like China, India, and Brazil now host global manufacturing hubs, research clusters, and sovereign wealth networks. This shift challenges traditional Western hegemony and introduces multipolar political dimensions."
  },
  {
    num: 12,
    title: "4.6.2 Conceptualizing Core-Periphery Shifts",
    subtitle: "Diagrammatic Breakdown of Global Capital Flows",
    content: "The global core-periphery model is dynamic rather than static. Capital flows loop back from core corporations to peripheral factories as investments, while raw resource revenues flow back to core sovereign networks. Understanding these loops is essential for students assessing international aid efficacy and debt dependencies."
  },
  {
    num: 13,
    title: "4.7 Civil Society Responses to Globalization",
    subtitle: "Anti-Globalization Movements and Localism",
    content: "Civil society groups frequently organize to contest the socioeconomic disruptions caused by global interactions. Localist movements advocate for regional agricultural production, ethical fair-trade certification, and community land trusts. These efforts aim to protect local cultural heritage and reduce reliance on vulnerable global networks."
  },
  {
    num: 14,
    title: "4.7.2 Fair-Trade Networks as Alternative Flows",
    subtitle: "Redistributing Power within Agricultural Supply Chains",
    content: "Fair-trade networks establish direct ties between small-scale agricultural cooperatives in peripheral nations and ethical retailers in core markets. By guaranteeing minimum prices and social premiums, fair-trade mitigates the price volatility of global commodity markets, supporting sustainable regional development."
  },
  {
    num: 15,
    title: "4.8 Synthesis and Summary review",
    subtitle: "Key Core and Periphery takeaways",
    content: "Syllabus synthesis requires students to evaluate how global networks link to localized changes. Success in Paper 2 and Paper 3 essays relies on drawing clean theoretical maps connecting TNC strategies, migration streams, transport costs, and local civil society environmental pushback."
  }
];

interface PDFPageRendererProps {
  pdfDoc: any;
  pageNum: number;
}

function PDFPageRenderer({ pdfDoc, pageNum }: PDFPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const textLayerInstanceRef = useRef<any>(null);

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
    <div className="relative w-full h-auto flex flex-col items-center overflow-hidden rounded-b-3xl">
      <canvas ref={canvasRef} className="w-full h-auto object-contain" />
      <div 
        ref={textLayerRef} 
        className="textLayer absolute inset-0 pointer-events-auto select-text overflow-hidden" 
        style={{
          lineHeight: 1.0,
          opacity: 1,
        }}
      />
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
  toggleDark: propToggleDark
}: {
  onBackToPortal?: () => void;
  isDark?: boolean;
  toggleDark?: () => void;
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

  // State
  const [selectedDoc, setSelectedDoc] = useState("Global Interactions & Climate Change Report");
  const [activePage, setActivePage] = useState(1);
  const [addPostitMode, setAddPostitMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedNoteId, setHighlightedNoteId] = useState<number | null>(null);

  // PDF Loading State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [useNativeViewer, setUseNativeViewer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF textbook file.");
      return;
    }

    setLoadingPdf(true);
    setSelectedDoc(file.name);

    try {
      // Clean up previous Object URL to prevent memory leaks
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      const newUrl = URL.createObjectURL(file);
      setPdfUrl(newUrl);

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);

      // Auto-fallback: check if the first page contains text layer items
      try {
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        const hasText = textContent.items && textContent.items.length > 0;
        setUseNativeViewer(!hasText);
      } catch (err) {
        console.error("Failed to extract text content, falling back to native iframe:", err);
        setUseNativeViewer(true);
      }

      setActivePage(1);
      setBookmarks([]);
    } catch (err: any) {
      console.error("Failed to parse PDF:", err);
      alert("Failed to parse PDF: " + err.message);
    } finally {
      setLoadingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [tempCoords, setTempCoords] = useState<{ x: number; y: number; page: number } | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(null);
  const [editText, setEditText] = useState("");

  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Navigate to page
  const handleJumpToPage = (pageNum: number) => {
    const pageElement = document.getElementById(`textbook-page-${pageNum}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      setActivePage(pageNum);
    }
  };

  const totalPageCount = pdfDoc ? totalPages : 15;

  // Left panel scroll listener to update active page input automatically
  const handleLeftPanelScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const containerWidth = container.clientWidth;
    
    // Find which page is closest to the middle of the viewport
    let closestPage = 1;
    let minDistance = Infinity;

    for (let i = 1; i <= totalPageCount; i++) {
      const pageEl = document.getElementById(`textbook-page-${i}`);
      if (pageEl) {
        const offsetLeft = pageEl.offsetLeft - container.offsetLeft;
        const distance = Math.abs(offsetLeft - scrollPosition);
        if (distance < minDistance) {
          minDistance = distance;
          closestPage = i;
        }
      }
    }
    
    if (closestPage !== activePage) {
      setActivePage(closestPage);
    }
  };

  // Canvas interaction click handler to place post-it
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageNum: number) => {
    if (!addPostitMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    // Calculate percentage coords relative to the page div container
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

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
      page: tempCoords.page,
      x: tempCoords.x,
      y: tempCoords.y,
      note: newNoteText.trim(),
      createdAt: new Date().toLocaleTimeString()
    };

    setBookmarks(prev => [...prev, newBookmark]);
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

    setBookmarks(prev => prev.map(b => b.id === editingBookmark.id ? { ...b, note: editText.trim() } : b));
    setShowEditModal(false);
    setEditingBookmark(null);
    setEditText("");
  };

  // Delete bookmark
  const handleDeleteNote = (id: number) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    if (editingBookmark?.id === id) {
      setShowEditModal(false);
      setEditingBookmark(null);
    }
  };

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter(b => {
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
          
          {/* Document Dropdown */}
          <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-4">
            <FileText className="w-4 h-4 text-emerald-500" />
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer uppercase max-w-[200px] truncate"
            >
              <option value="Global Interactions & Climate Change Report">Global Interactions & Climate Change</option>
              <option value="Syllabus Core Concepts Review">Syllabus Core Concepts Review</option>
              <option value="Mediterranean Migration Dossier">Mediterranean Migration Dossier</option>
              {pdfDoc && <option value={selectedDoc}>{selectedDoc}</option>}
            </select>
          </div>

          {/* Page Selector Inputs */}
          <div className="flex items-center gap-3 border-r border-slate-200 dark:border-slate-800 pr-4">
            <button 
              onClick={() => handleJumpToPage(Math.max(1, activePage - 1))}
              disabled={activePage === 1}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase">PAGE</span>
              <input
                type="number"
                min={1}
                max={totalPageCount}
                value={activePage}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 1 && val <= totalPageCount) handleJumpToPage(val);
                }}
                className="w-10 text-center py-0.5 text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:border-[#00b894] outline-none"
              />
              <span className="text-[10px] font-black text-slate-400">OF {totalPageCount}</span>
            </div>
            <button 
              onClick={() => handleJumpToPage(Math.min(totalPageCount, activePage + 1))}
              disabled={activePage === totalPageCount}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Add Post-it Toggle Switch */}
          <div className="flex items-center gap-2.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Add Post-it Mode</span>
            <button 
              onClick={() => setAddPostitMode(!addPostitMode)}
              className={`w-10 h-5.5 rounded-full relative transition-all duration-300 ${addPostitMode ? 'bg-[#00b894]' : 'bg-slate-350 dark:bg-slate-750'}`}
            >
              <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all duration-300 shadow-md ${addPostitMode ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* User Portal Action & Theme Toggles */}
        <div className="flex items-center space-x-4">
          {pdfUrl && (
            <button
              onClick={() => setUseNativeViewer(!useNativeViewer)}
              className="px-3.5 py-2 bg-[#00b894]/10 hover:bg-[#00b894]/20 border border-[#00b894]/30 text-[#00b894] text-[10px] font-black uppercase rounded-xl tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Toggle between Interactive Studio and Native Browser PDF Viewer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{useNativeViewer ? "Use Studio Mode" : "Use Native Mode"}</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loadingPdf}
            className="px-3.5 py-2 bg-[#00b894]/10 hover:bg-[#00b894]/20 border border-[#00b894]/30 text-[#00b894] text-[10px] font-black uppercase rounded-xl tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
            title="Upload Textbook PDF"
          >
            {loadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{loadingPdf ? 'Loading...' : 'Upload PDF'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />

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
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none max-w-[140px] truncate uppercase"
          >
            <option value="Global Interactions & Climate Change Report">Global Interactions & Climate Change</option>
            <option value="Syllabus Core Concepts Review">Syllabus Core Concepts Review</option>
            <option value="Mediterranean Migration Dossier">Mediterranean Migration Dossier</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-slate-400 uppercase">ADD NOTE</span>
            <button 
              onClick={() => setAddPostitMode(!addPostitMode)}
              className={`w-8 h-5 rounded-full relative transition-all duration-300 ${addPostitMode ? 'bg-[#00b894]' : 'bg-slate-350 dark:bg-slate-750'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${addPostitMode ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => handleJumpToPage(Math.max(1, activePage - 1))}
              disabled={activePage === 1}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-black w-12 text-center text-slate-700 dark:text-slate-200 font-sans">p. {activePage}/{totalPageCount}</span>
            <button 
              onClick={() => handleJumpToPage(Math.min(totalPageCount, activePage + 1))}
              disabled={activePage === totalPageCount}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* LEFT PANEL: Canvas/Viewer */}
        <div 
          onScroll={handleLeftPanelScroll}
          className="flex-1 overflow-x-auto overflow-y-hidden p-6 md:p-12 bg-slate-150 dark:bg-slate-900/40 custom-scrollbar flex flex-row items-center gap-12 snap-x snap-mandatory mt-9 md:mt-0"
        >
          {useNativeViewer && pdfUrl ? (
            <div className="w-full max-w-[760px] h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shrink-0 snap-center">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-none"
                title="PDF Native Viewer"
              />
            </div>
          ) : pdfDoc ? (
            Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const pageBookmarks = bookmarks.filter(b => b.page === pageNum);

              return (
                <div 
                  key={pageNum} 
                  id={`textbook-page-${pageNum}`}
                  className="w-full max-w-[760px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl hover:shadow-2xl relative transition-all duration-300 flex flex-col justify-between selection:bg-[#00b894]/25 select-none overflow-hidden shrink-0 snap-center"
                  onClick={(e) => handlePageClick(e, pageNum)}
                  style={{ cursor: addPostitMode ? 'cell' : 'default' }}
                >
                  {/* PDF Page Header */}
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="text-[9px] font-black text-[#00b894] uppercase tracking-widest leading-none truncate max-w-[500px]">
                      {selectedDoc}
                    </span>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-black text-slate-400 uppercase">PAGE</span>
                      <span className="text-[9px] font-black text-slate-700 dark:text-slate-200">{pageNum}</span>
                    </div>
                  </div>

                  {/* Render Canvas */}
                  <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                    <PDFPageRenderer pdfDoc={pdfDoc} pageNum={pageNum} />
                  </div>

                  {/* Absolute overlay layer for Bookmarks / Post-its */}
                  <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
                    {pageBookmarks.map((b) => {
                      const isHighlighted = highlightedNoteId === b.id;

                      return (
                        <div
                          key={b.id}
                          className="absolute pointer-events-auto group/pin cursor-pointer font-sans"
                          style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}
                          onClick={(e) => {
                            e.stopPropagation(); // prevent adding new post-it on top
                            handleOpenEdit(b);
                          }}
                        >
                          {/* Post-it Badge Icon */}
                          <div 
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                              isHighlighted 
                                ? 'bg-yellow-400 text-slate-950 scale-125 animate-bounce ring-4 ring-[#00b894]' 
                                : 'bg-yellow-300 dark:bg-yellow-400/90 text-slate-800 hover:bg-yellow-400 hover:scale-115'
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
              );
            })
          ) : (
            MOCK_PAGES_DATA.map((page) => {
              const pageBookmarks = bookmarks.filter(b => b.page === page.num);

              return (
                <div 
                  key={page.num} 
                  id={`textbook-page-${page.num}`}
                  className="w-full max-w-[760px] aspect-[1/1.4] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl hover:shadow-2xl relative transition-all duration-300 flex flex-col justify-between selection:bg-[#00b894]/25 select-none shrink-0 snap-center"
                  onClick={(e) => handlePageClick(e, page.num)}
                  style={{ cursor: addPostitMode ? 'cell' : 'default' }}
                >
                  
                  {/* PDF Page Header */}
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="text-[9px] font-black text-[#00b894] uppercase tracking-widest leading-none">
                      {selectedDoc}
                    </span>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-black text-slate-400 uppercase">PAGE</span>
                      <span className="text-[9px] font-black text-slate-700 dark:text-slate-200">{page.num}</span>
                    </div>
                  </div>

                  {/* Page Content */}
                  <div className="flex-1 py-10 flex flex-col justify-center space-y-6">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {page.title}
                    </h2>
                    {page.subtitle && (
                      <h3 className="text-xs font-bold text-slate-550 dark:text-[#00b894] tracking-wide leading-none uppercase">
                        {page.subtitle}
                      </h3>
                    )}
                    <p className="text-sm font-medium text-slate-650 dark:text-slate-350 leading-relaxed text-justify">
                      {page.content}
                    </p>

                    {/* Simulated Graphics Box */}
                    <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 mt-4 flex items-center gap-4 transition-colors">
                      <div className="w-10 h-10 bg-[#00b894]/10 rounded-xl flex items-center justify-center shrink-0">
                        <Info className="w-5 h-5 text-[#00b894]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">IB Examiner Concept Connection</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                          Assess processes across spatial networks. Link local impacts to core-periphery dependencies.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PDF Page Footer */}
                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span>IBDP Geography Course Companion</span>
                    <span>© Oxford Publishing</span>
                  </div>

                  {/* Absolute overlay layer for Bookmarks / Post-its */}
                  <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
                    {pageBookmarks.map((b) => {
                      const isHighlighted = highlightedNoteId === b.id;

                      return (
                        <div
                          key={b.id}
                          className="absolute pointer-events-auto group/pin cursor-pointer font-sans"
                          style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}
                          onClick={(e) => {
                            e.stopPropagation(); // prevent adding new post-it on top
                            handleOpenEdit(b);
                          }}
                        >
                          {/* Post-it Badge Icon */}
                          <div 
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-350 shadow-lg ${
                              isHighlighted 
                                ? 'bg-yellow-400 text-slate-950 scale-125 animate-bounce ring-4 ring-[#00b894]' 
                                : 'bg-yellow-300 dark:bg-yellow-400/90 text-slate-800 hover:bg-yellow-400 hover:scale-115'
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
              );
            })
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

    </div>
  );
}
