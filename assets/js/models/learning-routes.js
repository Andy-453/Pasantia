// models/learning-routes.js — Persistencia de rutas de aprendizaje

var LR_STORAGE_KEY = 'udec_learning_routes';
var LR_META_KEY = 'udec_learning_routes_meta';
var LR_PRE_RESTORE_KEY = 'udec_learning_routes_pre_restore';

function _lrReadMeta(){
  try {
    var m = localStorage.getItem(LR_META_KEY);
    if(m){
      var p = JSON.parse(m);
      if(p && typeof p === 'object') return p;
    }
  } catch(e){}
  return null;
}

function _lrWriteMeta(meta){
  try {
    localStorage.setItem(LR_META_KEY, JSON.stringify(meta));
  } catch(e){}
}

function _lrBaseSource(){
  return window.__LEARNING_ROUTES_BASE_V2 || window.__LEARNING_ROUTES || {};
}

function _lrDeepCopy(obj){
  return JSON.parse(JSON.stringify(obj || {}));
}

function _seedFrom(source){
  window.__LEARNING_ROUTES = _lrDeepCopy(_normalizeRoutes(source));
  try {
    localStorage.setItem(LR_STORAGE_KEY, JSON.stringify(window.__LEARNING_ROUTES || {}));
    _lrWriteMeta({ schemaVersion:2, seededAt:new Date().toISOString(), lastSavedAt:new Date().toISOString(), recovered:false });
  } catch(e){}
}

function _recoverFromBase(source, notify){
  window.__LEARNING_ROUTES = _lrDeepCopy(_normalizeRoutes(source));
  if(_isReadOnlyExport()) return; // defensivo: nunca escribir en export read-only
  var meta = _lrReadMeta() || {};
  meta.schemaVersion = 2;
  meta.recovered = true;
  meta.recoveredAt = new Date().toISOString();
  meta.lastSavedAt = new Date().toISOString();
  try {
    localStorage.setItem(LR_STORAGE_KEY, JSON.stringify(window.__LEARNING_ROUTES || {}));
    _lrWriteMeta(meta);
  } catch(e){}
  if(notify) toast('⚠️ Tus rutas de aprendizaje se recuperaron desde el respaldo institucional porque se detectó un problema con tus datos guardados.');
}

function loadLearningRoutes(){
  if(!window.__LEARNING_ROUTES_DEFAULT){
    window.__LEARNING_ROUTES_DEFAULT = _lrDeepCopy(_normalizeRoutes(_lrBaseSource()));
  }
  var embedded = window.__EMBEDDED_LR;
  if(embedded && _isReadOnlyExport()){
    // Export de solo lectura: el snapshot embebido es la fuente, sin escrituras.
    window.__LEARNING_ROUTES = _normalizeRoutes(embedded);
    return;
  }
  // Export admin (__EMBEDDED_LR sin __EMBEDDED_DB) o app normal.
  var initialSource = embedded || window.__LEARNING_ROUTES_DEFAULT;
  var stored = localStorage.getItem(LR_STORAGE_KEY);
  var meta = _lrReadMeta();
  if(stored === null){
    if(meta){
      // Hubo datos y el valor desapareció → pérdida real.
      _recoverFromBase(initialSource, true);
    } else {
      // Primer arranque: siembra defaults + meta, sin notificación.
      _seedFrom(initialSource);
    }
    return;
  }
  try {
    var parsed = JSON.parse(stored);
    if(parsed && typeof parsed === 'object'){
      if(!Object.keys(parsed).length){
        // {} → el mapa fue vaciado → pérdida real.
        _recoverFromBase(initialSource, true);
        return;
      }
      var legacy = _hasFlatRoute(parsed);
      window.__LEARNING_ROUTES = _normalizeRoutes(parsed);
      if(legacy) saveLearningRoutes();
      else if(!meta) _lrWriteMeta({ schemaVersion:2, seededAt:null, lastSavedAt:null, recovered:false });
      return;
    }
  } catch(e){}
  // JSON corrupto → pérdida real.
  _recoverFromBase(initialSource, true);
}

function saveLearningRoutes(){
  if(_isReadOnlyExport())return;
  try {
    localStorage.setItem(LR_STORAGE_KEY, JSON.stringify(window.__LEARNING_ROUTES || {}));
    var meta = _lrReadMeta() || {};
    meta.schemaVersion = 2;
    meta.lastSavedAt = new Date().toISOString();
    _lrWriteMeta(meta);
  } catch(e){}
}

function _lrStorePreRestoreBackup(){
  try {
    localStorage.setItem(LR_PRE_RESTORE_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      routes: JSON.parse(JSON.stringify(window.__LEARNING_ROUTES || {}))
    }));
  } catch(e){}
}

function restoreLearningRoutesBackup(onDone){
  var raw = null;
  try { raw = localStorage.getItem(LR_PRE_RESTORE_KEY); } catch(e){}
  if(!raw){ toast('No hay respaldo previo de rutas'); return; }
  var data = null;
  try { data = JSON.parse(raw); } catch(e){}
  if(!data || !data.routes || typeof data.routes !== 'object' || !Object.keys(data.routes).length){
    toast('Respaldo previo no válido');
    return;
  }
  showConfirm('Recuperar rutas', '¿Restaurar las rutas previas al último "Restaurar por defecto"?', function(){
    window.__LEARNING_ROUTES = JSON.parse(JSON.stringify(data.routes));
    saveLearningRoutes();
    try { localStorage.removeItem(LR_PRE_RESTORE_KEY); } catch(e){}
    if(typeof _lrCancelDraft === 'function') _lrCancelDraft();
    toast('Rutas previas restauradas');
    if(onDone) onDone();
  });
}

function restoreDefaultRoutes(onDone){
  showConfirm('Restaurar rutas', '¿Restaurar rutas de aprendizaje por defecto? Se perderán los cambios personalizados.', function(){
    _lrStorePreRestoreBackup(); // R4: respaldo automático de las rutas actuales
    localStorage.removeItem(LR_STORAGE_KEY);
    if(window.__LEARNING_ROUTES_DEFAULT){
      window.__LEARNING_ROUTES = JSON.parse(JSON.stringify(window.__LEARNING_ROUTES_DEFAULT));
    }
    saveLearningRoutes();
    if(typeof _lrCancelDraft === 'function') _lrCancelDraft();
    toast('Rutas restauradas');
    if(onDone) onDone();
  });
}
