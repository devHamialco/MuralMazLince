# ◉ Mural Maz Lince

Aplicación web **mobile-first** que digitaliza el tablero de anuncios estudiantil físico de la Universidad Autónoma de Occidente, Unidad Regional Mazatlán. Permite a estudiantes emprendedores publicar y gestionar sus proyectos comerciales, a organizaciones estudiantiles difundir comunicados, y a cualquier visitante descubrir el ecosistema emprendedor universitario sin necesidad de cuenta.

> **Estado del proyecto:** En desarrollo — Sprint 12 / 15  
> **Versión:** 1.0.0-dev  
> **Repositorio:** https://github.com/devHamialco/MuralMazLince  
> **Producción:** Railway.app _(disponible al cierre del Sprint 14)_

---

## Stack tecnológico

| Capa                       | Tecnología                          |
| -------------------------- | ----------------------------------- |
| Frontend                   | React 18 + Bootstrap 5 (PWA)        |
| Backend                    | Node.js LTS + Express.js            |
| Base de datos              | PostgreSQL 15 (Railway.app)         |
| Almacenamiento de imágenes | Cloudinary                          |
| Moderación IA              | Google Cloud Vision API + bad-words |
| Autenticación              | JWT en cookies HttpOnly             |
| Contenedores               | Docker + docker-compose             |
| CI/CD                      | GitHub Actions → Railway.app        |
| Pruebas                    | Jest + Supertest                    |
| Linting                    | ESLint (Airbnb config)              |

---

## Estructura del proyecto

```
MML/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── feedController.js
│   │   │   ├── announcementController.js
│   │   │   ├── interactionController.js
│   │   │   ├── reportController.js
│   │   │   ├── adminController.js
│   │   │   └── notificationController.js
│   │   ├── services/
│   │   │   ├── moderationService.js
│   │   │   ├── storageService.js
│   │   │   ├── whatsappLinkService.js
│   │   │   ├── notificationService.js
│   │   │   └── metricsService.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── rateLimiter.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── announcements.js
│   │   │   ├── projects.js
│   │   │   ├── interactions.js
│   │   │   ├── notifications.js
│   │   │   └── admin.js
│   │   ├── utils/
│   │   │   ├── checksum.js
│   │   │   ├── dhash.js
│   │   │   └── hammingDistance.js
│   │   ├── jobs/
│   │   │   ├── expireAnnouncements.js
│   │   │   └── shadowbanJob.js
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── seed.sql
│   │   └── app.js
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── checksum.test.js
│   │   │   ├── dhash.test.js
│   │   │   └── whatsappLink.test.js
│   │   └── integration/
│   │       ├── auth.test.js
│   │       └── feed.test.js
│   ├── Dockerfile
│   ├── .eslintrc.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnnouncementCard.jsx
│   │   │   ├── CategoryBadge.jsx
│   │   │   ├── StarRating.jsx
│   │   │   ├── LikeButton.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── NotificationDot.jsx
│   │   │   ├── ImageUploader.jsx
│   │   │   ├── ReportModal.jsx
│   │   │   └── ToastNotification.jsx
│   │   ├── pages/
│   │   │   ├── Feed.jsx
│   │   │   ├── AnnouncementDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── EntrepreneurDashboard.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── tokens.css
│   │   ├── sw.js
│   │   └── main.jsx
│   └── package.json
│
├── docs/
│   ├── SRS.md
│   ├── SAD.md
│   ├── DDC.md
│   └── PMP.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Requisitos previos

- [Node.js LTS](https://nodejs.org/) (v20 o superior)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

---

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/devHamialco/MuralMazLince.git
cd MuralMazLince
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Abre `.env` y completa los valores. Consulta la tabla de variables de entorno más abajo.

### 3. Levantar el entorno con Docker

```bash
docker-compose up
```

Esto levanta dos servicios:

- `api` — Backend Express en `http://localhost:3000`
- `db` — PostgreSQL en el puerto `5432`

### 4. Verificar que el servidor responde

```bash
curl http://localhost:3000/health
# → { "status": "ok", "dbConnected": true }
```

### 5. Levantar el frontend (desarrollo)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Variables de entorno

El archivo `.env.example` contiene todas las variables requeridas. **Nunca subas el archivo `.env` al repositorio.**

| Variable                               | Descripción                                              | Default                 |
| -------------------------------------- | -------------------------------------------------------- | ----------------------- |
| `DATABASE_URL`                         | URL de conexión PostgreSQL                               | —                       |
| `JWT_SECRET`                           | Clave secreta para firma de tokens JWT                   | —                       |
| `JWT_EXPIRATION_HOURS`                 | Duración de la sesión en horas                           | '8'                     |
| `CLOUDINARY_CLOUD_NAME`                | Nombre del cloud de Cloudinary                           | —                       |
| `CLOUDINARY_API_KEY`                   | API key de Cloudinary                                    | —                       |
| `CLOUDINARY_API_SECRET`                | API secret de Cloudinary                                 | —                       |
| `GOOGLE_CLOUD_VISION_KEY`              | Clave de API de Google Cloud Vision                      | —                       |
| `HASH_SIMILARITY_THRESHOLD`            | Umbral de distancia Hamming para detección de duplicados | `10`                    |
| `INTENT_THRESHOLD_MS`                  | Ventana de umbral de intención en milisegundos           | `5000`                  |
| `REPORT_ALERT_THRESHOLD`               | Reportes para generar alerta urgente al admin            | `3`                     |
| `REPORT_SHADOWBAN_THRESHOLD`           | Reportes para activar shadowban automático               | `5`                     |
| `REPORT_SHADOWBAN_HOURS`               | Horas de inacción del admin antes del shadowban          | `12`                    |
| `REPORT_SHADOWBAN_MAX_HOURS`           | Duración máxima del shadowban antes de restauración      | `48`                    |
| `MAX_ACTIVE_PROJECTS_PER_USER`         | Límite de proyectos activos por emprendedor              | `5`                     |
| `MAX_ACTIVE_ANNOUNCEMENTS_PER_PROJECT` | Límite de anuncios activos por proyecto                  | `3`                     |
| `VISION_API_MONTHLY_LIMIT`             | Límite mensual de unidades de Vision API                 | `1000`                  |
| `VISION_API_ALERT_PERCENTAGE`          | Porcentaje de cuota que activa la alerta de consumo      | `80`                    |
| `CORS_ALLOWED_ORIGIN`                  | Origen permitido por CORS (frontend)                     | `http://localhost:5173` |
| `APP_PRODUCTION_URL`                   | URL raíz de la app (usada para generar el QR)            | `http://localhost:3000` |
| `NODE_ENV`                             | Entorno de ejecución                                     | `development`           |
| `PORT`                                 | Puerto del servidor Express                              | `3000`                  |

---

## Comandos útiles

```bash
# Ejecutar linter
cd backend && npm run lint

# Ejecutar pruebas unitarias e integración
cd backend && npm test

# Ver cobertura de pruebas
cd backend && npm run test:coverage
```

---

## Documentación

La documentación completa del ciclo de vida del software se encuentra en `/docs`:

| Documento | Versión | Descripción                         |
| --------- | ------- | ----------------------------------- |
| `PMP.md`  | 1.4     | Project Management Plan             |
| `SRS.md`  | 1.4     | Software Requirements Specification |
| `SAD.md`  | 1.3     | Software Architecture Document      |
| `DDC.md`  | 1.2     | Detailed Design Document            |

---

## Licencia

Proyecto académico individual — Universidad Autónoma de Occidente, Mazatlán 2026.  
Desarrollado por **Miriam Alanis**.
