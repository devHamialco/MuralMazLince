# PLAN DE IMPLEMENTACIÓN — SPRINT 13
**Proyecto:** Mural Maz Lince  
**Sprint:** 13 — Fase de Testing (Semana 2 de 2)  
**Épica:** ÉPICA 5 — TESTING  

## CONTEXTO Y OBJETIVO DEL SPRINT

El Sprint 13 complementa al Sprint 12 (pruebas unitarias e integradas) enfocándose en **pruebas Black-Box, End-to-End (E2E), UI/UX y Performance**. 
El entregable de este sprint es certificar el comportamiento del sistema desde la perspectiva del usuario final y validar los Atributos de Calidad (RNF) definidos en el SRS, dando como resultado el STD final (Software Test Documentation) e inaugurando el ciclo de Despliegue a Producción (HITO-09).

---

## TAREA 1 — Pruebas End-to-End (E2E) por Caso de Uso

**Objetivo:** Verificar los flujos completos de los usuarios desde la interfaz usando el frontend conectado al backend en staging.

| UC ID | Caso de Uso | Pasos a Ejecutar (Flujo Principal) | Resultado Esperado |
|---|---|---|---|
| UC-01 | Registrarse como estudiante | Ir a Sign Up > Estudiante > Ingresar Matrícula (ej. 20240011) > Enviar. | Redirigir al feed. Identidad=Visitante Registrado. Panel de Emprendedor oculto. |
| UC-02 | Registrarse como emprendedor | Ir a Sign Up > Emprendedor > Matrícula (20240012) + Password + WhatsApp + Nombre Visible > Click Checkbox > Enviar. | Redirigir al feed. Token almacenado en Auth context. Panel de Emprendedor habilitado. |
| UC-03 | Publicar Anuncio | Emprendedor > Panel > Crear Proyecto > Crear Anuncio > Subir Imagen > Enviar. | Notificación de "creado". Anuncio visible en "Pendiente de Revisión" (Si requiere) o "Activo". |
| UC-04 | Moderar Anuncio | Login Admin > Cola de Moderación > Aprobar anuncio de UC-03. | Anuncio pasa a estado activo, y se vuelve visible en feed para otros roles. |
| UC-05 | Valorar Anuncio | Estudiante/Emprendedor > Click en estrellas de un anuncio. | Estrellas cambian color y se suman las valoraciones. Testear revertir < 5s para descartar. |
| UC-06 | Reclamar Matrícula | Sign Up > Ingresar Matrícula ya en uso > Click en "¿Esta es tu matrícula?" > Enviar Reporte de reclamo. | Alerta visual en frontend de éxito, Admin ve ticket "Pendiente" en su panel. |
| UC-07 | Reportar Anuncio | Click en Reportar Anuncio > Seleccionar motivo > Enviar reporte. | Se envía con éxito. Evitar duplicidad reportes. |

---

## TAREA 2 — Pruebas de Responsividad (UI/UX)

**Herramienta:** Chrome DevTools (Device Toolbar) / Dispositivo Real.

- [ ] **Móvil (375px - iPhone SE):** Verificar menú desplegable/NavBar, apilamiento vertical correcto de las tarjetas (AnnouncementCard), y uso táctil nativo del ImageUploader.
- [ ] **Tablet (768px - iPad):** Verificar grillas o distribución en columnas, modales centrados sin problemas visuales.
- [ ] **Escritorio (1280px):** Verificar que la interfaz no se expanda a dimensiones no legibles. Todo el layout Max-width respeta el diseño central tipo Desktop UI.

---

## TAREA 3 — Compatibilidad Cross-Browser

**Herramienta:** Ejecución Local.

- [ ] **Google Chrome:** Validar animaciones, notificaciones visuales y cache Web/PWA.
- [ ] **Mozilla Firefox:** Comportamiento estricto standard de forms e inputs (fechas, selectores).
- [ ] **Apple Safari:** Comportamiento CSS estricto sobre webkit, renderizado del blur y padding/margins.

---

## TAREA 4 — Pruebas de Persistencia de Imágenes

**Situación a testear:** El sistema NO debe reaccionar mal a los comportamientos de PaaS (Railway).
1. Subir anuncio con una imagen usando cuenta de Emprendedor (ej: una moto).
2. Verificar que se puede ver globalmente recuperándose la URL Externa.
3. Forzar/Simular **redeploy** en Railway.app (reinicio del servidor Docker/Node.js).
4. Acceder al anuncio nuevamente.
- **Resultado Esperado:** La imagen aún debe mostrarse perfectamente con su link de Cloudinary. Sin imágenes caídas en 404 (0).

---

## TAREA 5 — Pruebas de Rendimiento (Performance)

**Herramienta:** Chrome DevTools > Network / Performance Analyzer.

- [ ] **Simulación:** Seleccionar `Network Throttling -> Fast 4G`. Omitir uso de Cache (Disable Web Cache habilitado). Recargar Feed principal.
- [ ] **Aceptación:** Medir la métrica de `First Contentful Paint (FCP)` o carga visual. Requisito de proyecto: **≤ 3 segundos** al pintar la vista.
- [ ] **Comprobación Adicional Componentes:** Scroll infinito recarga paginadamente (20 elementos permitidos) evitando desborde de peso de red DOM (Bloques y cursores operando).

---

## TAREA 6 — Pruebas del Sistema Shadowban Automático

1. Para acelerar el tiempo de este testing se usarán variables aceleradas `REPORT_SHADOWBAN_THRESHOLD=5` con limitantes temporales cortas en entorno de staging.
2. Identificar el URL y Anuncio, ejecutar reporte 5 veces por cuentas/testing mockups.
3. Esperar invocación de CRON del backend localmente o servidor test.
4. El Anuncio debe cambiar a estado reservado `shadowban`.
5. Emprendedor que ha subido el anuncio debe revisar notificaciones (Dashboard Tab) donde constatará la aplicación de penalidad oculta temporal.
6. Feed de visitantes `GET /` jamás expondrá el ID afectado en la red.

---

## TAREA 7 — Solución Definitiva a Defectos (Sprints 12 y 13)

- [ ] Corroborar el listado central `docs/STD_borrador_sprint12.md`.
- [ ] Documentar en un STD_Final cualquier nuevo bug o anomalía producto del testing E2E en UI.
- [ ] Ejecutar Fixes del código si lo amerita.
- [ ] Previo a consolidación de HITO NO puede subsistir bajo ningún motivo BUG con ticket severidad **SEV-1 o SEV-2** "abierto".

---

## TAREA 8 — Consolidación Final y Cierre de Testing (HITO-09)

1. Fusionar información al `STD.md` (Software Test Documentation Final), certificando casos pasados.
2. Declarar fin al ciclo de épica 5 (Testing).
3. Cerrar los tableros designados en JIRA o seguimiento Sprint 13.
4. Confirmar madurez de la aplicación y su certificación de calidad para iniciar el Despliegue Oficial en la fase final de Implementación.

---

## CHECKLIST DE CIERRE SPRINT 13

- [ ] `UC-01` a `UC-07` end-to-end testeados.
- [ ] Grillas y elementos validados responsivamente de iPhone SE a Laptop.
- [ ] Compatibilidad estricta Chrome, Safari, Firefox.
- [ ] Persistencia tras redos despliegues verificado exitosamente.
- [ ] Primera renderizado FCP completado ≤ 3s (Métrica 4G Validada).
- [ ] Algoritmo de Shadowban temporal Cron reacciona OK a Reportes en umbrales.
- [ ] Bug List y STD consolidado con `Cero 0` Bugs SEV-1/SEV-2 remanentes!
- [ ] Listo para iniciar Sprint 14 (HITO-10 Producción final).
