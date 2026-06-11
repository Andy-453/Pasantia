# Dashboard UDEC Posgrados

Aplicación web cliente (SPA) para visualización y gestión de la oferta de posgrados de la Universidad de Cundinamarca.

Características:
- Visualización jerárquica de programas (árbol, tabla, sede)
- Panel SNIES con importación Excel, indicadores históricos 2020–2024
- Editor de datos con CRUD completo de facultades y programas
- Pipeline de estado de desarrollo
- Rutas de aprendizaje
- Exportación a HTML standalone con datos embebidos

## Arquitectura

SPA sin framework. Arquitectura MVC gradual con carpetas por rol (`models/`, `views/`, `controllers/`, `data/`, `modules/`). Estado global centralizado en `AppState` (`models/app-state.js`). Renderizado imperativo mediante `innerHTML` y actualización vía funciones globales expuestas en `window.*`.

Los módulos funcionales se cargan mediante script tags en orden de dependencias. No se usan ESModules ni bundlers — todo el código se expone en el ámbito global para compatibilidad con `onclick=""` inline y exportación HTML standalone.

### Capas

| Capa | Carpeta | Propósito |
|------|---------|-----------|
| Modelos | `models/` | Estado centralizado, lógica de datos pura (SNIES, rutas) |
| Datos | `data/` | Datos iniciales por defecto, capa de acceso a datos |
| Vistas | `views/` | Renderizado de cada panel (árbol, tabla, sede, editor, SNIES, pipeline, etc.) |
| Controladores | `controllers/` | Navegación, orquestación, delegación de eventos |
| Módulos | `modules/` | Utilidades, persistencia, filtros, indicadores, exportación, embedding |

### Orquestador

`app.js` inicializa los datos (`loadDB`, `loadLearningRoutes`, `loadSnies`), expone todas las funciones globales via `window.App`, y delega el renderizado a los módulos de vista.

## Fases del refactor

| Fase | Objetivo | Estado |
|------|----------|--------|
| 0 | Prototipo funcional monolítico | ✅ Completado |
| 1 | Extraer utilidades base (utils, storage, filters) | ✅ Completado |
| 2 | Extraer dashboard (KPIs + barra de facultades) | ✅ Completado |
| 3a | Extraer SNIES (modelo, loader, vista, exportación) | ✅ Completado |
| 3b | Extraer Pipeline, Indicadores, Rutas de Aprendizaje | ✅ Completado |
| 3c | Extraer Editor, vistas de árbol/tabla/sede, controladores | ✅ Completado |
| 4 | Migrar a ESModules + MVC con imports nativos | ⬜ Futuro |
| 5 | Adoptar framework (Lit, Svelte, o similar) | ⬜ Futuro |

## Estructura del proyecto

```
Dashboard_UDEC_Posgrados_2026-04-23.html   ← Página principal (2 CDN + 23 scripts inline)
assets/
└── js/
    ├── app.js                              ← Orquestador + exportación global
    │
    ├── models/                             ← Modelos de datos
    │   ├── app-state.js                    ←   AppState (estado centralizado)
    │   ├── snies-model.js                  ←   Modelo SNIES (validación, construcción, derivados)
    │   └── learning-routes.js              ←   Persistencia de rutas de aprendizaje
    │
    ├── data/                               ← Datos iniciales y acceso
    │   ├── default-data.js                 ←   DEFAULT_DATA (datos por defecto)
    │   ├── app-data.js                     ←   AppData (capa de acceso a DB)
    │   └── learning-routes.js              ←   Rutas de aprendizaje por defecto
    │
    ├── views/                              ← Vistas (renderizado)
    │   ├── snies.js                        ←   Panel SNIES (indicadores, gráficos Chart.js)
    │   ├── tree.js                         ←   Árbol jerárquico
    │   ├── tabla.js                        ←   Tabla de programas
    │   ├── sede-view.js                    ←   Vista por sede
    │   ├── pipeline.js                     ←   Pipeline de estado de desarrollo
    │   ├── learning-route.js               ←   Modal de ruta de aprendizaje
    │   ├── prog-form.js                    ←   Formulario de programa
    │   └── editor.js                       ←   Editor de datos (CRUD)
    │
    ├── controllers/                        ← Controladores
    │   ├── navigation.js                   ←   showTab, renderViews, snSetFac, snSetProg
    │   └── actions.js                      ←   Delegación de eventos (data-action)
    │
    └── modules/                            ← Módulos funcionales
        ├── utils.js                        ←   Utilidades base (getSt, toast, uid, showConfirm)
        ├── storage.js                      ←   Persistencia localStorage + exportación HTML
        ├── filters.js                      ←   Filtros (sede, oferta, estado, nivel, pregrado)
        ├── dashboard.js                    ←   KPIs + barra de facultades
        ├── indicators.js                   ←   Panel de indicadores y métricas
        ├── export.js                       ←   Exportación de datos (CSV, downloadDB)
        ├── embed.js                        ←   Embedding de recursos para HTML standalone
        └── snies-loader.js                 ←   Carga, merge y persistencia de datos SNIES
```

## Dependencias CDN

| Librería | Versión | Propósito | Carga en |
|----------|---------|-----------|----------|
| Chart.js | 4.4.1 | Gráficos del panel SNIES (flujo estudiantil, tasas) | `Dashboard_UDEC_Posgrados_2026-04-23.html:9` |
| SheetJS (xlsx) | 0.18.5 | Lectura de archivos Excel SNIES (.xlsx/.xls) | `Dashboard_UDEC_Posgrados_2026-04-23.html:10` |

## Orden de carga (script tags)

```
CDN:
  Chart.js 4.4.1
  SheetJS 0.18.5

Módulos base:
  utils.js → embed.js → storage.js → default-data.js → app-data.js

Modelos:
  app-state.js → learning-routes.js (model) → snies-model.js

Módulos funcionales:
  snies-loader.js → filters.js → dashboard.js → indicators.js → export.js

Datos:
  learning-routes.js (data)

Vistas:
  pipeline.js → sede-view.js → learning-route.js → tabla.js → snies.js → prog-form.js → tree.js → editor.js

Controladores:
  navigation.js → actions.js

Orquestador:
  app.js
```

## Módulo SNIES

### Descripción general

El módulo SNIES permite importar, visualizar y gestionar datos históricos (2020–2024) de programas de posgrado desde archivos Excel con formato SNIES. Los datos se integran mediante MERGE por nombre de programa y se persisten en localStorage y en exportaciones HTML standalone.

### Componentes

| Archivo | Rol |
|---------|-----|
| `models/snies-model.js` | Funciones puras: validación de Excel, construcción de objetos programa, cálculo de derivados |
| `modules/snies-loader.js` | Importación Excel, merge, persistencia localStorage, restauración, eliminación individual |
| `views/snies.js` | Renderizado del panel SNIES con toolbar, filtros, KPIs, gráficos Chart.js y tabla histórica |
| `modules/export.js` | Exportación de datos SNIES a CSV |

### Flujo de importación Excel

```
Usuario selecciona archivo .xlsx/.xls
  → SheetJS (XLSX) lee el workbook
  → snies-model.validateCatalogo() — valida hoja CATÁLOGO
  → snies-model.validateIndicadores() — valida hoja INDICADORES
  → snies-model.buildPrograms() — construye objetos programa con _source: 'imported'
  → snies-model.computeDerived() — calcula tabs, tsel, tgrad, pctH, pctM
  → snies-loader.mergeSNIES() — fusiona por nombre (reemplaza match, conserva no-match, agrega nuevos)
  → _saveSniesLocal() — persiste en localStorage
  → renderSNIES() — actualiza la UI
```

### Persistencia

| Medio | Clave / Variable | Formato |
|-------|-----------------|---------|
| localStorage | `udec_snies_data` | `{ version: 1, data: { programs: [...] } }` |
| HTML exportado (standalone) | `window.__EMBEDDED_SD` | `JSON.stringify(AppState.snies.SD)` |
| Snapshot inline (restauración) | `AppState.snies.defaultSD` | Deep-copy del SD original de app-state.js |

### Gestión de programas

Cada programa tiene una propiedad `_source` que indica su origen:

| Valor | Significado |
|-------|-------------|
| `'default'` | Programa del dataset inline original (app-state.js) o restaurado |
| `'imported'` | Programa importado desde Excel (nuevo o actualización de uno existente) |

| Operación | Comportamiento |
|-----------|---------------|
| `importSniesExcel(file)` | Importa y fusiona (MERGE) datos desde Excel |
| `removeSniesProgram(name)` | Si existe en inline: restaura versión original. Si es nuevo importado: elimina |
| `clearSnies()` | Limpia localStorage y recarga la página (restaura dataset inline completo) |

### Visibilidad de controles

El panel SNIES utiliza la bandera `window.__UDEC_EMBEDDED__` para ocultar controles administrativos en el HTML exportado:

| Control | Dashboard editable | HTML exportado |
|---------|-------------------|----------------|
| Importar Excel SNIES | Visible | Oculto |
| Restablecer datos | Visible | Oculto |
| Eliminar / Restaurar programa | Visible (según `_source`) | Oculto |
| Badge "Datos importados" | Visible | Oculto |
| Filtros, KPIs, gráficos, tabla | Visible | Visible |

## Estrategia modular actual

| Módulo / Archivo | Dependencias | Expone globalmente |
|------------------|-------------|-------------------|
| `models/app-state.js` | Ninguna | AppState, window accessors (curFac, filt*, SD) |
| `models/snies-model.js` | Ninguna | validateCatalogo, validateIndicadores, buildPrograms, computeDerived |
| `models/learning-routes.js` | window.__LEARNING_ROUTES | loadLearningRoutes, saveLearningRoutes, restoreDefaultRoutes |
| `data/default-data.js` | Ninguna | window.__DEFAULT_DATA |
| `data/app-data.js` | window.DB | AppData (getFacultades, getFacultad, etc.) |
| `data/learning-routes.js` | Ninguna | window.__LEARNING_ROUTES |
| `modules/utils.js` | Ninguna | showConfirm, getSt, pll, uid, gv, gi, toast |
| `modules/storage.js` | utils, window.DB | saveDB, loadDB, downloadHTML, resetDB |
| `modules/filters.js` | utils, AppData, AppState | sedeMatch, ofertaMatch, estadoMatch, nivelMatch, pregradoMatch, itemMatch, applyFilters, resetFilters, populateSedes |
| `modules/dashboard.js` | utils, filters, AppData, AppState | renderKPIs, renderFacBar, selFac |
| `modules/indicators.js` | AppData | renderIndicadores |
| `modules/export.js` | window.DB, window.SD | downloadDB, exportSNIES |
| `modules/embed.js` | window.DB, window.__LEARNING_ROUTES, AppState | window.__EMBED (buildStandalone) |
| `modules/snies-loader.js` | snies-model, XLSX, AppState, renderSNIES, toast | loadSnies, importSniesExcel, clearSnies, removeSniesProgram |
| `views/snies.js` | AppState (SD), Chart.js | renderSNIES, controles de importación |
| `views/tree.js` | AppData, AppState | renderTree |
| `views/tabla.js` | AppData, filters | renderTabla |
| `views/sede-view.js` | AppData, filters | renderSedeView |
| `views/pipeline.js` | AppData | renderPipeline |
| `views/learning-route.js` | window.__LEARNING_ROUTES | renderLearningRouteHTML |
| `views/prog-form.js` | AppData, AppState | renderProgForm |
| `views/editor.js` | AppData, AppState, learning-routes | renderEditor, openNewProg, openEditProg, openEditFac, saveProg, deleteProg, etc. |
| `controllers/navigation.js` | renderers (views), AppState | showTab, renderViews, toggleSec, snSetFac, snSetProg, openLearningRouteModal, _lrSetTab |
| `controllers/actions.js` | Todos los controladores y renderers | __ACTIONS, __refreshAll |
| `app.js` | Todos los anteriores | window.App (exportación unificada de todas las funciones) |

## Riesgos arquitectónicos conocidos

1. **Alto acoplamiento**: `showTab` conoce los 7 paneles y los renderers asociados. `renderViews` orquesta 4 renderers.
2. **onclick inline**: Las funciones expuestas vía `window.*` son necesarias mientras existan atributos `onclick=""` en HTML renderizado. La migración a `data-action` (controllers/actions.js) está en curso.
3. **Estado global**: `DB`, `curFac`, `filt*` son mutables desde cualquier módulo. Sin encapsulamiento. `AppState` mitiga parcialmente.
4. **Dependencia de CDN**: Chart.js y SheetJS son necesarios en runtime. Si el CDN falla, los gráficos SNIES y la importación Excel no funcionan.
5. **Código muerto**: Algunas funciones en `app.js` (secciones de exportación cerca de líneas 88–90) fueron reemplazadas por `modules/export.js` pero el código antiguo permanece como comentario.
