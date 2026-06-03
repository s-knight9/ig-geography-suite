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
  'SL1': 'bg-[#cedb56] text-[#4a4e1a] border-[#b0b94b]',
  'SL2': 'bg-[#659b36] text-white border-[#4d7829]',
  'SL3': 'bg-[#52d0a0] text-teal-950 border-[#3fa37c]',
  'HL4': 'bg-[#5eb6cc] text-cyan-950 border-[#478f9e]',
  'HL5': 'bg-[#0c59b6] text-white border-[#08458e]',
  'HL6': 'bg-[#50328a] text-white border-[#3d266a]',
  'OPA': 'bg-[#cedb56] text-[#4a4e21] border-[#b2b950]',
  'OPD': 'bg-[#50b9cf] text-cyan-950 border-[#3d92a4]',
  'OPE': 'bg-[#0e52a8] text-white border-[#0a3f82]',
};

export const TAG_LABELS: Record<string, string> = {
  'SL1': 'Changing Populations',
  'SL2': 'Global Climate, Vulnerability & Resilience',
  'SL3': 'Global Resource Consumption & Security',
  'HL4': 'Power, Places & Networks',
  'HL5': 'Human Development & Diversity',
  'HL6': 'Global Risk & Resilience',
  'OPA': 'Freshwater',
  'OPD': 'Geophysical Hazards',
  'OPE': 'Leisure, Tourism & Sport',
};
