import { currentDate, getLastAttentionForCase, hasAttentionInPeriod, isPresent } from './followUp.js';
import { pendingReferralSignals } from './referralSignals.js';
import { normalizeSchedule, isOverdue } from './schedule.js';
import { ROLES } from '../data/catalogs.js';
import { canEditOperational, canViewCaseDetails, roleConfig, scopeItems } from './access.js';

// Explicit allowlists prevent future UI/technical fields from leaking into prompts.
function fields(item = {}, mapping) {
  return Object.fromEntries(mapping.split(' ').map(pair => {
    const [source, target = source] = pair.split(':');
    return [target, item[source]];
  }).filter(([, value]) => value !== undefined));
}
const territory = 'establishment:establecimiento establishmentCode:codigoEstablecimiento localOffice:oficinaLocal localOfficeCode:codigoOficinaLocal region:region regionCode:codigoRegion';
function personContext(person = {}) {
  return {
    ...fields(person, `id identification:identificacion name:nombre birthDate:fechaNacimiento age:edad sex:sexo modalities:modalidades serviceStatus:estadoServicio address:direccion source:procedencia ${territory}`),
    ...(person.guardian ? { personaEncargada: fields(person.guardian, 'name:nombre relationship:relacion identification:identificacion phone:telefono') } : {}),
  };
}

export function buildAssistantContext(state, role) {
  // Unlike roleConfig's UI fallback, unknown roles must not inherit local access.
  if (!ROLES.some(item => item.id === role)) return {};
  const cfg = roleConfig(role);
  const operational = canEditOperational(role);
  const detail = canViewCaseDetails(role);
  const people = scopeItems(state.people || [], role);
  const references = scopeItems(state.references || [], role);
  const cases = scopeItems(state.cases || [], role);
  const schedule = scopeItems(state.schedule || [], role);
  const personMap = new Map(people.map(p => [p.id, p]));
  const caseMap = new Map(cases.map(c => [c.id, c]));
  const referenceMap = new Map(references.map(r => [r.id, r]));
  const identity = (personId) => ({ personaId: personId, ...fields(personMap.get(personId), 'name:nombrePersona identification:identificacionPersona') });
  const caseIdentity = (caseId) => ({ casoId: caseId, ...identity(caseMap.get(caseId)?.personId) });
  const associated = (key, mapping) => (state[key] || []).filter(item => caseMap.has(item.caseId)).map(item => ({ ...fields(item, mapping), ...caseIdentity(item.caseId) }));
  return {
    resumen: { clientesBeneficiarias: people.length, casosAI: cases.length, casosActivos: cases.filter(c => c.status === 'Activo').length, referencias: references.length, actividadesProgramacion: schedule.length },
    clientesBeneficiarias: people.map(personContext),
    referencias: references.map(r => ({
      ...fields(r, `id consecutive:consecutivoInstitucional date:fecha type:viaAtencion origin:origen status:estado referredBy:responsable categories:categorias motives:motivos factorDetails:detallesMotivos priorActions:accionesPrevias priorResults:resultadosPrevios sentAt:fechaHoraEnvio observations:informacionComplementariaAsociadaAlMotivoDeReferencia ${territory}`),
      ...identity(r.personId),
      ...(r.snapshot ? { contextoHistorico: personContext(r.snapshot) } : {}),
      ...(detail ? fields(r, 'decisionJustification:justificacionDecision valuation:valoracion') : {}),
    })),
    casosAI: cases.map(c => ({
      ...fields(c, `id priority:prioridad status:estado openedAt:fechaApertura closedAt:fechaCierre ${territory}`), ...identity(c.personId),
      ...(detail ? {
        ...fields(c, 'referenceId:referenciaId closureReason:motivoCierre riskLevel:nivelRiesgo protectionLevel:nivelProteccion valuationSummary:resumenValoracion purposes:propositos strategies:estrategias disciplines:disciplinas frequency:frecuencia nextAction:proximaAccion nextActionDate:fechaProximaAccion'),
        ultimaAtencion: getLastAttentionForCase(state,c)?.date || 'Sin atención registrada',
        anioSeguimiento: currentDate().slice(0,4),
        sinAtencionEnPeriodo: c.status==='Activo' && !hasAttentionInPeriod(state,c,`${currentDate().slice(0,4)}-01-01`,`${currentDate().slice(0,4)}-12-31`),
        consecutivoReferencia: c.referenceConsecutive || referenceMap.get(c.referenceId)?.consecutive,
        ...(c.referenceSnapshot ? { contextoHistoricoReferencia: personContext(c.referenceSnapshot) } : {}),
      } : {}),
    })),
    reglasConsulta: 'Solo consulta. Una actividad general no programa implícitamente a ninguna persona del establecimiento. Programación Realizada no equivale a atención. Las señales institucionales son simuladas, no son diagnóstico ni caso abierto y requieren gestión humana.',
    posiblesReferenciasPendientes: pendingReferralSignals(state,role).map(s=>({...fields(s,'id source:fuente criterion:criterio resultDate:fechaResultado'),...identity(s.personId)})),
    programacion: schedule.map(item => { const s=normalizeSchedule(item); return {
      ...fields(s, `id date:fecha originalDate:fechaOriginal type:tipo title:titulo status:estado reason:motivo notes:observaciones ${territory}`),
      actividadGeneral: !s.caseIds.length && !s.personIds?.length,
      casosAsociados: s.caseIds.filter(id=>caseMap.has(id)).map(caseIdentity),
      personasAsociadas: (s.personIds||[]).filter(id=>personMap.has(id)).map(identity),
      vencida: isOverdue(s),
    }; }),
    lineaTiempo: detail ? associated('timeline', 'id date:fecha type:tipo title:titulo discipline:disciplina professional:profesional detail:detalle nextAction:proximaAccion nextDate:fechaProximaAccion groupInterventionId:atencionGrupalId') : [],
    // Sessions have no territory field: place is the registered office. Never infer
    // visibility from a single reference in a potentially mixed session.
    sesiones: operational ? (state.sessions || []).filter(s => s.place === cfg.scope && (s.referenceIds || []).every(id => referenceMap.has(id))).map(s => ({
      ...fields(s, 'id date:fecha startTime:horaInicio endTime:horaFin place:lugar participants:disciplinas status:estado agreements:acuerdos'),
      referencias: (s.referenceIds || []).map(id => ({ referenciaId: id, consecutivoReferencia: referenceMap.get(id)?.consecutive, ...identity(referenceMap.get(id)?.personId), casos: cases.filter(c => c.referenceId === id).map(c => c.id) })),
    })) : [],
    atencionesGrupales: operational ? (state.groupAttentions || []).filter(g => g.participantIds?.length && g.participantIds.every(id => personMap.has(id))).map(g => ({
      ...fields(g, 'id date:fecha type:tipo topic:tema location:lugar disciplines:disciplinas professionals:profesionales actions:acciones recommendations:recomendaciones observations:observaciones'),
      participantes: g.participantIds.map(id => ({ ...identity(id), asistencia: g.attendance?.[id], presente: isPresent(g.attendance?.[id]) })),
    })) : [],
    documentos: operational ? associated('documents', 'id name:nombre type:tipo date:fecha uploadedBy:responsable') : [],
    coordinaciones: operational ? associated('coordinations', 'id institution:institucion responsible:responsable date:fecha reason:motivo status:estado notes:observaciones') : [],
    reportes: operational ? associated('reports', 'id date:fecha type:tipo reason:motivo generatedBy:responsable') : [],
    traslados: operational ? (state.transfers || []).filter(t => t.sourceOffice === cfg.scope || t.destinationOffice === cfg.scope).map(t => ({
      ...fields(t, 'id personId:personaId sourceCaseId:casoOrigen sourceOffice:oficinaLocalOrigen destinationOffice:oficinaLocalDestino destinationEstablishment:establecimientoDestino region:region date:fecha status:estado reason:motivo'),
      // Destination users can see incoming continuity metadata even before the person moves.
      ...fields((state.people || []).find(p => p.id === t.personId), 'name:nombrePersona identification:identificacionPersona'),
    })) : [],
  };
}
