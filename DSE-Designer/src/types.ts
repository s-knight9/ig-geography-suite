export const syllabusCodes = [
  { id: 'PH1', name: 'PH1: Changing River Environments' },
  { id: 'PH2', name: 'PH2: Changing Coastal Environments' },
  { id: 'PH3', name: 'PH3: Changing Ecosystems' },
  { id: 'PH4', name: 'PH4: Tectonic Hazards' },
  { id: 'PH5', name: 'PH5: Climate Change' },
  { id: 'HU6', name: 'HU6: Changing Population' },
  { id: 'HU7', name: 'HU7: Changing Towns & Cities' },
  { id: 'HU8', name: 'HU8: Development' },
  { id: 'HU9', name: 'HU9: Changing Economies' },
  { id: 'HU10', name: 'HU10: Resource Provision' },
];

export type SyllabusCodeId = typeof syllabusCodes[number]['id'];

export interface GenerateRequest {
  prompt: string;
  files?: File[];
  urls: string[];
  syllabusCode: SyllabusCodeId;
}

export interface GenerateResponse {
  result: string;
  error?: string;
}
