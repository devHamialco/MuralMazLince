const sharp = require('sharp');

/**
 * Calcula el dHash perceptual de una imagen.
 * @param {Buffer} imageBuffer - El buffer de la imagen de entrada.
 * @returns {Promise<string>} Hash hexadecimal de 64 bits (16 caracteres).
 */
async function computeHash(imageBuffer) {
  const info = await sharp(imageBuffer)
    .grayscale()
    .resize(9, 8, { fit: 'fill' })
    .raw()
    .toBuffer();

  let binaryString = '';

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const leftPixel = info[y * 9 + x];
      const rightPixel = info[y * 9 + x + 1];
      binaryString += leftPixel > rightPixel ? '1' : '0';
    }
  }

  let hexString = '';
  for (let i = 0; i < binaryString.length; i += 4) {
    const nibble = binaryString.slice(i, i + 4);
    hexString += parseInt(nibble, 2).toString(16);
  }

  return hexString;
}

module.exports = {
  computeHash,
};
