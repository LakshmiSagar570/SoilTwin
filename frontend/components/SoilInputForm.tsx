'use client';
import { useState, useCallback } from 'react';
import { reverseGeocode, getDistrictDefaults } from '../lib/api';
import { SoilInput, DistrictDefaults } from '../lib/types';

type Mode = 'choose' | 'location' | 'lab';
type LocStatus = 'idle' | 'detecting' | 'done' | 'error';

const CROPS = ['rice','wheat','maize','cotton','groundnut','sugarcane','soybean','sorghum'];

// ── Sub-components declared OUTSIDE SoilInputForm ────────────────────────

function Header() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 36 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--leaf-bright)' }} className="pulse" />
        <span className="font-mono" style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI Soil Digital Twin</span>
      </div>
      <h1 className="font-display" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 600, lineHeight: 1.1, color: 'var(--cream)', marginBottom: 10 }}>
        Know Your Soil.<br />
        <span style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Predict Your Future.</span>
      </h1>
      <p style={{ color: 'var(--cream-muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
        Get a complete AI simulation of your soil&apos;s health, best crops, and 5-season future.
      </p>
    </div>
  );
}

interface SliderField {
  label: string; val: number; set: (v: number) => void;
  setM: (v: boolean) => void; modified: boolean;
  min: number; max: number; unit: string; color: string;
}

interface SmallSliderField {
  label: string; val: number; set: (v: number) => void;
  setM: (v: boolean) => void; min: number; max: number; step: number;
}

interface SoilSlidersProps {
  fields: SliderField[];
  smallFields: SmallSliderField[];
}

function SoilSliders({ fields, smallFields }: SoilSlidersProps) {
  return (
    <>
      {fields.map(({ label, val, set, setM, modified, min, max, unit, color }) => (
        <div key={label} style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 13, color: 'var(--cream-muted)' }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {modified
                ? <span className="badge badge-green" style={{ fontSize: 9 }}>Lab verified</span>
                : <span className="badge badge-yellow" style={{ fontSize: 9 }}>Regional est.</span>}
              <span className="font-mono" style={{ fontSize: 14, color, minWidth: 64, textAlign: 'right' }}>
                {val} <span style={{ fontSize: 10, color: 'var(--cream-muted)' }}>{unit}</span>
              </span>
            </div>
          </div>
          <input type="range" min={min} max={max} value={val}
            style={{ accentColor: color }}
            onChange={e => { set(Number(e.target.value)); setM(true); }} />
        </div>
      ))}

      <div className="divider" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {smallFields.map(({ label, val, set, setM, min, max, step }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--cream-muted)', marginBottom: 4 }}>{label}</div>
            <div className="font-mono" style={{ fontSize: 16, color: 'var(--amber-pale)', marginBottom: 8 }}>{val}</div>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e => { set(Number(e.target.value)); setM(true); }} />
          </div>
        ))}
      </div>
    </>
  );
}

interface SimSettingsProps {
  crop: string; setCrop: (v: string) => void;
  seasons: number; setSeasons: (v: number) => void;
  applyFertilizer: boolean; setApplyFertilizer: (v: boolean) => void;
}

function SimSettings({ crop, setCrop, seasons, setSeasons, applyFertilizer, setApplyFertilizer }: SimSettingsProps) {
  return (
    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
      <p className="section-label">Simulation Settings</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--cream-muted)', display: 'block', marginBottom: 6 }}>Planning to plant</label>
          <select className="soil-input" value={crop} onChange={e => setCrop(e.target.value)}
            style={{ cursor: 'pointer', appearance: 'none', background: 'rgba(255,255,255,0.04)' }}>
            {CROPS.map(c => <option key={c} value={c} style={{ background: '#1A2D1C' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--cream-muted)', display: 'block', marginBottom: 6 }}>Seasons to simulate</label>
          <div className="font-mono" style={{ fontSize: 22, color: 'var(--amber)', marginBottom: 4 }}>{seasons}</div>
          <input type="range" min={1} max={10} value={seasons} onChange={e => setSeasons(Number(e.target.value))} />
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div onClick={() => setApplyFertilizer(!applyFertilizer)}
          style={{ width: 40, height: 22, borderRadius: 11, background: applyFertilizer ? 'var(--amber)' : 'var(--earth-mid)', border: '1px solid var(--border)', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 2, left: applyFertilizer ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: 'var(--cream)', transition: 'left 0.2s' }} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--cream-muted)' }}>Apply recommended fertilizer in simulation</span>
      </label>
      <label style={{ fontSize: 12, color: 'var(--cream-muted)', display: 'block', marginBottom: 6 }}>
        Planning to plant
        <span style={{ color: 'var(--amber)', marginLeft: 6, fontSize: 10 }}>
          (AI will recommend best crop after analysis)
        </span>
      </label>
    </div>
  );
}

interface SubmitBtnProps { onClick: () => void; loading: boolean; }

function SubmitBtn({ onClick, loading }: SubmitBtnProps) {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16 }}
        onClick={onClick} disabled={loading}>
        {loading
          ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: 'var(--earth-dark)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Analyzing your soil...
            </span>
          : '🌱 Create Digital Twin →'
        }
      </button>
    </>
  );
}

interface LocationConfirmedProps {
  district: string; state: string; soilType?: string; mode: 'location' | 'lab';
}

function LocationConfirmed({ district, state, soilType, mode }: LocationConfirmedProps) {
  return (
    <div className="card" style={{ padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{mode === 'lab' ? '🧪' : '📍'}</span>
        <div>
          <div style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{district}, {state}</div>
          <div style={{ fontSize: 11, color: 'var(--cream-muted)' }}>
            {mode === 'lab' ? 'Lab report mode — enter your exact values' : soilType || 'Regional soil data loaded'}
          </div>
        </div>
      </div>
      <span className={`badge ${mode === 'lab' ? 'badge-blue' : 'badge-green'}`}>
        {mode === 'lab' ? 'Lab Mode' : '✓ Located'}
      </span>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────

interface Props { onSubmit: (input: SoilInput) => void; loading: boolean; }

export default function SoilInputForm({ onSubmit, loading }: Props) {
  const [mode, setMode] = useState<Mode>('choose');
  const [locStatus, setLocStatus] = useState<LocStatus>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [region, setRegion] = useState({ state: '', district: '', display: '' });
  const [defaults, setDefaults] = useState<DistrictDefaults | null>(null);
  const [showSoilForm, setShowSoilForm] = useState(false);

  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [manualState, setManualState] = useState('');
  const [manualDistrict, setManualDistrict] = useState('');

  const [N, setN] = useState(70);    const [Nmod, setNmod] = useState(false);
  const [P, setP] = useState(25);    const [Pmod, setPmod] = useState(false);
  const [K, setK] = useState(180);   const [Kmod, setKmod] = useState(false);
  const [pH, setPH] = useState(6.8); const [pHmod, setPHmod] = useState(false);
  const [moisture, setMoisture] = useState(45); const [moistMod, setMoistMod] = useState(false);
  const [oc, setOC] = useState(0.55);const [ocMod, setOCmod] = useState(false);
  const [crop, setCrop] = useState('rice');
  const [seasons, setSeasons] = useState(5);
  const [applyFertilizer, setApplyFertilizer] = useState(false);

  const applyDefaults = useCallback((def: DistrictDefaults) => {
    setDefaults(def);
    setN(def.N); setP(def.P); setK(def.K);
    setPH(def.pH); setMoisture(def.moisture); setOC(def.organic_carbon);
  }, []);

  // Called directly on button click — no useEffect needed
  const detectLocation = useCallback(() => {
    setLocStatus('detecting');
    if (!navigator.geolocation) { setLocStatus('error'); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        setCoords({ lat, lng });
        try {
          const geo = await reverseGeocode(lat, lng);
          setRegion(geo);
          const def = await getDistrictDefaults(geo.state, geo.district);
          applyDefaults(def);
          setLocStatus('done');
          setShowSoilForm(true);
        } catch { setLocStatus('error'); }
      },
      () => setLocStatus('error')
    );
  }, [applyDefaults]);

  async function handleManualLocationLoad() {
    const st = manualState.trim(), di = manualDistrict.trim();
    if (!st || !di) { alert('Please enter state and district'); return; }
    const lat = parseFloat(manualLat), lng = parseFloat(manualLng);
    setCoords({ lat: isNaN(lat) ? 20.5937 : lat, lng: isNaN(lng) ? 78.9629 : lng });
    setRegion({ state: st, district: di, display: `${di}, ${st}` });
    try {
      const def = await getDistrictDefaults(st, di);
      applyDefaults(def);
    } catch { /* keep current slider values */ }
    setShowSoilForm(true);
  }

  function handleSubmit() {
    if (!coords) return;
    const anyMod = Nmod || Pmod || Kmod || pHmod || moistMod || ocMod;
    onSubmit({
      lat: coords.lat, lng: coords.lng,
      state: region.state, district: region.district,
      N: Nmod ? N : undefined, P: Pmod ? P : undefined, K: Kmod ? K : undefined,
      pH: pHmod ? pH : undefined, moisture: moistMod ? moisture : undefined,
      organic_carbon: ocMod ? oc : undefined,
      source: mode === 'lab' ? 'lab_verified' : anyMod ? 'lab_verified' : 'regional_estimate',
      crop, seasons, apply_fertilizer: applyFertilizer,
    });
  }

  function resetToChoose() {
    setMode('choose'); setShowSoilForm(false); setLocStatus('idle');
    setManualState(''); setManualDistrict(''); setManualLat(''); setManualLng('');
  }

  // Shared slider config — built from state
  const sliderFields: SliderField[] = [
    { label: 'Nitrogen (N)',   val: N, set: setN, setM: setNmod, modified: Nmod, min: 0, max: 140, unit: 'kg/ha', color: '#6AAD5E' },
    { label: 'Phosphorus (P)', val: P, set: setP, setM: setPmod, modified: Pmod, min: 0, max: 145, unit: 'kg/ha', color: '#E8A85A' },
    { label: 'Potassium (K)',  val: K, set: setK, setM: setKmod, modified: Kmod, min: 0, max: 205, unit: 'kg/ha', color: '#6AAAE8' },
  ];

  const smallFields: SmallSliderField[] = [
    { label: 'Soil pH',     val: pH,       set: setPH,       setM: setPHmod,    min: 4, max: 9,   step: 0.1  },
    { label: 'Moisture %',  val: moisture, set: setMoisture, setM: setMoistMod, min: 0, max: 100, step: 1    },
    { label: 'Org. Carbon', val: oc,       set: setOC,       setM: setOCmod,    min: 0, max: 3,   step: 0.01 },
  ];

  const wrapper = { maxWidth: 540, margin: '0 auto', padding: '0 16px' };
  const backBtn = (
    <button className="btn-ghost" style={{ marginBottom: 16, fontSize: 13 }} onClick={resetToChoose}>
      ← Change mode
    </button>
  );

  // ── MODE: CHOOSE ─────────────────────────────────────────────────────────
  if (mode === 'choose') return (
    <div style={wrapper}>
      <Header />
      <p className="section-label" style={{ textAlign: 'center', marginBottom: 16 }}>How do you want to get started?</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { m: 'location' as Mode, icon: '📍', title: 'Auto-Detect Location', desc: "Point at your farm. Soil data auto-filled from your region. Best for farmers without lab reports.", badge: <span className="badge badge-green">Recommended</span> },
          { m: 'lab' as Mode,      icon: '🧪', title: 'Enter Lab Report',    desc: "Have a soil test report? Enter your exact N, P, K values for the most accurate simulation.",  badge: <span className="badge badge-blue">High Accuracy</span> },
        ].map(({ m, icon, title, desc, badge }) => (
          <button key={m}
            onClick={() => { setMode(m); if (m === 'location') detectLocation(); }}
            style={{ background: 'var(--earth-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 20px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s, transform 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--amber)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--cream)', marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--cream-muted)', lineHeight: 1.5 }}>{desc}</div>
            <div style={{ marginTop: 14 }}>{badge}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── MODE: LOCATION ────────────────────────────────────────────────────────
  if (mode === 'location') return (
    <div style={wrapper}>
      <Header />
      {backBtn}

      {!showSoilForm && (
        <div className="card fade-up" style={{ padding: 28 }}>
          <p className="section-label">Detecting Your Farm Location</p>
          {locStatus === 'detecting' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ width: 44, height: 44, border: '2px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: 'var(--cream-muted)', fontSize: 14 }}>Loading regional soil data...</p>
            </div>
          )}
          {locStatus === 'error' && (
            <div>
              <p style={{ color: 'var(--amber-light)', fontSize: 13, marginBottom: 18 }}>📍 Could not auto-detect. Enter your farm details:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={{ fontSize: 11, color: 'var(--cream-muted)', display: 'block', marginBottom: 4 }}>State *</label>
                  <input className="soil-input" placeholder="e.g. Telangana" value={manualState} onChange={e => setManualState(e.target.value)} /></div>
                <div><label style={{ fontSize: 11, color: 'var(--cream-muted)', display: 'block', marginBottom: 4 }}>District *</label>
                  <input className="soil-input" placeholder="e.g. Warangal" value={manualDistrict} onChange={e => setManualDistrict(e.target.value)} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                <div><label style={{ fontSize: 11, color: 'var(--cream-muted)', display: 'block', marginBottom: 4 }}>Latitude (optional)</label>
                  <input className="soil-input" placeholder="e.g. 17.97" value={manualLat} onChange={e => setManualLat(e.target.value)} /></div>
                <div><label style={{ fontSize: 11, color: 'var(--cream-muted)', display: 'block', marginBottom: 4 }}>Longitude (optional)</label>
                  <input className="soil-input" placeholder="e.g. 79.59" value={manualLng} onChange={e => setManualLng(e.target.value)} /></div>
              </div>
              <button className="btn-primary" style={{ width: '100%' }} onClick={handleManualLocationLoad}>Load Regional Soil Data →</button>
            </div>
          )}
        </div>
      )}

      {showSoilForm && (
        <div className="fade-up">
          <LocationConfirmed district={region.district} state={region.state} soilType={defaults?.soil_type} mode="location" />
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <p className="section-label">Soil Parameters</p>
            <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginBottom: 20 }}>
              Auto-filled for <strong style={{ color: 'var(--amber-pale)' }}>{region.district}</strong>. Have a lab report? Adjust the sliders.
            </p>
            <SoilSliders fields={sliderFields} smallFields={smallFields} />
          </div>
          <SimSettings crop={crop} setCrop={setCrop} seasons={seasons} setSeasons={setSeasons} applyFertilizer={applyFertilizer} setApplyFertilizer={setApplyFertilizer} />
          <SubmitBtn onClick={handleSubmit} loading={loading} />
        </div>
      )}
    </div>
  );

  // ── MODE: LAB ─────────────────────────────────────────────────────────────
  if (mode === 'lab') return (
    <div style={wrapper}>
      <Header />
      {backBtn}

      {!showSoilForm ? (
        <div className="card fade-up" style={{ padding: 28 }}>
          <p className="section-label">Step 1 — Farm Location</p>
          <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginBottom: 18 }}>Enter your farm location so we can pull real weather data for your simulation.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 11, color: 'var(--cream-muted)', display: 'block', marginBottom: 4 }}>State *</label>
              <input className="soil-input" placeholder="e.g. Andhra Pradesh" value={manualState} onChange={e => setManualState(e.target.value)} /></div>
            <div><label style={{ fontSize: 11, color: 'var(--cream-muted)', display: 'block', marginBottom: 4 }}>District *</label>
              <input className="soil-input" placeholder="e.g. Krishna" value={manualDistrict} onChange={e => setManualDistrict(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div><label style={{ fontSize: 11, color: 'var(--cream-muted)', display: 'block', marginBottom: 4 }}>Latitude (optional)</label>
              <input className="soil-input" placeholder="e.g. 16.30" value={manualLat} onChange={e => setManualLat(e.target.value)} /></div>
            <div><label style={{ fontSize: 11, color: 'var(--cream-muted)', display: 'block', marginBottom: 4 }}>Longitude (optional)</label>
              <input className="soil-input" placeholder="e.g. 80.45" value={manualLng} onChange={e => setManualLng(e.target.value)} /></div>
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={handleManualLocationLoad}>Continue to Soil Data →</button>
        </div>
      ) : (
        <div className="fade-up">
          <LocationConfirmed district={region.district} state={region.state} mode="lab" />
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <p className="section-label">Step 2 — Your Soil Test Values</p>
            <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginBottom: 20 }}>Regional values shown as reference. Replace with your exact lab report numbers.</p>
            <SoilSliders fields={sliderFields} smallFields={smallFields} />
          </div>
          <SimSettings crop={crop} setCrop={setCrop} seasons={seasons} setSeasons={setSeasons} applyFertilizer={applyFertilizer} setApplyFertilizer={setApplyFertilizer} />
          <SubmitBtn onClick={handleSubmit} loading={loading} />
        </div>
      )}
    </div>
  );

  return null;
}