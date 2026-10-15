const { isValidMatricula } = require('../../src/utils/checksum');

describe('Checksum Module: isValidMatricula', () => {
  it('Debe retornar true para una matrícula válida con 8 dígitos iniciando en 2', () => {
    expect(isValidMatricula('20240001')).toBe(true);
  });

  it('Debe retornar false para una matrícula de 7 dígitos', () => {
    expect(isValidMatricula('2024000')).toBe(false);
  });

  it('Debe retornar false para una matrícula de 9 dígitos', () => {
    expect(isValidMatricula('202400010')).toBe(false);
  });

  it('Debe retornar false para una matrícula de 8 dígitos cuyo primer dígito no sea 2', () => {
    expect(isValidMatricula('30240001')).toBe(false);
  });

  it('Debe retornar false si la matrícula contiene letras', () => {
    expect(isValidMatricula('2024A001')).toBe(false);
  });

  it('Debe retornar false si la matrícula contiene espacios', () => {
    expect(isValidMatricula('2024 001')).toBe(false);
    expect(isValidMatricula(' 20240001')).toBe(false);
  });

  it('Debe retornar false para una cadena vacía', () => {
    expect(isValidMatricula('')).toBe(false);
  });

  it('Debe retornar false para valores null o undefined', () => {
    expect(isValidMatricula(null)).toBe(false);
    expect(isValidMatricula(undefined)).toBe(false);
  });
});