// The demo account rejects the complete operational context (>17k tokens versus
// 8k TPM). Use a small, explicit topic filter; authorization happens upstream.
// Keep people and summary for identity resolution. Never truncate entity fields.
const topics = [
  ['referencias', /referenc|consecutivo|vía de atención|via de atencion|acciones previas|resultados previos/iu],
  ['posiblesReferenciasPendientes', /posibles referenc|señal|detecci[oó]n/iu],
  ['casosAI', /[uú]ltima atenci[oó]n|sin atenci[oó]n|no han recibido|caso|riesgo|protecci[oó]n|prioridad|valoraci[oó]n|plan de atenci[oó]n|prop[oó]sito/iu],
  ['sesiones', /sesi[oó]n|sesiones|acuerdos/iu],
  ['lineaTiempo', /l[ií]nea de tiempo|atenci[oó]n individual|seguimiento|cronolog/iu],
  ['atencionesGrupales', /grupal|grupo|particip|asistencia|actividad educativa/iu],
  ['documentos', /document|archivo/iu],
  ['coordinaciones', /coordina|instituci[oó]n/iu],
  ['reportes', /reporte|informe/iu],
  ['programacion', /programa|actividad|actividades|agenda|cancel|reprogram/iu],
  ['traslados', /traslad|continuidad|destino/iu],
];
export function selectAssistantContext(context, messages) {
  const questions = messages.filter(m => m?.role === 'user' && typeof m.text === 'string');
  const current = questions.at(-1)?.text || '';
  let collections = topics.filter(([,pattern]) => pattern.test(current)).map(([key]) => key);
  // A short follow-up inherits the last explicit subject (e.g. its contact).
  if (!collections.length && /^(y\b|¿?(qu[eé]|cu[aá]l|c[oó]mo|cu[aá]ndo|qui[eé]n)).*(su |tiene|registrad|relaci[oó]n)/iu.test(current)) {
    for (const previous of questions.slice(0,-1).reverse()) {
      collections = topics.filter(([,pattern]) => pattern.test(previous.text)).map(([key]) => key);
      if (collections.length) break;
    }
  }
  return Object.fromEntries(['resumen','reglasConsulta','clientesBeneficiarias',...collections].filter((key,index,keys) => key in context && keys.indexOf(key) === index).map(key => [key,context[key]]));
}
