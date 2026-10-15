const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { runExpireAnnouncementsJob } = require('./jobs/expireAnnouncements');
const { runShadowbanJob, runShadowbanRestoreJob } = require('./jobs/shadowbanJob');

const app = express();

const pool = require('./db').getPool();

// Determinación de origen permitido para CORS según entorno
const allowedOrigin = (process.env.NODE_ENV === 'production')
  ? (process.env.APP_PRODUCTION_URL || process.env.CORS_ALLOWED_ORIGIN)
  : process.env.CORS_ALLOWED_ORIGIN;

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);
app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', async (_req, res) => {
  const healthcheck = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    dbConnected: false,
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    // Forzar un handshake real con la base de datos
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      healthcheck.dbConnected = true;
    } finally {
      client.release();
    }
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'error';
    healthcheck.error = error.message;
    // 503 Service Unavailable es más semántico para healthchecks fallidos
    res.status(503).json(healthcheck);
  }
});

app.get('/api-docs', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'docs', 'swagger.json'));
});

app.use(routes);

app.use(errorHandler);

async function start() {
  try {
    await pool.query('SELECT 1');
    // Log opcional en desarrollo
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log('Database connection established.');
    }

    if (process.env.NODE_ENV !== 'test') {
      cron.schedule('0 * * * *', async () => {
        try {
          await runExpireAnnouncementsJob();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Expire announcements job failed:', err.message);
        }
      });
      cron.schedule('0 * * * *', async () => {
        try {
          await runShadowbanJob();
          await runShadowbanRestoreJob();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Shadowban jobs failed:', err.message);
        }
      });

      const port = Number(process.env.PORT || 3000);
      app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`API listening on port ${port}.`);
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to database:', error.message);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
}

start();

module.exports = app;
