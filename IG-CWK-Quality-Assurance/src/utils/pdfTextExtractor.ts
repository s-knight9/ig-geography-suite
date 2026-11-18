import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extracts coursework text segmented with explicit `=== PAGE N ===` headers
 * and line breaks reconstructed from PDF Y-coordinates for close-reading grounding.
 */
export async function extractPageSegmentedTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  try {
    const pageBlocks: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      interface PositionedToken {
        x: number;
        y: number;
        str: string;
      }

      const tokens: PositionedToken[] = [];
      for (const rawItem of content.items as any[]) {
        if (!rawItem || typeof rawItem.str !== 'string') continue;
        const str = rawItem.str;
        if (!str.trim()) continue;
        const transform = Array.isArray(rawItem.transform) ? rawItem.transform : [1, 0, 0, 1, 0, 0];
        tokens.push({
          x: Number(transform[4]) || 0,
          y: Number(transform[5]) || 0,
          str,
        });
      }

      // Sort top-to-bottom (higher PDF Y first), then left-to-right
      tokens.sort((a, b) => {
        if (Math.abs(b.y - a.y) > 3) return b.y - a.y;
        return a.x - b.x;
      });

      const lines: { y: number; parts: PositionedToken[] }[] = [];
      for (const tok of tokens) {
        const lastLine = lines[lines.length - 1];
        if (lastLine && Math.abs(lastLine.y - tok.y) <= 3.5) {
          lastLine.parts.push(tok);
        } else {
          lines.push({ y: tok.y, parts: [tok] });
        }
      }

      const lineStrings = lines
        .map((line) =>
          line.parts
            .sort((a, b) => a.x - b.x)
            .map((p) => p.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
        )
        .filter(Boolean);

      pageBlocks.push(`=== PAGE ${pageNum} ===\n${lineStrings.join('\n')}`);
    }

    return pageBlocks.join('\n\n');
  } finally {
    await pdf.destroy().catch(() => {});
  }
}
