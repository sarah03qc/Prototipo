import React from 'react';
import { AlertTriangle, ArrowRight, BookOpenCheck, ClipboardList, Clock3, FolderHeart, RefreshCcw, Users } from 'lucide-react';
import { MetricCard, PageHeader, SectionCard, StatusBadge } from '../components/ui';

export default function DashboardPage({ state, onNavigate }) {
  const pendingReferences = state.references.filter((r) => ['Pendiente de revisión', 'Recibida'].includes(r.status)).length;
  const activeCases = state.cases.filter((c) => c.status === 'Activo').length;
  const nextSessions = state.sessions.filter((s) => s.status === 'Programada').length;
  const qualityPending = state.qualitySubmissions.filter((q) => q.status !== 'Validado').length;

  const urgentReferences = state.references.filter((r) => r.type === 'Urgencia' && r.status !== 'Admitida a A.I.');
  const pendingSync = state.syncItems.filter((s) => s.status !== 'Sincronizado');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel operativo"
        title="Buenos días. ¿Qué requiere atención hoy?"
        description="Vista de demostración para Oficina Local. Resume referencias, casos, sesiones, calidad y continuidad operativa."
        actions={<button onClick={() => onNavigate('references')} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2"><ClipboardList size={16} /> Nueva referencia</button>}
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricCard label="Referencias por revisar" value={pendingReferences} helper="Recibidas o pendientes" icon={ClipboardList} tone="amber" onClick={() => onNavigate('references')} />
        <MetricCard label="Casos activos" value={activeCases} helper="Atención interdisciplinaria" icon={FolderHeart} tone="teal" onClick={() => onNavigate('cases')} />
        <MetricCard label="Sesiones próximas" value={nextSessions} helper="Sesiones programadas" icon={BookOpenCheck} tone="purple" onClick={() => onNavigate('sessions')} />
        <MetricCard label="Revisiones regionales" value={qualityPending} helper="Pendientes o devueltas" icon={AlertTriangle} tone="red" onClick={() => onNavigate('quality')} />
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        <SectionCard title="Prioridad inmediata" description="Elementos que conviene revisar antes de continuar con el trabajo ordinario." className="xl:col-span-2">
          <div className="space-y-3">
            {urgentReferences.map((ref) => {
              const person = state.people.find((p) => p.id === ref.personId);
              return (
                <button key={ref.id} onClick={() => onNavigate('references')} className="w-full text-left border border-red-100 bg-red-50/70 rounded-xl p-4 flex items-center gap-3 hover:border-red-200">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center"><AlertTriangle size={17} /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap"><strong className="text-sm text-stone-900">{person?.name}</strong><StatusBadge status="Urgencia" /></div>
                    <p className="text-xs text-stone-600 mt-1">{ref.observations}</p>
                  </div>
                  <ArrowRight size={17} className="text-stone-400" />
                </button>
              );
            })}
            {urgentReferences.length === 0 && <p className="text-sm text-stone-500">No hay referencias urgentes pendientes en los datos de demostración.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Continuidad operativa" description="Estado de captura y sincronización.">
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-stone-600 flex items-center gap-2"><RefreshCcw size={15} /> Pendientes de sincronizar</span><strong>{pendingSync.length}</strong></div>
            <div className="flex items-center justify-between"><span className="text-sm text-stone-600 flex items-center gap-2"><Clock3 size={15} /> Conflictos</span><strong>{pendingSync.filter((s) => s.status === 'Conflicto').length}</strong></div>
            <button onClick={() => onNavigate('lab')} className="w-full mt-2 border border-stone-200 hover:bg-stone-50 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700">Abrir centro de sincronización</button>
          </div>
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <SectionCard title="Próxima sesión interdisciplinaria" description="La sesión puede analizar múltiples referencias sin duplicar datos.">
          {state.sessions[0] ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between"><div><p className="font-semibold text-stone-900">{state.sessions[0].date} · {state.sessions[0].startTime}</p><p className="text-xs text-stone-500">{state.sessions[0].place}</p></div><StatusBadge status={state.sessions[0].status} /></div>
              <p className="text-sm text-stone-600">{state.sessions[0].referenceIds.length} caso(s) incluidos · {state.sessions[0].participants.join(', ')}</p>
              <button onClick={() => onNavigate('sessions')} className="text-sm font-semibold text-teal-700 flex items-center gap-1">Abrir sesión <ArrowRight size={14} /></button>
            </div>
          ) : <p className="text-sm text-stone-500">No hay sesiones programadas.</p>}
        </SectionCard>

        <SectionCard title="Atenciones recientes" description="Vista combinada de intervenciones individuales y grupales.">
          <div className="space-y-3">
            {state.timeline.slice(0, 3).map((item) => {
              const c = state.cases.find((x) => x.id === item.caseId);
              const p = state.people.find((x) => x.id === c?.personId);
              return <div key={item.id} className="flex gap-3"><div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0"><Users size={15} /></div><div><p className="text-sm font-medium text-stone-800">{item.title}</p><p className="text-xs text-stone-500">{p?.name} · {item.date} · {item.discipline}</p></div></div>;
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
