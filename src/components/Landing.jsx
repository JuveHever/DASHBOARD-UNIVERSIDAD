import { useMemo } from 'react'
import { ArrowRight, MapPin, Layers, Compass } from 'lucide-react'

export default function Landing({ stats, onEnter }) {
  // Mini-mapa estilizado de las tiendas para el radar/visualización derecha
  const radarPoints = useMemo(() => {
    if (!stats?.allPoints) return []
    // Normalizar coordenadas al viewBox 0-400
    const lats = stats.allPoints.map(p => p.lat)
    const lons = stats.allPoints.map(p => p.lon)
    const minLat = Math.min(...lats), maxLat = Math.max(...lats)
    const minLon = Math.min(...lons), maxLon = Math.max(...lons)
    const pad = 30
    const w = 400 - pad * 2
    const h = 400 - pad * 2
    return stats.allPoints.map(p => ({
      x: pad + ((p.lon - minLon) / (maxLon - minLon)) * w,
      y: pad + (1 - (p.lat - minLat) / (maxLat - minLat)) * h,
      color: p.color,
      tienda: p.tienda,
    }))
  }, [stats])

  if (!stats) return null

  return (
    <div className="landing">
      <div className="landing-grid" />
      <div className="landing-noise" />

      <header className="landing-header">
        <div className="brand">
          <span className="brand-dot" />
          <span>GEO·ANALYTICS / BOG-2025</span>
        </div>
        <div className="meta">
          <span>04°35′N · 74°04′W</span>
          <span>v1.0 · Análisis de Clústers</span>
          <span>{new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' })}</span>
        </div>
      </header>

      <main className="landing-main">
        <div className="landing-left">
          <div className="landing-eyebrow fade-up delay-1">
            <Compass size={14} strokeWidth={1.5} />
            Análisis Geo-Espacial · Bogotá D.C.
          </div>

          <h1 className="landing-title fade-up delay-2">
            Cartografía<br />
            de <span className="italic">clústers</span><br />
            comerciales
            <span className="small">— una lectura de la proximidad entre {stats.totalTiendas} tiendas dentro de un radio de 1 km.</span>
          </h1>

          <p className="landing-description fade-up delay-3">
            Cada punto sobre el mapa es una tienda; cada color, un vecindario natural
            de comercio. Identificamos <strong style={{color:'var(--accent)'}}>{stats.totalClusters} agrupaciones</strong> a
            partir de la distancia geodésica, revelando densidades, corredores y bolsas
            de aislamiento en la geografía de la ciudad.
          </p>

          <div className="landing-cta-row fade-up delay-4">
            <button className="cta-primary" onClick={onEnter}>
              Explorar el análisis
              <ArrowRight size={18} className="arrow" strokeWidth={2} />
            </button>
            <div className="cta-meta">
              <span>Dataset · <strong>datos.xlsx</strong></span>
              <span>Método · <strong>Haversine + BFS, r ≤ 1 km</strong></span>
            </div>
          </div>
        </div>

        <div className="landing-right fade-up delay-3">
          <div className="radar">
            <span className="radar-label tl">N · 04°51′</span>
            <span className="radar-label tr">● LIVE</span>
            <span className="radar-label bl">S · 04°30′</span>
            <span className="radar-label br">301 nodos</span>

            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(212,255,58,0.08)" />
                  <stop offset="100%" stopColor="rgba(212,255,58,0)" />
                </radialGradient>
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Marco */}
              <rect x="0" y="0" width="400" height="400" fill="url(#bg-glow)" />
              <rect x="1" y="1" width="398" height="398" fill="none" stroke="var(--line)" strokeWidth="1" />

              {/* Crosshairs */}
              <line x1="200" y1="0" x2="200" y2="400" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 4" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 4" />

              {/* Anillos concéntricos pulsantes */}
              {[60, 120, 180].map((r, i) => (
                <circle
                  key={r}
                  cx="200" cy="200" r={r}
                  fill="none"
                  stroke="var(--accent)"
                  strokeOpacity={0.12 - i * 0.03}
                  strokeWidth="1"
                />
              ))}

              {/* Esquinas decorativas */}
              {[[10,10,'tl'],[390,10,'tr'],[10,390,'bl'],[390,390,'br']].map(([x,y,k]) => (
                <g key={k}>
                  <line x1={x-6} y1={y} x2={x+6} y2={y} stroke="var(--accent)" strokeWidth="1.2" />
                  <line x1={x} y1={y-6} x2={x} y2={y+6} stroke="var(--accent)" strokeWidth="1.2" />
                </g>
              ))}

              {/* Puntos de las tiendas */}
              {radarPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x} cy={p.y}
                  r="2"
                  fill={p.color}
                  filter="url(#softGlow)"
                  style={{
                    animation: `dotPulse ${2.5 + (i % 7) * 0.3}s ease-in-out ${i * 0.008}s infinite`
                  }}
                >
                  <title>{p.tienda}</title>
                </circle>
              ))}

              {/* Etiqueta central */}
              <text x="200" y="385" textAnchor="middle"
                    fontFamily="var(--mono)" fontSize="9"
                    fill="var(--ink-3)" letterSpacing="2">
                BOGOTÁ · CO
              </text>
            </svg>
          </div>
        </div>
      </main>

      <section className="landing-stats">
        <div className="stat fade-up delay-3">
          <span className="stat-label">Tiendas analizadas</span>
          <span className="stat-value">{stats.totalTiendas}</span>
        </div>
        <div className="stat fade-up delay-4">
          <span className="stat-label">Clústers identificados</span>
          <span className="stat-value">{stats.totalClusters}</span>
        </div>
        <div className="stat fade-up delay-4">
          <span className="stat-label">Mayor agrupación</span>
          <span className="stat-value">{stats.maxClusterSize}<span className="unit">tiendas</span></span>
        </div>
        <div className="stat fade-up delay-5">
          <span className="stat-label">Tiendas aisladas</span>
          <span className="stat-value">{stats.isolated}<span className="unit">únicas</span></span>
        </div>
      </section>
    </div>
  )
}
