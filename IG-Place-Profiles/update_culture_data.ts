import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const schema = {
    type: 'OBJECT',
    properties: {
        culture_tab: {
            type: 'OBJECT',
            properties: {
                inglehart_welzel_coords: {
                    type: 'OBJECT',
                    properties: {
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' },
                        cultural_zone: { type: 'STRING' }
                    },
                    required: ['x', 'y', 'cultural_zone']
                },
                largest_diasporas: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            destination: { type: 'STRING' },
                            population: { type: 'STRING' },
                            cultural_reach_impact: { type: 'STRING' }
                        },
                        required: ['destination', 'population', 'cultural_reach_impact']
                    }
                },
                cultural_exports_and_landscape: {
                    type: 'OBJECT',
                    properties: {
                        soft_power_exports: {
                            type: 'ARRAY',
                            items: {
                                type: 'OBJECT',
                                properties: {
                                    medium: { type: 'STRING', description: 'e.g. Music, Cuisine, Cinema' },
                                    examples: { type: 'ARRAY', items: { type: 'STRING' } },
                                    global_reach_score: { type: 'NUMBER', description: '0-100 scale' }
                                },
                                required: ['medium', 'examples', 'global_reach_score']
                            }
                        },
                        spatial_landscape: {
                            type: 'OBJECT',
                            properties: {
                                enclaves: { type: 'ARRAY', items: { type: 'STRING' } },
                                architectural_footprint: { type: 'STRING' },
                                description: { type: 'STRING' }
                            },
                            required: ['enclaves', 'architectural_footprint', 'description']
                        }
                    },
                    required: ['soft_power_exports', 'spatial_landscape']
                },
                hybridity_and_glocalization: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            concept: { type: 'STRING' },
                            description: { type: 'STRING' },
                            glocalized_examples: { type: 'ARRAY', items: { type: 'STRING' } },
                            spatial_location: { type: 'STRING' }
                        },
                        required: ['concept', 'description', 'glocalized_examples', 'spatial_location']
                    }
                }
            },
            required: ['inglehart_welzel_coords', 'largest_diasporas', 'cultural_exports_and_landscape', 'hybridity_and_glocalization']
        }
    },
    required: ['culture_tab']
};

const processFiles = async () => {
    const files = fs.readdirSync('public/data').filter(f => f.endsWith('.json'));
    
    // Chunking to avoid rate limits
    const chunkSize = 10;
    const startTime = Date.now();
    for (let i = 0; i < files.length; i += chunkSize) {
        if (Date.now() - startTime > 45000) {
           console.log("Approaching 50s timeout, exiting gracefully...");
           break;
        }

        const chunk = files.slice(i, i + chunkSize);
        console.log(`Processing chunk ${i/chunkSize + 1}...`);
        await Promise.all(chunk.map(async file => {
            const data = JSON.parse(fs.readFileSync(`public/data/${file}`, 'utf8'));
            if (data.culture_tab && data.culture_tab.largest_diasporas) {
                // already fully processed with new schema
                return;
            }
            const countryName = data.country_metadata?.name || file.replace('.json', '');
            
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Generate the culture_tab data for ${countryName}. It should include: 1. Largest Diasporas outside home nation (Cultural Reach) 2. Cultural Exports & Spatial Landscape 3. Hybridity & Glocalization. It MUST strictly follow the JSON schema.`,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: schema,
                    }
                });
                
                const generated = JSON.parse(response.text);
                data.culture_tab = generated.culture_tab;
                fs.writeFileSync(`public/data/${file}`, JSON.stringify(data, null, 2));
                console.log(`Updated ${file}`);
            } catch (e) {
                console.error(`Failed on ${file}:`, e.message);
            }
        }));
    }
    console.log("Finished generating missing files.");
};

processFiles();
