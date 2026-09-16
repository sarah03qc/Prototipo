export const demoPeople = [
  { id:'PER-001', identification:'1-1111-1111', name:'Sofía Vargas Mora', birthDate:'2021-05-14', sex:'Femenino', establishment:'CINAI Los Robles', localOffice:'Oficina Local Alajuela', region:'Región Central Norte', modalities:['APC'], serviceStatus:'Activo', source:'SIDINACC (simulado)' },
  { id:'PER-002', identification:'2-2222-2222', name:'Mateo Jiménez Solano', birthDate:'2020-11-03', sex:'Masculino', establishment:'CEN La Esperanza', localOffice:'Oficina Local Alajuela', region:'Región Central Norte', modalities:['Sólo Comidas Servidas','DAF'], serviceStatus:'Activo', source:'SIDINACC (simulado)' },
  { id:'PER-003', identification:'3-3333-3333', name:'Valentina Rojas León', birthDate:'2019-08-22', sex:'Femenino', establishment:'CINAI Los Robles', localOffice:'Oficina Local Alajuela', region:'Región Central Norte', modalities:['DHAVI'], serviceStatus:'Activo', source:'SIDINACC (simulado)' },
  { id:'PER-004', identification:'4-4444-4444', name:'Daniel Pérez Campos', birthDate:'2018-02-10', sex:'Masculino', establishment:'CEN San Pablo', localOffice:'Oficina Local Heredia', region:'Región Central Norte', modalities:['Leche'], serviceStatus:'Activo', source:'SIDINACC (simulado)' },
  { id:'PER-005', identification:'5-5555-5555', name:'Emma Rodríguez Arias', birthDate:'2022-01-30', sex:'Femenino', establishment:'CINAI Los Robles', localOffice:'Oficina Local Alajuela', region:'Región Central Norte', modalities:['VAANN'], serviceStatus:'Activo', source:'SIDINACC (simulado)' },
  { id:'PER-006', identification:'6-6666-6666', name:'Julián Mora Castro', birthDate:'2020-04-18', sex:'Masculino', establishment:'CEN Las Juntas', localOffice:'Oficina Local Liberia', region:'Región Chorotega', modalities:['APC'], serviceStatus:'Activo', source:'SIDINACC (simulado)' },
  { id:'PER-007', identification:'7-7777-7777', name:'Camila Solís Vega', birthDate:'2021-12-02', sex:'Femenino', establishment:'CINAI Santa Cruz', localOffice:'Oficina Local Liberia', region:'Región Chorotega', modalities:['DHAVI'], serviceStatus:'Activo', source:'SIDINACC (simulado)' },
];

export const demoReferences = [
  { id:'REF-001', personId:'PER-002', date:'2026-09-10', type:'No inmediata', origin:'Observación directa', categories:['Desarrollo','Salud'], motives:['Riesgo o rezago','Alteraciones conductuales'], factorDetails:{'Riesgo o rezago':'Se observan dificultades persistentes en actividades esperadas para la edad.','Alteraciones conductuales':'Cambios conductuales reportados por el establecimiento y la familia.'}, observations:'La familia reporta dificultad para establecer rutinas.', status:'Recibida', referredBy:'María López — Asistente 3', establishment:'CEN La Esperanza', localOffice:'Oficina Local Alajuela', region:'Región Central Norte' },
  { id:'REF-002', personId:'PER-005', date:'2026-09-12', type:'Urgencia', origin:'Información aportada por la familia', categories:['Factores de riesgo'], motives:['Factor de riesgo hogar-familiar'], factorDetails:{'Factor de riesgo hogar-familiar':'Situación familiar que requiere valoración prioritaria.'}, observations:'Datos ficticios para demostración.', status:'Pendiente de revisión', referredBy:'Laura Sánchez — Profesional establecimiento', establishment:'CINAI Los Robles', localOffice:'Oficina Local Alajuela', region:'Región Central Norte' },
  { id:'REF-003', personId:'PER-006', date:'2026-08-21', type:'No inmediata', origin:'Vigilancia / tamizaje', categories:['Crecimiento'], motives:['Condición de malnutrición'], factorDetails:{'Condición de malnutrición':'Hallazgo registrado en vigilancia. Flujo automático definitivo aún por validar.'}, observations:'Referencia demo para Región Chorotega.', status:'Recibida', referredBy:'Asistente 3 demo', establishment:'CEN Las Juntas', localOffice:'Oficina Local Liberia', region:'Región Chorotega' },
];

export const demoCases = [
  { id:'AI-001', personId:'PER-001', referenceId:'REF-HIST-001', openedAt:'2026-08-28', status:'Activo', priority:'Moderado', purposes:['Fortalecer regulación emocional','Acompañar dinámica familiar'], strategies:['Consejería','Atención individualizada'], disciplines:['Psicología'], frequency:'Quincenal', nextAction:'Seguimiento de Psicología', nextActionDate:'2026-09-18', valuationSummary:'Riesgos moderados con factores protectores presentes.', localOffice:'Oficina Local Alajuela', establishment:'CINAI Los Robles', region:'Región Central Norte' },
  { id:'AI-002', personId:'PER-003', referenceId:'REF-HIST-002', openedAt:'2026-06-03', closedAt:'2026-09-04', status:'Cerrado', priority:'Bajo', purposes:['Fortalecer estrategias de estimulación'], strategies:['Actividad educativa','Atención grupal'], disciplines:['Educación Preescolar'], frequency:'Mensual', closureReason:'Propósitos cumplidos y factores protectores fortalecidos.', valuationSummary:'Riesgo bajo con factores protectores estables.', localOffice:'Oficina Local Alajuela', establishment:'CINAI Los Robles', region:'Región Central Norte' },
  { id:'AI-003', personId:'PER-004', referenceId:'REF-HIST-003', openedAt:'2026-07-12', closedAt:'2026-09-14', status:'Cerrado', priority:'Alto', purposes:['Dar continuidad a apoyos especializados'], strategies:['Atención individualizada','Referencia interinstitucional'], disciplines:['Nutrición','Psicología'], frequency:'Mensual', closureReason:'Cierre por traslado a Oficina Local Alajuela.', valuationSummary:'Persisten necesidades que requieren continuidad en destino.', localOffice:'Oficina Local Heredia', establishment:'CEN San Pablo', region:'Región Central Norte' },
  { id:'AI-004', personId:'PER-006', referenceId:'REF-HIST-004', openedAt:'2026-05-17', status:'Activo', priority:'Alto', purposes:['Seguimiento nutricional y familiar'], strategies:['Visita domiciliar','Consejería'], disciplines:['Nutrición'], frequency:'Mensual', nextAction:'Atención en establecimiento', nextActionDate:'2026-09-25', valuationSummary:'Caso prioritario de demostración.', localOffice:'Oficina Local Liberia', establishment:'CEN Las Juntas', region:'Región Chorotega' },
  { id:'AI-005', personId:'PER-007', referenceId:'REF-HIST-005', openedAt:'2026-04-10', status:'Activo', priority:'Bajo', purposes:['Fortalecer desarrollo'], strategies:['Actividad educativa'], disciplines:['Educación Preescolar'], frequency:'Bimensual', nextAction:'Seguimiento', nextActionDate:'2026-10-03', valuationSummary:'Factores protectores adecuados.', localOffice:'Oficina Local Liberia', establishment:'CINAI Santa Cruz', region:'Región Chorotega' },
];

export const demoTransfers = [
  { id:'TR-001', personId:'PER-004', sourceCaseId:'AI-003', sourceOffice:'Oficina Local Heredia', destinationOffice:'Oficina Local Alajuela', destinationEstablishment:'CEN La Esperanza', region:'Región Central Norte', date:'2026-09-14', status:'Pendiente de continuidad', reason:'Cambio de zona de residencia.' },
];

export const demoSessions = [
  { id:'SES-001', date:'2026-09-18', place:'Oficina Local Alajuela', startTime:'09:00', endTime:'11:00', status:'Programada', participants:['Nutrición','Psicología','Educación Preescolar'], referenceIds:['REF-001','REF-002'], agreements:[] },
  { id:'SES-002', date:'2026-09-08', place:'Oficina Local Alajuela', startTime:'09:00', endTime:'11:00', status:'Realizada', participants:['Nutrición','Psicología'], referenceIds:[], agreements:['Actualización de registros y seguimiento de casos.'] },
];

export const demoTimeline = [
  { id:'EVT-001', caseId:'AI-001', date:'2026-08-28', type:'Sesión interdisciplinaria', title:'Caso admitido a Atención Interdisciplinaria', detail:'Prioridad Moderado. Psicología como disciplina inicial.', discipline:'EE.II.', professional:'Equipo Interdisciplinario' },
  { id:'EVT-002', caseId:'AI-001', date:'2026-09-02', type:'Consejería', title:'Consejería a persona encargada', detail:'Rutinas del hogar y estrategias de regulación emocional.', discipline:'Psicología', professional:'Ana Morales' },
  { id:'EVT-003', caseId:'AI-002', date:'2026-08-19', type:'Actividad educativa', title:'Actividad educativa con familia', detail:'Estrategias de estimulación y acompañamiento.', discipline:'Educación Preescolar', professional:'Carolina Ruiz' },
  { id:'EVT-004', caseId:'AI-004', date:'2026-09-05', type:'Visita domiciliar', title:'Seguimiento nutricional', detail:'Visita de seguimiento y recomendaciones familiares.', discipline:'Nutrición', professional:'Luis Vega' },
  { id:'EVT-005', caseId:'AI-001', date:'2026-09-08', type:'Atención grupal', title:'Rutinas y regulación emocional en el hogar', detail:'Actividad grupal registrada una sola vez.', discipline:'Psicología', professional:'Ana Morales', groupInterventionId:'GRP-001' },
];

export const demoGroupAttentions = [
  { id:'GRP-001', date:'2026-09-08', type:'Actividad educativa', topic:'Rutinas y regulación emocional en el hogar', location:'CINAI Los Robles', professionals:['Ana Morales'], disciplines:['Psicología'], participantIds:['PER-001','PER-003'], attendance:{'PER-001':'Presente','PER-003':'Presente'}, actions:'Conversatorio, ejemplos y ejercicios prácticos.', recommendations:'Aplicar una rutina predecible.', observations:'' },
];

export const demoDocuments = [
  { id:'DOC-001', caseId:'AI-001', name:'Entrevista familiar.pdf', type:'Entrevista Familiar', date:'2026-08-30', uploadedBy:'Ana Morales' },
  { id:'DOC-002', caseId:'AI-001', name:'Recomendaciones psicología.pdf', type:'Recomendaciones', date:'2026-09-02', uploadedBy:'Ana Morales' },
];

export const demoCoordinations = [
  { id:'COORD-001', caseId:'AI-001', institution:'CCSS', date:'2026-09-03', reason:'Valoración institucional complementaria.', responsible:'Ana Morales', status:'En seguimiento', notes:'Registro de trazabilidad; el sistema no realiza el envío a la institución.' },
];

export const demoReports = [
  { id:'REP-001', caseId:'AI-001', date:'2026-09-10', type:'Reporte de situación atendida', reason:'Solicitud institucional de seguimiento', generatedBy:'Ana Morales' },
];

export const demoSchedule = [
  { id:'SCH-001', date:'2026-09-18', type:'Sesión interdisciplinaria', title:'Sesión ordinaria EE.II.', localOffice:'Oficina Local Alajuela', establishment:'', region:'Región Central Norte', status:'Programada', reason:'', notes:'Análisis de referencias pendientes.' },
  { id:'SCH-002', date:'2026-09-15', type:'Atención por establecimiento', title:'Atención en CINAI Los Robles', localOffice:'Oficina Local Alajuela', establishment:'CINAI Los Robles', region:'Región Central Norte', status:'Programada', reason:'', notes:'Actividad pendiente de actualizar.' },
  { id:'SCH-003', date:'2026-09-22', type:'Atención por establecimiento', title:'Gira CEN La Esperanza', localOffice:'Oficina Local Alajuela', establishment:'CEN La Esperanza', region:'Región Central Norte', status:'Programada', reason:'', notes:'' },
  { id:'SCH-004', date:'2026-09-10', type:'Sesión de trabajo del EE.II.', title:'Actualización de herramienta', localOffice:'Oficina Local Liberia', establishment:'', region:'Región Chorotega', status:'Realizada', reason:'', notes:'Sesión destinada a actualización de registros.' },
  { id:'SCH-005', date:'2026-09-28', type:'Atención por establecimiento', title:'Gira CEN Las Juntas', localOffice:'Oficina Local Liberia', establishment:'CEN Las Juntas', region:'Región Chorotega', status:'Programada', reason:'', notes:'' },
];

export const demoSyncItems = [
  { id:'SYNC-001', entity:'Atención', label:'Atención local — Sofía Vargas', status:'Pendiente de sincronizar', lastModified:'15/09/2026 10:42' },
  { id:'SYNC-002', entity:'Referencia', label:'Referencia local — Mateo Jiménez', status:'Conflicto', lastModified:'15/09/2026 11:05' },
];

export const demoOcr = {
  documentType:'Referencia A.I.', status:'Pendiente de revisión',
  fields:[
    { id:'identification', label:'Identificación', value:'1-1111-1111', confidence:.98, confirmed:true },
    { id:'name', label:'Nombre', value:'Sofía Vargas Mora', confidence:.97, confirmed:true },
    { id:'reason', label:'Motivo', value:'Cambios emocionales y conductuales', confidence:.74, confirmed:false },
  ],
};
