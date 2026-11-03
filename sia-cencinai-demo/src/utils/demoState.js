import { normalizeGroupAttention } from './groupAttentions.js';
import { normalizeSchedule } from './schedule.js';
import { calculatePriority, DISCIPLINES } from '../data/catalogs.js';
import { createReferenceSnapshot, nextReferenceConsecutive, normalizeReferenceMotives, referenceContext } from './references.js';

// Fill only newly introduced demo fields; keep locally created records and edits.
export function prepareDemoState(saved, seed) {
  const state = { ...seed, ...saved };
  const people = state.people.map(person => ({ ...seed.people.find(p => p.id === person.id), ...person }));
  const references = [];
  const existing = state.references || [];
  const all = [...existing, ...seed.references.filter(r => !existing.some(old => old.id === r.id))];
  for (const reference of all) {
    const person = people.find(p => p.id === reference.personId);
    const defaults = seed.references.find(r => r.id === reference.id);
    const normalized = normalizeReferenceMotives({ ...defaults, ...reference });
    if (reference.sentAt === undefined) delete normalized.sentAt;
    references.push({
      ...normalized,
      snapshot: reference.snapshot || referenceContext(reference, person),
      consecutive: reference.consecutive || nextReferenceConsecutive(referenceContext(reference, person), reference.date, [...all, ...references]),
    });
  }
  const cases = state.cases.map(caseItem => {
    const reference = references.find(r => r.id === caseItem.referenceId);
    const priority = caseItem.priority === 'Urgencia' ? 'Alto' : caseItem.priority;
    const riskLevel = caseItem.riskLevel || priority;
    const protectionLevel = caseItem.protectionLevel || (priority === 'Bajo' ? 'Alta' : priority === 'Alto' ? 'Baja' : 'Moderada');
    const transfer = (state.transfers || []).find(item => item.sourceCaseId === caseItem.id);
    const closed = caseItem.status === 'Cerrado' || caseItem.status === 'Pendiente de continuidad';
    const reason = caseItem.closureReason || '';
    const category = transfer || /traslado/i.test(reason) ? 'Traslado'
      : ['Cierre satisfactorio', 'Propósitos de A.I. cumplidos'].includes(reason) ? 'Cierre satisfactorio' : 'Otro';
    const closure = caseItem.closure || (closed ? {
      caseId:caseItem.id, category, date:caseItem.closedAt || transfer?.date,
      explanation:category === 'Otro' ? reason : undefined,
    } : undefined);
    return {
      ...caseItem, status:closed ? 'Cerrado' : caseItem.status, closure, riskLevel, protectionLevel,
      priority: calculatePriority(riskLevel, protectionLevel) || priority,
      disciplines: (caseItem.disciplines || []).filter(d => DISCIPLINES.includes(d)),
      referenceConsecutive: caseItem.referenceConsecutive || reference?.consecutive,
      referenceSnapshot: caseItem.referenceSnapshot || (reference ? structuredClone(reference.snapshot) : createReferenceSnapshot(people.find(p => p.id === caseItem.personId), caseItem.openedAt)),
    };
  });
  return {
    ...state, people, references, cases,
    transfers:(state.transfers || []).map(item=>item.status==='Pendiente de continuidad'?{...item,status:'Registrado'}:item),
    timeline: (state.timeline || []).map(event => ({ ...event, detail:event.detail?.replace('Prioridad Urgencia', 'Prioridad Alto') })),
    sessions: state.sessions.map(s => ({ ...s, participants: (s.participants || []).filter(d => DISCIPLINES.includes(d)) })),
    schedule: (state.schedule || []).map(normalizeSchedule),
    groupAttentions: (state.groupAttentions || []).map(normalizeGroupAttention),
  };
}
