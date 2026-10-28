'use strict';

const {
  TEST_DATABASE_URL,
  isTestDatabaseUrl,
  assertTestDatabase,
} = require('../helpers/testDatabase');

describe('testDatabase guard — nunca permite una BD que no sea mural_maz_lince_test', () => {
  const DEV_URL = 'postgres://postgres:password@localhost:5433/mural_maz_lince_dev';

  it('rechaza con throw si DATABASE_URL apunta a la BD de desarrollo', () => {
    expect(() => assertTestDatabase(DEV_URL)).toThrow(/non-test database/);
  });

  it('el error muestra la URL rechazada', () => {
    expect(() => assertTestDatabase(DEV_URL)).toThrow(DEV_URL);
  });

  it('rechaza nombres que solo empiezan como el test DB (mural_maz_lince_test_backup)', () => {
    expect(() => assertTestDatabase(
      'postgres://postgres:password@localhost:5433/mural_maz_lince_test_backup',
    )).toThrow(/non-test database/);
  });

  it('acepta la URL exacta del test DB, la fija en process.env y la devuelve', () => {
    expect(assertTestDatabase(TEST_DATABASE_URL)).toBe(TEST_DATABASE_URL);
    expect(process.env.DATABASE_URL).toBe(TEST_DATABASE_URL);
  });

  it('acepta otra URL que apunte a mural_maz_lince_test y normaliza a la canónica', () => {
    const other = 'postgresql://otheruser:secret@db:5432/mural_maz_lince_test?sslmode=disable';
    expect(assertTestDatabase(other)).toBe(TEST_DATABASE_URL);
    expect(process.env.DATABASE_URL).toBe(TEST_DATABASE_URL);
  });

  it('con DATABASE_URL sin definir (undefined) fija la URL de test sin lanzar', () => {
    expect(assertTestDatabase(undefined)).toBe(TEST_DATABASE_URL);
    expect(process.env.DATABASE_URL).toBe(TEST_DATABASE_URL);
  });

  it('isTestDatabaseUrl distingue URLs de test y no-test', () => {
    expect(isTestDatabaseUrl(TEST_DATABASE_URL)).toBe(true);
    expect(isTestDatabaseUrl(DEV_URL)).toBe(false);
    expect(isTestDatabaseUrl('')).toBe(false);
  });
});
