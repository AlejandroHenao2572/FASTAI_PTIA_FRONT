# F1 Race Predictor — Frontend

Interfaz web para el sistema de predicción de carreras de Fórmula 1.  
Construida en **React 19 + TypeScript + Tailwind CSS v4**, consume el backend FastAPI del proyecto `FASTAI_PTIA`.

**Proyecto para Principios y Tecnologías de Inteligencia Artificial — PTIA**  
**Escuela Colombiana de Ingeniería Julio Garavito**

## Desarrollado por
- David Alejandro Patacón Henao
- Samuel Antonio Gil Romero

---

## Requisitos

- Node.js 18+
- Backend `FASTAI_PTIA` corriendo en `localhost:8000` (ver instrucciones en ese repo)

---

## Instalación

```bash
npm install
```

---

## Desarrollo

```bash
# Primero levantar el backend (en FASTAI_PTIA/)
source venv/bin/activate
uvicorn api:app --reload --port 8000

# Luego el frontend
npm run dev
```

Abrir `http://localhost:5173`.

Las peticiones a `/api/*` se redirigen automáticamente a `http://localhost:8000` via el proxy de Vite — no se requiere configuración adicional.

---

## Producción

```bash
npm run build    # genera dist/
npm run preview  # sirve el build localmente
```

En producción configurar un reverse proxy (nginx, etc.) que enrute `/api` al backend.

---

## Stack

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 19 | UI framework |
| TypeScript | ~6.0 | Tipado estático |
| Tailwind CSS | v4 | Estilos utility-first |
| Vite | 8 | Build tool + dev server |
| Fetch API | nativa | Peticiones HTTP al backend |

---

## Estructura

```
src/
├── App.tsx        # Componente principal — toda la UI
├── api.ts         # Cliente HTTP (fetch wrapper tipado)
├── types.ts       # Tipos TypeScript compartidos
├── index.css      # Estilos base + @import tailwindcss
└── main.tsx       # Entrypoint React
```

---

## Funcionalidades

- **Selector de Gran Premio** — 24 circuitos del calendario F1 con nombre, ciudad y tipo de pista
- **Selector de temporada** — años soportados por el modelo (2023–2026)
- **Botón Predecir** — dispara `POST /api/predict`, muestra spinner mientras FastF1 descarga datos de clasificación
- **Podio visual** — P1/P2/P3 con colores oficiales de cada equipo
- **Tabla de resultados** — posición predicha, piloto, equipo, grid, cambio de posición (▲/▼), score del modelo
- **Tarjetas movers** — top 3 pilotos que ganan/pierden más posiciones vs. grid
- **Status badge** — estado del modelo (entrenado/no), MAE, Top-3 Accuracy en el header

---

## Conexión con el backend

Definida en dos puntos:

**`vite.config.ts`** — proxy en desarrollo:
```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
},
```

**`src/api.ts`** — base URL relativa:
```ts
const BASE = '/api'
```

El frontend siempre usa rutas relativas; el proxy de Vite las redirige al backend en dev. En build no hay proxy — configurar a nivel de servidor.

---

## Endpoints consumidos

| Método | Ruta | Uso |
|--------|------|-----|
| `GET` | `/api/status` | Estado del modelo + métricas de entrenamiento |
| `GET` | `/api/circuits` | Lista de 24 circuitos disponibles |
| `GET` | `/api/years` | Años soportados |
| `POST` | `/api/predict` | Predicción `{ race, year }` → tabla de resultados |
