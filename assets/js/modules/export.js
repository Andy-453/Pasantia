/**
 * export.js — Exportaciones y descargas de datos
 * ---
 * Responsabilidad:
 *   - downloadDB: descarga CSV con toda la base de datos (facultades, programas, SNIES)
 *   - exportSNIES: descarga CSV con datos históricos SNIES
 *   - getSniesPreg / getSniesEsp: helpers de búsqueda SNIES para downloadDB
 *   - SNIES_PRE_MAP / SNIES_ESP_MAP: mapas de códigos SNIES (usados por los helpers)
 *
 * Dependencias:
 *   - DB (global, app.js) — datos completos para generar CSV
 *   - SD (global, app.js) — datos SNIES para exportSNIES (solo en call-time)
 *   - toast() (utils.js) — notificación al completar descarga
 *   - Blob, URL.createObjectURL — APIs de navegador para descarga de archivos
 *
 * Compatibilidad legacy:
 *   - window.downloadDB — requerido por onclick="downloadDB()" en HTML (línea 27)
 *   - window.exportSNIES — expuesto para futura integración en panel SNIES
 *
 * Riesgos de acoplamiento:
 *   - Dependencia de estructura DB: si cambia la forma de los objetos,
 *     el CSV generado por downloadDB se desincronizará.
 *   - SNIES_PRE_MAP y SNIES_ESP_MAP deben mantenerse actualizados
 *     con los códigos SNIES reales de la Universidad.
 *   - exportSNIES depende de SD (global), que se define en app.js después
 *     de export.js. Seguro porque solo se ejecuta por evento (click).
 *
 * TODO [MVC]:
 *   - Separar mapas SNIES a un módulo de datos independiente (snies-data.js).
 *   - Migrar downloadDB a generación asíncrona si DB crece significativamente.
 *   - Unificar CSV generation en un helper compartido.
 *
 * Estado:
 *   Extraído de app.js. Sin cambios funcionales.
 */

// ===== MAPAS SNIES =====
const SNIES_PRE_MAP = {
  'INGENIERÍA DE SOFTWARE|SOACHA': '110946',
  'INGENIERÍA DE SOFTWARE|GIRARDOT': '116101',
  'INGENIERIA DE SOFTWARE|GIRARDOT': '116101',
  'INGENIERIA DE SISTEMAS Y COMPUTACION|FUSAGASUGÁ': '109964',
  'INGENIERIA DE SISTEMAS Y COMPUTACION|FACATATIVÁ': '109965',
  'INGENIERÍA DE SISTEMAS Y COMPUTACIÓN|CHÍA': '111350',
  'INGENIERÍA DE SISTEMAS Y COMPUTACIÓN|UBATE': '116385',
  'INGENIERIA ELECTRONICA|FUSAGASUGÁ': '4086',
  'INGENIERIA INDUSTRIAL|SOACHA-CHÍA': '53872',
  'INGENIERÍA MECATRÓNICA|CHÍA': '116851',
  'ADMINISTRACIÓN DE EMPRESAS|FUSAGASUGÁ': '19761',
  'ADMINISTRACIÓN DE EMPRESAS|UBATE': '902',
  'ADMINISTRACIÓN DE EMPRESAS|CHÍA': '19763',
  'ADMINISTRACIÓN DE EMPRESAS|FACATATIVÁ': '19785',
  'ADMINISTRACIÓN DE EMPRESAS|GIRARDOT': '14969',
  'ADMINISTRACIÓN DE EMPRESAS|SOACHA': '117202',
  'CONTADURÍA PÚBLICA|FUSAGASUGÁ': '53714',
  'CONTADURÍA PÚBLICA|SOACHA': '118077',
  'CONTADURÍA PÚBLICA|FACATATIVÁ': '53668',
  'CONTADURÍA PÚBLICA|CHÍA': '53668',
  'CONTADURÍA PÚBLICA|UBATE': '53668',
  'ZOOTECNIA|FUSAGASUGÁ': '889',
  'ZOOTECNIA|UBATE': '889',
  'INGENIERÍA AGRONÓMICA|FUSAGASUGÁ': '1928',
  'INGENIERÍA AGRONÓMICA|FACATATIVÁ': '1928',
  'INGENIERÍA AMBIENTAL|GIRARDOT': '52090',
  'INGENIERÍA AMBIENTAL|FACATATIVÁ': '52090',
  'MEDICINA VETERINARIA Y ZOOTECNIA|UBATE': '117676',
  'INGENIERÍA TOPOGRÁFICA Y GEOMÁTICA|SOACHA': '117898',
  'ENFERMERÍA|GIRARDOT': '898',
  'PSICOLOGÍA|FACATATIVÁ': '90941',
  'LIC. EN EDUCACIÓN FÍSICA, RECREACIÓN Y DEPORTES|FUSAGASUGÁ': '116292',
  'PROFESIONAL EN CIENCIAS DEL DEPORTE|SOACHA': '53776',
  'LIC. EN CIENCIAS SOCIALES|FUSAGASUGÁ': '107037',
  'MÚSICA|ZIPAQUIRÁ': '10528'
};
const SNIES_ESP_MAP = {
  'ESPECIALIZACIÓN EN METODOLOGÍAS DE CALIDAD PARA EL DESARROLLO DEL SOFTWARE': '117580',
  'ESP. EN METODOLOGÍAS DE CALIDAD PARA EL DESARROLLO DEL SOFTWARE': '117580',
  'ESP. EN METODOLOGÍAS DE CALIDAD': '117580',
  'ESPECIALIZACIÓN EN ANALÍTICA Y CIENCIA DE DATOS': '117565',
  'ESP. EN ANALÍTICA Y CIENCIA DE DATOS': '117565',
  'ESPECIALIZACIÓN EN MARKETING DIGITAL': '116654',
  'ESPECIALIZACIÓN EN GESTIÓN PÚBLICA': '116475',
  'ESP. EN GESTIÓN PÚBLICA': '116475',
  'ESPECIALIZACIÓN EN GERENCIA PARA LA TRANSFORMACIÓN DIGITAL': '115949',
  'ESP. GERENCIA PARA LA TRANSFORMACIÓN DIGITAL': '115949',
  'ESPECIALIZACIÓN EN GERENCIA FINANCIERA Y CONTABLE': '117817',
  'ESP. EN GERENCIA FINANCIERA Y CONTABLE': '117817',
  'ESPECIALIZACIÓN EN ANALÍTICA APLICADA A NEGOCIOS': '116876',
  'ESP. EN ANALÍTICA APLICADA A NEGOCIOS': '116876',
  'ESPECIALIZACIÓN EN RECURSOS ZOOGENÉTICOS': '117568',
  'ESP. NUTRICIÓN Y ALIMENTACIÓN ANIMAL ESP. NO CONVENCIONALES': '116370',
  'ESP. NUTRICIÓN Y ALIMENTACIÓN ANIMAL DE ESP. NO CONVENCIONALES': '116370',
  'ESPECIALIZACIÓN EN AGRONEGOCIOS SOSTENIBLES': '116771',
  'ESP. EN AGRONEGOCIOS SOSTENIBLES': '116771',
  'ESP. EN AGROECOLOGÍA Y DESARROLLO AGROECOTURÍSTICO': '116293',
  'ESPECIALIZACIÓN EN AGROECOLOGÍA Y DESARROLLO AGROECOTURÍSTICO': '116293',
  'ESPECIALIZACIÓN EN DEPORTE ESCOLAR': '117263',
  'ESPECIALIZACIÓN EN INFRAESTRUCTURA Y SEGURIDAD DE REDES': '117555',
  'ESP. EN INFRAESTRUCTURA Y SEGURIDAD DE REDES': '117555',
  'ESPECIALIZACIÓN EN INTELIGENCIA ARTIFICIAL': '117675',
  'ESP. EN INTELIGENCIA ARTIFICIAL': '117675',
  'ESPECIALIZACIÓN EN GESTIÓN Y DESARROLLO DE LA ACTIVIDAD FÍSICA Y EL DEPORTE': '118279',
  'ESP. EN GESTIÓN Y DESARROLLO DE LA ACTIVIDAD FÍSICA Y EL DEPORTE': '118279',
  'ESPECIALIZACIÓN EN LOGÍSTICA Y OPERACIONES': 'NO APLICA',
  'ESP. EN LOGÍSTICA Y OPERACIONES': 'NO APLICA',
  'ESPECIALIZACIÓN EN LOGÍSTICA Y COMERCIO INTERNACIONAL': 'NO APLICA',
  'ESP. EN LOGÍSTICA Y COMERCIO INTERNACIONAL': 'NO APLICA',
  'ESPECIALIZACIÓN EN GERENCIA FINANCIERA Y DIAGNÓSTICO ESTRATÉGICO': 'NO APLICA',
  'ESP. EN GERENCIA FINANCIERA Y DIAGNÓSTICO ESTRATÉGICO': 'NO APLICA',
  'ESPECIALIZACIÓN EN GESTIÓN TRIBUTARIA': 'NO APLICA',
  'ESPECIALIZACIÓN EN ACTIVIDAD FÍSICA Y DISCAPACIDAD': 'NO APLICA',
  'ESP. EN ACTIVIDAD FÍSICA Y DISCAPACIDAD': 'NO APLICA',
  'ESPECIALIZACIÓN EN ENTRENAMIENTO DEPORTIVO': 'NO APLICA',
  'ESP. EN ENTRENAMIENTO DEPORTIVO': 'NO APLICA',
  'ESPECIALIZACIÓN EN GESTIÓN DEL RECURSO HÍDRICO': 'NO APLICA',
  'ESP. EN GESTIÓN DEL RECURSO HÍDRICO': 'NO APLICA',
  'ESP. EN GESTIÓN DEL RIESGO DE DESASTRES Y PLANIFICACIÓN AMBIENTAL DEL TERRITORIO': 'NO APLICA',
  'ESP. EN GESTIÓN DE LA CALIDAD DEL RECURSO AIRE': 'NO APLICA',
  'ESPECIALIZACIÓN EN SANIDAD DE ANIMALES SILVESTRES': 'NO APLICA',
  'ESP. EN SANIDAD DE ANIMALES SILVESTRES': 'NO APLICA',
  'ESP. EN TÉCNICAS DE REPRODUCCIÓN ANIMAL ASISTIDA': 'NO APLICA',
  'ESPECIALIZACIÓN EN CIENCIA DE GEO-DATOS': 'NO APLICA',
  'ESP. EN CIENCIA DE GEO-DATOS': 'NO APLICA',
  'ESP. EN TOPOGRAFÍA AVANZADA CON FINES CATASTRALES': 'NO APLICA',
  'ESPECIALIZACIÓN EN SALUD MENTAL COMUNITARIA': 'NO APLICA',
  'ESP. EN SALUD MENTAL Y COMUNITARIA': 'NO APLICA',
  'ESP. GERENCIA DE LA CALIDAD E INNOVACIÓN EN SALUD': 'NO APLICA',
  'ESPECIALIZACIÓN EN INTERVENCIÓN PSICOSOCIAL': 'NO APLICA',
  'ESP. EN INTERVENCIÓN PSICOSOCIAL': 'NO APLICA',
  'ESPECIALIZACIÓN EN PSICOMETRÍA Y MEDICIÓN PSICOLÓGICA': 'NO APLICA',
  'ESP. EN PSICOMETRÍA Y MEDICIÓN PSICOLÓGICA': 'NO APLICA',
  'ESP. EN EDUCACIÓN, RURALIDADES Y DERECHOS HUMANOS': 'NO APLICA',
  'ESP. EN CIENCIAS SOCIALES, REGIÓN Y TERRITORIO': 'NO APLICA',
  'ESP. PARA LÍNEA DE PROFUNDIZACIÓN EN DIRECCIÓN MUSICAL': 'NO APLICA',
  'ESP. PARA LÍNEA DE PROFUNDIZACIÓN EN PRODUCCIÓN MUSICAL': 'NO APLICA',
  'ESP. TRANSFORMACIÓN E INNOVACIÓN DE PRODUCTOS LÁCTEOS Y CÁRNICOS': 'NO APLICA',
  'ESP. HERRAMIENTAS BIOTECNOLÓGICAS PARA LA PRODUCCIÓN ANIMAL': 'NO APLICA',
  'ESP. EN AUTOMATIZACIÓN INDUSTRIAL': 'NO APLICA',
  'ESPECIALIZACIÓN EN AUTOMATIZACIÓN INDUSTRIAL': 'NO APLICA',
  'ESP. EN SOLUCIÓN ENERGÉTICAS SOSTENIBLES': 'NO APLICA',
  'ESPECIALIZACIÓN EN SEGURIDAD DE LA INFORMACIÓN': 'NO APLICA',
  'ESP. EN SEGURIDAD DE LA INFORMACIÓN': 'NO APLICA',
  'ESPECIALIZACIÓN EN GESTIÓN AMBIENTAL PARA EL DESARROLLO SOSTENIBLE': 'NO APLICA',
  'MAESTRÍA EN GESTIÓN AMBIENTAL PARA EL DESARROLLO SOSTENIBLE': 'NO APLICA'
};

function getSniesPreg(nombre, sedes){
  for(const s of (sedes||[])) {
    const k=(nombre.toUpperCase()+'|'+s.toUpperCase());
    if(SNIES_PRE_MAP[k]) return SNIES_PRE_MAP[k];
  }
  const prefix=nombre.toUpperCase()+'|';
  for(const [k,v] of Object.entries(SNIES_PRE_MAP)) if(k.startsWith(prefix)) return v;
  return '';
}

function getSniesEsp(esp){
  if(!esp) return '';
  const k=esp.toUpperCase().trim();
  return SNIES_ESP_MAP[k]||'';
}

// ===== DESCARGA DE BD =====
function downloadDB(){
  const headers = [
    'Facultad',
    'SNIES Pregrado',
    'Programa de Pregrado',
    'Sede(s) Pregrado',
    'Tipo de Oferta',
    'Nivel',
    'SNIES Posgrado',
    'Nombre del Programa de Posgrado',
    'Línea de Profundización',
    'Tipo Línea',
    'Especialización',
    'Estado',
    'Sede(s) Programa',
    'Doctorado Facultad',
    'Estado Doctorado'
  ];
  const rows = [headers];

  AppData.getFacultades().forEach(fac => {
    fac.progs.forEach(p => {
      const sniesPre = getSniesPreg(p.n, p.sedes);

      p.lineas.forEach(l => {
        const sniesEsp = getSniesEsp(l.esp);
        rows.push([
          fac.name,
          sniesPre,
          p.n,
          p.sedes.join(' | '),
          l.o === 'V' ? 'Oferta Vigente' : 'Oferta Proyectada',
          'Especialización',
          sniesEsp,
          l.esp,
          l.l,
          l.t,
          l.esp,
          l.e || '',
          l.sedes.join(' | '),
          fac.doc ? fac.doc.n : '',
          fac.doc ? fac.doc.e : ''
        ]);
      });

      p.mae.forEach(m => {
        rows.push([
          fac.name,
          sniesPre,
          p.n,
          p.sedes.join(' | '),
          m.o === 'V' ? 'Oferta Vigente' : 'Oferta Proyectada',
          'Maestría',
          '',
          m.n,
          '',
          '',
          '',
          m.e || '',
          m.sedes.join(' | '),
          fac.doc ? fac.doc.n : '',
          fac.doc ? fac.doc.e : ''
        ]);
      });

      if(!p.lineas.length && !p.mae.length){
        rows.push([
          fac.name, sniesPre, p.n, p.sedes.join(' | '),
          '', '', '', '', '', '', '', '', '',
          fac.doc ? fac.doc.n : '', fac.doc ? fac.doc.e : ''
        ]);
      }
    });

    if(fac.doc){
      rows.push([
        fac.name, '', 'Todos los pregrados', fac.doc.sedes.join(' | '),
        fac.doc.o === 'V' ? 'Oferta Vigente' : 'Oferta Proyectada',
        'Doctorado', '', fac.doc.n, '', '', '', fac.doc.e || '',
        fac.doc.sedes.join(' | '), fac.doc.n, fac.doc.e || ''
      ]);
    }
  });

  const bom = '\uFEFF';
  const csv = bom + rows.map(r =>
    r.map(cell => {
      const s = String(cell ?? '').replace(/"/g, '""');
      return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
    }).join(',')
  ).join('\n');

  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Base_Datos_Rutas_Formacion_UdeCundinamarca.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Base de datos descargada con códigos SNIES');
}

// ===== EXPORTAR SNIES =====
function exportSNIES(){
  var rows=[['Programa','Nivel','Año','Inscritos','Admitidos','Matriculados','Graduados','T.Absorcion','T.Selectividad','T.Graduacion','%H','%M']];
  SD.programs.forEach(function(p){[2020,2021,2022,2023,2024].forEach(function(y){var d=p.years[String(y)];rows.push([p.name,p.nivel,y,d.ins,d.adm,d.mat,d.grad,d.tabs,d.tsel,d.tgrad,d.pctH,d.pctM]);});});
  var csv='\ufeff'+rows.map(function(r){return r.map(function(v){var s=String(v==null?'':v);return s.includes(',')? '"'+s+'"':s;}).join(',');}).join('\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));a.download='SNIES_UDEC.csv';document.body.appendChild(a);a.click();document.body.removeChild(a);
}

// exportado via window.App (app.js)
