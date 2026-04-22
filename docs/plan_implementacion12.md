# PLAN DE IMPLEMENTACIÓN — SPRINT 12
**Proyecto:** Mural Maz Lince  
**Sprint:** 12 — Fase de Testing (Semana 1 de 2)  
**Épica:** ÉPICA 5 — TESTING  
**Referencia:** PMP v1.4 · SRS v1.4 · SAD v1.3 · DDC v1.2  
**Elaborado por:** Mentor Senior de Ingeniería de Software  
**Fecha de referencia:** Abril 2026

---

## CONTEXTO Y OBJETIVO DEL SPRINT

El Sprint 12 marca la transición del proyecto del modo construcción al modo verificación. En este punto toda la lógica del sistema ya existe: el backend (Sprints 7–10) y el frontend (Sprint 11) están integrados y desplegados en staging. El objetivo del sprint **no es encontrar bugs al azar**, sino ejecutar una estrategia sistemática y documentada que demuestre, caso a caso y con evidencia, que cada módulo crítico se comporta exactamente como lo especifican el SRS y el SAD.

El entregable tangible del sprint no es solo "pruebas que pasan". Es el **STP firmado y el borrador del STD con cada defecto catalogado**, que serán los documentos de entrada obligatorios para el Sprint 13 y para el hito de cierre HITO-09.

**Criterio de Done del Sprint 12 (salida al Sprint 13):**
- STP v1.0 completo y en `/docs/STP.md` del repositorio.
- Suite Jest ejecutándose con cobertura ≥ 70% general y 100% en módulos críticos.
- Pruebas de integración de todos los endpoints con resultado documentado.
- Prueba de seguridad WhatsApp con resultado: 0 ocurrencias en texto plano.
- Prueba de compresión con resultado: 0 archivos > 500 KB en servidor.
- Borrador STD con todos los defectos catalogados por severidad.
- Ningún defecto de severidad Crítica (SEV-1) abierto al cierre del sprint.

---

## TAREA 1 — Elaborar el STP (Software Test Plan) completo

### Por qué esta tarea va primero

El STP es el contrato de pruebas. Sin él, el resto de actividades del sprint son improvisación. Se escribe antes de ejecutar cualquier prueba porque define las reglas del juego: qué se prueba, con qué herramientas, cuándo una prueba pasa y cuándo el sprint fracasa.

### Estructura exacta del documento `/docs/STP.md`

El STP debe tener exactamente las siguientes secciones:

---

#### STP Sección 1 — Introducción

Describir el propósito del plan, los documentos de referencia (SRS v1.4, SAD v1.3, DDC v1.2, PMP v1.4) y el alcance de las pruebas de este sprint.

**Alcance declarado:** pruebas de los módulos del backend (Node.js/Express), pruebas de integración de la API REST, pruebas de seguridad sobre la protección del número WhatsApp, prueba de compresión client-side y prueba de persistencia de imágenes.

**Fuera del alcance del Sprint 12:** pruebas end-to-end de flujos completos de usuario (esas van en Sprint 13), pruebas de responsividad visual y compatibilidad de navegadores (Sprint 13).

---

#### STP Sección 2 — Estrategia de pruebas

Documentar tres niveles de prueba y la herramienta para cada uno:

**Nivel 1 — Pruebas unitarias puras**
- Herramienta: Jest con `--coverage`
- Objetivo: verificar que cada función pura del backend produce el output correcto dado un input específico, en aislamiento total (sin base de datos, sin red, sin servicios externos).
- Módulos bajo cobertura 100%: `utils/checksum.js`, `utils/dhash.js` (incluye `hammingDistance`), `services/whatsappLinkService.js`, lógica del umbral de intención en `services/interactionService.js`.
- Módulos bajo cobertura general ≥ 70%: todos los demás archivos de `controllers/`, `services/`, `middleware/`.

**Nivel 2 — Pruebas de integración de API**
- Herramienta: Jest + Supertest
- Objetivo: verificar que cada endpoint de la API REST devuelve el status HTTP correcto y el body JSON esperado ante inputs controlados, usando una base de datos PostgreSQL de prueba real (no mocks de BD).
- Entorno requerido: base de datos de test dedicada con el schema aplicado y seeds de datos de prueba.

**Nivel 3 — Pruebas de seguridad y comportamiento del sistema**
- Herramienta: scripts Node.js personalizados + Jest
- Objetivo: verificar propiedades de seguridad (WhatsApp no expuesto), límites de payload (compresión), y comportamiento del sistema ante condiciones de umbral (shadowban).

---

#### STP Sección 3 — Entorno de pruebas

Especificar exactamente la configuración necesaria para reproducir las pruebas:

```
# .env.test (a crear en la raíz del proyecto, NUNCA commitear a Git)
NODE_ENV=test
DATABASE_URL=postgresql://localhost:5432/mural_lince_test
JWT_SECRET=test-secret-key-only-for-testing
CLOUDINARY_CLOUD_NAME=[valor real de staging]
CLOUDINARY_API_KEY=[valor real de staging]
CLOUDINARY_API_SECRET=[valor real de staging]
GOOGLE_CLOUD_VISION_KEY=[valor real de staging]
HASH_SIMILARITY_THRESHOLD=10
INTENT_THRESHOLD_MS=5000
REPORT_ALERT_THRESHOLD=3
REPORT_SHADOWBAN_THRESHOLD=5
REPORT_SHADOWBAN_HOURS=12
REPORT_SHADOWBAN_MAX_HOURS=48
```

El entorno de pruebas usa una base de datos PostgreSQL separada (`mural_lince_test`), nunca la base de datos de producción o staging. Antes de cada suite de integración se ejecuta un script de reset que aplica el schema y los seeds necesarios para ese suite.

---

#### STP Sección 4 — Criterios de entrada y salida por fase

Esta sección es la más importante del STP desde la perspectiva de gestión. Define cuándo se puede empezar y cuándo se puede terminar cada fase.

**FASE A — Pruebas unitarias**

| Campo | Criterio |
|---|---|
| Criterio de entrada | Sprint 11 marcado como Done. Rama `main` con todos los tests de sprints anteriores en verde. Base de datos de test provisionada. |
| Criterio de salida | Cobertura Jest ≥ 70% general reportada por `--coverage`. Cobertura 100% en los 4 módulos críticos. Cero tests en estado FAIL. |
| Condición de bloqueo | Si algún módulo crítico no alcanza 100%, el sprint no avanza a Fase B hasta que se corrija el código o el test. |

**FASE B — Pruebas de integración de API**

| Campo | Criterio |
|---|---|
| Criterio de entrada | Fase A completada. Todos los endpoints documentados en la Sección 4 del DDC existiendo en el código. |
| Criterio de salida | 100% de los casos de prueba de integración ejecutados. Todos en estado PASS o con defecto registrado en el STD. |
| Condición de bloqueo | Si un endpoint crítico (autenticación, publicación de anuncio, moderación) devuelve status incorrecto: bloqueo hasta corrección. |

**FASE C — Pruebas de seguridad y sistema**

| Campo | Criterio |
|---|---|
| Criterio de entrada | Fases A y B completadas. |
| Criterio de salida | Prueba WhatsApp: 0 ocurrencias en texto plano. Prueba compresión: 0 archivos fuera de límite. Prueba shadowban: comportamiento correcto en 100% de escenarios. |
| Condición de bloqueo | Cualquier resultado positivo en la prueba de WhatsApp es un defecto SEV-1 que bloquea el sprint. |

---

#### STP Sección 5 — Definición de severidades de defectos

Esta taxonomía se usará en el STD. Todo defecto encontrado se clasifica en una de estas categorías:

**SEV-1 | Crítico — Bloquea el sprint**
El sistema tiene un fallo de seguridad, de integridad de datos o de corrección de lógica de negocio que hace que el sistema no pueda operar de forma confiable. El sprint no cierra hasta que se resuelva.

Ejemplos concretos en este proyecto:
- El número de WhatsApp aparece como texto plano en cualquier respuesta de la API.
- El registro de emprendedor crea solo el registro en `users` pero no en `entrepreneur_profiles` (transacción atómica rota).
- El pipeline de moderación aprueba automáticamente imágenes que Vision API marcaría como LIKELY adult.
- El checksum acepta una matrícula con formato inválido.

**SEV-2 | Mayor — Debe resolverse antes del Sprint 14**
Una funcionalidad principal no se comporta como especifica el SRS, pero el sistema sigue siendo operativo en sus demás funciones. Se registra en el STD con solución pendiente antes del despliegue a producción.

Ejemplos: el umbral de intención calcula la ventana de 5 segundos con un error de ±200ms. El límite de 5 proyectos activos permite crear el sexto en lugar de retornar HTTP 409. La paginación por cursor devuelve un anuncio duplicado al pasar de página.

**SEV-3 | Menor — Se resuelve antes del cierre**
Un comportamiento incorrecto que no afecta una funcionalidad principal. Puede resolverse en el Sprint 13 sin bloquear el avance.

Ejemplos: el mensaje de error de contraseña incorrecta dice "matrícula no encontrada" en lugar de "contraseña incorrecta". Un timestamp en notificaciones se muestra en UTC en lugar de hora local.

**SEV-4 | Observación — Registro informativo**
Algo que no es un bug pero que debería mejorar en una versión futura. No bloquea nada.

Ejemplos: el endpoint `GET /announcements` tarda 800ms en devolver los primeros 20 anuncios cuando hay 500 en la base de datos (dentro del límite de RNF-01 pero se puede optimizar). El log de Winston registra demasiada información en nivel DEBUG en producción.

---

### Criterio de aprobación de la Tarea 1

- El documento `/docs/STP.md` existe en el repositorio con las 5 secciones descritas arriba, completas y sin secciones vacías.
- El STP es autocontenido: cualquier persona nueva en el proyecto puede leerlo y saber exactamente qué ejecutar, en qué orden y cómo interpretar los resultados.
- La Sección 4 tiene exactamente tres fases con criterios de entrada y salida verificables (no ambiguos).
- La Sección 5 tiene exactamente 4 niveles de severidad con al menos 2 ejemplos concretos del proyecto por nivel.

---

## TAREA 2 — Diseñar los casos de prueba para todos los módulos críticos

### Principio de diseño

Cada caso de prueba tiene: un identificador único, la precondición exacta, el input exacto, el output esperado y la referencia al SRS que justifica ese comportamiento esperado. No hay casos de prueba vagos como "verificar que funciona".

El archivo de destino de esta tarea es `/docs/casos_prueba_sprint12.md`, que alimentará el STD definitivo del Sprint 13.

---

### 2.1 — Módulo checksum de matrícula

**Archivo a probar:** `utils/checksum.js` → función `isValidMatricula(str)`

La función es una función pura: recibe un string, devuelve `true` o `false`. Esto hace que sus tests sean completamente deterministas.

**Referencia SRS:** RN-01

| ID | Descripción | Input | Output esperado |
|---|---|---|---|
| TC-CS-01 | Matrícula válida canónica | `"20240001"` | `true` |
| TC-CS-02 | Matrícula válida con dígito 2 de inicio y 7 al final | `"29999999"` | `true` |
| TC-CS-03 | Exactamente 7 dígitos (corta) | `"2024000"` | `false` |
| TC-CS-04 | Exactamente 9 dígitos (larga) | `"202400001"` | `false` |
| TC-CS-05 | 8 dígitos pero primer dígito distinto de 2 | `"30240001"` | `false` |
| TC-CS-06 | 8 dígitos pero primer dígito 0 | `"00240001"` | `false` |
| TC-CS-07 | 8 dígitos pero primer dígito 9 | `"90240001"` | `false` |
| TC-CS-08 | Contiene letras intercaladas | `"2024A001"` | `false` |
| TC-CS-09 | Contiene espacios al inicio | `" 2024001"` | `false` |
| TC-CS-10 | Contiene espacios al final | `"20240001 "` | `false` |
| TC-CS-11 | Cadena vacía | `""` | `false` |
| TC-CS-12 | `null` | `null` | `false` |
| TC-CS-13 | `undefined` | `undefined` | `false` |
| TC-CS-14 | Número (no string) | `20240001` | `false` |
| TC-CS-15 | String con guión | `"2024-001"` | `false` |

**Estructura del test en Jest:**

```javascript
// tests/unit/checksum.test.js
const { isValidMatricula } = require('../../utils/checksum');

describe('isValidMatricula', () => {
  describe('casos válidos', () => {
    test('TC-CS-01: matrícula válida canónica', () => {
      expect(isValidMatricula('20240001')).toBe(true);
    });
    // ... resto de casos válidos
  });

  describe('casos inválidos — longitud', () => {
    test('TC-CS-03: 7 dígitos', () => {
      expect(isValidMatricula('2024000')).toBe(false);
    });
    // ...
  });

  describe('casos edge — tipos de entrada', () => {
    test('TC-CS-12: null', () => {
      expect(isValidMatricula(null)).toBe(false);
    });
    test('TC-CS-13: undefined', () => {
      expect(isValidMatricula(undefined)).toBe(false);
    });
    test('TC-CS-14: número en lugar de string', () => {
      expect(isValidMatricula(20240001)).toBe(false);
    });
  });
});
```

**Criterio de aprobación TC-CS:** Los 15 casos pasan. La cobertura de líneas, ramas y funciones del archivo `utils/checksum.js` reportada por Jest es 100%.

---

### 2.2 — Módulo dHash y hammingDistance

**Archivos a probar:** `utils/dhash.js` → funciones `computeHash(imageBuffer)` y `hammingDistance(hash1, hash2)`

**Referencia SRS:** RF-28, RN-07, RN-05 del SAD (ADR-02)

#### Preparación del fixture de imágenes

Antes de escribir los tests, crear el directorio `tests/fixtures/images/` con los siguientes archivos:

- `base.jpg` — imagen de referencia (cualquier foto de 300x300px)
- `base_bright.jpg` — la misma imagen con brillo +20% (generada con sharp o GIMP)
- `base_crop.jpg` — la misma imagen recortada en un 5% en todos los bordes
- `base_resized.jpg` — la misma imagen redimensionada a 280x280px y vuelta a 300x300px
- `different.jpg` — imagen completamente diferente (otra foto, distinto contenido visual)
- `similar_theme_1.jpg` — foto de cupcakes de repostería A (fotógrafa A)
- `similar_theme_2.jpg` — foto de cupcakes de repostería B (fotógrafa B, mismo tema distinta imagen)

**Importante:** Los fixtures `similar_theme_1.jpg` y `similar_theme_2.jpg` son el caso más crítico del sistema (ADR-02 del SAD). Si el umbral de 10 bits falla aquí, generará falsos positivos en producción. Si no tienes imágenes reales, puedes usar `sharp` para generar dos versiones visualmente distintas del mismo tipo de objeto.

| ID | Descripción | Input | Output esperado | Ref. SAD |
|---|---|---|---|---|
| TC-DH-01 | Misma imagen comparada consigo misma | `base.jpg` vs `base.jpg` | `distance === 0` | ADR-02 |
| TC-DH-02 | Imagen con leve variación de brillo | `base.jpg` vs `base_bright.jpg` | `distance <= 10` | ADR-02 |
| TC-DH-03 | Imagen ligeramente recortada | `base.jpg` vs `base_crop.jpg` | `distance <= 10` | ADR-02 |
| TC-DH-04 | Imagen redimensionada y vuelta | `base.jpg` vs `base_resized.jpg` | `distance <= 10` | ADR-02 |
| TC-DH-05 | Imágenes completamente distintas | `base.jpg` vs `different.jpg` | `distance > 10` | ADR-02 |
| TC-DH-06 | Falso positivo: misma temática distinta imagen | `similar_theme_1.jpg` vs `similar_theme_2.jpg` | `distance > 10` | ADR-02 (crítico) |
| TC-DH-07 | hammingDistance con hashes idénticos | `hash1 === hash2` | `0` | — |
| TC-DH-08 | hammingDistance, 1 bit de diferencia | hashes que difieran en 1 bit | `1` | — |
| TC-DH-09 | hammingDistance, todos los bits distintos | hash de `0x00...` vs `0xFF...` | `64` | — |
| TC-DH-10 | computeHash acepta Buffer | Buffer de imagen válida | string hexadecimal de 64 bits | — |
| TC-DH-11 | computeHash con buffer vacío | `Buffer.alloc(0)` | lanzar error o devolver null | — |

**Nota sobre TC-DH-06:** si este test falla (la distancia entre dos fotos distintas del mismo tema es ≤ 10), el umbral del sistema está mal calibrado y es un defecto SEV-2. El ajuste se hace modificando `HASH_SIMILARITY_THRESHOLD` sin tocar código.

**Criterio de aprobación TC-DH:** Los 11 casos pasan. Cobertura 100% en `utils/dhash.js`.

---

### 2.3 — Umbral de intención

**Archivo a probar:** lógica de timestamp en `services/interactionService.js` (función que calcula `is_accidental`)

**Referencia SRS:** RF-14, RN-08

La lógica es: `(reverted_at - created_at) < INTENT_THRESHOLD_MS` → `is_accidental = true`

| ID | Descripción | created_at | reverted_at | THRESHOLD | Output esperado |
|---|---|---|---|---|---|
| TC-IT-01 | Reversión a los 4,999 ms (dentro del umbral) | T | T + 4999ms | 5000 | `is_accidental: true` |
| TC-IT-02 | Reversión exactamente a los 5,000 ms (en el límite) | T | T + 5000ms | 5000 | `is_accidental: false` |
| TC-IT-03 | Reversión a los 5,001 ms (fuera del umbral) | T | T + 5001ms | 5000 | `is_accidental: false` |
| TC-IT-04 | Reversión a los 100 ms (tap accidental rápido) | T | T + 100ms | 5000 | `is_accidental: true` |
| TC-IT-05 | No hay reversión (`reverted_at` es null) | T | null | 5000 | `is_accidental: false` |
| TC-IT-06 | Reversión a los 10 segundos | T | T + 10000ms | 5000 | `is_accidental: false` |
| TC-IT-07 | Umbral parametrizado a 3000ms, reversión a 4000ms | T | T + 4000ms | 3000 | `is_accidental: false` |

**Importante:** los tests de esta función deben mockear el reloj del sistema con `jest.useFakeTimers()` para que sean deterministas. No confiar en `Date.now()` real.

**Criterio de aprobación TC-IT:** Los 7 casos pasan. Cobertura 100% en la función que determina `is_accidental`.

---

### 2.4 — Protección del número WhatsApp

**Archivo a probar:** `services/whatsappLinkService.js` → función `generateWaLink(phoneNumber)`

**Referencia SRS:** RF-11, RN-09

| ID | Descripción | Input | Output esperado |
|---|---|---|---|
| TC-WA-01 | Número mexicano formato +52 | `"+5216691234567"` | `"https://wa.me/5216691234567"` |
| TC-WA-02 | El resultado NO contiene el número en texto aislado | `"+5216691234567"` | `!result.includes('\n')` y el número solo aparece como parte de la URL |
| TC-WA-03 | Número con formato distinto (sin +) | `"5216691234567"` | URL válida wa.me |
| TC-WA-04 | La función devuelve solo la URL, sin campos extra | `"+5216691234567"` | `typeof result === 'string'` |

**Criterio de aprobación TC-WA:** Los 4 casos pasan. Cobertura 100%.

---

### 2.5 — Compresión y validación de imagen

**Contexto:** estos tests son de integración parcial. Prueban que el middleware del backend rechaza imágenes fuera de límite (segunda línea de defensa, RF-31).

Los tests unitarios de la compresión client-side no son posibles en Jest (browser-image-compression corre en el navegador). Para esa parte, la verificación se hace en la Tarea 6 (ejecución manual).

| ID | Descripción | Condición | Output esperado |
|---|---|---|---|
| TC-CM-01 | Imagen de 400 KB → aceptada | POST /announcements con imagen 400KB | HTTP 201 o 202 |
| TC-CM-02 | Imagen de 501 KB → rechazada | POST /announcements con imagen 501KB | HTTP 413 |
| TC-CM-03 | Imagen de 1 MB → rechazada | POST /announcements con imagen 1MB | HTTP 413 |
| TC-CM-04 | Imagen de 1200px exactos → aceptada | POST /announcements con imagen 1200px | HTTP 201 o 202 |
| TC-CM-05 | Imagen de 1201px → rechazada | POST /announcements con imagen 1201px | HTTP 413 |

**Para generar imágenes de prueba de tamaño exacto**, usar el script:

```javascript
// scripts/generate-test-images.js
const sharp = require('sharp');

// Genera imagen de 1200x1200px exactos (~400KB JPEG)
await sharp({ create: { width: 1200, height: 1200, channels: 3, background: '#FF0000' } })
  .jpeg({ quality: 80 })
  .toFile('tests/fixtures/images/exactly_1200px.jpg');

// Para imágenes de tamaño exacto en bytes, ajustar quality hasta alcanzar el umbral
```

**Criterio de aprobación TC-CM:** Los 5 casos de integración pasan.

---

### 2.6 — Persistencia de imágenes en Cloudinary

Este caso es una prueba de sistema, no una prueba unitaria. Se ejecuta en entorno de staging.

| ID | Descripción | Pasos | Output esperado |
|---|---|---|---|
| TC-PS-01 | Imagen disponible tras reinicio del servidor | 1) Publicar anuncio con imagen. 2) Guardar la `cloudinary_url` devuelta. 3) Ejecutar redeploy en Railway staging. 4) Hacer GET a la `cloudinary_url` directamente. | HTTP 200 con la imagen original. La URL sigue siendo válida. |
| TC-PS-02 | Eliminación correcta al borrar anuncio | 1) Publicar anuncio. 2) Guardar `cloudinary_id`. 3) Eliminar el anuncio (DELETE /announcements/:id). 4) Intentar acceder a la URL de Cloudinary. | HTTP 404 desde Cloudinary. El `cloudinary_id` no existe en la cuenta. |

**Criterio de aprobación TC-PS:** Ambos casos ejecutados con evidencia (captura de pantalla o log del resultado HTTP).

---

### 2.7 — Shadowban automático y restauración

Estos tests requieren modificar temporalmente los umbrales en `.env.test` para no esperar 12 y 48 horas reales.

**Configuración para tests de shadowban:**

```
# Solo en .env.test, valores acelerados para prueba
REPORT_ALERT_THRESHOLD=3
REPORT_SHADOWBAN_THRESHOLD=5
REPORT_SHADOWBAN_HOURS=0.033   # ~2 minutos
REPORT_SHADOWBAN_MAX_HOURS=0.083  # ~5 minutos
```

| ID | Descripción | Pasos | Output esperado |
|---|---|---|---|
| TC-SB-01 | Shadowban NO se activa con 4 reportes únicos | Crear anuncio, generar 4 reportes de usuarios distintos, esperar 2 minutos | `status === 'active'` |
| TC-SB-02 | Alerta de urgencia al llegar a 3 reportes | Crear anuncio, generar 3 reportes | Registro en `moderation_queue` con `urgency_alert_at NOT NULL` |
| TC-SB-03 | Shadowban se activa con 5 reportes + 2 min (umbral acelerado) | Crear anuncio, 5 reportes de usuarios distintos, esperar que el cron dispare | `status === 'shadowban'`, notificación interna al emprendedor creada |
| TC-SB-04 | El anuncio en shadowban no aparece en el feed | Después de TC-SB-03 | `GET /announcements` no incluye el anuncio en shadowban |
| TC-SB-05 | El administrador ve el anuncio en shadowban en su panel | Después de TC-SB-03 | `GET /admin/moderation-queue` incluye el anuncio |
| TC-SB-06 | Restauración automática a los 5 min (umbral acelerado) | Después de TC-SB-03, sin acción del admin, esperar 5 min | `status === 'active'`, notificación de restauración al emprendedor |
| TC-SB-07 | Reportes del mismo usuario sobre el mismo anuncio no acumulan | Usuario X reporta el mismo anuncio dos veces | Solo 1 reporte contabilizado, HTTP 409 en el segundo intento |

**Criterio de aprobación TC-SB:** Los 7 casos ejecutados y documentados.

---

### Criterio de aprobación de la Tarea 2

- El archivo `/docs/casos_prueba_sprint12.md` existe con los 7 grupos de casos (TC-CS, TC-DH, TC-IT, TC-WA, TC-CM, TC-PS, TC-SB).
- Cada caso tiene: ID, descripción, input exacto o precondición, output esperado, referencia al SRS.
- Total de casos de prueba diseñados: no menos de 50.
- Los fixtures de imágenes están en `tests/fixtures/images/` y son reproducibles.

---

## TAREA 3 — Ejecutar la suite completa de pruebas unitarias (Jest)

### Configuración de Jest para este proyecto

Asegurarse de que `jest.config.js` en la raíz del backend tiene exactamente esta configuración:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',          // excluir el punto de entrada
    '!src/server.js',       // excluir el arranque del servidor
    '!src/migrations/**',   // excluir migraciones
    '!src/seeds/**',        // excluir seeds
  ],
  coverageThresholds: {
    global: {
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
    './src/utils/checksum.js': { lines: 100, functions: 100, branches: 100 },
    './src/utils/dhash.js': { lines: 100, functions: 100, branches: 100 },
    './src/services/whatsappLinkService.js': { lines: 100, functions: 100, branches: 100 },
    // Ajustar ruta según la ubicación real de la lógica de umbral de intención
    './src/services/interactionService.js': { lines: 100, functions: 100, branches: 100 },
  },
  setupFilesAfterFramework: ['./tests/setup.js'],
  testMatch: ['**/tests/unit/**/*.test.js', '**/tests/integration/**/*.test.js'],
  verbose: true,
};
```

La propiedad `coverageThresholds` por archivo hace que Jest falle automáticamente si los módulos críticos no alcanzan el 100%, sin necesidad de verificación manual.

### Comando de ejecución y registro de resultados

```bash
# Ejecutar solo unitarias (rápido, sin BD)
npx jest tests/unit/ --coverage --verbose 2>&1 | tee results/unit_sprint12.txt

# Verificar el resultado
echo "Exit code: $?"
```

Guardar la salida completa en `results/unit_sprint12.txt` como evidencia para el STD.

### Criterio de aprobación de la Tarea 3

- `npx jest tests/unit/ --coverage` termina con exit code 0 (ningún test en FAIL).
- El reporte de cobertura muestra ≥ 70% en todas las métricas globales.
- El reporte muestra 100% de cobertura de líneas, ramas y funciones en los 4 módulos críticos.
- El archivo `results/unit_sprint12.txt` está en el repositorio como evidencia.

---

## TAREA 4 — Ejecutar todas las pruebas de integración de la API REST

### Organización de los tests de integración

Los tests de integración están en `tests/integration/` organizados por recurso de la API (siguiendo la estructura del DDC Sección 4):

```
tests/integration/
  auth.test.js         → endpoints POST /auth/*
  announcements.test.js → endpoints /announcements
  projects.test.js     → endpoints /projects
  interactions.test.js → endpoints /like, /rating, /report
  notifications.test.js → endpoints /notifications
  admin.test.js        → endpoints /admin/*
```

### Setup de base de datos de test

```javascript
// tests/setup.js
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

beforeAll(async () => {
  // Limpiar y recrear schema
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  // Aplicar schema
  const schema = fs.readFileSync('src/migrations/schema.sql', 'utf8');
  await pool.query(schema);
  // Aplicar seed de categorías
  const seed = fs.readFileSync('src/seeds/categories.sql', 'utf8');
  await pool.query(seed);
});

afterAll(async () => {
  await pool.end();
});
```

### Casos de integración obligatorios por endpoint (mínimo)

**auth.test.js**

| Caso | Endpoint | Escenario | HTTP esperado |
|---|---|---|---|
| INT-AU-01 | POST /auth/register/student | Matrícula válida nueva | 201 |
| INT-AU-02 | POST /auth/register/student | Matrícula con formato inválido | 400 |
| INT-AU-03 | POST /auth/register/student | Matrícula ya registrada | 409 |
| INT-AU-04 | POST /auth/register/entrepreneur | Todos los campos válidos | 201 + dos registros en BD |
| INT-AU-05 | POST /auth/register/entrepreneur | `display_name` con palabra ofensiva | 400 |
| INT-AU-06 | POST /auth/register/entrepreneur | Sin checkbox de privacidad | 400 |
| INT-AU-07 | POST /auth/login (ROL-02) | Solo matrícula válida | 200 + cookie |
| INT-AU-08 | POST /auth/login (ROL-03) | Contraseña incorrecta | 401 |
| INT-AU-09 | POST /auth/login | Cuenta suspendida | 403 |
| INT-AU-10 | POST /auth/logout | Sesión activa | 200 + cookie vacía |
| INT-AU-11 | GET /ruta-protegida sin cookie | Sin autenticación | 401 |

**announcements.test.js**

| Caso | Endpoint | Escenario | HTTP esperado |
|---|---|---|---|
| INT-AN-01 | GET /announcements | Sin autenticación (ROL-01) | 200 + array de anuncios |
| INT-AN-02 | GET /announcements | La respuesta NO contiene `whatsapp_number` | 200 + verificación de campo ausente |
| INT-AN-03 | GET /announcements/:id | Usuario autenticado → incluye `wa_link` | 200 + campo `wa_link` presente |
| INT-AN-04 | GET /announcements/:id | ROL-01 → `wa_link` ausente o nulo | 200 + campo `wa_link` null |
| INT-AN-05 | POST /announcements | ROL-03, imagen válida, texto limpio | 201 o 202 |
| INT-AN-06 | POST /announcements | Imagen > 500KB | 413 |
| INT-AN-07 | PATCH /announcements/:id | ROL-03 edita su propio anuncio | 200 |
| INT-AN-08 | DELETE /announcements/:id | ROL-03 elimina su anuncio | 200 + imagen eliminada de Cloudinary |

**projects.test.js**

| Caso | Endpoint | Escenario | HTTP esperado |
|---|---|---|---|
| INT-PR-01 | POST /projects | Primer proyecto | 201 |
| INT-PR-02 | POST /projects | Sexto proyecto (límite N=5) | 409 |
| INT-PR-03 | PATCH /projects/:id/status | Cambio a suspended | 200 |
| INT-PR-04 | DELETE /projects/:id | Con anuncios activos → elimina todo | 200 |

**interactions.test.js**

| Caso | Endpoint | Escenario | HTTP esperado |
|---|---|---|---|
| INT-IN-01 | POST /announcements/:id/like | Primer like | 200, `is_accidental: false` |
| INT-IN-02 | POST /announcements/:id/like | Toggle (revertir like después de 6 seg) | 200, `is_accidental: false` |
| INT-IN-03 | POST /announcements/:id/like | Revertir en < 5000ms | 200, `is_accidental: true` |
| INT-IN-04 | POST /announcements/:id/rating | Valoración 1-3 | 201 |
| INT-IN-05 | POST /announcements/:id/report | Primer reporte | 200 |
| INT-IN-06 | POST /announcements/:id/report | Reporte duplicado mismo usuario | 409 |

### Criterio de aprobación de la Tarea 4

- `npx jest tests/integration/ --verbose` termina con exit code 0.
- 100% de los casos de la tabla anterior ejecutados (no solo los que pasan, todos ejecutados).
- Cualquier caso en FAIL genera un defecto en el STD con su severidad.
- El archivo `results/integration_sprint12.txt` está en el repositorio.

---

## TAREA 5 — Ejecutar el caso de prueba de seguridad WhatsApp

### Metodología

Esta prueba verifica la propiedad de seguridad más crítica del sistema (RN-09). No se hace con Jest sino con un script de auditoría que consulta **todos los endpoints** del sistema y busca el número de WhatsApp en las respuestas.

### Script de auditoría

Crear `tests/security/whatsapp_audit.js`:

```javascript
// tests/security/whatsapp_audit.js
const fetch = require('node-fetch');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_WHATSAPP = process.env.TEST_ENTREPRENEUR_WHATSAPP; // número real de la cuenta de test

// Lista COMPLETA de endpoints a auditar (basada en DDC Sección 4)
const endpoints = [
  { method: 'GET', path: '/announcements', auth: null },
  { method: 'GET', path: '/announcements', auth: 'ROL02' },
  { method: 'GET', path: '/announcements/1', auth: null },
  { method: 'GET', path: '/announcements/1', auth: 'ROL02' },
  { method: 'GET', path: '/projects', auth: 'ROL03' },
  { method: 'GET', path: '/projects/1', auth: 'ROL03' },
  { method: 'GET', path: '/notifications', auth: 'ROL03' },
  { method: 'GET', path: '/admin/moderation-queue', auth: 'ROL04' },
  { method: 'GET', path: '/admin/claim-tickets', auth: 'ROL04' },
];

async function auditEndpoint(endpoint, cookies) {
  const response = await fetch(`${BASE_URL}${endpoint.path}`, {
    method: endpoint.method,
    headers: { 'Cookie': cookies[endpoint.auth] || '' },
  });

  const body = await response.text();

  // Búsqueda del número en texto plano en el body JSON
  const found = body.includes(TEST_WHATSAPP);

  return {
    endpoint: `${endpoint.method} ${endpoint.path}`,
    auth: endpoint.auth,
    status: response.status,
    whatsappExposed: found,
    // Marcar también si aparece cualquier número de 10 dígitos precedido de +52
    patternFound: /\+52\d{10}/.test(body),
  };
}

async function runAudit() {
  console.log('=== AUDITORÍA DE SEGURIDAD WHATSAPP ===\n');

  // Primero autenticarse y obtener cookies para cada rol
  const cookies = await setupAuthCookies();

  let violations = 0;

  for (const endpoint of endpoints) {
    const result = await auditEndpoint(endpoint, cookies);
    const status = result.whatsappExposed || result.patternFound ? '❌ VIOLACIÓN' : '✅ OK';
    console.log(`${status} | ${result.endpoint} (auth: ${result.auth}) | HTTP ${result.status}`);

    if (result.whatsappExposed || result.patternFound) {
      violations++;
      console.error(`   → Número de WhatsApp detectado en respuesta. MET-07 FALLIDO.`);
    }
  }

  console.log(`\n=== RESULTADO: ${violations} violaciones encontradas ===`);
  process.exit(violations > 0 ? 1 : 0);
}

runAudit();
```

**Cómo ejecutar:**

```bash
# Con el servidor de test corriendo
TEST_ENTREPRENEUR_WHATSAPP="5216691234567" \
  API_URL="http://localhost:3001" \
  node tests/security/whatsapp_audit.js 2>&1 | tee results/security_whatsapp_sprint12.txt
```

### Criterio de aprobación de la Tarea 5

- El script termina con exit code 0 (cero violaciones).
- La salida muestra `✅ OK` en todos los endpoints listados.
- MET-07 del PMP: "0 ocurrencias de WhatsApp en texto plano en la API" está satisfecho.
- Si se encuentra aunque sea una violación: defecto SEV-1, el sprint se bloquea hasta resolución.
- El archivo `results/security_whatsapp_sprint12.txt` está en el repositorio.

---

## TAREA 6 — Ejecutar el caso de prueba de compresión client-side

### Metodología

Esta prueba tiene dos partes: una automatizada (server-side, ya cubierta en TC-CM de la Tarea 2) y una manual en el navegador (client-side, donde opera `browser-image-compression`).

### Parte A — Verificación server-side (automatizada)

Ya cubierta en los tests de integración INT-AN-06. Verificar que `POST /announcements` con imagen > 500KB devuelve HTTP 413.

### Parte B — Verificación client-side (manual con DevTools)

**Pasos exactos para la ejecución:**

1. Abrir Chrome DevTools → pestaña Network.
2. Seleccionar throttling "Fast 4G" para simular condiciones móviles.
3. Acceder al formulario de creación de anuncio en staging (WF-3.4.3).
4. Para cada imagen de prueba de la tabla siguiente, seleccionarla en el `ImageUploader` y observar:
   - En la pestaña Network: el tamaño del payload enviado al servidor en el request `POST /announcements`.
   - En la consola: los logs de `browser-image-compression` si existen.

| Imagen original | Tamaño original | Dimensión original | Tamaño esperado post-compresión | Dimensión esperada |
|---|---|---|---|---|
| `test_heavy.jpg` | 3 MB | 3000x2000px | ≤ 500 KB | ≤ 1200px lado largo |
| `test_medium.jpg` | 800 KB | 1500x1000px | ≤ 500 KB | ≤ 1200px lado largo |
| `test_light.jpg` | 200 KB | 800x600px | ≤ 200 KB (sin modificar) | Sin cambio |
| `test_huge.jpg` | 8 MB | 5000x4000px | ≤ 500 KB | ≤ 1200px lado largo |

**Evidencia a capturar:** Screenshot de DevTools Network mostrando el tamaño del request para cada imagen. Guardarlo en `results/compression_test_sprint12/`.

### Criterio de aprobación de la Tarea 6

- Ningún request `POST /announcements` observado en DevTools supera los 500 KB de payload.
- Las dimensiones de las imágenes recibidas en el servidor (verificables en logs de Multer o en la respuesta de Cloudinary) no superan 1,200px.
- MET-09 del PMP: "0 archivos que superen 500 KB en upload" está satisfecho.
- Las capturas de evidencia están en `results/compression_test_sprint12/`.

---

## TAREA 7 — Documentar todos los defectos encontrados (borrador del STD)

### Estructura del borrador del STD

Crear `docs/STD_borrador_sprint12.md` con la siguiente estructura por defecto encontrado:

```markdown
## DEF-[NÚMERO] | Severidad: SEV-[1/2/3/4]

**Fecha de detección:** YYYY-MM-DD  
**Detectado en:** [Nombre del test / tarea]  
**Módulo afectado:** [Archivo o endpoint]  
**Referencia SRS:** [RF-XX / RN-XX]

### Descripción
[Qué comportamiento incorrecto se observó]

### Pasos para reproducir
1. [Paso exacto]
2. [Paso exacto]
3. [Resultado observado]

### Resultado esperado
[Qué debería haber pasado según el SRS]

### Estado
- [ ] Abierto
- [ ] En corrección
- [ ] Resuelto (commit: XXXX)
```

### Reglas de documentación

- Cada defecto tiene un ID único secuencial (DEF-001, DEF-002...).
- No hay defecto sin referencia al SRS que viola. Si no se puede trazar a un requisito, es una observación SEV-4.
- Los defectos SEV-1 y SEV-2 deben documentarse el mismo día que se detectan, no al final del sprint.
- El borrador del STD es un documento vivo durante el sprint: se actualiza conforme se detectan y resuelven defectos.

### Criterio de aprobación de la Tarea 7

- El archivo `docs/STD_borrador_sprint12.md` existe y contiene todos los defectos detectados durante el sprint.
- Cero defectos SEV-1 en estado "Abierto" al cierre del sprint.
- Todos los defectos tienen: ID único, severidad, descripción, pasos de reproducción y referencia al SRS.
- El número de defectos documentados es consistente con los resultados de las herramientas (si Jest reporta 3 tests en FAIL, hay al menos 3 defectos en el STD).

---

## PLAN DE EJECUCIÓN DIARIO DEL SPRINT 12

| Día | Actividad | Entregable al final del día |
|---|---|---|
| **Lunes** | Tarea 1 completa: redactar y commitear STP.md | `/docs/STP.md` en repositorio |
| **Martes** | Tarea 2 completa: diseñar y documentar todos los casos de prueba, crear fixtures de imágenes | `/docs/casos_prueba_sprint12.md`, `tests/fixtures/` |
| **Miércoles AM** | Tarea 3: ejecutar suite unitaria, corregir gaps de cobertura | `results/unit_sprint12.txt`, cobertura ≥ 70% |
| **Miércoles PM** | Tarea 4 primera mitad: tests de integración de auth y announcements | Tests en verde o defectos documentados |
| **Jueves AM** | Tarea 4 segunda mitad: tests de integración de projects, interactions, admin | Suite de integración completa |
| **Jueves PM** | Tarea 5: ejecutar auditoría de seguridad WhatsApp | `results/security_whatsapp_sprint12.txt` |
| **Viernes AM** | Tarea 6: ejecutar prueba de compresión client-side | `results/compression_test_sprint12/` |
| **Viernes PM** | Tarea 7: cerrar borrador STD, verificar criterios de Done del sprint | `docs/STD_borrador_sprint12.md` |

---

## CHECKLIST DE CIERRE DEL SPRINT 12

Antes de mover el sprint a "Done" en Jira, verificar cada ítem:

- [ ] `/docs/STP.md` commitado con las 5 secciones completas.
- [ ] `/docs/casos_prueba_sprint12.md` con ≥ 50 casos de prueba diseñados.
- [ ] `npx jest tests/unit/ --coverage` → exit code 0, cobertura ≥ 70% global y 100% en módulos críticos.
- [ ] `npx jest tests/integration/ --verbose` → exit code 0 o todos los FAIL documentados en STD.
- [ ] `node tests/security/whatsapp_audit.js` → exit code 0, 0 violaciones.
- [ ] Prueba de compresión ejecutada con evidencia en `results/compression_test_sprint12/`.
- [ ] Prueba de persistencia (TC-PS-01 y TC-PS-02) ejecutada con evidencia.
- [ ] Prueba de shadowban (TC-SB-01 a TC-SB-07) ejecutada y documentada.
- [ ] `/docs/STD_borrador_sprint12.md` con todos los defectos catalogados.
- [ ] Cero defectos SEV-1 abiertos.
- [ ] Todos los ítems del Sprint 12 en Jira marcados como Done con referencia al commit de evidencia.
- [ ] Sprint Review realizada: resultados comparados contra criterios de salida del STP Sección 4.

---

*FIN DEL PLAN DE IMPLEMENTACIÓN — SPRINT 12*  
*Mural Maz Lince | ÉPICA 5 — TESTING*
