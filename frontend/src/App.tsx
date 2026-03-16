import { useState } from 'react';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import type { AnalysisResponse } from './api/types';

type AppState = 'upload' | 'analyzing' | 'dashboard';

export default function App() {
  const [appState, setAppState]   = useState<AppState>('upload');
  const [analysis, setAnalysis]   = useState<AnalysisResponse | null>(null);
  const [fileName, setFileName]   = useState<string>('');

  function handleUploadStart(name: string) {
    setFileName(name);
    setAppState('analyzing');
  }

  function handleAnalysisComplete(result: AnalysisResponse) {
    setAnalysis(result);
    setAppState('dashboard');
  }

  function handleReset() {
    setAnalysis(null);
    setFileName('');
    setAppState('upload');
  }

  return (
    <div className="min-h-screen bg-surface-base text-ink-primary font-sans">

      <header className="
        fixed top-0 inset-x-0 z-50 h-header
        flex items-center justify-between
        px-6 border-b border-surface-border
        bg-surface-base/80 backdrop-blur-md
      ">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="font-mono text-sm font-semibold tracking-tight text-ink-primary">
            Contract<span className="text-accent">Risk</span>
          </span>
          <span className="hidden sm:inline font-mono text-2xs text-ink-muted tracking-widest uppercase">
            Heatmap
          </span>
        </div>

        {fileName && appState !== 'upload' && (
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-2 font-mono text-xs text-ink-secondary">
              {fileName}
            </span>
            {appState === 'dashboard' && (
              <button
                onClick={handleReset}
                className="
                  text-xs font-medium text-ink-secondary
                  hover:text-ink-primary border border-surface-muted
                  hover:border-accent/50 rounded-lg px-3 py-1.5
                  transition-colors duration-150
                "
              >
                New analysis
              </button>
            )}
          </div>
        )}
      </header>

      <main className="pt-[var(--header-h)]">
        {(appState === 'upload' || appState === 'analyzing') && (
          <UploadPage
            isAnalyzing={appState === 'analyzing'}
            onUploadStart={handleUploadStart}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}
        {appState === 'dashboard' && analysis && (
          <DashboardPage
            analysis={analysis}
            fileName={fileName}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}

function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2"  y="2"  width="9" height="9" rx="2" fill="var(--risk-low)"      opacity="0.9" />
      <rect x="13" y="2"  width="9" height="9" rx="2" fill="var(--risk-medium)"   opacity="0.9" />
      <rect x="2"  y="13" width="9" height="9" rx="2" fill="var(--risk-high)"     opacity="0.9" />
      <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--risk-critical)" opacity="0.9" />
    </svg>
  );
}