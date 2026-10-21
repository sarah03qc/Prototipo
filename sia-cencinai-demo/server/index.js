import express from 'express';
import 'dotenv/config';
import { createGroqClient } from './groqClient.js';
import { createAssistantHandler } from './assistantHandler.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

app.use(express.json({ limit: '2mb' }));

if (!process.env.GROQ_API_KEY) {
  console.error('Falta GROQ_API_KEY. Cree un archivo .env a partir de .env.example.');
  process.exit(1);
}

const ai = createGroqClient({ apiKey: process.env.GROQ_API_KEY });

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, provider: 'Groq', model: MODEL });
});

app.post('/api/chat', createAssistantHandler({ ai, model: MODEL }));

app.listen(PORT, () => {
  console.log(`API Groq disponible en http://localhost:${PORT}`);
  console.log(`Modelo: ${MODEL}`);
});
