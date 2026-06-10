import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for generating the questions and mark schemes
  app.post(["/api/generate", "/api/highfive/generate"], async (req, res) => {
    try {
      const { paper, topic, commandWord, customFocus } = req.body;

      if (!paper || !topic || !commandWord) {
        return res.status(400).json({ error: "Missing required parameters." });
      }

      const systemInstruction = `You are an architect tasked to develop a specialized engine for the Cambridge IGCSE Geography (0460) 2027-2029 syllabus named: IGCSE 0460 HIGH 5. You generate exam-standard questions and resources based on the specific Paper, Topic, and Command Word.
      
Content Constraints Terminology:
- Strictly use HIC, MIC, and LIC. Never use "MEDC" or "LEDC".
- Instead of posing generic phrases like 'An MIC' or 'An LIC' in questions, you MUST actually name a specific, real-world country (e.g., Vietnam, Kenya).
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

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
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
        },
      });

      const textOutput = response.text || "{}";
      const jsonStr = textOutput.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
      const result = JSON.parse(jsonStr);

      res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
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
    // Static files in production
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
