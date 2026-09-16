# SIA-CENCINAI — Prototipo navegable v3

Prototipo de validación funcional para el módulo de **Atención Interdisciplinaria** de CEN-CINAI.

Esta iteración incorpora los hallazgos de la validación del prototipo realizada el **16 de septiembre de 2026** y busca acercar la experiencia a un flujo operativo real antes de iniciar una implementación productiva.

## Objetivo

Validar con stakeholders:

- funciones por rol;
- búsqueda y filtros;
- referencia a A.I.;
- sesión y valoración interdisciplinaria;
- gestión del caso;
- atenciones individuales y grupales;
- traslado;
- programación;
- reportería;
- mecanismos alternativos de captura.

Los datos incluidos son **100% sintéticos**.

## Cambios principales de v3

- Se elimina el módulo de **Control de calidad Regional** y el workflow validar/devolver/corregir.
- Se agrega el rol **Establecimiento** con acceso limitado.
- La navegación cambia según el nivel institucional.
- Personas/casos se buscan por **identificación** o nombre; se evitan dropdowns masivos.
- Se agregan filtros jerárquicos por ámbito.
- `Intervenciones` pasa a llamarse **Atenciones**.
- `Instrumentos` pasa a llamarse **Documentos**.
- `Reportes` y `Cierre` quedan separados.
- Se simplifica la valoración situacional eliminando intensidad/frecuencia/persistencia obligatorias.
- Todo factor seleccionado puede recibir una **especificación adicional**.
- Se refina el traslado: cierre por traslado en origen + ingreso pendiente de continuidad en destino.
- Se agrega **Programación** de sesiones y atenciones.
- La reportería incorpora año, filtros jerárquicos y diferencia personas únicas vs total de atenciones.
- Las consolidaciones se generan dinámicamente según filtros; no se “remiten” internamente.
- Se agrega exportación compatible con Excel de personas/casos/consolidado.
- Se prioriza **Excel estandarizado** como contingencia de captura.
- OCR y offline avanzado permanecen en **Laboratorio** como experimentales.

## Ejecutar

```bash
npm install
npm run dev
```

Para validar una compilación:

```bash
npm run build
```

## Roles de demostración

- Profesional / Asistente 3 — Establecimiento
- Profesional EE.II. — Oficina Local
- Jefatura — Oficina Local
- ATE / Dirección Regional
- UIVCD / UNAT — Nivel Nacional

## Navegación principal por rol

### Establecimiento

- Inicio
- Personas
- Referencias
- Lista de A.I.
- Laboratorio

### Oficina Local

- Inicio
- Personas
- Referencias
- Casos de A.I.
- Sesiones interdisciplinarias
- Atenciones
- Programación
- Reportería
- Laboratorio

### Regional / Nacional

- Inicio
- Personas
- Casos de A.I.
- Programación
- Reportería

## Nota de alcance

Este proyecto sigue siendo un **prototipo de validación**, no un sistema productivo. SIDINACC/CAH, OCR real, sincronización offline, autenticación institucional, permisos definitivos y persistencia backend todavía no se implementan.
