import { useState } from 'react';
import type { ClauseResult } from '../api/types';
import { SEVERITY_TOKENS } from '../utils/riskColors';

interface Props {
  clause:     ClauseResult;
  isSelected: boolean;
  onClick:    () => void;
}

export default function NegotiationCard({ clause, isSelected, onClick }: Props) {
  const tokens = SEVERITY_TOKENS[clause.severity];
  const [copied, setCopied] = useState<number | null>(null);

  function handleCopy(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  if (clause.suggestions.length === 0) return null;

  return (
    <div
      className="rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden"
      style={{
        borderColor:     isSelected ? tokens.color : 'var(--surface-border)',
        backgroundColor: isSelected ? tokens.bg    : 'var(--surface-raised)',
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`badge-${clause.severity}`}>{clause.severity}</span>
            <span className="font-mono text-2xs text-ink-muted capitalize">
              {clause.category.replace('_', ' ')}
            </span>
            <span className="font-mono text-2xs text-ink-muted ml-auto">
              {clause.score}/10
            </span>
          </div>
          <p className="text-ink-secondary text-xs leading-snug line-clamp-2">
            {clause.text}
          </p>
        </div>
      </div>

      {/* Reasoning */}
      <div className="px-4 pb-3">
        <p className="text-ink-muted text-xs italic leading-snug">
          {clause.reasoning}
        </p>
      </div>

      {/* Suggestions — only when selected */}
      {isSelected && (
        <div
          className="border-t px-4 py-3 space-y-2.5 animate-fade-up"
          style={{ borderColor: tokens.border }}
        >
          <p className="data-label">Suggested rewrites</p>
          {clause.suggestions.map((s, i) => (
            <div
              key={i}
              className="rounded-lg p-3 border text-xs text-ink-secondary leading-relaxed relative group"
              style={{ borderColor: tokens.border, backgroundColor: 'var(--surface-overlay)' }}
            >
              {s}
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy(s, i); }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
                           font-mono text-2xs px-2 py-0.5 rounded border
                           transition-all duration-150"
                style={{
                  color:           copied === i ? tokens.color  : 'var(--ink-muted)',
                  borderColor:     copied === i ? tokens.border : 'var(--surface-muted)',
                  backgroundColor: 'var(--surface-raised)',
                }}
              >
                {copied === i ? 'copied' : 'copy'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}