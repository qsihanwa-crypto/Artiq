const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiGet(path) {
  const res = await fetch(`${API_URL}/api${path}`);

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}