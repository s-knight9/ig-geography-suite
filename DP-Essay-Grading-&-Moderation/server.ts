import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// ... rest of the code ...

const OCR_SYSTEM_INSTRUCTION = `
You are an expert OCR and handwriting transcription assistant. 
Your task is to transcribe student work from images (scanned PDFs or photos of handwritten essays).

-   Transcribe the text EXACTLY as written.
-   Preserve paragraphs and line breaks.
-   If you encounter a word that is completely illegible, use [illegible].
-   Do not add any preamble or commentary; only return the transcribed text.
-   Student work is for geography essays, so expect geographical terminology.
`;

app.post("/api/ocr", async (req, res) => {
  try {
    const { images } = req.body; // Array of base64 strings (with data:image/... prefix)

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Missing images for OCR." });
    }

    const ai = getGenAI();
    
    // Prepare parts for Gemini
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

    let transcription = "";
    let retries = 3;
    let delay = 1000;

    while (retries >= 0) {
      try {
        const result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: { parts },
          config: {
            systemInstruction: OCR_SYSTEM_INSTRUCTION,
          }
        });
        transcription = result.text || "";
        break;
      } catch (err: any) {
        const isRetryable = err?.status === 500 || err?.status === 503 || 
                           err?.status === 429 ||
                           err?.message?.includes('500') || err?.message?.includes('503') ||
                           err?.message?.includes('429') ||
                           err?.message?.includes('INTERNAL') || err?.message?.includes('UNAVAILABLE') ||
                           err?.message?.includes('Too Many Requests');
        
        if (isRetryable && retries > 0) {
          console.warn(`Gemini OCR error (${err?.status || 'INTERNAL'}). Retrying in ${delay}ms... (Attempts left: ${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2;
        } else {
          throw err;
        }
      }
    }

    res.json({ transcription });
  } catch (error: any) {
    console.error("OCR error details:", error);
    res.status(500).json({ error: error.message || "Internal OCR failure" });
  }
});
let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
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

const SYSTEM_INSTRUCTION = `
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

    let feedback = "No feedback generated.";
    let retries = 3;
    let delay = 1000;
    
    while (retries >= 0) {
      try {
        const result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          }
        });
        feedback = result.text || "No feedback generated.";
        break;
      } catch (err: any) {
        // Retry on 500 (Internal) and 503 (Unavailable)
        const isRetryable = err?.status === 500 || err?.status === 503 || 
                           err?.message?.includes('500') || err?.message?.includes('503') ||
                           err?.message?.includes('INTERNAL') || err?.message?.includes('UNAVAILABLE');
        
        if (isRetryable && retries > 0) {
          console.warn(`Gemini API error (${err?.status || 'INTERNAL'}). Retrying in ${delay}ms... (Attempts left: ${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2;
        } else {
          throw err;
        }
      }
    }
    res.json({ feedback });
  } catch (error: any) {
    console.error("Assessment error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
