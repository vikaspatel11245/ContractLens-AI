import axios, { AxiosError } from 'axios';
import type { AnalysisResponse } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analyze
// Sends the PDF as multipart/form-data, returns AnalysisResponse JSON
// ─────────────────────────────────────────────────────────────────────────────

export interface UploadProgress {
  percent: number;   // 0–100 upload progress
  stage:   Stage;    // which processing stage we're in
}

export type Stage =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'analyzing'
  | 'generating'
  | 'done'
  | 'error';

// Human-readable label for each stage (shown in LoadingStates)
export const STAGE_LABELS: Record<Stage, string> = {
  idle:       'Waiting…',
  uploading:  'Uploading contract…',
  extracting: 'Extracting clauses…',
  analyzing:  'Analyzing risk with AI…',
  generating: 'Generating negotiation suggestions…',
  done:       'Analysis complete',
  error:      'Something went wrong',
};

// Approximate duration each stage takes (ms) — used to animate progress bar
export const STAGE_DURATIONS: Partial<Record<Stage, number>> = {
  extracting: 2000,
  analyzing:  8000,
  generating: 4000,
};

export class AnalysisError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public detail?: string,
  ) {
    super(message);
    this.name = 'AnalysisError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function analyzeContract(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Report uploading stage
    onProgress?.({ percent: 0, stage: 'uploading' });

    const response = await axios.post<AnalysisResponse>(
      '/api/analyze',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          const percent = evt.total
            ? Math.round((evt.loaded * 100) / evt.total)
            : 0;
          onProgress?.({ percent, stage: 'uploading' });
        },
      },
    );

    onProgress?.({ percent: 100, stage: 'done' });
    return response.data;

  } catch (err) {
    const axiosErr = err as AxiosError<{ detail?: string }>;
    throw new AnalysisError(
      axiosErr.message,
      axiosErr.response?.status,
      axiosErr.response?.data?.detail,
    );
  }
}