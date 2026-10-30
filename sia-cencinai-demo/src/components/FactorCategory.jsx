import React from 'react';
import { categoryResponse, factorKey } from '../utils/valuation.js';
import { inputClass } from './ui';

export default function FactorCategory({ category, index, valuation, expanded, onExpand, onToggle, onDetail, showValidation }) {
  const response = categoryResponse(category, valuation.selected);
  const id = `factor-category-${index}`;
  const status = !response.valid ? 'Pendiente' : response.none ? 'Ninguno' : `${response.count} seleccionado(s)`;
  return <section className={`min-w-0 border rounded-xl ${showValidation && !response.valid ? 'border-amber-500' : 'border-stone-200'}`}>
    <h5><button type="button" id={`${id}-heading`} aria-expanded={expanded} aria-controls={id} onClick={onExpand} className="w-full flex flex-wrap items-center justify-between gap-2 p-3 text-left rounded-xl focus-visible:outline-2 focus-visible:outline-teal-700">
      <span className="text-sm font-semibold">{expanded ? '▾' : '▸'} {category.label}</span>
      <span className="text-xs text-stone-600">{status}</span>
    </button></h5>
    <div id={id} role="region" aria-labelledby={`${id}-heading`} hidden={!expanded} className="p-3 pt-0 space-y-2">
      <p className="text-xs text-stone-500">Seleccione los factores identificados o Ninguno si revisó la categoría y no identificó factores aplicables.</p>
      {[...category.items, 'Ninguno'].map(item => {
        const key = factorKey(category, item);
        return <div key={key} className={`border rounded-xl p-2.5 ${valuation.selected[key] ? 'border-teal-300 bg-teal-50/40' : 'border-stone-200'}`}>
          <label className="flex items-start gap-2 text-xs cursor-pointer"><input type="checkbox" className="accent-teal-700 shrink-0 mt-0.5 focus-visible:outline-2 focus-visible:outline-teal-700" checked={!!valuation.selected[key]} onChange={() => onToggle(item)}/><span className="min-w-0 break-words">{item}</span></label>
          {item !== 'Ninguno' && valuation.selected[key] && <input aria-label={`Detalle: ${item}`} value={valuation.details[key] || ''} onChange={e => onDetail(key, e.target.value)} className={`${inputClass} mt-2 text-xs`} placeholder="Detalle del factor (opcional)"/>}
        </div>;
      })}
    </div>
  </section>;
}
