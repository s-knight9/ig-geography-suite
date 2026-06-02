
export type Subject = 'Geography' | 'ESS';

export interface Criterion {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  www: string | string[];
  ebi: string | string[];
  pitfall?: string;
  teacherScore?: number;
}

export interface WordCount {
  included: number;
  excluded: number;
  total: number;
  status: string;
}

export interface AnalysisResult {
  id?: string;
  subject?: Subject;
  isComparison?: false;
  fileName?: string;
  timestamp?: number;
  rawText?: string;
  criteria: Criterion[];
  totalScore: number;
  moderatedScore?: number;
  wordCount: WordCount;
  overallSummary: string;
}

export interface ComparativeResult {
  id?: string;
  subject?: Subject;
  isComparison: true;
  fileName1?: string;
  fileName2?: string;
  rawText?: string;
  timestamp?: number;
  criteriaComparison: {
    id: string;
    name: string;
    score1: number;
    score2: number;
    maxScore: number;
    www1: string | string[];
    ebi1: string | string[];
    www2: string | string[];
    ebi2: string | string[];
    feedback: string;
  }[];
  totalScore1: number;
  totalScore2: number;
  moderatedScore?: number;
  moderationNote: string;
  similaritiesReport: string;
}

export type AnyResult = AnalysisResult | ComparativeResult;

export interface CandidateRecord {
  id: string;
  subject?: Subject;
  studentName: string;
  date: string;
  score: number; // legacy/default score
  iaqa_score?: number;
  moderated_score?: number;
  report: AnyResult;
  submissionType?: 'Draft' | 'Final';
  draftRecord?: CandidateRecord;
  progressSummary?: string;
  scoreDelta?: number;
}

export interface AssignmentFolder {
  id: string;
  name: string;
  candidates: CandidateRecord[];
}

export interface ClassFolder {
  id: string;
  name: string;
  assignments: AssignmentFolder[];
}
