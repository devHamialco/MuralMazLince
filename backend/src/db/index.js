const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || String(databaseUrl).trim() === '') {
  // eslint-disable-next-line no-console
  console.error(
    'FATAL: DATABASE_URL no está definida. Configure las variables de entorno.',
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getPool: () => pool,
};
