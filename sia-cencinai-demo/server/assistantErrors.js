export function classifyAssistantError(error) {
  const status = Number(error?.status || error?.code || error?.error?.code);
  const code = String(error?.code || error?.cause?.code || '');
  // Inspect provider details locally, but do not log or return their contents.
  const message = [error?.message, error?.code, error?.error?.status, error?.error?.message]
    .filter(value => typeof value === 'string').join(' ');
  if (status === 429 || /RESOURCE_EXHAUSTED|quota.*(?:exceed|exhaust)|(?:exceed|exhaust).*quota|rate[ _-]*limit/i.test(message)) {
    return { status: 429, kind: 'quota' };
  }
  if ([401, 403].includes(status) || /API_KEY_INVALID|API key not valid|API key expired|UNAUTHENTICATED/i.test(message)) {
    return { status: 503, kind: 'configuration' };
  }
  if (error?.name === 'AbortError' || error?.name === 'TimeoutError' || [408, 504].includes(status)
    || /ENOTFOUND|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|UND_ERR_CONNECT_TIMEOUT/.test(code)
    || /fetch failed|network error/i.test(message)) {
    return { status: 504, kind: 'network' };
  }
  return { status: 503, kind: 'service' };
}
