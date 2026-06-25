/**
 * views/sedes-mgr.js — Administración de catálogo de sedes
 * ---
 * Responsabilidad:
 *   - Modal para agregar/eliminar sedes del catálogo
 *   - Verificación de uso antes de eliminar
 *   - Persistencia vía saveSedesCatalog() + localStorage
 *
 * Dependencias:
 *   - ALL_SEDES (global, app-state.js)
 *   - saveSedesCatalog (global, app-state.js)
 *   - window.DB
 *   - toast (utils.js)
 *   - populateSedes (filters.js)
 *   - __refreshAll (actions.js)
 */
function countSedeUsage(sede){
  var count=0;
  (window.DB||[]).forEach(function(f){
    (f.progs||[]).forEach(function(p){
      if(p.sedes&&p.sedes.indexOf(sede)>-1) count++;
      (p.lineas||[]).forEach(function(l){if(l.sedes&&l.sedes.indexOf(sede)>-1) count++;});
      (p.mae||[]).forEach(function(m){if(m.sedes&&m.sedes.indexOf(sede)>-1) count++;});
    });
    if(f.doc&&f.doc.sedes&&f.doc.sedes.indexOf(sede)>-1) count++;
  });
  return count;
}
function openSedesManager(){
  var existing=document.getElementById('sm-modal-overlay');
  if(existing) document.body.removeChild(existing);
  var working=ALL_SEDES.slice();
  var overlay=document.createElement('div');
  overlay.id='sm-modal-overlay';
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center';
  var modal=document.createElement('div');
  modal.style.cssText='background:#fff;border-radius:12px;padding:24px;min-width:420px;max-width:520px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2);font-family:system-ui,sans-serif';
  function renderList(){
    var html='<div style="margin-bottom:16px">';
    if(!working.length){
      html+='<div style="color:#999;font-size:13px;text-align:center;padding:12px 0">No hay sedes en el catálogo</div>';
    }else{
      working.forEach(function(s,i){
        var usage=countSedeUsage(s);
        var ut=usage>0?' <span style="font-size:10px;color:#999">('+usage+' registro'+(usage!==1?'s':'')+')</span>':'';
        html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 8px;border-bottom:1px solid #eee">'+
          '<span style="font-size:13px">'+s+ut+'</span>'+
          '<button class="sm-del-btn" data-idx="'+i+'" style="background:none;border:none;cursor:pointer;font-size:15px;color:#c33;padding:2px 8px;border-radius:4px;line-height:1" title="Eliminar sede">✕</button>'+
          '</div>';
      });
    }
    html+='</div>';
    var cont=document.getElementById('sm-list');
    if(cont) cont.innerHTML=html;
    document.querySelectorAll('#sm-list .sm-del-btn').forEach(function(btn){
      btn.onclick=function(){
        var idx=parseInt(this.dataset.idx,10);
        var sede=working[idx];
        var usage=countSedeUsage(sede);
        if(usage>0&&!confirm('⚠️ La sede "'+sede+'" está siendo usada en '+usage+' registro(s) de la base de datos.\n\n¿Eliminarla de todas formas?\n\nLos registros existentes conservarán el nombre de la sede, pero dejará de aparecer en el catálogo, checkboxes y filtros.')) return;
        working.splice(idx,1);
        renderList();
      };
    });
  }
  modal.innerHTML=
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">'+
      '<div style="font-size:16px;font-weight:700;color:#1a2e1a">⚙️ Gestionar Sedes</div>'+
      '<button id="sm-close-btn" style="background:none;border:none;cursor:pointer;font-size:20px;color:#999;padding:0 4px">✕</button>'+
    '</div>'+
    '<div id="sm-list" style="margin-bottom:16px"></div>'+
    '<div style="display:flex;gap:8px;margin-bottom:18px">'+
      '<input id="sm-new-input" type="text" placeholder="Nueva sede..." style="flex:1;padding:7px 10px;border:1px solid #ccc;border-radius:6px;font-size:13px">'+
      '<button id="sm-add-btn" style="background:#006633;color:#fff;border:none;padding:7px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;white-space:nowrap">+ Agregar</button>'+
    '</div>'+
    '<div style="display:flex;gap:8px;justify-content:flex-end;border-top:1px solid #eee;padding-top:14px">'+
      '<button id="sm-cancel-btn" style="background:#f5f5f5;color:#333;border:1px solid #ccc;padding:8px 20px;border-radius:6px;cursor:pointer;font-size:13px">Cancelar</button>'+
      '<button id="sm-save-btn" style="background:#006633;color:#fff;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600">Guardar cambios</button>'+
    '</div>';
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  renderList();
  document.getElementById('sm-add-btn').onclick=function(){
    var inp=document.getElementById('sm-new-input');
    var val=inp.value.trim();
    if(!val){toast('Ingrese un nombre de sede');return;}
    if(working.indexOf(val)>-1){toast('Esa sede ya existe en el catálogo');return;}
    working.push(val);
    inp.value='';
    renderList();
  };
  document.getElementById('sm-save-btn').onclick=function(){
    saveSedesCatalog(working);
    if(typeof __refreshAll==='function') __refreshAll();
    document.body.removeChild(overlay);
    toast('✅ Catálogo de sedes actualizado');
  };
  document.getElementById('sm-cancel-btn').onclick=function(){document.body.removeChild(overlay);};
  document.getElementById('sm-close-btn').onclick=function(){document.body.removeChild(overlay);};
  overlay.onclick=function(e){if(e.target===overlay) document.body.removeChild(overlay);};
  document.getElementById('sm-new-input').onkeydown=function(e){
    if(e.key==='Enter'){e.preventDefault();document.getElementById('sm-add-btn').click();}
  };
}
