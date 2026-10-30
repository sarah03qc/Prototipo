import { canCreateReference, scopeItems } from './access.js';

// Demo equivalence: same person and exact catalogue motive. No clinical inference.
export function pendingReferralSignals(state, role) {
  if (!canCreateReference(role)) return [];
  const people = scopeItems(state.people || [], role);
  const references = scopeItems(state.references || [], role);
  return (state.institutionalReferralSignals || []).filter(signal => people.some(p => p.id === signal.personId) && !references.some(r => r.personId === signal.personId && r.motives?.includes(signal.criterion)));
}
