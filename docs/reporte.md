# Reporte de Auditoría UI — Panel del Emprendedor

> **Fecha:** Octubre 2026  
> **Auditor:** Frontend Senior — Mobile-First  
> **Alcance:** `EntrepreneurDashboard.jsx` y componentes relacionados  
> **Viewport de referencia:** 375px (iPhone SE — mínimo estándar mobile-first)

---

## 1. Resumen Ejecutivo

El panel del emprendedor cumple con la estructura funcional básica (crear proyectos, crear anuncios, ver notificaciones), pero presenta **deficiencias críticas de UX móvil** que afectan directamente la tarea principal del usuario: publicar y gestionar anuncios. La navegación genera estados huérfanos, los formularios no respetan el viewport en mobile, y hay un bug funcional que impide asociar anuncios a categorías correctamente. El avance visual supera al avance funcional real.

**Veredicto:** El panel necesita correcciones de bloqueantes antes de ser considerado production-ready para el perfil de emprendedor.

---

## 2. Metodología

- Lectura directa del código fuente (`EntrepreneurDashboard.jsx`, `ChipNav.jsx`, `StatsCard.jsx`)
- Simulación mental de flujos de usuario en viewport 375px
- Contraste contra el DDC v1.3 (especificaciones de wireframes WF-3.x)
- Clasificación de severidad: **Crítico** (bloquea tarea), **Medio** (degrada experiencia), **Bajo** (mejora de calidad)

---

## 3. Hallazgos — Tabla Resumen

| # | Hallazgo | Severidad | Archivo / Línea |
|---|----------|-----------|-----------------|
| H1 | Tab "Nuevo Anuncio" no existe en ChipNav → estado huérfano | **Crítico** | `EntrepreneurDashboard.jsx` L311–552 |
| H2 | Formularios se renderizan bajo la lista, sin reemplazarla | **Crítico** | `EntrepreneurDashboard.jsx` L311, L450 |
| H3 | Campo `category_id` ausente en formulario de anuncio | **Crítico** | `EntrepreneurDashboard.jsx` ~L90 |
| H4 | `StatsCard` con `minWidth: 200px` → overflow horizontal en mobile | **Medio** | `StatsCard.jsx` L54 |
| H5 | Confirmación de borrado con `window.confirm()` nativo | **Medio** | `EntrepreneurDashboard.jsx` L129 |
| H6 | Sin enlace "Ver anuncios" en tarjeta de proyecto | **Medio** | `EntrepreneurDashboard.jsx` (tarjetas) |
| H7 | Sin estado vacío ilustrado para primer acceso | **Medio** | `EntrepreneurDashboard.jsx` L222 |
| H8 | `expires_at` sin restricción de rango visible al usuario | **Medio** | Formulario de anuncio |
| H9 | Sin contadores de caracteres en título y descripción | **Bajo** | Formulario de anuncio |
| H10 | Botón de envío sin estado loading → doble submit posible | **Bajo** | `EntrepreneurDashboard.jsx` L90 |
| H11 | Badges de notificaciones sin `justify-content-between` | **Bajo** | `EntrepreneurDashboard.jsx` (sección notificaciones) |
| H12 | `ChipNav` sin atributos ARIA (`role`, `aria-selected`) | **Bajo** | `ChipNav.jsx` |

---

## 4. Análisis Detallado

### H1 — Estado huérfano: "Crear Anuncio" sin tab de retorno ❌ Crítico

`ChipNav` expone tres opciones: `['Mis Proyectos', 'Nuevo Proyecto', 'Notificaciones']`. El formulario de creación de anuncio se activa mediante `setActiveTab('create-announcement')` desde un botón dentro de "Mis Proyectos", pero `'create-announcement'` **no es un ítem del ChipNav**. Una vez dentro del formulario, el usuario no puede volver con el nav: el chip activo no cambia, la navegación queda rota. En mobile, donde no existe un botón "Atrás" del browser siempre visible, esto es un bloqueante de flujo.

**Impacto:** El emprendedor queda atrapado dentro del formulario sin retorno visual claro.

---

### H2 — Formularios appended bajo la lista, no como vista independiente ❌ Crítico

Cuando `showCreateProject` o `showCreateAnnouncement` son `true`, el formulario se **añade al final del DOM** debajo de la lista de proyectos existente, en lugar de reemplazarla o mostrarse en un panel/modal. En un viewport de 375px con 3 o más proyectos, el usuario necesita hacer scroll extenso para llegar al formulario, sin ninguna separación visual que indique que está en una "pantalla" diferente.

El patrón esperado en apps mobile-first es: **navegación = reemplazo de vista** (full-screen form, modal, o `display: none` en el contenido anterior).

---

### H3 — Bug funcional: formulario de anuncio no envía `category_id` ❌ Crítico

El formulario construye el `FormData` con `custom_category` (string libre), pero el backend espera `category_id` (integer FK). El resultado es que todos los anuncios creados desde el dashboard llegan al backend **sin categoría válida**, lo que puede causar errores de validación o datos corruptos en base de datos.

```js
// EntrepreneurDashboard.jsx ~L90
formData.append('custom_category', ...);  // ← campo incorrecto
// falta: formData.append('category_id', selectedCategoryId);
```

---

### H4 — `StatsCard` desborda en mobile ⚠️ Medio

`StatsCard.jsx` line 54 define `minWidth: '200px'` dentro de un contenedor `d-flex flex-row gap-3`. Con tres tarjetas en fila y 200px mínimos cada una, el ancho total mínimo es **≥ 612px**, muy superior al viewport de 375px. El resultado es scroll horizontal no intencionado en la sección de estadísticas.

**Corrección:** cambiar a `flex-wrap: wrap` con `minWidth: '140px'` o usar una grilla de 2 columnas para móvil.

---

### H5 — `window.confirm()` en destrucción de proyectos ⚠️ Medio

```js
// EntrepreneurDashboard.jsx L129
if (window.confirm('¿Estás segura de que querés eliminar este proyecto?')) { ... }
```

En mobile, `window.confirm()` es un diálogo del sistema que bloquea el UI thread, no respeta el diseño de la app, y en algunos browsers móviles (especialmente WebViews) está deshabilitado por defecto. El estándar actual es un **modal de confirmación in-app** con botones claramente diferenciados.

---

### H6 — Sin acceso a anuncios desde la tarjeta de proyecto ⚠️ Medio

Cada tarjeta de proyecto muestra solo dos acciones: "Suspender" y "Eliminar". El DDC v1.3 (WF-3.4.2) especifica una vista de detalle desde la que el emprendedor puede ver los anuncios de ese proyecto y su estado de moderación. Esa ruta/link no existe. El emprendedor no puede saber si sus anuncios fueron aprobados, rechazados o están pendientes desde el panel principal.

---

### H7 — Empty state sin ilustración para primer acceso ⚠️ Medio

El estado vacío (`EntrepreneurDashboard.jsx` L222) muestra solo texto y un botón. Para un emprendedor que acaba de registrarse, este momento es crítico para la activación: una ilustración o un mini-onboarding de 2–3 pasos (crear proyecto → crear anuncio → esperar aprobación) tendría un impacto directo en la tasa de conversión.

---

### H8 — `expires_at` sin restricciones de rango comunicadas al usuario ⚠️ Medio

El campo fecha de vencimiento está marcado como "opcional", pero no hay ningún indicador de que:
- Si no se completa, el sistema asigna 30 días por defecto
- La fecha mínima válida es mañana
- La fecha máxima es 365 días (según DDC)

Esto genera confusión y potenciales entradas de fecha inválidas.

---

### H9 — Sin contadores de caracteres 🔵 Bajo

El DDC especifica `maxLength: 120` para título y `maxLength: 500` para descripción. Los campos no tienen ni el atributo `maxLength` en el input ni un contador visible tipo `"45 / 120"`. El usuario puede exceder el límite y recibir un error del backend sin previo aviso.

---

### H10 — Botón de submit sin loading guard 🔵 Bajo

`handleCreateAnnouncement` no desactiva el botón durante la petición. En una conexión lenta (típica de mobile en Argentina), el usuario puede presionar "Publicar" múltiples veces antes de recibir respuesta, generando anuncios duplicados.

---

### H11 — Layout de badges de notificaciones colapsado 🔵 Bajo

La fila con el contador de no-leídas y el botón "Marcar todas" usa `d-flex` sin `justify-content-between`, por lo que en pantallas angostas ambos elementos quedan pegados y pueden superponerse o cortar el texto del badge.

---

### H12 — ChipNav sin ARIA 🔵 Bajo

`ChipNav.jsx` no implementa `role="tablist"` en el contenedor ni `role="tab"` + `aria-selected` en cada chip. Esto impacta a usuarios de lectores de pantalla y es un requisito básico de accesibilidad para componentes de navegación tipo tab.

---

## 5. Plan de Acción — Pasos Ordenados por Impacto

### Paso 1 — Corregir bug funcional de `category_id` (1–2h)
> **Bloqueante funcional.** Agregar un `<select>` que cargue las categorías disponibles vía API y envíe `category_id` al backend. Sin esto, los anuncios no se pueden categorizar correctamente.

### Paso 2 — Refactorizar navegación: eliminar estado huérfano (2–4h)
> Agregar `'Nuevo Anuncio'` al array de chips del `ChipNav`, o implementar un sistema de sub-navegación claro. Cualquier estado de `activeTab` que no tenga representación en el nav debe ser eliminado o convertido en un modal.

### Paso 3 — Formularios como vista de pantalla completa, no appended (3–5h)
> Reemplazar el patrón `showCreateProject && <Form />` por un renderizado condicional que oculte la lista (`display: none` o desmontaje) y muestre el formulario con un header que incluya botón "← Volver". Esto es el patrón estándar de navegación en apps mobile.

### Paso 4 — Corregir overflow de `StatsCard` en mobile (1h)
> En `StatsCard.jsx`, cambiar `minWidth: '200px'` a `minWidth: '140px'` y verificar que el contenedor padre tenga `flexWrap: 'wrap'`. Alternativamente, usar `col-6` de Bootstrap para grilla de 2 columnas en mobile.

### Paso 5 — Reemplazar `window.confirm()` por modal in-app (2–3h)
> Crear un componente `<ConfirmModal>` reutilizable (título, mensaje, botón de confirmación destructivo, botón cancelar). Reemplazar todas las llamadas a `window.confirm()` en el dashboard.

### Paso 6 — Agregar acceso a anuncios por proyecto (3–4h)
> En cada tarjeta de proyecto, agregar un botón "Ver anuncios" que navegue a una vista filtrada de anuncios de ese proyecto, con su estado de moderación visible (Pendiente / Aprobado / Rechazado). Implementar la ruta correspondiente según WF-3.4.2 del DDC.

### Paso 7 — Mejorar empty state con micro-onboarding (1–2h)
> Para emprendedores sin proyectos, mostrar un empty state con ícono ilustrativo y tres pasos numerados: "1. Creá tu proyecto → 2. Publicá un anuncio → 3. Esperá aprobación". Reduce fricción en la primera sesión.

### Paso 8 — Agregar restricciones y mensajes a `expires_at` (1h)
> Mostrar texto de ayuda: "Si no elegís fecha, el anuncio vence en 30 días automáticamente". Agregar `min={tomorrow}` y `max={in365days}` al input de tipo date. Mostrar el valor por defecto calculado.

### Paso 9 — Agregar contadores de caracteres y `maxLength` (1h)
> En título: `maxLength={120}` + contador `"X / 120"`. En descripción: `maxLength={500}` + contador. Cambiar el color del contador a rojo cuando queden ≤ 20 caracteres.

### Paso 10 — Loading guard en submit y ARIA en ChipNav (1–2h)
> Agregar estado `isSubmitting` para deshabilitar el botón de envío durante la petición. Agregar `role="tablist"`, `role="tab"`, y `aria-selected` al `ChipNav`.

---

## Apéndice — Archivos Auditados

| Archivo | Propósito |
|---------|-----------|
| `frontend/src/pages/EntrepreneurDashboard.jsx` | Panel principal del emprendedor (618 líneas) |
| `frontend/src/components/ChipNav.jsx` | Navegación por chips/tabs |
| `frontend/src/components/StatsCard.jsx` | Tarjetas de estadísticas animadas |
| `docs/DDC.md` | Documento de Diseño Conceptual v1.3 |
