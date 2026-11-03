import React, { useState } from 'react';
import { PageHeader, SectionCard, inputClass } from '../components/ui';
import { canCreateReference, scopeItems } from '../utils/access';
import { pendingReferralSignals } from '../utils/referralSignals';

export default function PossibleReferencesPage({state, role, onNavigate}) {
  const [filters, setFilters] = useState({query:'', establishment:'', date:'', criterion:''});
  const [page, setPage] = useState(0);
  if (!canCreateReference(role)) return null;
  const people = scopeItems(state.people, role);
  const pending = new Set(pendingReferralSignals(state, role).map(signal => signal.id));
  const rows = (state.institutionalReferralSignals || []).flatMap(signal => {
    const person = people.find(item => item.id === signal.personId);
    return person ? [{signal, person}] : [];
  });
  const filtered = rows.filter(({signal, person}) =>
    (person.name + ' ' + person.identification).toLowerCase().includes(filters.query.trim().toLowerCase()) &&
    (!filters.establishment || person.establishment === filters.establishment) &&
    (!filters.date || signal.resultDate === filters.date) &&
    (!filters.criterion || signal.criterion === filters.criterion));
  const update = (key, value) => { setFilters({...filters, [key]:value}); setPage(0); };
  const size = 8;
  const current = Math.min(page, Math.max(0, Math.ceil(filtered.length / size) - 1));
  return <div className="space-y-5"><PageHeader title="Posibles referencias"/>
    <SectionCard title={`${filtered.length} resultados`}>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <input className={inputClass} aria-label="Buscar por nombre o identificación" placeholder="Nombre o identificación" value={filters.query} onChange={e=>update('query',e.target.value)}/>
        <input className={inputClass} aria-label="Fecha de detección" type="date" value={filters.date} onChange={e=>update('date',e.target.value)}/>
        {Object.entries({establishment:['Establecimiento',rows.map(row=>row.person.establishment)],criterion:['Criterio',rows.map(row=>row.signal.criterion)]}).map(([key,[label,values]])=><select key={key} aria-label={label} className={inputClass} value={filters[key]} onChange={e=>update(key,e.target.value)}><option value="">{label}</option>{[...new Set(values)].sort().map(value=><option key={value}>{value}</option>)}</select>)}
      </div>
      {filtered.length===0&&<p className="text-sm text-stone-500">Sin resultados.</p>}
      <ul className="space-y-2">{filtered.slice(current*size,(current+1)*size).map(({signal,person})=><li key={signal.id} className="border rounded-xl p-3 flex flex-wrap justify-between gap-3">
        <div><p className="font-semibold">{person.name} · {person.identification}</p><p className="text-sm text-stone-600">{person.establishment} · {signal.source} · {signal.criterion} · {signal.resultDate}</p><p className="text-xs">{pending.has(signal.id)?'Pendiente':'Gestionada'}</p></div>
        {pending.has(signal.id)&&<button className="text-sm font-semibold text-teal-700" onClick={()=>onNavigate('references',{newReference:true,signal})}>Crear referencia</button>}
      </li>)}</ul>
      {filtered.length>size&&<div className="flex justify-between mt-4 text-sm"><button disabled={!current} onClick={()=>setPage(current-1)}>Anterior</button><span>{current+1} / {Math.ceil(filtered.length/size)}</span><button disabled={(current+1)*size>=filtered.length} onClick={()=>setPage(current+1)}>Siguiente</button></div>}
    </SectionCard></div>;
}
