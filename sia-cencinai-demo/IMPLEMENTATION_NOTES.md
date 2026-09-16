# Implementation Notes — Prototipo v3

**Fecha:** 16/09/2026

## Decisiones aplicadas

### 1. Simplificación de alcance

Se retiró completamente de la navegación y del estado del prototipo:

- `Control de calidad`;
- remisiones regionales;
- validar/devolver/re-enviar registros.

La reportería ahora consulta directamente los datos dentro del ámbito permitido.

### 2. Acceso jerárquico

Se modela:

`Nacional → Región → Oficina Local → Establecimiento`

`src/utils/access.js` centraliza la lógica de scope y filtros.

### 3. Búsqueda

`src/components/PersonSearch.jsx` implementa el patrón reutilizable de búsqueda por identificación/nombre.

No se recomienda volver a introducir selectores con universos completos de personas.

### 4. Referencias

`ReferencesPage.jsx` incluye:

- captura manual;
- búsqueda de persona;
- detalle para cualquier motivo/factor seleccionado;
- resumen final;
- impresión;
- flujo simulado de carga desde Excel estandarizado;
- descarga de plantilla compatible con Excel.

### 5. Sesiones / valoración

`SessionsPage.jsx` mantiene los tres ámbitos de valoración:

- Individual;
- Hogar-Familiar;
- Comunitario.

Se eliminaron intensidad/frecuencia/persistencia obligatorias.

Cada factor marcado puede recibir texto adicional.

### 6. Casos

`CasesPage.jsx` incluye:

- búsqueda y filtros;
- vista mínima para Establecimiento;
- timeline;
- plan;
- Documentos;
- Coordinaciones;
- Traslado;
- Reportes;
- Cierre.

Reportes y Cierre son acciones independientes.

### 7. Traslados

La OL origen cierra por traslado.

La OL destino recibe un elemento `Pendiente de continuidad`. Al confirmarlo, se crea la continuidad del caso en la OL destino conservando el historial conceptual.

El comportamiento exacto ante familias que no llegan sigue pendiente de validación.

### 8. Atenciones

`AttentionsPage.jsx` sustituye la antigua pantalla `InterventionsPage`.

Incluye:

- atención individual;
- atención grupal una sola vez;
- búsqueda de participantes;
- asociación a historiales individuales.

### 9. Programación

Nueva `SchedulePage.jsx`.

Estados:

- Programada;
- Realizada;
- Reprogramada;
- Cancelada.

Reprogramar exige nueva fecha y motivo. Cancelar exige motivo.

Regional/Nacional consultan sin editar.

### 10. Reporterías

`ReportingPage.jsx` agrega:

- año;
- filtros jerárquicos;
- estado/prioridad;
- disciplina/profesional;
- casos por estado;
- casos por prioridad;
- personas únicas atendidas;
- total de atenciones;
- consolidado dinámico;
- exportación compatible con Excel.

### 11. Laboratorio

`LabPage.jsx` deja explícitamente como experimental:

- OCR;
- offline/sincronización.

Excel estandarizado se muestra como contingencia prioritaria.

## Pendientes funcionales deliberados

- flujo definitivo `tamizaje → A.I.`;
- permisos exactos Regional/Nacional sobre detalle sensible;
- nombre/estado final de continuidad por traslado;
- tratamiento cuando una familia trasladada nunca llega;
- estructura definitiva de reportes;
- formato final de plantilla Excel;
- OCR real;
- sincronización offline real;
- integración con SIDINACC/CAH.

## Validación técnica realizada

Se verificó sintaxis de todos los `.js/.jsx` con el parser/transpilador de TypeScript en modo JSX y se comprobó la resolución de imports relativos.

La instalación de dependencias no se ejecutó en este entorno por falta de acceso a npm; por ello el build Vite debe verificarse localmente con `npm install && npm run build`.
