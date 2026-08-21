#!/usr/bin/env node
/**
 * build_rc_standalone.js — Genera el Tablero RC standalone autocontenido
 * ---
 * Uso:
 *   node tools/build_rc_standalone.js
 *
 * Proceso:
 *   1. Lee tablero_rc.template.html (fuente versionada).
 *   2. Inserta banner GENERADO tras <!DOCTYPE html>.
 *   3. Inlinea cada <script src="local">; los CDN http(s) quedan intactos.
 *   4. Valida: sin fuentes faltantes, sin '</script' crudo en los módulos,
 *      sin <script src> locales residuales y con los 6 scripts esperados.
 *   5. Escribe tablero_rc_posgrados_udec.html (versionado, NO editar a mano:
 *      modificar las fuentes y regenerar).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE_PATH = path.join(ROOT, 'tablero_rc.template.html');
const OUT_PATH = path.join(ROOT, 'tablero_rc_posgrados_udec.html');
const EXPECTED = [
  'assets/js/modules/rc-utils.js',
  'assets/js/models/rc-model.js',
  'assets/js/views/rc-view.js',
  'assets/js/data/rc-data.js',
  'assets/js/views/rc.js',
  'assets/js/views/rc-standalone.js'
];

let html = fs.readFileSync(TEMPLATE_PATH, 'utf8');
if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('FAIL — no existe ' + TEMPLATE_PATH);
  process.exit(1);
}

const BANNER = '<!-- ============================================================\n' +
  '     GENERADO — NO EDITAR\n' +
  '     Fuente:    tablero_rc.template.html\n' +
  '     Regenerar: node tools/build_rc_standalone.js\n' +
  '     Cualquier cambio debe hacerse en las fuentes\n' +
  '     (markup=rcTemplate en views/rc-view.js · controlador=views/rc.js ·\n' +
  '      datos=data/rc-data.js) y luego reconstruir con el build.\n' +
  '     ============================================================ -->\n';
html = html.replace(/<!DOCTYPE html>/i, '<!DOCTYPE html>\n' + BANNER);

const tagRe = /<script src="([^"]+)"><\/script>/g;
const locals = [];
let m;
while ((m = tagRe.exec(html)) !== null) {
  if (!/^https?:\/\//i.test(m[1])) locals.push(m[1]);
}

const missing = locals.filter(s => !fs.existsSync(path.join(ROOT, s)));
if (missing.length) {
  console.error('FAIL — archivos fuente faltantes:\n  ' + missing.join('\n  '));
  process.exit(1);
}

for (const src of locals) {
  const code = fs.readFileSync(path.join(ROOT, src), 'utf8');
  if (/<\/script/i.test(code)) {
    console.error('FAIL — "' + src + '" contiene </script> crudo; no puede inlinearse.');
    process.exit(1);
  }
  const tag = '<script src="' + src + '"></script>';
  if (html.indexOf(tag) === -1) {
    console.error('FAIL — tag no encontrado: ' + tag);
    process.exit(1);
  }
  const inlined = '<script>\n/* ==== inline: ' + src + ' ==== */\n' + code + '\n</script>';
  html = html.split(tag).join(inlined);
}

if (/<script src="(?!https?:)[^"]+"/i.test(html)) {
  console.error('FAIL — quedan <script src> locales sin inlinear.');
  process.exit(1);
}
const notInlined = EXPECTED.filter(s => html.indexOf('/* ==== inline: ' + s + ' ==== */') === -1);
if (notInlined.length) {
  console.error('FAIL — scripts esperados ausentes del generado:\n  ' + notInlined.join('\n  '));
  process.exit(1);
}

fs.writeFileSync(OUT_PATH, html);
console.log('OK — tablero_rc_posgrados_udec.html · ' + (html.length / 1024).toFixed(1) + ' KB · ' +
  locals.length + ' scripts locales inlineados · CDNs intactos');
