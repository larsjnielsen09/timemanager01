// Vite injects import.meta.env at runtime; for TS type safety use explicit typing
const VITE_API_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL
const API_URL = VITE_API_URL || 'http://localhost:8000'

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json()
}
