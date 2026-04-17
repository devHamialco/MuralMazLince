const db = require('../db');

/** Umbral de intención en milisegundos (RF-14, RN-08). */
const INTENTION_THRESHOLD_MS = Number(process.env.INTENTION_THRESHOLD_MS) || 5000;

/**
 * POST /announcements/:id/like — Toggle like (RF-12, RF-14).
 * Si no existe: crear. Si activo: revertir (evaluar accidental). Si revertido: reactivar.
 */
const toggleLike = async (req, res) => {
  const announcementId = req.params.id;
  const userId = req.user.id;

  try {
    // Verificar que el anuncio existe y está activo
    const annCheck = await db.query(
      "SELECT id FROM announcements WHERE id = $1 AND status = 'active'",
      [announcementId],
    );
    if (annCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado o no activo' });
    }

    // Buscar like existente
    const existing = await db.query(
      'SELECT id, created_at, reverted_at FROM likes WHERE user_id = $1 AND announcement_id = $2',
      [userId, announcementId],
    );

    if (existing.rows.length === 0) {
      // No existe: crear like nuevo
      await db.query(
        'INSERT INTO likes (user_id, announcement_id) VALUES ($1, $2)',
        [userId, announcementId],
      );
      return res.json({ message: 'Like registrado', liked: true });
    }

    const like = existing.rows[0];

    if (like.reverted_at === null) {
      // Like activo: revertir y evaluar accidental
      const diffResult = await db.query(
        'SELECT EXTRACT(EPOCH FROM (NOW() - $1::timestamp)) * 1000 AS diff_ms',
        [like.created_at],
      );
      const diffMs = Number(diffResult.rows[0]?.diff_ms || 0);
      const isAccidental = diffMs < INTENTION_THRESHOLD_MS;

      await db.query(
        'UPDATE likes SET reverted_at = NOW(), is_accidental = $1 WHERE id = $2',
        [isAccidental, like.id],
      );
      return res.json({ message: 'Like retirado', liked: false, is_accidental: isAccidental });
    }

    // Like previamente revertido: reactivar
    await db.query(
      'UPDATE likes SET reverted_at = NULL, is_accidental = false, created_at = NOW() WHERE id = $1',
      [like.id],
    );
    return res.json({ message: 'Like reactivado', liked: true });
  } catch (err) {
    return res.status(500).json({ error: 'Error al procesar like' });
  }
};

/**
 * POST /announcements/:id/rating — Crear o actualizar valoración 1-3★ (RF-13, RF-14).
 */
const upsertRating = async (req, res) => {
  const announcementId = req.params.id;
  const userId = req.user.id;
  const { stars } = req.body;

  if (!stars || stars < 1 || stars > 3) {
    return res.status(400).json({ error: 'La valoración debe ser entre 1 y 3 estrellas' });
  }

  try {
    const annCheck = await db.query(
      "SELECT id FROM announcements WHERE id = $1 AND status = 'active'",
      [announcementId],
    );
    if (annCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado o no activo' });
    }

    const existing = await db.query(
      'SELECT id, stars, created_at, reverted_at FROM ratings WHERE user_id = $1 AND announcement_id = $2',
      [userId, announcementId],
    );

    if (existing.rows.length === 0) {
      // Crear nueva valoración
      await db.query(
        'INSERT INTO ratings (user_id, announcement_id, stars) VALUES ($1, $2, $3)',
        [userId, announcementId, stars],
      );
      return res.status(201).json({ message: 'Valoración registrada', stars });
    }

    const rating = existing.rows[0];

    if (rating.reverted_at !== null) {
      // Previamente revertida: reactivar con nuevo valor
      await db.query(
        'UPDATE ratings SET stars = $1, reverted_at = NULL, is_accidental = false, created_at = NOW(), modified_at = NULL WHERE id = $2',
        [stars, rating.id],
      );
      return res.json({ message: 'Valoración reactivada', stars });
    }

    if (Number(rating.stars) === Number(stars)) {
      const diffResult = await db.query(
        'SELECT EXTRACT(EPOCH FROM (NOW() - $1::timestamp)) * 1000 AS diff_ms',
        [rating.created_at],
      );
      const diffMs = Number(diffResult.rows[0]?.diff_ms || 0);
      const isAccidental = diffMs < INTENTION_THRESHOLD_MS;

      await db.query(
        'UPDATE ratings SET reverted_at = NOW(), is_accidental = $1, modified_at = NOW() WHERE id = $2',
        [isAccidental, rating.id],
      );
      return res.json({ message: 'Valoración retirada', removed: true, is_accidental: isAccidental });
    }

    // Existe y está activa: actualizar con nuevo valor
    await db.query(
      'UPDATE ratings SET stars = $1, modified_at = NOW() WHERE id = $2',
      [stars, rating.id],
    );
    return res.json({ message: 'Valoración actualizada', stars });
  } catch (err) {
    return res.status(500).json({ error: 'Error al procesar valoración' });
  }
};

/**
 * DELETE /announcements/:id/rating — Retirar valoración activa (RF-13, RF-14).
 */
const deleteRating = async (req, res) => {
  const announcementId = req.params.id;
  const userId = req.user.id;

  try {
    const existing = await db.query(
      'SELECT id, created_at, reverted_at FROM ratings WHERE user_id = $1 AND announcement_id = $2',
      [userId, announcementId],
    );

    if (existing.rows.length === 0 || existing.rows[0].reverted_at !== null) {
      return res.status(404).json({ error: 'No tienes una valoración activa en este anuncio' });
    }

    const rating = existing.rows[0];
    const diffResult = await db.query(
      'SELECT EXTRACT(EPOCH FROM (NOW() - $1::timestamp)) * 1000 AS diff_ms',
      [rating.created_at],
    );
    const diffMs = Number(diffResult.rows[0]?.diff_ms || 0);
    const isAccidental = diffMs < INTENTION_THRESHOLD_MS;

    await db.query(
      'UPDATE ratings SET reverted_at = NOW(), is_accidental = $1 WHERE id = $2',
      [isAccidental, rating.id],
    );

    return res.json({ message: 'Valoración retirada', is_accidental: isAccidental });
  } catch (err) {
    return res.status(500).json({ error: 'Error al retirar valoración' });
  }
};

module.exports = {
  toggleLike,
  upsertRating,
  deleteRating,
};
