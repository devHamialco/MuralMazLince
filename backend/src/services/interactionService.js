// Servicio de interacción: lógica de umbral de intención
// is_accidental(creado_at_ms, reverted_at_ms, INTENT_THRESHOLD_MS) => boolean

function is_accidental(created_at, reverted_at, INTENT_THRESHOLD_MS) {
  // Si no hay reversión, no es accidental
  if (created_at == null || reverted_at == null) return false;
  // Diferencia en milisegundos
  const diff = reverted_at - created_at;
  // Si la reversión ocurrió antes del umbral, es accidental
  return diff < INTENT_THRESHOLD_MS;
}

module.exports = {
  is_accidental,
};
