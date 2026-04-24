# Software Test Plan (STP) v1.0
**Proyecto:** Mural Maz Lince
**Sprint:** 12
**Referencia:** PMP v1.4 · SRS v1.4 · SAD v1.3 · DDC v1.2

## 1. Introducción
Este documento rige la validación formal del comportamiento del proyecto Mural Maz Lince, correspondiente a la fase de construcción. Define las reglas para la verificación de los módulos del backend (Node.js/Express), la API REST, la integración con PostgreSQL, las reglas de límite del PMP y SAD, y la prueba de seguridad del número de WhatsApp.
**Alcance:** Pruebas backend (unitarias e integradas), seguridad de WhatsApp, validación client-side de compresión.
**Exclusiones:** Pruebas End-to-End en navegador, pruebas visuales (Sprint 13).

## 2. Estrategia de pruebas
**Nivel 1 — Pruebas Unitarias Puras**
- **Herramienta:** Jest con reporte `--coverage`.
- **Objetivo:** Verificar código aislado (funciones puras y lógica sin DB ni red).
- **Módulos bajo cobertura 100%:** `utils/checksum.js`, `utils/dhash.js`, `services/whatsappLinkService.js`, lógica en `services/interactionService.js`.
- **Módulos bajo cobertura ≥ 70%:** El resto del código bajo la carpeta `src/`.

**Nivel 2 — Pruebas de Integración de API**
- **Herramienta:** Jest + Supertest contra DB PostgreSQL de prueba.
- **Objetivo:** Verificar cada endpoint REST documentado en DDC v1.2 Sección 4 (flujos, HTTP status codes, payloads).

**Nivel 3 — Pruebas de Seguridad y Comportamiento Aislado**
- **Herramienta:** Scripts Node.js personalizados + validación visual (Network Tab).
- **Objetivo:** Validar contramedidas de red (WhatsApp oculto), compresión 1200px/500KB client-side, y sistema Shadowban.

## 3. Entorno de pruebas
- `NODE_ENV=test`
- Uso de `DATABASE_URL=postgresql://postgres:password@localhost:5433/mural_maz_lince_test`.
- Ejecución aislada a través de `npm run test` contra un esquema de test dedicado, aprovisionado con migraciones automáticas (`npm run migrate:test`).

## 4. Criterios de entrada y salida por fase
### FASE A — Pruebas Unitarias
- **Entrada:** Sprint 11 completado. DB test lista.
- **Salida:** Jest cobertura ≥ 70% global, 100% en módulos críticos. Cero tests fallidos.
- **Bloqueo:** Cobertura de módulo crítico menor a 100.

### FASE B — Pruebas de Integración de API
- **Entrada:** Fase A completa. Endpoints codificados según DDC.
- **Salida:** 100% de los casos de integración pasados o reportados en STD.
- **Bloqueo:** Defectos de gravedad Crítica.

### FASE C — Pruebas de Sistemas y Seguridad
- **Entrada:** Fase A y B listas.
- **Salida:** WhatsApp script (0 violaciones), imágenes < 500KB. Reporte exitoso.
- **Bloqueo:** Violación detectada en el número WhatsApp (SEV-1).

## 5. Definición de severidades de defectos
- **SEV-1 (Crítico):** Bloquea el sprint. Pérdida de integridad de datos, caída de seguridad, exposición en texto plano de un número de WhatsApp, brechas de JWT o validación de matrícula rota.
- **SEV-2 (Mayor):** Sistema opera con error notorio en funcionalidad principal. Ej: límite de proyectos ignorado, umbral de reversión con desfase inaceptable. Se resuelve antes de Producción.
- **SEV-3 (Menor):** Sistema opera, falla cosmética o secundaria que no limita la funcionalidad (ej. mensajes de error menos explícitos). A resolver antes del cierre.
- **SEV-4 (Observación):** Sugerencia o comportamiento poco optimizado (lentitud aceptable pero mejorable).
