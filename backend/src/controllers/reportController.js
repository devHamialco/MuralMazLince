const db = require('../db');

const VALID_REASONS = ['offensive', 'spam', 'false_info', 'other'];
const REPORT_ALERT_THRESHOLD = Number(process.env.REPORT_ALERT_THRESHOLD || 3);

const createReport = async (req, res) => {
  const announcementId = req.params.id;
  const reporterId = req.user.id;
  const { reason } = req.body;

  if (!reason || !VALID_REASONS.includes(reason)) {
    return res.status(400).json({ error: 'Reason inválido' });
  }

  try {
    const announcementCheck = await db.query(
      "SELECT id FROM announcements WHERE id = $1 AND status = 'active'",
      [announcementId],
    );

    if (announcementCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado o no activo' });
    }

    await db.query(
      'INSERT INTO reports (reporter_id, announcement_id, reason) VALUES ($1, $2, $3)',
      [reporterId, announcementId, reason],
    );

    const totalReports = await db.query(
      'SELECT COUNT(DISTINCT reporter_id)::int AS reporter_count FROM reports WHERE announcement_id = $1',
      [announcementId],
    );

    const reporterCount = Number(totalReports.rows[0]?.reporter_count || 0);

    if (reporterCount >= REPORT_ALERT_THRESHOLD) {
      const queueCheck = await db.query(
        `SELECT id
         FROM moderation_queue
         WHERE announcement_id = $1 AND trigger_type = 'report_threshold'
         LIMIT 1`,
        [announcementId],
      );

      if (queueCheck.rows.length === 0) {
        await db.query(
          `INSERT INTO moderation_queue (announcement_id, trigger_type, trigger_detail, urgency_alert_at)
           VALUES ($1, 'report_threshold', $2, NOW())`,
          [announcementId, `Threshold reached: ${reporterCount} unique reports`],
        );
      }
    }

    return res.status(201).json({ message: 'Reporte registrado' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya reportaste este anuncio' });
    }
    return res.status(500).json({ error: 'Error al registrar reporte' });
  }
};

module.exports = {
  createReport,
};
