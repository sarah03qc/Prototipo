import { currentDate } from './followUp.js';
import { applyHierarchyFilters, scopeItems } from './access.js';

export function filteredSchedule(state, role, filters) {
  return applyHierarchyFilters(scopeItems(state.schedule, role), filters)
    .filter(item => !filters.status || item.status === filters.status)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function scheduleAssociationLabel(item, state) {
  if (!item.caseIds?.length && !item.personIds?.length) return 'Actividad general — sin personas programadas específicamente';
  const names = (item.caseIds || []).map(id => {
    const caseItem = state.cases.find(c => c.id === id);
    return state.people.find(p => p.id === caseItem?.personId)?.name || id;
  });
  names.push(...(item.personIds || []).map(id => state.people.find(p => p.id === id)?.name || id));
  return `Casos específicos: ${names.join(', ')}`;
}

export function normalizeSchedule(item) {
  const types = {
    'Sesión de trabajo del Equipo Interdisciplinario': 'Sesión interdisciplinaria',
    'Sesión de trabajo del EE.II.': 'Sesión interdisciplinaria',
    'Atención por establecimiento': 'Visita a establecimiento para Atención Interdisciplinaria',
  };
  return { ...item, type: types[item.type] || item.type, caseIds: [...new Set(item.caseIds || [])] };
}
export const isOverdue = (item, today = currentDate()) => item.status === 'Programada' && Boolean(item.date) && item.date < today;

export function updateScheduledActivity(item, patch) {
  if (['Cancelada', 'Reprogramada'].includes(patch.status) && !patch.reason?.trim()) return item;
  if (patch.status === 'Reprogramada' && (!patch.date || patch.date === item.date)) return item;
  return normalizeSchedule({ ...item, ...patch, originalDate: item.originalDate || item.date });
}
