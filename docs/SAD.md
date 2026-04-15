# SOFTWARE ARCHITECTURE DOCUMENT (SAD)
**Proyecto:** Mural Maz Lince
**Versión:** 1.3
**Elaborado por:** Miriam Alanis
**Fecha de elaboración:** Abril 2026
**Basado en:** IEEE 42010:2011 – Systems and Software Engineering – Architecture Description / C4 Model (Simon Brown)

---

## HISTORIAL DE VERSIONES

| Versión | Fecha      | Descripción                                                                                                                                                                                          | Autor         |
|---------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| 1.0     | Marzo 2026 | Versión inicial del SAD                                                                                                                                                                              | Miriam Alanis |
| 1.1     | Marzo 2026 | ADR-04 actualizado: cookies HttpOnly sobre React Context; ADR-07 PWA con Service Worker; ADR-08 caché en memoria; SEQ-01 expandido con fallback de Vision API; cloudinary_id reforzado en narrativa del modelo de datos | Miriam Alanis |
| 1.2     | Marzo 2026 | Nueva tabla entrepreneur_profiles separada de users (ADR-09); display_name obligatorio; campos bio_short y profile_photo para v2.0; COMP-02 actualizado; relaciones ER actualizadas; trazabilidad SAD-SRS | Miriam Alanis |
| 1.3     | Abril 2026 | Actualización de referencias a SRS v1.4 y PMP v1.4; PWA declarado explícitamente en alcance (Sección 1.2) y en definiciones (Sección 1.4); ADR-07 y ADR-08 reubicados dentro de la Sección 8; SEQ-02 paso 8 corregido para reflejar cookie HttpOnly (consistente con ADR-04); ADR-09 redactado con cuerpo formal completo | Miriam Alanis |

---

## SECCIÓN 1. INTRODUCCIÓN

### 1.1 Propósito del documento

Este Software Architecture Document (SAD) describe la arquitectura del sistema Mural Maz Lince versión 1.3 según el C4 Model: contexto del sistema, contenedores, componentes del backend y decisiones de arquitectura registradas como ADRs. Además incluye los diagramas de secuencia de los flujos críticos del sistema y el modelo entidad-relación de la base de datos.

El documento está dirigido a la directora del proyecto en su rol de desarrolladora, al asesor académico de titulación y sirve como referencia técnica para las fases de desarrollo, pruebas y mantenimiento. Toda decisión de diseño significativa queda trazada a un requisito del SRS v1.4.

### 1.2 Alcance

Este documento cubre la arquitectura de la versión 1.0 del sistema, que incluye el frontend React (diseñado y desplegado como Progressive Web App — PWA), el backend Node.js/Express, la base de datos PostgreSQL, la integración con Cloudinary, Google Cloud Vision API y el sistema de moderación híbrida. No cubre la arquitectura de servicios externos (Railway.app, Cloudinary) más allá de su interfaz de integración con el sistema.

### 1.3 Referencias

- [1] SRS – Mural Maz Lince v1.4
- [2] PMP – Mural Maz Lince v1.4
- [3] IEEE 42010:2011 – Systems and Software Engineering – Architecture Description
- [4] C4 Model – Simon Brown. https://c4model.com
- [5] Node.js Documentation. https://nodejs.org/en/docs
- [6] React Documentation. https://react.dev
- [7] Cloudinary API Reference. https://cloudinary.com/documentation
- [8] Google Cloud Vision API. https://cloud.google.com/vision/docs

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
| Tecnología  | React 18, Bootstrap 5, browser-image-compression, manifest.json + Service Worker (PWA)                    |
| Despliegue  | Archivos estáticos servidos desde Railway.app                                                              |
| Descripción | Interfaz de usuario mobile-first instalable como PWA. Implementa el feed con scroll infinito y paginación por cursor, los flujos de registro y autenticación, el panel de gestión del emprendedor, el panel de métricas con umbral de intención y el panel de administración. Realiza la compresión y redimensionamiento de imágenes en el navegador antes del upload (RF-31). Se comunica exclusivamente con el Backend API mediante HTTP/JSON con cookies HttpOnly para la gestión de sesión. El manifest.json y el Service Worker habilitan la instalación como PWA en dispositivos móviles, permitiendo que los estudiantes accedan desde su pantalla de inicio sin pasar por una tienda de aplicaciones (ADR-07). |

**CONT-02 | Backend API (Node.js + Express)**

| Campo       | Detalle                                                                                                     |
|-------------|-------------------------------------------------------------------------------------------------------------|
| Tecnología  | Node.js LTS, Express.js, JWT, bcrypt, sharp (dHash), bad-words, Multer (recepción de imágenes), node-cron (jobs programados) |
| Despliegue  | Contenedor Docker en Railway.app                                                                           |
| Descripción | Núcleo de la aplicación. Expone una API REST documentada en OpenAPI 3.0. Contiene toda la lógica de negocio: autenticación, validación de matrícula (checksum), moderación de contenido (orquestación de los tres filtros), gestión de proyectos y anuncios, motor de métricas con umbral de intención, sistema de notificaciones internas y jobs programados de expiración de anuncios y shadowban. Se comunica con la Base de Datos PostgreSQL, Cloudinary y Google Cloud Vision API. |

**CONT-03 | Base de datos (PostgreSQL)**

| Campo       | Detalle                                                                                                     |
|-------------|-------------------------------------------------------------------------------------------------------------|
| Tecnología  | PostgreSQL 15 (gestionado en Railway.app)                                                                  |
| Despliegue  | Servicio de base de datos en Railway.app                                                                   |
| Descripción | Almacena todos los datos persistentes del sistema: usuarios, proyectos, anuncios, hashes perceptuales, valoraciones, likes, notificaciones internas, categorías, reportes y registro de moderación. Las imágenes NO se almacenan aquí; solo se almacena la URL pública de Cloudinary. |

### 4.3 Diagrama C4 Level 2 – Container Diagram

graph TB
  %% Definición de Estilos
  classDef external fill:#999999,stroke:#666,color:#fff,stroke-width:2px;
  classDef container_light fill:#4b9cd3,stroke:#1168BD,color:#fff,stroke-width:2px;
  classDef container_mid fill:#1168BD,stroke:#0b4d8c,color:#fff,stroke-width:2px;
  classDef container_dark fill:#0b4d8c,stroke:#052e56,color:#fff,stroke-width:2px;
  classDef person fill:#08427b,stroke:#052e56,color:#fff,stroke-width:2px;

  %% Actores (Fuera del límite)
  Users["fa:fa-users <b>Usuarios</b><br/>(Visitante, Registrado,<br/>Emprendedor, Administrador)"]:::person

  %% Límite del Sistema
  subgraph MuralMazLince ["Mural Maz Lince (Límite del Sistema)"]
    style MuralMazLince fill:none,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5

    FE["<b>Frontend</b><br/>[React SPA / Bootstrap 5 / PWA]<br/>Interfaz mobile-first. Compresión client-side."]:::container_light
    BE["<b>Backend API</b><br/>[Node.js / Express]<br/>Lógica de negocio, moderación,<br/>métricas, jobs programados."]:::container_mid
    DB[("fa:fa-database <b>Base de Datos</b><br/>[PostgreSQL en Railway]<br/>Datos persistentes del sistema.")]:::container_dark
  end

  %% Sistemas Externos
  Cloudinary["<b>Cloudinary</b><br/>[CDN de imágenes]"]:::external
  Vision["<b>Google Cloud Vision API</b><br/>[Análisis Safe Search]"]:::external
  WhatsApp["<b>WhatsApp / wa.me</b><br/>[Enlace de contacto]"]:::external

  %% Relaciones
  Users -- "HTTPS / Browser / PWA App" --> FE
  FE -- "JSON / REST API (HTTPS)<br/>Cookie HttpOnly" --> BE
  BE -- "SQL / TCP (puerto 5432)" --> DB
  BE -- "Upload / Delete imágenes<br/>(HTTPS / REST)" --> Cloudinary
  BE -- "Safe Search Detection<br/>(HTTPS / REST)" --> Vision
  BE -- "Genera URL wa.me dinámicamente" --> WhatsApp

  %% Ajustes visuales
  linkStyle default stroke:#333,stroke-width:1px;

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
| SRS              | RF-01 a RF-07, RF-35, RF-39, RF-40                                                                        |

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
| SRS              | RF-36, RF-37, RF-38, RN-13                                                                                |

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

**COMP-10 | Notification Service**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Crea y gestiona notificaciones internas del emprendedor: cambios de estado de anuncio, alertas de vencimiento próximo, acciones del administrador, shadowban temporal. |
| Tecnología       | PostgreSQL                                                                                                 |
| SRS              | RF-25, RF-38                                                                                              |

---

**COMP-11 | Admin Controller**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Panel de moderación. Lista la cola de anuncios pendientes con su motivo de marcado. Procesa las decisiones del administrador (aprobar, rechazar, rechazar + suspender). Gestiona tickets de reclamo de matrícula (RF-35). Expone la funcionalidad de generación de código QR (RF-34). |
| Tecnología       | Express, qrcode npm                                                                                        |
| SRS              | RF-29, RF-30, RF-34, RF-35                                                                                |

---

**COMP-12 | Metrics Service**

| Campo            | Detalle                                                                                                     |
|------------------|-------------------------------------------------------------------------------------------------------------|
| Responsabilidad  | Calcula y sirve las métricas de impacto del panel del emprendedor: likes válidos acumulados, valoración promedio, visualizaciones y evolución temporal. Aplica el filtro del umbral de intención consultando el flag `is_accidental` en la base de datos. |
| Tecnología       | PostgreSQL (queries de agregación)                                                                         |
| SRS              | RF-24, RF-14, RN-08                                                                                       |

### 5.3 Diagrama C4 Level 3 – Component Diagram

graph LR
  %% Definición de Estilos
  classDef gateway fill:#4b9cd3,stroke:#1168BD,color:#fff,stroke-width:2px;
  classDef controller fill:#1168BD,stroke:#0b4d8c,color:#fff,stroke-width:2px;
  classDef service fill:#0b4d8c,stroke:#052e56,color:#fff,stroke-width:2px;
  classDef external fill:#999999,stroke:#666,color:#fff,stroke-width:2px;

  %% Límite del Contenedor: Backend API
  subgraph Backend ["Backend API (Node.js + Express)"]
    style Backend fill:none,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5

    %% Entrada
    Router["<b>Router / API Gateway</b><br/>(COMP-01)"]:::gateway

    %% Controladores
    subgraph Controladores ["Capa de Controladores"]
      style Controladores fill:none,stroke:none
      C2["<b>Auth Controller</b><br/>(COMP-02)"]:::controller
      C3["<b>Feed Controller</b><br/>(COMP-03)"]:::controller
      C4["<b>Announcement Controller</b><br/>(COMP-04)"]:::controller
      C5["<b>Interaction Controller</b><br/>(COMP-05)"]:::controller
      C6["<b>Report Controller</b><br/>(COMP-06)"]:::controller
      C11["<b>Admin Controller</b><br/>(COMP-11)"]:::controller
    end

    %% Servicios
    subgraph Servicios ["Servicios Internos"]
      style Servicios fill:none,stroke:none
      C7["<b>Moderation Service</b><br/>(COMP-07)"]:::service
      C8["<b>Storage Service</b><br/>(COMP-08)"]:::service
      C9["<b>WhatsApp Link Service</b><br/>(COMP-09)"]:::service
      C10["<b>Notification Service</b><br/>(COMP-10)"]:::service
      C12["<b>Metrics Service</b><br/>(COMP-12)"]:::service
    end
  end

  %% Sistemas Externos / Persistencia
  DB[("fa:fa-database <b>BD PostgreSQL</b><br/>(Railway)")]:::external
  GCV["<b>Google Cloud Vision</b><br/>(Safe Search)"]:::external

  %% Relaciones de Flujo
  Router --> C2
  Router --> C3
  Router --> C4
  Router --> C5
  Router --> C6
  Router --> C11
  
  C4 -- "Orquesta pipeline" --> C7
  C4 -- "Upload / Delete" --> C8
  C7 -- "Safe Search" --> GCV
  C3 -- "Genera URL" --> C9
  C6 -- "Notifica shadowban" --> C10
  C11 -- "Notifica decisión" --> C10
  
  %% Relaciones a DB
  C12 -- "Queries de agregación" --> DB
  C2 -.-> DB
  C3 -.-> DB
  C4 -.-> DB
  C5 -.-> DB
  C6 -.-> DB
  C11 -.-> DB

  %% Estilo de líneas corregido
  linkStyle default stroke:#333,stroke-width:1px;

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
-- Identidad pública del emprendedor. Relación 1:1 con users (ADR-09).
-- ─────────────────────────────────────────────────────────────
id                SERIAL PRIMARY KEY
user_id           INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
display_name      VARCHAR(80)  NOT NULL   -- Obligatorio en v1.0. Nombre visible en
                                          -- el feed y detalle de anuncio.
                                          -- Sujeto a filtro bad-words al crear/editar.
bio_short         VARCHAR(200)            -- NULL en v1.0. Reservado para v2.0:
                                          -- descripción breve del emprendedor.
profile_photo_url VARCHAR(500)            -- NULL en v1.0. Reservado para v2.0:
                                          -- URL pública de foto de perfil (Cloudinary).
profile_photo_id  VARCHAR(200)            -- NULL en v1.0. ID de Cloudinary para
                                          -- eliminación en v2.0.
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()

-- ─────────────────────────────────────────────────────────────
-- TABLA: projects
-- ─────────────────────────────────────────────────────────────
id               SERIAL PRIMARY KEY
user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
name             VARCHAR(120) NOT NULL
description      TEXT
category_id      INTEGER REFERENCES categories(id)
status           ENUM('active','suspended') DEFAULT 'active'
created_at       TIMESTAMP DEFAULT NOW()
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
status           ENUM('active','pending_review','rejected','shadowban')
                 DEFAULT 'pending_review'
expires_at       TIMESTAMP NOT NULL
created_at       TIMESTAMP DEFAULT NOW()
-- Restricción: máximo 3 anuncios activos por project_id (validada en backend)

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

erDiagram
    %% Entidades y Atributos
    users {
        int id PK
        string email
        string whatsapp_number "🔒 (RN-09)"
        string role
    }

    entrepreneur_profiles {
        int id PK
        int user_id FK "ADR-09: 1:1"
        string bio
    }

    projects {
        int id PK
        int user_id FK "Max 5 activos"
        int category_id FK
        string name
    }

    announcements {
        int id PK
        int project_id FK "Max 3 activos"
        int category_id FK
        string cloudinary_url "🔗 External"
        string cloudinary_id "🔗 External"
        string status
    }

    image_hashes {
        int id PK
        int announcement_id FK
        string hash "Entidad Satélite"
    }

    moderation_queue {
        int id PK
        int announcement_id FK "Hub Central"
        int admin_id FK "Resuelto por"
        string decision
        timestamp created_at
    }

    categories {
        int id PK
        string name
    }

    %% Relaciones y Cardinalidades
    users ||--|| entrepreneur_profiles : "1:1 (ADR-09)"
    users ||--o{ projects : "gestiona"
    users ||--o{ likes : "emite"
    users ||--o{ ratings : "emite"
    users ||--o{ reports : "emite"
    users ||--o{ notifications : "recibe"
    users ||--o{ claim_tickets : "reclamante"
    users ||--o{ moderation_queue : "resuelve (admin)"

    projects ||--o{ announcements : "contiene"
    categories ||--o{ projects : "clasifica"
    categories ||--o{ announcements : "clasifica"

    announcements ||--|| image_hashes : "satélite"
    announcements ||--o{ likes : "recibe"
    announcements ||--o{ ratings : "recibe"
    announcements ||--o{ reports : "recibe"
    announcements ||--o| moderation_queue : "entrada"

    %% Otros (Simplificados para claridad)
    likes { int id }
    ratings { int id }
    reports { int id }
    notifications { int id }
    claim_tickets { int id }

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

| ADR-ID | Título                                               | Estado           |
|--------|------------------------------------------------------|------------------|
| ADR-01 | Cloudinary como almacenamiento de imágenes           | Aceptada         |
| ADR-02 | dHash para detección de imágenes duplicadas          | Aceptada         |
| ADR-03 | Paginación por cursor en el feed                     | Aceptada         |
| ADR-04 | Autenticación con cookies HttpOnly                   | Aceptada (v1.1)  |
| ADR-05 | Shadowban como excepción acotada a RN-11             | Aceptada         |
| ADR-06 | PostgreSQL sobre MySQL                               | Aceptada         |
| ADR-07 | Progressive Web App con Service Worker               | Aceptada         |
| ADR-08 | Caché en memoria para consultas frecuentes           | Aceptada         |
| ADR-09 | Separación de identidad pública y autenticación      | Aceptada (v1.2)  |

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
- (+) Umbral parametrizable sin cambio de código mediante variable de entorno `HASH_SIMILARITY_THRESHOLD` (RN-07).
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

**Implementación requerida:** El backend Express debe: (a) configurar el middleware `cookie-parser`, (b) al hacer login exitoso emitir el JWT en una cookie con `httpOnly: true`, `secure: true`, `sameSite: 'strict'` y `maxAge` de 8 horas, (c) al hacer logout, sobrescribir la cookie con valor vacío y `maxAge: 0`. El frontend debe incluir `credentials: 'include'` en cada llamada `fetch` para que el navegador adjunte automáticamente la cookie.

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

**Implementación requerida:** El `manifest.json` define nombre, íconos en múltiples resoluciones, `theme_color: #961749` (institucional), y `display: standalone`. El Service Worker implementa dos estrategias diferenciadas: **Cache-First** para recursos estáticos (HTML, CSS, JS, íconos) porque rara vez cambian; y **Network-First** para llamadas a la API del feed porque el contenido es dinámico y la frescura importa más que la velocidad. Si la red no está disponible, el Service Worker sirve el último feed cacheado como fallback graceful.

**Consecuencias:**
- (+) Los estudiantes pueden instalar el Mural en su pantalla de inicio con un solo toque, eliminando la necesidad de recordar la URL.
- (+) El tiempo de carga de visitas recurrentes se reduce drásticamente al servir recursos estáticos desde caché local.
- (+) Funcionalidad de visualización básica disponible sin conexión (feed cacheado).
- (+) El ícono institucional en la pantalla de inicio refuerza la identidad visual del proyecto.
- (−) El ciclo de actualización del Service Worker puede causar que un usuario vea una versión ligeramente desactualizada del frontend durante unos minutos tras un despliegue. Mitigado con la estrategia `skipWaiting`, que fuerza la activación inmediata de la nueva versión.

---

### ADR-08 | Caché en memoria del servidor para consultas frecuentes e inmutables

| Campo   | Detalle                                              |
|---------|------------------------------------------------------|
| Estado  | Aceptada                                             |
| Fecha   | Marzo 2026                                           |
| SRS     | RNF-01 (tiempo de carga), RNF-12 (capacidad de usuarios) |

**Contexto:** Algunas consultas a PostgreSQL se ejecutan en prácticamente cada petición HTTP y devuelven datos que cambian muy raramente o nunca. El ejemplo más claro es la lista de categorías predefinidas (tabla `categories`, 20 registros fijos): cada vez que un usuario carga el formulario de publicación o el filtro del feed, el backend consulta esta tabla. En un escenario de 200 usuarios concurrentes en horario pico universitario, esto genera cientos de consultas idénticas por minuto a la base de datos de Railway sin ningún beneficio informativo.

**Alternativas consideradas:**

1. **Sin caché (consulta directa a PostgreSQL en cada petición)** → Funcional pero ineficiente. Consume crédito de Railway innecesariamente y añade latencia evitable.
2. **Redis como servidor de caché externo** → DESCARTADA. Añade un servicio adicional con costo potencial, complejidad de configuración y una dependencia más que puede fallar. Excesivo para el volumen de este proyecto.
3. **node-cache (caché en memoria del proceso Node.js)** → **SELECCIONADA.** Biblioteca npm liviana que implementa un almacén clave-valor en memoria con TTL configurable por entrada. No requiere infraestructura adicional y opera dentro del mismo proceso del backend con latencia de microsegundos.

**Alcance del caché (conservador y deliberado):** Se aplica exclusivamente a datos consultados frecuentemente que cambian con muy baja frecuencia: lista de categorías (TTL: 24 horas), y parámetros de configuración del sistema como umbrales de moderación y shadowban definidos en RN-13 (TTL: 1 hora). El feed de anuncios, métricas del emprendedor y datos de usuario NO se cachean porque su frescura es crítica.

**Consecuencias:**
- (+) Reducción significativa de consultas a PostgreSQL para datos estáticos.
- (+) Menor consumo de crédito de Railway en momentos de tráfico pico.
- (+) Latencia de respuesta mejorada para las rutas que sirven categorías.
- (−) El caché en memoria no se comparte entre instancias del servidor. Si Railway escala horizontalmente (poco probable en el plan gratuito), cada instancia tendría su propio caché independiente. Aceptable para esta escala.
- (−) Si el proceso de Node.js se reinicia (por un despliegue), el caché se vacía y las primeras consultas post-reinicio van directamente a PostgreSQL. Este es el comportamiento esperado y correcto.

---

### ADR-09 | Separación de identidad pública y datos de autenticación en tablas distintas

| Campo   | Detalle                          |
|---------|----------------------------------|
| Estado  | Aceptada (introducida en v1.2)   |
| Fecha   | Marzo 2026                       |
| SRS     | RF-02, RF-39, RF-40, RF-08       |

**Contexto:** El sistema necesita almacenar dos tipos de información conceptualmente distintos sobre el emprendedor: (a) datos de autenticación y seguridad (matrícula, contraseña hasheada, número de WhatsApp, rol, estado de suspensión) que son sensibles y nunca deben exponerse en la API; y (b) datos de identidad pública (nombre visible, y en versiones futuras, biografía y foto de perfil) que son visibles en el feed y en las vistas de detalle de anuncio. En la v1.0 inicial, ambos tipos de datos coexistían en la tabla `users`. Los requisitos RF-39 (display_name obligatorio) y RF-40 (campos escalables para v2.0) fuerzan una reflexión sobre el modelo de datos más adecuado.

**Alternativas consideradas:**

1. **Mantener todo en la tabla `users` añadiendo columnas** → DESCARTADA. A medida que crezca el perfil público (bio, foto, redes sociales en v2.0 y posteriores), la tabla de autenticación se contaminaría con datos de presentación. Cualquier `SELECT *` sobre `users` expondría inadvertidamente datos sensibles junto con datos públicos, aumentando el riesgo de filtración accidental del número de WhatsApp u otros campos protegidos.

2. **Tabla `entrepreneur_profiles` separada con relación 1:1 a `users`** → **SELECCIONADA.** La tabla `users` queda exclusivamente como tabla de autenticación. La tabla `entrepreneur_profiles` almacena únicamente la identidad pública. Esta separación garantiza que: (a) ningún `SELECT` sobre datos del feed toca la tabla de autenticación; (b) el perfil público puede extenderse en versiones futuras sin modificar el esquema de autenticación ni sus índices; (c) la responsabilidad de cada tabla es única y verificable por inspección.

**Implementación en v1.0:** `entrepreneur_profiles` contiene `display_name` (obligatorio, VARCHAR 80), `bio_short` (NULL, reservado para v2.0), `profile_photo_url` y `profile_photo_id` (ambos NULL, reservados para v2.0). La creación de los dos registros (`users` + `entrepreneur_profiles`) ocurre en una transacción atómica en COMP-02; si cualquiera de las dos inserciones falla, ambas se revierten.

**Consecuencias:**
- (+) Separación clara entre autenticación e identidad pública, reduciendo el riesgo de exposición accidental de datos sensibles.
- (+) El perfil público puede extenderse en v2.0 sin migraciones traumáticas sobre la tabla de autenticación.
- (+) `display_name` (RF-39) y los campos escalables (RF-40) tienen un hogar semánticamente correcto desde el inicio.
- (−) El registro de un emprendedor requiere dos inserciones coordinadas en lugar de una. Resuelto mediante transacción atómica en COMP-02, sin complejidad adicional para el cliente.

---

## SECCIÓN 9. VISTA DE DESPLIEGUE

### 9.1 Infraestructura de producción

| Componente                   | Servicio              | Plan                        |
|------------------------------|-----------------------|-----------------------------|
| Backend Node.js              | Railway.app           | Hobby (gratuito)            |
| Base de datos PostgreSQL     | Railway.app           | Plugin PostgreSQL (gratuito)|
| Almacenamiento imágenes      | Cloudinary            | Free (25 créditos/mes)      |
| Moderación IA imágenes       | Google Cloud Vision   | Free (1,000 unidades/mes)   |
| Filtro de texto              | bad-words (local)     | Open source, sin costo      |
| Frontend (archivos estáticos)| Railway.app           | Servido desde el mismo servicio |

### 9.2 Variables de entorno requeridas (producción)

| Variable                   | Descripción                                           |
|----------------------------|-------------------------------------------------------|
| `DATABASE_URL`             | URL de conexión PostgreSQL (Railway lo provee)        |
| `JWT_SECRET`               | Clave secreta para firma de tokens JWT                |
| `CLOUDINARY_CLOUD_NAME`    | Nombre del cloud de Cloudinary                        |
| `CLOUDINARY_API_KEY`       | API key de Cloudinary                                 |
| `CLOUDINARY_API_SECRET`    | API secret de Cloudinary                              |
| `GOOGLE_CLOUD_VISION_KEY`  | Clave de API de Google Cloud Vision                   |
| `HASH_SIMILARITY_THRESHOLD`| Umbral de distancia Hamming (default: 10)             |
| `INTENT_THRESHOLD_MS`      | Umbral de intención en ms (default: 5000)             |
| `REPORT_ALERT_THRESHOLD`   | Reportes para alerta urgente (default: 3)             |
| `REPORT_SHADOWBAN_THRESHOLD`| Reportes para shadowban (default: 5)                 |
| `REPORT_SHADOWBAN_HOURS`   | Horas de inacción para shadowban (default: 12)        |
| `REPORT_SHADOWBAN_MAX_HOURS`| Duración máxima del shadowban (default: 48)          |
| `NODE_ENV`                 | `production`                                          |

### 9.3 Pipeline de despliegue (CI/CD)

**Trigger:** Push a rama `main` en GitHub

| Paso   | Acción                                                                                              |
|--------|-----------------------------------------------------------------------------------------------------|
| Paso 1 | **Lint** (ESLint Airbnb config). Si falla → pipeline se detiene, no se despliega.                   |
| Paso 2 | **Tests unitarios** (Jest + Supertest). Si cobertura < 70% o algún test falla → pipeline se detiene.|
| Paso 3 | **Build de imagen Docker.** Dockerfile multi-stage: dependencias de producción únicamente.          |
| Paso 4 | **Deploy a Railway.app.** Railway detecta el push y ejecuta el redespliegue automático. Variables de entorno inyectadas por Railway en tiempo de ejecución. |
| Paso 5 | **Smoke test post-deploy.** `GET /health` → verifica que el servidor responde HTTP 200.             |

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

## APÉNDICE A – TRAZABILIDAD SAD ↔ SRS v1.4

| Componente / Decisión | Requisitos SRS relacionados                              |
|-----------------------|----------------------------------------------------------|
| COMP-01 Router        | RNF-07 (variables de entorno), RNF-14 (lint)            |
| COMP-02 Auth          | RF-01 a RF-07, RF-35, RF-39, RF-40, RNF-05, RNF-06     |
| COMP-03 Feed          | RF-08, RF-09, RF-10, RNF-01, RNF-02                    |
| COMP-04 Announcement  | RF-15 a RF-23, RF-31, RF-32, RF-33                     |
| COMP-05 Interaction   | RF-12, RF-13, RF-14, RN-08                             |
| COMP-06 Report        | RF-36, RF-37, RF-38, RN-13                             |
| COMP-07 Moderation    | RF-26, RF-27, RF-28, RN-07, RN-11                      |
| COMP-08 Storage       | RF-32, RF-33, RNF-11                                   |
| COMP-09 WhatsApp Link | RF-11, RN-09, RNF-04                                   |
| COMP-10 Notification  | RF-25, RF-38                                           |
| COMP-11 Admin         | RF-29, RF-30, RF-34, RF-35                             |
| COMP-12 Metrics       | RF-24, RF-14, RN-08                                    |
| ADR-01                | RF-32, RF-33, RNF-11                                   |
| ADR-02                | RF-28, RN-07                                           |
| ADR-03                | RNF-02                                                 |
| ADR-04                | RNF-05 (actualizado en v1.1)                           |
| ADR-05                | RF-38, RN-11, RN-13                                    |
| ADR-06                | General (modelo de datos)                              |
| ADR-07                | RNF-08 (mobile-first), RNF-01 (tiempo de carga)        |
| ADR-08                | RNF-01 (tiempo de carga), RNF-12 (capacidad)           |
| ADR-09                | RF-02, RF-39, RF-40, RF-08                             |

---

*FIN DEL DOCUMENTO*
*SAD – Mural Maz Lince v1.3*
