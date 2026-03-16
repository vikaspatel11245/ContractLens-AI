import { useState } from 'react';
import UploadZone from '../components/UploadZone';
import { AnalyzingScreen } from '../components/LoadingStates';
import { analyzeContract, type Stage } from '../api/analyze';
import type { AnalysisResponse } from '../api/types';
import { MOCK_ANALYSIS } from '../utils/mockData';

const USE_MOCK = false;

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
    <div className="min-h-[calc(100vh-var(--header-h))] grid grid-cols-[1fr_1.4fr] gap-0">

      {/* ── LEFT — Branding / feature list ─────────────────────────────── */}
      <div className="flex flex-col justify-center px-16 py-12 border-r border-surface-border space-y-10">

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-surface-overlay border border-surface-border rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs text-ink-secondary tracking-widest uppercase">
              AI Contract Analysis
            </span>
          </div>

          <h1 className="text-4xl font-semibold text-ink-primary leading-tight text-balance">
            Know every risk
            <br />
            <span className="text-accent">before you sign.</span>
          </h1>

          <p className="text-ink-secondary text-base leading-relaxed max-w-sm">
            Upload any SaaS contract and get a clause-by-clause risk breakdown, heatmap, and AI-generated negotiation rewrites in seconds.
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-4">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-overlay border border-surface-border flex items-center justify-center flex-none text-lg">
                {f.icon}
              </div>
              <div>
                <p className="text-ink-primary font-medium text-sm">{f.label}</p>
                <p className="text-ink-muted text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          {STATS.map(s => (
            <div key={s.label} className="panel p-4 text-center">
              <p className="font-mono text-xl font-semibold text-accent">{s.value}</p>
              <p className="text-ink-muted text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT — Upload / analyzing area ────────────────────────────── */}
      <div className="flex flex-col items-center justify-center px-16 py-12 bg-surface-raised/30">

        {pageState === 'idle' && (
          <div className="w-full max-w-xl space-y-6 animate-fade-up">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-ink-primary">Upload your contract</h2>
              <p className="text-ink-muted text-sm">PDF format · max 20 MB · analysis takes ~15 sec</p>
            </div>
            <UploadZone onFile={handleFile} />

            {/* Risk color legend */}
            <div className="panel p-4 space-y-3">
              <p className="data-label">Risk scoring legend</p>
              <div className="grid grid-cols-4 gap-3">
                {LEGEND.map(l => (
                  <div key={l.label} className="flex flex-col items-center gap-2">
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="font-mono text-xs text-ink-muted">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {pageState === 'analyzing' && (
          <div className="w-full max-w-xl panel p-12 animate-fade-up">
            <AnalyzingScreen uploadPercent={uploadPercent} currentStage={currentStage} />
          </div>
        )}

        {pageState === 'error' && (
          <div className="w-full max-w-xl panel p-10 text-center space-y-5 animate-fade-up">
            <p className="text-risk-high font-medium text-lg">Analysis failed</p>
            <p className="text-ink-secondary text-sm">{errorMsg}</p>
            <button
              onClick={handleRetry}
              className="px-8 py-3 rounded-xl bg-surface-raised border border-surface-border
                         text-ink-primary font-medium hover:border-accent/50 hover:text-accent
                         transition-colors duration-150"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: '🔍', label: 'Clause-by-clause scoring',  desc: 'Every clause scored 1–10 for legal risk' },
  { icon: '🟥', label: 'Visual risk heatmap',        desc: 'Color-coded grid — spot danger instantly' },
  { icon: '✍️', label: 'AI negotiation rewrites',   desc: 'Ready-to-use language to protect your interests' },
  { icon: '📄', label: 'Annotated PDF export',       desc: 'Download your contract with highlights' },
];

const STATS = [
  { value: '< 30s', label: 'Analysis time' },
  { value: '6',     label: 'Risk categories' },
  { value: '100',   label: 'Max risk score' },
];

const LEGEND = [
  { label: 'Low 1–3',       color: '#C0DD97' },
  { label: 'Medium 4–6',    color: '#FAC775' },
  { label: 'High 7–8',      color: '#F09595' },
  { label: 'Critical 9–10', color: '#F7C1C1' },
];