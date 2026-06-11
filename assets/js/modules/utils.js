/**
 * utils.js — utilidades globales
 * ---
 * Responsabilidad:
 *   - mapa de colores de estado (ST_MAP / getSt)
 *   - helpers de UI: confirm, toast, uid, gv, gi
 *   - badge de oferta (pll)
 *
 * Dependencias:
 *   - Ninguna (nivel base, primer módulo en carga)
 *
 * Estado:
 *   Estable. Sin dependencias externas.
 */
function showConfirm(t,m,ok){var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';o.innerHTML='<div style="background:#fff;border-radius:12px;padding:24px 28px;max-width:400px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,.2)"><div style="font-size:15px;font-weight:700;color:#1a2e1a;margin-bottom:8px">'+t+'</div><div style="font-size:12px;color:#555;margin-bottom:20px">'+m+'</div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="__cc" style="padding:8px 18px;border-radius:8px;border:1px solid #ddd;background:#fff;color:#555;cursor:pointer">Cancelar</button><button id="__co" style="padding:8px 18px;border-radius:8px;border:none;background:#c0392b;color:#fff;font-weight:700;cursor:pointer">Eliminar</button></div></div>';document.body.appendChild(o);document.getElementById('__cc').onclick=function(){document.body.removeChild(o);};document.getElementById('__co').onclick=function(){document.body.removeChild(o);ok();};o.onclick=function(e){if(e.target===o)document.body.removeChild(o);};}

// ===== COLORES DE ESTADO =====
var ST_MAP={
  'obtención':{dot:'#1D9E75',bg:'#E1F5EE',tx:'#085041',cat:'obtención'},
  'con registro calificado':{dot:'#1D9E75',bg:'#E1F5EE',tx:'#085041',cat:'obtención'},
  'en oferta':{dot:'#1D9E75',bg:'#E1F5EE',tx:'#085041',cat:'obtención'},
  'obtención-resignificación':{dot:'#1D9E75',bg:'#E1F5EE',tx:'#085041',cat:'obtención'},
  'radicado men':{dot:'#378ADD',bg:'#E6F1FB',tx:'#0C447C',cat:'radicado'},
  'en radicación':{dot:'#378ADD',bg:'#E6F1FB',tx:'#0C447C',cat:'radicado'},
  'entregado para radicar':{dot:'#378ADD',bg:'#E6F1FB',tx:'#0C447C',cat:'radicado'},
  'en construcción':{dot:'#BA7517',bg:'#FAEEDA',tx:'#633806',cat:'construcción'},
  'por construir':{dot:'#BA7517',bg:'#FAEEDA',tx:'#633806',cat:'construcción'},
  'en proyección':{dot:'#BA7517',bg:'#FAEEDA',tx:'#633806',cat:'construcción'},
  'nueva propuesta de la facultad':{dot:'#BA7517',bg:'#FAEEDA',tx:'#633806',cat:'construcción'},
  'pendiente en resolución':{dot:'#D85A30',bg:'#FAECE7',tx:'#4A1B0C',cat:'reclamación'},
  'pendiante en resolución':{dot:'#D85A30',bg:'#FAECE7',tx:'#4A1B0C',cat:'reclamación'},
  'en reclamación  men':{dot:'#D85A30',bg:'#FAECE7',tx:'#4A1B0C',cat:'reclamación'},
  'en reclamación men':{dot:'#D85A30',bg:'#FAECE7',tx:'#4A1B0C',cat:'reclamación'},
  'renovación':{dot:'#D85A30',bg:'#FAECE7',tx:'#4A1B0C',cat:'reclamación'},
  'renovación y modificación de la denominación':{dot:'#D85A30',bg:'#FAECE7',tx:'#4A1B0C',cat:'reclamación'},
  'negado men':{dot:'#A32D2D',bg:'#FCEBEB',tx:'#501313',cat:'negado'},
};
function getSt(s){
  if(!s||!s.trim()) return {dot:'#aaa',bg:'#f5f5f0',tx:'#666',cat:''};
  var k=s.trim().toLowerCase();
  for(var key in ST_MAP){if(k.includes(key)||key.includes(k))return ST_MAP[key];}
  return {dot:'#aaa',bg:'#f5f5f0',tx:'#666',cat:''};
}
function pll(o){return o==='V'?'<span class="pill pv">Vigente</span>':'<span class="pill pp">Proyectada</span>';}
function uid(){return 'id'+Date.now()+Math.random().toString(36).slice(2,5);}
function gv(id){var e=document.getElementById(id);return e?e.value:'';}
function gi(id){var v=parseInt(gv(id));return isNaN(v)||v===0?null:v;}
function toast(msg){
  var t=document.getElementById('toast');t.textContent=msg;t.style.display='block';
  setTimeout(function(){t.style.display='none';},2500);
}

function _getObtencionUrl(e, item){
  if(!item || !item.enlaceObtencion) return '';
  if(!(e||'').toLowerCase().includes('obtención')) return '';
  var url = item.enlaceObtencion.trim();
  if(url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) return '';
  return url;
}
function _hasLR(id){
  return !!(window.__LEARNING_ROUTES && window.__LEARNING_ROUTES[id]);
}

function _getTypeLabel(type){
  var map={especializacion:'Especialización',maestria:'Maestría',doctorado:'Doctorado'};
  return map[type]||'Programa';
}
function _getTypeBadge(type){
  var labels={especializacion:{label:'Esp.',color:'#3aaa72',bg:'#e8f5ee'},
              maestria:{label:'Mae.',color:'#C8A43A',bg:'#faf3e0'},
              doctorado:{label:'Doc.',color:'#0d3d22',bg:'#d4e8da'}};
  var l=labels[type]||labels.especializacion;
  return '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700;background:'+l.bg+';color:'+l.color+'">'+l.label+'</span>';
}
function _getAllAcademicPrograms(){
  var list=[];
  AppData.getFacultades().forEach(function(f){
    if(f.doc){
      list.push({id:'doc-'+f.id,type:'doctorado',name:f.doc.n, facName:f.name, sedes:f.doc.sedes||[], enlaceObtencion:f.doc.enlaceObtencion||null});
    }
    f.progs.forEach(function(p){
      (p.mae||[]).forEach(function(m){
        list.push({id:m.id,type:'maestria',name:m.n, facName:f.name, progName:p.n, sedes:m.sedes});
      });
      (p.lineas||[]).forEach(function(l){
        list.push({id:l.id,type:'especializacion',name:l.esp, facName:f.name, progName:p.n, lineaName:l.l, sedes:l.sedes});
      });
    });
  });
  return list;
}

