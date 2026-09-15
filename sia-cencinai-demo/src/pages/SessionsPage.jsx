import React, { useMemo, useState } from 'react';
import { BookOpenCheck, CheckCircle2, Plus, Users } from 'lucide-react';
import { DISCIPLINES, PRIORITIES, RISK_MATRIX, STRATEGIES } from '../data/catalogs';
import { AlertBanner, Badge, Field, PageHeader, PriorityBadge, SectionCard, StatusBadge, inputClass } from '../components/ui';

function ChecklistGroup({ title, items, selected, onToggle, tone='teal' }) {
  return <div><p className="text-xs font-bold uppercase tracking-wide text-stone-500 mb-2">{title}</p><div className="grid md:grid-cols-2 gap-2">{items.map(item=><label key={item} className={`border rounded-xl p-2.5 text-xs cursor-pointer ${selected.includes(item)?(tone==='amber'?'border-amber-300 bg-amber-50':'border-teal-300 bg-teal-50'):'border-stone-200 bg-white'}`}><input className="mr-2 accent-teal-700" type="checkbox" checked={selected.includes(item)} onChange={()=>onToggle(item)}/>{item}</label>)}</div></div>;
}

function ValuationWorkspace({ reference, person, onCreateCase, onNoAI }) {
  const [scope, setScope] = useState('Individual');
  const [protective, setProtective] = useState([]);
  const [risks, setRisks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [decision, setDecision] = useState('Sí');
  const [priority, setPriority] = useState('Moderado');
  const [strategies, setStrategies] = useState(['Consejería']);
  const [disciplines, setDisciplines] = useState(['Psicología']);
  const [frequency, setFrequency] = useState('Quincenal');
  const [summary, setSummary] = useState('Riesgos que requieren abordaje especializado con factores protectores presentes.');
  const toggle = (setter, arr, item)=>setter(arr.includes(item)?arr.filter(x=>x!==item):[...arr,item]);
  const matrix=RISK_MATRIX[scope];

  return <div className="space-y-5">
    <AlertBanner tone="blue" title="Caso en análisis">{person.name} · {reference.type} · {reference.motives.join(', ')}</AlertBanner>
    <div className="flex gap-2 flex-wrap">{Object.keys(RISK_MATRIX).map(s=><button key={s} onClick={()=>setScope(s)} className={`px-3 py-2 rounded-xl text-xs font-semibold ${scope===s?'bg-teal-700 text-white':'bg-stone-100 text-stone-600'}`}>{s}</button>)}</div>
    <div className="space-y-5"><ChecklistGroup title="Factores protectores" items={matrix.protectores} selected={protective} onToggle={(v)=>toggle(setProtective,protective,v)}/><ChecklistGroup title="Factores de riesgo" items={matrix.riesgos} selected={risks} onToggle={(v)=>toggle(setRisks,risks,v)} tone="amber"/><ChecklistGroup title="Signos de alerta" items={matrix.alertas} selected={alerts} onToggle={(v)=>toggle(setAlerts,alerts,v)} tone="amber"/></div>
    <div className="grid sm:grid-cols-3 gap-3"><Field label="Intensidad"><select className={inputClass}><option>Baja</option><option>Moderada</option><option>Alta</option></select></Field><Field label="Frecuencia"><select className={inputClass}><option>Ocasional</option><option>Recurrente</option><option>Frecuente</option></select></Field><Field label="Persistencia"><select className={inputClass}><option>Reciente</option><option>Persistente</option><option>Crónica</option></select></Field></div>
    <SectionCard title="Resolución del EE.II." description="La decisión profesional no se sustituye por automatización."><div className="space-y-4"><Field label="¿Requiere Atención Interdisciplinaria?"><div className="flex gap-2">{['Sí','No'].map(v=><button key={v} onClick={()=>setDecision(v)} className={`px-4 py-2 rounded-xl text-sm font-semibold ${decision===v?'bg-teal-700 text-white':'border border-stone-200'}`}>{v}</button>)}</div></Field>{decision==='Sí'?<><Field label="Nivel de prioridad"><div className="flex gap-2 flex-wrap">{PRIORITIES.map(p=><button key={p} onClick={()=>setPriority(p)} className={`px-3 py-2 rounded-xl border ${priority===p?'border-teal-500 bg-teal-50':'border-stone-200'}`}><PriorityBadge priority={p}/></button>)}</div></Field><Field label="Estrategias"><div className="flex flex-wrap gap-2">{STRATEGIES.map(s=><button key={s} onClick={()=>toggle(setStrategies,strategies,s)} className={`px-3 py-2 rounded-xl text-xs border ${strategies.includes(s)?'border-teal-400 bg-teal-50 text-teal-800':'border-stone-200'}`}>{s}</button>)}</div></Field><Field label="Disciplinas"><div className="flex flex-wrap gap-2">{DISCIPLINES.map(d=><button key={d} onClick={()=>toggle(setDisciplines,disciplines,d)} className={`px-3 py-2 rounded-xl text-xs border ${disciplines.includes(d)?'border-violet-300 bg-violet-50 text-violet-800':'border-stone-200'}`}>{d}</button>)}</div></Field><div className="grid md:grid-cols-2 gap-4"><Field label="Frecuencia"><select value={frequency} onChange={e=>setFrequency(e.target.value)} className={inputClass}><option>Semanal</option><option>Quincenal</option><option>Mensual</option><option>Según evolución</option></select></Field><Field label="Resumen de valoración"><textarea rows={3} value={summary} onChange={e=>setSummary(e.target.value)} className={inputClass}/></Field></div><button onClick={()=>onCreateCase({openedAt:'2026-09-15',priority,purposes:['Abordar motivo de referencia'],strategies,disciplines,frequency,valuationSummary:summary})} className="bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"><CheckCircle2 size={16}/> Confirmar y abrir caso A.I.</button></>:<><Field label="Observaciones y recomendaciones"><textarea rows={4} className={inputClass} defaultValue="Continúa atención y vigilancia regular con recomendaciones al establecimiento."/></Field><button onClick={onNoAI} className="border border-stone-200 px-4 py-2.5 rounded-xl text-sm font-semibold">Registrar que no requiere A.I.</button></>}</div></SectionCard>
  </div>;
}

export default function SessionsPage({ state, actions, onNavigate }) {
  const [selectedSessionId,setSelectedSessionId]=useState(state.sessions[0]?.id);
  const [selectedRefId,setSelectedRefId]=useState(state.sessions[0]?.referenceIds?.[0]);
  const session=state.sessions.find(s=>s.id===selectedSessionId) || state.sessions[0];
  const availableRefs=useMemo(()=>state.references.filter(r=>['Recibida','Pendiente de revisión'].includes(r.status)),[state.references]);
  const reference=state.references.find(r=>r.id===selectedRefId) || state.references.find(r=>session?.referenceIds.includes(r.id));
  const person=state.people.find(p=>p.id===reference?.personId);

  const addRefToSession=(refId)=>{if(!session)return; const ids=[...new Set([...(session.referenceIds||[]),refId])];actions.updateSession(session.id,{referenceIds:ids});setSelectedRefId(refId);};
  const createCase=(payload)=>{actions.createCaseFromReference(reference.id,payload);actions.updateSession(session.id,{status:'Realizada'});onNavigate('cases');};
  const noAi=()=>{actions.updateReference(reference.id,{status:'No requiere A.I.'});};

  return <div className="space-y-6"><PageHeader eyebrow="Valoración interdisciplinaria" title="Sesiones interdisciplinarias" description="Una sesión puede analizar múltiples casos. Cada persona conserva su propia decisión, valoración y acuerdos." actions={<button className="border border-stone-200 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"><Plus size={16}/> Nueva sesión</button>}/>
  <div className="grid xl:grid-cols-[360px_1fr] gap-5 items-start"><div className="space-y-5"><SectionCard title="Sesiones"><div className="space-y-2">{state.sessions.map(s=><button key={s.id} onClick={()=>{setSelectedSessionId(s.id);setSelectedRefId(s.referenceIds?.[0]);}} className={`w-full text-left border rounded-xl p-3 ${session?.id===s.id?'border-violet-300 bg-violet-50':'border-stone-200'}`}><div className="flex justify-between gap-2"><div><p className="font-semibold text-sm">{s.date} · {s.startTime}</p><p className="text-xs text-stone-500">{s.place}</p></div><StatusBadge status={s.status}/></div><p className="text-xs text-stone-500 mt-2 flex items-center gap-1"><Users size={12}/>{s.referenceIds.length} caso(s)</p></button>)}</div></SectionCard>
  {session&&<SectionCard title="Casos de la sesión" description="Agregar referencias recibidas para análisis."><div className="space-y-2">{session.referenceIds.map(id=>{const r=state.references.find(x=>x.id===id);const p=state.people.find(x=>x.id===r?.personId);return <button key={id} onClick={()=>setSelectedRefId(id)} className={`w-full border rounded-xl p-3 text-left ${reference?.id===id?'border-teal-300 bg-teal-50':'border-stone-200'}`}><p className="text-sm font-semibold">{p?.name}</p><p className="text-xs text-stone-500">{r?.type} · {r?.date}</p></button>})}<div className="pt-2 border-t"><p className="text-[11px] uppercase font-semibold text-stone-400 mb-2">Referencias disponibles</p>{availableRefs.filter(r=>!session.referenceIds.includes(r.id)).map(r=>{const p=state.people.find(x=>x.id===r.personId);return <button key={r.id} onClick={()=>addRefToSession(r.id)} className="w-full text-left text-xs px-3 py-2 hover:bg-stone-50 rounded-lg">+ {p?.name}</button>})}</div></div></SectionCard>}</div>
  <SectionCard title="Workspace de valoración" description="Datos de referencia + valoración situacional + decisión del EE.II.">{reference&&person?<ValuationWorkspace reference={reference} person={person} onCreateCase={createCase} onNoAI={noAi}/>:<div className="py-12 text-center text-sm text-stone-500">Seleccione un caso de la sesión para iniciar la valoración.</div>}</SectionCard></div></div>;
}
