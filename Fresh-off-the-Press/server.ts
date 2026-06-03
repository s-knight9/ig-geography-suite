import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Parser from 'rss-parser';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { getTodayPolls, castVote, hasPollsForToday, savePolls } from './src/server/db.ts';

dotenv.config();

const app = express();
app.use(express.json());

// Simple middleware to generate a unique-ish hash for anonymous users based on IP
const userTracker = (req: any, res: any, next: any) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  req.userHash = crypto.createHash('md5').update(ip as string).digest('hex');
  next();
};

app.use(userTracker);

const port = 3000;
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const RSS_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const parser = new Parser({
  headers: {
    'User-Agent': RSS_USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  },
  timeout: 15000
});

// Cache structure: Record<outletId, { timestamp: number, data: any }>
const cache: Record<string, { timestamp: number; data: any }> = {};
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute

interface NewsItem {
  title: string;
  link: string;
  outlet: string;
  tags: string[];
}

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
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is missing. Skipping AI tagging.');
    return {};
  }

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
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
            tagsMapResult[item.headline] = item.tags;
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
          await new Promise(resolve => setTimeout(resolve, 3000 * attempts)); // Exponential backoff
          continue;
        }
      }
      console.error('Error in AI tagging:', error.message || error);
      return {};
    }
  }
  return {};
}

// ... existing tagHeadlines function ...

async function generateDailyPolls(headlines: any[]): Promise<any[]> {
  if (!headlines.length || !process.env.GEMINI_API_KEY) return [];

  try {
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
      const cached = cache[outlet.id];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { id: outlet.id, data: cached.data, fromCache: true };
      }

      let allItems: any[] = [];
      const feedPromises = outlet.feeds.map(async (feedUrl) => {
        try {
          // Euronews and some others are sensitive to headers and BOMs
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

          // Handle 403 Forbidden - common with Economist direct feeds
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
          // Trim to fix "Non-whitespace before first tag" errors
          const cleanText = text.trim();
          const feed = await parser.parseString(cleanText);
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

    // Collect headlines that need tagging (only from non-cached outlets)
    const uncachedOutlets = rawOutletsData.filter(o => !o.fromCache);
    const headlineToOriginal = new Map<string, string[]>();
    
    uncachedOutlets.forEach((outlet: any) => {
      outlet.items.forEach((item: any) => {
        // Strip common suffixes from Google News or RSS titles for better AI tagging
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
    // Map tags back to original full headlines
    Object.entries(tagsMapStripped).forEach(([stripped, tags]) => {
      const originals = headlineToOriginal.get(stripped) || [];
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

        cache[outlet.id] = { timestamp: Date.now(), data: outletData };
        finalResults[outlet.id] = outletData;
      }
    });

    res.json(finalResults);
  } catch (error) {
    console.error('General error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Poll Routes
app.get('/api/polls/today', async (req: any, res: any) => {
  try {
    console.log('[API] GET /api/polls/today requested');
    
    if (!hasPollsForToday()) {
      console.log('[API] No polls for today. Attempting to generate from news...');
      // To generate polls, we need some news context.
      // We'll try to find a cached outlet or fetch the first one to get headlines.
      let headlines: any[] = [];
      const firstOutlet = OUTLETS[0];
      const cached = cache[firstOutlet.id];
      
      if (cached) {
        headlines = cached.data.items.map((i: any) => ({ title: i.title, link: i.link }));
      } else {
        // Simple fallback: if nothing cached, we can't generate just yet or we do a quick fetch
        // For now, let's just return empty and wait for news to be fetched by the app
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

app.post('/api/polls/vote', (req: any, res: any) => {
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

async function startServer() {
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

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
