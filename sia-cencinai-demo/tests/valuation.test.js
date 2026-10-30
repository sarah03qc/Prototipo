import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { FACTOR_GROUPS, categoryResponse, factorKey, pendingFactorCategories, toggleFactor } from '../src/utils/valuation.js';
import { calculatePriority, DISCIPLINES, RISK_MATRIX } from '../src/data/catalogs.js';
import * as mocks from '../src/data/mockData.js';

const empty = () => ({ selected: {}, details: {}, riskLevel: '', protectionLevel: '' });
function nodes(tree, predicate) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate));
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}

test('every original area/group requires an explicit answer; ordinary factors and Ninguno both count', () => {
  assert.equal(FACTOR_GROUPS.length, Object.keys(RISK_MATRIX).length * 3);
  assert.equal(pendingFactorCategories({}).length, 9);
  let valuation = empty();
  for (const category of FACTOR_GROUPS) {
    assert.equal(categoryResponse(category, valuation.selected).valid, false);
    valuation = toggleFactor(valuation, category, 'Ninguno');
    assert.equal(categoryResponse(category, valuation.selected).valid, true);
    valuation = toggleFactor(valuation, category, category.items[0]);
    assert.equal(categoryResponse(category, valuation.selected).valid, true);
  }
  assert.deepEqual(pendingFactorCategories(valuation.selected), []);
  valuation = toggleFactor(valuation, FACTOR_GROUPS[0], FACTOR_GROUPS[0].items[0]);
  assert.deepEqual(pendingFactorCategories(valuation.selected).map(c => c.id), [FACTOR_GROUPS[0].id]);
});

test('Ninguno replaces factors and their details only within its category; factors replace Ninguno', () => {
  for (const category of FACTOR_GROUPS) {
    const other = FACTOR_GROUPS.find(c => c.id !== category.id);
    let valuation = toggleFactor(empty(), other, other.items[0]);
    valuation = toggleFactor(valuation, category, category.items[0]);
    valuation = toggleFactor(valuation, category, category.items[1]);
    const first = factorKey(category, category.items[0]);
    valuation.details[first] = 'Detalle';
    const original = structuredClone(valuation);
    const none = toggleFactor(valuation, category, 'Ninguno');
    assert.deepEqual(valuation, original, 'updates must not mutate legacy or previous values');
    assert.equal(categoryResponse(category, none.selected).count, 0);
    assert.equal(none.details[first], undefined);
    assert.equal(none.selected[factorKey(other, other.items[0])], true);
    const normal = toggleFactor(none, category, category.items[1]);
    assert.equal(normal.selected[factorKey(category, 'Ninguno')], undefined);
    assert.equal(categoryResponse(category, normal.selected).count, 1);
    const cleared = toggleFactor(none, category, 'Ninguno');
    assert.equal(categoryResponse(category, cleared.selected).valid, false);
    assert.equal(categoryResponse(category, { ...none.selected, [first]: true }).valid, false, 'contradictory imported data must block confirmation');
  }
});

test('legacy selections load unchanged, without inferring Ninguno or changing manual levels/priority', () => {
  const category = FACTOR_GROUPS[0];
  const legacy = { ...empty(), selected: { [factorKey(category, category.items[0])]: true }, details: { [factorKey(category, category.items[0])]: 'Histórico' }, riskLevel: 'Alto', protectionLevel: 'Alta' };
  const snapshot = structuredClone(legacy);
  assert.equal(pendingFactorCategories(legacy.selected).length, 8);
  assert.deepEqual(legacy, snapshot);
  for (const item of [...category.items, 'Ninguno']) {
    const next = toggleFactor(legacy, category, item);
    assert.equal(next.riskLevel, 'Alto');
    assert.equal(next.protectionLevel, 'Alta');
    assert.equal(calculatePriority(next.riskLevel, next.protectionLevel), 'Moderado');
  }
  const next = toggleFactor(empty(), category, category.items[0]);
  assert.equal(next.riskLevel, '');
  assert.equal(next.protectionLevel, '');
  assert.equal(calculatePriority(next.riskLevel, next.protectionLevel), '');
});

test('accordion buttons expand/collapse and preserve factor selections/details on reopening', async t => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  t.after(() => server.close());
  const { default: Category } = await server.ssrLoadModule('/src/components/FactorCategory.jsx');
  const category = FACTOR_GROUPS[0];
  let valuation = empty(), expanded = false;
  const render = () => Category({ category, index: 0, valuation, expanded, onExpand: () => { expanded = !expanded; }, onToggle: item => { valuation = toggleFactor(valuation, category, item); }, onDetail: (key, value) => { valuation.details[key] = value; }, showValidation: true });
  const button = () => nodes(render(), n => n.type === 'button')[0];
  assert.equal(button().props['aria-expanded'], false);
  assert.ok(renderToStaticMarkup(render()).includes('Pendiente'));
  assert.equal(nodes(render(), n => n.props?.role === 'region')[0].props.hidden, true);
  button().props.onClick();
  assert.equal(button().props['aria-expanded'], true);
  nodes(render(), n => n.type === 'input' && n.props.type === 'checkbox')[0].props.onChange();
  nodes(render(), n => n.type === 'input' && n.props['aria-label'])[0].props.onChange({ target: { value: 'Detalle conservado' } });
  const snapshot = structuredClone(valuation);
  button().props.onClick();
  assert.equal(expanded, false);
  button().props.onClick();
  assert.equal(expanded, true);
  assert.deepEqual(valuation, snapshot);
  assert.ok(renderToStaticMarkup(render()).includes('Detalle conservado'));
  const checks = nodes(render(), n => n.type === 'input' && n.props.type === 'checkbox');
  checks.at(-1).props.onChange();
  assert.ok(renderToStaticMarkup(render()).includes('Ninguno'));
  assert.equal(nodes(render(), n => n.type === 'input' && n.props.type === 'checkbox')[0].props.checked, false);
});

test('structured discipline selector supports multiple checked values and emits the original string array', async t => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  t.after(() => server.close());
  const { default: MultiSelect } = await server.ssrLoadModule('/src/components/MultiSelect.jsx');
  let value = [];
  const render = () => MultiSelect({ label: 'Disciplinas', options: DISCIPLINES, value, onChange: next => { value = next; } });
  const checks = () => nodes(render(), n => n.type === 'input');
  checks()[0].props.onChange();
  checks()[1].props.onChange();
  assert.deepEqual(value, DISCIPLINES.slice(0, 2));
  assert.equal(checks()[0].props.checked, true);
  assert.equal(checks()[1].props.checked, true);
  assert.ok(renderToStaticMarkup(render()).includes('<legend'));
  checks()[0].props.onChange();
  assert.deepEqual(value, [DISCIPLINES[1]]);
});

test('session renders nine collapsed categories, legacy selections, and guards both confirmation paths', async t => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  t.after(() => server.close());
  const { default: Sessions } = await server.ssrLoadModule('/src/pages/SessionsPage.jsx');
  const state = Object.fromEntries(Object.entries(mocks).map(([key, value]) => [key.slice(4,5).toLowerCase() + key.slice(5), value]));
  const category = FACTOR_GROUPS[0], key = factorKey(category, category.items[0]);
  const referenceId = state.sessions[0].referenceIds[0];
  state.references = state.references.map(r => r.id === referenceId ? { ...r, valuation: { selected: { [key]: true }, details: { [key]: 'Dato histórico' } } } : r);
  const html = renderToStaticMarkup(React.createElement(Sessions, { state, actions: {}, role: 'EEII_LOCAL', onNavigate() {} }));
  assert.equal((html.match(/aria-expanded="false"/g) || []).length, 9);
  for (const area of Object.keys(RISK_MATRIX)) assert.ok(html.includes(area));
  assert.ok(html.includes('Dato histórico'));
  assert.ok(html.includes('1 seleccionado(s)'));
  const source = await readFile(new URL('../src/pages/SessionsPage.jsx', import.meta.url), 'utf8');
  assert.equal((source.match(/if\(!validateFactors\(\)\|\|/g) || []).length, 2);
  assert.ok(source.includes('Faltan por revisar:'));
  assert.ok(source.includes('`${c.area} — ${c.label}`'));
  assert.ok(source.includes('calculatePriority(valuation.riskLevel,valuation.protectionLevel)'));
  for (const field of ['riskLevel', 'protectionLevel']) assert.ok(source.includes(`${field}:e.target.value`));
  assert.doesNotMatch(source, /groq|fetch\(|scor(?:e|ing)|suggest|recommend/i);
});
