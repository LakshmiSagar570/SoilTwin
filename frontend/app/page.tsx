'use client';
import { useState } from 'react';
import SoilInputForm from '../components/SoilInputForm';
import ResultsDashboard from '../components/ResultsDashboard';
import { analyzeSoil } from '../lib/api';
import { AnalysisResult, SoilInput } from '../lib/types';

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(input: SoilInput) {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeSoil(input);
      setResult(data);
    } catch (e) {
      setError('Analysis failed. Make sure the backend is running at localhost:8000');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 80% 20%, rgba(200,135,63,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 50% 60% at 10% 80%, rgba(74,140,63,0.05) 0%, transparent 60%)
        `,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Nav */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 32px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(20, 31, 19, 0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🌾</span>
            <span className="font-display" style={{ fontSize: 16, color: 'var(--cream)', fontWeight: 600 }}>
              Soil<span style={{ color: 'var(--amber)' }}>Twin</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge badge-green">Backend Live</span>
            {result && (
              <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}
                onClick={() => setResult(null)}>
                New Analysis
              </button>
            )}
          </div>
        </nav>

        {/* Main content */}
        <div style={{ padding: result ? '32px 16px' : '48px 16px' }}>
          {error && (
            <div style={{
              maxWidth: 560, margin: '0 auto 20px',
              background: 'rgba(192, 74, 58, 0.1)',
              border: '1px solid rgba(192, 74, 58, 0.3)',
              borderRadius: 10, padding: '14px 18px',
              fontSize: 13, color: '#E86A5A'
            }}>
              ⚠ {error}
            </div>
          )}

          {result
            ? <ResultsDashboard data={result} onReset={() => setResult(null)} />
            : <SoilInputForm onSubmit={handleSubmit} loading={loading} />
          }
        </div>

        {/* Footer */}
        {!result && (
          <footer style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid var(--border)', marginTop: 40 }}>
            <p className="font-mono" style={{ fontSize: 10, color: 'var(--cream-muted)', letterSpacing: '0.1em' }}>
              POWERED BY RANDOM FOREST · XGBOOST · LLAMA 3.3 · OPEN-METEO
            </p>
          </footer>
        )}
      </div>
    </main>
  );
}