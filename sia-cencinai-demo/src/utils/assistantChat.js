import { ROLES } from '../data/catalogs.js';

export const CHAT_STORAGE_KEY = 'sia-assistant-chat';
const ACTIVE_ROLE_KEY = 'sia-active-role';
const validRole = role => ROLES.some(r => r.id === role);
const completedMessages = messages => Array.isArray(messages) ? messages
  .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.text === 'string' && m.text.trim() && !m.error && !m.loading && !m.pending)
  .map(({ role, text }) => ({ role, text })) : [];

// Prototype-only local persistence. Never persist context, requests or diagnostics.
export function createAssistantChat(storage, fallbackRole = 'EEII_LOCAL') {
  const read = key => { try { return storage?.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { storage?.setItem(key, value); } catch { /* Storage may be unavailable. Keep the live conversation. */ } };
  const remove = key => { try { storage?.removeItem(key); } catch { /* Keep the live conversation usable. */ } };
  let saved;
  try { saved = JSON.parse(read(CHAT_STORAGE_KEY)); } catch { saved = null; }
  const activeRole = read(ACTIVE_ROLE_KEY);
  const roleId = validRole(activeRole) ? activeRole : validRole(saved?.roleId) ? saved.roleId : fallbackRole;
  let snapshot = { roleId, messages: saved?.version === 1 && saved.roleId === roleId ? completedMessages(saved.messages) : [] };
  if (saved && saved.roleId !== roleId) remove(CHAT_STORAGE_KEY);
  const listeners = new Set();
  let pending = null;
  const emit = () => listeners.forEach(listener => listener());
  const cancelRequest = () => { pending?.abort(); pending = null; };
  const persist = () => {
    const messages = completedMessages(snapshot.messages);
    if (messages.length) write(CHAT_STORAGE_KEY, JSON.stringify({ version: 1, roleId: snapshot.roleId, messages }));
    else remove(CHAT_STORAGE_KEY);
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    append(message) {
      snapshot = { ...snapshot, messages: [...snapshot.messages, message] };
      persist(); emit();
    },
    changeRole(role) {
      if (!validRole(role) || role === snapshot.roleId) return;
      cancelRequest(); remove(CHAT_STORAGE_KEY);
      write(ACTIVE_ROLE_KEY, role);
      snapshot = { roleId: role, messages: [] }; emit();
    },
    clear() {
      cancelRequest(); remove(CHAT_STORAGE_KEY);
      snapshot = { ...snapshot, messages: [] }; emit();
    },
    cancelRequest,
    beginRequest() {
      cancelRequest();
      const controller = new AbortController();
      pending = controller;
      return {
        signal: controller.signal,
        isCurrent: () => pending === controller && !controller.signal.aborted,
        finish() { if (pending === controller) pending = null; },
      };
    },
  };
}
