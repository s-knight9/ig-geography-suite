import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import cors from "cors";
import { initDb, getFolders, createFolder, deleteFolder, getScaffolds, saveScaffold, deleteScaffold } from "./src/server/db.ts";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Initialize Vault DB
  try {
    initDb();
    console.log("Vault Database initialized.");
  } catch (error) {
    console.error("Failed to initialize Vault Database:", error);
  }

  // Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set.");
  } else {
    console.log("GEMINI_API_KEY is configured (Length: " + apiKey.length + ")");
  }

  const ai = new GoogleGenAI({ 
    apiKey: apiKey || "MISSING_KEY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 60000, // 60s timeout
    }
  });

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

    // API Route for generating scaffold
    app.post("/api/generate", upload.single('attachment'), async (req: any, res) => {
      const requestId = Math.random().toString(36).substring(7);
      console.log(`[${requestId}] Scaffold generation started`);
      
      if (!apiKey) {
        console.error(`[${requestId}] Aborting: No API key`);
        return res.status(500).json({ 
          error: "Configuration Error", 
          details: "Gemini API key is missing. Please add it in Settings > Secrets." 
        });
      }

      try {
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
          attachmentContext = req.file.buffer.toString('utf-8');
          console.log("Attachment read successfully");
        } catch (e) {
          console.error("Failed to read attachment:", e);
        }
      }

      const systemInstruction = `
        # PERSONA & OBJECTIVE
        You are the AI engine powering "IGCSE Student Scaffold," an expert educational assistant designed exclusively for Cambridge IGCSE Geography students. 
        Your role is to build structural blueprints and/or writing frames.

        # OUTPUT FORMAT
        You MUST return a JSON object. 
        
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

        console.log(`[${requestId}] Requesting Gemini (gemini-3.5-flash)...`);
        
        let promptText = `Environment: Paper ${paperType}, ${targetMarks} marks, ${framework} framework.\n`;
        promptText += `Student Question: "${question}"\n`;
        promptText += `Keywords: "${keywords}"\n`;
        
        if (mode === 'scaffold') {
          promptText += `TASK: Generate ONLY the detailed structural scaffold.`;
        } else if (mode === 'frame') {
          promptText += `TASK: Generate ONLY the writing frame with sentence starters.`;
        } else {
          promptText += `TASK: Generate BOTH the scaffold and the writing frame.`;
        }
        
        const interaction = await ai.interactions.create({
          model: "gemini-3.5-flash",
          input: promptText,
          system_instruction: systemInstruction,
          generation_config: {
            temperature: 0.7,
          }
        });

        console.log(`[${requestId}] Gemini responded`);

        // Combine text from all model_output steps
        let fullOutput = "";
        for (const step of interaction.steps) {
          if (step.type === 'model_output') {
            const textContent = step.content?.find(c => c.type === 'text');
            if (textContent && textContent.text) {
              fullOutput += textContent.text;
            }
          }
        }

        if (!fullOutput) {
          throw new Error("The AI returned an empty response.");
        }

        let scaffold = "";
        let writingFrame = "";

        try {
          // Since we used response_mime_type: "application/json", it should be clean JSON
          const parsedData = JSON.parse(fullOutput);
          scaffold = parsedData.scaffold || "";
          writingFrame = parsedData.writingFrame || "";
        } catch (parseError) {
          console.error(`[${requestId}] JSON Parse Error:`, parseError);
          // Fallback extraction
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
        
        res.setHeader('Content-Type', 'application/json');
        res.json({ scaffold, writingFrame });
        console.log(`[${requestId}] Successfully sent response`);
      } catch (error: any) {
        console.error(`[${requestId}] Generation Error:`, error);
        
        const status = error.status || 500;
        const message = error.message || "Failed to generate content";
        
        if (!res.headersSent) {
          res.status(status).json({ 
            error: "Generation Failed",
            details: message
          });
        }
      }
    });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Express Unhandled Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server Error", details: err.message });
    }
  });

  // ==========================================
  // VAULT ENDPOINTS
  // ==========================================
  app.get("/api/vault/folders", (req, res) => {
    try {
      const { teacherCode } = req.query;
      if (!teacherCode) return res.status(400).json({ error: "teacherCode required" });
      const folders = getFolders(teacherCode as string);
      res.json({ folders });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/vault/folders", (req, res) => {
    try {
      const { id, teacherCode, name, parentId } = req.body;
      if (!teacherCode || !name || !id) return res.status(400).json({ error: "Missing required fields" });
      const folder = createFolder(id, teacherCode, name, parentId || null);
      res.json({ folder });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/vault/folders/:id", (req, res) => {
    try {
      const { teacherCode } = req.query;
      if (!teacherCode) return res.status(400).json({ error: "teacherCode required" });
      const success = deleteFolder(req.params.id, teacherCode as string);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/vault/scaffolds", (req, res) => {
    try {
      const { teacherCode } = req.query;
      if (!teacherCode) return res.status(400).json({ error: "teacherCode required" });
      const scaffolds = getScaffolds(teacherCode as string);
      res.json({ scaffolds });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/vault/scaffolds", (req, res) => {
    try {
      const { id, teacherCode, folder_id, title, paperType, targetMarks, framework, question, scaffold_text, frame_text, tags } = req.body;
      if (!id || !teacherCode || !folder_id || !title) return res.status(400).json({ error: "Missing required fields" });
      const scaffold = saveScaffold(id, teacherCode, folder_id, title, paperType || "", targetMarks || "", framework || "", question || "", scaffold_text || "", frame_text || "", tags || "");
      res.json({ scaffold });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/vault/scaffolds/:id", (req, res) => {
    try {
      const { teacherCode } = req.query;
      if (!teacherCode) return res.status(400).json({ error: "teacherCode required" });
      const success = deleteScaffold(req.params.id, teacherCode as string);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
