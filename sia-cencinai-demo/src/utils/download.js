import { referenceContext, referenceIdentityRows } from './references.js';

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeCell(value) {
  let text = String(value ?? '');
  if (typeof value === 'string' && /^[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildExcelCsv(headers, rows) {
  return '\ufeffsep=;\r\n' + [headers, ...rows].map(row => row.map(escapeCell).join(';')).join('\r\n');
}

export function downloadExcelLike(filename, headers, rows) {
  const name = filename.replace(/\.(xls|csv)$/i, '');
  downloadBlob(`${name}.csv`, new Blob([buildExcelCsv(headers, rows)], { type: 'text/csv;charset=utf-8' }));
}

export function downloadReferenceTemplate() {
  const headers = ['identificacion','fecha_referencia','tipo','origen','motivos','acciones_previas','resultados_previos','informacion_relevante','responsable'];
  const example = ['1-1111-1111','2026-09-16','No inmediata','Observación directa','Alteraciones conductuales','Orientación familiar','Avances parciales','Detalle de ejemplo','Nombre profesional'];
  downloadExcelLike('plantilla_referencia_ai', headers, [example]);
}

function escapeHtml(value) {
  return String(value ?? '—').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

export function referencePrintHtml(reference, person) {
  const context = referenceContext(reference, person);
  const rows = referenceIdentityRows(context);
  const fields = rows.map(([label,value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || '—')}</dd></div>`).join('');
  const motives = (reference.motives || []).map(motive => `<li><strong>${escapeHtml(motive)}</strong>${reference.factorDetails?.[motive] ? `<p>${escapeHtml(reference.factorDetails[motive])}</p>` : ''}</li>`).join('');
  const notes = [['Acciones realizadas previo a la referencia',reference.priorActions],['Resultados obtenidos previo a la referencia',reference.priorResults],['Información relevante',reference.observations],...(reference.decisionJustification ? [['Justificación de la decisión',reference.decisionJustification]] : [])]
    .map(([label,value]) => `<section><h2>${escapeHtml(label)}</h2><p class="note">${escapeHtml(value || '—')}</p></section>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Referencia A.I.</title><style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#222;max-width:850px;margin:auto;padding:32px;font-size:12px;line-height:1.5}
    header{border-bottom:3px solid #0f766e;padding-bottom:14px;margin-bottom:20px}h1{font-size:21px;margin:0 0 8px}h2{font-size:13px;color:#115e59;margin:0 0 8px}
    section{margin-top:20px;break-inside:avoid}dl{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin:0}dt{font-size:10px;color:#666}dd{margin:2px 0 0;overflow-wrap:anywhere}
    .consecutive{font-weight:bold;overflow-wrap:anywhere;color:#115e59}p{margin:4px 0}.note{white-space:pre-wrap}li{margin-bottom:10px;break-inside:avoid}ul{padding-left:18px}
    @media print{body{padding:0;max-width:none}button{display:none}@page{size:A4;margin:18mm}}
  </style></head><body><header><h1>Referencia a Atención Interdisciplinaria</h1><p class="consecutive">${escapeHtml(reference.consecutive || reference.id)}</p><p>Fecha de referencia: ${escapeHtml(reference.date)}</p></header>
    <section><h2>Identificación y contexto del niño</h2><dl>${fields}</dl></section>
    <section><h2>Datos de la referencia</h2><dl>${[['Responsable de la referencia',reference.referredBy],['Tipo',reference.type],['Origen',reference.origin]].map(([label,value])=>`<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value||'—')}</dd></div>`).join('')}</dl></section>
    <section><h2>Motivos y detalle</h2><ul>${motives || '<li>—</li>'}</ul></section>${notes}
    <button onclick="window.print()" style="margin-top:20px;padding:8px 14px">Imprimir</button></body></html>`;
}

export function printReference(reference, person) {
  const win = window.open('', '_blank', 'width=850,height=900');
  if (!win) return;
  win.document.write(referencePrintHtml(reference, person));
  win.document.close();
}
