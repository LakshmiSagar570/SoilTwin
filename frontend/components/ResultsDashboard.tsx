'use client';
import { AnalysisResult } from '../lib/types';
import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';

interface Props { data: AnalysisResult; onReset: () => void; }

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = 45, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#6AAD5E' : score >= 55 ? '#C8963F' : '#C04A3A';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x="50" y="46" textAnchor="middle" fill={color}
        style={{ fontFamily: 'DM Mono, monospace', fontSize: 18, fontWeight: 500 }}>
        {score}
      </text>
      <text x="50" y="60" textAnchor="middle" fill="rgba(200,190,170,0.6)"
        style={{ fontFamily: 'Outfit, sans-serif', fontSize: 8 }}>
        / 100
      </text>
    </svg>
  );
}

const TOOLTIP_STYLE = {
  background: '#1A2D1C', border: '1px solid rgba(200,135,63,0.2)',
  borderRadius: 8, fontSize: 12, color: '#E8E0CC',
  fontFamily: 'DM Mono, monospace'
};

export default function ResultsDashboard({ data, onReset }: Props) {
  const { soil, health, fertility, weather, crops, yield: yieldData, fertilizer, simulation, advisory } = data;

  const simChartData = simulation.map(s => ({
    name: `S${s.season}`,
    score: s.health_score,
    N: s.N, P: s.P, K: s.K,
    color: s.status_color === 'green' ? '#6AAD5E' : s.status_color === 'yellow' ? '#C8963F' : '#C04A3A'
  }));

  const nutrientData = [
    { name: 'N', value: soil.N, max: 140, color: '#6AAD5E' },
    { name: 'P', value: soil.P, max: 145, color: '#E8A85A' },
    { name: 'K', value: soil.K, max: 205, color: '#6AAAE8' },
  ];

  const statusBadge = health.status === 'Healthy' ? 'badge-green' : health.status === 'Moderate' ? 'badge-yellow' : 'badge-red';
  const fertilityBadge = fertility.fertility_score === 2 ? 'badge-green' : fertility.fertility_score === 1 ? 'badge-yellow' : 'badge-red';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 60px' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="section-label">Digital Twin Active</div>
          <h2 className="font-display" style={{ fontSize: 24, color: 'var(--cream)', fontWeight: 600 }}>
            {soil.region}
          </h2>
          <div style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 2 }}>
            {soil.soil_type} · {weather.crop_season} Season · {weather.season_label}
          </div>
        </div>
        <button className="btn-ghost" onClick={onReset}>← New Analysis</button>
      </div>

      {/* Row 1: Score + Fertility + Weather */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 16 }}>

        {/* Soil Health Score */}
        <div className="card fade-up-1" style={{ padding: 24 }}>
          <div className="section-label">Soil Health Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ScoreRing score={health.score} />
            <div>
              <span className={`badge ${statusBadge}`} style={{ marginBottom: 12, display: 'inline-flex' }}>
                {health.status}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {Object.entries(health.breakdown).map(([key, val]) => (
                  <div key={key} style={{ fontSize: 10, color: 'var(--cream-muted)' }}>
                    <span style={{ color: 'var(--amber-pale)', fontFamily: 'DM Mono, monospace' }}>{val}</span>
                    <span style={{ marginLeft: 3 }}>{key.split('_')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {health.warnings.length > 0 && (
            <div style={{ marginTop: 14 }}>
              {health.warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 11, color: '#E86A5A', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span>⚠</span> {w}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fertility */}
        <div className="card fade-up-2" style={{ padding: 24 }}>
          <div className="section-label">Soil Fertility</div>
          <div style={{ marginBottom: 16 }}>
            <span className={`badge ${fertilityBadge}`}>{fertility.fertility_level}</span>
            <div className="font-mono" style={{ fontSize: 28, color: 'var(--amber)', marginTop: 8, marginBottom: 4 }}>
              {fertility.confidence_pct}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--cream-muted)' }}>model confidence</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Less Fertile', val: fertility.probabilities.less_fertile, color: '#C04A3A' },
              { label: 'Fertile', val: fertility.probabilities.fertile, color: '#C8963F' },
              { label: 'Highly Fertile', val: fertility.probabilities.highly_fertile, color: '#6AAD5E' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                  <span style={{ color: 'var(--cream-muted)' }}>{label}</span>
                  <span className="font-mono" style={{ color }}>{val}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--earth-mid)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 2, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather */}
        <div className="card fade-up-3" style={{ padding: 24 }}>
          <div className="section-label">Live Weather — 16 Day Forecast</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Temperature', val: `${weather.avg_temperature_c}°C`, icon: '🌡' },
              { label: 'Humidity', val: `${weather.avg_humidity_pct}%`, icon: '💧' },
              { label: 'Rainfall', val: `${weather.total_rainfall_16d_mm}mm`, icon: '🌧' },
              { label: 'Season', val: weather.crop_season, icon: '🌾' },
            ].map(({ label, val, icon }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--cream-muted)', marginBottom: 2 }}>{icon} {label}</div>
                <div className="font-mono" style={{ fontSize: 14, color: 'var(--amber-pale)' }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 50 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weather.forecast_days.map((v, i) => ({ day: i + 1, rain: v || 0 }))}>
                <Area type="monotone" dataKey="rain" stroke="var(--amber)" fill="rgba(200,135,63,0.1)" strokeWidth={1.5} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [`${v ?? 0}mm`, 'Rain']} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Crops + Yield + Nutrients */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 16 }}>

        {/* Crop Recommendations */}
        <div className="card fade-up-2" style={{ padding: 24 }}>
          <div className="section-label">AI Crop Recommendation</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {crops.map((c, i) => (
              <div key={c.crop} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: i === 0 ? 'rgba(200,135,63,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i === 0 ? 'rgba(200,135,63,0.25)' : 'var(--border)'}`,
                borderRadius: 10, padding: '12px 14px'
              }}>
                <div className="font-mono" style={{ fontSize: 20, color: 'var(--cream-muted)', minWidth: 24 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--cream)', fontWeight: 500, textTransform: 'capitalize' }}>{c.crop}</div>
                  <div style={{ height: 3, background: 'var(--earth-mid)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.confidence_pct}%`, background: i === 0 ? 'var(--amber)' : 'var(--leaf)', borderRadius: 2, transition: 'width 1.2s ease' }} />
                  </div>
                </div>
                <div className="font-mono" style={{ fontSize: 13, color: i === 0 ? 'var(--amber)' : 'var(--cream-muted)' }}>
                  {c.confidence_pct}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yield Prediction */}
        <div className="card fade-up-3" style={{ padding: 24 }}>
          <div className="section-label">Yield Prediction</div>
          {yieldData.yield_hg_per_ha ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <div className="font-mono" style={{ fontSize: 36, color: 'var(--amber)', lineHeight: 1 }}>
                  {yieldData.yield_tonnes_per_ha}
                </div>
                <div style={{ fontSize: 12, color: 'var(--cream-muted)' }}>tonnes / hectare</div>
              </div>
              <div style={{ margin: '14px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: 'var(--cream-muted)' }}>Yield score</span>
                  <span className="font-mono" style={{ color: 'var(--amber)' }}>{yieldData.yield_score_pct}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--earth-mid)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${yieldData.yield_score_pct}%`, background: 'linear-gradient(90deg, var(--amber), var(--amber-light))', borderRadius: 4, transition: 'width 1.2s ease' }} />
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--cream-muted)', lineHeight: 1.5 }}>{yieldData.yield_label}</p>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--cream-muted)', marginTop: 8 }}>
              Yield data not available for {crops[0]?.crop || 'selected crop'}
            </p>
          )}
        </div>

        {/* Nutrient Bar Chart */}
        <div className="card fade-up-4" style={{ padding: 24 }}>
          <div className="section-label">Nutrient Levels</div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nutrientData} barSize={28}>
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: 'var(--cream-muted)', fontSize: 12, fontFamily: 'DM Mono' }} />
                <YAxis hide />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [`${v ?? 0} kg/ha`]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {nutrientData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {nutrientData.map(n => (
              <div key={n.name} style={{ fontSize: 10, color: 'var(--cream-muted)' }}>
                <span className="font-mono" style={{ color: n.color }}>{n.name}</span>: {n.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Season Simulation (Full Width) */}
      <div className="card fade-up-3" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="section-label">{simulation.length}-Season Soil Simulation</div>
            <div style={{ fontSize: 13, color: 'var(--cream-muted)' }}>
              Soil health after each harvest —{" "}
              <span style={{ color: 'var(--amber-pale)', textTransform: 'capitalize' }}>{soil.region.split(',')[0]}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-yellow">Now: {health.score}</span>
            {simulation[0] && (
              <span className={`badge ${simulation[0].status_color === 'green' ? 'badge-green' : simulation[0].status_color === 'yellow' ? 'badge-yellow' : 'badge-red'}`}>
                After S1: {simulation[0].health_score}
              </span>
            )}
            {simulation[simulation.length - 1] && (
              <span className={`badge ${simulation[simulation.length-1].status_color === 'green' ? 'badge-green' : simulation[simulation.length-1].status_color === 'yellow' ? 'badge-yellow' : 'badge-red'}`}>
                After S{simulation.length}: {simulation[simulation.length-1].health_score}
              </span>
            )}
          </div>
        </div>

        {/* Per-season score cards */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${simulation.length}, 1fr)`, gap: 8, marginBottom: 20 }}>
          {simulation.map((s) => {
            const col = s.status_color === 'green' ? '#6AAD5E' : s.status_color === 'yellow' ? '#C8963F' : '#C04A3A';
            const drop = parseFloat((s.health_score - health.score).toFixed(1));
            // time_label and crop_season come from updated simulation.py
            const ext = s as typeof s & { time_label?: string; crop_season?: string; crop_days?: number };
            return (
              <div key={s.season} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${col}40`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>

                {/* Season number */}
                <div style={{ fontSize: 10, color: 'var(--cream-muted)', marginBottom: 2, fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em' }}>
                  SEASON {s.season}
                </div>

                {/* Time elapsed label e.g. "4.5 months" or "1.5 years" */}
                {ext.time_label && (
                  <div style={{ fontSize: 9, color: 'var(--amber)', marginBottom: 4, fontFamily: 'DM Mono, monospace' }}>
                    {ext.time_label}
                  </div>
                )}

                {/* Crop season label e.g. "Kharif" */}
                {ext.crop_season && (
                  <div style={{ fontSize: 8, color: 'var(--cream-muted)', marginBottom: 4, opacity: 0.7 }}>
                    {ext.crop_season}
                  </div>
                )}

                {/* Health score */}
                <div className="font-mono" style={{ fontSize: 20, color: col, lineHeight: 1, marginBottom: 2 }}>
                  {s.health_score}
                </div>
                <div style={{ fontSize: 9, color: col, opacity: 0.8 }}>{s.status}</div>

                {/* Delta from current */}
                <div style={{ fontSize: 9, color: drop < 0 ? '#E86A5A' : '#6AAD5E', marginTop: 4 }}>
                  {drop < 0 ? `▼ ${Math.abs(drop)}` : `▲ ${drop}`}
                </div>

                {/* N P K after season */}
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { label: 'N', val: s.N, color: '#6AAD5E' },
                    { label: 'P', val: s.P, color: '#E8A85A' },
                    { label: 'K', val: s.K, color: '#6AAAE8' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, padding: '0 2px' }}>
                      <span style={{ color: 'var(--cream-muted)' }}>{label}</span>
                      <span className="font-mono" style={{ color }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Crop duration pill */}
                {ext.crop_days && (
                  <div style={{ marginTop: 6, fontSize: 8, color: 'var(--cream-muted)', background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '2px 4px' }}>
                    {ext.crop_days}d / crop
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simChartData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--amber)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fill: 'var(--cream-muted)', fontSize: 11, fontFamily: 'DM Mono' }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false}
                tick={{ fill: 'var(--cream-muted)', fontSize: 11, fontFamily: 'DM Mono' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE}
                formatter={(v: number | undefined, name: string | number | undefined) => [
                  name === 'score' ? `${v ?? 0}/100` : `${v ?? 0} kg/ha`, name
                ]} />
              <Area type="monotone" dataKey="score" stroke="var(--amber)" fill="url(#scoreGrad)"
                strokeWidth={2.5} dot={{ fill: 'var(--amber)', r: 4 }} />
              <Line type="monotone" dataKey="N" stroke="#6AAD5E" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="P" stroke="#E8A85A" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="K" stroke="#6AAAE8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          {[['Health Score', 'var(--amber)'], ['Nitrogen', '#6AAD5E'], ['Phosphorus', '#E8A85A'], ['Potassium', '#6AAAE8']].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--cream-muted)' }}>
              <div style={{ width: 16, height: 2, background: color as string, borderRadius: 1 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Fertilizer + Advisory */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        {/* Fertilizer */}
        <div className="card fade-up-4" style={{ padding: 24 }}>
          <div className="section-label">Fertilizer Recommendation</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {[
              { name: 'Urea', val: fertilizer.urea_kg, icon: '🌿', color: '#6AAD5E' },
              { name: 'DAP', val: fertilizer.dap_kg, icon: '🟡', color: '#E8A85A' },
              { name: 'MOP', val: fertilizer.mop_kg, icon: '🔵', color: '#6AAAE8' },
            ].map(({ name, val, icon, color }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--cream-muted)' }}>{icon} {name}</span>
                <span className="font-mono" style={{ fontSize: 14, color }}>{val} kg</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--cream-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
            {fertilizer.note}
          </div>
          {health.suggestions.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {health.suggestions.map((s, i) => (
                <div key={i} style={{ fontSize: 11, color: '#6AAD5E', marginBottom: 4 }}>✓ {s}</div>
              ))}
            </div>
          )}
        </div>

        {/* AI Advisory */}
        <div className="card fade-up-5" style={{ padding: 24, background: 'linear-gradient(135deg, #1E3320, #1A2D1C)', border: '1px solid rgba(200,135,63,0.2)' }}>
          <div className="section-label">AI Farm Advisory</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--leaf-bright)' }} className="pulse" />
            <span style={{ fontSize: 10, color: 'var(--leaf-bright)', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em' }}>
              LLAMA 3.3 · GROQ
            </span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text-on-dark)', lineHeight: 1.75, opacity: 0.9 }}>
            {advisory.split('\n\n').map((para, i) => (
              para.trim() && <p key={i} style={{ marginBottom: i < advisory.split('\n\n').length - 1 ? 12 : 0 }}>{para}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}