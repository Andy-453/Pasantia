/**
 * storage.js — persistencia y descarga
 * ---
 * Responsabilidad:
 *   - carga/guarda de DB en localStorage
 *   - validación de estructura de datos (_validateDB)
 *   - descarga de HTML completo con datos actualizados (downloadHTML)
 *   - restablecimiento a datos por defecto (resetDB)
 *
 * Dependencias:
 *   - utils.js → uid, toast
 *   - window.DB, window.DEFAULT_DATA, window.__UDEC_EMBEDDED__
 *
 * Estado:
 *   Estable. Dependencia de window.* para acceso a DB.
 */
function saveDB(){try{localStorage.setItem('udec_rutas_db',JSON.stringify(window.DB));}catch(e){}}
function _validateDB(data){
  if(!Array.isArray(data)||!data.length) return false;
  for(var i=0;i<data.length;i++){
    var f=data[i];
    if(!f||typeof f!=='object') return false;
    if(!f.name||!Array.isArray(f.progs)) return false;
    for(var j=0;j<f.progs.length;j++){
      var p=f.progs[j];
      if(!p||typeof p!=='object') return false;
      if(!Array.isArray(p.lineas)) p.lineas=[];
      if(!Array.isArray(p.mae)) p.mae=[];
      if(!Array.isArray(p.sedes)) p.sedes=[];
      if(!p.id) p.id=uid();
      if(!p.n) return false;
    }
  }
  return true;
}
/**
 * Carga DB desde localStorage o datos por defecto según flag embed.
 * @global window.__UDEC_EMBEDDED__ — si true, ignora localStorage
 * @global window.DEFAULT_DATA — datos iniciales
 */
function loadDB(){
  if(window.__UDEC_EMBEDDED__){window.DB=JSON.parse(JSON.stringify(window.DEFAULT_DATA));return;}
  try{
    var d=localStorage.getItem('udec_rutas_db');
    if(d){var parsed=JSON.parse(d);if(_validateDB(parsed)){window.DB=parsed;return;}}
  }catch(e){}
  window.DB=JSON.parse(JSON.stringify(window.DEFAULT_DATA));
}
/**
 * Descarga HTML standalone con CSS, JS e imágenes inline.
 * Usa __EMBED.buildStandalone() para embeber todos los recursos.
 */
function downloadHTML(){
  var hoy=new Date();
  var fecha=hoy.getFullYear()+'-'+String(hoy.getMonth()+1).padStart(2,'0')+'-'+String(hoy.getDate()).padStart(2,'0');
  var filename='Dashboard_UDEC_Posgrados_'+fecha+'.html';

  if(!window.__EMBED){
    // Fallback clásico si embed.js no cargó
    var html=document.documentElement.outerHTML;
    html=html.replace(/(var|const) DEFAULT_DATA=\[[\s\S]*?\](?=\s*\n(var|const) ALL_SEDES)/,'var DEFAULT_DATA='+JSON.stringify(window.DB));
    html=html.replace('</title>','</title><script>window.__UDEC_EMBEDDED__=true;<\/script>');
    _downloadBlob(html,filename);
    return;
  }

  var toastEl=document.getElementById('toast');
  if(toastEl){toastEl.textContent='⏳ Empaquetando dashboard...';toastEl.style.display='block';}

  window.__EMBED.buildStandalone().then(function(html){
    _downloadBlob(html,filename);
    if(toastEl){toastEl.textContent='✅ Dashboard guardado con datos actualizados';setTimeout(function(){toastEl.style.display='none';},2500);}
  }).catch(function(err){
    console.error('embed error:',err);
    // Fallback: método clásico
    var html=document.documentElement.outerHTML;
    html=html.replace(/(var|const) DEFAULT_DATA=\[[\s\S]*?\](?=\s*\n(var|const) ALL_SEDES)/,'var DEFAULT_DATA='+JSON.stringify(window.DB));
    html=html.replace('</title>','</title><script>window.__UDEC_EMBEDDED__=true;<\/script>');
    _downloadBlob(html,filename);
    if(toastEl){toastEl.textContent='✅ Dashboard guardado (sin recursos embebidos)';setTimeout(function(){toastEl.style.display='none';},2500);}
  });
}

function _downloadBlob(html,filename){
  var blob=new Blob([html],{type:'text/html;charset=utf-8;'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download=filename;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function resetDB(){if(confirm('¿Restablecer todos los datos al estado original?')){try{localStorage.removeItem('udec_rutas_db');}catch(e){}location.reload();}}

