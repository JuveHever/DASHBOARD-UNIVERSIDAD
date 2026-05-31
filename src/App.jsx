import { useState, useEffect, useMemo } from 'react'
import * as XLSX from 'xlsx'
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'

// Paleta de 43 colores generada en HCL para máxima distinguibilidad,
// con buena luminosidad sobre fondo oscuro.
const PALETTE = [
  '#d4ff3a', '#ff4d8d', '#4dd6ff', '#ffb347', '#a78bfa',
  '#34d399', '#fb7185', '#60a5fa', '#fbbf24', '#f472b6',
  '#22d3ee', '#facc15', '#f87171', '#818cf8', '#4ade80',
  '#fda4af', '#38bdf8', '#fde047', '#c084fc', '#86efac',
  '#fb923c', '#67e8f9', '#e879f9', '#a3e635', '#f9a8d4',
  '#7dd3fc', '#fef08a', '#bef264', '#fcd34d', '#5eead4',
  '#ddd6fe', '#fecdd3', '#bae6fd', '#fed7aa', '#d9f99d',
  '#99f6e4', '#e9d5ff', '#fbcfe8', '#a5f3fc', '#fef3c7',
  '#bbf7d0', '#fde68a', '#f5d0fe'
]

export default function App() {
  const [view, setView] = useState('landing') // landing | dashboard
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargarExcel() {
      try {
        // Carga automática desde /public/datos.xlsx
        const resp = await fetch(`${import.meta.env.BASE_URL}datos.xlsx`)
        if (!resp.ok) throw new Error('No se pudo cargar datos.xlsx')
        const buffer = await resp.arrayBuffer()
        const wb = XLSX.read(buffer, { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet)

        // Validar columnas y normalizar
        const clean = rows
          .filter(r => r.TIENDA && r.LATITUD != null && r.LONGITUD != null && r.CLUSTER)
          .map(r => ({
            TIENDA: String(r.TIENDA).trim(),
            LATITUD: Number(r.LATITUD),
            LONGITUD: Number(r.LONGITUD),
            CLUSTER: String(r.CLUSTER).trim(),
          }))

        setData(clean)
      } catch (e) {
        console.error(e)
        setError(e.message)
      }
    }
    cargarExcel()
  }, [])

  // Pre-cálculo de estadísticas + asignación de colores a clusters
  const stats = useMemo(() => {
    if (!data) return null

    // Conteo por cluster
    const counts = {}
    data.forEach(d => { counts[d.CLUSTER] = (counts[d.CLUSTER] || 0) + 1 })

    // Ordenar clusters por tamaño desc → asignar colores de la paleta
    const ordered = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const clusterMap = {}
    ordered.forEach(([cluster, count], i) => {
      clusterMap[cluster] = {
        count,
        color: PALETTE[i % PALETTE.length],
      }
    })

    const sizes = Object.values(counts)
    const isolated = sizes.filter(s => s === 1).length

    return {
      totalTiendas: data.length,
      totalClusters: Object.keys(counts).length,
      maxClusterSize: Math.max(...sizes),
      isolated,
      clusterMap,
      allPoints: data.map(d => ({
        tienda: d.TIENDA,
        lat: d.LATITUD,
        lon: d.LONGITUD,
        color: clusterMap[d.CLUSTER].color,
      })),
    }
  }, [data])

  if (error) {
    return (
      <div className="loader">
        <div className="loader-dot" style={{ background: 'var(--magenta)' }} />
        <div className="loader-text" style={{ color: 'var(--magenta)' }}>
          Error: {error}
        </div>
        <div className="loader-text">
          Asegúrate de tener <code>datos.xlsx</code> en la carpeta <code>public/</code>
        </div>
      </div>
    )
  }

  if (!data || !stats) {
    return (
      <div className="loader">
        <div className="loader-dot" />
        <div className="loader-text">Cargando datos geo-espaciales…</div>
      </div>
    )
  }

  return view === 'landing' ? (
    <Landing stats={stats} onEnter={() => setView('dashboard')} />
  ) : (
    <Dashboard data={data} stats={stats} onBack={() => setView('landing')} />
  )
}
