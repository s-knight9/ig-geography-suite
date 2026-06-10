import { jsPDF } from 'jspdf';
import { StudentSubmission } from './db';
import { parseCandidateName } from './nameParser';

export function downloadModerationReport(
  students: StudentSubmission[],
  className: string,
  assignmentName: string
) {
  // Filter for students who have BOTH draft and final evaluations
  const moderatedStudents = students.filter(s => s.draftEvaluation && s.finalEvaluation);

  if (moderatedStudents.length === 0) {
    alert("No students with both draft and final evaluations found for this assignment.");
    return;
  }

  // Sort them alphabetically by surname, then forename
  moderatedStudents.sort((a, b) => {
    const nameA = parseCandidateName(a.candidateName);
    const nameB = parseCandidateName(b.candidateName);
    return nameA.surname.localeCompare(nameB.surname) || nameA.forename.localeCompare(nameB.forename);
  });

  const doc = new jsPDF();
  let y = 0;

  const headerColor = [37, 99, 235] as [number, number, number]; // blue-600 #2563EB
  const textColor = [20, 30, 40] as [number, number, number];
  const subtleColor = [100, 110, 120] as [number, number, number];

  const checkPageEdge = (requiredHeight: number) => {
    if (y + requiredHeight > 280) {
      doc.addPage();
      y = 20;
    }
  };

  // HEADER
  doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('IG CWK QUALITY ASSURANCE', 15, 20);

  y = 45;

  // SUBHEADER
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Final Class Moderation Summary', 15, y);

  y += 10;
  
  // METADATA
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(subtleColor[0], subtleColor[1], subtleColor[2]);
  
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  
  doc.text(`Class: ${className}`, 15, y);
  doc.text(`Date: ${today}`, 110, y);
  y += 6;
  doc.text(`Assignment: ${assignmentName}`, 15, y);
  doc.text(`Total Candidates: ${moderatedStudents.length}`, 110, y);
  y += 15;

  moderatedStudents.forEach((s) => {
    const nameDetails = parseCandidateName(s.candidateName);
    
    // Calculates scores
    const draftIGQA = s.draftEvaluation?.total_score || 0;
    const finalIGQA = s.finalEvaluation?.total_score || 0;
    
    const draftTeacherTokens = s.draftTeacherScores ? Object.values(s.draftTeacherScores) : [];
    const finalTeacherTokens = s.finalTeacherScores ? Object.values(s.finalTeacherScores) : [];
    
    const draftTeacher = draftTeacherTokens.reduce((sum, v) => sum + v, 0);
    const finalTeacher = finalTeacherTokens.reduce((sum, v) => sum + v, 0);

    const change = finalTeacher - draftTeacher;
    const changeStr = change > 0 ? `Teacher Change: +${change}` : `Teacher Change: ${change}`;
    const changeColor = change > 0 ? [37, 99, 235] : (change < 0 ? [220, 38, 38] : subtleColor);

    // Estimate Moderation Note height
    const noteText = s.finalEvaluation?.moderator_executive_summary || "No moderation note available.";
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitNote = doc.splitTextToSize(noteText, 180);
    const noteHeight = splitNote.length * 4;

    const blockHeight = 15 + 20 + 8 + noteHeight + 10; // Name + Box + note title + note + padding
    checkPageEdge(blockHeight);

    // Draw Candidate Name
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(nameDetails.formattedName, 15, y);

    // Draw Teacher Change
    // @ts-ignore
    doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
    doc.text(changeStr, 195, y, { align: 'right' });
    
    y += 5;

    // Draw comparison box
    doc.setFillColor(248, 249, 250); // slight gray bg
    doc.setDrawColor(226, 232, 240); // subtle border
    doc.roundedRect(15, y, 180, 20, 2, 2, 'FD');

    y += 7;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(subtleColor[0], subtleColor[1], subtleColor[2]);
    doc.text('DRAFT CWK', 20, y);
    doc.text('FINAL CWK', 105, y);

    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`Teacher: ${draftTeacher}/60`, 20, y);
    
    doc.text(`Teacher: ${finalTeacher}/60`, 105, y);
    
    y += 10;

    // Drawing Moderation Note
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Moderation Note', 15, y);
    
    y += 5;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]); // actually gray text in image
    doc.setTextColor(70, 80, 90);
    doc.text(splitNote, 15, y);

    y += noteHeight + 15; // move to next student block
  });

  doc.save(`Moderation_Summary_${className.replace(/\s+/g, '_')}_${assignmentName.replace(/\s+/g, '_')}.pdf`);
}
