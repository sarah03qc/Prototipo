import React, {useState} from 'react';
import { Field, SectionCard, inputClass } from './ui';

const button='border px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-40';

import { reportReady } from '../utils/reporting';

export default function ReportWizard({cut, onClose, renderVisual}) {
  const [selected,setSelected]=useState([]);
  const [step,setStep]=useState(-1);
  const [analyses,setAnalyses]=useState({});
  const [title,setTitle]=useState('');
  const [error,setError]=useState('');
  const current=selected[step];
  const review=step===selected.length;
  const visual=id=>cut.visuals.find(v=>v.id===id);
  const print=()=>{
    if(!reportReady(selected,analyses,title))return;
    const printWindow=window.open('','_blank');
    if(!printWindow){setError('Habilite las ventanas emergentes para imprimir el informe.');return;}
    const doc=printWindow.document;
    doc.title=title.trim();
    doc.documentElement.lang='es';
    const style=doc.createElement('style');
    style.textContent='body{font:14px system-ui;color:#1c1917;max-width:850px;margin:24px auto;padding:0 16px} section{break-inside:avoid;margin:24px 0;border-top:1px solid #aaa} p{white-space:pre-wrap} svg{max-width:100%} table{border-collapse:collapse} td,th{padding:4px 12px;text-align:left;border-bottom:1px solid #ddd} @media print{body{margin:0}}';
    doc.head.append(style);
    doc.body.append(doc.importNode(document.getElementById('report-review'),true));
    printWindow.focus();
    printWindow.print();
  };
  return <SectionCard title="Generar reporte">
    <div className="space-y-4">
      {step<0?<><p>Seleccione al menos 5 visualizaciones de las siguientes para incluir en su reporte</p>
        <div className="grid sm:grid-cols-2 gap-2">{cut.visuals.map(v=><label key={v.id} className="border p-2 rounded-xl flex gap-2"><input type="checkbox" checked={selected.includes(v.id)} onChange={e=>setSelected(e.target.checked?[...selected,v.id].sort((a,b)=>a-b):selected.filter(id=>id!==v.id))}/>{v.title}</label>)}</div>
        <p>{selected.length} seleccionadas</p>
      </>:review?<><Field label="Título del reporte" required><input className={inputClass} value={title} onChange={e=>setTitle(e.target.value)}/></Field>
        <article id="report-review"><h1 className="text-xl font-bold">{title.trim()}</h1><p>{cut.generatedAt}</p><p>Responsable: {cut.author}</p><p>Rol: {cut.role}</p><p>Ámbito: {cut.scope}</p><p>Período: {cut.year}</p><p>Filtros: {cut.filters.join(' · ')||'Todos'}</p>
          {selected.map(id=><section key={id} className="mt-4">{renderVisual(visual(id))}<h3 className="font-semibold mt-2">Análisis</h3><p className="whitespace-pre-wrap break-words">{analyses[id]}</p></section>)}
        </article>
      </>:<><p className="font-semibold">Visualización {step+1} de {selected.length}</p>{renderVisual(visual(current))}
        <Field label="Redacte el análisis de esta visualización" required><textarea rows={6} className={inputClass} value={analyses[current]||''} onChange={e=>setAnalyses({...analyses,[current]:e.target.value})}/></Field>
      </>}
      {error&&<p role="alert">{error}</p>}
      <div className="flex flex-wrap gap-2"><button className={button} onClick={onClose}>Cancelar</button>
        {step>=0&&<button className={button} onClick={()=>setStep(step-1)}>Anterior</button>}
        {review?<button className={button} disabled={!reportReady(selected,analyses,title)} onClick={print}>Imprimir / Guardar como PDF</button>:<button className={button} disabled={step<0?selected.length<5:!analyses[current]?.trim()} onClick={()=>setStep(step+1)}>Siguiente</button>}
      </div>
    </div>
  </SectionCard>;
}
