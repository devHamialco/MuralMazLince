# ESPECIFICACIÓN VISUAL DE WIREFRAMES
## Mural Maz Lince — v1.0
**Documento:** Guía de Diseño Visual por Pantalla  
**Referencia DDC:** v1.2 | **Referencia SRS:** v1.4 | **Referencia SAD:** v1.3  
**Elaborado por:** Miriam Alanis  
**Fecha:** Abril 2026

---

## CONVENCIONES DE ESTE DOCUMENTO

### Tokens de color (de la paleta oficial)
| Token | Hex | Nombre |
|---|---|---|
| `BG_BASE` | `#1A1A2E` | Fondo base de la app |
| `BG_CARD` | `#16213E` | Fondo de tarjetas |
| `BG_SURFACE` | `#0F3460` | NavBar, modales, panels |
| `PRIMARY` | `#C4184A` | Botones CTA, acentos |
| `SECONDARY` | `#194A8D` | Links, chips de categoría |
| `ACCENT` | `#F0C040` | Estrellas, badges especiales |
| `TEXT_PRIMARY` | `#FFFFFF` | Títulos, texto impacto |
| `TEXT_SECONDARY` | `#A0AEC0` | Descripciones, labels |
| `TEXT_MUTED` | `#718096` | Timestamps, metadatos |
| `BORDER` | `#2D3748` | Divisores |
| `STATUS_ACTIVE` | `#48BB78` | Badge "Publicado" |
| `STATUS_PENDING` | `#F0C040` | Badge "En revisión" |
| `STATUS_REJECTED` | `#E53E3E` | Badge "Rechazado" |

### Escala tipográfica
| Nivel | Tamaño | Peso | Uso |
|---|---|---|---|
| Display | 32px | 700 | Nombre de proyecto en portafolio |
| H1 | 24px | 700 | Títulos de sección en paneles |
| H2 | 20px | 600 | Nombre de proyecto en tarjeta |
| Body L | 16px | 400 | Descripción principal |
| Body S | 14px | 400 | Metadatos, categoría, fecha |
| Caption | 12px | 400 | Contadores, timestamps |
| Button | 14px | 600 | Texto de botones CTA |
| Badge | 12px | 600 | Etiquetas de estado y categoría |

### Convenciones de layout
- **Viewport:** 375px de ancho (móvil, base de diseño)
- **Padding horizontal:** 16px a cada lado → área de contenido: 343px
- **Border-radius tarjetas:** 12px
- **Gap vertical entre tarjetas:** 16px

---

## WF-3.1.1 — FEED PRINCIPAL (VISITANTE)

**SRS:** RF-08, RNF-01, RNF-02  
**Propósito:** Punto de entrada sin autenticación. Vista que se muestra al escanear el QR.

---

### BARRA DE NAVEGACIÓN SUPERIOR (NavBar)

**Dimensiones y posición:** Sticky (fija en la parte superior al hacer scroll), altura 56px, fondo `BG_SURFACE` (`#0F3460`), ancho 375px, `z-index` alto para mantenerse sobre el contenido.

**Contenido:**
- **Logo "◉ M"** — posicionado a 16px del borde izquierdo. El símbolo "◉" en color `PRIMARY` (`#C4184A`), tamaño 20px. La letra "M" en `TEXT_PRIMARY` (`#FFFFFF`), tamaño 20px, peso 700.
- **Nombre "MURAL MAZ LINCE"** — a la derecha del logo, separado 8px. Tipografía Body S (14px / 600), color `TEXT_PRIMARY`. Letras en mayúsculas.
- **Sin íconos de menú autenticado** — el extremo derecho de la NavBar está vacío, sin hamburguer, sin avatar, sin notificaciones.

---

### ÁREA DE CONTENIDO (Feed)

**Contenedor:** Fondo `BG_BASE` (`#1A1A2E`), padding horizontal 16px, padding top 16px desde la NavBar, scroll vertical infinito.

**Componente: AnnouncementCard (tarjeta de anuncio)**

Cada tarjeta es un contenedor con las siguientes propiedades:

- **Fondo:** `BG_CARD` (`#16213E`)
- **Border-radius:** 12px
- **Borde:** 1px sólido `BORDER` (`#2D3748`)
- **Padding interno:** 0px (la imagen toca los bordes superiores redondeados)
- **Sombra:** `box-shadow: 0 2px 8px rgba(0,0,0,0.3)`

**Zona de imagen (parte superior de la tarjeta):**
- Ancho: 343px (ancho completo de la tarjeta)
- Alto: 257px (ratio 4:3 aplicado al ancho de 343px)
- `object-fit: cover` — la imagen rellena el espacio recortando según sea necesario
- Border-radius heredado (12px en esquinas superiores, 0px en inferiores)
- Estado skeleton: rectángulo `BG_SURFACE` con animación de shimmer horizontal (gradiente de `#0F3460` a `#194A8D` a `#0F3460` desplazándose de izquierda a derecha cada 1.5s)

**Zona de contenido (parte inferior de la tarjeta):**
- Padding: 12px horizontal, 12px vertical
- Espacio entre elementos internos: 8px

**Fila 1 — Nombre del proyecto + CategoryBadge:**
- **Nombre del proyecto:** Tipografía H2 (20px / 600), color `TEXT_PRIMARY`, truncado a 1 línea con ellipsis si supera el ancho disponible (~230px dependiendo del badge).
- **CategoryBadge:** posicionado a la derecha del nombre. Chip de fondo `SECONDARY` (`#194A8D`), texto Badge (12px / 600) en `TEXT_PRIMARY`, padding 4px horizontal y 2px vertical, border-radius 4px. El texto del badge es el nombre de la categoría (máximo 18 caracteres visibles, resto con ellipsis).

**Fila 2 — Nombre visible del emprendedor:**
- Tipografía Body S (14px / 400), color `TEXT_SECONDARY` (`#A0AEC0`)
- Prefijado con un ícono de persona sutíl (16×16px, color `TEXT_SECONDARY`)
- Valor: `entrepreneur_profiles.display_name`

**Fila 3 — Descripción truncada:**
- Tipografía Body L (16px / 400), color `TEXT_SECONDARY`
- Limitada a 2 líneas con `-webkit-line-clamp: 2` y `overflow: hidden`
- Al final de la segunda línea: "… **Ver más**" — el texto "Ver más" en color `PRIMARY`, peso 600, no es un enlace independiente sino parte del flujo de texto truncado (tap en la tarjeta entera navega al detalle).

**Fila 4 — Métricas (likes, estrellas, timestamp):**
- Layout: flexbox, `justify-content: space-between`
- **LikeButton (modo readonly):** ícono de corazón outline en `TEXT_MUTED` (no relleno). Contador numérico a 4px de distancia, tipografía Caption (12px / 400) en `TEXT_MUTED`. No es interactivo: tap dispara CTA de registro.
- **StarRating (modo readonly):** 3 estrellas en fila horizontal, separadas 4px. Las estrellas mostradas corresponden al `average_rating` redondeado (ej: 2.7 → 2 estrellas llenas, 1 vacía). Color de estrella activa: `ACCENT` (`#F0C040`), vacía: `TEXT_MUTED`. Tamaño de ícono: 16×16px. No es interactivo: tap dispara CTA de registro.
- **Timestamp:** tipografía Caption (12px / 400), color `TEXT_MUTED`. Formato relativo: "hace 2h", "hace 3 días". Alineado al extremo derecho.

**Botón "Ver detalle":**
- Posición: debajo de la fila de métricas, separado 8px
- Ancho: 100% del contenido de la tarjeta (343px - 24px de padding = 319px)
- Alto: 40px
- Fondo: transparente
- Borde: 1px sólido `BORDER`
- Texto: "Ver detalle", tipografía Button (14px / 600), color `TEXT_SECONDARY`
- Border-radius: 8px
- Al activar: fondo `BG_SURFACE` con transición 150ms

---

### CTA STICKY DE REGISTRO (pie de pantalla)

**Visibilidad:** Aparece solo cuando el visitante intenta interactuar con LikeButton o StarRating (tap sobre cualquiera de los dos).

**Diseño:**
- Posición: fija en la parte inferior, ancho 375px, altura 64px
- Fondo: `BG_SURFACE` con `backdrop-filter: blur(8px)` para semi-transparencia
- Borde superior: 1px sólido `BORDER`
- Texto centrado: "Inicia sesión para interactuar", tipografía Body S (14px / 600), color `TEXT_PRIMARY`
- Todo el bloque es tappable y navega a WF-3.2.1 (Pantalla de Bienvenida)
- Aparece con animación `slide-up` de 200ms (translateY de 64px → 0)

---

### SKELETON LOADING

Mientras el primer bloque de 20 anuncios carga:
- Se muestran 3 tarjetas esqueleto apiladas verticalmente, gap 16px
- Imagen: rectángulo `BG_SURFACE` con shimmer, dimensiones 343×257px
- Nombre de proyecto: rectángulo redondeado 200×20px, color `BG_SURFACE`
- Nombre emprendedor: rectángulo 140×14px, color `BG_SURFACE`
- Descripción: dos rectángulos apilados (343×16px y 200×16px), gap 8px
- Animación shimmer simultánea en todos los elementos

---

### COMPORTAMIENTO DE PAGINACIÓN

- Al alcanzar el 80% del scroll total de la página, se dispara automáticamente la carga del siguiente bloque de 20 anuncios.
- Durante la carga del bloque siguiente, aparece un spinner circular de 24px en color `PRIMARY` centrado horizontalmente debajo del último anuncio visible.
- Si no hay más anuncios, el spinner se reemplaza por el texto "Has llegado al final del mural." (Caption, `TEXT_MUTED`, centrado).

---

## WF-3.1.2 — DETALLE DE ANUNCIO (VISITANTE)

**SRS:** RF-10, RF-11, RNF-04  
**Propósito:** Vista completa de un anuncio individual. El número de WhatsApp nunca se renderiza.

---

### HEADER DE NAVEGACIÓN

- Fondo `BG_SURFACE`, altura 56px, sticky
- Extremo izquierdo: botón "← Volver al Mural" — ícono de flecha izquierda (20×20px, `TEXT_PRIMARY`) + texto Body S (14px / 400) en `TEXT_PRIMARY`. Tap navega de regreso al feed con scroll en la posición previa.
- Extremo derecho: vacío (sin opciones de menú para ROL-01)

---

### IMAGEN PRINCIPAL

- Posición: inmediatamente debajo del header, sin padding lateral
- Dimensiones: 375px ancho × 250px alto
- `object-fit: cover`, `object-position: center`
- Sin border-radius (ocupa el ancho total del viewport)

---

### BLOQUE DE INFORMACIÓN PRINCIPAL

Contenedor con padding horizontal 16px, padding top 16px.

**Título del anuncio:**
- Tipografía H1 (24px / 700), color `TEXT_PRIMARY`
- Máximo 2 líneas, tercer desborde con ellipsis

**Fila: nombre del proyecto + badge de categoría:**
- **Nombre del proyecto:** Body L (16px / 400), color `SECONDARY` (`#194A8D`), actúa como enlace visual (subrayado sutil) hacia el portafolio público del emprendedor (navegación futura, en v1.0 sin destino activo).
- **CategoryBadge:** chip `SECONDARY`, texto Badge (12px / 600), `TEXT_PRIMARY`, padding 4px/2px, border-radius 4px. Separado 8px del nombre.

**Nombre del emprendedor:**
- Texto Body S (14px / 400), color `TEXT_SECONDARY`
- Prefijo: ícono de persona 16×16px en `TEXT_SECONDARY`
- Valor: `entrepreneur_profiles.display_name`

---

### BLOQUE DE MÉTRICAS

Layout: flexbox horizontal, `gap: 24px`, centrado, padding vertical 12px, separador top/bottom de 1px `BORDER`.

- **Rating:** ícono de estrella llena `ACCENT` 16×16px + número de promedio (Body S, `TEXT_PRIMARY`) + "(" + conteo de valoraciones + " valoraciones)" (Caption, `TEXT_MUTED`)
- **Likes:** ícono de corazón outline `TEXT_MUTED` 16×16px + número de likes (Body S, `TEXT_PRIMARY`) + " me gusta" (Caption, `TEXT_MUTED`)

---

### DESCRIPCIÓN COMPLETA

- Tipografía Body L (16px / 400), color `TEXT_SECONDARY`
- Sin truncar. Máximo 500 caracteres según RF-19. Padding horizontal 16px.

---

### FECHA DE VIGENCIA

- Icono de calendario 16×16px a la izquierda
- Texto: "Válido hasta:" + fecha (formato DD/MM/AAAA)
- Tipografía Body S (14px / 400)
- Color normal: `TEXT_MUTED`
- **Si quedan ≤ 7 días:** color `ACCENT` (`#F0C040`) para ambos (ícono y texto), para indicar urgencia

---

### BLOQUE DE CONTACTO (BLOQUEADO para ROL-01)

- Contenedor: fondo `BG_CARD`, border-radius 12px, borde 1px `BORDER`, padding 16px
- Ícono de candado cerrado (24×24px, `TEXT_MUTED`) centrado arriba
- Texto principal: "🔒 Inicia sesión para ver los datos de contacto" — Body S (14px / 400), `TEXT_SECONDARY`, centrado
- Botón CTA: "Crear cuenta o iniciar sesión", fondo `PRIMARY`, texto `TEXT_PRIMARY`, Button (14px / 600), alto 44px, ancho 100%, border-radius 8px. Navega a WF-3.2.1.
- **El enlace wa.me nunca se renderiza en ningún estado del DOM para ROL-01.** No existe en el HTML aunque esté inspeccionado.

---

### BOTÓN DE REPORTE

- **No visible para ROL-01.** El botón ⚐ está completamente ausente del HTML para este rol.

---

## WF-3.2.1 — PANTALLA DE BIENVENIDA / SELECCIÓN DE TIPO DE REGISTRO

**SRS:** RF-01, RF-02  
**Propósito:** Punto de decisión para crear cuenta o iniciar sesión. Primera pantalla post-QR.

---

### LAYOUT GENERAL

- Fondo: `BG_BASE` con degradado radial sutil en el centro superior: `radial-gradient(ellipse at 50% 0%, rgba(196,24,74,0.15) 0%, transparent 60%)`
- Sin NavBar
- Centrado verticalmente (flexbox columna, justify-content: center) con padding horizontal 24px

---

### BLOQUE SUPERIOR — LOGO E IDENTIDAD

- **Logo "◉ M":** centrado horizontalmente, tamaño 48px. El símbolo "◉" en `PRIMARY`, la "M" en `TEXT_PRIMARY`. Animación `fade-in` de 300ms al cargar la pantalla (`opacity: 0 → 1`).
- **Tagline:** "El mural emprendedor de tu universidad" — tipografía Body S (14px / 400), color `TEXT_SECONDARY`, centrado, margin-top 8px. Animación `fade-in` con delay 150ms.
- Espacio vertical entre logo y botones: 40px

---

### BOTÓN: "Explorar sin cuenta"

- Ancho: 100% (327px con padding de 24px a cada lado)
- Alto: 48px
- Fondo: transparente
- Borde: 1px sólido `BORDER`
- Texto: "Explorar sin cuenta", Button (14px / 600), color `TEXT_SECONDARY`
- Border-radius: 12px
- Al activar: fondo `BG_SURFACE`, transición 150ms
- Navega al feed WF-3.1.1 como ROL-01

---

### SEPARADOR VISUAL

- Layout: flexbox horizontal con línea divisora a cada lado del texto
- Líneas: 1px sólido `BORDER`, flexbox `flex: 1`
- Texto: "─── o regístrate ───", Caption (12px / 400), `TEXT_MUTED`, padding horizontal 12px
- Margin vertical: 16px

---

### BOTÓN: "Registrarme como Estudiante"

- Ancho: 100%, Alto: 48px
- Fondo: `SECONDARY` (`#194A8D`)
- Texto: "Registrarme como Estudiante", Button (14px / 600), `TEXT_PRIMARY`
- Border-radius: 12px
- Sin borde
- Al activar: `brightness(1.1)`, transición 150ms
- Navega a WF-3.2.2

---

### BOTÓN: "Registrarme como Emprendedor"

- Ancho: 100%, Alto: 48px
- Fondo: `PRIMARY` (`#C4184A`)
- Texto: "Registrarme como Emprendedor", Button (14px / 600), `TEXT_PRIMARY`
- Border-radius: 12px
- Sin borde
- Al activar: `brightness(1.1)`, transición 150ms
- Margin-top: 12px desde el botón anterior
- Navega a WF-3.2.3

---

### ENLACE DE LOGIN

- Posición: al fondo del bloque, margin-top 24px
- Texto: "¿Ya tienes cuenta? " + "Iniciar sesión"
- "¿Ya tienes cuenta?" — Body S (14px / 400), `TEXT_MUTED`
- "Iniciar sesión" — Body S (14px / 600), `PRIMARY`, subrayado. Tap navega a WF-3.2.4.

---

## WF-3.2.2 — REGISTRO COMO ESTUDIANTE (ROL-02)

**SRS:** RF-01, RF-07, RN-01  
**Propósito:** Registro mínimo de fricción. Solo matrícula.

---

### LAYOUT GENERAL

- Fondo: `BG_BASE`
- Header simple: botón "← Volver" (ícono + texto, `TEXT_PRIMARY`, alineado izquierda, padding 16px top)
- Título de pantalla: "Crear cuenta de estudiante" — H1 (24px / 700), `TEXT_PRIMARY`, margin-top 24px, padding horizontal 24px
- Subtítulo: "Solo necesitas tu matrícula" — Body S (14px / 400), `TEXT_SECONDARY`, padding horizontal 24px

---

### CAMPO DE MATRÍCULA

- Margin-top 32px, padding horizontal 24px
- **Label:** "Número de matrícula", Body S (14px / 600), `TEXT_PRIMARY`, margin-bottom 8px
- **Input:**
  - Fondo: `BG_CARD` (`#16213E`)
  - Borde: 1px sólido `BORDER`; cuando está enfocado: 2px sólido `PRIMARY`
  - Border-radius: 8px
  - Alto: 52px, ancho: 100%
  - Tipografía Body L (16px / 400), `TEXT_PRIMARY`
  - Tipo: `tel` para activar teclado numérico en móvil
  - Placeholder: "Ej. 20240001", color `TEXT_MUTED`
  - Padding interno: 16px horizontal

- **Texto de ayuda (siempre visible, incluso antes de escribir):**
  - Posición: debajo del input, margin-top 6px
  - Texto: "8 dígitos · Debe comenzar con 2"
  - Caption (12px / 400), color `TEXT_MUTED`

- **Indicador de validación en tiempo real:**
  - Aparece en el extremo derecho del input (padding-right 44px en el input para dar espacio)
  - **Estado inválido:** ícono ✗ rojo (`STATUS_REJECTED` `#E53E3E`), 20×20px. Aparece cuando el usuario ha escrito al menos 1 carácter y el formato no es válido.
  - **Estado válido:** ícono ✓ verde (`STATUS_ACTIVE` `#48BB78`), 20×20px. Aparece cuando los 8 dígitos están completos y el primero es 2.
  - Transición de opacidad 200ms entre estados.

---

### ENLACE CONDICIONAL — RECLAMO DE MATRÍCULA

- **Visibilidad:** Aparece solo cuando la matrícula ingresada ya existe como ROL-02 (verificación asíncrona post-input con debounce de 600ms).
- Texto: "¿Alguien más usa tu matrícula? **Reclamarla**"
- Posición: debajo del texto de ayuda, margin-top 8px
- Tipografía Body S (14px / 400) para la primera parte, (14px / 600) y color `PRIMARY` para "Reclamarla"
- Navega a WF-3.2.5

---

### BOTÓN CTA — "Crear cuenta"

- Posición: margin-top 32px, padding horizontal 24px
- Ancho: 100%, Alto: 52px
- **Estado deshabilitado (default):** fondo `BG_SURFACE`, texto `TEXT_MUTED`, no interactivo, opacidad 0.5
- **Estado habilitado:** fondo `PRIMARY`, texto `TEXT_PRIMARY` (Button 14px / 600), border-radius 12px, sombra `0 4px 12px rgba(196,24,74,0.4)`
- **Estado cargando:** el texto se reemplaza por un spinner circular blanco de 20px, fondo `PRIMARY` mantenido, no interactivo
- Condición para habilitar: checksum válido (exactamente 8 dígitos, primero = 2)

---

## WF-3.2.3 — REGISTRO COMO EMPRENDEDOR (ROL-03)

**SRS:** RF-02, RF-39, RNF-17, RN-09  
**Propósito:** Registro completo del emprendedor con todos los datos requeridos.

---

### LAYOUT GENERAL

- Fondo: `BG_BASE`, scroll vertical
- Header: "← Volver" (igual que WF-3.2.2)
- Título: "Crear cuenta de emprendedor" — H1 (24px / 700), `TEXT_PRIMARY`
- Subtítulo: "Publica tus proyectos en el mural universitario" — Body S (14px / 400), `TEXT_SECONDARY`

---

### CAMPO: MATRÍCULA

Idéntico al campo de matrícula de WF-3.2.2, incluyendo el texto de ayuda, el indicador de validación en tiempo real y el enlace condicional de reclamo.

---

### CAMPO: CONTRASEÑA

- Label: "Contraseña", Body S (14px / 600), `TEXT_PRIMARY`
- Input tipo `password` (caracteres ocultos por defecto)
- Fondo `BG_CARD`, borde `BORDER`, border-radius 8px, alto 52px
- **Toggle de visibilidad:** ícono de ojo (outline cuando oculto, tachado cuando visible), 20×20px, `TEXT_MUTED`, posicionado en el extremo derecho del input. Tap alterna el tipo del input entre `password` y `text`.
- **Barra de indicador de fortaleza:**
  - Posición: debajo del input, margin-top 6px
  - Ancho completo del input (327px), altura 4px, border-radius 2px
  - Fondo de la barra vacía: `BORDER`
  - Progreso de la barra (calculado en tiempo real):
    - 1-7 caracteres: barra al 33% de ancho, color `STATUS_REJECTED`
    - 8+ caracteres sin complejidad adicional: barra al 66%, color `STATUS_PENDING` (`#F0C040`)
    - 8+ caracteres con al menos 1 número y 1 mayúscula: barra al 100%, color `STATUS_ACTIVE`
  - Etiqueta de texto a la derecha de la barra: "Débil" / "Aceptable" / "Fuerte", Caption (12px / 400), color correspondiente al estado

---

### CAMPO: NOMBRE VISIBLE (display_name)

- Label: "¿Cómo quieres que te conozcan?", Body S (14px / 600), `TEXT_PRIMARY`
- Sublabel: "Este nombre aparecerá en el mural junto a tus anuncios." — Caption (12px / 400), `TEXT_MUTED`, margin-bottom 8px
- Input tipo `text`
- Fondo `BG_CARD`, borde `BORDER`, border-radius 8px, alto 52px
- Placeholder: "Como quieres que te conozcan (ej: Mariana G., Tech Lince)", color `TEXT_MUTED`
- **Contador de caracteres:** posicionado en el extremo inferior derecho del input (sobrepuesto encima del borde). Caption (12px / 400). Normal: `TEXT_MUTED`. Al superar 70 caracteres: `ACCENT`. Al superar 80 (límite): `STATUS_REJECTED`. Formato: "X/80".
- **Validación bad-words al perder el foco (onBlur):**
  - Si el campo contiene lenguaje inapropiado: borde del input cambia a `STATUS_REJECTED`, aparece texto de error debajo "Por favor elige un nombre apropiado", Caption (12px / 400) en `STATUS_REJECTED`.
  - Si el campo es válido: sin indicador adicional (el ✓ de validación no se aplica a este campo).
- Condición mínima para activar el CTA: ≥ 2 caracteres.

---

### CAMPO: NÚMERO DE WHATSAPP

- Label: "Número de WhatsApp", Body S (14px / 600), `TEXT_PRIMARY`
- Input tipo `tel`
- Fondo `BG_CARD`, borde `BORDER`, border-radius 8px, alto 52px
- Placeholder: "+52 1 669 123 4567", color `TEXT_MUTED`
- Formato esperado: `+52` fijo (puede ser prefijado visualmente) + 10 dígitos
- Validación de formato en tiempo real: mismo sistema de ícono ✓/✗ que el campo de matrícula

**Nota de privacidad (siempre visible bajo el campo):**
- Contenedor: fondo `BG_CARD`, borde izquierdo 2px sólido `SECONDARY`, border-radius 4px, padding 8px 12px
- Ícono de candado 14×14px en `SECONDARY`, alineado con el texto
- Texto: "Tu número solo se usará para generar un enlace de contacto. No se publicará como texto plano." — Caption (12px / 400), `TEXT_SECONDARY`

---

### CHECKBOX: AVISO DE PRIVACIDAD

- Layout: flexbox horizontal, alineación al inicio
- **Checkbox:**
  - Tamaño: 20×20px
  - Sin marcar: fondo `BG_CARD`, borde 2px `BORDER`, border-radius 4px
  - Marcado: fondo `PRIMARY`, ícono ✓ blanco centrado
  - Transición 150ms
- **Texto:**
  - Tipografía Body S (14px / 400), `TEXT_SECONDARY`
  - "He leído y acepto el " + enlace "Aviso de Privacidad" (color `SECONDARY`, subrayado). El enlace abre el aviso en una vista nueva.
- El checkbox es obligatorio. Sin marcarlo, el CTA permanece deshabilitado sin importar los demás campos.

---

### BOTÓN CTA — "Crear cuenta de emprendedor"

- Mismo comportamiento de estados que en WF-3.2.2
- **Condición para habilitar:** matrícula válida + contraseña ≥ 8 caracteres + display_name ≥ 2 caracteres + display_name sin lenguaje inapropiado + WhatsApp con formato válido + checkbox marcado
- **Estado cargando:** spinner blanco 20px, texto "Creando cuenta..."
- Al completarse con éxito: navega al panel del emprendedor WF-3.4.1

---

## WF-3.2.4 — INICIO DE SESIÓN

**SRS:** RF-03, RF-04, RF-05  
**Propósito:** Autenticación de usuarios existentes de cualquier rol.

---

### LAYOUT GENERAL

- Fondo: `BG_BASE`
- Header: "← Volver"
- Título: "Iniciar sesión" — H1 (24px / 700), `TEXT_PRIMARY`
- Subtítulo: "Ingresa tu matrícula para continuar" — Body S (14px / 400), `TEXT_SECONDARY`

---

### CAMPO: MATRÍCULA

Idéntico al campo de matrícula de WF-3.2.2 con checksum en tiempo real.

---

### CAMPO: CONTRASEÑA (OPCIONAL)

- Label: "Contraseña (opcional)", Body S (14px / 600), `TEXT_PRIMARY`
- Input tipo `password` con toggle de visibilidad
- Fondo `BG_CARD`, borde `BORDER`, border-radius 8px, alto 52px
- **Texto de ayuda:** "Si eres solo estudiante, deja la contraseña en blanco." — Caption (12px / 400), `TEXT_MUTED`
- El campo es opcional y puede dejarse vacío

---

### MENSAJES DE ERROR

- Posición: debajo del campo incorrecto, margin-top 6px
- Tipografía Caption (12px / 400), color `STATUS_REJECTED`
- Ícono ✗ (`STATUS_REJECTED`) a la izquierda del texto
- Mensajes:
  - Si la matrícula no existe: "Matrícula no encontrada."
  - Si la contraseña es incorrecta: "Contraseña incorrecta."
  - Si la cuenta está suspendida: "Tu cuenta está suspendida. Contacta al administrador." — En este caso el mensaje se muestra en un bloque separado (alerta) encima del botón, con fondo `rgba(229,62,62,0.1)`, borde izquierdo 2px `STATUS_REJECTED`, padding 12px.
- **Los dos primeros mensajes nunca se muestran simultáneamente** para no confirmar existencia de una cuenta.

---

### BOTÓN CTA — "Iniciar sesión"

- Mismo comportamiento de estados que WF-3.2.2
- Condición para habilitar: matrícula con checksum válido (la contraseña puede estar vacía)
- Al completarse exitosamente: redirige al feed autenticado (WF-3.3.1) o al panel del emprendedor (WF-3.4.1) según el rol.

---

## WF-3.2.5 — RECLAMO DE MATRÍCULA

**SRS:** RF-35, RN-02, RN-10  
**Propósito:** Permite al titular legítimo iniciar la recuperación de una matrícula usada por otro.

---

### LAYOUT GENERAL

- Fondo: `BG_BASE`
- Header: "← Volver al registro"
- Título: "Matrícula en uso" — H1 (24px / 700), `TEXT_PRIMARY`

---

### BLOQUE INFORMATIVO

- Contenedor: fondo `BG_CARD`, border-radius 12px, borde 1px `BORDER`, padding 16px
- Ícono de advertencia ⚠ (24×24px, `ACCENT`) centrado arriba
- Texto principal: "La matrícula **XXXXXXXX** ya tiene una cuenta asociada."
  - Body S (14px / 400), `TEXT_SECONDARY`, centrado
  - La matrícula se muestra interpolada en negrita
- Texto secundario: "Si eres el titular legítimo de esta matrícula, puedes iniciar un proceso de revisión." — Caption (12px / 400), `TEXT_MUTED`, centrado

---

### OPCIONES DE ACCIÓN

**Opción A:**
- Botón: "Iniciar sesión con esta matrícula"
- Fondo `SECONDARY`, texto `TEXT_PRIMARY`, Button (14px / 600)
- Alto 48px, ancho 100%, border-radius 12px
- Navega a WF-3.2.4 con la matrícula pre-rellenada

**Separador:** igual que en WF-3.2.1 ("─── o ───")

**Opción B:**
- Botón: "No fui yo, quiero reclamar mi matrícula"
- Fondo transparente, borde 1px `STATUS_REJECTED`, texto `STATUS_REJECTED`
- Button (14px / 600), alto 48px, ancho 100%, border-radius 12px
- Al activar: despliega el formulario de reclamo debajo con animación `expand` (height 0 → auto, 300ms)

---

### FORMULARIO DE RECLAMO (se expande al activar la Opción B)

- Label: "Tu número de WhatsApp para contactarte", Body S (14px / 600), `TEXT_PRIMARY`
- Input tipo `tel`, mismo diseño que el campo de WhatsApp en WF-3.2.3 (con validación de formato y nota de privacidad)
- Botón "Confirmar reclamo":
  - Fondo `PRIMARY`, texto `TEXT_PRIMARY`, Button (14px / 600)
  - Alto 48px, ancho 100%, border-radius 12px
  - Deshabilitado hasta que el WhatsApp tenga formato válido
  - Estado cargando con spinner blanco

---

### ESTADO POST-CONFIRMACIÓN

Al confirmar el reclamo, la pantalla se reemplaza por:
- Ícono ✓ verde (48×48px, `STATUS_ACTIVE`) centrado
- Texto principal: "Tu reclamo fue registrado." — H2 (20px / 600), `TEXT_PRIMARY`, centrado
- Texto secundario: "Un administrador se comunicará contigo vía WhatsApp para resolver el caso." — Body S (14px / 400), `TEXT_SECONDARY`, centrado
- Botón: "Volver al inicio" → navega a WF-3.2.1

---

## WF-3.3.1 — FEED AUTENTICADO CON FILTROS (ROL-02/ROL-03)

**SRS:** RF-08, RF-09, RF-12, RF-13, RF-14  
**Propósito:** Feed completo con capacidades de interacción para usuarios autenticados.

---

### BARRA DE NAVEGACIÓN SUPERIOR

- Mismo diseño que WF-3.1.1 (BG_SURFACE, logo + nombre)
- **Diferencia para ROL-03 (Emprendedor):** aparece en el extremo derecho un ícono de campanita (🔔, 24×24px, `TEXT_PRIMARY`). Si existen notificaciones no leídas, se superpone un `NotificationDot`: círculo rojo (`STATUS_REJECTED`) de 8px de diámetro en la esquina superior-derecha del ícono campanita.

---

### BARRA DE CHIPS DE CATEGORÍA

- Posición: sticky, inmediatamente debajo de la NavBar
- Fondo: `BG_BASE` con padding vertical 8px
- Scroll horizontal habilitado (overflow-x: scroll, sin scrollbar visible)
- Padding horizontal 16px al inicio y al final

**Chip "Todos" y chips de categoría:**
- Alto: 32px, padding horizontal 12px
- Border-radius: 16px (píldora)
- Separación entre chips: 8px (flexbox gap)
- **Estado default (no seleccionado):** fondo `BG_CARD`, borde 1px `BORDER`, texto Body S (14px / 400), color `TEXT_SECONDARY`
- **Estado activo/seleccionado:** fondo `PRIMARY`, sin borde, texto Body S (14px / 600), color `TEXT_PRIMARY`
- **"Todos"** siempre visible como primer chip, activo por defecto al cargar
- Los chips de categorías siguientes corresponden a las 20 categorías del Apéndice A del SRS

---

### TARJETAS AnnouncementCard (versión interactiva)

Misma estructura visual que en WF-3.1.1, con las siguientes diferencias:

**LikeButton (interactivo):**
- **Estado inactivo:** ícono de corazón outline, `TEXT_MUTED`, 20×20px. Contador a la derecha.
- **Estado activo (liked):** ícono de corazón relleno, `PRIMARY` (`#C4184A`), 20×20px.
- **Al activar (tap):** animación "pop" — escala del ícono de 1 → 1.35 → 1 en 200ms con `ease-out`. El contador incrementa inmediatamente (optimistic UI).
- **Al revertir dentro de 5,000 ms:** el sistema registra `is_accidental = true`; no hay indicador visual especial para el usuario (la reversión se trata igual que una reversión normal desde la perspectiva de UX).

**StarRating (interactivo):**
- **Estado sin valorar:** 3 estrellas outline, color `TEXT_MUTED`, 20×20px
- **Al hacer tap en estrella N:** las estrellas 1 a N se rellenan con `ACCENT`, la N+1 a 3 quedan outline `TEXT_MUTED`. Animación de llenado secuencial: la estrella seleccionada escala 1 → 1.2 → 1 en 200ms.
- **Si el usuario tiene una valoración activa:** muestra las estrellas correspondientes rellenas en `ACCENT`.
- El mismo mecanismo de umbral de intención se aplica aquí sin retroalimentación visual especial.

**Botón de contacto WhatsApp:**
- Solo visible para ROL-02 y ROL-03 en la tarjeta de detalle (NO en el feed principal). En el feed solo aparece el botón "Ver detalle".

**Ícono de reporte ⚐:**
- Posición: esquina superior derecha de la tarjeta (sobre la imagen), ícono de bandera outline, 20×20px, color `TEXT_MUTED`, fondo `rgba(0,0,0,0.4)` circular 32×32px.
- Al tap: abre el Modal de Reporte WF-3.3.2.

---

## WF-3.3.2 — MODAL DE REPORTE DE ANUNCIO

**SRS:** RF-36, RN-13  
**Propósito:** Permite reportar contenido inapropiado de forma confidencial.

---

### OVERLAY

- Fondo: `rgba(0,0,0,0.6)`, cubre toda la pantalla
- Al tocar el overlay fuera del modal: cierra el modal con animación `slide-down` de 200ms
- Aparece con animación `slide-up` de 200ms

---

### CONTENEDOR DEL MODAL

- Posición: anclado en la parte inferior de la pantalla (bottom sheet pattern)
- Fondo: `BG_SURFACE` (`#0F3460`)
- Border-radius: 16px en esquinas superiores, 0px en inferiores
- Padding: 24px horizontal, 24px vertical
- Ancho: 375px (ancho completo)

**Handle de arrastre:**
- Rectángulo 40×4px centrado horizontalmente en la parte superior del modal
- Fondo: `BORDER`
- Border-radius: 2px
- Margin-bottom: 16px

**Título:** "⚐ Reportar este anuncio" — H2 (20px / 600), `TEXT_PRIMARY`, margin-bottom 8px

**Nota de confidencialidad:**
- Contenedor: fondo `rgba(196,24,74,0.1)`, borde izquierdo 2px `PRIMARY`, border-radius 4px, padding 8px 12px
- Texto: "Tu reporte es confidencial. El emprendedor no sabrá que fuiste tú." — Caption (12px / 400), `TEXT_SECONDARY`
- Margin-bottom: 20px

---

### LISTA DE MOTIVOS (radio buttons)

Cada opción:
- Layout: flexbox horizontal, alineación centrada
- Alto: 48px, padding horizontal 0, separación entre opciones: 0 (bloque continuo)
- Separador entre opciones: 1px `BORDER`
- **Radio button:** círculo 20×20px, borde 2px `BORDER`; cuando seleccionado: borde `PRIMARY` y círculo interior relleno `PRIMARY` de 10×10px, centrado
- **Texto:** Body S (14px / 400), `TEXT_PRIMARY`
- Opciones:
  1. "Contenido ofensivo o inapropiado"
  2. "Spam o anuncio duplicado"
  3. "Información falsa o engañosa"
  4. "Otro"

---

### BOTONES

**"Confirmar reporte":**
- Fondo: `PRIMARY`, texto `TEXT_PRIMARY`, Button (14px / 600)
- Alto: 52px, ancho: 100%, border-radius: 12px
- **Deshabilitado** hasta que se seleccione un motivo: fondo `BG_CARD`, texto `TEXT_MUTED`, opacidad 0.5
- Al activar: fondo `PRIMARY`, sombra `0 4px 12px rgba(196,24,74,0.4)`

**"Cancelar":**
- Fondo: transparente, texto: "Cancelar", Body S (14px / 400), `TEXT_SECONDARY`
- Margin-top: 12px, centrado
- Al tap: cierra el modal

---

### ESTADO: YA REPORTADO

Si el usuario ya reportó este anuncio, el modal muestra solamente:
- Ícono ✓ verde (32×32px, `STATUS_ACTIVE`) centrado
- Texto: "Ya enviaste un reporte para este anuncio." — Body S (14px / 400), `TEXT_SECONDARY`, centrado
- Botón: "Cerrar" — fondo transparente, borde `BORDER`, texto `TEXT_SECONDARY`

---

## WF-3.4.1 — PANEL PRINCIPAL DEL EMPRENDEDOR

**SRS:** RF-15, RF-17, RF-23, RF-24  
**Propósito:** Centro de gestión de todos los proyectos del emprendedor.

---

### BARRA DE NAVEGACIÓN

- Fondo `BG_SURFACE`, altura 56px
- Extremo izquierdo: saludo "Hola, **[display_name]** 👋" — Body S (14px / 400), `TEXT_SECONDARY`; el display_name en (14px / 600), `TEXT_PRIMARY`
- Extremo derecho: ícono de campanita con `NotificationDot` si hay no leídas. Tap navega a WF-3.4.4.

---

### BARRA DE RESUMEN

- Posición: debajo de la NavBar, fondo `BG_CARD`, padding 16px, borde bottom 1px `BORDER`
- Layout: dos bloques en fila, divididos 50/50
- **Proyectos activos:** número en H1 (24px / 700), `TEXT_PRIMARY`, centrado. Debajo: "proyectos activos", Caption (12px / 400), `TEXT_MUTED`.
- **Anuncios activos:** misma estructura. Los dos bloques separados por divisor vertical 1px `BORDER`.

---

### BOTÓN "＋ Nuevo proyecto"

- Posición: debajo del resumen, margin 16px a todos los lados
- Fondo: `PRIMARY`, texto "＋ Nuevo proyecto", Button (14px / 600), `TEXT_PRIMARY`
- Alto: 48px, ancho: 100% (343px), border-radius: 12px
- Sombra: `0 4px 12px rgba(196,24,74,0.4)`
- **Si el límite de 5 proyectos activos está alcanzado:** el botón permanece pero al tapearlo muestra un toast de error en lugar de navegar. Toast: fondo `STATUS_REJECTED`, texto "Has alcanzado el límite de 5 proyectos activos. Suspende o elimina uno para continuar." (Body S, `TEXT_PRIMARY`)

---

### LISTA DE ProjectCards

Cada tarjeta de proyecto:

- Fondo: `BG_CARD`, border-radius 12px, borde 1px `BORDER`, padding 16px
- Margin-bottom: 12px (gap entre tarjetas)

**Encabezado de tarjeta:**
- Fila: nombre del proyecto (H2, 20px / 600, `TEXT_PRIMARY`) + StatusBadge a la derecha
- **StatusBadge:**
  - "Activo": fondo `rgba(72,187,120,0.15)`, texto `STATUS_ACTIVE`, Badge (12px / 600), border-radius 4px, padding 3px 8px
  - "Suspendido": fondo `rgba(113,128,150,0.15)`, texto `TEXT_MUTED`, Badge (12px / 600)

**Métricas resumidas:**
- 3 ítems en fila: "N anuncios activos" | "N likes totales" | "★ N promedio"
- Caption (12px / 400), `TEXT_MUTED`, separados por "·" en `TEXT_MUTED`

**Menú de acciones:**
- Botón "⋯" en la esquina superior derecha de la tarjeta, 24×24px, `TEXT_SECONDARY`
- Al tap: aparece un bottom sheet con opciones: "✎ Editar proyecto", "⏸ Suspender" / "▶ Reactivar", "🗑 Eliminar"
  - "Eliminar" en `STATUS_REJECTED`
  - Resto en `TEXT_PRIMARY`

**Botones de acción visibles en la tarjeta:**
- Fila inferior de la tarjeta con dos botones:
  - "Ver detalle" — fondo transparente, borde 1px `BORDER`, texto `TEXT_SECONDARY`, Button (14px / 400), ancho 50% - 4px, alto 36px, border-radius 8px. Navega a WF-3.4.2.
  - "Nuevo anuncio" — fondo `SECONDARY`, texto `TEXT_PRIMARY`, Button (14px / 600), ancho 50% - 4px, alto 36px, border-radius 8px. Navega a WF-3.4.3.

---

## WF-3.4.2 — DETALLE DE PROYECTO Y PORTAFOLIO

**SRS:** RF-16, RF-23, RF-24, RN-04  
**Propósito:** Vista completa del proyecto con anuncios, métricas y portafolio.

---

### HEADER

- Botón "← Volver al panel", `TEXT_PRIMARY`
- Nombre del proyecto: H1 (24px / 700), `TEXT_PRIMARY`, con StatusBadge a la derecha

---

### PANEL DE IMPACTO

- Contenedor: fondo `BG_CARD`, border-radius 12px, borde 1px `BORDER`, padding 16px, margin 16px
- Título: "Impacto de este proyecto" — Body S (14px / 600), `TEXT_SECONDARY`, margin-bottom 12px
- **3 métricas en fila:**
  - "N vistas" | "N likes válidos" | "★ N promedio"
  - Número: H2 (20px / 600), `TEXT_PRIMARY`; etiqueta: Caption (12px / 400), `TEXT_MUTED`
- Nota al pie: "Umbral de intención: activo — las interacciones accidentales (<5s) se excluyen de estas métricas." — Caption (12px / 400), `TEXT_MUTED`, con ícono de información ℹ 12px.

---

### CONTADOR DE ANUNCIOS ACTIVOS

- Texto: "**N/3** anuncios activos" — Body S (14px / 600), `TEXT_PRIMARY`; el denominador "3" es el límite (M = 3 según SAD).
- **Barra de progreso:** ancho 100%, altura 6px, border-radius 3px
  - Fondo: `BORDER`
  - Relleno: color según ocupación: 1/3 = `STATUS_ACTIVE`, 2/3 = `STATUS_PENDING`, 3/3 = `STATUS_REJECTED`
- Nota: "Los anuncios en revisión también cuentan para el límite." — Caption (12px / 400), `TEXT_MUTED`

---

### LISTA DE ANUNCIOS ACTIVOS

Cada **AnnouncementRow** (fila de anuncio):
- Layout: flexbox horizontal
- **Miniatura:** imagen 60×60px, border-radius 8px, object-fit: cover
- **Info (resto del ancho):**
  - Título del anuncio: Body S (14px / 600), `TEXT_PRIMARY`, 1 línea con ellipsis
  - Fecha de vencimiento: Caption (12px / 400)
    - Normal: color `TEXT_MUTED`
    - Si quedan ≤ 7 días: color `ACCENT` con ícono ⚠ 12px
  - Métricas: "N likes · ★ N", Caption (12px / 400), `TEXT_MUTED`
- **StatusBadge** a la derecha: según el estado del anuncio
- Separador bottom: 1px `BORDER`

---

### SECCIÓN "HISTORIAL"

- Título: "Historial" con ícono de archivo, Body S (14px / 600), `TEXT_MUTED`, margin-top 24px
- Anuncios expirados mostrados como AnnouncementRow en opacidad 0.5, StatusBadge "Expirado" en `TEXT_MUTED`.
- Texto introductorio: "Los anuncios vencidos forman tu portafolio aunque ya no están en el feed." — Caption (12px / 400), `TEXT_MUTED`.

---

## WF-3.4.3 — CREAR NUEVO ANUNCIO

**SRS:** RF-19, RF-22, RF-26, RF-27, RF-28, RF-31, RN-12  
**Propósito:** Formulario completo de creación de anuncio con pipeline de moderación automático.

---

### HEADER

- Botón "← Volver", `TEXT_PRIMARY`
- Título: "Nuevo anuncio" — H1 (24px / 700), `TEXT_PRIMARY`
- Subtítulo: "Para el proyecto: **[nombre del proyecto]**" — Body S (14px / 400), `TEXT_SECONDARY`; nombre en negrita.

---

### ImageUploader

- Contenedor: 343×200px, border-radius 12px, borde 2px dashed `BORDER`, fondo `BG_CARD`, centrado
- **Estado idle:** ícono de imagen (32×32px, `TEXT_MUTED`) centrado vertical y horizontalmente. Texto: "Toca para subir una imagen" (Body S, `TEXT_SECONDARY`). Subtexto: "JPG, PNG, máx. 500 KB" (Caption, `TEXT_MUTED`).
- **Estado comprimiendo:** overlay semitransparente `rgba(0,0,0,0.6)` sobre el contenedor. Barra de progreso horizontal en la parte inferior del contenedor (altura 4px, `PRIMARY`). Texto sobre la barra: "Optimizando imagen..." (Caption, `TEXT_PRIMARY`).
- **Estado uploading (post-aprobación):** misma barra pero con texto "Subiendo...". La barra se anima de izquierda a derecha.
- **Estado con imagen seleccionada (preview):** la imagen ocupa el 100% del contenedor (object-fit: cover). En la esquina superior derecha: botón circular ✕ (24×24px, fondo `rgba(0,0,0,0.6)`, ícono blanco) para eliminar y volver al estado idle.
- **Estado error:** borde `STATUS_REJECTED`, ícono de error ✗ (32×32px, `STATUS_REJECTED`) centrado, texto del error (Caption, `STATUS_REJECTED`).

---

### CAMPO: TÍTULO

- Label: "Título del anuncio", Body S (14px / 600), `TEXT_PRIMARY`
- Input tipo `text`, fondo `BG_CARD`, borde `BORDER`, border-radius 8px, alto 52px
- Placeholder: "Ej: Diseño de logos profesionales"
- Contador: "X/120", Caption (12px / 400), `TEXT_MUTED`, esquina inferior derecha

---

### CAMPO: DESCRIPCIÓN

- Label: "Descripción", Body S (14px / 600), `TEXT_PRIMARY`
- Textarea con 3 filas visibles (altura mínima ~90px), resize: none
- Fondo `BG_CARD`, borde `BORDER`, border-radius 8px
- Contador: "X/500", Caption (12px / 400), `TEXT_MUTED`, esquina inferior derecha

---

### SELECTOR DE CATEGORÍA

- Label: "Categoría", Body S (14px / 600), `TEXT_PRIMARY`
- Dropdown (select estilizado):
  - Fondo `BG_CARD`, borde `BORDER`, border-radius 8px, alto 52px
  - Ícono de chevron down (`TEXT_MUTED`) en el extremo derecho
  - Agrupado en 3 grupos: "Productos físicos", "Servicios", "Organizaciones estudiantiles" + "Otro"
  - Al seleccionar: CategoryBadge del color del grupo aparece a la izquierda del texto seleccionado
- **Si se selecciona "Otro":**
  - Aparece inmediatamente debajo un campo de texto adicional con animación `expand`
  - Label: "Describe tu categoría", Caption (12px / 400), `TEXT_MUTED`
  - Input `BG_CARD`, `BORDER`, border-radius 8px, alto 44px
  - Sujeto a filtro bad-words al perder el foco (mismo comportamiento que display_name)

---

### SELECTOR DE VIGENCIA (VigoranceSelector)

- Label: "Válido hasta", Body S (14px / 600), `TEXT_PRIMARY`
- Input tipo `date` estilizado (nativo con apariencia personalizada):
  - Fondo `BG_CARD`, borde `BORDER`, border-radius 8px, alto 52px
  - Ícono de calendario (`TEXT_MUTED`) a la izquierda, padding-left 44px
  - Texto de la fecha seleccionada o placeholder "DD/MM/AAAA" en `TEXT_MUTED`
  - min: mañana; max: hoy + 365 días
- **Estado "expiring_soon"** (si se selecciona una fecha en los próximos 7 días): borde `ACCENT`, texto de advertencia "Este anuncio vencerá pronto. Considera una fecha más larga." (Caption, `ACCENT`) bajo el campo.

---

### BOTÓN CTA — "Publicar anuncio"

- Fondo `PRIMARY`, texto "Publicar anuncio", Button (14px / 600), `TEXT_PRIMARY`
- Alto 52px, ancho 100%, border-radius 12px
- **Deshabilitado:** cuando algún campo requerido (imagen, título, categoría, vigencia) está vacío
- **Estado loading:** fondo `PRIMARY`, texto "Analizando contenido..." con spinner 20px blanco a la izquierda. No interactivo. Este estado dura mientras el pipeline de moderación se ejecuta.

---

### TOASTS POST-SUBMIT

- Aparecen en la parte superior de la pantalla, debajo de la NavBar
- Ancho: 343px, border-radius 8px, padding 12px 16px
- **"✓ Anuncio publicado":** fondo `STATUS_ACTIVE`, texto `TEXT_PRIMARY`, ícono ✓ a la izquierda. Auto-dismiss 3s.
- **"⏳ En revisión por el administrador":** fondo `STATUS_PENDING`, texto `#1A1A2E` (legible sobre amarillo), ícono ⏳. Auto-dismiss 5s.

---

## WF-3.4.4 — PANEL DE NOTIFICACIONES DEL EMPRENDEDOR

**SRS:** RF-25, RF-38  
**Propósito:** Centro de notificaciones internas. Sin correo ni push.

---

### HEADER

- Botón "← Volver", `TEXT_PRIMARY`
- Título: "Notificaciones" — H1 (24px / 700), `TEXT_PRIMARY`
- Botón "Marcar todas como leídas" — texto Body S (14px / 400), `SECONDARY`, alineado a la derecha. Tap ejecuta `PATCH /notifications/read-all`.

---

### LISTA DE NOTIFICACIONES

Cada notificación es una fila:
- Padding 16px horizontal y 12px vertical
- Separador bottom: 1px `BORDER`
- **Notificaciones no leídas:** fondo `rgba(196,24,74,0.05)`, punto de color (8×8px, `PRIMARY`) en el extremo derecho
- **Notificaciones leídas:** fondo transparente

**Ícono de tipo** (izquierda, 32×32px círculo):
- **Aprobado:** fondo `rgba(72,187,120,0.15)`, ícono ✓ `STATUS_ACTIVE`
- **En revisión:** fondo `rgba(240,192,64,0.15)`, ícono ⏳ `STATUS_PENDING`
- **Por vencer:** fondo `rgba(240,192,64,0.15)`, ícono ⚠ `ACCENT`
- **Rechazado:** fondo `rgba(229,62,62,0.15)`, ícono ✗ `STATUS_REJECTED`
- **Shadowban:** fondo `rgba(196,24,74,0.15)`, ícono ⊘ `PRIMARY`

**Texto:**
- Mensaje principal: Body S (14px / 400), `TEXT_PRIMARY`, 2 líneas máx
- Timestamp: Caption (12px / 400), `TEXT_MUTED`, en la segunda línea debajo del mensaje
- **Para notificación "Por vencer":** enlace "Renovar vigencia" al final del mensaje, color `PRIMARY`, peso 600. Tap navega al editor del anuncio con foco en el campo de vigencia.

**Al tocar una notificación:** marca como leída (`PATCH /notifications/:id/read`) y navega según el tipo:
- Aprobado → al anuncio en el feed
- En revisión → al anuncio en el panel
- Rechazado → sin navegación (sin enlace activo)
- Por vencer → al editor del anuncio
- Shadowban → al anuncio en el panel

---

### ESTADO VACÍO

Si no hay notificaciones:
- Ícono de campanita con tilde (48×48px, `TEXT_MUTED`) centrado
- Texto: "No tienes notificaciones pendientes." — Body S (14px / 400), `TEXT_MUTED`, centrado

---

## WF-3.5.1 — COLA DE MODERACIÓN (ADMINISTRADOR)

**SRS:** RF-29, RF-30, RF-37, RF-38  
**Propósito:** Cola de trabajo del administrador con todos los casos pendientes, ordenados por urgencia.

---

### HEADER

- Fondo `BG_SURFACE`, altura 56px
- Título: "Cola de moderación", H1 (24px / 700), `TEXT_PRIMARY`, centrado
- Contador a la derecha: badge circular `PRIMARY` con número de casos pendientes, Caption (12px / 600), `TEXT_PRIMARY`

---

### CASOS URGENTES (RF-38: ≥5 reportes + ≥12h inacción)

Estos casos aparecen primero en la lista, con los siguientes indicadores:

- **Borde de la tarjeta:** 2px sólido `STATUS_REJECTED` con animación `pulse` (opacidad 1 → 0.5 → 1, ciclo 1.5s) para indicar urgencia activa
- **Badge "🔴 URGENTE":** esquina superior izquierda de la tarjeta, fondo `STATUS_REJECTED`, texto Badge (12px / 600), `TEXT_PRIMARY`
- **Contador regresivo:** texto "Shadowban en X horas", Caption (12px / 400), `STATUS_REJECTED`, alineado a la derecha del badge

---

### TARJETA DE CASO (ModerationQueueItem)

Fondo `BG_CARD`, border-radius 12px, borde 1px `BORDER`, padding 16px, margin-bottom 12px.

**Encabezado:**
- Fila: tipo de trigger (badge) + timestamp del ingreso a la cola
- **Badges de trigger:**
  - "Imagen inapropiada (Vision API)": fondo `rgba(229,62,62,0.15)`, texto `STATUS_REJECTED`
  - "Hash similar (posible duplicado)": fondo `rgba(25,74,141,0.3)`, texto `SECONDARY`
  - "Lenguaje ofensivo (bad-words)": fondo `rgba(229,62,62,0.15)`, texto `STATUS_REJECTED`
  - "Reporte múltiple (N reportes)": fondo `rgba(240,192,64,0.15)`, texto `ACCENT`
  - "Vision API timeout": fondo `rgba(113,128,150,0.15)`, texto `TEXT_MUTED`, con nota "(La IA no pudo analizar)"

**Imagen del anuncio:**
- Miniatura 120×90px, border-radius 8px, object-fit: cover, margin vertical 12px

**Texto del anuncio:**
- Título: Body S (14px / 600), `TEXT_PRIMARY`
- Descripción: Caption (12px / 400), `TEXT_SECONDARY`, truncada a 2 líneas

**Datos del emprendedor:**
- "Emprendedor: [display_name] · Matrícula: [matrícula] · Proyecto: [nombre]"
- Caption (12px / 400), `TEXT_MUTED`

**Para trigger tipo "Reporte múltiple":** bloque adicional con motivos agregados:
- Cada motivo como chip: "Contenido ofensivo ×2", "Spam ×1", etc.
- Chips fondo `BG_SURFACE`, texto Caption, `TEXT_SECONDARY`

---

### BOTONES DE ACCIÓN POR CASO

Fila de 3 botones:

- **"✓ Aprobar":** fondo `STATUS_ACTIVE`, texto "✓ Aprobar", Button (14px / 600), `TEXT_PRIMARY`, alto 40px, flex: 1, border-radius 8px. Tap ejecuta `PATCH /admin/announcements/:id/approve` y elimina la tarjeta de la lista con animación `fade-out slide-left` de 300ms.
- **"✗ Rechazar":** fondo transparente, borde 1px `STATUS_REJECTED`, texto "✗ Rechazar", Button (14px / 600), `STATUS_REJECTED`, alto 40px, flex: 1, border-radius 8px. Tap abre un bottom sheet con campo de texto para el motivo del rechazo (textarea, `BG_CARD`, placeholder "Describe el motivo del rechazo...") y botón "Confirmar rechazo" (`STATUS_REJECTED`).
- **"⊘ Rechazar + Suspender":** ícono ⊘, texto "Rechazar + Suspender cuenta", Button (12px / 600), `STATUS_REJECTED`, fondo transparente, sin borde, alto 40px, flex: 1. Tap abre un diálogo de confirmación adicional: "¿Estás seguro? La cuenta del emprendedor quedará suspendida." con botones "Cancelar" y "Confirmar suspensión".

---

### ESTADO VACÍO

- Ícono de escudo con ✓ (48×48px, `STATUS_ACTIVE`) centrado
- Texto: "¡Todo revisado! No hay casos pendientes." — Body S (14px / 400), `TEXT_MUTED`, centrado

---

## WF-3.5.2 — COMPARATIVA DE IMÁGENES (HASH SIMILAR)

**SRS:** RF-28, RF-29, RF-30, RN-07  
**Propósito:** Vista especializada para evaluar si dos imágenes son duplicadas.

---

### HEADER

- Botón "← Volver a la cola", `TEXT_PRIMARY`
- Título: "Posible duplicado detectado" — H1 (24px / 700), `TEXT_PRIMARY`

---

### BLOQUE DE DISTANCIA HAMMING

- Contenedor: fondo `BG_CARD`, border-radius 8px, borde 1px `BORDER`, padding 12px 16px, margin 16px
- Ícono de huella/hash (20×20px, `ACCENT`)
- Texto: "Distancia: **7/64 bits** (umbral configurado: ≤10)" — Body S (14px / 400), `TEXT_SECONDARY`; el número en H2 (20px / 600), `ACCENT`
- Subtexto: "Cuanto menor la distancia, más similares son las imágenes. 0 = idénticas." — Caption (12px / 400), `TEXT_MUTED`

---

### COMPARATIVA LADO A LADO

Dos bloques en fila, cada uno con ancho 159px (343px / 2 - 12px gap).

**Bloque izquierdo — "Imagen nueva":**
- Imagen 159×140px, border-radius 8px, object-fit: cover
- Debajo: "Nueva", Body S (14px / 600), `TEXT_PRIMARY`
- Emprendedor: Caption (12px / 400), `TEXT_MUTED`
- Proyecto: Caption (12px / 400), `TEXT_MUTED`
- Fecha: Caption (12px / 400), `TEXT_MUTED`

**Bloque derecho — "Imagen existente":**
- Misma estructura visual
- "Existente", Body S (14px / 600), `TEXT_PRIMARY`
- Borde del contenedor: 1px sólido `SECONDARY` para diferenciar visualmente

---

### BOTONES CONTEXTUALES

**"✓ Son imágenes diferentes — Aprobar":**
- Fondo `STATUS_ACTIVE`, texto `TEXT_PRIMARY`, Button (14px / 600)
- Alto: 52px, ancho: 100%, border-radius: 12px
- Tap: aprueba el anuncio nuevo y navega de regreso a la cola

**"✗ Es la misma imagen — Rechazar":**
- Fondo transparente, borde 1px `STATUS_REJECTED`, texto `STATUS_REJECTED`, Button (14px / 600)
- Alto: 52px, ancho: 100%, border-radius: 12px
- Margin-top: 12px
- Tap: abre el bottom sheet de motivo de rechazo (igual que en WF-3.5.1)

---

## WF-3.5.3 — GENERADOR DE CÓDIGO QR

**SRS:** RF-34  
**Propósito:** Generar y descargar el QR físico para los tableros del campus.

---

### HEADER

- Botón "← Volver al panel admin", `TEXT_PRIMARY`
- Título: "Código QR del Mural" — H1 (24px / 700), `TEXT_PRIMARY`

---

### BLOQUE DEL QR

- Contenedor centrado: fondo `BG_CARD`, border-radius 16px, borde 1px `BORDER`, padding 24px
- **Código QR:**
  - Tamaño de visualización: 240×240px, centrado
  - Fondo blanco (el QR requiere fondo blanco para ser legible)
  - Border-radius: 8px del contenedor blanco
  - El QR enlaza a la URL raíz de producción (`APP_PRODUCTION_URL`)
- **URL visible:**
  - Debajo del QR, margin-top 12px
  - Texto de la URL, Body S (14px / 400), `SECONDARY`, centrado, tappable para copiar

---

### BOTONES

**"⬇ Descargar PNG":**
- Fondo `PRIMARY`, texto `TEXT_PRIMARY`, Button (14px / 600)
- Alto: 52px, ancho: 100%, border-radius: 12px
- Descarga un PNG de 512×512px de alta resolución (óptimo para impresión hasta A5)
- Al activar: spinner blanco mientras el backend genera el PNG (`GET /admin/qr`)

**"🔗 Copiar enlace":**
- Fondo transparente, borde 1px `BORDER`, texto `TEXT_SECONDARY`, Button (14px / 600)
- Alto: 48px, ancho: 100%, border-radius: 12px, margin-top: 12px
- Al activar: copia la URL al portapapeles. Toast feedback: "✓ Enlace copiado", fondo `STATUS_ACTIVE`, 2s.

---

### INSTRUCCIONES DE USO

Contenedor: fondo `rgba(25,74,141,0.15)`, borde izquierdo 2px `SECONDARY`, border-radius 4px, padding 12px 16px.

Texto en Caption (12px / 400), `TEXT_SECONDARY`:
- "Imprime en tamaño A5 o carta para mejor legibilidad."
- "Plastifica si es posible para mayor durabilidad."
- "Si la URL de la plataforma cambia, genera un nuevo QR desde esta pantalla."

---

## RESUMEN DE TRAZABILIDAD WIREFRAME ↔ SRS

| Wireframe | ID | Requisitos SRS |
|---|---|---|
| Feed Principal (visitante) | WF-3.1.1 | RF-08, RNF-01, RNF-02 |
| Detalle de anuncio (visitante) | WF-3.1.2 | RF-10, RF-11, RNF-04 |
| Pantalla de bienvenida | WF-3.2.1 | RF-01, RF-02 |
| Registro estudiante | WF-3.2.2 | RF-01, RF-07, RN-01 |
| Registro emprendedor | WF-3.2.3 | RF-02, RF-39, RNF-17, RN-09 |
| Login | WF-3.2.4 | RF-03, RF-04, RF-05 |
| Reclamo de matrícula | WF-3.2.5 | RF-35, RN-02, RN-10 |
| Feed autenticado con filtros | WF-3.3.1 | RF-08, RF-09, RF-12, RF-13, RF-14 |
| Modal de reporte | WF-3.3.2 | RF-36, RN-13 |
| Panel principal emprendedor | WF-3.4.1 | RF-15, RF-17, RF-23, RF-24 |
| Detalle de proyecto y portafolio | WF-3.4.2 | RF-16, RF-23, RF-24, RN-04 |
| Crear nuevo anuncio | WF-3.4.3 | RF-19, RF-22, RF-26, RF-27, RF-28, RF-31 |
| Notificaciones del emprendedor | WF-3.4.4 | RF-25, RF-38 |
| Cola de moderación (admin) | WF-3.5.1 | RF-29, RF-30, RF-37, RF-38 |
| Comparativa de imágenes (hash) | WF-3.5.2 | RF-28, RF-29, RF-30, RN-07 |
| Generador de QR | WF-3.5.3 | RF-34 |

---

*FIN DEL DOCUMENTO*  
*Especificación Visual de Wireframes — Mural Maz Lince v1.0*  
*Elaborado por Miriam Alanis · Abril 2026*
