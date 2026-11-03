import React, {useState} from 'react';
import { calculatePriority } from '../data/catalogs';
import { pendingFactorCategories } from '../utils/valuation';
import { valuationHistory } from '../utils/caseValuations';
import { Field, inputClass } from './ui';
import { ValuationFactors, ValuationLevels } from './ValuationFields';

export default function CaseValuations({caseItem,state,actions,role,editable}) {
  const [open,setOpen]=useState(false);
  const [sessionId,setSessionId]=useState('');
  const [valuation,setValuation]=useState({selected:{},details:{},riskLevel:'',protectionLevel:'',summary:''});
  const [expanded,setExpanded]=useState({});
  const [showValidation,setShowValidation]=useState(false);
  const priority=calculatePriority(valuation.riskLevel,valuation.protectionLevel);
  const sessions=state.sessions.filter(s=>(s.localOffice||s.place)===caseItem.localOffice);
  return <div className="space-y-4">
    {editable&&caseItem.status==='Activo'&&<button className="text-teal-700 font-semibold" onClick={()=>setOpen(!open)}>{open?'Cancelar':'Nueva valoración interdisciplinaria'}</button>}
    {open&&caseItem.status==='Activo'&&<div className="space-y-4 border rounded-xl p-4">
      <Field label="Sesión interdisciplinaria" required><select className={inputClass} value={sessionId} onChange={e=>setSessionId(e.target.value)}><option value="">Seleccione una sesión</option>{sessions.map(s=><option key={s.id} value={s.id}>{s.date} · {s.startTime} · {s.place}</option>)}</select></Field>
      <ValuationFactors {...{valuation,setValuation,expanded,setExpanded,showValidation}}/>
      <div className="grid sm:grid-cols-2 gap-4"><ValuationLevels {...{valuation,setValuation,priority}}/></div>
      <p>Prioridad anterior: {caseItem.priority}</p>
      <Field label="Resumen"><textarea className={inputClass} value={valuation.summary} onChange={e=>setValuation({...valuation,summary:e.target.value})}/></Field>
      <button className="bg-teal-700 text-white px-4 py-2 rounded-xl disabled:opacity-40" disabled={!priority||!sessionId} onClick={()=>{
        setShowValidation(true);
        if(pendingFactorCategories(valuation.selected).length)return;
        actions.reassessCase(role,caseItem.id,sessionId,valuation);
        setOpen(false);
      }}>Confirmar valoración</button>
    </div>}
    {[...valuationHistory(caseItem)].reverse().map(v=><details className="border rounded-xl p-3" key={v.id}><summary>Valoración {v.version} · {v.date} · {v.priority}</summary>
      <p>{v.responsible} · {v.sessionId}</p><p>Riesgo: {v.riskLevel} · Protección: {v.protectionLevel}</p><p>{v.summary}</p>
      {Object.entries(v.selected||{}).filter(([,chosen])=>chosen).map(([key])=><p key={key}>{key.split('|').at(-1)}</p>)}
      {Object.entries(v.details||{}).map(([factor,detail])=><p key={factor}>{factor}: {detail}</p>)}
    </details>)}
  </div>;
}
