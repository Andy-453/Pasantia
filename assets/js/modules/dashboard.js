/**
 * dashboard.js — KPIs y barra de facultades
 * ---
 * Responsabilidad:
 *   - renderFacBar: barra de selección de facultad
 *   - selFac: cambio de facultad activa con actualización completa
 *   - renderKPIs: cálculo y visualización de indicadores del dashboard
 *
 * Dependencias:
 *   - DB, curFac (globales de app.js)
 *   - pregradoMatch, itemMatch, populateSedes (filters.js)
 *   - getSt (utils.js)
 *   - renderViews, showTab (app.js, orquestador)
 *
 * Estado:
 *   Extraído de app.js en Fase 2.
 *   Compatibilidad global mantenida vía window.* (temporal).
 */

/**
 * Renderiza la barra de selección de facultad.
 * @global {Array} DB - datos completos
 * @global {number} curFac - índice de facultad activa
 */
function renderFacBar(){
  document.getElementById('facbar').innerHTML=DB.map(function(f,i){
    return '<button class="fac-btn'+(i===curFac?' act':'')+'" data-action="sel-fac" data-fac="'+i+'">'+f.name.replace('Facultad de ','').replace('Facultad ','')+'</button>';
  }).join('');
}

/**
 * Cambia la facultad activa y actualiza toda la vista.
 * SOMBREADA por la misma función en línea 1 (esta es la versión activa).
 * @param {number} i - índice de facultad en DB
 */
function selFac(i){curFac=i;AppState.navigation.curFac=i;populateSedes();renderFacBar();renderViews();['indicadores','snies','pipeline','editor'].forEach(function(t){var el=document.getElementById('panel-'+t);if(el&&el.classList.contains('act'))showTab(t);});}

/**
 * Calcula y renderiza las tarjetas KPI (vigente, proyectada, especializaciones, maestrías, negados).
 * Aplica filtros activos vía pregradoMatch / itemMatch.
 */
function renderKPIs(){
  const f=DB[AppState.navigation.curFac];let vig=0,proy=0,esps=0,maes=0,neg=0;
  if(!f||!Array.isArray(f.progs)){document.getElementById('kpis').innerHTML='';return;}
  f.progs.forEach(p=>{
    if(!pregradoMatch(p.n)) return;
    (Array.isArray(p.lineas)?p.lineas:[]).filter(l=>itemMatch(l,'espec')).forEach(l=>{esps++;l.o==='V'?vig++:proy++;if(getSt(l.e).cat==='negado')neg++;});
    (Array.isArray(p.mae)?p.mae:[]).filter(m=>itemMatch(m,'mae')).forEach(m=>{maes++;m.o==='V'?vig++:proy++;});
  });
  if(f.doc&&itemMatch(f.doc,'doc')){f.doc.o==='V'?vig++:proy++;}
  document.getElementById('kpis').innerHTML=`
    <div class="kpi" style="background:#e6f2eb;border-color:#006633"><div class="kpi-v" style="color:#006633">${vig}</div><div class="kpi-l">Oferta vigente</div></div>
    <div class="kpi" style="background:#e8f0fb;border-color:#378ADD"><div class="kpi-v" style="color:#1a5cb0">${proy}</div><div class="kpi-l">Oferta proyectada</div></div>
    <div class="kpi" style="background:#f0f7f2;border-color:#006633"><div class="kpi-v" style="color:#006633">${esps}</div><div class="kpi-l">Especializaciones</div></div>
    <div class="kpi" style="background:#fdf6e3;border-color:#C8A43A"><div class="kpi-v" style="color:#8a6d00">${maes}</div><div class="kpi-l">Maestrías</div></div>
    <div class="kpi" style="background:#FCEBEB;border-color:#F09595"><div class="kpi-v" style="color:#A32D2D">${neg}</div><div class="kpi-l">Negados MEN</div></div>`;
}

