import type { AnalysisResponse } from '../api/types';
import { scoreToSeverity, overallScoreToSeverity, overallScoreToVerdict, SEVERITY_TOKENS } from '../utils/riskColors';

interface Props {
  analysis: AnalysisResponse;
}

export default function ScoreCard({ analysis }: Props) {
  const severity = overallScoreToSeverity(analysis.overall_score);
  const verdict  = overallScoreToVerdict(analysis.overall_score);
  const tokens   = SEVERITY_TOKENS[severity];

  const counts = {
    critical: analysis.clauses.filter(c => scoreToSeverity(c.score) === 'critical').length,
    high:     analysis.clauses.filter(c => scoreToSeverity(c.score) === 'high').length,
    medium:   analysis.clauses.filter(c => scoreToSeverity(c.score) === 'medium').length,
    low:      analysis.clauses.filter(c => scoreToSeverity(c.score) === 'low').length,
  };

  const top3 = [...analysis.clauses]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="flex items-center gap-6 h-full">

      {/* ── Score circle ─────────────────────────────────────────── */}
      <div
        className="flex-none w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2"
        style={{ borderColor: tokens.color, backgroundColor: tokens.bg }}
      >
        <span className="font-mono text-2xl font-bold leading-none" style={{ color: tokens.color }}>
          {analysis.overall_score}
        </span>
        <span className="font-mono text-2xs text-ink-muted">/100</span>
      </div>

      {/* ── Verdict + counts ─────────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-sm font-semibold"
            style={{ color: tokens.color }}
          >
            {verdict}
          </span>
          <span className="text-ink-muted text-xs">·</span>
          <span className="text-ink-muted text-xs">{analysis.clauses.length} clauses</span>
        </div>

        {/* Severity pills */}
        <div className="flex items-center gap-2">
          {(Object.entries(counts) as [keyof typeof counts, number][])
            .filter(([, n]) => n > 0)
            .map(([sev, n]) => (
              <span key={sev} className={`badge-${sev}`}>{n} {sev}</span>
            ))
          }
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="hidden lg:block w-px h-10 bg-surface-border mx-2" />

      {/* ── Top 3 flags ──────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col gap-1.5">
        <p className="data-label mb-0.5">Top risks</p>
        {top3.map((c) => {
          const t = SEVERITY_TOKENS[scoreToSeverity(c.score)];
          return (
            <div key={c.clause_id} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-none" style={{ backgroundColor: t.color }} />
              <span className="text-xs text-ink-secondary truncate max-w-[200px]">{c.text}</span>
              <span className="font-mono text-2xs ml-auto pl-2" style={{ color: t.color }}>
                {c.score}/10
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}