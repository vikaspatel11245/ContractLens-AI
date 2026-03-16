import type { AnalysisResponse } from '../api/types';

interface Props {
  analysis: AnalysisResponse;
  fileName: string;
  onReset:  () => void;
}

export default function DashboardPage({ analysis, fileName }: Props) {
  return (
    <div className="h-[calc(100vh-var(--header-h))] overflow-hidden flex flex-col">
      <div className="flex-none h-24 border-b border-surface-border px-6 flex items-center gap-6">
        <div className="skeleton h-10 w-36" />
        <div className="skeleton h-4 w-48" />
        <div className="ml-auto skeleton h-8 w-32" />
      </div>
      <div
        className="flex-1 overflow-hidden grid"
        style={{ gridTemplateColumns: '1fr 1.6fr 1fr', gap: '16px', padding: '16px' }}
      >
        <aside className="panel overflow-y-auto flex flex-col gap-4 p-4">
          <p className="data-label">Risk Heatmap</p>
          <div className="skeleton h-40 w-full" />
          <div className="divider" />
          <p className="data-label">Clauses ({analysis.clauses.length})</p>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
        </aside>
        <main className="panel overflow-hidden flex flex-col">
          <div className="flex-none flex items-center px-4 py-3 border-b border-surface-border">
            <p className="data-label">{fileName}</p>
          </div>
          <div className="flex-1 bg-surface-base flex items-center justify-center">
            <p className="text-ink-muted text-sm font-mono">PDF Viewer — Phase 3</p>
          </div>
        </main>
        <aside className="panel overflow-y-auto flex flex-col gap-4 p-4">
          <p className="data-label">Negotiation Suggestions</p>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 w-full" />)}
        </aside>
      </div>
    </div>
  );
}