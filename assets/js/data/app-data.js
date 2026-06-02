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
 * Estado:
 *   Fase 4 — encapsulación progresiva.
 *   DB sigue siendo fuente de verdad hasta migración completa.
 */

window.AppData = {
  // ===== Queries =====
  getFacultades: function() { return window.DB; },
  getFacultad: function(i) { return window.DB ? window.DB[i] : undefined; },
  getProgramas: function(fi) { return window.DB && window.DB[fi] ? window.DB[fi].progs : []; },
  getFacultadCount: function() { return window.DB ? window.DB.length : 0; },

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
  savePrograma: function(facIndex,prog,isNew) {
    var f=window.DB[facIndex];
    if(!f) return;
    if(isNew) { f.progs.push(prog); }
    else {
      var i=f.progs.findIndex(function(p){return p.id===prog.id;});
      if(i>=0) f.progs[i]=prog;
    }
    saveDB();
  },

  deletePrograma: function(facIndex,pid) {
    var f=window.DB[facIndex];
    if(!f) return;
    f.progs=f.progs.filter(function(p){return p.id!==pid;});
    saveDB();
  },

  saveFacultad: function(facultad,isNew,currentIndex) {
    if(isNew) { window.DB.push(facultad); }
    else if(typeof currentIndex==='number') { window.DB[currentIndex]=facultad; }
    saveDB();
  },

  updateFacultadName: function(facIndex,name) {
    var f=window.DB[facIndex];
    if(!f) return;
    f.name=name;
    saveDB();
  },

  deleteFacultad: function(facIndex) {
    window.DB.splice(facIndex,1);
    saveDB();
  },

  saveDocumento: function(facIndex,doc) {
    var f=window.DB[facIndex];
    if(!f) return;
    if(doc) { f.doc=doc; }
    else { f.doc=null; }
    saveDB();
  }
};
