import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import Database from "better-sqlite3";
import mammoth from "mammoth";

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
import { getTodayPolls, castVote, hasPollsForToday, savePolls, getPollDateKST } from "./IG Correspondent/src/server/db.ts";
import { getGlobeTubeDB } from "./globetubeDb";

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
        err?.error?.status === 'UNAVAILABLE' || err?.error?.code === 503 || err?.error?.code === 429 ||
        err?.message?.includes('500') || err?.message?.includes('503') || err?.message?.includes('429') ||
        err?.error?.message?.includes('500') || err?.error?.message?.includes('503') || err?.error?.message?.includes('429') ||
        err?.message?.includes('INTERNAL') || err?.message?.includes('UNAVAILABLE') ||
        err?.error?.status?.includes('UNAVAILABLE') ||
        err?.message?.includes('Resource has been exhausted') || err?.message?.includes('high demand') ||
        err?.message?.includes('temporary') || err?.error?.message?.includes('high demand') ||
        err?.error?.message?.includes('temporary');

      if (isRetryable && retries > 0) {
        const errDetails = err?.message || err?.status || err?.error?.message || err?.error?.status || 'Unknown API Error';
        console.warn(`[Gemini API] Error for model ${modelName} (${errDetails}). Retrying in ${delay}ms... (Attempts left: ${retries})`);

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

export const IGCSE_UNIT_TAGS = {
  "PH1": "Changing River Environments",
  "PH2": "Changing Coastal Environments",
  "PH3": "Changing Ecosystems",
  "PH4": "Tectonic Hazards",
  "PH5": "Climate Change",
  "HU6": "Changing Populations",
  "HU7": "Changing Towns and Cities",
  "HU8": "Development",
  "HU9": "Changing Economies",
  "HU10": "Resource Provision"
};

export const ESSAY_SYSTEM_INSTRUCTION = `You are an expert IGCSE Geography AI assistant. Your brain is calibrated strictly to the official IGCSE Geography syllabus.

CRITICAL ARCHITECTURE RULES:
1. CURRICULUM STRUCTURE: Focus entirely on the two-paper architecture: Paper 1 (Physical Geography) and Paper 2 (Human Geography). Completely ignore and discard any older three-theme architectures or IB DP core/optional frameworks.
2. OFFICIAL EXAM GRADING SCALE: Evaluate, score, and provide feedback on student work strictly using the official IGCSE grading scale from A* to G (where A* is the highest tier, G is the lowest passing mark, and U is ungraded). Absolutely NEVER use alphanumeric IB points, DP 1-7 marks, or generic 1-5 numerical levels.
3. CORE UTILITY APPLICATIONS:
   - For GeoStrategy: Focus heavily on drilling down into the specific structural demands of 7-mark case study questions to secure full marks using place-specific detail.
   - For Precision Engine: Actively force students to turn vague descriptions into highly accurate, data-driven geographical statements using technical syllabus terminology and quantitative facts.
   - For IG Student Scaffold & Newsroom: Ensure all contextual readings and writing prompts match the conceptual complexity and command words appropriate for IGCSE candidates.
4. CORE CONCEPTUAL PILLARS:
   When evaluating student answers, providing feedback, or scaffolding responses, you must judge their work against the core pillars of the IGCSE framework:
   - Interrelationships: Check if the student links human activities to physical environments (e.g., how management techniques like hard engineering disrupt natural river or coastal loops).
   - Scale: Ensure the student recognizes how localized events ripple out into regional or global impacts.
   - Spatial Awareness: Look for clear descriptions of patterns, densities, and spatial distributions (e.g., resource allocations, population clusters, or urban zoning).
   - Change and Process: Verify that physical geomorphological sequences (erosion, transport, deposition) and human shifts (urbanization, industrial evolution) are explained dynamically over time.

5. THE 7-MARK CASE STUDY DIAGNOSTIC (GEOSTRATEGY SPECIALIZATION):
   For high-tariff 7-mark case study evaluations, you must strictly assess the response using the standard IGCSE diagnostic framework:
   - Causes: Are the physical or human triggers clearly identified?
   - Impacts: Are the consequences sharply categorized into Social, Economic, and Environmental factors (evaluating both positive and negative dimensions)?
   - Management: Are the specific strategies, policies, or engineering solutions actively critiqued?
   - Data Precision: A 7-mark response cannot score full marks without place-specific detail. Flag any lack of quantitative data, named locations, or precise case study facts.`;

async function startServer() {
  const app = express();
  const PORT = 3001;

  // Initialize Textbook Viewer Database & Folders
  const dataDir = process.env.DATA_DIR || process.cwd();
  const textbookDb = new Database(path.join(dataDir, "textbooks.db"));
  textbookDb.exec(`
    CREATE TABLE IF NOT EXISTS textbook_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      docName TEXT NOT NULL,
      page INTEGER NOT NULL,
      x INTEGER NOT NULL,
      y INTEGER NOT NULL,
      note TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  const textbooksDir = path.join(process.cwd(), "public", "textbooks");
  if (!fs.existsSync(textbooksDir)) {
    fs.mkdirSync(textbooksDir, { recursive: true });
  }

  // Serve textbooks statically
  app.use("/textbooks", express.static(textbooksDir));

  // Initialize GlobeTube Database Connection
  let gtDb: any = null;
  try {
    gtDb = await getGlobeTubeDB();
    console.log("[GlobeTube] Cloud database adapter initialized successfully.");
  } catch (dbErr) {
    console.error("[GlobeTube] Failed to initialize database adapter:", dbErr);
  }

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

      const prompt = `You are an expert Cambridge IGCSE Geography Examiner. Your task is to generate realistic, exam-quality IGCSE Geography data-response questions based on the uploaded infographic, alongside a separate, independent markscheme.

Constraints:
1. Core Objectives:
   - Analyze the uploaded infographic for geographical data, trends, anomalies, and spatial patterns.
   - Draft questions mimicking the style, tone, and difficulty of IGCSE Geography exams.
   - Create an official-style markscheme reflecting strict assessment criteria.
2. Structure of Questions:
   You MUST generate exactly 3 main questions based on the provided examples. Totaling exactly 10 marks:
   - Part (a) [2 Marks]: Data extraction or description. Either two 1-mark sub-questions (e.g., State/Identify (a)(i) and (a)(ii)) OR one 2-mark question (e.g., Describe).
   - Part (b) [2 Marks]: Reasoning/Application. A 2-mark question (e.g., Suggest/Outline one reason/advantage/disadvantage).
   - Part (c) [6 Marks]: Evaluation. A 6-mark question using exactly the phrasing "To what extent does the evidence in the infographic support the view that...".
3. Markscheme Specifics:
   - Provide a detailed point-by-point breakdown exactly like official IGCSE markschemes.
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
      engine: "IGCSE Geography Suite v11.2",
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
  // IG CWK QUALITY ASSURANCE ENDPOINTS
  // ==========================================

  app.post("/api/evaluate", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    
    const keepAliveInterval = setInterval(() => {
      res.write(" ");
    }, 10000);

    try {
      let text = req.body.text;

      const systemPrompt = `You are an expert Cambridge IGCSE Geography (0460) Coursework Moderator.
First, carefully read the text or document to identify the main focus/topic (e.g., Tourism Sustainability, Sand Dunes/Psammosere, Microclimate, etc.) of the coursework. Ensure that your evaluation and comments are strictly relevant to the identified topic, rather than incorrectly assuming it is about a different topic (like rivers or coasts if it's about tourism).
Evaluate the following student coursework draft based on the "Route to Geographical Enquiry" framework. 
Provide analysis across the five assessment criteria (A01, AO2, AO2, AO2, AO3), each out of 12 (Total 60).

- Criterion 1 (A01): Knowledge and understanding. (Terminology, aims, secondary sources)
- Criterion 2 (AO2): Observation and collection of data. (Primary logic, sampling strategies)
- Criterion 3 (AO2): Organisation and presentation of data. (Two complex techniques, tables)
- Criterion 4 (AO2): Analysis and interpretation. (Trends, anomalies, explanation based on theory)
- Criterion 5 (AO3): Conclusion and Evaluation. (Link to hypotheses, evidence, critique/improvements)

Provide specific "What Went Well" (WWW) and "Even Better If" (EBI) bullet points for each.

Respond in the following JSON format ONLY:
{
  "scores": {
    "ao1_knowledge": { "score": number, "www": ["string"], "ebi": ["string"] },
    "ao2_observation": { "score": number, "www": ["string"], "ebi": ["string"] },
    "ao2_organisation": { "score": number, "www": ["string"], "ebi": ["string"] },
    "ao2_analysis": { "score": number, "www": ["string"], "ebi": ["string"] },
    "ao3_conclusion": { "score": number, "www": ["string"], "ebi": ["string"] }
  },
  "total_score": number,
  "word_counts": {
    "evaluated_payload": number,
    "excluded_ancillaries": number,
    "raw_file_extract": number
  },
  "moderator_executive_summary": "string"
}`;

      let contentsPayload: any[] = [];
      if (text && text.startsWith("data:")) {
        const matches = text.match(/^data:(.+?);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          contentsPayload = [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            systemPrompt
          ];
        } else {
          contentsPayload = [text, systemPrompt];
        }
      } else {
        if (text && text.length > 500000) {
          text = text.substring(0, 500000);
        }
        contentsPayload = [text, systemPrompt];
      }

      const ai = getGenAI();
      const response = await generateContentWithRetry(ai, "gemini-3.1-pro-preview", contentsPayload, {
        responseMimeType: "application/json",
        maxOutputTokens: 8192
      });
      
      if (!response.text) throw new Error("No text in response");
      
      let rawText = response.text.trim();
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      let result = JSON.parse(rawText);
      
      clearInterval(keepAliveInterval);
      res.write(JSON.stringify(result));
      res.end();
      
    } catch (error: any) {
      console.error("Evaluation caught error:", error);
      clearInterval(keepAliveInterval);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Failed to evaluate coursework." });
      } else {
        res.write(JSON.stringify({ error: error.message || "Failed to evaluate coursework." }));
        res.end();
      }
    }
  });

  app.post("/api/evaluate-compare", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    const keepAliveInterval = setInterval(() => {
      res.write(" ");
    }, 10000);

    try {
      const { cwk1, cwk2 } = req.body;
      
      const systemPrompt = `You are an expert Cambridge IGCSE Geography (0460) Coursework Moderator.
You are tasked with comparing TWO pieces of student coursework (CWK 1 and CWK 2).
You have been provided with either the raw extracted text or their existing evaluation JSONs.

Generate a comparative evaluation across the five assessment criteria (A01, AO2, AO2, AO2, AO3), each out of 12.
Focus heavily on identifying which coursework did what better. Use the WWW (What Went Well) and EBI (Even Better If) bullet points to highlight structural, conceptual, and validity differences between the two.

You must output in this EXACT JSON format:
{
  "cwk1_total_score": number,
  "cwk2_total_score": number,
  "moderator_executive_summary": "string",
  "academic_integrity_report": "string",
  "criteria": {
    "ao1_knowledge": {
      "cwk1_score": number, "cwk1_www": ["string"], "cwk1_ebi": ["string"],
      "cwk2_score": number, "cwk2_www": ["string"], "cwk2_ebi": ["string"],
      "comparative_feedback": "string"
    },
    "ao2_observation": {
      "cwk1_score": number, "cwk1_www": ["string"], "cwk1_ebi": ["string"],
      "cwk2_score": number, "cwk2_www": ["string"], "cwk2_ebi": ["string"],
      "comparative_feedback": "string"
    },
    "ao2_organisation": {
      "cwk1_score": number, "cwk1_www": ["string"], "cwk1_ebi": ["string"],
      "cwk2_score": number, "cwk2_www": ["string"], "cwk2_ebi": ["string"],
      "comparative_feedback": "string"
    },
    "ao2_analysis": {
      "cwk1_score": number, "cwk1_www": ["string"], "cwk1_ebi": ["string"],
      "cwk2_score": number, "cwk2_www": ["string"], "cwk2_ebi": ["string"],
      "comparative_feedback": "string"
    },
    "ao3_conclusion": {
      "cwk1_score": number, "cwk1_www": ["string"], "cwk1_ebi": ["string"],
      "cwk2_score": number, "cwk2_www": ["string"], "cwk2_ebi": ["string"],
      "comparative_feedback": "string"
    }
  }
}`;

      let contentsPayload: any[] = [
        `CWK 1 Data: ${JSON.stringify(cwk1)}\n\nCWK 2 Data: ${JSON.stringify(cwk2)}`,
        systemPrompt
      ];

      const ai = getGenAI();
      const response = await generateContentWithRetry(ai, "gemini-3.1-pro-preview", contentsPayload, {
        responseMimeType: "application/json",
        maxOutputTokens: 8192
      });
      
      if (!response.text) throw new Error("No text in response");
      
      let rawText = response.text.trim();
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      let result = JSON.parse(rawText);
      
      clearInterval(keepAliveInterval);
      res.write(JSON.stringify(result));
      res.end();
      
    } catch (error: any) {
      console.error("Compare Evaluation caught error:", error);
      clearInterval(keepAliveInterval);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Failed to compare courseworks." });
      } else {
        res.write(JSON.stringify({ error: error.message || "Failed to compare courseworks." }));
        res.end();
      }
    }
  });

  app.post("/api/generate-class-feedback-content", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    const keepAliveInterval = setInterval(() => {
      res.write(" ");
    }, 10000);

    try {
      const { evaluations } = req.body;
      
      const systemPrompt = `You are an expert Cambridge IGCSE Geography (0460) Coursework Moderator.
You are tasked with generating content for a comprehensive whole-class feedback presentation based on a batch of student coursework evaluations.

The focus should be on:
1. The validity of data.
2. How students reference their data in relation to the three tiers of sustainability, the tourism lifecycle (Butler model), and sustainable initiatives.
3. CONTEXT: Jeju Island is a World Heritage site, and Songaksan is a recognized World Geopark (assessed on a 4-year cycle). Explicit reference to this status MUST feature heavily in the feedback. This status stimulates tourism, which brings visitor pressure at peak times, necessitating sustainable initiatives.
4. Extract anonymous examples of "good practice" (What Went Well) and "bad practice" / areas for improvement (Even Better If) from the provided student data to make the feedback specific and detailed.

You will receive a JSON string containing the evaluations (scores, WWWs, EBIs, and summaries) of the class.

Respond ONLY with valid JSON having the following structure:
{
  "slides": [
    {
      "title": "String (Slide Title)",
      "bullets": ["String (Bullet point 1)", "String (Bullet point 2)"],
      "speaker_notes": "String (Optional speaker notes)"
    }
  ]
}

Include slides covering:
- Overall Class Performance
- Validity of Data Collection
- Application of Conceptual Theory (Butler Model/Sustainability)
- Songaksan Context (World Geopark & 4-year assessment cycle)
- Visitor Pressure & Sustainable Initiatives
- Specific Anonymous Good Practices
- Specific Areas for Improvement (EBIs)
`;

      const ai = getGenAI();
      const response = await generateContentWithRetry(ai, "gemini-3.1-pro-preview", [
        JSON.stringify(evaluations),
        systemPrompt
      ], {
        responseMimeType: "application/json",
        maxOutputTokens: 8192
      });
      
      if (!response.text) throw new Error("No text in response");
      
      let rawText = response.text.trim();
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      let result = JSON.parse(rawText);
      
      clearInterval(keepAliveInterval);
      res.write(JSON.stringify(result));
      res.end();
      
    } catch (error: any) {
      console.error("Feedback generation caught error:", error);
      clearInterval(keepAliveInterval);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Failed to generate class feedback." });
      } else {
        res.write(JSON.stringify({ error: error.message || "Failed to generate class feedback." }));
        res.end();
      }
    }
  });

  // ==========================================
  // IG HIGH FIVE ENDPOINTS
  // ==========================================

  app.post("/api/highfive/generate", async (req, res) => {
    try {
      const { paper, topic, commandWord, customFocus } = req.body;

      if (!paper || !topic || !commandWord) {
        return res.status(400).json({ error: "Missing required parameters." });
      }

      const systemInstruction = `You are an architect tasked to develop a specialized engine for the Cambridge IGCSE Geography (0460) 2027-2029 syllabus named: IGCSE 0460 HIGH 5. You generate exam-standard questions and resources based on the specific Paper, Topic, and Command Word.
      
Content Constraints Terminology:
- Strictly use HIC, MIC, and LIC. Never use "MEDC" or "LEDC".
- Instead of posing generic phrases like 'An MIC' or 'An LIC' in questions, you MUST name a specific, real-world country (e.g., Vietnam, Kenya).
${customFocus ? `- FORCED FOCUS: The user requested to focus on: "${customFocus}". You MUST center the question and specific example around this country/location if possible.` : `- IF the question requires the student to choose a type of economy or country classification, enable the student to choose between two specific named countries representing those classifications (e.g., choice between a specific LIC or a specific HIC).`}
- Examples: All questions must allow for or provide "Detailed Specific Examples". do NOT mention 'post 2000' or dates in the question wording. When a specific example or country is already required or specified (DSE/FORCED FOCUS), do NOT include the clause "referring to detailed specific examples where appropriate" or similar repetitive boilerplate.
- Sustainability: Every resource must integrate an element of Sustainability, as mandated by the 2027-2029 syllabus.

Required Output Format For every generation, you must output three distinct components:
1. The 5-Mark Question: A scenario-based question tailored to the selected Topic and Command Word. Must require the student to refer to a "Detailed Specific Example". 
   - NOTE: If the Command Word is "Justify", you MUST follow this structure: "[Set the Scene/Scenario]. Justify a plan from the ones specified below."
   - Keep the question text direct and succinct. The explanations for these plans MUST be extremely short (MAXIMUM 20 WORDS each, 1 simple sentence).
2. The 1–5 Mark Scheme: 
   - 5 Marks: Comprehensive response with clear, balanced reasoning and specific terminology.
   - 3–4 Marks: Developed response with appropriate terminology and logical links.
   - 1–2 Marks: Basic statements or simple descriptive points.
3. Tailored Scaffolding (Sentence Starters): Provide 3–5 Sentence Starters specifically tailored to the generated question. These must prompt the student to provide "Place-Specific Detail" and "Sustainability" evaluation.`;

      const prompt = `Generate the required output for:
Paper: ${paper}
Topic: ${topic}
Command Word: ${commandWord}

Return the response in JSON format matching the schema exactly.`;

      const ai = getGenAI();
      const response = await generateContentWithRetry(ai, "gemini-3.5-flash", prompt, {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The 5-Mark Question string",
            },
            justifyOptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Short title (e.g., Plan A)" },
                  description: { type: Type.STRING, description: "MAXIMUM 20 WORDS. Only 1 short sentence." }
                },
                required: ["title", "description"]
              },
              description: "Only if Command Word is 'Justify': provide 3-4 specific options or plans for the student to choose from.",
            },
            markScheme: {
              type: Type.STRING,
              description: "The 1-5 Mark Scheme formatted in Markdown",
            },
            starters: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 Sentence Starters as an array of strings",
            },
          },
          required: ["question", "markScheme", "starters"],
        },
      });

      const textOutput = response.text || "{}";
      const jsonStr = textOutput.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
      const result = JSON.parse(jsonStr);

      res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error in High Five:", error);
      res.status(500).json({ error: error.message || "An error occurred during generation." });
    }
  });

  // ==========================================
  // IG DSE DESIGNER ENDPOINTS
  // ==========================================

  app.post('/api/dse/generate', upload.array('files'), async (req, res) => {
    try {
      const prompt = req.body.prompt;
      
      let urls: string[] = [];
      if (req.body.urls) {
        if (Array.isArray(req.body.urls)) {
            urls = req.body.urls;
        } else if (typeof req.body.urls === 'string') {
            urls = JSON.parse(req.body.urls);
        }
      }
      
      const syllabusCode = req.body.syllabusCode;
      const files = req.files as Express.Multer.File[];

      if (!prompt && (!files || files.length === 0) && urls.filter(u => u.trim() !== '').length === 0) {
        return res.status(400).json({ error: 'Please provide at least one input (suggestion prompt, document, or URL).' });
      }
      
      let documentTexts = '';
      if (files && files.length > 0) {
          for (const file of files) {
              if (file.mimetype === 'application/pdf') {
                  const data = await pdf(file.buffer);
                  documentTexts += `\n--- Document: ${file.originalname} ---\n${data.text}\n`;
              } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/msword') {
                  const result = await mammoth.extractRawText({ buffer: file.buffer });
                  documentTexts += `\n--- Document: ${file.originalname} ---\n${result.value}\n`;
              } else {
                  documentTexts += `\n--- Document: ${file.originalname} ---\n${file.buffer.toString('utf8')}\n`;
              }
          }
      }

      const systemInstruction = `You are 'DSE Designer', the core AI engine for an IGCSE Geography Suite application. Your sole purpose is to synthesize user inputs into highly detailed, exam-ready "Detailed Specific Examples" (DSEs).

### Critical Validation & Synthesis Context
1. SAVVY VALIDATION: First, evaluate if the provided context (URLs, Documents, Prompt) factually and topically matches the requested Syllabus Code. If the topics do not match or are only tangentially related, explicitly state this mismatch prominently at the top of your response (e.g. "⚠️ Topic Mismatch: The provided materials do not strongly align with syllabus code...") and then attempt the best synthesis possible or explain why it cannot form a valid DSE for that code.
2. TEMPORAL & RESOURCE SYNTHESIS: If multiple materials (URLs, files) are provided and there is a link between them (e.g. an ongoing case study over a period of time, or different aspects of the same event), explicitly seek these links out and make that synthesis obvious to the student. Demonstrate the extent and temporal scale purveyed over these multiple sources.

### Core Objectives
1. EXAM READINESS: Structure every DSE to provide the exact level of depth, names, statistics, and locations required for candidates to maximize sub-marks on Paper 1 and Paper 2.
2. TIMELINE CONSTRAINT: Strictly prioritize contemporary data and events from CE 2000 to the present day, as recommended by the syllabus.
3. SYLLABUS ALIGNMENT: Map the output precisely to the specific syllabus code below.

### DSE Reference Schema
Align output to these exact structural requirements for the relevant syllabus code:

[PH1: Changing River Environments]
- 1.3.8 (River Flood): Named river, specific causes, precise impacts, management strategies/techniques (including sustainable).
- 1.3.9 (River Pollution): Named river, causes, impacts, management strategies/techniques (including sustainable).

[PH2: Changing Coastal Environments]
- 2.3.7 (Coastal Erosion): Named country/coastal area, causes, impacts, protective strategies against tropical storms, erosion management (including sustainable).
- 2.3.8 (Coral Reefs): Named country/coastal area, why the reef is important, threats to the reef, management strategies/techniques.

[PH3: Changing Ecosystems]
- 3.4.4 (Tropical Rainforest): Named country/rainforest area, threats, impacts of destruction/deforestation, management strategies/techniques (including sustainable).

[PH4: Tectonic Hazards]
- 4.4.3 (Earthquake): Named country/area, causes, impacts, immediate/long-term responses, management strategies/techniques.
- 4.4.4 (Volcanic Eruption): Named volcano, causes, impacts, immediate/long-term responses, management strategies/techniques.

[PH5: Climate Change]
- 5.3.3 (Climate Change): Named country/region, impacts, responses, management strategies/techniques (including sustainable).

[HU6: Changing Population]
- 6.2.3 (Population Policy): Named country, specific reasons for population growth or decline, precise impacts of a pro- or anti-natalist policy.
- 6.3.5 (International Migration): Named country of origin AND destination country, specific push/pull factors, impacts on migrants, origin, and destination, migration management (including sustainable).

[HU7: Changing Towns & Cities]
- 7.3.2 (Urban Growth): Named urban area, causes of growth, challenges and opportunities, management strategies/techniques (including sustainable).

[HU8: Development]
- 8.3.4 (Development Gap): Named MIC or LIC country, reasons for current development level, strategies/techniques used to raise economic development, quality of life, and standard of living.

[HU9: Changing Economies]
- 9.2.6 (Globalisation & TNCs): Named country/area, impacts of globalisation, specific impacts of a named TNC operating there.
- 9.3.5 (Tourism): Named country/area, reasons for tourism growth, benefits, problems, sustainable management strategies/techniques.

[HU10: Resource Provision]
- 10.3.6 (Food Supply): Named country/area, factors affecting supply, causes of food insecurity, problems caused by food insecurity, strategies to increase food supply.
- 10.6.4 (Energy Mix): Named country, detailed energy mix breakdown, impacts of different energy types used, management strategies/techniques (including sustainable).

Every DSE profile you generate must strictly follow this Markdown structure:

# DSE Profile: [Specific Location/Name]
**Syllabus Code & Topic:** [e.g., PH1: Changing River Environments - 1.3.8 River Flood]
**Temporal Range:** [e.g., August 2010 – Present Day]

---

## 📌 Executive Summary
A concise 3-4 sentence overview of the DSE establishing its scale, geography, and textbook relevance.

## 📊 Core Statistics & Place-Specific Detail
(Provide a bulleted list of critical, high-scoring facts: dates, death tolls, economic costs in $, volumes, percentages, and named local places/tributaries/organizations).

## 🌍 Locational Specifics (CLOCCS)
Describe locational specifics using CLOCCS:
- C - Continents: Identify the continent or major global region.
- L - Latitude: Describe the location in terms of global lines of latitude.
- O - Oceans and Seas: Name the specific oceans or major bodies of water that border or surround the location.
- C - Countries: List the countries that neighbor the location or the specific country the site resides in.
- C - Compass Points: Give the direction of the place relative to another known landmark or region.
- S - Scale: Distance to a neighbouring place (a coast or a city/town) as in a 'proximity marker'.

## 🗺️ Geographical Context Map
Produce a JSON block detailing coordinates for a custom interactive map. IMPORTANT: You MUST output a valid JSON string inside a code block labeled \`json-map\` (i.e. \`\`\`json-map). This JSON must include:
- "title": A string title for the map.
- "center": A [latitude, longitude] array of numbers.
- "zoom": An integer describing the zoom level (e.g. 4 to 10).
- "markers": An array of objects, where each object has a "position" (array of two numbers) and a "popup" (string description of the pin).
Example:
\`\`\`json-map
{
  "title": "Map of the 2010 Indus River Floods",
  "center": [28.0, 68.0],
  "zoom": 5,
  "markers": [
    { "position": [28.0, 68.0], "popup": "Sindh Province - severely affected region" }
  ]
}
\`\`\`

## 🔍 Syllabus Requirement Breakdown
(Create sub-sections matching the exact bullet points of the target syllabus requirement. Ensure explicit "Sustainable" management labels are present.)

## 📝 Exam Application Notes
- **Paper 1 (Core/Extended Questions):** Brief tips on how a student should deploy this case study for a 7-mark or 9-mark leveled response.
- **Key Vocabulary:** 4-5 high-tier geographical terms specific to this DSE.

---

<br/>
<br/>

## Student DSE Input Report: [Syllabus Code & Topic]
### 1) USER SUGGESTION PROMPTS:
[Output exactly what the student prompted in the suggestion prompt. Output "None provided" if none.]

### 2) FILE CONTEXT UPLOAD:
[Name of the file(s) the student uploaded]
[A detailed synopsis and description of the contents of the files uploaded. Output "None provided" if none.]

### 3) TARGET URL PARSE:
[List the URLs]
[A synopsis of the URLs and a short analysis of the credibility or bias of the news and media outlets the student used to compile the DSE. Output "None provided" if none.]`;

      let combinedInput = `Syllabus Code Needed: ${syllabusCode}\n\n`;
      if (prompt) combinedInput += `User Suggestion Prompt: ${prompt}\n\n`;
      if (documentTexts) combinedInput += `Document Text: ${documentTexts}\n\n`;
      if (urls && urls.length > 0) {
        combinedInput += `Provided Web URLs (to synthesize with context):\n` + urls.map(u => `- ${u}`).join('\n') + `\n\n`;
      }

      const ai = getGenAI();
      const response = await generateContentWithRetry(ai, "gemini-2.5-pro", combinedInput, {
        systemInstruction,
        temperature: 0.2,
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini API Error in DSE Designer:", error);
      res.status(500).json({ error: error.message || "Failed to generate DSE." });
    }
  });

  app.post('/api/dse/export-docx', async (req, res) => {
    try {
      const { html } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content required.' });
      }
      const htmlToDocx = await import('html-to-docx');
      const fileBuffer = await htmlToDocx.default(html, null, {
          table: { row: { cantSplit: true } },
          footer: true,
          pageNumber: true,
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename="DSE-Profile.docx"');
      res.send(fileBuffer);
    } catch (error: any) {
      console.error("Docx Export Error:", error);
      res.status(500).json({ error: error.message || 'Failed to export to DOCX.' });
    }
  });

  // ==========================================
  // CORRESPONDENT (FRESH OFF THE PRESS) ENDPOINTS
  // ==========================================

  const userTracker = (req: any, res: any, next: any) => {
    const email = req.query.email || req.body.email || '';
    if (email) {
      req.userHash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
    } else {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      req.userHash = crypto.createHash('md5').update(ip as string).digest('hex');
    }
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

    const VALID_TAGS = new Set(['PH1', 'PH2', 'PH3', 'PH4', 'PH5', 'HU6', 'HU7', 'HU8', 'HU9', 'HU10']);
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
        const match = cleanTag.match(/^(PH1|PH2|PH3|PH4|PH5|HU6|HU7|HU8|HU9|HU10)\b/);
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
        const prompt = `Analyze these news headlines and assign relevant IGCSE Geography unit tags.
        IMPORTANT: You MUST return the EXACT 'headline' string as provided in the input list for the mapping to work.
        
        Headlines to analyze:
        ${JSON.stringify(headlines)}`;

        const response = await generateContentWithRetry(
          ai,
          'gemini-3.5-flash',
          [{ role: 'user', parts: [{ text: prompt }] }],
          {
            systemInstruction: `You are a strict IGCSE Geography tagging agent for the "IG Correspondent" application. 
            Analyze the headlines and assign relevant unit tags ONLY from this list:
            - PH1: Changing River Environments
            - PH2: Changing Coastal Environments
            - PH3: Changing Ecosystems
            - PH4: Tectonic Hazards
            - PH5: Climate Change
            - HU6: Changing Populations
            - HU7: Changing Towns and Cities
            - HU8: Development
            - HU9: Changing Economies
            - HU10: Resource Provision
            
            Rules:
            - Return a JSON array of objects: { "headline": "EXACT_ORIGINAL_STRING", "tags": ["TAG1", "TAG2"] }.
            - Tags MUST be uppercase codes from the list above (e.g., "PH1").
            - Max 3 tags per headline.
            - If a headline doesn't match any IGCSE Geography context, return an empty tags array.
            - DO NOT change or normalize the headline text in your response.`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "IGCSE unit tags strictly from: PH1, PH2, PH3, PH4, PH5, HU6, HU7, HU8, HU9, HU10. Never use IB/DP tags."
                  }
                },
                required: ['headline', 'tags']
              }
            }
          }
        );

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
      const today = getPollDateKST();
      const prompt = `Based on these recent news items, generate exactly 3 IGCSE Geography themed daily polls for today (${today}).
      
      News Items:
      ${JSON.stringify(headlines.slice(0, 20))}
      
      Guidelines:
      - Questions must be directly related to one of the provided news articles.
      - Structure questions around the IGCSE Geography syllabus structure and command words (Describe, Explain, Discuss, Evaluate). Focus on place-specific details and data-driven geography.
      - Example Question Styles: 
        * "The recent [Event] is likely to [Outcome]... A: Yes, B: No, C: Maybe"
        * "How might [Region] look to reduce [Issue] among the public? A: [Option], B: [Option], C: [Option]"
      - Make them engaging and opinion-based where appropriate to stimulate debate.
      - Provide the exact 'source_url' from the news items for each question.
      - IMPORTANT: You MUST generate exactly one poll for each of these three categories:
        1. Physical Geography: Choose one unit from (PH1, PH2, PH3, PH4, PH5)
        2. Human Geography: Choose one unit from (HU6, HU7, HU8, HU9, HU10)
        3. Case Study / Application: Choose any unit from PH1-HU10
      - The 'dp_tag' for each poll must be the exact unit string chosen (e.g. PH1, HU6, HU8).
      - Provide 3 or 4 distinct options (A, B, C, D). If only 3 are needed, use A, B, C.
      
      Return a JSON array of 3 poll objects.`;

      const response = await generateContentWithRetry(
        ai,
        'gemini-3.5-flash',
        [{ role: 'user', parts: [{ text: prompt }] }],
        {
          systemInstruction: `You are a curriculum expert for IGCSE Geography. Generate 3 engaging, syllabus-aligned daily polls based on current events.
          Output format: JSON array of objects:
          {
            "question": "string",
            "source_url": "string",
            "dp_tag": "string (e.g. PH1)",
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
                dp_tag: {
                  type: Type.STRING,
                  description: "IGCSE unit tag strictly from: PH1, PH2, PH3, PH4, PH5, HU6, HU7, HU8, HU9, HU10. Never use IB/DP tags."
                },
                option_a: { type: Type.STRING },
                option_b: { type: Type.STRING },
                option_c: { type: Type.STRING },
                option_d: { type: Type.STRING }
              },
              required: ['question', 'source_url', 'dp_tag', 'option_a', 'option_b', 'option_c']
            }
          }
        }
      );

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
  // STUDENT SCAFFOLD ENDPOINTS
  // ==========================================

  app.post("/api/scaffold/generate", upload.single('attachment'), async (req: any, res) => {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] Scaffold generation started`);

    try {
      const ai = getGenAI();

      const {
        paperType,
        targetMarks,
        framework,
        wordBankToggle,
        question,
        keywords,
        mode = 'both',
        teacherCode
      } = req.body;

      const allowedTeacherCodes = ["SKN", "JTE", "SMK", "JBO", "SSH", "LLE", "CMA", "CHE"];
      if (!teacherCode || !allowedTeacherCodes.includes(teacherCode.toUpperCase())) {
        console.warn(`[${requestId}] Aborting: Unauthorized teacherCode ${teacherCode}`);
        return res.status(403).json({ error: "Access Denied", details: "Unauthorized access to Student Scaffold." });
      }

      if (!question) {
        console.warn(`[${requestId}] Aborting: No question`);
        return res.status(400).json({ error: "Missing question prompt" });
      }

      console.log(`[${requestId}] Mode: ${mode} | Paper: ${paperType}, Marks: ${targetMarks}, Framework: ${framework}`);

      const isWordBankOn = wordBankToggle === "true" || wordBankToggle === true;

      // Extract text from attachment if provided
      let attachmentContext = "";
      if (req.file) {
        try {
          if (req.file.originalname.toLowerCase().endsWith(".pdf")) {
            const parsedPdf = await pdf(req.file.buffer);
            attachmentContext = parsedPdf.text;
          } else {
            attachmentContext = req.file.buffer.toString('utf-8');
          }
          console.log(`[${requestId}] Attachment read successfully (Length: ${attachmentContext.length})`);
        } catch (e) {
          console.error(`[${requestId}] Failed to read attachment:`, e);
        }
      }

      const systemInstruction = `
        # PERSONA & OBJECTIVE
        You are the AI engine powering "IGCSE Student Scaffold," an expert educational assistant designed exclusively for Cambridge IGCSE Geography students. 
        Your role is to build structural blueprints and/or writing frames.

        # OUTPUT FORMAT
        You MUST return a JSON object matching this schema:
        {
          "scaffold": "string (Markdown format, present if requested)",
          "writingFrame": "string (Markdown format, present if requested)"
        }
        
        If mode is "scaffold": return {"scaffold": "..."}
        If mode is "frame": return {"writingFrame": "..."}
        If mode is "both": return {"scaffold": "...", "writingFrame": "..."}

        # SCAFFOLD SPECIFICATIONS (Required if mode is "scaffold" or "both")
        ## 1. COMMAND TERM DECODER
        Extract core command term. Define AO requirement + **Time Target**.
        ## 2. THE DYNAMIC WORD BANK (Include if Word Bank Toggle ON)
        5–8 technical terms with 4-5 word definitions.
        ## 3. THE SCAFFOLD BLUEPRINT
        - Broken down by ${framework} / ${targetMarks}. Use headers like P (Point), E (Evidence), etc.
        - **IMPORTANT: FOR 10, 12, OR 16 MARK QUESTIONS** (especially for PEEL/PEECAL), you MUST use the **HOPPED** structure for the **Introduction**:
          - **H (Hook):** Relevant global stat, quote, or example.
          - **O (Opinion):** Position/argument.
          - **P (Perspectives):** Views or scales to explore.
          - **P (Place):** Case study location.
          - **E (Evidence):** Kinds of data used.
          - **D (Definitions):** Clarifying key terms.
        
        ## 4. THE "GOLDEN THREAD" CHECKLIST
        Term checklist for the student.

        # WRITING FRAME SPECIFICATIONS (Required if mode is "frame" or "both")
        - Heavy focus on sentence starters and transitions.
        - Structure it by paragraph (Intro, Body 1, Body 2... Conclusion).
        - **FOR 10, 12, OR 16 MARK QUESTIONS**, use **HOPPED** headers for the Intro section.
        - Provide multiple alternatives for every starter separated by "/".
        - Example: "One significant factor to consider is... / A primary element of this issue is... / Evidence suggests that..."

        # GUARDRAILS
        - DO NOT WRITE THE ANSWER.
        - Professional academic tone.
        - Use standard Markdown within the string values.
      `;

      let promptText = `Environment: Paper ${paperType}, ${targetMarks} marks, ${framework} framework.\n`;
      promptText += `Student Question: "${question}"\n`;
      promptText += `Keywords: "${keywords}"\n`;
      if (attachmentContext) {
        promptText += `Attachment Context Material:\n${attachmentContext}\n`;
      }

      if (mode === 'scaffold') {
        promptText += `TASK: Generate ONLY the detailed structural scaffold.`;
      } else if (mode === 'frame') {
        promptText += `TASK: Generate ONLY the writing frame with sentence starters.`;
      } else {
        promptText += `TASK: Generate BOTH the scaffold and the writing frame.`;
      }

      console.log(`[${requestId}] Requesting Gemini (gemini-3.5-flash)...`);

      const response = await generateContentWithRetry(
        ai,
        "gemini-3.5-flash",
        promptText,
        {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      );

      console.log(`[${requestId}] Gemini responded`);

      let fullOutput = response.text || "";
      if (!fullOutput) {
        throw new Error("The AI returned an empty response.");
      }

      let scaffold = "";
      let writingFrame = "";

      try {
        const parsedData = JSON.parse(fullOutput.replace(/^```json\n?|```$/g, "").trim());
        scaffold = parsedData.scaffold || "";
        writingFrame = parsedData.writingFrame || "";
      } catch (parseError) {
        console.error(`[${requestId}] JSON Parse Error:`, parseError);
        const jsonMatch = fullOutput.match(/```json\s*([\s\S]*?)\s*```/) || fullOutput.match(/([\{\[][\s\S]*[\}\]])/);
        if (jsonMatch) {
          try {
            const parsedData = JSON.parse(jsonMatch[1]);
            scaffold = parsedData.scaffold || "";
            writingFrame = parsedData.writingFrame || "";
          } catch (e) {
            throw new Error("Failed to parse extracted AI JSON.");
          }
        } else {
          throw new Error("Failed to extract JSON from AI output.");
        }
      }

      res.json({ scaffold, writingFrame });
      console.log(`[${requestId}] Successfully sent response`);
    } catch (error: any) {
      console.error(`[${requestId}] Generation Error:`, error);
      res.status(500).json({
        error: "Generation Failed",
        details: error.message || "Failed to generate content"
      });
    }
  });

  // ==========================================
  // GLOBETUBE ENDPOINTS
  // ==========================================

  const GLOBETUBE_DEFAULT_VIDEOS = [
    {
      id: "Pz6AQXQGupQ",
      title: "Where we get our fresh water",
      channel: "TED-Ed",
      description: "An exploration of Earth's water distribution, freshwater storage systems, and the hydrological systems that supply human civilization.",
      unit: "PH1: Changing River Environments",
      duration: "05:08",
      publishedAt: "1 week ago"
    },
    {
      id: "LxgMdjyw8uw",
      title: "We WILL Fix Climate Change!",
      channel: "Kurzgesagt – In a Nutshell",
      description: "An in-depth study of coastal erosion, rising sea levels, community resilience, and risk management in low-lying coastal areas.",
      unit: "PH2: Changing Coastal Environments",
      duration: "16:15",
      publishedAt: "3 weeks ago"
    },
    {
      id: "ys8aM6qHpaY",
      title: "How Wolves Change Rivers",
      channel: "Sustainable Human",
      description: "A classic case study of trophic cascades showing how reintroducing wolves to Yellowstone National Park changed ecosystem structures and geomorphology.",
      unit: "PH3: Changing Ecosystems",
      duration: "04:33",
      publishedAt: "4 years ago"
    },
    {
      id: "fXb02MQ78yQ",
      title: "What Happens if a Supervolcano Blows Up?",
      channel: "Kurzgesagt – In a Nutshell",
      description: "Examining volcanic hazard maps, seismic anomalies, gas emissions, deformation monitoring, and disaster mitigation strategies for active geophysical hazards.",
      unit: "PH4: Tectonic Hazards",
      duration: "10:04",
      publishedAt: "4 days ago"
    },
    {
      id: "ztWHqUFJRTs",
      title: "Climate change: Earth's giant game of Tetris",
      channel: "TED-Ed",
      description: "A spatial analysis of climate vulnerability, rising sea levels, changing biome distributions, climate migration corridors, and international adaptation strategies.",
      unit: "PH5: Climate Change",
      duration: "02:48",
      publishedAt: "1 month ago"
    },
    {
      id: "kVaBlat06Sw",
      title: "Why 94% of China Lives East of This Line",
      channel: "RealLifeLore",
      description: "An investigation into China's demographic distribution, the Heihe-Tengchong line, geographic barriers, agricultural viability, and population pressure shifts.",
      unit: "HU6: Changing Populations",
      duration: "21:40",
      publishedAt: "3 weeks ago"
    },
    {
      id: "7NBa5o--y3k",
      title: "The Cruise Industry's Arms Race",
      channel: "Wendover Productions",
      description: "Analyzing the globalization of leisure, tourism nodes, carrying capacity of small island tourist economies, and the environmental footprint of cruise terminals.",
      unit: "HU7: Changing Towns and Cities",
      duration: "13:22",
      publishedAt: "2 weeks ago"
    },
    {
      id: "cuPfIFg2ZDI",
      title: "200 Years, 200 Countries, 4 Minutes",
      channel: "Hans Rosling / Gapminder",
      description: "Analyzing global development indices, GNI per capita, human development metrics, multidimensional poverty, and institutional structural aid in low-income nations.",
      unit: "HU8: Development",
      duration: "04:47",
      publishedAt: "2 months ago"
    },
    {
      id: "FN3VFgG922A",
      title: "Meet the enormous boats that carry your stuff",
      channel: "Vox",
      description: "Exploring the spatial interactions, logistics networks, global shipping lanes, key maritime chokepoints (Suez, Panama, Malacca), and structural supply chain vulnerabilities.",
      unit: "HU9: Changing Economies",
      duration: "10:35",
      publishedAt: "5 days ago"
    },
    {
      id: "Hvc1P5edKTc",
      title: "Population & Food: Crash Course Geography #16",
      channel: "CrashCourse Geography",
      description: "An overview of ecological footprints, global resource distribution, Malthusian vs. Boserupian models of population growth, and resource security challenges.",
      unit: "HU10: Resource Provision",
      duration: "11:58",
      publishedAt: "2 weeks ago"
    }
  ];

  function getWeeksNumber(d: Date): string {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${weekNo}`;
  }

  async function generateWeeklyVideosServer(): Promise<any> {
    const ai = getGenAI();
    const WEEKLY_VIDEOS_SYSTEM_INSTRUCTION = `
    You are the Curator Engine for IG GlobeTube. Your job is to select exactly 10 high-quality, real, educational YouTube videos (one for each of the 10 syllabus units listed below).
    For each video, you MUST provide a valid, real, case-sensitive 11-character YouTube video ID, title, channel name, description, duration (MM:SS), and published date.
    
    # CURRICULUM UNITS:
    - PH1: Changing River Environments
    - PH2: Changing Coastal Environments
    - PH3: Changing Ecosystems
    - PH4: Tectonic Hazards
    - PH5: Climate Change
    - HU6: Changing Populations
    - HU7: Changing Towns and Cities
    - HU8: Development
    - HU9: Changing Economies
    - HU10: Resource Provision
    
    # TRUSTED CHANNELS TO RECOMMEND:
    Prioritize extremely popular and educational channels that always allow external embedding on websites:
    - TED-Ed
    - Kurzgesagt – In a Nutshell
    - CrashCourse
    - Vox
    - Wendover Productions
    - RealLifeLore
    - Geography Now
    - Atlas Pro
    - Practical Engineering
    
    # OUTPUT FORMAT (STRICT JSON ONLY):
    You must return ONLY a raw JSON object matching this schema. Do not wrap the JSON in markdown code blocks. Do not include any other text.
    {
      "videos": [
        {
          "unit": "PH1: Changing River Environments",
          "id": "11_CHAR_ID",
          "title": "Exact or accurate Video Title",
          "channel": "Channel Name",
          "description": "A brief description (1-2 sentences) of how this video connects to the unit's themes.",
          "duration": "MM:SS",
          "publishedAt": "e.g., 2 weeks ago"
        },
        ... (exactly 10 items, one for each unit in the exact order of the units listed above)
      ]
    }
    `;
    const prompt = `
      Select 10 high-yield educational geography/geopolitics videos for this week (one for each of the 10 units).
      Make sure to provide real YouTube video IDs from trusted creators (Kurzgesagt, TED-Ed, Crash Course, Vox, Wendover Productions, RealLifeLore, Geography Now).
      Vary the selections from standard templates, ensuring they are engaging.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: WEEKLY_VIDEOS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const outputText = response.text || "";
    const cleanJsonText = outputText.replace(/^```json\n?|```$/g, "").trim();
    return JSON.parse(cleanJsonText);
  }

  app.get(["/api/globetube/videos", "/api/videos"], async (req, res) => {
    try {
      if (!gtDb) {
        throw new Error("Database connection not initialized.");
      }

      const role = (req.query.role as string || "student").toLowerCase();
      const includeLocked = role === "teacher" || role === "super_admin";
      const currentWeek = getWeeksNumber(new Date());
      let matrix = await gtDb.getVideos(includeLocked);

      const prefixes = ["PH1", "PH2", "PH3", "PH4", "PH5", "HU6", "HU7", "HU8", "HU9", "HU10"];

      // Auto-seed default videos if database is completely empty on startup
      let checkMatrix = includeLocked ? matrix : await gtDb.getVideos(true);
      let actualTotalCount = 0;
      prefixes.forEach(pref => {
        if (Array.isArray(checkMatrix[pref])) {
          actualTotalCount += checkMatrix[pref].length;
        }
      });

      if (actualTotalCount === 0) {
        console.log("[GlobeTube] Database is empty. Seeding default videos into database...");
        const initialGrouped: Record<string, any[]> = {};
        prefixes.forEach(pref => { initialGrouped[pref] = []; });

        GLOBETUBE_DEFAULT_VIDEOS.forEach((vid: any) => {
          if (vid.unit) {
            const pref = vid.unit.split(':')[0].trim();
            if (prefixes.includes(pref)) {
              initialGrouped[pref].push({ ...vid, is_locked: false });
            }
          }
        });

        for (const pref of prefixes) {
          await gtDb.saveVideos(pref, initialGrouped[pref]);
        }

        // Fetch updated matrix after seeding
        matrix = await gtDb.getVideos(includeLocked);
      }

      // Check weekly rotation via a stored metadata week field
      let storedWeek = currentWeek;
      if (matrix["week_meta"] && matrix["week_meta"].length > 0) {
        storedWeek = matrix["week_meta"][0].week;
      } else {
        await gtDb.saveVideos("week_meta", [{ week: currentWeek }]);
      }

      if (storedWeek !== currentWeek) {
        console.log(`[GlobeTube] Rotating weekly videos from ${storedWeek} to ${currentWeek}`);
        try {
          const response = await generateWeeklyVideosServer();
          if (response && response.videos && response.videos.length === 10) {
            const verifiedVideos: any[] = [];
            for (let i = 0; i < response.videos.length; i++) {
              const genVid = response.videos[i];
              const defaultVid = GLOBETUBE_DEFAULT_VIDEOS[i];
              try {
                const checkRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${genVid.id}`);
                const checkData: any = await checkRes.json();
                if (checkRes.ok && !checkData.error && checkData.title) {
                  verifiedVideos.push({
                    id: genVid.id,
                    title: genVid.title || checkData.title,
                    channel: genVid.channel || checkData.author_name || defaultVid.channel,
                    description: genVid.description || defaultVid.description,
                    unit: defaultVid.unit,
                    duration: genVid.duration || defaultVid.duration,
                    publishedAt: genVid.publishedAt || defaultVid.publishedAt,
                    is_locked: false
                  });
                } else {
                  verifiedVideos.push({ ...defaultVid, is_locked: false });
                }
              } catch (err) {
                verifiedVideos.push({ ...defaultVid, is_locked: false });
              }
            }

            // Group and save rotated weekly list
            const rotatedGrouped: Record<string, any[]> = {};
            prefixes.forEach(pref => { rotatedGrouped[pref] = []; });
            verifiedVideos.forEach((vid: any) => {
              if (vid.unit) {
                const pref = vid.unit.split(':')[0].trim();
                if (prefixes.includes(pref)) {
                  rotatedGrouped[pref].push(vid);
                }
              }
            });

            for (const pref of prefixes) {
              await gtDb.saveVideos(pref, rotatedGrouped[pref]);
            }
            await gtDb.saveVideos("week_meta", [{ week: currentWeek }]);
            matrix = await gtDb.getVideos(includeLocked);
          } else {
            await gtDb.saveVideos("week_meta", [{ week: currentWeek }]);
          }
        } catch (err) {
          console.error("[GlobeTube] Weekly rotation failed:", err);
          await gtDb.saveVideos("week_meta", [{ week: currentWeek }]);
        }
      }

      // Clean returned payload from metadata week_meta
      const cleanMatrix: Record<string, any[]> = {};
      prefixes.forEach(pref => {
        cleanMatrix[pref] = matrix[pref] || [];
      });

      res.json(cleanMatrix);
    } catch (err: any) {
      console.error("[GlobeTube] GET /api/videos failed:", err);
      // Fallback: return default matrix
      const fallbackMatrix: Record<string, any[]> = {};
      const prefixes = ["PH1", "PH2", "PH3", "PH4", "PH5", "HU6", "HU7", "HU8", "HU9", "HU10"];
      prefixes.forEach(pref => { fallbackMatrix[pref] = []; });
      GLOBETUBE_DEFAULT_VIDEOS.forEach((vid: any) => {
        if (vid.unit) {
          const pref = vid.unit.split(':')[0].trim();
          if (prefixes.includes(pref)) {
            fallbackMatrix[pref].push(vid);
          }
        }
      });
      res.json(fallbackMatrix);
    }
  });

  app.post(["/api/globetube/videos", "/api/videos"], async (req, res) => {
    try {
      if (!gtDb) {
        throw new Error("Database connection not initialized.");
      }

      const { url, title, unit, channel, videos, teacherCode } = req.body;
      const allowedTeacherCodes = ["SKN", "JTE", "SMK", "JBO", "SSH", "LLE", "CMA", "CHE"];

      if (!teacherCode || !allowedTeacherCodes.includes(teacherCode.toUpperCase())) {
        return res.status(403).json({ error: "Access Denied", details: "Unauthorized teacher credentials." });
      }

      const prefixes = ["PH1", "PH2", "PH3", "PH4", "PH5", "HU6", "HU7", "HU8", "HU9", "HU10"];

      // Case 1: Single video import (url, title, unit, channel)
      if (url && unit) {
        let videoId = url.trim();
        if (videoId.length !== 11) {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
          const match = videoId.match(regExp);
          if (match && match[2].length === 11) {
            videoId = match[2];
          } else {
            return res.status(400).json({ error: "Invalid YouTube URL or Video ID." });
          }
        }

        const syllabusTag = unit.split(':')[0].trim();
        if (!prefixes.includes(syllabusTag)) {
          return res.status(400).json({ error: `Invalid syllabus unit tag: ${syllabusTag}` });
        }

        const currentMatrix = await gtDb.getVideos(true);
        const currentList = currentMatrix[syllabusTag] || [];

        if (currentList.some((v: any) => v.id === videoId)) {
          return res.status(400).json({ error: "This video is already in your syllabus grid." });
        }

        const newVideo = {
          id: videoId,
          title: title || "Imported Video",
          channel: channel || "YouTube Creator",
          description: "Custom imported case study.",
          unit: unit,
          duration: "N/A",
          publishedAt: "Just imported",
          is_locked: true // Default newly imported video to locked!
        };

        const updatedList = [newVideo, ...currentList];
        await gtDb.saveVideos(syllabusTag, updatedList);

        console.log(`[GlobeTube] Video ${videoId} imported into unit ${syllabusTag} successfully.`);
        return res.status(200).json({ success: true, message: "Video successfully sorted into syllabus row." });
      }

      // Case 2: Bulk array update (for Swaps and Deletes)
      if (videos && Array.isArray(videos)) {
        const grouped: Record<string, any[]> = {};
        prefixes.forEach(pref => {
          grouped[pref] = [];
        });

        videos.forEach((vid: any) => {
          if (vid.unit) {
            const pref = vid.unit.split(':')[0].trim();
            if (prefixes.includes(pref)) {
              grouped[pref].push(vid);
            }
          }
        });

        for (const pref of prefixes) {
          await gtDb.saveVideos(pref, grouped[pref]);
        }

        console.log("[GlobeTube] Persistent database synchronized with updated videos array.");
        return res.status(200).json({
          success: true,
          message: "Video successfully sorted into syllabus row.",
          videos: videos
        });
      }

      return res.status(400).json({ error: "Invalid request payload." });
    } catch (err: any) {
      console.error("[GlobeTube] POST /api/videos failed:", err);
      res.status(500).json({ error: err.message || "Failed to update persistent storage." });
    }
  });

  app.patch("/api/globetube/videos/:id/toggle-lock", async (req, res) => {
    try {
      if (!gtDb) {
        throw new Error("Database connection not initialized.");
      }

      const { id } = req.params;
      const { teacherCode } = req.body;
      const allowedTeacherCodes = ["SKN", "JTE", "SMK", "JBO", "SSH", "LLE", "CMA", "CHE"];

      if (!teacherCode || !allowedTeacherCodes.includes(teacherCode.toUpperCase())) {
        return res.status(403).json({ error: "Access Denied", details: "Unauthorized teacher credentials." });
      }

      const newStatus = await gtDb.toggleLock(id);
      return res.status(200).json({ success: true, is_locked: newStatus });
    } catch (err: any) {
      console.error("[GlobeTube] PATCH /api/globetube/videos/:id/toggle-lock failed:", err);
      res.status(500).json({ error: err.message || "Failed to toggle video lock status." });
    }
  });

  // ==========================================
  // GEOGRAPHY TEXTBOOK VIEWER ENDPOINTS
  // ==========================================

  // Get list of uploaded textbooks
  app.get("/api/textbooks", (req, res) => {
    try {
      const files = fs.readdirSync(textbooksDir);
      const pdfFiles = files.filter(f => f.toLowerCase().endsWith(".pdf"));
      const list = pdfFiles.map(name => ({
        name,
        url: `/textbooks/${encodeURIComponent(name)}`
      }));
      res.json(list);
    } catch (err: any) {
      console.error("[Textbook] GET /api/textbooks failed:", err);
      res.status(500).json({ error: err.message || "Failed to list textbooks." });
    }
  });

  // Upload a textbook PDF
  app.post("/api/textbooks", upload.single("textbookFile"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileName = req.file.originalname;
      const targetPath = path.join(textbooksDir, fileName);

      fs.writeFileSync(targetPath, req.file.buffer);
      console.log(`[Textbook] Saved uploaded textbook: ${fileName}`);

      res.json({
        name: fileName,
        url: `/textbooks/${encodeURIComponent(fileName)}`
      });
    } catch (err: any) {
      console.error("[Textbook] POST /api/textbooks failed:", err);
      res.status(500).json({ error: err.message || "Failed to upload textbook." });
    }
  });

  // Delete a textbook PDF
  app.delete("/api/textbooks/:name", (req, res) => {
    try {
      const { name } = req.params;
      const targetPath = path.join(textbooksDir, name);

      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        console.log(`[Textbook] Deleted textbook file: ${name}`);
      }

      // Also clean up all bookmarks for this textbook
      const stmt = textbookDb.prepare("DELETE FROM textbook_bookmarks WHERE docName = ?");
      stmt.run(name);
      console.log(`[Textbook] Purged bookmarks for textbook: ${name}`);

      res.json({ success: true });
    } catch (err: any) {
      console.error("[Textbook] DELETE /api/textbooks failed:", err);
      res.status(500).json({ error: err.message || "Failed to delete textbook." });
    }
  });

  // Get user-scoped bookmarks
  app.get("/api/textbooks/bookmarks", (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId query parameter is required" });
      }

      const stmt = textbookDb.prepare("SELECT * FROM textbook_bookmarks WHERE userId = ?");
      const rows = stmt.all(userId);
      res.json(rows);
    } catch (err: any) {
      console.error("[Textbook Bookmarks] GET failed:", err);
      res.status(500).json({ error: err.message || "Failed to fetch bookmarks." });
    }
  });

  // Create user-scoped bookmark
  app.post("/api/textbooks/bookmarks", (req, res) => {
    try {
      const { userId, docName, page, x, y, note } = req.body;
      if (!userId || !docName || page === undefined || x === undefined || y === undefined || !note) {
        return res.status(400).json({ error: "Missing required bookmark fields." });
      }

      const createdAt = new Date().toLocaleTimeString();
      const stmt = textbookDb.prepare(`
        INSERT INTO textbook_bookmarks (userId, docName, page, x, y, note, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(userId, docName, page, x, y, note, createdAt);

      res.status(201).json({
        id: result.lastInsertRowid,
        userId,
        docName,
        page,
        x,
        y,
        note,
        createdAt
      });
    } catch (err: any) {
      console.error("[Textbook Bookmarks] POST failed:", err);
      res.status(500).json({ error: err.message || "Failed to create bookmark." });
    }
  });

  // Update user-scoped bookmark note
  app.put("/api/textbooks/bookmarks/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { userId, note } = req.body;
      if (!userId || !note) {
        return res.status(400).json({ error: "userId and note are required." });
      }

      // Ensure the bookmark belongs to the user
      const checkStmt = textbookDb.prepare("SELECT userId FROM textbook_bookmarks WHERE id = ?");
      const row = checkStmt.get(id) as { userId: string } | undefined;
      if (!row) {
        return res.status(404).json({ error: "Bookmark not found." });
      }
      if (row.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You do not own this bookmark." });
      }

      const updateStmt = textbookDb.prepare("UPDATE textbook_bookmarks SET note = ? WHERE id = ?");
      updateStmt.run(note, id);

      res.json({ success: true });
    } catch (err: any) {
      console.error("[Textbook Bookmarks] PUT failed:", err);
      res.status(500).json({ error: err.message || "Failed to update bookmark." });
    }
  });

  // Delete user-scoped bookmark
  app.delete("/api/textbooks/bookmarks/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId query parameter is required." });
      }

      // Ensure the bookmark belongs to the user
      const checkStmt = textbookDb.prepare("SELECT userId FROM textbook_bookmarks WHERE id = ?");
      const row = checkStmt.get(id) as { userId: string } | undefined;
      if (!row) {
        return res.status(404).json({ error: "Bookmark not found." });
      }
      if (row.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You do not own this bookmark." });
      }

      const deleteStmt = textbookDb.prepare("DELETE FROM textbook_bookmarks WHERE id = ?");
      deleteStmt.run(id);

      res.json({ success: true });
    } catch (err: any) {
      console.error("[Textbook Bookmarks] DELETE failed:", err);
      res.status(500).json({ error: err.message || "Failed to delete bookmark." });
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
