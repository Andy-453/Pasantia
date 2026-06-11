/**
 * controllers/actions.js — Delegación de eventos click/change
 * ---
 * Responsabilidad:
 *   - mapeo de data-action a funciones del sistema
 *   - __ACTIONS: registro central de acciones UI
 *   - __refreshAll: recarga completa de barra, sedes y vistas
 *
 * Dependencias:
 *   - Todos los renderers y controladores (navegación, editor, SNIES, etc.)
 *
 * Estado:
 *   Estable. Capa de enlace entre DOM (data-action) y lógica de negocio.
 */

function __refreshAll(){renderFacBar();populateSedes();renderViews();}

var __ACTIONS = {
  'show-tab': function(b){ showTab(b.dataset.tab); },
  'sel-fac':  function(b){ selFac(parseInt(b.dataset.fac,10)); __refreshAll();['indicadores','snies','pipeline','editor'].forEach(function(t){var el=document.getElementById('panel-'+t);if(el&&el.classList.contains('act'))showTab(t);}); },
  'reset-filters': function(){ resetFilters(); },
  'snies-set-fac': function(b){ snSetFac(b.dataset.fac); },
  'snies-set-prog': function(b){ snSetProg(b.dataset.prog); },
  'toggle-section': function(b){ toggleSec(b.dataset.secId); },
  'download-html': function(){ downloadHTML(); },
  'print': function(){ window.print(); },
  'reset-db': function(){ resetDB(); },
  'open-edit-prog': function(b){ showTab('editor'); openEditProg(b.dataset.pid); },
  'del-linea': function(b){ delLinea(b.dataset.lineaId); },
  'del-mae': function(b){ delMae(b.dataset.maeId); },
  'add-linea': function(){ addLinea(); },
  'add-mae': function(){ addMae(); },
  'save-prog': function(b){ saveProg(b.dataset.pid, b.dataset.isNew === 'true'); },
  'cancel-edit': function(){ cancelEdit(); },
  'delete-prog': function(b){ deleteProg(b.dataset.pid); },
  'save-doc': function(){ saveDoc(); },
  'toggle-doc-form': function(){ toggleDocForm(); },
  'open-new-prog': function(){ openNewProg(); },
  'open-edit-fac': function(){ openEditFac(); },
  'open-new-fac': function(){ openNewFac(); },
  'save-fac': function(b){ saveFac(b.dataset.isNew === 'true'); },
  'delete-fac': function(){ deleteFac(); },
  'open-program-link': function(b){
    var url = b.getAttribute('data-url');
    if(url) window.open(url, '_blank', 'noopener,noreferrer');
  },
  'show-learning-route': function(b){
    openLearningRouteModal(b.dataset.espId);
  },
  'close-lr-modal': function(){
    var o = document.getElementById('lr-modal-overlay');
    if(o) document.body.removeChild(o);
  },
  'edit-lr-from-modal': function(){
    var overlay = document.getElementById('lr-modal-overlay');
    if(!overlay) return;
    var espId = overlay.dataset.espId;
    if(!espId || !window.__LEARNING_ROUTES[espId]){ toast('Ruta no disponible para edición'); return; }
    document.body.removeChild(overlay);
    showTab('editor');
    _lrSetTab('rutas');
    _lrEditRoute(espId);
  },
  // ===== Editor de rutas =====
  'lr-set-tab': function(b){ _lrSetTab(b.dataset.tab); },
  'lr-edit-route': function(b){ _lrEditRoute(b.dataset.espId); },
  'lr-delete-route': function(b){ _lrDeleteRoute(b.dataset.espId); },
  'create-route-for-prog': function(b){
    _lrEditRoute(b.dataset.progId, {name:b.dataset.progName, type:b.dataset.progType});
  },
  'lr-back-to-list': function(){ _lrEditingId=null;renderEditor(); },
  'lr-add-semester': function(){ _lrAddSemester(); },
  'lr-delete-semester': function(b){ _lrDeleteSemester(parseInt(b.dataset.si,10)); },
  'lr-add-subject': function(b){ _lrAddSubject(parseInt(b.dataset.si,10)); },
  'lr-delete-subject': function(b){ _lrDeleteSubject(parseInt(b.dataset.si,10),parseInt(b.dataset.ji,10)); },
  'lr-save-route': function(b){ _lrSaveRoute(b.dataset.espId); },
  'lr-preview-route': function(b){ _lrPreviewRoute(b.dataset.espId); },
  'restore-default-routes': function(){ restoreDefaultRoutes(function(){ renderEditor(); }); },
};
document.addEventListener('click', function(e){
  var b = e.target.closest('[data-action]');
  if(!b) return;
  var fn = __ACTIONS[b.getAttribute('data-action')];
  if(fn) fn(b);
});
var __CHANGE = {
  'apply-filters': function(){ applyFilters(); },
  'lr-update-sem-credits': function(b){
    var sem = b.closest('.lr-semester');
    if(!sem) return;
    var total = 0;
    sem.querySelectorAll('.lr-subj-credits').forEach(function(i){ total += parseInt(i.value)||0; });
    var display = sem.querySelector('.lr-sem-credits-display');
    if(display) display.textContent = total;
    _lrRecalcCredits();
  },
};
document.addEventListener('change', function(e){
  var b = e.target.closest('[data-action]');
  if(!b) return;
  var fn = __CHANGE[b.getAttribute('data-action')];
  if(fn) fn(b);
});
