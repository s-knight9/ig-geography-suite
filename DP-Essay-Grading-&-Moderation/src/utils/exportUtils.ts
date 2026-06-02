import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Clean markdown for text-only output (basic cleaning)
 */
const cleanMarkdown = (text: string) => {
  return text
    .replace(/[#*`_~]/g, '') // Remove basic markdown symbols
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1'); // Keep link text, remove URL
};

export const downloadEssayAsPDF = (studentName: string, essay: string, question: string, paper: string, marks: string) => {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);
  
  // Header Accent
  doc.setFillColor(34, 197, 94); // Logo Green
  doc.rect(0, 0, pageWidth, 15, 'F');
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94);
  doc.text('CANDIDATE ESSAY', margin, 35);
  
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.line(margin, 38, pageWidth - margin, 38);
  
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT:', margin, 48);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(studentName || 'N/A', margin + 25, 48);
  
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('EXAM PAPER:', margin, 54);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Paper ${paper} (${marks} Marks)`, margin + 25, 54);
  
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('QUESTION PROMPT', margin, 68);
  
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  const questionLines = doc.splitTextToSize(question || 'No question provided.', contentWidth);
  doc.text(questionLines, margin, 74);
  
  let currentY = 74 + (questionLines.length * 6) + 12;
  
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ESSAY CONTENT', margin, currentY);
  currentY += 8;
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const essayLines = doc.splitTextToSize(essay, contentWidth);
  
  // Handle multipage
  let yPos = currentY;
  for (let i = 0; i < essayLines.length; i++) {
    if (yPos > 280) {
      doc.addPage();
      // Add green header to new page
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, pageWidth, 5, 'F');
      yPos = 20;
    }
    doc.text(essayLines[i], margin, yPos);
    yPos += 6;
  }
  
  doc.save(`${studentName || 'essay'}_inputted_essay.pdf`);
};

export const downloadEssayAsDocx = async (studentName: string, essay: string, question: string, paper: string, marks: string) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: "CANDIDATE ESSAY", bold: true, color: "22C55E", size: 36 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Student Name: ", bold: true, color: "64748B" }),
            new TextRun({ text: studentName || 'N/A', bold: true }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Examination Context: ", bold: true, color: "64748B" }),
            new TextRun({ text: `Paper ${paper} (${marks} Marks)`, bold: true }),
          ],
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Question Prompt", bold: true, color: "22C55E", size: 28 }),
          ],
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: question || 'No question provided.', italics: true, color: "475569" }),
          ],
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Essay Content", bold: true, color: "22C55E", size: 28 }),
          ],
          spacing: { before: 200, after: 200 },
        }),
        ...essay.split('\n').map(line => new Paragraph({
          text: line,
          spacing: { after: 200 },
        })),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${studentName || 'essay'}_inputted_essay.docx`);
};

export const downloadReportAsPDF = (studentName: string, assessment: string, question: string) => {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);

  // Header Accent
  doc.setFillColor(34, 197, 94);
  doc.rect(0, 0, pageWidth, 15, 'F');

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94);
  doc.text('GRADING REPORT', margin, 35);

  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.line(margin, 38, pageWidth - margin, 38);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CANDIDATE:', margin, 48);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(studentName || 'N/A', margin + 28, 48);
  
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ORIGINAL QUESTION', margin, 62);
  
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  const qLines = doc.splitTextToSize(question, contentWidth);
  doc.text(qLines, margin, 68);

  let yPos = 68 + (qLines.length * 5) + 15;

  doc.setTextColor(34, 197, 94);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ASSESSMENT FEEDBACK', margin, yPos);
  yPos += 8;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const cleanContent = cleanMarkdown(assessment);
  const lines = doc.splitTextToSize(cleanContent, contentWidth);

  for (let i = 0; i < lines.length; i++) {
    if (yPos > 280) {
      doc.addPage();
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, pageWidth, 5, 'F');
      yPos = 20;
    }
    
    // Simple check for potential headers in the markdown output
    const line = lines[i];
    if (line.toUpperCase() === line && line.length > 3) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
    }
    
    doc.text(line, margin, yPos);
    yPos += 6;
  }

  doc.save(`${studentName || 'report'}_marking_report.pdf`);
};

export const downloadReportAsDocx = async (studentName: string, assessment: string, question: string) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: "ESSAY GRADING & FEEDBACK REPORT", bold: true, color: "22C55E", size: 32 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Candidate: ", bold: true, color: "64748B" }),
            new TextRun({ text: studentName || 'N/A', bold: true }),
          ],
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Original Question", bold: true, color: "22C55E", size: 28 }),
          ],
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: question, color: "475569" }),
          ],
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Assessment Feedback", bold: true, color: "22C55E", size: 28 }),
          ],
          spacing: { before: 200, after: 200 },
        }),
        ...assessment.split('\n').map(line => {
          const cleanLine = cleanMarkdown(line);
          if (!cleanLine.trim()) return null;
          
          const isHeader = line.startsWith('#') || line.includes('**') || (line.toUpperCase() === line && line.length > 5);
          
          return new Paragraph({
            children: [
              new TextRun({
                text: cleanLine,
                bold: isHeader,
                color: isHeader ? "22C55E" : "1E293B",
                size: isHeader ? 24 : 22
              })
            ],
            spacing: { after: 150 },
          });
        }).filter(Boolean) as Paragraph[],
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${studentName || 'report'}_marking_report.docx`);
};
