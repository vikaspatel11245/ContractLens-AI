import axios, { AxiosError } from 'axios';
import type { AnalysisResponse } from './types';

export type Stage =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'analyzing'
  | 'generating'
  | 'done'
  | 'error';

export const STAGE_LABELS: Record<Stage, string> = {
  idle:       'Waiting…',
  uploading:  'Uploading contract…',
  extracting: 'Extracting clauses…',
  analyzing:  'Analyzing risk with AI…',
  generating: 'Generating negotiation suggestions…',
  done:       'Analysis complete',
  error:      'Something went wrong',
};

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

// onUploadProgress receives 0–100 as the file bytes are sent to the server
export async function analyzeContract(
  file: File,
  onUploadProgress?: (pct: number) => void,
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post<AnalysisResponse>(
      '/api/analyze',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onUploadProgress && e.total) {
            const pct = Math.round((e.loaded / e.total) * 100);
            onUploadProgress(pct);
          }
        },
      },
    );
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