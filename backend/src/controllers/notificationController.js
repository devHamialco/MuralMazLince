const db = require('../db');

const listNotifications = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, type, message, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id],
    );
    return res.json({ notifications: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    return res.json({ message: 'Notificación marcada como leída' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al marcar notificación' });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [req.user.id],
    );
    return res.json({ message: 'Todas las notificaciones fueron marcadas como leídas' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar notificaciones' });
  }
};

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
