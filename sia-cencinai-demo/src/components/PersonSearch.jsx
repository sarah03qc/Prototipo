import React, { useMemo, useState } from 'react';
import { Search, UserRound, X } from 'lucide-react';
import { scopeItems } from '../utils/access';
import { inputClass } from './ui';

export default function PersonSearch({ people, role, value, onSelect, label = 'Buscar persona', placeholder = 'Identificación o nombre', compact = false }) {
  const [query, setQuery] = useState('');
  const scoped = useMemo(() => scopeItems(people, role), [people, role]);
  const selected = people.find((p) => p.id === value);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return scoped.filter((p) => p.identification.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, scoped]);

  if (selected) {
    return <div className="border border-teal-200 bg-teal-50/60 rounded-xl p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-teal-700"><UserRound size={17}/></div>
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{selected.name}</p><p className="text-xs text-stone-500">{selected.identification} · {selected.establishment}</p></div>
      <button type="button" onClick={() => { onSelect(null); setQuery(''); }} className="p-2 rounded-lg hover:bg-white"><X size={15}/></button>
    </div>;
  }

  return <div className="relative">
    {!compact && <label className="block text-xs font-semibold text-stone-700 mb-1.5">{label}</label>}
    <Search size={15} className="absolute left-3 top-[11px] text-stone-400"/>
    <input value={query} onChange={(e)=>setQuery(e.target.value)} className={`${inputClass} pl-9`} placeholder={placeholder}/>
    {query && <div className="absolute z-40 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto">
      {results.length ? results.map((p)=><button type="button" key={p.id} onClick={()=>{onSelect(p.id);setQuery('')}} className="w-full text-left px-3 py-2.5 hover:bg-stone-50 border-b border-stone-100 last:border-0"><p className="text-sm font-semibold">{p.name}</p><p className="text-xs text-stone-500">{p.identification} · {p.establishment}</p></button>) : <p className="p-3 text-xs text-stone-500">Sin coincidencias dentro de su ámbito.</p>}
    </div>}
  </div>;
}
