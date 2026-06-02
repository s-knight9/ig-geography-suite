import express from "express";
import path from "path";
import multer from "multer";
import * as pdfParseModule from "pdf-parse";
const pdf = (pdfParseModule as any).default || pdfParseModule;
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // IA Moderation Endpoint (Text payload instead of file)
  app.post("/api/analyze-ia-text", async (req, res) => {
    try {
      const { text, subject = 'Geography' } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

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

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
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

  // IA Comparison Endpoint
  app.post("/api/compare-ias-text", async (req, res) => {
    try {
      const { text1, text2, mode, subject = 'Geography' } = req.body;
      if (!text1 || !text2) {
        return res.status(400).json({ error: "Two texts must be provided" });
      }

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

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
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

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
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

      // Basic text extraction from buffer
      // Note: pdf-parse returns a promise that resolves to an object with text
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

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
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

  // Vite middleware for development
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
