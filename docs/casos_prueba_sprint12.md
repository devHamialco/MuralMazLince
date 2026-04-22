### Casos de Prueba Sprint 12

Este documento contiene los casos de prueba por modulo critico, siguiendo el plan detallado en el Sprint 12. Cada caso incluye ID, Descripcion, Input/Precondicion, Output Esperado y Referencia al SRS.

---

### 2.1 — Modulo checksum de matricula

**Archivo a probar:** `utils/checksum.js` → función `isValidMatricula(str)`

La función es una función pura: recibe un string, devuelve `true` o `false`. Esto hace que sus tests sean completamente deterministas.

**Referencia SRS:** RN-01

| ID | Descripcion | Input | Output esperado |
|---|---|---|---|
| TC-CS-01 | Matricula valida canonica | `"20240001"` | `true` |
| TC-CS-02 | Matricula valida con digito 2 de inicio y 7 al final | `"29999999"` | `true` |
| TC-CS-03 | Exactamente 7 digitos (corta) | `"2024000"` | `false` |
| TC-CS-04 | Exactamente 9 digitos (larga) | `"202400001"` | `false` |
| TC-CS-05 | 8 digitos pero primer digito distinto de 2 | `"30240001"` | `false` |
| TC-CS-06 | 8 digitos pero primer digito 0 | `"00240001"` | `false` |
| TC-CS-07 | 8 digitos pero primer digito 9 | `"90240001"` | `false` |
| TC-CS-08 | Contiene letras intercaladas | `"2024A001"` | `false` |
| TC-CS-09 | Contiene espacios al inicio | `" 2024001"` | `false` |
| TC-CS-10 | Contiene espacios al final | `"20240001 "` | `false` |
| TC-CS-11 | Cadena vacia | `""` | `false` |
| TC-CS-12 | `null` | `null` | `false` |
| TC-CS-13 | `undefined` | `undefined` | `false` |
| TC-CS-14 | Número (no string) | `20240001` | `false` |
| TC-CS-15 | String con guion | `"2024-001"` | `false` |

**Estructura del test en Jest:**
```javascript
// tests/unit/checksum.test.js
const { isValidMatricula } = require('../../utils/checksum');

describe('isValidMatricula', () => {
  describe('casos validos', () => {
    test('TC-CS-01: matricula valida canonica', () => {
      expect(isValidMatricula('20240001')).toBe(true);
    });
    // ... resto de casos validos
  });

  describe('casos invalidos — longitud', () => {
    test('TC-CS-03: 7 digitos', () => {
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
    test('TC-CS-14: numero en lugar de string', () => {
      expect(isValidMatricula(20240001)).toBe(false);
    });
  });
});
```

**Criterio de aprobacion TC-CS:** Los 15 casos pasan. La cobertura de lineas, ramas y funciones del archivo `utils/checksum.js` reportada por Jest es 100%.

---

### 2.2 — Modulo dHash y hammingDistance

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

Importante: Los fixtures `similar_theme_1.jpg` y `similar_theme_2.jpg` son el caso mas critico del sistema (ADR-02 del SAD). Si el umbral de 10 bits falla aqui, generara falsos positivos en produccion. Si no tienes imagenes reales, puedes usar `sharp` para generar dos versiones visualmente distintas del mismo tipo de objeto.

| ID | Descripción | Input | Output esperado | Ref. SAD |
|---|---|---|---|---|
| TC-DH-01 | Misma imagen comparada consigo misma | `base.jpg` vs `base.jpg` | `distance === 0` | ADR-02 |
| TC-DH-02 | Imagen con leve variacion de brillo | `base.jpg` vs `base_bright.jpg` | `distance <= 10` | ADR-02 |
| TC-DH-03 | Imagen ligeramente recortada | `base.jpg` vs `base_crop.jpg` | `distance <= 10` | ADR-02 |
| TC-DH-04 | Imagen redimensionada y vuelta | `base.jpg` vs `base_resized.jpg` | `distance <= 10` | ADR-02 |
| TC-DH-05 | Imagenes completamente distintas | `base.jpg` vs `different.jpg` | `distance > 10` | ADR-02 |
| TC-DH-06 | Falso positivo: misma tematica distinta imagen | `similar_theme_1.jpg` vs `similar_theme_2.jpg` | `distance > 10` | ADR-02 (critico) |
| TC-DH-07 | hammingDistance con hashes identicos | `hash1 === hash2` | `0` | — |
| TC-DH-08 | hammingDistance, 1 bit de diferencia | hashes que difieran en 1 bit | `1` | — |
| TC-DH-09 | hammingDistance, todos los bits distintos | hash de `0x00...` vs `0xFF...` | `64` | — |
| TC-DH-10 | computeHash acepta Buffer | Buffer de imagen valida | string hexadecimal de 64 bits | — |
| TC-DH-11 | computeHash con buffer vacio | `Buffer.alloc(0)` | lanzar error o devolver null | — |

**Nota sobre TC-DH-06:** si este test falla (la distancia entre dos fotos distintas del mismo tema es <= 10), el umbral del sistema esta mal calibrado y es un defecto SEV-2. El ajuste se hace modificando `HASH_SIMILARITY_THRESHOLD` sin tocar codigo.

**Criterio de aprobacion TC-DH:** Los 11 casos pasan. Cobertura 100% en `utils/dhash.js`.

---

### 2.3 — Umbral de intencion

**Archivo a probar:** logica de timestamp en `services/interactionService.js` (funcion que calcula `is_accidental`)

**Referencia SRS:** RF-14, RN-08

La logica es: `(reverted_at - created_at) < INTENT_THRESHOLD_MS` → `is_accidental = true`

| ID | Descripcion | created_at | reverted_at | THRESHOLD | Output esperado |
|---|---|---|---|---|---|
| TC-IT-01 | Reversion a los 4,999 ms (dentro del umbral) | T | T + 4999ms | 5000 | `is_accidental: true` |
| TC-IT-02 | Reversion exactamente a los 5,000 ms (en el limite) | T | T + 5000ms | 5000 | `is_accidental: false` |
| TC-IT-03 | Reversion a los 5,001 ms (fuera del umbral) | T | T + 5001ms | 5000 | `is_accidental: false` |
| TC-IT-04 | Reversion a los 100 ms (tap accidental rapido) | T | T + 100ms | 5000 | `is_accidental: true` |
| TC-IT-05 | No hay reversión (`reverted_at` es null) | T | null | 5000 | `is_accidental: false` |
| TC-IT-06 | Reversion a los 10 segundos | T | T + 10000ms | 5000 | `is_accidental: false` |
| TC-IT-07 | Umbral parametrizado a 3000ms, reversión a 4000ms | T | T + 4000ms | 3000 | `is_accidental: false` |

Importante: los tests de esta funcion deben mockear el reloj del sistema con `jest.useFakeTimers()` para que sean deterministas. No confiar en Date.now real.

Criterio de aprobacion TC-IT: Los 7 casos pasan. Cobertura 100% en la funcion que determina `is_accidental`.

---

### 2.4 — Proteccion del numero WhatsApp

**Archivo a probar:** `services/whatsappLinkService.js` → funcion `generateWaLink(phoneNumber)`

**Referencia SRS:** RF-11, RN-09

| ID | Descripcion | Input | Output esperado |
|---|---|---|---|
| TC-WA-01 | Numero mexicano formato +52 | `"+5216691234567"` | `"https://wa.me/5216691234567"` |
| TC-WA-02 | El resultado NO contiene el numero en texto aislado | `"+5216691234567"` | `!result.includes('\\n')` y el numero solo aparece como parte de la URL |
| TC-WA-03 | Numero con formato distinto (sin +) | `"5216691234567"` | URL valida wa.me |
| TC-WA-04 | La funcion devuelve solo la URL, sin campos extra | `"+5216691234567"` | `typeof result === 'string'` |

Criterio de aprobacion TC-WA: Los 4 casos pasan. Cobertura 100%.

---

### 2.5 — Compresión y validacion de imagen

Contexto: estos tests son de integracion parcial. Prueban que el middleware del backend rechaza imagenes fuera de limite (segunda linea de defensa, RF-31).

Los tests unitarios de la compresion client-side no son posibles en Jest (browser-image-compression corre en el navegador). Para esa parte, la verificacion se hace en la Tarea 6 (ejecucion manual).

| ID | Descripcion | Condicion | Output esperado |
|---|---|---|---|
| TC-CM-01 | Imagen de 400 KB → aceptada | POST /announcements con imagen 400KB | HTTP 201 o 202 |
| TC-CM-02 | Imagen de 501 KB → rechazada | POST /announcements con imagen 501KB | 413 |
| TC-CM-03 | Imagen de 1 MB → rechazada | POST /announcements con imagen 1MB | 413 |
| TC-CM-04 | Imagen de 1200px exactos → aceptada | POST /announcements con imagen 1200px | 201 o 202 |
| TC-CM-05 | Imagen de 1201px → rechazada | POST /announcements con imagen 1201px | 413 |

Para generar imagenes de prueba de tamaño exacto, usar el script:
```javascript
// scripts/generate-test-images.js
const sharp = require('sharp');

// Genera imagen de 1200x1200px exactos (~400KB JPEG)
await sharp({ create: { width: 1200, height: 1200, channels: 3, background: '#FF0000' } })
  .jpeg({ quality: 80 })
  .toFile('tests/fixtures/images/exactly_1200px.jpg');

// Para imagenes de tamaño exacto en bytes, ajustar quality hasta alcanzar el umbral
```

Criterio de aprobacion TC-CM: Los 5 casos de integracion pasan.

---

### 2.6 — Persistencia de imagenes en Cloudinary

Este caso es una prueba de sistema, no una prueba unitaria. Se ejecuta en entorno de staging.

| ID | Descripcion | Pasos | Output esperado |
|---|---|---|---|
| TC-PS-01 | Imagen disponible tras reinicio del servidor | 1) Publicar anuncio con imagen. 2) Guardar la `cloudinary_url` devuelta. 3) Ejecutar redeploy en Railway staging. 4) Hacer GET a la `cloudinary_url` directamente. | HTTP 200 con la imagen original. La URL sigue siendo valida. |
| TC-PS-02 | Eliminacion correcta al borrar anuncio | 1) Publicar anuncio. 2) Guardar `cloudinary_id`. 3) Eliminar el anuncio (DELETE /announcements/:id). 4) Intentar acceder a la URL de Cloudinary. | HTTP 404 desde Cloudinary. El `cloudinary_id` no existe en la cuenta. |

Criterio de aprobacion TC-PS: Ambos casos ejecutados con evidencia (captura de pantalla o log del resultado HTTP).

---

### 2.7 — Shadowban automatico y restauracion
Estos tests requieren modificar temporalmente los umbrales en `.env.test` para no esperar 12 y 48 horas reales.

**Configuracion para tests de shadowban:**

```
# Solo en .env.test, valores acelerados para prueba
REPORT_ALERT_THRESHOLD=3
REPORT_SHADOWBAN_THRESHOLD=5
REPORT_SHADOWBAN_HOURS=0.033   # ~2 minutos
REPORT_SHADOWBAN_MAX_HOURS=0.083  # ~5 minutos
```

| ID | Descripcion | Pasos | Output esperado |
|---|---|---|---|
| TC-SB-01 | Shadowban NO se activa con 4 reportes unicos | Crear anuncio, generar 4 reportes de usuarios distintos, esperar 2 minutos | `status === 'active'` |
| TC-SB-02 | Alerta de urgencia al llegar a 3 reportes | Crear anuncio, generar 3 reportes | Registro en `moderation_queue` con `urgency_alert_at NOT NULL` |
| TC-SB-03 | Shadowban se activa con 5 reportes + 2 min (umbral acelerado) | Crear anuncio, 5 reportes de usuarios distintos, esperar que el cron dispare | `status === 'shadowban'`, notificacion interna al emprendedor creada` |
| TC-SB-04 | El anuncio en shadowban no aparece en el feed | Después de TC-SB-03 | `GET /announcements` no incluye el anuncio en shadowban |
| TC-SB-05 | El administrador ve el anuncio en shadowban en su panel | Después de TC-SB-03 | `GET /admin/moderation-queue` incluye el anuncio |
| TC-SB-06 | Restauracion automatica a los 5 min (umbral acelerado) | Después de TC-SB-03, sin accion del admin, esperar 5 min | `status === 'active'`, notificacion de restauracion al emprendedor |
| TC-SB-07 | Reportes del mismo usuario sobre el mismo anuncio no acumulan | Usuario X reporta el mismo anuncio dos veces | Solo 1 reporte contabilizado, HTTP 409 en el segundo intento |

Criterio de aprobacion TC-SB: Los 7 casos ejecutados y documentados.


### Criterio de aprobacion de la Tarea 2

- El archivo `/docs/casos_prueba_sprint12.md` existe con los 7 grupos de casos (TC-CS, TC-DH, TC-IT, TC-WA, TC-CM, TC-PS, TC-SB).
- Cada caso tiene: ID, descripcion, input exacto o precondicion, output esperado, referencia al SRS.
- Total de casos de prueba diseñados: no menos de 50.
- Los fixtures de imagenes estan en `tests/fixtures/images/` y son reproducibles.

---
## TAREA 3 — Ejecutar la suite completa de pruebas unitarias (Jest)
### Configuracion de Jest para este proyecto
...

(Este documento continúa con las secciones 3 a 7 tal como se describen en el plan original.)
