const bcrypt = require('bcrypt');
const { getAdminCredentials, provisionAdmin } = require('../../scripts/bootstrap_admin');

describe('getAdminCredentials', () => {
  test('requires an administrator matricula', () => {
    expect(() => getAdminCredentials({ ADMIN_DEFAULT_PASSWORD: 'secure-password' }))
      .toThrow('ADMIN_MATRICULA is required');
  });

  test('requires an administrator password', () => {
    expect(() => getAdminCredentials({ ADMIN_MATRICULA: '22050544' }))
      .toThrow('ADMIN_DEFAULT_PASSWORD is required');
  });

  test('rejects blank administrator credentials', () => {
    expect(() => getAdminCredentials({
      ADMIN_MATRICULA: '   ',
      ADMIN_DEFAULT_PASSWORD: '   ',
    })).toThrow('ADMIN_MATRICULA is required');
    expect(() => getAdminCredentials({
      ADMIN_MATRICULA: '22050544',
      ADMIN_DEFAULT_PASSWORD: '   ',
    })).toThrow('ADMIN_DEFAULT_PASSWORD is required');
  });
});

describe('provisionAdmin', () => {
  test('creates the admin with a bcrypt password hash', async () => {
    const pool = {
      query: jest.fn().mockResolvedValue({ rowCount: 1, rows: [{ id: 1 }] }),
    };

    const result = await provisionAdmin(pool, {
      matricula: '22050544',
      password: 'password',
    });

    expect(result).toBe('created');
    expect(pool.query.mock.calls[0][0]).toContain('ON CONFLICT (matricula) DO NOTHING');
    expect(pool.query.mock.calls[0][1][0]).toBe('22050544');
    expect(await bcrypt.compare('password', pool.query.mock.calls[0][1][1])).toBe(true);
  });

  test('does not reset an existing admin password', async () => {
    const pool = {
      query: jest.fn()
        .mockResolvedValueOnce({ rowCount: 0, rows: [] })
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ role: 'admin' }] }),
    };

    const result = await provisionAdmin(pool, {
      matricula: '22050544',
      password: 'password',
    });

    expect(result).toBe('already_exists');
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('refuses to take over a matricula with a different role', async () => {
    const pool = {
      query: jest.fn()
        .mockResolvedValueOnce({ rowCount: 0, rows: [] })
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ role: 'entrepreneur' }] }),
    };

    await expect(provisionAdmin(pool, {
      matricula: '22050544',
      password: 'password',
    })).rejects.toThrow('already belongs to another role');
  });
});
