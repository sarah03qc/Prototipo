# SIA-CENCINAI — Prototipo navegable de Atención Interdisciplinaria

Segunda iteración del prototipo del **Sistema de apoyo a la Atención Interdisciplinaria (SIA-CENCINAI)**.

Esta versión está orientada a **validación rápida con stakeholders**. No pretende representar todavía una implementación productiva ni sustituir SIDINACC.

## Objetivos de esta iteración

- Convertir historias de usuario y requerimientos en pantallas navegables.
- Validar flujo, terminología, variables y experiencia de usuario.
- Demostrar cómo reducir redigitación y fragmentación documental.
- Mostrar registro individual y grupal.
- Mostrar reportería y control de calidad Regional.
- Simular trabajo offline y captura asistida por OCR.

## Alcance de prototipo

### Navegable / interactivo

- Dashboard operativo.
- Personas y búsqueda.
- Referencias de A.I.
- Sesiones interdisciplinarias.
- Valoración situacional.
- Casos de A.I.
- Atenciones individuales.
- Intervenciones grupales multi-participante.
- Historial longitudinal.
- Hub documental.
- Reportería.
- Control de calidad.
- Consolidado Regional.
- Simulación offline.
- Simulación OCR con revisión humana.

### Simulado / no productivo

- Autenticación.
- Integraciones con SIDINACC/SINIRUBE.
- Persistencia de backend.
- OCR real.
- Sincronización offline real.
- Firma electrónica.
- Exportaciones institucionales.

## Datos

Todos los datos incluidos son **sintéticos y ficticios**.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir la URL indicada por Vite, normalmente `http://localhost:5173`.

## Estructura

```text
src/
├── components/
│   ├── AppShell.jsx
│   └── ui.jsx
├── data/
│   ├── catalogs.js
│   └── mockData.js
├── hooks/
│   └── usePrototypeStore.js
├── pages/
│   ├── DashboardPage.jsx
│   ├── PeoplePage.jsx
│   ├── ReferencesPage.jsx
│   ├── SessionsPage.jsx
│   ├── CasesPage.jsx
│   ├── InterventionsPage.jsx
│   ├── ReportingPage.jsx
│   ├── QualityPage.jsx
│   └── LabPage.jsx
├── App.jsx
├── index.css
└── main.jsx
```

## Notas funcionales

- La prioridad `Urgencia / Alto / Moderado / Bajo` corresponde al modelo objetivo del borrador 2026 y debe mantenerse configurable.
- Las variables de valoración situacional se basan en los ámbitos Individual, Hogar-Familiar y Comunitario documentados en los anexos del proyecto.
- El OCR se presenta bajo el principio **extraer → precargar → revisar → confirmar**.
- Una intervención grupal se registra una sola vez y se relaciona con múltiples participantes.
- El Consolidado Regional se representa como producto documental posterior al control de calidad y anterior al análisis/socialización Regional.

## Metodología prevista

```text
Prototipo → revisión con stakeholders → feedback → refinamiento de HU/RF → nueva iteración
```
