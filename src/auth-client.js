import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({ baseURL: window.location.origin });

export async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.message || `Request failed (${response.status})`);
  return body;
}

export function euro(cents) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format((Number(cents) || 0) / 100);
}
