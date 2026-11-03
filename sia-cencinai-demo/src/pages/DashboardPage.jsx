import React,{useState} from 'react';
import { Bar,BarChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis } from 'recharts';
import { AlertTriangle,BookOpenCheck,CalendarDays,ClipboardList,FolderHeart,Users } from 'lucide-react';
import { roleConfig } from '../utils/access';
import { attentionYears,currentDate } from '../utils/followUp';
import { dashboardMetrics } from '../utils/dashboard';
import { MetricCard,PageHeader,SectionCard,StatusBadge,inputClass } from '../components/ui';

function Chart({title,data,format}){
  return <SectionCard title={title}>{data.length===0?<p className="text-sm text-stone-500">Sin datos en este ámbito.</p>:<div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:10}}/><YAxis allowDecimals={format!=='count'} domain={format==='percent'?[0,100]:undefined}/><Tooltip formatter={value=>format==='percent'?`${value?.toFixed(1)??'—'} %`:value}/><Bar dataKey="value" fill="#0f766e" isAnimationActive={false}/></BarChart></ResponsiveContainer></div>}</SectionCard>;
}
function Coverage({coverage,title}){
  return <SectionCard title={title}><p className="text-3xl font-bold text-teal-800">{coverage.denominator?`${coverage.percentage.toFixed(1)} %`:'Sin casos activos'}</p><p className="text-sm text-stone-600">{coverage.numerator} de {coverage.denominator} personas con caso activo vigente y atención efectiva en el año</p>{coverage.denominator>0&&<div className="h-3 rounded-full bg-stone-100 mt-3"><div className="h-3 rounded-full bg-teal-700" style={{width:`${coverage.percentage}%`}}/></div>}</SectionCard>;
}
export default function DashboardPage({state,role,onNavigate}){
  const cfg=roleConfig(role);
  const [year,setYear]=useState(currentDate().slice(0,4));
  const data=dashboardMetrics(state,role,year);
  const yearControl=<select aria-label="Año de indicadores" className={inputClass} value={year} onChange={e=>setYear(e.target.value)}>{attentionYears(state).map(value=><option key={value}>{value}</option>)}</select>;
  const header=<PageHeader eyebrow={cfg.scope} title="Inicio" actions={yearControl}/>;
  if(cfg.level==='establishment')return <div className="space-y-6">{header}
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <MetricCard label="Referencias generadas" value={data.referenceCount} icon={ClipboardList} tone="blue" onClick={()=>onNavigate('references')}/>
      <MetricCard label="Referencias pendientes de revisión" value={data.pending.length} icon={ClipboardList} tone="amber" onClick={()=>onNavigate('references')}/>
      <MetricCard label="Posibles referencias pendientes" value={data.possible} icon={AlertTriangle} tone="purple" onClick={()=>onNavigate('possibleReferences')}/>
      <MetricCard label="Niños con caso A.I. activo" value={new Set(data.active.map(c=>c.personId)).size} icon={Users} tone="teal" onClick={()=>onNavigate('cases')}/>
    </div>
    <div className="grid lg:grid-cols-2 gap-5"><Chart title="Referencias por estado" data={data.referenceStates} format="count"/>
      <SectionCard title="Referencias recientes"><div className="space-y-2">{data.recentRefs.map(r=><button key={r.id} onClick={()=>onNavigate('references',{referenceId:r.id})} className="block w-full text-left border rounded-xl p-3 text-sm">{r.consecutive||r.id} · {r.date} · <StatusBadge status={r.status}/></button>)}{!data.recentRefs.length&&<p>Sin referencias.</p>}</div></SectionCard></div>
    <SectionCard title="Acciones rápidas"><button onClick={()=>onNavigate('references',{newReference:true})} className="bg-teal-700 text-white px-4 py-2 rounded-xl">Nueva referencia</button></SectionCard>
  </div>;
  const coverage=<Coverage coverage={data.report.coverage} title={`Cobertura de atención · ${year}`}/>;
  const overdue=<MetricCard label="Actividades vencidas" value={data.overdue.length} icon={CalendarDays} tone="red" onClick={()=>onNavigate('schedule')}/>;
  if(cfg.level==='local')return <div className="space-y-6">{header}
    <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
      <MetricCard label="Posibles referencias pendientes" value={data.possible} icon={ClipboardList} tone="blue" onClick={()=>onNavigate('possibleReferences')}/>
      <MetricCard label="Referencias pendientes" value={data.pending.length} icon={ClipboardList} tone="amber" onClick={()=>onNavigate('references')}/>
      <MetricCard label="Casos activos" value={data.active.length} icon={FolderHeart} tone="teal" onClick={()=>onNavigate('cases')}/>
      <MetricCard label="Próximas sesiones" value={data.nextSessions.length} icon={BookOpenCheck} tone="purple" onClick={()=>onNavigate('sessions')}/>{overdue}
    </div>
    <div className="grid lg:grid-cols-2 gap-5"><Chart title="Programación por estado" data={data.scheduleStates} format="count"/><Chart title="Casos activos por prioridad" data={data.priority} format="count"/></div>
    <div className="grid lg:grid-cols-3 gap-5">{coverage}<MetricCard label="Casos activos sin atención efectiva en el año" value={data.report.withoutAttention} icon={FolderHeart} tone="amber" onClick={()=>onNavigate('cases')}/><SectionCard title="Actividades realizadas"><p className="text-3xl font-bold">{data.realizedRate.denominator?`${data.realizedRate.percentage.toFixed(1)} %`:'Sin actividades exigibles'}</p><p className="text-sm">{data.realizedRate.numerator} realizadas de {data.realizedRate.denominator} con fecha exigible en {year}. Incluye realizadas, programadas, canceladas y reprogramadas.</p></SectionCard></div>
    <SectionCard title="Antigüedad de referencias pendientes"><div className="flex flex-wrap gap-4">{data.referenceAge.map(row=><p key={row.name}>{row.name}: <b>{row.value}</b></p>)}{!data.referenceAge.length&&'Sin referencias pendientes.'}</div></SectionCard>
    {data.overdue.length>0&&<SectionCard title="Actividades vencidas">{data.overdue.slice(0,4).map(item=><button key={item.id} className="block text-left text-sm p-2" onClick={()=>onNavigate('schedule')}>{item.title} · {item.date} · Vencida</button>)}</SectionCard>}
  </div>;
  if(cfg.level==='regional')return <div className="space-y-6">{header}
    <div className="grid sm:grid-cols-3 gap-3"><MetricCard label="Casos activos de la Región" value={data.active.length} icon={FolderHeart} tone="teal" onClick={()=>onNavigate('cases')}/>{overdue}<MetricCard label="Atenciones realizadas en el año" value={data.report.events.length} icon={Users} tone="blue" onClick={()=>onNavigate('reporting')}/></div>
    <div className="grid lg:grid-cols-2 gap-5"><Chart title="Casos activos por Oficina Local" data={data.byOffice} format="count"/><Chart title="Cobertura por Oficina Local" data={data.officeCoverage} format="percent"/><Chart title="Programación por estado" data={data.scheduleStates} format="count"/>{coverage}</div>
    <SectionCard title="Consulta analítica"><button onClick={()=>onNavigate('reporting')} className="text-teal-700 font-semibold">Abrir reportería</button></SectionCard>
  </div>;
  return <div className="space-y-6">{header}
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3"><MetricCard label="Casos activos nacionales" value={data.active.length} icon={FolderHeart} tone="teal" onClick={()=>onNavigate('cases')}/><MetricCard label="Atenciones realizadas en el período" value={data.report.events.length} icon={Users} tone="blue" onClick={()=>onNavigate('reporting')}/>{overdue}<MetricCard label="Referencias registradas en el período" value={data.report.refs.length} icon={ClipboardList} tone="purple" onClick={()=>onNavigate('reporting')}/></div>
    <div className="grid lg:grid-cols-2 gap-5"><Chart title="Casos activos por Región" data={data.byRegion} format="count"/><Chart title="Cobertura por Región" data={data.regionCoverage} format="percent"/><Chart title="Tendencia mensual de atenciones realizadas" data={data.attentionTrend} format="count"/>{coverage}</div>
    <SectionCard title="Consulta analítica"><button onClick={()=>onNavigate('reporting')} className="text-teal-700 font-semibold">Abrir reportería</button></SectionCard>
  </div>;
}
