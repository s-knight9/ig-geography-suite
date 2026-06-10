import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import multer from 'multer';
import mammoth from 'mammoth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const upload = multer({ storage: multer.memoryStorage() });

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.post(['/api/generate', '/api/dse/generate'], upload.array('files'), async (req, res) => {
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
                  const pdfParseModule = await import('pdf-parse');
                  const PDFParse = (pdfParseModule as any).PDFParse || (pdfParseModule as any).default?.PDFParse;
                  if (PDFParse) {
                      const parser = new PDFParse({ data: file.buffer });
                      try {
                        const data = await parser.getText();
                        documentTexts += `\n--- Document: ${file.originalname} ---\n${data.text}\n`;
                      } finally {
                        await parser.destroy();
                      }
                  } else {
                      // Fallback for older pdf-parse versions
                      const pdf = (pdfParseModule as any).default || pdfParseModule;
                      const data = await pdf(file.buffer);
                      documentTexts += `\n--- Document: ${file.originalname} ---\n${data.text}\n`;
                  }
              } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/msword') {
                  const result = await mammoth.extractRawText({ buffer: file.buffer });
                  documentTexts += `\n--- Document: ${file.originalname} ---\n${result.value}\n`;
              } else {
                  // assume text
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

      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-pro',
        contents: combinedInput,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || 'Failed to generate DSE.' });
    }
  });

  app.post(['/api/export-docx', '/api/dse/export-docx'], async (req, res) => {
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler to ensure JSON responses for API errors (e.g. from multer)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error Handler Stack:", err.stack);
    if (req.path.startsWith('/api/')) {
        res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    } else {
        next(err);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
