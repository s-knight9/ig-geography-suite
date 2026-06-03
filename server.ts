import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { PDFParse } from "pdf-parse";

// Maintain compatibility with the old pdf-parse function signature using v2.4.5 class-based interface
async function pdf(buffer: Buffer): Promise<{ text: string }> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return { text: result.text || "" };
  } finally {
    await parser.destroy();
  }
}
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import Parser from "rss-parser";
import crypto from "crypto";
import { getTodayPolls, castVote, hasPollsForToday, savePolls } from "./Fresh-off-the-Press/src/server/db.ts";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEOG_APP_KEY_V1;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

// Centerpiece helper function for robust Gemini API calls with exponential backoff and stable model fallbacks
async function generateContentWithRetry(
  ai: any,
  requestedModel: string,
  contents: any,
  config?: any
): Promise<any> {
  let modelName = requestedModel;
  let retries = 3;
  let delay = 1500;
  let lastError: any = null;

  while (retries >= 0) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: config
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const isRetryable = err?.status === 500 || err?.status === 503 || err?.status === 429 ||
                         err?.message?.includes('500') || err?.message?.includes('503') || err?.message?.includes('429') ||
                         err?.message?.includes('INTERNAL') || err?.message?.includes('UNAVAILABLE') ||
                         err?.message?.includes('Resource has been exhausted') || err?.message?.includes('high demand') ||
                         err?.message?.includes('temporary');
      
      if (isRetryable && retries > 0) {
        console.warn(`[Gemini API] Error for model ${modelName} (${err?.message || err?.status}). Retrying in ${delay}ms... (Attempts left: ${retries})`);
        
        // Dynamic fallback logic
        if (retries <= 2) {
          if (modelName === "gemini-3.5-flash") {
            console.warn("[Gemini API] Falling back from gemini-3.5-flash to stable gemini-2.5-flash due to rate limits or high demand.");
            modelName = "gemini-2.5-flash";
          } else if (modelName === "gemini-2.5-flash") {
            console.warn("[Gemini API] Falling back from gemini-2.5-flash to stable gemini-1.5-flash due to rate limits or high demand.");
            modelName = "gemini-1.5-flash";
          } else if (modelName === "gemini-3.1-pro-preview") {
            console.warn("[Gemini API] Falling back from gemini-3.1-pro-preview to stable gemini-1.5-pro due to rate limits or high demand.");
            modelName = "gemini-1.5-pro";
          } else if (modelName !== "gemini-2.5-flash" && modelName !== "gemini-1.5-flash") {
            console.warn(`[Gemini API] Falling back from ${modelName} to stable gemini-2.5-flash.`);
            modelName = "gemini-2.5-flash";
          }
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        retries--;
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
  throw lastError || new Error("Failed to generate content after retries");
}


const OCR_SYSTEM_INSTRUCTION = `
You are an expert OCR and handwriting transcription assistant. 
Your task is to transcribe student work from images (scanned PDFs or photos of handwritten essays).

-   Transcribe the text EXACTLY as written.
-   Preserve paragraphs and line breaks.
-   If you encounter a word that is completely illegible, use [illegible].
-   Do not add any preamble or commentary; only return the transcribed text.
-   Student work is for geography essays, so expect geographical terminology.
`;

const ESSAY_SYSTEM_INSTRUCTION = `
You are an expert IB Geography examiner and feedback coach. Your task is to assess student geography essays using the IB Geography generic markbands and provide precise, paragraph-by-paragraph feedback.

### PAPER SPECIFIC CHARACTERISTICS
- Paper 1 (Options): 10-mark essays only. Require balanced argument, AO3 evaluation, use of examples/case studies, awareness of scale/place/process/perspectives. Not simply descriptive.
- Paper 2 (Core): 10-mark essays. AO3 judgement expected. Broad synoptic understanding. Balanced discussion.
- Paper 3 (HL Extension):
    - 12-mark essays (Part A): AO2 focused. Analysis, application, explanation. Examples integrated. Evaluation is NOT the main feature.
    - 16-mark essays (Part B): AO3 focused. Evaluation, synthesis, judgement. Multiple perspectives/scales. Balanced conclusion. Full evaluative essay.

### MARKING PRINCIPLES
- AO1: Knowledge & Understanding (correct facts, terminology).
- AO2: Application & Analysis (explaining relationships, breaking down processes).
- AO3: Synthesis & Evaluation (making judgments, weighing evidence, connecting ideas across scales/time).
- AO4: Organization, structure, use of examples.
- Use "Best-fit" approach.
- Reward explicit links to question and accurate terminology.
- Reward analytical chains (A leading to B leading to C).

### OUTPUT STRUCTURE (MANDATORY)
Your response MUST follow this exact structure:

# Essay Assessment
**Essay type**: [Paper number], [Mark value] — [Brief description of expectations]

## Overall judgement before marking
[2-4 sentences explaining how well it addressed the question, matches demands, key strength, and biggest limitation.]

## Paragraph-by-paragraph feedback
### Paragraph 1
- **What it does well**: [Specific strengths]
- **What needs improving**: [Specific weaknesses]
- **Examiner comment**: [How it affects the mark]

[Repeat for every paragraph found in the essay]

## Whole-essay feedback
### Strengths
- [Identify strongest ideas/examples/analytical moves]

### Main areas for improvement
- [Identify what prevents a higher mark: thin argument, weak evidence, fading relevance, missing evaluation/analysis]

### Marking rationale
- **Best-fit markband**: [Explain which markband fits best and why]
- **Why it is not in the markband above**: [Briefly explain what is missing for the next level]

**Final mark: X / [Total Marks]**

## Student-friendly assessment summary
[3-5 sentences directly to the student: clear, encouraging, honest, next steps.]

### ADDITIONAL NOTES FROM MARKBANDS
- 9-10 (for 10-mark): In-depth, question-specific, balanced, complex terminology, well-developed evaluation.
- 10-12 (for 12-mark): Addresses all aspects, integrated evidence, structured, explains both sides (if appropriate).
- 13-16 (for 16-mark): Well-structured, critical analysis of evidence certainty, other perspectives discussed, justified conclusion.
- Avoid "descriptive" responses for high marks; look for "analytical" or "evaluative" depth.
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // ==========================================
  // IA QUALITY ASSURANCE ENDPOINTS
  // ==========================================

  // Helper to run IA Analysis on text via Gemini API
  async function performIaAnalysis(text: string, subject: string): Promise<any> {
    const ai = getGenAI();

    let prompt = "";
    if (subject === 'ESS') {
      prompt = `You are an Expert IBDP Environmental Systems and Societies (ESS) Moderator. Evaluate the following Internal Assessment (IA) text against the 30-mark scale.
      
Strict Marking Framework (ESS):
- Criterion A: Research question & inquiry (Max 4) - Focus on Environmental issue context (local/global), EVS links, and RQ focus.
- Criterion B: Strategy (Max 4) - Focus on scientific approach, variable identification (IV/DV/CV), and safety/ethics.
- Criterion C: Method (Max 4) - Focus on sampling justification, repeatability, and data sufficiency/reliability.
- Criterion D: Treatment of Data (Max 6) - Focus on raw data quality, technical processing, complex graphing, and uncertainties.
- Criterion E: Analysis & Conclusion (Max 6) - Focus on data-driven analysis, conclusion linked to RQ, and scientific reasoning.
- Criterion F: Evaluation (Max 6) - Focus on methodological weaknesses, impact of limitations, and realistic improvements.

Word Count Protocol (ESS):
- Strict 3,000-word limit.
- Include: Narrative flow, systems explanations, and qualitative analysis.
- Exclude: Charts, diagrams, data tables, and bibliography.

Feedback Format:
- Professional, direct, and comprehensive.
- Provide a detailed "What Went Well" (WWW) as a bulleted list (using •). MANDATORY: Every single bullet MUST start on a completely new line. Do NOT combine bullets into a single paragraph. Quote specific evidence, data, or phrases from the IA to justify the strengths.
- Provide a detailed "Even Better If" (EBI) as a bulleted list (using •). MANDATORY: Every single bullet MUST start on a completely new line. Do NOT combine bullets into a single paragraph. Quote specific evidence from the IA and providing actionable steps for improvement. Integrate common examiner pitfalls into these points.
- Ensure feedback is thorough and extremely specific; reference specific sentences or data points where possible.
- Reference official 'Subject Reports' to flag common examiner pitfalls.
- Every assigned score must cite specific student text or identify exact omissions.
${text.substring(0, 50000)}
`;
    } else {
      prompt = `You are an Expert IBDP Geography Moderator. Evaluate the following Internal Assessment (IA) text against the 25-mark scale.
      
Strict Marking Framework (Geography):
- Criterion A: Fieldwork Question & Context (Max 3)
- Criterion B: Methods of Investigation (Max 3)
- Criterion C: Quality & Treatment of Data (Max 6)
- Criterion D: Written Analysis (Max 8)
- Criterion E: Conclusion (Max 2)
- Criterion F: Evaluation (Max 3) - CRITICAL: If the candidate does not suggest adaptions to the investigation AND explain how that would make the investigation more thorough and credible, they can NEVER get 3 points.

Word Count Protocol (Geography):
- Include: FQ, analysis, conclusion, evaluation, and annotations >10 words.
- Exclude: Title page, contents, map legends, labels <10 words, and statistical tables.

Feedback Format:
- Professional, direct, and comprehensive.
- Provide a detailed "What Went Well" (WWW) as a bulleted list (using •). MANDATORY: Every single bullet MUST start on a completely new line. Do NOT combine bullets into a single paragraph. Quote specific evidence, data, or phrases from the IA to justify the strengths.
- Provide a detailed "Even Better If" (EBI) as a bulleted list (using •). MANDATORY: Every single bullet MUST start on a completely new line. Do NOT combine bullets into a single paragraph. Quote specific evidence from the IA and providing actionable steps for improvement. Integrate common examiner pitfalls into these points.
- Ensure feedback is thorough and extremely specific; reference specific sentences or data points where possible.
- **Meticulous Technical Check**: Scour every figure and map for required IB conventions (North arrows, scales, clear legends, legible labels). Be extremely rigorous: if a scale is technically present but too small to be functional for an examiner, flag it as a weakness in the EBI. Do not miss clearly visible North arrows, which are often located in the corners or specialized convention boxes within figure frames. Critically evaluate their placement and accuracy.
${text.substring(0, 50000)}
`;
    }

    const response = await generateContentWithRetry(ai, "gemini-3.1-pro-preview", prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Criterion letter (A-F)" },
                name: { type: Type.STRING },
                score: { type: Type.INTEGER },
                maxScore: { type: Type.INTEGER },
                www: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What went well: List of specific quotes and strengths. Write each point as a separate string." },
                ebi: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Even better if: List of specific quotes, weaknesses, and actionable improvements. Write each point as a separate string." }
              },
              required: ["id", "name", "score", "maxScore", "www", "ebi"]
            }
          },
          totalScore: { type: Type.INTEGER },
          wordCount: {
            type: Type.OBJECT,
            properties: {
              included: { type: Type.INTEGER },
              excluded: { type: Type.INTEGER },
              total: { type: Type.INTEGER },
              status: { type: Type.STRING, description: "Compliance status" }
            },
            required: ["included", "excluded", "total", "status"]
          },
          overallSummary: { type: Type.STRING }
        },
        required: ["criteria", "totalScore", "wordCount", "overallSummary"]
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Empty response from AI");
    }
    const result = JSON.parse(textResponse);
    result.subject = subject;
    return result;
  }

  // IA Moderation Endpoint (Text payload instead of file)
  app.post("/api/analyze-ia-text", async (req, res) => {
    try {
      const { text, subject = 'Geography' } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }
      const result = await performIaAnalysis(text, subject);
      res.json(result);
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze IA: " + error.message });
    }
  });

  // IA Moderation Endpoint (Multipart upload proxy to backend)
  app.post("/api/moderate-ia", upload.single("iaFile"), async (req, res) => {
    try {
      const subject = (req.body.subject as string) || 'Geography';
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Extract text from buffer on backend
      const data = await pdf(req.file.buffer);
      const text = data.text;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Could not extract any text from the document. It might be scanned or empty." });
      }

      const result = await performIaAnalysis(text, subject);
      result.rawText = text;
      res.json(result);
    } catch (error: any) {
      console.error("Moderation error:", error);
      res.status(500).json({ error: "Failed to analyze IA: " + error.message });
    }
  });

  // IA Comparison Endpoint
  app.post("/api/compare-ias-text", async (req, res) => {
    try {
      const { text1, text2, mode, subject = 'Geography' } = req.body;
      if (!text1 || !text2) {
        return res.status(400).json({ error: "Two texts must be provided" });
      }

      const ai = getGenAI();

      const promptContext = mode === 'progress' 
        ? `You are comparing a student's ${subject} IA Draft against their Final submission. Act as a Progress Auditor. Your primary goal is to identify and quantify improvements. Analyze Criterion scores side-by-side. Highlight specific sections where technical analysis, data presentation, or evaluation depth has increased. Provide a 'Progress Summary' explaining the value-added between versions.`
        : `You are an Expert IBDP ${subject} Moderator. Analyze these two ${subject} IAs. Identify differences in marking criteria attainment, quality of data presentation, and depth of analysis. Use the moderator note to reconcile the scores and explain the justification for the difference.`;

      const framework = subject === 'ESS' 
        ? `- Criterion A: Research question & inquiry (Max 4)
- Criterion B: Strategy (Max 4)
- Criterion C: Method (Max 4)
- Criterion D: Treatment of Data (Max 6)
- Criterion E: Analysis & Conclusion (Max 6)
- Criterion F: Evaluation (Max 6)`
        : `- Criterion A: Fieldwork Question & Context (Max 3)
- Criterion B: Methods of Investigation (Max 3)
- Criterion C: Quality & Treatment of Data (Max 6)
- Criterion D: Written Analysis (Max 8)
- Criterion E: Conclusion (Max 2)
- Criterion F: Evaluation (Max 3)`;

      const prompt = `${promptContext}
      
Feedback Format:
- Professional, direct, and extremely comprehensive.
- Provide a detailed "What Went Well" (WWW) and "Even Better If" (EBI) as bulleted lists for EACH of the two candidates (using •). MANDATORY: Every single bullet MUST start on a completely new line. Quote specific evidence, data points, or phrases from both IA 1 and IA 2 to contrast their quality.
- For each criterion, provide a "Comparative Feedback" summarizing the differences.
- ${mode === 'progress' ? `Use the moderator note to provide a 'Progress Summary' that details exactly how the student improved from Draft to Final, including specific references to value-added content.` : `Use the moderator note to reconcile the scores and explain the justification for the difference.`}
- **Meticulous Convention Audit**: Perform a side-by-side technical audit of all maps and figures. Specifically cross-reference the presence and functionality of North arrows and scales. North Arrows are often in the corners or dedicated boxes; ensure they are not missed. If one candidate has included these elements according to spec but the other has missing or non-functional (e.g., too small) conventions, this must be a highlighted point of moderation.
- **Academic Integrity**: In Comparison Mode, add a 'Highlight Similarities' toggle. This should use the AI to flag any sections of text or data analysis that appear suspiciously identical between the two documents to assist with academic integrity checks.

Strict Marking Framework (${subject}):
${framework}

Provide the comparative feedback across specific criteria, and give a moderation note explaining why one IA scored differently (or how the draft improved to become the final). Also provide a similarities report.

IA 1 TEXT:
${text1.substring(0, 40000)}

IA 2 TEXT:
${text2.substring(0, 40000)}
`;

      const response = await generateContentWithRetry(ai, "gemini-3.1-pro-preview", prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            criteriaComparison: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Criterion letter (A-F)" },
                  name: { type: Type.STRING },
                  score1: { type: Type.INTEGER },
                  score2: { type: Type.INTEGER },
                  maxScore: { type: Type.INTEGER },
                  www1: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What went well for IA 1: List of specific quotes and strengths. Write each point as a separate string." },
                  ebi1: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Even better if for IA 1: List of specific quotes, weaknesses, and actionable improvements. Write each point as a separate string." },
                  www2: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What went well for IA 2: List of specific quotes and strengths. Write each point as a separate string." },
                  ebi2: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Even better if for IA 2: List of specific quotes, weaknesses, and actionable improvements. Write each point as a separate string." },
                  feedback: { type: Type.STRING, description: "Comparative feedback for this criterion. MANDATORY: Start each bullet (•) on a new line." }
                },
                required: ["id", "name", "score1", "score2", "maxScore", "www1", "ebi1", "www2", "ebi2", "feedback"]
              }
            },
            totalScore1: { type: Type.INTEGER },
            totalScore2: { type: Type.INTEGER },
            moderationNote: { type: Type.STRING, description: "Explains why one IA scored higher/differently." },
            similaritiesReport: { type: Type.STRING, description: "Identify any sections of text or data analysis that look suspiciously identical between the two documents to assist with academic integrity." }
          },
          required: ["criteriaComparison", "totalScore1", "totalScore2", "moderationNote", "similaritiesReport"]
        }
      });

      const textResponse = response.text;
      if (!textResponse) {
        throw new Error("Empty response from AI");
      }
      const data = JSON.parse(textResponse);
      data.subject = subject;
      res.json(data);
    } catch (error: any) {
      console.error("Comparison error:", error);
      res.status(500).json({ error: "Failed to compare IAs: " + error.message });
    }
  });

  // Cohort Analysis Endpoint
  app.post("/api/analyze-cohort", async (req, res) => {
    try {
      const { candidatesData, lowestCriteriaMap, subject = 'Geography' } = req.body;
      if (!candidatesData || !Array.isArray(candidatesData)) {
        return res.status(400).json({ error: "Candidate data array is required" });
      }

      const ai = getGenAI();

      const prompt = `You are an Expert IBDP ${subject} Moderator. I am giving you the qualitative summaries (WWWs and EBIs) and Executive Summaries for an entire class of ${subject} Internal Assessments. 
Your task is to synthesize this class-level data to identify trends and provide robust, highly specific pedagogical feedback.

You must embed anonymized examples synthesized directly from the provided IAs. ${subject === 'Geography' ? 'Where appropriate, specifically guide students on how to link their results and analysis back to geographical theory (e.g., using terms like inputs, outputs, stores, and flows for drainage basin theory, or equivalent terms for other geographical themes present in the data).' : 'Where appropriate, specifically guide students on how to link their results and analysis back to environmental systems and societies theory (e.g., using terms like EVS, sustainability pillars, systems models, and environmental justice).'}

Feedback Format:
- Professional, academic tone.
- **Executive Summary**: A concise, high-level overview of the cohort's performance (1-2 sentences).
- **Class Strengths (WWW)**: Identify the 3 most common general strengths. Write exactly 3 bullet points. Include embedded anonymous examples of good practice from the provided data.
- **Class Weaknesses (EBI)**: Identify the 3 most common areas for improvement. Write exactly 3 bullet points. Provide robust and specific examples of *where* and *how* students could improve.
- **Deep Dives**: For the lowest performing criteria (provided in lowestCriteriaMap), write a specific "Teacher's Tip" (2-3 sentences each) directly addressing common pitfalls in those criteria based on the cohort data and IB ${subject} spec.

CLASS DATA:
${JSON.stringify(candidatesData, null, 2)}

LOWEST PERFORMING CRITERIA:
${JSON.stringify(lowestCriteriaMap, null, 2)}
`;

      const response = await generateContentWithRetry(ai, "gemini-3.1-pro-preview", prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING, description: "A high-level overview of class performance." },
            classWWW: { 
              type: Type.ARRAY, 
              description: "3 most common strengths, including anonymized specific examples.",
              items: { type: Type.STRING } 
            },
            classEBI: { 
              type: Type.ARRAY, 
              description: "3 most common areas for improvement, including specific links to geographical theory (e.g. drainage basin inputs/outputs/stores/flows or relevant concepts).",
              items: { type: Type.STRING } 
            },
            deepDives: {
              type: Type.OBJECT,
              description: "Map of Criterion ID to a specific Teacher's Tip.",
              additionalProperties: { type: Type.STRING }
            }
          },
          required: ["executiveSummary", "classWWW", "classEBI", "deepDives"]
        }
      });

      const textResponse = response.text;
      if (!textResponse) {
        throw new Error("Empty response from AI");
      }
      const result = JSON.parse(textResponse);
      result.subject = subject;
      res.json(result);
    } catch (error: any) {
      console.error("Cohort analysis error:", error);
      res.status(500).json({ error: "Failed to analyze cohort: " + error.message });
    }
  });

  // Proxy for images to circumvent CORS in pptxgenjs
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) {
        return res.status(400).json({ error: "Missing url parameter" });
      }
      
      const imageRes = await fetch(imageUrl);
      if (!imageRes.ok) {
        return res.status(imageRes.status).json({ error: "Failed to fetch image" });
      }
      
      const buffer = await imageRes.arrayBuffer();
      const contentType = imageRes.headers.get("content-type") || "image/png";
      
      const base64 = Buffer.from(buffer).toString('base64');
      const dataUri = `${contentType};base64,${base64}`;
      
      res.json({ dataUri });
    } catch (error: any) {
      console.error("Proxy image error:", error);
      res.status(500).json({ error: "Failed to proxy image: " + error.message });
    }
  });

  // IA Moderation Endpoint (Multipart) - Fallback
  app.post("/api/analyze-ia", upload.single("iaFile"), async (req, res) => {
    try {
      const subject = (req.body.subject as string) || 'Geography';
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const ai = getGenAI();

      // Basic text extraction from buffer
      const data = await (pdf as any)(req.file.buffer);
      const text = data.text;

      let prompt = "";
      if (subject === 'ESS') {
        prompt = `You are an Expert IBDP ESS Moderator. Evaluate the following Internal Assessment (IA) text against the 30-mark scale.
      
Strict Marking Framework (ESS):
- Criterion A: Research question & inquiry (Max 4)
- Criterion B: Strategy (Max 4)
- Criterion C: Method (Max 4)
- Criterion D: Treatment of Data (Max 6)
- Criterion E: Analysis & Conclusion (Max 6)
- Criterion F: Evaluation (Max 6)

Word Count Protocol (ESS):
- Strict 3,000-word limit.
- Include: Narrative flow, systems explanations, and qualitative analysis.
- Exclude: Charts, diagrams, data tables, and bibliography.

Feedback Format:
- Professional, direct, and concise.
- One high-impact sentence per criterion.
- Reference Subject Reports for common examiner pitfalls where appropriate.
${text.substring(0, 30000)}
`;
      } else {
        prompt = `You are an Expert IBDP Geography Moderator. Evaluate the following Internal Assessment (IA) text against the 25-mark scale.
      
Strict Marking Framework (Geography):
- Criterion A: Fieldwork Question & Context (Max 3)
- Criterion B: Methods of Investigation (Max 3)
- Criterion C: Quality & Treatment of Data (Max 6)
- Criterion D: Written Analysis (Max 8)
- Criterion E: Conclusion (Max 2)
- Criterion F: Evaluation (Max 3) - CRITICAL: If the candidate does not suggest adaptions to the investigation AND explain how that would make the investigation more thorough and credible, they can NEVER get 3 points.

Word Count Protocol (Geography):
- Include: FQ, analysis, conclusion, evaluation, and annotations >10 words.
- Exclude: Title page, contents, map legends, labels <10 words, and statistical tables.

Feedback Format:
- Professional, direct, and concise.
- One high-impact sentence per criterion.
- Reference Subject Reports for common examiner pitfalls where appropriate.
${text.substring(0, 30000)}
`;
      }

      const response = await generateContentWithRetry(ai, "gemini-3.1-pro-preview", prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Criterion letter (A-F)" },
                  name: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  maxScore: { type: Type.INTEGER },
                  feedback: { type: Type.STRING },
                  pitfall: { type: Type.STRING, description: "Common examiner pitfall related to this score" }
                },
                required: ["id", "name", "score", "maxScore", "feedback"]
              }
            },
            totalScore: { type: Type.INTEGER },
            wordCount: {
              type: Type.OBJECT,
              properties: {
                included: { type: Type.INTEGER },
                excluded: { type: Type.INTEGER },
                total: { type: Type.INTEGER },
                status: { type: Type.STRING, description: "Compliance status" }
              },
              required: ["included", "excluded", "total", "status"]
            },
            overallSummary: { type: Type.STRING }
          },
          required: ["criteria", "totalScore", "wordCount", "overallSummary"]
        }
      });

      const textResponse = response.text;
      if (!textResponse) {
        throw new Error("Empty response from AI");
      }
      const result = JSON.parse(textResponse);
      result.subject = subject;
      res.json(result);
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze IA: " + error.message });
    }
  });

  // ==========================================
  // ESSAY GRADING & MODERATION ENDPOINTS
  // ==========================================

  // OCR Endpoint
  app.post("/api/ocr", async (req, res) => {
    try {
      const { images } = req.body;

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Missing images for OCR." });
      }

      const ai = getGenAI();
      
      const parts: any[] = images.map(imgBase64 => {
        const indexOfBase64 = imgBase64.indexOf(',') + 1;
        const base64Data = imgBase64.substring(indexOfBase64);
        const mimeType = imgBase64.match(/data:([^;]+);/)?.[1] || "image/png";
        
        return {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        };
      });

      parts.push({ text: "Please transcribe the handwritten text in these images accurately." });

      const result = await generateContentWithRetry(ai, "gemini-3.5-flash", { parts }, {
        systemInstruction: OCR_SYSTEM_INSTRUCTION,
      });
      const transcription = result.text || "";

      res.json({ transcription });
    } catch (error: any) {
      console.error("OCR error details:", error);
      res.status(500).json({ error: error.message || "Internal OCR failure" });
    }
  });

  // Essay Grading Endpoint
  app.post("/api/assess", async (req, res) => {
    try {
      const { paper, marks, question, essay } = req.body;

      if (!paper || !marks || !question || !essay) {
        return res.status(400).json({ error: "Missing required fields: paper, marks, question, essay." });
      }

      const ai = getGenAI();

      const prompt = `
Paper: ${paper}
Marks available: ${marks}
Question: ${question}
Essay Text:
${essay}
      `;

      const result = await generateContentWithRetry(ai, "gemini-3.5-flash", prompt, {
        systemInstruction: ESSAY_SYSTEM_INSTRUCTION,
      });
      const feedback = result.text || "No feedback generated.";
      res.json({ feedback });
    } catch (error: any) {
      console.error("Assessment error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // ==========================================
  // INFOGRAPHIC GENERATOR ENDPOINTS
  // ==========================================

  app.post("/api/generate", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
      }

      const ai = getGenAI();

      const prompt = `You are an expert IB Diploma Programme (IBDP) Geography Examiner. Your task is to generate realistic, exam-quality IBDP Geography Paper 2 data-response questions based on the uploaded infographic, alongside a separate, independent markscheme.

Constraints:
1. Core Objectives:
   - Analyze the uploaded infographic for geographical data, trends, anomalies, and spatial patterns.
   - Draft questions mimicking the style, tone, and difficulty of the IBDP Geography Paper 2.
   - Create an official-style markscheme reflecting strict assessment criteria.
2. Structure of Questions:
   You MUST generate exactly 3 main questions based on the provided examples. Totaling exactly 10 marks:
   - Part (a) [2 Marks]: Data extraction or description. Either two 1-mark sub-questions (e.g., State/Identify (a)(i) and (a)(ii)) OR one 2-mark question (e.g., Describe).
   - Part (b) [2 Marks]: Reasoning/Application. A 2-mark question (e.g., Suggest/Outline one reason/advantage/disadvantage).
   - Part (c) [6 Marks]: Evaluation. A 6-mark question using exactly the phrasing "To what extent does the evidence in the infographic support the view that...".
3. Markscheme Specifics:
   - Provide a detailed point-by-point breakdown exactly like official IB markschemes.
   - For parts (a) and (b), demonstrate exactly how marks are awarded (e.g., "Award [1] for valid suggestion and [1] for further development").
   - For the 6-mark Part (c) question, you MUST include a "Supportive" and "Counter/Non-supportive" section, and state: "Award [1] for each valid point supported by evidence taken from the infographic, up to a maximum of [5]. Award a maximum of [4] if only one side of the argument is given. Award the final [1] for an overall appraisal, which weighs up the infographic as a whole."
4. Output Architecture (Strict JSON):
   - You must output VALID JSON matching this exact structure:
   {
     "questions": [
       { "marks": 2, "text": "Part (a) text..." },
       { "marks": 2, "text": "Part (b) text..." },
       { "marks": 6, "text": "Part (c) text..." }
     ],
     "markscheme": {
       "criteria": "Summary of the assessment criteria (e.g. details on how the 6-marker evaluates knowledge).",
       "paths": ["Specific marking points. E.g., 'Q(a) (i): Valid point [1]', 'Q(a) (ii): Valid point [1]'", "'Q(b): Award [1] for... and [1] for...'", "'Q(c) For: ...'", "'Q(c) Against: ...'"]
     },
     "summary": "A brief 1-2 sentence overview of the infographic's topic"
   }
   - The 'questions' array MUST have exactly 3 objects. Their 'marks' properties MUST evaluate to 2, 2, and 6, respectively. Do not include the '[X Marks]' tag in 'text', it will be rendered by the UI.`;

      const response = await generateContentWithRetry(
        ai,
        "gemini-3.5-flash",
        [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
              {
                inlineData: {
                  mimeType: req.file.mimetype,
                  data: req.file.buffer.toString("base64"),
                },
              },
            ],
          },
        ],
        {
          responseMimeType: "application/json",
          temperature: 0.2, // low temp for structured and objective output
        }
      );

      let generatedText = response.text;
      if (!generatedText) {
          throw new Error("No text generated from the model.");
      }
      
      // Strip markdown formatting if present
      generatedText = generatedText.replace(/^```json\n?|```$/g, "").trim();
      
      const parsedData = JSON.parse(generatedText);
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: error.message || "An error occurred during generation." });
    }
  });

  // ==========================================
  // DP NEWS ROOM ENDPOINTS
  // ==========================================

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      engine: "DP News Room v11.2",
      environment: process.env.NODE_ENV
    });
  });

  app.get("/api/config", (req, res) => {
    res.json({
      apiKeyDetected: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEOG_APP_KEY_V1)
    });
  });

  const newsroomProcessHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { input } = req.body;
      if (!input) {
        return res.status(400).json({ error: "Input is required" });
      }

      let articleText = input;

      // URL Extraction using Readability and jsdom
      if (input.startsWith("http://") || input.startsWith("https://")) {
        try {
          const response = await fetch(input);
          if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
          }
          const html = await response.text();
          const dom = new JSDOM(html, { url: input });
          const reader = new Readability(dom.window.document);
          const article = reader.parse();
          if (article && article.textContent) {
            articleText = article.textContent;
          } else {
            throw new Error("Could not parse article from URL");
          }
        } catch (fetchError: any) {
          console.error("URL Extraction Error:", fetchError);
          return res.status(400).json({ error: `URL Extraction Error: ${fetchError.message}` });
        }
      }

      return res.json({ text: articleText });
    } catch (error: any) {
      console.error("Newsroom Process Server Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during server-side processing" });
    }
  };

  app.post("/api/extract", newsroomProcessHandler);
  app.post("/api/process", newsroomProcessHandler);

  app.post("/api/newsroom/generate", async (req, res) => {
    try {
      const { prompt, model = "gemini-2.5-flash" } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getGenAI();
      const response = await generateContentWithRetry(ai, model, prompt);
      
      const responseText = response.text;
      if (!responseText) {
        throw new Error('No assessment material was generated. The content might have been filtered.');
      }
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Newsroom AI Generation Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during server-side processing" });
    }
  });

  // ==========================================
  // CORRESPONDENT (FRESH OFF THE PRESS) ENDPOINTS
  // ==========================================

  const userTracker = (req: any, res: any, next: any) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    req.userHash = crypto.createHash('md5').update(ip as string).digest('hex');
    next();
  };

  const RSS_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  const rssParserInstance = new Parser({
    headers: {
      'User-Agent': RSS_USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 15000
  });

  const correspondentCache: Record<string, { timestamp: number; data: any }> = {};
  const CACHE_DURATION = 1 * 60 * 1000; // 1 minute

  const OUTLETS = [
    {
      id: 'guardian',
      name: 'The Guardian',
      color: '#052962',
      logo: 'https://www.google.com/s2/favicons?domain=theguardian.com&sz=128',
      feeds: [
        'https://www.theguardian.com/world/rss',
        'https://www.theguardian.com/environment/rss',
        'https://www.theguardian.com/business/rss',
        'https://www.theguardian.com/inequality/rss',
        'https://www.theguardian.com/global-development/rss'
      ]
    },
    {
      id: 'economist',
      name: 'The Economist',
      color: '#e3120b',
      logo: 'https://www.google.com/s2/favicons?domain=economist.com&sz=128',
      feeds: [
        'https://www.economist.com/climate-change/rss.xml',
        'https://www.economist.com/international/rss.xml',
        'https://www.economist.com/finance-and-economics/rss.xml'
      ],
      filter: (item: any) => /\/\d{4}\//.test(item.link || '')
    },
    {
      id: 'ft',
      name: 'Financial Times',
      color: '#fff1e5',
      textColor: '#000000',
      logo: 'https://www.google.com/s2/favicons?domain=ft.com&sz=128',
      feeds: [
        'https://www.ft.com/world?format=rss',
        'https://www.ft.com/global-economy?format=rss'
      ]
    },
    {
      id: 'ap',
      name: 'Associated Press',
      color: '#ff322e',
      logo: 'https://www.google.com/s2/favicons?domain=apnews.com&sz=128',
      feeds: [
        'https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en',
        'https://news.google.com/rss/search?q=site:apnews.com+world&hl=en-US&gl=US&ceid=US:en',
        'https://news.google.com/rss/search?q=site:apnews.com+business&hl=en-US&gl=US&ceid=US:en',
        'https://news.google.com/rss/search?q=site:apnews.com+climate&hl=en-US&gl=US&ceid=US:en'
      ]
    },
    {
      id: 'aljazeera',
      name: 'Al Jazeera',
      color: '#fa9600',
      logo: 'https://www.google.com/s2/favicons?domain=aljazeera.com&sz=128',
      feeds: [
        'https://www.aljazeera.com/xml/rss/all.xml'
      ]
    },
    {
      id: 'scmp',
      name: 'SOUTH CHINA MORNING POST',
      color: '#f9dd16',
      textColor: '#000000',
      logo: 'https://www.google.com/s2/favicons?domain=scmp.com&sz=128',
      feeds: [
        'https://news.google.com/rss/search?q=when:24h+source:South_China_Morning_Post+China&hl=en-US&gl=US&ceid=US:en',
        'https://news.google.com/rss/search?q=when:24h+source:South_China_Morning_Post+Asia&hl=en-US&gl=US&ceid=US:en',
        'https://news.google.com/rss/search?q=when:24h+source:South_China_Morning_Post+Economy&hl=en-US&gl=US&ceid=US:en'
      ]
    },
    {
      id: 'nyt',
      name: 'NY Times',
      color: '#000000',
      logo: 'https://www.google.com/s2/favicons?domain=nytimes.com&sz=128',
      feeds: [
        'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/Environment.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml'
      ]
    },
    {
      id: 'mongabay',
      name: 'Mongabay',
      color: '#2e7d32',
      logo: 'https://www.google.com/s2/favicons?domain=mongabay.com&sz=128',
      feeds: ['https://news.mongabay.com/feed/']
    },
    {
      id: 'bbc',
      name: 'BBC News',
      color: '#bb1919',
      logo: 'https://www.google.com/s2/favicons?domain=bbc.com&sz=128',
      feeds: [
        'https://feeds.bbci.co.uk/news/world/rss.xml',
        'https://feeds.bbci.co.uk/news/business/rss.xml',
        'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'
      ]
    },
    {
      id: 'reuters',
      name: 'Reuters',
      color: '#ff8000',
      logo: 'https://www.google.com/s2/favicons?domain=reuters.com&sz=128',
      feeds: [
        'https://news.google.com/rss/search?q=when:24h+source:Reuters&hl=en-US&gl=US&ceid=US:en'
      ]
    },
    {
      id: 'koreatimes',
      name: 'Korea Times',
      color: '#004d40',
      logo: 'https://www.google.com/s2/favicons?domain=koreatimes.co.kr&sz=128',
      feeds: [
        'https://news.google.com/rss/search?q=source:The_Korea_Times&hl=en-US&gl=US&ceid=US:en',
        'https://news.google.com/rss/search?q=source:The_Korea_Times+world&hl=en-US&gl=US&ceid=US:en',
        'https://news.google.com/rss/search?q=source:The_Korea_Times+economy&hl=en-US&gl=US&ceid=US:en'
      ]
    },
    {
      id: 'euronews',
      name: 'Euronews',
      color: '#003399',
      logo: 'https://www.google.com/s2/favicons?domain=euronews.com&sz=128',
      feeds: [
        'https://www.euronews.com/rss?level=vertical&name=earth',
        'https://www.euronews.com/rss?level=vertical&name=travel',
        'https://www.euronews.com/rss?level=vertical&name=business',
        'https://www.euronews.com/rss?name=news'
      ]
    }
  ];

  async function tagHeadlines(headlines: string[]): Promise<Record<string, string[]>> {
    if (!headlines.length) return {};
    
    // Gracefully bypass if Gemini API key is not configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEOG_APP_KEY_V1;
    if (!apiKey) {
      console.warn('[Newsroom API] GEMINI_API_KEY is not configured. Skipping news tagging.');
      return {};
    }

    const VALID_TAGS = new Set(['SL1', 'SL2', 'SL3', 'HL4', 'HL5', 'HL6', 'OPA', 'OPD', 'OPE']);
    const normalizeTags = (tags: string[]): string[] => {
      if (!Array.isArray(tags)) return [];
      const normalized: string[] = [];
      tags.forEach(t => {
        if (typeof t !== 'string') return;
        const cleanTag = t.trim().toUpperCase();
        if (VALID_TAGS.has(cleanTag)) {
          normalized.push(cleanTag);
          return;
        }
        const match = cleanTag.match(/^(SL1|SL2|SL3|HL4|HL5|HL6|OPA|OPD|OPE)\b/);
        if (match) {
          normalized.push(match[1]);
        }
      });
      return Array.from(new Set(normalized));
    };

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const ai = getGenAI();
        const prompt = `Analyze these news headlines and assign relevant International Baccalaureate (IB) Geography unit tags.
        IMPORTANT: You MUST return the EXACT 'headline' string as provided in the input list for the mapping to work.
        
        Headlines to analyze:
        ${JSON.stringify(headlines)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: `You are a strict IB Geography tagging agent for the "DP Anchorman" application. 
            Analyze the headlines and assign relevant unit tags ONLY from this list:
            - SL1: Changing Populations
            - SL2: Global Climate, Vulnerability & Resilience
            - SL3: Global Resource Consumption & Security
            - HL4: Power, Places & Networks
            - HL5: Human Development & Diversity
            - HL6: Global Risk & Resilience
            - OPA: Freshwater
            - OPD: Geophysical Hazards
            - OPE: Leisure, Tourism & Sport
            
            Rules:
            - Return a JSON array of objects: { "headline": "EXACT_ORIGINAL_STRING", "tags": ["TAG1", "TAG2"] }.
            - Tags MUST be uppercase codes from the list above (e.g., "SL2").
            - Max 3 tags per headline.
            - If a headline doesn't match any IB Geography context, return an empty tags array.
            - DO NOT change or normalize the headline text in your response.`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['headline', 'tags']
              }
            }
          }
        });

        const results = JSON.parse(response.text?.trim() || '[]');
        const tagsMapResult: Record<string, string[]> = {};
        if (Array.isArray(results)) {
          results.forEach((item: any) => {
            if (item.headline && Array.isArray(item.tags)) {
              tagsMapResult[item.headline] = normalizeTags(item.tags);
            }
          });
        }
        return tagsMapResult;
      } catch (error: any) {
        attempts++;
        const isUnavailable = error?.status === 'UNAVAILABLE' || 
                             error?.code === 503 || 
                             error?.message?.includes('503') ||
                             error?.message?.includes('UNAVAILABLE') ||
                             error?.response?.status === 503;

        if (isUnavailable) {
          console.warn(`Gemini 503 (High Demand). Attempt ${attempts}/${maxAttempts}.`);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 3000 * attempts));
            continue;
          }
        }
        console.error('Error in AI tagging:', error.message || error);
        return {};
      }
    }
    return {};
  }

  async function generateDailyPolls(headlines: any[]): Promise<any[]> {
    if (!headlines.length) return [];

    // Gracefully bypass if Gemini API key is not configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEOG_APP_KEY_V1;
    if (!apiKey) {
      console.warn('[Newsroom API] GEMINI_API_KEY is not configured. Skipping daily polls generation.');
      return [];
    }

    try {
      const ai = getGenAI();
      const today = new Date().toISOString().split('T')[0];
      const prompt = `Based on these recent news items, generate exactly 3 IB Geography themed daily polls for today (${today}).
      
      News Items:
      ${JSON.stringify(headlines.slice(0, 20))}
      
      Guidelines:
      - Questions must be directly related to one of the provided news articles.
      - Structure questions around the IB Geography core concepts:
        * 4P's: Place, Process, Power, Possibility
        * 2S's: Scale, Spatial Interaction
      - Example Question Styles: 
        * "The recent [Event] is likely to [Outcome]... A: Yes, B: No, C: Maybe"
        * "How might [Region] look to reduce [Issue] among the public? A: [Option], B: [Option], C: [Option]"
      - Make them engaging and opinion-based where appropriate to stimulate debate.
      - Provide the exact 'source_url' from the news items for each question.
      - IMPORTANT: You MUST generate exactly one poll for each of these three categories:
        1. Core: Choose one unit from (SL1, SL2, SL3)
        2. Extension: Choose one unit from (HL4, HL5, HL6)
        3. Options: Choose one unit from (OPA, OPD, OPE)
      - The 'dp_tag' for each poll must be the exact unit string chosen (e.g. SL2, HL5, OPD).
      - Provide 3 or 4 distinct options (A, B, C, D). If only 3 are needed, use A, B, C.
      
      Return a JSON array of 3 poll objects.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `You are a curriculum expert for IB Geography. Generate 3 engaging, syllabus-aligned daily polls based on current events.
          Output format: JSON array of objects:
          {
            "question": "string",
            "source_url": "string",
            "dp_tag": "string (e.g. SL2)",
            "option_a": "string",
            "option_b": "string",
            "option_c": "string",
            "option_d": "string (optional, leave empty if not used)"
          }`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                source_url: { type: Type.STRING },
                dp_tag: { type: Type.STRING },
                option_a: { type: Type.STRING },
                option_b: { type: Type.STRING },
                option_c: { type: Type.STRING },
                option_d: { type: Type.STRING }
              },
              required: ['question', 'source_url', 'dp_tag', 'option_a', 'option_b', 'option_c']
            }
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '[]');
      return parsed.map((p: any) => ({ ...p, date: today }));
    } catch (error) {
      console.error('Error generating polls:', error);
      return [];
    }
  }

  app.get('/api/news', async (req, res) => {
    try {
      const rawOutletsData = await Promise.all(OUTLETS.map(async (outlet) => {
        const cached = correspondentCache[outlet.id];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return { id: outlet.id, data: cached.data, fromCache: true };
        }

        let allItems: any[] = [];
        const feedPromises = outlet.feeds.map(async (feedUrl) => {
          try {
            let response = await fetch(feedUrl, {
              headers: {
                'User-Agent': RSS_USER_AGENT,
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
              }
            });

            if (response.status === 403 && feedUrl.includes('economist.com')) {
              console.warn(`Economist 403 for ${feedUrl}, trying Google News fallback...`);
              const searchTerm = feedUrl.split('/').slice(-2, -1)[0].replace(/-/g, '+');
              const fallbackUrl = `https://news.google.com/rss/search?q=source:The_Economist+${searchTerm}&hl=en-US&gl=US&ceid=US:en`;
              response = await fetch(fallbackUrl, {
                headers: { 'User-Agent': RSS_USER_AGENT }
              });
            }

            if (!response.ok) {
              throw new Error(`Status code ${response.status}`);
            }

            const text = await response.text();
            const cleanText = text.trim();
            const feed = await rssParserInstance.parseString(cleanText);
            return feed.items;
          } catch (e: any) {
            console.error(`Error fetching feed ${feedUrl}:`, e.message || e);
            return [];
          }
        });

        const feedsResults = await Promise.all(feedPromises);
        feedsResults.forEach(items => {
          allItems = allItems.concat(items);
        });

        const uniqueMap = new Map();
        allItems.forEach(item => {
          if (item.title && !uniqueMap.has(item.title)) {
            uniqueMap.set(item.title, item);
          }
        });
        const uniqueItems = Array.from(uniqueMap.values());
        
        let filteredItems = outlet.filter ? uniqueItems.filter(outlet.filter) : uniqueItems;
        const limitedItems = filteredItems.slice(0, 20);

        return {
          id: outlet.id,
          name: outlet.name,
          color: outlet.color,
          textColor: outlet.textColor || '#ffffff',
          logo: outlet.logo,
          items: limitedItems,
          fromCache: false
        };
      }));

      const uncachedOutlets = rawOutletsData.filter(o => !o.fromCache);
      const headlineToOriginal = new Map<string, string[]>();
      
      uncachedOutlets.forEach((outlet: any) => {
        outlet.items.forEach((item: any) => {
          const strippedTitle = item.title
            .replace(/\s+-\s+Associated Press$/i, '')
            .replace(/\s+-\s+Reuters$/i, '')
            .replace(/\s+-\s+The Guardian$/i, '')
            .replace(/\s+-\s+BBC News$/i, '')
            .replace(/\s+-\s+Al Jazeera$/i, '')
            .replace(/\s+\|\s+The Economist$/i, '')
            .replace(/\s+-\s+South China Morning Post$/i, '')
            .replace(/\s+-\s+SCMP$/i, '')
            .replace(/\s+-\s+SOUTH CHINA MORNING POST$/i, '')
            .replace(/\s+-\s+euronews$/i, '')
            .replace(/\s+\|\s+euronews$/i, '')
            .replace(/\s+-\s+Euronews$/i, '')
            .replace(/\s+\|\s+Euronews$/i, '')
            .trim();
            
          if (!headlineToOriginal.has(strippedTitle)) {
            headlineToOriginal.set(strippedTitle, []);
          }
          headlineToOriginal.get(strippedTitle)!.push(item.title);
        });
      });

      const uniqueHeadlinesToTag = Array.from(headlineToOriginal.keys());
      const tagsMapStripped = uniqueHeadlinesToTag.length > 0 
        ? await tagHeadlines(uniqueHeadlinesToTag) 
        : {};

      const tagsMap: Record<string, string[]> = {};
      const normalizedOriginalsMap = new Map<string, string[]>();
      
      headlineToOriginal.forEach((originals, stripped) => {
        normalizedOriginalsMap.set(stripped.toLowerCase().trim(), originals);
      });

      Object.entries(tagsMapStripped).forEach(([stripped, tags]) => {
        const normalizedKey = stripped.toLowerCase().trim();
        const originals = normalizedOriginalsMap.get(normalizedKey) || [];
        originals.forEach(original => {
          tagsMap[original] = tags;
        });
      });

      const finalResults: Record<string, any> = {};

      rawOutletsData.forEach((outlet: any) => {
        if (outlet.fromCache) {
          finalResults[outlet.id] = outlet.data;
        } else {
          const itemsWithTags = outlet.items.map((item: any) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            tags: tagsMap[item.title] || []
          }));

          const outletData = {
            name: outlet.name,
            color: outlet.color,
            textColor: outlet.textColor,
            logo: outlet.logo,
            items: itemsWithTags
          };

          correspondentCache[outlet.id] = { timestamp: Date.now(), data: outletData };
          finalResults[outlet.id] = outletData;
        }
      });

      res.json(finalResults);
    } catch (error) {
      console.error('General error fetching news:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });

  app.get('/api/polls/today', userTracker, async (req: any, res: any) => {
    try {
      console.log('[API] GET /api/polls/today requested');
      
      if (!hasPollsForToday()) {
        console.log('[API] No polls for today. Attempting to generate from news...');
        let headlines: any[] = [];
        const firstOutlet = OUTLETS[0];
        const cached = correspondentCache[firstOutlet.id];
        
        if (cached) {
          headlines = cached.data.items.map((i: any) => ({ title: i.title, link: i.link }));
        }

        if (headlines.length > 0) {
          const newPolls = await generateDailyPolls(headlines);
          if (newPolls.length > 0) {
            savePolls(newPolls);
          }
        }
      }

      const polls = getTodayPolls(req.userHash);
      console.log(`[API] Returning ${polls.length} polls`);
      res.json(polls);
    } catch (error: any) {
      console.error('[API] Error in GET /api/polls/today:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/polls/vote', userTracker, (req: any, res: any) => {
    const { pollId, option } = req.body;
    if (!pollId || !option) {
      return res.status(400).json({ error: 'Missing pollId or option' });
    }

    try {
      const results = castVote(pollId, option, req.userHash);
      res.json({ success: true, results });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ==========================================
  // DP EXAM ENGINE BATCH INGESTION ENDPOINTS
  // ==========================================

  function getPdfFilesRecursively(dir: string, fileList: string[] = []): string[] {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.startsWith(".") || file === "node_modules") continue;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          getPdfFilesRecursively(filePath, fileList);
        } else if (file.toLowerCase().endsWith(".pdf")) {
          fileList.push(filePath);
        }
      }
    } catch (err) {
      console.error("Error walking directory:", dir, err);
    }
    return fileList;
  }

  interface ServerIngestedPaper {
    id: string;
    name: string;
    type: "1" | "2" | "3";
    text: string;
    timestamp: string;
    filePath?: string;
  }

  const getPapersFilePath = (teacherCode: string) => {
    const dataDir = path.join(process.cwd(), "DP-Exam-Engine", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, `ingested_papers_${teacherCode || "SKN"}.json`);
  };

  const readIngestedPapers = (teacherCode: string): ServerIngestedPaper[] => {
    const filePath = getPapersFilePath(teacherCode);
    if (!fs.existsSync(filePath)) return [];
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading ingested papers file:", err);
      return [];
    }
  };

  const writeIngestedPapers = (teacherCode: string, papers: ServerIngestedPaper[]) => {
    const filePath = getPapersFilePath(teacherCode);
    try {
      fs.writeFileSync(filePath, JSON.stringify(papers, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing ingested papers file:", err);
    }
  };

  app.get("/api/exam-engine/papers", (req, res) => {
    try {
      const teacherCode = (req.query.teacherCode as string) || "SKN";
      const papers = readIngestedPapers(teacherCode);
      res.json(papers);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to load papers" });
    }
  });

  app.post("/api/exam-engine/upload", upload.single("iaFile"), async (req, res) => {
    try {
      const teacherCode = req.body.teacherCode || "SKN";
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const data = await pdf(req.file.buffer);
      const fullText = data.text;
      
      let inferredType: "1" | "2" | "3" = "3";
      const upperText = fullText.toUpperCase();
      if (upperText.includes("PAPER 1") || upperText.includes("OPTIONS")) {
        inferredType = "1";
      } else if (upperText.includes("PAPER 2") || upperText.includes("CORE")) {
        inferredType = "2";
      } else if (upperText.includes("PAPER 3") || upperText.includes("EXTENSION") || upperText.includes("GLOBAL INTERACTIONS")) {
        inferredType = "3";
      }

      const newPaper: ServerIngestedPaper = {
        id: Math.random().toString(36).substring(7),
        name: req.file.originalname,
        type: inferredType,
        text: fullText,
        timestamp: new Date().toLocaleDateString()
      };

      const papers = readIngestedPapers(teacherCode);
      papers.unshift(newPaper);
      writeIngestedPapers(teacherCode, papers);

      res.json(newPaper);
    } catch (err: any) {
      console.error("Single PDF upload parsing failure:", err);
      res.status(500).json({ error: err.message || "Failed to parse and save paper" });
    }
  });

  app.post("/api/exam-engine/ingest-folder", async (req, res) => {
    try {
      const { folderPath, teacherCode = "SKN" } = req.body;
      if (!folderPath) {
        return res.status(400).json({ error: "Folder path is required" });
      }

      if (!fs.existsSync(folderPath)) {
        return res.status(400).json({ error: `Directory does not exist: ${folderPath}` });
      }

      const stat = fs.statSync(folderPath);
      if (!stat.isDirectory()) {
        return res.status(400).json({ error: `Path is not a directory: ${folderPath}` });
      }

      const pdfFiles = getPdfFilesRecursively(folderPath);
      if (pdfFiles.length === 0) {
        return res.json({
          success: true,
          message: "No PDF files found in the specified directory.",
          totalFound: 0,
          successCount: 0,
          failedCount: 0,
          details: []
        });
      }

      const papers = readIngestedPapers(teacherCode);
      const existingPaths = new Set(papers.map(p => p.filePath).filter(Boolean));
      const existingNames = new Set(papers.map(p => p.name));

      let successCount = 0;
      let failedCount = 0;
      const details: Array<{ file: string; status: "success" | "failed" | "skipped"; reason?: string }> = [];

      for (const filePath of pdfFiles) {
        const fileName = path.basename(filePath);
        
        if (existingPaths.has(filePath) || existingNames.has(fileName)) {
          details.push({ file: fileName, status: "skipped", reason: "Already ingested" });
          continue;
        }

        try {
          const fileBuffer = fs.readFileSync(filePath);
          const data = await pdf(fileBuffer);
          const fullText = data.text;

          let inferredType: "1" | "2" | "3" = "3";
          const upperText = fullText.toUpperCase();
          if (upperText.includes("PAPER 1") || upperText.includes("OPTIONS")) {
            inferredType = "1";
          } else if (upperText.includes("PAPER 2") || upperText.includes("CORE")) {
            inferredType = "2";
          } else if (upperText.includes("PAPER 3") || upperText.includes("EXTENSION") || upperText.includes("GLOBAL INTERACTIONS")) {
            inferredType = "3";
          }

          const newPaper: ServerIngestedPaper = {
            id: Math.random().toString(36).substring(7),
            name: fileName,
            type: inferredType,
            text: fullText,
            timestamp: new Date().toLocaleDateString(),
            filePath: filePath
          };

          papers.unshift(newPaper);
          successCount++;
          details.push({ file: fileName, status: "success" });
        } catch (err: any) {
          console.error(`Failed to ingest file ${fileName}:`, err);
          failedCount++;
          details.push({ file: fileName, status: "failed", reason: err.message || "Unknown PDF parsing error" });
        }
      }

      if (successCount > 0) {
        writeIngestedPapers(teacherCode, papers);
      }

      res.json({
        success: true,
        message: `Successfully processed directory. Found ${pdfFiles.length} PDFs.`,
        totalFound: pdfFiles.length,
        successCount,
        failedCount,
        details
      });
    } catch (err: any) {
      console.error("Folder ingestion failure:", err);
      res.status(500).json({ error: err.message || "Failed to process folder" });
    }
  });

  app.delete("/api/exam-engine/papers/:id", (req, res) => {
    try {
      const { id } = req.params;
      const teacherCode = (req.query.teacherCode as string) || "SKN";
      
      let papers = readIngestedPapers(teacherCode);
      const initialLength = papers.length;
      papers = papers.filter(p => p.id !== id);
      
      if (papers.length !== initialLength) {
        writeIngestedPapers(teacherCode, papers);
        res.json({ success: true, message: "Paper deleted successfully" });
      } else {
        res.status(404).json({ error: "Paper not found" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete paper" });
    }
  });

  app.post("/api/exam-engine/papers/clear-all", (req, res) => {
    try {
      const teacherCode = req.body.teacherCode || "SKN";
      writeIngestedPapers(teacherCode, []);
      res.json({ success: true, message: "Exam Engine library cleared" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to clear papers" });
    }
  });

  // ==========================================
  // VITE & STATIC FILES SERVING MIDDLEWARE
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Unified Server running on port ${PORT}`);
  });
}

startServer();
