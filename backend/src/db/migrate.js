const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Guard: prevent destructive migration from running on production
if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.error(
    'FATAL: migrate.js no debe ejecutarse en producción.\n'
    + 'Este script hace DROP SCHEMA CASCADE y destruiría todos los datos.\n'
    + 'Usa migraciones incrementales para cambios en producción.',
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // eslint-disable-next-line no-console
    console.log('Running schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);

    // eslint-disable-next-line no-console
    console.log('Running seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await client.query(seedSql);

    await client.query('COMMIT');
    // eslint-disable-next-line no-console
    console.log('Migration completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    // eslint-disable-next-line no-console
    console.error('Migration failed, changes rolled back.', error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

runMigrations();
