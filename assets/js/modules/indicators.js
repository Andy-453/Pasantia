/**
 * indicators.js — Panel de Indicadores y métricas visuales
 * ---
 * Responsabilidad:
 *   - renderIndicadores: dashboard completo de indicadores
 *     (KPIs globales, gráficos de torta, tabla por facultad, estado por facultad)
 *   - helpers internos de renderizado SVG (pieSlices)
 *   - agrupación y conteo de estados (getEstGroup)
 *
 * Dependencias:
 *   - AppData.getFacultades() — datos completos vía capa de datos
 *
 * Compatibilidad legacy:
 *   - window.renderIndicadores — requerido por showTab() en app.js y por HTML
 *     con datos embebidos (onclick, panel-indicadores).
 *
 * Riesgos de acoplamiento:
 *   - La taxonomía de estados proviene de getSt/ST_MAP (utils.js), fuente única
 *
 * Estado:
 *   Extraído de app.js. Acceso DB via AppData.
 */

function renderIndicadores(){
  const wrap = document.getElementById('indicadores-content');
  const state = window.AppState; // future: filtrado por facultad activa

  let totalPre=0, totalEsp=0, totalMae=0, totalDoc=0;
  let vigente=0, proyectada=0;
  const estadoCount={};
  const facStats=[];

  function getEstGroup(e){
    const g=getSt(e);
    return g.cat?{label:g.group,color:g.dot,bg:g.bg}:{label:'Sin definir',color:'#888',bg:'#f5f5f0'};
  }

  AppData.getFacultades().forEach(fac=>{
    const fs={name:fac.name, pre:fac.progs.length, esp:0, mae:0, doc:fac.doc?1:0, vigente:0, proyectada:0, estados:{}};
    totalPre+=fac.progs.length;
    fac.progs.forEach(p=>{
      p.lineas.forEach(l=>{
        fs.esp++; totalEsp++;
        if(l.o==='V'){vigente++;fs.vigente++;} else{proyectada++;fs.proyectada++;}
        const g=getEstGroup(l.e); estadoCount[g.label]=(estadoCount[g.label]||0)+1; fs.estados[g.label]=(fs.estados[g.label]||0)+1;
      });
      p.mae.forEach(m=>{
        fs.mae++; totalMae++;
        if(m.o==='V'){vigente++;fs.vigente++;} else{proyectada++;fs.proyectada++;}
        const g=getEstGroup(m.e); estadoCount[g.label]=(estadoCount[g.label]||0)+1; fs.estados[g.label]=(fs.estados[g.label]||0)+1;
      });
    });
    if(fac.doc){
      totalDoc++;
      if(fac.doc.o==='V'){vigente++;fs.vigente++;} else{proyectada++;fs.proyectada++;}
      const g=getEstGroup(fac.doc.e); estadoCount[g.label]=(estadoCount[g.label]||0)+1; fs.estados[g.label]=(fs.estados[g.label]||0)+1;
    }
    facStats.push(fs);
  });

  const totalPosg = totalEsp+totalMae+totalDoc;
  const total = totalPre+totalPosg;

  const EST_COLORS={
    'Obtención / Con registro':{color:'#1D9E75',bg:'#E1F5EE'},
    'Radicado MEN':{color:'#378ADD',bg:'#E6F1FB'},
    'En construcción':{color:'#BA7517',bg:'#FAEEDA'},
    'Por construir':{color:'#e09020',bg:'#FEF3C7'},
    'En reclamación':{color:'#D85A30',bg:'#FAECE7'},
    'Negado MEN':{color:'#A32D2D',bg:'#FCEBEB'},
    'Sin definir':{color:'#888',bg:'#f5f5f0'},
  };

  let h=`<div style="padding:1.25rem;background:#f4f6f4;min-height:400px">`;

  h+=`<div style="font-size:14px;font-weight:700;color:#006633;margin-bottom:1rem;display:flex;align-items:center;gap:8px">
    <span style="width:4px;height:20px;background:#006633;border-radius:2px;display:inline-block"></span>
    Panel de Indicadores — Oferta Académica Universidad de Cundinamarca
  </div>`;

  h+=`<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:1.25rem">`;
  const kpis=[
    {v:AppData.getFacultadCount(), l:'Facultades', c:'#006633', bg:'#e6f2eb'},
    {v:totalPre, l:'Programas pregrado', c:'#2e8b57', bg:'#f0faf5'},
    {v:totalEsp, l:'Especializaciones', c:'#3aaa72', bg:'#eaf7f0'},
    {v:totalMae, l:'Maestrías', c:'#C8A43A', bg:'#fdf6e3'},
    {v:totalDoc, l:'Doctorados', c:'#0d3d22', bg:'#d4e8da'},
    {v:totalPosg, l:'Total posgrados', c:'#185FA5', bg:'#e6f0fb'},
  ];
  kpis.forEach(k=>{
    h+=`<div style="background:${k.bg};border-radius:10px;padding:12px 14px;text-align:center;border:1px solid ${k.c}30">
      <div style="font-size:26px;font-weight:800;color:${k.c}">${k.v}</div>
      <div style="font-size:9px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:.06em;margin-top:3px;line-height:1.3">${k.l}</div>
    </div>`;
  });
  h+=`</div>`;

  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1.25rem">`;

  const totalOferta=vigente+proyectada;
  const pctV=totalOferta>0?Math.round(vigente/totalOferta*100):0;
  const pctP=totalOferta>0?100-pctV:0;

  function pieSlices(segments){
    const cx=80, cy=80, r=62, ri=36;
    let angle=-90, paths='';
    segments.forEach(seg=>{
      const a1=angle, a2=angle+(seg.pct/100)*360;
      const r1=a1*Math.PI/180, r2=a2*Math.PI/180;
      const large=seg.pct>50?1:0;
      const x1o=cx+r*Math.cos(r1), y1o=cy+r*Math.sin(r1);
      const x2o=cx+r*Math.cos(r2), y2o=cy+r*Math.sin(r2);
      const x1i=cx+ri*Math.cos(r2), y1i=cy+ri*Math.sin(r2);
      const x2i=cx+ri*Math.cos(r1), y2i=cy+ri*Math.sin(r1);
      const mid=(r1+r2)/2;
      const lx=cx+(r+ri)/2*Math.cos(mid), ly=cy+(r+ri)/2*Math.sin(mid);
      paths+=`<path d="M ${x1o} ${y1o} A ${r} ${r} 0 ${large} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${ri} ${ri} 0 ${large} 0 ${x2i} ${y2i} Z"
        fill="${seg.color}" stroke="#fff" stroke-width="2"/>`;
      if(seg.pct>8){
        paths+=`<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle"
          font-size="10" font-weight="700" fill="#fff" font-family="Arial">${Math.round(seg.pct)}%</text>`;
      }
      angle=a2;
    });
    return paths;
  }

  const seg1=[
    {pct:pctV, color:'#006633', label:'Vigente'},
    {pct:pctP, color:'#378ADD', label:'Proyectada'},
  ];

  h+=`<div style="background:#fff;border-radius:12px;padding:16px 18px;border:1px solid #d8e8dc;box-shadow:0 2px 8px rgba(0,102,51,0.06)">
    <div style="font-size:10px;font-weight:700;color:#006633;text-transform:uppercase;letter-spacing:.09em;margin-bottom:14px;display:flex;align-items:center;gap:6px">
      <span style="width:3px;height:14px;background:#006633;border-radius:2px;display:inline-block"></span>
      Oferta vigente vs proyectada
    </div>
    <div style="display:flex;align-items:center;gap:18px">
      <div style="flex-shrink:0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          ${pieSlices(seg1)}
          <circle cx="80" cy="80" r="30" fill="#fff"/>
          <text x="80" y="75" text-anchor="middle" font-size="18" font-weight="800" fill="#006633" font-family="Arial">${vigente+proyectada}</text>
          <text x="80" y="90" text-anchor="middle" font-size="8" fill="#888" font-family="Arial">TOTAL</text>
        </svg>
      </div>
      <div style="flex:1">
        <div style="margin-bottom:14px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <span style="display:flex;align-items:center;gap:6px;font-size:11px;color:#333;font-weight:600">
              <span style="width:12px;height:12px;border-radius:3px;background:#006633;display:inline-block"></span>Vigente
            </span>
            <span style="font-size:13px;font-weight:800;color:#006633">${vigente}</span>
          </div>
          <div style="height:8px;background:#e8f0e8;border-radius:4px;overflow:hidden">
            <div style="width:${pctV}%;height:100%;background:#006633;border-radius:4px"></div>
          </div>
          <div style="font-size:9px;color:#888;margin-top:2px;text-align:right">${pctV}% del total</div>
        </div>
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <span style="display:flex;align-items:center;gap:6px;font-size:11px;color:#333;font-weight:600">
              <span style="width:12px;height:12px;border-radius:3px;background:#378ADD;display:inline-block"></span>Proyectada
            </span>
            <span style="font-size:13px;font-weight:800;color:#378ADD">${proyectada}</span>
          </div>
          <div style="height:8px;background:#e6f0fb;border-radius:4px;overflow:hidden">
            <div style="width:${pctP}%;height:100%;background:#378ADD;border-radius:4px"></div>
          </div>
          <div style="font-size:9px;color:#888;margin-top:2px;text-align:right">${pctP}% del total</div>
        </div>
      </div>
    </div>
  </div>`;

  const totalEst=Object.values(estadoCount).reduce((a,b)=>a+b,0);
  const sortedEst=Object.entries(estadoCount).sort((a,b)=>b[1]-a[1]);
  const EST_PIE_COLORS=['#1D9E75','#378ADD','#BA7517','#e09020','#D85A30','#A32D2D','#888'];
  const seg2=sortedEst.map((([est,cnt],i)=>({
    pct:cnt/totalEst*100,
    color:(EST_COLORS[est]||{color:EST_PIE_COLORS[i%EST_PIE_COLORS.length]}).color,
    label:est,cnt
  })));

  h+=`<div style="background:#fff;border-radius:12px;padding:16px 18px;border:1px solid #d8e8dc;box-shadow:0 2px 8px rgba(0,102,51,0.06)">
    <div style="font-size:10px;font-weight:700;color:#006633;text-transform:uppercase;letter-spacing:.09em;margin-bottom:14px;display:flex;align-items:center;gap:6px">
      <span style="width:3px;height:14px;background:#006633;border-radius:2px;display:inline-block"></span>
      Estado actual de programas
    </div>
    <div style="display:flex;align-items:center;gap:16px">
      <div style="flex-shrink:0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          ${pieSlices(seg2)}
          <circle cx="80" cy="80" r="30" fill="#fff"/>
          <text x="80" y="75" text-anchor="middle" font-size="18" font-weight="800" fill="#1a2e1a" font-family="Arial">${totalEst}</text>
          <text x="80" y="90" text-anchor="middle" font-size="8" fill="#888" font-family="Arial">PROG.</text>
        </svg>
      </div>
      <div style="flex:1;max-height:140px;overflow-y:auto">
        ${sortedEst.map(([est,cnt])=>{
          const ec=EST_COLORS[est]||{color:'#888',bg:'#f5f5f0'};
          const pct=Math.round(cnt/totalEst*100);
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid #f0f4f0">
            <span style="width:10px;height:10px;border-radius:50%;background:${ec.color};flex-shrink:0;display:inline-block"></span>
            <span style="font-size:9px;color:#333;flex:1;line-height:1.3">${est}</span>
            <span style="font-size:10px;font-weight:700;color:${ec.color};white-space:nowrap">${cnt} <span style="font-size:8px;font-weight:400;color:#999">${pct}%</span></span>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;

  h+=`</div>`;

  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1.25rem">`;

  const nivelSegs=[
    {pct:totalEsp/(totalPosg||1)*100, color:'#3aaa72', label:'Especializaciones', cnt:totalEsp},
    {pct:totalMae/(totalPosg||1)*100, color:'#C8A43A', label:'Maestrías', cnt:totalMae},
    {pct:totalDoc/(totalPosg||1)*100, color:'#0d3d22', label:'Doctorados', cnt:totalDoc},
  ];

  h+=`<div style="background:#fff;border-radius:12px;padding:16px 18px;border:1px solid #d8e8dc;box-shadow:0 2px 8px rgba(0,102,51,0.06)">
    <div style="font-size:10px;font-weight:700;color:#006633;text-transform:uppercase;letter-spacing:.09em;margin-bottom:14px;display:flex;align-items:center;gap:6px">
      <span style="width:3px;height:14px;background:#006633;border-radius:2px;display:inline-block"></span>
      Distribución por nivel de posgrado
    </div>
    <div style="display:flex;align-items:center;gap:18px">
      <div style="flex-shrink:0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          ${pieSlices(nivelSegs)}
          <circle cx="80" cy="80" r="30" fill="#fff"/>
          <text x="80" y="75" text-anchor="middle" font-size="18" font-weight="800" fill="#006633" font-family="Arial">${totalPosg}</text>
          <text x="80" y="90" text-anchor="middle" font-size="8" fill="#888" font-family="Arial">POSGRADOS</text>
        </svg>
      </div>
      <div style="flex:1">
        ${nivelSegs.map(s=>`
        <div style="margin-bottom:12px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <span style="display:flex;align-items:center;gap:6px;font-size:11px;color:#333;font-weight:600">
              <span style="width:12px;height:12px;border-radius:3px;background:${s.color};display:inline-block"></span>${s.label}
            </span>
            <span style="font-size:13px;font-weight:800;color:${s.color}">${s.cnt}</span>
          </div>
          <div style="height:7px;background:#f0f4f0;border-radius:4px;overflow:hidden">
            <div style="width:${Math.round(s.pct)}%;height:100%;background:${s.color};border-radius:4px"></div>
          </div>
          <div style="font-size:9px;color:#888;margin-top:2px;text-align:right">${Math.round(s.pct)}% del total</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;

  const FAC_COLORS_PIE=['#006633','#2e8b57','#3aaa72','#C8A43A','#378ADD','#D85A30','#993556','#534AB7'];
  const facSegments = facStats.map((fs,i)=>({
    pct:(fs.esp+fs.mae+fs.doc)/(totalPosg||1)*100,
    color: FAC_COLORS_PIE[i%FAC_COLORS_PIE.length],
    label: fs.name.replace('Facultad de ','').replace('Facultad ','').split(',')[0].trim(),
    cnt: fs.esp+fs.mae+fs.doc
  })).filter(s=>s.cnt>0);

  h+=`<div style="background:#fff;border-radius:12px;padding:16px 18px;border:1px solid #d8e8dc;box-shadow:0 2px 8px rgba(0,102,51,0.06)">
    <div style="font-size:10px;font-weight:700;color:#006633;text-transform:uppercase;letter-spacing:.09em;margin-bottom:14px;display:flex;align-items:center;gap:6px">
      <span style="width:3px;height:14px;background:#006633;border-radius:2px;display:inline-block"></span>
      Participación por facultad
    </div>
    <div style="display:flex;align-items:center;gap:16px">
      <div style="flex-shrink:0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          ${pieSlices(facSegments)}
          <circle cx="80" cy="80" r="30" fill="#fff"/>
          <text x="80" y="75" text-anchor="middle" font-size="18" font-weight="800" fill="#1a2e1a" font-family="Arial">${AppData.getFacultadCount()}</text>
          <text x="80" y="90" text-anchor="middle" font-size="8" fill="#888" font-family="Arial">FAC.</text>
        </svg>
      </div>
      <div style="flex:1;max-height:140px;overflow-y:auto">
        ${facSegments.map(s=>{
          const pct=Math.round(s.pct);
          return `<div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid #f0f4f0">
            <span style="width:10px;height:10px;border-radius:50%;background:${s.color};flex-shrink:0;display:inline-block"></span>
            <span style="font-size:9px;color:#333;flex:1;line-height:1.3">${esc(s.label)}</span>
            <span style="font-size:9px;font-weight:700;color:${s.color};white-space:nowrap">${s.cnt} <span style="font-size:8px;font-weight:400;color:#999">${pct}%</span></span>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;

  h+=`</div>`;
  h+=`<div style="background:#fff;border-radius:10px;padding:14px 16px;border:1px solid #d8e8dc;margin-bottom:1.25rem">
    <div style="font-size:10px;font-weight:700;color:#006633;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Distribución por facultad</div>
    <div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:10px;min-width:700px">
      <thead>
        <tr style="background:#006633;color:#fff">
          <th style="padding:8px 10px;text-align:left;font-weight:700;border-radius:6px 0 0 0">Facultad</th>
          <th style="padding:8px 10px;text-align:center;font-weight:700">Pregrados</th>
          <th style="padding:8px 10px;text-align:center;font-weight:700">Especializaciones</th>
          <th style="padding:8px 10px;text-align:center;font-weight:700">Maestrías</th>
          <th style="padding:8px 10px;text-align:center;font-weight:700">Doctorado</th>
          <th style="padding:8px 10px;text-align:center;font-weight:700">Total posgrados</th>
          <th style="padding:8px 10px;text-align:center;font-weight:700">Vigente</th>
          <th style="padding:8px 10px;text-align:center;font-weight:700">Proyectada</th>
          <th style="padding:8px 10px;text-align:left;font-weight:700;border-radius:0 6px 0 0">% participación</th>
        </tr>
      </thead>
      <tbody>`;

  facStats.forEach((fs,i)=>{
    const tp=fs.esp+fs.mae+fs.doc;
    const pct=totalPosg>0?Math.round(tp/totalPosg*100):0;
    const bg=i%2===0?'#f8fbf8':'#fff';
    h+=`<tr style="background:${bg};border-bottom:1px solid #eef4ee">
      <td style="padding:8px 10px;font-weight:600;color:#006633;font-size:10px">${esc(fs.name.replace('Facultad de ','').replace('Facultad ',''))} </td>
      <td style="padding:8px 10px;text-align:center;font-weight:700;color:#2e8b57">${fs.pre}</td>
      <td style="padding:8px 10px;text-align:center">${fs.esp}</td>
      <td style="padding:8px 10px;text-align:center;color:#9a7c1a;font-weight:600">${fs.mae}</td>
      <td style="padding:8px 10px;text-align:center;color:#0d3d22;font-weight:600">${fs.doc}</td>
      <td style="padding:8px 10px;text-align:center;font-weight:700;color:#185FA5">${tp}</td>
      <td style="padding:8px 10px;text-align:center">
        <span style="background:#e6f2eb;color:#006633;padding:2px 8px;border-radius:8px;font-weight:600">${fs.vigente}</span>
      </td>
      <td style="padding:8px 10px;text-align:center">
        <span style="background:#e6f0fb;color:#185FA5;padding:2px 8px;border-radius:8px;font-weight:600">${fs.proyectada}</span>
      </td>
      <td style="padding:8px 10px">
        <div style="display:flex;align-items:center;gap:6px">
          <div style="flex:1;height:6px;background:#e8f0e8;border-radius:3px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:#006633;border-radius:3px"></div>
          </div>
          <span style="font-size:9px;font-weight:700;color:#006633;min-width:28px">${pct}%</span>
        </div>
      </td>
    </tr>`;
  });

  h+=`<tr style="background:#006633;color:#fff;font-weight:700">
    <td style="padding:9px 10px;border-radius:0 0 0 6px">TOTAL</td>
    <td style="padding:9px 10px;text-align:center">${totalPre}</td>
    <td style="padding:9px 10px;text-align:center">${totalEsp}</td>
    <td style="padding:9px 10px;text-align:center">${totalMae}</td>
    <td style="padding:9px 10px;text-align:center">${totalDoc}</td>
    <td style="padding:9px 10px;text-align:center">${totalPosg}</td>
    <td style="padding:9px 10px;text-align:center">${vigente}</td>
    <td style="padding:9px 10px;text-align:center">${proyectada}</td>
    <td style="padding:9px 10px;border-radius:0 0 6px 0">100%</td>
  </tr>`;
  h+=`</tbody></table></div></div>`;

  h+=`<div style="background:#fff;border-radius:10px;padding:14px 16px;border:1px solid #d8e8dc">
    <div style="font-size:10px;font-weight:700;color:#006633;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Estado actual por facultad</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">`;

  facStats.forEach(fs=>{
    const tp=fs.esp+fs.mae+fs.doc;
    h+=`<div style="border:1px solid #e0ece4;border-radius:8px;overflow:hidden">
      <div style="background:#006633;color:#fff;padding:7px 10px;font-size:10px;font-weight:700">${esc(fs.name.replace('Facultad de ','').replace('Facultad ',''))}</div>
      <div style="padding:8px 10px">`;
    const sortedFs=Object.entries(fs.estados).sort((a,b)=>b[1]-a[1]);
    sortedFs.forEach(([est,cnt])=>{
      const ec=EST_COLORS[est]||{color:'#888',bg:'#f5f5f0'};
      const pct=tp>0?Math.round(cnt/tp*100):0;
      h+=`<div style="display:flex;align-items:center;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f0f4f0">
        <span style="font-size:9px;color:#444;display:flex;align-items:center;gap:4px">
          <span style="width:7px;height:7px;border-radius:50%;background:${ec.color};display:inline-block;flex-shrink:0"></span>${esc(est)}
        </span>
        <span style="font-size:9px;font-weight:700;color:${ec.color};white-space:nowrap">${cnt} (${pct}%)</span>
      </div>`;
    });
    h+=`</div></div>`;
  });

  h+=`</div></div>`;

  // ===== REGISTRO CALIFICADO POR FACULTAD =====
  h+=renderRCSeccion();

  h+=`</div>`;

  wrap.innerHTML=h;
}

/**
 * Criterio único de Registro Calificado (RC) basado en enlaceObtencion.
 * NO se infiere RC a partir del campo de estado. Devuelve true únicamente
 * cuando enlaceObtencion es un string no vacío (contiene una URL/link).
 * @param {*} v - valor de enlaceObtencion de la línea
 * @returns {boolean}
 */
var _rcHasLink = function(v){
  return typeof v === 'string' && v.trim().length > 0;
};

/**
 * Agrega los totales de Registro Calificado de UNA facultad a partir de sus
 * líneas/especializaciones (p.lineas[]). Usa l.o (V/P) con la misma semántica
 * de Vigente/Proyectada que renderIndicadores().
 * @param {Object} fac - facultad de window.DB
 * @param {Object} acc - acumulador de la facultad (se muta)
 */
var _rcAccumFac = function(fac, acc){
  (fac.progs||[]).forEach(function(p){
    (p.lineas||[]).forEach(function(l){
      var rc = _rcHasLink(l.enlaceObtencion);
      var v = l.o === 'V', proy = l.o === 'P';
      acc.total++;
      if(rc && v) acc.vigCon++;
      else if(rc && proy) acc.proyCon++;
      else if(v) acc.vigSin++;
      else acc.proySin++;
    });
  });
};

/**
 * Calcula el resumen global y por facultad de Registro Calificado,
 * EN CADA LLAMADA, a partir de AppData.getFacultades() (window.DB vivo).
 * No persiste nada ni guarda en localStorage.
 * @returns {{total:number, conRC:number, sinRC:number, vigCon:number,
 *            vigSin:number, proyCon:number, proySin:number, perFac:Array}}
 */
var _rcCompute = function(){
  var perFac = [];
  var total = 0, conRC = 0, sinRC = 0, vigCon = 0, vigSin = 0, proyCon = 0, proySin = 0;
  AppData.getFacultades().forEach(function(fac){
    var acc = { fac: fac, total: 0, conRC: 0, sinRC: 0, vigCon: 0, vigSin: 0, proyCon: 0, proySin: 0 };
    _rcAccumFac(fac, acc);
    acc.conRC = acc.vigCon + acc.proyCon;
    acc.sinRC = acc.total - acc.conRC;
    total += acc.total; conRC += acc.conRC; sinRC += acc.sinRC;
    vigCon += acc.vigCon; vigSin += acc.vigSin; proyCon += acc.proyCon; proySin += acc.proySin;
    perFac.push(acc);
  });
  return { total: total, conRC: conRC, sinRC: sinRC, vigCon: vigCon, vigSin: vigSin, proyCon: proyCon, proySin: proySin, perFac: perFac };
};

/**
 * Genera el HTML completo de la sección "Registro Calificado por Facultad":
 * KPIs de resumen + tarjetas por facultad. Cada métrica con data-action para
 * abrir el detalle (rc-show-detail). Estilo coherente con el resto del panel.
 * @returns {string}
 */
var renderRCSeccion = function(){
  var rc = _rcCompute();
  var short = function(n){ return (n||'').replace('Facultad de ','').replace('Facultad ','').split(',')[0].trim(); };
  var pill = function(bg,color,txt){ return '<span style="background:'+bg+';color:'+color+';padding:2px 8px;border-radius:8px;font-weight:600">'+txt+'</span>'; };

  var h = '';
  h += '<div style="background:#fff;border-radius:10px;padding:14px 16px;border:1px solid #d8e8dc;margin-top:1rem">';
  h += '<div style="font-size:11px;font-weight:700;color:#006633;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Registro Calificado por Facultad</div>';

  // KPIs resumen
  h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px">';
  var kpis = [
    { v: rc.total,     l: 'Total líneas',            c: '#006633', bg: '#e6f2eb' },
    { v: rc.conRC,     l: 'CON RC',                  c: '#1D9E75', bg: '#E1F5EE' },
    { v: rc.sinRC,     l: 'SIN RC',                  c: '#A32D2D', bg: '#FCEBEB' },
    { v: rc.proySin,   l: 'Proyectadas sin RC',      c: '#BA7517', bg: '#FAEEDA' },
  ];
  kpis.forEach(function(k){
    h += '<div style="background:'+k.bg+';border-radius:10px;padding:10px 12px;text-align:center;border:1px solid '+k.c+'30">'
      + '<div style="font-size:22px;font-weight:800;color:'+k.c+'">'+k.v+'</div>'
      + '<div style="font-size:9px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:.05em;margin-top:2px;line-height:1.3">'+k.l+'</div>'
      + '</div>';
  });
  h += '</div>';

  // tabla resumen global
  h += '<div style="overflow-x:auto;margin-bottom:14px"><table style="width:100%;border-collapse:collapse;font-size:10px;min-width:760px">';
  h += '<thead><tr style="background:#006633;color:#fff">'
    + '<th style="padding:8px 10px;text-align:left;font-weight:700;border-radius:6px 0 0 0">Facultad</th>'
    + '<th style="padding:8px 10px;text-align:center;font-weight:700">Total</th>'
    + '<th style="padding:8px 10px;text-align:center;font-weight:700">CON RC</th>'
    + '<th style="padding:8px 10px;text-align:center;font-weight:700">SIN RC</th>'
    + '<th style="padding:8px 10px;text-align:center;font-weight:700">Vig. + RC</th>'
    + '<th style="padding:8px 10px;text-align:center;font-weight:700">Vig. sin RC</th>'
    + '<th style="padding:8px 10px;text-align:center;font-weight:700">Proy. + RC</th>'
    + '<th style="padding:8px 10px;text-align:center;font-weight:700;border-radius:0 6px 0 0">Proy. sin RC</th>'
    + '</tr></thead><tbody>';
  rc.perFac.forEach(function(f, i){
    var bg = i % 2 === 0 ? '#f8fbf8' : '#fff';
    h += '<tr style="background:'+bg+';border-bottom:1px solid #eef4ee">'
      + '<td style="padding:8px 10px;font-weight:600;color:#006633">'+esc(short(f.fac.name))+'</td>'
      + '<td style="padding:8px 10px;text-align:center;font-weight:700">'+f.total+'</td>'
      + '<td style="padding:8px 10px;text-align:center;color:#1D9E75;font-weight:600">'+f.conRC+'</td>'
      + '<td style="padding:8px 10px;text-align:center;color:#A32D2D;font-weight:600">'+f.sinRC+'</td>'
      + '<td style="padding:8px 10px;text-align:center">'+f.vigCon+'</td>'
      + '<td style="padding:8px 10px;text-align:center;color:#BA7517;font-weight:600">'+f.vigSin+'</td>'
      + '<td style="padding:8px 10px;text-align:center">'+f.proyCon+'</td>'
      + '<td style="padding:8px 10px;text-align:center;color:#BA7517;font-weight:700">'+f.proySin+'</td>'
      + '</tr>';
  });
  h += '<tr style="background:#006633;color:#fff;font-weight:700">'
    + '<td style="padding:9px 10px;border-radius:0 0 0 6px">TOTAL</td>'
    + '<td style="padding:9px 10px;text-align:center">'+rc.total+'</td>'
    + '<td style="padding:9px 10px;text-align:center">'+rc.conRC+'</td>'
    + '<td style="padding:9px 10px;text-align:center">'+rc.sinRC+'</td>'
    + '<td style="padding:9px 10px;text-align:center">'+rc.vigCon+'</td>'
    + '<td style="padding:9px 10px;text-align:center">'+rc.vigSin+'</td>'
    + '<td style="padding:9px 10px;text-align:center">'+rc.proyCon+'</td>'
    + '<td style="padding:9px 10px;text-align:center;border-radius:0 0 6px 0">'+rc.proySin+'</td>'
    + '</tr>';
  h += '</tbody></table></div>';

  // tarjetas por facultad (clickeables)
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">';
  rc.perFac.forEach(function(f){
    var col = f.conRC > 0 ? '#1D9E75' : '#BA7517';
    h += '<div style="border:1px solid #e0ece4;border-radius:8px;overflow:hidden">'
      + '<div style="background:#006633;color:#fff;padding:7px 10px;font-size:10px;font-weight:700">'+esc(short(f.fac.name))+'</div>'
      + '<div style="padding:8px 10px">'
      + '<div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:#333;margin-bottom:4px"><span>Total líneas</span><span>'+f.total+'</span></div>'
      + '<div role="button" tabindex="0" data-action="rc-show-detail" data-filter="fac-con:'+esc(f.fac.name)+'" style="display:flex;justify-content:space-between;align-items:center;padding:3px 6px;border-radius:6px;background:#E1F5EE;cursor:pointer;margin-bottom:3px"><span style="font-size:9px;font-weight:600;color:#085041">CON RC</span><span style="font-size:11px;font-weight:800;color:#1D9E75">'+f.conRC+'</span></div>'
      + '<div role="button" tabindex="0" data-action="rc-show-detail" data-filter="fac-sin:'+esc(f.fac.name)+'" style="display:flex;justify-content:space-between;align-items:center;padding:3px 6px;border-radius:6px;background:#FCEBEB;cursor:pointer;margin-bottom:3px"><span style="font-size:9px;font-weight:600;color:#501313">SIN RC</span><span style="font-size:11px;font-weight:800;color:#A32D2D">'+f.sinRC+'</span></div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:6px">'
      + '<div role="button" tabindex="0" data-action="rc-show-detail" data-filter="fac-vig-con:'+esc(f.fac.name)+'" style="padding:3px 6px;border-radius:6px;background:#e6f2eb;cursor:pointer;text-align:center"><div style="font-size:8px;color:#085041;font-weight:600">Vigente + RC</div><div style="font-size:11px;font-weight:800;color:#006633">'+f.vigCon+'</div></div>'
      + '<div role="button" tabindex="0" data-action="rc-show-detail" data-filter="fac-vig-sin:'+esc(f.fac.name)+'" style="padding:3px 6px;border-radius:6px;background:#FAEEDA;cursor:pointer;text-align:center"><div style="font-size:8px;color:#633806;font-weight:600">Vigente sin RC</div><div style="font-size:11px;font-weight:800;color:#BA7517">'+f.vigSin+'</div></div>'
      + '<div role="button" tabindex="0" data-action="rc-show-detail" data-filter="fac-proy-con:'+esc(f.fac.name)+'" style="padding:3px 6px;border-radius:6px;background:#E6F1FB;cursor:pointer;text-align:center"><div style="font-size:8px;color:#0C447C;font-weight:600">Proyectada + RC</div><div style="font-size:11px;font-weight:800;color:#378ADD">'+f.proyCon+'</div></div>'
      + '<div role="button" tabindex="0" data-action="rc-show-detail" data-filter="fac-proy-sin:'+esc(f.fac.name)+'" style="padding:3px 6px;border-radius:6px;background:#FCEBEB;cursor:pointer;text-align:center"><div style="font-size:8px;color:#501313;font-weight:600">Proyectada sin RC</div><div style="font-size:11px;font-weight:800;color:#A32D2D">'+f.proySin+'</div></div>'
      + '</div></div></div>';
  });
  h += '</div>';
  h += '</div>';
  return h;
};

/**
 * Construye y muestra el modal de detalle de Registo Calificado según un filtro.
 * Los filtros permitidos: 'proy-sin' (global), 'fac-con', 'fac-sin',
 * 'fac-vig-con', 'fac-vig-sin', 'fac-proy-con', 'fac-proy-sin' con sufijo ':'+facultad.
 * Recalcula el detalle desde window.DB en el momento (dinámico).
 * @param {string} filter - clave de filtro
 */
var renderIndicadorRCDetalle = function(filter){
  var overlay = document.getElementById('rc-detail-overlay');
  if(overlay && overlay.parentNode) document.body.removeChild(overlay);

  var list = [];
  AppData.getFacultades().forEach(function(fac){
    (fac.progs||[]).forEach(function(p){
      (p.lineas||[]).forEach(function(l){
        var rc = _rcHasLink(l.enlaceObtencion);
        var v = l.o === 'V', proy = l.o === 'P';
        var ok = false;
        var kind = (filter||'').split(':')[0];
        var facMatch = (filter||'').split(':')[1] || '';
        if(facMatch && fac.name !== facMatch) return;
        if(kind === 'fac-con' && rc) ok = true;
        else if(kind === 'fac-sin' && !rc) ok = true;
        else if(kind === 'fac-vig-con' && rc && v) ok = true;
        else if(kind === 'fac-vig-sin' && !rc && v) ok = true;
        else if(kind === 'fac-proy-con' && rc && proy) ok = true;
        else if(kind === 'fac-proy-sin' && !rc && proy) ok = true;
        else if(kind === 'proy-sin' && !rc && proy) ok = true;
        if(ok){
          list.push({
            fac: fac.name, prog: p.n, linea: l.l||'', esp: l.esp||'',
            oferta: v ? 'Vigente' : 'Proyectada', estado: l.e||'',
            link: rc ? l.enlaceObtencion.trim() : ''
          });
        }
      });
    });
  });

  var title = 'Detalle de Registro Calificado';
  var kindLabel = {
    'fac-con':'CON RC', 'fac-sin':'SIN RC', 'fac-vig-con':'Vigente + RC',
    'fac-vig-sin':'Vigente sin RC', 'fac-proy-con':'Proyectada + RC',
    'fac-proy-sin':'Proyectada sin RC', 'proy-sin':'Proyectadas sin RC'
  }[filter && filter.split(':')[0]] || '';
  var sub = kindLabel ? (' — ' + kindLabel + (filter && filter.split(':')[1] ? ' — ' + filter.split(':')[1] : '')) : '';

  var rows = list.map(function(r, i){
    var link = r.link ? '<a href="'+esc(r.link)+'" target="_blank" rel="noopener noreferrer" style="color:#0563C1;font-size:9px">Ver link</a>' : '<span style="color:#A32D2D;font-size:9px;font-weight:600">Sin RC</span>';
    return '<tr style="background:'+(i%2===0?'#f8fbf8':'#fff')+';border-bottom:1px solid #eef4ee">'
      + '<td style="padding:6px 8px;font-size:9px;color:#006633;font-weight:600">'+esc(r.fac)+'</td>'
      + '<td style="padding:6px 8px;font-size:9px">'+esc(r.prog)+'</td>'
      + '<td style="padding:6px 8px;font-size:9px">'+esc(r.linea)+'</td>'
      + '<td style="padding:6px 8px;font-size:9px">'+esc(r.esp)+'</td>'
      + '<td style="padding:6px 8px;font-size:9px;text-align:center">'+esc(r.oferta)+'</td>'
      + '<td style="padding:6px 8px;font-size:9px">'+esc(r.estado)+'</td>'
      + '<td style="padding:6px 8px;text-align:center">'+link+'</td>'
      + '</tr>';
  }).join('');

  var html = '<div id="rc-detail-overlay" style="position:fixed;inset:0;background:rgba(0,30,0,.45);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:2rem;overflow-y:auto">'
    + '<div style="background:#fff;border-radius:12px;width:100%;max-width:960px;box-shadow:0 8px 40px rgba(0,0,0,.2);overflow:hidden">'
    + '<div style="background:#006633;color:#fff;padding:12px 18px;display:flex;align-items:center;justify-content:space-between">'
    + '<span style="font-size:13px;font-weight:700">'+esc(title)+esc(sub)+'</span>'
    + '<button data-action="rc-close-detail" style="background:rgba(255,255,255,.15);border:none;color:#fff;font-size:16px;cursor:pointer;border-radius:6px;padding:2px 10px">×</button>'
    + '</div>'
    + '<div style="padding:14px 18px;max-height:70vh;overflow:auto">'
    + '<div style="font-size:10px;color:#555;margin-bottom:8px"><b>'+list.length+'</b> línea(s)</div>'
    + '<table style="width:100%;border-collapse:collapse;font-size:10px;min-width:820px">'
    + '<thead><tr style="background:#0d3d22;color:#fff">'
    + '<th style="padding:7px 8px;text-align:left">Facultad</th><th style="padding:7px 8px;text-align:left">Programa</th>'
    + '<th style="padding:7px 8px;text-align:left">Línea</th><th style="padding:7px 8px;text-align:left">Especialización</th>'
    + '<th style="padding:7px 8px;text-align:center">Oferta</th><th style="padding:7px 8px;text-align:left">Estado</th>'
    + '<th style="padding:7px 8px;text-align:center">Link RC</th></tr></thead><tbody>'
    + rows + '</tbody></table></div></div></div>';

  var holder = document.createElement('div');
  holder.innerHTML = html;
  var node = holder.firstChild;
  document.body.appendChild(node);
};

// exportado via window.App (app.js)
