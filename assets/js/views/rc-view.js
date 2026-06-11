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
 *   - rc-utils.js (C, fmt, fmtCorto, HOY)
 *   - Chart.js, ChartDataLabels (CDN)
 *   - tt, dlBar, dlTop, chSemI..chLineaI (globales, inline script)
 *
 * Estado:
 *   Estable. Funciones de renderizado puras (sin estado propio).
 */

/* ================== LÍNEA DE TIEMPO (GANTT) ================== */
function pintaGantt(S){
  const el = document.getElementById('gantt');
  if(!S.length){el.innerHTML='<div class="vacio">Ningún programa coincide con los filtros</div>';return;}
  const t0 = Math.min(...S.map(p=>p.ejec.getTime()));
  const t1 = Math.max(...S.map(p=>p.venc.getTime()), HOY.getTime());
  const y0 = new Date(t0).getFullYear();
  const y1 = new Date(t1).getFullYear()+1;
  const X0 = new Date(y0,0,1).getTime(), X1 = new Date(y1,0,1).getTime();
  const pct = t => ((t-X0)/(X1-X0)*100);
  const ny = y1-y0;
  let years='';
  for(let y=y0;y<y1;y++) years+=`<div class="g-year ${y===HOY.getFullYear()?'act':''}">${y}</div>`;
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
        ${(HOY.getTime()>=X0&&HOY.getTime()<=X1)?`<div class="g-hoy" style="left:${pct(HOY.getTime()).toFixed(2)}%" title="HOY: ${fmt(HOY)}"></div>`:''}
      </div>
      <div class="g-stat"><span class="tag ${p.cls}">${p.est}</span>${stat}</div>
    </div>`;
  }).join('');
  el.innerHTML = `<div class="g-inner">
    <div style="display:flex;justify-content:flex-end;margin-right:170px;margin-bottom:2px">
      <span style="font-size:9px;font-weight:900;color:var(--teal);letter-spacing:.08em">▼ LA LÍNEA VERDE-AZUL = HOY (${fmt(HOY)})</span>
    </div>
    <div class="g-head" style="--ny:${ny}">${years}</div>${rows}</div>`;
}

/* ================== KPIs ================== */
function rcRenderKPIs(S, P){
  const cnt = c=>S.filter(p=>p.cls===c).length;
  const kVenc=cnt('t-x'), k12=cnt('t-12'), k16=cnt('t-16'), k18=cnt('t-18'), kOk=cnt('t-ok');
  const aeEste = S.filter(p=>!p.trans && p.dv>=0 && (p.ae1.getFullYear()===HOY.getFullYear()||p.ae2.getFullYear()===HOY.getFullYear())).length;
  const kpiData = [
    {n:S.length, l:'Programas en selección', d:'de '+P.length+' cargados', c:C.vOsc},
    {n:kOk, l:'Vigentes sin alerta', d:'Aún no requieren acción', c:C.vMed},
    {n:k18+k16, l:'Hora de radicar renovación', d:'Entre 18 y 12 meses del vencimiento', c:C.dor},
    {n:k12, l:'Críticos: menos de 1 año', d:'Riesgo de perder la oferta', c:C.nar},
    {n:kVenc, l:'Vencidos / transitoria', d:'Verificar Decreto 1174/2023', c:C.rojo},
    {n:aeEste, l:'Autoevaluaciones '+HOY.getFullYear(), d:'Procesos que tocan este año', c:C.teal}
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
function rcRenderCharts(S, aniosSel, vencPorAnioSel, kCounts){
  const { kVenc, k12, k16, k18, kOk } = kCounts;

  chSemI = new Chart(chSem,{type:'doughnut',data:{
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
  chVencI = new Chart(chVenc,{type:'bar',data:{labels:yRange,
   datasets:[{label:'RC que vencen',data:vencData,
    backgroundColor:yRange.map(y=>y<HOY.getFullYear()?C.rojo:y<=HOY.getFullYear()+1?C.nar:y<=HOY.getFullYear()+2?C.dor:C.vMed),
    borderRadius:7,maxBarThickness:46}]},
   options:{plugins:{legend:{display:false},
    tooltip:{...tt,callbacks:{afterBody:i=>{const y=+i[0].label;return (vencPorAnioSel[y]||[]).map(p=>'• '+p.nombre.slice(0,52))}}},
    datalabels:{...dlTop}},
   scales:{y:{ticks:{stepSize:1},grace:'12%',title:{display:true,text:'Nº de programas',font:{weight:'700',size:10}}},x:{grid:{display:false}}}}});

  const aeMap={};
  S.filter(p=>!p.trans).forEach(p=>{
    [['ae1',p.ae1.getFullYear()],['ae2',p.ae2.getFullYear()]].forEach(([k,y])=>{
      aeMap[y]=aeMap[y]||{ae1:0,ae2:0};aeMap[y][k]++;});});
  const aeY=Object.keys(aeMap).map(Number).sort((a,b)=>a-b).filter(y=>y>=HOY.getFullYear()-1);
  chAEI = new Chart(chAE,{type:'bar',data:{labels:aeY,datasets:[
   {label:'Primera autoevaluación (año 3)',data:aeY.map(y=>aeMap[y].ae1),backgroundColor:C.vLim,borderRadius:6,maxBarThickness:34,datalabels:{...dlBar,color:'#1d3a00'}},
   {label:'Segunda autoevaluación (año 4½)',data:aeY.map(y=>aeMap[y].ae2),backgroundColor:C.vOsc,borderRadius:6,maxBarThickness:34,datalabels:{...dlBar}}]},
   options:{plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10.5}}},tooltip:tt},
   scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,ticks:{stepSize:1},title:{display:true,text:'Procesos de autoevaluación',font:{weight:'700',size:10}}}}}});

  const radMap={};
  S.filter(p=>!p.trans&&p.dv>0).forEach(p=>{const y=p.a18.getFullYear();radMap[y]=(radMap[y]||0)+1});
  const radY=Object.keys(radMap).map(Number).sort((a,b)=>a-b);
  chRadI = new Chart(chRad,{type:'bar',data:{labels:radY,datasets:[{label:'Renovaciones a radicar',data:radY.map(y=>radMap[y]),backgroundColor:C.dor,borderRadius:6,maxBarThickness:34}]},
   options:{indexAxis:'y',plugins:{legend:{display:false},tooltip:tt,
    datalabels:{color:'#5c4a00',font:{weight:'900',size:12},anchor:'end',align:'right',offset:2}},
   scales:{x:{ticks:{stepSize:1},grace:'15%'},y:{grid:{display:false}}}}});

  const nivCnt={};S.forEach(p=>{const k=String(p.nivel).replace(' universitaria','');nivCnt[k]=(nivCnt[k]||0)+1});
  const modCnt={};S.forEach(p=>{modCnt[p.mod]=(modCnt[p.mod]||0)+1});
  chNivelI = new Chart(chNivel,{type:'polarArea',data:{labels:[...Object.keys(nivCnt),...Object.keys(modCnt).map(m=>'Mod. '+m)],
   datasets:[{data:[...Object.values(nivCnt),...Object.values(modCnt)],
   backgroundColor:['rgba(0,123,62,.85)','rgba(121,192,0,.85)','rgba(0,72,43,.85)','rgba(0,169,157,.7)','rgba(218,170,0,.7)','rgba(247,147,30,.6)']}]},
   options:{plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10.5}}},tooltip:tt,
    datalabels:{color:'#fff',font:{weight:'900',size:13}}},
   scales:{r:{ticks:{display:false},grid:{color:'#e4ece4'}}}}});

  const yMaxAll = aniosSel.length?Math.max(...aniosSel):HOY.getFullYear();
  const linY=[];for(let y=HOY.getFullYear();y<=yMaxAll;y++)linY.push(y);
  chLineaI = new Chart(chLinea,{type:'line',data:{labels:linY,datasets:[
   {label:'Seguirían vigentes',data:linY.map(y=>S.filter(p=>p.venc.getFullYear()>y).length),borderColor:C.vMed,backgroundColor:'rgba(121,192,0,.15)',fill:true,tension:.35,pointRadius:4,pointBackgroundColor:C.vMed,
    datalabels:{color:C.vOsc,font:{weight:'800',size:10},align:'top',offset:4}},
   {label:'Ya vencidos (acumulado)',data:linY.map(y=>S.filter(p=>p.venc.getFullYear()<=y).length),borderColor:C.nar,borderDash:[6,4],tension:.35,pointRadius:4,pointBackgroundColor:C.nar,
    datalabels:{color:'#b35f00',font:{weight:'800',size:10},align:'bottom',offset:4}}]},
   options:{plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10.5}}},tooltip:tt},
   scales:{y:{ticks:{stepSize:5},grace:'10%'},x:{grid:{display:false}}}}});
}

/* ================== TABLA ================== */
function rcRenderTable(S){
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
   <td class="ae ${p.ae1.getFullYear()===HOY.getFullYear()?'now':''}">${fmt(p.ae1)}</td>
   <td class="ae ${p.ae2.getFullYear()===HOY.getFullYear()?'now':''}">${fmt(p.ae2)}</td>
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
