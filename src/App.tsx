import { useEffect, useState } from 'react'
import { api } from './api'
import type { Circuit, ModelStatus, PredictionResult, PredictionRow } from './types'
import './index.css'

// ─── helpers ────────────────────────────────────────────────────────────────
const TEAM_COLORS: Record<string, string> = {
  'Red Bull Racing': '#3671C6',
  'Red Bull': '#3671C6',
  Ferrari: '#E8002D',
  McLaren: '#FF8000',
  Mercedes: '#27F4D2',
  'Aston Martin': '#229971',
  Alpine: '#FF87BC',
  Williams: '#64C4FF',
  'Racing Bulls': '#6692FF',
  'RB': '#6692FF',
  'Haas F1 Team': '#B6BABD',
  Haas: '#B6BABD',
  'Kick Sauber': '#52E252',
  Sauber: '#52E252',
  Cadillac: '#D0112B',
  Audi: '#B9B9B9',
}

function teamColor(team: string) {
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (team.includes(key) || key.includes(team)) return color
  }
  return '#888888'
}

function positionMedal(pos: number) {
  if (pos === 1) return '🥇'
  if (pos === 2) return '🥈'
  if (pos === 3) return '🥉'
  return null
}

function changeArrow(change: number) {
  if (change > 0) return { symbol: `▲${change}`, cls: 'text-green-400' }
  if (change < 0) return { symbol: `▼${Math.abs(change)}`, cls: 'text-red-400' }
  return { symbol: '–', cls: 'text-gray-500' }
}

// ─── sub-components ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ModelStatus | null }) {
  if (!status) return null
  return (
    <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
      <span
        className={`flex items-center gap-1 ${status.model_available ? 'text-green-400' : 'text-red-400'}`}
      >
        <span className={`w-2 h-2 rounded-full inline-block ${status.model_available ? 'bg-green-400' : 'bg-red-500'}`} />
        {status.model_available ? `Modelo: ${status.model_file}` : 'Sin modelo — ejecuta main.py'}
      </span>
      {status.training_metrics && (
        <>
          <span className="text-gray-600">|</span>
          <span>Temporadas: {status.training_metrics.seasons.join(', ')}</span>
          <span className="text-gray-600">|</span>
          <span>MAE: {status.training_metrics.mae.toFixed(2)} pos</span>
          <span className="text-gray-600">|</span>
          <span>Top-3: {(status.training_metrics.top3_accuracy * 100).toFixed(1)}%</span>
        </>
      )}
    </div>
  )
}

function PodiumCard({ podium, predictions }: { podium: string[]; predictions: PredictionRow[] }) {
  const byDriver = Object.fromEntries(predictions.map((p) => [p.driver_code, p]))
  const order = [1, 0, 2] // P2 | P1 | P3 visual
  const heights = ['h-24', 'h-32', 'h-20']
  const labels = ['2°', '1°', '3°']
  const borderColors = ['border-[#8e9aab]', 'border-[#c8a84b]', 'border-[#b87333]']

  return (
    <div className="flex items-end justify-center gap-2 mt-2">
      {order.map((idx, vi) => {
        const code = podium[idx]
        const row = byDriver[code]
        if (!row) return null
        return (
          <div key={code} className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400">{row.team.split(' ')[0]}</span>
            <span
              className="text-2xl font-bold"
              style={{ color: teamColor(row.team) }}
            >
              {code}
            </span>
            <div
              className={`w-20 ${heights[vi]} flex flex-col items-center justify-center rounded-t-lg border-t-4 ${borderColors[vi]} bg-[#1a1a1a]`}
            >
              <span className="text-2xl">{labels[vi]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ResultsTable({ predictions }: { predictions: PredictionRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a2a2a] text-gray-500 text-xs uppercase tracking-wider">
            <th className="py-3 px-4 text-left w-12">Pos</th>
            <th className="py-3 px-4 text-left">Piloto</th>
            <th className="py-3 px-4 text-left hidden sm:table-cell">Equipo</th>
            <th className="py-3 px-4 text-center w-16">Grid</th>
            <th className="py-3 px-4 text-center w-20">Cambio</th>
            <th className="py-3 px-4 text-right w-24 hidden md:table-cell">Score</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((row) => {
            const arrow = changeArrow(row.position_change)
            const medal = positionMedal(row.position)
            const isTop3 = row.position <= 3
            return (
              <tr
                key={row.driver_code}
                className={`border-b border-[#1f1f1f] transition-colors hover:bg-[#222] ${isTop3 ? 'bg-[#1c1c1c]' : ''}`}
              >
                <td className="py-3 px-4 font-mono font-bold text-gray-300">
                  {medal ? (
                    <span className="text-base">{medal}</span>
                  ) : (
                    <span className="text-gray-500">P{row.position.toString().padStart(2, '0')}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className="font-bold text-base tracking-wide"
                    style={{ color: teamColor(row.team) }}
                  >
                    {row.driver_code}
                  </span>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1 h-4 rounded-full inline-block"
                      style={{ backgroundColor: teamColor(row.team) }}
                    />
                    <span className="text-gray-300 text-xs">{row.team}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-gray-400 font-mono">
                  P{row.grid_position}
                </td>
                <td className={`py-3 px-4 text-center font-mono text-xs font-bold ${arrow.cls}`}>
                  {arrow.symbol}
                </td>
                <td className="py-3 px-4 text-right text-gray-500 font-mono text-xs hidden md:table-cell">
                  {row.score.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null)
  const [circuits, setCircuits] = useState<Circuit[]>([])
  const [years, setYears] = useState<number[]>([])

  const [selectedCircuit, setSelectedCircuit] = useState('')
  const [selectedYear, setSelectedYear] = useState<number>(2026)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)

  useEffect(() => {
    Promise.all([api.status(), api.circuits(), api.years()]).then(
      ([status, circ, yr]) => {
        setModelStatus(status)
        setCircuits(circ.circuits)
        setYears(yr.years)
        if (circ.circuits.length > 0) setSelectedCircuit(circ.circuits[0].value)
        if (yr.years.length > 0) setSelectedYear(yr.years[yr.years.length - 1])
      }
    ).catch(() => {
      setError('No se puede conectar con el backend. Asegúrate de que api.py esté corriendo.')
    })
  }, [])

  async function handlePredict() {
    if (!selectedCircuit) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await api.predict(selectedCircuit, selectedYear)
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const selectedCircuitInfo = circuits.find((c) => c.value === selectedCircuit)

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* F1 logo accent */}
            <div className="w-1 h-10 bg-[#e10600] rounded-full" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                F1 Race Predictor
              </h1>
              <p className="text-xs text-gray-500">PTIA — Escuela Colombiana de Ingeniería</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <StatusBadge status={modelStatus} />
          </div>
        </div>
        <div className="sm:hidden px-4 pb-3">
          <StatusBadge status={modelStatus} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Control Panel */}
        <section className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
          <h2 className="text-sm uppercase tracking-widest text-[#e10600] font-bold mb-6">
            Configurar Predicción
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Circuit selector */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider" htmlFor="circuit">
                Gran Premio
              </label>
              <div className="relative">
                <select
                  id="circuit"
                  value={selectedCircuit}
                  onChange={(e) => setSelectedCircuit(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white rounded-lg px-4 py-3 text-sm appearance-none focus:outline-none focus:border-[#e10600] focus:ring-1 focus:ring-[#e10600] transition-colors cursor-pointer"
                >
                  {circuits.map((c) => (
                    <option key={c.circuit_key} value={c.value}>
                      {c.display_name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ▾
                </div>
              </div>
              {selectedCircuitInfo && (
                <p className="text-xs text-gray-600">
                  {selectedCircuitInfo.city} ·{' '}
                  {['', 'Callejero', 'Permanente', 'Híbrido'][selectedCircuitInfo.circuit_type]}
                </p>
              )}
            </div>

            {/* Year selector */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider" htmlFor="year">
                Temporada
              </label>
              <div className="relative">
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white rounded-lg px-4 py-3 text-sm appearance-none focus:outline-none focus:border-[#e10600] focus:ring-1 focus:ring-[#e10600] transition-colors cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ▾
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePredict}
              disabled={loading || !modelStatus?.model_available}
              className="px-8 py-3 bg-[#e10600] hover:bg-[#c00500] disabled:bg-[#3a0a09] disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Cargando datos...
                </>
              ) : (
                'Predecir'
              )}
            </button>
            {!modelStatus?.model_available && (
              <p className="text-xs text-gray-500">
                Entrena el modelo primero: <code className="bg-[#0f0f0f] px-1 rounded text-gray-400">python main.py</code>
              </p>
            )}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-[#1a0a0a] border border-[#e10600]/40 rounded-xl px-5 py-4 text-sm text-red-400">
            ⚠ {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-2 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-[#1a1a1a] rounded-lg" />
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <section className="space-y-6">
            {/* Race header */}
            <div className="flex items-start gap-4">
              <div className="w-1 h-12 bg-[#e10600] rounded-full flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{result.race_name}</h2>
                <p className="text-gray-500 text-sm">Temporada {result.year} · Predicción XGBoost</p>
              </div>
            </div>

            {/* Podium */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <h3 className="text-xs uppercase tracking-widest text-[#c8a84b] font-bold mb-4">
                Podio Predicho
              </h3>
              <PodiumCard podium={result.podium} predictions={result.predictions} />
            </div>

            {/* Movers */}
            {(result.gainers.length > 0 || result.losers.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.gainers.length > 0 && (
                  <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-5">
                    <h3 className="text-xs uppercase tracking-widest text-green-400 font-bold mb-3">
                      Ganan posiciones
                    </h3>
                    <ul className="space-y-2">
                      {result.gainers.map((g) => (
                        <li key={g.driver} className="flex justify-between items-center text-sm">
                          <span className="font-bold text-white">{g.driver}</span>
                          <span className="text-gray-400 text-xs">
                            P{g.from_pos} → P{g.to_pos}
                          </span>
                          <span className="text-green-400 font-bold">+{g.change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.losers.length > 0 && (
                  <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-5">
                    <h3 className="text-xs uppercase tracking-widest text-red-400 font-bold mb-3">
                      Pierden posiciones
                    </h3>
                    <ul className="space-y-2">
                      {result.losers.map((g) => (
                        <li key={g.driver} className="flex justify-between items-center text-sm">
                          <span className="font-bold text-white">{g.driver}</span>
                          <span className="text-gray-400 text-xs">
                            P{g.from_pos} → P{g.to_pos}
                          </span>
                          <span className="text-red-400 font-bold">{g.change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Full results table */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">
                Resultados Completos
              </h3>
              <ResultsTable predictions={result.predictions} />
            </div>

            {/* Model info footer */}
            {modelStatus?.training_metrics && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'MAE', value: `${modelStatus.training_metrics.mae.toFixed(2)} pos` },
                  { label: 'RMSE', value: `${modelStatus.training_metrics.rmse.toFixed(2)} pos` },
                  {
                    label: 'Top-3 Acc.',
                    value: `${(modelStatus.training_metrics.top3_accuracy * 100).toFixed(1)}%`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center"
                  >
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-lg font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] mt-16 py-6 text-center text-xs text-gray-600">
        F1 Race Predictor · PTIA · Escuela Colombiana de Ingeniería Julio Garavito ·{' '}
        XGBoost + FastF1
      </footer>
    </div>
  )
}
