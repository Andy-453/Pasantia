/**
 * snies-model.js — Modelo de datos SNIES (funciones puras)
 * ---
 * Responsabilidad:
 *   - validación de datos importados desde Excel (catálogo + indicadores)
 *   - construcción del objeto programs[] a partir de catálogo + indicadores
 *   - cálculo automático de indicadores derivados (tabs, tsel, tgrad, pctH, pctM)
 *   - etiquetado _source: 'imported' en programas construidos desde Excel
 *
 * Dependencias:
 *   - Ninguna (funciones puras, sin DOM, sin window, sin AppState)
 *
 * Estado:
 *   Estable. Modelo de datos SNIES maduro.
 */

function validateCatalogo(catalogo) {
  var errors = [];
  if (!Array.isArray(catalogo)) {
    return { valid: false, errors: ['Catálogo debe ser un arreglo'] };
  }
  if (catalogo.length === 0) {
    return { valid: false, errors: ['Catálogo no puede estar vacío'] };
  }
  var seenCodes = {};
  for (var i = 0; i < catalogo.length; i++) {
    var row = catalogo[i];
    var rowNum = i + 2; // +2 porque Excel fila 1 es header
    var code = row.CODIGO_SNIES;
    var prog = row.PROGRAMA;
    var nivel = row.NIVEL;
    var fac = row.FACULTAD;

    if (code === undefined || code === null || code === '' || isNaN(+code) || +code <= 0) {
      errors.push('Fila ' + rowNum + ': CODIGO_SNIES inválido o vacío');
    } else {
      var codeStr = String(+code);
      if (seenCodes[codeStr]) {
        errors.push('Código SNIES ' + codeStr + ' aparece duplicado en filas ' + seenCodes[codeStr] + ' y ' + rowNum);
      } else {
        seenCodes[codeStr] = rowNum;
      }
    }
    if (!prog || String(prog).trim() === '') {
      errors.push('Fila ' + rowNum + ': PROGRAMA requerido');
    }
    var validNiveles = ['Especialización', 'Maestría', 'Doctorado'];
    if (!nivel || validNiveles.indexOf(String(nivel).trim()) === -1) {
      errors.push('Fila ' + rowNum + ': NIVEL debe ser Especialización, Maestría o Doctorado (recibió: "' + nivel + '")');
    }
    if (!fac || String(fac).trim() === '') {
      errors.push('Fila ' + rowNum + ': FACULTAD requerido');
    }
  }
  return { valid: errors.length === 0, errors: errors };
}

function validateIndicadores(indicadores, catalogo) {
  var errors = [];
  var warnings = [];
  if (!Array.isArray(indicadores)) {
    return { valid: false, errors: ['Indicadores debe ser un arreglo'], warnings: [] };
  }
  if (indicadores.length === 0) {
    return { valid: false, errors: ['Indicadores no puede estar vacío'], warnings: [] };
  }
  var validCodes = {};
  for (var c = 0; c < catalogo.length; c++) {
    validCodes[String(+catalogo[c].CODIGO_SNIES)] = true;
  }
  for (var i = 0; i < indicadores.length; i++) {
    var row = indicadores[i];
    var rowNum = i + 2;
    var code = row.CODIGO_SNIES;
    var anio = row.AÑO;
    var ins = row.INSCRITOS;
    var adm = row.ADMITIDOS;
    var mat = row.MATRICULADOS;
    var grad = row.GRADUADOS;
    var h = row.HOMBRES;
    var m = row.MUJERES;

    if (code === undefined || code === null || code === '' || isNaN(+code) || +code <= 0) {
      errors.push('Fila ' + rowNum + ': CODIGO_SNIES inválido o vacío');
    } else {
      var codeStr = String(+code);
      if (!validCodes[codeStr]) {
        errors.push('Fila ' + rowNum + ': CODIGO_SNIES ' + codeStr + ' no encontrado en catálogo');
      }
    }
    if (anio === undefined || anio === null || anio === '' || isNaN(+anio)) {
      errors.push('Fila ' + rowNum + ': AÑO inválido');
    }
    [
      { field: 'INSCRITOS', val: ins },
      { field: 'ADMITIDOS', val: adm },
      { field: 'MATRICULADOS', val: mat },
      { field: 'GRADUADOS', val: grad },
      { field: 'HOMBRES', val: h },
      { field: 'MUJERES', val: m }
    ].forEach(function(f) {
      if (f.val === undefined || f.val === null || f.val === '' || isNaN(+f.val) || +f.val < 0) {
        errors.push('Fila ' + rowNum + ': ' + f.field + ' debe ser un número >= 0');
      }
    });

    // Warnings lógicos
    var nIns = +ins;
    var nAdm = +adm;
    var nMat = +mat;
    var nGrad = +grad;
    if (nAdm > nIns) {
      warnings.push('Fila ' + rowNum + ': ADMITIDOS (' + nAdm + ') > INSCRITOS (' + nIns + ') — verificar datos');
    }
    if (nMat > nAdm) {
      warnings.push('Fila ' + rowNum + ': MATRICULADOS (' + nMat + ') > ADMITIDOS (' + nAdm + ') — verificar datos');
    }
    if (nGrad > nMat) {
      warnings.push('Fila ' + rowNum + ': GRADUADOS (' + nGrad + ') > MATRICULADOS (' + nMat + ') — verificar datos');
    }
  }
  return { valid: errors.length === 0, errors: errors, warnings: warnings };
}

function computeDerived(programs) {
  if (!Array.isArray(programs)) return programs;
  for (var i = 0; i < programs.length; i++) {
    var p = programs[i];
    if (!p.years) continue;
    var yearKeys = Object.keys(p.years);
    for (var j = 0; j < yearKeys.length; j++) {
      var d = p.years[yearKeys[j]];
      if (!d) continue;
      var nIns = +d.ins || 0;
      var nAdm = +d.adm || 0;
      var nMat = +d.mat || 0;
      var nGrad = +d.grad || 0;
      var nH = +d.hombres || 0;
      var nM = +d.mujeres || 0;

      d.tabs  = nIns > 0 ? +((nAdm / nIns) * 100).toFixed(1) : 0;
      d.tsel  = nAdm > 0 ? +((nMat / nAdm) * 100).toFixed(1) : 0;
      d.tgrad = nMat > 0 ? +((nGrad / nMat) * 100).toFixed(1) : 0;
      var total = nH + nM;
      d.pctH = total > 0 ? +((nH / total) * 100).toFixed(1) : 0;
      d.pctM = total > 0 ? +((nM / total) * 100).toFixed(1) : 0;
    }
  }
  return programs;
}

function buildPrograms(catalogo, indicadores) {
  var DEFAULT_YEARS = {};
  var ANIOS = [2020, 2021, 2022, 2023, 2024];
  for (var a = 0; a < ANIOS.length; a++) {
    DEFAULT_YEARS[ANIOS[a]] = { ins: 0, adm: 0, mat: 0, grad: 0, hombres: 0, mujeres: 0 };
  }

  // Indexar indicadores por CODIGO_SNIES + AÑO
  var idx = {};
  for (var i = 0; i < indicadores.length; i++) {
    var r = indicadores[i];
    var key = String(+r.CODIGO_SNIES) + '|' + (+r.AÑO);
    idx[key] = r;
  }

  var programs = [];
  for (var c = 0; c < catalogo.length; c++) {
    var cat = catalogo[c];
    var code = String(+cat.CODIGO_SNIES);
    var years = {};
    for (var a2 = 0; a2 < ANIOS.length; a2++) {
      var anio = ANIOS[a2];
      var row = idx[code + '|' + anio];
      if (row) {
        years[anio] = {
          ins:     Math.max(0, +row.INSCRITOS    || 0),
          adm:     Math.max(0, +row.ADMITIDOS    || 0),
          mat:     Math.max(0, +row.MATRICULADOS || 0),
          grad:    Math.max(0, +row.GRADUADOS    || 0),
          hombres: Math.max(0, +row.HOMBRES      || 0),
          mujeres: Math.max(0, +row.MUJERES      || 0)
        };
      } else {
        years[anio] = { ins: 0, adm: 0, mat: 0, grad: 0, hombres: 0, mujeres: 0 };
      }
    }
    programs.push({
      name:     String(cat.PROGRAMA).trim(),
      nivel:    String(cat.NIVEL).trim(),
      facultad: String(cat.FACULTAD).trim(),
      _source:  'imported',
      years:    years
    });
  }

  return programs;
}
