import React from 'react';
import { Activity, BarChart3, Bell, BookOpenCheck, CalendarDays, ClipboardList, FlaskConical, FolderHeart, Home, Menu, RefreshCw, Search, Settings2, Users } from 'lucide-react';
import { ROLES } from '../data/catalogs';
import { roleConfig } from '../utils/access';
import { ConnectionBadge } from './ui';

const NAV = [
  {id:'dashboard',label:'Inicio',icon:Home,levels:['establishment','local','regional','national']},
  {id:'people',label:'Personas',icon:Users,levels:['establishment','local','regional','national']},
  {id:'references',label:'Referencias',icon:ClipboardList,levels:['establishment','local']},
  {id:'cases',label:'Casos de A.I.',icon:FolderHeart,levels:['establishment','local','regional','national']},
  {id:'sessions',label:'Sesiones interdisciplinarias',icon:BookOpenCheck,levels:['local']},
  {id:'attentions',label:'Atenciones',icon:Activity,levels:['local']},
  {id:'schedule',label:'Programación',icon:CalendarDays,levels:['local','regional','national']},
  {id:'reporting',label:'Reportería',icon:BarChart3,levels:['local','regional','national']},
  {id:'lab',label:'Laboratorio',icon:FlaskConical,levels:['establishment','local']},
];

export default function AppShell({activeView,onNavigate,role,onRoleChange,connection,pendingSync,onToggleConnection,onReset,onGlobalSearch,alertCount=0,children}){
  const [mobileOpen,setMobileOpen]=React.useState(false);
  const [search,setSearch]=React.useState('');
  const current=roleConfig(role);
  const items=NAV.filter(n=>n.levels.includes(current.level));
  React.useEffect(()=>{ if(!items.some(n=>n.id===activeView)) onNavigate('dashboard'); },[role]);
  const nav=<nav className="space-y-1">{items.map(({id,label,icon:Icon})=>{ const shownLabel = current.level==='establishment'&&id==='cases' ? 'Lista de A.I.' : label; return <button key={id} onClick={()=>{onNavigate(id);setMobileOpen(false)}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${activeView===id?'bg-teal-50 text-teal-800':'text-stone-600 hover:bg-stone-100'}`}><Icon size={18}/><span className="text-left">{shownLabel}</span></button>})}</nav>;
  const submit=(e)=>{e.preventDefault();if(search.trim()){onGlobalSearch(search.trim());setSearch('')}};
  return <div className="min-h-screen bg-[#f7f8f6] text-stone-900">
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-white border-r border-stone-200 z-30 flex-col">
      <div className="px-5 py-5 border-b border-stone-100"><div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm mb-3">SIA</div><h1 className="font-bold">SIA-CENCINAI</h1><p className="text-xs text-stone-500 mt-1">Atención Interdisciplinaria</p><span className="inline-flex mt-3 text-[10px] font-semibold uppercase bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-2 py-1">Prototipo navegable v3</span></div>
      <div className="p-4 flex-1 overflow-y-auto">{nav}</div>
      <div className="p-4 border-t border-stone-100"><p className="text-[11px] text-stone-500 mb-3"><b>Demo:</b> datos 100% sintéticos.</p><button onClick={onReset} className="w-full flex items-center justify-center gap-2 text-xs border border-stone-200 rounded-xl px-3 py-2 hover:bg-stone-50"><RefreshCw size={14}/> Restaurar demo</button></div>
    </aside>
    {mobileOpen&&<div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-stone-900/30" onClick={()=>setMobileOpen(false)}/><div className="relative w-72 h-full bg-white p-4 shadow-xl"><div className="flex justify-between mb-4"><b>SIA-CENCINAI</b><button onClick={()=>setMobileOpen(false)}><Menu size={20}/></button></div>{nav}</div></div>}
    <div className="lg:pl-72 min-h-screen">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="px-4 md:px-6 py-3 flex items-center gap-3"><button onClick={()=>setMobileOpen(true)} className="lg:hidden w-9 h-9 rounded-xl border flex items-center justify-center"><Menu size={18}/></button>
          <form onSubmit={submit} className="hidden md:flex flex-1 max-w-xl items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2"><Search size={15} className="text-stone-400"/><input value={search} onChange={e=>setSearch(e.target.value)} className="bg-transparent outline-none text-xs flex-1" placeholder="Buscar persona por cédula o nombre..."/></form>
          <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">{current.level==='local'&&<button onClick={()=>onNavigate('schedule')} className="relative w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50" title="Notificaciones"><Bell size={16}/>{alertCount>0&&<span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center">{alertCount}</span>}</button>}<button onClick={onToggleConnection} className="hidden sm:block"><ConnectionBadge connection={connection} pending={pendingSync}/></button><div className="relative"><Settings2 size={14} className="absolute left-2.5 top-2.5 text-stone-400 pointer-events-none"/><select value={role} onChange={e=>onRoleChange(e.target.value)} className="pl-8 pr-8 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium max-w-[285px]">{ROLES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select></div></div>
        </div>
        <div className="px-4 md:px-6 pb-2 text-[11px] text-stone-400">Ámbito de demostración: <b className="text-stone-600">{current.scope}</b></div>
      </header>
      <main className="p-4 md:p-6 xl:p-8 max-w-[1500px] mx-auto">{children}</main>
    </div>
  </div>;
}
