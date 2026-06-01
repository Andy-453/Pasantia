// ===== FILTERS =====
function sedeMatch(s){return filtSede==='ALL'||s&&s.includes(filtSede);}
function ofertaMatch(o){return filtOferta==='ALL'||(filtOferta==='V'&&o==='V')||(filtOferta==='P'&&o==='P');}
function estadoMatch(e){if(filtEstado==='ALL')return true;return getSt(e).cat===filtEstado;}
function nivelMatch(n){return filtNivel==='ALL'||filtNivel===n;}
function pregradoMatch(pn){return filtPregrado==='ALL'||pn===filtPregrado;}
function itemMatch(item,nivel){return nivelMatch(nivel)&&ofertaMatch(item.o)&&estadoMatch(item.e)&&sedeMatch(item.sedes);}

function applyFilters(){
  filtSede=document.getElementById('filt-sede').value;
  filtPregrado=document.getElementById('filt-pregrado').value;
  filtOferta=document.getElementById('filt-oferta').value;
  filtEstado=document.getElementById('filt-estado').value;
  filtNivel=document.getElementById('filt-nivel').value;
  renderViews();
}
function resetFilters(){
  filtSede=filtOferta=filtEstado=filtNivel=filtPregrado='ALL';
  ['filt-sede','filt-oferta','filt-estado','filt-nivel','filt-pregrado'].forEach(function(id){document.getElementById(id).value='ALL';});
  renderViews();
}

function populateSedes(){
  var f=DB[curFac];
  var s=new Set();
  f.progs.forEach(function(p){p.sedes.forEach(function(x){s.add(x);});});
  var sel=document.getElementById('filt-sede');
  sel.innerHTML='<option value="ALL">Todas las sedes</option>';
  ALL_SEDES.filter(function(x){return s.has(x);}).forEach(function(x){sel.innerHTML+='<option value="'+x+'">'+x+'</option>';});
  if(filtSede!=='ALL'&&!s.has(filtSede)) filtSede='ALL';
  sel.value=filtSede;

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
  if(prevPregrado!=='ALL'&&seen.has(prevPregrado)){pSel.value=prevPregrado;filtPregrado=prevPregrado;}
  else{pSel.value='ALL';filtPregrado='ALL';}
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
