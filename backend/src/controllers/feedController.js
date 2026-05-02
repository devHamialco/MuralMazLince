const jwt = require('jsonwebtoken');
const db = require('../db');
const { generateWaLink } = require('../services/whatsappLinkService');

function parseOptionalUser(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (_err) {
    return null;
  }
}

/**
 * GET /announcements — Feed paginado por cursor (COMP-03, ADR-03, RF-08, RF-09).
 * Parámetros de query: cursor, category, limit
 * PRINC-02: whatsapp_number NUNCA en la respuesta.
 */
const getFeed = async (req, res) => {
  const cursor = req.query.cursor ? Number(req.query.cursor) : null;
  const category = req.query.category || null;
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  try {
    let query = `
      SELECT a.id, a.title, a.description, a.cloudinary_url AS image_url, a.status, a.expires_at, a.created_at,
             a.category_id, a.custom_category,
             c.name AS category_name, c.code AS category_code,
             COALESCE(c.name, a.custom_category) AS category,
             p.name AS project_name, p.id AS project_id,
             ep.display_name,
             (SELECT CAST(COUNT(*) AS INTEGER) FROM likes WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS likes_count,
             (SELECT COALESCE(AVG(stars)::numeric(2,1), 0) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS avg_rating
      FROM announcements a
      JOIN projects p ON p.id = a.project_id
      JOIN users u ON u.id = p.user_id
      LEFT JOIN entrepreneur_profiles ep ON ep.user_id = u.id
      LEFT JOIN categories c ON c.id = a.category_id
      WHERE a.status = 'active'
    `;
    const params = [];
    let paramIdx = 1;

    if (cursor) {
      query += ` AND a.id < $${paramIdx}`;
      params.push(cursor);
      paramIdx += 1;
    }

    if (category) {
      query += ` AND c.code = $${paramIdx}`;
      params.push(category);
      paramIdx += 1;
    }

    query += ' ORDER BY a.id DESC';
    query += ` LIMIT $${paramIdx}`;
    params.push(limit);

    const result = await db.query(query, params);

    const nextCursor = result.rows.length > 0
      ? result.rows[result.rows.length - 1].id
      : null;

    return res.json({
      announcements: result.rows,
      nextCursor,
      hasMore: result.rows.length === limit,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener el feed' });
  }
};

/**
 * GET /announcements/:id — Detalle completo (RF-10, RF-11).
 * Si usuario autenticado: genera wa_link. Sino: wa_link = null.
 * whatsapp_number NUNCA en la respuesta (RN-09).
 */
const getAnnouncementDetail = async (req, res) => {
  try {
    const viewer = req.user || parseOptionalUser(req);
    const result = await db.query(
      `SELECT a.id, a.title, a.description, a.cloudinary_url AS image_url, a.status, a.expires_at, a.created_at,
              a.category_id, a.custom_category,
              c.name AS category_name, c.code AS category_code,
              COALESCE(c.name, a.custom_category) AS category,
              p.name AS project_name, p.id AS project_id,
              ep.display_name,
              u.whatsapp_number,
              (SELECT CAST(COUNT(*) AS INTEGER) FROM likes WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS likes_count,
              (SELECT COALESCE(AVG(stars)::numeric(2,1), 0) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS avg_rating
       FROM announcements a
       JOIN projects p ON p.id = a.project_id
       JOIN users u ON u.id = p.user_id
       LEFT JOIN entrepreneur_profiles ep ON ep.user_id = u.id
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.id = $1 AND a.status = 'active'`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

    const announcement = result.rows[0];

    // Generar wa_link solo si el usuario está autenticado (RF-11)
    let waLink = null;
    if (viewer && announcement.whatsapp_number) {
      waLink = generateWaLink(announcement.whatsapp_number);
    }

    // NUNCA enviar whatsapp_number en la respuesta (RN-09, PRINC-02)
    delete announcement.whatsapp_number;
    announcement.wa_link = waLink;

    return res.json({ announcement });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener detalle del anuncio' });
  }
};

module.exports = {
  getFeed,
  getAnnouncementDetail,
};
