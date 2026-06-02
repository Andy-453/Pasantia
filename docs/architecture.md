# Análisis Arquitectónico — Dashboard UDEC Posgrados

> **Hito**: 2026-06-02 — Export HTML standalone funcional (CSS+JS+imágenes inline). Print CSS mejorado con @media print comprehensive.
> Pendiente: migrar 6 referencias `DB` bare en renderers a `AppData`.

## 1. Resumen del sistema

Aplicación web monolítica embebida (single-file HTML + JS modularizado) para la gestión y visualización de la oferta de posgrados de la Universidad de Cundinamarca. Opera completamente en el cliente (navegador) con persistencia en localStorage y exportación a CSV/HTML.

### Stack técnico
- Sin framework — JavaScript plano (ES5/ES6 híbrido)
- Chart.js 4.4.1 (CDN) para gráficos SNIES
- SVG inline para gráficos de indicadores
- localStorage para persistencia
- Single-file HTML con datos embebidos (DEFAULT_DATA en HTML serializado)

### Archivos del proyecto

| Archivo | Líneas | Rol |
|---|---|---|---|
| `Dashboard_UDEC_Posgrados_2026-04-23.html` | ~1176 | Shell HTML + datos embebidos serializados |
| `assets/js/app.js` | 898 | Orquestador principal (init, tree, tabla, sedeView, editor, pipeline, SNIES) |
| `assets/js/modules/utils.js` | 52 | Utilidades base (getSt, toast, uid, gv, gi, pll, showConfirm) |
| `assets/js/modules/embed.js` | 108 | Runtime embedding para export HTML standalone |
| `assets/js/modules/storage.js` | 94 | Persistencia (saveDB, loadDB, downloadHTML, resetDB) |
| `assets/js/modules/filters.js` | 80 | Filtros (sedeMatch, ofertaMatch, estadoMatch, itemMatch, applyFilters) |
| `assets/js/modules/dashboard.js` | 57 | KPIs y barra de facultades (renderKPIs, renderFacBar, selFac) |
| `assets/js/modules/indicators.js` | 435 | Panel de indicadores (renderIndicadores, helpers SVG) |
| `assets/js/modules/export.js` | 276 | Exportaciones (downloadDB, exportSNIES, mapas SNIES) |
| `assets/js/data/app-data.js` | 90 | Capa de acceso a datos (Fase 4) |

**Total: ~1885 líneas JS, 8 módulos + 1 orquestador + 1 data layer**

### Orden de carga
```
Chart.js (CDN) → utils.js → embed.js → storage.js → app-data.js
→ filters.js → dashboard.js → indicators.js → export.js → app.js
```
Chart.js (CDN) → utils.js → storage.js → filters.js → dashboard.js
→ indicators.js → export.js → app.js
```

---

## 2. Mapa de estado global actual

### 2.1. Variables globales (`var` en ventana global)

| Variable | Tipo | Define en | Modificado por | Consumido por | Acoplamiento | Riesgo |
|---|---|---|---|---|---|---|
| `DB` | `Array` | app.js:30 | storage.js (loadDB), app.js (editor CRUD), dashboard.js (selFac) | TODOS los módulos | **CRÍTICO** — 15+ consumidores | ALTO |
| `DEFAULT_DATA` | `Array` | app.js:27 (inline en HTML) | downloadHTML (reescritura en descarga) | storage.js (loadDB) | BAJO | BAJO |
| `ALL_SEDES` | `Array` | app.js:29 | Nunca | filters.js (populateSedes) | BAJO | BAJO |
| `curFac` | `Number` | app.js:31 | dashboard.js (selFac), app.js (deleteFac, saveFac, saveNewFac) | filters.js, dashboard.js, app.js (tree, tabla, editor, pipeline) | **ALTO** — 10+ referencias | ALTO |
| `filtSede` | `String` | app.js:31 | filters.js (applyFilters, resetFilters, populateSedes) | filters.js (sedeMatch), app.js (tree vía itemMatch) | MEDIO | MEDIO |
| `filtOferta` | `String` | app.js:31 | filters.js (applyFilters, resetFilters) | filters.js (ofertaMatch) | BAJO | BAJO |
| `filtEstado` | `String` | app.js:31 | filters.js (applyFilters, resetFilters) | filters.js (estadoMatch) | BAJO | BAJO |
| `filtNivel` | `String` | app.js:31 | filters.js (applyFilters, resetFilters) | filters.js (nivelMatch) | BAJO | BAJO |
| `filtPregrado` | `String` | app.js:31 | filters.js (applyFilters, resetFilters, populateSedes) | filters.js (pregradoMatch) | MEDIO | MEDIO |
| `editingProgId` | `String|null` | app.js:34 (getter/setter) | **MIGRADO** → `AppState.editor.editingProgId` | app.js (renderProgForm) | ✅ legacy alias | ✅ |
| `tmpLineas` | `Array` | app.js:35 (getter/setter) | **MIGRADO** → `AppState.editor.tmpLineas` | app.js (renderProgForm, saveProg) | ✅ legacy alias | ✅ |
| `tmpMaes` | `Array` | app.js:36 (getter/setter) | **MIGRADO** → `AppState.editor.tmpMaes` | app.js (renderProgForm, saveProg) | ✅ legacy alias | ✅ |
| `SD` | `Object` | app.js:579 (getter/setter) | **MIGRADO** → `AppState.snies.SD` | app.js (renderSNIES), export.js (exportSNIES) | ✅ legacy alias | ✅ |
| `_snFac` | `String` | app.js:581 (getter/setter) | **MIGRADO** → `AppState.snies.fac` | app.js (renderSNIES) | ✅ legacy alias | ✅ |
| `_snProg` | `String` | app.js:582 (getter/setter) | **MIGRADO** → `AppState.snies.prog` | app.js (renderSNIES) | ✅ legacy alias | ✅ |
| `ST_MAP` | `Object` | modules/utils.js:18 | Nunca (solo lectura) | utils.js (getSt) | BAJO | BAJO |
| `__UDEC_EMBEDDED__` | `Boolean` | app.js:24 | Nunca | storage.js (loadDB) | BAJO | BAJO |

### 2.2. Estado global mutable — Mapa de dependencias

```
                    ┌─────────────┐
                    │     DB      │ ← JSON de datos completo (facultades, programas)
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────────┐
          ▼                ▼                    ▼
    filters.js       dashboard.js          app.js
    (populateSedes)  (renderKPIs,    (tree, tabla, sedeView,
                       renderFacBar)    editor, pipeline)
          │                │                    │
          └────────────────┼────────────────────┘
                           ▼
                    ┌─────────────┐
                    │   curFac    │ ← índice de facultad activa
                    └─────────────┘
                           │
          ┌────────────────┼────────────────────┐
          ▼                ▼                    ▼
    filters.js       dashboard.js          app.js
    (sedeMatch)      (selFac,        (tree, tabla, editor,
                     renderFacBar)     pipeline, progForm)

                    ┌─────────────┐
                    │  filtros*   │ ← 5 flags: sede, oferta, estado, nivel, pregrado
                    └─────────────┘
                           │
          ┌────────────────┘
          ▼
    filters.js → itemMatch → usado por app.js (tree, tabla, sedeView)

                    ┌─────────────┐
                    │  SD         │ ← Datos SNIES (lectura solamente)
                    └─────────────┘
                           │
          ┌────────────────┼──────────────┐
          ▼                ▼              ▼
    app.js            export.js      renderSNIES
    (renderSNIES)     (exportSNIES)
```

---

## 3. Clasificación MVC tentativa

### 3.1. Posibles Models (gestión de datos)

| Candidato | Estado actual | Propuesta MVC |
|---|---|---|
| `DB` (estructura datos) | `var` global en app.js, modificado directamente por funciones de editor | **AppState.DB** — con métodos get/set validados |
| `DEFAULT_DATA` | inline en HTML, reescrito por downloadHTML | **AppState.defaultData** — constante |
| `ALL_SEDES` | `var` en app.js | **AppState.ALL_SEDES** — constante |
| `ST_MAP` | `var` en utils.js | **Model.ST_MAP** — estable, migrar primero |
| `SD` | `var` en app.js (línea 599) | **Model.SNIES_DATA** — independiente |
| `curFac` | `var` en app.js, mutado en 4 lugares | **AppState.activeFaculty** |
| `filtros` (5 vars) | `var` en app.js, mutados en filters.js | **AppState.filters** |
| `editingProgId`, `tmpLineas`, `tmpMaes` | `var` en app.js | **AppState.editor** |
| `_snFac`, `_snProg` | `var` en app.js | **AppState.snies** |
| `SNIES_PRE_MAP`, `SNIES_ESP_MAP` | `const` en export.js | **Model.SNIES_MAPS** — datos puros |

### 3.2. Posibles Views (renderizado)

| Candidato | Estado actual | Propuesta MVC | Líneas |
|---|---|---|---|
| `renderTree()` | app.js:43 | **View.Tree** | ~260 |
| `renderTabla()` | app.js:304 | **View.TableView** | ~33 |
| `renderSedeView()` | app.js:338 | **View.SedeView** | ~26 |
| `renderEditor()` (activo) | app.js:800 | **View.Editor** | ~46 |
| `renderEditor()` (sombreado) | app.js:369 | **ELIMINAR** | ~60 |
| `renderProgForm()` | app.js:446 | **View.ProgForm** | ~56 |
| `renderPipeline()` | app.js:667 | **View.Pipeline** | ~129 |
| `renderSNIES()` | app.js:602 | **View.SNIES** | ~62 |
| `renderIndicadores()` | indicators.js:28 | **View.Indicators** | ~405 |
| `renderKPIs()` | dashboard.js:42 | **View.KPIs** | ~16 |
| `renderFacBar()` | dashboard.js:25 | **View.FacBar** | ~5 |
| `renderViews()` | app.js:580 | **View.orquestador** (Controller híbrido) | 1 línea |

### 3.3. Posibles Controllers (lógica de negocio)

| Candidato | Estado actual | Propuesta MVC |
|---|---|---|
| `loadDB()` | storage.js | **Controller.Storage.init** |
| `saveDB()` | storage.js | **Controller.Storage.persist** |
| `downloadHTML()` | storage.js | **Controller.Export.downloadHTML** |
| `resetDB()` | storage.js | **Controller.Storage.reset** |
| `selFac(i)` | dashboard.js | **Controller.Faculty.select** |
| `applyFilters()` | filters.js | **Controller.Filters.apply** |
| `resetFilters()` | filters.js | **Controller.Filters.reset** |
| `populateSedes()` | filters.js | **Controller.Filters.populateSedes** |
| `showTab(id)` | app.js:565 | **Controller.Navigation.switchTab** |
| `saveProg()` | app.js | **Controller.Program.save** |
| `deleteProg()` | app.js | **Controller.Program.delete** |
| `saveDoc()` | app.js | **Controller.Program.saveDoctorado** |
| `saveFac()` | app.js | **Controller.Faculty.save** |
| `deleteFac()` | app.js | **Controller.Faculty.delete** |
| `openNewFac()` | app.js | **Controller.Faculty.openNewForm** |
| `openNewProg()` | app.js | **Controller.Program.openNewForm** |
| `openEditProg()` | app.js | **Controller.Program.openEditForm** |
| `cancelEdit()` | app.js | **Controller.Editor.cancel** |
| `addLinea()` / `delLinea()` | app.js | **Controller.Editor.addLinea** / **removeLinea** |
| `addMae()` / `delMae()` | app.js | **Controller.Editor.addMae** / **removeMae** |
| `collectLineas()` / `collectMaes()` | app.js | **Controller.Editor.collectLineas** / **collectMaes** |
| `downloadDB()` | export.js | **Controller.Export.downloadCSV** |
| `exportSNIES()` | export.js | **Controller.Export.downloadSNIES** |
| `snSetFac()` / `snSetProg()` | app.js | **Controller.SNIES.select** |
| `toggleSec()` | app.js | **Controller.UI.toggleSection** |
| `toggleDocForm()` | app.js | **Controller.UI.toggleDocForm** |

---

## 4. Zonas críticas

### 4.1. `renderTree()` (app.js:43-301) — **CRÍTICO**

| Aspecto | Detalle |
|---|---|
| Líneas | ~260 |
| Dependencias globales | `DB`, `curFac`, `filtPregrado`, `pregradoMatch`, `itemMatch`, `getSt`, `pll` |
| Complejidad | ALTA — SVG inline, 2 modos (single/multi pregrado), lógica de conectores |
| Acoplamiento | **MUY ALTO** — conoce estructura de DB, filtros, sistema de badges |
| Riesgo migración | **MUY ALTO** — cambiar la fuente de datos requiere reescribir toda la función |
| Inline handlers | `data-action="open-edit-prog"` (migrado a event delegation) |
| Notas | Contiene 3 closures internos (`vline`, `stBadge`) que duplican lógica de utils.js |

### 4.2. Editor (app.js:800-878 + 446-522) — **CRÍTICO**

| Aspecto | Detalle |
|---|---|
| Líneas | ~155 (2 implementaciones + progForm) |
| Dependencias globales | `DB`, `curFac`, `editingProgId`, `tmpLineas`, `tmpMaes`, `saveDB`, `toast`, `populateSedes`, `renderFacBar`, `renderViews` |
| Complejidad | ALTA — CRUD completo con modal overlay |
| Acoplamiento | **MUY ALTO** — conoce estructura DB, DOM IDs de formularios |
| Riesgo migración | **ALTO** — funciones sombreadas (duplicadas), lógica de recolecta frágil |
| Sombreado | `renderEditor` en línea 369 (NUNCA ejecutada), `saveDoc` en línea 431 (idem), `deleteFac` en 530, `saveFac` en 525 — **BASURA TÉCNICA** |

### 4.3. `renderPipeline()` (app.js:667-794) — **ALTO**

| Aspecto | Detalle |
|---|---|
| Líneas | ~129 |
| Dependencias globales | `DB`, `toggleSec` |
| Complejidad | ALTA — 5 grupos dinámicos, timeline por trimestre, SVG inline, tablas dinámicas |
| Acoplamiento | ALTO — conoce estructura DB, fórmula de agrupación por estado |
| Inline handlers | `data-action="toggle-section"` (migrado a event delegation) |
| Notas | Contiene 7 closures internos (`grp`, `kpi`, `nivBadge`, `tabla`, `buildTimeline`, `sec`, `getTri`, `estCol`) |

### 4.4. `renderSNIES()` (app.js:602-663) — **MEDIO-ALTO**

| Aspecto | Detalle |
|---|---|
| Líneas | ~62 |
| Dependencias globales | `SD`, `_snFac`, `_snProg`, Chart.js (global) |
| Complejidad | MEDIA — generación de HTML + gráficos Chart.js con setTimeout |
| Acoplamiento | ALTO — conoce estructura exacta de SD, FAC_MP, nombres de programas |
| Notas | Datos SD son independientes de DB (no hay acoplamiento con editor) |
| Inline handlers | `data-action="snies-set-fac"`, `data-action="snies-set-prog"` (migrado a event delegation) |

### 4.5. `renderViews()` (app.js:580) — **PUNTO ÚNICO DE ORQUESTACIÓN**

```js
function renderViews(){renderKPIs();renderTree();renderTabla();renderSedeView();}
```

Dependencia: llama a 4 funciones de render. Cualquier cambio en la firma de estas funciones rompe el dashboard.

### 4.6. `showTab()` (app.js:565-574) — **NAVEGACIÓN CENTRAL**

```js
function showTab(id){
  // toggle 7 paneles
  if(id==='editor') renderEditor();
  if(id==='indicadores') renderIndicadores();
  if(id==='snies') renderSNIES();
  if(id==='pipeline') renderPipeline();
}
```

Dependencia: llama directamente a 4 renderers. Acoplamiento por nombre de función.

---

## 5. Dependencias circulares implícitas

Actualmente NO hay dependencias circulares porque:
1. Los módulos extraídos solo dependen de `window.*` globales
2. No hay import/export entre módulos
3. El orden de carga secuencial garantiza disponibilidad

Sin embargo, existen **dependencias cruzadas frágiles**:

```
dashboard.js:renderKPIs() → app.js:renderViews (llamada indirecta vía filters.applyFilters)
dashboard.js:selFac()     → app.js:showTab (para refrescar pestaña activa)
filters.js:applyFilters() → app.js:renderViews (global, definida en app.js)
app.js:renderViews()      → dashboard.js:renderKPIs()
```

Esto crea un **ciclo de llamadas** que funciona solo porque todo está en el mismo ámbito global:
```
applyFilters → renderViews → renderKPIs → (consume DB, curFac)
                                 ↓
                           renderTree, renderTabla, renderSedeView
```

**Riesgo**: al extraer un módulo a ESModule, se rompería este ciclo porque `renderViews` está en app.js y `renderKPIs` en dashboard.js. Solución: inyectar el callback `onRender` en lugar de llamar directamente.

---

## 6. Propuesta de AppState gradual

### 6.1. Estructura inicial propuesta

```js
// Fase 1: AppState mínimo (solo agrupar vars existentes)
window.AppState = {
  DB: [],
  DEFAULT_DATA: [],
  ALL_SEDES: [],
  activeFaculty: 0,
  filters: {
    sede: 'ALL',
    oferta: 'ALL',
    estado: 'ALL',
    nivel: 'ALL',
    pregrado: 'ALL'
  },
  editor: {
    editingProgId: null,
    tmpLineas: [],
    tmpMaes: []
  },
  snies: {
    data: null,        // SD
    activeFac: 'TODAS',
    activeProg: null
  },
  embedded: true
};
```

### 6.2. Migración incremental segura

| Paso | Qué migrar | Cómo | Riesgo |
|---|---|---|---|
| **1** | `ST_MAP` → `AppState.stateColors` | Reemplazar var global por AppState en utils.js | NINGUNO (solo lectura) |
| **2** | `filtros` (5 vars) → `AppState.filters` | En filters.js, cambiar window.filt* por AppState.filters.* | BAJO (solo filters.js consume) |
| **3** | `curFac` → `AppState.activeFaculty` | En dashboard.js + app.js, reemplazar acceso directo | MEDIO (10+ referencias) |
| **4** | `SD` → `AppState.snies.data` | En app.js, mover SD a AppState | BAJO (solo lectura) |
| **5** | `editingProgId`, `tmpLineas`, `tmpMaes` → `AppState.editor` | En app.js, agrupar en objeto editor | BAJO (solo editor) |
| **6** | `DB` → `AppState.DB` | **ÚLTIMO** — requiere refactor completo (15+ consumidores) | ALTO |

### 6.3. Qué NO migrar todavía

- `DB` — demasiados consumidores, requiere refactor mayor
- `DEFAULT_DATA` — estable, solo usado por storage.js
- `ALL_SEDES` — estable, solo usado por filters.js

---

## 7. Roadmap MVC incremental

### Fase 0: Preparación (ahora)
- [x] Modularización funcional (6 módulos extraídos)
- [x] Documentación arquitectónica (este archivo)
- [ ] Eliminar funciones sombreadas (renderEditor legacy, saveDoc legacy, etc.)
- [ ] Estandarizar window.* exports

### Fase 1: Centralización de estado
- [ ] Crear `window.AppState` con estructura definida
- [ ] Migrar filtros a `AppState.filters`
- [ ] Migrar `curFac` a `AppState.activeFaculty`
- [ ] Migrar estado del editor a `AppState.editor`
- [ ] Mantener compatibilidad: `window.curFac = AppState.activeFaculty`

### Fase 2: Separación View
- [ ] Extraer `renderTree()` → `View.Tree` module
- [ ] Extraer `renderPipeline()` → `View.Pipeline` module
- [ ] Extraer `renderSNIES()` → `View.SNIES` module
- [ ] Extraer editor Views (renderEditor, renderProgForm) → `View.Editor`
- [ ] Cada View recibe `(state)` en lugar de leer `window.*`

### Fase 3: Separación Controller
- [ ] Extraer lógica CRUD de editor → `Controller.Editor`
- [ ] Extraer lógica de filtros → `Controller.Filters`
- [ ] Extraer lógica de navegación → `Controller.Navigation`
- [x] Eliminar handlers inline (`onclick` + `onchange`) reemplazando por event delegation (show-tab, sel-fac, reset-filters, apply-filters)
- [x] Migrar estado del editor (`editingProgId`, `tmpLineas`, `tmpMaes`) a `AppState.editor` vía getter/setter
- [x] Migrar estado SNIES (`SD`, `_snFac`, `_snProg`) a `AppState.snies` vía getter/setter
- [x] Migrar handlers SNIES + Pipeline + Header a event delegation

### Fase 4: Desacoplamiento render
- [ ] Reemplazar ciclo `applyFilters → renderViews → renderKPIs` por event emitter
- [ ] Views se suscriben a cambios de estado en lugar de ser llamadas directamente
- [ ] Introducir `AppState.subscribe(callback)` o patrón Observer mínimo

### Fase 5: MVC híbrido
- [ ] Migrar módulos a ESModules (`type="module"`)
- [ ] Reemplazar `window.*` exports por `import`/`export`
- [ ] Eliminar compatibilidad legacy progresivamente
- [ ] Inyectar dependencias en lugar de acceder a globales

### Fase 6: MVC completo
- [ ] AppState como objeto inmutable (patrón Redux mínimo o similar)
- [ ] Views puras: `render(state) → string`
- [ ] Controllers sin acceso directo al DOM
- [ ] Testing unitario posible (sin DOM)

---

## 8. Riesgos de migración

### 8.1. Inline onclick handlers — RESUELTO

**Problema**: +50 handlers `onclick` en HTML renderizado dinámicamente y en HTML embebido. Ejemplos:
```html
<button onclick="openEditProg('${p.id}')">
<button onclick="selFac(0)">
<button onclick="saveDoc()">
<div data-sec-id="timeline" onclick="toggleSec(this.dataset.secId)">
```

**Solución aplicada**: Todos los handlers `onclick` fueron reemplazados por `data-action` + dispatcher centralizado:
```js
document.addEventListener('click', e => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (action in dispatch) dispatch[action](e.target);
});
```

**Estado actual**: **0 onclick en app.js**, **1 onclick en HTML** (`downloadDB()` excluido por riesgo de doble descarga).

### 8.2. Funciones sombreadas — ELIMINADAS (Fase 3)

| Función sombreada | Estado |
|---|---|
| `renderEditor()` | ✅ Eliminada |
| `saveDoc()` | ✅ Eliminada |
| `deleteFac()` | ✅ Eliminada |
| `saveFac()` | ✅ Eliminada |
| `openNewFac()` | ✅ Eliminada |
| `openNewProg()` | ✅ Eliminada |
| `openEditProg()` | ✅ Eliminada |
| `saveNewFac()` | ✅ Eliminada (dead code) |

Todas las versiones redundantes fueron eliminadas en `app.js`. Ya no hay riesgo de ambigüedad.

### 8.3. Ciclo applyFilters → renderViews → renderKPIs

**Riesgo**: Si se extrae `renderKPIs` a un módulo ESModule, no podrá llamar a `renderViews` (definida en app.js) porque se crearía una dependencia circular.

**Solución actual**: Pasar callbacks como parámetros:
```js
// en filters.js
function applyFilters(onDone){
  // ... leer filtros ...
  onDone();
}
// app.js: applyFilters(() => renderViews());
```

### 8.4. Inicialización síncrona

```js
loadDB();
renderFacBar();
populateSedes();
renderViews();
```

Todo se ejecuta al cargar app.js. Si se migra a ESModules, `type="module"` tiene semántica de defer, lo que cambia el timing. Las Views embebidas en HTML (datos serializados) dependen de que app.js se ejecute después de los módulos.

### 8.5. Dependencia de Chart.js global

`renderSNIES()` usa `new Chart(...)` asumiendo que Chart.js está en window. Si se migra a ESModules, Chart.js debe importarse o cargarse como script independiente antes.

---

## 9. Recomendaciones inmediatas

### Prioridad 1 (antes de cualquier refactor MVC)
1. ✅ ~~**Eliminar funciones sombreadas**~~ — **COMPLETADO (Fase 3)**
2. **Estandarizar window.* exports** — algunos módulos exportan, otros no consistentemente

### Prioridad 2 (bajo riesgo, alto beneficio)
3. ✅ ~~Migrar filtros a AppState.filters~~ — **COMPLETADO (Fase 3)**
4. ✅ ~~Migrar curFac a AppState.navigation.curFac~~ — **COMPLETADO (Fase 3)**
5. ✅ ~~**Estandarizar window.* exports**~~ — **COMPLETADO (Fase 3)**

### Prioridad 3 (preparar terreno)
6. **Migrar editor (editingProgId, tmpLineas, tmpMaes) a AppState.editor**
7. **Migrar SNIES (_snFac, _snProg) a AppState.snies**
8. **Implementar event delegation** para reemplazar onclick inline
9. **Eliminar dependencia directa renderKPIs→renderViews** inyectando callback

### Prioridad 4 (no tocar todavía)
9. **renderTree** — esperar a que AppState esté estable
10. **renderPipeline** — esperar a que event delegation funcione
11. **Editor** — esperar a eliminar código sombreado primero

---

## 10. Diagrama de flujo general

```
[Inicio: HTML embebido]
       │
       ▼
  loadDB() ← localStorage / DEFAULT_DATA
       │
       ▼
  renderFacBar() ← DB, curFac
  populateSedes() ← DB[curFac], ALL_SEDES
  renderViews() ← DB[curFac], filtros
       │
       ├── renderKPIs() ← DB[curFac], filtros
       ├── renderTree() ← DB[curFac], filtros
       ├── renderTabla() ← DB[curFac], filtros
       └── renderSedeView() ← DB[curFac], filtros
       │
       ▼
  [Interacción del usuario]
       │
       ├── click facultad → selFac(i) → populateSedes + renderFacBar + renderViews + showTab
       ├── click filtros → applyFilters → renderViews
       ├── click pestaña → showTab(id) → renderEditor|renderIndicadores|renderSNIES|renderPipeline
       ├── click editor → openNewProg|openEditProg|saveProg|deleteProg → saveDB + renderViews + renderEditor
       └── click exportar → downloadDB|exportSNIES|downloadHTML
```

---

## 11. Convenciones de código

### Estilo actual
- `var` para todo (ES5 legacy)
- HTML templates concatenados con `+=`
- `onclick` attributes en HTML generado
- Funciones globales (sin namespace)
- `window.*` exports para compatibilidad módulo → HTML

### Estilo objetivo (Fase 5-6)
- `const`/`let` (ES6+)
- Template literals con `${}`
- Event delegation
- ESModules con `import`/`export`
- Views como funciones puras: `render(state) → HTMLString`

---

## 12. Estado centralizado — progreso de migración

### 12.1. Estructura actual de AppState

```js
window.AppState = {
  navigation: {
    curFac: 0,          // índice facultad activa
    activeTab: 'pipeline'  // pestaña activa
  },
  filters: {
    sede: 'ALL',
    oferta: 'ALL',
    estado: 'ALL',
    nivel: 'ALL',
    pregrado: 'ALL'
  },
  ui: {},  // reservado para estado visual futuro
  editor: {
    editingProgId: null,  // null | '__new__' | program-id
    tmpLineas: [],        // working copy of lineas (with _progId)
    tmpMaes: []           // working copy of maes (with _progId)
  },
  snies: {
    SD: null,     // SNIES dataset (cargado al final de app.js)
    fac: 'TODAS', // facultad activa en panel SNIES
    prog: null    // programa activo en panel SNIES
  }
};
```

Definido en `app.js:40-63` (inicio del bootstrap principal).

### 12.2. Variables migradas

| Variable legacy | Ruta AppState | Migrada | Consumidores actualizados |
|---|---|---|---|
| `curFac` | `AppState.navigation.curFac` | ✅ | `selFac()` (escribe), `renderKPIs()` (lee) |
| `filtSede` | `AppState.filters.sede` | ✅ | `applyFilters()` (escribe), `resetFilters()` (escribe) |
| `filtOferta` | `AppState.filters.oferta` | ✅ | `applyFilters()` (escribe), `resetFilters()` (escribe) |
| `filtEstado` | `AppState.filters.estado` | ✅ | `applyFilters()` (escribe), `resetFilters()` (escribe) |
| `filtNivel` | `AppState.filters.nivel` | ✅ | `applyFilters()` (escribe), `resetFilters()` (escribe) |
| `filtPregrado` | `AppState.filters.pregrado` | ✅ | `applyFilters()` (escribe), `resetFilters()` (escribe), `populateSedes()` (escribe) |
| — | `AppState.navigation.activeTab` | ✅ | `showTab()` (escribe) |
| `editingProgId` | `AppState.editor.editingProgId` | ✅ | vía getter/setter — 0 cambios en consumidores |
| `tmpLineas` | `AppState.editor.tmpLineas` | ✅ | vía getter/setter — 0 cambios en consumidores |
| `tmpMaes` | `AppState.editor.tmpMaes` | ✅ | vía getter/setter — 0 cambios en consumidores |
| `SD` | `AppState.snies.SD` | ✅ | vía getter/setter — 0 cambios en consumidores |
| `_snFac` | `AppState.snies.fac` | ✅ | vía getter/setter — 0 cambios en consumidores |
| `_snProg` | `AppState.snies.prog` | ✅ | vía getter/setter — 0 cambios en consumidores |

### 12.3. Variables pendientes (próximas iteraciones)

| Variable | Ruta propuesta | Dependencias | Riesgo | Prioridad |
|---|---|---|---|---|
| `DB` | `AppState.DB` | 15+ consumidores, editor CRUD | **ALTO** | Último |
| `DEFAULT_DATA` | `AppState.defaultData` | storage.js | BAJO | Baja |
| `ALL_SEDES` | `AppState.ALL_SEDES` | filters.js | BAJO | Baja |
| (migrado) | vía getter/setter | — | ✅ | — |
| (migrado) | vía getter/setter | — | ✅ | — |
| `ST_MAP` | `AppState.stateColors` | utils.js (getSt) | BAJO | Baja |

### 12.4. Compatibilidad legacy (aliases)

Las variables `var` originales se mantienen intactas para no romper:
- `renderTree()` — lee `curFac`, `filtSede`, `filtPregrado`
- `renderTabla()` — lee `curFac`
- `renderSedeView()` — lee `curFac`
- `renderPipeline()` — lee `curFac`
- `renderEditor()` — lee `curFac`
- `renderProgForm()` — lee `curFac`
- `renderSNIES()` — lee `_snFac`, `_snProg`
- `populateSedes()` — lee `curFac`, `filtSede`, `filtPregrado`
- `deleteFac()` — modifica `curFac`
- `saveNewFac()` — modifica `curFac`

**Estrategia**: `selFac()` y `applyFilters()` escriben a AMBAS (AppState + var legacy). Las funciones legacy siguen funcionando vía `var`. Cuando todas las funciones legacy se migren, se eliminarán los aliases.

### 12.5. Funciones actualizadas en esta iteración

| Función | Archivo | Cambio |
|---|---|---|
| `showTab()` | app.js | Escribe `AppState.navigation.activeTab` |
| `selFac()` | dashboard.js | Escribe `AppState.navigation.curFac` (además de `curFac` legacy) |
| `renderKPIs()` | dashboard.js | Lee `AppState.navigation.curFac` en lugar de `curFac` |
| `applyFilters()` | filters.js | Escribe `AppState.filters.*` (además de `window.filt*` legacy) |
| `resetFilters()` | filters.js | Escribe `AppState.filters.*` (además de `window.filt*` legacy) |
| `renderIndicadores()` | indicators.js | Referencia `window.AppState` para uso futuro |
| `populateSedes()` | filters.js | Escribe `AppState.filters.sede` y `AppState.filters.pregrado` (además de `window.filt*` legacy) |

Funciones sombreadas **eliminadas** de app.js (8 funciones): `renderEditor`, `saveDoc`, `openNewProg`, `openEditProg`, `saveFac`, `deleteFac`, `openNewFac`, `saveNewFac`.

### 12.6. Sync post-init

Después del bootstrap (`loadDB()` → `populateSedes()`), se sincroniza `curFac` con AppState:

```js
window.AppState.navigation.curFac = curFac;
```

La sincronización de `filtSede`/`filtPregrado` ya no es necesaria porque `populateSedes()` escribe ambas fuentes. Se eliminaron las líneas redundantes.

### 12.7. Riesgos detectados

1. **Desincronización temporal**: `deleteFac()` (activa) y `saveFac(true)` modifican `curFac` sin actualizar AppState. Si una función AppState-aware se ejecuta entre medias, leería valor incorrecto. Mitigación: `deleteFac` en la versión activa usa `curFac=Math.max(0,curFac-1);` — la próxima llamada a `selFac()` sincronizará AppState.
2. ✅ ~~**populateSedes modifica filtros**~~ — **RESUELTO**: `populateSedes()` ahora escribe también en `AppState.filters`.
3. **Acceso directo a var legacy**: Las funciones no migradas (tree, tabla, editor, pipeline) leen `curFac` y `filt*` directamente. Mientras los aliases legacy existan, funciona correctamente.

---

## 13. Estrategia de exports globales

### 13.1. Patrón actual (Fase 3)

Se eliminaron las exportaciones redundantes `window.fn = fn` de cada módulo y se centralizaron en un único namespace:

```js
// app.js — manifiesto único de exportaciones
window.App = {
  AppState: window.AppState,
  showTab, renderViews, selFac,
  renderKPIs, renderFacBar,
  applyFilters, resetFilters, populateSedes,
  sedeMatch, ofertaMatch, estadoMatch, nivelMatch, pregradoMatch, itemMatch,
  renderTree, renderTabla, renderSedeView,
  renderEditor, openNewProg, openEditProg, openEditFac, openNewFac,
  saveFac, deleteFac, saveDoc, cancelEdit,
  renderProgForm, addLinea, delLinea, addMae, delMae,
  saveProg, deleteProg, collectLineas, collectMaes, toggleDocForm,
  renderSNIES, snSetFac, snSetProg, exportSNIES,
  renderPipeline, toggleSec,
  renderIndicadores,
  loadDB, saveDB, downloadHTML, downloadDB, resetDB,
  showConfirm, getSt, pll, uid, gv, gi, toast,
};
```

### 13.2. Mecanismo dual (compatibilidad legacy)

Todas las funciones existen en window por dos vías:

| Mecanismo | Origen | Persistencia |
|---|---|---|
| `function fn(){}` (declaración) | Hoisting a window.* | Implícito, permanente |
| `window.App.fn` (namespace) | Asignación en app.js | Explícito, canónico |

Esto garantiza que los handlers `onclick="fn()"` en HTML sigan funcionando sin cambios.

### 13.3. Exportaciones eliminadas por módulo

| Archivo | Exportaciones eliminadas | Motivo |
|---|---|---|
| utils.js | window.showConfirm, getSt, pll, uid, gv, gi, toast | Redundantes (fn en window vía function) |
| storage.js | window.saveDB, loadDB, downloadHTML, resetDB, _validateDB | Redundantes + _validateDB era interna |
| filters.js | window.sedeMatch…itemMatch, applyFilters, resetFilters, populateSedes | Redundantes |
| dashboard.js | window.renderKPIs, renderFacBar, selFac | Redundantes |
| indicators.js | window.renderIndicadores | Redundante |
| export.js | window.downloadDB, exportSNIES | Redundantes |

### 13.4. Funciones que permanecen solo en `function` (sin export explícito en módulo)

Ninguna. Todas las funciones están en `window.App`. Las que antes no tenían export explícito (showTab, renderTree, renderEditor, etc.) ahora están referenciadas en el namespace.

### 13.5. Diferencia clave entre mecanismos

```js
window.fn = fn;        // EXPLÍCITO — requiere línea de código
function fn(){}        // IMPLÍCITO — ocurre automáticamente

// Ambos producen: typeof window.fn === 'function'
// Diferencia: el explícito es redundante si ya hay function declaration
```

### 13.6. Transición futura a ESModules

Cuando se migre a ESModules, el manifiesto `window.App` se reemplazará por:

```js
// app.js (como entry point ESModule)
import { showTab, renderViews } from './navigation.js';
import { renderKPIs, renderFacBar } from './dashboard.js';
// ...
window.App = { showTab, renderViews, renderKPIs, /* ... */ };
```

Los módulos individuales usarán `export function fn(){}` estándar.

### 13.7. Bloqueadores para MVC real

1. ✅ ~~**Event delegation**~~ — **PILOTO IMPLEMENTADO (Fase 3)**: ver sección 14.
2. ✅ ~~**Eliminar `var` legacy (~6 vars)**~~ — **MIGRADO (Fase 3)**: `curFac` → `AppState.navigation.curFac`, `filt*` → `AppState.filters.*`. Restan `DB`, `DEFAULT_DATA`, `ALL_SEDES` + accessors SNIES.
3. ✅ ~~**Data como módulo**~~ — **INICIADO (Fase 4)**: `AppData` creado en `assets/js/data/app-data.js` (encapsula consultas + writes simples sobre DB). Resta: `DEFAULT_DATA`, `SD`, `ALL_SEDES` como módulos separados.
4. **ESModules**: cambiar `<script>` tags a `<script type="module">`.
5. **Refactor renderers**: migrar `DB[curFac]` en renderTree/renderTabla/renderSedeView/renderProgForm/renderEditor a `AppData.getFacultad()`.

---

## 14. Event Delegation — migración progresiva

### 14.1. Dispatcher click

```js
var __ACTIONS = {
  'show-tab':      function(b){ showTab(b.dataset.tab); },
  'sel-fac':       function(b){ selFac(parseInt(b.dataset.fac,10)); },
  'reset-filters': function(){ resetFilters(); },
};
document.addEventListener('click', function(e){
  var b = e.target.closest('[data-action]');
  if(!b) return;
  var fn = __ACTIONS[b.getAttribute('data-action')];
  if(fn) fn(b);
});
```

### 14.2. Dispatcher change

```js
var __CHANGE = {
  'apply-filters': function(){ applyFilters(); },
};
document.addEventListener('change', function(e){
  var b = e.target.closest('[data-action]');
  if(!b) return;
  var fn = __CHANGE[b.getAttribute('data-action')];
  if(fn) fn(b);
});
```

### 14.3. Handlers migrados

| data-action | Tipo evento | data-* | Handler | Riesgo |
|---|---|---|---|---|---|
| `show-tab` | click | `data-tab="arbol\|tabla\|sede\|..."` | `showTab(id)` | Bajo |
| `sel-fac` | click | `data-fac="0\|1\|2\|..."` | `selFac(i)` | Bajo |
| `reset-filters` | click | — | `resetFilters()` | Bajo |
| `apply-filters` | change | — | `applyFilters()` | Bajo |
| `snies-set-fac` | click | `data-fac="facultad"` | `snSetFac(f)` | Bajo |
| `snies-set-prog` | click | `data-prog="programa"` | `snSetProg(p)` | Bajo |
| `toggle-section` | click | `data-sec-id="secN"` | `toggleSec(id)` | Bajo |
| `download-html` | click | — | `downloadHTML()` | Bajo |
| `print` | click | — | `window.print()` | Bajo |
| `reset-db` | click | — | `resetDB()` | Bajo |
| `open-edit-prog` | click | `data-pid="progId"` | `openEditProg(pid)` | Bajo |

### 14.4. Elementos con data-action

| Origen | Tipo | Evento |
|---|---|---|
| HTML estático | 7 tabs + 7 fac-buttons + reset + header + imprimir + guardar + restablecer | click |
| `renderFacBar()` (dashboard.js) | N fac-buttons dinámicos | click |
| `renderSNIES()` (app.js) | N fac-buttons + N prog-buttons dinámicos | click |
| `renderPipeline()` (app.js) | N section headers + timeline | click |
| `renderTree()` (app.js) | 2 edit buttons (single + multi pregrado) | click |
| `renderTree()` (app.js) | 2 error-recovery links | click |
| HTML estático | 5 selects (#filt-sede, #filt-pregrado, #filt-oferta, #filt-estado, #filt-nivel) | change |

### 14.5. Estrategia de migración

Se removió `onclick`/`onchange` de todos los elementos con `data-action`. Cada tipo de evento (click, change) tiene su propio mapa (`__ACTIONS`, `__CHANGE`) y su propio listener. Las funciones globales persisten en `window` para handlers no migrados.

`resetFilters()` y `populateSedes()` modifican valores de selects vía `.value = ...` (programático), que no dispara eventos change — no hay loops.

### 14.6. Handlers NO migrados (pendientes)

| Handler | Ubicación | Por qué no se migró |
|---|---|---|
| `deleteProg(pid)` | renderEditor | editor excluido |
| `saveProg(pid, isNew)` | renderProgForm | editor excluido |
| `addLinea()` / `delLinea()` | renderProgForm | editor excluido |
| `addMae()` / `delMae()` | renderProgForm | editor excluido |
| `toggleDocForm()` | renderEditor | Editor excluido |
| `saveDoc()` | renderEditor | Editor excluido |
| `deleteFac()` / `saveFac(isNew)` | renderEditor | Editor excluido |
| `openNewFac()` / `openEditFac()` | renderEditor | Editor excluido |
| `downloadDB()` | HTML estático | No migrado (riesgo doble descarga) |
| `showTab('snies')` | HTML estático (tb-snies) | Pendiente migrar a data-action |

### 14.7. Próximos pasos

1. **Migrar editor**: ~15 handlers en renderProgForm y renderEditor.
3. **Migrar tb-snies**: agregar `data-action="show-tab" data-tab="snies"` (único tab sin data-action).

### 14.8. Bloqueadores

| Bloqueador | Impacto |
|---|---|
| Templates en string literals `` `...${}...` `` | Dificulta reemplazo masivo |
| Handlers con args dinámicos en editor | data-* resuelve, ~15 templates por refactorizar |
| Mezcla onclick en HTML estático y dinámico | Dos orígenes, misma estrategia |
| Sin tests automatizados | No se puede verificar regresión |

---

## 15. Event Architecture — consolidado

### 15.1. Click delegation

| Acción | Elemento(s) | data-action | Handler | data-* |
|---|---|---|---|---|
| Navegación tabs | 7 tabs | `show-tab` | `showTab(id)` | `data-tab` |
| Header editor | 1 button | `show-tab` | `showTab('editor')` | `data-tab` |
| Selección facultad | fac-bar buttons | `sel-fac` | `selFac(i)` | `data-fac` |
| Limpiar filtros | 1 button | `reset-filters` | `resetFilters()` | — |
| SNIES facultad | N buttons (renderSNIES) | `snies-set-fac` | `snSetFac(f)` | `data-fac` |
| SNIES programa | N buttons (renderSNIES) | `snies-set-prog` | `snSetProg(p)` | `data-prog` |
| Pipeline sección | N section headers | `toggle-section` | `toggleSec(id)` | `data-sec-id` |
| Guardar dashboard | 1 button | `download-html` | `downloadHTML()` | — |
| Imprimir | 1 button | `print` | `window.print()` | — |
| Restablecer datos | 1 button | `reset-db` | `resetDB()` | — |
| Editar programa (árbol) | ✎ button (renderTree) | `open-edit-prog` | `openEditProg(pid)` | `data-pid` |

### 15.2. Change delegation

| Acción | Elemento(s) | data-action | Handler | Comportamiento |
|---|---|---|---|---|
| Filtro sede | `#filt-sede` | `apply-filters` | `applyFilters()` | Lee DOM completo |
| Filtro pregrado | `#filt-pregrado` | `apply-filters` | `applyFilters()` | Lee DOM completo |
| Filtro oferta | `#filt-oferta` | `apply-filters` | `applyFilters()` | Lee DOM completo |
| Filtro estado | `#filt-estado` | `apply-filters` | `applyFilters()` | Lee DOM completo |
| Filtro nivel | `#filt-nivel` | `apply-filters` | `applyFilters()` | Lee DOM completo |

### 15.3. Handlers inline restantes

| Evento | Handler | Ubicación | Prioridad migración |
|---|---|---|---|
| click | `downloadDB()` | HTML header | Baja (excluido por riesgo doble descarga) |

### 15.4. Preparación ESModules

Estado actual de dependencias para migración a `<script type="module">`:

| Requisito | Estado |
|---|---|
| Sin `var` globales en módulos | ⚠️ **6 migradas** (`curFac`,`filtSede`,`filtOferta`,`filtEstado`,`filtNivel`,`filtPregrado` → `AppState.*`). Restan: `var DB`, `DEFAULT_DATA`, `ALL_SEDES` + `SD`, `_snFac`, `_snProg` (via accessor) |
| Sin `onclick` inline en HTML | ✅ **0 onclick en JS, 1 en HTML (downloadDB excluido)** |
| Sin `onchange` inline en HTML | ✅ **0 onchange restantes** |
| Dispatcher centralizado como cuello de botella único | ✅ Click + change cubiertos |
| `window.App` como namespace de transición | ✅ ~50 funciones exportadas |
| Capa de acceso a datos | ✅ `AppData` (`assets/js/data/app-data.js`) encapsula queries + writes |
| `import`/`export` en lugar de contaminación global | ❌ Pendiente — requiere eliminar `var` globales primero |

---

## 16. Capa de acceso a datos — `AppData`

### 16.1. Ubicación

`assets/js/data/app-data.js` — cargado después de `storage.js`, antes de los módulos de UI.

### 16.2. API expuesta

```
AppData.getFacultades()                → Array completo de facultades
AppData.getFacultad(index)             → Facultad por índice
AppData.getProgramas(facIndex)         → Programas de una facultad
AppData.getFacultadCount()             → Número de facultades
AppData.findProgramById(pid)           → {facIndex, programa} | null
AppData.findFacultadIndexByProgId(pid) → índice | -1
AppData.savePrograma(facIndex, prog, isNew)   → muta + persiste
AppData.deletePrograma(facIndex, pid)         → muta + persiste
AppData.saveFacultad(facultad, isNew, idx)    → muta + persiste
AppData.updateFacultadName(facIndex, name)    → muta + persiste
AppData.deleteFacultad(facIndex)              → muta + persiste
AppData.saveDocumento(facIndex, doc)          → muta + persiste
```

### 16.3. Módulos migrados a AppData

| Módulo | Antes (DB directo) | Después (AppData) |
|---|---|---|
| `dashboard.js` | `DB.map()`, `DB[curFac]` | `AppData.getFacultades()`, `AppData.getFacultad()` |
| `filters.js` | `window.DB[window.curFac]` | `AppData.getFacultad()` |
| `indicators.js` | `DB.forEach()`, `DB.length` | `AppData.getFacultades()`, `AppData.getFacultadCount()` |
| `export.js` | `DB.forEach()` | `AppData.getFacultades()` |
| `app.js` (writes) | `DB[curFac].progs.push/filter/splice`, `DB[curFac].doc`, `DB[curFac].name` | `AppData.savePrograma/deletePrograma/saveFacultad/updateFacultadName/deleteFacultad/saveDocumento` |
| `app.js` (renderers) | `DB[curFac]` en tree/tabla/sedeView/progForm/editor | ❌ Pendiente (renderers complejos) |

### 16.4. DB references restantes

| Ubicación | Ref | Motivo |
|---|---|---|
| `app-data.js` | `window.DB` (14) | Capa misma — fuente de verdad legacy |
| `storage.js` | `window.DB` (4) | Persistencia — `loadDB`, `downloadHTML` |
| `app.js` | `DB` bare (6) | Renderers complejos (tree, tabla, sedeView, progForm, editor) |

**Total: 6 referencias bare en renderers + 4 en storage + 14 internas en AppData.**

### 16.5. Próximos pasos

1. Migrar renderers (tree, tabla, sedeView, progForm, editor) a `AppData.getFacultad()`
2. Extraer `DEFAULT_DATA`, `ALL_SEDES`, `SD` a módulos separados bajo `assets/js/data/`
3. Migrar `storage.js` a usar `AppData` en lugar de `window.DB`
4. Evaluar eliminación de `var DB` una vez migrados todos los consumidores

---

## 17. Export standalone HTML — `embed.js`

### 17.1. Problema

`downloadHTML()` serializaba `document.documentElement.outerHTML` con `DEFAULT_DATA` actualizado, pero los `<link>`, `<script src>`, `<img src>` seguían apuntando a rutas relativas (`assets/css/main.css`, `assets/js/app.js`). Al mover el archivo .html descargado a otra ubicación, todos los recursos quedaban rotos.

### 17.2. Solución

`assets/js/modules/embed.js` — módulo runtime que empaqueta todos los recursos inline antes de la descarga:

| Función | Qué hace | API |
|---|---|---|
| `collectCSS()` | Recorre `document.styleSheets` y recolecta `cssRules[].cssText` | Síncrona, retorna string |
| `fetchJS(src)` | `fetch()` mismo origen para obtener contenido JS como texto | Async, retorna Promise<string> |
| `imageToDataURI(img)` | Dibuja imagen en `<canvas>` y exporta como `data:image/png;base64,...` | Async, retorna Promise<string> |
| `buildStandalone()` | Orquesta: inyecta CSS inline, reemplaza `<script src>` por inline, convierte imágenes a data URI | Retorna Promise<string> |

### 17.3. Flujo de `downloadHTML()` (actualizado)

```
[Click "Guardar dashboard"]
  → toast("⏳ Empaquetando dashboard...")
  → __EMBED.buildStandalone()
      ├─ collectCSS() → <style>...</style> (reemplaza <link>)
      ├─ fetchJS() para cada <script src> → <script>code</script>
      ├─ imageToDataURI() para cada <img> → data:image/png;base64,...
      └─ Reemplaza DEFAULT_DATA con DB actual
  → Blob → download
  └─ Si __EMBED no existe o falla: fallback clásico (solo DEFAULT_DATA)
```

### 17.4. Edge cases

| Caso | Comportamiento |
|---|---|
| CDN script (Chart.js) | fetchJS falla (cross-origin sin CORS o sin conexión) → se conserva `<script src="...">` original |
| Imagen no cargada (0×0) | Canvas falla → se conserva src original |
| Imagen ya data URI | Se pasa tal cual, sin reconversión |
| `outerHTML` resuelve src a URL absoluta | Se reemplazan ambas formas (relativa y absoluta) |
| Sin conexión a internet | JS local funciona (mismo origen), CDN no — Chart.js no disponible offline |

### 17.5. Carga

`embed.js` se carga entre `utils.js` y `storage.js` (antes que `downloadHTML()` lo necesite):

```
Chart.js (CDN) → utils.js → **embed.js** → storage.js → app-data.js → ...
```

### 17.6. Dependencias

- `fetch()` — disponible en todos los navegadores modernos
- `document.styleSheets` + `cssRules` — mismo origen (CSS local)
- `<canvas>` API — para conversión de imágenes

---

## 18. Estrategia de impresión / PDF

### 18.1. Problemas observados

| Síntoma | Causa raíz | Componente |
|---|---|---|
| Corte horizontal | `overflow-x:auto` en `.scroll` | Tree (renderTree) |
| Tabla truncada vertical | `max-height:480px` + `overflow:auto` en `.tbl-wrap` | Tabla (renderTabla) |
| Corte contenedores lista | `max-height:140px;overflow-y:auto` inline | Indicadores (legends) |
| Corte horizontal tabla | `overflow-x:auto` + `min-width:700px` inline | Indicadores (facultad table) |
| Secciones plegadas | `display:none` en secciones toggle | Pipeline |
| Sticky header no funcional | `position:sticky` no soportado en print browsers | Tabla |
| Cards cortadas entre páginas | Ausencia de `break-inside` | Tree cards, KPI, Sede cards |
| Grillas muy anchas | `repeat(5,1fr)` / `repeat(6,1fr)` | KPIs, Indicadores |

### 18.2. Estrategia implementada (`@media print`)

#### 18.2.1. Principios

1. **Print color exact**: `*-print-color-adjust:exact` en todos los elementos para preservar colores corporativos UDEC.
2. **Sin dependencia de JS**: todas las adaptaciones son CSS puras, sin hooks JS ni librerías.
3. **Overflow visible**: todo `overflow:auto/hidden/scroll` → `visible`. El contenido fluye naturalmente a través de páginas.
4. **Page-break-inside:avoid** en cards, nodos, filas de tabla, KPIs y badges.
5. **Compactación visual**: font-size reducida (8–10px), padding/margin reducidos, header compacto.
6. **Scaling del árbol**: `.tree` escala a 70% vía `transform:scale(.7)` con `transform-origin:top left` para que el diagrama jerárquico (que usa `inline-flex` + `min-width:max-content`) quepa en el ancho de página.
7. **Secciones expandidas**: pipeline toggle sections con `display:block` forzado.

#### 18.2.2. Componentes ocultos en print

| Selector | Motivo |
|---|---|
| `.no-print` | Marcados manualmente (fac-bar, filters, tab-bar, botones) |
| `.toast` | Notificación flotante, irrelevante en papel |
| `.edit-node-btn` | Botones de edición sobre nodos del árbol |
| `.btn-white`, `.btn-gold`, `.btn-reset`, `.btn-green`, `.btn-red` | Todos los botones de acción |
| `#panel-editor` | Panel editor completo |
| `#snies-content button` | Botones de filtro SNIES |

#### 18.2.3. Componentes adaptados

| Componente | Cambio principal |
|---|---|
| Header | Compacto (28px logos, 11px título), botones ocultos |
| KPIs | 5→3 columnas, padding reducido |
| Legend | Compacta, page-break-inside:avoid |
| Tree | `.scroll` overflow visible, `.tree` scale(0.7), cards avoid-break |
| Table (renderTabla) | `max-height` eliminado, `position:sticky` → `static`, font 8px |
| Sede View | Overflow visible, grid adaptativo, cards avoid-break |
| Indicators | Inline overrides via `[style*="..."]` selectors: overflow visible, max-height none, grid 6→3 cols, SVG limitado a 100px |
| SNIES | Canvas limitado (320×160px), botones ocultos |
| Pipeline | Secciones expandidas (`display:block` forzado), grid 3 cols |

### 18.3. Limitaciones conocidas

| Limitación | Causa | Impacto |
|---|---|---|
| Tree aún puede cortarse horizontalmente en landscape | `transform:scale(.7)` no garantiza ajuste para 6+ programas | Medio — ocurre con muchas especializaciones por facultad |
| Chart.js en canvas se renderiza con baja resolución | Canvas es rasterizado por el browser print engine, sin control de DPI | Medio — gráficos SNIES se ven pixelados |
| `@page landscape` no es estándar CSS | La especificación `@page` no soporta pseudo-clase `:landscape` | Bajo — el usuario debe seleccionar Landscape manualmente en el diálogo de print |
| Secciones toggle del pipeline se imprimen completas aunque colapsadas en pantalla | `display:block` forzado revela contenido oculto | Bajo — es el comportamiento deseado |
| Inline styles con `!important` no siempre sobreescribibles | `[style*="..."]` selector tiene alta especificidad pero puede fallar con atributos normalizados por el browser | Bajo — validar en cada browser target |
| Tabla de indicadores (9 columnas) puede comprimirse demasiado | `min-width:700px` + `width:100%` + font 8px fuerza texto pequeño | Medio — legibilidad comprometida |
| Sin librería externa, no hay control de: encabezados/pies de página, numeración, saltos de página exactos, marcas de agua | Limitaciones nativas de `window.print()` | Alto — para documentos formales se requiere html2pdf/jsPDF |
| Paginación de árbol grande inevitable | Los SVG connectors y cards jerárquicas no se dividen limpiamente entre páginas | Alto — el árbol debería imprimirse en una sola página o no imprimirse |

### 18.4. Componentes clasificados por compatibilidad print

| Componente | Compatibilidad | Notas |
|---|---|---|
| **Header** | ✅ Correcta | Compacto, colores preservados |
| **Fac bar** | ✅ Oculta | `no-print` |
| **Filters** | ✅ Oculta | `no-print` |
| **KPIs** | ✅ Correcta | 3 columnas, cards compactas |
| **Legend** | ✅ Correcta | Compacta, colores preservados |
| **Tree (árbol)** | ⚠️ Parcial | Scale 70%, puede cortarse en vertical para facultades grandes |
| **Tabla** | ✅ Correcta | Overflow eliminado, sticky → static, avoid-break en tr |
| **Sede View** | ✅ Correcta | Grid adaptativo, cards avoid-break |
| **Indicadores** | ⚠️ Parcial | Inline styles difíciles de override; SVG charts escalan bien; tabla 9-col es pequeña |
| **SNIES** | ⚠️ Parcial | Canvas baja resolución; botones ocultos; tabla OK |
| **Pipeline** | ✅ Correcta | Secciones expandidas, grid 3 cols |
| **Editor** | ✅ Oculta | `#panel-editor` oculto |

### 18.5. Recomendación futura

Para documentos PDF formales (informes, presentaciones institucionales), se recomienda:

1. **html2pdf.js** o **jsPDF + html2canvas**: captura rasterizada del DOM con control de:
   - Encabezados y pies de página personalizados
   - Numeración de páginas
   - Saltos de página explícitos
   - Marcas de agua institucionales
   - Resolución de gráficos SVG/Canvas mejorada

2. **Cuándo migrar**: cuando se requiera:
   - Exportación PDF con formato institucional (membrete, logos grandes, bordes)
   - Documentos multi-página con paginación controlada
   - Inclusión de datos SNIES en informes trimestrales
   - Distribución externa a entes gubernamentales (MEN)

3. **No migrar si**: el print CSS actual + `window.print()` + selección manual "Save as PDF" del navegador es suficiente para uso interno del equipo de posgrados.

### 18.6. Uso recomendado

```
1. Abrir el dashboard en navegador (Chrome/Edge recomendado)
2. Seleccionar pestaña a imprimir (Árbol, Tabla, Indicadores, etc.)
3. Ctrl+P / Cmd+P
4. Seleccionar destino: "Guardar como PDF"
5. Opcional: Layout → Landscape (para árbol o tabla ancha)
6. Opciones → "Gráficos de fondo" activado (preserva colores)
7. Márgenes → "Personalizado" (mínimo)
8. Guardar
```

---

## 19. Análisis de accesos y mutaciones sobre DB

### 19.1. Estructura de datos

```
DB: Array<Facultad>

Facultad {
  id: string,          // ej. "admin"
  name: string,        // ej. "Facultad de Ingeniería"
  doc: Doctorado|null, // opcional
  progs: Array<Programa>
}

Programa {
  id: string,          // uid()
  n: string,           // nombre del pregrado
  sedes: string[],     // ej. ["Fusagasugá", "Chía"]
  lineas: Array<Linea>,
  mae: Array<Maestria>
}

Linea {
  id: string,          // uid()
  l: string,           // nombre de línea
  t: string,           // tipo: "Profundización 1" | "Profundización 2"
  esp: string,         // nombre de especialización
  e: string,           // estado (texto libre, ~20 variantes)
  o: string,           // oferta: "V" | "P"
  sedes: string[],
  resp: string,        // responsable
  mes: number|null,    // 1-12
  ano: number|null     // 2024-2028
}

Maestria {
  id: string,          // uid()
  n: string,           // nombre maestría
  e: string,           // estado
  o: string,           // oferta: "V" | "P"
  sedes: string[],
  resp: string,
  mes: number|null,
  ano: number|null
}

Doctorado {
  n: string,
  e: string,
  o: string,           // "V" | "P"
  sedes: string[],
  resp: string,
  mes: number|null,
  ano: number|null
}
```

### 19.2. Mapa de consumidores por módulo

```
                           ┌───────────────────┐
                           │   window.DB        │  ← fuente de verdad
                           │   Array(7)         │
                           └────────┬──────────┘
                   ┌────────────────┼────────────────────┐
                   ▼                ▼                     ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
           │   AppData    │ │   storage.js │ │  app.js (direct) │
           │  (capa)      │ │  (persist)   │ │  renderers       │
           └──────┬───────┘ └──────┬───────┘ └────────┬─────────┘
                  │                │                   │
       ┌──────────┼──────────┐     │          ┌────────┼────────┐
       ▼          ▼          ▼     │          ▼        ▼        ▼
  dashboard.js filters.js export.js│     renderTree renderTabla renderSedeView
  indicators.js                   │     renderProgForm renderEditor
                                  │
                                  ▼
                            embed.js (read)
```

### 19.3. Operaciones por tipo

#### LECTURAS

| # | Operación | Responsable | Frecuencia | Línea |
|---|---|---|---|---|
| L1 | `DB[curFac]` → facultad activa | renderTree, renderTabla, renderSedeView, renderProgForm, renderEditor | 5 call-sites en app.js | app.js:172,432,466,495,819 |
| L2 | `DB[curFac].progs.forEach(p => ...)` | renderTree, renderTabla, renderSedeView, renderEditor | 4 call-sites en app.js | app.js:187,433,467,827 |
| L3 | `f.progs.filter(p => pregradoMatch(p.n))` | renderTree | 1 | app.js:187 |
| L4 | `f.progs.find(x => x.id === pid)` | renderProgForm | 1 | app.js:496 |
| L5 | `p.lineas.filter(l => itemMatch(l,'espec'))` | renderTree, renderTabla | 3 app.js | app.js:191,214,436 |
| L6 | `p.mae.filter(m => itemMatch(m,'mae'))` | renderTree, renderTabla | 3 app.js | app.js:193,215,437 |
| L7 | `f.doc && itemMatch(f.doc,'doc')` | renderTree, renderTabla | 2 | app.js:193,408,450 |
| L8 | `DB[curFac].progs.length` | renderEditor | 1 | app.js:825 |
| L9 | `DB[curFac].progs.map(...)` | renderEditor (inline en string) | 1 | app.js:821-846 |
| L10 | `window.DB[i]` (genérico) | AppData.getFacultad | vía delegación | app-data.js:26 |
| L11 | `window.DB[faci].progs` | AppData.getProgramas | sin consumidores aún | app-data.js:27 |
| L12 | `window.DB.filter/Búsqueda` | AppData.findProgramById | vía deleteProg | app-data.js:32-38 |
| L13 | `ALL_SEDES.filter(s => s.has(x))` | populateSedes (filters.js) | 1 | filters.js:53 |
| L14 | `JSON.stringify(window.DB)` | saveDB + downloadHTML | cada write + export | storage.js:17, embed.js:67 |

#### ESCRITURAS / MUTACIONES

| # | Operación | Responsable | Riesgo | Línea |
|---|---|---|---|---|
| W1 | `window.DB = JSON.parse(JSON.stringify(DEFAULT_DATA))` | loadDB | **ALTO** — reemplaza DB completo | storage.js:42,47 |
| W2 | `window.DB.push({name, progs:[], doc:null})` | AppData.saveFacultad (isNew) | **ALTO** — muta array + cambia índices | app-data.js:66 |
| W3 | `window.DB[currentIndex] = facultad` | AppData.saveFacultad (edit) | **ALTO** — reemplaza elemento completo | app-data.js:67 |
| W4 | `window.DB.splice(facIndex, 1)` | AppData.deleteFacultad | **ALTO** — reindexa todo el array | app-data.js:79 |
| W5 | `f.progs.push(prog)` | AppData.savePrograma (isNew) | **ALTO** — muta array interno | app-data.js:50 |
| W6 | `f.progs[i] = prog` | AppData.savePrograma (edit) | **MEDIO** — reemplaza elemento referenciado | app-data.js:53 |
| W7 | `f.progs = f.progs.filter(p => p.id !== pid)` | AppData.deletePrograma | **MEDIO** — reemplaza array completo | app-data.js:61 |
| W8 | `f.doc = doc` / `f.doc = null` | AppData.saveDocumento | **BAJO** — mutación de propiedad in-place | app-data.js:86-87 |
| W9 | `f.name = name` | AppData.updateFacultadName | **BAJO** — mutación de propiedad in-place | app-data.js:74 |
| W10 | `localStorage.setItem('udec_rutas_db', ...)` | saveDB | **BAJO** — efecto secundario de persistencia | storage.js:17 |

#### MUTACIONES OCULTAS / SIDE EFFECTS

| # | Efecto | Dónde | Detalle |
|---|---|---|---|
| S1 | Reasignación de `curFac` tras delete/save | app.js:878 (`deleteFac`), app.js:892 (`saveFac`) | Cambia índice global después de mutar DB |
| S2 | `curFac` accessor → AppState.navigation.curFac | app.js:71 | Sincronización automática via Object.defineProperty |
| S3 | `saveDB()` llamado 6 veces en AppData writes | app-data.js:55,62,68,75,80,88 | Cada write persiste automáticamente a localStorage |
| S4 | `location.reload()` en resetDB | storage.js:93 | Recarga completa de página |
| S5 | Re-renderizado completo tras cada write | app.js:561,567,873,879,894 | `renderViews()` + `renderEditor()` + `populateSedes()` + `renderFacBar()` |

### 19.4. Dependencias de renderizado (qué DB necesita cada vista)

| Vista | Datos de DB requeridos | Dependencia |
|---|---|---|
| **renderFacBar** (dashboard.js:24) | `AppData.getFacultades()` — solo `.name` | Bajo |
| **renderKPIs** (dashboard.js:41) | `AppData.getFacultad(curFac)` → `f.progs`, `p.lineas`, `p.mae`, `f.doc` | Alto |
| **renderTree** (app.js:170) | `DB[curFac]` → `f.name`, `f.progs[].id/n/sedes`, `p.lineas[]`, `p.mae[]`, `f.doc` | **Crítico** |
| **renderTabla** (app.js:431) | `DB[curFac]` → `f.progs`, `p.lineas[]`, `p.mae[]`, `f.doc` | Alto |
| **renderSedeView** (app.js:465) | `DB[curFac]` → `f.progs`, sedes de cada item, `f.doc` | Alto |
| **renderProgForm** (app.js:494) | `DB[curFac]` → `f.progs.find(id)`, `p.lineas`, `p.mae` | Alto |
| **renderEditor** (app.js:818) | `DB[curFac]` → `f.name`, `f.progs`, `p.lineas/mae`, `f.doc` | Alto |
| **renderIndicadores** (indicators.js:28) | `AppData.getFacultades()` + count → todos los datos | Alto |
| **renderPipeline** (app.js:685) | `AppData.getFacultades()` → todos los datos | Alto |
| **renderSNIES** (app.js:620) | `SD` (AppState.snies.SD) — independiente de DB | Bajo |
| **populateSedes** (filters.js:47) | `AppData.getFacultad(curFac)` + `ALL_SEDES` | Medio |
| **downloadDB** (export.js:164) | `AppData.getFacultades()` → todos los datos planos | Alto |
| **downloadHTML** (storage.js:53) | `JSON.stringify(window.DB)` → datos serializados | Bajo |

### 19.5. Patrones de acceso repetidos

| Patrón | Ocurrencias | Dónde |
|---|---|---|
| `DB[curFac]` → `f.progs` + `forEach/map/filter` | 8 | renderTree (3), renderTabla (2), renderSedeView (1), renderEditor (2) |
| `DB[curFac].progs.find(id)` → `p.lineas` + `p.mae` | 1 | renderProgForm |
| `AppData.getFacultades().forEach(fac => fac.progs.forEach(p => ...))` | 3 | indicators.js, export.js, pipeline |
| `DB[curFac].progs.filter(p => pregradoMatch(p.n))` | 1 | renderTree |
| `p.lineas.filter(l => itemMatch(l,'espec'))` + `p.mae.filter(m => itemMatch(m,'mae'))` | 4 | renderTree (2), renderTabla (2) |
| `f.doc && itemMatch(f.doc, 'doc')` | 2 | renderTree, renderTabla |
| `f.progs.length` | 1 | renderEditor |
| `JSON.parse(JSON.stringify(objeto))` (deep clone) | 3 | loadDB (DEFAULT_DATA), renderProgForm (tmpLineas/tmpMaes) |

### 19.6. Riesgos por operación

| Riesgo | Operaciones | Justificación |
|---|---|---|
| **🔴 ALTO** | `loadDB`, `saveFacultad` (push/splice), `deleteFacultad` | Mutan la estructura del array `window.DB` — cualquier referencia por índice (curFac) queda desactualizada. `splice` cambia índices de todas las facultades siguientes. |
| **🟡 MEDIO** | `savePrograma` (replace), `deletePrograma` (filter), `savePrograma` (push) | Mutan la estructura interna de `f.progs` — referencias retenidas a programas individuales quedan huérfanas. El filter reemplaza todo el array. |
| **🟢 BAJO** | `saveDocumento`, `updateFacultadName`, `saveDB`, `getFacultades` | Mutación in-place de propiedades sin afectar estructura de array ni índices. get retorna referencia directa (compartida) pero nadie retiene la referencia para mutación salvo AppData. |
| **⚪ INFORMATIVO** | `getFacultad`, `findProgramById`, `getFacultadCount` | Solo lectura. No hay efecto secundario. Seguras para migración inmediata. |

### 19.7. Referencias compartidas (aliasing)

| Referencia | Dónde se obtiene | Riesgo |
|---|---|---|
| `AppData.getFacultades()` → `window.DB` | dashboard.js:25, indicators.js:77, export.js:184, app.js:697,821 | **ALERTA**: retorna el array original. Cualquier `push/splice` en el caller muta DB directamente. Actualmente ningún caller lo hace (solo AppData escribe), pero no hay protección. |
| `AppData.getFacultad(i)` → `window.DB[i]` | dashboard.js:42, filters.js:48, app.js:876,886 | **ALERTA**: retorna la referencia del objeto. Mutar `f.name`, `f.progs`, `f.doc` desde caller afecta DB directamente. Solo AppData escribe actualmente. |
| `DB[curFac]` en app.js renderers | app.js:172,432,466,495,819 | **LEGACY**: acceso directo a `var DB`, sin pasar por AppData. Solo lectura, pero bypass del control de acceso. |

### 19.8. Operaciones candidatas para encapsulación inmediata (sin riesgo)

| Operación | Reemplazo AppData | Prioridad |
|---|---|---|
| `DB[curFac]` en renderTree | `AppData.getFacultad(AppState.navigation.curFac)` | 🔴 Alta (reemplaza 5 sites) |
| `DB[curFac]` en renderTabla | `AppData.getFacultad(AppState.navigation.curFac)` | 🔴 Alta |
| `DB[curFac]` en renderSedeView | `AppData.getFacultad(AppState.navigation.curFac)` | 🔴 Alta |
| `DB[curFac]` en renderProgForm | `AppData.getFacultad(AppState.navigation.curFac)` | 🔴 Alta |
| `DB[curFac]` en renderEditor | `AppData.getFacultad(AppState.navigation.curFac)` | 🔴 Alta |
| `storage.js` references to `window.DB` | `AppData.getFacultades/getFacultad` | 🟡 Media |
| `DEFAULT_DATA` como módulo | `assets/js/data/default-data.js` | 🟡 Media |
| `ALL_SEDES` como módulo | `assets/js/data/sedes.js` | 🟢 Baja |
| `SD` (SNIES) como módulo | `assets/js/data/snies-data.js` | 🟢 Baja |

### 19.9. Estructura propuesta para capa de datos

```
assets/js/
  data/
    app-data.js       ← ya existe: queries + writes controlados sobre window.DB
    default-data.js   ← extraer DEFAULT_DATA aquí
    sedes.js          ← extraer ALL_SEDES aquí
    snies-data.js     ← extraer SD aquí
  services/
    (reservado para lógica de negocio futura)
  modules/
    ... (sin cambios)
```

### 19.10. Dependencias circulares

```
NO HAY dependencias circulares.
```

Flujo actual:
```
app-data.js ← storage.js ← embed.js    (embed.js → app-data.js? No)
                ↑                ↑
          app-data.js        app.js
                ↑
          app.js (loadDB)
```

`embed.js` lee `window.DB` directamente en `buildStandalone()`, no importa de app-data.js. Esto es correcto porque embed.js se ejecuta en runtime para export, no para inicialización.

### 19.11. Resumen de acoplamientos

| Módulo | Acoplamiento a DB | Controlado por AppData |
|---|---|---|
| app-data.js | 20 referencias a `window.DB` | Es la capa misma — aceptable |
| app.js (renderers) | 6 referencias `DB[curFac]` | ❌ Directo |
| app.js (writes) | 0 — vía AppData | ✅ |
| storage.js | 6 referencias `window.DB` + DEFAULT_DATA | ❌ Directo |
| storage.js (downloadHTML) | 2 refs `window.DB` | ❌ Directo |
| embed.js | 1 ref `window.DB` | ❌ Directo (pero aislado) |
| filters.js | 1 ref `window.ALL_SEDES` | ❌ Directo (solo lectura) |
| dashboard.js | 0 — vía AppData | ✅ |
| indicators.js | 0 — vía AppData | ✅ |
| export.js | 0 — vía AppData | ✅ |

### 19.12. Operaciones encapsuladas (Fase 4)

#### Nuevos getters readonly agregados (app-data.js — Fase 4):

| Método | Retorno | Propósito |
|---|---|---|
| `getFacultadesSafe()` | `Array` (shallow copy) | Evita mutación accidental del array original |
| `getFacultadSafe(i)` | `Object` (shallow copy) | Evita mutación accidental del objeto facultad |
| `getProgramaCount(fi)` | `number` | Cuenta programas de pregrado |
| `getSedesEnUso(fi)` | `string[]` | Sedes únicas usadas por los programas de una facultad |
| `getFacultadName(fi)` | `string` | Acceso seguro al campo name |
| `getFacultadDoc(fi)` | `Object|null` | Acceso seguro al campo doc |
| `getFacultadIndexById(fid)` | `number` | Búsqueda de índice por id |
| `getFacultadIndexByName(name)` | `number` | Búsqueda de índice por nombre exacto |
| `getProgramaById(pid)` | `Object|null` | Retorna solo el programa (sin facIndex) |

#### Referencias legacy migradas en Fase 4:

| Antes | Después | Archivo |
|---|---|---|
| `window.ALL_SEDES.filter(...)` | `AppState.staticData.ALL_SEDES.filter(...)` | filters.js:53 |

### 19.13. Checklist de migración (actualizado Fase 4)

- [x] AppData creado (queries + writes iniciales, Fase 3)
- [x] AppData extendido con 9 getters readonly adicionales (Fase 4)
- [x] dashboard.js → AppData (Fase 3)
- [x] indicators.js → AppData (Fase 3)
- [x] export.js → AppData (Fase 3)
- [x] app.js writes → AppData (Fase 3)
- [x] filters.js `window.ALL_SEDES` → `AppState.staticData.ALL_SEDES` (Fase 4)
- [ ] filters.js `window.curFac` → `AppState.navigation.curFac` (pendiente)
- [ ] app.js renderers → AppData (6 sites: tree, tabla, sede, progForm, editor)
- [ ] storage.js → AppData (loadDB, saveDB)
- [ ] embed.js → AppData (buildStandalone)
- [ ] Extraer DEFAULT_DATA a módulo separado
- [ ] Extraer ALL_SEDES a módulo separado
- [ ] Extraer SD (SNIES) a módulo separado

### 19.14. Cobertura actual de AppData

| Módulo | Accesos DB | Via AppData | Directo | Progreso |
|---|---|---|---|---|
| app-data.js | 20 | 20 (es la capa) | 0 | 100% |
| dashboard.js | 2 | 2 | 0 | 100% |
| indicators.js | 11 | 11 | 0 | 100% |
| export.js | 5 | 5 | 0 | 100% |
| app.js (writes) | 7 | 7 | 0 | 100% |
| filters.js | 3 | 2 | 1 (`window.curFac`) | 67% |
| app.js (renderers) | 30 | 0 | 30 (`DB[curFac]` + `f.*`) | 0% |
| storage.js | 11 | 0 | 11 (`window.DB`) | 0% |
| embed.js | 1 | 0 | 1 (`window.DB`) | 0% |
| **Total** | **90** | **47** | **43** | **52%** |

### 19.15. Accesos legacy restantes (pendientes Fase 4)

| # | Referencia | Archivo | Línea | Riesgo | Dependencia |
|---|---|---|---|---|---|
| R1 | `DB[curFac]` → fac activa | app.js | 172,432,466,495,819 | 🔴 Alto | renderTree, renderTabla, renderSedeView, renderProgForm, renderEditor |
| R2 | `f.progs.forEach/map/filter` | app.js | 187,433,467,827 | 🔴 Alto | renderTree, renderTabla, renderSedeView, renderEditor |
| R3 | `p.lineas/p.mae` acceso anidado | app.js | 191,214,436,496 | 🔴 Alto | renderTree, renderTabla, renderProgForm |
| R4 | `f.doc` acceso | app.js | 408,450,473,819 | 🟡 Medio | renderTree, renderTabla, renderSedeView, renderEditor |
| R5 | `f.name` acceso | app.js | 819,825 | 🟡 Medio | renderEditor |
| R6 | `window.DB` en save/load | storage.js | 17,42,61,67,77 | 🟡 Medio | persistencia (no tocar) |
| R7 | `window.DB` en embed | embed.js | 67 | 🟢 Bajo | export (no tocar) |
| R8 | `window.curFac` en filters | filters.js | 48 | 🟢 Bajo | acceso legacy |

### 19.16. Referencias compartidas detectadas

| Referencia | Dónde | Riesgo |
|---|---|---|
| `AppData.getFacultades()` → `window.DB` mismo array | dashboard.js:25, indicators.js:77, export.js:184, app.js:697,821 | Mutable desde afuera — `getFacultadesSafe()` existe como alternativa |
| `AppData.getFacultad(i)` → `window.DB[i]` mismo objeto | dashboard.js:42, filters.js:48, app.js:876,886 | Mutable desde afuera — `getFacultadSafe()` existe como alternativa |
| `AppState.staticData.ALL_SEDES` → `window.ALL_SEDES` mismo array | filters.js:53 | Misma referencia, no hay copia |
| `DB[curFac]` en renderers | app.js:172,432,466,495,819 | Lee `var DB` directamente, no pasa por AppData |

### 19.17. Riesgos pendientes para siguiente fase

1. **6 referencias `DB[curFac]` en renderers**: todas son solo lectura, pero 5 renderers complejos dependen de ellas. Migración requiere refactor de template strings con acceso a propiedades anidadas (`f.doc`, `f.progs[i].lineas[j]`, etc.).
2. **11 referencias en storage.js**: `saveDB()` serializa `window.DB`, `loadDB()` reemplaza `window.DB`. Migrar requiere que AppData gestione la persistencia.
3. **1 referencia en embed.js**: `JSON.stringify(window.DB)` en `buildStandalone()`. Migrar requiere AppData serializable.
4. **Mutable references**: `getFacultades()` y `getFacultad()` retornan referencias directas. Callers actualmente no mutan, pero no hay protección.
5. **ALL_SEDES sin extraer**: datos inline en app.js, no modularizados. Filtros dependen de `AppState.staticData.ALL_SEDES` que apunta al mismo array.

### 19.18. Recomendaciones para Fase 4 (siguiente iteración)

1. **Migrar renderTree y renderTabla** primero: son solo lectura y tienen el patrón más claro de `DB[curFac]` → `f.progs` → `p.lineas/p.mae`.
2. **Agregar validación en AppData writes**: antes de mutar, validar estructura del programa (campos obligatorios, tipos).
3. **Extraer DEFAULT_DATA**: archivo separado `default-data.js` para no contaminar app.js con ~50 líneas de datos serializados.
4. **Migrar storage.js**: que `loadDB` use `AppData.loadDB()` y que `saveDB` acceda a datos via AppData.
5. **Evaluar inmutabilidad**: congelar (`Object.freeze`) los objetos retornados por AppData queries para prevenir mutaciones accidentales fuera de la capa.
