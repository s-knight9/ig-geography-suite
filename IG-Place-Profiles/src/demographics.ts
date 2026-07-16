export interface DemographicItem {
  name: string;
  pct: number;
  color: string;
}

export interface DemographicInfo {
  religion: DemographicItem[];
  ethnic: DemographicItem[];
}

export const demographicsMap: Record<string, DemographicInfo> = {
  'bangladesh': {
    religion: [
      { name: "Muslim", pct: 90.4, color: "bg-blue-500" },
      { name: "Hindu", pct: 8.5, color: "bg-amber-500" },
      { name: "Buddhist", pct: 0.6, color: "bg-rose-500" },
      { name: "Christian", pct: 0.4, color: "bg-blue-500" },
      { name: "Others/None", pct: 0.1, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Bengali", pct: 98.0, color: "bg-blue-600" },
      { name: "Indigenous/Minorities", pct: 2.0, color: "bg-indigo-500" }
    ]
  },
  'usa': {
    religion: [
      { name: "Christian", pct: 63.0, color: "bg-blue-500" },
      { name: "Unaffiliated", pct: 29.0, color: "bg-slate-400" },
      { name: "Jewish", pct: 2.0, color: "bg-indigo-500" },
      { name: "Muslim", pct: 1.0, color: "bg-blue-500" },
      { name: "Hindu", pct: 1.0, color: "bg-amber-500" },
      { name: "Buddhist", pct: 1.0, color: "bg-rose-500" },
      { name: "Others", pct: 3.0, color: "bg-purple-400" }
    ],
    ethnic: [
      { name: "White", pct: 57.8, color: "bg-[#fef08a]" },
      { name: "Hispanic/Latino", pct: 18.7, color: "bg-orange-450" },
      { name: "Black/African Amer.", pct: 12.1, color: "bg-slate-700" },
      { name: "Asian", pct: 5.9, color: "bg-red-400" },
      { name: "Mixed/Multiracial", pct: 4.1, color: "bg-purple-500" },
      { name: "Amerind./Alaskan", pct: 0.7, color: "bg-amber-700" },
      { name: "Others", pct: 0.8, color: "bg-zinc-400" }
    ]
  },
  'china': {
    religion: [
      { name: "Unaffiliated/None", pct: 52.2, color: "bg-slate-400" },
      { name: "Folk/Taoist", pct: 21.9, color: "bg-orange-500" },
      { name: "Buddhist", pct: 18.2, color: "bg-amber-500" },
      { name: "Christian", pct: 5.1, color: "bg-blue-500" },
      { name: "Muslim", pct: 1.8, color: "bg-blue-500" }
    ],
    ethnic: [
      { name: "Han Chinese", pct: 91.1, color: "bg-red-600" },
      { name: "Uyghur", pct: 0.8, color: "bg-blue-500" },
      { name: "Hui", pct: 0.8, color: "bg-cyan-500" },
      { name: "Manchu", pct: 0.8, color: "bg-orange-400" },
      { name: "Miao", pct: 0.7, color: "bg-purple-500" },
      { name: "Others/Minorities", pct: 5.8, color: "bg-amber-600" }
    ]
  },
  'india': {
    religion: [
      { name: "Hindu", pct: 79.8, color: "bg-amber-500" },
      { name: "Muslim", pct: 14.2, color: "bg-blue-500" },
      { name: "Christian", pct: 2.3, color: "bg-blue-500" },
      { name: "Sikh", pct: 1.7, color: "bg-orange-500" },
      { name: "Buddhist", pct: 0.7, color: "bg-rose-500" },
      { name: "Jain", pct: 0.4, color: "bg-cyan-400" },
      { name: "Others/Unstated", pct: 0.9, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Indo-Aryan", pct: 72.0, color: "bg-amber-600" },
      { name: "Dravidian", pct: 25.0, color: "bg-teal-650" },
      { name: "Sino-Tib./Austro.", pct: 3.0, color: "bg-orange-400" }
    ]
  },
  'south-korea': {
    religion: [
      { name: "No religion", pct: 56.1, color: "bg-slate-400" },
      { name: "Protestant", pct: 19.7, color: "bg-blue-500" },
      { name: "Buddhist", pct: 15.5, color: "bg-amber-500" },
      { name: "Catholic", pct: 7.9, color: "bg-indigo-400" },
      { name: "Others", pct: 0.8, color: "bg-pink-400" }
    ],
    ethnic: [
      { name: "Ethnic Korean", pct: 96.0, color: "bg-blue-600" },
      { name: "Foreign Residents", pct: 4.0, color: "bg-slate-400" }
    ]
  },
  'vietnam': {
    religion: [
      { name: "Folk/None", pct: 85.5, color: "bg-slate-400" },
      { name: "Catholic", pct: 6.1, color: "bg-blue-500" },
      { name: "Buddhist", pct: 4.8, color: "bg-amber-500" },
      { name: "Hao Hao", pct: 1.5, color: "bg-teal-500" },
      { name: "Cao Dai", pct: 1.1, color: "bg-orange-500" },
      { name: "Protestant", pct: 1.0, color: "bg-indigo-400" }
    ],
    ethnic: [
      { name: "Kinh (Viet)", pct: 85.3, color: "bg-red-500" },
      { name: "Tay", pct: 1.9, color: "bg-amber-500" },
      { name: "Thai", pct: 1.8, color: "bg-blue-500" },
      { name: "Muong", pct: 1.5, color: "bg-blue-500" },
      { name: "Khmer", pct: 1.5, color: "bg-violet-500" },
      { name: "Mong", pct: 1.4, color: "bg-pink-500" },
      { name: "Others", pct: 6.6, color: "bg-slate-400" }
    ]
  },
  'philippines': {
    religion: [
      { name: "Roman Catholic", pct: 78.8, color: "bg-blue-500" },
      { name: "Protestant", pct: 10.3, color: "bg-indigo-500" },
      { name: "Muslim", pct: 6.4, color: "bg-blue-500" },
      { name: "Other Christian", pct: 2.6, color: "bg-cyan-500" },
      { name: "Others/None", pct: 1.9, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Tagalog", pct: 24.4, color: "bg-blue-600" },
      { name: "Bisaya/Binisaya", pct: 11.4, color: "bg-teal-500" },
      { name: "Cebuano", pct: 9.9, color: "bg-indigo-500" },
      { name: "Ilocano", pct: 8.8, color: "bg-yellow-500" },
      { name: "Hiligaynon", pct: 8.4, color: "bg-orange-500" },
      { name: "Bikol", pct: 6.8, color: "bg-pink-500" },
      { name: "Waray", pct: 4.0, color: "bg-purple-500" },
      { name: "Others", pct: 26.3, color: "bg-slate-400" }
    ]
  },
  'malaysia': {
    religion: [
      { name: "Muslim", pct: 61.3, color: "bg-blue-500" },
      { name: "Buddhist", pct: 19.8, color: "bg-amber-500" },
      { name: "Christian", pct: 9.2, color: "bg-blue-500" },
      { name: "Hindu", pct: 6.3, color: "bg-orange-550" },
      { name: "Other/Traditional", pct: 3.4, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Bumiputera", pct: 69.7, color: "bg-blue-600" },
      { name: "Chinese", pct: 22.8, color: "bg-red-500" },
      { name: "Indian", pct: 6.6, color: "bg-amber-500" },
      { name: "Others", pct: 0.9, color: "bg-slate-400" }
    ]
  },
  'russia': {
    religion: [
      { name: "Orthodox", pct: 72.0, color: "bg-blue-500" },
      { name: "None/Atheist", pct: 13.4, color: "bg-slate-400" },
      { name: "Muslim", pct: 12.0, color: "bg-blue-500" },
      { name: "Other Christian", pct: 2.0, color: "bg-indigo-455" },
      { name: "Buddhist", pct: 0.5, color: "bg-rose-450" },
      { name: "Others", pct: 0.1, color: "bg-zinc-400" }
    ],
    ethnic: [
      { name: "Russian", pct: 77.7, color: "bg-blue-600" },
      { name: "Tatar", pct: 3.7, color: "bg-blue-600" },
      { name: "Ukrainian", pct: 1.4, color: "bg-amber-500" },
      { name: "Bashkir", pct: 1.1, color: "bg-orange-500" },
      { name: "Chechen", pct: 1.0, color: "bg-red-550" },
      { name: "Others", pct: 15.1, color: "bg-slate-400" }
    ]
  },
  'poland': {
    religion: [
      { name: "Roman Catholic", pct: 84.8, color: "bg-blue-500" },
      { name: "None/Unstated", pct: 14.0, color: "bg-slate-400" },
      { name: "Orthodox", pct: 0.9, color: "bg-teal-500" },
      { name: "Others", pct: 0.3, color: "bg-purple-400" }
    ],
    ethnic: [
      { name: "Polish", pct: 96.9, color: "bg-red-500" },
      { name: "Silesian", pct: 1.1, color: "bg-blue-500" },
      { name: "German", pct: 0.2, color: "bg-amber-500" },
      { name: "Others", pct: 1.8, color: "bg-slate-400" }
    ]
  },
  'germany': {
    religion: [
      { name: "None/Unaffiliated", pct: 41.8, color: "bg-slate-400" },
      { name: "Roman Catholic", pct: 26.0, color: "bg-blue-500" },
      { name: "Protestant", pct: 23.7, color: "bg-cyan-500" },
      { name: "Muslim", pct: 5.5, color: "bg-blue-500" },
      { name: "Orthodox", pct: 2.0, color: "bg-teal-500" },
      { name: "Others", pct: 1.0, color: "bg-purple-400" }
    ],
    ethnic: [
      { name: "German", pct: 86.3, color: "bg-slate-700" },
      { name: "Turkish", pct: 1.8, color: "bg-red-500" },
      { name: "Polish", pct: 1.0, color: "bg-indigo-500" },
      { name: "Russian", pct: 0.5, color: "bg-blue-400" },
      { name: "Syrian", pct: 0.5, color: "bg-blue-500" },
      { name: "Others", pct: 9.9, color: "bg-slate-400" }
    ]
  },
  'uk': {
    religion: [
      { name: "Christian", pct: 46.2, color: "bg-blue-500" },
      { name: "None", pct: 37.2, color: "bg-slate-400" },
      { name: "Muslim", pct: 6.5, color: "bg-blue-500" },
      { name: "Hindu", pct: 1.7, color: "bg-amber-500" },
      { name: "Sikh", pct: 0.9, color: "bg-orange-500" },
      { name: "Others", pct: 7.5, color: "bg-zinc-400" }
    ],
    ethnic: [
      { name: "White", pct: 81.7, color: "bg-slate-300" },
      { name: "Asian", pct: 9.3, color: "bg-amber-500" },
      { name: "Black/Caribbean", pct: 4.0, color: "bg-slate-700" },
      { name: "Mixed", pct: 2.9, color: "bg-purple-500" },
      { name: "Others", pct: 2.1, color: "bg-zinc-400" }
    ]
  },
  'switzerland': {
    religion: [
      { name: "Roman Catholic", pct: 33.8, color: "bg-blue-500" },
      { name: "None", pct: 29.5, color: "bg-slate-400" },
      { name: "Protestant", pct: 21.8, color: "bg-cyan-500" },
      { name: "Other Christian", pct: 5.6, color: "bg-teal-500" },
      { name: "Muslim", pct: 5.4, color: "bg-blue-500" },
      { name: "Others", pct: 3.9, color: "bg-indigo-400" }
    ],
    ethnic: [
      { name: "Swiss", pct: 75.1, color: "bg-red-500" },
      { name: "Italian", pct: 3.7, color: "bg-blue-500" },
      { name: "German", pct: 3.5, color: "bg-slate-700" },
      { name: "Portuguese", pct: 3.2, color: "bg-orange-550" },
      { name: "French", pct: 1.9, color: "bg-blue-500" },
      { name: "Others", pct: 12.6, color: "bg-slate-400" }
    ]
  },
  'australia': {
    religion: [
      { name: "Christian", pct: 43.9, color: "bg-blue-500" },
      { name: "None/Atheist", pct: 38.9, color: "bg-slate-400" },
      { name: "Muslim", pct: 3.2, color: "bg-blue-500" },
      { name: "Hindu", pct: 2.7, color: "bg-amber-500" },
      { name: "Buddhist", pct: 2.4, color: "bg-orange-500" },
      { name: "Others", pct: 8.9, color: "bg-zinc-450" }
    ],
    ethnic: [
      { name: "English", pct: 33.0, color: "bg-blue-600" },
      { name: "Australian", pct: 29.9, color: "bg-blue-600" },
      { name: "Irish", pct: 9.5, color: "bg-indigo-500" },
      { name: "Scottish", pct: 8.6, color: "bg-cyan-500" },
      { name: "Chinese", pct: 5.5, color: "bg-red-500" },
      { name: "Indigenous Aus.", pct: 3.8, color: "bg-amber-700" },
      { name: "Others", pct: 9.7, color: "bg-slate-400" }
    ]
  },
  'brazil': {
    religion: [
      { name: "Roman Catholic", pct: 64.6, color: "bg-blue-500" },
      { name: "Protestant/Evan.", pct: 22.2, color: "bg-blue-500" },
      { name: "None/Other", pct: 11.2, color: "bg-slate-400" },
      { name: "Spiritism", pct: 2.0, color: "bg-purple-400" }
    ],
    ethnic: [
      { name: "White", pct: 47.7, color: "bg-slate-300" },
      { name: "Mixed (Pardo)", pct: 43.1, color: "bg-orange-400" },
      { name: "Black", pct: 7.6, color: "bg-slate-700" },
      { name: "Asian", pct: 1.1, color: "bg-red-400" },
      { name: "Indigenous", pct: 0.4, color: "bg-green-500" }
    ]
  },
  'canada': {
    religion: [
      { name: "Christian", pct: 53.3, color: "bg-blue-500" },
      { name: "Unaffiliated", pct: 34.6, color: "bg-slate-400" },
      { name: "Muslim", pct: 4.9, color: "bg-blue-500" },
      { name: "Hindu", pct: 2.3, color: "bg-amber-500" },
      { name: "Sikh", pct: 2.1, color: "bg-orange-500" },
      { name: "Others", pct: 2.8, color: "bg-purple-400" }
    ],
    ethnic: [
      { name: "European", pct: 69.8, color: "bg-slate-300" },
      { name: "South/East Asian", pct: 18.2, color: "bg-orange-400" },
      { name: "Indigenous", pct: 5.0, color: "bg-blue-600" },
      { name: "Black", pct: 4.3, color: "bg-slate-700" },
      { name: "Others/Mixed", pct: 2.7, color: "bg-purple-500" }
    ]
  },
  'mexico': {
    religion: [
      { name: "Roman Catholic", pct: 78.0, color: "bg-blue-500" },
      { name: "Protestant/Evan.", pct: 11.2, color: "bg-blue-500" },
      { name: "None", pct: 7.4, color: "bg-slate-400" },
      { name: "Others", pct: 3.4, color: "bg-purple-400" }
    ],
    ethnic: [
      { name: "Mestizo", pct: 62.0, color: "bg-orange-500" },
      { name: "Amerindian", pct: 21.0, color: "bg-blue-600" },
      { name: "White/European", pct: 16.0, color: "bg-slate-300" },
      { name: "Others", pct: 1.0, color: "bg-purple-400" }
    ]
  },
  'drc': {
    religion: [
      { name: "Roman Catholic", pct: 45.0, color: "bg-blue-500" },
      { name: "Protestant", pct: 40.0, color: "bg-blue-500" },
      { name: "Kimbanguist", pct: 10.0, color: "bg-amber-500" },
      { name: "Muslim", pct: 5.0, color: "bg-indigo-500" }
    ],
    ethnic: [
      { name: "Luba", pct: 18.0, color: "bg-amber-500" },
      { name: "Kongo", pct: 16.0, color: "bg-indigo-500" },
      { name: "Mongo", pct: 13.5, color: "bg-red-500" },
      { name: "Mangbetu-Azande", pct: 6.1, color: "bg-orange-500" },
      { name: "Others", pct: 46.4, color: "bg-slate-400" }
    ]
  },
  'nigeria': {
    religion: [
      { name: "Muslim", pct: 53.5, color: "bg-blue-500" },
      { name: "Christian", pct: 45.9, color: "bg-blue-500" },
      { name: "Traditional/Other", pct: 0.6, color: "bg-amber-600" }
    ],
    ethnic: [
      { name: "Hausa", pct: 30.0, color: "bg-blue-600" },
      { name: "Yoruba", pct: 21.0, color: "bg-indigo-500" },
      { name: "Igbo", pct: 18.0, color: "bg-amber-500" },
      { name: "Ijaw", pct: 10.0, color: "bg-blue-500" },
      { name: "Fulani", pct: 6.0, color: "bg-orange-500" },
      { name: "Kanuri", pct: 4.0, color: "bg-red-500" },
      { name: "Others", pct: 11.0, color: "bg-slate-400" }
    ]
  },
  'south-africa': {
    religion: [
      { name: "Christian", pct: 86.0, color: "bg-blue-500" },
      { name: "Traditional African", pct: 5.4, color: "bg-amber-500" },
      { name: "None", pct: 5.2, color: "bg-slate-400" },
      { name: "Muslim", pct: 1.9, color: "bg-blue-500" },
      { name: "Hindu", pct: 0.9, color: "bg-orange-500" },
      { name: "Others", pct: 0.6, color: "bg-zinc-400" }
    ],
    ethnic: [
      { name: "Black African", pct: 81.4, color: "bg-blue-600" },
      { name: "Coloured (mixed)", pct: 8.2, color: "bg-orange-450" },
      { name: "White", pct: 7.3, color: "bg-amber-100" },
      { name: "Indian/Asian", pct: 2.7, color: "bg-blue-500" },
      { name: "Other", pct: 0.4, color: "bg-slate-400" }
    ]
  },
  'ethiopia': {
    religion: [
      { name: "Orthodox Christian", pct: 43.8, color: "bg-blue-500" },
      { name: "Muslim", pct: 31.3, color: "bg-blue-500" },
      { name: "Protestant", pct: 22.8, color: "bg-cyan-500" },
      { name: "Traditional", pct: 0.6, color: "bg-amber-600" },
      { name: "Others", pct: 1.5, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Oromo", pct: 34.9, color: "bg-blue-600" },
      { name: "Amhara", pct: 26.9, color: "bg-amber-500" },
      { name: "Somali", pct: 6.4, color: "bg-cyan-500" },
      { name: "Tigrayan", pct: 6.0, color: "bg-orange-500" },
      { name: "Sidama", pct: 4.0, color: "bg-indigo-500" },
      { name: "Others", pct: 21.8, color: "bg-slate-400" }
    ]
  },
  'sudan': {
    religion: [
      { name: "Muslim (Sunni)", pct: 97.0, color: "bg-blue-500" },
      { name: "Christian/Trad.", pct: 3.0, color: "bg-blue-500" }
    ],
    ethnic: [
      { name: "Sudanese Arab", pct: 70.0, color: "bg-blue-600" },
      { name: "Fur, Beja, Nuba, etc.", pct: 30.0, color: "bg-amber-500" }
    ]
  },
  'chad': {
    religion: [
      { name: "Muslim", pct: 52.1, color: "bg-blue-500" },
      { name: "Protestant", pct: 23.9, color: "bg-cyan-500" },
      { name: "Roman Catholic", pct: 20.0, color: "bg-blue-500" },
      { name: "Traditional", pct: 3.0, color: "bg-amber-600" },
      { name: "Others", pct: 1.0, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Sara", pct: 27.7, color: "bg-blue-600" },
      { name: "Arab", pct: 12.3, color: "bg-teal-500" },
      { name: "Mayo-Kebbi", pct: 11.5, color: "bg-indigo-500" },
      { name: "Kanem-Bornu", pct: 9.0, color: "bg-blue-500" },
      { name: "Ouaddai", pct: 8.7, color: "bg-amber-500" },
      { name: "Hadjarai", pct: 6.7, color: "bg-red-500" },
      { name: "Others", pct: 24.1, color: "bg-slate-400" }
    ]
  },
  'niger': {
    religion: [
      { name: "Muslim (Sunni)", pct: 99.3, color: "bg-blue-500" },
      { name: "Traditional", pct: 0.4, color: "bg-amber-600" },
      { name: "Christian", pct: 0.3, color: "bg-blue-500" }
    ],
    ethnic: [
      { name: "Hausa", pct: 53.1, color: "bg-blue-600" },
      { name: "Zarma-Songhai", pct: 21.2, color: "bg-indigo-500" },
      { name: "Tuareg", pct: 11.0, color: "bg-orange-500" },
      { name: "Peul/Fulani", pct: 6.5, color: "bg-yellow-500" },
      { name: "Kanuri", pct: 5.9, color: "bg-red-500" },
      { name: "Others", pct: 2.3, color: "bg-slate-400" }
    ]
  },
  'iceland': {
    religion: [
      { name: "Christian (Lutheran)", pct: 75.0, color: "bg-blue-500" },
      { name: "Asatru & Heathen", pct: 1.5, color: "bg-amber-500" },
      { name: "None / Unspecified", pct: 23.5, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Icelandic", pct: 91.0, color: "bg-blue-600" },
      { name: "Polish", pct: 5.0, color: "bg-indigo-500" },
      { name: "Other Immigrants", pct: 4.0, color: "bg-slate-400" }
    ]
  },
  'tuvalu': {
    religion: [
      { name: "Church of Tuvalu (Congregational)", pct: 97.0, color: "bg-blue-500" },
      { name: "Seventh-day Adventist & Other", pct: 3.0, color: "bg-blue-500" }
    ],
    ethnic: [
      { name: "Tuvaluan (Polynesian)", pct: 96.0, color: "bg-blue-600" },
      { name: "Mixed Polynesian/Other", pct: 3.0, color: "bg-indigo-500" },
      { name: "Other", pct: 1.0, color: "bg-slate-400" }
    ]
  },
  'peru': {
    religion: [
      { name: "Roman Catholic", pct: 76.0, color: "bg-blue-500" },
      { name: "Evangelical", pct: 14.1, color: "bg-cyan-500" },
      { name: "Other / None", pct: 9.9, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Mestizo (mixed)", pct: 60.2, color: "bg-blue-600" },
      { name: "Quechua", pct: 22.3, color: "bg-amber-500" },
      { name: "White (European)", pct: 5.9, color: "bg-indigo-400" },
      { name: "Afro-Peruvian", pct: 3.6, color: "bg-rose-500" },
      { name: "Aymara", pct: 2.4, color: "bg-orange-500" },
      { name: "Others", pct: 5.6, color: "bg-slate-400" }
    ]
  },
  'rwanda': {
    religion: [
      { name: "Protestant", pct: 57.7, color: "bg-cyan-500" },
      { name: "Roman Catholic", pct: 38.2, color: "bg-blue-500" },
      { name: "Muslim", pct: 2.0, color: "bg-blue-500" },
      { name: "None / Other", pct: 2.1, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Hutu", pct: 84.0, color: "bg-blue-600" },
      { name: "Tutsi", pct: 15.0, color: "bg-amber-500" },
      { name: "Twa (Batwa)", pct: 1.0, color: "bg-orange-600" }
    ]
  },
  'kenya': {
    religion: [
      { name: "Christian (Protestant/Catholic)", pct: 85.5, color: "bg-blue-500" },
      { name: "Muslim", pct: 10.9, color: "bg-blue-500" },
      { name: "Traditional / No Belief", pct: 3.6, color: "bg-amber-600" }
    ],
    ethnic: [
      { name: "Kikuyu", pct: 17.1, color: "bg-blue-600" },
      { name: "Luhya", pct: 14.3, color: "bg-amber-500" },
      { name: "Kalenjin", pct: 13.4, color: "bg-orange-500" },
      { name: "Luo", pct: 10.7, color: "bg-cyan-500" },
      { name: "Kamba", pct: 9.8, color: "bg-indigo-500" },
      { name: "Others", pct: 34.7, color: "bg-slate-400" }
    ]
  },
  'thailand': {
    religion: [
      { name: "Buddhist", pct: 93.5, color: "bg-amber-500" },
      { name: "Muslim", pct: 5.4, color: "bg-blue-500" },
      { name: "Christian / Other", pct: 1.1, color: "bg-blue-500" }
    ],
    ethnic: [
      { name: "Thai", pct: 90.0, color: "bg-blue-600" },
      { name: "Khmer / Chinese / Malay / Karen", pct: 10.0, color: "bg-slate-400" }
    ]
  },
  'belgium': {
    religion: [
      { name: "Christian (Roman Catholic)", pct: 57.1, color: "bg-blue-500" },
      { name: "No Religion / Atheist", pct: 29.3, color: "bg-slate-400" },
      { name: "Muslim", pct: 6.8, color: "bg-blue-500" },
      { name: "Others", pct: 6.8, color: "bg-zinc-400" }
    ],
    ethnic: [
      { name: "Flemish", pct: 58.0, color: "bg-blue-600" },
      { name: "Walloon", pct: 31.0, color: "bg-amber-500" },
      { name: "Mixed / Foreign Origin", pct: 11.0, color: "bg-slate-400" }
    ]
  },
  'france': {
    religion: [
      { name: "Roman Catholic", pct: 47.0, color: "bg-blue-500" },
      { name: "No Religion", pct: 40.0, color: "bg-slate-400" },
      { name: "Muslim", pct: 4.0, color: "bg-blue-500" },
      { name: "Others", pct: 9.0, color: "bg-zinc-400" }
    ],
    ethnic: [
      { name: "French (Native European)", pct: 85.0, color: "bg-blue-600" },
      { name: "North African & Other Immigrant Origins", pct: 15.0, color: "bg-slate-400" }
    ]
  },
  'netherlands': {
    religion: [
      { name: "No Religion", pct: 57.2, color: "bg-slate-400" },
      { name: "Roman Catholic", pct: 18.3, color: "bg-blue-500" },
      { name: "Protestant (Calvinist/Lutheran)", pct: 13.6, color: "bg-cyan-500" },
      { name: "Muslim", pct: 5.6, color: "bg-blue-500" },
      { name: "Others", pct: 5.3, color: "bg-zinc-400" }
    ],
    ethnic: [
      { name: "Dutch", pct: 76.2, color: "bg-blue-600" },
      { name: "Other European Union", pct: 6.4, color: "bg-blue-400" },
      { name: "Turkish", pct: 2.4, color: "bg-red-500" },
      { name: "Moroccan", pct: 2.4, color: "bg-cyan-500" },
      { name: "Surinamese", pct: 2.1, color: "bg-amber-500" },
      { name: "Others", pct: 10.5, color: "bg-slate-400" }
    ]
  },
  'singapore': {
    religion: [
      { name: "Buddhist (including Taoist)", pct: 39.9, color: "bg-amber-500" },
      { name: "No Religion", pct: 20.0, color: "bg-slate-400" },
      { name: "Christian", pct: 18.9, color: "bg-blue-500" },
      { name: "Muslim", pct: 15.6, color: "bg-blue-500" },
      { name: "Hindu", pct: 5.0, color: "bg-orange-500" },
      { name: "Others", pct: 0.6, color: "bg-zinc-400" }
    ],
    ethnic: [
      { name: "Chinese", pct: 74.3, color: "bg-blue-600" },
      { name: "Malay", pct: 13.5, color: "bg-amber-500" },
      { name: "Indian", pct: 9.0, color: "bg-orange-500" },
      { name: "Others (Sovereign Expat/Eurasians)", pct: 3.2, color: "bg-slate-400" }
    ]
  },
  'uae': {
    religion: [
      { name: "Muslim (Sunni & Shi'a)", pct: 76.0, color: "bg-blue-500" },
      { name: "Christian", pct: 9.0, color: "bg-blue-500" },
      { name: "Hindu / Buddhist / Other", pct: 15.0, color: "bg-orange-500" }
    ],
    ethnic: [
      { name: "South Asian Expat", pct: 59.4, color: "bg-orange-400" },
      { name: "Emirati Citizen", pct: 11.6, color: "bg-blue-600" },
      { name: "Egyptian / Arab Expat", pct: 10.2, color: "bg-teal-500" },
      { name: "Other Expats (Western/Asian)", pct: 18.8, color: "bg-slate-400" }
    ]
  },
  'saudi-arabia': {
    religion: [
      { name: "Muslim (Official religion)", pct: 93.0, color: "bg-blue-500" },
      { name: "Other religions (Expatriates)", pct: 7.0, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Saudi Arab Citizen", pct: 62.1, color: "bg-blue-600" },
      { name: "Expatriate Workers (South/Southeast Asian, Arab)", pct: 37.9, color: "bg-slate-400" }
    ]
  },
  'turkey': {
    religion: [
      { name: "Muslim (Sunni / Alevi)", pct: 98.6, color: "bg-blue-500" },
      { name: "None / Other", pct: 1.4, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Turkish", pct: 75.0, color: "bg-blue-600" },
      { name: "Kurdish", pct: 18.0, color: "bg-orange-500" },
      { name: "Arab & Other Minorities", pct: 7.0, color: "bg-slate-400" }
    ]
  },
  'egypt': {
    religion: [
      { name: "Muslim (Predominantly Sunni)", pct: 90.0, color: "bg-blue-500" },
      { name: "Christian (Predominantly Coptic Orthodox)", pct: 10.0, color: "bg-blue-500" }
    ],
    ethnic: [
      { name: "Egyptian", pct: 99.7, color: "bg-teal-600" },
      { name: "Bedouin, Nubian & Arab Expats", pct: 0.3, color: "bg-amber-505" }
    ]
  },
  'ukraine': {
    religion: [
      { name: "Christian (Predominantly Eastern Orthodox / Greek Catholic)", pct: 88.0, color: "bg-blue-500" },
      { name: "None / Agnostic", pct: 10.0, color: "bg-slate-400" },
      { name: "Islam & Jewish", pct: 2.0, color: "bg-blue-500" }
    ],
    ethnic: [
      { name: "Ukrainian", pct: 82.4, color: "bg-yellow-500" },
      { name: "Russian Profile", pct: 14.5, color: "bg-red-500" },
      { name: "Romanian, Belarusian, Crimean Tatar & Others", pct: 3.1, color: "bg-teal-600" }
    ]
  },
  'indonesia': {
    religion: [
      { name: "Muslim", pct: 87.0, color: "bg-blue-500" },
      { name: "Protestant", pct: 7.0, color: "bg-blue-500" },
      { name: "Roman Catholic", pct: 3.0, color: "bg-indigo-500" },
      { name: "Hindu", pct: 1.7, color: "bg-amber-500" },
      { name: "Buddhist & Others", pct: 1.3, color: "bg-pink-500" }
    ],
    ethnic: [
      { name: "Javanese", pct: 40.1, color: "bg-blue-600" },
      { name: "Sundanese", pct: 15.5, color: "bg-teal-500" },
      { name: "Batak", pct: 3.6, color: "bg-blue-600" },
      { name: "Madurese", pct: 3.0, color: "bg-zinc-500" },
      { name: "Others (Chinese, Bugis, etc.)", pct: 37.8, color: "bg-slate-400" }
    ]
  },
  'iran': {
    religion: [
      { name: "Muslim (Shia)", pct: 90.0, color: "bg-blue-600" },
      { name: "Muslim (Sunni)", pct: 9.0, color: "bg-blue-400" },
      { name: "Other (Christian, Zoroastrian, Baha'i)", pct: 1.0, color: "bg-indigo-500" }
    ],
    ethnic: [
      { name: "Persian", pct: 61.0, color: "bg-teal-500" },
      { name: "Azeri", pct: 16.0, color: "bg-amber-500" },
      { name: "Kurd", pct: 10.0, color: "bg-orange-500" },
      { name: "Lor", pct: 6.0, color: "bg-rose-500" },
      { name: "Others (Baloch, Arab)", pct: 7.0, color: "bg-slate-400" }
    ]
  },
  'ireland': {
    religion: [
      { name: "Roman Catholic", pct: 69.0, color: "bg-blue-500" },
      { name: "None", pct: 14.5, color: "bg-slate-400" },
      { name: "Other Christian", pct: 8.5, color: "bg-cyan-500" },
      { name: "Muslim", pct: 1.6, color: "bg-blue-500" },
      { name: "Others", pct: 6.4, color: "bg-zinc-400" }
    ],
    ethnic: [
      { name: "White Irish", pct: 77.0, color: "bg-blue-600" },
      { name: "Other White", pct: 10.0, color: "bg-blue-400" },
      { name: "Asian", pct: 2.8, color: "bg-orange-500" },
      { name: "Black", pct: 1.5, color: "bg-slate-700" },
      { name: "Mixed/Others", pct: 8.7, color: "bg-slate-400" }
    ]
  },
  'italy': {
    religion: [
      { name: "Christian (predominantly Roman Catholic)", pct: 78.0, color: "bg-blue-500" },
      { name: "No Religion (Atheist/Agnostic)", pct: 16.0, color: "bg-slate-400" },
      { name: "Muslim", pct: 4.0, color: "bg-blue-500" },
      { name: "Other Religions", pct: 2.0, color: "bg-indigo-500" }
    ],
    ethnic: [
      { name: "Italian (Native)", pct: 92.0, color: "bg-blue-600" },
      { name: "Others (Romanian, North African, Asian)", pct: 8.0, color: "bg-slate-400" }
    ]
  },
  'cuba': {
    religion: [
      { name: "Christian (predominantly Catholic)", pct: 60.0, color: "bg-blue-500" },
      { name: "No Religion / Atheist", pct: 25.0, color: "bg-slate-400" },
      { name: "Afro-Cuban / Santería Beliefs", pct: 15.0, color: "bg-amber-500" }
    ],
    ethnic: [
      { name: "White (Spanish origin)", pct: 64.1, color: "bg-neutral-300" },
      { name: "Mulatto / Mixed", pct: 26.6, color: "bg-amber-600" },
      { name: "Black (African origin)", pct: 9.3, color: "bg-slate-700" }
    ]
  },
  'israel': {
    religion: [
      { name: "Jewish", pct: 73.5, color: "bg-blue-600" },
      { name: "Muslim", pct: 18.1, color: "bg-blue-500" },
      { name: "Christian", pct: 1.9, color: "bg-indigo-500" },
      { name: "Druze", pct: 1.6, color: "bg-purple-500" },
      { name: "Others / Unclassified", pct: 4.9, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Jewish (Sabra, European, Asian, African origins)", pct: 73.5, color: "bg-blue-500" },
      { name: "Arab", pct: 21.0, color: "bg-blue-600" },
      { name: "Others (Druze, Circassian)", pct: 5.5, color: "bg-slate-400" }
    ]
  },
  'japan': {
    religion: [
      { name: "Shintoism", pct: 48.6, color: "bg-orange-500" },
      { name: "Buddhism", pct: 46.3, color: "bg-amber-500" },
      { name: "Christianity", pct: 1.5, color: "bg-blue-500" },
      { name: "Others/None", pct: 3.6, color: "bg-slate-400" }
    ],
    ethnic: [
      { name: "Japanese", pct: 97.9, color: "bg-blue-600" },
      { name: "Chinese", pct: 0.6, color: "bg-red-500" },
      { name: "Korean", pct: 0.4, color: "bg-blue-500" },
      { name: "Others (Vietnamese/Filipino)", pct: 1.1, color: "bg-slate-400" }
    ]
  }
};
