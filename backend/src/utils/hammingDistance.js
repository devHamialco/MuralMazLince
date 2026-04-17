/**
 * Convierte un caracter hexadecimal en una cadena binaria (4 bits).
 * @param {string} hexChar
 * @returns {string}
 */
function hexCharToBin(hexChar) {
  return parseInt(hexChar, 16).toString(2).padStart(4, '0');
}

/**
 * Calcula la distancia de Hamming entre dos hashes hexadecimales
 * asumiendo que ambos tienen la misma longitud (por lo regular 64 bits).
 * @param {string} hash1
 * @param {string} hash2
 * @returns {number}
 */
function hammingDistance(hash1, hash2) {
  if (typeof hash1 !== 'string' || typeof hash2 !== 'string') {
    throw new TypeError('Los hashes deben ser cadenas de texto');
  }

  if (hash1.length !== hash2.length) {
    throw new Error('Los hashes deben tener exactamente la misma longitud');
  }

  let distance = 0;
  for (let i = 0; i < hash1.length; i += 1) {
    const bin1 = hexCharToBin(hash1[i]);
    const bin2 = hexCharToBin(hash2[i]);
    for (let j = 0; j < 4; j += 1) {
      if (bin1[j] !== bin2[j]) distance += 1;
    }
  }

  return distance;
}

module.exports = {
  hammingDistance,
};
