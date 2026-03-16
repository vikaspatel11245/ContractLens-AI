import { useRef, useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// UploadZone — drag-and-drop PDF upload component
// ─────────────────────────────────────────────────────────────────────────────

const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface Props {
  onFile:    (file: File) => void;
  disabled?: boolean;
}

type DropState = 'idle' | 'hover' | 'error';

export default function UploadZone({ onFile, disabled = false }: Props) {
  const inputRef              = useRef<HTMLInputElement>(null);
  const [dropState, setDropState] = useState<DropState>('idle');
  const [errorMsg, setErrorMsg]   = useState<string>('');

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(file: File): string | null {
    if (file.type !== 'application/pdf') return 'Only PDF files are supported.';
    if (file.size > MAX_SIZE_BYTES)      return `File must be under ${MAX_SIZE_MB} MB.`;
    return null;
  }

  function handleFile(file: File) {
    const err = validate(file);
    if (err) {
      setErrorMsg(err);
      setDropState('error');
      return;
    }
    setErrorMsg('');
    setDropState('idle');
    onFile(file);
  }

  // ── Drag events ─────────────────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDropState('hover');
  }, [disabled]);

  const onDragLeave = useCallback(() => {
    setDropState('idle');
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setDropState('idle');
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Input click ─────────────────────────────────────────────────────────────
  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // reset so same file can be re-selected
  }

  // ── Styles ───────────────────────────────────────────────────────────────────
  const borderColor =
    dropState === 'hover' ? 'border-accent'
    : dropState === 'error' ? 'border-risk-high'
    : 'border-surface-muted';

  const bgColor =
    dropState === 'hover' ? 'bg-accent-dim'
    : dropState === 'error' ? 'bg-risk-high-bg'
    : 'bg-surface-raised';

  return (
    <div className="w-full space-y-3">
      {/* ── Drop target ─────────────────────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload PDF contract"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        className={`
          relative w-full rounded-2xl border-2 border-dashed
          transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center gap-5
          px-8 py-16 text-center select-none
          ${borderColor} ${bgColor}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent hover:bg-accent-dim'}
        `}
      >
        {/* Icon */}
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center
          transition-colors duration-200
          ${dropState === 'hover' ? 'bg-accent/20' : 'bg-surface-overlay'}
        `}>
          {dropState === 'hover' ? <DropIcon /> : <PDFIcon />}
        </div>

        {/* Text */}
        <div className="space-y-2">
          <p className="text-ink-primary font-medium text-base">
            {dropState === 'hover'
              ? 'Release to upload'
              : 'Drop your contract here'}
          </p>
          <p className="text-ink-secondary text-sm">
            or{' '}
            <span className="text-accent underline underline-offset-2">
              browse files
            </span>
            {' '}· PDF only · max {MAX_SIZE_MB} MB
          </p>
        </div>

        {/* Accepted formats pill */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xs text-ink-muted bg-surface-overlay
                           border border-surface-border rounded-full px-3 py-1">
            .PDF
          </span>
        </div>
      </div>

      {/* ── Error message ──────────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="flex items-center gap-2 text-risk-high text-sm font-medium px-1
                        animate-fade-up">
          <ErrorIcon />
          {errorMsg}
        </div>
      )}

      {/* ── Hidden file input ──────────────────────────────────────────────── */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onInputChange}
        disabled={disabled}
      />
    </div>
  );
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function PDFIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M6 4a2 2 0 0 1 2-2h10l6 6v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4z"
        stroke="var(--ink-muted)" strokeWidth="1.5" fill="none"
      />
      <path d="M16 2v6h6" stroke="var(--ink-muted)" strokeWidth="1.5" fill="none" />
      <path
        d="M10 17h2.5c.8 0 1.5-.7 1.5-1.5S13.3 14 12.5 14H10v5m6-5h1.5A1.5 1.5 0 0 1 19 15.5v2A1.5 1.5 0 0 1 17.5 19H16v-5m3.5 2.5H22"
        stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round"
      />
    </svg>
  );
}

function DropIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M14 4v14m-5-5 5 5 5-5"
        stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M5 20v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"
        stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="var(--risk-high)" strokeWidth="1.5" />
      <path d="M7 4v3.5M7 10h.01" stroke="var(--risk-high)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}