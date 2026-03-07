'use client';
import { useState, useEffect } from 'react';
import { signIn, signUp, signOut, getUser } from '../lib/auth';

// ── Local user type (replaces Supabase User) ─────────────────────────────
interface KrishiUser {
  id: string;
  email: string;
}

interface Props {
  children: (user: KrishiUser) => React.ReactNode;
}

export default function AuthGate({ children }: Props) {
  const [user, setUser]               = useState<KrishiUser | null>(() => getUser());
  const [loading, setLoading]         = useState(false);
  const [mode, setMode]               = useState<'login' | 'signup'>('login');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [error, setError]             = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // ── Auth handler ───────────────────────────────────────────────────────
  async function handleAuth() {
    setAuthLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await signUp(email, password);
      }
      await signIn(email, password);
      setUser(getUser());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
    setAuthLoading(false);
  }

  function handleLogout() {
    signOut();
    setUser(null);
  }

  // ── Loading spinner ────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--earth-dark)'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 40, height: 40,
        border: '2px solid var(--border)',
        borderTopColor: 'var(--amber)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  );

  // ── Login / Signup form ────────────────────────────────────────────────
  if (!user) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--earth-dark)', padding: 16
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 36 }}>

        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🌱</div>
          <h1 className="font-display" style={{ fontSize: 24, color: 'var(--cream)', marginBottom: 6 }}>
            KrishiMind
          </h1>
          <p style={{ fontSize: 13, color: 'var(--cream-muted)' }}>
            AI Soil Digital Twin for Indian Farmers
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 24,
          border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden'
        }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '10px', fontSize: 13, fontWeight: 600,
                background: mode === m ? 'var(--amber)' : 'transparent',
                color: mode === m ? 'var(--earth-dark)' : 'var(--cream-muted)',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s'
              }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="soil-input" type="email" placeholder="Email address"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
          />
          <input
            className="soil-input" type="password" placeholder="Password (min 6 chars)"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
          />

          {error && (
            <p style={{ fontSize: 12, color: '#E86A5A', margin: 0 }}>⚠ {error}</p>
          )}

          <button
            className="btn-primary" onClick={handleAuth}
            disabled={authLoading} style={{ marginTop: 4 }}>
            {authLoading
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'var(--earth-dark)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Please wait...
                </span>
              : mode === 'login' ? 'Sign In →' : 'Create Account →'
            }
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--cream-muted)', marginTop: 20 }}>
          Your soil analyses are saved privately to your account.
        </p>
      </div>
    </div>
  );

  // ── Authenticated view ─────────────────────────────────────────────────
  return (
    <>
      {/* Top-right user bar */}
      <div style={{
        position: 'fixed', top: 0, right: 0, zIndex: 100,
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10
      }}>
        <span style={{ fontSize: 11, color: 'var(--cream-muted)' }}>{user.email}</span>
        <button
          className="btn-ghost"
          style={{ fontSize: 11, padding: '4px 10px' }}
          onClick={handleLogout}>
          Sign out
        </button>
      </div>

      {children(user)}
    </>
  );
}