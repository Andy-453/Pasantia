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
    P = procesa(nuevos, HOY);
    window.__rcRaw = nuevos.map(function(p){
      var o = {}; for(var k in p) o[k] = p[k];
      if(o.ejec instanceof Date) o.ejec = o.ejec.getFullYear()+'-'+String(o.ejec.getMonth()+1).padStart(2,'0')+'-'+String(o.ejec.getDate()).padStart(2,'0');
      if(o.trans instanceof Date) o.trans = o.trans.getFullYear()+'-'+String(o.trans.getMonth()+1).padStart(2,'0')+'-'+String(o.trans.getDate()).padStart(2,'0');
      return o;
    });
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
  P = procesa(RC_DEFAULT, HOY);
  window.__rcRaw = null;
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

  const kCounts = rcRenderKPIs(S, P, HOY);

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

  pintaGantt(S, HOY);

  rcDestroyCharts();
  rcRenderCharts(S, aniosSel, vencPorAnioSel, kCounts, HOY);
  rcRenderTable(S, HOY);
}

/* ================== MAIN ENTRY ================== */
function renderRegistroCalificado(){
  if(!__rcReady){
    document.getElementById('rc-content').innerHTML = rcTemplate();

    HOY = new Date(); HOY.setHours(0,0,0,0);
    P = procesa(
      window.__EMBEDDED_RC && window.__EMBEDDED_RC.length ? window.__EMBEDDED_RC : window.__rcRaw || BASE,
      HOY);
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
