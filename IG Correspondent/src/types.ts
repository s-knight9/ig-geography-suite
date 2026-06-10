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
  'PH1': 'bg-[#facc15] text-[#422006] border-[#eab308]',
  'PH2': 'bg-[#1d4ed8] text-white border-[#1e40af]',
  'PH3': 'bg-[#a855f7] text-white border-[#9333ea]',
  'PH4': 'bg-[#dc2626] text-white border-[#b91c1c]',
  'PH5': 'bg-[#06b6d4] text-[#083344] border-[#0891b2]',
  'HU6': 'bg-[#db2777] text-white border-[#be185d]',
  'HU7': 'bg-[#7f1d1d] text-white border-[#450a0a]',
  'HU8': 'bg-[#f97316] text-white border-[#ea580c]',
  'HU9': 'bg-[#fde047] text-[#422006] border-[#ca8a04]',
  'HU10': 'bg-[#22c55e] text-[#052e16] border-[#16a34a]',
};

export const TAG_LABELS: Record<string, string> = {
  'PH1': 'Changing River Environments',
  'PH2': 'Changing Coastal Environments',
  'PH3': 'Changing Ecosystems',
  'PH4': 'Tectonic Hazards',
  'PH5': 'Climate Change',
  'HU6': 'Changing Populations',
  'HU7': 'Changing Towns and Cities',
  'HU8': 'Development',
  'HU9': 'Changing Economies',
  'HU10': 'Resource Provision',
};
