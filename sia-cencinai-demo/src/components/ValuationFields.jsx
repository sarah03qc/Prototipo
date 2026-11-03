import React from 'react';
import FactorCategory from './FactorCategory';
import { Field, PriorityBadge, inputClass } from './ui';
import { FACTOR_GROUPS, toggleFactor } from '../utils/valuation';
import { RISK_LEVELS, PROTECTION_LEVELS } from '../data/catalogs';

export function ValuationFactors({valuation,setValuation,expanded,setExpanded,showValidation}) {
  return <>{[...new Set(FACTOR_GROUPS.map(c=>c.area))].map(area=><div key={area}><h4 className="font-bold text-sm mb-3">{area}</h4><div className="space-y-3">{FACTOR_GROUPS.filter(c=>c.area===area).map(category=><FactorCategory key={category.id} category={category} index={FACTOR_GROUPS.indexOf(category)} valuation={valuation} expanded={!!expanded[category.id]} onExpand={()=>setExpanded(e=>({...e,[category.id]:!e[category.id]}))} onToggle={item=>setValuation(v=>toggleFactor(v,category,item))} onDetail={(key,value)=>setValuation(v=>({...v,details:{...v.details,[key]:value}}))} showValidation={showValidation}/>)}</div></div>)}</>;
}

export function ValuationLevels({valuation,setValuation,priority}) {
  return <><Field label="Nivel de riesgo" required><select value={valuation.riskLevel} onChange={e=>setValuation({...valuation,riskLevel:e.target.value})} className={inputClass}><option value="">Seleccione nivel de riesgo</option>{RISK_LEVELS.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Nivel de protección" required><select value={valuation.protectionLevel} onChange={e=>setValuation({...valuation,protectionLevel:e.target.value})} className={inputClass}><option value="">Seleccione nivel de protección</option>{PROTECTION_LEVELS.map(x=><option key={x}>{x}</option>)}</select></Field><div className="md:col-span-2"><p className="text-xs font-semibold mb-2">Prioridad calculada</p><PriorityBadge priority={priority}/></div></>;
}
