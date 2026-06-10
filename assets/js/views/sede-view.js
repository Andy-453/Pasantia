/**
 * sede-view.js — Vista por sede
 * ---
 * Responsabilidad:
 *   - renderSedeView: agrupa programas de posgrado por sede geográfica,
 *     mostrando cards colapsables con nivel, oferta y estado.
 *
 * Dependencias:
 *   - AppData.getFacultad(AppState.navigation.curFac) — datos de facultad
 *   - pregradoMatch, itemMatch (filters.js) — filtros activos
 *   - getSt (utils.js) — utilidad de estado
 *   - _getObtencionUrl (app.js) — helper de enlaces de obtención (legacy)
 *
 * Historial:
 *   2026-06-10 — Extraído de app.js (Fase 5: extracción de vistas)
 */

function renderSedeView(){
  const f=AppData.getFacultad(AppState.navigation.curFac);const sm={};
  f.progs.forEach(p=>{
    if(!pregradoMatch(p.n)) return;
    [...p.lineas.filter(l=>itemMatch(l,'espec')),...p.mae.filter(m=>itemMatch(m,'mae'))].forEach(item=>{
      item.sedes.forEach(s=>{if(!sm[s])sm[s]=[];sm[s].push({prog:p.n,nivel:item.esp||item.n,e:item.e,o:item.o,enlaceObtencion:item.enlaceObtencion});});
    });
  });
  if(f.doc&&itemMatch(f.doc,'doc')) f.doc.sedes.forEach(s=>{if(!sm[s])sm[s]=[];sm[s].push({prog:'Todos',nivel:f.doc.n,e:f.doc.e,o:f.doc.o});});
  const sedes=Object.keys(sm).sort();
  if(!sedes.length){document.getElementById('sede-content').innerHTML='<div class="empty-msg">Sin resultados</div>';return;}
  let h='';
  sedes.forEach(s=>{
    h+=`<div class="sede-card"><div class="sede-name">📍 ${s} <span style="font-size:9px;background:#e6f2eb;color:#006633;padding:1px 6px;border-radius:8px;margin-left:4px">${sm[s].length}</span></div>`;
    sm[s].forEach(it=>{
      const st=getSt(it.e);const os=it.o==='V'?'#006633':'#1a5cb0';
      var bUrl=_getObtencionUrl(it.e,it),bAttrs='';
      if(bUrl){bAttrs=' data-action="open-program-link" data-url="'+bUrl+'" role="button" tabindex="0" style="cursor:pointer"';}
      h+=`<div class="sede-item"><div style="flex:1;font-size:10px;line-height:1.3">${it.nivel}</div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
          <span style="font-size:8px;padding:1px 4px;border-radius:4px;background:${it.o==='V'?'#e6f2eb':'#e8f0fb'};color:${os};border:1px solid ${os}">${it.o==='V'?'Vig.':'Proy.'}</span>
          <span style="font-size:8px;padding:1px 4px;border-radius:4px;background:${st.bg};color:${st.tx}"${bAttrs}>${it.e||'—'}</span>
        </div></div>`;
    });
    h+=`</div>`;
  });
  document.getElementById('sede-content').innerHTML=h;
}
