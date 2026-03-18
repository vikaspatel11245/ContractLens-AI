import { useState } from 'react';
import type { ClauseResult } from '../api/types';
import { scoreToSeverity, SEVERITY_TOKENS, type Severity } from '../utils/riskColors';
import { BASE_URL } from '../api/analyze';

interface Props {
  pdfId: string;
  clauses: ClauseResult[];
  selectedClause: ClauseResult | null;
}

export default function PDFViewer({ pdfId, clauses, selectedClause }: Props) {
  const [useFallback, setUseFallback] = useState(false);
  const pdfUrl = `${BASE_URL}/api/pdf/${pdfId}`;
  const pages = [...new Set(clauses.map(c => c.page))].sort((a, b) => a - b);

  return (
    <div className="flex flex-col h-full">

      {/* Toolbar */}
      <div className="flex-none flex items-center justify-between px-4 py-2.5
                      border-b border-surface-border bg-surface-overlay">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-ink-secondary">Annotated Contract</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs text-ink-muted">
            {pages.length} pages · {clauses.length} clauses
          </span>

          <a
            href={pdfUrl}
            download
            className="font-mono text-2xs text-accent hover:text-accent-hover
                       border border-accent/30 hover:border-accent/60
                       rounded-lg px-2.5 py-1 transition-colors duration-150"
          >
            Download PDF
          </a>
        </div>
      </div>

      {/* PDF frame */}
      <div className="flex-1 overflow-hidden relative bg-surface-base">
        {!useFallback ? (
          <iframe
            key={selectedClause?.clause_id || 'root'}
            src={selectedClause ? `${pdfUrl}#page=${selectedClause.page}` : pdfUrl}
            className="w-full h-full border-0"
            title="Contract PDF"
            onError={() => setUseFallback(true)}
          />
        ) : (
          <ClauseFallback clauses={clauses} selectedClause={selectedClause} />
        )}
      </div>
    </div>
  );
}

function ClauseFallback({
  clauses,
  selectedClause,
}: {
  clauses: ClauseResult[];
  selectedClause: ClauseResult | null;
}) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <div className="panel p-3 mb-4">
        <p className="text-ink-muted text-xs font-mono text-center">
          PDF preview available after backend connects · showing clause text below
        </p>
      </div>

      {clauses.map((clause) => {
        const severity = scoreToSeverity(clause.score);
        const tokens = SEVERITY_TOKENS[severity];
        const isSelected = selectedClause?.clause_id === clause.clause_id;

        return (
          <div
            key={clause.clause_id}
            className="rounded-xl p-4 border transition-all duration-150"
            style={{
              borderColor: isSelected ? tokens.color : 'var(--surface-border)',
              backgroundColor: isSelected ? tokens.bg : 'var(--surface-raised)',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className={`badge-${severity}`}>{severity}</span>
              <span className="font-mono text-2xs text-ink-muted">
                p.{clause.page} · score {clause.score}/10
              </span>
            </div>

            <p className="text-ink-secondary text-sm leading-relaxed">
              {clause.text}
            </p>

            {clause.reasoning && (
              <p className="text-ink-muted text-xs mt-2 italic">
                {clause.reasoning}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}