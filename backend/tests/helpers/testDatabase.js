'use strict';

const { execSync } = require('child_process');
const path = require('path');

const TEST_DATABASE_URL = 'postgres://postgres:password@localhost:5433/mural_maz_lince_test';
const TEST_DB_NAME = 'mural_maz_lince_test';

/** True si la URL apunta a la BD de prueba (nombre de DB como segmento completo). */
function isTestDatabaseUrl(url) {
  return new RegExp(`${TEST_DB_NAME}(?![A-Za-z0-9_])`).test(String(url));
}

/**
 * Falla con throw si `url` (o process.env.DATABASE_URL) no apunta a
 * mural_maz_lince_test; luego fija process.env.DATABASE_URL a la URL de test.
 */
function assertTestDatabase(url) {
  const current = url === undefined ? process.env.DATABASE_URL : url;
  if (current && String(current).trim() !== '' && !isTestDatabaseUrl(current)) {
    throw new Error(
      'Refusing to run tests against a non-test database. '
      + `Rejected DATABASE_URL: ${current}. `
      + `Integration tests must target ${TEST_DB_NAME}. `
      + 'Unset DATABASE_URL or point it at the test database.',
    );
  }
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  return TEST_DATABASE_URL;
}

/** Recrea schema + seed en mural_maz_lince_test (DROP SCHEMA CASCADE incluido). */
function runTestMigrations() {
  execSync('npm run migrate:test', {
    cwd: path.resolve(__dirname, '..', '..'),
    stdio: 'inherit',
    shell: true,
  });
}

// El guard se ejecuta al importar: toda suite que requiera este módulo
// queda protegida antes de cargar app/db.
assertTestDatabase();

module.exports = {
  TEST_DATABASE_URL,
  TEST_DB_NAME,
  isTestDatabaseUrl,
  assertTestDatabase,
  runTestMigrations,
};
