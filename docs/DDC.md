# DETAILED DESIGN DOCUMENT (DDC)

- **Proyecto:** Mural Maz Lince
- **Versión:** 1.4
- **Elaborado por:** Miriam Alanis
- **Fecha de actualización:** Noviembre 2026
- **Referencias:** SRS v1.5 · SAD v1.4 · `docs/swagger.json` v1.1.0

## HISTORIAL DE VERSIONES

| Versión | Fecha | Descripción | Autor |
| --- | --- | --- | --- |
| 1.0 | Marzo 2026 | Versión inicial del DDC. | Miriam Alanis |
| 1.1 | Marzo 2026 | `WF-3.2.3` actualizado con `display_name` obligatorio en registro emprendedor y `POST /auth/register/entrepreneur`. | Miriam Alanis |
| 1.2 | Abril 2026 | Referencias a SRS v1.4 y SAD v1.3; corrección de trazabilidad `WF-3.1.1`; `display_name` y `entrepreneur_profiles` en tarjetas; mínimo 2 caracteres en `WF-3.2.3`. | Miriam Alanis |
| 1.3 | Octubre 2026 | Incorporación de `ChipNav`, rediseño de `AnnouncementCard`, eliminación de generador QR y reemplazo de `VigoranceSelector` por control nativo. | Miriam Alanis |
| 1.4 | Noviembre 2026 | Sincronización completa con la implementación real del código: paleta OLED (`tokens.css`), inventario real de 24 componentes React, vistas públicas de proyecto/emprendedor (`EntrepreneurDetails.jsx`), flujo multicontacto y perfil de identidad, login proactivo (`POST /auth/login/check`), panel emprendedor de 4 pestañas, panel admin de 3 pestañas y catálogo completo de endpoints REST. | Equipo de desarrollo |

---

## SECCIÓN 1. INTRODUCCIÓN

### 1.1 Propósito
Este Detailed Design Document (DDC) especifica el sistema de diseño real (`frontend/src/styles/tokens.css`, `global.css`, `dashboard.css`), los componentes React implementados (`frontend/src/components/`), las rutas y pantallas vigentes (`frontend/src/pages/`) y el contrato de endpoints REST (`backend/src/routes/`).

### 1.2 Alcance
Cubre la SPA/PWA en modo oscuro OLED (viewport móvil base `375px`, con soporte tablet/escritorio) y todos los endpoints HTTP servidos por Express bajo `backend/src/app.js` y documentados en `docs/swagger.json`.

---

## SECCIÓN 2. SISTEMA DE DISEÑO

### 2.1 Identidad Visual
La aplicación implementa un tema oscuro OLED (`#000000` como base) orientado a ahorro de batería y contraste alto en dispositivos móviles, con rojo neón ajustado (`#D92528`, oscurecido desde `#FF2A2D` para alcanzar contraste WCAG 2.1 AA ≈ 4.9:1 sobre texto blanco) como color primario de acción, azul eléctrico (`#2e5bff`) para categoría de servicios y amarillo (`#FFC82C` / `#F0C040`) para estrellas y destacados.

### 2.2 Paleta de Colores (`frontend/src/styles/tokens.css`)

| Nombre | Variable CSS | Alias | Valor real | Uso principal |
| --- | --- | --- | --- | --- |
| Fondo base | `--bg-base` | `--BG_BASE` | `#000000` | Fondo principal OLED de la aplicación |
| Fondo tarjeta | `--bg-card` | `--BG_CARD` | `#0F0F11` | Tarjetas de anuncios y paneles |
| Superficie elevada | `--bg-surface` | `--BG_SURFACE` | `#18181B` | Modales, paneles, barra de navegación |
| Elemento elevado | `--bg-elevated` | — | `#242427` | Controles interactivos y estados hover |
| Primario | `--primary` | `--PRIMARY` | `#D92528` | Botones CTA, acentos, badges de Productos |
| Secundario | `--secondary` | `--SECONDARY` | `#2e5bff` | Links, badges de Servicios |
| Terciario / Acento | `--tertiary` / `--accent` | `--ACCENT` | `#FFC82C` / `#F0C040` | Estrellas de valoración, destacados |
| Advertencia | `--warning` | — | `#F59E0B` | Avisos de vencimiento y estados de alerta |
| Texto principal | `--text-primary` | `--TEXT_PRIMARY` | `#FFFFFF` | Títulos y texto principal |
| Texto secundario | `--text-secondary` | `--TEXT_SECONDARY` | `#D4D4D8` | Descripciones y etiquetas |
| Texto atenuado | `--text-muted` | `--TEXT_MUTED` | `#9CA3AF` | Metadatos y marcas de tiempo |
| Borde | `--border` | `--BORDER` | `rgba(255, 255, 255, 0.08)` | Separadores y contornos sutiles |
| Estado activo | `--status-active` | — | `#10B981` | Badge "Publicado", botón WhatsApp |
| Estado pendiente | `--status-pending` | — | `#F59E0B` | Badge "En revisión" |
| Estado rechazado | `--status-rejected` | — | `#EF4444` | Badge "Rechazado" y errores |

### 2.3 Tipografía
- **Familia principal:** `Inter` (Google Fonts), fallback `sans-serif` nativa.
- **Escala:** Display `32px` (700), H1 `24px` (700), H2 `20px` (600), Body L `16px` (400), Body S `14px` (400), Caption `12px` (400), Button `14px` (600), Badge `12px` (600).

### 2.4 Espaciado, Radios y Capas (`tokens.css`)
- **Espaciado:** `--spacing-xs` `4px`, `sm` `8px`, `md` `16px`, `lg` `24px`, `xl` `32px`, `2xl` `48px`, `3xl` `64px`.
- **Radios:** `--radius-sm` `6px`, `md` `12px`, `lg` `16px`, `xl` `24px`.
- **Z-index:** base `1`, sticky `100`, dropdown `200`, modal-backdrop `300`, modal `400`, toast `500`, notification-dot `600`.
- **Librerías UI:** Bootstrap `5.3.3` (utilidades/grid), `react-icons` (`react-icons/fi`), CSS tokens y hojas `global.css` + `dashboard.css`.

### 2.5 Inventario Real de Componentes Reutilizables (`frontend/src/components/`)

| Componente | Responsabilidad |
| --- | --- |
| `Navbar` | Barra superior fija con navegación contextual por rol, acceso al panel y cierre de sesión. |
| `PrivateRoute` | Guard de rutas que verifica autenticación y roles permitidos (`entrepreneur`, `admin`). |
| `ErrorBoundary` | Captura errores de renderizado en React y muestra pantalla de recuperación. |
| `ToastNotification` | Notificación flotante global con auto-cierre (`success`, `error`, `info`, `warning`). |
| `AnnouncementCard` | Tarjeta de anuncio en el feed (relación 4:3, lazy/async, enlace estirado, botón de reporte 44px, `LikeButton`, `StarRating`, badge de categoría y enlace al proyecto/emprendedor). |
| `AnnouncementCardSkeleton` | Placeholder de carga para tarjetas del feed. |
| `CategoryBadge` | Etiqueta de categoría coloreada por grupo (`productos` → `--primary`, `servicios` → `--secondary`), área táctil accesible. |
| `CategoryChipPanel` | Panel/barra de filtros horizontales con scroll-snap y normalización de las 14 categorías de una palabra (`constants/categories.js`). |
| `ChipNav` | Navegación accesible (`role="tablist"`/`"tab"`) mediante chips en paneles de emprendedor y administrador. |
| `StarRating` | Control interactivo/lectura de 1 a 3 estrellas (`RF-13`). |
| `LikeButton` | Botón de "Me gusta" con estado optimista y contador (`RF-12`). |
| `StatusBadge` | Etiqueta semántica de estado (`active`, `pending_review`, `rejected`, `shadowban`, `suspended`, `expired`). |
| `StatsCard` | Tarjeta de KPI para métricas del emprendedor (`total_likes`, `avg_rating`, `total_announcements`). |
| `ImageUploader` | Selector táctil y drag-and-drop con compresión client-side mediante `browser-image-compression` (≤ 500 KB / 1200 px). |
| `ImageCropper` | Recortador interactivo basado en `react-easy-crop` (4:3 para anuncios, 1:1 circular para avatar/logo) con utilidad `createCroppedFile`. |
| `ProjectCard` | Tarjeta de proyecto en el dashboard con acordeón desplegable para sus anuncios, toggle activo/suspendido y botones de edición/eliminación. |
| `ProjectForm` | Formulario controlado de alta de proyecto con categorías agrupadas (`optgroup`), logo opcional y autoguardado de borrador en `localStorage`. |
| `ProjectEditModal` | Modal accesible para editar nombre, descripción, categoría y logo de un proyecto existente. |
| `AnnouncementForm` | Formulario de creación de anuncio con imagen 4:3, selector de proyecto, categoría, accesos rápidos de vigencia y autoguardado en `localStorage`. |
| `AnnouncementEditModal` | Modal bottom-sheet accesible (focus trap, Escape, confirmación de descarte) para editar anuncios existentes. |
| `NotificationsPanel` | Listado de notificaciones internas del emprendedor con estados semánticos y acción de lectura. |
| `ReportModal` | Modal bottom-sheet accesible con `radiogroup` de motivos confidenciales de reporte (`RF-35`). |
| `ConfirmModal` | Diálogo `role="alertdialog"` para confirmaciones destructivas (eliminar proyecto/anuncio, descartar cambios). |
| `EmptyState` | Componente estándar para estados vacíos o sin resultados con CTA opcional. |

---

## SECCIÓN 3. RUTAS Y PANTALLAS IMPLEMENTADAS (`frontend/src/App.jsx`)

| Ruta | Página (`src/pages/`) | Acceso | Descripción real |
| --- | --- | --- | --- |
| `/` | `Feed.jsx` | Público | Solicita `GET /announcements?limit=500`, mezcla el orden en cliente con Fisher-Yates y renderiza tarjetas `AnnouncementCard`. La barra de chips de categoría (`CategoryChipPanel`) se muestra solo cuando el usuario está autenticado y filtra en cliente sobre las 14 categorías normalizadas. Permite dar like (redirige a `/login` si no hay sesión) y reportar vía `ReportModal`. |
| `/announcement/:id` | `AnnouncementDetail.jsx` | Público | Consulta `GET /announcements/:id`. Muestra imagen 16:9, `CategoryBadge`, likes y promedio de estrellas, chip clicable al proyecto (`/proyecto/:projectId`), descripción completa, bloque de contacto (enlace `wa_link` solo si está autenticado, Instagram y ubicación de salón si existen), `StarRating` y `LikeButton` interactivos para autenticados, botón de reporte y badge de vencimiento. |
| `/proyecto/:id` | `EntrepreneurDetails.jsx` | Público | Consulta `GET /projects/public/:id`. Muestra tarjeta de identidad del emprendedor (avatar circular, nombre público, bio, canales de contacto permitidos), datos del proyecto y sus anuncios activos. |
| `/emprendedor/:id` | `EntrepreneurDetails.jsx` | Público | Consulta `GET /auth/profile/:id`. Muestra perfil público del emprendedor, cuadrícula de proyectos activos y sus anuncios activos. |
| `/login` | `Login.jsx` | Público | Ingreso de matrícula (8 dígitos iniciando con `2`). Ejecuta consulta proactiva con debounce (300 ms) a `POST /auth/login/check` para mostrar el campo de contraseña únicamente cuando la cuenta requiere contraseña (`entrepreneur` o `admin`). Al autenticar (`POST /auth/login`), redirige según rol (`admin` → `/admin`, `entrepreneur` → `/dashboard`, resto → origen o `/`). |
| `/register` | `Register.jsx` | Público (y `visitor_registered` con `?type=entrepreneur`) | Flujo en 3 vistas: selector `bienvenido` → registro estudiante (`POST /auth/register/student`, solo matrícula) o registro emprendedor (`POST /auth/register/entrepreneur`, matrícula, contraseña ≥ 8, `display_name`, bio opcional, al menos un canal entre WhatsApp `+52` o Instagram, checkbox de aviso de privacidad). *Nota:* el enlace `/privacy` del checkbox aún no tiene ruta SPA dedicada (el aviso HTML vive en `GET /auth/privacy` del backend). |
| `/claim-matricula` | `ClaimMatricula.jsx` | Público | Envía matrícula disputada y WhatsApp (10 dígitos con prefijo `+52`) a `POST /auth/claim-matricula` para generar un ticket en `claim_tickets`. |
| `/dashboard` | `EntrepreneurDashboard.jsx` | `PrivateRoute` (`entrepreneur`, `admin`) | Panel unificado de 4 pestañas gestionado con `ChipNav` y tarjetas superiores `StatsCard` (`total_likes`, `avg_rating`, `total_announcements`):<br>1. **Mis Proyectos:** alta (`ProjectForm`, límite 5 activos), listado con `ProjectCard` (acordeón de anuncios por proyecto), cambio de estado `active`/`suspended`, edición (`ProjectEditModal`) y eliminación (`ConfirmModal`).<br>2. **Mis Anuncios:** vista agregada de anuncios, filtro por proyecto, alerta de vencimiento, creación (`AnnouncementForm` + `ImageUploader` + `ImageCropper` 4:3), edición (`AnnouncementEditModal`) y eliminación.<br>3. **Notificaciones:** listado mediante `NotificationsPanel`.<br>4. **Mi Perfil:** edición de `display_name`, `bio_short`, avatar circular recortado (`ImageCropper`, enviado como base64), WhatsApp, Instagram y salón físico (`PATCH /auth/profile`, exige ≥ 1 canal). |
| `/admin` | `AdminPanel.jsx` | `PrivateRoute` (`admin`) | Consola administrativa de 3 pestañas con `ChipNav`:<br>1. **Anuncios Publicados:** listado (`GET /admin/announcements`) con buscador en tiempo real y retiro definitivo con motivo obligatorio + opción de suspender usuario (`POST /admin/announcements/:id/remove`).<br>2. **Moderación:** cola priorizada por urgencia (`GET /admin/moderation-queue`), aprobar/restaurar (`PATCH /admin/announcements/:id/approve`) y rechazar con motivo + suspensión opcional (`POST /admin/announcements/:id/reject`).<br>3. **Reclamos de Matrícula:** tickets pendientes (`GET /admin/claim-tickets`) y resolución (`PATCH /admin/claim-tickets/:id/resolve`). |
| `*` | `<Navigate to="/" />` | Público | Redirección al feed principal. |

### 3.1 Brechas conocidas en la interfaz actual
1. **Persistencia de lectura de notificaciones:** `NotificationContext.markAsRead` y `markAllAsRead` actualizan solo estado local (`read: true`) sin invocar aún `PATCH /notifications/:id/read` ni `PATCH /notifications/read-all`, mientras `NotificationsPanel` lee `is_read`.
2. **Ruta SPA del aviso de privacidad:** `Register.jsx` enlaza a `/privacy` en lugar de apuntar a `${VITE_API_URL}/auth/privacy` o a una vista dedicada.
3. **Comparativa visual dHash en Admin:** `AdminPanel.jsx` muestra el botón `"Ver comparación de imagen"` cuando existe `hash_match`, pero el modal comparativo aún no se renderiza salvo al abrir rechazo.
4. **Valor de motivo de reporte:** `ReportModal.jsx` envía `reason: 'false'` mientras el enum de PostgreSQL (`report_reason_enum`) espera `'false_info'`.

---

## SECCIÓN 4. ESPECIFICACIÓN DE API REST

Todos los endpoints devuelven JSON (salvo `GET /auth/privacy` que devuelve HTML). La autenticación usa cookies HttpOnly (`token`) enviadas con `credentials: 'include'`. El contrato OpenAPI 3.0 completo se sirve en `GET /api-docs` desde `docs/swagger.json`.

### 4.1 Sistema

| Método | Ruta | Acceso | Propósito |
| --- | --- | --- | --- |
| `GET` | `/health` | Público | Verifica conexión a PostgreSQL (`SELECT 1`), retorna estado, uptime y versión. |
| `GET` | `/api-docs` | Público | Sirve `docs/swagger.json` (OpenAPI 3.0). |

### 4.2 Autenticación y Perfil (`/auth`)

| Método | Ruta | Acceso | Propósito |
| --- | --- | --- | --- |
| `GET` | `/auth/privacy` | Público | Aviso de privacidad HTML conforme a LFPDPPP (incluye derechos ARCO). |
| `GET` | `/auth/profile/:id` | Opcional | Perfil público de emprendedor, proyectos y anuncios activos (`wa_link` solo si autenticado). |
| `GET` | `/auth/me` | Autenticado | Datos del usuario autenticado + perfil propio (`Cache-Control: no-store`). |
| `PATCH` | `/auth/profile` | Autenticado | Upsert de `entrepreneur_profiles` (nombre, bio, Instagram, salón, foto base64 → Cloudinary) y `whatsapp_number`. |
| `POST` | `/auth/register/student` | Público (`authLimiter`) | Registro `visitor_registered` solo con matrícula válida (`/^2\d{7}$/`). |
| `POST` | `/auth/register/entrepreneur` | Público (`authLimiter`) | Alta transaccional en `users` + `entrepreneur_profiles` (WhatsApp o Instagram requerido). |
| `POST` | `/auth/login` | Público (`authLimiter`) | Inicia sesión y emite cookie HttpOnly `token` (bloquea cuentas suspendidas con `403`). |
| `POST` | `/auth/login/check` | Público (`authLimiter`) | Indica `{ requiresPassword: boolean }` sin enumerar cuentas inexistentes/suspendidas. |
| `POST` | `/auth/logout` | Público | Elimina cookie `token` (`Cache-Control: no-store`). |
| `POST` | `/auth/claim-matricula` | Público | Crea ticket en `claim_tickets` por matrícula disputada. |

### 4.3 Proyectos (`/projects`)

| Método | Ruta | Acceso | Propósito |
| --- | --- | --- | --- |
| `GET` | `/projects/public/:id` | Opcional | Detalle público de proyecto activo, autor y anuncios activos (`wa_link` solo si autenticado). |
| `GET` | `/projects` | `entrepreneur`, `admin` | Lista los proyectos del usuario autenticado con conteos de anuncios. |
| `GET` | `/projects/metrics` | `entrepreneur`, `admin` | Métricas agregadas (`total_likes`, `avg_rating`, `total_announcements`, excluye accidentales). |
| `POST` | `/projects` | `entrepreneur`, `admin` | Crea proyecto (valida límite `MAX_ACTIVE_PROJECTS=5`, resuelve categoría por nombre o ID, logo base64 opcional). |
| `GET` | `/projects/:id` | `entrepreneur`, `admin` | Detalle de proyecto propio con anuncios y métricas por proyecto. |
| `PATCH` | `/projects/:id` | `entrepreneur`, `admin` | Edición parcial (nombre, descripción, categoría, logo base64). |
| `PATCH` | `/projects/:id/status` | `entrepreneur`, `admin` | Alterna estado `active` ↔ `suspended` (valida límite al reactivar). |
| `DELETE` | `/projects/:id` | `entrepreneur`, `admin` | Elimina proyecto propio (cascada de anuncios en PostgreSQL). |

### 4.4 Anuncios, Feed e Interacciones (`/announcements`)

| Método | Ruta | Acceso | Propósito |
| --- | --- | --- | --- |
| `GET` | `/announcements` | Público | Feed de anuncios activos con paginación por cursor (`cursor`, `category`, `limit` hasta 500). |
| `GET` | `/announcements/:id` | Opcional | Detalle de anuncio activo (`wa_link` solo si autenticado; `whatsapp_number` siempre omitido). |
| `POST` | `/announcements` | `entrepreneur` | Crea anuncio (`multipart` o `image_base64`), valida límite 3 activos/pendientes, sube a Cloudinary y ejecuta moderación si `ENABLE_AUTO_MODERATION=true` (o `test`). Retorna `201` (`active`) o `202` (`pending_review`). |
| `PATCH` | `/announcements/:id` | `entrepreneur` | Actualización parcial de anuncio propio. |
| `DELETE` | `/announcements/:id` | `entrepreneur` | Elimina imagen de Cloudinary y registro en BD. |
| `POST` | `/announcements/:id/like` | `visitor_registered`, `entrepreneur` | Toggle de like; al revertir evalúa `is_accidental` (< 5000 ms). |
| `POST` | `/announcements/:id/rating` | `visitor_registered`, `entrepreneur` | Upsert de valoración 1–3 estrellas; reenviar misma calificación la revierte evaluando `is_accidental`. |
| `DELETE` | `/announcements/:id/rating` | `visitor_registered`, `entrepreneur` | Revierte valoración activa evaluando `is_accidental`. |
| `POST` | `/announcements/:id/report` | `visitor_registered`, `entrepreneur` | Registra reporte (`409` si duplicado); al alcanzar 3 reportes únicos encola alerta de urgencia. |

### 4.5 Notificaciones (`/notifications`)

| Método | Ruta | Acceso | Propósito |
| --- | --- | --- | --- |
| `GET` | `/notifications` | Autenticado | Lista notificaciones del usuario ordenadas por `created_at DESC`. |
| `PATCH` | `/notifications/read-all` | Autenticado | Marca todas las notificaciones del usuario como leídas. |
| `PATCH` | `/notifications/:id/read` | Autenticado | Marca una notificación específica como leída. |

### 4.6 Administración (`/admin`)

| Método | Ruta | Acceso | Propósito |
| --- | --- | --- | --- |
| `GET` | `/admin/moderation-queue` | `admin` | Cola de `pending_review`/`shadowban` priorizada por `urgency_alert_at` con URL de coincidencia pHash. |
| `GET` | `/admin/announcements` | `admin` | Hasta 100 anuncios activos con filtro `?search=` (`ILIKE`). |
| `PATCH` | `/admin/announcements/:id/approve` | `admin` | Aprueba o restaura anuncio a `active` y notifica al emprendedor. |
| `POST` | `/admin/announcements/:id/reject` | `admin` | Rechaza anuncio, borra imagen en Cloudinary, opcionalmente suspende usuario y notifica. |
| `POST` | `/admin/announcements/:id/remove` | `admin` | Retira y elimina anuncio activo con motivo obligatorio, borra imagen en Cloudinary y opcionalmente suspende usuario. |
| `POST` | `/admin/users/:id/suspend` | `admin` | Suspende la cuenta del usuario (`is_suspended = true`). |
| `GET` | `/admin/claim-tickets` | `admin` | Lista tickets pendientes de reclamo de matrícula. |
| `PATCH` | `/admin/claim-tickets/:id/resolve` | `admin` | Marca ticket pendiente como resuelto registrando `admin_id` y `resolved_at`. |

### 4.7 Códigos de Respuesta HTTP

| Código | Significado en la API |
| --- | --- |
| `200 OK` | `GET`, `PATCH`, `DELETE` y acciones administrativas exitosas. |
| `201 Created` | Recurso creado (`users`, `projects`, `announcements` activo, `claim_tickets`, `reports`). |
| `202 Accepted` | Anuncio recibido pero retenido en `pending_review` por moderación. |
| `400 Bad Request` | Matrícula inválida, campos obligatorios ausentes, formato de contacto inválido o texto rechazado. |
| `401 Unauthorized` | Cookie de sesión ausente, expirada o inválida. |
| `403 Forbidden` | Cuenta suspendida o rol sin permisos para el recurso. |
| `404 Not Found` | Recurso inexistente o no accesible. |
| `409 Conflict` | Matrícula duplicada, reporte duplicado o límite de proyectos/anuncios alcanzado. |
| `413 Payload Too Large` | Imagen que excede el límite permitido (`multer` 5 MB / compresión cliente). |
| `429 Too Many Requests` | Rate limit superado (> 10 peticiones por IP cada 15 min en `/auth`). |
| `500 / 503` | Error interno inesperado o fallo de salud de base de datos (`/health`). |

---

## SECCIÓN 5. TRAZABILIDAD DDC ↔ SRS

| Pantalla / Grupo API | Ruta / Sección | Requisitos SRS |
| --- | --- | --- |
| Feed Principal (público y autenticado) | `/` (`Feed.jsx`) | `RF-08`, `RF-09`, `RF-12`, `RF-13`, `RF-14`, `RNF-01`, `RNF-02` |
| Detalle de anuncio | `/announcement/:id` (`AnnouncementDetail.jsx`) | `RF-10`, `RF-11`, `RF-12`, `RF-13`, `RF-35`, `RNF-04` |
| Perfil público de proyecto y emprendedor | `/proyecto/:id`, `/emprendedor/:id` (`EntrepreneurDetails.jsx`) | `RF-10`, `RF-11`, `RF-38`, `RF-39` |
| Registro y autenticación | `/register`, `/login` (`Register.jsx`, `Login.jsx`) | `RF-01`–`RF-07`, `RF-38`, `RNF-17`, `RN-01`, `RN-09` |
| Reclamo de matrícula | `/claim-matricula` (`ClaimMatricula.jsx`) | `RF-34`, `RN-02`, `RN-10` |
| Panel del emprendedor (4 pestañas) | `/dashboard` (`EntrepreneurDashboard.jsx`) | `RF-15`–`RF-25`, `RF-31`, `RF-37`, `RF-38`, `RF-39`, `RN-03`, `RN-04` |
| Panel de administración (3 pestañas) | `/admin` (`AdminPanel.jsx`) | `RF-28`, `RF-29`, `RF-30`, `RF-34`, `RF-36`, `RF-37` |
| API `/auth` | Sección 4.2 | `RF-01`–`RF-07`, `RF-34`, `RF-38`, `RF-39`, `RNF-17` |
| API `/projects` | Sección 4.3 | `RF-10`, `RF-15`–`RF-18`, `RF-23`, `RF-24`, `RN-03` |
| API `/announcements` | Sección 4.4 | `RF-08`–`RF-14`, `RF-19`–`RF-22`, `RF-26`–`RF-28`, `RF-31`–`RF-33`, `RF-35`–`RF-37` |
| API `/notifications` | Sección 4.5 | `RF-25`, `RF-37` |
| API `/admin` | Sección 4.6 | `RF-29`, `RF-30`, `RF-33`, `RF-34`, `RF-36`, `RF-37` |

---
*FIN DEL DOCUMENTO — DDC Mural Maz Lince v1.4*
