import test from 'node:test';
import assert from 'node:assert/strict';
import * as mocks from '../src/data/mockData.js';
import { buildAssistantContext } from '../src/utils/assistantContext.js';
const state = Object.fromEntries(Object.entries(mocks).map(([key,value]) => [key.slice(4,5).toLowerCase()+key.slice(5),value]));
const local = buildAssistantContext(state, 'EEII_LOCAL');
test('guardian and contact match current mock for Sofia and every visible person', () => {
  assert.ok(local.clientesBeneficiarias.some(p => p.nombre === 'Sofía Vargas Mora'));
  for (const p of local.clientesBeneficiarias) {
    const source = state.people.find(s => s.id === p.id);
    assert.equal(p.personaEncargada.nombre, source.guardian.name);
    assert.equal(p.personaEncargada.relacion, source.guardian.relationship);
    assert.equal(p.personaEncargada.telefono, source.guardian.phone);
  }
});
test('references preserve new fields and historic consecutive', () => {
  for (const r of local.referencias) {
    const source = state.references.find(s => s.id === r.id);
    for (const [a,b] of Object.entries({consecutivoInstitucional:'consecutive',viaAtencion:'type',origen:'origin',responsable:'referredBy',accionesPrevias:'priorActions',resultadosPrevios:'priorResults',informacionComplementariaAsociadaAlMotivoDeReferencia:'observations'})) assert.equal(r[a],source[b]);
    assert.ok(r.contextoHistorico.personaEncargada);
  }
});
test('local cases include risk protection priority and original reference', () => {
  for (const c of local.casosAI) {
    const source = state.cases.find(s => s.id === c.id);
    assert.equal(c.nivelRiesgo,source.riskLevel);
    assert.equal(c.nivelProteccion,source.protectionLevel);
    assert.equal(c.prioridad,source.priority);
    assert.equal(c.consecutivoReferencia,source.referenceConsecutive);
  }
});
test('groups resolve people attendance without companions', () => {
  const group = local.atencionesGrupales.find(g => g.id === 'GRP-001');
  assert.equal(group.participantes[0].nombrePersona,state.people[0].name);
  assert.equal(group.participantes[0].presente,true);
  assert.ok(!JSON.stringify(group).match(/companion|acompanante|acompañante/i));
});
test('schedule remains scoped and complete', () => {
  assert.deepEqual(local.programacion.map(s => s.id),state.schedule.filter(s => s.localOffice === 'Oficina Local Alajuela').map(s => s.id));
});
test('establishment roles exclude all internal case data even when added later', () => {
  for (const role of ['ESTABLISHMENT','ESTABLISHMENT_ASSISTANT2']) {
    const context = buildAssistantContext(state,role);
    assert.ok(context.clientesBeneficiarias.every(p => p.establecimiento === 'CINAI Los Robles'));
    assert.ok(context.referencias.every(r => r.establecimiento === 'CINAI Los Robles'));
    assert.ok(context.casosAI.every(c=>['Alto','Moderado','Bajo'].includes(c.prioridad)));
    for (const c of context.casosAI) for (const key of ['nivelRiesgo','nivelProteccion','resumenValoracion','propositos','estrategias','motivoCierre']) assert.ok(!(key in c));
    for (const key of ['lineaTiempo','sesiones','atencionesGrupales','documentos','coordinaciones','reportes','traslados']) assert.deepEqual(context[key],[]);
  }
});
test('local operational collections and incoming transfer are visible without other office details', () => {
  for (const key of ['sesiones','lineaTiempo','atencionesGrupales','documentos','coordinaciones','reportes','traslados']) assert.ok(local[key].length,key);
  assert.ok(local.casosAI.every(c => c.oficinaLocal === 'Oficina Local Alajuela'));
  assert.ok(!local.casosAI.some(c => c.id === 'AI-003'));
  assert.equal(local.traslados[0].id,'TR-001');
});
test('analytics detail is scoped while internal tabs and unknown roles stay closed', () => {
  const regional = buildAssistantContext(state,'ATE_REGIONAL');
  assert.ok(regional.casosAI.every(c => c.region === 'Región Central Norte'));
  assert.ok(regional.lineaTiempo.length);
  for (const key of ['documentos','coordinaciones','reportes','traslados','sesiones','atencionesGrupales']) assert.deepEqual(regional[key],[]);
  assert.deepEqual(buildAssistantContext(state,'unknown'),{});
});
test('technical fields and document binaries are never forwarded', () => {
  const modified = structuredClone(state);
  modified.documents[0].content = 'BINARY_SECRET';
  modified.people[0].ui = 'UI_SECRET';
  const json = JSON.stringify(buildAssistantContext(modified,'EEII_LOCAL'));
  assert.ok(!json.includes('BINARY_SECRET'));
  assert.ok(!json.includes('UI_SECRET'));
});
