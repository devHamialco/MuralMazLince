# PROYECT MANAGEMENT PLAN

Proyecto: Mural Maz Lince
Versión: 1.4
Elaborado por: Miriam Alanis
Fecha de elaboración: Marzo 2026
Basado en: PMBOK Guide 7th Edition – PMI

## HISTORIAL DE VERSIONES

| **Versión** | **Fecha**     | **Descripción**                                                                                                                                                                                                                                                                                                               | **Autor**     |
| ----------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1.0         | 6 Abril 2026  | Versión inicial PMP                                                                                                                                                                                                                                                                                                           | Miriam Alanis |
| 1.1         | 7 Abril 2026  | Checksum de matrícula, perceptual hashing, modelo proyectos/anuncios con vigencia, protección WhatsApp, migración a Railway.app                                                                                                                                                                                               | Miriam Alanis |
| 1.2         | 8 Abril 2026  | Almacenamiento persistente con Cloudinary, calibración del umbral de hashing anti-spam, compresión de imagen en cliente, umbral de intención para likes/valoraciones, liSta de categorías de emprendimiento, flujo de moderación y decisiones de análisis.                                                                    | Miriam Alanis |
| 1.3         | 9 Abril 2026  | Incorporación de entrepreneur_profiles como entidad independiente de users; display_name obligatorio; campos escalabres bio_short y profile_photo para v2.0; actualizacion de OBJ-02, alcance, WBS y criterios de aceptación                                                                                                  | Miriam Alanis |
| 1.4         | 10 Abril 2026 | Corrección de inconsistencia metodológica: migración a sprints de 1 semanas; incorporación de Sección 6 expandida con estructura completa de 7 épicas, sprints por épica, historias de usuario en formato estándar, tareas técnicas con descripción y criterio de aceptación, backlog por sprint, y hitos de cierre por épica | Miriam Alanis |

# 1. INTRODUCCION

## 1.1 Ficha del proyecto

Nombre del proyecto: Mural Maz Lince
Código del proyecto: MML-2026
Tipo de proyecto: Desarrollo de aplicación web
Directora del proyecto: Miriam Alanis
Institución: Universidad Autónoma de Occidente, Mazatlán, Sinaloa, México
Fecha de inicio: 6 Abril 2026
Fecha estimada de cierre: 17 de Julio 2026
Estado actual: Fase de diseño
Repositorio: [https://github.com/devHamialco/MuralMazLince](https://github.com/devHamialco/MuralMazLince)
Hosting producción: Railway.app (plan gratuito)
Gestión de tareas: Jira (plan Free)

## 1.2 Descripción y propósito del proyecto

Actualmente los jóvenes universitarios de la Unidad Regional Mazatlán cuentan con varios murales informativos tradicionales repartidos en diferentes puntos de las instalaciones, aunque verdaderamente contienen información de relevancia en la comunidad estudiantil presentan complicaciones propias de un medio de comunicación analógico.

Los carteles anexados al mural están desorganizados, limitando el poder distinguir a simple vista cuales son meramente informativos de los que son publicitarios. La distribución de los murales y sus contenidos no están sincronizadas por lo que ciertos anuncios no llegan a toda la comunidad lo que dificulta el cumplimiento de su objetivo. Siendo carteles impresos su durabilidad es reducida o quedan opacados por anuncios superpuestos, además de que no son editables fácilmente lo que los deja desactualizados.

Mural Maz Lince es una aplicación web mobile-first que digitaliza el tablero de anuncios estudiantil físico de la universidad. La plataforma permite a estudiantes emprendedores publicar y gestionar sus proyectos comerciales, a las organizaciones estudiantiles difundir sus comunicados, y a los visitantes descubrir servicios locales dentro del ecosistema universitario.

El sistema incorpora: moderación híbrida de contenido (IA + revisión humana), perfiles de emprendedor verificables con identidad pública (display_name), almacenamiento persistente de imágenes vía Cloudinary, protección de datos de contacto (WhatsApp enmascarado), y métricas de impacto con filtrado por intención para el panel del emprendedor.

El proyecto se desarrolla de forma individual como iniciativa personal estudiantil, sin patrocinio institucional y dentro de presupuesto cero usando exclusivamente capas gratuitas de servicios en la nube.

## 1.3 Objetivos del proyecto

### Objetivo general

Desarrollar e implementar una aplicación web que modernice el sistema de comunicación emprendedora del tablero de anuncios físico universitario, resolviendo sus limitaciones estructurales mediante tecnología accesible, escalable y centrada en la experiencia del usuario joven.

### Objetivos Específicos

OBJ-01

Diseñar e implementar una arquitectura web full-stack con Node.js/Express en el backend y React en el frontend, aplicando buenas prácticas de ingeniería de software documentadas bajo estándares reconocidos.

OBJ-02

Implementar un sistema de autenticación por roles (visitante, usuario registrado con matrícula, emprendedor con matrícula, contraseña, WhatsApp, nombre visible, administrador) con validación local de formato de matrícula estudiantil (checksum: 8 dígitos, primer dígito = 2). El registro del emprendedor crea simultáneamente una cuenta de usuario en la tabla users y un perfil público en la tabla entrepreneur_profiles, con display_name obligatorio como base para la identidad pública de la plataforma y escalabilidad hacia una v2.0 con perfil de emprendedor completo.

OBJ-03

Integrar un mecanismo de moderación de contenido híbrido (IA + revisión humana) que actúe como filtro de control sin poder de sanción autónoma: la IA bloquea la publicación y la envía a revisión del administrador, quien toma la decisión final sobre el contenido y el usuario. El módulo cubre detección de imágenes inapropiadas (Google Cloud Vision), filtro de lenguaje ofensivo en textos y categorías personalizadas (bad-words), y detección de spam por duplicado de material gráfico mediante perceptual hashing calibrado.

OBJ-04

Implementar almacenamiento persistente de imágenes mediante Cloudinary con compresión y redimensionamiento client-side previo al upload, evitando la pérdida de archivos por la naturaleza efímera del filesystem de Railway.

OBJ-05

Implementar un modelo de gestión de proyectos y anuncios con ciclos de vida independientes, vigencia programable, límites de cantidad por usuario, sistema de categorías predefinidas con opción de categoría personalizada moderada, y mecanismo de portafolio para emprendedores.

OBJ-06

Implementar un sistema de métricas de impacto en el panel del emprendedor con filtrado por umbral de intención: las interacciones (likes y valoraciones) que sean revertidas en un período menor a 5 segundos se tratarán como ruido estadístico y no contabilizarán en las métricas.

OBJ-07

Proteger los datos de contacto sensibles de los emprendedores mediante enmascaramiento técnico del número WhatsApp, expuesto únicamente como enlace [wa.me](http://wa.me/) generado dinámicamente en el servidor.

OBJ-08

Implementar prácticas DevOps aplicables a nivel junior: contenedores con Docker, pipeline CI/CD, logging, métricas y pruebas automatizadas.

OBJ-09

Publicar y poner en operación la aplicación en Railway.app dentro del presupuesto disponible (capa gratuita, $0 MXN de costo inicial).

OBJ-10

Documentar el proyecto completo conforme a las 7 fases del SDLC con sus artefactos y estándares de calidad correspondientes

## 1.4 Usuarios del sistema

| **ID**     | **Rol**                | **Requisitos de Acceso**                       | **Permisos y Acciones Principales**                | **Restricciones**                                          |
| ---------- | ---------------------- | ---------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| **ROL-01** | **Visitante**          | Sin cuenta (Acceso libre).                     | • Visualizar el feed completo de anuncios activos. | • No puede publicar ni interactuar (likes o valoraciones). |
| **ROL-02** | **Usuario Registrado** | Matrícula estudiantil (Validada por checksum). | • Filtrar el feed por categorías .                 |

• Dar _like_ a anuncios .

• Asignar valoraciones (1 a 3 estrellas). | • No utiliza contraseña. El riesgo de suplantación se mitiga con el umbral de intención en métricas. |
| **ROL-03** | **Emprendedor** | Matrícula, contraseña y número de WhatsApp. | • Crear y gestionar proyectos y anuncios .

• Programar vigencias de anuncios .

• Consultar métricas de impacto y ver notificaciones .

• Administrar su portafolio. | • Requiere el registro de datos de contacto y autenticación completa. |
| **ROL-04** | **Administrador** | Asignación manual (Exactamente 2 cuentas). | • Acceso al panel de moderación y cola de revisión de IA .

• Aprobar o rechazar publicaciones pendientes .

• Tomar decisiones sobre usuarios reportados. | • Es un rol de control de plataforma de asignación cerrada. |

# 2. ALCANCE, ENTREGABLES Y CRITERIOS DE ACEPTACIÓN

## 2.1 Dentro del alcance

**Interfaz y experiencia de usuario:**

La aplicación es web responsive, mobile-first con modo oscuro como interfaz predeterminada. El flujo principal de navegación es un scroll infinito vertical estilo feed que presenta anuncios y publicaciones de emprendimientos. Esta vista es de solo lectura y no requiere autenticación: cualquier visitante puede explorarla sin necesidad de crear una cuenta, replicando la accesibilidad inmediata del tablero físico.

**Sistema de roles y autenticación:**

El sistema opera con cuatro roles de usuario con permisos acumulativos. El visitante accede sin cuenta y solo puede visualizar el feed. El usuario registrado se da de alta con su matrícula (validada en formato por checksum local: 8 dígitos, primer dígito = 2) y obtiene acceso a las funciones de filtrado por categoría, valoración de 1 a 3 estrellas y likes. El usuario emprendedor proporciona además una contraseña, su número de WhatsApp y un nombre visible (display_name) obligatorio al momento del sign-up, lo que habilita la gestión de proyectos y anuncios, la vista del panel de impacto y el portafolio. El display_name es el identificador público del emprendedor en el feed y las vistas de detalle. Durante el registro se crea adicionalmente un registro en la tabla entrepreneur profiles que almacena este nombre visible y reserva los campos bio short y profile photo para su uso en una versión futura del sistema. El administrador es un rol especial dado de alta manualmente para dos usuarios, con acceso al panel de moderación y gestión de contenido reportado.

La decisión de no requerir contraseña para el usuario registrado con solo matrícula es una decisión de diseño consciente que acepta un riesgo bajo y controlable: si una tercera persona usa la matrícula de otro estudiante para dar likes o valoraciones accidentales, el dueño legítimo de la cuenta puede corregirlo al iniciar sesión. Las métricas de impacto del emprendedor incorporan adicionalmente un umbral de intención que amortigua este tipo de interacciones accidentales.

**Almacenamiento de imágenes con Cloudinary:**

Todas las imágenes de anuncios se almacenan en Cloudinary, servicio de almacenamiento y CDN en la nube, para garantizar la persistencia de archivos independientemente de los reinicios del servidor de Railway. Antes de que la imagen salga del dispositivo del usuario, el frontend la procesa con la biblioteca browser-image-compression para garantizar que ningún archivo supere los 500 KB y que su dimensión máxima no exceda 1,200 px en su lado más largo. Esto reduce el tamaño de los uploads, optimiza el consumo de créditos de Cloudinary y mejora el tiempo de carga del feed en redes móviles.

**Moderación de contenido híbrida (IA + humano):**

La IA actúa exclusivamente como filtro de primer nivel: detecta, bloquea provisionalmente y envía a la cola de revisión del administrador, pero nunca toma decisiones de sanción autónomas. El flujo es el siguiente: cuando un emprendedor sube un anuncio, el sistema ejecuta simultáneamente tres verificaciones automatizadas: análisis de imagen con Google Cloud Vision API para detección de contenido inapropiado, análisis de texto (título, descripción, categoría personalizada) con la biblioteca bad-words para filtro de lenguaje ofensivo, y comparación del hash perceptual de la imagen contra la base de hashes almacenados para detección de duplicados. Si alguna de estas verificaciones genera una alerta, la publicación queda en estado "pendiente de revisión" y el administrador recibe el caso en su panel con toda la información necesaria para tomar una decisión informada sobre el contenido y, si corresponde, sobre el usuario.

**Calibración del perceptual hashing:**

El algoritmo dHash genera un valor de 64 bits por imagen. La similitud entre dos imágenes se mide con la distancia de Hamming entre sus hashes: una distancia de 0 indica imágenes idénticas y una distancia mayor indica diferencias visuales crecientes. El umbral de alerta se fija en una distancia de Hamming menor o igual a 10 sobre 64 bits, valor que tolerará variaciones menores como cambios de compresión, ligeros recortes o ajustes de brillo, pero detectará copias directas o sustancialmente iguales. Este umbral permite que dos estudiantes publiquen fotos distintas del mismo tipo de producto (cupcakes de diferentes estudiantes tomados con cámaras diferentes) sin activar la alerta, mientras sí detecta cuando una imagen es reutilizada entre cuentas. Los casos marcados se envían a revisión humana, no se bloquean automáticamente.

**Sistema de categorías de emprendimiento:**

Los anuncios se clasifican mediante una lista desplegable de categorías predefinidas organizadas en tres grupos. El grupo de productos físicos incluye: Alimentos y bebidas, Repostería y postres, Artesanías y manualidades, Ropa y accesorios, Papelería y material escolar, Cosméticos y cuidado personal, y Plantas y decoración. El grupo de servicios incluye: Asesorías académicas y tutorías, Diseño gráfico y digital, Fotografía y video, Desarrollo web y tecnología, Clases particulares (idiomas, música, deporte), Impresión y copiado, y Reparaciones y mantenimiento. El grupo de organizaciones estudiantiles incluye: Evento cultural, Evento deportivo, Convocatoria o concurso, Comunicado oficial, y Actividad de voluntariado. Adicionalmente existe la opción "Otro" que habilita un campo de texto libre sujeto al mismo filtro de lenguaje inapropiado que aplica a los demás textos del sistema. Esta lista es provisional y podrá ajustarse antes de la fase de desarrollo.

**Sistema de métricas con umbral de intención:**

El panel de gestión del emprendedor presenta gráficas de alcance e impacto de sus proyectos. Para garantizar la calidad estadística de estas métricas, el sistema aplica un umbral de intención: una interacción de like o valoración que sea revertida por el mismo usuario en un período menor a 5 segundos se considera una interacción accidental y se excluye del cómputo de las métricas. Este criterio es análogo al que plataformas como TikTok aplican para filtrar reproducciones no intencionales, y permite que las métricas reflejen el engagement genuino de los usuarios incluso en un entorno de scroll rápido donde los toques accidentales son frecuentes en pantallas móviles.

**Notificaciones al emprendedor:**

El sistema de notificaciones opera a través de un panel de avisos interno dentro del área de gestión del emprendimiento, sin uso de correo electrónico ni notificaciones push. Este panel informa al emprendedor sobre el estado de sus anuncios (aprobado, pendiente de revisión, rechazado) y sobre la proximidad del vencimiento de la vigencia de sus publicaciones activas.

**Modelo de datos Proyecto / Anuncio:**

Un emprendedor puede tener múltiples proyectos registrados simultáneamente. Cada proyecto puede contener múltiples anuncios, cada uno con una fecha de vigencia programable de forma independiente. No existe un estado de "borrador": cuando la vigencia de un anuncio vence, sus datos e imagen se eliminan de la base de datos, pero el proyecto al que pertenece se conserva para preservar la trayectoria del emprendedor en su portafolio. Los proyectos pueden ser eliminados definitivamente o puestos en estado "suspendido" por el emprendedor. Los límites exactos de número de proyectos por usuario y de anuncios por proyecto se definirán en el SRS. El feed del mural es una experiencia de visualización rápida sin funcionalidad de guardar favoritos; la interacción se limita a valoraciones y likes.

**Componentes técnicos adicionales:**

El sistema incluye generación de código QR vinculado a la URL de la plataforma para colocación en los tableros físicos existentes, configuración de Docker y docker-compose para el entorno de desarrollo reproducible, pipeline CI/CD mediante GitHub Actions con despliegue automático a Railway.app, e implementación de logging y métricas de aplicación.

## 2.2 Fuera del alcance

Quedan explícitamente fuera del alcance de esta versión los siguientes elementos:

La integración con bases de datos o sistemas internos de la universidad; la verificación oficial de existencia de matrícula estudiantil (solo se valida el formato); la pasarela de pagos o cualquier transacción económica entre usuarios; la aplicación móvil nativa para iOS o Android; el módulo de mensajería interna entre usuarios; la funcionalidad de guardar anuncios como favoritos; el sistema de publicidad pagada o monetización; las funcionalidades de red social avanzada; la expansión a otras unidades del estado de Sinaloa; el estado de "borrador" рага anuncios no publicados; la exposición directa del número de WhatsApp en texto plano en cualquier capa del sistema accesible desde el cliente; y las páginas completas de perfil del emprendedor con biografía, foto y trayectoria (los campos bio_short y profile_photo se reservan en el modelo de datos como preparación para una v2.0 pero no se implementan en esta versión).

## 2.3 Entregables del proyecto

ENT-01 Código fuente completo versionado en repositorio Git, etiquetado v1.0.
ENT-02 Aplicación web funcional desplegada en producción (Railway.app).
ENT-03 Imagen Docker y configuración docker-compose para el entorno de desarrollo.
ENT-04 Pipeline CI/CD configurado y operativo (GitHub Actions → Railway.app).
ENT-05 Documentación técnica: SRS, SAD, DDC, STP, STD.
ENT-06 Documentación de usuario: Manual de Usuario, README técnico, Manual de Operaciones.
ENT-07 Documentación de mantenimiento: Change Log, Bug Reports, Release Notes.
ENT-08 Código QR en PNG de alta resolución para colocación en tableros físicos.
ENT-09 Tablero Jira con el registro completo de gestión del proyecto.

## 2.4 Criterios de aceptación

1. La aplicación carga correctamente en dispositivos móviles (iOS/Android) y navegadores de escritorio modernos (Chrome, Firefox, Safari) con un tiempo de respuesta promedio menor a 3 segundos en conexión móvil estándar.
2. El sistema soporta hasta 3,000 cuentas de usuario registradas.
3. Ninguna imagen subida se pierde ante un reinicio del servidor de Railway, siendo recuperable desde Cloudinary.
4. Ningún archivo de imagen procesado por el cliente supera los 500 KB al momento del upload.
5. El algoritmo de perceptual hashing detecta correctamente el 100% de las imágenes idénticas y el 100% de las imágenes sustancialmente similares definidas en los escenarios de prueba del STD, sin generar falsos positivos en el conjunto de imágenes temáticamente similares pero visualmente distintas del mismo conjunto de prueba.
6. La moderación de contenido bloquea el 100% del contenido marcado como ofensivo en los escenarios de prueba.
7. El número de WhatsApp de ningún emprendedor es visible como texto plano en ninguna respuesta de la API ni en ninguna vista del sistema desplegado.
8. La validación de formato de matrícula rechaza correctamente el 100% de los formatos inválidos en las pruebas de frontera.
9. El umbral de intención excluye correctamente las interacciones revertidas en menos de 5 segundos del cómputo de métricas en el 100% de los casos de prueba.
10. Cada emprendedor registrado tiene exactamente un registro en entrepreneur_profiles con display_name no vacío. El display_name aparece correctamente en el feed y en la vista de detalle de cada anuncio.
11. La documentación de todas las fases del SDLC está completa y disponible.

# 3. CRONOGRAMA Y BACKLO POR SPRINT

## 3.1 Metodología

El proyecto adopta una metodología híbrida: planificación general secuencial por fases del SDLC (el documento de cada fase se cierra antes de iniciar la siguiente) con ejecución interna mediante sprints de una semana de lunes a domingo.

Esta combinación es adecuada para un proyecto individual donde la predictibilidad de la cascada garantiza que los documentos de referencia (SRS, SAD, DDC) estén completos y congelados antes de escribir la primera línea de código, mientras que el ritmo semanal de sprints genera el hábito de revisión y registro continuo.

Herramienta de gestión: Jira (tablero Scrum con 7 épicas correspondientes a las 7 fases del SDLC). Cada ítem del backlog de la Sección 3.4 debe existir como tarea en Jira dentro del sprint y la épica correspondientes.

## 3.2 Distribución de fases y duración

| Fase              | Sprints                                                                                                                                                                                         | Duración          | Semanas   | Horas aprox. |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------- | ------------ |
| 1. Planeación     | Planeación                                                                                                                                                                                      | 1 sprint (1 sem)  | Sem 1     | 40 h         |
| 2. Requerimientos | Análisis de requisitos                                                                                                                                                                          | 1 sprint (1 sem)  | Sem 2     | 40 h         |
| 3. Diseño         | Diseño de arquitectura y visual                                                                                                                                                                 | 2 sprints (2 sem) | Sem 3–4   | 80 h         |
| 4. Desarrollo     | Infraestructura, Base de datos, Módulos de seguridad, Backend API, Módulo moderación y admin, Frontend, Plan de pruebas, Ejecución de pruebas, Despliegue en producción, Mantenimiento y cierre | 7 sprints (7 sem) | Sem 5–11  | 280 h        |
| 5. Testing        | TEST-S1, TEST-S2                                                                                                                                                                                | 2 sprints (2 sem) | Sem 12–13 | 80 h         |
| 6. Implementación | IMP-S1                                                                                                                                                                                          | 1 sprint (1 sem)  | Sem 14    | 40 h         |
| 7. Mantenimiento  | MNT-S1                                                                                                                                                                                          | 1 sprint (1 sem)  | Sem 15    | 40 h         |
| TOTAL             | 15 sprints                                                                                                                                                                                      | 15 semanas        | 4 meses   | 600 h        |

## 3.3 Hitos del proyecto

| ID      | Descripción                                 | Criterio de cierre                                                   | Sprint de cierre |
| ------- | ------------------------------------------- | -------------------------------------------------------------------- | ---------------- |
| HITO-01 | PMP v1.x aprobado y Jira configurado        | PMP en repositorio + tablero Jira con épicas y sprints creados       | Fin sprint 1     |
| HITO-02 | SRS completo y aprobado                     | SRS v1.x en repositorio + revisión del asesor                        | Fin sprint 2     |
| HITO-03 | SAD y DDC completos (diseño cerrado)        | SAD + DDC en repositorio + wireframes en Figma                       | Fin sprint 4     |
| HITO-04 | Infraestructura operativa                   | Docker + CI/CD + Railway + Cloudinary respondiendo en staging        | Fin sprint 6     |
| HITO-05 | Módulos de seguridad implementados          | Checksum + dHash + wa.me con cobertura 100% casos frontera           | Fin sprint 7     |
| HITO-06 | API REST completa y documentada             | Todos los endpoints respondiendo + swagger.json generado             | Fin sprint 9     |
| HITO-07 | Moderación IA integrada y cola operativa    | Vision API + bad-words + hashing en pipeline + panel admin funcional | Fin sprint 10    |
| HITO-08 | Frontend completo e integrado               | Todas las pantallas WF-3.x implementadas e integradas con API        | Fin sprint 11    |
| HITO-09 | Pruebas completadas, STD elaborado          | Cobertura ≥70% + 0 bugs críticos + STD en repositorio                | Fin sprint 13    |
| HITO-10 | Despliegue en producción y QR publicado     | App accesible en Railway.app + QR descargado y distribuido           | Fin sprint 14    |
| HITO-11 | Cierre del proyecto, documentación completa | Todos los entregables ENT-01 a ENT-09 verificados en repositorio     | Fin sprint 15    |

## 3.4 Backlog detallado por sprint

### ÉPICA 1 - PLANEACIÓN

#### SPRINT 1

- [x] Redactar y revisar el PMP completo (este documento en su versión final)
- [x] Crear el repositorio en GitHub con la estructura de carpetas del proyecto (backend/, frontend/, docs/, .github/workflows/)
- [x] Configurar la protección de la rama main: requerir PR para mergear, prohibir push directo
- [x] Crear el archivo .gitignore con exclusiones para node_modules, .env, dist/ y build/
- [x] Crear el archivo .env.example con todas las variables de entorno del proyecto documentadas (sin valores secretos)
- [x] Configurar ESLint con la guía de estilo de Airbnb en el proyecto (instalar eslint-config-airbnb, crear .eslintrc.js)
- [x] Configurar el tablero Jira: crear el proyecto, las 7 épicas por fase del SDLC y la estructura de sprints de 1 semana cada uno
- [x] Poblar el Sprint 1 en Jira con sus tareas y marcarlas como completadas
- [x] Documentar el stack tecnológico seleccionado en el [README.md](http://readme.md/) inicial
- [x] HITO-01: PMP aprobado y repositorio configurado

### ÉPICA 2 - REQUERIMIENTOS

#### SPRINT 2

- [x] Redactar el SRS completo (módulos 1–8, RF-01 a RF-40, RN-01 a RN-13, RNF-01 a RNF-17, con todos los casos de uso UC-01 a UC-07)
- [x] Construir la matriz de trazabilidad completa RF ↔ UC ↔ RN
- [x] Confirmar y documentar la lista definitiva de 20 categorías predefinidas (puede modificarse antes de Development sin proceso formal de cambios)
- [x] Revisar el SRS y aprobarlo como línea base del proyecto: a partir de este punto, cualquier cambio requiere el proceso de la Sección 5.2
- [x] Poblar el Sprint 2 en Jira con sus tareas
- [x] HITO-02: SRS completo y aprobado

### ÉPICA 3 - DISEÑO

#### SPRINT 3

- [x] Redactar el SAD completo (C4 Level 1–3, diagramas de secuencia SEQ-01 a SEQ-03, modelo ER, ADR-01 a ADR-09)
- [x] Crear el diagrama C4 Level 1 (Contexto del sistema) en Figma o [draw.io](http://draw.io/)
- [x] Crear el diagrama C4 Level 2 (Contenedores)
- [x] Crear el diagrama C4 Level 3 (Componentes del backend, COMP-01 a COMP-12)
- [x] Crear el diagrama entidad-relación completo (todas las tablas con sus atributos, claves foráneas y cardinalidades)
- [x] Crear los 3 diagramas de secuencia (SEQ-01: publicar anuncio con moderación, SEQ-02: login emprendedor, SEQ-03: reporte y shadowban)
- [x] Redactar y documentar los 9 ADRs (ADR-01 a ADR-09) con contexto, alternativas consideradas y justificación de la decisión
- [x] Verificar que todos los requisitos del SRS tienen trazabilidad en el SAD
- [x] Poblar el Sprint 3 en Jira

#### SPRINT 4

- [x] Redactar el DDC completo (sistema de diseño, wireframes textuales, especificación OpenAPI 3.0 de todos los endpoints)
- [x] Definir la paleta de colores completa y verificar contraste WCAG 2.1 nivel AA (4.5:1) para cada par texto/fondo
- [x] Diseña los wireframes en Figma:
      · WF-3.1.1 Feed Principal (visitante)
      · WF-3.1.2 Detalle de Anuncio (visitante)
      · WF-3.2.1 Pantalla de Bienvenida
      · WF-3.2.2 Registro como Estudiante
      · WF-3.2.3 Registro como Emprendedor (con campo display_name)
      · WF-3.2.4 Inicio de Sesión
      · WF-3.2.5 Reclamo de Matrícula
      · WF-3.3.1 Feed Autenticado con Filtros
      · WF-3.3.2 Modal de Reporte
      · WF-3.4.1 Panel Principal del Emprendedor
      · WF-3.4.2 Detalle de Proyecto y Portafolio
      · WF-3.4.3 Crear Nuevo Anuncio
      · WF-3.4.4 Panel de Notificaciones
      · WF-3.5.1 Cola de Moderación (admin)
      · WF-3.5.2 Comparativa de Imágenes (hash)
      · WF-3.5.3 Generador de Código QR
- [x] Elaborar el draft de la especificación OpenAPI 3.0 de todos los endpoints (este archivo swagger.json se completará definitivamente durante Development)
- [x] Revisar y aprobar SAD + DDC: congelar el diseño antes de iniciar el código (cambios de diseño a partir de aquí requieren proceso de la Sección 5.2)
- [x] Poblar el Sprint 4 en Jira
- [x] HITO-03: SAD y DDC completos, diseño cerrado

### ÉPICA 4 - DESARROLLO

#### SPRINT 5

- [x] Crear el Dockerfile del backend (imagen base Node.js LTS, build multi-stage para separar dependencias de desarrollo y producción)
- [x] Crear el docker-compose.yml con dos servicios: api (backend) y db (PostgreSQL)
- [x] Verificar que el entorno local levanta correctamente con docker-compose up y que el backend conecta con la base de datos
- [x] Crear el proyecto en Railway.app y conectar el repositorio de GitHub
- [x] Provisionar la base de datos PostgreSQL en Railway.app y obtener DATABASE_URL
- [x] Crear la estructura base del proyecto Express: app.js, routes/, controllers/, services/, middleware/, utils/
- [x] Configurar los middlewares globales: CORS, cookie-parser, morgan (logging), helmet (headers de seguridad), express-rate-limit (10 intentos/15 min en /auth)
- [x] Crear el GitHub Actions workflow de lint: se dispara en cada push a cualquier rama; falla el workflow si ESLint detecta errores
- [x] Verificar que el workflow de lint detecta correctamente un error intencional de ESLint antes de continuar
- [x] Poblar el Sprint 5 en Jira

#### SPRINT 6

- [x] Crear la cuenta de Cloudinary y configurar las credenciales como variables de entorno en Railway.app (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET)
- [x] Crear la cuenta de Google Cloud, activar la API de Cloud Vision y obtener la API key; configurarla como variable de entorno en Railway
- [x] Configurar todas las variables de entorno de producción en [Railway.app](http://Railway.app) (verificar que ningún secreto está en el código fuente del repositorio)
- [x] Implementar el endpoint de salud: GET /health → {status:'ok', dbConnected:bool}
- [x] Completar el pipeline CI/CD en GitHub Actions:
      Job 1: lint (ESLint)
      Job 2: test (Jest, requiere que Job 1 pase)
      Job 3: deploy a Railway (requiere que Jobs 1 y 2 pasen, solo en push a main)
- [x] Ejecutar el primer despliegue exitoso en producción
- [x] Verificar el despliegue con smoke test manual: GET /health → HTTP 200
- [x] Poblar el Sprint 6 en Jira
- [x] HITO-04: Infraestructura operativa

#### SPRINT 7

- [x] Implementar el módulo checksum de matrícula como función pura exportable:
      isValidMatricula(str) → boolean
      Reglas: exactamente 8 dígitos numéricos, primer dígito = 2
- [x] Escribir tests unitarios del checksum cubriendo el 100% de casos de frontera:
      · Matrícula válida (ej. 20240001)
      · 7 dígitos (muy corta)
      · 9 dígitos (muy larga)
      · 8 dígitos con primer dígito ≠ 2 (ej. 30240001)
      · Contiene letras (ej. 2024A001)
      · Contiene espacios
      · Cadena vacía
      · null / undefined
- [x] Verificar que la cobertura del módulo checksum es 100%
- [x] Implementar el módulo dHash con la biblioteca sharp: computeHash(imageBuffer) → string hexadecimal de 64 bits
- [x] Implementar la función de comparación: hammingDistance(hash1, hash2) → número (0–64)
- [x] Escribir tests unitarios del dHash:
      · Misma imagen dos veces → distancia 0
      · Imagen con leve variación de brillo → distancia ≤ 10
      · Imagen completamente diferente → distancia > 10
      · Imagen redimensionada levemente → distancia ≤ 10
      · Dos fotos distintas del mismo tipo de producto → distancia > 10
      (caso de falso positivo que el umbral debe tolerar)
- [x] Verificar que la cobertura del módulo dHash es 100% en casos de frontera
- [x] Implementar el WhatsApp Link Service (COMP-09): generateWaLink(phoneNumber) → "[https://wa.me/[número]](https://wa.me/%5Bn%C3%BAmero%5D)"
- [x] La función no debe exponer el número en ningún otro formato
- [x] Verificar en test que ninguna llamada a generateWaLink devuelve el número en texto plano como parte del string (solo como fragmento de URL [wa.me](http://wa.me/))
- [x] Poblar el Sprint 7 en Jira
- [x] HITO-05: Módulos de seguridad implementados y verificados

#### SPRINT 8

- [x] Crear el archivo schema.sql con las tablas del primer bloque: users, entrepreneur_profiles, projects, categories (con todos los constraints, ENUMs y relaciones del SAD Sección 6.2)
- [x] Ejecutar la migración inicial en Railway.app y verificar la estructura de las tablas en la base de datos de producción
- [x] Crear el archivo seed.sql y poblar la tabla categories con las 20 categorías predefinidas (+ CAT-00 "Otro")
- [x] Implementar POST /auth/register/student:
      · Validar formato de matrícula con el módulo checksum
      · Verificar unicidad de matrícula en la tabla users
      · Crear el registro con role='visitor_registered'
- [x] Implementar POST /auth/register/entrepreneur:
      · Validar matrícula, contraseña (≥8 chars), WhatsApp y display_name
      · Aplicar filtro bad-words al display_name
      · Ejecutar transacción atómica: INSERT en users + INSERT en entrepreneur_profiles (si cualquiera falla, revertir ambas)
      · Verificar aceptación del aviso de privacidad (privacy_accepted = true)
- [x] Implementar POST /auth/login para los 3 roles:
      · ROL-02: solo matrícula, sin contraseña
      · ROL-03/04: matrícula + contraseña (bcrypt.compare)
      · Emitir JWT en cookie HttpOnly + Secure + SameSite=Strict
      · No incluir whatsapp_number en el payload del JWT
- [x] Implementar POST /auth/logout:
      · Sobrescribir la cookie con valor vacío y maxAge: 0
- [x] Implementar POST /auth/claim-matricula:
      · Crear registro en claim_tickets con la matrícula en disputa, WhatsApp del reclamante y timestamp
- [x] Implementar el middleware de autenticación:
      · Verificar la cookie JWT en cada solicitud protegida
      · Adjuntar el usuario decodificado a req.user
      · Retornar HTTP 401 si la cookie está ausente o expirada
      · Retornar HTTP 403 si la cuenta está suspendida
- [x] Crear la ruta GET /privacy con el HTML estático del aviso de privacidad (LFPDPPP: identidad del responsable, datos recabados, finalidad, ARCO)
- [x] Escribir tests de integración para todos los endpoints de /auth:
      · Registro exitoso de estudiante y emprendedor
      · Registro con matrícula inválida → HTTP 400
      · Registro con matrícula duplicada → HTTP 409
      · Registro de emprendedor con display_name ofensivo → HTTP 400
      · Login exitoso de cada rol
      · Login con contraseña incorrecta → HTTP 401
      · Acceso a ruta protegida sin cookie → HTTP 401
- [x] Poblar el Sprint 8 en Jira

#### SPRINT 9

- [x] Crear el archivo de migración para las tablas restantes:
      announcements, image_hashes, likes, ratings, reports,
      moderation_queue, notifications, claim_tickets
- [x] Ejecutar la migración en Railway.app y verificar la estructura
- [x] Implementar COMP-03 Feed Controller:
      · GET /announcements: feed paginado por cursor, 20 anuncios por bloque
      (SELECT ... WHERE id < $cursor ORDER BY id DESC LIMIT 20)
      · Parámetros de query: cursor (id del último anuncio recibido),
      category (filtro opcional por categoría)
      · El campo whatsapp_number jamás debe aparecer en la respuesta JSON
      · GET /announcements/:id: detalle completo + generación del enlace [wa.me](http://wa.me/)
      (solo si el usuario está autenticado; de lo contrario campo nulo)
- [x] Implementar COMP-04 Announcement Controller (sin moderación IA por ahora):
      · POST /announcements: crear anuncio con estado temporal 'active' (placeholder
      para el pipeline de moderación que se integrará en Sprint 10)
      · PATCH /announcements/:id: editar título, descripción, categoría, vigencia
      · DELETE /announcements/:id: eliminar anuncio (sin Cloudinary por ahora)
- [x] Implementar CRUD de proyectos:
      · GET /projects: lista todos los proyectos del emprendedor autenticado
      · POST /projects: crear proyecto, validar que el emprendedor tiene < 5 activos
      (HTTP 409 si el límite está alcanzado)
      · GET /projects/:id: detalle con lista de anuncios y métricas resumidas
      · PATCH /projects/:id: editar nombre, descripción, categoría
      · PATCH /projects/:id/status: cambiar estado entre 'active' y 'suspended'
      · DELETE /projects/:id: eliminar proyecto (y todos sus anuncios)
- [x] Implementar COMP-05 Interaction Controller:
      · POST /announcements/:id/like: toggle (crear si no existe, eliminar si existe)
      Registrar created_at; si se revierte, registrar reverted_at y calcular
      diferencia; si < 5,000 ms → is_accidental = true
      · POST /announcements/:id/rating: crear o actualizar valoración 1–3
      Con la misma lógica de timestamp para el umbral de intención
      · DELETE /announcements/:id/rating: retirar valoración activa
- [x] Implementar COMP-06 Report Controller (sin lógica de shadowban por ahora):
      · POST /announcements/:id/report: registrar reporte con reason
      Verificar que el usuario no ha reportado ya este anuncio (HTTP 409)
      Contar reportes únicos y, si llega a 3, insertar en moderation_queue
      con trigger_type='report_threshold' y urgency_alert_at=NOW()
- [x] Implementar COMP-10 Notification Service:
      · GET /notifications: listar todas las notificaciones del usuario autenticado
      ordenadas por fecha descendente
      · PATCH /notifications/:id/read: marcar una notificación como leída
      · PATCH /notifications/read-all: marcar todas como leídas
- [x] Implementar COMP-12 Metrics Service:
      · Endpoint de métricas por proyecto: likes válidos (is_accidental=false),
      valoración promedio (excluyendo accidentales), vistas, evolución temporal
- [x] Implementar el job de expiración de anuncios con node-cron:
      · Se ejecuta cada hora
      · Busca anuncios con expires_at <= NOW() y status='active'
      · Actualiza estado a 'expired', crea notificación interna al emprendedor
      (la eliminación de Cloudinary se conectará en Sprint 10)
- [x] Escribir tests de integración para:
      · Paginación por cursor (verificar que el cursor funciona correctamente)
      · Límite de 5 proyectos (el sexto intento debe devolver HTTP 409)
      · Like y su reversión: caso < 5,000 ms (is_accidental=true) y caso ≥ 5,000 ms (is_accidental=false)
      · Reporte duplicado del mismo usuario en el mismo anuncio (HTTP 409)
      · Métricas excluyendo interacciones accidentales
- [x] Poblar el Sprint 9 en Jira
- [x] HITO-06: API REST completa y documentad

#### SPRINT 10

- [x] Implementar la integración con Google Cloud Vision API en COMP-07:
      · Función analyzeImage(imageBuffer) → {flagged: bool, reason: string|null}
      · Categorías a detectar: adult, violence, racy (umbral: LIKELY o VERY_LIKELY)
      · Timeout de 8 segundos; si se agota → devolver {flagged:true,
      reason:'vision_api_timeout'} (el anuncio va a revisión con ese motivo)
- [x] Implementar el contador de uso de Vision API:
      · Registrar cada llamada en un contador mensual
      · Si el contador alcanza el 80% de 1,000 unidades → registrar alerta en el
      log del servidor y activar el fallback de revisión manual
- [x] Implementar el filtro de lenguaje ofensivo con bad-words en COMP-07:
      · Función filterText(text) → {flagged: bool, terms: string[]}
      · Aplicar a: título + descripción + custom_category del anuncio
- [x] Integrar el módulo dHash al pipeline de moderación en COMP-07:
      · Calcular el hash de la nueva imagen
      · Comparar contra todos los hashes en image_hashes usando hammingDistance
      · Si alguna distancia ≤ 10 → {flagged:true, reason:'phash', matchId: id}
- [x] Implementar COMP-08 Storage Service:
      · uploadToCloudinary(imageBuffer) → {url: string, public_id: string} (ambos campos se guardan en la tabla announcements)
      · deleteFromCloudinary(public_id) → void
- [x] Conectar el pipeline de moderación completo al endpoint POST /announcements
      (reemplaza el placeholder del Sprint 9):
      · Los tres filtros se ejecutan en paralelo (Promise.all)
      · Si NINGUNO marca alerta → upload a Cloudinary → status='active'
      · Si ALGUNO marca alerta → upload provisional a Cloudinary → status='pending_review'
      → insertar en moderation_queue con trigger_type y trigger_detail
- [x] Actualizar DELETE /announcements/:id y el job de expiración para invocar deleteFromCloudinary(cloudinary_id) antes de eliminar el registro
- [x] Implementar la lógica de shadowban en COMP-06:
      · Job de node-cron que se ejecuta cada hora
      · Busca en moderation_queue donde: urgency_alert_at IS NOT NULL, admin_action IS NULL, shadowban_at IS NULL,
      Y NOW() - urgency_alert_at >= INTERVAL '12 hours'
      · Para cada caso, verifica que el anuncio tiene ≥ 5 reportes únicos
      · Si se cumplen ambas condiciones: UPDATE announcements SET status='shadowban',
      UPDATE moderation_queue SET shadowban_at=NOW(),
      INSERT notifications (type='shadowban') al emprendedor
- [x] Implementar el job de restauración automática del shadowban:
      · Otro job de node-cron (cada hora)
      · Busca anuncios con status='shadowban', admin_action IS NULL, y moderation_queue.shadowban_at + INTERVAL '48 hours' <= NOW()
      · Restaura a status='active', genera notificación al emprendedor
- [x] Implementar COMP-11 Admin Controller:
      · GET /admin/moderation-queue: lista todos los anuncios en pending_review y shadowban, ordenados: urgentes primero (urgency_alert_at IS NOT NULL), luego por fecha de creación. Incluye motivo, datos del emprendedor y, para casos de hashing, la imagen existente para comparación visual
      · PATCH /admin/announcements/:id/approve: status='active', notificación al emprendedor, registra admin_id y resolved_at en moderation_queue
      · POST /admin/announcements/:id/reject: status='rejected', eliminar imagen de Cloudinary, notificación al emprendedor con el motivo
      · POST /admin/users/:id/suspend: is_suspended=true en users
      · GET /admin/claim-tickets: lista tickets con status='pending'
      · PATCH /admin/claim-tickets/:id/resolve: status='resolved'
      · GET /admin/qr: genera el QR con la biblioteca qrcode apuntando a la URL
      de producción y lo devuelve como PNG
- [x] Escribir tests de integración para el pipeline de moderación:
      · Anuncio que pasa los 3 filtros → status='active'
      · Anuncio que activa el filtro de imagen → status='pending_review'
      · Anuncio que activa bad-words → status='pending_review'
      · Anuncio con imagen similar (hash ≤ 10) → status='pending_review'
      · Vision API con timeout → status='pending_review' (reason='vision_api_timeout')
      · Aprobar anuncio pendiente → status='active'
      · Rechazar anuncio pendiente → status='rejected' + imagen eliminada de Cloudinary
- [x] Generar el archivo swagger.json definitivo con la especificación OpenAPI 3.0 de todos los endpoints (lo sirve Express en GET /api-docs)
- [x] Poblar el Sprint 10 en Jira
- [x] HITO-07: Moderación IA integrada y cola de admin operativa

#### SPRINT 11

- [ ] Inicializar el proyecto React (Create React App o Vite) e instalar dependencias: Bootstrap 5, browser-image-compression
- [ ] Configurar las variables de entorno del frontend (.env con REACT_APP_API_URL apuntando al backend en Railway)
- [ ] Implementar el sistema de diseño base:
      · Variables CSS con los tokens de color (BG_BASE, PRIMARY, ACCENT, etc.)
      · Configuración del tema oscuro global
      · Importar fuente Inter desde Google Fonts
- [ ] Implementar los componentes reutilizables:
      · AnnouncementCard (tarjeta del feed con imagen, título, categoría, likes, rating, nombre del emprendedor desde display_name)
      · CategoryBadge (chip de categoría con color por grupo)
      · StarRating (3 estrellas interactivas + modo solo lectura)
      · LikeButton (toggle con animación de pop y contador)
      · StatusBadge (estado del anuncio con color semántico)
      · NotificationDot (punto rojo sobre ícono de notificaciones)
      · ImageUploader (zona de drag/tap, compresión con browser-image-compression, barra de progreso, preview)
      · ReportModal (lista de motivos, confirmación, manejo de reporte duplicado)
      · ToastNotification (feedback flotante de acciones)
- [ ] Implementar WF-3.1.1: Feed Principal
      · Scroll infinito con paginación por cursor (llamada al API al llegar al 80% del scroll para cargar el bloque siguiente)
      · Skeleton loading mientras carga
      · En modo visitante: StarRating y LikeButton en modo readonly con tooltip "Regístrate para valorar"
- [ ] Implementar WF-3.1.2: Detalle de Anuncio
      · Vista completa con imagen, descripción, enlace [wa.me](http://wa.me/) (solo para usuarios autenticados), botón de reporte (oculto para ROL-01)
- [ ] Implementar WF-3.2.x: Flujos de autenticación
      · Pantalla de bienvenida con selección de tipo
      · Registro como estudiante (checksum en tiempo real)
      · Registro como emprendedor (campo display_name obligatorio con filtro bad-words al perder el foco, checkbox de aviso de privacidad obligatorio)
      · Inicio de sesión (contraseña opcional, manejo de cuenta suspendida)
      · Flujo de reclamo de matrícula
- [ ] Implementar WF-3.3.1: Feed autenticado con filtros
      · Chips de categoría en scroll horizontal bajo la NavBar
      · LikeButton y StarRating interactivos con lógica del umbral de intención (registra timestamp de cada acción; si el mismo usuario la revierte en menos de 5 segundos, la marca como accidental sin feedback visual especial)
- [ ] Implementar WF-3.3.2: Modal de reporte de anuncio
- [ ] Implementar WF-3.4.x: Panel completo del emprendedor
      · WF-3.4.1: Panel principal (lista de proyectos, contadores, acciones)
      · WF-3.4.2: Detalle de proyecto con anuncios, portafolio e historial
      · WF-3.4.3: Formulario de creación de anuncio con ImageUploader y selector de vigencia
      · WF-3.4.4: Panel de notificaciones con los 5 tipos de mensaje
- [ ] Implementar WF-3.5.x: Panel de administrador
      · WF-3.5.1: Cola de moderación ordenada por urgencia con badge pulsante para anuncios en alerta de urgencia (RF-37)
      · WF-3.5.2: Vista de comparativa lado a lado para casos de hashing
      · WF-3.5.3: Generador de QR con botón de descarga PNG
- [ ] Configurar el manifest.json para PWA:
      · name: "Mural Maz Lince", íconos en múltiples resoluciones, theme_color: #961749, display: "standalone"
- [ ] Configurar el Service Worker:
      · Cache-First para recursos estáticos (HTML, CSS, JS, íconos)
      · Network-First para todas las llamadas a la API del feed
      · Fallback de feed cacheado cuando no hay conexión
- [ ] Integrar el frontend con todos los endpoints del backend en Railway y verificar que todos los flujos funcionan en producción
- [ ] Elaborar la documentación del código fuente (JSDoc en funciones clave de los módulos críticos: checksum, dHash, moderación, métricas)
- [ ] Poblar el Sprint 11 en Jira
- [ ] HITO-08: Frontend completo e integrado

### EPICA 5 - TESTING

#### SPRINT 12

- [ ] Elaborar el STP (Software Test Plan) completo:
      · Estrategia de pruebas, alcance, herramientas (Jest + Supertest)
      · Criterios de entrada y salida de cada fase de prueba
      · Definición de severidades de defectos
- [ ] Diseñar los casos de prueba para todos los módulos críticos:
      · Checksum de matrícula: todos los casos de frontera (válidos e inválidos)
      · dHash: imágenes idénticas (dist 0), similares (dist ≤10), distintas (dist >10), falsos positivos (misma temática, visualmente distintas)
      · Umbral de intención: interacción revertida < 5,000 ms (accidental) vs ≥ 5,000 ms (válida)
      · WhatsApp: ningún endpoint de la API devuelve el número como texto plano
      · Compresión: ningún upload al servidor supera 500 KB ni 1,200 px
      · Persistencia: imágenes disponibles en Cloudinary tras reinicio del servidor
      · Shadowban: activación con ≥5 reportes + ≥12h, restauración a las 48h
- [ ] Ejecutar la suite completa de pruebas unitarias (Jest):
      · Verificar cobertura ≥ 70% en el código backend general
      · Verificar cobertura 100% en los módulos críticos: checksum, dHash/hammingDistance, generateWaLink, umbral de intención
- [ ] Ejecutar todas las pruebas de integración de la API REST
- [ ] Ejecutar el caso de prueba de seguridad WhatsApp:
      · Consultar cada endpoint de la API y verificar que ninguna respuesta contiene el número de WhatsApp como texto plano (búsqueda en el JSON)
- [ ] Ejecutar el caso de prueba de compresión client-side:
      · Subir imágenes de distintos tamaños originales y verificar que ningún archivo recibido por el servidor supera los límites
- [ ] Documentar todos los defectos encontrados con severidad, descripción y pasos para reproducir (borrador del STD)
- [ ] Poblar el Sprint 12 en Jira

#### SPRINT 13

- [ ] Ejecutar pruebas end-to-end por caso de uso (flujo principal y alternativo):
      · UC-01: Registrarse como usuario registrado
      · UC-02: Registrarse como emprendedor
      · UC-03: Publicar un anuncio (anuncio aprobado y anuncio en revisión)
      · UC-04: Moderar un anuncio pendiente (aprobar y rechazar)
      · UC-05: Valorar un anuncio (con y sin umbral de intención activo)
      · UC-06: Reclamar matrícula en uso no autorizado
      · UC-07: Reportar un anuncio (hasta alerta de urgencia)
- [ ] Ejecutar pruebas de responsividad en los tres viewports objetivo:
      · 375px (iPhone SE, mínimo requerido)
      · 768px (tablet)
      · 1280px (escritorio)
- [ ] Ejecutar pruebas de compatibilidad de navegadores:
      · Chrome (versión actual), Firefox (versión actual), Safari (versión actual)
- [ ] Ejecutar prueba de persistencia de imágenes:
      · Subir una imagen, provocar el reinicio del servidor (redeploy en Railway), verificar que la imagen sigue disponible en su URL de Cloudinary
- [ ] Ejecutar prueba de rendimiento:
      · Medir el First Contentful Paint del feed en simulación de red 4G lento usando Chrome DevTools (Network throttling → Fast 4G)
      · Verificar que el resultado es ≤ 3 segundos
- [ ] Ejecutar prueba de shadowban (ajustando umbrales temporalmente para prueba):
      · Crear un anuncio, generar ≥ 5 reportes únicos, reducir el umbral de espera a 2 minutos en la variable de entorno, esperar y verificar que el anuncio pasa a shadowban y el emprendedor recibe la notificación interna
- [ ] Corregir todos los defectos críticos y mayores identificados en los Sprints 12 y 13 antes de avanzar a Implementation
- [ ] Completar el STD (Software Test Documentation) con los resultados de todas las pruebas ejecutadas, incluyendo evidencia de los casos de frontera
- [ ] Poblar el Sprint 13 en Jira
- [ ] HITO-09: Pruebas completadas, STD elaborado

### EPICA 6 - IMPLEMENTACIÓN

#### SPRINT 14

- [ ] Verificar que la rama main en GitHub está en el estado final: todos los defectos críticos corregidos, todos los tests pasando, lint sin errores
- [ ] Confirmar que las variables de entorno de producción en Railway.app están correctas y completas (revisar la lista de la Sección 9.2 del SAD)
- [ ] Ejecutar el despliegue final: hacer push a main y esperar que el pipeline de CI/CD complete sin errores (lint → test → deploy)
- [ ] Ejecutar smoke test post-deploy manual:
      · GET /health → HTTP 200
      · Registrar un usuario como visitante y como emprendedor
      · Publicar un anuncio (verificar que pasa por el pipeline de moderación)
      · Verificar el feed como visitante y como usuario autenticado
      · Verificar el enlace [wa.me](http://wa.me/) en la vista de detalle
- [ ] Generar el código QR desde el panel de administración con la URL de producción definitiva
- [ ] Descargar el QR en PNG de 512×512 px listo para impresión
- [ ] Elaborar el Manual de Usuario:
      · Guía visual de uso por cada rol (visitante, estudiante registrado, emprendedor, administrador)
      · Incluye capturas de pantalla de los flujos principales
- [ ] Elaborar el README técnico completo en el repositorio:
      · Descripción del proyecto y stack tecnológico
      · Instrucciones de instalación y configuración local (docker-compose up)
      · Variables de entorno requeridas (con referencia al .env.example)
      · Comandos de desarrollo, lint y test
      · Guía de despliegue en Railway.app
- [ ] Elaborar el Manual de Operaciones:
      · Cómo monitorear el consumo de Railway.app y Cloudinary
      · Cómo responder a la alerta de cuota de Google Cloud Vision (fallback manual)
      · Cómo hacer un backup manual de PostgreSQL con pg_dump
      · Qué hacer si el servicio en Railway.app entra en sleep
- [ ] Etiquetar el commit final en GitHub como release v1.0
- [ ] Verificar uno por uno cada criterio de aceptación de la Sección 2.4 y documentar el resultado de cada verificación
- [ ] Poblar el Sprint 14 en Jira
- [ ] HITO-10: Despliegue en producción y QR publicado

### EPICA 7 - MANTENIMIENTO

#### SPRINT 15

- [ ] Monitorear los logs del servidor en Railway.app durante los primeros 7 días post-lanzamiento (buscar errores 5xx, timeouts, alertas de cuota)
- [ ] Revisar el consumo de Railway.app desde el dashboard:
      · Verificar que el uso de cómputo está dentro del crédito de $5 USD/mes
- [ ] Revisar el consumo de Cloudinary desde la consola:
      · Verificar que el uso de créditos está dentro de los 25 gratuitos/mes
- [ ] Revisar el uso de Google Cloud Vision API:
      · Verificar que no ha superado las 1,000 unidades mensuales
- [ ] Corregir y documentar cualquier bug menor identificado en la primera semana de operación real
- [ ] Elaborar el Change Log v1.0:
      · Registro cronológico de todos los cambios significativos del proyecto desde la v1.0 hasta la v1.4 del PMP y sus equivalentes en los otros docs
- [ ] Elaborar Bug Reports formales para los incidentes registrados durante el desarrollo y la fase de pruebas
- [ ] Elaborar las Release Notes v1.0:
      · Descripción ejecutiva de todas las funcionalidades del sistema
      · Limitaciones conocidas y restricciones de la versión actual
      · Roadmap de v2.0 (campos bio_short y profile_photo, etc.)
- [ ] Elaborar el documento de Lecciones Aprendidas:
      · ¿Qué funcionó según lo planeado?
      · ¿Qué requirió ajuste durante el proceso?
      · ¿Qué riesgos se materializaron y cómo se resolvieron?
      · ¿Qué haría diferente en un proyecto futuro?
- [ ] Archivar toda la documentación final del proyecto en la carpeta /docs del repositorio Git
- [ ] Poblar el Sprint 15 en Jira y marcar todas las tareas como Done
- [ ] Completar el checklist de cierre de la Sección 6.1
- [ ] HITO-11: Cierre del proyecto, documentación completa y archivada

## 3.5 Control del cronograma

El avance se revisa al final de cada sprint comparando los ítems del backlog marcados como completados contra los planificados para ese sprint en Jira.

Umbral de alerta: un retraso mayor a 3 días hábiles respecto al hito de la fase activa activa el proceso de gestión de cambios de la Sección 5.2.

Opciones de respuesta ante un retraso mayor a una semana:
· Priorizar el MVP: el módulo de dHash puede degradarse a comparación por MD5 exacta en una primera entrega, y el umbral de intención puede simplificarse a un boolean sin ventana temporal.
· Reducir el alcance de las pruebas manuales y concentrarse en los casos de prueba automatizados de los módulos críticos.
· Extender el cronograma una semana máximo antes de reportar el cambio.

La adición de los módulos de Cloudinary, compresión client-side, motor de métricas con umbral de intención y panel de notificaciones internas se absorbe dentro del buffer ya contemplado en la distribución de semanas de desarrollo, sin extender el cronograma total.

### Ceremonias Scrum adaptadas al proyecto individual:

| Ceremonia             | Frecuencia            | Duración estimada | Propósito                                                    |
| --------------------- | --------------------- | ----------------- | ------------------------------------------------------------ |
| Sprint Planning       | Inicio de cada sprint | 1 hora            | Seleccionar historias del backlog y descomponerlas en tareas |
| Daily (auto-revisión) | Diario                | 15 minutos        | Registro personal de avance, bloqueos y ajustes del día      |
| Sprint Review         | Cierre de cada sprint | 30 minutos        | Verificar entregables contra criterios de aceptación         |
| Sprint Retrospectiva  | Cierre de cada sprint | 20 minutos        | Registrar qué funcionó, qué mejorar, ajustes al proceso      |

## 3.6 Estructura de Desglose del Trabajo

NIVEL 0 – Proyecto Mural Maz Lince
│
├── 1. PLANNING (Planeación)
│ ├── 1.1 Elaboración del Project Management Plan (PMP)
│ ├── 1.2 Configuración del tablero Jira (épicas, historias, sprints)
│ ├── 1.3 Configuración del repositorio Git (GitHub)
│ └── 1.4 Definición del entorno de trabajo y herramientas
│
├── 2. REQUIREMENTS ANALYSIS (Análisis de Requisitos)
│ ├── 2.1 Levantamiento de requisitos funcionales
│ ├── 2.2 Levantamiento de requisitos no funcionales (seguridad, privacidad,
│ │ rendimiento, usabilidad)
│ ├── 2.3 Definición de casos de uso por rol
│ ├── 2.4 Definición de historias de usuario (User Stories)
│ ├── 2.5 Especificación de reglas de negocio (límites de proyectos/anuncios,
│ │ vigencia, checksum de matrícula, umbral de intención, umbral de
│ │ similitud de hashing, lista de categorías)
│ └── 2.6 Elaboración del Software Requirements Specification (SRS)
│
├── 3. DESIGN (Diseño)
│ ├── 3.1 Diseño de arquitectura del sistema (SAD)
│ │ ├── 3.1.1 Diagrama de arquitectura general (C4 Model – Context/Container)
│ │ ├── 3.1.2 Diseño de la arquitectura backend (API REST)
│ │ ├── 3.1.3 Diseño del modelo de datos relacional
│ │ │ (Usuario, PerfilEmprendedor, Proyecto, Anuncio, HashImagen,
│ │ │ Valoración, Like, Notificación interna, Categoría)
│ │ ├── 3.1.4 Diseño del módulo de validación de matrícula (checksum)
│ │ ├── 3.1.5 Diseño del módulo de perceptual hashing con umbral calibrado
│ │ ├── 3.1.6 Diseño del flujo de moderación híbrida (IA → cola → admin)
│ │ ├── 3.1.7 Diseño de integración con Cloudinary
│ │ ├── 3.1.8 Diseño del módulo de protección WhatsApp ([wa.me](http://wa.me/))
│ │ ├── 3.1.9 Diseño del motor de métricas con umbral de intención
│ │ └── 3.1.10 Decisiones tecnológicas documentadas (ADR)
│ ├── 3.2 Diseño detallado de componentes (DDC)
│ │ ├── 3.2.1 Diagramas de secuencia por caso de uso principal
│ │ ├── 3.2.2 Especificación de endpoints de la API REST (OpenAPI 3.0)
│ │ └── 3.2.3 Wireframes mobile-first (feed, sign-up, panel emprendedor,
│ │ panel admin, detalle de anuncio)
│ └── 3.3 Revisión y aprobación del diseño
│
├── 4. DEVELOPMENT (Desarrollo)
│ ├── 4.1 Configuración del entorno (sem 5–6)
│ │ ├── 4.1.1 Configuración de Docker y docker-compose
│ │ └── 4.1.2 Configuración del pipeline CI/CD (GitHub Actions → Railway.app)
│ ├── 4.2 Módulos de seguridad y validación (sem 7)
│ │ ├── 4.2.1 Implementación del algoritmo de checksum de matrícula
│ │ ├── 4.2.2 Implementación del módulo de perceptual hashing (dHash,
│ │ │ umbral Hamming <= 10)
│ │ └── 4.2.3 Implementación del enmascaramiento WhatsApp ([wa.me](http://wa.me/))
│ ├── 4.3 Desarrollo del backend (sem 8–9)
│ │ ├── 4.3.1 Configuración de Node.js/Express y PostgreSQL en Railway
│ │ ├── 4.3.2 Implementación del modelo de datos relacional
│ │ │ (incluyendo tabla entrepreneur_profiles con display_name
│ │ │ obligatorio y campos bio_short/profile_photo para v2.0)
│ │ ├── 4.3.3 API REST: autenticación y gestión de usuarios por rol
│ │ │ (registro de emprendedor crea users + entrepreneur_profiles)
│ │ ├── 4.3.4 API REST: proyectos, anuncios, vigencia y job de limpieza
│ │ ├── 4.3.5 API REST: categorías, likes, valoraciones con umbral de
│ │ │ intención (ventana de 5 segundos)
│ │ ├── 4.3.6 API REST: notificaciones internas del emprendedor
│ │ ├── 4.3.7 Integración con Cloudinary (upload, transformación automática)
│ │ └── 4.3.8 Implementación de logging y métricas
│ ├── 4.4 Integración del módulo de moderación IA (sem 10)
│ │ ├── 4.4.1 Integración de Google Cloud Vision API (análisis de imagen)
│ │ ├── 4.4.2 Integración de bad-words (filtro de texto)
│ │ ├── 4.4.3 Integración del perceptual hashing al flujo de moderación
│ │ └── 4.4.4 Implementación del panel de cola de revisión (admin)
│ ├── 4.5 Desarrollo del frontend (sem 11)
│ │ ├── 4.5.1 Configuración de React y Bootstrap
│ │ ├── 4.5.2 Implementación de browser-image-compression (compresión
│ │ │ client-side antes del upload, límite 500 KB / 1200 px)
│ │ ├── 4.5.3 Feed con scroll infinito y filtros por categoría
│ │ ├── 4.5.4 Flujo de sign-up con validación de matrícula en tiempo real
│ │ │ y campo display_name obligatorio en registro de emprendedor
│ │ ├── 4.5.5 Panel de gestión del emprendedor (proyectos, anuncios,
│ │ │ vigencia, portafolio, notificaciones internas)
│ │ ├── 4.5.6 Panel de impacto con gráficas filtradas por umbral de intención
│ │ └── 4.5.7 Panel de administración y cola de moderación
│ └── 4.6 Elaboración de la Documentación del Código Fuente
│
├── 5. TESTING (Pruebas)
│ ├── 5.1 Elaboración del Software Test Plan (STP)
│ ├── 5.2 Diseño de casos de prueba, incluyendo:
│ │ - Frontera del checksum de matrícula (válidos e inválidos)
│ │ - Detección de imágenes idénticas, similares y distintas (hashing)
│ │ - Falsos positivos del hashing (imágenes temáticamente similares)
│ │ - Ausencia de número WhatsApp en respuestas de la API
│ │ - Umbral de intención (interacciones dentro y fuera de 5 segundos)
│ │ - Compresión client-side (verificar que ningún upload supere 500 KB)
│ │ - Persistencia de imágenes tras reinicio del servidor
│ ├── 5.3 Ejecución de pruebas unitarias (automatizadas)
│ ├── 5.4 Ejecución de pruebas de integración
│ ├── 5.5 Ejecución de pruebas de sistema y aceptación
│ ├── 5.6 Pruebas de responsividad y compatibilidad móvil
│ └── 5.7 Elaboración del Software Test Documentation (STD)
│
├── 6. IMPLEMENTATION (Implementación)
│ ├── 6.1 Despliegue en Railway.app (producción)
│ ├── 6.2 Configuración de variables de entorno en Railway
│ │ (claves Cloudinary, Google Cloud Vision, PostgreSQL)
│ ├── 6.3 Generación y distribución del código QR
│ ├── 6.4 Elaboración del Manual de Usuario
│ ├── 6.5 Elaboración del README técnico
│ └── 6.6 Elaboración del Manual de Operaciones
│
└── 7. MAINTENANCE (Mantenimiento)
├── 7.1 Monitoreo post-despliegue y resolución de bugs iniciales
├── 7.2 Monitoreo semanal del consumo de Railway.app y Cloudinary
├── 7.3 Elaboración del Change Log
├── 7.4 Elaboración de Bug Reports
└── 7.5 Elaboración de Release Notes (v1.0)

# 4. RECURSOS, COSTOS Y CALIDAD

## 4.1 Recursos tecnológicos

| Recurso                    | Herramienta                  | Licencia            |
| -------------------------- | ---------------------------- | ------------------- |
| Control de versiones       | Git + GitHub                 | Gratuita            |
| Gestión del proyecto       | Jira (Free plan)             | Gratuita            |
| Editor de código           | VS Code                      | Gratuita            |
| Contenedores               | Docker Desktop               | Gratuita (personal) |
| Backend runtime            | Node.js LTS                  | Open source         |
| Framework backend          | Express.js                   | Open source         |
| Base de datos              | PostgreSQL (en Railway)      | Open source         |
| Framework frontend         | React                        | Open source         |
| Framework CSS              | Bootstrap 5                  | Open source         |
| Compresión client-side     | browser-image-compression    | Open source         |
| Almacenamiento de imágenes | Cloudinary (plan gratuito)   | Gratuita            |
| Pruebas backend            | Jest + Supertest             | Open source         |
| Hashing perceptual         | sharp + implementación dHash | Open source         |
| Filtro de lenguaje         | bad-words (npm)              | Open source         |
| Análisis de imágenes IA    | Google Cloud Vision API      | Gratuita (1k/mes)   |
| Documentación API          | Swagger / OpenAPI 3.0        | Open source         |
| Linting                    | ESLint (Airbnb config)       | Open source         |
| CI/CD                      | GitHub Actions               | Gratuita            |
| Hosting + BD               | Railway.app (Hobby)          | Gratuita            |
| Diseño UI/wireframes       | Figma (Free plan)            | Gratuita            |

## 4.2 Presupuesto del proyecto

El costo monetario directo del proyecto en su primer año es de $0 MXN, operando completamente dentro de las capas gratuitas de los servicios seleccionados.

| **Concepto**                    | **Costo** | **Notas**                                                                    |
| ------------------------------- | --------- | ---------------------------------------------------------------------------- |
| Railway.app (Hobby, backend)    | $0 mxn    | $5 USD de crédito mensual incluido                                           |
| PostgreSQL en Railway           | $0 mxn    | Incluido en capa gratuita                                                    |
| Cloudinary (almacenamiento CDN) | $0 mxn    | 25 créditos/mes gratuitos; suficiente para el volumen universitario esperado |
| Dominio web                     | Pendiente | Subdominio .railway.app gratuito; dominio personalizado ~$200–400 MXN/año    |
| Google Cloud Vision API         | $0 mxn    | 1,000 unidades/mes en capa gratuita                                          |
| bad-words (npm)                 | $0 mxn    | Biblioteca open source                                                       |
| Jira, GitHub, Docker, VS Code   | $0 mxn    | Herramientas gratuitas o de plan free                                        |
| TOTAL AÑO 1                     | $0 mxn    | Sujeto a decisión de dominio                                                 |

### Control de Costos

Se monitoreará semanalmente el consumo de Railway.app (desde su dashboard) y de Cloudinary (desde su consola de administración) para verificar que el uso se mantiene dentro de los límites gratuitos. Un contador de uso mensual implementado en el backend alertará al sistema cuando el consumo de Google Cloud Vision alcance el 80% del límite gratuito, activando automáticamente un fallback de revisión manual por el administrador para el análisis de imágenes mientras se restablece el cupo al inicio del siguiente ciclo.

### Proyección de Costos Futuros

La arquitectura contenerizada con Docker garantiza portabilidad total entre proveedores de hosting, protegiendo la inversión de desarrollo ante un eventual cambio de proveedor. En un escenario de adopción amplia con patrocinio institucional, Railway.app ofrece planes de pago escalonados y Cloudinary dispone de planes proporcionales al volumen de uso.

## 4.3 Estándares de calidad

Los estándares de referencia son: ISO/IEC 25010 (SQuaRE) como marco de características de calidad del producto software; la guía de estilo de Airbnb para JavaScript aplicada mediante ESLint; el estándar OpenAPI 3.0 para la documentación de la API; la convención Conventional Commits para mensajes de git; y el principio de minimización de exposición de datos personales para el tratamiento del número de WhatsApp.

El linting automático se ejecuta en cada push dentro del pipeline CI/CD; un build que no pase el linter no avanza al siguiente paso. La cobertura de pruebas unitarias tiene un umbral mínimo general del 70% para el código backend, con requerimiento de cobertura del 100% de casos de frontera para los módulos considerados críticos: checksum de matrícula, perceptual hashing y umbral de intención. Se incluye un caso de prueba automatizado de seguridad que consulta la API y verifica que ninguna respuesta contiene el número de WhatsApp como texto plano. La compresión client-side se verifica con un caso de prueba que confirma que ningún archivo en el directorio de uploads supera los 500 KB. La persistencia de imágenes en Cloudinary se verifica simulando un reinicio del servidor y comprobando que las imágenes previamente subidas siguen siendo accesibles. Las pruebas de responsividad validan la visualización en viewports de 375px (móvil), 768px (tablet) y 1280px (escritorio).

## 4.4 Métricas de Calidad

| MET-01 | Cobertura unitaria general (backend)                                   | >= 70%              |
| ------ | ---------------------------------------------------------------------- | ------------------- |
| MET-02 | Cobertura de módulos críticos (checksum, hashing, umbral de intención) | 100% casos frontera |
| MET-03 | Tiempo de carga de página principal (móvil)                            | <= 3 segundos       |
| MET-04 | Casos de prueba ejecutados / planificados                              | 100%                |
| MET-05 | Bugs críticos abiertos al cierre                                       | 0                   |
| MET-06 | Entregables documentales completos                                     | 100%                |
| MET-07 | WhatsApp expuesto en texto plano en API                                | 0 ocurrencias       |
| MET-08 | Imágenes perdidas tras reinicio del servidor                           | 0                   |
| MET-09 | Archivos que superan 500 KB en upload                                  | 0                   |

# 5. RIESGOS Y CONTROL DE CAMBIOS

Los riesgos se evalúan con una matriz probabilidad × impacto en escala 1–3. Un score de 6 o más activa un plan de contingencia documentado.

## 5.1 Registro de Riesgos

| ID                                                                                                                                                                     | Descripción                                                                                                                                                                                         | Prob. | Impact. | Punt.                                                                                                                                              | Mitigación                                                                                                                                                                                                                                                                                                                                                                     | Contingencia                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RGO-01                                                                                                                                                                 | **Subestimación del tiempo de desarrollo**                                                                                                                                                          |
| La cantidad de módulos con lógica propia (hashing, umbral de intención, Cloudinary, moderación IA) incrementa la superficie de desarrollo respecto a un CRUD estándar. | 3                                                                                                                                                                                                   | 2     | 6       | Cronograma con buffer del 15% por fase. La semana 7 está dedicada exclusivamente a los módulos de seguridad antes de iniciar el código de negocio. | Si el retraso supera 1 semana en cualquier fase, se priorizará el MVP: hashing puede degradarse a comparación MD5 exacta, y el umbral de intención puede simplificarse a un boolean sin ventana temporal en una primera entrega.                                                                                                                                               |
| RGO-02                                                                                                                                                                 | Exceso del límite gratuito de Google Cloud Vision API                                                                                                                                               |
| El límite de 1,000 unidades mensuales podría agotarse ante una oleada de uploads.                                                                                      | 2                                                                                                                                                                                                   | 2     | 4       | Contador de uso con alerta al 80% del límite y activación automática del fallback de revisión manual por administrador.                            | Migración a NSFWJS (modelo de clasificación de imágenes open source ejecutado localmente en el servidor Node.js) como reemplazo sin costo adicional.                                                                                                                                                                                                                           |
| RGO-03                                                                                                                                                                 | **Exceso del límite gratuito de Cloudinary** 25 créditos mensuales son generosos para el contexto universitario, pero una actividad viral o un evento de carga masiva podría aproximarse al límite. | 1     | 3       | 3                                                                                                                                                  | La compresión client-side reduce el tamaño de cada imagen antes del upload, lo que disminuye el consumo de créditos de transformación de Cloudinary. Monitoreo semanal del consumo desde la consola de Cloudinary.                                                                                                                                                             | Reducir temporalmente el límite de imágenes por anuncio de N a 1 hasta que se restablezca el crédito mensual.                                          |
| RGO-04                                                                                                                                                                 | **Exceso del crédito gratuito de Railway.app** Un pico de tráfico o una configuración ineficiente podría agotar los $5 USD/mes.                                                                     | 2     | 2       | 4                                                                                                                                                  | Monitoreo semanal del dashboard. Configurar el servicio para entrar en sleep durante períodos de inactividad prolongada.                                                                                                                                                                                                                                                       | Migración a [Render.com](http://render.com/) (plan gratuito con sleep aceptable para el patrón de uso universitario concentrado en horarios de clase). |
| RGO-05                                                                                                                                                                 | Falsos positivos excesivos en el perceptual hashing Un umbral de Hamming demasiado bajo podría bloquear imágenes legítimas de productos similares vendidos por diferentes estudiantes.              | 2     | 2       | 4                                                                                                                                                  | El umbral se fija en distancia Hamming <= 10 sobre 64 bits, valor validado en los escenarios de prueba del STD con imágenes temáticamente similares pero visualmente distintas. Las alertas no bloquean automáticamente sino que envían el caso a revisión del administrador, por lo que un falso positivo no impide la publicación, solo la retrasa hasta la revisión humana. | Ajustar parámetro HASH_SIMILARITY_THRESHOLD en variables de entorno sin modificar código.                                                              |
| RGO-06                                                                                                                                                                 | Exposición accidental del número WhatsApp en logs o errores                                                                                                                                         | 1     | 3       | 3                                                                                                                                                  | Sanitización de datos personales en el middleware de logging. Caso de prueba automatizado que verifica la ausencia del número en respuestas API.                                                                                                                                                                                                                               | Purgar logs afectados de Railway y rotar credenciales de base de datos de ser necesario.                                                               |
| RGO-07                                                                                                                                                                 | Pérdida de disponibilidad por fallo de Railway.app                                                                                                                                                  | 1     | 3       | 3                                                                                                                                                  | Respaldos periódicos automatizados de la base de datos (pg_dump) almacenados en el repositorio Git o en almacenamiento gratuito externo. La arquitectura Docker permite migración a otro proveedor sin cambios en el código.                                                                                                                                                   | Redesplegar contenedor Docker en Render.com usando el último respaldo pg_dump.                                                                         |

## 5.2 Proceso de Control de Cambios

Todo cambio que afecte el alcance, el cronograma, el presupuesto o la arquitectura del proyecto sigue cinco pasos:

Paso 1: Registrar el cambio como issue "Change Request" en Jira con la
descripción del cambio, la razón que lo motiva y el área afectada.

Paso 2: Analizar el impacto: ¿afecta el cronograma?, ¿afecta la arquitectura?,
¿afecta entregables ya completados que habría que revisar?

Paso 3: Tomar la decisión de aceptar, rechazar o aplazar el cambio.
Documentar la decisión como ADR en el SAD si afecta la arquitectura.

Paso 4: Si se acepta: actualizar los documentos afectados (PMP, SRS, SAD, DDC
según corresponda), incrementar la versión del documento y registrar
el cambio en el historial de versiones del mismo.

Paso 5: Cerrar el issue de Change Request en Jira con la referencia al
documento actualizado.

Cambios que NO requieren este proceso:

· Correcciones de bugs menores.
· Ajustes de estilo visual sin impacto funcional.
· Actualizaciones de versión patch (x.x.N) de dependencias npm.
· Modificaciones a la lista de categorías predefinidas antes de iniciar
el Sprint 8 (su impacto se limita al seed de la base de datos).
Estos cambios se registran únicamente en el commit de Git.

# 6. CIERRE DEL PROYECTO

## 6.1 Checklist de Cierre

El proyecto se considera cerrado cuando todos los ítems siguientes están
marcados como completados:

- [ ] ENT-01: Código fuente completo en GitHub, etiquetado como release v1.0
- [ ] ENT-02: Aplicación web funcional y accesible en producción (Railway.app)
- [ ] ENT-03: Imagen Docker y docker-compose funcionales en entorno local
- [ ] ENT-04: Pipeline CI/CD operativo (push a main → deploy automático)
- [ ] ENT-05: Documentación técnica completa: SRS v1.3, SAD v1.2, DDC v1.1, STP y STD elaborados y archivados en /docs
- [ ] ENT-06: Manual de Usuario, README técnico y Manual de Operaciones en /docs
- [ ] ENT-07: Change Log, Bug Reports y Release Notes v1.0 en /docs
- [ ] ENT-08: Código QR en PNG de alta resolución disponible en /docs/qr
- [ ] ENT-09: Tablero Jira con 100% de tareas en estado Done
- [ ] Todos los criterios de aceptación de la Sección 2.4 verificados y documentados con su resultado
- [ ] Todos los hitos HITO-01 a HITO-11 completados
- [ ] MET-05: Cero bugs críticos o mayores abiertos
- [ ] MET-07: Cero ocurrencias de WhatsApp en texto plano en la API
- [ ] MET-08: Cero imágenes perdidas tras reinicio del servidor
- [ ] Documento de Lecciones Aprendidas redactado y archivado

## 6.2 Lecciones Aprendidas

Al cierre del Sprint 15 se elaborará un documento de Lecciones Aprendidas que registrará de forma reflexiva:

· ¿Qué funcionó exactamente como se planeó?
· ¿Qué módulos o fases requirieron más tiempo del estimado y por qué?
· ¿Qué riesgos del Registro se materializaron y cómo se resolvieron?
· ¿Qué decisiones de arquitectura (ADRs) resultaron correctas en práctica?
· ¿Qué haría diferente en un proyecto similar en el futuro?
· ¿Qué partes de la documentación SDLC resultaron más valiosas como guía
durante el desarrollo?

Este documento es el más personal del conjunto de entregables y el que más
valor aporta para el crecimiento profesional como desarrolladora.

# 7. REFERENCIAS

Airbnb. (s. f.). _Airbnb JavaScript style guide_. GitHub. [https://github.com/airbnb/javascript](https://github.com/airbnb/javascript)

Cloudinary. (s. f.). _Cloudinary documentation: Image upload and transformation_. [https://cloudinary.com/documentation/image_upload_api_reference](https://cloudinary.com/documentation/image_upload_api_reference)

Conventional Commits. (s. f.). _Conventional commits specification v1.0.0_. [https://www.conventionalcommits.org](https://www.conventionalcommits.org/)

Donaldcwl. (s. f.). _browser-image-compression [Software]_. GitHub. [https://github.com/Donaldcwl/browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)

Google. (s. f.). _Google Cloud Vision API: Safe search detection_. [https://cloud.google.com/vision/docs/safesearch](https://cloud.google.com/vision/docs/safesearch)

Organización Internacional de Normalización e Comisión Electrotécnica Internacional. (2011). _Systems and software engineering: Systems and software quality requirements and evaluation (SQuaRE)_ (ISO/IEC Standard No. 25010:2011). [https://www.iso.org/standard/35733.html](https://www.iso.org/standard/35733.html)

Project Management Institute. (2021). _A guide to the project management body of knowledge (PMBOK Guide)_ (7a ed.).

Railway. (s. f.). _Railway.app documentation: Pricing and free tier_. [https://docs.railway.app/reference/pricing](https://docs.railway.app/reference/pricing)

Swagger. (s. f.). _OpenAPI specification 3.0_. [https://swagger.io/specification/](https://swagger.io/specification/)

WhatsApp. (s. f.). _WhatsApp click to chat API (wa.me format)_. [https://faq.whatsapp.com/425647267885092](https://faq.whatsapp.com/425647267885092)

_FIN DEL DOCUMENTO_
