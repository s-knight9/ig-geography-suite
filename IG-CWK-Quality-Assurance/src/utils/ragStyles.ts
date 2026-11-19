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

export type DraftGradeBand = 'High' | 'Med' | 'Low';
export type DraftLetterGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'U';

export interface DraftGradeResult {
  grade: DraftLetterGrade;
  band: DraftGradeBand;
  label: string;
}

const DRAFT_GRADE_BAND_RANGES: ReadonlyArray<
  readonly [number, number, DraftLetterGrade, DraftGradeBand]
> = [
  [57, 60, 'A', 'High'],
  [53, 56, 'A', 'Med'],
  [50, 52, 'A', 'Low'],
  [47, 49, 'B', 'High'],
  [44, 46, 'B', 'Med'],
  [42, 43, 'B', 'Low'],
  [39, 41, 'C', 'High'],
  [37, 38, 'C', 'Med'],
  [35, 36, 'C', 'Low'],
  [32, 34, 'D', 'High'],
  [30, 31, 'D', 'Med'],
  [28, 29, 'D', 'Low'],
  [26, 27, 'E', 'High'],
  [24, 25, 'E', 'Med'],
  [22, 23, 'E', 'Low'],
  [20, 21, 'F', 'High'],
  [18, 19, 'F', 'Med'],
  [17, 17, 'F', 'Low'],
  [15, 16, 'G', 'High'],
  [13, 14, 'G', 'Med'],
  [12, 12, 'G', 'Low'],
  [0, 11, 'U', 'Low'],
];

/**
 * Maps a moderated total mark (0-60) to the Cambridge IGCSE Geography (0460)
 * Component 03 letter grade and sub-band tier (e.g. 'D (High)') without exposing raw marks.
 */
export function getDraftGradeAndBand(teacherTotalOutOf60: number): DraftGradeResult {
  const score = clampNumber(Math.round(Number(teacherTotalOutOf60) || 0), 0, 60);
  const match = DRAFT_GRADE_BAND_RANGES.find(([min, max]) => score >= min && score <= max);
  const grade: DraftLetterGrade = match ? match[2] : 'U';
  const band: DraftGradeBand = match ? match[3] : 'Low';
  return {
    grade,
    band,
    label: `${grade} (${band})`,
  };
}

/**
 * Returns only the sub-band tier ('High', 'Med', or 'Low') derived from getDraftGradeAndBand.
 */
export function getDraftGradeBand(teacherTotalOutOf60: number): DraftGradeBand {
  return getDraftGradeAndBand(teacherTotalOutOf60).band;
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

export const DEFAULT_INCOMPLETE_EBI_NOTICE =
  'Section incomplete in current draft, EBI feedback omitted until drafted';

const CRITERION_KEY_TO_NUMBER: Record<string, number> = {
  ao1_knowledge: 1,
  ao2_observation: 2,
  ao2_organisation: 3,
  ao2_analysis: 4,
  ao3_conclusion: 5,
};

const CRITERION_KEY_TO_STAGE_KEY: Record<string, string> = {
  ao1_knowledge: 'introduction_and_hypotheses',
  ao2_observation: 'methodology',
  ao2_organisation: 'data_presentation',
  ao2_analysis: 'data_analysis_and_interpretation',
  ao3_conclusion: 'conclusion_and_evaluation',
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
    const stageKey = CRITERION_KEY_TO_STAGE_KEY[scoreKey];
    const stageEntry = stageKey ? copy.section_completeness?.[stageKey] : undefined;
    const isIncomplete = crit.isIncomplete === true || stageEntry?.status === 'incomplete';

    crit.www = normalizeFeedbackItems(crit.www, critNumber, 'WWW', score);

    if (isIncomplete) {
      crit.isIncomplete = true;
      const noteCandidate =
        typeof crit.incompleteNote === 'string' && crit.incompleteNote.trim()
          ? crit.incompleteNote.trim()
          : typeof stageEntry?.reason === 'string' && stageEntry.reason.trim()
            ? stageEntry.reason.trim()
            : DEFAULT_INCOMPLETE_EBI_NOTICE;
      crit.incompleteNote = noteCandidate;
      crit.ebi = [];
    } else {
      crit.isIncomplete = false;
      delete crit.incompleteNote;
      crit.ebi = normalizeFeedbackItems(crit.ebi, critNumber, 'EBI', score);
    }
  }

  return copy;
}
