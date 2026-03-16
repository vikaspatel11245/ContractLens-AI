export interface ClauseResult {
  clause_id: string
  text: string
  page: number
  score: number
  category: string
  severity: string
  reasoning: string
  suggestions: string[]
  ask_for?: string
}

export interface AnalysisResponse {
  clauses: ClauseResult[]
  overall_score: number
  pdf_id: string
}