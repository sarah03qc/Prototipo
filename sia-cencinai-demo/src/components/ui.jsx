import React from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Info, ShieldAlert, Wifi, WifiOff } from 'lucide-react';

export function Badge({ children, tone='neutral', className='' }) {
  const tones={neutral:'bg-stone-100 text-stone-700 border-stone-200',teal:'bg-teal-50 text-teal-700 border-teal-200',green:'bg-emerald-50 text-emerald-700 border-emerald-200',amber:'bg-amber-50 text-amber-700 border-amber-200',red:'bg-red-50 text-red-700 border-red-200',purple:'bg-violet-50 text-violet-700 border-violet-200',blue:'bg-blue-50 text-blue-700 border-blue-200'};
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${tones[tone]||tones.neutral} ${className}`}>{children}</span>;
}

export function StatusBadge({ status }) {
  const s=String(status||'').toLowerCase(); let tone='neutral';
  if(s.includes('activo')||s.includes('realizada')||s.includes('sincronizado')) tone='green';
  if(s.includes('pendiente')||s.includes('programada')||s.includes('reprogramada')) tone='amber';
  if(s.includes('urgencia')||s.includes('conflicto')||s.includes('cancelada')) tone='red';
  if(s.includes('traslado')) tone='purple';
  if(s.includes('recibida')||s.includes('admitida')) tone='blue';
  return <Badge tone={tone}>{status||'—'}</Badge>;
}

export function PriorityBadge({ priority }) {
  const tone=priority==='Urgencia'?'red':priority==='Alto'?'amber':priority==='Moderado'?'blue':priority==='Bajo'?'green':'neutral';
  return <Badge tone={tone}>{priority||'Sin asignar'}</Badge>;
}

export function SourceBadge({ source }) { return <Badge tone="purple">Fuente: {source}</Badge>; }

export function MetricCard({ label,value,helper,icon:Icon,tone='teal',onClick }) {
  const iconTone={teal:'text-teal-600 bg-teal-50',green:'text-emerald-600 bg-emerald-50',amber:'text-amber-600 bg-amber-50',red:'text-red-600 bg-red-50',purple:'text-violet-600 bg-violet-50',blue:'text-blue-600 bg-blue-50'}[tone];
  const C=onClick?'button':'div';
  return <C onClick={onClick} className={`bg-white border border-stone-200 rounded-2xl p-4 text-left ${onClick?'hover:border-teal-300 hover:shadow-sm transition-all':''}`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{label}</p><p className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">{value}</p>{helper&&<p className="text-xs text-stone-400 mt-1">{helper}</p>}</div>{Icon&&<div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconTone}`}><Icon size={18}/></div>}</div></C>;
}

export function SectionCard({ title,description,action,children,className='' }) {
  return <section className={`bg-white border border-stone-200 rounded-2xl ${className}`}>{(title||description||action)&&<div className="px-5 py-4 border-b border-stone-100 flex items-start justify-between gap-4"><div>{title&&<h3 className="text-sm font-bold text-stone-900">{title}</h3>}{description&&<p className="text-xs text-stone-500 mt-1 max-w-3xl">{description}</p>}</div>{action}</div>}<div className="p-5">{children}</div></section>;
}

export function AlertBanner({ tone='amber',title,children }) {
  const cfg={amber:['bg-amber-50 border-amber-200 text-amber-900',AlertTriangle],red:['bg-red-50 border-red-200 text-red-900',ShieldAlert],green:['bg-emerald-50 border-emerald-200 text-emerald-900',CheckCircle2],blue:['bg-blue-50 border-blue-200 text-blue-900',Info]}[tone]||['bg-stone-50 border-stone-200 text-stone-800',Info];
  const Icon=cfg[1]; return <div className={`border rounded-xl px-4 py-3 flex gap-3 ${cfg[0]}`}><Icon size={18} className="mt-0.5 flex-shrink-0"/><div><p className="text-sm font-semibold">{title}</p><div className="text-xs mt-1 opacity-85">{children}</div></div></div>;
}

export function ConnectionBadge({ connection,pending=0 }) { const online=connection==='online'; return <Badge tone={online?'green':'amber'}>{online?<Wifi size={12}/>:<WifiOff size={12}/>} {online?'En línea':'Sin conexión'}{pending?` · ${pending} pendiente${pending===1?'':'s'}`:''}</Badge>; }
export function Field({ label,hint,children,required }) { return <label className="block"><span className="text-xs font-semibold text-stone-700">{label}{required&&<span className="text-red-500"> *</span>}</span>{hint&&<span className="block text-[11px] text-stone-400 mt-0.5">{hint}</span>}<div className="mt-1.5">{children}</div></label>; }
export const inputClass='w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white text-stone-800 outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400';
export function PageHeader({ eyebrow,title,description,actions }) { return <div className="flex items-start justify-between gap-4 flex-wrap"><div><p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">{eyebrow}</p><h2 className="text-2xl font-bold text-stone-950 mt-1">{title}</h2>{description&&<p className="text-sm text-stone-500 mt-1 max-w-4xl">{description}</p>}</div>{actions&&<div className="flex gap-2 flex-wrap">{actions}</div>}</div>; }
export function ProgressSteps({steps,current}) { return <div className="flex gap-2 flex-wrap">{steps.map((s,i)=><div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${i===current?'bg-teal-700 text-white':i<current?'bg-teal-50 text-teal-700':'bg-stone-100 text-stone-500'}`}><span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{i+1}</span>{s}</div>)}</div>; }
export function TimelineDot({type}) { const cls=type==='Cierre'?'bg-emerald-500':type?.includes('Sesión')?'bg-violet-500':type?.includes('Referencia')?'bg-blue-500':'bg-teal-500'; return <span className={`w-2.5 h-2.5 rounded-full ${cls}`}/>; }
export function DueLabel({date}) { return <span className="inline-flex items-center gap-1 text-xs text-stone-500"><Clock3 size={12}/>{date}</span>; }
export function HelpStrip({ children }) { return <div className="bg-sky-50 border border-sky-100 text-sky-900 rounded-xl px-4 py-3 text-xs flex gap-2"><Info size={15} className="flex-shrink-0 mt-0.5"/><span>{children}</span></div>; }
export function Tabs({ items,value,onChange }) { return <div className="flex gap-1 flex-wrap border-b border-stone-200">{items.map((x)=><button key={x.id} onClick={()=>onChange(x.id)} className={`px-3 py-2.5 text-sm font-semibold border-b-2 ${value===x.id?'border-teal-700 text-teal-800':'border-transparent text-stone-500 hover:text-stone-800'}`}>{x.label}</button>)}</div>; }
export function EmptyState({ title,description }) { return <div className="text-center py-10 text-stone-500"><Info className="mx-auto mb-2" size={22}/><p className="text-sm font-semibold text-stone-700">{title}</p>{description&&<p className="text-xs mt-1">{description}</p>}</div>; }
