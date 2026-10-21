import express from 'express';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { createAssistantHandler } from './assistantHandler.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

app.use(express.json({ limit: '2mb' }));

if (!process.env.GEMINI_API_KEY) {
  console.error('Falta GEMINI_API_KEY. Cree un archivo .env a partir de .env.example.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, provider: 'Google Gemini', model: MODEL });
});

app.post('/api/chat', createAssistantHandler({ ai, model: MODEL }));

app.listen(PORT, () => {
  console.log(`API Gemini disponible en http://localhost:${PORT}`);
  console.log(`Modelo: ${MODEL}`);
});
