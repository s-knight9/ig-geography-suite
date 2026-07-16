import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const schema = {
    type: 'OBJECT',
    properties: {
        tectonic_framework: {
            type: 'OBJECT',
            properties: {
                plates: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            name: { type: 'STRING' },
                            position_x: { type: 'NUMBER', description: '0-100 scale placement' },
                            position_y: { type: 'NUMBER', description: '0-100 scale placement' }
                        },
                        required: ['name', 'position_x', 'position_y']
                    }
                },
                boundaries: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            type: { type: 'STRING', enum: ['divergent', 'convergent', 'transform'] },
                            path_points: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        x: { type: 'NUMBER', description: '0-100 scale' },
                                        y: { type: 'NUMBER', description: '0-100 scale' }
                                    },
                                    required: ['x', 'y']
                                }
                            }
                        },
                        required: ['type', 'path_points']
                    }
                },
                hotspots: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            type: { type: 'STRING', enum: ['earthquake', 'volcano'] },
                            position_x: { type: 'NUMBER', description: '0-100 scale placement' },
                            position_y: { type: 'NUMBER', description: '0-100 scale placement' },
                            label: { type: 'STRING' }
                        },
                        required: ['type', 'position_x', 'position_y', 'label']
                    }
                },
                ledger: {
                    type: 'OBJECT',
                    properties: {
                        active_boundaries_and_interactions: { type: 'STRING' },
                        relative_plate_motion: { type: 'STRING' },
                        synoptic_case_study: { type: 'STRING' }
                    },
                    required: ['active_boundaries_and_interactions', 'relative_plate_motion', 'synoptic_case_study']
                }
            },
            required: ['plates', 'boundaries', 'hotspots', 'ledger']
        }
    },
    required: ['tectonic_framework']
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
            if (data.prisoners_of_geography_map && data.prisoners_of_geography_map.tectonic_framework) {
                // already mostly processed
                return;
            }
            const countryName = data.country_metadata?.name || file.replace('.json', '');
            
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Generate the tectonic_framework data for ${countryName}. It should map local tectonic plates, plate boundaries, and hotspots (earthquakes/volcanoes) relative to a 100x100 grid where the country sits near the center. It MUST strictly follow the JSON schema. Be geographically accurate as to whether the boundaries are divergent, convergent, or transform. Give meaningful insights in the ledger about risks to infrastructure.`,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: schema,
                    }
                });
                
                const generated = JSON.parse(response.text);
                data.prisoners_of_geography_map = data.prisoners_of_geography_map || {};
                data.prisoners_of_geography_map.tectonic_framework = generated.tectonic_framework;
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
