import { useState } from 'react';
import UploadZone from '../components/UploadZone';
import { AnalyzingScreen } from '../components/LoadingStates';
import { analyzeContract, type Stage } from '../api/analyze';
import type { AnalysisResponse } from '../api/types';
import { MOCK_ANALYSIS } from '../utils/mockData';

const USE_MOCK = true;

interface Props {
  isAnalyzing:        boolean;
  onUploadStart:      (fileName: string) => void;
  onAnalysisComplete: (result: AnalysisResponse) => void;
}

type PageState = 'idle' | 'analyzing' | 'error';

export default function UploadPage({ onUploadStart, onAnalysisComplete }: Props) {
  const [pageState,     setPageState]     = useState<PageState>('idle');
  const [currentStage,  setCurrentStage]  = useState<Stage>('idle');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [errorMsg,      setErrorMsg]      = useState('');

  async function handleFile(file: File) {
    setPageState('analyzing');
    setCurrentStage('uploading');
    setErrorMsg('');
    onUploadStart(file.name);

    if (USE_MOCK) {
      const stages: Stage[] = ['uploading', 'extracting', 'analyzing', 'generating'];
      for (const stage of stages) {
        setCurrentStage(stage);
        await new Promise(r => setTimeout(r, stage === 'analyzing' ? 2200 : 900));
        if (stage === 'uploading') setUploadPercent(100);
      }
      setCurrentStage('done');
      onAnalysisComplete(MOCK_ANALYSIS);
      return;
    }

    try {
      const result = await analyzeContract(file, (progress) => {
        setUploadPercent(progress.percent);
        if (progress.stage === 'uploading') setCurrentStage('uploading');
      });
      setCurrentStage('done');
      onAnalysisComplete(result);
    } catch (err) {
      setCurrentStage('error');
      setPageState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    }
  }

  function handleRetry() {
    setPageState('idle');
    setCurrentStage('idle');
    setUploadPercent(0);
    setErrorMsg('');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-h))] px-6 py-16">
      <div className="w-full max-w-lg space-y-8">

        {pageState === 'idle' && (
          <div className="text-center space-y-3 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-surface-overlay border border-surface-border rounded-full px-4 py-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-2xs text-ink-secondary tracking-widest uppercase">
                AI Contract Analysis
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-ink-primary text-balance leading-snug">
              Upload your SaaS contract
              <br />
              <span className="text-ink-secondary font-normal">and get a risk report in seconds</span>
            </h1>
          </div>
        )}

        {pageState === 'idle' && (
          <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
            <UploadZone onFile={handleFile} />
          </div>
        )}

        {pageState === 'analyzing' && (
          <div className="panel p-10">
            <AnalyzingScreen uploadPercent={uploadPercent} currentStage={currentStage} />
          </div>
        )}

        {pageState === 'error' && (
          <div className="panel p-8 text-center space-y-5 animate-fade-up">
            <p className="text-risk-high font-medium">Analysis failed</p>
            <p className="text-ink-secondary text-sm">{errorMsg}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-ink-primary text-sm font-medium hover:border-accent/50 hover:text-accent transition-colors duration-150"
            >
              Try again
            </button>
          </div>
        )}

        {pageState === 'idle' && (
          <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
            {[
              { icon: '🔍', label: 'Clause-by-clause', desc: 'Every clause scored 1–10 for risk' },
              { icon: '🟥', label: 'Risk heatmap',      desc: 'Color-coded grid — spot danger fast' },
              { icon: '✍️', label: 'Negotiation AI',   desc: 'Ready-to-use contract rewrites' },
            ].map(f => (
              <div key={f.label} className="panel p-4 space-y-2">
                <span className="text-lg">{f.icon}</span>
                <p className="font-medium text-ink-primary text-xs">{f.label}</p>
                <p className="text-ink-muted text-xs leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}