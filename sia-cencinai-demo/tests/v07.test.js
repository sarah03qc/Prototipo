import test from 'node:test';
import assert from 'node:assert/strict';
import {addReference, closeCase, createCaseFromReference, transferCase} from '../src/utils/caseOperations.js';
import {reassessCase, valuationHistory} from '../src/utils/caseValuations.js';
import {prepareDemoState} from '../src/utils/demoState.js';
import {FACTOR_GROUPS, factorKey} from '../src/utils/valuation.js';
import {reportingMetrics, reportReady} from '../src/utils/reporting.js';
import {pendingReferralSignals} from '../src/utils/referralSignals.js';

const territory={establishment:'CINAI Los Robles',localOffice:'Oficina Local Alajuela',region:'Región Central Norte'};
const role='EEII_LOCAL';
const date='2026-10-01';
const fixture=()=>{
  const person={...territory,id:'P1',name:'Persona ficticia',birthDate:'2020-06-01'};
  return {people:[person],cases:[{...territory,id:'C1',personId:person.id,openedAt:'2026-01-01',status:'Activo',priority:'Bajo'}],
    sessions:[{id:'S1',place:territory.localOffice,referenceIds:[]}],references:[],timeline:[],transfers:[],groupAttentions:[],
    institutionalReferralSignals:[{id:'SIG1',personId:person.id,criterion:'Criterio de prueba'}]};
};

test('traslado cierra el caso existente una sola vez y conserva su destino',()=>{
  const state=fixture();
  const next=transferCase(state,'C1',{date,destinationOffice:'Oficina Local Heredia',reason:'Cambio de residencia'});
  assert.equal(next.cases.length,1);
  assert.equal(next.cases[0].status,'Cerrado');
  assert.equal(next.cases[0].closure.category,'Traslado');
  assert.equal(next.transfers[0].status,'Registrado');
  assert.equal(next.timeline[0].type,'Traslado');
  assert.equal(transferCase(next,'C1',{date}),next);
});

test('la referencia y la admisión comprueban casos activos en todo el estado',()=>{
  const state=fixture(), draft={personId:'P1',date,motives:[]};
  assert.equal(addReference(state,draft),state);
  const closed=closeCase(state,'C1',{date,reason:'Cierre satisfactorio'});
  const withRefs=addReference(addReference(closed,draft),draft);
  assert.equal(withRefs.references.length,2);
  assert.notEqual(withRefs.references[0].consecutive,withRefs.references[1].consecutive);
  const payload={riskLevel:'Alto',protectionLevel:'Baja'};
  const first=createCaseFromReference(withRefs,withRefs.references[0].id,payload);
  assert.equal(first.cases.length,2);
  assert.equal(first.cases.filter(c=>c.status==='Activo').length,1);
  assert.equal(createCaseFromReference(first,withRefs.references[1].id,payload),first);
});

test('cierre Otro requiere explicación y la migración conserva los registros y textos',()=>{
  const state=fixture();
  assert.equal(closeCase(state,'C1',{date,reason:'Otro',explanation:'  '}),state);
  const next=closeCase(state,'C1',{date,reason:'Otro',explanation:' Cambio de servicio '});
  assert.equal(next.cases[0].closure.explanation,'Cambio de servicio');
  assert.equal(closeCase(next,'C1',{date,reason:'Traslado'}),next);
  const old={...state,cases:[{...state.cases[0],status:'Cerrado',closedAt:date,closureReason:'Texto anterior'}],
    transfers:[{id:'legacy',status:'Pendiente de continuidad',reason:'Texto histórico'}]};
  const migrated=prepareDemoState(old,state);
  assert.equal(migrated.cases[0].closure.category,'Otro');
  assert.equal(migrated.cases[0].closure.explanation,'Texto anterior');
  assert.equal(migrated.transfers[0].reason,'Texto histórico');
  assert.equal(migrated.transfers[0].status,'Registrado');
});

test('una sugerencia gestionada no puede generar otra referencia equivalente',()=>{
  const base=fixture();
  const state={...base,cases:[]};
  assert.equal(pendingReferralSignals(state,role).length,1);
  assert.equal(pendingReferralSignals(state,'NIVEL_NACIONAL').length,0);
  const draft={personId:'P1',signalId:'SIG1',date,motives:['Criterio de prueba']};
  const next=addReference(state,draft);
  assert.equal(pendingReferralSignals(next,role).length,0);
  assert.equal(addReference(next,draft),next);
});

test('revaloración aplica RN-009, conserva versiones y requiere categorías y sesión autorizadas',()=>{
  const state=fixture();
  const valuation={riskLevel:'Alto',protectionLevel:'Baja',selected:Object.fromEntries(FACTOR_GROUPS.map(c=>[factorKey(c,'Ninguno'),true])),details:{}};
  assert.equal(reassessCase(state,'ESTABLISHMENT','C1','S1',valuation,date),state);
  assert.equal(reassessCase(state,role,'C1','S1',{...valuation,selected:{}},date),state);
  const next=reassessCase(state,role,'C1','S1',valuation,date);
  assert.equal(next.cases[0].priority,'Alto');
  assert.deepEqual(next.cases[0].valuations[0],valuationHistory(state.cases[0])[0]);
  const repeated=reassessCase(next,role,'C1','S1',valuation,date);
  assert.equal(repeated.cases[0].valuations.length,3);
  assert.equal(repeated.timeline[0].id,'C1-V3');
});

test('cobertura 10 de 25, con personas únicas, asistencia efectiva y caso vigente',()=>{
  const state=fixture();
  const person=state.people[0];
  state.people=Array.from({length:26},(_,i)=>({...person,id:`P${i}`}));
  state.cases=state.people.map((p,i)=>({...state.cases[0],id:`C${i}`,personId:p.id,status:i===25?'Cerrado':'Activo'}));
  state.cases.push({...state.cases[10],id:'H10',status:'Cerrado',closedAt:'2026-03-01'});
  const attention=id=>({id:`E${id}`,caseId:id,date,type:'Consejería'});
  state.timeline=[...Array.from({length:9},(_,i)=>attention(`C${i}`)),attention('C1'),attention('H10'),attention('C25')];
  state.groupAttentions=[{id:'G1',date,type:'Atención grupal',participantIds:['P9','P11'],attendance:{P9:true,P11:false}}];
  assert.deepEqual(reportingMetrics(state,role,{year:'2026',status:'Cerrado'}).coverage,{numerator:10,denominator:25,percentage:40});
  assert.deepEqual(reportingMetrics(state,role,{year:'2026',establishment:'Otro'}).coverage,{numerator:0,denominator:0,percentage:null});
});

test('el informe requiere cinco análisis no vacíos y título',()=>{
  const selected=[0,1,2,3,4];
  const analyses=Object.fromEntries(selected.map(i=>[i,`Análisis ${i}`]));
  assert.equal(reportReady(selected.slice(1),analyses,'Informe'),false);
  assert.equal(reportReady(selected,analyses,' '),false);
  assert.equal(reportReady(selected,{...analyses,0:' '},'Informe'),false);
  assert.equal(reportReady(selected,analyses,'Informe'),true);
});
