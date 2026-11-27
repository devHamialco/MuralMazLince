# Software Test Plan (STP) v1.1
**Proyecto:** Mural Maz Lince
**Estado:** Implementado en backend (pruebas unitarias + integración) · Pendiente en frontend (solo lint y build)
**Referencia:** PMP v1.5 · SRS v1.5 · SAD v1.4 · DDC v1.4

## 1. Introducción
Este documento describe la estrategia real de pruebas implementada en Mural Maz Lince para validar el backend (Node.js/Express + PostgreSQL), la seguridad de privacidad del número de WhatsApp y las reglas de negocio críticas.

- **Alcance implementado:** Pruebas unitarias de backend (Jest), pruebas de integración de API (Jest + Supertest contra PostgreSQL dedicado `mural_maz_lince_test`), y validaciones estáticas de frontend (`eslint` Airbnb + `vite build`).
- **Pendiente / fuera de alcance actual:** Suite automatizada de pruebas de frontend (no hay runner configurado en `frontend/package.json`), pruebas E2E en navegador y completar el login automático en el script de auditoría `backend/tests/security/whatsapp_audit.js`.

## 2. Estrategia y suites reales

### Nivel 1 — Pruebas Unitarias (`backend/tests/unit/`)
- **Herramienta y comando:** `npm test` en `backend/` (`jest --runInBand --passWithNoTests --coverage`).
- **Objetivo:** Verificar lógica pura y servicios críticos sin depender de base de datos ni red.
- **Suites existentes (6 archivos):**

| Archivo | Módulo cubierto |
| --- | --- |
| `adminBootstrap.test.js` | `scripts/bootstrap_admin.js` (`getAdminCredentials`, `provisionAdmin` con pool mockeado) |
| `checksum.test.js` | `src/utils/checksum.js` (`isValidMatricula`: `/^2\d{7}$/`) |
| `dhash.test.js` | `src/utils/dhash.js` y `src/utils/hammingDistance.js` (con buffers generados por `sharp`) |
| `interactionService.test.js` | `src/services/interactionService.js` (`isAccidental`, umbral de 5000 ms) |
| `testDatabaseGuard.test.js` | `tests/helpers/testDatabase.js` (`assertTestDatabase`, `isTestDatabaseUrl`) |
| `whatsappLink.test.js` | `src/services/whatsappLinkService.js` (`generateWaLink`) |

- **Meta de cobertura:** 100% en módulos críticos (`checksum.js`, `dhash.js`, `whatsappLinkService.js`, `interactionService.js`) y ≥ 70% global en `backend/src/`.

### Nivel 2 — Pruebas de Integración de API (`backend/tests/integration/`)
- **Herramienta y comando:** `npm run test:integration` en `backend/` (ejecuta `scripts/bootstrap_integration.js`, que crea/verifica `mural_maz_lince_test`, corre `npm run migrate:test` y lanza Jest + Supertest guardando salida en `results/integration_sprint12.txt`).
- **Protección de base de datos:** `backend/tests/helpers/testDatabase.js` fija `DATABASE_URL` a `mural_maz_lince_test` y aborta la ejecución si apunta a una base no dedicada a pruebas.
- **Suites existentes (4 archivos):**

| Archivo | Flujos verificados |
| --- | --- |
| `auth.test.js` | Registro estudiante/emprendedor, rollback ante fallos de BD, login, `POST /auth/login/check` (anti-enumeración y rate limiter), logout, `POST /auth/claim-matricula`, `GET /auth/privacy`. |
| `auth_flow.test.js` | Flujo secuencial de registro, login y reclamo de matrícula. |
| `feed.test.js` | Paginación por cursor, límite de 5 proyectos activos, likes accidentales vs. válidos, reporte duplicado (409), métricas de proyecto excluyendo interacciones accidentales, moderación con `bad-words` y timeout de Vision, aprobación/rechazo admin, privacidad de WhatsApp, resolución y filtrado de categorías por nombre/ID. |
| `moderation.test.js` | Cola de moderación admin, shadowban tras 5 reportes + 12 h de inacción y restauración automática a las 48 h. |

### Nivel 3 — Auditoría de Seguridad y Validación de Frontend
- **Auditoría de WhatsApp:** `backend/tests/security/whatsapp_audit.js` verifica 9 endpoints contra exposición de `whatsapp_number` en texto plano. *Nota técnica:* `setupAuthCookies()` actualmente retorna cookies vacías (stub); la validación autenticada se cubre en `integration/feed.test.js`.
- **Frontend (`frontend/`):** Sin suite de tests automatizados. Validación mediante `npm run lint` (ESLint 8 + Airbnb) y `npm run build` (Vite 7), más verificación manual de compresión (`browser-image-compression` ≤ 500 KB / 1200 px) y recorte (`react-easy-crop`).

## 3. Entorno de pruebas
- `NODE_ENV=test` (activa mocks automáticos de Cloudinary y Google Cloud Vision, desactiva rate limiter y jobs cron).
- PostgreSQL en puerto `5433` (`docker compose up -d db`).
- `DATABASE_URL=postgresql://postgres:password@localhost:5433/mural_maz_lince_test`.
- Comandos reales desde `backend/`:
  - `npm test` — pruebas unitarias con cobertura.
  - `npm run migrate:test` — inicializa el esquema en la base de pruebas.
  - `npm run test:integration` — aprovisiona la base de pruebas, migra y ejecuta las 4 suites de integración.
  - `npm run lint` — ESLint (`airbnb-base`).

## 4. Criterios de entrada y salida por fase
### FASE A — Pruebas Unitarias
- **Entrada:** Dependencias instaladas en `backend/`.
- **Salida:** Cobertura ≥ 70% global, 100% en módulos críticos. Cero tests fallidos.
- **Bloqueo:** Cobertura de módulo crítico menor a 100% o fallo en el guard de base de datos.

### FASE B — Pruebas de Integración de API
- **Entrada:** Fase A completa y servicio PostgreSQL levantado en puerto `5433`.
- **Salida:** 100% de los casos de integración en verde (`auth`, `auth_flow`, `feed`, `moderation`).
- **Bloqueo:** Defectos de gravedad Crítica (`SEV-1`).

### FASE C — Seguridad y Validación de Frontend
- **Entrada:** Fases A y B en verde.
- **Salida:** 0 exposiciones de `whatsapp_number` en respuestas públicas/ajenas, `frontend` con `npm run lint` y `npm run build` sin errores.
- **Bloqueo:** Violación de privacidad de WhatsApp (`SEV-1`) o build roto.

## 5. Definición de severidades de defectos
- **SEV-1 (Crítico):** Bloquea liberación. Pérdida de integridad de datos, exposición en texto plano de `whatsapp_number`, brechas de JWT/cookies o validación de matrícula rota.
- **SEV-2 (Mayor):** Error notorio en funcionalidad principal (límite de proyectos/anuncios ignorado, umbral de reversión roto, moderación/shadowban inconsistente).
- **SEV-3 (Menor):** Falla cosmética o secundaria que no bloquea el flujo principal.
- **SEV-4 (Observación):** Mejora de rendimiento, ergonomía o deuda técnica no bloqueante.
