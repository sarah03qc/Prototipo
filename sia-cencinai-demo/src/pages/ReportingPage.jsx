import ReportWizard from '../components/ReportWizard';
import { reportingMetrics } from '../utils/reporting';
import { attentionYears, currentDate } from '../utils/followUp';
import React,{useMemo,useState} from 'react';
import { BarChart3, Download, Users } from 'lucide-react';
import { Bar,BarChart,CartesianGrid,Cell,Pie,PieChart,ResponsiveContainer,Tooltip,XAxis,YAxis } from 'recharts';
import { PRIORITIES, STRATEGIES } from '../data/catalogs';
import { applyHierarchyFilters, demoReferenceAuthor, roleConfig, roleFilters, scopeItems, unique } from '../utils/access';
import { downloadExcelLike } from '../utils/download';
import { MetricCard, PageHeader, SectionCard, inputClass } from '../components/ui';

export default function ReportingPage({state,role}){
  const cfg=roleConfig(role);
  const [filters,setFilters]=useState(defaultFilters);
  const [cut,setCut]=useState(null);
  const regions=roleFilters(role,state.people).regions;
  const localOffices=roleFilters(role,applyHierarchyFilters(state.people,{region:filters.region})).localOffices;
  const establishments=roleFilters(role,applyHierarchyFilters(state.people,{region:filters.region,localOffice:filters.localOffice})).establishments;
  const options={regions,localOffices,establishments};
  const casesBase=scopeItems(state.cases,role);
  const metrics=useMemo(()=>reportingMetrics(state,role,filters),[state,role,filters]);
  const {cases,refs,events,uniquePeople}=metrics;
  const priorityData=PRIORITIES.map(p=>({name:p,value:cases.filter(c=>c.priority===p).length}));
  const stateData=['Activo','Cerrado'].map(s=>({name:s,value:cases.filter(c=>c.status===s).length}));
  const scopedEvents=state.timeline.filter(e=>casesBase.some(c=>c.id===e.caseId));
  const scopedGroups=scopeItems(state.groupAttentions||[],role);
  const professionals=unique([...scopedEvents.map(e=>e.professional),...scopedGroups.flatMap(g=>g.professionals||[])]);
  const disciplines=unique([...scopedEvents.map(e=>e.discipline),...scopedGroups.flatMap(g=>g.disciplines||[])]);
  const labels={region:'Región',localOffice:'Oficina Local',establishment:'Establecimiento',status:'Estado',priority:'Prioridad',sex:'Sexo',minAge:'Edad mínima',maxAge:'Edad máxima',attentionType:'Tipo de atención',discipline:'Disciplina',professional:'Profesional'};
  const filterLabels=keys=>keys.filter(key=>filters[key]!=='').map(key=>`${labels[key]} ${filters[key]}`);
  const activeLabels=filterLabels(Object.keys(labels));
  const territory=['region','localOffice','establishment'];
  const demographics=[...territory,'sex','minAge','maxAge'];
  const caseFilters=[...demographics,'status','priority'];
  const attentionFilters=['attentionType','discipline','professional'];
  const visuals=[
    ['Casos por establecimiento','bar',metrics.byEstablishment,caseFilters],
    ['Casos por sexo','pie',metrics.bySex,caseFilters],
    ['Casos por edad actual','bar',metrics.byAge,caseFilters],
    ['Casos por prioridad','pie',priorityData,caseFilters],
    ['Casos por estado','pie',stateData,caseFilters],
    ['Principales motivos de cancelación','top',metrics.cancellationReasons.slice(0,10),territory],
    ['Principales motivos de referencia a A.I.','cloud',metrics.motives,demographics],
    ['Atenciones realizadas por tipo','pie',metrics.byType,[...caseFilters,...attentionFilters]],
    ['Distribución de motivos de cierre','pie',metrics.closureReasons,caseFilters],
    ['Palabras frecuentes de cierres Otro','cloud',metrics.closureWords,caseFilters],
    ['Porcentaje de niños atendidos','percentage',metrics.coverage,[...demographics,'priority',...attentionFilters]],
    ['Cantidad de niños atendidos','quantity',metrics.coverage,[...demographics,'priority',...attentionFilters]],
  ].map(([name,kind,data,keys],id)=>({id,name,kind,data,title:[name,...filterLabels(keys),`Año ${filters.year}`].join(' — ')}));
  const begin=()=>setCut(structuredClone({visuals,filters:activeLabels,year:filters.year,role:cfg.label,
    author:demoReferenceAuthor(role),scope:filters.establishment||filters.localOffice||filters.region||cfg.scope,
    generatedAt:new Date().toLocaleString('es-CR',{timeZone:'America/Costa_Rica'})}));
  const exportConsolidado=()=>downloadExcelLike(`consolidado_${filters.year}`,['Indicador','Valor','Personas únicas por tipo'],[
    ['Casos del corte',cases.length],['Referencias a Atención Interdisciplinaria registradas',refs.length],['Referencias enviadas (con fecha de envío)',metrics.sent],['Analizadas',metrics.analyzed],['Admitidas a A.I.',metrics.admitted],['No requiere A.I.',metrics.notRequired],['Personas únicas atendidas',uniquePeople],['Total de atenciones',events.length],['Casos activos sin atención en el período',metrics.withoutAttention],
    ...metrics.byType.map(x=>[`Atenciones: ${x.name}`,x.value,x.people]),...priorityData.map(x=>[`Prioridad ${x.name}`,x.value]),...metrics.byEstablishment.map(x=>[`Casos activos: ${x.name}`,x.value]),...metrics.bySex.map(x=>[`Sexo: ${x.name}`,x.value]),...metrics.byAge.map(x=>[`Edad: ${x.name}`,x.value]),...metrics.motives.map(x=>[`Motivo de referencia: ${x.name}`,x.value]),...metrics.cancellationReasons.map(x=>[`Cancelación: ${x.name}`,x.value])]);
  if(cfg.level==='establishment')return null;
  if(cut)return <ReportWizard cut={cut} onClose={()=>setCut(null)} renderVisual={v=><ReportVisual visual={v}/>}/>;
  return <div className="space-y-6"><PageHeader eyebrow="Analítica operativa" title="Reportería" actions={<div className="flex flex-wrap gap-2"><button onClick={begin} className="bg-teal-700 text-white px-3 py-2 rounded-xl text-sm font-semibold">Generar reporte</button><button onClick={exportConsolidado} className="border px-3 py-2 rounded-xl text-sm font-semibold flex gap-2 items-center"><Download size={15}/> Descargar consolidado</button></div>}/>
    <SectionCard title="Filtros"><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3"><input aria-label="Edad mínima" placeholder="Edad mínima" type="number" min="0" value={filters.minAge} onChange={e=>setFilters({...filters,minAge:e.target.value})} className={inputClass}/><input aria-label="Edad máxima" placeholder="Edad máxima" type="number" min={filters.minAge||0} value={filters.maxAge} onChange={e=>setFilters({...filters,maxAge:e.target.value})} className={inputClass}/><select value={filters.year} onChange={e=>setFilters({...filters,year:e.target.value})} className={inputClass}>{attentionYears(state).map(y=><option key={y}>{y}</option>)}</select>{options.regions.length>0&&<select value={filters.region} onChange={e=>setFilters({...filters,region:e.target.value,localOffice:'',establishment:''})} className={inputClass}><option value="">Región: todas</option>{options.regions.map(x=><option key={x}>{x}</option>)}</select>}{options.localOffices.length>0&&<select value={filters.localOffice} onChange={e=>setFilters({...filters,localOffice:e.target.value,establishment:''})} className={inputClass}><option value="">Oficina Local: todas</option>{options.localOffices.map(x=><option key={x}>{x}</option>)}</select>}{options.establishments.length>0&&<select value={filters.establishment} onChange={e=>setFilters({...filters,establishment:e.target.value})} className={inputClass}><option value="">Establecimiento — Todos</option>{options.establishments.map(x=><option key={x} value={x}>Establecimiento — {x}</option>)}</select>}<select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})} className={inputClass}><option value="">Todos los estados</option>{['Activo','Cerrado'].map(x=><option key={x}>{x}</option>)}</select><select value={filters.priority} onChange={e=>setFilters({...filters,priority:e.target.value})} className={inputClass}><option value="">Todas las prioridades</option>{PRIORITIES.map(x=><option key={x}>{x}</option>)}</select><select value={filters.discipline} onChange={e=>setFilters({...filters,discipline:e.target.value})} className={inputClass}><option value="">Todas las disciplinas</option>{disciplines.map(x=><option key={x}>{x}</option>)}</select><select value={filters.professional} onChange={e=>setFilters({...filters,professional:e.target.value})} className={inputClass}><option value="">Todos los profesionales</option>{professionals.map(x=><option key={x}>{x}</option>)}</select>
      <select aria-label="Sexo" className={inputClass} value={filters.sex} onChange={e=>setFilters({...filters,sex:e.target.value})}><option value="">Todos los sexos</option>{unique(scopeItems(state.people,role).map(p=>p.sex)).map(x=><option key={x}>{x}</option>)}</select>
      <select aria-label="Tipo de atención" className={inputClass} value={filters.attentionType} onChange={e=>setFilters({...filters,attentionType:e.target.value})}><option value="">Todos los tipos de atención</option>{unique(STRATEGIES).map(x=><option key={x}>{x}</option>)}</select>
      </div><div className="mt-3 flex flex-wrap gap-2 items-center text-sm"><span>Año {filters.year} · {activeLabels.length} filtros activos</span>{activeLabels.map(label=><span key={label} className="bg-teal-50 rounded-full px-2 py-1">{label}</span>)}<button className="text-teal-700 underline" onClick={()=>setFilters(defaultFilters())}>Limpiar filtros</button></div></SectionCard>
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3"><MetricCard label="Casos del corte" value={cases.length} icon={BarChart3} tone="teal"/><MetricCard label="Referencias a Atención Interdisciplinaria registradas" value={refs.length} icon={BarChart3} tone="amber"/><MetricCard label="Clientes/beneficiarias con atención" value={uniquePeople} icon={Users} tone="blue"/><MetricCard label="Total de atenciones" value={events.length} icon={Users} tone="purple"/></div>
    <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3"><MetricCard label="Referencias enviadas" value={metrics.sent} helper="Con fecha de envío en el período"/><MetricCard label="Referencias analizadas" value={metrics.analyzed}/><MetricCard label="Admitidas a A.I." value={metrics.admitted}/><MetricCard label="No requiere A.I." value={metrics.notRequired}/><MetricCard label="Casos activos sin atención en el período" value={metrics.withoutAttention} tone="red"/></div>
    <div className="grid xl:grid-cols-2 gap-5">{visuals.map(visual=><ReportVisual key={visual.id} visual={visual}/>)}</div>
    <SectionCard title="Consolidado dinámico"><div className="grid md:grid-cols-4 gap-3"><div className="border rounded-xl p-3"><p className="text-xs text-stone-400">Año</p><p className="font-bold mt-1">{filters.year}</p></div><div className="border rounded-xl p-3"><p className="text-xs text-stone-400">Ámbito</p><p className="font-bold mt-1">{filters.establishment||filters.localOffice||filters.region||cfg.scope}</p></div><div className="border rounded-xl p-3"><p className="text-xs text-stone-400">Casos</p><p className="font-bold mt-1">{cases.length}</p></div><div className="border rounded-xl p-3"><p className="text-xs text-stone-400">Atenciones</p><p className="font-bold mt-1">{events.length}</p></div></div></SectionCard>
  </div>;
}

function defaultFilters(){
  return {year:currentDate().slice(0,4),minAge:'',maxAge:'',region:'',localOffice:'',establishment:'',status:'',priority:'',sex:'',discipline:'',professional:'',attentionType:''};
}

const colors=['#0f766e','#2563eb','#7c3aed','#b45309','#be123c','#0369a1'];
function ReportVisual({visual:{title,kind,data}}){
  const total=Array.isArray(data)?data.reduce((sum,row)=>sum+row.value,0):0;
  let content;
  if(kind==='percentage'||kind==='quantity'){
    const {numerator,denominator,percentage}=data;
    content=<div><p className="text-3xl font-bold">{denominator?(kind==='percentage'?`${new Intl.NumberFormat('es-CR',{maximumFractionDigits:1}).format(percentage)} %`:numerator):'Sin casos activos'}</p>
      <p>{numerator} de {denominator} personas con caso activo vigente</p>
      {kind==='percentage'&&denominator>0&&<svg width="100%" height="12" role="img" aria-label={`${percentage} por ciento`}><rect width="100%" height="12" rx="6" fill="#e7e5e4"/><rect width={`${percentage}%`} height="12" rx="6" fill={`hsl(${percentage*1.2} 70% 35%)`}/></svg>}</div>;
  }else if(!total){
    content=<p className="text-sm text-stone-500">Sin datos para este corte.</p>;
  }else if(kind==='top'){
    content=<table className="w-full text-sm"><thead><tr><th>Posición</th><th>Motivo</th><th>Frecuencia</th></tr></thead><tbody>{data.map(({name,value},i)=><tr key={name}><td>{i+1}</td><td>{name}</td><td>{value}</td></tr>)}</tbody></table>;
  }else if(kind==='cloud'){
    const max=Math.max(...data.map(row=>row.value));
    content=<div style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'center'}}>{data.map(({name,value},i)=><span key={name} title={`${value}`} style={{fontSize:12+22*value/max,color:colors[i%colors.length]}}>{name} <small>({value})</small></span>)}</div>;
  }else if(kind==='pie'){
    content=<><ResponsiveContainer width="100%" height={230}><PieChart><Pie data={data} dataKey="value" isAnimationActive={false}>{data.map(({name},i)=><Cell key={name} fill={colors[i%colors.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><ul className="text-sm">{data.map(({name,value,people},i)=><li key={name} style={{color:colors[i%colors.length]}}>{name} · {value} ({Math.round(100*value/total)} %){people==null?'':` · ${people} personas únicas`}</li>)}</ul></>;
  }else{
    content=<><ResponsiveContainer width="100%" height={Math.max(190,34*data.length)}><BarChart layout="vertical" data={data}><CartesianGrid strokeDasharray="3 3"/><YAxis type="category" dataKey="name" width={126} tick={{fontSize:10}}/><XAxis type="number" allowDecimals={false}/><Tooltip/><Bar dataKey="value" fill="#0f766e" isAnimationActive={false}/></BarChart></ResponsiveContainer><ul className="text-xs">{data.map(row=><li key={row.name}>{row.name} · {row.value}</li>)}</ul></>;
  }
  return <SectionCard title={title}>{content}</SectionCard>;
}
