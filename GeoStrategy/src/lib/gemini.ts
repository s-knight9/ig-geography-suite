import { GoogleGenAI } from "@google/genai";
import { fileToGenerativePart } from "./utils";

export interface EssayInput {
  question: string;
  marks: "10" | "12" | "16";
  keyTerms: string;
  paragraphFocuses: string[];
  conceptualPillars: string[];
  concepts: string[];
  structure: "PEEL" | "PEECAL";
  sources: { url?: string; file?: File; synopsis?: string }[];
  conclusionStance: string;
}

export async function generateEssayPlan(input: EssayInput): Promise<{ plan: string; synopses: Record<string, string> }> {
  let apiKey = process.env.GEOG_APP_KEY_V1 || process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("API_KEY_MISSING");
  }

  // Clean the key: remove quotes and whitespace
  apiKey = apiKey.trim().replace(/^["']|["']$/g, '');

  if (!apiKey.startsWith('AIza')) {
    console.warn("Gemini API Key does not start with 'AIza'. It might be invalid.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const sourceIdentifiers = input.sources.map(s => s.file?.name || s.url).filter(Boolean) as string[];

  const contentParts: any[] = [];
  
  // Add file contents with labels
  for (const source of input.sources) {
    if (source.file) {
      const fileData = await fileToGenerativePart(source.file);
      contentParts.push({ text: `Content of file "${source.file.name}":` });
      contentParts.push({ inlineData: fileData.inlineData });
    }
  }

  const modelName = "gemini-flash-latest";
  
  const prompt = `
    You are an expert IBDP Geography Moderator and Teacher. 
    Your task is to create a detailed ESSAY PLAN based on the student's manual planning inputs.
    
    CRITICAL: Maintain the student's intellectual direction. Do not write the essay for them, but provide a high-level roadmap.
    
    ESSAY PARAMETERS:
    - Question: ${input.question} (${input.marks} Marks)
    - Key Terms to Define: ${input.keyTerms}
    - Student's Planned Paragraph Themes: ${input.paragraphFocuses.join(", ")}
    - Core Geographic Pillars (4Ps/2Ss): ${input.conceptualPillars.join(", ")}
    - Additional Student Concepts: ${input.concepts.join(", ")}
    - Framework to Use: ${input.structure} (${input.structure === 'PEEL' ? 'Point, Evidence, Explain, Link' : 'Point, Evidence, Explain, Counter-argument, Analysis, Link'})
    - Desired Conclusion Stance: ${input.conclusionStance}
    - Sources Provided: ${sourceIdentifiers.join(", ")}
    
    INSTRUCTIONS FOR THE PLAN:
    1. STRUCTURE: Use the chosen framework (${input.structure}) for each body paragraph.
    2. INCORPORATE PILLARS: Ensure the analysis explicitly uses the selected conceptual pillars (${input.conceptualPillars.join(", ")}). Explain HOW they should be applied in specific paragraphs.
    3. MARK SCHEME: Balance the content for a ${input.marks}-mark response. (10 marks: depth/clarity; 12/16 marks: evaluation and synthesis).
    4. CASE STUDIES: Extract specific evidence and data points from the provided source files or URLs to include in the "Evidence" sub-sections.
    5. TERMINOLOGY: Use high-level IB Geography terminology throughout.

    INSTRUCTIONS FOR SYNOPSES (MANDATORY):
    You MUST provide a brief, professional synopsis (no longer than 3 sentences) for EVERY source listed above (${sourceIdentifiers.join(", ")}).
    Even if a file has a generic name (like "untitled.docx"), summarize its actual content.
    
    Format these synopses inside a JSON block wrapped in <synopses> tags like this:
    <synopses>
    {
      "identifier_from_list": "Synopsis of content...",
      "another_identifier": "Synopsis of content..."
    }
    </synopses>
    
    TONE: Academic, encouraging, and precise.
    FORMAT: Use clear Markdown with bold headers for paragraphs and sub-bullets for the ${input.structure} components.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        role: "user",
        parts: [
          ...contentParts,
          { text: prompt }
        ]
      }
    });

    const fullText = response.text;
    if (!fullText) {
      throw new Error("Empty response from AI");
    }

    // Extract synopses
    let plan = fullText;
    let synopses: Record<string, string> = {};

    const synopsisMatch = fullText.match(/<synopses>([\s\S]*?)<\/synopses>/);
    if (synopsisMatch) {
      try {
        synopses = JSON.parse(synopsisMatch[1].trim());
        plan = fullText.replace(synopsisMatch[0], "").trim();
      } catch (e) {
        console.error("Failed to parse synopses JSON:", e);
      }
    }

    return { plan, synopses };
  } catch (error: any) {
    if (error.message?.includes("API key not valid")) {
      throw new Error("INVALID_API_KEY");
    }
    throw error;
  }
}
