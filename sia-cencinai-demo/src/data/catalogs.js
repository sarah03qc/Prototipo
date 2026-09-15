export const ROLES = [
  { id: 'EEII_LOCAL', label: 'Profesional EE.II. / Oficina Local', scope: 'Nivel Local' },
  { id: 'JEFATURA_OL', label: 'Jefatura de Oficina Local', scope: 'Nivel Local' },
  { id: 'ATE_REGIONAL', label: 'ATE / Dirección Regional', scope: 'Nivel Regional' },
  { id: 'NIVEL_NACIONAL', label: 'UIVCD / UNAT', scope: 'Nivel Nacional' },
];

export const CASE_STATUSES = [
  'Pendiente de análisis',
  'No requiere A.I.',
  'Activo',
  'En seguimiento',
  'Pendiente de información',
  'En traslado',
  'Cerrado',
];

export const PRIORITIES = ['Urgencia', 'Alto', 'Moderado', 'Bajo'];

export const DISCIPLINES = [
  'Nutrición',
  'Psicología',
  'Educación Preescolar',
  'Terapia de Lenguaje',
  'Terapia Física',
  'Otra',
];

export const STRATEGIES = [
  'Atención individualizada',
  'Consejería',
  'Visita domiciliar',
  'Atención en contexto',
  'Atención grupal',
  'Actividad educativa',
  'Actividad comunitaria',
  'Sesión de Apoyo',
  'Referencia interinstitucional',
  'Otra',
];

export const REFERENCE_TYPES = ['Urgencia', 'No inmediata'];

export const DETECTION_ORIGINS = [
  'Vigilancia / tamizaje',
  'Observación directa',
  'Información aportada por la familia',
  'Referencia externa',
  'Otro',
];

export const REFERENCE_MOTIVES = {
  Crecimiento: [
    'Condición de malnutrición',
    'Malnutrición con necesidades especiales',
    'Otra alteración del crecimiento',
  ],
  Desarrollo: [
    'Riesgo o rezago',
    'Resultado EDIN II que requiere análisis',
    'Hallazgo EVADE',
    'Otra alteración del desarrollo',
  ],
  Salud: [
    'Alteración visual',
    'Alteración auditiva',
    'Alteración del lenguaje',
    'Alteración motora',
    'Alteración de salud oral',
    'Alergia alimentaria',
    'Enfermedad crónica',
    'Lactancia materna / alimentación complementaria',
    'Trastorno específico del aprendizaje',
    'Sospecha o diagnóstico de trastorno del neurodesarrollo',
    'Alteraciones emocionales',
    'Alteraciones conductuales',
    'Otra condición de salud',
  ],
  'Factores de riesgo': [
    'Factor de riesgo individual',
    'Factor de riesgo hogar-familiar',
    'Factor de riesgo comunitario',
    'Otro factor de riesgo',
  ],
};

export const RISK_MATRIX = {
  Individual: {
    protectores: [
      'Autoestima positiva y habilidades sociales',
      'Buen manejo emocional y autocontrol',
      'Vínculos positivos',
      'Adecuado estado nutricional',
      'Controles de salud al día',
      'Logros del desarrollo acordes con su condición',
      'Participación en actividades deportivas o culturales',
      'Apertura y receptividad para recibir ayuda',
    ],
    riesgos: [
      'Baja autoestima',
      'Dificultades en el control de impulsos',
      'Rezago o riesgo de retraso en el desarrollo',
      'Condición de malnutrición',
      'Enfermedad crónica',
      'Discapacidad sin apoyos suficientes',
      'Dificultades de lenguaje',
      'Exposición a violencia',
      'Alteraciones emocionales o conductuales',
    ],
    alertas: [
      'Resultado rojo o amarillo en EDIN II',
      'Hallazgo relevante en EVADE',
      'Conductas agresivas o regresivas',
      'Cambios emocionales importantes',
      'Alteración persistente del desarrollo',
      'Dificultades de comunicación o interacción',
      'Cambios importantes de apetito o peso',
      'Enfermedades recurrentes',
    ],
  },
  'Hogar-Familiar': {
    protectores: [
      'Figuras cuidadoras positivas',
      'Crianza respetuosa',
      'Vínculos afectivos seguros',
      'Redes de apoyo familiares',
      'Participación activa en el proceso de atención',
      'Seguridad económica básica y empleo',
      'Acceso a vivienda y servicios básicos',
    ],
    riesgos: [
      'Sobrecarga de la persona cuidadora',
      'Crianza rígida o excesivamente permisiva',
      'Ausencia de vínculos afectivos seguros',
      'Antecedentes o presencia de maltrato, negligencia o abandono',
      'Conflictos familiares',
      'Ausencia de redes de apoyo',
      'Violencia intrafamiliar',
      'Pobreza o inestabilidad económica',
      'Hacinamiento',
    ],
    alertas: [
      'Necesidades básicas insatisfechas',
      'Ausencias reiteradas a salud o educación',
      'Ambiente familiar tenso',
      'Gritos, golpes u otras manifestaciones de violencia',
      'Consumo problemático de sustancias',
      'Vivienda en malas condiciones',
    ],
  },
  Comunitario: {
    protectores: [
      'Entorno comunitario seguro e inclusivo',
      'Disponibilidad de transporte público',
      'Acceso a servicios de educación, salud y cuidado',
      'Centros recreativos',
      'Presencia de instituciones sociales y de seguridad',
      'Redes de apoyo comunal',
    ],
    riesgos: [
      'Alta inseguridad ciudadana',
      'Dificultad de acceso a transporte público',
      'Pocos o nulos servicios de educación, salud y cuidado',
      'Acceso limitado a agua potable, electricidad o saneamiento',
      'Pocos o nulos centros recreativos',
      'Presencia de riesgos sociales',
      'Riesgo por fenómenos naturales',
    ],
    alertas: [
      'Limitación para movilizarse de manera segura',
      'Poca o nula presencia de servicios esenciales',
      'Problemas graves de higiene o habitabilidad',
      'Exposición recurrente a violencia comunitaria',
      'Interrupción de servicios por fenómenos naturales',
    ],
  },
};

export const DOCUMENTS = [
  { id: 'ref-ai', name: 'Boleta de Referencia para A.I.', state: 'Borrador 2026', code: 'DNCC-DT-UNAT-F-27' },
  { id: 'case-cover', name: 'Carátula Expediente A.I.', state: 'Borrador 2026', code: 'Por confirmar' },
  { id: 'valuation', name: 'Boleta de Valoración Situacional', state: 'Borrador 2026', code: 'DINCC-DT-UNAT-F-28 (por verificar)' },
  { id: 'minutes', name: 'Minuta de Sesión Interdisciplinaria', state: 'Borrador 2026', code: 'Formato borrador' },
  { id: 'family-interview', name: 'Entrevista Familiar', state: 'Operativo local/regional', code: 'Formato regional observado' },
  { id: 'attention', name: 'Hoja de Atención', state: 'Operativo', code: 'Formato regional observado' },
  { id: 'followup', name: 'Hoja de Seguimiento', state: 'Operativo', code: 'Formato regional observado' },
  { id: 'psych', name: 'Recomendaciones de Psicología', state: 'Operativo', code: 'Formato regional' },
  { id: 'support', name: 'Sesión de Apoyo', state: 'Operativo', code: 'Instrumentos regionales' },
  { id: 'external-ref', name: 'Referencia Interinstitucional', state: 'Vigente', code: 'DNCC-DT-UIVCD-F-02' },
  { id: 'counter-ref', name: 'Contra-Referencia Interinstitucional', state: 'Vigente', code: 'DMNEC-DT-UMNCD-F-03' },
  { id: 'complaint', name: 'Boleta de Denuncia', state: 'Vigente', code: 'DNCC-DT-UIVCD-F-04' },
  { id: 'event', name: 'Registro de Eventos y Situaciones', state: 'Vigente', code: 'DNCC-DT-UNAT-F-18' },
  { id: 'report', name: 'Reporte de A.I. / situación atendida', state: 'Pendiente de normalización', code: 'Formato definitivo pendiente' },
];

export const LOCAL_OFFICES = [
  'Oficina Local Alajuela',
  'Oficina Local Heredia',
  'Oficina Local Desamparados',
  'Oficina Local Liberia',
];

export const EXTERNAL_INSTITUTIONS = ['CCSS', 'MEP', 'PANI', 'INAMU', 'INA', 'IAFA', 'IMAS', 'MTSS', 'OAPVD', 'Otra'];
