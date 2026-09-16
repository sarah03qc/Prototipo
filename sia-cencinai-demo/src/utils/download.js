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
  return String(value ?? '').replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
}

export function downloadExcelLike(filename, headers, rows) {
  const tsv = [headers, ...rows].map((row) => row.map(escapeCell).join('\t')).join('\n');
  downloadBlob(filename.endsWith('.xls') ? filename : `${filename}.xls`, new Blob([`\ufeff${tsv}`], { type: 'application/vnd.ms-excel;charset=utf-8' }));
}

export function downloadReferenceTemplate() {
  const headers = ['identificacion','fecha_referencia','tipo','origen','motivos','informacion_relevante','responsable'];
  const example = ['1-1111-1111','2026-09-16','No inmediata','Observación directa','Alteraciones conductuales','Detalle de ejemplo','Nombre profesional'];
  downloadExcelLike('plantilla_referencia_ai', headers, [example]);
}

export function printReference(reference, person) {
  const details = Object.entries(reference.factorDetails || {}).map(([k,v]) => `<li><strong>${k}:</strong> ${v || 'Sin detalle adicional'}</li>`).join('');
  const win = window.open('', '_blank', 'width=850,height=900');
  if (!win) return;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Referencia A.I.</title><style>body{font-family:Arial,sans-serif;color:#222;padding:36px;font-size:13px}.box{border:1px solid #bbb;border-radius:10px;padding:18px}h1{font-size:18px;margin:0 0 16px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}p{margin:6px 0}ul{padding-left:18px}@media print{button{display:none}}</style></head><body><div class="box"><h1>Referencia a Atención Interdisciplinaria</h1><div class="grid"><p><b>Persona:</b> ${person?.name || ''}</p><p><b>Identificación:</b> ${person?.identification || ''}</p><p><b>Fecha:</b> ${reference.date || ''}</p><p><b>Establecimiento:</b> ${reference.establishment || person?.establishment || ''}</p><p><b>Tipo:</b> ${reference.type || ''}</p><p><b>Origen:</b> ${reference.origin || ''}</p></div><p><b>Responsable:</b> ${reference.referredBy || ''}</p><p><b>Motivos:</b> ${(reference.motives || []).join(', ') || '—'}</p>${details ? `<p><b>Detalle de factores:</b></p><ul>${details}</ul>` : ''}<p><b>Información relevante:</b> ${reference.observations || '—'}</p></div><button onclick="window.print()" style="margin-top:16px;padding:8px 14px">Imprimir</button></body></html>`);
  win.document.close();
}
