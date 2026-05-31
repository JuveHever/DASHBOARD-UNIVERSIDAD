import { useState, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { ArrowLeft, Search, Layers, MapPin } from 'lucide-react'

// Centrado dinámico cuando cambia la selección
function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lon], 16, { animate: true })
    } else {
      const bounds = points.map(p => [p.lat, p.lon])
      map.fitBounds(bounds, { padding: [60, 60], animate: true })
    }
  }, [points, map])
  return null
}

export default function Dashboard({ data, stats, onBack }) {
  const [selectedCluster, setSelectedCluster] = useState(null) // null = todos
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('resumen') // resumen | tiendas

  // Lista de clusters ordenada por tamaño desc
  const clusterList = useMemo(() => {
    return Object.entries(stats.clusterMap)
      .map(([cluster, info]) => ({ cluster, ...info }))
      .sort((a, b) => b.count - a.count)
  }, [stats])

  // Filtrado por búsqueda
  const filteredClusters = useMemo(() => {
    if (!search.trim()) return clusterList
    const q = search.toLowerCase()
    return clusterList.filter(c => c.cluster.toLowerCase().includes(q))
  }, [clusterList, search])

  // Puntos visibles en el mapa
  const visiblePoints = useMemo(() => {
    if (!selectedCluster) return data
    return data.filter(d => d.CLUSTER === selectedCluster)
  }, [data, selectedCluster])

  // Tiendas a listar en el panel derecho
  const tiendasPanel = useMemo(() => {
    if (!selectedCluster) return data.slice(0, 50)
    return data.filter(d => d.CLUSTER === selectedCluster)
  }, [data, selectedCluster])

  const activeInfo = selectedCluster
    ? stats.clusterMap[selectedCluster]
    : { count: stats.totalTiendas, color: 'var(--accent)' }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="brand">
          <span className="brand-mark" />
          <h1>Análisis <em>geo-espacial</em> · Clústers Bogotá</h1>
        </div>
        <div className="right">
          <span>{stats.totalTiendas} tiendas · {stats.totalClusters} clústers</span>
          <button className="dash-back-btn" onClick={onBack}>
            <ArrowLeft size={14} strokeWidth={1.8} />
            Portada
          </button>
        </div>
      </header>

      <div className="dash-body">
        {/* ─── Sidebar izquierda ─── */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">Filtrar por clúster</div>
            <div className="sidebar-subtitle">
              <em>{stats.totalClusters}</em> grupos
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar clúster…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="cluster-list">
            <button
              className={`cluster-show-all ${!selectedCluster ? 'active' : ''}`}
              onClick={() => setSelectedCluster(null)}
            >
              Mostrar todos · {stats.totalTiendas}
            </button>

            {filteredClusters.map(c => (
              <div
                key={c.cluster}
                className={`cluster-item ${selectedCluster === c.cluster ? 'active' : ''}`}
                onClick={() => setSelectedCluster(c.cluster)}
              >
                <span className="cluster-swatch" style={{ background: c.color }} />
                <span className="cluster-name">{c.cluster}</span>
                <span className="cluster-count">{c.count}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ─── Mapa central ─── */}
        <div className="map-wrap">
          <div className="map-overlay">
            <div className="map-overlay-label">
              {selectedCluster ? selectedCluster : 'Vista general'}
            </div>
            <div className="map-overlay-value">
              <em>{activeInfo.count}</em> tienda{activeInfo.count !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="map-legend">
            <span>Cada color</span>
            <span className="legend-row">
              <span className="legend-dot" style={{ background: '#d4ff3a' }} />
              <span className="legend-dot" style={{ background: '#ff4d8d' }} />
              <span className="legend-dot" style={{ background: '#4dd6ff' }} />
            </span>
            <span>= un clúster (≤ 1 km)</span>
          </div>

          <MapContainer
            center={[4.65, -74.10]}
            zoom={12}
            scrollWheelZoom={true}
            preferCanvas={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <FitBounds points={visiblePoints.map(p => ({ lat: p.LATITUD, lon: p.LONGITUD }))} />

            {visiblePoints.map((d) => {
              const color = stats.clusterMap[d.CLUSTER].color
              const isFromOther = selectedCluster && d.CLUSTER !== selectedCluster
              return (
                <CircleMarker
                  key={d.TIENDA}
                  center={[d.LATITUD, d.LONGITUD]}
                  radius={selectedCluster ? 7 : 5}
                  pathOptions={{
                    color: '#0a0d11',
                    weight: 1.5,
                    fillColor: color,
                    fillOpacity: isFromOther ? 0.15 : 0.9,
                  }}
                  eventHandlers={{
                    click: () => setSelectedCluster(d.CLUSTER),
                  }}
                >
                  <Popup>
                    <div className="popup-tienda">{d.TIENDA}</div>
                    <div className="popup-cluster" style={{ color }}>
                      ● {d.CLUSTER}
                    </div>
                    <div className="popup-coords">
                      {d.LATITUD.toFixed(6)}, {d.LONGITUD.toFixed(6)}
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        {/* ─── Panel derecho ─── */}
        <aside className="detail-panel">
          <div className="detail-tabs">
            <button
              className={`detail-tab ${tab === 'resumen' ? 'active' : ''}`}
              onClick={() => setTab('resumen')}
            >
              Resumen
            </button>
            <button
              className={`detail-tab ${tab === 'tiendas' ? 'active' : ''}`}
              onClick={() => setTab('tiendas')}
            >
              Tiendas
            </button>
          </div>

          <div className="detail-content">
            {tab === 'resumen' ? (
              <>
                <div className="stat-card">
                  <div className="stat-card-label">Densidad media</div>
                  <div className="stat-card-value">
                    {(stats.totalTiendas / stats.totalClusters).toFixed(1)}
                  </div>
                  <div className="stat-card-foot">tiendas por clúster en promedio</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-label">Concentración top-3</div>
                  <div className="stat-card-value">
                    {Math.round(
                      (clusterList.slice(0, 3).reduce((a, c) => a + c.count, 0) /
                        stats.totalTiendas) * 100
                    )}%
                  </div>
                  <div className="stat-card-foot">
                    de las tiendas están en los 3 clústers más grandes
                  </div>
                </div>

                <div className="section-label">
                  <Layers size={11} strokeWidth={2} />
                  Top 10 clústers
                </div>

                <div className="bar-chart">
                  {clusterList.slice(0, 10).map(c => {
                    const pct = (c.count / clusterList[0].count) * 100
                    return (
                      <div
                        key={c.cluster}
                        className="bar-row"
                        onClick={() => setSelectedCluster(c.cluster)}
                      >
                        <span className="bar-label">{c.cluster}</span>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${pct}%`, background: c.color }}
                          />
                        </div>
                        <span className="bar-count">{c.count}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="section-label">Distribución</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                  De <strong>{stats.totalClusters}</strong> clústers identificados,{' '}
                  <strong style={{ color: 'var(--accent)' }}>{stats.isolated}</strong> contienen
                  una sola tienda — son comercios geográficamente aislados respecto al resto del
                  universo analizado.
                </div>
              </>
            ) : (
              <>
                <div className="section-label">
                  <MapPin size={11} strokeWidth={2} />
                  {selectedCluster ? `${selectedCluster} · ${tiendasPanel.length} tiendas` : `Primeras ${tiendasPanel.length} tiendas`}
                </div>

                <div className="tienda-list">
                  {tiendasPanel.map(t => (
                    <div key={t.TIENDA} className="tienda-row">
                      <div className="left">
                        <span
                          className="tienda-dot"
                          style={{ background: stats.clusterMap[t.CLUSTER].color }}
                        />
                        <div>
                          <div className="tienda-name">{t.TIENDA}</div>
                          <div className="tienda-coords">
                            {t.LATITUD.toFixed(4)}, {t.LONGITUD.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      <div className="tienda-coords">{t.CLUSTER}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
