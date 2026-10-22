// Backend-only client for Groq's official OpenAI-compatible endpoint.
export function redactGroqDiagnostic(value, apiKey = process.env.GROQ_API_KEY) {
  if (typeof value === 'string') {
    let text = apiKey ? value.split(apiKey).join('[REDACTED]') : value;
    if (apiKey) text = text.split(JSON.stringify(apiKey).slice(1, -1)).join('[REDACTED]');
    return text.replace(/\bBearer\s+[^\s"'<>]+/gi, 'Bearer [REDACTED]')
      .replace(/\bgsk_[a-zA-Z0-9_-]+/g, '[REDACTED]')
      .replace(/((?:api[_-]?key|authorization|password|secret|access[_-]?token)["']?\s*[:=]\s*["']?)[^\s"',;}]+/gi, '$1[REDACTED]');
  }
  if (Array.isArray(value)) return value.map(item => redactGroqDiagnostic(item, apiKey));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      /^(?:authorization|.*api[_-]?key|password|.*secret.*|access[_-]?token|refresh[_-]?token)$/i.test(key)
        ? '[REDACTED]' : redactGroqDiagnostic(item, apiKey),
    ]));
  }
  return value;
}

export function createGroqClient({ apiKey, fetchImpl = fetch }) {
  return {
    chat: {
      completions: {
        async create(payload, { signal } = {}) {
          const response = await fetchImpl('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal,
          });
          if (!response.ok) {
            // Temporary local diagnostic: read the complete body before handling the error.
            const originalBody = await response.text();
            let body;
            try { body = redactGroqDiagnostic(JSON.parse(originalBody), apiKey); }
            catch { body = redactGroqDiagnostic(originalBody, apiKey); }
            const rawBody = redactGroqDiagnostic(originalBody, apiKey);
            const providerError = body?.error || body;
            throw Object.assign(new Error(
              typeof providerError?.message === 'string' ? providerError.message : 'Groq request failed',
            ), {
              name: 'GroqProviderError',
              status: response.status,
              statusText: redactGroqDiagnostic(response.statusText, apiKey),
              body,
              rawBody,
              providerError,
              type: providerError?.type,
              code: providerError?.code,
              param: providerError?.param,
            });
          }
          return response.json();
        },
      },
    },
  };
}
