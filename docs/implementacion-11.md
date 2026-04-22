# implementacion11.md
## Sprint 11 — Plan de implementación del frontend

**Proyecto:** Mural Maz Lince  
**Base documental:** PMP v1.4, SRS v1.4, SAD v1.3, DDC v1.2, wireframes-spec v1.0  
**Objetivo del sprint:** cerrar el frontend completo e integrado, alineado con el hito HITO-08 (“Frontend completo e integrado”) y con la arquitectura cliente-servidor/PWA definida en el SAD.  

Este documento no asume nombres de carpetas, variables, componentes existentes ni endpoints concretos fuera de los descritos en la documentación. El agente que lo ejecute debe descubrir esos datos en el repositorio, en los archivos de configuración y en la implementación actual antes de codificar. La regla es: nunca hardcodear una decisión que ya exista en el backend, en Railway, en `.env.example`, en el Swagger o en el código fuente.

---

## 0) Contexto funcional y técnico que gobierna este sprint

El frontend de Mural Maz Lince es una React SPA mobile-first, con Bootstrap 5, modo oscuro por defecto y comportamiento de PWA. Debe consumir la API REST del backend desplegado en Railway, usar cookies HttpOnly para autenticación y respetar la separación entre presentación e ինտeligencia de negocio definida en el SAD. El feed principal debe soportar paginación por cursor, scroll infinito, skeleton loading y comportamiento diferente entre visitante y usuario autenticado. Las interacciones y las vistas de emprendedor y administrador deben alinearse con los wireframes y con la trazabilidad SRS ↔ DDC ↔ SAD. El sistema visual usa los tokens BG_BASE, BG_CARD, BG_SURFACE, PRIMARY, SECONDARY, ACCENT, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER, STATUS_ACTIVE, STATUS_PENDING y STATUS_REJECTED. La tipografía base es Inter. La implementación debe considerar que el backend ya incorpora checksum de matrícula, moderation pipeline, dHash, shadowban acotado, wha.me protegido y cookie HttpOnly.

---

## 1) Reglas operativas obligatorias para todo el sprint

1. No asumir nombres de variables de entorno, rutas de assets, nombres de carpetas, estructura de componentes ni el valor exacto de la URL de producción. Todo eso debe detectarse leyendo el repositorio, la configuración actual y el despliegue de Railway.
2. No copiar lógica de negocio al frontend. El frontend consume y presenta; el backend decide.
3. No exponer datos sensibles del emprendedor en el cliente cuando la arquitectura indique lo contrario. En particular, el número de WhatsApp no debe renderizarse para ROL-01.
4. No introducir una segunda fuente de verdad para estados del anuncio, likes, ratings, reports, moderation queue o notificaciones.
5. Cada componente reutilizable debe quedar aislado, parametrizable y trazable a su equivalente de wireframe.
6. Cada feature debe incluir validación visual, validación funcional y validación de integración con API.
7. Cada implementación debe terminar con un criterio de verificación explícito. Si algo no puede verificarse de forma local, debe indicarse cómo comprobarlo contra staging o producción.
8. Si una dependencia ya existe en el proyecto, se reutiliza; si no existe, se agrega solo si es necesaria y coherente con la arquitectura documentada.
9. El comportamiento readonly debe ser realmente readonly: no basta con deshabilitar visualmente; el estado debe impedir mutación y disparar el UX correcto.
10. Todo texto visible al usuario debe respetar el lenguaje y la microcopy definidos por los wireframes.

---

## 2) Orden recomendado de trabajo dentro del sprint

1. Inicializar el frontend y dejarlo ejecutable.
2. Resolver la configuración de entorno y la URL del backend.
3. Montar el sistema de diseño base.
4. Construir los componentes reutilizables.
5. Implementar las pantallas del visitante.
6. Implementar autenticación y sus flujos asociados.
7. Implementar el feed autenticado con filtros e ինտeracciones.
8. Implementar el modal de reporte.
9. Implementar el panel del emprendedor.
10. Implementar el panel del administrador.
11. Integrar manifest, Service Worker y comportamiento PWA.
12. Conectar todos los flujos con el backend y validar en staging/producción.
13. Documentar funciones críticas con JSDoc.

Este orden minimiza retrabajo, porque primero se fijan las bases visuales y de infraestructura, después se implementan componentes puros, y solo al final se ensamblan las pantallas completas con API.

---

## 3) Tarea 1 — Inicializar el proyecto React e instalar dependencias

### Objetivo
Crear el frontend ejecutable de forma limpia, con la estructura base del proyecto y las dependencias mínimas para estilos, formularios, interacción visual y compresión de imagen.

### Decisión técnica
Usar el scaffold que mejor encaje con el estado real del repositorio. La instrucción del sprint permite Create React App o Vite; la elección debe basarse en lo que ya exista en el código, en el CI y en la compatibilidad con la configuración actual. Si ya hay un frontend parcial, no se reemplaza sin justificación documentada.

### Pasos de implementación
1. Inspeccionar el repositorio para detectar si ya existe una carpeta `frontend/`, un `package.json` raíz o un frontend previo.
2. Determinar si el proyecto se trabaja como monorepo o como app aislada.
3. Crear el frontend con el scaffold compatible con la estructura existente.
4. Instalar Bootstrap 5.
5. Instalar `browser-image-compression`.
6. Instalar cualquier dependencia mínima adicional que resulte estrictamente necesaria para el diseño y la navegación si ya está alineada con el ecosistema del proyecto.
7. Verificar que el proyecto levante en modo desarrollo sin errores de build.
8. Confirmar que la estructura de archivos soporte la futura segmentación por componentes, páginas, hooks, servicios y utilidades.

### Qué debe descubrir el agente antes de tocar código
- Si el repo usa npm, yarn o pnpm.
- Si hay workspaces.
- Si la app vive en `frontend/` o en la raíz.
- Si el backend ya define convenciones de nombres para assets o rutas públicas.
- Si ya hay una estrategia de lint o formatting específica.

### Criterios de validación
- El comando de desarrollo inicia sin fallar.
- Bootstrap se carga correctamente en la app.
- `browser-image-compression` queda importable desde el código del frontend.
- No se rompen scripts ya existentes.
- La compilación produce un bundle funcional.
- Existe una ruta de arranque visible en navegador.

### Evidencia de cumplimiento
- Captura o log del inicio exitoso.
- Commit o cambio equivalente donde se vea la instalación de dependencias y la estructura inicial.
- Si hay frontend previo, evidencia de que no se duplicó la app.

---

## 4) Tarea 2 — Configurar variables de entorno del frontend

### Objetivo
Dejar el frontend preparado para consumir el backend de Railway sin hardcodear URLs ni valores de ambiente.

### Regla crítica
No escribir un valor inventado para `REACT_APP_API_URL`. La URL correcta debe obtenerse del despliegue real, del `.env.example`, de la configuración de Railway o del README del repo si allí ya está documentada.

### Pasos de implementación
1. Localizar el archivo `.env.example` del proyecto y revisar qué variables frontend ya están documentadas.
2. Buscar la convención de nomenclatura usada por el backend y por los scripts del repositorio.
3. Crear el `.env` local del frontend solo con variables necesarias para desarrollo.
4. Confirmar cuál es la variable efectiva para la base URL de la API en la app React.
5. Implementar una capa de acceso a configuración que lea la variable del entorno y normalice el valor.
6. Asegurar que el código no falle si la variable falta, sino que emita un error claro en desarrollo.
7. Verificar que la variable apunte al backend de Railway en staging o producción, según el entorno de trabajo.

### Qué debe descubrir el agente
- Nombre exacto de la variable usada por la app.
- Si el proyecto usa prefijo `REACT_APP_` o equivalente del scaffold.
- Si la URL está presente en README, Railway, `.env.example` o documentación.
- Si el backend expone una ruta base como `/api`.

### Criterios de validación
- El frontend resuelve su base URL desde entorno.
- No hay URLs de Railway hardcodeadas en los servicios.
- Los requests salen contra la base correcta.
- En caso de variable faltante, el error es explícito y fácil de diagnosticar.
- El build de producción no filtra secretos.

### Evidencia de cumplimiento
- Archivo `.env` local funcional.
- Archivo de configuración de API con lectura desde entorno.
- Request de prueba exitoso contra una ruta real del backend.

---

## 5) Tarea 3 — Implementar el sistema de diseño base

### Objetivo
Establecer la capa visual base del frontend: tokens CSS, tema oscuro global, tipografía Inter y variables reutilizables consistentes con el DDC y los wireframes.

### Alcance técnico
- Variables CSS globales.
- Theme dark por defecto.
- Importación de Inter desde Google Fonts.
- Normalización visual para toda la app.
- Base para botones, tarjetas, inputs, badges, modales, chips y estados.

### Pasos de implementación
1. Crear un archivo global de variables CSS, idealmente en el nivel más alto del frontend.
2. Definir los tokens: BG_BASE, BG_CARD, BG_SURFACE, PRIMARY, SECONDARY, ACCENT, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER, STATUS_ACTIVE, STATUS_PENDING, STATUS_REJECTED.
3. Definir variables de soporte: radio, sombras, spacing, z-index, duration de transición y opacidades.
4. Asegurar que `body`, `html` y el contenedor raíz hereden el fondo oscuro.
5. Importar Inter desde Google Fonts de forma global.
6. Definir tipografía base, line-height, antialiasing y color de texto.
7. Normalizar links, botones, inputs, selects, textarea y tooltips para que hereden el sistema visual.
8. Establecer estados visuales para focus, hover, disabled y error.
9. Verificar contraste en los elementos más frecuentes según la paleta oficial.

### Qué debe descubrir el agente
- Dónde conviene inyectar la hoja global si ya existe una arquitectura de estilos.
- Si Bootstrap se usará con overrides CSS o con un archivo de theme adicional.
- Si el proyecto ya tiene CSS Modules, SCSS o una convención distinta.

### Criterios de validación
- Todo el frontend adopta el fondo oscuro sin estilos inline improvisados.
- La tipografía Inter se renderiza correctamente.
- Los tokens quedan reutilizables desde cualquier componente.
- Los estados visuales son consistentes en tarjetas, botones y chips.
- No hay valores de color arbitrarios fuera de la paleta.

### Evidencia de cumplimiento
- Archivo de variables globales y theme base.
- Pantalla de prueba o primer layout donde se aprecie la identidad visual.
- Captura de los tokens aplicados en un componente real.

---

## 6) Tarea 4 — Implementar componentes reutilizables

### Objetivo
Construir los componentes atómicos y compuestos que sostienen toda la interfaz del sprint.

### Regla de diseño
Cada componente debe aceptar props suficientes para reutilizarse en más de una pantalla y debe mantener un comportamiento compatible con los modos visitante, autenticado, emprendedor y administrador.

### 6.1 AnnouncementCard

#### Función
Tarjeta del feed con imagen, título, categoría, likes, rating y nombre del emprendedor desde `display_name`.

#### Requisitos de implementación
- Soportar estado normal y skeleton.
- Mostrar imagen con aspect ratio coherente con el diseño.
- Truncar título y descripción según wireframe.
- Mostrar el nombre público del emprendedor, no datos internos.
- Integrar CategoryBadge, StarRating y LikeButton.
- Exponer evento de navegación al detalle.

#### Validación
- Renderiza correctamente en feed de visitante.
- Renderiza correctamente en feed autenticado.
- No rompe cuando faltan datos parciales.
- Muestra skeleton mientras carga.

### 6.2 CategoryBadge

#### Función
Chip de categoría con color por grupo.

#### Requisitos de implementación
- Recibir nombre de categoría, grupo o clase visual.
- Derivar color de grupo según la clasificación del sistema.
- Soportar estado default, selected y disabled.
- Mantener ancho y truncado adecuados.

#### Validación
- Cada grupo visual se distingue de manera consistente.
- No usa colores fuera de la guía.
- Se ve estable en scroll horizontal.

### 6.3 StarRating

#### Función
Componente de 3 estrellas con modo interactivo y modo solo lectura.

#### Requisitos de implementación
- Precisar que la escala es de 1 a 3.
- Modo interactivo para ROL-02 y ROL-03.
- Modo readonly para ROL-01.
- Tooltip “Regístrate para valorar” en modo visitante.
- Animación táctil o de tap al seleccionar.
- Permitir cálculo visual de promedio en modo lectura.

#### Validación
- Las 3 estrellas representan exactamente la escala del sistema.
- El modo readonly no dispara mutación.
- El modo interactivo actualiza el valor y el estado visual.
- El tooltip aparece solo donde corresponde.

### 6.4 LikeButton

#### Función
Toggle con animación de pop y contador.

#### Requisitos de implementación
- Estados activo e inactivo.
- Animación pop al activar.
- Incremento/decremento del contador.
- Modo readonly para visitante.
- Registro de timestamp de acciones para lógica del umbral de intención.

#### Validación
- El contador cambia correctamente.
- La UI no miente cuando la acción se revierte.
- El modo visitante no permite mutación.
- El timestamp se registra para análisis del backend o store local.

### 6.5 StatusBadge

#### Función
Badge semántico para estado del anuncio.

#### Requisitos de implementación
- Estados al menos para activo, pending_review, rejected y shadowban.
- Mapeo visual por color semántico.
- Texto corto y reconocible.
- Fallback si llega un estado no esperado.

#### Validación
- Cada estado tiene identidad visual clara.
- No rompe si el backend agrega un estado nuevo.
- Puede usarse en panel del emprendedor y del admin.

### 6.6 NotificationDot

#### Función
Punto rojo sobre ícono de notificaciones.

#### Requisitos de implementación
- Solo visible cuando hay notificaciones no leídas.
- Tamaño pequeño, sin invadir el ícono.
- Debe ser compatible con campana, panel u otro icono.

#### Validación
- Se muestra y oculta sin reflow extraño.
- Solo aparece para estados verdaderamente no leídos.
- No bloquea el click del ícono principal.

### 6.7 ImageUploader

#### Función
Zona de drag/tap con compresión, barra de progreso y preview.

#### Requisitos de implementación
- Soportar drag and drop y selección por tap.
- Comprimir con `browser-image-compression`.
- Mostrar progreso de compresión y de subida.
- Mostrar preview local de la imagen.
- Validar tamaño y dimensión objetivo antes de subir.
- Manejar error, retry y cancelación.
- Preparar la imagen para el pipeline del backend.

#### Variables y límites a descubrir
- Límite real de KB y píxeles según backend/SRS/DDC.
- Formatos aceptados.
- Ruta real de subida.

#### Validación
- La compresión reduce efectivamente el peso.
- El preview aparece antes del upload.
- El progreso no se queda congelado.
- El componente rechaza archivos inválidos con mensaje claro.
- El flujo llega al backend con un archivo aceptable.

### 6.8 ReportModal

#### Función
Modal con motivos, confirmación y manejo de reporte duplicado.

#### Requisitos de implementación
- Lista de motivos alineada a la API.
- Confirmación antes de enviar.
- Estado de ya reportado.
- Manejo explícito de conflicto o duplicado.
- Cierre controlado tras éxito o error.

#### Validación
- No permite enviar sin motivo.
- Si el backend devuelve duplicado, se muestra estado correcto.
- El flujo no duplica reportes desde la UI.
- El modal queda reutilizable para ROL-02 y ROL-03.

### 6.9 ToastNotification

#### Función
Feedback flotante para acciones exitosas, errores, advertencias o información.

#### Requisitos de implementación
- Posición no intrusiva.
- Auto dismiss configurable.
- Tipos semánticos claros.
- Soporte para múltiples toasts en cola.

#### Validación
- Los mensajes aparecen en la esquina o zona definida sin tapar acciones críticas.
- No persisten más tiempo del debido.
- No requieren recarga para actualizarse.

---

## 7) Tarea 5 — Implementar WF-3.1.1 Feed Principal

### Objetivo
Construir el feed de visitante con scroll infinito, paginación por cursor y comportamiento de solo lectura.

### Requisitos clave del wireframe y SRS
- Feed principal sin autenticación.
- Scroll infinito vertical.
- Carga al llegar al 80% del scroll.
- Bloques de 20 anuncios.
- Skeleton loading.
- StarRating y LikeButton en readonly para visitante.
- Tooltip “Regístrate para valorar”.

### Pasos de implementación
1. Crear la pantalla principal del feed.
2. Renderizar la NavBar superior con el logo y el nombre del proyecto.
3. Consultar la API con cursor y límite.
4. Guardar el cursor siguiente devuelto por el backend.
5. Activar la siguiente carga cuando el scroll alcance el umbral del 80%.
6. Mostrar skeleton mientras llega la respuesta.
7. Renderizar AnnouncementCard para cada anuncio.
8. Mantener el orden cronológico esperado por el backend.
9. Activar la navegación al detalle desde la tarjeta.
10. Implementar el estado final del feed cuando no hay más resultados.

### Qué debe descubrir el agente
- Nombre exacto del endpoint del feed.
- Estructura real de la respuesta.
- Nombre del campo cursor siguiente.
- Campos reales del anuncio y del perfil del emprendedor.

### Criterios de validación
- La primera carga muestra contenido o skeleton.
- La segunda carga ocurre en el umbral configurado.
- El cursor avanza sin repetir anuncios.
- El visitante no puede mutar likes ni ratings.
- El tooltip aparece al intentar interactuar.
- El final del feed se muestra correctamente cuando no hay más datos.

### Evidencia de cumplimiento
- Video o captura del scroll infinito.
- Respuesta de API visible en DevTools.
- Confirmación de readonly real.

---

## 8) Tarea 6 — Implementar WF-3.1.2 Detalle de Anuncio

### Objetivo
Construir la vista completa de un anuncio para visitante, respetando la restricción de privacidad del contacto.

### Requisitos clave
- Imagen completa.
- Descripción completa.
- Enlace wa.me solo para usuarios autenticados.
- Botón de reporte oculto para ROL-01.
- Bloque de contacto bloqueado para visitante.

### Pasos de implementación
1. Crear la pantalla de detalle con parámetro de id.
2. Cargar datos del anuncio desde la API.
3. Renderizar imagen, título, categoría, nombre del emprendedor, métricas y fecha.
4. Mostrar el bloque de contacto bloqueado si el usuario es visitante.
5. No renderizar el número de WhatsApp ni el enlace wa.me para ROL-01.
6. Ocultar el botón de reporte para ROL-01.
7. Habilitar navegación de regreso conservando contexto de scroll si el diseño lo exige.
8. Preparar la variante autenticada donde sí aparezca el enlace wa.me.

### Qué debe descubrir el agente
- Cómo identifica el frontend el rol actual.
- Si la app usa cookie-based session y un endpoint de perfil actual.
- Si el detalle del anuncio recibe datos completos o parciales desde la lista.

### Criterios de validación
- El visitante nunca ve ni puede inspeccionar el número de WhatsApp en DOM.
- El detalle presenta la información esperada.
- El botón de reporte no aparece para ROL-01.
- El enlace de contacto solo aparece cuando el backend y el rol lo permiten.
- La vista maneja estados de carga, error y no encontrado.

### Evidencia de cumplimiento
- Inspección de DOM sin exposición del WhatsApp para ROL-01.
- Captura del detalle con el bloque bloqueado.
- Captura de la variante autenticada si ya existe sesión.

---

## 9) Tarea 7 — Implementar WF-3.2.x Flujos de autenticación

### Objetivo
Construir el onboarding y los flujos de acceso: bienvenida, registro estudiante, registro emprendedor, login y reclamo de matrícula.

### 9.1 WF-3.2.1 Pantalla de bienvenida

#### Pasos
- Renderizar logo, tagline y CTA principal.
- Ofrecer ruta de exploración sin cuenta.
- Ofrecer rutas separadas para registro estudiante y emprendedor.
- Incluir enlace a login existente.

#### Validación
- Todas las rutas navegan a las pantallas correctas.
- El layout coincide con el foco visual definido en wireframes.

### 9.2 WF-3.2.2 Registro como estudiante

#### Pasos
- Implementar el campo de matrícula.
- Validar checksum en tiempo real.
- Mostrar ícono de validación.
- Deshabilitar CTA hasta que la matrícula sea válida.
- Agregar enlace condicional al flujo de reclamo si la matrícula ya existe como ROL-02.

#### Validación
- La matrícula válida habilita el submit.
- La matrícula inválida no permite continuar.
- La detección de conflicto de matrícula se sincroniza con el backend.

### 9.3 WF-3.2.3 Registro como emprendedor

#### Pasos
- Reutilizar el campo de matrícula con las mismas validaciones.
- Agregar contraseña con visible/hidden toggle.
- Agregar display_name obligatorio.
- Validar bad-words al perder el foco.
- Aplicar mínima longitud aceptable.
- Agregar checkbox obligatorio de aviso de privacidad.
- Agregar campo de WhatsApp con nota de privacidad.
- Deshabilitar el submit hasta cumplir todos los requisitos.

#### Validación
- La contraseña cumple la política real del backend.
- El display_name no admite lenguaje inapropiado.
- El checkbox es obligatorio.
- La matrícula, WhatsApp y display_name son consistentes con el backend.
- El flujo crea usuario y perfil de emprendedor según la arquitectura definida.

### 9.4 WF-3.2.4 Inicio de sesión

#### Pasos
- Permitir entrada de matrícula.
- Mantener la contraseña opcional según lo documentado.
- Detectar cuenta suspendida.
- Redirigir según el rol autenticado.
- Manejar errores de credenciales y formato.

#### Validación
- Un login válido redirige correctamente.
- Una cuenta suspendida recibe el estado adecuado.
- La UI no revela información interna innecesaria.
- El caso sin contraseña funciona si el backend lo permite para el rol correspondiente.

### 9.5 WF-3.2.5 Reclamo de matrícula

#### Pasos
- Mostrar el estado de matrícula en uso.
- Permitir iniciar sesión con esa matrícula.
- Permitir reclamarla con número de WhatsApp.
- Mostrar el formulario expandible.
- Confirmar reclamo y manejar respuesta de ticket creado.

#### Validación
- El ticket se genera solo una vez por flujo válido.
- La UI muestra el conflicto de matrícula de forma clara.
- El estado de reporte o reclamo duplicado se maneja sin ambigüedad.

---

## 10) Tarea 8 — Implementar WF-3.3.1 Feed autenticado con filtros

### Objetivo
Habilitar el feed completo para usuarios autenticados con chips de categoría y acciones interactivas reales.

### Requisitos clave
- Chips horizontales bajo la NavBar.
- “Todos” activo por defecto.
- Interacciones activas.
- Lógica del umbral de intención.
- Registro de timestamp de cada acción.
- Reversión en menos de 5 segundos marcada como accidental sin feedback visual especial.

### Pasos de implementación
1. Reutilizar el feed base de visitante.
2. Agregar la barra sticky de chips.
3. Implementar el filtro “Todos”.
4. Cargar chips desde la lista de categorías del backend.
5. Habilitar LikeButton y StarRating interactivos.
6. Registrar timestamp local de la acción y la reversión.
7. Aplicar optimistic UI con rollback controlado.
8. Marcar la interacción como accidental si se revierte antes del umbral.
9. Mantener el mismo comportamiento visual sin feedback especial adicional para la reversión accidental.

### Qué debe descubrir el agente
- Cómo el backend identifica interacciones accidentales o si el frontend solo registra timestamps.
- Cómo se persisten likes y ratings.
- Estructura real de categorías.

### Criterios de validación
- Los chips filtran correctamente el feed.
- El usuario autenticado puede interactuar.
- La reversión rápida no altera el UX con aviso especial.
- El timestamp queda registrado.
- El frontend y el backend concuerdan en el estado final de la interacción.

### Evidencia de cumplimiento
- Captura de filtros aplicados.
- Prueba de like/rating activo y reversión rápida.
- Verificación de que la interacción accidental se marca según la lógica definida.

---

## 11) Tarea 9 — Implementar WF-3.3.2 Modal de reporte de anuncio

### Objetivo
Permitir reportar un anuncio con motivos definidos y tratamiento correcto del reporte duplicado.

### Pasos de implementación
1. Crear el modal reutilizable.
2. Cargar los motivos permitidos desde una constante o desde API si ya existe.
3. Solicitar confirmación explícita.
4. Enviar el reporte al endpoint correspondiente.
5. Manejar respuesta exitosa.
6. Manejar respuesta de conflicto por reporte duplicado.
7. Cerrar el modal al completar o al cancelar.

### Qué debe descubrir el agente
- Lista oficial de motivos.
- Respuesta exacta del backend ante duplicado.
- Si el modal debe poder llamarse desde el feed, detalle o ambos.

### Criterios de validación
- El anuncio solo puede reportarse una vez por usuario.
- El mensaje de duplicado se presenta correctamente.
- El modal no deja estados colgados.
- El cierre y reabrir mantienen consistencia.

### Evidencia de cumplimiento
- Captura de un reporte enviado.
- Captura del caso de reporte duplicado.
- Integración con la API real.

---

## 12) Tarea 10 — Implementar WF-3.4.x Panel completo del emprendedor

### Objetivo
Construir el área privada del emprendedor con panel principal, detalle de proyecto/portafolio, creación de anuncio y panel de notificaciones.

### 12.1 WF-3.4.1 Panel principal

#### Pasos
- Mostrar saludo personalizado.
- Mostrar conteos de proyectos y anuncios activos.
- Listar proyectos con estado y métricas resumidas.
- Permitir crear nuevo proyecto, ver detalle, crear anuncio y acceder a menú de acciones.
- Respetar el límite de proyectos activos.

#### Validación
- El saludo usa el nombre correcto.
- Los contadores reflejan datos reales.
- El límite de proyectos activos bloquea la creación cuando corresponde.
- Las acciones navegan correctamente.

### 12.2 WF-3.4.2 Detalle de proyecto y portafolio

#### Pasos
- Mostrar el proyecto en detalle.
- Mostrar anuncios activos y vencidos.
- Mostrar historial como portafolio.
- Incluir métricas con umbral de intención aplicado.
- Mostrar contador de anuncios activos frente al límite.

#### Validación
- El portafolio conserva anuncios vencidos.
- Las métricas respetan la ventana de intención.
- El estado del proyecto es visible.
- La interfaz distingue historial de activos.

### 12.3 WF-3.4.3 Crear nuevo anuncio

#### Pasos
- Conectar ImageUploader.
- Implementar selector de vigencia.
- Implementar título, descripción y categoría.
- Integrar validación bad-words para categoría personalizada.
- Enviar al backend con pipeline de moderación.
- Manejar estados activo, pending_review y rechazo si aplica.

#### Validación
- La imagen se comprime antes de subir.
- La vigencia se guarda correctamente.
- El anuncio se crea con el estado esperado.
- El formulario bloquea el submit si falta un campo obligatorio.
- La pantalla reacciona correctamente a error, éxito y revisión pendiente.

### 12.4 WF-3.4.4 Panel de notificaciones

#### Pasos
- Listar los 5 tipos de mensaje definidos por el sistema.
- Marcar no leídas y leídas.
- Mostrar NotificationDot cuando aplique.
- Ordenar por fecha descendente.

#### Validación
- Cada tipo de notificación se presenta con el texto correcto.
- El badge o dot responde a no leídas.
- Marcar como leído actualiza la UI y la API.

---

## 13) Tarea 11 — Implementar WF-3.5.x Panel de administrador

### Objetivo
Construir la consola de moderación, comparativa de hashing y generador de QR.

### 13.1 WF-3.5.1 Cola de moderación

#### Pasos
- Cargar la cola ordenada por urgencia.
- Resaltar los anuncios en alerta de urgencia con badge pulsante.
- Mostrar información necesaria para aprobar, rechazar o suspender.
- Permitir decisión humana explícita.
- Mantener trazabilidad de decisión.

#### Validación
- El orden de urgencia coincide con el backend.
- La alerta pulsante aparece solo donde corresponde.
- Las acciones de admin actualizan el estado y la cola.
- No se toma ninguna decisión autónoma fuera del diseño.

### 13.2 WF-3.5.2 Vista comparativa lado a lado para hashing

#### Pasos
- Renderizar las dos imágenes comparadas.
- Mostrar metadatos relevantes de hash.
- Permitir revisar diferencia visual.
- Mostrar la distancia o señal de similitud si el backend la expone.

#### Validación
- La comparativa ayuda a la revisión humana.
- Las imágenes están alineadas de forma clara.
- El estado visual no induce una decisión automática falsa.

### 13.3 WF-3.5.3 Generador de QR

#### Pasos
- Consumir la URL/endpoint de QR del backend.
- Mostrar el QR generado.
- Habilitar descarga PNG.
- Mostrar instrucciones de uso.

#### Validación
- El PNG descargado es válido.
- El QR apunta a la URL correcta de la plataforma.
- La vista funciona para admin autenticado.

---

## 14) Tarea 12 — Configurar manifest.json para PWA

### Objetivo
Hacer instalable la aplicación como PWA con el nombre, color de tema e íconos correctos.

### Requisitos
- `name`: `Mural Maz Lince`
- `theme_color`: `#961749`
- `display`: `standalone`
- Íconos en múltiples resoluciones

### Pasos de implementación
1. Crear o actualizar el `manifest.json` del frontend.
2. Confirmar el nombre exacto solicitado.
3. Usar el color de tema documentado.
4. Declarar display standalone.
5. Registrar los íconos en varias resoluciones.
6. Verificar que el manifest sea servido públicamente.
7. Validar la instalación desde navegador compatible.

### Criterios de validación
- El navegador reconoce la app como instalable.
- El nombre mostrado es el correcto.
- El color de tema coincide con la identidad visual.
- Los íconos no se ven pixelados en tamaños estándar.

---

## 15) Tarea 13 — Configurar el Service Worker

### Objetivo
Habilitar caché offline parcial y estrategias diferentes por tipo de recurso.

### Requisitos
- Cache-First para recursos estáticos: HTML, CSS, JS, íconos.
- Network-First para llamadas al API del feed.
- Fallback de feed cacheado cuando no hay conexión.

### Pasos de implementación
1. Definir si el proyecto usa Workbox, service worker manual o soporte PWA existente.
2. Implementar caché de estáticos con estrategia Cache-First.
3. Implementar estrategia Network-First para API del feed.
4. Añadir fallback de feed cacheado.
5. Asegurar invalidación de caché cuando se publica una nueva versión.
6. Verificar comportamiento offline y online.
7. Confirmar que el service worker no rompe autenticación por cookies.

### Qué debe descubrir el agente
- Si existe ya un service worker base.
- Qué assets estáticos deben incluirse.
- Si hay un manifest o precache previo.
- Si las respuestas del feed son cacheables sin violar consistencia funcional.

### Criterios de validación
- Los assets estáticos se sirven desde caché tras la primera carga.
- El feed intenta red contra red primero.
- Sin conexión, el fallback muestra contenido previamente cacheado.
- La app no queda en blanco offline.
- El service worker se actualiza sin congelar versiones antiguas.

---

## 16) Tarea 14 — Integrar el frontend con todos los endpoints del backend en Railway

### Objetivo
Cerrar la integración funcional completa entre frontend y backend, validando que cada flujo funciona en producción o staging real.

### Pasos de implementación
1. Levantar una lista real de endpoints desde Swagger/OpenAPI o desde el backend.
2. Mapear cada pantalla y componente a su endpoint correspondiente.
3. Verificar headers, cookies, credenciales y CORS.
4. Confirmar que la base URL del frontend apunta al backend de Railway correcto.
5. Probar login, logout, feed, detalle, reporte, proyecto, anuncio, notificaciones, admin y QR.
6. Corregir errores de integración en base a respuestas reales.
7. Validar que el frontend no depende de mocks para flujos críticos.
8. Ejecutar el recorrido completo en ambiente de producción o staging desplegado.

### Qué debe descubrir el agente
- URL real de backend en Railway.
- Variables CORS.
- Rutas exactas publicadas.
- Códigos de respuesta esperados en cada flujo.

### Criterios de validación
- Todos los flujos funcionales llegan al backend correcto.
- Las cookies HttpOnly funcionan en navegador real.
- No hay errores de CORS.
- No hay endpoints rotos en recorridos críticos.
- El frontend funciona en un navegador de producción.

### Evidencia de cumplimiento
- Checklist de flujo completo ejecutado.
- Logs de consola y red.
- Capturas de éxito por pantalla crítica.

---

## 17) Tarea 15 — Elaborar documentación del código fuente con JSDoc

### Objetivo
Documentar las funciones clave de los módulos críticos: checksum, dHash, moderación y métricas.

### Alcance
Aunque estas funciones pueden estar en el backend, este sprint pide documentación del código fuente de los módulos críticos. Por tanto, el agente debe documentar la interacción del frontend con dichas funciones cuando haya wrappers, utilidades o helpers en el frontend, y mantener coherencia con la documentación técnica global.

### Qué documentar
- Funciones de validación relacionadas con checksum de matrícula si existen helpers compartidos.
- Utilidades de hash o comparación visual si existen en el frontend.
- Manejadores de estado para moderación o indicadores derivados.
- Cálculo y presentación de métricas si hay lógica de apoyo en el cliente.
- Cualquier hook, util o helper que participe en los flujos críticos.

### Criterios de JSDoc
- Descripción clara del propósito.
- Parámetros con tipo y significado.
- Valor de retorno.
- Posibles errores o excepciones.
- Efectos secundarios.
- Ejemplo de uso si la función es suficientemente crítica.

### Validación
- Las funciones principales del frontend quedan documentadas.
- El JSDoc es consistente con el comportamiento real.
- No documenta supuestos falsos.
- No deja comentarios vacíos ni genéricos.

---

## 18) Checklist final de cumplimiento del sprint

El sprint se considera cerrado cuando se verifica todo lo siguiente:

- El frontend arranca y compila correctamente.
- La configuración de entorno consume la URL real del backend.
- El sistema de diseño base está aplicado en toda la interfaz.
- Los componentes reutilizables existen y funcionan.
- WF-3.1.1 y WF-3.1.2 están operativos.
- Los flujos de autenticación están integrados.
- El feed autenticado con filtros funciona.
- El modal de reporte funciona y maneja duplicados.
- El panel del emprendedor está completo.
- El panel del administrador está completo.
- El manifest PWA está operativo.
- El Service Worker responde con las estrategias definidas.
- La integración con Railway funciona en los flujos clave.
- Las funciones críticas tienen documentación JSDoc.

---

## 19) Criterio de aceptación general del sprint 11

El sprint 11 se aprueba solo si el frontend queda suficientemente completo para demostrar todas las pantallas WF-3.x, con comportamiento coherente por rol, integración real con el backend, aspecto visual alineado al sistema de diseño y sin depender de datos inventados, mocks permanentes o variables asumidas. El entregable esperado no es solo una UI bonita: es una capa de presentación operativa, trazable y verificable contra la arquitectura y los requisitos.

