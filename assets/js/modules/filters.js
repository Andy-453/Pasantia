/**
 * filters.js — filtros y matching
 * ---
 * Responsabilidad:
 *   - predicados de filtro: sede, oferta, estado, nivel, pregrado
 *   - itemMatch: combinación de todos los filtros por ítem
 *   - populateSedes: actualiza selector de sedes según facultad activa
 *   - applyFilters / resetFilters: lectura/aplicación de filtros desde DOM
 *
 * Dependencias:
 *   - utils.js → getSt
 *   - window.DB, window.curFac, window.ALL_SEDES, window.filt*
 *
 * Estado:
 *   Parcialmente modular. Dependencia fuerte de variables globales.
 */
function sedeMatch(s){return window.filtSede==='ALL'||s&&s.includes(window.filtSede);}
function ofertaMatch(o){return window.filtOferta==='ALL'||(window.filtOferta==='V'&&o==='V')||(window.filtOferta==='P'&&o==='P');}
function estadoMatch(e){if(window.filtEstado==='ALL')return true;return getSt(e).cat===window.filtEstado;}
function nivelMatch(n){return window.filtNivel==='ALL'||window.filtNivel===n;}
function pregradoMatch(pn){return window.filtPregrado==='ALL'||pn===window.filtPregrado;}
/**
 * Combinación AND de todos los filtros para un ítem de programa.
 * @param {Object} item - línea de especialización o maestría/doc
 * @param {string} nivel - 'espec' | 'mae' | 'doc'
 */
function itemMatch(item,nivel){return nivelMatch(nivel)&&ofertaMatch(item.o)&&estadoMatch(item.e)&&sedeMatch(item.sedes);}

/**
 * Lee valores del DOM y aplica filtros, actualizando toda la vista.
 * @global window.filtSede|filtPregrado|filtOferta|filtEstado|filtNivel
 */
function applyFilters(){
  window.filtSede=document.getElementById('filt-sede').value;
  window.filtPregrado=document.getElementById('filt-pregrado').value;
  window.filtOferta=document.getElementById('filt-oferta').value;
  window.filtEstado=document.getElementById('filt-estado').value;
  window.filtNivel=document.getElementById('filt-nivel').value;
  window.AppState.filters.sede=window.filtSede;
  window.AppState.filters.pregrado=window.filtPregrado;
  window.AppState.filters.oferta=window.filtOferta;
  window.AppState.filters.estado=window.filtEstado;
  window.AppState.filters.nivel=window.filtNivel;
  renderViews();
}
function resetFilters(){
  window.filtSede=window.filtOferta=window.filtEstado=window.filtNivel=window.filtPregrado='ALL';
  window.AppState.filters.sede=window.AppState.filters.oferta=window.AppState.filters.estado=window.AppState.filters.nivel=window.AppState.filters.pregrado='ALL';
  ['filt-sede','filt-oferta','filt-estado','filt-nivel','filt-pregrado'].forEach(function(id){document.getElementById(id).value='ALL';});
  renderViews();
}

function populateSedes(){
  var f=window.DB[window.curFac];
  var s=new Set();
  f.progs.forEach(function(p){p.sedes.forEach(function(x){s.add(x);});});
  var sel=document.getElementById('filt-sede');
  sel.innerHTML='<option value="ALL">Todas las sedes</option>';
  window.ALL_SEDES.filter(function(x){return s.has(x);}).forEach(function(x){sel.innerHTML+='<option value="'+x+'">'+x+'</option>';});
  if(window.filtSede!=='ALL'&&!s.has(window.filtSede)) window.filtSede='ALL';
  sel.value=window.filtSede;
  window.AppState.filters.sede=window.filtSede;

  var pSel=document.getElementById('filt-pregrado');
  var prevPregrado=pSel.value;
  pSel.innerHTML='<option value="ALL">Todos los programas</option>';
  var seen=new Set();
  f.progs.forEach(function(p){
    if(!seen.has(p.n)){
      seen.add(p.n);
      pSel.innerHTML+='<option value="'+p.n+'">'+p.n+'</option>';
    }
  });
  if(prevPregrado!=='ALL'&&seen.has(prevPregrado)){pSel.value=prevPregrado;window.filtPregrado=prevPregrado;}
  else{pSel.value='ALL';window.filtPregrado='ALL';}
  window.AppState.filters.pregrado=window.filtPregrado;
}

