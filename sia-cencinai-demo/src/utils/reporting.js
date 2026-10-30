import { applyHierarchyFilters, scopeItems } from './access.js';
import { ageAtDate } from './references.js';
import { countValues, currentDate, effectiveAttentions, hasAttentionInPeriod, inPeriod } from './followUp.js';

export function reportingMetrics(state, role, filters) {
  const start = `${filters.year}-01-01`, end = `${filters.year}-12-31`;
  const sentDate = r => r.sentAt && Number.isFinite(Date.parse(r.sentAt)) ? currentDate(new Date(r.sentAt)) : undefined;
  const age = p => Number.parseInt(ageAtDate(p.birthDate, currentDate()), 10);
  const people = applyHierarchyFilters(scopeItems(state.people, role), filters).filter(p =>
    (filters.minAge === '' || filters.minAge == null || age(p) >= Number(filters.minAge)) &&
    (filters.maxAge === '' || filters.maxAge == null || age(p) <= Number(filters.maxAge)));
  const personIds = new Set(people.map(p => p.id));
  const cases = applyHierarchyFilters(scopeItems(state.cases, role), filters).filter(c => personIds.has(c.personId) && c.openedAt <= end && (!filters.status || c.status === filters.status) && (!filters.priority || c.priority === filters.priority));
  const active = cases.filter(c => c.status === 'Activo');
  const refs = applyHierarchyFilters(scopeItems(state.references, role), filters).filter(r => personIds.has(r.personId) && inPeriod(sentDate(r) || r.date, start, end));
  const eligiblePeople = filters.status || filters.priority ? people.filter(p => cases.some(c => c.personId === p.id)) : people;
  const events = effectiveAttentions(state, cases, eligiblePeople).filter(a => inPeriod(a.date, start, end) && (!filters.discipline || a.disciplines?.includes(filters.discipline)) && (!filters.professional || a.professionals?.includes(filters.professional)));
  const uniquePeople = new Set(events.flatMap(a => a.personIds)).size;
  const byType = countValues(events.map(a => a.type)).map(row => ({ ...row, people: new Set(events.filter(a => a.type === row.name).flatMap(a => a.personIds)).size }));
  const cancellations = applyHierarchyFilters(scopeItems(state.schedule || [], role), filters).filter(s => s.status === 'Cancelada' && inPeriod(s.date, start, end));
  // No analysis event date exists yet: outcomes use the reference cohort's year.
  const admitted = refs.filter(r => r.status === 'Admitida a A.I.').length;
  const notRequired = refs.filter(r => r.status === 'No requiere A.I.').length;
  return {
    cases, refs, events, uniquePeople, byType,
    sent: refs.filter(r => inPeriod(sentDate(r), start, end)).length,
    admitted, notRequired, analyzed: admitted + notRequired,
    withoutAttention: active.filter(c => !hasAttentionInPeriod(state, c, start, end)).length,
    byEstablishment: countValues(active.map(c => c.establishment)),
    bySex: countValues(active.map(c => people.find(p => p.id === c.personId)?.sex)),
    byAge: countValues(active.map(c => { const years = age(people.find(p => p.id === c.personId) || {}); return Number.isFinite(years) ? `${years} años` : 'No disponible'; })),
    motives: countValues(refs.flatMap(r => [...new Set(r.motives || [])])),
    cancellationReasons: countValues(cancellations.map(s => s.reason)),
  };
}
