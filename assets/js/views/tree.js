/**
 * Vista: Árbol jerárquico de programas
 * Dependencias runtime: AppData, AppState, filtPregrado (filters.js),
 *   getSt, _getObtencionUrl, pregradoMatch, itemMatch, _hasLR, pll (app.js helpers),
 *   document.getElementById
 */

function renderTree(){
  try{
  const f=AppData.getFacultad(AppState.navigation.curFac);
  if(!f||!Array.isArray(f.progs)){document.getElementById('tree').innerHTML='<div class="empty-msg">Error cargando datos. <a href="#" data-action="reset-db" style="color:#006633">Recargar datos por defecto</a></div>';return;}
  const singlePregrado = filtPregrado !== 'ALL';

  function vline(h){
    return `<div class="vl" style="height:${h}px"></div>`;
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

  let h=`
  <div class="node node-root">
    <div class="node-body">
      <div class="node-label">Facultad</div>
      <div class="node-title">${f.name}</div>
    </div>
  </div>
  ${vline(24)}`;

  if(singlePregrado){
    const p = visProgs[0];
    const vL = (Array.isArray(p.lineas)?p.lineas:[]).filter(l=>itemMatch(l,'espec'));
    const vM = (Array.isArray(p.mae)?p.mae:[]).filter(m=>itemMatch(m,'mae'));

    h+=`
    <div class="node node-pregrado" style="min-width:260px;max-width:340px">
      <button class="edit-node-btn no-print" data-action="open-edit-prog" data-pid="${p.id}">✏️</button>
      <div class="node-stripe"></div>
      <div class="node-body">
        <div class="node-label">Programa de pregrado</div>
        <div class="node-title">${p.n}</div>
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e8f2ec">
          <div style="font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#666;margin-bottom:4px">Sede(s)</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">
                ${p.sedes.map(s=>`<span class="sede-chip">📍 ${s}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>`; 

    if(vL.length){
      const colW = 200;
      const gap = 16;
      const n = vL.length;
      const totalW = n * colW + (n-1) * gap;
      const centerX = totalW / 2;

      const svgH = 48;
      let svgPaths = `<line x1="${centerX}" y1="0" x2="${centerX}" y2="20" stroke="#c0d8c8" stroke-width="2"/>`;
      if(n > 1){
        const firstX = colW/2;
        const lastX = totalW - colW/2;
        svgPaths += `<line x1="${firstX}" y1="20" x2="${lastX}" y2="20" stroke="#c0d8c8" stroke-width="2"/>`;
      }
      vL.forEach((_,i)=>{
        const cx = i*(colW+gap) + colW/2;
        svgPaths += `<line x1="${cx}" y1="20" x2="${cx}" y2="${svgH}" stroke="#c0d8c8" stroke-width="2"/>`;
        if(n > 1) svgPaths += `<circle cx="${cx}" cy="20" r="3" fill="#006633"/>`;
      });

      h+=`
      <div style="width:${totalW}px;display:flex;justify-content:center">
        <svg width="${totalW}" height="${svgH}" style="display:block;overflow:visible">
          ${svgPaths}
          <circle cx="${centerX}" cy="0" r="3" fill="#006633"/>
        </svg>
      </div>
      <div style="display:flex;gap:${gap}px;align-items:flex-start;width:${totalW}px">`;

      vL.forEach(l=>{
        h+=`
        <div style="width:${colW}px;display:flex;flex-direction:column;align-items:center;flex-shrink:0">
          <div class="node node-linea" style="width:100%">
            <div class="node-stripe"></div>
            <div class="node-body">
              <div class="tipo-tag">${l.t}</div>
              <div class="node-label">Línea de profundización</div>
              <div class="node-title">${l.l}</div>
            </div>
          </div>
          <svg width="2" height="16"><line x1="1" y1="0" x2="1" y2="16" stroke="#c0d8c8" stroke-width="2"/></svg>
          <div class="node node-espec" style="width:100%">
            <div class="node-stripe"></div>
            <div class="node-body">
              ${pll(l.o)}
              <div class="node-label">Especialización</div>
              <div class="node-title${_hasLR(l.id)?' route-link" data-action="show-learning-route" data-esp-id="'+l.id:''}">${l.esp}</div>
              <div class="sede-chip">📍 ${l.sedes.join(' · ')}</div>
              ${stBadge(l.e, l)}
            </div>
          </div>
        </div>`;
      });
      h+=`</div>`;
    }

    if(vM.length){
      const colW = 210;
      const gap = 16;
      const n = vM.length;
      const totalW = n * colW + (n-1) * gap;
      const centerX = totalW / 2;
      const svgH = 48;

      let svgPaths = `<line x1="${centerX}" y1="0" x2="${centerX}" y2="20" stroke="#d4b84a" stroke-width="2"/>`;
      if(n > 1){
        const firstX = colW/2;
        const lastX = totalW - colW/2;
        svgPaths += `<line x1="${firstX}" y1="20" x2="${lastX}" y2="20" stroke="#d4b84a" stroke-width="2"/>`;
      }
      vM.forEach((_,i)=>{
        const cx = i*(colW+gap) + colW/2;
        svgPaths += `<line x1="${cx}" y1="20" x2="${cx}" y2="${svgH}" stroke="#d4b84a" stroke-width="2"/>`;
        if(n > 1) svgPaths += `<circle cx="${cx}" cy="20" r="3" fill="#C8A43A"/>`;
      });

      h+=`
      <div style="width:${Math.max(totalW,10)}px;display:flex;justify-content:center">
        <svg width="${Math.max(totalW,2)}" height="${svgH}" style="display:block;overflow:visible">
          ${svgPaths}
          <circle cx="${centerX}" cy="0" r="3" fill="#C8A43A"/>
        </svg>
      </div>
      <div style="display:flex;gap:${gap}px;align-items:flex-start;width:${Math.max(totalW,10)}px">`;

      vM.forEach(m=>{
        h+=`
        <div style="width:${colW}px;flex-shrink:0">
          <div class="node node-mae" style="width:100%">
            <div class="node-stripe"></div>
            <div class="node-body">
              ${pll(m.o)}
              <div class="node-label">Maestría</div>
              <div class="node-title${_hasLR(m.id)?' route-link" data-action="show-learning-route" data-esp-id="'+m.id:''}">${m.n}</div>
              <div class="sede-chip">📍 ${m.sedes.join(' · ')}</div>
              ${stBadge(m.e, m)}
            </div>
          </div>
        </div>`;
      });
      h+=`</div>`;
    }

  } else {
    h+=`<div class="progs-row">`;
    visProgs.forEach(p=>{
      const vL=(Array.isArray(p.lineas)?p.lineas:[]).filter(l=>itemMatch(l,'espec'));
      const vM=(Array.isArray(p.mae)?p.mae:[]).filter(m=>itemMatch(m,'mae'));
      h+=`<div class="pcol">
        ${vline(14)}
        <div class="node node-pregrado">
          <button class="edit-node-btn no-print" data-action="open-edit-prog" data-pid="${p.id}">✏️</button>
          <div class="node-stripe"></div>
          <div class="node-body">
            <div class="node-label">Programa de pregrado</div>
            <div class="node-title">${p.n}</div>
            <div style="margin-top:7px;padding-top:7px;border-top:1px solid #e8f2ec">
              <div style="font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#666;margin-bottom:4px">Sede(s)</div>
              <div style="display:flex;flex-wrap:wrap;gap:3px;justify-content:center">
            ${p.sedes.map(s=>`<span class="sede-chip">📍 ${s}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>`;

      vL.forEach(l=>{
        h+=`
        ${vline(12)}
        <div class="node node-linea">
          <div class="node-stripe"></div>
          <div class="node-body">
            <div class="tipo-tag">${l.t}</div>
            <div class="node-label">Línea de profundización</div>
            <div class="node-title">${l.l}</div>
          </div>
        </div>
        ${vline(8)}
        <div class="node node-espec">
          <div class="node-stripe"></div>
          <div class="node-body">
            ${pll(l.o)}
            <div class="node-label">Especialización</div>
            <div class="node-title${_hasLR(l.id)?' route-link" data-action="show-learning-route" data-esp-id="'+l.id:''}">${l.esp}</div>
            <div class="sede-chip">📍 ${l.sedes.join(' · ')}</div>
            ${stBadge(l.e, l)}
          </div>
        </div>`;
      });

      vM.forEach(m=>{
        h+=`
        ${vline(10)}
        <div class="node node-mae">
          <div class="node-stripe"></div>
          <div class="node-body">
            ${pll(m.o)}
            <div class="node-label">Maestría</div>
            <div class="node-title${_hasLR(m.id)?' route-link" data-action="show-learning-route" data-esp-id="'+m.id:''}">${m.n}</div>
            <div class="sede-chip">📍 ${m.sedes.join(' · ')}</div>
            ${stBadge(m.e, m)}
          </div>
        </div>`;
      });
      h+=`</div>`;
    });
    h+=`</div>`;
  }

  if(f.doc&&itemMatch(f.doc,'doc')){
    var docId='doc-'+f.id;
    h+=`
    ${vline(24)}
    <div class="node node-doc">
      <div class="node-body">
        <div style="margin-bottom:5px">${pll(f.doc.o)}</div>
        <div class="node-label">Doctorado</div>
        <div class="node-title${_hasLR(docId)?' route-link" data-action="show-learning-route" data-esp-id="'+docId:''}">${f.doc.n}</div>
        <div class="sede-chip sede-chip-dark">📍 ${f.doc.sedes.join(' · ')}</div>
        ${stBadge(f.doc.e, f.doc)}
      </div>
    </div>`;
  }

  document.getElementById('tree').innerHTML=h;
  }catch(err){
    document.getElementById('tree').innerHTML='<div class="empty-msg">⚠️ Error al renderizar el árbol. <a href="#" data-action="reset-db" style="color:#006633;font-weight:700">Haz clic aquí para restablecer los datos</a></div>';
    console.error('renderTree error:',err);
  }
}

window.App = window.App || {};
window.App.renderTree = renderTree;
