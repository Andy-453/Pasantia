// ===== FILTERS =====
function sedeMatch(s){return window.filtSede==='ALL'||s&&s.includes(window.filtSede);}
function ofertaMatch(o){return window.filtOferta==='ALL'||(window.filtOferta==='V'&&o==='V')||(window.filtOferta==='P'&&o==='P');}
function estadoMatch(e){if(window.filtEstado==='ALL')return true;return getSt(e).cat===window.filtEstado;}
function nivelMatch(n){return window.filtNivel==='ALL'||window.filtNivel===n;}
function pregradoMatch(pn){return window.filtPregrado==='ALL'||pn===window.filtPregrado;}
function itemMatch(item,nivel){return nivelMatch(nivel)&&ofertaMatch(item.o)&&estadoMatch(item.e)&&sedeMatch(item.sedes);}

function applyFilters(){
  window.filtSede=document.getElementById('filt-sede').value;
  window.filtPregrado=document.getElementById('filt-pregrado').value;
  window.filtOferta=document.getElementById('filt-oferta').value;
  window.filtEstado=document.getElementById('filt-estado').value;
  window.filtNivel=document.getElementById('filt-nivel').value;
  renderViews();
}
function resetFilters(){
  window.filtSede=window.filtOferta=window.filtEstado=window.filtNivel=window.filtPregrado='ALL';
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
}

// ===== GLOBAL COMPATIBILITY =====
window.sedeMatch=sedeMatch;
window.ofertaMatch=ofertaMatch;
window.estadoMatch=estadoMatch;
window.nivelMatch=nivelMatch;
window.pregradoMatch=pregradoMatch;
window.itemMatch=itemMatch;
window.applyFilters=applyFilters;
window.resetFilters=resetFilters;
window.populateSedes=populateSedes;
