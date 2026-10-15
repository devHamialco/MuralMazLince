// Servicio de interacción: lógica de umbral de intención
// isAccidental(createdAtMs, revertedAtMs, INTENT_THRESHOLD_MS) => boolean
function isAccidental(createdAt, revertedAt, INTENT_THRESHOLD_MS) {
  // Si no hay reversión, no es accidental
  if (createdAt == null || revertedAt == null) return false;
  // Diferencia en milisegundos
  const diff = revertedAt - createdAt;
  // Si la reversión ocurrió antes del umbral, es accidental
  return diff < INTENT_THRESHOLD_MS;
}

module.exports = {
  isAccidental,
};
