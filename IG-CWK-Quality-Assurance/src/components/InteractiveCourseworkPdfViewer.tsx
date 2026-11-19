import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Printer,
  Tag,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  CwkFeedbackItem,
  RAG_STYLES,
  clampNumber,
  needsCoordinateResolution,
} from '../utils/ragStyles';
import {
  resolveEvaluationCoordinatesWithPdf,
  ResolvedPdfLocation,
} from '../utils/pdfCoordinateResolver';
import {
  fetchCourseworkPdfBytes,
  downloadCourseworkPdf,
  printCourseworkPdf,
  readIncludeMarginTagsPreference,
  writeIncludeMarginTagsPreference,
} from '../utils/annotatedPdfExporter';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface MarginBadgeItem extends CwkFeedbackItem {
  criterionNumber: number;
  criterionTitle: string;
}

export interface PdfJumpRequest {
  itemId: string;
  page: number;
  yPercent: number;
  timestamp: number;
}

interface InteractiveCourseworkPdfViewerProps {
  pdfUrl: string;
  title?: string;
  studentName?: string;
  items: MarginBadgeItem[];
  jumpRequest: PdfJumpRequest | null;
  includeMarginTagsOnPrint?: boolean;
  onToggleIncludeMarginTagsOnPrint?: (checked: boolean) => void;
  onUpdateItemLocation: (
    itemId: string,
    newLocation: CwkFeedbackItem['pdfLocation']
  ) => void;
  onResolvedLocations?: (resolvedMap: Record<string, ResolvedPdfLocation>) => void;
  onSelectBadge?: (item: MarginBadgeItem) => void;
}

interface PdfPageRendererProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  targetWidth: number;
  pageBadges: MarginBadgeItem[];
  includeMarginTagsOnPrint: boolean;
  draggingBadge: {
    id: string;
    page: number;
    xPercent: number;
    yPercent: number;
  } | null;
  highlightedItemId: string | null;
  hoveredItemId: string | null;
  onSetHoveredItemId: (id: string | null) => void;
  onBadgePointerDown: (e: React.PointerEvent<HTMLButtonElement>, item: MarginBadgeItem, pageNum: number) => void;
  onBadgePointerMove: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onBadgePointerUp: (e: React.PointerEvent<HTMLButtonElement>) => void;
  registerPageRef: (pageNum: number, el: HTMLDivElement | null) => void;
}

function PdfPageRenderer({
  pdfDoc,
  pageNumber,
  targetWidth,
  pageBadges,
  includeMarginTagsOnPrint,
  draggingBadge,
  highlightedItemId,
  hoveredItemId,
  onSetHoveredItemId,
  onBadgePointerDown,
  onBadgePointerMove,
  onBadgePointerUp,
  registerPageRef,
}: PdfPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: targetWidth,
    height: Math.round(targetWidth * 1.414),
  });

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const cssScale = targetWidth / baseViewport.width;
        const cssViewport = page.getViewport({ scale: cssScale });
        setSize({ width: cssViewport.width, height: cssViewport.height });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const renderViewport = page.getViewport({ scale: cssScale * dpr });

        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // ignore cancelled task cleanup
          }
        }

        const task = page.render({
          canvas,
          canvasContext: ctx,
          viewport: renderViewport,
        });
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error(`Failed rendering PDF page ${pageNumber}:`, err);
        }
      }
    };

    render();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNumber, targetWidth]);

  const activeDraggedItemOnPage = draggingBadge && draggingBadge.page === pageNumber
    ? pageBadges.find((b) => b.id === draggingBadge.id)
    : null;

  return (
    <div
      ref={(el) => registerPageRef(pageNumber, el)}
      data-page-number={pageNumber}
      className="relative mx-auto bg-white shadow-md border border-slate-300 dark:border-slate-700 shrink-0"
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full select-none"
        style={{ width: `${size.width}px`, height: `${size.height}px` }}
      />

      {/* Coordinate Overlay Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        data-print-margin-tags={includeMarginTagsOnPrint ? 'true' : 'false'}
      >
        {/* Dashed horizontal alignment guide line while dragging */}
        {draggingBadge && draggingBadge.page === pageNumber && activeDraggedItemOnPage && (
          <div
            aria-hidden="true"
            className="print:hidden"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${draggingBadge.yPercent}%`,
              borderTop: `1.5px dashed ${RAG_STYLES[activeDraggedItemOnPage.ragColor].badgeBorder}`,
              pointerEvents: 'none',
              zIndex: 15,
            }}
          />
        )}

        {pageBadges.map((item) => {
          const isDragging = draggingBadge?.id === item.id;
          const xPercent = isDragging ? draggingBadge.xPercent : item.pdfLocation.xPercent;
          const yPercent = isDragging ? draggingBadge.yPercent : item.pdfLocation.yPercent;
          const style = RAG_STYLES[item.ragColor] || RAG_STYLES.amber;
          const isHighlighted = highlightedItemId === item.id;
          const isHovered = hoveredItemId === item.id && !isDragging;

          return (
            <div
              key={item.id}
              data-margin-badge={item.code}
              data-rag-color={item.ragColor}
              className={includeMarginTagsOnPrint ? 'print:block' : 'print:hidden'}
              style={{
                position: 'absolute',
                left: `${xPercent}%`,
                top: `${yPercent}%`,
                transform: 'translateY(-50%)',
                pointerEvents: 'auto',
                zIndex: isDragging ? 50 : isHighlighted ? 40 : isHovered ? 35 : 25,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <button
                type="button"
                onPointerDown={(e) => onBadgePointerDown(e, item, pageNumber)}
                onPointerMove={onBadgePointerMove}
                onPointerUp={onBadgePointerUp}
                onPointerCancel={onBadgePointerUp}
                onMouseEnter={() => onSetHoveredItemId(item.id)}
                onMouseLeave={() => onSetHoveredItemId(null)}
                title={`${item.code} (Page ${pageNumber}) — Drag to reposition`}
                style={{
                  backgroundColor: style.badgeBg,
                  border: `1.5px solid ${style.badgeBorder}`,
                  color: style.badgeText,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-black leading-none shadow-sm select-none touch-none transition-transform ${
                  isDragging
                    ? 'cursor-grabbing scale-110 shadow-lg'
                    : 'cursor-grab hover:scale-105'
                } ${
                  isHighlighted
                    ? 'ring-4 ring-blue-500 scale-125 animate-pulse shadow-lg'
                    : ''
                }`}
              >
                {item.code}
              </button>

              {isHovered && (
                <div
                  role="tooltip"
                  className="print:hidden absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 bg-slate-900 text-white rounded-lg p-2.5 shadow-xl border border-slate-700 pointer-events-none z-50 text-left"
                >
                  <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-slate-700/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 truncate">
                      Criterion {item.criterionNumber}: {item.criterionTitle}
                    </span>
                    <span
                      style={{
                        backgroundColor: style.badgeBg,
                        border: `1px solid ${style.badgeBorder}`,
                        color: style.badgeText,
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 leading-none"
                    >
                      {item.code}
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug text-slate-100 font-medium">
                    {item.text}
                  </p>
                  {item.pdfLocation.anchorQuote && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-700/80 text-[10px] italic text-slate-300 leading-snug">
                      &ldquo;{item.pdfLocation.anchorQuote}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Subtle Page Number Footer */}
      <div className="absolute bottom-1.5 right-2.5 px-1.5 py-0.5 rounded bg-slate-900/60 text-white text-[9px] font-bold pointer-events-none select-none">
        p. {pageNumber}
      </div>
    </div>
  );
}

export default function InteractiveCourseworkPdfViewer({
  pdfUrl,
  title = 'Coursework PDF',
  studentName,
  items,
  jumpRequest,
  includeMarginTagsOnPrint,
  onToggleIncludeMarginTagsOnPrint,
  onUpdateItemLocation,
  onResolvedLocations,
  onSelectBadge,
}: InteractiveCourseworkPdfViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const highlightTimeoutRef = useRef<number | null>(null);
  const resolvedRunKeyRef = useRef<string | null>(null);
  const loadedPdfBytesRef = useRef<Uint8Array | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1);
  const [containerWidth, setContainerWidth] = useState<number>(640);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isPrintingPdf, setIsPrintingPdf] = useState<boolean>(false);
  const [internalIncludeMarginTags, setInternalIncludeMarginTags] = useState<boolean>(
    readIncludeMarginTagsPreference
  );

  const isMarginTagsEnabled =
    includeMarginTagsOnPrint !== undefined ? includeMarginTagsOnPrint : internalIncludeMarginTags;

  const handleToggleMarginTags = useCallback(
    (checked: boolean) => {
      if (onToggleIncludeMarginTagsOnPrint) {
        onToggleIncludeMarginTagsOnPrint(checked);
      } else {
        setInternalIncludeMarginTags(checked);
        writeIncludeMarginTagsPreference(checked);
      }
    },
    [onToggleIncludeMarginTagsOnPrint]
  );

  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const [draggingBadge, setDraggingBadge] = useState<{
    id: string;
    page: number;
    xPercent: number;
    yPercent: number;
  } | null>(null);
  const draggingLatestRef = useRef<{
    id: string;
    page: number;
    xPercent: number;
    yPercent: number;
    moved: boolean;
    startX: number;
    startY: number;
  } | null>(null);

  // Track available pane width for responsive page scaling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateWidth = () => {
      if (el.clientWidth > 0) {
        setContainerWidth(el.clientWidth);
      }
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Load PDF document via pdfjs-dist
  useEffect(() => {
    let active = true;
    let loadedDoc: pdfjsLib.PDFDocumentProxy | null = null;
    loadedPdfBytesRef.current = null;

    const load = async () => {
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);

      try {
        const buffer = await fetchCourseworkPdfBytes(pdfUrl);
        if (!active) return;

        // Clone before pdfjs transfers the buffer to its worker thread
        loadedPdfBytesRef.current = new Uint8Array(buffer.slice(0));

        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const doc = await loadingTask.promise;
        if (!active) {
          doc.destroy().catch(() => {});
          return;
        }
        loadedDoc = doc;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
      } catch (err: any) {
        if (!active) return;
        console.error('InteractiveCourseworkPdfViewer load error:', err);
        setError(err?.message || 'Unable to load PDF document.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
      if (loadedDoc) {
        loadedDoc.destroy().catch(() => {});
      }
    };
  }, [pdfUrl]);

  // Close-reading PDF line coordinate resolver for unresolved or AI-estimated locations
  useEffect(() => {
    if (!pdfDoc || !onResolvedLocations || items.length === 0) return;

    const candidates = items.filter(needsCoordinateResolution);
    if (candidates.length === 0) return;

    const runKey = `${pdfUrl}::${candidates.map((c) => `${c.id}:${c.pdfLocation.anchorQuote ? 1 : 0}`).join('|')}`;
    if (resolvedRunKeyRef.current === runKey) return;
    resolvedRunKeyRef.current = runKey;

    let cancelled = false;
    resolveEvaluationCoordinatesWithPdf(pdfDoc, candidates)
      .then((resolvedMap) => {
        if (cancelled) return;
        const updates: Record<string, ResolvedPdfLocation> = {};
        for (const item of candidates) {
          const loc = resolvedMap[item.id];
          if (!loc) continue;
          const cur = item.pdfLocation;
          const changed =
            loc.page !== cur.page ||
            Math.abs(loc.yPercent - cur.yPercent) > 1.5 ||
            (!cur.anchorQuote && !!loc.anchorQuote) ||
            (!cur.anchorRationale && !!loc.anchorRationale);
          if (changed) {
            updates[item.id] = loc;
          }
        }
        if (Object.keys(updates).length > 0) {
          onResolvedLocations(updates);
        }
      })
      .catch((err) => {
        console.warn('PDF coordinate resolution warning:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pdfUrl, items, onResolvedLocations]);

  const registerPageRef = useCallback((pageNum: number, el: HTMLDivElement | null) => {
    pageRefs.current[pageNum] = el;
  }, []);

  const basePageWidth = useMemo(() => {
    const usable = Math.max(260, containerWidth - 40);
    return Math.round(Math.min(760, usable) * zoom);
  }, [containerWidth, zoom]);

  // Determine current page visible in scroll container
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || numPages === 0) return;

    const containerRect = container.getBoundingClientRect();
    const midY = containerRect.top + containerRect.height * 0.4;

    let closestPage = currentPage;
    let smallestDist = Infinity;

    for (let p = 1; p <= numPages; p++) {
      const el = pageRefs.current[p];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (midY >= rect.top && midY <= rect.bottom) {
        closestPage = p;
        break;
      }
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - midY);
      if (dist < smallestDist) {
        smallestDist = dist;
        closestPage = p;
      }
    }

    if (closestPage !== currentPage) {
      setCurrentPage(closestPage);
    }
  }, [numPages, currentPage]);

  const scrollToPage = useCallback(
    (pageNum: number, yPercent = 10) => {
      if (numPages === 0) return;
      const target = clampNumber(pageNum, 1, numPages);
      const container = scrollContainerRef.current;
      const pageEl = pageRefs.current[target];
      if (!container || !pageEl) return;

      const containerRect = container.getBoundingClientRect();
      const pageRect = pageEl.getBoundingClientRect();
      const yOffsetInPage = (clampNumber(yPercent, 0, 98) / 100) * pageRect.height;
      const deltaFromTop = pageRect.top - containerRect.top + yOffsetInPage;
      const desiredScrollTop = container.scrollTop + deltaFromTop - container.clientHeight / 2;

      container.scrollTo({
        top: Math.max(0, desiredScrollTop),
        behavior: 'smooth',
      });
      setCurrentPage(target);
    },
    [numPages]
  );

  // Handle imperative Jump-to-Location requests from report cards/pills
  useEffect(() => {
    if (!jumpRequest || numPages === 0) return;

    scrollToPage(jumpRequest.page, jumpRequest.yPercent);
    setHighlightedItemId(jumpRequest.itemId);

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedItemId(null);
    }, 1500);

    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [jumpRequest, numPages, scrollToPage]);

  // Active checked badges grouped by page (with clamped page number & live drag override)
  const badgesByPage = useMemo(() => {
    const map: Record<number, MarginBadgeItem[]> = {};
    if (numPages === 0) return map;

    items.forEach((item) => {
      if (!item.isChecked) return;
      const isDraggingThis = draggingBadge?.id === item.id;
      const rawPage = isDraggingThis ? draggingBadge.page : item.pdfLocation.page;
      const page = clampNumber(Math.round(rawPage || 1), 1, numPages);
      if (!map[page]) map[page] = [];
      map[page].push(item);
    });
    return map;
  }, [items, numPages, draggingBadge]);

  // Pointer drag handlers for left-margin badges (with cross-page support)
  const handleBadgePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    item: MarginBadgeItem,
    pageNum: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if capture unavailable
    }
    setHoveredItemId(null);

    const initial = {
      id: item.id,
      page: pageNum,
      xPercent: clampNumber(item.pdfLocation.xPercent, 1, 8),
      yPercent: clampNumber(item.pdfLocation.yPercent, 0, 98),
    };
    setDraggingBadge(initial);
    draggingLatestRef.current = {
      ...initial,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  const resolvePointerToPagePosition = (clientX: number, clientY: number, fallbackPage: number) => {
    let targetPage = fallbackPage;
    let targetRect: DOMRect | null = null;
    let yPercent = 0;

    // 1. Check if pointer is inside any rendered page rect
    for (let p = 1; p <= numPages; p++) {
      const el = pageRefs.current[p];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        targetPage = p;
        targetRect = rect;
        yPercent = ((clientY - rect.top) / rect.height) * 100;
        break;
      }
    }

    // 2. If pointer is in gap above page 1, below last page, or between two pages, map cleanly
    if (!targetRect) {
      let bestDist = Infinity;
      for (let p = 1; p <= numPages; p++) {
        const el = pageRefs.current[p];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (clientY < rect.top) {
          const dist = rect.top - clientY;
          if (dist < bestDist) {
            bestDist = dist;
            targetPage = p;
            targetRect = rect;
            yPercent = 0;
          }
        } else if (clientY > rect.bottom) {
          const dist = clientY - rect.bottom;
          if (dist < bestDist) {
            bestDist = dist;
            targetPage = p;
            targetRect = rect;
            yPercent = 98;
          }
        }
      }
    }

    if (!targetRect) {
      const fallbackEl = pageRefs.current[fallbackPage];
      if (fallbackEl) {
        targetRect = fallbackEl.getBoundingClientRect();
      }
    }

    let xPercent = 2.5;
    if (targetRect && targetRect.width > 0) {
      xPercent = ((clientX - targetRect.left) / targetRect.width) * 100;
    }

    return {
      page: clampNumber(targetPage, 1, Math.max(1, numPages)),
      xPercent: clampNumber(xPercent, 1, 8),
      yPercent: clampNumber(yPercent, 0, 98),
    };
  };

  const handleBadgePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const latest = draggingLatestRef.current;
    if (!latest) return;

    const distMoved = Math.hypot(e.clientX - latest.startX, e.clientY - latest.startY);
    const nextPos = resolvePointerToPagePosition(e.clientX, e.clientY, latest.page);

    draggingLatestRef.current = {
      ...latest,
      page: nextPos.page,
      xPercent: nextPos.xPercent,
      yPercent: nextPos.yPercent,
      moved: latest.moved || distMoved > 3,
    };

    setDraggingBadge({
      id: latest.id,
      page: nextPos.page,
      xPercent: nextPos.xPercent,
      yPercent: nextPos.yPercent,
    });
  };

  const handleBadgePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const latest = draggingLatestRef.current;
    if (!latest) return;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    draggingLatestRef.current = null;
    setDraggingBadge(null);

    if (latest.moved) {
      const existing = items.find((it) => it.id === latest.id);
      onUpdateItemLocation(latest.id, {
        page: latest.page,
        xPercent: Number(latest.xPercent.toFixed(2)),
        yPercent: Number(latest.yPercent.toFixed(2)),
        anchorQuote: existing?.pdfLocation.anchorQuote || '',
        anchorRationale: existing?.pdfLocation.anchorRationale || '',
        isTeacherAdjusted: true,
      });
    } else if (onSelectBadge) {
      const matched = items.find((it) => it.id === latest.id);
      if (matched) onSelectBadge(matched);
    }
  };

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await downloadCourseworkPdf({
        pdfSource: loadedPdfBytesRef.current ?? pdfUrl,
        items,
        studentName: studentName || title,
        includeMarginTags: isMarginTagsEnabled,
      });
    } catch (err) {
      console.error('Failed to download coursework PDF:', err);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrintPdf = async () => {
    if (isPrintingPdf) return;
    setIsPrintingPdf(true);
    try {
      await printCourseworkPdf({
        pdfSource: loadedPdfBytesRef.current ?? pdfUrl,
        items,
        includeMarginTags: isMarginTagsEnabled,
      });
    } catch (err) {
      console.error('Failed to print coursework PDF:', err);
      window.print();
    } finally {
      setIsPrintingPdf(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-100 dark:bg-slate-900">
      {/* Top Toolbar */}
      <div className="h-11 px-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shrink-0 select-none print:hidden">
        {/* Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={numPages === 0 || currentPage <= 1}
            onClick={() => scrollToPage(currentPage - 1, 10)}
            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span
            data-testid="pdf-page-indicator"
            className="text-xs font-bold text-slate-700 dark:text-slate-200 px-1.5 min-w-[54px] text-center"
          >
            {numPages > 0 ? `${currentPage} / ${numPages}` : '— / —'}
          </span>
          <button
            type="button"
            disabled={numPages === 0 || currentPage >= numPages}
            onClick={() => scrollToPage(currentPage + 1, 10)}
            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={zoom <= 0.6}
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            disabled={zoom >= 2.0}
            onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Download, Print & Margin Tags Print Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="w-8 h-8 rounded-md border flex items-center justify-center transition-colors bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-100 cursor-pointer disabled:opacity-50"
            title={
              isMarginTagsEnabled
                ? 'Download Annotated CWK PDF (with Margin Tags)'
                : 'Download Clean CWK PDF'
            }
            aria-label={
              isMarginTagsEnabled
                ? 'Download Annotated CWK PDF (with Margin Tags)'
                : 'Download Clean CWK PDF'
            }
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={handlePrintPdf}
            disabled={isPrintingPdf}
            className="w-8 h-8 rounded-md border flex items-center justify-center transition-colors bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-100 cursor-pointer disabled:opacity-50"
            title={
              isMarginTagsEnabled
                ? 'Print Annotated CWK PDF (with Margin Tags)'
                : 'Print Clean CWK PDF'
            }
            aria-label={
              isMarginTagsEnabled
                ? 'Print Annotated CWK PDF (with Margin Tags)'
                : 'Print Clean CWK PDF'
            }
          >
            {isPrintingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Printer className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleToggleMarginTags(!isMarginTagsEnabled)}
            aria-pressed={isMarginTagsEnabled}
            data-testid="toggle-margin-tags-print-pdf"
            title={
              isMarginTagsEnabled
                ? 'Include WWW/EBI Margin Tags on Print PDF (ON)'
                : 'Include WWW/EBI Margin Tags on Print PDF (OFF)'
            }
            aria-label={
              isMarginTagsEnabled
                ? 'Include WWW/EBI Margin Tags on Print PDF (ON)'
                : 'Include WWW/EBI Margin Tags on Print PDF (OFF)'
            }
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
              isMarginTagsEnabled
                ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Vertical Page Stack */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-auto p-4 space-y-5 relative bg-slate-200/75 dark:bg-slate-900"
      >
        {loading && (
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-bold">Rendering coursework PDF...</p>
          </div>
        )}

        {!loading && error && (
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Unable to render interactive PDF
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
              {error}
            </p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open PDF in New Tab
            </a>
          </div>
        )}

        {!loading &&
          !error &&
          pdfDoc &&
          Array.from({ length: numPages }, (_, idx) => idx + 1).map((pageNum) => (
            <PdfPageRenderer
              key={pageNum}
              pdfDoc={pdfDoc}
              pageNumber={pageNum}
              targetWidth={basePageWidth}
              pageBadges={badgesByPage[pageNum] || []}
              includeMarginTagsOnPrint={isMarginTagsEnabled}
              draggingBadge={draggingBadge}
              highlightedItemId={highlightedItemId}
              hoveredItemId={hoveredItemId}
              onSetHoveredItemId={setHoveredItemId}
              onBadgePointerDown={handleBadgePointerDown}
              onBadgePointerMove={handleBadgePointerMove}
              onBadgePointerUp={handleBadgePointerUp}
              registerPageRef={registerPageRef}
            />
          ))}
      </div>
    </div>
  );
}
