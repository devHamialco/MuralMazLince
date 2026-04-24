# Software Test Document (Borrador) — Sprint 12
**Proyecto:** Mural Maz Lince
**Referencia STP:** v1.0

## DEF-001 | Severidad: SEV-2
**Fecha de detección:** Abril 2026
**Detectado en:** Tarea 3 (Suite Unitaria Jest)
**Módulo afectado:** `tests/unit/interactionService.test.js` y `src/services/interactionService.js`
**Referencia SRS:** RN-08

### Descripción
Incompatibilidad de nombres. El servicio exportaba `isAccidental` pero el test invocaba `is_accidental`, lo cual arrojaba un `TypeError`, bloqueando la validación del umbral completo sobre intención de likes/ratings.

### Pasos para reproducir
1. Ejecutar `npm run test` contra los test unitarios.
2. La prueba unitaria falla en el assert antes de la comprobación aritmética.

### Resultado esperado
El naming de la prueba debe ser congruente con el módulo.

### Estado
- [ ] Abierto
- [ ] En corrección
- [x] Resuelto 

## DEF-002 | Severidad: SEV-1
**Fecha de detección:** Abril 2026
**Detectado en:** Tarea 4 (Suite de Integración)
**Módulo afectado:** `tests/integration/auth_flow.test.js` y `src/app.js`
**Referencia SRS:** RF-15

### Descripción
Bloqueo de login de estudiantes con error 500. Se provocaba debido a un error de configuración donde el proceso de tests de integración individual carecía de `JWT_SECRET` inyectado para completar la directiva de firma de `jsonwebtoken`, generando un status 503/500 no previsto por la ruta.

### Pasos para reproducir
1. Eliminar variables `JWT_SECRET` del entorno del executor de Node.
2. Ejecutar el request de `/auth/login` con una Matrícula estudiantil válida.
3. El status devuelve HTTP 500: Server configuration incomplete.

### Resultado esperado
Inyección temprana garantizada de variables requeridas por parte del runner o pre-instanciación de `process.env.JWT_SECRET` en el script de test `beforeAll`.

### Estado
- [ ] Abierto
- [ ] En corrección
- [x] Resuelto 
