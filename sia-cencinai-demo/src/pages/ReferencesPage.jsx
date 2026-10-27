import React,{useMemo,useState} from 'react';
import { Download, FileSpreadsheet, Plus, Printer, Upload } from 'lucide-react';
import PersonSearch from '../components/PersonSearch';
import ReferenceContext from '../components/ReferenceContext';
import { createReferenceSnapshot, nextReferenceConsecutive, referenceContext } from '../utils/references';
import { DETECTION_ORIGINS, REFERENCE_MOTIVES, REFERENCE_TYPES } from '../data/catalogs';
import { canCreateReference, roleConfig, scopeItems, unique } from '../utils/access';
import { downloadReferenceTemplate, printReference } from '../utils/download';
import { AlertBanner, Badge, Field, PageHeader, ProgressSteps, SectionCard, StatusBadge, inputClass } from '../components/ui';

const steps=['Cliente/beneficiaria y trazabilidad','Motivo','Información relevante','Revisar'];

function emptyForm(role){return {personId:null,date:'2026-09-16',type:'No inmediata',origin:'Observación directa',motives:[],factorDetails:{},priorActions:'',priorResults:'',observations:'',referredBy:role==='ESTABLISHMENT'?'María López — Asistente 3':'Ana Morales — Profesional EE.II.'};}

export default function ReferencesPage({state,actions,role,context}){
  const cfg=roleConfig(role); const visible=scopeItems(state.references,role); const [selectedId,setSelectedId]=useState(context?.referenceId||visible[0]?.id); const [creating,setCreating]=useState(Boolean(context?.newReference)); const [mode,setMode]=useState('manual'); const [step,setStep]=useState(0); const [form,setForm]=useState(emptyForm(role)); const [fileName,setFileName]=useState('');
  const people=scopeItems(state.people,role);
  const [filters,setFilters]=useState({query:'',status:'',type:'',origin:'',category:''});
  const filtered=useMemo(()=>visible.filter(r=>{
    const person=people.find(p=>p.id===r.personId);
    const q=filters.query.trim().toLowerCase();
    return (!q||[person?.name,person?.identification,r.consecutive].some(value=>value?.toLowerCase().includes(q)))
      &&(!filters.status||r.status===filters.status)&&(!filters.type||r.type===filters.type)
      &&(!filters.origin||r.origin===filters.origin)&&(!filters.category||r.categories?.includes(filters.category));
  }),[visible,people,filters]);
  const selected=filtered.find(r=>r.id===selectedId)||filtered[0]; const person=people.find(p=>p.id===selected?.personId);
  const selectedContext=selected?referenceContext(selected,person):null;
  const reset=()=>{setForm(emptyForm(role));setStep(0);setMode('manual');setFileName('');setCreating(false)};
  const toggleMotive=(m)=>setForm(f=>{const exists=f.motives.includes(m);const motives=exists?f.motives.filter(x=>x!==m):[...f.motives,m];const details={...f.factorDetails};if(exists)delete details[m];return{...f,motives,factorDetails:details}});
  const selectedPerson=people.find(p=>p.id===form.personId);
  const submit=()=>{if(!selectedPerson)return;actions.addReference({...form,status:'Pendiente de revisión',establishment:selectedPerson.establishment,localOffice:selectedPerson.localOffice,region:selectedPerson.region,categories:Object.entries(REFERENCE_MOTIVES).filter(([,arr])=>arr.some(x=>form.motives.includes(x))).map(([k])=>k)});reset()};
  const simulateExcel=(file)=>{setFileName(file?.name||'referencia_demo.xlsx');setMode('excel');setForm({...emptyForm(role),personId:'PER-001',origin:'Observación directa',motives:['Alteraciones emocionales'],factorDetails:{'Alteraciones emocionales':'Dato precargado desde plantilla de demostración.'},observations:'Información precargada para revisión desde una plantilla Excel estandarizada.',referredBy:'María López — Asistente 3'});setStep(3)};

  return <div className="space-y-6"><PageHeader eyebrow="Detección y referencia" title="Referencias a Atención Interdisciplinaria" actions={canCreateReference(role)&&<button onClick={()=>setCreating(true)} className="bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"><Plus size={16}/> Nueva referencia</button>}/>
    {creating&&<SectionCard title="Nueva referencia"><div className="space-y-5">
      <div className="flex gap-2"><button onClick={()=>setMode('manual')} className={`px-3 py-2 rounded-xl text-sm font-semibold border ${mode==='manual'?'bg-teal-50 border-teal-300 text-teal-800':''}`}>Digitar en el sistema</button><button onClick={()=>setMode('excel')} className={`px-3 py-2 rounded-xl text-sm font-semibold border ${mode==='excel'?'bg-teal-50 border-teal-300 text-teal-800':''}`}>Cargar Excel estandarizado</button></div>
      {mode==='excel'&&step===0?<div className="grid md:grid-cols-2 gap-4"><div className="border border-dashed rounded-2xl p-5"><FileSpreadsheet className="text-teal-700"/><p className="font-semibold mt-2">Plantilla institucional</p><button onClick={downloadReferenceTemplate} className="mt-3 border rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2"><Download size={14}/> Descargar plantilla</button></div><label className="border border-dashed rounded-2xl p-5 cursor-pointer hover:bg-stone-50"><Upload className="text-violet-600"/><p className="font-semibold mt-2">Cargar plantilla completada</p><p className="text-xs text-stone-500 mt-1">Carga simulada: se usarán datos de demostración.</p><input type="file" accept=".xls,.xlsx,.csv" className="hidden" onChange={e=>simulateExcel(e.target.files?.[0])}/></label></div>:
      <><ProgressSteps steps={steps} current={step}/>{fileName&&<AlertBanner tone="blue" title="Datos precargados desde Excel">{fileName}. Revise la información antes de guardar.</AlertBanner>}
      {step===0&&<div className="grid md:grid-cols-2 gap-4"><div className="md:col-span-2"><PersonSearch people={people} role={role} value={form.personId} onSelect={id=>setForm({...form,personId:id})}/></div><Field label="Fecha" required><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className={inputClass}/></Field><Field label="Tipo" required><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className={inputClass}>{REFERENCE_TYPES.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Origen" required><select value={form.origin} onChange={e=>setForm({...form,origin:e.target.value})} className={inputClass}>{DETECTION_ORIGINS.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Responsable de la referencia"><input value={form.referredBy} onChange={e=>setForm({...form,referredBy:e.target.value})} className={inputClass}/></Field></div>}
      {step===1&&<div className="space-y-5">{Object.entries(REFERENCE_MOTIVES).map(([group,items])=><div key={group}><p className="text-sm font-bold mb-2">{group}</p><div className="grid md:grid-cols-2 gap-2">{items.map(m=><div key={m} className={`border rounded-xl p-3 ${form.motives.includes(m)?'border-teal-300 bg-teal-50/40':'border-stone-200'}`}><label className="flex gap-2 text-sm"><input type="checkbox" checked={form.motives.includes(m)} onChange={()=>toggleMotive(m)} className="accent-teal-700"/><span>{m}</span></label>{form.motives.includes(m)&&<input value={form.factorDetails[m]||''} onChange={e=>setForm({...form,factorDetails:{...form.factorDetails,[m]:e.target.value}})} className={`${inputClass} mt-2`} placeholder="Detalle del factor (opcional)"/>}</div>)}</div></div>)}</div>}
      {step===2&&<div className="space-y-4"><Field label="Acciones realizadas previo a la referencia"><textarea rows={3} value={form.priorActions} onChange={e=>setForm({...form,priorActions:e.target.value})} className={inputClass}/></Field><Field label="Resultados obtenidos previo a la referencia"><textarea rows={3} value={form.priorResults} onChange={e=>setForm({...form,priorResults:e.target.value})} className={inputClass}/></Field><Field label="Información relevante / observaciones"><textarea rows={4} value={form.observations} onChange={e=>setForm({...form,observations:e.target.value})} className={inputClass}/></Field></div>}
      {step===3&&<div className="border rounded-2xl p-5 bg-stone-50 space-y-5">
        <p className="font-bold text-sm break-words">{nextReferenceConsecutive(selectedPerson,form.date,state.references)}</p>
        <ReferenceContext context={createReferenceSnapshot(selectedPerson,form.date)}/>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">{[['Fecha de referencia',form.date],['Responsable que refiere',form.referredBy],['Tipo',form.type],['Origen',form.origin]].map(([label,value])=><p key={label}><b>{label}:</b> {value||'—'}</p>)}</div>
        <ReferenceMotives reference={form}/><ReferenceNotes reference={form}/>
      </div>}
      <div className="flex justify-between"><button onClick={()=>step===0?reset():setStep(step-1)} className="border rounded-xl px-4 py-2 text-sm font-semibold">{step===0?'Cancelar':'Atrás'}</button>{step<3?<button disabled={step===0&&!form.personId} onClick={()=>setStep(step+1)} className="bg-teal-700 disabled:bg-stone-300 text-white rounded-xl px-4 py-2 text-sm font-semibold">Continuar</button>:<button disabled={!selectedPerson} onClick={submit} className="bg-teal-700 text-white rounded-xl px-4 py-2 text-sm font-semibold">Guardar referencia</button>}</div></>}</div></SectionCard>}
    <div className="grid xl:grid-cols-[1fr_430px] gap-5 items-start"><SectionCard title="Bandeja de referencias" description={`${filtered.length} de ${visible.length} referencia(s) · ${cfg.scope}`}><div className="grid sm:grid-cols-2 gap-2 mb-4">
      <input aria-label="Buscar referencias" value={filters.query} onChange={e=>setFilters({...filters,query:e.target.value})} className={inputClass} placeholder="Nombre, identificación o consecutivo"/>
      {[['status','Estado',unique(visible.map(r=>r.status))],['type','Tipo',REFERENCE_TYPES],['origin','Origen',DETECTION_ORIGINS],['category','Categoría',Object.keys(REFERENCE_MOTIVES)]].map(([key,label,options])=><select key={key} aria-label={label} value={filters[key]} onChange={e=>setFilters({...filters,[key]:e.target.value})} className={inputClass}><option value="">{label}: todos</option>{options.map(option=><option key={option}>{option}</option>)}</select>)}
    </div><div className="space-y-2">{filtered.length===0&&<p className="text-sm text-stone-500">No hay referencias con estos filtros.</p>}{filtered.map(r=>{const p=state.people.find(x=>x.id===r.personId);return <button key={r.id} onClick={()=>setSelectedId(r.id)} className={`w-full text-left border rounded-xl p-3 ${selectedId===r.id?'border-teal-300 bg-teal-50/50':'hover:bg-stone-50'}`}><div className="flex justify-between gap-3"><div><p className="text-xs font-semibold text-teal-700 break-words">{r.consecutive||r.id}</p><p className="text-sm font-semibold mt-1">{p?.name}</p><p className="text-xs text-stone-500">{p?.identification} · {r.establishment}</p><p className="text-xs text-stone-400 mt-1">Responsable: {r.referredBy}</p></div><div className="flex flex-col items-end gap-1"><StatusBadge status={r.status}/><Badge tone={r.type==='Urgencia'?'red':'blue'}>{r.type}</Badge></div></div></button>})}</div></SectionCard>
    <SectionCard title="Detalle de referencia">{selected?<div className="space-y-4">
      <div><p className="text-sm font-bold text-teal-800 break-words">{selected.consecutive||selected.id}</p><p className="text-xs text-stone-500 mt-1">Fecha de referencia: {selected.date}</p></div>
      <div className="flex gap-2 flex-wrap"><StatusBadge status={selected.status}/><Badge tone="blue">{selected.origin}</Badge><Badge tone={selected.type==='Urgencia'?'red':'blue'}>{selected.type}</Badge></div>
      <ReferenceContext context={selectedContext}/><ReferenceMotives reference={selected}/><ReferenceNotes reference={selected}/>
      {selected.decisionJustification&&<div className="border rounded-xl p-3"><p className="text-xs font-bold text-stone-500">Justificación de la decisión</p><p className="text-sm mt-1">{selected.decisionJustification}</p></div>}
      <p className="text-xs text-stone-500">Responsable: <b>{selected.referredBy}</b></p>
      <button onClick={()=>printReference(selected,person)} className="w-full border rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2"><Printer size={15}/> Imprimir referencia</button>
      {cfg.level==='local'&&['Recibida','Pendiente de revisión'].includes(selected.status)&&<button onClick={()=>actions.updateReference(selected.id,{status:'Recibida'})} className="w-full bg-teal-700 text-white rounded-xl py-2.5 text-sm font-semibold">Marcar recibida</button>}
    </div>:<p className="text-sm text-stone-500">Seleccione una referencia.</p>}</SectionCard></div>
  </div>;
}

function ReferenceMotives({reference}){
  return <div><p className="text-xs font-bold uppercase text-stone-500 mb-2">Motivos y detalle</p><div className="space-y-2">{reference.motives.map(m=><div key={m} className="border rounded-xl p-3"><p className="text-sm font-semibold">{m}</p>{reference.factorDetails?.[m]&&<p className="text-xs text-stone-600 mt-1">{reference.factorDetails[m]}</p>}</div>)}</div></div>;
}
function ReferenceNotes({reference}){
  return <div className="space-y-3">{[['Acciones realizadas previo a la referencia',reference.priorActions],['Resultados obtenidos previo a la referencia',reference.priorResults],['Información relevante',reference.observations]].map(([label,value])=><div key={label}><p className="text-xs font-bold text-stone-500">{label}</p><p className="text-sm whitespace-pre-wrap mt-1">{value||'—'}</p></div>)}</div>;
}
