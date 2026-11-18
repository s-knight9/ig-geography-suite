export type RagBadgeColor = 'green' | 'amber' | 'light_red';

export interface CwkFeedbackItem {
  id: string;
  code: string; // e.g. "1.1A", "1.2A" for WWW; "1.1B", "1.2B" for EBI
  type: 'WWW' | 'EBI';
  text: string;
  ragColor: RagBadgeColor;
  isChecked: boolean;
  pdfLocation: {
    page: number;      // 1 based PDF page number
    xPercent: number;  // Left margin horizontal % (default 2.5)
    yPercent: number;  // Vertical % position on that page (0 to 100)
    anchorQuote: string;
    anchorRationale: string;
    isTeacherAdjusted?: boolean;
  };
}

export interface RagStyleToken {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  cardAccentBorder: string;
  badgeRgb: [number, number, number];
  borderRgb: [number, number, number];
  textRgb: [number, number, number];
  cardBgRgb: [number, number, number];
  cardBorderRgb: [number, number, number];
}

export const RAG_STYLES: Record<RagBadgeColor, RagStyleToken> = {
  green: {
    label: 'Top Band (Green)',
    badgeBg: '#D9EAD3',
    badgeBorder: '#16A34A',
    badgeText: '#14532D',
    cardBg: '#F2F9F0',
    cardBorder: '#86EFAC',
    cardAccentBorder: '#16A34A',
    badgeRgb: [217, 234, 211],
    borderRgb: [22, 163, 74],
    textRgb: [20, 83, 45],
    cardBgRgb: [242, 249, 240],
    cardBorderRgb: [134, 239, 172],
  },
  amber: {
    label: 'Mid/Lower Band (Amber)',
    badgeBg: '#FFE599',
    badgeBorder: '#D97706',
    badgeText: '#78350F',
    cardBg: '#FFFBEB',
    cardBorder: '#FCD34D',
    cardAccentBorder: '#D97706',
    badgeRgb: [255, 229, 153],
    borderRgb: [217, 119, 6],
    textRgb: [120, 53, 15],
    cardBgRgb: [255, 251, 235],
    cardBorderRgb: [252, 211, 77],
  },
  light_red: {
    label: 'EBI (Light Red)',
    badgeBg: '#F4CCCC',
    badgeBorder: '#DC2626',
    badgeText: '#7F1D1D',
    cardBg: '#FEF2F2',
    cardBorder: '#FCA5A5',
    cardAccentBorder: '#DC2626',
    badgeRgb: [244, 204, 204],
    borderRgb: [220, 38, 38],
    textRgb: [127, 29, 29],
    cardBgRgb: [254, 242, 242],
    cardBorderRgb: [252, 165, 165],
  },
};

export function getDefaultRagColor(type: 'WWW' | 'EBI', criterionScore: number): RagBadgeColor {
  if (type === 'EBI') return 'light_red';
  return criterionScore >= 9 ? 'green' : 'amber';
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getFeedbackItemText(item: CwkFeedbackItem | string | null | undefined): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item.text ?? '';
}

export function normalizeFeedbackItems(
  rawItems: any[] | undefined,
  criterionNumber: number,
  type: 'WWW' | 'EBI',
  criterionScore: number
): CwkFeedbackItem[] {
  if (!Array.isArray(rawItems)) return [];
  const sectionLetter = type === 'WWW' ? 'A' : 'B';

  return rawItems.map((item, idx) => {
    const code = `${criterionNumber}.${idx + 1}${sectionLetter}`;
    const isString = typeof item === 'string';
    const obj = !isString && item && typeof item === 'object' ? item : null;

    const text = isString ? item : (typeof obj?.text === 'string' ? obj.text : String(obj?.text ?? ''));
    const id = typeof obj?.id === 'string' && obj.id.trim()
      ? obj.id
      : `c${criterionNumber}-${type.toLowerCase()}-${idx + 1}`;

    let ragColor: RagBadgeColor;
    if (type === 'EBI') {
      ragColor = 'light_red';
    } else if (obj?.ragColor === 'green' || obj?.ragColor === 'amber') {
      ragColor = obj.ragColor;
    } else {
      ragColor = getDefaultRagColor('WWW', criterionScore);
    }

    const isChecked = typeof obj?.isChecked === 'boolean' ? obj.isChecked : true;

    const rawLoc = obj?.pdfLocation && typeof obj.pdfLocation === 'object' ? obj.pdfLocation : null;
    const rawPage = Number(rawLoc?.page);
    const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.round(rawPage) : Math.max(1, criterionNumber);

    const rawX = Number(rawLoc?.xPercent);
    const xPercent = Number.isFinite(rawX) ? clampNumber(rawX, 1, 8) : 2.5;

    const rawY = Number(rawLoc?.yPercent);
    const defaultY = (type === 'WWW' ? 14 : 54) + ((idx * 12) % 38);
    const yPercent = Number.isFinite(rawY) ? clampNumber(rawY, 0, 98) : defaultY;

    const anchorQuote = typeof rawLoc?.anchorQuote === 'string' ? rawLoc.anchorQuote.trim() : '';
    const anchorRationale = typeof rawLoc?.anchorRationale === 'string' ? rawLoc.anchorRationale.trim() : '';
    const isTeacherAdjusted = Boolean(rawLoc?.isTeacherAdjusted);

    return {
      id,
      code,
      type,
      text,
      ragColor,
      isChecked,
      pdfLocation: {
        page,
        xPercent,
        yPercent,
        anchorQuote,
        anchorRationale,
        ...(isTeacherAdjusted ? { isTeacherAdjusted: true } : {}),
      },
    };
  });
}

export function needsCoordinateResolution(item: CwkFeedbackItem): boolean {
  if (item.pdfLocation?.isTeacherAdjusted) return false;
  return true;
}

const CRITERION_KEY_TO_NUMBER: Record<string, number> = {
  ao1_knowledge: 1,
  ao2_observation: 2,
  ao2_organisation: 3,
  ao2_analysis: 4,
  ao3_conclusion: 5,
};

export function normalizeEvaluationResult<T extends Record<string, any>>(
  evaluation: T,
  teacherScores?: Record<string, number>
): T {
  if (!evaluation || typeof evaluation !== 'object') return evaluation;
  const copy: any = JSON.parse(JSON.stringify(evaluation));
  if (!copy.scores || typeof copy.scores !== 'object') return copy;

  for (const [scoreKey, critNumber] of Object.entries(CRITERION_KEY_TO_NUMBER)) {
    const crit = copy.scores[scoreKey];
    if (!crit || typeof crit !== 'object') continue;
    const score = Number(teacherScores?.[scoreKey] ?? crit.score ?? 0);
    crit.www = normalizeFeedbackItems(crit.www, critNumber, 'WWW', score);
    crit.ebi = normalizeFeedbackItems(crit.ebi, critNumber, 'EBI', score);
  }

  return copy;
}
