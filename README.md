# Dashboard UDEC Posgrados

Aplicación web cliente para visualización y gestión de la oferta de posgrados de la Universidad de Cundinamarca.

## Arquitectura actual

Aplicación de página única (SPA) sin framework. Estado global mediante variables en `window.*`. Renderizado imperativo mediante manipulación directa del DOM (`innerHTML`).

El código evoluciona desde un monolito (`app.js`) hacia módulos funcionales por dominio, como paso previo a una arquitectura MVC basada en ESModules.

## Fases del refactor

| Fase | Objetivo | Estado |
|------|----------|--------|
| 0 | Prototipo funcional monolítico | ✅ Completado |
| 1 | Extraer utilidades base (utils, storage, filters) | ✅ Completado |
| 2 | Extraer dashboard (KPIs + barra de facultades) | ✅ En curso |
| 3 | Extraer editor de datos | ⬜ Pendiente |
| 4 | Extraer pipeline, SNIES e indicadores | ⬜ Pendiente |
| 5 | Migrar a ESModules + MVC | ⬜ Futuro |

## Estructura del proyecto

```
Dashboard_UDEC_Posgrados_2026-04-23.html   ← Página principal
assets/
└── js/
    ├── app.js                              ← Orquestador (monolítico, en fragmentación)
    └── modules/
        ├── utils.js                        ← Utilidades base (getSt, toast, uid, gv, gi)
        ├── storage.js                      ← Persistencia localStorage + descarga HTML
        ├── filters.js                      ← Filtros (sede, oferta, estado, nivel, pregrado)
        └── dashboard.js                    ← KPIs + barra de facultades (Fase 2)
```

## Orden de carga (script tags)

```
utils.js → storage.js → filters.js → dashboard.js → app.js
```

Las funciones se definen como globales (sin import/export). Cada módulo expone al final sus funciones mediante `window.*` para mantener compatibilidad con `onclick=""` inline y llamadas desde app.js.

## Estrategia modular actual

| Módulo | Dependencias | Expone globalmente |
|--------|-------------|-------------------|
| `utils.js` | Ninguna | showConfirm, getSt, pll, uid, gv, gi, toast |
| `storage.js` | utils | saveDB, loadDB, downloadHTML, resetDB |
| `filters.js` | utils | sedeMatch, ofertaMatch, estadoMatch, nivelMatch, pregradoMatch, itemMatch, applyFilters, resetFilters, populateSedes |
| `dashboard.js` | utils, filters, app (vars) | renderKPIs, renderFacBar, selFac |
| `app.js` | Todos | renderTree, renderTabla, renderSedeView, showTab, renderViews, renderEditor, renderSNIES, renderPipeline, renderIndicadores, y CRUD completo del editor |

## Módulos pendientes de extraer (aún en app.js)

- **Editor** — renderEditor, renderProgForm, saveProg, etc.
- **Pipeline** — renderPipeline, buildTimeline, toggleSec
- **SNIES** — renderSNIES, snSetFac, snSetProg, exportSNIES
- **Indicadores** — renderIndicadores

## Riesgos arquitectónicos conocidos

1. **Funciones sombra (shadowed)**: Varias funciones del editor tienen dos definiciones en app.js. La segunda definición (a partir de línea ~1443) es la activa; la primera (~línea 364) es código muerto.
2. **Alto acoplamiento**: `showTab` conoce los 7 paneles y los renderers asociados. `renderViews` orquesta 4 renderers.
3. **onclick inline**: Las funciones expuestas vía `window.*` son necesarias mientras existan atributos `onclick=""` en HTML renderizado.
4. **Estado global**: `DB`, `curFac`, `filt*` son mutables desde cualquier módulo. Sin encapsulamiento.
