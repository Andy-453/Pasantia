/**
 * Vista: Árbol jerárquico de programas
 * Dependencias runtime: AppData, AppState, ALL_SEDES (app-state.js),
 *   filtPregrado, itemMatch, pregradoMatch (filters.js),
 *   getSt, _getObtencionUrl, _hasLR, pll (utils.js helpers),
 *   document.getElementById
 *
 * Jerarquía (flujo horizontal izquierda → derecha):
 *   Facultad → Programa de pregrado → Sede → Profundización →
 *   Especialización → (Doctorado como rama final independiente).
 *
 * Cada programa expone un ÚNICO control de sedes:
 *   [Programa de pregrado] ──► [📍 SEDES ▾]
 * Al abrir, se lista las sedes disponibles de ESE programa; al elegir una,
 * se cierra el listado y queda seleccionada. El contenido (profundizaciones
 * y maestrías) aparece a la derecha filtrado por la sede seleccionada.
 *
 * Reglas de selección:
 *   - filtro global de sede activo (filtSede !== 'ALL'): el control muestra
 *     ESA sede preseleccionada y queda inactivo (prioridad del filtro).
 *   - si una selección previa deja de pasar el filtro global, se limpia.
 *   - cambiar de facultad conserva selecciones (claves por progId).
 *
 * Estado (en memoria, AppState.ui — NUNCA en DB/localStorage):
 *   AppState.ui.sedeSel[progId]      → sede seleccionada del programa
 *   AppState.ui.sedesListOpen[progId] → listado de sedes abierto/cerrado
 *   AppState.ui.maeOpen[progId]       → maestrías abiertas/cerradas
 *
 * Multi-sede: una línea/maestría que pertenece a varias sedes aparece al
 * seleccionar cualquiera de ellas, reutilizando el mismo objeto (mismo id).
 */

function renderTree(){
  try{
  const f=AppData.getFacultad(AppState.navigation.curFac);
  if(!f||!Array.isArray(f.progs)){document.getElementById('tree').innerHTML='<div class="empty-msg">Error cargando datos. <a href="#" data-action="reset-db" style="color:#006633">Recargar datos por defecto</a></div>';return;}

  function sortBlocks(arr){
    return (arr||[]).slice().sort(function(a,b){
      function key(x){
        var m=String(x.t||'').match(/Profundizaci\u00f3n\s+(\d+)/i);
        if(m) return {t:0,n:parseInt(m[1],10),s:String(x.l||'')};
        return {t:1,n:0,s:String(x.l||'')};
      }
      var ka=key(a), kb=key(b);
      if(ka.t!==kb.t) return ka.t-kb.t;
      if(ka.t===0) return ka.n-kb.n;
      return ka.s.localeCompare(kb.s,'es');
    });
  }

  function stBadge(e, item){
    if(!e) return '';
    const s=getSt(e);
    var url = _getObtencionUrl(e, item);
    if(url){
      return '<div class="badge clickable" data-action="open-program-link" data-url="'+url+'" role="button" tabindex="0" style="background:'+s.bg+';color:'+s.tx+';cursor:pointer"><div class="bdot" style="background:'+s.dot+'"></div>'+e+'</div>';
    }
    return '<div class="badge" style="background:'+s.bg+';color:'+s.tx+'"><div class="bdot" style="background:'+s.dot+'"></div>'+e+'</div>';
  }

  if(!AppState.ui) AppState.ui={};
  if(!AppState.ui.sedeSel) AppState.ui.sedeSel={};
  if(!AppState.ui.sedesListOpen) AppState.ui.sedesListOpen={};

  const visProgs = f.progs.filter(p=>{
    if(!pregradoMatch(p.n)) return false;
    const lineas = Array.isArray(p.lineas) ? p.lineas : [];
    const mae = Array.isArray(p.mae) ? p.mae : [];
    const vL = lineas.filter(l=>itemMatch(l,'espec'));
    const vM = mae.filter(m=>itemMatch(m,'mae'));
    return vL.length||vM.length||(f.doc&&itemMatch(f.doc,'doc'));
  });

  if(!visProgs.length){
    document.getElementById('tree').innerHTML=`<div class="empty-msg">Sin resultados para los filtros seleccionados</div>`;
    return;
  }

  const filtSedeActive = window.filtSede && window.filtSede!=='ALL';

  let h=`
  <div class="node node-root">
    <div class="node-body">
      <div class="node-label">Facultad</div>
      <div class="node-title">${f.name}</div>
    </div>
  </div>`;

  h+=`<div class="trunk">`;
  visProgs.forEach(p=>{
    const vL=sortBlocks((Array.isArray(p.lineas)?p.lineas:[]).filter(l=>itemMatch(l,'espec')));
    const vM=(Array.isArray(p.mae)?p.mae:[]).filter(m=>itemMatch(m,'mae'));

    const sedeSet=new Set();
    (Array.isArray(p.sedes)?p.sedes:[]).forEach(s=>sedeSet.add(s));
    vL.forEach(l=>(l.sedes||[]).forEach(s=>sedeSet.add(s)));
    vM.forEach(m=>(m.sedes||[]).forEach(s=>sedeSet.add(s)));
    const sedes=[...sedeSet].sort(function(a,b){
      const ia=ALL_SEDES.indexOf(a), ib=ALL_SEDES.indexOf(b);
      if(ia>-1&&ib>-1) return ia-ib;
      return a.localeCompare(b,'es');
    });

    // Limpiar selección incompatible con el filtro global de sede
    if(filtSedeActive && AppState.ui.sedeSel[p.id] && AppState.ui.sedeSel[p.id]!==window.filtSede){
      delete AppState.ui.sedeSel[p.id];
    }
    // Limpiar selección de una sede que ya no existe en el programa
    if(!filtSedeActive && AppState.ui.sedeSel[p.id] && sedes.indexOf(AppState.ui.sedeSel[p.id])===-1){
      delete AppState.ui.sedeSel[p.id];
    }

    const sEff = filtSedeActive ? window.filtSede : (AppState.ui.sedeSel[p.id]||null);
    const listOpen = !filtSedeActive && !!(AppState.ui.sedesListOpen[p.id]);
    const btnDisabled = filtSedeActive || !sedes.length;

    h+=`<div class="prog-row">
      <div class="node node-pregrado">
        <button class="edit-node-btn no-print" data-action="open-edit-prog" data-pid="${p.id}">✏️</button>
        <div class="node-stripe"></div>
        <div class="node-body">
          <div class="node-label">Programa de pregrado</div>
          <div class="node-title">${p.n}</div>
        </div>
      </div>
      <div class="sede-control">
        <div class="sedes-btn-box">
          <div class="sedes-btn${btnDisabled?' disabled':''}${listOpen?' open':''}"${btnDisabled?'':' data-action="toggle-sedes-list" data-pid="'+p.id+'" role="button" tabindex="0"'}>
            <span class="sede-arrow">${listOpen?'▾':'▸'}</span>
            <span class="sede-dot" style="background:${sEff?sedeColor(sEff):'#999'}"></span>
            <span class="sedes-btn-label">${sEff?sEff:'SEDES'}</span>
          </div>
          ${listOpen&&sedes.length?`
          <div class="sedes-list">
            ${sedes.map(s=>`
            <div class="sede-option" data-action="select-sede-prog" data-pid="${p.id}" data-sede="${s}" role="button" tabindex="0">
              <span class="sede-dot" style="background:${sedeColor(s)}"></span>
              <span>${s}</span>
              ${s===sEff?'<span class="sede-option-check">✓</span>':''}
            </div>`).join('')}
          </div>`:''}
        </div>
        ${sEff?`
        <div class="sede-content">
          <div class="node node-sede-selected">
            <div class="node-body">
              <div class="node-label">Sede seleccionada</div>
              <div class="node-title">${sEff}</div>
            </div>
          </div>
          <div class="sedes-ramas">`:''
        }
        ${sEff?(()=>{
          const sL=vL.filter(l=>(l.sedes&&l.sedes.length?l.sedes:p.sedes).indexOf(sEff)>-1);
          const sM=vM.filter(m=>(m.sedes&&m.sedes.length?m.sedes:p.sedes).indexOf(sEff)>-1);
          const mOpen=!!(AppState.ui.maeOpen&&AppState.ui.maeOpen[p.id]);
          let r='';
          if(!sL.length&&!sM.length){
            r+=`<div class="sede-empty">Sin oferta de posgrado en esta sede</div>`;
          }
          sL.forEach(l=>{
            r+=`
          <div class="prof-row">
            <div class="node node-linea">
              <div class="node-stripe"></div>
              <div class="node-body">
                <div class="tipo-tag">${l.t}</div>
                <div class="node-label">Línea de profundización</div>
                <div class="node-title">${l.l}</div>
              </div>
            </div>
            <div class="plink"></div>
            <div class="node node-espec">
              <div class="node-stripe"></div>
              <div class="node-body">
                ${pll(l.o)}
                <div class="node-label">Especialización</div>
                <div class="node-title${_hasLR(l.id)?' route-link" data-action="show-learning-route" data-esp-id="'+l.id:''}">${l.esp}</div>
                ${stBadge(l.e, l)}
              </div>
            </div>
          </div>`;
          });
          if(sM.length){
            r+=`
          <div class="mae-row">
            <div class="node node-mae-hub${mOpen?' open':''}" data-action="toggle-mae" data-key="${p.id}" role="button" tabindex="0" title="${mOpen?'Colapsar':'Expandir'} maestrías">
              <span class="sede-arrow">${mOpen?'▾':'▸'}</span>
              <div class="sede-dot" style="background:#C8A43A"></div>
              <div class="node-body">
                <div class="node-label">Posgrados</div>
                <div class="node-title">Maestrías</div>
                <div class="sede-count">${sM.length} ${sM.length!==1?'maestrías':'maestría'}</div>
              </div>
            </div>`;
            if(mOpen){
              r+=`
            <div class="maes-col">`;
              sM.forEach(m=>{
                r+=`
              <div class="node node-mae">
                <div class="node-stripe"></div>
                <div class="node-body">
                  ${pll(m.o)}
                  <div class="node-label">Maestría</div>
                  <div class="node-title${_hasLR(m.id)?' route-link" data-action="show-learning-route" data-esp-id="'+m.id:''}">${m.n}</div>
                  <div class="sede-chip">📍 ${(m.sedes||[]).join(' · ')}</div>
                  ${stBadge(m.e, m)}
                </div>
              </div>`;
              });
              r+=`
            </div>`;
            }
            r+=`
          </div>`;
          }
          return r;
        })():''}
        ${sEff?`
          </div>
        </div>`:''}
      </div>
    </div>`;
  });
  h+=`</div>`;

  if(f.doc&&itemMatch(f.doc,'doc')){
    var docId='doc-'+f.id;
    h+=`
    <div class="doc-col">
      <div class="node node-doc">
        <div class="node-body">
          <div style="margin-bottom:5px">${pll(f.doc.o)}</div>
          <div class="node-label">Doctorado</div>
          <div class="node-title${_hasLR(docId)?' route-link" data-action="show-learning-route" data-esp-id="'+docId:''}">${f.doc.n}</div>
          <div class="sede-chip sede-chip-dark">📍 ${f.doc.sedes.join(' · ')}</div>
          ${stBadge(f.doc.e, f.doc)}
        </div>
      </div>
    </div>`;
  }

  document.getElementById('tree').innerHTML=h;
  }catch(err){
    document.getElementById('tree').innerHTML='<div class="empty-msg">⚠️ Error al renderizar el árbol. <a href="#" data-action="reset-db" style="color:#006633;font-weight:700">Haz clic aquí para restablecer los datos</a></div>';
    console.error('renderTree error:',err);
  }
}

  function toggleSedesList(pid){
    if(!AppState.ui) AppState.ui={};
    if(!AppState.ui.sedesListOpen) AppState.ui.sedesListOpen={};
    AppState.ui.sedesListOpen[pid]=!AppState.ui.sedesListOpen[pid];
    renderTree();
  }
  function setSedeProg(pid, sede){
    if(!AppState.ui) AppState.ui={};
    if(!AppState.ui.sedeSel) AppState.ui.sedeSel={};
    if(window.filtSede && window.filtSede!=='ALL') return;
    if(AppState.ui.sedeSel[pid]===sede){
      delete AppState.ui.sedeSel[pid];
    } else {
      AppState.ui.sedeSel[pid]=sede;
    }
    if(AppState.ui.sedesListOpen) AppState.ui.sedesListOpen[pid]=false;
    renderTree();
  }
  function toggleMaeNode(key){
    if(!AppState.ui) AppState.ui={};
    if(!AppState.ui.maeOpen) AppState.ui.maeOpen={};
    AppState.ui.maeOpen[key]=!AppState.ui.maeOpen[key];
    renderTree();
  }

  function sedeColor(s){
  var palette=['#006633','#2e8b57','#4aaa72','#1a5cb0','#C8A43A','#c0693a','#7b5ea7','#a32d2d'];
  var i=ALL_SEDES.indexOf(s);
  return palette[(i>-1?i:String(s).length)%palette.length];
}

window.App = window.App || {};
window.App.renderTree = renderTree;
