// ===== EDITOR CON SELECTOR DE FACULTAD =====
// Versión ACTIVA — sombrea a renderEditor legacy.
// TODO [MVC]: unificar con la implementación legacy en Fase 3.

var _lrEditingId;
var _lrEditorTab = 'programas';

function renderEditor(){
  var f=AppData.getFacultad(AppState.navigation.curFac);
  function cbs(items){var v=0,p=0,c=0;items.forEach(function(x){var e=(x.e||'').toLowerCase();if(e.includes('obtención')||e.includes('registro')||e.includes('oferta'))v++;else if(e.includes('construcción')||e.includes('radicado')||e.includes('radicación'))c++;else p++;});return{v:v,p:p,c:c};}
  var _tab=window._lrEditorTab||'programas';
  var h='<div style="padding:1rem">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:8px"><div style="font-size:14px;font-weight:700;color:#006633;display:flex;align-items:center;gap:8px"><span style="width:4px;height:20px;background:#006633;border-radius:2px;display:inline-block"></span>Editor de datos</div><div style="display:flex;gap:6px;flex-wrap:wrap">'+(_tab==='rutas'?'<!-- Crear ruta desde secci\u00f3n Sin ruta -->':'<button class="btn-green" data-action="open-new-prog">+ Nuevo programa</button><button data-action="open-edit-fac">\u270f\ufe0f Editar facultad</button><button data-action="open-new-fac">+ Nueva facultad</button>')+'</div></div>';
  h+='<div style="display:flex;gap:0;margin-bottom:1rem;border-bottom:2px solid #e0ece4"><button data-action="lr-set-tab" data-tab="programas" style="padding:8px 16px;font-size:11px;font-weight:700;border:none;background:none;cursor:pointer;color:'+(_tab==='programas'?'#006633':'#999')+';border-bottom:2px solid '+(_tab==='programas'?'#006633':'transparent')+';margin-bottom:-2px">\ud83d\udccb Programas</button><button data-action="lr-set-tab" data-tab="rutas" style="padding:8px 16px;font-size:11px;font-weight:700;border:none;background:none;cursor:pointer;color:'+(_tab==='rutas'?'#006633':'#999')+';border-bottom:2px solid '+(_tab==='rutas'?'#006633':'transparent')+';margin-bottom:-2px">\ud83d\uddfa\ufe0f Rutas de aprendizaje</button></div>';
  if(_tab==='rutas'){h+=_lrRenderList();h+='</div>';document.getElementById('editor-content').innerHTML=h;return;}
  var facBtns=AppData.getFacultades().map(function(fac,i){var a=i===curFac;return '<button data-action="sel-fac" data-fac="'+i+'" style="padding:6px 14px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;border:1.5px solid '+(a?'#006633':'#d0e4d8')+';background:'+(a?'#006633':'#fff')+';color:'+(a?'#fff':'#555')+'">'+fac.name.replace('Facultad de ','').replace('Facultad ','').split(',')[0].trim()+'</button>';}).join('');
  h+='<div style="background:#fff;border-radius:10px;border:1px solid #e0ece4;padding:12px 16px;margin-bottom:1rem"><div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#999;margin-bottom:8px">Selecciona la facultad</div><div style="display:flex;gap:7px;flex-wrap:wrap">'+facBtns+'</div></div>';
  h+='<div style="background:#006633;border-radius:10px;padding:10px 16px;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between"><div style="font-size:12px;font-weight:700;color:#fff">'+f.name+'</div><div style="font-size:10px;color:rgba(255,255,255,.7)">'+f.progs.length+' programa(s)</div></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;margin-bottom:1.5rem">';
  f.progs.forEach(function(p){
    var st=cbs(p.lineas.concat(p.mae));
    var cr=p.lineas.concat(p.mae).filter(function(x){return x.resp;}).length;
    h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden">'
      +'<div style="background:#006633;padding:11px 14px;display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:12px;font-weight:700;color:#fff">'+p.n+'</div><div style="font-size:9px;color:rgba(255,255,255,.65);margin-top:2px">'+p.lineas.length+' especializaci\u00f3n(es) \u00b7 '+p.mae.length+' maestr\u00eda(s)</div></div><div style="font-size:15px">\ud83c\udf93</div></div>'
      +'<div style="padding:10px 14px">'
        +'<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">'
          +(st.v?'<span style="background:#e6f2eb;color:#006633;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700">\u2705 '+st.v+' vigente</span>':'')
          +(st.c?'<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700">\ud83d\udd27 '+st.c+' en proceso</span>':'')
          +(st.p?'<span style="background:#fffbeb;color:#d97706;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700">\ud83d\udcdd '+st.p+' por construir</span>':'')
          +(cr?'<span style="background:#e6f0fb;color:#185FA5;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700">\ud83d\udc64 '+cr+' con responsable</span>':'<span style="background:#f5f5f5;color:#aaa;padding:2px 8px;border-radius:8px;font-size:9px">Sin responsable</span>')
        +'</div>'
        +'<div style="font-size:10px;color:#666;margin-bottom:10px">'
          +p.lineas.slice(0,3).map(function(l){return '<div style="padding:3px 0;border-bottom:1px solid #f5f5f5;display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:#3aaa72;flex-shrink:0;display:inline-block"></span><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+l.esp+'</span>'+(l.mes&&l.ano?'<span style="font-size:8px;color:#185FA5;white-space:nowrap">'+['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][l.mes]+' '+l.ano+'</span>':'')+'</div>';}).join('')
          +(p.lineas.length>3?'<div style="color:#aaa;font-size:9px;padding-top:3px">+ '+(p.lineas.length-3)+' m\u00e1s...</div>':'')
          +p.mae.slice(0,2).map(function(m){return '<div style="padding:3px 0;border-bottom:1px solid #f5f5f5;display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:#C8A43A;flex-shrink:0;display:inline-block"></span><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+m.n+'</span>'+(m.mes&&m.ano?'<span style="font-size:8px;color:#185FA5;white-space:nowrap">'+['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][m.mes]+' '+m.ano+'</span>':'')+'</div>';}).join('')
        +'</div>'
        +'<div style="display:flex;gap:6px"><button data-pid="'+p.id+'" data-action="open-edit-prog" style="flex:1;background:#006633;color:#fff;border:none;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer">\u270f\ufe0f Editar programa</button><button data-pid="'+p.id+'" data-action="delete-prog" style="background:#fee2e2;color:#c0392b;border:1px solid #fca5a5;border-radius:8px;padding:8px 12px;font-size:11px;font-weight:700;cursor:pointer" title="Eliminar">\ud83d\uddd1\ufe0f</button></div>'
      +'</div></div>';
  });
  h+='</div>';
  // Doctorado colapsable
  h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden;margin-bottom:1rem">'
    +'<div style="background:#0d3d22;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer" data-action="toggle-doc-form">'
      +'<div style="display:flex;align-items:center;gap:10px"><span style="font-size:16px"></span><div><div style="font-size:12px;font-weight:700;color:#fff">Doctorado de la facultad</div><div style="font-size:10px;color:rgba(200,164,58,.8);margin-top:1px">'+(f.doc?f.doc.n:'Sin doctorado \u2014 haz clic para agregar')+'</div></div></div>'
      +'<span id="doc-toggle-icon" style="color:#C8A43A;font-size:18px;font-weight:700">\u25b8</span>'
    +'</div>'
    +'<div id="doc-form-body" style="padding:16px;display:none">'
      +'<div class="grid2" style="margin-bottom:10px"><div class="field"><label>Nombre del doctorado</label><input id="doc-name" value="'+(f.doc?f.doc.n:'')+'" placeholder="Nombre del doctorado"></div><div class="field"><label>Estado actual</label><input id="doc-estado" value="'+(f.doc?f.doc.e:'')+'" placeholder="Ej: En construcci\u00f3n"></div></div>'
      +'<div class="grid2" style="margin-bottom:10px"><div class="field"><label>Tipo de oferta</label><select id="doc-oferta"><option value="V" '+(f.doc&&f.doc.o==='V'?'selected':'')+'>Vigente</option><option value="P" '+(!f.doc||f.doc.o==='P'?'selected':'')+'>Proyectada</option></select></div><div class="field"><label>\ud83d\udc64 Responsable</label><input id="doc-resp" value="'+(f.doc&&f.doc.resp?f.doc.resp:'')+'" placeholder="Docente o equipo"></div></div>'
      +'<div class="grid2" style="margin-bottom:12px"><div class="field"><label>\ud83d\udcc5 Mes inicio</label><select id="doc-mes"><option value="">\u2014 Mes \u2014</option>'+['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map(function(m,i){return '<option value="'+(i+1)+'" '+(f.doc&&f.doc.mes===(i+1)?'selected':'')+'>'+m+'</option>';}).join('')+'</select></div><div class="field"><label>\ud83d\udcc5 A\u00f1o inicio</label><select id="doc-ano"><option value="">\u2014 A\u00f1o \u2014</option>'+[2024,2025,2026,2027,2028].map(function(y){return '<option value="'+y+'" '+(f.doc&&f.doc.ano===y?'selected':'')+'>'+y+'</option>';}).join('')+'</select></div></div>'
      +'<div class="grid2" style="margin-bottom:12px"><div class="field"><label>\ud83d\udd17 Enlace</label><input type="url" id="doc-enlace" value="'+(f.doc&&f.doc.enlaceObtencion?f.doc.enlaceObtencion:'')+'" placeholder="URL del programa"></div><div class="field"></div></div>'
      +'<button class="btn-green" data-action="save-doc">\ud83d\udcbe Guardar doctorado</button>'
    +'</div>'
  +'</div>';
  h+='</div>';
  document.getElementById('editor-content').innerHTML=h;
}
function toggleDocForm(){var b=document.getElementById('doc-form-body'),ic=document.getElementById('doc-toggle-icon');if(!b)return;var o=b.style.display!=='none';b.style.display=o?'none':'block';if(ic)ic.textContent=o?'\u25be':'\u25b8';}
function saveDoc(){
  var n=document.getElementById('doc-name').value.trim();
  if(!n){AppData.saveDocumento(curFac,null);}
  else{
    var mes=parseInt(document.getElementById('doc-mes').value)||null;
    var ano=parseInt(document.getElementById('doc-ano').value)||null;
    AppData.saveDocumento(curFac,{n:n,e:document.getElementById('doc-estado').value.trim(),o:document.getElementById('doc-oferta').value,sedes:[],resp:document.getElementById('doc-resp')?document.getElementById('doc-resp').value.trim():'',mes:mes,ano:ano,enlaceObtencion:document.getElementById('doc-enlace')?document.getElementById('doc-enlace').value.trim():null});
  }
    toast('Doctorado guardado');__refreshAll();renderEditor();
}
function deleteFac(){
  var f=AppData.getFacultad(curFac);
  showConfirm('¿Eliminar facultad?','Se eliminará <strong>'+(f?f.name:'')+'</strong> y todos sus programas.',function(){
    AppData.deleteFacultad(curFac);curFac=Math.max(0,curFac-1);
    toast('Facultad eliminada');__refreshAll();renderEditor();
  });
}
function openNewFac(){
  document.getElementById('editor-content').innerHTML='<div class="modal-overlay"><div class="modal"><div class="modal-title"><span>\u2795</span>Nueva facultad</div><div class="form-section"><div class="field"><label>Nombre de la facultad</label><input id="fac-name" placeholder="Ej: Facultad de Ingenier\u00eda"></div></div><div class="modal-actions"><button class="btn-green" data-action="save-fac" data-is-new="true">\u2795 Crear facultad</button><button data-action="cancel-edit">Cancelar</button></div></div></div>';
}
function openEditFac(){
  var f=AppData.getFacultad(curFac);
  document.getElementById('editor-content').innerHTML='<div class="modal-overlay"><div class="modal"><div class="modal-title"><span>\u270f\ufe0f</span>Editar facultad</div><div class="form-section"><div class="field"><label>Nombre de la facultad</label><input id="fac-name" value="'+(f?f.name:'')+'"></div></div><div class="modal-actions"><button class="btn-green" data-action="save-fac" data-is-new="false">\ud83d\udcbe Guardar</button><button data-action="cancel-edit">Cancelar</button><button class="btn-red" data-action="delete-fac">\ud83d\uddd1\ufe0f Eliminar facultad</button></div></div></div>';
}
function saveFac(isNew){
  var n=document.getElementById('fac-name').value.trim();
  if(!n){toast('Escribe el nombre de la facultad');return;}
  if(isNew){AppData.saveFacultad({name:n,progs:[],doc:null},true);curFac=AppData.getFacultadCount()-1;}
  else{AppData.updateFacultadName(curFac,n);}
    toast('Facultad guardada');__refreshAll();renderEditor();
}
function openNewProg(){editingProgId='__new__';tmpLineas=[];tmpMaes=[];renderProgForm();}
function openEditProg(pid){editingProgId=pid;if(!tmpLineas._progId||tmpLineas._progId!==pid){tmpLineas=[];tmpMaes=[];}renderProgForm();}

function addLinea(){collectLineas();collectMaes();var pid=tmpLineas._progId;tmpLineas.push({id:uid(),l:'',t:'Profundización 1',esp:'',e:'',o:'P',sedes:[],resp:'',mes:null,ano:null,enlaceObtencion:null});tmpLineas._progId=pid;renderProgForm();}
function delLinea(lid){collectLineas();collectMaes();var pid=tmpLineas._progId;tmpLineas=tmpLineas.filter(function(l){return l.id!==lid;});tmpLineas._progId=pid;renderProgForm();}
function addMae(){collectLineas();collectMaes();var pid=tmpMaes._progId;tmpMaes.push({id:uid(),n:'',e:'',o:'P',sedes:[],resp:'',mes:null,ano:null,enlaceObtencion:null});tmpMaes._progId=pid;renderProgForm();}
function delMae(mid){collectLineas();collectMaes();var pid=tmpMaes._progId;tmpMaes=tmpMaes.filter(function(m){return m.id!==mid;});tmpMaes._progId=pid;renderProgForm();}
function collectLineas(){var pid=tmpLineas._progId;tmpLineas=tmpLineas.map(function(l){return{id:l.id,l:gv('ll'+l.id)||l.l,t:gv('lt'+l.id)||l.t,esp:gv('le'+l.id)||l.esp,e:gv('les'+l.id),o:gv('lo'+l.id)||l.o,sedes:l.sedes,resp:gv('lresp'+l.id),mes:gi('lmes'+l.id),ano:gi('lano'+l.id),enlaceObtencion:gv('lenlace'+l.id)||null};});tmpLineas._progId=pid;}
function collectMaes(){var pid=tmpMaes._progId;tmpMaes=tmpMaes.map(function(m){return{id:m.id,n:gv('mn'+m.id)||m.n,e:gv('mes'+m.id),o:gv('mo'+m.id)||m.o,sedes:m.sedes,resp:gv('mresp'+m.id),mes:gi('mmes'+m.id),ano:gi('mano'+m.id),enlaceObtencion:gv('menlace'+m.id)||null};});tmpMaes._progId=pid;}
function saveProg(pid,isNew){
  collectLineas();collectMaes();
  var prog={id:pid,n:gv('pn').trim(),sedes:gv('psedes').split(',').map(function(s){return s.trim();}).filter(Boolean),lineas:tmpLineas,mae:tmpMaes};
  AppData.savePrograma(curFac,prog,isNew);
    editingProgId=null;tmpLineas=[];tmpMaes=[];toast('Programa guardado');__refreshAll();renderEditor();
}
function deleteProg(pid){
  var r=AppData.findProgramById(pid);
  showConfirm('¿Eliminar?','Se eliminará <strong>'+(r?r.programa.n:'este programa')+'</strong>.',function(){
    if(r) AppData.deletePrograma(r.facIndex,pid);
    editingProgId=null;tmpLineas=[];tmpMaes=[];toast('Eliminado');__refreshAll();renderEditor();
  });
}
function cancelEdit(){editingProgId=null;tmpLineas=[];tmpMaes=[];renderEditor();}

// ===== EDITOR DE RUTAS DE APRENDIZAJE =====
function _lrSetTab(tab){ _lrEditorTab=tab; renderEditor(); }

function _lrRenderList(){
  var lr=window.__LEARNING_ROUTES||{};
  var allProgs=_getAllAcademicPrograms();
  var withRoute=[], withoutRoute=[];
  allProgs.forEach(function(p){
    if(lr[p.id]) withRoute.push(p);
    else withoutRoute.push(p);
  });
  var h='';
  h+='<div style="background:#fff;border-radius:10px;border:1px solid #e0ece4;padding:12px 16px;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between">'
    +'<div><div style="font-size:12px;font-weight:700;color:#333">'+withRoute.length+' rutas activas</div>'
    +'<div style="font-size:10px;color:#999;margin-top:2px">'+withoutRoute.length+' programa(s) sin ruta</div></div>'
    +'<button data-action="restore-default-routes" style="background:none;border:1px solid #e0ece4;border-radius:6px;padding:6px 12px;font-size:10px;font-weight:600;cursor:pointer;color:#999;white-space:nowrap">Restaurar por defecto</button>'
    +'</div>';
  if(withRoute.length){
    h+='<div style="font-size:11px;font-weight:700;color:#006633;margin-bottom:8px;padding:0 4px">\u25a0 CON RUTA ('+withRoute.length+')</div>';
    h+='<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:1rem">';
    withRoute.forEach(function(p){
      var e=lr[p.id];
      var lrCred=e.semesters.reduce(function(t,s){return t+(s.subjects||[]).reduce(function(tt,sj){return tt+(sj.credits||0);},0);},0);
      var ts=e.semesters.reduce(function(t,s){return t+(s.subjects||[]).length;},0);
      var type=e.type||p.type||'especializacion';
      h+='<div style="background:#fff;border-radius:10px;border:1px solid #e0ece4;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px">'
        +'<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#333">'+_getTypeBadge(type)+e.espName+'</div>'
        +'<div style="font-size:10px;color:#999;margin-top:2px">ID: '+p.id+' \u00b7 '+e.semesters.length+' semestre(s) \u00b7 '+lrCred+' cr\u00e9ditos \u00b7 '+ts+' materia(s)</div></div>'
        +'<div style="display:flex;gap:6px;flex-shrink:0">'
        +'<button data-action="lr-edit-route" data-esp-id="'+p.id+'" style="background:#006633;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:10px;font-weight:700;cursor:pointer">\u270e Editar</button>'
        +'<button data-action="lr-preview-route" data-esp-id="'+p.id+'" style="background:#e6f2eb;color:#006633;border:1px solid #b3d9c4;border-radius:6px;padding:6px 12px;font-size:10px;font-weight:700;cursor:pointer">\ud83d\udc41 Vista previa</button>'
        +'<button data-action="lr-delete-route" data-esp-id="'+p.id+'" style="background:#fee2e2;color:#c0392b;border:1px solid #fca5a5;border-radius:6px;padding:6px 12px;font-size:10px;font-weight:700;cursor:pointer">\ud83d\uddd1</button></div>'
        +'</div>';
    });
    h+='</div>';
  }
  if(withoutRoute.length){
    h+='<div style="font-size:11px;font-weight:700;color:#999;margin-bottom:8px;padding:0 4px">\u25a0 SIN RUTA ('+withoutRoute.length+')</div>';
    h+='<div style="display:flex;flex-direction:column;gap:6px">';
    withoutRoute.forEach(function(p){
      h+='<div style="background:#fafcfa;border-radius:10px;border:1px solid #e8f0ec;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;opacity:0.85">'
        +'<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#555">'+_getTypeBadge(p.type)+p.name+'</div>'
        +'<div style="font-size:10px;color:#999;margin-top:2px">'+p.facName+(p.progName?' \u00b7 '+p.progName:'')+'</div></div>'
        +'<button data-action="create-route-for-prog" data-prog-id="'+p.id+'" data-prog-name="'+p.name.replace(/"/g,'&quot;')+'" data-prog-type="'+p.type+'" style="background:#006633;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap">\u2795 Crear ruta</button>'
        +'</div>';
    });
    h+='</div>';
  }
  if(!withRoute.length && !withoutRoute.length){
    h+='<div style="text-align:center;padding:2rem;color:#999">No hay programas acad\u00e9micos disponibles</div>';
  }
  return h;
}

function _lrEditRoute(progId, prefill){
  _lrEditingId=progId; renderEditor();
  var lr=window.__LEARNING_ROUTES||{};
  var e=lr[progId];
  var isNew=!e;
  var route=isNew
    ? { espName:(prefill&&prefill.name)||'', type:(prefill&&prefill.type)||'especializacion', credits:0, semesters:[{title:'Semestre 1',type:'Fundamentaci\u00f3n',credits:10,subjects:[{title:'',credits:2,homologa:false},{title:'',credits:2,homologa:false}]}] }
    : JSON.parse(JSON.stringify(e));
  var type=route.type||'especializacion';
  var h='<div style="padding:1rem">';
  h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:1rem">'
    +'<button data-action="lr-back-to-list" style="background:none;border:none;font-size:16px;cursor:pointer;color:#666">\u2190</button>'
    +_getTypeBadge(type)+'<div style="font-size:14px;font-weight:700;color:#006633">'+(isNew?'Nueva ruta':'Editar ruta')+'</div></div>';
  h+='<div id="lr-form-container" data-esp-id="'+progId+'" data-prog-type="'+type+'">';
  h+='<div class="grid2" style="margin-bottom:12px">';
  h+='<div class="field"><label>Nombre del programa</label><input id="lr-esp-name" value="'+(route.espName||'')+'" placeholder="Ej: Especializaci\u00f3n en..." style="width:100%"></div>';
  h+='<div class="field"><label>ID</label><div style="padding:6px 10px;background:#f5f5f5;border-radius:6px;font-size:11px;color:#666">'+progId+'</div></div>';
  h+='</div>';
  var tc=0; route.semesters.forEach(function(s){ tc+=(s.subjects||[]).reduce(function(t,sj){return t+(sj.credits||0);},0); });
  h+='<div style="background:#e6f2eb;border-radius:8px;padding:8px 12px;margin-bottom:12px;display:flex;align-items:center;gap:12px;font-size:11px">'
    +'<span style="font-weight:700;color:#006633">Total cr\u00e9ditos: <span id="lr-total-credits">'+tc+'</span></span>'
    +'<span style="color:#999">\u00b7</span>'
    +'<span style="color:#666"><span id="lr-sem-count">'+route.semesters.length+'</span> semestre(s)</span></div>';
  h+='<div id="lr-semesters">';
  route.semesters.forEach(function(sem,si){
    h+='<div class="lr-semester" data-si="'+si+'">';
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
      +'<span style="font-size:12px;font-weight:700;color:#333">Semestre '+(si+1)+'</span>'
      +'<div style="flex:1"></div>'
      +(route.semesters.length>1?'<button data-action="lr-delete-semester" data-si="'+si+'" style="background:#fee2e2;color:#c0392b;border:1px solid #fca5a5;border-radius:6px;padding:4px 8px;font-size:9px;font-weight:700;cursor:pointer">Eliminar semestre</button>':'')
      +'</div>';
    h+='<div class="grid2" style="margin-bottom:8px">'
      +'<div class="field"><label>T\u00edtulo</label><input class="lr-sem-title" value="'+(sem.title||'')+'" style="width:100%"></div>'
      +'<div class="field"><label>Tipo</label><select class="lr-sem-type" style="width:100%"><option value="Fundamentaci\u00f3n" '+(sem.type==='Fundamentación'?'selected':'')+'>Fundamentaci\u00f3n</option><option value="Profundizaci\u00f3n" '+(sem.type==='Profundización'?'selected':'')+'>Profundizaci\u00f3n</option></select></div>'
      +'</div>';
    var semInitCr=(sem.subjects||[]).reduce(function(t,sj){return t+(sj.credits||0);},0);
    h+='<div class="field" style="margin-bottom:8px"><label>Cr\u00e9ditos del semestre</label><span class="lr-sem-credits-display" style="display:inline-block;padding:6px 10px;background:#f0f7f2;border-radius:6px;font-size:11px;color:#006633;font-weight:600">'+semInitCr+'</span><span style="font-size:10px;color:#999;margin-left:6px">calculado autom\u00e1ticamente</span></div>';
    h+='<div class="lr-subjects" data-si="'+si+'" style="margin-bottom:6px">';
    sem.subjects.forEach(function(subj,ji){
      h+='<div class="lr-subject" data-si="'+si+'" data-ji="'+ji+'" style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:#f9fbfa;border:1px solid #e8f0ec;border-radius:6px;margin-bottom:4px">'
        +'<input class="lr-subj-name" value="'+(subj.title||'')+'" placeholder="Nombre de la materia" style="flex:1;min-width:0;padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:10px">'
        +'<input class="lr-subj-credits" data-action="lr-update-sem-credits" type="number" min="0" max="10" value="'+subj.credits+'" style="width:45px;padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:10px;text-align:center" placeholder="Cr">'
        +'<label style="display:flex;align-items:center;gap:3px;font-size:9px;color:#666;white-space:nowrap;cursor:pointer"><input class="lr-subj-homologa" type="checkbox" '+(subj.homologa?'checked':'')+'> Homologa</label>'
        +'<input class="lr-subj-url" type="url" value="'+(subj.resourceUrl||'')+'" placeholder="URL materia (opcional)" style="width:140px;padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:10px">'
        +'<button data-action="lr-delete-subject" data-si="'+si+'" data-ji="'+ji+'" style="background:none;border:none;color:#c0392b;cursor:pointer;font-size:14px;padding:2px" title="Eliminar materia">\u00d7</button>'
        +'</div>';
    });
    h+='</div>';
    h+='<button data-action="lr-add-subject" data-si="'+si+'" style="padding:4px 10px;background:none;border:1px dashed #ccc;border-radius:4px;cursor:pointer;font-size:9px;color:#999;width:100%">+ Agregar materia</button>';
    h+='</div>';
  });
  h+='</div>';
  h+='<button data-action="lr-add-semester" style="width:100%;padding:10px;background:#f5f5f5;border:1px dashed #ccc;border-radius:8px;cursor:pointer;font-size:11px;color:#666;margin-bottom:1rem">+ Agregar semestre</button>';
  h+='<div style="display:flex;gap:8px">'
    +'<button class="btn-green" data-action="lr-save-route" data-esp-id="'+progId+'" style="flex:1">\ud83d\udcbe Guardar ruta</button>'
    +'<button data-action="lr-preview-route" data-esp-id="'+progId+'" style="background:#e6f2eb;color:#006633;border:1px solid #b3d9c4;border-radius:8px;padding:8px 16px;font-size:11px;font-weight:700;cursor:pointer">\ud83d\udc41 Vista previa</button>'
    +'<button data-action="lr-back-to-list" style="background:#f5f5f5;color:#666;border:1px solid #ddd;border-radius:8px;padding:8px 16px;font-size:11px;cursor:pointer">Cancelar</button>'
    +'</div>';
  h+='</div></div>';
  document.getElementById('editor-content').innerHTML=h;
  _lrRecalcCredits();
}

function _lrCollectFormData(){
  var c=document.getElementById('lr-form-container'); if(!c) return null;
  var espId=c.dataset.espId;
  var type=c.dataset.progType||'especializacion';
  var espName=document.getElementById('lr-esp-name')?.value.trim();
  if(!espName){ toast('Escribe el nombre del programa'); return null; }
  var sems=[]; var totalCr=0;
  document.querySelectorAll('.lr-semester').forEach(function(el){
    var t=el.querySelector('.lr-sem-title')?.value.trim()||'';
    var tp=el.querySelector('.lr-sem-type')?.value||'Fundamentación';
    var subs=[];
    el.querySelectorAll('.lr-subject').forEach(function(s){
      var st=s.querySelector('.lr-subj-name')?.value.trim()||'';
      var sc=parseInt(s.querySelector('.lr-subj-credits')?.value)||0;
      var sh=s.querySelector('.lr-subj-homologa')?.checked||false;
      var su=s.querySelector('.lr-subj-url')?.value.trim()||'';
      if(st) subs.push({title:st,credits:sc,homologa:sh,resourceUrl:su||undefined});
    });
    var cr=subs.reduce(function(t,s){return t+(s.credits||0);},0);
    sems.push({title:t,type:tp,credits:cr,subjects:subs});
    totalCr+=cr;
  });
  return {espName:espName,espId:espId,type:type,credits:totalCr,semesters:sems};
}

function _lrRecalcCredits(){
  var tc=0; document.querySelectorAll('.lr-subj-credits').forEach(function(i){ tc+=parseInt(i.value)||0; });
  var el=document.getElementById('lr-total-credits'); if(el) el.textContent=tc;
}

function _lrSaveRoute(espId){
  var data=_lrCollectFormData(); if(!data) return;
  var id=data.espId;
  window.__LEARNING_ROUTES[id]={
    id:'lr-'+id.replace(/[^a-zA-Z0-9]/g,'-').toLowerCase(),
    espId:id, espName:data.espName, type:data.type||'especializacion', credits:data.credits, semesters:data.semesters
  };
    toast('Ruta guardada'); _lrEditingId=null; saveLearningRoutes(); renderEditor(); __refreshAll();
}

function _lrDeleteRoute(espId){
  if(!window.__LEARNING_ROUTES[espId]){ toast('Ruta no encontrada'); return; }
  showConfirm('Eliminar ruta','¿Eliminar la ruta de <strong>'+(window.__LEARNING_ROUTES[espId].espName||espId)+'</strong>?',function(){
    delete window.__LEARNING_ROUTES[espId]; saveLearningRoutes(); toast('Ruta eliminada'); renderEditor(); __refreshAll();
  });
}

function _lrAddSemester(){
  var data=_lrCollectFormData(); if(!data) return;
  var n=data.semesters.length+1;
  data.semesters.push({title:'Semestre '+n,type:'Profundización',credits:10,subjects:[{title:'',credits:2,homologa:false}]});
  _rerenderForm(data,data.espId);
}

function _lrDeleteSemester(si){
  var data=_lrCollectFormData(); if(!data) return;
  if(data.semesters.length<=1){ toast('Debe haber al menos un semestre'); return; }
  data.semesters.splice(si,1);
  _rerenderForm(data,data.espId);
}

function _lrAddSubject(si){
  var data=_lrCollectFormData(); if(!data) return;
  if(!data.semesters[si]){ toast('Semestre no encontrado'); return; }
  data.semesters[si].subjects.push({title:'',credits:2,homologa:false});
  _rerenderForm(data,data.espId);
}

function _lrDeleteSubject(si,ji){
  var data=_lrCollectFormData(); if(!data) return;
  if(!data.semesters[si]){ toast('Semestre no encontrado'); return; }
  if(data.semesters[si].subjects.length<=1){ toast('Debe haber al menos una materia'); return; }
  data.semesters[si].subjects.splice(ji,1);
  _rerenderForm(data,data.espId);
}

function _rerenderForm(data,espId){
  window.__LEARNING_ROUTES[espId]={
    id:'lr-'+espId.replace(/[^a-zA-Z0-9]/g,'-').toLowerCase(),
    espId:espId, espName:data.espName, type:data.type||'especializacion', credits:data.credits, semesters:data.semesters
  };
  _lrEditRoute(espId);
}

function _lrPreviewRoute(espId){
  var lr=window.__LEARNING_ROUTES||{};
  if(lr[espId]){
    openLearningRouteModal(espId);
  } else {
    var data=_lrCollectFormData(); if(!data) return;
    openLearningRouteModal({id:'lr-preview',espId:data.espId||'__preview__',espName:data.espName,type:data.type||'especializacion',credits:data.credits,semesters:data.semesters});
  }
}
