import { AnalysisResult, DistrictDefaults, SoilInput } from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getDistrictDefaults(state: string, district: string): Promise<DistrictDefaults> {
  const res = await fetch(`${BASE}/api/soil/district-defaults?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`);
  if (!res.ok) throw new Error('Failed to fetch district defaults');
  return res.json();
}

export async function analyzeSoil(input: SoilInput, userId: string) {
  const res = await fetch(`${BASE}/api/soil/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId          // ← backend reads this
    },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function reverseGeocode(lat: number, lng: number): Promise<{ state: string; district: string; display: string }> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  const addr = data.address || {};

  const district =
    addr.county || addr.district || addr.city_district ||
    addr.suburb || addr.city || addr.town || addr.village || 'Unknown';
  const state = addr.state || 'Unknown';
  const display = data.display_name?.split(',').slice(0, 3).join(',') || `${lat.toFixed(3)}, ${lng.toFixed(3)}`;

  return { state, district, display };
}