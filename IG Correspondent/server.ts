import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Parser from 'rss-parser';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { getTodayPolls, castVote, hasPollsForToday, savePolls, getPollDateKST, tagText, getManualHeadlineTags, saveManualHeadlineTags, learnKeywordsFromHeadline, getManualPollTags, saveManualPollTags, getPollQuestion } from './src/server/db.ts';

dotenv.config();

const app = express();
app.use(express.json());

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
    logo: 'https://assets.guim.co.uk/images/favicons/451963d1144664f582a6673b16b5f171/64x64.png',
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
    logo: 'https://www.economist.com/engassets/google-search-logo.f1ea908894.png',
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
    logo: 'https://im.ft-static.com/m/icons/favicon-32x32.ico',
    feeds: [
      'https://www.ft.com/world?format=rss',
      'https://www.ft.com/global-economy?format=rss'
    ]
  },
  {
    id: 'ap',
    name: 'Associated Press',
    color: '#ff322e',
    logo: 'https://assets.apnews.com/fa/favicon/favicon-32x32.png',
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
    logo: 'https://www.aljazeera.com/favicon_aje.ico',
    feeds: [
      'https://www.aljazeera.com/xml/rss/all.xml'
    ]
  },
  {
    id: 'scmp',
    name: 'SOUTH CHINA MORNING POST',
    color: '#f9dd16',
    textColor: '#000000',
    logo: 'https://assets-v2.scmp.com/static/common/favicon/favicon-32x32.png',
    feeds: [
      'https://news.google.com/rss/search?q=source:South_China_Morning_Post+climate+change&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=source:South_China_Morning_Post+population+migration&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=source:South_China_Morning_Post+urbanisation+cities&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=source:South_China_Morning_Post+development+poverty&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=source:South_China_Morning_Post+energy+resources+food&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=source:South_China_Morning_Post+earthquake+volcano+flood&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=source:South_China_Morning_Post+environment+ecosystem+deforestation&hl=en-US&gl=US&ceid=US:en'
    ]
  },
  {
    id: 'nyt',
    name: 'NY Times',
    color: '#000000',
    logo: 'https://www.nytimes.com/vi-assets/static-assets/favicon-4bf96cb6a1ef3da5703cec68cf4a61ca.ico',
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
    logo: 'https://mongabay-images.s3.amazonaws.com/news/mongabay-logo-200x200.jpg',
    feeds: ['https://news.mongabay.com/feed/']
  },
  {
    id: 'bbc',
    name: 'BBC News',
    color: '#bb1919',
    logo: 'https://static.bbci.co.uk/wwhp/1.180.0/responsive/img/apple-touch/apple-touch-180.jpg',
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
    logo: 'https://www.reuters.com/pf/resources/images/reuters/logo-vertical-default.png?d=116',
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
    logo: 'https://static.euronews.com/articles/stories/07/49/01/44/1200x675_cmsv2_7df04fd5-1d2e-5b9e-80fa-e24b3a30dc31-7490144.jpg',
    feeds: [
      'https://www.euronews.com/rss?level=vertical&name=earth',
      'https://www.euronews.com/rss?level=vertical&name=travel',
      'https://www.euronews.com/rss?level=vertical&name=business',
      'https://www.euronews.com/rss?name=news'
    ]
  }
];

async function tagHeadlines(headlines: string[]): Promise<Record<string, string[]>> {
  const tagsMapResult: Record<string, string[]> = {};
  headlines.forEach(headline => {
    tagsMapResult[headline] = tagText(headline);
  });
  return tagsMapResult;
}

async function generateDailyPolls(headlines: any[]): Promise<any[]> {
  if (!headlines.length || !process.env.GEMINI_API_KEY) return [];

  try {
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
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
        // Return cached data WITH outlet metadata so name/color/logo are never lost
        return { id: outlet.id, name: outlet.name, color: outlet.color, textColor: outlet.textColor || '#ffffff', logo: outlet.logo, data: cached.data, fromCache: true };
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
      
      const STORIES_PER_OUTLET = 8;
      let filteredItems = outlet.filter ? uniqueItems.filter(outlet.filter) : uniqueItems;
      const limitedItems = filteredItems.slice(0, STORIES_PER_OUTLET);

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
      // ── Cached outlet: the stored data is the complete outletData object ──────
      if (outlet.fromCache) {
        finalResults[outlet.id] = outlet.data;
        return;
      }

      // ── Fresh outlet: assemble, cache, then store ─────────────────────────────
      const itemsWithTags = outlet.items.map((item: any) => {
        const cleanTitle = item.title.replace(/#\w+:\s*[^#]+/g, '').trim();
        let tags = getManualHeadlineTags(cleanTitle) || getManualHeadlineTags(item.title);
        if (tags === null) {
          tags = tagsMap[item.title] || tagText(item.title) || [];
        }
        const hashtags = tags.map((t: string) => `#${t}`).join(' ');
        const finalTitle = hashtags ? `${cleanTitle} ${hashtags}` : cleanTitle;
        return {
          title: finalTitle,
          link: item.link,
          pubDate: item.pubDate,
          tags: tags
        };
      });

      const outletData = {
        name: outlet.name,
        color: outlet.color,
        textColor: outlet.textColor || '#ffffff',
        logo: outlet.logo,
        items: itemsWithTags
      };

      cache[outlet.id] = { timestamp: Date.now(), data: outletData };
      finalResults[outlet.id] = outletData;
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

app.post('/api/news/tag', (req: any, res: any) => {
  const { headline, tags, teacherCode } = req.body;
  if (!teacherCode) {
    return res.status(401).json({ error: 'Unauthorized: Only teachers can tag headlines.' });
  }
  if (!headline || !tags) {
    return res.status(400).json({ error: 'Missing headline or tags.' });
  }

  try {
    const cleanTitle = headline.replace(/#\w+:\s*[^#]+/g, '').trim();
    saveManualHeadlineTags(cleanTitle, tags);
    learnKeywordsFromHeadline(cleanTitle, tags);
    
    // Clear cache so that the news feed is immediately updated on refresh
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/polls/tag', (req: any, res: any) => {
  const { pollId, tags, teacherCode } = req.body;
  if (!teacherCode) {
    return res.status(401).json({ error: 'Unauthorized: Only teachers can tag polls.' });
  }
  if (!pollId || !tags) {
    return res.status(400).json({ error: 'Missing pollId or tags.' });
  }

  try {
    saveManualPollTags(pollId, tags);
    
    // Learn keywords from the poll question
    const question = getPollQuestion(pollId);
    if (question) {
      const cleanQuestion = question.replace(/#\w+:\s*[^#]+/g, '').trim();
      learnKeywordsFromHeadline(cleanQuestion, tags);
    }

    // Clear cache so news feed is also updated with learned keywords
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
