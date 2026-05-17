import type { Circuit, ModelStatus, PredictionResult } from './types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

export const api = {
  status: (): Promise<ModelStatus> =>
    request<ModelStatus>('/status'),

  circuits: (): Promise<{ circuits: Circuit[] }> =>
    request<{ circuits: Circuit[] }>('/circuits'),

  years: (): Promise<{ years: number[] }> =>
    request<{ years: number[] }>('/years'),

  predict: (race: string, year: number): Promise<PredictionResult> =>
    request<PredictionResult>('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ race, year }),
    }),
}
