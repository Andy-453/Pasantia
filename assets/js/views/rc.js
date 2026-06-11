/* ================== BASE INICIAL (Oferta vigente 2026) ================== */
const BASE = [{"snies":110008,"nombre":"DOCTORADO EN CIENCIAS DE LA EDUCACIÓN","nivel":"Doctorado","mod":"Presencial","res":"3235","ejec":"2021-03-18","vig":7,"trans":null},{"snies":116293,"nombre":"ESPECIALIZACIÓN EN AGROECOLOGÍA Y DESARROLLO AGROECOTURÍSTICO","nivel":"Especialización universitaria","mod":"Virtual","res":"23930","ejec":"2023-12-28","vig":7,"trans":null},{"snies":116771,"nombre":"ESPECIALIZACIÓN EN AGRONEGOCIOS SOSTENIBLES","nivel":"Especialización universitaria","mod":"Virtual","res":"2398","ejec":"2024-05-22","vig":7,"trans":null},{"snies":116876,"nombre":"ESPECIALIZACIÓN EN ANALÍTICA APLICADA A NEGOCIOS","nivel":"Especialización universitaria","mod":"Virtual","res":"4994","ejec":"2024-05-07","vig":7,"trans":null},{"snies":117565,"nombre":"ESPECIALIZACIÓN EN ANALÍTICA Y CIENCIA DE DATOS","nivel":"Especialización universitaria","mod":"Virtual","res":"23876","ejec":"2024-12-23","vig":7,"trans":null},{"snies":117263,"nombre":"ESPECIALIZACIÓN EN DEPORTE ESCOLAR","nivel":"Especialización universitaria","mod":"Virtual","res":"15763","ejec":"2024-10-03","vig":7,"trans":null},{"snies":4266,"nombre":"ESPECIALIZACION EN EDUCACION AMBIENTAL Y DESARROLLO DE LA COMUNIDAD","nivel":"Especialización universitaria","mod":"Virtual","res":"4693","ejec":"2022-04-20","vig":7,"trans":null},{"snies":117817,"nombre":"ESPECIALIZACIÓN EN GERENCIA FINANCIERA Y CONTABLE","nivel":"Especialización universitaria","mod":"Virtual","res":"1813","ejec":"2025-02-26","vig":7,"trans":null},{"snies":9949,"nombre":"ESPECIALIZACION EN GERENCIA PARA EL DESARROLLO ORGANIZACIONAL","nivel":"Especialización universitaria","mod":"Presencial","res":"14020","ejec":"2018-08-15","vig":7,"trans":null},{"snies":115949,"nombre":"ESPECIALIZACIÓN EN GERENCIA PARA LA TRANSFORMACIÓN DIGITAL","nivel":"Especialización universitaria","mod":"Virtual","res":"12082","ejec":"2022-12-07","vig":7,"trans":"1/1/2026"},{"snies":117986,"nombre":"ESPECIALIZACIÓN EN GESTIÓN DE LA SEGURIDAD Y SALUD EN EL TRABAJO","nivel":"Especialización universitaria","mod":"Virtual","res":"2943","ejec":"2025-04-08","vig":7,"trans":null},{"snies":106077,"nombre":"ESPECIALIZACIÓN EN GESTIÓN DEL TALENTO HUMANO Y LA PRODUCTIVIDAD","nivel":"Especialización universitaria","mod":"Virtual","res":"15922","ejec":"2020-02-11","vig":7,"trans":null},{"snies":117372,"nombre":"ESPECIALIZACIÓN EN INTELIGENCIA ARTIFICIAL","nivel":"Especialización universitaria","mod":"Virtual","res":"7145","ejec":"2024-07-11","vig":7,"trans":null},{"snies":117725,"nombre":"MAESTRÍA EN AGROECOLOGÍA Y DESARROLLO AGROECOTURÍSTICO SOSTENIBLE","nivel":"Maestría","mod":"Virtual","res":"1293","ejec":"2025-02-05","vig":7,"trans":null},{"snies":117727,"nombre":"MAESTRÍA EN ANALÍTICA APLICADA","nivel":"Maestría","mod":"Virtual","res":"1295","ejec":"2025-02-05","vig":7,"trans":null},{"snies":117870,"nombre":"MAESTRÍA EN CIENCIA DE DATOS Y ANALÍTICA","nivel":"Maestría","mod":"Virtual","res":"3408","ejec":"2025-03-27","vig":7,"trans":null},{"snies":110979,"nombre":"MAESTRÍA EN CIENCIAS DE LA EDUCACIÓN","nivel":"Maestría","mod":"Virtual","res":"13789","ejec":"2021-06-18","vig":7,"trans":null},{"snies":117337,"nombre":"MAESTRÍA EN GESTIÓN DE LA INNOVACIÓN TECNOLÓGICA","nivel":"Maestría","mod":"Virtual","res":"16904","ejec":"2024-10-24","vig":7,"trans":null},{"snies":117814,"nombre":"MAESTRÍA EN GESTIÓN DEL TALENTO HUMANO","nivel":"Maestría","mod":"Virtual","res":"2053","ejec":"2025-02-26","vig":7,"trans":null}];
const RC_DEFAULT = JSON.parse(JSON.stringify(BASE));

/* ================== STATE ================== */
let P, fEstado, fNivel, fTexto;
let HOY;
let chSemI, chVencI, chAEI, chRadI, chNivelI, chLineaI;
let vencPorAnioSel = {};
let __rcReady = false;

/* ================== Chart.js defaults ================== */
const tt={backgroundColor:C.vOsc,borderColor:C.vLim,borderWidth:1,titleFont:{weight:'800',size:11},bodyFont:{size:11,weight:'500'},padding:10};
const dlBar = {color:'#fff', font:{weight:'900', size:12}, anchor:'center', align:'center'};
const dlTop = {color:C.vOsc, font:{weight:'900', size:12}, anchor:'end', align:'top', offset:-2};

/* ================== UPLOAD HANDLER ================== */
async function __rcHandleExcel(ev){
  const f = ev.target.files[0]; if(!f) return;
  const msg = document.getElementById('upMsg');
  try{
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf,{type:'array',cellDates:true});
    const ws = wb.Sheets[wb.SheetNames[0]];
    const js = XLSX.utils.sheet_to_json(ws,{defval:null});
    if(!js.length) throw new Error('La hoja está vacía');
    const keys = Object.keys(js[0]);
    const cSnies = buscaCol(keys,'snies');
    const cNom   = buscaCol(keys,'nombredelprograma','nombre');
    const cNiv   = buscaCol(keys,'niveldeformacion','nivel');
    const cMod   = buscaCol(keys,'modalidad');
    const cRes   = buscaCol(keys,'resoluciondeaprobacion','resolucion');
    const cEjec  = buscaCol(keys,'ejecutoria');
    const cFres  = buscaCol(keys,'fechaderesolucion','fecharesolucion');
    const cVig   = buscaCol(keys,'vigenciaanos','vigencia');
    const cTrans = keys.find(k=>norm(k).includes('transitoria'));
    const cAcad = buscaCol(keys,'nivelacademico');
    if(!cSnies||!cNom||(!cEjec&&!cFres)) throw new Error('No se encontraron las columnas mínimas (SNIES, NOMBRE, FECHA_EJECUTORIA)');
    const nuevos=[];
    for(const r of js){
      if(r[cSnies]==null || r[cNom]==null) continue;
      const ejec = aFecha(r[cEjec]) || aFecha(r[cFres]);
      if(!ejec) continue;
      if(cAcad && r[cAcad] && String(r[cAcad]).trim()!=='Posgrado') continue;
      let vigV = 7;
      if(cVig && r[cVig]!=null){ const n=parseInt(String(r[cVig]).replace(/\D/g,'')); if(n>0&&n<=15) vigV=n; }
      let transV = null;
      if(cTrans && r[cTrans]!=null && String(r[cTrans]).trim()!==''){
        const td=aFecha(r[cTrans]); transV = td? td.toLocaleDateString('es-CO') : String(r[cTrans]).trim();
      }
      nuevos.push({
        snies:String(r[cSnies]).trim(),
        nombre:String(r[cNom]).trim(),
        nivel:cNiv&&r[cNiv]?String(r[cNiv]).trim():'Sin nivel',
        mod:cMod&&r[cMod]?String(r[cMod]).trim():'-',
        res:cRes&&r[cRes]!=null?String(r[cRes]).trim():'-',
        ejec, vig:vigV, trans:transV
      });
    }
    if(!nuevos.length) throw new Error('No se pudo leer ningún programa válido');
    P = procesa(nuevos);
    document.getElementById('srcName').textContent = f.name;
    msg.className='upload-msg ok';
    msg.textContent = '✓ Datos actualizados: '+nuevos.length+' programas cargados de "'+f.name+'"';
    fEstado='all'; fNivel='all'; fTexto='';
    document.getElementById('q').value='';
    document.querySelectorAll('.chip.est').forEach((x,i)=>x.classList.toggle('on',i===0));
    document.querySelectorAll('.chip.niv').forEach((x,i)=>x.classList.toggle('on',i===0));
    rcRender();
  }catch(e){
    msg.className='upload-msg err';
    msg.textContent = '✗ No se pudo cargar: '+e.message+'. Verifique que sea el Excel SNIES con la estructura habitual.';
  }
  ev.target.value='';
}

/* ================== RESTORE ================== */
function restoreRCDefaults(){
  P = procesa(RC_DEFAULT);
  document.getElementById('srcName').textContent = 'base inicial';
  document.getElementById('upMsg').className = 'upload-msg';
  document.getElementById('upMsg').textContent = '';
  fEstado = 'all'; fNivel = 'all'; fTexto = '';
  document.getElementById('q').value = '';
  document.querySelectorAll('.chip.est').forEach((x,i)=>x.classList.toggle('on',i===0));
  document.querySelectorAll('.chip.niv').forEach((x,i)=>x.classList.toggle('on',i===0));
  rcRender();
}

/* ================== RENDER ================== */
function rcRender(){
  const S = filtrados();
  document.getElementById('fcount').textContent = S.length;
  document.getElementById('nprog').textContent = P.length;

  const kCounts = rcRenderKPIs(S, P);

  vencPorAnioSel = {};
  S.forEach(p=>{const y=p.venc.getFullYear();(vencPorAnioSel[y]=vencPorAnioSel[y]||[]).push(p)});
  const aniosSel = Object.keys(vencPorAnioSel).map(Number).sort((a,b)=>a-b);
  const sel = document.getElementById('selAnio');
  const prev = sel.value;
  sel.innerHTML='';
  aniosSel.forEach(y=>{const o=document.createElement('option');o.value=y;o.textContent=y;sel.appendChild(o)});
  if(aniosSel.includes(+prev)) sel.value=prev;
  else if(aniosSel.includes(HOY.getFullYear()+1)) sel.value=HOY.getFullYear()+1;
  updConsulta();

  pintaGantt(S);

  rcDestroyCharts();
  rcRenderCharts(S, aniosSel, vencPorAnioSel, kCounts);
  rcRenderTable(S);
}

/* ================== MAIN ENTRY ================== */
function renderRegistroCalificado(){
  if(!__rcReady){
    document.getElementById('rc-content').innerHTML = `
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

    HOY = new Date(); HOY.setHours(0,0,0,0);
    P = procesa(BASE);
    fEstado = 'all';
    fNivel = 'all';
    fTexto = '';

    document.getElementById('hoy').textContent = fmt(HOY);

    document.getElementById('fileX').addEventListener('change', __rcHandleExcel);

    document.querySelectorAll('.chip.est').forEach(c=>c.addEventListener('click',()=>{
      document.querySelectorAll('.chip.est').forEach(x=>x.classList.remove('on'));
      c.classList.add('on'); fEstado=c.dataset.f; rcRender();
    }));
    document.querySelectorAll('.chip.niv').forEach(c=>c.addEventListener('click',()=>{
      document.querySelectorAll('.chip.niv').forEach(x=>x.classList.remove('on'));
      c.classList.add('on'); fNivel=c.dataset.n; rcRender();
    }));
    document.getElementById('q').addEventListener('input',e=>{fTexto=e.target.value.toLowerCase();rcRender()});
    document.getElementById('selAnio').addEventListener('change',updConsulta);

    Chart.register(ChartDataLabels);
    Chart.defaults.font.family = 'Montserrat';
    Chart.defaults.font.weight = 600;
    Chart.defaults.color = C.gris;
    Chart.defaults.borderColor = '#e4ece4';
    Chart.defaults.plugins.datalabels.display = ctx => {
      const v = ctx.dataset.data[ctx.dataIndex];
      return v !== 0 && v !== null && v !== undefined;
    };

    __rcReady = true;
  }

  const d = new Date(); d.setHours(0,0,0,0);
  HOY = d;
  document.getElementById('hoy').textContent = fmt(HOY);

  rcRender();
}
