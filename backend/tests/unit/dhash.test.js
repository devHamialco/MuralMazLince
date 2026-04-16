const sharp = require('sharp');
const { computeHash } = require('../../src/utils/dhash');
const { hammingDistance } = require('../../src/utils/hammingDistance');

describe('dHash and Hamming Distance Module', () => {
  let image1, imageSimilar, imageDifferent, imageResized, product1, product2;

  beforeAll(async () => {
    // Misma imagen: un gradiente para evitar áreas perfectamente planas
    image1 = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } },
    }).composite([{
      input: Buffer.from('<svg><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="blue"/><stop offset="100%" stop-color="red"/></linearGradient></defs><rect width="100" height="100" fill="url(#g1)"/></svg>'),
      top: 0, left: 0,
    }]).png().toBuffer();

    // Leve variación de brillo
    imageSimilar = await sharp(image1).modulate({ brightness: 1.1 }).png().toBuffer();

    // Imagen completamente diferente
    imageDifferent = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 0, g: 255, b: 0 } },
    }).composite([{
      input: Buffer.from('<svg><defs><radialGradient id="g2"><stop offset="0%" stop-color="green"/><stop offset="100%" stop-color="yellow"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g2)"/></svg>'),
      top: 0, left: 0,
    }]).png().toBuffer();

    // Redimensionada 
    imageResized = await sharp(image1).resize(90, 80).png().toBuffer();

    // Dos fotos distintas de "mismo tipo de producto" (casos donde Hamming no debe marcar duplicado)
    product1 = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 100, g: 100, b: 100 } },
    }).composite([{
      input: Buffer.from('<svg><circle cx="50" cy="50" r="20" fill="white"/></svg>'),
      top: 0, left: 0,
    }]).png().toBuffer();

    product2 = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 100, g: 100, b: 100 } },
    }).composite([{
      input: Buffer.from('<svg><circle cx="50" cy="50" r="40" fill="white"/></svg>'),
      top: 0, left: 0,
    }]).png().toBuffer();
  });

  describe('Hamming distance tests based on dHash', () => {
    it('Misma imagen dos veces -> distancia 0', async () => {
      const hash1 = await computeHash(image1);
      const hash2 = await computeHash(image1);
      expect(hammingDistance(hash1, hash2)).toBe(0);
    });

    it('Imagen con leve variación de brillo -> distancia <= 10', async () => {
      const hash1 = await computeHash(image1);
      const hash2 = await computeHash(imageSimilar);
      const dist = hammingDistance(hash1, hash2);
      expect(dist).toBeLessThanOrEqual(10);
    });

    it('Imagen completamente diferente -> distancia > 10', async () => {
      const hash1 = await computeHash(image1);
      const hash2 = await computeHash(imageDifferent);
      const dist = hammingDistance(hash1, hash2);
      expect(dist).toBeGreaterThan(10);
    });

    it('Imagen redimensionada levemente -> distancia <= 10', async () => {
      const hash1 = await computeHash(image1);
      const hash2 = await computeHash(imageResized);
      const dist = hammingDistance(hash1, hash2);
      expect(dist).toBeLessThanOrEqual(10);
    });

    it('Dos fotos distintas del mismo tipo de producto -> distancia > 10', async () => {
      const hash1 = await computeHash(product1);
      const hash2 = await computeHash(product2);
      const dist = hammingDistance(hash1, hash2);
      expect(dist).toBeGreaterThan(10);
    });
  });

  describe('Hamming distance border cases', () => {
    it('Lanza error si uno de los argumentos no es string', () => {
      expect(() => hammingDistance('0000000000000000', 1234)).toThrow(TypeError);
    });
    
    it('Lanza error si las longitudes son distintas', () => {
      expect(() => hammingDistance('aa', 'aaa')).toThrow(Error);
    });
  });
});