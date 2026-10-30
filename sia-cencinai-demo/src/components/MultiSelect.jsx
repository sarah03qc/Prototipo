import React from 'react';

export default function MultiSelect({ label, options, value, onChange }) {
  return <fieldset className="min-w-0 border border-stone-200 rounded-xl p-3">
    <legend className="px-1 text-xs font-semibold text-stone-700">{label}</legend>
    <div className="space-y-2">{options.map(option => <label key={option} className="flex items-start gap-2 text-sm cursor-pointer break-words">
      <input type="checkbox" className="mt-1 shrink-0 accent-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700" checked={value.includes(option)} onChange={() => onChange(value.includes(option) ? value.filter(item => item !== option) : [...value, option])}/>
      <span className="min-w-0 break-words">{option}</span>
    </label>)}</div>
  </fieldset>;
}
