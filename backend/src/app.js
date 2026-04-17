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

const app = express();

const pool = require('./db').getPool();

app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,
    credentials: true,
  }),
);
app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', dbConnected: true });
  } catch (error) {
    res.status(500).json({ status: 'error', dbConnected: false, error: error.message });
  }
});

app.use(routes);

app.use(errorHandler);

async function start() {
  try {
    await pool.query('SELECT 1');
    // eslint-disable-next-line no-console
    console.log('Database connection established.');

    if (process.env.NODE_ENV !== 'test') {
      cron.schedule('0 * * * *', async () => {
        try {
          await runExpireAnnouncementsJob();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Expire announcements job failed:', err.message);
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
