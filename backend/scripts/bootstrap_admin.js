const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { isValidMatricula } = require('../src/utils/checksum');

function getAdminCredentials(environment = process.env) {
  const matricula = environment.ADMIN_MATRICULA;
  const password = environment.ADMIN_DEFAULT_PASSWORD;

  if (typeof matricula !== 'string' || !matricula.trim()) {
    throw new Error('ADMIN_MATRICULA is required');
  }
  if (typeof password !== 'string' || !password.trim()) {
    throw new Error('ADMIN_DEFAULT_PASSWORD is required');
  }

  return { matricula, password };
}

async function provisionAdmin(pool, { matricula, password }) {
  if (!isValidMatricula(matricula)) {
    throw new Error('Invalid administrator matricula');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Administrator password must contain at least 8 characters');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const inserted = await pool.query(
    `INSERT INTO users (matricula, role, password_hash)
     VALUES ($1, 'admin', $2)
     ON CONFLICT (matricula) DO NOTHING
     RETURNING id`,
    [matricula, passwordHash],
  );

  if (inserted.rowCount > 0) return 'created';

  const existing = await pool.query(
    'SELECT role FROM users WHERE matricula = $1',
    [matricula],
  );
  if (existing.rows[0]?.role === 'admin') return 'already_exists';

  throw new Error('Administrator matricula already belongs to another role');
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const { matricula, password } = getAdminCredentials();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await provisionAdmin(pool, { matricula, password });
    // eslint-disable-next-line no-console
    console.log(result === 'created'
      ? `Administrator ${matricula} created`
      : `Administrator ${matricula} already exists; credentials were not changed`);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { getAdminCredentials, provisionAdmin };
