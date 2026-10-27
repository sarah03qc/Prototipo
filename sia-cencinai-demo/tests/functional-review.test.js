import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriority, DETECTION_ORIGINS, DISCIPLINES, PRIORITIES, REFERENCE_MOTIVES, RISK_MATRIX, ROLES } from '../src/data/catalogs.js';
import { canCreateReference, canEditOperational, demoReferenceAuthor, roleConfig, roleFilters, scopeItems } from '../src/utils/access.js';
import { demoPeople, demoReferences, demoCases, demoGroupAttentions, demoSessions } from '../src/data/mockData.js';
import { ageAtDate, createReferenceSnapshot, nextReferenceConsecutive, normalizeReferenceMotives, referenceContext } from '../src/utils/references.js';
import { prepareDemoState } from '../src/utils/demoState.js';
import { buildExcelCsv, referencePrintHtml } from '../src/utils/download.js';

test('all nine professional risk/protection combinations yield the required priority', () => {
  for (const [risk, protection, expected] of [
    ['Alto','Baja','Alto'], ['Alto','Moderada','Alto'], ['Moderado','Baja','Alto'],
    ['Alto','Alta','Moderado'], ['Moderado','Moderada','Moderado'], ['Moderado','Alta','Moderado'],
    ['Bajo','Baja','Moderado'], ['Bajo','Moderada','Bajo'], ['Bajo','Alta','Bajo'],
  ]) assert.equal(calculatePriority(risk, protection), expected);
  assert.equal(calculatePriority('Alto', ''), '');
  assert.deepEqual(PRIORITIES, ['Alto','Moderado','Bajo']);
});

test('reference motives are restricted without reducing the professional risk matrix', () => {
  assert.deepEqual(REFERENCE_MOTIVES.Crecimiento, ['Condición de malnutrición', 'Malnutrición con necesidades especiales']);
  assert.ok(REFERENCE_MOTIVES.Salud.includes('Otra condición de salud'));
  assert.deepEqual(DETECTION_ORIGINS, ['Vigilancia / tamizaje', 'Observación', 'Información aportada por la familia u otros', 'Referencia externa']);
  assert.deepEqual(REFERENCE_MOTIVES.Desarrollo, ['EDIN II: riesgo de retraso (rojo)', 'EVADE: riesgo de rezago (0,1 sin logro de edad anterior)']);
  assert.equal(REFERENCE_MOTIVES['Factores de riesgo'].length, 3);
  assert.ok(!DISCIPLINES.includes('Otra'));
  for (const area of Object.values(RISK_MATRIX)) {
    assert.ok(area.protectores.includes('Otro factor protector'));
    assert.ok(area.riesgos.includes('Otro factor de riesgo'));
    assert.ok(area.alertas.includes('Otro signo de alerta'));
  }
});

test('snapshot freezes guardian, modalities and age at reference date', () => {
  const person = structuredClone(demoPeople[0]);
  const snapshot = createReferenceSnapshot(person, '2026-05-13');
  person.guardian.name = 'Dato actual cambiado';
  person.guardian.phone = 'Nuevo teléfono';
  person.modalities.push('Otro servicio actual');
  person.address = 'Otra dirección';
  assert.equal(snapshot.age, '4 años, 11 meses');
  assert.notEqual(snapshot.guardian.name, person.guardian.name);
  assert.notEqual(snapshot.guardian.phone, person.guardian.phone);
  assert.notEqual(snapshot.address, person.address);
  assert.equal(snapshot.modalities.length, 1);
  assert.equal(referenceContext({ snapshot }, person), snapshot);
  assert.equal(ageAtDate('2021-05-14', '2026-05-14'), '5 años, 0 meses');
});

test('institutional consecutive advances per establishment and year', () => {
  const person = demoPeople[0];
  const first = nextReferenceConsecutive(person, '2026-09-16');
  assert.equal(first, 'DNCC-DRCN-OL101-1010102-REF-001-2026');
  assert.equal(nextReferenceConsecutive(person, '2026-10-01', [{consecutive:first}]), 'DNCC-DRCN-OL101-1010102-REF-002-2026');
  assert.equal(nextReferenceConsecutive(person, '2027-01-01', [{consecutive:first}]), 'DNCC-DRCN-OL101-1010102-REF-001-2027');
  assert.match(nextReferenceConsecutive(demoPeople[1], '2026-09-16', [{consecutive:first}]), /1010103-REF-001-2026$/);
});

test('demo records demonstrate coherent priorities, full references, guardian context and companions', () => {
  assert.equal(demoPeople.length, 12);
  for (const person of demoPeople) assert.ok(person.guardian.name && person.guardian.phone && person.address);
  assert.equal(new Set(demoReferences.map(r => r.consecutive)).size, demoReferences.length);
  for (const reference of demoReferences) {
    assert.ok(DETECTION_ORIGINS.includes(reference.origin));
    assert.ok(reference.priorActions && reference.priorResults && reference.snapshot);
    assert.ok(reference.motives.every(m => Object.values(REFERENCE_MOTIVES).flat().includes(m)));
  }
  for (const caseItem of demoCases) {
    assert.equal(caseItem.priority, calculatePriority(caseItem.riskLevel, caseItem.protectionLevel));
    assert.ok(caseItem.referenceSnapshot && caseItem.referenceConsecutive);
    assert.ok(caseItem.disciplines.every(d => DISCIPLINES.includes(d)));
  }
  assert.ok(demoReferences.some(r => r.status === 'No requiere A.I.' && r.decisionJustification));
  assert.ok(demoGroupAttentions.some(g => Object.values(g.companions || {}).some(list => list.length)));
});

test('old local demo records keep edits while receiving the new fields and compatible catalog values', () => {
  const seed = { people:demoPeople, references:demoReferences, cases:demoCases, groupAttentions:demoGroupAttentions, sessions:demoSessions };
  const saved = structuredClone(seed);
  delete saved.people[0].guardian;
  delete saved.people[0].address;
  saved.people[0].name = 'Nombre editado localmente';
  saved.references[0].motives = ['Riesgo o rezago', 'Otro factor de riesgo'];
  saved.references[0].factorDetails = {'Riesgo o rezago':'Detalle conservado'};
  delete saved.references[0].snapshot;
  delete saved.references[0].consecutive;
  saved.cases[0].priority = 'Urgencia';
  delete saved.cases[0].riskLevel;
  delete saved.cases[0].protectionLevel;
  const restored = prepareDemoState(saved, seed);
  assert.equal(restored.people[0].name, 'Nombre editado localmente');
  assert.ok(restored.people[0].guardian.name);
  assert.deepEqual(restored.references[0].motives, ['EDIN II: riesgo de retraso (rojo)']);
  assert.equal(restored.references[0].factorDetails['EDIN II: riesgo de retraso (rojo)'], 'Detalle conservado');
  assert.equal(restored.cases[0].priority, 'Alto');
  assert.ok(restored.references[0].consecutive && restored.references[0].snapshot);
  assert.deepEqual(normalizeReferenceMotives({motives:['Hallazgo EVADE']}).motives, [REFERENCE_MOTIVES.Desarrollo[1]]);
});

test('print uses historical context and includes prior actions/results with safe HTML', () => {
  const reference = structuredClone(demoReferences[0]);
  reference.priorActions = 'Acción anterior <texto> & ejemplo';
  reference.priorResults = 'Resultado de seguimiento';
  const html = referencePrintHtml(reference, { ...demoPeople[1], name:'No debe reemplazar el snapshot' });
  assert.ok(html.includes(reference.consecutive));
  assert.ok(html.includes(reference.snapshot.name));
  assert.ok(html.includes(reference.snapshot.guardian.phone));
  assert.ok(html.includes(reference.snapshot.age));
  assert.ok(html.includes('Vía de Atención'));
  assert.ok(html.includes(reference.referredBy));
  assert.ok(html.includes('Acción anterior &lt;texto&gt; &amp; ejemplo'));
  assert.ok(html.includes('Resultado de seguimiento'));
  assert.ok(!html.includes('No debe reemplazar el snapshot'));
});

test('Asistente 2 shares establishment scope, filters and sensitive-data restrictions', () => {
  const role = ROLES.find(r => r.label === 'Asistente 2 — Establecimiento');
  assert.ok(role);
  assert.equal(role.level, 'establishment');
  assert.equal(role.scope, roleConfig('ESTABLISHMENT').scope);
  assert.equal(canCreateReference(role.id), true);
  assert.equal(canEditOperational(role.id), false);
  assert.deepEqual(scopeItems(demoPeople, role.id), scopeItems(demoPeople, 'ESTABLISHMENT'));
  assert.deepEqual(scopeItems(demoReferences, role.id), scopeItems(demoReferences, 'ESTABLISHMENT'));
  assert.deepEqual(roleFilters(role.id, demoPeople), roleFilters('ESTABLISHMENT', demoPeople));
  assert.equal(canCreateReference('ATE_REGIONAL'), false);
});

test('demo reference author represents the currently selected role without rewriting historical references', () => {
  assert.equal(demoReferenceAuthor('ESTABLISHMENT_ASSISTANT2'), 'Carlos Rodríguez — Asistente 2');
  assert.equal(demoReferenceAuthor('ESTABLISHMENT'), 'María López — Asistente 3');
  assert.equal(demoReferenceAuthor('EEII_LOCAL'), 'Ana Morales — Profesional del Equipo Interdisciplinario');
  const seed = { people:demoPeople, references:demoReferences, cases:demoCases, groupAttentions:demoGroupAttentions, sessions:demoSessions };
  const saved = structuredClone(seed);
  saved.references[0].referredBy = demoReferenceAuthor('ESTABLISHMENT_ASSISTANT2');
  saved.references[0].origin = 'Observación directa';
  saved.references[1].origin = 'Información aportada por la familia';
  const restored = prepareDemoState(saved, seed);
  assert.equal(restored.references[0].origin, 'Observación');
  assert.equal(restored.references[1].origin, 'Información aportada por la familia u otros');
  assert.equal(restored.references[0].referredBy, 'Carlos Rodríguez — Asistente 2');
  assert.notEqual(restored.references[0].referredBy, demoReferenceAuthor('ESTABLISHMENT'));
  assert.deepEqual(restored.references[0].snapshot, saved.references[0].snapshot);
  assert.equal(restored.references[0].consecutive, saved.references[0].consecutive);
});

test('Excel export has BOM, explicit separator, separate columns and quoted multiline values', () => {
  const csv = buildExcelCsv(['Nombre','Modalidad','Observación'], [['Niña demo','APC','Texto; con "comillas"\ny salto']]);
  assert.ok(csv.startsWith('\ufeffsep=;\r\n'));
  assert.ok(csv.includes('"Nombre";"Modalidad";"Observación"'));
  assert.ok(csv.includes('"Texto; con ""comillas""\ny salto"'));
});
