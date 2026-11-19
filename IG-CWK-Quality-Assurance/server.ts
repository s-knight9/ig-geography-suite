import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import {
  analyzeCourseworkCompleteness,
  formatCompletenessPreScanForPrompt,
  buildCwkEvaluationSystemPrompt,
  postProcessEvaluationResult,
} from "./src/utils/cwkGradingRules";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));

  // Handle Payload Too Large errors explicitly
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err && err.type === 'entity.too.large') {
      console.error("Payload too large error hit!");
      return res.status(413).json({ error: "File to large to process on the backend. Please shrink your document." });
    }
    next(err);
  });

  // Proxy for PDFs to avoid Firebase Storage CORS blocks in pdfjs-dist
  app.get("/api/proxy-pdf", async (req, res) => {
    try {
      const pdfUrl = req.query.url as string;
      if (!pdfUrl) {
        return res.status(400).json({ error: "Missing url parameter" });
      }
      const pdfRes = await fetch(pdfUrl);
      if (!pdfRes.ok) {
        return res.status(pdfRes.status).json({ error: "Failed to fetch PDF" });
      }
      const buffer = Buffer.from(await pdfRes.arrayBuffer());
      res.setHeader("Content-Type", pdfRes.headers.get("content-type") || "application/pdf");
      res.setHeader("Cache-Control", "private, max-age=300");
      res.send(buffer);
    } catch (error: any) {
      console.error("Proxy PDF error:", error);
      res.status(500).json({ error: "Failed to proxy PDF: " + error.message });
    }
  });

  app.post("/api/evaluate", async (req, res) => {
    // Send headers immediately to start the response and avoid proxy timeouts
    res.setHeader("Content-Type", "application/json");
    res.status(200); // We must use 200 since we are starting the stream
    
    // Send a space character every 10 seconds to keep the connection alive
    const keepAliveInterval = setInterval(() => {
      res.write(" ");
    }, 10000);

    try {
      let text = req.body.text; // Might be text or data URL

      let preScanSummary = "";
      let contentsPayload: any[] = [];
      if (text && text.startsWith("data:")) {
        const matches = text.match(/^data:(.+?);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          console.log(`Received base64 file with mime type: ${mimeType}`);
          let segmentedPageText = "";
          if (mimeType === "application/pdf") {
            try {
              const parser = new PDFParse({ data: Buffer.from(base64Data, "base64") });
              try {
                const parsed = await parser.getText();
                if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
                  segmentedPageText = parsed.pages
                    .map((p: any) => `=== PAGE ${p.num} ===\n${p.text || ""}`)
                    .join("\n\n");
                }
              } finally {
                await parser.destroy();
              }
            } catch (pdfErr) {
              console.warn("Could not extract segmented pages from base64 PDF:", pdfErr);
            }
          }
          if (segmentedPageText) {
            preScanSummary = formatCompletenessPreScanForPrompt(
              analyzeCourseworkCompleteness(segmentedPageText)
            );
          }
          const systemPrompt = buildCwkEvaluationSystemPrompt(preScanSummary);
          contentsPayload = [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            ...(segmentedPageText ? [segmentedPageText] : []),
            systemPrompt
          ];
        } else {
          const systemPrompt = buildCwkEvaluationSystemPrompt();
          contentsPayload = [text, systemPrompt];
        }
      } else {
        // Prevent exceeding token limits by truncating fallback text
        if (text && text.length > 500000) {
          console.warn("Input text extremely large, truncating to 500k characters.");
          text = text.substring(0, 500000);
        }
        if (text && typeof text === "string" && text.trim()) {
          preScanSummary = formatCompletenessPreScanForPrompt(
            analyzeCourseworkCompleteness(text)
          );
        }
        const systemPrompt = buildCwkEvaluationSystemPrompt(preScanSummary);
        contentsPayload = [text, systemPrompt];
      }

      console.log("Sending prompt to Gemini API...", new Date().toISOString());
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: contentsPayload,
        config: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192
        }
      });
      
      console.log("Received response from Gemini API...", new Date().toISOString());
      if (!response.text) throw new Error("No text in response");
      
      let rawText = response.text.trim();
      // Sometimes models return markdown even with JSON response type
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      let result;
      try {
        result = postProcessEvaluationResult(JSON.parse(rawText));
      } catch (e) {
        console.error("Failed to parse JSON:", rawText);
        throw new Error("Model returned invalid JSON");
      }
      
      clearInterval(keepAliveInterval);
      res.write(JSON.stringify(result));
      res.end();
      
    } catch (error: any) {
      console.error("Evaluation caught error:", error);
      clearInterval(keepAliveInterval);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Failed to evaluate coursework." });
      } else {
        // Headers already sent, so we must just write the error as JSON and end
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
  "cwk1_total_score": number, // total score out of 60 for cwk1
  "cwk2_total_score": number, // total score out of 60 for cwk2
  "moderator_executive_summary": "string (a comparative executive summary of CWK 1 vs CWK 2)",
  "academic_integrity_report": "string (Similarities Report: highlight any identical phrasing, shared raw data anomalies, or potential collusion)",
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

      console.log("Sending compare prompt to Gemini API...");
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: contentsPayload,
        config: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192
        }
      });
      
      if (!response.text) throw new Error("No text in response");
      
      let rawText = response.text.trim();
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (e) {
        throw new Error("Model returned invalid JSON");
      }
      
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

      console.log("Sending class feedback prompt to Gemini API...", new Date().toISOString());
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          JSON.stringify(evaluations),
          systemPrompt
        ],
        config: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192
        }
      });
      
      console.log("Received class feedback response from Gemini API...", new Date().toISOString());
      if (!response.text) throw new Error("No text in response");
      
      let rawText = response.text.trim();
      if (rawText.startsWith('\`\`\`json')) {
        rawText = rawText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
      } else if (rawText.startsWith('\`\`\`')) {
        rawText = rawText.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
      }
      
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (e) {
        console.error("Failed to parse JSON:", rawText);
        throw new Error("Model returned invalid JSON");
      }
      
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  
  server.setTimeout(300000); // 5 minutes
}

startServer();
