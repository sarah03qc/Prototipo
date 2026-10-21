// Backend-only client for Groq's official OpenAI-compatible endpoint.
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
            // Keep raw provider bodies and credentials out of logs and API responses.
            try { await response.body?.cancel(); } catch { /* Preserve the HTTP error category. */ }
            throw Object.assign(new Error('Provider request failed'), { status: response.status });
          }
          return response.json();
        },
      },
    },
  };
}
