# Análisis Arquitectónico — Dashboard UDEC Posgrados

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
|---|---|---|
| `Dashboard_UDEC_Posgrados_2026-04-23.html` | ~1174 | Shell HTML + datos embebidos serializados |
| `assets/js/app.js` | 861 | Orquestador principal (init, tree, tabla, sedeView, editor, pipeline, SNIES) |
| `assets/js/modules/utils.js` | 60 | Utilidades base (getSt, toast, uid, gv, gi, pll, showConfirm) |
| `assets/js/modules/storage.js` | 78 | Persistencia (saveDB, loadDB, downloadHTML, resetDB) |
| `assets/js/modules/filters.js` | 80 | Filtros (sedeMatch, ofertaMatch, estadoMatch, itemMatch, applyFilters) |
| `assets/js/modules/dashboard.js` | 65 | KPIs y barra de facultades (renderKPIs, renderFacBar, selFac) |
| `assets/js/modules/indicators.js` | 435 | Panel de indicadores (renderIndicadores, helpers SVG) |
| `assets/js/modules/export.js` | 278 | Exportaciones (downloadDB, exportSNIES, mapas SNIES) |

**Total: ~1765 líneas JS, 6 módulos extraídos + 1 orquestador legacy**

### Orden de carga
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
| Inline handlers | `onclick="openEditProg('${p.id}')"` (previene ESModules) |
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
| Inline handlers | `onclick="toggleSec(this.dataset.secId)"` en secciones colapsables |
| Notas | Contiene 7 closures internos (`grp`, `kpi`, `nivBadge`, `tabla`, `buildTimeline`, `sec`, `getTri`, `estCol`) |

### 4.4. `renderSNIES()` (app.js:602-663) — **MEDIO-ALTO**

| Aspecto | Detalle |
|---|---|
| Líneas | ~62 |
| Dependencias globales | `SD`, `_snFac`, `_snProg`, Chart.js (global) |
| Complejidad | MEDIA — generación de HTML + gráficos Chart.js con setTimeout |
| Acoplamiento | ALTO — conoce estructura exacta de SD, FAC_MP, nombres de programas |
| Notas | Datos SD son independientes de DB (no hay acoplamiento con editor) |
| Inline handlers | `onclick="snSetFac(this.dataset.fac)"`, `onclick="snSetProg(this.dataset.prog)"` |

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

### 8.1. Inline onclick handlers

**Problema**: +50 handlers `onclick` en HTML renderizado dinámicamente y en HTML embebido. Ejemplos:
```html
<button onclick="openEditProg('${p.id}')">
<button onclick="selFac(0)">
<button onclick="saveDoc()">
<div data-sec-id="timeline" onclick="toggleSec(this.dataset.secId)">
```

**Impacto**: Impide migrar a ESModules (los módulos no contaminan window). Requiere event delegation.

**Solución**: Reemplazar por `data-action` attributes + listener centralizado:
```js
document.addEventListener('click', e => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (action === 'editProg') Controller.Program.openEditForm(e.target.dataset.pid);
});
```

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
2. **Eliminar `var` legacy**: reemplazar `var DB`, `var curFac`, `var filt*` por referencias a `AppState`.
3. **Data como módulo**: extraer `DEFAULT_DATA`, `SD`, `ALL_SEDES` a módulos separados.
4. **ESModules**: cambiar `<script>` tags a `<script type="module">`.

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
|---|---|---|---|---|
| `show-tab` | click | `data-tab="arbol\|tabla\|sede\|..."` | `showTab(id)` | Bajo |
| `sel-fac` | click | `data-fac="0\|1\|2\|..."` | `selFac(i)` | Bajo |
| `reset-filters` | click | — | `resetFilters()` | Bajo |
| `apply-filters` | change | — | `applyFilters()` | Bajo |

### 14.4. Elementos con data-action

| Origen | Tipo | Evento |
|---|---|---|
| HTML estático | 7 tabs + 7 fac-buttons + reset + header | click |
| `renderFacBar()` (dashboard.js) | N fac-buttons dinámicos | click |
| HTML estático | 5 selects (#filt-sede, #filt-pregrado, #filt-oferta, #filt-estado, #filt-nivel) | change |

### 14.5. Estrategia de migración

Se removió `onclick`/`onchange` de todos los elementos con `data-action`. Cada tipo de evento (click, change) tiene su propio mapa (`__ACTIONS`, `__CHANGE`) y su propio listener. Las funciones globales persisten en `window` para handlers no migrados.

`resetFilters()` y `populateSedes()` modifican valores de selects vía `.value = ...` (programático), que no dispara eventos change — no hay loops.

### 14.6. Handlers NO migrados (pendientes)

| Handler | Ubicación | Por qué no se migró |
|---|---|---|
| `openEditProg(pid)` | renderTree (HTML dinámico) | renderTree excluido |
| `deleteProg(pid)` | renderTree / renderEditor | renderTree + editor excluidos |
| `saveProg(pid, isNew)` | renderProgForm | editor excluido |
| `addLinea()` / `delLinea()` | renderProgForm | editor excluido |
| `addMae()` / `delMae()` | renderProgForm | editor excluido |
| `snSetFac(f)` / `snSetProg(p)` | renderSNIES | SNIES excluido |
| `toggleSec(id)` | renderPipeline | Pipeline excluido |
| `toggleDocForm()` | renderEditor | Editor excluido |
| `saveDoc()` | renderEditor | Editor excluido |
| `deleteFac()` / `saveFac(isNew)` | renderEditor | Editor excluido |
| `openNewFac()` / `openEditFac()` | renderEditor | Editor excluido |
| `downloadDB()` | HTML estático | No idempotente |
| `downloadHTML()` | HTML estático | No idempotente |
| `resetDB()` | HTML estático | No idempotente |
| `window.print()` | HTML estático | Nativo, sin cambio |

### 14.7. Próximos pasos

1. **Migrar renderTree**: reemplazar `onclick="openEditProg(...)"` en templates dinámicos.
2. **Migrar editor**: ~15 handlers en renderProgForm y renderEditor.
3. **Migrar pipeline**: `toggleSec` ya tiene `data-sec-id` — estandarizar a data-action.
4. **Migrar tb-snies**: agregar `data-action="show-tab" data-tab="snies"` (único tab sin data-action).

### 14.8. Bloqueadores

| Bloqueador | Impacto |
|---|---|
| Templates en string literals `` `...${}...` `` | Dificulta reemplazo masivo |
| Handlers con args dinámicos `openEditProg('${p.id}')` | data-* resuelve, ~20 templates por refactorizar |
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
| click | `showTab('snies')` | tb-snies | Alta (único tab sin data-action) |
| click | `openNewProg()` | editor | Media (zona excluida) |
| click | `openEditFac()` | editor | Media (zona excluida) |
| click | `openNewFac()` | editor | Media (zona excluida) |
| click | `selFac(i)` | editor panel | Media (zona excluida) |
| click | `openEditProg(...)` | renderTree | Media (zona excluida) |
| click | `deleteProg(...)` | renderTree | Media (zona excluida) |
| click | `saveProg(...)` | renderProgForm | Media (zona excluida) |
| click | `snSetFac(...)` / `snSetProg(...)` | renderSNIES | Baja (zona excluida) |
| click | `toggleSec(...)` | renderPipeline | Baja (zona excluida) |
| click | `downloadDB()` / `downloadHTML()` / `resetDB()` | HTML header | Baja (no idempotente) |
| click | `window.print()` | HTML header | Sin cambio |

### 15.4. Preparación ESModules

Estado actual de dependencias para migración a `<script type="module">`:

| Requisito | Estado |
|---|---|
| Sin `var` globales en módulos | ❌ `var DB, curFac, filtSede, filtOferta, filtEstado, filtNivel, SD, _snFac, _snProg, ALL_SEDES, DEFAULT_DATA` persisten |
| Sin `onclick` inline en HTML | ⚠️ Parcial: 15+ onclick en editor, tree, SNIES, pipeline |
| Sin `onchange` inline en HTML | ✅ **0 onchange restantes** |
| Dispatcher centralizado como cuello de botella único | ✅ Click + change cubiertos |
| `window.App` como namespace de transición | ✅ ~50 funciones exportadas |
| `import`/`export` en lugar de contaminación global | ❌ Pendiente — requiere eliminar `var` globales primero |
