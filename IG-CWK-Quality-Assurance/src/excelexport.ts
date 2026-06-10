import * as XLSX from 'xlsx-js-style';
import { StudentSubmission } from './db';
import { parseCandidateName } from './nameParser';

const criteriaKeys = ['ao1_knowledge', 'ao2_observation', 'ao2_organisation', 'ao2_analysis', 'ao3_conclusion'];

export function downloadGradesExcel(students: StudentSubmission[], isDraft: boolean, assignmentName: string) {
  const typeStr = isDraft ? 'DFT' : 'FNL';
  const prefix = `2029:${typeStr}:`;
  const headerMain = isDraft ? 'IGCSE CWK DRAFT' : 'IGCSE CWK FINAL';

  const borderArgs = {
    top: { style: "thin", color: { rgb: "BFBFBF" } },
    bottom: { style: "thin", color: { rgb: "BFBFBF" } },
    left: { style: "thin", color: { rgb: "BFBFBF" } },
    right: { style: "thin", color: { rgb: "BFBFBF" } }
  };

  const titleRow = [
    { v: '', t: 's', s: { fill: { fgColor: { rgb: "990000" } }, border: borderArgs } },
    { v: '', t: 's', s: { fill: { fgColor: { rgb: "990000" } }, border: borderArgs } },
    { v: '', t: 's', s: { fill: { fgColor: { rgb: "990000" } }, border: borderArgs } },
    { v: headerMain, t: 's', s: { 
        fill: { fgColor: { rgb: "FFFF00" } }, 
        font: { bold: true, color: { rgb: "000000" }, name: "Arial" }, 
        alignment: { horizontal: "center", vertical: "center" },
        border: borderArgs
      } 
    },
    { v: '', t: 's', s: { fill: { fgColor: { rgb: "FFFF00" } }, border: borderArgs } },
    { v: '', t: 's', s: { fill: { fgColor: { rgb: "FFFF00" } }, border: borderArgs } },
    { v: '', t: 's', s: { fill: { fgColor: { rgb: "FFFF00" } }, border: borderArgs } },
    { v: '', t: 's', s: { fill: { fgColor: { rgb: "FFFF00" } }, border: borderArgs } },
    { v: '', t: 's', s: { fill: { fgColor: { rgb: "FFFF00" } }, border: borderArgs } }
  ];

  const headerRow = [
    { v: 'Surname', t: 's', s: { fill: { fgColor: { rgb: "990000" } }, font: { color: { rgb: "FFFFFF" }, bold: true, underline: true, name: "Arial" }, alignment: { textRotation: 90, vertical: "bottom", horizontal: "center" }, border: borderArgs } },
    { v: 'Forename', t: 's', s: { fill: { fgColor: { rgb: "990000" } }, font: { color: { rgb: "FFFFFF" }, bold: true, underline: true, name: "Arial" }, alignment: { textRotation: 90, vertical: "bottom", horizontal: "center" }, border: borderArgs } },
    { v: 'Preferred Name', t: 's', s: { fill: { fgColor: { rgb: "990000" } }, font: { color: { rgb: "FFFFFF" }, bold: true, underline: true, name: "Arial" }, alignment: { textRotation: 90, vertical: "bottom", horizontal: "center" }, border: borderArgs } },
    { v: `${prefix} A(12)`, t: 's', s: { fill: { fgColor: { rgb: "FFFF00" } }, font: { color: { rgb: "000000" }, bold: true, underline: true, name: "Arial" }, alignment: { textRotation: 90, vertical: "bottom", horizontal: "center" }, border: borderArgs } },
    { v: `${prefix} B(12)`, t: 's', s: { fill: { fgColor: { rgb: "FFFF00" } }, font: { color: { rgb: "000000" }, bold: true, underline: true, name: "Arial" }, alignment: { textRotation: 90, vertical: "bottom", horizontal: "center" }, border: borderArgs } },
    { v: `${prefix} C(12)`, t: 's', s: { fill: { fgColor: { rgb: "FFFF00" } }, font: { color: { rgb: "000000" }, bold: true, underline: true, name: "Arial" }, alignment: { textRotation: 90, vertical: "bottom", horizontal: "center" }, border: borderArgs } },
    { v: `${prefix} D(12)`, t: 's', s: { fill: { fgColor: { rgb: "FFFF00" } }, font: { color: { rgb: "000000" }, bold: true, underline: true, name: "Arial" }, alignment: { textRotation: 90, vertical: "bottom", horizontal: "center" }, border: borderArgs } },
    { v: `${prefix} E(12)`, t: 's', s: { fill: { fgColor: { rgb: "FFFF00" } }, font: { color: { rgb: "000000" }, bold: true, underline: true, name: "Arial" }, alignment: { textRotation: 90, vertical: "bottom", horizontal: "center" }, border: borderArgs } },
    { v: `${typeStr}: RAW (60)`, t: 's', s: { fill: { fgColor: { rgb: "FFFF00" } }, font: { color: { rgb: "FF0000" }, bold: true, underline: true, name: "Arial" }, alignment: { textRotation: 90, vertical: "bottom", horizontal: "center" }, border: borderArgs } },
  ];

  const aoa: any[][] = [titleRow, headerRow];

  const mappedStudents = students.map(s => {
    const { surname, forename, preferredName } = parseCandidateName(s.candidateName);

    const evalData = isDraft ? s.draftEvaluation : s.finalEvaluation;
    const teacherMarks = isDraft ? s.draftTeacherScores : s.finalTeacherScores;

    const scores: number[] = [];
    let totalScore = 0;

    for (let i = 0; i < criteriaKeys.length; i++) {
       const key = criteriaKeys[i];
       const igqaScore = evalData && (evalData.scores as any)[key] ? (evalData.scores as any)[key].score : 0;
       const score = teacherMarks && teacherMarks[key] !== undefined ? teacherMarks[key] : igqaScore;
       scores.push(score);
       totalScore += score;
    }
    return { surname, forename, preferredName, scores, totalScore };
  });

  mappedStudents.sort((a, b) => a.surname.localeCompare(b.surname) || a.forename.localeCompare(b.forename));

  mappedStudents.forEach(s => {
    const row = [
      { v: s.surname, t: 's', s: { font: { name: "Arial" }, border: borderArgs } },
      { v: s.forename, t: 's', s: { font: { name: "Arial" }, border: borderArgs } },
      { v: s.preferredName, t: 's', s: { font: { name: "Arial" }, border: borderArgs } },
      { v: s.scores[0], t: 'n', s: { font: { name: "Arial" }, alignment: { horizontal: "center" }, border: borderArgs } },
      { v: s.scores[1], t: 'n', s: { font: { name: "Arial" }, alignment: { horizontal: "center" }, border: borderArgs } },
      { v: s.scores[2], t: 'n', s: { font: { name: "Arial" }, alignment: { horizontal: "center" }, border: borderArgs } },
      { v: s.scores[3], t: 'n', s: { font: { name: "Arial" }, alignment: { horizontal: "center" }, border: borderArgs } },
      { v: s.scores[4], t: 'n', s: { font: { name: "Arial" }, alignment: { horizontal: "center" }, border: borderArgs } },
      { v: s.totalScore, t: 'n', s: { font: { color: { rgb: "FF0000" }, bold: true, name: "Arial" }, alignment: { horizontal: "center" }, border: borderArgs } }
    ];
    aoa.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Merge cells for the title
  ws['!merges'] = [
    { s: { r: 0, c: 3 }, e: { r: 0, c: 8 } }
  ];

  // Set column widths
  ws['!cols'] = [
    { wpx: 80 },  // A Surname
    { wpx: 80 },  // B Forename
    { wpx: 100 }, // C Preferred Name
    { wpx: 35 },  // D
    { wpx: 35 },  // E
    { wpx: 35 },  // F
    { wpx: 35 },  // G
    { wpx: 35 },  // H
    { wpx: 40 }   // I
  ];

  // Set row heights
  ws['!rows'] = [
    { hpt: 30 },  // Row 1
    { hpt: 150 }  // Row 2 tall for vertical text
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Grades");

  const safeAssignmentName = assignmentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `${safeAssignmentName}_${typeStr.toLowerCase()}_grades.xlsx`;

  XLSX.writeFile(wb, filename);
}
