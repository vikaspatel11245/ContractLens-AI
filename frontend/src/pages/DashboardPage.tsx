import { useState } from 'react';
import type { AnalysisResponse, ClauseResult } from '../api/types';
import ScoreCard       from '../components/ScoreCard';
import RiskHeatmap     from '../components/RiskHeatmap';
import PDFViewer       from '../components/PDFViewer';
import NegotiationCard from '../components/NegotiationCard';
import { SEVERITY_TOKENS } from '../utils/riskColors';

interface Props {
  analysis: AnalysisResponse;
  fileName: string;
  onReset:  () => void;
}

export default function DashboardPage({ analysis, fileName }: Props) {
  const [selectedClause, setSelectedClause] = useState<ClauseResult | null>(null);

  const negotiationClauses = [...analysis.clauses]
    .filter(c => c.suggestions.length > 0)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="h-[calc(100vh-var(--header-h))] overflow-hidden flex flex-col">

      {/* Top strip */}
      <div className="flex-none h-24 border-b border-surface-border px-6">
        <div className="h-full flex items-center gap-4">
          <ScoreCard analysis={analysis} />
          <div className="ml-auto">
            <span className="font-mono text-xs text-ink-muted">{fileName}</span>
          </div>
        </div>
      </div>

      {/* 3-column body */}
      <div
        className="flex-1 overflow-hidden grid"
        style={{ gridTemplateColumns: '320px 1fr 340px', gap: '12px', padding: '12px' }}
      >
        {/* LEFT */}
        <aside className="panel overflow-y-auto flex flex-col gap-4 p-4">
          <p className="data-label">Risk Heatmap</p>
          <RiskHeatmap
            clauses={analysis.clauses}
            selectedClauseId={selectedClause?.clause_id ?? null}
            onSelect={setSelectedClause}
          />
          <div className="divider" />
          <p className="data-label">All Clauses</p>
          <div className="space-y-2">
            {[...analysis.clauses]
              .sort((a, b) => b.score - a.score)
              .map((clause) => {
                const tokens     = SEVERITY_TOKENS[clause.severity];
                const isSelected = selectedClause?.clause_id === clause.clause_id;
                return (
                  <button
                    key={clause.clause_id}
                    onClick={() => setSelectedClause(isSelected ? null : clause)}
                    className="w-full text-left rounded-xl p-3 border transition-all duration-150"
                    style={{
                      borderColor:     isSelected ? tokens.color : 'var(--surface-border)',
                      backgroundColor: isSelected ? tokens.bg    : 'var(--surface-raised)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge-${clause.severity}`}>{clause.severity}</span>
                      <span className="font-mono text-2xs text-ink-muted ml-auto">
                        {clause.score}/10
                      </span>
                    </div>
                    <p className="text-xs text-ink-secondary leading-snug line-clamp-2">
                      {clause.text}
                    </p>
                  </button>
                );
              })}
          </div>
        </aside>

        {/* CENTER */}
        <main className="panel overflow-hidden flex flex-col">
          <PDFViewer
            pdfId={analysis.pdf_id}
            clauses={analysis.clauses}
            selectedClause={selectedClause}
          />
        </main>

        {/* RIGHT */}
        <aside className="panel overflow-y-auto flex flex-col gap-3 p-4">
          <p className="data-label">
            Negotiation Suggestions
            <span className="ml-2 text-accent font-mono normal-case">
              {negotiationClauses.length}
            </span>
          </p>
          {negotiationClauses.map((clause) => (
            <NegotiationCard
              key={clause.clause_id}
              clause={clause}
              isSelected={selectedClause?.clause_id === clause.clause_id}
              onClick={() => setSelectedClause(
                selectedClause?.clause_id === clause.clause_id ? null : clause
              )}
            />
          ))}
        </aside>
      </div>
    </div>
  );
}