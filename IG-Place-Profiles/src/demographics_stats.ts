export interface TimelineStats {
  birthRate: number; // per 1000
  deathRate: number; // per 1000
  popGrowth: number; // %
  fertilityRate: number; // General Fertility Rate per 1000 women
  tfr: number; // Total Fertility Rate
  lifeExpectancy: number; // years
  imr: number; // Infant Mortality Rate per 1000 births
  dtmStage: number; // Stage 1-5
  sexRatio: number; // Males per 100 females
  inMigration: number; // in thousands/yr
  outMigration: number; // in thousands/yr
  unemploymentRate: number; // %
}

export type CountryStatsTimeline = {
  1970: TimelineStats;
  2026: TimelineStats;
  2040: TimelineStats;
};

export const countryStatsMap: Record<string, CountryStatsTimeline> = {
  bangladesh: {
    1970: { birthRate: 47.0, deathRate: 19.5, popGrowth: 2.75, fertilityRate: 210, tfr: 6.9, lifeExpectancy: 43.5, imr: 148.0, dtmStage: 2, sexRatio: 104.5, inMigration: 10, outMigration: 110, unemploymentRate: 8.5 },
    2026: { birthRate: 17.5, deathRate: 5.6, popGrowth: 1.03, fertilityRate: 68, tfr: 1.9, lifeExpectancy: 73.8, imr: 22.4, dtmStage: 3, sexRatio: 98.2, inMigration: 20, outMigration: 480, unemploymentRate: 4.8 },
    2040: { birthRate: 13.2, deathRate: 6.8, popGrowth: 0.52, fertilityRate: 48, tfr: 1.7, lifeExpectancy: 77.2, imr: 13.5, dtmStage: 4, sexRatio: 97.4, inMigration: 35, outMigration: 390, unemploymentRate: 4.1 }
  },
  usa: {
    1970: { birthRate: 18.4, deathRate: 9.5, popGrowth: 1.20, fertilityRate: 87.9, tfr: 2.48, lifeExpectancy: 70.8, imr: 20.0, dtmStage: 4, sexRatio: 96.0, inMigration: 380, outMigration: 40, unemploymentRate: 4.9 },
    2026: { birthRate: 11.0, deathRate: 8.4, popGrowth: 0.55, fertilityRate: 54.5, tfr: 1.62, lifeExpectancy: 77.9, imr: 5.2, dtmStage: 4, sexRatio: 97.9, inMigration: 1200, outMigration: 180, unemploymentRate: 4.1 },
    2040: { birthRate: 10.2, deathRate: 9.3, popGrowth: 0.41, fertilityRate: 51.0, tfr: 1.60, lifeExpectancy: 81.2, imr: 4.0, dtmStage: 4, sexRatio: 98.3, inMigration: 1400, outMigration: 200, unemploymentRate: 4.5 }
  },
  china: {
    1970: { birthRate: 33.4, deathRate: 7.6, popGrowth: 2.58, fertilityRate: 165, tfr: 5.75, lifeExpectancy: 59.4, imr: 82.0, dtmStage: 2, sexRatio: 105.2, inMigration: 5, outMigration: 95, unemploymentRate: 3.5 },
    2026: { birthRate: 6.3, deathRate: 7.9, popGrowth: -0.15, fertilityRate: 28, tfr: 1.0, lifeExpectancy: 78.6, imr: 5.1, dtmStage: 5, sexRatio: 104.1, inMigration: 40, outMigration: 350, unemploymentRate: 5.2 },
    2040: { birthRate: 5.5, deathRate: 11.2, popGrowth: -0.65, fertilityRate: 24, tfr: 0.95, lifeExpectancy: 81.5, imr: 3.8, dtmStage: 5, sexRatio: 103.5, inMigration: 50, outMigration: 280, unemploymentRate: 5.5 }
  },
  india: {
    1970: { birthRate: 39.5, deathRate: 16.5, popGrowth: 2.30, fertilityRate: 178, tfr: 5.60, lifeExpectancy: 48.0, imr: 135.0, dtmStage: 2, sexRatio: 107.5, inMigration: 50, outMigration: 180, unemploymentRate: 5.6 },
    2026: { birthRate: 16.2, deathRate: 7.2, popGrowth: 0.81, fertilityRate: 64, tfr: 1.98, lifeExpectancy: 72.4, imr: 25.8, dtmStage: 3, sexRatio: 105.2, inMigration: 120, outMigration: 650, unemploymentRate: 7.4 },
    2040: { birthRate: 12.5, deathRate: 8.1, popGrowth: 0.42, fertilityRate: 48, tfr: 1.72, lifeExpectancy: 76.1, imr: 16.0, dtmStage: 4, sexRatio: 103.8, inMigration: 150, outMigration: 580, unemploymentRate: 6.8 }
  },
  "south-korea": {
    1970: { birthRate: 31.2, deathRate: 7.8, popGrowth: 2.05, fertilityRate: 145, tfr: 4.53, lifeExpectancy: 62.1, imr: 45.0, dtmStage: 3, sexRatio: 101.4, inMigration: 10, outMigration: 80, unemploymentRate: 4.5 },
    2026: { birthRate: 4.8, deathRate: 7.4, popGrowth: -0.28, fertilityRate: 18, tfr: 0.69, lifeExpectancy: 84.3, imr: 1.8, dtmStage: 5, sexRatio: 99.1, inMigration: 140, outMigration: 60, unemploymentRate: 2.9 },
    2040: { birthRate: 4.0, deathRate: 11.5, popGrowth: -0.78, fertilityRate: 15, tfr: 0.65, lifeExpectancy: 86.8, imr: 1.2, dtmStage: 5, sexRatio: 98.4, inMigration: 120, outMigration: 50, unemploymentRate: 3.2 }
  },
  vietnam: {
    1970: { birthRate: 38.9, deathRate: 12.2, popGrowth: 2.10, fertilityRate: 185, tfr: 5.89, lifeExpectancy: 59.8, imr: 55.0, dtmStage: 2, sexRatio: 96.8, inMigration: 5, outMigration: 110, unemploymentRate: 6.0 },
    2026: { birthRate: 14.5, deathRate: 6.6, popGrowth: 0.68, fertilityRate: 58, tfr: 1.94, lifeExpectancy: 74.8, imr: 15.4, dtmStage: 3, sexRatio: 97.5, inMigration: 15, outMigration: 190, unemploymentRate: 2.1 },
    2040: { birthRate: 11.2, deathRate: 8.0, popGrowth: 0.28, fertilityRate: 43, tfr: 1.75, lifeExpectancy: 78.4, imr: 9.8, dtmStage: 4, sexRatio: 98.0, inMigration: 25, outMigration: 140, unemploymentRate: 2.5 }
  },
  philippines: {
    1970: { birthRate: 41.5, deathRate: 9.2, popGrowth: 2.85, fertilityRate: 192, tfr: 6.20, lifeExpectancy: 59.1, imr: 72.0, dtmStage: 2, sexRatio: 101.1, inMigration: 8, outMigration: 180, unemploymentRate: 7.2 },
    2026: { birthRate: 19.8, deathRate: 6.1, popGrowth: 1.25, fertilityRate: 81, tfr: 2.45, lifeExpectancy: 71.5, imr: 18.5, dtmStage: 3, sexRatio: 101.8, inMigration: 40, outMigration: 650, unemploymentRate: 4.5 },
    2040: { birthRate: 14.8, deathRate: 7.0, popGrowth: 0.76, fertilityRate: 59, tfr: 2.05, lifeExpectancy: 75.3, imr: 11.2, dtmStage: 4, sexRatio: 101.3, inMigration: 60, outMigration: 510, unemploymentRate: 4.1 }
  },
  malaysia: {
    1970: { birthRate: 37.5, deathRate: 7.5, popGrowth: 2.65, fertilityRate: 165, tfr: 4.90, lifeExpectancy: 63.5, imr: 44.0, dtmStage: 2, sexRatio: 102.5, inMigration: 15, outMigration: 55, unemploymentRate: 6.2 },
    2026: { birthRate: 14.1, deathRate: 5.5, popGrowth: 0.98, fertilityRate: 52, tfr: 1.62, lifeExpectancy: 76.2, imr: 6.8, dtmStage: 3, sexRatio: 103.4, inMigration: 190, outMigration: 110, unemploymentRate: 3.4 },
    2040: { birthRate: 11.6, deathRate: 6.8, popGrowth: 0.54, fertilityRate: 41, tfr: 1.55, lifeExpectancy: 79.1, imr: 4.5, dtmStage: 4, sexRatio: 102.8, inMigration: 140, outMigration: 90, unemploymentRate: 3.2 }
  },
  russia: {
    1970: { birthRate: 14.6, deathRate: 8.2, popGrowth: 0.60, fertilityRate: 63, tfr: 2.01, lifeExpectancy: 68.8, imr: 25.0, dtmStage: 4, sexRatio: 86.4, inMigration: 120, outMigration: 70, unemploymentRate: 2.0 },
    2026: { birthRate: 8.9, deathRate: 13.5, popGrowth: -0.38, fertilityRate: 41, tfr: 1.48, lifeExpectancy: 72.9, imr: 4.2, dtmStage: 5, sexRatio: 86.9, inMigration: 240, outMigration: 190, unemploymentRate: 3.3 },
    2040: { birthRate: 8.1, deathRate: 14.8, popGrowth: -0.62, fertilityRate: 36, tfr: 1.40, lifeExpectancy: 76.5, imr: 3.0, dtmStage: 5, sexRatio: 87.2, inMigration: 190, outMigration: 150, unemploymentRate: 3.8 }
  },
  poland: {
    1970: { birthRate: 16.6, deathRate: 8.1, popGrowth: 0.85, fertilityRate: 71, tfr: 2.22, lifeExpectancy: 70.2, imr: 33.2, dtmStage: 4, sexRatio: 94.8, inMigration: 12, outMigration: 55, unemploymentRate: 1.5 },
    2026: { birthRate: 8.1, deathRate: 11.2, popGrowth: -0.31, fertilityRate: 35, tfr: 1.29, lifeExpectancy: 78.4, imr: 3.5, dtmStage: 5, sexRatio: 93.6, inMigration: 65, outMigration: 80, unemploymentRate: 5.1 },
    2040: { birthRate: 7.2, deathRate: 13.5, popGrowth: -0.65, fertilityRate: 30, tfr: 1.25, lifeExpectancy: 81.6, imr: 2.6, dtmStage: 5, sexRatio: 93.1, inMigration: 55, outMigration: 65, unemploymentRate: 4.8 }
  },
  germany: {
    1970: { birthRate: 13.4, deathRate: 12.1, popGrowth: 0.25, fertilityRate: 61, tfr: 2.03, lifeExpectancy: 70.8, imr: 21.1, dtmStage: 4, sexRatio: 91.2, inMigration: 550, outMigration: 150, unemploymentRate: 2.8 },
    2026: { birthRate: 9.1, deathRate: 12.0, popGrowth: 0.12, fertilityRate: 44, tfr: 1.48, lifeExpectancy: 81.3, imr: 3.1, dtmStage: 5, sexRatio: 97.4, inMigration: 1100, outMigration: 750, unemploymentRate: 5.8 },
    2040: { birthRate: 8.5, deathRate: 13.8, popGrowth: -0.25, fertilityRate: 40, tfr: 1.45, lifeExpectancy: 84.1, imr: 2.2, dtmStage: 5, sexRatio: 97.9, inMigration: 980, outMigration: 700, unemploymentRate: 5.5 }
  },
  uk: {
    1970: { birthRate: 16.2, deathRate: 11.7, popGrowth: 0.45, fertilityRate: 78, tfr: 2.43, lifeExpectancy: 71.9, imr: 18.5, dtmStage: 4, sexRatio: 95.2, inMigration: 210, outMigration: 240, unemploymentRate: 3.5 },
    2026: { birthRate: 10.1, deathRate: 9.3, popGrowth: 0.34, fertilityRate: 49, tfr: 1.54, lifeExpectancy: 81.5, imr: 3.4, dtmStage: 4, sexRatio: 97.2, inMigration: 950, outMigration: 550, unemploymentRate: 4.3 },
    2040: { birthRate: 9.5, deathRate: 10.4, popGrowth: 0.18, fertilityRate: 45, tfr: 1.50, lifeExpectancy: 84.2, imr: 2.5, dtmStage: 4, sexRatio: 97.8, inMigration: 850, outMigration: 500, unemploymentRate: 4.2 }
  },
  switzerland: {
    1970: { birthRate: 15.8, deathRate: 9.1, popGrowth: 0.82, fertilityRate: 68, tfr: 2.10, lifeExpectancy: 72.8, imr: 15.0, dtmStage: 4, sexRatio: 96.5, inMigration: 85, outMigration: 45, unemploymentRate: 0.8 },
    2026: { birthRate: 9.5, deathRate: 8.1, popGrowth: 0.74, fertilityRate: 45, tfr: 1.39, lifeExpectancy: 84.1, imr: 2.9, dtmStage: 4, sexRatio: 98.4, inMigration: 145, outMigration: 80, unemploymentRate: 4.0 },
    2040: { birthRate: 8.9, deathRate: 9.6, popGrowth: 0.38, fertilityRate: 41, tfr: 1.36, lifeExpectancy: 86.8, imr: 2.0, dtmStage: 5, sexRatio: 99.0, inMigration: 125, outMigration: 75, unemploymentRate: 3.8 }
  },
  australia: {
    1970: { birthRate: 20.5, deathRate: 9.0, popGrowth: 1.85, fertilityRate: 98, tfr: 2.85, lifeExpectancy: 71.3, imr: 17.8, dtmStage: 4, sexRatio: 101.2, inMigration: 160, outMigration: 40, unemploymentRate: 2.1 },
    2026: { birthRate: 11.2, deathRate: 6.9, popGrowth: 1.15, fertilityRate: 53, tfr: 1.58, lifeExpectancy: 83.5, imr: 3.2, dtmStage: 4, sexRatio: 98.6, inMigration: 420, outMigration: 180, unemploymentRate: 4.0 },
    2040: { birthRate: 10.5, deathRate: 7.8, popGrowth: 0.82, fertilityRate: 49, tfr: 1.55, lifeExpectancy: 86.2, imr: 2.4, dtmStage: 4, sexRatio: 98.9, inMigration: 380, outMigration: 160, unemploymentRate: 4.2 }
  },
  brazil: {
    1970: { birthRate: 38.6, deathRate: 9.8, popGrowth: 2.50, fertilityRate: 172, tfr: 5.76, lifeExpectancy: 59.1, imr: 95.0, dtmStage: 2, sexRatio: 98.5, inMigration: 15, outMigration: 65, unemploymentRate: 5.5 },
    2026: { birthRate: 12.2, deathRate: 7.1, popGrowth: 0.48, fertilityRate: 48, tfr: 1.55, lifeExpectancy: 76.5, imr: 11.5, dtmStage: 3, sexRatio: 96.8, inMigration: 50, outMigration: 120, unemploymentRate: 7.8 },
    2040: { birthRate: 9.8, deathRate: 8.9, popGrowth: 0.08, fertilityRate: 38, tfr: 1.45, lifeExpectancy: 79.8, imr: 7.8, dtmStage: 4, sexRatio: 96.2, inMigration: 65, outMigration: 90, unemploymentRate: 7.0 }
  },
  canada: {
    1970: { birthRate: 17.5, deathRate: 7.3, popGrowth: 1.21, fertilityRate: 80.0, tfr: 2.33, lifeExpectancy: 72.8, imr: 18.8, dtmStage: 4, sexRatio: 98.5, inMigration: 120, outMigration: 20, unemploymentRate: 5.7 },
    2026: { birthRate: 9.6, deathRate: 8.1, popGrowth: 0.85, fertilityRate: 45.2, tfr: 1.40, lifeExpectancy: 82.5, imr: 4.1, dtmStage: 4, sexRatio: 98.2, inMigration: 450, outMigration: 60, unemploymentRate: 5.9 },
    2040: { birthRate: 8.8, deathRate: 9.2, popGrowth: 0.45, fertilityRate: 40.5, tfr: 1.35, lifeExpectancy: 85.0, imr: 3.2, dtmStage: 4, sexRatio: 98.0, inMigration: 400, outMigration: 55, unemploymentRate: 5.5 }
  },
  mexico: {
    1970: { birthRate: 43.1, deathRate: 10.1, popGrowth: 3.10, fertilityRate: 198, tfr: 6.72, lifeExpectancy: 61.2, imr: 81.0, dtmStage: 2, sexRatio: 99.2, inMigration: 10, outMigration: 190, unemploymentRate: 4.8 },
    2026: { birthRate: 14.5, deathRate: 6.2, popGrowth: 0.72, fertilityRate: 58, tfr: 1.78, lifeExpectancy: 75.6, imr: 11.2, dtmStage: 3, sexRatio: 96.5, inMigration: 80, outMigration: 310, unemploymentRate: 2.9 },
    2040: { birthRate: 11.5, deathRate: 7.5, popGrowth: 0.32, fertilityRate: 44, tfr: 1.62, lifeExpectancy: 79.0, imr: 7.0, dtmStage: 4, sexRatio: 96.0, inMigration: 95, outMigration: 240, unemploymentRate: 3.1 }
  },
  drc: { // Democratic Republic of the Congo
    1970: { birthRate: 47.5, deathRate: 18.2, popGrowth: 2.65, fertilityRate: 215, tfr: 6.60, lifeExpectancy: 44.2, imr: 135.0, dtmStage: 2, sexRatio: 97.8, inMigration: 15, outMigration: 40, unemploymentRate: 12.5 },
    2026: { birthRate: 39.8, deathRate: 8.8, popGrowth: 3.11, fertilityRate: 178, tfr: 5.62, lifeExpectancy: 60.5, imr: 63.8, dtmStage: 2, sexRatio: 98.9, inMigration: 55, outMigration: 110, unemploymentRate: 18.5 },
    2040: { birthRate: 31.5, deathRate: 6.5, popGrowth: 2.68, fertilityRate: 140, tfr: 4.35, lifeExpectancy: 65.8, imr: 41.2, dtmStage: 2, sexRatio: 99.2, inMigration: 60, outMigration: 95, unemploymentRate: 15.0 }
  },
  nigeria: {
    1970: { birthRate: 48.2, deathRate: 19.5, popGrowth: 2.45, fertilityRate: 220, tfr: 6.90, lifeExpectancy: 42.1, imr: 140.0, dtmStage: 2, sexRatio: 99.4, inMigration: 25, outMigration: 75, unemploymentRate: 6.5 },
    2026: { birthRate: 34.5, deathRate: 10.8, popGrowth: 2.32, fertilityRate: 155, tfr: 4.95, lifeExpectancy: 54.2, imr: 68.2, dtmStage: 2, sexRatio: 101.4, inMigration: 90, outMigration: 390, unemploymentRate: 16.0 },
    2040: { birthRate: 27.2, deathRate: 8.5, popGrowth: 1.84, fertilityRate: 118, tfr: 3.82, lifeExpectancy: 61.5, imr: 45.0, dtmStage: 3, sexRatio: 101.1, inMigration: 120, outMigration: 310, unemploymentRate: 12.6 }
  },
  "south-africa": {
    1970: { birthRate: 38.5, deathRate: 12.8, popGrowth: 2.40, fertilityRate: 168, tfr: 5.49, lifeExpectancy: 53.5, imr: 83.0, dtmStage: 2, sexRatio: 98.5, inMigration: 35, outMigration: 20, unemploymentRate: 10.0 },
    2026: { birthRate: 18.8, deathRate: 9.2, popGrowth: 0.95, fertilityRate: 67, tfr: 2.22, lifeExpectancy: 62.8, imr: 25.4, dtmStage: 3, sexRatio: 96.1, inMigration: 290, outMigration: 90, unemploymentRate: 32.2 },
    2040: { birthRate: 15.2, deathRate: 9.8, popGrowth: 0.52, fertilityRate: 53, tfr: 1.95, lifeExpectancy: 67.4, imr: 17.5, dtmStage: 4, sexRatio: 95.8, inMigration: 210, outMigration: 80, unemploymentRate: 28.0 }
  },
  ethiopia: {
    1970: { birthRate: 49.0, deathRate: 22.0, popGrowth: 2.55, fertilityRate: 224, tfr: 7.10, lifeExpectancy: 41.5, imr: 152.0, dtmStage: 2, sexRatio: 100.1, inMigration: 10, outMigration: 30, unemploymentRate: 8.0 },
    2026: { birthRate: 30.2, deathRate: 6.1, popGrowth: 2.38, fertilityRate: 126, tfr: 3.85, lifeExpectancy: 66.2, imr: 32.5, dtmStage: 2, sexRatio: 99.4, inMigration: 40, outMigration: 185, unemploymentRate: 7.6 },
    2040: { birthRate: 22.5, deathRate: 5.8, popGrowth: 1.65, fertilityRate: 92, tfr: 2.92, lifeExpectancy: 71.0, imr: 19.8, dtmStage: 3, sexRatio: 99.5, inMigration: 50, outMigration: 150, unemploymentRate: 6.5 }
  },
  sudan: {
    1970: { birthRate: 46.5, deathRate: 18.5, popGrowth: 2.70, fertilityRate: 212, tfr: 6.85, lifeExpectancy: 44.5, imr: 125.0, dtmStage: 2, sexRatio: 101.5, inMigration: 15, outMigration: 45, unemploymentRate: 9.5 },
    2026: { birthRate: 31.8, deathRate: 7.5, popGrowth: 2.35, fertilityRate: 135, tfr: 4.15, lifeExpectancy: 65.8, imr: 39.5, dtmStage: 2, sexRatio: 100.8, inMigration: 30, outMigration: 260, unemploymentRate: 18.0 },
    2040: { birthRate: 24.5, deathRate: 6.8, popGrowth: 1.74, fertilityRate: 101, tfr: 3.20, lifeExpectancy: 70.1, imr: 25.5, dtmStage: 3, sexRatio: 100.5, inMigration: 40, outMigration: 190, unemploymentRate: 14.5 }
  },
  chad: {
    1970: { birthRate: 48.5, deathRate: 23.5, popGrowth: 2.20, fertilityRate: 222, tfr: 6.95, lifeExpectancy: 39.8, imr: 165.0, dtmStage: 2, sexRatio: 98.2, inMigration: 5, outMigration: 25, unemploymentRate: 11.2 },
    2026: { birthRate: 41.5, deathRate: 11.2, popGrowth: 3.01, fertilityRate: 188, tfr: 5.98, lifeExpectancy: 53.4, imr: 67.0, dtmStage: 2, sexRatio: 99.3, inMigration: 35, outMigration: 80, unemploymentRate: 15.5 },
    2040: { birthRate: 34.2, deathRate: 8.5, popGrowth: 2.53, fertilityRate: 148, tfr: 4.75, lifeExpectancy: 59.2, imr: 44.5, dtmStage: 2, sexRatio: 99.5, inMigration: 40, outMigration: 65, unemploymentRate: 13.0 }
  },
  niger: {
    1970: { birthRate: 53.0, deathRate: 26.5, popGrowth: 2.55, fertilityRate: 242, tfr: 7.75, lifeExpectancy: 36.8, imr: 182.0, dtmStage: 2, sexRatio: 101.2, inMigration: 8, outMigration: 40, unemploymentRate: 10.5 },
    2026: { birthRate: 44.5, deathRate: 9.8, popGrowth: 3.42, fertilityRate: 205, tfr: 6.45, lifeExpectancy: 63.1, imr: 46.5, dtmStage: 2, sexRatio: 101.6, inMigration: 25, outMigration: 115, unemploymentRate: 14.2 },
    2040: { birthRate: 36.5, deathRate: 7.2, popGrowth: 2.89, fertilityRate: 158, tfr: 4.98, lifeExpectancy: 68.4, imr: 29.0, dtmStage: 2, sexRatio: 101.4, inMigration: 35, outMigration: 90, unemploymentRate: 11.8 }
  },
  iceland: {
    1970: { birthRate: 19.7, deathRate: 7.2, popGrowth: 1.25, fertilityRate: 92, tfr: 2.81, lifeExpectancy: 73.5, imr: 12.0, dtmStage: 4, sexRatio: 99.5, inMigration: 2, outMigration: 1.5, unemploymentRate: 1.0 },
    2026: { birthRate: 11.5, deathRate: 6.4, popGrowth: 0.85, fertilityRate: 52, tfr: 1.65, lifeExpectancy: 83.2, imr: 1.5, dtmStage: 4, sexRatio: 101.2, inMigration: 4.5, outMigration: 2.1, unemploymentRate: 3.4 },
    2040: { birthRate: 10.1, deathRate: 7.8, popGrowth: 0.45, fertilityRate: 45, tfr: 1.59, lifeExpectancy: 85.5, imr: 1.1, dtmStage: 5, sexRatio: 100.8, inMigration: 5.0, outMigration: 2.5, unemploymentRate: 4.0 }
  },
  tuvalu: {
    1970: { birthRate: 35.0, deathRate: 14.0, popGrowth: 2.10, fertilityRate: 140, tfr: 4.50, lifeExpectancy: 54.0, imr: 65.0, dtmStage: 2, sexRatio: 102.5, inMigration: 0.1, outMigration: 0.3, unemploymentRate: 2.5 },
    2026: { birthRate: 21.0, deathRate: 8.2, popGrowth: 0.95, fertilityRate: 85, tfr: 2.95, lifeExpectancy: 65.4, imr: 22.1, dtmStage: 3, sexRatio: 104.1, inMigration: 0.2, outMigration: 1.8, unemploymentRate: 8.4 },
    2040: { birthRate: 16.5, deathRate: 9.5, popGrowth: 0.50, fertilityRate: 68, tfr: 2.40, lifeExpectancy: 68.2, imr: 15.0, dtmStage: 3, sexRatio: 103.8, inMigration: 0.3, outMigration: 2.5, unemploymentRate: 10.0 }
  },
  peru: {
    1970: { birthRate: 41.2, deathRate: 13.5, popGrowth: 2.77, fertilityRate: 185, tfr: 6.02, lifeExpectancy: 53.5, imr: 95.0, dtmStage: 2, sexRatio: 99.8, inMigration: 5, outMigration: 45, unemploymentRate: 6.0 },
    2026: { birthRate: 16.8, deathRate: 5.9, popGrowth: 0.95, fertilityRate: 72, tfr: 2.18, lifeExpectancy: 77.1, imr: 11.2, dtmStage: 3, sexRatio: 98.8, inMigration: 15, outMigration: 85, unemploymentRate: 6.8 },
    2040: { birthRate: 12.8, deathRate: 6.9, popGrowth: 0.48, fertilityRate: 55, tfr: 1.85, lifeExpectancy: 81.0, imr: 6.5, dtmStage: 4, sexRatio: 98.5, inMigration: 20, outMigration: 70, unemploymentRate: 5.5 }
  },
  rwanda: {
    1970: { birthRate: 48.0, deathRate: 21.0, popGrowth: 2.70, fertilityRate: 215, tfr: 7.15, lifeExpectancy: 42.5, imr: 130.0, dtmStage: 2, sexRatio: 95.5, inMigration: 10, outMigration: 35, unemploymentRate: 5.2 },
    2026: { birthRate: 29.5, deathRate: 5.3, popGrowth: 2.25, fertilityRate: 120, tfr: 3.42, lifeExpectancy: 69.8, imr: 25.1, dtmStage: 2, sexRatio: 94.2, inMigration: 12, outMigration: 40, unemploymentRate: 14.5 },
    2040: { birthRate: 19.8, deathRate: 5.8, popGrowth: 1.34, fertilityRate: 81, tfr: 2.45, lifeExpectancy: 74.2, imr: 14.2, dtmStage: 3, sexRatio: 95.0, inMigration: 15, outMigration: 30, unemploymentRate: 11.0 }
  },
  kenya: {
    1970: { birthRate: 50.5, deathRate: 18.0, popGrowth: 3.25, fertilityRate: 228, tfr: 7.90, lifeExpectancy: 48.2, imr: 110.0, dtmStage: 2, sexRatio: 100.2, inMigration: 5, outMigration: 20, unemploymentRate: 6.5 },
    2026: { birthRate: 26.5, deathRate: 5.1, popGrowth: 1.95, fertilityRate: 110, tfr: 3.24, lifeExpectancy: 65.5, imr: 28.5, dtmStage: 2, sexRatio: 98.5, inMigration: 12, outMigration: 65, unemploymentRate: 12.8 },
    2040: { birthRate: 18.2, deathRate: 5.8, popGrowth: 1.18, fertilityRate: 75, tfr: 2.35, lifeExpectancy: 70.8, imr: 18.0, dtmStage: 3, sexRatio: 98.2, inMigration: 20, outMigration: 45, unemploymentRate: 9.8 }
  },
  thailand: {
    1970: { birthRate: 36.5, deathRate: 10.1, popGrowth: 2.64, fertilityRate: 162, tfr: 5.61, lifeExpectancy: 58.2, imr: 72.0, dtmStage: 2, sexRatio: 99.1, inMigration: 15, outMigration: 35, unemploymentRate: 1.1 },
    2026: { birthRate: 9.1, deathRate: 8.5, popGrowth: 0.12, fertilityRate: 42, tfr: 1.16, lifeExpectancy: 79.5, imr: 6.8, dtmStage: 4, sexRatio: 95.8, inMigration: 210, outMigration: 45, unemploymentRate: 1.5 },
    2040: { birthRate: 7.2, deathRate: 11.2, popGrowth: -0.32, fertilityRate: 32, tfr: 1.12, lifeExpectancy: 82.8, imr: 4.5, dtmStage: 5, sexRatio: 94.6, inMigration: 150, outMigration: 30, unemploymentRate: 2.0 }
  },
  belgium: {
    1970: { birthRate: 14.8, deathRate: 12.1, popGrowth: 0.35, fertilityRate: 68, tfr: 2.25, lifeExpectancy: 71.1, imr: 21.0, dtmStage: 4, sexRatio: 96.5, inMigration: 35, outMigration: 15, unemploymentRate: 3.1 },
    2026: { birthRate: 10.2, deathRate: 9.8, popGrowth: 0.42, fertilityRate: 50, tfr: 1.58, lifeExpectancy: 82.1, imr: 3.1, dtmStage: 4, sexRatio: 97.4, inMigration: 98, outMigration: 45, unemploymentRate: 5.6 },
    2040: { birthRate: 9.4, deathRate: 11.0, popGrowth: 0.15, fertilityRate: 47, tfr: 1.55, lifeExpectancy: 84.8, imr: 2.2, dtmStage: 5, sexRatio: 97.8, inMigration: 85, outMigration: 40, unemploymentRate: 5.0 }
  },
  france: {
    1970: { birthRate: 16.7, deathRate: 10.5, popGrowth: 0.78, fertilityRate: 74, tfr: 2.47, lifeExpectancy: 71.5, imr: 15.0, dtmStage: 4, sexRatio: 95.4, inMigration: 180, outMigration: 40, unemploymentRate: 2.5 },
    2026: { birthRate: 10.5, deathRate: 9.5, popGrowth: 0.31, fertilityRate: 52, tfr: 1.76, lifeExpectancy: 82.6, imr: 3.3, dtmStage: 4, sexRatio: 96.1, inMigration: 240, outMigration: 80, unemploymentRate: 7.2 },
    2040: { birthRate: 9.6, deathRate: 10.8, popGrowth: 0.12, fertilityRate: 48, tfr: 1.72, lifeExpectancy: 85.2, imr: 2.4, dtmStage: 4, sexRatio: 96.5, inMigration: 210, outMigration: 90, unemploymentRate: 6.8 }
  },
  netherlands: {
    1970: { birthRate: 18.3, deathRate: 8.4, popGrowth: 1.05, fertilityRate: 82, tfr: 2.57, lifeExpectancy: 73.6, imr: 12.7, dtmStage: 4, sexRatio: 98.4, inMigration: 80, outMigration: 45, unemploymentRate: 1.8 },
    2026: { birthRate: 9.8, deathRate: 9.2, popGrowth: 0.45, fertilityRate: 48, tfr: 1.49, lifeExpectancy: 82.0, imr: 3.4, dtmStage: 4, sexRatio: 98.9, inMigration: 175, outMigration: 85, unemploymentRate: 3.6 },
    2040: { birthRate: 9.0, deathRate: 10.4, popGrowth: 0.16, fertilityRate: 44, tfr: 1.45, lifeExpectancy: 84.4, imr: 2.5, dtmStage: 5, sexRatio: 99.1, inMigration: 150, outMigration: 90, unemploymentRate: 4.1 }
  },
  singapore: {
    1970: { birthRate: 22.1, deathRate: 5.2, popGrowth: 1.70, fertilityRate: 101, tfr: 3.07, lifeExpectancy: 66.8, imr: 20.5, dtmStage: 3, sexRatio: 104.2, inMigration: 12, outMigration: 8, unemploymentRate: 5.5 },
    2026: { birthRate: 7.1, deathRate: 6.2, popGrowth: 0.58, fertilityRate: 33, tfr: 0.98, lifeExpectancy: 84.5, imr: 1.6, dtmStage: 5, sexRatio: 95.4, inMigration: 110, outMigration: 40, unemploymentRate: 1.9 },
    2040: { birthRate: 6.2, deathRate: 9.8, popGrowth: -0.12, fertilityRate: 29, tfr: 0.90, lifeExpectancy: 87.2, imr: 1.0, dtmStage: 5, sexRatio: 94.2, inMigration: 90, outMigration: 35, unemploymentRate: 2.5 }
  },
  uae: {
    1970: { birthRate: 38.5, deathRate: 8.5, popGrowth: 7.20, fertilityRate: 195, tfr: 6.50, lifeExpectancy: 61.2, imr: 61.0, dtmStage: 2, sexRatio: 112.5, inMigration: 45, outMigration: 5, unemploymentRate: 1.2 },
    2026: { birthRate: 9.5, deathRate: 1.9, popGrowth: 0.98, fertilityRate: 41, tfr: 1.34, lifeExpectancy: 79.4, imr: 5.4, dtmStage: 4, sexRatio: 224.2, inMigration: 180, outMigration: 15, unemploymentRate: 2.4 },
    2040: { birthRate: 8.0, deathRate: 3.5, popGrowth: 0.55, fertilityRate: 35, tfr: 1.28, lifeExpectancy: 82.5, imr: 3.8, dtmStage: 4, sexRatio: 195.4, inMigration: 120, outMigration: 20, unemploymentRate: 3.0 }
  },
  "saudi-arabia": {
    1970: { birthRate: 46.2, deathRate: 15.5, popGrowth: 3.12, fertilityRate: 215, tfr: 7.18, lifeExpectancy: 53.1, imr: 105.0, dtmStage: 2, sexRatio: 104.8, inMigration: 20, outMigration: 5, unemploymentRate: 3.2 },
    2026: { birthRate: 14.8, deathRate: 2.6, popGrowth: 1.48, fertilityRate: 65, tfr: 2.22, lifeExpectancy: 77.8, imr: 5.5, dtmStage: 3, sexRatio: 135.3, inMigration: 210, outMigration: 30, unemploymentRate: 5.8 },
    2040: { birthRate: 11.2, deathRate: 4.8, popGrowth: 0.84, fertilityRate: 51, tfr: 1.82, lifeExpectancy: 81.2, imr: 3.5, dtmStage: 4, sexRatio: 122.5, inMigration: 150, outMigration: 25, unemploymentRate: 5.0 }
  },
  turkey: {
    1970: { birthRate: 38.8, deathRate: 12.2, popGrowth: 2.52, fertilityRate: 175, tfr: 5.70, lifeExpectancy: 52.8, imr: 120.0, dtmStage: 2, sexRatio: 103.1, inMigration: 10, outMigration: 190, unemploymentRate: 6.8 },
    2026: { birthRate: 13.8, deathRate: 5.4, popGrowth: 0.72, fertilityRate: 58, tfr: 1.82, lifeExpectancy: 76.5, imr: 8.5, dtmStage: 3, sexRatio: 98.4, inMigration: 60, outMigration: 120, unemploymentRate: 9.8 },
    2040: { birthRate: 10.5, deathRate: 7.2, popGrowth: 0.31, fertilityRate: 46, tfr: 1.62, lifeExpectancy: 80.4, imr: 5.1, dtmStage: 4, sexRatio: 98.0, inMigration: 70, outMigration: 98, unemploymentRate: 8.5 }
  },
  egypt: {
    1970: { birthRate: 40.0, deathRate: 16.5, popGrowth: 2.35, fertilityRate: 180, tfr: 6.2, lifeExpectancy: 51.5, imr: 120.0, dtmStage: 2, sexRatio: 102.5, inMigration: 5, outMigration: 120, unemploymentRate: 7.5 },
    2026: { birthRate: 21.0, deathRate: 5.8, popGrowth: 1.52, fertilityRate: 85, tfr: 2.8, lifeExpectancy: 71.8, imr: 16.5, dtmStage: 3, sexRatio: 101.5, inMigration: 15, outMigration: 240, unemploymentRate: 7.2 },
    2040: { birthRate: 16.5, deathRate: 6.2, popGrowth: 1.03, fertilityRate: 62, tfr: 2.2, lifeExpectancy: 75.4, imr: 10.5, dtmStage: 3, sexRatio: 101.0, inMigration: 25, outMigration: 180, unemploymentRate: 6.5 }
  },
  ukraine: {
    1970: { birthRate: 15.2, deathRate: 8.9, popGrowth: 0.63, fertilityRate: 65, tfr: 2.10, lifeExpectancy: 70.8, imr: 21.0, dtmStage: 4, sexRatio: 86.5, inMigration: 20, outMigration: 50, unemploymentRate: 1.2 },
    2026: { birthRate: 7.2, deathRate: 14.8, popGrowth: -2.85, fertilityRate: 35, tfr: 1.15, lifeExpectancy: 71.2, imr: 6.8, dtmStage: 5, sexRatio: 85.2, inMigration: 100, outMigration: 1200, unemploymentRate: 15.5 },
    2040: { birthRate: 8.5, deathRate: 12.5, popGrowth: -0.65, fertilityRate: 42, tfr: 1.28, lifeExpectancy: 74.8, imr: 4.5, dtmStage: 5, sexRatio: 87.5, inMigration: 180, outMigration: 250, unemploymentRate: 8.8 }
  },
  indonesia: {
    1970: { birthRate: 40.5, deathRate: 15.0, popGrowth: 2.55, fertilityRate: 180, tfr: 5.60, lifeExpectancy: 48.0, imr: 104.0, dtmStage: 2, sexRatio: 98.8, inMigration: 5, outMigration: 40, unemploymentRate: 4.5 },
    2026: { birthRate: 16.2, deathRate: 6.4, popGrowth: 0.98, fertilityRate: 68, tfr: 2.15, lifeExpectancy: 71.5, imr: 17.5, dtmStage: 3, sexRatio: 101.1, inMigration: 12, outMigration: 180, unemploymentRate: 5.2 },
    2040: { birthRate: 12.8, deathRate: 7.8, popGrowth: 0.50, fertilityRate: 52, tfr: 1.85, lifeExpectancy: 75.8, imr: 11.2, dtmStage: 4, sexRatio: 100.5, inMigration: 20, outMigration: 130, unemploymentRate: 4.8 }
  },
  iran: {
    1970: { birthRate: 44.5, deathRate: 14.2, popGrowth: 3.03, fertilityRate: 202, tfr: 6.40, lifeExpectancy: 53.5, imr: 112.0, dtmStage: 2, sexRatio: 103.5, inMigration: 15, outMigration: 25, unemploymentRate: 6.0 },
    2026: { birthRate: 13.1, deathRate: 5.5, popGrowth: 0.76, fertilityRate: 54, tfr: 1.68, lifeExpectancy: 76.2, imr: 11.8, dtmStage: 4, sexRatio: 102.0, inMigration: 45, outMigration: 120, unemploymentRate: 11.5 },
    2040: { birthRate: 10.4, deathRate: 6.8, popGrowth: 0.36, fertilityRate: 42, tfr: 1.55, lifeExpectancy: 79.5, imr: 7.5, dtmStage: 4, sexRatio: 101.2, inMigration: 30, outMigration: 90, unemploymentRate: 9.8 }
  },
  ireland: {
    1970: { birthRate: 21.8, deathRate: 11.2, popGrowth: 1.05, fertilityRate: 98, tfr: 3.85, lifeExpectancy: 71.2, imr: 19.5, dtmStage: 3, sexRatio: 101.5, inMigration: 5, outMigration: 35, unemploymentRate: 6.5 },
    2026: { birthRate: 11.2, deathRate: 6.5, popGrowth: 0.85, fertilityRate: 52, tfr: 1.50, lifeExpectancy: 82.8, imr: 3.2, dtmStage: 4, sexRatio: 98.2, inMigration: 75, outMigration: 30, unemploymentRate: 4.3 },
    2040: { birthRate: 9.2, deathRate: 9.5, popGrowth: 0.15, fertilityRate: 42, tfr: 1.40, lifeExpectancy: 85.2, imr: 2.2, dtmStage: 4, sexRatio: 98.5, inMigration: 55, outMigration: 25, unemploymentRate: 4.8 }
  },
  italy: {
    1970: { birthRate: 16.8, deathRate: 9.7, popGrowth: 0.71, fertilityRate: 76, tfr: 2.42, lifeExpectancy: 71.8, imr: 19.5, dtmStage: 4, sexRatio: 95.8, inMigration: 60, outMigration: 45, unemploymentRate: 4.2 },
    2026: { birthRate: 6.8, deathRate: 11.8, popGrowth: -0.15, fertilityRate: 31, tfr: 1.22, lifeExpectancy: 83.1, imr: 2.4, dtmStage: 5, sexRatio: 96.1, inMigration: 180, outMigration: 40, unemploymentRate: 7.5 },
    2040: { birthRate: 5.9, deathRate: 13.5, popGrowth: -0.38, fertilityRate: 26, tfr: 1.18, lifeExpectancy: 85.6, imr: 1.5, dtmStage: 5, sexRatio: 96.5, inMigration: 150, outMigration: 30, unemploymentRate: 6.8 }
  },
  cuba: {
    1970: { birthRate: 25.4, deathRate: 6.2, popGrowth: 1.92, fertilityRate: 115, tfr: 3.55, lifeExpectancy: 70.1, imr: 32.0, dtmStage: 3, sexRatio: 101.5, inMigration: 2, outMigration: 80, unemploymentRate: 2.1 },
    2026: { birthRate: 8.9, deathRate: 9.8, popGrowth: -0.25, fertilityRate: 41, tfr: 1.45, lifeExpectancy: 78.4, imr: 4.2, dtmStage: 5, sexRatio: 97.2, inMigration: 5, outMigration: 140, unemploymentRate: 3.8 },
    2040: { birthRate: 7.4, deathRate: 11.6, popGrowth: -0.52, fertilityRate: 34, tfr: 1.38, lifeExpectancy: 81.2, imr: 2.8, dtmStage: 5, sexRatio: 96.8, inMigration: 7, outMigration: 95, unemploymentRate: 3.2 }
  },
  israel: {
    1970: { birthRate: 27.8, deathRate: 6.5, popGrowth: 2.82, fertilityRate: 130, tfr: 3.80, lifeExpectancy: 71.2, imr: 22.0, dtmStage: 3, sexRatio: 101.2, inMigration: 40, outMigration: 8, unemploymentRate: 3.5 },
    2026: { birthRate: 19.5, deathRate: 5.1, popGrowth: 1.62, fertilityRate: 92, tfr: 2.92, lifeExpectancy: 82.8, imr: 2.1, dtmStage: 3, sexRatio: 98.4, inMigration: 28, outMigration: 15, unemploymentRate: 4.2 },
    2040: { birthRate: 16.8, deathRate: 5.8, popGrowth: 1.25, fertilityRate: 80, tfr: 2.55, lifeExpectancy: 85.5, imr: 1.3, dtmStage: 4, sexRatio: 98.2, inMigration: 35, outMigration: 18, unemploymentRate: 3.8 }
  },
  japan: {
    1970: { birthRate: 18.8, deathRate: 6.9, popGrowth: 1.20, fertilityRate: 85.0, tfr: 2.13, lifeExpectancy: 72.0, imr: 13.1, dtmStage: 3, sexRatio: 96.5, inMigration: 10, outMigration: 15, unemploymentRate: 1.3 },
    2026: { birthRate: 6.0, deathRate: 13.0, popGrowth: -0.55, fertilityRate: 28.0, tfr: 1.20, lifeExpectancy: 84.7, imr: 1.6, dtmStage: 5, sexRatio: 95.4, inMigration: 80, outMigration: 30, unemploymentRate: 2.6 },
    2040: { birthRate: 5.0, deathRate: 15.0, popGrowth: -0.80, fertilityRate: 22.0, tfr: 1.15, lifeExpectancy: 86.5, imr: 1.1, dtmStage: 5, sexRatio: 94.8, inMigration: 90, outMigration: 25, unemploymentRate: 2.8 }
  },
  venezuela: {
    1970: { birthRate: 36.5, deathRate: 8.2, popGrowth: 2.80, fertilityRate: 160, tfr: 4.85, lifeExpectancy: 65.4, imr: 52.0, dtmStage: 2, sexRatio: 102.1, inMigration: 15, outMigration: 5, unemploymentRate: 6.8 },
    2026: { birthRate: 15.8, deathRate: 6.8, popGrowth: 0.90, fertilityRate: 68, tfr: 2.18, lifeExpectancy: 73.2, imr: 21.0, dtmStage: 3, sexRatio: 98.4, inMigration: -50, outMigration: 250, unemploymentRate: 11.2 },
    2040: { birthRate: 12.5, deathRate: 8.2, popGrowth: 0.43, fertilityRate: 54, tfr: 1.85, lifeExpectancy: 76.8, imr: 15.0, dtmStage: 4, sexRatio: 98.0, inMigration: -20, outMigration: 120, unemploymentRate: 9.5 }
  }
};

// Simple linear interpolation helper to get smooth transition as slider changes has high visual value!
export function getInterpolatedStats(countryId: string, year: number): TimelineStats {
  const dataset = countryStatsMap[countryId] || countryStatsMap["bangladesh"]; // Fallback to safe source
  
  if (year <= 1970) return dataset[1970];
  if (year >= 2040) return dataset[2040];
  
  let startYear: 1970 | 2026 = 1970;
  let endYear: 2026 | 2040 = 2026;
  
  if (year > 2026) {
    startYear = 2026;
    endYear = 2040;
  }
  
  const startStats = dataset[startYear];
  const endStats = dataset[endYear];
  
  const ratio = (year - startYear) / (endYear - startYear);
  
  const interpolate = (start: number, end: number) => {
    return Number((start + (end - start) * ratio).toFixed(2));
  };
  
  return {
    birthRate: interpolate(startStats.birthRate, endStats.birthRate),
    deathRate: interpolate(startStats.deathRate, endStats.deathRate),
    popGrowth: interpolate(startStats.popGrowth, endStats.popGrowth),
    fertilityRate: Math.round(interpolate(startStats.fertilityRate, endStats.fertilityRate)),
    tfr: interpolate(startStats.tfr, endStats.tfr),
    lifeExpectancy: interpolate(startStats.lifeExpectancy, endStats.lifeExpectancy),
    imr: interpolate(startStats.imr, endStats.imr),
    dtmStage: ratio > 0.6 ? endStats.dtmStage : startStats.dtmStage, // keep discrete step
    sexRatio: interpolate(startStats.sexRatio, endStats.sexRatio),
    inMigration: Math.round(interpolate(startStats.inMigration, endStats.inMigration)),
    outMigration: Math.round(interpolate(startStats.outMigration, endStats.outMigration)),
    unemploymentRate: interpolate(startStats.unemploymentRate, endStats.unemploymentRate)
  };
}

export interface EducationStats {
  literacyRate: number; // %
  expectedSchooling: number; // years
}

export const countryEducationMap: Record<string, { 1970: EducationStats; 2026: EducationStats; 2040: EducationStats }> = {
  bangladesh: {
    1970: { literacyRate: 20.1, expectedSchooling: 4.2 },
    2026: { literacyRate: 76.8, expectedSchooling: 12.4 },
    2040: { literacyRate: 88.5, expectedSchooling: 14.5 }
  },
  usa: {
    1970: { literacyRate: 97.5, expectedSchooling: 13.5 },
    2026: { literacyRate: 99.0, expectedSchooling: 16.3 },
    2040: { literacyRate: 99.2, expectedSchooling: 16.8 }
  },
  china: {
    1970: { literacyRate: 65.5, expectedSchooling: 6.5 },
    2026: { literacyRate: 97.8, expectedSchooling: 14.2 },
    2040: { literacyRate: 99.0, expectedSchooling: 15.5 }
  },
  india: {
    1970: { literacyRate: 34.0, expectedSchooling: 5.8 },
    2026: { literacyRate: 77.7, expectedSchooling: 12.1 },
    2040: { literacyRate: 88.0, expectedSchooling: 14.0 }
  },
  "south-korea": {
    1970: { literacyRate: 88.0, expectedSchooling: 10.1 },
    2026: { literacyRate: 99.0, expectedSchooling: 16.5 },
    2040: { literacyRate: 99.1, expectedSchooling: 17.0 }
  },
  vietnam: {
    1970: { literacyRate: 75.0, expectedSchooling: 7.2 },
    2026: { literacyRate: 96.2, expectedSchooling: 13.0 },
    2040: { literacyRate: 98.5, expectedSchooling: 14.5 }
  },
  philippines: {
    1970: { literacyRate: 82.5, expectedSchooling: 8.5 },
    2026: { literacyRate: 96.3, expectedSchooling: 13.1 },
    2040: { literacyRate: 98.2, expectedSchooling: 14.2 }
  },
  malaysia: {
    1970: { literacyRate: 60.0, expectedSchooling: 7.8 },
    2026: { literacyRate: 95.5, expectedSchooling: 13.7 },
    2040: { literacyRate: 97.8, expectedSchooling: 14.6 }
  },
  russia: {
    1970: { literacyRate: 98.5, expectedSchooling: 12.0 },
    2026: { literacyRate: 99.7, expectedSchooling: 15.8 },
    2040: { literacyRate: 99.8, expectedSchooling: 16.2 }
  },
  poland: {
    1970: { literacyRate: 97.0, expectedSchooling: 11.5 },
    2026: { literacyRate: 99.8, expectedSchooling: 16.0 },
    2040: { literacyRate: 99.9, expectedSchooling: 16.4 }
  },
  germany: {
    1970: { literacyRate: 98.0, expectedSchooling: 13.8 },
    2026: { literacyRate: 99.0, expectedSchooling: 17.2 },
    2040: { literacyRate: 99.2, expectedSchooling: 17.5 }
  },
  uk: {
    1970: { literacyRate: 98.0, expectedSchooling: 13.2 },
    2026: { literacyRate: 99.0, expectedSchooling: 16.5 },
    2040: { literacyRate: 99.1, expectedSchooling: 16.9 }
  },
  switzerland: {
    1970: { literacyRate: 99.0, expectedSchooling: 13.5 },
    2026: { literacyRate: 99.0, expectedSchooling: 16.6 },
    2040: { literacyRate: 99.1, expectedSchooling: 17.0 }
  },
  australia: {
    1970: { literacyRate: 98.5, expectedSchooling: 13.6 },
    2026: { literacyRate: 99.0, expectedSchooling: 16.2 },
    2040: { literacyRate: 99.1, expectedSchooling: 16.6 }
  },
  brazil: {
    1970: { literacyRate: 66.0, expectedSchooling: 6.2 },
    2026: { literacyRate: 94.3, expectedSchooling: 15.4 },
    2040: { literacyRate: 97.0, expectedSchooling: 16.0 }
  },
  canada: {
    1970: { literacyRate: 99.0, expectedSchooling: 13.0 },
    2026: { literacyRate: 99.0, expectedSchooling: 16.4 },
    2040: { literacyRate: 99.1, expectedSchooling: 16.8 }
  },
  mexico: {
    1970: { literacyRate: 74.0, expectedSchooling: 6.8 },
    2026: { literacyRate: 95.8, expectedSchooling: 14.8 },
    2040: { literacyRate: 97.5, expectedSchooling: 15.4 }
  },
  drc: {
    1970: { literacyRate: 31.0, expectedSchooling: 3.8 },
    2026: { literacyRate: 80.5, expectedSchooling: 9.7 },
    2040: { literacyRate: 86.2, expectedSchooling: 11.2 }
  },
  nigeria: {
    1970: { literacyRate: 25.0, expectedSchooling: 4.1 },
    2026: { literacyRate: 62.0, expectedSchooling: 10.2 },
    2040: { literacyRate: 78.5, expectedSchooling: 12.5 }
  },
  "south-africa": {
    1970: { literacyRate: 58.0, expectedSchooling: 8.2 },
    2026: { literacyRate: 95.0, expectedSchooling: 13.4 },
    2040: { literacyRate: 96.8, expectedSchooling: 14.5 }
  },
  ethiopia: {
    1970: { literacyRate: 15.0, expectedSchooling: 2.8 },
    2026: { literacyRate: 51.8, expectedSchooling: 8.5 },
    2040: { literacyRate: 68.2, expectedSchooling: 10.5 }
  },
  sudan: {
    1970: { literacyRate: 18.0, expectedSchooling: 3.1 },
    2026: { literacyRate: 61.5, expectedSchooling: 8.1 },
    2040: { literacyRate: 72.8, expectedSchooling: 10.2 }
  },
  chad: {
    1970: { literacyRate: 12.0, expectedSchooling: 2.2 },
    2026: { literacyRate: 27.5, expectedSchooling: 7.3 },
    2040: { literacyRate: 43.8, expectedSchooling: 9.5 }
  },
  niger: {
    1970: { literacyRate: 10.5, expectedSchooling: 2.1 },
    2026: { literacyRate: 37.3, expectedSchooling: 6.9 },
    2040: { literacyRate: 52.0, expectedSchooling: 8.8 }
  },
  iceland: {
    1970: { literacyRate: 99.0, expectedSchooling: 13.8 },
    2026: { literacyRate: 99.0, expectedSchooling: 17.5 },
    2040: { literacyRate: 99.1, expectedSchooling: 17.8 }
  },
  tuvalu: {
    1970: { literacyRate: 95.0, expectedSchooling: 8.5 },
    2026: { literacyRate: 99.0, expectedSchooling: 12.1 },
    2040: { literacyRate: 99.1, expectedSchooling: 12.8 }
  },
  peru: {
    1970: { literacyRate: 72.5, expectedSchooling: 7.5 },
    2026: { literacyRate: 94.8, expectedSchooling: 15.2 },
    2040: { literacyRate: 96.8, expectedSchooling: 15.8 }
  },
  rwanda: {
    1970: { literacyRate: 38.0, expectedSchooling: 3.5 },
    2026: { literacyRate: 75.9, expectedSchooling: 11.2 },
    2040: { literacyRate: 85.0, expectedSchooling: 12.5 }
  },
  kenya: {
    1970: { literacyRate: 32.0, expectedSchooling: 5.2 },
    2026: { literacyRate: 82.8, expectedSchooling: 11.5 },
    2040: { literacyRate: 90.0, expectedSchooling: 12.8 }
  },
  thailand: {
    1970: { literacyRate: 78.5, expectedSchooling: 7.1 },
    2026: { literacyRate: 94.1, expectedSchooling: 15.6 },
    2040: { literacyRate: 96.5, expectedSchooling: 16.2 }
  },
  belgium: {
    1970: { literacyRate: 98.0, expectedSchooling: 14.1 },
    2026: { literacyRate: 99.0, expectedSchooling: 18.5 },
    2040: { literacyRate: 99.1, expectedSchooling: 18.8 }
  },
  france: {
    1970: { literacyRate: 98.0, expectedSchooling: 13.8 },
    2026: { literacyRate: 99.0, expectedSchooling: 18.2 },
    2040: { literacyRate: 99.2, expectedSchooling: 18.5 }
  },
  netherlands: {
    1970: { literacyRate: 99.0, expectedSchooling: 14.2 },
    2026: { literacyRate: 99.0, expectedSchooling: 18.6 },
    2040: { literacyRate: 99.1, expectedSchooling: 18.9 }
  },
  singapore: {
    1970: { literacyRate: 68.9, expectedSchooling: 8.9 },
    2026: { literacyRate: 97.5, expectedSchooling: 16.5 },
    2040: { literacyRate: 99.0, expectedSchooling: 17.0 }
  },
  uae: {
    1970: { literacyRate: 18.0, expectedSchooling: 4.5 },
    2026: { literacyRate: 95.2, expectedSchooling: 14.3 },
    2040: { literacyRate: 97.5, expectedSchooling: 15.1 }
  },
  "saudi-arabia": {
    1970: { literacyRate: 15.0, expectedSchooling: 3.8 },
    2026: { literacyRate: 96.4, expectedSchooling: 15.1 },
    2040: { literacyRate: 98.5, expectedSchooling: 15.8 }
  },
  turkey: {
    1970: { literacyRate: 55.0, expectedSchooling: 6.2 },
    2026: { literacyRate: 96.8, expectedSchooling: 14.5 },
    2040: { literacyRate: 98.5, expectedSchooling: 15.2 }
  },
  egypt: {
    1970: { literacyRate: 30.0, expectedSchooling: 6.5 },
    2026: { literacyRate: 74.5, expectedSchooling: 13.8 },
    2040: { literacyRate: 85.0, expectedSchooling: 14.8 }
  },
  ukraine: {
    1970: { literacyRate: 98.0, expectedSchooling: 11.2 },
    2026: { literacyRate: 99.8, expectedSchooling: 15.5 },
    2040: { literacyRate: 99.9, expectedSchooling: 15.8 }
  },
  indonesia: {
    1970: { literacyRate: 54.0, expectedSchooling: 6.0 },
    2026: { literacyRate: 96.2, expectedSchooling: 13.5 },
    2040: { literacyRate: 98.2, expectedSchooling: 14.5 }
  },
  iran: {
    1970: { literacyRate: 36.5, expectedSchooling: 5.5 },
    2026: { literacyRate: 89.0, expectedSchooling: 14.8 },
    2040: { literacyRate: 94.0, expectedSchooling: 15.5 }
  },
  ireland: {
    1970: { literacyRate: 98.0, expectedSchooling: 12.8 },
    2026: { literacyRate: 99.0, expectedSchooling: 18.9 },
    2040: { literacyRate: 99.1, expectedSchooling: 19.2 }
  },
  italy: {
    1970: { literacyRate: 96.0, expectedSchooling: 10.5 },
    2026: { literacyRate: 99.2, expectedSchooling: 16.8 },
    2040: { literacyRate: 99.5, expectedSchooling: 17.5 }
  },
  cuba: {
    1970: { literacyRate: 72.0, expectedSchooling: 7.2 },
    2026: { literacyRate: 99.8, expectedSchooling: 14.4 },
    2040: { literacyRate: 99.9, expectedSchooling: 15.0 }
  },
  israel: {
    1970: { literacyRate: 92.0, expectedSchooling: 11.8 },
    2026: { literacyRate: 97.8, expectedSchooling: 16.2 },
    2040: { literacyRate: 98.6, expectedSchooling: 17.0 }
  },
  japan: {
    1970: { literacyRate: 99.0, expectedSchooling: 12.5 },
    2026: { literacyRate: 99.0, expectedSchooling: 15.2 },
    2040: { literacyRate: 99.0, expectedSchooling: 15.6 }
  },
  venezuela: {
    1970: { literacyRate: 74.0, expectedSchooling: 7.8 },
    2026: { literacyRate: 97.2, expectedSchooling: 14.5 },
    2040: { literacyRate: 98.5, expectedSchooling: 15.2 }
  }
};

export function getEducationStats(countryId: string, year: number): EducationStats {
  const dataset = countryEducationMap[countryId] || countryEducationMap["bangladesh"];
  
  if (year <= 1970) return dataset[1970];
  if (year >= 2040) return dataset[2040];
  
  let startYear: 1970 | 2026 = 1970;
  let endYear: 2026 | 2040 = 2026;
  
  if (year > 2026) {
    startYear = 2026;
    endYear = 2040;
  }
  
  const startStats = dataset[startYear];
  const endStats = dataset[endYear];
  
  const ratio = (year - startYear) / (endYear - startYear);
  
  const interpolate = (start: number, end: number) => {
    return Number((start + (end - start) * ratio).toFixed(1));
  };
  
  return {
    literacyRate: interpolate(startStats.literacyRate, endStats.literacyRate),
    expectedSchooling: interpolate(startStats.expectedSchooling, endStats.expectedSchooling)
  };
}
