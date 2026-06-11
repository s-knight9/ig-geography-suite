export interface Poll {
  id: number;
  date: string;
  question: string;
  source_url?: string;
  dp_tag?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  hasVoted?: boolean;
  userSelection?: string;
  results?: PollResults;
  tags?: string[];
}

export interface PollResults {
  A: number;
  B: number;
  C: number;
  D: number;
  total: number;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
  tags: string[];
}

export interface OutletData {
  name: string;
  color: string;
  textColor?: string;
  logo: string;
  items: NewsItem[];
}

export const TAG_COLORS: Record<string, string> = {
  'PH1: Rivers': 'bg-[#facc15] text-[#422006] border-[#eab308]',
  'PH2: Coasts': 'bg-[#1d4ed8] text-white border-[#1e40af]',
  'PH3: Ecosystems': 'bg-[#a855f7] text-white border-[#9333ea]',
  'PH4: Tectonics': 'bg-[#dc2626] text-white border-[#b91c1c]',
  'PH5: Climate Change': 'bg-[#06b6d4] text-[#083344] border-[#0891b2]',
  'HU6: Pop': 'bg-[#db2777] text-white border-[#be185d]',
  'HU7: Towns & Cities': 'bg-[#7f1d1d] text-white border-[#450a0a]',
  'HU8: Dev': 'bg-[#f97316] text-white border-[#ea580c]',
  'HU9: Economies': 'bg-[#fde047] text-[#422006] border-[#ca8a04]',
  'HU10: Resources': 'bg-[#22c55e] text-[#052e16] border-[#16a34a]',
};

export const TAG_LABELS: Record<string, string> = {
  'PH1: Rivers': 'Changing River Environments',
  'PH2: Coasts': 'Changing Coastal Environments',
  'PH3: Ecosystems': 'Changing Ecosystems',
  'PH4: Tectonics': 'Tectonic Hazards',
  'PH5: Climate Change': 'Climate Change',
  'HU6: Pop': 'Changing Populations',
  'HU7: Towns & Cities': 'Changing Towns and Cities',
  'HU8: Dev': 'Development',
  'HU9: Economies': 'Changing Economies',
  'HU10: Resources': 'Resource Provision',
};
