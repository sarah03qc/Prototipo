import { DISCIPLINES } from '../data/catalogs.js';
import { isPresent } from './followUp.js';

export function normalizeGroupAttention(group) {
  const clean = Object.fromEntries(Object.entries(group).filter(([key]) => !/companion|acompañante|acompanante/i.test(key)));
  return { ...clean, disciplines: (clean.disciplines || []).filter(d => DISCIPLINES.includes(d)) };
}

export function addGroupAttentionRecord(state, input, id) {
  const attention = { ...normalizeGroupAttention(input), id };
  const events = (state.cases || []).filter(c => c.status === 'Activo' && attention.participantIds.includes(c.personId) && isPresent(attention.attendance?.[c.personId])).map(c => ({
    id: `${id}-${c.id}`, caseId: c.id, date: attention.date, type: 'Atención grupal', title: attention.topic,
    discipline: attention.disciplines.join(', '), professional: (attention.professionals || []).join(', '), groupInterventionId: id,
  }));
  return { ...state, groupAttentions: [attention, ...(state.groupAttentions || [])], timeline: [...events, ...(state.timeline || [])] };
}
