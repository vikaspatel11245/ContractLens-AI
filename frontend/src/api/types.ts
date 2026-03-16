export type RiskCategory =
  | 'liability'
  | 'ip'
  | 'payment'
  | 'termination'
  | 'data'
  | 'auto_renewal';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface ClauseResult {
  clause_id:   string;
  text:        string;
  page:        number;
  score:       number;
  category:    RiskCategory;
  severity:    Severity;
  reasoning:   string;
  suggestions: string[];
}

export interface AnalysisResponse {
  clauses:       ClauseResult[];
  overall_score: number;
  pdf_id:        string;
}