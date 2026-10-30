# Cambios de valoración — 30 de octubre de 2026

## Archivos

Modificados:
- `src/pages/SessionsPage.jsx`: presentación de factores, validación de ambas decisiones, carga de factores históricos y selectores de disciplinas/estrategias.
- `src/pages/AttentionsPage.jsx`: selector de disciplinas de atención grupal.
- `src/pages/InterventionsPage.jsx`: selector equivalente en la pantalla legacy, sin reactivar su navegación ni cambiar su comportamiento restante.

Creados:
- `src/components/FactorCategory.jsx`: categoría colapsable controlada.
- `src/components/MultiSelect.jsx`: lista de casillas reutilizable.
- `src/utils/valuation.js`: agrupación desde el catálogo vigente, claves, exclusividad y comprobación de respuestas.
- `tests/valuation.test.js`: seis pruebas agrupadas de reglas, componentes y regresión.
- Este reporte.

## Comportamiento

1. Las nueve categorías existentes (protectores, riesgos y alertas en Individual, Hogar-Familiar y Comunitario) se presentan mediante botones reales con `aria-expanded`, `aria-controls` y regiones asociadas al encabezado. Se pueden abrir varias independientemente.
2. Todas comienzan colapsadas. Abrir/cerrar solo cambia el estado de presentación `expanded`; los factores y detalles permanecen en `valuation`, y el contenido permanece montado con `hidden`.
3. Cada encabezado muestra `Pendiente`, el número de factores seleccionados o `Ninguno`. Hay foco visible y controles nativos utilizables con teclado.
4. `Ninguno` es una respuesta explícita con la misma convención de claves existente: `área|grupo|Ninguno`. No modifica el catálogo institucional ni asigna puntuaciones. No tiene campo de detalle.
5. Seleccionar `Ninguno` elimina las selecciones y detalles de otros factores exclusivamente de ese grupo. Seleccionar un factor elimina `Ninguno`. Desmarcar la última respuesta deja la categoría pendiente.
6. Una categoría está respondida con uno o más factores vigentes, o con `Ninguno`. Una combinación contradictoria importada tampoco se considera válida.
7. Se bloquea la ejecución de `Confirmar y abrir caso A.I.` y `Registrar que no requiere A.I.` cuando hay categorías pendientes. Se conservan las condiciones previas de riesgo/protección y justificación.
8. El mensaje junto a las acciones usa `role="alert"` y enumera ámbito y grupo pendientes. Sus encabezados conservan el texto `Pendiente` y reciben borde de advertencia tras intentar confirmar. No depende solo del color.
9. Las disciplinas usan `MultiSelect`, un `fieldset` con `legend` visible y una lista de casillas. Sigue emitiendo arreglos de cadenas; `participants`, `disciplines` y `strategies` conservan sus estructuras.
10. Se cargan las selecciones y detalles históricos disponibles en la referencia; no se completa automáticamente ninguna categoría con `Ninguno`. La nueva validación actúa al confirmar. No hay limpieza de almacenamiento, migración de mocks ni escritura histórica al abrir/cerrar.
11. Riesgo y protección siguen siendo decisiones manuales con sus opciones anteriores. `calculatePriority` y su matriz no se modificaron. No existe sugerencia, scoring, pesos ni consulta a modelos basada en factores.
12. Los componentes nuevos permiten envolver etiquetas largas, contienen `min-w-0` y usan disposición vertical. La comprobación visual en ancho reducido queda pendiente.

## Revisión de chips

Modificados por ser entradas de multiselección:
- Disciplinas participantes al crear sesión.
- Disciplinas de la valoración.
- Estrategias de la valoración.
- Disciplinas en atención grupal.
- Disciplinas en el formulario grupal legacy de Intervenciones.

Conservados:
- `Badge`, `StatusBadge`, `PriorityBadge`, fuente y conexión: indicadores informativos.
- Disciplinas y estrategias en el plan de atención del caso; disciplinas en resúmenes grupales: visualizan datos ya guardados.
- Pasos, pestañas, botones de decisión Sí/No y selección de referencia/sesión: navegación o selección única.
- Motivos de referencia, participantes y asociaciones de programación que ya usan casillas/búsqueda: ya son controles estructurados y preservan su flujo validado.

## Verificaciones

- Suite completa: `node --test tests/*.test.js`: **78 aprobadas, 0 fallidas** (72 existentes y 6 nuevas).
- Las pruebas nuevas ejercitan los callbacks reales de los componentes controlados y comprueban expandir/colapsar, selección y detalles conservados, selección múltiple y arreglos emitidos.
- Las reglas prueban los nueve grupos, respuestas vacías/normales/Ninguno, exclusión en ambas direcciones, limpieza de detalles, independencia entre grupos, contradicciones importadas e inmutabilidad de datos anteriores.
- La prueba de sesión renderiza la página real con Vite/React, comprueba nueve categorías colapsadas y carga histórica; verifica en el código las guardas de ambos caminos de confirmación, el mensaje de pendientes y los selectores manuales. No sustituye una prueba de envío real en navegador.
- La regresión existente cubre las nueve combinaciones de riesgo/protección y las restricciones por rol, referencias, programación, atenciones, reportería y asistente.
- `npm run lint`: **salida 0**, seis advertencias preexistentes: variables/importaciones sin uso en Dashboard, Interventions y CaseSpecialPanels; efecto en PeoplePage; dependencias de efecto en AppShell. No hay advertencias nuevas en los componentes o reglas añadidos.
- `npm run build`: **salida 0**. Se observó una advertencia de tamaño de bundle superior a 500 kB; no impide compilar. No se realizaron cambios de empaquetado ajenos a esta tarea.
- `git diff --check`: **salida 0**.
- Sin nuevas dependencias, cambios de catálogos, cambios del asistente, commits, branches ni push.

## NEEDS_VALIDATION

La revisión manual de los cinco escenarios y la comprobación responsive/teclado en navegador no se completaron. El navegador integrado no logró acceder al servidor local; al intentar revisar Chrome, Computer Use detuvo el acceso porque no pudo determinar con suficiente confianza la URL actual para aplicar su política. No se realizaron más acciones de interfaz tras ese bloqueo.

Debe verificarse visualmente el flujo completo, especialmente la confirmación efectiva de ambas decisiones, persistencia de valores emitidos hacia las acciones reales, etiquetas largas a ancho reducido y foco de teclado. Las pruebas de reglas y callbacks de componentes sí finalizaron correctamente; no se declara validación visual ni cumplimiento WCAG completo.
