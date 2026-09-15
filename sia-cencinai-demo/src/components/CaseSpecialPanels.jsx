import React, { useState } from 'react';
import { AlertTriangle, ArrowRightLeft, Building2, LockKeyhole, Send, ShieldAlert } from 'lucide-react';
import { EXTERNAL_INSTITUTIONS } from '../data/catalogs';
import { AlertBanner, Badge, Field, SectionCard, inputClass } from './ui';

export function ExternalCoordinationPanel({ person }) {
  const [institution, setInstitution] = useState('CCSS');
  const [status, setStatus] = useState('Preparada');
  const [reason, setReason] = useState('Valoración especializada y continuidad de atención.');
  const [sent, setSent] = useState(false);

  return (
    <div className="grid xl:grid-cols-2 gap-5">
      <SectionCard title="Referencia interinstitucional" description="La persona se refiere a una institución/red; no se modela como referencia directa a una especialidad médica.">
        <div className="space-y-4">
          <Field label="Institución destino">
            <select value={institution} onChange={(e) => setInstitution(e.target.value)} className={inputClass}>
              {EXTERNAL_INSTITUTIONS.map((i) => <option key={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Persona referida"><input readOnly value={`${person?.name || ''} · ${person?.identification || ''}`} className={`${inputClass} bg-stone-50`} /></Field>
          <Field label="Motivo"><textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} /></Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Profesional OL responsable"><input defaultValue="Ana Morales — Psicología" className={inputClass} /></Field>
            <Field label="Estado"><select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>{['Preparada','Enviada','Recibida','En seguimiento','Cerrada'].map(s => <option key={s}>{s}</option>)}</select></Field>
          </div>
          <button onClick={() => { setSent(true); setStatus('Enviada'); }} className="bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"><Send size={15} /> Simular envío</button>
          {sent && <AlertBanner tone="green" title="Referencia marcada como enviada">La trazabilidad de envío y seguimiento queda asociada al caso.</AlertBanner>}
        </div>
      </SectionCard>

      <SectionCard title="Procesos diferenciados" description="Referencia, contra-referencia, RISA y denuncia no son el mismo documento.">
        <div className="space-y-3">
          {[
            ['Contra-referencia interinstitucional','Respuesta/continuidad desde CEN-CINAI hacia otra institución.','blue'],
            ['RISA','Referencia y contra-referencia intersectorial cuando corresponde a la red.','purple'],
            ['Denuncia','Proceso separado con acceso reforzado y trazabilidad especial.','red'],
          ].map(([title, desc, tone]) => <div key={title} className="border border-stone-200 rounded-xl p-4"><div className="flex items-start gap-3"><div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone==='red'?'bg-red-50 text-red-700':tone==='purple'?'bg-violet-50 text-violet-700':'bg-blue-50 text-blue-700'}`}>{tone==='red'?<ShieldAlert size={16}/>:<Building2 size={16}/>}</div><div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-stone-500 mt-1">{desc}</p>{tone==='red'&&<Badge tone="red" className="mt-2"><LockKeyhole size={11}/> Acceso restringido</Badge>}</div></div></div>)}
        </div>
      </SectionCard>
    </div>
  );
}

export function TransferPanel({ caseItem, person }) {
  const [form, setForm] = useState({
    date: '2026-09-15',
    origin: person?.localOffice || 'Oficina Local Alajuela',
    destination: 'Oficina Local Heredia',
    destinationRegion: 'Región Central Norte',
    destinationEstablishment: 'CEN Destino Demo',
    reason: 'Cambio de zona de residencia.',
    reportReady: true,
    fileComplete: true,
    sent: false,
    received: false,
  });

  return (
    <SectionCard title="Traslado entre Oficinas Locales" description="El traslado mantiene el caso y su historial; no corresponde a un cierre definitivo.">
      <div className="space-y-4">
        <AlertBanner tone="blue" title="Caso especial — traslado">Se verifica foliatura/completitud, se genera Reporte de situación atendida y se registra continuidad hacia la Oficina Local receptora.</AlertBanner>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Fecha"><input type="date" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} className={inputClass}/></Field>
          <Field label="Motivo"><input value={form.reason} onChange={(e)=>setForm({...form,reason:e.target.value})} className={inputClass}/></Field>
          <Field label="Oficina Local origen"><input readOnly value={form.origin} className={`${inputClass} bg-stone-50`}/></Field>
          <Field label="Oficina Local destino"><input value={form.destination} onChange={(e)=>setForm({...form,destination:e.target.value})} className={inputClass}/></Field>
          <Field label="Región destino"><input value={form.destinationRegion} onChange={(e)=>setForm({...form,destinationRegion:e.target.value})} className={inputClass}/></Field>
          <Field label="Establecimiento destino"><input value={form.destinationEstablishment} onChange={(e)=>setForm({...form,destinationEstablishment:e.target.value})} className={inputClass}/></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="border rounded-xl p-3 text-sm flex items-center gap-2"><input type="checkbox" checked={form.reportReady} onChange={(e)=>setForm({...form,reportReady:e.target.checked})} className="accent-teal-700"/> Reporte de situación atendida listo</label>
          <label className="border rounded-xl p-3 text-sm flex items-center gap-2"><input type="checkbox" checked={form.fileComplete} onChange={(e)=>setForm({...form,fileComplete:e.target.checked})} className="accent-teal-700"/> Expediente verificado / completo</label>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={()=>setForm({...form,sent:true})} className="border border-violet-200 text-violet-800 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"><ArrowRightLeft size={15}/> Simular envío</button>
          <button disabled={!form.sent} onClick={()=>setForm({...form,received:true})} className="bg-violet-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">Confirmar recepción</button>
        </div>
        {form.received && <AlertBanner tone="green" title="Traslado recibido">La Oficina Local destino puede continuar el mismo caso sin reconstruir su historial.</AlertBanner>}
      </div>
    </SectionCard>
  );
}
