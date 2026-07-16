import fs from 'fs';
import path from 'path';

const densityMap = {
  usa: { avg: 37, core: { name: "Washington D.C. (Core)", base: 3500 }, semi: { name: "Texas (Semi-Periphery)", base: 30 }, peri: { name: "Alaska (Periphery)", base: 0.2 } },
  china: { avg: 153, core: { name: "Beijing (Core)", base: 1200 }, semi: { name: "Sichuan (Semi-Periphery)", base: 200 }, peri: { name: "Tibet (Periphery)", base: 2 } },
  chad: { avg: 13, core: { name: "N'Djamena (Core)", base: 500 }, semi: { name: "Logone Occidental (Semi-Periphery)", base: 60 }, peri: { name: "Borkou (Periphery)", base: 0.1 } },
  niger: { avg: 19, core: { name: "Niamey (Core)", base: 2000 }, semi: { name: "Maradi (Semi-Periphery)", base: 50 }, peri: { name: "Agadez (Periphery)", base: 1 } },
  nigeria: { avg: 226, core: { name: "Lagos (Core)", base: 2500 }, semi: { name: "Kano (Semi-Periphery)", base: 250 }, peri: { name: "Borno (Periphery)", base: 35 } },
  uk: { avg: 281, core: { name: "Greater London (Core)", base: 4500 }, semi: { name: "West Midlands (Semi-Periphery)", base: 400 }, peri: { name: "Highlands (Periphery)", base: 8 } },
  switzerland: { avg: 219, core: { name: "Zurich (Core)", base: 1000 }, semi: { name: "Vaud (Semi-Periphery)", base: 250 }, peri: { name: "Graubünden (Periphery)", base: 28 } },
  ethiopia: { avg: 115, core: { name: "Addis Ababa (Core)", base: 4000 }, semi: { name: "Amhara (Semi-Periphery)", base: 120 }, peri: { name: "Somali Region (Periphery)", base: 15 } },
  sudan: { avg: 25, core: { name: "Khartoum (Core)", base: 200 }, semi: { name: "Gezira (Semi-Periphery)", base: 100 }, peri: { name: "Northern State (Periphery)", base: 2 } },
  australia: { avg: 3, core: { name: "ACT (Core)", base: 150 }, semi: { name: "New South Wales (Semi-Periphery)", base: 10 }, peri: { name: "Northern Territory (Periphery)", base: 0.1 } },
  germany: { avg: 240, core: { name: "Berlin (Core)", base: 3600, rate: 0.003493 }, semi: { name: "Bavaria (Semi-Periphery)", base: 180 }, peri: { name: "Mecklenburg-Vorpommern (Periphery)", base: 69 } },
  mexico: { avg: 66, core: { name: "Mexico City (Core)", base: 5500 }, semi: { name: "Jalisco (Semi-Periphery)", base: 100 }, peri: { name: "Baja California Sur (Periphery)", base: 10 } },
  brazil: { avg: 25, core: { name: "São Paulo (Core)", base: 5000 }, semi: { name: "Minas Gerais (Semi-Periphery)", base: 35 }, peri: { name: "Amazonas (Periphery)", base: 2 } },
  drc: { avg: 40, core: { name: "Kinshasa (Core)", base: 1500 }, semi: { name: "Haut-Katanga (Semi-Periphery)", base: 30 }, peri: { name: "Tshuapa (Periphery)", base: 4 } },
  bangladesh: { avg: 1265, core: { name: "Dhaka (Core)", base: 2000 }, semi: { name: "Chattogram (Semi-Periphery)", base: 600 }, peri: { name: "Sylhet (Periphery)", base: 500 } }
};

const updateDensities = () => {
    const dir = path.join(process.cwd(), 'public', 'data');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(dir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const slug = file.replace('.json', '');

        const countryMap = densityMap[slug];
        if (!countryMap) {
            console.log(`No density map for ${slug}`);
            continue;
        }

        for (const t of data.population_dynamics_time_series) {
            const year = t.year;
            // Let's assume the base density is for 1970 and it scales up by somewhere between 1% to 2% per year
            // depending on the region (core grows faster)
            const yearDelta = year - 1970;
            
            const scaleBase = (base, rate) => Math.round(base * Math.pow(1 + rate, yearDelta));

            t.sub_national_density_choropleth = [
                {
                    admin_1_region_name: "National Average",
                    density_per_km2: scaleBase(countryMap.avg, 0.015)
                },
                {
                    admin_1_region_name: countryMap.core.name,
                    density_per_km2: scaleBase(countryMap.core.base, countryMap.core.rate !== undefined ? countryMap.core.rate : 0.025) // Core grows faster (urbanization)
                },
                {
                    admin_1_region_name: countryMap.semi.name,
                    density_per_km2: scaleBase(countryMap.semi.base, 0.012)
                },
                {
                    admin_1_region_name: countryMap.peri.name,
                    density_per_km2: scaleBase(countryMap.peri.base, 0.005) // Periphery grows slower or stays flat
                }
            ];
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Updated densities for ${slug}`);
    }
};

updateDensities();
