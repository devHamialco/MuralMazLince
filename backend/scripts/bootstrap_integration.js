/*
  Bootstrap script for running integration tests against a test Postgres DB.
  Steps:
  1) Ensure the test DB exists (mural_maz_lince_test) on the local PostgreSQL server.
  2) Run migrations against the test DB.
  3) Run integration tests and write results to results/integration_sprint12.txt.
*/
const { Client } = require('pg');
const path = require('path');
const { spawnSync } = require('child_process');
const fs = require('fs');

async function ensureTestDb() {
  const config = {
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'password',
    database: 'postgres', // default maintenance DB
  };
  const client = new Client(config);
  try {
    await client.connect();
    // Create test DB if it doesn't exist
    try {
      await client.query('CREATE DATABASE mural_maz_lince_test');
    } catch (e) {
      // If exists, ignore
    }
  } catch (err) {
    console.error('Failed to connect to Postgres for test DB bootstrap:', err.message);
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch (e) { /* ignore */ }
  }
}

const runMigrations = () => {
  // Run migrations against mural_maz_lince_test
  console.log('Running migrations for test DB...');
  const res = spawnSync('npm', ['run', 'migrate:test'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, DATABASE_URL: 'postgres://postgres:password@localhost:5433/mural_maz_lince_test' },
  });
  if (res.status !== 0) {
    console.error('Migrations failed. Aborting integration tests.');
    process.exit(res.status || 1);
  }
};

const runIntegrationTests = () => {
  const root = path.resolve(__dirname, '../..');
  console.log('Running integration tests...');
  const result = spawnSync('npx', ['jest', 'tests/integration', '--runInBand', '--verbose'], {
    cwd: root,
    encoding: 'utf8',
  });

  const outDir = path.resolve(root, 'results');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outFile = path.resolve(outDir, 'integration_sprint12.txt');
  const content = (result.stdout || '') + (result.stderr || '');
  fs.writeFileSync(outFile, content);
  console.log(`Integration results written to ${outFile}`);
  if (result.status !== 0) {
    console.error('Integration tests finished with failures.');
    process.exit(result.status);
  }
};

(async () => {
  try {
    await ensureTestDb();
    runMigrations();
    runIntegrationTests();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
