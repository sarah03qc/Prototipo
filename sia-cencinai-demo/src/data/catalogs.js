export const ROLES = [
  { id: 'ESTABLISHMENT', label: 'Profesional / Asistente 3 — Establecimiento', scope: 'CINAI Los Robles', level: 'establishment' },
  { id: 'EEII_LOCAL', label: 'Profesional del Equipo Interdisciplinario — Oficina Local', scope: 'Oficina Local Alajuela', level: 'local' },
  { id: 'JEFATURA_OL', label: 'Jefatura — Oficina Local', scope: 'Oficina Local Alajuela', level: 'local' },
  { id: 'ATE_REGIONAL', label: 'ATE / Dirección Regional', scope: 'Región Central Norte', level: 'regional' },
  { id: 'NIVEL_NACIONAL', label: 'UIVCD / UNAT — Nivel Nacional', scope: 'Costa Rica', level: 'national' },
  { id: 'ESTABLISHMENT_ASSISTANT2', label: 'Asistente 2 — Establecimiento', scope: 'CINAI Los Robles', level: 'establishment' },
];

export const CASE_STATUSES = ['Pendiente de análisis', 'Activo', 'Cerrado', 'Pendiente de continuidad'];
export const PRIORITIES = ['Alto', 'Moderado', 'Bajo'];
export const RISK_LEVELS = ['Alto', 'Moderado', 'Bajo'];
export const PROTECTION_LEVELS = ['Alta', 'Moderada', 'Baja'];
export const PRIORITY_MATRIX = {
  Alto: { Baja: 'Alto', Moderada: 'Alto', Alta: 'Moderado' },
  Moderado: { Baja: 'Alto', Moderada: 'Moderado', Alta: 'Moderado' },
  Bajo: { Baja: 'Moderado', Moderada: 'Bajo', Alta: 'Bajo' },
};
export function calculatePriority(riskLevel, protectionLevel) {
  return PRIORITY_MATRIX[riskLevel]?.[protectionLevel] || '';
}
export const DISCIPLINES = ['Nutrición', 'Psicología', 'Educación Preescolar', 'Terapia de Lenguaje', 'Terapia Física'];
export const STRATEGIES = [
  'Atención individualizada', 'Consejería', 'Visita domiciliar', 'Atención en contexto',
  'Atención grupal', 'Actividad educativa', 'Actividad comunitaria', 'Sesión de Apoyo',
  'Referencia interinstitucional', 'Otra',
];
export const REFERENCE_TYPES = ['Urgencia', 'No inmediata'];
export const DETECTION_ORIGINS = ['Vigilancia / tamizaje', 'Observación', 'Información aportada por la familia u otros', 'Referencia externa'];

export const REFERENCE_MOTIVES = {
  Crecimiento: ['Condición de malnutrición', 'Malnutrición con necesidades especiales'],
  Desarrollo: ['EDIN II: riesgo de retraso (rojo)', 'EVADE: riesgo de rezago (0,1 sin logro de edad anterior)'],
  Salud: [
    'Alteración visual', 'Alteración auditiva', 'Alteración del lenguaje', 'Alteración motora',
    'Alteración de salud oral', 'Alergia alimentaria', 'Enfermedad crónica',
    'Lactancia materna / alimentación complementaria', 'Trastorno específico del aprendizaje',
    'Sospecha o diagnóstico de trastorno del neurodesarrollo', 'Alteraciones emocionales',
    'Alteraciones conductuales', 'Otra condición de salud',
  ],
  'Factores de riesgo': ['Factor de riesgo individual', 'Factor de riesgo hogar-familiar', 'Factor de riesgo comunitario'],
};

export const RISK_MATRIX = {
  Individual: {
    protectores: ['Autoestima positiva y habilidades sociales', 'Buen manejo emocional y autocontrol', 'Vínculos positivos', 'Adecuado estado nutricional', 'Controles de salud al día', 'Logros del desarrollo acordes con su condición', 'Participación en actividades deportivas o culturales', 'Apertura y receptividad para recibir ayuda', 'Otro factor protector'],
    riesgos: ['Baja autoestima', 'Dificultades en el control de impulsos', 'Rezago o riesgo de retraso en el desarrollo', 'Condición de malnutrición', 'Enfermedad crónica', 'Discapacidad sin apoyos suficientes', 'Dificultades de lenguaje', 'Exposición a violencia', 'Alteraciones emocionales o conductuales', 'Otro factor de riesgo'],
    alertas: ['Resultado rojo o amarillo en EDIN II', 'Hallazgo relevante en EVADE', 'Conductas agresivas o regresivas', 'Cambios emocionales importantes', 'Alteración persistente del desarrollo', 'Dificultades de comunicación o interacción', 'Cambios importantes de apetito o peso', 'Enfermedades recurrentes', 'Otro signo de alerta'],
  },
  'Hogar-Familiar': {
    protectores: ['Figuras cuidadoras positivas', 'Crianza respetuosa', 'Vínculos afectivos seguros', 'Redes de apoyo familiares', 'Participación activa en el proceso de atención', 'Seguridad económica básica y empleo', 'Acceso a vivienda y servicios básicos', 'Otro factor protector'],
    riesgos: ['Sobrecarga de la persona cuidadora', 'Crianza rígida o excesivamente permisiva', 'Ausencia de vínculos afectivos seguros', 'Antecedentes o presencia de maltrato, negligencia o abandono', 'Conflictos familiares', 'Ausencia de redes de apoyo', 'Violencia intrafamiliar', 'Pobreza o inestabilidad económica', 'Hacinamiento', 'Otro factor de riesgo'],
    alertas: ['Necesidades básicas insatisfechas', 'Ausencias reiteradas a salud o educación', 'Ambiente familiar tenso', 'Gritos, golpes u otras manifestaciones de violencia', 'Consumo problemático de sustancias', 'Vivienda en malas condiciones', 'Otro signo de alerta'],
  },
  Comunitario: {
    protectores: ['Entorno comunitario seguro e inclusivo', 'Disponibilidad de transporte público', 'Acceso a servicios de educación, salud y cuidado', 'Centros recreativos', 'Presencia de instituciones sociales y de seguridad', 'Redes de apoyo comunal', 'Otro factor protector'],
    riesgos: ['Alta inseguridad ciudadana', 'Dificultad de acceso a transporte público', 'Pocos o nulos servicios de educación, salud y cuidado', 'Acceso limitado a agua potable, electricidad o saneamiento', 'Pocos o nulos centros recreativos', 'Presencia de riesgos sociales', 'Riesgo por fenómenos naturales', 'Otro factor de riesgo'],
    alertas: ['Limitación para movilizarse de manera segura', 'Poca o nula presencia de servicios esenciales', 'Problemas graves de higiene o habitabilidad', 'Exposición recurrente a violencia comunitaria', 'Interrupción de servicios por fenómenos naturales', 'Otro signo de alerta'],
  },
};

export const EXTERNAL_INSTITUTIONS = ['CCSS', 'MEP', 'PANI', 'INAMU', 'INA', 'IAFA', 'IMAS', 'MTSS', 'OAPVD', 'Otra'];
export const SCHEDULE_TYPES = ['Sesión interdisciplinaria', 'Sesión de trabajo del EE.II.', 'Atención por establecimiento', 'Visita domiciliar', 'Otra atención'];
export const SCHEDULE_STATUSES = ['Programada', 'Realizada', 'Reprogramada', 'Cancelada'];
