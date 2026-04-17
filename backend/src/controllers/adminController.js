const QRCode = require('qrcode');
const db = require('../db');
const { createNotification } = require('../services/notificationService');
const { deleteFromCloudinary } = require('../services/storageService');

async function getModerationQueue(req, res) {
  try {
    const result = await db.query(
      `SELECT
         a.id,
         a.title,
         a.description,
         a.cloudinary_url,
         a.status,
         a.created_at,
         p.name AS project_name,
         u.id AS entrepreneur_id,
         ep.display_name,
         mq.trigger_type,
         mq.trigger_detail,
         mq.urgency_alert_at,
         ih.id AS matched_image_hash_id,
         ah.cloudinary_url AS matched_cloudinary_url
       FROM announcements a
       JOIN projects p ON p.id = a.project_id
       JOIN users u ON u.id = p.user_id
       LEFT JOIN entrepreneur_profiles ep ON ep.user_id = u.id
       JOIN moderation_queue mq ON mq.announcement_id = a.id AND mq.admin_action IS NULL
       LEFT JOIN LATERAL (
         SELECT CASE
           WHEN mq.trigger_type = 'phash'
             AND mq.trigger_detail LIKE 'match_image_hash_id:%'
           THEN split_part(mq.trigger_detail, ':', 2)::int
         END AS hash_id
       ) parsed ON true
       LEFT JOIN image_hashes ih ON ih.id = parsed.hash_id
       LEFT JOIN announcements ah ON ah.id = ih.announcement_id
       WHERE a.status IN ('pending_review', 'shadowban')
       ORDER BY
         CASE WHEN mq.urgency_alert_at IS NOT NULL THEN 0 ELSE 1 END ASC,
         a.created_at ASC`,
    );
    return res.json({ queue: result.rows });
  } catch (error) {
    return res.status(500).json({ error: 'Error al listar cola de moderación' });
  }
}

async function approveAnnouncement(req, res) {
  try {
    const { id } = req.params;
    const current = await db.query(
      'SELECT a.id, p.user_id FROM announcements a JOIN projects p ON p.id = a.project_id WHERE a.id = $1',
      [id],
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

    await db.query("UPDATE announcements SET status = 'active' WHERE id = $1", [id]);
    await db.query(
      `UPDATE moderation_queue
       SET admin_action = 'approved', admin_id = $1, resolved_at = NOW()
       WHERE announcement_id = $2 AND admin_action IS NULL`,
      [req.user.id, id],
    );
    await createNotification(current.rows[0].user_id, 'approved', 'Tu anuncio fue aprobado por moderación');
    return res.json({ message: 'Anuncio aprobado' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al aprobar anuncio' });
  }
}

async function rejectAnnouncement(req, res) {
  const { reason, suspend_user: shouldSuspendUser } = req.body; // eslint-disable-line camelcase
  try {
    const { id } = req.params;
    const current = await db.query(
      `SELECT a.id, a.cloudinary_id, p.user_id
       FROM announcements a
       JOIN projects p ON p.id = a.project_id
       WHERE a.id = $1`,
      [id],
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

    await deleteFromCloudinary(current.rows[0].cloudinary_id);
    await db.query("UPDATE announcements SET status = 'rejected' WHERE id = $1", [id]);
    await db.query(
      `UPDATE moderation_queue
       SET admin_action = $1, admin_id = $2, resolved_at = NOW()
       WHERE announcement_id = $3 AND admin_action IS NULL`,
      [shouldSuspendUser ? 'rejected_suspended' : 'rejected', req.user.id, id],
    );

    if (shouldSuspendUser) {
      await db.query('UPDATE users SET is_suspended = true WHERE id = $1', [current.rows[0].user_id]);
    }

    await createNotification(
      current.rows[0].user_id,
      'rejected',
      `Tu anuncio fue rechazado${reason ? `: ${reason}` : ''}`,
    );
    return res.json({ message: 'Anuncio rechazado' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al rechazar anuncio' });
  }
}

async function suspendUser(req, res) {
  try {
    await db.query('UPDATE users SET is_suspended = true WHERE id = $1', [req.params.id]);
    return res.json({ message: 'Usuario suspendido' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al suspender usuario' });
  }
}

async function getClaimTickets(req, res) {
  try {
    const result = await db.query(
      "SELECT * FROM claim_tickets WHERE status = 'pending' ORDER BY created_at ASC",
    );
    return res.json({ tickets: result.rows });
  } catch (error) {
    return res.status(500).json({ error: 'Error al listar tickets' });
  }
}

async function resolveClaimTicket(req, res) {
  try {
    const result = await db.query(
      `UPDATE claim_tickets
       SET status = 'resolved', admin_id = $1, resolved_at = NOW()
       WHERE id = $2 AND status = 'pending'
       RETURNING id`,
      [req.user.id, req.params.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado o ya resuelto' });
    }
    return res.json({ message: 'Ticket resuelto' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al resolver ticket' });
  }
}

async function getQr(req, res) {
  try {
    const targetUrl = process.env.PRODUCTION_URL || process.env.FRONTEND_URL || 'https://mural-maz-lince.app';
    const pngDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 512,
      margin: 1,
    });
    const base64 = pngDataUrl.split(',')[1];
    const pngBuffer = Buffer.from(base64, 'base64');
    res.setHeader('Content-Type', 'image/png');
    return res.status(200).send(pngBuffer);
  } catch (error) {
    return res.status(500).json({ error: 'Error al generar QR' });
  }
}

module.exports = {
  getModerationQueue,
  approveAnnouncement,
  rejectAnnouncement,
  suspendUser,
  getClaimTickets,
  resolveClaimTicket,
  getQr,
};
