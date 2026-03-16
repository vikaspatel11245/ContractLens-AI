import { useEffect, useState } from 'react';
import { STAGE_LABELS, STAGE_DURATIONS, type Stage } from '../api/analyze';

// ─────────────────────────────────────────────────────────────────────────────
// AnalyzingScreen
// Shown after upload completes while AI is processing.
// Auto-advances through stages with simulated timing.
// ─────────────────────────────────────────────────────────────────────────────

const PROCESSING_STAGES: Stage[] = ['extracting', 'analyzing', 'generating'];

interface AnalyzingScreenProps {
  uploadPercent: number;   // 0–100 (real upload progress)
  currentStage:  Stage;
}

// Maps each stage to its starting progress percentage on the unified bar
const STAGE_START: Record<Stage, number> = {
  idle:       0,
  uploading:  0,
  extracting: 30,
  analyzing:  50,
  generating: 80,
  done:       100,
  error:      0,
};

export function AnalyzingScreen({ uploadPercent, currentStage }: AnalyzingScreenProps) {
  // Simulate sub-stage progress bar within each processing stage
  const [stageProgress, setStageProgress] = useState(0);

  useEffect(() => {
    setStageProgress(0);
    const duration = STAGE_DURATIONS[currentStage] ?? 3000;
    const interval = 80;
    const steps    = duration / interval;
    let count      = 0;

    const timer = setInterval(() => {
      count++;
      // Ease-out: fast start, slow near 90% (never reaches 100 — server controls completion)
      const raw = count / steps;
      setStageProgress(Math.min(90, Math.round(raw * 100 * (1 - raw * 0.5))));
      if (count >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [currentStage]);

  const allStages: Stage[] = ['uploading', ...PROCESSING_STAGES];
  const currentIdx = allStages.indexOf(currentStage);

  // Compute the unified progress value that never goes backwards
  const progress = (() => {
    if (currentStage === 'done') return 100;
    if (currentStage === 'error') return 0;
    
    const start = STAGE_START[currentStage] ?? 0;
    const nextStage = allStages[currentIdx + 1] || 'done';
    const end = STAGE_START[nextStage] ?? 100;
    const diff = end - start;

    if (currentStage === 'uploading') {
      return Math.round(start + (uploadPercent / 100) * diff);
    }
    // For other stages, interpolate using the simulated stageProgress
    return Math.round(start + (stageProgress / 100) * diff);
  })();

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-8 animate-fade-up">

      {/* ── Pulsing logo animation ──────────────────────────────────────── */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-surface-overlay border border-surface-border
                        flex items-center justify-center">
          <HeatmapSpinner />
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-2xl animate-pulse-risk
                        ring-2 ring-accent/30 pointer-events-none" />
      </div>

      {/* ── Stage steps ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-xs space-y-3">
        {allStages.map((stage, i) => {
          const isDone    = i < currentIdx;
          const isActive  = stage === currentStage;
          const isPending = i > currentIdx;

          return (
            <div key={stage} className="flex items-center gap-3">
              {/* Step indicator */}
              <div className={`
                flex-none w-6 h-6 rounded-full flex items-center justify-center
                transition-all duration-300 text-xs font-mono font-semibold
                ${isDone    ? 'bg-accent/20 text-accent border border-accent/50' : ''}
                ${isActive  ? 'bg-accent text-ink-inverse animate-pulse' : ''}
                ${isPending ? 'bg-surface-overlay text-ink-muted border border-surface-border' : ''}
              `}>
                {isDone ? '✓' : i + 1}
              </div>

              {/* Label */}
              <span className={`
                text-sm transition-colors duration-300
                ${isActive  ? 'text-ink-primary font-medium' : ''}
                ${isDone    ? 'text-ink-secondary line-through' : ''}
                ${isPending ? 'text-ink-muted' : ''}
              `}>
                {STAGE_LABELS[stage]}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Progress bar ────────────────────────────────────────────────── */}
      <div className="w-full max-w-xs space-y-2">
        <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full ease-out"
            style={{
              width: `${progress}%`,
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-2xs text-ink-muted">
            {STAGE_LABELS[currentStage]}
          </span>
          <span className="font-mono text-2xs text-ink-muted">
            {progress}%
          </span>
        </div>
      </div>

      <p className="text-ink-muted text-xs text-center max-w-[240px]">
        AI is reading every clause — this takes 10–30 seconds
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DashboardSkeleton
// Shown in the dashboard while data is loading / before first render.
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="h-[calc(100vh-var(--header-h))] overflow-hidden flex flex-col animate-fade-up">
      {/* Top strip */}
      <div className="flex-none h-24 border-b border-surface-border px-6 flex items-center gap-6">
        <div className="skeleton h-12 w-40 rounded-xl" />
        <div className="skeleton h-4 w-56" />
        <div className="ml-auto skeleton h-8 w-32" />
      </div>

      {/* 3-col grid */}
      <div
        className="flex-1 overflow-hidden grid"
        style={{ gridTemplateColumns: '1fr 1.6fr 1fr', gap: '16px', padding: '16px' }}
      >
        {/* Left */}
        <div className="panel p-4 space-y-3">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-36 w-full rounded-lg" />
          <div className="skeleton h-px w-full" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded-lg" />
          ))}
        </div>
        {/* Center */}
        <div className="panel overflow-hidden">
          <div className="h-10 border-b border-surface-border px-4 flex items-center gap-3">
            <div className="skeleton h-3 w-28" />
          </div>
          <div className="skeleton h-full w-full rounded-none" />
        </div>
        {/* Right */}
        <div className="panel p-4 space-y-3">
          <div className="skeleton h-4 w-24" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Heatmap spinner animation ────────────────────────────────────────────────
function HeatmapSpinner() {
  const cells = [
    { color: 'var(--risk-low)',      delay: '0ms' },
    { color: 'var(--risk-medium)',   delay: '150ms' },
    { color: 'var(--risk-high)',     delay: '300ms' },
    { color: 'var(--risk-critical)', delay: '450ms' },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {cells.map((c, i) => (
        <div
          key={i}
          className="w-6 h-6 rounded-md animate-pulse-risk"
          style={{ backgroundColor: c.color, animationDelay: c.delay }}
        />
      ))}
    </div>
  );
}