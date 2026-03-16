import { useState } from 'react'
import type { ClauseResult } from '../api/types'
import {
  scoreToHex,
  scoreToSeverity,
  SEVERITY_TOKENS
} from '../utils/riskColors'

interface Props {
  clauses: ClauseResult[]
  selectedClauseId: string | null
  onSelect: (clause: ClauseResult) => void
}

export default function RiskHeatmap({
  clauses,
  selectedClauseId,
  onSelect
}: Props) {

  const [hoveredId, setHoveredId] =
    useState<string | null>(null)

  const hoveredClause =
    clauses.find(c => c.clause_id === hoveredId) ?? null

  return (

    <div id="heatmap-export" className="space-y-3">

      {/* LEGEND */}

      <div className="flex items-center gap-3 flex-wrap">

        {LEGEND.map(l => (

          <div key={l.severity} className="flex items-center gap-1.5">

            <div
              className="w-3 h-3 rounded-sm flex-none"
              style={{ backgroundColor: l.color }}
            />

            <span className="font-mono text-2xs text-ink-muted">
              {l.label}
            </span>

          </div>

        ))}

      </div>



      {/* HEATMAP GRID */}

      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns:
            'repeat(auto-fill, minmax(28px, 1fr))',
          minHeight: '80px'
        }}
        role="grid"
        aria-label="Contract risk heatmap"
      >

        {clauses.map((clause, i) => {

          const hex = scoreToHex(clause.score)

          const isSelected =
            selectedClauseId === clause.clause_id

          const isHovered =
            hoveredId === clause.clause_id

          return (

            <button
              key={clause.clause_id}
              role="gridcell"
              aria-selected={isSelected}
              aria-label={`Clause ${i + 1}, risk score ${clause.score}`}
              onClick={() => onSelect(clause)}
              onMouseEnter={() => setHoveredId(clause.clause_id)}
              onMouseLeave={() => setHoveredId(null)}

              className={`
                aspect-square rounded
                flex items-center justify-center
                text-[10px] font-bold text-black
                transition-all duration-150

                ${isSelected
                  ? 'ring-2 ring-white/60 scale-110 z-10'
                  : ''}

                ${isHovered && !isSelected
                  ? 'scale-110 z-10'
                  : ''}
              `}

              style={{
                backgroundColor: hex,
                opacity: isSelected || isHovered ? 1 : 0.85,

                boxShadow: isSelected
                  ? `0 0 0 2px ${hex}60, 0 4px 12px ${hex}40`
                  : isHovered
                  ? `0 2px 8px ${hex}50`
                  : undefined
              }}
            >

              {/* score number */}
              {clause.score}

            </button>

          )

        })}

      </div>



      {/* TOOLTIP */}

      <HoverTooltip clause={hoveredClause} />



      {/* SEVERITY SUMMARY */}

      <SeveritySummary clauses={clauses} />

    </div>
  )
}




function HoverTooltip({
  clause
}: {
  clause: ClauseResult | null
}) {

  if (!clause) {

    return (

      <div className="h-20 panel p-3 flex items-center justify-center">

        <p className="text-ink-muted text-xs font-mono">
          Hover a cell to preview
        </p>

      </div>

    )

  }

  const severity = scoreToSeverity(clause.score)
  const tokens = SEVERITY_TOKENS[severity]

  return (

    <div
      className="panel p-3 space-y-2 animate-fade-up h-20 overflow-hidden"
      style={{ borderColor: tokens.border }}
    >

      {/* TOP ROW */}

      <div className="flex items-center justify-between gap-2">

        <span
          className={`badge-${severity} text-2xs`}
          style={{
            backgroundColor: tokens.bg,
            color: tokens.color,
            borderColor: tokens.border
          }}
        >
          {tokens.label}
        </span>

        <span className="font-mono text-2xs text-ink-muted">
          score {clause.score}/10 · p.{clause.page}
        </span>

      </div>



      {/* CATEGORY */}

      <p className="text-[10px] font-mono text-accent capitalize">
        {clause.category.replace(/_/g, ' ')}
      </p>



      {/* CLAUSE TEXT */}

      <p className="text-ink-secondary text-xs leading-snug line-clamp-2">

        {clause.text}

      </p>

    </div>

  )

}




function SeveritySummary({
  clauses
}: {
  clauses: ClauseResult[]
}) {

  const counts = {
    critical: clauses.filter(c => scoreToSeverity(c.score) === 'critical').length,
    high:     clauses.filter(c => scoreToSeverity(c.score) === 'high').length,
    medium:   clauses.filter(c => scoreToSeverity(c.score) === 'medium').length,
    low:      clauses.filter(c => scoreToSeverity(c.score) === 'low').length,
  }

  return (

    <div className="grid grid-cols-4 gap-1.5 pt-1">

      {(Object.entries(counts) as [keyof typeof counts, number][])
        .map(([sev, count]) => {

          const tokens = SEVERITY_TOKENS[sev]

          return (

            <div
              key={sev}
              className="rounded-lg p-2 text-center border"
              style={{
                backgroundColor: tokens.bg,
                borderColor: tokens.border
              }}
            >

              <p
                className="font-mono text-sm font-semibold"
                style={{ color: tokens.color }}
              >
                {count}
              </p>

              <p className="font-mono text-2xs text-ink-muted capitalize mt-0.5">
                {sev}
              </p>

            </div>

          )

        })}

    </div>

  )

}




const LEGEND = [

  {
    severity: 'low',
    color: '#C0DD97',
    label: 'Low 1–3'
  },

  {
    severity: 'medium',
    color: '#FAC775',
    label: 'Medium 4–6'
  },

  {
    severity: 'high',
    color: '#F09595',
    label: 'High 7–8'
  },

  {
    severity: 'critical',
    color: '#F7C1C1',
    label: 'Critical 9–10'
  }

]