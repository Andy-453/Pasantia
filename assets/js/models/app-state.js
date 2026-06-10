// models/app-state.js — Estado centralizado de la aplicación

var ALL_SEDES=['Chía','Facatativá','Fusagasugá','Girardot','Soacha','Ubate','Zipaquirá'];

// Migrados a AppState.navigation.curFac / AppState.filters.* via window accessors a continuación
// Aliases legacy: AppState.editor es fuente única
Object.defineProperty(window,'editingProgId',{get:function(){return window.AppState.editor.editingProgId;},set:function(v){window.AppState.editor.editingProgId=v;},configurable:true});
Object.defineProperty(window,'tmpLineas',{get:function(){return window.AppState.editor.tmpLineas;},set:function(v){window.AppState.editor.tmpLineas=v;},configurable:true});
Object.defineProperty(window,'tmpMaes',{get:function(){return window.AppState.editor.tmpMaes;},set:function(v){window.AppState.editor.tmpMaes=v;},configurable:true});

// Estado centralizado (migración gradual)
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
    ALL_SEDES: null
  }
};

// ===== ACCESSORS GLOBALES =====
// Aliases transparentes: window.curFac / window.filt* → AppState.*
Object.defineProperty(window,'curFac',{get:function(){return window.AppState.navigation.curFac;},set:function(v){window.AppState.navigation.curFac=v;},configurable:true});
Object.defineProperty(window,'filtSede',{get:function(){return window.AppState.filters.sede;},set:function(v){window.AppState.filters.sede=v;},configurable:true});
Object.defineProperty(window,'filtOferta',{get:function(){return window.AppState.filters.oferta;},set:function(v){window.AppState.filters.oferta=v;},configurable:true});
Object.defineProperty(window,'filtEstado',{get:function(){return window.AppState.filters.estado;},set:function(v){window.AppState.filters.estado=v;},configurable:true});
Object.defineProperty(window,'filtNivel',{get:function(){return window.AppState.filters.nivel;},set:function(v){window.AppState.filters.nivel=v;},configurable:true});
Object.defineProperty(window,'filtPregrado',{get:function(){return window.AppState.filters.pregrado;},set:function(v){window.AppState.filters.pregrado=v;},configurable:true});
// Inicializar staticData (solo lectura)
window.AppState.staticData.ALL_SEDES=ALL_SEDES;

// ===== DATOS SNIES =====
Object.defineProperty(window,'SD',{get:function(){return window.AppState.snies.SD;},set:function(v){window.AppState.snies.SD=v;},configurable:true});
AppState.snies.SD = {"resumen": [{"AÑO_ARCHIVO": 2020, "INSCRITOS": 319, "ADMITIDOS": 277, "PRIMER_CURSO": 305, "MATRICULADOS": 546, "GRADUADOS": 303, "Hombre": 592.0, "Mujer": 700.0, "T_ABSORCION": 197.1, "T_SELECTIVIDAD": 86.8, "T_GRADUACION": 55.5, "T_PRIMER_CURSO": 55.9, "PCT_H": 45.8, "PCT_M": 54.2}, {"AÑO_ARCHIVO": 2021, "INSCRITOS": 594, "ADMITIDOS": 419, "PRIMER_CURSO": 316, "MATRICULADOS": 466, "GRADUADOS": 296, "Hombre": 637.0, "Mujer": 602.0, "T_ABSORCION": 111.2, "T_SELECTIVIDAD": 70.5, "T_GRADUACION": 63.5, "T_PRIMER_CURSO": 67.8, "PCT_H": 51.4, "PCT_M": 48.6}, {"AÑO_ARCHIVO": 2022, "INSCRITOS": 473, "ADMITIDOS": 425, "PRIMER_CURSO": 317, "MATRICULADOS": 514, "GRADUADOS": 301, "Hombre": 643.0, "Mujer": 764.0, "T_ABSORCION": 120.9, "T_SELECTIVIDAD": 89.9, "T_GRADUACION": 58.6, "T_PRIMER_CURSO": 61.7, "PCT_H": 45.7, "PCT_M": 54.3}, {"AÑO_ARCHIVO": 2023, "INSCRITOS": 424, "ADMITIDOS": 398, "PRIMER_CURSO": 328, "MATRICULADOS": 533, "GRADUADOS": 324, "Hombre": 702.0, "Mujer": 699.0, "T_ABSORCION": 133.9, "T_SELECTIVIDAD": 93.9, "T_GRADUACION": 60.8, "T_PRIMER_CURSO": 61.5, "PCT_H": 50.1, "PCT_M": 49.9}, {"AÑO_ARCHIVO": 2024, "INSCRITOS": 460, "ADMITIDOS": 383, "PRIMER_CURSO": 289, "MATRICULADOS": 403, "GRADUADOS": 306, "Hombre": 454.0, "Mujer": 501.0, "T_ABSORCION": 105.2, "T_SELECTIVIDAD": 83.3, "T_GRADUACION": 75.9, "T_PRIMER_CURSO": 71.7, "PCT_H": 47.5, "PCT_M": 52.5}], "programs": [{"name": "Espec. Educación Ambiental y Desarrollo Comunidad", "nivel": "Especialización", "years": {"2020": {"ins": 61, "adm": 48, "mat": 80, "grad": 85, "tabs": 166.7, "tsel": 78.7, "tgrad": 106.2, "pctH": 48.8, "pctM": 51.2, "brecha": -2.4}, "2021": {"ins": 92, "adm": 65, "mat": 53, "grad": 66, "tabs": 81.5, "tsel": 70.7, "tgrad": 124.5, "pctH": 50.9, "pctM": 49.1, "brecha": 1.8}, "2022": {"ins": 34, "adm": 33, "mat": 47, "grad": 59, "tabs": 142.4, "tsel": 97.1, "tgrad": 125.5, "pctH": 36.2, "pctM": 63.8, "brecha": -27.6}, "2023": {"ins": 15, "adm": 15, "mat": 32, "grad": 19, "tabs": 126.7, "tsel": 100.0, "tgrad": 59.4, "pctH": 42.1, "pctM": 57.9, "brecha": -15.8}, "2024": {"ins": 20, "adm": 19, "mat": 25, "grad": 28, "tabs": 147.4, "tsel": 95.0, "tgrad": 112.0, "pctH": 44.0, "pctM": 56.0, "brecha": -12.0}}, "promedios": {"ins": 44.4, "adm": 36.0, "mat": 47.4, "grad": 51.4, "tabs": 129.9, "tsel": 88.1, "tgrad": 100.3, "pctH": 44.2, "pctM": 55.8, "brecha": -11.6}}, {"name": "Espec. en Analítica Aplicada a Negocios", "nivel": "Especialización", "years": {"2020": {"ins": 56, "adm": 49, "mat": 82, "grad": 54, "tabs": 110.2, "tsel": 87.5, "tgrad": 65.9, "pctH": 39.0, "pctM": 61.0, "brecha": -22.0}, "2021": {"ins": 79, "adm": 68, "mat": 68, "grad": 48, "tabs": 70.6, "tsel": 86.1, "tgrad": 70.6, "pctH": 48.5, "pctM": 51.5, "brecha": -2.9}, "2022": {"ins": 68, "adm": 68, "mat": 67, "grad": 66, "tabs": 97.1, "tsel": 100.0, "tgrad": 98.5, "pctH": 52.2, "pctM": 47.8, "brecha": 4.5}, "2023": {"ins": 67, "adm": 61, "mat": 47, "grad": 47, "tabs": 77.0, "tsel": 91.0, "tgrad": 100.0, "pctH": 57.4, "pctM": 42.6, "brecha": 14.9}, "2024": {"ins": 84, "adm": 72, "mat": 62, "grad": 44, "tabs": 61.1, "tsel": 85.7, "tgrad": 71.0, "pctH": 51.6, "pctM": 48.4, "brecha": 3.2}}, "promedios": {"ins": 70.8, "adm": 63.6, "mat": 65.2, "grad": 51.8, "tabs": 79.3, "tsel": 90.0, "tgrad": 78.3, "pctH": 49.2, "pctM": 50.8, "brecha": -1.6}}, {"name": "Espec. en Analítica y Big Data en las Organizaciones", "nivel": "Especialización", "years": {"2020": {"ins": 111, "adm": 83, "mat": 85, "grad": 65, "tabs": 78.3, "tsel": 74.8, "tgrad": 76.5, "pctH": 47.1, "pctM": 52.9, "brecha": -5.9}, "2021": {"ins": 124, "adm": 86, "mat": 78, "grad": 60, "tabs": 69.8, "tsel": 69.4, "tgrad": 76.9, "pctH": 53.8, "pctM": 46.2, "brecha": 7.7}, "2022": {"ins": 130, "adm": 103, "mat": 66, "grad": 58, "tabs": 56.3, "tsel": 79.2, "tgrad": 87.9, "pctH": 50.0, "pctM": 50.0, "brecha": 0.0}, "2023": {"ins": 142, "adm": 131, "mat": 96, "grad": 98, "tabs": 74.8, "tsel": 92.3, "tgrad": 102.1, "pctH": 50.0, "pctM": 50.0, "brecha": 0.0}, "2024": {"ins": 163, "adm": 126, "mat": 93, "grad": 87, "tabs": 69.0, "tsel": 77.3, "tgrad": 93.5, "pctH": 53.8, "pctM": 46.2, "brecha": 7.5}}, "promedios": {"ins": 134.0, "adm": 105.8, "mat": 83.6, "grad": 73.6, "tabs": 69.7, "tsel": 78.7, "tgrad": 86.9, "pctH": 51.0, "pctM": 49.0, "brecha": 2.0}}, {"name": "Espec. en Atención Integral a la Primera Infancia", "nivel": "Especialización", "years": {"2020": {"ins": 57, "adm": 48, "mat": 49, "grad": 37, "tabs": 77.1, "tsel": 84.2, "tgrad": 75.5, "pctH": 0.0, "pctM": 100.0, "brecha": -100.0}, "2021": {"ins": 42, "adm": 29, "mat": 35, "grad": 39, "tabs": 134.5, "tsel": 69.0, "tgrad": 111.4, "pctH": 0.0, "pctM": 100.0, "brecha": -100.0}, "2022": {"ins": 27, "adm": 27, "mat": 27, "grad": 36, "tabs": 133.3, "tsel": 100.0, "tgrad": 133.3, "pctH": 3.7, "pctM": 96.3, "brecha": -92.6}, "2023": {"ins": 16, "adm": 16, "mat": 23, "grad": 14, "tabs": 87.5, "tsel": 100.0, "tgrad": 60.9, "pctH": 12.5, "pctM": 87.5, "brecha": -75.0}, "2024": {"ins": 23, "adm": 19, "mat": 18, "grad": 16, "tabs": 84.2, "tsel": 82.6, "tgrad": 88.9, "pctH": 5.6, "pctM": 94.4, "brecha": -88.9}}, "promedios": {"ins": 33.0, "adm": 27.8, "mat": 30.4, "grad": 28.4, "tabs": 95.0, "tsel": 84.2, "tgrad": 91.4, "pctH": 3.9, "pctM": 96.1, "brecha": -92.2}}]};
Object.defineProperty(window,'_snFac',{get:function(){return window.AppState.snies.fac;},set:function(v){window.AppState.snies.fac=v;},configurable:true});
Object.defineProperty(window,'_snProg',{get:function(){return window.AppState.snies.prog;},set:function(v){window.AppState.snies.prog=v;},configurable:true});
