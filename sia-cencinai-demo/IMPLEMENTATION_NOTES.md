# SIA-CENCINAI — Implementation Notes v2

## Archivos reemplazados

- `src/App.jsx`
- `src/index.css`
- `README.md`

## Archivos nuevos

- `src/components/AppShell.jsx`
- `src/components/ui.jsx`
- `src/components/CaseSpecialPanels.jsx`
- `src/data/catalogs.js`
- `src/data/mockData.js`
- `src/hooks/usePrototypeStore.js`
- `src/pages/DashboardPage.jsx`
- `src/pages/PeoplePage.jsx`
- `src/pages/ReferencesPage.jsx`
- `src/pages/SessionsPage.jsx`
- `src/pages/CasesPage.jsx`
- `src/pages/InterventionsPage.jsx`
- `src/pages/ReportingPage.jsx`
- `src/pages/QualityPage.jsx`
- `src/pages/LabPage.jsx`

## Decisiones de implementación

1. Se conserva React + Vite + Tailwind ya presentes en el repositorio.
2. No se agregó React Router: la navegación se maneja en memoria para mantener la demo simple.
3. No se agregó backend: el estado vive en React y se persiste en `localStorage` para facilitar demostraciones.
4. Los datos demo se concentran en `src/data/mockData.js`.
5. Los catálogos funcionales y variables conocidas se concentran en `src/data/catalogs.js` para evitar strings dispersos.
6. La demo incluye un selector de rol para validar perspectivas Local / Regional / Nacional.
7. Offline y OCR se presentan como simulaciones funcionales, no como infraestructura real.

## Elementos marcados para validación

- Clasificación final de prioridad del borrador 2026.
- Código definitivo de Boleta de Valoración Situacional.
- Formato definitivo del Reporte de A.I.
- Campos exactos obligatorios por instrumento.
- Reglas exactas de acceso a instrumentos sensibles.
- Estrategia offline y persistencia local permitida.
- Instrumento físico prioritario para piloto OCR.
- Integraciones reales disponibles en SIDINACC.

## Demo sugerida

1. Inicio.
2. Personas → Sofía Vargas.
3. Referencias → Mateo Jiménez.
4. Sesiones → valorar Mateo.
5. Abrir caso.
6. Casos → registrar atención.
7. Intervenciones → crear grupal.
8. Personas/Casos → comprobar historial longitudinal.
9. Control de calidad → validar/devolver.
10. Reportería → Consolidado Regional.
11. Laboratorio → offline + OCR.
