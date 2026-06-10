import 'dotenv/config';
import express from 'express';
import path from 'path';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

const __dirname = path.resolve();

async function startServer() {
  console.log(`[Server] Starting server in ${process.env.NODE_ENV || 'development'} mode...`);
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      engine: 'IGCSE News Room v11.2',
      environment: process.env.NODE_ENV
    });
  });

  app.get('/api/config', (req, res) => {
    // We still want to check if keys are present for diagnostics, 
    // though the frontend will handle the actual call.
    res.json({
      apiKeyDetected: !!(process.env.GEMINI_API_KEY || process.env.API_KEY)
    });
  });

  app.post('/api/newsroom/generate', async (req, res) => {
    try {
      const { prompt, model = 'gemini-2.5-flash' } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No assessment material was generated.');
      }
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Newsroom AI Generation Error:", error);
      res.status(500).json({ error: error.message || 'An error occurred during server-side processing' });
    }
  });

  const processHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { input } = req.body;
      if (!input) {
        return res.status(400).json({ error: 'Input is required' });
      }

      let articleText = input;

      // 1. URL Extraction
      if (input.startsWith('http://') || input.startsWith('https://')) {
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
            throw new Error('Could not parse article from URL');
          }
        } catch (fetchError: any) {
          console.error("URL Extraction Error:", fetchError);
          return res.status(400).json({ error: `URL Extraction Error: ${fetchError.message}` });
        }
      }

      // 2. Extraction Phase (returning raw text for AI to process on client)
      return res.json({ text: articleText });
    } catch (error: any) {
      console.error("Server Error:", error);
      res.status(500).json({ error: error.message || 'An error occurred during server-side processing' });
    }
  };

  app.post('/api/extract', processHandler);
  app.post('/api/process', processHandler);

  // Explicitly handle all other /api routes with a 404 JSON
  app.all('/api/*all', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[Server] Critical startup error:", err);
  process.exit(1);
});
