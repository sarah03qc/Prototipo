import { classifyAssistantError } from './assistantErrors.js';

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
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.text.trim() }],
        }));

      // Gemini funciona mejor cuando el historial conversacional comienza con el usuario.
      while (history[0]?.role === 'model') history.shift();

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

      const chat = ai.chats.create({
        model,
        history,
        config: {
          systemInstruction,
          temperature: 0.2,
          httpOptions: { timeout: timeoutMs },
        },
      });

      const startedAt = Date.now();
      const controller = new AbortController();
      let timer;
      let response;
      try {
        response = await Promise.race([
          chat.sendMessage({ message: lastMessage.text.trim(), config: { systemInstruction, temperature: 0.2, httpOptions: { timeout: timeoutMs }, abortSignal: controller.signal } }),
          new Promise((_, reject) => {
            timer = setTimeout(() => { controller.abort(); reject(Object.assign(new Error('Request timeout'), { name: 'TimeoutError' })); }, timeoutMs);
          }),
        ]);
      } finally { clearTimeout(timer); }
      if (typeof response.text !== 'string' || !response.text.trim()) {
        return res.status(503).json({ kind: 'service' });
      }
      const latencyMs = Date.now() - startedAt;

      return res.json({
        answer: response.text,
        model,
        latencyMs,
        usage: response.usageMetadata || null,
      });
    } catch (error) {
      const failure = classifyAssistantError(error);
      // Only safe diagnostic categories; provider messages may contain credentials or request data.
      logError('Assistant request failed', failure);
      return res.status(failure.status).json({ kind: failure.kind });
    }
  };
}
