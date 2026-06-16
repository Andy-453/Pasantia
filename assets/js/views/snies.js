/**
 * Vista: SNIES (análisis de indicadores SNIES con Chart.js)
 * Dependencias runtime: _snFac, _snProg, SD (AppState-backed), Chart (CDN)
 */

function renderSNIES(){
  var wrap=document.getElementById('snies-content');
  if(!wrap) return;
  var _dev = !window.__UDEC_EMBEDDED__;
  var hasExternalData = _dev && AppState.snies.SD && AppState.snies.SD.programs && AppState.snies.SD.programs.length > 0 && AppState.snies.SD.programs[0].facultad !== undefined;
  var facs=['TODAS','Ciencias Admin., Econ. y Contables','Ciencias Agropecuarias','Educación','Ciencias del Deporte y Ed. Física'];
  var FAC_COL={'Ciencias Admin., Econ. y Contables':'#006633','Ciencias Agropecuarias':'#2e8b57','Educación':'#C8A43A','Ciencias del Deporte y Ed. Física':'#185FA5'};
  var FAC_MP={'Espec. Educación Ambiental y Desarrollo Comunidad':'Ciencias Agropecuarias','Espec. Agronegocios Sostenibles':'Ciencias Agropecuarias','Maestría en Ciencias Ambientales':'Ciencias Agropecuarias','Espec. Gerencia para el Desarrollo Organizacional':'Ciencias Admin., Econ. y Contables','Espec. Gerencia para la Transformación Digital':'Ciencias Admin., Econ. y Contables','Espec. Gestión Pública':'Ciencias Admin., Econ. y Contables','Espec. Marketing Digital':'Ciencias Admin., Econ. y Contables','Espec. Negocios y Comercio Electrónico':'Ciencias Admin., Econ. y Contables','Espec. Gestión de Sistemas de Información Gerencial':'Ciencias Admin., Econ. y Contables','Espec. Procesos Pedagógicos Entrenamiento Deportivo':'Ciencias del Deporte y Ed. Física','Doctorado en Ciencias de la Educación':'Educación','Maestría en Educación':'Educación'};
  var AÑOS=[2020,2021,2022,2023,2024];
  var n=function(v){return isNaN(+v)?0:+v;};
  var fmt=function(v){return Math.round(n(v)).toLocaleString('es-CO');};
  var fmtP=function(v){return n(v).toFixed(1)+'%';};
  var progs=_snFac==='TODAS'?(SD&&SD.programs||[]):(SD&&SD.programs||[]).filter(function(p){return FAC_MP[p.name]===_snFac;});
  if(!_snProg||!progs.find(function(p){return p.name===_snProg;})) _snProg=progs.length?progs[0].name:null;
  var prog=_snProg?(SD&&SD.programs||[]).find(function(p){return p.name===_snProg;}):null;
  var fc=_snFac==='TODAS'?'#006633':(FAC_COL[_snFac]||'#006633');
  var facBtns=facs.map(function(f){var a=f===_snFac;var c=FAC_COL[f]||'#006633';return '<button data-action="snies-set-fac" data-fac="'+f.replace(/"/g,'&quot;')+'" style="padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid '+(a?c:'#d0e4d8')+';background:'+(a?c:'#fff')+';color:'+(a?'#fff':'#555')+'">'+( f==='TODAS'?'Todas':f)+'</button>';}).join('');
  var progBtns=progs.map(function(p){var a=p.name===_snProg;var c=FAC_COL[FAC_MP[p.name]]||fc;return '<button data-action="snies-set-prog" data-prog="'+p.name.replace(/"/g,'&quot;')+'" style="padding:5px 12px;border-radius:8px;font-size:10px;font-weight:600;cursor:pointer;border:1.5px solid '+(a?c:'#d8e8dc')+';background:'+(a?c+'18':'#fff')+';color:'+(a?c:'#555')+'">'+p.name.replace('Espec. ','').replace('Maestría en ','Mae. ').replace('Doctorado en ','Doc. ')+'</button>';}).join('');
  var h='<div style="padding:.5rem 0">';
  h+='<div style="font-size:14px;font-weight:700;color:#006633;margin-bottom:1rem;display:flex;align-items:center;gap:8px"><span style="width:4px;height:20px;background:#006633;border-radius:2px;display:inline-block"></span>Análisis SNIES · Posgrados 2020–2024</div>';
if (_dev) {
  h+='<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center">' +
    '<button onclick="_sniesImportClick()" style="padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid #006633;background:#fff;color:#006633">Importar Excel SNIES</button>' +
    '<button onclick="_sniesResetClick()" style="padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid #ccc;background:#fff;color:#888">Restablecer datos</button>' +
    (hasExternalData ? '<span style="font-size:10px;color:#006633;font-weight:600">&#10003; Datos importados</span>' : '') +
    '</div>';
}
  if(!SD || !SD.programs || !SD.programs.length){
    wrap.innerHTML=h+'<div style="padding:2rem;text-align:center;color:#aaa">' + (_dev ? 'Sin programas para mostrar. Importe un archivo Excel con datos SNIES.' : 'Sin programas para mostrar.') + '</div>';
    return;
  }
  h+='<div style="background:#fff;border-radius:10px;border:1px solid #e0ece4;padding:12px 16px;margin-bottom:10px"><div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#999;margin-bottom:8px">Facultad</div><div style="display:flex;gap:7px;flex-wrap:wrap">'+facBtns+'</div></div>';
  h+='<div style="background:#fff;border-radius:10px;border:1px solid #e0ece4;padding:12px 16px;margin-bottom:1rem"><div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#999;margin-bottom:8px">Programa</div><div style="display:flex;gap:7px;flex-wrap:wrap">'+progBtns+'</div></div>';
  if(!prog){
    h+='<div style="padding:2rem;text-align:center;color:#aaa">Seleccione un programa para ver sus indicadores SNIES.</div>';
  } else {
    var y24=prog.years&&prog.years['2024']||{},y23=prog.years&&prog.years['2023']||{};
    var nivCol={'Especialización':'#3aaa72','Maestría':'#C8A43A','Doctorado':'#0d3d22'};
    var _isImported = prog._source === 'imported';
    var _isInInline = _isImported && AppState.snies.defaultSD && AppState.snies.defaultSD.programs && AppState.snies.defaultSD.programs.some(function(p){return p.name===prog.name;});
    var _actLabel = _isInInline ? 'Restaurar original' : 'Eliminar programa';
    var _actColor = _isInInline ? '#d4a017' : '#c0392b';
    h+='<div style="background:'+fc+'12;border-radius:10px;border-left:4px solid '+fc+';padding:12px 16px;margin-bottom:1rem"><div style="font-size:13px;font-weight:700;color:'+fc+'">'+prog.name+'</div><div style="display:flex;align-items:center;gap:8px;margin-top:6px"><span style="background:'+(nivCol[prog.nivel]||'#888')+';color:#fff;padding:2px 9px;border-radius:8px;font-size:9px;font-weight:700">'+prog.nivel+'</span>'+
      (_dev && _isImported?'<button onclick="App.removeSniesProgram(\''+prog.name.replace(/"/g,'&quot;')+'\')" style="padding:4px 10px;border-radius:8px;font-size:10px;font-weight:600;cursor:pointer;border:1.5px solid '+_actColor+';background:#fff;color:'+_actColor+'">'+_actLabel+'</button>':'')+
    '</div></div>';
    h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px">';
    var kpis=[['Matriculados 2024',fmt(y24.mat),'vs '+fmt(y23.mat)+' en 2023',fc],['Graduados 2024',fmt(y24.grad),'vs '+fmt(y23.grad)+' en 2023','#C8A43A'],['Inscritos 2024',fmt(y24.ins),'vs '+fmt(y23.ins)+' en 2023','#185FA5'],['Admitidos 2024',fmt(y24.adm),'vs '+fmt(y23.adm)+' en 2023','#0891b2']];
    kpis.forEach(function(k){h+='<div style="background:#fff;border-radius:10px;border:1px solid #e0ece4;border-left:4px solid '+k[3]+';padding:12px 14px"><div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#999;margin-bottom:5px">'+k[0]+'</div><div style="font-size:26px;font-weight:800;color:'+k[3]+';font-family:monospace">'+k[1]+'</div><div style="font-size:10px;color:#888;margin-top:3px">'+k[2]+'</div></div>';});
    h+='</div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';
    h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden"><div style="padding:10px 14px;border-bottom:1px solid #f0f4f0;font-size:10px;font-weight:700;color:'+fc+';text-transform:uppercase">Flujo estudiantil 2020–2024</div><div style="padding:12px;height:220px"><canvas id="sn-flujo"></canvas></div></div>';
    h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden"><div style="padding:10px 14px;border-bottom:1px solid #f0f4f0;font-size:10px;font-weight:700;color:#C8A43A;text-transform:uppercase">Tasas indicadores %</div><div style="padding:12px;height:220px"><canvas id="sn-tasas"></canvas></div></div>';
    h+='</div>';
    h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden">';
    h+='<div style="padding:10px 14px;background:'+fc+';color:#fff;font-size:10px;font-weight:700;text-transform:uppercase">Histórico 2020–2024 · '+prog.name+'</div>';
    h+='<table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr style="background:'+fc+'22">';
    ['Año','Inscritos','Admitidos','Matriculados','Graduados','T.Absorción','T.Selectividad','T.Graduación','% H','% M'].forEach(function(c){h+='<th style="padding:8px;text-align:center">'+c+'</th>';});
    h+='</tr></thead><tbody>';
    AÑOS.forEach(function(y){var d=prog.years&&prog.years[String(y)]||{},has=n(d.mat)+n(d.grad)+n(d.ins)>0,bg=y===2024?'background:#e6f2eb':'';h+='<tr style="border-bottom:1px solid #edf2ee;'+bg+'"><td style="padding:7px 10px;font-weight:'+(y===2024?'700':'400')+';color:'+(y===2024?fc:'#333')+'">'+y+'</td>';[d.ins,d.adm,d.mat,d.grad].forEach(function(v){h+='<td style="padding:7px;text-align:center;font-family:monospace">'+(has?fmt(v):'—')+'</td>';});[d.tabs,d.tsel,d.tgrad,d.pctH,d.pctM].forEach(function(v){h+='<td style="padding:7px;text-align:center;font-family:monospace">'+(has?fmtP(v):'—')+'</td>';});h+='</tr>';});
    h+='</tbody></table></div>';
    h+='</div>';
    wrap.innerHTML=h;
    setTimeout(function(){
      var lo={responsive:true,maintainAspectRatio:false,animation:{duration:500},plugins:{legend:{position:'bottom',labels:{font:{size:9},boxWidth:10,padding:8}},tooltip:{mode:'index',intersect:false}}};
      function ds(lbl,data,color,type,fill){return{type:type||'bar',label:lbl,data:data,backgroundColor:type==='line'?'transparent':color+'bb',borderColor:color,borderWidth:2,tension:.4,fill:fill||false,pointRadius:type==='line'?4:0,pointBackgroundColor:color,pointBorderColor:'#fff',pointBorderWidth:2,borderRadius:type==='bar'?4:0};}
      if(document.getElementById('sn-flujo') && typeof Chart==='function'){
        new Chart(document.getElementById('sn-flujo'),{type:'bar',data:{labels:AÑOS,datasets:[ds('Inscritos',AÑOS.map(function(y){return n(prog.years[String(y)].ins);}), '#378ADD'),ds('Admitidos',AÑOS.map(function(y){return n(prog.years[String(y)].adm);}),fc),ds('Matriculados',AÑOS.map(function(y){return n(prog.years[String(y)].mat);}), '#C8A43A'),Object.assign(ds('Graduados',AÑOS.map(function(y){return n(prog.years[String(y)].grad);}), '#c0392b','line'),{order:-1})]},options:lo});
      }
      if(document.getElementById('sn-tasas') && typeof Chart==='function'){
        var lo2=JSON.parse(JSON.stringify(lo));lo2.scales={y:{ticks:{callback:function(v){return v+'%'}},beginAtZero:true}};
        new Chart(document.getElementById('sn-tasas'),{type:'line',data:{labels:AÑOS,datasets:[ds('Absorción',AÑOS.map(function(y){return n(prog.years[String(y)].tabs);}),'#C8A43A','line'),ds('Selectividad',AÑOS.map(function(y){return n(prog.years[String(y)].tsel);}), '#185FA5','line'),ds('Graduación',AÑOS.map(function(y){return n(prog.years[String(y)].tgrad);}),fc,'line')]},options:lo2});
      }
    },150);
  }
}

window.App = window.App || {};
window.App.renderSNIES = renderSNIES;

// ===== CONTROLES DE IMPORTACIÓN EXCEL SNIES =====
// Crea input[type=file] oculto una sola vez y conecta con App.importSniesExcel
(function(){
  if (document.getElementById('snies-excel-input')) return;
  var inp = document.createElement('input');
  inp.id = 'snies-excel-input';
  inp.type = 'file';
  inp.accept = '.xlsx,.xls';
  inp.style.display = 'none';
  inp.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    if (typeof importSniesExcel !== 'function') {
      if (typeof toast === 'function') toast('Error: importSniesExcel no disponible');
      return;
    }
    importSniesExcel(file).then(function(result) {
      if (!result.success) {
        var msg = result.errors ? result.errors.join(' | ') : 'Error desconocido';
        if (typeof toast === 'function') toast('Error: ' + msg);
        console.error('[SNIES] Errores de importación:', result.errors);
      }
      // En éxito: importSniesExcel ya muestra toast + re-render
    });
    e.target.value = '';
  });
  document.body.appendChild(inp);
})();

function _sniesImportClick() {
  var inp = document.getElementById('snies-excel-input');
  if (inp) inp.click();
}

function _sniesResetClick() {
  if (typeof App !== 'undefined' && typeof App.clearSnies === 'function') {
    App.clearSnies();
  }
}
