// Codes are illustrative demo values, not an institutional directory.
export const DEMO_LOCATIONS = {
  'CINAI Los Robles': { regionCode: 'CN', localOfficeCode: '101', establishmentCode: '1010102' },
  'CEN La Esperanza': { regionCode: 'CN', localOfficeCode: '101', establishmentCode: '1010103' },
  'CEN San Pablo': { regionCode: 'CN', localOfficeCode: '102', establishmentCode: '1020101' },
  'CEN Las Juntas': { regionCode: 'CH', localOfficeCode: '201', establishmentCode: '2010101' },
  'CINAI Santa Cruz': { regionCode: 'CH', localOfficeCode: '201', establishmentCode: '2010102' },
};

export function ageAtDate(birthDate, date) {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const at = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(birth.getTime()) || !Number.isFinite(at.getTime()) || at < birth) return '—';
  let months = (at.getUTCFullYear() - birth.getUTCFullYear()) * 12 + at.getUTCMonth() - birth.getUTCMonth();
  if (at.getUTCDate() < birth.getUTCDate()) months--;
  return `${Math.floor(months / 12)} años, ${months % 12} meses`;
}

export function createReferenceSnapshot(person = {}, date) {
  return {
    name: person.name || '', identification: person.identification || '',
    birthDate: person.birthDate || '', sex: person.sex || '',
    modalities: [...(person.modalities || [])], establishment: person.establishment || '',
    localOffice: person.localOffice || '', region: person.region || '',
    ...DEMO_LOCATIONS[person.establishment],
    address: person.address || '', guardian: { ...(person.guardian || {}) },
    age: ageAtDate(person.birthDate, date),
  };
}

export function referenceContext(reference, person) {
  return reference.snapshot || createReferenceSnapshot({
    ...person,
    establishment: reference.establishment || person?.establishment,
    localOffice: reference.localOffice || person?.localOffice,
    region: reference.region || person?.region,
  }, reference.date);
}

export function nextReferenceConsecutive(person, date, references = []) {
  const codes = DEMO_LOCATIONS[person?.establishment] || person || {};
  const year = String(date).slice(0, 4);
  const prefix = `DNCC-DR${codes.regionCode || 'CN'}-OL${codes.localOfficeCode || '101'}-${codes.establishmentCode || '1010102'}-REF-`;
  const numbers = references.map(reference => reference.consecutive || '')
    .filter(value => value.startsWith(prefix) && value.endsWith(`-${year}`))
    .map(value => Number(value.slice(prefix.length).split('-')[0]) || 0);
  return `${prefix}${String(Math.max(0, ...numbers) + 1).padStart(3, '0')}-${year}`;
}

export function referenceIdentityRows(context) {
  return [
    ['Cliente/beneficiaria', context.name], ['Identificación', context.identification],
    ['Fecha de nacimiento', context.birthDate], ['Edad al momento de la referencia', context.age],
    ['Sexo', context.sex], ['Modalidades/servicios', context.modalities?.join(', ')],
    ['Establecimiento', context.establishment], ['Oficina Local', context.localOffice], ['Región', context.region],
    ['Persona encargada', context.guardian?.name], ['Relación', context.guardian?.relationship],
    ['Contacto registrado', context.guardian?.phone], ['Dirección registrada', context.address],
  ];
}

// Compatibility for references saved in earlier versions of this local demo.
export function normalizeReferenceMotives(reference) {
  const replacements = {
    'Riesgo o rezago': 'EDIN II: riesgo de retraso (rojo)',
    'Resultado EDIN II que requiere análisis': 'EDIN II: riesgo de retraso (rojo)',
    'Hallazgo EVADE': 'EVADE: riesgo de rezago (0,1 sin logro de edad anterior)',
    'Otra alteración del desarrollo': 'EVADE: riesgo de rezago (0,1 sin logro de edad anterior)',
  };
  return {
    ...reference,
    motives: [...new Set((reference.motives || []).filter(m => m !== 'Otro factor de riesgo').map(m => replacements[m] || m))],
    factorDetails: Object.fromEntries(Object.entries(reference.factorDetails || {}).filter(([m]) => m !== 'Otro factor de riesgo').map(([m, detail]) => [replacements[m] || m, detail])),
  };
}
