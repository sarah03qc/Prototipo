import { classifyAssistantError } from './assistantErrors.js';
import { redactGroqDiagnostic } from './groqClient.js';

export function createAssistantHandler({ ai, model, timeoutMs = 55000, logError = console.error }) {
  return async (req, res) => {
    try {
      const {
        messages = [],
        context = {},
        role = 'Usuario',
        scope = 'No definido',
      } = req.body || {};

      const lastMessage = [...messages].reverse().find((message) => message?.role === 'user' && typeof message?.text === 'string' && message.text.trim());

      if (!lastMessage) {
        return res.status(400).json({ error: 'No se recibió una consulta válida.' });
      }

      const lastUserIndex = messages.lastIndexOf(lastMessage);
      const previousMessages = messages.slice(0, lastUserIndex).slice(-12);

      const history = previousMessages
        .filter((message) => ['user', 'assistant'].includes(message?.role) && !message.error && typeof message?.text === 'string' && message.text.trim())
        .map((message) => ({
          role: message.role,
          content: message.text.trim(),
        }));

      // Omit the initial greeting when sending the conversation to the provider.
      while (history[0]?.role === 'assistant') history.shift();

      const systemInstruction = `
Eres el asistente experimental del prototipo SIA-CENCINAI.

Tu función es apoyar consultas sobre la información SIMULADA de Atención Interdisciplinaria incluida en el contexto recibido.

REGLAS OBLIGATORIAS:
- Usa únicamente la información contenida en el contexto simulado suministrado en esta solicitud.
- No inventes clientes/beneficiarias, casos, referencias, actividades, fechas, estados ni resultados.
- Si la respuesta no puede obtenerse del contexto, indícalo claramente.
- Respeta estrictamente el rol y el ámbito autorizado indicados.
- Responde en español, de forma clara, breve y profesional.
- No emitas diagnósticos ni recomendaciones clínicas.
- No afirmes que estás consultando sistemas institucionales reales.
- Si haces un conteo o resumen, basa el resultado exclusivamente en los registros recibidos.

Rol actual: ${role}
Ámbito autorizado: ${scope}

CONTEXTO SIMULADO DEL PROTOTIPO:
${JSON.stringify(context, null, 2)}
`;

      const startedAt = Date.now();
      const controller = new AbortController();
      let timer;
      let response;
      try {
        response = await Promise.race([
          ai.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: systemInstruction },
              ...history,
              { role: 'user', content: lastMessage.text.trim() },
            ],
            temperature: 0.2,
          }, { signal: controller.signal }),
          new Promise((_, reject) => {
            timer = setTimeout(() => { controller.abort(); reject(Object.assign(new Error('Request timeout'), { name: 'TimeoutError' })); }, timeoutMs);
          }),
        ]);
      } finally { clearTimeout(timer); }
      const answer = response.choices?.[0]?.message?.content;
      if (typeof answer !== 'string' || !answer.trim()) {
        return res.status(503).json({ kind: 'service' });
      }
      const latencyMs = Date.now() - startedAt;

      return res.json({
        answer,
        model,
        latencyMs,
        usage: response.usage || null,
      });
    } catch (error) {
      // TEMPORARY: local diagnostics only. Production keeps the friendly error path.
      if (process.env.NODE_ENV !== 'production') {
        const httpStatus = Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
          ? error.status : 500;
        const diagnostic = redactGroqDiagnostic({
          name: error.name,
          httpStatus,
          statusText: error.statusText || '',
          body: error.body ?? { error: { message: error.message, type: error.type, code: error.code, param: error.param } },
          error: { message: error.message, type: error.type, code: error.code, param: error.param },
        });
        logError('TEMPORARY assistant diagnostic:', JSON.stringify(diagnostic, null, 2));
        return res.status(httpStatus).json({ diagnostic });
      }
      const failure = classifyAssistantError(error);
      // Only safe diagnostic categories; provider messages may contain credentials or request data.
      logError('Assistant request failed', failure);
      return res.status(failure.status).json({ kind: failure.kind });
    }
  };
}
