import type { PDFDocumentProxy } from 'pdfjs-dist';
import { CwkFeedbackItem, clampNumber } from './ragStyles';

export interface MarginBadgeItemInput extends CwkFeedbackItem {
  criterionNumber: number;
  criterionTitle: string;
}

interface PdfLine {
  page: number;
  yPercent: number;
  text: string;
  normText: string;
  tokens: Set<string>;
  isHeading: boolean;
}

interface PageMeta {
  page: number;
  lines: PdfLine[];
  isToc: boolean;
  isCover: boolean;
  fullNormText: string;
}

export interface ResolvedPdfLocation {
  page: number;
  xPercent: number;
  yPercent: number;
  anchorQuote: string;
  anchorRationale: string;
  isTeacherAdjusted?: boolean;
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'their', 'they',
  'have', 'has', 'had', 'were', 'was', 'are', 'been', 'being', 'will', 'would', 'could',
  'should', 'more', 'most', 'some', 'such', 'than', 'then', 'when', 'where', 'which',
  'while', 'about', 'across', 'also', 'between', 'both', 'clear', 'clearly', 'good',
  'well', 'very', 'provides', 'provided', 'shows', 'shown', 'using', 'used', 'uses',
  'use', 'make', 'makes', 'made', 'including', 'include', 'includes', 'relevant',
  'appropriate', 'effective', 'effectively', 'specific', 'specifically', 'section',
  'sections', 'study', 'coursework', 'student', 'students', 'criterion', 'marks',
  'higher', 'needs', 'needed', 'lacks', 'lacking', 'fail', 'fails', 'failed', 'ensure',
  'overall', 'only', 'just', 'still', 'however', 'there', 'these', 'those', 'what',
  'went', 'even', 'better', 'data', 'evidence', 'research', 'findings', 'information',
]);

const CRITERION_SECTION_HINTS: Record<number, { headingTerms: string[]; bodyTerms: string[] }> = {
  1: {
    headingTerms: ['introduction', 'fieldwork question', 'background', 'location', 'aim', 'aims', 'hypothes', 'guiding question'],
    bodyTerms: ['butler', 'unesco', 'geopark', 'sustainability', 'carrying capacity', 'theory', 'secondary', 'tourism', 'visitor'],
  },
  2: {
    headingTerms: ['methodology', 'method', 'data collection', 'sampling', 'primary data'],
    bodyTerms: ['sampling', 'systematic', 'stratified', 'random', 'tally', 'stopwatch', 'questionnaire', 'equipment', 'site', 'minute'],
  },
  3: {
    headingTerms: ['data presentation', 'presentation', 'graphs', 'charts', 'maps', 'tables'],
    bodyTerms: ['graph', 'chart', 'bar', 'pie', 'radar', 'kite', 'table', 'figure', 'map', 'located', 'legend', 'axis'],
  },
  4: {
    headingTerms: ['analysis', 'interpretation', 'results', 'findings', 'data analysis'],
    bodyTerms: ['trend', 'anomaly', 'anomalies', 'correlation', 'spearman', 'highest', 'lowest', 'average', 'mean', 'compared', 'shows'],
  },
  5: {
    headingTerms: ['conclusion', 'evaluation', 'limitations', 'improvements', 'further study'],
    bodyTerms: ['conclude', 'verdict', 'supported', 'strength', 'weakness', 'limitation', 'bias', 'subjective', 'sensor', 'seasonal', 'validity', 'reliable'],
  },
};

function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(raw: string): string[] {
  return normalizeText(raw)
    .split(' ')
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

function makeQuoteSnippet(lineText: string): string {
  const words = lineText.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (words.length <= 10) return words.join(' ');
  return words.slice(0, 10).join(' ');
}

function extractParentheticalClues(feedbackText: string): string[] {
  const clues: string[] = [];
  const parenRegex = /\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = parenRegex.exec(feedbackText)) !== null) {
    const inner = match[1].replace(/^e\.g\.,?\s*/i, '').trim();
    const parts = inner.split(/[,;/]/).map((p) => p.trim()).filter((p) => p.length >= 2);
    clues.push(...parts);
  }
  return clues;
}

function extractNumericAndCodeClues(feedbackText: string): string[] {
  const matches = feedbackText.match(/\b(?:hypothesis\s*\d+|figure\s*\d+|table\s*\d+|[a-c]\d|\d{4}|\d+(?:\.\d+)?%?)\b/gi) || [];
  return Array.from(new Set(matches.map((m) => normalizeText(m)).filter(Boolean)));
}

async function extractAllPages(pdfDoc: PDFDocumentProxy): Promise<PageMeta[]> {
  const pages: PageMeta[] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    interface Token {
      x: number;
      y: number;
      str: string;
    }

    const rawTokens: Token[] = [];
    for (const item of content.items as any[]) {
      if (!item || typeof item.str !== 'string') continue;
      if (!item.str.trim()) continue;
      const tr = Array.isArray(item.transform) ? item.transform : [1, 0, 0, 1, 0, 0];
      rawTokens.push({
        x: Number(tr[4]) || 0,
        y: Number(tr[5]) || 0,
        str: item.str,
      });
    }

    rawTokens.sort((a, b) => {
      if (Math.abs(b.y - a.y) > 3.5) return b.y - a.y;
      return a.x - b.x;
    });

    const grouped: { y: number; items: Token[] }[] = [];
    for (const tok of rawTokens) {
      const prev = grouped[grouped.length - 1];
      if (prev && Math.abs(prev.y - tok.y) <= 4) {
        prev.items.push(tok);
      } else {
        grouped.push({ y: tok.y, items: [tok] });
      }
    }

    const lines: PdfLine[] = grouped
      .map((g) => {
        const text = g.items
          .sort((a, b) => a.x - b.x)
          .map((t) => t.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        const normText = normalizeText(text);
        const yPercent = clampNumber(((viewport.height - g.y) / Math.max(1, viewport.height)) * 100, 4, 94);
        const isHeading =
          text.length >= 3 &&
          text.length <= 65 &&
          !/[.!?]$/.test(text) &&
          !/\.{3,}/.test(text);
        return {
          page: pageNum,
          yPercent: Number(yPercent.toFixed(2)),
          text,
          normText,
          tokens: new Set(tokenize(text)),
          isHeading,
        };
      })
      .filter((l) => l.text.length > 0);

    const fullText = lines.map((l) => l.text).join(' ');
    const fullNormText = normalizeText(fullText);

    const dotLeaderLines = lines.filter((l) => /\.{3,}\s*\d+/.test(l.text)).length;
    const trailingNumLines = lines.filter((l) => /\s+\d{1,2}$/.test(l.text) && l.text.length < 70).length;
    const isToc =
      dotLeaderLines >= 2 ||
      (/\b(table of contents|contents)\b/i.test(fullText) && trailingNumLines >= 3) ||
      trailingNumLines >= 5;

    const isCover =
      pageNum === 1 &&
      !isToc &&
      (fullText.length < 360 || /\b(candidate number|igcse geography coursework)\b/i.test(fullText));

    pages.push({
      page: pageNum,
      lines,
      isToc,
      isCover,
      fullNormText,
    });
  }

  return pages;
}

function findCriterionSectionPages(pages: PageMeta[]): Record<number, Set<number>> {
  const result: Record<number, Set<number>> = {
    1: new Set(),
    2: new Set(),
    3: new Set(),
    4: new Set(),
    5: new Set(),
  };

  // Detect primary start page of each criterion section from headings
  const headingMatches: { criterion: number; page: number }[] = [];

  for (const pageMeta of pages) {
    if (pageMeta.isToc || pageMeta.isCover) continue;
    for (const line of pageMeta.lines) {
      if (line.text.length > 75) continue;
      for (const critNum of [1, 2, 3, 4, 5]) {
        const hints = CRITERION_SECTION_HINTS[critNum];
        if (hints.headingTerms.some((term) => line.normText.includes(term))) {
          result[critNum].add(pageMeta.page);
          headingMatches.push({ criterion: critNum, page: pageMeta.page });
        }
      }
    }
  }

  // Also include pages with strong body keyword density for that criterion
  for (const pageMeta of pages) {
    if (pageMeta.isToc || pageMeta.isCover) continue;
    for (const critNum of [1, 2, 3, 4, 5]) {
      const hints = CRITERION_SECTION_HINTS[critNum];
      let hits = 0;
      for (const term of hints.bodyTerms) {
        if (pageMeta.fullNormText.includes(term)) hits++;
      }
      if (hits >= 2) {
        result[critNum].add(pageMeta.page);
      }
    }
  }

  return result;
}

function matchAnchorQuote(
  quote: string,
  preferredPage: number,
  pages: PageMeta[]
): { page: number; yPercent: number; lineText: string; score: number } | null {
  const normQuote = normalizeText(quote);
  if (!normQuote) return null;
  const quoteTokens = tokenize(quote);

  let best: { page: number; yPercent: number; lineText: string; score: number } | null = null;

  for (const pageMeta of pages) {
    if (pageMeta.isToc && pages.length > 2) continue;

    for (let i = 0; i < pageMeta.lines.length; i++) {
      const line = pageMeta.lines[i];
      const nextLine = pageMeta.lines[i + 1];
      const combinedNorm = nextLine ? `${line.normText} ${nextLine.normText}` : line.normText;

      let score = 0;
      if (line.normText.includes(normQuote) && normQuote.length >= 6) {
        score = 120;
      } else if (combinedNorm.includes(normQuote) && normQuote.length >= 6) {
        score = 105;
      } else if (quoteTokens.length > 0) {
        let matched = 0;
        for (const t of quoteTokens) {
          if (line.tokens.has(t) || line.normText.includes(t)) matched++;
        }
        const coverage = matched / quoteTokens.length;
        if (coverage >= 0.55 && matched >= 2) {
          score = coverage * 80;
        }
      }

      if (score > 0) {
        if (pageMeta.page === preferredPage) score += 12;
        if (pageMeta.isCover) score -= 20;
        if (!best || score > best.score) {
          best = {
            page: pageMeta.page,
            yPercent: line.yPercent,
            lineText: line.text,
            score,
          };
        }
      }
    }
  }

  return best && best.score >= 45 ? best : null;
}

function matchByCloseReadingEvidence(
  item: MarginBadgeItemInput,
  pages: PageMeta[],
  sectionPages: Record<number, Set<number>>
): { page: number; yPercent: number; anchorQuote: string; anchorRationale: string } | null {
  const bodyPages = pages.filter((p) => !p.isToc && !p.isCover);
  const candidatePages = bodyPages.length > 0 ? bodyPages : pages;
  if (candidatePages.length === 0) return null;

  const parenClues = extractParentheticalClues(item.text).map(normalizeText).filter((c) => c.length >= 2);
  const codeAndNumClues = extractNumericAndCodeClues(item.text);
  const feedbackTokens = tokenize(item.text);
  const critHints = CRITERION_SECTION_HINTS[item.criterionNumber] || CRITERION_SECTION_HINTS[1];
  const preferredCritPages = sectionPages[item.criterionNumber] || new Set<number>();

  let bestMatch: { page: number; yPercent: number; lineText: string; score: number } | null = null;

  for (const pageMeta of candidatePages) {
    const isCriterionPage = preferredCritPages.has(pageMeta.page);

    for (let i = 0; i < pageMeta.lines.length; i++) {
      const line = pageMeta.lines[i];
      const nextLine = pageMeta.lines[i + 1];
      const windowNorm = nextLine ? `${line.normText} ${nextLine.normText}` : line.normText;

      let score = 0;

      // 1. High-weight parenthesized examples (e.g. "13 million visitors", "UNESCO status", "A3 had 21 people")
      for (const clue of parenClues) {
        if (windowNorm.includes(clue)) {
          score += 36;
        } else {
          const clueToks = tokenize(clue);
          if (clueToks.length > 0) {
            let hits = 0;
            for (const ct of clueToks) {
              if (windowNorm.includes(ct)) hits++;
            }
            if (hits > 0) score += (hits / clueToks.length) * 20;
          }
        }
      }

      // 2. Numeric & site/hypothesis/figure code matches
      for (const code of codeAndNumClues) {
        const regex = new RegExp(`\\b${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        if (regex.test(windowNorm)) {
          score += 24;
        }
      }

      // 3. Feedback token overlap
      let tokenHits = 0;
      for (const tok of feedbackTokens) {
        if (line.tokens.has(tok) || (tok.length >= 4 && line.normText.includes(tok))) {
          tokenHits++;
        }
      }
      score += Math.min(28, tokenHits * 6);

      // 4. Section heading & criterion affinity bonus
      if (isCriterionPage) score += 14;
      if (line.isHeading && critHints.headingTerms.some((h) => line.normText.includes(h))) {
        score += 18;
      }

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = {
          page: pageMeta.page,
          yPercent: line.yPercent,
          lineText: line.text,
          score,
        };
      }
    }
  }

  // Fallback to the criterion's primary section heading/top line if no keyword line scored highly
  if (!bestMatch || bestMatch.score < 18) {
    const fallbackPageNum =
      Array.from(preferredCritPages)[0] ||
      candidatePages[Math.min(candidatePages.length - 1, Math.max(0, item.criterionNumber - 1))]?.page ||
      1;
    const fallbackPage = pages.find((p) => p.page === fallbackPageNum) || candidatePages[0];
    if (fallbackPage && fallbackPage.lines.length > 0) {
      const headingLine =
        fallbackPage.lines.find(
          (l) => l.isHeading && critHints.headingTerms.some((h) => l.normText.includes(h))
        ) || fallbackPage.lines[0];
      const snippet = makeQuoteSnippet(headingLine.text);
      return {
        page: fallbackPage.page,
        yPercent: headingLine.yPercent,
        anchorQuote: snippet,
        anchorRationale: `Anchored ${item.code} (${item.type}) to Criterion ${item.criterionNumber} section "${snippet}" on page ${fallbackPage.page}.`,
      };
    }
    return null;
  }

  const snippet = makeQuoteSnippet(bestMatch.lineText);
  return {
    page: bestMatch.page,
    yPercent: bestMatch.yPercent,
    anchorQuote: snippet,
    anchorRationale: `Anchored ${item.code} (${item.type}) to "${snippet}" on page ${bestMatch.page}.`,
  };
}

export async function resolveEvaluationCoordinatesWithPdf(
  pdfDoc: PDFDocumentProxy,
  items: MarginBadgeItemInput[]
): Promise<Record<string, ResolvedPdfLocation>> {
  const pages = await extractAllPages(pdfDoc);
  const sectionPages = findCriterionSectionPages(pages);

  const resolvedMap: Record<string, ResolvedPdfLocation> = {};

  for (const item of items) {
    if (item.pdfLocation?.isTeacherAdjusted) {
      resolvedMap[item.id] = { ...item.pdfLocation };
      continue;
    }

    const existingQuote = item.pdfLocation?.anchorQuote?.trim() || '';
    if (existingQuote) {
      const quoteHit = matchAnchorQuote(existingQuote, item.pdfLocation.page, pages);
      if (quoteHit) {
        resolvedMap[item.id] = {
          page: quoteHit.page,
          xPercent: clampNumber(item.pdfLocation.xPercent || 2.5, 1, 8),
          yPercent: quoteHit.yPercent,
          anchorQuote: existingQuote,
          anchorRationale:
            item.pdfLocation.anchorRationale ||
            `Verified quote "${existingQuote}" on page ${quoteHit.page}.`,
        };
        continue;
      }
    }

    const evidenceHit = matchByCloseReadingEvidence(item, pages, sectionPages);
    if (evidenceHit) {
      resolvedMap[item.id] = {
        page: evidenceHit.page,
        xPercent: clampNumber(item.pdfLocation?.xPercent || 2.5, 1, 8),
        yPercent: evidenceHit.yPercent,
        anchorQuote: existingQuote || evidenceHit.anchorQuote,
        anchorRationale: item.pdfLocation?.anchorRationale || evidenceHit.anchorRationale,
      };
    } else {
      resolvedMap[item.id] = {
        page: clampNumber(item.pdfLocation?.page || 1, 1, Math.max(1, pdfDoc.numPages)),
        xPercent: clampNumber(item.pdfLocation?.xPercent || 2.5, 1, 8),
        yPercent: clampNumber(item.pdfLocation?.yPercent ?? 15, 4, 94),
        anchorQuote: existingQuote,
        anchorRationale: item.pdfLocation?.anchorRationale || '',
      };
    }
  }

  // De-collision pass per page: keep teacher-adjusted badges fixed and separate overlapping badges by 4.5% vertically
  const byPage: Record<number, { id: string; loc: ResolvedPdfLocation }[]> = {};
  for (const [id, loc] of Object.entries(resolvedMap)) {
    if (!byPage[loc.page]) byPage[loc.page] = [];
    byPage[loc.page].push({ id, loc });
  }

  for (const entries of Object.values(byPage)) {
    entries.sort((a, b) => a.loc.yPercent - b.loc.yPercent);
    let lastY = -Infinity;
    for (const entry of entries) {
      if (entry.loc.isTeacherAdjusted) {
        lastY = entry.loc.yPercent;
        continue;
      }
      if (lastY !== -Infinity && entry.loc.yPercent - lastY < 4.5) {
        entry.loc.yPercent = Number(Math.min(94, lastY + 4.5).toFixed(2));
      }
      lastY = entry.loc.yPercent;
    }
  }

  return resolvedMap;
}
