# SOFTWARE ARCHITECTURE DOCUMENT (SAD)
**Proyecto:** Mural Maz Lince
**Versión:** 1.4
**Elaborado por:** Miriam Alanis
**Fecha de actualización:** Noviembre 2026
**Basado en:** IEEE 42010:2011 – Systems and Software Engineering – Architecture Description / C4 Model (Simon Brown)

---

## HISTORIAL DE VERSIONES

| Versión | Fecha      | Descripción                                                                                                                                                                                          | Autor         |
|---------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| 1.0     | Marzo 2026 | Versión inicial del SAD                                                                                                                                                                              | Miriam Alanis |
| 1.1     | Marzo 2026 | ADR-04 actualizado: cookies HttpOnly sobre React Context; ADR-07 PWA con Service Worker; ADR-08 caché en memoria; SEQ-01 expandido con fallback de Vision API; cloudinary_id reforzado en narrativa del modelo de datos | Miriam Alanis |
| 1.2     | Marzo 2026 | Nueva tabla entrepreneur_profiles separada de users (ADR-09); display_name obligatorio; campos bio_short y profile_photo para v2.0; COMP-02 actualizado; relaciones ER actualizadas; trazabilidad SAD-SRS | Miriam Alanis |
| 1.3     | Abril 2026 | Actualización de referencias a SRS v1.4 y PMP v1.4; PWA declarado explícitamente en alcance (Sección 1.2) y en definiciones (Sección 1.4); ADR-07 y ADR-08 reubicados dentro de la Sección 8; SEQ-02 paso 8 corregido para reflejar cookie HttpOnly (consistente con ADR-04); ADR-09 redactado con cuerpo formal completo | Miriam Alanis |
| 1.4     | Noviembre 2026 | Sincronización con el código real: stack real de Frontend (Vite 7, React 18, Bootstrap 5, react-easy-crop, SW v4) y Backend (`pg` SQL directo, `ENABLE_AUTO_MODERATION`); esquema SQL y ER actualizados con `instagram_handle`, `classroom_location`, `projects.logo_url/logo_id` y estado `expired`; corrección de diagramas Mermaid y `COMP-12`; actualización de ADR-04/07/08/09 y variables de entorno reales (`.env.example`). | Equipo de desarrollo |

---

## SECCIÓN 1. INTRODUCCIÓN

### 1.1 Propósito del documento

Este Software Architecture Document (SAD) describe la arquitectura real del sistema Mural Maz Lince versión 1.4 según el C4 Model: contexto del sistema, contenedores, componentes del backend y decisiones de arquitectura registradas como ADRs. Además incluye los diagramas de secuencia de los flujos críticos del sistema y el modelo entidad-relación de la base de datos.

El documento sirve como referencia técnica alineada con el código fuente para las fases de desarrollo, pruebas y mantenimiento. Toda decisión de diseño significativa queda trazada a un requisito del SRS v1.5.

### 1.2 Alcance

Este documento cubre la arquitectura del sistema: frontend React + Vite (Progressive Web App — PWA), backend Node.js/Express (CommonJS, SQL parametrizado con `pg`), base de datos PostgreSQL 15, integración con Cloudinary, Google Cloud Vision API y el sistema de moderación híbrida.

### 1.3 Referencias

- [1] SRS – Mural Maz Lince v1.5
- [2] PMP – Mural Maz Lince v1.5
- [3] DDC – Mural Maz Lince v1.4
- [4] IEEE 42010:2011 – Systems and Software Engineering – Architecture Description
- [5] C4 Model – Simon Brown. https://c4model.com
- [6] Node.js Documentation. https://nodejs.org/en/docs
- [7] React Documentation. https://react.dev
- [8] Cloudinary API Reference. https://cloudinary.com/documentation
- [9] Google Cloud Vision API. https://cloud.google.com/vision/docs

### 1.4 Definiciones y acrónimos

| Término  | Definición                                                                                                                              |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------|
| ADR      | Architecture Decision Record. Registro formal de una decisión de diseño con su contexto, alternativas y justificación.                 |
| API REST | Interfaz de programación basada en HTTP con recursos identificados por URLs y operaciones CRUD sobre ellos.                            |
| CDN      | Content Delivery Network. Red de distribución de contenido que sirve archivos desde servidores geográficamente cercanos al usuario final. |
| C4 Model | Marco de descripción de arquitectura en cuatro niveles de abstracción: Context, Container, Component, Code.                            |
| JWT      | JSON Web Token. Estándar para transmitir información de autenticación entre cliente y servidor de forma segura.                        |
| ORM      | Object-Relational Mapper. Capa de abstracción entre el código de aplicación y la base de datos relacional.                             |
| PWA      | Progressive Web App. Aplicación web que utiliza capacidades modernas del navegador (manifest.json + Service Worker) para ofrecer instalación en pantalla de inicio, carga optimizada y funcionamiento básico sin conexión, sin requerir tiendas de aplicaciones. |
| dHash    | Difference Hash. Algoritmo de perceptual hashing para detección de imágenes duplicadas o sustancialmente similares.                    |

---

## SECCIÓN 2. REPRESENTACIÓN ARQUITECTÓNICA

### 2.1 Estilo arquitectónico

Mural Maz Lince adopta una arquitectura cliente-servidor en tres capas con separación clara de responsabilidades:

**Capa de presentación:** React SPA (Single Page Application) servida como archivos estáticos e instalable como PWA. Responsable exclusivamente del renderizado y la interacción con el usuario.

**Capa de aplicación:** API REST construida con Node.js y Express. Contiene toda la lógica de negocio, validaciones, orquestación de servicios externos y reglas de seguridad.

**Capa de datos:** PostgreSQL gestionado en Railway.app. Almacena todos los datos persistentes del sistema excepto los archivos de imagen, que residen en Cloudinary.

Esta separación garantiza que el frontend sea intercambiable sin modificar el backend, y que el backend sea portable entre proveedores de hosting sin cambiar el código de la aplicación, gracias a la contenedorización con Docker.

### 2.2 Principios arquitectónicos guía

**PRINC-01 | Separación de preocupaciones (Separation of Concerns)**
El frontend no contiene lógica de negocio. El backend no genera HTML. La base de datos no ejecuta lógica de aplicación.

**PRINC-02 | Seguridad por diseño (Security by Design)**
El número de WhatsApp nunca viaja al cliente. Las contraseñas se almacenan siempre hasheadas. Las claves de servicios externos viven exclusivamente en variables de entorno del servidor.

**PRINC-03 | Tolerancia a fallos de servicios externos**
Cada integración externa (Cloudinary, Google Cloud Vision) tiene un comportamiento de fallback documentado ante indisponibilidad o agotamiento de cuota.

**PRINC-04 | Portabilidad por contenedorización**
Todo el entorno de ejecución está definido en Dockerfile y docker-compose, garantizando reproducibilidad entre máquinas y facilidad de migración entre proveedores de hosting.

**PRINC-05 | Moderación como filtro, no como sancionador**
Ningún algoritmo automatizado puede rechazar contenido, suspender cuentas ni ejecutar acciones disciplinarias de forma autónoma. La IA actúa como clasificador de primer nivel; la decisión final pertenece siempre al administrador humano (con la excepción acotada del shadowban por umbral alto de reportes documentada en RF-38 del SRS v1.4 y ADR-05 de este documento).

---

## SECCIÓN 3. VISTA DE CONTEXTO DEL SISTEMA (C4 – LEVEL 1)

### 3.1 Descripción

El diagrama de contexto muestra el sistema Mural Maz Lince como una caja negra en relación con sus usuarios y sistemas externos. No detalla la tecnología interna; su objetivo es establecer los límites del sistema y sus dependencias.

### 3.2 Actores externos

- **Visitante:** Usuario sin cuenta. Navega el feed vía navegador web o PWA instalada.
- **Usuario registrado:** Estudiante con matrícula. Filtra, valora y da like en el feed.
- **Emprendedor:** Estudiante con matrícula + contraseña + WhatsApp + display_name. Publica y gestiona proyectos y anuncios.
- **Administrador:** Usuario con rol de moderación. Gestiona la cola de revisión de contenido.
- **Cloudinary:** Servicio externo de almacenamiento y CDN de imágenes.
- **Google Cloud Vision:** Servicio externo de análisis de imágenes por IA.
- **Railway.app:** Plataforma de hosting que aloja el backend y la BD.

### 3.3 Diagrama C4 Level 1 – Context Diagram

graph TD
  %% Definición de Estilos
  classDef internal fill:#1168BD,stroke:#0b4d8c,color:#fff,stroke-width:2px;
  classDef external fill:#999999,stroke:#666,color:#fff,stroke-width:2px;
  classDef person fill:#08427b,stroke:#052e56,color:#fff,stroke-width:2px;

  %% Elementos: Personas
  V["fa:fa-user Visitante<br/>(Persona)"]:::person
  UR["fa:fa-user Usuario Registrado<br/>(Persona)"]:::person
  E["fa:fa-user Emprendedor<br/>(Persona)"]:::person
  A["fa:fa-user Administrador<br/>(Persona)"]:::person

  %% Elemento: Sistema Central
  Mural[("<b>Mural Maz Lince</b><br/>Plataforma web PWA de anuncios estudiantiles.<br/>Node.js + React + PostgreSQL")]:::internal

  %% Elementos: Sistemas Externos
  Cloud["<b>Cloudinary</b><br/>Almacenamiento CDN de imágenes"]:::external
  GCV["<b>Google Cloud Vision API</b><br/>Análisis de contenido inapropiado"]:::external
  Railway["<b>Railway.app</b><br/>Plataforma de hosting y base de datos"]:::external

  %% Relaciones de Usuarios
  V -- "Navega el feed<br/>(HTTPS / Browser / PWA)" --> Mural
  UR -- "Filtra, valora y da like<br/>(HTTPS)" --> Mural
  E -- "Publica y gestiona anuncios<br/>(HTTPS)" --> Mural
  A -- "Modera contenido<br/>(HTTPS)" --> Mural

  %% Relaciones de Sistemas
  Mural -- "Upload y eliminación de imágenes<br/>(HTTPS / REST API)" --> Cloud
  Mural -- "Safe Search Detection<br/>(HTTPS / REST API)" --> GCV
  Mural -. "Desplegado en:<br/>Backend y PostgreSQL" .-> Railway

  %% Notas de diseño
  linkStyle default stroke:#333,stroke-width:1px;

## SECCIÓN 4. VISTA DE CONTENEDORES (C4 – LEVEL 2)

### 4.1 Descripción

El diagrama de contenedores descompone el sistema en sus unidades desplegables independientes: el frontend, el backend y la base de datos. Cada contenedor tiene su propia tecnología, responsabilidades y límites de comunicación.

### 4.2 Contenedores del sistema

**CONT-01 | Frontend (React SPA / PWA)**

| Campo       | Detalle                                                                                                     |
|-------------|-------------------------------------------------------------------------------------------------------------|
| Tecnología  | React 18.2, Vite 7, React Router 6, Bootstrap 5.3, `react-icons`, `browser-image-compression`, `react-easy-crop`, `public/manifest.json` + `public/sw.js` (PWA v4) |
| Despliegue  | Build estático (`dist/`) en Vite; desarrollo local en puerto `5173`                                         |
| Descripción | Interfaz mobile-first en tema oscuro OLED (`#000000` / `#D92528`) instalable como PWA. Implementa el feed (carga hasta 500 anuncios activos con mezcla Fisher-Yates en cliente y filtro por 14 categorías normalizadas para autenticados), vistas públicas de proyecto/emprendedor (`/proyecto/:id`, `/emprendedor/:id`), flujos de registro multicontacto y login proactivo (`POST /auth/login/check`), panel del emprendedor de 4 pestañas (proyectos, anuncios, notificaciones, perfil con recorte circular) y panel de administración de 3 pestañas. Comprime (≤ 500 KB / 1200 px) y recorta imágenes en navegador antes del upload (RF-31). Se comunica vía `fetch` (`credentials: 'include'`) usando cookies HttpOnly (ADR-04). |

**CONT-02 | Backend API (Node.js + Express)**

| Campo       | Detalle                                                                                                     |
|-------------|-------------------------------------------------------------------------------------------------------------|
| Tecnología  | Node.js 18+ (CommonJS), Express 4.18, `pg` (SQL parametrizado sin ORM), `jsonwebtoken`, `bcrypt`, `sharp` (dHash), `bad-words`, `@google-cloud/vision`, `cloudinary`, `multer`, `helmet`, `express-rate-limit`, `cookie-parser`, `node-cron` |
| Despliegue  | Contenedor Docker multi-stage (`node:18-alpine`, puerto `3000`); objetivo de producción Railway.app         |
| Descripción | Núcleo REST documentado en `docs/swagger.json` (`/api-docs`). Implementa autenticación con cookies HttpOnly, validación de matrícula (`/^2\d{7}$/`), moderación híbrida (activa mediante `ENABLE_AUTO_MODERATION=true` o `NODE_ENV=test`), gestión de proyectos/anuncios, métricas con umbral de intención, notificaciones internas y jobs horarios (`node-cron`) de expiración y shadowban. |

**CONT-03 | Base de datos (PostgreSQL)**

| Campo       | Detalle                                                                                                     |
|-------------|-------------------------------------------------------------------------------------------------------------|
| Tecnología  | PostgreSQL 15 (`postgres:15-alpine` en Docker Compose local puerto `5433:5432`; gestionado en Railway.app)  |
| Despliegue  | Contenedor local `mural_maz_lince_db` / servicio PostgreSQL en producción                                   |
| Descripción | Persiste las 12 tablas y 8 ENUMs del sistema (`backend/src/db/schema.sql`). Las imágenes no se guardan como binarios en BD; se almacena su URL pública y su identificador de Cloudinary (`cloudinary_url`/`cloudinary_id`, `profile_photo_url`/`profile_photo_id`, `logo_url`/`logo_id`). |

### 4.3 Diagrama C4 Level 2 – Container Diagram

```mermaid
graph TB
  %% Definición de Estilos
  classDef external fill:#999999,stroke:#666,color:#fff,stroke-width:2px;
  classDef container_light fill:#4b9cd3,stroke:#1168BD,color:#fff,stroke-width:2px;
  classDef container_mid fill:#1168BD,stroke:#0b4d8c,color:#fff,stroke-width:2px;
  classDef container_dark fill:#0b4d8c,stroke:#052e56,color:#fff,stroke-width:2px;
  classDef person fill:#08427b,stroke:#052e56,color:#fff,stroke-width:2px;

  %% Actores (Fuera del límite)
  Users["Usuarios (Visitante, Registrado, Emprendedor, Administrador)"]:::person

  %% Límite del Sistema
  subgraph MuralMazLince ["Mural Maz Lince (Límite del Sistema)"]
    FE["Frontend (React 18 + Vite 7 + PWA)"]:::container_light
    BE["Backend API (Node.js + Express 4)"]:::container_mid
    DB[("Base de Datos (PostgreSQL 15)")]:::container_dark
  end

  %% Sistemas Externos
  Cloudinary["Cloudinary (CDN de imágenes)"]:::external
  Vision["Google Cloud Vision API (Safe Search)"]:::external
  WhatsApp["WhatsApp / wa.me (Enlace de contacto)"]:::external

  %% Relaciones
  Users -- "HTTPS / Browser / PWA" --> FE
  FE -- "JSON / REST API (Cookie HttpOnly)" --> BE
  BE -- "SQL / TCP (5432)" --> DB
  BE -- "Upload / Delete imágenes" --> Cloudinary
  BE -- "Safe Search Detection" --> Vision
  BE -- "Genera URL wa.me dinámicamente" --> WhatsApp
```

## SECCIÓN 5. VISTA DE COMPONENTES DEL BACKEND (C4 – LEVEL 3)

### 5.1 Descripción

El diagrama de componentes descompone el contenedor Backend API en sus módulos internos con responsabilidades bien delimitadas. Esta vista es la más relevante para el desarrollo, ya que cada componente mapea directamente a uno o más módulos del código fuente.

### 5.2 Componentes del Backend API

**COMP-01 | Router / API Gateway**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Punto de entrada de todas las solicitudes HTTP. Aplica middlewares globales (CORS, rate limiting, logging) y enruta cada solicitud al controlador correspondiente. |
| Tecnología       | Express Router                                                                                              |

---

**COMP-02 | Auth Controller**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Gestiona el registro y login de todos los roles. Implementa el algoritmo checksum de matrícula. Genera y valida JWT en cookies HttpOnly. Implementa el flujo de reclamo de matrícula (RF-35). En el registro del emprendedor, ejecuta una transacción atómica que crea simultáneamente un registro en `users` y uno en `entrepreneur_profiles` con el `display_name` obligatorio y los campos `bio_short` y `profile_photo_url/id` inicializados a NULL. Si cualquiera de las dos inserciones falla, ambas se revierten. |
| Tecnología       | Express, JWT, bcrypt, cookie-parser, PostgreSQL transactions                                               |
| SRS              | RF-01 a RF-07, RF-34, RF-38, RF-39                                                                        |

---

**COMP-03 | Feed Controller**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Sirve el feed paginado con paginación por cursor (20 anuncios por bloque). Aplica filtros por categoría. Implementa la lógica de conteo de visualizaciones. |
| Tecnología       | Express, PostgreSQL (queries con cursor)                                                                   |
| SRS              | RF-08, RF-09, RF-10, RNF-01, RNF-02                                                                       |

---

**COMP-04 | Announcement Controller**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | CRUD de proyectos y anuncios. Orquesta el flujo completo de publicación: validación server-side de imagen (segunda línea, RF-31), pipeline de moderación (COMP-07), upload a Cloudinary (COMP-08) y persistencia en BD. Gestiona vigencias y elimina anuncios expirados junto con sus imágenes en Cloudinary. |
| Tecnología       | Express, Multer, node-cron                                                                                 |
| SRS              | RF-15 a RF-23, RF-31, RF-32, RF-33                                                                        |

---

**COMP-05 | Interaction Controller**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Gestiona likes y valoraciones. Implementa el registro de timestamps para el umbral de intención (5,000 ms). Calcula y actualiza los agregados de métricas excluyendo interacciones marcadas como accidentales. |
| Tecnología       | Express, PostgreSQL                                                                                        |
| SRS              | RF-12, RF-13, RF-14, RN-08                                                                                |

---

**COMP-06 | Report Controller**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Recibe y registra reportes de usuarios. Evalúa el contador de reportes por anuncio. Genera alertas de urgencia al panel del administrador (RF-37). Ejecuta el shadowban automático cuando se cumplen las condiciones de RF-38 (5 reportes + 12 horas de inacción). Programa la restauración automática a las 48 horas máximas (RN-13). |
| Tecnología       | Express, node-cron, PostgreSQL                                                                             |
| SRS              | RF-35, RF-36, RF-37, RN-13                                                                                |

---

**COMP-07 | Moderation Service**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Orquesta los tres filtros de moderación en paralelo: (1) Análisis de imagen con Google Cloud Vision API, (2) Filtro de lenguaje ofensivo con bad-words, (3) Detección de duplicados con dHash (distancia Hamming ≤ 10). Devuelve un resultado consolidado al Announcement Controller. Gestiona el fallback cuando la cuota de Vision API se agota. |
| Tecnología       | Google Cloud Vision client library, bad-words npm, sharp                                                  |
| SRS              | RF-26, RF-27, RF-28, RN-07, RN-11                                                                        |

---

**COMP-08 | Storage Service (Cloudinary)**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Abstrae todas las operaciones con Cloudinary: upload de imagen tras moderación aprobada (o provisional en pending_review), eliminación de imagen al expirar o rechazar un anuncio. Almacena la URL pública y el ID de Cloudinary. Nunca almacena archivos en el filesystem local. |
| Tecnología       | Cloudinary Node.js SDK                                                                                     |
| SRS              | RF-32, RF-33                                                                                              |

---

**COMP-09 | WhatsApp Link Service**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Genera dinámicamente la URL wa.me para cada emprendedor. Es el único componente con acceso al campo `whatsapp_number` de la base de datos. Nunca expone el número en ninguna respuesta JSON; entrega exclusivamente la URL completa. |
| Tecnología       | Node.js (función pura de construcción de URL)                                                              |
| SRS              | RF-11, RN-09                                                                                              |

---

**COMP-10 | Notification Service (`services/notificationService.js`, `controllers/notificationController.js`)**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Crea y gestiona notificaciones internas del emprendedor: cambios de estado de anuncio, alertas de vencimiento próximo, acciones del administrador y shadowban temporal. |
| Tecnología       | PostgreSQL                                                                                                 |
| SRS              | RF-25, RF-37                                                                                              |

---

**COMP-11 | Admin & Project Controllers (`controllers/adminController.js`, `controllers/projectController.js`)**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | `adminController.js` gestiona la cola de moderación, listado y retiro de anuncios publicados (`GET /admin/announcements`, `POST /admin/announcements/:id/remove`), aprobación/rechazo, suspensión de cuentas y resolución de `claim_tickets`. `projectController.js` gestiona CRUD de proyectos, vista pública (`GET /projects/public/:id`), logos en Cloudinary y límite de 5 proyectos activos. |
| Tecnología       | Node.js, Express, PostgreSQL, Cloudinary                                                                    |
| SRS              | RF-15–18, RF-29, RF-30, RF-34                                                                              |

---

**COMP-12 | Metrics Service (`services/metricsService.js`)**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Calcula y sirve las métricas de impacto del emprendedor (`total_likes`, `avg_rating`, `total_announcements` globales y por proyecto). Aplica el filtro del umbral de intención excluyendo interacciones con `is_accidental = TRUE` o revertidas. |
| Tecnología       | PostgreSQL (queries de agregación)                                                                         |
| SRS              | RF-24, RF-14, RN-08                                                                                       |

### 5.3 Diagrama C4 Level 3 – Component Diagram

```mermaid
graph LR
  classDef gateway fill:#4b9cd3,stroke:#1168BD,color:#fff,stroke-width:2px;
  classDef controller fill:#1168BD,stroke:#0b4d8c,color:#fff,stroke-width:2px;
  classDef service fill:#0b4d8c,stroke:#052e56,color:#fff,stroke-width:2px;
  classDef external fill:#999999,stroke:#666,color:#fff,stroke-width:2px;

  subgraph Backend ["Backend API (Node.js + Express)"]
    Router["Router / Middleware (COMP-01)"]:::gateway

    subgraph Controladores ["Capa de Controladores"]
      C2["Auth Controller (COMP-02)"]:::controller
      C3["Feed Controller (COMP-03)"]:::controller
      C4["Announcement Controller (COMP-04)"]:::controller
      C5["Interaction Controller (COMP-05)"]:::controller
      C6["Report Controller (COMP-06)"]:::controller
      C11["Admin & Project Controllers (COMP-11)"]:::controller
    end

    subgraph Servicios ["Servicios Internos"]
      C7["Moderation Service (COMP-07)"]:::service
      C8["Storage Service (COMP-08)"]:::service
      C9["WhatsApp Link Service (COMP-09)"]:::service
      C10["Notification Service (COMP-10)"]:::service
      C12["Metrics Service (COMP-12)"]:::service
    end
  end

  DB[("PostgreSQL 15")]:::external
  GCV["Google Cloud Vision"]:::external
  CLD["Cloudinary"]:::external

  Router --> C2
  Router --> C3
  Router --> C4
  Router --> C5
  Router --> C6
  Router --> C10
  Router --> C11

  C4 -- "Orquesta pipeline" --> C7
  C4 -- "Upload / Delete" --> C8
  C11 -- "Delete / Logo" --> C8
  C11 -- "Métricas" --> C12
  C11 -- "Notifica decisión" --> C10
  C7 -- "Safe Search" --> GCV
  C8 -- "Media" --> CLD
  C3 -- "Genera URL wa.me" --> C9
  C2 -- "Genera URL wa.me" --> C9
  C6 -- "Encola alerta" --> C10
  C2 --> DB
  C3 --> DB
  C4 --> DB
  C5 --> DB
  C11 --> DB
  C12 --> DB
```

## SECCIÓN 6. MODELO ENTIDAD-RELACIÓN (BASE DE DATOS)

### 6.1 Descripción general

La base de datos PostgreSQL almacena todos los datos persistentes del sistema. El diseño sigue el modelo relacional normalizado con claves foráneas explícitas. Los límites N (proyectos por emprendedor) y M (anuncios por proyecto) se fijan en N=5 y M=3 respectivamente, valores conservadores compatibles con la capa gratuita de Railway y razonables para el contexto universitario.

**Nota sobre la separación de identidad y autenticación:** la tabla `users` almacena exclusivamente datos de autenticación y seguridad (matrícula, contraseña hasheada, WhatsApp, rol, estado de suspensión). La identidad pública del emprendedor reside en la tabla `entrepreneur_profiles`, que tiene una relación de uno a uno con `users`. Esta separación sigue el principio de responsabilidad única y permite que en una versión futura se extienda el perfil público (biografía, foto, redes sociales) sin modificar la tabla de autenticación. En v1.0 se implementa únicamente el campo `display_name` como obligatorio. Los campos `bio_short` y `profile_photo` se reservan en el esquema con valor NULL para facilitar la migración a v2.0 sin cambios estructurales en la base de datos. La justificación completa de esta decisión se documenta en ADR-09 de la Sección 8.

**Nota crítica sobre el almacenamiento de imágenes:** la tabla `announcements` almacena dos campos de Cloudinary, no uno. El campo `cloudinary_url` contiene la URL pública para servir la imagen en el feed, y el campo `cloudinary_id` contiene el identificador público interno de Cloudinary (por ejemplo: `"mural_lince/abc123"`). Este segundo campo es indispensable: sin él, al eliminar un anuncio el sistema solo podría "olvidar" la URL pero la imagen quedaría huérfana acumulando espacio en la cuenta gratuita de Cloudinary indefinidamente. Toda operación de eliminación de anuncio (RF-33) debe invocar la API de Cloudinary usando `cloudinary_id`, no `cloudinary_url`. COMP-08 (Storage Service) es el único componente responsable de esta operación.

### 6.2 Entidades y atributos

```sql
-- ─────────────────────────────────────────────────────────────
-- TABLA: users
-- Datos de autenticación y seguridad. No contiene identidad pública.
-- ─────────────────────────────────────────────────────────────
id               SERIAL PRIMARY KEY
matricula        VARCHAR(8)   NOT NULL UNIQUE
role             ENUM('visitor_registered','entrepreneur','admin') NOT NULL
password_hash    VARCHAR(255)            -- NULL para ROL-02 (sin contraseña)
whatsapp_number  VARCHAR(20)             -- NULL para ROL-02; NUNCA expuesto en API
privacy_accepted BOOLEAN DEFAULT FALSE   -- Aceptación LFPDPPP (RNF-17)
is_suspended     BOOLEAN DEFAULT FALSE
created_at       TIMESTAMP DEFAULT NOW()

-- ─────────────────────────────────────────────────────────────
-- TABLA: entrepreneur_profiles
-- Identidad pública y canales multicontacto del emprendedor (1:1 con users, ADR-09).
-- ─────────────────────────────────────────────────────────────
id                 SERIAL PRIMARY KEY
user_id            INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
display_name       VARCHAR(80)  NOT NULL   -- Nombre visible en feed y perfiles
bio_short          VARCHAR(200)            -- Biografía breve (implementada)
profile_photo_url  VARCHAR(500)            -- URL pública de avatar (Cloudinary)
profile_photo_id   VARCHAR(200)            -- ID en Cloudinary para reemplazo/borrado
instagram_handle   VARCHAR(60)             -- Canal opcional de contacto Instagram
classroom_location VARCHAR(100)            -- Ubicación física / salón opcional
created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP

-- ─────────────────────────────────────────────────────────────
-- TABLA: projects
-- ─────────────────────────────────────────────────────────────
id               SERIAL PRIMARY KEY
user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
name             VARCHAR(120) NOT NULL
description      TEXT
category_id      INTEGER REFERENCES categories(id)
logo_url         VARCHAR(500)              -- URL pública del logo del proyecto (Cloudinary)
logo_id          VARCHAR(200)              -- ID público del logo en Cloudinary
status           project_status_enum DEFAULT 'active' -- ('active','suspended')
created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- Restricción: máximo 5 proyectos activos por user_id (validada en backend)

-- ─────────────────────────────────────────────────────────────
-- TABLA: announcements
-- ─────────────────────────────────────────────────────────────
id               SERIAL PRIMARY KEY
project_id       INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE
title            VARCHAR(120) NOT NULL
description      TEXT
category_id      INTEGER REFERENCES categories(id)
custom_category  VARCHAR(80)             -- Solo si category_id = CAT-00 (Otro)
cloudinary_url   VARCHAR(500) NOT NULL   -- URL pública de Cloudinary
cloudinary_id    VARCHAR(200) NOT NULL   -- ID público para eliminación en Cloudinary
status           announcement_status_enum DEFAULT 'active'
                 -- ('active','pending_review','rejected','shadowban','expired')
expires_at       TIMESTAMP NOT NULL
created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- Restricción: máximo 3 anuncios activos/en revisión por project_id (validada en backend)

-- ─────────────────────────────────────────────────────────────
-- TABLA: image_hashes
-- Entidad satélite de announcements para detección de duplicados.
-- ─────────────────────────────────────────────────────────────
id               SERIAL PRIMARY KEY
announcement_id  INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE
dhash            VARCHAR(64) NOT NULL    -- Hash perceptual de 64 bits (hex)
created_at       TIMESTAMP DEFAULT NOW()

-- ─────────────────────────────────────────────────────────────
-- TABLA: categories
-- ─────────────────────────────────────────────────────────────
id               SERIAL PRIMARY KEY
code             VARCHAR(10) NOT NULL UNIQUE  -- CAT-01 … CAT-19, CAT-00
name             VARCHAR(80) NOT NULL
group_name       VARCHAR(60) NOT NULL         -- 'Productos físicos', 'Servicios', etc.
is_active        BOOLEAN DEFAULT TRUE

-- ─────────────────────────────────────────────────────────────
-- TABLA: likes
-- ─────────────────────────────────────────────────────────────
id               SERIAL PRIMARY KEY
user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
announcement_id  INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE
created_at       TIMESTAMP DEFAULT NOW()
reverted_at      TIMESTAMP                    -- NULL si el like sigue activo
is_accidental    BOOLEAN DEFAULT FALSE        -- TRUE si (reverted_at - created_at) < 5000ms
UNIQUE (user_id, announcement_id)

-- ─────────────────────────────────────────────────────────────
-- TABLA: ratings
-- ─────────────────────────────────────────────────────────────
id               SERIAL PRIMARY KEY
user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
announcement_id  INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE
stars            SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 3)
created_at       TIMESTAMP DEFAULT NOW()
modified_at      TIMESTAMP
reverted_at      TIMESTAMP
is_accidental    BOOLEAN DEFAULT FALSE        -- TRUE si reversión < 5000ms
UNIQUE (user_id, announcement_id)

-- ─────────────────────────────────────────────────────────────
-- TABLA: reports
-- ─────────────────────────────────────────────────────────────
id               SERIAL PRIMARY KEY
reporter_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
announcement_id  INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE
reason           ENUM('offensive','spam','false_info','other') NOT NULL
created_at       TIMESTAMP DEFAULT NOW()
UNIQUE (reporter_id, announcement_id)        -- Un reporte por usuario por anuncio

-- ─────────────────────────────────────────────────────────────
-- TABLA: moderation_queue
-- Hub central de moderación: registra cada intervención automática o manual.
-- ─────────────────────────────────────────────────────────────
id               SERIAL PRIMARY KEY
announcement_id  INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE
trigger_type     ENUM('vision_api','bad_words','phash','report_threshold') NOT NULL
trigger_detail   TEXT                         -- JSON con detalle del trigger
urgency_alert_at TIMESTAMP                    -- Momento en que se generó RF-37
shadowban_at     TIMESTAMP                    -- Momento en que se ejecutó RF-38
admin_action     ENUM('approved','rejected','rejected_suspended')
                                              -- NULL mientras esté pendiente
admin_id         INTEGER REFERENCES users(id)
resolved_at      TIMESTAMP
created_at       TIMESTAMP DEFAULT NOW()

-- ─────────────────────────────────────────────────────────────
-- TABLA: notifications
-- ─────────────────────────────────────────────────────────────
id               SERIAL PRIMARY KEY
user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
type             ENUM('approved','rejected','pending','expiring_soon','shadowban') NOT NULL
message          TEXT NOT NULL
is_read          BOOLEAN DEFAULT FALSE
created_at       TIMESTAMP DEFAULT NOW()

-- ─────────────────────────────────────────────────────────────
-- TABLA: claim_tickets
-- ─────────────────────────────────────────────────────────────
id                 SERIAL PRIMARY KEY
disputed_matricula VARCHAR(8)  NOT NULL
claimant_whatsapp  VARCHAR(20) NOT NULL
status             ENUM('pending','resolved') DEFAULT 'pending'
admin_id           INTEGER REFERENCES users(id)
created_at         TIMESTAMP DEFAULT NOW()
resolved_at        TIMESTAMP
```

### 6.3 Diagrama Entidad Relación

```mermaid
erDiagram
    users {
        int id PK
        string matricula UK
        string whatsapp_number
        string role
        boolean is_suspended
    }

    entrepreneur_profiles {
        int id PK
        int user_id FK
        string display_name
        string bio_short
        string profile_photo_url
        string instagram_handle
        string classroom_location
    }

    projects {
        int id PK
        int user_id FK
        int category_id FK
        string name
        string logo_url
        string status
    }

    announcements {
        int id PK
        int project_id FK
        int category_id FK
        string cloudinary_url
        string cloudinary_id
        string status
        timestamp expires_at
    }

    image_hashes {
        int id PK
        int announcement_id FK
        string dhash
    }

    moderation_queue {
        int id PK
        int announcement_id FK
        int admin_id FK
        string trigger_type
        string admin_action
        timestamp created_at
    }

    categories {
        int id PK
        string code UK
        string name
        string group_name
    }

    likes {
        int id PK
        int user_id FK
        int announcement_id FK
        boolean is_accidental
    }

    ratings {
        int id PK
        int user_id FK
        int announcement_id FK
        int stars
        boolean is_accidental
    }

    reports {
        int id PK
        int reporter_id FK
        int announcement_id FK
        string reason
    }

    notifications {
        int id PK
        int user_id FK
        string type
        boolean is_read
    }

    claim_tickets {
        int id PK
        string disputed_matricula
        string claimant_whatsapp
        string status
        int admin_id FK
    }

    users ||--o| entrepreneur_profiles : "1:1 (ADR-09)"
    users ||--o{ projects : "gestiona"
    users ||--o{ likes : "emite"
    users ||--o{ ratings : "emite"
    users ||--o{ reports : "emite"
    users ||--o{ notifications : "recibe"
    users ||--o{ claim_tickets : "resuelve (admin)"
    users ||--o{ moderation_queue : "resuelve (admin)"

    projects ||--o{ announcements : "contiene"
    categories ||--o{ projects : "clasifica"
    categories ||--o{ announcements : "clasifica"

    announcements ||--o| image_hashes : "satelite"
    announcements ||--o{ likes : "recibe"
    announcements ||--o{ ratings : "recibe"
    announcements ||--o{ reports : "recibe"
    announcements ||--o{ moderation_queue : "entrada"
```

## SECCIÓN 7. DIAGRAMAS DE SECUENCIA – FLUJOS CRÍTICOS

Los diagramas de secuencia ilustran la interacción entre componentes para los tres flujos más complejos del sistema. Se presentan en pseudonotación para renderizado en draw.io, Figma o PlantUML.

### 7.1 Flujo de publicación de anuncio con moderación completa

sequenceDiagram
    autonumber
    participant FE as Frontend (PWA)
    participant BE as Backend API
    participant MS as Moderation Service
    participant GCV as Google Cloud Vision
    participant BW as bad-words (Lib)
    participant DH as dHash Module
    participant CLD as Cloudinary
    participant DB as PostgreSQL

    FE->>BE: POST /announcements {imagen, texto, ...}
    Note over FE: Imagen ya comprimida ≤500KB

    BE->>BE: Valida tamaño/res (RF-31)

    alt Si falla validación técnica
        BE-->>FE: HTTP 413 Payload Too Large
    else Validación técnica exitosa
        BE->>MS: moderationPipeline(imagen, texto)

        par Procesamiento en Paralelo
            MS->>GCV: analyzeImage(imagen)
            Note right of GCV: [Timeout: 8s]
        and
            MS->>BW: filterText(título+desc+cat)
        and
            MS->>DH: computeHash(imagen)
            DH->>DB: SELECT dhash FROM image_hashes
            DB-->>DH: Lista de hashes
            DH-->>MS: {similar: bool, matchId}
        end

        alt RAMA A: Vision responde a tiempo
            GCV-->>MS: {flagged, reason}
        else RAMA B: Timeout o Error de red
            Note over MS: Captura error tras 8s
            MS->>MS: visionStatus: 'failed'
        end

        BW-->>MS: {flagged, terms}
        MS-->>BE: {approved: bool, triggers, visionStatus}

        Note over BE: Si approved=false o visionStatus='failed' <br/>-> va a revisión humana

        BE->>CLD: uploadImage(imagen)
        CLD-->>BE: {url, public_id}

        alt SI approved == true (Flujo Directo)
            BE->>DB: INSERT announcement {status: 'active'}
            BE->>DB: INSERT image_hashes {dhash}
            BE->>DB: INSERT notifications {type: 'approved'}
            BE-->>FE: HTTP 201 {status: 'active'}
        else SI approved == false / timeout (Revisión)
            BE->>DB: INSERT announcement {status: 'pending_review'}
            BE->>DB: INSERT image_hashes {dhash}
            BE->>DB: INSERT moderation_queue {triggers}
            BE->>DB: INSERT notifications {type: 'pending'}
            BE-->>FE: HTTP 202 {status: 'pending_review'}
        end
    end

### 7.2 Flujo de autenticación del emprendedor

sequenceDiagram
    autonumber
    participant FE as Frontend (PWA)
    participant BE as Backend API
    participant DB as PostgreSQL

    FE->>BE: POST /auth/login {matricula, password}

    BE->>BE: checksum(matricula)

    alt Formato Inválido
        BE-->>FE: HTTP 400 Bad Request
    else Formato Válido
        BE->>DB: SELECT * FROM users WHERE matricula = $1 AND role = 'entrepreneur'
        DB-->>BE: {user_row | null}

        alt Usuario no encontrado o Credenciales erróneas
            BE->>BE: bcrypt.compare() -> false
            BE-->>FE: HTTP 401 Unauthorized
        else Usuario suspendido
            Note over BE: user.is_suspended == true
            BE-->>FE: HTTP 403 Forbidden
        else Credenciales Correctas
            BE->>BE: jwt.sign({user_id, role, matricula})
            Note right of BE: Payload sin datos sensibles (RN-09)

            Note over BE,FE: Cookie: HttpOnly, Secure, SameSite=Strict
            BE-->>FE: HTTP 200 OK {role: 'entrepreneur'}
        end
    end

    Note over FE: El navegador gestiona la cookie automáticamente.<br/>JS no tiene acceso al token.<br/>Redirección a Panel.

> **Nota de consistencia con ADR-04:** el paso 8 refleja la decisión de cookies HttpOnly adoptada en v1.1. El token no se almacena en memoria ni en localStorage desde el cliente; el navegador lo gestiona de forma opaca, lo que elimina el vector XSS sobre el JWT.

### 7.3 Flujo de reporte y shadowban automático

sequenceDiagram
    autonumber
    participant FE as Frontend
    participant BE as Backend API
    participant DB as PostgreSQL
    participant CRN as node-cron (Scheduler)

    %% Registro de Reporte
    FE->>BE: POST /announcements/:id/report {reason}
    BE->>DB: SELECT COUNT(*) FROM reports (Verifica duplicado)
    DB-->>BE: count

    alt Ya reportado
        BE-->>FE: HTTP 409 Conflict
    else Nuevo reporte
        BE->>DB: INSERT reports {reason, reporter_id, announcement_id}
        BE->>DB: SELECT COUNT(DISTINCT reporter_id) (Total únicos)
        DB-->>BE: total_reports

        opt total_reports >= 3 AND No existe alerta previa
            BE->>DB: INSERT moderation_queue {trigger: 'report_threshold'}
        end

        BE-->>FE: HTTP 200 "Reporte registrado"
    end

    %% Proceso Asíncrono: Ejecución de Shadowban
    Note over CRN, DB: Cada 1 hora: Evaluación de Shadowban
    loop Evaluación Cron
        CRN->>DB: SELECT * FROM moderation_queue (Pendientes > 12h)
        DB-->>CRN: [Anuncios elegibles]

        opt Si re-verifica >= 5 reportes
            CRN->>DB: UPDATE announcements SET status = 'shadowban'
            CRN->>DB: UPDATE moderation_queue SET shadowban_at = NOW()
            CRN->>DB: INSERT notifications {type: 'shadowban'}
        end
    end

    %% Proceso Asíncrono: Restauración
    Note over CRN, DB: Evaluación de restauración automática (48h)
    loop Restauración Cron
        CRN->>DB: SELECT * FROM announcements (Status shadowban + 48h)
        DB-->>CRN: [Anuncios a restaurar]

        CRN->>DB: UPDATE announcements SET status = 'active'
        CRN->>DB: INSERT notifications {type: 'approved'}
    end

## SECCIÓN 8. DECISIONES DE ARQUITECTURA (ADRs)

Cada ADR documenta una decisión de diseño significativa con su contexto, las alternativas consideradas y la justificación de la elección.

### Resumen de ADRs

| ADR-ID | Título                                               | Estado                    |
|--------|------------------------------------------------------|---------------------------|
| ADR-01 | Cloudinary como almacenamiento de imágenes           | Implementada              |
| ADR-02 | dHash para detección de imágenes duplicadas          | Implementada              |
| ADR-03 | Paginación por cursor en el feed                     | Implementada (API)        |
| ADR-04 | Autenticación con cookies HttpOnly                   | Implementada (ajustada)   |
| ADR-05 | Shadowban como excepción acotada a RN-11             | Implementada              |
| ADR-06 | PostgreSQL sobre MySQL                               | Implementada              |
| ADR-07 | Progressive Web App con Service Worker               | Implementada (v4)         |
| ADR-08 | Caché en memoria (`node-cache`)                      | No implementada / Diferida|
| ADR-09 | Separación de identidad pública y autenticación      | Implementada (extendida)  |

---

### ADR-01 | Cloudinary como servicio de almacenamiento de imágenes

| Campo   | Detalle                        |
|---------|--------------------------------|
| Estado  | Aceptada                       |
| Fecha   | Marzo 2026                     |
| SRS     | RF-32, RF-33, RNF-11           |

**Contexto:** Railway.app utiliza un sistema de archivos efímero: cualquier archivo guardado localmente en el servidor se pierde al reiniciar el contenedor, lo cual ocurre en cada despliegue. El proyecto requiere persistencia garantizada de imágenes.

**Alternativas consideradas:**

1. **Almacenamiento local en filesystem de Railway** → DESCARTADA. Efímero por diseño; las imágenes se perderían en cada despliegue.
2. **Supabase Storage** → DESCARTADA. Requiere procesamiento de imagen server-side antes del upload, añadiendo complejidad. El plan gratuito es menos generoso que Cloudinary para transformaciones.
3. **Cloudinary** → **SELECCIONADA.** Plan gratuito de 25 créditos/mes suficiente para el volumen universitario esperado. Ofrece transformación automática de imágenes vía parámetros en URL sin código adicional en el backend. SDK oficial para Node.js maduro y bien documentado. Resuelve simultáneamente persistencia, optimización de entrega y reducción de consumo de ancho de banda.

**Consecuencias:**
- (+) Imágenes persistentes independientemente de reinicios del servidor.
- (+) Entrega vía CDN global con latencia optimizada.
- (+) Compresión y transformación automática en entrega.
- (−) Dependencia de un servicio externo. Mitigado con el fallback documentado en RGO-03 del PMP v1.4.

---

### ADR-02 | Perceptual hashing (dHash) para detección de imágenes duplicadas

| Campo   | Detalle                        |
|---------|--------------------------------|
| Estado  | Aceptada                       |
| Fecha   | Marzo 2026                     |
| SRS     | RF-28, RN-07                   |

**Contexto:** El sistema requiere detectar cuando un usuario reutiliza o roba material gráfico de otro emprendedor, o cuando intenta publicar el mismo anuncio bajo proyectos distintos para hacer spam. La comparación exacta de archivos (MD5/SHA) fallaría ante mínimas modificaciones de la imagen.

**Alternativas consideradas:**

1. **Hash criptográfico exacto (MD5/SHA-256)** → DESCARTADA. Incapaz de detectar imágenes ligeramente modificadas (recorte, brillo, cambio de formato).
2. **Detección por IA/ML (embeddings de imágenes)** → DESCARTADA. Excesivamente compleja para el alcance del proyecto; requeriría un modelo adicional o una API de pago.
3. **dHash (Difference Hash) con distancia de Hamming** → **SELECCIONADA.** Implementable localmente con la biblioteca `sharp` de Node.js sin dependencias externas. Genera un hash de 64 bits robusto ante variaciones menores (compresión, recorte ligero, ajuste de brillo). El umbral de distancia de Hamming ≤ 10 sobre 64 bits fue calibrado para tolerar variaciones menores sin generar falsos positivos en imágenes temáticamente similares pero visualmente distintas (ej. dos fotos diferentes de cupcakes de distintos emprendedores).

**Consecuencias:**
- (+) Detección eficaz de copias directas y material reutilizado entre cuentas.
- (+) Sin costo adicional ni dependencias externas de pago.
- (+) Umbral parametrizable sin cambio de código mediante variable de entorno `HASH_DISTANCE_THRESHOLD` (RN-07).
- (−) Los falsos positivos se envían a revisión humana, no se bloquean automáticamente. El administrador toma la decisión final.

---

### ADR-03 | Paginación por cursor en lugar de paginación por offset

| Campo   | Detalle                        |
|---------|--------------------------------|
| Estado  | Aceptada                       |
| Fecha   | Marzo 2026                     |
| SRS     | RNF-02                         |

**Contexto:** El feed de anuncios requiere scroll infinito. La paginación clásica por offset (`LIMIT 20 OFFSET 40`) tiene dos problemas en tablas activas: (1) si se insertan nuevos anuncios mientras el usuario hace scroll, los bloques siguientes pueden saltarse registros o repetirlos; (2) en tablas grandes, PostgreSQL debe recorrer los registros omitidos antes de devolver los solicitados, lo que degrada el rendimiento progresivamente.

**Alternativas consideradas:**

1. **Paginación por offset (LIMIT/OFFSET)** → DESCARTADA por los problemas descritos: inestabilidad ante inserciones concurrentes y degradación de rendimiento en tablas grandes.
2. **Paginación por cursor (keyset pagination)** → **SELECCIONADA.** El cliente envía el `id` del último anuncio recibido; el servidor ejecuta `SELECT * FROM announcements WHERE id < $cursor ORDER BY id DESC LIMIT 20`. Esta consulta usa el índice primario, es O(log n) independientemente del offset, y es estable ante inserciones concurrentes.

**Consecuencias:**
- (+) Rendimiento consistente independientemente del tamaño de la tabla.
- (+) Estabilidad del feed ante publicación de nuevos anuncios durante el scroll.
- (−) No permite saltar a una página arbitraria (no hay "página 5"). Aceptable para scroll infinito donde la navegación es lineal.

---

### ADR-04 | Autenticación con cookies HttpOnly en lugar de localStorage o React Context

| Campo   | Detalle                          |
|---------|----------------------------------|
| Estado  | Aceptada (actualizada en v1.1)   |
| Fecha   | Marzo 2026                       |
| SRS     | RNF-05                           |

**Contexto:** La autenticación requiere que el JWT persista durante la sesión del usuario. El riesgo más relevante para este sistema es el XSS (Cross-Site Scripting): si un script malicioso logra ejecutarse en la página, puede leer cualquier valor accesible desde JavaScript. En v1.0 se había seleccionado el almacenamiento en React Context (memoria) como compromiso entre seguridad y simplicidad. Sin embargo, el token se pierde al recargar la página, obligando al usuario a autenticarse de nuevo en cada visita.

**Alternativas consideradas:**

1. **localStorage** → DESCARTADA. Accesible desde cualquier script; vulnerable a XSS de forma directa. Un atacante que logre inyectar código puede robar el JWT completo y suplantar al usuario indefinidamente.
2. **React Context (memoria)** → DESCARTADA en v1.1. Segura ante XSS, pero el token se pierde en cada recarga de página, creando fricción de UX significativa para el emprendedor que gestiona sus anuncios frecuentemente.
3. **Cookie HttpOnly + Secure + SameSite=Strict** → **SELECCIONADA.** El navegador gestiona la cookie directamente; JavaScript no puede leerla ni manipularla. La bandera `Secure` garantiza transmisión solo por HTTPS. `SameSite=Strict` previene ataques CSRF al no enviar la cookie en peticiones cross-site.

**Implementación real:** El backend Express utiliza `cookie-parser` y emite el JWT en la cookie `token` con `httpOnly: true`, `maxAge` de 8 horas (`JWT_EXPIRATION_HOURS`), `secure: true` y `sameSite: 'none'` en producción (para despliegues cross-origin entre frontend y API) o `sameSite: 'lax'` en desarrollo local. El frontend envía `credentials: 'include'` en todas las llamadas `fetch` (`frontend/src/services/api.js`). Al cerrar sesión (`POST /auth/logout`), la cookie se limpia con `Cache-Control: no-store`.

**Consecuencias:**
- (+) JWT inaccesible para scripts JavaScript incluso en caso de XSS.
- (+) Sesión persiste entre recargas de página, mejorando la UX del emprendedor.
- (+) `SameSite=Strict` previene ataques CSRF sin necesidad de token CSRF adicional.
- (−) Requiere configuración de CORS con `credentials: true` en el backend, lo que exige especificar los dominios permitidos explícitamente. Para un despliegue en Railway.app con un solo dominio, esto es trivial de configurar.

---

### ADR-05 | Shadowban como excepción acotada al principio de moderación humana

| Campo   | Detalle                          |
|---------|----------------------------------|
| Estado  | Aceptada                         |
| Fecha   | Marzo 2026                       |
| SRS     | RF-38, RN-11, RN-13              |

**Contexto:** RN-11 establece que ningún automatismo puede sancionar contenido de forma autónoma. Sin embargo, RF-38 introduce un mecanismo de shadowban automático ante inacción prolongada del administrador. Esta aparente contradicción requiere justificación explícita.

**Decisión:** El shadowban automático se acepta como una excepción controlada a RN-11 bajo las siguientes condiciones acumulativas, que lo hacen cualitativamente diferente de una sanción arbitraria:

1. El umbral de activación (5 reportes de usuarios diferentes) es estadísticamente significativo en una comunidad de ≤3,000 usuarios.
2. El tiempo de inacción (12 horas desde la alerta) garantiza que no es una decisión instantánea sino una respuesta a negligencia administrativa comprobable.
3. El shadowban es temporal y tiene una duración máxima fija de 48 horas, tras las cuales el anuncio se restaura automáticamente.
4. El emprendedor recibe una notificación interna explicando el estado.
5. El anuncio sigue siendo visible para el administrador en su panel en todo momento.
6. Todos los umbrales son parametrizables sin cambio de código mediante variables de entorno (RN-13).

**Consecuencias:**
- (+) Reduce el tiempo de exposición de contenido potencialmente ofensivo ante inacción administrativa prolongada.
- (+) Protege al emprendedor legítimo mediante la restauración automática.
- (−) Introduce un vector de abuso mediante reportes masivos coordinados. Mitigado por el umbral alto (5 reportes únicos) y la restauración automática a las 48 horas.

---

### ADR-06 | PostgreSQL sobre MySQL como motor de base de datos

| Campo   | Detalle                          |
|---------|----------------------------------|
| Estado  | Aceptada                         |
| Fecha   | Marzo 2026                       |
| SRS     | General                          |

**Contexto:** El proyecto requiere una base de datos relacional. Railway.app ofrece MySQL y PostgreSQL como servicios gestionados en su capa gratuita.

**Alternativas consideradas:**

1. **MySQL** → DESCARTADA. Soporte nativo de tipos ENUM menos robusto. El tipo JSON es menos eficiente que en PostgreSQL. La extensión de búsqueda de texto completo es más limitada.
2. **PostgreSQL** → **SELECCIONADA.** Soporte nativo y eficiente de tipos ENUM, JSON, arrays y full-text search. Las window functions facilitan los cálculos de métricas con umbral de intención. Integración nativa en Railway.app sin configuración adicional. Estándar de facto en proyectos Node.js modernos.

**Consecuencias:**
- (+) Tipos de datos más expresivos reducen validaciones adicionales en el backend.
- (+) Mejor soporte para las queries de agregación del módulo de métricas.
- (+) Ecosistema más moderno de herramientas de administración y migración.
- (−) Curva de aprendizaje marginalmente mayor que MySQL para usuarios sin experiencia previa. Mitigado por la documentación abundante disponible.

---

### ADR-07 | Progressive Web App (PWA) con Service Worker y manifest.json

| Campo   | Detalle                                    |
|---------|--------------------------------------------|
| Estado  | Aceptada                                   |
| Fecha   | Marzo 2026                                 |
| SRS     | RNF-08 (mobile-first), RNF-01 (tiempo de carga) |

**Contexto:** El escenario primario de adopción es un estudiante que escanea un código QR pegado en un tablero físico del campus, llega a la web por primera vez desde su celular y decide si adopta la plataforma en los primeros segundos. La fricción de acceso futuro es un factor crítico: si el alumno debe recordar y escribir la URL cada vez, la probabilidad de retorno cae significativamente. Adicionalmente, las redes móviles universitarias pueden ser inconsistentes, lo que penaliza el tiempo de carga inicial.

**Alternativas consideradas:**

1. **Web estándar sin capacidades de instalación** → No aprovecha las capacidades del navegador moderno para reducir la fricción de acceso recurrente.
2. **Aplicación nativa iOS/Android** → DESCARTADA (Out of Scope, PMP v1.4). Requiere cuentas de desarrollador, ciclos de aprobación en tiendas y desarrollo paralelo de dos plataformas.
3. **Progressive Web App (PWA)** → **SELECCIONADA.** Con dos archivos adicionales al frontend (`manifest.json` y `service-worker.js`), el navegador ofrece al usuario la opción de "instalar" la app en su pantalla de inicio sin requerir tiendas de aplicaciones ni aprobaciones externas.

**Implementación real:** `frontend/public/manifest.json` define nombre, íconos (`192px` y `512px`) y `display: standalone`. `frontend/public/sw.js` (`CACHE_NAME = 'mml-v4'`, registrado en `src/main.jsx`) excluye explícitamente las rutas de API (`/auth`, `/projects`, `/notifications`, `/admin`, `/announcements`) para evitar respuestas cacheadas de sesión/mutaciones, aplica Network-First para navegación y recursos externos, y Cache-First para activos estáticos.

**Consecuencias:**
- (+) Los estudiantes pueden instalar el Mural en su pantalla de inicio con un solo toque, eliminando la necesidad de recordar la URL.
- (+) El tiempo de carga de visitas recurrentes se reduce drásticamente al servir recursos estáticos desde caché local.
- (+) Funcionalidad de visualización básica disponible sin conexión (feed cacheado).
- (+) El ícono institucional en la pantalla de inicio refuerza la identidad visual del proyecto.
- (−) El ciclo de actualización del Service Worker puede causar que un usuario vea una versión ligeramente desactualizada del frontend durante unos minutos tras un despliegue. Mitigado con la estrategia `skipWaiting`, que fuerza la activación inmediata de la nueva versión.

---

### ADR-08 | Caché en memoria del servidor (`node-cache`)

| Campo   | Detalle                                              |
|---------|------------------------------------------------------|
| Estado  | **No implementada / Diferida** (actualizado en v1.4) |
| Fecha   | Noviembre 2026                                       |
| SRS     | RNF-01 (tiempo de carga), RNF-12 (capacidad)         |

**Estado real en código:** `node-cache` no está instalado en `backend/package.json` ni utilizado en `backend/src/`. Actualmente, la configuración de umbrales se lee directamente de `process.env`, el frontend mantiene el catálogo normalizado de 14 categorías en `frontend/src/constants/categories.js` y el backend consulta PostgreSQL directamente al resolver categorías. La adopción de caché en memoria permanece como optimización futura si el tráfico concurrente lo exige.

---

### ADR-09 | Separación de identidad pública y datos de autenticación en tablas distintas

| Campo   | Detalle                              |
|---------|--------------------------------------|
| Estado  | **Implementada y extendida (v1.4)**  |
| Fecha   | Noviembre 2026                       |
| SRS     | RF-02, RF-38, RF-39, RF-08           |

**Contexto:** El sistema separa los datos sensibles de autenticación (`users`: matrícula, `password_hash`, `whatsapp_number`, rol, suspensión) de la identidad pública y canales de contacto del emprendedor (`entrepreneur_profiles`).

**Implementación real:** `entrepreneur_profiles` almacena `display_name` (obligatorio, `VARCHAR(80)`), `bio_short` (`VARCHAR(200)`), `profile_photo_url` (`VARCHAR(500)`), `profile_photo_id` (`VARCHAR(200)`), `instagram_handle` (`VARCHAR(60)`) y `classroom_location` (`VARCHAR(100)`). Todos estos campos están activos en producción/desarrollo a través de `POST /auth/register/entrepreneur`, `PATCH /auth/profile`, `GET /auth/profile/:id` y `GET /projects/public/:id`. La creación inicial de `users` + `entrepreneur_profiles` ocurre en una transacción atómica en `authController.js`.

---

## SECCIÓN 9. VISTA DE DESPLIEGUE

### 9.1 Infraestructura local y objetivo de producción

| Componente | Entorno local actual (`docker-compose.yml`) | Objetivo de producción |
| --- | --- | --- |
| Backend Node.js | Contenedor `mural_maz_lince_api` (`backend/Dockerfile` multi-stage `node:18-alpine`, puerto `3000`) | Railway.app (Docker) |
| Base de datos PostgreSQL | Contenedor `mural_maz_lince_db` (`postgres:15-alpine`, puerto `5433:5432`, DB `mural_maz_lince_dev`) | PostgreSQL gestionado en Railway.app |
| Frontend (Vite + React) | Servidor de desarrollo Vite (`npm run dev`, puerto `5173`) | Build estático (`dist/`) en Vercel o Railway |
| Almacenamiento de imágenes | Cloudinary (`storageService.js`, mock en `NODE_ENV=test`) | Cloudinary (Free) |
| Moderación IA de imágenes | Google Cloud Vision (`moderationService.js`, activo con `ENABLE_AUTO_MODERATION=true`) | Google Cloud Vision (Free 1,000 u/mes) |

> **Nota sobre `backend/Dockerfile`:** La etapa `production` copia actualmente `src/` y dependencias de producción, sin copiar `docs/swagger.json` ni `backend/scripts/`; en desarrollo local estos archivos están disponibles mediante el bind mount `./backend:/app`.

### 9.2 Variables de entorno reales (`.env.example` y código)

| Variable | Valor por defecto / Ejemplo | Uso real en el backend |
| --- | --- | --- |
| `NODE_ENV` | `development` / `test` / `production` | Controla cookies `secure`/`sameSite`, mocks de test, cron jobs y bloqueo de `migrate.js` en producción. |
| `PORT` | `3000` | Puerto HTTP de Express. |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5433/mural_maz_lince_dev` | Conexión al pool `pg`. |
| `JWT_SECRET` | *(secreto)* | Clave de firma/verificación JWT. |
| `JWT_EXPIRATION_HOURS` | `8` | Vigencia del token y cookie `token`. |
| `CORS_ALLOWED_ORIGIN` | `http://localhost:5173` | Origen permitido con `credentials: true`. |
| `APP_PRODUCTION_URL` | `http://localhost:3000` | URL base de la aplicación. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | *(credenciales)* | Carga y eliminación de imágenes en Cloudinary (`CLOUDINARY_FOLDER` y `CLOUDINARY_MOCK` opcionales). |
| `GOOGLE_APPLICATION_CREDENTIALS` / `GOOGLE_CLOUD_VISION_KEY` | `google-credentials.json` | Autenticación de Google Cloud Vision (`VISION_MOCK` / `VISION_MOCK_RESULT` opcionales). |
| `ENABLE_AUTO_MODERATION` | `false` *(implícito fuera de `test`)* | Debe establecerse en `true` para activar el pipeline de moderación en `POST /announcements`. |
| `VISION_TIMEOUT_MS` / `VISION_MONTHLY_QUOTA` / `VISION_ALERT_PERCENT` | `8000` / `1000` / `80` | Timeout y control de cuota mensual en memoria de Vision API. |
| `HASH_DISTANCE_THRESHOLD` | `10` | Umbral de distancia Hamming para dHash (RN-07). |
| `INTENTION_THRESHOLD_MS` | `5000` | Umbral de reversión accidental en likes y valoraciones (RF-14). |
| `REPORT_ALERT_THRESHOLD` | `3` | Reportes únicos para alerta de urgencia (RF-36). |
| `SHADOWBAN_MIN_REPORTS` / `SHADOWBAN_WAIT_HOURS` / `SHADOWBAN_RESTORE_HOURS` | `5` / `12` / `48` | Parámetros del job horario de shadowban y restauración automática (RF-37). |
| `MAX_ACTIVE_PROJECTS` / `MAX_ACTIVE_ANNOUNCEMENTS` | `5` / `3` | Límites de proyectos activos por emprendedor y anuncios activos/pendientes por proyecto. |
| `ADMIN_MATRICULA` / `ADMIN_DEFAULT_PASSWORD` | *(sin valores por defecto)* | Requeridas únicamente para ejecutar `npm run admin:bootstrap`. |

### 9.3 Estado de CI/CD

El repositorio aún no contiene workflows en `.github/workflows/`. Las validaciones se ejecutan localmente mediante:
1. Backend: `npm run lint`, `npm test` y `npm run test:integration` (requiere `docker compose up -d db`).
2. Frontend: `npm run lint` y `npm run build`.
3. Salud del servicio: `GET /health` verifica conexión activa a PostgreSQL (`SELECT 1`).

---

## SECCIÓN 10. CONSIDERACIONES DE SEGURIDAD

### 10.1 Superficie de ataque y mitigaciones

**AMENAZA-01 | Exposición del número WhatsApp**

| Campo      | Detalle                                                                                                     |
|------------|-------------------------------------------------------------------------------------------------------------|
| Mitigación | COMP-09 (WhatsApp Link Service) es el único componente con acceso al campo `whatsapp_number`. El campo está excluido explícitamente de todos los `SELECT` que alimentan respuestas de la API. Un test automatizado verifica que ningún endpoint expone el número en texto plano (RNF-04, MET-07 del PMP v1.4). |

---

**AMENAZA-02 | Registro con matrícula ajena (suplantación de ROL-02)**

| Campo      | Detalle                                                                                                     |
|------------|-------------------------------------------------------------------------------------------------------------|
| Mitigación | ROL-02 no tiene contraseña por decisión de diseño aceptada (PMP v1.4, Sección 2.1). El impacto es bajo: solo puede dar likes y valoraciones. El umbral de intención (RF-14) mitiga el impacto en las métricas. El flujo de reclamo (RF-35) permite al titular legítimo recuperar su cuenta para emprendedor. |

---

**AMENAZA-03 | Abuso de reportes masivos para silenciar competencia**

| Campo      | Detalle                                                                                                     |
|------------|-------------------------------------------------------------------------------------------------------------|
| Mitigación | El umbral de shadowban (5 reportes únicos) es suficientemente alto para resistir ataques individuales. La restauración automática a las 48 horas garantiza que el emprendedor legítimo no quede permanentemente silenciado. El administrador siempre puede restaurar manualmente antes de ese plazo. |

---

**AMENAZA-04 | Bypass de la compresión client-side**

| Campo      | Detalle                                                                                                     |
|------------|-------------------------------------------------------------------------------------------------------------|
| Mitigación | El backend implementa una segunda línea de validación (RF-31). Cualquier imagen que llegue al servidor fuera de los límites es rechazada con HTTP 413 y el evento se registra en el log. |

---

**AMENAZA-05 | Inyección SQL**

| Campo      | Detalle                                                                                                     |
|------------|-------------------------------------------------------------------------------------------------------------|
| Mitigación | Todas las queries utilizan consultas parametrizadas (prepared statements). Ninguna query construye SQL mediante concatenación de strings de entrada del usuario. |

---

**AMENAZA-06 | Fuerza bruta en login**

| Campo      | Detalle                                                                                                     |
|------------|-------------------------------------------------------------------------------------------------------------|
| Mitigación | Rate limiting en el endpoint `POST /auth/login` (máx. 10 intentos por IP en 15 minutos). Implementado con `express-rate-limit`. |

---

## APÉNDICE A – TRAZABILIDAD SAD ↔ SRS v1.5

| Componente / Decisión | Requisitos SRS relacionados                              |
|-----------------------|----------------------------------------------------------|
| COMP-01 Router        | RNF-07 (variables de entorno), RNF-14 (lint)            |
| COMP-02 Auth          | RF-01 a RF-07, RF-34, RF-38, RF-39, RNF-05, RNF-06     |
| COMP-03 Feed          | RF-08, RF-09, RF-10, RNF-01, RNF-02                    |
| COMP-04 Announcement  | RF-19 a RF-22, RF-31, RF-32, RF-33                     |
| COMP-05 Interaction   | RF-12, RF-13, RF-14, RN-08                             |
| COMP-06 Report        | RF-35, RF-36, RF-37, RN-13                             |
| COMP-07 Moderation    | RF-26, RF-27, RF-28, RN-07, RN-11                      |
| COMP-08 Storage       | RF-32, RF-33, RNF-11                                   |
| COMP-09 WhatsApp Link | RF-11, RN-09, RNF-04                                   |
| COMP-10 Notification  | RF-25, RF-37                                           |
| COMP-11 Admin/Project | RF-15 a RF-18, RF-23, RF-29, RF-30, RF-34              |
| COMP-12 Metrics       | RF-24, RF-14, RN-08                                    |
| ADR-01                | RF-32, RF-33, RNF-11                                   |
| ADR-02                | RF-28, RN-07                                           |
| ADR-03                | RNF-02                                                 |
| ADR-04                | RNF-05 (actualizado en v1.4)                           |
| ADR-05                | RF-37, RN-11, RN-13                                    |
| ADR-06                | General (modelo de datos)                              |
| ADR-07                | RNF-08 (mobile-first), RNF-01 (tiempo de carga)        |
| ADR-08                | Diferida (no implementada en v1.4)                     |
| ADR-09                | RF-02, RF-38, RF-39, RF-08                             |

---

*FIN DEL DOCUMENTO*
*SAD – Mural Maz Lince v1.4*
