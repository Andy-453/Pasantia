/**
 * app.js — orquestador principal
 * ---
 * Responsabilidad:
 *   - inicialización de datos (DB, ALL_SEDES)
 *   - renderizado de árbol, tabla, vista por sede, editor, SNIES, pipeline, indicadores
 *   - orquestación de vistas (renderViews, showTab)
 *   - editor de datos (CRUD de facultades/programas)
 *
 * Dependencias:
 *   - utils.js       → getSt, pll, uid, gv, gi, toast, showConfirm
 *   - storage.js     → saveDB, loadDB, downloadHTML, resetDB
 *   - filters.js     → pregradoMatch, itemMatch, populateSedes, applyFilters
 *   - dashboard.js   → renderKPIs, renderFacBar, selFac
 *   - app-data.js    → AppData (capa de datos)
 *   - default-data.js → window.__DEFAULT_DATA (datos iniciales)
 *
 * Estado:
 *   Módulo monolítico en proceso de fragmentación (Fase 4).
 *   var globals legacy: DB, DEFAULT_DATA, ALL_SEDES (pendientes encapsulación).
 *   DB access via AppData en todos los renderers y writes.
 *   curFac y filt* migrados a AppState via window accessors.
 *   DEFAULT_DATA inline mantenido para regex de storage/embed (export).
 *   TODO [MVC]: migrar a controladores por dominio cuando se adopte ESModules.
 */

// COMPAT LEGACY: flag embed para evitar localStorage en entorno embebido
window.__UDEC_EMBEDDED__=true;

// ========== DEFAULT DATA ==========
var DEFAULT_DATA=[{"id":"admin","name":"Facultad de Ciencias Admin., Económicas y Contables","doc":{"n":"Doctorado en Administración y Dirección de Empresas","e":"Por construir","o":"P","sedes":[],"resp":"Convocatoria Pública","mes":10,"ano":2026},"progs":[{"id":"id1774918209474t80","n":"Administración de Empresas","sedes":["Fusagasugá","Ubate","Chía","Facatativá","Girardot","Soacha"],"lineas":[{"id":"id1774918209474pfl","l":"Marketing digital","t":"Profundización 1","esp":"Especialización en Marketing Digital","e":"Obtención","o":"V","sedes":["Fusagasugá"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474rky","l":"Gestión y administración","t":"Profundización 1","esp":"Especialización en Gestión Pública","e":"Obtención","o":"V","sedes":["Ubate"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474720","l":"Transformación digital en las organizaciones","t":"Profundización 2","esp":"Esp. Gerencia para la Transformación Digital","e":"Renovación y modificación de la denominación","o":"V","sedes":["Chía","Facatativá"],"resp":"","mes":null,"ano":null},{"id":"id17749182094742q2","l":"Analítica de inteligencia de negocios","t":"Profundización 2","esp":"Especialización en Analítica Aplicada a Negocios","e":"Obtención","o":"V","sedes":["Girardot","Soacha"],"resp":"","mes":null,"ano":null},{"id":"id17749182094741h1","l":"Gerencia financiera y diagnóstico estratégico","t":"Profundización 2","esp":"Esp. en Gerencia Financiera y Diagnóstico Estratégico","e":"Radicado MEN","o":"P","sedes":["Fusagasugá","Ubate"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474g6g","l":"Logística integral","t":"Profundización 1","esp":"Especialización en Logística y Comercio Internacional","e":"Radicado MEN","o":"P","sedes":["Facatativá"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474792","l":"Emprendimiento turístico","t":"Profundización 1","esp":"Esp. en Gestión del Emprendimiento en Org. Turísticas","e":"En construcción","o":"P","sedes":["Chía","Girardot","Soacha"],"resp":"Instituto de posgrados","mes":4,"ano":2026}],"mae":[{"id":"id1774918209474vrw","n":"Maestría en Marketing Digital","e":"Radicado MEN","o":"P","sedes":["Chía","Facatativá","Fusagasugá","Ubate","Soacha"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474g9v","n":"Maestría en Administración de Empresas - MBA","e":"En construcción","o":"P","sedes":["Chía","Facatativá","Fusagasugá","Ubate","Soacha"],"resp":"Instituto de posgrados","mes":4,"ano":2026},{"id":"id1774918209474twh","n":"Maestría en Gerencia Financiera, Tributaria y Sostenibilidad Empresarial","e":"Por construir","o":"P","sedes":["Chía","Facatativá","Fusagasugá","Ubate","Soacha"],"resp":"","mes":null,"ano":null}]},{"id":"id1774918209474tn9","n":"Contaduría Pública","sedes":["Fusagasugá","Soacha","Facatativá","Chía","Ubate"],"lineas":[{"id":"id1774918209474rf4","l":"Financiera y contable","t":"Profundización 2","esp":"Especialización en Gerencia Financiera y Contable","e":"Obtención","o":"V","sedes":["Fusagasugá","Soacha","Facatativá","Chía","Ubate"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474077","l":"Gestión tributaria","t":"Profundización 1","esp":"Especialización en Gestión Tributaria","e":"Radicado MEN","o":"P","sedes":["Fusagasugá","Soacha","Facatativá","Chía","Ubate"],"resp":"","mes":null,"ano":null}],"mae":[{"id":"id1774918209474bl9","n":"Maestría en Gerencia Financiera, Tributaria y Sostenibilidad Empresarial","e":"Por construir","o":"P","sedes":["Fusagasugá","Soacha","Facatativá","Chía","Ubate"],"resp":"Convocatoria Pública","mes":10,"ano":2026}]}]},{"id":"ing","name":"Facultad de Ingeniería","doc":{"n":"Doctorado en Ingeniería","e":"En construcción","o":"P","sedes":[],"resp":"Luis Alberto Tafur","mes":8,"ano":2026},"progs":[{"id":"id1774918209474rf6","n":"Ingeniería de Software","sedes":["Soacha","Girardot"],"lineas":[{"id":"id1774918209474zw7","l":"Desarrollo del software con estándares de calidad","t":"Profundización 2","esp":"Esp. en Metodologías de Calidad para el Desarrollo del Software","e":"Obtención","o":"V","sedes":["Soacha","Girardot"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474zo6","l":"Ciencia de datos","t":"Profundización 1","esp":"Especialización en Analítica y Ciencia de Datos","e":"Obtención","o":"V","sedes":["Soacha","Girardot"],"resp":"","mes":null,"ano":null}],"mae":[{"id":"id1774918209474sv4","n":"Maestría en TIC para Territorios Inteligentes","e":"En construcción","o":"P","sedes":["Fusagasugá"],"resp":"Blanca Judith Cristacho Pabon","mes":4,"ano":2026}]},{"id":"id1774918209474l2g","n":"Ingeniería de Sistemas y Computación","sedes":["Chía","Ubate","Facatativá","Fusagasugá"],"lineas":[{"id":"id177491820947468q","l":"Software seguro y de calidad","t":"Profundización 1","esp":"Esp. en Metodologías de Calidad para el Desarrollo del Software","e":"Obtención","o":"V","sedes":["Chía","Fusagasugá"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474vrm","l":"Inteligencia artificial","t":"Profundización 2","esp":"Especialización en Inteligencia Artificial","e":"Obtención","o":"V","sedes":["Chía","Ubate","Facatativá"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474eru","l":"Ciencia de datos / Bigdata","t":"Profundización 2","esp":"Especialización en Analítica y Ciencia de Datos","e":"Obtención","o":"V","sedes":["Chía","Facatativá","Fusagasugá"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474afo","l":"Redes y seguridad","t":"Profundización 2","esp":"Especialización en Infraestructura y Seguridad de Redes","e":"Obtención","o":"V","sedes":["Fusagasugá"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474pi7","l":"Desarrollo de software","t":"Profundización 1","esp":"Especialización en Seguridad de la Información","e":"Radicado MEN","o":"P","sedes":["Ubate"],"resp":"","mes":null,"ano":null}],"mae":[{"id":"id17749182094746wy","n":"Maestría en Ingeniería de Sistemas y Computación","e":"En construcción","o":"P","sedes":["Chía","Facatativá","Fusagasugá","Ubate","Soacha","Girardot"],"resp":"Convocatoria publica","mes":8,"ano":2026}]},{"id":"id1774918209474kb4","n":"Ingeniería Electrónica","sedes":["Fusagasugá"],"lineas":[{"id":"id177491820947445x","l":"Telemática y telecomunicaciones","t":"Profundización 2","esp":"Especialización en Infraestructura y Seguridad de Redes","e":"Obtención","o":"V","sedes":["Fusagasugá"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474po7","l":"Energías renovables y sostenibilidad energética","t":"Profundización 2","esp":"Esp. en Solución Energéticas Sostenibles","e":"En construcción","o":"P","sedes":["Fusagasugá"],"resp":"Carlos Alberto Cusquen Gómez","mes":5,"ano":2026}],"mae":[{"id":"id17749182094747vt","n":"Maestría en Automatización Industrial","e":"Por construir","o":"P","sedes":["Fusagasugá","Soacha","Chía"],"resp":"Leidy  Yolanda Lopez Osorio","mes":5,"ano":2026}]},{"id":"id17749182094745d9","n":"Ingeniería Industrial","sedes":["Soacha","Chía"],"lineas":[{"id":"id1774918209474mir","l":"Ciencia de datos","t":"Profundización 2","esp":"Especialización en Analítica Aplicada a Negocios","e":"Obtención","o":"V","sedes":["Soacha","Chía"]},{"id":"id1774918209474um9","l":"Logística y cadena de abastecimiento","t":"Profundización 1","esp":"Especialización en Logística y Operaciones","e":"Radicado MEN","o":"P","sedes":["Soacha","Chía"]}],"mae":[]},{"id":"id177491820947426j","n":"Ingeniería Mecatrónica","sedes":["Chía"],"lineas":[{"id":"id1774918209474jz6","l":"Automatización y telemática aplicada","t":"Profundización 1","esp":"Especialización en Automatización Industrial","e":"Negado MEN","o":"P","sedes":["Chía"],"resp":"","mes":null,"ano":null}],"mae":[]}]},{"id":"agro","name":"Facultad de Ciencias Agropecuarias","doc":{"n":"Doctorado en Agricultura Inteligente y Sostenible","e":"En construcción","o":"P","sedes":[],"resp":"","mes":7,"ano":2026},"progs":[{"id":"id1774918209474rvk","n":"Zootecnia","sedes":["Fusagasugá","Ubate"],"lineas":[{"id":"id17749182094747we","l":"Recursos zoogenéticos para la producción pecuaria","t":"Profundización 2","esp":"Especialización en Recursos Zoogenéticos","e":"Obtención","o":"V","sedes":["Fusagasugá"]},{"id":"id1774918209474cat","l":"Alimentación no convencional","t":"Profundización 1","esp":"Esp. Nutrición y Alimentación Animal Esp. No Convencionales","e":"Obtención","o":"V","sedes":["Fusagasugá"]},{"id":"id1774918209474krm","l":"Ciencia, tecnología e innovación en producción","t":"Profundización 1","esp":"Esp. Transformación e Innovación de Productos Lácteos y Cárnicos","e":"En radicación","o":"P","sedes":["Ubate"]},{"id":"id177491820947460y","l":"Reproducción y mejoramiento genético","t":"Profundización 2","esp":"Esp. Herramientas Biotecnológicas para la Producción Animal","e":"En construcción","o":"P","sedes":["Ubate"]}],"mae":[{"id":"id1774918209474jlj","n":"Maestría en Gestión Estratégica en Nutrición y Alimentación Animal","e":"Obtención","o":"V","sedes":["Fusagasugá"]},{"id":"id1774918209474064","n":"Maestría en Producción Pecuaria e Innovación Agroindustrial","e":"Por construir","o":"P","sedes":["Fusagasugá"]}]},{"id":"id1774918209474io6","n":"Ingeniería Agronómica","sedes":["Fusagasugá","Facatativá"],"lineas":[{"id":"id1774918209474vuu","l":"Emprendimiento, desarrollo rural y territorio","t":"Profundización 2","esp":"Especialización en Agronegocios Sostenibles","e":"Obtención","o":"V","sedes":["Fusagasugá","Facatativá"]},{"id":"id17749182094742u1","l":"Sistemas de producción agrícola sostenible","t":"Profundización 1","esp":"Esp. en Agroecología y Desarrollo Agroecoturístico","e":"Obtención","o":"V","sedes":["Fusagasugá","Facatativá"]}],"mae":[{"id":"id1774918209474u3z","n":"Maestría en Ciencias Agrarias con énfasis en Hortifruticultura","e":"Obtención","o":"V","sedes":["Fusagasugá"]},{"id":"id1774918209474jpq","n":"Maestría en Agricultura Familiar y Sistemas Agroalimentarios Sostenibles","e":"Entregado para radicar","o":"P","sedes":["Fusagasugá"]}]},{"id":"id1774918209474ea0","n":"Ingeniería Ambiental","sedes":["Girardot","Facatativá"],"lineas":[{"id":"id1774918209474gsp","l":"Recurso hídrico","t":"Profundización 1","esp":"Especialización en Gestión del Recurso Hídrico","e":"Por construir","o":"P","sedes":["Girardot","Facatativá"]},{"id":"id17749182094740xz","l":"Gestión ambiental territorial","t":"Profundización 2","esp":"Esp. en Gestión del Riesgo de Desastres y Planificación Ambiental del Territorio","e":"En reclamación MEN","o":"P","sedes":["Girardot"]},{"id":"id1774918209474fvw","l":"Calidad del recurso aire","t":"Profundización 2","esp":"Especialización en Gestión de la Calidad del Recurso Aire","e":"En reclamación MEN","o":"P","sedes":["Facatativá"]}],"mae":[{"id":"id17749182094747ul","n":"Maestría en Gestión Ambiental para el Desarrollo Sostenible","e":"Obtención","o":"V","sedes":["Fusagasugá"]}]},{"id":"id17749182094746xl","n":"Medicina Veterinaria y Zootecnia","sedes":["Ubate"],"lineas":[{"id":"id1774918209474rnm","l":"Fauna silvestre susceptible de producción","t":"Profundización 1","esp":"Especialización en Sanidad de Animales Silvestres","e":"Por construir","o":"P","sedes":["Ubate"]},{"id":"id1774918209474i1s","l":"Especies con intervención reproductiva","t":"Profundización 2","esp":"Esp. en Técnicas de Reproducción Animal Asistida","e":"Por construir","o":"P","sedes":["Ubate"]}],"mae":[{"id":"id1774918209474vbs","n":"Maestría en Ciencias Veterinarias de Especies No Convencionales","e":"Por construir","o":"P","sedes":["Fusagasugá"]}]},{"id":"id1774918209474vyv","n":"Ingeniería Topográfica y Geomática","sedes":["Soacha"],"lineas":[{"id":"id17749182094743a5","l":"Cartografía y representación del Espacio Geográfico","t":"Profundización 1","esp":"Especialización en Ciencia de Geo-Datos","e":"Por construir","o":"P","sedes":["Soacha"]},{"id":"id1774918209474ai2","l":"Redes planimétricas y altimétricas","t":"Profundización 2","esp":"Esp. en Topografía Avanzada con fines Catastrales","e":"Por construir","o":"P","sedes":["Soacha"]}],"mae":[{"id":"id17749182094748xq","n":"Maestría en Geo-datos Aplicados al Ordenamiento Territorial","e":"Por construir","o":"P","sedes":["Soacha"]}]}]},{"id":"salud","name":"Facultad de Ciencias de la Salud","doc":{"n":"Doctorado en Salud Mental y Cuidado Integral","e":"Por construir","o":"P","sedes":[],"resp":"Convocatoria Pública","mes":11,"ano":2026},"progs":[{"id":"id1774918209474mlr","n":"Enfermería","sedes":["Girardot"],"lineas":[{"id":"id1774918209474rlh","l":"Cuidado integral en Salud Mental en el ámbito comunitario","t":"Profundización 1","esp":"Especialización en Salud Mental Comunitaria","e":"Radicado MEN","o":"P","sedes":["Girardot"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474ja8","l":"Gestión del Cuidado de Enfermería, calidad e innovación","t":"Profundización 2","esp":"Esp. Gerencia de la calidad e innovación en salud","e":"En construcción","o":"P","sedes":["Girardot"],"resp":"Hernan Camilo Castillo Romero ","mes":5,"ano":2026}],"mae":[{"id":"id1774918209474tx0","n":"Maestría en Salud Pública","e":"Radicado MEN","o":"P","sedes":["Girardot"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474rs0","n":"Maestría en Gestión de la Calidad en Servicios de Salud","e":"Por construir","o":"P","sedes":["Girardot"],"resp":"Convocatoria Pública","mes":10,"ano":2026}]},{"id":"id1774918209474ktb","n":"Psicología","sedes":["Facatativá"],"lineas":[{"id":"id17749182094749y0","l":"Intervención psicosocial","t":"Profundización 1","esp":"Especialización en Intervención Psicosocial","e":"Radicado MEN","o":"V","sedes":["Facatativá"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474m1a","l":"Medición y evaluación psicológica","t":"Profundización 2","esp":"Especialización en Psicometría y Medición Psicológica","e":"Por construir","o":"P","sedes":["Facatativá"],"resp":"Convocatoria Pública","mes":10,"ano":2026}],"mae":[{"id":"id1774918209474ab6","n":"Maestría en Intervención Psicosocial en Contextos de Cuidado","e":"En construcción","o":"P","sedes":["Facatativá"],"resp":"Sindy Johana Acevedo Velandia ","mes":5,"ano":2026},{"id":"id1774918209474kd9","n":"Maestría en Diseño y Análisis de Instrumentos Psicométricos","e":"Por construir","o":"P","sedes":["Facatativá"],"resp":"Convocatoria Pública","mes":10,"ano":2026}]}]},{"id":"dep","name":"Facultad de Ciencias del Deporte y Ed. Física","doc":{"n":"Doctorado de Ciencias del Movimiento y el Bienestar","e":"En proyección","o":"P","sedes":[],"resp":"Convocatoria Púbica","mes":11,"ano":2026},"progs":[{"id":"id17749182094743d5","n":"Lic. en Educación Física, Recreación y Deportes","sedes":["Fusagasugá"],"lineas":[{"id":"id177491820947414p","l":"Deporte escolar","t":"Profundización 1","esp":"Especialización en Deporte Escolar","e":"En oferta","o":"V","sedes":["Fusagasugá"],"resp":"","mes":null,"ano":null},{"id":"id1774918209474wr6","l":"Educación física y discapacidad","t":"Profundización 2","esp":"Especialización en Actividad Física y Discapacidad","e":"Radicado MEN","o":"P","sedes":["Fusagasugá"],"resp":"","mes":null,"ano":null}],"mae":[{"id":"id1774918209474fm2","n":"Maestría en Ciencias del Deporte y la Educación Física","e":"En construcción","o":"P","sedes":["Fusagasugá"],"resp":"Andres Sepulveda","mes":6,"ano":2026}]},{"id":"id17749182094747l6","n":"Profesional en Ciencias del Deporte","sedes":["Soacha"],"lineas":[{"id":"id17749182094746eg","l":"Administración deportiva","t":"Profundización 2","esp":"Esp. en Gestión y Desarrollo de la Actividad Física y el Deporte","e":"Con registro Calificado","o":"V","sedes":["Soacha"]},{"id":"id1774918209474mqf","l":"Entrenamiento deportivo","t":"Profundización 1","esp":"Especialización en Entrenamiento Deportivo","e":"Nueva Propuesta de la Facultad","o":"P","sedes":["Soacha"]}],"mae":[]}]},{"id":"edu","name":"Facultad de Educación","doc":{"n":"Doctorado en Ciencias de la Educación","e":"Obtención-resignificación","o":"P","sedes":[],"resp":"Monica Mantilla","mes":5,"ano":2026},"progs":[{"id":"id1774918209474rmb","n":"Lic. en Ciencias Sociales","sedes":["Fusagasugá"],"lineas":[{"id":"id17755015357177xb","l":"Educación, Ruralidades y Derechos Humanos.","t":"Profundización 1","esp":"Especialización en Educación, Ruralidades y Derechos Humanos","e":"Por construir","o":"P","sedes":[],"resp":"","mes":10,"ano":2026},{"id":"id1775501577009amm","l":"Región y Territorio.","t":"Profundización 2","esp":"Especialización  en ciencias sociales, región y territorio","e":"Por construir","o":"P","sedes":[],"resp":"","mes":10,"ano":2026}],"mae":[{"id":"id1774918209474n41","n":"Maestría en Educación y Gestión del Conocimiento","e":"En construcción","o":"P","sedes":["Fusagasugá"],"resp":"Aura Alvarez","mes":7,"ano":2026}]}]},{"id":"hum","name":"Facultad de Ciencias Sociales, Humanidades y Políticas","doc":null,"progs":[{"id":"id17749182094745sv","n":"Música","sedes":["Zipaquirá"],"lineas":[{"id":"id17749182094749zh","l":"Composición y arreglos","t":"Profundización 1","esp":"Esp. para Línea de Profundización en Dirección Musical","e":"Por construir","o":"P","sedes":["Zipaquirá"],"resp":"Convocatoria Pública","mes":10,"ano":2026},{"id":"id17749182094748c1","l":"Producción y gestión musical","t":"Profundización 2","esp":"Esp. para Línea de Profundización en Producción Musical","e":"Por construir","o":"P","sedes":["Zipaquirá"],"resp":"Convocatoria Pública","mes":10,"ano":2026}],"mae":[]}]}]

var ALL_SEDES=['Chía','Facatativá','Fusagasugá','Girardot','Soacha','Ubate','Zipaquirá'];
var DB=JSON.parse(JSON.stringify(DEFAULT_DATA));
// Migrados a AppState.navigation.curFac / AppState.filters.* via window accessors a continuación
// Legacy aliases: AppState.editor es fuente única (Fase 3)
Object.defineProperty(window,'editingProgId',{get:function(){return window.AppState.editor.editingProgId;},set:function(v){window.AppState.editor.editingProgId=v;},configurable:true});
Object.defineProperty(window,'tmpLineas',{get:function(){return window.AppState.editor.tmpLineas;},set:function(v){window.AppState.editor.tmpLineas=v;},configurable:true});
Object.defineProperty(window,'tmpMaes',{get:function(){return window.AppState.editor.tmpMaes;},set:function(v){window.AppState.editor.tmpMaes=v;},configurable:true});

// Estado centralizado — Fase 3 (migración gradual)
// Acceso legacy via window accessors (curFac, filtSede, etc.)
window.AppState = {
  navigation: {
    curFac: 0,
    activeTab: 'pipeline'
  },
  filters: {
    sede: 'ALL',
    oferta: 'ALL',
    estado: 'ALL',
    nivel: 'ALL',
    pregrado: 'ALL'
  },
  ui: {},
  editor: {
    editingProgId: null,
    tmpLineas: [],
    tmpMaes: []
  },
  snies: {
    SD: null,
    fac: 'TODAS',
    prog: null
  },
  staticData: {
    ALL_SEDES: null,
    DEFAULT_DATA: null
  }
};

// ===== GLOBAL ACCESSORS — Fase 3 =====
// Aliases transparentes: window.curFac / window.filt* → AppState.*
Object.defineProperty(window,'curFac',{get:function(){return window.AppState.navigation.curFac;},set:function(v){window.AppState.navigation.curFac=v;},configurable:true});
Object.defineProperty(window,'filtSede',{get:function(){return window.AppState.filters.sede;},set:function(v){window.AppState.filters.sede=v;},configurable:true});
Object.defineProperty(window,'filtOferta',{get:function(){return window.AppState.filters.oferta;},set:function(v){window.AppState.filters.oferta=v;},configurable:true});
Object.defineProperty(window,'filtEstado',{get:function(){return window.AppState.filters.estado;},set:function(v){window.AppState.filters.estado=v;},configurable:true});
Object.defineProperty(window,'filtNivel',{get:function(){return window.AppState.filters.nivel;},set:function(v){window.AppState.filters.nivel=v;},configurable:true});
Object.defineProperty(window,'filtPregrado',{get:function(){return window.AppState.filters.pregrado;},set:function(v){window.AppState.filters.pregrado=v;},configurable:true});
// Inicializar staticData (readonly)
window.AppState.staticData.ALL_SEDES=ALL_SEDES;
window.AppState.staticData.DEFAULT_DATA=DEFAULT_DATA;

// ===== EXPORT MANIFEST — Fase 3 =====
// Namespace global para migración futura a ESModules.
// Compatibilidad legacy: todas las funciones están también en window
// vía declaraciones `function` (implícito). Inline onclick sigue funcionando.
// TODO [MVC]: cuando se migre a ESModules, reemplazar por import/export.
window.App = {
  // State
  AppState: window.AppState,
  // Navigation
  showTab: showTab, renderViews: renderViews, selFac: selFac,
  // Dashboard
  renderKPIs: renderKPIs, renderFacBar: renderFacBar,
  // Filters
  applyFilters: applyFilters, resetFilters: resetFilters, populateSedes: populateSedes,
  sedeMatch: sedeMatch, ofertaMatch: ofertaMatch, estadoMatch: estadoMatch,
  nivelMatch: nivelMatch, pregradoMatch: pregradoMatch, itemMatch: itemMatch,
  // Tree, Table, SedeView
  renderTree: renderTree, renderTabla: renderTabla, renderSedeView: renderSedeView,
  // Editor
  renderEditor: renderEditor, openNewProg: openNewProg, openEditProg: openEditProg,
  openEditFac: openEditFac, openNewFac: openNewFac, saveFac: saveFac,
  deleteFac: deleteFac, saveDoc: saveDoc, cancelEdit: cancelEdit,
  renderProgForm: renderProgForm, addLinea: addLinea, delLinea: delLinea,
  addMae: addMae, delMae: delMae, saveProg: saveProg, deleteProg: deleteProg,
  collectLineas: collectLineas, collectMaes: collectMaes, toggleDocForm: toggleDocForm,
  // SNIES
  renderSNIES: renderSNIES, snSetFac: snSetFac, snSetProg: snSetProg, exportSNIES: exportSNIES,
  // Pipeline
  renderPipeline: renderPipeline, toggleSec: toggleSec,
  // Indicators
  renderIndicadores: renderIndicadores,
  // Storage
  loadDB: loadDB, saveDB: saveDB, downloadHTML: downloadHTML, downloadDB: downloadDB, resetDB: resetDB,
  // Utils
  showConfirm: showConfirm, getSt: getSt, pll: pll, uid: uid, gv: gv, gi: gi, toast: toast,
};

// ===== EVENT DELEGATION — Fase 3 =====
// Dispatcher centralizado: click + change.
// onclick/onchange removido de elementos con data-action.
// onclick se conserva solo en editor (renderProgForm, renderEditor, openNewFac, openEditFac).
// TODO [MVC]: migrar editor a data-action.
var __ACTIONS = {
  'show-tab': function(b){ showTab(b.dataset.tab); },
  'sel-fac':  function(b){ selFac(parseInt(b.dataset.fac,10)); },
  'reset-filters': function(){ resetFilters(); },
  'snies-set-fac': function(b){ snSetFac(b.dataset.fac); },
  'snies-set-prog': function(b){ snSetProg(b.dataset.prog); },
  'toggle-section': function(b){ toggleSec(b.dataset.secId); },
  'download-html': function(){ downloadHTML(); },
  'print': function(){ window.print(); },
  'reset-db': function(){ resetDB(); },
  'open-edit-prog': function(b){ openEditProg(b.dataset.pid); },
  'del-linea': function(b){ delLinea(b.dataset.lineaId); },
  'del-mae': function(b){ delMae(b.dataset.maeId); },
  'add-linea': function(){ addLinea(); },
  'add-mae': function(){ addMae(); },
  'save-prog': function(b){ saveProg(b.dataset.pid, b.dataset.isNew === 'true'); },
  'cancel-edit': function(){ cancelEdit(); },
  'delete-prog': function(b){ deleteProg(b.dataset.pid); },
  'save-doc': function(){ saveDoc(); },
  'toggle-doc-form': function(){ toggleDocForm(); },
  'open-new-prog': function(){ openNewProg(); },
  'open-edit-fac': function(){ openEditFac(); },
  'open-new-fac': function(){ openNewFac(); },
  'save-fac': function(b){ saveFac(b.dataset.isNew === 'true'); },
  'delete-fac': function(){ deleteFac(); },
  'open-program-link': function(b){
    var url = b.getAttribute('data-url');
    if(url) window.open(url, '_blank', 'noopener,noreferrer');
  },
};
document.addEventListener('click', function(e){
  var b = e.target.closest('[data-action]');
  if(!b) return;
  var fn = __ACTIONS[b.getAttribute('data-action')];
  if(fn) fn(b);
});
var __CHANGE = {
  'apply-filters': function(){ applyFilters(); },
};
document.addEventListener('change', function(e){
  var b = e.target.closest('[data-action]');
  if(!b) return;
  var fn = __CHANGE[b.getAttribute('data-action')];
  if(fn) fn(b);
});

function _getObtencionUrl(e, item){
  if(!item || !item.enlaceObtencion) return '';
  if((e||'').toLowerCase() !== 'obtención') return '';
  var url = item.enlaceObtencion.trim();
  if(url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) return '';
  return url;
}

// ===== TREE =====
/**
 * Renderiza el árbol jerárquico (pregrado → línea → especialización / maestría / doctorado).
 * Soporta modo single-pregrado y multi-pregrado.
 */
function renderTree(){
  try{
  const f=AppData.getFacultad(AppState.navigation.curFac);
  // Ensure data integrity before rendering
  if(!f||!Array.isArray(f.progs)){document.getElementById('tree').innerHTML='<div class="empty-msg">Error cargando datos. <a href="#" data-action="reset-db" style="color:#006633">Recargar datos por defecto</a></div>';return;}
  const singlePregrado = filtPregrado !== 'ALL';

  function vline(h){
    return `<div class="vl" style="height:${h}px"></div>`;
  }
  function stBadge(e, item){
    if(!e) return '';
    const s=getSt(e);
    var url = _getObtencionUrl(e, item);
    if(url){
      return '<div class="badge clickable" data-action="open-program-link" data-url="'+url+'" role="button" tabindex="0" style="background:'+s.bg+';color:'+s.tx+';cursor:pointer"><div class="bdot" style="background:'+s.dot+'"></div>'+e+'</div>';
    }
    return '<div class="badge" style="background:'+s.bg+';color:'+s.tx+'"><div class="bdot" style="background:'+s.dot+'"></div>'+e+'</div>';
  }

  // Filter programs (defensive: guard against undefined lineas/mae from stale data)
  const visProgs = f.progs.filter(p=>{
    if(!pregradoMatch(p.n)) return false;
    const lineas = Array.isArray(p.lineas) ? p.lineas : [];
    const mae = Array.isArray(p.mae) ? p.mae : [];
    const vL = lineas.filter(l=>itemMatch(l,'espec'));
    const vM = mae.filter(m=>itemMatch(m,'mae'));
    return vL.length||vM.length||(f.doc&&itemMatch(f.doc,'doc'));
  });

  if(!visProgs.length){
    document.getElementById('tree').innerHTML=`<div class="empty-msg">Sin resultados para los filtros seleccionados</div>`;
    return;
  }

  // ROOT
  let h=`
  <div class="node node-root">
    <div class="node-body">
      <div class="node-label">Facultad</div>
      <div class="node-title">${f.name}</div>
    </div>
  </div>
  ${vline(24)}`;

  if(singlePregrado){
    // ── SINGLE PREGRADO MODE: vertical flow with horizontal line columns ──
    const p = visProgs[0];
    const vL = (Array.isArray(p.lineas)?p.lineas:[]).filter(l=>itemMatch(l,'espec'));
    const vM = (Array.isArray(p.mae)?p.mae:[]).filter(m=>itemMatch(m,'mae'));

    // Pregrado card centered
    h+=`
    <div class="node node-pregrado" style="min-width:260px;max-width:340px">
      <button class="edit-node-btn no-print" data-action="open-edit-prog" data-pid="${p.id}">✎</button>
      <div class="node-stripe"></div>
      <div class="node-body">
        <div class="node-label">Programa de pregrado</div>
        <div class="node-title">${p.n}</div>
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e8f2ec">
          <div style="font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#666;margin-bottom:4px">Sede(s)</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">
            ${p.sedes.map(s=>`<span class="sede-chip">📍 ${s}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>`; // close pregrado node

    if(vL.length){
      const colW = 200;
      const gap = 16;
      const n = vL.length;
      const totalW = n * colW + (n-1) * gap;
      const centerX = totalW / 2;

      // SVG connector: vertical down + horizontal bar + vertical drops to each column
      const svgH = 48;
      let svgPaths = `<line x1="${centerX}" y1="0" x2="${centerX}" y2="20" stroke="#c0d8c8" stroke-width="2"/>`;
      // horizontal bar
      if(n > 1){
        const firstX = colW/2;
        const lastX = totalW - colW/2;
        svgPaths += `<line x1="${firstX}" y1="20" x2="${lastX}" y2="20" stroke="#c0d8c8" stroke-width="2"/>`;
      }
      // drops down to each card
      vL.forEach((_,i)=>{
        const cx = i*(colW+gap) + colW/2;
        svgPaths += `<line x1="${cx}" y1="20" x2="${cx}" y2="${svgH}" stroke="#c0d8c8" stroke-width="2"/>`;
        // circle at junction
        if(n > 1) svgPaths += `<circle cx="${cx}" cy="20" r="3" fill="#006633"/>`;
      });

      h+=`
      <div style="width:${totalW}px;display:flex;justify-content:center">
        <svg width="${totalW}" height="${svgH}" style="display:block;overflow:visible">
          ${svgPaths}
          <circle cx="${centerX}" cy="0" r="3" fill="#006633"/>
        </svg>
      </div>
      <div style="display:flex;gap:${gap}px;align-items:flex-start;width:${totalW}px">`;

      vL.forEach(l=>{
        h+=`
        <div style="width:${colW}px;display:flex;flex-direction:column;align-items:center;flex-shrink:0">
          <div class="node node-linea" style="width:100%">
            <div class="node-stripe"></div>
            <div class="node-body">
              <div class="tipo-tag">${l.t}</div>
              <div class="node-label">Línea de profundización</div>
              <div class="node-title">${l.l}</div>
            </div>
          </div>
          <svg width="2" height="16"><line x1="1" y1="0" x2="1" y2="16" stroke="#c0d8c8" stroke-width="2"/></svg>
          <div class="node node-espec" style="width:100%">
            <div class="node-stripe"></div>
            <div class="node-body">
              ${pll(l.o)}
              <div class="node-label">Especialización</div>
              <div class="node-title">${l.esp}</div>
              <div class="sede-chip">📍 ${l.sedes.join(' · ')}</div>
              ${stBadge(l.e, l)}
            </div>
          </div>
        </div>`;
      });
      h+=`</div>`;
    }

    if(vM.length){
      const colW = 210;
      const gap = 16;
      const n = vM.length;
      const totalW = n * colW + (n-1) * gap;
      const centerX = totalW / 2;
      const svgH = 48;

      let svgPaths = `<line x1="${centerX}" y1="0" x2="${centerX}" y2="20" stroke="#d4b84a" stroke-width="2"/>`;
      if(n > 1){
        const firstX = colW/2;
        const lastX = totalW - colW/2;
        svgPaths += `<line x1="${firstX}" y1="20" x2="${lastX}" y2="20" stroke="#d4b84a" stroke-width="2"/>`;
      }
      vM.forEach((_,i)=>{
        const cx = i*(colW+gap) + colW/2;
        svgPaths += `<line x1="${cx}" y1="20" x2="${cx}" y2="${svgH}" stroke="#d4b84a" stroke-width="2"/>`;
        if(n > 1) svgPaths += `<circle cx="${cx}" cy="20" r="3" fill="#C8A43A"/>`;
      });

      h+=`
      <div style="width:${Math.max(totalW,10)}px;display:flex;justify-content:center">
        <svg width="${Math.max(totalW,2)}" height="${svgH}" style="display:block;overflow:visible">
          ${svgPaths}
          <circle cx="${centerX}" cy="0" r="3" fill="#C8A43A"/>
        </svg>
      </div>
      <div style="display:flex;gap:${gap}px;align-items:flex-start;width:${Math.max(totalW,10)}px">`;

      vM.forEach(m=>{
        h+=`
        <div style="width:${colW}px;flex-shrink:0">
          <div class="node node-mae" style="width:100%">
            <div class="node-stripe"></div>
            <div class="node-body">
              ${pll(m.o)}
              <div class="node-label">Maestría</div>
              <div class="node-title">${m.n}</div>
              <div class="sede-chip">📍 ${m.sedes.join(' · ')}</div>
              ${stBadge(m.e, m)}
            </div>
          </div>
        </div>`;
      });
      h+=`</div>`;
    }

  } else {
    // ── ALL PREGRADOS MODE: side-by-side columns ──
    h+=`<div class="progs-row">`;
    visProgs.forEach(p=>{
      const vL=(Array.isArray(p.lineas)?p.lineas:[]).filter(l=>itemMatch(l,'espec'));
      const vM=(Array.isArray(p.mae)?p.mae:[]).filter(m=>itemMatch(m,'mae'));
      h+=`<div class="pcol">
        ${vline(14)}
        <div class="node node-pregrado">
          <button class="edit-node-btn no-print" data-action="open-edit-prog" data-pid="${p.id}">✎</button>
          <div class="node-stripe"></div>
          <div class="node-body">
            <div class="node-label">Programa de pregrado</div>
            <div class="node-title">${p.n}</div>
            <div style="margin-top:7px;padding-top:7px;border-top:1px solid #e8f2ec">
              <div style="font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#666;margin-bottom:4px">Sede(s)</div>
              <div style="display:flex;flex-wrap:wrap;gap:3px;justify-content:center">
                ${p.sedes.map(s=>`<span class="sede-chip">📍 ${s}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>`;

      vL.forEach(l=>{
        h+=`
        ${vline(12)}
        <div class="node node-linea">
          <div class="node-stripe"></div>
          <div class="node-body">
            <div class="tipo-tag">${l.t}</div>
            <div class="node-label">Línea de profundización</div>
            <div class="node-title">${l.l}</div>
          </div>
        </div>
        ${vline(8)}
        <div class="node node-espec">
          <div class="node-stripe"></div>
          <div class="node-body">
            ${pll(l.o)}
            <div class="node-label">Especialización</div>
            <div class="node-title">${l.esp}</div>
            <div class="sede-chip">📍 ${l.sedes.join(' · ')}</div>
            ${stBadge(l.e, l)}
          </div>
        </div>`;
      });

      vM.forEach(m=>{
        h+=`
        ${vline(10)}
        <div class="node node-mae">
          <div class="node-stripe"></div>
          <div class="node-body">
            ${pll(m.o)}
            <div class="node-label">Maestría</div>
            <div class="node-title">${m.n}</div>
            <div class="sede-chip">📍 ${m.sedes.join(' · ')}</div>
            ${stBadge(m.e, m)}
          </div>
        </div>`;
      });
      h+=`</div>`;
    });
    h+=`</div>`;
  }

  // DOCTORADO
  if(f.doc&&itemMatch(f.doc,'doc')){
    const st=getSt(f.doc.e);
    h+=`
    ${vline(24)}
    <div class="node node-doc">
      <div class="node-body">
        <div style="margin-bottom:5px">${pll(f.doc.o)}</div>
        <div class="node-label">Doctorado</div>
        <div class="node-title">${f.doc.n}</div>
        <div class="sede-chip sede-chip-dark">📍 ${f.doc.sedes.join(' · ')}</div>
        <div class="badge" style="background:${st.bg};color:${st.tx};margin-top:6px"><div class="bdot" style="background:${st.dot}"></div>${f.doc.e}</div>
      </div>
    </div>`;
  }

  document.getElementById('tree').innerHTML=h;
  }catch(err){
    document.getElementById('tree').innerHTML='<div class="empty-msg">⚠️ Error al renderizar el árbol. <a href="#" data-action="reset-db" style="color:#006633;font-weight:700">Haz clic aquí para restablecer los datos</a></div>';
    console.error('renderTree error:',err);
  }
}

// ===== TABLE =====
function renderTabla(){
  const f=AppData.getFacultad(AppState.navigation.curFac);let rows='';
  f.progs.forEach(p=>{
    if(!pregradoMatch(p.n)) return;
    const items=[
      ...p.lineas.filter(l=>itemMatch(l,'espec')).map(l=>({nivel:'Especialización',nombre:l.esp,linea:l.l,sedes:l.sedes,e:l.e,o:l.o,enlaceObtencion:l.enlaceObtencion})),
      ...p.mae.filter(m=>itemMatch(m,'mae')).map(m=>({nivel:'Maestría',nombre:m.n,linea:'—',sedes:m.sedes,e:m.e,o:m.o,enlaceObtencion:m.enlaceObtencion}))
    ];
    items.forEach((it,i)=>{
      const st=getSt(it.e);
      const os=it.o==='V'?'background:#e6f2eb;color:#006633;border:1px solid #006633':'background:#e8f0fb;color:#1a5cb0;border:1px solid #378ADD';
      var bUrl=_getObtencionUrl(it.e,it),bAttrs='';
      if(bUrl){bAttrs=' data-action="open-program-link" data-url="'+bUrl+'" role="button" tabindex="0" style="cursor:pointer"';}
      rows+=`<tr>${i===0?`<td rowspan="${items.length}" style="font-weight:700;vertical-align:top;color:#006633">${p.n}<div style="font-size:9px;color:#666;font-style:italic">${p.sedes.join(', ')}</div></td>`:''}
        <td><span style="font-size:9px;padding:1px 5px;border-radius:5px;${os}">${it.o==='V'?'Vigente':'Proyectada'}</span></td>
        <td style="font-weight:700">${it.nivel}</td><td style="color:#555">${it.linea}</td>
        <td>${it.nombre}</td><td style="font-size:9px">${it.sedes.join(', ')}</td>
        <td><span style="display:inline-flex;align-items:center;gap:3px;padding:2px 5px;border-radius:6px;font-size:9px;font-weight:600;background:${st.bg};color:${st.tx}"${bAttrs}><span style="width:5px;height:5px;border-radius:50%;background:${st.dot};display:inline-block"></span>${it.e||'—'}</span></td>
      </tr>`;
    });
  });
  if(f.doc&&itemMatch(f.doc,'doc')){
    const st=getSt(f.doc.e);const os=f.doc.o==='V'?'background:#e6f2eb;color:#006633;border:1px solid #006633':'background:#e8f0fb;color:#1a5cb0;border:1px solid #378ADD';
    rows+=`<tr style="background:#1a2e1a20"><td style="font-weight:700;color:#006633">Todos los pregrados</td>
      <td><span style="font-size:9px;padding:1px 5px;border-radius:5px;${os}">${f.doc.o==='V'?'Vigente':'Proyectada'}</span></td>
      <td style="font-weight:700">Doctorado</td><td>—</td><td>${f.doc.n}</td>
      <td style="font-size:9px">${f.doc.sedes.join(', ')}</td>
      <td><span style="display:inline-flex;align-items:center;gap:3px;padding:2px 5px;border-radius:6px;font-size:9px;font-weight:600;background:${st.bg};color:${st.tx}"><span style="width:5px;height:5px;border-radius:50%;background:${st.dot};display:inline-block"></span>${f.doc.e}</span></td>
    </tr>`;
  }
  document.getElementById('tabla').innerHTML=rows
    ?`<thead><tr><th>Programa</th><th>Oferta</th><th>Nivel</th><th>Línea</th><th>Nombre del programa</th><th>Sede(s)</th><th>Estado</th></tr></thead><tbody>${rows}</tbody>`
    :`<tbody><tr><td colspan="7" style="padding:2rem;text-align:center;color:#888">Sin resultados</td></tr></tbody>`;
}

// ===== SEDE VIEW =====
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


// ===== PROG FORM =====
function renderProgForm(){
  var f=AppData.getFacultad(AppState.navigation.curFac),isNew=editingProgId==='__new__';
  var p=isNew?{id:uid(),n:'',sedes:[],lineas:[{id:uid(),l:'',t:'Profundización 1',esp:'',e:'',o:'V',sedes:[],resp:'',mes:null,ano:null}],mae:[{id:uid(),n:'',e:'',o:'P',sedes:[],resp:'',mes:null,ano:null}]}:f.progs.find(function(x){return x.id===editingProgId;});
  if(!p) return;
  if(!tmpLineas._progId||tmpLineas._progId!==p.id){
    tmpLineas=JSON.parse(JSON.stringify(p.lineas));tmpLineas._progId=p.id;
    tmpMaes=JSON.parse(JSON.stringify(p.mae));tmpMaes._progId=p.id;
  }
  var ES=['','Con registro Calificado','En oferta','Obtención','Radicado MEN','En radicación','Entregado para radicar','En construcción','Por construir','En proyección','Nueva Propuesta de la Facultad','En reclamación  MEN','Renovación','Renovación y modificación de la denominación','Negado MEN'];
  var MS=['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var AS=[2024,2025,2026,2027,2028];
  function eo(c){return ES.map(function(e){return '<option value="'+e+'"'+(e===c?' selected':'')+'>'+( e||'— Sin estado —')+'</option>';}).join('');}
  function mo(c){return '<option value="">— Mes —</option>'+MS.slice(1).map(function(m,i){return '<option value="'+(i+1)+'"'+((i+1)===c?' selected':'')+'>'+m+'</option>';}).join('');}
  function ao(c){return '<option value="">— Año —</option>'+AS.map(function(y){return '<option value="'+y+'"'+(y===c?' selected':'')+'>'+y+'</option>';}).join('');}
  var lH=tmpLineas.map(function(l){
    return '<div class="linea-card" id="lc'+l.id+'">'
      +'<button class="del-btn" data-action="del-linea" data-linea-id="'+l.id+'">✕ Quitar</button>'
      +'<div class="grid2"><div class="field"><label>Línea</label><input id="ll'+l.id+'" value="'+(l.l||'')+'" placeholder="Nombre de la línea"></div>'
      +'<div class="field"><label>Tipo</label><select id="lt'+l.id+'"><option'+(l.t==='Profundización 1'?' selected':'')+'>Profundización 1</option><option'+(l.t==='Profundización 2'?' selected':'')+'>Profundización 2</option></select></div></div>'
      +'<div class="grid2"><div class="field"><label>Especialización</label><input id="le'+l.id+'" value="'+(l.esp||'')+'" placeholder="Nombre"></div>'
      +'<div class="field"><label>Estado</label><select id="les'+l.id+'">'+eo(l.e)+'</select></div></div>'
      +'<div class="grid2"><div class="field"><label>Oferta</label><select id="lo'+l.id+'"><option value="V"'+(l.o==='V'?' selected':'')+'>Vigente</option><option value="P"'+(l.o==='P'?' selected':'')+'>Proyectada</option></select></div>'
      +'<div class="field"><label>👤 Responsable</label><input id="lresp'+l.id+'" value="'+(l.resp||'')+'" placeholder="Docente o equipo"></div></div>'
      +'<div class="grid3"><div class="field"><label>📅 Mes</label><select id="lmes'+l.id+'">'+mo(l.mes)+'</select></div>'
      +'<div class="field"><label>📅 Año</label><select id="lano'+l.id+'">'+ao(l.ano)+'</select></div><div class="field"><label>🔗 Enlace</label><input type="url" id="lenlace'+l.id+'" value="'+(l.enlaceObtencion||'')+'" placeholder="URL programa"></div></div>'
      +'</div>';
  }).join('');
  var mH=tmpMaes.map(function(m){
    return '<div class="linea-card" id="mc'+m.id+'">'
      +'<button class="del-btn" data-action="del-mae" data-mae-id="'+m.id+'">✕ Quitar</button>'
      +'<div class="grid2"><div class="field"><label>Maestría</label><input id="mn'+m.id+'" value="'+(m.n||'')+'" placeholder="Nombre"></div>'
      +'<div class="field"><label>Estado</label><select id="mes'+m.id+'">'+eo(m.e)+'</select></div></div>'
      +'<div class="grid2"><div class="field"><label>Oferta</label><select id="mo'+m.id+'"><option value="V"'+(m.o==='V'?' selected':'')+'>Vigente</option><option value="P"'+(m.o==='P'?' selected':'')+'>Proyectada</option></select></div>'
      +'<div class="field"><label>👤 Responsable</label><input id="mresp'+m.id+'" value="'+(m.resp||'')+'" placeholder="Docente o equipo"></div></div>'
      +'<div class="grid3"><div class="field"><label>📅 Mes</label><select id="mmes'+m.id+'">'+mo(m.mes)+'</select></div>'
      +'<div class="field"><label>📅 Año</label><select id="mano'+m.id+'">'+ao(m.ano)+'</select></div><div class="field"></div></div>'
      +'</div>';
  }).join('');
  var h='<div class="modal-overlay"><div class="modal">'
    +'<div class="modal-title"><span>'+(isNew?'➕':'✎')+'</span>'+(isNew?'Nuevo programa':'Editar — '+p.n)+'</div>'
    +'<div class="form-section"><h3>Programa de pregrado</h3>'
      +'<div class="grid2"><div class="field"><label>Nombre</label><input id="pn" value="'+(p.n||'')+'" placeholder="Nombre del pregrado"></div>'
      +'<div class="field"><label>Sedes</label><input id="psedes" value="'+(p.sedes?p.sedes.join(', '):'')+'" placeholder="Ej: Fusagasugá, Chía"></div></div></div>'
    +'<div class="form-section"><h3>Líneas de profundización y especializaciones</h3>'
      +'<div id="lineas-container">'+lH+'</div>'
      +'<button data-action="add-linea" style="margin-top:6px;border-color:#006633;color:#006633">+ Agregar línea</button></div>'
    +'<div class="form-section"><h3>Maestrías</h3>'
      +'<div id="maes-container">'+mH+'</div>'
      +'<button data-action="add-mae" style="margin-top:6px;border-color:#C8A43A;color:#8a6d00">+ Agregar maestría</button></div>'
    +'<div class="modal-actions">'
      +'<button class="btn-green" data-action="save-prog" data-pid="'+p.id+'" data-is-new="'+(isNew?'true':'false')+'">💾 Guardar</button>'
      +'<button data-action="cancel-edit">Cancelar</button>'
      +(isNew?'':'<button class="btn-red" data-action="delete-prog" data-pid="'+p.id+'">🗑 Eliminar</button>')
    +'</div></div></div>';
  document.getElementById('editor-content').innerHTML=h;
}

function addLinea(){collectLineas();collectMaes();var pid=tmpLineas._progId;tmpLineas.push({id:uid(),l:'',t:'Profundización 1',esp:'',e:'',o:'P',sedes:[],resp:'',mes:null,ano:null,enlaceObtencion:null});tmpLineas._progId=pid;renderProgForm();}
function delLinea(lid){collectLineas();collectMaes();var pid=tmpLineas._progId;tmpLineas=tmpLineas.filter(function(l){return l.id!==lid;});tmpLineas._progId=pid;renderProgForm();}
function addMae(){collectLineas();collectMaes();var pid=tmpMaes._progId;tmpMaes.push({id:uid(),n:'',e:'',o:'P',sedes:[],resp:'',mes:null,ano:null});tmpMaes._progId=pid;renderProgForm();}
function delMae(mid){collectLineas();collectMaes();var pid=tmpMaes._progId;tmpMaes=tmpMaes.filter(function(m){return m.id!==mid;});tmpMaes._progId=pid;renderProgForm();}
function collectLineas(){var pid=tmpLineas._progId;tmpLineas=tmpLineas.map(function(l){return{id:l.id,l:gv('ll'+l.id)||l.l,t:gv('lt'+l.id)||l.t,esp:gv('le'+l.id)||l.esp,e:gv('les'+l.id),o:gv('lo'+l.id)||l.o,sedes:l.sedes,resp:gv('lresp'+l.id),mes:gi('lmes'+l.id),ano:gi('lano'+l.id),enlaceObtencion:gv('lenlace'+l.id)||null};});tmpLineas._progId=pid;}
function collectMaes(){var pid=tmpMaes._progId;tmpMaes=tmpMaes.map(function(m){return{id:m.id,n:gv('mn'+m.id)||m.n,e:gv('mes'+m.id),o:gv('mo'+m.id)||m.o,sedes:m.sedes,resp:gv('mresp'+m.id),mes:gi('mmes'+m.id),ano:gi('mano'+m.id)};});tmpMaes._progId=pid;}
function saveProg(pid,isNew){
  collectLineas();collectMaes();
  var prog={id:pid,n:gv('pn').trim(),sedes:gv('psedes').split(',').map(function(s){return s.trim();}).filter(Boolean),lineas:tmpLineas,mae:tmpMaes};
  AppData.savePrograma(curFac,prog,isNew);
  editingProgId=null;tmpLineas=[];tmpMaes=[];toast('Programa guardado');populateSedes();renderFacBar();renderViews();renderEditor();
}
function deleteProg(pid){
  var r=AppData.findProgramById(pid);
  showConfirm('¿Eliminar?','Se eliminará <strong>'+(r?r.programa.n:'este programa')+'</strong>.',function(){
    if(r) AppData.deletePrograma(r.facIndex,pid);
    editingProgId=null;tmpLineas=[];tmpMaes=[];toast('Eliminado');renderViews();renderEditor();
  });
}
function cancelEdit(){editingProgId=null;tmpLineas=[];tmpMaes=[];renderEditor();}


// ===== PESTAÑAS Y VISTAS =====

/**
 * Cambia la pestaña activa y renderiza el panel correspondiente.
 * Alto acoplamiento: conoce los 7 paneles y llama a 4 renderers distintos.
 * @param {string} id - 'arbol' | 'tabla' | 'sede' | 'indicadores' | 'snies' | 'pipeline' | 'editor'
 */
function showTab(id){
  AppState.navigation.activeTab=id;
  ['arbol','tabla','sede','indicadores','snies','pipeline','editor'].forEach(t=>{
    document.getElementById('panel-'+t).classList.toggle('act',t===id);
    document.getElementById('tb-'+t).classList.toggle('act',t===id);
  });
  if(id==='editor') renderEditor();
  if(id==='indicadores') renderIndicadores();
  if(id==='snies') renderSNIES();
  if(id==='pipeline') renderPipeline();
}

/**
 * Orquesta la actualización del dashboard principal.
 * Llama a 4 renderers. Dependencia: renderKPIs (dashboard.js).
 */
function renderViews(){renderKPIs();renderTree();renderTabla();renderSedeView();}


// ===== SNIES LOOKUP MAPS + DOWNLOAD DATABASE =====
// Extraído a assets/js/modules/export.js (Fase 2)
// window.downloadDB es definido por export.js via window.*

// ===== INDICADORES =====
// Extraído a assets/js/modules/indicators.js (Fase 2)
// window.renderIndicadores es definido por indicators.js via window.*

// ===== INIT =====
loadDB();
renderFacBar();
populateSedes();
renderViews();
// curFac sync legacy → AppState: manejado por window accessors

// ===== SNIES DATA =====
Object.defineProperty(window,'SD',{get:function(){return window.AppState.snies.SD;},set:function(v){window.AppState.snies.SD=v;},configurable:true});
AppState.snies.SD = {"resumen": [{"AÑO_ARCHIVO": 2020, "INSCRITOS": 319, "ADMITIDOS": 277, "PRIMER_CURSO": 305, "MATRICULADOS": 546, "GRADUADOS": 303, "Hombre": 592.0, "Mujer": 700.0, "T_ABSORCION": 197.1, "T_SELECTIVIDAD": 86.8, "T_GRADUACION": 55.5, "T_PRIMER_CURSO": 55.9, "PCT_H": 45.8, "PCT_M": 54.2}, {"AÑO_ARCHIVO": 2021, "INSCRITOS": 594, "ADMITIDOS": 419, "PRIMER_CURSO": 316, "MATRICULADOS": 466, "GRADUADOS": 296, "Hombre": 637.0, "Mujer": 602.0, "T_ABSORCION": 111.2, "T_SELECTIVIDAD": 70.5, "T_GRADUACION": 63.5, "T_PRIMER_CURSO": 67.8, "PCT_H": 51.4, "PCT_M": 48.6}, {"AÑO_ARCHIVO": 2022, "INSCRITOS": 473, "ADMITIDOS": 425, "PRIMER_CURSO": 317, "MATRICULADOS": 514, "GRADUADOS": 301, "Hombre": 643.0, "Mujer": 764.0, "T_ABSORCION": 120.9, "T_SELECTIVIDAD": 89.9, "T_GRADUACION": 58.6, "T_PRIMER_CURSO": 61.7, "PCT_H": 45.7, "PCT_M": 54.3}, {"AÑO_ARCHIVO": 2023, "INSCRITOS": 424, "ADMITIDOS": 398, "PRIMER_CURSO": 328, "MATRICULADOS": 533, "GRADUADOS": 324, "Hombre": 702.0, "Mujer": 699.0, "T_ABSORCION": 133.9, "T_SELECTIVIDAD": 93.9, "T_GRADUACION": 60.8, "T_PRIMER_CURSO": 61.5, "PCT_H": 50.1, "PCT_M": 49.9}, {"AÑO_ARCHIVO": 2024, "INSCRITOS": 460, "ADMITIDOS": 383, "PRIMER_CURSO": 289, "MATRICULADOS": 403, "GRADUADOS": 306, "Hombre": 454.0, "Mujer": 501.0, "T_ABSORCION": 105.2, "T_SELECTIVIDAD": 83.3, "T_GRADUACION": 75.9, "T_PRIMER_CURSO": 71.7, "PCT_H": 47.5, "PCT_M": 52.5}], "programs": [{"name": "Espec. Educación Ambiental y Desarrollo Comunidad", "nivel": "Especialización", "years": {"2020": {"ins": 61, "adm": 48, "mat": 80, "grad": 85, "tabs": 166.7, "tsel": 78.7, "tgrad": 106.2, "pctH": 48.8, "pctM": 51.2, "brecha": -2.4}, "2021": {"ins": 92, "adm": 65, "mat": 53, "grad": 66, "tabs": 81.5, "tsel": 70.7, "tgrad": 124.5, "pctH": 50.9, "pctM": 49.1, "brecha": 1.8}, "2022": {"ins": 34, "adm": 33, "mat": 47, "grad": 59, "tabs": 142.4, "tsel": 97.1, "tgrad": 125.5, "pctH": 36.2, "pctM": 63.8, "brecha": -27.6}, "2023": {"ins": 15, "adm": 15, "mat": 32, "grad": 19, "tabs": 213.3, "tsel": 100.0, "tgrad": 59.4, "pctH": 34.4, "pctM": 65.6, "brecha": -31.2}, "2024": {"ins": 12, "adm": 8, "mat": 16, "grad": 10, "tabs": 200.0, "tsel": 66.7, "tgrad": 62.5, "pctH": 62.5, "pctM": 37.5, "brecha": 25.0}}}, {"name": "Espec. Gerencia para el Desarrollo Organizacional", "nivel": "Especialización", "years": {"2020": {"ins": 71, "adm": 53, "mat": 99, "grad": 50, "tabs": 186.8, "tsel": 74.6, "tgrad": 50.5, "pctH": 30.3, "pctM": 69.7, "brecha": -39.4}, "2021": {"ins": 206, "adm": 137, "mat": 130, "grad": 45, "tabs": 94.9, "tsel": 66.5, "tgrad": 34.6, "pctH": 46.2, "pctM": 53.8, "brecha": -7.6}, "2022": {"ins": 187, "adm": 181, "mat": 172, "grad": 108, "tabs": 95.0, "tsel": 96.8, "tgrad": 62.8, "pctH": 40.1, "pctM": 59.9, "brecha": -19.8}, "2023": {"ins": 194, "adm": 185, "mat": 187, "grad": 170, "tabs": 101.1, "tsel": 95.4, "tgrad": 90.9, "pctH": 44.4, "pctM": 55.6, "brecha": -11.2}, "2024": {"ins": 174, "adm": 149, "mat": 129, "grad": 144, "tabs": 86.6, "tsel": 85.6, "tgrad": 111.6, "pctH": 42.6, "pctM": 57.4, "brecha": -14.8}}}, {"name": "Espec. Gestión de Sistemas de Información Gerencial", "nivel": "Especialización", "years": {"2020": {"ins": 74, "adm": 71, "mat": 113, "grad": 66, "tabs": 159.2, "tsel": 95.9, "tgrad": 58.4, "pctH": 51.3, "pctM": 48.7, "brecha": 2.6}, "2021": {"ins": 123, "adm": 91, "mat": 85, "grad": 93, "tabs": 93.4, "tsel": 74.0, "tgrad": 109.4, "pctH": 51.8, "pctM": 48.2, "brecha": 3.6}, "2022": {"ins": 112, "adm": 105, "mat": 109, "grad": 66, "tabs": 103.8, "tsel": 93.8, "tgrad": 60.6, "pctH": 56.0, "pctM": 44.0, "brecha": 12.0}, "2023": {"ins": 174, "adm": 164, "mat": 161, "grad": 101, "tabs": 98.2, "tsel": 94.3, "tgrad": 62.7, "pctH": 60.9, "pctM": 39.1, "brecha": 21.8}, "2024": {"ins": 85, "adm": 81, "mat": 84, "grad": 102, "tabs": 103.7, "tsel": 95.3, "tgrad": 121.4, "pctH": 57.1, "pctM": 42.9, "brecha": 14.2}}}, {"name": "Espec. Negocios y Comercio Electrónico", "nivel": "Especialización", "years": {"2020": {"ins": 25, "adm": 24, "mat": 25, "grad": 29, "tabs": 104.2, "tsel": 96.0, "tgrad": 116.0, "pctH": 72.0, "pctM": 28.0, "brecha": 44.0}, "2021": {"ins": 34, "adm": 27, "mat": 24, "grad": 21, "tabs": 88.9, "tsel": 79.4, "tgrad": 87.5, "pctH": 45.8, "pctM": 54.2, "brecha": -8.4}, "2022": {"ins": 20, "adm": 18, "mat": 17, "grad": 22, "tabs": 94.4, "tsel": 90.0, "tgrad": 129.4, "pctH": 64.7, "pctM": 35.3, "brecha": 29.4}, "2023": {"ins": 0, "adm": 0, "mat": 0, "grad": 14, "tabs": 0.0, "tsel": 0.0, "tgrad": 0.0, "pctH": 0.0, "pctM": 0.0, "brecha": 0.0}, "2024": {"ins": 0, "adm": 0, "mat": 0, "grad": 2, "tabs": 0.0, "tsel": 0.0, "tgrad": 0.0, "pctH": 0.0, "pctM": 0.0, "brecha": 0.0}}}, {"name": "Espec. Procesos Pedagógicos Entrenamiento Deportivo", "nivel": "Especialización", "years": {"2020": {"ins": 19, "adm": 14, "mat": 45, "grad": 43, "tabs": 321.4, "tsel": 73.7, "tgrad": 95.6, "pctH": 88.9, "pctM": 11.1, "brecha": 77.8}, "2021": {"ins": 38, "adm": 27, "mat": 30, "grad": 16, "tabs": 111.1, "tsel": 71.1, "tgrad": 53.3, "pctH": 86.7, "pctM": 13.3, "brecha": 73.4}, "2022": {"ins": 17, "adm": 0, "mat": 10, "grad": 22, "tabs": 0.0, "tsel": 0.0, "tgrad": 220.0, "pctH": 70.0, "pctM": 30.0, "brecha": 40.0}, "2023": {"ins": 26, "adm": 23, "mat": 23, "grad": 0, "tabs": 100.0, "tsel": 88.5, "tgrad": 0.0, "pctH": 78.3, "pctM": 21.7, "brecha": 56.6}, "2024": {"ins": 8, "adm": 1, "mat": 8, "grad": 17, "tabs": 800.0, "tsel": 12.5, "tgrad": 212.5, "pctH": 87.5, "pctM": 12.5, "brecha": 75.0}}}, {"name": "Maestría en Ciencias Ambientales", "nivel": "Maestría", "years": {"2020": {"ins": 13, "adm": 11, "mat": 39, "grad": 8, "tabs": 354.5, "tsel": 84.6, "tgrad": 20.5, "pctH": 59.0, "pctM": 41.0, "brecha": 18.0}, "2021": {"ins": 31, "adm": 24, "mat": 27, "grad": 18, "tabs": 112.5, "tsel": 77.4, "tgrad": 66.7, "pctH": 63.0, "pctM": 37.0, "brecha": 26.0}, "2022": {"ins": 43, "adm": 43, "mat": 44, "grad": 10, "tabs": 102.3, "tsel": 100.0, "tgrad": 22.7, "pctH": 59.1, "pctM": 40.9, "brecha": 18.2}, "2023": {"ins": 0, "adm": 0, "mat": 37, "grad": 5, "tabs": 0.0, "tsel": 0.0, "tgrad": 13.5, "pctH": 62.2, "pctM": 37.8, "brecha": 24.4}, "2024": {"ins": 0, "adm": 0, "mat": 14, "grad": 5, "tabs": 0.0, "tsel": 0.0, "tgrad": 35.7, "pctH": 42.9, "pctM": 57.1, "brecha": -14.2}}}, {"name": "Maestría en Educación", "nivel": "Maestría", "years": {"2020": {"ins": 56, "adm": 56, "mat": 145, "grad": 21, "tabs": 258.9, "tsel": 100.0, "tgrad": 14.5, "pctH": 50.3, "pctM": 49.7, "brecha": 0.6}, "2021": {"ins": 70, "adm": 48, "mat": 117, "grad": 37, "tabs": 243.8, "tsel": 68.6, "tgrad": 31.6, "pctH": 56.4, "pctM": 43.6, "brecha": 12.8}, "2022": {"ins": 45, "adm": 33, "mat": 101, "grad": 13, "tabs": 306.1, "tsel": 73.3, "tgrad": 12.9, "pctH": 63.4, "pctM": 36.6, "brecha": 26.8}, "2023": {"ins": 0, "adm": 0, "mat": 65, "grad": 15, "tabs": 0.0, "tsel": 0.0, "tgrad": 23.1, "pctH": 70.8, "pctM": 29.2, "brecha": 41.6}, "2024": {"ins": 0, "adm": 0, "mat": 12, "grad": 26, "tabs": 0.0, "tsel": 0.0, "tgrad": 216.7, "pctH": 50.0, "pctM": 50.0, "brecha": 0.0}}}, {"name": "Doctorado en Ciencias de la Educación", "nivel": "Doctorado", "years": {"2020": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2021": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2022": {"ins": 15, "adm": 12, "mat": 14, "grad": 0, "tabs": 116.7, "tsel": 80.0, "tgrad": 0.0, "pctH": 50.0, "pctM": 50.0, "brecha": 0.0}, "2023": {"ins": 15, "adm": 11, "mat": 28, "grad": 0, "tabs": 254.5, "tsel": 73.3, "tgrad": 0.0, "pctH": 57.1, "pctM": 42.9, "brecha": 14.2}, "2024": {"ins": 15, "adm": 13, "mat": 37, "grad": 0, "tabs": 284.6, "tsel": 86.7, "tgrad": 0.0, "pctH": 59.5, "pctM": 40.5, "brecha": 19.0}}}, {"name": "Espec. Gerencia para la Transformación Digital", "nivel": "Especialización", "years": {"2020": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2021": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2022": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2023": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2024": {"ins": 68, "adm": 60, "mat": 52, "grad": 0, "tabs": 86.7, "tsel": 88.2, "tgrad": 0.0, "pctH": 65.4, "pctM": 34.6, "brecha": 30.8}}}, {"name": "Espec. Gestión Pública", "nivel": "Especialización", "years": {"2020": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2021": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2022": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2023": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2024": {"ins": 23, "adm": 21, "mat": 11, "grad": 0, "tabs": 52.4, "tsel": 91.3, "tgrad": 0.0, "pctH": 36.4, "pctM": 63.6, "brecha": -27.2}}}, {"name": "Espec. Marketing Digital", "nivel": "Especialización", "years": {"2020": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2021": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2022": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2023": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2024": {"ins": 34, "adm": 33, "mat": 30, "grad": 0, "tabs": 90.9, "tsel": 97.1, "tgrad": 0.0, "pctH": 43.3, "pctM": 56.7, "brecha": -13.4}}}, {"name": "Espec. Agronegocios Sostenibles", "nivel": "Especialización", "years": {"2020": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2021": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2022": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2023": {"ins": 0, "adm": 0, "mat": 0, "grad": 0, "tabs": 0, "tsel": 0, "tgrad": 0, "pctH": 0, "pctM": 0, "brecha": 0}, "2024": {"ins": 14, "adm": 11, "mat": 10, "grad": 0, "tabs": 90.9, "tsel": 78.6, "tgrad": 0.0, "pctH": 60.0, "pctM": 40.0, "brecha": 20.0}}}], "genero": [{"COD_SNIES": 4266, "PROG_CORTO": "Espec. Educación Ambiental y Desarrollo Comunidad", "NIVEL_CORTO": "Especialización", "2020_Hombre": 39, "2020_Mujer": 41, "2021_Hombre": 27, "2021_Mujer": 26, "2022_Hombre": 17, "2022_Mujer": 30, "2023_Hombre": 11, "2023_Mujer": 21, "2024_Hombre": 10, "2024_Mujer": 6}, {"COD_SNIES": 9949, "PROG_CORTO": "Espec. Gerencia para el Desarrollo Organizacional", "NIVEL_CORTO": "Especialización", "2020_Hombre": 30, "2020_Mujer": 69, "2021_Hombre": 60, "2021_Mujer": 70, "2022_Hombre": 69, "2022_Mujer": 103, "2023_Hombre": 83, "2023_Mujer": 104, "2024_Hombre": 55, "2024_Mujer": 74}, {"COD_SNIES": 11324, "PROG_CORTO": "Espec. Procesos Pedagógicos Entrenamiento Deportivo", "NIVEL_CORTO": "Especialización", "2020_Hombre": 40, "2020_Mujer": 5, "2021_Hombre": 26, "2021_Mujer": 4, "2022_Hombre": 7, "2022_Mujer": 3, "2023_Hombre": 18, "2023_Mujer": 5, "2024_Hombre": 7, "2024_Mujer": 1}, {"COD_SNIES": 104239, "PROG_CORTO": "Espec. Negocios y Comercio Electrónico", "NIVEL_CORTO": "Especialización", "2020_Hombre": 18, "2020_Mujer": 7, "2021_Hombre": 11, "2021_Mujer": 13, "2022_Hombre": 11, "2022_Mujer": 6, "2023_Hombre": 0, "2023_Mujer": 0, "2024_Hombre": 0, "2024_Mujer": 0}, {"COD_SNIES": 104968, "PROG_CORTO": "Maestría en Educación", "NIVEL_CORTO": "Maestría", "2020_Hombre": 73, "2020_Mujer": 72, "2021_Hombre": 66, "2021_Mujer": 51, "2022_Hombre": 64, "2022_Mujer": 37, "2023_Hombre": 46, "2023_Mujer": 19, "2024_Hombre": 6, "2024_Mujer": 6}, {"COD_SNIES": 105093, "PROG_CORTO": "Maestría en Ciencias Ambientales", "NIVEL_CORTO": "Maestría", "2020_Hombre": 23, "2020_Mujer": 16, "2021_Hombre": 17, "2021_Mujer": 10, "2022_Hombre": 26, "2022_Mujer": 18, "2023_Hombre": 23, "2023_Mujer": 14, "2024_Hombre": 6, "2024_Mujer": 8}, {"COD_SNIES": 105401, "PROG_CORTO": "Espec. Gestión de Sistemas de Información Gerencial", "NIVEL_CORTO": "Especialización", "2020_Hombre": 58, "2020_Mujer": 55, "2021_Hombre": 44, "2021_Mujer": 41, "2022_Hombre": 61, "2022_Mujer": 48, "2023_Hombre": 98, "2023_Mujer": 63, "2024_Hombre": 48, "2024_Mujer": 36}, {"COD_SNIES": 110008, "PROG_CORTO": "Doctorado en Ciencias de la Educación", "NIVEL_CORTO": "Doctorado", "2020_Hombre": 0, "2020_Mujer": 0, "2021_Hombre": 0, "2021_Mujer": 0, "2022_Hombre": 7, "2022_Mujer": 7, "2023_Hombre": 16, "2023_Mujer": 12, "2024_Hombre": 22, "2024_Mujer": 15}, {"COD_SNIES": 115949, "PROG_CORTO": "Espec. Gerencia para la Transformación Digital", "NIVEL_CORTO": "Especialización", "2020_Hombre": 0, "2020_Mujer": 0, "2021_Hombre": 0, "2021_Mujer": 0, "2022_Hombre": 0, "2022_Mujer": 0, "2023_Hombre": 0, "2023_Mujer": 0, "2024_Hombre": 34, "2024_Mujer": 18}, {"COD_SNIES": 116475, "PROG_CORTO": "Espec. Gestión Pública", "NIVEL_CORTO": "Especialización", "2020_Hombre": 0, "2020_Mujer": 0, "2021_Hombre": 0, "2021_Mujer": 0, "2022_Hombre": 0, "2022_Mujer": 0, "2023_Hombre": 0, "2023_Mujer": 0, "2024_Hombre": 4, "2024_Mujer": 7}, {"COD_SNIES": 116654, "PROG_CORTO": "Espec. Marketing Digital", "NIVEL_CORTO": "Especialización", "2020_Hombre": 0, "2020_Mujer": 0, "2021_Hombre": 0, "2021_Mujer": 0, "2022_Hombre": 0, "2022_Mujer": 0, "2023_Hombre": 0, "2023_Mujer": 0, "2024_Hombre": 13, "2024_Mujer": 17}, {"COD_SNIES": 116771, "PROG_CORTO": "Espec. Agronegocios Sostenibles", "NIVEL_CORTO": "Especialización", "2020_Hombre": 0, "2020_Mujer": 0, "2021_Hombre": 0, "2021_Mujer": 0, "2022_Hombre": 0, "2022_Mujer": 0, "2023_Hombre": 0, "2023_Mujer": 0, "2024_Hombre": 6, "2024_Mujer": 4}]};
Object.defineProperty(window,'_snFac',{get:function(){return window.AppState.snies.fac;},set:function(v){window.AppState.snies.fac=v;},configurable:true});
Object.defineProperty(window,'_snProg',{get:function(){return window.AppState.snies.prog;},set:function(v){window.AppState.snies.prog=v;},configurable:true});

function renderSNIES(){
  var wrap=document.getElementById('snies-content');
  if(!wrap) return;
  var facs=['TODAS','Ciencias Admin., Econ. y Contables','Ciencias Agropecuarias','Educación','Ciencias del Deporte y Ed. Física'];
  var FAC_COL={'Ciencias Admin., Econ. y Contables':'#006633','Ciencias Agropecuarias':'#2e8b57','Educación':'#C8A43A','Ciencias del Deporte y Ed. Física':'#185FA5'};
  var FAC_MP={'Espec. Educación Ambiental y Desarrollo Comunidad':'Ciencias Agropecuarias','Espec. Agronegocios Sostenibles':'Ciencias Agropecuarias','Maestría en Ciencias Ambientales':'Ciencias Agropecuarias','Espec. Gerencia para el Desarrollo Organizacional':'Ciencias Admin., Econ. y Contables','Espec. Gerencia para la Transformación Digital':'Ciencias Admin., Econ. y Contables','Espec. Gestión Pública':'Ciencias Admin., Econ. y Contables','Espec. Marketing Digital':'Ciencias Admin., Econ. y Contables','Espec. Negocios y Comercio Electrónico':'Ciencias Admin., Econ. y Contables','Espec. Gestión de Sistemas de Información Gerencial':'Ciencias Admin., Econ. y Contables','Espec. Procesos Pedagógicos Entrenamiento Deportivo':'Ciencias del Deporte y Ed. Física','Doctorado en Ciencias de la Educación':'Educación','Maestría en Educación':'Educación'};
  var AÑOS=[2020,2021,2022,2023,2024];
  var n=function(v){return isNaN(+v)?0:+v;};
  var fmt=function(v){return Math.round(n(v)).toLocaleString('es-CO');};
  var fmtP=function(v){return n(v).toFixed(1)+'%';};
  var progs=_snFac==='TODAS'?SD.programs:SD.programs.filter(function(p){return FAC_MP[p.name]===_snFac;});
  if(!_snProg||!progs.find(function(p){return p.name===_snProg;})) _snProg=progs.length?progs[0].name:null;
  var prog=_snProg?SD.programs.find(function(p){return p.name===_snProg;}):null;
  var fc=_snFac==='TODAS'?'#006633':(FAC_COL[_snFac]||'#006633');
  var facBtns=facs.map(function(f){var a=f===_snFac;var c=FAC_COL[f]||'#006633';return '<button data-action="snies-set-fac" data-fac="'+f.replace(/"/g,'&quot;')+'" style="padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid '+(a?c:'#d0e4d8')+';background:'+(a?c:'#fff')+';color:'+(a?'#fff':'#555')+'">'+( f==='TODAS'?'Todas':f)+'</button>';}).join('');
  var progBtns=progs.map(function(p){var a=p.name===_snProg;var c=FAC_COL[FAC_MP[p.name]]||fc;return '<button data-action="snies-set-prog" data-prog="'+p.name.replace(/"/g,'&quot;')+'" style="padding:5px 12px;border-radius:8px;font-size:10px;font-weight:600;cursor:pointer;border:1.5px solid '+(a?c:'#d8e8dc')+';background:'+(a?c+'18':'#fff')+';color:'+(a?c:'#555')+'">'+p.name.replace('Espec. ','').replace('Maestría en ','Mae. ').replace('Doctorado en ','Doc. ')+'</button>';}).join('');
  var h='<div style="padding:.5rem 0">';
  h+='<div style="font-size:14px;font-weight:700;color:#006633;margin-bottom:1rem;display:flex;align-items:center;gap:8px"><span style="width:4px;height:20px;background:#006633;border-radius:2px;display:inline-block"></span>Análisis SNIES · Posgrados 2020–2024</div>';
  h+='<div style="background:#fff;border-radius:10px;border:1px solid #e0ece4;padding:12px 16px;margin-bottom:10px"><div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#999;margin-bottom:8px">Facultad</div><div style="display:flex;gap:7px;flex-wrap:wrap">'+facBtns+'</div></div>';
  h+='<div style="background:#fff;border-radius:10px;border:1px solid #e0ece4;padding:12px 16px;margin-bottom:1rem"><div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#999;margin-bottom:8px">Programa</div><div style="display:flex;gap:7px;flex-wrap:wrap">'+progBtns+'</div></div>';
  if(prog){
    var y24=prog.years['2024'],y23=prog.years['2023'];
    var nivCol={'Especialización':'#3aaa72','Maestría':'#C8A43A','Doctorado':'#0d3d22'};
    h+='<div style="background:'+fc+'12;border-radius:10px;border-left:4px solid '+fc+';padding:12px 16px;margin-bottom:1rem"><div style="font-size:13px;font-weight:700;color:'+fc+'">'+prog.name+'</div><span style="background:'+(nivCol[prog.nivel]||'#888')+';color:#fff;padding:2px 9px;border-radius:8px;font-size:9px;font-weight:700">'+prog.nivel+'</span></div>';
    // KPIs
    h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px">';
    var kpis=[['Matriculados 2024',fmt(y24.mat),'vs '+fmt(y23.mat)+' en 2023',fc],['Graduados 2024',fmt(y24.grad),'vs '+fmt(y23.grad)+' en 2023','#C8A43A'],['Inscritos 2024',fmt(y24.ins),'vs '+fmt(y23.ins)+' en 2023','#185FA5'],['Admitidos 2024',fmt(y24.adm),'vs '+fmt(y23.adm)+' en 2023','#0891b2']];
    kpis.forEach(function(k){h+='<div style="background:#fff;border-radius:10px;border:1px solid #e0ece4;border-left:4px solid '+k[3]+';padding:12px 14px"><div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#999;margin-bottom:5px">'+k[0]+'</div><div style="font-size:26px;font-weight:800;color:'+k[3]+';font-family:monospace">'+k[1]+'</div><div style="font-size:10px;color:#888;margin-top:3px">'+k[2]+'</div></div>';});
    h+='</div>';
    // Charts area
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';
    h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden"><div style="padding:10px 14px;border-bottom:1px solid #f0f4f0;font-size:10px;font-weight:700;color:'+fc+';text-transform:uppercase">Flujo estudiantil 2020–2024</div><div style="padding:12px;height:220px"><canvas id="sn-flujo"></canvas></div></div>';
    h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden"><div style="padding:10px 14px;border-bottom:1px solid #f0f4f0;font-size:10px;font-weight:700;color:#C8A43A;text-transform:uppercase">Tasas indicadores %</div><div style="padding:12px;height:220px"><canvas id="sn-tasas"></canvas></div></div>';
    h+='</div>';
    // Tabla historica
    h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden">';
    h+='<div style="padding:10px 14px;background:'+fc+';color:#fff;font-size:10px;font-weight:700;text-transform:uppercase">Histórico 2020–2024 · '+prog.name+'</div>';
    h+='<table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr style="background:'+fc+'22">';
    ['Año','Inscritos','Admitidos','Matriculados','Graduados','T.Absorción','T.Selectividad','T.Graduación','% H','% M'].forEach(function(c){h+='<th style="padding:8px;text-align:center">'+c+'</th>';});
    h+='</tr></thead><tbody>';
    AÑOS.forEach(function(y){var d=prog.years[String(y)],has=n(d.mat)+n(d.grad)+n(d.ins)>0,bg=y===2024?'background:#e6f2eb':'';h+='<tr style="border-bottom:1px solid #edf2ee;'+bg+'"><td style="padding:7px 10px;font-weight:'+(y===2024?'700':'400')+';color:'+(y===2024?fc:'#333')+'">'+y+'</td>';[d.ins,d.adm,d.mat,d.grad].forEach(function(v){h+='<td style="padding:7px;text-align:center;font-family:monospace">'+(has?fmt(v):'—')+'</td>';});[d.tabs,d.tsel,d.tgrad,d.pctH,d.pctM].forEach(function(v){h+='<td style="padding:7px;text-align:center;font-family:monospace">'+(has?fmtP(v):'—')+'</td>';});h+='</tr>';});
    h+='</tbody></table></div>';
    h+='</div>';
    wrap.innerHTML=h;
    // Charts
    setTimeout(function(){
      var lo={responsive:true,maintainAspectRatio:false,animation:{duration:500},plugins:{legend:{position:'bottom',labels:{font:{size:9},boxWidth:10,padding:8}},tooltip:{mode:'index',intersect:false}}};
      function ds(lbl,data,color,type,fill){return{type:type||'bar',label:lbl,data:data,backgroundColor:type==='line'?'transparent':color+'bb',borderColor:color,borderWidth:2,tension:.4,fill:fill||false,pointRadius:type==='line'?4:0,pointBackgroundColor:color,pointBorderColor:'#fff',pointBorderWidth:2,borderRadius:type==='bar'?4:0};}
      if(document.getElementById('sn-flujo')){
        new Chart(document.getElementById('sn-flujo'),{type:'bar',data:{labels:AÑOS,datasets:[ds('Inscritos',AÑOS.map(function(y){return n(prog.years[String(y)].ins);}), '#378ADD'),ds('Admitidos',AÑOS.map(function(y){return n(prog.years[String(y)].adm);}),fc),ds('Matriculados',AÑOS.map(function(y){return n(prog.years[String(y)].mat);}), '#C8A43A'),Object.assign(ds('Graduados',AÑOS.map(function(y){return n(prog.years[String(y)].grad);}), '#c0392b','line'),{order:-1})]},options:lo});
      }
      if(document.getElementById('sn-tasas')){
        var lo2=JSON.parse(JSON.stringify(lo));lo2.scales={y:{ticks:{callback:function(v){return v+'%'}},beginAtZero:true}};
        new Chart(document.getElementById('sn-tasas'),{type:'line',data:{labels:AÑOS,datasets:[ds('Absorción',AÑOS.map(function(y){return n(prog.years[String(y)].tabs);}),'#C8A43A','line'),ds('Selectividad',AÑOS.map(function(y){return n(prog.years[String(y)].tsel);}), '#185FA5','line'),ds('Graduación',AÑOS.map(function(y){return n(prog.years[String(y)].tgrad);}),fc,'line')]},options:lo2});
      }
    },150);
  } else {
    wrap.innerHTML='<div style="padding:2rem;text-align:center;color:#aaa">Sin programas para mostrar</div>';
  }
}
function snSetFac(f){_snFac=f;_snProg=null;renderSNIES();}
function snSetProg(p){_snProg=p;renderSNIES();}
// exportSNIES extraído a assets/js/modules/export.js (Fase 2)

// ===== PIPELINE =====
function renderPipeline(){
  var wrap=document.getElementById('pipeline-content');
  if(!wrap) return;
  var G='#006633',OR='#C8A43A',BL='#185FA5',RD='#c0392b',AM='#d97706';
  var MESES=['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var TRI_COL={T1:BL,T2:G,T3:OR,T4:RD};
  var TRI_BG={T1:'#e6f0fb',T2:'#e6f2eb',T3:'#fdf6e3',T4:'#fee2e2'};
  function getTri(mes){if(!mes)return null;if(mes<=3)return 'T1';if(mes<=6)return 'T2';if(mes<=9)return 'T3';return 'T4';}
  function getTriLabel(t){return {T1:'I Trimestre (Ene–Mar)',T2:'II Trimestre (Abr–Jun)',T3:'III Trimestre (Jul–Sep)',T4:'IV Trimestre (Oct–Dic)'}[t]||'';}
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
  // Timeline
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
      +'<div style="background:'+bg+';padding:13px 16px;border-bottom:2px solid '+col+';display:flex;align-items:center;justify-content:space-between;cursor:pointer" data-action="toggle-section" data-sec-id="'+id+'"'
        +'<div style="display:flex;align-items:center;gap:10px"><div style="width:34px;height:34px;border-radius:50%;background:'+col+';display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0">'+ic+'</div>'
        +'<div><div style="font-size:13px;font-weight:700;color:'+col+'">'+titulo+'</div><div style="font-size:10px;color:#666;margin-top:1px">'+sub+'</div></div></div>'
        +'<div style="display:flex;align-items:center;gap:10px"><span style="background:'+col+';color:#fff;border-radius:20px;padding:3px 14px;font-size:13px;font-weight:700">'+items.length+'</span><span id="icon-'+id+'" style="color:'+col+';font-size:16px;font-weight:700">▼</span></div>'
      +'</div>'
      +'<div id="'+id+'" style="display:none">'+tabla(items,col)+'</div>'
      +'</div>';
  }
  var h='<div style="padding:.5rem 0">';
  h+='<div style="font-size:15px;font-weight:700;color:#1a2e1a;margin-bottom:1rem;display:flex;align-items:center;gap:8px"><span style="width:4px;height:22px;background:#006633;border-radius:2px;display:inline-block"></span>Estado de desarrollo — Programas de posgrado</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:1.2rem">'
    +kpi('✅','Vigente',grupos.vigente.length,G)
    +kpi('📤','Radicado MEN',grupos.radicado.length,BL)
    +kpi('🔨','En construcción',grupos.construccion.length,AM)
    +kpi('📐','Por construir',grupos.porConstruir.length,OR)
    +kpi('❌','Negado MEN',grupos.negado.length,RD)
    +kpi('⚠️','Reclamación',grupos.reclamacion.length,'#dc2626')
  +'</div>';
  // Timeline
  h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden;margin-bottom:1rem">'
    +'<div style="background:#1a2e1a;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer" data-action="toggle-section" data-sec-id="timeline"'
      +'<div style="display:flex;align-items:center;gap:10px"><span style="font-size:18px">📅</span><div><div style="font-size:13px;font-weight:700;color:#fff">Cronograma por trimestre</div><div style="font-size:10px;color:rgba(200,164,58,.8)">Programas en desarrollo con fecha asignada · '+conFecha.length+' programas</div></div></div>'
      +'<span id="icon-timeline" style="color:#C8A43A;font-size:16px;font-weight:700">▼</span>'
    +'</div>'
    +'<div id="timeline">'+buildTimeline(conFecha)+'</div>'
  +'</div>';
  h+=sec('🔨','En construcción',grupos.construccion.length+' programas con desarrollo activo',grupos.construccion,AM,'#fffdf5');
  h+=sec('📐','Por construir',grupos.porConstruir.length+' programas identificados',grupos.porConstruir,OR,'#fff9f0');
  h+=sec('📤','Radicado MEN',grupos.radicado.length+' programas en evaluación',grupos.radicado,BL,'#f0f6ff');
  h+=sec('⚠️','En reclamación',grupos.reclamacion.length+' con observaciones del MEN',grupos.reclamacion,'#dc2626','#fff8f8');
  h+=sec('❌','Negado MEN',grupos.negado.length+' con resolución negativa',grupos.negado,RD,'#fff5f5');
  h+=sec('✅','Vigente',grupos.vigente.length+' programas activos con registro',grupos.vigente,G,'#f0fdf4');
  h+='</div>';
  wrap.innerHTML=h;
}
function toggleSec(id){var el=document.getElementById(id),ic=document.getElementById('icon-'+id);if(!el)return;var open=el.style.display!=='none';el.style.display=open?'none':'block';if(ic)ic.textContent=open?'▼':'▲';}

// ===== EDITOR CON SELECTOR DE FACULTAD =====
// Versión ACTIVA — sombrea a renderEditor en línea 364.
// TODO [MVC]: unificar con la implementación legacy en Fase 3.
function renderEditor(){
  var f=AppData.getFacultad(AppState.navigation.curFac);
  function cbs(items){var v=0,p=0,c=0;items.forEach(function(x){var e=(x.e||'').toLowerCase();if(e.includes('obtención')||e.includes('registro')||e.includes('oferta'))v++;else if(e.includes('construcción')||e.includes('radicado')||e.includes('radicación'))c++;else p++;});return{v:v,p:p,c:c};}
  var facBtns=AppData.getFacultades().map(function(fac,i){var a=i===curFac;return '<button data-action="sel-fac" data-fac="'+i+'" style="padding:6px 14px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;border:1.5px solid '+(a?'#006633':'#d0e4d8')+';background:'+(a?'#006633':'#fff')+';color:'+(a?'#fff':'#555')+'">'+fac.name.replace('Facultad de ','').replace('Facultad ','').split(',')[0].trim()+'</button>';}).join('');
  var h='<div style="padding:1rem">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:8px"><div style="font-size:14px;font-weight:700;color:#006633;display:flex;align-items:center;gap:8px"><span style="width:4px;height:20px;background:#006633;border-radius:2px;display:inline-block"></span>Editor de datos</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn-green" data-action="open-new-prog">+ Nuevo programa</button><button data-action="open-edit-fac">✎ Editar facultad</button><button data-action="open-new-fac">+ Nueva facultad</button></div></div>';
  h+='<div style="background:#fff;border-radius:10px;border:1px solid #e0ece4;padding:12px 16px;margin-bottom:1rem"><div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#999;margin-bottom:8px">Selecciona la facultad</div><div style="display:flex;gap:7px;flex-wrap:wrap">'+facBtns+'</div></div>';
  h+='<div style="background:#006633;border-radius:10px;padding:10px 16px;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between"><div style="font-size:12px;font-weight:700;color:#fff">'+f.name+'</div><div style="font-size:10px;color:rgba(255,255,255,.7)">'+f.progs.length+' programa(s)</div></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;margin-bottom:1.5rem">';
  f.progs.forEach(function(p){
    var st=cbs(p.lineas.concat(p.mae));
    var cr=p.lineas.concat(p.mae).filter(function(x){return x.resp;}).length;
    h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden">'
      +'<div style="background:#006633;padding:11px 14px;display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:12px;font-weight:700;color:#fff">'+p.n+'</div><div style="font-size:9px;color:rgba(255,255,255,.65);margin-top:2px">'+p.lineas.length+' especialización(es) · '+p.mae.length+' maestría(s)</div></div><div style="font-size:15px">🎓</div></div>'
      +'<div style="padding:10px 14px">'
        +'<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">'
          +(st.v?'<span style="background:#e6f2eb;color:#006633;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700">✅ '+st.v+' vigente</span>':'')
          +(st.c?'<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700">🔨 '+st.c+' en proceso</span>':'')
          +(st.p?'<span style="background:#fffbeb;color:#d97706;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700">📐 '+st.p+' por construir</span>':'')
          +(cr?'<span style="background:#e6f0fb;color:#185FA5;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700">👤 '+cr+' con responsable</span>':'<span style="background:#f5f5f5;color:#aaa;padding:2px 8px;border-radius:8px;font-size:9px">Sin responsable</span>')
        +'</div>'
        +'<div style="font-size:10px;color:#666;margin-bottom:10px">'
          +p.lineas.slice(0,3).map(function(l){return '<div style="padding:3px 0;border-bottom:1px solid #f5f5f5;display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:#3aaa72;flex-shrink:0;display:inline-block"></span><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+l.esp+'</span>'+(l.mes&&l.ano?'<span style="font-size:8px;color:#185FA5;white-space:nowrap">'+['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][l.mes]+' '+l.ano+'</span>':'')+'</div>';}).join('')
          +(p.lineas.length>3?'<div style="color:#aaa;font-size:9px;padding-top:3px">+ '+(p.lineas.length-3)+' más...</div>':'')
          +p.mae.slice(0,2).map(function(m){return '<div style="padding:3px 0;border-bottom:1px solid #f5f5f5;display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:#C8A43A;flex-shrink:0;display:inline-block"></span><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+m.n+'</span>'+(m.mes&&m.ano?'<span style="font-size:8px;color:#185FA5;white-space:nowrap">'+['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][m.mes]+' '+m.ano+'</span>':'')+'</div>';}).join('')
        +'</div>'
        +'<div style="display:flex;gap:6px"><button data-pid="'+p.id+'" data-action="open-edit-prog" style="flex:1;background:#006633;color:#fff;border:none;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer">✎ Editar programa</button><button data-pid="'+p.id+'" data-action="delete-prog" style="background:#fee2e2;color:#c0392b;border:1px solid #fca5a5;border-radius:8px;padding:8px 12px;font-size:11px;font-weight:700;cursor:pointer" title="Eliminar">🗑</button></div>'
      +'</div></div>';
  });
  h+='</div>';
  // Doctorado colapsable
  h+='<div style="background:#fff;border-radius:12px;border:1px solid #e0ece4;overflow:hidden;margin-bottom:1rem">'
    +'<div style="background:#0d3d22;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer" data-action="toggle-doc-form">'
      +'<div style="display:flex;align-items:center;gap:10px"><span style="font-size:16px">🏆</span><div><div style="font-size:12px;font-weight:700;color:#fff">Doctorado de la facultad</div><div style="font-size:10px;color:rgba(200,164,58,.8);margin-top:1px">'+(f.doc?f.doc.n:'Sin doctorado — haz clic para agregar')+'</div></div></div>'
      +'<span id="doc-toggle-icon" style="color:#C8A43A;font-size:18px;font-weight:700">▼</span>'
    +'</div>'
    +'<div id="doc-form-body" style="padding:16px;display:none">'
      +'<div class="grid2" style="margin-bottom:10px"><div class="field"><label>Nombre del doctorado</label><input id="doc-name" value="'+(f.doc?f.doc.n:'')+'" placeholder="Nombre del doctorado"></div><div class="field"><label>Estado actual</label><input id="doc-estado" value="'+(f.doc?f.doc.e:'')+'" placeholder="Ej: En construcción"></div></div>'
      +'<div class="grid2" style="margin-bottom:10px"><div class="field"><label>Tipo de oferta</label><select id="doc-oferta"><option value="V" '+(f.doc&&f.doc.o==='V'?'selected':'')+'>Vigente</option><option value="P" '+(!f.doc||f.doc.o==='P'?'selected':'')+'>Proyectada</option></select></div><div class="field"><label>👤 Responsable</label><input id="doc-resp" value="'+(f.doc&&f.doc.resp?f.doc.resp:'')+'" placeholder="Docente o equipo"></div></div>'
      +'<div class="grid2" style="margin-bottom:12px"><div class="field"><label>📅 Mes inicio</label><select id="doc-mes"><option value="">— Mes —</option>'+['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map(function(m,i){return '<option value="'+(i+1)+'" '+(f.doc&&f.doc.mes===(i+1)?'selected':'')+'>'+m+'</option>';}).join('')+'</select></div><div class="field"><label>📅 Año inicio</label><select id="doc-ano"><option value="">— Año —</option>'+[2024,2025,2026,2027,2028].map(function(y){return '<option value="'+y+'" '+(f.doc&&f.doc.ano===y?'selected':'')+'>'+y+'</option>';}).join('')+'</select></div></div>'
      +'<button class="btn-green" data-action="save-doc">💾 Guardar doctorado</button>'
    +'</div>'
  +'</div>';
  h+='</div>';
  document.getElementById('editor-content').innerHTML=h;
}
function toggleDocForm(){var b=document.getElementById('doc-form-body'),ic=document.getElementById('doc-toggle-icon');if(!b)return;var o=b.style.display!=='none';b.style.display=o?'none':'block';if(ic)ic.textContent=o?'▼':'▲';}
function saveDoc(){
  var n=document.getElementById('doc-name').value.trim();
  if(!n){AppData.saveDocumento(curFac,null);}
  else{
    var mes=parseInt(document.getElementById('doc-mes').value)||null;
    var ano=parseInt(document.getElementById('doc-ano').value)||null;
    AppData.saveDocumento(curFac,{n:n,e:document.getElementById('doc-estado').value.trim(),o:document.getElementById('doc-oferta').value,sedes:[],resp:document.getElementById('doc-resp')?document.getElementById('doc-resp').value.trim():'',mes:mes,ano:ano});
  }
  toast('Doctorado guardado');renderViews();renderEditor();
}
function deleteFac(){
  var f=AppData.getFacultad(curFac);
  showConfirm('¿Eliminar facultad?','Se eliminará <strong>'+(f?f.name:'')+'</strong> y todos sus programas.',function(){
    AppData.deleteFacultad(curFac);curFac=Math.max(0,curFac-1);
    toast('Facultad eliminada');renderFacBar();populateSedes();renderViews();renderEditor();
  });
}
function openNewFac(){
  document.getElementById('editor-content').innerHTML='<div class="modal-overlay"><div class="modal"><div class="modal-title"><span>➕</span>Nueva facultad</div><div class="form-section"><div class="field"><label>Nombre de la facultad</label><input id="fac-name" placeholder="Ej: Facultad de Ingeniería"></div></div><div class="modal-actions"><button class="btn-green" data-action="save-fac" data-is-new="true">💾 Crear facultad</button><button data-action="cancel-edit">Cancelar</button></div></div></div>';
}
function openEditFac(){
  var f=AppData.getFacultad(curFac);
  document.getElementById('editor-content').innerHTML='<div class="modal-overlay"><div class="modal"><div class="modal-title"><span>✎</span>Editar facultad</div><div class="form-section"><div class="field"><label>Nombre de la facultad</label><input id="fac-name" value="'+(f?f.name:'')+'"></div></div><div class="modal-actions"><button class="btn-green" data-action="save-fac" data-is-new="false">💾 Guardar</button><button data-action="cancel-edit">Cancelar</button><button class="btn-red" data-action="delete-fac">🗑 Eliminar facultad</button></div></div></div>';
}
function saveFac(isNew){
  var n=document.getElementById('fac-name').value.trim();
  if(!n){toast('Escribe el nombre de la facultad');return;}
  if(isNew){AppData.saveFacultad({name:n,progs:[],doc:null},true);curFac=AppData.getFacultadCount()-1;}
  else{AppData.updateFacultadName(curFac,n);}
  toast('Facultad guardada');renderFacBar();renderViews();renderEditor();
}
function openNewProg(){editingProgId='__new__';tmpLineas=[];tmpMaes=[];renderProgForm();}
function openEditProg(pid){editingProgId=pid;if(!tmpLineas._progId||tmpLineas._progId!==pid){tmpLineas=[];tmpMaes=[];}renderProgForm();}

