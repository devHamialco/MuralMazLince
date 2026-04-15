# DETAILED DESIGN DOCUMENT (DDC)

Proyecto: Mural Maz Lince
Versión: 1.2
Elaborado por: Miriam Alanis
Fecha de elaboración: Abril 2026
Referencia SRS: SRS v1.4 | Referencia SAD: SAD v1.3

## HISTORIAL DE VERSIONES

| Versión | Fecha                            | Descripción                 | Autor         |
| ------- | -------------------------------- | --------------------------- | ------------- |
| 1.0     | Marzo 2026                       | Versión inicial del DDC     | Miriam Alanis |
| 1.1     | Marzo 2026                       | WF-3.2.3 actualizado: campo | Miriam Alanis |
|         | display_name obligatorio en      |
|         | registro emprendedor; endpoint   |
|         | POST /auth/register/entrepreneur |
|         | actualizado; trazabilidad        |
| 1.2     | Abril 2026                       | Referencias actualizadas a  | Miriam Alanis |
|         | SRS v1.4 y SAD v1.3; corrección  |
|         | de trazabilidad WF-3.1.1         |
|         | (RF-01 → RNF-01, RNF-02);        |
|         | display*name y entrepreneur*     |
|         | profiles nombrados en            |
|         | WF-3.1.1 y AnnouncementCard;     |
|         | restricción mínima 2 chars       |
|         | añadida a WF-3.2.3               |

## SECCIÓN 1. INTRODUCCIÓN

### 1.1 Propósito

Este Detailed Design Document (DDC) especifica el diseño visual, el sistema de
componentes, la descripción textual de todas las pantallas y la especificación
de endpoints de la API REST del sistema Mural Maz Lince. Sirve como puente entre
la arquitectura de alto nivel del SAD v1.3 y la implementación del código,
garantizando criterios precisos y verificables para cada decisión de interfaz.

El documento .docx acompañante contiene los wireframes visuales renderizados con
la paleta del sistema de diseño. Este archivo .txt describe el mismo contenido
en forma textual sin referencias visuales.

### 1.2 Alcance

El DDC cubre el sistema de diseño completo (paleta de colores, tipografía,
espaciado, componentes reutilizables), la descripción de todas las pantallas
organizadas por rol de usuario, y la especificación de los endpoints de la API
REST. Las pantallas representan el diseño en modo oscuro (predeterminado) sobre
viewport móvil de 375px.

## SECCIÓN 2. SISTEMA DE DISEÑO

### 2.1 Identidad Visual

La identidad visual de Mural Maz Lince se construye sobre tres pilares cromáticos
derivados del logo diseñado: el rojo-carmesí institucional como color primario de
acción, el azul navy que representa la presencia tecnológica del proyecto, y el
amarillo dorado que evoca la activación económica de la comunidad emprendedora.
El fondo azul-noche #1A1A2E crea un ambiente moderno que reduce la fatiga visual
en uso prolongado en pantalla móvil.

### 2.2 Paleta de Colores

Todos los contrastes de texto sobre fondo cumplen WCAG 2.1 nivel AA (ratio mínimo
4.5:1) según RNF-10 del SRS.

| Nombre           | Token           | Hex     | Rol       | Uso principal                        |
| ---------------- | --------------- | ------- | --------- | ------------------------------------ |
| BG Base          | BG_BASE         | #1A1A2E | Fondo L1  | Fondo de toda la aplicación          |
| BG Card          | BG_CARD         | #16213E | Fondo L2  | Fondo de tarjetas de anuncio         |
| BG Surface       | BG_SURFACE      | #0F3460 | Fondo L3  | Modales, panels, navBar              |
| Primario         | PRIMARY         | #C4184A | Acción    | Botones CTA, acentos, bordes activos |
| Secundario       | SECONDARY       | #194A8D | Info      | Links, chips de categoría            |
| Acento           | ACCENT          | #F0C040 | Highlight | Estrellas de valoración, badges      |
| Texto Principal  | TEXT_PRIMARY    | #FFFFFF | Texto     | Títulos, texto de alto impacto       |
| Texto Secundario | TEXT_SECONDARY  | #A0AEC0 | Texto     | Descripciones, labels                |
| Texto Muted      | TEXT_MUTED      | #718096 | Texto     | Timestamps, metadatos                |
| Borde            | BORDER          | #2D3748 | Borde     | Líneas divisorias                    |
| Estado Activo    | STATUS_ACTIVE   | #48BB78 | Estado    | Badge "Publicado"                    |
| Estado Pendiente | STATUS_PENDING  | #F0C040 | Estado    | Badge "En revisión"                  |
| Estado Rechazado | STATUS_REJECTED | #E53E3E | Estado    | Badge "Rechazado", errores           |

Nota sobre el color primario: el #C4184A es una variante del color institucional
#961749 con luminosidad elevada para garantizar contraste suficiente sobre el
fondo #1A1A2E. Para el logo estático y la barra de navegación principal se puede
usar el #961749 original, que actúa como elemento de identidad más que como texto
interactivo.

### 2.3 Tipografía

Familia principal: Inter (Google Fonts). Alternativa de sistema: sans-serif nativa.

| Nivel   | Uso                               | Tamaño | Peso         |
| ------- | --------------------------------- | ------ | ------------ |
| Display | Nombre de proyecto en portafolio  | 32px   | 700 Bold     |
| H1      | Títulos de sección en paneles     | 24px   | 700 Bold     |
| H2      | Nombre del proyecto en tarjeta    | 20px   | 600 SemiBold |
| Body L  | Descripción principal del anuncio | 16px   | 400 Regular  |
| Body S  | Metadatos, categoría, fecha       | 14px   | 400 Regular  |
| Caption | Contadores, timestamps, labels    | 12px   | 400 Regular  |
| Button  | Texto de botones CTA              | 14px   | 600 SemiBold |
| Badge   | Etiquetas de categoría y estado   | 12px   | 600 SemiBold |

### 2.4 Espaciado y Layout

El sistema de espaciado utiliza una escala base de 4px con múltiplos: 4, 8, 12,
16, 24, 32, 48, 64px. El layout de pantalla móvil (375px) trabaja con padding
horizontal de 16px a cada lado, dejando un área de contenido de 343px. Las
tarjetas de anuncio tienen border-radius de 12px. El feed tiene gap vertical de
16px entre tarjetas.

### 2.5 Componentes Reutilizables

Los siguientes componentes React se definen como reutilizables en el sistema:

AnnouncementCard: Tarjeta del feed con imagen, título, nombre visible del
emprendedor (display_name desde entrepreneur_profiles), categoría, likes y rating.
Estados: default / hover / skeleton loading. SRS: RF-08, RF-39.

CategoryBadge: Chip de categoría con color según grupo temático.
Estados: default / selected / disabled. SRS: RF-09.

StarRating: 3 estrellas interactivas con animación de tap.
Estados: empty / partial / full / readonly. SRS: RF-13.

LikeButton: Corazón toggle con contador y animación de pop al activar.
Estados: inactive / active / loading. SRS: RF-12.

StatusBadge: Etiqueta de estado del anuncio con color semántico.
Estados: active / pending / rejected / shadowban. SRS: RN-05.

NotificationDot: Punto rojo sobre el ícono de panel cuando hay notifs no leídas.
Estados: visible / hidden. SRS: RF-25.

ImageUploader: Zona de drop + preview con barra de progreso de compresión.
Estados: idle / compressing / uploading / error. SRS: RF-31.

VigoranceSelector: Selector de fecha de expiración con calendario mini.
Estados: open / closed / expired warning. SRS: RF-22.

ReportModal: Modal con lista de motivos de reporte y confirmación.
Estados: idle / submitting / submitted / already_reported. SRS: RF-36.

ToastNotification: Notificación flotante de feedback de acción.
Estados: success / error / info / warning. SRS: RF-25.

## SECCIÓN 3. DESCRIPCIÓN DE PANTALLAS

Las pantallas se organizan por flujo de usuario. Para cada pantalla se describe
su propósito, los elementos de interfaz que contiene y los comportamientos clave.
Los wireframes visuales correspondientes se encuentran en el documento .docx.

### 3.1 FLUJO DEL VISITANTE (ROL-01)

#### 3.1.1 Feed Principal — Vista de Visitante

SRS: RF-08, RNF-01, RNF-02

Propósito: Punto de entrada de cualquier usuario que llega al sistema, con o sin
cuenta. Es la pantalla que se muestra al escanear el código QR del tablero físico.

Elementos:

- NavBar superior sticky con logo (◉ M) y nombre "MURAL MAZ LINCE". Sin opciones
  de menú autenticado.
- Feed de tarjetas AnnouncementCard en scroll infinito vertical, paginadas por
  cursor en bloques de 20 anuncios (RNF-02).
- Cada tarjeta muestra: imagen del anuncio (Cloudinary CDN, aspect ratio 4:3),
  nombre del proyecto, nombre visible del emprendedor (display_name, desde
  entrepreneur_profiles), badge de categoría, descripción truncada a 2 líneas
  con "Ver más", contador de likes (solo lectura), valoración promedio en
  estrellas (solo lectura), timestamp de publicación.
- Botón "Ver detalle" en cada tarjeta que navega a WF-3.1.2.
- CTA sticky al fondo cuando el visitante intenta interactuar: "Inicia sesión para
  interactuar". Navega a WF-3.2.1.

Comportamientos:

- StarRating y LikeButton en modo readonly. Tooltip: "Regístrate para valorar".
- Skeleton loading mientras se carga cada bloque de anuncios.
- La carga del bloque siguiente se dispara al alcanzar el 80% del scroll.

#### 3.1.2 Detalle de Anuncio — Vista de Visitante

SRS: RF-10, RF-11, RNF-04

Propósito: Vista completa de un anuncio individual. El número de WhatsApp nunca
aparece; en su lugar se muestra un CTA de registro para ROL-01.

Elementos:

- Header con botón "← Volver al Mural".
- Imagen full-width (343×250px, object-fit: cover).
- Título (H2), nombre del proyecto como texto con link al portafolio público,
  badge de categoría.
- Métricas: rating promedio + conteo de valoraciones + conteo de likes (lectura).
- Descripción completa sin truncar (máx. 500 caracteres según RF-19).
- Fecha de vigencia. Si quedan ≤7 días, el texto se muestra en DS.ACCENT (amarillo).
- Bloque de contacto bloqueado: "🔒 Inicia sesión para ver los datos de contacto".
  El enlace wa.me nunca se renderiza para ROL-01 (RNF-04, RN-09).
- Botón de reporte ⚐ visible solo para ROL-02 y ROL-03. Oculto para ROL-01.

### 3.2 FLUJO DE AUTENTICACIÓN (ROL-01 → ROL-02 / ROL-03)

#### 3.2.1 Pantalla de Bienvenida / Selección de Tipo de Registro

SRS: RF-01, RF-02

Propósito: Punto de decisión para el usuario que desea crear una cuenta o ya
tiene una. Presenta las tres opciones claramente sin forzar el registro.

Elementos:

- Logo centrado con animación de fade-in de 300ms.
- Tagline: "El mural emprendedor de tu universidad".
- Botón "Explorar sin cuenta" — navega al feed como ROL-01.
- Separador visual "─── o regístrate ───".
- Botón "Registrarme como Estudiante" (color SECONDARY) → WF-3.2.2.
- Botón "Registrarme como Emprendedor" (color PRIMARY) → WF-3.2.3.
- Link "¿Ya tienes cuenta? Iniciar sesión" → WF-3.2.4.

#### 3.2.2 Registro como Estudiante (ROL-02)

SRS: RF-01, RF-07, RN-01

Propósito: Registro mínimo de fricción. Solo se requiere la matrícula.

Elementos:

- Campo de matrícula con teclado numérico en móvil.
- Validación checksum en tiempo real: ícono ✓ verde si el formato es válido,
  ✗ rojo si no. Texto de ayuda siempre visible: "8 dígitos · Debe comenzar con 2".
- Botón CTA deshabilitado hasta que el checksum sea válido. Estado loading durante
  el submit.
- Link condicional "¿Alguien más usa tu matrícula? Reclamarla" — solo visible si
  la matrícula ingresada ya existe como ROL-02 (flujo RF-35).

#### 3.2.3 Registro como Emprendedor (ROL-03)

SRS: RF-02, RF-39, RNF-17, RN-09

Propósito: Registro completo del emprendedor con todos los datos necesarios para
publicar anuncios, aparecer identificado en el feed y recibir contacto de
clientes potenciales.

Elementos:

- Campo matrícula (igual que WF-3.2.2 con checksum en tiempo real).
- Campo contraseña con toggle de visibilidad y barra de indicador de fortaleza.
- Campo nombre visible (display_name): obligatorio, mín. 2 caracteres, máx. 80
  caracteres con contador visible. Este es el nombre que aparece en el feed y en
  las vistas de detalle. Placeholder: 'Como quieres que te conozcan (ej: Mariana G., Tech Lince)'
  Sujeto al filtro bad-words al perder el foco del campo.
- Campo WhatsApp tipo tel, formato +52 + 10 dígitos, con validación de formato.
- Nota de privacidad siempre visible: "Tu número solo se usará para generar un
  enlace de contacto. No se publicará como texto plano." (refuerza RN-09).
- Checkbox obligatorio de aceptación del Aviso de Privacidad con link a la página
  estática del aviso (RNF-17, LFPDPPP). El Aviso menciona explícitamente que se
  recaba el nombre visible además de la matrícula y el WhatsApp.
- Botón CTA habilitado solo cuando: matrícula válida + contraseña ≥8 caracteres
  - display_name con ≥2 caracteres + checkbox marcado.

Comportamiento al enviar:
El sistema crea en una transacción atómica un registro en users y uno en
entrepreneur_profiles (ADR-09 del SAD). Si falla, ambos se revierten. Si el
display_name contiene lenguaje inapropiado, el campo se resalta en rojo con el
mensaje 'Por favor elige un nombre apropiado' y no se ejecuta la transacción.

#### 3.2.4 Inicio de Sesión

SRS: RF-03, RF-04, RF-05

Propósito: Autenticación de usuarios existentes de cualquier rol.

Elementos:

- Campo matrícula con checksum en tiempo real.
- Campo contraseña opcional con toggle de visibilidad. Si se deja vacío, el sistema
  intenta login como ROL-02 (solo matrícula). Si se ingresa, intenta ROL-03 o
  ROL-04 según corresponda.
- Texto de ayuda: "Si eres solo estudiante, deja la contraseña en blanco."
- Mensaje de error específico sin revelar información: "Matrícula no encontrada"
  o "Contraseña incorrecta", nunca ambos en el mismo mensaje para no confirmar
  la existencia de una cuenta (buena práctica de seguridad).
- Si is_suspended=true: "Tu cuenta está suspendida. Contacta al administrador."

#### 3.2.5 Reclamo de Matrícula (Flujo RF-35)

SRS: RF-35, RN-02, RN-10

Propósito: Permite al titular legítimo de una matrícula ya registrada por otra
persona iniciar el proceso de recuperación.

Elementos:

- Texto explicativo: "La matrícula XXXXXXXX ya tiene una cuenta. Si eres su
  titular legítimo, puedes reclamarla."
- Opciones: "Iniciar sesión con esta matrícula" (si sí fue yo, que vaya al login)
  o "No fui yo, quiero reclamar mi matrícula".
- Si el usuario elige reclamar: campo de WhatsApp como dato de contacto para que
  el administrador pueda comunicarse con él.
- Al confirmar: se crea el ticket de reclamo y se muestra el mensaje "Tu reclamo
  fue registrado. Un administrador se comunicará contigo vía WhatsApp."
- El sistema no otorga acceso a ninguna cuenta de forma automática.

### 3.3 FLUJO DEL USUARIO REGISTRADO (ROL-02)

#### 3.3.1 Feed con Filtros y Acciones Activas

SRS: RF-08, RF-09, RF-12, RF-13, RF-14

Propósito: Feed autenticado con todas las capacidades de interacción de ROL-02.

Elementos:

- Chips de categoría en scroll horizontal bajo la NavBar: "Todos" + cada categoría
  predefinida. El chip activo se resalta en color PRIMARY. RF-09.
- Cada tarjeta AnnouncementCard incluye ahora LikeButton interactivo (toggle con
  animación de pop) y StarRating interactivo (tap para seleccionar 1-3 estrellas).
- Botón de contacto WhatsApp en verde (STATUS_ACTIVE) para diferenciarlo de las
  acciones primarias. Genera URL wa.me dinámicamente desde el servidor. RF-11.
- Ícono de reporte ⚐ sutil en cada tarjeta. Abre WF-3.3.2.
- Si el usuario es ROL-03, la NavBar muestra un badge de notificaciones con el
  conteo de no leídas.

Comportamientos relacionados con el umbral de intención:

- Si un like o valoración se revierte en menos de 5 segundos, la interacción se
  marca como accidental y no contabiliza en las métricas del emprendedor (RF-14).
  El usuario no recibe ningún feedback visual especial por esto; el filtrado es
  transparente desde su perspectiva.

#### 3.3.2 Modal de Reporte de Anuncio

SRS: RF-36, RN-13

Propósito: Permite al usuario reportar contenido inapropiado de forma confidencial.

Elementos:

- Modal con overlay semitransparente. Cierre tocando fuera del modal o el botón
  Cancelar.
- Título: "⚐ Reportar este anuncio".
- Nota de confidencialidad: "Tu reporte es confidencial. El emprendedor no sabrá
  que fuiste tú."
- Lista de radio buttons con los cuatro motivos predefinidos: "Contenido ofensivo
  o inapropiado", "Spam o anuncio duplicado", "Información falsa o engañosa",
  "Otro".
- Botón "Confirmar reporte" deshabilitado hasta que se seleccione un motivo.
- Si el usuario ya reportó este anuncio, el modal muestra solo el mensaje "Ya
  enviaste un reporte para este anuncio" sin el formulario.

### 3.4 FLUJO DEL EMPRENDEDOR (ROL-03)

#### 3.4.1 Panel Principal del Emprendedor

SRS: RF-15, RF-17, RF-23, RF-24

Propósito: Centro de gestión de todos los proyectos del emprendedor.

Elementos:

- NavBar con saludo personalizado ("Hola, [nombre] 👋") y badge de notificaciones.
- Resumen: conteo de proyectos activos y anuncios activos.
- Botón "＋ Nuevo proyecto" que verifica el límite N=5 activos antes de navegar al
  formulario de creación. Si el límite está alcanzado, muestra mensaje de error
  explicativo (RN-03).
- Lista de ProjectCards mostrando: nombre del proyecto, estado badge (activo /
  suspendido), conteo de anuncios activos, métricas resumidas (likes totales,
  rating promedio, vistas).
- Acciones por proyecto: "Ver detalle" → WF-3.4.2, "Nuevo anuncio" → WF-3.4.3,
  menú "⋯" con opciones Editar / Suspender / Eliminar.

#### 3.4.2 Detalle de Proyecto y Portafolio

SRS: RF-16, RF-23, RF-24, RN-04

Propósito: Vista completa de un proyecto con sus anuncios, métricas y portafolio.

Elementos:

- Nombre del proyecto (H1), badge de estado.
- Panel de impacto: vistas totales, likes válidos (con umbral de intención
  aplicado), rating promedio. Nota textual: "Umbral de intención: activo" para
  transparencia con el emprendedor sobre cómo se calculan sus métricas.
- Contador de anuncios activos con límite visible: "2/3 anuncios activos". Los
  anuncios en revisión también cuentan para el límite (RN-04).
- Lista de AnnouncementRows: nombre del anuncio, fecha de vencimiento (en amarillo
  si quedan ≤7 días), métricas resumidas, badge de estado.
- Anuncios con vigencia vencida se muestran en una sección "Historial" con texto
  muted, contribuyendo al portafolio del emprendedor aunque sus datos ya no estén
  en el feed.

#### 3.4.3 Crear Nuevo Anuncio

SRS: RF-19, RF-22, RF-26, RF-27, RF-28, RF-31, RN-12

Propósito: Formulario completo de creación de anuncio con pipeline de moderación
automático.

Elementos:

- Encabezado con el nombre del proyecto al que pertenecerá el anuncio.
- ImageUploader: zona de tap para seleccionar imagen desde galería o cámara.
  Al seleccionar, comprime automáticamente con browser-image-compression antes del
  envío (máx. 500 KB / 1200px). Barra de progreso visible durante compresión
  ("Optimizando imagen...") y durante el upload ("Subiendo...").
- Campo título: máx. 120 caracteres con contador visible.
- Campo descripción: textarea de 3 filas, máx. 500 caracteres con contador.
- Selector de categoría: dropdown con los 3 grupos y 19 opciones + "Otro". Si se
  selecciona "Otro", aparece un campo de texto libre sujeto al filtro bad-words
  (RN-12).
- Selector de vigencia: date picker nativo. Mínimo mañana, máximo 365 días.
- Botón "Publicar anuncio" deshabilitado hasta que todos los campos requeridos
  estén completos. Estado loading durante el pipeline de moderación.
- Toast de feedback post-submit: "✓ Anuncio publicado" si es aprobado, o
  "⏳ En revisión por el administrador" si quedó pendiente.

#### 3.4.4 Panel de Notificaciones del Emprendedor

SRS: RF-25, RF-38

Propósito: Centro de notificaciones internas. Sin correo ni push.

Tipos de notificación y su presentación:

- Aprobado (verde): "✓ Anuncio aprobado. '[título]' ya está visible en el mural."
  Tap navega al anuncio en el feed.
- En revisión (amarillo): "⏳ '[título]' está siendo revisado por un administrador."
  Tap navega al anuncio en el panel.
- Por vencer (amarillo): "⚠ '[título]' vence en N días." Link directo "Renovar
  vigencia" → abre el editor del anuncio con foco en el campo de vigencia.
- Rechazado (rojo): "✗ '[título]' fue rechazado. Motivo: [motivo del admin]."
  Sin link (el anuncio ya no existe).
- Shadowban (naranja/acento): "⚠ Tu anuncio fue ocultado temporalmente por
  múltiples reportes. Se restaurará automáticamente en Xh si el administrador
  no toma acción." (RF-38).

### 3.5 FLUJO DEL ADMINISTRADOR (ROL-04)

#### 3.5.1 Panel de Moderación — Cola de Revisión

SRS: RF-29, RF-30, RF-37, RF-38

Propósito: Cola de trabajo del administrador con todos los anuncios pendientes
de revisión, ordenados por urgencia.

Elementos:

- Header con conteo de casos pendientes en la cola.
- Los casos con badge "🔴 URGENTE" (borde rojo pulsante) son los que cumplen la
  condición de RF-38 (≥5 reportes + ≥12h de inacción). Estos aparecen primero.
- Cada caso en la cola muestra:
  - El motivo del marcado: "Reporte múltiple (N reportes)", "Imagen inapropiada
    (Vision API — categoría: LIKELY adult)", "Hash similar (distancia N/64)" o
    "Vision API timeout" (con nota de que la IA no pudo analizar la imagen).
  - Datos del emprendedor: nombre, matrícula, proyecto.
  - Para casos de reporte: motivos agregados y conteo por tipo.
  - Para casos de urgencia: contador regresivo de tiempo restante antes del
    shadowban automático.
- Acciones por caso: "✓ Aprobar", "✗ Rechazar" (abre modal de motivo), y
  "⊘ Rechazar + Suspender cuenta" (requiere confirmación adicional).

#### 3.5.2 Comparativa de Imágenes (Hash Similar)

SRS: RF-28, RF-29, RF-30, RN-07

Propósito: Vista especializada para que el administrador evalúe visualmente si
dos imágenes son realmente un duplicado o simplemente temáticamente similares.

Elementos:

- Título: "Posible duplicado detectado".
- Distancia de Hamming exacta: "Distancia: 7/64 bits (umbral configurado: ≤10)".
  Este dato es valioso porque le permite al administrador calibrar si el umbral
  está bien ajustado para casos futuros.
- Imagen nueva e imagen existente mostradas del mismo tamaño.
- Bajo cada imagen: emprendedor, proyecto y fecha de publicación.
- Botones contextuales: "✓ Son imágenes diferentes — Aprobar" y "✗ Es la misma
  imagen — Rechazar".

#### 3.5.3 Generador de Código QR

SRS: RF-34

Propósito: Herramienta para que el administrador genere y descargue el QR físico.

Elementos:

- QR generado con la biblioteca qrcode npm, vinculado a la URL raíz de producción.
- URL visible bajo el QR para que también pueda copiarse manualmente.
- Botones: "⬇ Descargar PNG" (512×512px en alta resolución para impresión)
  y "🔗 Copiar enlace".
- Instrucciones de uso: imprimir en A5 o carta, plastificar si es posible.
- Nota de regeneración: si la URL cambia (dominio personalizado), el admin puede
  regenerar desde esta pantalla.

## SECCIÓN 4. ESPECIFICACIÓN DE API REST

La API sigue los principios REST con recursos identificados por URLs y verbos HTTP
semánticos. Todos los endpoints devuelven JSON. La autenticación utiliza cookies
HttpOnly con JWT (ADR-04 del SAD v1.3). Los endpoints protegidos requieren la
cookie de sesión; sin ella retornan HTTP 401. La documentación completa en formato
OpenAPI 3.0 se genera como swagger.json durante el desarrollo y se sirve en
/api-docs desde el servidor Express.

### 4.1 Autenticación

POST /auth/register/student — RF-01 Registro ROL-02 (matrícula)
POST /auth/register/entrepreneur — RF-02 Registro ROL-03 (mat+pass+wa+display_name)
Crea users + entrepreneur_profiles
en transacción atómica (ADR-09)
POST /auth/login — RF-03–05 Login. Emite cookie HttpOnly
POST /auth/logout Cookie RF-06 Invalida sesión, borra cookie
POST /auth/claim-matricula — RF-35 Ticket de reclamo de matrícula

### 4.2 Feed y Anuncios

GET /announcements Opcional RF-08 Feed por cursor. ?cursor=&limit=20&category=
GET /announcements/:id Opcional RF-10 Detalle. Genera wa.me si auth
POST /announcements ROL-03 RF-19 Crear anuncio + pipeline moderación
PATCH /announcements/:id ROL-03 RF-20 Editar. Re-modera si cambia imagen
DELETE /announcements/:id ROL-03 RF-21 Eliminar + borrar en Cloudinary

### 4.3 Proyectos

GET /projects ROL-03 RF-15 Lista proyectos del emprendedor
POST /projects ROL-03 RF-15 Crear. Valida límite N=5
GET /projects/:id ROL-03 RF-16 Detalle con anuncios y métricas
PATCH /projects/:id ROL-03 RF-16 Editar nombre/descripción/categoría
PATCH /projects/:id/status ROL-03 RF-17 Cambiar active ↔ suspended
DELETE /projects/:id ROL-03 RF-18 Eliminar proyecto + anuncios

### 4.4 Interacciones

POST /announcements/:id/like ROL-02+ RF-12 Toggle like. Registra timestamp
POST /announcements/:id/rating ROL-02+ RF-13 Crear/actualizar valoración 1-3★
DELETE /announcements/:id/rating ROL-02+ RF-13 Retirar valoración activa
POST /announcements/:id/report ROL-02+ RF-36 Reportar. Evalúa RF-37 y RF-38

### 4.5 Notificaciones

GET /notifications ROL-03 RF-25 Lista notifs, ordenadas por fecha desc
PATCH /notifications/:id/read ROL-03 RF-25 Marcar como leída
PATCH /notifications/read-all ROL-03 RF-25 Marcar todas como leídas

### 4.6 Administración

GET /admin/moderation-queue ROL-04 RF-29 Cola por urgencia
PATCH /admin/announcements/:id/approve ROL-04 RF-30 Aprobar anuncio
POST /admin/announcements/:id/reject ROL-04 RF-30 Rechazar con motivo
POST /admin/users/:id/suspend ROL-04 RF-30 Suspender cuenta
GET /admin/claim-tickets ROL-04 RF-35 Tickets de reclamo pendientes
PATCH /admin/claim-tickets/:id/resolve ROL-04 RF-35 Resolver ticket
GET /admin/qr ROL-04 RF-34 Genera y devuelve QR PNG

### 4.7 Códigos de Respuesta HTTP

200 OK GET, PATCH, DELETE exitosos
201 Created POST exitoso (anuncio, proyecto, usuario creado)
202 Accepted Anuncio publicado pero queda en revisión pendiente
400 Bad Request Checksum inválido, campos faltantes, formato WhatsApp incorrecto
401 Unauthorized Cookie de sesión ausente o expirada
403 Forbidden Cuenta suspendida, o ROL-02 intentando acción de ROL-03
404 Not Found Anuncio o proyecto no encontrado
409 Conflict Matrícula ya registrada, reporte duplicado, límite alcanzado
413 Payload Too Large Imagen recibida supera 500 KB o 1200px (RF-31 segunda línea)
429 Too Many Requests Rate limit: >10 intentos de login por IP en 15 minutos
500 Internal Error Error inesperado. Log en servidor, mensaje genérico al cliente

## SECCIÓN 5. TRAZABILIDAD DDC ↔ SRS

| Pantalla / Componente            | ID wireframe | Requisitos SRS                    |
| -------------------------------- | ------------ | --------------------------------- |
| Feed Principal (visitante)       | WF-3.1.1     | RF-08, RNF-01, RNF-02             |
| Detalle de anuncio (visitante)   | WF-3.1.2     | RF-10, RF-11, RNF-04              |
| Pantalla de bienvenida           | WF-3.2.1     | RF-01, RF-02                      |
| Registro estudiante              | WF-3.2.2     | RF-01, RF-07, RN-01               |
| Registro emprendedor             | WF-3.2.3     | RF-02, RF-39, RNF-17, RN-09       |
| Login                            | WF-3.2.4     | RF-03, RF-04, RF-05               |
| Reclamo de matrícula             | WF-3.2.5     | RF-35, RN-02, RN-10               |
| Feed autenticado con filtros     | WF-3.3.1     | RF-08, RF-09, RF-12, RF-13, RF-14 |
| Modal de reporte                 | WF-3.3.2     | RF-36, RN-13                      |
| Panel principal emprendedor      | WF-3.4.1     | RF-15, RF-17, RF-23, RF-24        |
| Detalle de proyecto y portafolio | WF-3.4.2     | RF-16, RF-23, RF-24, RN-04        |
| Crear nuevo anuncio              | WF-3.4.3     | RF-19, RF-22, RF-26–28, RF-31     |
| Notificaciones del emprendedor   | WF-3.4.4     | RF-25, RF-38                      |
| Cola de moderación (admin)       | WF-3.5.1     | RF-29, RF-30, RF-37, RF-38        |
| Comparativa de imágenes (hash)   | WF-3.5.2     | RF-28, RF-29, RF-30, RN-07        |
| Generador de QR                  | WF-3.5.3     | RF-34                             |
| API /auth                        | Sección 4.1  | RF-01–07, RF-35, RF-39, RF-40     |
| API /announcements               | Sección 4.2  | RF-08, RF-10, RF-11, RF-19–21     |
| API /projects                    | Sección 4.3  | RF-15–18, RN-03                   |
| API /interactions                | Sección 4.4  | RF-12–14, RF-36, RN-08            |
| API /notifications               | Sección 4.5  | RF-25                             |
| API /admin                       | Sección 4.6  | RF-29, RF-30, RF-34, RF-35        |

================================================================================
FIN DEL DOCUMENTO
DDC – Mural Maz Lince v1.2
================================================================================
