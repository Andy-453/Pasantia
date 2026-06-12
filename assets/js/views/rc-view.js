/**
 * rc-view.js — Vistas del módulo Registro Calificado (RC)
 * ---
 * Responsabilidad:
 *   - pintaGantt: línea de tiempo (Gantt) de vigencia de registros
 *   - rcRenderKPIs: tarjetas de indicadores clave
 *   - rcDestroyCharts: destrucción de instancias Chart.js
 *   - rcRenderCharts: creación de los 6 gráficos (semáforo, vencimientos,
 *     autoevaluaciones, radicaciones, nivel, línea)
 *   - rcRenderTable: tabla detallada de programas
 *   - updConsulta: widget de consulta rápida por año
 *
 * Dependencias:
 *   - rc-utils.js (C, fmt, fmtCorto)
 *   - Chart.js, ChartDataLabels (CDN)
 *   - tt, dlBar, dlTop, chSemI..chLineaI (globales, inline script)
 *
 * Estado:
 *   Estable. Funciones de renderizado puras (sin estado propio).
 */

/* ================== LÍNEA DE TIEMPO (GANTT) ================== */
function pintaGantt(S, hoy){
  const el = document.getElementById('gantt');
  if(!S.length){el.innerHTML='<div class="vacio">Ningún programa coincide con los filtros</div>';return;}
  const t0 = Math.min(...S.map(p=>p.ejec.getTime()));
  const t1 = Math.max(...S.map(p=>p.venc.getTime()), hoy.getTime());
  const y0 = new Date(t0).getFullYear();
  const y1 = new Date(t1).getFullYear()+1;
  const X0 = new Date(y0,0,1).getTime(), X1 = new Date(y1,0,1).getTime();
  const pct = t => ((t-X0)/(X1-X0)*100);
  const ny = y1-y0;
  let years='';
  for(let y=y0;y<y1;y++) years+=`<div class="g-year ${y===hoy.getFullYear()?'act':''}">${y}</div>`;
  const rows = [...S].sort((a,b)=>a.venc-b.venc).map(p=>{
    const e=p.ejec.getTime(), v=p.venc.getTime();
    const L=pct(e), W=pct(v)-pct(e);
    const w1=((p.a18.getTime()-e)/(v-e))*100, w2=((p.a16.getTime()-p.a18.getTime())/(v-e))*100,
          w3=((p.a12.getTime()-p.a16.getTime())/(v-e))*100, w4=((v-p.a12.getTime())/(v-e))*100;
    const stat = p.dv<0
      ? `<small>venció hace ${Math.abs(p.dv).toLocaleString('es-CO')} días</small>`
      : `<small>faltan ${p.dv.toLocaleString('es-CO')} días · vence ${fmtCorto(p.venc)}</small>`;
    return `<div class="g-row">
      <div class="g-name">${p.nombre}<small>SNIES ${p.snies} · ${String(p.nivel).replace(' universitaria','')} · ${p.mod}${p.trans?' · ⚠ transitoria':''}</small></div>
      <div class="g-track" style="--ny:${ny}">
        <div class="g-bar" style="left:${L.toFixed(2)}%;width:${W.toFixed(2)}%">
          <div class="g-seg" style="width:${w1.toFixed(2)}%;background:#79C000"></div>
          <div class="g-seg" style="width:${w2.toFixed(2)}%;background:#FBE122"></div>
          <div class="g-seg" style="width:${w3.toFixed(2)}%;background:#F7931E"></div>
          <div class="g-seg" style="width:${w4.toFixed(2)}%;background:#C62828"></div>
        </div>
        <div class="g-venc" style="left:${pct(v).toFixed(2)}%"></div>
        ${(hoy.getTime()>=X0&&hoy.getTime()<=X1)?`<div class="g-hoy" style="left:${pct(hoy.getTime()).toFixed(2)}%" title="HOY: ${fmt(hoy)}"></div>`:''}
      </div>
      <div class="g-stat"><span class="tag ${p.cls}">${p.est}</span>${stat}</div>
    </div>`;
  }).join('');
  el.innerHTML = `<div class="g-inner">
    <div style="display:flex;justify-content:flex-end;margin-right:170px;margin-bottom:2px">
      <span style="font-size:9px;font-weight:900;color:var(--teal);letter-spacing:.08em">▼ LA LÍNEA VERDE-AZUL = HOY (${fmt(hoy)})</span>
    </div>
    <div class="g-head" style="--ny:${ny}">${years}</div>${rows}</div>`;
}

/* ================== KPIs ================== */
function rcRenderKPIs(S, P, hoy){
  const cnt = c=>S.filter(p=>p.cls===c).length;
  const kVenc=cnt('t-x'), k12=cnt('t-12'), k16=cnt('t-16'), k18=cnt('t-18'), kOk=cnt('t-ok');
  const aeEste = S.filter(p=>!p.trans && p.dv>=0 && (p.ae1.getFullYear()===hoy.getFullYear()||p.ae2.getFullYear()===hoy.getFullYear())).length;
  const kpiData = [
    {n:S.length, l:'Programas en selección', d:'de '+P.length+' cargados', c:C.vOsc},
    {n:kOk, l:'Vigentes sin alerta', d:'Aún no requieren acción', c:C.vMed},
    {n:k18+k16, l:'Hora de radicar renovación', d:'Entre 18 y 12 meses del vencimiento', c:C.dor},
    {n:k12, l:'Críticos: menos de 1 año', d:'Riesgo de perder la oferta', c:C.nar},
    {n:kVenc, l:'Vencidos / transitoria', d:'Verificar Decreto 1174/2023', c:C.rojo},
    {n:aeEste, l:'Autoevaluaciones '+hoy.getFullYear(), d:'Procesos que tocan este año', c:C.teal}
  ];
  document.getElementById('rc-kpis').innerHTML = kpiData.map(k=>
   `<div class="kpi" style="--c:${k.c}"><div class="n">${k.n}</div><div class="l">${k.l}</div><div class="d">${k.d}</div></div>`).join('');
  return { kVenc, k12, k16, k18, kOk };
}

/* ================== DESTRUIR GRÁFICOS ================== */
function rcDestroyCharts(){
  [chSemI,chVencI,chAEI,chRadI,chNivelI,chLineaI].forEach(c=>c&&c.destroy());
}

/* ================== GRÁFICOS CHART.JS ================== */
function rcRenderCharts(S, aniosSel, vencPorAnioSel, kCounts, hoy){
  const { kVenc, k12, k16, k18, kOk } = kCounts;

  chSemI = new Chart(document.getElementById('chSem'),{type:'doughnut',data:{
   labels:['Vigentes','≤18 meses','≤16 meses','≤12 meses','Vencidos/transitoria'],
   datasets:[{data:[kOk,k18,k16,k12,kVenc],backgroundColor:[C.vMed,C.ama,C.dor,C.nar,C.rojo],borderColor:'#fff',borderWidth:3,hoverOffset:10}]},
   options:{cutout:'58%',plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:12,font:{size:10.5}}},tooltip:tt,
    datalabels:{color:ctx=>ctx.dataIndex===1?'#5c4a00':'#fff',font:{weight:'900',size:13},formatter:v=>v||''}}}});

  let yRange=[], vencData=[];
  if(aniosSel.length){
    const yMin=Math.min(...aniosSel), yMax=Math.max(...aniosSel);
    for(let y=yMin;y<=yMax;y++)yRange.push(y);
    vencData=yRange.map(y=>(vencPorAnioSel[y]||[]).length);
  }
  chVencI = new Chart(document.getElementById('chVenc'),{type:'bar',data:{labels:yRange,
   datasets:[{label:'RC que vencen',data:vencData,
    backgroundColor:yRange.map(y=>y<hoy.getFullYear()?C.rojo:y<=hoy.getFullYear()+1?C.nar:y<=hoy.getFullYear()+2?C.dor:C.vMed),
    borderRadius:7,maxBarThickness:46}]},
   options:{plugins:{legend:{display:false},
    tooltip:{...tt,callbacks:{afterBody:i=>{const y=+i[0].label;return (vencPorAnioSel[y]||[]).map(p=>'• '+p.nombre.slice(0,52))}}},
    datalabels:{...dlTop}},
   scales:{y:{ticks:{stepSize:1},grace:'12%',title:{display:true,text:'Nº de programas',font:{weight:'700',size:10}}},x:{grid:{display:false}}}}});

  const aeMap={};
  S.filter(p=>!p.trans).forEach(p=>{
    [['ae1',p.ae1.getFullYear()],['ae2',p.ae2.getFullYear()]].forEach(([k,y])=>{
      aeMap[y]=aeMap[y]||{ae1:0,ae2:0};aeMap[y][k]++;});});
  const aeY=Object.keys(aeMap).map(Number).sort((a,b)=>a-b).filter(y=>y>=hoy.getFullYear()-1);
  chAEI = new Chart(document.getElementById('chAE'),{type:'bar',data:{labels:aeY,datasets:[
   {label:'Primera autoevaluación (año 3)',data:aeY.map(y=>aeMap[y].ae1),backgroundColor:C.vLim,borderRadius:6,maxBarThickness:34,datalabels:{...dlBar,color:'#1d3a00'}},
   {label:'Segunda autoevaluación (año 4½)',data:aeY.map(y=>aeMap[y].ae2),backgroundColor:C.vOsc,borderRadius:6,maxBarThickness:34,datalabels:{...dlBar}}]},
   options:{plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10.5}}},tooltip:tt},
   scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,ticks:{stepSize:1},title:{display:true,text:'Procesos de autoevaluación',font:{weight:'700',size:10}}}}}});

  const radMap={};
  S.filter(p=>!p.trans&&p.dv>0).forEach(p=>{const y=p.a18.getFullYear();radMap[y]=(radMap[y]||0)+1});
  const radY=Object.keys(radMap).map(Number).sort((a,b)=>a-b);
  chRadI = new Chart(document.getElementById('chRad'),{type:'bar',data:{labels:radY,datasets:[{label:'Renovaciones a radicar',data:radY.map(y=>radMap[y]),backgroundColor:C.dor,borderRadius:6,maxBarThickness:34}]},
   options:{indexAxis:'y',plugins:{legend:{display:false},tooltip:tt,
    datalabels:{color:'#5c4a00',font:{weight:'900',size:12},anchor:'end',align:'right',offset:2}},
   scales:{x:{ticks:{stepSize:1},grace:'15%'},y:{grid:{display:false}}}}});

  const nivCnt={};S.forEach(p=>{const k=String(p.nivel).replace(' universitaria','');nivCnt[k]=(nivCnt[k]||0)+1});
  const modCnt={};S.forEach(p=>{modCnt[p.mod]=(modCnt[p.mod]||0)+1});
  chNivelI = new Chart(document.getElementById('chNivel'),{type:'polarArea',data:{labels:[...Object.keys(nivCnt),...Object.keys(modCnt).map(m=>'Mod. '+m)],
   datasets:[{data:[...Object.values(nivCnt),...Object.values(modCnt)],
   backgroundColor:['rgba(0,123,62,.85)','rgba(121,192,0,.85)','rgba(0,72,43,.85)','rgba(0,169,157,.7)','rgba(218,170,0,.7)','rgba(247,147,30,.6)']}]},
   options:{plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10.5}}},tooltip:tt,
    datalabels:{color:'#fff',font:{weight:'900',size:13}}},
   scales:{r:{ticks:{display:false},grid:{color:'#e4ece4'}}}}});

  const yMaxAll = aniosSel.length?Math.max(...aniosSel):hoy.getFullYear();
  const linY=[];for(let y=hoy.getFullYear();y<=yMaxAll;y++)linY.push(y);
  chLineaI = new Chart(document.getElementById('chLinea'),{type:'line',data:{labels:linY,datasets:[
   {label:'Seguirían vigentes',data:linY.map(y=>S.filter(p=>p.venc.getFullYear()>y).length),borderColor:C.vMed,backgroundColor:'rgba(121,192,0,.15)',fill:true,tension:.35,pointRadius:4,pointBackgroundColor:C.vMed,
    datalabels:{color:C.vOsc,font:{weight:'800',size:10},align:'top',offset:4}},
   {label:'Ya vencidos (acumulado)',data:linY.map(y=>S.filter(p=>p.venc.getFullYear()<=y).length),borderColor:C.nar,borderDash:[6,4],tension:.35,pointRadius:4,pointBackgroundColor:C.nar,
    datalabels:{color:'#b35f00',font:{weight:'800',size:10},align:'bottom',offset:4}}]},
   options:{plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10.5}}},tooltip:tt},
   scales:{y:{ticks:{stepSize:5},grace:'10%'},x:{grid:{display:false}}}}});
}

/* ================== TABLA ================== */
function rcRenderTable(S, hoy){
  const tb=document.querySelector('#tbl tbody');
  const rows=[...S].sort((a,b)=>a.dv-b.dv);
  const colorBar=p=>p.cls==='t-x'?C.rojo:p.cls==='t-12'?C.nar:p.cls==='t-16'?C.dor:p.cls==='t-18'?C.ama:C.vLim;
  tb.innerHTML = rows.length ? rows.map(p=>`<tr>
   <td class="mono">${p.snies}</td>
   <td><strong style="font-size:11.5px;font-weight:700;color:var(--v-oscuro)">${p.nombre}</strong>
     <div class="bar-mini"><i style="width:${p.consumo.toFixed(0)}%;background:${colorBar(p)}"></i></div>
     ${p.trans?`<div style="color:${C.rojo};font-size:9.5px;font-weight:700;margin-top:3px">⚠ Transitoria D.1174/23 hasta ${p.trans}</div>`:''}</td>
   <td class="mono">${String(p.nivel).replace(' universitaria','')}<br>${p.mod}</td>
   <td class="mono">${p.res}</td>
   <td class="mono">${fmt(p.ejec)}</td>
   <td class="mono" style="color:var(--v-oscuro);font-weight:800">${fmt(p.venc)}</td>
   <td class="mono" style="color:#8a6d00">${fmt(p.a18)}</td>
   <td class="mono" style="color:#b35f00">${fmt(p.a16)}</td>
   <td class="mono" style="color:#c2410c">${fmt(p.a12)}</td>
   <td class="ae ${p.ae1.getFullYear()===hoy.getFullYear()?'now':''}">${fmt(p.ae1)}</td>
   <td class="ae ${p.ae2.getFullYear()===hoy.getFullYear()?'now':''}">${fmt(p.ae2)}</td>
   <td class="mono" style="color:${p.dv<0?C.rojo:'var(--ink2)'}">${p.dv.toLocaleString('es-CO')}</td>
   <td><span class="tag ${p.cls}">${p.est}</span></td></tr>`).join('')
   : `<tr><td colspan="13" class="vacio">Ningún programa coincide con los filtros seleccionados</td></tr>`;
}

/* ================== CONSULTA RÁPIDA ================== */
function updConsulta(){
  const sel=document.getElementById('selAnio');
  const y=+sel.value, lst=vencPorAnioSel[y]||[];
  document.getElementById('resAnio').innerHTML = `?<b>${lst.length}</b>programa${lst.length!==1?'s':''} ${lst.length? '· SNIES '+lst.map(p=>p.snies).join(', '):''}`;
}
/* ================== TEMPLATE HTML ================== */
function rcTemplate(){
return `
<div class="banda"><div class="banda-in">
  <div>
    <div class="kicker">Universidad de Cundinamarca · Instituto de Posgrados · Aseguramiento de la Calidad</div>
    <h1>Tablero de Vigencia de Registros Calificados<br>y Cronograma de Autoevaluaci\u00F3n</h1>
    <div class="sub">Decreto 1330 de 2019 · Modelo de Autoevaluaci\u00F3n Institucional UdeC (Acta C.S. 015/2017) · SAC Res. Rectoral 026/2020</div>
  </div>
  <div class="banda-right">
    <button class="btn-upload" onclick="document.getElementById('fileX').click()">\u27F3 &nbsp;ACTUALIZAR DATOS (EXCEL SNIES)</button>
    <input type="file" id="fileX" accept=".xlsx,.xls,.csv" style="display:none">
    <div class="upload-msg" id="upMsg"></div>
    <button class="btn-restore" onclick="restoreRCDefaults()">\u21BA &nbsp;RESTAURAR DATOS BASE</button>
    <div class="corte">FECHA DE CORTE<b id="hoy"></b><span id="nprog"></span> PROGRAMAS &middot; <span id="srcName">base inicial</span></div>
  </div>
</div></div>

<div class="guia"><div class="guia-box">
  <div class="guia-it"><div class="guia-n">1</div><p><b>Cargue su base SNIES</b> con el bot\u00F3n amarillo (misma estructura del archivo de oferta vigente). El tablero se recalcula solo.</p></div>
  <div class="guia-it"><div class="guia-n">2</div><p><b>Filtre arriba</b> por estado (vigente, por vencer, vencido) y por nivel (especializaci\u00F3n, maestr\u00EDa, doctorado). Todo el tablero obedece a esos filtros.</p></div>
  <div class="guia-it"><div class="guia-n">3</div><p><b>Colores en todo el tablero:</b> <span style="color:#007B3E">verde = sin riesgo</span> &middot; <span style="color:#8a6d00">amarillo = quedan 18 a 16 meses (hora de radicar la renovaci\u00F3n)</span> &middot; <span style="color:#b35f00">naranja = 16 a 12 meses</span> &middot; <span style="color:#C62828">rojo = menos de 12 meses o vencido</span>.</p></div>
  <div class="guia-it"><div class="guia-n">4</div><p><b>Las fechas clave de cada programa</b> (cu\u00E1ndo radicar, cu\u00E1ndo autoevaluar, cu\u00E1ndo vence) est\u00E1n en la tabla del final.</p></div>
</div></div>

<div class="filterbar"><div class="filterbar-in">
  <span class="fb-label">Estado \u27F6</span>
  <button class="chip est on" data-f="all">Todos</button>
  <button class="chip est" data-f="OK">Vigentes</button>
  <button class="chip est warn" data-f="18M">\u2264 18 meses</button>
  <button class="chip est alert" data-f="16M">\u2264 16 meses</button>
  <button class="chip est crit" data-f="12M">\u2264 12 meses</button>
  <button class="chip est crit" data-f="VENCIDO">Vencidos</button>
  <span class="fb-sep"></span>
  <span class="fb-label">Nivel \u27F6</span>
  <button class="chip niv on" data-n="all">Todos</button>
  <button class="chip niv" data-n="Especializaci\u00F3n universitaria">Especializaciones</button>
  <button class="chip niv" data-n="Maestr\u00EDa">Maestr\u00EDas</button>
  <button class="chip niv" data-n="Doctorado">Doctorado</button>
  <span class="fb-sep"></span>
  <input class="search" id="q" placeholder="Buscar programa o SNIES\u2026">
  <span class="fb-count">Mostrando <b id="fcount"></b> programas</span>
</div></div>

<div class="wrap">

<div class="kpis" id="rc-kpis"></div>

<div class="consulta">
  <label>\u27F6 Consulta r\u00E1pida:</label>
  <span style="font-size:13px;font-weight:600;color:var(--ink2)">\u00BFCu\u00E1ntos registros calificados se vencen en</span>
  <select id="selAnio"></select>
  <span class="res" id="resAnio"></span>
</div>

<div class="grid">

  <div class="card span12">
    <h2>\u00BFCu\u00E1nta vida le queda al registro calificado de cada programa?</h2>
    <div class="g-como">
      <div class="demo">
        <div class="g-demo-bar">
          <div style="width:55%;background:#79C000"></div>
          <div style="width:10%;background:#FBE122"></div>
          <div style="width:13%;background:#F7931E"></div>
          <div style="width:22%;background:#C62828"></div>
        </div>
        <div class="g-demo-lbl">
          <span style="width:55%;color:#3f7800">vigencia tranquila</span>
          <span style="width:10%;color:#8a6d00">radicar</span>
          <span style="width:13%;color:#b35f00">\u00A1urgente!</span>
          <span style="width:22%;color:#C62828">\u00FAltimo a\u00F1o</span>
        </div>
      </div>
      <p><b>Cada barra es la vida completa de un registro calificado</b> (7 a\u00F1os desde su ejecutoria). La barra cambia de color a medida que se acerca el final: en <b>amarillo</b> empieza la ventana legal para radicar la renovaci\u00F3n (faltando 18 meses, Decreto 1330), y el <b>rojo</b> es el \u00FAltimo a\u00F1o. La <b style="color:#00A99D">l\u00EDnea verde-azul vertical es HOY</b>: todo lo que est\u00E1 a la izquierda de esa l\u00EDnea ya pas\u00F3. Si HOY cae sobre la zona amarilla, naranja o roja de un programa, hay que actuar. La etiqueta de la derecha le dice el estado en palabras.</p>
    </div>
    <div class="gantt" id="gantt"></div>
  </div>

  <div class="card span4">
    <h2>\u00BFC\u00F3mo est\u00E1 la oferta hoy?</h2>
    <div class="hint">N\u00FAmero de programas en cada estado. Lo ideal: todo verde.</div>
    <div class="chartbox"><canvas id="chSem"></canvas></div>
  </div>
  <div class="card span8">
    <h2>\u00BFCu\u00E1ntos registros se vencen cada a\u00F1o?</h2>
    <div class="hint">El n\u00FAmero sobre cada barra es la cantidad de programas que vencen ese a\u00F1o. Pase el cursor sobre una barra para ver los nombres.</div>
    <div class="chartbox"><canvas id="chVenc"></canvas></div>
  </div>

  <div class="card span8">
    <h2>\u00BFCu\u00E1ntas autoevaluaciones debemos hacer cada a\u00F1o?</h2>
    <div class="hint">Cada programa debe autoevaluarse 2 veces durante su vigencia: la primera al a\u00F1o 3 (verde claro) y la segunda al a\u00F1o 4\u00BD (verde oscuro). Esta gr\u00E1fica suma cu\u00E1ntos procesos caen en cada a\u00F1o, para planear la capacidad del equipo.</div>
    <div class="chartbox"><canvas id="chAE"></canvas></div>
  </div>
  <div class="card span4">
    <h2>\u00BFEn qu\u00E9 a\u00F1o hay que radicar renovaciones?</h2>
    <div class="hint">A\u00F1o en que se cumple el plazo de los 18 meses para radicar en SACES.</div>
    <div class="chartbox"><canvas id="chRad"></canvas></div>
  </div>

  <div class="card span6">
    <h2>\u00BFC\u00F3mo se compone la oferta?</h2>
    <div class="hint">Cantidad de programas por nivel de formaci\u00F3n y por modalidad.</div>
    <div class="chartbox"><canvas id="chNivel"></canvas></div>
  </div>
  <div class="card span6">
    <h2>\u00BFQu\u00E9 pasa si no renovamos?</h2>
    <div class="hint">Programas que seguir\u00EDan vigentes a\u00F1o a a\u00F1o (verde) frente a los vencimientos acumulados (naranja). Sirve para dimensionar el riesgo de p\u00E9rdida de oferta.</div>
    <div class="chartbox"><canvas id="chLinea"></canvas></div>
  </div>

  <div class="card span12">
    <h2>Todas las fechas clave, programa por programa</h2>
    <div class="hint">Ordenada del m\u00E1s urgente al menos urgente. &minus;18 m es la fecha l\u00EDmite para radicar la renovaci\u00F3n; AE-1 y AE-2 son las fechas en que debe hacerse cada autoevaluaci\u00F3n (en color verde-azul si tocan este a\u00F1o). La barrita bajo el nombre muestra cu\u00E1nta vigencia ya se consumi\u00F3.</div>
    <div class="tbl-wrap">
    <table id="tbl">
      <thead><tr>
        <th>SNIES</th><th style="min-width:260px">Programa</th><th>Nivel / Mod.</th>
        <th>Res. MEN</th><th>Ejecutoria</th><th>Vence RC</th>
        <th>&minus;18 m (radicar)</th><th>&minus;16 m</th><th>&minus;12 m</th>
        <th>AE-1</th><th>AE-2</th><th>D\u00EDas</th><th>Estado</th>
      </tr></thead>
      <tbody></tbody>
    </table>
    </div>
  </div>
</div>
</div>

<footer>
  <b>Reglas del tablero:</b> la vigencia (7 a\u00F1os) se cuenta desde la fecha de ejecutoria del acto administrativo. Vencimiento &minus;18 meses = l\u00EDmite de radicaci\u00F3n de la renovaci\u00F3n (Decreto 1330/2019); &minus;16 y &minus;12 meses = alertas institucionales. Autoevaluaci\u00F3n 1 al mes 30 y Autoevaluaci\u00F3n 2 al mes 54 de vigencia (intervalo m\u00EDnimo de 2 a\u00F1os; la AE-2 cierra al menos 12 meses antes del l\u00EDmite de radicaci\u00F3n). Programas en vigencia transitoria del Decreto 1174 de 2023 se marcan como tales. Paleta conforme al Manual de Imagen Institucional UdeC (ECOM 002 V16): verdes PANTONE 3537C/3536C/3561C, dorado 110C, naranja 144C, teal 7716C, gris 425C. <b>Para actualizar:</b> use el bot\u00F3n amarillo y cargue el Excel de oferta vigente SNIES con las mismas columnas (C\u00D3DIGO_SNIES_DEL_PROGRAMA, NOMBRE_DEL_PROGRAMA, NIVEL_DE_FORMACI\u00D3N, MODALIDAD, RESOLUCI\u00D3N_DE_APROBACI\u00D3N, FECHA_DE_RESOLUCI\u00D3N, FECHA_EJECUTORIA, VIGENCIA_A\u00D1OS, VIGENCIA TRANSITORIA, OBSERVACI\u00D3N DECRETO 1174/23). Los datos cargados viven mientras la p\u00E1gina est\u00E9 abierta; al cerrar, vuelve a la base inicial.
</footer>`;
}
