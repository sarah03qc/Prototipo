// Test-only backend. Never imported by the normal app or server entry point.
import express from 'express';
import { createAssistantHandler } from '../server/assistantHandler.js';

const app = express();
app.use(express.json({ limit: '2mb' }));
const requests = [];
app.get('/api/test-requests', (_req, res) => res.json(requests));
const ai = { chat: { completions: { create: async ({ messages }) => {
  const message = messages.at(-1).content;
  if (message === 'Simular límite') throw Object.assign(new Error('rate_limit_exceeded quota exceeded secret test'), { status: 429 });
  if (message === 'Simular error') throw new Error('Raw provider stack test');
  if (message === 'Simular red') throw Object.assign(new Error('fetch failed'), { code: 'ENOTFOUND' });
  if (message === 'Simular configuración') throw Object.assign(new Error('API key not valid test'), { status: 401 });
  if (message === 'Simular espera') return new Promise(() => {});
  if (message === 'Consulta lenta') await new Promise(resolve => setTimeout(resolve, 2500));
  const scope = messages[0].content.match(/Ámbito autorizado: (.*)/)?.[1];
  return { choices: [{ message: { content: `Respuesta de prueba ${requests.length}. Ámbito actual: ${scope}.` } }], usage: null };
} } } };
app.post('/api/chat', (req, _res, next) => { requests.push({ messages: req.body.messages, role: req.body.role, scope: req.body.scope }); next(); }, createAssistantHandler({ ai, model: 'test-only', timeoutMs: 3500, logError: () => {} }));
app.listen(3001, '127.0.0.1', () => console.log('Chat test backend ready (no external requests).'));
