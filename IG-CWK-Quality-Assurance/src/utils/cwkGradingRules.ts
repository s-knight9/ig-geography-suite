import {
  CwkFeedbackItem,
  DEFAULT_INCOMPLETE_EBI_NOTICE,
  clampNumber,
  getFeedbackItemText,
  normalizeEvaluationResult,
} from './ragStyles';
import type {
  EvaluationResult,
  HypothesisAudit,
  JustificationStatus,
  MethodologyAudit,
  SectionCompletenessMap,
} from '../types';

export { DEFAULT_INCOMPLETE_EBI_NOTICE };

export const MISSING_HYPOTHESIS_JUSTIFICATION_EBI =
  'Hypotheses justification missing — provide geographical justification for each hypothesis.';

export const PARTIAL_HYPOTHESIS_JUSTIFICATION_EBI =
  'Hypotheses partially justified — strengthen the geographical justification for each hypothesis.';

export const PRESENT_HYPOTHESIS_JUSTIFICATION_WWW =
  'Hypotheses justification present — hypotheses are clearly justified.';

export const MISSING_METHOD_JUSTIFICATION_EBI =
  'Methods justification missing — justify why each data collection method and sampling strategy was chosen.';

export const PARTIAL_METHOD_JUSTIFICATION_EBI =
  'Methods partially justified — strengthen the justification for each data collection method and sampling strategy.';

export const PRESENT_METHOD_JUSTIFICATION_WWW =
  'Methods justification present — data collection methods and sampling strategies are clearly justified.';

export type CourseworkStageKey = keyof SectionCompletenessMap;
export type PreScanStageStatus = 'complete' | 'incomplete' | 'uncertain';

export interface StagePreScanResult {
  stageKey: CourseworkStageKey;
  label: string;
  criterionNumber: number;
  scoreKey: keyof EvaluationResult['scores'];
  headingFound: boolean;
  headingText?: string;
  page?: number;
  substantiveSentenceCount: number;
  endsMidSentence: boolean;
  isPlaceholderOnly: boolean;
  hasVisualDataMarkers: boolean;
  status: PreScanStageStatus;
  reason: string;
}

export interface CourseworkCompletenessPreScan {
  hasDetectedHeadings: boolean;
  stages: Record<CourseworkStageKey, StagePreScanResult>;
}

interface StageDescriptor {
  stageKey: CourseworkStageKey;
  label: string;
  criterionNumber: number;
  scoreKey: keyof EvaluationResult['scores'];
  headingPatterns: RegExp[];
}

const STAGE_DESCRIPTORS: StageDescriptor[] = [
  {
    stageKey: 'introduction_and_hypotheses',
    label: 'Introduction and Hypotheses',
    criterionNumber: 1,
    scoreKey: 'ao1_knowledge',
    headingPatterns: [
      /^introduction\b/i,
      /^aims?(?:\s*(?:&|and)\s*(?:hypothes[ei]s|guiding\s+questions?|objectives?))?\b/i,
      /^hypothes[ei]s(?:\s*(?:&|and)\s*(?:aims?|expected\s+outcomes?|justifications?))?\b/i,
      /^guiding\s+questions?\b/i,
      /^research\s+questions?\b/i,
      /^background(?:\s*(?:&|and)\s*(?:hypothes[ei]s|context|location))?\b/i,
      /^site\s+location(?:\s*(?:&|and)\s*hypothes[ei]s)?\b/i,
    ],
  },
  {
    stageKey: 'methodology',
    label: 'Methodology',
    criterionNumber: 2,
    scoreKey: 'ao2_observation',
    headingPatterns: [
      /^methodology\b/i,
      /^methods?(?:\s+of\s+(?:data\s+)?collection|\s*(?:&|and)\s*sampling)?\b/i,
      /^data\s+collection(?:\s+(?:methods?|strategies|plan|techniques?))?\b/i,
      /^sampling(?:\s+strateg(?:y|ies))?\b/i,
      /^fieldwork\s+methods?\b/i,
    ],
  },
  {
    stageKey: 'data_presentation',
    label: 'Data Presentation',
    criterionNumber: 3,
    scoreKey: 'ao2_organisation',
    headingPatterns: [
      /^data\s+presentation\b/i,
      /^presentation\s+of\s+(?:data|results)\b/i,
      /^results(?:\s*(?:&|and)\s*data\s+presentation)?\b/i,
      /^graphs?,?\s*maps?\s*(?:&|and)\s*charts?\b/i,
      /^data\s+display\b/i,
    ],
  },
  {
    stageKey: 'data_analysis_and_interpretation',
    label: 'Data Analysis and Interpretation',
    criterionNumber: 4,
    scoreKey: 'ao2_analysis',
    headingPatterns: [
      /^data\s+analysis(?:\s*(?:&|and)\s*interpretation)?\b/i,
      /^analysis(?:\s*(?:&|and)\s*interpretation)?\b/i,
      /^interpretation(?:\s*(?:&|and)\s*(?:data\s+)?analysis)?\b/i,
      /^findings(?:\s*(?:&|and)\s*analysis)?\b/i,
      /^discussion(?:\s*(?:&|and)\s*analysis)?\b/i,
    ],
  },
  {
    stageKey: 'conclusion_and_evaluation',
    label: 'Conclusion and Evaluation',
    criterionNumber: 5,
    scoreKey: 'ao3_conclusion',
    headingPatterns: [
      /^conclusions?(?:\s*(?:&|and)\s*(?:evaluation|limitations?))?\b/i,
      /^evaluation(?:\s*(?:&|and)\s*(?:conclusions?|limitations?|improvements?))?\b/i,
      /^review(?:\s*(?:&|and)\s*evaluation)?\b/i,
    ],
  },
];

const STAGE_KEY_TO_SCORE_KEY: Record<CourseworkStageKey, keyof EvaluationResult['scores']> = {
  introduction_and_hypotheses: 'ao1_knowledge',
  methodology: 'ao2_observation',
  data_presentation: 'ao2_organisation',
  data_analysis_and_interpretation: 'ao2_analysis',
  conclusion_and_evaluation: 'ao3_conclusion',
};

const PLACEHOLDER_LINE_REGEX =
  /^(?:\[.*?(?:todo|tbd|insert|coming soon|placeholder|write here|add here|to be (?:completed|added|written|finished)).*?\]|(?:todo|tbd|n\/a|coming soon|to be (?:completed|added|written|finished)|work in progress|draft placeholder)[\s.:!-]*)$/i;

const INLINE_PLACEHOLDER_REGEX =
  /\[[^\]]*(?:todo|tbd|insert|coming soon|placeholder|to be (?:completed|added|written|finished))[^\]]*\]/gi;

const VISUAL_DATA_MARKER_REGEX =
  /\b(?:figure|fig\.?|table|graph|chart|map|diagram|scatter|pie|bar|choropleth|radar|rose|tally)\b/i;

const TRAILING_INCOMPLETE_WORD_REGEX =
  /(?:[,:;\-–—]|\b(?:the|a|an|and|or|but|because|since|while|although|however|therefore|which|that|who|where|when|with|from|to|of|in|on|at|by|for|as|is|are|was|were|be|can|will|may|might|could|would|should))$/i;

const NON_PROSE_CAPTION_OR_LABEL_REGEX =
  /^(?:figure|fig\.?|table|graph|chart|map|source|note|page|p\.)\b/i;

const MISSING_SECTION_FILLER_EBI_REGEX =
  /\b(not yet (?:written|started|completed|drafted|included)|section (?:is |appears )?(?:missing|absent|incomplete|blank|not included)|no (?:introduction|methodology|data presentation|analysis|conclusion|evaluation) (?:section )?(?:was |is )?(?:included|present|provided|written|found)|add (?:a|an) (?:introduction|methodology|data presentation|analysis|conclusion|evaluation)|include (?:a|an) (?:conclusion|evaluation|analysis|methodology) section|write (?:a|the) (?:conclusion|evaluation|analysis))\b/i;

const HYPOTHESIS_JUSTIFICATION_EBI_REGEX =
  /\b(hypothes[ei]s|guiding question|justif(?:y|ied|ication)|revalidation|geopark|economic leakage|tnc|carrying capacity|talc|limits of acceptable change|core[- ]periphery)\b/i;

const SPOON_FED_JUSTIFICATION_LEAK_REGEX =
  /\b(unesco|geopark|revalidation|songaksan|tnc|transnational|economic leakage|sustainable local wages|carrying capacity|butler|talc|limits of acceptable change|core[- ]periphery|for example|such as|e\.g\.)\b/i;

const METHOD_JUSTIFICATION_EBI_REGEX =
  /\b(?:justif(?:y|ied|ication)|rationale|why\s+(?:each\s+|the\s+)?(?:method|sampling|technique)|methods?\s+(?:are\s+)?(?:partially\s+)?justified|sampling\s+(?:strateg(?:y|ies)\s+)?(?:is|are)?\s*(?:not\s+|partially\s+)?justified)\b/i;

const SPOON_FED_METHOD_LEAK_REGEX =
  /\b(for example|such as|e\.g\.|reduce(?:s|ing)?\s+(?:researcher\s+)?bias|even\s+spatial\s+coverage|contrasting\s+land\s+uses|eliminate(?:s|ing)?\s+selection\s+bias|pilot\s+test(?:ing)?|standardized\s+scoring|bipolar\s+environmental\s+quality|repeatability|representativeness)\b/i;

function countAlphabeticWords(text: string): number {
  const matches = text.match(/[a-zA-Z]{2,}/g);
  return matches ? matches.length : 0;
}

function isTocEntryLine(line: string): boolean {
  if (/\.{2,}\s*\d{1,3}\s*$/.test(line)) return true;
  if (/^(?:page|section|contents?|table of contents?)\s*:?$/i.test(line)) return true;
  if (line.length <= 85 && /\s+\d{1,3}\s*$/.test(line) && countAlphabeticWords(line) <= 10) {
    return true;
  }
  return false;
}

function normalizeHeadingCandidate(line: string): string {
  return line
    .trim()
    .replace(/^(?:section\s+)?(?:\d+(?:\.\d+)*|[IVXLCDM]+)[.):-]?\s+/i, '')
    .replace(/[:.\s]+$/, '')
    .trim();
}

function matchStageHeading(line: string): StageDescriptor | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 90) return null;
  if (/[?!]$/.test(trimmed)) return null;
  if (isTocEntryLine(trimmed)) return null;

  const candidate = normalizeHeadingCandidate(trimmed);
  if (!candidate || candidate.length > 75) return null;

  for (const descriptor of STAGE_DESCRIPTORS) {
    if (descriptor.headingPatterns.some((pattern) => pattern.test(candidate))) {
      return descriptor;
    }
  }
  return null;
}

function countSubstantiveSentences(text: string): number {
  const cleaned = text.replace(INLINE_PLACEHOLDER_REGEX, ' ').trim();
  if (!cleaned) return 0;
  const segments = cleaned
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);

  return segments.filter((seg) => countAlphabeticWords(seg) >= 5).length;
}

function detectMidSentenceCutoff(lines: string[]): boolean {
  const meaningfulLines = lines
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      if (PLACEHOLDER_LINE_REGEX.test(l)) return false;
      if (/^(?:page\s+)?\d{1,3}$/i.test(l)) return false;
      if (NON_PROSE_CAPTION_OR_LABEL_REGEX.test(l)) return false;
      return countAlphabeticWords(l) >= 5;
    });

  if (meaningfulLines.length === 0) return false;

  const lastLine = meaningfulLines[meaningfulLines.length - 1];
  if (/[.!?]["')\]]*$/.test(lastLine)) {
    return false;
  }

  return (
    TRAILING_INCOMPLETE_WORD_REGEX.test(lastLine) ||
    !/[.!?]["')\]]*$/.test(lastLine)
  );
}

export function analyzeCourseworkCompleteness(rawText: string): CourseworkCompletenessPreScan {
  const text = typeof rawText === 'string' ? rawText : '';
  const rawLines = text.split(/\r?\n/);

  interface LineEntry {
    page: number;
    text: string;
  }

  const bodyLines: LineEntry[] = [];
  let currentPage = 1;
  let inToc = false;
  let tocPage = 1;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    const pageMatch = line.match(/^===\s*PAGE\s+(\d+)\s*===$/i);
    if (pageMatch) {
      currentPage = Number(pageMatch[1]) || currentPage;
      if (inToc && currentPage > tocPage) {
        // Check if next non-empty lines on the new page look like TOC continuation
        const upcoming = rawLines
          .slice(i + 1, i + 6)
          .map((l) => l.trim())
          .filter(Boolean);
        const tocLikeCount = upcoming.filter((l) => isTocEntryLine(l)).length;
        if (tocLikeCount < 2) {
          inToc = false;
        }
      }
      continue;
    }

    if (!line) {
      bodyLines.push({ page: currentPage, text: '' });
      continue;
    }

    if (/^(?:table\s+of\s+)?contents\s*:?$/i.test(line)) {
      inToc = true;
      tocPage = currentPage;
      continue;
    }

    if (/\.{3,}\s*\d{1,3}\s*$/.test(line)) {
      // Dotted-leader TOC entry anywhere in early pages
      continue;
    }

    if (inToc) {
      if (isTocEntryLine(line)) {
        continue;
      }
      const nextNonEmpty = rawLines
        .slice(i + 1)
        .map((l) => l.trim())
        .find(Boolean);
      const isProseExit = countAlphabeticWords(line) >= 10 && /[.!?]$/.test(line);
      const isCleanBodyHeading = Boolean(matchStageHeading(line)) && (!nextNonEmpty || !isTocEntryLine(nextNonEmpty));
      if (!isProseExit && !isCleanBodyHeading) {
        continue;
      }
      inToc = false;
    }

    bodyLines.push({ page: currentPage, text: line });
  }

  interface StageSlice {
    descriptor: StageDescriptor;
    headingText: string;
    page: number;
    lines: string[];
  }

  const slices: Partial<Record<CourseworkStageKey, StageSlice>> = {};
  let activeSlice: StageSlice | null = null;
  let headingCount = 0;

  for (const entry of bodyLines) {
    const matched = entry.text ? matchStageHeading(entry.text) : null;
    if (matched) {
      headingCount++;
      if (!activeSlice || activeSlice.descriptor.stageKey !== matched.stageKey) {
        if (!slices[matched.stageKey]) {
          activeSlice = {
            descriptor: matched,
            headingText: entry.text,
            page: entry.page,
            lines: [],
          };
          slices[matched.stageKey] = activeSlice;
        } else {
          activeSlice = slices[matched.stageKey]!;
        }
      }
      continue;
    }

    if (activeSlice) {
      activeSlice.lines.push(entry.text);
    }
  }

  const stages = {} as Record<CourseworkStageKey, StagePreScanResult>;

  for (const descriptor of STAGE_DESCRIPTORS) {
    const slice = slices[descriptor.stageKey];
    if (!slice) {
      stages[descriptor.stageKey] = {
        stageKey: descriptor.stageKey,
        label: descriptor.label,
        criterionNumber: descriptor.criterionNumber,
        scoreKey: descriptor.scoreKey,
        headingFound: false,
        substantiveSentenceCount: 0,
        endsMidSentence: false,
        isPlaceholderOnly: false,
        hasVisualDataMarkers: false,
        status: headingCount > 0 || text.trim().length < 200 ? 'incomplete' : 'uncertain',
        reason:
          headingCount > 0 || text.trim().length < 200
            ? `${descriptor.label} section is absent from the uploaded draft.`
            : 'No standard section headings detected; inspect full prose directly.',
      };
      continue;
    }

    const nonEmptyLines = slice.lines.map((l) => l.trim()).filter(Boolean);
    const nonPlaceholderLines = nonEmptyLines.filter((l) => !PLACEHOLDER_LINE_REGEX.test(l));
    const combinedBody = nonPlaceholderLines.join('\n');
    const isPlaceholderOnly = nonEmptyLines.length === 0 || nonPlaceholderLines.length === 0;
    const substantiveSentenceCount = countSubstantiveSentences(combinedBody);
    const endsMidSentence = !isPlaceholderOnly && detectMidSentenceCutoff(nonPlaceholderLines);
    const hasVisualDataMarkers = VISUAL_DATA_MARKER_REGEX.test(combinedBody);

    let status: PreScanStageStatus;
    let reason: string;

    if (isPlaceholderOnly) {
      status = 'incomplete';
      reason = `${descriptor.label} contains only an empty heading or placeholder note.`;
    } else if (
      descriptor.stageKey === 'data_presentation' &&
      hasVisualDataMarkers &&
      !endsMidSentence &&
      substantiveSentenceCount < 2
    ) {
      status = 'uncertain';
      reason = 'Data Presentation heading and visual figure/table labels found; verify charts/maps in document.';
    } else if (endsMidSentence) {
      status = 'incomplete';
      reason = `${descriptor.label} cuts off mid-sentence or mid-paragraph.`;
    } else if (substantiveSentenceCount < 2) {
      status = 'incomplete';
      reason = `${descriptor.label} contains fewer than two substantive sentences (${substantiveSentenceCount}).`;
    } else {
      status = 'complete';
      reason = `${descriptor.label} appears drafted (${substantiveSentenceCount} substantive sentences detected from page ${slice.page}).`;
    }

    stages[descriptor.stageKey] = {
      stageKey: descriptor.stageKey,
      label: descriptor.label,
      criterionNumber: descriptor.criterionNumber,
      scoreKey: descriptor.scoreKey,
      headingFound: true,
      headingText: slice.headingText,
      page: slice.page,
      substantiveSentenceCount,
      endsMidSentence,
      isPlaceholderOnly,
      hasVisualDataMarkers,
      status,
      reason,
    };
  }

  return {
    hasDetectedHeadings: headingCount > 0,
    stages,
  };
}

export function formatCompletenessPreScanForPrompt(
  preScan: CourseworkCompletenessPreScan
): string {
  const lines = STAGE_DESCRIPTORS.map((descriptor) => {
    const info = preScan.stages[descriptor.stageKey];
    return `- Criterion ${descriptor.criterionNumber} (${descriptor.label}): pre-scan=${info.status.toUpperCase()} | headingFound=${info.headingFound}${info.page ? ` (p.${info.page})` : ''} | substantiveSentences=${info.substantiveSentenceCount} | endsMidSentence=${info.endsMidSentence} | note: ${info.reason}`;
  });
  return `[AUTOMATED COURSEWORK STRUCTURE PRE-SCAN — verify directly against the pages and images]:\n${lines.join('\n')}`;
}

export function buildCwkEvaluationSystemPrompt(preScanSummary?: string): string {
  const preScanBlock = preScanSummary ? `\n${preScanSummary}\n` : '';

  return `You are an expert Cambridge IGCSE Geography (0460) Coursework Moderator.
First, carefully read the text or document to identify the main focus/topic (e.g., Tourism Sustainability, Sand Dunes/Psammosere, Microclimate, etc.) of the coursework. Ensure that your evaluation and comments are strictly relevant to the identified topic, rather than incorrectly assuming it is about a different topic (like rivers or coasts if it's about tourism).
Evaluate the following student coursework draft based on the "Route to Geographical Enquiry" framework.
Provide analysis across the five assessment criteria (AO1, AO2, AO2, AO2, AO3), each out of 12 (Total 60).

- Criterion 1 (AO1): Knowledge and understanding. (Terminology, aims, hypotheses & justification, expected outcomes, secondary sources)
- Criterion 2 (AO2): Observation and collection of data. (Primary logic, planning, sampling strategies & justification of methods)
- Criterion 3 (AO2): Organisation and presentation of data. (Two complex techniques, tables, maps, graphs)
- Criterion 4 (AO2): Analysis and interpretation. (Trends, anomalies, explanation based on geographical theory)
- Criterion 5 (AO3): Conclusion and Evaluation. (Link to hypotheses, evidence, critique/improvements)
${preScanBlock}
STEP 1 — MANDATORY SECTION COMPLETENESS CLASSIFICATION (CRITICAL):
Before generating feedback for Criteria 1 through 5, classify EACH of the five coursework stages as either "complete" or "incomplete":
  1. "introduction_and_hypotheses" -> mapped to Criterion 1 (ao1_knowledge)
  2. "methodology" -> mapped to Criterion 2 (ao2_observation)
  3. "data_presentation" -> mapped to Criterion 3 (ao2_organisation)
  4. "data_analysis_and_interpretation" -> mapped to Criterion 4 (ao2_analysis)
  5. "conclusion_and_evaluation" -> mapped to Criterion 5 (ao3_conclusion)

Strict definition of an INCOMPLETE section:
- A section that is completely absent from the student's uploaded draft (for example, a draft submission that ends after Data Presentation and has not yet begun Analysis, Conclusion, or Evaluation — ignore Table of Contents entries!).
- A section that cuts off mid-sentence or mid-paragraph, consists solely of an empty heading or placeholder note (e.g. "[Insert analysis]", "TODO", "Coming soon"), or contains fewer than two substantive sentences (unless Data Presentation contains completed charts/maps/tables).

STRICT NO-EBI RULE FOR INCOMPLETE SECTIONS:
- Whenever a section (and its mapped Criterion) is "incomplete":
  - Set "isIncomplete": true and provide a brief neutral "incompleteNote" (e.g. "Section incomplete in current draft, EBI feedback omitted until drafted").
  - You MUST output "ebi": [] (an EMPTY array) for that criterion.
  - NEVER produce generic filler EBIs telling the student to write a missing section (such as "Add a conclusion", "Include an evaluation section", or "Write the data analysis").
- Only generate EBI feedback for COMPLETED sections where the student has actually produced work that can be refined, deepened, or improved.

CRITERION 1 (AO1) — MANDATORY GEOGRAPHICAL JUSTIFICATION FOR HYPOTHESES (CRITICAL):
Top-band Level 3 (9 to 12 marks) descriptor: "Focuses on up to three hypotheses/guiding questions which are well justified with expected outcomes clearly stated."
When the Introduction and Hypotheses section is COMPLETE, explicitly audit and distinguish THREE separate components:
  1. The Hypothesis: the testable statement or relationship being investigated.
  2. The Expected Outcome: what the student predicts the data will show.
  3. The Geographical Justification: the real-world, environmental, socio-economic, policy, or theoretical rationale explaining WHY investigating this hypothesis matters in that specific study area.

INTERNAL GRADING CALIBRATION ONLY — NEVER INCLUDE, QUOTE, OR SUGGEST THESE EXAMPLES IN STUDENT-FACING EBI FEEDBACK:
Use these calibration benchmarks solely as your private grading standard to judge whether genuine geographical justification is present in the student's work:
- Environmental and Designation Stakes: Explaining real-world conservation or management consequences — for example, noting that a study site such as Songaksan on Jeju Island is part of a UNESCO Global Geopark subject to revalidation every four years, and that minimizing footpath erosion, litter, and environmental degradation is essential to retain Geopark status — provides a rigorous justification for investigating environmental degradation.
- Economic and Socio-Economic Stakes: Explaining structural economic mechanisms — for example, noting that minimizing Transnational Corporation (TNC) dominance reduces economic leakage and secures sustainable local wages within the host community — provides a rigorous justification for investigating economic sustainability.
- Geographical Theory and Models: Grounding hypotheses in established geographical frameworks such as carrying capacity, Butler's Tourism Area Life Cycle (TALC), limits of acceptable change, or core-periphery economic relationships.

THREE-STATE CLASSIFICATION, CONCISE FEEDBACK & MARK BAND ENFORCEMENT:
STRICT NO-SPOON-FEEDING RULE: NEVER write a justification, suggest specific site stakes/theories, or give example arguments inside any EBI item. State ONLY whether justification is missing or partially justified alongside a concise EBI target.
Classify completed Introduction hypotheses via "hypothesis_audit.justificationStatus" into one of three states:
1. "missing" ("hasSubstantiveGeographicalJustification": false):
   - Hypotheses are stated (even with expected outcomes) without geographical justification.
   - Output a concise Criterion 1 EBI anchored to the Hypotheses block starting with "Hypotheses justification missing" plus a brief EBI target ONLY (no sample rationale or examples).
   - ENFORCE MARK CEILING: Cap Criterion 1 within Level 2 (5 to 8 marks) or lower (cannot award Level 3 9 to 12 marks).
2. "partial" ("hasSubstantiveGeographicalJustification": false):
   - Justification is attempted, but weak, surface-level, or not strong enough for Level 3.
   - Output a concise Criterion 1 EBI anchored to the Hypotheses block starting with "Hypotheses partially justified" plus a brief EBI target ONLY (no sample rationale or examples).
   - ENFORCE MARK CEILING: Cap Criterion 1 within Level 2 (5 to 8 marks) or lower (cannot award Level 3 9 to 12 marks).
3. "present" ("hasSubstantiveGeographicalJustification": true):
   - Substantive location-specific, socio-economic/environmental, or theoretical justification is clearly present.
   - Credit it as a Criterion 1 WWW item starting with "Hypotheses justification present" (Level 3 9 to 12 marks is eligible if other Level 3 criteria are met; do NOT output a hypothesis-justification EBI).

CRITERION 2 (AO2) — MANDATORY JUSTIFICATION OF METHODS & SAMPLING STRATEGIES (CRITICAL):
Top-band Level 3 (9 to 12 marks) descriptors: "Demonstrates comprehensive and relevant planning." and "Detailed reference and justification of sampling strategy(ies) used."
When the Methodology section is COMPLETE, explicitly audit and distinguish THREE separate components:
  1. The Data Collection Methods: the fieldwork instruments, observations, measurements, or surveys described.
  2. The Sampling Strategy & Planning: the sampling type (e.g., stratified, systematic, random), sample sizes, site selection, timing, and practical planning.
  3. The Methodological Justification: the analytical rationale explaining WHY each method, site choice, sample size, and sampling strategy was selected over alternatives to test the hypotheses accurately and reliably.

INTERNAL GRADING CALIBRATION ONLY — NEVER INCLUDE, QUOTE, OR SUGGEST THESE EXAMPLES IN STUDENT-FACING EBI FEEDBACK:
Use these calibration benchmarks solely as your private grading standard to judge whether genuine methodological justification is present in the student's work:
- Method-to-Hypothesis Alignment: Explaining specifically why a chosen measurement, index, or survey question directly generates the quantitative/qualitative evidence needed to test a stated hypothesis.
- Sampling Rationale & Bias Mitigation: Explaining why a particular sampling strategy and sample size ensure representativeness across contrasting land uses/zones, maintain even spatial coverage, or reduce selection and researcher bias (or why random/stratified/systematic choices fit site constraints).
- Reliability & Practical Rigor: Explaining standardization (e.g., pilot testing, timing controls, standardized scoring criteria, or repeatability protocols) so data remain consistent across sites or observers.

THREE-STATE CLASSIFICATION, CONCISE FEEDBACK & MARK BAND ENFORCEMENT (CRITERION 2):
STRICT NO-SPOON-FEEDING RULE: NEVER write a justification, suggest specific sampling rationales, or give example arguments inside any EBI item. State ONLY whether justification is missing or partially justified alongside a concise EBI target.
Classify completed Methodology methods via "methodology_audit.justificationStatus" into one of three states:
1. "missing" ("hasSubstantiveMethodJustification": false):
   - Methods/sampling are merely described (what was done) without justifying why they were chosen.
   - Output a concise Criterion 2 EBI anchored to the Methodology block starting with "Methods justification missing" plus a brief EBI target ONLY (no sample rationale or examples).
   - ENFORCE MARK CEILING: Cap Criterion 2 within Level 2 (5 to 8 marks) or lower (cannot award Level 3 9 to 12 marks).
2. "partial" ("hasSubstantiveMethodJustification": false):
   - Justification is attempted for some methods/sampling choices, or remains generic/surface-level and not strong enough for Level 3.
   - Output a concise Criterion 2 EBI anchored to the Methodology block starting with "Methods partially justified" plus a brief EBI target ONLY (no sample rationale or examples).
   - ENFORCE MARK CEILING: Cap Criterion 2 within Level 2 (5 to 8 marks) or lower (cannot award Level 3 9 to 12 marks).
3. "present" ("hasSubstantiveMethodJustification": true):
   - Substantive justification is provided for data collection methods, site selection, and sampling strategies.
   - Credit it as a Criterion 2 WWW item starting with "Methods justification present" (Level 3 9 to 12 marks is eligible if other Level 3 criteria are met; do NOT output a methods-justification EBI).

CLOSE-READING & GROUNDING REQUIREMENTS (CRITICAL):
- The coursework is segmented with explicit page markers ('=== PAGE 1 ===', '=== PAGE 2 ===', ..., '=== PAGE N ===').
- Perform a genuine close read of every page. NEVER assign pages sequentially by criterion number (e.g. do NOT put Criterion 1 on page 1, Criterion 2 on page 2, Criterion 3 on page 3, etc.).
- Instead, locate the ACTUAL page (1 to N) and vertical position where each piece of evidence (for WWW) or omission/gap in a COMPLETED section (for EBI) physically appears (ignoring the Table of Contents page when locating actual body sections, tables, graphs, maps, analysis, and conclusions).
- For an EBI citing a missing feature in a COMPLETED section (e.g., missing justification in Hypotheses, missing justification of methods in Methodology, missing complex technique in Data Presentation, or missing evaluation of sampling in Conclusion), anchor it to the exact heading or concluding paragraph of that relevant section in the coursework.

For EVERY WWW and EBI item, output a structured object with:
- "id": unique string (e.g. "c1-www-1", "c1-ebi-1")
- "code": reference code ("1.1A", "1.2A" for Criterion 1 WWW; "1.1B", "1.2B" for Criterion 1 EBI; "2.1A" / "2.1B" for Criterion 2, etc.)
- "type": "WWW" or "EBI"
- "text": concise, specific moderation feedback string
- "ragColor":
  - For "WWW" items: "green" when associated with Level 3 top-band achievement (9-12 marks or strong criterion mastery), or "amber" when associated with Level 1-2 middle/lower-band achievement (1-8 marks).
  - For "EBI" items: ALWAYS "light_red".
- "isChecked": true
- "pdfLocation": {
    "page": number (exact 1-based page number from the '=== PAGE N ===' markers where the evidence or gap occurs),
    "xPercent": 2.5,
    "yPercent": number (estimated 5 to 95 vertical percentage down that page where the relevant paragraph, figure, or heading sits),
    "anchorQuote": "string (verbatim 4 to 12 word quote copied directly from the target paragraph, heading, figure caption, or table on that page)",
    "anchorRationale": "string (1-sentence explanation of why this badge sits beside this specific quote/section)"
  }

Respond in the following JSON format ONLY:
{
  "section_completeness": {
    "introduction_and_hypotheses": { "status": "complete" | "incomplete", "reason": "string" },
    "methodology": { "status": "complete" | "incomplete", "reason": "string" },
    "data_presentation": { "status": "complete" | "incomplete", "reason": "string" },
    "data_analysis_and_interpretation": { "status": "complete" | "incomplete", "reason": "string" },
    "conclusion_and_evaluation": { "status": "complete" | "incomplete", "reason": "string" }
  },
  "hypothesis_audit": {
    "hasHypotheses": boolean,
    "hasExpectedOutcomes": boolean,
    "hasSubstantiveGeographicalJustification": boolean,
    "justificationStatus": "missing" | "partial" | "present",
    "justificationSummary": "string",
    "hypothesesAnchorQuote": "string (4-12 word verbatim quote from the hypotheses block, or empty string if absent)",
    "hypothesesPage": number,
    "hypothesesYPercent": number
  },
  "methodology_audit": {
    "hasMethods": boolean,
    "hasSamplingStrategy": boolean,
    "hasSubstantiveMethodJustification": boolean,
    "justificationStatus": "missing" | "partial" | "present",
    "justificationSummary": "string",
    "methodsAnchorQuote": "string (4-12 word verbatim quote from the methodology block, or empty string if absent)",
    "methodsPage": number,
    "methodsYPercent": number
  },
  "scores": {
    "ao1_knowledge": { "score": number, "isIncomplete": boolean, "incompleteNote": "string", "www": [{ "id": "string", "code": "1.1A", "type": "WWW", "text": "string", "ragColor": "green" | "amber", "isChecked": true, "pdfLocation": { "page": number, "xPercent": 2.5, "yPercent": number, "anchorQuote": "string", "anchorRationale": "string" } }], "ebi": [{ "id": "string", "code": "1.1B", "type": "EBI", "text": "string", "ragColor": "light_red", "isChecked": true, "pdfLocation": { "page": number, "xPercent": 2.5, "yPercent": number, "anchorQuote": "string", "anchorRationale": "string" } }] },
    "ao2_observation": { "score": number, "isIncomplete": boolean, "incompleteNote": "string", "www": [CwkFeedbackItem], "ebi": [CwkFeedbackItem] },
    "ao2_organisation": { "score": number, "isIncomplete": boolean, "incompleteNote": "string", "www": [CwkFeedbackItem], "ebi": [CwkFeedbackItem] },
    "ao2_analysis": { "score": number, "isIncomplete": boolean, "incompleteNote": "string", "www": [CwkFeedbackItem], "ebi": [CwkFeedbackItem] },
    "ao3_conclusion": { "score": number, "isIncomplete": boolean, "incompleteNote": "string", "www": [CwkFeedbackItem], "ebi": [CwkFeedbackItem] }
  },
  "total_score": number,
  "word_counts": {
    "evaluated_payload": number,
    "excluded_ancillaries": number,
    "raw_file_extract": number
  },
  "moderator_executive_summary": "string"
}`;
}

function buildAuditLocation(
  defaultPage: number,
  rawPage: number | undefined,
  rawYPercent: number | undefined,
  rawAnchorQuote: string | undefined,
  anchorRationale: string
): CwkFeedbackItem['pdfLocation'] {
  const page =
    typeof rawPage === 'number' && rawPage >= 1
      ? Math.round(rawPage)
      : defaultPage;
  const yPercent =
    typeof rawYPercent === 'number' && Number.isFinite(rawYPercent)
      ? clampNumber(rawYPercent, 5, 95)
      : 35;
  const anchorQuote =
    typeof rawAnchorQuote === 'string'
      ? rawAnchorQuote.trim()
      : '';

  return {
    page,
    xPercent: 2.5,
    yPercent,
    anchorQuote,
    anchorRationale,
  };
}

interface JustificationGuardrailConfig {
  criterionNumber: number;
  scoreObj: any;
  rawStatus?: JustificationStatus;
  hasSubstantiveJustification?: boolean;
  syncFields: (status: JustificationStatus) => void;
  defaultPage: number;
  page?: number;
  yPercent?: number;
  anchorQuote?: string;
  matchRegex: RegExp;
  leakRegex: RegExp;
  missingText: string;
  partialText: string;
  presentText: string;
  ebiRationale: string;
  wwwRationale: string;
}

function applyJustificationAuditGuardrail(config: JustificationGuardrailConfig): boolean {
  const {
    criterionNumber,
    scoreObj,
    rawStatus,
    hasSubstantiveJustification,
    syncFields,
    defaultPage,
    page,
    yPercent,
    anchorQuote,
    matchRegex,
    leakRegex,
    missingText,
    partialText,
    presentText,
    ebiRationale,
    wwwRationale,
  } = config;

  const status: JustificationStatus =
    rawStatus === 'present' || rawStatus === 'partial' || rawStatus === 'missing'
      ? rawStatus
      : hasSubstantiveJustification
        ? 'present'
        : 'missing';

  syncFields(status);

  if (status === 'missing' || status === 'partial') {
    const currentScore = Number(scoreObj.score ?? 0);
    if (Number.isFinite(currentScore) && currentScore > 8) {
      scoreObj.score = 8;
    }

    const targetText = status === 'partial' ? partialText : missingText;
    const ebiList: Array<CwkFeedbackItem | string> = Array.isArray(scoreObj.ebi) ? [...scoreObj.ebi] : [];
    let hasJustificationEbi = false;

    for (let i = 0; i < ebiList.length; i++) {
      const entry = ebiList[i];
      const entryText = getFeedbackItemText(entry);
      if (!matchRegex.test(entryText)) continue;

      hasJustificationEbi = true;
      if (leakRegex.test(entryText)) {
        if (typeof entry === 'string') {
          ebiList[i] = {
            id: `c${criterionNumber}-ebi-${i + 1}`,
            code: `${criterionNumber}.${i + 1}B`,
            type: 'EBI',
            text: targetText,
            ragColor: 'light_red',
            isChecked: true,
            pdfLocation: buildAuditLocation(defaultPage, page, yPercent, anchorQuote, ebiRationale),
          };
        } else {
          ebiList[i] = { ...entry, text: targetText };
        }
      }
    }

    if (!hasJustificationEbi) {
      ebiList.push({
        id: `c${criterionNumber}-ebi-${ebiList.length + 1}`,
        code: `${criterionNumber}.${ebiList.length + 1}B`,
        type: 'EBI',
        text: targetText,
        ragColor: 'light_red',
        isChecked: true,
        pdfLocation: buildAuditLocation(defaultPage, page, yPercent, anchorQuote, ebiRationale),
      });
    }

    scoreObj.ebi = ebiList;
    return true;
  }

  const wwwList: Array<CwkFeedbackItem | string> = Array.isArray(scoreObj.www) ? [...scoreObj.www] : [];
  const hasJustificationWww = wwwList.some((item) => matchRegex.test(getFeedbackItemText(item)));
  if (!hasJustificationWww) {
    wwwList.push({
      id: `c${criterionNumber}-www-${wwwList.length + 1}`,
      code: `${criterionNumber}.${wwwList.length + 1}A`,
      type: 'WWW',
      text: presentText,
      ragColor: Number(scoreObj.score ?? 0) >= 9 ? 'green' : 'amber',
      isChecked: true,
      pdfLocation: buildAuditLocation(defaultPage, page, yPercent, anchorQuote, wwwRationale),
    });
    scoreObj.www = wwwList;
  }
  return false;
}

export function postProcessEvaluationResult<T extends Record<string, any>>(
  rawEvaluation: T,
  teacherScores?: Record<string, number>
): T {
  if (!rawEvaluation || typeof rawEvaluation !== 'object') {
    return rawEvaluation;
  }

  const copy: any = JSON.parse(JSON.stringify(rawEvaluation));
  if (!copy.scores || typeof copy.scores !== 'object') {
    return copy;
  }

  // Rule A: Incomplete section synchronisation & filler-EBI guardrail
  for (const [stageKey, scoreKey] of Object.entries(STAGE_KEY_TO_SCORE_KEY) as Array<
    [CourseworkStageKey, keyof EvaluationResult['scores']]
  >) {
    const crit = copy.scores[scoreKey];
    if (!crit || typeof crit !== 'object') continue;

    const stageEntry = copy.section_completeness?.[stageKey];
    let isIncomplete =
      crit.isIncomplete === true || stageEntry?.status === 'incomplete';

    const rawWww = Array.isArray(crit.www) ? crit.www : [];
    const rawEbi = Array.isArray(crit.ebi) ? crit.ebi : [];

    if (!isIncomplete && Number(crit.score ?? 0) === 0 && rawWww.length === 0 && rawEbi.length > 0) {
      const allFiller = rawEbi.every((item: CwkFeedbackItem | string) =>
        MISSING_SECTION_FILLER_EBI_REGEX.test(getFeedbackItemText(item))
      );
      if (allFiller) {
        isIncomplete = true;
      }
    }

    if (isIncomplete) {
      const note =
        typeof crit.incompleteNote === 'string' && crit.incompleteNote.trim()
          ? crit.incompleteNote.trim()
          : typeof stageEntry?.reason === 'string' && stageEntry.reason.trim()
            ? stageEntry.reason.trim()
            : DEFAULT_INCOMPLETE_EBI_NOTICE;
      crit.isIncomplete = true;
      crit.incompleteNote = note;
      crit.ebi = [];

      if (copy.section_completeness && typeof copy.section_completeness === 'object') {
        copy.section_completeness[stageKey] = {
          status: 'incomplete',
          reason: note,
        };
      }
    } else {
      crit.isIncomplete = false;
      delete crit.incompleteNote;
    }
  }

  let shouldRecomputeTotal = false;

  // Rule B: Criterion 1 Hypothesis Justification Ceiling, 3-State Concise Target & No-Spoon-Feeding Guardrail
  const ao1 = copy.scores.ao1_knowledge;
  const hypAudit: HypothesisAudit | undefined = copy.hypothesis_audit;
  if (ao1 && !ao1.isIncomplete && hypAudit && hypAudit.hasHypotheses === true) {
    const capped = applyJustificationAuditGuardrail({
      criterionNumber: 1,
      scoreObj: ao1,
      rawStatus: hypAudit.justificationStatus,
      hasSubstantiveJustification: hypAudit.hasSubstantiveGeographicalJustification,
      syncFields: (status) => {
        hypAudit.justificationStatus = status;
        hypAudit.hasSubstantiveGeographicalJustification = status === 'present';
      },
      defaultPage: 1,
      page: hypAudit.hypothesesPage,
      yPercent: hypAudit.hypothesesYPercent,
      anchorQuote: hypAudit.hypothesesAnchorQuote,
      matchRegex: HYPOTHESIS_JUSTIFICATION_EBI_REGEX,
      leakRegex: SPOON_FED_JUSTIFICATION_LEAK_REGEX,
      missingText: MISSING_HYPOTHESIS_JUSTIFICATION_EBI,
      partialText: PARTIAL_HYPOTHESIS_JUSTIFICATION_EBI,
      presentText: PRESENT_HYPOTHESIS_JUSTIFICATION_WWW,
      ebiRationale: 'Anchored to the Hypotheses section to indicate missing or partial geographical justification.',
      wwwRationale: 'Anchored to the Hypotheses section where geographical justification is present.',
    });
    if (capped) shouldRecomputeTotal = true;
  }

  // Rule C: Criterion 2 Methods & Sampling Justification Ceiling, 3-State Concise Target & No-Spoon-Feeding Guardrail
  const ao2 = copy.scores.ao2_observation;
  const methodAudit: MethodologyAudit | undefined = copy.methodology_audit;
  if (ao2 && !ao2.isIncomplete && methodAudit && methodAudit.hasMethods === true) {
    const capped = applyJustificationAuditGuardrail({
      criterionNumber: 2,
      scoreObj: ao2,
      rawStatus: methodAudit.justificationStatus,
      hasSubstantiveJustification: methodAudit.hasSubstantiveMethodJustification,
      syncFields: (status) => {
        methodAudit.justificationStatus = status;
        methodAudit.hasSubstantiveMethodJustification = status === 'present';
      },
      defaultPage: 2,
      page: methodAudit.methodsPage,
      yPercent: methodAudit.methodsYPercent,
      anchorQuote: methodAudit.methodsAnchorQuote,
      matchRegex: METHOD_JUSTIFICATION_EBI_REGEX,
      leakRegex: SPOON_FED_METHOD_LEAK_REGEX,
      missingText: MISSING_METHOD_JUSTIFICATION_EBI,
      partialText: PARTIAL_METHOD_JUSTIFICATION_EBI,
      presentText: PRESENT_METHOD_JUSTIFICATION_WWW,
      ebiRationale: 'Anchored to the Methodology section to indicate missing or partial justification of methods.',
      wwwRationale: 'Anchored to the Methodology section where justification of methods is present.',
    });
    if (capped) shouldRecomputeTotal = true;
  }

  if (shouldRecomputeTotal) {
    const scoreKeys: Array<keyof EvaluationResult['scores']> = [
      'ao1_knowledge',
      'ao2_observation',
      'ao2_organisation',
      'ao2_analysis',
      'ao3_conclusion',
    ];
    copy.total_score = scoreKeys.reduce((sum, key) => {
      const val = Number(copy.scores[key]?.score ?? 0);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);
  }

  return normalizeEvaluationResult(copy, teacherScores);
}
