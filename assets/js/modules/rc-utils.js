/**
 * rc-utils.js — Utilidades del módulo Registro Calificado (RC)
 * ---
 * Responsabilidad:
 *   - paleta de colores institucional UdeC (C)
 *   - helpers de fecha: addM, fmt, fmtCorto, dias
 *   - helpers de normalización y búsqueda: norm, buscaCol, aFecha
 *
 * Dependencias:
 *   - HOY (global, declarado en rc-controller o inline script)
 *
 * Estado:
 *   Estable. Funciones puras + constantes.
 */

const C = {vOsc:'#00482B', vMed:'#007B3E', vLim:'#79C000', vCla:'#91C256', teal:'#00A99D',
           dor:'#DAAA00', ama:'#FBE122', nar:'#F7931E', gris:'#4D4D4D', rojo:'#C62828'};

const addM = (d,m)=>{const x=new Date(d);x.setMonth(x.getMonth()+m);return x};
const fmt = d=>d.toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});
const fmtCorto = d=>d.toLocaleDateString('es-CO',{month:'short',year:'numeric'});
const dias = d=>Math.round((d-HOY)/864e5);

const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
function buscaCol(keys, ...patrones){
  for(const pat of patrones){
    const k = keys.find(k=>norm(k).includes(pat));
    if(k) return k;
  }
  return null;
}
function aFecha(v){
  if(v==null||v==='') return null;
  if(v instanceof Date && !isNaN(v)) return new Date(v.getFullYear(),v.getMonth(),v.getDate());
  if(typeof v==='number'){ // serial Excel
    const d = new Date(Math.round((v-25569)*86400*1000));
    return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());
  }
  const s=String(v).trim();
  let m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);   // dd/mm/aaaa
  if(m) return new Date(+m[3],+m[2]-1,+m[1]);
  m=s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);         // aaaa-mm-dd
  if(m) return new Date(+m[1],+m[2]-1,+m[3]);
  const d=new Date(s); return isNaN(d)?null:d;
}
