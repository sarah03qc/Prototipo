import React, { useMemo } from 'react';
import { BarChart3, CheckCircle2, FileBarChart, Layers3, MapPinned, Send } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge, MetricCard, PageHeader, SectionCard, StatusBadge } from '../components/ui';

export default function ReportingPage({ state, role }) {
  const active = state.cases.filter((c) => c.status === 'Activo').length;
  const closed = state.cases.filter((c) => c.status === 'Cerrado').length;
  const refs = state.references.length;
  const interventions = state.timeline.filter((t) => !['Sesión interdisciplinaria', 'Cierre'].includes(t.type)).length;

  const priorityData = useMemo(() => ['Urgencia','Alto','Moderado','Bajo'].map(priority => ({ priority, total: state.cases.filter(c=>c.priority===priority).length })), [state.cases]);
  const officeData = useMemo(() => {
    const offices = [...new Set(state.people.map((p) => p.localOffice))];
    return offices.map((office) => {
      const ids = state.people.filter((p) => p.localOffice === office).map((p) => p.id);
      return { office: office.replace('Oficina Local ', ''), cases: state.cases.filter((c) => ids.includes(c.personId)).length };
    });
  }, [state.people, state.cases]);

  const validated = state.qualitySubmissions.filter((q)=>q.status==='Validado');

  return <div className="space-y-6">
    <PageHeader eyebrow="Reportería y supervisión" title="Reportería" description="La reportería se alimenta de los registros operativos y separa el producto Consolidado Regional del análisis y retroalimentación posterior." />
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3"><MetricCard label="Referencias" value={refs} icon={Layers3} tone="blue"/><MetricCard label="Casos activos" value={active} icon={CheckCircle2} tone="teal"/><MetricCard label="Casos cerrados" value={closed} icon={CheckCircle2} tone="green"/><MetricCard label="Intervenciones" value={interventions} icon={BarChart3} tone="purple"/></div>
    <div className="grid xl:grid-cols-2 gap-5"><SectionCard title="Casos por prioridad" description="Resumen descriptivo; no reemplaza la valoración técnica."><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={priorityData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="priority" tick={{fontSize:12}}/><YAxis allowDecimals={false} tick={{fontSize:12}}/><Tooltip/><Bar dataKey="total" fill="#0f766e" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></SectionCard><SectionCard title="Casos por Oficina Local"><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={officeData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="office" tick={{fontSize:11}}/><YAxis allowDecimals={false} tick={{fontSize:12}}/><Tooltip/><Bar dataKey="cases" fill="#7c3aed" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></SectionCard></div>
    <SectionCard title="Producto documental — Consolidado Regional de A.I." description="Solo debe generarse a partir de información validada. El análisis/socialización sucede después.">
      <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="border-2 border-emerald-200 bg-emerald-50/50 rounded-2xl p-5">
          <div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><FileBarChart size={20}/></div><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Producto documental</p><h3 className="text-lg font-bold text-stone-900 mt-1">Consolidado Regional de A.I.</h3><p className="text-sm text-stone-600 mt-1">Integra información validada de las Oficinas Locales de la región.</p></div></div>
          <div className="grid sm:grid-cols-3 gap-3 mt-5">{[['Período','Septiembre 2026'],['OL validadas',validated.length],['Registros incluidos',validated.reduce((s,q)=>s+q.records,0)]].map(([l,v])=><div key={l} className="bg-white border border-emerald-100 rounded-xl p-3"><p className="text-xs text-stone-400">{l}</p><p className="text-sm font-bold mt-1">{v}</p></div>)}</div>
          <div className="flex gap-2 mt-5 flex-wrap"><button className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><FileBarChart size={15}/> Vista previa</button><button className="border border-emerald-300 text-emerald-800 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><Send size={15}/> Remitir a Nivel Nacional</button></div>
        </div>
        <div className="space-y-3"><div className="border border-stone-200 rounded-xl p-4"><p className="text-xs text-stone-400">Función Regional posterior</p><p className="text-sm font-semibold mt-1">Analizar y socializar resultados</p><p className="text-xs text-stone-500 mt-2">Definir acciones de mejora con Jefaturas de OL.</p></div><div className="border border-violet-200 bg-violet-50 rounded-xl p-4"><p className="text-xs text-violet-600">Vista según rol</p><p className="text-sm font-semibold mt-1">{role === 'NIVEL_NACIONAL' ? 'Consolidación país' : 'Seguimiento regional/local'}</p><div className="mt-2"><Badge tone="purple"><MapPinned size={12}/> Demo de rol</Badge></div></div></div>
      </div>
    </SectionCard>
  </div>;
}
