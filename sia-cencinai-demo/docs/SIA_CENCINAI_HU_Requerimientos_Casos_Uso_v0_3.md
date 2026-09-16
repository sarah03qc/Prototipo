# SIA-CENCINAI — Historias de Usuario, Requerimientos y Casos de Uso

**Versión:** 0.3  
**Fecha:** 16 de septiembre de 2026  
**Estado:** Descubrimiento / refinamiento funcional / validación mediante prototipo  
**Producto:** Sistema de apoyo a la Atención Interdisciplinaria (SIA-CENCINAI)

> [!IMPORTANT]
> Este documento constituye un **backlog vivo de descubrimiento y especificación funcional**. No todo lo contenido aquí representa todavía un requerimiento institucionalmente aprobado.
>
> Cada elemento se marca según su nivel de certeza:
>
> - **CONFIRMADO / OPERATIVO:** respaldado por instrumentos, práctica observada o validación directa con la contraparte.
> - **MODELO OBJETIVO / BORRADOR 2026:** deriva del nuevo procedimiento de Atención Interdisciplinaria aún en construcción.
> - **PROPUESTA DE DISEÑO:** solución de producto derivada de una necesidad observada.
> - **EXPERIMENTAL:** funcionalidad que se desea explorar sin comprometerla aún como núcleo del producto.
> - **PENDIENTE:** requiere confirmación institucional, normativa o técnica.
>
> A partir de esta versión se incorporan **Casos de Uso (CU)** para describir los flujos funcionales de manera más concreta y mantener trazabilidad entre actores, historias de usuario, requerimientos, prototipo y futuras implementaciones.

---

# 1. Objetivo del documento

Consolidar progresivamente:

1. Historias de usuario.
2. Requerimientos funcionales.
3. Requerimientos no funcionales.
4. Reglas de negocio.
5. Casos de uso.
6. Entidades y datos principales.
7. Accesos y comportamiento por rol.
8. Requerimientos de reportería y analítica.
9. Integraciones, captura alternativa y migración.
10. Preguntas abiertas y decisiones pendientes.

La trazabilidad objetivo es:

**Proceso institucional → flujograma → instrumentos/variables → historias de usuario → requerimientos → casos de uso → prototipo → implementación.**

---

# 2. Cambios de alcance incorporados en v0.3

Esta versión incorpora la validación del prototipo realizada con Alina el 16/09/2026.

## 2.1 Simplificaciones adoptadas

- Se elimina del alcance actual la pestaña/módulo independiente de **Control de Calidad Regional**.
- Se elimina el workflow artificial de `Regional valida → devuelve → OL corrige → reenvía`.
- La reportería se concibe como una **capa de consulta y analítica sobre los datos operativos**, no como un proceso paralelo de aprobación.
- Se eliminan de la valoración situacional los campos obligatorios de **intensidad, frecuencia y persistencia**, debido a su alta subjetividad y dificultad operativa.
- Se reemplazan selectores masivos de personas/casos por **búsqueda por identificación o nombre**.
- `Intervenciones` pasa a denominarse **Atenciones**.
- `Instrumentos` dentro del caso pasa a denominarse **Documentos**.
- `Reportes` y `Cierre` se separan como funciones independientes.
- El `Consolidado Regional` deja de modelarse como un documento que debe “remitirse” a Nacional; pasa a ser una **salida dinámica de reportería según rol, ámbito y filtros**.

## 2.2 Nuevas capacidades incorporadas

- Rol de **Establecimiento**.
- Acceso jerárquico por Establecimiento → OL → Región → Nacional.
- Filtros jerárquicos acumulativos.
- Nueva pestaña de **Programación**.
- Exportación de listados a Excel.
- Impresión de referencia resumida.
- Captura desde **Excel estandarizado** como alternativa prioritaria para escenarios sin conectividad.
- Separación entre `cierre por traslado` en origen y `continuidad en destino`.
- Contadores sobre resultados filtrados.
- Reportería con año/período como filtro principal.
- Diferenciación entre **personas únicas atendidas** y **cantidad total de atenciones**.

---

# 3. Alcance funcional actual

El sistema debe apoyar el proceso de Atención Interdisciplinaria desde la **detección o referencia** hasta el **seguimiento, traslado, reportería, generación de reportes y cierre**, procurando reducir redigitación y aprovechar información institucional ya existente.

Incluye:

- Búsqueda e identificación de personas.
- Referencia a A.I.
- Atención inmediata, urgencia y emergencia.
- Recepción y análisis de referencias.
- Sesiones interdisciplinarias.
- Valoración situacional.
- Priorización.
- Apertura y gestión del caso.
- Plan de atención.
- Atenciones individuales.
- Atenciones grupales multi-participante.
- Historial longitudinal.
- Documentos asociados.
- Coordinaciones interinstitucionales.
- Denuncias y eventos cuando corresponda.
- Malnutrición integrada al abordaje de A.I.
- Traslado entre Oficinas Locales.
- Generación de reportes durante la vida del caso.
- Cierre.
- Programación de sesiones y atenciones.
- Reporterías y visualizaciones filtrables.
- Consolidaciones dinámicas.
- Exportación de listados.
- Trazabilidad y confidencialidad.
- Carga de referencias desde Excel estandarizado.
- Exploración de OCR y modo offline avanzado.

## Fuera de alcance actual

- Sustituir completamente SIDINACC.
- Rediseñar selección de hogares/modalidades.
- Definir algoritmos clínicos no oficializados.
- Implementar un workflow de aprobación/validación Regional de registros.
- Construir durante esta etapa un dashboard completo de vigilancia/datos básicos.
- Automatizar decisiones profesionales.
- Adoptar SNOMED CT como integración formal.
- Implementar OCR u offline avanzado como dependencia obligatoria de la primera versión funcional.
- Resolver todavía el flujo automático definitivo `tamizaje → A.I.`.

---

# 4. Actores y alcance de acceso

| Código | Actor | Alcance principal |
| --- | --- | --- |
| ACT-01 | Profesional del establecimiento / Asistente 3 | Crear referencias y consultar información mínima de A.I. correspondiente a su establecimiento. |
| ACT-02 | Profesional del EE.II. de Oficina Local | Gestionar referencias, sesiones, casos, atenciones, documentos, coordinaciones, traslados, reportes y cierre. |
| ACT-03 | Equipo Interdisciplinario de Oficina Local | Analizar casos, valorar, decidir ingreso a A.I., priorizar y definir abordaje. |
| ACT-04 | Jefatura / Nivel Local | Consultar y acompañar la operación del ámbito local. |
| ACT-05 | ATE / Dirección Regional | Consultar información, programación y reportería de su región; brindar asesoría técnica y supervisión capacitante. |
| ACT-06 | UIVCD / UNAT / Nivel Nacional | Consultar información agregada o desagregada según permisos a nivel país; brindar asistencia técnica y supervisión capacitante. |
| ACT-07 | Administrador funcional/técnico | Gestionar catálogos, reglas, roles, plantillas y configuración. |
| ACT-08 | Persona usuaria / familia | Fuente/receptora de información; sin acceso directo al módulo de A.I. definido por ahora. |
| ACT-09 | Equipo de implementación / soporte | Configuración, migración, soporte técnico e integraciones autorizadas. |

---

# 5. Modelo jerárquico de acceso

```text
Nivel Nacional
└── Región
    └── Oficina Local
        └── Establecimiento
```

## 5.1 Establecimiento

Puede:
- crear referencias;
- buscar personas;
- consultar lista simplificada de personas de su establecimiento asociadas a A.I.;
- ver estado básico del caso;
- ver fechas de apertura/cierre;
- utilizar mecanismos de captura autorizados.

No debe visualizar:
- prioridad;
- valoración situacional completa;
- plan;
- disciplinas;
- frecuencia;
- detalle de atenciones;
- documentos sensibles;
- coordinaciones sensibles.

## 5.2 Oficina Local

Es el nivel operativo principal.

Puede:
- recibir referencias;
- gestionar sesiones;
- abrir casos;
- registrar atenciones;
- gestionar documentos/coordinaciones;
- programar;
- trasladar;
- generar reportes;
- cerrar casos;
- consultar reportería;
- exportar listados.

## 5.3 Regional

Principalmente consulta y analítica.

Puede:
- consultar OL/establecimientos de su región;
- consultar casos según permisos;
- consultar programación;
- generar reporterías/consolidados.

No modifica la gestión operativa de la OL en el alcance actual.

## 5.4 Nacional

Puede consultar datos a nivel país y descender jerárquicamente:
`País → Región → OL → Establecimiento`
según permisos.

---

# 6. Principios de diseño

### P-01 — Un caso único, múltiples atenciones
Un caso A.I. debe relacionarse con múltiples atenciones sin columnas repetitivas.

### P-02 — Reutilización de datos
No redigitar información disponible en otras fuentes.

### P-03 — Vigilancia ≠ Atención
La vigilancia describe condición; A.I. documenta decisiones y acciones.

### P-04 — DAF integrado
DAF no debe crear una segunda ruta de A.I.

### P-05 — Documentos especializados, caso común
Los documentos deben estar relacionados con el caso, no convertirse en silos.

### P-06 — Configuración antes que hardcode
Reglas provisionales deben ser configurables.

### P-07 — Trazabilidad completa
Conservar autor, fecha, cambio y origen.

### P-08 — El sistema apoya; el equipo decide
La decisión profesional no se automatiza.

### P-09 — Una atención puede involucrar a muchas personas
Registrar una vez, asociar a múltiples participantes.

### P-10 — Identificación antes que nombre
La identificación es la llave preferente para búsquedas/conciliación.

### P-11 — Búsqueda antes que listas masivas
No cargar miles de personas en dropdowns.

### P-12 — Registrar una vez, reutilizar en reportería
La reportería consume datos operativos existentes.

### P-13 — Menor nivel = menor alcance
La información visible depende del ámbito institucional.

### P-14 — Superior hereda consulta, no necesariamente edición
Regional/Nacional pueden consultar ámbitos inferiores sin asumir gestión operativa.

### P-15 — Todo factor seleccionado debe poder especificarse
Cuando se seleccione **cualquier factor protector, de riesgo o signo de alerta**, el sistema debe permitir agregar detalle, aclaración o texto complementario cuando sea necesario. Esto no se limita a “factor de riesgo individual”.

### P-16 — Reporte ≠ cierre
Se puede generar un reporte sin cerrar el caso.

### P-17 — Traslado cierra responsabilidad local, no necesidad de A.I.
La OL origen cierra por traslado; el destino decide/confirmará continuidad.

### P-18 — Excel estandarizado como contingencia prioritaria
Antes de implementar sincronización offline avanzada, se prioriza una plantilla Excel compatible con carga posterior.

### P-19 — Experimental ≠ obligatorio
OCR y offline avanzado se mantienen como líneas de exploración.

---

# 7. Épicas

| Épica | Nombre | Objetivo |
| --- | --- | --- |
| EP-01 | Identidad y expediente lógico | Buscar y reutilizar información de personas. |
| EP-02 | Detección y referencia | Crear y recibir referencias a A.I. |
| EP-03 | Sesión y valoración interdisciplinaria | Analizar, decidir y priorizar casos. |
| EP-04 | Gestión del caso A.I. | Abrir, mantener, trasladar, reportar y cerrar casos. |
| EP-05 | Atenciones y seguimiento | Registrar atenciones individuales/grupales e historial. |
| EP-06 | Documentos y coordinaciones | Asociar documentos, referencias externas y procesos sensibles. |
| EP-07 | Malnutrición integrada | Incorporar particularidades nutricionales sin ruta paralela. |
| EP-08 | Reportería y analítica | Consultar, filtrar, visualizar, consolidar y exportar información. |
| EP-09 | Seguridad y acceso | Restringir información por rol y sensibilidad. |
| EP-10 | Continuidad operativa | Autoguardado y mecanismos alternativos de captura. |
| EP-11 | Integraciones y migración | Reutilizar fuentes institucionales y datos históricos. |
| EP-12 | Configuración y evolución | Adaptar catálogos/reglas sin rediseño. |
| EP-13 | Captura asistida | Explorar OCR/IA con validación humana. |
| EP-14 | Programación operativa | Planificar sesiones y atenciones y registrar su ejecución. |

---

# 8. Historias de usuario

## EP-01 — Identidad y expediente lógico

### HU-001 — Buscar una persona
**Como** usuario autorizado  
**quiero** buscar una persona principalmente por identificación y secundariamente por nombre  
**para** localizarla sin navegar listas extensas ni crear duplicados.

**Estado:** CONFIRMADO  
**Prioridad:** P0

**Criterios**
- Búsqueda por identificación.
- Búsqueda por nombre.
- Identificación exacta tiene precedencia.
- Nombre puede devolver varias coincidencias.
- La selección precarga datos disponibles.
- El patrón se reutiliza en referencias, sesiones, atenciones grupales y otros flujos.

### HU-002 — Reutilizar datos maestros
**Como** profesional  
**quiero** reutilizar datos ya disponibles  
**para** evitar redigitación.

**Prioridad:** P0

---

## EP-02 — Detección y referencia

### HU-003 — Registrar origen de detección
Mantener origen:
- vigilancia/tamizaje;
- observación directa;
- familia;
- referencia externa;
- otro.

### HU-004 — Elaborar una referencia
**Como** profesional del establecimiento  
**quiero** crear una referencia estructurada  
**para** remitir la información relevante a Oficina Local.

**Criterios refinados**
- Buscar persona, no seleccionarla de lista masiva.
- Registrar autor/responsable.
- Registrar motivos.
- Registrar información relevante.
- Cada factor seleccionado puede detallarse/especificarse.
- Permitir resumen final.
- Permitir impresión.
- Permitir borrador/remisión.

### HU-005 — Imprimir una referencia
**Como** profesional del establecimiento  
**quiero** imprimir un resumen compacto de la referencia  
**para** incorporarlo al expediente físico mientras este siga vigente.

**Estado:** NECESIDAD CONFIRMADA  
**Prioridad:** P1

### HU-006 — Cargar referencia desde Excel estandarizado
**Como** profesional de un establecimiento con conectividad limitada  
**quiero** cargar una plantilla Excel previamente completada  
**para** precargar la referencia y evitar transcribir nuevamente los datos.

**Estado:** NECESIDAD CONFIRMADA / PROPUESTA DE DISEÑO  
**Prioridad:** P1

### HU-007 — Gestionar urgencia/emergencia
Mantener distinción y atención inmediata.

### HU-008 — Recibir referencias en Oficina Local
**Como** profesional de OL  
**quiero** consultar nuevas referencias de establecimientos  
**para** incorporarlas al análisis del EE.II.

---

## EP-03 — Sesión y valoración interdisciplinaria

### HU-009 — Preparar casos para una sesión
Buscar/agregar casos mediante búsqueda.

### HU-010 — Registrar sesión interdisciplinaria
Una sesión puede contener múltiples casos.

### HU-011 — Valorar factores por ámbitos
**Como** EE.II.  
**quiero** registrar factores protectores, de riesgo y signos de alerta por ámbito  
**para** disponer de contexto estructurado al analizar el caso.

**Criterios**
- Individual.
- Hogar/Familiar.
- Comunitario.
- Cada factor seleccionado puede ampliarse con una especificación textual.
- No se exige intensidad/frecuencia/persistencia.
- Debe existir `Otro` cuando el catálogo no cubra la situación.

### HU-012 — Decidir si requiere A.I.
Sí / No con observación.

### HU-013 — Priorizar un caso
Seleccionar Urgencia/Alto/Moderado/Bajo según modelo vigente y criterio interdisciplinario.

### HU-014 — Definir abordaje
Propósitos, estrategias, disciplinas, frecuencia y acuerdos.

---

## EP-04 — Gestión del caso

### HU-015 — Abrir caso A.I.
Crear caso a partir de decisión positiva.

### HU-016 — Consultar resumen del caso
El resumen se construye con datos ya registrados; no es un formulario adicional.

### HU-017 — Consultar línea de tiempo
Integrar eventos de todo el caso.

### HU-018 — Trasladar un caso
**Como** OL origen  
**quiero** registrar cierre por traslado  
**para** finalizar mi responsabilidad sin eliminar el historial ni afirmar que la necesidad de A.I. terminó.

### HU-019 — Continuar caso recibido por traslado
**Como** OL destino  
**quiero** visualizar un ingreso por traslado y confirmar continuidad  
**para** reactivar el caso cuando la persona/familia efectivamente llegue al ámbito destino.

**Estado:** NECESIDAD CONFIRMADA / DETALLE PENDIENTE  
**Prioridad:** P1

### HU-020 — Generar reporte sin cerrar
**Como** profesional autorizado  
**quiero** generar un reporte en cualquier momento del caso  
**para** responder a solicitudes institucionales sin cerrar A.I.

### HU-021 — Cerrar caso
Separado de generar reporte.

---

## EP-05 — Atenciones y seguimiento

### HU-022 — Registrar atención individual
Mantener evento repetible.

### HU-023 — Registrar atención grupal una sola vez
**Como** profesional  
**quiero** registrar una atención grupal una vez y asociarla a múltiples personas  
**para** evitar duplicación.

### HU-024 — Buscar participantes
Agregar participantes por identificación/nombre.

### HU-025 — Consultar historial longitudinal
Combinar atenciones individuales, grupales y demás eventos.

### HU-026 — Ajustar plan
Versionar cambios.

---

## EP-06 — Documentos y coordinaciones

### HU-027 — Cargar documentos al caso
**Como** profesional autorizado  
**quierro** adjuntar documentos relacionados al caso  
**para** mantenerlos vinculados sin convertir cada archivo en un módulo.

### HU-028 — Registrar referencia interinstitucional
Registrar trazabilidad, no necesariamente enviar desde el sistema.

### HU-029 — Indicar profesional responsable
**Como** persona que registra información  
**quiero** indicar quién realizó la referencia/acción  
**para** no asumir que el usuario digitador fue quien ejecutó la acción.

### HU-030 — Registrar denuncia/proceso sensible
Mantener permisos reforzados.

---

## EP-07 — Malnutrición integrada

### HU-031 — Vincular malnutrición al caso
Mantener integrado.

### HU-032 — Preservar clasificación histórica
Mantener valores históricos.

---

## EP-08 — Reportería y analítica

### HU-033 — Filtrar información por año/período
**Como** usuario con acceso a reportería  
**quiero** seleccionar año y período  
**para** consultar cortes comparables.

### HU-034 — Filtrar según ámbito jerárquico
- OL → establecimiento.
- Regional → OL + establecimiento.
- Nacional → región + OL + establecimiento.

### HU-035 — Consultar casos por estado
Activos/cerrados/etc.

### HU-036 — Consultar casos por prioridad
Urgencia/Alto/Moderado/Bajo.

### HU-037 — Consultar actividad por ámbito
Establecimiento/OL/Región.

### HU-038 — Consultar personas únicas atendidas
Diferenciar personas de atenciones.

### HU-039 — Consultar total de atenciones
Por disciplina/profesional/período.

### HU-040 — Generar consolidado dinámico
**Como** usuario autorizado  
**quiero** generar una salida consolidada según mis filtros  
**para** obtener información del ámbito requerido sin procesos manuales de remisión interna.

### HU-041 — Exportar listados a Excel
Personas/casos y otros listados autorizados, respetando filtros y permisos.

---

## EP-09 — Seguridad y acceso

### HU-042 — Acceder según rol y ámbito
Incluir Establecimiento/OL/Regional/Nacional.

### HU-043 — Consultar lista simple de A.I. en establecimiento
Solo información mínima.

### HU-044 — Auditar accesos/cambios
Mantener.

### HU-045 — Exportar información anonimizada
Pendiente de gobernanza.

---

## EP-10 — Continuidad operativa

### HU-046 — Autoguardado y recuperación
Mantener.

### HU-047 — Cargar Excel de contingencia
Prioridad sobre offline avanzado.

### HU-048 — Trabajar offline/sincronizar
**Estado:** EXPERIMENTAL / PENDIENTE DE ARQUITECTURA.

---

## EP-11 — Integraciones y migración

### HU-049 — Reutilizar datos SIDINACC/CAH
Mantener necesidad.

### HU-050 — Detectar posibles casos desde vigilancia
**Como** sistema/usuario  
**quiero** evitar redigitar resultados de tamizajes  
**para** que los hallazgos relevantes puedan alimentar A.I.

**Estado:** PENDIENTE DE DEFINICIÓN**  
**No se fija aún el punto exacto de entrada.**

### HU-051 — Migrar datos históricos
Mantener.

---

## EP-12 — Configuración y evolución

### HU-052 — Administrar catálogos
Mantener.

### HU-053 — Versionar formularios/reglas
Mantener.

---

## EP-13 — Captura asistida

### HU-054 — Precargar mediante OCR
Experimental.

### HU-055 — Validar OCR antes de confirmar
Experimental.

### HU-056 — Extraer participantes desde lista física
**Como** profesional  
**quiero** explorar extracción de identificaciones desde una hoja de asistencia  
**para** facilitar el registro de atenciones grupales masivas.

**Estado:** EXPERIMENTAL.

---

## EP-14 — Programación

### HU-057 — Programar sesiones
**Como** Oficina Local  
**quiero** registrar sesiones previstas  
**para** organizar el trabajo del EE.II.

### HU-058 — Programar atenciones
Incluye atención por establecimiento, visita domiciliar u otras.

### HU-059 — Registrar resultado de actividad programada
Estados:
- Programada.
- Realizada.
- Reprogramada.
- Cancelada.

### HU-060 — Reprogramar con nueva fecha y motivo
Obligatorio al usar estado Reprogramada.

### HU-061 — Registrar motivo de cancelación
Obligatorio al cancelar.

### HU-062 — Consultar programación por nivel
Regional/Nacional consultan; OL crea/modifica.

### HU-063 — Recibir alerta de actividad vencida
Notificación simple para resolver estado.

---

# 9. Requerimientos funcionales

| ID | Requerimiento | Prioridad | Estado |
| --- | --- | --- | --- |
| RF-001 | Mantener identidad única por persona. | P0 | Confirmado |
| RF-002 | Buscar personas principalmente por identificación y secundariamente por nombre. | P0 | Confirmado |
| RF-003 | No utilizar listas/dropdowns masivos para seleccionar personas o casos. | P0 | Confirmado |
| RF-004 | Reutilizar datos maestros existentes. | P0 | Confirmado |
| RF-005 | Registrar origen de detección. | P0 | Confirmado |
| RF-006 | Crear referencia A.I. estructurada. | P0 | Confirmado |
| RF-007 | Permitir especificación textual para **cualquier factor seleccionado** cuando sea necesario. | P0 | Confirmado |
| RF-008 | Mostrar resumen completo antes de remitir referencia. | P0 | Confirmado |
| RF-009 | Imprimir resumen de referencia con trazabilidad del responsable. | P1 | Confirmado |
| RF-010 | Cargar referencia desde Excel estandarizado y precargar formulario. | P1 | Confirmado / diseño |
| RF-011 | Permitir atención inmediata antes de completar datos administrativos. | P0 | Confirmado |
| RF-012 | Registrar sesiones interdisciplinarias con múltiples casos. | P0 | Confirmado/modelo |
| RF-013 | Buscar/agregar casos a sesión mediante buscador. | P0 | Confirmado |
| RF-014 | Registrar valoración situacional por ámbito. | P0 | Confirmado/modelo |
| RF-015 | No exigir intensidad/frecuencia/persistencia en la valoración. | P0 | Confirmado post-validación |
| RF-016 | Registrar resolución Sí/No requiere A.I. | P0 | Confirmado |
| RF-017 | Registrar prioridad configurable. | P1 | Borrador |
| RF-018 | Registrar estrategias, disciplinas, frecuencia y acuerdos. | P0 | Confirmado |
| RF-019 | Abrir caso A.I. y mantenerlo separado del expediente general. | P0 | Confirmado |
| RF-020 | Mostrar resumen derivado del caso sin redigitación. | P0 | Confirmado |
| RF-021 | Mantener línea de tiempo longitudinal. | P0 | Confirmado |
| RF-022 | Registrar atenciones individuales repetibles. | P0 | Confirmado |
| RF-023 | Registrar una atención grupal una vez y asociarla a múltiples participantes. | P0 | Confirmado |
| RF-024 | Reflejar atención grupal en historial individual de cada participante. | P0 | Confirmado |
| RF-025 | Buscar participantes por identificación/nombre. | P0 | Confirmado |
| RF-026 | Permitir documentos adjuntos asociados al caso. | P1 | Confirmado |
| RF-027 | Registrar referencia/contra-referencia interinstitucional. | P1 | Confirmado |
| RF-028 | Permitir seleccionar responsable distinto al usuario digitador. | P1 | Confirmado |
| RF-029 | Registrar procesos sensibles con permisos reforzados. | P0 | Confirmado |
| RF-030 | Mantener malnutrición integrada al caso. | P1 | Confirmado/modelo |
| RF-031 | Registrar cierre por traslado en OL origen. | P1 | Confirmado conceptualmente |
| RF-032 | Registrar ingreso por traslado en OL destino. | P1 | Confirmado conceptualmente |
| RF-033 | Permitir estado pendiente de continuidad en destino. | P1 | Diseño pendiente |
| RF-034 | Permitir generar reporte durante caso activo. | P0 | Confirmado |
| RF-035 | Separar generación de reporte y cierre. | P0 | Confirmado |
| RF-036 | Registrar cierre con motivo. | P0 | Confirmado |
| RF-037 | Implementar acceso por Establecimiento, OL, Regional y Nacional. | P0 | Confirmado |
| RF-038 | Restringir vista de establecimiento a información mínima de A.I. | P0 | Confirmado |
| RF-039 | Aplicar filtros jerárquicos según rol. | P0 | Confirmado |
| RF-040 | Mostrar conteo de resultados filtrados. | P1 | Confirmado |
| RF-041 | Filtrar por año/período. | P0 | Confirmado |
| RF-042 | Filtrar casos por estado. | P0 | Confirmado |
| RF-043 | Filtrar casos por prioridad. | P0 | Confirmado |
| RF-044 | Filtrar por establecimiento en OL. | P0 | Confirmado |
| RF-045 | Filtrar por OL/establecimiento en Regional. | P0 | Confirmado |
| RF-046 | Filtrar por Región/OL/establecimiento en Nacional. | P0 | Confirmado |
| RF-047 | Mostrar personas únicas atendidas por disciplina/profesional. | P1 | Confirmado |
| RF-048 | Mostrar cantidad total de atenciones por disciplina/profesional. | P1 | Confirmado |
| RF-049 | Generar consolidaciones dinámicas según ámbito/filtros. | P1 | Confirmado/diseño |
| RF-050 | Exportar listados a Excel respetando filtros y permisos. | P1 | Confirmado |
| RF-051 | Registrar programación de sesiones. | P0 | Confirmado |
| RF-052 | Registrar programación de atenciones. | P0 | Confirmado |
| RF-053 | Manejar estados Programada/Realizada/Reprogramada/Cancelada. | P0 | Confirmado |
| RF-054 | Reprogramación debe requerir nueva fecha y motivo. | P0 | Confirmado |
| RF-055 | Cancelación debe requerir motivo. | P0 | Confirmado |
| RF-056 | Regional/Nacional pueden consultar programación sin editarla. | P1 | Confirmado |
| RF-057 | Alertar sobre actividades vencidas sin estado actualizado. | P1 | Propuesta validada |
| RF-058 | Autoguardar y recuperar borradores. | P0 | Necesidad |
| RF-059 | Permitir importación/migración histórica. | P1 | Propuesta |
| RF-060 | Permitir catálogos configurables. | P0 | Necesidad |
| RF-061 | Mantener versionamiento de formularios/reglas. | P1 | Necesidad |
| RF-062 | Explorar OCR para precarga de documentos. | P2 | Experimental |
| RF-063 | Exigir validación humana de OCR. | P2 | Experimental |
| RF-064 | Explorar modo offline con sincronización posterior. | P2 | Experimental |
| RF-065 | Reutilizar resultados de vigilancia/tamizaje sin redigitar cuando exista integración. | P1 | Pendiente de diseño |
| RF-066 | No fijar todavía el punto de entrada automático de hallazgos de vigilancia a A.I. | P0 | Restricción de diseño |
| RF-067 | Permitir exportaciones anonimizadas solo bajo política institucional. | P1 | Pendiente gobernanza |
| RF-068 | Conservar trazabilidad de autor, fecha de evento y fecha de digitación. | P0 | Confirmado |

---

# 10. Casos de Uso

> [!NOTE]
> Los casos de uso agrupan requerimientos relacionados. La matriz de trazabilidad del capítulo 11 indica qué RF cubre cada CU.

## CU-01 — Buscar y seleccionar una persona
**Actor principal:** Usuario autorizado  
**Precondición:** Usuario autenticado y con ámbito definido.  
**Postcondición:** Persona seleccionada y datos precargados.  
**RF:** RF-001 a RF-004.

**Flujo principal**
1. Usuario abre buscador.
2. Ingresa identificación o nombre.
3. Sistema busca en ámbito permitido.
4. Prioriza coincidencia exacta por identificación.
5. Muestra resultados.
6. Usuario selecciona.
7. Sistema precarga datos.

**Extensiones**
- Sin resultados.
- Varias coincidencias por nombre.
- Persona sin identificación.

## CU-02 — Crear referencia A.I. mediante formulario
**Actor:** Profesional de establecimiento  
**Precondición:** Persona localizada.  
**Postcondición:** Referencia guardada o remitida.  
**RF:** RF-005 a RF-009.

**Flujo**
1. Buscar persona.
2. Precargar datos.
3. Registrar fecha/origen.
4. Seleccionar motivos.
5. Seleccionar factores.
6. Para **cada factor seleccionado**, permitir agregar detalle/especificación.
7. Registrar información relevante.
8. Revisar resumen.
9. Guardar/remitir.
10. Opcionalmente imprimir.

## CU-03 — Crear referencia desde Excel estandarizado
**Actor:** Profesional de establecimiento  
**RF:** RF-010, RF-058.

**Flujo**
1. Elegir `Nueva referencia`.
2. Seleccionar `Cargar Excel`.
3. Adjuntar plantilla.
4. Validar estructura.
5. Precargar formulario.
6. Revisar/corregir.
7. Guardar/remitir.

## CU-04 — Atender urgencia/emergencia
**Actor:** Personal autorizado  
**RF:** RF-011.

1. Identificar situación.
2. Ejecutar acción inmediata.
3. Registrar evento mínimo.
4. Completar información posteriormente.
5. Derivar a A.I. si aplica.

## CU-05 — Gestionar sesión interdisciplinaria
**Actor:** EE.II.  
**RF:** RF-012, RF-013.

1. Crear sesión.
2. Registrar fecha/participantes.
3. Buscar casos.
4. Agregar casos.
5. Analizarlos individualmente.
6. Registrar acuerdos.
7. Finalizar.

## CU-06 — Valorar y decidir ingreso a A.I.
**Actor:** EE.II.  
**RF:** RF-014 a RF-018.

1. Abrir caso en sesión.
2. Revisar referencia.
3. Seleccionar factores por ámbito.
4. Especificar cualquier factor que lo requiera.
5. Registrar observaciones.
6. Resolver Sí/No A.I.
7. Si Sí: prioridad + abordaje.
8. Confirmar.

**Restricción:** no exigir intensidad/frecuencia/persistencia.

## CU-07 — Abrir y consultar caso A.I.
**Actor:** Profesional OL  
**RF:** RF-019 a RF-021.

1. Confirmar decisión positiva.
2. Crear caso.
3. Enlazar referencia/sesión.
4. Consultar resumen.
5. Consultar timeline.
6. Navegar plan/documentos/atenciones/coordinaciones.

## CU-08 — Registrar atención individual
**Actor:** Profesional A.I.  
**RF:** RF-022, RF-068.

1. Abrir caso.
2. Registrar fecha/tipo/disciplina.
3. Registrar acciones/recomendaciones.
4. Guardar.
5. Agregar al historial.

## CU-09 — Registrar atención grupal
**Actor:** Profesional A.I.  
**RF:** RF-023 a RF-025.

1. Crear atención grupal.
2. Registrar datos comunes.
3. Buscar participantes.
4. Agregar participantes.
5. Registrar asistencia.
6. Guardar una única atención.
7. Asociar a cada historial.

## CU-10 — Gestionar documentos
**Actor:** Profesional autorizado  
**RF:** RF-026.

1. Abrir caso.
2. Ir a Documentos.
3. Cargar archivo.
4. Registrar metadatos.
5. Guardar.

## CU-11 — Registrar coordinación interinstitucional
**Actor:** Profesional autorizado  
**RF:** RF-027, RF-028.

1. Abrir caso.
2. Registrar institución/motivo.
3. Indicar profesional responsable.
4. Registrar fecha/estado.
5. Guardar seguimiento.

## CU-12 — Registrar proceso sensible
**Actor:** Profesional con permiso  
**RF:** RF-029.

1. Acceder a área restringida.
2. Validar permiso.
3. Registrar información.
4. Guardar con auditoría.

## CU-13 — Trasladar caso
**Actor principal:** OL origen  
**Actor secundario:** OL destino  
**RF:** RF-031 a RF-033.

**Origen**
1. Abrir caso.
2. Cerrar por traslado.
3. Registrar destino.
4. Mantener historial.

**Destino**
1. Mostrar ingreso por traslado.
2. Marcar pendiente de continuidad.
3. Verificar llegada.
4. Confirmar continuidad.
5. Activar caso.

## CU-14 — Generar reporte durante caso activo
**Actor:** Profesional autorizado  
**RF:** RF-034, RF-035.

1. Abrir caso.
2. Ir a Reportes.
3. Seleccionar tipo/período.
4. Componer desde historial.
5. Revisar.
6. Descargar/generar.
7. Caso sigue activo.

## CU-15 — Cerrar caso
**Actor:** Profesional/EE.II. autorizado  
**RF:** RF-035, RF-036.

1. Ir a Cierre.
2. Registrar motivo/fecha.
3. Confirmar.
4. Cambiar estado.
5. Ofrecer reporte final opcional.

## CU-16 — Consultar lista simple desde Establecimiento
**Actor:** Establecimiento  
**RF:** RF-037, RF-038.

1. Ingresar.
2. Limitar al establecimiento.
3. Mostrar lista mínima.
4. Buscar.
5. Consultar estado/fechas.

## CU-17 — Filtrar casos según rol
**Actores:** OL / Regional / Nacional  
**RF:** RF-039 a RF-046.

1. Abrir listado.
2. Cargar filtros según rol.
3. Aplicar año/estado/prioridad/ámbito.
4. Consultar.
5. Mostrar conteo.
6. Mantener filtros para exportar/reportar.

## CU-18 — Consultar reportería
**Actores:** OL / Regional / Nacional  
**RF:** RF-041, RF-047 a RF-049.

1. Abrir Reporterías.
2. Seleccionar año/período.
3. Aplicar filtros.
4. Actualizar visualizaciones.
5. Consultar métricas.
6. Generar consolidado dinámico.

## CU-19 — Exportar listado
**Actor:** Usuario autorizado  
**RF:** RF-050.

1. Aplicar filtros.
2. Exportar Excel.
3. Limitar al ámbito permitido.
4. Generar archivo.

## CU-20 — Programar sesión
**Actor:** Oficina Local  
**RF:** RF-051, RF-053 a RF-057.

1. Abrir Programación.
2. Crear actividad tipo sesión.
3. Registrar fecha/propósito.
4. Guardar.
5. Actualizar estado.
6. Si reprogramada: nueva fecha + motivo.
7. Si cancelada: motivo.
8. Si vence: alertar.

## CU-21 — Programar atención
**Actor:** Oficina Local  
**RF:** RF-052 a RF-057.

1. Crear actividad tipo atención.
2. Registrar establecimiento/caso si aplica.
3. Registrar fecha.
4. Guardar.
5. Actualizar estado.

## CU-22 — Consultar programación
**Actor:** Regional/Nacional  
**RF:** RF-056.

1. Abrir Programación.
2. Filtrar por ámbito.
3. Consultar listado.
4. No permitir edición.

## CU-23 — Recuperar borrador
**Actor:** Usuario que captura  
**RF:** RF-058.

1. Iniciar captura.
2. Guardar incrementalmente.
3. Interrumpir.
4. Reingresar.
5. Recuperar borrador.

## CU-24 — Migrar datos históricos
**Actor:** Equipo de implementación  
**RF:** RF-059.

1. Seleccionar fuente.
2. Validar.
3. Mapear.
4. Importar.
5. Registrar errores.
6. Conservar fuente original.

## CU-25 — Gestionar catálogos/versiones
**Actor:** Administrador  
**RF:** RF-060, RF-061.

1. Seleccionar catálogo/formulario.
2. Editar.
3. Crear versión.
4. Publicar.
5. Mantener histórico.

## CU-26 — Precargar con OCR
**Actor:** Usuario autorizado  
**RF:** RF-062, RF-063  
**Estado:** Experimental.

1. Cargar imagen/PDF.
2. Extraer campos.
3. Mostrar confianza.
4. Revisar/corregir.
5. Confirmar.
6. Incorporar solo confirmados.

## CU-27 — Trabajar offline
**Actor:** Usuario de campo/establecimiento  
**RF:** RF-064  
**Estado:** Experimental.

1. Perder conexión.
2. Continuar captura local.
3. Marcar pendiente.
4. Recuperar conexión.
5. Sincronizar.
6. Resolver conflictos si existen.

## CU-28 — Reutilizar hallazgo de vigilancia
**Actor:** Sistema / establecimiento / OL  
**RF:** RF-065, RF-066  
**Estado:** Pendiente.

1. Registrar resultado vigilancia.
2. Detectar hallazgo relevante.
3. Generar alerta/candidato.
4. Pendiente definir actor de revisión.
5. Reutilizar dato sin redigitar.

## CU-29 — Exportar información anonimizada
**Actor:** Usuario institucional autorizado  
**RF:** RF-067  
**Estado:** Pendiente gobernanza.

---

# 11. Matriz RF ↔ CU

| RF | CU |
| --- | --- |
| RF-001–RF-004 | CU-01 |
| RF-005–RF-009 | CU-02 |
| RF-010 | CU-03 |
| RF-011 | CU-04 |
| RF-012–RF-013 | CU-05 |
| RF-014–RF-018 | CU-06 |
| RF-019–RF-021 | CU-07 |
| RF-022 | CU-08 |
| RF-023–RF-025 | CU-09 |
| RF-026 | CU-10 |
| RF-027–RF-028 | CU-11 |
| RF-029 | CU-12 |
| RF-030 | CU-07 / HU-031 |
| RF-031–RF-033 | CU-13 |
| RF-034–RF-035 | CU-14 |
| RF-036 | CU-15 |
| RF-037–RF-038 | CU-16 |
| RF-039–RF-046 | CU-17 |
| RF-047–RF-049 | CU-18 |
| RF-050 | CU-19 |
| RF-051, RF-053–RF-057 | CU-20 |
| RF-052–RF-057 | CU-21 |
| RF-056 | CU-22 |
| RF-058 | CU-23 |
| RF-059 | CU-24 |
| RF-060–RF-061 | CU-25 |
| RF-062–RF-063 | CU-26 |
| RF-064 | CU-27 |
| RF-065–RF-066 | CU-28 |
| RF-067 | CU-29 |
| RF-068 | Transversal |

---

# 12. Modelo conceptual de datos actualizado

```text
Persona
├── Identificadores
├── Datos maestros
├── Ámbito institucional
├── Evaluaciones de vigilancia
└── Caso A.I.
    ├── Referencia
    ├── Sesiones interdisciplinarias
    ├── Valoraciones
    ├── Plan de atención
    ├── Atenciones individuales [0..N]
    ├── Participaciones grupales [0..N]
    ├── Documentos [0..N]
    ├── Coordinaciones externas [0..N]
    ├── Procesos sensibles [0..N]
    ├── Traslados [0..N]
    ├── Reportes [0..N]
    └── Cierre [0..1]

Atención grupal
├── Fecha
├── Tipo/tema
├── Lugar
├── Profesionales
├── Disciplinas
├── Participantes [N]
└── Asistencia

Programación
├── Tipo
├── Fecha
├── Ámbito/establecimiento
├── Estado
├── Motivo
├── Nueva fecha (si reprogramada)
└── Observaciones

Salida de reportería
├── Año/período
├── Ámbito
├── Filtros
├── Indicadores
└── Exportación
```

---

# 13. Reglas de negocio actualizadas

| ID | Regla | Estado |
| --- | --- | --- |
| RN-001 | Una detección no abre automáticamente un caso A.I. | Confirmado |
| RN-002 | Emergencia se atiende antes de completar documentación. | Confirmado |
| RN-003 | Decisión de ingreso corresponde al EE.II. | Confirmado |
| RN-004 | Cierre A.I. no equivale a egreso de servicio/modalidad. | Confirmado |
| RN-005 | DAF no crea ruta paralela de A.I. | Confirmado |
| RN-006 | Identificación prevalece sobre nombre para coincidencia exacta. | Confirmado |
| RN-007 | No usar selectores masivos de personas/casos. | Confirmado |
| RN-008 | Cualquier factor seleccionado puede recibir una especificación adicional. | Confirmado |
| RN-009 | Intensidad/frecuencia/persistencia no son obligatorias en valoración. | Confirmado post-validación |
| RN-010 | Prioridad la define criterio profesional. | Confirmado |
| RN-011 | Una atención grupal se registra una sola vez. | Confirmado |
| RN-012 | Reporte puede generarse sin cerrar caso. | Confirmado |
| RN-013 | Traslado implica cierre por traslado en OL origen. | Confirmado conceptualmente |
| RN-014 | Destino puede mantener caso pendiente hasta confirmar continuidad. | Diseño pendiente |
| RN-015 | Recibir expediente físico no equivale a confirmar continuidad. | Confirmado conceptualmente |
| RN-016 | Reprogramar exige nueva fecha. | Confirmado |
| RN-017 | Reprogramar/cancelar exige motivo. | Confirmado |
| RN-018 | Solo OL crea/modifica programación; Regional/Nacional consultan. | Confirmado |
| RN-019 | Filtros y alcance dependen del rol. | Confirmado |
| RN-020 | Consolidado es salida de reportería, no remisión interna obligatoria. | Confirmado post-validación |
| RN-021 | Exportaciones respetan filtros/permisos. | Confirmado |
| RN-022 | Excel estandarizado es contingencia prioritaria. | Confirmado de diseño |
| RN-023 | OCR requiere revisión humana. | Experimental |
| RN-024 | Flujo automático desde tamizajes sigue pendiente. | Pendiente |
| RN-025 | Digitador y profesional responsable pueden ser distintos. | Confirmado |

---

# 14. Requerimientos no funcionales

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RNF-001 | Control de acceso por rol y ámbito. | P0 |
| RNF-002 | Auditoría de accesos/cambios. | P0 |
| RNF-003 | Integridad histórica. | P0 |
| RNF-004 | Autoguardado/recuperabilidad. | P0 |
| RNF-005 | Usabilidad y mínima redigitación. | P0 |
| RNF-006 | Configurabilidad. | P0 |
| RNF-007 | Trazabilidad de fuente/autor/fechas. | P0 |
| RNF-008 | Paginación y búsquedas eficientes. | P0 |
| RNF-009 | No cargar universos completos al cliente. | P0 |
| RNF-010 | Filtros del lado servidor cuando exista backend. | P1 |
| RNF-011 | Exportabilidad. | P1 |
| RNF-012 | Privacidad por diseño. | P0 |
| RNF-013 | Versionamiento. | P1 |
| RNF-014 | Interoperabilidad futura con SIDINACC/CAH. | P1 |
| RNF-015 | Ayudas breves por pestaña. | P0 |
| RNF-016 | Responsive para escenarios de campo. | P1 |
| RNF-017 | Proveniencia de datos OCR. | P2 |
| RNF-018 | Sincronización segura si se implementa offline. | P2 |

---

# 15. Reportería inicial

Filtros principales:
- Año.
- Período/corte.
- Estado.
- Prioridad.
- Disciplina.
- Profesional.
- Ámbito institucional según rol.

Visualizaciones iniciales:
1. Casos por estado.
2. Casos por prioridad.
3. Casos por establecimiento/OL/Región.
4. Referencias por período.
5. Personas únicas atendidas por disciplina/profesional.
6. Total de atenciones por disciplina/profesional.
7. Programación: realizadas/reprogramadas/canceladas.
8. Atenciones grupales y participantes cuando aporte valor.

> Personas atendidas y cantidad de atenciones son métricas diferentes.

---

# 16. Integraciones y captura alternativa

| Elemento | Estado |
| --- | --- |
| SIDINACC/CAH | Pendiente factibilidad |
| Vigilancia/tamizajes | Necesidad confirmada |
| SINIRUBE | Pendiente |
| Excel estandarizado | Prioridad de diseño |
| OCR | Experimental |
| Offline avanzado | Experimental |
| SNOMED CT | Exploratorio |

---

# 17. Preguntas abiertas

## Traslado
- Nombre final del estado/acción en destino.
- ¿Qué pasa si la familia nunca llega?
- ¿Cuánto tiempo se conserva pendiente?
- Relación exacta con expediente físico.

## Vigilancia → A.I.
- ¿Hallazgo llega primero a establecimiento o a OL?
- ¿Quién completa contexto?
- ¿Qué hallazgos disparan alerta?
- ¿Cómo evitar redigitación sin perder contexto?

## Reportes
- Estructura exacta.
- Tipos de reporte.
- Firmas/validaciones.

## Seguridad
- Qué puede consultar Regional/Nacional a nivel individual.
- Qué documentos requieren permisos especiales.

## Programación
- Tipos finales de actividades.
- Detalle requerido para atenciones programadas.

## Excel
- Estructura final de plantilla.
- Una referencia por archivo vs múltiples.
- Versionado de plantilla.

## OCR/Offline
- Se mantienen en investigación.

---

# 18. Priorización revisada

## P0 — Núcleo
- Roles Establecimiento/OL.
- Búsqueda por identificación/nombre.
- Referencias.
- Sesiones.
- Valoración simplificada.
- Apertura de casos.
- Casos + filtros.
- Atenciones individuales.
- Atenciones grupales.
- Historial.
- Documentos.
- Reportes separados de cierre.
- Programación.
- Reportería básica.
- Acceso por rol.
- Autoguardado.
- Trazabilidad.

## P1 — Segunda capa
- Traslado refinado.
- Coordinaciones externas.
- Exportación Excel.
- Carga referencia desde Excel.
- Reporterías jerárquicas.
- Consolidaciones dinámicas.
- Programación visible Regional/Nacional.
- Migración.
- Integración con vigilancia.

## P2 — Experimental/evolución
- OCR.
- Offline avanzado.
- OCR de listas grupales.
- Dashboards avanzados.
- Analítica longitudinal avanzada.
- SNOMED CT.

---

# 19. Fuentes de descubrimiento

| Fuente | Hallazgos |
| --- | --- |
| PRO-D-AI-P-01 borrador 2026 | Modelo objetivo A.I. |
| Instrumentos operativos | Variables y necesidades de registro. |
| Reunión 11/09/2026 | Atención grupal, offline, OCR, gobernanza. |
| Validación prototipo 16/09/2026 | Rol Establecimiento, filtros, búsqueda, simplificación, programación, traslado, reportes/cierre, Excel, reportería. |
| Prototipo navegable | Validación UX y detección de complejidad. |
| SNOMED CT español | Exploración terminológica. |

---

# 20. Registro de cambios

| Versión | Fecha | Cambio |
| --- | --- | --- |
| 0.1 | 09-09-2026 | Primera versión. |
| 0.2 | 15-09-2026 | Intervención grupal, offline, OCR, reportería y trazabilidad ampliada. |
| **0.3** | **16-09-2026** | **Refinamiento integral post-validación: eliminación de Control de Calidad Regional, rol Establecimiento, acceso/filtros jerárquicos, búsqueda en lugar de selectores masivos, valoración simplificada, Reportes ≠ Cierre, Documentos, Programación, traslado refinado, reportería filtrable, consolidación dinámica, exportación Excel, carga de referencia desde Excel y 29 casos de uso.** |

---

# 21. Regla de mantenimiento

Cada cambio futuro debe indicar:
1. Fuente.
2. Necesidad.
3. Actor.
4. HU afectada.
5. RF afectado.
6. CU afectado o nuevo.
7. Regla de negocio.
8. Estado de certeza.
9. Impacto en prototipo.
10. Decisión final cuando se valide.
