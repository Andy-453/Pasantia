/**
 * Vista: Formulario de programa (editor CRUD)
 * Dependencias runtime: AppData, AppState, editingProgId, tmpLineas, tmpMaes,
 *   uid (global), document.getElementById
 */

function renderProgForm(){
  var f=AppData.getFacultad(AppState.navigation.curFac),isNew=editingProgId==='__new__';
  var p=isNew?{id:uid(),n:'',sedes:[],lineas:[{id:uid(),l:'',t:'Profundización 1',esp:'',e:'',o:'V',sedes:[],resp:'',mes:null,ano:null}],mae:[{id:uid(),n:'',e:'',o:'P',sedes:[],resp:'',mes:null,ano:null}]}:f.progs.find(function(x){return x.id===editingProgId;});
  if(!p) return;
  if(!tmpLineas._progId||tmpLineas._progId!==p.id){
    tmpLineas=JSON.parse(JSON.stringify(p.lineas));tmpLineas._progId=p.id;
    tmpMaes=JSON.parse(JSON.stringify(p.mae));tmpMaes._progId=p.id;
  }
  var ES=['','Con registro Calificado','En oferta','Obtención','Radicado MEN','En radicación','Entregado para radicar','En construcción','Por construir','En proyección','Nueva Propuesta de la Facultad','En reclamación  MEN','Renovación','Renovación y modificación de la denominación','Negado MEN'];
  var MS=['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var AS=[2024,2025,2026,2027,2028];
  function eo(c){return ES.map(function(e){return '<option value="'+e+'"'+(e===c?' selected':'')+'>'+( e||'— Sin estado —')+'</option>';}).join('');}
  function mo(c){return '<option value="">— Mes —</option>'+MS.slice(1).map(function(m,i){return '<option value="'+(i+1)+'"'+((i+1)===c?' selected':'')+'>'+m+'</option>';}).join('');}
  function ao(c){return '<option value="">— Año —</option>'+AS.map(function(y){return '<option value="'+y+'"'+(y===c?' selected':'')+'>'+y+'</option>';}).join('');}
  var lH=tmpLineas.map(function(l){
    return '<div class="linea-card" id="lc'+l.id+'">'
      +'<button class="del-btn" data-action="del-linea" data-linea-id="'+l.id+'">🗑️ Quitar</button>'
      +'<div class="grid2"><div class="field"><label>Línea</label><input id="ll'+l.id+'" value="'+(l.l||'')+'" placeholder="Nombre de la línea"></div>'
      +'<div class="field"><label>Tipo</label><select id="lt'+l.id+'"><option'+(l.t==='Profundización 1'?' selected':'')+'>Profundización 1</option><option'+(l.t==='Profundización 2'?' selected':'')+'>Profundización 2</option></select></div></div>'
      +'<div class="grid2"><div class="field"><label>Especialización</label><input id="le'+l.id+'" value="'+(l.esp||'')+'" placeholder="Nombre"></div>'
      +'<div class="field"><label>Estado</label><select id="les'+l.id+'">'+eo(l.e)+'</select></div></div>'
      +'<div class="grid2"><div class="field"><label>Oferta</label><select id="lo'+l.id+'"><option value="V"'+(l.o==='V'?' selected':'')+'>Vigente</option><option value="P"'+(l.o==='P'?' selected':'')+'>Proyectada</option></select></div>'
      +'<div class="field"><label>👤 Responsable</label><input id="lresp'+l.id+'" value="'+(l.resp||'')+'" placeholder="Docente o equipo"></div></div>'
      +'<div class="grid3"><div class="field"><label>📅 Mes</label><select id="lmes'+l.id+'">'+mo(l.mes)+'</select></div>'
      +'<div class="field"><label>📅 Año</label><select id="lano'+l.id+'">'+ao(l.ano)+'</select></div><div class="field"><label>🔗 Enlace</label><input type="url" id="lenlace'+l.id+'" value="'+(l.enlaceObtencion||'')+'" placeholder="URL programa"></div></div>'
      +'</div>';
  }).join('');
  var mH=tmpMaes.map(function(m){
    return '<div class="linea-card" id="mc'+m.id+'">'
      +'<button class="del-btn" data-action="del-mae" data-mae-id="'+m.id+'">🗑️ Quitar</button>'
      +'<div class="grid2"><div class="field"><label>Maestría</label><input id="mn'+m.id+'" value="'+(m.n||'')+'" placeholder="Nombre"></div>'
      +'<div class="field"><label>Estado</label><select id="mes'+m.id+'">'+eo(m.e)+'</select></div></div>'
      +'<div class="grid2"><div class="field"><label>Oferta</label><select id="mo'+m.id+'"><option value="V"'+(m.o==='V'?' selected':'')+'>Vigente</option><option value="P"'+(m.o==='P'?' selected':'')+'>Proyectada</option></select></div>'
      +'<div class="field"><label>👤 Responsable</label><input id="mresp'+m.id+'" value="'+(m.resp||'')+'" placeholder="Docente o equipo"></div></div>'
      +'<div class="grid3"><div class="field"><label>📅 Mes</label><select id="mmes'+m.id+'">'+mo(m.mes)+'</select></div>'
      +'<div class="field"><label>📅 Año</label><select id="mano'+m.id+'">'+ao(m.ano)+'</select></div><div class="field"><label>🔗 Enlace</label><input type="url" id="menlace'+m.id+'" value="'+(m.enlaceObtencion||'')+'" placeholder="URL programa"></div></div>'
      +'</div>';
  }).join('');
  var h='<div class="modal-overlay"><div class="modal">'
    +'<div class="modal-title"><span>'+(isNew?'🆕':'✏️')+'</span>'+(isNew?'Nuevo programa':'Editar — '+p.n)+'</div>'
    +'<div class="form-section"><h3>Programa de pregrado</h3>'
      +'<div class="grid2"><div class="field"><label>Nombre</label><input id="pn" value="'+(p.n||'')+'" placeholder="Nombre del pregrado"></div>'
      +'<div class="field"><label>Sedes</label><input id="psedes" value="'+(p.sedes?p.sedes.join(', '):'')+'" placeholder="Ej: Fusagasugá, Chía"></div></div></div>'
    +'<div class="form-section"><h3>Líneas de profundización y especializaciones</h3>'
      +'<div id="lineas-container">'+lH+'</div>'
      +'<button data-action="add-linea" style="margin-top:6px;border-color:#006633;color:#006633">+ Agregar línea</button></div>'
    +'<div class="form-section"><h3>Maestrías</h3>'
      +'<div id="maes-container">'+mH+'</div>'
      +'<button data-action="add-mae" style="margin-top:6px;border-color:#C8A43A;color:#8a6d00">+ Agregar maestría</button></div>'
    +'<div class="modal-actions">'
      +'<button class="btn-green" data-action="save-prog" data-pid="'+p.id+'" data-is-new="'+(isNew?'true':'false')+'">💾 Guardar</button>'
      +'<button data-action="cancel-edit">Cancelar</button>'
      +(isNew?'':'<button class="btn-red" data-action="delete-prog" data-pid="'+p.id+'">🗑️ Eliminar</button>')
    +'</div></div></div>';
  document.getElementById('editor-content').innerHTML=h;
}

window.App = window.App || {};
window.App.renderProgForm = renderProgForm;
