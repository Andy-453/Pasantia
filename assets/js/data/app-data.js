/**
 * app-data.js — Capa de acceso a datos (Fase 4)
 * ---
 * Responsabilidad:
 *   - encapsular operaciones de lectura/escritura sobre DB
 *   - validación básica antes de mutaciones
 *   - persistencia automática tras writes
 *   - coexistencia con window.DB (legacy)
 *
 * Dependencias:
 *   - window.DB (legacy, app.js)
 *   - saveDB (storage.js) — persistencia
 *
 * Uso:
 *   AppData.getFacultad(0) → Facultad object
 *   AppData.savePrograma(fi, prog, isNew) → muta + persiste
 *
 * Fase 4 — encapsulación progresiva.
 * DB sigue siendo fuente de verdad hasta migración completa.
 *
 * Operaciones documentadas en docs/architecture.md §19.
 *
 *   # Queries readonly (seguras):
 *     getFacultades(), getFacultad(i)
 *     getFacultadesSafe(), getFacultadSafe(i)
 *     getProgramas(fi), getProgramaCount(fi)
 *     getSedesEnUso(fi)
 *     getFacultadIndexById(fid), getFacultadIndexByName(name)
 *     getFacultadName(fi), getFacultadDoc(fi)
 *     findProgramById(pid), findFacultadIndexByProgId(pid)
 *     getProgramaById(pid)
 *
 *   # Writes controladas:
 *     savePrograma, deletePrograma
 *     saveFacultad, updateFacultadName, deleteFacultad
 *     saveDocumento
 */

window.AppData = {
  // ===== Queries readonly =====

  getFacultades: function() { return window.DB; },
  getFacultad: function(i) { return window.DB ? window.DB[i] : undefined; },
  getProgramas: function(fi) { return window.DB && window.DB[fi] ? window.DB[fi].progs : []; },
  getFacultadCount: function() { return window.DB ? window.DB.length : 0; },

  /** Retorna copia superficial del array — evitar mutaciones accidentales */
  getFacultadesSafe: function() { return window.DB ? [].concat(window.DB) : []; },

  /** Retorna copia superficial del objeto facultad */
  getFacultadSafe: function(i) {
    var f = window.DB ? window.DB[i] : undefined;
    return f ? Object.assign({}, f) : undefined;
  },

  /** Número de programas de pregrado de una facultad */
  getProgramaCount: function(fi) {
    var progs = this.getProgramas(fi);
    return Array.isArray(progs) ? progs.length : 0;
  },

  /**
   * Retorna array de strings con las sedes únicas usadas por los
   * programas de pregrado de la facultad en el índice dado.
   */
  getSedesEnUso: function(fi) {
    var progs = this.getProgramas(fi);
    if(!Array.isArray(progs)) return [];
    var set = {};
    progs.forEach(function(p) {
      if(Array.isArray(p.sedes)) p.sedes.forEach(function(s) { set[s] = true; });
    });
    return Object.keys(set);
  },

  /** Retorna solo el nombre de la facultad, o string vacío */
  getFacultadName: function(fi) {
    var f = this.getFacultad(fi);
    return f ? f.name : '';
  },

  /** Retorna el objeto doc de la facultad, o null */
  getFacultadDoc: function(fi) {
    var f = this.getFacultad(fi);
    return f ? (f.doc || null) : null;
  },

  /** Busca índice de facultad por su campo id */
  getFacultadIndexById: function(fid) {
    if(!window.DB) return -1;
    for(var i = 0; i < window.DB.length; i++) {
      if(window.DB[i].id === fid) return i;
    }
    return -1;
  },

  /** Busca índice de facultad por su nombre exacto */
  getFacultadIndexByName: function(name) {
    if(!window.DB) return -1;
    for(var i = 0; i < window.DB.length; i++) {
      if(window.DB[i].name === name) return i;
    }
    return -1;
  },

  /** Retorna solo el objeto programa, sin facIndex */
  getProgramaById: function(pid) {
    var r = this.findProgramById(pid);
    return r ? r.programa : null;
  },

  findProgramById: function(pid) {
    if(!window.DB) return null;
    for(var fi=0; fi<window.DB.length; fi++) {
      var f=window.DB[fi];
      for(var pi=0; pi<f.progs.length; pi++) {
        if(f.progs[pi].id===pid) return {facIndex:fi,programa:f.progs[pi]};
      }
    }
    return null;
  },

  findFacultadIndexByProgId: function(pid) {
    var r=this.findProgramById(pid);
    return r?r.facIndex:-1;
  },

  // ===== Write operations =====

  /** @private validación ligera: índice facultad válido */
  _validFacIndex: function(fi) {
    if(typeof fi !== 'number' || fi < 0 || !window.DB || fi >= window.DB.length) {
      console.warn('AppData: facIndex inválido', fi);
      return false;
    }
    return true;
  },

  /** @private validación ligera: objeto programa */
  _validPrograma: function(prog) {
    if(!prog || typeof prog !== 'object') {
      console.warn('AppData: programa inválido', prog);
      return false;
    }
    if(typeof prog.id !== 'string' && typeof prog.id !== 'number') {
      console.warn('AppData: programa sin id válido', prog);
      return false;
    }
    return true;
  },

  savePrograma: function(facIndex,prog,isNew) {
    if(!this._validFacIndex(facIndex) || !this._validPrograma(prog)) return;
    var f=window.DB[facIndex];
    if(isNew) { f.progs.push(prog); }
    else {
      var i=f.progs.findIndex(function(p){return p.id===prog.id;});
      if(i>=0) f.progs[i]=prog;
    }
    saveDB();
  },

  deletePrograma: function(facIndex,pid) {
    if(!this._validFacIndex(facIndex) || !pid) return;
    var f=window.DB[facIndex];
    f.progs=f.progs.filter(function(p){return p.id!==pid;});
    saveDB();
  },

  saveFacultad: function(facultad,isNew,currentIndex) {
    if(!facultad || typeof facultad !== 'object') {
      console.warn('AppData: facultad inválida', facultad);
      return;
    }
    if(typeof facultad.name !== 'string' || !facultad.name.trim()) {
      console.warn('AppData: facultad sin name', facultad);
      return;
    }
    if(isNew) { window.DB.push(facultad); }
    else if(typeof currentIndex==='number') {
      if(!this._validFacIndex(currentIndex)) return;
      window.DB[currentIndex]=facultad;
    }
    saveDB();
  },

  updateFacultadName: function(facIndex,name) {
    if(!this._validFacIndex(facIndex)) return;
    if(typeof name !== 'string' || !name.trim()) {
      console.warn('AppData: name inválido para updateFacultadName');
      return;
    }
    var f=window.DB[facIndex];
    f.name=name;
    saveDB();
  },

  deleteFacultad: function(facIndex) {
    if(!this._validFacIndex(facIndex)) return;
    window.DB.splice(facIndex,1);
    saveDB();
  },

  saveDocumento: function(facIndex,doc) {
    if(!this._validFacIndex(facIndex)) return;
    var f=window.DB[facIndex];
    if(doc) { f.doc=doc; }
    else { f.doc=null; }
    saveDB();
  }
};
