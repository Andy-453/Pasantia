/**
 * snies-loader.js — Carga, persistencia y gestión de datos SNIES
 * ---
 * Responsabilidad:
 *   - importar datos SNIES desde archivo Excel (.xlsx) vía SheetJS
 *   - fusionar (MERGE) datos importados con el dataset existente por nombre de programa
 *   - persistir datos SNIES en localStorage
 *   - restaurar datos SNIES desde localStorage o __EMBEDDED_SD
 *   - limpiar datos SNIES y restaurar el dataset por defecto
 *   - eliminar o restaurar programas individuales (removeSniesProgram)
 *   - etiquetar programas con _source ('imported' | 'default')
 *   - capturar snapshot inline (AppState.snies.defaultSD) para restauración
 *
 * Dependencias:
 *   - snies-model.js (validateCatalogo, validateIndicadores, buildPrograms, computeDerived)
 *   - XLSX (CDN SheetJS, global)
 *   - AppState (app-state.js, global)
 *   - renderSNIES (views/snies.js, global)
 *   - toast (utils.js, global)
 *   - showConfirm (utils.js, global)
 *
 * Estado:
 *   Estable. Gestión completa de programas SNIES.
 */

var SNIES_STORAGE_KEY = 'udec_snies_data';
var SNIES_STORAGE_VERSION = 1;

function _saveSniesLocal(sd) {
  try {
    var payload = {
      version: SNIES_STORAGE_VERSION,
      data: sd
    };
    localStorage.setItem(SNIES_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // localStorage lleno o deshabilitado — ignorar silenciosamente
  }
}

function mergeSNIES(existingSD, incomingPrograms) {
  if (!existingSD || !existingSD.programs || !existingSD.programs.length) {
    return { programs: incomingPrograms };
  }

  // Indexar programas entrantes por name
  var incomingMap = {};
  for (var i = 0; i < incomingPrograms.length; i++) {
    incomingMap[incomingPrograms[i].name] = incomingPrograms[i];
  }

  var merged = [];
  var seen = {};

  // 1. Recorrer existentes: reemplazar si hay match, conservar si no
  for (var j = 0; j < existingSD.programs.length; j++) {
    var existing = existingSD.programs[j];
    if (incomingMap[existing.name]) {
      merged.push(incomingMap[existing.name]);
      seen[existing.name] = true;
    } else {
      merged.push(existing);
    }
  }

  // 2. Agregar programas entrantes que no existían
  for (var k = 0; k < incomingPrograms.length; k++) {
    if (!seen[incomingPrograms[k].name]) {
      merged.push(incomingPrograms[k]);
    }
  }

  return { programs: merged };
}

function loadSnies() {
  // 0. Capturar snapshot del dataset inline original (una sola vez)
  if (!AppState.snies.defaultSD && AppState.snies.SD && AppState.snies.SD.programs) {
    AppState.snies.defaultSD = JSON.parse(JSON.stringify(AppState.snies.SD));
  }

  // 1. ¿Embebido en HTML exportado standalone?
  if (window.__EMBEDDED_SD) {
    AppState.snies.SD = JSON.parse(JSON.stringify(window.__EMBEDDED_SD));
    _tagDefaultPrograms();
    return;
  }
  // 2. ¿Modo HTML exportado (sin datos embebidos)? — no leer localStorage
  if (window.__UDEC_EMBEDDED__) {
    _tagDefaultPrograms();
    return;
  }
  // 3. ¿localStorage con datos SNIES?
  try {
    var raw = localStorage.getItem(SNIES_STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.version === SNIES_STORAGE_VERSION && parsed.data && Array.isArray(parsed.data.programs) && parsed.data.programs.length > 0) {
        AppState.snies.SD = parsed.data;
        _tagDefaultPrograms();
        return;
      }
    }
  } catch (e) {
    // Corrupción de localStorage — ignorar
  }
  // 4. Fallback: no hacer nada. AppState.snies.SD se queda con el dataset
  //    inline definido en app-state.js (12 programas por defecto).
  _tagDefaultPrograms();
}

function _tagDefaultPrograms() {
  if (!AppState.snies.SD || !AppState.snies.SD.programs) return;
  for (var i = 0; i < AppState.snies.SD.programs.length; i++) {
    if (!AppState.snies.SD.programs[i]._source) {
      AppState.snies.SD.programs[i]._source = 'default';
    }
  }
}

function clearSnies() {
  try {
    localStorage.removeItem(SNIES_STORAGE_KEY);
  } catch (e) { /* ignore */ }
  location.reload();
}

function importSniesExcel(file) {
  return new Promise(function(resolve, reject) {
    if (typeof XLSX === 'undefined') {
      resolve({ success: false, errors: ['Librería SheetJS (XLSX) no disponible. Verifique que el CDN esté cargado.'] });
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = new Uint8Array(e.target.result);
        var wb = XLSX.read(data, { type: 'array' });
        if (wb.SheetNames.length < 2) {
          resolve({ success: false, errors: ['El Excel debe tener al menos 2 hojas: CATÁLOGO e INDICADORES'] });
          return;
        }
        var catalogoRaw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        var indicadoresRaw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[1]]);

        // Validar catálogo
        var valCat = validateCatalogo(catalogoRaw);
        if (!valCat.valid) {
          resolve({ success: false, errors: valCat.errors });
          return;
        }

        // Validar indicadores
        var valInd = validateIndicadores(indicadoresRaw, catalogoRaw);
        if (!valInd.valid) {
          resolve({ success: false, errors: valInd.errors });
          return;
        }

        // Mostrar warnings si hay
        if (valInd.warnings && valInd.warnings.length > 0) {
          if (typeof toast === 'function') {
            toast('⚠️ ' + valInd.warnings.length + ' advertencia(s) en indicadores. Revise consola.');
          }
          console.warn('[SNIES] Advertencias de validación:', valInd.warnings);
        }

        // Construir programs y calcular derivados
        var incomingPrograms = buildPrograms(catalogoRaw, indicadoresRaw);
        incomingPrograms = computeDerived(incomingPrograms);

        // Fusionar (MERGE) con el dataset existente por nombre de programa
        var sd = mergeSNIES(AppState.snies.SD, incomingPrograms);
        AppState.snies.SD = sd;
        _tagDefaultPrograms();
        _saveSniesLocal(sd);

        if (typeof renderSNIES === 'function') {
          renderSNIES();
        }
        if (typeof toast === 'function') {
          toast('✅ Datos SNIES importados: ' + incomingPrograms.length + ' programa(s) actualizados/agregados. Total: ' + sd.programs.length + ' programa(s).');
        }
        resolve({ success: true, warnings: valInd.warnings || [] });
      } catch (err) {
        resolve({ success: false, errors: ['Error al procesar Excel: ' + err.message] });
      }
    };
    reader.onerror = function() {
      resolve({ success: false, errors: ['Error al leer el archivo'] });
    };
    reader.readAsArrayBuffer(file);
  });
}

function removeSniesProgram(programName) {
  var sd = AppState.snies.SD;
  if (!sd || !sd.programs) return;

  var existsInInline = AppState.snies.defaultSD &&
    AppState.snies.defaultSD.programs &&
    AppState.snies.defaultSD.programs.some(function(p){return p.name===programName;});

  var msg = existsInInline
    ? '¿Desea restaurar la versión original de "' + programName + '"?'
    : '¿Desea eliminar el programa "' + programName + '"?';

  showConfirm('Confirmar', msg, function() {
    _execRemoveSniesProgram(programName);
  });
}

function _execRemoveSniesProgram(programName) {
  var sd = AppState.snies.SD;
  if (!sd || !sd.programs) return;

  var idx = -1;
  for (var i = 0; i < sd.programs.length; i++) {
    if (sd.programs[i].name === programName) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return;

  var inlineProg = null;
  if (AppState.snies.defaultSD && AppState.snies.defaultSD.programs) {
    for (var j = 0; j < AppState.snies.defaultSD.programs.length; j++) {
      if (AppState.snies.defaultSD.programs[j].name === programName) {
        inlineProg = AppState.snies.defaultSD.programs[j];
        break;
      }
    }
  }

  if (inlineProg) {
    var restored = JSON.parse(JSON.stringify(inlineProg));
    delete restored.facultad;
    restored._source = 'default';
    sd.programs[idx] = restored;
    if (typeof toast === 'function') toast('Programa restaurado: ' + programName);
  } else {
    sd.programs.splice(idx, 1);
    if (typeof toast === 'function') toast('Programa eliminado: ' + programName);
  }

  _saveSniesLocal(sd);
  if (typeof renderSNIES === 'function') renderSNIES();
}
