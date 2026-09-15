import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell } from 'recharts';
import { Filter, FileText, X, Users, CheckCircle2, AlertTriangle, Printer, ChevronRight, Baby, MessageCircle, Sparkles, Loader2, FileBarChart, Send } from 'lucide-react';

// ───────────────────────── Generación de datos simulados ─────────────────────────

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const weightedPick = (opciones) => {
  const total = opciones.reduce((s, o) => s + o.peso, 0);
  let r = rand() * total;
  for (const o of opciones) { if (r < o.peso) return o.valor; r -= o.peso; }
  return opciones[0].valor;
};

const REGIONES = {
  'Central Norte': ['Heredia Centro', 'Barva'],
  'Central Sur': ['Desamparados', 'Curridabat'],
  'Chorotega': ['Liberia', 'Nicoya'],
  'Huetar Norte': ['Ciudad Quesada', 'Los Chiles'],
  'Brunca': ['Pérez Zeledón', 'Golfito'],
};
const MOTIVOS = ['Crecimiento', 'Desarrollo', 'Salud', 'Riesgo social'];
const NOMBRES = [
  'Mateo', 'Sofía', 'Santiago', 'Valentina', 'Emiliano', 'Isabella', 'Diego', 'Camila',
  'Andrés', 'María José', 'Josué', 'Fernanda', 'Kevin', 'Génesis', 'Daniela', 'Luis Diego',
  'Ashley', 'Carlos', 'Melany', 'Esteban', 'Nicole', 'Kenneth', 'Pamela', 'Randall',
  'Yendry', 'Marvin', 'Katherine', 'Jefferson', 'Dayana', 'Brandon', 'Stephanie', 'Alexander',
];
const APELLIDOS = [
  'Rodríguez', 'Fernández', 'González', 'Vargas', 'Jiménez', 'Mora', 'Solano', 'Rojas',
  'Chacón', 'Araya', 'Alvarado', 'Chaves', 'Castro', 'Sánchez', 'Zamora', 'Elizondo',
  'Cordero', 'Salazar', 'Quesada', 'Villalobos', 'Barrantes', 'Campos', 'Umaña', 'Segura',
];
const PRIORIDADES = [
  { valor: 'Urgencia', peso: 12 },
  { valor: 'Alto', peso: 33 },
  { valor: 'Bajo-Moderado', peso: 55 },
];
const PRIORIDAD_COLOR = {
  'Urgencia': { bar: '#dc2626', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  'Alto': { bar: '#d97706', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Bajo-Moderado': { bar: '#059669', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

function generarNinos() {
  const ninos = [];
  let contador = 1;
  Object.entries(REGIONES).forEach(([region, oficinas]) => {
    oficinas.forEach((oficina) => {
      const cantidad = randInt(14, 24);
      for (let i = 0; i < cantidad; i++) {
        const prioridad = weightedPick(PRIORIDADES);
        const estado = rand() < 0.72 ? 'Activo' : 'Egresado';
        const numSesiones = randInt(3, 7);
        const base = prioridad === 'Urgencia' ? -2.3 : prioridad === 'Alto' ? -1.4 : -0.5;
        const baseDesarrollo = prioridad === 'Urgencia' ? 38 : prioridad === 'Alto' ? 55 : 70;
        const sesiones = Array.from({ length: numSesiones }, (_, mesIdx) => ({
          mes: `Mes ${mesIdx + 1}`,
          nutricional: +(base + mesIdx * (0.15 + rand() * 0.12) + (rand() - 0.5) * 0.2).toFixed(2),
          desarrollo: Math.min(100, Math.round(baseDesarrollo + mesIdx * (3 + rand() * 3) + (rand() - 0.5) * 4)),
        }));
        ninos.push({
          id: `NIN-${String(contador).padStart(4, '0')}`,
          nombre: `${pick(NOMBRES)} ${pick(APELLIDOS)} ${pick(APELLIDOS)}`,
          region,
          oficina,
          edadMeses: randInt(8, 130),
          prioridad,
          estado,
          motivoReferencia: pick(MOTIVOS),
          fechaIngreso: `${randInt(1, 28)}/${randInt(1, 12)}/${rand() < 0.5 ? 2025 : 2026}`,
          sesiones,
        });
        contador++;
      }
    });
  });
  return ninos;
}

function generarHistorialSesiones(nino) {
  const estrategias = ['Atención individualizada', 'Visita domiciliar', 'Consejería', 'Atención en contexto', 'Atención grupal'];
  const profesionales = ['Nutrición', 'Psicología', 'Terapia de Lenguaje', 'Educación Preescolar', 'Terapia Física'];
  return nino.sesiones.map((s, idx) => ({
    fecha: s.mes,
    estrategia: pick(estrategias),
    profesional: pick(profesionales),
  }));
}

// ───────────────────────── Componentes ─────────────────────────

function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
      {children}
    </span>
  );
}

function MetricCard({ label, value, icon: Icon, tint }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={16} className={tint || 'text-stone-400'} />}
      </div>
      <span className="text-2xl font-mono font-bold text-stone-900 tabular-nums">{value}</span>
    </div>
  );
}

function ReporteModal({ nivel, objetivo, resumen, onClose }) {
  return (
    <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-stone-200 p-5 flex items-start justify-between sticky top-0 bg-white rounded-t-2xl">
          <div>
            <p className="text-xs font-medium text-teal-700 uppercase tracking-wide mb-1">Reporte generado — {nivel}</p>
            <h3 className="text-lg font-bold text-stone-900">{objetivo}</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          {resumen.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
              <span className="text-sm text-stone-600">{item.label}</span>
              <span className="text-sm font-mono font-semibold text-stone-900 tabular-nums">{item.valor}</span>
            </div>
          ))}
        </div>
        <div className="p-5 pt-0 flex gap-2">
          <button className="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
            <Printer size={16} /> Imprimir / archivar en expediente
          </button>
        </div>
        <p className="px-5 pb-5 text-xs text-stone-400">Reporte simulado con fines de demostración — datos ficticios.</p>
      </div>
    </div>
  );
}

function ChatFlotante({ distribucionPrioridad }) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [pensando, setPensando] = useState(false);

  const PREGUNTAS_SUGERIDAS = [
    {
      id: 'normativa',
      texto: '¿Cuál es el plazo máximo para elaborar una referencia a A.I. no inmediata?',
      tipo: 'texto',
      respuesta: 'El plazo máximo es de 10 días hábiles a partir de la detección del caso, cuando corresponde a atención no inmediata.',
      fuente: 'PRO-AIAIM-P-01 — Procedimiento de Atención Interdisciplinaria',
    },
    {
      id: 'grafico',
      texto: 'Generame un gráfico con la distribución de prioridad de los casos activos',
      tipo: 'grafico',
      respuesta: 'Aquí tiene el gráfico solicitado, generado a partir de los casos activos según el filtro actual:',
    },
  ];

  function preguntar(p) {
    setMensajes((prev) => [...prev, { role: 'user', texto: p.texto }]);
    setPensando(true);
    setTimeout(() => {
      setMensajes((prev) => [...prev, { role: 'assistant', ...p }]);
      setPensando(false);
    }, 2600);
  }

  const preguntasDisponibles = PREGUNTAS_SUGERIDAS.filter(
    (p) => !mensajes.find((m) => m.role === 'assistant' && m.id === p.id)
  );

  return (
    <>
      {abierto && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[90vw] bg-white border border-stone-200 rounded-2xl shadow-xl z-40 flex flex-col overflow-hidden" style={{ maxHeight: '70vh' }}>
          <div className="bg-teal-800 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <div>
                <p className="text-sm font-bold leading-tight">Asistente CEN-CINAI</p>
                <p className="text-[11px] text-teal-200 leading-tight">Vista previa — a futuro, no incluido en el alcance actual</p>
              </div>
            </div>
            <button onClick={() => setAbierto(false)} className="text-teal-200 hover:text-white"><X size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
            {mensajes.length === 0 && (
              <p className="text-xs text-stone-400 text-center py-2">Probá una de las preguntas sugeridas abajo</p>
            )}
            {mensajes.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] ${m.role === 'user' ? '' : 'space-y-2'}`}>
                  <div className={`text-sm rounded-2xl px-3.5 py-2 ${m.role === 'user' ? 'bg-teal-700 text-white rounded-tr-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm'}`}>
                    {m.respuesta || m.texto}
                  </div>
                  {m.role === 'assistant' && m.tipo === 'texto' && (
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400 px-1">
                      <FileText size={11} /><span>Fuente: {m.fuente}</span>
                    </div>
                  )}
                  {m.role === 'assistant' && m.tipo === 'grafico' && (
                    <div className="bg-white border border-stone-200 rounded-xl p-2">
                      <div style={{ width: '100%', height: 130 }}>
                        <ResponsiveContainer>
                          <BarChart data={distribucionPrioridad}>
                            <XAxis dataKey="prioridad" tick={{ fontSize: 9, fill: '#78716c' }} />
                            <YAxis tick={{ fontSize: 9, fill: '#78716c' }} allowDecimals={false} width={22} />
                            <Bar dataKey="cantidad" radius={[3, 3, 0, 0]}>
                              {distribucionPrioridad.map((entry, i) => (
                                <Cell key={i} fill={PRIORIDAD_COLOR[entry.prioridad].bar} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-1"><FileBarChart size={11} /> Gráfico generado automáticamente</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {pensando && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-teal-600" />
                  <span className="text-xs text-stone-400">Pensando...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-stone-200 bg-white flex-shrink-0 space-y-1.5">
            {preguntasDisponibles.map((p) => (
              <button
                key={p.id}
                onClick={() => preguntar(p)}
                disabled={pensando}
                className="w-full text-left text-xs text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg px-3 py-2 disabled:opacity-50"
              >
                {p.texto}
              </button>
            ))}
            {preguntasDisponibles.length === 0 && !pensando && (
              <p className="text-[11px] text-stone-400 text-center mb-1.5">Fin de la demostración — funcionalidad completa a futuro</p>
            )}
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
              <span className="text-sm text-stone-400 flex-1 select-none">Escriba su consulta aquí...</span>
              <button className="w-7 h-7 rounded-lg bg-teal-700 flex items-center justify-center flex-shrink-0 hover:bg-teal-800">
                <Send size={13} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setAbierto((v) => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-lg flex items-center justify-center z-40 transition-transform hover:scale-105"
      >
        {abierto ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}

export default function App() {
  const ninos = useMemo(() => generarNinos(), []);
  const [tab, setTab] = useState('general');
  const [region, setRegion] = useState('Todas');
  const [oficina, setOficina] = useState('Todas');
  const [ninoId, setNinoId] = useState(ninos[0]?.id || '');
  const [centrosSel, setCentrosSel] = useState([]);
  const [modal, setModal] = useState(null);

  const oficinasDisponibles = region === 'Todas' ? [] : REGIONES[region];

  const ninosFiltrados = useMemo(() => {
    return ninos.filter((n) => (region === 'Todas' || n.region === region) && (oficina === 'Todas' || n.oficina === oficina));
  }, [ninos, region, oficina]);

  const kpis = useMemo(() => {
    const total = ninosFiltrados.length;
    const activos = ninosFiltrados.filter((n) => n.estado === 'Activo').length;
    const egresados = total - activos;
    const urgenciaAlto = ninosFiltrados.filter((n) => n.prioridad !== 'Bajo-Moderado').length;
    return { total, activos, egresados, pctUrgenciaAlto: total ? Math.round((urgenciaAlto / total) * 100) : 0 };
  }, [ninosFiltrados]);

  const distribucionPrioridad = useMemo(() => {
    const conteo = { 'Urgencia': 0, 'Alto': 0, 'Bajo-Moderado': 0 };
    ninosFiltrados.forEach((n) => conteo[n.prioridad]++);
    return Object.entries(conteo).map(([prioridad, cantidad]) => ({ prioridad, cantidad }));
  }, [ninosFiltrados]);

  const regionesResumen = useMemo(() => {
    return Object.keys(REGIONES).map((r) => {
      const grupo = ninos.filter((n) => n.region === r);
      const alto = grupo.filter((n) => n.prioridad !== 'Bajo-Moderado').length;
      const pct = grupo.length ? Math.round((alto / grupo.length) * 100) : 0;
      return { region: r, total: grupo.length, pct };
    });
  }, [ninos]);

  const ninoActivo = ninos.find((n) => n.id === ninoId);
  const ninosParaSelector = useMemo(() => {
    if (centrosSel.length > 0) return ninos.filter((n) => centrosSel.includes(n.oficina));
    return region === 'Todas' ? ninos : ninosFiltrados;
  }, [ninos, centrosSel, region, ninosFiltrados]);

  const centrosLista = useMemo(() => {
    const lista = [];
    Object.entries(REGIONES).forEach(([r, oficinas]) => oficinas.forEach((o) => lista.push({ region: r, oficina: o })));
    return lista;
  }, []);

  const kpisCentros = useMemo(() => {
    const grupo = ninos.filter((n) => centrosSel.length === 0 || centrosSel.includes(n.oficina));
    const total = grupo.length;
    const activos = grupo.filter((n) => n.estado === 'Activo').length;
    return { total, activos, egresados: total - activos };
  }, [ninos, centrosSel]);

  function toggleCentro(oficina) {
    setCentrosSel((prev) => (prev.includes(oficina) ? prev.filter((c) => c !== oficina) : [...prev, oficina]));
  }

  useEffect(() => {
    if (ninosParaSelector.length && !ninosParaSelector.find((n) => n.id === ninoId)) {
      setNinoId(ninosParaSelector[0].id);
    }
  }, [ninosParaSelector]);

  function abrirReporteNino(n) {
    setModal({
      nivel: 'Nivel niño',
      objetivo: `${n.nombre} (${n.id})`,
      resumen: [
        { label: 'Establecimiento', valor: n.oficina },
        { label: 'Región', valor: n.region },
        { label: 'Prioridad actual', valor: n.prioridad },
        { label: 'Estado', valor: n.estado },
        { label: 'Motivo de referencia', valor: n.motivoReferencia },
        { label: 'Sesiones registradas', valor: n.sesiones.length },
        { label: 'Fecha de ingreso', valor: n.fechaIngreso },
      ],
    });
  }

  function abrirReporteCentro() {
    const nombre = centrosSel.length === 0 ? 'Todos los centros' : centrosSel.length === 1 ? centrosSel[0] : `${centrosSel.length} centros seleccionados`;
    setModal({
      nivel: centrosSel.length > 1 ? 'Conjunto de centros' : 'Centro específico',
      objetivo: nombre,
      resumen: [
        { label: 'Total niños en A.I.', valor: kpisCentros.total },
        { label: 'Casos activos', valor: kpisCentros.activos },
        { label: 'Casos egresados', valor: kpisCentros.egresados },
      ],
    });
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <div className="bg-teal-800 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-bold tracking-tight">SIA-CENCINAI</h1>
            <p className="text-sm text-teal-200">Módulo de Atención Interdisciplinaria</p>
          </div>
          <span className="text-xs bg-teal-700 text-teal-100 px-3 py-1.5 rounded-full font-medium border border-teal-600">
            Prototipo — datos simulados, no reales
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-5">
        <div className="flex gap-1 border-b border-stone-200">
          {[
            { id: 'general', label: 'Vista Nacional/Regional', icon: Users },
            { id: 'centro', label: 'Vista por Oficina Local/Centro', icon: Filter },
            { id: 'nino', label: 'Vista por niño', icon: Baby },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                tab === t.id ? 'border-teal-700 text-teal-800' : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {tab === 'general' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 items-center bg-white border border-stone-200 rounded-xl p-3">
              <Filter size={16} className="text-stone-400" />
              <select
                value={region}
                onChange={(e) => { setRegion(e.target.value); setOficina('Todas'); }}
                className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white"
              >
                <option value="Todas">Nacional (todas las regiones)</option>
                {Object.keys(REGIONES).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {region !== 'Todas' && (
                <select value={oficina} onChange={(e) => setOficina(e.target.value)} className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white">
                  <option value="Todas">Todas las oficinas locales</option>
                  {oficinasDisponibles.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              <span className="text-xs text-stone-400 ml-auto">
                {region === 'Todas' ? 'Nivel nacional' : oficina === 'Todas' ? `Nivel regional — ${region}` : `Nivel local — ${oficina}`}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label="Total en A.I." value={kpis.total} icon={Users} tint="text-teal-600" />
              <MetricCard label="Casos activos" value={kpis.activos} icon={CheckCircle2} tint="text-emerald-600" />
              <MetricCard label="Egresados" value={kpis.egresados} icon={CheckCircle2} tint="text-stone-400" />
              <MetricCard label="% Urgencia + Alto" value={`${kpis.pctUrgenciaAlto}%`} icon={AlertTriangle} tint="text-amber-600" />
            </div>

            {region === 'Todas' && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-3">Comparativo por región — % de casos Urgencia + Alto</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {regionesResumen.map((r) => {
                    const tier = r.pct >= 50 ? 'high' : r.pct >= 30 ? 'mid' : 'low';
                    const tierStyle = { high: 'bg-red-50 border-red-200 text-red-700', mid: 'bg-amber-50 border-amber-200 text-amber-700', low: 'bg-emerald-50 border-emerald-200 text-emerald-700' }[tier];
                    return (
                      <button key={r.region} onClick={() => setRegion(r.region)} className={`text-left border rounded-xl p-3 hover:shadow-sm transition-shadow ${tierStyle}`}>
                        <p className="text-xs font-medium opacity-80">{r.region}</p>
                        <p className="text-xl font-mono font-bold mt-1">{r.pct}%</p>
                        <p className="text-xs opacity-70 mt-0.5">{r.total} niños en A.I.</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Distribución por nivel de prioridad</h3>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={distribucionPrioridad}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                    <XAxis dataKey="prioridad" tick={{ fontSize: 12, fill: '#78716c' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#78716c' }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                      {distribucionPrioridad.map((entry, idx) => (
                        <Cell key={idx} fill={PRIORIDAD_COLOR[entry.prioridad].bar} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab === 'nino' && ninoActivo && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
              <label className="text-xs font-medium text-stone-500">Seleccionar niño / niña</label>
              <select value={ninoId} onChange={(e) => setNinoId(e.target.value)} className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white flex-1 min-w-[160px]">
                {ninosParaSelector.map((n) => <option key={n.id} value={n.id}>{n.nombre} · {n.id} — {n.oficina}</option>)}
              </select>
              <span className="text-xs text-stone-400">
                {centrosSel.length > 0
                  ? `Mostrando ${ninosParaSelector.length} niños de: ${centrosSel.join(', ')}`
                  : `Mostrando ${ninosParaSelector.length} niños${region !== 'Todas' ? ` — ${region}` : ' (todos los centros)'}`}
              </span>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-stone-400 font-medium">Nombre (ficticio) · Identificador</p>
                  <h2 className="text-xl font-bold text-stone-900">{ninoActivo.nombre}</h2>
                  <p className="text-sm font-mono text-stone-400">{ninoActivo.id}</p>
                  <p className="text-sm text-stone-500 mt-1">{ninoActivo.oficina} · {ninoActivo.region} · {ninoActivo.edadMeses} meses</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={`${PRIORIDAD_COLOR[ninoActivo.prioridad].bg} ${PRIORIDAD_COLOR[ninoActivo.prioridad].text} ${PRIORIDAD_COLOR[ninoActivo.prioridad].border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${PRIORIDAD_COLOR[ninoActivo.prioridad].dot}`} />
                    {ninoActivo.prioridad}
                  </Badge>
                  <Badge className={ninoActivo.estado === 'Activo' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-stone-100 text-stone-600 border-stone-200'}>
                    {ninoActivo.estado}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-stone-100 text-sm">
                <div><p className="text-xs text-stone-400">Motivo de referencia</p><p className="font-medium text-stone-800">{ninoActivo.motivoReferencia}</p></div>
                <div><p className="text-xs text-stone-400">Fecha de ingreso</p><p className="font-medium text-stone-800">{ninoActivo.fechaIngreso}</p></div>
                <div><p className="text-xs text-stone-400">Sesiones registradas</p><p className="font-medium text-stone-800">{ninoActivo.sesiones.length}</p></div>
              </div>
              <button onClick={() => abrirReporteNino(ninoActivo)} className="mt-4 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
                <FileText size={16} /> Generar reporte
              </button>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Evolución de variables por sesión</h3>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <LineChart data={ninoActivo.sesiones}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#78716c' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#78716c' }} label={{ value: 'Z-score P/T', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#78716c' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#78716c' }} domain={[0, 100]} label={{ value: 'Desarrollo', angle: 90, position: 'insideRight', fontSize: 11, fill: '#78716c' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line yAxisId="left" type="monotone" dataKey="nutricional" name="Nutricional (Z P/T)" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="desarrollo" name="Desarrollo (puntaje)" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Historial de sesiones</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-stone-400 border-b border-stone-100">
                      <th className="py-2 font-medium">Fecha</th>
                      <th className="py-2 font-medium">Estrategia aplicada</th>
                      <th className="py-2 font-medium">Disciplina</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generarHistorialSesiones(ninoActivo).map((s, idx) => (
                      <tr key={idx} className="border-b border-stone-50 last:border-0">
                        <td className="py-2 text-stone-600">{s.fecha}</td>
                        <td className="py-2 text-stone-800">{s.estrategia}</td>
                        <td className="py-2 text-stone-600">{s.profesional}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'centro' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Seleccionar centro(s) — dejar vacío para ver todos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {centrosLista.map((c) => (
                  <label key={c.oficina} className={`flex items-center gap-2 text-sm border rounded-lg px-3 py-2 cursor-pointer ${centrosSel.includes(c.oficina) ? 'border-teal-400 bg-teal-50' : 'border-stone-200'}`}>
                    <input type="checkbox" checked={centrosSel.includes(c.oficina)} onChange={() => toggleCentro(c.oficina)} className="accent-teal-700" />
                    <span className="text-stone-700">{c.oficina}</span>
                    <span className="text-xs text-stone-400 ml-auto">{c.region}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="Total en A.I." value={kpisCentros.total} icon={Users} tint="text-teal-600" />
              <MetricCard label="Activos" value={kpisCentros.activos} icon={CheckCircle2} tint="text-emerald-600" />
              <MetricCard label="Egresados" value={kpisCentros.egresados} icon={CheckCircle2} tint="text-stone-400" />
            </div>

            <button onClick={abrirReporteCentro} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2">
              <FileText size={16} /> Generar reporte {centrosSel.length > 1 ? 'de conjunto de centros' : centrosSel.length === 1 ? 'del centro' : 'general'}
            </button>
          </div>
        )}
      </div>

      {modal && <ReporteModal {...modal} onClose={() => setModal(null)} />}
      <ChatFlotante distribucionPrioridad={distribucionPrioridad} />
    </div>
  );
}