import { PDFDocument, rgb, StandardFonts, type RGB } from 'pdf-lib';
import {
  CwkFeedbackItem,
  RagBadgeColor,
  clampNumber,
  normalizeFeedbackItems,
} from './ragStyles';
import type { EvaluationResult } from '../types';

export const BADGE_WIDTH = 28;
export const BADGE_HEIGHT = 14;
export const BADGE_BORDER_RADIUS = 3;
export const BADGE_FONT_SIZE = 7.5;
export const BADGE_MIN_LEFT_MARGIN = 10;
export const MARGIN_TAGS_PRINT_STORAGE_KEY = 'igqa_include_margin_tags_on_print';

export function readIncludeMarginTagsPreference(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return window.localStorage.getItem(MARGIN_TAGS_PRINT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function writeIncludeMarginTagsPreference(enabled: boolean): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(MARGIN_TAGS_PRINT_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage quota or private-mode access errors
  }
}

export const PDF_RAG_COLORS: Record<RagBadgeColor, { fill: RGB; border: RGB; text: RGB }> = {
  green: {
    fill: rgb(0.851, 0.918, 0.827),   // #D9EAD3
    border: rgb(0.086, 0.639, 0.290), // #16A34A
    text: rgb(0.078, 0.325, 0.176),   // #14532D
  },
  amber: {
    fill: rgb(1.0, 0.898, 0.6),       // #FFE599
    border: rgb(0.851, 0.467, 0.024), // #D97706
    text: rgb(0.471, 0.208, 0.059),   // #78350F
  },
  light_red: {
    fill: rgb(0.957, 0.8, 0.8),       // #F4CCCC
    border: rgb(0.863, 0.149, 0.149), // #DC2626
    text: rgb(0.498, 0.114, 0.114),   // #7F1D1D
  },
};

const CRITERION_ENTRIES: Array<{ key: keyof EvaluationResult['scores']; num: number }> = [
  { key: 'ao1_knowledge', num: 1 },
  { key: 'ao2_observation', num: 2 },
  { key: 'ao2_organisation', num: 3 },
  { key: 'ao2_analysis', num: 4 },
  { key: 'ao3_conclusion', num: 5 },
];

export async function fetchCourseworkPdfBytes(pdfUrl: string): Promise<ArrayBuffer> {
  if (pdfUrl.startsWith('blob:') || pdfUrl.startsWith('data:')) {
    const res = await fetch(pdfUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.arrayBuffer();
  }

  // 1. Prefer dedicated /api/proxy-pdf endpoint
  try {
    const proxyRes = await fetch(`/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`);
    const contentType = proxyRes.headers.get('content-type') || '';
    if (proxyRes.ok && (contentType.includes('pdf') || contentType.includes('octet-stream'))) {
      return await proxyRes.arrayBuffer();
    }
  } catch {
    // Fallback below
  }

  // 2. Fallback to existing /api/proxy-image endpoint (returns base64 dataUri)
  try {
    const imgProxyRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(pdfUrl)}`);
    if (imgProxyRes.ok) {
      const json = await imgProxyRes.json();
      if (json?.dataUri && typeof json.dataUri === 'string') {
        const base64 = json.dataUri.includes(',') ? json.dataUri.split(',')[1] : json.dataUri;
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      }
    }
  } catch {
    // Fallback below
  }

  // 3. Direct fetch fallback
  const directRes = await fetch(pdfUrl);
  if (!directRes.ok) throw new Error(`Failed to fetch PDF (HTTP ${directRes.status})`);
  return directRes.arrayBuffer();
}

async function resolveRawPdfBytes(pdfSource: ArrayBuffer | Uint8Array | string): Promise<Uint8Array> {
  if (typeof pdfSource === 'string') {
    const fetched = await fetchCourseworkPdfBytes(pdfSource);
    return new Uint8Array(fetched.slice(0));
  }
  if (pdfSource instanceof ArrayBuffer) {
    return new Uint8Array(pdfSource.slice(0));
  }
  return pdfSource.slice(0);
}

export function collectActiveFeedbackItems(
  source: CwkFeedbackItem[] | EvaluationResult,
  teacherScores?: Record<string, number>
): CwkFeedbackItem[] {
  if (Array.isArray(source)) {
    return source.filter((item) => Boolean(item && item.isChecked === true));
  }

  if (!source?.scores) return [];

  const active: CwkFeedbackItem[] = [];
  for (const { key, num } of CRITERION_ENTRIES) {
    const crit = source.scores[key];
    if (!crit) continue;
    const score = Number(teacherScores?.[key] ?? crit.score ?? 0);
    const normalizedWww = normalizeFeedbackItems(crit.www, num, 'WWW', score);
    const normalizedEbi = crit.isIncomplete
      ? []
      : normalizeFeedbackItems(crit.ebi, num, 'EBI', score);
    for (const item of [...normalizedWww, ...normalizedEbi]) {
      if (item.isChecked === true) {
        active.push(item);
      }
    }
  }
  return active;
}

export function computeBadgePdfCoords(
  item: CwkFeedbackItem,
  pageWidth: number,
  pageHeight: number,
  badgeWidth: number = BADGE_WIDTH,
  badgeHeight: number = BADGE_HEIGHT
): { pdfX: number; pdfY: number } {
  const xPercent = item.pdfLocation?.xPercent ?? 2.5;
  const yPercent = item.pdfLocation?.yPercent ?? 14;

  const rawPdfX = (xPercent / 100) * pageWidth;
  const maxPdfX = Math.max(BADGE_MIN_LEFT_MARGIN, pageWidth - badgeWidth - BADGE_MIN_LEFT_MARGIN);
  const pdfX = Math.max(BADGE_MIN_LEFT_MARGIN, Math.min(rawPdfX, maxPdfX));

  const rawPdfY = pageHeight - ((yPercent / 100) * pageHeight) - badgeHeight;
  const pdfY = clampNumber(rawPdfY, 0, Math.max(0, pageHeight - badgeHeight));

  return { pdfX, pdfY };
}

export function buildRoundedRectSvgPath(width: number, height: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  if (r === 0) {
    return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
  }
  // Cubic Bezier approximation of a quarter-circle arc
  const k = r * 0.5522847498;
  return [
    `M ${r} 0`,
    `L ${width - r} 0`,
    `C ${width - r + k} 0 ${width} ${r - k} ${width} ${r}`,
    `L ${width} ${height - r}`,
    `C ${width} ${height - r + k} ${width - r + k} ${height} ${width - r} ${height}`,
    `L ${r} ${height}`,
    `C ${r - k} ${height} 0 ${height - r + k} 0 ${height - r}`,
    `L 0 ${r}`,
    `C 0 ${r - k} ${r - k} 0 ${r} 0`,
    'Z',
  ].join(' ');
}

export async function generateAnnotatedPdfBytes(
  pdfSource: ArrayBuffer | Uint8Array | string,
  feedbackSource: CwkFeedbackItem[] | EvaluationResult,
  options?: { teacherScores?: Record<string, number> }
): Promise<Uint8Array> {
  const rawBytes = await resolveRawPdfBytes(pdfSource);
  const pdfDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const activeItems = collectActiveFeedbackItems(feedbackSource, options?.teacherScores);
  const pages = pdfDoc.getPages();

  if (pages.length === 0 || activeItems.length === 0) {
    return pdfDoc.save();
  }

  for (const item of activeItems) {
    const code = (item.code || '').trim();
    if (!code) continue;

    const pageIndex = clampNumber(Math.round(item.pdfLocation?.page || 1) - 1, 0, pages.length - 1);
    const page = pages[pageIndex];
    const { width, height } = page.getSize();

    const textWidth = boldFont.widthOfTextAtSize(code, BADGE_FONT_SIZE);
    const badgeWidth = Math.max(BADGE_WIDTH, textWidth + 6);
    const badgeHeight = BADGE_HEIGHT;

    const { pdfX, pdfY } = computeBadgePdfCoords(item, width, height, badgeWidth, badgeHeight);
    const palette = PDF_RAG_COLORS[item.ragColor] || PDF_RAG_COLORS.amber;
    const svgPath = buildRoundedRectSvgPath(badgeWidth, badgeHeight, BADGE_BORDER_RADIUS);

    // drawSvgPath flips SVG +Y downward from (x, y), so pass y = pdfY + badgeHeight to anchor bottom-left at (pdfX, pdfY).
    page.drawSvgPath(svgPath, {
      x: pdfX,
      y: pdfY + badgeHeight,
      color: palette.fill,
      borderColor: palette.border,
      borderWidth: 1,
    });

    const capHeight = boldFont.heightAtSize(BADGE_FONT_SIZE, { descender: false });
    const textX = pdfX + (badgeWidth - textWidth) / 2;
    const textY = pdfY + (badgeHeight - capHeight) / 2;

    page.drawText(code, {
      x: textX,
      y: textY,
      size: BADGE_FONT_SIZE,
      font: boldFont,
      color: palette.text,
    });
  }

  return pdfDoc.save();
}

export function toPdfBlob(bytes: ArrayBuffer | Uint8Array): Blob {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const copy = new Uint8Array(view.byteLength);
  copy.set(view);
  return new Blob([copy], { type: 'application/pdf' });
}

export function buildCourseworkPdfFilename(studentName: string, includeMarginTags: boolean): string {
  const sanitized = (studentName || '')
    .replace(/[<>:"/\\|?*\x00-\x1F]+/g, '_')
    .trim();
  const safeName = sanitized || 'Coursework';
  return includeMarginTags ? `${safeName}_Annotated_CWK.pdf` : `${safeName}_CWK.pdf`;
}

export async function generateAnnotatedCourseworkPdf(
  pdfSource: ArrayBuffer | Uint8Array | string,
  feedbackSource: CwkFeedbackItem[] | EvaluationResult,
  options?: { teacherScores?: Record<string, number> }
): Promise<Blob> {
  const annotatedBytes = await generateAnnotatedPdfBytes(pdfSource, feedbackSource, options);
  return toPdfBlob(annotatedBytes);
}

export async function exportCourseworkPdfBlob({
  pdfSource,
  items,
  includeMarginTags,
  teacherScores,
}: {
  pdfSource: ArrayBuffer | Uint8Array | string;
  items: CwkFeedbackItem[] | EvaluationResult;
  includeMarginTags: boolean;
  teacherScores?: Record<string, number>;
}): Promise<Blob> {
  const rawBytes = await resolveRawPdfBytes(pdfSource);
  if (!includeMarginTags) {
    return toPdfBlob(rawBytes);
  }
  return generateAnnotatedCourseworkPdf(rawBytes, items, { teacherScores });
}

export async function downloadCourseworkPdf({
  pdfSource,
  items,
  studentName,
  includeMarginTags,
  teacherScores,
}: {
  pdfSource: ArrayBuffer | Uint8Array | string;
  items: CwkFeedbackItem[] | EvaluationResult;
  studentName: string;
  includeMarginTags: boolean;
  teacherScores?: Record<string, number>;
}): Promise<void> {
  const blob = await exportCourseworkPdfBlob({
    pdfSource,
    items,
    includeMarginTags,
    teacherScores,
  });
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = buildCourseworkPdfFilename(studentName, includeMarginTags);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

let activePrintCleanup: (() => void) | null = null;

export async function printCourseworkPdf({
  pdfSource,
  items,
  includeMarginTags,
  teacherScores,
}: {
  pdfSource: ArrayBuffer | Uint8Array | string;
  items: CwkFeedbackItem[] | EvaluationResult;
  includeMarginTags: boolean;
  teacherScores?: Record<string, number>;
}): Promise<void> {
  const blob = await exportCourseworkPdfBlob({
    pdfSource,
    items,
    includeMarginTags,
    teacherScores,
  });

  if (activePrintCleanup) {
    activePrintCleanup();
    activePrintCleanup = null;
  }

  const blobUrl = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';

  let cleaned = false;
  let fallbackTimer: number | null = null;
  let printTimer: number | null = null;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
    if (printTimer !== null) window.clearTimeout(printTimer);
    window.removeEventListener('afterprint', handleAfterPrint);
    try {
      iframe.contentWindow?.removeEventListener('afterprint', handleAfterPrint);
    } catch {
      // ignore cross-origin/detached iframe errors
    }
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    URL.revokeObjectURL(blobUrl);
    if (activePrintCleanup === cleanup) {
      activePrintCleanup = null;
    }
  };

  const handleAfterPrint = () => {
    window.setTimeout(cleanup, 500);
  };

  activePrintCleanup = cleanup;
  fallbackTimer = window.setTimeout(cleanup, 60000);

  iframe.onload = () => {
    printTimer = window.setTimeout(() => {
      if (cleaned) return;
      try {
        window.addEventListener('afterprint', handleAfterPrint);
        iframe.contentWindow?.addEventListener('afterprint', handleAfterPrint);
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.open(blobUrl, '_blank');
      }
    }, 150);
  };

  iframe.src = blobUrl;
  document.body.appendChild(iframe);
}
