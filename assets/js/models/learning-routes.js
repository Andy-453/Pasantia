// models/learning-routes.js — Persistencia de rutas de aprendizaje

var LR_STORAGE_KEY = 'udec_learning_routes';

function loadLearningRoutes(){
  if(!window.__LEARNING_ROUTES_DEFAULT){
    window.__LEARNING_ROUTES_DEFAULT = _normalizeRoutes(window.__LEARNING_ROUTES || {});
  }
  if(window.__EMBEDDED_LR){
    window.__LEARNING_ROUTES = _normalizeRoutes(window.__EMBEDDED_LR);
    return;
  }
  var stored = localStorage.getItem(LR_STORAGE_KEY);
  if(stored){
    try {
      var parsed = JSON.parse(stored);
      if(parsed && typeof parsed === 'object'){
        var legacy = _hasFlatRoute(parsed);
        window.__LEARNING_ROUTES = _normalizeRoutes(parsed);
        if(legacy) saveLearningRoutes();
        return;
      }
    } catch(e){}
  }
  window.__LEARNING_ROUTES = JSON.parse(JSON.stringify(window.__LEARNING_ROUTES_DEFAULT));
}

function saveLearningRoutes(){
  if(window.__EMBEDDED_DB)return;
  try {
    localStorage.setItem(LR_STORAGE_KEY, JSON.stringify(window.__LEARNING_ROUTES || {}));
  } catch(e){}
}

function restoreDefaultRoutes(onDone){
  showConfirm('Restaurar rutas', '¿Restaurar rutas de aprendizaje por defecto? Se perderán los cambios personalizados.', function(){
    localStorage.removeItem(LR_STORAGE_KEY);
    if(window.__LEARNING_ROUTES_DEFAULT){
      window.__LEARNING_ROUTES = JSON.parse(JSON.stringify(window.__LEARNING_ROUTES_DEFAULT));
    }
    saveLearningRoutes();
    toast('Rutas restauradas');
    if(onDone) onDone();
  });
}
