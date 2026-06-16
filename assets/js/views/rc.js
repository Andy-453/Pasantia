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
  const S = filtrados(P, fEstado, fNivel, fTexto);
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
