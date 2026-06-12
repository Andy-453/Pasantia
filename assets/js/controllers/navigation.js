/**
 * controllers/navigation.js — Navegación y orquestación de vistas
 * ---
 * Responsabilidad:
 *   - showTab: cambio de pestaña activa y renderizado de panel correspondiente
 *   - renderViews: renderizado inicial de árbol, tabla y sede
 *   - toggleSec: colapsar/expandir secciones (pipeline)
 *   - snSetFac, snSetProg: selección de facultad/programa en panel SNIES
 *   - openLearningRouteModal: apertura de modal de ruta de aprendizaje
 *
 * Dependencias:
 *   - AppState.navigation (app-state.js)
 *   - renderSNIES (views/snies.js)
 *   - renderPipeline (views/pipeline.js)
 *   - renderIndicadores (modules/indicators.js)
 *   - renderEditor (views/editor.js)
 *
 * Estado:
 *   Estable. Controlador de navegación entre vistas.
 */

function showTab(id){
  AppState.navigation.activeTab=id;
  ['arbol','tabla','sede','indicadores','snies','pipeline','editor','rc'].forEach(t=>{
    document.getElementById('panel-'+t).classList.toggle('act',t===id);
    document.getElementById('tb-'+t).classList.toggle('act',t===id);
  });
  if(id==='editor') renderEditor();
  if(id==='indicadores') renderIndicadores();
  if(id==='snies') renderSNIES();
  if(id==='pipeline') renderPipeline();
  if(id==='rc') renderRegistroCalificado();
}

function renderViews(){renderKPIs();renderTree();renderTabla();renderSedeView();}

function toggleSec(id){var el=document.getElementById(id),ic=document.getElementById('icon-'+id);if(!el)return;var open=el.style.display!=='none';el.style.display=open?'none':'block';if(ic)ic.textContent=open?'▾':'▸';}

function snSetFac(f){_snFac=f;_snProg=null;renderSNIES();}
function snSetProg(p){_snProg=p;renderSNIES();}

function openLearningRouteModal(espId){
  var route = (typeof espId === 'object' && espId) ? espId : (window.__LEARNING_ROUTES && window.__LEARNING_ROUTES[espId]);
  if(!route){ toast('Ruta no disponible'); return; }
  var overlay = document.createElement('div');
  overlay.id = 'lr-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,30,0,.45);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:2rem;overflow-y:auto';
  overlay.innerHTML = '<div class="modal-overlay" style="background:none;min-height:auto;padding:0;width:100%;max-width:960px">' + renderLearningRouteHTML(route) + '</div>';
  overlay.dataset.espId = typeof espId === 'string' ? espId : (espId.espId || '');
  document.body.appendChild(overlay);
  function _closeLR(){
    if(overlay.parentNode) document.body.removeChild(overlay);
  }
  overlay.addEventListener('click', function(e){
    if(e.target === overlay || e.target.classList.contains('modal-overlay')) _closeLR();
  });
  function _onKey(e){
    if(e.key === 'Escape'){ _closeLR(); document.removeEventListener('keydown', _onKey); }
  }
  document.addEventListener('keydown', _onKey);
  overlay.addEventListener('DOMNodeRemoved', function(){ document.removeEventListener('keydown', _onKey); });
}
