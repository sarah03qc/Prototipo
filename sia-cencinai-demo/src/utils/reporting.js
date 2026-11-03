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
  const personIds = new Set(people.filter(p=>!filters.sex||p.sex===filters.sex).map(p => p.id));
  const universe = applyHierarchyFilters(scopeItems(state.cases, role), filters).filter(c=>personIds.has(c.personId)&&(!filters.priority||c.priority===filters.priority));
  const cases = universe.filter(c => c.openedAt <= end && (!filters.status || c.status === filters.status) && (!filters.priority || c.priority === filters.priority));
  const active = cases.filter(c => c.status === 'Activo');
  const refs = applyHierarchyFilters(scopeItems(state.references, role), filters).filter(r => personIds.has(r.personId) && inPeriod(sentDate(r) || r.date, start, end));
  const eligiblePeople = people.filter(p=>personIds.has(p.id)&&(!filters.status&&!filters.priority||cases.some(c=>c.personId===p.id)));
  const attentionMatches = a => inPeriod(a.date,start,end) && (!filters.discipline || a.disciplines?.includes(filters.discipline)) &&
    (!filters.professional || a.professionals?.includes(filters.professional)) && (!filters.attentionType || a.type===filters.attentionType);
  const events = effectiveAttentions(state, cases, eligiblePeople).filter(a => a.personIds.length && attentionMatches(a));
  const activeNow=universe.filter(c=>c.status==='Activo');
  const denominator=new Set(activeNow.map(c=>c.personId)).size;
  const covered=new Set();
  const activeById=new Map(activeNow.map(c=>[c.id,c]));
  const links=new Map();
  for(const event of state.timeline||[]){
    if(!event.groupInterventionId)continue;
    const ids=links.get(event.groupInterventionId)||[];
    ids.push(event.caseId);
    links.set(event.groupInterventionId,ids);
  }
  for(const event of effectiveAttentions(state,activeNow,people.filter(p=>personIds.has(p.id))).filter(attentionMatches)){
    const linked=links.get(event.id);
    for(const id of event.caseIds){
      const item=activeById.get(id);
      if(item&&(!item.openedAt||event.date>=item.openedAt)&&(!linked||linked.includes(id)))covered.add(item.personId);
    }
  }
  const coverage={numerator:covered.size,denominator,percentage:denominator?100*covered.size/denominator:null};
  const closed=cases.filter(c=>c.status==='Cerrado'&&inPeriod(c.closure?.date||c.closedAt,start,end));
  const stopWords=new Set('para pero como esta este esto desde hasta caso otra otro unos unas que los las del por con una sus sin sobre entre también'.split(' '));
  const closureWords=countValues(closed.filter(c=>c.closure?.category==='Otro').flatMap(c=>(c.closure.explanation||'').toLowerCase().match(/\p{L}{4,}/gu)?.filter(word=>!stopWords.has(word))||[])).filter(row=>row.value>1).slice(0,24);
  const uniquePeople = new Set(events.flatMap(a => a.personIds)).size;
  const byType = countValues(events.map(a => a.type)).map(row => ({ ...row, people: new Set(events.filter(a => a.type === row.name).flatMap(a => a.personIds)).size }));
  const cancellations = applyHierarchyFilters(scopeItems(state.schedule || [], role), filters).filter(s => s.status === 'Cancelada' && inPeriod(s.date, start, end));
  // No analysis event date exists yet: outcomes use the reference cohort's year.
  const admitted = refs.filter(r => r.status === 'Admitida a A.I.').length;
  const notRequired = refs.filter(r => r.status === 'No requiere A.I.').length;
  return {
    cases, refs, events, uniquePeople, byType, coverage, closureWords,
    closureReasons:countValues(closed.map(c=>c.closure?.category||'Otro')),
    sent: refs.filter(r => inPeriod(sentDate(r), start, end)).length,
    admitted, notRequired, analyzed: admitted + notRequired,
    withoutAttention: active.filter(c => !hasAttentionInPeriod(state, c, start, end)).length,
    byEstablishment: countValues(cases.map(c => c.establishment)),
    bySex: countValues(cases.map(c => people.find(p => p.id === c.personId)?.sex)),
    byAge: countValues(cases.map(c => { const years = age(people.find(p => p.id === c.personId) || {}); return Number.isFinite(years) ? (years<3?'0–2 años':years<6?'3–5 años':years<13?'6–12 años':years<18?'13–17 años':'18 años o más') : 'No disponible'; })),
    motives: countValues(refs.flatMap(r => [...new Set(r.motives || [])])),
    cancellationReasons: countValues(cancellations.map(s => s.reason)),
  };
}

export function reportReady(selected, analyses, title) {
  return new Set(selected).size>=5 && Boolean(title.trim()) && selected.every(id=>Boolean(analyses[id]?.trim()));
}
