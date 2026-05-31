# Análisis Geo-Espacial · Clústers de Tiendas Bogotá

Dashboard interactivo en React + Vite que carga automáticamente un archivo Excel (`datos.xlsx`) con tiendas agrupadas por proximidad geográfica (≤ 1 km, método Haversine + BFS) y las visualiza sobre un mapa interactivo de Bogotá.

## ✨ Características

- **Portada editorial** con visualización tipo radar de las 301 tiendas
- **Mapa interactivo** con tiles oscuros de CARTO y marcadores coloreados por clúster
- **Filtros por clúster** con búsqueda y lista lateral
- **Panel de estadísticas** con top 10, densidad media y concentración
- **Carga automática** del Excel desde `public/datos.xlsx`
- **Responsive** para móvil y escritorio

## 🚀 Ejecutar localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## 🏗️ Build de producción

```bash
npm run build
npm run preview
```

## ☁️ Deploy en Vercel

### Opción A — desde GitHub (recomendada)

1. Crea un repositorio en GitHub y sube este proyecto:

```bash
git init
git add .
git commit -m "Initial commit: dashboard clústers Bogotá"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

2. Ve a [vercel.com/new](https://vercel.com/new), importa el repo de GitHub y haz clic en **Deploy**. Vercel detectará Vite automáticamente.

### Opción B — directamente con Vercel CLI

```bash
npm i -g vercel
vercel
```

## 📁 Estructura

```
.
├── public/
│   └── datos.xlsx         ← El archivo Excel se carga desde aquí
├── src/
│   ├── components/
│   │   ├── Landing.jsx    ← Portada de análisis geo-espacial
│   │   └── Dashboard.jsx  ← Mapa + filtros + estadísticas
│   ├── App.jsx            ← Orquesta carga del Excel y vistas
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## 🔄 Actualizar los datos

Reemplaza `public/datos.xlsx` con tu nuevo archivo (debe tener columnas `TIENDA`, `LATITUD`, `LONGITUD`, `CLUSTER`) y haz commit. Vercel re-deployará automáticamente.

## 🛠️ Stack

- **Vite** + **React 18**
- **react-leaflet** + **OpenStreetMap (CARTO dark)** — sin API keys
- **SheetJS (xlsx)** para leer Excel en el navegador
- **Lucide React** para iconos
- Tipografías: Instrument Serif, Bricolage Grotesque, JetBrains Mono
