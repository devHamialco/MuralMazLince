const db = require('../db');
const { createNotification } = require('../services/notificationService');

const SHADOWBAN_MIN_REPORTS = Number(process.env.SHADOWBAN_MIN_REPORTS || 5);
const SHADOWBAN_WAIT_HOURS = Number(process.env.SHADOWBAN_WAIT_HOURS || 12);
const SHADOWBAN_RESTORE_HOURS = Number(process.env.SHADOWBAN_RESTORE_HOURS || 48);

/**
 * Ejecuta shadowban por inacción del administrador (RF-38).
 */
async function runShadowbanJob() {
  const pendingQueue = await db.query(
    `SELECT mq.id, mq.announcement_id
     FROM moderation_queue mq
     JOIN announcements a ON a.id = mq.announcement_id
     WHERE mq.urgency_alert_at IS NOT NULL
       AND mq.admin_action IS NULL
       AND mq.shadowban_at IS NULL
       AND a.status = 'active'
       AND NOW() - mq.urgency_alert_at >= ($1 * INTERVAL '1 hour')`,
    [SHADOWBAN_WAIT_HOURS],
  );

  await Promise.all(
    pendingQueue.rows.map(async (row) => {
      const reports = await db.query(
        `SELECT COUNT(DISTINCT reporter_id)::int AS reporter_count
         FROM reports
         WHERE announcement_id = $1`,
        [row.announcement_id],
      );
      const total = Number(reports.rows[0]?.reporter_count || 0);
      if (total < SHADOWBAN_MIN_REPORTS) return;

      await db.query(
        "UPDATE announcements SET status = 'shadowban' WHERE id = $1 AND status = 'active'",
        [row.announcement_id],
      );
      await db.query(
        'UPDATE moderation_queue SET shadowban_at = NOW() WHERE id = $1',
        [row.id],
      );

      const owner = await db.query(
        `SELECT p.user_id
         FROM announcements a
         JOIN projects p ON p.id = a.project_id
         WHERE a.id = $1`,
        [row.announcement_id],
      );
      if (owner.rows[0]?.user_id) {
        await createNotification(
          owner.rows[0].user_id,
          'shadowban',
          'Tu anuncio fue ocultado temporalmente por múltiples reportes y falta de revisión',
        );
      }
    }),
  );
}

/**
 * Restaura anuncios en shadowban tras 48h sin resolución administrativa.
 */
async function runShadowbanRestoreJob() {
  const toRestore = await db.query(
    `SELECT a.id, p.user_id
     FROM announcements a
     JOIN projects p ON p.id = a.project_id
     JOIN moderation_queue mq ON mq.announcement_id = a.id
     WHERE a.status = 'shadowban'
       AND mq.admin_action IS NULL
       AND mq.shadowban_at IS NOT NULL
       AND NOW() - mq.shadowban_at >= ($1 * INTERVAL '1 hour')`,
    [SHADOWBAN_RESTORE_HOURS],
  );

  await Promise.all(
    toRestore.rows.map(async (row) => {
      await db.query(
        "UPDATE announcements SET status = 'active' WHERE id = $1",
        [row.id],
      );
      await createNotification(
        row.user_id,
        'approved',
        'Tu anuncio fue restaurado automáticamente tras el período máximo de shadowban',
      );
    }),
  );
}

module.exports = {
  runShadowbanJob,
  runShadowbanRestoreJob,
};
