import { exportHeatmapPNG } from '../utils/exportUtils'
import { useState } from 'react'
import type { AnalysisResponse, ClauseResult } from '../api/types'

import ScoreCard from '../components/ScoreCard'
import RiskHeatmap from '../components/RiskHeatmap'
import PDFViewer from '../components/PDFViewer'
import NegotiationCard from '../components/NegotiationCard'

import { scoreToSeverity, SEVERITY_TOKENS } from '../utils/riskColors'

interface Props {
  analysis: AnalysisResponse
  fileName: string
  onReset: () => void
}

export default function DashboardPage({ analysis, fileName }: Props) {

  const [selectedClause, setSelectedClause] =
    useState<ClauseResult | null>(null)

  const sortedClauses = [...analysis.clauses]
    .sort((a, b) => b.score - a.score)

  const topRiskClauses = sortedClauses.slice(0, 5)

  const negotiationClauses = sortedClauses
    .filter(c => c.suggestions.length > 0)

  const top3 = sortedClauses.slice(0, 3)

  return (
    <div className="min-h-[calc(100vh-var(--header-h))] flex flex-col lg:h-[calc(100vh-var(--header-h))] lg:overflow-hidden">

      {/* HEADER */}
      <div className="flex-none border-b border-surface-border p-4 lg:px-6 lg:h-24">

        <div className="h-full flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-6">

          <ScoreCard analysis={analysis} />

          {/* TOP RISKS QUICK VIEW */}
          <div className="hidden xl:flex flex-col text-xs text-ink-muted">
            <span className="font-mono mb-1">Top Risks</span>

            <div className="flex gap-3">
              {top3.map(c => (
                <span key={c.clause_id}>
                  {c.category.replace(/_/g, ' ')} {c.score}/10
                </span>
              ))}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">

            <span className="hidden lg:block font-mono text-xs text-ink-muted">
              {fileName}
            </span>

            <button
              onClick={() => exportHeatmapPNG(analysis, fileName)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-surface-overlay border border-surface-border
                         text-ink-secondary text-xs font-medium
                         hover:border-accent/50 hover:text-accent
                         transition-colors duration-150"
            >
              <PNGIcon /> Export Heatmap
            </button>

          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[280px_1fr_300px] gap-3 p-3 lg:overflow-hidden">

        {/* LEFT PANEL */}
        <aside className="panel flex flex-col gap-4 p-4 lg:overflow-y-auto shrink-0">

          <p className="data-label">Risk Heatmap</p>

          <RiskHeatmap
            clauses={analysis.clauses}
            selectedClauseId={selectedClause?.clause_id ?? null}
            onSelect={setSelectedClause}
          />

          <div className="divider" />

          <p className="data-label">Top Risk Clauses</p>

          <div className="space-y-2">

            {topRiskClauses.map(clause => (
              <ClauseCard
                key={clause.clause_id}
                clause={clause}
                isSelected={
                  selectedClause?.clause_id === clause.clause_id
                }
                onSelect={() =>
                  setSelectedClause(
                    selectedClause?.clause_id === clause.clause_id
                      ? null
                      : clause
                  )
                }
              />
            ))}

          </div>
        </aside>

        {/* CENTER PANEL */}
        <main className="panel flex flex-col lg:overflow-hidden min-h-[500px] lg:min-h-0 shrink-0">

          <PDFViewer
            pdfId={analysis.pdf_id}
            clauses={analysis.clauses}
            selectedClause={selectedClause}
          />

        </main>

        {/* RIGHT PANEL */}
        <aside className="panel flex flex-col gap-3 p-4 lg:overflow-y-auto shrink-0">

          <p className="data-label">
            Negotiation Suggestions
            <span className="ml-2 text-accent font-mono normal-case">
              {negotiationClauses.length}
            </span>
          </p>

          {negotiationClauses.map(clause => (
            <NegotiationCard
              key={clause.clause_id}
              clause={clause}
              isSelected={
                selectedClause?.clause_id === clause.clause_id
              }
              onClick={() =>
                setSelectedClause(
                  selectedClause?.clause_id === clause.clause_id
                    ? null
                    : clause
                )
              }
            />
          ))}

        </aside>
      </div>
    </div>
  )
}






function ClauseCard({
  clause,
  isSelected,
  onSelect,
}: {
  clause: ClauseResult
  isSelected: boolean
  onSelect: () => void
}) {

  const severity = scoreToSeverity(clause.score)
  const tokens = SEVERITY_TOKENS[severity]

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-xl border
                 transition-all duration-200 overflow-hidden"
      style={{
        borderColor: isSelected
          ? tokens.color
          : 'var(--surface-border)',
        backgroundColor: isSelected
          ? tokens.bg
          : 'var(--surface-raised)',
      }}
    >

      {/* HEADER */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">

        <span className={`badge-${severity}`}>
          {severity}
        </span>

        <span
          className="font-mono text-2xs px-1.5 py-0.5 rounded border capitalize"
          style={{
            color: tokens.color,
            borderColor: tokens.border,
            backgroundColor: 'var(--surface-overlay)',
          }}
        >
          {clause.category.replace(/_/g, ' ')}
        </span>

        <span className="font-mono text-2xs text-ink-muted ml-auto">
          {clause.score}/10
        </span>

      </div>

      {/* TEXT */}
      <div className="px-3 pb-2">

        <p
          className={`text-xs text-ink-secondary leading-snug ${
            isSelected ? '' : 'line-clamp-2'
          }`}
        >
          {clause.text}
        </p>

      </div>

      {/* EXPANDED */}
      {isSelected && (

        <div
          className="border-t px-3 py-3 space-y-2"
          style={{ borderColor: tokens.border }}
        >

          <p className="font-mono text-2xs text-ink-muted uppercase">
            Why risky
          </p>

          <p className="text-xs text-ink-secondary italic">
            {clause.reasoning}
          </p>

          {clause.suggestions.length > 0 && (
            <p className="font-mono text-2xs text-accent">
              ✦ {clause.suggestions.length} negotiation rewrite
            </p>
          )}

        </div>
      )}

    </button>
  )
}





function PNGIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1v8M4 6l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 10v1.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}