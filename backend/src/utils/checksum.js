/**
 * Validación de matrícula estudiantil.
 * @param {string} str
 * @returns {boolean}
 */
function isValidMatricula(str) {
  if (typeof str !== 'string') return false;
  return /^2\d{7}$/.test(str);
}

module.exports = {
  isValidMatricula,
};
