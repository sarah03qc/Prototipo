import React, { useMemo, useState } from 'react';
import { ChevronRight, Search, UserRound, Users } from 'lucide-react';
import { Badge, PageHeader, PriorityBadge, SectionCard, SourceBadge, StatusBadge, TimelineDot, inputClass } from '../components/ui';

function ageFromBirthDate(birthDate) {
  const birth = new Date(`${birthDate}T00:00:00`);
  const now = new Date('2026-09-15T00:00:00');
  let years = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) years -= 1;
  return `${years} años`;
}

export default function PeoplePage({ state, onNavigate }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(state.people[0]?.id);
  const [tab, setTab] = useState('summary');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.people;
    return state.people.filter((p) => [p.name, p.identification, p.establishment].some((v) => v.toLowerCase().includes(q)));
  }, [query, state.people]);

  const selected = state.people.find((p) => p.id === selectedId) || filtered[0];
  const cases = state.cases.filter((c) => c.personId === selected?.id);
  const currentCase = cases.find((c) => c.status !== 'Cerrado') || cases[0];
  const timeline = currentCase ? state.timeline.filter((t) => t.caseId === currentCase.id).sort((a, b) => b.date.localeCompare(a.date)) : [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Identidad y expediente lógico" title="Personas" description="Buscar primero, reutilizar datos maestros y evitar crear identidades duplicadas." />

      <div className="grid xl:grid-cols-[360px_1fr] gap-5 items-start">
        <SectionCard title="Buscar persona" description="La identificación es la llave preferente cuando está disponible.">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-3 text-stone-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} pl-9`} placeholder="Cédula, nombre o establecimiento" />
          </div>
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => { setSelectedId(p.id); setTab('summary'); }} className={`w-full text-left rounded-xl border p-3 transition-all ${selected?.id === p.id ? 'border-teal-300 bg-teal-50/60' : 'border-stone-200 hover:bg-stone-50'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center"><UserRound size={16} className="text-stone-500" /></div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{p.name}</p><p className="text-xs font-mono text-stone-500">{p.identification}</p><p className="text-xs text-stone-400 mt-1 truncate">{p.establishment}</p></div>
                  <ChevronRight size={15} className="text-stone-300 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        {selected && (
          <div className="space-y-5">
            <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-teal-800 to-teal-700 text-white">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div><p className="text-xs text-teal-100 font-medium">Persona usuaria · datos ficticios</p><h3 className="text-xl font-bold mt-1">{selected.name}</h3><p className="text-sm font-mono text-teal-100 mt-1">{selected.identification}</p></div>
                  <div className="flex gap-2 flex-wrap"><Badge tone="green">Servicio {selected.serviceStatus}</Badge><StatusBadge status={selected.caseStatus} /></div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-xs text-stone-400">Fecha de nacimiento</p><p className="font-semibold mt-1">{selected.birthDate}</p></div>
                  <div><p className="text-xs text-stone-400">Edad calculada</p><p className="font-semibold mt-1">{ageFromBirthDate(selected.birthDate)}</p></div>
                  <div><p className="text-xs text-stone-400">Establecimiento</p><p className="font-semibold mt-1">{selected.establishment}</p></div>
                  <div><p className="text-xs text-stone-400">Modalidad(es)</p><p className="font-semibold mt-1">{selected.modalities.join(' + ')}</p></div>
                </div>
                <div className="mt-4"><SourceBadge source={selected.source} /></div>
              </div>
            </section>

            <div className="flex gap-1 border-b border-stone-200 overflow-x-auto">
              {[['summary', 'Resumen'], ['surveillance', 'Vigilancia'], ['cases', 'Casos A.I.'], ['history', 'Historial'], ['documents', 'Documentos']].map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap ${tab === id ? 'border-teal-700 text-teal-800' : 'border-transparent text-stone-500'}`}>{label}</button>)}
            </div>

            {tab === 'summary' && <SectionCard title="Resumen operativo"><div className="grid md:grid-cols-2 gap-4"><div className="border border-stone-200 rounded-xl p-4"><p className="text-xs text-stone-400">Oficina Local / Región</p><p className="text-sm font-semibold mt-1">{selected.localOffice}</p><p className="text-xs text-stone-500">{selected.region}</p></div><div className="border border-stone-200 rounded-xl p-4"><p className="text-xs text-stone-400">Caso de A.I.</p>{currentCase ? <div className="mt-2 flex gap-2 items-center"><strong className="text-sm">{currentCase.id}</strong><PriorityBadge priority={currentCase.priority} /><StatusBadge status={currentCase.status} /></div> : <p className="text-sm text-stone-500 mt-2">No existe caso de A.I. activo.</p>}</div></div></SectionCard>}

            {tab === 'surveillance' && <SectionCard title="Vigilancia disponible" description="El prototipo referencia información de vigilancia; no obliga a redigitarla como parte de una atención."><div className="grid md:grid-cols-3 gap-3">{[['Crecimiento', 'Peso, talla, clasificación nutricional y circunferencias cuando corresponda.'], ['Desarrollo', 'EDIN II / EVADE según edad y lineamientos.'], ['Salud', 'Visión, audición, salud oral, lenguaje, motricidad y variables de salud.']].map(([t, d]) => <div key={t} className="border border-stone-200 rounded-xl p-4"><p className="font-semibold text-sm">{t}</p><p className="text-xs text-stone-500 mt-1">{d}</p><Badge tone="blue" className="mt-3">Dato referenciado</Badge></div>)}</div></SectionCard>}

            {tab === 'cases' && <SectionCard title="Casos de Atención Interdisciplinaria">{cases.length ? <div className="space-y-3">{cases.map((c) => <button key={c.id} onClick={() => onNavigate('cases', c.id)} className="w-full border border-stone-200 rounded-xl p-4 flex justify-between items-center hover:border-teal-300 text-left"><div><p className="font-semibold text-sm">{c.id}</p><p className="text-xs text-stone-500 mt-1">Apertura: {c.openedAt}</p></div><div className="flex gap-2"><PriorityBadge priority={c.priority} /><StatusBadge status={c.status} /></div></button>)}</div> : <p className="text-sm text-stone-500">Sin casos registrados.</p>}</SectionCard>}

            {tab === 'history' && <SectionCard title="Historial longitudinal" description="Integra atenciones individuales y grupales en una sola línea de tiempo.">{timeline.length ? <div className="space-y-0">{timeline.map((e, idx) => <div key={e.id} className="relative flex gap-4 pb-5"><div className="flex flex-col items-center"><TimelineDot type={e.type} />{idx < timeline.length - 1 && <div className="w-px flex-1 bg-stone-200 mt-1" />}</div><div className="-mt-1"><div className="flex items-center gap-2 flex-wrap"><p className="text-sm font-semibold">{e.title}</p><Badge tone="neutral">{e.type}</Badge></div><p className="text-xs text-stone-500 mt-1">{e.date} · {e.discipline}</p><p className="text-sm text-stone-600 mt-2">{e.detail}</p></div></div>)}</div> : <p className="text-sm text-stone-500">Sin intervenciones registradas.</p>}</SectionCard>}

            {tab === 'documents' && <SectionCard title="Documentos relacionados"><div className="grid md:grid-cols-2 gap-3">{['Referencia A.I.', 'Valoración Situacional', 'Minuta', 'Hoja de Atención', 'Hoja de Seguimiento', 'Reporte A.I.'].map((d) => <div key={d} className="border border-stone-200 rounded-xl p-3 flex items-center gap-3"><div className="w-8 h-8 bg-violet-50 text-violet-700 rounded-lg flex items-center justify-center"><Users size={14} /></div><div><p className="text-sm font-medium">{d}</p><p className="text-xs text-stone-400">Relacionado al caso / prototipo</p></div></div>)}</div></SectionCard>}
          </div>
        )}
      </div>
    </div>
  );
}
