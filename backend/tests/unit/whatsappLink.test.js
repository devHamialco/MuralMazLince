const { generateWaLink } = require('../../src/services/whatsappLinkService');

describe('WhatsApp Link Service (COMP-09)', () => {
  it('Genera correctamente la URL de wa.me a partir de un número puro', () => {
    const result = generateWaLink('6691234567');
    expect(result).toBe('https://wa.me/6691234567');
  });

  it('Limpia adecuadamente cualquier carácter no numérico (+, espacios, guiones)', () => {
    const result = generateWaLink('+52 669-123-4567');
    expect(result).toBe('https://wa.me/526691234567');
  });

  it('Devuelve null al pasar parámetros vacíos', () => {
    expect(generateWaLink(null)).toBeNull();
    expect(generateWaLink(undefined)).toBeNull();
    expect(generateWaLink('')).toBeNull();
  });

  it('Devuelve null si el string procesado no contiene dígitos', () => {
    expect(generateWaLink('numero_sin_digitos')).toBeNull();
  });

  it('Garantiza que la respuesta nunca expone el número como un string en texto plano puro', () => {
    const originalNumber = '6691234567';
    const result = generateWaLink(originalNumber);
    // Verificamos que el retorno empiece forzosamente con el dominio como exige el requerimiento
    expect(result.startsWith('https://wa.me/')).toBe(true);
    expect(result).not.toBe(originalNumber);
  });
});