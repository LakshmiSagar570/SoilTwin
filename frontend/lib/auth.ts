const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function signUp(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}

export async function signIn(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  const data = await res.json();
  localStorage.setItem('km_token', data.token);
  localStorage.setItem('km_user', JSON.stringify({ id: data.user_id, email: data.email }));
  return data;
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('km_user');
  return u ? JSON.parse(u) : null;
}

export function signOut() {
  localStorage.removeItem('km_token');
  localStorage.removeItem('km_user');
  window.location.reload();
}