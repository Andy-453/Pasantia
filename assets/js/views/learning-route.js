/**
 * Vista: Ruta de Aprendizaje (modal)
 * Extraída de app.js para separación MVC.
 * Dependencias runtime: _getTypeLabel (app.js helper), window.__LEARNING_ROUTES
 */

/**
 * Renderiza el HTML de una ruta de aprendizaje como modal.
 * @param {Object} route - Objeto de ruta con {semesters, espName, type, espId}
 * @returns {string} HTML del modal de ruta de aprendizaje
 */
function renderLearningRouteHTML(route){
  var sems = route.semesters || [];
  var n = sems.length;
  if(!n) return '<div class="modal" style="max-width:400px"><div class="modal-actions" style="border:none"><button data-action="close-lr-modal">Cerrar</button></div></div>';

  var totalCredits = sems.reduce(function(t,s){
    return t + (s.subjects||[]).reduce(function(tt,sj){ return tt + (sj.credits||0); }, 0);
  }, 0);
  var semCount = n;
  var typeLabel=_getTypeLabel(route.type||'especializacion');
  var espCard = '<div class="node node-espec" style="min-width:260px;max-width:380px;width:100%">'
    + '<div class="node-stripe"></div>'
    + '<div class="node-body">'
    + '<div class="node-label">'+typeLabel+'</div>'
    + '<div class="node-title" style="font-size:11px">'+route.espName+'</div>'
    + '<div style="margin-top:7px;padding-top:7px;border-top:1px solid #e8f2ec;font-size:10px;color:#666">'
    + totalCredits+' créditos &middot; '+semCount+' semestre'+(semCount>1?'s':'')
    + '</div></div></div>';

  var connectorHtml = '<div class="route-connector"><div class="connector-line"></div><div class="connector-dot"></div><div class="connector-bar"></div></div>';

  var semCols = sems.map(function(sem){
    var semCredits = (sem.subjects||[]).reduce(function(t,sj){ return t + (sj.credits||0); }, 0);
    var semCard = '<div class="node" style="width:100%;background:#fffdf0;box-shadow:0 2px 8px rgba(200,164,58,0.10);border-radius:8px;overflow:hidden;cursor:default">'
      + '<div class="node-stripe" style="background:var(--udec-gold);height:3px"></div>'
      + '<div class="node-body" style="padding:8px 10px 9px">'
      + '<div class="node-label" style="color:var(--udec-gold);margin-bottom:2px">'+sem.title+'</div>'
      + '<div class="node-title" style="font-size:10px;color:#8a6d00;font-weight:600">'+sem.type+' &middot; '+semCredits+' crédito'+(semCredits>1?'s':'')+'</div>'
      + '</div></div>';

    var subjectCards = sem.subjects.map(function(subj){
      var pillColor = subj.credits <= 1
        ? 'background:#f0f7f2;color:#006633;border:1px solid #b0d4be'
        : 'background:#e8f0fb;color:#1a5cb0;border:1px solid #b0c8e8';
      var homoBadge = subj.homologa
        ? '<span class="badge" style="background:#e6f2eb;color:#006633;border:1px solid #b0d4be;padding:1px 5px;font-size:7px;margin-top:0">\u2713 Homologa</span>'
        : '';
      return '<div class="subj-card">'
        + '<div class="subj-stripe"></div>'
        + '<div class="subj-body">'
        + '<div class="subj-name">'+(subj.resourceUrl
          ? '<a href="'+subj.resourceUrl+'" target="_blank" rel="noopener noreferrer" style="color:#185FA5;text-decoration:underline;cursor:pointer">'+subj.title+'</a>'
          : subj.title)+'</div>'
        + '<div class="subj-meta">'
        + '<span class="pill" style="'+pillColor+';margin-bottom:0;font-size:7px;padding:1px 5px">'+subj.credits+' cr</span>'
        + homoBadge
        + '</div></div></div>';
    }).join('<div style="width:2px;height:6px;background:#e0ece4;flex-shrink:0;align-self:center"></div>');

    return '<div class="semester-col">'
      + '<div style="width:2.5px;height:12px;background:#8fb8a0;flex-shrink:0;margin:0 auto;border-radius:1px"></div>'
      + semCard
      + '<div style="width:2px;height:8px;background:#e0ece4;flex-shrink:0;margin:0 auto"></div>'
      + subjectCards
      + '</div>';
  }).join('');

  var _lr = window.__LEARNING_ROUTES;
  var editBtn = (_lr && _lr[route.espId])
    ? '<button data-action="edit-lr-from-modal" style="background:none;border:1px solid #d0e4d8;border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer;color:#006633;display:flex;align-items:center;gap:4px;white-space:nowrap;margin-left:auto" title="Editar esta ruta">\u270f\ufe0f Editar</button>'
    : '';

  return '<div class="modal" style="max-width:960px">'
    + '<div class="modal-title" style="display:flex;align-items:center">'
    + '<span>\uD83D\uDCCB</span><span style="flex:1">Ruta de Aprendizaje</span>'
    + editBtn
    + '</div>'
    + '<div class="route-tree-wrap">'
    + '<div class="route-tree-container">'
    + espCard
    + connectorHtml
    + '<div class="semesters-grid">'
    + semCols
    + '</div></div></div>'
    + '<div class="modal-actions"><button data-action="close-lr-modal">Cerrar</button></div>'
    + '</div>';
}

// Exponer para app.js y showTab
window.App = window.App || {};
window.App.renderLearningRouteHTML = renderLearningRouteHTML;
