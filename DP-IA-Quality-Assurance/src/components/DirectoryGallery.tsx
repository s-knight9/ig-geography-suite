import React, { useState } from "react";
import { jsPDF } from "jspdf";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import pptxgen from "pptxgenjs";
import { FolderOpen, FileDown, Trophy, Trash2, X, Download, Presentation, Loader2, Upload } from "lucide-react";
import type { CandidateRecord } from "../types";
import { motion } from "motion/react";
import { generateStudentReportPDF } from "../lib/pdfReport";

interface DirectoryGalleryProps {
  candidates: CandidateRecord[];
  activeClassName?: string;
  activeAssignmentName?: string;
  onViewReport: (record: CandidateRecord) => void;
  onDeleteCandidate?: (candidateId: string) => void;
  onUploadFinal?: (record: CandidateRecord) => void;
  onBulkUploadFinal?: () => void;
}

const CandidateCard: React.FC<{ 
  candidate: CandidateRecord, 
  activeClassName?: string,
  activeAssignmentName?: string,
  onViewReport: (c: CandidateRecord) => void, 
  onDeleteCandidate?: (id: string) => void, 
  onUploadFinal?: (c: CandidateRecord) => void, 
  submissionViewMode: 'Draft' | 'Final' 
}> = ({ candidate, activeClassName, activeAssignmentName, onViewReport, onDeleteCandidate, onUploadFinal, submissionViewMode }) => {
  const [showDelete, setShowDelete] = useState(false);
  const deleteContainerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-200 transition-colors">
      <div className="flex flex-col xl:flex-row justify-between items-start gap-4 mb-2">
        <div className="flex-1 min-w-0 w-full">
          <h4 className="font-bold text-slate-900 dark:text-white truncate">{candidate.studentName}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 xl:mt-4 font-medium">
            {new Date(candidate.date).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center shrink-0 w-full xl:w-auto justify-between xl:justify-start">
          
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Draft IA</span>
            <div className="flex gap-2">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase pb-1">IAQA</span>
                <span className="flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
                  {submissionViewMode === 'Final' && candidate.submissionType === 'Final' && !candidate.draftRecord
                    ? `--/${candidate.subject === 'ESS' ? 30 : 25}`
                    : `${submissionViewMode === 'Final' && candidate.submissionType === 'Final' && candidate.draftRecord ? (candidate.draftRecord.iaqa_score !== undefined ? candidate.draftRecord.iaqa_score : candidate.draftRecord.score) : (candidate.iaqa_score !== undefined ? candidate.iaqa_score : candidate.score)}/${candidate.subject === 'ESS' ? 30 : 25}`}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase pb-1">TEACHER</span>
                <span className="flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  {submissionViewMode === 'Final' && candidate.submissionType === 'Final' && !candidate.draftRecord
                    ? `--/${candidate.subject === 'ESS' ? 30 : 25}`
                    : `${submissionViewMode === 'Final' && candidate.submissionType === 'Final' && candidate.draftRecord ? (candidate.draftRecord.moderated_score !== undefined ? candidate.draftRecord.moderated_score : candidate.draftRecord.score) : (candidate.moderated_score !== undefined ? candidate.moderated_score : candidate.score)}/${candidate.subject === 'ESS' ? 30 : 25}`}
                </span>
              </div>
            </div>
          </div>

          {submissionViewMode === 'Final' && (
            <>
              {candidate.submissionType === 'Final' ? (
                <>
                  <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden xl:block"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Final IA</span>
                    <div className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase pb-1">IAQA</span>
                        <span className="flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {candidate.iaqa_score !== undefined ? candidate.iaqa_score : candidate.score}/${candidate.subject === 'ESS' ? 30 : 25}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase pb-1">TEACHER</span>
                        <span className="flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                          {candidate.moderated_score !== undefined ? candidate.moderated_score : candidate.score}/${candidate.subject === 'ESS' ? 30 : 25}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-4 hidden xl:block"></div>
                  <div className="flex-1 w-full sm:max-w-[200px]">
                    <button
                      onClick={() => onUploadFinal && onUploadFinal(candidate)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 border-dashed border-emerald-400 hover:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-colors group"
                    >
                      <span className="font-bold text-xs text-left leading-tight pr-2">
                        Upload Final IA
                      </span>
                      <Upload size={18} className="group-hover:-translate-y-1 transition-transform shrink-0" />
                    </button>
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-6">
        {showDelete ? (
          <div ref={deleteContainerRef} className="relative flex-1 h-[42px] bg-red-50 dark:bg-red-500/10 rounded-lg overflow-hidden border border-red-200 dark:border-red-900/50 flex items-center">
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest pl-4">Swipe to delete</span>
             </div>
             <motion.div
               drag="x"
               dragConstraints={deleteContainerRef}
               dragElastic={0}
               dragSnapToOrigin
               onDragEnd={(e, info) => {
                  const containerWidth = deleteContainerRef.current?.offsetWidth || 200;
                  if (info.offset.x > containerWidth * 0.55) {
                     if (onDeleteCandidate) onDeleteCandidate(candidate.id);
                  }
               }}
               className="w-[42px] h-[42px] bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing z-10 shrink-0"
             >
               <Trash2 size={18} className="text-white" />
             </motion.div>
             <button 
               onClick={() => setShowDelete(false)}
               className="absolute right-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 z-10 p-1 bg-red-50 dark:bg-transparent rounded"
             >
               <X size={16} />
             </button>
           </div>
        ) : (
          <>
            {submissionViewMode === 'Draft' ? (
              <button 
                onClick={() => onViewReport(candidate)}
                className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                View Draft Report
              </button>
            ) : (
              <>
                <button 
                  onClick={() => onViewReport(candidate.draftRecord || candidate)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  View Draft Report
                </button>
                <button 
                  onClick={() => onViewReport(candidate)}
                  disabled={candidate.submissionType !== 'Final'}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  View Final Report
                </button>
              </>
            )}
            <button
              onClick={() => generateStudentReportPDF(candidate, activeClassName, activeAssignmentName)}
              className="px-4 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
              title="Download File"
            >
              <FileDown size={16} />
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
              title="Delete Record"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export function DirectoryGallery({ candidates, activeClassName, activeAssignmentName, onViewReport, onDeleteCandidate, onUploadFinal, onBulkUploadFinal }: DirectoryGalleryProps) {
  const [isGeneratingPPTX, setIsGeneratingPPTX] = useState(false);
  const [submissionViewMode, setSubmissionViewMode] = useState<'Draft' | 'Final'>('Draft');

  const displayCandidates = candidates.map(c => {
    if (submissionViewMode === 'Draft' && c.submissionType === 'Final' && c.draftRecord) {
      // Return the draft version for display in Draft mode
      return { ...c.draftRecord, submissionType: 'Draft' as const };
    }
    return c;
  }).filter(c => {
    if (submissionViewMode === 'Draft') {
      return c.submissionType === 'Draft' || !c.submissionType; // fallback for old
    }
    // In Final view, show ALL students (both those who have Finals, and those with only Drafts awaiting a Final)
    return true;
  });

  const handleGeneratePPTX = async () => {
    setIsGeneratingPPTX(true);
    try {
      // 1. Detect dominant subject (most classes are one subject)
      const detectedSubject = displayCandidates[0]?.subject || 'Geography';
      
      // Calculate class averages for each criterion A-F
      const maxScores = detectedSubject === 'ESS' ? [4, 4, 4, 6, 6, 6] : [3, 3, 6, 8, 2, 3];
      const critNames = detectedSubject === 'ESS' 
        ? ["A: RQ & Inquiry", "B: Strategy", "C: Method", "D: Treatment", "E: Analysis & Conclusion", "F: Evaluation"]
        : ["A: Fieldwork Question", "B: Methods", "C: Quality & Treatment", "D: Written Analysis", "E: Conclusion", "F: Evaluation"];
      
      const scoreSums = [0, 0, 0, 0, 0, 0];
      let tCount = 0;

      // Extract details
      const qualitativeData: any[] = [];
      let totalModScoreSum = 0;
      let totalIaqaScoreSum = 0;

      displayCandidates.forEach(cand => {
        tCount++;
        totalIaqaScoreSum += cand.iaqa_score !== undefined ? cand.iaqa_score : cand.score;
        totalModScoreSum += cand.moderated_score !== undefined ? cand.moderated_score : cand.score;
        
        let reportData = cand.report as any;
        if (reportData && !reportData.isComparison && Array.isArray(reportData.criteria)) {
           reportData.criteria.forEach((c: any, index: number) => {
             if (index < 6) {
               scoreSums[index] += c.teacherScore !== undefined ? c.teacherScore : c.score;
             }
           });
           qualitativeData.push({
             summary: reportData.overallSummary,
             www: reportData.criteria.map((c: any) => c.www).join("\n"),
             ebi: reportData.criteria.map((c: any) => c.ebi).join("\n")
           });
        }
      });

      const averages = scoreSums.map(sum => Math.round((sum / Math.max(1, tCount)) * 10) / 10);
      const percentages = averages.map((avg, i) => avg / maxScores[i]);

      // Lowest & Highest scoring criteria
      let highestIdx = 0;
      let lowestIdx = 0;
      percentages.forEach((pct, i) => {
        if (pct > percentages[highestIdx]) highestIdx = i;
        if (pct < percentages[lowestIdx]) lowestIdx = i;
      });

      // Get 3 lowest (by percentage)
      const sortedByPct = percentages.map((pct, i) => ({ pct, i })).sort((a,b) => a.pct - b.pct);
      const lowest3 = sortedByPct.slice(0, 3).map(x => x.i);
      
      const lowestCriteriaMap: Record<string, string> = {};
      lowest3.forEach(critIdx => {
        lowestCriteriaMap[String.fromCharCode(65 + critIdx)] = critNames[critIdx];
      });

      // Call API for analysis synthesis
      const res = await fetch("/api/analyze-cohort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatesData: qualitativeData, lowestCriteriaMap })
      });
      if (!res.ok) throw new Error("Failed to analyze cohort data");
      const analysisData = await res.json();

      // Ensure classWWW/classEBI fallbacks
      const cohortWWW = analysisData.classWWW || ["Strong presentation", "Good data variety", "Clear structure"];
      const cohortEBI = analysisData.classEBI || ["Improve statistics", "Better map scaling", "Deeper evaluation (e.g. relating findings back to inputs/outputs and flows of the drainage basin system)"];
      const executiveSummary = analysisData.executiveSummary || "The class performed well overall but requires refinement in technical execution.";
      const deepDives = analysisData.deepDives || {};

      // Helper to fetch image base64 via proxy to prevent CORS errors
      const getProxyImage = async (url: string) => {
        try {
          const proxyRes = await fetch("/api/proxy-image?url=" + encodeURIComponent(url));
          const data = await proxyRes.json();
          if (data.error) throw new Error(data.error);
          return data.dataUri;
        } catch (err) {
          console.error("Failed to proxy image:", err);
          return null;
        }
      };

      // 2. Generate PPTX
      const pres = new pptxgen();
      pres.layout = "LAYOUT_16x9";
      
      const DEEP_BLUE = "005088";
      const ACCENT_GREEN = "11CAA0";

      // Define default master slide with footer
      pres.defineSlideMaster({
        title: "MASTER_SLIDE",
        background: { color: "FFFFFF" },
        objects: [
          { rect: { x: 0, y: 5.2, w: "100%", h: 0.4, fill: { color: DEEP_BLUE } } },
          { text: { text: `DP ${detectedSubject === 'ESS' ? 'ESS' : 'GEO'} EXAMINER`, options: { x: 0.2, y: 5.25, w: 3, h: 0.3, color: "FFFFFF", fontSize: 10, bold: true, fontFace: "Arial" } } },
        ]
      });

      // SLIDE 1: Title
      const slide1 = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slide1.background = { color: DEEP_BLUE };
      slide1.addText(`${activeClassName || 'Class'} - Internal Assessment`, { x: 1, y: 2, w: 8, h: 1, fontSize: 36, color: "FFFFFF", bold: true, align: "center", fontFace: "Arial" });
      slide1.addText("Feedback & Moderation", { x: 1, y: 3, w: 8, h: 0.5, fontSize: 24, color: ACCENT_GREEN, align: "center", fontFace: "Arial" });

      // SLIDE 2: Class Profile
      const slide2 = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slide2.addText("Class Profile: Criteria Averages", { x: 0.5, y: 0.5, w: 8, h: 0.6, fontSize: 30, color: DEEP_BLUE, bold: true, fontFace: "Arial" });
      const chartData = [
        { name: "Average Score", labels: ["A", "B", "C", "D", "E", "F"], values: averages },
        { name: "Max Score", labels: ["A", "B", "C", "D", "E", "F"], values: maxScores }
      ];
      slide2.addChart(pres.ChartType.bar, chartData, { x: 0.5, y: 1.2, w: 9, h: 3.8, barDir: "col", showLegend: true, legendPos: "r" });

      // SLIDE 3: Executive Summary
      const slide3 = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slide3.addText("Executive Summary", { x: 0.5, y: 0.5, w: 8, h: 0.6, fontSize: 30, color: DEEP_BLUE, bold: true, fontFace: "Arial" });
      slide3.addText(executiveSummary, { x: 0.5, y: 1.5, w: 9, h: 2, fontSize: 20, color: "333333", fontFace: "Arial" });

      // Helper to chunk text lists based on character length roughly
      const chunkTextList = (list: string[], maxLength: number = 300) => {
          const chunks: string[][] = [];
          let currentChunk: string[] = [];
          let currentLength = 0;
          
          list.forEach(item => {
              if (currentLength + item.length > maxLength && currentChunk.length > 0) {
                  chunks.push(currentChunk);
                  currentChunk = [item];
                  currentLength = item.length;
              } else {
                  currentChunk.push(item);
                  currentLength += item.length;
              }
          });
          if (currentChunk.length > 0) chunks.push(currentChunk);
          return chunks;
      };

      // SLIDE 4: What Went Well (Chunked)
      const wwwChunks = chunkTextList(cohortWWW, 350);
      wwwChunks.forEach((chunk, i) => {
          const slide = pres.addSlide({ masterName: "MASTER_SLIDE" });
          slide.addText(`What Went Well${i > 0 ? ' (Continued)' : ''}`, { x: 0.5, y: 0.5, w: 8, h: 0.6, fontSize: 30, color: ACCENT_GREEN, bold: true, fontFace: "Arial" });
          slide.addText(chunk.map((w: string) => ({ text: w, options: { bullet: true } })), { x: 0.5, y: 1.5, w: 9, h: 3.5, fontSize: 18, color: "333333", fontFace: "Arial", valign: "top", autoFit: true, breakLine: true });
      });

      // SLIDE 5: Even Better If (Chunked)
      const ebiChunks = chunkTextList(cohortEBI, 350);
      ebiChunks.forEach((chunk, i) => {
          const slide = pres.addSlide({ masterName: "MASTER_SLIDE" });
          slide.addText(`Even Better If${i > 0 ? ' (Continued)' : ''}`, { x: 0.5, y: 0.5, w: 8, h: 0.6, fontSize: 30, color: "E74C3C", bold: true, fontFace: "Arial" });
          slide.addText(chunk.map((e: string) => ({ text: e, options: { bullet: true } })), { x: 0.5, y: 1.5, w: 9, h: 3.5, fontSize: 18, color: "333333", fontFace: "Arial", valign: "top", autoFit: true, breakLine: true });
      });

      // SLIDE A: Concept Focus - Drainage Basin
      const slideDB = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slideDB.addText("Concept Focus: Drainage Basin Framework", { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 30, color: DEEP_BLUE, bold: true, fontFace: "Arial" });
      slideDB.addText("Ensure you explicitly link findings back to theoretical components:", { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18, color: "555555" });
      slideDB.addText([
        { text: "Inputs (Precipitation)", options: { bullet: true } },
        { text: "Stores (Interception, Surface, Soil Moisture, Groundwater)", options: { bullet: true } },
        { text: "Flows/Transfers (Infiltration, Percolation, Throughflow, Groundwater flow)", options: { bullet: true } },
        { text: "Outputs (Evapotranspiration, River runoff)", options: { bullet: true } }
      ], { x: 0.5, y: 1.8, w: 4.5, h: 3, fontSize: 16, color: "333333", valign: "middle", autoFit: true });
      const img1 = await getProxyImage("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800");
      if (img1) slideDB.addImage({ data: img1, x: 5.2, y: 1.5, w: 4.5, h: 3.5, sizing: { type: "contain", w: 4.5, h: 3.5 } });

      // SLIDE A2: Concept Focus - Agricultural Runoff
      const slideRunoff = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slideRunoff.addText("Concept Focus: Agricultural Runoff", { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 30, color: DEEP_BLUE, bold: true, fontFace: "Arial" });
      slideRunoff.addText("Connect human activity (e.g. irrigation) to systematic outcomes:", { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18, color: "555555" });
      slideRunoff.addText([
        { text: "Trace nutrient pathways from land into river systems.", options: { bullet: true } },
        { text: "Analyze the spatial impact of human land use on water quality.", options: { bullet: true } }
      ], { x: 0.5, y: 1.8, w: 4.5, h: 3, fontSize: 16, color: "333333", valign: "top", autoFit: true });
      const img2 = await getProxyImage("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800");
      if (img2) slideRunoff.addImage({ data: img2, x: 5.2, y: 1.5, w: 4.5, h: 3.5, sizing: { type: "contain", w: 4.5, h: 3.5 } });

      // SLIDE A3: Linking Data
      const slideData = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slideData.addText("Crucial: Link Quantitative & Qualitative Data", { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 30, color: "E74C3C", bold: true, fontFace: "Arial" });
      slideData.addText("A descriptive list of numbers is not an analysis.", { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18, color: "555555", italic: true });
      slideData.addText([
        { text: "Synthesize Numerical Evidence: Do not just list river velocities or pH levels. Explain what they show about the system's overall function.", options: { bullet: true } },
        { text: "Fuse with Qualitative Observations: Corroborate statistical results with field notes (e.g. channel vegetation, bank erosion).", options: { bullet: true } },
        { text: "Identify Anomalies: If quantitative data contradicts visual expectations, explain the geographical reason why.", options: { bullet: true } }
      ], { x: 0.5, y: 1.8, w: 9, h: 3, fontSize: 18, color: "333333", valign: "top", autoFit: true });

      // SLIDE B: Cartography & Map Conventions
      const slideMap = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slideMap.addText("Map Conventions & Structural Policies", { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 30, color: DEEP_BLUE, bold: true, fontFace: "Arial" });
      slideMap.addText("Strict Map Requirements (TOLAD):", { x: 0.5, y: 1.2, w: 5, h: 0.5, fontSize: 18, color: "E74C3C", bold: true });
      slideMap.addText([
        { text: "Title (Clear and descriptive)", options: { bullet: true } },
        { text: "Orientation (North Arrow)", options: { bullet: true } },
        { text: "Legend / Key (Correct units)", options: { bullet: true } },
        { text: "Author & Source Data", options: { bullet: true } },
        { text: "Date (When data was collected)", options: { bullet: true } },
        { text: "Scale (Bar scale or ratio)", options: { bullet: true } },
      ], { x: 0.5, y: 1.8, w: 4.5, h: 3, fontSize: 16, color: "333333", valign: "middle", autoFit: true });
      const img3 = await getProxyImage("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=640");
      if (img3) slideMap.addImage({ data: img3, x: 5.2, y: 1.5, w: 4.5, h: 3.5, sizing: { type: "contain", w: 4.5, h: 3.5 } });

      // SLIDE B2: Exemplary Conventions
      const slideExemplary = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slideExemplary.addText("Exemplary Use of Conventions: Maps", { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 30, color: ACCENT_GREEN, bold: true, fontFace: "Arial" });
      slideExemplary.addText("Excellent integration of titles, clear legends, north arrows, and scale bars:", { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18, color: "555555" });
      const imgExemplar = await getProxyImage("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800");
      if (imgExemplar) slideExemplary.addImage({ data: imgExemplar, x: 1.5, y: 1.8, w: 7, h: 3.3, sizing: { type: "contain", w: 7, h: 3.3 } });

      // SLIDE B3: Exemplary Data Presentation
      const slideDataPres = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slideDataPres.addText("Exemplary Use of Conventions: Graphs", { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 30, color: ACCENT_GREEN, bold: true, fontFace: "Arial" });
      slideDataPres.addText("Clear titles, labeled axes with units, and descriptive annotations:", { x: 0.5, y: 1.2, w: 9, h: 0.5, fontSize: 18, color: "555555" });
      const imgExemplar2 = await getProxyImage("https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800");
      if (imgExemplar2) slideDataPres.addImage({ data: imgExemplar2, x: 1.5, y: 1.8, w: 7, h: 3.3, sizing: { type: "contain", w: 7, h: 3.3 } });

      // SLIDE 6-8: Deep Dives (Lowest 3 criteria)
      lowest3.forEach(critIdx => {
        const critChar = String.fromCharCode(65 + critIdx);
        const slide = pres.addSlide({ masterName: "MASTER_SLIDE" });
        slide.addText(`Deep Dive: Criterion ${critChar} - ${critNames[critIdx]}`, { x: 0.5, y: 0.5, w: 9, h: 0.6, fontSize: 24, color: DEEP_BLUE, bold: true, fontFace: "Arial" });
        slide.addText(`Class Average: ${averages[critIdx]} / ${maxScores[critIdx]}`, { x: 0.5, y: 1.2, w: 8, h: 0.5, fontSize: 18, color: "555555", fontFace: "Arial" });
        slide.addShape(pres.ShapeType.rect, { fill: { color: "F0F8FF" }, w: 9, h: 2.5, x: 0.5, y: 2.0 });
        const tipText = deepDives[critChar] || "Teacher's Tip: Review the IB Geography spec requirements for this criterion carefully. Ensure required conventions (like map accuracy or statistical tests) are not generalized.";
        slide.addText(tipText, { x: 0.6, y: 2.1, w: 8.8, h: 2.3, fontSize: 16, color: "333333", fontFace: "Arial", valign: "top" });
      });

      // SLIDE 9: Moderation Note
      const diff = totalModScoreSum - totalIaqaScoreSum;
      const slide9 = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slide9.addText("Moderation Variance Summary", { x: 0.5, y: 0.5, w: 8, h: 0.6, fontSize: 30, color: DEEP_BLUE, bold: true, fontFace: "Arial" });
      slide9.addText([
        { text: `Total IAQA Expected Sum: ${totalIaqaScoreSum}`, options: { bullet: true } },
        { text: `Total Teacher Moderated Sum: ${totalModScoreSum}`, options: { bullet: true } },
        { text: `Variance: ${diff > 0 ? '+' : ''}${diff} points`, options: { bullet: true, color: diff > 0 ? ACCENT_GREEN : (diff < 0 ? "E74C3C" : "555555"), bold: true } }
      ], { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 20, color: "333333", fontFace: "Arial", valign: "top" });

      // SLIDE 10: Next Steps
      const slide10 = pres.addSlide({ masterName: "MASTER_SLIDE" });
      slide10.addText("Next Steps: Final Revision Hour", { x: 0.5, y: 0.5, w: 8, h: 0.6, fontSize: 30, color: DEEP_BLUE, bold: true, fontFace: "Arial" });
      slide10.addText([
        { text: "Review your individual EBI feedback from the Teacher Directory.", options: { bullet: true } },
        { text: "Verify all Map Conventions (North Arrow, Scale, Key).", options: { bullet: true } },
        { text: "Check your Word Count and formatting one last time.", options: { bullet: true } }
      ], { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 20, color: "333333", fontFace: "Arial", valign: "top" });

      const safeClassNameName = (activeClassName || 'Class').replace(/[^a-zA-Z0-9]/g, '');
      const fileName = `${safeClassNameName}_IA_Feedback_Deck.pptx`;
      await pres.writeFile({ fileName });

    } catch (err) {
      console.error(err);
      alert("Failed to generate presentation.");
    } finally {
      setIsGeneratingPPTX(false);
    }
  };

  const generateExcelReport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('IA Grades');

    // Add main header
    const headerRow = sheet.getRow(1);
    
    // Setup Column headers
    sheet.columns = [
      { header: 'Surname', key: 'surname', width: 20 },
      { header: 'Forename', key: 'forename', width: 20 },
      { header: 'Preferred Name', key: 'preferred', width: 20 },
      { header: 'Criterion A (3)', key: 'critA', width: 15 },
      { header: 'Criterion B (3)', key: 'critB', width: 15 },
      { header: 'Criterion C (6)', key: 'critC', width: 15 },
      { header: 'Criterion D (8)', key: 'critD', width: 15 },
      { header: 'Criterion E (2)', key: 'critE', width: 15 },
      { header: 'Criterion F (3)', key: 'critF', width: 15 },
      { header: 'IA Final Mark (25)', key: 'total', width: 20 },
    ];

    // Configure main header spanning (Merge D1 to J1 and set value)
    sheet.mergeCells('D1:J1');
    const mainTitleCell = sheet.getCell('D1');
    mainTitleCell.value = 'INTERNAL ASSESSMENT FINAL';
    mainTitleCell.font = { bold: true, size: 14 };
    mainTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    mainTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF200' } // Yellow
    };
    
    // Add Borders to main title cell
    mainTitleCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Push the columns headers down to row 2
    sheet.spliceRows(1, 0, []); 
    // Now D1:J1 became D2:J2, that is incorrect.
    // The correct way: set values in row 2 for columns, D1:J1 for title.
  };

  const handleGenerateFinalSummaryPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 6;
    let y = 15;

    const summaryCandidates = candidates.filter(c => c.submissionType === 'Final' && c.draftRecord);

    // --- Header Section ---
    // Emerald banner top
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('DP IA QUALITY ASSURANCE', margin, 17);
    
    y = 35;
    
    // Report Title
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Final Class Moderation Summary', margin, y);
    y += 8;

    // Metadata
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const dateStrFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Class: ${activeClassName || 'N/A'}`, margin, y);
    doc.text(`Date: ${dateStrFormatted}`, margin + 100, y);
    y += 6;
    doc.text(`Assignment: ${activeAssignmentName || 'N/A'}`, margin, y);
    doc.text(`Total Candidates: ${summaryCandidates.length}`, margin + 100, y);
    y += 12;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        
        // Minor header on new page
        doc.setFillColor(16, 185, 129);
        doc.rect(0, 0, pageWidth, 6, 'F');
        y = 15;
      }
    };

    summaryCandidates.forEach((cand, index) => {
      checkPageBreak(50); // Ensure minimal space for candidate

      const draft = cand.draftRecord!;
      const draftIaqa = draft.iaqa_score !== undefined ? draft.iaqa_score : draft.score;
      const draftTeacher = draft.moderated_score !== undefined ? draft.moderated_score : draft.score;
      
      const finalIaqa = cand.iaqa_score !== undefined ? cand.iaqa_score : cand.score;
      const finalTeacher = cand.moderated_score !== undefined ? cand.moderated_score : cand.score;
      const delta = (cand.scoreDelta !== undefined) ? cand.scoreDelta : (finalTeacher - draftTeacher);

      // Separator Line if not first
      if (index > 0) {
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(margin, y - 5, pageWidth - margin, y - 5);
      }

      // Candidate Name
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(cand.studentName, margin, y);
      
      // Score Delta Badge (sort of)
      const deltaText = `Teacher Change: ${delta > 0 ? '+' : ''}${delta}`;
      doc.setFontSize(11);
      if (delta > 0) {
        doc.setTextColor(16, 185, 129); // emerald-500
      } else if (delta < 0) {
        doc.setTextColor(239, 68, 68); // red-500
      } else {
        doc.setTextColor(100, 116, 139); // slate-500
      }
      doc.text(deltaText, pageWidth - margin - doc.getTextWidth(deltaText), y);
      y += 6;

      // Scores Table Layout
      checkPageBreak(25);
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(margin, y, maxWidth, 22, 2, 2, 'FD');

      y += 7;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFont('helvetica', 'bold');
      doc.text('DRAFT IA', margin + 5, y);
      doc.text('FINAL IA', margin + maxWidth / 2, y);
      
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.setFont('helvetica', 'bold');
      doc.text(`IAQA: ${draftIaqa}/25    Teacher: ${draftTeacher}/25`, margin + 5, y);
      doc.text(`IAQA: ${finalIaqa}/25    Teacher: ${finalTeacher}/25`, margin + maxWidth / 2, y);
      
      y += 12;

      const printNoteSection = (title: string, content: string | undefined | null) => {
        if (!content) return;
        const text = String(content);
        if (text.trim() === '') return;

        checkPageBreak(25);
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        y += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105); // slate-600
        const lines = doc.splitTextToSize(text, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
          checkPageBreak(10);
          doc.text(lines[i], margin, y);
          y += 5;
        }
        y += 3;
      };

      printNoteSection('Progress Summary', (cand.report as any)?.progressSummary);
      printNoteSection('Moderation Note', (cand.report as any)?.moderationNote);

      y += 6; // Bottom padding for candidate
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const safeClassName = (activeClassName || 'Class').replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `${safeClassName}_Final_Class_Moderation_Summary_${dateStr}.pdf`;
    doc.save(fileName);
  };

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('IA Grades', {
      views: [{ state: 'frozen', xSplit: 3, ySplit: 2 }]
    });

    const isDraft = submissionViewMode === 'Draft';
    const prefix = isDraft ? 'DR ' : '';

    // 1st Row: Title
    sheet.mergeCells('D1:J1');
    const titleCell = sheet.getCell('D1');
    titleCell.value = isDraft ? 'INTERNAL ASSESSMENT DRAFT' : 'INTERNAL ASSESSMENT FINAL';
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // Yellow
    titleCell.border = {
      top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
    };

    // Style A1:C1 matching Identity area color
    for (let i = 1; i <= 3; i++) {
      const c = sheet.getCell(1, i);
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } }; // Green
      c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    }

    // 2nd Row: Headers
    const headers = [
      'Surname', 'Forename', 'Preferred Name',
      `${prefix}Criterion A (3)`, `${prefix}Criterion B (3)`, `${prefix}Criterion C (6)`,
      `${prefix}Criterion D (8)`, `${prefix}Criterion E (2)`, `${prefix}Criterion F (3)`,
      `${prefix}IA Final Mark (25)`
    ];
    
    const row2 = sheet.getRow(2);
    headers.forEach((headerText, index) => {
      const cell = row2.getCell(index + 1);
      cell.value = headerText;
      
      const isScoreCol = index >= 3 && index < 9;
      const isFinalMarkCol = index === 9;
      
      cell.font = { bold: true };
      if (isFinalMarkCol) {
          cell.font = { bold: true, color: { argb: 'FF0000FF' } }; // Blue text
      }

      cell.alignment = { 
        horizontal: (isScoreCol || isFinalMarkCol) ? 'center' : 'left', 
        textRotation: (isScoreCol || isFinalMarkCol) ? 90 : 0, 
        vertical: 'bottom'
      };
      
      // Background colors
      if (index < 3) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } }; // Green
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // Yellow
      }

      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    row2.height = 120; // Height for vertical text

    // Set Column Widths
    sheet.getColumn(1).width = 15;
    sheet.getColumn(2).width = 15;
    sheet.getColumn(3).width = 15;
    for (let i = 4; i <= 9; i++) {
        sheet.getColumn(i).width = 6;
    }
    sheet.getColumn(10).width = 10; // Final Mark Col

    // Data Rows
    const candidatesToExport = submissionViewMode === 'Final' 
      ? displayCandidates.filter(c => c.submissionType === 'Final')
      : displayCandidates;
    const sortedCandidates = [...candidatesToExport].sort((a, b) => a.studentName.localeCompare(b.studentName));
    
    sortedCandidates.forEach((cand, idx) => {
      const rowNum = idx + 3;
      const row = sheet.getRow(rowNum);

      // Parse name components
      let surname = cand.studentName;
      let forename = "";
      let preferred = "";
      const nameParts = cand.studentName.split(",");
      if (nameParts.length >= 2) {
          surname = nameParts[0].trim();
          forename = nameParts[1].trim();
          if (nameParts[2]) {
              preferred = nameParts[2].trim().replace(/[()]/g, '');
          }
      }

      const scores = [0, 0, 0, 0, 0, 0];
      let total = 0;
      if (cand.report && Array.isArray((cand.report as any).criteria)) {
         (cand.report as any).criteria.forEach((c: any, i: number) => {
            if (i < 6) {
               const s = c.teacherScore !== undefined ? c.teacherScore : c.score;
               scores[i] = s;
               total += s;
            }
         });
      } else {
          total = cand.moderated_score !== undefined ? cand.moderated_score : cand.score;
      }

      const rowValues = [surname, forename, preferred, ...scores, total];
      rowValues.forEach((val, colIdx) => {
         const cell = row.getCell(colIdx + 1);
         cell.value = val;
         
         const isTotalCol = colIdx === 9;
         const isScoreCol = colIdx >= 3 && colIdx <= 8;

         if (isTotalCol) {
            cell.font = { bold: true, color: { argb: 'FF0000FF' } };
         }
         
         cell.alignment = { 
            horizontal: (isScoreCol || isTotalCol) ? 'center' : 'left' 
         };

         cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
         };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const dataStr = new Date().toISOString().split('T')[0];
    const safeClassName = (activeClassName || 'Class').replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `${safeClassName}_IA_Grades_${submissionViewMode}_${dataStr}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
  };

  if (candidates.length === 0) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700">
        <div className="text-center text-slate-400 dark:text-slate-500">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm font-bold uppercase tracking-widest">Select assignment to view candidates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 overflow-y-auto h-full">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-6 gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 shrink-0">
              <Trophy size={20} className="text-emerald-500" />
              Saved Candidates <span className="text-sm font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{displayCandidates.length}</span>
            </h3>

            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setSubmissionViewMode('Draft')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${submissionViewMode === 'Draft' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Draft IA
              </button>
              <button
                onClick={() => setSubmissionViewMode('Final')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${submissionViewMode === 'Final' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Final IA
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-start xl:justify-end gap-2 shrink-0">
            {submissionViewMode === 'Draft' ? (
              <button
                onClick={handleGeneratePPTX}
                disabled={isGeneratingPPTX || displayCandidates.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d35230] hover:bg-[#b04325] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors shadow-sm"
              >
                {isGeneratingPPTX ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing Class Trends...
                  </>
                ) : (
                  <>
                    <Presentation size={14} />
                    Generate Class Feedback Deck (.pptx)
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={onBulkUploadFinal}
                  disabled={!candidates.some(c => c.submissionType === 'Draft')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors shadow-sm"
                >
                  <Upload size={14} />
                  Bulk Upload Final IAs
                </button>
                <button
                  onClick={handleGenerateFinalSummaryPDF}
                  disabled={!candidates.some(c => c.submissionType === 'Final' && c.draftRecord)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors shadow-sm"
                >
                  <Presentation size={14} />
                  Final Class Moderation Summary
                </button>
              </>
            )}
            <button
              onClick={handleDownloadExcel}
              disabled={displayCandidates.length === 0 || isGeneratingPPTX}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              Download {submissionViewMode} Class Report (.xlsx)
            </button>
          </div>
        </div>

        {displayCandidates.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
             <p className="text-slate-400 text-sm font-bold uppercase">No {submissionViewMode} records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...displayCandidates].sort((a, b) => a.studentName.localeCompare(b.studentName)).map(candidate => (
              <CandidateCard 
                key={candidate.id} 
                candidate={candidate} 
                activeClassName={activeClassName}
                activeAssignmentName={activeAssignmentName}
                onViewReport={onViewReport} 
                onDeleteCandidate={onDeleteCandidate} 
                onUploadFinal={onUploadFinal}
                submissionViewMode={submissionViewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
