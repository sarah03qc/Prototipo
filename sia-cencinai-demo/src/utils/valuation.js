import { RISK_MATRIX } from '../data/catalogs.js';

export const FACTOR_GROUPS = Object.entries(RISK_MATRIX).flatMap(([area, groups]) =>
  [['protectores', 'Factores protectores'], ['riesgos', 'Factores de riesgo'], ['alertas', 'Signos de alerta']].map(([group, label]) => ({
    id: `${area}|${group}`, area, label, items: groups[group],
  })));
export const factorKey = (category, item) => `${category.id}|${item}`;
export function categoryResponse(category, selected = {}) {
  const count = category.items.filter(item => selected[factorKey(category, item)]).length;
  const none = !!selected[factorKey(category, 'Ninguno')];
  return { count, none, valid: (count > 0 || none) && !(count > 0 && none) };
}
export function pendingFactorCategories(selected) {
  return FACTOR_GROUPS.filter(category => !categoryResponse(category, selected).valid);
}
export function toggleFactor(valuation, category, item) {
  const key = factorKey(category, item);
  const selected = { ...valuation.selected, [key]: !valuation.selected[key] };
  const details = { ...valuation.details };
  const clear = other => { delete selected[other]; delete details[other]; };
  if (!selected[key]) delete details[key];
  if (selected[key]) {
    if (item === 'Ninguno') category.items.forEach(other => clear(factorKey(category, other)));
    else clear(factorKey(category, 'Ninguno'));
  }
  return { ...valuation, selected, details };
}
