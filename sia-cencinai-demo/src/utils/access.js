import { ROLES } from '../data/catalogs';

export function roleConfig(roleId) {
  return ROLES.find((r) => r.id === roleId) || ROLES[1];
}

export function canEditOperational(roleId) {
  return ['EEII_LOCAL', 'JEFATURA_OL'].includes(roleId);
}

export function canCreateReference(roleId) {
  return ['ESTABLISHMENT', 'EEII_LOCAL', 'JEFATURA_OL'].includes(roleId);
}

export function isReadOnlyAnalytics(roleId) {
  return ['ATE_REGIONAL', 'NIVEL_NACIONAL'].includes(roleId);
}

export function scopeItems(items, roleId) {
  const role = roleConfig(roleId);
  if (role.level === 'national') return items;
  if (role.level === 'regional') return items.filter((x) => x.region === role.scope);
  if (role.level === 'local') return items.filter((x) => x.localOffice === role.scope);
  if (role.level === 'establishment') return items.filter((x) => x.establishment === role.scope);
  return items;
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
}

export function roleFilters(roleId, people) {
  const scoped = scopeItems(people, roleId);
  const role = roleConfig(roleId);
  return {
    regions: role.level === 'national' ? unique(people.map((p) => p.region)) : [],
    localOffices: ['national', 'regional'].includes(role.level) ? unique(scoped.map((p) => p.localOffice)) : [],
    establishments: role.level !== 'establishment' ? unique(scoped.map((p) => p.establishment)) : [],
  };
}

export function applyHierarchyFilters(items, filters) {
  return items.filter((x) => {
    if (filters.region && x.region !== filters.region) return false;
    if (filters.localOffice && x.localOffice !== filters.localOffice) return false;
    if (filters.establishment && x.establishment !== filters.establishment) return false;
    return true;
  });
}
