const db = require('../db');
const { createNotification } = require('../services/notificationService');

async function runExpireAnnouncementsJob() {
  const expiring = await db.query(
    `SELECT a.id, p.user_id
     FROM announcements a
     JOIN projects p ON p.id = a.project_id
     WHERE a.expires_at <= NOW() AND a.status = 'active'`,
  );

  for (let i = 0; i < expiring.rows.length; i += 1) {
    const row = expiring.rows[i];
    await db.query(
      "UPDATE announcements SET status = 'expired' WHERE id = $1",
      [row.id],
    );
    await createNotification(
      row.user_id,
      'expiring_soon',
      'Tu anuncio ha expirado',
    );
  }
}

module.exports = {
  runExpireAnnouncementsJob,
};
