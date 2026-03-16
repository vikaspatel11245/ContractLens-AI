export type Severity = 'low' | 'medium' | 'high' | 'critical';

export function scoreToSeverity(score: number): Severity {
  if (score <= 3) return 'low';
  if (score <= 6) return 'medium';
  if (score <= 8) return 'high';
  return 'critical';
}

// Correct:
export const SEVERITY_TOKENS: Record <
  Severity,
  { color: string; bg: string; border: string; label: string }
> = {
  low: {
    color:  'var(--risk-low)',
    bg:     'var(--risk-low-bg)',
    border: 'var(--risk-low-border)',
    label:  'Low',
  },
  medium: {
    color:  'var(--risk-medium)',
    bg:     'var(--risk-medium-bg)',
    border: 'var(--risk-medium-border)',
    label:  'Medium',
  },
  high: {
    color:  'var(--risk-high)',
    bg:     'var(--risk-high-bg)',
    border: 'var(--risk-high-border)',
    label:  'High',
  },
  critical: {
    color:  'var(--risk-critical)',
    bg:     'var(--risk-critical-bg)',
    border: 'var(--risk-critical-border)',
    label:  'Critical',
  },
};

export const SCORE_HEX: Record<Severity, string> = {
  low:      '#C0DD97',
  medium:   '#FAC775',
  high:     '#F09595',
  critical: '#F7C1C1',
};

export function scoreToHex(score: number): string {
  return SCORE_HEX[scoreToSeverity(score)];
}

export type Verdict = 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Risk';

export function overallScoreToVerdict(score: number): Verdict {
  if (score < 30) return 'Low Risk';
  if (score < 55) return 'Medium Risk';
  if (score < 75) return 'High Risk';
  return 'Critical Risk';
}

export function overallScoreToSeverity(score: number): Severity {
  if (score < 30) return 'low';
  if (score < 55) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

export function severityToBadgeClass(severity: Severity): string {
  return `badge-${severity}`;
}