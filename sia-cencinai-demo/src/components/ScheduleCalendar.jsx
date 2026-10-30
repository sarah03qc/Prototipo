import React from 'react';
import { calendarDays, monthLabel, moveMonth } from '../utils/calendar';
import { currentDate } from '../utils/followUp';
import { isOverdue } from '../utils/schedule';
import { Badge, SectionCard, StatusBadge } from './ui';

export default function ScheduleCalendar({ activities, month, onMonthChange, onSelect }) {
  const today = currentDate();
  return <SectionCard title="Calendario mensual" description={`${activities.filter(a => a.date.startsWith(month)).length} actividad(es) en el mes con los filtros actuales.`}>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h3 className="font-semibold" aria-live="polite">{monthLabel(month)}</h3>
      <div className="flex gap-2">
        <button className="border rounded-lg px-3 py-2 text-sm" aria-label="Mes anterior" onClick={() => onMonthChange(moveMonth(month, -1))}>← Anterior</button>
        <button className="border rounded-lg px-3 py-2 text-sm" onClick={() => onMonthChange(today.slice(0, 7))}>Hoy</button>
        <button className="border rounded-lg px-3 py-2 text-sm" aria-label="Mes siguiente" onClick={() => onMonthChange(moveMonth(month, 1))}>Siguiente →</button>
      </div>
    </div>
    <div className="overflow-x-auto"><div className="min-w-[770px]">
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-stone-500">{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(day => <div key={day} className="py-2">{day}</div>)}</div>
      <div className="grid grid-cols-7 border-t border-l border-stone-200">{calendarDays(month, activities).map((cell, index) => <div key={cell?.date || `empty-${index}`} className={`min-h-32 p-2 border-b border-r border-stone-200 ${cell ? cell.date === today ? 'bg-teal-50/40' : 'bg-white' : 'bg-stone-50'}`}>
        {cell && <><time dateTime={cell.date} className={`text-xs font-semibold ${cell.date === today ? 'text-teal-800' : 'text-stone-500'}`}>{cell.day}</time><div className="space-y-2 mt-2">{cell.activities.map(item => <button key={item.id} onClick={() => onSelect(item.id)} aria-label={`${item.title}, ${cell.date}, ${isOverdue(item) ? 'Vencida' : item.status}`} className={`w-full text-left rounded-lg border p-1.5 space-y-1 [&>span]:text-[10px] [&>span]:px-1 focus:outline-none focus:ring-2 focus:ring-teal-500 ${isOverdue(item) ? 'bg-red-50 border-red-200 text-red-900' : 'border-stone-200 hover:border-teal-300'}`}>
          <p className="text-xs font-semibold break-words">{item.title}</p><p className="text-[10px] text-stone-500 break-words">{item.type}</p><StatusBadge status={item.status}/>{isOverdue(item) && <Badge tone="red">⚠ Vencida</Badge>}
        </button>)}</div></>}
      </div>)}</div>
    </div></div>
  </SectionCard>;
}
