import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Bot, Database, Send, Trash2, UserRound } from 'lucide-react';
import { PageHeader, SectionCard } from '../components/ui';
import { roleConfig } from '../utils/access';
import { buildAssistantContext } from '../utils/assistantContext.js';
import { ASSISTANT_ERRORS, requestAssistant } from '../utils/assistantRequest';

export default function AssistantPage({ state, role, chat }) {
  const cfg = roleConfig(role);
  const conversationState = useSyncExternalStore(chat.subscribe, chat.getSnapshot, chat.getSnapshot);
  const messages = useMemo(() => [{role:'assistant',text:'¿En qué puedo ayudarle?'}, ...conversationState.messages], [conversationState.messages]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const conversationRef = useRef(null);

  useEffect(() => () => chat.cancelRequest(), [chat]);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus({ preventScroll: true });
  }, [loading]);

  const context = useMemo(() => buildAssistantContext(state, role), [state, role]);

  const send = async (event) => {
    event.preventDefault();
    const prompt = text.trim();
    if (!prompt || loading) return;

    const request = chat.beginRequest();
    const nextMessages = [...messages, { role: 'user', text: prompt }];
    chat.append({ role: 'user', text: prompt });
    setText('');
    setLoading(true);

    try {
      const answer = await requestAssistant({
        messages: nextMessages.filter((message) => !message.error),
        context,
        role: cfg.label,
        scope: cfg.scope,
      }, { signal: request.signal });
      if (request.isCurrent()) {
        chat.append({ role: 'assistant', text: answer });
      }
    } catch (error) {
      if (request.isCurrent()) {
        chat.append({ role: 'assistant', text: (import.meta.env.DEV && error.diagnosticText) || ASSISTANT_ERRORS[error.kind] || ASSISTANT_ERRORS.service, error: true });
      }
    } finally {
      if (request.isCurrent()) {
        request.finish();
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Función experimental"
        title="Asistente"
        actions={<button className="border rounded-xl px-3 py-2 text-sm font-semibold flex items-center gap-2" onClick={()=>setConfirmClear(true)}><Trash2 size={15}/> Borrar chat</button>}
      />

      {confirmClear&&<SectionCard><div role="alertdialog" aria-modal="false" aria-labelledby="clear-chat-title" className="flex flex-wrap items-center justify-between gap-3"><p id="clear-chat-title" className="text-sm font-semibold">¿Desea borrar la conversación actual?</p><div className="flex gap-2"><button className="border rounded-lg px-3 py-2 text-sm" onClick={()=>setConfirmClear(false)}>Cancelar</button><button className="bg-red-700 text-white rounded-lg px-3 py-2 text-sm" onClick={()=>{chat.clear();setText('');setLoading(false);setConfirmClear(false)}}>Borrar</button></div></div></SectionCard>}
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
