export interface CriterionResult {
  score: number;
  www: string[];
  ebi: string[];
}

export interface EvaluationResult {
  scores: {
    ao1_knowledge: CriterionResult;
    ao2_observation: CriterionResult;
    ao2_organisation: CriterionResult;
    ao2_analysis: CriterionResult;
    ao3_conclusion: CriterionResult;
  };
  total_score: number;
  word_counts: {
    evaluated_payload: number;
    excluded_ancillaries: number;
    raw_file_extract: number;
  };
  moderator_executive_summary: string;
}

export interface ComparativeCriterionResult {
  cwk1_score: number;
  cwk1_www: string[];
  cwk1_ebi: string[];
  cwk2_score: number;
  cwk2_www: string[];
  cwk2_ebi: string[];
  comparative_feedback: string;
}

export interface ComparativeEvaluationResult {
  cwk1_total_score: number;
  cwk2_total_score: number;
  moderator_executive_summary: string;
  academic_integrity_report: string;
  criteria: {
    ao1_knowledge: ComparativeCriterionResult;
    ao2_observation: ComparativeCriterionResult;
    ao2_organisation: ComparativeCriterionResult;
    ao2_analysis: ComparativeCriterionResult;
    ao3_conclusion: ComparativeCriterionResult;
  };
}

// Added StudentSubmission schema with Firebase Storage PDF tracking
export interface StudentSubmission {
  id?: string;
  candidateName: string;
  className: string;
  assignmentName: string;
  status: 'Draft' | 'Final';

  // Draft Stage Data
  draftEvaluation?: EvaluationResult;
  draftTeacherScores?: Record<string, number>;
  draftPdfUrl?: string;       // Persistent Firebase Storage Download URL
  draftStoragePath?: string;  // Storage ref path (for deleting/replacing)

  // Final Stage Data
  finalEvaluation?: EvaluationResult;
  finalTeacherScores?: Record<string, number>;
  finalPdfUrl?: string;       // Persistent Firebase Storage Download URL
  finalStoragePath?: string;  // Storage ref path (for deleting/replacing)

  // Draft vs Final Comparison Data
  comparativeEvaluation?: ComparativeEvaluationResult;

  updatedAt?: string;
}