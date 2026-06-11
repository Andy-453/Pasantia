/**
 * rc-model.js — Modelo de datos del módulo Registro Calificado (RC)
 * ---
 * Responsabilidad:
 *   - transformación raw → programa enriquecido (procesa)
 *   - clasificación de estados (est, cls) según días al vencimiento
 *   - filtrado combinado por estado, nivel y texto (filtrados)
 *
 * Dependencias:
 *   - rc-utils.js (addM, dias, norm)
 *   - HOY, P, fEstado, fNivel, fTexto (globales, declarados por el controlador)
 *
 * Estado:
 *   Estable. Funciones puras + constantes.
 */

const mapEstado={'VENCIDO':'t-x','12M':'t-12','16M':'t-16','18M':'t-18','OK':'t-ok'};

function procesa(raw){
  return raw.map(p=>{
    const ejec = (p.ejec instanceof Date)? p.ejec : new Date(p.ejec+'T00:00:00');
    const venc = addM(ejec, (p.vig||7)*12);
    const a18=addM(venc,-18), a16=addM(venc,-16), a12=addM(venc,-12);
    const ae1=addM(ejec,30), ae2=addM(ejec,54);
    const dv = dias(venc);
    let est, cls;
    if(p.trans || dv<0){est='VENCIDO / TRANSITORIA';cls='t-x';}
    else if(dv<=365){est='≤ 12 MESES · CRÍTICO';cls='t-12';}
    else if(dv<=487){est='≤ 16 MESES · RADICAR YA';cls='t-16';}
    else if(dv<=548){est='≤ 18 MESES · VENTANA';cls='t-18';}
    else {est='VIGENTE';cls='t-ok';}
    const consumo = Math.min(100, Math.max(0, ((HOY-ejec)/(venc-ejec))*100));
    return {...p, ejec, venc, a18, a16, a12, ae1, ae2, dv, est, cls, consumo};
  });
}

function filtrados(){
  return P.filter(p=>{
    if(fEstado!=='all' && p.cls!==mapEstado[fEstado])return false;
    if(fNivel!=='all' && !norm(p.nivel).includes(norm(fNivel).slice(0,8)))return false;
    if(fTexto && !(p.nombre.toLowerCase().includes(fTexto)||String(p.snies).includes(fTexto)))return false;
    return true;
  });
}
