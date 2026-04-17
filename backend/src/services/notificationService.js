const db = require('../db');

/**
 * Crea una notificación interna para un usuario (RF-25).
 * @param {number} userId - ID del usuario destinatario
 * @param {string} type - Tipo ENUM: 'approved','rejected','pending','expiring_soon','shadowban'
 * @param {string} message - Texto descriptivo de la notificación
 */
async function createNotification(userId, type, message) {
  await db.query(
    'INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)',
    [userId, type, message],
  );
}

module.exports = { createNotification };
