import { STRATEGIES } from '../data/catalogs.js';

export function currentDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Costa_Rica', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export const isPresent = value => value === true || value === 'Presente';
export const inPeriod = (date, start, end) => Boolean(date && date >= start && date.slice(0, 10) <= end);

// A group has one base record; timeline links must never count it again.
export function effectiveAttentions(state, cases = state.cases || [], people = state.people || []) {
  const caseMap = new Map(cases.map(c => [c.id, c]));
  const personIds = new Set(people.map(p => p.id));
  const individual = (state.timeline || []).filter(e => caseMap.has(e.caseId) && !e.groupInterventionId && e.type !== 'Atención grupal' && STRATEGIES.includes(e.type)).map(e => ({
    ...e, personIds: [caseMap.get(e.caseId).personId], caseIds: [e.caseId], disciplines: [e.discipline], professionals: [e.professional],
  }));
  const groups = (state.groupAttentions || []).filter(g => g.participantIds?.some(id => personIds.has(id))).map(g => ({
    ...g, personIds: g.participantIds.filter(id => personIds.has(id) && isPresent(g.attendance?.[id])),
    caseIds: cases.filter(c => g.participantIds.includes(c.personId) && isPresent(g.attendance?.[c.personId]) && (!c.openedAt || g.date >= c.openedAt) && (!c.closedAt || g.date <= c.closedAt)).map(c => c.id),
  }));
  return [...individual, ...groups];
}

export function getLastAttentionForCase(state, caseItem) {
  return effectiveAttentions(state, [caseItem]).filter(a => a.caseIds.includes(caseItem.id)).sort((a, b) => b.date.localeCompare(a.date))[0] || null;
}
export function hasAttentionInPeriod(state, caseItem, start, end) {
  return effectiveAttentions(state, [caseItem]).some(a => a.caseIds.includes(caseItem.id) && inPeriod(a.date, start, end));
}
export function attentionYears(state) {
  return [...new Set([
    currentDate().slice(0, 4),
    ...(state.timeline || []).map(e => e.date?.slice(0, 4)),
    ...(state.groupAttentions || []).map(g => g.date?.slice(0, 4)),
    ...(state.cases || []).map(c => c.openedAt?.slice(0, 4)),
    ...(state.references || []).map(r => r.date?.slice(0, 4)),
    ...(state.references || []).filter(r => r.sentAt && Number.isFinite(Date.parse(r.sentAt))).map(r => currentDate(new Date(r.sentAt)).slice(0, 4)),
    ...(state.schedule || []).map(s => s.date?.slice(0, 4)),
  ].filter(Boolean))].sort().reverse();
}
export function countValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value || 'No disponible', (counts.get(value || 'No disponible') || 0) + 1);
  return [...counts].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
