/**
 * pipeline.js — Vista de Pipeline (Estado de desarrollo)
 * ---
 * Responsabilidad:
 *   - renderPipeline: tablero de estado de desarrollo con KPIs,
 *     cronograma trimestral y tablas colapsables por estado.
 *
 * Dependencias:
 *   - AppData.getFacultades() — capa de datos
 *   - document.getElementById('pipeline-content') — contenedor DOM
 */

function renderPipeline(){
  var wrap=document.getElementById('pipeline-content');
  if(!wrap) return;
  var G='#006633',OR='#C8A43A',BL='#185FA5',RD='#c0392b',AM='#d97706';
  var MESES=['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var TRI_COL={T1:BL,T2:G,T3:OR,T4:RD};
  var TRI_BG={T1:'#e6f0fb',T2:'#e6f2eb',T3:'#fdf6e3',T4:'#fee2e2'};
  function getTri(mes){if(!mes)return null;if(mes<=3)return 'T1';if(mes<=6)return 'T2';if(mes<=9)return 'T3';return 'T4';}
  function getTriLabel(t){return {T1:'I Trimestre (Ene\u2013Mar)',T2:'II Trimestre (Abr\u2013Jun)',T3:'III Trimestre (Jul\u2013Sep)',T4:'IV Trimestre (Oct\u2013Dic)'}[t]||'';}
  function fsn(name){return name.replace('Facultad de ','').replace('Facultad ','').split(',')[0].trim();}
  function estCol(e){var k=(e||'').toLowerCase();if(k.includes('obtención')||k.includes('registro'))return G;if(k.includes('radicado')||k.includes('radicación'))return BL;if(k.includes('en construcción'))return AM;if(k.includes('por construir')||k.includes('proyección'))return OR;if(k.includes('negado'))return RD;return '#888';}
  var all=[];
  AppData.getFacultades().forEach(function(fac){
    fac.progs.forEach(function(p){
      p.lineas.forEach(function(l){all.push({fac:fsn(fac.name),nivel:'Especialización',nombre:l.esp,estado:l.e||'',oferta:l.o,resp:l.resp||'',mes:l.mes||null,ano:l.ano||null});});
      p.mae.forEach(function(m){all.push({fac:fsn(fac.name),nivel:'Maestría',nombre:m.n,estado:m.e||'',oferta:m.o,resp:m.resp||'',mes:m.mes||null,ano:m.ano||null});});
    });
    if(fac.doc) all.push({fac:fsn(fac.name),nivel:'Doctorado',nombre:fac.doc.n,estado:fac.doc.e||'',oferta:fac.doc.o,resp:fac.doc.resp||'',mes:fac.doc.mes||null,ano:fac.doc.ano||null});
  });
  function grp(items,test){return items.filter(function(x){return test((x.estado||'').toLowerCase());});}
  var grupos={
    construccion:grp(all,function(e){return e.includes('en construcción');}),
    porConstruir:grp(all,function(e){return e.includes('por construir')||e.includes('proyección')||e.includes('nueva propuesta')||e.includes('resignificación');}),
    radicado:grp(all,function(e){return e.includes('radicado')||e.includes('radicación')||e.includes('entregado');}),
    vigente:grp(all,function(e){return e.includes('obtención')||e.includes('registro')||e.includes('oferta');}),
    negado:grp(all,function(e){return e.includes('negado');}),
    reclamacion:grp(all,function(e){return e.includes('reclamación')||e.includes('renovación');}),
  };
  function kpi(ic,lbl,cnt,col){return '<div style="background:#fff;border-radius:10px;border:1px solid #e0ece4;border-left:4px solid '+col+';padding:10px 14px;display:flex;align-items:center;gap:10px"><div style="font-size:20px">'+ic+'</div><div><div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#999">'+lbl+'</div><div style="font-size:24px;font-weight:800;color:'+col+';font-family:monospace">'+cnt+'</div></div></div>';}
  var nivCol={Especialización:G,Maestría:OR,Doctorado:'#0d3d22'};
  function nivBadge(n){return '<span style="background:'+(nivCol[n]||'#888')+';color:#fff;padding:2px 8px;border-radius:7px;font-size:9px;font-weight:700">'+n+'</span>';}
  function tabla(items,color){
    if(!items.length) return '<div style="padding:1.5rem;text-align:center;color:#ccc;font-style:italic;font-size:11px">Sin programas</div>';
    var t='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr style="background:'+color+';color:#fff"><th style="padding:8px 12px;text-align:left">Facultad</th><th style="padding:8px;text-align:center">Nivel</th><th style="padding:8px 10px;text-align:left">Programa</th><th style="padding:8px 10px;text-align:left">Estado</th><th style="padding:8px 10px;text-align:left">👤 Responsable</th><th style="padding:8px;text-align:center">📅 Inicio</th></tr></thead><tbody>';
    items.forEach(function(p,i){
      var tri=getTri(p.mes);
      var fecha=p.mes&&p.ano?'<span style="background:'+(TRI_BG[tri]||'#f5f5f5')+';color:'+(TRI_COL[tri]||'#555')+';padding:2px 7px;border-radius:7px;font-size:9px;font-weight:700">'+MESES[p.mes]+' '+p.ano+'</span>':'<span style="color:#ccc;font-style:italic;font-size:9px">Sin fecha</span>';
      t+='<tr style="border-bottom:1px solid #edf2ee;'+(i%2===0?'background:#fafbfa':'')+'">'
        +'<td style="padding:7px 12px;font-weight:600;color:'+color+';font-size:10px">'+p.fac+'</td>'
        +'<td style="padding:7px;text-align:center">'+nivBadge(p.nivel)+'</td>'
        +'<td style="padding:7px 10px;font-weight:600;font-size:10px">'+p.nombre+'</td>'
        +'<td style="padding:7px 10px;font-size:10px;color:'+estCol(p.estado)+';font-weight:600">'+p.estado+'</td>'
        +'<td style="padding:7px 10px;font-size:10px;color:'+(p.resp?BL:'#ccc')+';font-style:'+(p.resp?'normal':'italic')+'">'+( p.resp||'Sin asignar')+'</td>'
        +'<td style="padding:7px;text-align:center">'+fecha+'</td>'
        +'</tr>';
    });
    return t+'</tbody></table></div>';
  }
  function buildTimeline(items){
    var byYearTri={};
    items.forEach(function(p){if(!p.ano||!p.mes)return;var k=p.ano+'|'+getTri(p.mes);if(!byYearTri[k]){byYearTri[k]={year:p.ano,tri:getTri(p.mes),items:[]};}byYearTri[k].items.push(p);});
    var keys=Object.keys(byYearTri).sort();
    if(!keys.length) return '<div style="padding:1.5rem;text-align:center;color:#ccc;font-size:11px;font-style:italic">Agrega fecha de inicio en el Editor para ver los programas aquí</div>';
    var years=[...new Set(keys.map(function(k){return parseInt(k.split('|')[0]);}))].sort();
    var h='<div style="padding:14px 16px">';
    years.forEach(function(year){
      h+='<div style="margin-bottom:1.5rem"><div style="font-size:12px;font-weight:800;color:#1a2e1a;margin-bottom:10px;display:flex;align-items:center;gap:8px"><span style="background:#006633;color:#fff;padding:3px 12px;border-radius:20px;font-size:11px">'+year+'</span></div>';
      h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">';
      ['T1','T2','T3','T4'].forEach(function(tri){
        var k=year+'|'+tri,g=byYearTri[k],col=TRI_COL[tri],bg=TRI_BG[tri];
        h+='<div style="border-radius:10px;border:1.5px solid '+(g?col:'#e8f0e8')+';overflow:hidden;background:'+(g?bg:'#fafafa')+'">'
          +'<div style="background:'+(g?col:'#e8f0e8')+';padding:7px 10px;display:flex;align-items:center;justify-content:space-between"><span style="font-size:10px;font-weight:700;color:'+(g?'#fff':'#bbb')+'">'+getTriLabel(tri).split(' (')[0]+'</span>'+(g?'<span style="background:rgba(255,255,255,.25);color:#fff;border-radius:10px;padding:1px 8px;font-size:10px;font-weight:700">'+g.items.length+'</span>':'')+'</div>';
        if(g){
          h+='<div style="padding:8px 10px">';
          g.items.forEach(function(p){
            h+='<div style="background:#fff;border-radius:7px;border:1px solid '+col+'33;padding:7px 9px;margin-bottom:6px">'
              +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-bottom:4px">'
                +'<div style="font-size:10px;font-weight:600;color:#1a2e1a;line-height:1.3">'+p.nombre+'</div>'
                +'<span style="background:'+col+';color:#fff;padding:1px 6px;border-radius:6px;font-size:8px;font-weight:700;white-space:nowrap;flex-shrink:0">'+MESES[p.mes]+'</span>'
              +'</div>'
              +'<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">'
                +'<span style="background:'+(nivCol[p.nivel]||'#888')+'22;color:'+(nivCol[p.nivel]||'#888')+';padding:1px 7px;border-radius:6px;font-size:8px;font-weight:700">'+p.nivel+'</span>'
                +(p.resp?'<span style="font-size:9px;color:#555">👤 '+p.resp+'</span>':'<span style="font-size:9px;color:#ccc;font-style:italic">Sin responsable</span>')
              +'</div>'
              +'<div style="margin-top:3px"><span style="font-size:9px;color:'+estCol(p.estado)+';font-weight:600">'+p.estado+'</span> <span style="font-size:9px;color:#aaa">· '+p.fac+'</span></div>'
              +'</div>';
          });
          h+='</div>';
        } else {
          h+='<div style="padding:12px 10px;text-align:center;color:#ccc;font-size:10px">Sin programas</div>';
        }
        h+='</div>';
      });
      h+='</div></div>';
    });
    return h+'</div>';
  }
  var conFecha=grupos.construccion.concat(grupos.porConstruir).filter(function(x){return x.mes&&x.ano;});
  var secIdx=0;
  function sec(ic,titulo,sub,items,col,bg){
    var id='sec'+(secIdx++);
    return '<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden;margin-bottom:.75rem">'
      +'<div style="background:'+bg+';padding:13px 16px;border-bottom:2px solid '+col+';display:flex;align-items:center;justify-content:space-between;cursor:pointer" data-action="toggle-section" data-sec-id="'+id+'">'
        +'<div style="display:flex;align-items:center;gap:10px"><div style="width:34px;height:34px;border-radius:50%;background:'+col+';display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0">'+ic+'</div>'
        +'<div><div style="font-size:13px;font-weight:700;color:'+col+'">'+titulo+'</div><div style="font-size:10px;color:#666;margin-top:1px">'+sub+'</div></div></div>'
        +'<div style="display:flex;align-items:center;gap:10px"><span style="background:'+col+';color:#fff;border-radius:20px;padding:3px 14px;font-size:13px;font-weight:700">'+items.length+'</span><span id="icon-'+id+'" style="color:'+col+';font-size:16px;font-weight:700">▸</span></div>'
      +'</div>'
      +'<div id="'+id+'" style="display:none">'+tabla(items,col)+'</div>'
      +'</div>';
  }
  var h='<div style="padding:.5rem 0">';
  h+='<div style="font-size:15px;font-weight:700;color:#1a2e1a;margin-bottom:1rem;display:flex;align-items:center;gap:8px"><span style="width:4px;height:22px;background:#006633;border-radius:2px;display:inline-block"></span>Estado de desarrollo — Programas de posgrado</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:1.2rem">'
    +kpi('✅','Vigente',grupos.vigente.length,G)
    +kpi('📋','Radicado MEN',grupos.radicado.length,BL)
    +kpi('🔧','En construcción',grupos.construccion.length,AM)
    +kpi('📝','Por construir',grupos.porConstruir.length,OR)
    +kpi('❌','Negado MEN',grupos.negado.length,RD)
    +kpi('⚖️','Reclamación',grupos.reclamacion.length,'#dc2626')
  +'</div>';
  h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden;margin-bottom:1rem">'
    +'<div style="background:#1a2e1a;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer" data-action="toggle-section" data-sec-id="timeline">'
      +'<div style="display:flex;align-items:center;gap:10px"><span style="font-size:18px">📊</span><div><div style="font-size:13px;font-weight:700;color:#fff">Cronograma por trimestre</div><div style="font-size:10px;color:rgba(200,164,58,.8)">Programas en desarrollo con fecha asignada · '+conFecha.length+' programas</div></div></div>'
      +'<span id="icon-timeline" style="color:#C8A43A;font-size:16px;font-weight:700">▸</span>'
    +'</div>'
    +'<div id="timeline">'+buildTimeline(conFecha)+'</div>'
  +'</div>';
  h+=sec('🔧','En construcción',grupos.construccion.length+' programas con desarrollo activo',grupos.construccion,AM,'#fffdf5');
  h+=sec('📝','Por construir',grupos.porConstruir.length+' programas identificados',grupos.porConstruir,OR,'#fff9f0');
  h+=sec('📋','Radicado MEN',grupos.radicado.length+' programas en evaluación',grupos.radicado,BL,'#f0f6ff');
  h+=sec('⚖️','En reclamación',grupos.reclamacion.length+' con observaciones del MEN',grupos.reclamacion,'#dc2626','#fff8f8');
  h+=sec('❌','Negado MEN',grupos.negado.length+' con resolución negativa',grupos.negado,RD,'#fff5f5');
  h+=sec('✅','Vigente',grupos.vigente.length+' programas activos con registro',grupos.vigente,G,'#f0fdf4');
  h+='</div>';
  wrap.innerHTML=h;
}
