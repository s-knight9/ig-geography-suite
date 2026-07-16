import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async () => {
    // import the old hardcoded data to preserve rich metadata/economy blocks
    const { bangladeshProfile, chinaProfile, nigeriaProfile } = await import('./src/data.ts');
    
    const updateJSON = (slug, richProfile) => {
        if (!fs.existsSync(`public/data/${slug}.json`)) return;
        const json = JSON.parse(fs.readFileSync(`public/data/${slug}.json`, 'utf8'));
        
        // Merge rich profile into json, but keep the timeline data.
        json.country_metadata = richProfile.country_metadata;
        json.globalisation_tab = richProfile.globalisation_tab;
        json.economy_tab = richProfile.economy_tab;
        json.human_geography_tab = richProfile.human_geography_tab;
        json.prisoners_of_geography_map = richProfile.prisoners_of_geography_map;
        
        fs.writeFileSync(`public/data/${slug}.json`, JSON.stringify(json, null, 2));
        console.log(`Updated ${slug} with rich data.`);
    };

    updateJSON('bangladesh', bangladeshProfile);
    updateJSON('china', chinaProfile);
    updateJSON('nigeria', nigeriaProfile);
};

main();
