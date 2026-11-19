import { jsPDF } from 'jspdf';
import { StudentSubmission } from './db';
import { parseCandidateName } from './nameParser';
import { ComparativeEvaluationResult } from './types';
import { IGQA_CRITERION_RUBRICS } from './data/igqaCriterionRubrics';
import {
  CwkFeedbackItem,
  DEFAULT_INCOMPLETE_EBI_NOTICE,
  RAG_STYLES,
  getDraftGradeAndBand,
  getDraftGradeBand,
  getFeedbackItemText,
  normalizeEvaluationResult,
  normalizeFeedbackItems,
} from './utils/ragStyles';

export { getDraftGradeAndBand, getDraftGradeBand } from './utils/ragStyles';

export function downloadComparativeFeedbackPDF(evaluation: ComparativeEvaluationResult, cwk1Name: string, cwk2Name: string) {
  const doc = new jsPDF();
  let y = 20;

  const colors = {
    primary: [15, 23, 42],
    secondary: [100, 116, 139],
    cwk1: [0, 153, 102], // #009966
    cwk2: [21, 93, 252], // #155dfc
    cwk1Bg: [236, 253, 245],
    cwk2Bg: [239, 246, 255],
  };

  // Setup Title Layer
  // Thick blue branded banner
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, 210, 20, 'F');
  
  // App logo: IG square
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 4, 12, 12, 1, 1, 'F');
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('IG', 16, 12, { align: 'center' });

  // Lettering
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('CWK Quality Assurance', 26, 12);

  // Background light fill
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 20, 210, 280, 'F');

  // CWK 1 Card
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 25, 80, 25, 2, 2, 'FD'); 
  doc.setDrawColor(colors.cwk1[0], colors.cwk1[1], colors.cwk1[2]);
  doc.setLineWidth(1.5);
  doc.line(18, 25, 92, 25);
  
  doc.setFontSize(8);
  doc.setTextColor(colors.cwk1[0], colors.cwk1[1], colors.cwk1[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`CWK 1: ${cwk1Name.toUpperCase()}`, 55, 32, { align: 'center' });
  
  doc.setFontSize(22);
  doc.text(`${evaluation.cwk1_total_score}`, 53, 44, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`/ 60`, 59, 44);

  // VS text
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VS', 105, 41, { align: 'center' });

  // CWK 2 Card
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(115, 25, 80, 25, 2, 2, 'FD'); 
  doc.setDrawColor(colors.cwk2[0], colors.cwk2[1], colors.cwk2[2]);
  doc.setLineWidth(1.5);
  doc.line(118, 25, 192, 25);
  
  doc.setFontSize(8);
  doc.setTextColor(colors.cwk2[0], colors.cwk2[1], colors.cwk2[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`CWK 2: ${cwk2Name.toUpperCase()}`, 155, 32, { align: 'center' });
  
  doc.setFontSize(22);
  doc.text(`${evaluation.cwk2_total_score}`, 153, 44, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`/ 60`, 159, 44);

  y = 57;

  const labels: Record<string, string> = {
    ao1_knowledge: 'AO1: Knowledge & Understanding',
    ao2_observation: 'AO2: Observation & Collection',
    ao2_organisation: 'AO2: Organisation & Presentation',
    ao2_analysis: 'AO2: Analysis & Interpretation',
    ao3_conclusion: 'AO3: Conclusion & Evaluation'
  };

  // Executive Summary
  doc.setFillColor(15, 23, 42); // slate-900
  const modLines = doc.splitTextToSize(evaluation.moderator_executive_summary || '', 170);
  const noteHeight = 16 + modLines.length * 4 + 4; // Add padding at bottom
  doc.roundedRect(15, y, 180, noteHeight, 3, 3, 'F'); // Dynamic background box
  doc.setTextColor(colors.cwk1[0], colors.cwk1[1], colors.cwk1[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`MODERATOR NOTE`, 20, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(modLines, 20, y + 14);
  y += noteHeight + 10;

  if (y > 250) { doc.addPage(); y = 20; }

  Object.entries(evaluation.criteria).forEach(([key, res]) => {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    // Criterion Header
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, y - 6, 170, 14, 2, 2, 'F');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${labels[key]}`, 24, y + 3);

    y += 16;
    let baselineY = y; // to track max height in parallel columns

    const drawCol = (xPos: number, score: number, www: (string | CwkFeedbackItem)[], ebi: (string | CwkFeedbackItem)[], colColor: number[]) => {
      let localY = y;
      
      const width = 80;
      doc.setTextColor(colColor[0], colColor[1], colColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${score} / 12`, xPos + width - 15, localY);
      localY += 6;

      const indexMap: Record<string, number> = {
        ao1_knowledge: 1, ao2_observation: 2, ao2_organisation: 3, ao2_analysis: 4, ao3_conclusion: 5
      };
      const critNum = indexMap[key] || 1;

      doc.setFontSize(10);
      doc.text('A) What Went Well (WWW)', xPos, localY);
      localY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      if (www && www.length > 0) {
        www.forEach((item: string | CwkFeedbackItem, i: number) => {
          const lines = doc.splitTextToSize(`${critNum}.${i + 1}A) ${getFeedbackItemText(item)}`, width);
          doc.text(lines, xPos, localY);
          localY += lines.length * 5;
        });
      } else {
        doc.text(`None`, xPos, localY);
        localY += 5;
      }
      
      localY += 4;
      doc.setTextColor(colColor[0], colColor[1], colColor[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('B) Even Better If (EBI)', xPos, localY);
      localY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      if (ebi && ebi.length > 0) {
        ebi.forEach((item: string | CwkFeedbackItem, i: number) => {
          const lines = doc.splitTextToSize(`${critNum}.${i + 1}B) ${getFeedbackItemText(item)}`, width);
          doc.text(lines, xPos, localY);
          localY += lines.length * 5;
        });
      } else {
        doc.text(`None`, xPos, localY);
        localY += 5;
      }

      return localY;
    };

    const cwk1EndY = drawCol(20, res.cwk1_score, res.cwk1_www, res.cwk1_ebi, colors.cwk1);
    const cwk2EndY = drawCol(110, res.cwk2_score, res.cwk2_www, res.cwk2_ebi, colors.cwk2);
    
    y = Math.max(cwk1EndY, cwk2EndY) + 5;

    // Draw connecting line / divider
    doc.setDrawColor(226, 232, 240);
    doc.line(105, baselineY, 105, y - 5);

    if (y > 260) { doc.addPage(); y = 20; }

    // Comparative Feedback
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, y, 170, 8 + (doc.splitTextToSize(res.comparative_feedback || '', 160).length * 5), 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('COMPARATIVE FEEDBACK', 24, y + 6);
    y += 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    const fLines = doc.splitTextToSize(res.comparative_feedback || '', 160);
    doc.text(fLines, 24, y);
    y += fLines.length * 5 + 10;
  });

  doc.save(`Comparative_Report_CWK1_vs_CWK2.pdf`);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return [248, 250, 252];
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [
    Number.isFinite(r) ? r : 248,
    Number.isFinite(g) ? g : 250,
    Number.isFinite(b) ? b : 252,
  ];
}

const REPORT_BODY_FONT_PT = 8.2;

function drawCriterionRubricTable(
  doc: jsPDF,
  criterionNumber: number,
  startX: number,
  startY: number,
  totalWidth: number,
  maxPageY = 285
): number {
  const rubric = IGQA_CRITERION_RUBRICS[criterionNumber];
  if (!rubric) return startY;

  const colLevelW = 14;
  const colMarksW = 21;
  const colDescW = totalWidth - colLevelW - colMarksW;
  const descX = startX + colLevelW;
  const marksX = descX + colDescW;
  const borderColor: [number, number, number] = [30, 41, 59]; // #1E293B
  const textColor: [number, number, number] = [15, 23, 42]; // #0F172A

  const titleH = 6.2;
  const headerH = 5.4;
  const bulletLineH = 3.45;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(REPORT_BODY_FONT_PT);
  const bandLayouts = rubric.bands.map((band) => {
    const rowLayouts = band.bullets.map((bullet) => {
      const lines = doc.splitTextToSize(bullet, colDescW - 4.4) as string[];
      const rowH = Math.max(4.8, lines.length * bulletLineH + 1.45);
      return { lines, rowH };
    });
    const bandH = rowLayouts.reduce((sum, r) => sum + r.rowH, 0);
    return { band, rowLayouts, bandH };
  });

  const totalTableH =
    titleH + headerH + bandLayouts.reduce((sum, item) => sum + item.bandH, 0);

  let y = startY;
  if (startY > 14 && startY + totalTableH > maxPageY) {
    doc.addPage();
    y = 12;
  }

  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.28);

  // Full rubric title row
  doc.setFillColor(241, 245, 249); // #F1F5F9
  doc.rect(startX, y, totalWidth, titleH, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(REPORT_BODY_FONT_PT);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(rubric.fullTitle, startX + totalWidth / 2, y + 4.3, { align: 'center' });
  y += titleH;

  // Column headers row
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.rect(startX, y, totalWidth, headerH, 'FD');
  doc.line(descX, y, descX, y + headerH);
  doc.line(marksX, y, marksX, y + headerH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(REPORT_BODY_FONT_PT);
  doc.text('Level', startX + colLevelW / 2, y + 3.8, { align: 'center' });
  doc.text('Description', descX + 2.2, y + 3.8);
  doc.text('Marks', marksX + colMarksW / 2, y + 3.8, { align: 'center' });
  y += headerH;

  // Bands rows
  for (const { band, rowLayouts, bandH } of bandLayouts) {
    const bandTopY = y;
    const [r, g, b] = hexToRgb(band.bgColor);

    // Fill band background color
    doc.setFillColor(r, g, b);
    doc.rect(startX, bandTopY, totalWidth, bandH, 'F');

    // Merged outer borders for Level and Marks cells
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.rect(startX, bandTopY, colLevelW, bandH, 'S');
    doc.rect(marksX, bandTopY, colMarksW, bandH, 'S');

    // Centered Level and Marks labels
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(REPORT_BODY_FONT_PT);
    const centerBaselineY = bandTopY + bandH / 2 + 1.1;
    doc.text(String(band.level), startX + colLevelW / 2, centerBaselineY, { align: 'center' });
    doc.text(band.marks, marksX + colMarksW / 2, centerBaselineY, { align: 'center' });

    // Description rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(REPORT_BODY_FONT_PT);
    let rowY = bandTopY;
    for (const row of rowLayouts) {
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.rect(descX, rowY, colDescW, row.rowH, 'S');
      row.lines.forEach((line, idx) => {
        doc.text(line, descX + 2.2, rowY + 3.4 + idx * bulletLineH);
      });
      rowY += row.rowH;
    }

    y = bandTopY + bandH;
  }

  return y;
}

export function buildFeedbackPDFDoc(student: StudentSubmission, type: 'draft' | 'final'): jsPDF | null {
  const evalData = type === 'draft' ? student.draftEvaluation : student.finalEvaluation;
  const teacherMarks = type === 'draft' ? student.draftTeacherScores : student.finalTeacherScores;

  if (!evalData) {
    return null;
  }

  const normalizedEval = normalizeEvaluationResult(evalData, teacherMarks);
  const { formattedName } = parseCandidateName(student.candidateName);

  const doc = new jsPDF();
  const pageLeft = 12;
  const contentW = 186;
  const maxPageY = 285;

  const colors = {
    primary: [15, 23, 42] as [number, number, number],     // #0F172A
    bodySlate: [30, 41, 59] as [number, number, number],   // #1E293B
    secondary: [100, 116, 139] as [number, number, number], // #64748B
    accent: [37, 99, 235] as [number, number, number],      // #2563EB
    accentDark: [29, 78, 216] as [number, number, number],  // #1D4ED8
    surface: [248, 250, 252] as [number, number, number],   // #F8FAFC
    border: [203, 213, 225] as [number, number, number],    // #CBD5E1
    divider: [226, 232, 240] as [number, number, number],   // #E2E8F0
  };

  const isDraft = type === 'draft';
  const stageLabel = `${type.toUpperCase()} CWK`;

  const criteria = [
    { key: 'ao1_knowledge', num: 1, label: 'Knowledge & Understanding (AO1)' },
    { key: 'ao2_observation', num: 2, label: 'Observation and collection of data (AO2)' },
    { key: 'ao2_organisation', num: 3, label: 'Organisation and presentation of data (AO2)' },
    { key: 'ao2_analysis', num: 4, label: 'Analysis and interpretation (AO2)' },
    { key: 'ao3_conclusion', num: 5, label: 'Conclusion and Evaluation (AO3)' },
  ] as const;

  let totalTeacherScore = 0;
  criteria.forEach((c) => {
    const fallbackScore = Number((normalizedEval?.scores as any)?.[c.key]?.score ?? 0);
    const teacherScore = teacherMarks ? (teacherMarks[c.key] ?? fallbackScore) : fallbackScore;
    totalTeacherScore += Number(teacherScore);
  });

  const draftGrade = getDraftGradeAndBand(totalTeacherScore);
  const wordCount = normalizedEval.word_counts?.evaluated_payload || 0;

  // ==========================================
  // PAGE 1: CLEAN HEADER + EXEC SUMMARY + CRITERION 1
  // ==========================================
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedName, pageLeft, 18.5);

  doc.setFillColor(239, 246, 255); // #EFF6FF
  doc.setDrawColor(147, 197, 253); // #93C5FD
  doc.setLineWidth(0.3);
  doc.roundedRect(pageLeft, 21.5, 24, 5.2, 1.2, 1.2, 'FD');
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(stageLabel, pageLeft + 12, 25.1, { align: 'center' });

  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Class: ${student.className}    |    Assessment: ${student.assignmentName}`, pageLeft, 31.2);

  // Top-right Metrics (No IGQA AI score anywhere; Draft displays ONLY Grade & Band without raw score)
  const metric1X = 116;
  const wordX = 166;

  if (isDraft) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text('GRADE & BAND', metric1X, 15.5);

    doc.setFontSize(16);
    doc.text(draftGrade.label, metric1X, 24);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text('TEACHER MODERATED', metric1X, 15.5);

    const scoreStr = `${totalTeacherScore}`;
    doc.setFontSize(17);
    doc.text(scoreStr, metric1X, 24);
    const scoreW = doc.getTextWidth(scoreStr);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text('/ 60', metric1X + scoreW + 1.8, 24);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('WORD COUNT', wordX, 15.5);

  const wcStr = `${wordCount}`;
  doc.setFontSize(16);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(wcStr, wordX, 24);
  const wcW = doc.getTextWidth(wcStr);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('WORDS', wordX + wcW + 2, 24);

  // Subtle horizontal divider rule
  doc.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
  doc.setLineWidth(0.35);
  doc.line(pageLeft, 34.8, pageLeft + contentW, 34.8);

  // Moderator Executive Summary Card (Light Grey + IG Suite Blue Accent)
  let y = 38.5;
  const summaryText =
    normalizedEval.moderator_executive_summary || 'No executive summary provided.';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(REPORT_BODY_FONT_PT);
  const summaryLines = doc.splitTextToSize(summaryText, contentW - 10) as string[];
  const summaryLineH = 3.5;

  const drawExecutiveSummaryBox = (
    topY: number,
    lines: string[],
    includeHeading: boolean
  ): number => {
    const headerBlockH = includeHeading ? 12.2 : 6.2;
    const h = headerBlockH + lines.length * summaryLineH + 2.4;

    doc.setFillColor(colors.surface[0], colors.surface[1], colors.surface[2]);
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.35);
    doc.roundedRect(pageLeft, topY, contentW, h, 2, 2, 'FD');

    // Left blue accent bar
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(pageLeft, topY + 0.5, 1.4, h - 1, 'F');

    let textStartY = topY + 5.2;
    if (includeHeading) {
      doc.setTextColor(colors.accentDark[0], colors.accentDark[1], colors.accentDark[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`MODERATOR EXECUTIVE SUMMARY (${stageLabel})`, pageLeft + 5, topY + 6.3);

      doc.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
      doc.setLineWidth(0.25);
      doc.line(pageLeft + 5, topY + 8.5, pageLeft + contentW - 4, topY + 8.5);
      textStartY = topY + 12.6;
    }

    doc.setTextColor(colors.bodySlate[0], colors.bodySlate[1], colors.bodySlate[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(REPORT_BODY_FONT_PT);
    lines.forEach((line, idx) => {
      doc.text(line, pageLeft + 5, textStartY + idx * summaryLineH);
    });

    return topY + h;
  };

  const maxLinesFirstPage = Math.max(4, Math.floor((maxPageY - y - 16) / summaryLineH));
  const firstChunk = summaryLines.slice(0, maxLinesFirstPage);
  const remainingChunk = summaryLines.slice(maxLinesFirstPage);

  y = drawExecutiveSummaryBox(y, firstChunk, true);

  if (remainingChunk.length > 0) {
    doc.addPage();
    y = drawExecutiveSummaryBox(12, remainingChunk, false);
  }

  y += 4.5;

  // ==========================================
  // CRITERION 1 ON PAGE 1 + CRITERIA 2–5 ON FRESH PAGES
  // ==========================================
  criteria.forEach((crit) => {
    const res = (normalizedEval?.scores as any)?.[crit.key];
    if (!res) return;

    const fallbackScore = Number(res.score ?? 0);
    const teacherScore = teacherMarks ? (teacherMarks[crit.key] ?? fallbackScore) : fallbackScore;
    const critNum = crit.num;

    // Criterion 1 starts immediately on Page 1; Criteria 2–5 force a fresh page
    if (critNum > 1) {
      doc.addPage();
      y = 12;
    }

    // 1. Full Expanded Criterion RAG Rubric Table FIRST
    y = drawCriterionRubricTable(doc, critNum, pageLeft, y, contentW, maxPageY);
    y += 3.5;

    // 2. Criterion Header Bar directly below the rubric table
    const headerH = 8.5;
    if (y + headerH + 16 > maxPageY) {
      doc.addPage();
      y = 12;
    }

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(pageLeft, y, contentW, headerH, 2, 2, 'FD');

    // Blue criterion number square
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.roundedRect(pageLeft + 2.5, y + 1.5, 5.5, 5.5, 1.2, 1.2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(String(critNum), pageLeft + 5.25, y + 5.3, { align: 'center' });

    // Criterion title
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(crit.label, pageLeft + 10.5, y + 5.5);

    // Never render IGQA AI score ('QA: X/12'). Only render 'Teacher: X/12' on Final reports.
    if (!isDraft) {
      const teacherPillW = 28;
      const teacherPillX = pageLeft + contentW - teacherPillW - 2.5;
      doc.setFillColor(219, 234, 254);
      doc.setDrawColor(147, 197, 253);
      doc.roundedRect(teacherPillX, y + 1.5, teacherPillW, 5.5, 1.2, 1.2, 'FD');
      doc.setTextColor(29, 78, 216);
      doc.setFontSize(7.5);
      doc.text(`Teacher: ${teacherScore}/12`, teacherPillX + teacherPillW / 2, y + 5.2, { align: 'center' });
    }

    y += headerH + 3.2;

    const activeWww = normalizeFeedbackItems(res.www, critNum, 'WWW', Number(teacherScore)).filter(
      (item) => item.isChecked
    );
    const activeEbi = res.isIncomplete
      ? []
      : normalizeFeedbackItems(res.ebi, critNum, 'EBI', Number(teacherScore)).filter(
          (item) => item.isChecked
        );

    const drawRagFeedbackSection = (
      heading: string,
      headingRgb: [number, number, number],
      items: CwkFeedbackItem[]
    ) => {
      if (y + 8 > maxPageY) {
        doc.addPage();
        y = 12;
      }
      doc.setFontSize(9);
      doc.setTextColor(headingRgb[0], headingRgb[1], headingRgb[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(heading, pageLeft + 1, y);
      y += 3.6;

      if (items.length === 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.text('None selected', pageLeft + 2, y + 1.2);
        y += 5.2;
        return;
      }

      const itemLineH = 3.35;
      items.forEach((item) => {
        const style = RAG_STYLES[item.ragColor] || RAG_STYLES.amber;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const textLines = doc.splitTextToSize(item.text, contentW - 36) as string[];
        const cardHeight = Math.max(7.6, textLines.length * itemLineH + 3.2);

        if (y + cardHeight > maxPageY) {
          doc.addPage();
          y = 12;
        }

        // Card tint + border
        doc.setFillColor(style.cardBgRgb[0], style.cardBgRgb[1], style.cardBgRgb[2]);
        doc.setDrawColor(style.cardBorderRgb[0], style.cardBorderRgb[1], style.cardBorderRgb[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(pageLeft + 1, y, contentW - 2, cardHeight, 1.5, 1.5, 'FD');

        // Left RAG accent bar
        doc.setFillColor(style.borderRgb[0], style.borderRgb[1], style.borderRgb[2]);
        doc.rect(pageLeft + 1, y, 1.3, cardHeight, 'F');

        // RAG pill badge
        doc.setFillColor(style.badgeRgb[0], style.badgeRgb[1], style.badgeRgb[2]);
        doc.setDrawColor(style.borderRgb[0], style.borderRgb[1], style.borderRgb[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(pageLeft + 4.5, y + 1.5, 12.2, 4.5, 1, 1, 'FD');

        doc.setTextColor(style.textRgb[0], style.textRgb[1], style.textRgb[2]);
        doc.setFontSize(7.2);
        doc.setFont('helvetica', 'bold');
        doc.text(item.code, pageLeft + 10.6, y + 4.6, { align: 'center' });

        // Body text
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        textLines.forEach((line, idx) => {
          doc.text(line, pageLeft + 19, y + 4.5 + idx * itemLineH);
        });

        // Active page reference
        doc.setFontSize(7);
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.text(`p.${item.pdfLocation.page}`, pageLeft + contentW - 3.5, y + 4.5, {
          align: 'right',
        });

        y += cardHeight + 1.5;
      });
    };

    // 3. WWW & EBI / Incomplete Notice directly below
    drawRagFeedbackSection('A) What Went Well (WWW)', [20, 83, 45], activeWww);
    y += 1.5;

    if (res.isIncomplete) {
      const hasCustomNote =
        typeof res.incompleteNote === 'string' &&
        res.incompleteNote.trim() &&
        res.incompleteNote.trim() !== DEFAULT_INCOMPLETE_EBI_NOTICE;
      const noticeH = hasCustomNote ? 12 : 8;
      if (y + noticeH > maxPageY) {
        doc.addPage();
        y = 12;
      }
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(pageLeft + 1, y, contentW - 2, noticeH, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.text(DEFAULT_INCOMPLETE_EBI_NOTICE, pageLeft + 5, y + 5);
      if (hasCustomNote) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(String(res.incompleteNote).trim(), pageLeft + 5, y + 9.5);
      }
      y += noticeH + 1.5;
    } else {
      drawRagFeedbackSection('B) Even Better If (EBI)', [127, 29, 29], activeEbi);
    }
  });

  return doc;
}

export function downloadFeedbackPDF(student: StudentSubmission, type: 'draft' | 'final') {
  const doc = buildFeedbackPDFDoc(student, type);
  if (!doc) {
    alert(`No ${type} evaluation found for this student.`);
    return;
  }

  const { formattedName } = parseCandidateName(student.candidateName);
  doc.save(`${formattedName}_${type}_feedback.pdf`);
}
