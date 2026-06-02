import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Configuration
  app.use(express.json());

  // Image Upload and Generation API
  app.post("/api/generate", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
      }

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

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
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
        config: {
          responseMimeType: "application/json",
          temperature: 0.2, // low temp for structured and objective output
        },
      });

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

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
