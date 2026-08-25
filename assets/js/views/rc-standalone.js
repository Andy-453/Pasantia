/**
 * rc-standalone.js — Bootstrap del tablero RC standalone (HTML generado)
 * ---
 * Responsabilidad:
 *   - iniciar el controlador único views/rc.js sobre el contenedor #rc-content
 *
 * No implementa lógica de tablero:
 *   - markup:      rcTemplate()                                    (views/rc-view.js)
 *   - datos:       BASE / RC_DEFAULT                               (data/rc-data.js)
 *   - controlador: renderRegistroCalificado(), restoreRCDefaults(),
 *                  __rcHandleExcel()                               (views/rc.js)
 *
 * Lo consume tablero_rc.template.html. El HTML standalone se regenera con:
 *   node tools/build_rc_standalone.js
 */

if (typeof renderRegistroCalificado === 'function') { renderRegistroCalificado(); }
