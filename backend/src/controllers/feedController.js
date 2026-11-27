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
  const limit = req.query.limit ? Math.min(Number(req.query.limit) || 20, 500) : 500;

  try {
    let query = `
      SELECT a.id, a.title, a.description, a.cloudinary_url AS image_url, a.status, a.expires_at, a.created_at,
             a.category_id, a.custom_category,
             c.name AS category_name, c.code AS category_code,
             COALESCE(c.name, a.custom_category) AS category,
             p.name AS project_name, p.id AS project_id, p.logo_url AS project_logo_url,
             ep.display_name,
             (SELECT CAST(COUNT(*) AS INTEGER) FROM likes WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS likes_count,
             (SELECT CAST(COALESCE(AVG(stars)::numeric(2,1), 0) AS DOUBLE PRECISION) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS avg_rating,
             (SELECT CAST(COALESCE(AVG(stars)::numeric(2,1), 0) AS DOUBLE PRECISION) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS average_rating
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
      query += ` AND (c.name = $${paramIdx} OR a.custom_category = $${paramIdx})`;
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

    res.set('Cache-Control', 'no-store');
    return res.json({
      announcements: result.rows,
      nextCursor,
      hasMore: result.rows.length === limit,
    });
  } catch (err) {
    console.error('Feed error:', err);
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
              p.name AS project_name, p.id AS project_id, p.logo_url AS project_logo_url, p.user_id AS entrepreneur_id,
              ep.display_name, ep.bio_short, ep.profile_photo_url, ep.instagram_handle, ep.classroom_location,
              u.whatsapp_number,
              (SELECT CAST(COUNT(*) AS INTEGER) FROM likes WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS likes_count,
              (SELECT CAST(COALESCE(AVG(stars)::numeric(2,1), 0) AS DOUBLE PRECISION) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS avg_rating,
              (SELECT CAST(COALESCE(AVG(stars)::numeric(2,1), 0) AS DOUBLE PRECISION) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS average_rating,
              (SELECT CAST(COUNT(*) AS INTEGER) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS ratings_count
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

    // Indicadores booleanos seguros de canales disponibles (sin exponer datos a visitantes)
    announcement.has_whatsapp = Boolean(announcement.whatsapp_number);
    announcement.has_instagram = Boolean(announcement.instagram_handle);

    // Generar wa_link y exponer canales de contacto solo si el usuario está autenticado (RF-11)
    let waLink = null;
    if (viewer && announcement.whatsapp_number) {
      waLink = generateWaLink(announcement.whatsapp_number);
    }

    if (!viewer) {
      announcement.instagram_handle = null;
      announcement.classroom_location = null;
    }

    // NUNCA enviar whatsapp_number en la respuesta (RN-09, PRINC-02)
    delete announcement.whatsapp_number;
    announcement.wa_link = waLink;

    let userLiked = false;
    let userRating = 0;
    let userReported = false;

    if (viewer && viewer.id) {
      const [likeRes, ratingRes, reportRes] = await Promise.all([
        db.query(
          'SELECT 1 FROM likes WHERE user_id = $1 AND announcement_id = $2 AND reverted_at IS NULL LIMIT 1',
          [viewer.id, announcement.id],
        ),
        db.query(
          'SELECT stars FROM ratings WHERE user_id = $1 AND announcement_id = $2 AND reverted_at IS NULL LIMIT 1',
          [viewer.id, announcement.id],
        ),
        db.query(
          'SELECT 1 FROM reports WHERE reporter_id = $1 AND announcement_id = $2 LIMIT 1',
          [viewer.id, announcement.id],
        ),
      ]);
      userLiked = likeRes.rows.length > 0;
      userRating = ratingRes.rows.length > 0 ? Number(ratingRes.rows[0].stars) : 0;
      userReported = reportRes.rows.length > 0;
    }

    res.set('Cache-Control', 'no-store');
    return res.json({
      announcement,
      user_liked: userLiked,
      user_rating: userRating,
      user_reported: userReported,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener detalle del anuncio' });
  }
};

module.exports = {
  getFeed,
  getAnnouncementDetail,
};
