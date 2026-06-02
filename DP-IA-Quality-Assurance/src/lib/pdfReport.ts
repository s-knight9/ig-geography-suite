import { jsPDF } from "jspdf";
import { CandidateRecord, AnalysisResult } from "../types";

export const generateStudentReportPDF = (candidate: CandidateRecord, className: string = "N/A", assignmentName: string = "N/A") => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  
  const report = candidate.report as AnalysisResult;
  if (candidate.report.isComparison) return; // Not for comparison results

  // Colors
  const emeraldPrimary = [16, 185, 129]; // #10B981
  const slateDark = [15, 23, 42]; // #0F172A
  const slateLight = [248, 250, 252]; // #F8FAFC
  const slateBorder = [226, 232, 240]; // #E2E8F0
  const emeraldText = [5, 150, 105]; // emerald-600
  const greyText = [100, 116, 139]; // slate-500

  let y = 0;

  // --- Header Banner ---
  doc.setFillColor(emeraldPrimary[0], emeraldPrimary[1], emeraldPrimary[2]);
  doc.rect(0, 0, pageWidth, 20, 'F');
  
  // Logo Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 5, 10, 10, 1, 1, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(emeraldPrimary[0], emeraldPrimary[1], emeraldPrimary[2]);
  doc.text("IA", margin + 5, 11.5, { align: "center" });
  
  // Header Title
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("IA Quality Assurance", margin + 14, 11.5);
  
  y = 20;

  // --- Student Identity Information (Gray Section) ---
  doc.setFillColor(slateLight[0], slateLight[1], slateLight[2]);
  doc.rect(0, y, pageWidth, 45, 'F');
  
  y += 12;
  
  // Candidate Name
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(candidate.studentName, margin, y);
  
  const totalScoreVal = candidate.moderated_score !== undefined ? candidate.moderated_score : candidate.score;

  // Score Box (Emerald Rounded Rect)
  const scoreBoxW = 45;
  const scoreBoxH = 22;
  const scoreBoxX = pageWidth - margin - scoreBoxW;
  const scoreBoxY = y - 9;
  
  // Score Box Background - Switch to Emerald
  doc.setFillColor(emeraldPrimary[0], emeraldPrimary[1], emeraldPrimary[2]);
  doc.roundedRect(scoreBoxX, scoreBoxY, scoreBoxW, scoreBoxH, 2, 2, 'F');
  
  // Big Score text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(`${totalScoreVal}`, scoreBoxX + 12, scoreBoxY + 11);
  doc.setFontSize(10);
  doc.text(`/ ${candidate.subject === 'ESS' ? 30 : 25}`, scoreBoxX + 22, scoreBoxY + 11);
  
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL MARK", scoreBoxX + scoreBoxW / 2, scoreBoxY + 18, { align: "center" });
  
  y += 8;
  
  // Submission Type - Use Emerald Text
  doc.setFontSize(10);
  doc.setTextColor(emeraldText[0], emeraldText[1], emeraldText[2]);
  doc.text(`Type: INTERNAL ASSESSMENT ${candidate.submissionType?.toUpperCase() || 'REPORT'}`, margin, y);
  
  y += 8;
  
  // Meta Info
  doc.setFontSize(9);
  doc.setTextColor(greyText[0], greyText[1], greyText[2]);
  doc.text(`Class: ${className}`, margin, y);
  
  const assignmentText = ` |  Assignment: ${assignmentName}`;
  doc.text(assignmentText, margin + doc.getTextWidth(`Class: ${className}`), y);

  // Word Count Subline
  y += 6;
  doc.setFontSize(8);
  doc.text(`Eval Word Count: ${report.wordCount?.included || 0}  |  Total File Count: ${report.wordCount?.total || 0}`, margin, y);

  y += 10;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // --- Criterion Sections ---
  if (report.criteria && Array.isArray(report.criteria)) {
    report.criteria.forEach((crit) => {
      checkPageBreak(50);
      
      // Criterion Header Bar
      doc.setFillColor(241, 245, 249); // slate-100
      doc.roundedRect(margin, y, maxWidth, 12, 2, 2, 'F');
      
      const teacherScoreVal = crit.teacherScore !== undefined ? crit.teacherScore : crit.score;
      const criterionTitle = `Criterion ${crit.id}: ${teacherScoreVal}/${crit.maxScore}`;

      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(criterionTitle, margin + 5, y + 7.5);
      
      y += 18;
      
      // WWW Section - Using IA Numbered Heading logic
      doc.setTextColor(emeraldText[0], emeraldText[1], emeraldText[2]);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("1) What Went Well (WWW)", margin, y);
      y += 6;
      
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      const wwwItems = normalizeFeedbackToItems(crit.www);
          
      wwwItems.forEach((item, idx) => {
        const prefix = `${crit.id}1.${idx + 1} `;
        const lines = doc.splitTextToSize(`${prefix}${item.text}`, maxWidth - 8);
        checkPageBreak(lines.length * 5 + 5);
        doc.text(lines, margin + 4, y);
        y += (lines.length * 5) + 2;
      });
      
      y += 5;
      
      // EBI Section - Using IA Numbered Heading logic
      checkPageBreak(25);
      doc.setTextColor(greyText[0], greyText[1], greyText[2]);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("2) Even Better if (EBI)", margin, y);
      y += 6;
      
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      const ebiItems = normalizeFeedbackToItems(crit.ebi);
          
      ebiItems.forEach((item, idx) => {
        const prefix = `${crit.id}2.${idx + 1} `;
        const lines = doc.splitTextToSize(`${prefix}${item.text}`, maxWidth - 8);
        checkPageBreak(lines.length * 5 + 5);
        doc.text(lines, margin + 4, y);
        y += (lines.length * 5) + 2;
      });
      
      y += 12;
    });
  }

  // Helper inside the function or top level
  function normalizeFeedbackToItems(feedback: any): { text: string }[] {
    if (Array.isArray(feedback)) {
      return feedback.map(f => typeof f === 'string' ? { text: f } : f);
    }
    if (typeof feedback === 'string') {
      return feedback.split('\n').filter(Boolean).map(t => ({ text: t.trim().replace(/^•\s*/, '') }));
    }
    return [];
  }

  // --- Save File ---
  const fileName = `${candidate.studentName.replace(/[^a-zA-Z0-9]/g, '_')}_${candidate.submissionType || 'IA'}_Report.pdf`;
  doc.save(fileName);
};
