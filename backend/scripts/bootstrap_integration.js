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
    database: 'postgres',
  };
  const client = new Client(config);
  try {
    await client.connect();
    try {
      await client.query('CREATE DATABASE mural_maz_lince_test');
    } catch (e) {
      // Ya existe la base de datos de pruebas
    }
  } catch (err) {
    console.error('Failed to connect to Postgres for test DB bootstrap:', err.message);
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignorar error al cerrar conexión
    }
  }
}

const runMigrations = () => {
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
  const backend = path.resolve(__dirname, '..');
  const jestCli = path.join(backend, 'node_modules', 'jest', 'bin', 'jest.js');
  console.log('Running integration tests...');
  const result = spawnSync(process.execPath, [jestCli, 'tests/integration', '--runInBand', '--verbose'], {
    cwd: backend,
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
