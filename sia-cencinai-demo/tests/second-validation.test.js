import test from 'node:test';
import assert from 'node:assert/strict';
import * as mocks from '../src/data/mockData.js';
import { FOLLOW_UP_FREQUENCIES, SCHEDULE_TYPES } from '../src/data/catalogs.js';
import { canEditOperational, canViewCaseDetails, demoReferenceAuthor } from '../src/utils/access.js';
import { createSentReference, normalizeReferenceMotives, updateReferenceRecord, referenceIdentityRows } from '../src/utils/references.js';
import { referencePrintHtml } from '../src/utils/download.js';
import { prepareDemoState } from '../src/utils/demoState.js';
import { addGroupAttentionRecord, normalizeGroupAttention } from '../src/utils/groupAttentions.js';
import { effectiveAttentions, getLastAttentionForCase, hasAttentionInPeriod, currentDate } from '../src/utils/followUp.js';
import { isOverdue, normalizeSchedule, updateScheduledActivity } from '../src/utils/schedule.js';
import { pendingReferralSignals } from '../src/utils/referralSignals.js';
import { reportingMetrics } from '../src/utils/reporting.js';
import { buildAssistantContext } from '../src/utils/assistantContext.js';
import { selectAssistantContext } from '../server/assistantContextSelection.js';

const state = Object.fromEntries(Object.entries(mocks).map(([key, value]) => [key.slice(4,5).toLowerCase()+key.slice(5), value]));
const filters = {year:'2026',minAge:'',maxAge:''};
const person = state.people[0];
const c = state.cases[0];
const fixture = {
  ...state, cases:[{...c,openedAt:'2025-01-01'}], people:[person], timeline:[
    {id:'I1',caseId:c.id,date:'2025-09-01',type:'Consejería',discipline:'Psicología',professional:'Ana'},
    {id:'I2',caseId:c.id,date:'2025-09-02',type:'Consejería',discipline:'Psicología',professional:'Ana'},
    {id:'SESSION',caseId:c.id,date:'2026-09-10',type:'Sesión interdisciplinaria'},
  ], groupAttentions:[], schedule:[], references:[], institutionalReferralSignals:[],
};

test('Asistentes 2/3 see priority without sensitive case fields or internal access', () => {
  for(const role of ['ESTABLISHMENT','ESTABLISHMENT_ASSISTANT2']) {
    assert.equal(canViewCaseDetails(role),false);
    assert.equal(canEditOperational(role),false);
    const context=buildAssistantContext(state,role);
    for(const item of context.casosAI) {
      assert.equal(item.prioridad,state.cases.find(c=>c.id===item.id).priority);
      for(const key of ['nivelRiesgo','nivelProteccion','valoracion','resumenValoracion','estrategias','disciplinas','frecuencia','propositos']) assert.ok(!(key in item));
    }
    for(const key of ['lineaTiempo','documentos','coordinaciones','traslados','reportes']) assert.deepEqual(context[key],[]);
  }
});
test('follow-up frequencies keep existing options and add quarterly and semiannual', () => {
  for(const frequency of ['Semanal','Quincenal','Mensual','Bimensual','Trimestral','Semestral','Según necesidad']) assert.ok(FOLLOW_UP_FREQUENCIES.includes(frequency));
});
test('obsolete companions are discarded without discarding guardian data', () => {
  const restored=prepareDemoState({...state,groupAttentions:[{...state.groupAttentions[0],companions:{secret:'hidden'},attendeesCompanions:{},guardianAsCompanion:true}]},state);
  assert.ok(!JSON.stringify(restored.groupAttentions).match(/companion/i));
  assert.equal(restored.people[0].guardian.name,person.guardian.name);
  assert.ok(!('companions' in normalizeGroupAttention({companions:{}})));
});
test('group insertion creates one base record and links only attendees with active cases', () => {
  const active2={...c,id:'C2',personId:state.people[1].id};
  const input={date:'2026-10-01',type:'Atención grupal',topic:'Tema',actions:'Contenido almacenado una vez',participantIds:[c.personId,active2.personId],attendance:{[c.personId]:'Presente',[active2.personId]:'Ausente'},companions:{legacy:true},disciplines:['Psicología']};
  const result=addGroupAttentionRecord({...fixture,cases:[c,active2]},input,'G1');
  assert.equal(result.groupAttentions.length,1);
  assert.ok(!('companions' in result.groupAttentions[0]));
  const links=result.timeline.filter(e=>e.groupInterventionId==='G1');
  assert.deepEqual(links.map(e=>e.caseId),[c.id]);
  assert.ok(!JSON.stringify(links).includes(input.actions));
});
test('legacy schedule visit is renamed without losing record data', () => {
  const item=normalizeSchedule({id:'S1',type:'Atención por establecimiento',date:'2025-10-01',notes:'Conservar'});
  assert.equal(item.type,'Visita a establecimiento para Atención Interdisciplinaria');
  assert.equal(item.notes,'Conservar');
  assert.equal(item.id,'S1');
});
test('both old team-work labels normalize to one interdisciplinary session', () => {
  for(const type of ['Sesión de trabajo del EE.II.','Sesión de trabajo del Equipo Interdisciplinario']) assert.equal(normalizeSchedule({type}).type,'Sesión interdisciplinaria');
  assert.ok(SCHEDULE_TYPES.every(t=>!t.includes('Sesión de trabajo')));
});
test('overdue is only scheduled before the applicable day and never mutates status', () => {
  const item={date:'2026-10-28',status:'Programada'};
  assert.equal(isOverdue(item,'2026-10-29'),true);
  assert.equal(isOverdue({...item,date:'2026-10-29'},'2026-10-29'),false);
  for(const status of ['Cancelada','Realizada','Reprogramada']) assert.equal(isOverdue({...item,status},'2026-10-29'),false);
  assert.equal(item.status,'Programada');
});
test('cancellation retains original date and reason and requires a reason', () => {
  const item={id:'S1',date:'2026-09-10',status:'Programada',title:'Actividad'};
  assert.equal(updateScheduledActivity(item,{status:'Cancelada',reason:' '}),item);
  const cancelled=updateScheduledActivity(item,{status:'Cancelada',reason:'Indisponibilidad familiar'});
  assert.equal(cancelled.originalDate,item.date);
  assert.equal(cancelled.date,item.date);
  assert.equal(cancelled.reason,'Indisponibilidad familiar');
  const moved=updateScheduledActivity(item,{status:'Reprogramada',date:'2026-11-01',reason:'Cambio solicitado'});
  assert.equal(moved.originalDate,item.date);
  assert.equal(moved.date,'2026-11-01');
});
test('general visits have no implicit people or cases in assistant context', () => {
  const context=buildAssistantContext({...state,schedule:[{...state.schedule[1],caseIds:[]}]},'EEII_LOCAL');
  assert.equal(context.programacion[0].actividadGeneral,true);
  assert.deepEqual(context.programacion[0].casosAsociados,[]);
  assert.deepEqual(context.programacion[0].personasAsociadas,[]);
});
test('specific schedule associations contain only explicitly selected authorized cases', () => {
  const context=buildAssistantContext({...state,schedule:[{...state.schedule[1],caseIds:[c.id,'AI-004']}]},'EEII_LOCAL');
  assert.equal(context.programacion[0].actividadGeneral,false);
  assert.deepEqual(context.programacion[0].casosAsociados.map(c=>c.casoId),[c.id]);
  for(const role of ['ATE_REGIONAL','NIVEL_NACIONAL']) assert.equal(canEditOperational(role),false);
});
test('reference send generates exact real timestamp and pending status independent of functional date', () => {
  const before=Date.now();
  const sent=createSentReference({personId:person.id,date:'2025-01-01',status:'Recibida',referredBy:demoReferenceAuthor('ESTABLISHMENT_ASSISTANT2')},person);
  assert.ok(Date.parse(sent.sentAt)>=before&&Date.parse(sent.sentAt)<=Date.now());
  assert.equal(sent.status,'Pendiente de revisión');
  assert.equal(sent.date,'2025-01-01');
  const changed=updateReferenceRecord(sent,{sentAt:'2000-01-01',referredBy:'Otra persona',status:'Admitida a A.I.'});
  assert.equal(changed.sentAt,sent.sentAt);
  assert.equal(changed.referredBy,sent.referredBy);
});
test('legacy reference statuses normalize without inventing historical send timestamps', () => {
  assert.equal(normalizeReferenceMotives({status:'Recibida'}).status,'Pendiente de revisión');
  assert.equal(normalizeReferenceMotives({status:'Rechazada'}).status,'No requiere A.I.');
  const saved=structuredClone(state);delete saved.references[0].sentAt;
  const restored=prepareDemoState(saved,state);
  assert.ok(!('sentAt' in restored.references[0]));
  assert.ok(!('sentAt' in updateReferenceRecord(restored.references[0],{sentAt:'2000-01-01'})));
});
test('print distinguishes sent and generation times and preserves territorial order', () => {
  const html=referencePrintHtml(state.references[0],person);
  assert.ok(html.includes('Fecha/hora de envío'));
  assert.ok(html.includes('Fecha/hora de generación para impresión'));
  assert.ok(html.includes('Información complementaria asociada al motivo de referencia'));
  const labels=referenceIdentityRows(state.references[0].snapshot).map(r=>r[0]);
  assert.ok(labels.indexOf('Región')<labels.indexOf('Oficina Local'));
  assert.ok(labels.indexOf('Oficina Local')<labels.indexOf('Establecimiento'));
  assert.ok(referencePrintHtml({...state.references[0],sentAt:undefined},person).includes('No disponible'));
});
test('last individual attention excludes admission events', () => {
  assert.equal(getLastAttentionForCase(fixture,c).date,'2025-09-02');
});
test('last group attention only counts attendance marked present or true', () => {
  const group={id:'G1',date:'2026-10-01',participantIds:[c.personId],attendance:{[c.personId]:'Ausente'}};
  assert.equal(getLastAttentionForCase({...fixture,groupAttentions:[group]},c).date,'2025-09-02');
  for(const value of ['Presente',true]) {
    assert.equal(getLastAttentionForCase({...fixture,groupAttentions:[{...group,attendance:{[c.personId]:value}}]},c).date,'2026-10-01');
  }
});
test('completed schedule never changes last attention', () => {
  const modified={...fixture,schedule:[{caseIds:[c.id],status:'Realizada',date:'2026-10-01'}]};
  assert.equal(getLastAttentionForCase(modified,c).date,'2025-09-02');
});
test('cases with an old attention are still without attention in the selected year', () => {
  assert.equal(hasAttentionInPeriod(fixture,c,'2026-01-01','2026-12-31'),false);
  assert.equal(hasAttentionInPeriod(fixture,c,'2025-01-01','2025-12-31'),true);
});
test('never-attended case returns no attention and explicit assistant placeholder', () => {
  const empty={...fixture,timeline:[]};
  assert.equal(getLastAttentionForCase(empty,c),null);
  assert.equal(buildAssistantContext(empty,'EEII_LOCAL').casosAI[0].ultimaAtencion,'Sin atención registrada');
});
test('multiple individual attentions to the same person count one person', () => {
  const metrics=reportingMetrics(fixture,'EEII_LOCAL',{...filters,year:'2025'});
  assert.equal(metrics.uniquePeople,1);
  assert.equal(metrics.events.length,2);
});
test('group attention and its case links count a single base attention with several people', () => {
  const group={id:'G1',date:'2026-10-01',type:'Atención grupal',participantIds:state.people.slice(0,2).map(p=>p.id),attendance:{'PER-001':'Presente','PER-002':true}};
  const modified={...fixture,people:state.people.slice(0,2),groupAttentions:[group],timeline:[{id:'LINK',date:group.date,caseId:c.id,type:'Atención grupal',groupInterventionId:'G1'}]};
  const metrics=reportingMetrics(modified,'EEII_LOCAL',filters);
  assert.equal(metrics.events.length,1);
  assert.equal(metrics.uniquePeople,2);
  assert.equal(metrics.byType[0].people,2);
  assert.equal(effectiveAttentions(modified).length,1);
});
test('multiple motives are counted independently per reference', () => {
  const ref={personId:person.id,date:'2026-09-01',status:'No requiere A.I.',establishment:c.establishment,localOffice:c.localOffice,region:c.region,motives:['A','B','A']};
  const metrics=reportingMetrics({...fixture,references:[ref]},'EEII_LOCAL',filters);
  assert.equal(metrics.refs.length,1);
  assert.deepEqual(metrics.motives,[{name:'A',value:1},{name:'B',value:1}]);
  assert.equal(metrics.analyzed,1);
  assert.equal(metrics.sent,0);
});
test('pending signals obey scope and exact motive equivalence', () => {
  const signals=pendingReferralSignals(state,'ESTABLISHMENT_ASSISTANT2');
  assert.deepEqual(signals.map(s=>s.id),['SIG-001']);
  assert.deepEqual(pendingReferralSignals(state,'ATE_REGIONAL'),[]);
  const signal=signals[0], p=state.people.find(p=>p.id===signal.personId);
  const modified={...state,references:[...state.references,{personId:p.id,establishment:p.establishment,localOffice:p.localOffice,region:p.region,motives:[signal.criterion],status:'Pendiente de revisión'}]};
  assert.equal(pendingReferralSignals(modified,'ESTABLISHMENT_ASSISTANT2').length,0);
  assert.equal(state.cases.length,modified.cases.length);
});
test('assistant includes sentAt, derived last attention, simulated signals and semantic notes', () => {
  const context=buildAssistantContext(state,'EEII_LOCAL');
  assert.equal(context.referencias.find(r=>r.id==='REF-001').fechaHoraEnvio,state.references[0].sentAt);
  assert.ok(context.referencias[0].informacionComplementariaAsociadaAlMotivoDeReferencia);
  assert.equal(context.casosAI.find(item=>item.id==='AI-006').ultimaAtencion,'2026-10-28');
  assert.equal(context.casosAI.find(item=>item.id==='AI-007').sinAtencionEnPeriodo,true);
  assert.ok(context.reglasConsulta.includes('simuladas'));
  assert.ok(context.posiblesReferenciasPendientes.length);
  assert.ok(!JSON.stringify(context.atencionesGrupales).match(/companion|acompanante/i));
});
test('assistant topic selection retains last-attention and pending-signals context', () => {
  const context=buildAssistantContext(state,'EEII_LOCAL');
  assert.ok(selectAssistantContext(context,[{role:'user',text:'¿Cuál fue la última atención de Sofía?'}]).casosAI);
  assert.ok(selectAssistantContext(context,[{role:'user',text:'¿Hay posibles referencias pendientes?'}]).posiblesReferenciasPendientes);
  assert.ok(selectAssistantContext(context,[{role:'user',text:'¿Qué niños están programados?'}]).reglasConsulta);
});
test('reports retain old active cases and respect scope, age, discipline and professional filters', () => {
  const metrics=reportingMetrics(state,'EEII_LOCAL',filters);
  assert.ok(metrics.cases.some(c=>c.id==='AI-007'));
  assert.ok(metrics.withoutAttention>=2);
  assert.ok(metrics.bySex.length&&metrics.byAge.length&&metrics.byEstablishment.length);
  assert.ok(metrics.cancellationReasons.some(r=>r.name==='Indisponibilidad de la familia'));
  const restricted=reportingMetrics(state,'EEII_LOCAL',{...filters,establishment:'CEN La Esperanza'});
  assert.ok(restricted.cases.every(c=>c.establishment==='CEN La Esperanza'));
  const none=reportingMetrics(state,'EEII_LOCAL',{...filters,minAge:'100'});
  assert.equal(none.cases.length,0);
  assert.equal(none.events.length,0);
  const filtered=reportingMetrics(state,'EEII_LOCAL',{...filters,discipline:'Terapia de Lenguaje',professional:'María Fernanda Soto'});
  assert.equal(filtered.events.length,1);
  assert.equal(currentDate().length,10);
});

test('sent reference reporting uses Costa Rica dates at the year boundary', () => {
  const ref={...state.references[0],personId:person.id,establishment:c.establishment,localOffice:c.localOffice,region:c.region,date:'2025-12-31',sentAt:'2026-01-01T02:30:00.000Z'};
  assert.equal(reportingMetrics({...fixture,references:[ref]},'EEII_LOCAL',{...filters,year:'2025'}).sent,1);
  assert.equal(reportingMetrics({...fixture,references:[ref]},'EEII_LOCAL',filters).sent,0);
});
