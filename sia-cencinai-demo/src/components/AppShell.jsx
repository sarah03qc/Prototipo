import React from 'react';
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  FileCheck2,
  FlaskConical,
  FolderHeart,
  Home,
  Menu,
  RefreshCw,
  Search,
  Settings2,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ROLES } from '../data/catalogs';
import { ConnectionBadge } from './ui';

const NAV = [
  { id: 'dashboard', label: 'Inicio', icon: Home },
  { id: 'people', label: 'Personas', icon: Users },
  { id: 'references', label: 'Referencias', icon: ClipboardList },
  { id: 'cases', label: 'Casos de A.I.', icon: FolderHeart },
  { id: 'sessions', label: 'Sesiones interdisciplinarias', icon: BookOpenCheck },
  { id: 'interventions', label: 'Intervenciones', icon: Activity },
  { id: 'reporting', label: 'Reportería', icon: BarChart3 },
  { id: 'quality', label: 'Control de calidad', icon: FileCheck2 },
  { id: 'lab', label: 'Laboratorio de demo', icon: FlaskConical },
];

export default function AppShell({
  activeView,
  onNavigate,
  role,
  onRoleChange,
  connection,
  pendingSync,
  onToggleConnection,
  onReset,
  children,
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const currentRole = ROLES.find((r) => r.id === role) || ROLES[0];

  const navList = (
    <nav className="space-y-1">
      {NAV.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => { onNavigate(id); setMobileOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeView === id ? 'bg-teal-50 text-teal-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Icon size={18} />
          <span className="text-left">{label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-stone-900">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-white border-r border-stone-200 z-30 flex-col">
        <div className="px-5 py-5 border-b border-stone-100">
          <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm mb-3">SIA</div>
          <h1 className="font-bold text-stone-950">SIA-CENCINAI</h1>
          <p className="text-xs text-stone-500 mt-1">Atención Interdisciplinaria</p>
          <span className="inline-flex mt-3 text-[10px] font-semibold uppercase tracking-wide bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-2 py-1">Prototipo navegable v2</span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">{navList}</div>
        <div className="p-4 border-t border-stone-100 space-y-3">
          <div className="text-[11px] text-stone-500">
            <span className="font-semibold text-stone-700">Demo:</span> datos 100% sintéticos.
          </div>
          <button onClick={onReset} className="w-full flex items-center justify-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 rounded-xl px-3 py-2 hover:bg-stone-50">
            <RefreshCw size={14} /> Restaurar demo
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-stone-900/30" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full bg-white shadow-xl p-4">
            <div className="flex items-center justify-between mb-4"><strong>SIA-CENCINAI</strong><button onClick={() => setMobileOpen(false)}><Menu size={20} /></button></div>
            {navList}
          </div>
        </div>
      )}

      <div className="lg:pl-72 min-h-screen">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-stone-200">
          <div className="px-4 md:px-6 py-3 flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center"><Menu size={18} /></button>
            <div className="hidden md:flex flex-1 max-w-xl items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
              <Search size={15} className="text-stone-400" />
              <span className="text-xs text-stone-400">Búsqueda global de persona, caso o referencia — demo</span>
            </div>
            <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
              <button onClick={onToggleConnection} className="hidden sm:block">
                <ConnectionBadge connection={connection} pending={pendingSync} />
              </button>
              <div className="relative">
                <Settings2 size={14} className="absolute left-2.5 top-2.5 text-stone-400 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => onRoleChange(e.target.value)}
                  className="pl-8 pr-8 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-700 max-w-[255px]"
                >
                  {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="px-4 md:px-6 pb-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>Vista actual: <strong className="text-stone-600">{currentRole.scope}</strong></span>
            <span className="sm:hidden flex items-center gap-1">{connection === 'online' ? <Wifi size={11} /> : <WifiOff size={11} />} {connection === 'online' ? 'En línea' : 'Sin conexión'}</span>
          </div>
        </header>

        <main className="p-4 md:p-6 xl:p-8 max-w-[1500px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
