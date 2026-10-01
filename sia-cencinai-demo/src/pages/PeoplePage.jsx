import React,{useEffect,useMemo,useState} from 'react';
import { Download, Search, UserRound } from 'lucide-react';
import { HELP_TEXT } from '../data/catalogs';
import { applyHierarchyFilters, roleConfig, roleFilters, scopeItems, unique } from '../utils/access';
import { downloadExcelLike } from '../utils/download';
import { HelpStrip, PageHeader, SectionCard, SourceBadge, StatusBadge, Tabs, TimelineDot, inputClass } from '../components/ui';

function age(birthDate){const b=new Date(`${birthDate}T00:00:00`),n=new Date('2026-09-16T00:00:00');let y=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))y--;return `${y} años`;}

function scopeDescription(cfg){
  if(cfg.level==='establishment') return `Incluye todos los clientes/beneficiarias registrados en el establecimiento ${cfg.scope}, tengan o no un caso de A.I.`;
  if(cfg.level==='local') return `Incluye todos los clientes/beneficiarias de ${cfg.scope}, considerando todos sus establecimientos, tengan o no un caso de A.I.`;
  if(cfg.level==='regional') return `Incluye todos los clientes/beneficiarias de ${cfg.scope}, considerando sus Oficinas Locales y establecimientos, tengan o no un caso de A.I.`;
  return 'Incluye todos los clientes/beneficiarias registrados a nivel nacional, tengan o no un caso de A.I.';
}

export default function PeoplePage({state,role,context,onNavigate}){
  const cfg=roleConfig(role);
  const scoped=scopeItems(state.people,role);
  const options=roleFilters(role,state.people);
  const [query,setQuery]=useState(context?.query||'');
  const [filters,setFilters]=useState({region:'',localOffice:'',establishment:'',serviceStatus:''});
  const [selectedId,setSelectedId]=useState(null);
  const [tab,setTab]=useState('summary');
  useEffect(()=>{setFilters({region:'',localOffice:'',establishment:'',serviceStatus:''});setSelectedId(null);},[role]);
  const serviceStatuses=useMemo(()=>unique(scoped.map(p=>p.serviceStatus)),[scoped]);
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return applyHierarchyFilters(scoped,filters).filter(p=>{
      if(filters.serviceStatus&&p.serviceStatus!==filters.serviceStatus)return false;
      return !q||p.name.toLowerCase().includes(q)||p.identification.toLowerCase().includes(q);
    });
  },[query,scoped,filters]);
  const selected=state.people.find(p=>p.id===selectedId);
  const cases=selected?state.cases.filter(c=>c.personId===selected.id):[];
  const current=cases.find(c=>c.status==='Activo')||cases[0];
  const events=current?state.timeline.filter(t=>t.caseId===current.id).sort((a,b)=>b.date.localeCompare(a.date)):[];
  const exportRows=filtered.map(p=>[p.identification,p.name,p.establishment,p.localOffice,p.region,p.serviceStatus]);

  return <div className="space-y-6"><PageHeader eyebrow="Identidad y búsqueda" title="Clientes/beneficiarias" description={scopeDescription(cfg)} actions={cfg.level!=='establishment'&&<button onClick={()=>downloadExcelLike('clientes_beneficiarias_filtradas',['Identificación','Nombre','Establecimiento','Oficina Local','Región','Estado de servicio'],exportRows)} className="border px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><Download size={15}/> Exportar Excel</button>}/><HelpStrip>{HELP_TEXT.people}</HelpStrip>
    <SectionCard title="Buscar y filtrar clientes/beneficiarias" description={`${filtered.length} de ${scoped.length} registro(s) visibles dentro de su ámbito.`}><div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3"><div className="relative md:col-span-2"><Search size={16} className="absolute left-3 top-3 text-stone-400"/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} className={`${inputClass} pl-9`} placeholder="Identificación o nombre"/></div>{options.regions.length>0&&<select aria-label="Región" value={filters.region} onChange={e=>setFilters({...filters,region:e.target.value,localOffice:'',establishment:''})} className={inputClass}><option value="">Región: todas</option>{options.regions.map(x=><option key={x}>{x}</option>)}</select>}{options.localOffices.length>0&&<select aria-label="Oficina Local" value={filters.localOffice} onChange={e=>setFilters({...filters,localOffice:e.target.value,establishment:''})} className={inputClass}><option value="">Oficina Local: todas</option>{options.localOffices.map(x=><option key={x}>{x}</option>)}</select>}{options.establishments.length>0&&<select aria-label="Establecimiento" value={filters.establishment} onChange={e=>setFilters({...filters,establishment:e.target.value})} className={inputClass}><option value="">Establecimiento — Todos</option>{options.establishments.map(x=><option key={x} value={x}>Establecimiento — {x}</option>)}</select>}<select aria-label="Estado de servicio" value={filters.serviceStatus} onChange={e=>setFilters({...filters,serviceStatus:e.target.value})} className={inputClass}><option value="">Estado de servicio: todos</option>{serviceStatuses.map(x=><option key={x}>{x}</option>)}</select></div></SectionCard>
    <div className="grid xl:grid-cols-[420px_1fr] gap-5 items-start"><SectionCard title="Listado de clientes/beneficiarias" description="Seleccione un registro para consultar su información."><div className="space-y-2 max-h-[650px] overflow-y-auto">{filtered.map(p=><button key={p.id} onClick={()=>{setSelectedId(p.id);setTab('summary')}} className={`w-full text-left border rounded-xl p-3 ${selectedId===p.id?'border-teal-300 bg-teal-50':'hover:bg-stone-50'}`}><div className="flex gap-3"><div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center"><UserRound size={16}/></div><div className="min-w-0"><p className="text-sm font-semibold truncate">{p.name}</p><p className="text-xs font-mono text-stone-500">{p.identification}</p><p className="text-xs text-stone-400 truncate">{p.establishment} · {p.serviceStatus}</p></div></div></button>)}</div></SectionCard>
    <div>{!selected?<SectionCard><p className="text-sm text-stone-500 text-center py-16">Busque y seleccione un cliente/beneficiaria para consultar su información.</p></SectionCard>:<div className="space-y-4"><SectionCard><div className="flex justify-between gap-4 flex-wrap"><div><p className="text-xl font-bold">{selected.name}</p><p className="text-sm text-stone-500 mt-1">{selected.identification} · {age(selected.birthDate)}</p><p className="text-xs text-stone-500 mt-1">{selected.establishment} · {selected.localOffice}</p></div><div className="flex gap-2 items-start"><SourceBadge source={selected.source}/>{current&&<StatusBadge status={current.status}/>}</div></div></SectionCard>
      {cfg.level==='establishment'?<SectionCard title="Información disponible para establecimiento" description="La vista de A.I. se limita a información mínima para proteger el detalle interno del caso."><div className="grid sm:grid-cols-3 gap-3">{cases.length?cases.map(c=><div key={c.id} className="border rounded-xl p-3"><p className="text-xs text-stone-400">Caso</p><p className="text-sm font-semibold mt-1">{c.id}</p><div className="mt-2"><StatusBadge status={c.status}/></div><p className="text-xs text-stone-500 mt-2">Apertura: {c.openedAt}</p>{c.closedAt&&<p className="text-xs text-stone-500">Cierre: {c.closedAt}</p>}</div>):<p className="text-sm text-stone-500">Sin caso A.I. registrado.</p>}</div></SectionCard>:
      <SectionCard><Tabs value={tab} onChange={setTab} items={[{id:'summary',label:'Resumen'},{id:'cases',label:'Casos A.I.'},{id:'history',label:'Historial'}]}/><div className="pt-5">{tab==='summary'&&<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[['Fecha de nacimiento',selected.birthDate],['Sexo',selected.sex],['Modalidades',selected.modalities.join(', ')],['Estado de servicio',selected.serviceStatus],['Establecimiento',selected.establishment],['Oficina Local',selected.localOffice],['Región',selected.region]].map(([k,v])=><div key={k} className="border rounded-xl p-3"><p className="text-xs text-stone-400">{k}</p><p className="text-sm font-semibold mt-1">{v}</p></div>)}</div>}{tab==='cases'&&<div className="space-y-2">{cases.length?cases.map(c=><button key={c.id} onClick={()=>onNavigate('cases',{caseId:c.id})} className="w-full text-left border rounded-xl p-3 flex justify-between"><div><p className="text-sm font-semibold">{c.id}</p><p className="text-xs text-stone-500">Apertura {c.openedAt}</p></div><StatusBadge status={c.status}/></button>):<p className="text-sm text-stone-500">Este cliente/beneficiaria no tiene casos A.I. registrados.</p>}</div>}{tab==='history'&&<div className="space-y-0">{events.length?events.map((e,i)=><div key={e.id} className="flex gap-3"><div className="flex flex-col items-center"><TimelineDot type={e.type}/>{i<events.length-1&&<span className="w-px bg-stone-200 flex-1 min-h-12"/>}</div><div className="pb-5"><p className="text-sm font-semibold">{e.title}</p><p className="text-xs text-stone-500">{e.date} · {e.discipline}</p><p className="text-xs text-stone-600 mt-1">{e.detail}</p></div></div>):<p className="text-sm text-stone-500">Sin eventos de A.I. para mostrar.</p>}</div>}</div></SectionCard>}</div>}</div></div>
  </div>;
}
