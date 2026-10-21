import test from 'node:test';
import assert from 'node:assert/strict';
import { GoogleGenAI } from '@google/genai';
import { createAssistantHandler } from '../server/assistantHandler.js';
import { classifyAssistantError } from '../server/assistantErrors.js';
import { ASSISTANT_ERRORS, requestAssistant } from '../src/utils/assistantRequest.js';

const payload = { messages: [{ role: 'user', text: '¿Cuántos casos?' }], context: {}, role: 'Local', scope: 'Alajuela' };
function response(status, data) { return { ok: status < 400, status, json: async () => data }; }
async function invoke(handler, body = payload) {
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  await handler({ body }, res);
  return res;
}

test('three consecutive turns use the real SDK history format and current role', async () => {
  const requests = [];
  const ai = new GoogleGenAI({ apiKey: 'test-only', httpOptions: { fetch: async (_url, init) => {
    requests.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'Respuesta de prueba' }] }, finishReason: 'STOP' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } } });
  const handler = createAssistantHandler({ ai, model: 'test-model', logError: () => {} });
  const messages = [{ role: 'assistant', text: '¿En qué puedo ayudarle?' }];
  for (let turn = 0; turn < 3; turn++) {
    messages.push({ role: 'user', text: `Consulta ${turn}` });
    const res = await invoke(handler, { ...payload, messages, role: turn === 2 ? 'Nacional' : 'Local' });
    assert.equal(res.statusCode, 200);
    messages.push({ role: 'assistant', text: res.body.answer });
  }
  assert.equal(requests.length, 3);
  assert.deepEqual(requests[2].contents.map(x => x.role), ['user', 'model', 'user', 'model', 'user']);
  assert.match(JSON.stringify(requests[2].systemInstruction), /Nacional/);
});

test('success, error, success remains available with no raw provider details', async () => {
  let calls = 0;
  const handler = createAssistantHandler({ model: 'test', logError: () => {}, ai: { chats: { create: () => ({ sendMessage: async () => {
    if (++calls === 2) throw new Error('SECRET provider stack');
    return { text: 'Respuesta' };
  } }) } } });
  const fetchImpl = async (_url, init) => {
    const res = await invoke(handler, JSON.parse(init.body));
    return response(res.statusCode, res.body);
  };
  assert.equal(await requestAssistant(payload, { fetchImpl }), 'Respuesta');
  await assert.rejects(requestAssistant(payload, { fetchImpl }), { message: ASSISTANT_ERRORS.service });
  assert.equal(await requestAssistant(payload, { fetchImpl }), 'Respuesta');
});

test('quota is distinguished from configuration, network and general service errors', () => {
  for (const error of [{ status: 429 }, new Error('RESOURCE_EXHAUSTED'), new Error('quota exceeded'), new Error('rate limit')]) {
    assert.equal(classifyAssistantError(error).kind, 'quota');
  }
  assert.equal(classifyAssistantError({ status: 401 }).kind, 'configuration');
  assert.equal(classifyAssistantError({ message: 'API key not valid' }).kind, 'configuration');
  assert.equal(classifyAssistantError({ cause: { code: 'ENOTFOUND' } }).kind, 'network');
  assert.equal(classifyAssistantError(new Error('failure')).kind, 'service');
});

test('HTTP errors and invalid proxy bodies never reach the UI verbatim', async () => {
  for (const [status, kind] of [[429, 'quota'], [401, 'configuration'], [500, 'service'], [502, 'network'], [504, 'network']]) {
    await assert.rejects(requestAssistant(payload, { fetchImpl: async () => response(status, { error: 'RESOURCE_EXHAUSTED secret key', detail: 'stack' }) }), { message: ASSISTANT_ERRORS[kind] });
  }
  await assert.rejects(requestAssistant(payload, { fetchImpl: async () => ({ ok: false, status: 500, json: async () => { throw new SyntaxError('HTML proxy error'); } }) }), { message: ASSISTANT_ERRORS.service });
  await assert.rejects(requestAssistant(payload, { fetchImpl: async () => response(200, { answer: '' }) }), { message: ASSISTANT_ERRORS.service });
});

test('network failure and a stalled response body time out and allow another request', async () => {
  await assert.rejects(requestAssistant(payload, { fetchImpl: async () => { throw new TypeError('Failed to fetch'); } }), { message: ASSISTANT_ERRORS.network });
  await assert.rejects(requestAssistant(payload, { timeoutMs: 10, fetchImpl: async () => ({ ok: true, status: 200, json: () => new Promise(() => {}) }) }), { message: ASSISTANT_ERRORS.network });
  assert.equal(await requestAssistant(payload, { fetchImpl: async () => response(200, { answer: 'Lista' }) }), 'Lista');
});

test('server deadline releases a hanging SDK request without disclosing details', async () => {
  const handler = createAssistantHandler({ model: 'test', timeoutMs: 10, logError: () => {}, ai: { chats: { create: () => ({ sendMessage: () => new Promise(() => {}) }) } } });
  const res = await invoke(handler);
  assert.deepEqual(res.body, { kind: 'network' });
  assert.equal(res.statusCode, 504);
});

test('unmount cancellation aborts the active request', async () => {
  const controller = new AbortController();
  let aborted = false;
  const pending = requestAssistant(payload, { signal: controller.signal, fetchImpl: async (_url, init) => {
    init.signal.addEventListener('abort', () => { aborted = true; });
    return new Promise(() => {});
  } });
  controller.abort();
  await assert.rejects(pending, { message: ASSISTANT_ERRORS.network });
  assert.equal(aborted, true);
});
