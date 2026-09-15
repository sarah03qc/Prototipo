import { useEffect, useMemo, useState } from 'react';
import {
  demoCases,
  demoGroupInterventions,
  demoOcr,
  demoPeople,
  demoQualitySubmissions,
  demoReferences,
  demoSessions,
  demoSyncItems,
  demoTimeline,
} from '../data/mockData';

const STORAGE_KEY = 'sia-cencinai-prototype-v2';

const initialState = {
  people: demoPeople,
  references: demoReferences,
  cases: demoCases,
  sessions: demoSessions,
  timeline: demoTimeline,
  groupInterventions: demoGroupInterventions,
  qualitySubmissions: demoQualitySubmissions,
  syncItems: demoSyncItems,
  ocr: demoOcr,
  connection: 'online',
};

export function usePrototypeStore() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const actions = useMemo(() => ({
    resetDemo() {
      setState(initialState);
    },
    setConnection(connection) {
      setState((prev) => ({ ...prev, connection }));
    },
    addReference(reference) {
      setState((prev) => ({ ...prev, references: [{ ...reference, id: `REF-DEMO-${Date.now()}` }, ...prev.references] }));
    },
    updateReference(id, patch) {
      setState((prev) => ({ ...prev, references: prev.references.map((r) => r.id === id ? { ...r, ...patch } : r) }));
    },
    addSession(session) {
      setState((prev) => ({ ...prev, sessions: [{ ...session, id: `SES-DEMO-${Date.now()}` }, ...prev.sessions] }));
    },
    updateSession(id, patch) {
      setState((prev) => ({ ...prev, sessions: prev.sessions.map((s) => s.id === id ? { ...s, ...patch } : s) }));
    },
    createCaseFromReference(referenceId, payload) {
      setState((prev) => {
        const reference = prev.references.find((r) => r.id === referenceId);
        if (!reference) return prev;
        const id = `AI-DEMO-${Date.now()}`;
        return {
          ...prev,
          references: prev.references.map((r) => r.id === referenceId ? { ...r, status: 'Admitida a A.I.' } : r),
          cases: [{ id, personId: reference.personId, referenceId, openedAt: payload.openedAt, status: 'Activo', ...payload }, ...prev.cases],
          timeline: [{
            id: `EVT-${Date.now()}`,
            caseId: id,
            date: payload.openedAt,
            type: 'Sesión interdisciplinaria',
            title: 'Caso admitido a Atención Interdisciplinaria',
            detail: `Prioridad ${payload.priority}. ${payload.valuationSummary || ''}`,
            discipline: 'EE.II.',
          }, ...prev.timeline],
        };
      });
    },
    addAttention(caseId, attention) {
      setState((prev) => ({
        ...prev,
        timeline: [{ id: `EVT-${Date.now()}`, caseId, ...attention }, ...prev.timeline],
      }));
    },
    addGroupIntervention(intervention) {
      const id = `GRP-DEMO-${Date.now()}`;
      setState((prev) => {
        const newTimeline = intervention.participantIds.flatMap((personId) => {
          const personCases = prev.cases.filter((c) => c.personId === personId && c.status !== 'Cerrado');
          return personCases.map((c) => ({
            id: `EVT-${Date.now()}-${c.id}`,
            caseId: c.id,
            date: intervention.date,
            type: intervention.type,
            title: intervention.topic,
            detail: `${intervention.actions || ''}${intervention.recommendations ? ` Recomendaciones: ${intervention.recommendations}` : ''}`,
            discipline: intervention.disciplines?.join(', ') || 'Interdisciplinaria',
            groupInterventionId: id,
          }));
        });
        return {
          ...prev,
          groupInterventions: [{ ...intervention, id }, ...prev.groupInterventions],
          timeline: [...newTimeline, ...prev.timeline],
        };
      });
    },
    closeCase(caseId, payload) {
      setState((prev) => ({
        ...prev,
        cases: prev.cases.map((c) => c.id === caseId ? { ...c, status: 'Cerrado', closedAt: payload.date, closureReason: payload.reason } : c),
        timeline: [{ id: `EVT-${Date.now()}`, caseId, date: payload.date, type: 'Cierre', title: 'Caso de A.I. cerrado', detail: payload.reason, discipline: 'EE.II.' }, ...prev.timeline],
      }));
    },
    updateQuality(id, status, note) {
      setState((prev) => ({
        ...prev,
        qualitySubmissions: prev.qualitySubmissions.map((q) => q.id === id ? { ...q, status, notes: note ? [...q.notes, note] : q.notes } : q),
      }));
    },
    syncAll() {
      setState((prev) => ({ ...prev, connection: 'online', syncItems: prev.syncItems.map((s) => ({ ...s, status: 'Sincronizado' })) }));
    },
    updateOcrField(id, patch) {
      setState((prev) => ({ ...prev, ocr: { ...prev.ocr, fields: prev.ocr.fields.map((f) => f.id === id ? { ...f, ...patch } : f) } }));
    },
  }), []);

  return { state, actions };
}
