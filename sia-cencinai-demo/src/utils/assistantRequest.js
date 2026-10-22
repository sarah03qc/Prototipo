export const ASSISTANT_ERRORS = {
  quota: 'Se alcanzó el límite de consultas disponible para el asistente. Intente nuevamente más tarde.',
  network: 'No fue posible conectarse con el asistente. Intente nuevamente.',
  service: 'No fue posible generar una respuesta en este momento. Intente nuevamente.',
  configuration: 'El asistente no está disponible en este momento. Intente nuevamente más tarde.',
};

export class AssistantRequestError extends Error {
  constructor(kind) {
    super(ASSISTANT_ERRORS[kind] || ASSISTANT_ERRORS.service);
    this.kind = kind;
  }
}

export async function requestAssistant(payload, { signal, fetchImpl = fetch, timeoutMs = 65000 } = {}) {
  const controller = new AbortController();
  let timer;
  let onAbort;
  try {
    const cancelled = new Promise((_, reject) => {
      onAbort = () => {
        controller.abort();
        reject(new AssistantRequestError('network'));
      };
      if (signal?.aborted) onAbort();
      else signal?.addEventListener('abort', onAbort, { once: true });
      timer = setTimeout(onAbort, timeoutMs);
    });
    const result = (async () => {
      const response = await fetchImpl('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      // Temporary local diagnostics are explicitly supplied and redacted by the backend.
      let data;
      try { data = await response.json(); } catch { data = null; }
      if (!response.ok) {
        if (import.meta.env?.DEV && data?.diagnostic) {
          const diagnostic = data.diagnostic;
          const body = typeof diagnostic.body === 'string'
            ? diagnostic.body : JSON.stringify(diagnostic.body, null, 2);
          const error = new AssistantRequestError('service');
          error.diagnosticText = `HTTP ${diagnostic.httpStatus} ${diagnostic.statusText || ''}\n\n${body}`;
          throw error;
        }
        const kind = response.status === 429 ? 'quota'
          : [401, 403].includes(response.status) ? 'configuration'
          : [502, 504].includes(response.status) ? 'network'
          : Object.hasOwn(ASSISTANT_ERRORS, data?.kind) ? data.kind : 'service';
        throw new AssistantRequestError(kind);
      }
      if (typeof data?.answer !== 'string' || !data.answer.trim()) throw new AssistantRequestError('service');
      return data.answer.trim();
    })();
    return await Promise.race([result, cancelled]);
  } catch (error) {
    if (error instanceof AssistantRequestError) throw error;
    throw new AssistantRequestError(error instanceof TypeError || controller.signal.aborted ? 'network' : 'service');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
