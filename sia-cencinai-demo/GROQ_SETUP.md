# Configuración del Asistente Groq

Para esta prueba local **no se necesita Nginx**.

1. Copie `.env.example` como `.env`.
2. En `.env`, coloque su clave:
   ```env
   GROQ_API_KEY=SU_CLAVE_DE_GROQ
   GROQ_MODEL=openai/gpt-oss-20b
   ```
3. Desde `sia-cencinai-demo`, ejecute:
   ```bash
   npm install
   npm run dev
   ```
4. Abra la URL local que muestra Vite y seleccione **Asistente** en el menú.

El comando `npm run dev` levanta simultáneamente:
- Frontend Vite/React.
- API local Express en `http://localhost:3001`.

El frontend usa `/api/chat` y Vite lo redirige al servidor local. La clave API permanece únicamente en el servidor y no se expone en el navegador.

Modelo configurado: `openai/gpt-oss-20b`.

Consultas sugeridas para la demostración:
- ¿Cuántos casos A.I. activos hay en mi ámbito?
- ¿Cuáles clientes/beneficiarias tienen un caso activo?
- ¿Qué actividades están programadas?
- ¿Cuál es el teléfono de Sofía Vargas? (prueba de dato inexistente: el asistente no debería inventarlo).

