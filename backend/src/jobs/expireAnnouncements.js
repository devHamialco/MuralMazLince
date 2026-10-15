const db = require('../db');
const { createNotification } = require('../services/notificationService');
const { deleteFromCloudinary } = require('../services/storageService');

async function runExpireAnnouncementsJob() {
  const expiring = await db.query(
    `SELECT a.id, a.cloudinary_id, p.user_id
     FROM announcements a
     JOIN projects p ON p.id = a.project_id
     WHERE a.expires_at <= NOW()
       AND a.status IN ('active', 'pending_review', 'shadowban', 'rejected')`,
  );

  await Promise.all(
    expiring.rows.map(async (row) => {
      await deleteFromCloudinary(row.cloudinary_id);
      await db.query('DELETE FROM announcements WHERE id = $1', [row.id]);
      await createNotification(
        row.user_id,
        'expiring_soon',
        'Tu anuncio ha expirado',
      );
    }),
  );
}

module.exports = {
  runExpireAnnouncementsJob,
};
