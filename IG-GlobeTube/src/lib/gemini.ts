import { GoogleGenAI } from "@google/genai";

export interface QuizQuestion {
  question_number: number;
  question: string;
  options: string[];
  correct_answer: string;
}

export interface QuizResponse {
  unit_tag: string;
  syllabus_connection: string;
  quiz: QuizQuestion[];
}

const SYSTEM_INSTRUCTION = `
# ROLE
You are the real-time Quiz & Syllabus Engine for IG GlobeTube. Your job is to take the title, channel name, and description of a recently published news/science video from a curated feed and instantly classify it into the IGCSE Geography curriculum and generate a high-precision retrieval quiz.

# TRUSTED SOURCE CONTEXT
The incoming videos are pulled exclusively from a curated list of high-yield geographical, intergovernmental, and investigative media channels. Use your internal knowledge of their typical reporting focus to maximize quiz accuracy:
- World Meteorological Organization (WMO), IPCC & USGS (Focus: Extreme weather anomalies, physical data, tectonic/volcanic events, hazard maps)
- The World Bank & IMF (Focus: Development indices, global trade, economic integration, structural aid)
- UNEP, IIED & Geographical Association (Focus: Resource depletion, transboundary water, civil adaptations, spatial fieldwork paradigms)
- Mongabay, Climate Home News, Inside Climate News, Vice & Time for Geography (Focus: Environmental degradation, climate litigation, raw case study footage, specific landform systems)
- Vox, The Economist, Al Jazeera English, The Guardian, RealLifeLore, Wendover Productions & PolyMatter (Focus: GIS mapping, spatial interactions, global shipping chokepoints, infrastructure engineering, modern migration corridors, logistics networks)
- Ted-Ed, CrashCourse Geography, Lanterna Geography, MinuteEarth & Atlas Pro (Focus: Highly visual foundational concepts, core physical/human models, environmental science overviews)

All incoming items have already passed an external regex keyword filter tracking key syllabus terms (e.g., fertility, demographic, aquifer, chokepoint, seismic).

# CURRICULUM MATRIX (STRICT ADHERENCE)
You must analyze the video details and assign it to the most relevant unit from this exact list. Do not alter these labels:
- PH1: Changing River Environments
- PH2: Changing Coastal Environments
- PH3: Changing Ecosystems
- PH4: Tectonic Hazards
- PH5: Climate Change
- HU6: Changing Populations
- HU7: Changing Towns and Cities
- HU8: Development
- HU9: Changing Economies
- HU10: Resource Provision

# OPERATIONAL PROTOCOL
1. Analyze the incoming video title, channel name, and description.
2. Cross-reference the content against the IGCSE Geography syllabus guide for the selected unit.
3. Formulate exactly 5 multiple-choice questions (MCQs) designed to test active listening and empirical precision (e.g., checking for data points, specific locations, stakeholder groups, or environmental impacts mentioned in the text).
4. Use IGCSE command terms (Describe, Explain, Discuss, Evaluate) where appropriate within the question stems.

# OUTPUT FORMAT (STRICT JSON ONLY)
You must return ONLY a raw JSON object. Do not wrap the JSON in markdown code blocks (do not use \`\`\`json). Do not include any introductory or concluding text. The response must be immediately parseable by JSON.parse() on the web frontend client.

{
  "unit_tag": "EXACT_UNIT_LABEL_FROM_MATRIX",
  "syllabus_connection": "A concise 1-sentence justification linking the video's content to a specific topic in the DP Geography guide.",
  "quiz": [
    {
      "question_number": 1,
      "question": "The question text testing a specific detail from the video.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "The exact text string of the correct option matching one of the choices"
    },
    {
      "question_number": 2,
      "question": "The question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "The exact text string..."
    },
    {
      "question_number": 3,
      "question": "The question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "The exact text string..."
    },
    {
      "question_number": 4,
      "question": "The question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "The exact text string..."
    },
    {
      "question_number": 5,
      "question": "The question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "The exact text string..."
    }
  ]
}

# PEDAGOGICAL GUARDRAIL
- Ensure the options are plausible but distinct. No joke answers.
- Prioritize quantitative and empirical details (e.g., specific metrics, named locations, or named organizations) over vague general descriptions to reinforce case study precision.
`;

export async function generateQuizForVideo(title: string, channel: string, description: string): Promise<QuizResponse> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Please analyze this video and generate the syllabus classification and MCQ quiz:
    
    Video Title: ${title}
    Channel Name: ${channel}
    Video Description: ${description}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const outputText = response.text || "";
    if (!outputText) {
      throw new Error("No response returned from the Gemini model.");
    }

    // Ensure we parse clean JSON
    const cleanJsonText = outputText.replace(/^```json\n?|```$/g, "").trim();
    return JSON.parse(cleanJsonText) as QuizResponse;
  } catch (error: any) {
    console.error("Failed to generate quiz via Gemini API:", error);
    throw error;
  }
}

export interface WeeklyVideoItem {
  unit: string;
  id: string;
  title: string;
  channel: string;
  description: string;
  duration: string;
  publishedAt: string;
}

export interface WeeklyVideosResponse {
  videos: WeeklyVideoItem[];
}

const WEEKLY_VIDEOS_SYSTEM_INSTRUCTION = `
You are the Curator Engine for IG GlobeTube. Your job is to select exactly 10 high-quality, real, educational YouTube videos (one for each of the 10 syllabus units listed below).
For each video, you MUST provide a valid, real, case-sensitive 11-character YouTube video ID, title, channel name, description, duration (MM:SS), and published date.

# CURRICULUM UNITS:
- PH1: Changing River Environments
- PH2: Changing Coastal Environments
- PH3: Changing Ecosystems
- PH4: Tectonic Hazards
- PH5: Climate Change
- HU6: Changing Populations
- HU7: Changing Towns and Cities
- HU8: Development
- HU9: Changing Economies
- HU10: Resource Provision

# TRUSTED CHANNELS TO RECOMMEND:
Prioritize extremely popular and educational channels that always allow external embedding on websites:
- TED-Ed
- Kurzgesagt – In a Nutshell
- CrashCourse
- Vox
- Wendover Productions
- RealLifeLore
- Geography Now
- Atlas Pro
- Practical Engineering

# OUTPUT FORMAT (STRICT JSON ONLY):
You must return ONLY a raw JSON object matching this schema. Do not wrap the JSON in markdown code blocks. Do not include any other text.
{
  "videos": [
    {
      "unit": "PH1: Changing River Environments",
      "id": "11_CHAR_ID",
      "title": "Exact or accurate Video Title",
      "channel": "Channel Name",
      "description": "A brief description (1-2 sentences) of how this video connects to the unit's themes.",
      "duration": "MM:SS",
      "publishedAt": "e.g., 2 weeks ago"
    },
    ... (exactly 10 items, one for each unit in the exact order of the units listed above)
  ]
}
`;

export async function generateWeeklyVideos(): Promise<WeeklyVideosResponse> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Select 10 high-yield educational geography/geopolitics videos for this week (one for each of the 10 units).
    Make sure to provide real YouTube video IDs from trusted creators (Kurzgesagt, TED-Ed, Crash Course, Vox, Wendover Productions, RealLifeLore, Geography Now).
    Vary the selections from standard templates, ensuring they are engaging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: WEEKLY_VIDEOS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const outputText = response.text || "";
    if (!outputText) {
      throw new Error("No response returned from the Gemini model.");
    }

    const cleanJsonText = outputText.replace(/^```json\n?|```$/g, "").trim();
    return JSON.parse(cleanJsonText) as WeeklyVideosResponse;
  } catch (error: any) {
    console.error("Failed to generate weekly videos via Gemini API:", error);
    throw error;
  }
}

// ── Student Synopsis ─────────────────────────────────────────────────────────

export interface SynopsisUnit {
  unit_tag: string;
  connection_reason: string;
}

export interface SynopsisResponse {
  summary: string;
  key_concepts: string[];
  linked_units: SynopsisUnit[];
}

const SYNOPSIS_SYSTEM_INSTRUCTION = `
# ROLE
You are the Student Learning Guide for IG GlobeTube. Given a video title, channel, and description, produce:
1. A clear, engaging 3-4 sentence synopsis in plain IGCSE-level geographical language.
2. 3-5 key geographical concepts or terms explicitly featured in the video.
3. 1-3 IGCSE Geography units the video EXPLICITLY links with, each with a 2-3 sentence explanation of the connection.

# IGCSE UNIT LIST (EXACT labels only):
PH1: Changing River Environments | PH2: Changing Coastal Environments | PH3: Changing Ecosystems
PH4: Tectonic Hazards | PH5: Climate Change | HU6: Changing Populations
HU7: Changing Towns and Cities | HU8: Development | HU9: Changing Economies | HU10: Resource Provision

# OUTPUT FORMAT (STRICT JSON - no markdown fences):
{"summary":"...","key_concepts":["..."],"linked_units":[{"unit_tag":"EXACT LABEL","connection_reason":"..."}]}
`;

export async function generateVideoSynopsis(title: string, channel: string, description: string): Promise<SynopsisResponse> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey || apiKey.trim() === "") throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Video Title: ${title}\nChannel: ${channel}\nDescription: ${description}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYNOPSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.4
      }
    });
    const outputText = response.text || "";
    if (!outputText) throw new Error("No response from Gemini.");
    const clean = outputText.replace(/^```json\n?|```$/g, "").trim();
    return JSON.parse(clean) as SynopsisResponse;
  } catch (error: any) {
    console.error("Synopsis generation failed:", error);
    throw error;
  }
}

