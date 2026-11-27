# Mural Maz Lince

Mural Maz Lince digitaliza el tablero de anuncios de la comunidad estudiantil de la Universidad Autónoma de Occidente, Unidad Regional Mazatlán. Permite consultar anuncios, gestionar proyectos de emprendimiento y moderar publicaciones desde una aplicación web.

## Componentes

| Ruta | Responsabilidad |
| --- | --- |
| `backend/` | API REST con Express 4, PostgreSQL (`pg`), autenticación por cookies JWT HttpOnly, moderación híbrida (Google Cloud Vision + `bad-words` + dHash con `sharp`), Cloudinary y tareas programadas (`node-cron`). |
| `frontend/` | SPA/PWA en React 18 + Vite 7 + Bootstrap 5 + `react-easy-crop` + `browser-image-compression`, tema oscuro OLED (`#000000` / `#D92528`), perfiles públicos de emprendedor/proyecto y panel multicontacto. |
| `docs/` | Especificaciones del proyecto (`SRS`, `SAD`, `DDC`, `PMP`, `STP`) y contrato OpenAPI (`swagger.json`). |
| `backend/tests/` | Pruebas unitarias (`unit/`), pruebas de integración (`integration/`), guard de base de datos (`helpers/testDatabase.js`) y auditoría de seguridad (`security/`). |
| `tests/fixtures/` | Recursos compartidos para pruebas. |

## Requisitos

- Docker con Docker Compose para levantar PostgreSQL y la API.
- Node.js `20.19+` o `22.12+` para desarrollo del frontend (Vite 7). El backend requiere Node.js 18 o superior.
- npm.

## Inicio rápido

1. Crea la configuración local a partir de la plantilla:

   ```powershell
   if (-not (Test-Path .env)) { Copy-Item .env.example .env }
   ```

2. Completa en `.env` los secretos y servicios que vayas a utilizar. Los valores de ejemplo no son credenciales válidas. Mantén este archivo fuera de Git.

3. Inicia PostgreSQL y la API:

   ```powershell
   docker compose up --build -d
   ```

4. Inicializa el esquema y los datos de desarrollo:

   ```powershell
   docker compose exec -e NODE_ENV=development api npm run migrate
   ```

   **Este comando elimina y vuelve a crear el esquema completo (`schema.sql` + `seed.sql`). Úsalo solo con una base local descartable; nunca lo ejecutes en producción.** Para agregar columnas/tablas nuevas sobre una base existente sin reiniciarla, aplica manualmente [`backend/src/db/migrate_incremental.sql`](backend/src/db/migrate_incremental.sql).

5. En otra terminal, inicia el frontend:

   ```powershell
   Set-Location frontend
   'VITE_API_URL=http://localhost:3000' | Set-Content .env.local
   npm ci
   npm run dev
   ```

   Abre `http://localhost:5173`. La API queda disponible en `http://localhost:3000` y su especificación OpenAPI en `http://localhost:3000/api-docs`.

> **Nota sobre moderación automática:** En entornos distintos de `test`, el pipeline de moderación automática al publicar anuncios (`POST /announcements`) solo se ejecuta si `ENABLE_AUTO_MODERATION=true` está definido en `.env`. Por defecto permanece desactivado en desarrollo local para no consumir cuota de Google Cloud Vision.

## Pruebas y validaciones

Instala las dependencias del backend y ejecuta las pruebas unitarias desde `backend/`:

```powershell
Set-Location backend
npm ci
npm test
npm run lint
```

Las pruebas de integración requieren PostgreSQL accesible en el puerto `5433`. Puedes iniciar el servicio de base de datos con `docker compose up -d db` y luego ejecutar:

```powershell
npm run test:integration
```

Para validar el frontend:

```powershell
Set-Location frontend
npm ci
npm run lint
npm run build
```

## Alta de administrador

El bootstrap requiere `DATABASE_URL`, `ADMIN_MATRICULA` y `ADMIN_DEFAULT_PASSWORD`; no hay credenciales administrativas predeterminadas. Completa las dos variables de administrador en `.env`, recrea el contenedor para cargar esos valores y ejecuta el comando:

```powershell
docker compose up -d --force-recreate api
docker compose exec api npm run admin:bootstrap
```

La contraseña debe tener al menos ocho caracteres. El bootstrap no cambia la contraseña de un administrador que ya exista.

## Configuración y seguridad

- Versiona únicamente `.env.example`, con valores ficticios. Los archivos `.env` y sus variantes quedan excluidos por `.gitignore`.
- Nunca agregues claves privadas, archivos de cuenta de servicio, tokens ni credenciales de producción al repositorio.
- Las variables `VITE_*` se incorporan al bundle del navegador: úsalas solo para configuración pública, nunca para secretos.
- Las credenciales incluidas en Docker Compose son exclusivamente para desarrollo local; cámbialas antes de cualquier despliegue.
- Configura credenciales de Google Cloud y Cloudinary fuera del repositorio. Para Google Cloud, puedes usar Application Default Credentials o colocar la cuenta de servicio local en `backend/google-credentials.json`; ese archivo está ignorado por Git.

## Documentación

- Contrato OpenAPI: [`docs/swagger.json`](docs/swagger.json)
- Requisitos (SRS): [`docs/SRS.md`](docs/SRS.md)
- Arquitectura (SAD): [`docs/SAD.md`](docs/SAD.md)
- Diseño detallado (DDC): [`docs/DDC.md`](docs/DDC.md)
- Plan de gestión (PMP): [`docs/PMP.md`](docs/PMP.md)
- Plan de pruebas (STP): [`docs/STP.md`](docs/STP.md)
