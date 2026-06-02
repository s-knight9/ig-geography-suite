import React from 'react';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

interface GenerationResult {
  questions: { marks: number; text: string }[];
  markscheme: { criteria: string; paths: string[] };
  summary: string;
}

interface PDFGeneratorProps {
  imageSrc: string | null;
  result: GenerationResult | null;
}

export function PDFGenerator({ imageSrc, result }: PDFGeneratorProps) {
  const downloadInfographic = () => {
    if (!imageSrc) return;
    const a = document.createElement("a");
    a.href = imageSrc;
    a.download = "Infographic.jpg";
    a.click();
  };

  const generateQuestionSheetPDF = () => {
    if (!result) return;
    const doc = new jsPDF({ format: 'a4' });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Section B", 105, 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Answer the following question.", 20, 35);
    doc.text("4. Refer to the infographic on the accompanying resource booklet.", 20, 45);

    let y = 60;

    result.questions.forEach((q, idx) => {
      if (y > 270 || (q.marks === 6 && y > 35)) {
        doc.addPage();
        y = 35; // slightly lower start for new page
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("(Question 4 continued)", 20, 20);
      }

      const letter = String.fromCharCode(97 + idx); // a, b, c
      doc.setFont("helvetica", "normal");
      doc.text(`(${letter})`, 25, y);
      
      const splitText = doc.splitTextToSize(q.text, 140);
      doc.text(splitText, 35, y);
      
      doc.setFont("helvetica", "bold");
      doc.text(`[${q.marks}]`, 185, y, { align: "right" });
      
      y += (splitText.length * 6) + 10;
      
      doc.setDrawColor(150);
      doc.setLineDashPattern([1, 1.5], 0);
      
      const linesNeeded = q.marks * 4; // roughly 4 lines per mark
      for (let i = 0; i < linesNeeded; i++) {
        if (y > 280) {
          doc.addPage();
          y = 20;
          doc.setDrawColor(150);
          doc.setLineDashPattern([1, 1.5], 0);
        }
        doc.line(30, y, 185, y);
        y += 8;
      }
      y += 10;
      
      // Reset dash pattern
      doc.setLineDashPattern([], 0);
    });

    doc.save("Question_Sheet.pdf");
  };

  const generateMarkschemePDF = () => {
    if (!result) return;
    const doc = new jsPDF({ format: 'a4' });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Markscheme", 105, 20, { align: "center" });

    let y = 40;
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    const splitCriteria = doc.splitTextToSize(result.markscheme.criteria, 170);
    doc.text(splitCriteria, 20, y);
    
    y += (splitCriteria.length * 5) + 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    result.markscheme.paths.forEach((path) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      
      doc.text("•", 20, y);
      const splitPath = doc.splitTextToSize(path, 160);
      doc.text(splitPath, 25, y);
      
      y += (splitPath.length * 6) + 6;
    });

    doc.save("Markscheme.pdf");
  };

  if (!result || !imageSrc) return null;

  return (
    <div className="flex space-x-4">
      <button 
        onClick={downloadInfographic}
        className="flex items-center px-4 py-2.5 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
        <Download className="w-4 h-4 mr-2" />
        Infographic
      </button>

      <button 
        onClick={generateQuestionSheetPDF}
        className="flex items-center px-4 py-2.5 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
        <Download className="w-4 h-4 mr-2" />
        Question Sheet
      </button>

      <button 
        onClick={generateMarkschemePDF}
        className="flex items-center px-4 py-2.5 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
        <Download className="w-4 h-4 mr-2" />
        Markscheme
      </button>
    </div>
  );
}
