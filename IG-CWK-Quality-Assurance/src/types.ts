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
