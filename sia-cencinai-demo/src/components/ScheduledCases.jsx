import React, { useState } from 'react';
import { inputClass } from './ui';

export default function ScheduledCases({ state, localOffice, caseIds = [], onChange }) {
  const [query, setQuery] = useState('');
  const available = state.cases.filter(c => c.localOffice === localOffice && c.status === 'Activo');
  const person = c => state.people.find(p => p.id === c.personId);
  const q = query.trim().toLocaleLowerCase('es');
  const results = q ? available.filter(c => !caseIds.includes(c.id) && [person(c)?.name, person(c)?.identification].some(v => v?.toLocaleLowerCase('es').includes(q))).slice(0, 8) : [];
  return <div className="space-y-2"><p className="text-xs font-semibold">Casos/personas específicas — opcional</p><input aria-label="Buscar casos para programación" className={inputClass} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por identificación o nombre en la Oficina Local"/>{results.map(c => <button type="button" className="block text-sm text-teal-700" key={c.id} onClick={() => { onChange([...caseIds, c.id]); setQuery(''); }}>{person(c)?.name} · {person(c)?.identification}</button>)}{caseIds.map(id => { const c = state.cases.find(c => c.id === id); return <p key={id} className="text-sm">{c ? person(c)?.name : id} <button type="button" className="text-xs text-red-700" onClick={() => onChange(caseIds.filter(x => x !== id))}>Quitar</button></p>; })}{!caseIds.length && <p className="text-xs text-stone-500">Actividad general. No hay personas programadas específicamente.</p>}</div>;
}
