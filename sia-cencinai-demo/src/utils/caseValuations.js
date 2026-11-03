import { calculatePriority } from '../data/catalogs.js';
import { canEditOperational, scopeItems } from './access.js';
import { pendingFactorCategories } from './valuation.js';

export function valuationHistory(caseItem) {
  return caseItem.valuations || [{
    id:`${caseItem.id}-V1`, version:1, caseId:caseItem.id, date:caseItem.openedAt,
    sessionId:caseItem.sessionId, responsible:'Equipo Interdisciplinario',
    ...caseItem.valuation, riskLevel:caseItem.riskLevel, protectionLevel:caseItem.protectionLevel,
    priority:caseItem.priority, summary:caseItem.valuationSummary,
  }];
}

export function reassessCase(state, role, caseId, sessionId, valuation, date) {
  const item = scopeItems(state.cases, role).find(c=>c.id===caseId);
  const session = state.sessions.find(s=>s.id===sessionId && (s.localOffice || s.place)===item?.localOffice);
  const priority = calculatePriority(valuation.riskLevel, valuation.protectionLevel);
  if (!canEditOperational(role) || item?.status!=='Activo' || !session || !priority || pendingFactorCategories(valuation.selected).length) return state;
  const history = valuationHistory(item);
  const version = history.length+1;
  const record = {...structuredClone(valuation), id:`${caseId}-V${version}`, version, caseId, sessionId,
    date, priority, responsible:'Equipo Interdisciplinario'};
  return {...state,
    cases:state.cases.map(c=>c.id!==caseId?c:{...c, valuations:[...history,record],
      valuation:{selected:record.selected,details:record.details}, riskLevel:record.riskLevel,
      protectionLevel:record.protectionLevel, priority, valuationSummary:record.summary}),
    timeline:[{id:record.id,caseId,date,type:'Sesión interdisciplinaria',title:'Nueva valoración interdisciplinaria',
      detail:`Prioridad anterior: ${item.priority}. Prioridad vigente: ${priority}.`, professional:record.responsible, discipline:'EE.II.'}, ...state.timeline],
  };
}
