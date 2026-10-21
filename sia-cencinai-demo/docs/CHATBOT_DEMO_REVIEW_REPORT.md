# CHATBOT DEMO REVIEW REPORT

## Root cause of one-question bug

El código recibido ya ejecutaba `setLoading(false)` en `finally` después de una respuesta o un error terminado. No se confirmó una causa que bloquee invariablemente la segunda pregunta después de una respuesta exitosa; no se atribuye ese síntoma a un estado obsoleto sin evidencia.

Sí se identificó un camino de bloqueo: ni la petición del navegador ni la espera del SDK tenían un límite de tiempo explícito. Mientras una promesa no se resuelve, `finally` no se ejecuta y Enviar permanece deshabilitado. Se probó este camino con peticiones y cuerpos de respuesta que no terminan. Ahora hay cancelación y plazos de 55 segundos en servidor y 65 segundos en navegador. También se agregó un bloqueo síncrono por petición para evitar envíos duplicados antes de un nuevo render.

## Files changed in this review

- `src/pages/AssistantPage.jsx`
- `src/utils/assistantRequest.js` (nuevo)
- `server/index.js`
- `server/assistantHandler.js` (extracción del handler existente para probarlo con proveedor inyectado)
- `server/assistantErrors.js` (nuevo)
- `tests/assistant.test.js` (nuevo)
- `tests/assistant-demo-server.js` (nuevo; servidor exclusivo de pruebas)
- `docs/CHATBOT_DEMO_REVIEW_REPORT.md` (este reporte)

Se conservaron las modificaciones locales anteriores. No se modificaron otras pantallas, navegación, roles, datos mock, proveedor ni modelo.

## Results

- Multi-question conversation: **PASS**. Tres preguntas consecutivas, sin cambiar de vista/rol.
- Input re-enabled after success: **PASS**.
- Input re-enabled after generic error: **PASS**.
- Double-submit protection: **PASS**. Doble clic y Enter repetido durante espera; una sola consulta registrada.
- Navigation away/back: **PASS**. Nueva consulta disponible al regresar; cancelación al desmontar.
- Role change: **PASS**. Historial conservado mientras la página sigue montada; nueva petición usa el rol y ámbito actuales (Local → Nacional).
- Quota detection: **PASS**. HTTP 429, RESOURCE_EXHAUSTED, quota exceeded y rate limit.
- Raw Gemini/API error visible to user: **NO** en los errores ensayados. La UI usa exclusivamente mensajes locales por categoría, incluso si recibe JSON técnico, HTML o contenido inválido.
- Chat history preserved: **YES** durante la conversación y el cambio de rol. Salir de la vista y regresar inicia otra conversación, igual que antes; no se agregó persistencia.
- Auto-scroll: **PASS**. Desplazamiento del contenedor de conversación al último mensaje, sin desplazar la página desde el efecto.
- Functional scope changed: **NO**. Solo correcciones y pulido del chatbot solicitados.
- Build: **PASS**, con advertencia de bundle mayor a 500 kB.
- Lint: **PASS**, con las 17 advertencias previas en otros archivos; sin advertencias en los archivos del chatbot.

## User messages

**Quota:** “Se alcanzó el límite de consultas disponible para el asistente. Intente nuevamente más tarde.”

**Network / timeout:** “No fue posible conectarse con el asistente. Intente nuevamente.”

**Generic service error:** “No fue posible generar una respuesta en este momento. Intente nuevamente.”

**Configuration:** “El asistente no está disponible en este momento. Intente nuevamente más tarde.”

Estos avisos se muestran como respuestas dentro de la conversación y no se envían como respuestas del modelo en las consultas posteriores. El registro del servidor incluye solo categoría y estado, sin mensajes crudos, claves, contexto ni trazas del proveedor.

## Microcopy cleanup

Saludo: “¿En qué puedo ayudarle?”. Placeholder: “Escriba una consulta...”. Espera: “Generando respuesta...”. Se retiró el panel técnico de modelo, latencia y tokens; se mantiene el contexto útil del ámbito y los conteos. Misma ubicación, estructura principal e identidad visual.

## Tests/manual verification

`node --test tests/assistant.test.js`: **7/7 PASS**. Incluye SDK real con transporte HTTP simulado para validar tres turnos y el rol actual; éxito/error/éxito; clasificación de errores; respuestas inválidas; fallo de red; timeout de respuesta; timeout del servidor y cancelación.

Navegador: tres consultas consecutivas; recuperación tras error general, cuota, red, configuración y espera agotada; doble clic; Enter; rechazo de entrada vacía; cambio de rol; navegación de salida/regreso; historial y posición de scroll. El contador del servidor de pruebas confirmó una sola petición para el doble clic. Se inspeccionó visualmente la conversación y sus mensajes.

El servidor simulado está exclusivamente en `tests/assistant-demo-server.js`: no se importa desde la aplicación ni desde el servidor normal. Las pruebas automatizadas y los escenarios simulados no hacen consultas externas ni consumen cuota real. Al terminar se detuvo ese servidor y se probó una consulta con el servidor Gemini habitual: mostró el mensaje amigable de error general y el campo quedó disponible. No se obtuvo una respuesta exitosa real.

## Known limitations

- La consulta al servicio real no produjo respuesta exitosa. No se pudo validar una conversación real de tres turnos ni reproducir el síntoma original después de una primera respuesta exitosa. Los escenarios funcionales completos se validaron con transporte/proveedor controlado; no se atribuyó el fallo real a cuota sin una señal de cuota.
- El plazo máximo de una consulta no garantiza que el proveedor no haya empezado a procesarla antes de una cancelación.
- Se conserva el historial y su comportamiento previo por rol; no se implementan sesiones nuevas ni persistencia entre vistas.

Overall: **PASS_WITH_NOTES**.

Sin commit ni push.
