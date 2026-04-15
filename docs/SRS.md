# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
**Proyecto:** Mural Maz Lince
**Versión:** 1.4
**Elaborado por:** Miriam Alanis
**Fecha de elaboración:** Abril 2026
**Basado en:** IEEE 29148:2018 / IEEE 830 (terminología de referencia)

---

## HISTORIAL DE VERSIONES

| Versión | Fecha       | Descripción                                                                                                                                                                                                         | Autor         |
|---------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| 1.0     | Abril 2026  | Versión inicial del SRS                                                                                                                                                                                             | Miriam Alanis |
| 1.1     | Abril 2026  | RF-35: reclamo de matrícula; RF-31 expandido con validación server-side; RNF-03 actualizado; RNF-17 LFPDPPP; UC-06: reclamar matrícula                                                                             | Miriam Alanis |
| 1.2     | Abril 2026  | RNF-02 consolidado con paginación por cursor (20 anuncios/bloque); RF-36: sistema de reportes de anuncios; RF-37: alerta de urgencia al admin; RF-38: shadowban automático temporal; RN-13: parámetros del sistema de reportes; UC-07: reportar anuncio; trazabilidad actualizada | Miriam Alanis |
| 1.3     | Abril 2026  | RF-39: display_name obligatorio en entrepreneur_profiles; RF-40: campos escalables bio_short y profile_photo para v2.0; RF-02 actualizado: registro emprendedor crea dos registros; RF-08 aclarado: nombre en feed desde entrepreneur_profiles.display_name; RNF-17 actualizado; nueva tabla en glosario; UC-02 actualizado; trazabilidad | Miriam Alanis |
| 1.4     | Abril 2026  | Correcciones de consistencia documental: referencia actualizada de PMP v1.2 a v1.4 (Sección 1.4); Sección 2.4 corregida para apuntar al Apéndice A del SRS como ubicación canónica de la lista de categorías (eliminada referencia al Apéndice B del PMP); nota aclaratoria añadida al historial sobre el mecanismo de shadowban (RF-38) como excepción acotada por inacción administrativa, no como sanción autónoma de IA | Miriam Alanis |

---

## SECCIÓN 1. INTRODUCCIÓN

### 1.1 Propósito del documento

Este documento especifica los requisitos de software del sistema Mural Maz Lince, versión 1.4. Está dirigido a la directora del proyecto, al asesor académico de titulación y servirá como referencia técnica para las fases de diseño, desarrollo, pruebas e implementación del ciclo de vida del software.

El documento define de forma precisa y verificable el comportamiento funcional del sistema, sus restricciones de calidad, sus reglas de negocio y los límites de su alcance, de modo que cualquier decisión de diseño o caso de prueba posterior pueda trazarse hasta un requisito identificado aquí.

### 1.2 Alcance del sistema

Mural Maz Lince es una aplicación web mobile-first que digitaliza el tablero de anuncios estudiantil físico de una universidad ubicada en Mazatlán, Sinaloa, México. El sistema permite a los visitantes explorar un feed de anuncios de emprendimientos y comunicados estudiantiles sin necesidad de registro. A los estudiantes registrados con su matrícula les habilita funciones de filtrado y valoración. A los emprendedores registrados con matrícula, contraseña y número de WhatsApp les otorga la gestión completa de sus proyectos comerciales y anuncios con vigencia programable. A los administradores les proporciona un panel de moderación asistido por inteligencia artificial.

El sistema no reemplaza sistemas institucionales de la universidad ni gestiona transacciones económicas. Su objetivo es resolver las limitaciones del tablero físico (ocultamiento de anuncios, deterioro, anonimato, falta de categorización) mediante una plataforma digital accesible, segura y de bajo costo operativo.

### 1.3 Definiciones, acrónimos y abreviaturas

| Término               | Definición                                                                                                                                                                                           |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Anuncio               | Publicación de un emprendedor dentro de un proyecto, compuesta de imagen, título, descripción, categoría y fecha de vigencia. Tiene ciclo de vida propio e independiente del proyecto que lo contiene. |
| Checksum (matrícula)  | Validación local de formato: 8 dígitos, primer dígito = 2. No verifica existencia real del estudiante.                                                                                               |
| dHash                 | Difference Hash. Algoritmo de perceptual hashing que genera una huella digital de 64 bits por imagen.                                                                                                |
| Distancia de Hamming  | Número de bits distintos entre dos hashes. Umbral del sistema: <= 10 sobre 64 bits indica duplicado probable.                                                                                        |
| Emprendedor           | Usuario registrado con matrícula + contraseña + WhatsApp + display_name. Al registrarse se crean simultáneamente un registro en users y uno en entrepreneur_profiles.                                |
| entrepreneur_profiles | Tabla que almacena la identidad pública del emprendedor: display_name (obligatorio en v1.0), bio_short y profile_photo (reservados para v2.0). Separada de users para mantener la separación entre autenticación e identidad pública (ADR-09 del SAD). |
| Feed                  | Vista principal de scroll infinito vertical con todos los anuncios activos ordenados cronológicamente.                                                                                               |
| Proyecto              | Entidad persistente del emprendedor que agrupa anuncios relacionados con un mismo emprendimiento.                                                                                                    |
| RF                    | Requisito Funcional.                                                                                                                                                                                 |
| RNF                   | Requisito No Funcional.                                                                                                                                                                              |
| RN                    | Regla de Negocio.                                                                                                                                                                                    |
| UC                    | Use Case (Caso de Uso).                                                                                                                                                                              |
| Umbral de intención   | Ventana de 5 segundos: una interacción revertida dentro de ese período se clasifica como accidental y se excluye de las métricas de impacto del emprendedor.                                        |
| Vigencia              | Fecha de expiración de un anuncio. Al vencerse, el anuncio y su imagen se eliminan; el proyecto permanece.                                                                                          |
| wa.me                 | URL de WhatsApp (https://wa.me/[número]) que inicia una conversación sin exponer el número como texto plano.                                                                                         |

### 1.4 Referencias

- [1] PMP – Mural Maz Lince v1.4 (documento de gestión del proyecto).
- [2] IEEE 29148:2018 – Systems and Software Engineering – Life Cycle Processes – Requirements Engineering.
- [3] IEEE 830-1998 – Recommended Practice for Software Requirements Specifications.
- [4] ISO/IEC 25010:2011 – SQuaRE – System and software quality models.
- [5] Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) – Diario Oficial de la Federación, 5 de julio de 2010.

### 1.5 Visión general del documento

La Sección 2 describe el contexto del sistema y los interesados. La Sección 3 contiene los requisitos funcionales organizados por módulo. La Sección 4 contiene las reglas de negocio. La Sección 5 contiene los requisitos no funcionales. La Sección 6 presenta los casos de uso en formato tabla. Los apéndices incluyen la matriz de trazabilidad y el modelo de datos de referencia.

---

## SECCIÓN 2. DESCRIPCIÓN GENERAL DEL SISTEMA

### 2.1 Perspectiva del sistema

Mural Maz Lince es un sistema nuevo, sin integración con sistemas existentes de la universidad. Opera como una aplicación web autónoma desplegada en Railway.app, con base de datos PostgreSQL, almacenamiento de imágenes en Cloudinary y servicios externos de moderación IA (Google Cloud Vision API, biblioteca bad-words). El acceso al sistema se realiza desde cualquier navegador web moderno, con énfasis en dispositivos móviles.

### 2.2 Roles de usuario

**ROL-01 | Visitante**
Accede al sistema sin cuenta. Puede visualizar el feed completo de anuncios activos. No puede interactuar (valorar, dar like) ni publicar.

**ROL-02 | Usuario registrado**
Se da de alta con su matrícula estudiantil (formato validado por checksum). Puede filtrar el feed por categoría, dar like a anuncios y asignar valoraciones de 1 a 3 estrellas. No tiene contraseña; el riesgo de uso de matrícula ajena es aceptado como bajo y controlable por el propio sistema de métricas con umbral de intención.

**ROL-03 | Emprendedor**
Usuario registrado que adicionalmente proporciona contraseña y número de WhatsApp durante el sign-up. Puede crear y gestionar proyectos y anuncios, programar vigencias, consultar métricas de impacto, ver notificaciones internas y administrar su portafolio.

**ROL-04 | Administrador**
Rol asignado manualmente a exactamente dos cuentas. Tiene acceso al panel de moderación con la cola de contenido marcado por la IA, puede aprobar o rechazar publicaciones pendientes y tomar decisiones sobre usuarios reportados.

### 2.3 Restricciones generales del sistema

- El sistema no tendrá integración con bases de datos institucionales.
- El costo operativo se mantendrá en $0 MXN usando exclusivamente capas gratuitas de servicios en la nube.
- El número de WhatsApp de ningún emprendedor debe aparecer como texto plano en ninguna respuesta de la API ni en ninguna vista del sistema.
- No existe estado de "borrador" para anuncios; un anuncio se publica o no existe.
- El feed no tiene función de guardar favoritos; es visualización rápida.
- No hay notificaciones por correo electrónico ni push; solo panel interno.

### 2.4 Suposiciones y dependencias

- Se asume que los estudiantes conocen su número de matrícula.
- Se asume conectividad móvil estándar (3G/4G) como escenario base de rendimiento.
- El sistema depende de la disponibilidad de Railway.app, Cloudinary y Google Cloud Vision API. Las contingencias ante fallos de estos servicios están documentadas en el PMP v1.4 (Sección 10).
- La lista de categorías predefinidas se encuentra en el **Apéndice A de este documento**. Es provisional; su versión final se confirmará antes del inicio de la fase de desarrollo.

---

## SECCIÓN 3. REQUISITOS FUNCIONALES

Los requisitos se organizan por módulo del sistema. Cada requisito incluye su identificador, descripción, prioridad (Alta / Media / Baja) y el rol al que aplica.

---

### MÓDULO 1 – AUTENTICACIÓN Y GESTIÓN DE USUARIOS

**RF-01 | Registro de usuario registrado**
`Prioridad: Alta | Rol: ROL-02`

El sistema debe permitir el registro de un nuevo usuario mediante el ingreso de su número de matrícula. Antes de crear la cuenta, el sistema debe validar que el formato de la matrícula es correcto mediante el algoritmo checksum (exactamente 8 dígitos numéricos, primer dígito igual a 2). Si el formato es inválido, el sistema debe rechazar el registro y mostrar un mensaje de error descriptivo. No se verifica la existencia real del estudiante en ninguna base de datos externa.

---

**RF-02 | Registro de emprendedor**
`Prioridad: Alta | Rol: ROL-03`

El sistema debe permitir el registro de un emprendedor mediante el ingreso de matrícula (validada por checksum según RF-01), contraseña, número de WhatsApp y nombre visible (display_name). La contraseña debe tener una longitud mínima de 8 caracteres. El display_name es obligatorio, tiene una longitud máxima de 80 caracteres y es el identificador público del emprendedor visible en el feed y en las vistas de detalle. El número de WhatsApp se almacena en la base de datos y nunca se expone como texto plano en ninguna capa del sistema; su uso se limita a la generación dinámica del enlace wa.me en el servidor.

Al completar el registro exitosamente, el sistema debe crear simultáneamente dos registros: uno en la tabla users (datos de autenticación) y uno en la tabla entrepreneur_profiles (identidad pública), garantizando que ambos existan o ninguno (operación atómica en una transacción de base de datos).

---

**RF-03 | Inicio de sesión de usuario registrado**
`Prioridad: Alta | Rol: ROL-02`

El sistema debe permitir que un usuario registrado inicie sesión ingresando únicamente su número de matrícula. El sistema debe crear una sesión activa y redirigir al feed con las funcionalidades de ROL-02 habilitadas.

---

**RF-04 | Inicio de sesión de emprendedor**
`Prioridad: Alta | Rol: ROL-03`

El sistema debe permitir que un emprendedor inicie sesión ingresando su matrícula y contraseña. El sistema debe crear una sesión activa con las funcionalidades de ROL-03 habilitadas.

---

**RF-05 | Inicio de sesión de administrador**
`Prioridad: Alta | Rol: ROL-04`

El sistema debe permitir que un administrador inicie sesión con credenciales asignadas manualmente (matrícula + contraseña de administrador). El sistema debe crear una sesión con acceso al panel de administración.

---

**RF-06 | Cierre de sesión**
`Prioridad: Alta | Rol: ROL-02, ROL-03, ROL-04`

El sistema debe permitir cerrar sesión desde cualquier vista autenticada, invalidando la sesión activa del usuario.

---

**RF-07 | Validación de matrícula en tiempo real**
`Prioridad: Media | Rol: ROL-02, ROL-03`

Durante el flujo de registro, el campo de matrícula debe validarse en tiempo real (mientras el usuario escribe) mediante el algoritmo checksum, mostrando indicador visual de formato válido o inválido antes de que el usuario intente enviar el formulario.

---

**RF-35 | Reclamo de matrícula en uso no autorizado**
`Prioridad: Media | Rol: ROL-03`

Exclusivamente durante el flujo de registro de emprendedor, si el sistema detecta que la matrícula ingresada ya existe registrada con ROL-02 (usuario registrado sin contraseña) y el solicitante afirma ser el titular legítimo, el sistema debe ofrecer la opción "No fui yo, quiero reclamar mi matrícula". Al seleccionarla, el sistema debe: (a) crear un ticket de reclamo en la cola del administrador que incluya la matrícula en disputa, el número de WhatsApp proporcionado por el reclamante y el timestamp de la solicitud; (b) informar al reclamante que su caso será revisado manualmente por un administrador y que recibirá respuesta a través de WhatsApp; (c) no otorgar acceso inmediato a ninguna de las dos partes hasta la resolución del administrador.

Este flujo no aplica para ROL-02 (usuario registrado) porque ese rol no tiene contraseña ni dato de contacto verificable que respalde la reclamación.

---

**RF-36 | Reporte de anuncio por usuario**
`Prioridad: Media | Rol: ROL-02, ROL-03`

El sistema debe permitir que cualquier usuario autenticado reporte un anuncio activo como contenido inapropiado, ofensivo o fraudulento. Un usuario solo puede emitir un reporte por anuncio. El reporte debe incluir opcionalmente una descripción del motivo seleccionada de una lista predefinida (contenido ofensivo, spam o duplicado, información falsa, otro). El sistema debe registrar el reporte con el identificador del usuario reportante, el identificador del anuncio y el timestamp. Los reportes son confidenciales: el emprendedor dueño del anuncio no puede ver quién lo reportó ni cuántos reportes tiene su anuncio.

---

**RF-37 | Alerta de urgencia al administrador por reportes**
`Prioridad: Alta | Rol: Sistema (interno)`

Cuando un anuncio acumule 3 o más reportes de usuarios diferentes, el sistema debe generar automáticamente una alerta de urgencia en el panel de moderación del administrador, destacando el anuncio como prioritario en la cola de revisión. La alerta debe incluir: número de reportes recibidos, motivos reportados agregados y tiempo transcurrido desde el primer reporte. El anuncio permanece visible en el feed mientras no sea intervenido por el administrador o se alcance el umbral de shadowban (RF-38). El umbral de 3 reportes debe estar parametrizado en la configuración del sistema (RN-13).

---

**RF-38 | Shadowban automático temporal por inacción del administrador**
`Prioridad: Alta | Rol: Sistema (interno)`

Si un anuncio acumula 5 o más reportes de usuarios diferentes **Y** han transcurrido 12 o más horas desde que se generó la alerta de urgencia (RF-37) sin que el administrador haya tomado ninguna acción sobre el anuncio, el sistema debe ocultarlo automáticamente del feed (estado: "shadowban temporal").

> **Nota de diseño:** Este mecanismo no constituye una sanción autónoma de la IA. Es una medida de protección a la comunidad activada exclusivamente por la inacción prolongada del administrador humano ante un umbral alto de reportes. La decisión de moderación definitiva sigue correspondiendo al administrador (ver RN-11 y ADR-05 del SAD v1.2).

El anuncio permanece en la base de datos y es visible para el administrador en su panel. El emprendedor dueño del anuncio recibe una notificación interna informando que su anuncio está temporalmente oculto pendiente de revisión. El shadowban tiene una duración máxima de 48 horas: si el administrador no toma acción en ese período, el anuncio se restaura automáticamente al estado "activo". Esta excepción al principio general de RN-11 queda acotada exclusivamente a este escenario de inacción prolongada con umbral alto de reportes. Los umbrales de 5 reportes, 12 horas de espera y 48 horas de duración máxima deben estar parametrizados en la configuración del sistema (RN-13).

---

### MÓDULO 2 – FEED Y VISUALIZACIÓN

**RF-08 | Feed principal de anuncios**
`Prioridad: Alta | Rol: ROL-01, ROL-02, ROL-03, ROL-04`

El sistema debe presentar todos los anuncios activos y aprobados en un feed de scroll infinito vertical, ordenados por fecha de publicación descendente (más recientes primero). Esta vista debe ser accesible sin autenticación. Cada tarjeta de anuncio debe mostrar: imagen del anuncio, nombre del proyecto, nombre visible del emprendedor (entrepreneur_profiles.display_name) o de la organización, categoría, fecha de publicación, contador de likes y valoración promedio.

---

**RF-09 | Filtrado por categoría**
`Prioridad: Alta | Rol: ROL-02, ROL-03, ROL-04`

El sistema debe permitir filtrar el feed por una o más categorías predefinidas (ver **Apéndice A de este documento**). El filtro debe aplicarse sin recargar la página completa. Solo usuarios autenticados (ROL-02 o superior) pueden usar el filtrado.

---

**RF-10 | Vista de detalle de anuncio**
`Prioridad: Media | Rol: ROL-01, ROL-02, ROL-03, ROL-04`

El sistema debe permitir acceder a una vista de detalle de cada anuncio que muestre toda la información pública del anuncio y un botón de contacto que genere dinámicamente el enlace wa.me del emprendedor sin revelar el número. Para visitantes sin sesión (ROL-01), el botón de contacto debe mostrar un mensaje indicando que se requiere registro para ver los datos de contacto.

---

**RF-11 | Enlace de contacto WhatsApp**
`Prioridad: Alta | Rol: ROL-02, ROL-03`

El sistema debe generar el enlace de contacto de forma dinámica en el servidor como `https://wa.me/[número]`, donde [número] se recupera de la base de datos en el momento de la solicitud. El número nunca debe aparecer en el cuerpo de ninguna respuesta JSON de la API ni en el HTML renderizado del cliente.

---

### MÓDULO 3 – INTERACCIONES (LIKES Y VALORACIONES)

**RF-12 | Like a anuncio**
`Prioridad: Alta | Rol: ROL-02, ROL-03`

El sistema debe permitir que un usuario autenticado otorgue o retire un like a cualquier anuncio activo. Un usuario solo puede tener un like activo por anuncio (toggle: si ya tiene like, lo retira; si no, lo otorga).

---

**RF-13 | Valoración de anuncio**
`Prioridad: Alta | Rol: ROL-02, ROL-03`

El sistema debe permitir que un usuario autenticado asigne una valoración de 1, 2 o 3 estrellas a un anuncio. Un usuario solo puede tener una valoración activa por anuncio. El usuario puede modificar o retirar su valoración en cualquier momento.

---

**RF-14 | Umbral de intención para métricas**
`Prioridad: Alta | Rol: Sistema (interno)`

El sistema debe registrar el timestamp de cada acción de like o valoración y de su reversión correspondiente. Si la diferencia entre el timestamp de la acción y el de su reversión es menor a 5,000 milisegundos (5 segundos), la interacción se marcará como "accidental" y se excluirá del cómputo de las métricas de impacto del emprendedor. Esta exclusión aplica tanto a likes revertidos como a valoraciones revertidas o modificadas dentro de la ventana temporal. La interacción se registra en la base de datos pero con un flag que la excluye de los agregados de métricas.

---

### MÓDULO 4 – GESTIÓN DE PROYECTOS Y ANUNCIOS (EMPRENDEDOR)

**RF-15 | Creación de proyecto**
`Prioridad: Alta | Rol: ROL-03`

El sistema debe permitir al emprendedor crear un nuevo proyecto proporcionando: nombre del proyecto, descripción breve y categoría principal. El número máximo de proyectos activos simultáneos por emprendedor se define en RN-03.

---

**RF-16 | Edición de proyecto**
`Prioridad: Media | Rol: ROL-03`

El sistema debe permitir al emprendedor editar el nombre, descripción y categoría de cualquiera de sus proyectos existentes.

---

**RF-17 | Suspensión y reactivación de proyecto**
`Prioridad: Media | Rol: ROL-03`

El sistema debe permitir al emprendedor cambiar el estado de un proyecto entre "activo" y "suspendido". Un proyecto suspendido no muestra sus anuncios en el feed, pero sus datos y el historial de anuncios vencidos se conservan en el portafolio del emprendedor.

---

**RF-18 | Eliminación de proyecto**
`Prioridad: Media | Rol: ROL-03`

El sistema debe permitir al emprendedor eliminar definitivamente un proyecto. La eliminación es irreversible y elimina también todos los anuncios activos asociados y sus imágenes de Cloudinary. El sistema debe solicitar confirmación explícita antes de ejecutar la eliminación.

---

**RF-19 | Creación de anuncio**
`Prioridad: Alta | Rol: ROL-03`

El sistema debe permitir al emprendedor crear un nuevo anuncio dentro de un proyecto existente, proporcionando: imagen (requerida), título, descripción, categoría del anuncio y fecha de vigencia. El número máximo de anuncios activos por proyecto se define en RN-04. Antes de almacenar el anuncio, el sistema debe ejecutar el flujo completo de moderación (ver Módulo 6). Si la moderación no genera alertas, el anuncio queda publicado en estado "activo". Si genera alertas, queda en estado "pendiente de revisión" hasta la decisión del administrador.

---

**RF-20 | Edición de anuncio**
`Prioridad: Media | Rol: ROL-03`

El sistema debe permitir al emprendedor editar el título, descripción, categoría y fecha de vigencia de un anuncio activo. Si se modifica la imagen, el flujo de moderación debe ejecutarse nuevamente sobre la nueva imagen.

---

**RF-21 | Eliminación de anuncio**
`Prioridad: Media | Rol: ROL-03`

El sistema debe permitir al emprendedor eliminar un anuncio activo. La eliminación es irreversible, elimina la imagen de Cloudinary y requiere confirmación explícita. El proyecto al que pertenecía el anuncio se conserva.

---

**RF-22 | Programación de vigencia de anuncio**
`Prioridad: Alta | Rol: ROL-03`

El sistema debe permitir al emprendedor establecer una fecha de expiración para cada anuncio de forma independiente. Al vencer la vigencia, el sistema debe ejecutar automáticamente (mediante un job programado) la eliminación del anuncio y su imagen en Cloudinary. El proyecto al que pertenece el anuncio se conserva con su historial.

---

**RF-23 | Portafolio del emprendedor**
`Prioridad: Media | Rol: ROL-03`

El sistema debe mantener un registro histórico de todos los proyectos del emprendedor (activos, suspendidos y con anuncios vencidos) en una sección de portafolio dentro de su panel de gestión. Este historial sirve como evidencia de trayectoria emprendedora dentro de la plataforma.

---

### MÓDULO 5 – MÉTRICAS E IMPACTO (EMPRENDEDOR)

**RF-24 | Panel de métricas de impacto**
`Prioridad: Media | Rol: ROL-03`

El sistema debe proveer al emprendedor un panel de métricas que muestre, por proyecto y por anuncio: número total de likes válidos acumulados, valoración promedio (solo interacciones fuera del umbral de intención), número de visualizaciones del anuncio en el feed y evolución temporal de estas métricas en forma de gráfica. Los datos excluyen todas las interacciones marcadas como accidentales según RF-14.

---

**RF-25 | Notificaciones internas**
`Prioridad: Alta | Rol: ROL-03`

El sistema debe mantener un panel de notificaciones interno dentro del área de gestión del emprendedor. Las notificaciones deben informar sobre: (a) cambio de estado de un anuncio (aprobado, rechazado, pendiente de revisión); (b) proximidad de vencimiento de la vigencia de un anuncio activo (alerta configurable a N días antes del vencimiento, valor exacto a definir en SAD); (c) cualquier acción administrativa sobre el contenido del emprendedor. No se utilizan notificaciones por correo electrónico ni push.

---

### MÓDULO 6 – MODERACIÓN DE CONTENIDO

**RF-26 | Análisis de imagen por IA**
`Prioridad: Alta | Rol: Sistema (interno)`

Al subir una imagen de anuncio, el sistema debe enviarla a Google Cloud Vision API para análisis de Safe Search. Si el resultado indica probabilidad LIKELY o VERY_LIKELY en alguna de las categorías de contenido inapropiado (adult, violence, racy), el sistema debe marcar el anuncio como "pendiente de revisión" y notificar al administrador. La IA no rechaza el contenido de forma autónoma; solo lo bloquea provisionalmente.

---

**RF-27 | Filtro de lenguaje ofensivo en textos**
`Prioridad: Alta | Rol: Sistema (interno)`

Al crear o editar un anuncio, el sistema debe analizar los campos de texto (título, descripción, y categoría personalizada si se seleccionó "Otro") mediante la biblioteca bad-words. Si se detecta lenguaje inapropiado, el sistema debe marcar el anuncio como "pendiente de revisión" y notificar al administrador.

---

**RF-28 | Detección de duplicados por perceptual hashing**
`Prioridad: Alta | Rol: Sistema (interno)`

Al subir una imagen de anuncio, el sistema debe calcular su dHash (64 bits) y compararlo contra todos los hashes almacenados en la base de datos de toda la plataforma. Si la distancia de Hamming con algún hash existente es menor o igual a 10, el sistema debe marcar el anuncio como "pendiente de revisión" por posible duplicado o robo de material gráfico, y notificar al administrador presentando ambas imágenes para comparación visual. El hash de la nueva imagen se almacena independientemente del resultado, para futuras comparaciones.

---

**RF-29 | Panel de moderación para administrador**
`Prioridad: Alta | Rol: ROL-04`

El sistema debe proveer al administrador un panel que liste todos los anuncios en estado "pendiente de revisión", mostrando para cada caso: la imagen del anuncio, los textos del anuncio, el motivo del marcado (IA de imagen, filtro de texto, hashing), los datos del emprendedor y, en caso de alerta por hashing, la imagen similar existente para comparación visual lado a lado.

---

**RF-30 | Decisión de moderación**
`Prioridad: Alta | Rol: ROL-04`

Desde el panel de moderación, el administrador debe poder: (a) aprobar el anuncio y publicarlo en el feed; (b) rechazar el anuncio con un motivo registrado en el sistema, que genera una notificación interna al emprendedor; (c) rechazar el anuncio y suspender la cuenta del emprendedor, requiriendo acción adicional para la reactivación. Ninguna de estas acciones puede ejecutarla la IA de forma autónoma; todas requieren acción manual del administrador.

---

### MÓDULO 7 – ALMACENAMIENTO DE IMÁGENES

**RF-31 | Compresión y validación de imagen antes del upload**
`Prioridad: Alta | Rol: Sistema (frontend + backend)`

Antes de enviar una imagen al servidor, el frontend debe procesarla mediante la biblioteca browser-image-compression para garantizar que: el tamaño del archivo no supere los 500 KB, y la dimensión máxima no exceda 1,200 px en su lado más largo. Si la imagen original ya cumple estos parámetros, se envía sin modificar. Este procesamiento ocurre completamente en el navegador del usuario antes de que la imagen salga hacia la red.

Como segunda línea de defensa, el backend debe verificar que toda imagen recibida cumpla los mismos límites (500 KB / 1,200 px) antes de subirla a Cloudinary. Si una imagen llega al servidor sin cumplir estos parámetros (por ejemplo, si el procesamiento client-side fue eludido), el servidor debe rechazarla con un error HTTP 413 y registrar el evento en el log de la aplicación. Esta doble validación protege la cuota gratuita de Cloudinary y garantiza consistencia independientemente del cliente utilizado.

---

**RF-32 | Almacenamiento en Cloudinary**
`Prioridad: Alta | Rol: Sistema (backend)`

Toda imagen de anuncio debe almacenarse en Cloudinary inmediatamente después de pasar la validación de compresión (RF-31). El backend debe recibir la imagen, subirla a Cloudinary y almacenar únicamente la URL pública de Cloudinary en la base de datos. Ninguna imagen debe almacenarse en el filesystem local del servidor de Railway. La URL de Cloudinary es la única referencia a la imagen en el sistema.

---

**RF-33 | Eliminación de imagen en Cloudinary**
`Prioridad: Alta | Rol: Sistema (interno)`

Cuando un anuncio se elimine (por expiración de vigencia, eliminación manual del emprendedor o rechazo con eliminación del administrador), el sistema debe invocar la API de Cloudinary para eliminar la imagen asociada y liberar el almacenamiento.

---

### MÓDULO 8 – PERFIL PÚBLICO Y CÓDIGO QR

**RF-39 | Nombre visible del emprendedor (display_name)**
`Prioridad: Alta | Rol: ROL-03`

El sistema debe requerir que todo emprendedor registrado tenga un nombre visible (display_name) con las siguientes características: es obligatorio en el flujo de registro (el formulario no puede enviarse sin él), tiene una longitud mínima de 2 caracteres y máxima de 80 caracteres, está sujeto al mismo filtro de lenguaje inapropiado (bad-words) que aplica a los demás campos de texto del sistema, y puede ser modificado posteriormente desde el perfil del emprendedor. El display_name se almacena en la tabla entrepreneur_profiles y es el valor que el sistema utiliza en todas las vistas públicas para identificar al emprendedor.

---

**RF-40 | Campos escalables del perfil del emprendedor para v2.0**
`Prioridad: Baja | Rol: ROL-03`

El sistema debe reservar en la tabla entrepreneur_profiles dos campos adicionales que no se presentan en la interfaz de usuario de v1.0 pero cuya estructura de datos debe existir desde el inicio para facilitar la extensión del sistema en versiones futuras sin necesidad de migraciones traumáticas: bio_short (VARCHAR 200, nullable), que almacenará en v2.0 una descripción breve del emprendedor o su trayectoria; y profile_photo_url + profile_photo_id (VARCHAR 500 y VARCHAR 200, nullable), que almacenarán en v2.0 una fotografía de perfil gestionada en Cloudinary. En v1.0 estos campos siempre tienen valor NULL y no se exponen en ningún endpoint de la API. Su inclusión en el modelo de datos refleja la visión de escalabilidad del sistema hacia un perfil de emprendedor completo con el flujo de navegación: Anuncio → Emprendimiento → Emprendedor.

---

**RF-34 | Generación de código QR**
`Prioridad: Media | Rol: ROL-04`

El sistema debe incluir una funcionalidad accesible desde el panel de administración que genere un código QR descargable en formato PNG, vinculado a la URL raíz de la plataforma en producción. Este QR está destinado a su impresión y colocación en los tableros físicos de corcho de la universidad.

---

## SECCIÓN 4. REGLAS DE NEGOCIO

**RN-01 | Formato de matrícula**
La matrícula estudiantil debe cumplir estrictamente: (a) exactamente 8 dígitos numéricos, (b) el primer dígito es 2. Cualquier otra combinación es inválida. Esta validación es únicamente de formato; el sistema no verifica si la matrícula corresponde a un estudiante real inscrito.

**RN-02 | Unicidad de matrícula por rol**
Una matrícula puede estar registrada en el sistema una única vez, independiente del rol. Si una matrícula ya existe como usuario registrado y el mismo estudiante desea actualizar su perfil a emprendedor, el sistema debe proveer un flujo de actualización de cuenta, no de registro duplicado.

**RN-03 | Límite de proyectos por emprendedor**
Un emprendedor puede tener un máximo de [N] proyectos activos simultáneamente, donde N se determinará durante la fase de diseño (SAD) considerando las restricciones de la capa gratuita de Railway. Los proyectos en estado "suspendido" no cuentan para este límite.

**RN-04 | Límite de anuncios por proyecto**
Un proyecto puede tener un máximo de [M] anuncios activos simultáneamente, donde M se determinará durante la fase de diseño (SAD). Los anuncios en estado "pendiente de revisión" sí cuentan para este límite.

**RN-05 | Ciclo de vida de anuncios**
Un anuncio puede estar en uno de los siguientes estados: "activo" (visible en el feed), "pendiente de revisión" (bloqueado por moderación, no visible en el feed), "rechazado" (decisión del administrador, no visible) o "expirado" (vigencia vencida, eliminado). No existe el estado "borrador".

**RN-06 | Ciclo de vida de proyectos**
Un proyecto puede estar en estado "activo" o "suspendido". La eliminación es permanente. Un proyecto permanece en el sistema aunque todos sus anuncios hayan expirado, para preservar el portafolio del emprendedor.

**RN-07 | Umbral de similitud de hashing**
El umbral de alerta por duplicado de imagen se fija en una distancia de Hamming menor o igual a 10 sobre 64 bits. Este valor debe estar parametrizado en la configuración del sistema para facilitar su ajuste durante la fase de pruebas sin necesidad de modificar el código.

**RN-08 | Ventana de umbral de intención**
Las interacciones (like o valoración) revertidas por el mismo usuario en un período menor a 5,000 milisegundos desde su registro inicial se clasifican como accidentales y se excluyen del cómputo de métricas de impacto. Este valor debe estar parametrizado en la configuración del sistema.

**RN-09 | Visibilidad del número de WhatsApp**
El número de WhatsApp del emprendedor es un dato de contacto privado. Debe almacenarse de forma segura en la base de datos y utilizarse exclusivamente para la generación del enlace wa.me en el servidor. No debe aparecer en ninguna respuesta JSON de la API, en el HTML del cliente, en logs del servidor ni en mensajes de error bajo ninguna circunstancia.

**RN-10 | Roles de administrador**
El número máximo de cuentas con rol de administrador es dos. Los administradores son dados de alta manualmente por la directora del sistema; no existe un flujo de autoregistro para este rol.

**RN-11 | Moderación como filtro, no como sanción**
La inteligencia artificial actúa exclusivamente como filtro de primer nivel. Ningún algoritmo automatizado puede rechazar un anuncio, suspender una cuenta ni ejecutar ninguna acción disciplinaria de forma autónoma. Toda decisión de sanción requiere acción manual del administrador. La única excepción admitida es el shadowban temporal por inacción prolongada del administrador, documentada y acotada en RF-38 y ADR-05 del SAD v1.2.

**RN-12 | Categoría personalizada**
Si un usuario selecciona la categoría "Otro", debe ingresar una descripción de categoría en un campo de texto libre. Este texto está sujeto al mismo filtro de lenguaje inapropiado (bad-words) que aplica a los demás campos de texto del anuncio (RF-27).

**RN-13 | Parámetros del sistema de reportes y shadowban**
Todos los umbrales numéricos del sistema de reportes deben estar centralizados en la configuración del sistema (variables de entorno o tabla de configuración en base de datos) para permitir su ajuste sin modificar el código fuente. Los valores por defecto son los siguientes:

| Parámetro | Valor por defecto |
|---|---|
| Umbral de alerta de urgencia al administrador | 3 reportes |
| Umbral de activación del shadowban automático | 5 reportes de usuarios diferentes |
| Ventana de inacción antes del shadowban | 12 horas desde la generación de la alerta |
| Duración máxima del shadowban automático | 48 horas antes de la restauración automática |

Ningún usuario puede reportar el mismo anuncio más de una vez; los reportes duplicados del mismo usuario sobre el mismo anuncio se ignoran y no suman al contador.

---

## SECCIÓN 5. REQUISITOS NO FUNCIONALES

### 5.1 Rendimiento

**RNF-01 | Tiempo de carga inicial del feed**
El feed principal debe cargar y ser interactivo en menos de 3 segundos en una conexión móvil estándar (equivalente a 4G / 20 Mbps de descarga). Este tiempo se mide desde la solicitud HTTP hasta el primer renderizado significativo de contenido (First Contentful Paint). Para garantizar este umbral en dispositivos con datos limitados, la carga inicial debe limitarse al primer bloque de anuncios según RNF-02; no deben cargarse recursos fuera de la ventana visible.

**RNF-02 | Paginación por cursor del feed**
El feed debe implementar paginación por cursor: la carga inicial trae los 20 anuncios más recientes y cada solicitud de página siguiente incluye el identificador del último anuncio recibido como cursor, de modo que el servidor devuelve los 20 anuncios posteriores a ese punto. Este mecanismo es preferible a la paginación por offset porque es estable ante inserciones de nuevos anuncios durante el scroll y más eficiente en tablas grandes. La carga de cada bloque siguiente se dispara automáticamente cuando el usuario se aproxima al final del contenido visible (umbral de activación: 80% del scroll). El tamaño de bloque de 20 anuncios equilibra el número de llamadas al servidor con el peso de datos por petición, considerando el contexto de uso en redes móviles con datos limitados.

**RNF-03 | Tamaño máximo de imagen en upload**
Ninguna imagen debe procesarse ni almacenarse con un tamaño superior a 500 KB ni con una dimensión máxima superior a 1,200 px en su lado más largo. Esta restricción se aplica en dos capas: en el cliente mediante browser-image-compression antes del envío (RF-31) y en el servidor como validación de segunda línea antes de la subida a Cloudinary (RF-31). La doble aplicación protege la cuota gratuita de Cloudinary ante el uso de clientes no estándar o manipulación de la petición.

### 5.2 Seguridad y privacidad

**RNF-04 | Protección de datos de contacto**
El número de WhatsApp del emprendedor no debe ser accesible desde el cliente en ningún formato. Su exposición en logs, errores o respuestas de la API se considera una vulnerabilidad crítica del sistema.

**RNF-05 | Autenticación por token**
Las sesiones de usuarios autenticados deben gestionarse mediante tokens JWT (JSON Web Tokens) con tiempo de expiración definido. Los tokens no deben contener información sensible como el número de WhatsApp ni la contraseña en ninguna de sus partes.

**RNF-06 | Almacenamiento seguro de contraseñas**
Las contraseñas de los emprendedores y administradores deben almacenarse en la base de datos usando hashing con bcrypt (factor de coste mínimo de 10). Ninguna contraseña debe almacenarse en texto plano.

**RNF-07 | Variables de entorno**
Las claves de acceso a servicios externos (Cloudinary, Google Cloud Vision API, base de datos) deben gestionarse exclusivamente mediante variables de entorno del servidor. Ninguna clave debe estar escrita en el código fuente del repositorio.

### 5.3 Usabilidad

**RNF-08 | Diseño mobile-first**
La interfaz debe diseñarse prioritariamente para pantallas móviles de 375px de ancho mínimo. Debe ser completamente funcional y estéticamente coherente también en tablet (768px) y escritorio (1280px).

**RNF-09 | Modo oscuro como predeterminado**
El modo oscuro debe ser el tema visual predeterminado de la aplicación. El sistema de diseño debe usar los colores institucionales adaptados al modo oscuro, con el color principal de la universidad (#961749 o equivalente compatible con fondo oscuro) como color primario.

**RNF-10 | Accesibilidad básica**
Los elementos interactivos deben tener etiquetas ARIA donde corresponda. El contraste de texto sobre fondo debe cumplir el nivel AA del estándar WCAG 2.1 (ratio mínimo de 4.5:1 para texto normal).

### 5.4 Confiabilidad y disponibilidad

**RNF-11 | Persistencia de imágenes**
Ninguna imagen subida al sistema debe perderse ante un reinicio o redespliegue del servidor de Railway. La persistencia está garantizada por el almacenamiento externo en Cloudinary (RF-32).

**RNF-12 | Capacidad de usuarios**
El sistema debe soportar hasta 3,000 cuentas de usuario registradas en la base de datos sin degradación de rendimiento.

### 5.5 Mantenibilidad y portabilidad

**RNF-13 | Contenedorización**
El entorno de desarrollo y producción debe estar definido mediante Dockerfile y docker-compose, garantizando reproducibilidad y portabilidad entre máquinas y proveedores de hosting.

**RNF-14 | Estilo de código**
El código fuente debe cumplir la guía de estilo de Airbnb para JavaScript, verificada automáticamente mediante ESLint en el pipeline CI/CD. Un build que no pase el linter no debe desplegarse.

**RNF-15 | Documentación de API**
Todos los endpoints de la API REST deben estar documentados en formato OpenAPI 3.0 (Swagger), incluyendo parámetros, esquemas de request/response y códigos de error posibles.

**RNF-16 | Cobertura de pruebas**
La cobertura de pruebas unitarias automatizadas del backend debe ser de al menos 70% en general. Los módulos de checksum de matrícula, perceptual hashing y umbral de intención deben tener cobertura del 100% de sus casos de frontera definidos en el STD.

### 5.6 Cumplimiento normativo

**RNF-17 | Aviso de privacidad (LFPDPPP)**
El sistema recopila datos personales de los usuarios emprendedores (número de matrícula estudiantil, número de teléfono WhatsApp y nombre visible display_name). En cumplimiento del principio de información establecido en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), el sistema debe presentar un aviso de privacidad simplificado durante el flujo de registro de emprendedor, previo a la confirmación del formulario. El usuario debe indicar que ha leído y acepta el aviso mediante una casilla de verificación obligatoria; sin esta aceptación no puede completarse el registro.

El aviso debe contener como mínimo los siguientes elementos: (a) identidad y datos de contacto del responsable del tratamiento (directora del proyecto); (b) datos personales que se recaban (matrícula, número de WhatsApp y nombre visible); (c) finalidad del tratamiento (identificación del usuario, habilitación del contacto comercial vía enlace wa.me); (d) mecanismo para ejercer derechos ARCO (Acceso, Rectificación, Cancelación y Oposición), consistente en un correo de contacto de la directora del proyecto. El aviso puede implementarse como página estática enlazada desde el formulario de registro. No aplica al registro de usuarios con solo matrícula (ROL-02) ya que ese rol no involucra número de teléfono.

---

## SECCIÓN 6. CASOS DE USO

### UC-01 | Registrarse como usuario registrado

| Campo           | Detalle                                                                 |
|-----------------|-------------------------------------------------------------------------|
| Actor principal | Visitante (ROL-01)                                                      |
| Precondición    | El actor no tiene cuenta en el sistema.                                 |
| Postcondición   | Se crea una cuenta con ROL-02 y el actor inicia sesión.                 |
| Requisitos      | RF-01, RF-07, RN-01, RN-02                                              |

**Flujo principal:**
1. El actor accede a la pantalla de registro.
2. El actor ingresa su número de matrícula.
3. El sistema valida el formato en tiempo real (checksum).
4. El formato es válido: el sistema muestra indicador de éxito.
5. El actor confirma el registro.
6. El sistema verifica que la matrícula no esté ya registrada.
7. El sistema crea la cuenta con ROL-02 e inicia sesión.
8. El sistema redirige al feed con funcionalidades de ROL-02 habilitadas.

**Flujos alternativos:**
- **3a.** El formato de matrícula es inválido: el sistema muestra un mensaje de error descriptivo. El actor corrige el campo y regresa al paso 3.
- **6a.** La matrícula ya está registrada: el sistema informa que la matrícula ya tiene una cuenta. El sistema ofrece la opción de iniciar sesión.

---

### UC-02 | Registrarse como emprendedor

| Campo           | Detalle                                                                                        |
|-----------------|------------------------------------------------------------------------------------------------|
| Actor principal | Visitante (ROL-01) o Usuario registrado (ROL-02)                                               |
| Precondición    | El actor no tiene cuenta de emprendedor o desea convertir su cuenta de ROL-02 a ROL-03.       |
| Postcondición   | Se crea o actualiza una cuenta con ROL-03.                                                     |
| Requisitos      | RF-02, RF-07, RN-01, RN-02, RN-09                                                             |

**Flujo principal:**
1. El actor accede al flujo de registro de emprendedor.
2. El actor ingresa matrícula, contraseña, número de WhatsApp y nombre visible (display_name).
3. El sistema valida el formato de matrícula (checksum) en tiempo real.
4. El sistema valida que la contraseña tenga al menos 8 caracteres.
5. El actor confirma el registro.
6. El sistema verifica que la matrícula no esté registrada con otro rol.
7. El sistema almacena el número de WhatsApp de forma segura.
8. El sistema valida que el display_name no esté vacío y no contenga lenguaje inapropiado (bad-words).
9. El sistema crea en una transacción atómica: un registro en users (ROL-03) y un registro en entrepreneur_profiles (display_name y campos v2.0 nulos).
10. El sistema redirige al panel de gestión del emprendedor.

**Flujos alternativos:**
- **3a.** Formato de matrícula inválido: igual que UC-01/3a.
- **4a.** Contraseña menor a 8 caracteres: el sistema muestra mensaje de requisito mínimo. El actor corrige y regresa al paso 4.
- **6a.** La matrícula ya existe como ROL-02: el sistema ofrece convertir la cuenta existente a ROL-03 solicitando adicionalmente la contraseña y WhatsApp.

---

### UC-03 | Publicar un anuncio

| Campo           | Detalle                                                                                               |
|-----------------|-------------------------------------------------------------------------------------------------------|
| Actor principal | Emprendedor (ROL-03)                                                                                  |
| Precondición    | El actor está autenticado y tiene al menos un proyecto activo con capacidad para nuevos anuncios (RN-04). |
| Postcondición   | El anuncio queda en estado "activo" o "pendiente de revisión" según el resultado de la moderación.   |
| Requisitos      | RF-19, RF-22, RF-26, RF-27, RF-28, RF-31, RF-32, RN-04, RN-05, RN-11, RN-12                        |

**Flujo principal:**
1. El actor accede al formulario de nuevo anuncio dentro de un proyecto.
2. El actor sube una imagen desde su dispositivo.
3. El frontend comprime/redimensiona la imagen (500 KB / 1,200 px máx).
4. El actor completa título, descripción, categoría y fecha de vigencia.
5. El actor confirma la publicación.
6. El sistema ejecuta simultáneamente: (a) Análisis de imagen con Google Cloud Vision (RF-26), (b) Filtro de lenguaje ofensivo en todos los campos de texto (RF-27), (c) Cálculo y comparación del dHash de la imagen (RF-28).
7. Ninguna verificación genera alerta: el sistema sube la imagen a Cloudinary (RF-32), almacena el anuncio con estado "activo" y lo publica en el feed.
8. El sistema genera una notificación interna de "anuncio aprobado" (RF-25).

**Flujos alternativos:**
- **3a.** La imagen supera 500 KB incluso después de la compresión: el sistema muestra mensaje de error e invita al actor a seleccionar una imagen diferente.
- **6a.** Al menos una verificación genera alerta: el sistema almacena el anuncio con estado "pendiente de revisión". La imagen se sube a Cloudinary de forma provisional. El sistema notifica al administrador con el detalle del caso (RF-29). El sistema genera notificación interna al actor de "anuncio en revisión".
- **6b.** El proyecto ya alcanzó el límite máximo de anuncios activos (RN-04): el sistema informa al actor del límite alcanzado e impide la creación.

---

### UC-04 | Moderar un anuncio pendiente

| Campo           | Detalle                                                                             |
|-----------------|-------------------------------------------------------------------------------------|
| Actor principal | Administrador (ROL-04)                                                              |
| Precondición    | Existe al menos un anuncio en estado "pendiente de revisión" en la cola de moderación. |
| Postcondición   | El anuncio cambia a estado "activo" o "rechazado".                                  |
| Requisitos      | RF-29, RF-30, RN-11                                                                 |

**Flujo principal:**
1. El administrador accede al panel de moderación.
2. El sistema muestra la lista de anuncios pendientes con el motivo del marcado y la información del emprendedor.
3. El administrador revisa el caso (imagen, textos, motivo, comparativa si aplica hashing).
4. El administrador selecciona "Aprobar".
5. El sistema cambia el estado del anuncio a "activo" y lo publica en el feed.
6. El sistema genera notificación interna al emprendedor de "anuncio aprobado".

**Flujos alternativos:**
- **4a.** El administrador selecciona "Rechazar": el sistema solicita motivo del rechazo. El sistema cambia el estado a "rechazado" y elimina la imagen de Cloudinary. El sistema genera notificación interna al emprendedor con el motivo.
- **4b.** El administrador selecciona "Rechazar y suspender cuenta": igual que 4a, más la cuenta del emprendedor queda suspendida. El sistema registra la acción con su justificación en el log de moderación.

---

### UC-05 | Valorar un anuncio

| Campo           | Detalle                                                                                              |
|-----------------|------------------------------------------------------------------------------------------------------|
| Actor principal | Usuario registrado (ROL-02) o Emprendedor (ROL-03)                                                  |
| Precondición    | El actor está autenticado. El anuncio objetivo está en estado "activo".                              |
| Postcondición   | La valoración queda registrada y se refleja en la valoración promedio del anuncio.                   |
| Requisitos      | RF-13, RF-14, RN-08                                                                                  |

**Flujo principal:**
1. El actor visualiza un anuncio en el feed o en la vista de detalle.
2. El actor selecciona una valoración de 1 a 3 estrellas.
3. El sistema registra la valoración con timestamp de creación.
4. El sistema actualiza la valoración promedio visible en el anuncio.
5. La valoración se incluye en las métricas de impacto del emprendedor.

**Flujos alternativos:**
- **2a.** El actor ya tiene una valoración activa en este anuncio: el actor puede modificarla seleccionando un nuevo valor, o retirarla seleccionando la misma valoración activa.
- **5a.** El actor revierte o modifica la valoración en menos de 5,000 ms: el sistema registra la acción como "accidental". La interacción se excluye del cómputo de métricas del emprendedor (RF-14). La valoración promedio visible puede actualizarse, pero las métricas del panel del emprendedor no incluyen esta interacción.

---

### UC-06 | Reclamar matrícula en uso no autorizado

| Campo           | Detalle                                                                                                                |
|-----------------|------------------------------------------------------------------------------------------------------------------------|
| Actor principal | Visitante (ROL-01) que intenta registrarse como emprendedor                                                            |
| Precondición    | La matrícula que el actor desea usar ya existe registrada con ROL-02 y el actor afirma ser su titular legítimo.       |
| Postcondición   | Se genera un ticket de reclamo en la cola del administrador. Ninguna cuenta obtiene acceso adicional hasta la resolución. |
| Requisitos      | RF-35, RN-02, RN-10                                                                                                    |

**Flujo principal:**
1. El actor accede al flujo de registro de emprendedor e ingresa su matrícula.
2. El sistema detecta que la matrícula ya está registrada con ROL-02.
3. El sistema muestra las opciones: "Iniciar sesión con esta matrícula" y "No fui yo, quiero reclamar mi matrícula".
4. El actor selecciona "No fui yo, quiero reclamar mi matrícula".
5. El sistema solicita el número de WhatsApp del reclamante como dato de contacto para la resolución.
6. El actor ingresa su número de WhatsApp y confirma el reclamo.
7. El sistema crea un ticket de reclamo en la cola del administrador con: matrícula en disputa, número de WhatsApp del reclamante y timestamp.
8. El sistema informa al actor que su caso fue registrado y que un administrador se comunicará con él vía WhatsApp para resolverlo.
9. El sistema no otorga acceso ni modifica ninguna cuenta de forma automática.

**Flujos alternativos:**
- **6a.** El actor no proporciona un número de WhatsApp válido: el sistema informa que el número de contacto es requerido para procesar el reclamo y solicita corregirlo.
- **4b.** El actor selecciona "Iniciar sesión con esta matrícula": el sistema redirige al flujo de inicio de sesión de ROL-02 (UC-01).

---

### UC-07 | Reportar un anuncio

| Campo           | Detalle                                                                                                          |
|-----------------|------------------------------------------------------------------------------------------------------------------|
| Actor principal | Usuario registrado (ROL-02) o Emprendedor (ROL-03)                                                               |
| Precondición    | El actor está autenticado. El anuncio objetivo está en estado "activo" y el actor no lo ha reportado previamente. |
| Postcondición   | El reporte queda registrado. Si se alcanzan los umbrales definidos en RN-13, se activan RF-37 y/o RF-38.         |
| Requisitos      | RF-36, RF-37, RF-38, RN-13                                                                                       |

**Flujo principal:**
1. El actor accede a la vista de detalle de un anuncio o al menú contextual de una tarjeta en el feed.
2. El actor selecciona la opción "Reportar anuncio".
3. El sistema presenta una lista de motivos: "Contenido ofensivo o inapropiado", "Spam o anuncio duplicado", "Información falsa o engañosa", "Otro".
4. El actor selecciona un motivo y confirma el reporte.
5. El sistema registra el reporte con identificador de usuario, identificador de anuncio, motivo y timestamp.
6. El sistema evalúa el contador de reportes del anuncio:
   - Si el contador alcanza 3 reportes: se genera alerta de urgencia al administrador (RF-37) y el anuncio se marca como prioritario en la cola.
   - Si el contador alcanza 5 reportes y han pasado 12 horas desde la alerta sin acción del administrador: se ejecuta el shadowban automático (RF-38).
7. El sistema confirma al actor que su reporte fue registrado, sin revelar el número acumulado de reportes del anuncio.

**Flujos alternativos:**
- **2a.** El actor ya reportó este anuncio anteriormente: el sistema informa que ya existe un reporte previo del actor sobre este anuncio y no registra un reporte adicional.

---

## APÉNDICE A – LISTA DE CATEGORÍAS PREDEFINIDAS (v1.0 provisional)

Esta es la fuente canónica de la lista de categorías del sistema. Su contenido puede modificarse antes del inicio de la fase de desarrollo sin proceso formal de cambios, ya que su impacto se limita a datos de configuración de la base de datos. El PMP v1.4 hace referencia a este apéndice como ubicación oficial de la lista.

### GRUPO 1 – PRODUCTOS FÍSICOS

| Código | Categoría                        |
|--------|----------------------------------|
| CAT-01 | Alimentos y bebidas              |
| CAT-02 | Repostería y postres             |
| CAT-03 | Artesanías y manualidades        |
| CAT-04 | Ropa y accesorios                |
| CAT-05 | Papelería y material escolar     |
| CAT-06 | Cosméticos y cuidado personal    |
| CAT-07 | Plantas y decoración             |

### GRUPO 2 – SERVICIOS

| Código | Categoría                                      |
|--------|------------------------------------------------|
| CAT-08 | Asesorías académicas y tutorías                |
| CAT-09 | Diseño gráfico y digital                       |
| CAT-10 | Fotografía y video                             |
| CAT-11 | Desarrollo web y tecnología                    |
| CAT-12 | Clases particulares (idiomas, música, deporte) |
| CAT-13 | Impresión y copiado                            |
| CAT-14 | Reparaciones y mantenimiento                   |

### GRUPO 3 – ORGANIZACIONES ESTUDIANTILES

| Código | Categoría                         |
|--------|-----------------------------------|
| CAT-15 | Evento cultural                   |
| CAT-16 | Evento deportivo                  |
| CAT-17 | Convocatoria o concurso           |
| CAT-18 | Comunicado oficial                |
| CAT-19 | Actividad de voluntariado         |
| CAT-00 | Otro (campo de texto libre, sujeto a filtro bad-words) |

---

## APÉNDICE B – MATRIZ DE TRAZABILIDAD (RF ↔ UC ↔ RN)

| Requisito | Caso de uso relacionado  | Regla de negocio relacionada               |
|-----------|--------------------------|--------------------------------------------|
| RF-01     | UC-01                    | RN-01, RN-02                               |
| RF-02     | UC-02                    | RN-01, RN-02, RN-09                        |
| RF-39     | UC-02                    | RN-01, RN-12 (filtro bad-words)            |
| RF-40     | —                        | — (estructura de datos para v2.0)          |
| RF-03     | UC-01                    | RN-01                                      |
| RF-04     | UC-02                    | RN-01                                      |
| RF-05     | —                        | RN-10                                      |
| RF-06     | UC-01, UC-02             | —                                          |
| RF-07     | UC-01, UC-02             | RN-01                                      |
| RF-08     | UC-03, UC-05             | RN-05 (display_name desde entrepreneur_profiles) |
| RF-09     | —                        | —                                          |
| RF-10     | UC-05                    | RN-09                                      |
| RF-11     | UC-02, UC-06             | RN-09                                      |
| RF-12     | UC-05                    | —                                          |
| RF-13     | UC-05                    | —                                          |
| RF-14     | UC-05                    | RN-08                                      |
| RF-15     | UC-03                    | RN-03                                      |
| RF-16     | —                        | —                                          |
| RF-17     | —                        | RN-06                                      |
| RF-18     | —                        | RN-06                                      |
| RF-19     | UC-03                    | RN-04, RN-05                               |
| RF-20     | UC-03                    | RN-05                                      |
| RF-21     | —                        | RN-05                                      |
| RF-22     | UC-03                    | RN-05                                      |
| RF-23     | —                        | RN-06                                      |
| RF-24     | —                        | RN-08                                      |
| RF-25     | UC-03, UC-04, UC-07      | —                                          |
| RF-26     | UC-03, UC-04             | RN-11                                      |
| RF-27     | UC-03, UC-04             | RN-11, RN-12                               |
| RF-28     | UC-03, UC-04             | RN-07, RN-11                               |
| RF-29     | UC-04, UC-07             | RN-11, RN-13                               |
| RF-30     | UC-04                    | RN-11                                      |
| RF-31     | UC-03                    | —                                          |
| RF-32     | UC-03                    | —                                          |
| RF-33     | UC-03, UC-04             | —                                          |
| RF-34     | —                        | —                                          |
| RF-35     | UC-06                    | RN-02, RN-10                               |
| RF-36     | UC-07                    | RN-13                                      |
| RF-37     | UC-07                    | RN-13                                      |
| RF-38     | UC-07                    | RN-11 (excepción acotada), RN-13           |
| RNF-17    | UC-02                    | RN-09                                      |

---

*FIN DEL DOCUMENTO*
*SRS – Mural Maz Lince v1.4*
