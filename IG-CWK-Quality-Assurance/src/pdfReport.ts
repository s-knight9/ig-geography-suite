import { jsPDF } from 'jspdf';
import { StudentSubmission } from './db';
import { parseCandidateName } from './nameParser';
import { ComparativeEvaluationResult } from './types';

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

    const drawCol = (xPos: number, score: number, www: string[], ebi: string[], colColor: number[]) => {
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
        www.forEach((item: string, i: number) => {
          const lines = doc.splitTextToSize(`${critNum}.${i + 1}A) ${item}`, width);
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
        ebi.forEach((item: string, i: number) => {
          const lines = doc.splitTextToSize(`${critNum}.${i + 1}B) ${item}`, width);
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

export function downloadFeedbackPDF(student: StudentSubmission, type: 'draft' | 'final') {
  const evalData = type === 'draft' ? student.draftEvaluation : student.finalEvaluation;
  const teacherMarks = type === 'draft' ? student.draftTeacherScores : student.finalTeacherScores;

  if (!evalData) {
    alert(`No ${type} evaluation found for this student.`);
    return;
  }

  const { formattedName } = parseCandidateName(student.candidateName);

  const doc = new jsPDF();
  let y = 20;

  // Colors
  const colors = {
    primary: [15, 23, 42],     // slate-900
    secondary: [100, 116, 139], // slate-500
    accent: [37, 99, 235],      // blue-600
    accentMuted: [219, 234, 254], // blue-100
    igqaText: [148, 163, 184],  // slate-400
  };

  // Setup Title Layer
  // Thick blue branded banner
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]); // blue-600
  doc.rect(0, 0, 210, 20, 'F');
  
  // App logo: IG square
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 4, 12, 12, 1, 1, 'F');
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('IG', 16, 12, { align: 'center' });

  // Lettering
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('CWK Quality Assurance', 26, 12);

  // Gray background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 20, 210, 40, 'F');
  
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formattedName}`, 20, 35);
  
  doc.setFontSize(10);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(`Type: ${(type).toUpperCase()} CWK`, 20, 43);
  
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`Class: ${student.className}    |    Assignment: ${student.assignmentName}`, 20, 49);

  // Calculate scores
  const criteria = [
    { key: 'ao1_knowledge', label: 'AO1: Knowledge & Understanding' },
    { key: 'ao2_observation', label: 'AO2: Observation & Collection' },
    { key: 'ao2_organisation', label: 'AO2: Organisation & Presentation' },
    { key: 'ao2_analysis', label: 'AO2: Analysis & Interpretation' },
    { key: 'ao3_conclusion', label: 'AO3: Conclusion & Evaluation' }
  ] as const;

  let totalTeacherScore = 0;
  criteria.forEach(c => {
    const igqaScore = (evalData?.scores as any)?.[c.key]?.score || 0;
    const teacherScore = teacherMarks ? (teacherMarks[c.key] ?? igqaScore) : igqaScore;
    totalTeacherScore += teacherScore;
  });

  // Display Total Teacher Score
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.roundedRect(160, 25, 32, 22, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalTeacherScore}`, 168, 37, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`/ 60`, 181, 37);
  
  doc.setFontSize(7);
  doc.text(`TOTAL MARK`, 176, 43, { align: 'center' });

  y = 70;

  criteria.forEach((crit) => {
    const res = (evalData?.scores as any)?.[crit.key];
    if (!res) return;

    const igqaScore = res.score;
    const teacherScore = teacherMarks ? (teacherMarks[crit.key] ?? igqaScore) : igqaScore;

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Criterion Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(20, y - 6, 170, 14, 2, 2, 'F');

    const indexMap: Record<string, number> = {
      ao1_knowledge: 1, ao2_observation: 2, ao2_organisation: 3, ao2_analysis: 4, ao3_conclusion: 5
    };
    const critNum = indexMap[crit.key] || 1;

    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Criterion ${critNum}: ${teacherScore}/12`, 24, y + 3);

    y += 16;

    // WWW
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('A) What Went Well (WWW)', 24, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    
    if (res.www && res.www.length > 0) {
      res.www.forEach((item: string, i: number) => {
        const lines = doc.splitTextToSize(`${critNum}.${i + 1}A) ${item}`, 162);
        doc.text(lines, 24, y);
        y += lines.length * 5;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    } else {
      doc.text(`None`, 24, y);
      y += 5;
    }
    
    y += 3;
    
    // EBI
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('B) Even Better If (EBI)', 24, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);

    if (res.ebi && res.ebi.length > 0) {
      res.ebi.forEach((item: string, i: number) => {
        const lines = doc.splitTextToSize(`${critNum}.${i + 1}B) ${item}`, 162);
        doc.text(lines, 24, y);
        y += lines.length * 5;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    } else {
      doc.text(`None`, 24, y);
      y += 5;
    }
    
    y += 10;
  });

  doc.save(`${formattedName}_${type}_feedback.pdf`);
}
