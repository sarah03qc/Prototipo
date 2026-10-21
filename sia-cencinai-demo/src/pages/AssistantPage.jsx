import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Database, Send, UserRound } from 'lucide-react';
import { PageHeader, SectionCard } from '../components/ui';
import { roleConfig, scopeItems } from '../utils/access';
import { ASSISTANT_ERRORS, requestAssistant } from '../utils/assistantRequest';

export default function AssistantPage({ state, role }) {
  const cfg = roleConfig(role);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '¿En qué puedo ayudarle?',
    },
  ]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef(null);
  const inputRef = useRef(null);
  const conversationRef = useRef(null);

  useEffect(() => () => {
    pendingRef.current?.abort();
    pendingRef.current = null;
  }, []);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus({ preventScroll: true });
  }, [loading]);

  const context = useMemo(() => {
    const people = scopeItems(state.people, role);
    const cases = scopeItems(state.cases, role);
    const references = scopeItems(state.references, role);
    const schedule = scopeItems(state.schedule, role);
    const caseIds = new Set(cases.map((item) => item.id));

    return {
      resumen: {
        clientesBeneficiarias: people.length,
        casosAI: cases.length,
        casosActivos: cases.filter((item) => item.status === 'Activo').length,
        referencias: references.length,
        actividadesProgramacion: schedule.length,
      },
      clientesBeneficiarias: people.map((item) => ({
        id: item.id,
        identificacion: item.identification,
        nombre: item.name,
        establecimiento: item.establishment,
        oficinaLocal: item.localOffice,
        region: item.region,
        modalidades: item.modalities,
      })),
      casosAI: cases.map((item) => ({
        id: item.id,
        personaId: item.personId,
        estado: item.status,
        prioridad: item.priority,
        apertura: item.openedAt,
        cierre: item.closedAt || null,
        establecimiento: item.establishment,
        oficinaLocal: item.localOffice,
        region: item.region,
        proximaAccion: item.nextAction || null,
        fechaProximaAccion: item.nextActionDate || null,
      })),
      referencias: references.map((item) => ({
        id: item.id,
        personaId: item.personId,
        tipo: item.type,
        estado: item.status,
        establecimiento: item.establishment,
        oficinaLocal: item.localOffice,
        region: item.region,
      })),
      programacion: schedule.map((item) => ({
        id: item.id,
        fecha: item.date,
        tipo: item.type,
        titulo: item.title,
        estado: item.status,
        establecimiento: item.establishment || null,
        oficinaLocal: item.localOffice,
        region: item.region,
      })),
      lineaTiempo: state.timeline
        .filter((item) => caseIds.has(item.caseId))
        .map((item) => ({
          casoId: item.caseId,
          fecha: item.date,
          tipo: item.type,
          titulo: item.title,
          disciplina: item.discipline,
          detalle: item.detail,
        })),
    };
  }, [state, role]);

  const send = async (event) => {
    event.preventDefault();
    const prompt = text.trim();
    if (!prompt || pendingRef.current) return;

    const controller = new AbortController();
    pendingRef.current = controller;
    const nextMessages = [...messages, { role: 'user', text: prompt }];
    setMessages(nextMessages);
    setText('');
    setLoading(true);

    try {
      const answer = await requestAssistant({
        messages: nextMessages.filter((message) => !message.error),
        context,
        role: cfg.label,
        scope: cfg.scope,
      }, { signal: controller.signal });
      if (pendingRef.current === controller) {
        setMessages((current) => [...current, { role: 'assistant', text: answer }]);
      }
    } catch (error) {
      if (pendingRef.current === controller && !controller.signal.aborted) {
        setMessages((current) => [...current, { role: 'assistant', text: ASSISTANT_ERRORS[error.kind] || ASSISTANT_ERRORS.service, error: true }]);
      }
    } finally {
      if (pendingRef.current === controller) {
        pendingRef.current = null;
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Función experimental"
        title="Asistente"
      />

      <div className="grid xl:grid-cols-[1fr_280px] gap-5">
        <SectionCard>
          <div ref={conversationRef} role="log" aria-label="Conversación" aria-live="polite" aria-busy={loading} className="h-[530px] overflow-y-auto bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                    <Bot size={18} />
                  </div>
                )}

                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-teal-700 text-white'
                      : message.error ? 'bg-amber-50 border border-amber-200 text-stone-700' : 'bg-white border border-stone-200 text-stone-700'
                  }`}
                >
                  {message.text}
                </div>

                {message.role === 'user' && (
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-stone-200 text-stone-600 flex items-center justify-center">
                    <UserRound size={17} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-sm text-stone-500">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                Generando respuesta...
              </div>
            )}
          </div>

          <form onSubmit={send} className="flex gap-2 mt-4">
            <input
              ref={inputRef}
              aria-label="Consulta al asistente"
              disabled={loading}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Escriba una consulta..."
              className="min-w-0 flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 bg-white"
            />
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="bg-teal-700 hover:bg-teal-800 text-white rounded-xl px-4 flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
            >
              <Send size={16} /> Enviar
            </button>
          </form>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Contexto de consulta">
            <div className="space-y-4 text-sm">
              <div className="flex gap-2">
                <Database size={16} className="text-teal-700 mt-0.5" />
                <div>
                  <p className="font-semibold">Datos 100% sintéticos</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-stone-400">Ámbito</p>
                <p className="font-semibold mt-1">{cfg.scope}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="border rounded-xl p-3">
                  <p className="text-xs text-stone-400">Clientes</p>
                  <p className="text-lg font-bold">{context.resumen.clientesBeneficiarias}</p>
                </div>
                <div className="border rounded-xl p-3">
                  <p className="text-xs text-stone-400">Casos activos</p>
                  <p className="text-lg font-bold">{context.resumen.casosActivos}</p>
                </div>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
